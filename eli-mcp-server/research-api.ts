/**
 * Research Script: API ELI Search Capabilities
 *
 * Cel: Zrozumieć jak działa /eli/acts/search i jak wybierać właściwe ustawy
 */

const ELI_API_BASE = 'https://api.sejm.gov.pl/eli';

interface SearchResult {
  query: string;
  totalCount: number;
  firstResults: any[];
}

console.log('🔬 RESEARCH: API ELI Search Capabilities\n');
console.log('='.repeat(60));
console.log('');

// Test cases - różne zapytania użytkowników
const TEST_QUERIES = [
  // Pełna nazwa
  { name: 'Pełna nazwa', query: 'Prawo o ruchu drogowym' },

  // Częściowa nazwa
  { name: 'Częściowa nazwa', query: 'ruchu drogowym' },

  // Potoczna nazwa (synonim)
  { name: 'Potoczna nazwa', query: 'kodeks drogowy' },

  // Skrócona
  { name: 'Skrócona', query: 'transport drogowy' },

  // Ustawa mało popularna
  { name: 'Mało popularna', query: 'energetyka odnawialna' },

  // Ustawa z długą nazwą
  { name: 'Długa nazwa', query: 'ochrona konkurencji i konsumentów' },

  // Ustawa z datą w nazwie
  { name: 'Z datą', query: 'ustawa z dnia 23 kwietnia 1964' },
];

async function searchAndAnalyze(testCase: { name: string; query: string }): Promise<SearchResult> {
  console.log(`\n📋 Test: ${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);
  console.log('-'.repeat(60));

  try {
    // Search with different parameters
    const url = new URL(`${ELI_API_BASE}/acts/search`);
    url.searchParams.set('title', testCase.query);
    url.searchParams.set('limit', '10');
    url.searchParams.set('inForce', '1'); // Only acts currently in force
    url.searchParams.set('sortBy', 'change');
    url.searchParams.set('sortDir', 'desc');

    console.log(`URL: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Research/1.0)',
      },
    });

    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return { query: testCase.query, totalCount: 0, firstResults: [] };
    }

    const data = await response.json();

    console.log(`\n✅ Znaleziono: ${data.totalCount} wyników (pokazuję ${data.count})`);

    if (data.items && data.items.length > 0) {
      console.log('\n🔍 Top 5 wyników:');
      data.items.slice(0, 5).forEach((act: any, i: number) => {
        console.log(`\n  ${i + 1}. ${act.title}`);
        console.log(`     ELI: ${act.ELI}`);
        console.log(`     Display: ${act.displayAddress}`);
        console.log(`     Type: ${act.type || 'N/A'}`);
        console.log(`     Status: ${act.status || 'N/A'}`);
        console.log(`     In Force: ${act.inForce || 'N/A'}`);
        console.log(`     Change Date: ${act.changeDate || 'N/A'}`);
        console.log(`     Has PDF: ${act.textPDF ? 'Yes' : 'No'} | Has HTML: ${act.textHTML ? 'Yes' : 'No'}`);
      });

      // Analyze patterns
      console.log('\n📊 Analiza wzorców:');

      const withPDF = data.items.filter((a: any) => a.textPDF).length;
      const withHTML = data.items.filter((a: any) => a.textHTML).length;
      const consolidated = data.items.filter((a: any) =>
        a.status?.toLowerCase().includes('jednolity') ||
        a.type?.toLowerCase().includes('jednolity')
      ).length;

      console.log(`  - Z PDF: ${withPDF}/${data.count}`);
      console.log(`  - Z HTML: ${withHTML}/${data.count}`);
      console.log(`  - Teksty jednolite: ${consolidated}/${data.count}`);

      // Check for exact match
      const exactMatch = data.items.find((a: any) =>
        a.title.toLowerCase() === testCase.query.toLowerCase()
      );
      if (exactMatch) {
        console.log(`  ✅ Znaleziono EXACT MATCH: ${exactMatch.title}`);
      } else {
        console.log(`  ⚠️  Brak exact match - będzie potrzebny fuzzy matching`);
      }
    } else {
      console.log('❌ Brak wyników!');
    }

    return {
      query: testCase.query,
      totalCount: data.totalCount || 0,
      firstResults: data.items?.slice(0, 5) || [],
    };
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { query: testCase.query, totalCount: 0, firstResults: [] };
  }
}

