import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit } from './rate-limiter.ts';
import { LEGAL_CONTEXT, LEGAL_TOPICS, type ArticleReference, type LegalTopic } from './legal-context.ts';
import { enrichWithArticles, type EnrichmentResult } from './eli-tools.ts';

// CORS configuration - restrict to specific domains for security
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
    'https://jakieprawo.pl',
    'https://www.jakieprawo.pl',
    'https://www.jakieprawo.pl/czat',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
    'https://najakiejpodstawie.pl',
    'https://najakiejpodstawie.vercel.app',
  ];
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return allowedOrigins[0];
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true'
});

interface LegalContextResult {
  contextText: string;
  mcpArticles: ArticleReference[];
}

/**
 * Wykrywa temat prawny na podstawie pytania użytkownika
 * Zwraca kontekst tekstowy + artykuły do automatycznego pobrania z MCP
 */
function detectLegalContext(message: string): LegalContextResult {
  const lowerMessage = message.toLowerCase();
  const detectedTopics: LegalTopic[] = [];
  const allMcpArticles: ArticleReference[] = [];

  // Wykryj wszystkie pasujące tematy na podstawie keywords
  for (const [topicKey, topicData] of Object.entries(LEGAL_CONTEXT)) {
    const keywords = topicData.keywords || [];

    // Sprawdź czy którekolwiek słowo kluczowe pasuje
    const matches = keywords.some(keyword =>
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (matches) {
      console.log(`[CONTEXT] Detected topic: ${topicData.name} (${topicKey})`);
      detectedTopics.push(topicData);

      // Dodaj artykuły tego tematu do listy do pobrania z MCP
      allMcpArticles.push(...topicData.mcpArticles);
    }
  }

  // Jeśli wykryto tematy, zwróć sformatowany kontekst
  if (detectedTopics.length > 0) {
    let contextText = '\n\n📚 RELEWANTNA BAZA WIEDZY PRAWNEJ:\n';

    for (const topic of detectedTopics) {
      contextText += `\n**${topic.name}:**\n`;
      contextText += `Główne akty prawne: ${topic.mainActs.join(', ')}\n`;
      contextText += `Kluczowe artykuły:\n${topic.mainArticles.map(a => `- ${a}`).join('\n')}\n`;
      contextText += `Powiązane przepisy:\n${topic.relatedArticles.map(a => `- ${a}`).join('\n')}\n`;
      contextText += `Źródło: ${topic.source}\n`;
    }

    console.log(`[CONTEXT] Total MCP articles to fetch from topics: ${allMcpArticles.length}`);

    return {
      contextText,
      mcpArticles: allMcpArticles
    };
  }

  return {
    contextText: '',
    mcpArticles: []
  };
}

serve(async (req) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { message, fileContext, sessionId, messageId, usePremiumModel } = requestBody || {};

    // Log incoming request for debugging
    console.log('Received request:', {
      hasMessage: !!message,
      messageLength: message?.length,
      hasFileContext: !!fileContext,
      hasSessionId: !!sessionId,
      hasMessageId: !!messageId,
      usePremiumModel: !!usePremiumModel,
    });

    // Validate required fields
    if (typeof message !== 'string') {
      return new Response(JSON.stringify({
        error: 'Pole "message" musi być tekstem'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (message.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'Wiadomość nie może być pusta'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client for rate limiting and database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Check rate limit - use sessionId if available, otherwise fallback to IP
    const identifier = sessionId || req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const rateLimitResult = await checkRateLimit(supabaseClient, identifier, 'legal-assistant');

    if (!rateLimitResult.allowed) {
      console.log('Rate limit exceeded for identifier:', identifier);
      return new Response(JSON.stringify({
        error: 'Przekroczono limit zapytań. Możesz wysłać maksymalnie 10 pytań na minutę.',
        retryAfter: rateLimitResult.retryAfter,
        resetAt: rateLimitResult.resetAt?.toISOString(),
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitResult.retryAfter || 60),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt?.toISOString() || '',
        }
      });
    }

    console.log('Rate limit check passed. Remaining requests:', rateLimitResult.remaining);

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Wybierz model: Haiku (domyślny, tani) vs Sonnet (premium, droższy)
    const selectedModel = usePremiumModel
      ? 'claude-sonnet-4-20250514'  // Premium: Sonnet 4.5
      : 'claude-haiku-4-5-20251001'; // Domyślny: Haiku 4.5

    console.log(`🤖 Using model: ${selectedModel} (premium: ${!!usePremiumModel})`);

    // Wykryj kontekst prawny na podstawie pytania (wykrywa tematy i zwraca artykuły do pobrania)
    const legalContextResult = detectLegalContext(message);
    console.log(`[CONTEXT] Detected ${legalContextResult.mcpArticles.length} articles from legal topics`);

    // Pobierz treści artykułów z ELI MCP:
    // 1. Artykuły z pytania użytkownika (regex: "art 10 kp")
    // 2. Artykuły z wykrytych tematów (np. "obrona konieczna" → Art. 25 kk)
    // QW4: Pass usePremiumModel for dynamic article limits
    console.log('[ELI] Fetching articles from both user query and detected topics...');
    const enrichmentResult = await enrichWithArticles(message, legalContextResult.mcpArticles, usePremiumModel);
    console.log(`[ELI] Enrichment result: ${enrichmentResult.successCount} successful, ${enrichmentResult.failureCount} failed`);

    const articleContext = enrichmentResult.context;

    // QW6: Compressed system prompt (reduced from ~8000 to ~2000 chars)
    let systemPrompt = `Jesteś asystentem prawnym (polskie prawo). Podajesz podstawy prawne i wyjaśniasz przepisy ogólnie.

❌ NIE doradzaj konkretnych działań ("w Twoim przypadku powinieneś...")
✅ Wyjaśniaj przepisy w ogólnym kontekście

Jeśli pytanie NIE o prawo → "Odpowiadam tylko na pytania prawne."

# STRUKTURA (OBOWIĄZKOWA)

**PODSTAWA PRAWNA:**
Pełna nazwa aktu + artykuł

**TREŚĆ PRZEPISU:**
KRYTYCZNE: Cytuj DOKŁADNIE z sekcji 📜 (jeśli jest)
❌ NIE parafrazuj, NIE skracaj, NIE cytuj z pamięci
✅ Cytuj całość (wszystkie §§)
Jeśli brak 📜 - pomiń i przejdź do CO TO OZNACZA.

**CO TO OZNACZA:**
Wyjaśnienie (2-4 zdania)

**POWIĄZANE PRZEPISY:**
• Art. X - opis

**ŹRÓDŁO:**
Link (isap.sejm.gov.pl)

**UWAGA:**
⚠️ To nie porada prawna. Skonsultuj z prawnikiem.

# FORMATOWANIE
- Dwie puste linie między sekcjami
- Bez emoji w nagłówkach
- **UWAGA:** zawsze na końcu${legalContextResult.contextText}${articleContext}`;

    if (fileContext && typeof fileContext === 'string' && fileContext.length > 0) {
      systemPrompt += `

📄 KONTEKST Z ZAŁĄCZONEGO DOKUMENTU:
Użytkownik załączył dokument. PRIORYTETOWO wykorzystuj ten dokument do odpowiedzi.
Jeśli odpowiedź znajduje się w załączonym dokumencie, cytuj konkretne fragmenty.
Jeśli pytanie wykracza poza załączony dokument, powiedz o tym wyraźnie i użyj swojej wiedzy.`;
    }

    // Dodaj ostrzeżenia MCP jeśli wystąpiły problemy
    if (enrichmentResult.warnings.length > 0) {
      systemPrompt += `

⚠️ WAŻNE OSTRZEŻENIE - UMIEŚĆ NA POCZĄTKU ODPOWIEDZI:

Na początku swojej odpowiedzi (przed sekcją PODSTAWA PRAWNA) MUSISZ umieścić następujące ostrzeżenie:

---
⚠️ **OSTRZEŻENIE O ŹRÓDŁACH**

${enrichmentResult.warnings.join('\n')}

${enrichmentResult.failureCount > 0 ? 'Nie udało się pobrać aktualnych treści artykułów z oficjalnych źródeł. Poniższa odpowiedź opiera się na wiedzy AI i może być nieaktualna lub niepełna. Dla pewności sprawdź treść na oficjalnych stronach: https://isap.sejm.gov.pl\n' : ''}
---

Po tym ostrzeżeniu przejdź do normalnej odpowiedzi ze standardowymi sekcjami.`;
    }

    let userMessage = message;
    if (fileContext && typeof fileContext === 'string' && fileContext.length > 0) {
      const limitedContext = fileContext.length > 30000
        ? fileContext.substring(0, 30000) + "\n\n[...dokument został skrócony...]"
        : fileContext;

      userMessage = `ZAŁĄCZONY DOKUMENT:
---
${limitedContext}
---

PYTANIE UŻYTKOWNIKA:
${message}`;
    }

    // Prosty streaming przez fetch (bez Anthropic SDK, bez tool calling)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        temperature: 0.3,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: 'Osiągnięto limit zapytań. Spróbuj ponownie za chwilę.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (response.status === 401) {
        return new Response(JSON.stringify({
          error: 'Nieprawidłowy klucz API. Sprawdź konfigurację.'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Track full response for database storage
    let fullResponse = '';
    const startTime = Date.now();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();

              // Save question and answer to database
              try {
                const responseTime = Date.now() - startTime;
                const userAgent = req.headers.get('user-agent') || 'unknown';

                await supabaseClient
                  .from('user_questions')
                  .insert({
                    message_id: messageId || null,
                    question: message,
                    answer: fullResponse,
                    has_file_context: !!fileContext,
                    file_name: fileContext ? 'document.pdf/docx' : null,
                    session_id: sessionId || null,
                    user_agent: userAgent,
                    response_time_ms: responseTime,
                  });

                console.log('Question and answer saved to database with message_id:', messageId);
              } catch (dbError) {
                // Don't fail the request if DB save fails
                console.error('Failed to save to database:', dbError);
              }

              break;
            }

            const chunk = decoder.decode(value, { stream: true });

            // Extract text content from SSE events for database storage
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                      fullResponse += parsed.delta.text;
                    }
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              }
            }

            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Error streaming response:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in legal-assistant function:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(JSON.stringify({
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
