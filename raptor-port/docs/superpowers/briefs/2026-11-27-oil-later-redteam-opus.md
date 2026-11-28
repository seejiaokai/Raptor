# Red team of the [OIL-LATER-PASSES-ON] plan — fresh, blind Opus read

Read: the exported copy of commit dcf9b56dc (C:/rt/oil209, branch claude/oil-later-209), read-only. HANDOFF.md and the
evidence sheets were not opened. Files read: the plan; ui/oilsign.ts, ui/OilDayList.tsx, ui/oilday.ts, ui/pops.ts
(OILSIGN_LATER); engine/publish.ts (currentBind / currentBindNow, pendingKey, setSign, signBoundOk, oilBoundOk,
oilRvBoundOk, signRoleOk, signShown, filingKey, oilDelta, dayDeltaIn); engine/oilev.ts (projectOilInputs,
oilEvidenceNow, oilEvidenceKey, insSeg, oilMovedInputsOnly, oilSignKey, oilKeyNoMem, oilKeyBeforeStand,
oilInputEligible, claimDefault, oilEarnedWork); engine/canonical.ts (digest); engine/oil.ts (voidedOil, repricedOil);
every writer of an input's OIL answer (ui/oilday.ts, ui/InputWindow.tsx x3, ui/InputsPage.tsx reviseOil,
ui/inputedit.tsx x4, ui/reqdoor.ts unmark); state/perms.ts (the answer check); leavewar/sync.ts oilEarningDay; the tests
ui/oilsign.test.tsx, ui/timeguard-oil.test.tsx, engine/oilev.test.ts, engine/oilmembership.test.ts; the rulings line
oil.md 52; docs/engine-rules.md (the OIL axis, "what a signature binds to").

## What checks out (so the reader knows what was tested and held)

- **The engine change is in the one right place.** `oilSignKey` is called from exactly one site
  (`currentBindNow`, `oil:` axis). Every door that writes an answer writes `r.oil`, which reaches the signature only
  through `projectOilInputs` → `ans` → the last field of `insSeg`. Nothing else in the binding reads the answer:
  `dg` (the canonical digest — the inputs are not in the day's content map), `fil` (filingKey reads `acc` only), `rev`,
  `base`, `iso`. So dropping the answer from the sign key's input part covers the list, the input's own "OIL?", the
  Inputs page's row and the bell line at once (D2801's three doors), as the plan says.
- **Nothing else in the key moves with an answer.** `earns` comes from `oilEarningDay` (weekend / holiday for the
  squadron), never from an answer. `oilInputEligible` / `effectiveStand` do not read `ans`, so an answer does not move
  `stand`, eligibility, or the ALL AVAIL membership (`sent`) — and membership is out of the sign key anyway.
- **An answer that rides with another change still takes the names down**, as it should: a hand-over or swap moves
  `claimWho`; a re-timing moves `win` (and the repriced/voided answer goes with it — the amount is priced from the same
  hours that make `win`, so there is no "amount moved, window did not" gap); a retype moves `type`; un-cancelling with
  an answer (reqdoor `unmark`) moves `stand`; an accept moves `acc`; a new input adds a segment; a multi-day input
  answered in its window leaves the names on each day it covers.
- **The comparison keeps the answer** (`oilEvidenceKey` and `oilMovedInputsOnly` keep `insSeg`), so on a published day
  an answer is still a pending OIL change and `pd` (pendingKey, the sorted `dayDelta`) still takes the names down —
  D103 / AM11 behave as before, Undo puts them back.
- **The old-binding paths in `oilBoundOk`** cannot be matched by accident by a new-form key (field counts differ); old
  bindings read unsigned once — demo data, D56, not a finding.
