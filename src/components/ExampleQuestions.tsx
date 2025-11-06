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
  const questionsToShow = useMemo(() => {
    if (lastUserQuestion) {
      // Jeśli jest pytanie kontekstowe, wygeneruj pytania nawiązujące
      const contextual = getContextualQuestions(lastUserQuestion, 3);
      const popular = getRandomQuestions(3, contextual);

      // Zwróć najpierw kontekstowe, potem popularne
      return [...contextual, ...popular];
    } else {
      // Jeśli nie ma kontekstu, pokaż tylko popularne pytania
      return getRandomQuestions(6);
    }
  }, [lastUserQuestion]);

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-4 sm:mb-6 px-2">
      {questionsToShow.map((question, idx) => (
        <Button
          key={`${question}-${idx}`}
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
  );
};
