# Fix read 5 — the security read (D1411), 19 Nov 26

A fresh Opus security reader, blind to Astra, the fresh Opus reader and the walk, on its own exported copy of
`claude/multi-sqn-b1-107` at `5d0e3f2f3` (brief `…-fixread5-brief.md`, questions 1 and 2, claims 1–4). Condensed by
the host (chat 111): every finding, cause, fix, proof and negative kept. Its finding reproduced red by the host in the
checkout and fixed the same hour (below).

## FR5-SEC-1 (medium) — claim 1's fix ran only part of a member's own-input rules
Hunter, 142's plain admin moved to 149 from tomorrow, could still save his own leave on 149's days carrying a forged
"who placed it on the war" stamp (`lwBy` / `lwAt`), and rewrite that stamp on a leave 149's war approved — a member in
his place refused both; the same after the move on 142's days. The stamp shows as the leave's "Placed" fact in the war
(`leavewar/ui/placedfacts.ts`) and is copied to the war's request as `placedBy` / `placedAt` when the leave is put back
(`leavewar/sync.ts`). Cause: `inputUnitViolation`'s admin branch called `inputBreach` only; the member section runs a
second test after it (the M4 8.6 stamp test), which `inputBreach` does not hold. Not introduced by these commits (before
them O1 let an admin's own input through with no check at all). Fix: the stamp test made one function used by both
callers. Proof: `zz-fr5sec-admin-own-input-placer.test.ts` — 2 red, 1 control green.

## Question 1 — every bell reader goes through the read rule: yes
The list (`noticesFor`), the unread count and lit bell, "mark all read", the holiday line lookups and a tap on a line all
go through `noticeLive` → `noticeLeftBell`; the gate, storage, the snapshot and the take-back writers' own facts read
`NOTICES` directly, as they must; the derived posting lines are limited to the war's own squadron's admins.

## Question 2 — the exceptions are narrow (negatives, green in `zz-fr5sec-bell-negatives.test.ts`, 4/4)
A forged put on a 149 bell labelled Undo/Redo — refused; a forged delete of his own line on a 149 bell the timeline does
not hold — refused; a forged posting take-back deleting a 149 man's line — refused (`postingTakeBack` gone, which also
closes fix read 4's Astra §1); `leaveOut` acts only on notice puts whose line has left its holder's bell, never a line
about himself, a man who never moved or a non-notice change, and is a client-side filter only (the gate still judges
every record sent); claim 1's other doors (a placeholder, ALL / ALL AVAIL, another person named) take the squadron test;
rights and homes read from the rows before the command.

## Not findings
A 142 admin's line with a made-up input id on a 142 man's bell counts as "about himself" after his move (older, written
while he was 142's); holiday lines crossing by design (SEC-2); the filer's lines as "about himself" (a reading of D2218,
question 3).

## Done (chat 111)
Fixed: `state/perms.ts` `warPlacerForged`, called by the member section and the admin own-input branch; the proof kept
as `src/state/multi-sqn-fixread5-admin-placer.test.ts` (red before, green after); multi-squadron, M4 and permission files
32/456 green; code check: no new finding.
