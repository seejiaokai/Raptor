# [S4-BUGHUNT] — the merged scenario hunt plan (20 Sep 26)

> **24 Sep 26:** the hunt ran and MERGED as PR #422 (21 Sep 26) — what it built and the rules it set aside:
> `specs/2026-09-20-CURRENT-STATE.md`. The planned ground it never reached continues as `OUTSTANDING.md`
> `[S4-HUNT-REST]`. The backlog item `[S4-BUGHUNT]` moved to `OUTSTANDING-ARCHIVE.md`.

Branch `claude/s4-bughunt`, off `main` at `e904d44` (the merge of ARCH-STACK step 4, one absence
record). Scope is §3 of `plans/2026-09-20-arch-stack-4-test-coverage.md` — the ten untested areas —
and nothing else. Rules of record: `specs/2026-09-20-arch-stack-4-clash-check.md` (B1–B9, H1–H6,
owner answers A–D). Baseline before the hunt: **vitest 320 files / 5103 tests green.**

## How this plan was made

Fable 5.1 (high) and Codex (0.154.0, high) each read the coverage record, the rules of record and as
much source as they wanted, independently and read-only, from the same brief, and each returned a
prioritised scenario list — Fable 31, Codex 30. Neither saw the other's work. This file merges them:
where both arrived at the same scenario it is kept once and marked **[both]** (agreement across two
providers is the strongest signal in the set); where only one found it, the finder is named.

Raw lists, for provenance: the brief and both outputs were written to this session's scratchpad and
are reproduced nowhere else — the merged list below is the record.

## The one product question for the owner

**MED-1.** The rules of record say, in owner answer H3 (overruled, 20 Sep 26): *"leave vs leave (and
leave vs medical) overlap is judged on REAL TIMES (a half preset = its whole half; a full day = the
whole day)."* H2 separately says a medical **cuts** leave in half-day steps. Those are compatible —
real times decide **whether** there is a clash, half-day steps decide **how much** comes off.

The build does not do that. `absences.ts:inputWindow` widens every medical to its whole half before
any overlap test. So an ATT C recorded 08:00–10:00 occupies the entire morning, and leave at
10:30–11:30 that same morning is refused — or, filed the other way round, is **silently deleted**.

Both readings are defensible and the consequence is large either way, so this is the owner's call,
not the build's. Everything else in this plan is independent of the answer and proceeds regardless.

## Priority order

Ordered by likelihood × blast radius. Batches A–C hold what both planners judged most likely to be
real. Each line: what is set up, what is done, what the rules require.

### A — the OIL ask flow and hand-typed credits (area 3, 5)

| # | Scenario | Rule |
|---|---|---|
| A1 | A duty input answered "Yes, credit OIL" over a person's own **pending leave bid** on the same Saturday: the clashing part of the bid must go, a notice must sit on the day, and the credit must land. Suspected: `inputgate.replaceBids` claims only for leave/sick types, so nothing acts — the bid stays pending, no notice, no credit, and the person who said Yes silently gets nothing. *(Fable)* | H1, B5, B6 |
| A2 | **Re-time** an already-credited Saturday duty from 08:00–12:00 to 13:00–17:00 where the afternoon holds leave. Suspected: the forward pass returns "clash" and writes nothing while the reverse pass skips the address because it is still wanted — so the OLD credit stands, showing hours the person no longer worked. *(Fable)* | B4, §26.3 |
| A3 | Duty 08:00–12:00 beside leave 13:00–17:00 on the same Saturday: the credit lands beside the leave, no amber, both charged once. Includes the exact-noon boundary. **[both]** | B4, B8, answer B |
| A4 | A duty across Fri–Sun answered **"Only some days"** with just the Saturday picked: exactly one credit, on the Saturday; re-editing without changing the answers must not mint a second. **[both]** | B4, B8 |
| A5 | A hand-typed credit carrying **two** work spans (08:00–09:00 and 17:00–18:00) must leave the midday gap usable — leave at 12:00–13:00 accepted, no amber. Suspected: collapsing the spans to one earliest-to-latest envelope. *(Codex)* | B4, B8 |
| A6 | A hand-typed credit with **no** times means the whole day, so leave anywhere that day is refused **[both]**; and a publish that takes that manual credit over as an automatic one must not let a later **unpublish delete the admin's own credit**. *(Fable)* | B8, owner Q7, §18 |

### B — the medical dialog's cascade (area 2, 4)

| # | Scenario | Rule |
|---|---|---|
| B1 | **MED-1** — the question above, built as a test once the owner rules. | H3 as overruled, H2 |
| B2 | An all-day OML 12–18 Jul over a kept ATT C (13–14) and a kept HL (16–17) must mint **exactly three** OML pieces — 12, 15 and 18 — none bridging a kept day, none lost. *(Codex)* | B1, B3, B7 |
| B3 | "This replaces it, keep the tail" must split the original medical **exactly once** (no duplicated boundary day), the minted piece must cut the leave underneath, and **one** undo must put everything back. **[both]** | B1, H2, B7 |
| B4 | The same-type refusal ("a ATT C is already filed over these days") must fire **before** anything is touched — the neighbouring leave must not be cut by the attempt — on the **add** route and on the **edit** route and through the **calendar drag**. **[both]** | B7, H2 |
| B5 | **Cancelling** the dialog must leave no partial edit: figures, marks and manning identical to before it opened. *(Codex)* | B1, B3 |
| B6 | An **upchit** on a day inside a medical that had already cut leave: the medical trims, the leave stays cut, the war repaints at once. *(Fable)* | H2 |

### C — the Inputs-page calendar (area 1) — the one door with no test at all

