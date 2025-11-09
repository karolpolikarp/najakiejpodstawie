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
    'konstytucja': { publisher: 'DU', year: 1997, position: 483, title: 'Konstytucja Rzeczypospolitej Polskiej' },
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
   * Extract text from PDF buffer
   */
  private async extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<string> {
    try {
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      throw new Error(`Błąd parsowania PDF: ${error.message}`);
    }
  }

  /**
   * Extract specific article from PDF text
   */
  private extractArticleFromPDF(pdfText: string, articleNumber: string): string | null {
    // Try to find article in PDF text
    // Common patterns: Art. 533., Artykuł 533
    const patterns = [
      // Match "Art. 533." followed by text until next "Art." or end
      new RegExp(`Art\\.\\s*${articleNumber}\\.([\\s\\S]{0,3000}?)(?=\\n\\s*Art\\.\\s*\\d|$)`, 'i'),
      // Match "Artykuł 533" followed by text
      new RegExp(`Artykuł\\s*${articleNumber}[\\s\\S]{0,3000}?(?=\\n\\s*Artykuł\\s*\\d|$)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = pdfText.match(pattern);
      if (match) {
        let text = match[1] || match[0];
        text = text.trim();
        // Clean up extra whitespace
        text = text.replace(/\s+/g, ' ');
        // Ensure we include the article header
        if (!text.startsWith('Art.') && !text.startsWith('Artykuł')) {
          text = `Art. ${articleNumber}. ${text}`;
        }
        if (text.length > 0) {
          return text;
        }
      }
    }

    return null;
  }
}
