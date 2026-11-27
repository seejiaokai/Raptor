# Section 1 (the guard rail), step KR-2 — the closing step and its checks (chat A211, 28 Nov 26)

**You are a fresh Opus builder.** Working copy `C:/Users/User/projects/Raptor/.claude/worktrees/a211-s1-kr-dd0560`,
branch `a211-s1`. Build **KR-2**, red first. Commit nothing, push nothing — the orchestrator does. Save your report to
`raptor-port/docs/superpowers/briefs/2026-11-28-msq-s1-kr2-report.md` and give it as your final reply.

## Read
- The plan whole: `raptor-port/docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md` — above all §2, §4, §5
  (the door order, steps 1–8), §7 (the checker re-pointed), §11's KR-2 row, §12's head (his D2836–D2838 win; **D2838:
  a box with no Save button is saved into its OWN squadron first, then the door goes through in the same press; if that
  save fails, the door is stopped with "Not saved"** — that is §5 step 7, KR-2's), §14.
- KR-1a's report `raptor-port/docs/superpowers/briefs/2026-11-28-msq-s1-kr1a-report.md` (what is built: every row's
  `close`, `useGuardOpen`, `closingForDoor` / `whileClosingForDoor`, `closeWarAll(commit)`, `trackerCloseOpen`; its five
  calls — call 3: `closeOpen` itself calls `closeWarAll(flushSync)` and does not enter on `false`).
- `state/doorwait.ts` (the doors' one wait — reuse it, never a second wait), `src/testing/entry-checker.ts`,
  `state/guard.ts`, `ui/guard.ts`.

## What KR-2 builds (no door converted yet)
- **`closeOpen(skip?)`** — §5 step 6 inside one call: (a) the focused box blurred while the old squadron is in view, with
  `closingForDoor()` true; (b) every open row's `close` in `GUARD_ORDER`, the `skip` rows left out; (c) the Leave War loop
  (`closeWarAll` with flushSync; `false` → the door does not enter, reported to the caller); (d) committed before the
  entry: straight after it `whatIsOpen()` is null and `holdNow()` is `'none'`. `closeShown()` stays for now (the doors
  still call it until KR-3 / KR-4); `closeOpen` closes the show-only rows too, as `closeShown` does.
- **§5 step 3b and step 4:** a Tracker prompt that is not the switch question is ended and answered cancelled (via
  `trackerCloseOpen`) before the Tracker's question is asked; a question already standing — the new press waits on the old
  ask's whole settling, the old one answered Stay (the plan's reading R5).
- **§5 step 7, the save-after-close wait (D2838):** a save the closing started (6a's blur, a keeping close, Logic's
  `flushRuleApply`) is waited for with `doorwait.ts`'s wait (one helper beside it); Not saved → the door refused with the
  Retry note, the squadron unchanged, what closed stays closed; a press meanwhile drops the wait (as built).
- **`guardAsk` refusing only `unsaved` for the doors in `NO_BLOCK_DOORS`** — a set, EMPTY in this step (KR-3 / KR-4 add
  the doors). With it empty nothing he sees changes.
- **The checker re-pointed (§7)** for the doors in `NO_BLOCK_DOORS`: at an entry by his press it asks
  `whatIsOpen(skip)` — the old work must be closed before the entry; its second check (nothing opens behind a refusal)
  stays for Not saved; the allow-list stays.

## Tests, red first
A new file `src/ui/msq-guard-closeopen.test.tsx` (a shared helper in a plain `.ts` under `src/test-support/`): closeOpen
by family (reuse `msq-guard-closers-kit.ts`), the skip, the blur into its own squadron (a template time, a plan name,
Logic's value), the invalid name dropped silently, the Leave War loop's `false`, 6d's two checks; 3b and 4 with the
Tracker (an import's "Skip this one" stopped; a standing question); step 7 — a closing save lands / fails (Retry note,
squadron unchanged) / a press during the wait; `guardAsk` with a door put in `NO_BLOCK_DOORS` by the test only; the
checker for such a door. Seen failing by the patch method (`git diff > file`, `git checkout --` the sources, run,
`git apply`, compare) — never `git stash`. Name every new test that passes on the old code.
KR's door tests `src/ui/msq-guard-drops.test.tsx` (58 red by design) stay red — report the count before and after.

## Off limits
No change to `ui/UsersPanel.tsx`, `ui/topstate.ts`, `state/undo-wire.ts`, `undo/timeline.ts`, `state/accounts.ts`,
`state/perms.ts`, `state/notices.ts`, `state/acctlines.ts`, `state/units*.ts`, `ui/useraccess-model.ts`,
`ui/UserAccess.tsx`, `state/pick.ts`, `state/store.ts`, `state/belltap.ts` (the doors are KR-3 / KR-4), `state/inputsqn.ts`,
`ui/MedicalView.tsx`. No word on screen added or changed (the Retry note's words exist). `src/engine/` untouched.

## Checks (from `raptor-port/`)
Your files and every `msq-guard-*` file by name, `--maxWorkers=4`, output to a scratchpad file, exit code kept;
`msq-guard-open` once at the end. `npm run lint:changed` — no new finding beyond the three known `ui/UsersPanel.tsx`.
`npm run build` and `npm run smoke:tracker` under the checks lock (`node scripts/gatelock.mjs status` / `take
"claude/msq-s1-guard-6ae5e1 — KR-2 build + smoke"` / release at once; held → NOT RUN, never a wait in a loop).
`raptor-port/node_modules` is a junction — never delete through it.

Finish with the executor footer and, for the walk's scenario designers, what only a browser can show.
