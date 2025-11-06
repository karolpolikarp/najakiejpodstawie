import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Password can be set via VITE_APP_PASSWORD env variable, defaults to 'lex' for easy MVP access
const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'lex';
const PASSWORD_KEY = 'app_authenticated';

interface PasswordGateProps {
  children: React.ReactNode;
}

export const PasswordGate = ({ children }: PasswordGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = localStorage.getItem(PASSWORD_KEY) === 'true';
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(PASSWORD_KEY, 'true');
      setIsAuthenticated(true);
      toast.success('Zalogowano pomyślnie');
    } else {
      toast.error('Nieprawidłowe hasło');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(PASSWORD_KEY);
    setIsAuthenticated(false);
    toast.success('Wylogowano');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-main">
        <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-main p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Dostęp chroniony
              </h1>
              <p className="text-sm text-muted-foreground text-center">
                Wprowadź hasło aby uzyskać dostęp do aplikacji
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Wprowadź hasło..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center text-lg"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Zaloguj się
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              JakiePrawo.pl - Asystent Prawny
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Logout button - hidden, accessible via keyboard shortcut or can be added to header */}
      <button
        onClick={handleLogout}
        className="hidden"
        id="logout-button"
        aria-label="Wyloguj"
      />
    </>
  );
};
