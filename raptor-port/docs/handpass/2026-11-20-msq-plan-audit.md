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

## Cases carried by a test

## The pictures

## Break tests

## Errors seen

## What was NOT walked, and why

## Gate counts

## Findings and their dispositions
