import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedbackRequest {
  messageId: string;
  feedbackType: 'positive' | 'negative' | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
    )

    const { messageId, feedbackType }: FeedbackRequest = await req.json()

    // Validate input
    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'messageId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (feedbackType !== null && !['positive', 'negative'].includes(feedbackType)) {
      return new Response(
        JSON.stringify({ error: 'feedbackType must be either "positive", "negative", or null' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update feedback in user_questions table
    const { data, error } = await supabaseClient
      .from('user_questions')
      .update({ feedback: feedbackType })
      .eq('message_id', messageId)
      .select()
      .single()

    if (error) {
      console.error('Error updating feedback:', error)

      // If no rows found, it might be that the question hasn't been saved yet
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Question not found with this messageId' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Failed to update feedback' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Feedback updated for message:', messageId, 'to:', feedbackType)

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        message: 'Feedback saved'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in submit-feedback function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
