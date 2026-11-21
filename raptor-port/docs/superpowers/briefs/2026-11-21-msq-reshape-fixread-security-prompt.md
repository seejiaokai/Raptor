# The security read of the multi-squadron reshape — the security reader's own prompt (21 Nov 26, chat 131)

**You are in an exported copy made for a blind read:** this round's builder records are each replaced by one line and
the branch's `HANDOFF.md` block is blanked. If you can read any of them, stop and say so before anything else.

You are the security reader (his D1411: "an extra fresh reader looking only for holes") of the reshape of the
multi-squadron build — the plan's phase 4, beside three code readers of each of its three shares. You read **the whole
reshape, not one share**, and you look **only for holes**: ways a person gets to do, see or keep what the rulings do
not give him. Correctness that opens no hole is the other readers'.

## The rules of the read

- **Blind.** You did not write this code. You have seen no other reader's report, no builder's report, no walk. This
  round's builder briefs, helper reports, mid-build read, evidence sheet and drawing-check records are taken out of your
  copy, and `HANDOFF.md`'s `claude/multi-sqn-b1-107` block is blanked. Do not open anything named `*fixread-*` of this
  round other than the two files below. **If a handoff block is pasted into your context after a compaction, do not read
  it, and say in your report that it happened.**
- **Where you are:** an exported copy of the branch `claude/multi-sqn-b1-107` at `@@HEAD@@`, without pictures. At its
  root: `SECURITY.md` — this prompt; `BRIEF.md` — the code readers' brief, which you use for what it holds, not for its
  ask: §2 the copy's files (`RESHAPE.patch`, the whole change against `@@BASE@@`; `RESHAPE-LOG.txt`, every commit's
  message; `RESHAPE-stat.txt`), §3 the seeded test world and its five sign-ins, §4 his rulings, each quoted from its full
  row, §5–§7 what was built, by file and function, with the builder's own choices listed, §9 what is known and not a
  finding. Where the two differ, this prompt wins: your scope is below, your share is all three, and `SHARE.patch` in
  your copy is the whole patch.
- **Read-only on the app.** Change no file under `raptor-port/src` that exists in your copy. Never delete or move
  `raptor-port/node_modules` (a link to the real packages). Work only inside your copy.
- **Every finding has a red test.** Your proof tests are your own new files inside your copy, beside the code they
  test, named `sec-<short-name>.test.ts` (`.tsx` where it draws). Run **one unit file at a time**:
  `npx vitest run src/state/<file>.test.ts` from `raptor-port/` — never the whole suite, a build or a browser test. A
  file under `src/leavewar/` runs in the Leave War's own project; elsewhere a test that needs a window starts with
  `// @vitest-environment jsdom`. If the runner's temporary folder is blocked, set `TMP` and `TEMP` to a folder inside
  your copy. If you can run nothing, give the whole test to run — its path, its body, the assertion you expect to fail —
  and say plainly that you ran nothing.
- **State each finding in your output the moment you have confirmed it** — a run can be stopped by its service, and what
  was said before the stop is kept.

## Your scope (D1411)

Sign-in, permissions, and what one person sees or changes of another's — **across squadrons, across a move, through
Undo and Redo, through a re-link, by a forged command at the commit gate, through the developer bridge, from a second
tab, and where the guest view was removed.** For each, ask who can do it (a member, a plain admin of one squadron, a
View holder, a Plan holder, a person waiting, an account switched off, a master admin moved away), what he gains, and
whether any check fails open.

