import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Parse query parameters
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const searchQuery = url.searchParams.get('search') || ''

    // Build query
    let query = supabaseClient
      .from('user_questions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add search filter if provided
    if (searchQuery) {
      query = query.or(`question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch questions' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get statistics
    const { data: stats } = await supabaseClient
      .from('user_questions')
      .select('id', { count: 'exact', head: true })

    const { data: withFilesStats } = await supabaseClient
      .from('user_questions')
      .select('id', { count: 'exact', head: true })
      .eq('has_file_context', true)

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
        statistics: {
          total_questions: stats?.length || 0,
          questions_with_files: withFilesStats?.length || 0,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in get-questions function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
