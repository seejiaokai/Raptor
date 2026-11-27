# S2 step U1's eleventh round — the builder's report (an Opus helper, 27 Nov 26; saved by chat 205 from its reply)

Brief: `2026-11-27-msq-s2-u1fix11-brief.md`. Status: READY FOR INDEPENDENT REVIEW. Nothing committed, staged, pushed or built; no lock; no `zz-` file left. Files: `ui/UsersPanel.tsx` (changed), `ui/msq-s2-rejudge11.test.tsx` (new).

## Failed before, passes after (`msq-s2-rejudge11.test.tsx`, each reading the real note element; before 7 failed, 4 passed; after 11 pass)
- opus1 proof 1a (Give access changed, the add answers the request): fail (receipt 0, note 1) → pass, "<receipt> · <note>".
- opus1 proof 1b (an archived man's row open, the add takes his callsign): fail → pass.
- opus2 proof 1 (Kestrel typed on Osprey's archived row, then the add under his callsign): fail → pass.
- opus2 proof 2 (a changed Give access, the add with the request's sign-in): fail → pass.
- Astra proof 1, form changed, strict off / on: fail (receipt 0, note 1) → pass.
- opus1 proof 2 (Refuse past midnight beside Ranger's row): fail → pass.
- Controls passing before and after: the add with no open work shows its receipt alone; Refuse with no open work shows "Refused newface@mail" alone, once; Astra's form-unchanged cases (strict off / on).
Astra's proof as a `describe.each` / `it.each` block, its checks unchanged (the draw after the press says nothing more); the others as written, with exact-line checks added on top of their counts.

## What was built
- `pressPaths.afterWrite` takes a third press kind `'add'`: the write, then each present piece (`work.row`, `work.give`) judged with `otherAtPress`; every one that closes dropped in one `dropWork({ row, give })`; the callsigns owed a note in one `sayChanged([...])`, row before form — inside the one `HOOKS.toastBatch`. Returns `addWrite: (write) => afterWrite('add', write)`; its head comment says why.
- `add()`: only its write line → `addWrite(() => { if (done(addPersonAndAccount(name, np, role, postIn), ok)) resetAddForm() })` (agreed with chat 204).
- `UsersPanel` passes `addWrite` to `Waiting`; Refuse → `p.addWrite(() => { done(declineRequest(r.id), \`Refused ${r.name}\`) })`.

## Re-points
None (no test pins `Waiting`'s props by name).

## Files run, one at a time (all exit 0)
rejudge 23 · 2 52 · 3 39 · 4 110 · 5 83 · 6 21 · 7 14 · 8 32 · 9 15 · 10 21 · 11 11 · msq-s2-row 15 · msq-s2-asis 24 · msq-s2-lists 14 · msq-users-row 7 · msq-users-filter 24 · msq-guard-g 24 · msq-guard-rollcall 49 · msq-guard-note 65 · msq-guard-asis 29 (+4 todo) · msq-guard-doors 125 (+1 todo) · msq-guard-doors-switch 104 · msq-guard-doors-bell 79 · onedoor-users 22 · accounts-ui 21 · accounts-newperson 26 · postout-landing 4 · admin 5 · msq-bell-tap 12 · state/edit-rights-readers 4 · msq-guard-open `-t "userrow|archrow|giveaccess|addperson"` 32 (309 skipped).
Security pins: fixread9 1 8/8, 2 7/7; fixread10 1 6/6. `npx tsc -p tsconfig.app.json --noEmit` 0; `npm run lint:changed` "no new finding (24 changed files)".

## What a person sees differently
No new words. A successful "+ Add a person" or Refuse no longer has its confirmation replaced by the other open work's "…row changed while it was open, so nothing was saved. Open it again." — both on one line, the confirmation first. With no other open work, nothing changes.

## Unclear, and what was chosen
Refuse reaches it as `p.addWrite` inside `Waiting` (same behaviour); a refused add or Refuse still judges the other work in the same batch (round 10's rule); `addWrite` is declared below `add()` in the component — used only at a press, after the draw.
