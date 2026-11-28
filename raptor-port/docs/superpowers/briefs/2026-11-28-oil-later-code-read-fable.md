# [OIL-LATER-PASSES-ON] — the code read by a fresh, blind Fable (28 Nov 26)

Brief: `2026-11-28-oil-later-code-read-brief.md`, at commit b8bb56652. Its hand-back, condensed by the host (findings,
steps, causes and fixes kept). Its proofs: `raptor-port/.tmp/fable-read/` (not committed).

**What held (probed):** a published day's ALL AVAIL input open at signing, answered — names stand; a published Yes
cleared after issue, then answered again — names stand; the binding through a JSON save and load keeps `oa` (bindings
are carried whole: history, store, drafts, overlay, holder base); a Logic value changed after signing on a published
day, then the open question answered — names stand; the input details, filing, digest and warnings axes carry no
answer; every answer door writes the input's `oil`; Save then Undo twice — name first, then the answer, the three Later
names standing; the foot words match D2859 / D2867 in all five cases.

**F1 — reading (a): an answer can be changed and published on names nobody gave over it (owner's call).** Published
Saturday, a Training filed on it; all four sign by Later; someone answers Yes at the input's window; anyone then
changes it to No; Publish → "Published AL1 … approved by …" with No. The same on a day not yet published. Cause:
`publish.ts oilAnsBoundOk` skips every input whose kept answer is null for ever; `pendingKeyAtSign` reads it unanswered
for ever. The letter of D2869 supports (a); its stated reason ("nobody can change OIL after the signers saw it") is not
met for an approver who answered after signing. Fix if he rules against (a): the first answer to an open question leaves
the names; a further change needs a re-sign — the first answer recorded against the binding at the answer's own
command, and compared from then on. Proof P12.

**F2 — a taken-off request's answer, changed, cleared the names though nothing the day counts moved (low).** Cause:
`oilev.ts oilAnsKept` kept every projected input, while the key and the comparison skip a request taken off
(`keyedInputs`). Fix: build `oa` from `keyedInputs`. Proof P1. **Host: FIXED red-first** (test "the answer of a request
taken off the programme, changed after signing, leaves the names").

**F3 — the list emptied behind a held name signs nothing and says nothing (low; older than this job, more common since
D2800).** CUR CK pressed, the list opens holding the name; the input answered at its own window from the list's card →
"Nothing left to answer.", only Close, the held box gone; Close leaves CUR CK unsigned, without a word. Cause:
`OilDayList.tsx Body` — `held` needs rows, and the foot offers only Close when no row is left. Fix: write the held name
on Close, or keep the held box with a Sign button — a new thing he would see, so drawn first (D1625). Proof P9.
**Host: filed for him**, `[OIL-LIST-EMPTIED-HOLD]`.

**F4 — repaint cost (filed, not a fault).** `pendingKeyAtSign` built the day's evidence even when no question was open
at signing — **host: FIXED** (returns at once when none was open); where a read-back is live it runs the whole OIL
comparison including the Logic half, then filters it away (filed); `holdIsLast` / `holdCanSign` run outside a read pass
on each draw of the open list (acceptable).

**Looked for and not found:** a published-day path where the signature's copy of the comparison disagrees with the
count; a plan switch, week stash, Undo or reload losing the kept answers; a reader of the binding not routed through
`signBoundOk`; an answer that moves the crowd, the standing or eligibility.

**The builder's readings:** (a) the owner's to decide (F1); (b) supported; (c) supported; (d) supported.

**Tidiness (filed, not fixed):** the open-at-signing test written twice in `oilAnsAtSign`; `pendingKeyAtSignNow`
re-derives the issued snapshot `dayDeltaIn` already found; four near-alike names (`pdBoundOk`, `oilBoundOk`,
`oilAnsBoundOk`, `oilRvBoundOk`) and `schema.ts SignBinding` lists neither `orv` nor `oa`; `signBoundOk`'s one-line
return carries ten conditions; the comments above `currentBindNow` and `oilSignKey` tell the same story three times.
