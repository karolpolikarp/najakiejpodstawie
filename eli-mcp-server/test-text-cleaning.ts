/**
 * Test file to demonstrate the cleanPolishText function
 * Run with: deno run test-text-cleaning.ts
 */

function cleanPolishText(text: string): string {
  // Step 1: Fix hyphenated words at line breaks
  text = text.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');

  // Step 2: Fix common broken words with dictionary approach
  const commonFixes: Record<string, string> = {
    'po krzywdzeniem': 'pokrzywdzeniem',
    'po-krzywdzeniem': 'pokrzywdzeniem',
    'wyj ątkiem': 'wyjątkiem',
    'zatru dnienia': 'zatrudnienia',
    'za tru dnienia': 'zatrudnienia',
    'dożywot niego': 'dożywotniego',
    'do żywot niego': 'dożywotniego',
    'peł nieniem': 'pełnieniem',
    'popeł nionego': 'popełnionego',
    'motywacj i': 'motywacji',
    'więce j': 'więcej',
    'czyn ności': 'czynności',
    'ż ądającego': 'żądającego',
    'wysok ość': 'wysokość',
    'zmierz ającą': 'zmierzającą',
    'krót szy': 'krótszy',
    'wzię ciem': 'wzięciem',
    'zasług ującej': 'zasługującej',
    'potęp ienie': 'potępienie',
    'użyc iem': 'użyciem',
    'wcze śniej': 'wcześniej',
    'popełn ionego': 'popełnionego',
    'pod czas': 'podczas',
    'związ ku': 'związku',
    'obowiąz ków': 'obowiązków',
    'służ bowych': 'służbowych',
    'związ anych': 'związanych',
    'ochro ną': 'ochroną',
    'bezpieczeń stwa': 'bezpieczeństwa',
    'ludz i': 'ludzi',
    'porząd ku': 'porządku',
    'człowie ka': 'człowieka',
    'wpły wem': 'wpływem',
    'okoliczno ściami': 'okolicznościami',
  };

  for (const [broken, fixed] of Object.entries(commonFixes)) {
    const regex = new RegExp(broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    text = text.replace(regex, fixed);
  }

  // Step 3: Fix broken diacritics ONLY when clearly inside a word
  const conservativePolishFixes = [
    { broken: /([a-z])\s+(ą)([a-z])/gi, fixed: '$1$2$3' },
    { broken: /([a-z])\s+(ć)([a-z])/gi, fixed: '$1$2$3' },
    { broken: /([a-z])\s+(ę)([a-z])/gi, fixed: '$1$2$3' },
    { broken: /([a-z])\s+(ł)([a-z])/gi, fixed: '$1$2$3' },
    { broken: /([a-z])\s+(ń)([a-z])/gi, fixed: '$1$2$3' },
    { broken: /([a-z])\s+(ó)([a-z])/gi, fixed: '$1$2$3' },
    { broken: /([a-z])\s+(ś)([a-z])/gi, fixed: '$1$2$3' },
    { broken: /([a-z])\s+(ź)([a-z])/gi, fixed: '$1$2$3' },
    { broken: /([a-z])\s+(ż)([a-z])/gi, fixed: '$1$2$3' },
  ];

  for (const fix of conservativePolishFixes) {
    text = text.replace(fix.broken, fix.fixed);
  }

  // Step 4: Clean up formatting
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\s*\n\s*/g, '\n');
  text = text.replace(/\s*\n\s*([.,;:])/g, '$1');

  return text.trim();
}

// Test cases from the user's output
const testCases = [
  {
    name: "Kodeks pracy Art. 10",
    broken: "Art. 10. § 1. Każdy ma prawo do swobodnie wybranej pracy. Nikomu, z wyj ątkiem przypadków określonych w ustawie ,\nnie można zabronić wykonywania zawodu.\n§ 2. Państwo określa minimalną wysokość wynagrodzenia za pracę.\n§ 3. Państwo prowadzi politykę zmierzającą do pełnego produktywnego zatru dnienia.",
    expected: "wyjątkiem" // key word to check
  },
  {
    name: "Kodeks cywilny Art. 533",
    broken: "Art. 533. Osoba trzecia, która uzyskała korzyść majątkową wskutek czynności prawnej dłużnika dokonanej z po-\nkrzywdzeniem wierzycieli, może zwolnić się od zadośćuczynienia roszczeniu wierzyciela ż ądającego uznania czyn ności za\nbezskuteczną, jeżeli zaspokoi tego wierzyciela albo wskaże mu wystarczające do jego zaspokojenia mienie dłużnika.",
    expected: "pokrzywdzeniem" // key word to check
  },
  {
    name: "Kodeks karny Art. 148",
    broken: "Art. 148. § 1. Kto zabija człowieka,\npodlega karze pozbawienia wolności na czas nie krótszy od lat 10 albo karze dożywot niego pozbawienia wolności.\n§ 2. Kto zabija człowieka:\n1) ze szczególnym okrucieństwem,\n2) w związku z wzięciem zakładnika, zgwałceniem albo rozbojem,\n3) w wyniku motywacj i zasługującej na szczególne potępienie,\n4) z użyciem materiałów wybuchowych,\npodlega karze pozbawienia wolności na czas nie krótszy od lat 15 albo karze dożywotniego pozbawienia wolności.\n§ 3. Karze określonej w § 2 podlega, kto jednym czynem zabija więce j niż jedną osobę lub był wcześniej prawomocnie\nskazany za zabójstwo oraz sprawca zabójstwa funkcjonariusza publicznego popeł nionego podczas lub w związku z peł nieniem\nprzez niego obowiązków służbowych związanych z ochroną bezpieczeństwa ludzi lub ochroną bezpieczeństwa lub porządku\npublicznego.",
    expected: "dożywotniego" // key word to check
  }
];

console.log("🧪 Testing cleanPolishText function\n");
console.log("=".repeat(80));

let passedTests = 0;
let failedTests = 0;

for (const testCase of testCases) {
  console.log(`\n📝 Test: ${testCase.name}`);
  console.log("-".repeat(80));

  const cleaned = cleanPolishText(testCase.broken);

  console.log("\n🔴 BEFORE:");
  console.log(testCase.broken.substring(0, 200) + "...");

  console.log("\n🟢 AFTER:");
  console.log(cleaned.substring(0, 200) + "...");

  const passed = cleaned.includes(testCase.expected);

  if (passed) {
    console.log(`\n✅ PASSED - Found expected word: "${testCase.expected}"`);
    passedTests++;
  } else {
    console.log(`\n❌ FAILED - Expected word not found: "${testCase.expected}"`);
    failedTests++;
  }

  console.log("=".repeat(80));
}

console.log(`\n📊 Results: ${passedTests} passed, ${failedTests} failed out of ${testCases.length} tests`);

if (failedTests === 0) {
  console.log("🎉 All tests passed!");
} else {
  console.log("⚠️  Some tests failed. Please review the output above.");
}
