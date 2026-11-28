# [OIL-LATER-PASSES-ON] — the code read by a fresh, blind Opus (28 Nov 26)

Brief: `2026-11-28-oil-later-code-read-brief.md`, read at b8bb56652 (the fix df152815e landed while it read; seen only by
`git log` and its diff). Its hand-back, condensed by the host. Proof: `raptor-port/.tmp/opus-read/proof.test.tsx` (not
committed).

**Finding 1 — a taken-off request's OIL answer clears the names (CONFIRMED on b8bb56652; FIXED by df152815e).** A
Training taken off the programme carrying a Yes; two boxes signed; the answer changes — one real door: its hours
shortened in its own window, whose save drops a Yes the new hours no longer price (`inputedit.tsx saveInputEdit` →
`oil.ts voidedOil`), the request still taken off. Both names go blank; on a published day "No changes to publish".
Breaks D103 (only a change that shows) and D2869's scope. Cause: `oilAnsKept` kept every input; `oilAnsBoundOk` failed
on it. Fix: `keyedInputs(ev)` — what df152815e did. Severity low–medium (a needless re-sign; no wrong OIL). Its two
direct-write tests failed on b8bb56652 and pass on the fix; its window-save test was run on the fix only.

**Nothing else found.** Checked: every answer door writes the input's `oil`; one sign-off writer (Shell → signPick →
writeSign → setSign); nothing in the answer reaches the digest, the filing key, the input details axis, ALL / ALL AVAIL
or the warnings axis, so re-reading only the `oil:` entry is complete; kept answers survive Undo / Redo, a plan switch,
the command layer, a week save and load; publishing clears the four (`signClear`); each kind of answer change; the Logic
check; the two-day input; the foot's words; `holdIsLast` counts what the boxes draw; no reference to the removed Later
memory left.

**The builder's readings:** (a) SUPPORTED — D2869 clears only names "signed over" an answer; names given while it was
open were signed over none (could be confirmed with him in one line); (b), (c), (d) SUPPORTED.

**Tidiness (filed):** the open-at-signing test written twice in `oilAnsAtSign`, `hasOwnProperty.call` three times; the
foot's "would the name be written" test sits in the JSX, not in `footSaid`; `pdBoundOk` terse; `holdSave`'s doc comment
breaks mid-sentence; `holdIsLast` / `holdCanSign` rebuild the binding on each draw of the open list (minor).
