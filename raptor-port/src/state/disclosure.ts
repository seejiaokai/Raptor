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
   forward-withdrawal (design §4.2). Session-scoped, in memory — it matches the
   app's session-only INPUTS/stash persistence; real cross-session disclosure
   arrives with the shared DB (Step 5).

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
