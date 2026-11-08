# Chat 29 — the code read's brief (the same for Astra and the fresh Opus reader, each blind to the other)

**You are reading finished code, read-only.** Change no file, commit nothing, push nothing. You have not seen, and must
not look for, the walk's evidence sheet, its pictures or another reader's report. Return one report.

**The change:** `git diff d8d5b1f57 7c1a13e9f` on branch `claude/chat29-inputs-medical` (pull request 707) in
`C:\Users\User\projects\Raptor\.claude\worktrees\pictures-round-57c55c` — read the diff and the files around it. The app is
`raptor-port/` (React + TypeScript, a squadron scheduling app). Behaviour must not change except item 1.

1. **[MED-ROOM-DRAGGED]** (`raptor-port/OUTSTANDING.md` — search it): on a desktop the Medical tab's cards make room at
   the right for the input window (owner D1300). A window he has dragged keeps its place for the session, so the room
   must be made only while the window stands where it opens — as the Inputs list's room already is since pull request
   676 (`src/ui/scheduler/06-inputs.css`, `:not([data-placed])`). Changed: `src/ui/scheduler/16-medical.css`; test
   `e2e/medical.spec.ts` ("[MED-ROOM-DRAGGED]").
2. **[INP-ROOM-TIDY]**: the window's width and the room it gets, once (`--inpwin-w`, `--inpwin-room`,
   `src/ui/scheduler/25-inputs-calendar.css`), read by `06-inputs.css` and `16-medical.css`; the calendar's expand
   button lost a font size and line height that styled a typed mark it no longer has.
3. **React Doctor findings, fixed or kept with a written reason in a disable comment (the owner's D1534, D1572), behaviour
   unchanged:** `src/ui/CutFields.tsx` (helpers moved whole to the new `src/ui/cutdraft.ts`; callers
   `InputsSettings.tsx`, `SansSettings.tsx`); `src/ui/TypeLegend.tsx` (an effect that closed the card when `shut` changed
   is now a state change during render, with the last `shut` remembered); `src/ui/DateCal.tsx` (the month-and-year
   wheel's re-centre moved from its layout effect into the render; the component's complexity kept with a reason);
   `src/ui/MedicalView.tsx` (complexity and "not a `<dialog>`" kept with reasons).

**Read first:** `.claude/rules/decisions/inputs.md` (D1300, D1787, D1841, D977, D997), `.claude/rules/decisions/design.md`,
and for any ruling's detail its full row: `grep -h '^| D1300 |' .claude/decisions-full/*.md`. The date calendar is the
app's one (D796, D797, D800, D1562) and is drawn in many places: `WeekCal.tsx`, `DateBox.tsx` (every date box, and the
Inputs/SANS calendars' month title in `mode="month"`), `RangeCal.tsx`, `leavewar/ui/RangePicker.tsx`, `OilConfirm.tsx`,
`AdminPage.tsx`.

**What to look for — what is MISSING, not only what is wrong:** a place or a state the change does not cover (another
surface with the same room, a window that can be placed by something other than a drag, a re-centre or close that now
happens at a different moment, a render loop, a case where `data-placed` is set on a phone or on a resize, a stylesheet
whose custom property is read where `:root` does not reach, a disable comment whose reason is untrue). Any claim of
"behaviour unchanged" that you can break with a concrete sequence of presses is a finding.

**A finding is one only with:** a concrete failure (what a person does, what the screen then shows), its cause in the
code, and an exact, step-by-step fix (the owner's rule: a reviewer whose findings Opus will fix gives a precise fix).

**Not a finding:** a problem that lives only in data already stored while the code is correct going forward — the whole
store is demo data, cleared before the database step (D56). A scheduler who is not an admin — every scheduler is an admin
(D785). The rules engine (`src/engine/`) is not in this change.

**End with a tidiness note** (D489 — filed, not fixed; never the rules engine): three questions of the changed lines only —
(1) anything left only for an older way of doing it, (2) avoidable duplication, (3) a comment that is no longer true.
