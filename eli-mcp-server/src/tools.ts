/**
 * ELI MCP Tools
 * High-level functions for legal research
 */

import { ELIClient, ELISearchParams } from './eli-client.ts';
import { ActResolver, ResolvedAct } from './act-resolver.ts';
// @deno-types="npm:@types/pdfjs-dist@2.10.378"
import * as pdfjsLib from 'npm:pdfjs-dist@4.0.379/legacy/build/pdf.mjs';

// Simple logger for standalone MCP server
const DEBUG = Deno.env.get('DEBUG') === 'true';
const logger = {
  debug: (...args: any[]) => DEBUG && console.log('[ELI]', ...args),
  error: (...args: any[]) => console.error('[ELI]', ...args),
};

export class ELITools {
  private client: ELIClient;
  private actResolver: ActResolver;

  // Mapping of common act codes to their official identifiers
  // IMPORTANT: Always use consolidated texts (teksty jednolite) for current law
  // Updated: November 2025 - Expanded to TOP 50+ acts
  private ACT_CODES: Record<string, { publisher: string; year: number; position: number; title: string }> = {
    // ==================== KODEKSY (12) ====================
    'kc': { publisher: 'DU', year: 2025, position: 1071, title: 'Kodeks cywilny' },
    'kodeks cywilny': { publisher: 'DU', year: 2025, position: 1071, title: 'Kodeks cywilny' },
    'kp': { publisher: 'DU', year: 2025, position: 277, title: 'Kodeks pracy' },
    'kodeks pracy': { publisher: 'DU', year: 2025, position: 277, title: 'Kodeks pracy' },
    'kk': { publisher: 'DU', year: 2025, position: 383, title: 'Kodeks karny' },
    'kodeks karny': { publisher: 'DU', year: 2025, position: 383, title: 'Kodeks karny' },
    'kpk': { publisher: 'DU', year: 2025, position: 46, title: 'Kodeks postępowania karnego' },
    'kodeks postępowania karnego': { publisher: 'DU', year: 2025, position: 46, title: 'Kodeks postępowania karnego' },
    'kpc': { publisher: 'DU', year: 2024, position: 1568, title: 'Kodeks postępowania cywilnego' },
    'kodeks postępowania cywilnego': { publisher: 'DU', year: 2024, position: 1568, title: 'Kodeks postępowania cywilnego' },
    'kks': { publisher: 'DU', year: 2025, position: 633, title: 'Kodeks karny skarbowy' },
    'kodeks karny skarbowy': { publisher: 'DU', year: 2025, position: 633, title: 'Kodeks karny skarbowy' },
    'ksh': { publisher: 'DU', year: 2024, position: 18, title: 'Kodeks spółek handlowych' },
    'kodeks spółek handlowych': { publisher: 'DU', year: 2024, position: 18, title: 'Kodeks spółek handlowych' },
    'kro': { publisher: 'DU', year: 2024, position: 1971, title: 'Kodeks rodzinny i opiekuńczy' },
    'kodeks rodzinny i opiekuńczy': { publisher: 'DU', year: 2024, position: 1971, title: 'Kodeks rodzinny i opiekuńczy' },
    'kpa': { publisher: 'DU', year: 2024, position: 572, title: 'Kodeks postępowania administracyjnego' },
    'kodeks postępowania administracyjnego': { publisher: 'DU', year: 2024, position: 572, title: 'Kodeks postępowania administracyjnego' },
    'kkw': { publisher: 'DU', year: 2024, position: 1547, title: 'Kodeks karny wykonawczy' },
    'kodeks karny wykonawczy': { publisher: 'DU', year: 2024, position: 1547, title: 'Kodeks karny wykonawczy' },
    'kodeks wyborczy': { publisher: 'DU', year: 2023, position: 2408, title: 'Kodeks wyborczy' },

    // ==================== KONSTYTUCJA ====================
    'konstytucja': { publisher: 'DU', year: 1997, position: 483, title: 'Konstytucja Rzeczypospolitej Polskiej' },
    'konstytucja rp': { publisher: 'DU', year: 1997, position: 483, title: 'Konstytucja Rzeczypospolitej Polskiej' },
    'konstytucja rzeczypospolitej polskiej': { publisher: 'DU', year: 1997, position: 483, title: 'Konstytucja Rzeczypospolitej Polskiej' },

    // ==================== PRAWO PODATKOWE (10) ====================
    'pit': { publisher: 'DU', year: 2024, position: 226, title: 'Ustawa o podatku dochodowym od osób fizycznych' },
    'podatek dochodowy od osób fizycznych': { publisher: 'DU', year: 2024, position: 226, title: 'Ustawa o podatku dochodowym od osób fizycznych' },
    'cit': { publisher: 'DU', year: 2023, position: 2805, title: 'Ustawa o podatku dochodowym od osób prawnych' },
    'podatek dochodowy od osób prawnych': { publisher: 'DU', year: 2023, position: 2805, title: 'Ustawa o podatku dochodowym od osób prawnych' },
    'vat': { publisher: 'DU', year: 2024, position: 361, title: 'Ustawa o podatku od towarów i usług' },
    'podatek od towarów i usług': { publisher: 'DU', year: 2024, position: 361, title: 'Ustawa o podatku od towarów i usług' },
    'akcyza': { publisher: 'DU', year: 2023, position: 1542, title: 'Ustawa o podatku akcyzowym' },
    'podatek akcyzowy': { publisher: 'DU', year: 2023, position: 1542, title: 'Ustawa o podatku akcyzowym' },
    'op': { publisher: 'DU', year: 2025, position: 111, title: 'Ordynacja podatkowa' },
    'ordynacja podatkowa': { publisher: 'DU', year: 2025, position: 111, title: 'Ordynacja podatkowa' },

    // ==================== PRAWO GOSPODARCZE (12) ====================
    'prawo przedsiębiorców': { publisher: 'DU', year: 2024, position: 236, title: 'Prawo przedsiębiorców' },
    'krs': { publisher: 'DU', year: 2024, position: 1553, title: 'Ustawa o Krajowym Rejestrze Sądowym' },
    'krajowy rejestr sądowy': { publisher: 'DU', year: 2024, position: 1553, title: 'Ustawa o Krajowym Rejestrze Sądowym' },
    'rachunkowość': { publisher: 'DU', year: 2023, position: 120, title: 'Ustawa o rachunkowości' },
    'ustawa o rachunkowości': { publisher: 'DU', year: 2023, position: 120, title: 'Ustawa o rachunkowości' },
    'prawo upadłościowe': { publisher: 'DU', year: 2022, position: 1520, title: 'Prawo upadłościowe' },
    'uokik': { publisher: 'DU', year: 2024, position: 1616, title: 'Ustawa o ochronie konkurencji i konsumentów' },
    'ochrona konkurencji i konsumentów': { publisher: 'DU', year: 2024, position: 1616, title: 'Ustawa o ochronie konkurencji i konsumentów' },
    'prawo bankowe': { publisher: 'DU', year: 2023, position: 2488, title: 'Prawo bankowe' },

    // ==================== PRAWO NIERUCHOMOŚCI (8) ====================
    'gospodarka nieruchomościami': { publisher: 'DU', year: 2024, position: 1145, title: 'Ustawa o gospodarce nieruchomościami' },
    'księgi wieczyste i hipoteka': { publisher: 'DU', year: 2023, position: 2023, title: 'Ustawa o księgach wieczystych i hipotece' },
    'księgi wieczyste': { publisher: 'DU', year: 2023, position: 2023, title: 'Ustawa o księgach wieczystych i hipotece' },
    'pb': { publisher: 'DU', year: 2025, position: 418, title: 'Prawo budowlane' },
    'prawo budowlane': { publisher: 'DU', year: 2025, position: 418, title: 'Prawo budowlane' },
    'planowanie i zagospodarowanie przestrzenne': { publisher: 'DU', year: 2024, position: 1047, title: 'Ustawa o planowaniu i zagospodarowaniu przestrzennym' },
    'własność lokali': { publisher: 'DU', year: 2024, position: 1222, title: 'Ustawa o własności lokali' },

    // ==================== PRAWO SAMORZĄDOWE (5) ====================
    'samorząd gminny': { publisher: 'DU', year: 2023, position: 40, title: 'Ustawa o samorządzie gminnym' },
    'ustawa o samorządzie gminnym': { publisher: 'DU', year: 2023, position: 40, title: 'Ustawa o samorządzie gminnym' },
    'samorząd powiatowy': { publisher: 'DU', year: 2022, position: 1526, title: 'Ustawa o samorządzie powiatowym' },
    'samorząd województwa': { publisher: 'DU', year: 2024, position: 1723, title: 'Ustawa o samorządzie województwa' },

    // ==================== PRAWO CYWILNE I OBRÓT (8) ====================
    'pzp': { publisher: 'DU', year: 2024, position: 1320, title: 'Prawo zamówień publicznych' },
    'prawo zamówień publicznych': { publisher: 'DU', year: 2024, position: 1320, title: 'Prawo zamówień publicznych' },
    'prawo zamowien publicznych': { publisher: 'DU', year: 2024, position: 1320, title: 'Prawo zamówień publicznych' },
    'ustawa o prawach konsumenta': { publisher: 'DU', year: 2023, position: 2759, title: 'Ustawa o prawach konsumenta' },
    'prawa konsumenta': { publisher: 'DU', year: 2023, position: 2759, title: 'Ustawa o prawach konsumenta' },
    'upk': { publisher: 'DU', year: 2023, position: 2759, title: 'Ustawa o prawach konsumenta' },
    'notariat': { publisher: 'DU', year: 2024, position: 561, title: 'Prawo o notariacie' },
    'prawo o notariacie': { publisher: 'DU', year: 2024, position: 561, title: 'Prawo o notariacie' },
    'rodo polska': { publisher: 'DU', year: 2019, position: 1781, title: 'Ustawa o ochronie danych osobowych' },
    'ochrona danych osobowych': { publisher: 'DU', year: 2019, position: 1781, title: 'Ustawa o ochronie danych osobowych' },

    // ==================== PRAWO KOMUNIKACYJNE (6) ====================
    'prd': { publisher: 'DU', year: 2024, position: 1251, title: 'Prawo o ruchu drogowym' },
    'prawo o ruchu drogowym': { publisher: 'DU', year: 2024, position: 1251, title: 'Prawo o ruchu drogowym' },
    'kodeks drogowy': { publisher: 'DU', year: 2024, position: 1251, title: 'Prawo o ruchu drogowym' },
    'prawo jazdy': { publisher: 'DU', year: 2024, position: 1200, title: 'Ustawa o kierujących pojazdami' },
    'kierujący pojazdami': { publisher: 'DU', year: 2024, position: 1200, title: 'Ustawa o kierujących pojazdami' },
    'oc': { publisher: 'DU', year: 2022, position: 2265, title: 'Ustawa o ubezpieczeniach obowiązkowych, Ubezpieczeniowym Funduszu Gwarancyjnym i Polskim Biurze Ubezpieczycieli Komunikacyjnych' },
    'ubezpieczenia obowiązkowe': { publisher: 'DU', year: 2022, position: 2265, title: 'Ustawa o ubezpieczeniach obowiązkowych, Ubezpieczeniowym Funduszu Gwarancyjnym i Polskim Biurze Ubezpieczycieli Komunikacyjnych' },

    // ==================== PRAWO ZDROWOTNE (6) ====================
    'prawo farmaceutyczne': { publisher: 'DU', year: 2024, position: 686, title: 'Prawo farmaceutyczne' },
    'ustawa farmaceutyczna': { publisher: 'DU', year: 2024, position: 686, title: 'Prawo farmaceutyczne' },
    'prawa pacjenta': { publisher: 'DU', year: 2020, position: 849, title: 'Ustawa o prawach pacjenta i Rzeczniku Praw Pacjenta' },
    'ustawa o prawach pacjenta': { publisher: 'DU', year: 2020, position: 849, title: 'Ustawa o prawach pacjenta i Rzeczniku Praw Pacjenta' },
    'działalność lecznicza': { publisher: 'DU', year: 2024, position: 799, title: 'Ustawa o działalności leczniczej' },
    'zawód lekarza': { publisher: 'DU', year: 2023, position: 1516, title: 'Ustawa o zawodach lekarza i lekarza dentysty' },

    // ==================== PRAWO OŚWIATOWE (4) ====================
    'prawo oświatowe': { publisher: 'DU', year: 2024, position: 737, title: 'Prawo oświatowe' },
    'karta nauczyciela': { publisher: 'DU', year: 2024, position: 986, title: 'Karta Nauczyciela' },
    'szkolnictwo wyższe': { publisher: 'DU', year: 2023, position: 742, title: 'Prawo o szkolnictwie wyższym i nauce' },
    'prawo o szkolnictwie wyższym i nauce': { publisher: 'DU', year: 2023, position: 742, title: 'Prawo o szkolnictwie wyższym i nauce' },

    // ==================== PRAWO PRACY I UBEZPIECZENIA (6) ====================
    'zus': { publisher: 'DU', year: 2024, position: 497, title: 'Ustawa o systemie ubezpieczeń społecznych' },
    'system ubezpieczeń społecznych': { publisher: 'DU', year: 2024, position: 497, title: 'Ustawa o systemie ubezpieczeń społecznych' },
    'minimalne wynagrodzenie': { publisher: 'DU', year: 2023, position: 1667, title: 'Ustawa o minimalnym wynagrodzeniu za pracę' },
    'minimalna płaca': { publisher: 'DU', year: 2023, position: 1667, title: 'Ustawa o minimalnym wynagrodzeniu za pracę' },

    // ==================== PRAWO ADMINISTRACYJNE I DOSTĘP DO INFORMACJI (4) ====================
    'dostęp do informacji publicznej': { publisher: 'DU', year: 2022, position: 902, title: 'Ustawa o dostępie do informacji publicznej' },
    'ustawa o dostępie do informacji publicznej': { publisher: 'DU', year: 2022, position: 902, title: 'Ustawa o dostępie do informacji publicznej' },
    'informacja publiczna': { publisher: 'DU', year: 2022, position: 902, title: 'Ustawa o dostępie do informacji publicznej' },
    'uodip': { publisher: 'DU', year: 2022, position: 902, title: 'Ustawa o dostępie do informacji publicznej' },

    // ==================== INNE WAŻNE (6) ====================
    'prawo telekomunikacyjne': { publisher: 'DU', year: 2023, position: 1800, title: 'Prawo telekomunikacyjne' },
    'prawo prasowe': { publisher: 'DU', year: 2023, position: 838, title: 'Prawo prasowe' },
    'prawo energetyczne': { publisher: 'DU', year: 2024, position: 266, title: 'Prawo energetyczne' },
    'prawo lotnicze': { publisher: 'DU', year: 2023, position: 1319, title: 'Prawo lotnicze' },
    'prawa lotniczego': { publisher: 'DU', year: 2023, position: 1319, title: 'Prawo lotnicze' },
  };

