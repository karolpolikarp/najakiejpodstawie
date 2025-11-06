import { Scale } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  showActions?: boolean;
  actions?: React.ReactNode;
}

export const Header = ({ showActions = false, actions }: HeaderProps) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Brand - zawsze po lewej */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-80 transition-all duration-300 hover:scale-[1.02] group"
            aria-label="Przejdź do strony głównej"
          >
            <div className="relative">
              <Scale className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
                JakiePrawo.pl
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Wyszukiwarka podstaw prawnych
              </p>
            </div>
          </Link>

          {/* Actions - po prawej */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {!isLanding && (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex hover:bg-primary/10">
                  <Link to="/o-nas">O projekcie</Link>
                </Button>
              </>
            )}

            {isLanding && (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex hover:bg-primary/10">
                  <Link to="/o-nas">O projekcie</Link>
                </Button>
                <Button asChild size="sm" className="shadow-md hover:shadow-lg transition-all duration-300">
                  <Link to="/czat">Rozpocznij</Link>
                </Button>
              </>
            )}

            <ThemeToggle />

            {showActions && actions}
          </div>
        </div>
      </div>
    </header>
  );
};
