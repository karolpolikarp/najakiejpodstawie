/**
 * Act Resolver - Dynamic Act Discovery and Resolution
 *
 * This module handles:
 * - Parsing user queries to extract act names
 * - Normalizing act names (removing prefixes, mapping synonyms)
 * - Fuzzy matching for typos and variations
 * - Caching resolved acts for performance
 * - Searching ISAP API dynamically for unknown acts
 *
 * Architecture:
 * 1. Hardcoded map (16 popular acts) - fastest
 * 2. In-memory cache (200 acts) - fast
 * 3. Dynamic API search - slower but covers all 15k+ acts
 */

import { ELIClient, ELISearchParams, ELIAct } from './eli-client.ts';

/**
 * Resolved act information
 */
export interface ResolvedAct {
  publisher: string;
  year: number;
  position: number;
  title: string;
  source: 'hardcoded' | 'cache' | 'api';
}

/**
 * Cache entry with TTL
 */
interface CachedAct {
  data: ResolvedAct;
  expires: number;
  lastAccess: number;
}

/**
 * Synonyms map - common alternative names for acts
 * This will be expanded based on user analytics
 * Updated: November 2025 - Expanded to 60+ synonyms
 */
const ACT_SYNONYMS: Record<string, string> = {
  // ==================== KODEKSY - POTOCZNE NAZWY ====================
  'kodeks drogowy': 'prawo o ruchu drogowym',
  'k.c.': 'kodeks cywilny',
  'k.p.': 'kodeks pracy',
  'k.k.': 'kodeks karny',
  'k.p.k.': 'kodeks postępowania karnego',
  'k.p.c.': 'kodeks postępowania cywilnego',
  'k.k.s.': 'kodeks karny skarbowy',
  'k.s.h.': 'kodeks spółek handlowych',
  'k.r.o.': 'kodeks rodzinny i opiekuńczy',
  'k.p.a.': 'kodeks postępowania administracyjnego',
  'k.k.w.': 'kodeks karny wykonawczy',
  'prawo pracy': 'kodeks pracy',
  'prawo karne': 'kodeks karny',
  'prawo cywilne': 'kodeks cywilny',

  // ==================== KODEKSY - FORMY DOPEŁNIACZA ====================
  'kodeksu cywilnego': 'kodeks cywilny',
  'kodeksu pracy': 'kodeks pracy',
  'kodeksu karnego': 'kodeks karny',
  'kodeksu postępowania karnego': 'kodeks postępowania karnego',
  'kodeksu postepowania karnego': 'kodeks postępowania karnego',
  'kodeksu postępowania cywilnego': 'kodeks postępowania cywilnego',
  'kodeksu wyborczego': 'kodeks wyborczy',
  'kodeksu postepowania cywilnego': 'kodeks postępowania cywilnego',
  'kodeksu karnego skarbowego': 'kodeks karny skarbowy',
  'kodeksu spółek handlowych': 'kodeks spółek handlowych',
  'kodeksu spolek handlowych': 'kodeks spółek handlowych',
  'kodeksu rodzinnego i opiekuńczego': 'kodeks rodzinny i opiekuńczy',
  'kodeksu postępowania administracyjnego': 'kodeks postępowania administracyjnego',
  'kodeksu karnego wykonawczego': 'kodeks karny wykonawczy',

  // ==================== KONSTYTUCJA ====================
  'konstytucja polski': 'konstytucja rzeczypospolitej polskiej',
  'konstytucja rp': 'konstytucja rzeczypospolitej polskiej',
  'konstytucja polska': 'konstytucja rzeczypospolitej polskiej',

  // ==================== PRAWO PODATKOWE ====================
  'ustawa o pit': 'podatek dochodowy od osób fizycznych',
  'ustawa o cit': 'podatek dochodowy od osób prawnych',
  'ustawa o vat': 'podatek od towarów i usług',
  'podatek vat': 'podatek od towarów i usług',
  'podatek pit': 'podatek dochodowy od osób fizycznych',
  'podatek cit': 'podatek dochodowy od osób prawnych',
  'ordynacja': 'ordynacja podatkowa',

  // ==================== PRAWO GOSPODARCZE ====================
  'ustawa o uokik': 'ochronie konkurencji i konsumentów',
  'ustawa antymonopolowa': 'ochronie konkurencji i konsumentów',
  'krs': 'krajowy rejestr sądowy',
  'rejestr sądowy': 'krajowy rejestr sądowy',
  'ustawa o krs': 'krajowy rejestr sądowy',
  'ustawa o przedsiębiorcach': 'prawo przedsiębiorców',
  'działalność gospodarcza': 'prawo przedsiębiorców',
  'upadłość': 'prawo upadłościowe',
  'bankructwo': 'prawo upadłościowe',

  // ==================== PRAWO NIERUCHOMOŚCI ====================
  'ustawa o nieruchomościach': 'gospodarka nieruchomościami',
  'nieruchomości': 'gospodarka nieruchomościami',
  'hipoteka': 'księgi wieczyste i hipoteka',
  'księgi': 'księgi wieczyste i hipoteka',
  'planowanie przestrzenne': 'planowanie i zagospodarowanie przestrzenne',
  'mpzp': 'planowanie i zagospodarowanie przestrzenne',
  'budowlanego': 'budowlane',
  'prawo budowlane': 'budowlane',
  'lokale': 'własność lokali',

  // ==================== PRAWO SAMORZĄDOWE ====================
  'gmina': 'samorząd gminny',
  'powiat': 'samorząd powiatowy',
  'województwo': 'samorząd województwa',
  'samorząd terytorialny': 'samorząd gminny',

  // ==================== PRAWO CYWILNE I OBRÓT ====================
  'zamówienia publiczne': 'prawo zamówień publicznych',
  'zamowien publicznych': 'zamówień publicznych',
  'przetargi': 'prawo zamówień publicznych',
  'konsument': 'prawa konsumenta',
  'ochrona konsumentów': 'prawa konsumenta',
  'notariusz': 'prawo o notariacie',
  'notariusze': 'prawo o notariacie',
  'rodo': 'ochrona danych osobowych',
  'rodo polska': 'ochrona danych osobowych',
  'dane osobowe': 'ochrona danych osobowych',
  'ochrona danych': 'ochrona danych osobowych',
  'dostęp do informacji publicznej': 'o dostępie do informacji publicznej',
  'informacja publiczna': 'o dostępie do informacji publicznej',
  'dostępie do informacji': 'o dostępie do informacji publicznej',

  // ==================== PRAWO KOMUNIKACYJNE ====================
  'ruchu drogowego': 'ruchu drogowym',
  'ruch drogowy': 'ruchu drogowym',
  'karta pojazdu': 'ruchu drogowym',
  'prawo drogowe': 'ruchu drogowym',
  'prawa o ruchu drogowym': 'ruchu drogowym',
  'prawo o kierowcach': 'kierujący pojazdami',
  'kierowcy': 'kierujący pojazdami',
  'ubezpieczenie oc': 'ubezpieczenia obowiązkowe',
  'oc auto': 'ubezpieczenia obowiązkowe',
  'oc pojazdu': 'ubezpieczenia obowiązkowe',

  // ==================== PRAWO LOTNICZE ====================
  'prawa lotniczego': 'prawo lotnicze',
  'lotnictwo': 'prawo lotnicze',
  'lotnicze': 'prawo lotnicze',

  // ==================== PRAWO GOSPODARCZE - FORMY DOPEŁNIACZA ====================
  'prawa bankowego': 'prawo bankowe',
  'ustawy prawo bankowe': 'prawo bankowe',
  'prawa przedsiębiorców': 'prawo przedsiębiorców',
  'prawa zamówień publicznych': 'prawo zamówień publicznych',
  'prawa upadłościowego': 'prawo upadłościowe',

  // ==================== PRAWO ZDROWOTNE ====================
  'farmaceutyka': 'prawo farmaceutyczne',
  'farmacja': 'prawo farmaceutyczne',
  'apteka': 'prawo farmaceutyczne',
  'apteki': 'prawo farmaceutyczne',
  'prawa farmaceutycznego': 'prawo farmaceutyczne',
  'pacjent': 'prawa pacjenta',
  'pacjenci': 'prawa pacjenta',
  'ochrona pacjenta': 'prawa pacjenta',
  'lekarz': 'zawód lekarza',
  'lekarze': 'zawód lekarza',
  'świadczenia medyczne': 'działalność lecznicza',
  'służba zdrowia': 'działalność lecznicza',

  // ==================== PRAWO OŚWIATOWE ====================
  'szkoła': 'prawo oświatowe',
  'szkolnictwo': 'prawo oświatowe',
  'edukacja': 'prawo oświatowe',
  'prawa oświatowego': 'prawo oświatowe',
  'nauczyciel': 'karta nauczyciela',
  'nauczyciele': 'karta nauczyciela',
  'uniwersytet': 'prawo o szkolnictwie wyższym i nauce',
  'uczelnie': 'prawo o szkolnictwie wyższym i nauce',
  'uczelnia': 'prawo o szkolnictwie wyższym i nauce',

  // ==================== PRAWO PRACY I UBEZPIECZENIA ====================
  'ubezpieczenia społeczne': 'system ubezpieczeń społecznych',
  'składki zus': 'system ubezpieczeń społecznych',
  'minimalna płaca': 'minimalne wynagrodzenie',
  'płaca minimalna': 'minimalne wynagrodzenie',
  'najniższa pensja': 'minimalne wynagrodzenie',

  // ==================== INNE ====================
  'telekomunikacja': 'prawo telekomunikacyjne',
  'internet': 'prawo telekomunikacyjne',
  'prawa telekomunikacyjnego': 'prawo telekomunikacyjne',
  'prasa': 'prawo prasowe',
  'media': 'prawo prasowe',
  'prawa prasowego': 'prawo prasowe',
  'energia': 'prawo energetyczne',
  'energetyka': 'prawo energetyczne',
  'prawa energetycznego': 'prawo energetyczne',

  // ==================== CZĘSTE BŁĘDY I WARIANTY ====================
  'ustawa covidowa': 'covid-19',
  'tarcza antykryzysowa': 'covid-19',
  'ustawa o oze': 'energetyce odnawialnej',
};

