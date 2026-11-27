# Blind read of the K10 root plan (`2026-11-28-msq-s1-k10-root-plan.md`), fresh Opus

Read: the plan, its brief, the rulings' full rows (D2834, D2835, D2845, D2846, D2847, D2842, D2621, D2729, D2243, D2160,
D2261, D2325, D2836, D2825, D2203), the people-accounts page lines, the K10 part-one report, the KR plan §5 and its
answered block, and the code: `state/inputsqn.ts`, `ui/InputWindow.tsx` (note, `foreign`, `readOnly`, `pickUnit`),
`ui/topstate.ts openNotice`, `state/belltap.ts`, `state/notices.ts` (stamp, `noticeLive`, `noticeLeftBell`),
`engine/inputs.ts`, `engine/medical.ts`, `ui/MedicalView.tsx`, `ui/DocViewer.tsx`, `state/units.ts`, `state/perms.ts`
(7c `inputWhoProblem`, `mayChangeInput`, `ownPageMayBe`), `undo/timeline.ts` (unit of a step). No file of the repo
changed.

---

## Findings

### 1. HIGH: the new `pickUnit` lets a record be saved into the wrong squadron from the old squadron's page
- **Place:** plan §4.2 point 2 (`pickUnit = isNew ? openedSqn : (holderOf(r) ?? inputUnitOf(r) ?? UNIT)`); §10 risk 1;
  `ui/InputWindow.tsx` `pickUnit` → `rosterOptions(pickUnit, firstDay)` / `PeoplePick`.
- **Failure:** Nasty moved 142 → 149 from Thu 16 Jul, his OML 6–9 Jul still pending. Saber (master admin) on **142's**
  Medical tab "as of" 8 Jul (or on 142's Inputs List, where the record touches 142 by its days) presses the card, then
  "Edit input". The window is live on 142 (the plan's own touches-first clause, §2.2). `pickUnit` is now
  `holderOf` = 149, so the Person list offers **149's** men on 6 Jul (an admin's medical window does not lock the
  person: `lockOne={!isNew && !canEditOwn()}`). He swaps Nasty for a 149 man and saves: the OML now names a 149 man,
  touches only 149, and was saved from under a bar reading 142. The gate passes it for Saber, and for any admin of 142
  who holds Plan of 149. The same happens with Ranger's leave across his move (14–18 Jul) on 142's List. This is the
  mirror image of the fault §4.2 says it fixes.
  The same root cause exists today and the plan keeps it. Take Ranger's leave across a move saved ahead (not yet carried,
  so `holderOf` is null) on 149's page. The window is live there because the leave touches 149, but `pickUnit` is
  `inputUnitOf` = 142, so 142's men are offered and a 142 record is saved under 149's bar.
- **Cause:** `pickUnit` asks a page-blind answer (`holderOf` / first day), while whether the window is live is asked of
  the page (`inputSqn(r, page)`).
- **Change to the plan:** `pickUnit = isNew ? openedSqn : inputSqn(r, openedSqn)`. That gives the page's squadron where
  the record touches the page, else the carried squadron, else the first day's, which is the same answer the root holds
  the window to. Add tests for K10-a/K10-d: (a) Saber on 142's tab, history view, Nasty's carried OML → the Person
  list offers 142's men, never 149's; (b) Ranger's across leave with the move ahead, on 149's page → 149's men offered;
  (c) the existing 149-side case.

### 2. HIGH: "149's admin closes it with Upchit" rests on the upchit's date, which in the app is the demo date and can honestly be before the move
- **Place:** plan §1 row 1 ("closed by an upchit dated before his move (that upchit's own day decides)", written under
  Source "D2834, D2845, D2846"); §3.1 first row (Kestrel's "Upchit" "dated today, is 149's by its day"); §2.1 row 1b;
  §3.1's Upchit Complete filter (the roster on the upchit's own day); FIND-1's assertion. Code: `ui/DocViewer.tsx`
  `upchit()` seeds `date: fmt(keyToIso(TODAY))`, and `TODAY` is the literal `'13/07/2026'` (`ui/weeknav.ts`), not
  `todayIso()`.
