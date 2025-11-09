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

/**
 * Detect article references in user message
 * Examples: "art 10 kp", "artykuł 533 kc", "art. 148 kodeks karny"
 */
export function detectArticleReferences(message: string): ArticleRequest[] {
  const lowerMessage = message.toLowerCase();
  const references: ArticleRequest[] = [];

  // Pattern 1: "art 10 kp", "art. 10 kp", "artykuł 10 kp"
  const pattern1 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+(kc|kp|kk|kpk|kpc|k\.?c\.?|k\.?p\.?|k\.?k\.?|k\.?p\.?k\.?|k\.?p\.?c\.?)/gi;
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

    references.push({ actCode, articleNumber });
  }

  // Pattern 2: "art 10 kodeks pracy", "artykuł 533 kodeksu cywilnego"
  const pattern2 = /art(?:ykuł|ykul)?\.?\s*(\d+[a-z]?)\s+(?:kodeks|kodeksu|kodeksie)\s+(pracy|cywilny|cywilnego|cywilnym|karny|karnego|karnym)/gi;
  while ((match = pattern2.exec(message)) !== null) {
    const articleNumber = match[1];
    const codeName = match[2].toLowerCase();

    let actCode = '';
    if (codeName.startsWith('prac')) actCode = 'kp';
    else if (codeName.startsWith('cywil')) actCode = 'kc';
    else if (codeName.startsWith('kar')) actCode = 'kk';

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

  // Check if it looks like an article (contains "Art." or the article number)
  const hasArticleMarker = text.includes('Art.') || text.includes(data.article.number);
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
 * Returns enrichment result with context and status information
 */
export async function enrichWithArticles(message: string): Promise<EnrichmentResult> {
  const references = detectArticleReferences(message);

  if (references.length === 0) {
    return {
      context: '',
      hasArticles: false,
      successCount: 0,
      failureCount: 0,
      warnings: [],
    };
  }

  console.log(`[ELI] Attempting to fetch ${references.length} article(s)...`);

  // Fetch all articles in parallel (max 5 to avoid overloading)
  const limitedReferences = references.slice(0, 5);
  const articlePromises = limitedReferences.map(ref =>
    fetchArticle(ref.actCode, ref.articleNumber)
  );

  const articles = await Promise.all(articlePromises);

  // Analyze results
  const successfulArticles = articles.filter(a => a.success);
  const failedArticles = articles.filter(a => !a.success);

  const successCount = successfulArticles.length;
  const failureCount = failedArticles.length;

  console.log(`[ELI] Results: ${successCount} successful, ${failureCount} failed`);

  // Build warnings
  const warnings: string[] = [];

  if (failureCount > 0) {
    const failedRefs = limitedReferences
      .filter((_, i) => !articles[i].success)
      .map(ref => `${ref.actCode.toUpperCase()} art. ${ref.articleNumber}`)
      .join(', ');

    warnings.push(
      `Nie udało się pobrać treści dla: ${failedRefs}. Odpowiedź może być niepełna.`
    );
  }

  if (references.length > 5) {
    warnings.push(
      `Wykryto ${references.length} artykułów, ale pobrano tylko 5 pierwszych.`
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
