/**
 * Tool Calling Support for Legal Assistant
 *
 * This module enables Claude to dynamically call tools to fetch legal articles
 * instead of relying on regex-based detection.
 */

import { fetchArticle, type ArticleResponse } from './eli-tools.ts';
import { LEGAL_CONTEXT, type ArticleReference, type LegalTopic } from './legal-context.ts';

/**
 * Tool definitions for Claude API
 */
export const LEGAL_TOOLS = [
  {
    name: "get_article",
    description: `Pobierz dokładną, aktualną treść artykułu z polskiej ustawy.

Użyj gdy:
- Znasz dokładny numer artykułu i kod ustawy
- Potrzebujesz precyzyjnego cytatu z tekstu jednolitego
- Użytkownik pyta o konkretny artykuł

Kody aktów (najczęstsze):
- kc = Kodeks cywilny
- kp = Kodeks pracy
- kk = Kodeks karny
- kpk = Kodeks postępowania karnego
- kpc = Kodeks postępowania cywilnego
- ksh = Kodeks spółek handlowych
- kks = Kodeks karny skarbowy
- kro = Kodeks rodzinny i opiekuńczy
- kpa = Kodeks postępowania administracyjnego
- kkw = Kodeks karny wykonawczy
- prd = Prawo o ruchu drogowym
- konstytucja = Konstytucja RP
- pzp = Prawo zamówień publicznych
- pb = Prawo budowlane
- op = Ordynacja podatkowa
- prawo bankowe = Prawo bankowe
- prawo farmaceutyczne = Prawo farmaceutyczne

Jeśli nie jesteś pewien kodu - lepiej użyj search_legal_info.`,
    input_schema: {
      type: "object",
      properties: {
        act_code: {
          type: "string",
          description: "Kod aktu prawnego (np. 'kc', 'kp', 'prd', 'konstytucja')"
        },
        article_number: {
          type: "string",
          description: "Numer artykułu (np. '118', '33', '25')"
        }
      },
      required: ["act_code", "article_number"]
    }
  },
  {
    name: "search_legal_info",
    description: `Wyszukaj informacje w bazie wiedzy prawnej gdy nie znasz dokładnego numeru artykułu.

Użyj gdy:
- Pytanie ogólne ("Co grozi za kradzież?", "Kiedy przedawnia się roszczenie?")
- Nie znasz dokładnego numeru artykułu
- Potrzebujesz kontekstu i powiązanych przepisów

Baza wiedzy zawiera tematy jak:
- Obrona konieczna
- Przedawnienie roszczeń
- Wynagrodzenie i czas pracy
- Rozwiązanie umowy o pracę
- Urlopy
- Bezpieczeństwo w ruchu drogowym
- I wiele innych...

WAŻNE: Jeśli znasz dokładny artykuł - użyj get_article zamiast tej funkcji!`,
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Opis tematu prawnego którego szukasz (np. 'obrona konieczna', 'przedawnienie', 'jazda rowerem')"
        }
      },
      required: ["query"]
    }
  }
];

/**
 * Single tool use from Claude
 */
export interface ToolUse {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, any>;
}

/**
 * Tool result to send back to Claude
 */
