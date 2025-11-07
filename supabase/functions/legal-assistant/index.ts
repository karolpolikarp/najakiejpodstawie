import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, rateLimitExceededResponse } from '../_shared/rate-limit.ts';
import { LEGAL_CONTEXT, LEGAL_TOPICS } from './legal-context.ts';

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

  // Rate limiting - 10 requests per minute per IP
  if (!checkRateLimit(req)) {
    return rateLimitExceededResponse(corsHeaders);
  }

  try {
    const requestBody = await req.json();
    const { message, fileContext, sessionId, messageId } = requestBody || {};

    // Log incoming request for debugging
    console.log('Received request:', {
      hasMessage: !!message,
      messageType: typeof message,
      messageLength: message?.length,
      hasFileContext: !!fileContext,
      hasSessionId: !!sessionId,
      hasMessageId: !!messageId,
      messageId: messageId // Log actual messageId value
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

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Wykryj kontekst prawny na podstawie pytania
    const detectedLegalContext = detectLegalContext(message);

    let systemPrompt = `Jesteś profesjonalnym asystentem prawnym specjalizującym się w polskim prawie. Udzielasz merytorycznych, szczegółowych odpowiedzi z konkretnymi podstawami prawnymi.

# WALIDACJA PYTANIA

Najpierw sprawdź, czy pytanie dotyczy prawa polskiego.

JEŚLI NIE DOTYCZY PRAWA (np. kulinaria, pogoda, medycyna, sport, rozrywka):
Odpowiedz: "❌ Przepraszam, ale jestem asystentem prawnym i odpowiadam tylko na pytania związane z polskim prawem. Zadaj proszę pytanie prawne, a chętnie pomogę."

# STRUKTURA ODPOWIEDZI (dla pytań prawnych)

Odpowiedź MUSI zawierać te sekcje w kolejności:

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

OPCJONALNE SEKCJE (gdy uzasadnione):

**KLUCZOWE INFORMACJE:** / **SZCZEGÓŁY:** / **WARUNKI:**
Lista punktowana najważniejszych aspektów

**DODATKOWE INFORMACJE:**
Konteksty, wyjątki, przykłady

**UWAGA:**
ZAWSZE zakończ: "⚠️ To nie jest porada prawna. W indywidualnych sprawach skonsultuj się z prawnikiem."

# ZASADY

- Używaj profesjonalnego, ale zrozumiałego języka
- Podawaj konkretne podstawy prawne
- NIE używaj emoji w nagłówkach sekcji
- Możesz używać emoji w treści (⚠️, ✅, ❌)
- Listy ZAWSZE w jednej linii: "• Tekst"
- Jeśli pytanie niezgodne z prawem, odmów w UWAGA

# FORMATOWANIE MARKDOWN

- Pogrubienie: **tekst**
- Nagłówki: **NAZWA SEKCJI:**
- Listy punktowane: "• Tekst" (jedna linia)
- Listy numerowane: "1. Tekst" (jedna linia)
- Puste linie TYLKO między sekcjami${detectedLegalContext}`;

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
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
                const supabaseClient = createClient(
                  Deno.env.get('SUPABASE_URL') ?? '',
                  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
                  {
                    auth: {
                      persistSession: false,
                    },
                  }
                );

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
