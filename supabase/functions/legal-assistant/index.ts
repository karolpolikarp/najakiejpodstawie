import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit } from './rate-limiter.ts';
import { LEGAL_CONTEXT, LEGAL_TOPICS } from './legal-context.ts';
import { enrichWithArticles } from './eli-tools.ts';

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

/**
 * Wykrywa temat prawny na podstawie pytania użytkownika i zwraca odpowiedni kontekst
 */
function detectLegalContext(message: string): string {
  const lowerMessage = message.toLowerCase();
  let detectedContexts: string[] = [];

  // Słowa kluczowe dla różnych tematów prawnych
  const topicKeywords: Record<string, string[]> = {
    'urlop': ['urlop', 'wakacje', 'dni wolne'],
    'wynagrodzenie': ['wynagrodzenie', 'wynagrodzeni', 'pensj', 'wypłat', 'płac', 'zarobki', 'zarobk', 'minimalna'],
    'wypowiedzenie_umowy_pracy': ['wypowiedzeni', 'zwolnieni', 'rozwiązani'],
    'zwrot_towaru_online': ['zwrot', 'zwróc', 'odstąpieni', 'sklep internetowy', 'online', '14 dni'],
    'reklamacja_towaru': ['reklamacj', 'wad', 'gwarancj', 'rękojmi', 'naprawa', 'wymian'],
    'wypowiedzenie_najmu': ['najem', 'najmu', 'wynajem', 'lokator', 'wynajmując'],
    'alimenty': ['aliment'],
    'zniewaga': ['zniewag', 'obelg', 'zniesławi', 'pomówien', 'obraz'],
    'rodo': ['dan', 'rodo', 'gdpr', 'prywatno', 'przetwarzani'],
    'spadek': ['spadk', 'dziedziczen', 'testament', 'spadkobierc', 'zachowek'],
    'umowa_zlecenie': ['zleceni', 'dzieł'],
    'prawa_autorskie': ['prawa autorskie', 'copyright', 'plagiat', 'utwór', 'autor'],
    'kupno_sprzedaz': ['kupn', 'kupuj', 'sprzeda', 'akt notarialny'],
    'mobbing': ['mobbing', 'molestowani', 'nękan', 'dyskryminacj'],
    'postepowanie_sadowe': ['pozew', 'sąd', 'sądow', 'apelacj', 'wyrok', 'proces']
  };

  // Wykryj wszystkie pasujące tematy
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedContexts.push(topic);
    }
  }

  // Jeśli wykryto tematy, zwróć sformatowany kontekst
  if (detectedContexts.length > 0) {
    let contextText = '\n\n📚 RELEWANTNA BAZA WIEDZY PRAWNEJ:\n';

    for (const topic of detectedContexts) {
      const context = LEGAL_CONTEXT[topic as keyof typeof LEGAL_CONTEXT];
      if (context) {
        contextText += `\n**${context.name}:**\n`;
        contextText += `Główne akty prawne: ${context.mainActs.join(', ')}\n`;
        contextText += `Kluczowe artykuły:\n${context.mainArticles.map(a => `- ${a}`).join('\n')}\n`;
        contextText += `Powiązane przepisy:\n${context.relatedArticles.map(a => `- ${a}`).join('\n')}\n`;
        contextText += `Źródło: ${context.source}\n`;
      }
    }

    return contextText;
  }

  return '';
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

    // Wykryj kontekst prawny na podstawie pytania
    const detectedLegalContext = detectLegalContext(message);

    // Pobierz treści artykułów z ELI MCP jeśli pytanie dotyczy konkretnych artykułów
    console.log('[ELI] Checking for article references in message...');
    const articleContext = await enrichWithArticles(message);
    if (articleContext) {
      console.log('[ELI] Successfully enriched with article context');
    }

    let systemPrompt = `Jesteś profesjonalnym asystentem prawnym specjalizującym się w polskim prawie. Udzielasz merytorycznych, szczegółowych odpowiedzi z konkretnymi podstawami prawnymi.

# WAŻNE: ZAKAZ UDZIELANIA PORAD PRAWNYCH

KRYTYCZNE ZASADY:
❌ NIE MOŻESZ interpretować konkretnej sytuacji użytkownika
❌ NIE MOŻESZ doradzać "w Twoim przypadku powinieneś..."
❌ NIE MOŻESZ oceniać czy użytkownik ma rację w konkretnej sprawie
❌ NIE MOŻESZ sugerować konkretnych działań prawnych

✅ MOŻESZ podawać podstawy prawne (artykuły, ustawy)
✅ MOŻESZ wyjaśniać przepisy w sposób ogólny
✅ MOŻESZ pokazywać jak przepisy działają w ogólnym kontekście

Przykład NIEPOPRAWNY: "W Twojej sytuacji masz prawo do odszkodowania. Powinieneś pozwać pracodawcę."
Przykład POPRAWNY: "Art. 471 Kodeksu cywilnego stanowi o odpowiedzialności za szkodę. W sprawach pracowniczych może mieć zastosowanie..."

# WALIDACJA PYTANIA

Najpierw sprawdź, czy pytanie dotyczy prawa polskiego.

JEŚLI NIE DOTYCZY PRAWA (np. kulinaria, pogoda, medycyna, sport, rozrywka):
Odpowiedz: "❌ Przepraszam, ale jestem asystentem prawnym i odpowiadam tylko na pytania związane z polskim prawem. Zadaj proszę pytanie prawne, a chętnie pomogę."

# STRUKTURA ODPOWIEDZI (dla pytań prawnych)

KRYTYCZNE: Każda sekcja MUSI być oddzielona dwoma pustymi liniami dla lepszej czytelności!

## SEKCJE OBOWIĄZKOWE (w tej kolejności):

**PODSTAWA PRAWNA:**
Pełna nazwa aktu prawnego + konkretne artykuły
Przykład: "Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27"


**CO TO OZNACZA:**
Wyjaśnienie w prostym języku (2-4 zdania), co przepis oznacza w praktyce


**POWIĄZANE PRZEPISY:**
OBOWIĄZKOWA lista dodatkowych artykułów rozszerzających kontekst
Format: • Art. X ustawy Y - krótki opis


**ŹRÓDŁO:**
Link do pełnego tekstu (preferuj isap.sejm.gov.pl lub eur-lex.europa.eu)


## SEKCJE OPCJONALNE (gdy uzasadnione):

**SZCZEGÓŁOWY TRYB:** / **KLUCZOWE INFORMACJE:** / **WARUNKI:**
Lista punktowanych najważniejszych aspektów lub procedury krok po kroku


**DODATKOWE INFORMACJE:**
Konteksty, wyjątki, przykłady praktyczne


## SEKCJA KOŃCOWA (ZAWSZE NA KOŃCU):

**UWAGA:**
⚠️ Powyższe informacje to wyjaśnienie przepisów prawnych, NIE porada prawna w konkretnej sprawie. W indywidualnych sytuacjach skonsultuj się z prawnikiem.

# ZASADY FORMATOWANIA

KRYTYCZNE ZASADY:
1. Każda główna sekcja (**PODSTAWA PRAWNA:**, **CO TO OZNACZA:**, etc.) MUSI być oddzielona DWOMA pustymi liniami od poprzedniej
2. Sekcja **UWAGA:** MUSI być na samym końcu
3. NIE używaj emoji w nagłówkach sekcji (tylko w treści)
4. Listy punktowane: ZAWSZE "• Tekst" w jednej linii
5. Listy numerowane: "1. Tekst" w jednej linii

PRZYKŁAD POPRAWNEGO FORMATOWANIA:

**PODSTAWA PRAWNA:**
Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27


**CO TO OZNACZA:**
Konsument może zwrócić towar zakupiony w sklepie internetowym w ciągu 14 dni od jego otrzymania bez podawania przyczyny.


**POWIĄZANE PRZEPISY:**
• Art. 28 Ustawy o prawach konsumenta - złożenie oświadczenia o odstąpieniu
• Art. 29 Ustawy o prawach konsumenta - termin na zwrot pieniędzy


**ŹRÓDŁO:**
https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827


**UWAGA:**
⚠️ To nie jest porada prawna. W indywidualnych sprawach skonsultuj się z prawnikiem.${detectedLegalContext}${articleContext}`;

    if (fileContext && typeof fileContext === 'string' && fileContext.length > 0) {
      systemPrompt += `

📄 KONTEKST Z ZAŁĄCZONEGO DOKUMENTU:
Użytkownik załączył dokument. PRIORYTETOWO wykorzystuj ten dokument do odpowiedzi.
Jeśli odpowiedź znajduje się w załączonym dokumencie, cytuj konkretne fragmenty.
Jeśli pytanie wykracza poza załączony dokument, powiedz o tym wyraźnie i użyj swojej wiedzy.`;
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
