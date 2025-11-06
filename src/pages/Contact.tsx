import { Scale, Mail, Github, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-main">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Scale className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">JakiePrawo.pl</h1>
              <p className="text-sm text-muted-foreground">Wyszukiwarka podstaw prawnych</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-6">Kontakt</h1>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Masz pytania lub sugestie?</h2>
              <p className="text-muted-foreground mb-6">
                Chętnie odpowiemy na Twoje pytania dotyczące projektu, sugestie ulepszeń lub zgłoszenia problemów.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-secondary rounded-lg">
                  <Github className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">GitHub Issues</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Najlepszy sposób na zgłoszenie błędu lub propozycji nowej funkcji.
                    </p>
                    <Button asChild size="sm">
                      <a
                        href="https://github.com/karolpolikarp/najakiejpodstawie/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Otwórz issue na GitHub
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-secondary rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Dyskusje</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Zadawaj pytania, dziel się pomysłami i rozmawiaj z innymi użytkownikami.
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <a
                        href="https://github.com/karolpolikarp/najakiejpodstawie/discussions"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Dołącz do dyskusji
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-secondary rounded-lg">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Email</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Dla spraw wymagających prywatności lub współpracy biznesowej.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dostępny na żądanie przez GitHub Issues.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/30">
              <h2 className="text-xl font-semibold text-foreground mb-3">Współpraca</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Projekt jest otwartoźródłowy (open source). Zapraszamy do współtworzenia - pull requesty mile widziane!
              </p>
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://github.com/karolpolikarp/najakiejpodstawie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zobacz repozytorium
                </a>
              </Button>
            </Card>
          </div>

          <div className="mt-8 flex gap-4">
            <Button asChild variant="outline">
              <Link to="/">← Strona główna</Link>
            </Button>
            <Button asChild variant="default">
              <Link to="/czat">Przejdź do wyszukiwarki</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
