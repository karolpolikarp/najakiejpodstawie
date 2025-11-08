/**
 * ELI API Integration Module
 * Adaptowane z janisz/sejm-mcp dla Supabase Edge Functions
 *
 * Dokumentacja API: https://api.sejm.gov.pl/eli_pl.html
 */

const ELI_API_BASE = 'https://api.sejm.gov.pl/eli';

// ================== INTERFACES ==================

export interface ELISearchParams {
  // Podstawowe parametry
  title?: string;
  publisher?: string;
  year?: number;
  volume?: number;
  position?: number;
  type?: string;

  // Status i słowa kluczowe
  inForce?: boolean; // POPRAWIONE: było statusInForce
  keyword?: string; // Słowa kluczowe oddzielone przecinkiem

  // Daty wydania
  date?: string; // Format: yyyy-MM-dd
  dateFrom?: string;
  dateTo?: string;

  // Daty wejścia w życie
  dateEffect?: string;
  dateEffectFrom?: string;
  dateEffectTo?: string;

  // Daty publikacji
  pubDate?: string;
  pubDateFrom?: string;
  pubDateTo?: string;

  // Paginacja i sortowanie
  limit?: number;
  offset?: number;
  sortBy?: string; // Kolumna do sortowania
  sortDir?: 'asc' | 'desc'; // Kierunek sortowania
}

export interface ELIAct {
  ELI: string;
  address: string;
  publisher: string;
  year: number;
  pos: number;
  title: string;
  displayAddress: string;
  announcementDate: string;
  promulgation?: string;
  type: string;
  status: string;
  textHTML: boolean;
  textPDF: boolean;
}

export interface ELISearchResult {
  count: number;
  totalCount: number;
  items: ELIAct[];
  offset: number;
}

export interface ELIActDetails extends ELIAct {
  keywords?: string[];
  releasedBy?: string[];
  entryIntoForce?: string;
  inForce?: string;
  references?: {
    [key: string]: Array<{
      id: string;
      art?: string;
      date?: string;
    }>;
  };
}

// ================== CORE API FUNCTIONS ==================

/**
 * Wyszukaj akty prawne w bazie ELI
 * Inspirowane: sejm-mcp/internal/server/eli_tools.go:eliSearchActs
 */
export async function eliSearchActs(
  params: ELISearchParams
): Promise<ELISearchResult> {
  const queryParams = new URLSearchParams();

  // Podstawowe parametry
  if (params.title) queryParams.set('title', params.title);
  if (params.publisher) queryParams.set('publisher', params.publisher);
  if (params.year) queryParams.set('year', params.year.toString());
  if (params.volume) queryParams.set('volume', params.volume.toString());
  if (params.position) queryParams.set('position', params.position.toString());
  if (params.type) queryParams.set('type', params.type);

  // Status i słowa kluczowe (POPRAWIONE!)
  if (params.inForce) queryParams.set('inForce', '1');
  if (params.keyword) queryParams.set('keyword', params.keyword);

  // Daty wydania
  if (params.date) queryParams.set('date', params.date);
  if (params.dateFrom) queryParams.set('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.set('dateTo', params.dateTo);

  // Daty wejścia w życie
  if (params.dateEffect) queryParams.set('dateEffect', params.dateEffect);
  if (params.dateEffectFrom) queryParams.set('dateEffectFrom', params.dateEffectFrom);
  if (params.dateEffectTo) queryParams.set('dateEffectTo', params.dateEffectTo);

  // Daty publikacji
  if (params.pubDate) queryParams.set('pubDate', params.pubDate);
  if (params.pubDateFrom) queryParams.set('pubDateFrom', params.pubDateFrom);
  if (params.pubDateTo) queryParams.set('pubDateTo', params.pubDateTo);

  // Paginacja i sortowanie
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());
  if (params.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params.sortDir) queryParams.set('sortDir', params.sortDir);

  const url = `${ELI_API_BASE}/acts/search?${queryParams}`;
  console.log('🔍 ELI Search:', url);

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`ELI API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ Found ${result.count} acts (total: ${result.totalCount})`);

  return result;
}

/**
 * Pobierz szczegóły konkretnego aktu
 * Inspirowane: sejm-mcp/internal/server/eli_tools.go:eliGetActDetails
 */
export async function eliGetActDetails(
  publisher: string,
  year: number,
  position: number
): Promise<ELIActDetails> {
  const url = `${ELI_API_BASE}/acts/${publisher}/${year}/${position}`;
  console.log('📄 ELI Details:', url);

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`ELI API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Pobierz pełny tekst aktu (HTML lub PDF)
 * Inspirowane: sejm-mcp/internal/server/eli_tools.go:eliGetActText
 *
 * ⚠️ UWAGA: To może być wolne dla PDF! Używaj z rozwagą.
 */
export async function eliGetActText(
  publisher: string,
  year: number,
  position: number,
  format: 'html' | 'pdf' = 'html'
): Promise<string> {
  const url = `${ELI_API_BASE}/acts/${publisher}/${year}/${position}/text.${format}`;
  console.log('📜 ELI Text:', url);

  const response = await fetch(url, {
    headers: {
      'Accept': format === 'html' ? 'text/html' : 'application/pdf'
    },
    // Większy timeout dla tekstów
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    throw new Error(`ELI API error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  console.log(`✅ Retrieved text (${text.length} chars)`);

  return text;
}