/**
 * Act name normalizer and resolver
 */
export class ActResolver {
  private client: ELIClient;
  private cache: Map<string, CachedAct>;
  private readonly maxCacheSize = 200;
  private readonly cacheTTL = 86400000; // 24 hours
  private readonly diskCachePath = '/tmp/eli-act-cache.json';
  private saveTimeoutId: number | null = null; // For debouncing disk writes

  // Monitoring stats
  private stats = {
    hardcodedHits: 0,
    cacheHits: 0,
    apiHits: 0,
    errors: 0,
  };

  constructor(client: ELIClient) {
    this.client = client;
    this.cache = new Map();
    this.loadCacheFromDisk();
  }

  /**
   * Normalize act name for lookup
   * Removes common prefixes, suffixes, and normalizes whitespace
   */
  normalizeActName(actName: string): string {
    let normalized = actName.toLowerCase().trim();

    // Remove common prefixes
    const prefixPatterns = [
      /^ustawa z dnia \d{1,2} \w+ \d{4} r\.?\s*/i,
      /^ustawa\s+/i,
      /^dz\.?u\.?\s*/i,
      /^rozporządzenie\s+/i,
    ];

    for (const pattern of prefixPatterns) {
      normalized = normalized.replace(pattern, '');
    }

    // Remove common suffixes
    const suffixPatterns = [
      /\s*z późniejszymi zmianami$/i,
      /\s*\(tekst jednolity\)$/i,
      /\s*t\.?j\.?$/i,
    ];

    for (const pattern of suffixPatterns) {
      normalized = normalized.replace(pattern, '');
    }

    // Remove dots and extra whitespace
    normalized = normalized
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Apply synonym mapping
    if (ACT_SYNONYMS[normalized]) {
      console.log(`[ActResolver] Synonym mapping: "${normalized}" → "${ACT_SYNONYMS[normalized]}"`);
      normalized = ACT_SYNONYMS[normalized];
    }

    return normalized;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * Used for fuzzy matching
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Calculate similarity score (0-1) between two strings
   */
  private similarityScore(a: string, b: string): number {
    const distance = this.levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Rank search results to find the best match
   * QW7: Added MIN_SIMILARITY threshold to reject poor matches
   */
  private rankSearchResults(
    results: ELIAct[],
    searchQuery: string
  ): { act: ELIAct; score: number } | null {
    if (results.length === 0) return null;

    const normalizedQuery = this.normalizeActName(searchQuery);
    const MIN_SIMILARITY = 0.4; // QW7: Reject matches with similarity < 40%

    const scored = results
      .map(act => {
        let score = 0;
        const normalizedTitle = this.normalizeActName(act.title);
        const rawTitle = act.title.toLowerCase();

        // 1. Exact match = highest priority
        if (normalizedTitle === normalizedQuery) {
          score += 100;
        }

        // 2. Title similarity (fuzzy matching)
        const similarity = this.similarityScore(normalizedTitle, normalizedQuery);

        // QW7: Reject if similarity too low (unless exact substring match)
        if (similarity < MIN_SIMILARITY && !normalizedTitle.includes(normalizedQuery)) {
          return null; // Filter out this result
        }

        score += similarity * 50;

        // 3. Title contains query
        if (normalizedTitle.includes(normalizedQuery)) {
          score += 30;
        }

      // 4. CRITICAL: Identify and penalize amendments (nowelizacje)
      // Amendments contain "o zmianie ustawy..." and only have changes, not full text
      const isAmendment = rawTitle.includes('o zmianie ustawy') ||
                          rawTitle.includes('o zmianie niektórych ustaw');
      if (isAmendment) {
        score -= 200; // HEAVY penalty - amendments don't have full article text
      }

      // 5. Type "jednolity" = consolidated text (PREFERRED for base acts)
      if (act.type?.toLowerCase().includes('jednolity')) {
        score += 100; // Strong preference for consolidated texts
      }

      // 6. Status discrimination:
      // "akt posiada tekst jednolity" = base act with consolidated text (GOOD)
      // "akt objęty tekstem jednolitym" = act superseded by consolidated text (AVOID)
      const status = act.status?.toLowerCase() || '';
      if (status.includes('akt posiada tekst jednolity')) {
        score += 80; // Prefer base acts with consolidated text
      } else if (status.includes('akt objęty tekstem jednolitym')) {
        score -= 50; // Penalize superseded acts
      } else if (status.includes('jednolity')) {
        score += 50; // Generic jednolity status
      }

      // 7. Has PDF or HTML
      if (act.textPDF || act.textHTML) {
        score += 10;
      }

      // 8. Currently in force
      if (act.inForce === '1') {
        score += 20;
      }

      // NOTE: Removed "newer is better" bonus - it was preferring amendments over base acts

      return { act, score };
    })
    .filter((item): item is { act: ELIAct; score: number } => item !== null); // QW7: Remove rejected matches

    // QW7: Return null if all results were filtered out
    if (scored.length === 0) {
      console.log(`[ActResolver] All results rejected (similarity < ${MIN_SIMILARITY})`);
      return null;
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    console.log(`[ActResolver] Top 3 ranked results for "${searchQuery}":`);
    scored.slice(0, 3).forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.act.title} (score: ${item.score.toFixed(2)})`);
      console.log(`     ${item.act.displayAddress} | Status: ${item.act.status || 'N/A'}`);
    });

    return scored[0];
  }

  /**
   * Search for an act dynamically using ISAP API
   */
  private async searchAct(actName: string): Promise<ResolvedAct | null> {
    console.log(`[ActResolver] Searching API for: "${actName}"`);

    try {
      const searchParams: ELISearchParams = {
        title: actName,
        inForce: '1', // Only acts currently in force
        limit: 20,
        // NOTE: sortBy/sortDir removed - they cause 403 errors from Sejm API
        // Ranking is done client-side in rankSearchResults() anyway
      };

      const results = await this.client.searchActs(searchParams);

      console.log(`[ActResolver] API returned ${results.totalCount} total results (showing ${results.count})`);

      if (results.items.length === 0) {
        console.log(`[ActResolver] No results found for "${actName}"`);
        return null;
      }

      // Rank results to find best match
      const best = this.rankSearchResults(results.items, actName);

      if (!best) {
        console.log(`[ActResolver] Could not rank results for "${actName}"`);
        return null;
      }

      console.log(`[ActResolver] Selected: ${best.act.title} (${best.act.displayAddress})`);

      return {
        publisher: best.act.publisher,
        year: best.act.year,
        position: best.act.pos,
        title: best.act.title,
        source: 'api',
      };
    } catch (error) {
      console.error(`[ActResolver] API search error: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Resolve act name to concrete publisher/year/position
   * This is the main entry point
   */
  async resolveAct(actName: string): Promise<ResolvedAct | null> {
    const normalized = this.normalizeActName(actName);
    console.log(`[ActResolver] Resolving: "${actName}" → normalized: "${normalized}"`);

    // Check cache first
    const cached = this.getFromCache(normalized);
    if (cached) {
      console.log(`[ActResolver] ✓ Cache hit: ${cached.title}`);
      this.stats.cacheHits++;
      return cached;
    }

    // Search API
    const resolved = await this.searchAct(normalized);

    if (resolved) {
      this.stats.apiHits++;
      // Cache the result
      this.setCache(normalized, resolved);
      this.saveCacheToDiskAsync();
      return resolved;
    }

    console.log(`[ActResolver] ✗ Could not resolve: "${actName}"`);
    this.stats.errors++;
    return null;
  }

  /**
   * Get from cache if not expired
   */
  private getFromCache(key: string): ResolvedAct | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }

    // Update last access time
    cached.lastAccess = Date.now();
    return cached.data;
  }

  /**
   * Set cache with LRU eviction
   */
  private setCache(key: string, data: ResolvedAct): void {
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      // Find least recently used
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const [k, v] of this.cache.entries()) {
        if (v.lastAccess < oldestTime) {
          oldestTime = v.lastAccess;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        console.log(`[ActResolver] Cache full, evicting: ${oldestKey}`);
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + this.cacheTTL,
      lastAccess: Date.now(),
    });
  }