  constructor(client: ELIClient) {
    this.client = client;
    this.actResolver = new ActResolver(client);
  }

  /**
   * Search for acts by keywords
   */
  async searchActs(params: {
    title?: string;
    keyword?: string;
    inForce?: boolean;
    limit?: number;
  }) {
    const searchParams: ELISearchParams = {
      title: params.title,
      keyword: params.keyword,
      inForce: params.inForce ? '1' : undefined,
      limit: params.limit || 10,
      // NOTE: sortBy/sortDir removed - they cause 403 errors from Sejm API
    };

    const result = await this.client.searchActs(searchParams);

    return {
      success: true,
      count: result.count,
      totalCount: result.totalCount,
      acts: result.items.map(act => ({
        eli: act.ELI,
        title: act.title,
        displayAddress: act.displayAddress,
        publisher: act.publisher,
        year: act.year,
        position: act.pos,
        type: act.type,
        status: act.status,
        inForce: act.inForce,
        hasHTML: act.textHTML,
        hasPDF: act.textPDF,
      })),
    };
  }

  /**
   * Helper: Fetch article text from a resolved act
   */
  private async fetchArticleFromAct(
    actInfo: { publisher: string; year: number; position: number; title: string },
    articleNumber: string
  ) {
    try {
      // Get act details
      const act = await this.client.getActDetails(
        actInfo.publisher,
        actInfo.year,
        actInfo.position,
      );

      let articleText: string | null = null;

      // Try to get PDF first (preferred for newer consolidated texts)
      try {
        logger.debug(`Attempting to fetch PDF for ${actInfo.title}...`);
        const pdfBuffer = await this.client.getActPDF(
          actInfo.publisher,
          actInfo.year,
          actInfo.position,
        );
        const pdfText = await this.extractTextFromPDF(pdfBuffer);
        articleText = this.extractArticleFromPDF(pdfText, articleNumber);
      } catch (pdfError) {
        logger.debug(`PDF extraction failed, falling back to HTML: ${pdfError.message}`);
        // Fallback to HTML if PDF fails
        try {
          const html = await this.client.getActHTML(
            actInfo.publisher,
            actInfo.year,
            actInfo.position,
          );
          articleText = this.extractArticleFromHTML(html, articleNumber);
        } catch (htmlError) {
          throw new Error(`Nie można pobrać tekstu (PDF: ${pdfError.message}, HTML: ${htmlError.message})`);
        }
      }

      return {
        success: true,
        act: {
          title: act.title,
          displayAddress: act.displayAddress,
          eli: act.ELI,
        },
        article: {
          number: articleNumber,
          text: articleText || `Artykuł ${articleNumber} nie został znaleziony w tekście.`,
        },
        isapLink: `https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU${actInfo.year}${String(actInfo.position).padStart(7, '0')}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Błąd pobierania artykułu: ${error.message}`,
      };
    }
  }

