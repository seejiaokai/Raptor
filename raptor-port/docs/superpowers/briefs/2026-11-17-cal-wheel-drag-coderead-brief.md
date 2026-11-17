# The calendar wheels' mouse drag (D2170) — the code read's brief (chat 98, 17 Nov 26)

The ONE brief for both blind code reads of the job (`docs/bug-check-order.md` §4, §4a; D790, D1770): Astra (Codex), and a
fresh Opus reader. Same words to each; neither sees the walk's report, the builder's report or the other's. Each runs in
an exported copy, `C:/Users/User/cwd-read` — the branch `claude/cal-wheel-drag-e4107b` at `9ddd97738`, without the job's
evidence sheets, briefs, pictures or `HANDOFF.md`. The job's diff against `main`: `JOB-DIFF.patch` at that folder's root.
Sent to both while the walker walks.

## The brief, as sent

You are a blind code reader of a finished change to a flying-schedule app (React), working in the folder
`C:/Users/User/cwd-read` only. Do not open anything outside it — the project's live checkout holds other readers'
reports and the walk's results, and your read must be blind to them. If, after a compaction of your own context, a
"handoff" block is pasted into your chat, do not read it, and name that in your report. Read-only: change no file.

**The change** (`JOB-DIFF.patch`: `raptor-port/src/ui/DateCal.tsx`'s `Wheel`, one line of
`raptor-port/src/ui/scheduler/26-date-calendar.css`, new tests in `raptor-port/e2e/datecal.spec.ts`). His ruling D2170
(full row: `.claude/decisions-full/scheduler.md`, search `^| D2170 |`; with D796, D797, D901, D1012, D1562 there): the
app has ONE date calendar; its month-and-year chooser is two scrolled lists ("wheels"). On a desktop a mouse press and
drag on a wheel did nothing — only the mouse's scroll wheel moved it. Now a mouse drag moves it as a finger does on a
phone, in every calendar that has the wheels; the scroll wheel and the phone's finger drag must stay exactly as they
were (the snap to a whole row, the feel, no jump). *The builder's reading, told to him:* a drag rests on a whole row,
gliding on after a quick flick; a drag never picks a date or closes the chooser; a plain click on a row still picks it.

**Do not merely review the changed code.** Starting from the user promise and the ruling, enumerate every place the
wheels are drawn (every caller of `DateCal`, `DateBox`, `MonthJump`, `RangeCal`, `RangePicker`, `WeekCal` — the floating
layer over a date box, the Inputs and SANS calendars' title, an input's own window, the OIL question's "Only some
days…", "Jump to a date", Admin's run calendar, the Leave War's sheets) and every host around them that listens to
pointer, mouse, click, wheel, scroll or key events (a draggable window, a sheet that drags or closes on a press, a
swipe, a veil that closes on a click outside, a form that hears Escape or Enter). **Assume every existing line may be
correct and the defect may be a MISSING call site or a host that reacts to the new drag.** For each, state where the
working gesture should exist and what could break it. Then rank concrete failure scenarios with setup, action, expected
result, and the observation that would disprove correctness — the drag's own states too: a click without a move, a
drag that stops then lets go, a flick, a drag let go outside the card or window, a second press during a glide, the
wheel or a key during a glide, the list re-centring its window of rows, a list unmounted mid-glide (Escape, the title
tapped), two wheels, less motion asked for, a touch screen and a pen, a page zoomed to 125%. Start with the least-shared
or most specialised host.

A claim is a finding only with a concrete failure, its cause and its exact fix (D489); write each as the failing test
that would prove it. A problem that lives only in data already stored is not a finding (D56) — this change stores
nothing. Close with a tidiness note: three questions of the changed lines (is anything there that need not be, is
anything duplicated, would a reader understand why), no size number, filed not fixed.