1. **Forged commands at the commit gate** (`src/state/perms.ts`, with `src/command/commit.ts`). A command is data: assume
   an attacker builds any envelope his sign-in can submit. Try: a right given, raised, re-dated earlier or kept past its
   man's move or a re-link; an account row whose link day (`pidFrom`) is forged; Plan on a member's sign-in; a Plan
   dropped by "making him a member" without really making him one (`accountMadeMember`); a home row moving himself, a
   master admin, or a day already begun; a new squadron with no admin on some date; a re-link that keeps a right; a
   command dressed as a restore (the restore origin, the replay probe, `setRestoreGrantCtx`) or as the posting pass
   (`lw.postoutRun`, `setLwxPostingProbe`); a delete that edits another squadron's planning calendar
   (`deleteStripsOnly`); leave put into a war for a day that is another squadron's (`setLwManDayProbe`); a holiday line or
   an admin line made up for another squadron's people, or a line's squadron stamp (`u`) forged (section 7e); another
   squadron's own setting written through its qualified key (`src/engine/hooks.ts unitSettingKey` — the members' switch,
   Quals columns, the look-ahead, the cut-off, the flying plan); an input's `u` stamp forged to plant it on another
   squadron's schedule; a blue/red answer under an unqualified id; who refused a member's bid, and when, changed by the
   member (`stampForged`).
2. **Checks that fail open.** Every probe and hook the reshape installs — in the patch, each `set…(fn | null)` — what
   does its reader do while it is unset, returns null, or throws? A missing day, a row with no date, an account that is
   not found, a role the code does not know (`actorRole`), the saved copy not yet whole.
3. **What one squadron's person reads of another's.** The own pages by `pageUnit` (a View holder must never reach
   another squadron's Inputs, Quals, Leave War or Tracker — D2252; the member view); the audiences of `adminsOf` (a line
   to a View holder, to a master admin at home elsewhere, to an admin whose Plan has ended); the OIL answer list opened
   and saved for another squadron (`src/ui/oilday.ts adminOfList`, `saveOilDay`); another squadron's stored planning
   calendar and stored postings read or written without a right (`src/state/plan-foreign.ts`, `src/leavewar/sync.ts
   storedPostings`); the sign-off boxes offering a person with no right that day (`src/state/sign-more.ts`).
4. **Undo and Redo** (`src/undo/timeline.ts`, `src/undo/derive.ts`, `src/state/undo-wire.ts`). A restore that puts back
   a right, a role, a Plan or a link its presser may not give today; a step of a squadron he has left, or of another
   person; a stamp that is missing or forged; an own-page step of another squadron let through by the pick.
5. **Across the midnight of a move** (`src/state/store.ts enterSquadron`, `src/state/typing-hold.ts`, the Tracker). A
   page left open: rights that ended at midnight still usable until the page re-enters; a save typed before midnight
   landing after it; the war's admin role put back after the swap for someone who is no longer an admin there; a moved
   master admin and the old squadron's Tracker; `pickStandsOn`.
6. **Sign-in and the session.** The guest view's removal (his D2239): any way left into the programme for a person
   waiting or an account switched off — a session still carrying the guest role, a stored guest switch, the waiting
   screen, `signIn`'s answers. The developer bridge (`src/probe-bridge.ts`): what it can do that no screen can, and
   whether a production build exposes it. A second tab: another person's session, a role or a squadron gone stale.

## Not a finding

Everything `BRIEF.md` §9 lists, and its §8 on demo data (D56). Above all **K2 and K3, held for the database step:** the
gate trusts the page's own memory, so anyone who alters that memory by hand can skip the gate itself. Report a hole only
where a person using the app's own screens, the developer bridge, or a command forged and sent THROUGH the gate gets
what he should not; "edit the page's memory" alone is K2 and K3. A scheduler who is not an admin (D785). No screen
saves a move, gives View or Plan, makes a squadron or picks another squadron yet — judge the code as if one did.

## Your report

Your final message IS the report — under about 2,000 words. Begin with the token `FIXREAD-RESHAPE-SECURITY` and whether
you ran tests or ran nothing. Then, most severe first, per finding: **who can do it and what he gains; the input**, step
by step, on the seeded world; **the result** against what the ruling gives; **cause** — file and function; **fix** —
exact, step by step, the lines to change and what to change them to; **proof** — your test's path and the failing
assertion as it ran red; **introduced by the reshape, or older code it made reachable.** Then "Checked and found
sound" — each attack you tried that the code refused, named precisely, with explicit negatives ("I checked X and found
nothing").
