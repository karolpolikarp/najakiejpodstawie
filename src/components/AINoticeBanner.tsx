import { Info } from 'lucide-react';

export const AINoticeBanner = () => {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 mb-4 rounded-r">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>🤖 Odpowiedzi generowane przez sztuczną inteligencję (Anthropic)</strong> i mogą zawierać błędy. To narzędzie informacyjne –{' '}
            <strong>nie zastępuje prawnika</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
