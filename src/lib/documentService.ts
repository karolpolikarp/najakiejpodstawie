import { supabase } from '@/integrations/supabase/client';
import { CONSTANTS } from '@/lib/constants';

export interface DocumentMetadata {
  id: string;
  sessionId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  contentPreview: string;
  createdAt: string;
}

/**
 * Generate a unique session ID for the current user
 * Uses localStorage to persist the session across page reloads
 */
export function getOrCreateSessionId(): string {
  const storageKey = 'najakiejpodstawie-session-id';
  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

/**
 * Upload a file to Supabase Storage and save metadata to database
 */
export async function uploadDocument(file: File): Promise<DocumentMetadata> {
  const sessionId = getOrCreateSessionId();

  // Validate file
  if (!CONSTANTS.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as any)) {
    throw new Error('Nieobsługiwany typ pliku');
  }

  if (file.size > CONSTANTS.FILE_UPLOAD.MAX_SIZE_BYTES) {
    throw new Error(`Plik jest za duży (max ${CONSTANTS.FILE_UPLOAD.MAX_SIZE_MB}MB)`);
  }

  // Read file content for preview
  let contentPreview = '';
  try {
    if (file.type === 'text/plain') {
      const content = await file.text();
      contentPreview = content.substring(0, 500);
    } else if (file.type === 'application/pdf') {
      // For PDF, we'll try to read as text (basic support)
      const content = await file.text();
      contentPreview = content.substring(0, 500);
    }
  } catch (error) {
    console.error('Error reading file preview:', error);
    contentPreview = 'Podgląd niedostępny';
  }

  // Generate unique file path
  const timestamp = Date.now();
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${sessionId}/${timestamp}_${sanitizedFilename}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('legal-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Błąd uploadowania pliku: ${uploadError.message}`);
  }

  // Save metadata to database
  const { data, error: dbError } = await supabase
    .from('legal_documents')
    .insert({
      session_id: sessionId,
      filename: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      content_preview: contentPreview,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabase.storage
      .from('legal-documents')
      .remove([filePath]);

    throw new Error(`Błąd zapisywania metadanych: ${dbError.message}`);
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    filename: data.filename,
    filePath: data.file_path,
    fileSize: data.file_size,
    fileType: data.file_type,
    contentPreview: data.content_preview,
    createdAt: data.created_at,
  };
}

/**
 * Get all documents for current session
 */
export async function getUserDocuments(): Promise<DocumentMetadata[]> {
  const sessionId = getOrCreateSessionId();

  const { data, error } = await supabase
    .from('legal_documents')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Błąd pobierania dokumentów: ${error.message}`);
  }

  return data.map((doc: any) => ({
    id: doc.id,
    sessionId: doc.session_id,
    filename: doc.filename,
    filePath: doc.file_path,
    fileSize: doc.file_size,
    fileType: doc.file_type,
    contentPreview: doc.content_preview,
    createdAt: doc.created_at,
  }));
}

/**
 * Delete a document (both from storage and database)
 */
export async function deleteDocument(documentId: string): Promise<void> {
  // First, get the file path
  const { data, error: fetchError } = await supabase
    .from('legal_documents')
    .select('file_path')
    .eq('id', documentId)
    .single();

  if (fetchError) {
    throw new Error(`Błąd pobierania dokumentu: ${fetchError.message}`);
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('legal-documents')
    .remove([data.file_path]);

  if (storageError) {
    console.error('Error deleting from storage:', storageError);
    // Continue with database deletion even if storage deletion fails
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('legal_documents')
    .delete()
    .eq('id', documentId);

  if (dbError) {
    throw new Error(`Błąd usuwania dokumentu: ${dbError.message}`);
  }
}

/**
 * Download file content from storage
 */
export async function downloadDocumentContent(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('legal-documents')
    .download(filePath);

  if (error) {
    throw new Error(`Błąd pobierania pliku: ${error.message}`);
  }

  // Convert blob to text
  const text = await data.text();
  return text;
}
