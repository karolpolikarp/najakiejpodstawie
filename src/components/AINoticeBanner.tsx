import { Info } from 'lucide-react';

export const AINoticeBanner = () => {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 mb-4 rounded-r">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-sm text-amber-900 dark:text-amber-200 font-semibold">
            Ważne zastrzeżenie prawne
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            JakiePrawo.pl dostarcza <strong>informacje edukacyjne o przepisach prawa</strong>, a nie porady prawne dotyczące konkretnych spraw.
            Odpowiedzi generowane przez AI (Anthropic) wymagają weryfikacji. W sprawach wymagających interpretacji prawnej lub dotyczących Twojej indywidualnej sytuacji,
            zawsze skonsultuj się z wykwalifikowanym prawnikiem lub radcą prawnym. Nie ponosimy odpowiedzialności za decyzje podjęte wyłącznie na podstawie informacji z tej aplikacji.
          </p>
        </div>
      </div>
    </div>
  );
};
