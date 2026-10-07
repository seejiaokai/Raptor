// AN EVENT'S SHORT FORM — the one to three letters or digits a day cell prints for it (the build plan
// docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.12; owner D643, D644, D645).
//
// Measured on a phone before this: "No Leave" took its day from about 20 px to 33 px and "Off day" to 29 px, each
// making the Event row two lines tall; "PH", "OFF" and "NL" stay at 20 px on one line. So the grid prints a short
// form, and the full name is one tap away.
//
// ONE rule, here, for every short form there is — an event's own, a merged band's, a preset's and one derived from a
// name: capitals FIRST, then one to three of A–Z and 0–9. Every write and every read goes through `normShort`, so a
// value that breaks the rule can be neither saved (refused, with `SHORT_RULE`) nor shown (ignored at the read — the
// next answer shows instead). Capitals come first because a letter can GROW when capitalised (the German sharp s is
// one character and two in capitals): counting first would let four characters through.
//
// No imports, on purpose: period.ts (which writes a day's event) and eventdefs.ts (which holds the presets) both read
// it, and those two already lean on each other.

/** the sentence a refused short form is told with */
export const SHORT_RULE = 'The short form is one to three letters or digits, with no space.'

/** The short form as it is stored and printed, or null where it is not one. A space typed before or after is forgiven
 *  (nobody can see it in a box); one inside, or any other mark, is not. */
export function normShort(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const up = v.trim().toUpperCase()
  return /^[A-Z0-9]{1,3}$/.test(up) ? up : null
}

/** A short form made from a name, or null where the name holds no letter or digit at all: the initials of its words
 *  where it has two or more (up to three — "National Day" → ND), else its first three ("Exercise" → EXE). Only letters
 *  and digits count: a mark between two words parts them ("Stand-down" → SD), an apostrophe does not ("New Year's
 *  Day" → NYD), and an accented letter reads as its plain one. Whatever it returns passes `normShort`. */
export function derivedShort(name: unknown): string | null {
  if (typeof name !== 'string') return null
  const words = name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // an accent leaves its plain letter behind
    .replace(/['’‘`]/g, '')           // an apostrophe is inside a word, not between two
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean)
  if (!words.length) return null
  const out = words.length >= 2 ? words.slice(0, 3).map(w => w[0]).join('') : words[0]!.slice(0, 3)
  return normShort(out)
}
