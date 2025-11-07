import { describe, it, expect } from 'vitest';
import { detectPII } from './pii-detector';

describe('detectPII', () => {
  describe('PESEL detection', () => {
    it('should detect 11-digit PESEL', () => {
      const result = detectPII('Mój PESEL to 12345678901');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('PESEL (11 cyfr)');
    });

    it('should not detect numbers with fewer than 11 digits', () => {
      const result = detectPII('Mój numer to 1234567890');
      expect(result.reasons).not.toContain('PESEL (11 cyfr)');
    });

    it('should not detect numbers with more than 11 digits', () => {
      const result = detectPII('Mój numer to 123456789012');
      expect(result.reasons).not.toContain('PESEL (11 cyfr)');
    });
  });

  describe('NIP detection', () => {
    it('should detect 10-digit NIP', () => {
      const result = detectPII('NIP firmy: 1234567890');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('NIP');
    });

    it('should detect formatted NIP (XXX-XXX-XX-XX)', () => {
      const result = detectPII('NIP: 123-456-78-90');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('NIP');
    });

    it('should detect formatted NIP (XXX-XX-XX-XXX)', () => {
      const result = detectPII('NIP: 123-45-67-890');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('NIP');
    });
  });

  describe('Email detection', () => {
    it('should detect email addresses', () => {
      const result = detectPII('Mój email to jan.kowalski@example.com');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('Adres email');
    });

    it('should detect emails with various formats', () => {
      const emails = [
        'test@gmail.com',
        'user.name+tag@example.co.uk',
        'test_email@subdomain.example.com',
      ];

      emails.forEach(email => {
        const result = detectPII(`Email: ${email}`);
        expect(result.reasons).toContain('Adres email');
      });
    });

    it('should not detect incomplete email patterns', () => {
      const result = detectPII('Napisz do mnie na stronie example.com');
      expect(result.reasons).not.toContain('Adres email');
    });
  });

  describe('Phone number detection', () => {
    it('should detect 9-digit phone number', () => {
      const result = detectPII('Telefon: 123456789');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('Numer telefonu');
    });

    it('should detect phone with +48 prefix', () => {
      const result = detectPII('Zadzwoń: +48 123456789');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('Numer telefonu');
    });

    it('should detect phone with +48 without space', () => {
      const result = detectPII('Numer: +48123456789');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('Numer telefonu');
    });
  });

  describe('Postal code detection', () => {
    it('should detect Polish postal code format', () => {
      const result = detectPII('Adres: 00-950 Warszawa');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('Kod pocztowy');
    });

    it('should detect postal code in various contexts', () => {
      const result = detectPII('Kod: 12-345');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('Kod pocztowy');
    });
  });

  describe('Name detection', () => {
    it('should detect Polish first and last name', () => {
      const result = detectPII('Nazywam się Jan Kowalski');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('Potencjalne imię i nazwisko');
    });

    it('should detect common Polish names', () => {
      const result = detectPII('Anna Nowak pracuje tutaj');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('Potencjalne imię i nazwisko');
    });

    it('should not detect single capitalized word', () => {
      const result = detectPII('Warszawa jest stolicą Polski');
      expect(result.reasons).not.toContain('Potencjalne imię i nazwisko');
    });
  });

  describe('Multiple PII types', () => {
    it('should detect multiple PII types in one text', () => {
      const result = detectPII('Jan Kowalski, PESEL 12345678901, email: jan@example.com, tel: 123456789');
      expect(result.detected).toBe(true);
      expect(result.reasons).toContain('Potencjalne imię i nazwisko');
      expect(result.reasons).toContain('PESEL (11 cyfr)');
      expect(result.reasons).toContain('Adres email');
      expect(result.reasons).toContain('Numer telefonu');
    });
  });

  describe('Safe text', () => {
    it('should not detect PII in general questions', () => {
      const safeTexts = [
        'Czy pracodawca może odmówić urlopu?',
        'Jakie są zasady wypowiedzenia umowy?',
        'Ile wynosi minimalne wynagrodzenie?',
        'Co to jest kodeks pracy?',
      ];

      safeTexts.forEach(text => {
        const result = detectPII(text);
        expect(result.detected).toBe(false);
        expect(result.reasons).toHaveLength(0);
      });
    });
  });
});
