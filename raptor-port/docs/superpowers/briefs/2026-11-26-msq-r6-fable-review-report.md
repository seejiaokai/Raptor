# Round 6's page — the second fresh Fable's review of the new words and the page (chat 188, 26 Nov 26)

Brief: `2026-11-26-msq-r6-fable-review-brief.md`. Nothing under `src`, nothing committed or pushed, no branch switched.
The design skill was loaded (critique and clarify, for a phone). The served app on `http://localhost:4700/` was used as
it stood.

## 1. The new in-app words (D2441)

### Changed — six
| Key (file) | Was | Now | Why |
|---|---|---|---|
| `askPost` (users) | Ask 142 to post him here | **Ask 142 to post him to 149** | The squadron is named, never "here": this whole job exists because the squadron in view can be mistaken. Now one wording with the bell line and with "Restore and post to 149". 177px wide beside Save and Cancel on a desktop. |
| `askBell` (users) | 149 asks you to post him there | **Post him to 149?** | Two asks of one kind had two shapes (this, and misc's "Restore him and post him to 149?"). Both are now the question, then the signer ("· Kestrel"), who is the asker. Shorter on a phone. |
| `transferLine` (users) | On 14 Dec: moves to 149 with his sign-in. His View and Plan of other squadrons end. | **On 14 Dec: moves to 149 with his sign-in.** — and, only for a man who holds any, a second sentence naming it: "His View of 150 ends." | Cinch holds no View or Plan (his drawn row shows None, None), and a member can never hold Plan, so the sentence promised an ending of nothing. The function takes a third value (`held`); with none, the first sentence alone. The second sentence is not drawn; the page puts it to him (N6 c). |
| `askedNote` (misc) | Asked 142's admins to bring Jester back and post him to 149. Nothing is added yet. | **Asked 142's admins to restore Jester and post him to 149. Nothing is added yet.** | "Restore" is the app's word and the button's; three verbs for one act ("bring back", "have him back", "restore") made one. |
| `askRowNote` (misc) | Kestrel on 149 asks to have him back and posted to 149. | **Kestrel of 149 asks you to restore him and post him to 149.** | "Have him back" read as if Jester had been 149's. The two verbs are now the button's two verbs, in its order. |
| `transferLine` (misc) | On 1 Dec: restored on 142 and posted to 149. | **Restored on 142 now. On 1 Dec: moves to 149.** | The old line said the restore happens on 1 Dec; it happens at the press. "On <date>: moves to <n>" is now the same shape as the users sheet's line. |

One call in `draw-r6-users.mjs` changed to match (`W6.askPost('142', '149')`). No drawing carries a word of its own.

### Kept — all the rest
- **users:** `fromOther` ("From other squadrons · 4"), `nobodyOutside`, `viewOnly`, `roleAdmin` ("admin"), `roleMaster`
  ("master admin, full access"), `incoming` / `outgoing` (his words), `postingOutTo` ("posting out 4 Jan · to 150", the
  app's tag with its new last part), `undoPostOut` (the Leave War's, less "(PO)"), `postOutBtn` ("Post out…"),
  `sheetTitle`, `sheetTo`, `capPage`.
- **misc:** `itsHim` (D2632's own phrase), `askLine` ("Restore him and post him to 149?"), `restoreAndPost`, `toLabel`,
  `noName` ("— name —").

### Pictures re-made, each opened
`ONLY=postout,askpost,bell node …/draw-r6-users.mjs` and `node …/draw-r6-misc-d8.mjs`, both exit 0.
- Words changed in: `u6-d-postout-sheet`, `u6-d-askpost`, `u6-d-askpost-bell`, `m6-d-itshim-asked`, `m6-d-itshim-row`,
  `m6-p-itshim-row`, `m6-d-itshim-sheet` (each whole and `-crop`).
- Re-made by the same runs with no word changed: `u6-d-postout`, `m6-d-itshim`, `m6-p-itshim`, `m6-d-itshim-bell`,
  `m6-p-itshim-bell`.
- Every new wording fits its place on one line, desktop and phone. `u6-d-both-pages` was not re-run: none of its words
  changed.

## 2. The page's own text — fixes made (`body-n.html`, `top.html`, `body-e.html`, `head.html`; page rebuilt)

**Readings stated as settled, now each its own small question (D2611)** — a box with an example, "I would build", and
its own Differently button (the page's E9 pattern; the reply bar handles "N3d" and the like — pressed and checked):
- **N1 a** — a man's home number after his name wears its squadron's colour too. D2638's own row says this reading was
  "not put to him"; the page had "Ruled: nothing to answer".
- **N2 a–e** — the five readings were a plain list with one button for all five; now five boxes.
- **N3 a–h** — the block is on the existing page, not a new page (D2641's reading); Plan holders named and View-only
  folded; a master admin in the block (was buried in a grey note); Hunter leaves 149's own list; the role in words
  (it narrows D2625, which ruled no role on such a row — the page now says so); what Incoming and Outgoing show
  (D2643's reading); postings that are not to another squadron; the order of squadrons (stated before as a fact; it is
  the host's brief, no ruling).
- **N4 a** — a man in the block is also in his squadron's folded group.
- **N6 a–e** — where "Post out…" is and what it opens; the "To" line; the sheet's line; "Undo post out" inside the
  opened row; who can change a posting.
- **N7 a–c** — what the bell line opens; what Kestrel sees after asking; the button on a phone.
- **N8 a** — the same wait wherever the number is covered.
- **N9 a–e** — the form shuts; the bell line and its day; the fourth button; when he is restored; while Kestrel waits.
- **N10 a–b** — the empty first line; where the squadron number sits.

**Wrong or unsupported claims corrected**
- N6 said "Not yet ruled, drawn as I recommend: Outgoing also lists a posting overseas, to SANS or to Delete". It is
  **not drawn** (the drawer's report says so). Now N3 g, marked "Not drawn".
- N8 said the wider wait was "drawn as I recommend". Not drawn. Now N8 a, marked so.
- N7 said "You ruled that a man is moved by the squadron he leaves". Softened to what the rulings carry (a man is posted
  out by his own squadron's admins), and the item now says plainly that the ask is the agent's idea, not his.
- N7's tap ("opens Cinch's row, ready for Post out…") was stated as fact in a caption; it is undrawn. Now N7 a.
- N5's heading read "E8 as recommended", as if answered. Now "E8 drawn as recommended", with "E8 is still yours to
  answer". The process line "Its words go to a second fresh Fable before the build" removed.
- **E9 g contradicted N3:** it still said Hunter "stays on 149's main list". It now carries a violet "Updated in round
  6" clause pointing to N3 d and N3 e.
- N3's "Seven/Squadrons in order … Not visible here" bullet list replaced; N11's "standing rule" reworded plainly.
- Captions carry the new words exactly (the sheet's line, the bell lines, the row's note, the passing note).
- Two honest notes added to captions: N7's bell picture still has the plain numbers (see §4); N9's picture 2 shows
  round 5's list, with Hunter in it.
- N9's six pictures are numbered 1–5 in their captions, so the flow reads in order on one column.
- N10: said that the app's own list is new building work (today the browser draws the lists), so the cost is in the
  question.

**The top list**
- A new line explains the small reading boxes and that "as recommended for all" takes them too.
- Each N row with readings says how many are inside; N5 says E8 is still his; N7's title carries the new button words
  and its tag reads "my idea · needs your word", the same in the list and on the item.

## 3. The page at 390 wide (rendered in WebKit at 390×844, dark and light)

Checked after the last rebuild: page width 390 = screen width, nothing wider than the screen, no broken picture, no
script error, 44 sections, 103 Differently buttons, the reply bar answering N3, N3d and N6b together.

Fixed:
- **The two phone cuts were squashed** (N3's and N4's phone pictures): the tall-picture height limit applied inside a
  cut frame and distorted the picture. A rule in `head.html` now exempts cut pictures; the frame is capped at 320 wide.
- **The violet edge touched the text** on every round-6 item: 10px added between the edge and the words.
- **Pictures cut to what they are about:** N3's phone cut now ends under the Outgoing group (it cut Raven's row in
  half); N6's two pictures are cut to the button line and to the sheet; N7 gains a close-up of the button (at full
  width it was unreadable); N9's passing note and its sheet are cut to the note and the sheet; N10's two sign-off
  strips are cut to the three boxes round PLANNED BY. A tap still shows each whole picture.
- **Violet against green and plain:** distinct in both themes — violet edge, violet tag and violet-tinted list rows;
  green only on recommendations; last round's marks plain grey. Nothing changed here.
- A small rule so two buttons inside a reading box (N6 b) sit together at the right.

## 4. Found, not fixed — and why

Drawings I may not redraw (brief: "redraw only words"):
1. **The same sheet is drawn two ways.** N6's sheet: head "Cinch  Post out", the "To" line a drop-down. N9's sheet:
   head "Jester" with a drag handle, the "To" line two buttons ("✓ 149", "150"). One will be built. Put to him as N6 b,
   recommending the drop-down (it still fits with many squadrons). The heads differ too; not put to him — a drawing
   detail for the host.
2. **`u6-d-askpost-bell` is against D2638:** Hunter's bell shows 142 and 149, so the numbers should wear their colours
   (as `m6-d-itshim-bell` does); it draws them plain. Its caption now says so. It needs the users drawer's script to
   apply the colours.
3. **`m6-d-itshim-asked` shows round 5's list** (Hunter among 149's people, no block). Caption says so.
4. **"Cancel" beside "Undo post out"** (the opened Outgoing row): with only those two buttons, "Cancel" can read as
   "cancel the posting". Kept, because every opened row on this page closes with Cancel and a mistaken press is
   harmless; N6 d tells him what it does. If he trips on it, "Close" is the word.
5. **N9's sheet ends in "Post out"**, though here that press also restores. The People & accounts page rules "a button
   reading just Post out", so I left it; the sheet's line now says both things, and N9 d asks when the restore happens.
6. **"— name —" for the Person box.** The app's forms say "Pick…" for an empty choice (the Add a person form); the
   sign-off boxes say "— name —". One drop-down, two possible words. Kept "— name —" for both and put it as N10 a.
7. **The users drawer's own list:** no phone pictures of N6, N7 or both pages; "View only" opened, a block row opened,
   and the day a posting lands are undrawn. N7 c covers the phone button.
8. **The two drawers' reports** still list the old words in their tables; I did not edit another helper's report. This
   file is the record of the changes.
9. N1's and N2's pictures (round 5b's, chat 187) were looked at for the page, not re-reviewed word by word: they are not
   in either report's list.
10. The films were not replayed; only their captions were read.

Mine, to be judged by the host: the recommendations in N6 b (drop-down), N9 d (restore and posting made together by the
sheet's "Post out") and N9 e (nothing shows while waiting), and N7 b's draft note "Asked 142's admins to post Cinch to
149." are this reviewer's, new, and undrawn.

## 5. Files touched
- `raptor-port/scripts/handpass/n176/words-r6-users.mjs`, `words-r6-misc.mjs`, `draw-r6-users.mjs` (one call).
- `raptor-port/scripts/handpass/n188/page/body-n.html` (rewritten), `top.html`, `body-e.html` (E9 g), `head.html`
  (four small rules).
- `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page-r6.html` (rebuilt, 141,557 bytes) and the re-made pictures
  in `drawn/` listed in §1.
- `body-d.html` unchanged: its violet lines were read and stand.
