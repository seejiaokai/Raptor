# [MSQ-PLAN-AUDIT] — everything built and planned, checked for an admin with Plan of a squadron (chat 126, 20 Nov 26)

His D2242 (20 Nov 26): a dedicated run checks the many-squadron work — the app, the reshape plan, the documents and the
drawings — for every place that leaves out, or wrongly lets in, an admin with Plan of a squadron (D2201, D2211, D2241);
its faults run red first and fixed in the app or folded into the reshape plan, before the reshape is built. Branch
`claude/multi-sqn-b1-107`, worked in `C:\Users\User\projects\Raptor-msq`.

## The eight answers and the tier
1. Money — NO: nothing in the audit's scope counts OIL or who is present; revisited if a fix does.
2. The published record — NO: who may publish another squadron's day is reachable only through the Schedules menu (not
   built, P3); a fix here does not touch publishing.
3. Saved data — YES: a fix may change who may write a right, an account or a home row.
4. A shared drawer — NO.
5. A new gesture or mode — NO: no new control (words only where a refusal changes).
6. A new surface — NO.
7. Roles — YES: the whole audit is who may act for a squadron.
8. The warning list — NO.

**Tier: FULL** (questions 3 and 7). Security read: YES (who may do what — D1411).

## The roll-call
(The code's rows gathered by three Opus helpers on the brief `docs/superpowers/briefs/2026-11-20-msq-plan-audit-rollcall-brief.md`,
each row checked by the host against the code; the plan's, the documents' and the drawings' rows by the host.)

| Part | Rows | HAS IT | MUST NOT | MISSING | WRONG | WORDS | Table |
|---|---|---|---|---|---|---|---|
| The gate (`state/perms.ts`) | 63 | 45 | 7 | 3 | 6 | 2 | `docs/superpowers/briefs/2026-11-20-msq-plan-audit-rollcall-gate.md` |
| The doors and Admin → Users | 50 | 29 | 7 | 5 | 8 | 1 | `…-rollcall-doors.md` |
| The bell, the Leave War, the Tracker | 58 | 46 | 2 | 7 | 3 | 0 | `…-rollcall-bell-war.md` |
| The reshape plan (host) | 18 sentences or rules | — | 3 (giving Plan, the last-admin count, the master admin mark) | 2 (the midnight pick A-iv; a Plan holder read on the day in `pageUnit`) | — | 15 | the plan §19 PI1 |
| The documents (host) | 5 | — | 1 (a master admin's account) | — | 2 (UnitGrant's "by its own admins"; leave across a move "only a master or the man") | 2 | the plan §19 PJ1 |
| The drawings (host) | 3 pages read for who-words | — | 1 (1b: "Only a master admin gives Plan…") | — | — | 1 (1c) | the plan §19 PK1 |

**Checked by the host in the code:** every MISSING, WRONG and WORDS row of the three tables (the lines read; the
gate's #43 and the doors' 45, 47 and the re-link run red, below). The HAS IT and MUST NOT rows were read by their helper
and are open to the blind read, which is asked to break them. **Merged findings** (one fault seen by two helpers counted
once) and where each goes: the reshape plan §19 — PA1–PA3, PB1–PB5, PC1, PD1, PE1, PH1 built with the reshape; PF1, PG1,
PK1 filed under [MULTI-SQN-DESIGN]; PI1, PJ1 done. Already planned before the audit (no new work): `myUnit` → `pageUnit`
(A-ii), the last admin with no admin at home (Piece C), the posting audience (§6.2 steps 6–7), the re-link carrying a
right (guardrail 1), the held note (A6), the guest switch (B2), rights dropped on save (Piece B).

**Proofs run red by the host** (`docs/superpowers/briefs/2026-11-20-msq-plan-audit-repro/`, on `2e5468aaa`'s app code): PA1
(a)–(e), PA2 (a)–(b), PA3 (a) — 8 failed, the control passed.

## The five sizing lines (§7.0)
1. **Type:** H — who may do or see something — on code as built (nothing changed by the audit); with R's question, a
   look for faults of one family across the app.
2. **What only a walk could find here:** whether the screen OFFERS and COMPLETES each Admin → Users door to a Plan
   holder on another squadron's man (the code says the doors let him in; only the running app shows the controls work
   and what each refusal says), what his bell shows of 149's lines, and whose people his own pages show. Today a Plan
   holder reaches 149 only through Admin → Users and the bell — no screen picks another squadron or gives Plan (the
   right is stored as setup).
3. **The ledger:** two walks of type H, both found faults — five in all.
4. **The walk chosen:** one Sonnet walker (A), one script family (`msq-pa-a-*`), desktop 1536 and iPhone 402; six
   scenarios — S1 (Suspend, role, Archive and Restore, Delete of a 149 member, with Undo and Redo), S2 (the control:
   no Plan), S3 (the last admin, kept out on purpose), S4 (a master admin's account, kept out on purpose), S5 (the
   bell, recorded), S6 (his own pages, recorded) — and the plain-user round. Brief:
   `docs/superpowers/briefs/2026-11-20-msq-plan-audit-walk-brief.md`; the route driven first by the host
   (`scripts/handpass/msq/msq-pa-host.mjs`, both sizes, pictures `docs/img/handpass/2026-11-20-msq-plan-audit/host/`).
   Carried by a test, not walked: PA1–PA3 (no screen gives, takes or re-links a right yet — the proofs call the doors and
   the gate directly, so they prove the rule, never a screen's route).
5. **The row:** added to `docs/walk-ledger.md` after the walk.

## The orders walked
Walker A (Sonnet), on the frozen build of `a5271a17c` (`index-a7kr8dHR.js`), desktop 1536 and iPhone 402; report
`docs/handpass/parts/2026-11-20-msq-plan-audit/walker-a.md` (105 steps: 28 PASS, 3 FAIL, 41 RECORDED, the rest
exploratory lines).
- **S1 — Hunter, holding Plan of 149, on Osprey (149's member):** Suspend → dot red; Enable → green; Undo / Redo
  follow; role to Admin saved, Undo back to Member; Archive (no question) → the Archived list; Restore works; Delete asks
  "Tap again to delete Osprey" with its "Goes: …" words, the second tap deletes ("Osprey deleted"). **No refusal anywhere
  — HAS IT, as the roll-call said** (the host opened `a/phone/s1d-2-delete-tap2.png`).
- **S2 — Hunter without Plan (the control):** Suspend refused "He is 149's. Only an admin of 149 can change his
  account."; Archive refused "He is 149's. Only an admin of 149 can change him." PASS.
- **S3 — the last admin (kept out on purpose):** Kestrel's Suspend refused "Kestrel is 149's last admin. Make another
  admin of 149 first." (host opened `a/phone/s3-1-kestrel-suspend.png`: the band, his dot green); Osprey made admin, then
  Kestrel's Suspend allowed. PASS.
- **S4 — Saber, a master admin (kept out on purpose):** Suspend and a role change refused "Only a master admin can do
  that"; the badge stays Admin. PASS.
- **S5 — the bell (recorded):** every bell read "Nothing new" — Kestrel's after Osprey filed his own LL, Hunter's, and
  Kestrel's after the archive and the restore. No action in this build writes a 149 admin line the walk could raise on
  demand, so a Plan holder's bell audience was not seen on screen; it is carried by the code reading (§19 PB1–PB3, the
  roll-call's bell rows, checked in the code) and the build's tests.
- **S6 — Hunter's own pages (recorded):** the Leave War and Quals show 142's people only (as expected — no screen picks
  another squadron). The iPhone Inputs list opened on an empty window, so its names were not checked there.
- **The plain-user round:** a row opened and closed by its header and by Cancel; Escape and a tap outside leave it open
  (an inline row, not a window — recorded, not a fault); the search box cleared by its ✕ (rows 1 → 71); Undo / Redo after
  S1; Kestrel's Leave War after the archive shows Osprey "PO" from the walk's day with his later LL still drawn (as D1720
  rules).

## Cases carried by a test
PA1–PA3 (the proofs, `docs/superpowers/briefs/2026-11-20-msq-plan-audit-repro/`): they call `setGrant`, `removeGrant`,
`updateAccount` and the commit gate directly — they prove the rule, never a screen's route (no screen gives, takes or
re-links a right yet).

## The pictures
`docs/img/handpass/2026-11-20-msq-plan-audit/host/{desktop,phone}/` (the host's route) and `…/a/{desktop,phone}/` (walker A).

## Break tests
None for the audit itself — it changes no app code; each fault's red-first test is the build's (plan §9.1).

## Errors seen
None in the console on any run (walker A and the host's route).

## What was NOT walked, and why
- The 149 pages under a 149 pick (no screen picks another squadron — step 5); a bell line of 149 reaching a Plan holder
  (no line the walk could raise; carried by the code reading); giving, taking or re-linking a right on screen (no screen
  does it — P1). The walker reached S5, S6 and the round's other pages by the library's page routing, not the nav tabs
  (recorded only).

## Gate counts

## Findings and their dispositions