  /**
   * Get a specific article from an act
   * Now supports both hardcoded acts AND dynamic search for all 15k+ ISAP acts!
   *
   * Examples:
   *   - "art 30 prd" (hardcoded)
   *   - "art 10 kodeksu pracy" (hardcoded)
   *   - "art 5 ustawy o energetyce odnawialnej" (dynamic search!)
   *   - "art 20 prawo bankowe" (dynamic search!)
   */
  async getArticle(params: {
    articleNumber: string;
    actCode: string;
  }) {
    const { articleNumber, actCode } = params;
    const actCodeLower = actCode.toLowerCase().trim();

    logger.debug(`getArticle: "${actCode}" art ${articleNumber}`);

    // LEVEL 1: Check hardcoded mapping (fast path - 16 popular acts)
    const hardcodedActInfo = this.ACT_CODES[actCodeLower];
    if (hardcodedActInfo) {
      logger.debug(`✓ Found in hardcoded map: ${hardcodedActInfo.title}`);
      return this.fetchArticleFromAct(hardcodedActInfo, articleNumber);
    }

    // LEVEL 2: Use ActResolver (dynamic search + cache)
    logger.debug(`Not in hardcoded map, trying dynamic resolution...`);

    try {
      const resolved = await this.actResolver.resolveAct(actCode);

      if (resolved) {
        logger.debug(`✓ Dynamically resolved: ${resolved.title} (source: ${resolved.source})`);
        return this.fetchArticleFromAct(resolved, articleNumber);
      }

      // LEVEL 3: Not found - suggest similar acts
      logger.debug(`✗ Could not resolve act: "${actCode}"`);

      const similarActs = await this.actResolver.findSimilarActs(actCode, 5);

      let errorMessage = `Nie znaleziono ustawy: "${actCode}".`;

      if (similarActs.length > 0) {
        errorMessage += `\n\nCzy chodziło o jedną z tych ustaw?\n`;
        similarActs.forEach((title, i) => {
          errorMessage += `  ${i + 1}. ${title}\n`;
        });
        errorMessage += `\nSpróbuj podać dokładniejszą nazwę.`;
      } else {
        errorMessage += ` Spróbuj podać pełną nazwę ustawy.`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    } catch (error) {
      logger.error(`Error in dynamic resolution: ${error.message}`);
      return {
        success: false,
        error: `Błąd podczas wyszukiwania ustawy: ${error.message}`,
      };
    }
  }

  /**
   * Get full act details
   */
  async getActDetails(params: {
    publisher: string;
    year: number;
    position: number;
  }) {
    try {
      const act = await this.client.getActDetails(
        params.publisher,
        params.year,
        params.position,
      );

      return {
        success: true,
        act: {
          eli: act.ELI,
          title: act.title,
          displayAddress: act.displayAddress,
          type: act.type,
          status: act.status,
          publisher: act.publisher,
          year: act.year,
          position: act.pos,
          promulgation: act.promulgation,
          announcementDate: act.announcementDate,
          entryIntoForce: act.entryIntoForce,
          inForce: act.inForce,
          hasHTML: act.textHTML,
          hasPDF: act.textPDF,
        },
        isapLink: `https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU${params.year}${String(params.position).padStart(7, '0')}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Błąd pobierania aktu: ${error.message}`,
      };
    }
  }

  /**
   * Simple HTML parser to extract article text
   * This is a basic implementation - could be improved
   */
  private extractArticleFromHTML(html: string, articleNumber: string): string | null {
    // Try to find article in HTML
    // Common patterns: <art nr="533">, Art. 533., artykuł 533
    const patterns = [
      new RegExp(`<art[^>]*nr="${articleNumber}"[^>]*>([\\s\\S]*?)</art>`, 'i'),
      // Require newline before next article to avoid matching in-text references
      new RegExp(`Art\\.\\s*${articleNumber}\\.([\\s\\S]{0,2000}?)(?=\\n+\\s*Art\\.|$)`, 'i'),
      new RegExp(`Artykuł\\s*${articleNumber}\\.([\\s\\S]{0,2000}?)(?=\\n+\\s*Artykuł|$)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        // Clean up HTML tags
        let text = match[1] || match[0];
        text = text.replace(/<[^>]+>/g, '');
        text = text.replace(/&nbsp;/g, ' ');
        text = text.replace(/&quot;/g, '"');
        text = text.replace(/&amp;/g, '&');
        text = text.trim();
        if (text.length > 0) {
          return text;
        }
      }
    }

    return null;
  }

  /**
   * Clean Polish text from PDF extraction artifacts
   */
  private cleanPolishText(text: string): string {
    // Step 1: Fix hyphenated words at line breaks
    // Pattern: "po-\nkrzywdzeniem" -> "pokrzywdzeniem"
    text = text.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');

    // Step 2: Fix common broken words with dictionary approach
    // This is more reliable than regex patterns for Polish text
    const commonFixes: Record<string, string> = {
      // Words with extra spaces (from observed errors)
      'po krzywdzeniem': 'pokrzywdzeniem',
      'po-krzywdzeniem': 'pokrzywdzeniem',
      'wyj ątkiem': 'wyjątkiem',
      'zatru dnienia': 'zatrudnienia',
      'za tru dnienia': 'zatrudnienia',
      'dożywot niego': 'dożywotniego',
      'do żywot niego': 'dożywotniego',
      'peł nieniem': 'pełnieniem',
      'popeł nionego': 'popełnionego',
      'motywacj i': 'motywacji',
      'więce j': 'więcej',
      'czyn ności': 'czynności',
      'ż ądającego': 'żądającego',

      // Words incorrectly joined (missing spaces)
      'niemożna': 'nie można',
      'Każdyma': 'Każdy ma',
      'każdyma': 'każdy ma',
      'zwyjątkiem': 'z wyjątkiem',
      'zabronićwykonywania': 'zabronić wykonywania',
      'minimalnąwysokość': 'minimalną wysokość',
      'minimalnąwysokośćwynagrodzenia': 'minimalną wysokość wynagrodzenia',
      'politykęzmierzającą': 'politykę zmierzającą',
      'zmierzającądopełnego': 'zmierzającą do pełnego',
      'dopełnego': 'do pełnego',
      'korzyśćmajątkową': 'korzyść majątkową',
      'korzyśćmajątkowąwskutek': 'korzyść majątkową wskutek',
      'prawnejdłużnika': 'prawnej dłużnika',
      'zwolnićsię': 'zwolnić się',
      'zwolnićsięod': 'zwolnić się od',
      'wierzycielażądającego': 'wierzyciela żądającego',
      'wskażemu': 'wskaże mu',
      'mieniedłużnika': 'mienie dłużnika',
      'zabijaczłowieka': 'zabija człowieka',
      'czasniekrótszy': 'czas nie krótszy',
      'karzedożywot': 'karze dożywot',
      'karzedożywotniego': 'karze dożywotniego',
      'wzwiązku': 'w związku',
      'wzięciemzakładnika': 'wzięciem zakładnika',
      'motywacjizasługującej': 'motywacji zasługującej',
      'potępienie': 'potępienie',
      'zużyciem': 'z użyciem',
      'zabijawięcej': 'zabija więcej',
      'więcejniż': 'więcej niż',
      'niżjedną': 'niż jedną',
      'osobęlub': 'osobę lub',
      'lubbył': 'lub był',
      'byłwcześniej': 'był wcześniej',
      'sprawcazabójstwa': 'sprawca zabójstwa',
      'podczaslub': 'podczas lub',
      'obowiązkówsłużbowych': 'obowiązków służbowych',
      'służbowychzwiązanych': 'służbowych związanych',
      'ochronąbezpieczeństwa': 'ochroną bezpieczeństwa',
      'ludzilub': 'ludzi lub',
      'bezpieczeństwalub': 'bezpieczeństwa lub',
      'człowiekapod': 'człowieka pod',
      'podwpływem': 'pod wpływem',

      // Additional common patterns from PDF extraction
      'wysok ość': 'wysokość',
      'zmierz ającą': 'zmierzającą',
      'krót szy': 'krótszy',
      'wzię ciem': 'wzięciem',
      'zasług ującej': 'zasługującej',
      'potęp ienie': 'potępienie',
      'użyc iem': 'użyciem',
      'dożywot niego': 'dożywotniego',
      'wcze śniej': 'wcześniej',
      'popełn ionego': 'popełnionego',
      'pod czas': 'podczas',
      'związ ku': 'związku',
      'peł nieniem': 'pełnieniem',
      'obowiąz ków': 'obowiązków',
      'służ bowych': 'służbowych',
      'związ anych': 'związanych',
      'ochro ną': 'ochroną',
      'bezpieczeń stwa': 'bezpieczeństwa',
      'ludz i': 'ludzi',
      'porząd ku': 'porządku',
      'człowie ka': 'człowieka',
      'wpły wem': 'wpływem',
      'okoliczno ściami': 'okolicznościami',
    };

    // Apply dictionary fixes
    for (const [broken, fixed] of Object.entries(commonFixes)) {
      const regex = new RegExp(broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      text = text.replace(regex, fixed);
    }

    // Step 3: Fix broken diacritics ONLY when clearly inside a word
    // Pattern: lowercase letter + space + Polish diacritic + lowercase letter (continuing the word)
    // This is conservative - only fixes obvious mid-word breaks
    const conservativePolishFixes = [
      // Only match when there's a letter after the diacritic (mid-word)
      { broken: /([a-z])\s+(ą)([a-z])/gi, fixed: '$1$2$3' },
      { broken: /([a-z])\s+(ć)([a-z])/gi, fixed: '$1$2$3' },
      { broken: /([a-z])\s+(ę)([a-z])/gi, fixed: '$1$2$3' },
      { broken: /([a-z])\s+(ł)([a-z])/gi, fixed: '$1$2$3' },
      { broken: /([a-z])\s+(ń)([a-z])/gi, fixed: '$1$2$3' },
      { broken: /([a-z])\s+(ó)([a-z])/gi, fixed: '$1$2$3' },
      { broken: /([a-z])\s+(ś)([a-z])/gi, fixed: '$1$2$3' },
      { broken: /([a-z])\s+(ź)([a-z])/gi, fixed: '$1$2$3' },
      { broken: /([a-z])\s+(ż)([a-z])/gi, fixed: '$1$2$3' },
    ];

    for (const fix of conservativePolishFixes) {
      text = text.replace(fix.broken, fix.fixed);
    }

    // Step 4: Clean up formatting
    // Replace multiple spaces with single space
    text = text.replace(/[ \t]+/g, ' ');
    // Clean up line breaks
    text = text.replace(/\s*\n\s*/g, '\n');
    // Remove line break before punctuation
    text = text.replace(/\s*\n\s*([.,;:])/g, '$1');

    return text.trim();
  }

  /**
   * Extract text from PDF buffer
   */
  private async extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<string> {
    try {
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        verbosity: 0, // Suppress warnings about missing fonts
      }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Better text extraction - preserve word boundaries
        let pageText = '';
        let lastY = 0;
        let lastX = 0;

        for (const item of textContent.items) {
          const itemData = item as any;
          const text = itemData.str;
          const transform = itemData.transform;
          const y = transform ? transform[5] : 0;
          const x = transform ? transform[4] : 0;

          // Add newline if Y position changed significantly (new line)
          if (lastY && Math.abs(y - lastY) > 5) {
            pageText += '\n';
            lastX = 0; // Reset X position on new line
          }

          // Add text with proper spacing
          if (text) {
            // Check if we need a space before this text
            // Don't add space if:
            // - it's the start of the page
            // - previous char is already space or newline
            // - current text starts with space
            // - current text is punctuation
            // - large horizontal gap (likely a new section)
            const needsSpace = pageText.length > 0 &&
                             !pageText.endsWith(' ') &&
                             !pageText.endsWith('\n') &&
                             !text.startsWith(' ') &&
                             !/^[.,;:!?)\]}]/.test(text) &&
                             (lastX === 0 || Math.abs(x - lastX) < 100); // Don't add space for large gaps

            if (needsSpace) {
              pageText += ' ';
            }

            pageText += text;
            lastX = x + (text.length * 5); // Approximate next position
          }

          lastY = y;
        }

        fullText += pageText + '\n';
      }

      // Apply Polish text cleaning
      fullText = this.cleanPolishText(fullText);

      return fullText;
    } catch (error) {
      throw new Error(`Błąd parsowania PDF: ${error.message}`);
    }
  }

  /**
   * Escape special regex characters in a string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Extract specific article from PDF text
   */
  private extractArticleFromPDF(pdfText: string, articleNumber: string): string | null {
    // Generate all possible variants of article number to search for
    // PDFs may encode superscripts in different ways:
    // 1. "94³" - Unicode superscript (original)
    // 2. "943" - Plain digits (most common in extracted text)
    // 3. "94 3" - With space
    // 4. "94³" with different Unicode representation

    const superscriptMap: Record<string, string> = {
      '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
      '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
    };

    // Check if the article number contains a superscript
    const hasSuperscript = Object.keys(superscriptMap).some(s => articleNumber.includes(s));

    // Variant 1: Normalize to plain digits (e.g., "94³" -> "943", "67³³" -> "6733")
    let normalizedArticleNumber = articleNumber;
    for (const [superscript, digit] of Object.entries(superscriptMap)) {
      normalizedArticleNumber = normalizedArticleNumber.replace(new RegExp(superscript, 'g'), digit);
    }

    // Variant 2: Add spaces between EACH superscript (e.g., "94³" -> "94 3", "67³³" -> "67 3 3")
    let spacedArticleNumber = articleNumber;
    for (const [superscript, digit] of Object.entries(superscriptMap)) {
      spacedArticleNumber = spacedArticleNumber.replace(new RegExp(superscript, 'g'), ` ${digit}`);
    }

    // Variant 3: Base number + space + all superscripts as digits (e.g., "67³³" -> "67 33")
    // This is the most common format for multi-digit superscripts in PDFs
    let baseWithSpacedSuperscripts = '';
    if (hasSuperscript) {
      const baseNumberMatch = articleNumber.match(/^(\d+)/);
      const baseNumber = baseNumberMatch ? baseNumberMatch[1] : '';
      if (baseNumber) {
        const superscriptPart = articleNumber.substring(baseNumber.length);
        let superscriptsAsDigits = superscriptPart;
        for (const [superscript, digit] of Object.entries(superscriptMap)) {
          superscriptsAsDigits = superscriptsAsDigits.replace(new RegExp(superscript, 'g'), digit);
        }
        if (superscriptsAsDigits) {
          baseWithSpacedSuperscripts = `${baseNumber} ${superscriptsAsDigits}`;
        }
      }
    }

    // All variants to try
    const searchVariants = [
      normalizedArticleNumber,  // "6733" (all digits, most common for single superscript)
      articleNumber,            // "67³³" (original with Unicode)
      spacedArticleNumber,      // "67 3 3" (each superscript separate)
      baseWithSpacedSuperscripts, // "67 33" (base + space + superscripts, common for multi-digit)
    ].filter((v, i, arr) => v && arr.indexOf(v) === i); // Remove duplicates and empty strings

    logger.debug(`Article number variants to search: ${searchVariants.map(v => `"${v}"`).join(', ')}`);

    // Normalize the text - remove excessive whitespace but keep structure
    let normalizedText = pdfText.replace(/[ \t]+/g, ' ');

    // Fix common PDF extraction errors BEFORE searching for articles
    // Problem: PDF extraction sometimes breaks "Art." into "A rt.", "Ar t.", "Art ." etc.
    // This prevents pattern matching from working
    const beforeNormalization = normalizedText;
    normalizedText = normalizedText.replace(/A\s+rt\s*\.\s*/gi, 'Art. ');  // "A rt." -> "Art. "
    normalizedText = normalizedText.replace(/Ar\s+t\s*\.\s*/gi, 'Art. ');  // "Ar t." -> "Art. "
    normalizedText = normalizedText.replace(/Art\s+\.\s*/gi, 'Art. ');     // "Art ." -> "Art. "

    // Debug: show if normalization made any changes
    if (beforeNormalization !== normalizedText) {
      logger.debug(`✓ Fixed PDF extraction errors in article markers`);
    }

    // Try each variant until we find a match
    for (const variant of searchVariants) {
      logger.debug(`Trying variant "${variant}" in PDF text (${normalizedText.length} chars)`);
      // Find ALL matches for this variant
      const candidateMatches: Array<{ text: string; score: number; index: number }> = [];

      // Common patterns for Polish legal acts
      // CRITICAL: All patterns MUST start with line beginning anchor to avoid matching in-text references
      const patterns = [
        // Pattern 1: "Art. 10." with dot and space (most reliable for main article text)
        // Requires newline before "Art." to ensure we're matching article headers, not references
        new RegExp(`(?:^|\\n)\\s*Art\\.\\s*${this.escapeRegex(variant)}(?!\\d)\\.\\s+([\\s\\S]{10,50000}?)(?=\\n+\\s*Art\\.\\s*\\d|$)`, 'gim'),
        // Pattern 2: "Art 10." without first dot
        new RegExp(`(?:^|\\n)\\s*Art\\s+${this.escapeRegex(variant)}(?!\\d)\\.\\s+([\\s\\S]{10,50000}?)(?=\\n+\\s*Art\\.?\\s*\\d|$)`, 'gim'),
        // Pattern 3: "Artykuł 10" (full word)
        new RegExp(`(?:^|\\n)\\s*Artykuł\\s+${this.escapeRegex(variant)}(?!\\d)\\s+([\\s\\S]{10,50000}?)(?=\\n+\\s*(?:Artykuł|Art\\.)\\s*\\d|$)`, 'gim'),
      ];

      for (const pattern of patterns) {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(normalizedText)) !== null) {
          const capturedText = match[1] || match[0];
          const matchIndex = match.index;

          // Calculate quality score for this match
          let score = 0;

          // Check if this looks like a REAL article (not just a reference)
          const firstLine = capturedText.substring(0, 200);

          // CRITICAL: Verify this is an actual article header, not a reference
          // Check what comes BEFORE the match in the original text
          const textBefore = normalizedText.substring(Math.max(0, matchIndex - 100), matchIndex);

          // DISQUALIFYING signals - immediately reject these matches
          // If there's text on the same line before "Art. X", it's likely a reference, not an article header
          const lastNewlineIndex = textBefore.lastIndexOf('\n');
          const textOnSameLine = lastNewlineIndex >= 0
            ? textBefore.substring(lastNewlineIndex + 1).trim()
            : textBefore.trim();

          if (textOnSameLine.length > 0) {
            score -= 10000; // DISQUALIFY: Article number appears mid-line, not at line start
            logger.debug(`Rejecting match - found text before article on same line: "${textOnSameLine.substring(0, 50)}"`);
          }

          // STRONG negative signals - this is likely a reference, not the actual article
          if (firstLine.match(/ustawy z dnia \d{1,2} \w+ \d{4}/)) {
            score -= 1000; // References to other acts
          }
          if (firstLine.match(/kodeks[au]? (wykroczeń|karny|cywilny|pracy)/i)) {
            score -= 500; // Explicit reference to another code
          }
          if (capturedText.length < 50) {
            score -= 200; // Too short to be a real article (lowered from 100 to 50 to allow short but valid articles)
          }

          // Positive signals - this looks like actual article content
          if (capturedText.length > 300) score += 100;
          if (capturedText.length > 1000) score += 100;

          // Note: "starts at beginning of line" check is now done above (textOnSameLine)

          // Contains paragraph markers (§) - indicates structured article
          if (capturedText.match(/§\s*\d+/)) {
            score += 50;
          }

          // Contains numbered points (1., 2., 3.) - good sign
          if (capturedText.match(/\n\s*\d+\.\s+/)) {
            score += 30;
          }

          candidateMatches.push({
            text: capturedText.trim(),
            score,
            index: matchIndex
          });
        }
      }

      // If we found candidates, pick the best one
      if (candidateMatches.length > 0) {
        // Sort by score (highest first)
        candidateMatches.sort((a, b) => b.score - a.score);

        const best = candidateMatches[0];

        // Only accept if score is positive (good match)
        if (best.score > 0) {
          let text = best.text;

          // Clean up extra whitespace
          text = text.replace(/[ \t]+/g, ' ');
          text = text.replace(/\n\s*\n\s*\n+/g, '\n\n');

          // Apply Polish text cleaning
          text = this.cleanPolishText(text);

          // Ensure article header
          if (!text.match(/^Art/i)) {
            text = `Art. ${articleNumber}. ${text}`;
          }

          // Remove any trailing content from next article (only if on new line, to avoid removing in-text references)
          text = text.replace(/\n+\s*Art\.\s*\d+.*$/i, '');

          // VALIDATION: Verify that the extracted text actually contains the requested article number
          // This prevents returning wrong articles when the requested one doesn't exist
          const articleHeaderPattern = new RegExp(`^\\s*Art(?:ykuł|\\.)?\\s*${this.escapeRegex(variant)}(?!\\d)`, 'i');
          if (!articleHeaderPattern.test(text)) {
            logger.debug(`Validation failed: Extracted text doesn't start with Art. ${variant}`);
            logger.debug(`Extracted text starts with: ${text.substring(0, 100)}`);
            // Don't return this match - continue searching
            continue;
          }

          if (text.length > 50) {
            logger.debug(`✓ Extracted article text: ${text.substring(0, 150)}...`);
            return text;
          }
        }
      }
    }

