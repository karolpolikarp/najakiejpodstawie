/**
 * Test script to verify Art. 415 of Kodeks cywilny
 * User reported that this article cannot be found, even though it definitely exists
 */

import { ELIClient } from './src/eli-client.ts';
import { ELITools } from './src/tools.ts';

console.log('🧪 Testing Art. 415 Kodeksu cywilnego...\n');

const client = new ELIClient();
const tools = new ELITools(client);

// Test: Get article 415 using act code "kc"
console.log('Test: Get article 415 using "kc" code');
try {
  const result = await tools.getArticle({
    actCode: 'kc',
    articleNumber: '415',
  });

  if (result.success) {
    console.log('  ✅ SUCCESS');
    console.log(`  Act: ${result.act?.title}`);
    console.log(`  ISAP Link: ${result.isapLink}`);

    const text = result.article?.text || '';
    console.log(`  Article length: ${text.length} characters`);
    console.log(`  Article text (first 500 chars):`);
    console.log(`  ${text.substring(0, 500)}...`);
    console.log('');

    // Check if article was actually found or just returned default message
    const wasNotFound = text.includes('nie został znaleziony');

    if (wasNotFound) {
      console.log('  ❌ ARTICLE NOT FOUND IN PDF TEXT');
      console.log('  This confirms the regex pattern issue.');
      console.log('');
      console.log('  Article 415 KC should contain text about liability for damages:');
      console.log('  "Kto z winy swojej wyrządził drugiemu szkodę..."');
      console.log('');
      console.log('  Full response:');
      console.log('  ' + '-'.repeat(60));
      console.log('  ' + text.replace(/\n/g, '\n  '));
      console.log('  ' + '-'.repeat(60));
    } else {
      console.log('  ✅ Article 415 was found successfully!');

      // Check if it contains expected text
      const hasExpectedText = text.includes('Kto z winy') || text.includes('wyrządził') || text.includes('szkodę');
      console.log(`  Contains expected keywords: ${hasExpectedText ? '✅' : '❌'}`);

      if (!hasExpectedText) {
        console.log('\n  ⚠️  Article may have incorrect content - check the output above');
        console.log('  Full article text:');
        console.log('  ' + '-'.repeat(60));
        console.log('  ' + text.replace(/\n/g, '\n  '));
        console.log('  ' + '-'.repeat(60));
      }
    }
  } else {
    console.log(`  ❌ FAILED - ${result.error}`);
  }
} catch (error) {
  console.log(`  ❌ ERROR - ${error.message}`);
  console.error(error);
}

console.log('');
console.log('─────────────────────────────────────────');
console.log('');
console.log('📊 SUMMARY:');
console.log('This test verifies that Art. 415 KC can be extracted from the PDF.');
console.log('Article 415 is the fundamental article on tort liability in Polish law.');
console.log('');
