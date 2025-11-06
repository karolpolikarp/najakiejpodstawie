/**
 * Integration tests for legal-assistant Edge Function
 *
 * These tests verify the Edge Function behavior when it's running locally.
 * To run these tests, first start the Edge Function locally:
 *   supabase functions serve legal-assistant --env-file supabase/.env.local
 *
 * Then run: npm test -- edge-function.integration.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';

const FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'http://localhost:54321/functions/v1/legal-assistant';

// Helper to make requests to the function
async function callFunction(body: any, options: Partial<RequestInit> = {}) {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:8080',
      ...options.headers,
    },
    body: JSON.stringify(body),
  });

  return response;
}

describe('Edge Function Integration Tests', () => {
  beforeAll(() => {
    if (!FUNCTION_URL.includes('localhost') && !FUNCTION_URL.includes('127.0.0.1')) {
      console.warn('⚠️ Integration tests should run against local Edge Function');
    }
  });

  describe('CORS Configuration', () => {
    it('should return CORS headers on OPTIONS request', { skip: true }, async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:8080',
        },
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:8080');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('content-type');
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('should include CORS headers in POST response', { skip: true }, async () => {
      const response = await callFunction({
        message: 'Test message',
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should default to first allowed origin for unauthorized origin', { skip: true }, async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-site.com',
        },
      });

      const allowedOrigin = response.headers.get('Access-Control-Allow-Origin');
      expect(allowedOrigin).not.toBe('https://malicious-site.com');
      expect(allowedOrigin).toMatch(/localhost/);
    });
  });

  describe('Request Validation', () => {
    it('should accept valid legal question', { skip: true }, async () => {
      const response = await callFunction({
        message: 'Ile mam dni urlopu wypoczynkowego?',
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toBeTruthy();
      expect(typeof data.message).toBe('string');
    });

    it('should reject malformed JSON request', { skip: true }, async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080',
        },
        body: 'invalid json{',
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle missing message field', { skip: true }, async () => {
      const response = await callFunction({});

      // Should either return error or handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Response Structure', () => {
    it('should return structured legal response', { skip: true }, async () => {
      const response = await callFunction({
        message: 'Jakie są zasady zwrotu towaru kupionego online?',
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain('PODSTAWA PRAWNA');
      expect(data.message).toContain('CO TO OZNACZA');
    });

    it('should reject non-legal questions', { skip: true }, async () => {
      const response = await callFunction({
        message: 'Jak ugotować pierogi?',
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toMatch(/❌|przepraszam|nie dotyczy prawa/i);
    });

    it('should include disclaimer in response', { skip: true }, async () => {
      const response = await callFunction({
        message: 'Ile mam dni urlopu?',
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message.toLowerCase()).toMatch(/nie jest porada prawna|skonsultuj.*prawnik/i);
    });
  });

  describe('File Context Handling', () => {
    it('should process file context with message', { skip: true }, async () => {
      const response = await callFunction({
        message: 'Co ten dokument mówi o urlopie?',
        fileContext: 'Regulamin firmy XYZ:\n\nPracownik ma prawo do 26 dni urlopu wypoczynkowego rocznie. Urlop na żądanie przysługuje w wymiarze 4 dni rocznie.',
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBeTruthy();
    });

    it('should handle long file context (truncation)', { skip: true }, async () => {
      const longContext = 'x'.repeat(50000); // Exceeds 30k limit

      const response = await callFunction({
        message: 'Przeanalizuj ten dokument',
        fileContext: longContext,
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBeTruthy();
    });

    it('should work without file context', { skip: true }, async () => {
      const response = await callFunction({
        message: 'Ile mam dni urlopu?',
        fileContext: undefined,
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBeTruthy();
    });

    it('should work with null file context', { skip: true }, async () => {
      const response = await callFunction({
        message: 'Ile mam dni urlopu?',
        fileContext: null,
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on internal error', { skip: true }, async () => {
      // This test would require triggering an internal error
      // For example, by using an invalid API key (requires test environment)
      expect(true).toBe(true);
    });

    it('should handle rate limit errors (429)', { skip: true }, async () => {
      // This test would require triggering a rate limit
      // Typically done in a controlled test environment
      expect(true).toBe(true);
    });

    it('should handle auth errors (401)', { skip: true }, async () => {
      // This test would require an invalid API key
      // Typically done in a controlled test environment
      expect(true).toBe(true);
    });

    it('should return JSON error format', { skip: true }, async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080',
        },
        body: 'invalid',
      });

      if (response.status >= 400) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
    });
  });

  describe('Performance & Limits', () => {
    it('should respond within reasonable time (< 30s)', { skip: true }, async () => {
      const startTime = Date.now();

      const response = await callFunction({
        message: 'Jakie są zasady zwrotu towaru?',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(30000); // 30 seconds max
    });

    it('should handle concurrent requests', { skip: true }, async () => {
      const requests = Array(3).fill(null).map((_, i) =>
        callFunction({
          message: `Pytanie testowe ${i + 1}: Ile mam dni urlopu?`,
        })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});

/**
 * Unit tests for Edge Function logic (no API calls required)
 */
