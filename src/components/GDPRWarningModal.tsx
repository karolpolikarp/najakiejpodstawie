import { useEffect, useState } from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from 'react-router-dom';

const GDPR_ACCEPTANCE_KEY = 'gdpr_warning_accepted';

export function GDPRWarningModal() {
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const hasAccepted = localStorage.getItem(GDPR_ACCEPTANCE_KEY);
    if (!hasAccepted) {
      // Show modal after short delay for better UX
      setTimeout(() => setOpen(true), 500);
    }
  }, []);

  const handleAccept = () => {
    if (understood) {
      localStorage.setItem(GDPR_ACCEPTANCE_KEY, 'true');
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-amber-600" />
            <AlertDialogTitle className="text-2xl">
              Ważne informacje o ochronie danych osobowych
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      NIE PRZESYŁAJ DANYCH OSOBOWYCH
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Twoje pytania są przetwarzane przez sztuczną inteligencję (Anthropic Claude).
                      Chociaż Anthropic nie wykorzystuje danych do treningu modeli, zalecamy maksymalną ostrożność.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-foreground">❌ NIE przesyłaj:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Danych osobowych (imiona, nazwiska, adresy, numery telefonów)</li>
                  <li>Numerów PESEL, NIP, dokumentów tożsamości</li>
                  <li>Danych medycznych, finansowych, wrażliwych</li>
                  <li>Zdjęć lub skanów dokumentów zawierających dane osobowe</li>
                  <li>Umów, faktur, pism zawierających dane identyfikujące osoby</li>
                </ul>

                <p className="font-semibold text-foreground mt-4">✅ MOŻESZ przesyłać:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Pytania prawne sformułowane ogólnie</li>
                  <li>Zanonimizowane przykłady sytuacji (np. "pracownik", "osoba A")</li>
                  <li>Fragmenty przepisów prawnych</li>
                  <li>Pytania o procedury, terminy, podstawy prawne</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Twoja odpowiedzialność:</strong> Przesyłając dane do serwisu, potwierdzasz,
                  że nie zawierają one danych osobowych osób trzecich lub masz zgodę na ich przetwarzanie.
                  Ponosisz pełną odpowiedzialność za zgodność z RODO.
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Przetwarzanie danych:</strong> Administrator danych: JakiePrawo.pl.
                  Procesor danych: Anthropic PBC (USA). Dane są przetwarzane na podstawie Twojej zgody.
                  Szczegóły w <Link to="/polityka-prywatnosci" className="text-primary hover:underline">Polityce Prywatności</Link>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                <Checkbox
                  id="gdpr-understand"
                  checked={understood}
                  onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="gdpr-understand"
                  className="text-sm text-foreground cursor-pointer leading-relaxed"
                >
                  Rozumiem i akceptuję powyższe zasady. Potwierdzam, że nie będę przesyłać danych osobowych
                  osób trzecich bez ich zgody i biorę pełną odpowiedzialność za treści, które przesyłam.
                  Akceptuję <Link to="/regulamin" className="text-primary hover:underline">Regulamin</Link> i{' '}
                  <Link to="/polityka-prywatnosci" className="text-primary hover:underline">Politykę Prywatności</Link>.
                </label>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleAccept}
            disabled={!understood}
            className="w-full sm:w-auto"
          >
            Rozumiem i akceptuję
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
