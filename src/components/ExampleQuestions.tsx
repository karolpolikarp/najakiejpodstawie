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
  ],
  'Prawo pracy': [
    'Urlop na żądanie - ile dni w roku?',
    'Wypowiedzenie umowy o pracę przez pracownika',
    'Nadgodziny - jak są płatne?',
    'Urlop macierzyński i rodzicielski - ile tygodni?',
    'Mobbing w pracy - jak się bronić?',
  ],
  'Prawo najmu': [
    'Wypowiedzenie umowy najmu przez najemcę',
    'Kaucja przy wynajmie - zwrot po wyprowadzce',
    'Podniesienie czynszu przez właściciela',
    'Eksmisja z mieszkania - kiedy jest możliwa?',
  ],
  'Podatki': [
    'Odliczenie VAT od zakupów firmowych',
    'Ulga na dziecko w zeznaniu podatkowym',
    'Zwolnienie z podatku darowizny od rodziny',
    'Termin składania zeznania rocznego PIT',
  ],
  'Prawo rodzinne': [
    'Alimenty na dziecko - jak ustalić wysokość?',
    'Rozwód bez orzekania o winie',
    'Władza rodzicielska po rozwodzie',
    'Podział majątku po rozwodzie',
  ],
  'Prawo karne': [
    'Przedawnienie wykroczenia drogowego',
    'Obrona konieczna - kiedy jest legalna?',
    'Zniesławienie w internecie - jak się bronić?',
  ],
  'Prawo ruchu drogowego': [
    'Punkty karne - ile można mieć?',
    'Cofnięcie prawa jazdy za przekroczenie prędkości',
    'Szkoda w aucie na parkingu - kto odpowiada?',
  ],
};

// Słowa kluczowe dla każdej kategorii
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Prawo konsumenckie': ['zwrot', 'reklamacja', 'towar', 'produkt', 'konsument', 'zakup', 'online', 'sklep', 'zwrócić', 'odstąpienie', 'umowa', 'kredyt'],
  'Prawo pracy': ['urlop', 'praca', 'pracownik', 'pracodawca', 'wypowiedzenie', 'nadgodziny', 'umowa o pracę', 'zatrudnienie', 'mobbing', 'macierzyński', 'rodzicielski'],
  'Prawo najmu': ['najem', 'wynajem', 'najemca', 'wynajmujący', 'właściciel', 'kaucja', 'czynsz', 'mieszkanie', 'eksmisja', 'lokator'],
  'Podatki': ['podatek', 'vat', 'pit', 'ulga', 'darowizna', 'zeznanie', 'odliczenie', 'zwolnienie', 'rozliczenie'],
  'Prawo rodzinne': ['alimenty', 'dziecko', 'rozwód', 'małżeństwo', 'władza rodzicielska', 'opieka', 'majątek', 'separacja'],
  'Prawo karne': ['kara', 'wykroczenie', 'przestępstwo', 'przedawnienie', 'obrona', 'zniesławienie', 'mandat'],
  'Prawo ruchu drogowego': ['prawo jazdy', 'mandat', 'punkty karne', 'prędkość', 'parking', 'auto', 'wypadek', 'kierowca', 'kolizja'],
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
