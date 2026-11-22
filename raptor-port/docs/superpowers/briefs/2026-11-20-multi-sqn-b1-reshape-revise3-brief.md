# The reshape plan's third revision — round 3's three reports folded in (chat 125, 20 Nov 26)

You are a fresh Opus reviser; you have not seen this chat or written any version of the plan. Rounds 1–3 of the blind red
team (Astra, a fresh Opus reader, Fable) are done; round 3 was the last (D70 caps design loops at about three). **Fold
round 3 into the plan** — no further plan read follows; the build's combined four-reader fix read catches what is left.

Work in `C:\Users\User\projects\Raptor-msq` (branch `claude/multi-sqn-b1-107`). **Write one file only:** the plan
`raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md`, in place. No other file, no git writes, no
build, no Playwright; one unit test file with `npx vitest run <file>` if a claim needs it; never read a file over ~300
lines whole. **State each decision as you make it**; return a summary under 500 words.

## Read first

The plan (§4.3, §6.2, §3.2 A-ii and A-v, §10, §11, §14, §17 above all); round 3's reports, whole:
`raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-reshape-read3-{astra,fable}.md`, and the fresh Opus reader's,
given at the end of this brief; the code each finding names — verify every claim before folding.

## The host's two decisions (technical, nobody can see either today — no screen gives View or Plan yet)

The re-link and the Undo of a right have produced findings in every round. In place of a fourth patch, two guardrails:
1. **A sign-in linked to another person carries no access to other squadrons.** The re-link drops every right of that
   account, holding or ended; the gate refuses a command that changes an account's man and leaves any right of that
   account standing; the Undo and Redo of a re-link restore the link only and never put a right back (the restore
   leaves grant rows out). The new man's squadron's admins, or a master, give what he needs. This replaces the plan's
   "rights that still hold follow the account" (a build choice of fix read 10, not a ruling — check: no ruling names it)
   and closes Astra 2, Fable 1 and the Opus reader's 1 by construction. Say the cost plainly: an Undo of a mistaken
   re-link gives the sign-in back without its other-squadron access. Check the re-link's door words still read true, and
   what the gate's "who may re-link" becomes (with no right ever carried, the master-only line for a sign-in holding a
   right may fall away — decide and say why).
2. **No restore ever puts back a right whose man has changed squadron since that right's own start.** An Undo of a
   removal or a lowering after his move puts nothing back (the new squadron's admins re-give), in every Undo/Redo order —
   closing Astra 1 and Fable 7. Judge it from the row as it stood when it was taken off. Say the cost the same way.
   Where an Undo then has nothing left to do, name what the person sees (today's existing words if any fit).

## The rest of round 3, each verified first

- **The foreign posting pass:** no passing note from the foreign half — a held foreign posting shows only in Admin →
  Users' held note (Fable 2, Opus 3); one posting per command, a refused one not retried this session, a posting whose
  man is not at home in that squadron skipped by both passes (Opus 2); the audience includes that squadron's eligible
  Plan holders as its admin lines do (Astra 3 — check D2202's full row), View holders out, the same rule in both passes
  and the gate; "that day" is the run's day, today, in the audience and the gate (Fable 5, Opus 8); the run's command
  type reuses the pass's own (Fable 6).
- **Undo identity:** the planning record routed through Undo when its squadron is not loaded — a per-record store, the
  stored half loading its ids before it joins, both directions tested (Fable 3, Opus 4); the Leave War's OIL ledger and
  cell rows reached by Admin → Users' doors given the same identity as the loaded war's (Opus 5); a later step in a
  world he can no longer enter treated as blocked for good, with the existing words (Fable 4); `verifiedWarRestore` and
  `carrySeen` named, their tests run in the two-squadron world (Opus 6).
- **§10:** each test resting on another job built at the same time names who writes it and when (Fable 8, Opus 7); A7's
  refusal words given a file owner (Opus 7).
- **§11:** anything new on screen the fixes create — the plan already draws A7's Undo words; add any other.
- **§18 Round 3's findings and what the plan did** — every finding a row, as §16 and §17. Status line: "revised after
  round 3 (chat 125); the plan's red team is closed — next, his answers and the build".

## The fresh Opus reader's round-3 report (as returned)

The host saves it to `…-reshape-read3-opus.md`; its findings in short: (1) HIGH — a re-link carrying a right that still
holds: an Undo after Ranger moves re-dates the link to today and Ranger keeps Plan of 149 though now 150's; an Undo after
Viper moves is refused whole; a Redo after Ranger moves is refused. (2) MEDIUM — one bad foreign posting (its man moved
out of that squadron) refuses the whole foreign run and is retried after every later command; today's loaded pass
retries once, then one posting at a time, then gives up for the session (`PO_RETRIED`, `PO_REFUSED`, sync.ts
~l.2884–2893). (3) MEDIUM — the held foreign posting's warning (`tellOnce`, sync.ts ~l.2770) reaches another squadron's
people. (4) MEDIUM — the routed planning record has no safe path through Undo when its squadron is not loaded
(timeline.ts ~l.125–127, ~l.825; sched-commit.ts ~l.432–435): no recorded change, no rollback; the stored half must load
the record before joining, or an edit saves as "created" and its Undo deletes the note. (5) MEDIUM — `lwx.ledger/<u>@<id>`
and `lwx.rec` are the loaded war's `lw.ledger` and cell records under another identity: master picks 149, clears Viper's
OIL award, picks 142, deletes Viper from Admin → Users, picks 149, Undo writes the award back for a deleted man. (6) LOW —
`verifiedWarRestore` (timeline.ts ~l.615–628) and `carrySeen` (~l.233–246) compare by the Undo key; D1263's own-bid Undo
on a closed day must stay right. (7) LOW — test ownership in §10; A7's refusal words have no file owner. (8) LOW —
`adminsOf`'s "that day" unnamed.
