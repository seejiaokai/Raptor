# Break-test brief — round 7 of the SANS words, chat 174 (host), 25 Nov 26

You are a fresh Opus helper. The bug-check order's §8 asks for ONE red break test per wired surface: break the wiring on
purpose, run the tests that should guard it, and record whether a test goes red. You prove the tests catch a break; you fix
nothing and keep nothing.

Checkout: `C:/Users/User/projects/Raptor/.claude/worktrees/lw-balances-hover-275293` (branch
`claude/allavail-sans-postout-141`, clean, HEAD pushed). Work from its `raptor-port/`.

## Hard rules
- Before you start: `git status --short` must be empty; record HEAD. After EVERY break: `git checkout -- <file>` and
  `git diff --quiet` before the next. At the end: `git status --short` empty and HEAD unchanged — say so in your report.
- Never commit, push, build (`npm run build`), or run the full suite. Run only named test files: `npx vitest run <files>`.
  Never kill a process by name. Do not touch `dist/`.
- One break at a time, the smallest one that disconnects the surface (return early, drop one condition, swap one word),
  never a test file edited.
- Write your report as you go to `D:/raptor-work/c174-break/break-tests.md`; final message three lines: its path, caught
  N of M, the uncaught ones by name.

## The wired surfaces (find each in the code by searching; read the round's builders' reports for where things are:
`docs/superpowers/briefs/2026-11-24-sans-words-fix{3,4,5}-build-fable.md`, and `git show --stat 0eaacc411 f73602f9f
2391f9dfa 0e59ea5f3 264a1f3d4 1d2ed3415`):
1. The SANS reminder's "planned" test (D2564/D2568: a flying seat or sim; a no-times seat counts; a cancelled line never) —
   break: let a ground row count, or let a cancelled line count.
2. The reminder's relight rule (D2560: lights again only for a day not in it when read).
3. The reminder's title ("You're SANS from …" vs "Your SANS availability is needed.").
4. The change lines A–E's words (`sansBackWords` in `src/state/notices.ts`) — break one title.
5. "Only the days still hidden" (the sentence names only days hidden now).
6. The cut run at his SANS date (D2388: a run starting too early saves from his date, the note says why) — break the cut.
7. The shared offer refused, never trimmed (D2394 Q10).
8. The greyed "+ Commitment" and its words before his date (D2421).
9. The crew list gains no reason line (D2420).
10. A read record written only by its owner (round 4, the permission gate) — break the owner check.
11. The note that already says the save happened (`toastIsReceipt` in `src/ui/toast.ts`).
12. The merged bell: the words pass's `firstTwo` beside the SANS lines in `noticeWords` (main's D2521) — break the count.
For each: the break (file, what changed, one line), the test files run, red or green, the failing test's name. A break no
test catches is a finding for the host — name it plainly.
