import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

interface ExampleQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
  lastUserQuestion?: string; // Ostatnie pytanie użytkownika do kontekstu
}

// Kategoryzowane przykładowe pytania
const QUESTION_CATEGORIES = {
  'Prawo konsumenckie': [
    'Zwrot towaru kupionego online',
    'Reklamacja wadliwego produktu',
    'Odwołanie umowy kredytu konsumenckiego',
    'Odstąpienie od umowy zawartej na odległość',
    'Rękojmia a gwarancja - jaka różnica?',
    'Zwrot pieniędzy za odwołany lot',
    'Nieuczciwwe praktyki rynkowe - jak się bronić?',
    'Umowa na odległość - prawo do odstąpienia',
    'Reklamacja usługi - naprawy samochodu',
    'Klauzule abuzywne w umowie z bankiem',
    'Windykacja długu - jakie mam prawa?',
    'Przedawnienie roszczenia konsumenckiego',
    'Zwrot kosztów dostawy przy reklamacji',
    'Zakup na raty - przedwczesna spłata',
    'Kara umowna w umowie konsumenckiej',
    'Odszkodowanie za opóźnienie w dostawie',
  ],
  'Prawo pracy': [
    'Urlop na żądanie - ile dni w roku?',
    'Wypowiedzenie umowy o pracę przez pracownika',
    'Nadgodziny - jak są płatne?',
    'Urlop macierzyński i rodzicielski - ile tygodni?',
    'Mobbing w pracy - jak się bronić?',
    'Okres wypowiedzenia - jak liczyć?',
    'Urlop wypoczynkowy - ile dni przysługuje?',
    'Zwolnienie lekarskie - jakie obowiązki?',
    'Praca zdalna - czy pracodawca może odmówić?',
    'Dyskryminacja w miejscu pracy',
    'Umowa zlecenie a umowa o pracę - różnice',
    'Wynagrodzenie za czas choroby',
    'Rozwiązanie umowy bez wypowiedzenia',
    'Ekwiwalent za niewykorzystany urlop',
    'Premia - czy pracodawca musi wypłacić?',
    'Badania okresowe - kto płaci?',
    'Kara porządkowa w pracy - jakie są zasady?',
    'Urlop bezpłatny - kiedy pracodawca musi udzielić?',
  ],
  'Prawo najmu': [
    'Wypowiedzenie umowy najmu przez najemcę',
    'Kaucja przy wynajmie - zwrot po wyprowadzce',
    'Podniesienie czynszu przez właściciela',
    'Eksmisja z mieszkania - kiedy jest możliwa?',
    'Umowa najmu na czas nieokreślony',
    'Remont mieszkania wynajmowanego - kto płaci?',
    'Podnajem mieszkania - czy jest legalny?',
    'Koszty mediów - jak rozliczyć z wynajmującym?',
    'Wypowiedzenie przez właściciela - jakie warunki?',
    'Prawo pierwokupu lokalu przez najemcę',
    'Wynajmujący nie naprawia awarii - co robić?',
    'Najem okazjonalny - czym się różni?',
    'Najemca nie płaci czynszu - eksmisja',
    'Umowa najmu - czy musi być na piśmie?',
  ],
  'Podatki': [
    'Odliczenie VAT od zakupów firmowych',
    'Ulga na dziecko w zeznaniu podatkowym',
    'Zwolnienie z podatku darowizny od rodziny',
    'Termin składania zeznania rocznego PIT',
    'Ulga termomodernizacyjna - jak rozliczyć?',
    'Podatek od sprzedaży mieszkania',
    'Koszty uzyskania przychodu - co można odliczyć?',
    'Ulga rehabilitacyjna - kto może skorzystać?',
    'Rozliczenie PIT za rok poprzedni',
    'Zwrot podatku - ile trzeba czekać?',
    'Ulga na internet - jak ją uzyskać?',
    'Podatek od spadku i darowizny - stawki',
  ],
  'Prawo rodzinne': [
    'Alimenty na dziecko - jak ustalić wysokość?',
    'Rozwód bez orzekania o winie',
    'Władza rodzicielska po rozwodzie',
    'Podział majątku po rozwodzie',
    'Separacja małżeńska - jak wygląda procedura?',
    'Ustalenie ojcostwa - kto może wnioskować?',
    'Zmiana nazwiska dziecka po rozwodzie',
    'Kontakty z dzieckiem po rozwodzie',
    'Alimenty na współmałżonka po rozwodzie',
    'Wspólność majątkowa małżeńska - jak działa?',
    'Przysposobienie dziecka - jakie warunki?',
    'Ubezwłasnowolnienie osoby chorej psychicznie',
  ],
  'Prawo karne': [
    'Przedawnienie wykroczenia drogowego',
    'Obrona konieczna - kiedy jest legalna?',
    'Zniesławienie w internecie - jak się bronić?',
    'Kradzież w sklepie - jakie konsekwencje?',
    'Prowadzenie pojazdu po alkoholu - kara',
    'Oszustwo - czym się różni od wyłudzenia?',
    'Groźby karalne - kiedy można zgłosić?',
    'Napaść - czym różni się od pobicia?',
    'Wyłudzenie kredytu - odpowiedzialność karna',
    'Zatrzymanie przez policję - jakie mam prawa?',
    'Kradzież tożsamości - jak zgłosić?',
    'Stalking - jak się bronić prawnie?',
    'Przemoc domowa - gdzie szukać pomocy?',
    'Przestępstwo nieletniego - odpowiedzialność rodziców',
  ],
  'Prawo ruchu drogowego': [
    'Punkty karne - ile można mieć?',
    'Cofnięcie prawa jazdy za przekroczenie prędkości',
    'Szkoda w aucie na parkingu - kto odpowiada?',
    'Mandat za parkowanie - jak się odwołać?',
    'Kontrola drogowa - jakie mam obowiązki?',
    'Stłuczka - kto jest winny?',
    'Jazda bez prawa jazdy - jakie konsekwencje?',
    'OC sprawcy - jak dochodzić odszkodowania?',
    'Holowanie pojazdu - kiedy jest legalne?',
    'Zatrzymanie dowodu rejestracyjnego przez policję',
  ],
  'Prawo spółek i działalność gospodarcza': [
    'Założenie spółki z o.o. - jakie koszty?',
    'Jednoosobowa działalność gospodarcza - jak założyć?',
    'Odpowiedzialność wspólników w spółce jawnej',
    'Przekształcenie JDG w spółkę z o.o.',
    'Zawieszenie działalności gospodarczej',
    'Likwidacja spółki - jak przebiega?',
    'Zgromadzenie wspólników - jak często?',
    'Wynagrodzenie członka zarządu - jak ustalić?',
    'Umowa wspólników - czy jest obowiązkowa?',
    'Udziały w spółce - jak je sprzedać?',
    'KRS - wpis zmiany danych spółki',
    'Wykreślenie z CEIDG - procedura',
    'Niewypłacalność spółki - upadłość czy restrukturyzacja?',
    'Odpowiedzialność członków zarządu za długi spółki',
  ],
  'Prawo nieruchomości': [
    'Kupno mieszkania - jakie dokumenty potrzebne?',
    'Akt notarialny przy sprzedaży nieruchomości',
    'Służebność przejazdu przez cudzy grunt',
    'Zasiedzenie nieruchomości - jakie warunki?',
    'Wpis do księgi wieczystej - jak długo trwa?',
    'Hipoteka na nieruchomości - jak działa?',
    'Działka rolna - kto może kupić?',
    'Podział nieruchomości - jak przeprowadzić?',
    'Sąsiad buduje za blisko - co mogę zrobić?',
    'Zabudowa działki - jakie są wymogi?',
    'Wykup gruntu od gminy - procedura',
    'Przedwstępna umowa sprzedaży nieruchomości',
    'Ustanowienie drogi koniecznej przez działkę sąsiada',
    'Użytkowanie wieczyste - czym się różni od własności?',
  ],
  'Prawo spadkowe': [
    'Testament własnoręczny - jak napisać?',
    'Kto dziedziczy po zmarłym bez testamentu?',
    'Stwierdzenie nabycia spadku - procedura',
    'Odrzucenie spadku - w jakim terminie?',
    'Zachowek - komu przysługuje?',
    'Dział spadku - jak się odbywa?',
    'Odpowiedzialność za długi spadkowe',
    'Testament notarialny - kiedy jest potrzebny?',
    'Wydziedziczenie - czy jest możliwe?',
    'Spadek po dziadkach - kto dziedziczy?',
  ],
  'Prawo ubezpieczeń': [
    'OC posiadacza pojazdu - co obejmuje?',
    'AC - kiedy warto wykupić?',
    'Odmowa wypłaty odszkodowania z ubezpieczenia',
    'Ubezpieczenie mieszkania - co jest objęte?',
    'NNW - czym się różni od ubezpieczenia zdrowotnego?',
    'Regres ubezpieczyciela - czym jest?',
    'Szkoda całkowita w pojeździe - jak wygląda likwidacja?',
    'Ubezpieczenie OC w życiu prywatnym',
    'Ubezpieczenie turystyczne - co pokrywa?',
    'Assistance - pomoc w razie awarii auta',
    'Likwidacja szkody trwa zbyt długo - co robić?',
    'Odszkodowanie z OC sprawcy wypadku',
  ],
  'Prawo budowlane': [
    'Pozwolenie na budowę - kiedy jest wymagane?',
    'Zgłoszenie budowy - co można budować?',
    'Samowola budowlana - jakie konsekwencje?',
    'Sąsiad buduje nielegalnie - jak zgłosić?',
    'Warunki zabudowy - jak uzyskać decyzję?',
    'Budowa garażu - czy potrzebne pozwolenie?',
    'Rozbiórka budynku - jaka procedura?',
    'Odległość od granicy działki przy budowie',
    'Pozwolenie na użytkowanie - kiedy wymagane?',
    'Przyłącze do sieci - procedura',
    'Zmiana sposobu użytkowania budynku',
    'Decyzja o warunkach zabudowy - ważność',
  ],
  'Prawo autorskie i własność intelektualna': [
    'Prawa autorskie do zdjęć - jak działają?',
    'Naruszenie praw autorskich w internecie',
    'Znak towarowy - jak zarejestrować?',
    'Wykorzystanie muzyki w filmie - licencja',
    'Prawa do utworu - ile lat obowiązują?',
    'Plagiat - jak się bronić?',
    'Patent na wynalazek - procedura zgłoszenia',
    'Domena internetowa - spór o prawa',
  ],
  'Prawo administracyjne': [
    'Odwołanie od decyzji urzędu - jaki termin?',
    'Dostęp do informacji publicznej - jak wnioskować?',
    'Skarga do sądu administracyjnego',
    'Milczenie urzędu - co mogę zrobić?',
    'Decyzja administracyjna - jak ją zaskarżyć?',
    'Wniosek o wgląd do akt sprawy',
    'Postępowanie wyjaśniające w urzędzie',
    'Zaświadczenie z urzędu - obowiązek wydania',
    'Odwołanie od decyzji ZUS',
    'Kara administracyjna - jak się odwołać?',
  ],
  'RODO i ochrona danych osobowych': [
    'Prawo dostępu do moich danych osobowych',
    'Jak usunąć moje dane z firmy?',
    'Zgoda na przetwarzanie danych - jak wycofać?',
    'Wyciek danych osobowych - co mogę zrobić?',
    'Monitoring w miejscu pracy - czy jest legalny?',
    'Prawo do bycia zapomnianym w internecie',
    'Skarga do UODO - jak złożyć?',
    'Przetwarzanie danych dziecka - zgoda rodziców',
    'Marketing bez zgody - jak się bronić?',
    'Kara za naruszenie RODO - jaka wysokość?',
  ],
  'Prawo bankowe i finansowe': [
    'Kredyt frankowy - jak się bronić?',
    'Unieważnienie umowy kredytu',
    'Blokada rachunku bankowego - kiedy możliwa?',
    'Prowizja za wcześniejszą spłatę kredytu',
    'Zajęcie komornicze rachunku - co można zrobić?',
    'Odmowa udzielenia kredytu - czy bank musi uzasadnić?',
    'Karta kredytowa - jak anulować zadłużenie?',
    'Ubezpieczenie przy kredycie - czy obowiązkowe?',
    'Restrukturyzacja zadłużenia w banku',
    'Kredyt konsumencki - RRSO i całkowity koszt',
  ],
  'Prawo medyczne i zdrowotne': [
    'Odmowa przyjęcia do szpitala - co mogę zrobić?',
    'Dokumentacja medyczna - prawo dostępu',
    'Błąd medyczny - jak dochodzić odszkodowania?',
    'Zgoda na zabieg - kiedy jest wymagana?',
    'Tajemnica lekarska - kiedy może być ujawniona?',
    'Recepta - ile czasu jest ważna?',
    'NFZ - odwołanie od odmowy refundacji',
    'Pacjent ma prawo do drugiej opinii',
    'Skarga na lekarza - gdzie zgłosić?',
    'Przymusowe leczenie psychiatryczne - warunki',
  ],
  'Prawo oświatowe': [
    'Rekrutacja do szkoły - kryteria przyjęcia',
    'Ocena - jak odwołać się od decyzji nauczyciela?',
    'Nagroda lub kara dla ucznia w szkole',
    'Egzamin poprawkowy - kto ma prawo?',
    'Relegowanie ze szkoły - kiedy możliwe?',
    'Dowóz dzieci do szkoły - obowiązek gminy',
    'Religią w szkole - czy jest obowiązkowa?',
    'Dokumenty w przedszkolu - co jest wymagane?',
    'Strajk nauczycieli - czy uczniowie muszą przychodzić?',
    'Wycieczka szkolna - zgoda rodziców',
  ],
  'Prawo telekomunikacyjne i IT': [
    'Rozwiązanie umowy z operatorem - jaki termin?',
    'Przeniesienie numeru do innego operatora',
    'Reklamacja usługi internetowej',
    'Opłata za przedwczesne rozwiązanie umowy',
    'Powolny internet - czy można obniżyć rachunek?',
    'Umowa na telefon - okres zobowiązania',
    'Spam SMS - jak się bronić?',
    'Nieuczciwe praktyki operatora telekomunikacyjnego',
  ],
  'Prawo sąsiedztwa': [
    'Drzewo sąsiada rośnie na moją działkę',
    'Hałas od sąsiadów - co mogę zrobić?',
    'Parkowanie przed moim garażem',
    'Ogrodzenie między działkami - kto płaci?',
    'Ścieki z działki sąsiada na moim gruncie',
    'Psy sąsiada szczekają w nocy',
    'Wiata śmietnikowa za blisko mojej działki',
    'Budowa sąsiada zasłania mi słońce',
  ],
  'Prawo emerytalne i rentowe': [
    'Wiek emerytalny - kiedy mogę przejść na emeryturę?',
    'Renta z tytułu niezdolności do pracy',
    'Emerytura pomostowa - kto może skorzystać?',
    'Przeliczenie emerytury - jak złożyć wniosek?',
    'Renta rodzinna po zmarłym małżonku',
    'Wcześniejsza emerytura - jakie warunki?',
    'Odwołanie od decyzji ZUS o emeryturze',
    'Zasiłek pogrzebowy - kto może otrzymać?',
    'Zasiłek pielęgnacyjny - warunki otrzymania',
    'Pracuję i pobieram emeryturę - jaki podatek?',
  ],
};

