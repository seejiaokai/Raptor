# The fresh, blind Opus read of [RALLY-PER-FORMATION] with [EDIT-BUTTON-AFTER-CHANGE] (19 Oct 26)

**Who reads:** one fresh Opus 5.5 that did not write this code and has not seen the chat that did (D790; no Fable — D903;
no ChatGPT reader while it is out — D761, so the job is on `[NO-ASTRA-LIST]`). READ-ONLY: change no file, run no build and
no browser test (another process may hold the machine's check lock); `git` and reading are fine.

**What to read:** the finished code — `git diff c4cad58e1..HEAD -- raptor-port/src raptor-port/e2e raptor-port/scripts/rulecheck.mjs`
on branch `claude/rally-box-mockup-452b95` — WITH the evidence sheet in hand: `raptor-port/docs/handpass/2026-10-19-rally-box.md`
(the roll-call §3, the sizing §5, the breaks §8), the scenario designer's list `raptor-port/docs/handpass/parts/rally-box/scenarios.md`,
and the walkers' reports `…/parts/rally-box/walker-A.md`, `walker-B.md`.

**The rulings — copied from their FULL rows** (`grep -h '^| D10\(26\|27\|28\|29\|30\|31\|32\|34\) |' .claude/decisions-full/*.md`,
and D505, D506, D503, D507, D509, D510, D591, D592, D45, D554, D1011 the same way). In short: each flying formation has its own
rally box R (D1026) — on the week R above B and TO above LD; on the Scheduler Board R · B · TO · LD in one line on a desktop,
stacked R over B and TO over LD where the pucks take their own row (D1029). The R box counts exactly as a typed rally did — the
earliest applicable in-time or rally starts the report for crew rest, OIL, the long day and work hours, where it is the man's
first event; an empty box's default counts only where no in-time or rally is entered (the nominal report, D592) — and a
change on a published day waits for the next amendment (D1032, D45). A typed line still saying RALLY stays a rally; a
whole-wave in-time is every formation's in-time (D1034). A suggested time (the brief's and the default rally) sits faint
inside its own empty box; one tap places it highlighted so typing replaces it (D1028, D1030); Escape takes a just-placed
one out, Tab fills nothing, View-only Sched still prints an empty brief's suggestion (the agent's readings, told to him
with the picture and not objected to). The default rally is the Logic page's existing "Nominal report before T/O",
renamed; "+ In-time" fills the same time (D1031, D510). The host's readings (questions, not requirements): the export and
the printed PDF carry the typed rally in a Rally column before Brief; a standby wave carries no rally; the wave header's
evening-before note keeps saying "In-time / Rally".

**WHAT IS NOT A FINDING (owner, D56):** a problem that lives ONLY in data already stored, when the code is correct going
forward — the demo data is cleared before the database. Do not report it.

**Read for ABSENCE as well as error:** a place that draws or reads a formation's times that the roll-call does not list;
an order of actions (tap, type, Escape, Tab, Enter, undo, redo, reload, publish, amend) whose result is wrong; a state the
press→focus placement (`interactions.ts SUG_PRESS`) or the button-press hold (`textedit.ts PRESSED`) mishandles — a
second press, two boxes, a window over the board, a press that is a drag, a member, a published day; anything a redraw
can tear out from under a held handler.

**A claim is a finding only with a concrete failure, its cause and its exact fix (D489).** Return ONE list: each finding
with severity (high / medium / low), the file and line, the failure in the app's terms (what a scheduler would see), the
cause, and the fix step by step. Then a short "Checked and fine" list. Under 2,000 words.
