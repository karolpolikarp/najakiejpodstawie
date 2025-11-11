/**
 * ELI MCP Integration
 * Helper functions for calling the ELI MCP server to fetch legal article content
 */

import { withRetry, isRetryableError } from '../_shared/retry.ts';
import { eliLogger } from '../_shared/logger.ts';

const ELI_MCP_URL = Deno.env.get('ELI_MCP_URL') || 'http://localhost:8080';
const ELI_API_KEY = Deno.env.get('ELI_API_KEY') || 'dev-secret-key';

// Configuration for MCP calls
const MCP_TIMEOUT_MS = 10000; // 10 seconds
const MCP_MAX_RETRIES = 3;
const MCP_BASE_DELAY_MS = 1000;
// QW4: Moved MAX_ARTICLES to function parameters to support premium limits

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

// REMOVED: Static list of supported acts
// The ELI MCP server now supports ALL ~15,000 acts from ISAP through dynamic search!
// No need for hardcoded whitelist - the MCP server will:
// 1. Check hardcoded map (16 popular acts) - fast
// 2. Check LRU cache (200 acts) - fast
// 3. Search ISAP API dynamically - all remaining acts
//
// This change enables full coverage of Polish legal acts without maintaining a static list.

/**
 * Detect article references in user message
 * Examples: "art 10 kp", "artykuł 533 kc", "art. 148 kodeks karny"
 */
