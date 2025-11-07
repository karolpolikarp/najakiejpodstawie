-- Add feedback column to user_questions table
ALTER TABLE public.user_questions
  ADD COLUMN IF NOT EXISTS feedback text CHECK (feedback IN ('positive', 'negative'));

-- Add message_id column to link with frontend message IDs
ALTER TABLE public.user_questions
  ADD COLUMN IF NOT EXISTS message_id text;

-- Create index for faster feedback queries
CREATE INDEX IF NOT EXISTS idx_user_questions_feedback ON public.user_questions(feedback) WHERE feedback IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_questions_message_id ON public.user_questions(message_id) WHERE message_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.user_questions.feedback IS 'User feedback on the answer: positive (thumbs up) or negative (thumbs down)';
COMMENT ON COLUMN public.user_questions.message_id IS 'Frontend message ID to link feedback with questions';
