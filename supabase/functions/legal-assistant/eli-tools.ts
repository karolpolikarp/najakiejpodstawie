/**
 * ELI MCP Integration
 * Helper functions for calling the ELI MCP server to fetch legal article content
 */

const ELI_MCP_URL = Deno.env.get('ELI_MCP_URL') || 'http://localhost:8080';
const ELI_API_KEY = Deno.env.get('ELI_API_KEY') || 'dev-secret-key';

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
 * Fetch article content from ELI MCP server
 */
export async function fetchArticle(
  actCode: string,
  articleNumber: string
): Promise<ArticleResponse> {
  try {
    console.log(`[ELI] Fetching article: ${actCode} ${articleNumber}`);

    const response = await fetch(`${ELI_MCP_URL}/tools/get_article`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ELI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actCode,
        articleNumber,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ELI] API error: ${response.status} ${errorText}`);
      return {
        success: false,
        error: `Błąd API: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log(`[ELI] Successfully fetched article ${actCode} ${articleNumber}`);

    return data;
  } catch (error) {
    console.error('[ELI] Error fetching article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
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

/**
 * Main function to detect and fetch articles from user message
 */
export async function enrichWithArticles(message: string): Promise<string> {
  const references = detectArticleReferences(message);

  if (references.length === 0) {
    return '';
  }

  // Fetch all articles in parallel (max 5 to avoid overloading)
  const limitedReferences = references.slice(0, 5);
  const articlePromises = limitedReferences.map(ref =>
    fetchArticle(ref.actCode, ref.articleNumber)
  );

  const articles = await Promise.all(articlePromises);

  return formatArticleContext(articles);
}
