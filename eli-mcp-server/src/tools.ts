/**
 * ELI MCP Tools
 * High-level functions for legal research
 */

import { ELIClient, ELISearchParams } from './eli-client.ts';
import { ActResolver, ResolvedAct } from './act-resolver.ts';
// @deno-types="npm:@types/pdfjs-dist@2.10.378"
import * as pdfjsLib from 'npm:pdfjs-dist@4.0.379/legacy/build/pdf.mjs';

export class ELITools {
  private client: ELIClient;
  private actResolver: ActResolver;

  // Mapping of common act codes to their official identifiers
  // IMPORTANT: Always use consolidated texts (teksty jednolite) for current law
  // Updated: November 2025 - Expanded to TOP 50+ acts
  private ACT_CODES: Record<string, { publisher: string; year: number; position: number; title: string }> = {
    // ==================== KODEKSY (11) ====================
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

    // ==================== PRAWO CYWILNE I OBRÓT (6) ====================
    'pzp': { publisher: 'DU', year: 2024, position: 1320, title: 'Prawo zamówień publicznych' },
    'prawo zamówień publicznych': { publisher: 'DU', year: 2024, position: 1320, title: 'Prawo zamówień publicznych' },
    'prawo zamowien publicznych': { publisher: 'DU', year: 2024, position: 1320, title: 'Prawo zamówień publicznych' },
    'ustawa o prawach konsumenta': { publisher: 'DU', year: 2023, position: 2759, title: 'Ustawa o prawach konsumenta' },
    'prawa konsumenta': { publisher: 'DU', year: 2023, position: 2759, title: 'Ustawa o prawach konsumenta' },
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
      sortBy: 'change',
      sortDir: 'desc',
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
        console.log(`[ELI] Attempting to fetch PDF for ${actInfo.title}...`);
        const pdfBuffer = await this.client.getActPDF(
          actInfo.publisher,
          actInfo.year,
          actInfo.position,
        );
        const pdfText = await this.extractTextFromPDF(pdfBuffer);
        articleText = this.extractArticleFromPDF(pdfText, articleNumber);
      } catch (pdfError) {
        console.log(`[ELI] PDF extraction failed, falling back to HTML: ${pdfError.message}`);

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

    console.log(`[ELI] getArticle: "${actCode}" art ${articleNumber}`);

    // LEVEL 1: Check hardcoded mapping (fast path - 16 popular acts)
    const hardcodedActInfo = this.ACT_CODES[actCodeLower];
    if (hardcodedActInfo) {
      console.log(`[ELI] ✓ Found in hardcoded map: ${hardcodedActInfo.title}`);
      return this.fetchArticleFromAct(hardcodedActInfo, articleNumber);
    }

    // LEVEL 2: Use ActResolver (dynamic search + cache)
    console.log(`[ELI] Not in hardcoded map, trying dynamic resolution...`);

    try {
      const resolved = await this.actResolver.resolveAct(actCode);

      if (resolved) {
        console.log(`[ELI] ✓ Dynamically resolved: ${resolved.title} (source: ${resolved.source})`);
        return this.fetchArticleFromAct(resolved, articleNumber);
      }

      // LEVEL 3: Not found - suggest similar acts
      console.log(`[ELI] ✗ Could not resolve act: "${actCode}"`);

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
      console.error(`[ELI] Error in dynamic resolution: ${error.message}`);
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
      new RegExp(`Art\\.\\s*${articleNumber}\\.([\\s\\S]{0,2000}?)(?=Art\\.|$)`, 'i'),
      new RegExp(`Artykuł\\s*${articleNumber}\\.([\\s\\S]{0,2000}?)(?=Artykuł|$)`, 'i'),
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

    // Variant 1: Normalize to plain digits (e.g., "94³" -> "943")
    let normalizedArticleNumber = articleNumber;
    for (const [superscript, digit] of Object.entries(superscriptMap)) {
      normalizedArticleNumber = normalizedArticleNumber.replace(new RegExp(superscript, 'g'), digit);
    }

    // Variant 2: Add spaces between base and superscript (e.g., "94³" -> "94 3")
    let spacedArticleNumber = articleNumber;
    for (const [superscript, digit] of Object.entries(superscriptMap)) {
      spacedArticleNumber = spacedArticleNumber.replace(new RegExp(superscript, 'g'), ` ${digit}`);
    }

    // All variants to try
    const searchVariants = [
      normalizedArticleNumber,  // "943" (most common)
      articleNumber,            // "94³" (original with Unicode)
      spacedArticleNumber,      // "94 3" (with space)
    ].filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates

    console.log(`[ELI] Article number variants to search: ${searchVariants.map(v => `"${v}"`).join(', ')}`);

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
      console.log(`[ELI] ✓ Fixed PDF extraction errors in article markers`);
    }

    // Try each variant until we find a match
    for (const variant of searchVariants) {
      console.log(`[ELI] Trying variant "${variant}" in PDF text (${normalizedText.length} chars)`);

      // Common patterns for Polish legal acts
      // CRITICAL: Use (?!\d) negative lookahead to prevent matching "10" in "100", "101", etc.
      // NOTE: Increased limit to 50000 chars to handle long articles (especially transitional provisions)
      // NOTE: Removed lazy quantifier (?) to make regex greedy - captures full article until next Art.
      const patterns = [
        // Pattern 1: "Art. 10." or "Art.10." with optional spaces (requires dot after number)
        new RegExp(`Art\\.?\\s*${this.escapeRegex(variant)}(?!\\d)\\.\\s*([\\s\\S]{10,50000})(?=\\s*Art\\.?\\s*\\d|$)`, 'i'),
        // Pattern 2: "Artykuł 10" (full word) with word boundary
        new RegExp(`Artykuł\\s+${this.escapeRegex(variant)}(?!\\d)[\\s\\S]{10,50000}(?=\\s*Artykuł\\s+\\d|$)`, 'i'),
        // Pattern 3: More lenient - just "Art" followed by number
        new RegExp(`Art\\s*\\.?\\s*${this.escapeRegex(variant)}(?!\\d)\\s*\\.?\\s+([\\s\\S]{10,50000})(?=\\s*Art\\s*\\.?\\s*\\d|$)`, 'i'),
        // Pattern 4: Try with paragraph marker §
        new RegExp(`Art\\.?\\s*${this.escapeRegex(variant)}(?!\\d)\\.?\\s*§?\\s*([\\s\\S]{10,50000})(?=\\s*Art\\.?\\s*\\d|$)`, 'i'),
      ];

      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const match = normalizedText.match(pattern);
        if (match) {
          console.log(`[ELI] ✓ Found article using variant "${variant}" with pattern ${i + 1}`);
          let text = match[1] || match[0];
          text = text.trim();

          // Clean up extra whitespace while preserving paragraph structure
          text = text.replace(/[ \t]+/g, ' ');
          text = text.replace(/\n\s*\n\s*\n+/g, '\n\n'); // Max 2 newlines

          // Apply Polish text cleaning to the article
          text = this.cleanPolishText(text);

          // Ensure we include the article header if not already there
          if (!text.match(/^Art/i)) {
            text = `Art. ${articleNumber}. ${text}`;
          }

          // Remove text that looks like it's from the next article
          text = text.replace(/\s+Art\.\s*\d+.*$/i, '');

          if (text.length > 10) {
            console.log(`[ELI] Extracted article text: ${text.substring(0, 150)}...`);
            return text;
          }
        }
      }
    }

    // Debug: Show context around each variant
    console.log(`[ELI] ✗ Article not found with any variant`);
    for (const variant of searchVariants) {
      const contextRegex = new RegExp(`.{0,200}\\b${this.escapeRegex(variant)}(?!\\d).{0,200}`, 'g');
      const contexts = normalizedText.match(contextRegex);
      if (contexts) {
        console.log(`[ELI] Found ${contexts.length} occurrences of variant "${variant}":`);
        contexts.slice(0, 2).forEach((ctx, i) => {
          console.log(`[ELI]   Context ${i + 1}: ...${ctx}...`);
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
