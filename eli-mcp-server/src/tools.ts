/**
 * ELI MCP Tools
 * High-level functions for legal research
 */

import { ELIClient, ELISearchParams } from './eli-client.ts';

export class ELITools {
  private client: ELIClient;

  // Mapping of common act codes to their official identifiers
  private ACT_CODES: Record<string, { publisher: string; year: number; position: number; title: string }> = {
    'kc': { publisher: 'DU', year: 1964, position: 16, title: 'Kodeks cywilny' },
    'kodeks cywilny': { publisher: 'DU', year: 1964, position: 16, title: 'Kodeks cywilny' },
    'kp': { publisher: 'DU', year: 1974, position: 24, title: 'Kodeks pracy' },
    'kodeks pracy': { publisher: 'DU', year: 1974, position: 24, title: 'Kodeks pracy' },
    'kk': { publisher: 'DU', year: 1997, position: 88, title: 'Kodeks karny' },
    'kodeks karny': { publisher: 'DU', year: 1997, position: 88, title: 'Kodeks karny' },
    'kpk': { publisher: 'DU', year: 1997, position: 89, title: 'Kodeks postępowania karnego' },
    'kpc': { publisher: 'DU', year: 1964, position: 43, title: 'Kodeks postępowania cywilnego' },
    'konstytucja': { publisher: 'DU', year: 1997, position: 78, title: 'Konstytucja Rzeczypospolitej Polskiej' },
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

      // Get HTML text
      const html = await this.client.getActHTML(
        actInfo.publisher,
        actInfo.year,
        actInfo.position,
      );

      // Extract the specific article from HTML
      const articleText = this.extractArticleFromHTML(html, articleNumber);

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
}