  /**
   * Load cache from disk (on startup)
   */
  private loadCacheFromDisk(): void {
    try {
      const json = Deno.readTextFileSync(this.diskCachePath);
      const data = JSON.parse(json);

      let loaded = 0;
      for (const [key, value] of Object.entries(data)) {
        const cached = value as CachedAct;
        // Only load non-expired entries
        if (Date.now() < cached.expires) {
          this.cache.set(key, cached);
          loaded++;
        }
      }

      console.log(`[ActResolver] Loaded ${loaded} cached acts from disk`);
    } catch (error) {
      // File doesn't exist or invalid - that's OK
      console.log(`[ActResolver] No disk cache found (${error.message})`);
    }
  }

  /**
   * Save cache to disk (async, non-blocking with proper debouncing)
   */
  private saveCacheToDiskAsync(): void {
    // Clear previous timeout if exists (debouncing)
    if (this.saveTimeoutId !== null) {
      clearTimeout(this.saveTimeoutId);
    }

    // Schedule new save after 5 seconds of inactivity
    this.saveTimeoutId = setTimeout(() => {
      try {
        const data: Record<string, CachedAct> = {};
        for (const [key, value] of this.cache.entries()) {
          data[key] = value;
        }
        Deno.writeTextFileSync(this.diskCachePath, JSON.stringify(data, null, 2));
        console.log(`[ActResolver] Saved ${this.cache.size} cached acts to disk`);
        this.saveTimeoutId = null;
      } catch (error) {
        console.error(`[ActResolver] Failed to save cache: ${error.message}`);
        this.saveTimeoutId = null;
      }
    }, 5000) as unknown as number; // Cast needed for Deno's setTimeout return type
  }

  /**
   * Get monitoring statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
    };
  }

  /**
   * Find similar act names (for "did you mean?" suggestions)
   */
  async findSimilarActs(actName: string, maxResults: number = 5): Promise<string[]> {
    const normalized = this.normalizeActName(actName);

    try {
      const results = await this.client.searchActs({
        title: normalized,
        inForce: '1',
        limit: maxResults * 2,
      });

      return results.items
        .map(act => act.title)
        .filter((title, index, self) => self.indexOf(title) === index) // unique
        .slice(0, maxResults);
    } catch (error) {
      console.error(`[ActResolver] Error finding similar acts: ${error.message}`);
      return [];
    }
  }
}
