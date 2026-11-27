# [MSQ-PICK-GUARD] Step K10, part F's root, under his D2834: the plan (chat A211, 28 Nov 26)

**Section 1 (the guard rail). A plan only.** Written by a fresh Opus planner from
`../briefs/2026-11-28-msq-s1-k10root-plan-brief.md` on branch `a211-s1` (`66930e644`). No source file was changed, nothing
run but reads and one `git apply --check`. **Astra and a fresh, blind Opus read this plan before anything is built**
(the coordinator's direction; D1760, D1770).

**How to read it.** Rulings by number. **"The planner's reading" (R-n) marks this planner's call, never his rule**
(lesson 32); every one is listed in §11. Code read on this branch by `grep`/`sed`; line numbers are a guide. Where this
plan and the build plan's §5 or the K10 brief differ, this plan wins for K10, and K10-e writes the pointer (D201).

---

## 0. What this plan decides, in one screen

1. **One new answer, `holderOf(r)`** in `state/inputsqn.ts`: the squadron that holds a ONE-MAN record now, **only where a
   move of his has carried it** (D2834) — else null. Carried means: (a) a medical downchit whose episode is still open
   today (down, or pending upchit), or one closed by an upchit given after his move; (b) any other one-man record that
   runs on into the squadron he has moved to (leave across the move, D2847). It reads the record and its man's homes —
   **nothing of who is signed in**.
2. **`inputSqn` gains that one clause, and only that one:** the page first where the record touches it by its days (as
   today), or where it has been carried there; else the carried squadron; else its first day's (as today). In practice
   it changes the answer for **one** state the app reaches: a moved man's open medical record, on his new squadron's
   page.
3. **The doors-and-root rule is restated, not dropped** (§2.4): doors ask `inputSqn` (and the bell door `holderOf`), which
   read nothing of the person looking; only the root asks `letOpenOn`.
4. **Finding 1 (the Medical tab)** closes in two halves: an open record on 149's tab is 149's (`inputSqn`), so it opens
   live there; a record closed before the move leaves 149's Upchit Complete and stays on 142's (D2846) — **the tab's
   Upchit Complete listing is K10's** (one filter), because the root cannot be switched on while a closed 142 record
   stands on 149's tab. The rest of the listings stay `[XFER]`'s.
5. **Finding 2 (a bell line)**: an input's line enters `holderOf(row) ?? inputSqn(row, n.u)` instead of `n.u` (D2835) —
   one line of `ui/topstate.ts openNotice`, **built only after U2 lands** (and after KR-4, §6).
6. **The patch applies as is** (checked: §4.1). Three additions in the window: a read-only let kept for the window's life,
   `pickUnit` follows a carried record, the comments. **`letOpenOn` narrowed** to K9's `aheadAt` (D2729 Q8's width) and
   **given one read-only case** for D2835's View-only presser, keeping today's look until his drawing.
7. **Who may write is not changed by K10.** `inputSqn` does not feed the save gate. D2847's "the new squadron's admins
   may" and D2834's "its admins close it" for changing the carried record itself are a gate change, `[XFER]`'s, with the
   security reader (D1411).
8. **One question for him** (§9): a man moving to 149 next week, viewed on 149's Medical tab "as of" a day after he
   joins. It holds only K10-d (the root switched on).
9. **Size: about 12.5 hours over four sub-steps**, K10-a buildable now; K10-c and K10-d after U2 and KR-4.

---

## 1. What "open" is, per kind of input (brief item 1)

