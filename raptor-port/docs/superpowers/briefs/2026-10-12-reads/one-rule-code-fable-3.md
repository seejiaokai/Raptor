# Fable's THIRD read — the last round of the one-rule job's check, `claude/all-avail-as-member` at HEAD (`32f54e186`) against `2d53556c2` (12 Oct 26, read-only)

**What I read.** The brief; the sheet §3, §10–§10d, §11; the Opus trial read whole; my second read; the second re-walk's brief;
the full rows of D776, D777, D778, D712, D762, D759, D98, D109, D113, D736 (the shell); the fifteen commits
`2d53556c2..HEAD` and `git diff 2d53556c2 HEAD -- raptor-port/src`, every non-test file read whole where the change sits:
`engine/editlog.ts elogLoad`, `engine/inputown.ts` whole, `engine/inputs.ts` (`frozenInputMatch`, `PLACEHOLDER_KINDS`,
`shapeProblem`, `isPersonal`, `typeGroup`, `INPUT_META`), `engine/oilev.ts` (the membership pass, `sent` readers),
`engine/overlay.ts` (`asIssuedOrder`, `issuedRowOf`, `reconcileRequestRows`, `requestOfBox`, `ViewCtx`), `engine/publish.ts`
(`dayPendingItemsIn` whole through the move pairing, `personUnitSrc`, `unitRequestSrc`, `requestRowUnit`, `daySnapIn`),
`engine/slots.ts acceptInput`, `leavewar/sync.ts` (`leaveInputAt`, `warLeaveRow`, `doorWrite`, `doorApprove`, `sliceInput`,
`cutDates`, `doorDecideApproved` head, `doorMoveApproved`, `oilAskPlan`, `oilPendingFor`, `runPoOutcomes`), `leavewar/inputgate.ts
sickCutsLeave`, `state/inputstamp.ts` whole, `state/person-delete.ts applyDelete`, `state/store.ts` (`runInputWrite`,
`batchResult`, `placeholderShapeViolation`), `state/perms.ts` (`allPutBy`, `takesOn`, `filedWhole`, `byAfterLeaving`,
`filedForOther`, `mayFileInputFor`, `mayFileGroup`, `mayChangeInput`, `ownPart`, `inputBreach`, `memberFilesForOthers`),
`state/holderbase.ts` (the `issued` callback, `requestAddMarks`), `ui/reqdoor.ts` whole, `ui/inputedit.tsx` (`applyMedPlan`,
`mintMedSegments`, `setLeaveRemarks`, `ownPartSave`, `oilGate`, `oilAnswered`, `oilUnansweredDay`, `oilSignDay`,
`commitInputEdit` whole, `saveBatchX`, `reassignInput`, `askOilIfPending` head, `saveFromRow`, `commitInput` whole),
`ui/InputsPage.tsx` (`reviseOil`, `several`, the row's chips), `ui/InputsCal.tsx` (the card's call), `ui/InputCard.tsx`,
`ui/PeoplePick.tsx` (the diff), `ui/oilmode.ts` (`oilNoAskWhy`, `inertWhy`, `oilSeatHTML`, `oilEligible`), `ui/pendlist.ts
inputWords`, the two CSS files; `engine/avail.ts` / `engine/events.ts` by grep for how a placeholder is read;
`state/inputcount.test.ts` (its head and the "his own now" case); `docs/data-model.md` §5 (`InputPerson`) and §11 (`Input`),
`docs/data-schema.md` `people`. Greps across `src` for every `.people.push`, every shallow copy of a record, every stamp
caller, every reader of `sent[`, every `'Personal'`, the Personal OIL words. **Not run:** nothing — no build, no test, no
browser, no git write.

