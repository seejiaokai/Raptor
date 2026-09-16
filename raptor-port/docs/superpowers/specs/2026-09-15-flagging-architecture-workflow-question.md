# Flagging architecture — a WORKFLOW-level design question (red-team)

**Not a build plan.** Before committing to the "two-world" mechanism (see
`2026-09-15-crewrest-on-published-flagging-plan.md` + its review log), the owner
wants a step back: **what flagging architecture makes the most sense on a
WORKFLOW basis** — reasoning from how the squadron actually works, NOT from
engineering effort. Judge the pros/cons of "more of something vs less of
something" (more truths vs fewer; more coupling vs less; more flags vs fewer;
more audiences vs one).

Reason from the users and their decisions, not the code you'd write.

## The app (context)

A squadron flying-schedule planner. A day is planned (draft), then **published**
(signed, immutable) and amended via ALs. No server; per-browser. A rules engine
flags crew rest (incl. cross-day / past-midnight), a 7-day max-consecutive-work
rule, timing conflicts, missing briefs, quals, etc.

**Verified facts:**
- The rules engine runs over the LIVE working copy and has no publish gating.
- Today a **published** day renders a byte-frozen face that HIDES all flags; a
  draft day shows them. The owner wants published days to show flags again.
- **Leave War (a separate module) already reads the PUBLISHED schedule** to
  credit OIL (off-in-lieu) — via an issued-snapshot resolver — because OIL is
  about official commitments, not drafts. So a consumer→published link exists.
- No clock (a fixed "today"); any time-based cutoff is out of scope.

## The surfaces, and the WORKFLOW each serves

| Surface | Who / when | Decision it supports | What "truth" seems to fit |
|---|---|---|---|
| **Edit schedule** | Scheduler, planning days/weeks ahead | "does my edit break anything, here or downstream?" | working copy (see edits ripple) |
| **Edit scheduler board** (phone) | Scheduler on the go, quick edits | same, on a phone | working copy |
| **View-only schedule** | Scheduler reviewing official state; **members reading their programme** | "what's officially the plan / is the official plan sound?" | published (+ draft days shown live) |
| **View-only board** (phone) | Members / scheduler, quick read | "what am I flying / is it official" | published |
| **Leave War / OIL** | Leave planning | "who officially worked / is committed" | published (already) |

Two *versions* cross all of this: the **published** (issued, signed) copy and the
**working** copy (latest edits, incl. unpublished amendments to published days).

## The incumbent proposal (to beat)

Two flagging "worlds": each surface flags the day against **the version it
shows** — authoring surfaces → working; consumption surfaces → published;
Leave War/OIL → published (as now). They differ only for a published-AND-amended
day. Guardrails make an unpublished divergence loud (provisional tags + a
publish/discard reminder).

## The questions to red-team (workflow-first)

1. **Is TWO the right number of truths?** Argue for ONE (everything flags the
   working copy — simplest, but consumers see drafts) vs TWO (working +
   published) vs MORE (a distinct truth per surface / a preview truth). What
   does each cost or give the *users* (scheduler planning; scheduler reviewing;
   member reading; leave planner)?
2. **What is the right RULE for which surface reads which truth?** By surface
   role (authoring↔working / consumption↔published)? By displayed version (each
   day flags what it shows)? By USER role (scheduler always sees working;
   everyone else published)? These diverge for the phone board and for
   "view a published day's working copy." Which is most coherent to *use*?
3. **Audience — more vs less flagging, for whom?** Does a squadron MEMBER
   reading the published schedule want crew-rest / 7-day / conflict flags, or
   are those the scheduler's concern and just noise on a member's read-only
   view? Should published-view flags be shown to schedulers/admins and muted for
   members — or shown to all? Pros/cons.
4. **Coupling to Leave War / OIL — more or less?** OIL already reads published.
   If the schedule gains a clean "published truth," should Leave War/OIL
   reference the SAME published-truth notion (one definition of "official",
   less drift) — or stay independent (less coupling, more freedom)? What serves
   the workflow?
5. **The board — one behaviour or two?** It's both an edit and a view surface.
   Should it follow the same role rule as the big screens, or does on-the-go use
   want something simpler (e.g., always published unless actively editing)?
6. **Is there a BETTER framing entirely** than "working vs published worlds"
   that fits the workflow better — e.g., a single truth with per-flag
   "provisional/official" states, or an audience-scoped model? Name it.

## What to return

A recommended architecture stated as: **the number of truths**, **the rule for
which surface/audience reads which**, **the Leave War/OIL coupling**, and **the
audience policy for published-view flags** — each with the *workflow* pro/con
that drove it. Flag anything the incumbent proposal gets wrong on workflow
grounds, and any surface/actor I've missed. Effort/implementation is explicitly
NOT a deciding factor here.
