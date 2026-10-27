# M4 fixes, round 3 and 3b — the fresh, blind Opus read (28 Oct 26)

Read at 093062f9e in the read-only copy `C:/m4h` (`git diff f3242bba6 093062f9e -- raptor-port/src raptor-port/e2e`: round 3,
089e9a0d2, and round 3b, 99244361d), against the round-2 read (`fix-read-2.md`, findings 1–5 and its question), the walk
`rewalk3.md` (G3's one FAIL), the builder's "Round 3" and "Round 3b" sections of `fixes-night.md`, and D1436's full row.
Nothing built, no browser run. **No unit test was run: the read-only copy has no `node_modules`.** Every finding is traced
through the code named. The last round the order allows: each finding says whether it would harm a person's leave or
records, is a visible fault, or is tidiness.

## Findings

### 1. MEDIUM — leave or records — R3-6 also refuses the leave of a man posted out with the "Delete" outcome, on days he was still here, once his posting has run (against D1436's reading)

**Steps.** Admin. Ranger has a pending LL bid on Mon 2 Feb. Post him out from Thu 5 Feb with the outcome "Delete" (leaving
flying for good). Before 5 Feb: Approvals → Approve on his 2 Feb line approves (D1436's one date rule: no day from his
posting date). Leave it undecided until the posting runs on 5 Feb, then press Approve.
**What he meets.** "Posted out — refuse or delete it"; the line stays pending, and so in the bid windows and the day's list.
Leave on a day Ranger served can now only be refused or deleted — never recorded as approved leave. The same bid under an
"overseas" or "none" posting still approves after the run. D1436's row (the host's reading): "a request with no such day
approves as ever"; it does not except a Delete posting.
**Cause.** `sync.ts approveWhy`: `if (postedOutBy(it.personId) === 'gone') return 'Posted out — …'`. `gone` is set by
`store.ts forgetPersonFrom`, which runs for an Admin → Users delete AND for a posting whose outcome is `delete` when it runs
(`sync.ts` the outcomes pass: `applyDelete(…); forgetPersonFrom(d.id, deleteCutoff(d.poDate))`, then `markPostingDone`).
Its cutoff removes every bid from the posting date on, so every leftover is a day before it — exactly the days D1436 says
approve. The host's decision was framed as "a DELETED man" with D1436 "speaking only of posting out"; a Delete posting IS a
posting out.
**Fix (or his word).** Either put the Delete-outcome case to him beside the open question, or confine R3-6 to a man deleted on
Admin → Users and let a run Delete posting fall to the one date rule:
```ts
const w: any = getState().postOuts[it.personId] || getState().people.find(p => p.id === it.personId)
if (postedOutBy(it.personId) === 'gone' && !(outcomeOf(w) === 'delete' && w?.poDone)) return 'Posted out — refuse or delete it'
```
(`poOutcome` and `poDone` ride the kept record: `cut(dated(p))` spreads `windowFor`, and `markPostingDone` writes `poDone`.)
Test (`m4decide.test.ts`, beside R3-6): post bane out from 4 Feb with outcome `delete`, a pending bid on 2 Feb, run the
outcomes pass → `decideRequests` approves 2 Feb; the R3-6 test (an Admin → Users delete) still refused.

### 2. LOW — leave or records (rare) — a deleted man the war keeps no row for is not caught by R3-6

