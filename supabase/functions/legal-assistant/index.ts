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
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Jesteś asystentem prawnym specjalizującym się w polskim prawie. Twoje zadanie to:

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
- Szukaj podstaw prawnych w polskim prawie
- Jeśli nie jesteś pewien, zaznacz to wyraźnie
- Używaj prostego języka
- Zawsze dodaj zastrzeżenie o konsultacji z prawnikiem`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Osiągnięto limit zapytań. Spróbuj ponownie za chwilę.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Brak środków. Skontaktuj się z administratorem.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

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
