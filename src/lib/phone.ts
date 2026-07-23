// Normalize phone numbers to the last 10 digits so login matching is tolerant
// of formatting differences (e.g. "05510669847", "+90 551 066 9847", "905510669847").
export function normalizePhone(input: string): string {
  const digits = (input || "").replace(/\D/g, "");
  return digits.slice(-10) || digits;
}
