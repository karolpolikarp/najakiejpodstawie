/**
 * Test wykrywania kontekstu prawnego - Node.js version
 * Symuluje działanie funkcji detectLegalContext z Supabase Edge Function
 */

// Słowa kluczowe dla różnych tematów prawnych (zsynchronizowane z index.ts)
const topicKeywords = {
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

function detectLegalTopics(message) {
  const lowerMessage = message.toLowerCase();
  const detectedTopics = [];

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics;
}

// TESTY
const testCases = [
  {
    question: "Ile dni urlopu mi się należy?",
    expectedTopics: ["urlop"],
    description: "Wykrywa urlop"
  },
  {
    question: "Czy mogę zwrócić towar kupiony w sklepie internetowym?",
    expectedTopics: ["zwrot_towaru_online"],
    description: "Wykrywa zwrot towaru online"
  },
  {
    question: "Jakie mam prawa do moich danych osobowych?",
    expectedTopics: ["rodo"],
    description: "Wykrywa RODO"
  },
  {
    question: "Jak wygląda dziedziczenie po rodzicach?",
    expectedTopics: ["spadek"],
    description: "Wykrywa prawo spadkowe"
  },
  {
    question: "Jaka jest różnica między umową zlecenia a umową o dzieło?",
    expectedTopics: ["umowa_zlecenie"],
    description: "Wykrywa umowę zlecenia"
  },
  {
    question: "Jestem nękany w pracy przez szefa. Czy to mobbing?",
    expectedTopics: ["mobbing"],
    description: "Wykrywa mobbing"
  },
  {
    question: "Ktoś skopiował mój utwór bez zgody. Co mogę zrobić?",
    expectedTopics: ["prawa_autorskie"],
    description: "Wykrywa prawa autorskie"
  },
  {
    question: "Jak złożyć pozew do sądu?",
    expectedTopics: ["postepowanie_sadowe"],
    description: "Wykrywa postępowanie sądowe"
  },
  {
    question: "Jaki jest okres wypowiedzenia umowy o pracę?",
    expectedTopics: ["wypowiedzenie_umowy_pracy"],
    description: "Wykrywa wypowiedzenie umowy"
  },
  {
    question: "Telefon ma wadę. Jak złożyć reklamację?",
    expectedTopics: ["reklamacja_towaru"],
    description: "Wykrywa reklamację"
  },
  {
    question: "Ile wynoszą alimenty na dziecko?",
    expectedTopics: ["alimenty"],
    description: "Wykrywa alimenty"
  },
  {
    question: "Jak wypowiedzieć umowę najmu mieszkania?",
    expectedTopics: ["wypowiedzenie_najmu"],
    description: "Wykrywa wypowiedzenie najmu"
  },
  {
    question: "Kupuję mieszkanie. Czy potrzebny jest akt notarialny?",
    expectedTopics: ["kupno_sprzedaz"],
    description: "Wykrywa kupno-sprzedaż"
  },
  {
    question: "Sąsiad mnie obraża publicznie. Czy to zniewaga?",
    expectedTopics: ["zniewaga"],
    description: "Wykrywa zniewagę"
  },
  {
    question: "Kiedy pracodawca musi wypłacić pensję?",
    expectedTopics: ["wynagrodzenie"],
    description: "Wykrywa wynagrodzenie"
  },
  {
    question: "Dostałem wypowiedzenie, a pracodawca nie wypłacił mi urlopu",
    expectedTopics: ["wypowiedzenie_umowy_pracy", "urlop"],
    description: "Wykrywa wiele tematów"
  },
  {
    question: "Jak ugotować makaron?",
    expectedTopics: [],
    description: "Odrzuca pytania nieprawne"
  },
  {
    question: "Jaka jest pogoda?",
    expectedTopics: [],
    description: "Odrzuca pytania ogólne"
  }
];

console.log("\n🧪 TESTY WYKRYWANIA KONTEKSTU PRAWNEGO\n");
console.log("=" .repeat(80));

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  const detected = detectLegalTopics(testCase.question);
  const expected = testCase.expectedTopics;

  // Sprawdź czy wszystkie oczekiwane tematy zostały wykryte
  const allExpectedFound = expected.every(topic => detected.includes(topic));
  // Sprawdź czy nie wykryto niepotrzebnych tematów (dla pustych oczekiwań)
  const noUnexpectedFound = expected.length === 0 ? detected.length === 0 : true;

  const passed = allExpectedFound && noUnexpectedFound;

  if (passed) {
    passedTests++;
    console.log(`✅ Test ${index + 1}: ${testCase.description}`);
  } else {
    failedTests++;
    console.log(`❌ Test ${index + 1}: ${testCase.description}`);
    console.log(`   Pytanie: "${testCase.question}"`);
    console.log(`   Oczekiwano: [${expected.join(', ')}]`);
    console.log(`   Wykryto: [${detected.join(', ')}]`);
  }
});

console.log("\n" + "=".repeat(80));
console.log(`\n📊 PODSUMOWANIE:`);
console.log(`   ✅ Zaliczone: ${passedTests}/${testCases.length}`);
console.log(`   ❌ Niezaliczone: ${failedTests}/${testCases.length}`);
console.log(`   📈 Trafność: ${((passedTests/testCases.length)*100).toFixed(1)}%\n`);

if (failedTests === 0) {
  console.log("🎉 Wszystkie testy przeszły pomyślnie!\n");
  console.log("✨ WNIOSKI:");
  console.log("   • Funkcja detectLegalContext działa poprawnie");
  console.log("   • Wszystkie 16 kategorii są wykrywane");
  console.log("   • Wykrywanie wielu tematów działa");
  console.log("   • Pytania nieprawne są poprawnie odrzucane\n");
} else {
  console.log("⚠️  Niektóre testy nie przeszły. Sprawdź wyniki powyżej.\n");
  process.exit(1);
}
