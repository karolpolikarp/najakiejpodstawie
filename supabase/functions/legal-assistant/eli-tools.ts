/**
 * ELI MCP Integration
 * Helper functions for calling the ELI MCP server to fetch legal article content
 */

const ELI_MCP_URL = Deno.env.get('ELI_MCP_URL') || 'http://localhost:8080';
const ELI_API_KEY = Deno.env.get('ELI_API_KEY') || 'dev-secret-key';

// Configuration for MCP calls
const MCP_TIMEOUT_MS = 10000; // 10 seconds
const MCP_MAX_RETRIES = 3;
const MCP_RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s
const MAX_ARTICLES_FROM_TOPICS = 5; // Limit articles from auto-detected topics
const MAX_TOTAL_ARTICLES = 10; // Total limit (query + topics combined)

// Mapping of common legal code abbreviations
const ACT_CODE_PATTERNS: Record<string, string[]> = {
  'kc': ['kc', 'kodeks cywilny', 'kodeksie cywilnym', 'k.c.'],
  'kp': ['kp', 'kodeks pracy', 'kodeksie pracy', 'k.p.'],
  'kk': ['kk', 'kodeks karny', 'kodeksie karnym', 'k.k.'],
  'kpk': ['kpk', 'kodeks postępowania karnego', 'k.p.k.'],
  'kpc': ['kpc', 'kodeks postępowania cywilnego', 'k.p.c.'],
  'konstytucja': ['konstytucj', 'konstytucji'],
};

export interface ArticleRequest {
  actCode: string;
  articleNumber: string;
}

export interface ArticleResponse {
  success: boolean;
  act?: {
    title: string;
    displayAddress: string;
    eli: string;
  };
  article?: {
    number: string;
    text: string;
  };
  isapLink?: string;
  error?: string;
}

// Supported act codes that can be fetched from ELI MCP server
// Updated: November 2025 - dodano PZP, KSH, KKS, OP, PB i ustawę o prawach konsumenta
const SUPPORTED_ACT_CODES = [
  'kc', 'kp', 'kk', 'kpk', 'kpc', 'konstytucja',
  'kks', 'ksh', 'pzp', 'op', 'pb',
  'ordynacja podatkowa', 'prawo budowlane',
  'prawo zamówień publicznych', 'prawo zamowien publicznych',
  'ustawa o prawach konsumenta', 'prawa konsumenta',
  'kodeks karny skarbowy', 'kodeks spółek handlowych'
];

// Known but unsupported act codes (przykłady - większość ustaw jest teraz wspierana)
const UNSUPPORTED_ACT_INFO: Record<string, string> = {
  // Dodaj tutaj inne ustawy w przyszłości
};

/**
 * Detect article references in user message
 * Examples: "art 10 kp", "artykuł 533 kc", "art. 148 kodeks karny"
 */
