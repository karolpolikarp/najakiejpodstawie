-- Create analytics tables for usage statistics

-- Table for tracking questions asked by users
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_hash TEXT NOT NULL, -- For grouping similar questions
    category TEXT,
    has_file_context BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking responses
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    response_length INTEGER,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking sessions (optional, for more advanced analytics)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_questions INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_hash ON questions(question_hash);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at DESC);

-- Create view for most asked questions
CREATE OR REPLACE VIEW most_asked_questions AS
SELECT
    question_hash,
    MIN(question_text) as question_text, -- Get one representative question
    COUNT(*) as ask_count,
    MAX(created_at) as last_asked
FROM questions
GROUP BY question_hash
ORDER BY ask_count DESC, last_asked DESC;

-- Create view for daily statistics
CREATE OR REPLACE VIEW daily_statistics AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as total_questions,
    COUNT(CASE WHEN has_file_context THEN 1 END) as questions_with_context
FROM questions
GROUP BY DATE(created_at)
ORDER BY date DESC;
