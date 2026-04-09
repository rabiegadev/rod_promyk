import crypto from "node:crypto";

const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SIMPLE_WORDS = [
  "ogrod",
  "promyk",
  "kwiat",
  "drzewo",
  "dzialka",
  "lato",
  "wiosna",
  "ziemia",
];

export function generatePassword(length = 14): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

/**
 * Proste hasło startowe do wydruku/listy (celowo łatwiejsze),
 * wymaga zmiany po pierwszym logowaniu.
 */
export function generateSimplePassword(): string {
  const word = SIMPLE_WORDS[crypto.randomInt(0, SIMPLE_WORDS.length)];
  const num = crypto.randomInt(10, 99);
  return `${word}${num}`;
}
