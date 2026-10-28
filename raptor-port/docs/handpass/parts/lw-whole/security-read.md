# [LW-WHOLE-LEAVE-WINDOW] — the security read (D1411), 28 Oct 26

A fresh Opus reader, looking only for holes in who may do or see what, read `603feaa93..HEAD -- raptor-port/src`
(`store.ts leaveRunAt / recordTakeable / deletableRecords / clearRecords`, the window's whole-leave paths), `perms.ts`
(`cmdAuthorize`, `ownershipViolation`, `onlyTakesPending`, `onlyChangesWords`), `sync.ts` (the door's remove, put-back and
approve), `engine/access.ts`, `docs/data-model.md` §11 and the full rows D1225, D1177, D1166, D1461. Condensed by the host.

**Verdict: no hole.** Nothing the change adds lets a member delete, move or decide what the rules forbid, and a forged call
from the browser's console is refused at the save, not only on screen.

1. **Delete on "All" (`clearRecords`)** — every record passes `recordTakeable` before anything is written; a refused one is
   counted, never forced. An approved leave needs the admin (`canDecide`), `warEditable` (one war-approved leave on the day)
   and its own Input id; the door checks `lw`, the leave type, the person and the date again. A bid needs his own row
   (`canEditRow`), the record by id, and a day open for him or his own pending bid on a day since closed (D1225 — a refused
   bid there stays). An OIL award is a ledger entry and is never touched (N11). The same gates and the same command type
   (`lw.edit`) as `clearRecordById` and `changeAbsenceById`.
2. **At the save** — `lw.edit` reaches `cmdAuthorize` (a member's own records only) and `ownershipViolation` (his own row;
   on a closed day only taking his own pending bid or changing its words; stamps checked for forgery; ledger, war and
   settings an admin's).
3. **`decideRequests` refuses a member twice** — in the store ("Only an admin decides leave") and at the save (`lw.decide`,
   own rule "never"); a whole leave's parts are still checked one by one (`staleWhy`, `decideWhy`, the door).
4. **Move on "All"** — `movableRecords(cells, only)` can only narrow the gated list; the commit runs `moveRecords` and its
   gates under `lw.move` — the day's list's own route (D266).
5. **`leaveRunAt`** reads only the person passed, stays inside the period of the day tapped, follows one Input id or one
   run key, writes nothing; a leave button or a filing on "All" goes through `setCellRange` / `fileStraight`, which check
   every day.
6. **Nothing newly shown** — the dates, "All n days" and the cyan come from the joined bar's own key, already on screen to
   every viewer; on another man's row a member gets no Delete or Move, and Approve / Refuse are refused.

Notes (not findings): `canEditRow` reads a missing viewer as any row (older; the save limits it, and a signed-in session
always has one). The reader's caution about UNA does not arise — UNA went with D1356 (an Other is an Input, filed through
the Inputs door).
