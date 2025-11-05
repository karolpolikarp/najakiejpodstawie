import { Scale, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">NaJakiejPodstawie.pl</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              O nas
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Kontakt
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Polityka prywatności
            </a>
          </div>
        </div>
        <div className="text-center pt-4 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-sm text-accent font-medium mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Już ponad 10,000 znalezionych podstaw prawnych</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Bezpłatny asystent prawny dla każdego
          </p>
        </div>
      </div>
    </footer>
  );
};
