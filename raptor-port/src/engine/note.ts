// src/engine/note.ts
/* A DAY-NOTE LINE (13 Sep 26, ARCH-STACK step 1A). Overall day notes were a
   bare `string[]`, so a note line — unlike every other editable row — could not
   carry a stable id, and a middle delete renumbered its neighbours by hand
   (shiftKeys). Each line is now `{ rid, t }`: `t` is the text (what renders and
   what parity compares), `rid` the opaque stable identity the write/command
   layer and the DB will address by (ARCH-STACK step 2+). Addressing in 1A stays
   POSITIONAL (`dn:di.i`) — the id rides along, minted at boot like a row's rid.

   The stable id uses the SAME field name as every other row, `rid` — NOT `id`,
   which content records already use (a duty row's person `id`), so a note's id
   can never be mistaken for content and every rid-stripping path (snapshot
   compares, the `ridless` test replacer) handles a note for free. It is minted
   by the rowids walk (ensureRowIds), NOT in the seed literals and NOT at module
   scope — same rule as a row's rid: the parity harness reads pristine days and
   never boots, so a seed note is `{ t }` with no rid, which the adapter projects
   to its text. A COPY (day-template apply, duplicated day) re-mints via
   stripRowIds + ensureRowIds; an undo/draft keeps rids. */
export type Note = { rid?: string; t: string }

/* the text of a note line, tolerant of a legacy bare-string note that a
   pre-1A blob might still carry before the storage reset coerces it away */
export function noteText(n: any): string {
  return typeof n === 'string' ? n : (n && typeof n.t === 'string' ? n.t : '')
}

/* a fresh note object from text — rid left unminted, filled by ensureRowIds at
   the next baseline (mirrors how a new schedule row gets its rid) */
export function mkNote(t = ''): Note {
  return { t: String(t) }
}
