# Night of 22–23 Nov 26 — the last two fix rounds (A4, A5), the builder's reports (the same Opus helper)

Saved as they arrived (chat 149's helper, ~07:40 and ~07:55 MPST; branch `claude/msq-b1-screens-135`). Nothing new on
screen: every refusal sentence is one the app already says.

**A4 — `781b033de`.** A1's refused Undo now says who changed it (D148). Red (Astra's test added to
`src/state/msq-fix4-undo-plan-master.test.ts`): `expected 'Something else changed this after you…' to contain 'Kestrel'`.
`state/accounts.ts`: the check is `masterRightLeft`, naming only the account; `accountsRestoreProblem` no longer carries
the fixed anonymous copy. `state/undo-wire.ts masterRightRefusal` joins the Undo refusal chain and names whoever last
wrote that account's row through `undo/timeline.ts outOfBandWords` (exported) — "Kestrel changed this after your action
— it can’t be undone now."; the anonymous words only where nothing names the writer. `docs/data-model.md` UnitGrant row.
The two earlier A1 cases now expect the named sentence (this fix, not a weakened check). 5 cases pass. Checks: 191 files
/ 1638 under the lock; build; `lint:changed` no new finding (518 files); docsize.

**A5 — `5d964e088`.** The refusal names whoever wrote what blocks the step. Red against `781b033de`: Opus 2 `expected
'Kestrel changed this after your actio…' not to contain 'Kestrel'` (Kestrel only changed the sign-in name; the mark was
Saber's own step); Astra 1 `expected 'You changed this somewhere else after…' to be 'Kestrel changed this after your
actio…'`; Opus 1 passed there already (it named Kestrel) — kept as a guard. `state/accounts.ts masterRightLeft` returns
the holding right as well as the account (moved above the restore check's own comment); `state/undo-wire.ts
masterRightRefusal` follows `standingConflict`'s shape — when the step puts the mark back, the writer of the right given
since; when it puts a right back, the newest command that set the mark on that account, never someone who changed only
another field; his own step in this session names nobody, his own other session "You changed this somewhere else…";
`undo/timeline.ts outOfBandWords` takes an optional rule for which change to look for — no second copy of any sentence;
`state/perms.ts`'s stale comment points at `masterRightRefusal`; `docs/data-model.md` UnitGrant row. Only its six files
staged (the walker's folders and `.tmp/` left alone). Checks: 191 files / 1641 under the lock; build; `lint:changed` no
new finding; docsize.
