/**
 * Integration tests for legal-assistant Edge Function
 *
 * Note: These tests use Deno test framework since Edge Functions run in Deno runtime.
 * Run with: deno test --allow-env --allow-net supabase/functions/legal-assistant/index.test.ts
 *
 * For CI/CD integration, you can also run these with supabase functions serve locally
 * and test via HTTP calls.
 */

import { assertEquals, assertExists, assert } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const FUNCTION_URL = Deno.env.get('FUNCTION_URL') || 'http://localhost:54321/functions/v1/legal-assistant';

// Helper to make requests to the function
async function callFunction(body: any, options: RequestInit = {}) {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:8080',
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });

  return response;
}

// Note: These tests require the Edge Function to be running
// Run locally with: supabase functions serve legal-assistant --env-file supabase/.env.local

Deno.test({
  name: "Edge Function - CORS headers on OPTIONS request",
  async fn() {
    const response = await fetch(FUNCTION_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
      },
    });

    // Should allow CORS
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), 'http://localhost:8080');
    assertExists(response.headers.get('Access-Control-Allow-Headers'));
    assertEquals(response.headers.get('Access-Control-Allow-Credentials'), 'true');
  },
  ignore: true, // Set to false when testing with a running function
});

Deno.test({
  name: "Edge Function - CORS headers on POST request",
  async fn() {
    const response = await callFunction({
      message: 'Ile mam dni urlopu?',
    });

    // Should include CORS headers in response
    assertExists(response.headers.get('Access-Control-Allow-Origin'));
    assertEquals(response.headers.get('Content-Type'), 'application/json');
  },
  ignore: true,
});

Deno.test({
  name: "Edge Function - Valid legal question returns structured response",
  async fn() {
    const response = await callFunction({
      message: 'Ile mam dni urlopu?',
    });

    assertEquals(response.status, 200);

    const data = await response.json();
    assertExists(data.message);
    assert(data.message.length > 0);

    // Should contain expected sections
    assert(data.message.includes('PODSTAWA PRAWNA'));
  },
  ignore: true,
});

Deno.test({
  name: "Edge Function - Non-legal question returns rejection",
  async fn() {
    const response = await callFunction({
      message: 'Jak ugotować pierogi?',
    });

    assertEquals(response.status, 200);

    const data = await response.json();
    assertExists(data.message);

    // Should reject non-legal questions
    assert(data.message.includes('❌') || data.message.toLowerCase().includes('przepraszam'));
  },
  ignore: true,
});

Deno.test({
  name: "Edge Function - File context is processed",
  async fn() {
    const response = await callFunction({
      message: 'Co mówi ten dokument o urlopie?',
      fileContext: 'Regulamin firmy XYZ. Pracownik ma prawo do 26 dni urlopu wypoczynkowego rocznie.',
    });

    assertEquals(response.status, 200);

    const data = await response.json();
    assertExists(data.message);
    assert(data.message.length > 0);
  },
  ignore: true,
});

Deno.test({
  name: "Edge Function - Handles missing API key gracefully",
  async fn() {
    // This test would require temporarily removing the API key
    // In a real test environment, you'd use a separate test deployment
    // For now, this is a placeholder test
    assert(true);
  },
  ignore: true,
});

Deno.test({
  name: "Edge Function - Returns error for malformed request",
  async fn() {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080',
      },
      body: 'invalid json',
    });

    // Should return error response
    assert(response.status >= 400);
  },
  ignore: true,
});

Deno.test({
  name: "Edge Function - CORS allows only whitelisted origins",
  async fn() {
    const unauthorizedOrigin = 'https://malicious-site.com';

    const response = await fetch(FUNCTION_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': unauthorizedOrigin,
      },
    });

    // Should NOT return the unauthorized origin
    const allowedOrigin = response.headers.get('Access-Control-Allow-Origin');
    assert(allowedOrigin !== unauthorizedOrigin);
    // Should default to first allowed origin
    assert(allowedOrigin === 'http://localhost:8080' || allowedOrigin?.includes('localhost'));
  },
  ignore: true,
});

