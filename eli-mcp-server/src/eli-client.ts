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

  constructor(cacheTTL: number = 3600) {
    this.cache = new SimpleCache(cacheTTL);
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

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NaJakiejPodstawie/1.0)',
        'Accept-Language': 'pl-PL,pl;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(
        `ELI API error: ${response.status} ${response.statusText}`,
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

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NaJakiejPodstawie/1.0)',
        'Accept-Language': 'pl-PL,pl;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(
        `ELI API error: ${response.status} ${response.statusText}`,
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

    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; NaJakiejPodstawie/1.0)',
        'Accept-Language': 'pl-PL,pl;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(
        `ELI API error: ${response.status} ${response.statusText}`,
      );
    }

    const html = await response.text();
    this.cache.set(cacheKey, html);
    return html;
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

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NaJakiejPodstawie/1.0)',
        'Accept-Language': 'pl-PL,pl;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(
        `ELI API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }
}