/**
 * Pobierz fragment tekstu aktu (tylko dla HTML)
 * Np: /paragraf=2/ustep=1/punkt=3
 */
export async function eliGetActFragment(
  publisher: string,
  year: number,
  position: number,
  fragmentPath: string
): Promise<string> {
  const url = `${ELI_API_BASE}/acts/${publisher}/${year}/${position}/text.html/${fragmentPath}`;
  console.log('✂️ ELI Fragment:', url);

  const response = await fetch(url, {
    headers: { 'Accept': 'text/html' },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`ELI API error: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Pobierz powiązania między aktami (nowelizacje, podstawy prawne, etc)
 * Inspirowane: sejm-mcp/internal/server/eli_tools.go:eliGetActReferences
 */
export async function eliGetActReferences(
  publisher: string,
  year: number,
  position: number
): Promise<any> {
  const url = `${ELI_API_BASE}/acts/${publisher}/${year}/${position}/references`;
  console.log('🔗 ELI References:', url);

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`ELI API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Pobierz strukturę aktu (dla HTML)
 * Przydatne do inteligentnego wybierania fragmentów i pokazywania organizacji aktu
 */
export async function eliGetActStructure(
  publisher: string,
  year: number,
  position: number
): Promise<any> {
  const url = `${ELI_API_BASE}/acts/${publisher}/${year}/${position}/struct`;
  console.log('📋 ELI Structure:', url);

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`ELI API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// ================== SMART HELPER FUNCTIONS ==================

/**
 * HELPER: Smart search - najpierw metadata, potem ewentualnie tekst
 * To jest kluczowa funkcja dla optymalnej wydajności!
 */
export async function smartActSearch(
  query: string,
  options: {
    includeText?: boolean;
    maxResults?: number;
  } = {}
): Promise<Array<{
  act: ELIActDetails;
  text?: string;
  textPreview?: string;
}>> {
  const { includeText = false, maxResults = 5 } = options;

  console.log(`🧠 Smart search: "${query}" (includeText: ${includeText}, max: ${maxResults})`);

  // 1. Wyszukaj po metadanych (szybkie)
  const searchResult = await eliSearchActs({
    title: query,
    publisher: 'DU', // Domyślnie Dziennik Ustaw
    limit: maxResults
  });

  if (searchResult.count === 0) {
    console.log('⚠️ No results found');
    return [];
  }

  // 2. Pobierz szczegóły dla każdego wyniku
  const results = await Promise.all(
    searchResult.items.map(async (item) => {
      const details = await eliGetActDetails(
        item.publisher,
        item.year,
        item.pos
      );

      let text: string | undefined;
      let textPreview: string | undefined;

      // 3. Opcjonalnie pobierz tekst (tylko jeśli HTML!)
      if (includeText && details.textHTML) {
        try {
          const fullText = await eliGetActText(
            item.publisher,
            item.year,
            item.pos,
            'html'
          );

          // Usuń HTML tags dla preview
          const cleanText = fullText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

          // Pełny tekst (ograniczony do 10000 znaków)
          text = fullText.length > 10000
            ? fullText.substring(0, 10000) + '\n\n[...tekst skrócony...]'
            : fullText;

          // Preview (pierwsze 500 znaków)
          textPreview = cleanText.length > 500
            ? cleanText.substring(0, 500) + '...'
            : cleanText;

        } catch (error) {
          console.error('❌ Error fetching text:', error);
          // Nie przeszkadzaj jeśli tekst się nie pobierze
        }
      }

      return { act: details, text, textPreview };
    })
  );

  console.log(`✅ Smart search completed: ${results.length} results`);
  return results;
}

/**
 * Formatuj akt prawny do czytelnej formy dla Claude
 */
export function formatActForPrompt(
  actData: {
    act: ELIActDetails;
    text?: string;
    textPreview?: string;
  }
): string {
  const { act, textPreview } = actData;

  let formatted = `📋 **${act.title}**\n`;
  formatted += `   • Adres: ${act.displayAddress}\n`;
  formatted += `   • Data ogłoszenia: ${act.announcementDate}\n`;
  formatted += `   • Status: ${act.status}\n`;

  if (act.entryIntoForce) {
    formatted += `   • Wejście w życie: ${act.entryIntoForce}\n`;
  }

  if (act.keywords && act.keywords.length > 0) {
    formatted += `   • Słowa kluczowe: ${act.keywords.join(', ')}\n`;
  }

  if (textPreview) {
    formatted += `\n   📄 Fragment tekstu:\n   ${textPreview}\n`;
  }

  formatted += `   🔗 Pełny tekst: https://eli.gov.pl/eli/${act.publisher}/${act.year}/${act.pos}/ogl\n`;

  return formatted;
}

/**
 * Wykryj czy pytanie wymaga dostępu do pełnego tekstu
 */
export function needsFullText(query: string): boolean {
  const fullTextKeywords = [
    'treść',
    'tekst',
    'brzmi',
    'dokładnie',
    'artykuł',
    'art.',
    'paragraf',
    'ustęp',
    'punkt',
    'przepis mówi',
    'co stanowi'
  ];

  const lowerQuery = query.toLowerCase();
  return fullTextKeywords.some(keyword => lowerQuery.includes(keyword));
}
