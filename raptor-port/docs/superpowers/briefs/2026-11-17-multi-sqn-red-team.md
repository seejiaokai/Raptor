# Red team of the squadrons and detachments design — the brief (chat 97, 17 Nov 26)

The same brief goes to two readers, blind to each other (D1760, D1770): Astra (Codex) first seat, a fresh Opus reader
second. READ ONLY: change no file in the repo, commit nothing. Write your whole report to the path you are given.

## What you are reading

A DESIGN, not code: how one app serves two squadrons (142 and 149, one aircraft type, one database) and their
detachments. Nothing of it is built; it is built last, at the database step (Power Apps code app on Dataverse). The
owner (a scheduler, not technical) has ruled on it in five rounds. Your job is to find what is wrong or missing
BEFORE the next round of questions goes to him.

Read, in this order:
1. The design note: `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md` — whole.
2. The rulings D2087–D2138 (D2118 is archived, replaced by D2122). Short lines: `.claude/rules/decisions/scheduler.md`
   and `.claude/rules/decisions/people-accounts.md` (search for "D20" and "D21"). Full rows, with his words:
   `grep -h '^| D2101 |' .claude/decisions-full/*.md` (use the shell; a full row is one long line). Also the older
   rulings the design builds on: D281, D282, D288, D289, D296, D1100, D1101, D1695, D303, D2136 (Post out's "Transfer
   to Sqn").
3. The pictures pages, for what was drawn: `raptor-port/docs/mock/2026-11-16-multi-sqn-r2/`, `…-r1/`,
   `2026-11-17-multi-sqn-r3/`, `…-r4/`, `…-r5/` (each a `page.html`; pictures under `raptor-port/docs/img/`).
4. How the app works today, to judge the ripples — by section, never whole if long:
   `raptor-port/docs/engine-rules.md` (validation, the rule families, publishing / amendments (AL), signatures),
   `raptor-port/docs/feature-impact.md` (which surfaces a change touches), `raptor-port/docs/data-model.md`
   (§Squadrons and §11 permissions), `raptor-port/docs/undo-contract.md`, `raptor-port/docs/notifications-register.md`,
   and the area rulings `.claude/rules/decisions/oil.md`, `leave-war.md`, `tracker.md`, `inputs.md`. The engine source
   is `raptor-port/src/engine/` (`validate.ts` is the heart, `publish.ts` the amendments); the Leave War is
   `raptor-port/src/leavewar/`, the Tracker `raptor-port/src/tracker/`. Read code only to check how a rule works today.

## What to look for

1. **Loopholes** — a way a user (scheduler, member, admin of either squadron, master admin) can do something the rulings
   forbid, or reach a state no ruling covers: a man planned at two places, a man on a detachment still planned at home,
   a line nobody can change or everybody can, a published record that changes without an amendment, OIL counted twice
   or lost, a schedule signed by the wrong squadron, someone seeing or editing what they should not.
2. **Design faults** — two rulings that contradict each other; a rule that cannot be enforced on the platform as the
   note describes it (no server code but scheduled flows; the app's own rules are the only guard; one production
   environment); a flow that breaks when two schedulers edit at once; dates and time zones; what happens at midnight,
   on the transfer date, on a detachment's first and last day, when a detachment closes early, when 149's place moves.
3. **What is overlooked** — a question the design never answers that the build will hit.
4. **Every part of the app read across two schedules** — take each in turn and say how it behaves when a man, a line
   or a wave belongs to the other squadron, or when he moves squadron or place mid-week:
   - the rules engine: every rule family in `engine-rules.md` — crew rest (D2122/D2123), double booking, briefs,
     qualifications and currencies, duty limits, sims, ground events, ALL AVAIL (D2097), the late-input mark, the
     day's count (D2096), whose Logic settings judge (D2109);
   - OIL (earned on the other squadron's schedule; one published version as the truth; amending a man off a day);
   - amendments and publishing: a line in the other squadron's wave, the pending count, AL numbering per day, D2107's
     late pick as a pending change, D2121/D2124's grey line, an amendment to 149's wave that changes a 142 man's day;
   - Insights (work hours, counts) — whose numbers include whom;
   - the Leave War: a borrowed man, a detachment man, the transfer (D2136) — his leave, OIL balance, bids, months,
     manning counts, SANS;
   - the Tracker: a student flying on the other squadron's schedule; a transferred student mid-course;
   - Inputs (D2101 the detachment choice, D2131 several men at once, the Attach row D2098), Undo (D148, D350),
     the bell, Admin → Users and Admin → Squadrons, print and export, the database step.
5. **D2136, the transfer** — what he should carry across, what stays, what must be refused or asked: open inputs,
   future seats on either schedule, his quals and currencies, his Tracker course, Leave War balances and bids, his
   account and roles, the callsign in the other squadron (unique within the community, D288), an Undo of the posting.

## How to write each finding

A finding counts only with all four: **the concrete failure** — a named case (who, which day, which squadron, what
he presses) and what goes wrong on screen or in the record; **its cause** — which ruling or section of the note, by
D-number; **the fix** — exact, step by step, written so the owner could choose it (if it is his product choice, give
the options and your recommendation); **its weight** — HIGH (wrong published record, wrong OIL, lost data, someone
editing what they must not), MEDIUM (a check that misses or a confusing screen), LOW.

Put the findings in order, HIGH first, numbered. Then a short section "Questions the design never answers", each one
line with your recommended answer. Then the D2136 section. Keep it to what matters; no padding.

## What is not a finding

- A problem that lives only in data already stored — the whole store is demo data, cleared before the database step
  (D56) — unless new data would be hurt too.
- A choice the owner has already ruled on, merely because you would choose differently — unless it contradicts another
  ruling or produces a concrete failure; then say which.
- A question already answered: search the rulings (`.claude/decisions-full/`, `DECISIONS-ARCHIVE.md`) and the backlog
  (`OUTSTANDING.md`) before calling something missing.
- Code style, or anything about code not yet written.
- Words: the owner's names and his writing style are settled. Never use the squadron or service abbreviation; the bare
  squadron number only.
