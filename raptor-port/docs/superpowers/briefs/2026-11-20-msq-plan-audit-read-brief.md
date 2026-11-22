# [MSQ-PLAN-AUDIT] — the blind read for places the roll-call missed (chat 126, 20 Nov 26)

**Who reads:** Astra (GPT-6 Astra) and a fresh Opus reader, each blind to the other — neither sees the other's report
until both exist. Each reads an exported copy of the branch `claude/multi-sqn-b1-107` at the commit named in its run's
head, holding the host's roll-call (below) and no other reader's report. If a handoff block is pasted into your chat
after a compaction, do not read it, and say so in your report.

## The promise under test (his D2242, 20 Nov 26 — full row: `grep -h '^| D2242 |' .claude/decisions-full/*.md`)

*"I think u should also have a dedicated run to check if u did missed out the development of admin plan so far. It's
concerning. I want u to make sure u check the work and the bugs u might have missed out."* — every place in the
many-squadron work (the app, the reshape plan, the documents, the drawings) that leaves out, or wrongly lets in, an admin
holding Plan of a squadron.

The rulings (each copied from its full row; open the row before relying on its detail — `grep -h '^| D2201 |'
.claude/decisions-full/*.md`):
- **D2201 (18 Nov 26):** "An admin a master admin gives 'Plan' of another squadron has full access to it, everything
  149's own admins have — every page, each his to edit, its settings and Admin → Users among them." The agent's readings
  told to him: Plan is given and taken by a master admin only (D2199); he may make a 149 man an admin of 149; a squadron
  picked in the "Schedules" menu moves every page to it, as for a master admin (D2197); his own inputs and leave stay
  filed in his primary (D1695).
- **D2211 (19 Nov 26):** the Plan line on his Admin → Users row reads "Full access to 149, every page: its schedule and
  publishing, its settings, its people and their sign-ins."
- **D2241 (20 Nov 26):** "Wherever a master admin may act for a squadron, an admin holding Plan of that squadron may too —
  in what the app allows, in its words and in what is written for him — and both are named, never the master admin
  alone."
- **D2240 (20 Nov 26):** the role is always called "master admin" on screen and in what is written for him, never
  "master" alone.
- **Kept out on purpose:** giving or taking Plan (D2199, D2211); making a squadron and making a master admin (D2191);
  changing a master admin's account (D2205); the last-admin count where a squadron has admins at home (the host's reading,
  told to him — reshape plan §5.2). **D2202:** a Plan holder's bell carries that squadron's admin lines, on by default,
  each line showing which squadron it is from (drawn first, not built). **D2198:** a master admin's bell carries his own
  squadron's lines by default, others off. **D2203, D2243 Q4:** a man's move ends his View and Plan of other squadrons, at
  the start of his move day. **D2191:** a View holder sees the other squadron's schedule pages and Logic read only, never
  its bell, never acts.

## What you are given

- The code under `raptor-port/src` (`state/units-model.ts levelFrom` is the one level answer: a master admin, a home
  admin and a Plan holder — a grant of level `admin` — all read as `'admin'`).
- The host's roll-call: `raptor-port/docs/superpowers/briefs/2026-11-20-msq-plan-audit-rollcall-{gate,doors,bell-war}.md`
  (the code, by three Opus helpers, checked by the host) and the evidence sheet
  `raptor-port/docs/handpass/2026-11-20-msq-plan-audit.md` §The roll-call (the plan, documents and drawings).
- The reshape plan `raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md` (to be built next; the host's
  first pass for D2241 is in it), the rest-pieces map `…/plans/2026-11-19-multi-sqn-b1-rest-files.md`, the data model
  `raptor-port/docs/data-model.md` §11, and the drawings `raptor-port/docs/mock/2026-11-19-multi-sqn-pieces/`,
  `…/2026-11-20-multi-sqn-reshape/`.
- You run read-only and cannot run the app. Name the exact input you would run for each claim; the host runs it.

## The job

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

Here that means: **find the places the roll-call missed** — a door, a gate section, a list, a bell audience, a page's
squadron, an on-screen sentence, a plan rule, a document line or a drawing that decides who may act for, see, or be
told about a squadron, and that leaves out an admin with Plan of it where a master admin or its home admin is let in, or
lets in someone it must not (an admin of another squadron with no Plan, a View holder acting, a Plan holder doing a
must-not, a right that outlives its man's move). Then check the roll-call's own verdicts: a row marked HAS IT or MUST
NOT that is wrong is a finding too.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. And a scheduler is always an admin
(D785): a finding that needs a scheduler who is not an admin is not a finding.

For each finding: file and line, the ruling it breaks (quoted from its row), a concrete failure with the seeded people
(Saber the master admin, 142; Hunter `acad2` 142's admin, holding Plan of 149; Kestrel `acad9` 149's admin; Osprey
`acus9` 149's member; Ranger `acus` 142's member), and **exact, step-by-step fix instructions**. State each finding in
your output the moment you confirm it, so a stopped run keeps it. Give **explicit negatives**: each area you checked and
found nothing ("I checked X and found nothing"). Any proof test you write goes in your own scratch folder, never under
`raptor-port/src`. Edit no file of the repo.
