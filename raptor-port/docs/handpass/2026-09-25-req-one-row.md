# A request's row and its filing on a published day — D174 + D175's FULL check (25 Sep 26, evening)

His order D175 (a step between D173's 1 and 2): `[REQ-DECLINED-PENDING]` (D174) and `[REQ-TWO-ROWS]` (D175) on their own
branch, `claude/request-one-row`, cut from `main` after PR #435 merged; its own check, his look, "merge live".
Builder: Opus 5.5 (host). Scenario design: Fable 5.1 (`2026-09-25-req-one-row-fable-scenarios.md`). Code reads: Fable 5.1
and Astra, blind to each other (§6). Pictures: `docs/img/handpass/2026-09-25-req-one-row/`.

**The change, in plain words.**
- **D174** — the published face already reads a request that did not exist when the day was published as "taken off"
  (dormant). The pending comparison now agrees: such a request, filed since and taken off again, is no difference. One
  rule (`publish.ts filingSame`) read by the comparison every count reads (`filingDelta`), by the load's put-back
  (`filingRestorePlan` — so a load no longer turns it back into a fresh, flagging request) and by the sign-off binding on
  a published day (`filingKey` — so the four signed before it was filed hold again once it is taken off).
- **D175** — a load onto the working copy or a plan switch leaves out a row whose request already stands on another loaded
  day (`publish.ts rowsLeftOut` / `leaveRowsOut`, applied in `drafts.ts loadVersionToWorkingCopy` and `draftSelect`); the
  load's "Discard N edits" counts against the day as the load will leave it; the three doors' sentences name each request
  left out (`drafts.ts rowsLeftSaid` — the one sentence): "Bane · Meeting left out — it is on Tuesday's programme".

## 1. The tier — FULL
1 money **YES** — a request row on a weekend earns, so which day holds it moves what a published weekend would earn once
republished (not answerable NO) · 2 published record **YES** — the pending comparison, what an AL carries, the sign-off
binding, the load · 3 saved data **YES** — the load writes the day and the request's filing · 4 shared drawer **YES** — one
count read by every surface in §3 · 5 gesture **NO** — every door is unchanged · 6 surface **NO** · 7 roles **NO** — the
doors are the scheduler's as before; a member files a request as before · 8 warning list **NO** — a dormant request still
flags nothing, a fresh one still flags. → **FULL** (1, 2, 3).

## 2. The rules that apply
| ruling | in plain words | where it bites here |
|---|---|---|
| D174 | a request not there when the day was published, filed since and taken off, is no pending change — 0; it stays silenced; one that WAS there still counts one; the four sign-offs hold as for any change put back | the whole of the first half |
| D175 | a load or a plan switch never puts a request on a second day — it leaves that row out and says so; one day's load never moves another (AM1) | the whole of the second half |
| D98, AM20 | a day back to what was published shows nothing pending and is no amendment; the load gets it there | D174's 0; the load must not undo it |
| D103, AM11, AM13 | anything pending wipes the four; putting it back restores them | the sign-offs after the round trip |
| D114 | a request's row and its filing are ONE act, on every count | the pairing must survive both changes |
| D109, D113, AM23 | every count reads one body, in the person's unit | no surface may count apart |
| 26 Aug 26 (✕ parks a request dormant) | a request taken off flags nothing until accepted again | unchanged — D174 keeps it |
| 16 Sep 26 (a request filed live on a published day lands as pending) | the working copy takes it, the issued face does not | the filing that starts D174's round trip |
| P2-REV2-05 / P2-QREV-07 | every whole-day replacement reconciles the filing | runs after the row is left out |
| D96 | a template cannot be applied to a published day; a template's rows carry no request link | the template needs no leave-out (checked) |
| D56 | a harm only in stored demo data is not a finding | put in both reviewers' briefs |
**Clashes:** none found. D174 narrows the 15 Sep 26 filing-fingerprint note ("absent→u→r is a real change") for the
comparison only — the fingerprint itself still records 'r', and the published face already read it that way (`world.ts
fileAcc`). The note is corrected in the same change.

## 3. The roll-call — every place the count, the sign-offs, the row or the sentence is drawn
| # | surface | reads | D174 (filed → off = 0) | D175 (one row, said) | status |
|---|---|---|---|---|---|
| 1 | the edit week's day head "N pending ▾" | `dayShownPendCount` → the items | via `filingDelta` | the count after a load/switch | has it |
| 2 | the board's strip "N pending ▾" | same body | same | same | has it |
| 3 | the ⓘ day panel (week and board) | same body | same | same | has it |
| 4 | the Amendments panel's waiting line | `itemCounts(dayPendingItems)` | same | same | has it |
| 5 | the pending list and its lines | its rows ARE the items | the "taken off" line is gone | — | has it |
| 6 | the "Not yet signed / Not yet published" marker (week, board) | `dayHasChanges` + the binding | gone at 0 | — | has it |
| 7 | the four sign-offs and the sign line (week, board) | `signBoundOk` → `filingKey` + `pendingKey` | hold after the round trip | — | has it |
| 8 | Publish AL's button and the publish step | `dayHasChanges`, `daySigned` | not offered at 0 | — | has it |
| 9 | "Discard N edits & load" and the preview's pending chip | `dayDiscardCount` | the put-back plan agrees | counts against the left-out day | has it |
| 10 | the load's sentence (toast + Edit history) — preview bar on the week AND the board (one handler) | `ROWSLEFT` → `rowsLeftSaid` | — | names it | has it |
| 11 | the plans menu's switch sentence (week AND board — `switchDraft`) | same | — | names it, before the pending count | has it |
| 12 | the preview banner's "Switch to this plan" sentence | same | — | names it | has it |
| 13 | the request in the Personal Inputs group (week, board) | `inp.acc` | stays dormant ('r'), Accept offered | stays on the programme ('g') | has it |
| 14 | the ground programme on the week, the board, View-only's working-copy peek | `DAYS[di].ground` | — | one row only | has it |
| 15 | View-only Sched (the issued face) | the snapshot + `fileAcc` | unchanged — never had it | unchanged | has it |
| 16 | the stored AL (what goes out) and its item count | `dayDelta` | carries no filing for it | — | has it |
| 17 | the "already at <version>" short cut of the load | `dayDiscardCount` + `rowsLeftOut` | — | NOT taken when a row would be left out | **found and fixed before the walk (§4)** |

## 4. Found before the walk
- **RO-1 (new in this change, found by its own door test)** — with the only difference being the row the load must leave
  out, "Discard N edits" read 0 and the load handler took its "already at Original" short cut: it closed the preview and
  said "Monday is already at Original" beside Monday's "1 pending". **Fixed:** the short cut is skipped when a row would be
  left out, so the load runs (no confirm — nothing to discard) and its sentence names the request
  (`interactions.ts`, the Load handler); pinned by `reqonerow-app.test.tsx`.

## 5. The scenario round — Fable (blind; `2026-09-25-req-one-row-fable-scenarios.md`)
No ruling clash. Four design gaps and fifteen scenarios; each gap reproduced or read before disposing of it:

| gap | against `main` | disposition |
|---|---|---|
| G1 a load of a version whose record never held a request that is now on the programme on this day leaves it FRESH (it warns), where that version's face read it dormant | older — the same on `main` (the reconcile unfiles it, the put-back leaves '') | **not taken, the agent's call:** a request the loaded version never knew about has not been declined by anyone; only a deliberate ✕ silences a request (26 Aug 26), and fresh is the state that warns the scheduler of the man's real commitment. The count is the same either way. Stated in the report |
| G2 a request that was taken off when the day was published ('r' in its record) and is then DELETED (or re-dated off the day) reads "1 pending · taken off → not on the programme" and wipes the four | older — reproduced in a unit probe on this revision (1 pending, `daySigned` false) | **a question for him** (the look card, §10) and filed `[REQ-DECLINED-DELETED]` — the mirror of D174, but not what he ruled on |
| G3 every scan sees the loaded week only, so a request spanning a week boundary can still stand on both sides after a load | older (`acceptInput` has the same bound) | **filed** into `[REQ-ORPHAN-ROW]` (1) as a third reader of its stash sweep; the limit written into `engine-rules.md` |
| G4 a plan keeps the left-out row only until it is next left | by design (AM27) | **pinned as intended** (`reqonerow.test.tsx`), and the wording in `engine-rules.md` / `drafts.ts` corrected (it had said the plan's record keeps the row) |
Scenarios taken as tests: S2 (the confirm counts a real edit, never the left-out row), S4 (G4), S8 (the four hold on the → Unavail path). Taken into the walk: S1 (the board's banner), S3 (two of the four switch doors walked; the plan editor's Select goes through the same `switchDraft`), S10 (Undo / Redo), S14 (phone). Recorded, not findings: S9 (Unpublish of AL1 back to the Original leaves "Publish AL1" offered with 0 pending through the correction mark — existing behaviour, AM33), S11 (a weekend row reads 2: the removal and what the day earns — D109 by design), S13 (after publishing the left-out removal, ✕ on Tuesday leaves Monday a filing on its own — D114's stated reading), S15 (the member who filed sees nothing pending; Edit history keeps the trace).

## 6. The walk — `scripts/handpass/am/req-one-row-walk.mjs`, the production build on 4173, desktop 1440×900 and phone 390×844
Three fresh demo worlds per width, every step through the app's own controls; each check an assertion of the RIGHT
behaviour, so the re-walk is the same script. **Result: 42 / 42 PASS on both widths; the browser error list empty in all
six worlds.** Pictures: `docs/img/handpass/2026-09-25-req-one-row/{desktop,phone}/` (12 each). The script's own faults on
the first runs (the newest request looked up as "the last one" — the Inputs list is in date order; the sign-off check
reading the wrong line; Edit history not closed by Escape; View-only read without opening it; the "→ Unavail" door not
reached) were fixed in the script, never by relaxing a check.

| step | what the person does | what the app said (both widths) |
|---|---|---|
| A0 | sign and publish Monday on the board; sign the four again | ORIG; the four green; "Published at Original — no changes to publish" |
| A1 | file a Meeting for Ranger on the Inputs page | it lands on the working copy: 1 on the week head, the board, both ⓘ, the Amendments panel; the four blank, "4 to sign", "Not yet signed" |
| A2 | ✕ its row on the board | **0 everywhere**, no marker; **the four back, green, the same names** (AM11); the request faded in Personal Inputs with Accept (dormant); View-only Sched: Monday ORIG, nothing pending |
| A3 | look at the Original, Load | one tap (nothing to discard): "Monday is already at Original"; the request still dormant |
| A4 | Accept it again · ✕ · Undo · Redo | 1 · 0 · 1 · 0 |
| A5 | file an Other request (it lands) · its Undo · "→ Unavail" · Undo | 1 · **0** · 1 ("1 input filing") · **0**, dormant |
| B0–B1 | a two-day Meeting (lands Monday); publish Monday and Tuesday; ✕ on Monday; Accept on Tuesday's board | one row, on Tuesday; Monday 1 (the removal), Tuesday 1 (the addition) |
| B2 | Monday: look at the Original, Load | **"Load onto working copy" — no confirm**; "Monday: Original loaded onto the working copy — viewers still see Original until you publish · Ranger · Meeting left out — it is on Tuesday's programme"; **one row, on Tuesday**; both days' counts unchanged; the same sentence in Edit history |
| B3 | ✕ on Tuesday's row | no row anywhere; Monday 1, Tuesday 1 — never the orphan's 2 |
| B4 | Undo, Undo, Redo, Redo | never two rows at any step (the load changed nothing, so it left no undo step of its own) |
| C1–C2 | the same request; publish both; "+ Alt Plan" on Monday; ✕ on Monday; Accept onto Tuesday | Plan A parked with the row, Plan B live |
| C3 | switch Monday to Plan A (the plans menu) | **"Switched to "Plan A" — this is now the live Monday · Ranger · Meeting left out — it is on Tuesday's programme · 1 difference from Original pending"**; one row, on Tuesday; Monday 1, Tuesday unchanged |

## 7. Break tests — each wired piece broken once; each turned a named test red (files restored)
| broken on purpose | went red |
|---|---|
| the comparison ignores D174 (`filingDelta`) | 5 — the ✕ test, the sign-offs, → Unavail, the two-day request, the load |
| the signature keeps every taken-off entry (`filingKey`) | 2 — the sign-offs, the → Unavail sign-offs |
| the load puts a request back fresh (`filingRestorePlan`) | the load-keeps-it-silenced test |
| the load brings the row back | 4 — the load, the ✕ after it, the real-edit confirm, the whole-app Load |
| the switch brings the row back | 4 — both switch tests, the plan-left-again test, the whole-app "Switch to this plan" |
| "Discard N edits" counts against the version whole | 3 — the load, the real-edit confirm, the whole-app Load |
| the Load sentence drops the clause | the whole-app Load |
| the preview banner's switch drops the clause | the whole-app "Switch to this plan" |
| the plans-menu switch drops the clause | the unpublished-day switch test |
| the Load takes its "already at" short cut again (RO-1) | the whole-app Load |

## 8. What was NOT walked, and why
| not walked | why | what stands instead |
|---|---|---|
| the plan editor's "Select" and the board's plans menu as separate doors | both call `switchDraft`, the door walked in C3 | `reqonerow.test.tsx` drives `switchDraft`; the app test drives the preview banner's |
| the Amendments panel on the phone | not drawn at 390px | walked on desktop |
| a request spanning a week boundary (G3) | outside this change — filed | `[REQ-ORPHAN-ROW]` (1) |
| a weekend day (the OIL line) | reads 2 by design (S11) | D109; the unit suite's OIL tests |
| a real iPhone | Chromium's phone emulation only | his look |