"Carried" = goes with him at a move (D2834: "anything that's outstanding that is not closed will need to be transferred
with the person"). Every answer is about a record naming **one man alone** (`engine/inputs.ts onlyNamed`); a record of
several people is never carried by one man's move (row 7).

| # | Kind | Open (carried) | Closed (stays) | Source |
|---|---|---|---|---|
| 1 | **Medical downchit** (ATT C, ATT B, HL, OML … `isDownchit`) | its episode (`engine/medical.ts medEpisode`) is open today: a member covers today (`medDownAsOf`) or is his pending upchit (`pendingUpchits`) | closed by an upchit dated before his move (that upchit's own day decides) | **D2834, D2845, D2846** |
| 1b | …closed by an upchit given **after** the move (149 closed it) | stays where it was closed: the squadron of the upchit's own day (149) | — | **R1**: D2846 keeps "closed before the move" on the old tab; one closed after the move was carried while open and is closed in 149, so it is 149's history; a later move to 150 does not carry it again (closed things stay) |
| 1c | …episode ended with no upchit but replaced by a newer downchit (`pendingUpchits` rule (b)) | — | by its days, as today (null) | **R2**: neither open nor closed by an upchit; the newer downchit carries the nag. Normally the two are one episode (adjacent), and then the episode is open and both are carried |
| 2 | **Upchit** (`isUpchit`) | never — it is the closing record | always: the squadron of its own day | D2846 |
| 3 | **Leave** — across the move (a day before and a day on/after the move day) | carried, once the move has run | — | **D2847** |
| 3b | Leave wholly before the move | — | stays (old squadron's records) | **D2847** |
| 3c | Leave wholly after the move | already the new squadron's by its days (not "carried"; nothing changes) | — | D2847; today's `inputSquadrons` |
| 3d | Approved or pending | does not change which squadron holds it; which Leave War decides it is `[XFER]`'s (D2847: unapproved after the move → the new war; approved arrives approved) | | **R3** |
| 4 | **Duties, commitments, other dated inputs** — wholly before the move | — | stays: the work was done there, its OIL earned on 142's published day (OIL truth = the latest published version) | **R4**: D2834's "outstanding" read as the record, not a question about it; **its waiting OIL answer is answered by him where he is** — already D2621 and `letOpenOn` case 1, never carried |
| 4b | …running across the move (a multi-day commitment) | carried, like leave | — | **R5**: D2847 by analogy ("goes with him like everything else still open") |
| 5 | **SANS availability** | across the move: carried (as 4b) | wholly before: stays | **R6**: D2163 (his SANS availability records go with him) is design only; read by days, as row 4 |
| 6 | **A Tracker course** | — not an input; D2842 is `[XFER]`'s | | D2842 |
| 7 | **An input of several people** (of one or several squadrons), and a placeholder input (ALL AVAIL, its stamp) | **never carried** — stays by its days and the touches rule (F8: listed and live on each squadron it touches) | | **R7**: D2834 says "of his", one man's things; D2243 Q1 and D2265 keep a meeting naming a moved man on the squadron it was filed on |
| 8 | A man posted out other than by Transfer (Overseas, Delete, SANS as a workplace) | not carried (`homeOn` gives no other squadron) | | **R8**: D2834 is "when a man moves squadron" |

**The day "open" is judged on: today** — `state/units.ts todayIso()`, the day `pageUnit`, `myUnit`, `listReach` and the
gate's rights are read on (D2203). **Never the Medical tab's "as of" day** (`MedicalView` reads `keyToIso(TODAY)`, the
demo's notional today, which differs from the clock in the demo): the tab's as-of is what it shows, not who holds what
(§9 is the one case where the two meet).

---

## 2. The one answer (brief item 2)

### 2.1 `holderOf(r, today = todayIso()): string | null` — new, `state/inputsqn.ts`

Null for: no record, a new one, an unreadable date, a record of several people or none (`onlyNamed(r) == null`), a man
with no home today. Else, with `p = onlyNamed(r)`, `h = homeOn(p, today)`, `first = inputUnitOf(r)`:

- **medical downchit** (`isDownchit(r.type)`):
  - episode open today (row 1) → `h`, **if `h !== first`**, else null (not carried: he has not moved since it began);
  - else closed by an upchit (the earliest upchit of his dated on or after the episode's last end — `pendingUpchits`'
    own closer (c), read from `INPUTS` with `isUpchit`, never a second rule) → `homeOn(p, thatDay)` **if it differs
    from `first`**, else null;
  - else null (row 1c).
- **any other kind:** **`h`** where the record touches `h` by its days (`inputSquadrons(r).includes(h)`) **and** `h !==
  first` (the move into `h` has run and the record began before it — rows 3, 4b, 5); else null.

Built only from existing bodies (`pendingUpchits`, `medDownAsOf`, `medEpisode`, `inputSquadrons`, `inputUnitOf`,
`homeOn`, `onlyNamed`, `isDownchit`, `isUpchit`) — **no change in `src/engine/`**. The builder pins that its "open"
agrees with the Medical tab's own sections for every seeded man on every day of the demo fortnight (a loop test), so the
two can never disagree.

**Cost:** only medical rows reach the episode reads; `holderOf` runs at a press (the three doors) and once when the
window's note is taken — never per row of a list (`listReach` does not call it). Nothing in `docs/performance.md`'s
ceilings moves.

### 2.2 `inputSqn` after K10

```
inputSqn(r, pageSqn):
  new or none            → pageSqn                                  (as today)
  touches pageSqn        → pageSqn                                  (as today: by its days)
  carried = holderOf(r)
  carried === pageSqn    → pageSqn                                  (new: carried here)
  carried                → carried                                  (new)
  else                   → inputUnitOf(r) ?? pageSqn                (as today)
```

**What changes, and where only:** a moved man's open medical record on his new squadron's page → that page's (was the
old one's). Leave across the move: on either squadron's page as today (it touches both); on a third page → the new
squadron (was the old one — the first day's). Nothing else the app reaches today. **The old squadron's page keeps
answering its own for a carried record** (it touches it by its days), so every row of 142's List and every card of
142's Medical tab "as of" a day before the move still opens live — no window born held there (§10 risk 3).

### 2.3 Whose move, which day, and the hard cases

| Case | Answer |
|---|---|
| Whose move | the record's one man's (`onlyNamed`) — never the person signed in, never a filer |
| Which day | today (§1); the note takes it once, when the window opens (F12) |
| Moved twice (142 → 149 → 150), record still open | his squadron today: 150 (follows him each time) |
| Moved twice, record closed in 149 after the first move | 149 (row 1b: closed things stay) |
| A move set ahead, not yet run | not carried until its day (`h === first` today); on the move day it is |
| A group input | never carried (row 7) — stays by its days and the touches rule |
| An Undo that cancels a move before its date | the next press reads homes afresh; an open window keeps its note (F12) |

### 2.4 "The doors and the root never share an answer" — restated, with why (§16 finding 2; F0)

**Replaced:** "`inputSqn` has NO clause for who is named in the input, and never gains one."
**With:** "**A door asks `inputSqn`** — the record's own squadron: the page's where it touches the page, else where a
move of its one man has carried it (`holderOf`, D2834), else its first day's — **and the bell door asks `holderOf`;
neither reads anything of the person signed in or looking. Only the root asks `letOpenOn`**, the one function that reads
who is looking (`me()`)."

**Why the rule's purpose still holds:** finding 2 was that a door answering "live here, he is named" would skip
entering the right squadron, and the root would then disagree with the door. `holderOf` is a fact about the record and
its man's moves — the same answer for Saber (master admin), Kestrel (149's admin) and Nasty (the man) — so a door and the
root still cannot part over who is looking. **Fable 3b's danger** (the first-named man's squadron today carrying Hunter
to 149 for an input on his own page) stays excluded three ways: the page still comes first where the record touches it;
only one-man records are carried; and only when that man has moved and the record is still open. F0 is re-stated
in K10-a with a loop proving the viewer-blindness (§7).

---

## 3. The two findings closed (brief item 3)

### 3.1 Finding 1 — "Edit input" from the Medical tab

| State | Today | After K10 |
|---|---|---|
| Nasty's pending OML (6–9 Jul), Nasty moved 142 → 149 from Thu 16 Jul; **149's** tab | listed (roster on the as-of day); its window: today live, Saber's Save writing "142's" record under 149; root on: born held | listed (D2845, already so); **`inputSqn` → 149: live.** Saber (master admin) may change it — it is 149's now. Kestrel (149's admin): **read only** (`InputWindow.tsx foreign`, which mirrors the gate — §5), and **"Upchit" in the viewer works**: a new Upchit, dated today, is 149's by its day, and the gate passes her — so "149's admin closes it when the paper comes in" (D2845) holds without a permission change |
| Same, **142's** tab, as of today | not listed (he is not on 142's roster) — already D2845 | unchanged |
| Same, 142's tab **as of a day before the move** (history) | listed; live on 142 | unchanged: it touches 142 by its days → live (no born-held); who may change it is the gate's (`[XFER]`, §5) |
| An OML and its Upchit, **both before the move** (closed, D2846); 149's tab as of a day within 30 days of the upchit | listed under Upchit Complete on 149 (roster at the as-of day); its window born held with the root on | **not listed on 149's tab; listed on 142's** — the Upchit Complete filter reads the roster on **the upchit's own day**, not the as-of day. On 142's tab it opens live (touches 142) |
| An OML closed after the move by 149's Upchit | listed on 149 | listed on 149 (the upchit's day is 149's); its pager's downchits are 149's (`holderOf` row 1b) → live |

**Whose is the listing change?** **K10's, for the Medical tab's Upchit Complete section only** — one filter in
`ui/MedicalView.tsx` (`done = upchitsWithin(ord, 30).filter(e => onRosterOf(e.person, page, isoOf(e.ord)))`), because
without it the root cannot be switched on (a press of a closed 142 card on 149's tab would open a window born held).
It adds nothing to the screen: a card leaves one tab and stands on the other, as D2846 approved (card 35). **R9:** no
drawing owed for it — nothing new is drawn (D1625 reads "a box, a message, a mark, a button"). **The Down and Pending
sections need no change** (they list by the roster on the as-of day, which is D2845's look today). **Everything else
of D2845–D2847 that is a listing — 142's Inputs List keeping a carried record on its days, the Leave War, the Tracker —
stays `[XFER]`'s** (§12); none of them opens a window born held after K10 (the touches clause).

### 3.2 Finding 2 — a bell line whose input's squadron is no longer the line's

**File and line:** `ui/topstate.ts openNotice`, the line computing `u` (today `const u = sansDueOf(n) && !n.u && mine ?
homeOn(mine, todayIso()) : n.u`). After: for an input's line (`LINE_KINDS[kindOf(n)] === inputLine`) whose row exists,
`u = holderOf(row) ?? inputSqn(row, n.u)`; every other line as today. **The pinned call line** `enterForLine(u, again,
'line', o)` (R5 (a), `msq-guard-rollcall.test.ts` l.856) **does not change.** `INPUT_DOORS` row `bellline` gets its new
`why`.

| Case (D2835) | Enters | Window |
|---|---|---|
| A line about Osprey's Training (27 Jul), stored with 149; Osprey moved to 150 from 16 Jul; **Saber (master admin)** presses it | 150 (`inputSqn` — by its day, 150's) | live on 150 |
| A line about Ranger's leave across his move (14–18 Jul), stored with 142; Ranger 149's from 16 Jul; Saber presses | 149 (`holderOf`, D2835 + D2847) | live on 149 |
| A line about Nasty's OML closed by an upchit before his move, stored with 142 | 142 (not carried: D2835 "closed before the move stays with the old squadron and opens there") | live on 142 |
| **Hunter (142's admin, Plan of 149, View of 150)** presses the Osprey line | 150 → `'no'` (a View never opens 150's pages) → opens on his own page, 149 | **D2835's owed drawing ("someone who can only view the new one").** Until he has seen it: **today's look kept** — the window read only, nothing offered (`letOpenOn` case 3, §4.3) |
| A 142 admin with no right in 149 presses a line about Ranger's across-the-move leave | 149 → `'no'` → opens on 142 | **D2835's other owed drawing ("an admin of the old squadron only").** Until then today's look: live on 142 (it touches 142), its Save refused by the gate with D2261's approved words |

**U2:** `ui/topstate.ts` is chat S2's U2 file — **K10-c is built only after U2 lands in the batch**, and after KR-4
(which converts this door's order — §6). K10-c's first act: press both owed-drawing cases on the tree and record their
look; **if either is not as the table says today, stop — it is a question, not a build.**

---

## 4. The root patch (brief item 4)

### 4.1 Does it still apply — **yes**

`git apply --check` of `…/s1-chat204/k10-root/k10-root.patch`, run from `raptor-port/` on `a211-s1` (`66930e644`),
28 Nov 26: **all six files check clean** (`InputWindow.tsx` and five test files); the tree was left as it was (a check
writes nothing). **It will not stay so:** KR-3 and KR-4 re-point `msq-guard-doors-switch`, `msq-pick-windows`,
`msq-guard-input-sqn` and the bell files. So at K10-d: **the `InputWindow.tsx` hunks are applied as they are** (KR
does not touch that file — its `inputedit`/`inputdlg` closer is module-level, `setInpEdit(null)`); **the test hunks are
redone by hand on KR's versions**, from the whole copies in `k10-full/`, every assertion kept, each re-point renamed and
listed.

### 4.2 What K10-d adds to the window (besides the patch)

1. **The read-only let is kept for the window's life.** The note gains `ro: boolean`, set from `letOpenOn`'s case 3
   (§4.3) when the note is taken; `readOnly = (existing) || note.ro`. Why: a right given to him while the window stands
   (Hunter given Plan of 150) would otherwise turn a 150 record writable under 149's bar — "a change he did not make",
   which the read-only let must not follow.
2. **`pickUnit` follows a carried record:** `isNew ? openedSqn : (holderOf(r) ?? inputUnitOf(r) ?? UNIT)`. Why: on 149's
   tab Saber's window of Nasty's carried OML would otherwise offer 142's men in its Person list, and swapping Nasty for a
   142 man saves a 142 record from 149's page — the very fault part F stops. (Medical entries hold one person; the
   offer still matters for leave across the move.)
3. **The comments** — the window's head note and `heldBy`'s: "switched on at K10-d, its two findings answered by D2834,
   D2835, D2846 and Q1"; `openedSqn`'s Q7 note kept (point 1 of the K10 report stands: D2243 Q7 over the plan's §5.2
   table, and D2836 now closes such a window at his pick anyway).
4. **F4's pick clause:** the `it.todo` ("a real pick of 142 … gives the window back", D2654 E5) is **replaced by KR's
   answer**: a real pick closes the held window, nothing saved (D2825, D2836 — the later rulings; KR §0). Written at
   K10-d on KR's door.

### 4.3 `letOpenOn` after K10 — three cases, each needing a saved record not the page's own

| Case | When | Returns | Source |
|---|---|---|---|
| 1 | his pages may never be the record's squadron, **and** it names him | `pageSqn` (live) | D2621 — unchanged |
| 2 | the page is his own home today, it names him, **and** its squadron is one he is moving to on a day of it after today (`aheadAt(pid, own, r, today)`) | `pageSqn` (live) | K0's settlement, **narrowed to D2729 Q8's width** (the brief) |
| 3 | his pages may never be the record's squadron, it does **not** name him, **and** the window would offer him nothing anyway (`!mayEditInput(r)`, or he is an admin of none of its squadrons — the window's own `foreign` test, moved beside it as one exported predicate both read) | `pageSqn`, with `ro: true` | **R10**: D2835's View-only presser keeps today's look until his drawing; a window that can write nothing cannot write across |
| (Q1-A) | his answer to §9, if A: the record's one man is moving into the page's squadron on a day after today | `pageSqn`, with `ro: true` | §9 — built only on his answer |

**Case 2's narrowing:** today the clause lets open any input naming him on his home page. Narrowed: only one of a
squadron he moves to (the List's own `aheadAt`). What it closes: Saber (master admin) moved 142 → 149, in the admin view,
a raw open of his old 142 duty on his 149 home page — let today, held after. No press reaches it: the List leaves it out
(K9's reach test, D2729 Q8), his old medical is either carried (then it is 149's, no let needed) or closed (then on 142's
tab, after §3.1). K0's own test (his 5 Dec leave, his move to 149 saved for 1 Dec, on his 142 page) stays green — 149 is
a squadron he moves to.

**`letOpenOn` signature:** returns `{ on: string; ro: boolean } | null` (or a second export, the builder's) — case 3's
`ro` must travel into the note. `aheadAt` stays module-private, now asked by `letOpenOn` too.

---

## 5. Who may write (brief item 5)

- **`inputSqn` does not feed the save's own gate.** `state/perms.ts` imports nothing of `state/inputsqn.ts` (it is the
  other way round); the gate's input rule (`inputWhoProblem`, 7c) judges every (man, squadron) the record touches **by
  its days** (`inputSquadrons` over the rows before). The root only ever *narrows*: a held window writes nothing; a
  live one still passes the gate. Holding the window right needs no permission change. K10-a pins this with a grep test
  (no import of `inputsqn` from `perms.ts` or `engine/`).
- **D2847 already half-holds today:** leave across a move touches both squadrons, so the gate wants an admin of both — a
  142 admin with no right in 149 is already refused ("the old squadron's admin no longer may"). **The other half is a
  widening — "the new squadron's admins may" (an admin of 149 only)** — and so is D2834's "its admins see and close it"
  if read as changing the carried downchit itself (R11: "close" read as the Upchit, which already works, §3.1). Both
  are a change to the gate's 7c and to the window's `foreign` mirror together, with `docs/data-model.md` §11 (D200):
  **`[XFER]`'s, with the security reader (D1411)** — never K10's (`state/perms.ts` is also on the U2 hold list).
- **Until `[XFER]`:** on 149's tab Kestrel (149's admin) sees Nasty's carried OML read only and closes it with Upchit;
  an Upchit that would trim a downchit running across his move (one covering today) is refused by the gate as today
  (it touches 142) — named in `[XFER]`'s item (§12).

---

## 6. Where K10 meets KR — which lands first (brief item 6)

KR closes the Input window at every door (D2825), so a window open across a pick is gone. The root still matters for: a
window held since his midnight move (closed at his next pick, D2836), a bell line opening another squadron's record
(D2835), the Medical tab (D2834, D2846), Undo or Redo across squadrons, and any door not yet thought of (F4's belt).

**Order:** **K10-a now** (no file of KR's or U2's: `state/inputsqn.ts`, `ui/MedicalView.tsx`, tests) → U2 → **KR-1 to
KR-4** (KR's one merge boundary) → **K10-c, then K10-d** → KR-5 to KR-8 → K12.
**Why K10-c/d after KR-4:** KR-4 converts the bell door's order in the same function K10-c touches, and re-points
`msq-guard-input-sqn`; KR decides what becomes of a window at every door (F4's pick clause, the swap question across a
pick). Built after, the root's tests are written once, against the final doors; KR's merge boundary is not split.
**Re-running each on the other:** K10-a runs KR-touched files it might move (`msq-guard-input-sqn`, `msq-guard-rollcall`,
the census below) before it lands; KR-4's builder runs K10-a's new tests; K10-d runs KR's `msq-guard-drops.test.tsx`
and every file KR re-pointed, then the full suite under the checks lock.

---

## 7. The tests, red first (brief item 7)

"Seen failing" by the patch-file method (`git diff` → `git checkout --` → run → `git apply`), **never `git stash`**.

### 7.1 K10-a — `src/ui/msq-guard-input-sqn.test.tsx` (new describes) and `src/ui/medicalview.test.tsx`

| # | Test | Asserts | Seen failing |
|---|---|---|---|
| H1 | `holderOf`, the table | Nasty's pending OML, after his move → 149; with his move saved ahead, before its day → null, on its day → 149; after a second move to 150 → 150; closed by an upchit before the move → null; closed by 149's upchit after the move, then moved to 150 → 149; replaced by a newer, separate downchit, no upchit → null; Ranger's leave across his move (run) → 149, before its day → null; wholly before → null; wholly after → null; a two-man input → null; ALL AVAIL → null; a new input → null; an unreadable date → null | yes — no such export (shown by the import failing, as K10 part one's F0) |
| H2 | the same answer whoever looks (F0 re-stated, §2.4) | `holderOf` and `inputSqn` for every H1 record, signed in as Saber (master admin), Hunter, Kestrel (149's admin), Nasty (the man), Ranger, nobody, in both views: one answer each | pin |
| H3 | `inputSqn`'s clause | Nasty's carried OML: on 149's page → 149, on 142's → 142, on 150's → 149; F0's existing assertions unchanged; Ranger's across leave on 150's page → 149 | yes — today 142, 142, 142 |
| H4 | "open" agrees with the Medical tab | for every seeded man, every day of the demo fortnight: `holderOf`'s open test true ⇔ he is in the tab's Down or Pending section on that day on his own squadron | pin |
| H5 | the engine's other readers are untouched | for the carried OML: `inputSquadrons`, `inputOnDay(…, 'u142', 6–9 Jul)`, 142's schedule's Unavailable list on 6–9 Jul, the Leave War's absence on those days, OIL — the same before and after his move | pin |
| H6 | `letOpenOn` case 2 narrowed | Saber moved 142 → 149 (run), admin view, his old 142 duty raw-opened on his 149 page → null; K0's settlement (5 Dec leave, move to 149 saved for 1 Dec, his 142 page) → still 142 | yes — today 149 |
| H7 | `letOpenOn` case 3 | Hunter, Osprey's 150 Training (filed by him, not naming him), on his 149 page → `{ on: 149, ro: true }`; the same with Saber → null (he can open 150's page) | yes — no case |
| M1 | the Medical tab, D2846 | Nasty's OML and Upchit both before his move: on 149's tab as of Thu 16 Jul, not under Upchit Complete; on 142's tab as of the same day, under it; Upchit Complete of an upchit 149 gave after the move: on 149's | yes — today on 149's |
| M2 | **every card opens live (the invariant, as F13 for the List)** | for Nasty unmoved, moved, moved twice, and moved ahead; on 142's, 149's and 150's tabs; as of today and of a day before the move: every card of every section, then "Edit input" → `bornHeld()` is `''` | yes — finding 1 |
| FIND-1 | **re-pointed to his answer** (renamed "D2834/D2845: …") | Saber, 149's tab, Nasty's pending OML → the window of it, live (`bornHeld()` `''`), its Save writing the OML and no squadron stamp (`u`) on it; Kestrel the same card → read only, not held; her "Upchit" → a new Upchit saved, 149's by its day, Nasty gone from Pending | yes — today born held |
| FIND-2 | re-pointed at K10-a (renamed "D2835, the View-only presser: …") | Hunter's press still enters 149 and opens the 150 Training there (today's door; K10-c leaves his case so); the root's verdict is now "let, read only" (case 3), not "born held" — `bornHeld()` `''`, the window read only | yes — the verdict was "born held" |

### 7.2 K10-c — the bell door (`src/ui/msq-guard-input-sqn.test.tsx`, `src/ui/msq-guard-rollcall.test.ts`)

| # | Test | Seen failing |
|---|---|---|
| B-1 | Saber presses the Osprey line → `UNIT` 150, the Training's window live there | yes — today 149 |
| B-2 | Saber presses a line about Ranger's across-the-move leave stored with 142 → 149, live | yes — today 142 |
| B-3 | a line about Nasty's OML closed before his move → 142, live (D2835's second half) | pin |
| B-4 | Hunter presses the Osprey line → stays on 149, the window read only, nothing writable; given Plan of 150 while it stands open → still read only (the `ro` kept) | the first half a pin of today's look; the second yes at K10-d |
| B-5 | a 142-only admin presses the across-leave line → 142, live, its Save refused with D2261's words | pin |
| B-6 | `INPUT_DOORS` and R5 (a): the `bellline` row's file asks `holderOf`; the pinned call line unchanged | pin |
| FIND-2 | re-pointed (renamed "D2835: …"): B-1's assertions | yes |

