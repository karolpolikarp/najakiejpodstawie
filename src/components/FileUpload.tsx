import { useRef, useState } from 'react';
import { FileText, X, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CONSTANTS } from '@/lib/constants';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Configure PDF.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
  onFileRemove: () => void;
  currentFile: string | null;
}

export function FileUpload({ onFileLoad, onFileRemove, currentFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmedNoPersonalData, setConfirmedNoPersonalData] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!CONSTANTS.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as any)) {
      toast.error('Wspierane formaty: TXT, PDF, DOC, DOCX');
      return;
    }

    // Check file size
    if (file.size > CONSTANTS.FILE_UPLOAD.MAX_SIZE_BYTES) {
      toast.error(`Plik jest za duży (max ${CONSTANTS.FILE_UPLOAD.MAX_SIZE_MB}MB)`);
      return;
    }

    // Show warning dialog before processing
    setPendingFile(file);
    setConfirmedNoPersonalData(false);
    setShowWarningDialog(true);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async () => {
    if (!pendingFile || !confirmedNoPersonalData) return;

    setShowWarningDialog(false);
    setIsLoading(true);
    const file = pendingFile;

    try {
      let content = '';

      if (file.type === 'text/plain') {
        // Read text file
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        // Extract text from PDF using pdf.js
        try {
          console.log('📄 Starting PDF parsing...');
          const arrayBuffer = await file.arrayBuffer();
          console.log('✓ ArrayBuffer created, size:', arrayBuffer.byteLength);

          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          console.log('✓ PDF loaded, pages:', pdf.numPages);

          const textParts: string[] = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`📄 Reading page ${i}/${pdf.numPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');
            textParts.push(pageText);
            console.log(`✓ Page ${i} extracted, chars:`, pageText.length);
          }

          content = textParts.join('\n\n');
          console.log('✓ PDF parsing complete! Total chars:', content.length);
        } catch (pdfError) {
          console.error('❌ PDF parsing error:', pdfError);
          toast.error(`Nie udało się odczytać PDF: ${pdfError instanceof Error ? pdfError.message : 'Nieznany błąd'}`);
          return;
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Extract text from DOCX using mammoth
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          content = result.value;
        } catch (docxError) {
          console.error('DOCX parsing error:', docxError);
          toast.error('Nie udało się odczytać DOCX');
          return;
        }
      } else if (file.type === 'application/msword') {
        // DOC format is not fully supported by mammoth, show warning
        toast.error('Format DOC nie jest w pełni wspierany. Proszę przekonwertować na DOCX lub TXT.');
        return;
      }

      if (!content || content.trim().length === 0) {
        toast.error('Plik jest pusty lub nie zawiera tekstu');
        return;
      }

      // Limit content length (to avoid API limits)
      if (content.length > CONSTANTS.FILE_UPLOAD.MAX_CONTENT_LENGTH) {
        content = content.substring(0, CONSTANTS.FILE_UPLOAD.MAX_CONTENT_LENGTH);
        toast.info(`Plik został skrócony do pierwszych ${CONSTANTS.FILE_UPLOAD.MAX_CONTENT_LENGTH.toLocaleString('pl-PL')} znaków`);
      }

      onFileLoad(content, file.name);
      toast.success(`Załączono: ${file.name}`);
    } catch (error) {
      console.error('File read error:', error);
      toast.error('Nie udało się wczytać pliku');
    } finally {
      setIsLoading(false);
      setPendingFile(null);
    }
  };

  const handleRemoveFile = () => {
    onFileRemove();
    toast.info('Usunięto załączony plik');
  };

  return (
    <>
      <div className="mb-2 sm:mb-3">
        {!currentFile ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={CONSTANTS.FILE_UPLOAD.ALLOWED_EXTENSIONS.join(',')}
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
                      <span className="hidden sm:inline">Załącz plik (TXT, PDF, DOCX)</span>
                      <span className="sm:hidden">Załącz plik</span>
                    </>
                  )}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              Opcjonalnie: załącz dokument, aby AI miało pełny kontekst
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

      {/* File Upload Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <AlertDialogTitle>Ostrzeżenie o danych osobowych</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-left">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    ⚠️ Upewnij się, że plik NIE zawiera:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-800 dark:text-amber-200 ml-2">
                    <li>Imion i nazwisk</li>
                    <li>Adresów, numerów telefonów</li>
                    <li>PESEL, NIP, nr dokumentów</li>
                    <li>Podpisów, pieczęci</li>
                    <li>Innych danych osobowych</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground">
                  Przed przesłaniem zanonimizuj wszystkie dane osobowe (zamień na "Osoba A", "[DANE USUNIĘTE]", itp.)
                </p>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Plik: {pendingFile?.name}</strong>
                    <br />
                    Rozmiar: {pendingFile ? (pendingFile.size / 1024).toFixed(1) : 0} KB
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg">
                  <Checkbox
                    id="confirm-no-personal-data"
                    checked={confirmedNoPersonalData}
                    onCheckedChange={(checked) => setConfirmedNoPersonalData(checked as boolean)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="confirm-no-personal-data"
                    className="text-sm text-foreground cursor-pointer leading-relaxed"
                  >
                    Potwierdzam, że plik nie zawiera danych osobowych lub zostały one zanonimizowane.
                    Rozumiem, że ponoszę odpowiedzialność za przesyłane treści.
                  </label>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingFile(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={processFile}
              disabled={!confirmedNoPersonalData}
            >
              Załącz plik
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