// Słowa kluczowe dla każdej kategorii
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Prawo konsumenckie': ['zwrot', 'reklamacja', 'towar', 'produkt', 'konsument', 'zakup', 'online', 'sklep', 'zwrócić', 'odstąpienie', 'umowa', 'kredyt', 'rękojmia', 'gwarancja', 'lot', 'windykacja', 'abuzywne', 'dostawa', 'raty', 'kara umowna', 'opóźnienie'],
  'Prawo pracy': ['urlop', 'praca', 'pracownik', 'pracodawca', 'wypowiedzenie', 'nadgodziny', 'umowa o pracę', 'zatrudnienie', 'mobbing', 'macierzyński', 'rodzicielski', 'zwolnienie lekarskie', 'praca zdalna', 'dyskryminacja', 'zlecenie', 'ekwiwalent', 'premia', 'badania', 'kara porządkowa', 'urlop bezpłatny'],
  'Prawo najmu': ['najem', 'wynajem', 'najemca', 'wynajmujący', 'właściciel', 'kaucja', 'czynsz', 'mieszkanie', 'eksmisja', 'lokator', 'podnajem', 'remont', 'media', 'pierwokup', 'awaria', 'okazjonalny'],
  'Podatki': ['podatek', 'vat', 'pit', 'ulga', 'darowizna', 'zeznanie', 'odliczenie', 'zwolnienie', 'rozliczenie', 'termomodernizacja', 'sprzedaż mieszkania', 'koszty uzyskania', 'rehabilitacyjna', 'internet', 'spadek'],
  'Prawo rodzinne': ['alimenty', 'dziecko', 'rozwód', 'małżeństwo', 'władza rodzicielska', 'opieka', 'majątek', 'separacja', 'ojcostwo', 'nazwisko', 'kontakty', 'wspólność majątkowa', 'przysposobienie', 'ubezwłasnowolnienie'],
  'Prawo karne': ['kara', 'wykroczenie', 'przestępstwo', 'przedawnienie', 'obrona', 'zniesławienie', 'mandat', 'kradzież', 'alkohol', 'oszustwo', 'groźby', 'napaść', 'pobicie', 'wyłudzenie', 'policja', 'zatrzymanie', 'tożsamość', 'stalking', 'przemoc', 'nieletni'],
  'Prawo ruchu drogowego': ['prawo jazdy', 'mandat', 'punkty karne', 'prędkość', 'parking', 'auto', 'wypadek', 'kierowca', 'kolizja', 'kontrola drogowa', 'stłuczka', 'jazda bez prawa', 'oc', 'odszkodowanie', 'holowanie', 'dowód rejestracyjny'],
  'Prawo spółek i działalność gospodarcza': ['spółka', 'zoo', 'jdg', 'działalność', 'gospodarcza', 'wspólnik', 'zarząd', 'likwidacja', 'założenie', 'przekształcenie', 'zawieszenie', 'zgromadzenie', 'udziały', 'firma', 'biznes', 'krs', 'ceidg', 'upadłość', 'restrukturyzacja'],
  'Prawo nieruchomości': ['mieszkanie', 'nieruchomość', 'kupno', 'sprzedaż', 'akt notarialny', 'służebność', 'zasiedzenie', 'księga wieczysta', 'hipoteka', 'działka', 'podział', 'sąsiad', 'zabudowa', 'grunt', 'budowa', 'wykup', 'przedwstępna', 'droga konieczna', 'użytkowanie wieczyste'],
  'Prawo spadkowe': ['spadek', 'testament', 'dziedziczenie', 'zmarły', 'notariusz', 'odrzucenie', 'zachowek', 'dział', 'długi spadkowe', 'wydziedziczenie', 'dziadkowie', 'spadkobierca'],
  'Prawo ubezpieczeń': ['ubezpieczenie', 'oc', 'ac', 'odszkodowanie', 'polisa', 'likwidacja szkody', 'nnw', 'regres', 'szkoda całkowita', 'pojazd', 'wypłata', 'turystyczne', 'assistance'],
  'Prawo budowlane': ['budowa', 'pozwolenie', 'zgłoszenie', 'samowola', 'warunki zabudowy', 'garaż', 'rozbiórka', 'działka', 'sąsiad', 'granica', 'budynek', 'budowlane', 'użytkowanie', 'przyłącze', 'zmiana'],
  'Prawo autorskie i własność intelektualna': ['prawa autorskie', 'zdjęcia', 'naruszenie', 'znak towarowy', 'muzyka', 'film', 'licencja', 'utwór', 'plagiat', 'patent', 'wynalazek', 'domena', 'internet', 'własność intelektualna'],
  'Prawo administracyjne': ['urząd', 'decyzja', 'odwołanie', 'informacja publiczna', 'skarga', 'sąd administracyjny', 'milczenie', 'zaskarżenie', 'akta', 'postępowanie', 'zaświadczenie', 'zus', 'kara administracyjna'],
  'RODO i ochrona danych osobowych': ['rodo', 'dane osobowe', 'dostęp', 'usunięcie', 'zgoda', 'przetwarzanie', 'wyciek', 'monitoring', 'zapomnienie', 'uodo', 'dziecko', 'marketing', 'kara'],
  'Prawo bankowe i finansowe': ['kredyt', 'bank', 'frankowy', 'unieważnienie', 'rachunek', 'blokada', 'prowizja', 'spłata', 'komornik', 'zajęcie', 'karta kredytowa', 'zadłużenie', 'restrukturyzacja', 'rrso'],
  'Prawo medyczne i zdrowotne': ['szpital', 'odmowa', 'dokumentacja medyczna', 'błąd medyczny', 'zabieg', 'zgoda', 'tajemnica lekarska', 'recepta', 'nfz', 'refundacja', 'pacjent', 'lekarz', 'psychiatryczne', 'leczenie'],
  'Prawo oświatowe': ['szkoła', 'rekrutacja', 'ocena', 'nauczyciel', 'uczeń', 'egzamin', 'relegowanie', 'dowóz', 'religia', 'przedszkole', 'strajk', 'wycieczka'],
  'Prawo telekomunikacyjne i IT': ['operator', 'telefon', 'umowa', 'internet', 'rozwiązanie', 'przeniesienie numeru', 'reklamacja', 'opłata', 'zobowiązanie', 'spam', 'nieuczciwe praktyki'],
  'Prawo sąsiedztwa': ['sąsiad', 'drzewo', 'hałas', 'parkowanie', 'ogrodzenie', 'ścieki', 'psy', 'wiata', 'śmietnik', 'budowa', 'słońce'],
  'Prawo emerytalne i rentowe': ['emerytura', 'renta', 'wiek emerytalny', 'niezdolność', 'pomostowa', 'przeliczenie', 'rodzinna', 'wcześniejsza', 'zus', 'zasiłek', 'pogrzebowy', 'pielęgnacyjny', 'podatek'],
};

