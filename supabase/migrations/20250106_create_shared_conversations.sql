-- Create shared_conversations table
CREATE TABLE IF NOT EXISTS public.shared_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  messages JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE
);

-- Add index on created_at for faster queries
CREATE INDEX idx_shared_conversations_created_at ON public.shared_conversations(created_at DESC);

-- Add index on expires_at for cleanup queries
CREATE INDEX idx_shared_conversations_expires_at ON public.shared_conversations(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.shared_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read shared conversations
CREATE POLICY "Allow public read access to shared conversations"
  ON public.shared_conversations
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert shared conversations
CREATE POLICY "Allow public insert access to shared conversations"
  ON public.shared_conversations
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow public to update view count
CREATE POLICY "Allow public update of view count"
  ON public.shared_conversations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.shared_conversations IS 'Stores shared conversations that can be accessed via permalink';
