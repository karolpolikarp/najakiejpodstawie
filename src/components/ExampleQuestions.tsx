import { Button } from '@/components/ui/button';

interface ExampleQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const EXAMPLE_QUESTIONS = [
  'Zwrot towaru kupionego online',
  'Wypowiedzenie umowy najmu przez najemcę',
  'Urlop na żądanie - ile dni w roku?',
];

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