| # | Scenario | Rule |
|---|---|---|
| C1 | Drag a leave chip onto the person's own **pending bid** (replaced, notice, undo restores both); onto **other leave at overlapping times** (refused whole, blocker named); onto a **day they are recorded working** (refused). A refusal must not strand the drag ghost or leave the day highlighted. **[both]** | H1, B7, answer B |
| C2 | Drag a **multi-day** leave onto days holding full-day bids: only the overlapped dates and halves of each bid go, each with its own notice; the rest keeps its state. *(Codex)* | answer B, H6, B5, B6 |
| C3 | **Hold-to-add** on one empty day files exactly that date at exactly those times — never a range, never the neighbour. *(Codex)* | B1 |
| C4 | Drag a **medical** chip onto leave days — the cut rule must apply through the drag door too, and one undo must restore both records. *(Fable)* | H2, B7 |

### D — bulk gestures driven by a real drag (area 7)

| # | Scenario | Rule |
|---|---|---|
| D1 | Bulk **approve** over a day where filed leave sits above an undecided bid — it must decide the bid, not read the day as already decided. *(This was the bug the last sweep found and fixed; here as a regression through a real drag.)* **[both]** | B1, B3 |
| D2 | Bulk **fill** over a mixed rectangle (empty, existing bid, filed leave, medical, split-half day): written where allowed, skipped where forbidden, and the sheet's counts and wording must match what actually happened. **[both]** | B1, B3, B7 |
| D3 | Bulk **delete** removes the editable requests and war-owned leave only — never the medical, never the automatic credit — and every surviving cell recomputes its main code and its grey count. *(Codex)* | B1, B4, B9 |
| D4 | Bulk **move** is all-or-nothing when one landing day clashes, and a course on a selected day must never enter the move at all. *(Codex)* | B7, H6, B2 |
| D5 | Bulk **refuse / back-to-pending** over a rectangle holding an already-approved leave. *(Fable)* | §5.2 |

### E — switching wars, open sheets, and undo (area 6)

| # | Scenario | Rule |
|---|---|---|
| E1 | Switch wars **with a sheet open**: the old sheet must close or go inert — no control from the old war may write into the new one, and nothing may crash on a day the new war does not have. **[both]** | B1, B7 |
| E2 | **Undo after switching wars** must come back to the war the change was made in and undo it there, touching nothing in the other war. **[both]** | B1 |
| E3 | A **redo the rules must refuse** (the day now holds a medical): refused by name, nothing half-applied, the app does not throw, the history pointer stays honest. *(Fable)* | B7 |
| E4 | **Undo across a reload**: both buttons off, a forced click does nothing, the saved change stays. **[both]** | B1, B7 |

### F — figures and manning on multi-record days (area 10)

| # | Scenario | Rule |
|---|---|---|
| F1 | Four records on one day (two leaves at non-overlapping morning times, a course, a medical): the box shows one code with a grey +3, the tap list shows all four, **the longer morning leave pays the half and the other pays nothing**, the medical total moves, and the manning count removes the person **once**. **[both]** | B1, B3, B9, H3, answer D |
| F2 | A **posted-out** person with two half-day leaves on one day: both show, both charge, manning unchanged. *(Codex)* | answer C |
| F3 | Leave dated **before someone's posting-in**: shows the leave code in an otherwise blank box, charges, never counted for manning. *(Fable — the case the owner changed on 20 Sep.)* | answer C |
| F4 | A day holding **only a notice** (its bid was replaced by a publish, then the day was unpublished): an empty box with an amber mark, and the list must still open on it. *(Fable)* | B6 |
| F5 | The **15-day pilot run** continued through a day whose two halves are different leave types — the run reaches 15 and weekends start charging. *(Fable)* | H4 |

### G — phone, by touch (area 9)

| # | Scenario | Rule |
|---|---|---|
| G1 | Touch drag-select and the two-step move at 390px, all-or-nothing when one landing day clashes; a quick flick must scroll and never arm; a wobble must give up. **[both]** | B7, H6 |
| G2 | The **tap list at 390px with eight records** on one day: every line present in ladder order, the last line and the close button reachable, no sideways scroll, no console errors. **[both]** | B1, B6, B9 |

### H — storage faults (area 8)

| # | Scenario | Rule |
|---|---|---|
| H1 | A storage write that **throws part-way through one group**: the app must say it did not save, and a retry must land the whole group — never the input without the bid removal, never the removal without the notice. **[both]** | B1, B5, B6, B7 |
| H2 | The same fault, then the page is **closed and reopened**: the boot replay must finish the group, and reopening again must not duplicate anything. *(Codex)* | B1, B6 |
| H3 | **Two tabs** — record exactly what is lost (a known limitation), and prove the loss never corrupts the store into a demo reset, and never leaves two records the rules forbid. **[both]** | B1, B7, H3 |

## Dropped as already covered

Everything in §2 and §2b of the coverage record, and §1's fixed bugs except where a scenario above
re-runs one as a regression through a path that had no test (D1, and the balance column repaint on
the calendar-drag path inside C1). §4's deliberate behaviours are not tested as bugs.

## Both planners' least-likely calls

Codex: the same-type medical refusal itself — a small, early, exact-worded guard; the danger is only
in what sits around it (B4 keeps it for that reason). Fable: undo across a reload (session-only by
design), the two-tab clobber (documented), and the figure/manning readers themselves — every one it
traced takes the merged records, so F1–F5 target the separate call sites, not the engine.

They agree, independently, on where the danger is: **the OIL ask flow's dealings with the credit
pass, the custom-time medical window, and the calendar chip drag.** Batches A, B and C first.
