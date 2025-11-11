/**
 * ELI API Client
 * Wrapper dla api.sejm.gov.pl/eli zgodny z OpenAPI spec
 */

const ELI_API_BASE = 'https://api.sejm.gov.pl/eli';

export interface ELISearchParams {
  title?: string;
  publisher?: string; // DU, MP
  year?: number;
  position?: number;
  inForce?: string; // '1' for only active documents
  keyword?: string; // comma-separated
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ELIAct {
  ELI: string;
  address: string;
  publisher: string;
  year: number;
  volume: number;
  pos: number;
  title: string;
  displayAddress: string;
  type?: string;
  status?: string;
  textHTML?: boolean;
  textPDF?: boolean;
  changeDate?: string;
  inForce?: string;
}

export interface ELISearchResponse {
  items: ELIAct[];
  offset: number;
  count: number;
  totalCount: number;
}

/**
 * Simple in-memory cache
 */
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private ttl: number;

  constructor(ttlSeconds: number = 3600) {
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl,
    });
  }
}

export class ELIClient {
  private cache: SimpleCache;
  private lastRequestTime: number = 0;
  private readonly minRequestInterval = 500; // 500ms between requests (increased for Sejm API rate limiting)

  constructor(cacheTTL: number = 3600) {
    this.cache = new SimpleCache(cacheTTL);
  }

  /**
   * Rate limiting: Wait before making a request
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      console.log(`[ELI] Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Retry logic with exponential backoff for 403/429 errors
   * Uses 2s, 4s, 8s, 16s backoff strategy (4 retries = 5 total attempts)
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 4
  ): Promise<Response> {
    await this.rateLimit();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // If success, return immediately
        if (response.ok) {
          return response;
        }

        // If 403/429, retry with backoff (2s, 4s, 8s, 16s)
        if ((response.status === 403 || response.status === 429) && attempt < maxRetries) {
          const backoffDelay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s, 16s
          console.log(`[ELI] Got ${response.status}, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }

        // For other errors, return immediately
        return response;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        const backoffDelay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s, 16s
        console.log(`[ELI] Network error, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Search for acts in the ELI database
   */
  async searchActs(params: ELISearchParams): Promise<ELISearchResponse> {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const url = new URL(`${ELI_API_BASE}/acts/search`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    console.log(`[ELI] Searching: ${url.toString()}`);

    const response = await this.fetchWithRetry(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://eli.sejm.gov.pl/',
        'Origin': 'https://eli.sejm.gov.pl',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ELI] API Error ${response.status}: ${errorBody}`);
      throw new Error(
        `ELI API error: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    const data = await response.json();
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get details of a specific act
   */
  async getActDetails(
    publisher: string,
    year: number,
    position: number,
  ): Promise<ELIAct> {
    const cacheKey = `act:${publisher}/${year}/${position}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const url = `${ELI_API_BASE}/acts/${publisher}/${year}/${position}`;
    console.log(`[ELI] Getting act: ${url}`);

    const response = await this.fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://eli.sejm.gov.pl/',
        'Origin': 'https://eli.sejm.gov.pl',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ELI] API Error ${response.status}: ${errorBody}`);
      throw new Error(
        `ELI API error: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    const data = await response.json();
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get HTML text of an act
   */
  async getActHTML(
    publisher: string,
    year: number,
    position: number,
  ): Promise<string> {
    const cacheKey = `html:${publisher}/${year}/${position}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const url =
      `${ELI_API_BASE}/acts/${publisher}/${year}/${position}/text.html`;
    console.log(`[ELI] Getting HTML: ${url}`);

    const response = await this.fetchWithRetry(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://eli.sejm.gov.pl/',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ELI] API Error ${response.status}: ${errorBody}`);
      throw new Error(
        `ELI API error: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    const html = await response.text();
    this.cache.set(cacheKey, html);
    return html;
  }

  /**
   * Get PDF text of an act
   */
  async getActPDF(
    publisher: string,
    year: number,
    position: number,
  ): Promise<ArrayBuffer> {
    const cacheKey = `pdf:${publisher}/${year}/${position}`;
    const cached = this.cache.get(cacheKey);
    // Return a copy of the cached buffer to prevent detached ArrayBuffer errors
    if (cached) return cached.slice(0);

    const url =
      `${ELI_API_BASE}/acts/${publisher}/${year}/${position}/text.pdf`;
    console.log(`[ELI] Getting PDF: ${url}`);

    const response = await this.fetchWithRetry(url, {
      headers: {
        'Accept': 'application/pdf,application/octet-stream,*/*;q=0.9',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://eli.sejm.gov.pl/',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ELI] API Error ${response.status}: ${errorBody}`);
      throw new Error(
        `ELI API error: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    const pdf = await response.arrayBuffer();
    this.cache.set(cacheKey, pdf);
    // Return a copy of the buffer to prevent detached ArrayBuffer errors
    return pdf.slice(0);
  }

  /**
   * Get act structure (table of contents)
   */
  async getActStructure(
    publisher: string,
    year: number,
    position: number,
  ): Promise<any> {
    const url = `${ELI_API_BASE}/acts/${publisher}/${year}/${position}/struct`;
    console.log(`[ELI] Getting structure: ${url}`);

    const response = await this.fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://eli.sejm.gov.pl/',
        'Origin': 'https://eli.sejm.gov.pl',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ELI] API Error ${response.status}: ${errorBody}`);
      throw new Error(
        `ELI API error: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    return await response.json();
  }
}
