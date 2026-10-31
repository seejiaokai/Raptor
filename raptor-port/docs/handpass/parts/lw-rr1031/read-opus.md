# Job 2 (31 Oct 26, the night) — the fresh, blind Opus code read (D790)

Read-only, on `claude/lw-roster-restore-fixes` (80310343f and 7d0c12b24's tests); `postout-roster.test.ts` and
`deletednorow.test.ts` 55/55. Saved as it arrived (condensed — the reader's own words where they decide something).

**Findings meeting D489: none.**

**Checked and holds:**
1. The put-back drops no legitimate unsaved person: every production write to a person is inside a command that saves
   it before finishing (`quals-write.ts`, `roster-add.ts putNewPerson` — throws outside a command, `accounts.ts`
   person.backSeen, `restoreBody`, `archivePerson`, `applyDelete`); `persistPeople` has no callers; the only bare writes
   run at boot (`bootstrapFirstAdmin`, `resetSeedWorld`, `hydrate`), all before `initStore → resyncPeopleBaseline`,
   before `wireLeaveWarSync`'s first pass; no cross-tab reload of the roster — live equals saved at idle and at phase 8.
   Changed people put back in place (references stay valid); a missing person comes back, `reorderPeople` sorts him.
2. Saved copy and rollback: the put-back runs inside the pass before the people store is enlisted; the before-image and
   signature are the saved string; a refused pass puts back the same saved copy.
3. Order numbers: `mintPeopleOrd` cannot touch another man; after the put-back the key order is the saved order.
4. The gate rule: `lw.postouts` keyed by the man's id; every outcome writes his posting record through
   `markPostingDone` or `forgetPersonFrom`; `applyDelete` writes only his person; a suspension writes settings only;
   several men due one day are all in the posted set; a joined pass carries the parent's type, so the rule judges the
   pass only when it runs as its own `lw.postoutRun`.
5. The paths: idle — its own command; phase 8 — queued, `own` stays true; inside a person's reducer — joins, puts
   nothing back; under a projection — defers (`PO_INFLIGHT` dedupes; `apply` re-checks after the put-back).
6. Fix 2 matches `read-fix2.md` exactly; (B) lets nothing through the live door refuses (days on or after his cutoff
   still caught by the unchanged second loop; the gap-day Inputs-page swap allowed live, D321 (10); only `doorApprove`
   writes war-marked leave, every caller scoped `lw`).
7. The tests: each layer has a test only it satisfies; breaks 1–6 map onto them; the projection test fails if the wait
   is removed; the gate tests assert the gate's own words; the `postout-outcomes.test.ts` setup change is legitimate.

**Seen, not findings:** a console-added `special: true` man not in the saved copy is skipped by the put-back, the gate
refuses that pass, the rollback removes him, the next pass runs — it heals itself. A member's command or Undo/Redo that
woke the pass inside its reducer would be judged as the member's and refused — as before; no such trigger found.

**Tidiness note (D489 — filed, not fixed):**
1. "The app itself" is decided in two places: the wait in `sync.ts` keys on `parent.origin === 'projection'`, the gate
   on `actor.role === 'system'`; a system-actor parent of another origin (`seed`, or `remote` at the database step)
   would make the pass join unjudged and put nothing back. No production `seed` or `remote` commit exists today. Keying
   the wait on `parent.actor?.role === 'system'` would make them agree.
2. A stale comment: `person-delete.ts`, the paragraph above the loop still says "a Redo of an approval … takes a request
   of his off the war … and writes the leave" — the request test Redo no longer uses; the later "…AND ONLY A WAR STEP
   APPROVES" paragraph corrects it, but a reader meets the stale sentence first.
3. `revertUnsavedPeople` re-implements part of `restorePeople` to keep each person's object in place; its returned id
   list is used only by tests. Acceptable.

Verdict: both fixes do what their items ask; no absence, double run, lost legitimate change or over-refusal; the tests
pin the behaviour.
