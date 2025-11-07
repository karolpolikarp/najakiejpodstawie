-- Drop the redundant message_feedback table
-- All data now stored in user_questions table

DROP TABLE IF EXISTS public.message_feedback CASCADE;

COMMENT ON TABLE public.user_questions IS 'Stores all user questions, AI responses, and feedback in one place for analytics and quality improvement';
