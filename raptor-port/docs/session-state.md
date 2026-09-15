# Session handoff — [AMEND] plans-selector follow-ups DONE + reconciled with main

## Where it is
Branch `claude/amendment-engine-core` (PR #405). The plans-selector redesign AND the
7 owner follow-ups (+ 2 refinements) are BUILT, cross-provider bug-checked (Codex +
Fable), and the branch has been **merged up to `main`** (main had advanced 52 commits
with ARCH-STACK person-ids + TRK-CSID syllabus-ids; those are now in the branch).
All gates re-run green after the reconciliation. Merging live on the owner's word.

## What shipped in the follow-ups (see docs/plans-selector-followups-plan.md for detail)
1. Signatures are PER PLAN + display-follows-validity — a content change clears the
   sign-offs (owner R1). 2. Week AL-roll banner removed (banner only hosts the RULES
   MODIFIED stamp now). 3. Version tag coloured by AL number (data-alc). 4. Tag moved
   to a `.dhver` span immediately left of the 4X4 badge. 5. Tag shows on view-only too.
   6. Warnings already show on view live faces (frozen issued face stays clean by the
   snapshot rule). 7. Sign-off status line publish-aware + "no changes to publish"
   bubble (owner R2). Plus Codex/Fable fixes: restampRev (sign-offs survive dup/delete),
   tag-adjacency CSS, R2 re-fire guard, ALNaN guard, and PSF-001 (signatures now bind
   to the filing axis — a leave/Other filing on a published day clears the sign-offs).

## PARKED — the owner's next ask (crew-rest on published + the 7-day rule)
Not built. The owner wants the CURRENT published day to show forward crew-rest
warnings (dotted lines + CR) driven by the NEXT day's plan, i.e. warnings on the
frozen published face — which reverses the settled "never validate a snapshot / the
issued face is byte-frozen" rule (pubsweep.test.tsx pins it). The forward crew-rest
TRACE already exists on the live/edit view (validate.ts `crewRestDay`, weekctx.ts
`nextMondaySeed`, the "Breaks <tomorrow>" box, `boxdash`). He is also unsure about the
max-consecutive-workday rule (VCONF.maxRun / DAYS_RUN). This is a HEAVY rules-engine
feature — scope it properly: drive the app to show current behaviour, agree the exact
change, red-team the plan across BOTH providers before building, then bug-check across
both after. Its own branch/session.

## The done-means-live chain (on the owner's "merge live")
merge PR #405 on green → wait for Pages → load the live page and look → one "it's live"
notification. Do NOT watch the PR.