**Steps.** Admin. An incoming man, Hex, posts in from 1 Mar. Tap one of his days before 1 Mar that is already past (the
admin may), "Place leave or OIL here instead…", LL — a pending bid. Delete Hex on Admin → Users before 1 Mar. Approvals →
Approve on his line.
**What he meets.** It approves: an Input of leave is written for a man deleted from the squadron, on a day he was never in it.
**Cause.** `forgetPersonFrom` keeps his war records dated before the cutoff, but `cut()` returns null for a man "who never
arrived" (his only stint still to come), so his row and his record go — no `gone` anywhere. `approveWhy`'s check reads
`postedOutBy`, which finds no record and returns null; `postingOutWhy` likewise. (The same before M4 — not a round-3
regression, but R3-6 says "in every door".)
**Fix.** Read the roster's own deleted mark, which the sync keeps on the body (`PEOPLE[id].deleted`, as the re-projection
reads it): `if (postedOutBy(it.personId) === 'gone' || (PEOPLE as any)[it.personId]?.deleted) return 'Posted out — refuse or delete it'`
(combined with finding 1's exception if he rules that way). Not "no row and no record" — a SANS man with Show SANS off has no
row either, and his leave approves. Test: a man with only a stint to come, a pending bid before it, deleted → refused.

### 3. LOW — visible — round 3b's "kept pending" note can come back on the day's list after it was answered

**Steps.** Admin, Slipway posted out from 15 Jun. Tap 16 Jun, "Place leave or OIL here instead…", tick "Approve what I enter",
LL → the day's list opens with "Tue 16 Jun kept pending — He posts out on 15 Jun: refuse or delete it." (as built). Now Undo in
the top bar (the bid goes; the list gives way to the bid window, the same cell still open), untick "Approve what I enter",
press OL.
**What he meets.** The day's list opens again with the OLD note — "kept pending — He posts out…" — though this time he asked
for no approval. The same after Delete on the list (which clears the note) and placing again: it reappears. A second route:
"Approve what I enter" on a locked-week day the man is in the squadron keeps the bid pending with the window staying (its own
note shows), and anything later on that open cell that turns it into a list day shows that earlier note.
**Cause.** `Matrix.tsx keptNote` is cleared only when the open cell changes (`useEffect(…, [openKey])`); every later mount of
the day's list on the same cell (`DayListSheet` is keyed by the cell and remounts each time `listOpen` turns true) takes it
again as its first message (`useState(note ?? '')`).
**Fix.** Hand it over once: after the commit that set it, drop it — the list that mounted in that same commit has already
copied it into its own state: `useEffect(() => { if (keptNote) setKeptNote(null) }, [keptNote])` (the e2e "…the reason it
stays pending is on screen (R3b)" guards that the list still gets it). Test: after the R3b steps, Undo, tick off, OL → no
`daylist-msg` with "kept pending".

### 4. LOW — words — a comment still says a deleted man's days before the date approve

**Where.** `sync.ts`, the comment over `postingOutWhy`: "…once the posting has run (or he was deleted) his days from the date
are refused as before it, the words in the past tense, and his days before it approve." Since R3-6 a deleted man is refused
whole, before `postingOutWhy` is asked.
**Consequence.** The next chat reading it will take R3-6's line for a slip and remove it.
**Fix.** "(…) — a man DELETED is refused whole by `approveWhy`'s own check above (R3-6, pending his word)."

### Not a finding (tidiness, noted)

Over several men the drag window now names each man before each reason, one per man AND per reason text — a drag over two men
across three locked days prints six reasons where round 2 printed three, in the door's order (men may alternate). True and
readable; shorten only if he finds it long.

## The press-swallowing code (R3-1, R3-2), asked hardest

Traced for each case asked, by touch and by mouse:
- **Empty card beside or under the calendar** (touch): the press resolves to no control (`a0` null); the click, wherever the
  list moved it, resolves to a line's button → taken. Landing on a line's plain text resolves to no control too and is let
  through, but nothing in a line acts on a click except its buttons (puck, box and figures have no handler; the grid's
  document listener only reads grid cells, hidden under Approvals) — so nothing happens. By mouse the click goes to the card,
  a no-op.
- **Icon pressed, button's edge lifted:** both resolve to the button through `closest` (an SVG icon too) → acts once.
- **Held press:** armed at this press's own lift, as round 2; unchanged.
- **Something that moved:** measured on the control itself; a line's Approve moves → taken. A mouse press on it lifted over
  another line's button gives the click to their common ancestor → no control ≠ the pressed button → taken.
- **Keyboard:** no pointer, nothing armed, Escape unchanged; only an Enter within half a second of a tap elsewhere is taken —
  negligible.
- **Scroll beginning on a line:** `pointercancel` ends it, no click. (The calendar still closes at the start of the scroll,
  as since round 1 — harmless.)
- Right or middle button: no `click` follows; the next press or the half-second ends it.

## Each round-3 fix

- **R3-1** — right and complete (the band under and the strip beside the calendar, by touch and by mouse; jsdom and phone
  tests red-first).
- **R3-2** — right and complete.
- **R3-3** — right and complete: a Refuse or a send-back only ever meets `decideApprovedWhy`'s reasons, an Approve only
  `approveWhy`'s, so the word follows `bid` exactly.
- **R3-4** — right and complete: every reason the doors give carries its man (`whyOf`), both writers return `whyBy`, both
  windows join with ". ", and name the man only over more than one; the counts unchanged. (Length over many men: the note
  above.)
- **R3-5** — right for the two comments it touched; one more stale comment in `sync.ts` (finding 4).
- **R3-6** — right for a man deleted on Admin → Users whose row is kept (Approvals, Approve all, the day's list, both bid
  windows, "Approve what I enter" — all through `approveWhy`; Refuse untouched). Wider than meant for a run "Delete" posting
  (finding 1, his word needed), and misses a deleted man the war keeps no row for (finding 2).
- **R3b (G3)** — right: the note reaches the day's list that takes the window's place, on that cell only, and goes when
  another cell (or none) is open or the list's next action speaks. Not complete: it can come back on a later list of the same
  open cell (finding 3).
