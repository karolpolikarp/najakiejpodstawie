-- Add response caching capabilities to user_questions table
-- This enables reusing answers for duplicate questions, saving API costs

-- Add question_hash column for fast duplicate detection
ALTER TABLE public.user_questions
ADD COLUMN IF NOT EXISTS question_hash text;

-- Create index on question_hash for O(1) duplicate lookup
CREATE INDEX IF NOT EXISTS idx_user_questions_question_hash
ON public.user_questions(question_hash)
WHERE question_hash IS NOT NULL;

-- Create partial index on recent questions (last 7 days) for cache hits
CREATE INDEX IF NOT EXISTS idx_user_questions_recent_cache
ON public.user_questions(question_hash, created_at DESC)
WHERE question_hash IS NOT NULL
AND created_at > (now() - interval '7 days')
AND NOT has_file_context; -- Only cache questions without file context

-- Add helpful comment
COMMENT ON COLUMN public.user_questions.question_hash IS 'MD5 hash of normalized question for cache lookup';
