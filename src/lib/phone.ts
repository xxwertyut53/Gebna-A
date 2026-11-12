// Normalize phone numbers to the last 10 digits so login matching is tolerant
// of formatting differences (e.g. "05510669847", "+90 551 066 9847", "905510669847").
export function normalizePhone(input: string): string {
  const digits = (input || "").replace(/\D/g, "");
  return digits.slice(-10) || digits;
}

// Keeps obviously fake phone numbers out at sign-up: real numbers carry an
// international country code, so 10-15 digits that are not all the same digit.
export function isValidPhone(input: string): boolean {
  const digits = (input || "").replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}
