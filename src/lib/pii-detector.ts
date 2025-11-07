// Detekcja potencjalnych danych osobowych
export const detectPII = (text: string): { detected: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  // PESEL (11 cyfr)
  if (/\b\d{11}\b/.test(text)) {
    reasons.push('PESEL (11 cyfr)');
  }

  // NIP (10 cyfr lub format XXX-XXX-XX-XX)
  if (/\b\d{10}\b/.test(text) || /\b\d{3}-\d{3}-\d{2}-\d{2}\b/.test(text) || /\b\d{3}-\d{2}-\d{2}-\d{3}\b/.test(text)) {
    reasons.push('NIP');
  }

  // Email
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    reasons.push('Adres email');
  }

  // Telefon (9 cyfr lub format z +48)
  if (/\b\d{9}\b/.test(text) || /\+48\s*\d{9}/.test(text)) {
    reasons.push('Numer telefonu');
  }

  // Kod pocztowy XX-XXX
  if (/\b\d{2}-\d{3}\b/.test(text)) {
    reasons.push('Kod pocztowy');
  }

  // Potencjalne pełne imię i nazwisko (dwa słowa z wielkiej litery obok siebie)
  if (/\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\b/.test(text)) {
    reasons.push('Potencjalne imię i nazwisko');
  }

  return {
    detected: reasons.length > 0,
    reasons
  };
};
