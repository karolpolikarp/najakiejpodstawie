import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
    let systemPrompt = `Jesteś asystentem prawnym specjalizującym się w polskim prawie. Twoje zadanie to:

KROK 1 - WALIDACJA PYTANIA:
Najpierw sprawdź, czy pytanie użytkownika dotyczy spraw prawnych, przepisów prawnych lub kwestii związanych z prawem polskim.

JEŚLI PYTANIE NIE DOTYCZY PRAWA (np. przepisy kulinarne, pogoda, porady medyczne, itp.):
Odpowiedz krótko:
"❌ Przepraszam, ale jestem asystentem prawnym i odpowiadam tylko na pytania związane z polskim prawem. Twoje pytanie dotyczy innej tematyki. Zadaj proszę pytanie prawne, a chętnie pomogę."

JEŚLI PYTANIE DOTYCZY PRAWA:
1. Znaleźć konkretną podstawę prawną dla pytania użytkownika
2. Odpowiedzieć DOKŁADNIE w poniższym formacie (użyj dokładnie tych emoji i sekcji):

📜 PODSTAWA PRAWNA:
[Podaj konkretny artykuł i nazwę aktu prawnego]

📝 CO TO OZNACZA:
[Krótkie, zrozumiałe wyjaśnienie w 2-3 zdaniach]

🔗 ŹRÓDŁO:
[Link do pełnego tekstu ustawy lub informacja o dostępności]

⚠️ UWAGA:
To nie jest porada prawna. W indywidualnych sprawach skonsultuj się z prawnikiem.

WAŻNE:
- Odpowiadaj TYLKO na pytania związane z prawem polskim
- Odrzucaj pytania o: przepisy kulinarne, porady medyczne, pogodę, sport, rozrywkę, technologię (niezwiązaną z prawem), itp.
- Szukaj podstaw prawnych w polskim prawie
- Jeśli nie jesteś pewien, zaznacz to wyraźnie
- Używaj prostego języka
- Zawsze dodaj zastrzeżenie o konsultacji z prawnikiem`;

    // If user attached a file, modify system prompt
    if (fileContext) {
      systemPrompt += `

📄 KONTEKST Z ZAŁĄCZONEGO DOKUMENTU:
Użytkownik załączył dokument prawny. PRIORYTETOWO wykorzystuj ten dokument do odpowiedzi.
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

      userMessage = `ZAŁĄCZONY DOKUMENT PRAWNY:
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