- **Failure (a), as the app is built:** the test worlds set the clock to Thu 16 Jul. Kestrel (149's admin) on 149's tab
  presses Nasty's pending card, then "Upchit". The new Upchit is dated **13 Jul**, a 142 day for Nasty, so the gate's 7c
  refuses Kestrel (it touches 142). FIND-1 as written ("her Upchit → a new Upchit saved, 149's by its day") fails, or a
  builder silently types a later date to make it pass. If Saber (master admin) saves it with the date it offers, the
  episode counts as "closed before the move". Nasty's card leaves **149's** tab, where Saber just closed it, and appears
  under **142's** Upchit Complete.
- **Failure (b), with a real date too:** the owner allowed a certificate to be dated a day or two before it is filed
  (27 Aug 26, quoted in `DocViewer`). Nasty's paper is signed Wed 15 Jul and arrives Fri 17 Jul, after his move. Kestrel
  files it dated 15 Jul and the gate refuses her. Under the plan's rule the record is "closed before the move" and goes to
  142's tab. D2845 says "149's admin closes it when the paper comes in", and D2846's own words are "closed before the
  move (an upchit **given by the old squadron**)". The plan uses the upchit's date as the test of "closed before", but
  that is the planner's reading, and it is written as if it were the ruling (lesson 32).
- **Change to the plan:** (1) Mark "the upchit's own day decides" as a reading (R-n) and list it in §11. Better, judge
  "closed before the move" by **when the upchit was filed** (its entry's `at`), or by who filed it, not by its date. If
  the date stays, put the backdated-certificate case to him as a question card. (2) Say that the viewer's Upchit default
  date is the demo's `TODAY`, not `todayIso()`. Decide whether K10-a changes it to `todayIso()` (it touches only the
  seed, not a ruling) or whether FIND-1 sets the date explicitly. (3) Name in §5 / §12 that an upchit dated before the
  move is refused for 149's admin. That is a gate change for `[XFER]`, with the security reader, and it breaks D2845
  until then. (4) Add tests for M1/FIND-1: an upchit dated before the move but filed after it by 149, and the Upchit's
  default date with the clock after the move.

### 3. MEDIUM: a man moved twice: his open record opens greyed on the middle squadron's tab
- **Place:** §2.2 (`carried === pageSqn` is the only new live case), §2.3 "Moved twice → 150", §7.1 M2, §10 risk 3.
- **Failure:** Nasty moves 142 → 149 on 16 Jul and 149 → 150 on 1 Aug; today is 5 Aug and the OML is still pending.
  Saber opens **149's** Medical tab "as of" Mon 20 Jul. Nasty is listed under Pending (he is on 149's roster that day).
  "Edit input": `inputSqn(OML, 149)` finds that it does not touch 149, so `holderOf` gives 150, and the window is
  **born held** with the root on (letOpenOn: no case for Saber, who can open 150). Kestrel gets a read-only window
  instead. M2 covers "moved twice" only "as of today and of a day before the move", so this day between the two moves is
  never pressed and the invariant claimed in §2.2/§10 ("no window born held") is false.
- **Cause:** today's date judges the holder, the tab's as-of judges the listing, and the touches-first clause does not
  cover a squadron the record was carried *through*.
- **Change:** in `inputSqn`, also answer `pageSqn` when the page is a squadron the record was carried through while
  still open: his home on some day from the record's first day to today (`homeChangesOn`), with the record open then.
  Or, if he would rather, have the Medical tab's Down/Pending sections on a past as-of skip a man whose open record is
  held elsewhere now. Add the as-of between moves to M2, for 149's tab, both for Saber and Kestrel.

