import { useEffect, useState } from 'react';
import { FileText, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getUserDocuments,
  deleteDocument,
  type DocumentMetadata,
} from '@/lib/documentService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DocumentManagerProps {
  selectedDocumentId: string | null;
  onSelectDocument: (document: DocumentMetadata) => void;
}

export function DocumentManager({ selectedDocumentId, onSelectDocument }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getUserDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Nie udało się załadować dokumentów');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (documentId: string) => {
    const confirmed = window.confirm('Czy na pewno chcesz usunąć ten dokument?');
    if (!confirmed) return;

    setDeletingId(documentId);
    try {
      await deleteDocument(documentId);
      setDocuments(docs => docs.filter(doc => doc.id !== documentId));
      toast.success('Dokument został usunięty');

      // If deleted document was selected, clear selection
      if (selectedDocumentId === documentId) {
        onSelectDocument(null as any);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się usunąć dokumentu';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Moje dokumenty</CardTitle>
          <CardDescription>Zarządzaj załączonymi dokumentami prawnymi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Moje dokumenty</CardTitle>
          <CardDescription>Zarządzaj załączonymi dokumentami prawnymi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nie masz jeszcze żadnych dokumentów</p>
            <p className="text-xs mt-1">Załącz dokument poniżej, aby rozpocząć</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Moje dokumenty</CardTitle>
        <CardDescription>Kliknij dokument, aby go wybrać</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map((doc) => {
            const isSelected = selectedDocumentId === doc.id;

            return (
              <div
                key={doc.id}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border cursor-pointer
                  transition-all hover:bg-accent/50
                  ${isSelected ? 'border-primary bg-primary/10' : 'border-border'}
                `}
                onClick={() => onSelectDocument(doc)}
              >
                <div className="flex-shrink-0 mt-1">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                  {doc.contentPreview && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {doc.contentPreview}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                  disabled={deletingId === doc.id}
                  className="flex-shrink-0 h-8 w-8 p-0"
                  aria-label="Usuń dokument"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