- **No sign-off can now loop or sign with nobody asked** through the Later memory: the memory is gone, `signAsks`
  asks whenever the list has an open row for an admin of the list's squadron, Later is always offered while rows show,
  the end-time refusal still comes first (`signPick`, then `writeSign`'s backstop), and a refused write leaves nothing
  to "use up". A hold whose week / squadron / plan changed is still dropped by `holdStands`. A second box pressed
  while the list is up replaces the hold (the list is re-keyed on the hold), signing nothing for the first.

## Findings

### F1 — On a published day the plan's flow wipes the Later signatures, and the foot words promise otherwise (put to him first)

**Steps.** Saturday 18 Jul is published. A member files a Training on it (a pending amendment — the four fall, as
today). The scheduler with no authority picks himself in CUR CK → the day's OIL list opens → he presses Later: "Later:
Ace signs, and the next sign-off asks again" → CUR CK signed. The same at SKED CK and PLANNED BY. Management picks
APPROVED BY → the list asks → Yes · FO → Save.

**What the screen shows.** CUR CK, SKED CK and PLANNED BY read empty; only APPROVED BY stands; "Publish AL" is greyed
until the three sign again (now without being asked, the question answered). The foot told each of them "Ace signs" —
his name was then taken down by the very answer the line said the next sign-off would give.

**Cause.** `holdSave` writes the answer, then the name. On a published day the answer moves the OIL entry of
`dayDelta` (`oilDelta` keeps the answer, by design), so `pendingKey` moves and every binding given before it falls
(`signBoundOk` compares `pd`). The plan keeps this on purpose, reading D2801's "on a day not yet published" as a limit
on D2800. But D2800's own words ("an OIL answer does not clear the names already signed") carry no such limit; D2801
extends the rule to the other doors on an unpublished day. Where the two do not clearly settle the published case, his
rules say it goes to him as a question (how-we-work, Records: "where the newer one does not clearly cover the case, it
goes to him as a question") — the plan decides it by the agent's reading without saying so in its Questions section.
The same flow also makes the plan's last-box choice wrong there: on a published day, "Save" on the last box with some
rows picked takes the other three down, so "the next sign-off asks the rest" would be TRUE there, and the plan's "no
line" leaves him unwarned that Save un-signs three boxes.

**Fix.** Put it to him as Q2, with a picture of the published day after management's Save: (a) as planned — a
published day's answer is a change like any other (D103), and the foot on a published day says what will happen
(Fable's words; e.g. that an answer will need the day signed again); or (b) the names stand on a published day too —
the signature's copy of the pending comparison (`pendingKey` only, never `dayDelta`) writes the OIL entry with the
answer left out, so the count still reads "1 pending" and the names stay. Until he answers, the foot words on a
published day must not promise a signature that the next answer removes, and the last-box rule must be read per
published / unpublished. Test 4 follows his answer.

### F2 — A changed answer after the four have signed now publishes OIL no signer saw (his rule's words cover it; its consequence is not named)

**Steps.** Saturday not yet published; Bane's Training open. The scheduler presses Later at CUR CK, SKED CK and
PLANNED BY; management at APPROVED BY picks **No** and Saves → four signed. Bane opens his own input → "OIL?" →
Change… → Yes · FO → saved (his own record: `state/perms.ts` returns early for `own`, any well-formed answer passes).

**What the screen shows.** All four names stand; "Publish" is offered; published, Bane earns a full day of OIL that
management refused, and no sign-off box ever moved. Before this build the four fell and had to sign again, so
management saw it. The same for a scheduler changing Yes → No on the Inputs page's row, or a second scheduler
answering on the list after APPROVED BY.

**Cause.** `insSegSign` drops the answer whatever it is — open → answered and answered → changed alike. D2801 says
"Any OIL answer", so this is within his words, but the plan names neither this consequence nor a test of it, and the
answer written from the list is the member-editable `r.oil`, not the scheduler's switch (`oild`), which stays bound.

**Fix.** Put the consequence to him in one line with a worked example (the case above), recommending one of:
(a) as ruled — any answer, first or changed, leaves the names; or (b) only a FIRST answer passes the signature — the
binding also keeps, per input, the answer it was signed with where there was one, and `signBoundOk` requires each kept
answer to be unchanged (an input open at signing is free). (b) gives him his use (Later, then management answers, the
names stand) and still takes the names down when an answer someone signed over is changed. Either way add the test:
four signed after an answer, the answer changed, the names stand (a) or fall (b).

### F3 — An answer can still take the names down on a day not yet published, through the Logic-values axis (pin it and say it)

**Steps.** Saturday not yet published, Bane's Training open; the four sign by Later. An admin changes "Full day of
OIL" (or the default rally) on the Logic page — nobody earns from the open input, so nothing shifts and the four stand.
Then an answer Yes is given.

**What the screen shows.** The four names vanish on an unpublished day, after an answer — what D2801 says an answer
never does, and what the plan says ("an answer leaves every name standing … the `orv` axis is untouched").

**Cause.** `oilRvBoundOk` asks `oilRuleShift(DAYS[di], {...oilEvidence(di), rv: was})` with TODAY's answers: once the
answer makes Bane earn, the Logic change since signing now moves his OIL.

**Fix.** Keep the behaviour (it is the Logic change the four never signed, D592 (4), not the answer), but correct the
plan's claim, pin it with a test (sign by Later, change a Logic value, answer → names fall; no Logic change → stand),
and say it to him in one line with the report.

### F4 — Tests the plan does not list that will go red, and tests it should add

Red as soon as the memory goes, not in the plan's list:
- `ui/oilsign.test.tsx` "a second input filed after Later is asked once more" ends `signPick(SAT,'plan','stiff')` →
  `'signed'`; it will be `'held'`. Rewrite or remove.
- `ui/oilsign.test.tsx` "Save with one of two answered … the next box signs at once" (`toContain('nobody on them earns
  OIL')`, `'signed'`) — the plan's test 5 replaces it; say so, so it is not left beside the new one.
- `engine/inputs-readers.test.ts` line 82 describes `ui/oilsign.ts` as "whether the day's one list holds an input not
  yet left for Later" — stale words in a test's record list.
- The walk scripts `scripts/handpass/frf-w3.mjs` / `frf-w3-draw.mjs` assert the old foot string (not a gate, but a
  re-walk would fail on them).

To add (the bug check needs a press on each door, not only the engine test):
- An answer through each door after two names are signed, unpublished day: the list opened from the bell (no hold),
  the input window's answer-only save, the Inputs page's row ("OIL decision updated"), a member's own window — each
  leaves the names.
- A **changed** answer (Yes → No) — per his answer to F2.
- The engine control beside test 7: each non-answer field of an input's part still takes the names down — `stand`
  (cancel), `acc` (taken off), `win` (re-timed), `claimWho` (swap), a new input — so `insSegSign` is proved to drop
  the last field only.
- A multi-day input answered in its window: both days' names stand.
- The published-day Save: the held name stands, the earlier names fall, Undo twice brings them back (AM11) — and
  whatever F1's answer makes of it.

### F5 — Comments and documents left saying the old rule, not in the plan

- `ui/OilDayList.tsx`, the comment over `save`/`later` in `Body`: "Later writes the name with no answer, and that day
  asks no more"; and the JSX comment above the foot quoting "Later: Ace signs, but nobody on it earns OIL." (the plan
  names only "the comment above the foot").
- `ui/oilsign.ts` beyond the head and `holdSave`: the `holdStands` comment ("Later marks nothing asked"), `holdLater`'s
  doc ("the day asks no more of what stood open").
- `ui/oilsign.test.tsx` head comment ("an answer given after signing clears the sign-offs"; "Later … asks no more that
  day").
- `docs/engine-rules.md`: the OIL-axis bullet ("the signature binds it (`currentBind`) … an invalid signature") and
  "What a signature binds to (D103, AM13)" ("the OIL key still omits membership") — the sign key now omits the answer
  too; one line each, D2800 / D2801.
- `docs/file-map.md`: the chat-138 row names `OILSIGN_LATER` and "not yet left for Later"; this change's own row.
- The rulings line `oil.md` 52 ("Later asks no more that day") — on the records branch, per the plan; it must be
  rewritten there in the same merge, not left.
- The plan's own "Save writes the answers, then the name (the order stays: harmless now …)": not harmless on a
  published day — there the order is what keeps the held name standing (the answer moves `pd`). The rewritten comment
  must keep saying so, or a later tidy-up could swap the two and the held name would fall with the rest.

## Not findings (checked)

- Bindings stored before this build reading unsigned once (D56).
- A list showing "Nothing left to answer" with only Close while `signAsks` saw an open row would loop; it cannot happen
  here — the list and the ask read the same `oilOpenOn` for the same squadron, and a row is dropped only if its input is
  missing from the inputs, which `oilOpenOn` reads.
- The foot's "Later: Ace signs" where the Later write is then refused (a time emptied, the command layer) — the
  refusal says why itself; it was so before this build.

## Verdict

**Revise first.** The engine change is sound and in the one right place, and the Later memory can go safely. But two
questions need his answer before the build fixes the words and the tests: F1 (the published day — the plan settles a
clash between D2800 and D2801 by its own reading, and its foot words would be untrue there) and F2 (a changed answer
after approval now publishes OIL nobody signed over — within his words, but its consequence is unnamed). Then fold in
F3's test and corrected claim, F4's red tests and missing door tests, and F5's stale comments and documents.

Findings: 5 (F1–F5).
