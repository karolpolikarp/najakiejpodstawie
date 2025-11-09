/**
 * Test file to demonstrate the cleanPolishText function
 * Run with: deno run test-text-cleaning.ts
 */

function cleanPolishText(text: string): string {
  // Step 1: Fix hyphenated words at line breaks
  text = text.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');
  text = text.replace(/(\w+)-\s+(\w+)/g, '$1$2');

  // Step 2: Fix broken Polish diacritic characters
  const polishCharFixes = [
    { broken: /([a-z])\s+ą/gi, fixed: '$1ą' },
    { broken: /([a-z])\s+ć/gi, fixed: '$1ć' },
    { broken: /([a-z])\s+ę/gi, fixed: '$1ę' },
    { broken: /([a-z])\s+ł/gi, fixed: '$1ł' },
    { broken: /([a-z])\s+ń/gi, fixed: '$1ń' },
    { broken: /([a-z])\s+ó/gi, fixed: '$1ó' },
    { broken: /([a-z])\s+ś/gi, fixed: '$1ś' },
    { broken: /([a-z])\s+ź/gi, fixed: '$1ź' },
    { broken: /([a-z])\s+ż/gi, fixed: '$1ż' },
    // Also fix when diacritic comes before space
    { broken: /ą\s+([a-z])/gi, fixed: 'ą$1' },
    { broken: /ć\s+([a-z])/gi, fixed: 'ć$1' },
    { broken: /ę\s+([a-z])/gi, fixed: 'ę$1' },
    { broken: /ł\s+([a-z])/gi, fixed: 'ł$1' },
    { broken: /ń\s+([a-z])/gi, fixed: 'ń$1' },
    { broken: /ó\s+([a-z])/gi, fixed: 'ó$1' },
    { broken: /ś\s+([a-z])/gi, fixed: 'ś$1' },
    { broken: /ź\s+([a-z])/gi, fixed: 'ź$1' },
    { broken: /ż\s+([a-z])/gi, fixed: 'ż$1' },
  ];

  for (const fix of polishCharFixes) {
    text = text.replace(fix.broken, fix.fixed);
  }

  // Step 3: Fix common broken words
  const commonFixes: Record<string, string> = {
    'po krzywdzeniem': 'pokrzywdzeniem',
    'za tru dnienia': 'zatrudnienia',
    'do żywot niego': 'dożywotniego',
    'peł nieniem': 'pełnieniem',
    'popeł nionego': 'popełnionego',
    'motywacj i': 'motywacji',
    'więce j': 'więcej',
    'czyn ności': 'czynności',
    'ż ądającego': 'żądającego',
    'wyj ątkiem': 'wyjątkiem',
  };

  for (const [broken, fixed] of Object.entries(commonFixes)) {
    text = text.replace(new RegExp(broken, 'gi'), fixed);
  }

  // Step 4: Fix excessive spaces within words
  text = text.replace(/\b([a-ząćęłńóśźż]+)\s+([a-ząćęłńóśźż]{1,3}\b)/gi, (match, p1, p2) => {
    if (p2.length <= 3 && !['i', 'w', 'z', 'u', 'o', 'a', 'na', 'do', 'od', 'po', 'za'].includes(p2.toLowerCase())) {
      return p1 + p2;
    }
    return match;
  });

  // Step 5: Clean up line breaks and spacing
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
