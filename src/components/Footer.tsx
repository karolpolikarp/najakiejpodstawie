import { Scale, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';

export const Footer = () => {
  const { messages } = useChatStore();

  // Liczba zapytań = liczba wiadomości użytkownika (role: 'user')
  const queryCount = messages.filter(m => m.role === 'user').length;

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">JakiePrawo.pl</span>
            </span>
          </div>
          <nav className="flex flex-wrap gap-4 sm:gap-6 text-sm justify-center" aria-label="Stopka">
            <Link
              to="/o-nas"
              className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
            >
              O nas
            </Link>
            <Link
              to="/faq"
              className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
            >
              FAQ
            </Link>
            <Link
              to="/kontakt"
              className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
            >
              Kontakt
            </Link>
            <Link
              to="/regulamin"
              className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
            >
              Regulamin
            </Link>
            <Link
              to="/polityka-prywatnosci"
              className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
            >
              Polityka prywatności
            </Link>
          </nav>
        </div>
        <div className="text-center pt-4 border-t border-border/50">
          {queryCount > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium mb-2">
              <MessageSquare className="h-4 w-4" />
              <span>Zadano {queryCount} {queryCount === 1 ? 'pytanie' : queryCount < 5 ? 'pytania' : 'pytań'} w tej sesji</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Narzędzie wspomagające wyszukiwanie informacji prawnych
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            To nie jest porada prawna
          </p>
        </div>
      </div>
    </footer>
  );
};
