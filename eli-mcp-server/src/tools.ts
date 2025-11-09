/**
 * ELI MCP Tools
 * High-level functions for legal research
 */

import { ELIClient, ELISearchParams } from './eli-client.ts';
// @deno-types="npm:@types/pdfjs-dist@2.10.378"
import * as pdfjsLib from 'npm:pdfjs-dist@4.0.379/legacy/build/pdf.mjs';

export class ELITools {
  private client: ELIClient;

  // Mapping of common act codes to their official identifiers
  // IMPORTANT: Always use consolidated texts (teksty jednolite) for current law
  // Updated: November 2025
  private ACT_CODES: Record<string, { publisher: string; year: number; position: number; title: string }> = {
    // Kodeksy podstawowe
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

    // Konstytucja
    'konstytucja': { publisher: 'DU', year: 1997, position: 483, title: 'Konstytucja Rzeczypospolitej Polskiej' },

    // Ustawy szczególne
    'pzp': { publisher: 'DU', year: 2024, position: 1320, title: 'Prawo zamówień publicznych' },
    'prawo zamówień publicznych': { publisher: 'DU', year: 2024, position: 1320, title: 'Prawo zamówień publicznych' },
    'prawo zamowien publicznych': { publisher: 'DU', year: 2024, position: 1320, title: 'Prawo zamówień publicznych' },

    'ustawa o prawach konsumenta': { publisher: 'DU', year: 2023, position: 2759, title: 'Ustawa o prawach konsumenta' },
    'prawa konsumenta': { publisher: 'DU', year: 2023, position: 2759, title: 'Ustawa o prawach konsumenta' },

    'ordynacja podatkowa': { publisher: 'DU', year: 2025, position: 111, title: 'Ordynacja podatkowa' },
    'op': { publisher: 'DU', year: 2025, position: 111, title: 'Ordynacja podatkowa' },

    'prawo budowlane': { publisher: 'DU', year: 2025, position: 418, title: 'Prawo budowlane' },
    'pb': { publisher: 'DU', year: 2025, position: 418, title: 'Prawo budowlane' },

    'prawo o ruchu drogowym': { publisher: 'DU', year: 2024, position: 1251, title: 'Prawo o ruchu drogowym' },
    'prd': { publisher: 'DU', year: 2024, position: 1251, title: 'Prawo o ruchu drogowym' },
  };

  constructor(client: ELIClient) {
    this.client = client;
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
   * Get a specific article from an act
   * Parse queries like "art 533 kc" or "artykuł 10 konstytucji"
   */
  async getArticle(params: {
    articleNumber: string;
    actCode: string;
  }) {
    const { articleNumber, actCode } = params;
    const actCodeLower = actCode.toLowerCase().trim();

    // Find the act in our mapping
    const actInfo = this.ACT_CODES[actCodeLower];
    if (!actInfo) {
      return {
        success: false,
        error: `Nieznany kod aktu: ${actCode}. Znane kody: ${Object.keys(this.ACT_CODES).join(', ')}`,
      };
    }

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
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
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
   * Extract specific article from PDF text
   */
  private extractArticleFromPDF(pdfText: string, articleNumber: string): string | null {
    // Normalize the text - remove excessive whitespace but keep structure
    const normalizedText = pdfText.replace(/[ \t]+/g, ' ');

    console.log(`[ELI] Looking for article ${articleNumber} in PDF text (${normalizedText.length} chars)`);

    // Try to find article in PDF text
    // Common patterns for Polish legal acts
    const patterns = [
      // Pattern 1: "Art. 10." or "Art.10." with optional spaces
      new RegExp(`Art\\.?\\s*${articleNumber}\\.\\s*([\\s\\S]{10,3000}?)(?=\\s*Art\\.?\\s*\\d|$)`, 'i'),
      // Pattern 2: "Artykuł 10" (full word)
      new RegExp(`Artykuł\\s+${articleNumber}[\\s\\S]{10,3000}?(?=\\s*Artykuł\\s+\\d|$)`, 'i'),
      // Pattern 3: More lenient - just "Art" followed by number
      new RegExp(`Art\\s*\\.?\\s*${articleNumber}\\s*\\.?\\s+([\\s\\S]{10,3000}?)(?=\\s*Art\\s*\\.?\\s*\\d|$)`, 'i'),
      // Pattern 4: Try with paragraph marker §
      new RegExp(`Art\\.?\\s*${articleNumber}\\.?\\s*§?\\s*([\\s\\S]{10,3000}?)(?=\\s*Art\\.?\\s*\\d|$)`, 'i'),
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = normalizedText.match(pattern);
      if (match) {
        console.log(`[ELI] Found article using pattern ${i + 1}`);
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

    // Debug: Show context around the article number
    const contextRegex = new RegExp(`.{0,200}${articleNumber}.{0,200}`, 'g');
    const contexts = normalizedText.match(contextRegex);
    if (contexts) {
      console.log(`[ELI] Found ${contexts.length} occurrences of "${articleNumber}" in PDF:`);
      contexts.slice(0, 3).forEach((ctx, i) => {
        console.log(`[ELI] Context ${i + 1}: ...${ctx}...`);
      });
    } else {
      console.log(`[ELI] Article number "${articleNumber}" not found in PDF at all`);
    }

    return null;
  }
}
