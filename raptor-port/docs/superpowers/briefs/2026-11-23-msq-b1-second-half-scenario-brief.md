# Scenario-design brief — batch 1's second half of the multi-squadron build (the FULL bug check's walk)

**For:** Astra (GPT-6 Astra, the standing reviewer; a fresh Opus reader if Astra cannot run). **Job:** design the test
scenarios for a walk of the running app — hunt for what is MISSING. You did not build this; do not review the diff line
by line. Read only; change no file. **State each scenario in your output the moment it is settled, so a stopped run keeps
it.** **Written:** 23 Nov 26, the night's walk chat. **Branch:** `claude/msq-b1-screens-135` (exported copy of
`74f0d8138`), the app under `raptor-port/`. This copy has the builders' notes, reports and evidence sheets taken out on
purpose — do not look for them.

## The promise — where it is written (read these; full rows by `grep -h '^| D2310 |' .claude/decisions-full/*.md`)

- The plan: `raptor-port/docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md` — §0 the ground rules, §2–§8 the
  steps A–G, §15 and §16 (they win over earlier sections), the owner's answers at the foot of §16 (D2317–D2326).
- The rulings page: `.claude/rules/decisions/people-accounts.md` §"Many squadrons and aircraft types" — D2191, D2192,
  D2197–D2203, D2205, D2211, D2241, D2250, D2252, D2253, D2298, D2300–D2311, D2317–D2326, D2335, D2336; and D785
  (a scheduler is always an admin), D148 / D350 (Undo steps back one's own changes only; adding a person, archive,
  restore, delete and a posting stay outside Undo), D2119 (a move counts from the next day), D2132 (one squadron: no menu
  arrow). Copy a ruling's words from its FULL row before an EXPECTED line rests on it.
- The approved drawings: `raptor-port/docs/mock/2026-11-22-msq-b1-screens/page.html` (pictures M1, M2, R1–R5, 1, 2,
  3a–3e, 4, 6a–6c, 7a–7d, 8a–8c, 9a–9b, 10, f1a–f10). The drawn words are the spec, with D2306's five wordings.
- **The host's readings (questions, not requirements):** a pick is navigation and writes no Undo step; a View holder of
  149 with 149 picked sees View-only Sched, Logic read only, and his OWN squadron's Inputs, Quals, Leave War, Tracker and
  Admin → Users; the Tracker stays bound to the squadron it first opened with until sign-out (D2318's four cases).

## What was built (so you know where to aim, not what to trust)

The pick: `src/state/store.ts enterSquadron`, `src/state/perms.ts readableUnits`, `pickStandsOn`, `pageUnit`,
`adminOfPage`, `maySchedEditPage`; the menu `src/ui/SquadronMenu.tsx` from `src/ui/topbits.tsx`. Edit rights by
squadron: the inventory in `raptor-port/docs/data-schema.md` §Edit rights by squadron and its guard test
`src/state/edit-rights-readers.test.ts`. Admin → Users: `src/ui/UsersPanel.tsx`, `src/ui/useraccess-model.ts`,
`src/ui/rolestable.ts`, the door `src/state/accounts.ts saveAccess` (command `account.access`). Request access:
`src/ui/AccessScreen.tsx`, `requestsFor`. Admin → Squadrons: `src/ui/SquadronsPanel.tsx`, `src/state/units.ts`. The
bell: `src/state/notices.ts noticeLive`, `src/state/bellsqn.ts`, `src/state/belltap.ts`, the own-account (`acct`) lines,
the posting-failed line (`posting.failed`). Sign-in wait: `src/ui/Login.tsx`, `src/ui/logout.ts`. The gate:
`src/state/perms.ts`. Test world: `src/test-support/msq-world.ts` (142 and 149, five sign-ins: Saber master admin of 142,
Hunter 142 admin, Ranger 142 member, Kestrel 149 admin, Osprey 149 member).

## The finder wording — do this

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.

Aim above all at: (1) an edit control on any page that a View holder of 149, with 149 picked, can still press — Edit
Schedule, the board's drags and its edit mode, View-only Sched, Logic, the day / wave / duty templates, saved plans,
the changes window, the planning calendar, Admin → Squadron config, Admin → Data's clears, the Inputs / SANS / Calendar
settings windows; (2) a page that keeps showing the OLD squadron after a pick, or a window left open across a pick;
(3) the one-Save access row — every combination of role, master mark and squadron lines in one Save, and its Undo / Redo;
(4) who sees which bell line and request, as rights are given and taken with the bell open; (5) "+ New squadron" and
places / time zones with two and eight squadrons, and Undo of each; (6) the phone (402 wide, WebKit) — menus, sheets,
rows that must fit.

Include a plain-user round: each of the five sign-ins doing his everyday tasks start to finish after a pick — open the
Schedules menu, pick, open every tab, open and close every window, go back — and every other place that should show the
result (the board's title, the top bar, Admin → Users, the bell, the Tracker, prints and exports). And one scenario per
thing that can make an access, a request or a bell line appear, change or vanish besides the press itself: a reload, a
sign-out and in, midnight, Undo and Redo, a move, an archive, a posting, the member view and back.

## What is NOT a finding

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. A scheduler is always an admin
(D785): no scenario sets up a scheduler who is not one.

## What to hand back

A ranked list of scenarios (setup · action · expected, with the ruling it comes from · what would disprove it) —
written for a walker who presses real controls in the production build at 1536×864 and 402×874; a roll-call of surfaces
you believe draw a squadron's number, a person's access, a bell line, the Edit Schedule tab or an edit control a View
holder could reach; explicit negatives ("I checked X and found nothing"); and for any claim that the code is wrong: the
exact input and the exact, step-by-step fix — each claim will be written as a failing test before it is believed. You
cannot run the app; name the exact case you would run and the host runs it. Keep it to the 40 strongest scenarios.
