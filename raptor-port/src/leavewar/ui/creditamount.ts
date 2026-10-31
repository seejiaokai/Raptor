/* THE CREDIT FORM'S AMOUNT, READ — moved out of CreditForm.tsx so that file exports only its components (React's quick
   reload keeps a component's state only in a file of components) */

/**
 * The typed days, signed: `2` and `+2` add, `-2` (or `−2`) subtracts (owner,
 * 6 Sep 26 — "if I put 2 or +2 it means the same thing, only minus is −2").
 * With no sign typed the `sign` chip decides — a phone's decimal keypad has no
 * minus key, so the chip is the phone's way to a correction. Null for anything
 * that is not a plain number; the STORE rules the rest (non-zero, halves) so
 * this form, the tracker and any future caller cannot disagree with it.
 */
export function parseAmount(raw: string, sign: 1 | -1 = 1): number | null {
  const t = raw.trim().replace(/^−/, '-')
  if (!/^[+-]?\d*\.?\d+$/.test(t)) return null
  const n = Number(t)
  return /^[+-]/.test(t) ? n : n * sign
}