### 7.3 K10-d — the root on (the patch's tests, redone on KR's files)

F4 (held at once; Save, Delete, "Take me out", the OIL answer, Enter write nothing; **a real pick closes it, nothing
saved** — KR; the raw entry of 142 gives it back live), F12, F10 (the swap question on the note), the four re-points of
the K10 report (`msq-night-held-input`, `msq-pick-windows` ×3, `msq-guard-doors-switch` B5) — each against KR's version.
Plus: **pickUnit** — Saber's window of the carried OML offers 149's men, not 142's (yes — today 142's); **the `ro` kept**
(B-4's second half); **every door of §5.5's table pressed again with the root on** (the K10 report's eleven rows, the
Medical tab's M2 and the bell's B-1 to B-5): none born held. **Stay green:** F1, F8, F13, F14, F17, F18, F19, W3-06
(`state/msq-fix2-undo-reach`), `msq-night-held-input`.

**Checks:** each sub-step's own files without the lock; at K10-d, the K10 report's census (every `*.test.ts*` with
`setInpEdit`, `INPEDIT` or `openInputOnPage`, and the guard's own files) in the background to a file, then **the full
unit suite and `npm run build` under the checks lock** (a held lock is NOT RUN, never a wait in a loop); `npm run
lint:changed` each step (one known finding). Under 7.0 of the bug-check order no test that changes data directly stands
in for a press: M2, FIND-1 and B-1 to B-5 press the controls.

---

## 8. Sub-steps, files, hours (brief item 8)

| # | Sub-step | Files | Waits on | Size |
|---|---|---|---|---|
| **K10-a** | `holderOf`; `inputSqn`'s clause; `letOpenOn` case 2 narrowed and case 3 added (with the shared `foreign` predicate); `INPUT_DOORS` `why`s (`docview`, a `medtab` row); the Medical tab's Upchit Complete filter (D2846); the file's head comment and §2.4's restated rule; tests H1–H7, M1, M2, FIND-1, FIND-2's re-point | `state/inputsqn.ts`, `ui/MedicalView.tsx`, `ui/InputWindow.tsx` (only the `foreign` predicate moved out, behaviour unchanged — or left where it is and copied by name into `inputsqn.ts`, the builder's, said in the report), `ui/msq-guard-input-sqn.test.tsx`, `ui/medicalview.test.tsx` | — (buildable now; no U2 file) | 5 h |
| **K10-c** | the bell door: `u` for an input's line; first, the two owed-drawing cases pressed on the tree (§3.2); B-1 to B-6, FIND-2 re-pointed | `ui/topstate.ts` (one line and its comment), the two test files | **U2 landed; KR-4 landed** | 2.5 h |
| **K10-d** | the root on: the patch's `InputWindow.tsx` hunks; the `ro` note; `pickUnit`; the comments; F4 / F12 / F10 and the four re-points redone on KR's files; every door pressed with the root on; the census; full suite and build under the lock | `ui/InputWindow.tsx`, the test files of §7.3 | K10-c; **his answer to Q1 (§9)** | 4 h (+1 h for Q1's answer) |
| **K10-e** | the records, one docs commit: the build plan's §21.1 gains a "K10 under D2834" block winning over §5.2's one-case `letOpenOn`, §5.5's two finding rows and §16 finding 2's wording, each with a pointer (D201); `docs/file-map.md` (`state/inputsqn.ts`: `holderOf`, `letOpenOn`); `docs/feature-impact.md` (one line: a one-man record's squadron follows a move while open); `OUTSTANDING.md` `[XFER]` gains §12's list; `HANDOFF.md`; `npm run docsize` | docs | K10-d | 1 h |

**Total: about 12.5 hours** (13.5 with Q1's answer), plus the reads. **Before U2 lands only K10-a** — it touches none of
`ui/UsersPanel.tsx`, `ui/topstate.ts`, `state/undo-wire.ts`, `undo/timeline.ts`, `state/accounts.ts`, `state/perms.ts`,
`state/notices.ts`, `state/acctlines.ts`, `state/units*.ts`, `ui/useraccess-model.ts`, `ui/UserAccess.tsx` (it only
*reads* `homeOn` from `state/units.ts`, as `inputsqn.ts` already does).

**Reads:** this plan — Astra and a fresh, blind Opus, before K10-a. After K10-d — Astra, a fresh, blind Opus and the
security reader on the code (part F decides when another squadron's record may be changed — D1411; the batch-end read
already planned). Part F is high-risk work (saved records, who may change them): **a fresh, blind Fable reader beside
them is the coordinator's to call** under D2255/D2440; if not called, it goes on the reads-owed list. The walk's
scenarios: Astra and a fresh, blind Fable, each blind (D2443), in the batch's walk.

**No new words on screen in any sub-step.** The bands are unchanged; the read-only window is today's look; §9's picture
comes before Q1's answer is built (D1625).

---

## 9. A question for him (brief item 9) — one card

**Q1 — a man joining 149 next week, looked at "as of" a day after he joins**

*Example:* Nasty (member, moving 142 → 149 on Thu 3 Dec) owes an upchit. Today is Mon 30 Nov. Saber (master admin) opens 149's
Medical tab and sets "as of" to Fri 4 Dec. Nasty shows there under Pending Upchit (he will be 149's then). Saber taps his
card, then "Edit input".

*What he sees:* until Thursday the upchit is still 142's — so the window cannot let Saber (master admin) change it from
149's tab.

*The decision:* what "Edit input" does there before Nasty (member, moving 142 → 149) has joined.

- **A — the card stays on 149's view; "Edit input" opens it read only until he joins.** *(recommended: he sees what is
  coming, and nothing is changed from the wrong squadron)*
- B — the card shows on 142's view of that day instead, until he joins.
- C — the card shows on neither view of that day until he joins.

*(Picture: 149's Medical tab as of 4 Dec, Nasty's card, the read-only window — drawn on the real app before it is put,
D1625. Rare: only an admin looking ahead past a move already saved.)* **Holds only K10-d**; K10-a and K10-c go on. A is
§4.3's row "Q1-A" (a read-only let); B or C need no new case in the window — a filter in `ui/MedicalView.tsx`'s Down
and Pending sections for an as-of after today, about 1 h either way.

**Not put to him — already ruled or owed elsewhere:** D2835's two looks (an admin of the old squadron only; someone who
can only view the new one) are **already owed as drawings** by D2835 itself — the coordinator's round, not a new
question; K10 keeps today's look for both meanwhile. 142's List keeping a carried record, the Leave War and the Tracker
are `[XFER]`'s (D2845–D2847, D2842).

---

## 10. Risks (brief item 10)

1. **A record saved into the wrong squadron.** A one-man record carries no squadron of its own (only a placeholder
   input's stamp `u`); its squadron is read from its days and, now, its man's move. Guards: the gate judges by days, as
   today (§5); `pickUnit` follows the carried record (§4.2), so the Person list cannot swap in a 142 man from 149's
   page; FIND-1 asserts no stamp is written by a save of a carried record; F4 holds every write of a held window.
2. **A record vanishing from both tabs.** M2 loops every section of every squadron's tab for moved, moved-twice and
   moved-ahead men, and asserts each card is on exactly the tabs §3.1 names; Q1 decides the one projected case.
3. **A window born held where he expects it live.** The old squadron's pages keep answering their own for a carried
   record (the touches clause first, §2.2); M2 and every §5.5 door pressed with the root on (K10-d); the Upchit Complete
   filter lands before the root (K10-a); the bell door before the root (K10-c); Q1 before the root.
4. **The engine's other readers of an input's squadron** — OIL (the latest published day), the Leave War (its months by
   date), the schedule's rows (by day), crew rest, Insights: **none reads `inputSqn` or `holderOf`** (they read
   `inputSquadrons` / `inputOnDay` in `src/engine/`, unchanged). H5 pins it. What D2847 changes in the Leave War is
   `[XFER]`'s.
5. **A read-only let turning writable** (a right given while it is open): the `ro` kept for the window's life (B-4).
6. **"Open" disagreeing with the Medical tab**: H4's loop; `holderOf` built from the tab's own bodies, no second rule.
7. **The patch drifting under KR**: the window's hunks applied as they are, the tests redone by hand on KR's files
   (§4.1); `git apply --check` again at K10-d.
8. **A moved man's carried record changed by the old squadron's admin from 142's List** (it touches 142 by its days):
   today's gate allows it for a downchit wholly before the move. Not K10's to close — `[XFER]`'s gate change (§5, §12),
   named so the walk does not count it as a K10 fault.

---

## 11. The planner's readings (none is his rule)

R1 a medical record closed after the move (by the new squadron's upchit) stays where it was closed · R2 an episode
replaced by a newer downchit with no upchit is read by its days · R3 approval does not change which squadron holds a
leave · R4 a duty or commitment wholly before the move stays, its waiting OIL answer answered where he is (D2621) · R5 a
commitment across the move is carried, as leave · R6 SANS availability is read the same way · R7 an input of several
people is never carried by one man's move · R8 only a move to another squadron carries · R9 the Upchit Complete change
needs no drawing (nothing new drawn) · R10 D2835's View-only presser keeps today's read-only look until his drawing ·
R11 "149's admin closes it" read as the Upchit, which works today; changing the carried downchit itself waits for
`[XFER]`'s gate change · plus the technical calls: "open" judged today, never the tab's as-of; `holderOf` beside
`inputSqn`, not inside the engine; K10-c and K10-d after KR-4.

---

## 12. What `[XFER]` keeps (filed by K10-e)

- **The gate (security reader, D1411):** D2847's "the new squadron's admins may change leave across his move"; whether
  the new squadron's admins may change a carried medical record itself (R11), and the old squadron's admin no longer;
  the window's `foreign` mirror moved with it; `docs/data-model.md` §11.
- An Upchit that trims a downchit running across his move (refused today: it touches the old squadron).
- **The listings:** whether 142's Inputs List and calendar keep a carried record on its days; the Leave War (unapproved
  leave after the move to the new war, D2847); the Tracker course (D2842).
- **D2835's two drawings** (the coordinator's round) and, after them, any change to those two looks.

---

## 13. For the walk's scenario designers — what only a browser can show

- On a desktop and his iPhone: 149's Medical tab with a moved man's pending upchit — the card, the viewer, "Edit input"
  live for a master admin, read only for 149's admin, "Upchit" closing it; 142's tab without him; a record closed before
  the move on 142's tab, not 149's.
- A bell line about an open request of a moved man, pressed by a master admin (enters the new squadron), by a Plan holder
  who only views it (stays, read only), by an old-squadron-only admin (stays, refused on Save).
- Every door of §5.5's table with the root on: none opens greyed.
- A window held across his own midnight move, then his pick: closed, nothing saved (D2836, with KR).