    // If article with superscript not found, try searching for paragraph (§)
    // Example: User asks for "1015¹" but it's actually "Art. 1015 § 1¹"
    if (hasSuperscript) {
      logger.debug(`Article not found, trying to find as paragraph...`);

      // Extract base article number (remove superscript)
      const baseNumber = normalizedArticleNumber.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, '').match(/^\d+/)?.[0];

      if (baseNumber) {
        // Extract the superscript part (e.g., "1015¹" -> "1")
        const superscriptPart = normalizedArticleNumber.replace(baseNumber, '');

        logger.debug(`Searching for Art. ${baseNumber} § ${superscriptPart}...`);

        // Try to find the base article first
        const baseArticlePattern = new RegExp(
          `Art\\.?\\s*${this.escapeRegex(baseNumber)}(?!\\d)\\.\\s*([\\s\\S]{10,50000})(?=\\n+\\s*Art\\.?\\s*\\d|$)`,
          'i'
        );

        const baseMatch = normalizedText.match(baseArticlePattern);
        if (baseMatch) {
          let articleText = baseMatch[1] || baseMatch[0];

          // Now search for the specific paragraph within this article
          // Generate paragraph variants: "§ 1¹", "§ 11", "§ 1 1"
          const paragraphVariants = searchVariants.map(v => v.replace(baseNumber, '')).filter(Boolean);

          logger.debug(`Paragraph variants to search: ${paragraphVariants.map(v => `"§ ${v}"`).join(', ')}`);

          for (const pVar of paragraphVariants) {
            // Try different paragraph patterns
            const paragraphPatterns = [
              new RegExp(`§\\s*${this.escapeRegex(pVar)}(?!\\d)\\.`, 'i'),           // "§ 1¹."
              new RegExp(`§\\s*${this.escapeRegex(pVar.trim())}(?!\\d)\\.`, 'i'),    // "§ 1¹." (trimmed)
              new RegExp(`§\\s*${this.escapeRegex(pVar)}(?!\\d)\\s`, 'i'),           // "§ 1¹ "
            ];

            for (const pPattern of paragraphPatterns) {
              if (pPattern.test(articleText)) {
                logger.debug(`✓ Found paragraph § ${pVar} in Art. ${baseNumber}`);

                // Clean up the article text
                articleText = articleText.trim();
                articleText = articleText.replace(/[ \t]+/g, ' ');
                articleText = articleText.replace(/\n\s*\n\s*\n+/g, '\n\n');
                articleText = this.cleanPolishText(articleText);

                // Ensure we include the article header
                if (!articleText.match(/^Art/i)) {
                  articleText = `Art. ${baseNumber}. ${articleText}`;
                }

                // Remove text that looks like it's from the next article (only if on new line)
                articleText = articleText.replace(/\n+\s*Art\.\s*\d+.*$/i, '');

                logger.debug(`Extracted article with paragraph: ${articleText.substring(0, 150)}...`);

                // Add a note that this is a paragraph, not a separate article
                return `Uwaga: Art. ${articleNumber} nie istnieje jako osobny artykuł. Poniżej znajduje się Art. ${baseNumber}, który zawiera § ${pVar}:\n\n${articleText}`;
              }
            }
          }
        }
      }
    }

    // Debug: Show context around each variant to help diagnose issues
    logger.debug(`✗ Article ${articleNumber} not found with any variant`);

    // Look for potential article numbering in the document to help diagnose
    const articleNumbersInText = normalizedText.match(/(?:^|\n)\s*Art\.?\s*(\d+)/gim);
    if (articleNumbersInText) {
      const articleNumbers = articleNumbersInText
        .map(m => m.match(/\d+/)?.[0])
        .filter(Boolean)
        .map(n => parseInt(n))
        .filter((n, i, arr) => arr.indexOf(n) === i) // unique
        .sort((a, b) => a - b);

      logger.debug(`Articles found in document: ${articleNumbers.slice(0, 20).join(', ')}${articleNumbers.length > 20 ? '...' : ''}`);

      // Check if requested article is out of range
      const requestedNum = parseInt(articleNumber.replace(/[^\d]/g, ''));
      if (!isNaN(requestedNum) && articleNumbers.length > 0) {
        const minArticle = Math.min(...articleNumbers);
        const maxArticle = Math.max(...articleNumbers);

        if (requestedNum < minArticle || requestedNum > maxArticle) {
          logger.debug(`Article ${requestedNum} is outside document range (${minArticle}-${maxArticle})`);
        } else {
          logger.debug(`Article ${requestedNum} is within document range but may not exist (possible gap in numbering)`);
        }
      }
    }

    // Still show contexts for debugging
    for (const variant of searchVariants) {
      const contextRegex = new RegExp(`.{0,200}\\b${this.escapeRegex(variant)}(?!\\d).{0,200}`, 'g');
      const contexts = normalizedText.match(contextRegex);
      if (contexts) {
        logger.debug(`Found ${contexts.length} occurrences of number "${variant}" in text (may be references):`);
        contexts.slice(0, 2).forEach((ctx, i) => {
          logger.debug(`  Context ${i + 1}: ...${ctx}...`);
        });
      }
    }

    return null;
  }

  /**
   * Get monitoring statistics
   * Useful for tracking cache performance and popular searches
   */
  getStats() {
    return this.actResolver.getStats();
  }
}
