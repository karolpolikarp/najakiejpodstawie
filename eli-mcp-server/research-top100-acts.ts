/**
 * Research Script: Automatyczny research TOP 100 ustaw z ISAP API
 *
 * Ten skrypt:
 * 1. Wyszukuje każdą ustawę w ISAP API
 * 2. Wybiera najlepszy wynik (tekst jednolity, najnowszy, obowiązujący)
 * 3. Generuje kod TypeScript gotowy do wklejenia do ACT_CODES
 */

const ELI_API_BASE = 'https://api.sejm.gov.pl/eli';

interface ActInfo {
  searchName: string;
  displayName: string;
  publisher: string;
  year: number;
  position: number;
  title: string;
  status: string;
  category: string;
}

// TOP 100 aktów prawnych - podzielone na kategorie
const TOP_ACTS = {
  'KODEKSY': [
    { search: 'kodeks cywilny', display: 'kc' },
    { search: 'kodeks postępowania cywilnego', display: 'kpc' },
    { search: 'kodeks pracy', display: 'kp' },
    { search: 'kodeks karny', display: 'kk' },
    { search: 'kodeks postępowania karnego', display: 'kpk' },
    { search: 'kodeks rodzinny i opiekuńczy', display: 'kro' },
    { search: 'kodeks postępowania administracyjnego', display: 'kpa' },
    { search: 'kodeks spółek handlowych', display: 'ksh' },
    { search: 'ordynacja podatkowa', display: 'op' },
    { search: 'kodeks karny skarbowy', display: 'kks' },
    { search: 'kodeks karny wykonawczy', display: 'kkw' },
  ],
  'KONSTYTUCJA': [
    { search: 'konstytucja rzeczypospolitej polskiej', display: 'konstytucja' },
  ],
  'PRAWO_PODATKOWE': [
    { search: 'podatek dochodowy od osób fizycznych', display: 'pit' },
    { search: 'podatek dochodowy od osób prawnych', display: 'cit' },
    { search: 'podatek od towarów i usług', display: 'vat' },
    { search: 'podatek akcyzowy', display: 'akcyza' },
    { search: 'podatek od nieruchomości', display: 'podatek od nieruchomości' },
    { search: 'podatek od spadków i darowizn', display: 'podatek spadki' },
  ],
  'PRAWO_PRACY': [
    { search: 'system ubezpieczeń społecznych', display: 'zus' },
    { search: 'emerytury i renty z funduszu ubezpieczeń społecznych', display: 'emerytury' },
    { search: 'minimalne wynagrodzenie za pracę', display: 'minimalne wynagrodzenie' },
  ],
  'PRAWO_GOSPODARCZE': [
    { search: 'prawo przedsiębiorców', display: 'prawo przedsiębiorców' },
    { search: 'krajowy rejestr sądowy', display: 'krs' },
    { search: 'rachunkowość', display: 'rachunkowość' },
    { search: 'prawo upadłościowe', display: 'prawo upadłościowe' },
    { search: 'ochrona konkurencji i konsumentów', display: 'uokik' },
    { search: 'prawo bankowe', display: 'prawo bankowe' },
  ],
  'PRAWO_NIERUCHOMOŚCI': [
    { search: 'gospodarka nieruchomościami', display: 'gospodarka nieruchomościami' },
    { search: 'księgi wieczyste i hipoteka', display: 'księgi wieczyste' },
    { search: 'prawo budowlane', display: 'pb' },
    { search: 'planowanie i zagospodarowanie przestrzenne', display: 'planowanie przestrzenne' },
    { search: 'własność lokali', display: 'własność lokali' },
  ],
  'PRAWO_SAMORZĄDOWE': [
    { search: 'samorząd gminny', display: 'samorząd gminny' },
    { search: 'samorząd powiatowy', display: 'samorząd powiatowy' },
    { search: 'samorząd województwa', display: 'samorząd województwa' },
  ],
  'PRAWO_CYWILNE': [
    { search: 'prawo o notariacie', display: 'notariat' },
    { search: 'komornik sądowy', display: 'komornicy' },
    { search: 'ochrona danych osobowych', display: 'rodo polska' },
    { search: 'prawa konsumenta', display: 'prawa konsumenta' },
  ],
  'PRAWO_KOMUNIKACYJNE': [
    { search: 'prawo o ruchu drogowym', display: 'prd' },
    { search: 'kierujący pojazdami', display: 'prawo jazdy' },
    { search: 'ubezpieczenia obowiązkowe ubezpieczeniowy fundusz gwarancyjny', display: 'oc' },
  ],
  'PRAWO_ZDROWOTNE': [
    { search: 'prawa pacjenta', display: 'prawa pacjenta' },
    { search: 'działalność lecznicza', display: 'działalność lecznicza' },
    { search: 'zawody lekarza i lekarza dentysty', display: 'zawód lekarza' },
    { search: 'prawo farmaceutyczne', display: 'prawo farmaceutyczne' },
  ],
  'PRAWO_OŚWIATOWE': [
    { search: 'prawo oświatowe', display: 'prawo oświatowe' },
    { search: 'karta nauczyciela', display: 'karta nauczyciela' },
    { search: 'prawo o szkolnictwie wyższym i nauce', display: 'szkolnictwo wyższe' },
  ],
};

