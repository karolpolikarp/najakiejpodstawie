-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create ai_cache_embeddings table for semantic search of similar questions
-- Uses OpenAI embeddings (text-embedding-3-small: 1536 dimensions)
CREATE TABLE IF NOT EXISTS public.ai_cache_embeddings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    question_normalized text NOT NULL, -- normalized for comparison
    answer text NOT NULL,
    embedding vector(1536) NOT NULL, -- OpenAI text-embedding-3-small
    model_used text NOT NULL, -- e.g., 'claude-haiku-4-5-20251001'
    has_file_context boolean DEFAULT false,
    session_id text,
    hit_count integer DEFAULT 0, -- track how many times this cache was used
    last_hit_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- Constraints
    CHECK (char_length(question) > 0),
    CHECK (char_length(answer) > 0),
    CHECK (hit_count >= 0)
);

-- Create indexes for semantic search and performance
CREATE INDEX idx_ai_cache_embedding_vector ON public.ai_cache_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100); -- adjust lists based on data size

CREATE INDEX idx_ai_cache_created_at ON public.ai_cache_embeddings(created_at DESC);
CREATE INDEX idx_ai_cache_hit_count ON public.ai_cache_embeddings(hit_count DESC);
CREATE INDEX idx_ai_cache_normalized ON public.ai_cache_embeddings(question_normalized);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_ai_cache_updated_at
    BEFORE UPDATE ON public.ai_cache_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_cache_updated_at();

-- Enable Row Level Security
ALTER TABLE public.ai_cache_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow Edge Functions to read/write (using service role key)
CREATE POLICY "Allow service role all" ON public.ai_cache_embeddings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to find similar questions using cosine similarity
-- Returns top N similar questions with similarity score
CREATE OR REPLACE FUNCTION find_similar_questions(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.85,
    match_limit int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    question text,
    answer text,
    model_used text,
    similarity float,
    hit_count integer,
    created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ai_cache_embeddings.id,
        ai_cache_embeddings.question,
        ai_cache_embeddings.answer,
        ai_cache_embeddings.model_used,
        1 - (ai_cache_embeddings.embedding <=> query_embedding) as similarity,
        ai_cache_embeddings.hit_count,
        ai_cache_embeddings.created_at
    FROM public.ai_cache_embeddings
    WHERE 1 - (ai_cache_embeddings.embedding <=> query_embedding) > similarity_threshold
    ORDER BY ai_cache_embeddings.embedding <=> query_embedding
    LIMIT match_limit;
END;
$$;

-- Function to increment hit count when cache is used
CREATE OR REPLACE FUNCTION increment_cache_hit(cache_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.ai_cache_embeddings
    SET
        hit_count = hit_count + 1,
        last_hit_at = now()
    WHERE id = cache_id;
END;
$$;

-- Add helpful comments
COMMENT ON TABLE public.ai_cache_embeddings IS 'Stores AI responses with embeddings for semantic search and caching';
COMMENT ON COLUMN public.ai_cache_embeddings.question IS 'Original user question';
COMMENT ON COLUMN public.ai_cache_embeddings.question_normalized IS 'Normalized question for exact match comparison';
COMMENT ON COLUMN public.ai_cache_embeddings.answer IS 'AI-generated response from Claude';
COMMENT ON COLUMN public.ai_cache_embeddings.embedding IS 'OpenAI embedding vector (1536 dimensions) for semantic search';
COMMENT ON COLUMN public.ai_cache_embeddings.model_used IS 'Claude model used to generate the response';
COMMENT ON COLUMN public.ai_cache_embeddings.hit_count IS 'Number of times this cached response was reused';
COMMENT ON COLUMN public.ai_cache_embeddings.last_hit_at IS 'Timestamp of last cache hit';
COMMENT ON FUNCTION find_similar_questions IS 'Finds semantically similar questions using cosine similarity';
COMMENT ON FUNCTION increment_cache_hit IS 'Increments hit counter when cached response is used';
