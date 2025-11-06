import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedbackRequest {
  messageId: string;
  feedbackType: 'positive' | 'negative';
  userQuestion?: string;
  assistantResponse?: string;
  sessionId?: string;
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

    const { messageId, feedbackType, userQuestion, assistantResponse, sessionId }: FeedbackRequest = await req.json()

    // Validate input
    if (!messageId || !feedbackType) {
      return new Response(
        JSON.stringify({ error: 'messageId and feedbackType are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!['positive', 'negative'].includes(feedbackType)) {
      return new Response(
        JSON.stringify({ error: 'feedbackType must be either "positive" or "negative"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get user agent from headers
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Check if feedback already exists for this message
    const { data: existingFeedback, error: checkError } = await supabaseClient
      .from('message_feedback')
      .select('id, feedback_type')
      .eq('message_id', messageId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing feedback:', checkError)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    let result

    if (existingFeedback) {
      // Update existing feedback
      const { data, error } = await supabaseClient
        .from('message_feedback')
        .update({
          feedback_type: feedbackType,
          user_question: userQuestion,
          assistant_response: assistantResponse,
          session_id: sessionId,
          user_agent: userAgent,
        })
        .eq('message_id', messageId)
        .select()
        .single()

      if (error) {
        console.error('Error updating feedback:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update feedback' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      result = data
    } else {
      // Insert new feedback
      const { data, error } = await supabaseClient
        .from('message_feedback')
        .insert({
          message_id: messageId,
          feedback_type: feedbackType,
          user_question: userQuestion,
          assistant_response: assistantResponse,
          session_id: sessionId,
          user_agent: userAgent,
        })
        .select()
        .single()

      if (error) {
        console.error('Error inserting feedback:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to save feedback' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      result = data
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: existingFeedback ? 'Feedback updated' : 'Feedback saved'
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
