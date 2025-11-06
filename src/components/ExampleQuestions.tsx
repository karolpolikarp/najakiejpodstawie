import { Button } from '@/components/ui/button';

interface ExampleQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
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

// Funkcja do losowego wyboru pytań z różnych kategorii
const getRandomQuestions = (count: number = 6): string[] => {
  const allQuestions = Object.values(QUESTION_CATEGORIES).flat();
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const EXAMPLE_QUESTIONS = getRandomQuestions(6);

export const ExampleQuestions = ({ onSelect, disabled }: ExampleQuestionsProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-6">
      {EXAMPLE_QUESTIONS.map((question, idx) => (
        <Button
          key={question}
          variant="outline"
          onClick={() => onSelect(question)}
          disabled={disabled}
          className="text-sm hover:scale-105 transition-transform duration-200 hover:border-primary hover:text-primary animate-fade-in"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          {question}
        </Button>
      ))}
    </div>
  );
};
