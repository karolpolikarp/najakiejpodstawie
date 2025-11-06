-- Create message_feedback table to store user feedback on assistant responses
CREATE TABLE IF NOT EXISTS public.message_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id text NOT NULL,
    feedback_type text NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
    user_question text,
    assistant_response text,
    created_at timestamptz DEFAULT now(),
    session_id text,
    user_agent text,

    -- Create index for faster lookups
    CONSTRAINT unique_message_feedback UNIQUE (message_id)
);

-- Create index for analytics queries
CREATE INDEX idx_message_feedback_created_at ON public.message_feedback(created_at DESC);
CREATE INDEX idx_message_feedback_type ON public.message_feedback(feedback_type);

-- Enable Row Level Security
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public app)
CREATE POLICY "Allow public insert" ON public.message_feedback
    FOR INSERT
    WITH CHECK (true);

-- Allow reading feedback for analytics (you might want to restrict this)
CREATE POLICY "Allow public read" ON public.message_feedback
    FOR SELECT
    USING (true);

-- Allow updating feedback (users can change their mind)
CREATE POLICY "Allow public update" ON public.message_feedback
    FOR UPDATE
    USING (true);

COMMENT ON TABLE public.message_feedback IS 'Stores user feedback (thumbs up/down) for assistant responses to improve AI prompts and responses';
COMMENT ON COLUMN public.message_feedback.message_id IS 'Unique identifier for the message that received feedback';
COMMENT ON COLUMN public.message_feedback.feedback_type IS 'Type of feedback: positive (thumbs up) or negative (thumbs down)';
COMMENT ON COLUMN public.message_feedback.user_question IS 'Original user question for context';
COMMENT ON COLUMN public.message_feedback.assistant_response IS 'Assistant response that received the feedback';
