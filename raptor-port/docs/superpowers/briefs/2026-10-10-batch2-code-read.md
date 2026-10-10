# Brief — read the code of "the second batch of the Inputs pages" (one reader; read-only)

**You are the code reader of a bug check** (owner D67, D590: what Opus built, Astra reads). The batch is BUILT, WALKED
and committed on `claude/day-window-compact`. Change no file; run nothing. Read the finished code with the evidence
sheet in hand, and say what is WRONG and — above all — what is MISSING.

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## The change
`git diff 49e3d579..HEAD -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts` (49e3d579 is the commit
before the batch). What it is meant to do, piece by piece: `raptor-port/docs/ui-contracts.md` — search "THE SMALL
CHOICES OF THE INPUTS PAGES, AS BUILT". His answers, exactly: `grep -h '^| D731 |' .claude/decisions-full/*.md`.

## Read with these in hand
- The evidence sheet: `raptor-port/docs/handpass/2026-10-10-batch2-check.md` — §1 (why the tier is WALK and what was
  done beyond it), **§2 the roll-call — check it for gaps: a place that draws the thing and is in no row**, §4 (what
  the walk did), §6 (what was NOT walked).
- Your own scenario list: `raptor-port/docs/superpowers/briefs/2026-10-10-batch2-scenarios-astra.md`. Two of its
  scenarios were real gaps and are fixed (16: Escape on a new note's "+ people"; 21: a dates calendar left open on a
  hidden List swallowed Escape). The sheet's §4.2 says what was done with each of the forty.
- The rulings: `.claude/rules/decisions/scheduler.md` (D731 at its head; D654–D660, D681–D682 the group input and its
  OIL question; D700–D714; D715–D729; D641 windows; D683–D695 the opened day), `.claude/rules/decisions/oil.md`,
  `.claude/rules/decisions/how-we-work.md` (D56, D487, D489, D726), `.claude/rules/decisions/people-accounts.md`,
  `.claude/rules/raptor-executor.md`. A ruling's full row: `grep -h '^| D682 |' .claude/decisions-full/*.md`.

## Where I most want your eyes
1. **`raptor-port/src/ui/inputedit.tsx` — `madeOver`** (the effect "THE RECORD BEHIND THE WINDOW"): when does a field
   count as in dispute now? Walk every path: he has not touched it; touched then theirs moves; "Keep mine"; "Take
   theirs"; both make the same change; a re-seed; `datesPicked`; the new `redraw`. Can a real conflict now be HIDDEN
   (a Save writing over a change he was never shown), or can the effect loop?
2. **`oilSummaryOf` and `anyAnswered`** — the entry's OIL line and its ONE button. With `oilRows`, is there any state
   in which a question nobody may answer is offered, or one that must be answered has no button (a shared input whose
   first record is unanswered while another is answered; a reader; a man in it; one man left after "Take me out")?
   Is the heading computed at the sheet (`grouped && ppl.length > 1`) ever the group's when the answer is written for
   ONE record, or one man's when it is written for all (`own`, `saveOwnOil`, `doSave` → `commitGroup`)?
3. **`state/perms.ts filerSwitchedOff`** — it must decide NO right. Is it called anywhere before the real rule has
   refused? Can it answer true for someone who CAN act (an admin in member view; a member whose own input it is)?
4. **`ui/InputsPage.tsx`** — the dates calendar's listeners (`window` capture for Escape; `pointerdown` beside
   `mousedown`): what else on the page relied on that Escape or that press? The row's click guard lost its
   `.inact > span` clause now that the chips are buttons — is anything else in that cell still a span that must not
   open the row?
5. **`ui/InputsCal.tsx` — `noteGone`**: a ref set by Escape and cleared when a box next opens. Any order in which a
   genuine blur is swallowed (a note NOT saved that should have been), or a cancelled one written?
6. **`ui/toast.ts placeToast`** and its call from `FloatWindow.tsx`'s mount effect — a cycle of imports, a note moved
   at a wrong moment, a test environment with no `matchMedia`.
7. **`ui/interactions.ts`** — `was` is read before the write: is `inp.acc` what it was, on every branch?
8. **The styles** (`06-inputs.css`, `16-medical.css`, `24-sans-calendar.css`): a rule that reaches further than its
   comment says (the `.inact>button` reset; `#inRangePop` ids at 700px and at 600px tall; the viewer's sticky foot on
   a phone, where `.airpop-box` may be laid out differently).

## The form of the answer
Findings, most serious first. **A claim is a finding only with a concrete failure — the steps or the state, what
happens, what should — its cause in the code (file and function), and its exact fix, step by step** (D489). Say for
each whether it is IN this batch's change or OLDER code this batch made more reachable or left as it was. Then
**explicit negatives**: what you checked and found sound, by name — a confident "nothing found" on a named path is as
useful to me as a finding.

## NOT a finding (owner D56)
> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database
> step. **Do not report a problem whose harm exists only in data already stored when the code is already correct
> going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it
> again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**Not open — his choices:** every answer of D731 as built and as the sheet's §0 reads it (the note at the top only for
the shell's windows on a phone; the dates calendar staying open; the stale OIL answer staying on the record; "Take me
out" offered to a filer who is one of the input's people; several picked days opening the window at once); D487 (no
button changes size but the List calendar's days on a phone); D726 (no words beyond those ruled); list C of
`[SEEN-BATCH-2]` (a phone on its side, and the rest filed there).
