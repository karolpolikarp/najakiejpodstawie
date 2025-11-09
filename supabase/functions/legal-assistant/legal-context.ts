/**
 * Legal Context Knowledge Base
 *
 * This file maps legal topics to relevant articles that should be automatically
 * fetched from the ELI MCP server to provide up-to-date legal information.
 *
 * PHILOSOPHY:
 * - MCP is the PRIMARY source of legal content (always current)
 * - This file provides topic mapping and context (never outdated)
 * - mainArticles/relatedArticles are for AI reference (what to mention)
 * - mcpArticles defines what to automatically fetch from MCP
 *
 * Last updated: 2025-11-09
 */

export interface ArticleReference {
  actCode: string;
  articleNumber: string;
}

export interface LegalTopic {
  name: string;
  keywords?: string[]; // Alternative phrases to detect this topic
  mcpArticles: ArticleReference[]; // Articles to auto-fetch from MCP
  mainActs: string[];
  mainArticles: string[]; // For AI reference only
  relatedArticles: string[]; // For AI reference only
  source: string;
}

export const LEGAL_CONTEXT: Record<string, LegalTopic> = {
  /**
   * PRAWO PRACY (Labor Law)
   */
  urlop: {
    name: "Urlop wypoczynkowy",
    keywords: ["urlop", "urlopy", "wakacje", "urlop wypoczynkowy", "dni wolne"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '152' },
      { actCode: 'kp', articleNumber: '153' },
      { actCode: 'kp', articleNumber: '154' },
      { actCode: 'kp', articleNumber: '155' },
      { actCode: 'kp', articleNumber: '163' }, // urlop na żądanie
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 152 - definicja urlopu wypoczynkowego",
      "Art. 153 - wymiar urlopu wypoczynkowego (20 dni lub 26 dni)",
      "Art. 154 - nabywanie prawa do urlopu",
      "Art. 155 - udzielanie urlopu w roku kalendarzowym",
      "Art. 163 - urlop na żądanie (4 dni w roku)"
    ],
    relatedArticles: [
      "Art. 156 - przeniesienie urlopu na następny rok",
      "Art. 161 - ekwiwalent pieniężny za niewykorzystany urlop",
      "Art. 162 - odwołanie z urlopu",
      "Art. 1671-16712 - urlop wychowawczy",
      "Art. 174 - urlop macierzyński"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  wynagrodzenie: {
    name: "Wynagrodzenie za pracę",
    keywords: ["wynagrodzenie", "pensja", "płaca", "wypłata", "minimalna", "zarobki"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '78' },
      { actCode: 'kp', articleNumber: '80' },
      { actCode: 'kp', articleNumber: '85' },
      { actCode: 'kp', articleNumber: '87' },
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 78 - prawo do godziwego wynagrodzenia",
      "Art. 80 - składniki wynagrodzenia",
      "Art. 85 - terminy wypłaty wynagrodzenia",
      "Art. 87 - wynagrodzenie minimalne"
    ],
    relatedArticles: [
      "Art. 81 - wypłata w pieniądzu lub naturze",
      "Art. 84 - potrącenia z wynagrodzenia",
      "Art. 86 - pierwszeństwo roszczeń pracowniczych",
      "Art. 88 - ochrona wynagrodzenia"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  wypowiedzenie_umowy_pracy: {
    name: "Wypowiedzenie umowy o pracę",
    keywords: ["wypowiedzenie", "rozwiązanie umowy", "zwolnienie", "okres wypowiedzenia"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '30' },
      { actCode: 'kp', articleNumber: '36' },
      { actCode: 'kp', articleNumber: '38' },
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 30 - okresy wypowiedzenia umowy o pracę",
      "Art. 36 - forma wypowiedzenia",
      "Art. 38 - konsekwencje wadliwego wypowiedzenia"
    ],
    relatedArticles: [
      "Art. 31 - skrócenie okresu wypowiedzenia przez pracodawcę",
      "Art. 32 - nieodpłatny urlop dla wypowiedzianego pracownika",
      "Art. 33 - rozwiązanie umowy o pracę w okresie wypowiedzenia",
      "Art. 45 - odszkodowanie za niezgodne z prawem wypowiedzenie"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  /**
   * PRAWO KONSUMENCKIE (Consumer Law)
   */
  zwrot_towaru_online: {
    name: "Zwrot towaru kupionego online",
    keywords: ["zwrot", "odstąpienie", "sklep internetowy", "zakupy online", "14 dni"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '27' }, // Uwaga: to może być błąd - Art. 27 Ustawy o prawach konsumenta
    ],
    mainActs: [
      "Ustawa z dnia 30 maja 2014 r. o prawach konsumenta"
    ],
    mainArticles: [
      "Art. 27 - prawo odstąpienia od umowy (14 dni)"
    ],
    relatedArticles: [
      "Art. 28 - złożenie oświadczenia o odstąpieniu",
      "Art. 29 - termin zwrotu pieniędzy",
      "Art. 31 - koszty odesłania towaru",
      "Art. 32 - obowiązki konsumenta przy zwrocie",
      "Art. 34 - odpowiedzialność za zmniejszenie wartości towaru",
      "Art. 38 - wyjątki od prawa odstąpienia (higiena, personalizacja)"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827"
  },

  reklamacja_towaru: {
    name: "Reklamacja towaru",
    keywords: ["reklamacja", "wada", "rękojmia", "gwarancja", "zwrot towaru"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '556' },
      { actCode: 'kc', articleNumber: '560' },
      { actCode: 'kc', articleNumber: '561' },
    ],
    mainActs: [
      "Ustawa z dnia 30 maja 2014 r. o prawach konsumenta",
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny"
    ],
    mainArticles: [
      "Art. 43a KC - rękojmia za wady (2 lata)",
      "Art. 556 KC - obowiązki sprzedawcy z tytułu rękojmi"
    ],
    relatedArticles: [
      "Art. 5611 KC - domniemanie istnienia wady",
      "Art. 560 KC - terminy zgłoszenia wady",
      "Art. 561 KC - uprawnienia kupującego (wymiana, naprawa, obniżenie ceny, odstąpienie)",
      "Art. 43b Ustawy o prawach konsumenta - gwarancja jakości"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  /**
   * PRAWO MIESZKANIOWE (Housing Law)
   */
  wypowiedzenie_najmu: {
    name: "Wypowiedzenie umowy najmu",
    keywords: ["najem", "wynajem", "wypowiedzenie najmu", "lokator", "właściciel"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '659' },
      { actCode: 'kc', articleNumber: '673' },
      { actCode: 'kc', articleNumber: '661' },
    ],
    mainActs: [
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny"
    ],
    mainArticles: [
      "Art. 659 - umowa najmu",
      "Art. 673 - wypowiedzenie przez najemcę"
    ],
    relatedArticles: [
      "Art. 661 - terminy wypowiedzenia",
      "Art. 685 - wypowiedzenie przez wynajmującego",
      "Art. 664 - rozwiązanie umowy bez wypowiedzenia",
      "Art. 672 - odpowiedzialność najemcy za szkody"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  /**
   * PRAWO RODZINNE (Family Law)
   */
  alimenty: {
    name: "Alimenty",
    keywords: ["alimenty", "alimentacja", "obowiązek alimentacyjny", "dziecko"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '133' }, // Kodeks rodzinny to też 'kc' w kontekście
      { actCode: 'kc', articleNumber: '135' },
    ],
    mainActs: [
      "Ustawa z dnia 25 lutego 1964 r. - Kodeks rodzinny i opiekuńczy"
    ],
    mainArticles: [
      "Art. 133 - obowiązek alimentacyjny rodziców wobec dzieci",
      "Art. 135 - zakres świadczeń alimentacyjnych"
    ],
    relatedArticles: [
      "Art. 128 - kolejność zobowiązanych do alimentacji",
      "Art. 138 - alimenty między małżonkami",
      "Art. 144 - zmiana wysokości alimentów",
      "Art. 1441 - fundusz alimentacyjny"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640090059"
  },

  /**
   * PRAWO KARNE (Criminal Law)
   */
  zniewaga: {
    name: "Zniewaga",
    keywords: ["zniewaga", "obraza", "wyzwisko"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '216' },
      { actCode: 'kk', articleNumber: '212' }, // zniesławienie
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 216 - zniewaga"
    ],
    relatedArticles: [
      "Art. 212 - zniesławienie",
      "Art. 217 - zniewaga funkcjonariusza publicznego",
      "Art. 226 - naruszenie nietykalności cielesnej"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  obrona_konieczna: {
    name: "Obrona konieczna",
    keywords: ["obrona konieczna", "przekroczenie granic", "atak", "odpieranie", "samoobrona"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '25' },
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 25 - prawo do obrony koniecznej i przekroczenie granic obrony"
    ],
    relatedArticles: [
      "Art. 26 - stan wyższej konieczności",
      "Art. 1 § 1 - zasada nullum crimen sine lege"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  kradziez: {
    name: "Kradzież",
    keywords: ["kradzież", "zabór", "mienie", "skradziono"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '278' },
      { actCode: 'kk', articleNumber: '279' }, // kradzież z włamaniem
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 278 - kradzież",
      "Art. 279 - kradzież z włamaniem"
    ],
    relatedArticles: [
      "Art. 275 - przywłaszczenie",
      "Art. 282 - kradzież rozbójnicza",
      "Art. 284 - paserstwo"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  rozboj: {
    name: "Rozbój",
    keywords: ["rozbój", "napad", "przemoc", "zabór mienia"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '280' },
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 280 - rozbój"
    ],
    relatedArticles: [
      "Art. 282 - kradzież rozbójnicza",
      "Art. 281 - wymuszenie rozbójnicze"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  oszustwo: {
    name: "Oszustwo",
    keywords: ["oszustwo", "wyłudzenie", "wprowadzenie w błąd", "oszukano"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '286' },
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 286 - oszustwo"
    ],
    relatedArticles: [
      "Art. 287 - oszustwo komputerowe",
      "Art. 297 - oszustwo kredytowe"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  pobicie: {
    name: "Pobicie i uszkodzenie ciała",
    keywords: ["pobicie", "bójka", "uszkodzenie ciała", "naruszenie nietykalności"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '157' },
      { actCode: 'kk', articleNumber: '158' },
      { actCode: 'kk', articleNumber: '217' }, // naruszenie nietykalności
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 157 - ciężki uszczerbek na zdrowiu",
      "Art. 158 - średni lub lekki uszczerbek",
      "Art. 217 - naruszenie nietykalności cielesnej"
    ],
    relatedArticles: [
      "Art. 159 - pobicie lub naruszenie nietykalności",
      "Art. 160 - spowodowanie lekkiego uszczerbku w afekcie"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  /**
   * OCHRONA DANYCH OSOBOWYCH (Data Protection)
   */
  rodo: {
    name: "Ochrona danych osobowych (RODO)",
    keywords: ["rodo", "dane osobowe", "ochrona danych", "przetwarzanie", "zgoda"],
    mcpArticles: [], // RODO to rozporządzenie UE - może nie być w polskim MCP
    mainActs: [
      "Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO)",
      "Ustawa z dnia 10 maja 2018 r. o ochronie danych osobowych"
    ],
    mainArticles: [
      "Art. 6 RODO - zgodność przetwarzania z prawem",
      "Art. 15 RODO - prawo dostępu",
      "Art. 17 RODO - prawo do usunięcia danych"
    ],
    relatedArticles: [
      "Art. 5 RODO - zasady przetwarzania danych",
      "Art. 7 RODO - warunki zgody",
      "Art. 13-14 RODO - obowiązek informacyjny",
      "Art. 16 RODO - prawo do sprostowania",
      "Art. 20 RODO - prawo do przenoszenia danych",
      "Art. 33-34 RODO - obowiązek zgłoszenia naruszenia"
    ],
    source: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX%3A32016R0679"
  },

  /**
   * PRAWO SPADKOWE (Inheritance Law)
   */
  spadek: {
    name: "Prawo spadkowe",
    keywords: ["spadek", "testament", "dziedziczenie", "zachowek", "spadkobierca"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '922' },
      { actCode: 'kc', articleNumber: '924' },
      { actCode: 'kc', articleNumber: '931' },
      { actCode: 'kc', articleNumber: '1011' }, // zachowek
    ],
    mainActs: [
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny"
    ],
    mainArticles: [
      "Art. 922 KC - otwarcie spadku",
      "Art. 924 KC - formy dziedziczenia (testament, ustawa)",
      "Art. 931 KC - dziedziczenie ustawowe"
    ],
    relatedArticles: [
      "Art. 1011 KC - zachowek",
      "Art. 1015 KC - wysokość zachowku",
      "Art. 1025 KC - stwierdzenie nabycia spadku",
      "Art. 1012 KC - odrzucenie dziedziczenia",
      "Art. 888 KC - testament",
      "Art. 1035 KC - dział spadku"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  /**
   * UMOWA O DZIEŁO / ZLECENIE
   */
  umowa_zlecenie: {
    name: "Umowa zlecenia i umowa o dzieło",
    keywords: ["zlecenie", "dzieło", "umowa cywilnoprawna", "kontrakt"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '734' },
      { actCode: 'kc', articleNumber: '627' },
    ],
    mainActs: [
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny"
    ],
    mainArticles: [
      "Art. 734 KC - umowa zlecenia",
      "Art. 627 KC - umowa o dzieło"
    ],
    relatedArticles: [
      "Art. 735 KC - obowiązki zleceniobiorcy",
      "Art. 742 KC - wypowiedzenie umowy zlecenia",
      "Art. 628 KC - wynagrodzenie za dzieło",
      "Art. 635 KC - odstąpienie od umowy o dzieło",
      "Art. 638 KC - wady dzieła"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  /**
   * PRAWO AUTORSKIE
   */
  prawa_autorskie: {
    name: "Prawa autorskie",
    keywords: ["prawa autorskie", "copyright", "plagiat", "prawo autora"],
    mcpArticles: [], // Specjalna ustawa - może nie być w MCP
    mainActs: [
      "Ustawa z dnia 4 lutego 1994 r. o prawie autorskim i prawach pokrewnych"
    ],
    mainArticles: [
      "Art. 1 - przedmiot prawa autorskiego",
      "Art. 16 - autorskie prawa osobiste",
      "Art. 17 - autorskie prawa majątkowe"
    ],
    relatedArticles: [
      "Art. 23 - czas trwania praw autorskich",
      "Art. 29 - użytek osobisty",
      "Art. 33 - dozwolony użytek publiczny",
      "Art. 41 - umowa o przeniesienie autorskich praw majątkowych",
      "Art. 79 - naruszenie praw autorskich",
      "Art. 115-119 - kary za naruszenie praw"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19940240083"
  },

  /**
   * UMOWA KUPNA-SPRZEDAŻY
   */
  kupno_sprzedaz: {
    name: "Umowa kupna-sprzedaży",
    keywords: ["kupno", "sprzedaż", "kupno-sprzedaż", "umowa sprzedaży"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '535' },
      { actCode: 'kc', articleNumber: '556' },
    ],
    mainActs: [
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny"
    ],
    mainArticles: [
      "Art. 535 KC - definicja umowy sprzedaży",
      "Art. 556 KC - rękojmia za wady"
    ],
    relatedArticles: [
      "Art. 158 KC - forma aktu notarialnego (nieruchomości)",
      "Art. 546 KC - przejście własności",
      "Art. 560 KC - zgłoszenie wady",
      "Art. 568 KC - gwarancja",
      "Art. 576 KC - odpowiedzialność za wady prawne"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  /**
   * MOBBING W PRACY
   */
  mobbing: {
    name: "Mobbing w miejscu pracy",
    keywords: ["mobbing", "molestowanie", "nękanie w pracy", "przemoc psychiczna"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '943' },
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 943 - definicja mobbingu i ochrona przed mobbingiem"
    ],
    relatedArticles: [
      "Art. 11 - równe traktowanie w zatrudnieniu",
      "Art. 94 - obowiązki pracodawcy (przeciwdziałanie mobbingowi)",
      "Art. 183a-183e - dyskryminacja w zatrudnieniu",
      "Art. 300 KC - odszkodowanie za krzywdę"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  /**
   * POSTĘPOWANIE SĄDOWE
   */
  postepowanie_sadowe: {
    name: "Postępowanie sądowe cywilne",
    keywords: ["pozew", "sąd", "proces", "apelacja", "postępowanie"],
    mcpArticles: [
      { actCode: 'kpc', articleNumber: '1' },
      { actCode: 'kpc', articleNumber: '126' },
    ],
    mainActs: [
      "Ustawa z dnia 17 listopada 1964 r. - Kodeks postępowania cywilnego"
    ],
    mainArticles: [
      "Art. 1 - przedmiot regulacji",
      "Art. 126 - pozew",
      "Art. 187 - apelacja"
    ],
    relatedArticles: [
      "Art. 13 - zasada kontradyktoryjności",
      "Art. 19 - koszty sądowe",
      "Art. 98 - zwrot kosztów procesu",
      "Art. 130 - termin na odpowiedź na pozew",
      "Art. 369 - zaskarżenie wyroku",
      "Art. 505 - egzekucja"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640430296"
  }
};

/**
 * Common legal topics for quick reference
 */
export const LEGAL_TOPICS = Object.keys(LEGAL_CONTEXT);

/**
 * Helper function to get legal context for a specific topic
 */
export function getLegalContext(topic: string): LegalTopic | undefined {
  return LEGAL_CONTEXT[topic as keyof typeof LEGAL_CONTEXT];
}