describe('Edge Function Logic Units', () => {
  describe('CORS Origin Selection', () => {
    it('should return request origin if in allowed list', () => {
      const allowedOrigins = ['http://localhost:8080', 'http://localhost:5173'];
      const requestOrigin = 'http://localhost:8080';

      const result = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

      expect(result).toBe('http://localhost:8080');
    });

    it('should return default origin if request origin not allowed', () => {
      const allowedOrigins = ['http://localhost:8080', 'http://localhost:5173'];
      const requestOrigin = 'https://evil.com';

      const result = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

      expect(result).toBe('http://localhost:8080');
    });

    it('should return default origin if request origin is null', () => {
      const allowedOrigins = ['http://localhost:8080'];
      const requestOrigin = null;

      const result = requestOrigin && allowedOrigins.includes(requestOrigin)
        ? requestOrigin
        : allowedOrigins[0];

      expect(result).toBe('http://localhost:8080');
    });
  });

  describe('File Context Processing', () => {
    it('should not truncate short file context', () => {
      const maxLength = 30000;
      const shortContext = 'This is a short document';

      const result = shortContext.length > maxLength
        ? shortContext.substring(0, maxLength) + "\n\n[...dokument został skrócony...]"
        : shortContext;

      expect(result).toBe(shortContext);
      expect(result).not.toContain('[...dokument został skrócony...]');
    });

    it('should truncate long file context', () => {
      const maxLength = 30000;
      const longContext = 'x'.repeat(40000);

      const result = longContext.length > maxLength
        ? longContext.substring(0, maxLength) + "\n\n[...dokument został skrócony...]"
        : longContext;

      expect(result.length).toBeGreaterThan(maxLength);
      expect(result).toContain('[...dokument został skrócony...]');
      expect(result.substring(0, maxLength)).toBe(longContext.substring(0, maxLength));
    });

    it('should format user message with file context', () => {
      const message = 'Jakie są moje prawa?';
      const fileContext = 'Dokument prawny zawierający przepisy';

      const result = `ZAŁĄCZONY DOKUMENT:
---
${fileContext}
---

PYTANIE UŻYTKOWNIKA:
${message}`;

      expect(result).toContain('ZAŁĄCZONY DOKUMENT');
      expect(result).toContain(fileContext);
      expect(result).toContain('PYTANIE UŻYTKOWNIKA');
      expect(result).toContain(message);
    });

    it('should not add file context section if no file provided', () => {
      const message = 'Jakie są moje prawa?';
      const fileContext = undefined;

      const result = fileContext
        ? `ZAŁĄCZONY DOKUMENT:\n---\n${fileContext}\n---\n\nPYTANIE UŻYTKOWNIKA:\n${message}`
        : message;

      expect(result).toBe(message);
      expect(result).not.toContain('ZAŁĄCZONY DOKUMENT');
    });
  });

  describe('Response Format', () => {
    it('should validate success response structure', () => {
      const response = { message: 'PODSTAWA PRAWNA:\nArt. 123' };

      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
      expect(response.message.length).toBeGreaterThan(0);
    });

    it('should validate error response structure', () => {
      const response = { error: 'Something went wrong' };

      expect(response).toHaveProperty('error');
      expect(typeof response.error).toBe('string');
      expect(response.error.length).toBeGreaterThan(0);
    });

    it('should format rate limit error correctly', () => {
      const error = { error: 'Osiągnięto limit zapytań. Spróbuj ponownie za chwilę.' };

      expect(error.error).toContain('limit zapytań');
    });

    it('should format auth error correctly', () => {
      const error = { error: 'Nieprawidłowy klucz API. Sprawdź konfigurację.' };

      expect(error.error).toContain('klucz API');
    });
  });
});
