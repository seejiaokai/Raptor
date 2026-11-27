<!-- The red-team read of the D2826 + U2L and U3 briefs by a fresh, blind Opus reader, 28 Nov 26, chat A212; extracted from its reply. Folded into the briefs' heads. -->

Red-team read of the two briefs. I worked read-only at b57240b94 and changed no file. Every claim marked "checked" was read in the code this session.

## What I checked and found true
- `useOpenRequest` sets state while drawing, so the brief's one-write rule needs its hand-in.
- `add()` goes through `addWrite` → `afterWrite('add')`, and so does Waiting's Refuse (UsersPanel.tsx l.281, l.1546).
- `addPersonAndAccount` defaults to `pageUnit('own')`.
- DateBox calls `onChange` only from a calendar pick (l.133), so `onSelect` covers every pick.
- `pickAfterMove` keeps a master admin's pick of another squadron.
- `tellAccess` signs with `me()` and only loops over the accounts that still exist.
- `planLinesOf` skips `why` parts.
- `planLineViolation` refuses a system actor except on `account.told`.
- `deletePerson` has no `tellAccess`.

---

## Brief 1 — D2826

**1. Should-fix. §3.7 / §5 `pressPaths`: no press judges the add form as "the other piece".**
- **Failure:** Saber's move lands with nothing redrawn. Ranger's row has changed and Bandit is typed in the add form. Saber presses Ranger's Save. `closedAtPress('row')` names Ranger, and the close redraws. That draw's judge then says the add note in a batch of its own. The passing note is one element, so Ranger's note is replaced. This is the round-9 fault again.
- **The same happens on three other presses:**
  - Give access's press (`afterWrite('give')`);
  - Refuse on the waiting list, which shares `afterWrite('add')`. The brief says that path "never judges itself", so Refuse's receipt is replaced by the add note on the next draw (the round-11 fault).
  - Test 5 covers only the draw.
- **Cause:** `closedAtPress`, `otherAtPress` and `afterWrite` know only row and give.
- **Fix:** add the add entry as an "other" for every pressed kind and for Refuse. Extend `closedAtPress` to take `'add'`. Add tests: a row Save, a Give press and a Refuse, each beside a changed add form, each giving one batch in order.

**2. Should-fix. Head decision (e) narrows his ruling.** D2826 says the form closes "for a master admin who keeps the Admin page and an admin who loses it alike". Keeping Saber's form open on 149 is a builder's reading set against his words. That is the lapse [READINGS-LAPSE-FIX] names. Fix: build it as ruled (close, "…not added to 149"), or put (e) to him before the build. A named pin is not enough.

**3. Should-fix. Head decision (d) at a press: a silent no-op on his own press.**
- **Failure:** another admin makes Hunter a member, or takes the Plan the page stands on. Hunter presses Add. The form vanishes, his typing is dropped and nothing is said.
- **Conflicts:**
  - the built press rule ("a press that finds its work changed always says so", the `closedAtPress` comment, D2730 Q13);
  - D2825 covers picks, the view switch, bell lines and Undo, not a press of Add.
- **Fix:** at a press, let the door's own refusal speak where it applies ("Only an admin can add a person"). Otherwise draft words for a fresh Fable review and then him. Test it.

**4. Note. Head decision (f) against §3.8.** §3.8 says "Add sends `day`", the date drawn. (f) says Add sends the date read at the press. The archived row and Give access refuse the same press (`dayGone`). So Add would post a man in on a date the screen never showed, unlike its siblings. State one rule, and name the inconsistency at his look.

**5. Note. §3.2, Quals' "+ Add person" with the form already open and typed.** Taking a fresh entry blanks his typing without a word; today it keeps it. Fix: take an entry only when the form is closed.

---

## Brief 2 — U2L

**1. Blocker. Head decision 6 against §3.3 and the gate.**
- §3.3 still says the line's day is the run's day; decision 6 says the posting line's day (`poDate`).
- The gate's admin branch requires `String(n.day) === today` (`shape(n, today)`, perms.ts l.4180-ish).
- **Failure:** Saber presses Post out with a past date, so it runs at once. Under decision 6 the line carries `poDate` inside an admin command. The gate refuses it, and with it the whole Post out.
- **Fix:** state the day rule once, for signed and unsigned lines alike. Tie the gate's day check to it: `poDate` for the overseas and deleted lines, checked against the verified posting; today for archived and master. Test a past-dated run-at-once.

