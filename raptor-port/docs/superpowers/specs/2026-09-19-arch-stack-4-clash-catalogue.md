# ARCH-STACK step 4 — Leave War clash catalogue (19 Sep 26)

Companion to `2026-09-19-arch-stack-4-one-absence-design.md` (§25–§26). The owner asked both
providers to list EVERY way two or more things can meet on one person + day on the Leave War, bundle
them, and recommend a rule for each. Codex (GPT-6 Astra, high, ~100 scenarios, 9 bundles) and Fable
5.1 (~50 scenarios, 12 bundles) worked independently and read-only against checkout `dff72cb`; the
host merged them. Raw outputs are not persisted; this is the record. Owner answers are recorded
inline as they arrive.

## Findings both providers agree on (build rules, not owner questions)

1. **Figures read the RECORDS, never the box.** Today every balance, the medical/leave totals, OIL
   earned and manning read the ONE code stored per day (`charge.ts:145-150`, `counters.ts:139-144,
   197-202`, `availability.ts:85-102`). With allowed combinations (AM LL + PM OIL; LL + ATT B;
   worked morning + afternoon leave) that under-charges half-days and loses OIL earned. Rule: each
   absence charges its own portion to its own counter; medical totals sum per record; a credit earns
   whatever is displayed; manning = 1 − (sum of removed portions of all records, capped at 1).
   This **replaces design §20.5's "charging stays on the displayed code"** for legitimate pairs; the
   conservative conflict treatment stays only for legacy contradictions.
2. **The box:** the main code + a corner mark. Grey `+n` = more records, all compatible; amber `!`
   = a contradiction an admin must resolve (also on the clash strip). Tapping lists every record with
   its own actions (design §25 OA10-001). Main-code order: a full-day absence over a half; AM before
   PM; ATT C/HL/OML over leave; leave over ATT B; any absence over an OIL credit; PO over everything
   outside the squadron window; a request only when nothing else is there. The main record keeps its
   own colour, blue left edge and moved stripe. Comp: `docs/img/step4-multi-record-box.png`.
3. **Every door enforces the same rules** — Inputs form, Inputs calendar drag, board reassign
   (checked against the DESTINATION person), war bid, war approve, war drag-move, redo (a redo that
   would now create a forbidden overlap is refused with the blocking record named).
4. **Overlap is judged on real times**, using the app's one split (morning 00:00–12:00, afternoon
   12:01–23:59; a record with its own times uses them; overnight records are split across the two
   dates). An end at 12:00 and a start at 12:01 do not overlap.
5. **Design correction (Fable):** design §3.1 row 6 / §18 OA3-004 said "a credit that was there first
   keeps the cell — today's behaviour". Wrong for one door: today an Inputs-page leave OVERWRITES an
   auto FO/HO credit (`LW store.ts:3026`); only a war bid is refused by it. Moot under §26.3's time
   rule; the justification is corrected here.
6. **Existing rules kept as they are:** newer medical wins its days over older medical; same-type
   medical overlap refused ("edit that entry"); an **upchit already ends a covering medical early**
   (the medical is cut to the day before, `medical.ts:145-153`) — this answers the earlier upchit
   question; leave on weekends/PH charges nothing (except the long-run rule); "Off day" still charges
   leave (owner, 2 Sep); bidding reopening never changes decisions; ground crew never count for
   manning; personal activities (appointments, meetings, training) during leave are allowed and never
   appear on the war (the schedule's own warning stays); two wars can never cover one date.

## Owner decisions needed (numbered as put to the owner, 19 Sep 26)

| # | Bundle | Question | Recommendation |
|---|---|---|---|
| 1 | Half days | Two half-day leaves of different types on one day — deduct BOTH? (today only the morning one is deducted) | Yes, both |
| 2 | Half days | May a member BID two different halves (morning LL, afternoon OIL), or bid the free half next to filed leave? (today one bid per day) | Yes, one bid per half |
| 3 | Bids | Full-day LL bid, then the member files morning-only LL — what happens to the afternoon? | The morning becomes leave; the afternoon stays a pending bid |
| 4 | Bids | ATT C/HL/OML filed on a day with a pending bid | Medical replaces the bid on those days (like approved leave); ATT B keeps the bid |
| 5 | Worked days | A pending bid on a day the published schedule later credits as worked | Keep both; the time-overlap check runs when the admin approves |
| 6 | Worked days | Medical on a day the schedule says he worked | Keep both; ATT C/HL/OML get the amber `!` + clash strip; ATT B + work is fine |
| 7 | Worked days | Hand-typed OIL credit with no times, then leave that day | Treat it as whole-day work unless the admin adds times |
| 8 | Course / OD | Show courses and overseas duty on the war from the Inputs entries (one record), refuse leave that overlaps them, allow a course inside an OD, allow medical over either (amber `!`) | Yes (Fable: OD only, drop CSE from the war — host prefers both, courses take people out) |
| 9 | Posting | Leave dated after a posting-out (or before a posting-in) | Refuse new; keep existing on file with amber `!`, and do NOT charge it |
| 10 | Years | Is each leave day deducted from the balance of the war/year it falls in? (today balances run continuously across wars, no yearly reset in the charge) | Owner to state the squadron's practice |
| 11 | Years | Moving a bid from one war into the next (31 Dec → 1 Jan) | Refuse for now (today's behaviour) |
| 12 | Calendar | Leave on a "No leave" day (today: a warning only) | Keep warning only |
| 13 | Long leave | The 15-consecutive-days rule (weekends then charge) — should it apply only to LL/OL? Today the code applies it to any single leave type, e.g. 15 days of OIL | Only LL/OL, as the rule's own explanation says |
| 14 | Inputs route | A member can file leave on the Inputs page for any date, even when the war is closed or outside the bidding window, and it counts as approved with no admin step — intended? | Keep (it is the "already approved" record), but confirm |
| 15 | SANS | A SANS "available to fly" offer on a leave day | Warning when filing, never refused; never on the war |

## Deferred / out of scope (recorded)

Multiple tours (leave, return months later) needs dated membership periods → `[RECALL]`/`[XFER]`.
Two tabs / two devices → `[DB-STEP]`. A production Leave War import does not exist today; any future
importer must pass the same doors. Offered SANS capacity as its own manning figure → future.
