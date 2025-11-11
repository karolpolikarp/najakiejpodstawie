import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit } from './rate-limiter.ts';
import { LEGAL_CONTEXT, LEGAL_TOPICS, type ArticleReference, type LegalTopic } from './legal-context.ts';
import { enrichWithArticles, type EnrichmentResult } from './eli-tools.ts';
import { LEGAL_TOOLS, executeToolCalls, type ToolUse } from './tool-calling.ts';

// CORS configuration - restrict to specific domains for security
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
    'https://jakieprawo.pl',
    'https://www.jakieprawo.pl',
    'https://www.jakieprawo.pl/czat',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
    'https://najakiejpodstawie.pl',
    'https://najakiejpodstawie.vercel.app',
  ];
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return allowedOrigins[0];
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true'
});

interface LegalContextResult {
  contextText: string;
  mcpArticles: ArticleReference[];
}

/**
 * Detects if the question is about Polish law
 * Simple heuristic: contains legal keywords or asks about legal matters
 */
function isLegalQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Legal keywords
  const legalKeywords = [
    'prawo', 'przepis', 'ustawa', 'kodeks', 'artykuł', 'art', 'art.', 'paragraf',
    'spółka', 'umowa', 'kontrakt', 'sąd', 'wyrok', 'pozew', 'powództwo',
    'odpowiedzialność', 'odszkodowanie', 'kara', 'mandat', 'termin',
    'windykacja', 'długi', 'kredyt', 'pożyczka', 'spadek', 'testament',
    'rozwód', 'alimenty', 'opieka', 'pracownik', 'pracodawca', 'urlop',
    'zwolnienie', 'wypowiedzenie', 'podatek', 'vat', 'zus', 'us',
    'decyzja administracyjna', 'urząd', 'organ', 'postępowanie',
    'odwołanie', 'skarga', 'wniosek', 'zgłoszenie', 'rejestr',
    'kc', 'kk', 'kp', 'kpa', 'kpc', 'ksh', 'ordynacja', 'konstytucja',
    'zaskarżyć', 'zaskarżenie', 'napaść', 'pobicie', 'odrzucenie'
  ];

  // Legal question patterns
  const legalPatterns = [
    /czy (mogę|muszę|powinienem)/,
    /jakie (prawa|obowiązki|przepisy)/,
    /w jakim terminie/,
    /jak (zaskarżyć|odwołać|zgłosić)/,
    /co grozi/,
    /czy jest legalne/,
    /czy mogę (pozwać|odwołać)/,
    /czym (różni|się różni)/
  ];

  // Check keywords
  const matchedKeywords = legalKeywords.filter(keyword =>
    lowerMessage.includes(keyword)
  );

  // Check patterns
  const matchedPatterns = legalPatterns.filter(pattern =>
    pattern.test(lowerMessage)
  );

  const isLegal = matchedKeywords.length > 0 || matchedPatterns.length > 0;

  // Debug logging
  if (isLegal) {
    console.log('[ARCH] isLegalQuestion = TRUE');
    if (matchedKeywords.length > 0) {
      console.log(`[ARCH] - Matched keywords: ${matchedKeywords.join(', ')}`);
    }
    if (matchedPatterns.length > 0) {
      console.log(`[ARCH] - Matched patterns: ${matchedPatterns.length} pattern(s)`);
    }
  } else {
    console.log('[ARCH] isLegalQuestion = FALSE - no keywords or patterns matched');
  }

  return isLegal;
}

/**
 * Wykrywa temat prawny na podstawie pytania użytkownika
 * Zwraca kontekst tekstowy + artykuły do automatycznego pobrania z MCP
 */