export interface ToolResult {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

/**
 * Execute a single tool call
 */
export async function executeToolCall(tool: ToolUse): Promise<ToolResult> {
  console.log(`[TOOL] Executing: ${tool.name}`, tool.input);

  try {
    if (tool.name === 'get_article') {
      const { act_code, article_number } = tool.input;

      if (!act_code || !article_number) {
        return {
          type: 'tool_result',
          tool_use_id: tool.id,
          content: 'Błąd: Wymagane parametry: act_code i article_number',
          is_error: true
        };
      }

      // Fetch article from ELI MCP
      const result = await fetchArticle(act_code, article_number);

      if (result.success) {
        // Format successful result
        const formattedResult = {
          success: true,
          act: {
            title: result.act?.title || '',
            displayAddress: result.act?.displayAddress || '',
            eli: result.act?.eli || ''
          },
          article: {
            number: result.article?.number || article_number,
            text: result.article?.text || ''
          },
          isapLink: result.isapLink || ''
        };

        return {
          type: 'tool_result',
          tool_use_id: tool.id,
          content: JSON.stringify(formattedResult, null, 2)
        };
      } else {
        // Return error
        return {
          type: 'tool_result',
          tool_use_id: tool.id,
          content: `Nie udało się pobrać artykułu: ${result.error || 'Nieznany błąd'}`,
          is_error: true
        };
      }
    }

    if (tool.name === 'search_legal_info') {
      const { query } = tool.input;

      if (!query) {
        return {
          type: 'tool_result',
          tool_use_id: tool.id,
          content: 'Błąd: Wymagany parametr: query',
          is_error: true
        };
      }

      // Search in legal context (duplicated from index.ts to avoid circular dependency)
      const lowerQuery = query.toLowerCase();
      const detectedTopics: LegalTopic[] = [];
      const allMcpArticles: ArticleReference[] = [];

      for (const [topicKey, topicData] of Object.entries(LEGAL_CONTEXT)) {
        const keywords = topicData.keywords || [];
        const matches = keywords.some(keyword =>
          lowerQuery.includes(keyword.toLowerCase())
        );

        if (matches) {
          console.log(`[TOOL] Detected topic: ${topicData.name} (${topicKey})`);
          detectedTopics.push(topicData);
          allMcpArticles.push(...topicData.mcpArticles);
        }
      }

      if (detectedTopics.length === 0) {
        return {
          type: 'tool_result',
          tool_use_id: tool.id,
          content: 'Nie znaleziono informacji w bazie wiedzy dla tego zapytania. Możesz spróbować odpowiedzieć na podstawie swojej wiedzy ogólnej, ale zaznacz że to nie jest oparte na konkretnych źródłach.',
          is_error: false
        };
      }

      // Format context text
      let contextText = '\n\n📚 RELEWANTNA BAZA WIEDZY PRAWNEJ:\n';
      for (const topic of detectedTopics) {
        contextText += `\n**${topic.name}:**\n`;
        contextText += `Główne akty prawne: ${topic.mainActs.join(', ')}\n`;
        contextText += `Kluczowe artykuły:\n${topic.mainArticles.map(a => `- ${a}`).join('\n')}\n`;
        contextText += `Powiązane przepisy:\n${topic.relatedArticles.map(a => `- ${a}`).join('\n')}\n`;
        contextText += `Źródło: ${topic.source}\n`;
      }

      // Fetch articles mentioned in the context
      const articleResults: string[] = [];

      // Fetch up to 3 articles from the context
      const articlesToFetch = allMcpArticles.slice(0, 3);

      for (const ref of articlesToFetch) {
        const result = await fetchArticle(ref.actCode, ref.articleNumber);
        if (result.success && result.article) {
          articleResults.push(
            `\n📜 ${result.act?.title} - Art. ${result.article.number}\n${result.article.text}\n`
          );
        }
      }

      const finalContent = contextText +
        (articleResults.length > 0 ? '\n\nAKTUALNE TREŚCI ARTYKUŁÓW:\n' + articleResults.join('\n') : '');

      return {
        type: 'tool_result',
        tool_use_id: tool.id,
        content: finalContent
      };
    }

    // Unknown tool
    return {
      type: 'tool_result',
      tool_use_id: tool.id,
      content: `Nieznane narzędzie: ${tool.name}`,
      is_error: true
    };

  } catch (error) {
    console.error(`[TOOL] Error executing ${tool.name}:`, error);
    return {
      type: 'tool_result',
      tool_use_id: tool.id,
      content: `Błąd podczas wykonywania narzędzia: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
      is_error: true
    };
  }
}

/**
 * Execute multiple tool calls in parallel
 */
export async function executeToolCalls(tools: ToolUse[]): Promise<ToolResult[]> {
  console.log(`[TOOL] Executing ${tools.length} tool call(s) in parallel`);

  const promises = tools.map(tool => executeToolCall(tool));
  const results = await Promise.all(promises);

  const successCount = results.filter(r => !r.is_error).length;
  const errorCount = results.filter(r => r.is_error).length;

  console.log(`[TOOL] Completed: ${successCount} successful, ${errorCount} failed`);

  return results;
}
