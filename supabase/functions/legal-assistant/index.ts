import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Legal Context Knowledge Base
 *
 * For easy updates when laws change, see legal-context.ts file which contains
 * commonly referenced Polish legal provisions organized by topic.
 *
 * The AI uses Claude's built-in legal knowledge supplemented by the system prompt.
 * When laws change, update legal-context.ts for reference and update this prompt
 * with new examples if needed.
 */

// CORS configuration - restrict to specific domains for security
// In production, set ALLOWED_ORIGINS environment variable (comma-separated)
// Example: "https://najakiejpodstawie.pl,https://www.najakiejpodstawie.pl"
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
  ];

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Default to first allowed origin if request origin not in whitelist
  return allowedOrigins[0];
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
});

serve(async (req) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, fileContext } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Base system prompt
    let systemPrompt = `Jesteś profesjonalnym asystentem prawnym specjalizującym się w polskim prawie. Twoje zadanie to udzielanie merytorycznych, szczegółowych odpowiedzi z konkretnymi podstawami prawnymi i kompletnym kontekstem prawnym.

WALIDACJA PYTANIA:
Najpierw sprawdź, czy pytanie użytkownika dotyczy spraw prawnych, przepisów prawnych lub kwestii związanych z prawem polskim.

JEŚLI PYTANIE NIE DOTYCZY PRAWA (np. przepisy kulinarne, pogoda, porady medyczne, sport, rozrywka, technologia niezwiązana z prawem):
Odpowiedz jedynie:
"❌ Przepraszam, ale jestem asystentem prawnym i odpowiadam tylko na pytania związane z polskim prawem. Twoje pytanie dotyczy innej tematyki. Zadaj proszę pytanie prawne, a chętnie pomogę."

JEŚLI PYTANIE DOTYCZY PRAWA - STRUKTURA ODPOWIEDZI:
Każda odpowiedź MUSI zawierać następujące sekcje w dokładnie tej kolejności:

PODSTAWA PRAWNA
[Pełna nazwa aktu prawnego + konkretne artykuły stanowiące główną podstawę odpowiedzi]
Przykład: "Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27"
WAŻNE: Podaj wszystkie kluczowe artykuły bezpośrednio związane z zagadnieniem

CO TO OZNACZA
[Szczegółowe wyjaśnienie w prostym języku, 2-4 zdania, co dana podstawa prawna oznacza w praktyce]

POWIĄZANE PRZEPISY
[Lista dodatkowych artykułów i przepisów rozszerzających kontekst prawny]
WAŻNE: Ta sekcja jest OBOWIĄZKOWA dla każdej odpowiedzi prawnej. Zawsze wskaż powiązane przepisy.
Format:
- Art. X ustawy Y - krótki opis (np. "definicja pojęcia", "procedura odwoławcza", "wysokość kar")
- Art. Z ustawy W - krótki opis

Przykłady dobrych powiązanych przepisów:
• Temat urlopu → Art. 152-154 Kodeksu pracy (definicja urlopu, wymiar, zasady udzielania)
• Temat zwrotu towaru → Art. 38 Ustawy o prawach konsumenta (wyjątki od prawa odstąpienia)
• Temat wypowiedzenia umowy → Art. regulujące terminy, formy, konsekwencje

ŹRÓDŁO
[Link lub informacja o dostępności pełnego tekstu ustawy]
Preferuj linki do isap.sejm.gov.pl lub eur-lex.europa.eu

OPCJONALNE SEKCJE (dodaj gdy jest to uzasadnione):

KLUCZOWE INFORMACJE:
lub SZCZEGÓŁY:
lub WARUNKI:
[Lista punktowana najważniejszych aspektów, warunków lub procedury]
Używaj: - dla punktów, numeracji 1. 2. 3. dla kroków proceduralnych

DODATKOWE INFORMACJE:
[Dodatkowe konteksty, wyjątki, przykłady]

UWAGA
[ZAWSZE zakończ tym disclaimerem:]
To nie jest porada prawna. W indywidualnych sprawach skonsultuj się z prawnikiem.
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

PRZYKŁAD DOBREJ ODPOWIEDZI:

PODSTAWA PRAWNA
Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27

CO TO OZNACZA
Konsument może zwrócić towar zakupiony w sklepie internetowym w ciągu 14 dni od jego otrzymania bez podawania przyczyny. Towar musi być nieuszkodzony i kompletny, a koszty odesłania ponosi najczęściej konsument.

POWIĄZANE PRZEPISY
- Art. 28 Ustawy o prawach konsumenta - złożenie oświadczenia o odstąpieniu od umowy
- Art. 29 Ustawy o prawach konsumenta - termin na zwrot pieniędzy przez sprzedawcę
- Art. 32 Ustawy o prawach konsumenta - obowiązki konsumenta przy zwrocie
- Art. 38 Ustawy o prawach konsumenta - wyjątki od prawa odstąpienia (towary personalizowane, higiena)

ŹRÓDŁO
Pełny tekst ustawy dostępny na stronie Sejmu RP (https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827)

SZCZEGÓŁOWY TRYB ZWROTU:
1. Złożyć pisemne oświadczenie o odstąpieniu
2. Odesłać towar w oryginalnym opakowaniu
3. Sprzedawca ma 14 dni na zwrot pieniędzy

UWAGA
To nie jest porada prawna. W indywidualnych sprawach skonsultuj się z prawnikiem.

Wyjątki od 14-dniowego zwrotu istnieją dla niektórych towarów (np. produkty higieniczne, spersonalizowane).`;

    // If user attached a file, modify system prompt
    if (fileContext) {
      systemPrompt += `

📄 KONTEKST Z ZAŁĄCZONEGO DOKUMENTU:
Użytkownik załączył dokument. PRIORYTETOWO wykorzystuj ten dokument do odpowiedzi.
Jeśli odpowiedź znajduje się w załączonym dokumencie, cytuj konkretne fragmenty.
Jeśli pytanie wykracza poza załączony dokument, powiedz o tym wyraźnie i użyj swojej wiedzy.`;
    }

    // Build user message
    let userMessage = message;

    // If file context exists, prepend it to the message
    if (fileContext) {
      // Limit file context to avoid token limits (keep first 30k chars)
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Osiągnięto limit zapytań. Spróbuj ponownie za chwilę.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Nieprawidłowy klucz API. Sprawdź konfigurację.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in legal-assistant function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