// Funkcja wykrywająca kategorię na podstawie słów kluczowych
const detectCategory = (question: string): string | null => {
  const lowerQuestion = question.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
      return category;
    }
  }

  return null;
};

// Funkcja do losowego wyboru pytań z różnych kategorii
const getRandomQuestions = (count: number = 6, excludeQuestions: string[] = []): string[] => {
  const allQuestions = Object.values(QUESTION_CATEGORIES).flat();
  const availableQuestions = allQuestions.filter(q => !excludeQuestions.includes(q));
  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Funkcja do pobierania pytań kontekstowych na podstawie ostatniego pytania
const getContextualQuestions = (lastQuestion: string, count: number = 3): string[] => {
  const category = detectCategory(lastQuestion);

  if (!category) {
    return [];
  }

  const categoryQuestions = QUESTION_CATEGORIES[category as keyof typeof QUESTION_CATEGORIES];

  // Losuj pytania z tej samej kategorii
  const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const ExampleQuestions = ({ onSelect, disabled, lastUserQuestion }: ExampleQuestionsProps) => {
  // Oblicz pytania do wyświetlenia
  const { contextual, general } = useMemo(() => {
    if (lastUserQuestion) {
      // Jeśli jest pytanie kontekstowe, wygeneruj pytania nawiązujące
      const contextual = getContextualQuestions(lastUserQuestion, 3);
      const general = getRandomQuestions(3, contextual);

      return { contextual, general };
    } else {
      // Jeśli nie ma kontekstu, pokaż tylko popularne pytania
      return { contextual: [], general: getRandomQuestions(6) };
    }
  }, [lastUserQuestion]);

  // Jeśli są pytania kontekstowe, pokaż dwie sekcje
  if (contextual.length > 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-4 sm:mb-6 px-2 space-y-4">
        {/* Sekcja pytań kontekstowych */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Pytania powiązane</span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {contextual.map((question, idx) => (
              <Button
                key={`contextual-${question}-${idx}`}
                variant="outline"
                onClick={() => onSelect(question)}
                disabled={disabled}
                className="text-xs sm:text-sm hover:scale-105 transition-transform duration-200 border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary hover:text-primary animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Sekcja pytań ogólnych */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>Inne pytania</span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {general.map((question, idx) => (
              <Button
                key={`general-${question}-${idx}`}
                variant="outline"
                onClick={() => onSelect(question)}
                disabled={disabled}
                className="text-xs sm:text-sm hover:scale-105 transition-transform duration-200 hover:border-primary hover:text-primary animate-fade-in"
                style={{ animationDelay: `${(contextual.length + idx) * 100}ms` }}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Jeśli nie ma pytań kontekstowych, pokaż tylko ogólne pytania
  return (
    <div className="w-full max-w-4xl mx-auto mb-4 sm:mb-6 px-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Przykładowe pytania</span>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {general.map((question, idx) => (
            <Button
              key={`general-${question}-${idx}`}
              variant="outline"
              onClick={() => onSelect(question)}
              disabled={disabled}
              className="text-xs sm:text-sm hover:scale-105 transition-transform duration-200 hover:border-primary hover:text-primary animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