function detectLegalContext(message: string): LegalContextResult {
  const lowerMessage = message.toLowerCase();
  const detectedTopics: LegalTopic[] = [];
  const allMcpArticles: ArticleReference[] = [];

  // Wykryj wszystkie pasujące tematy na podstawie keywords
  for (const [topicKey, topicData] of Object.entries(LEGAL_CONTEXT)) {
    const keywords = topicData.keywords || [];

    // Sprawdź czy którekolwiek słowo kluczowe pasuje
    const matches = keywords.some(keyword =>
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (matches) {
      console.log(`[CONTEXT] Detected topic: ${topicData.name} (${topicKey})`);
      detectedTopics.push(topicData);

      // Dodaj artykuły tego tematu do listy do pobrania z MCP
      allMcpArticles.push(...topicData.mcpArticles);
    }
  }

  // Jeśli wykryto tematy, zwróć sformatowany kontekst
  if (detectedTopics.length > 0) {
    let contextText = '\n\n📚 RELEWANTNA BAZA WIEDZY PRAWNEJ:\n';

    for (const topic of detectedTopics) {
      contextText += `\n**${topic.name}:**\n`;
      contextText += `Główne akty prawne: ${topic.mainActs.join(', ')}\n`;
      contextText += `Kluczowe artykuły:\n${topic.mainArticles.map(a => `- ${a}`).join('\n')}\n`;
      contextText += `Powiązane przepisy:\n${topic.relatedArticles.map(a => `- ${a}`).join('\n')}\n`;
      contextText += `Źródło: ${topic.source}\n`;
    }

    console.log(`[CONTEXT] Total MCP articles to fetch from topics: ${allMcpArticles.length}`);

    return {
      contextText,
      mcpArticles: allMcpArticles
    };
  }

  return {
    contextText: '',
    mcpArticles: []
  };
}

serve(async (req) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { message, fileContext, sessionId, messageId, usePremiumModel } = requestBody || {};

    // Log incoming request for debugging
    console.log('Received request:', {
      hasMessage: !!message,
      messageLength: message?.length,
      hasFileContext: !!fileContext,
      hasSessionId: !!sessionId,
      hasMessageId: !!messageId,
      usePremiumModel: !!usePremiumModel,
    });

    // Validate required fields
    if (typeof message !== 'string') {
      return new Response(JSON.stringify({
        error: 'Pole "message" musi być tekstem'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (message.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'Wiadomość nie może być pusta'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client for rate limiting and database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Check rate limit - use sessionId if available, otherwise fallback to IP
    const identifier = sessionId || req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const rateLimitResult = await checkRateLimit(supabaseClient, identifier, 'legal-assistant');

    if (!rateLimitResult.allowed) {
      console.log('Rate limit exceeded for identifier:', identifier);
      return new Response(JSON.stringify({
        error: 'Przekroczono limit zapytań. Możesz wysłać maksymalnie 10 pytań na minutę.',
        retryAfter: rateLimitResult.retryAfter,
        resetAt: rateLimitResult.resetAt?.toISOString(),
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitResult.retryAfter || 60),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt?.toISOString() || '',
        }
      });
    }

    console.log('Rate limit check passed. Remaining requests:', rateLimitResult.remaining);

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Wybierz model: Haiku (domyślny, tani) vs Sonnet (premium, droższy)
    const selectedModel = usePremiumModel
      ? 'claude-sonnet-4-20250514'  // Premium: Sonnet 4.5
      : 'claude-haiku-4-5-20251001'; // Domyślny: Haiku 4.5

    console.log(`🤖 Using model: ${selectedModel} (premium: ${!!usePremiumModel})`);

    // Wykryj kontekst prawny na podstawie pytania (wykrywa tematy i zwraca artykuły do pobrania)
    const legalContextResult = detectLegalContext(message);
    console.log(`[CONTEXT] Detected ${legalContextResult.mcpArticles.length} articles from legal topics`);

    // Pobierz treści artykułów z ELI MCP:
    // 1. Artykuły z pytania użytkownika (regex: "art 10 kp")
    // 2. Artykuły z wykrytych tematów (np. "obrona konieczna" → Art. 25 kk)
    // QW4: Pass usePremiumModel for dynamic article limits
    console.log('[ELI] Fetching articles from both user query and detected topics...');
    const enrichmentResult = await enrichWithArticles(message, legalContextResult.mcpArticles, usePremiumModel);
    console.log(`[ELI] Enrichment result: ${enrichmentResult.successCount} successful, ${enrichmentResult.failureCount} failed`);

    const articleContext = enrichmentResult.context;

    // Tool Calling enabled: LLM can fetch articles dynamically
    let systemPrompt = `<critical_instruction>
❌ NEVER WRITE THINKING TEXT ❌
FORBIDDEN phrases (you will NEVER use these):
- "Wyszukam...", "Pozwól że sprawdzę...", "Spróbuję...", "Zajrzę do...", "Szukam..."
- "Pytanie dotyczy...", "Rozumiem, że pytasz...", "Pozwól, że wyjaśnię..."
- ANY phrase indicating you're "about to search" or "checking something"

✅ CORRECT PATTERN:
1. Need legal data? → Call tool IMMEDIATELY (zero text before)
2. Get tool results → Write response STARTING with **PODSTAWA PRAWNA:**
3. NO introductions, NO thinking text, NO explanations of what you're doing

EXAMPLES OF CORRECT BEHAVIOR:
User: "Windykacja długu - jakie mam prawa?"
You: [calls search_legal_info("windykacja długu")] ← NO TEXT, JUST TOOL CALL
[gets results]
You: **PODSTAWA PRAWNA:** ← START HERE DIRECTLY

User: "art 118 kc"
You: [calls get_article("kc", "118")] ← NO TEXT, JUST TOOL CALL
[gets results]
You: **PODSTAWA PRAWNA:** ← START HERE DIRECTLY
</critical_instruction>

<role>
You are a legal assistant for Polish law. You explain legal provisions in general terms.
- DO NOT give specific personal advice ("in your case you should...")
- DO explain laws in general context
- If question is NOT about law → respond: "Odpowiadam tylko na pytania prawne."

CRITICAL RULES FOR USING FETCHED ARTICLE CONTENT:

1. If you see the section "📜 AKTUALNE TREŚCI ARTYKUŁÓW" below with article content:
   - You MUST use the provided article text EXACTLY as written
   - DO NOT rely on your internal knowledge or memory for that article
   - The provided text is the current, official version from ISAP
   - Quote it word-for-word in the TREŚĆ PRZEPISU section
   - Go directly to answering - NO "thinking" text, NO "I will fetch..."

2. If article content is NOT provided BUT you know the answer from your knowledge:
   - Answer DIRECTLY with the information you have
   - DO NOT say "Pobiorę dokładny tekst" or "Sprawdzę w bazie"
   - DO NOT call tools unnecessarily
   - Provide accurate general information immediately
   - Example: "Art. 13 ustawy o dostępie do informacji publicznej - termin odpowiedzi to 14 dni"
   - Include disclaimer to verify current text on ISAP if needed

3. Only call tools when:
   - You don't know the answer at all
   - User explicitly asks for precise article text ("pokaż dokładną treść art. 13")
   - Answer requires exact current wording verification
</role>

<tools>
You have 2 tools available:

1. get_article(act_code, article_number)
   - Fetches the EXACT text of ANY article from Polish law
   - Works for ALL acts (KC, KK, KP, KPC, KPA, Constitution, and ALL other Polish acts)
   - Uses dynamic ISAP search - you can use full act names too!
   - Examples:
     * get_article("kc", "118") - Art. 118 KC
     * get_article("kk", "212") - Art. 212 KK
     * get_article("prawo budowlane", "10") - Art. 10 of Construction Law
     * get_article("ustawa o ochronie zwierząt", "35") - full act name works!

   Act codes: kk=Karny, kc=Cywilny, kp=Pracy, kpc=Post.Cywilne, kpk=Post.Karne, kpa=Post.Admin

2. search_legal_info(query)
   - Searches curated knowledge base for POPULAR legal topics
   - Returns context + fetches up to 3 articles automatically
   - LIMITATION: Only works for topics in the knowledge base
   - If it returns "Nie znaleziono" → use get_article() instead with your legal knowledge!

STRATEGY:
1. Try search_legal_info(query) FIRST for popular topics (faster)
2. If it says "Nie znaleziono" → use get_article(act, number) with YOUR legal knowledge
3. You KNOW Polish law - use that knowledge to call get_article directly!

CRITICAL: Call tools as THE FIRST THING in your response. Zero text before tool calls.
</tools>

<examples>
<example>
User: "Windykacja długu - jakie mam prawa?"
Assistant: [Immediately calls: search_legal_info("windykacja długu prawa wierzyciela")]
(NO text, just tool call)
[After tool results]
Assistant: **PODSTAWA PRAWNA:**
[Formatted response starting directly with the section header]
</example>

<example>
User: "Odrzucenie spadku - w jakim terminie?"
Assistant: [Immediately calls: search_legal_info("odrzucenie spadku termin")]
(NO text, just tool call)
[After tool results]
Assistant: **PODSTAWA PRAWNA:**
Art. 1015 KC - Termin odrzucenia spadku
[Formatted response continues...]
</example>

<example>
User: "Zgromadzenie wspólników - jak często?"
Assistant: [Immediately calls: search_legal_info("zgromadzenie wspólników częstotliwość")]
(NO text, just tool call)
[After tool results]
Assistant: **PODSTAWA PRAWNA:**
[Formatted response starting directly]
</example>

<example>
User: "art 1012 kc"
Assistant: [Immediately calls: get_article("kc", "1012")]
(NO text, just tool call)
[After tool results]
Assistant: **PODSTAWA PRAWNA:**
[Formatted response]
</example>

<example>
User: "Zniesławienie w internecie - jak się bronić?"
Assistant: [Immediately calls: search_legal_info("zniesławienie w internecie")]
(NO text, just tool call)
[After tool results]
Assistant: **PODSTAWA PRAWNA:**
Art. 212 KK - Zniesławienie
[Formatted response continues...]
</example>

<example>
User: "Przekupstwo - jakie są kary?"
Assistant: [Immediately calls: search_legal_info("przekupstwo")]
[Tool returns: "Nie znaleziono tego zagadnienia w bazie wiedzy kontekstowej. NASTĘPNY KROK: Użyj narzędzia get_article()..."]
Assistant: [Immediately calls: get_article("kk", "228"), get_article("kk", "229")]
(Used my legal knowledge - przekupstwo = Art. 228-229 KK)
[After tool results]
Assistant: **PODSTAWA PRAWNA:**
Art. 228 KK - Przekupstwo czynne
Art. 229 KK - Przekupstwo bierne
[Formatted response continues...]
</example>

<example>
User: "Decyzja administracyjna - jak ją zaskarżyć?"
Assistant: [Immediately calls: search_legal_info("zaskarżenie decyzji administracyjnej")]
(NO text, just tool call)
[After tool results]
Assistant: **PODSTAWA PRAWNA:**
Art. 127 KPA - Prawo do odwołania od decyzji
[Formatted response continues...]
</example>

<example>
User: "Co to jest prawo?"
Assistant: Prawo to system norm i zasad...
(Simple question - no tools needed, direct answer)
</example>
</examples>

<response_format>
After receiving tool results, structure your response as:

**PODSTAWA PRAWNA:**
Full name of the act + article

**TREŚĆ PRZEPISU:**
CRITICAL: Quote EXACTLY from get_article result (if you used that tool)
- DO NOT paraphrase
- DO NOT shorten
- DO NOT quote from memory
- Quote ALL paragraphs (§§)

**CO TO OZNACZA:**
Explanation (2-4 sentences)

**POWIĄZANE PRZEPISY:**
• Art. X - description

**ŹRÓDŁO:**
Link (isap.sejm.gov.pl)

**UWAGA:**
⚠️ To nie porada prawna. Skonsultuj z prawnikiem.

Formatting:
- Two blank lines between sections
- No emoji in headers
- **UWAGA:** always at the end
</response_format>`;

    // Add fetched article content to system prompt
    if (articleContext && articleContext.trim().length > 0) {
      systemPrompt += articleContext;
    }

    if (fileContext && typeof fileContext === 'string' && fileContext.length > 0) {
      systemPrompt += `

📄 KONTEKST Z ZAŁĄCZONEGO DOKUMENTU:
Użytkownik załączył dokument. PRIORYTETOWO wykorzystuj ten dokument do odpowiedzi.
Jeśli odpowiedź znajduje się w załączonym dokumencie, cytuj konkretne fragmenty.
Jeśli pytanie wykracza poza załączony dokument, powiedz o tym wyraźnie i użyj swojej wiedzy.`;
    }

    // Dodaj ostrzeżenia MCP jeśli wystąpiły problemy
    if (enrichmentResult.warnings.length > 0) {
      systemPrompt += `

⚠️ WAŻNE OSTRZEŻENIE - UMIEŚĆ NA POCZĄTKU ODPOWIEDZI:

Na początku swojej odpowiedzi (przed sekcją PODSTAWA PRAWNA) MUSISZ umieścić następujące ostrzeżenie:

---
⚠️ **OSTRZEŻENIE O ŹRÓDŁACH**

${enrichmentResult.warnings.join('\n')}

${enrichmentResult.failureCount > 0 ? 'Nie udało się pobrać aktualnych treści artykułów z oficjalnych źródeł. Poniższa odpowiedź opiera się na wiedzy AI i może być nieaktualna lub niepełna. Dla pewności sprawdź treść na oficjalnych stronach: https://isap.sejm.gov.pl\n' : ''}
---

Po tym ostrzeżeniu przejdź do normalnej odpowiedzi ze standardowymi sekcjami.`;
    }

    let userMessage = message;
    if (fileContext && typeof fileContext === 'string' && fileContext.length > 0) {
      const limitedContext = fileContext.length > 30000
        ? fileContext.substring(0, 30000) + "\n\n[...dokument został skrócony...]"
        : fileContext;

      userMessage = `ZAŁĄCZONY DOKUMENT:
---
${limitedContext}
---

PYTANIE UŻYTKOWNIKA:
${message}`;
    }

    // LAYER 2: Force tool calling for legal questions
    // This prevents LLM from generating "thinking text" before tool calls
    const forcedToolChoice = isLegalQuestion(message);
    console.log(`[ARCH] Legal question detected: ${forcedToolChoice} - ${forcedToolChoice ? 'FORCING' : 'allowing'} tool_choice`);

    // Tool Calling enabled: Add tools to API call
    console.log('[TOOL] Tool Calling enabled - LLM can dynamically fetch articles');

    // Build API request body with conditional tool_choice
    const apiRequestBody: any = {
      model: selectedModel,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.0,
      tools: LEGAL_TOOLS,
      stream: true
    };

    // CRITICAL: Force tool calling for legal questions
    // This eliminates "Pozwól, że sprawdzę..." thinking text at source
    if (forcedToolChoice) {
      apiRequestBody.tool_choice = { type: "any" };
      console.log('[ARCH] ✓ Forced tool_choice: { type: "any" } - LLM MUST use tools');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: 'Osiągnięto limit zapytań. Spróbuj ponownie za chwilę.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (response.status === 401) {
        return new Response(JSON.stringify({
          error: 'Nieprawidłowy klucz API. Sprawdź konfigurację.'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Track full response for database storage + tool calls
    let fullResponse = '';
    const startTime = Date.now();
    const toolUses: ToolUse[] = [];
    let currentToolUse: Partial<ToolUse> | null = null;
    let currentToolInputJson = '';
    let hasSeenToolUse = false; // Track if we've seen any tool_use blocks

    // LAYER 3+: Real-time thinking text filter
    // Buffer to accumulate text before sending to client
    let textBuffer = '';
    const thinkingPhrases = [
      'Wyszukam dla Ciebie',
      'Pozwól, że sprawdzę',
      'Pozwól że sprawdzę',
      'Spróbuję wyszukać',
      'Zajrzę do przepisów',
      'Pozwól, że znajdę',
      'Pozwól że znajdę',
      'Szukam informacji',
      'Pozwól, że wyszukam',
      'Pozwól że wyszukam',
      'Pozwól, że wyjaśnię',
      'Pozwól że wyjaśnię',
      'Rozumiem, że pytasz',
      'Pytanie dotyczy'
    ];

    // Helper: Check if text contains thinking phrases
    const containsThinkingText = (text: string): boolean => {
      const lower = text.toLowerCase();
      return thinkingPhrases.some(phrase => lower.includes(phrase.toLowerCase()));
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Check if LLM wants to use tools
              if (toolUses.length > 0) {
                console.log(`[TOOL] LLM requested ${toolUses.length} tool call(s)`);

                // Light logging - just track if thinking text appeared before tool call
                if (fullResponse && fullResponse.length > 5) {
                  console.log('[ARCH] ℹ️  LLM generated text before tool call (will be discarded):', fullResponse.substring(0, 80));
                }

                // Reset fullResponse - we don't want to keep any text before tool calling
                fullResponse = '';

                // Execute all tool calls
                const toolResults = await executeToolCalls(toolUses);

                // Build message history for second request
                const assistantContent = toolUses.map(tu => ({
                  type: 'tool_use',
                  id: tu.id,
                  name: tu.name,
                  input: tu.input
                }));

                const userContent = toolResults.map(tr => ({
                  type: 'tool_result',
                  tool_use_id: tr.tool_use_id,
                  content: tr.content,
                  is_error: tr.is_error || undefined
                }));

                // Second request with tool results
                console.log('[TOOL] Making second request with tool results...');
                const secondResponse = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: selectedModel,
                    max_tokens: 4096,
                    system: systemPrompt,
                    messages: [
                      { role: 'user', content: userMessage },
                      { role: 'assistant', content: assistantContent },
                      { role: 'user', content: userContent }
                    ],
                    tools: LEGAL_TOOLS,
                    temperature: 0.0,
                    stream: true
                  })
                });

                if (!secondResponse.ok) {
                  throw new Error(`Second API call failed: ${secondResponse.status}`);
                }

                // Stream second response to client
                const reader2 = secondResponse.body?.getReader();
                if (!reader2) throw new Error('Second response not readable');

                let buffer2 = '';
                let textBuffer2 = ''; // Accumulate text to check for thinking patterns
                let thinkingTextDetected2 = false;

                while (true) {
                  const { done: done2, value: value2 } = await reader2.read();
                  if (done2) break;

                  const chunk2 = decoder.decode(value2, { stream: true });
                  buffer2 += chunk2;
                  const lines2 = buffer2.split('\n');
                  buffer2 = lines2.pop() || '';

                  for (const line2 of lines2) {
                    if (line2.startsWith('data: ')) {
                      const data2 = line2.slice(6);
                      if (data2 !== '[DONE]') {
                        try {
                          const parsed2 = JSON.parse(data2);

                          // Track text content
                          if (parsed2.type === 'content_block_delta' && parsed2.delta?.text) {
                            const deltaText2 = parsed2.delta.text;
                            fullResponse += deltaText2;
                            textBuffer2 += deltaText2;

                            // Detect thinking text for logging only - DON'T block streaming
                            if (!thinkingTextDetected2 && containsThinkingText(textBuffer2)) {
                              thinkingTextDetected2 = true;
                              console.log('[ARCH] ℹ️  Detected thinking text in response (will continue streaming)');
                            }

                            // Always stream - don't block even if thinking text detected
                            // Light filtering will happen after response is complete
                          }
                        } catch (e) {
                          // Ignore parse errors
                        }
                      }
                    }
                  }

                  // Always stream chunks - no blocking
                  controller.enqueue(encoder.encode(chunk2));
                }
              } else {
                // No tool calls were made - send accumulated response
                // This happens when LLM can answer directly without tools
                console.log('[STREAM] No tool calls made, streaming accumulated response');
                if (fullResponse) {
                  // Light filtering - only remove thinking phrases at the start (not aggressive)
                  // This is a safety net - system prompt should prevent this
                  const filteredResponse = fullResponse
                    .replace(/^Wyszukam dla Ciebie[^.]*\.\s*/i, '')
                    .replace(/^Pozwól,?\s*że sprawdzę[^.]*\.\s*/i, '')
                    .replace(/^Spróbuję wyszukać[^.]*\.\s*/i, '')
                    .trim();

                  // No safety check - trust the response

                  // Send proper SSE event sequence
                  // 1. message_start
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'message_start',
                    message: { role: 'assistant' }
                  })}\n\n`));

                  // 2. content_block_start
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'content_block_start',
                    index: 0,
                    content_block: { type: 'text', text: '' }
                  })}\n\n`));

                  // 3. content_block_delta - split into smaller chunks for proper streaming
                  const chunkSize = 100; // chars per chunk
                  for (let i = 0; i < filteredResponse.length; i += chunkSize) {
                    const chunk = filteredResponse.slice(i, i + chunkSize);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'content_block_delta',
                      index: 0,
                      delta: { type: 'text_delta', text: chunk }
                    })}\n\n`));
                  }

                  // 4. content_block_stop
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'content_block_stop',
                    index: 0
                  })}\n\n`));

                  // 5. message_delta (usage info)
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'message_delta',
                    delta: { stop_reason: 'end_turn' }
                  })}\n\n`));

                  // 6. message_stop
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'message_stop'
                  })}\n\n`));
                }
              }

              controller.close();

              // Save question and answer to database
              try {
                const responseTime = Date.now() - startTime;
                const userAgent = req.headers.get('user-agent') || 'unknown';

                await supabaseClient
                  .from('user_questions')
                  .insert({
                    message_id: messageId || null,
                    question: message,
                    answer: fullResponse,
                    has_file_context: !!fileContext,
                    file_name: fileContext ? 'document.pdf/docx' : null,
                    session_id: sessionId || null,
                    user_agent: userAgent,
                    response_time_ms: responseTime,
                  });

                console.log('Question and answer saved to database with message_id:', messageId);
              } catch (dbError) {
                // Don't fail the request if DB save fails
                console.error('Failed to save to database:', dbError);
              }

              break;
            }

            const chunk = decoder.decode(value, { stream: true });

            // Parse SSE events and detect tool_use
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(data);

                    // Detect tool_use blocks
                    if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'tool_use') {
                      hasSeenToolUse = true; // Mark that we've seen a tool_use
                      currentToolUse = {
                        type: 'tool_use',
                        id: parsed.content_block.id,
                        name: parsed.content_block.name,
                        input: {}
                      };
                      currentToolInputJson = '';
                      console.log(`[TOOL] Detected tool_use: ${parsed.content_block.name}`);
                    }

                    // Accumulate tool input
                    if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'input_json_delta') {
                      if (currentToolUse) {
                        currentToolInputJson += parsed.delta.partial_json;
                      }
                    }

                    // Complete tool_use block
                    if (parsed.type === 'content_block_stop' && currentToolUse) {
                      try {
                        currentToolUse.input = JSON.parse(currentToolInputJson);
                      } catch (e) {
                        console.error('[TOOL] Failed to parse tool input JSON:', currentToolInputJson);
                        currentToolUse.input = {};
                      }
                      toolUses.push(currentToolUse as ToolUse);
                      console.log(`[TOOL] Completed tool_use:`, currentToolUse);
                      currentToolUse = null;
                      currentToolInputJson = '';
                    }

                    // Normal text delta
                    // CRITICAL: Do NOT stream ANYTHING before tool calls
                    // Accumulate but check for thinking text
                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                      const deltaText = parsed.delta.text;
                      fullResponse += deltaText;

                      // LAYER 3++: Real-time detection - log if thinking text appears
                      if (containsThinkingText(deltaText)) {
                        console.log('[ARCH] ⚠️  Detected thinking text in stream:', deltaText.substring(0, 50));
                      }

                      // DO NOT STREAM - we wait for tool calling or end of response
                    }
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              }
            }

            // NOTE: Chunk streaming is now handled in the loop above (line 528)
            // This prevents duplicate streaming that was causing text repetition
          }
        } catch (error) {
          console.error('Error streaming response:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in legal-assistant function:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(JSON.stringify({
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
