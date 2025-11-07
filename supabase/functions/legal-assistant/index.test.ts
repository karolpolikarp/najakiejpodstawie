import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { LEGAL_CONTEXT } from './legal-context.ts';

/**
 * Wykrywa temat prawny na podstawie pytania użytkownika i zwraca odpowiedni kontekst
 * (Kopiowane z index.ts dla celów testowych)
 */
function detectLegalContext(message: string): string {
  const lowerMessage = message.toLowerCase();
  let detectedContexts: string[] = [];

  // Słowa kluczowe dla różnych tematów prawnych
  const topicKeywords: Record<string, string[]> = {
    'urlop': ['urlop', 'wakacje', 'urlop wypoczynkowy', 'urlop na żądanie', 'dni wolne', 'wyjazd'],
    'wynagrodzenie': ['wynagrodzenie', 'pensja', 'wypłata', 'płaca', 'zarobki', 'minimalna krajowa', 'wynagrodzenie minimalne'],
    'wypowiedzenie_umowy_pracy': ['wypowiedzenie umowy', 'zwolnienie z pracy', 'rozwiązanie umowy o pracę', 'okres wypowiedzenia'],
    'zwrot_towaru_online': ['zwrot towaru', 'odstąpienie od umowy', 'sklep internetowy', 'zakupy online', '14 dni', 'zwrot pieniędzy'],
    'reklamacja_towaru': ['reklamacja', 'wada towaru', 'gwarancja', 'rękojmia', 'naprawa', 'wymiana towaru', 'uszkodzony towar'],
    'wypowiedzenie_najmu': ['najem', 'wynajem', 'mieszkanie', 'lokator', 'wynajmujący', 'umowa najmu'],
    'alimenty': ['alimenty', 'alimentacyjny', 'utrzymanie dziecka', 'fundusz alimentacyjny', 'obowiązek alimentacyjny'],
    'zniewaga': ['zniewaga', 'obelga', 'zniesławienie', 'pomówienie', 'obraza'],
    'rodo': ['dane osobowe', 'rodo', 'gdpr', 'prywatność', 'przetwarzanie danych', 'administrator danych', 'ochrona danych'],
    'spadek': ['spadek', 'dziedziczenie', 'testament', 'spadkobierca', 'zachowek', 'nabycie spadku', 'dział spadku'],
    'umowa_zlecenie': ['umowa zlecenia', 'umowa o dzieło', 'zlecenie', 'dzieło', 'zleceniobiorca', 'zleceniodawca'],
    'prawa_autorskie': ['prawa autorskie', 'copyright', 'plagiat', 'utwór', 'autor', 'naruszenie praw autorskich'],
    'kupno_sprzedaz': ['kupno', 'sprzedaż', 'umowa kupna', 'sprzedaż nieruchomości', 'kupno mieszkania', 'akt notarialny'],
    'mobbing': ['mobbing', 'molestowanie', 'nękanie w pracy', 'dyskryminacja w pracy', 'przemoc psychiczna'],
    'postepowanie_sadowe': ['pozew', 'sąd', 'proces sądowy', 'apelacja', 'wyrok', 'postępowanie cywilne', 'sprawa sądowa']
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

// TESTY
Deno.test("detectLegalContext - wykrywa temat urlopu", () => {
  const result = detectLegalContext("Ile dni urlopu mi się należy?");
  assertStringIncludes(result, "Urlop wypoczynkowy");
  assertStringIncludes(result, "Art. 152");
  assertStringIncludes(result, "Kodeks pracy");
});

Deno.test("detectLegalContext - wykrywa zwrot towaru online", () => {
  const result = detectLegalContext("Czy mogę zwrócić towar kupiony w sklepie internetowym?");
  assertStringIncludes(result, "Zwrot towaru");
  assertStringIncludes(result, "prawach konsumenta");
  assertStringIncludes(result, "14 dni");
});

Deno.test("detectLegalContext - wykrywa RODO", () => {
  const result = detectLegalContext("Jakie mam prawa do moich danych osobowych?");
  assertStringIncludes(result, "RODO");
  assertStringIncludes(result, "dane osobowe");
});

Deno.test("detectLegalContext - wykrywa prawo spadkowe", () => {
  const result = detectLegalContext("Jak wygląda dziedziczenie po rodzicach?");
  assertStringIncludes(result, "Prawo spadkowe");
  assertStringIncludes(result, "Art. 922");
  assertStringIncludes(result, "testament");
});

Deno.test("detectLegalContext - wykrywa umowę zlecenia", () => {
  const result = detectLegalContext("Jaka jest różnica między umową zlecenia a umową o dzieło?");
  assertStringIncludes(result, "Umowa zlecenia");
  assertStringIncludes(result, "Art. 734");
  assertStringIncludes(result, "Art. 627");
});

Deno.test("detectLegalContext - wykrywa mobbing", () => {
  const result = detectLegalContext("Jestem nękany w pracy przez szefa. Czy to mobbing?");
  assertStringIncludes(result, "Mobbing");
  assertStringIncludes(result, "Art. 943");
});

Deno.test("detectLegalContext - wykrywa prawa autorskie", () => {
  const result = detectLegalContext("Ktoś skopiował mój utwór bez zgody. Co mogę zrobić?");
  assertStringIncludes(result, "Prawa autorskie");
  assertStringIncludes(result, "naruszenie praw");
});

Deno.test("detectLegalContext - wykrywa postępowanie sądowe", () => {
  const result = detectLegalContext("Jak złożyć pozew do sądu?");
  assertStringIncludes(result, "Postępowanie sądowe");
  assertStringIncludes(result, "Art. 126");
  assertStringIncludes(result, "pozew");
});

Deno.test("detectLegalContext - wykrywa wypowiedzenie umowy o pracę", () => {
  const result = detectLegalContext("Jaki jest okres wypowiedzenia umowy o pracę?");
  assertStringIncludes(result, "Wypowiedzenie umowy");
  assertStringIncludes(result, "Art. 30");
});

Deno.test("detectLegalContext - wykrywa reklamację towaru", () => {
  const result = detectLegalContext("Telefon ma wadę. Jak złożyć reklamację?");
  assertStringIncludes(result, "Reklamacja towaru");
  assertStringIncludes(result, "rękojmia");
});

Deno.test("detectLegalContext - wykrywa alimenty", () => {
  const result = detectLegalContext("Ile wynoszą alimenty na dziecko?");
  assertStringIncludes(result, "Alimenty");
  assertStringIncludes(result, "Art. 133");
});

Deno.test("detectLegalContext - wykrywa wypowiedzenie najmu", () => {
  const result = detectLegalContext("Jak wypowiedzieć umowę najmu mieszkania?");
  assertStringIncludes(result, "Wypowiedzenie umowy najmu");
  assertStringIncludes(result, "Art. 659");
});

Deno.test("detectLegalContext - wykrywa kupno-sprzedaż", () => {
  const result = detectLegalContext("Kupuję mieszkanie. Czy potrzebny jest akt notarialny?");
  assertStringIncludes(result, "Umowa kupna-sprzedaży");
  assertStringIncludes(result, "akt notarialny");
});

Deno.test("detectLegalContext - wykrywa zniewagę", () => {
  const result = detectLegalContext("Sąsiad mnie obraża publicznie. Czy to zniewaga?");
  assertStringIncludes(result, "Zniewaga");
  assertStringIncludes(result, "Art. 216");
});

Deno.test("detectLegalContext - wykrywa wynagrodzenie", () => {
  const result = detectLegalContext("Kiedy pracodawca musi wypłacić pensję?");
  assertStringIncludes(result, "Wynagrodzenie za pracę");
  assertStringIncludes(result, "Art. 85");
});

Deno.test("detectLegalContext - wykrywa wiele tematów jednocześnie", () => {
  const result = detectLegalContext("Dostałem wypowiedzenie, a pracodawca nie wypłacił mi urlopu");
  assertStringIncludes(result, "Wypowiedzenie umowy");
  assertStringIncludes(result, "Urlop");
  // Powinien zawierać oba konteksty
});

Deno.test("detectLegalContext - zwraca pusty string dla pytań nieprawnych", () => {
  const result = detectLegalContext("Jak ugotować makaron?");
  assertEquals(result, "");
});

Deno.test("detectLegalContext - zwraca pusty string dla pytań ogólnych", () => {
  const result = detectLegalContext("Jaka jest pogoda?");
  assertEquals(result, "");
});

Deno.test("detectLegalContext - jest case-insensitive", () => {
  const result1 = detectLegalContext("URLOP WYPOCZYNKOWY");
  const result2 = detectLegalContext("urlop wypoczynkowy");
  assertStringIncludes(result1, "Urlop");
  assertStringIncludes(result2, "Urlop");
});

console.log("✅ Wszystkie testy wykrywania kontekstu prawnego gotowe do uruchomienia!");
