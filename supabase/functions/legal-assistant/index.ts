import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Anthropic from 'npm:@anthropic-ai/sdk@0.28.0';
import { checkRateLimit } from './rate-limiter.ts';
import { LEGAL_CONTEXT, LEGAL_TOPICS } from './legal-context.ts';
import {
  eliSearchActs,
  eliGetActDetails,
  eliGetActStructure,
  smartActSearch,
  formatActForPrompt,
  needsFullText,
  parseArticleQuery,
  getArticleText,
  type ELISearchParams,
} from '../_shared/eli-api.ts';

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

// ================== ELI API TOOLS CONFIGURATION ==================

const ELI_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'eli_search_acts',
    description: `Wyszukaj akty prawne w polskiej bazie prawnej (Dziennik Ustaw i Monitor Polski).

Użyj tego narzędzia gdy:
- Użytkownik pyta o konkretną ustawę, rozporządzenie lub inny akt prawny
- Potrzebujesz znaleźć podstawę prawną dla sytuacji
- Chcesz sprawdzić czy istnieje przepis na dany temat

Przykłady:
- "Jaka ustawa reguluje urlopy?"
- "Kodeks pracy"
- "Prawa konsumenta"`,
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Słowa kluczowe do wyszukania w tytule aktu (np. "kodeks pracy", "konstytucja", "prawa konsumenta")',
        },
        year: {
          type: 'number',
          description: 'Rok wydania aktu (opcjonalne). Użyj tylko gdy użytkownik podał konkretny rok.',
        },
        limit: {
          type: 'number',
          description: 'Maksymalna liczba wyników (domyślnie 5, max 10)',
          default: 5,
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'eli_get_act_details',
    description: `Pobierz szczegółowe informacje o konkretnym akcie prawnym, w tym:
- Pełny tytuł i status (czy obowiązuje)
- Daty: ogłoszenia, wejścia w życie, ewentualnego uchylenia
- Słowa kluczowe
- Organ wydający
- Powiązania z innymi aktami

Użyj tego narzędzia gdy:
- Masz już identyfikator aktu (publisher/rok/pozycja) z poprzedniego wyszukiwania
- Potrzebujesz szczegółowych metadanych o konkretnym akcie`,
    input_schema: {
      type: 'object',
      properties: {
        publisher: {
          type: 'string',
          description: 'Kod wydawcy: "DU" dla Dziennika Ustaw lub "MP" dla Monitora Polskiego',
          enum: ['DU', 'MP'],
        },
        year: {
          type: 'number',
          description: 'Rok wydania aktu',
        },
        position: {
          type: 'number',
          description: 'Numer pozycji w dzienniku',
        },
      },
      required: ['publisher', 'year', 'position'],
    },
  },
  {
    name: 'eli_get_act_structure',
    description: `Pobierz hierarchiczną strukturę aktu prawnego (spis treści).

Zwraca organizację aktu w formie drzewa:
- Księgi, tytuły, działy, rozdziały, oddziały
- Artykuły, paragrafy, ustępy, punkty, litery

Użyj tego narzędzia gdy:
- Użytkownik pyta o strukturę/organizację aktu
- Chcesz pokazać jakie części zawiera ustawa
- Potrzebujesz nawigować po konkretnych fragmentach aktu

UWAGA: Działa tylko dla aktów dostępnych w formacie HTML.`,
    input_schema: {
      type: 'object',
      properties: {
        publisher: {
          type: 'string',
          description: 'Kod wydawcy: "DU" dla Dziennika Ustaw lub "MP" dla Monitora Polskiego',
          enum: ['DU', 'MP'],
        },
        year: {
          type: 'number',
          description: 'Rok wydania aktu',
        },
        position: {
          type: 'number',
          description: 'Numer pozycji w dzienniku',
        },
      },
      required: ['publisher', 'year', 'position'],
    },
  },
  {
    name: 'smart_act_search',
    description: `Inteligentne wyszukiwanie aktów prawnych - łączy wyszukiwanie metadanych z opcjonalnym pobraniem fragmentów tekstu.

To jest NAJLEPSZE narzędzie do użycia gdy:
- Użytkownik pyta o treść konkretnych przepisów
- Potrzebujesz cytować konkretne artykuły
- Chcesz znaleźć akt i od razu zobaczyć jego fragment

WAŻNE: Ustawienie includeText=true pobierze fragmenty tekstów aktów, co zajmuje więcej czasu, ale daje lepsze wyniki.`,
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Zapytanie wyszukiwania - słowa kluczowe z pytania użytkownika',
        },
        includeText: {
          type: 'boolean',
          description: 'Czy pobrać fragmenty tekstu aktów (wolniejsze, ale bardziej szczegółowe). Ustaw true gdy użytkownik pyta o treść przepisów.',
          default: false,
        },
        maxResults: {
          type: 'number',
          description: 'Maksymalna liczba wyników (1-5). Dla pytań ogólnych użyj 3-5, dla konkretnych 1-2.',
          default: 3,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_article_text',
    description: `Pobierz pełną treść konkretnego artykułu z aktu prawnego.

To jest NAJLEPSZE narzędzie gdy użytkownik pyta o konkretny artykuł, np:
- "art 533 kc"
- "artykuł 10 konstytucji"
- "art. 123 kodeksu pracy"

Narzędzie automatycznie:
1. Rozpoznaje popularnie używane skróty (kc, kp, kk, konstytucja, etc.)
2. Znajduje odpowiedni akt prawny
3. Wyodrębnia pełną treść konkretnego artykułu

WAŻNE: Używaj tego narzędzia ZAMIAST smart_act_search gdy użytkownik pyta o konkretny numerowany artykuł.`,
    input_schema: {
      type: 'object',
      properties: {
        articleNumber: {
          type: 'string',
          description: 'Numer artykułu (np. "533", "10", "123a")',
        },
        actCode: {
          type: 'string',
          description: 'Skrót lub nazwa aktu prawnego (np. "kc", "kodeks cywilny", "konstytucja", "kp")',
        },
      },
      required: ['articleNumber', 'actCode'],
    },
  },
];

