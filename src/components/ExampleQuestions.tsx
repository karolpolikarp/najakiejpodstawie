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
    'Na jakiej podstawie mogę zwrócić towar kupiony online?',
    'Jaki jest termin na reklamację wadliwego produktu?',
    'Kiedy przysługuje prawo do odstąpienia od umowy kredytu konsumenckiego?',
    'Ile dni mam na odstąpienie od umowy zawartej na odległość?',
    'Jaka jest różnica między rękojmią a gwarancją według prawa?',
    'Jakie odszkodowanie przysługuje za odwołany lot?',
    'Co to są nieuczciwe praktyki rynkowe w rozumieniu ustawy?',
    'W jakim terminie mogę odstąpić od umowy zawartej na odległość?',
    'Na jakiej podstawie mogę reklamować usługę naprawy?',
    'Co to są klauzule abuzywne w umowie z bankiem?',
    'Jakie prawa przysługują konsumentowi przy windykacji długu?',
    'Jaki jest termin przedawnienia roszczenia konsumenckiego?',
    'Czy przysługuje zwrot kosztów dostawy przy reklamacji?',
    'Czy mogę przedwcześnie spłacić kredyt konsumencki?',
    'Jakie są ograniczenia kar umownych w umowach konsumenckich?',
    'Jakie odszkodowanie przysługuje za opóźnienie w dostawie?',
  ],
  'Prawo pracy': [
    'Ile dni urlopu na żądanie przysługuje według kodeksu pracy?',
    'Jaki jest termin wypowiedzenia umowy o pracę przez pracownika?',
    'Jaki jest dodatek za nadgodziny według kodeksu pracy?',
    'Ile tygodni trwa urlop macierzyński i rodzicielski?',
    'Co to jest mobbing w rozumieniu kodeksu pracy?',
    'Jak liczy się okres wypowiedzenia umowy o pracę?',
    'Ile dni urlopu wypoczynkowego przysługuje rocznie?',
    'Jakie obowiązki ma pracownik na zwolnieniu lekarskim?',
    'Czy pracodawca może odmówić pracy zdalnej?',
    'Co stanowi dyskryminację w miejscu pracy według prawa?',
    'Jaka jest różnica między umową zlecenia a umową o pracę?',
    'Ile wynosi wynagrodzenie chorobowe według prawa?',
    'Kiedy można rozwiązać umowę o pracę bez wypowiedzenia?',
    'Jak oblicza się ekwiwalent za niewykorzystany urlop?',
    'Czy pracodawca ma obowiązek wypłaty premii?',
    'Kto ponosi koszty badań okresowych pracownika?',
    'Jakie kary porządkowe może nałożyć pracodawca?',
    'Kiedy pracodawca musi udzielić urlopu bezpłatnego?',
  ],
  'Prawo najmu': [
    'Jaki jest termin wypowiedzenia umowy najmu przez najemcę?',
    'Kiedy właściciel musi zwrócić kaucję najemcy?',
    'Na jakiej podstawie właściciel może podnieść czynsz?',
    'Jakie są przesłanki eksmisji z mieszkania?',
    'Jak działa umowa najmu na czas nieokreślony według kodeksu cywilnego?',
    'Kto ponosi koszty remontu mieszkania wynajmowanego?',
    'Na jakich warunkach dopuszczalny jest podnajem mieszkania?',
    'Kto ponosi koszty mediów w mieszkaniu wynajmowanym?',
    'Na jakich warunkach właściciel może wypowiedzieć umowę najmu?',
    'Czy najemcy przysługuje prawo pierwokupu lokalu?',
    'Jakie prawa ma najemca gdy wynajmujący nie naprawia awarii?',
    'Czym różni się najem okazjonalny od zwykłego?',
    'Na jakiej podstawie można eksmitować najemcę?',
    'Czy umowa najmu wymaga formy pisemnej?',
  ],
  'Podatki': [
    'Na jakich warunkach można odliczyć VAT od zakupów firmowych?',
    'Jaka jest wysokość ulgi na dziecko w podatku PIT?',
    'Kiedy darowizna od rodziny jest zwolniona z podatku?',
    'Jaki jest termin składania zeznania podatkowego PIT?',
    'Na jakich warunkach przysługuje ulga termomodernizacyjna?',
    'Jaki podatek płaci się od sprzedaży mieszkania?',
    'Co można zaliczyć do kosztów uzyskania przychodu?',
    'Kto może skorzystać z ulgi rehabilitacyjnej?',
    'Jaki jest termin rozliczenia PIT?',
    'W jakim terminie następuje zwrot nadpłaconego podatku?',
    'Na jakich warunkach przysługuje ulga na internet?',
    'Jakie są stawki podatku od spadków i darowizn?',
  ],
  'Prawo rodzinne': [
    'Jakie są kryteria ustalania wysokości alimentów na dziecko?',
    'Na jakiej podstawie można uzyskać rozwód bez orzekania o winie?',
    'Jak regulowana jest władza rodzicielska po rozwodzie?',
    'Jakie są zasady podziału majątku wspólnego po rozwodzie?',
    'Jakie są przesłanki orzeczenia separacji małżeńskiej?',
    'Kto może wystąpić o ustalenie ojcostwa?',
    'Na jakiej podstawie można zmienić nazwisko dziecka po rozwodzie?',
    'Jak regulowane są kontakty z dzieckiem po rozwodzie?',
    'Kiedy przysługują alimenty na współmałżonka po rozwodzie?',
    'Co to jest wspólność majątkowa małżeńska?',
    'Jakie są przesłanki przysposobienia dziecka?',
    'Kiedy można ubezwłasnowolnić osobę?',
  ],
  'Prawo karne': [
    'Jaki jest termin przedawnienia wykroczenia drogowego?',
    'Kiedy obrona konieczna jest legalna według kodeksu karnego?',
    'Co stanowi zniesławienie w internecie?',
    'Jaka kara grozi za kradzież w sklepie?',
    'Jaka kara grozi za prowadzenie pojazdu po alkoholu?',
    'Czym oszustwo różni się od wyłudzenia w kodeksie karnym?',
    'Co stanowi groźby karalne?',
    'Czym napaść różni się od pobicia według kodeksu karnego?',
    'Jaka odpowiedzialność karna grozi za wyłudzenie kredytu?',
    'Jakie prawa ma osoba zatrzymana przez policję?',
    'Co stanowi kradzież tożsamości?',
    'Co to jest stalking w rozumieniu kodeksu karnego?',
    'Jakie przepisy chronią przed przemocą domową?',
    'Czy rodzice ponoszą odpowiedzialność za przestępstwo nieletniego?',
  ],
  'Prawo ruchu drogowego': [
    'Ile punktów karnych można mieć za wykroczenia drogowe?',
    'Na jakiej podstawie można cofnąć prawo jazdy?',
    'Kto odpowiada za szkodę na parkingu według prawa?',
    'Jaki jest termin odwołania od mandatu?',
    'Jakie obowiązki ma kierowca podczas kontroli drogowej?',
    'Kto ponosi odpowiedzialność za kolizję drogową?',
    'Jaka kara grozi za jazdę bez prawa jazdy?',
    'Na jakiej podstawie przysługuje odszkodowanie z OC sprawcy?',
    'Kiedy holowanie pojazdu jest legalne?',
    'Kiedy policja może zatrzymać dowód rejestracyjny?',
  ],
  'Prawo spółek i działalność gospodarcza': [
    'Jakie przepisy regulują zakładanie spółki z o.o.?',
    'Jakie przepisy regulują prowadzenie JDG?',
    'Jaką odpowiedzialność ponoszą wspólnicy w spółce jawnej?',
    'Na jakich zasadach przebiega przekształcenie JDG w spółkę?',
    'Na jakich warunkach można zawiesić działalność gospodarczą?',
    'Jakie są przesłanki likwidacji spółki?',
    'Jak często musi odbywać się zgromadzenie wspólników?',
    'Jak regulowane jest wynagrodzenie członka zarządu?',
    'Czy kodeks spółek handlowych wymaga umowy wspólników?',
    'Na jakich zasadach można zbyć udziały w spółce?',
    'Jakie zmiany wymagają wpisu do KRS?',
    'Na jakiej podstawie wykreśla się wpis z CEIDG?',
    'Kiedy stosuje się upadłość a kiedy restrukturyzację?',
    'Czy członkowie zarządu odpowiadają za długi spółki?',
  ],
  'Prawo nieruchomości': [
    'Jakie dokumenty są wymagane do przeniesienia własności nieruchomości?',
    'Czy sprzedaż nieruchomości wymaga formy aktu notarialnego?',
    'Na jakich zasadach ustanawia się służebność przejazdu?',
    'Jakie są przesłanki zasiedzenia nieruchomości?',
    'Jaki jest termin wpisu do księgi wieczystej?',
    'Co to jest hipoteka na nieruchomości?',
    'Kto może nabyć działkę rolną według prawa?',
    'Na jakiej podstawie przeprowadza się podział nieruchomości?',
    'Jakie są minimalne odległości od granicy działki?',
    'Jakie są wymogi prawne zabudowy działki?',
    'Na jakich zasadach następuje wykup gruntu od gminy?',
    'Jakie są skutki prawne przedwstępnej umowy sprzedaży?',
    'Na jakich warunkach ustanawia się drogę konieczną?',
    'Czym różni się użytkowanie wieczyste od własności?',
  ],
  'Prawo spadkowe': [
    'Jakie są wymogi formalne testamentu własnoręcznego?',
    'Kto dziedziczy po zmarłym z ustawy?',
    'Czym jest postanowienie o stwierdzeniu nabycia spadku?',
    'Jaki jest termin na odrzucenie spadku?',
    'Komu przysługuje zachowek według kodeksu cywilnego?',
    'Na jakich zasadach przebiega dział spadku?',
    'Czy spadkobierca odpowiada za długi spadkowe?',
    'Kiedy testament wymaga formy aktu notarialnego?',
    'Na jakich warunkach możliwe jest wydziedziczenie?',
    'Jakie są zasady dziedziczenia po dziadkach?',
  ],
  'Prawo ubezpieczeń': [
    'Co obejmuje obowiązkowe ubezpieczenie OC posiadacza pojazdu?',
    'Czym różni się ubezpieczenie AC od OC?',
    'Jakie prawa ma ubezpieczony przy odmowie wypłaty?',
    'Co obejmuje zakres ubezpieczenia mieszkania?',
    'Czym NNW różni się od innych ubezpieczeń?',
    'Co to jest regres ubezpieczyciela?',
    'Co to jest szkoda całkowita w pojeździe?',
    'Czym jest ubezpieczenie OC w życiu prywatnym?',
    'Co obejmuje zakres ubezpieczenia turystycznego?',
    'Co to jest assistance komunikacyjne?',
    'Jaki jest termin likwidacji szkody?',
    'Na jakiej podstawie przysługuje odszkodowanie z OC sprawcy?',
  ],
  'Prawo budowlane': [
    'Kiedy wymagane jest pozwolenie na budowę?',
    'Jakie roboty budowlane wymagają zgłoszenia?',
    'Jakie sankcje grożą za samowolę budowlaną?',
    'Jakie są przesłanki rozbiórki samowoli budowlanej?',
    'Czym jest decyzja o warunkach zabudowy?',
    'Czy budowa garażu wymaga pozwolenia?',
    'Na jakich warunkach następuje rozbiórka budynku?',
    'Jakie są minimalne odległości od granicy działki?',
    'Kiedy wymagane jest pozwolenie na użytkowanie?',
    'Jakie przepisy regulują przyłączenie do sieci?',
    'Kiedy zmiana sposobu użytkowania wymaga pozwolenia?',
    'Jaki jest okres ważności decyzji o warunkach zabudowy?',
  ],
  'Prawo autorskie i własność intelektualna': [
    'Jakie prawa autorskie przysługują do zdjęć?',
    'Co stanowi naruszenie praw autorskich w internecie?',
    'Jakie są wymogi rejestracji znaku towarowego?',
    'Na jakiej podstawie można wykorzystać muzykę w filmie?',
    'Jaki jest okres ochrony praw autorskich?',
    'Co to jest plagiat według prawa autorskiego?',
    'Na jakich zasadach przebiega zgłoszenie patentu?',
    'Jakie przepisy regulują spory o domeny internetowe?',
  ],
  'Prawo administracyjne': [
    'Jaki jest termin odwołania od decyzji administracyjnej?',
    'Jak regulowane jest prawo dostępu do informacji publicznej?',
    'Jaki jest termin na złożenie skargi do sądu administracyjnego?',
    'Co to jest milczenie administracji?',
    'Na jakich zasadach zaskarża się decyzje administracyjne?',
    'Czy strona ma prawo wglądu do akt sprawy?',
    'Czym jest postępowanie wyjaśniające?',
    'Czy urząd ma obowiązek wydania zaświadczenia?',
    'Jaki jest termin odwołania od decyzji ZUS?',
    'Jakie są zasady odwołania od kary administracyjnej?',
  ],
  'RODO i ochrona danych osobowych': [
    'Jakie prawa ma osoba, której dane są przetwarzane?',
    'Jakie są zasady usunięcia danych osobowych?',
    'Jak wycofać zgodę na przetwarzanie danych osobowych?',
    'Jakie obowiązki ma administrator przy wycieku danych?',
    'Czy monitoring w miejscu pracy jest zgodny z RODO?',
    'Co to jest prawo do bycia zapomnianym?',
    'Na jakiej podstawie można złożyć skargę do UODO?',
    'Czy do przetwarzania danych dziecka potrzebna jest zgoda?',
    'Co to jest marketing bezpośredni w rozumieniu RODO?',
    'Jakie są kary za naruszenie RODO?',
  ],
  'Prawo bankowe i finansowe': [
    'Na jakiej podstawie można kwestionować kredyt frankowy?',
    'Jakie są przesłanki unieważnienia umowy kredytu?',
    'Kiedy bank może zablokować rachunek bankowy?',
    'Czy bank może pobrać prowizję za wcześniejszą spłatę?',
    'Jakie są zasady zajęcia rachunku bankowego przez komornika?',
    'Czy bank ma obowiązek uzasadnienia odmowy kredytu?',
    'Na jakich warunkach można anulować zadłużenie karty kredytowej?',
    'Czy ubezpieczenie przy kredycie jest obowiązkowe?',
    'Na czym polega restrukturyzacja zadłużenia?',
    'Co to jest RRSO i całkowity koszt kredytu?',
  ],
  'Prawo medyczne i zdrowotne': [
    'Jakie prawa ma pacjent przy odmowie przyjęcia do szpitala?',
    'Jakie są zasady dostępu do dokumentacji medycznej?',
    'Na jakiej podstawie przysługuje odszkodowanie za błąd medyczny?',
    'Kiedy wymagana jest zgoda pacjenta na zabieg?',
    'Kiedy tajemnica lekarska może być ujawniona?',
    'Jaki jest okres ważności recepty?',
    'Jakie są zasady odwołania od decyzji NFZ?',
    'Czy pacjent ma prawo do drugiej opinii lekarskiej?',
    'Na jakiej podstawie można złożyć skargę na lekarza?',
    'Jakie są przesłanki przymusowego leczenia psychiatrycznego?',
  ],
  'Prawo oświatowe': [
    'Jakie kryteria rekrutacji do szkoły przewiduje prawo?',
    'Na jakich zasadach można odwołać się od oceny?',
    'Jakie nagrody i kary przewiduje prawo oświatowe?',
    'Kto ma prawo do egzaminu poprawkowego?',
    'Jakie są przesłanki relegowania ucznia ze szkoły?',
    'Czy gmina ma obowiązek dowozu dzieci do szkoły?',
    'Czy religia w szkole jest obowiązkowa?',
    'Jakie dokumenty są wymagane przy zapisie do przedszkola?',
    'Czy uczniowie mają obowiązek uczestniczenia w lekcjach podczas strajku?',
    'Czy wycieczka szkolna wymaga zgody rodziców?',
  ],
  'Prawo telekomunikacyjne i IT': [
    'Jaki jest okres wypowiedzenia umowy z operatorem?',
    'Jakie są zasady przeniesienia numeru do innego operatora?',
    'Na jakich zasadach przysługuje reklamacja usługi telekomunikacyjnej?',
    'Czy operator może naliczyć opłatę za przedterminowe rozwiązanie?',
    'Jakie prawa ma abonent przy niezgodnej z umową usłudze?',
    'Jaki jest maksymalny okres zobowiązania w umowie?',
    'Jakie przepisy chronią przed spamem SMS?',
    'Na jakiej podstawie można zgłosić nieuczciwe praktyki operatora?',
  ],
  'Prawo sąsiedztwa': [
    'Jakie prawa mam gdy drzewo sąsiada rośnie na moją działkę?',
    'Jakie przepisy regulują dopuszczalny poziom hałasu?',
    'Jakie są przepisy dotyczące parkowania przed cudzą posesją?',
    'Kto ponosi koszty ogrodzenia między działkami?',
    'Jakie prawa mam gdy ścieki spływają z działki sąsiada?',
    'Jakie przepisy regulują uciążliwość ze strony zwierząt?',
    'Jakie są minimalne odległości dla budynków gospodarczych?',
    'Jakie prawa ma właściciel przy zacienieniu działki?',
  ],
  'Prawo emerytalne i rentowe': [
    'Jaki jest wiek emerytalny według prawa?',
    'Jakie są przesłanki przyznania renty z tytułu niezdolności?',
    'Kto może skorzystać z emerytury pomostowej?',
    'Na jakich zasadach następuje przeliczenie emerytury?',
    'Komu przysługuje renta rodzinna?',
    'Jakie są warunki wcześniejszej emerytury?',
    'Jaki jest termin odwołania od decyzji ZUS?',
    'Komu przysługuje zasiłek pogrzebowy?',
    'Jakie są przesłanki przyznania zasiłku pielęgnacyjnego?',
    'Jak opodatkowana jest emerytura przy jednoczesnej pracy?',
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
