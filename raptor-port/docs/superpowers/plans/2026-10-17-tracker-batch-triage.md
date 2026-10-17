# The Tracker batch — the triage of its open items (17 Oct 26, the night's run)

His word, 17 Oct 26 (`/overnight`): the Tracker batch next (D495), its features put to him in rounds of at most four
questions with pictures; NOT the progress graph (D774 — its questions, design and build wait for his word). The only
feature his wishlist names for the Tracker is that graph, so the batch is the Tracker's open small finds (D490) and the
few items that need his decision. Linked from `OUTSTANDING.md` `[FEATURE-WISHLIST]`.

**How it was made:** a fresh Opus helper read every open Tracker item in `OUTSTANDING.md` whole, each cited ruling's full
row, the archive and `main`'s history, and the code where cheap; its report is kept below as returned (§2), then the
host checked each claim the round's questions rest on (§1).

## 1. What the host checked, and the round put to him

__HOST__

## 2. The helper's triage, as returned

Line numbers are `OUTSTANDING.md`'s on 17 Oct 26.

| # | Item | What a person meets | Status | Kind | Seen? | Size |
|---|---|---|---|---|---|---|
| 1 | `[TRK-ATTEMPTS]` (438) | remember a student's earlier tries at an event, not only the latest grade | open; filed before D371 — since then the pop-up keeps every failure with its own day (ST-02, ST-02X…), "Done on" carries the pass's day, every mark is stamped who and when | FEATURE | yes | small–medium |
| 2 | `[TRK-DISK]` (443) | a nearly-full-storage gap in the one-time conversions | open, half stale (the rename half no longer applies since ids) | waits on `[DB-STEP]` (D473) | no | medium |
| 3 | `[TRK-PINCH-ASK]` (774) | his iPhone look at the pinch fix | open; D134 settled the feel | his look owed — a line on the look card | yes | small |
| 4 | `[TRK-SAVE-FAIL-SAYS-SAVED]` (870) | inside Raptor a failed save still shows the Tracker's green "saved" while Raptor's band says "Not saved — Retry" | open | fault, settled fix (the note follows the real save; D587) | yes | medium |
| 5 | `[TRK-KEY-NAME-CLIP]` (879) | a longer name on the LEFT of the Students card's key is cut at the card's edge | open (checked: fixed-width box) | fault, settled fix ("every name inside the card"), before/after on the look card | yes | small |
| 6 | `[TRK-IMPORT-ONE-GROUP]` (902) | an Import is saved as many groups; a failure part-way leaves half an import | open | technical, settled fix | no | small–medium |
| 7 | `[TRK-FIRST-ORDER-PLACE]` (910) | a second tab can undo the FIRST ⇅ Reorder of syllabi | open | technical, settled fix | barely | small |
| 8 | `[TRK-UNDO-WRITES-DEFAULTS]` (919) | the first ↶ of a mark stores a pace, lulls and dates nobody set | open | technical, settled fix (D372) | no | small |
| 9 | `[TRK-REMOUNT-LANDING]` (997) | coming back to the Tracker the chart lands at its top corner, or with empty chart above | open | fault, settled fix (land as picking a student does — D376, D377) | yes | small |
| 10 | `[TRK-ASYNC-STALE]` (1252) | once storage is slow, a job could act on the course switched to | open; cannot happen today | waits on the database (D473) | no | medium |
| 11 | `[TRK-FLEXBAR-INK]` (1276) | the side panel's Currency & Flex bars print white words on green and amber (about 2.1 : 1) and red (3.4 : 1) | open; its look-card question never answered | fault needing his choice (a contrast change to a look he chose — design guide §4) | yes | small |
| 12 | `[TRK-REFUSALS-UNTESTED]` (1351) | some chart-editor refusals have no test | open | technical (tests) | no | small |
| 13 | `[POST-OUT-TRACKER]` (1479) | a man deleted through Post out stays on his Tracker courses as plain text | open; D299 says his place on any course "still running" goes; question 5 of the post-out look card never answered | fault needing his choice | yes | small–medium |
| 14 | `[TRK-FLIGHT-LABEL-READABILITY]` (1930) | clearer words inside blue flight balls | ALREADY DONE — the tapered wing (D566), live in PR #481 | close | — | — |
| 15 | `[TRK-FILE-TRANSFER-SPLIT]` (1946) | — | partly done, on this branch | technical, job 1 | no | — |
| 16 | `[LOOK-13OCT-SMALL-FIXES]`, the Tracker part (2280) | L14–L16 on the date boxes | ALREADY DONE, live in PR 506; the item stays open only for the OIL bar's iPhone look | archive at the next documents pass | — | — |
| 17 | `[TRK-WIREBOARD-REPEAT]` (2350) | in Edit chart layout every ball moved re-wires the chart: a wheel step zooms n+1 times after n moves (inferred: a Connect / Text click may fire twice too) | open, confirmed in code | fault, settled fix | yes | small |
| 18 | `[TRK-BALL-OFF-CHART-LEFT]` (2353) | a ball dropped left of / above the chart's start is cut off and ⤢ Fit cannot bring it back | open, confirmed | fault, settled fix (stop a drop at the start — D899) | yes | small |
| 19 | `[TRK-KBD-CHART]` (2368) | the chart and the marking pop-up cannot be used by keyboard | open | FEATURE, "his to place" | yes | medium–large |
| 20 | `[TRK-DATEBOX-SAFARI-ZOOM]` (2400) | in Safari 621–1050 wide the side panel's calendar may open away from its box | open, unproved, low | prove first, fix only if real | yes | — |

