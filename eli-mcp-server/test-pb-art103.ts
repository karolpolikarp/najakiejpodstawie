/**
 * Test script to verify Art. 103 of Prawo budowlane
 * This tests that long articles (especially transitional provisions) are fully extracted
 */

import { ELIClient } from './src/eli-client.ts';
import { ELITools } from './src/tools.ts';

console.log('🧪 Testing Art. 103 Prawa budowlanego...\n');

const client = new ELIClient();
const tools = new ELITools(client);

// Test 1: Get article using act code "pb"
console.log('Test 1: Get article using "pb" code');
try {
  const result = await tools.getArticle({
    actCode: 'pb',
    articleNumber: '103',
  });

  if (result.success) {
    console.log('  ✅ SUCCESS');
    console.log(`  Act: ${result.act?.title}`);
    console.log(`  ISAP Link: ${result.isapLink}`);

    const text = result.article?.text || '';
    console.log(`  Article length: ${text.length} characters`);
    console.log(`  Article text (first 300 chars):`);
    console.log(`  ${text.substring(0, 300)}...`);
    console.log('');

    // Check if article contains key parts
    const hasUst1 = text.includes('Do spraw wszczętych przed dniem wejścia');
    const hasUst2 = text.match(/[2]\.\s*[^Art]/); // Ustęp 2 (number 2 followed by dot and NOT "Art")
    const hasZastrzezeniem = text.includes('z zastrzeżeniem');

    console.log(`  Contains ustęp 1 (Do spraw wszczętych...): ${hasUst1 ? '✅' : '❌'}`);
    console.log(`  Contains ustęp 2 marker: ${hasUst2 ? '✅' : '❌'}`);
    console.log(`  Contains "z zastrzeżeniem": ${hasZastrzezeniem ? '✅' : '❌'}`);

    // Check that article is not cut off prematurely
    const seemsComplete = text.length > 200; // Art 103 should be longer than 200 chars
    console.log(`  Article length adequate (>200 chars): ${seemsComplete ? '✅' : '❌'}`);

    if (hasUst1 && hasUst2 && hasZastrzezeniem && seemsComplete) {
      console.log('\n  🎉 Article content looks complete!');
    } else {
      console.log('\n  ⚠️  Article may be incomplete - check the output above');
      console.log('  Full article text:');
      console.log('  ' + '-'.repeat(60));
      console.log('  ' + text.replace(/\n/g, '\n  '));
      console.log('  ' + '-'.repeat(60));
    }
  } else {
    console.log(`  ❌ FAILED - ${result.error}`);
  }
} catch (error) {
  console.log(`  ❌ ERROR - ${error.message}`);
}

console.log('');

// Test 2: Get article using full name
console.log('Test 2: Get article using "prawo budowlane" code');
try {
  const result = await tools.getArticle({
    actCode: 'prawo budowlane',
    articleNumber: '103',
  });

  if (result.success) {
    console.log('  ✅ SUCCESS');
    console.log(`  Act: ${result.act?.title}`);
    console.log(`  Article number: ${result.article?.number}`);

    const text = result.article?.text || '';
    console.log(`  Article length: ${text.length} characters`);

    // Verify we got the full article
    if (text.length > 200) {
      console.log('  ✅ Article appears to be complete');
    } else {
      console.log('  ⚠️  Article may be truncated (too short)');
    }
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
console.log('This test verifies that Art. 103 (transitional provisions) is fully extracted.');
console.log('Before the fix: Article was truncated at ~150 chars ("z zastrzeżeniem...")');
console.log('After the fix: Article should include full ustęp 1, ustęp 2, and all content.');
console.log('');