/**
 * Handler dla wywołań narzędzi ELI API
 */
async function handleELIToolCall(toolName: string, toolInput: any): Promise<any> {
  console.log(`🔧 ELI Tool call: ${toolName}`, toolInput);

  try {
    switch (toolName) {
      case 'eli_search_acts':
        return await eliSearchActs({
          title: toolInput.title,
          year: toolInput.year,
          publisher: 'DU',
          limit: Math.min(toolInput.limit || 5, 10),
        });

      case 'eli_get_act_details':
        return await eliGetActDetails(
          toolInput.publisher,
          toolInput.year,
          toolInput.position
        );

      case 'eli_get_act_structure':
        return await eliGetActStructure(
          toolInput.publisher,
          toolInput.year,
          toolInput.position
        );

      case 'smart_act_search':
        const results = await smartActSearch(toolInput.query, {
          includeText: toolInput.includeText || false,
          maxResults: Math.min(toolInput.maxResults || 3, 5),
        });

        // Formatuj wyniki dla lepszej czytelności
        return {
          count: results.length,
          results: results.map(r => ({
            act: {
              title: r.act.title,
              address: r.act.displayAddress,
              announcementDate: r.act.announcementDate,
              status: r.act.status,
              entryIntoForce: r.act.entryIntoForce,
              keywords: r.act.keywords,
              link: `https://eli.gov.pl/eli/${r.act.publisher}/${r.act.year}/${r.act.pos}/ogl`
            },
            textPreview: r.textPreview,
          })),
        };

      case 'get_article_text':
        const articleResult = await getArticleText(
          toolInput.articleNumber,
          toolInput.actCode
        );

        return {
          articleText: articleResult.articleText,
          act: {
            title: articleResult.actDetails.title,
            address: articleResult.actDetails.displayAddress,
            announcementDate: articleResult.actDetails.announcementDate,
            status: articleResult.actDetails.status,
            entryIntoForce: articleResult.actDetails.entryIntoForce,
            keywords: articleResult.actDetails.keywords,
          },
          fullTextLink: articleResult.fullTextLink,
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`❌ ELI Tool error (${toolName}):`, error);
    throw error;
  }
}

/**
 * Wykrywa temat prawny na podstawie pytania użytkownika i zwraca odpowiedni kontekst
 */
function detectLegalContext(message: string): string {
  const lowerMessage = message.toLowerCase();
  let detectedContexts: string[] = [];

  // Słowa kluczowe dla różnych tematów prawnych
  const topicKeywords: Record<string, string[]> = {
    'urlop': ['urlop', 'wakacje', 'dni wolne'],
    'wynagrodzenie': ['wynagrodzenie', 'wynagrodzeni', 'pensj', 'wypłat', 'płac', 'zarobki', 'zarobk', 'minimalna'],
    'wypowiedzenie_umowy_pracy': ['wypowiedzeni', 'zwolnieni', 'rozwiązani'],
    'zwrot_towaru_online': ['zwrot', 'zwróc', 'odstąpieni', 'sklep internetowy', 'online', '14 dni'],
    'reklamacja_towaru': ['reklamacj', 'wad', 'gwarancj', 'rękojmi', 'naprawa', 'wymian'],
    'wypowiedzenie_najmu': ['najem', 'najmu', 'wynajem', 'lokator', 'wynajmując'],
    'alimenty': ['aliment'],
    'zniewaga': ['zniewag', 'obelg', 'zniesławi', 'pomówien', 'obraz'],
    'rodo': ['dan', 'rodo', 'gdpr', 'prywatno', 'przetwarzani'],
    'spadek': ['spadk', 'dziedziczen', 'testament', 'spadkobierc', 'zachowek'],
    'umowa_zlecenie': ['zleceni', 'dzieł'],
    'prawa_autorskie': ['prawa autorskie', 'copyright', 'plagiat', 'utwór', 'autor'],
    'kupno_sprzedaz': ['kupn', 'kupuj', 'sprzeda', 'akt notarialny'],
    'mobbing': ['mobbing', 'molestowani', 'nękan', 'dyskryminacj'],
    'postepowanie_sadowe': ['pozew', 'sąd', 'sądow', 'apelacj', 'wyrok', 'proces']
  };

  // Wykryj wszystkie pasujące tematy
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedContexts.push(topic);
    }
  }

  // Jeśli wykryto tematy, zwróć sformatowany kontekst
  if (detectedContexts.length > 0) {
    let contextText = '\n\n📚 RELEWANTNA BAZA WIEDZY PRAWNEJ:\n';

    for (const topic of detectedContexts) {
      const context = LEGAL_CONTEXT[topic as keyof typeof LEGAL_CONTEXT];
      if (context) {
        contextText += `\n**${context.name}:**\n`;
        contextText += `Główne akty prawne: ${context.mainActs.join(', ')}\n`;
        contextText += `Kluczowe artykuły:\n${context.mainArticles.map(a => `- ${a}`).join('\n')}\n`;
        contextText += `Powiązane przepisy:\n${context.relatedArticles.map(a => `- ${a}`).join('\n')}\n`;
        contextText += `Źródło: ${context.source}\n`;
      }
    }

    return contextText;
  }

  return '';
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
      messageType: typeof message,
      messageLength: message?.length,
      hasFileContext: !!fileContext,
      hasSessionId: !!sessionId,
      hasMessageId: !!messageId,
      messageId: messageId, // Log actual messageId value
      usePremiumModel: !!usePremiumModel
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
      : 'claude-haiku-4-5'; // Domyślny: Haiku 4.5

    console.log(`🤖 Using model: ${selectedModel} (premium: ${!!usePremiumModel})`);

    // Inicjalizuj klienta Anthropic
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    // Wykryj kontekst prawny na podstawie pytania
    const detectedLegalContext = detectLegalContext(message);

    let systemPrompt = `Jesteś profesjonalnym asystentem prawnym specjalizującym się w polskim prawie. Udzielasz merytorycznych, szczegółowych odpowiedzi z konkretnymi podstawami prawnymi.

🔧 DOSTĘPNE NARZĘDZIA:

Masz dostęp do oficjalnej bazy aktów prawnych (ELI API - Dziennik Ustaw i Monitor Polski) przez następujące narzędzia:
1. **get_article_text** - 🌟 NAJLEPSZE dla konkretnych artykułów! Użyj gdy pytanie zawiera "art X kc/kp/kk" etc.
2. **smart_act_search** - Inteligentne wyszukiwanie aktów z opcją pobrania fragmentów tekstu
3. **eli_search_acts** - Szybkie wyszukiwanie po metadanych (wspiera keyword, daty, sortowanie)
4. **eli_get_act_details** - Szczegóły konkretnego aktu
5. **eli_get_act_structure** - Struktura/spis treści aktu (tylko HTML)

KIEDY UŻYWAĆ NARZĘDZI:
✅ **get_article_text** - ZAWSZE gdy użytkownik pyta o konkretny artykuł (np. "art 533 kc", "artykuł 10 konstytucji")
✅ **smart_act_search/eli_search_acts** - Gdy użytkownik pyta o ustawę, rozporządzenie bez konkretnego artykułu
✅ ZAWSZE gdy potrzebujesz zweryfikować podstawę prawną
✅ ZAWSZE gdy pytanie dotyczy "jakie prawo", "jaka ustawa", "na jakiej podstawie"
✅ Gdy chcesz podać aktualny numer Dz.U. lub link do przepisu

KIEDY NIE UŻYWAĆ:
❌ Pytania teoretyczne o ogólne zasady (np. "czym jest prawo cywilne")
❌ Pytania nieobjęte prawem polskim (kuchania, pogoda, etc.)
❌ Gdy masz pewność co do przepisu z lokalnej bazy wiedzy

⚠️ KRYTYCZNE - OBSŁUGA BŁĘDÓW NARZĘDZI:
- Jeśli wywołanie narzędzia zwróci błąd (403, 500, timeout, etc.), **NIE PRÓBUJ** odpowiadać z pamięci
- Zamiast tego powiedz użytkownikowi wyraźnie: "Przepraszam, nie mogę obecnie uzyskać dostępu do bazy aktów prawnych. Spróbuj ponownie za chwilę."
- **NIGDY NIE HALUCYNUJ** treści przepisów gdy narzędzie zwróciło błąd

STRATEGIA WYSZUKIWANIA (WAŻNE!):

**KROK 1: Wykryj typ pytania**
- Pytanie o konkretny artykuł (np. "art 533 kc") → Użyj **get_article_text**
- Pytanie ogólne o ustawę → Użyj **smart_act_search** lub **eli_search_acts**

**KROK 2: Dla get_article_text (pytania o konkretny artykuł):**
- Wyodrębnij numer artykułu (np. "533")
- Wyodrębnij kod aktu (np. "kc", "kodeks cywilny", "konstytucja")
- Wywołaj get_article_text(articleNumber: "533", actCode: "kc")
- Narzędzie automatycznie znajdzie Kodeks cywilny i wyodrębni artykuł 533

**KROK 3: Dla smart_act_search/eli_search_acts:**
- API ELI szuka po DOKŁADNYM tytule aktu, nie po semantyce
- Używaj KRÓTKICH, KLUCZOWYCH słów z tytułu ustawy
- Unikaj długich fraz typu "rozliczenie PIT termin składania zeznania"
- Preferuj oficjalne nazwy: "kodeks pracy", "ustawa o podatku dochodowym", "konstytucja"

PRZYKŁADY DOBRYCH QUERIES:
✅ get_article_text("533", "kc") - dla "art 533 kc"
✅ get_article_text("10", "konstytucja") - dla "art 10 konstytucji"
✅ smart_act_search("kodeks pracy") - dla pytań o Kodeks pracy ogólnie
✅ smart_act_search("prawa konsumenta") - dla pytań o prawa konsumenta

**KROK 4: Jeśli wyszukiwanie daje 0 wyników:**
- UPROŚĆ query do 2-3 słów kluczowych
- Spróbuj alternatywnych nazw (np. "konstytucja" zamiast "konstytucja RP")

⚠️ WAŻNE: NIE używaj includeText=true dla ogólnych pytań! To spowalnia odpowiedź i może przekroczyć limity.
Używaj includeText=true TYLKO gdy użytkownik pyta o DOKŁADNĄ treść konkretnego artykułu lub przepisu (i NIE ma konkretnego numeru artykułu - bo wtedy użyj get_article_text).

# WAŻNE: ZAKAZ UDZIELANIA PORAD PRAWNYCH

KRYTYCZNE ZASADY:
❌ NIE MOŻESZ interpretować konkretnej sytuacji użytkownika
❌ NIE MOŻESZ doradzać "w Twoim przypadku powinieneś..."
❌ NIE MOŻESZ oceniać czy użytkownik ma rację w konkretnej sprawie
❌ NIE MOŻESZ sugerować konkretnych działań prawnych

✅ MOŻESZ podawać podstawy prawne (artykuły, ustawy)
✅ MOŻESZ wyjaśniać przepisy w sposób ogólny
✅ MOŻESZ pokazywać jak przepisy działają w ogólnym kontekście

Przykład NIEPOPRAWNY: "W Twojej sytuacji masz prawo do odszkodowania. Powinieneś pozwać pracodawcę."
Przykład POPRAWNY: "Art. 471 Kodeksu cywilnego stanowi o odpowiedzialności za szkodę. W sprawach pracowniczych może mieć zastosowanie..."

# WALIDACJA PYTANIA

Najpierw sprawdź, czy pytanie dotyczy prawa polskiego.

JEŚLI NIE DOTYCZY PRAWA (np. kulinaria, pogoda, medycyna, sport, rozrywka):
Odpowiedz: "❌ Przepraszam, ale jestem asystentem prawnym i odpowiadam tylko na pytania związane z polskim prawem. Zadaj proszę pytanie prawne, a chętnie pomogę."

# STRUKTURA ODPOWIEDZI (dla pytań prawnych)

KRYTYCZNE: Każda sekcja MUSI być oddzielona dwoma pustymi liniami dla lepszej czytelności!

## SEKCJE OBOWIĄZKOWE (w tej kolejności):

**PODSTAWA PRAWNA:**
Pełna nazwa aktu prawnego + konkretne artykuły
Przykład: "Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27"


**CO TO OZNACZA:**
JEŚLI użyłeś narzędzia get_article_text - ZAWRZYJ tutaj pełną treść artykułu z narzędzia
NASTĘPNIE wyjaśnij w prostym języku (2-4 zdania), co przepis oznacza w praktyce


**POWIĄZANE PRZEPISY:**
OBOWIĄZKOWA lista dodatkowych artykułów rozszerzających kontekst
Format: • Art. X ustawy Y - krótki opis


**ŹRÓDŁO:**
Link do pełnego tekstu (preferuj isap.sejm.gov.pl lub eur-lex.europa.eu)


## SEKCJE OPCJONALNE (gdy uzasadnione):

**SZCZEGÓŁOWY TRYB:** / **KLUCZOWE INFORMACJE:** / **WARUNKI:**
Lista punktowanych najważniejszych aspektów lub procedury krok po kroku


**DODATKOWE INFORMACJE:**
Konteksty, wyjątki, przykłady praktyczne


## SEKCJA KOŃCOWA (ZAWSZE NA KOŃCU):

**UWAGA:**
⚠️ Powyższe informacje to wyjaśnienie przepisów prawnych, NIE porada prawna w konkretnej sprawie. W indywidualnych sytuacjach skonsultuj się z prawnikiem.

# ZASADY FORMATOWANIA

KRYTYCZNE ZASADY:
1. Każda główna sekcja (**PODSTAWA PRAWNA:**, **CO TO OZNACZA:**, etc.) MUSI być oddzielona DWOMA pustymi liniami od poprzedniej
2. Sekcja **UWAGA:** MUSI być na samym końcu
3. NIE używaj emoji w nagłówkach sekcji (tylko w treści)
4. Listy punktowane: ZAWSZE "• Tekst" w jednej linii
5. Listy numerowane: "1. Tekst" w jednej linii

PRZYKŁAD POPRAWNEGO FORMATOWANIA:

**PODSTAWA PRAWNA:**
Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27


**CO TO OZNACZA:**
Konsument może zwrócić towar zakupiony w sklepie internetowym w ciągu 14 dni od jego otrzymania bez podawania przyczyny.


**POWIĄZANE PRZEPISY:**
• Art. 28 Ustawy o prawach konsumenta - złożenie oświadczenia o odstąpieniu
• Art. 29 Ustawy o prawach konsumenta - termin na zwrot pieniędzy


**ŹRÓDŁO:**
https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827


**UWAGA:**
⚠️ To nie jest porada prawna. W indywidualnych sprawach skonsultuj się z prawnikiem.${detectedLegalContext}`;

    if (fileContext && typeof fileContext === 'string' && fileContext.length > 0) {
      systemPrompt += `

📄 KONTEKST Z ZAŁĄCZONEGO DOKUMENTU:
Użytkownik załączył dokument. PRIORYTETOWO wykorzystuj ten dokument do odpowiedzi.
Jeśli odpowiedź znajduje się w załączonym dokumencie, cytuj konkretne fragmenty.
Jeśli pytanie wykracza poza załączony dokument, powiedz o tym wyraźnie i użyj swojej wiedzy.`;
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

    // ================== SINGLE PHASE: Tool Use + Streaming Response ==================
    console.log('🚀 Starting tool-enabled streaming response...');

    let messages: Anthropic.Messages.MessageParam[] = [
      { role: 'user', content: userMessage }
    ];

    let usedTools = false;
    let toolCallCount = 0;

    // Pętla tool calling (max 3 iteracje)
    let iterations = 0;
    const MAX_ITERATIONS = 3;
    let currentResponse: Anthropic.Messages.Message | null = null;

    try {
      while (iterations < MAX_ITERATIONS) {
        iterations++;
        console.log(`🔄 Iteration ${iterations}/${MAX_ITERATIONS}`);

        currentResponse = await anthropic.messages.create({
          model: selectedModel,
          max_tokens: 4096,
          system: systemPrompt,
          tools: ELI_TOOLS,
          messages: messages,
          temperature: 0.3,
        });

        console.log(`📊 Response stop_reason: ${currentResponse.stop_reason}`);

        // Jeśli Claude skończył (end_turn) - przerwij pętlę
        if (currentResponse.stop_reason === 'end_turn' || currentResponse.stop_reason === 'max_tokens') {
          console.log('✅ Claude finished generating response');
          break;
        }

        // Jeśli Claude chce użyć narzędzi
        if (currentResponse.stop_reason === 'tool_use') {
          usedTools = true;

          const toolUseBlocks = currentResponse.content.filter(
            (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
          );

          if (toolUseBlocks.length === 0) {
            console.log('⚠️ tool_use stop_reason but no tool blocks found');
            break;
          }

          console.log(`🔧 Found ${toolUseBlocks.length} tool call(s)`);

          // Dodaj odpowiedź Claude'a do historii
          messages.push({
            role: 'assistant',
            content: currentResponse.content,
          });

          // Wykonaj wywołania narzędzi
          const toolResultsContent: Anthropic.Messages.ToolResultBlockParam[] = [];

          for (const toolUse of toolUseBlocks) {
            toolCallCount++;
            console.log(`⚙️ Executing tool: ${toolUse.name}`, toolUse.input);

            try {
              const result = await handleELIToolCall(toolUse.name, toolUse.input);

              toolResultsContent.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: JSON.stringify(result, null, 2),
              });

              console.log(`✅ Tool ${toolUse.name} completed`);
            } catch (error) {
              console.error(`❌ Tool ${toolUse.name} failed:`, error);

              toolResultsContent.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: JSON.stringify({
                  error: error instanceof Error ? error.message : 'Unknown error',
                }),
                is_error: true,
              });
            }
          }

          // Dodaj wyniki narzędzi do historii
          messages.push({
            role: 'user',
            content: toolResultsContent,
          });

          // Kontynuuj pętlę - Claude dostanie wyniki i może użyć więcej narzędzi lub odpowiedzieć
          continue;
        }

        // Jeśli inny stop_reason - przerwij
        console.log(`⚠️ Unexpected stop_reason: ${currentResponse.stop_reason}`);
        break;
      }

      if (usedTools) {
        console.log(`✅ Tool phase completed. Made ${toolCallCount} tool call(s).`);
      }

    } catch (error) {
      console.error('❌ Error in tool calling phase:', error);
      // Jeśli error - spróbuj odpowiedzieć bez narzędzi
    }

    // ================== STREAMING RESPONSE ==================
    console.log('🚀 Preparing final response...');

    // Sprawdź czy Claude już wygenerował odpowiedź (end_turn w pętli)
    let finalResponseText = '';

    if (currentResponse && currentResponse.stop_reason === 'end_turn') {
      // Claude już ma odpowiedź - użyj jej bezpośrednio!
      console.log('✅ Using response from tool phase (already generated)');

      const textBlocks = currentResponse.content.filter(
        (block): block is Anthropic.Messages.TextBlock => block.type === 'text'
      );

      finalResponseText = textBlocks.map(block => block.text).join('\n');
      console.log(`📝 Final response length: ${finalResponseText.length} chars`);

    } else {
      // Claude nie ma jeszcze odpowiedzi - streamuj nową
      console.log('🔄 Generating new streaming response...');

      // Sprawdź rozmiar context
      const contextSize = JSON.stringify(messages).length;
      console.log(`📊 Context size: ${contextSize} chars, ${messages.length} messages`);

      if (contextSize > 180000) {
        console.warn('⚠️ Context size is large, may cause issues');
      }

      // Dodaj prośbę o odpowiedź jeśli mamy tool results ale brak end_turn
      if (usedTools && messages.length > 1) {
        messages.push({
          role: 'user',
          content: 'Na podstawie powyższych informacji z wyszukiwania, udziel odpowiedzi na pytanie użytkownika zgodnie z instrukcjami w system prompt.',
        });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
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
          // NIE przekazujemy tools - Claude ma po prostu odpowiedzieć
          messages: messages,
          temperature: 0.3,
          stream: true
        })
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

      // Track full response for database storage
      let fullResponse = '';
      let chunkCount = 0;
      const startTime = Date.now();

      const stream = new ReadableStream({
        async start(controller) {
          try {
            let buffer = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();

              // Check if we got any response
              if (fullResponse.length === 0) {
                console.error('⚠️ WARNING: Empty response from streaming! Chunks received:', chunkCount);
              } else {
                console.log(`✅ Streaming completed: ${fullResponse.length} chars, ${chunkCount} chunks`);
              }

              // Save question and answer to database
              try {
                const responseTime = Date.now() - startTime;
                const userAgent = req.headers.get('user-agent') || 'unknown';

                await supabaseClient
                  .from('user_questions')
                  .insert({
                    message_id: messageId || null,
                    question: message,
                    answer: fullResponse || '[BŁĄD: Brak odpowiedzi]',
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

            chunkCount++;

            const chunk = decoder.decode(value, { stream: true });

            // Extract text content from SSE events for database storage
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                      fullResponse += parsed.delta.text;
                    }
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              }
            }

            controller.enqueue(encoder.encode(chunk));
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
    }

    // Jeśli mamy finalResponseText (z end_turn), zwróć go jako SSE stream
    if (finalResponseText) {
      console.log('📤 Returning pre-generated response as SSE stream');

      // Zapisz do bazy
      try {
        const responseTime = Date.now() - Date.now(); // będzie 0, ale OK
        const userAgent = req.headers.get('user-agent') || 'unknown';

        await supabaseClient
          .from('user_questions')
          .insert({
            message_id: messageId || null,
            question: message,
            answer: finalResponseText,
            has_file_context: !!fileContext,
            file_name: fileContext ? 'document.pdf/docx' : null,
            session_id: sessionId || null,
            user_agent: userAgent,
            response_time_ms: responseTime,
          });

        console.log('Question and answer saved to database');
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
      }

      // Zwróć jako SSE stream (symulowany)
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        start(controller) {
          // Format SSE: wysyłamy tekst w kawałkach jak prawdziwy stream
          const chunkSize = 100; // Wysyłaj po ~100 znaków

          for (let i = 0; i < finalResponseText.length; i += chunkSize) {
            const chunk = finalResponseText.substring(i, i + chunkSize);

            // Format SSE event
            const sseEvent = `data: ${JSON.stringify({
              type: 'content_block_delta',
              delta: { type: 'text_delta', text: chunk }
            })}\n\n`;

            controller.enqueue(encoder.encode(sseEvent));
          }

          // Wyślij message_stop event
          controller.enqueue(encoder.encode('data: {"type":"message_stop"}\n\n'));
          controller.close();
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
    }

    // Nie powinno się tu znaleźć
    throw new Error('No response generated');
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
