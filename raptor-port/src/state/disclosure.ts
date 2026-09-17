/* WHICH ISSUED VERSIONS HAVE REACHED THE SHARED RECORD (design §3.4).

   OWNER RULING, 17 Sep 26 — THIS REPLACES THE EARLIER MULTI-PATH "DISCLOSURE"
   MODEL (Codex R4-003, accepted 16 Sep). The newest owner instruction wins, and
   the earlier one is named here rather than quietly dropped.

   THE RULE, in the owner's words: "as long as if I publish and undo and it didn't
   hit the database there isn't a need to put it in the records history, but if
   it's published and the database registers and I undo, it will be recorded as
   this was undone in the history to prevent silent bugs."

   So the boundary is ONE fact: has the shared database registered this issued
   version?
     - NOT registered -> undo reverses it silently. Nothing is on the record
       anywhere, so there is nothing to correct.
     - REGISTERED     -> undo goes on the record, so the change cannot happen
       silently.

   WHAT IS NOT A BOUNDARY EVENT (dropped 17 Sep 26): a PDF/print export, a CSV
   export, or the issuing session ending. The earlier design treated all three as
   "the day left the machine". The owner's ruling: the export is a SCHEDULER-ONLY
   snapshot of the current published schedule — its whole purpose is to hand the
   scheduler the latest copy, and schedulers know which copy is latest. It is not
   a publication to the squadron and it does not constrain undo. The three call
   sites that reported it (printpdf.ts, the Shell's CSV button, resetSession) are
   GONE.

   WHY THIS IS ALSO BETTER, not just simpler: "the database acknowledged it" is a
   single fact the app can actually check. The old model had to INFER disclosure
   from human-facing paths it could never fully enumerate, and every new export
   button would have been another one to remember.

   STATE AT STEP 2: there is no shared database yet, so nothing can have been
   registered, so every issued version is freely reversible and `crossable` is
   true. Nothing reads this at Step 2 in any case. The registry below is the seam
   the Step-5 database adapter reports into, on a write the backend has
   acknowledged; Step 3 reads `issuedDisclosed` to choose silent-reverse vs
   on-the-record undo.

   MONOTONIC: an id, once on the record, is never taken off it. So re-reporting
   the same id is a cheap idempotent no-op. */

const DISCLOSED = new Set<string>()

/* report that these issued verIds have left the machine (any disclosing path). */
export function discloseIssued(ids: readonly string[]): void {
  for (const id of ids) if (id) DISCLOSED.add(String(id))
}

/* has this issued verId ever been disclosed? (Step 3 reads this.) */
export function issuedDisclosed(id: string): boolean {
  return DISCLOSED.has(String(id))
}

export function disclosedIssuedIds(): string[] {
  return [...DISCLOSED]
}

/* test-only: clear the registry between suites */
export function _resetDisclosure(): void {
  DISCLOSED.clear()
}
