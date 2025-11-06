import { useRef, useState } from 'react';
import { FileText, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
  onFileRemove: () => void;
  currentFile: string | null;
}

export function FileUpload({ onFileLoad, onFileRemove, currentFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['text/plain', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Wspierane formaty: TXT, PDF');
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Plik jest za duży (max 5MB)');
      return;
    }

    setIsLoading(true);

    try {
      let content = '';

      if (file.type === 'text/plain') {
        // Read text file
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        // For PDF, we'll need to extract text
        // Simple approach: read as text (works for some PDFs)
        content = await file.text();

        // Note: For better PDF support, we'd need a library like pdf.js
        // For now, show a message that PDF support is basic
        if (!content || content.length < 50) {
          toast.error('Nie udało się odczytać PDF. Spróbuj przekonwertować na TXT');
          return;
        }
      }

      if (!content || content.trim().length === 0) {
        toast.error('Plik jest pusty');
        return;
      }

      // Limit content length (to avoid API limits)
      const maxLength = 50000; // ~50k chars
      if (content.length > maxLength) {
        content = content.substring(0, maxLength);
        toast.info('Plik został skrócony do pierwszych 50 000 znaków');
      }

      onFileLoad(content, file.name);
      toast.success(`Załączono: ${file.name}`);
    } catch (error) {
      console.error('File read error:', error);
      toast.error('Nie udało się wczytać pliku');
    } finally {
      setIsLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    onFileRemove();
    toast.info('Usunięto załączony plik');
  };

  return (
    <div className="mb-2 sm:mb-3">
      {!currentFile ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={isLoading}
          />
          <label htmlFor="file-upload" className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              asChild
              className="cursor-pointer w-full sm:w-auto text-xs sm:text-sm"
            >
              <span>
                {isLoading ? (
                  <>
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-pulse" aria-hidden="true" />
                    Wczytuję...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline">Załącz plik (TXT, PDF)</span>
                    <span className="sm:hidden">Załącz plik</span>
                  </>
                )}
              </span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground">
            Opcjonalnie: załącz ustawę aby AI miało pełny kontekst
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
          <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" aria-hidden="true" />
          <span className="text-xs sm:text-sm text-foreground flex-1 truncate">{currentFile}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            aria-label="Usuń załączony plik"
            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
