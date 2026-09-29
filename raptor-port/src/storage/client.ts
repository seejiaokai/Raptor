// src/storage/client.ts
/* THE CLIENT BOOT ID ([DB-READINESS] group A, phase 0 — plan §3 phase 0, phase 4.1). One opaque id
   per page life: every change-log batch this tab writes is named `<clientBootId>-<seq>`, so two
   tabs (or two people) whose command counters both start at 0 never write the same batch key. Minted
   lazily on first use and never again until the page reloads. */
import { newId } from '../engine/newid'

let ID: string | null = null
export function clientBootId(): string {
  if (ID === null) ID = newId('c')
  return ID
}
