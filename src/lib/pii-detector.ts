/**
 * Detekcja potencjalnych danych osobowych (PII)
 * Improved version with legal entity whitelist to reduce false positives
 */

// Whitelist of legal entities that should NOT be flagged as names
const LEGAL_ENTITIES = [
  // Sądy
  'Sąd', 'Trybunał', 'Izba',
  // Kodexy i ustawy
  'Kodeks', 'Ustawa', 'Prawo', 'Ordynacja', 'Rozporządzenie',
  // Instytucje
  'Urząd', 'Ministerstwo', 'Sejm', 'Senat', 'Parlament', 'Komisja',
  'Inspekcja', 'Straż', 'Policja', 'Prokuratura', 'Rzecznik',
  // Rodzaje aktów
  'Cywilny', 'Karny', 'Pracy', 'Handlowy', 'Administracyjny',
  'Postępowania', 'Wykonawczy', 'Skarbowy',
  // Inne
  'Rzeczpospolita', 'Polska', 'Unia', 'Europejska',
];

/**
 * Check if a capitalized pair is a legal entity
 */
const isLegalEntity = (word1: string, word2: string): boolean => {
  return (
    LEGAL_ENTITIES.some(entity => entity === word1 || entity === word2) ||
    // Common patterns
    word1 === 'Sąd' ||
    word1 === 'Kodeks' ||
    word2 === 'Cywilny' ||
    word2 === 'Karny' ||
    word2 === 'Pracy'
  );
};

/**
 * Check if number sequence is likely an article reference (not phone/PESEL)
 */
const isLikelyArticleNumber = (text: string, numberMatch: string): boolean => {
  const before = text.substring(Math.max(0, text.indexOf(numberMatch) - 10), text.indexOf(numberMatch));
  return (
    before.toLowerCase().includes('art') ||
    before.toLowerCase().includes('§') ||
    before.toLowerCase().includes('ust')
  );
};

export const detectPII = (text: string): { detected: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  // PESEL (11 cyfr) - only if not part of article reference
  const peselMatches = text.match(/\b\d{11}\b/g);
  if (peselMatches) {
    const hasPesel = peselMatches.some(match => !isLikelyArticleNumber(text, match));
    if (hasPesel) {
      reasons.push('PESEL (11 cyfr)');
    }
  }

  // NIP (10 cyfr lub format XXX-XXX-XX-XX)
  if (/\b\d{10}\b/.test(text) || /\b\d{3}-\d{3}-\d{2}-\d{2}\b/.test(text) || /\b\d{3}-\d{2}-\d{2}-\d{3}\b/.test(text)) {
    reasons.push('NIP');
  }

  // Email
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    reasons.push('Adres email');
  }

  // Telefon (9 cyfr lub format z +48) - only if not part of article reference
  const phonePattern = /\b\d{9}\b/g;
  const phoneMatches = text.match(phonePattern);
  if (phoneMatches) {
    const hasPhone = phoneMatches.some(match => !isLikelyArticleNumber(text, match));
    if (hasPhone || /\+48\s*\d{9}/.test(text)) {
      reasons.push('Numer telefonu');
    }
  }

  // Kod pocztowy XX-XXX
  if (/\b\d{2}-\d{3}\b/.test(text)) {
    reasons.push('Kod pocztowy');
  }

  // Potencjalne pełne imię i nazwisko (dwa słowa z wielkiej litery obok siebie)
  // BUT exclude legal entities
  const capitalizedPairs = text.matchAll(/\b([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)\s+([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)\b/g);
  let hasRealName = false;

  for (const match of capitalizedPairs) {
    const word1 = match[1];
    const word2 = match[2];

    // Skip if it's a legal entity
    if (!isLegalEntity(word1, word2)) {
      hasRealName = true;
      break;
    }
  }

  if (hasRealName) {
    reasons.push('Potencjalne imię i nazwisko');
  }

  return {
    detected: reasons.length > 0,
    reasons
  };
};
