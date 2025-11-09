/**
 * ELI MCP Server
 * HTTP API for accessing Polish legal acts via ELI API
 */

import { ELIClient } from './eli-client.ts';
import { ELITools } from './tools.ts';

const PORT = Deno.env.get('PORT') || '8080';
const API_KEY = Deno.env.get('API_KEY') || 'dev-secret-key';
const CACHE_TTL = parseInt(Deno.env.get('CACHE_TTL') || '3600');

const client = new ELIClient(CACHE_TTL);
const tools = new ELITools(client);

/**
 * CORS headers for allowing requests from Supabase Edge Function
 */
function corsHeaders(origin?: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * Verify API key from Authorization header
 */
function verifyAuth(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return false;

  // Support both "Bearer <key>" and just "<key>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  return token === API_KEY;
}

/**
 * Handle incoming requests
 */
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const origin = req.headers.get('Origin') || undefined;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  // Health check endpoint (no auth required)
  if (url.pathname === '/health') {
    return new Response(
      JSON.stringify({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
        },
      },
    );
  }

  // Verify authentication for all other endpoints
  if (!verifyAuth(req)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - invalid or missing API key' }),
      {
        status: 401,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
        },
      },
    );
  }

  try {
    // Route to appropriate tool
    if (url.pathname === '/tools/search_acts' && req.method === 'POST') {
      const body = await req.json();
      const result = await tools.searchActs(body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
        },
      });
    }

    if (url.pathname === '/tools/get_article' && req.method === 'POST') {
      const body = await req.json();
      const result = await tools.getArticle(body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
        },
      });
    }

    if (url.pathname === '/tools/get_act_details' && req.method === 'POST') {
      const body = await req.json();
      const result = await tools.getActDetails(body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
        },
      });
    }

    // Not found
    return new Response(
      JSON.stringify({
        error: 'Not found',
        available_endpoints: [
          'GET /health - Health check (no auth)',
          'POST /tools/search_acts - Search for acts',
          'POST /tools/get_article - Get specific article',
          'POST /tools/get_act_details - Get act details',
        ],
      }),
      {
        status: 404,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error handling request:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
        },
      },
    );
  }
}

console.log(`🚀 ELI MCP Server starting on port ${PORT}...`);
console.log(`📋 API Key: ${API_KEY.substring(0, 8)}...`);
console.log(`⏱️  Cache TTL: ${CACHE_TTL}s`);
console.log('');
console.log('Available endpoints:');
console.log('  GET  /health             - Health check (no auth)');
console.log('  POST /tools/search_acts  - Search for acts');
console.log('  POST /tools/get_article  - Get specific article');
console.log('  POST /tools/get_act_details - Get act details');

Deno.serve({ port: parseInt(PORT) }, handler);
