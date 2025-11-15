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
 * CHANGELOG:
 * - 2025-11-15: Major expansion - Added 23 new topics (+79% coverage):
 *   * Prawo pracy: czas_pracy_nadgodziny, zwolnienie_lekarskie_l4, swiadectwo_pracy,
 *     umowa_o_prace, dyskryminacja_w_pracy, urlop_bezplatny, odpowiedzialnosc_materialna_pracownika
 *   * Prawo rodzinne: rozwod, wspolnosc_malzenska, wladza_rodzicielska
 *   * Prawo karne: jazda_po_alkoholu, groźby_karalne, stalking_nekanie, niealimentacja, wypadek_drogowy
 *   * Prawo konsumenckie: kredyt_konsumencki, klauzule_abuzywne
 *   * Prawo mieszkaniowe: kupno_nieruchomosci, wspolnota_mieszkaniowa, sasiedzi_halas
 *   * Prawo administracyjne: mandat_karny, rejestracja_pojazdu
 *   Enhanced keywords for 12+ existing topics for better detection
 *   Total topics: 52 (was 29)
 * - 2025-11-09: Initial creation with 29 core topics
 *
 * Last updated: 2025-11-15
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
    keywords: ["urlop", "urlopy", "wakacje", "urlop wypoczynkowy", "dni wolne", "urlop na żądanie", "macierzyński", "urlop macierzyński", "rodzicielski", "urlop rodzicielski", "wychowawczy", "urlop wychowawczy", "ile urlopu", "wymiar urlopu", "prawo do urlopu", "ekwiwalent za urlop", "niewykorzystany urlop", "plan urlopów", "ojcowski", "urlop ojcowski", "tacierzyński", "ciążowy"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '152' },  // definicja urlopu
      { actCode: 'kp', articleNumber: '153' },  // nabywanie prawa
      { actCode: 'kp', articleNumber: '154' },  // wymiar urlopu
      { actCode: 'kp', articleNumber: '155' },  // okresy do wymiaru
      { actCode: 'kp', articleNumber: '163' },  // plan urlopów
      { actCode: 'kp', articleNumber: '167' },  // urlop na żądanie
      { actCode: 'kp', articleNumber: '1671' }, // urlop wychowawczy
      { actCode: 'kp', articleNumber: '174' },  // urlop macierzyński
      { actCode: 'kp', articleNumber: '180' },  // wymiar urlopu macierzyńskiego
      { actCode: 'kp', articleNumber: '1821a' }, // urlop rodzicielski
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 152 - definicja urlopu wypoczynkowego",
      "Art. 153 - nabywanie prawa do urlopu",
      "Art. 154 - wymiar urlopu wypoczynkowego (20 dni lub 26 dni)",
      "Art. 155 - okresy do wymiaru urlopu",
      "Art. 167 § 2 - urlop na żądanie (4 dni w roku)"
    ],
    relatedArticles: [
      "Art. 156 - przeniesienie urlopu na następny rok",
      "Art. 161 - ekwiwalent pieniężny za niewykorzystany urlop",
      "Art. 162 - odwołanie z urlopu",
      "Art. 163 - plan urlopów",
      "Art. 167 - udzielanie urlopu (w tym urlop na żądanie)",
      "Art. 1671 - urlop wychowawczy",
      "Art. 174 - urlop macierzyński",
      "Art. 180 - wymiar urlopu macierzyńskiego (20-37 tygodni)",
      "Art. 1821a - urlop rodzicielski (32-41 tygodni)"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  wynagrodzenie: {
    name: "Wynagrodzenie za pracę",
    keywords: ["wynagrodzenie", "pensja", "płaca", "wypłata", "minimalna", "zarobki", "wynagrodzenie minimalne", "płaca minimalna", "termin wypłaty", "potrącenia", "składniki wynagrodzenia", "premia", "bonus", "wynagrodzenie za godziny nadliczbowe", "kiedy wypłata", "opóźnienie wypłaty"],
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
    keywords: ["wypowiedzenie umowy o pracę", "wypowiedzenie pracy", "zwolnienie z pracy", "okres wypowiedzenia pracy", "rozwiązanie umowy o pracę", "pracodawca wypowiada", "pracownik wypowiada"],
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
  umowy_telekomunikacyjne: {
    name: "Umowy z operatorami telekomunikacyjnymi",
    keywords: ["operator", "telekomunikacyjny", "abonament", "przedterminowe rozwiązanie", "umowa z operatorem", "internet mobilny", "telefonia", "usługi telekomunikacyjne", "opłata za rozwiązanie", "kara umowna operator"],
    mcpArticles: [
      { actCode: 'upk', articleNumber: '27' }, // prawo odstąpienia (14 dni)
      { actCode: 'upk', articleNumber: '38' }, // wyjątki od prawa odstąpienia
      { actCode: 'kc', articleNumber: '483' }, // kara umowna
      { actCode: 'kc', articleNumber: '484' }, // wysokość kary umownej
    ],
    mainActs: [
      "Ustawa z dnia 30 maja 2014 r. o prawach konsumenta",
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny"
    ],
    mainArticles: [
      "Art. 27 UPK - prawo odstąpienia od umowy (14 dni dla umów na odległość)",
      "Art. 38 UPK - wyjątki od prawa odstąpienia",
      "Art. 483 KC - kara umowna",
      "Art. 484 KC - możliwość miarkowania nadmiernej kary umownej"
    ],
    relatedArticles: [
      "Art. 29 UPK - termin zwrotu pieniędzy",
      "Art. 56 UPK - umowy o świadczenie usług (telefonia, internet)",
      "Art. 385¹ KC - niedozwolone klauzule umowne (abuzywność)",
      "Art. 385² KC - wzorce umowne"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827"
  },

  zwrot_towaru_online: {
    name: "Zwrot towaru kupionego online",
    keywords: ["zwrot", "odstąpienie", "sklep internetowy", "zakupy online", "14 dni"],
    mcpArticles: [
      { actCode: 'upk', articleNumber: '27' }, // Art. 27 Ustawy o prawach konsumenta (prawo odstąpienia - 14 dni)
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
    keywords: ["reklamacja", "wada", "rękojmia", "gwarancja", "zwrot towaru", "towar uszkodzony", "produkt wadliwy", "naprawa", "wymiana towaru", "obniżenie ceny", "odstąpienie od umowy", "zgłoszenie wady", "termin reklamacji", "2 lata", "gwarancja producenta"],
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
    keywords: ["wypowiedzenie najmu", "wypowiedzenie umowy najmu", "rozwiązanie najmu", "lokator wypowiada", "właściciel wypowiada", "wynajem mieszkania wypowiedzenie"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '659' },
      { actCode: 'kc', articleNumber: '673' },
      { actCode: 'kc', articleNumber: '661' },
    ],
    mainActs: [
      "Ustawa z dnia 23 czerwca 1974 r. o ochronie praw lokatorów, mieszkaniowym zasobie gminy i o zmianie Kodeksu cywilnego",
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny"
    ],
    mainArticles: [
      "Art. 659 KC - umowa najmu",
      "Art. 673 KC - wypowiedzenie przez najemcę",
      "Art. 11 ustawy o ochronie praw lokatorów - wypowiedzenie przez wynajmującego"
    ],
    relatedArticles: [
      "Art. 661 KC - terminy wypowiedzenia",
      "Art. 685 KC - wypowiedzenie przez wynajmującego",
      "Art. 664 KC - rozwiązanie umowy bez wypowiedzenia",
      "Art. 672 KC - odpowiedzialność najemcy za szkody"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  najem_okazjonalny: {
    name: "Najem okazjonalny lokalu mieszkalnego",
    keywords: ["najem okazjonalny", "najmu okazjonalnego", "różnica najem okazjonalny", "zwykły najem", "najem instytucjonalny"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '19a' }, // najem okazjonalny - ustawa o ochronie praw lokatorów
    ],
    mainActs: [
      "Ustawa z dnia 23 czerwca 1974 r. o ochronie praw lokatorów, mieszkaniowym zasobie gminy i o zmianie Kodeksu cywilnego"
    ],
    mainArticles: [
      "Art. 19a - najem okazjonalny lokalu mieszkalnego",
      "Art. 19b - wypowiedzenie najmu okazjonalnego",
      "Art. 19c - eksmisja w najem okazjonalnym"
    ],
    relatedArticles: [
      "Art. 659 KC - ogólne przepisy o najmie",
      "Art. 680 KC - ochrona najemcy lokalu"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20050310266"
  },

  /**
   * PRAWO RODZINNE (Family Law)
   */
  alimenty: {
    name: "Alimenty",
    keywords: ["alimenty", "alimentacja", "obowiązek alimentacyjny", "dziecko", "alimenty na dziecko", "wysokość alimentów", "zmiana alimentów", "podwyższenie alimentów", "obniżenie alimentów", "alimenty po rozwodzie", "alimenty małżonek", "fundusz alimentacyjny", "alimenty od ojca", "alimenty od matki", "uchylanie się od alimentów"],
    mcpArticles: [
      { actCode: 'kro', articleNumber: '133' }, // Kodeks rodzinny i opiekuńczy
      { actCode: 'kro', articleNumber: '135' },
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
    keywords: ["zniewaga", "obraza", "wyzwisko", "obelga", "zniewaga publiczna", "zniewaga w internecie", "zniewaga policjanta", "zniewaga funkcjonariusza", "obraza uczuć religijnych", "zniewaga sąsiad", "kara za zniewagę"],
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
    keywords: ["kradzież", "zabór", "mienie", "skradziono", "ukradziono", "kradzież w sklepie", "kradzież pojazdu", "kradzież samochodu", "kradzież roweru", "kradzież z włamaniem", "włamanie", "rabunek", "zgłoszenie kradzieży", "kara za kradzież"],
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
    keywords: ["oszustwo", "wyłudzenie", "wprowadzenie w błąd", "oszukano", "oszustwo internetowe", "wyłudzenie pieniędzy", "phishing", "oszustwo na wnuczka", "oszustwo na policjanta", "oszustwo w internecie", "oszustwo allegro", "oszustwo olx", "oszustwo kredytowe", "kara za oszustwo"],
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
    keywords: ["pobicie", "bójka", "uszkodzenie ciała", "naruszenie nietykalności", "pobity", "policja pobicie", "zgłoszenie pobicia", "obrażenia ciała", "lekki uszczerbek", "ciężki uszczerbek", "średni uszczerbek", "przemoc fizyczna", "atak fizyczny"],
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
    keywords: ["spadek", "testament", "dziedziczenie", "zachowek", "spadkobierca", "odrzucenie", "przyjęcie spadku", "odrzucenie spadku", "spadek z dobrodziejstwem inwentarza", "proste przyjęcie", "bezwarunkowe przyjęcie", "dziedziczenie ustawowe", "dziedziczenie testamentowe", "otwarcie spadku", "stwierdzenie nabycia spadku", "długi spadkowe", "podział spadku", "dział spadku", "spadek po rodzicach", "spadek po dziadkach"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '922' },  // otwarcie spadku
      { actCode: 'kc', articleNumber: '924' },  // formy dziedziczenia
      { actCode: 'kc', articleNumber: '931' },  // dziedziczenie ustawowe - pierwsza kolejność
      { actCode: 'kc', articleNumber: '932' },  // dziedziczenie ustawowe - druga kolejność
      { actCode: 'kc', articleNumber: '934' },  // dziedziczenie ustawowe - dziadkowie
      { actCode: 'kc', articleNumber: '1011' }, // zachowek
      { actCode: 'kc', articleNumber: '1012' }, // formy przyjęcia spadku
      { actCode: 'kc', articleNumber: '1015' }, // termin do złożenia oświadczenia
      { actCode: 'kc', articleNumber: '1018' }, // forma i nieodwołalność oświadczenia
      { actCode: 'kc', articleNumber: '1020' }, // skutki odrzucenia spadku
      { actCode: 'kc', articleNumber: '1025' }, // stwierdzenie nabycia spadku
      { actCode: 'kc', articleNumber: '888' },  // testament
      { actCode: 'kc', articleNumber: '1031' }, // odpowiedzialność za długi spadkowe
    ],
    mainActs: [
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny"
    ],
    mainArticles: [
      "Art. 922 KC - otwarcie spadku",
      "Art. 924 KC - formy dziedziczenia (testament, ustawa)",
      "Art. 931 KC - dziedziczenie ustawowe",
      "Art. 1012 KC - formy przyjęcia spadku",
      "Art. 1015 KC - termin do złożenia oświadczenia"
    ],
    relatedArticles: [
      "Art. 932 KC - dziedziczenie ustawowe - druga kolejność",
      "Art. 934 KC - dziedziczenie przez dziadków",
      "Art. 1011 KC - zachowek",
      "Art. 1018 KC - forma i nieodwołalność oświadczenia",
      "Art. 1020 KC - skutki odrzucenia spadku",
      "Art. 1025 KC - stwierdzenie nabycia spadku",
      "Art. 888 KC - testament",
      "Art. 1031 KC - odpowiedzialność za długi spadkowe",
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
      { actCode: 'kp', articleNumber: '94³' },  // Art. 94³ (z indeksem górnym) - mobbing
      { actCode: 'kp', articleNumber: '11' },   // równe traktowanie
      { actCode: 'kp', articleNumber: '94' },   // obowiązki pracodawcy
      { actCode: 'kp', articleNumber: '183a' }, // dyskryminacja
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 94³ KP - definicja mobbingu i ochrona przed mobbingiem",
      "Art. 11 KP - równe traktowanie w zatrudnieniu",
      "Art. 94 KP - obowiązki pracodawcy (przeciwdziałanie mobbingowi)"
    ],
    relatedArticles: [
      "Art. 183a-183e KP - dyskryminacja w zatrudnieniu",
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
  },

  /**
   * PRAWO O RUCHU DROGOWYM (Traffic Law)
   */
  jazda_warunki_zmniejszonej_widocznosci: {
    name: "Jazda w warunkach zmniejszonej przejrzystości powietrza",
    keywords: ["mgła", "deszcz", "śnieg", "widoczność", "światła", "art 30", "warunki atmosferyczne"],
    mcpArticles: [
      { actCode: 'prd', articleNumber: '30' },
      { actCode: 'prd', articleNumber: '29' }, // ostrzeganie
    ],
    mainActs: [
      "Ustawa z dnia 20 czerwca 1997 r. - Prawo o ruchu drogowym"
    ],
    mainArticles: [
      "Art. 30 - jazda w warunkach zmniejszonej przejrzystości powietrza (mgła, opady)",
      "Art. 29 - ostrzeganie"
    ],
    relatedArticles: [
      "Art. 51 - oświetlenie pojazdów",
      "Art. 20 - dostosowanie prędkości do warunków",
      "Art. 3 - definicje"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001251"
  },

  predkosc_jazdy: {
    name: "Prędkość jazdy",
    keywords: ["prędkość", "limit", "ograniczenie", "przekroczenie prędkości", "mandat"],
    mcpArticles: [
      { actCode: 'prd', articleNumber: '20' },
      { actCode: 'prd', articleNumber: '92a' }, // punkty karne
    ],
    mainActs: [
      "Ustawa z dnia 20 czerwca 1997 r. - Prawo o ruchu drogowym"
    ],
    mainArticles: [
      "Art. 20 - dostosowanie prędkości do warunków ruchu",
      "Art. 92a - punkty karne za przekroczenie prędkości"
    ],
    relatedArticles: [
      "Art. 92 - mandaty karne",
      "Art. 97 - zatrzymanie prawa jazdy"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001251"
  },

  punkty_karne: {
    name: "Punkty karne",
    keywords: ["punkty", "punkty karne", "ewidencja kierowców", "zatrzymanie prawa jazdy", "ile punktów", "sprawdzenie punktów", "kasowanie punktów", "resetowanie punktów", "utrata prawa jazdy", "24 punkty", "20 punktów", "kurs reedukacyjny", "punkty za przekroczenie prędkości"],
    mcpArticles: [
      { actCode: 'prd', articleNumber: '92a' },
      { actCode: 'prd', articleNumber: '97' },
    ],
    mainActs: [
      "Ustawa z dnia 20 czerwca 1997 r. - Prawo o ruchu drogowym"
    ],
    mainArticles: [
      "Art. 92a - system punktów karnych",
      "Art. 97 - zatrzymanie prawa jazdy"
    ],
    relatedArticles: [
      "Art. 92 - mandaty karne",
      "Art. 101 - kasowanie punktów"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001251"
  },

  prawo_jazdy: {
    name: "Prawo jazdy - kategorie i uprawnienia",
    keywords: ["prawo jazdy", "kategorie", "uprawnienia", "egzamin", "kurs"],
    mcpArticles: [
      { actCode: 'prd', articleNumber: '87' },
      { actCode: 'prd', articleNumber: '88' },
    ],
    mainActs: [
      "Ustawa z dnia 20 czerwca 1997 r. - Prawo o ruchu drogowym"
    ],
    mainArticles: [
      "Art. 87 - kategorie prawa jazdy",
      "Art. 88 - warunki uzyskania prawa jazdy"
    ],
    relatedArticles: [
      "Art. 89 - egzamin na prawo jazdy",
      "Art. 96 - cofnięcie uprawnień"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001251"
  },

  /**
   * WINDYKACJA DŁUGU (Debt Collection)
   */
  windykacja: {
    name: "Windykacja długu i egzekucja",
    keywords: ["windykacja", "dług", "długi", "wierzyciel", "dłużnik", "egzekucja", "należność", "spłata", "przedawnienie", "przedawnienie długu", "6 lat", "3 lata", "odsetki za opóźnienie", "komornik", "tytuł wykonawczy", "nakaz zapłaty", "postępowanie egzekucyjne", "nieuregulowana należność", "dochodzenie długu"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '117' },  // przedawnienie roszczeń - ogólne
      { actCode: 'kc', articleNumber: '118' },  // przedawnienie - 6 lat (podstawa)
      { actCode: 'kc', articleNumber: '455' },  // termin spełnienia świadczenia
      { actCode: 'kc', articleNumber: '471' },  // odpowiedzialność za niewykonanie zobowiązania
      { actCode: 'kc', articleNumber: '476' },  // odpowiedzialność za pomocnika
      { actCode: 'kc', articleNumber: '481' },  // odsetki za opóźnienie
      { actCode: 'kpc', articleNumber: '776' }, // wszczęcie egzekucji
      { actCode: 'kpc', articleNumber: '805' }, // egzekucja z ruchomości
    ],
    mainActs: [
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny",
      "Ustawa z dnia 17 listopada 1964 r. - Kodeks postępowania cywilnego"
    ],
    mainArticles: [
      "Art. 117 KC - ogólne zasady przedawnienia",
      "Art. 118 KC - przedawnienie 6-letnie i 3-letnie",
      "Art. 455 KC - termin spełnienia świadczenia",
      "Art. 471 KC - odpowiedzialność za niewykonanie zobowiązania",
      "Art. 481 KC - odsetki ustawowe za opóźnienie"
    ],
    relatedArticles: [
      "Art. 117-125 KC - przepisy o przedawnieniu",
      "Art. 476 KC - odpowiedzialność za pomocnika",
      "Art. 487 KC - obowiązek naprawienia szkody",
      "Art. 776-1088 KPC - postępowanie egzekucyjne",
      "Art. 805 KPC - egzekucja z ruchomości"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  /**
   * ZNIESŁAWIENIE (Defamation)
   */
  znieslawienie: {
    name: "Zniesławienie",
    keywords: ["zniesławienie", "zniesławiony", "pomówienie", "zniesławił", "oczernianie", "poniżenie", "zniesławiająca", "internet", "facebook", "twitter", "social media"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '212' },  // zniesławienie
      { actCode: 'kk', articleNumber: '213' },  // zniesławienie publicznie lub w mediach
      { actCode: 'kk', articleNumber: '216' },  // zniewaga (powiązane)
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 212 - zniesławienie",
      "Art. 213 - publiczne zniesławienie lub w mediach"
    ],
    relatedArticles: [
      "Art. 214 - dowód prawdy",
      "Art. 216 - zniewaga",
      "Art. 23 KC - ochrona dóbr osobistych",
      "Art. 24 KC - roszczenia z tytułu naruszenia dóbr osobistych"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  /**
   * DECYZJE ADMINISTRACYJNE (Administrative Decisions)
   */
  decyzje_administracyjne: {
    name: "Decyzje administracyjne - odwołanie i zaskarżenie",
    keywords: ["decyzja administracyjna", "decyzji administracyjnej", "odwołanie od decyzji", "zaskarżenie decyzji", "kpa", "organ administracyjny", "samorządowe kolegium odwoławcze", "sąd administracyjny"],
    mcpArticles: [
      { actCode: 'kpa', articleNumber: '127' },  // odwołanie od decyzji
      { actCode: 'kpa', articleNumber: '129' },  // termin na odwołanie
      { actCode: 'kpa', articleNumber: '138' },  // rozpatrzenie odwołania
      { actCode: 'kpa', articleNumber: '3' },    // zasada prawdy obiektywnej
    ],
    mainActs: [
      "Ustawa z dnia 14 czerwca 1960 r. - Kodeks postępowania administracyjnego"
    ],
    mainArticles: [
      "Art. 127 KPA - prawo do odwołania od decyzji",
      "Art. 129 KPA - termin na wniesienie odwołania (14 dni)",
      "Art. 138 KPA - rozpatrzenie odwołania"
    ],
    relatedArticles: [
      "Art. 131 KPA - wniesienie odwołania przez pełnomocnika",
      "Art. 141 KPA - ponowne rozpatrzenie sprawy",
      "Art. 145 KPA - skarga do sądu administracyjnego",
      "Art. 61 KPA - uzasadnienie decyzji"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19600300168"
  },

  dostep_do_informacji_publicznej: {
    name: "Dostęp do informacji publicznej",
    keywords: ["dostęp do informacji", "informacja publiczna", "wniosek o informację", "informacji publicznej", "udostępnienie informacji", "wniosek o udostępnienie"],
    mcpArticles: [
      { actCode: 'uodip', articleNumber: '13' },  // termin odpowiedzi (14 dni)
      { actCode: 'uodip', articleNumber: '10' },  // forma wniosku
      { actCode: 'uodip', articleNumber: '14' },  // odmowa udostępnienia
      { actCode: 'uodip', articleNumber: '16' },  // skarga do sądu administracyjnego
    ],
    mainActs: [
      "Ustawa z dnia 6 września 2001 r. o dostępie do informacji publicznej"
    ],
    mainArticles: [
      "Art. 13 - termin odpowiedzi na wniosek (bez zbędnej zwłoki, nie później niż w terminie 14 dni)",
      "Art. 10 - forma wniosku o udostępnienie informacji",
      "Art. 14 - odmowa udostępnienia informacji",
      "Art. 16 - skarga do sądu administracyjnego"
    ],
    relatedArticles: [
      "Art. 1 - przedmiot ustawy",
      "Art. 2 - zasady udostępniania informacji",
      "Art. 3 - prawo dostępu do informacji publicznej",
      "Art. 4 - informacja publiczna - definicja",
      "Art. 5 - podmioty zobowiązane",
      "Art. 15 - wniosek o ponowne rozpatrzenie sprawy"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20011121198"
  },

  /**
   * PODATEK DOCHODOWY (Income Tax)
   */
  pit: {
    name: "Podatek dochodowy od osób fizycznych (PIT)",
    keywords: ["pit", "podatek dochodowy", "zeznanie podatkowe", "zeznanie roczne", "termin złożenia", "deklaracja podatkowa", "rozliczenie pit", "pit 37", "pit 36", "pit 38", "pit 28", "30 kwietnia", "rozliczenie roczne", "zwrot podatku", "ulga podatkowa", "odliczenia", "skala podatkowa", "podatek liniowy"],
    mcpArticles: [
      { actCode: 'pit', articleNumber: '45' },   // obowiązek złożenia zeznania
      { actCode: 'op', articleNumber: '70' },    // terminy załatwiania spraw
    ],
    mainActs: [
      "Ustawa z dnia 26 lipca 1991 r. o podatku dochodowym od osób fizycznych",
      "Ustawa z dnia 29 sierpnia 1997 r. - Ordynacja podatkowa"
    ],
    mainArticles: [
      "Art. 45 ustawy o PIT - obowiązek złożenia zeznania podatkowego (termin: do 30 kwietnia)",
      "Art. 70 Ordynacji podatkowej - terminy załatwiania spraw podatkowych"
    ],
    relatedArticles: [
      "Art. 44 ustawy o PIT - obliczanie podatku",
      "Art. 46 ustawy o PIT - uproszczone zeznanie podatkowe",
      "Art. 47 ustawy o PIT - wpłata podatku",
      "Art. 73 Ordynacji podatkowej - skutki niedotrzymania terminu"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240000226"
  },

  /**
   * ODSTĄPIENIE OD UMOWY NA ODLEGŁOŚĆ (Distance Contract Withdrawal)
   */
  odstapienie_umowy_na_odleglosc: {
    name: "Odstąpienie od umowy zawartej na odległość",
    keywords: ["odstąpienie od umowy", "umowa na odległość", "sklep internetowy", "zakupy online", "zwrot towaru", "14 dni", "prawo konsumenta"],
    mcpArticles: [
      { actCode: 'upk', articleNumber: '27' },  // prawo odstąpienia (14 dni)
      { actCode: 'upk', articleNumber: '29' },  // zwrot pieniędzy
      { actCode: 'upk', articleNumber: '38' },  // wyjątki od prawa odstąpienia
    ],
    mainActs: [
      "Ustawa z dnia 30 maja 2014 r. o prawach konsumenta"
    ],
    mainArticles: [
      "Art. 27 - prawo odstąpienia od umowy (14 dni)",
      "Art. 29 - zwrot płatności",
      "Art. 38 - wyjątki od prawa odstąpienia"
    ],
    relatedArticles: [
      "Art. 28 - forma odstąpienia",
      "Art. 31 - koszty odesłania towaru",
      "Art. 32 - obowiązki konsumenta",
      "Art. 34 - odpowiedzialność za zmniejszenie wartości towaru"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827"
  },

  /**
   * PRAWO PRACY - ROZSZERZENIE (Labor Law - Extended)
   */
  czas_pracy_nadgodziny: {
    name: "Czas pracy i nadgodziny",
    keywords: ["czas pracy", "nadgodziny", "praca w godzinach nadliczbowych", "dobowy czas pracy", "tygodniowy czas pracy", "8 godzin", "40 godzin", "dodatek za nadgodziny", "praca w niedzielę", "praca w święto"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '128' },  // normy czasu pracy
      { actCode: 'kp', articleNumber: '129' },  // dobowy czas pracy (8h)
      { actCode: 'kp', articleNumber: '130' },  // tygodniowy czas pracy (40h)
      { actCode: 'kp', articleNumber: '151' },  // nadgodziny - definicja i limit
      { actCode: 'kp', articleNumber: '1511' }, // rekompensata za nadgodziny
      { actCode: 'kp', articleNumber: '1512' }, // dodatek za pracę w nocy
      { actCode: 'kp', articleNumber: '151³' }, // praca w niedzielę i święto
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 128 - normy czasu pracy",
      "Art. 129 - dobowy czas pracy (8 godzin)",
      "Art. 130 - tygodniowy czas pracy (40 godzin w 5-dniowym tygodniu)",
      "Art. 151 - praca w godzinach nadliczbowych (nadgodziny)",
      "Art. 1511 - rekompensata za nadgodziny (dodatek 50% lub 100%, albo czas wolny)"
    ],
    relatedArticles: [
      "Art. 132 - systemy czasu pracy",
      "Art. 135 - pora nocna (21:00-07:00)",
      "Art. 1512 - dodatek za pracę w porze nocnej (20%)",
      "Art. 151³ - praca w niedzielę i święto",
      "Art. 152 - norma dla prac szkodliwych"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  zwolnienie_lekarskie_l4: {
    name: "Zwolnienie lekarskie (L4) i zasiłek chorobowy",
    keywords: ["zwolnienie lekarskie", "l4", "el4", "e-zwolnienie", "zasiłek chorobowy", "chore", "niezdolność do pracy", "wynagrodzenie chorobowe", "zus"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '92' },   // obowiązki pracodawcy - ochrona zdrowia
      { actCode: 'kp', articleNumber: '234' },  // przyczyny usprawiedliwiające nieobecność
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy",
      "Ustawa z dnia 25 czerwca 1999 r. o świadczeniach pieniężnych z ubezpieczenia społecznego w razie choroby i macierzyństwa"
    ],
    mainArticles: [
      "Art. 92 KP - ochrona zdrowia pracowników",
      "Art. 234 KP - usprawiedliwiona nieobecność w pracy",
      "Art. 6 Ustawy zasiłkowej - zasiłek chorobowy (80% podstawy wymiaru)",
      "Art. 9 Ustawy zasiłkowej - wynagrodzenie chorobowe za 33 dni (80% lub 100%)"
    ],
    relatedArticles: [
      "Art. 17 Ustawy zasiłkowej - wysokość zasiłku",
      "Art. 41 Ustawy zasiłkowej - niezdolność do pracy",
      "Art. 52 KP - urlop wypoczynkowy po zwolnieniu"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  swiadectwo_pracy: {
    name: "Świadectwo pracy",
    keywords: ["świadectwo pracy", "wydanie świadectwa", "termin wydania świadectwa", "treść świadectwa", "sprostowanie świadectwa"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '97' },  // świadectwo pracy
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 97 - obowiązek wydania świadectwa pracy (w dniu zakończenia pracy)",
      "§ 1 - termin wydania",
      "§ 2 - treść świadectwa",
      "§ 3 - sprostowanie lub uzupełnienie"
    ],
    relatedArticles: [
      "Rozporządzenie w sprawie świadectwa pracy",
      "Art. 98 KP - kara za niewydanie świadectwa"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  umowa_o_prace: {
    name: "Umowa o pracę - zawarcie i rodzaje",
    keywords: ["umowa o pracę", "zawarcie umowy", "rodzaje umowy", "na czas nieokreślony", "na czas określony", "na okres próbny", "umowa na zastępstwo", "umowa terminowa"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '25' },  // rodzaje umów
      { actCode: 'kp', articleNumber: '251' }, // umowa na czas określony - limit 33 miesięcy
      { actCode: 'kp', articleNumber: '26' },  // okres próbny
      { actCode: 'kp', articleNumber: '29' },  // forma umowy
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 25 - rodzaje umów o pracę (nieokreślony, określony, próbny, zastępstwo, sezonowa)",
      "Art. 251 - limit umów na czas określony (33 miesiące, max 3 umowy)",
      "Art. 26 - umowa na okres próbny (max 3 miesiące)",
      "Art. 29 - forma pisemna umowy (przed dopuszczeniem do pracy)"
    ],
    relatedArticles: [
      "Art. 27 - rozwiązanie w okresie próbnym (3 dni, 1 tydzień, 2 tygodnie)",
      "Art. 30 - okresy wypowiedzenia",
      "Art. 211 - zasada równego traktowania"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  dyskryminacja_w_pracy: {
    name: "Dyskryminacja w zatrudnieniu",
    keywords: ["dyskryminacja", "dyskryminacja w pracy", "równe traktowanie", "mobbing", "molestowanie seksualne", "nierówne traktowanie", "płeć", "wiek", "niepełnosprawność", "pochodzenie"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '183a' }, // równe traktowanie - zakaz dyskryminacji
      { actCode: 'kp', articleNumber: '183b' }, // definicja dyskryminacji bezpośredniej i pośredniej
      { actCode: 'kp', articleNumber: '183c' }, // molestowanie i molestowanie seksualne
      { actCode: 'kp', articleNumber: '183d' }, // ciężar dowodu
      { actCode: 'kp', articleNumber: '183e' }, // zadośćuczynienie i odszkodowanie
      { actCode: 'kp', articleNumber: '11' },   // równe traktowanie w zatrudnieniu
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 183a - zakaz dyskryminacji w zatrudnieniu",
      "Art. 183b - definicja dyskryminacji bezpośredniej i pośredniej",
      "Art. 183c - molestowanie i molestowanie seksualne jako dyskryminacja",
      "Art. 183e - odszkodowanie za dyskryminację (min. minimalne wynagrodzenie)"
    ],
    relatedArticles: [
      "Art. 11 - równe traktowanie w zatrudnieniu",
      "Art. 113 - ochrona przed mobbingiem",
      "Art. 18³d - odwrócony ciężar dowodu"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  urlop_bezplatny: {
    name: "Urlop bezpłatny",
    keywords: ["urlop bezpłatny", "bezpłatny urlop", "zwolnienie z pracy bez wynagrodzenia", "urlop na własny wniosek"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '174' }, // urlop bezpłatny
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 174 - urlop bezpłatny (na wniosek pracownika, za zgodą pracodawcy)"
    ],
    relatedArticles: [
      "Art. 175 - skutki urlopu bezpłatnego dla uprawnień pracowniczych"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  odpowiedzialnosc_materialna_pracownika: {
    name: "Odpowiedzialność materialna pracownika",
    keywords: ["odpowiedzialność materialna", "szkoda wyrządzona pracodawcy", "niedobór", "zniszczenie mienia", "odszkodowanie dla pracodawcy"],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '114' }, // odpowiedzialność za szkodę
      { actCode: 'kp', articleNumber: '115' }, // wyłączenie odpowiedzialności
      { actCode: 'kp', articleNumber: '116' }, // wysokość odszkodowania
      { actCode: 'kp', articleNumber: '124' }, // odpowiedzialność pełna
    ],
    mainActs: [
      "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy"
    ],
    mainArticles: [
      "Art. 114 - odpowiedzialność pracownika za szkodę wyrządzoną pracodawcy",
      "Art. 115 - wyłączenie odpowiedzialności (siła wyższa, wina pracodawcy)",
      "Art. 116 - wysokość odszkodowania (rzeczywista szkoda, max 3-miesięczne wynagrodzenie)",
      "Art. 124 - odpowiedzialność w pełnej wysokości (umyślne wyrządzenie szkody)"
    ],
    relatedArticles: [
      "Art. 119 - odpowiedzialność za mienie powierzone",
      "Art. 125 - odpowiedzialność członków zespołu"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141"
  },

  /**
   * PRAWO RODZINNE - ROZSZERZENIE (Family Law - Extended)
   */
  rozwod: {
    name: "Rozwód",
    keywords: ["rozwód", "rozwodu", "rozwiązanie małżeństwa", "orzeczenie rozwodu", "małżeństwo rozwiązane", "wina rozwodowa", "separacja", "pozew o rozwód"],
    mcpArticles: [
      { actCode: 'kro', articleNumber: '56' },  // rozwód - przesłanki
      { actCode: 'kro', articleNumber: '57' },  // dobro wspólnych małoletnich dzieci
      { actCode: 'kro', articleNumber: '58' },  // skutki rozwodu
      { actCode: 'kro', articleNumber: '60' },  // alimenty po rozwodzie
    ],
    mainActs: [
      "Ustawa z dnia 25 lutego 1964 r. - Kodeks rodzinny i opiekuńczy"
    ],
    mainArticles: [
      "Art. 56 - przesłanki rozwodu (zupełny i trwały rozkład pożycia)",
      "Art. 57 - odmowa rozwodu ze względu na dobro małoletnich dzieci",
      "Art. 58 - skutki rozwodu (ustanie małżeńskiej wspólności majątkowej)",
      "Art. 60 - alimenty dla rozwiedzionego małżonka"
    ],
    relatedArticles: [
      "Art. 61 - wina rozkładu pożycia",
      "Art. 611 - separacja jako alternatywa rozwodu"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640090059"
  },

  wspolnosc_malzenska: {
    name: "Wspólność majątkowa małżeńska",
    keywords: ["wspólność majątkowa", "majątek wspólny", "podział majątku", "majątek osobisty", "intercyza", "rozdzielność majątkowa", "umowa majątkowa małżeńska"],
    mcpArticles: [
      { actCode: 'kro', articleNumber: '31' },  // ustroje majątkowe
      { actCode: 'kro', articleNumber: '47' },  // intercyza - umowa majątkowa
      { actCode: 'kro', articleNumber: '31¹' }, // wspólność ustawowa
      { actCode: 'kro', articleNumber: '33' },  // majątek wspólny
      { actCode: 'kro', articleNumber: '45' },  // podział majątku wspólnego
    ],
    mainActs: [
      "Ustawa z dnia 25 lutego 1964 r. - Kodeks rodzinny i opiekuńczy"
    ],
    mainArticles: [
      "Art. 31 - ustroje majątkowe małżeńskie (ustawowa wspólność, umowna)",
      "Art. 31¹ - ustawowa wspólność majątkowa",
      "Art. 33 - majątek wspólny (nabyty w czasie trwania wspólności)",
      "Art. 45 - podział majątku wspólnego po ustaniu wspólności",
      "Art. 47 - intercyza (umowa majątkowa małżeńska) - forma aktu notarialnego"
    ],
    relatedArticles: [
      "Art. 34 - majątek osobisty każdego z małżonków",
      "Art. 36 - zarząd majątkiem wspólnym",
      "Art. 41 - rozdzielność majątkowa"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640090059"
  },

  wladza_rodzicielska: {
    name: "Władza rodzicielska",
    keywords: ["władza rodzicielska", "opieka nad dzieckiem", "kontakty z dzieckiem", "piecza nad dzieckiem", "przedstawicielstwo ustawowe", "ograniczenie władzy rodzicielskiej", "pozbawienie władzy"],
    mcpArticles: [
      { actCode: 'kro', articleNumber: '95' },  // treść władzy rodzicielskiej
      { actCode: 'kro', articleNumber: '96' },  // obowiązki i prawa rodziców
      { actCode: 'kro', articleNumber: '97' },  // przedstawicielstwo ustawowe
      { actCode: 'kro', articleNumber: '107' }, // ograniczenie władzy rodzicielskiej
      { actCode: 'kro', articleNumber: '111' }, // pozbawienie władzy rodzicielskiej
      { actCode: 'kro', articleNumber: '113' }, // kontakty z dzieckiem
    ],
    mainActs: [
      "Ustawa z dnia 25 lutego 1964 r. - Kodeks rodzinny i opiekuńczy"
    ],
    mainArticles: [
      "Art. 95 - władza rodzicielska obejmuje pieczę nad osobą i majątkiem dziecka",
      "Art. 96 - obowiązki i prawa rodziców (wychowanie, troska o zdrowie i rozwój)",
      "Art. 97 - przedstawicielstwo ustawowe dziecka",
      "Art. 107 - ograniczenie władzy rodzicielskiej przez sąd",
      "Art. 111 - pozbawienie władzy rodzicielskiej (nadużycia, trwałe zaniedbanie)"
    ],
    relatedArticles: [
      "Art. 98 - wykonywanie władzy przez oboje rodziców",
      "Art. 113 - kontakty rodziców z dzieckiem",
      "Art. 58 § 1a - regulacja władzy rodzicielskiej po rozwodzie"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640090059"
  },

  /**
   * PRAWO KARNE - ROZSZERZENIE (Criminal Law - Extended)
   */
  jazda_po_alkoholu: {
    name: "Jazda pod wpływem alkoholu",
    keywords: ["jazda po alkoholu", "pijany kierowca", "prowadzenie pojazdu w stanie nietrzeźwości", "0.2 promila", "0.5 promila", "stan po użyciu alkoholu", "stan nietrzeźwości", "utrata prawa jazdy"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '178a' }, // prowadzenie pojazdu w stanie nietrzeźwości lub po użyciu
      { actCode: 'kk', articleNumber: '178' },  // sprowadzenie niebezpieczeństwa w ruchu
      { actCode: 'prd', articleNumber: '45' },  // stan po użyciu / stan nietrzeźwości (PRD)
      { actCode: 'prd', articleNumber: '135' }, // zakaz prowadzenia w stanie nietrzeźwości
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny",
      "Ustawa z dnia 20 czerwca 1997 r. - Prawo o ruchu drogowym"
    ],
    mainArticles: [
      "Art. 178a KK - prowadzenie pojazdu w stanie nietrzeźwości (kara grzywny, ograniczenia wolności lub pozbawienia do 3 lat + zakaz prowadzenia)",
      "Art. 45 PRD - definicje: stan po użyciu (0,2-0,5‰), stan nietrzeźwości (powyżej 0,5‰)",
      "Art. 135 PRD - zakaz prowadzenia w stanie po użyciu alkoholu lub w stanie nietrzeźwości"
    ],
    relatedArticles: [
      "Art. 178 KK - sprowadzenie niebezpieczeństwa w komunikacji",
      "Art. 42 KK - zakaz prowadzenia pojazdów (środek karny)",
      "Art. 43 KK - świadczenie pieniężne"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  groźby_karalne: {
    name: "Groźby karalne",
    keywords: ["groźby", "groźba karalna", "groźba bezprawna", "grożenie", "groził", "zagrożenie"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '190' }, // groźba karalna
      { actCode: 'kk', articleNumber: '191' }, // groźba karana
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 190 - groźba karalna (groźba popełnienia przestępstwa na szkodę zagrożonego lub jego bliskich)",
      "Art. 191 - groźba bezprawna (groźba rozgłoszenia wiadomości)"
    ],
    relatedArticles: [
      "Art. 190a - uporczywe nękanie (stalking)",
      "Art. 217 - groźba wobec funkcjonariusza publicznego"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  stalking_nekanie: {
    name: "Stalking (uporczywe nękanie)",
    keywords: ["stalking", "nękanie", "uporczywe nękanie", "stalkowanie", "prześladowanie", "nachodzenie"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '190a' }, // uporczywe nękanie (stalking)
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 190a - uporczywe nękanie (stalking) - nachodzenie, śledzenie, wywoływanie poczucia zagrożenia"
    ],
    relatedArticles: [
      "Art. 190 - groźba karalna",
      "Art. 191 - groźba bezprawna"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  niealimentacja: {
    name: "Niealimentacja (uchylanie się od alimentów)",
    keywords: ["niealimentacja", "uchylanie się od alimentów", "brak alimentów", "niepłacenie alimentów", "alimenty nie płaci"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '209' }, // uchylanie się od alimentów
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 209 - uchylanie się od obowiązku alimentacyjnego (kara grzywny lub ograniczenia wolności)"
    ],
    relatedArticles: [
      "Art. 133 KRO - obowiązek alimentacyjny",
      "Art. 138 KRO - alimenty między małżonkami"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  wypadek_drogowy: {
    name: "Wypadek drogowy i spowodowanie wypadku",
    keywords: ["wypadek", "wypadek drogowy", "kolizja", "spowodowanie wypadku", "nieudzielenie pomocy", "ucieczka z miejsca wypadku"],
    mcpArticles: [
      { actCode: 'kk', articleNumber: '177' },  // sprowadzenie wypadku w ruchu
      { actCode: 'kk', articleNumber: '178' },  // sprowadzenie bezpośredniego niebezpieczeństwa
      { actCode: 'kk', articleNumber: '162' },  // nieudzielenie pomocy
    ],
    mainActs: [
      "Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
    ],
    mainArticles: [
      "Art. 177 - sprowadzenie katastrofy w ruchu (śmierć lub ciężki uszczerbek na zdrowiu)",
      "Art. 178 - sprowadzenie bezpośredniego niebezpieczeństwa katastrofy w ruchu",
      "Art. 162 - nieudzielenie pomocy osobie w stanie zagrożenia życia lub zdrowia"
    ],
    relatedArticles: [
      "Art. 173 - narażenie na bezpośrednie niebezpieczeństwo",
      "Art. 178a - prowadzenie w stanie nietrzeźwości"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553"
  },

  /**
   * PRAWO KONSUMENCKIE - ROZSZERZENIE (Consumer Law - Extended)
   */
  kredyt_konsumencki: {
    name: "Kredyt konsumencki",
    keywords: ["kredyt konsumencki", "kredyt gotówkowy", "pożyczka", "rrso", "rzeczywista roczna stopa oprocentowania", "harmonogram spłat", "odstąpienie od kredytu", "kredyt w banku"],
    mcpArticles: [
      { actCode: 'upk', articleNumber: '30' },  // prawo odstąpienia od umowy kredytu (14 dni)
      { actCode: 'upk', articleNumber: '45' },  // całkowity koszt kredytu
      { actCode: 'upk', articleNumber: '47' },  // RRSO
      { actCode: 'upk', articleNumber: '54' },  // prawo wcześniejszej spłaty
    ],
    mainActs: [
      "Ustawa z dnia 30 maja 2014 r. o prawach konsumenta"
    ],
    mainArticles: [
      "Art. 30 - prawo odstąpienia od umowy kredytu konsumenckiego (14 dni)",
      "Art. 45 - całkowity koszt kredytu",
      "Art. 47 - rzeczywista roczna stopa oprocentowania (RRSO)",
      "Art. 54 - prawo do wcześniejszej spłaty kredytu"
    ],
    relatedArticles: [
      "Art. 49 - obowiązki przedsiębiorcy przed zawarciem umowy",
      "Art. 51 - umowa kredytu - forma pisemna"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827"
  },

  klauzule_abuzywne: {
    name: "Niedozwolone klauzule umowne (klauzule abuzywne)",
    keywords: ["klauzule abuzywne", "niedozwolone postanowienia", "nieuczciwe klauzule", "klauzula niedozwolona", "wzorzec umowny", "umowa kredytu frankowego", "indeksacja walutowa"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '385¹' }, // niedozwolone postanowienia umowne
      { actCode: 'kc', articleNumber: '385²' }, // wzorce umowne
      { actCode: 'kc', articleNumber: '385³' }, // kontrola wzorców umownych
    ],
    mainActs: [
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny"
    ],
    mainArticles: [
      "Art. 385¹ - niedozwolone postanowienia umowne (abuzywne) - sprzeczne z dobrymi obyczajami, rażąco naruszające interes konsumenta",
      "Art. 385² - wzorce umowne i ich związanie konsumenta",
      "Art. 385³ - kontrola wzorców umownych przez sąd"
    ],
    relatedArticles: [
      "Art. 58 KC - nieważność czynności prawnej",
      "Art. 353¹ KC - swoboda umów"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  /**
   * PRAWO MIESZKANIOWE - ROZSZERZENIE (Housing Law - Extended)
   */
  kupno_nieruchomosci: {
    name: "Kupno nieruchomości (mieszkania, domu)",
    keywords: ["kupno mieszkania", "kupno domu", "kupno nieruchomości", "akt notarialny", "umowa przedwstępna", "sprzedaż nieruchomości", "księga wieczysta", "notariusz", "zadatek"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '155' },  // akt notarialny - forma dla nieruchomości
      { actCode: 'kc', articleNumber: '158' },  // forma aktu notarialnego pod rygorem nieważności
      { actCode: 'kc', articleNumber: '389' },  // umowa przedwstępna
      { actCode: 'kc', articleNumber: '394' },  // zadatek
      { actCode: 'kc', articleNumber: '535' },  // umowa sprzedaży
    ],
    mainActs: [
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny",
      "Ustawa z dnia 6 lipca 1982 r. o księgach wieczystych i hipotece"
    ],
    mainArticles: [
      "Art. 158 KC - umowa przenosząca własność nieruchomości wymaga formy aktu notarialnego pod rygorem nieważności",
      "Art. 155 KC - własność nieruchomości przechodzi na nabywcę z chwilą zawarcia umowy (wpis do księgi wieczystej ma charakter deklaratoryjny)",
      "Art. 389 KC - umowa przedwstępna (zobowiązanie do zawarcia umowy przyrzeczonej)",
      "Art. 394 KC - zadatek"
    ],
    relatedArticles: [
      "Art. 535 KC - umowa sprzedaży",
      "Art. 3 Ustawy o księgach wieczystych - wpis do księgi wieczystej",
      "Art. 556 KC - rękojmia za wady"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  wspolnota_mieszkaniowa: {
    name: "Wspólnota mieszkaniowa",
    keywords: ["wspólnota mieszkaniowa", "zarząd wspólnoty", "czesne", "opłaty za mieszkanie", "fundusz remontowy", "zarządca nieruchomości", "właściciel lokalu"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '6' },    // nieruchomość lokalowa
      { actCode: 'kc', articleNumber: '13' },   // zarząd nieruchomością wspólną
      { actCode: 'kc', articleNumber: '14' },   // koszty zarządu
      { actCode: 'kc', articleNumber: '22' },   // wspólnota mieszkaniowa
    ],
    mainActs: [
      "Ustawa z dnia 24 czerwca 1994 r. o własności lokali"
    ],
    mainArticles: [
      "Art. 6 - nieruchomość lokalowa (lokal + udział w częściach wspólnych)",
      "Art. 13 - zarząd nieruchomością wspólną",
      "Art. 14 - koszty zarządu nieruchomością wspólną",
      "Art. 22 - wspólnota mieszkaniowa"
    ],
    relatedArticles: [
      "Art. 12 - prawa i obowiązki właścicieli lokali",
      "Art. 15 - fundusz remontowy",
      "Art. 18 - zarządca nieruchomości"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19940850388"
  },

  sasiedzi_halas: {
    name: "Sąsiedzi - hałas i uciążliwości",
    keywords: ["hałas", "głośni sąsiedzi", "hałas sąsiadów", "imprezy u sąsiada", "cicha godzina", "uciążliwości", "przekroczenie granic", "immisje"],
    mcpArticles: [
      { actCode: 'kc', articleNumber: '144' },  // immisje - hałas, wstrząsy, itp.
      { actCode: 'kc', articleNumber: '222' },  // roszczenia właściciela
      { actCode: 'kk', articleNumber: '191' },  // naruszenie miru domowego
    ],
    mainActs: [
      "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny",
      "Ustawa z dnia 27 kwietnia 2001 r. - Prawo ochrony środowiska"
    ],
    mainArticles: [
      "Art. 144 KC - immisje (hałas, dym, zapachy) - właściciel powinien powstrzymać się od działań przekraczających przeciętną miarę",
      "Art. 222 KC - roszczenia właściciela",
      "Art. 113 Prawa ochrony środowiska - dopuszczalne poziomy hałasu"
    ],
    relatedArticles: [
      "Art. 23 KC - dobra osobiste (spokój, zdrowie)",
      "Art. 415 KC - odpowiedzialność za szkodę",
      "Art. 191 KK - naruszenie miru domowego"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093"
  },

  /**
   * PRAWO ADMINISTRACYJNE - ROZSZERZENIE (Administrative Law - Extended)
   */
  mandat_karny: {
    name: "Mandat karny",
    keywords: ["mandat", "mandat karny", "odwołanie od mandatu", "zaskarżenie mandatu", "nie przyjąłem mandatu", "taryfikator mandatów"],
    mcpArticles: [
      { actCode: 'kkw', articleNumber: '95' },  // mandat karny
      { actCode: 'kkw', articleNumber: '96' },  // odmowa przyjęcia mandatu
      { actCode: 'kkw', articleNumber: '101' }, // odwołanie od mandatu
    ],
    mainActs: [
      "Ustawa z dnia 24 sierpnia 2001 r. - Kodeks postępowania w sprawach o wykroczenia",
      "Ustawa z dnia 20 maja 1971 r. - Kodeks wykroczeń"
    ],
    mainArticles: [
      "Art. 95 KPW - nałożenie grzywny w drodze mandatu karnego",
      "Art. 96 KPW - ukarany może odmówić przyjęcia mandatu",
      "Art. 101 KPW - wniesienie sprzeciwu od mandatu (7 dni od dnia doręczenia)"
    ],
    relatedArticles: [
      "Art. 97 KPW - skutki przyjęcia mandatu",
      "Art. 98 KPW - uiszczenie grzywny"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20011060117"
  },

  rejestracja_pojazdu: {
    name: "Rejestracja pojazdu",
    keywords: ["rejestracja pojazdu", "rejestracja samochodu", "tablice rejestracyjne", "dowód rejestracyjny", "przerejestrowani pojazdu", "wyrejestrowanie"],
    mcpArticles: [
      { actCode: 'prd', articleNumber: '73' },  // obowiązek rejestracji pojazdu
      { actCode: 'prd', articleNumber: '75' },  // termin rejestracji (30 dni)
      { actCode: 'prd', articleNumber: '78' },  // dokumenty potrzebne do rejestracji
    ],
    mainActs: [
      "Ustawa z dnia 20 czerwca 1997 r. - Prawo o ruchu drogowym"
    ],
    mainArticles: [
      "Art. 73 PRD - obowiązek rejestracji pojazdu",
      "Art. 75 PRD - termin rejestracji (30 dni od nabycia lub importu)",
      "Art. 78 PRD - dokumenty wymagane do rejestracji"
    ],
    relatedArticles: [
      "Art. 79 PRD - przerejestrowanie pojazdu przy zmianie właściciela",
      "Art. 82 PRD - wyrejestrowanie pojazdu"
    ],
    source: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001251"
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
