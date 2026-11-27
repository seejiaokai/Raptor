# [MSQ-PICK-GUARD] Step K10, part F's root, under his D2834: the plan (chat A211, 28 Nov 26)

**Section 1 (the guard rail). A plan only.** Written by a fresh Opus planner from
`../briefs/2026-11-28-msq-s1-k10root-plan-brief.md` on branch `a211-s1` (`66930e644`). **Round 2 (this version):**
the two blind reads folded in one round — Astra (`../briefs/2026-11-28-msq-s1-k10root-read-astra.md`, 7 findings) and a
fresh Opus (`…-k10root-read-opus.md`, 10). Each claim was checked in the code first (§14, the ledger). No source file
was changed; nothing was run but reads and one `git apply --check`.

**How to read it.** Rulings by number. **"The planner's reading" (R-n) marks this planner's call, never his rule**
(lesson 32); every one is listed in §11. Code read on this branch by `grep`/`sed`; line numbers are a guide. Where this
plan and the build plan's §5 or the K10 brief differ, this plan wins for K10, and K10-e writes the pointer (D201).

---

## 0. What this plan decides, in one screen

1. **One new answer, `holderOf(r)`** in `state/inputsqn.ts`: the squadron that holds a ONE-MAN record now, **only where a
   move of his has carried it** (D2834), else null. It reads the record and its man's homes, **nothing of who is signed
   in**. It is fixed by the record's **settle day**: for a medical downchit still open, today; for one closed, the day
   its upchit was **filed** (D2846: "an upchit given by the old squadron"); for any other record, its last day. The
   holder is his squadron on the earlier of today and the settle day, so a later move never carries a finished record
   again, and a record never moves before his move has run.
2. **`inputSqn` puts a carried record's holder first**: a carried record is its holder's on every page; otherwise as
   today (the page's where it touches it by its days, else its first day's).
3. **Where a record is shown on a page that is not its holder** (the old squadron's List and Medical tab, a past or
   future "as of" day), **its window opens read only**: a new root-only answer, `letReadOnly`, beside `letOpenOn`. It
   never opens born held, and never writable from the wrong squadron. Its look is put to him first (**Q1**, §9).
