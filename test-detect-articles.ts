/**
 * Test script for detectArticleReferences function
 */

// Simplified version of detectArticleReferences for testing
function detectArticleReferences(message: string) {
  const references: { actCode: string; articleNumber: string }[] = [];

  // Pattern 2: "art 10 kodeks pracy", "artykuł 533 kodeksu cywilnego", "art 69 kodeksu postępowania cywilnego"
  const pattern2 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+(?:kodeks|kodeksu|kodeksie)\s+(pracy|cywilny|cywilnego|cywilnym|karny|karnego|karnym|karny skarbowy|karnego skarbowego|spółek handlowych|spolek handlowych|postępowania\s+(?:cywilnego|karnego)|postepowania\s+(?:cywilnego|karnego))/gi;
  let match;
  while ((match = pattern2.exec(message)) !== null) {
    const articleNumber = match[1];
    const codeName = match[2].toLowerCase();

    let actCode = '';
    if (codeName.startsWith('prac')) actCode = 'kp';
    else if (codeName.includes('postępowania cywilnego') || codeName.includes('postepowania cywilnego')) actCode = 'kpc';
    else if (codeName.includes('postępowania karnego') || codeName.includes('postepowania karnego')) actCode = 'kpk';
    else if (codeName.startsWith('cywil')) actCode = 'kc';
    else if (codeName.startsWith('karny skarbowy') || codeName.startsWith('karnego skarbowego')) actCode = 'kks';
    else if (codeName.startsWith('kar')) actCode = 'kk';
    else if (codeName.startsWith('spółek') || codeName.startsWith('spolek')) actCode = 'ksh';

    if (actCode) {
      references.push({ actCode, articleNumber });
    }
  }

  return references;
}

// Test cases
const testCases = [
  {
    input: "art 69 kpc",
    expected: [{ actCode: "kpc", articleNumber: "69" }],
    description: "art 69 kpc (skrót)"
  },
  {
    input: "art 69 kodeksu postępowania cywilnego",
    expected: [{ actCode: "kpc", articleNumber: "69" }],
    description: "art 69 kodeksu postępowania cywilnego (pełna nazwa)"
  },
  {
    input: "art 69 kodeksu postepowania cywilnego",
    expected: [{ actCode: "kpc", articleNumber: "69" }],
    description: "art 69 kodeksu postepowania cywilnego (bez ę)"
  },
  {
    input: "artykuł 148 kodeksu postępowania karnego",
    expected: [{ actCode: "kpk", articleNumber: "148" }],
    description: "artykuł 148 kodeksu postępowania karnego"
  },
  {
    input: "art 10 kp",
    expected: [],
    description: "art 10 kp (pattern 1, nie pattern 2)"
  },
  {
    input: "art 533 kodeksu cywilnego",
    expected: [{ actCode: "kc", articleNumber: "533" }],
    description: "art 533 kodeksu cywilnego"
  },
];

console.log("🧪 Testing detectArticleReferences()\n");
console.log("=".repeat(60));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const result = detectArticleReferences(testCase.input);
  const resultStr = JSON.stringify(result);
  const expectedStr = JSON.stringify(testCase.expected);

  if (resultStr === expectedStr) {
    console.log(`✅ PASS: ${testCase.description}`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Result: ${resultStr}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${testCase.description}`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Expected: ${expectedStr}`);
    console.log(`   Got: ${resultStr}`);
    failed++;
  }
  console.log("");
}

console.log("=".repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("🎉 All tests passed!");
} else {
  console.log(`⚠️  ${failed} test(s) failed`);
  Deno.exit(1);
}