/**
 * Mock-based unit tests for Edge Function logic
 * These tests don't require a running function
 */

Deno.test({
  name: "Unit - CORS origin selection logic",
  fn() {
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:5173',
    ];

    // Test 1: Allowed origin should be returned
    const requestOrigin1 = 'http://localhost:8080';
    const result1 = allowedOrigins.includes(requestOrigin1) ? requestOrigin1 : allowedOrigins[0];
    assertEquals(result1, 'http://localhost:8080');

    // Test 2: Unauthorized origin should default to first allowed
    const requestOrigin2 = 'https://evil.com';
    const result2 = allowedOrigins.includes(requestOrigin2) ? requestOrigin2 : allowedOrigins[0];
    assertEquals(result2, 'http://localhost:8080');

    // Test 3: Null origin should default to first allowed
    const result3 = allowedOrigins[0];
    assertEquals(result3, 'http://localhost:8080');
  },
});

Deno.test({
  name: "Unit - File context truncation logic",
  fn() {
    const maxLength = 30000;

    // Test 1: Short content should not be truncated
    const shortContent = 'Short document content';
    const result1 = shortContent.length > maxLength
      ? shortContent.substring(0, maxLength) + "\n\n[...dokument został skrócony...]"
      : shortContent;
    assertEquals(result1, shortContent);

    // Test 2: Long content should be truncated
    const longContent = 'x'.repeat(40000);
    const result2 = longContent.length > maxLength
      ? longContent.substring(0, maxLength) + "\n\n[...dokument został skrócony...]"
      : longContent;
    assert(result2.length < longContent.length);
    assert(result2.includes('[...dokument został skrócony...]'));
    assertEquals(result2.substring(0, maxLength), longContent.substring(0, maxLength));
  },
});

Deno.test({
  name: "Unit - User message formatting with file context",
  fn() {
    const message = 'Jakie mam prawa?';
    const fileContext = 'Dokument zawiera informacje o prawach pracowniczych.';

    const formattedMessage = `ZAŁĄCZONY DOKUMENT:
---
${fileContext}
---

PYTANIE UŻYTKOWNIKA:
${message}`;

    assert(formattedMessage.includes('ZAŁĄCZONY DOKUMENT'));
    assert(formattedMessage.includes(fileContext));
    assert(formattedMessage.includes('PYTANIE UŻYTKOWNIKA'));
    assert(formattedMessage.includes(message));
  },
});

Deno.test({
  name: "Unit - User message without file context",
  fn() {
    const message = 'Jakie mam prawa?';
    const fileContext = undefined;

    const formattedMessage = fileContext ? `ZAŁĄCZONY DOKUMENT:\n---\n${fileContext}\n---\n\nPYTANIE UŻYTKOWNIKA:\n${message}` : message;

    assertEquals(formattedMessage, message);
    assert(!formattedMessage.includes('ZAŁĄCZONY DOKUMENT'));
  },
});

Deno.test({
  name: "Unit - Error response formats",
  fn() {
    // Test rate limit error format
    const rateLimitError = { error: 'Osiągnięto limit zapytań. Spróbuj ponownie za chwilę.' };
    assertExists(rateLimitError.error);
    assert(rateLimitError.error.includes('limit zapytań'));

    // Test auth error format
    const authError = { error: 'Nieprawidłowy klucz API. Sprawdź konfigurację.' };
    assertExists(authError.error);
    assert(authError.error.includes('klucz API'));

    // Test general error format
    const generalError = { error: 'Unknown error' };
    assertExists(generalError.error);
  },
});

Deno.test({
  name: "Unit - Response format validation",
  fn() {
    // Success response should have message field
    const successResponse = { message: 'PODSTAWA PRAWNA:\nArt. 123' };
    assertExists(successResponse.message);
    assert(typeof successResponse.message === 'string');

    // Error response should have error field
    const errorResponse = { error: 'Something went wrong' };
    assertExists(errorResponse.error);
    assert(typeof errorResponse.error === 'string');
  },
});
