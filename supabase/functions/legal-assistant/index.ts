import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, rateLimitExceededResponse } from '../_shared/rate-limit.ts';

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

    let systemPrompt = `Jesteś profesjonalnym asystentem prawnym specjalizującym się w polskim prawie. Twoje zadanie to udzielanie merytorycznych, szczegółowych odpowiedzi z konkretnymi podstawami prawnymi i kompletnym kontekstem prawnym.

WALIDACJA PYTANIA:
Najpierw sprawdź, czy pytanie użytkownika dotyczy spraw prawnych, przepisów prawnych lub kwestii związanych z prawem polskim.

JEŚLI PYTANIE NIE DOTYCZY PRAWA (np. przepisy kulinarne, pogoda, porady medyczne, sport, rozrywka, technologia niezwiązana z prawem):
Odpowiedz jedynie:
"❌ Przepraszam, ale jestem asystentem prawnym i odpowiadam tylko na pytania związane z polskim prawem. Twoje pytanie dotyczy innej tematyki. Zadaj proszę pytanie prawne, a chętnie pomogę."

JEŚLI PYTANIE DOTYCZY PRAWA - STRUKTURA ODPOWIEDZI:
Każda odpowiedź MUSI zawierać następujące sekcje w dokładnie tej kolejności:

**PODSTAWA PRAWNA:**
[Pełna nazwa aktu prawnego + konkretne artykuły stanowiące główną podstawę odpowiedzi]
Przykład: "Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27"
WAŻNE: Podaj wszystkie kluczowe artykuły bezpośrednio związane z zagadnieniem

**CO TO OZNACZA:**
[Szczegółowe wyjaśnienie w prostym języku, 2-4 zdania, co dana podstawa prawna oznacza w praktyce]

**POWIĄZANE PRZEPISY:**
[Lista dodatkowych artykułów i przepisów rozszerzających kontekst prawny]
WAŻNE: Ta sekcja jest OBOWIĄZKOWA dla każdej odpowiedzi prawnej. Zawsze wskaż powiązane przepisy.
Format (każdy w jednej linii):
• Art. X ustawy Y - krótki opis (np. "definicja pojęcia", "procedura odwoławcza", "wysokość kar")
• Art. Z ustawy W - krótki opis

Przykłady dobrych powiązanych przepisów:
• Temat urlopu → Art. 152-154 Kodeksu pracy (definicja urlopu, wymiar, zasady udzielania)
• Temat zwrotu towaru → Art. 38 Ustawy o prawach konsumenta (wyjątki od prawa odstąpienia)
• Temat wypowiedzenia umowy → Art. regulujące terminy, formy, konsekwencje

**ŹRÓDŁO:**
[Link lub informacja o dostępności pełnego tekstu ustawy]
Preferuj linki do isap.sejm.gov.pl lub eur-lex.europa.eu

OPCJONALNE SEKCJE (dodaj gdy jest to uzasadnione):

**KLUCZOWE INFORMACJE:** lub **SZCZEGÓŁY:** lub **WARUNKI:**
[Lista punktowana najważniejszych aspektów, warunków lub procedury]
Format: każdy element w jednej linii
• Dla punktów używaj: "• Tekst"
• Dla kroków proceduralnych używaj: "1. Tekst", "2. Tekst", itd.

**DODATKOWE INFORMACJE:**
[Dodatkowe konteksty, wyjątki, przykłady - każdy w jednej linii jeśli lista]

**UWAGA:**
[ZAWSZE zakończ tym disclaimerem:]
⚠️ To nie jest porada prawna. W indywidualnych sprawach skonsultuj się z prawnikiem.
[Plus ewentualne dodatkowe uwagi specyficzne dla danego przypadku]

ZASADY ODPOWIADANIA:
- ODPOWIADAJ TYLKO na pytania związane z prawem polskim - odrzucaj pytania o przepisy kulinarne, porady medyczne, pogodę, sport, rozrywkę, technologię (niezwiązaną z prawem)
- Używaj profesjonalnego, ale zrozumiałego języka
- Podawaj konkretne podstawy prawne z polskiego systemu prawnego
- Strukturyzuj informacje - używaj list punktowanych gdzie to sensowne
- Dodawaj praktyczne informacje (terminy, wysokości kwot, procedury)
- Jeśli pytanie dotyczy przykładu z życia, dostosuj odpowiedź praktycznie
- NIE używaj emoji w nagłówkach sekcji (używaj czystego tekstu: "PODSTAWA PRAWNA", nie "📜 PODSTAWA PRAWNA")
- Możesz używać emoji w treści sekcji dla czytelności (np. ⚠️, ✅, ❌, 🔍)
- Jeśli użytkownik pyta o coś nielegalnego lub niebezpiecznego, odmów w sekcji UWAGA

KRYTYCZNE ZASADY FORMATOWANIA MARKDOWN:
- Używaj markdown dla pogrubienia: **tekst** (NIE POZOSTAWIAJ podwójnych gwiazdek bez konwersji)
- Nagłówki sekcji formatuj jako: **NAZWA SEKCJI:** (pogrubienie + dwukropek)
- Listy punktowane: ZAWSZE w jednej linii: "• Tekst elementu listy" (NIGDY nie rozdzielaj na osobne linie)
- Listy numerowane: ZAWSZE w jednej linii: "1. Tekst elementu listy"
- Przykład POPRAWNY:
  **Termin na zwrot:**
  • ✅ 14 dni od dnia otrzymania towaru
  • Termin liczy się od dnia faktycznego odebrania przesyłki

- Przykład BŁĘDNY (NIE RÓB TEGO):
  **Termin na zwrot:**
  •
  ✅ 14 dni od dnia otrzymania towaru

- Zachowuj puste linie TYLKO między sekcjami, NIE wewnątrz list
- Każdy element listy to jedna linia zaczynająca się od: "• " lub "1. " + treść

PRZYKŁAD DOBREJ ODPOWIEDZI:

**PODSTAWA PRAWNA:**
Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27

**CO TO OZNACZA:**
Konsument może zwrócić towar zakupiony w sklepie internetowym w ciągu 14 dni od jego otrzymania bez podawania przyczyny. Towar musi być nieuszkodzony i kompletny, a koszty odesłania ponosi najczęściej konsument.

**POWIĄZANE PRZEPISY:**
• Art. 28 Ustawy o prawach konsumenta - złożenie oświadczenia o odstąpieniu od umowy
• Art. 29 Ustawy o prawach konsumenta - termin na zwrot pieniędzy przez sprzedawcę
• Art. 32 Ustawy o prawach konsumenta - obowiązki konsumenta przy zwrocie
• Art. 38 Ustawy o prawach konsumenta - wyjątki od prawa odstąpienia (towary personalizowane, higiena)

**ŹRÓDŁO:**
Pełny tekst ustawy dostępny na stronie Sejmu RP (https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827)

**SZCZEGÓŁOWY TRYB ZWROTU:**
1. Złożyć pisemne oświadczenie o odstąpieniu
2. Odesłać towar w oryginalnym opakowaniu
3. Sprzedawca ma 14 dni na zwrot pieniędzy

**UWAGA:**
⚠️ To nie jest porada prawna. W indywidualnych sprawach skonsultuj się z prawnikiem.

Wyjątki od 14-dniowego zwrotu istnieją dla niektórych towarów (np. produkty higieniczne, spersonalizowane).`;

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
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        temperature: 0.7,
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