### 4. MEDIUM: leave carried at the first move falls back to the OLD squadron after a second move
- **Place:** §2.1 "any other kind" (`h` only when the record touches `h`); §2.3; §3.2 (bell: `holderOf(row) ?? inputSqn(row, n.u)`).
- **Failure:** Ranger's leave 14–18 Jul runs across his move 142 → 149 (16 Jul). On 1 Aug he moves 149 → 150; today
  is 5 Aug. `h` = 150, which the leave does not touch, so `holderOf` is null and the answer falls back to the first
  day's squadron, 142. Saber presses a bell line about it stored with 142: he enters **142** and the leave opens live
  under 142's bar. D2847 says the leave went with him to 149. For the 149 → 150 move it is "leave wholly taken before the
  move", which "stays in the old squadron's records", meaning 149's. On 150's page the plan also answers 142 (§2.2's
  "on a third page → the new squadron" holds only after one move).
- **Change:** for a non-medical one-man record, `holderOf` = his home on `min(today, the record's last day)` if that
  differs from the first day's squadron and a move into it fell inside the span. That is the squadron the record was
  carried into, kept after later moves (as row 1b does for medical records). Add it to H1 and B-2.

### 5. MEDIUM: the old squadron's admin can still change a carried open record from the old squadron's page; the plan defers this without naming the ruling it goes against
- **Place:** §2.2 ("The old squadron's page keeps answering its own for a carried record"); §3.1 row 3; §10 risk 8; §12.
- **Failure:** Hunter (142's admin, no right in 149) opens Nasty's carried pending OML from 142's Medical tab "as of"
  8 Jul, or from 142's Inputs List, where it still stands. The window is live and the gate lets him save it, because it
  touches only 142. By the plan's own answer the record is 149's now (`holderOf`). D2834 says it "goes with him" and
  "its admins see and close it". D2847 says leave "goes with him **like everything else still open** … the old
  squadron's admin no longer may". So a 149 record is changed under a bar reading 142, the reverse of D2621's one rule.
  §10 risk 8 calls it "not K10's", but it does not say which ruling it breaks or until when.
- **Change:** either (a) the root opens such a window **read only** (not held) on a page the record touches that is
  not its holder: one more `ro` case, no gate change, nothing greyed, which also closes finding 1's old-page half; or
  (b) keep it, and say in §12 and in the reads-owed / `[XFER]` entry that it goes against D2834 and D2847 until
  `[XFER]`, so that it is his choice and not a silent gap.

### 6. LOW–MEDIUM: the bell line's squadron stamp is a reader of the input's squadron that the plan does not mention
- **Place:** §3.2, §10 risk 4 (its readers list); code: `state/notices.ts` `tell` stamps `u = inputUnitOf(r)`, the
  gate's `lineStampOwed` (`state/perms.ts`) requires exactly that, and `lineSqnMark` and `bellShows` read it
  (`state/belltap.ts`, `state/notices.ts noticeLive`).
- **Failure:** Saber changes Nasty's carried OML on 149's tab on 17 Jul. The line to Nasty (149's) is stamped 142, so
  it shows the grey **"142"** mark. Pressed, it now opens under 149 (K10-c). A line to someone told only as its filer
  is also shown or hidden by his bell's switch for 142, not 149.
- **Change:** list the stamp, the grey mark and the switch among the readers. State the choice: either new lines are
  stamped `holderOf ?? inputUnitOf` (in `notices.ts`, and `lineStampOwed` in `perms.ts`, after U2, with the security
  reader since it is a gate line), or the stamp stays the first day's and the mark/switch mismatch goes to `[XFER]`.
  Add a pin either way.

### 7. LOW–MEDIUM: who builds D2835's bell door: the KR plan says KR-4, this plan says K10-c
- **Place:** §6, §8 K10-c; the KR plan's answered block: "D2835 is the bell door's, KR-4, with K10's root under D2834".
- **Failure:** KR-1's builder is told to fold D2835 into KR-4. Followed as written, KR-4 changes `openNotice`'s `u`,
  and then K10-c changes the same line again, possibly to a different answer (no `holderOf` exists in KR).
- **Change:** say plainly that K10-c owns the `u` line under D2835 and that KR-4 only converts the door's order. Have
  the coordinator correct the KR plan's line, or say that K10-c takes whatever KR-4 built.

### 8. LOW: the change to `letOpenOn`'s answer breaks "the patch's hunks applied as they are"
- **Place:** §4.1 ("the InputWindow.tsx hunks are applied as they are"), §4.3 (new return `{ on, ro } | null`), §8 K10-a.
- **Failure:** K10-a changes `letOpenOn` to return an object. The patch's `openedSqn = let ?? unit` then gives an
  object, so `held` is true for every let window. The existing F0 `letOpenOn` tests also expect a bare squadron
  (`→ 149`) and are not in K10-a's re-point list.
- **Change:** either keep `letOpenOn`'s return as it is and add a second export for `ro`, or list the patch lines that
  must read `.on`/`.ro` and the F0 assertions to re-point (renamed, nothing dropped).

### 9. LOW: H4's test is stated per man, but `holderOf` answers per record
- **Place:** §7.1 H4.
- **Failure:** Nasty has an old ATT C never upchitted, followed by a later, separate downchit (row 1c), and he is
  listed under Pending by the newer one. "Open ⇔ he is in Down/Pending" is true for him, while `holderOf` is null for the
  ATT C. Read literally, the test either fails, or it is written loosely enough that a wrong episode test passes.
- **Change:** state H4 per record: open ⇔ the record is in the medical episode of an entry the tab lists under Down or
  Pending that day.

### 10. LOW: Q1's card is worded wrongly, and the walk notes miss the demo's fixed "today"
- **Place:** §9, §13.
- **Failure:** the card says "until Thursday **the upchit** is still 142's"; the record is the OML that owes an upchit.
  One mention of "Nasty" has no role in brackets (D2841 shape). Also, on the deployed demo the Medical tab opens "as of"
  13 Jul 2026 (the demo's fixed date) while moves run on the clock's today. A man moved today still shows on 142's tab
  by default and not on 149's, and a walker will report that as a fault against D2845.
- **Change:** reword the card to name the OML and bracket every mention. In §13, tell walkers to set "as of" past the
  move, or to say which date the demo runs on.

---

## Checked and found sound
- `holderOf` reads nothing of who is signed in. Doors and the root still cannot disagree about who is looking, so the
  restated rule in §2.4 is honest. Only one-man records are carried (`onlyNamed`), which keeps Fable 3b excluded.
- The gate does not read `inputSqn` (`perms.ts` imports nothing from `inputsqn.ts`). 7c judges by the days the record
  touches, so K10 widens no right. Case 2 is narrowed and case 3 is read only. The `ro` note keeps a right given
  mid-window from making it writable.
- Kestrel's window on the carried OML is read only through `foreign` ([142] has no admin of hers). This matches the gate.
- The Down/Pending sections already follow D2845 (the roster on the as-of day). The single Upchit Complete filter gives
  D2846's look for upchits dated before the move (finding 2 aside).
- The engine's readers (OIL, the Leave War, the schedule's rows) read `inputSquadrons`/`inputOnDay`, not
  `inputSqn`. H5's pin is the right guard. Undo/Redo steps on inputs carry no squadron in their ids
  (`undo/timeline.ts unitsOf`), so K10 changes nothing there.
- The order K10-a → U2 → KR-1..4 → K10-c/d is buildable apart from findings 7 and 8. K10-a stays out of the U2 hold list.
- Moves saved ahead are not carried before their day. A man who moves back is answered by the first-day rule. A group
  input is never carried (R7).

Rulings: none (a read-only reader).
