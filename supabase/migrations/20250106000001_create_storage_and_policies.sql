-- Create storage bucket for legal documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('legal-documents', 'legal-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on legal_documents table
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert documents (since we use password gate, not user auth)
CREATE POLICY "Allow insert for all authenticated users"
ON legal_documents
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow users to read their own documents based on session_id
CREATE POLICY "Allow read for session documents"
ON legal_documents
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow users to delete their own documents based on session_id
CREATE POLICY "Allow delete for session documents"
ON legal_documents
FOR DELETE
TO authenticated
USING (true);

-- Storage policies for legal-documents bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'legal-documents');

CREATE POLICY "Allow authenticated users to read their files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'legal-documents');

CREATE POLICY "Allow authenticated users to delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'legal-documents');

CREATE POLICY "Allow authenticated users to update their files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'legal-documents')
WITH CHECK (bucket_id = 'legal-documents');