**Its recommended round 1** (decisions before faults, one decision each, none depending on another): (1) earlier tries
at an event — is what the pop-up keeps already the attempt history (recommended), or a dated list of earlier grades too;
(2) the chart by keyboard — one Tab in, the arrows walk the flow, Enter opens the pop-up, Escape back (recommended), or
Tab through every event, or leave it to mouse and finger; (3) a deleted man on the Tracker — he leaves every course where
he still has events not done, his record kept on courses he finished (recommended, D299's own split), or stays as today,
or leaves once his End date B has passed; (4) the Currency & Flex bars — dark words on green, amber and red, white kept
on grey (recommended), or keep white.

**Faults with settled fixes that can ride without asking:** seen — `[TRK-WIREBOARD-REPEAT]`, `[TRK-BALL-OFF-CHART-LEFT]`,
`[TRK-REMOUNT-LANDING]`, `[TRK-KEY-NAME-CLIP]`, `[TRK-SAVE-FAIL-SAYS-SAVED]` (each on the closing look card); not seen —
`[TRK-UNDO-WRITES-DEFAULTS]`, `[TRK-REFUSALS-UNTESTED]`, optionally `[TRK-IMPORT-ONE-GROUP]`, `[TRK-FIRST-ORDER-PLACE]`.
Prove first: `[TRK-DATEBOX-SAFARI-ZOOM]`. His iPhone line: `[TRK-PINCH-ASK]`. Waiting: `[TRK-ASYNC-STALE]`, `[TRK-DISK]`.

**To close or archive:** `[TRK-FLIGHT-LABEL-READABILITY]` (live, PR #481 — and possibly its two siblings from the same
job, `[INSIGHTS-CLOSE-STAYS-VISIBLE]`, `[LOGIC-STICKY-SEARCH-COMPACT]`, unverified); `[LOOK-13OCT-SMALL-FIXES]`'s
Tracker part (live, PR 506); the priority list's stale line calling `[TRK-DATE-BOXES]` waiting (merged, PR #496,
archived); `[TRK-ATTEMPTS]` if he answers its question "as is"; `[TRK-DISK]` rewritten without its stale half.
