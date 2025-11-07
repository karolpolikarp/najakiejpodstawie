-- Create user_questions table to store all user questions and AI responses
-- This enables analytics, quality monitoring, and improvement of AI responses
CREATE TABLE IF NOT EXISTS public.user_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    answer text NOT NULL,
    has_file_context boolean DEFAULT false,
    file_name text,
    session_id text,
    user_agent text,
    response_time_ms integer,
    created_at timestamptz DEFAULT now(),

    -- Constraints
    CHECK (char_length(question) > 0),
    CHECK (char_length(answer) > 0)
);

-- Create indexes for common queries
CREATE INDEX idx_user_questions_created_at ON public.user_questions(created_at DESC);
CREATE INDEX idx_user_questions_session_id ON public.user_questions(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_user_questions_has_file ON public.user_questions(has_file_context);

-- Enable Row Level Security
ALTER TABLE public.user_questions ENABLE ROW LEVEL SECURITY;

-- Allow Edge Functions to insert questions (using service role key)
-- No public access - only admin/analytics can read
CREATE POLICY "Allow service role insert" ON public.user_questions
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Only allow reading with service role (for admin panel)
CREATE POLICY "Allow service role read" ON public.user_questions
    FOR SELECT
    TO service_role
    USING (true);

-- Add helpful comments
COMMENT ON TABLE public.user_questions IS 'Stores all user questions and AI-generated responses for analytics and quality improvement';
COMMENT ON COLUMN public.user_questions.question IS 'User question submitted to the legal assistant';
COMMENT ON COLUMN public.user_questions.answer IS 'AI-generated response from Claude';
COMMENT ON COLUMN public.user_questions.has_file_context IS 'Whether user attached a document (PDF/DOCX)';
COMMENT ON COLUMN public.user_questions.file_name IS 'Name of attached file if present';
COMMENT ON COLUMN public.user_questions.session_id IS 'User session identifier for tracking conversations';
COMMENT ON COLUMN public.user_questions.response_time_ms IS 'Time taken to generate response in milliseconds';