export function detectArticleReferences(message: string): ArticleRequest[] {
  const lowerMessage = message.toLowerCase();
  const references: ArticleRequest[] = [];

  // Pattern 1: "art 10 kp", "art. 10 kp", "artykuł 10 kp"
  // Extended to include PZP, OP, PB and other codes
  const pattern1 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+(kc|kp|kk|kpk|kpc|pzp|ksh|kks|op|pb|k\.?c\.?|k\.?p\.?|k\.?k\.?|k\.?p\.?k\.?|k\.?p\.?c\.?|k\.?s\.?h\.?|k\.?k\.?s\.?)/gi;
  let match;
  while ((match = pattern1.exec(message)) !== null) {
    const articleNumber = match[1];
    const codeAbbr = match[2].toLowerCase().replace(/\./g, '');

    // Map abbreviation to standard code
    let actCode = codeAbbr;
    if (codeAbbr === 'kc' || codeAbbr === 'kc') actCode = 'kc';
    else if (codeAbbr === 'kp' || codeAbbr === 'kp') actCode = 'kp';
    else if (codeAbbr === 'kk' || codeAbbr === 'kk') actCode = 'kk';
    else if (codeAbbr === 'kpk' || codeAbbr === 'kpk') actCode = 'kpk';
    else if (codeAbbr === 'kpc' || codeAbbr === 'kpc') actCode = 'kpc';
    else if (codeAbbr === 'pzp') actCode = 'pzp';
    else if (codeAbbr === 'ksh') actCode = 'ksh';
    else if (codeAbbr === 'kks') actCode = 'kks';
    else if (codeAbbr === 'op') actCode = 'op';
    else if (codeAbbr === 'pb') actCode = 'pb';

    references.push({ actCode, articleNumber });
  }

  // Pattern 2: "art 10 kodeks pracy", "artykuł 533 kodeksu cywilnego"
  const pattern2 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+(?:kodeks|kodeksu|kodeksie)\s+(pracy|cywilny|cywilnego|cywilnym|karny|karnego|karnym|karny skarbowy|karnego skarbowego|spółek handlowych|spolek handlowych)/gi;
  while ((match = pattern2.exec(message)) !== null) {
    const articleNumber = match[1];
    const codeName = match[2].toLowerCase();

    let actCode = '';
    if (codeName.startsWith('prac')) actCode = 'kp';
    else if (codeName.startsWith('cywil')) actCode = 'kc';
    else if (codeName.startsWith('karny skarbowy') || codeName.startsWith('karnego skarbowego')) actCode = 'kks';
    else if (codeName.startsWith('kar')) actCode = 'kk';
    else if (codeName.startsWith('spółek') || codeName.startsWith('spolek')) actCode = 'ksh';

    if (actCode) {
      references.push({ actCode, articleNumber });
    }
  }

  // Pattern 3: "art 10 konstytucji"
  const pattern3 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+konstytucj/gi;
  while ((match = pattern3.exec(message)) !== null) {
    const articleNumber = match[1];
    references.push({ actCode: 'konstytucja', articleNumber });
  }

  // Pattern 4: "art 10 pzp", "art 15 ordynacji podatkowej", "art 20 prawa budowlanego"
  const pattern4 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+(?:pzp|(?:praw[ao]|ustawy)\s+(?:zamówień publicznych|zamowien publicznych|budowlane|budowlanego)|ordynacj[iae] podatkow[aje]|praw konsumenta)/gi;
  while ((match = pattern4.exec(message)) !== null) {
    const articleNumber = match[1];
    const fullMatch = match[0].toLowerCase();

    let actCode = '';
    if (fullMatch.includes('zamówień') || fullMatch.includes('zamowien') || fullMatch.includes('pzp')) actCode = 'pzp';
    else if (fullMatch.includes('ordynacj')) actCode = 'op';
    else if (fullMatch.includes('budowlan')) actCode = 'pb';
    else if (fullMatch.includes('konsumenta')) actCode = 'prawa konsumenta';

    if (actCode) {
      references.push({ actCode, articleNumber });
    }
  }

  console.log(`[ELI] Detected ${references.length} article references:`, references);

  return references;
}

/**
 * Helper function to add timeout to fetch
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Helper function to wait/delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate article response content
 */
function validateArticleContent(data: ArticleResponse): { valid: boolean; reason?: string } {
  if (!data.success) {
    return { valid: false, reason: 'API returned success=false' };
  }

  if (!data.article || !data.article.text) {
    return { valid: false, reason: 'Missing article text' };
  }

  const text = data.article.text.trim();

  // Check minimum length (should be at least 50 characters for a valid article)
  if (text.length < 50) {
    return { valid: false, reason: `Article text too short (${text.length} chars)` };
  }

  // Check if it looks like an article (contains "Art.", "Artykuł", "art" or the article number)
  const lowerText = text.toLowerCase();
  const hasArticleMarker =
    text.includes('Art.') ||
    lowerText.includes('art.') ||
    lowerText.includes('artykuł') ||
    lowerText.includes('art ') ||
    text.includes(data.article.number);

  if (!hasArticleMarker) {
    return { valid: false, reason: 'Text does not appear to be a legal article' };
  }

  return { valid: true };
}

/**
 * Fetch article content from ELI MCP server with retry logic
 */
