/* THE NAME KEPT ACROSS THE SIGN-OUT'S OWED RELOAD (batch 1's second half §8 — step G; his D2322, picture f6a). On a
   shared computer the next person typed his sign-in while the last person's change was still saving (ui/Login.tsx holds
   it). Once that change lands the page reloads (ui/logout.ts — the reload that gives him a fresh Tracker), and the page
   after it shows his typed name, the password empty, "Saved. Press Sign in again." The name rides the reload in this tab
   only (sessionStorage), as Retry's page note does (ui/pagedownload.ts noteReopen / takeReopen): written just before the
   reload, read by the sign-in card, thrown away at its press of Sign in. NEVER THE PASSWORD — only the name and the time. */
export const KEPT_NAME_KEY = 'talon:signin-name'
/* a note older than this is not used (the reload is at once; ten minutes, as Retry's note, covers a slow one) */
export const KEPT_NAME_MAX_AGE_MS = 10 * 60_000
/* set when THIS page wrote the note — its reload never happened (a test, or a reload held back), so it is not for the
   card on this page; only the fresh page after a real reload, which starts with this false, may use it */
let wroteHere = false
export function noteKeptName(name: string): void {
  if (!name) return
  wroteHere = true
  try { sessionStorage.setItem(KEPT_NAME_KEY, JSON.stringify({ name, at: Date.now() })) } catch { /* storage refused: the card comes back empty */ }
}
/** the name kept for the card on the page after the reload, within ten minutes — read, NOT thrown away: a render may read
 *  it twice (React's StrictMode), so the card throws it away at the press of Sign in (dropKeptName) */
export function peekKeptName(): string | null {
  if (wroteHere) return null
  try {
    const raw = sessionStorage.getItem(KEPT_NAME_KEY)
    if (!raw) return null
    const n = JSON.parse(raw) as { name?: unknown; at?: unknown }
    if (!n || typeof n.name !== 'string' || !n.name || typeof n.at !== 'number') return null
    const age = Date.now() - n.at
    return age >= 0 && age < KEPT_NAME_MAX_AGE_MS ? n.name : null
  } catch { return null }
}
/** thrown away — at the press of Sign in: the card after a later sign-out on this page never shows it again */
export function dropKeptName(): void {
  wroteHere = false
  try { sessionStorage.removeItem(KEPT_NAME_KEY) } catch { /* storage refused: nothing was kept */ }
}
