# Codex's guide — how Codex reviews and builds in this repo (D1556, 2 Nov 26)

**For Codex only; never loaded by itself.** `AGENTS.md` is Codex's door and names this file; it keeps the read-first
list, what Claude gets from its hooks, the hard limits and when you stop. The three passages below stood in `AGENTS.md`
until 2 Nov 26 and were moved here whole, byte for byte, by `backlog-archive.mjs --move` (D138): who does what now,
when you review, and when you build. **Read this file before any review or build.** Paths inside them are from the repo
root.

**Who does what now (D67, D590, D601).** Opus 5.5, in Claude Code, plans and builds. Codex is called as the REVIEWER:
Astra reviews what Opus wrote, and Sol 6.1 is the second reader where two are required (OIL, published records,
permissions, saved data, an important plan, a changed working guide); each reads independently and never reads the
other's report first. **Codex BUILDS only on his word, each time** — the job on hold is the SANS availability
calendar's new layout (`OUTSTANDING.md` `[SANS-CALENDAR-WIP]`, D610). For a build, follow his instruction for it and the
current rulings; what Codex writes, Opus 5.5 reviews, and the writer never approves its own artifact (D67). The
arrangement that ran until Monday 5 Oct 26 (D494, D496 — Codex planning and building by itself) is over; its text is
kept whole in `raptor-port/docs/archive/codex-arrangement-2026-10-07.md`.

## When you review

- Your brief names what to read; read the live files it points at, whole, and nothing of the other reader's.
- A claim is a finding only with a concrete failure, its cause and its exact fix (D489). A problem that lives only in
  data already stored is not a finding (D56).
- Read-only: change no file. You never review, inspect or approve an artifact your own model wrote (D67).

## When you build — only on his word

- For that job, take the builder's tasks. What Codex writes, Opus 5.5 reviews; the arrangement of 2–5 Oct 26 (D496)
  stays over. Keep every independent read the rules require: for high-consequence code Codex wrote, the checking order's
  §4a has Opus read it beside a fresh Codex inspector whose model did not write it. The writer never counts as a
  reader, and two Opus reads never count as two independent readers. Write every read still owed in your `HANDOFF.md`
  block and in the bug check's evidence sheet as `OWED: Claude's read`, naming the branch.
- The bug-check order (`raptor-port/docs/bug-check-order.md`) is yours to run in full EXCEPT those reads: state the
  tier, the roll-call, the sizing step (§7.0), the walk of the RUNNING app with pictures, the gates, the evidence
  sheet with its `Walk:` line. In Codex only, the proportional-checks addendum applies (D499,
  `raptor-port/docs/codex-review-workflow.md`).
- "A skill" (`.claude/skills/…`) is a Claude working guide. Read one as a document where a rule points at it; never
  edit one (D70 — a change to a working guide is read by both reviewers before he approves it). The skill
  observation log (`.claude/skill-observations/log.md`) is not yours to write.
- **No feature is designed until he says what it means.** Before building one, ask him — in rounds of at most four
  questions, each with your recommended answer; product choices only, the technical how is yours. Search the rulings
  first so you never ask what he has already ruled. Write a short design note under
  `raptor-port/docs/superpowers/specs/<date>-<name>.md`, linked from the backlog item; a visual change gets a
  picture first. The order of the feature batches is D495's (`OUTSTANDING.md` `[FEATURE-WISHLIST]`).