/**
 * Wyszukaj ustawę w ISAP API
 */
async function searchAct(searchName: string, category: string): Promise<ActInfo | null> {
  console.log(`\n🔍 Szukam: "${searchName}" [${category}]`);

  try {
    const url = new URL(`${ELI_API_BASE}/acts/search`);
    url.searchParams.set('title', searchName);
    url.searchParams.set('inForce', '1'); // Tylko obowiązujące
    url.searchParams.set('limit', '10');
    url.searchParams.set('sortBy', 'change');
    url.searchParams.set('sortDir', 'desc');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Research/1.0)',
      },
    });

    if (!response.ok) {
      console.log(`   ❌ HTTP Error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(`   ❌ Brak wyników`);
      return null;
    }

    // Ranking: preferuj teksty jednolite i najnowsze
    const scored = data.items.map((act: any) => {
      let score = 0;

      // Status "jednolity" = +50
      if (act.status?.toLowerCase().includes('jednolity')) score += 50;
      if (act.type?.toLowerCase().includes('jednolity')) score += 30;

      // Ma PDF lub HTML = +10
      if (act.textPDF || act.textHTML) score += 10;

      // Obowiązujący = +20
      if (act.inForce === '1') score += 20;

      // Nowszy = lepszy (bonus za rok)
      const changeYear = act.changeDate ? parseInt(act.changeDate.substring(0, 4)) : 2000;
      score += Math.max(0, (changeYear - 2000) / 10);

      return { act, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0].act;

    console.log(`   ✅ Znaleziono: ${best.title}`);
    console.log(`      ${best.displayAddress} | Status: ${best.status || 'N/A'}`);
    console.log(`      Score: ${scored[0].score.toFixed(2)} | Publisher: ${best.publisher}/${best.year}/${best.pos}`);

    return {
      searchName,
      displayName: searchName,
      publisher: best.publisher,
      year: best.year,
      position: best.pos,
      title: best.title,
      status: best.status || 'N/A',
      category,
    };

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

/**
 * Główna funkcja researchu
 */
async function main() {
  console.log('🔬 RESEARCH: TOP 100 AKTÓW PRAWNYCH');
  console.log('='.repeat(80));
  console.log('');

  const results: ActInfo[] = [];
  let totalSearched = 0;
  let totalFound = 0;

  for (const [category, acts] of Object.entries(TOP_ACTS)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📂 KATEGORIA: ${category}`);
    console.log('='.repeat(80));

    for (const act of acts) {
      totalSearched++;
      const result = await searchAct(act.search, category);

      if (result) {
        results.push(result);
        totalFound++;
      }

      // Rate limiting - 1 sekunda między zapytaniami
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Generuj kod TypeScript
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('📊 PODSUMOWANIE');
  console.log('='.repeat(80));
  console.log(`Wyszukano: ${totalSearched} ustaw`);
  console.log(`Znaleziono: ${totalFound} ustaw (${((totalFound/totalSearched)*100).toFixed(1)}%)`);
  console.log('');

  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('📝 WYGENEROWANY KOD TypeScript (ACT_CODES)');
  console.log('='.repeat(80));
  console.log('');

  // Grupuj po kategorii
  const byCategory: Record<string, ActInfo[]> = {};
  for (const result of results) {
    if (!byCategory[result.category]) {
      byCategory[result.category] = [];
    }
    byCategory[result.category].push(result);
  }

  console.log('// AUTO-GENERATED: Research script output');
  console.log('// Generated:', new Date().toISOString());
  console.log('');
  console.log('private ACT_CODES: Record<string, { publisher: string; year: number; position: number; title: string }> = {');

  for (const [category, acts] of Object.entries(byCategory)) {
    console.log(`  // ${category.replace(/_/g, ' ')} (${acts.length})`);

    for (const act of acts) {
      const normalizedKey = act.searchName.toLowerCase();
      console.log(`  '${normalizedKey}': { publisher: '${act.publisher}', year: ${act.year}, position: ${act.position}, title: '${act.title}' },`);
    }

    console.log('');
  }

  console.log('};');
  console.log('');

  // Zapisz wyniki do pliku JSON
  const outputFile = '/tmp/top100-acts-research.json';
  try {
    await Deno.writeTextFile(outputFile, JSON.stringify(results, null, 2));
    console.log(`\n✅ Wyniki zapisane do: ${outputFile}`);
  } catch (error) {
    console.log(`\n❌ Błąd zapisu: ${error.message}`);
  }

  console.log('\n✅ Research zakończony!');
}

// Uruchom
await main();
