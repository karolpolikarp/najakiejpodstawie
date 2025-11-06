import { useRef, useState } from 'react';
import { FileText, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CONSTANTS } from '@/lib/constants';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker - use specific version that works with bundlers
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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
    if (!CONSTANTS.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as any)) {
      toast.error('Wspierane formaty: TXT, PDF, DOC, DOCX');
      return;
    }

    // Check file size
    if (file.size > CONSTANTS.FILE_UPLOAD.MAX_SIZE_BYTES) {
      toast.error(`Plik jest za duży (max ${CONSTANTS.FILE_UPLOAD.MAX_SIZE_MB}MB)`);
      return;
    }

    setIsLoading(true);

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
  );
}
