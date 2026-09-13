// src/engine/newid.ts
/* ONE opaque-id minter (13 Sep 26, ARCH-STACK step 1A). Reused for schedule rows
   (`rid`, rowids.ts), personal inputs (`iid`, inputs.ts) and day-note lines. The
   value is collision-resistant across sessions AND devices (random, not a
   per-device counter), never parsed, and NEVER printed — so it rides history
   snapshots and persists like `rid` without touching byte-parity.

   This is the primitive the write/command layer, global undo and the Dataverse
   adapter (ARCH-STACK steps 2+) will all address records by. Its own zero-import
   module so any engine file can mint an id without an import cycle. The
   module-local `newId`s still in daytpl/drafts/dutytpl/wavetpl are template and
   draft ids — a later slice folds them onto this one; they are out of 1A. */
export function newId(prefix: string): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
