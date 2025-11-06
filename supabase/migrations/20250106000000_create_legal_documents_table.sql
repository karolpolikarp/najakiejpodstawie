-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create legal_documents table
CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    content_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by session_id
CREATE INDEX idx_legal_documents_session_id ON legal_documents(session_id);
CREATE INDEX idx_legal_documents_created_at ON legal_documents(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_legal_documents_updated_at
    BEFORE UPDATE ON legal_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE legal_documents IS 'Stores uploaded legal documents (contracts, laws, legal acts) for user queries';
COMMENT ON COLUMN legal_documents.session_id IS 'Session identifier (since we use password gate, not user auth)';
COMMENT ON COLUMN legal_documents.filename IS 'Original filename uploaded by user';
COMMENT ON COLUMN legal_documents.file_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN legal_documents.file_size IS 'File size in bytes';
COMMENT ON COLUMN legal_documents.file_type IS 'MIME type of the file';
COMMENT ON COLUMN legal_documents.content_preview IS 'First 500 characters for preview purposes';