**2. Should-fix. Open point 4 / head decision 4 accept a breach of D2808.**
- **Failure:** Saber (142's war loaded) posts out Osprey (149), dated today. The posting is written to 149's stored war and runs later in `runForeignPosting`'s own `lw.postoutRun` command, as the app. The line is unsigned.
- D2808 says "one run at once by 'Post out' carries that person's name".
- **Fix:** run it inside the Post out command, or carry the posting's maker so the gate can verify the signer. Otherwise put it to him before the build, not "named at his look" after.

**3. Should-fix. §3.2, the signer keyed on `byApp: own` (`own = !parent`).**
- sync.ts l.3205–3214: a pass raised inside ANY command's reducer joins that command, not only Post out.
- **Failure:** wherever that happens, a posting the app ran on its date is signed with the presser's name. Worse, §3.5 ties overseas and deleted lines to `lw.postout` and `lw.postoutRun` only. The gate would then refuse the admin's unrelated command.
- **Fix:** sign only when `parent.type === 'lw.postout'` and the posting that ran is the one that command saved. Any other parent defers the pass, as the projection case already does. Test it.

**4. Should-fix (order). U3 undoes head decision 3 and test 11.**
- U3's R8 makes `hasUsersRow` true for a live man in a fold.
- A man made a master admin is live on his home's roster. So after U3, a tap on "Plan of 149 ended: made a master admin" opens "▾ 142" with him ringed. U2L's decision 3 and test 11 assert it opens nothing.
- U3's re-point list names only U2 fix 7, and its run list's `-u2-*` does not match `msq-s2-u2l-*`.
- **Fix:** U3 names U2L's tap case, decides it (a reading, or his call), and runs the U2L files.

**5. Note. Head decision 2, the gap against D2437,** is only told on. Fine, but it should be on the reads-owed or questions list, not only in the report.

---

## Brief 3 — U3

**1. Should-fix. Head decision 1 (B) contradicts D2652 N4.**
- D2652 N4: "a man in 'From other squadrons' also in his squadron's group".
- (B) leaves Plan holders out of their home's fold while the heading still counts them. Hunter stays on 149's People, so "▾ 142 · 38 people" opens on 37 rows. A visible mismatch, and against the ruling.
- **Fix:** list him in his home's fold too, holding the opened row in the one place it was opened (or the fold copy short until U5). Or make the count match the rows, and name the departure at his look.

**2. Should-fix. Head decision 3 against R5 and the rejudge3 §14 pin.**
- R5 draws the group holding the open row open "while the row stays open". So clearing the search can never fold it, and decision 3 needs an exception the brief does not write.
- Typing a search that hides a row keeps his typing (§14), but clearing it would drop it silently. E9h covers his press on a heading, not a search change.
- **Fix:** take the other branch. The group stays open while the row is open, and nothing is dropped.

**3. Should-fix. Not re-based on D2826, which lands first (head decision 7).**
- D2826 changes the open-work record (an add entry), `useOpenWorkJudged`'s inputs (the open request handed in), the notes owed (now sentences) and `pressPaths`.
- U3's §6 ("OpenWork row and give", "no new kind of open work") is stale.
- Its `openFor` hand-in must share the one write with D2826's.
- **Fix:** re-read Passes B and C against D2826's landed code. Add `msq-s2-d2826` and the U2L files to the run list.

**4. Note. Pass C landing with a Seat, CAT or Role tick on.** `useUsersFilter` goes, so the ticks survive a pick. `useRingLanding` sets only the search and the Archived fold, so "Edit on 142 →" can open Ranger's whole row hidden by a tick. Fix: say whether the landing clears or overrides the ticks, and test it.

**5. Note. R7, "Edit on 142 →" over a Tracker question or a save wait.** `pickSquadron` may return a promise. The landing must hang on its result and on `UNIT === home`, never fire on the press. The brief says "once landed"; add a test where the Tracker question is answered "Cancel".

---

## The three steps' order
D2826 → U2L → U3 is sound for D2826 and U2L (different files). U3 needs findings 3.3 and 2.4 settled first.

## Verdicts
- **Brief 1, D2826:** ready after changes (1.1–1.3).
- **Brief 2, U2L:** ready after changes (2.1 first, then 2.2–2.4).
- **Brief 3, U3:** ready after changes (3.1–3.3).