export function detectArticleReferences(message: string): ArticleRequest[] {
  const lowerMessage = message.toLowerCase();
  const references: ArticleRequest[] = [];

  // Pattern 1: "art 10 kp", "art. 10 kp", "artykuł 10 kp", "art 27 upk", "art 13 uodip"
  // Extended to include all popular act codes
  // QW1: Added support for ustęp/paragraf: "art 152 § 1 kp", "art. 152 ust. 1 kp"
  const pattern1 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)(?:\s*(?:§|ust\.|par\.)\s*\d+)?\s+(kc|kp|kk|kpk|kpc|kro|kpa|pzp|ksh|kks|op|pb|upk|prd|uodip|k\.?\s?c\.?|k\.?\s?p\.?|k\.?\s?k\.?|k\.?\s?p\.?\s?k\.?|k\.?\s?p\.?\s?c\.?|k\.?\s?r\.?\s?o\.?|k\.?\s?p\.?\s?a\.?|k\.?\s?s\.?\s?h\.?|k\.?\s?k\.?\s?s\.?)/gi;
  let match;
  while ((match = pattern1.exec(message)) !== null) {
    const articleNumber = match[1];
    const codeAbbr = match[2].toLowerCase().replace(/\./g, '').replace(/\s/g, '');

    // Map abbreviation to standard code (remove duplicate checks)
    let actCode = codeAbbr;
    if (codeAbbr === 'kc') actCode = 'kc';
    else if (codeAbbr === 'kp') actCode = 'kp';
    else if (codeAbbr === 'kk') actCode = 'kk';
    else if (codeAbbr === 'kpk') actCode = 'kpk';
    else if (codeAbbr === 'kpc') actCode = 'kpc';
    else if (codeAbbr === 'kro') actCode = 'kro';
    else if (codeAbbr === 'kpa') actCode = 'kpa';
    else if (codeAbbr === 'pzp') actCode = 'pzp';
    else if (codeAbbr === 'ksh') actCode = 'ksh';
    else if (codeAbbr === 'kks') actCode = 'kks';
    else if (codeAbbr === 'op') actCode = 'op';
    else if (codeAbbr === 'pb') actCode = 'pb';
    else if (codeAbbr === 'upk') actCode = 'upk';
    else if (codeAbbr === 'prd') actCode = 'prd';
    else if (codeAbbr === 'uodip') actCode = 'uodip';

    references.push({ actCode, articleNumber });
  }

  // Pattern 2: "art 10 kodeks pracy", "artykuł 533 kodeksu cywilnego", "art 69 kodeksu postępowania cywilnego"
  const pattern2 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+(?:kodeks|kodeksu|kodeksie)\s+(pracy|cywilny|cywilnego|cywilnym|karny|karnego|karnym|karny skarbowy|karnego skarbowego|karny wykonawczy|karnego wykonawczego|spółek handlowych|spolek handlowych|rodzinny i opiekuńczy|rodzinnego i opiekuńczego|postępowania\s+(?:cywilnego|karnego|administracyjnego)|postepowania\s+(?:cywilnego|karnego|administracyjnego))/gi;
  while ((match = pattern2.exec(message)) !== null) {
    const articleNumber = match[1];
    const codeName = match[2].toLowerCase();

    let actCode = '';
    if (codeName.startsWith('prac')) actCode = 'kp';
    else if (codeName.includes('postępowania cywilnego') || codeName.includes('postepowania cywilnego')) actCode = 'kpc';
    else if (codeName.includes('postępowania karnego') || codeName.includes('postepowania karnego')) actCode = 'kpk';
    else if (codeName.includes('postępowania administracyjnego') || codeName.includes('postepowania administracyjnego')) actCode = 'kpa';
    else if (codeName.includes('rodzinny') || codeName.includes('rodzinnego')) actCode = 'kro';
    else if (codeName.startsWith('cywil')) actCode = 'kc';
    else if (codeName.startsWith('karny skarbowy') || codeName.startsWith('karnego skarbowego')) actCode = 'kks';
    else if (codeName.startsWith('karny wykonawczy') || codeName.startsWith('karnego wykonawczego')) actCode = 'kkw';
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

  // Pattern 4: "art 10 pzp", "art 15 ordynacji podatkowej", "art 20 prawa budowlanego", "art 27 upk"
  const pattern4 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+(?:pzp|prd|upk|uodip|kpa|kro|(?:praw[ao]|ustawy)\s+(?:zamówień publicznych|zamowien publicznych|budowlane|budowlanego|o ruchu drogowym|konsumenta|o dostępie do informacji publicznej)|ordynacj[iae] podatkow[aje]|kodeks(?:ie|u)?\s+(?:postępowania administracyjnego|rodzinny i opiekuńczy|rodzinnego i opiekuńczego))/gi;
  while ((match = pattern4.exec(message)) !== null) {
    const articleNumber = match[1];
    const fullMatch = match[0].toLowerCase();

    let actCode = '';
    if (fullMatch.includes('zamówień') || fullMatch.includes('zamowien') || fullMatch.includes('pzp')) actCode = 'pzp';
    else if (fullMatch.includes('ordynacj')) actCode = 'op';
    else if (fullMatch.includes('budowlan')) actCode = 'pb';
    else if (fullMatch.includes('konsumenta') || fullMatch.includes('upk')) actCode = 'upk';
    else if (fullMatch.includes('ruchu drogowym') || fullMatch.includes('prd')) actCode = 'prd';
    else if (fullMatch.includes('postępowania administracyjnego') || fullMatch.includes('kpa')) actCode = 'kpa';
    else if (fullMatch.includes('rodzinny') || fullMatch.includes('kro')) actCode = 'kro';
    else if (fullMatch.includes('dostępie do informacji') || fullMatch.includes('uodip')) actCode = 'uodip';

    if (actCode) {
      references.push({ actCode, articleNumber });
    }
  }

  // Keep track of already detected article+act combinations to avoid duplicates
  const alreadyDetected = new Set(
    references.map(r => `${r.articleNumber.toLowerCase()}:${r.actCode.toLowerCase()}`)
  );

  // Pattern 5a: "art 10 ustawa z dnia 6 września 2001 r. ..." - z pełną datą
  // Przykłady:
  //   - "art 10 ustawy z dnia 6 września 2001 r. prawo farmaceutyczne"
  //   - "art 5 ustawa z dnia 23 kwietnia 1964 kodeks cywilny"
  const pattern5a = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+ustaw[aąyęe]?\s+z\s+dnia\s+\d{1,2}\s+\w+\s+\d{4}\s+r?\.?\s+(?:o\s+)?([a-ząćęłńóśźż\s-]{5,}?)(?=\s*[.?!,;]|\s*$)/gi;
  while ((match = pattern5a.exec(message)) !== null) {
    const articleNumber = match[1];
    const actName = match[2].trim();
    const key = `${articleNumber.toLowerCase()}:${actName.toLowerCase()}`;

    if (!alreadyDetected.has(key) && actName.length >= 5) {
      eliLogger.debug(`Pattern 5a (ustawa z dnia): Detected "art ${articleNumber} ${actName}"`);
      references.push({ actCode: actName, articleNumber });
      alreadyDetected.add(key);
    }
  }

  // Pattern 5b: "art 10 ustawa o..." - forma bez daty
  // Przykłady: "art 10 ustawy o prawach konsumenta", "art 5 ustawa o rachunkowości"
  const pattern5b = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+ustaw[aąyęe]?\s+o\s+([a-ząćęłńóśźż\s]{5,}?)(?=\s*[.?!,;]|\s*$)/gi;
  while ((match = pattern5b.exec(message)) !== null) {
    const articleNumber = match[1];
    const actName = `${match[2].trim()}`; // Dodajemy "o" z powrotem dla lepszego wyszukiwania
    const key = `${articleNumber.toLowerCase()}:${actName.toLowerCase()}`;

    if (!alreadyDetected.has(key) && actName.length >= 5) {
      eliLogger.debug(`Pattern 5b (ustawa o): Detected "art ${articleNumber} ${actName}"`);
      references.push({ actCode: actName, articleNumber });
      alreadyDetected.add(key);
    }
  }

  // Pattern 5c (FALLBACK): "art 10 [dowolna nazwa aktu]" - dynamiczne wyszukiwanie
  // Ten pattern wykrywa artykuły z dowolnymi nazwami ustaw, które nie zostały wykryte wcześniej
  // Przykłady: "art 10 prawo farmaceutyczne", "art 20 prawo bankowe"
  const pattern5c = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+([a-ząćęłńóśźż\s]{8,}?)(?=\s*[.?!,;]|\s*$)/gi;

  while ((match = pattern5c.exec(message)) !== null) {
    const articleNumber = match[1];
    const actName = match[2].trim();

    // Skip if this is already detected by previous patterns
    const key = `${articleNumber.toLowerCase()}:${actName.toLowerCase()}`;
    if (alreadyDetected.has(key)) {
      continue;
    }

    // Skip very short act names (likely false positives)
    if (actName.length < 8) {
      continue;
    }

    // Skip common false positives (question words, etc.)
    const falsePositives = ['co to jest', 'jak to działa', 'czy mogę', 'gdzie znaleźć', 'kiedy można', 'jak się', 'kto może'];
    if (falsePositives.some(fp => actName.toLowerCase().includes(fp))) {
      continue;
    }

    // Skip if it looks like a phrase ending (probably cut off incorrectly)
    const badEndings = ['i', 'w', 'z', 'na', 'o', 'do', 'po', 'od', 'dla'];
    const lastWord = actName.split(' ').pop()?.toLowerCase() || '';
    if (badEndings.includes(lastWord)) {
      continue;
    }

    eliLogger.debug(`Pattern 5c (dynamic fallback): Detected "art ${articleNumber} ${actName}"`);
    references.push({ actCode: actName, articleNumber });
    alreadyDetected.add(key);
  }

  // Pattern 6: "art 27 prawa konsumenta" (bez "ustawy o")
  // QW5: Obsługuje formy "prawa X" i "prawo X"
  // Przykłady: "art 27 prawa konsumenta", "art 10 prawa pracy", "art 5 prawo budowlane"
  const pattern6 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+praw([ao])\s+([a-ząćęłńóśźż\s]{5,}?)(?=\s*[.?!,;]|\s*$)/gi;

  while ((match = pattern6.exec(message)) !== null) {
    const articleNumber = match[1];
    const prawForm = match[2]; // 'a' lub 'o'
    const actName = match[3].trim();
    const fullActName = `praw${prawForm} ${actName}`;
    const key = `${articleNumber.toLowerCase()}:${fullActName.toLowerCase()}`;

    if (!alreadyDetected.has(key) && actName.length >= 5) {
      eliLogger.debug(`Pattern 6 (praw${prawForm} X): Detected "art ${articleNumber} praw${prawForm} ${actName}"`);
      references.push({ actCode: fullActName, articleNumber });
      alreadyDetected.add(key);
    }
  }

  eliLogger.debug(`Detected ${references.length} article references:`, references);

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

  // Check minimum length (should be at least 20 characters for a valid article)
  // QW2: Reduced from 50 to 20 chars to allow shorter valid articles
  if (text.length < 20) {
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
  articleNumber: string
): Promise<ArticleResponse> {
  // REMOVED: Static check for supported acts
  // The MCP server now has dynamic search capabilities - it will handle all acts!
  // This allows the system to access ALL ~15,000 acts from ISAP, not just hardcoded ones.

  eliLogger.debug(`Fetching article: ${actCode} ${articleNumber}`);

  return await withRetry(
    async () => {
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
        eliLogger.error(`API error: ${response.status} ${errorText}`);

        // Throw error to trigger retry for 5xx
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
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
        eliLogger.warn(`Invalid article content: ${validation.reason}`);
        throw new Error(`Invalid content: ${validation.reason}`);
      }

      eliLogger.debug(`Successfully fetched and validated article ${actCode} ${articleNumber}`);
      return data;
    },
    {
      maxRetries: MCP_MAX_RETRIES,
      baseDelayMs: MCP_BASE_DELAY_MS,
      shouldRetry: (error) => {
        // Retry on network errors and server errors
        return isRetryableError(error) || error.message.includes('Invalid content');
      },
    }
  ).catch((error) => {
    // If all retries failed, return error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    eliLogger.error(`Failed to fetch article after retries:`, errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  });
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
 *
 * QW4: Premium users get higher limits (10 topic articles, 15 total)
 */
export async function enrichWithArticles(
  message: string,
  additionalArticles: ArticleRequest[] = [],
  usePremiumModel = false
): Promise<EnrichmentResult> {
  // QW4: Dynamic limits based on premium status
  const MAX_ARTICLES_FROM_TOPICS = usePremiumModel ? 10 : 5;
  const MAX_TOTAL_ARTICLES = usePremiumModel ? 15 : 10;

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

  eliLogger.debug(
    `Prioritization: ${fromQueryCount} from query (unlimited), ` +
    `${topicsAdded} from topics (max ${MAX_ARTICLES_FROM_TOPICS}), ` +
    `${limitedReferences.length} total (max ${MAX_TOTAL_ARTICLES}) ` +
    `[premium: ${usePremiumModel}]`
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
  eliLogger.debug(`Fetching ${limitedReferences.length} article(s)...`);
  const articlePromises = limitedReferences.map(ref =>
    fetchArticle(ref.actCode, ref.articleNumber)
  );

  const articles = await Promise.all(articlePromises);

  // 6. Analyze results
  const successfulArticles = articles.filter(a => a.success);
  const failedArticles = articles.filter(a => !a.success);

  const successCount = successfulArticles.length;
  const failureCount = failedArticles.length;

  eliLogger.debug(`Results: ${successCount} successful, ${failureCount} failed`);

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
