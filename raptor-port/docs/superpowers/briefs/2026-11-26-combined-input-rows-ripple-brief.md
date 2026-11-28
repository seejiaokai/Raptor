# Brief — everything else the combined-row job touches across the app (chat 190, 26 Nov 26)

**For:** a fresh Fable (his call, 26 Nov 26: "go through everything else this change affects across the app"). A
read of the plan against the whole app, not a code review and not a walk. You change no project file.

## The change, as he has now ruled it

The plan `raptor-port/docs/superpowers/specs/2026-11-26-combined-input-rows.md` — read it whole, and the three earlier
reads it cites (`2026-11-26-combined-input-rows-fable-read.md`, `…-astra-read.md` in this folder; the Opus read is
condensed in the plan). His rulings, on `.claude/rules/decisions/scheduler.md` §Inputs on the schedule and the Leave War
page `.claude/rules/decisions/leave-war.md` §Not built yet; full rows by `grep -h '^| D2777 |' .claude/decisions-full/*.md`
(Git Bash — the Grep tool hides long rows): D2770–D2780. In short:
- a shared input is ONE row everywhere on the schedule, the Unavailable list included; a group leave stays one input;
  medical alone a row per man, a drop on it refused saying why (D2775–D2777);
- every input row takes drops as a sim row: a drop on a puck replaces that man, an extra empty place adds, nothing
  asked or noted on screen, leave included; the man told on his bell (D2772, D2779);
- a man added is on every day of a several-day input, a man taken off is off every day; other days or times = a
  separate input, no "separate him" button (D2770, D2771, D2780);
- a Personal Inputs line refuses a drop, pointing to its Ground Programme row (D2773); a man dragged from a seat onto
  an input leaves his seat as it was (D2774);
- on the Leave War a group leave changes as one: a man's box opens the input's own window, the change is for everyone,
  the box is marked shared; one man changed alone is taken off and given his own leave; the war never splits a man
  off by itself (D2778) — today it does.

## What to do

Go through the app surface by surface — use `raptor-port/docs/feature-impact.md` (read by section, as its head says) as
the map, and the code (`raptor-port/src`) to check — and list **everything this change reaches that the plan and the
three earlier reads do NOT already name**, and anything they name wrongly. For each: the surface or reader, what it does
today, what the change does to it, the consequence for a person if it is missed, and whether it needs his decision or is
the builder's. Include at least: the Leave War (its grid, counts, Approvals, bids, balances, OIL, its remark window, what
"marked shared" must look like), the warnings, OIL and OIL Earn, published days and amendments (one change waiting),
the bell and the notifications register, Undo and the change history, print and export, Insights and work hours, the
Inputs page and its calendar, SANS, the Tracker, another squadron's man (borrowed, Plan holders, a mid-input transfer),
posting out / archive / delete, ALL / ALL AVAIL, LATE, the waiting mark, the phone, keyboard reach, the saved data and the
database table list (`docs/data-schema.md`, `docs/data-model.md`).

Rank by consequence (OIL, the published record, who counts as away, saved data first). Mark each "already named by
<plan / Fable / Astra / Opus>" if you find it there after all — do not pad. Write the whole report with the Write tool to
the file named in your prompt.
