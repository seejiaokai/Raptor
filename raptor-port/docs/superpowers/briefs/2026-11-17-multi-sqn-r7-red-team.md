# Red team of the whole two-squadron design, round 7 — the brief (chat 101, 17 Nov 26)

The owner's call (chat 100): "the codex review is this multi sqn design" — Astra (Codex) first seat, a fresh, blind Opus
reader second (D1760, D1770), blind to each other, one brief. READ ONLY: change no file except your own report, commit
nothing. Write your whole report to the path you are given.

## What you are reading

A DESIGN, not code: how one app serves two squadrons (142 and 149, one aircraft type, one database) and their
detachments. Nothing of it is built; it is built at the database step (Power Apps code app on Dataverse: no server code
but scheduled flows; the app's own rules are the only guard). The owner (a scheduler, not technical) has ruled on it in
six rounds; three readers (Astra, an Opus reader, Fable) red-teamed it once already, and their findings stand on the
round 6 page. **Your job: the whole design as it now stands — what is still wrong or missing — not a repeat of
what the earlier readers found.**

Read, in this order:
1. The design note, whole: `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md`.
2. The round 6 page — `raptor-port/docs/mock/2026-11-17-multi-sqn-r6/page.html`: every open call with its
   recommendation. **Treat each recommendation there as the design** (the owner has not answered them yet; most will
   stand). Settled items are listed at its foot.
3. The rulings D2087–D2149 and D2159 (D2118 archived, replaced by D2122): short lines in
   `.claude/rules/decisions/scheduler.md` and `people-accounts.md`; full rows with his words by the shell:
   `grep -h '^| D2146 |' .claude/decisions-full/*.md`. Also the older rulings the design builds on: D148, D212, D281,
   D282, D288, D289, D296, D303, D306, D328, D350, D785, D1100, D1101, D1374, D1541, D1695, D1751, D2136.
4. The earlier reports, to avoid repeating them: `raptor-port/docs/superpowers/briefs/2026-11-17-multi-sqn-red-team-*.md`
   (`-astra`, `-opus`, `-fable.report`).
5. How the app works today, by section, never whole if long: `raptor-port/docs/engine-rules.md`, `feature-impact.md`,
   `data-model.md` (§Squadrons, §11 permissions), `undo-contract.md`, `notifications-register.md`,
   `handover-dataverse.md`; the area rulings `.claude/rules/decisions/oil.md`, `leave-war.md`, `tracker.md`,
   `inputs.md`, `design.md`. The code: `raptor-port/src/` (engine `src/engine/` — `validate.ts`, `publish.ts`; Leave
   War `src/leavewar/`; Tracker `src/tracker/`). Open code to check how a rule works today, and name it.

## What to look for — each with a recommendation

1. **Design** — two rulings or recommendations that contradict each other; a rule the platform cannot enforce as
   written; a screen whose words do not say what will happen.
2. **Flow** — walk the everyday tasks end to end across the two squadrons and a detachment: borrowing a man, a shared
   wave, publishing and amending, a detachment from opening to Close, a transfer set months ahead, his own phone view.
   Where does a person get stuck, surprised, or not told?
3. **The functions further on that are affected** — every part of the app read across two schedules: the rules engine
   (every rule family), OIL, amendments and sign-offs, Insights and work hours, the Leave War and SANS, the Tracker,
   quals and currencies, inputs (DET, D2146; the automatic "ACADEMICS · 149" row, D2149), Undo, the bell, Admin →
   Users and Admin → Squadrons, print and export, the database step's tables.
4. **Rules** — what a new ruling here breaks in an older one (D201): name both.
5. **Bugs and loopholes** — a way a user (member, scheduler, admin of either squadron, master admin) reaches a state no
   ruling covers: a man at two places, a published record changing without an amendment, OIL counted twice or lost,
   someone seeing or editing what they must not, a line nobody (or everybody) can change.
6. **Dates and time** — midnight, the transfer date, a detachment's first and last day, an early Close, a place move.

## How to write each finding

All four or it is not a finding: **the concrete failure** — a named case (who, which day, which squadron, what he
presses) and what goes wrong on screen or in the record; **its cause** — the ruling or recommendation by number; **the
fix** — exact, step by step, with your recommendation and the other choice where it is his product call; **its
weight** — HIGH (wrong published record, wrong OIL, lost data, someone editing what they must not), MEDIUM (a check that
misses, a confusing screen), LOW. A claim about today's app names the file you opened; otherwise mark it "unchecked".

HIGH first, numbered. Then "Questions the design never answers", one line each with your recommended answer. No padding.

## What is not a finding

- A problem only in data already stored — demo data, cleared before the database step (D56) — unless new data would be
  hurt too.
- A choice he has ruled on, merely because you would choose differently — unless it contradicts another ruling or makes
  a concrete failure; then say which.
- A finding already on the round 6 page or in the earlier reports — unless you show its recommended fix is itself wrong.
- A question already answered: search `.claude/decisions-full/`, `DECISIONS-ARCHIVE.md`, `OUTSTANDING.md` first.
- Code style; code not yet written. Words: the bare squadron number only, never the squadron or service abbreviation.

## Blind

Do not open any file named `*r7-red-team-*` or `*det-check-*` other than this brief — other readers are writing them now.