4. **The Person list offers only men who keep the record on the squadron it stands on** (both reads' first finding).
   A change of dates or a turn into a group input that would move it is refused at the save door, with words drafted
   and drawn first (K10-f).
5. **A window whose record moves under it** (its man moves at midnight while it is open) **is held**, from the live
   record, at every draw and again inside the save door (Astra 2).
6. **The bell line (D2835)** enters the record's squadron where his pages may be it, else the line's own squadron as
   today. **K10-c owns that line**; KR-4 only converts the door's order (Opus 7).
7. **Who may write is not changed by K10.** `inputSqn` does not feed the save gate. The new squadron's admins changing
   carried records (D2847, D2834), a backdated certificate filed by 149, and the bell lines' squadron stamp are
   `[XFER]`'s, with the security reader (D1411).
8. **One question for him** (§9, Q1), which holds only K10-d. **Size: about 19 hours over five sub-steps**; K10-a is
   buildable now.

---

## 1. What "open" is, per kind of input (brief item 1)

"Carried" = goes with him at a move (D2834: "anything that's outstanding that is not closed will need to be transferred
with the person"). Every answer is about a record naming **one man alone** (`engine/inputs.ts onlyNamed`).

| # | Kind | Open (carried while open) | Closed (stays) | Source |
|---|---|---|---|---|
| 1 | **Medical downchit** (`isDownchit`) | its episode has no closing upchit and has not been replaced (row 1c); it has begun | closed by its episode's upchit; **"closed before the move" = that upchit was filed before his move day** | **D2834, D2845; D2846's words "an upchit given by the old squadron" — R1 is the reading of them** |
| 1b | …its upchit filed after the move (149 closed it, a backdated certificate included) | stays where it was closed: his squadron on the filing day (149); a later move does not carry it again | — | **D2845** ("149's admin closes it when the paper comes in"); R1 |
| 1c | …replaced: a separate later downchit began before any upchit closed it | — | by its days (not carried) | **R2**; the later episode carries the nag |
| 1d | …the closing upchit is **its own**: the earliest upchit dated on or after the episode's last end **and before the next separate episode begins** | — | — | **R3** (Astra 5: an upchit for a later episode never closes or carries an earlier one) |
| 2 | **Upchit** (`isUpchit`) | never | always by its own day | D2846 |
| 3 | **Leave across the move** | carried once the move has run; **kept by the squadron it was carried into after later moves** (its settle day is its last day) | — | **D2847** |
| 3b | Leave wholly before the move | — | stays (old squadron's records) | **D2847** |
| 3c | Leave wholly after the move | the new squadron's by its days already | — | D2847 |
| 3d | Approved or pending | does not change which squadron holds it; which Leave War decides it is `[XFER]`'s | | **R4** |
| 4 | **Duties, commitments, other dated inputs** wholly before the move | — | stays; its waiting OIL answer is answered by him where he is (D2621, `letOpenOn` case 1), never carried | **R5** |
| 4b | …running across the move | carried, as leave | — | **R6** (D2847 by analogy: "like everything else still open") |
| 5 | **SANS availability** | as rows 4 and 4b | | **R7** (D2163 is design only) |
| 6 | **A Tracker course** | not an input; D2842 is `[XFER]`'s | | D2842 |
| 7 | **An input of several people**; a placeholder input (its stamp) | **never carried** — by its days and the touches rule (F8) | | **R8** (D2834 "of his"; D2243 Q1, D2265) |
| 8 | Posted out other than by Transfer | not carried | | **R9** (D2834: "when a man moves squadron") |

**The day:** today is `state/units.ts todayIso()`, the day `pageUnit`, `myUnit`, `listReach` and the gate's rights are
read on (D2203). It is never the Medical tab's "as of" day, which shows a moment and decides nothing (§3.1). **A filing
day** is the date of the upchit's own saved-at moment (`at`, on the same clock as the moves); a record stored without
one is read by its `mod` stamp, else its own date (data already stored, D56).

---

## 2. The one answer (brief item 2)

### 2.1 `holderOf(r, today = todayIso()): string | null` — new, `state/inputsqn.ts`

Null for: no record, a new one, an unreadable date, a record of several people or none (`onlyNamed(r) == null`), a
record whose first day is after today, a man with no home. Else, with `p` its man and `first = inputUnitOf(r)`:

1. **The settle day `S`:**
   - a medical downchit: its episode's own closing upchit (row 1d) → that upchit's **filing day**; none, and the
     episode replaced (row 1c) → **null, stop**; none and not replaced → open → `S = today`;
   - any other kind: its last day.
2. `d = min(today, S)`; **holder = `homeOn(p, d)`**, returned only if it differs from `first` (a move has carried it).

| Case (Astra 4–6, Opus 4) | `d` | Holder |
|---|---|---|
| Nasty's OML 6–9 Jul, pending; moved 142 → 149 on 16 Jul; today 17 Jul | 17 Jul | 149 |
| …moved again to 150 on 20 Jul; today 21 Jul, still pending | 21 Jul | 150 (follows him while open) |
| …closed by 149's upchit filed 18 Jul; then moved to 150 | 18 Jul | 149 (stays where closed) |
| …an upchit dated 17 Jul but filed 10 Jul, before the move | 10 Jul | null (given by 142: stays) |
| OML 6–9 Jul replaced by ATT C 12–13 Jul; an upchit 17 Jul closes the ATT C | — | the OML: null (row 1c); the ATT C: 149 if filed after the move |
| Ranger's leave 14–18 Jul across his move to 149 (16 Jul); today 19 Jul | 18 Jul | 149 |
| …then moved to 150 (20 Jul), or back to 142 | 18 Jul | 149 (kept) |
| Leave across a move saved ahead, not yet run (today before the move) | today | null until the move day |
| A move set ahead, the OML already pending | today | null until the move day, then the new squadron |

Built only from existing bodies (`medEpisode`, `inputSquadrons`, `inputUnitOf`, `homeOn`, `homeChangesOn`, `onlyNamed`,
`isDownchit`, `isUpchit`, `INPUTS`), **no change in `src/engine/`**. Only medical rows reach the episode reads;
`holderOf` runs at a press and when a window's note is taken or its record is re-read — never per row of a list.

### 2.2 `inputSqn` after K10

```
inputSqn(r, pageSqn):
  new or none              → pageSqn                    (as today)
  carried = holderOf(r)  → carried                    (new: the holder, on every page)
  touches pageSqn          → pageSqn                    (as today: by its days)
  else                     → inputUnitOf(r) ?? pageSqn  (as today)
```

**What changes:** a carried record answers its holder on every page — Nasty's open OML is 149's on 142's, 149's and
150's pages; Ranger's carried leave is 149's on 142's page too. Every other record answers as today. **A carried record
on a page that is not its holder is never born held:** that page is one of the record's own squadrons (by its days, or
carried through, or one its man is moving into), and `letReadOnly` lets it open there read only (§4.3).

**Its "life"**, read by `letReadOnly` alone (root only): `lifeOf(r)` = the squadrons of its days (`inputSquadrons`) ∪ its
man's squadron on every day from its first day to `d` (`homeChangesOn`) ∪ — for an open medical record — his squadrons
on the moves saved ahead after today.

### 2.3 Whose move, which day, the hard cases

| Case | Answer |
|---|---|
| Whose move | the record's one man's — never the person signed in, never a filer |
| Which day | today; a window's note takes it once, when it opens (F12), and its record is re-read live (§4.2 item 3) |
| Moved twice | an open record follows him; a closed or finished one stays where it settled (§2.1 table) |
| A move set ahead, not yet run | not carried until its day |
| A group input | never carried |
| An Undo that cancels a move before its date | the next press reads homes afresh; an open window is re-judged from the live record (§4.2) |

### 2.4 "The doors and the root never share an answer" — restated, with why (§16 finding 2; F0)

**Replaced:** "`inputSqn` has NO clause for who is named in the input, and never gains one."
**With:** "**A door asks `inputSqn`**, which gives the holder where a move of its one man has carried it (`holderOf`,
D2834), else the page's where the record touches it, else its first day's. **Neither reads anything of the person
signed in or looking. Only the root asks `letOpenOn` and `letReadOnly`**, the two functions that read who is looking."

**Why the rule still holds:** finding 2 was that a door answering "live here, he is named" would skip entering the right
squadron. `holderOf` is a fact about the record and its man's moves, the same for every viewer. **Fable 3b's danger**
(the first-named man's squadron today carrying Hunter to 149 for an input on his own page) stays excluded: only one-man
records whose man has moved are carried, and a record he has not moved with answers exactly as today. H2 proves the
viewer-blindness with a loop.

---

## 3. The two findings closed (brief item 3)

### 3.1 Finding 1 — "Edit input" from the Medical tab

| State | After K10 |
|---|---|
| Nasty's pending OML on **149's** tab (he moved 142 → 149) | 149's (`inputSqn`) → **live**. Saber (master admin) may change it. Kestrel (149's admin) sees it **read only** (`InputWindow.tsx foreign` mirrors the gate, which judges by its days) and closes it with **"Upchit"**: a new Upchit dated on or after the move is 149's and passes the gate |
| The same on **142's** tab "as of" a day before the move (history), or on 142's Inputs List (it stands on its days) | **read only** (`letReadOnly`: 142 is in its life, not its holder) — D2847's "the old squadron's admin no longer may", D2621's mirror; the look is Q1's |
| Nasty moved twice (149, then 150), still pending; **149's** tab "as of" a day between the moves | **read only** (149 is in its life; Astra 3, Opus 3) |
| A move to 149 saved ahead; **149's** tab "as of" a day after it | **read only** (149 is in its life, moving ahead) — the case of round 1's Q1, now the same answer |
| An OML closed by an upchit **filed** before the move (D2846) | not on 149's Upchit Complete; on 142's; live on 142 |
| Closed by an upchit **filed** after the move by 149, a backdated certificate included | on 149's Upchit Complete; its pager's downchits 149's → live |

**Whose is the listing change?** **K10's, for the Upchit Complete section only**: one filter in `ui/MedicalView.tsx`,
the roster on **the upchit's filing day** (not the as-of day, not its date). Without it a closed 142 card stands on
149's tab. It adds nothing to the screen: a card stands on one tab instead of the other, as D2846 (card 35) approved
(**R10**: no drawing owed — nothing new is drawn). The Down and Pending sections need no change. **The other listings
— 142's List keeping a carried record on its days, the Leave War, the Tracker — stay `[XFER]`'s**; none opens a window
born held after K10.

**The viewer's Upchit default date (Opus 2):** `ui/DocViewer.tsx upchit()` seeds `fmt(keyToIso(TODAY))`, the demo's
fixed notional today (13 Jul 2026), not the clock. **K10 does not change it** (it is the one notional today every new
input and the Medical tab's "as of" default use). FIND-1 sets the Upchit's date explicitly to a day after the move; the
walk's brief says so (§13). An Upchit Kestrel dates **before** the move touches 142 and is refused by today's gate: it
breaks D2845 for a backdated certificate until `[XFER]`'s gate change (§5, §12).

### 3.2 Finding 2 — a bell line

**File and line:** `ui/topstate.ts openNotice`, the line computing `u`. After, for an input's line
(`LINE_KINDS[kindOf(n)] === inputLine`) whose row exists: `const own = inputSqn(row, n.u); u = ownPageMayBe(own) ? own :
n.u`. Every other line is as today. **The pinned call line** `enterForLine(u, again, 'line', o)` (R5 (a)) is unchanged;
`INPUT_DOORS` row `bellline` gets its new `why`.

| Case | Enters | Window |
|---|---|---|
| Saber (master admin) presses a 149-stamped line about Osprey's Training (27 Jul; Osprey 150's from 16 Jul) | 150 | live on 150 |
| Saber presses a 142-stamped line about Ranger's leave across his move | 149 (the holder — D2835, D2847) | live on 149 |
| A line about Nasty's OML closed by an upchit filed before his move | 142 (D2835: "a request closed before the move stays with the old squadron and opens there") | live on 142 |
| **Hunter (142's admin, Plan of 149, View of 150)** presses the Osprey line, **from 142 or from 149** (Astra 7) | 149 — the line's own, as today (his pages may never be 150's) | **read only** (`letReadOnly` case 3), as today — D2835's owed drawing of "someone who can only view the new one"; until then today's look |
| An admin of 142 only presses a line about Ranger's carried leave | 142, as today (he can never be 149's) | **read only** (case 4) — D2835's other owed drawing, "an admin of the old squadron only"; Q1 is its picture |

**Ownership:** **this line is K10-c's.** KR's plan §12 head gives D2835 to KR-4; KR-4 converts only the door's order
(`closeShown` → `closeOpen`), never `u` (the coordinator notes it on KR's side). **U2:** `ui/topstate.ts` is chat S2's U2
file — K10-c is built after U2 lands, and after KR-4. K10-c's first act: press both owed-drawing cases on the tree from
142 and from 149 and record their look; if either differs from this table's "as today", stop — it is a question.

---

## 4. The root patch (brief item 4)

### 4.1 Does it still apply — **yes**

`git apply --check` of `…/s1-chat204/k10-root/k10-root.patch`, from `raptor-port/` on `a211-s1` (`66930e644`), 28 Nov
26: **all six files check clean**; the tree was left as it was. KR-3 and KR-4 will re-point the same test files, so at
K10-d **the `InputWindow.tsx` hunks are applied as they are** (KR does not touch that file), then §4.2's additions on top;
**the test hunks are redone by hand on KR's versions** from the whole copies in `k10-full/`, every assertion kept, each
re-point renamed and listed. `letOpenOn` keeps its return (a squadron or null), so no patch line changes meaning
(Opus 8); `letReadOnly` is a second export.

### 4.2 What K10-d adds to the window

1. **The note** gains `ro` (`letReadOnly`, taken once) and `at` (the page's squadron when it opened). The squadron it
   stands on is `let ?? (ro ? at : unit)`. A read-only let is never held at its birth, and **stays read only for the
   window's life** (`readOnly = (existing) || note.ro`), so a right given while it is open cannot make it writable.
2. **The Person list (both reads' first finding):** `pickUnit = isNew ? openedSqn : note.unit` (the record's own
   squadron as the note took it). **A man is offered only where the draft with him added keeps the record's own
   squadron** (`inputSqn(draftWith(p), at) === note.unit`), added to the existing offer filter (`offersFor`); the people
   already in it stay shown. So from 142's page no 149 man can be swapped in, and from 149's no 142 man.
3. **A record that moves under the window is held (Astra 2):** `drift = inputSqn(liveRecord, at) !== note.unit`, asked
   at every draw from the live record (`INPUTS` by id) and again inside the save door before any write. The note itself
   is never re-taken (F12). The band is the existing held band; the builder checks its words are true for this state
   (R11: a change he did not make asks nothing and closes nothing, D2403's reading; nothing in it can be saved). If they
   are not true, the words are owed and K10-d's switch waits for them.
4. **The swap question's "Discard and open"** takes up the other input where its own note would let it stand live **or
   read only** (`letReadOnly` added to the patch's check).
5. **The comments**, and **F4's pick clause** replaced by KR's answer: a real pick closes the held window, nothing
   saved (D2825, D2836).

### 4.3 The root's own answers after K10

| Answer | Case | Returns | Source |
|---|---|---|---|
| `letOpenOn` 1 | his pages may never be the record's squadron, and it names him | `pageSqn` (live) | D2621, unchanged |
| `letOpenOn` 2 | the page is his own home today, it names him, and its squadron is one he moves to on a day of it after today (`aheadAt`) | `pageSqn` (live) | K0's settlement **narrowed to D2729 Q8's width** |
| `letReadOnly` 3 | his pages may never be the record's squadron, it does not name him, and he could change nothing of it (`!mayEditInput(r)`, or he is an admin of none of its squadrons — the window's own `foreign` test, exported as one predicate both read) | true | **R12**: D2835's View-only presser keeps today's look until his drawing |
| `letReadOnly` 4 | the record is not the page's (`inputSqn(r, page) !== page`) and the page is in its life (§2.2) | true | **D2847, D2834, D2621's mirror; the look is Q1's** |

**Case 2's narrowing** closes a raw open of a moved master admin's old 142 duty on his 149 home page (let today, held
after); no press reaches it (K9's reach test, D2729 Q8). K0's own test stays green.

---

## 5. Who may write (brief item 5)

- **`inputSqn` does not feed the save gate.** `state/perms.ts` imports nothing of `state/inputsqn.ts`; the gate's 7c
  judges every (man, squadron) a record touches by its days. The root only ever narrows (held or read only writes
  nothing; a live window still passes the gate). K10-a pins it with a grep test.
- **Read only on the old squadron's page is the window keeping D2847 and D2834, not a permission change** (Opus 5): a
  forged write from 142 is still judged by the gate by its days; closing that is `[XFER]`'s.
- **`[XFER]`'s, with the security reader (D1411), all one gate change with the window's `foreign` mirror and
  `docs/data-model.md` §11:**
  - D2847's "the new squadron's admins may change leave across his move" (an admin of 149 only);
  - the new squadron's admins changing a carried medical record itself (**R13**: D2845's "closes it" read as the
    Upchit, which works today);
  - the old squadron's admin no longer able to by a forged write;
  - an Upchit 149 files dated before the move (a backdated certificate), refused today (§3.1);
  - an Upchit that trims a downchit running across the move, refused today.

---

## 6. Where K10 meets KR — which lands first (brief item 6)

KR closes the Input window at every door (D2825). The root still matters for a window held since his midnight move
(closed at his next pick, D2836), a bell line opening another squadron's record (D2835), the Medical tab and the old
squadron's List (D2834, D2846, D2847), a record moving under an open window (Astra 2), Undo or Redo across squadrons,
and F4's belt.

**Order (changed in round 2 only by K10-f):** **K10-a now** (`state/inputsqn.ts`, `ui/MedicalView.tsx`, tests) → U2 →
**KR-1 to KR-4** → **K10-c** → **K10-d** (after Q1) → KR-5 to KR-8 → **K10-f** (after its words are drawn) → K12.
K10-c and K10-d come after KR-4 because KR-4 converts this door's order and re-points `msq-guard-input-sqn`; built after,
the root's tests are written once, against the final doors. **K10-c owns the bell's `u` line (§3.2).** Each re-runs the
other: K10-a runs `msq-guard-input-sqn`, `msq-guard-rollcall` and the census before it lands; KR-4's builder runs
K10-a's tests; K10-d runs `msq-guard-drops.test.tsx` and every file KR re-pointed, then the full suite under the lock.

---

## 7. The tests, red first (brief item 7)

"Seen failing" by the patch-file method (`git diff` → `git checkout --` → run → `git apply`), never `git stash`.
**Every window test presses the real controls of a mounted window** and reads the stored record and the bar (Astra:
`bornHeld()` recalculates from the state now, so it proves nothing about a note already taken).

### 7.1 K10-a — `src/ui/msq-guard-input-sqn.test.tsx` and `src/ui/medicalview.test.tsx`

| # | Test | Seen failing |
|---|---|---|
| H1 | `holderOf`: every row of §2.1's table, each on the days before, on and after the move (and the second move), including the future-dated upchit filed before the move (10, 16, 17 Jul), the replaced episode then the later episode's upchit, and the return to 142 | yes — no such export |
| H2 | the same answer whoever looks: every H1 record, signed in as Saber (master admin), Hunter, Kestrel (149's admin), Nasty, Ranger, nobody, both views | pin |
| H3 | `inputSqn`: Nasty's carried OML on 142's, 149's and 150's pages → 149; F0's assertions unchanged; Ranger's carried leave on 142's → 149 | yes — today 142 |
| H4 | **per record** (Opus 9): a medical record is open by `holderOf`'s rule ⇔ it is in the episode of an entry the tab lists under Down or Pending that day; for every seeded medical record, every day of the demo fortnight | pin |
| H5 | the engine's readers untouched: `inputSquadrons`, `inputOnDay`, 142's Unavailable list on 6–9 Jul, the Leave War's absence, OIL — the same before and after his move | pin |
| H6 | `letOpenOn` case 2 narrowed (a moved master admin's old duty on his new home page → null; K0's 5 Dec leave → still 142) | yes |
| H7 | `letReadOnly` cases 3 and 4: Hunter and the Osprey Training on 149; Nasty's carried OML on 142, on 149 between two moves, on 149 ahead of a saved move; a two-squadron input (F8) → false | yes — no such export |
| M1 | the Upchit Complete filter: an upchit filed before the move on 142's tab only; one filed after it, a backdated date included, on 149's only | yes — today the as-of's roster |
| M2 | **every card opens a window that is not born held**: Nasty unmoved, moved, moved twice, moved ahead; 142's, 149's and 150's tabs; as of today, a day before the move, a day between two moves and a day after a saved move; every card of every section and every pager entry, then "Edit input" | yes — finding 1 (passes only with the root's answers of K10-a) |
| FIND-1 | re-pointed ("D2834/D2845: …"): Saber on 149's tab → the OML's window, its note's answers live; Kestrel → read only; her Upchit dated after the move → saved, 149's, Nasty off Pending | yes — today born held |
| FIND-2 | re-pointed ("D2835, the View-only presser: …"): Hunter's press enters 149 and the root's answer is read only, not born held | yes |

### 7.2 K10-c — the bell door

| # | Test | Seen failing |
|---|---|---|
| B-1 | Saber, the Osprey line → `UNIT` 150, live | yes — today 149 |
| B-2 | Saber, a line about Ranger's carried leave stamped 142 → 149, live; after Ranger's second move → still 149 | yes |
| B-3 | a line about an OML closed by an upchit filed before the move → 142, live | pin |
| B-4 | Hunter, the Osprey line, **starting from 142 and from 149** → enters 149 both times, read only | pin of today's look (Astra 7) |
| B-5 | an admin of 142 only, a line about the carried leave → stays on 142, read only (the window part waits for K10-d) | yes at K10-d |
| B-6 | `INPUT_DOORS` and R5 (a): the pinned call line unchanged; the `bellline` row's file asks `inputSqn` | pin |
| B-7 | the line's stamp (Opus 6): a line about the carried OML written after the move still wears 142's grey mark and sits under 142's bell switch — **a pin of today's stamp, named "`[XFER]`'s"** | pin |

### 7.3 K10-d — the root on

F4, F12, F10 and the four re-points of the K10 report, redone on KR's files; F4's pick clause = KR's close. Plus,
pressed in mounted windows:
- **the Person list (both reads' first finding):** from 142's page (the history tab and the List) and from 149's,
  Saber's window of Nasty's carried OML, Ranger's carried leave and Ranger's leave across a move saved ahead — the list
  offers only men who keep the record's squadron; the saved person, the record's squadron afterwards and the bar
  asserted; no write where nothing may be offered;
- **drift (Astra 2):** Saber's window of Nasty's carried OML open on 149; Nasty moves to 150 at midnight → held, Save
  writes nothing; the same with the record replaced under it (an Undo of his own change to its people);
- `ro` kept after a right is given mid-window;
- every door of §5.5's table pressed with the root on; M2 again with mounted windows.

**Stay green:** F1, F8, F13, F14, F17, F18, F19, W3-06, `msq-night-held-input`. **Checks:** each sub-step's own files
without the lock; at K10-d the census in the background to a file, then the full unit suite and `npm run build` under
the checks lock (held: NOT RUN, never a wait in a loop); `npm run lint:changed` each step.

### 7.4 K10-f — the save door

From 142's page, Saber changes a carried OML's dates into 149's days, or adds a 149 man to it: refused with the drawn
words, nothing written; the same that keeps its squadron: saved. Seen failing: yes — today it saves.

---

## 8. Sub-steps, files, hours (brief item 8)

| # | Sub-step | Files | Waits on | Size |
|---|---|---|---|---|
| **K10-a** | `holderOf` (settle days, the episode's own upchit, filing days); `inputSqn` holder-first; `lifeOf`; `letOpenOn` case 2 narrowed; `letReadOnly` 3 and 4 with the shared `foreign` predicate; `INPUT_DOORS` `why`s (`docview`, a `medtab` row); the Upchit Complete filter by filing day; the head comment and §2.4's rule; H1–H7, M1, M2, FIND-1, FIND-2 | `state/inputsqn.ts`, `ui/MedicalView.tsx`, `ui/InputWindow.tsx` (the `foreign` test exported, unchanged — or copied by name, the builder's), the two test files | — | 7 h |
| **K10-c** | the bell's `u`; the two owed-drawing cases pressed first from 142 and 149; B-1 to B-7 | `ui/topstate.ts` (one line, its comment), test files | **U2; KR-4** | 2.5 h |
| **K10-d** | the root on: the patch's window hunks, then §4.2's five additions; §7.3's tests; full suite and build under the lock | `ui/InputWindow.tsx`, `ui/inputedit.tsx` (the offer filter, if `offersFor` is where it lives), test files | K10-c; **Q1** | 6 h |
| **K10-e** | the records: the build plan's §21.1 gains a "K10 under D2834" block winning over §5.2's one-case `letOpenOn`, §5.5's two finding rows and §16 finding 2's wording, each with a pointer (D201); `docs/file-map.md`; `docs/feature-impact.md` (a one-man record's squadron follows a move while open); `OUTSTANDING.md` `[XFER]` gains §12; `HANDOFF.md`; `npm run docsize` | docs | K10-d | 1 h |
| **K10-f** | the save door: a change of dates, or a man or placeholder added, that would move the record off the squadron it stands on is refused; its words drafted by Opus, adjusted by a fresh Fable (D2441), drawn on the real app and shown to him (D1625) | `ui/InputWindow.tsx` or its save door in `ui/inputedit.tsx`, a test file | its words seen | 2.5 h |

**Total: about 19 hours** (round 1: 12.5), plus the reads. The rise is the read's work: settle days and the episode's
own upchit (+2 h), read only on the old page and the life of a record (+0.5 h), the Person list, drift and their tests
(+2 h), the save door (+2.5 h). **Before U2 lands only K10-a**; it touches none of the U2 hold list (it only reads
`homeOn` / `homeChangesOn` from `state/units.ts`). **K10-f is a gap that exists today** (a date change can move a record
off the page with or without the root), so the root does not wait for it.

**Reads:** this round 2 — read by the coordinator; a second round only on his word (one round, as asked). After K10-d:
Astra, a fresh, blind Opus and the security reader (D1411; the batch-end read). A fresh, blind Fable beside them is the
coordinator's call (high-risk work, D2255, D2440), else on the reads-owed list. The walk's scenarios: Astra and a fresh,
blind Fable (D2443). K10-f's words: a fresh Fable (D2441).

**No new words on screen** except K10-f's (drawn first). Q1's picture comes before K10-d.

---

## 9. A question for him (brief item 9) — one card

**Q1 — Ranger's leave, looked at on his old squadron's list after he has moved**

*Example:* Ranger (member) has leave from Tue 14 to Sat 18 Jul. On Thu 16 Jul he moves from 142 to 149, so the leave
goes with him to 149 (you ruled this). On Fri 17 Jul, Hunter (142's admin) opens 142's Inputs list. Ranger's (member)
leave is still listed there for its first two days, and Hunter (142's admin) taps it.

*What he sees:* the leave's window. Hunter (142's admin) may no longer change it — only Ranger (member), 149's admins or
a master admin may.

*The decision:* how the window shows that on 142's page.

- **A — it opens read only: everything shown, nothing to change.** *(recommended: 142 still sees what Ranger (member)
  had, and nothing of 149's is changed from 142)*
- B — it leaves 142's list altogether; 142 sees it only on its schedule for those two days.

*(Cost of B: about 1 hour more in K10-d, the list's filter, and the Medical tab's past and future views lose such
records too.)*

*(Picture: 142's Inputs list on Fri 17 Jul, Ranger's (member) leave, the read-only window — drawn on the real app first,
D1625; Hunter (142's admin) drawn with no right in 149 — the orchestrator's swap for the planner's made-up "Viper",
a real seeded callsign.)* The same answer is used for a waiting medical record that went with him, and for a Medical tab set to a past
or a future "as of" day.

**Not put to him — ruled, or owed elsewhere:**
- **Opus 2** (which upchits count as "closed before the move") is decided by D2846's own words, "an upchit given by the
  old squadron": the day the upchit was filed decides, not the date written on it (R1). A backdated certificate that
  149 files therefore closes the record in 149 (D2845). The gate refusing 149's admin such a date is `[XFER]`'s.
- **D2835's two looks** are already owed as drawings by D2835 itself (the coordinator's round). Q1's picture is the
  "admin of the old squadron only" one; the View-only presser keeps today's look meanwhile.

---

## 10. Risks (brief item 10)

1. **A record saved into the wrong squadron.** The gate judges by days (§5). The Person list offers only men who keep
   the record's squadron (§4.2 item 2). The save door refuses a date or a group change that would move it (K10-f).
   Drift holds a window whose record moved under it (§4.2 item 3). A carried record on a page not its holder is read
   only. The tests read the saved person, the record's squadron and the bar.
2. **A record vanishing from both tabs.** M2's loop over every tab, section and as-of day, moved, moved twice and moved
   ahead; each card stands on the tabs §3.1 names.
3. **A window born held where he expects it live.** A carried record is read only where it is not the holder, never held
   at its birth (case 4); the Upchit Complete filter lands before the root; the bell door before the root; Q1 before the
   root.
4. **The engine's readers** (OIL, the Leave War, the schedule's rows, crew rest, Insights) read neither `inputSqn` nor
   `holderOf` (H5). **The bell's squadron stamp** (`state/notices.ts tell`, the gate's `lineStampOwed`, the grey mark, the
   bell's switch) keeps a carried record's first-day squadron — pinned (B-7), `[XFER]`'s (Opus 6).
5. **A read-only let turning writable:** `ro` kept for the window's life.
6. **"Open" disagreeing with the Medical tab:** H4, per record.
7. **The patch drifting under KR:** window hunks as they are, tests redone on KR's files, `git apply --check` again at
   K10-d.
8. **A forged write by the old squadron's admin** is still judged by days — `[XFER]`'s gate, named.
9. **The demo's fixed "today"** (the Medical tab opens "as of" 13 Jul 2026, its Upchit seeds that date, while moves run on
   the clock): a walker sees a moved man still on 142's tab by default. Not a fault; the walk's brief says so (§13).

---

## 11. The planner's readings (none is his rule)

R1 D2846's "an upchit given by the old squadron" read as: the day the upchit was filed decides, not the date on it ·
R2 an episode replaced by a newer downchit before any upchit is read by its days · R3 an upchit closes only its own
episode (bounded by the next separate one) · R4 approval does not change which squadron holds a leave · R5 a duty or
commitment wholly before the move stays, its OIL answer answered where he is · R6 a commitment across the move is carried,
as leave · R7 SANS availability the same · R8 an input of several people is never carried · R9 only a Transfer carries ·
R10 the Upchit Complete change needs no drawing · R11 a record moved under an open window holds it with the existing band
· R12 D2835's View-only presser keeps today's read-only look until his drawing · R13 "149's admin closes it" read as the
Upchit · **the technical calls:** today's date, never the tab's as-of; a record's holder fixed by the earlier of today
and its settle day; `holderOf` beside `inputSqn`, not in the engine; `letReadOnly` a second export; the viewer's Upchit
seed date left as it is; K10-c and K10-d after KR-4; K10-c owns the bell's `u`.

---

## 12. What `[XFER]` keeps (filed by K10-e)

- **The gate (security reader, D1411):** the five items of §5's list, with `foreign`'s mirror and `docs/data-model.md`
  §11.
- **The bell lines' squadron stamp** for a carried record (`notices.ts`, `perms.ts lineStampOwed`, the grey mark, the
  bell's switch) — U2-hold files and a gate line.
- **The listings:** 142's List and calendar keeping a carried record on its days (read only after K10); the Leave War
  (D2847); the Tracker course (D2842).
- **D2835's two drawings** (the coordinator's round).

---

## 13. For the walk's scenario designers — what only a browser can show

- **First set "as of", or file with a date, past the move:** the demo's Medical tab and its Upchit default to 13 Jul 2026
  while moves run on the clock.
- On a desktop and his iPhone: 149's Medical tab with a moved man's pending upchit — "Edit input" live for a master
  admin, read only for 149's admin, "Upchit" closing it; 142's tab without him; a record closed before the move on 142's
  tab; the same record from 142's List read only; a man moved twice, 149's tab as of a day between the moves.
- A bell line about an open request of a moved man, pressed by a master admin, by a Plan holder who only views the new
  squadron (from 142 and from 149), by an old-squadron-only admin.
- The Person list of a carried record from 142 and from 149; a man moved at midnight while his record's window is open.
- Every door of §5.5's table with the root on: none opens greyed; a held window, then his pick: closed, nothing saved.

---

## 14. Red-team ledger (round 1, 28 Nov)

Each claim was checked in the code before it was taken. **Of 17 findings (Astra 7, Opus 10): accepted 15, partly
accepted 2, rejected 0.**

| # | Finding | Verdict | Checked in the code | Fixed in |
|---|---|---|---|---|
| A1 | the Person list lets a 149 record be saved under 142's bar | accepted | `PeoplePick unit={pickUnit}`, `lockOne={!isNew && !canEditOwn()}`: an admin may change the person; the round-1 `pickUnit` followed the holder whatever the page | §4.2 item 2 (the record's own squadron and a keep-its-squadron offer filter); dates and group changes in K10-f; §7.3, §7.4 |
| A2 | a window stays writable after its subject moves at midnight | accepted | the note is taken once; `held` compared it with an unchanged page | §4.2 item 3 (drift from the live record, at every draw and in the save door); §7.3 |
| A3 | a past Medical card on the middle squadron opens held | accepted | `mine` reads the roster on the as-of day; `inputSqn` gave 150 and no let covered 149 | §2.2 the record's life; §4.3 case 4 (read only); M2 |
| A4 | finished carried leave returns to 142 after a later move | accepted | round 1 read his home today, which the leave does not touch after the second move | §2.1 (`d = min(today, S)`, S = its last day); H1, B-2 |
| A5 | a later episode's upchit carries an earlier, replaced one | accepted | `pendingUpchits`' closer (c) is person-wide, not tied to an episode | §1 rows 1c, 1d (R3); H1 |
| A6 | a future-dated upchit carries an old record before the move | accepted | `upchitRefusal` allows a future date; round 1 read the home on the upchit's date | §2.1 (the filing day, not the date — R1); H1 on 10, 16, 17 Jul |
| A7 | the denied bell destination does not keep 149 | accepted | `enterForLine` answers `'no'` and enters nothing, leaving Hunter on 142 | §3.2 (`u = ownPageMayBe(own) ? own : n.u`); B-4 from 142 and 149 |
| O1 | the Person list saves under the wrong bar (the mirror case and the ahead case) | accepted | as A1; `rosterOptions(pickUnit, firstDay)` | as A1 |
| O2 | "closed before the move" rests on the upchit's date; the seed date is the demo's | accepted | `DocViewer upchit()` seeds `fmt(keyToIso(TODAY))`, `TODAY` the demo literal; inputs carry `by`/`at` | §1 row 1 (D2846's words, R1, no question); §3.1 (seed kept, FIND-1 sets the date); §5, §12 (the gate); M1 |
| O3 | a man moved twice: the middle squadron's tab opens held | partly | the failure is true (as A3); **its fix "live on the middle squadron" rejected** — it would let a 150 record be changed under 149's bar (Astra 3: no writing from a past page) | read only instead (§4.3 case 4) |
| O4 | carried leave falls back to 142 after a second move | accepted | as A4 | as A4 |
| O5 | the old squadron's admin can still change a carried record from 142's page | accepted (its option a) | the window was live on 142 by the touches clause; the gate allows it by days | §2.2 (holder first), §4.3 case 4; the gate's half named for `[XFER]` (§5) |
| O6 | the bell stamp is a reader the plan misses | partly | `notices.ts tell` stamps `inputUnitOf(r)`; `lineStampOwed` requires it | named (§10 risk 4) and pinned (B-7); **the change is not K10's** — U2-hold files and a gate line: `[XFER]` (§12) |
| O7 | who builds D2835's bell door — KR-4 or K10-c | accepted | KR plan §12 head: "D2835 is the bell door's, KR-4" | §3.2, §6: K10-c owns `u`; KR-4 converts the order only |
| O8 | `letOpenOn`'s new return breaks the patch and F0 | accepted | the patch reads `let ?? unit` | §4.1: `letOpenOn` unchanged; `letReadOnly` a second export |
| O9 | H4 stated per man, `holderOf` per record | accepted | row 1c: listed by a newer record, the old one not carried | §7.1 H4 per record |
| O10 | Q1's wording; the demo's fixed "today" missing from the walk notes | accepted | `MedicalView` reads `keyToIso(TODAY)`; moves the clock | §9 (Q1 restated, every person with his role); §10 risk 9; §13 |
