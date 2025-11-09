/**
 * Test script to verify Art. 30 of Prawo o ruchu drogowym
 * Run this to test the new PRD support
 */

import { ELIClient } from './src/eli-client.ts';
import { ELITools } from './src/tools.ts';

console.log('🧪 Testing Art. 30 Prawa o ruchu drogowym...\n');

const client = new ELIClient();
const tools = new ELITools(client);

// Test 1: Get article using act code
console.log('Test 1: Get article using "prd" code');
try {
  const result = await tools.getArticle({
    actCode: 'prd',
    articleNumber: '30',
  });

  if (result.success) {
    console.log('  ✅ SUCCESS');
    console.log(`  Act: ${result.act?.title}`);
    console.log(`  ISAP Link: ${result.isapLink}`);
    console.log(`  Article text (first 200 chars):`);
    console.log(`  ${result.article?.text?.substring(0, 200)}...`);
  } else {
    console.log(`  ❌ FAILED - ${result.error}`);
  }
} catch (error) {
  console.log(`  ❌ ERROR - ${error.message}`);
}

console.log('');

// Test 2: Get article using full name
console.log('Test 2: Get article using "prawo o ruchu drogowym" code');
try {
  const result = await tools.getArticle({
    actCode: 'prawo o ruchu drogowym',
    articleNumber: '30',
  });

  if (result.success) {
    console.log('  ✅ SUCCESS');
    console.log(`  Act: ${result.act?.title}`);
    console.log(`  Article number: ${result.article?.number}`);

    // Check if the article mentions key terms from Art. 30
    const text = result.article?.text || '';
    const hasMgla = text.toLowerCase().includes('mgł');
    const hasOswietlenie = text.toLowerCase().includes('światł') || text.toLowerCase().includes('oświetl');
    const hasOstrożność = text.toLowerCase().includes('ostrożn');

    console.log(`  Contains "mgła": ${hasMgla ? '✅' : '❌'}`);
    console.log(`  Contains "światła/oświetlenie": ${hasOswietlenie ? '✅' : '❌'}`);
    console.log(`  Contains "ostrożność": ${hasOstrożność ? '✅' : '❌'}`);

    if (hasMgla && hasOswietlenie && hasOstrożność) {
      console.log('\n  🎉 Article content looks correct!');
    }
  } else {
    console.log(`  ❌ FAILED - ${result.error}`);
  }
} catch (error) {
  console.log(`  ❌ ERROR - ${error.message}`);
}

console.log('');

// Test 3: Get act details
console.log('Test 3: Get Prawo o ruchu drogowym details');
try {
  const result = await tools.getActDetails({
    publisher: 'DU',
    year: 2024,
    position: 1251,
  });

  if (result.success) {
    console.log('  ✅ SUCCESS');
    console.log(`  Title: ${result.act?.title}`);
    console.log(`  Display Address: ${result.act?.displayAddress}`);
    console.log(`  Status: ${result.act?.status}`);
    console.log(`  In Force: ${result.act?.inForce}`);
    console.log(`  Has PDF: ${result.act?.hasPDF ? 'Yes' : 'No'}`);
    console.log(`  Has HTML: ${result.act?.hasHTML ? 'Yes' : 'No'}`);
    console.log(`  ISAP Link: ${result.isapLink}`);
  } else {
    console.log(`  ❌ FAILED - ${result.error}`);
  }
} catch (error) {
  console.log(`  ❌ ERROR - ${error.message}`);
}

console.log('');
console.log('─────────────────────────────────────────');
console.log('');
console.log('📊 SUMMARY:');
console.log('If all tests show ✅ SUCCESS - Prawo o ruchu drogowym is now supported!');
console.log('You can now use queries like:');
console.log('  - "art 30 prd"');
console.log('  - "artykuł 30 prawa o ruchu drogowym"');
console.log('  - "co mówi art 30 prd"');
console.log('');