// Run all tests
const results: SearchResult[] = [];

for (const testCase of TEST_QUERIES) {
  const result = await searchAndAnalyze(testCase);
  results.push(result);

  // Rate limiting - wait 1s between requests
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Summary
console.log('\n\n');
console.log('='.repeat(60));
console.log('📊 PODSUMOWANIE RESEARCHU');
console.log('='.repeat(60));
console.log('');

console.log('Testy wykonane:');
results.forEach((r, i) => {
  console.log(`  ${i + 1}. "${r.query}" → ${r.totalCount} wyników`);
});

console.log('\n🎯 Wnioski:');
console.log('');

// Find common patterns
const allResults = results.flatMap(r => r.firstResults);
const typesSet = new Set(allResults.map(a => a.type).filter(Boolean));
const statusesSet = new Set(allResults.map(a => a.status).filter(Boolean));

console.log('Znalezione typy aktów:');
Array.from(typesSet).forEach(type => {
  const count = allResults.filter(a => a.type === type).length;
  console.log(`  - "${type}" (${count}x)`);
});

console.log('\nZnalezione statusy:');
Array.from(statusesSet).forEach(status => {
  const count = allResults.filter(a => a.status === status).length;
  console.log(`  - "${status}" (${count}x)`);
});

console.log('\n📝 Rekomendacje dla implementacji:');
console.log('');
console.log('1. Filtruj wyniki:');
console.log('   - inForce="1" (tylko obowiązujące)');
console.log('   - textPDF=true LUB textHTML=true (tylko z treścią)');
console.log('');
console.log('2. Preferuj w rankingu:');
console.log('   - Status zawiera "jednolity" → priorytet');
console.log('   - Type zawiera "jednolity" → priorytet');
console.log('   - changeDate najnowsza → wyżej');
console.log('');
console.log('3. Matching:');
console.log('   - Exact match tytułu → TOP 1');
console.log('   - Fuzzy match (similarity) → ranking');
console.log('   - Synonimy (mapa) → normalizacja');
console.log('');

// Test specific act retrieval
console.log('\n🧪 Test: Pobieranie konkretnego aktu (Prawo o ruchu drogowym)');
console.log('-'.repeat(60));

const bestMatch = results[0]?.firstResults[0];
if (bestMatch) {
  console.log(`\nPróba pobrania: ${bestMatch.title}`);
  console.log(`ELI: ${bestMatch.ELI}`);
  console.log(`Publisher/Year/Pos: ${bestMatch.publisher}/${bestMatch.year}/${bestMatch.pos}`);

  try {
    const actUrl = `${ELI_API_BASE}/acts/${bestMatch.publisher}/${bestMatch.year}/${bestMatch.pos}`;
    console.log(`URL: ${actUrl}`);

    const actResponse = await fetch(actUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (actResponse.ok) {
      const actData = await actResponse.json();
      console.log('\n✅ Szczegóły aktu:');
      console.log(`   Tytuł: ${actData.title}`);
      console.log(`   Status: ${actData.status}`);
      console.log(`   Wejście w życie: ${actData.entryIntoForce || 'N/A'}`);
      console.log(`   Data ogłoszenia: ${actData.announcementDate || 'N/A'}`);
      console.log(`   Ma PDF: ${actData.textPDF ? 'TAK' : 'NIE'}`);
      console.log(`   Ma HTML: ${actData.textHTML ? 'TAK' : 'NIE'}`);
    } else {
      console.log(`❌ Błąd: ${actResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
} else {
  console.log('❌ Brak wyników do przetestowania');
}

console.log('\n\n✅ Research zakończony!');
console.log('Następny krok: Analiza wyników i dyskusja architektury');