**The one-line answer first.** The four fixes of this round that touch money, published records and permissions — the
list copied per piece, the one-man doors rolling back whole, the war-approved leave kept to one person, the issued order,
the swap's second line, "By" passing on, the Personal kind, the "OIL?" sign — are built and I traced each sound in its
own path. ONE new fault, a contained one: the eighth fix (a piece pairs only with its record's own `by` and `at`) and the
changes window's words test a piece against two DIFFERENT filers — the frozen copy's and the live record's — so once
"who filed it" has passed on (an admin took the filer out, deleted him, or swapped him out; or a member filer stepped
out after a scheduler's add), a man then given his own part is counted as a filing of his own beside a line that calls
it "his own now": three lines where the design says two, and two of them contradict. Count and words on a published day,
not money, not the stored amendment's content, not a permission. Plus a documents gap (D201): the data model's server
rules and §11 still say "six kinds" and "a Personal input holds exactly one person". Everything else below is a reading.

---

## Findings — most serious first

### 1. A piece cut AFTER "who filed it" passed on is counted as a filing of its own, beside a line that says "his own now" (new in this round; silent; count and words only)

**The failure (steps).** Saber publishes Wednesday with an OD filed by RANGER for Ranger, Hex and Hunter (all day). Saber
opens the OD in its window and un-picks Ranger, Save — "who filed it" passes to Saber (`commitInput`: a scheduler taking
the filer out names himself — D759 reading 7). The day reads "1 pending · Ranger · OD · taken out" — right. Now Hex's
row of Wednesday's Unavailable list: type `10:00` in the start box. **What happens:** the day reads **3 pending** — "Ranger
· OD — taken out", "Hex · OD — his own now — 10:00–…" AND "Hex · OD — filed". **What should:** 2 — Ranger taken out, and
Hex "his own now" (R41; the build's own test "the line for a man given his own part … is ONE change", which pins the case
where the filer is unchanged). The same three lines follow when Ranger was DELETED (Admin → Users) or swapped out on his
Unavailable row before Hex's time was typed, and when a MEMBER filer takes himself out of an input a scheduler had added
to (`byAfterLeaving` names the scheduler).

**Cause.** Two bodies ask "is this one-person record a PIECE of that shared input?" and compare `by` against different
records:
- `engine/inputs.ts frozenInputMatch`, step 3b (line 262): `String(x.was.by)===String(n.r.by)` — the FROZEN copy's filer
  (Ranger).
- `ui/pendlist.ts inputWords` (line 198): `x.by === now.by` — the LIVE record's filer (Saber).
A piece is cut from the live record (`ownInputOf` JSON-copies it), so it carries the LIVE `by` (Saber) and the filing's
`at`. The frozen copy still says Ranger. The engine's 3b therefore does not pair it (the `at` matches, the `by` does not),
leaves it in `N`, and the filing axis gives it a line of its own — while the words body DOES pair it (live `by` equals)
and says "his own now". Before `2d53556c2` 3b had no `by` test and the two agreed. Nothing re-stamps `at` (`stampChanged`
never touches it — `state/inputstamp.ts`), so `at` alone already tells a piece from a fresh filing, which is what the
eighth fix wanted; the `by` test is what breaks here.

**Silent?** Yes — the count is wrong and two lines contradict each other; nothing says why. **New?** Yes, against
`2d53556c2` (the eighth fix). **Money / published record / permission?** No — what goes out in the amendment is the
stored diff (`dayDelta`), unchanged; only the list the scheduler reads before signing, the day head's count and the
Amendments box.

**Fix (build from this).**
1. `engine/inputs.ts frozenInputMatch`, line 262: accept the filer of EITHER copy —
   `&&(String(x.was.by??'')===String(n.r.by??'')||String(x.now.by??'')===String(n.r.by??''))&&Number(x.was.at||0)===Number(n.r.at||0)`.
   (Keep the `at` test exactly: a fresh filing has its own moment, which is what tells it from a piece.)
2. `ui/pendlist.ts inputWords`, line 198: the same two-sided test — `(x.by === now.by || x.by === was.by)` — so the words
   and the count can never disagree again (`was` is in scope there: `it.was`).
3. Pin in `state/inputcount.test.ts`, beside "the line for a man given his own part …": the same OD filed by a MEMBER
   (`setMe` to the member, `commitInput` for three), published; as the admin, `commitInput(od, draftOf(od), [hex, hunter])`
   (the filer out — `by` is now the admin); `setInpField(od, 'str', '10:00', hex)`; expect `waiting(WED)` **2**, the list
   to contain "his own now" and NOT "filed". A second case for the delete route (`deletePerson` of the filer, then the
   typed time) if the file already drives Admin → Users.
4. Update the sheet's §10b row 8 to say what "a real piece" means now (either copy's filer, the filing's moment).

### 2. The documents still state the rules D776 and D778 withdrew (documents only; D201 — fix in the same change)
- `raptor-port/docs/data-model.md` line 554 (`InputPerson`, the server rules): "only where `typeCode` is one of Training,
  Meeting, Appointment, Duty, Event, Other … a medical kind, an upchit and a Personal input hold exactly one person (D755
  (4))" — Personal is now one of SEVEN kinds and holds several. Line 1478 (§11, the `Input` row the IT side reads): "one of
  six kinds, one day (D700, D711, D712, D713)". The sheet §10c says "nothing in `docs/data-model.md` §11 moved" — the
  permissions CELL needed nothing, but the server-rule words in it did.
- `raptor-port/docs/data-schema.md` line 151 (`people`): "only on a one-day input of the six kinds" and "a Personal input
  one person's own".
- `raptor-port/docs/ui-contracts.md` lines 10199–10200 and 10247 (the picker): "not one of the six kinds", "ALL AVAIL is
  for Training, Meeting, Appointment, …", "Offered for the six kinds" — the D778 row says the picker's contract was
  corrected; these two passages were not.
- `raptor-port/docs/engine-rules.md` lines 4300 and 4321 ("the six kinds", the kinds listed without Personal) and
  `raptor-port/docs/feature-impact.md` line 131 ("the structural rules are the six kinds") — step-3 notes that still read
  as live.
**Fix:** each of these gets the same one-line correction the engine-rules §An input filed for ALL AVAIL got ("[CORRECTED
12 Oct 26 — D776, D778 …]"), or the number and the kinds' list rewritten where the sentence is live. The check that
compares §11's own-row note to the code (`perms.test.ts`) does not read these sentences, which is why green tests did
not see it. **Explicit negative:** the code is right — `PLACEHOLDER_KINDS` holds seven, `shapeProblem` has no Personal
line, `placeholderShapeViolation` reads `shapeProblem`, `memberFilesForOthers('Personal')` is true (`typeGroup` → 'other'),
`mayFileGroup` for an admin is `!needsDoc` — so a member with the switch on files a Personal input for others and an admin
files one for several, as D778 says.

---

## The eight fixes, each attacked as new code — what I traced

**(a) `pieceOf` and `putPerson` — the shared list.** Every writer of the list makes a NEW array: `toPeople` (`[e]`),
`putPerson` (spread), `takePerson` (filter), `swapPerson` (map); `ownInputOf` is a JSON copy. The one `.people.push` left
(`commitInput` line 1819) is onto a record `commitNewInput` has just minted, nobody else's. Every shallow copy of a record
that is then changed now goes through `pieceOf`: `sliceInput` (and so the war's approve-extend, `cutDates`,
`doorDecideApproved`, `doorMoveApproved` — both the `{ ...row, lwMoved: undefined }` spread and the plain call land in
`pieceOf`, which maps the entries afresh), the medical tail in `applyMedPlan`, `mintMedSegments`. `pieceOf` copies
`people`, each entry, `oil` and `leftAt`; what it leaves shared — `docIds` (a plain array nothing pushes onto: grep),
`sans`, `lwMoved` (rebuilt by `sliceInput`) — no writer changes in place. **Does any caller RELY on two records sharing a
list?** No: `sickCutsLeave` reads lines from the copy it made (`lineOf`) and cuts the piece it was handed; the approve
extend replaces the kept record whole. **Explicit negative:** sound.

**(b) `ownPartSave` — a batch body that answers false after it has changed something.** `saveBatchX` → `writeInputsBatch`
→ `runInputWrite` rolls back only on a THROW (`catch (e) … histRestore`); a `false` is "content" and commits. I walked
every batch body in the diff's files for a change made before a `false`:
- `reqdoor.ts replace`: `toPeople(p.inp)` then `commitInputEdit` — `toPeople` rewrites only an OLD-shaped record (D56);
  nothing else before the inner refusal. `then(was) === false` throws. Sound.
- `reqdoor.ts leave`, `rowMove`: `commitInput` first; its refusal is before any write; `then() === false` throws. Sound.
- `commitInput`'s own body: every inner refusal is `stop()`, a throw; the `r.people.push` is on the new record. Sound.
- `commitInputEdit`'s batch: no `return false` after the batch opens; `applyMedPlan` can answer false inside it, but its
  one refusal (`medPlanProtected`) was pre-flighted at line 1125 with the same plan. Sound.
- `reassignInput`, several-branch: the one refusal (`normalizeInputDraft`) is before the batch. Sound.
- The Leave War's `doorWrite` callers: `doorApprove` builds the rows first, then writes; `cutDates`, `doorMoveApproved`
  write with no refusal inside (their refusals are before the door — `warLeaveRow`, the protected set, `barsWrite`).
  Sound.
- `inputgate.ts sickCutsLeave` runs inside the gate's `apply` after `fn`; a gate refusal throws. Sound.
**Explicit negative:** no door left can commit half an act.

**(c) `LW_OWN` — a war-approved leave is one person's.** Reaches: the window (`commitInput` passes `rec.lw`); the hard
check (`placeholderShapeViolation` hands `shapeProblem` the whole record, `lw` included — every command, Undo too). Does
not need to reach: the row's "+ add" (a leave has no programme row); the Unavailable row's swap (one person stays one);
`rowMove` (ends in `commitInput`). **Honest acts refused?** The war's extend keeps `idsOf(x).length === 1` on both
sides; the remarks sheet on a one-person `lw` leave is the plain path; a MEMBER's date edit that clears `lw` cannot be
in the same save as an add — a member never adds to a leave (D655, `mayFileInputFor`); an admin's edit keeps `lw`, so an
admin can never add to a war-approved leave, which is the plan's §4.1 by design. **Explicit negative:** no honest act is
refused; nothing writes a two-person record with `lw`.

**(d) `asIssuedOrder` / `issuedRowOf`; `acceptInput`.** The reorder fires only where the sets are equal and both have no
duplicate; `whoId(v) || v` maps an old-shaped issued row's callsign to its id; a placeholder's id maps like a man's; two
issued rows of one `src` (a day published before the single row, one row a man) are each one person → `was.length < 2`
→ untouched. `acceptInput` hands the issued ROW (`issuedRid = ig[ix]` — the name is misleading, the value is right). A
week not on screen: `weekctx.ts` and `peek.ts` pass `issued: () => null`, `weekstash.ts` and `drafts.ts` their own; a
null issued row leaves joined order, and the next read on screen (holderbase's `issued`) puts the issued order back —
the flip is harmless because every mark is derived (`dayDelta`) and `reqChanged` fires only when `shows()` moved, which a
reorder of the same set does not change in the SET sense but does in the ORDER sense — so a stash round trip may raise
`reqChanged` once; that triggers a repaint, never a history line or a count. `requestAddMarks` (positional `.xN` drops)
runs only for rows the issued day LACKS (`issued.has(row.rid)` skips), so a reordered issued row is never touched by it.
**Cost:** `ctx.issued(di)` per request row per read is `dayApproved` + `dayCurVer` + `daySnapIn`, which is an array
`find` over the day's amendments — no parse, no copy; `shows()` is two small `JSON.stringify` per row. On a week of many
rows this is linear in the request rows; nothing quadratic. **Explicit negative:** sound.
*Reading, pre-existing (not this fix's):* where the set DIFFERS the row stays in joined order and `restore.ts dayKeys`
compares place by place, so taking the MIDDLE man off a published row of three marks the puck that slid into his place
(RX3-2's "Take HUNTER off: 1" will show the hollow tag on Ranger's puck, not nothing). The count is right; the tag sits
on the wrong man. Older than this job; a reading for `[ONE-RULE-SMALL-WORDS]` or the sleek pass, not a fault of the fix.

**(e) The new skip test `row.srcv === sv && shows(row) === shows(f)`.** What the re-make writes is exactly what `shows`
compares, so a row is re-made only when a reader would see a difference, and `reqChanged` only when it did. A `kept` row:
rule 3 runs first — a dead row stays dead; one whose request can stand again has `kept` cleared and then takes the
compare, as before. A request taken off (`acc === 'r'`): rule 4 `continue`s before the compare. A `who` stored as a
callsign: `shows` normalises both sides through `whoId`, so an old row is NOT re-made for that alone. The red box
(`flag`) is the input's since D760 and is compared — right. **Explicit negative:** nothing a row legitimately carries
apart from its input is wiped; `srcg` (the old group mark) is dropped on a re-make as before.

**(f) `publish.ts`, the people step — the seat the replaced man went to.** A `reseat` unit carries `token` (the man),
`from`, `to`, `jump`, `keys` (`canonical.ts` line 444); `personUnitSrc` matches a unit by ANY of its places, so both men's
reseats were consumed. The give-back takes units whose `token` is the man replaced (`off[0]`) and whose `to` is NOT a
place of this input's row (`onRow` reads the live day's row by index and `src`). A swap from a flying seat, a desk or a sim
seat: `to` is the seat key → given back → 2. A drop from the crew list: no reseat with `to` → 1 (D113). The same swap
undone: no diff. From ANOTHER input's row onto the puck: `rowMove` → a join, never a replace (`A.length === 1 &&
B.length === 1` is false) → the move-pairing block says "Ranger: Training → Meeting", one each — unchanged. The OIL fold
(line 334 on) finds its item by `val`/`inp`; a reseat has neither, so the fold is untouched. `dayDiscardCount`, the
Amendments panel (`itemCounts`), the day head and the published amendment's own count all read `dayPendingItems` →
`dayPendingItemsIn`, so they agree (D736 reading 2). The jump keys given back are removed from the input's item only where
no kept unit still names them. **Explicit negative:** sound.

**(g) `frozenInputMatch` 3b — `by` and `at`.** Finding 1. **Who is missed as a real piece:** any piece cut after the
filer passed on (above). A record stamped before D629 (no `by`, no `at`): both sides `''`/`0` → pairs as before. A piece
`stampPlaced` afresh: none — `stampPlaced` is called only on a filing (`commitNewInput`, the List's add, the war's
approve and its extend — the extend REPLACES the kept record under the same id, so rule 3 pairs it by id; it is not a
piece). `stampChanged` (every cut) leaves `at` alone.

**(h) `passBy`, `stampWho`, `reassignInput`.** The posting pass runs its delete inside `cmdCommitProjection` (origin
`'projection'`): `stampNow` returns `{ who: undefined }`, so `stampWho()` is undefined and `passBy` falls to
`byAfterLeaving` — a MEMBER whose visit triggered the pass never becomes "By" and gains no right over the input. The
admin's own delete (`deletePerson`, origin `'user'`) names the admin. The `split` case calls `passBy(r)` AFTER
`ownInputOf`, so the deleted man's own piece keeps him as its filer (D299). Undo of a delete or a posting: none exists
(D350, D321). `reassignInput`'s pass uses `me()` behind `canEditSched()` — a scheduler; in the admin's member view the
door is closed. `inputBreach` is a member's check; the swap is a scheduler's command. **Explicit negative:** sound.
*Reading to tell him:* a deleted filer who filed WHOLE for others (every entry the filing's own, no entry with its own
`by`) keeps "By <him>" through a posting-run delete (`byAfterLeaving` has nobody to pick); the card then names a deleted
man, only an admin may change the input, and an unanswered OIL question reaches no bell — the admin sees the "OIL?" sign.
As he was told (D759 reading 7 names "the scheduler who takes him out"; a posting has none). Not a fault; a sentence for
him.

---

## D776 + D778 — the Personal kind, every place that still treated it apart

`grep "Personal'"` (tests apart) finds four readers, each as it should be: `INPUT_META` (its meta — `work:false`, `grp:'act'`,
`shiftHard:true` — the clash and work-hours rules, unchanged, D778 "not work"); `oilAsks` excludes it (no OIL question);
`PLACEHOLDER_KINDS` includes it (D778); `schema.ts`'s type list; a comment in `validate.ts`. `personalKind` and
`PERSONAL_OWN` are gone from `inputs.ts`, `reqdoor.ts`, `shapeProblem`. **The men behind its ALL AVAIL** (`oilev.ts`
`oilEvidenceNow`, the membership-only pass): written into `sent[item]` for every input that holds a placeholder, does not
ask, covers the day, is not taken off / cancelled / information only, and has a window; read by the count chip and the
window through `sent` (line 195, `oilSentinelPeople`), frozen with the day's evidence at publication (`daySnap` stores
`ev`); the crowd arriving or leaving counts as a person does in the people step (`idsOf` includes the placeholder). **Can
any path CREDIT it?** No: `inputs` (the claims) is untouched, `oilEarnedWork` pays from claims, the Leave War's OIL pass
reads credits, the legacy readers read frozen rows; in OIL Earn `oilEligible` finds no claim → inert, and its words are
`oilNoAskWhy`'s — "a personal request earns no OIL" (the row must stand on the day; otherwise "nothing measurable to earn
from here") — so RX1-6's expected sentence exists. **Can any path ask its question?** `oilAsks` is false → `oilGate`,
`askOilIfPending`, `oilPendingFor`, `oilUnansweredDay`/`oilSignDay`, the save's gate all answer nothing. **Availability:**
`avail.ts` line 80 reads only away kinds; `dayEngaged` skips specials — a Personal row with ALL AVAIL makes nobody busy,
exactly as an Event's. **A member filing for others, switch off:** `mayFileInputFor` → `membersFileOn()` false → refused
with the kind's sentence; with it on, `memberFilesForOthers('Personal')` is true. **§11** — the permissions cell needed no
change; its server-rule WORDS did (finding 2). **Explicit negative:** sound in code.

## D777 — the "OIL?" sign

`oilSignDay = oilUnansweredDay(row) && mayEditInput(row)`. **"May edit" = "may answer"?** The window's "Answer…" is
`commitInput` with `opts.oil`, gated by `mayEditInput(rec)` when `answers`; the List's button is `reviseOil` → one batch
`r.oil = dec; stampChanged(r)` — the input's ONE answer (D762), stamped, one Undo step; a member filer passes
`inputBreach` through `filedForOther` as the window's save does. So the sign shows exactly to whoever can act on it: the
only person; the filer while `allPutBy` holds; an admin; never a man merely in it (D762); never a guest (`roleOf()` guest
→ `allows` false, `pid` null); in the member view an admin reads as a member (D292) — a Training a member filed that
Saber then added to shows Saber the sign only in his admin view, which is what the view is for. **Unanswered and nobody
sees it:** none — an admin always may. **Three readings, none a fault, for his list:**
- The sign (and the bell, older) show for a CANCELLED or information-only input (`oilAskPlan` reads dates and hours only);
  the answer can be given and credits nothing (`landedStanding` reads the marks). A one-liner if he wants it quiet:
  `oilUnansweredDay` answers '' where `row.cx || row.info`.
- On a quarantined (read-only) week the sign shows and the answer's write is refused ("This week is locked"), so it
  stands for ever; `oilPendingFor` already skips those days (`isoProt`) — `oilUnansweredDay` could do the same. Legacy
  weeks only.
- A one-person input with some days answered and one not (a public holiday declared later over a day it covers): the
  card wears "OIL?" (`oilSignDay`), the desktop row the plain "OIL" revise button (`!oilAnswered` guards the ask chip
  there); both open the same sheet. Words only.
**Third places:** the SANS day never draws an OIL-asking kind; the schedule's Personal Inputs line and View-only Sched
draw no sign (D777 names the card and the List only). The month's bars untouched (the diff). **Explicit negative:** sound.

## Finding 1 of my second read — fixed right?
Yes: `elogLoad` reads `one` back (guarded by `sub`, accepting `1` or `true`); `writeRow` already saved it. **Other readers
of a saved line with their own field list:** none — the edit log has one reader (`elogLoad`) and one writer (`writeRow`);
`persist.ts`/`rowmap.ts` do not touch it; `elogClear`/`elogRemap` work on the in-memory rows. Pinned across a flush and a
load (`reqdoor.test.tsx`, per the comment). `ELogRow` still lacks `one` (the cast remains) — tidy, not a fault.

## The Opus trial read's negatives I have reason to doubt
- Its roll-call rows marked "Grep only" / "Not opened" — 11, 14, 16, 24, 37, 38, 39 — are where my second read's finding 1
  lived (row 24, History across a reload) and where this round's finding 1 lives (the changes window's words, row 23/25).
  Its "sound" on the published day (§2: "first-to-join leaving is one (list place)", "the OIL fold's who-set") was right
  only after its own findings 6–8 were built; finding 8's fix is what introduced today's finding 1.
- "Switch-offs that must end: `pruneHandedOverDecisions` … I walked a person out and back" — not re-traced by me this
  round; the sheet's walkers (A3, C2–C4, D6) carry it. I do not doubt it; I did not verify it.
- Everything else of its negatives I touched (the belt ahead of every `setSlotVal`, `peopleOf` the one reader, notices
  riding the envelope) stands as it reads.

---

## Scenarios the second re-walk does not drive, and should (each as a person would)
1. **Finding 1, the window route.** As RANGER (member) file an OD for Ranger, Hex, Hunter on Wed 15 Jul; as Saber publish
   Wed; open the OD, un-pick Ranger, Save ("1 pending"). On Hex's row of Wed's Unavailable list type 10:00 in the start.
   *Must see:* "2 pending" and two lines — Ranger taken out; "Hex · OD — his own now — 10:00–…". *Today:* 3 lines, "his own
   now" AND "filed" for Hex.
2. **Finding 1, the delete route.** The same filed OD, published; Admin → Users → delete Ranger (the week is in the future
   of the real clock); then Hex's typed time. *Must see:* the card "By Saber"; the day 2 pending, no "filed" line.
3. **A posting-run delete of a filer who filed WHOLE for others.** As Ranger file a Training for Hex and Hunter on a day to
   come; as Saber post Ranger out — Delete — with a date before it; let the posting run (sign in after its date). *Record:*
   what the card's "By" says, who can open and change it, and whether any bell asks its OIL question on a weekend.
4. **The sign on a cancelled input.** A Saturday Training for two, unanswered (RX2's route); on the board press CX on its
   row. *Record:* whether the card still wears "OIL?" and the desktop row its button; press it and answer Yes; OIL Earn's
   row stays inert.
5. **The middle man's tag (the pre-existing reading).** RX3-2's "Take HUNTER off": *record* which puck wears the hollow
   tag — expected by the reading: Ranger's, who slid into Hunter's place.
6. **The crowd of a Personal input, published.** Sat 18 Jul Personal for Ranger + ALL AVAIL, publish; then put Drifter on
   leave that day. *Must see:* the count chip on View-only Sched keeps the frozen number; the working copy's chip drops by
   one and the day reads pending (D44, D45) — as any Event's would.
7. **A stash round trip of the issued order.** Publish Wed with a Meeting for Drifter, Hunter, Ranger; take Drifter off and
   drop him back (0 pending, RX3-1); step to next week and back. *Must see:* still 0 pending, no new history line.

---

## VERDICT: CLEAN WITH THESE EXACT CHANGES

Nothing in this round is OIL owed, a published record's content wrong, a permission open or a saved record lost; the
seven fixes beside the eighth, D776/D778 and D777 are built as ruled and I traced each sound. **Before "merge live":
finding 1** — the two-sided `by` test in `frozenInputMatch` 3b and `pendlist.ts inputWords`, with its pin — because the
eighth fix introduced a count that is wrong and self-contradicting on a reachable route (an admin taking a member filer
out of a published shared input, then one man's own part), and the first re-walk passed that fix on the one route where
the filer never changed. **Finding 2** rides the same docs commit (D201): the data model's server rules and §11 are what
the IT side reads, and they still state the rule he withdrew. The readings above are his to hear, none a fault.

**Rulings: none this session** (a read-only review; nothing of his was recorded or changed).
