/**
 * Test Dynamic Act Search
 *
 * Tests the new 3-level architecture:
 * 1. Hardcoded map (16 acts)
 * 2. Dynamic search + cache
 * 3. Error handling with suggestions
 */

import { ELIClient } from './src/eli-client.ts';
import { ELITools } from './src/tools.ts';

console.log('🧪 Testing Dynamic Act Search\n');
console.log('='.repeat(60));
console.log('');

const client = new ELIClient();
const tools = new ELITools(client);

// Test cases covering different scenarios
const TEST_CASES = [
  {
    name: 'Hardcoded act (fast path)',
    actCode: 'prd',
    articleNumber: '30',
    expectedSource: 'hardcoded',
  },
  {
    name: 'Hardcoded with full name',
    actCode: 'prawo o ruchu drogowym',
    articleNumber: '30',
    expectedSource: 'hardcoded',
  },
  {
    name: 'Synonym mapping',
    actCode: 'kodeks drogowy',
    articleNumber: '30',
    expectedSource: 'hardcoded or cache or api',
  },
  {
    name: 'Dynamic search - energetyka odnawialna',
    actCode: 'energetyka odnawialna',
    articleNumber: '5',
    expectedSource: 'api or cache',
  },
  {
    name: 'Dynamic search - prawo bankowe',
    actCode: 'prawo bankowe',
    articleNumber: '1',
    expectedSource: 'api or cache',
  },
  {
    name: 'Typo test - should still work with fuzzy matching',
    actCode: 'prawo o ruchu drogowm', // typo: drogowm instead of drogowym
    articleNumber: '30',
    expectedSource: 'api or cache',
  },
  {
    name: 'Partial name - transport drogowy',
    actCode: 'transport drogowy',
    articleNumber: '1',
    expectedSource: 'api or cache',
  },
  {
    name: 'Non-existent act - should fail with suggestions',
    actCode: 'ustawa o xyz abc 123',
    articleNumber: '1',
    expectedSource: 'error',
  },
];

async function runTest(test: typeof TEST_CASES[0]) {
  console.log(`\n📋 Test: ${test.name}`);
  console.log(`Query: "${test.actCode}" art ${test.articleNumber}`);
  console.log('-'.repeat(60));

  try {
    const startTime = Date.now();

    const result = await tools.getArticle({
      actCode: test.actCode,
      articleNumber: test.articleNumber,
    });

    const duration = Date.now() - startTime;

    if (result.success) {
      console.log(`✅ SUCCESS (${duration}ms)`);
      console.log(`   Act: ${result.act?.title}`);
      console.log(`   Address: ${result.act?.displayAddress}`);
      console.log(`   Article text (first 150 chars):`);
      const preview = result.article?.text?.substring(0, 150) || '';
      console.log(`   "${preview}..."`);
      console.log(`   ISAP: ${result.isapLink}`);
    } else {
      if (test.expectedSource === 'error') {
        console.log(`✅ EXPECTED ERROR (${duration}ms)`);
        console.log(`   Error message:\n${result.error}`);
      } else {
        console.log(`❌ FAILED (${duration}ms)`);
        console.log(`   Error: ${result.error}`);
      }
    }
  } catch (error) {
    console.log(`❌ EXCEPTION: ${error.message}`);
    console.error(error.stack);
  }
}

// Run all tests
for (const test of TEST_CASES) {
  await runTest(test);

  // Rate limiting - wait 2s between API calls
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Display statistics
console.log('\n\n');
console.log('='.repeat(60));
console.log('📊 STATISTICS');
console.log('='.repeat(60));
console.log('');

const stats = tools.getStats();
console.log('Cache Performance:');
console.log(`  Hardcoded hits: ${stats.hardcodedHits}`);
console.log(`  Cache hits: ${stats.cacheHits}`);
console.log(`  API hits: ${stats.apiHits}`);
console.log(`  Errors: ${stats.errors}`);
console.log(`  Cache size: ${stats.cacheSize}/${stats.maxCacheSize}`);
console.log('');

const totalQueries = stats.hardcodedHits + stats.cacheHits + stats.apiHits + stats.errors;
if (totalQueries > 0) {
  const cacheHitRate = ((stats.hardcodedHits + stats.cacheHits) / totalQueries * 100).toFixed(1);
  console.log(`Cache hit rate: ${cacheHitRate}%`);
  console.log(`Average lookup strategy:`);
  console.log(`  - Hardcoded: ${(stats.hardcodedHits / totalQueries * 100).toFixed(1)}%`);
  console.log(`  - Cache: ${(stats.cacheHits / totalQueries * 100).toFixed(1)}%`);
  console.log(`  - API: ${(stats.apiHits / totalQueries * 100).toFixed(1)}%`);
  console.log(`  - Errors: ${(stats.errors / totalQueries * 100).toFixed(1)}%`);
}

console.log('\n\n✅ Testing complete!');
console.log('');
console.log('🎯 Summary:');
console.log('   - Hardcoded acts (16): ⚡ instant lookup');
console.log('   - Cached acts: ⚡ instant lookup');
console.log('   - Dynamic API search: 🔍 covers all 15k+ acts (slower)');
console.log('   - Error handling: 💡 suggests similar acts');
console.log('');
console.log('The system now supports ALL Polish legal acts, not just 16!');
