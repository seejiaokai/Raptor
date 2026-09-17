/* [ARCH-STACK] Step 2 phase 2b — the issued-day DISCLOSURE registry (design §3.4,
   Codex R4-003).

   A published day's undo can be a SILENT reverse only while nothing has left the
   machine; once the issued version has been disclosed to anyone, undo must become
   an on-the-record forward withdrawal instead. The command layer records that on
   the publish envelope as `boundary.crossable`, but the AUTHORITY for "has this
   issued id left the machine?" is this monotonic per-issued-id set — every path
   that lets an issued day out (a shared-DB send, a change-feed reference, a PDF
   export/print, a CSV export, or the issuing session ending) reports it here, and
   `crossable` is re-derived from it.

   ADDITIVE at Step 2: this only RECORDS the signal (nothing reads it to change
   behaviour yet). Step 3 reads `issuedDisclosed` to choose silent-reverse vs
   forward-withdrawal (design §4.2). Session-scoped, in memory — real
   cross-session disclosure arrives with the shared DB (Step 5).

   CORRECTED 17 Sep 26 — THE OLD RATIONALE HERE WAS FALSE, AND IT LEAVES A REAL
   STEP-3 GAP. This used to say in-memory "matches the app's session-only
   INPUTS/stash persistence". INPUTS and the week stash both PERSIST on a built
   site, and so do the issued records themselves: SCHED.orig and SCHED.als ride
   schedFields() -> weekStashSnap() -> the weeks/<wk> record. So an id disclosed
   by a PDF or CSV export, then reloaded, comes back reading issuedDisclosed() ===
   false, because nothing re-reports persisted issued ids at boot. Nothing reads
   this at Step 2, so it is inert TODAY. But Step 3 decides silent-reverse vs
   on-the-record withdrawal from exactly this signal, and would inherit a false
   "never disclosed" — i.e. it would silently erase an amendment that had already
   left the machine, which is the one thing the owner's 16 Sep ruling forbids.
   BEFORE Step 3 reads this, either persist the disclosure set with the week
   record, or fail safe: treat every issued id hydrated from storage as already
   disclosed. Tracked as an open item in the Step-2 design's §9.

   MONOTONIC: an id, once disclosed, is never un-disclosed (a leak cannot be
   taken back). So re-reporting the same id is a cheap idempotent no-op. */

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
