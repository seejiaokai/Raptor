# [MSQ-PICK-GUARD] the words still to settle — a fresh Fable's review (D2441), 24 Nov 26

Reader: a fresh Fable helper, read-only, from `C:\Users\User\projects\Raptor-msq` (branch `claude/msq-b1-screens-135`).
Brief: `raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-words2-brief.md`.

Status: COMPLETE. No file in the repo was changed; nothing was built or run but read-only searches.

## What I read

- The full rows of D2590, D2403, D2405, D2591, D2592, D2593, D2594, D2595, D1622, D1667, D1668, D1669, D2389, D148,
  D350, D2402, D970; and, for two facts below, D2322, D2205, D129, D587.
- The first words review (`…/briefs/2026-11-24-msq-pick-guard-words-fable.md`), the page he answered (questions 1–6),
  the three drawings named in the brief, the pressing report and the recheck (`…-press-report.md`,
  `…-recheck-fable.md`), and the build's reading of the code (`…/plans/2026-11-24-msq-pick-guard-build.md`).
- The writing guide, `docs/design-practices.md` §1, §1a, §1b, whole; `.claude/rules/decisions/design.md` (§Menus, the
  keyboard and questions; §Saving); `docs/word-list.md` (Undo / Redo, Logout, the band's line).
- Today's words in code: `ui/InputWindow.tsx` (both its questions), `tracker/app/core.js` (both its questions),
  `ui/SaveStatus.tsx`, `ui/savestatus-source.ts`, `storage/postman.ts`, `ui/logout.ts`, `ui/topstate.ts`,
  `ui/topbits.tsx`, `undo/timeline.ts`, `undo/describe.ts`, `ui/UsersPanel.tsx`, `ui/AdminPage.tsx`, `ui/Shell.tsx`.
- Not opened: any `*scenario*` file, any `blind-astra` or `blind-fable` folder, anything under
  `C:\Users\User\projects\Raptor`.

## The short answer

- **Stands as drafted:** N7, and the builder's reading that the lit Undo needs no squadron.
- **Adjusted:** R1, N1a, N1b (say the press that works, never "142's Undo"); R3, N3a, N3b ("save or cancel", not
  "close"); N4 ("changes", not "change"); N5 ("the open row", and the Input question's buttons); N6 (its second
  sentence and one button, his to approve).
- **Goes back to the builder before any words are built — one doubted fact:** R2, N2a and N2b say the change is LOST
  at Logout. Today's code, D2322 and the build's own plan keep it. Both wordings are below; which one is true is the
  builder's to settle, and the difference is the owner's to hear, since he read "lose it".
- **N2b cannot be built as a case of its own:** the app does not know how many changes are waiting.
- **N3a's second half ("…then switch back to the admin view.") looks unreachable** for an opened row.

---

## The words, one by one

### R1 — the greyed Undo's reason (D2593)

**Ship:** "Pick 142 to undo your changes there."

- Why: "142's Undo" names a thing the screen does not have (there is one Undo button), and the draft says where the
  changes are without saying what press will work. The guide's §1b test 6 asks for "what will work"; "pick" is the
  verb the guard's own notes use ("then pick 149").
- Added word, and how it is known true: "Pick" — D2593's own row, "is there again when that squadron is picked".
- Kept: the bare number, "your" (D148: only his own), the full stop (the Undo reasons already built end with one —
  `undo/timeline.ts`, "…it can’t be undone now.").
- It reads the same as a passing note: a Ctrl+Z press with nothing to take shows the same sentence as a note
  (`ui/topstate.ts`, `HOOKS.toast(r.reason, 'warn')`), and "Pick 142 to undo your changes there." stands alone there;
  the draft would not.

### N1a — the same for Redo

**Ship:** "Pick 142 to redo your changes there."

- Why: the pair speaks as a pair (§1b test 9) — R1's sentence with one word changed. "Undone … changes are on 142's
  Redo" stacks "undone" on "Redo" and again names a button that is not there.

### N1b — steps on two other squadrons

**Ship:** "Pick 142 or 149 to undo your changes there." (Redo: "Pick 142 or 149 to redo your changes there.")

- Why: "on their own Undo" is the same unseen thing twice over. "Or" is the true link: each pick reaches that
  squadron's steps only.
- For the builder: the numbers in number order, "or" before the last; three squadrons read "Pick 142, 149 or 150 to
  undo your changes there." A master admin with steps on many squadrons makes this long — the builder's call where to
  stop; no wording is offered here for "many", since I could not tell how many is real.

### The lit Undo — does it need the squadron?

**No. The builder's reading stands:** "Undo — Drifter's OL" as it is, and "Undid: Drifter's OL".

- Undo now reaches only the squadron in view, which the top bar already names; adding "· 142" would say what the
  screen shows (§1, the first of the three tests).
- A number already inside a label is a different thing and stays: "Made an admin of 142 · Ranger", "Plan of 149 ended"
  (D2402) name what was given, not where he is.

### R2 — Logout pressed while a change is not saved (D2594) — A DOUBTED FACT, back to the builder

The draft says the change is lost: "Log out and lose it?". What the code does today, and what the build's plan keeps:

- `ui/logout.ts`: with a save still waiting, the session ends but the page is NOT reloaded; the "Not saved" band and
  its Retry stay up over the sign-in screen, and the page reloads when the save lands.
- D2322 (22 Nov 26), built: the next sign-in on that page is held — "The last change has not saved yet — check the
  connection. Sign in waits until it saves."
- The plan, §5: "the sign-in on a shared computer and the reload owed after a waiting save stay as they are (D2322)".

So as things stand nothing is lost at Logout, and "lose it" would be untrue. D2594 is the later ruling (24 Nov against
22 Nov), but its words are marked a draft and its row does not say Logout is to start throwing the change away. I
cannot settle which is meant; the guide has a doubted fact go back to the builder (§1's head, D2441). The words for
each answer:

- **If the change is kept through Logout (today's code, the plan's §5):**
  "Your last changes aren't saved yet. Log out anyway?" — buttons "Log out" · "Stay".
  - No "lose": nothing is lost by the press. What follows is said by D2322's line on the sign-in screen.
- **If the build makes Logout drop the waiting change (a change to D2322's handling, his to hear):**
  "Your last changes aren't saved. Log out and lose them?" — buttons "Discard and log out" · "Stay".

Either way the owner approved a sentence that says "lose it"; if the first answer is the true one, the question he is
shown differs in meaning from the draft he read, and the drawing owed for this card (D1625, the plan's §5) should say
so.

Why "Your last changes", in both: see N2b. Why not "This change": the card hangs at Logout with nothing beside it that
"this" points to, and the count is not known.

### N2a — its buttons

**"Stay" stands** for the button that does not log out. Nothing is open to edit, so the Input window's "Keep editing"
would be untrue here; "Stay" is already the Logout family's word (the Tracker's question, D129).

The other button follows R2's answer above: "Log out" where nothing is lost (the question itself says what will
happen, so the bare verb is enough — §1, "a button starts with its verb"); "Discard and log out" where the change is
dropped, the same button as N5 and N6 below, so every Logout question that loses work has one button.

### N2b — more than one change waiting — NOT A SEPARATE CASE

The app cannot tell one waiting change from several. The saver keeps what waits as one group, one entry per record,
later values merged over earlier ones (`storage/postman.ts`: "a new group MERGES into pending, latest value per key
winning"; a failed group is merged under what arrives after it). One change of his can write several records; several
changes to one record wait as one. A count of records is not a count of his changes.

**Ship one wording for both:** "Your last changes aren't saved yet." / "…aren't saved." as in R2.

- "Changes" is the app's own number-free word: the Input window says "unsaved changes" whether one box changed or five.
- "Last" is true and is D2322's word ("The last change has not saved yet"): everything he changed since the save
  first failed is what waits. Without it, "Your changes aren't saved" could be read as all his work of the day.

### R3 — a pick with an opened Admin → Users row holding typing (D2595)

**Ship:** "Blocked: save or cancel the open row, then pick 149."

Does "close the open row" tell him how? **No.** What the row offers (`ui/UsersPanel.tsx`, `PersonEditor`):

- No ✕, and nothing on screen called Close.
- **Save** and **Cancel** are both there as soon as the row is open, not only once it has changes (the brief had it
  otherwise). Save saves and closes; where nothing changed, Save just closes.
- Three ways shut it and drop the typing with nothing asked: Cancel, Escape ("ESCAPE CLOSES THE OPENED ROW AS ITS
  CANCEL DOES … nothing saved, no question", his D2396 (p)), and a second tap on the name line. Nothing on screen
  suggests the name-line tap.

So "close" hides the one choice that matters, and its most natural reading — tap the row shut — throws away the typing
D2595 was ruled to protect, one press later and still unasked. A window is different: its ✕ asks first (D1622). "Save
or cancel" names the row's two buttons and makes the choice plain.

Two facts for the builder, neither changing the recommendation:

- A row of a man with no sign-in has "Give sign-in" where Save would be; an archived man's row has "Restore" and
  "Save name". "Save" is written here as an ordinary verb, lower case, to cover them; the cold read should include one
  of those rows.
- **The open row can be out of sight when the note appears.** The Users list stays alive while another Admin section
  is showing (`ui/AdminPage.tsx`: the panel is hidden, not removed), and on a phone while the section list is
  showing. A man on Admin → Squadrons who picks 149 would be told about a row he cannot see. Either the guard counts
  the row only while it is on screen, or that case reads "…the open row on Users…". The builder's call; it needs
  pressing before the words are final. (Leaving the Admin page altogether removes the row and its typing today,
  nothing asked — a neighbouring case the guard as ruled does not cover; named under "What the list misses".)

### N3a — the view switch

**Ship:** "Blocked: save or cancel the open row, then switch to the member view."

**"…then switch back to the admin view." — probably dead; do not build it without a path.** An opened row lives only
on the Admin page (`ui/Shell.tsx` draws the Admin page only while it is the page shown, and hides its tab from
anyone not in the admin view; `state/store.ts` `switchRoleView` moves him off it), and the switch into the member
view is itself refused while the row is open. I found no way to be in
the member view with a row open. The guide's §1a test 0: a string no path reaches is reported dead, not worded. If
the builder finds a path, the words are "Blocked: save or cancel the open row, then switch back to the admin view."

### N3b — a bell line to another squadron

**Ship:** "Blocked: save or cancel the open row, then press this line again."

- "This line" is the first review's choice (D2590) and stands. "Row" and "line" are different enough words that the
  bell list is not mistaken for the row.

### N4 — a pick, the view switch or a bell line while a change is not saved (D2594)

**Ship:**
- "Blocked: press Retry to save your changes, then pick 149."
- "Blocked: press Retry to save your changes, then switch to the member view." / "…then switch back to the admin
  view."
- "Blocked: press Retry to save your changes, then press this line again."

- One word changed: "change" → "changes", for N2b's reason (the app cannot count them).
- The rest stands. It opens "Blocked:" (D1667, D1668); it never says "Not saved" (D2594); "Retry" is the band's own
  button word; "to save your changes" is the reason, which a refusal must give (§1) — "Blocked: press Retry, then pick
  149." would be shorter and would not say why.
- "Press … then press" in the bell-line form is plain, not pretty; I left it, since "this line again" is ruled.
- For the walk, not a word change: the note sends him to Retry, so the band must be in sight when the note is. The
  band is not drawn inside the phone's ☰ menu ("a window, a sheet or the phone's menu is a short visit and has none",
  D587) — and that menu is where a phone's pick is made. If the menu is still up when the note shows, he is told to
  press a button he cannot see.
- Unlike N3a, the "switch back" form here is reachable: a save can fail in the member view too.

### N5 — Logout pressed with an opened Admin → Users row holding typing

**Ship:** "The open row has unsaved changes. Log out and lose them?" — buttons "Discard and log out" · "Keep editing".

- "This row" → "The open row": the card comes up at Logout, far from the row, so "this" points at nothing; "the open
  row" is R3's name for it (one name for one thing, §1).
- The loss is true here whichever way R2 falls: the typing lives only in the open row and goes when the session ends.
- Buttons: the draft took R2's ("Log out and lose it" · "Stay"), where "it" would not agree with "changes". I took
  the Input question's pair instead — he is in the middle of editing, as in N6, so the two typed-work questions read
  as a pair (§1b test 9) and "Keep editing" is true. If N6's change is not approved, N5 falls back to "Log out and
  lose them" · "Stay".
- The builder's reading that this is a question, not a refusal, fits D2592 ("Logout is never refused"). But D2592
  speaks of "the open window's own question", and the row has none: these are new words on screen, drawn for him
  first (D1625), as the plan's §5 already says for the card.

### N6 — Logout pressed with an Input window holding unsaved changes (D2592) — A CHANGE OF RULED WORDS, HIS TO APPROVE

Unchanged, the words do not tell him. "Close it and lose them?" and "Discard and close" speak only of the window.
Nothing says the Logout he pressed is still going ahead, so the press that reads as "close this window" also signs
him out, or brings the Tracker's question, with no word between. The harm is small — he did press Logout — but the
button does more than it says (§1: "the press did more … than he would expect of it").

**The least change, in a pattern the window already has.** The same window already rewords its second sentence and
its first button for what was pressed: "This input has unsaved changes. Open Drifter’s input and lose them?" with
"Discard and open" · "Keep editing" (`ui/InputWindow.tsx`, the card raised when another input is asked for). The
Logout form is its third member:

**Ship, on his approval:** "This input has unsaved changes. Log out and lose them?" — buttons "Discard and log out" ·
"Keep editing".

- Changed: "Close it" → "Log out"; "Discard and close" → "Discard and log out". The first sentence and "Keep editing"
  are untouched.
- D2592 names the question by its words ("Close it and lose them?", D1622), so this is his to approve, not the
  builder's or mine. If he keeps the words as ruled, they are usable — they are not false, only silent about the
  Logout.
- ✕ and Escape keep "Close it and lose them?" / "Discard and close" exactly as built; only the Logout press changes.

### N7 — the Tracker's question at the switch back to the admin view (D2403)

**Stands:** "You have unsaved chart edits on “2026”. Save them before switching back to the admin view?" — Stay ·
Discard them · Save them.

- It is T1 turned round, and its last words match the guard's ("switch back to the admin view", D2389, D2590). The
  three now read as one family: "…before switching to 149?", "…to the member view?", "…back to the admin view?".

---

## What the list misses — words this job puts on screen with none yet

1. **Logout over a window that holds typing but has no question of its own.** D2592 has Logout ask "the open
   window's own question". Only the Input window has one. The pressing report found typing in others — a holiday
   name in Inputs settings; the Leave War's Place a bid — and D2592 set aside "Logout closing the window without
   asking". Either those close unasked at Logout (then say so to him: it is the thing he set aside, for those
   windows), or each needs a question. If one is wanted, in N5's shape: "This window has unsaved changes. Log out and
   lose them?" — "Discard and log out" · "Keep editing". Not decided here.
2. **Admin → Users holds typing in two places that are not "an opened row":** the "Give access" form under Waiting
   for access, and "Add a person" at the foot. Whether the guard counts them is not in D2595. If it does, "the open
   row" does not describe either, and each needs its own noun ("the Give access form", "Add a person").
3. **Leaving the Admin page with a row open** drops the typing unasked today (see R3). Not a switch of squadron or
   view, so outside D2595 as ruled; named so it is not found later as a surprise.
4. **The phone's new way to reach Logout with a window open** (D2592; "a new control — none exists today", the
   plan's §5). Whatever is drawn, its word is "Logout", one word, as the bar's button and the word list have it; the
   verb in a sentence stays two words ("Log out and lose them?").
5. **Both at once: a window open and a change not saved.** Two notes would apply to one press. One at a time; I would
   say the window's first ("close the open window…"), since Retry sits under it, then N4 at the next press. An order
   for the builder to fix and the walk to press; no new words.
6. **A greyed Undo with two reasons.** Where the squadron in view has a step that can never be undone (the reasons
   already built) and another squadron holds steps, the builder must choose which the button says. I would keep the
   squadron in view's own reason first. No new words.
7. **R1 where the pick cannot be made.** "Pick 142…" assumes 142 is still in his list. If the right behind it has
   gone (a Plan ended), or he is in the member view, the instruction cannot be followed. The builder should name only
   squadrons he can pick now; where there is none, the button falls back to today's "Undo" with no reason.

## Drafts that break a ruling

- **None breaks D1667, D1668, D1669 or D2594's ban:** every refusal opens "Blocked:", none says "Not saved" or
  "Refused", every squadron is a bare number, none says "earned leave" or a builder's word.
- **R2, N2a, N2b against D2322 and D2205** — not a broken rule of wording but a claimed cost the app does not carry
  out (above). The later ruling wins where it clearly covers the case (D90, D201); here it is a draft and does not
  clearly say the change is to be dropped, so it is a question for him, not a reading to build on.
- **R3 against the purpose of D2595** — "close the open row" leads to the typing being lost unasked, the very thing
  the ruling was made to stop (D2396 (p) has Escape and Cancel ask nothing).
- **N5 against the letter of D2592** — the row has no "own question"; new words, drawn first (D1625). The builder
  already reads it so.
- **N6, as I adjusted it, against D2592's named words** — marked his to approve; the unchanged words break nothing.

## What I did not do

- **No cold read.** Every adjusted line carries an instruction or a cost, so each still owes the guide's cold read by
  a reader who has seen none of this (§1a test 9, §1b test 11) — whole lines, a real number in every slot, the no-
  sign-in row among them.
- **No box measured in a build.** From the phone drawing (`p3-p-after-crop.png`, 402 wide) the note's one line holds
  about 57 characters. By that estimate the pick forms of R3 (52) and N4 (57) fit or just fit one line, and the
  view-switch and bell-line forms of R3 and N4 (65 to 78) take two lines on a phone. That is an estimate from a
  picture, not a measurement (§1a test 1).
- **Nothing pressed.** The facts above about the row, the saver and Logout are read from code and from the pressing
  report, not from a running app.
- **One limit that is not new:** the greyed Undo's reason is the button's hover text, and the button is disabled, so
  on an iPhone R1 cannot be read at all — as with every greyed-Undo reason since D350. He reads on an iPhone; worth
  saying to him when R1 is shown.

## The whole set, as I would ship it

| | Words |
|---|---|
| R1 | Pick 142 to undo your changes there. |
| N1a | Pick 142 to redo your changes there. |
| N1b | Pick 142 or 149 to undo your changes there. |
| Lit Undo | unchanged — no squadron |
| R2, N2b (change kept through Logout) | Your last changes aren't saved yet. Log out anyway? — Log out · Stay |
| R2, N2b (change dropped at Logout) | Your last changes aren't saved. Log out and lose them? — Discard and log out · Stay |
| R3 | Blocked: save or cancel the open row, then pick 149. |
| N3a | Blocked: save or cancel the open row, then switch to the member view. ("…switch back…": no path found) |
| N3b | Blocked: save or cancel the open row, then press this line again. |
| N4 | Blocked: press Retry to save your changes, then pick 149. / …then switch to the member view. / …then switch back to the admin view. / …then press this line again. |
| N5 | The open row has unsaved changes. Log out and lose them? — Discard and log out · Keep editing |
| N6 (his to approve) | This input has unsaved changes. Log out and lose them? — Discard and log out · Keep editing |
| N7 | unchanged |
