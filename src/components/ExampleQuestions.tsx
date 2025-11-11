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
    'Jak zwrócić towar kupiony online?',
    'Jak złożyć reklamację wadliwego produktu?',
    'Jak odwołać umowę kredytu konsumenckiego?',
    'Jak odstąpić od umowy zawartej na odległość?',
    'Jaka jest różnica między rękojmią a gwarancją?',
    'Jak uzyskać zwrot pieniędzy za odwołany lot?',
    'Jak bronić się przed nieuczciwymi praktykami rynkowymi?',
    'Kiedy mogę odstąpić od umowy zawartej na odległość?',
    'Jak złożyć reklamację usługi naprawy samochodu?',
    'Co to są klauzule abuzywne w umowie z bankiem?',
    'Jakie prawa mam w przypadku windykacji długu?',
    'Kiedy następuje przedawnienie roszczenia konsumenckiego?',
    'Czy mogę odzyskać koszty dostawy przy reklamacji?',
    'Czy mogę przedwcześnie spłacić zakup na raty?',
    'Czy kara umowna w umowie konsumenckiej jest legalna?',
    'Jakie odszkodowanie przysługuje za opóźnienie w dostawie?',
  ],
  'Prawo pracy': [
    'Ile dni urlopu na żądanie przysługuje w roku?',
    'Jak wypowiedzieć umowę o pracę jako pracownik?',
    'Jak są płatne nadgodziny?',
    'Ile tygodni trwa urlop macierzyński i rodzicielski?',
    'Jak bronić się przed mobbingiem w pracy?',
    'Jak liczyć okres wypowiedzenia?',
    'Ile dni urlopu wypoczynkowego mi przysługuje?',
    'Jakie mam obowiązki na zwolnieniu lekarskim?',
    'Czy pracodawca może odmówić pracy zdalnej?',
    'Jak bronić się przed dyskryminacją w miejscu pracy?',
    'Jaka jest różnica między umową zlecenia a umową o pracę?',
    'Ile wynosi wynagrodzenie za czas choroby?',
    'Kiedy można rozwiązać umowę bez wypowiedzenia?',
    'Jak obliczyć ekwiwalent za niewykorzystany urlop?',
    'Czy pracodawca musi wypłacić premię?',
    'Kto płaci za badania okresowe pracownika?',
    'Jakie są zasady nakładania kar porządkowych w pracy?',
    'Kiedy pracodawca musi udzielić urlopu bezpłatnego?',
  ],
  'Prawo najmu': [
    'Jak wypowiedzieć umowę najmu jako najemca?',
    'Kiedy właściciel musi zwrócić kaucję po wyprowadzce?',
    'Czy właściciel może podnieść czynsz?',
    'Kiedy możliwa jest eksmisja z mieszkania?',
    'Jak działa umowa najmu na czas nieokreślony?',
    'Kto płaci za remont mieszkania wynajmowanego?',
    'Czy podnajem mieszkania jest legalny?',
    'Jak rozliczyć koszty mediów z wynajmującym?',
    'Na jakich warunkach właściciel może wypowiedzieć umowę?',
    'Czy najemcy przysługuje prawo pierwokupu lokalu?',
    'Co robić gdy wynajmujący nie naprawia awarii?',
    'Czym się różni najem okazjonalny od zwykłego?',
    'Jak eksmitować najemcę, który nie płaci czynszu?',
    'Czy umowa najmu musi być sporządzona na piśmie?',
  ],
  'Podatki': [
    'Jak odliczyć VAT od zakupów firmowych?',
    'Jak rozliczyć ulgę na dziecko w zeznaniu podatkowym?',
    'Kiedy darowizna od rodziny jest zwolniona z podatku?',
    'Jaki jest termin składania zeznania rocznego PIT?',
    'Jak rozliczyć ulgę termomodernizacyjną?',
    'Jaki podatek płacę od sprzedaży mieszkania?',
    'Co można odliczyć jako koszty uzyskania przychodu?',
    'Kto może skorzystać z ulgi rehabilitacyjnej?',
    'Jak rozliczyć PIT za rok poprzedni?',
    'Ile czasu trzeba czekać na zwrot podatku?',
    'Jak uzyskać ulgę na internet?',
    'Jakie są stawki podatku od spadku i darowizny?',
  ],
  'Prawo rodzinne': [
    'Jak ustalić wysokość alimentów na dziecko?',
    'Jak przebiega rozwód bez orzekania o winie?',
    'Jak działa władza rodzicielska po rozwodzie?',
    'Jak wygląda podział majątku po rozwodzie?',
    'Jak przebiega procedura separacji małżeńskiej?',
    'Kto może wnioskować o ustalenie ojcostwa?',
    'Jak zmienić nazwisko dziecka po rozwodzie?',
    'Jak ustala się kontakty z dzieckiem po rozwodzie?',
    'Czy przysługują alimenty na współmałżonka po rozwodzie?',
    'Jak działa wspólność majątkowa małżeńska?',
    'Jakie są warunki przysposobienia dziecka?',
    'Kiedy można ubezwłasnowolnić osobę chorą psychicznie?',
  ],
  'Prawo karne': [
    'Kiedy następuje przedawnienie wykroczenia drogowego?',
    'Kiedy obrona konieczna jest legalna?',
    'Jak bronić się przed zniesławieniem w internecie?',
    'Jakie konsekwencje grożą za kradzież w sklepie?',
    'Jaka kara grozi za prowadzenie pojazdu po alkoholu?',
    'Czym oszustwo różni się od wyłudzenia?',
    'Kiedy można zgłosić groźby karalne na policję?',
    'Czym napaść różni się od pobicia?',
    'Jaka odpowiedzialność karna grozi za wyłudzenie kredytu?',
    'Jakie prawa mam podczas zatrzymania przez policję?',
    'Jak zgłosić kradzież tożsamości?',
    'Jak bronić się prawnie przed stalkingiem?',
    'Gdzie szukać pomocy w przypadku przemocy domowej?',
    'Czy rodzice ponoszą odpowiedzialność za przestępstwo nieletniego?',
  ],
  'Prawo ruchu drogowego': [
    'Ile punktów karnych można mieć na prawie jazdy?',
    'Kiedy można cofnąć prawo jazdy za przekroczenie prędkości?',
    'Kto odpowiada za szkodę w aucie na parkingu?',
    'Jak odwołać się od mandatu za parkowanie?',
    'Jakie mam obowiązki podczas kontroli drogowej?',
    'Jak ustalić winę w przypadku stłuczki?',
    'Jakie konsekwencje grożą za jazdę bez prawa jazdy?',
    'Jak dochodzić odszkodowania z OC sprawcy wypadku?',
    'Kiedy holowanie pojazdu jest legalne?',
    'Kiedy policja może zatrzymać dowód rejestracyjny?',
  ],
  'Prawo spółek i działalność gospodarcza': [
    'Jakie koszty wiążą się z założeniem spółki z o.o.?',
    'Jak założyć jednoosobową działalność gospodarczą?',
    'Jaką odpowiedzialność ponoszą wspólnicy w spółce jawnej?',
    'Jak przekształcić JDG w spółkę z o.o.?',
    'Jak zawiesić działalność gospodarczą?',
    'Jak przebiega likwidacja spółki?',
    'Jak często musi odbywać się zgromadzenie wspólników?',
    'Jak ustalić wynagrodzenie członka zarządu?',
    'Czy umowa wspólników jest obowiązkowa?',
    'Jak sprzedać udziały w spółce?',
    'Jak dokonać wpisu zmiany danych spółki w KRS?',
    'Jaka jest procedura wykreślenia z CEIDG?',
    'Kiedy wybrać upadłość a kiedy restrukturyzację spółki?',
    'Czy członkowie zarządu odpowiadają za długi spółki?',
  ],
  'Prawo nieruchomości': [
    'Jakie dokumenty są potrzebne do kupna mieszkania?',
    'Czy przy sprzedaży nieruchomości potrzebny jest akt notarialny?',
    'Jak ustanowić służebność przejazdu przez cudzy grunt?',
    'Jakie są warunki zasiedzenia nieruchomości?',
    'Jak długo trwa wpis do księgi wieczystej?',
    'Jak działa hipoteka na nieruchomości?',
    'Kto może kupić działkę rolną?',
    'Jak przeprowadzić podział nieruchomości?',
    'Co mogę zrobić gdy sąsiad buduje za blisko?',
    'Jakie są wymogi zabudowy działki?',
    'Jaka jest procedura wykupu gruntu od gminy?',
    'Co to jest przedwstępna umowa sprzedaży nieruchomości?',
    'Jak ustanowić drogę konieczną przez działkę sąsiada?',
    'Czym użytkowanie wieczyste różni się od własności?',
  ],
  'Prawo spadkowe': [
    'Jak napisać testament własnoręczny?',
    'Kto dziedziczy po zmarłym bez testamentu?',
    'Jak przebiega procedura stwierdzenia nabycia spadku?',
    'W jakim terminie można odrzucić spadek?',
    'Komu przysługuje zachowek?',
    'Jak przebiega dział spadku?',
    'Czy spadkobierca odpowiada za długi spadkowe?',
    'Kiedy potrzebny jest testament notarialny?',
    'Czy wydziedziczenie jest możliwe?',
    'Kto dziedziczy spadek po dziadkach?',
  ],
  'Prawo ubezpieczeń': [
    'Co obejmuje ubezpieczenie OC posiadacza pojazdu?',
    'Kiedy warto wykupić ubezpieczenie AC?',
    'Co robić gdy ubezpieczyciel odmawia wypłaty odszkodowania?',
    'Co obejmuje ubezpieczenie mieszkania?',
    'Czym NNW różni się od ubezpieczenia zdrowotnego?',
    'Czym jest regres ubezpieczyciela?',
    'Jak wygląda likwidacja szkody całkowitej w pojeździe?',
    'Co to jest ubezpieczenie OC w życiu prywatnym?',
    'Co pokrywa ubezpieczenie turystyczne?',
    'Czym jest assistance w przypadku awarii auta?',
    'Co robić gdy likwidacja szkody trwa zbyt długo?',
    'Jak uzyskać odszkodowanie z OC sprawcy wypadku?',
  ],
  'Prawo budowlane': [
    'Kiedy wymagane jest pozwolenie na budowę?',
    'Co można budować na zgłoszenie?',
    'Jakie konsekwencje grożą za samowolę budowlaną?',
    'Jak zgłosić nielegalną budowę sąsiada?',
    'Jak uzyskać decyzję o warunkach zabudowy?',
    'Czy do budowy garażu potrzebne jest pozwolenie?',
    'Jaka jest procedura rozbiórki budynku?',
    'Jaka musi być odległość od granicy działki przy budowie?',
    'Kiedy wymagane jest pozwolenie na użytkowanie?',
    'Jaka jest procedura uzyskania przyłącza do sieci?',
    'Jak zmienić sposób użytkowania budynku?',
    'Jak długo ważna jest decyzja o warunkach zabudowy?',
  ],
  'Prawo autorskie i własność intelektualna': [
    'Jak działają prawa autorskie do zdjęć?',
    'Jak bronić się przed naruszeniem praw autorskich w internecie?',
    'Jak zarejestrować znak towarowy?',
    'Jak uzyskać licencję na wykorzystanie muzyki w filmie?',
    'Ile lat obowiązują prawa autorskie do utworu?',
    'Jak bronić się przed plagiatem?',
    'Jaka jest procedura zgłoszenia patentu na wynalazek?',
    'Jak rozwiązać spór o prawa do domeny internetowej?',
  ],
  'Prawo administracyjne': [
    'Jaki jest termin odwołania od decyzji urzędu?',
    'Jak wnioskować o dostęp do informacji publicznej?',
    'Jak złożyć skargę do sądu administracyjnego?',
    'Co mogę zrobić w przypadku milczenia urzędu?',
    'Jak zaskarżyć decyzję administracyjną?',
    'Jak złożyć wniosek o wgląd do akt sprawy?',
    'Jak przebiega postępowanie wyjaśniające w urzędzie?',
    'Czy urząd ma obowiązek wydać zaświadczenie?',
    'Jak odwołać się od decyzji ZUS?',
    'Jak odwołać się od kary administracyjnej?',
  ],
  'RODO i ochrona danych osobowych': [
    'Jak uzyskać dostęp do moich danych osobowych?',
    'Jak usunąć moje dane osobowe z firmy?',
    'Jak wycofać zgodę na przetwarzanie danych osobowych?',
    'Co mogę zrobić w przypadku wycieku danych osobowych?',
    'Czy monitoring w miejscu pracy jest legalny?',
    'Jak skorzystać z prawa do bycia zapomnianym w internecie?',
    'Jak złożyć skargę do UODO?',
    'Czy do przetwarzania danych dziecka potrzebna jest zgoda rodziców?',
    'Jak bronić się przed marketingiem bez zgody?',
    'Jaka jest wysokość kary za naruszenie RODO?',
  ],
  'Prawo bankowe i finansowe': [
    'Jak bronić się przed kredytem frankowym?',
    'Jak unieważnić umowę kredytu?',
    'Kiedy bank może zablokować rachunek bankowy?',
    'Czy bank może pobrać prowizję za wcześniejszą spłatę kredytu?',
    'Co można zrobić gdy komornik zajmuje rachunek bankowy?',
    'Czy bank musi uzasadnić odmowę udzielenia kredytu?',
    'Jak anulować zadłużenie na karcie kredytowej?',
    'Czy ubezpieczenie przy kredycie jest obowiązkowe?',
    'Jak przeprowadzić restrukturyzację zadłużenia w banku?',
    'Co oznacza RRSO i całkowity koszt kredytu konsumenckiego?',
  ],
  'Prawo medyczne i zdrowotne': [
    'Co mogę zrobić gdy szpital odmawia przyjęcia?',
    'Jak uzyskać dostęp do dokumentacji medycznej?',
    'Jak dochodzić odszkodowania za błąd medyczny?',
    'Kiedy wymagana jest zgoda na zabieg medyczny?',
    'Kiedy tajemnica lekarska może być ujawniona?',
    'Ile czasu jest ważna recepta?',
    'Jak odwołać się od odmowy refundacji przez NFZ?',
    'Czy pacjent ma prawo do drugiej opinii lekarskiej?',
    'Gdzie zgłosić skargę na lekarza?',
    'Na jakich warunkach możliwe jest przymusowe leczenie psychiatryczne?',
  ],
  'Prawo oświatowe': [
    'Jakie są kryteria przyjęcia do szkoły podczas rekrutacji?',
    'Jak odwołać się od oceny wystawionej przez nauczyciela?',
    'Jakie nagrody i kary mogą otrzymać uczniowie w szkole?',
    'Kto ma prawo do egzaminu poprawkowego?',
    'Kiedy możliwe jest relegowanie ucznia ze szkoły?',
    'Czy gmina ma obowiązek organizować dowóz dzieci do szkoły?',
    'Czy religia w szkole jest obowiązkowa?',
    'Jakie dokumenty są wymagane do przedszkola?',
    'Czy uczniowie muszą przychodzić do szkoły podczas strajku nauczycieli?',
    'Czy wycieczka szkolna wymaga zgody rodziców?',
  ],
  'Prawo telekomunikacyjne i IT': [
    'Jaki jest termin rozwiązania umowy z operatorem?',
    'Jak przenieść numer telefonu do innego operatora?',
    'Jak złożyć reklamację usługi internetowej?',
    'Czy operator może naliczyć opłatę za przedwczesne rozwiązanie umowy?',
    'Czy mogę obniżyć rachunek za powolny internet?',
    'Jaki jest okres zobowiązania w umowie na telefon?',
    'Jak bronić się przed spamem SMS?',
    'Jak zgłosić nieuczciwe praktyki operatora telekomunikacyjnego?',
  ],
  'Prawo sąsiedztwa': [
    'Co robić gdy drzewo sąsiada rośnie na moją działkę?',
    'Co mogę zrobić gdy sąsiedzi robią hałas?',
    'Jak zmusić sąsiada do zaprzestania parkowania przed moim garażem?',
    'Kto płaci za ogrodzenie między działkami?',
    'Co robić gdy ścieki z działki sąsiada spływają na mój grunt?',
    'Co robić gdy psy sąsiada szczekają w nocy?',
    'Czy wiata śmietnikowa może stać blisko mojej działki?',
    'Co robić gdy budowa sąsiada zasłania mi słońce?',
  ],
  'Prawo emerytalne i rentowe': [
    'Kiedy mogę przejść na emeryturę?',
    'Jak uzyskać rentę z tytułu niezdolności do pracy?',
    'Kto może skorzystać z emerytury pomostowej?',
    'Jak złożyć wniosek o przeliczenie emerytury?',
    'Kto może otrzymać rentę rodzinną po zmarłym małżonku?',
    'Jakie są warunki wcześniejszej emerytury?',
    'Jak odwołać się od decyzji ZUS o emeryturze?',
    'Kto może otrzymać zasiłek pogrzebowy?',
    'Jakie są warunki otrzymania zasiłku pielęgnacyjnego?',
    'Jaki podatek płacę gdy pracuję i pobieram emeryturę?',
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
