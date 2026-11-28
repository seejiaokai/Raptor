# [OIL-LATER-PASSES-ON] — plan (chat 209, 27 Nov 26, Opus)

Branch `claude/oil-later-209`, cut from `main` at `2433c5e2a` (the end-time rule, pull request 858, merged). Records on
`claude/readings-lapse-fix-fdbb3c`. High risk: saved sign-offs and OIL.

## His rulings this builds
- **D2800:** Later on a day's OIL list means "not my call": each next press of any of the day's four sign-off boxes opens
  the list again until someone answers; an OIL answer does not clear the names already signed; Save with rows left
  unpicked leaves them as Later does.
- **D2801:** any OIL answer leaves the names already signed **on a day not yet published** — given on the sign-off list,
  on the input's own "OIL?" sign or from a bell line alike.
- **D2859:** the foot words — no answer picked: "Later: Ace signs, and the next sign-off asks again"; some picked (not
  all): "Save: the next sign-off asks the rest", in its place; on the last of the four boxes: "Later: Ace signs, and OIL
  stays unanswered for now"; Later pressed after picks still throws them away and saves nothing. (Ace = whoever is
  signing.) Every row picked → no line (Fable's words brief, `…/briefs/2026-11-27-oil-later-words-fable.md`, approved
  with it).
- Narrows D2294 ("Later asks no more that day", "the other three boxes then sign at once" go) and AM11 for an OIL answer.

## What the app does today (read in the code)
1. `ui/oilsign.ts` remembers, per day, the inputs that stood open when Later was pressed (`OILSIGN_LATER`, kept only while
   signed in) and stops asking about them; a Save with rows unpicked marks them the same way.
2. An OIL answer is written to the input (`r.oil[date]`). A signature is tied to the day's content (`engine/publish.ts`
   `currentBind`); one part of that is the OIL key (`engine/oilev.ts` `oilSignKey`), which carries each input's answer
   (`insSeg`, its last field). So any answer, from any place, changes the key and the names already given read empty.
3. The foot reads "Later: Ace signs, but nobody on it earns OIL."

## The change

### A. An OIL answer no longer moves a signature (D2800, D2801) — the engine, one place
- The signature's OIL key (`oilSignKey`) is built with the answer left out of each input's part: a new `insSegSign`
  (`insSeg` without its last field), used only by the signature key. The publication comparison (`oilEvidenceKey`) keeps
  the answer, so:
  - **a day not yet published:** an answer — on the list, the "OIL?" sign or a bell line, all of which write `r.oil` —
    leaves every name standing. One place covers all three doors (D2801).
  - **a published day:** an answer is a pending change (the comparison sees it — OIL11/OIL12 stand), and the pending
    axis of the signature (`pd`) still takes the names down, as D103 says. D2801 limits his rule to a day not yet
    published, so this is kept as it is.
  - Whether the day earns at all comes from the day (weekend or holiday), never from an answer, so nothing else in the
    key moves with an answer. The Logic-values axis (`orv`) is untouched.
- What a signature still promises: every other part of the OIL block — the inputs on the day, who is on them, their type,
  filing, standing, window, the scheduler's OIL switches. Only the answer is left out.
- Bindings stored before this build carry the old key and read unsigned once (demo data, D56 — not a finding).
- Comments rewritten: `currentBindNow`'s "an answer-only change would be publishable on a signature given before the
  answer moved" (now true on purpose before publishing — D2800); `oilSignKey`'s "a changed answer … invalidates".

### B. Later passes the question on (D2800) — `ui/oilsign.ts`
- `OILSIGN_LATER` goes (and its entry in `ui/pops.ts`'s session reset); `leaveOpen` goes; `signAsks` asks wherever the
  day's list has anything open (`oilOpenOn`), for someone the list is for.
- `writeHeld` becomes the plain write. Later writes the held name with no answer; Save writes the answers, then the name
  (the order stays: harmless now, and Undo's two steps keep their order).
- `resetOilSign` is removed and its callers updated (two test files).
- The file's head comment and `holdSave`'s comment rewritten to D2800.

### C. The foot words (D2859) — `ui/OilDayList.tsx` `footSaid`
- Held sign-off, nothing picked: "Later: {cs} signs, and the next sign-off asks again".
- Held, some picked but not all: "Save: the next sign-off asks the rest".
- Held, every row picked: no line.
- **The last box** — every other one of the four already signed and standing (`signRoleOk` on the other three roles of
  the held plan's day): nothing picked → "Later: {cs} signs, and OIL stays unanswered for now"; some picked → **no line**
  (the agent's reading: Fable offered "Save: the rest stays unanswered for now", which he was never shown; "the next
  sign-off asks the rest" would be untrue there. Put to him at his look, with its picture — question Q1.)
- No sign-off held: unchanged ("What is left goes to the schedulers' bells" where true).
- No full stop, as approved. The comment above the foot rewritten.

### D. What does not change
- ✕ and Escape sign nothing; the next press asks again (D2299).
- The end-time rule's refusals come first (signPick, writeSign — [END-TIME-GUARD]).
- The publish note still names an input left unanswered at publish and says nobody on it earns OIL (D2294, D81).
- A name taken out of a box asks nothing.

## Tests — a failing one first, each
New or rewritten in `ui/oilsign.test.tsx` (and an engine one in `engine/signbind.test.ts`):
1. Later, then each of the other three boxes asks again (replaces "ask no more that day").
2. CUR CK signs by Later; at SKED CK's press the list asks; Yes then Save → CUR CK's name still stands, SKED CK signed.
3. An answer given on the input's own window (`r.oil` through the inputs' batch) after two names are signed → both stand
   (D2801); the same on the bell line's path if it writes another way (it does not: one write, `r.oil`).
4. A published day with a pending change: two signed, an answer given → the names read empty (D2801's limit, D103).
5. Save with one of two picked → the next box asks the other; the first name stands after its answer.
6. Foot words: the three lines and the no-line cases, the last-box case with the other three signed.
7. Engine: `currentBind(di).oil` is the same before and after an answer; `oilEvidenceKey` differs (the comparison keeps
   the answer).
8. The existing "held re-pick" test's setup used an answer to drop a name — changed to a content change (a time moved).
9. `ui/timeguard-oil.test.tsx`: its "the day is not marked asked" wording — kept true, the marking gone.

## The bug check (to state the tier: FULL)
High risk (saved sign-offs, OIL). Roll-call: every place a sign-off box is drawn (the Scheduler Board day, Edit
Schedule's week, the phone board) and every door to an OIL answer (the list, the input window's "OIL?", the Inputs
page's decision, the bell line). Scenarios: Astra and a fresh Opus in Fable's seat (D2819 keeps Fable to words until 30
Nov — Fable's design owed); walk on PC and iPhone size; code reads: Astra and a fresh, blind Opus (Fable's code read owed,
D2864's shape); Fable reads the built words. Evidence sheet `raptor-port/docs/handpass/2026-11-27-oil-later.md`.

## Questions for him
- **Q1:** the last box with some rows picked — no line (built), or Fable's "Save: the rest stays unanswered for now"?
