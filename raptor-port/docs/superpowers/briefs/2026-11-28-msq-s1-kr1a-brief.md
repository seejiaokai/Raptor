# Section 1 (the guard rail), step KR-1a — every closer, no door calling it (chat A211, 28 Nov 26)

**You are a fresh Opus builder.** Working copy `C:/Users/User/projects/Raptor/.claude/worktrees/a211-s1-kr-dd0560`,
branch `a211-s1`. Build **KR-1a**, red first. Commit nothing, push nothing — the orchestrator does. Save your report to
`raptor-port/docs/superpowers/briefs/2026-11-28-msq-s1-kr1a-report.md` and give it as your final reply.

## What KR is, and what KR-1a is
Read the plan whole: `raptor-port/docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md` — §0–§5, §7, §8, §10,
§11, §12's head (his answers D2836–D2838 win over any line that differs; D2835's bell squadron is K10's, not KR's).
His D2825: the guard rail refuses nothing for open work; what is open closes at a door, no note; "Not saved" still stops
a door (D2594). KR-1 in the plan's §11 builds **every closer, with no door calling it yet** — nothing a person sees
changes in this step.

**KR-1a = KR-1 WITHOUT `ui/UsersPanel.tsx`** (another section's work, U2, lands in that file first; its three guard
reports and its `useGuardSection('users')` move to `useGuardOpen` later, in KR-1b). So KR-1a builds:
- the `close` on every `window` / `row` row of `ui/guard.ts GUARD_ROWS` (the plan §3's table, column "Its close") —
  except the four Admin → Users rows (`userrow`, `archrow`, `giveaccess`, `addperson`), whose closers come in KR-1b;
- **`useGuardOpen(id, open, close)`** (§7), and every report OUTSIDE `UsersPanel.tsx` handing its closer through it —
  `InputsCal`, `InputsPage`, `QualsPage`, `DraftsModal`, `SquadronsPanel` (its three reports; `useGuardSection
  ('squadrons')` stays until KR-5), and the module rows; keep `useGuardWork` / `useGuardCloses` working for the
  UsersPanel callers until KR-1b (both may live side by side for now);
- **`closingForDoor()`** in `state/guard.ts` and the two boxes that read it (Drafts' name, the event presets — §3,
  Astra 5/6, Opus 1b);
- **the Leave War loop closer** (`closeWarAll`, §5 6c; the seam's list honest — a sheet leaves it only at its unmount);
- **the Tracker bridge's closers and the job-ending serial** (§5 3b: one registration in `tracker/app/core.js`, the
  bridge in `tracker/role.js`; "ended" distinct from a prompt's own Cancel);
- **D2837:** the holiday kept waiting for a leave period is dropped by the Calendar's closer (as its ✕ drops it) — no
  new words in this step (the form's new line "kept only while this window stays open" is drafted and drawn later).
- **R8 widened** (`ui/msq-guard-rollcall.test.ts`): R8 says no other row carries a closer — it must now allow the
  closers KR adds. **R10** (already written, red) turns green for every row but the four Users rows — make R10 name
  those four as "KR-1b" in a list that the test prints, so it is green now and fails again if a fifth row lacks one.

## Tests, red first
Each closer alone shuts its row and writes nothing it does not write today (the plan's KR-1 line), by family — one test
per row family (`src/ui/msq-guard-closers.test.tsx`, new; a shared helper goes in a plain `.ts` under
`src/test-support/`). Seen failing by the patch method (`git diff > file`, `git checkout --` the sources, run,
`git apply`, compare) — never `git stash`. List every new test that passes on the old code by name.
The branch carries KR's failing-first door tests (`src/ui/msq-guard-drops.test.tsx`, 58 red by design) — they stay red
in KR-1a (no door calls a closer yet); report their count before and after (it must not grow).

## Off limits until U2 lands
No change at all to `ui/UsersPanel.tsx`, `ui/topstate.ts`, `state/undo-wire.ts`, `undo/timeline.ts`,
`state/accounts.ts`, `state/perms.ts`, `state/notices.ts`, `state/acctlines.ts`, `state/units*.ts`,
`ui/useraccess-model.ts`, `ui/UserAccess.tsx`. `state/inputsqn.ts` and `ui/MedicalView.tsx` were just changed by K10-a —
leave them. No word on screen added or changed. `src/engine/` untouched.

## Checks (from `raptor-port/`)
- Your files and every guard test file by name (`msq-guard-*.test.*`, the files R3's census names for the reports you
  touch, `tracker/*.test.*` that name `role.js` or the closers), `--maxWorkers=4`, output to a scratchpad file, exit code
  kept; `msq-guard-open.test.tsx` once at the end (~12 min).
- `npm run lint:changed` — no new finding beyond the three known `ui/UsersPanel.tsx` ones.
- `npm run build` and the Tracker smoke (`npm run smoke:tracker`) under the checks lock:
  `node scripts/gatelock.mjs status`; if free `take "claude/msq-s1-guard-6ae5e1 — KR-1a build + smoke"`, run both,
  release at once (`node scripts/gatelock.mjs release`). Held: NOT RUN, never a wait in a loop.
- `raptor-port/node_modules` here is a junction — never delete through it.

Finish with the executor footer (Status / Changes / Checks / Open items) and, for the walk's scenario designers, what
only a browser can show.
