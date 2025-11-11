import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// CORS configuration
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
    'https://jakieprawo.pl',
    'https://www.jakieprawo.pl',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
    'https://najakiejpodstawie.pl',
    'https://najakiejpodstawie.vercel.app',
  ];
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return allowedOrigins[0];
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true'
});

interface CacheCheckRequest {
  question: string;
  modelUsed?: string;
  similarityThreshold?: number;
}

interface CacheSaveRequest {
  question: string;
  answer: string;
  modelUsed: string;
  hasFileContext?: boolean;
  sessionId?: string;
}

/**
 * Normalize question for better matching
 * - Lowercase
 * - Remove extra whitespace
 * - Remove punctuation at the end
 */
function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[?.!]+$/, '');
}

/**
 * Generate embedding using OpenAI API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI embedding error:', error);
    throw new Error(`Failed to generate embedding: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'check') {
      // Check if similar question exists in cache
      const requestBody: CacheCheckRequest = await req.json();
      const { question, similarityThreshold = 0.85 } = requestBody;

      if (!question || typeof question !== 'string') {
        return new Response(JSON.stringify({
          error: 'Question is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('[CACHE] Checking for similar question:', question.substring(0, 100));

      // Generate embedding for the question
      const embedding = await generateEmbedding(normalizeQuestion(question));

      // Search for similar questions using the database function
      const { data: similarQuestions, error } = await supabaseClient
        .rpc('find_similar_questions', {
          query_embedding: embedding,
          similarity_threshold: similarityThreshold,
          match_limit: 1
        });

      if (error) {
        console.error('[CACHE] Error finding similar questions:', error);
        return new Response(JSON.stringify({
          found: false,
          error: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (similarQuestions && similarQuestions.length > 0) {
        const match = similarQuestions[0];
        console.log(`[CACHE] Found similar question with similarity: ${match.similarity.toFixed(3)}`);

        // Increment hit count
        await supabaseClient.rpc('increment_cache_hit', { cache_id: match.id });

        return new Response(JSON.stringify({
          found: true,
          cached: {
            question: match.question,
            answer: match.answer,
            similarity: match.similarity,
            hitCount: match.hit_count + 1,
            createdAt: match.created_at,
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('[CACHE] No similar question found');
      return new Response(JSON.stringify({
        found: false
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'save') {
      // Save new question and answer with embedding
      const requestBody: CacheSaveRequest = await req.json();
      const { question, answer, modelUsed, hasFileContext = false, sessionId } = requestBody;

      if (!question || !answer || !modelUsed) {
        return new Response(JSON.stringify({
          error: 'Question, answer, and modelUsed are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('[CACHE] Saving new cache entry:', question.substring(0, 100));

      // Generate embedding
      const normalizedQuestion = normalizeQuestion(question);
      const embedding = await generateEmbedding(normalizedQuestion);

      // Save to database
      const { data, error } = await supabaseClient
        .from('ai_cache_embeddings')
        .insert({
          question,
          question_normalized: normalizedQuestion,
          answer,
          embedding,
          model_used: modelUsed,
          has_file_context: hasFileContext,
          session_id: sessionId,
        })
        .select()
        .single();

      if (error) {
        console.error('[CACHE] Error saving cache:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('[CACHE] Cache entry saved successfully');
      return new Response(JSON.stringify({
        success: true,
        id: data.id
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({
        error: 'Invalid action. Use ?action=check or ?action=save'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('[CACHE] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(JSON.stringify({
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
