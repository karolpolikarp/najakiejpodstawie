import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Sprawdź czy użytkownik już zaakceptował
    const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasAccepted) {
      // Pokaż banner po krótkiej chwili
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg animate-slide-up">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-1">
                <strong className="text-foreground">Ta strona używa localStorage</strong>
              </p>
              <p>
                Używamy localStorage (podobnie jak cookies) do zapisywania Twoich preferencji, historii czatu i sesji.
                To dane niezbędne do działania serwisu, przechowywane tylko w Twojej przeglądarce.{' '}
                <Link to="/polityka-prywatnosci" className="text-primary hover:underline">
                  Więcej w Polityce Prywatności
                </Link>
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleAccept}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Rozumiem
            </Button>
            <Button
              onClick={handleAccept}
              variant="ghost"
              size="sm"
              className="sm:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