export async function fetchArticle(
  actCode: string,
  articleNumber: string,
  retryCount = 0
): Promise<ArticleResponse> {
  // Check if the act code is supported by ELI MCP
  if (!SUPPORTED_ACT_CODES.includes(actCode)) {
    const actName = UNSUPPORTED_ACT_INFO[actCode] || actCode.toUpperCase();
    return {
      success: false,
      error: `Ustawa "${actName}" nie jest obecnie wspierana przez system ELI MCP. Wspierane: ${SUPPORTED_ACT_CODES.join(', ')}`,
    };
  }

  try {
    console.log(`[ELI] Fetching article (attempt ${retryCount + 1}/${MCP_MAX_RETRIES}): ${actCode} ${articleNumber}`);

    const response = await fetchWithTimeout(
      `${ELI_MCP_URL}/tools/get_article`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ELI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actCode,
          articleNumber,
        }),
      },
      MCP_TIMEOUT_MS
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ELI] API error: ${response.status} ${errorText}`);

      // Retry on 5xx errors (server errors)
      if (response.status >= 500 && retryCount < MCP_MAX_RETRIES - 1) {
        const delayMs = MCP_RETRY_DELAYS[retryCount];
        console.log(`[ELI] Retrying after ${delayMs}ms due to server error...`);
        await delay(delayMs);
        return fetchArticle(actCode, articleNumber, retryCount + 1);
      }

      return {
        success: false,
        error: `Błąd API: ${response.status}`,
      };
    }

    const data = await response.json();

    // Validate the response content
    const validation = validateArticleContent(data);
    if (!validation.valid) {
      console.warn(`[ELI] Invalid article content: ${validation.reason}`);

      // Retry on validation failure
      if (retryCount < MCP_MAX_RETRIES - 1) {
        const delayMs = MCP_RETRY_DELAYS[retryCount];
        console.log(`[ELI] Retrying after ${delayMs}ms due to validation failure...`);
        await delay(delayMs);
        return fetchArticle(actCode, articleNumber, retryCount + 1);
      }

      return {
        success: false,
        error: `Nieprawidłowa odpowiedź: ${validation.reason}`,
      };
    }

    console.log(`[ELI] Successfully fetched and validated article ${actCode} ${articleNumber}`);
    return data;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[ELI] Error fetching article (attempt ${retryCount + 1}):`, errorMessage);

    // Retry on network errors
    if (retryCount < MCP_MAX_RETRIES - 1) {
      const delayMs = MCP_RETRY_DELAYS[retryCount];
      console.log(`[ELI] Retrying after ${delayMs}ms due to error: ${errorMessage}`);
      await delay(delayMs);
      return fetchArticle(actCode, articleNumber, retryCount + 1);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Format article data for inclusion in system prompt
 */
export function formatArticleContext(articles: ArticleResponse[]): string {
  if (articles.length === 0) {
    return '';
  }

  const successfulArticles = articles.filter(a => a.success);
  if (successfulArticles.length === 0) {
    return '';
  }

  let context = '\n\n📜 AKTUALNE TREŚCI ARTYKUŁÓW Z OFICJALNYCH TEKSTÓW JEDNOLITYCH:\n';
  context += '(Wykorzystaj te dokładne treści w swojej odpowiedzi)\n\n';

  for (const article of successfulArticles) {
    if (!article.article || !article.act) continue;

    context += `**${article.act.title}**\n`;
    context += `Adres: ${article.act.displayAddress}\n\n`;
    context += `${article.article.text}\n\n`;
    context += `Źródło: ${article.isapLink}\n`;
    context += '---\n\n';
  }

  return context;
}

export interface EnrichmentResult {
  context: string;
  hasArticles: boolean;
  successCount: number;
  failureCount: number;
  warnings: string[];
}

/**
 * Main function to detect and fetch articles from user message
 * Also accepts additional articles from detected legal topics
 * Returns enrichment result with context and status information
 *
 * PRIORITIZATION:
 * - Articles from user query (explicitly asked) have HIGHEST priority (no limit)
 * - Articles from topics are limited to MAX_ARTICLES_FROM_TOPICS
 * - Total limit is MAX_TOTAL_ARTICLES
 */
export async function enrichWithArticles(
  message: string,
  additionalArticles: ArticleRequest[] = []
): Promise<EnrichmentResult> {
  // 1. Articles from user query (regex detection: "art 10 kp")
  const fromQuery = detectArticleReferences(message);

  // 2. Articles from legal topics (e.g., "obrona konieczna" → Art. 25 kk)
  const fromTopics = additionalArticles;

  // 3. Smart merge with prioritization and deduplication
  const seen = new Set<string>();
  const prioritizedReferences: ArticleRequest[] = [];

  // FIRST: Add all articles from user query (HIGHEST priority, no limit)
  for (const article of fromQuery) {
    const key = `${article.actCode}:${article.articleNumber}`;
    if (!seen.has(key)) {
      seen.add(key);
      prioritizedReferences.push(article);
    }
  }

  const fromQueryCount = prioritizedReferences.length;

  // SECOND: Add articles from topics (limited to MAX_ARTICLES_FROM_TOPICS)
  let topicsAdded = 0;
  for (const article of fromTopics) {
    if (topicsAdded >= MAX_ARTICLES_FROM_TOPICS) {
      break; // Limit reached
    }

    const key = `${article.actCode}:${article.articleNumber}`;
    if (!seen.has(key)) {
      seen.add(key);
      prioritizedReferences.push(article);
      topicsAdded++;
    }
  }

  // 4. Apply total limit (safety cap)
  const limitedReferences = prioritizedReferences.slice(0, MAX_TOTAL_ARTICLES);
  const totalSkipped = prioritizedReferences.length - limitedReferences.length;

  console.log(
    `[ELI] Prioritization: ${fromQueryCount} from query (unlimited), ` +
    `${topicsAdded} from topics (max ${MAX_ARTICLES_FROM_TOPICS}), ` +
    `${limitedReferences.length} total (max ${MAX_TOTAL_ARTICLES})`
  );

  if (limitedReferences.length === 0) {
    return {
      context: '',
      hasArticles: false,
      successCount: 0,
      failureCount: 0,
      warnings: [],
    };
  }

  // 5. Fetch all prioritized articles in parallel
  console.log(`[ELI] Fetching ${limitedReferences.length} article(s)...`);
  const articlePromises = limitedReferences.map(ref =>
    fetchArticle(ref.actCode, ref.articleNumber)
  );

  const articles = await Promise.all(articlePromises);

  // 6. Analyze results
  const successfulArticles = articles.filter(a => a.success);
  const failedArticles = articles.filter(a => !a.success);

  const successCount = successfulArticles.length;
  const failureCount = failedArticles.length;

  console.log(`[ELI] Results: ${successCount} successful, ${failureCount} failed`);

  // 7. Build warnings
  const warnings: string[] = [];

  if (failureCount > 0) {
    // Separate unsupported acts from other failures
    const unsupportedArticles = articles.filter(
      a => !a.success && a.error?.includes('nie jest obecnie wspierana')
    );
    const otherFailedArticles = articles.filter(
      a => !a.success && !a.error?.includes('nie jest obecnie wspierana')
    );

    // Warning for unsupported acts
    if (unsupportedArticles.length > 0) {
      const unsupportedRefs = limitedReferences
        .filter((_, i) => {
          const article = articles[i];
          return !article.success && article.error?.includes('nie jest obecnie wspierana');
        })
        .map(ref => `${ref.actCode.toUpperCase()} art. ${ref.articleNumber}`)
        .join(', ');

      warnings.push(
        `⚠️ **NIEWSPIERANA USTAWA**: Artykuły ${unsupportedRefs} - System MCP nie wspiera jeszcze tej ustawy. ` +
        `Odpowiedź poniżej opiera się na wiedzy AI i może być nieaktualna. ` +
        `Zweryfikuj na https://isap.sejm.gov.pl`
      );
    }

    // Warning for other failures
    if (otherFailedArticles.length > 0) {
      const failedRefs = limitedReferences
        .filter((_, i) => {
          const article = articles[i];
          return !article.success && !article.error?.includes('nie jest obecnie wspierana');
        })
        .map(ref => `${ref.actCode.toUpperCase()} art. ${ref.articleNumber}`)
        .join(', ');

      warnings.push(
        `Nie udało się pobrać treści dla: ${failedRefs}. Odpowiedź może być niepełna.`
      );
    }
  }

  // Warn if we had to skip articles from topics due to limits
  const topicsSkipped = fromTopics.length - topicsAdded;
  if (topicsSkipped > 0) {
    warnings.push(
      `Wykryto ${fromTopics.length} artykułów z tematów, ale pobrano tylko ${topicsAdded} (limit: ${MAX_ARTICLES_FROM_TOPICS}).`
    );
  }

  // Warn if we hit the total limit
  if (totalSkipped > 0) {
    warnings.push(
      `Osiągnięto maksymalny limit ${MAX_TOTAL_ARTICLES} artykułów. Pominięto ${totalSkipped}.`
    );
  }

  const context = formatArticleContext(articles);

  return {
    context,
    hasArticles: successCount > 0,
    successCount,
    failureCount,
    warnings,
  };
}
