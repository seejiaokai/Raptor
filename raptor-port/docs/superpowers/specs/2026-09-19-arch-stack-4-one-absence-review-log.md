# ARCH-STACK step 4 — one absence record: red-team log

Companion to `2026-09-19-arch-stack-4-one-absence-design.md`. Host: Claude (Opus 5, high).
Reviewers: Codex (GPT-6 Astra, high, read-only, via claudex-loop runner) and Fable 5.1 (read-only
subagent). Raw reviewer output lives in a scratch dir that does not persist; this is the record.

## Round 1 — design Rev 1 (stored projection), 19 Sep 26

**Codex: REVISE (7 findings). Fable: REVISE (12 findings). Converged.**

Both independently broke Rev 1's central choice — keeping approved leave as a STORED war cell
written only by the absence command:

- A war cell is a function of several absences (AM + PM from two filings combine into one cell;
  `sync.ts:538-596`), so one `inputId` per cell cannot represent it (Codex OA-001, Fable FB-01).
- A stored copy must be rebuilt on boot, war creation, a cleared blocking request, roster gain and
  after a half-finished save; `runInbound` does all of those implicitly today and Rev 1 deleted it
  (OA-002, OA-004, OA-005, FB-02).
- "For each Input the envelope changed" is unreadable from inside a reducer, and the Inputs page's
  own add form + medical splits bypass `commitNewInput` (FB-03).
- The nested `persistNotify` branch writes the war to storage inside the reducer, before a possible
  rollback (FB-04), and notifies mid-reducer (FB-05).

Other findings: bulk gestures would become many envelopes (OA-003); OIL and manual FO/HO credits
break "approved needs inputId", and `source` has readers Rev 1 didn't list (OA-006, FB-06);
incomplete decide transitions (OA-007); member date-edit keeps `lw` provenance (FB-07, owner
question); new absences silently change a published day's Unavailable face (FB-08, pre-existing,
owner question); unregistered command types / undo phrases / seed origin (FB-09); `acc:'g'`
derivation is scope creep on a parity axis (FB-10); split loses `mod` / `LATEOFF` (FB-11);
locked-week approve wording (FB-12).

Fable verified as correct (not to re-litigate): balance maths charges pending and approved alike
(`charge.ts:148`, `availability.ts:101`); restore goes through `write()` seams with no projector;
`mayReverse` gives the right answers; the storage reset clears inputs + weeks + leavewar together;
off-types never land ground rows.

**Host disposition:** the convergent finding means the stored copy IS the fragility step 4 exists
to remove. Rev 2 stops storing absences on the war: requests + OIL credits stay stored; the
absence layer is derived on read from INPUTS through one merged `getState()` with per-person
structural sharing. Full finding → disposition map: design §15. Two owner questions: design §13.

## Round 2 — design Rev 2 (derived on read), 19 Sep 26

**Fable: REVISE, "close"** — the derived-on-read model is right and dissolves most of round 1, but
four load-bearing wrong-reads: the balance figures read the raw `state.wars` via `figureCtxOf` /
`setBalance`, not `getState()` (FB2-01, HIGH); deleting `raptorOwns` leaves every writer/affordance
blind to absences, and credit/refused-vs-absence was undefined (FB2-02, HIGH); an index keyed by war
misses a later-created war (FB2-03, HIGH); nothing bumps the LW version after an Inputs filing, so
the war never repaints (FB2-04, HIGH). Plus: nested `persistNotify` still persists request deletes
before a possible rollback (FB2-05); refuse→approve loses the remark (FB2-06); the structural-sharing
rationale was wrong — rows take the whole maps + `version` (FB2-07); signature fields unstated
(FB2-08). Both owner questions judged correctly framed; nothing else is an owner decision.

**Codex round 2:** the runner crashed on a Windows console encoding error (a `→` character) before
completing — no review, not an approval. Re-run on Rev 3 with UTF-8 mode.

**Owner answers (19 Sep 26):** Q1 — a member's re-dated war-approved leave "stays green but has an
input blue line at the left just like the input standard" (= clears `lw`; blue "filed on the Inputs
page" edge; today's visible behaviour). Q2 — the published-day Unavailable gap is its own follow-up
after step 4 (`[PUB-UNAVAIL]`).

**Host disposition:** all eight folded into Rev 3 (design §16).

## Round 3 — design Rev 3

(pending)
