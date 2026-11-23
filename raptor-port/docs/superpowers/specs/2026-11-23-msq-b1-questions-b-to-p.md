# The questions on the two-squadron screens, (b) to (p) — checked and rewritten (23 Nov 26, late evening)

Each question was checked again on tonight's build of the app, by pressing the app's own controls, and against your
rulings. Fourteen questions were checked; four had a wrong or weak recommendation and are corrected, two were wider than
this morning said, and four need no decision beyond a "yes, leave it".

The people in the examples: **Saber** is a master admin whose own squadron is 142. **Hunter** is an admin of 142.
**Kestrel** is an admin of 149. **Kite** is a newcomer with no access yet.

Pictures are in `raptor-port/docs/handpass/2026-11-23-msq-b1-morning/` (this morning's) and its folder `fable/`
(tonight's, taken on tonight's build). Every picture is of the real app, the place ringed in red.

---

## At a glance — four rounds, the ones that need you most first

### Round 1 — these change what people are told or can find

- **(e) — CLOSED 23 Nov 26 by his D2395: the Tracker follows the squadron picked, so this band goes.** ~~The Tracker's band sends people the wrong way.~~ "To open 149's, sign out and in." does not work unless 149 is
  his own squadron. Recommended: add "and pick 149 before the Tracker" when it is not. New words: drawn for you first.
  Picture: `fable/q-e-tracker-band-hunter.png`
- **(b) The filter's "Plans" tick misses your own people who plan another squadron.** On 142's list it reads
  "Plans 142" and finds nobody; Hunter, who "also plans 149", is found by no tick. Recommended: one tick for each
  squadron somebody on the list plans, so the tick finds exactly the rows that say "also plans …". Drawn for you first.
  Pictures: `fable/q-b-plans-142-ticked.png`, `fable/q-b-hunter-row-also-plans-149.png`
- **(n) A man made master admin and then taken off it is never told his Plan of 149 has gone.** Recommended: his bell
  says so on the day it goes — a new line, "Plan of 149 ended: master admin covers every squadron · Saber" — and the
  two master admin lines say what they mean. New words: drawn for you first. Pictures: `fable/q-n-today.png`,
  `fable/q-n-after.png`
- **(f) Request access starts on 142, so a newcomer who does not look asks the wrong squadron.** Recommended: start on
  "Pick…", as Seat and CAT already do. New words: drawn for you first. Picture: `q-f-request-access-starts-on-142.png`

### Round 2 — small behaviour and wording

- **(j) A Squadron tick in the filter stays on after another squadron is picked,** so the top bar can say 149 while the
  list shows 142's people. Recommended: the Squadron ticks clear at a pick; the count beside "People" stays as built.
  Picture: `fable/q-j-142-ticked-then-149-picked.png`
- **(k) The Inputs settings window closes when another squadron is picked.** Recommended: keep it closing — the same as
  you chose for the midnight of a man's move. (This morning's recommendation was the opposite; corrected.)
  Pictures: `q-k-inputs-settings-before-pick.png`, `q-k-inputs-settings-after-pick.png`
- **(l) Undo of making a master admin says "Undid: the master admin mark" — no name, and the same words whether he was
  made one or taken off.** Recommended: "Undid: Made a master admin · Hunter" and "Undid: Master admin taken off ·
  Hunter". New words: drawn for you first. Picture: `fable/q-l-undo-master-today.png`
- **(o) One Save that changes two things is undone as one, but the bubble names only one of them.** Recommended: name
  each — "Undid: Plan of 149 given, sign-in name changed · Hunter". New words: drawn for you first.
  Picture: `fable/q-o-undo-rename-plan-today.png`

### Round 3 — two small ones

- **(p) On a desktop, Escape does not close an opened person's row on Admin → Users.** Recommended: Escape closes it,
  exactly as Cancel does. Picture: `q-p-users-row-opened-desktop.png`
- **(m) A press on the bell's Show buttons that the app refuses says nothing.** Recommended: leave it silent — one
  person can no longer reach this since the night's fix. (This morning's proposed words would have broken your
  "Blocked:" rule; corrected.) Picture: `q-m-bell-show-row.png`

### Round 4 — nothing to change; a "yes, leave them" is enough

- **(c) Two lines of words on the roles table follow the drawing you approved, not the earlier draft.** Recommended:
  keep. Picture: `fable/q-c-roles-table-today.png`
- **(d) An open Leave War window covers the top bar, so "142 ▾" cannot be pressed until it is closed.** Recommended:
  leave as built. Picture: `q-d-war-window-shade-over-142.png`
- **(g) Five small pieces of words on Admin → Squadrons were in no drawing.** Recommended: keep all five.
  Picture: `q-g-hover-change-142-place.png`
- **(h) The day chips on the board start 32px further right than drawn.** Recommended: keep.
  Picture: `q-h-board-day-chips-start.png`

---

## Each question in full

### (e) The Tracker's band after a pick — "sign out and in" is not enough

**Where, and who meets it.** The Tracker page, for anyone who can work in two squadrons: a master admin, or an admin
with Plan of another squadron. Example: Hunter, an admin of 142 with Plan of 149.

**What happens today.** The Tracker keeps the squadron it first opened with until he signs out (your ruling; the cost
you accepted). Hunter opens the Tracker on 142, then picks 149. The Tracker goes read only under a band:

> **This is 142's Tracker.** Pick 142 to change it. To open 149's, sign out and in.

Hunter signs out and in. The app starts him on 142, his own squadron. He opens the Tracker and gets 142's again — the
band's advice did not work. Checked tonight: the only way to 149's Tracker is to sign out and in, **pick 149 first**,
and only then open the Tracker.

This morning's question said this happens to a master admin. It happens to every Plan holder too. The words are right
only in the case that was drawn: the squadron he wants is his own (Hunter has 149's Tracker open and wants 142's —
signing in again lands him on 142).

**The choice.**
- A — keep the words. Wrong for the commoner case.
- B (recommended) — when the squadron he wants is not his own, the band says the extra step:

> **This is 142's Tracker.** Pick 142 to change it. To open 149's, sign out and in, and pick 149 before the Tracker.

  When the squadron he wants is his own, the drawn words stay as they are. The second band, shown when he can no
  longer open the Tracker at all ("You can't open 149's Tracker any more. Sign out and in to open 142's."), gets the
  same added words in the same case.

**Why B.** A band that tells a man what to do must work when he does it. One extra clause, only where it is needed.

**What it costs.** The band is longer; on an iPhone it may take two lines. **New words: drawn for you first**, at
phone and desktop size, before anything is built.

**Pictures.** `fable/q-e-tracker-band-hunter.png` (Hunter, tonight: the band that misleads him);
`fable/q-e-tracker-band-hunter-149-open.png` (the drawn case, where the words are right);
`q-e-tracker-cover-words-master.png` (this morning's, Saber).

---

### (b) The filter's Role tick "Plans 142"

**Where, and who meets it.** Admin → Users, the Filter button beside the search, the Role group. Any admin.

**What happens today.** On 142's list the Role ticks read: Member · Admin · **Plans 142** · Master admin. "Plans 142"
finds people of *another* squadron who hold Plan of 142. In the app tonight nobody does, so the tick shows "Showing 0
of 61".

Meanwhile Hunter, 142's own admin, holds Plan of 149. His row on 142's list says "· also plans 149". No tick finds him.
You only find him by reading down the list.

The drawing you approved showed, on 142's list, a tick "Admin + Plan of 149" (shortened by your later answer to
"Plans 149") — the tick that finds Hunter. The build made the tick follow the list's own squadron instead. So on 149's
list the tick does read "Plans 149" and does find Hunter, but on his own squadron's list it does not exist.

Both are useful to an admin of 142: "which of my people plan elsewhere?" and "who from outside can change my
squadron?"

**The choice.**
- A — keep as built: one tick, "Plans" plus the list's own squadron. Outsiders only.
- B — as first drawn: ticks for the other squadrons only. Own people only.
- C (recommended) — one "Plans …" tick for each squadron that somebody on the list holds Plan of. On 142's list tonight
  that is one tick, "Plans 149", finding Hunter. If Kestrel were given Plan of 142, "Plans 142" would appear beside it
  and find him. Nobody on the list plans anything: no such tick.

**Why C.** The tick then finds exactly the rows whose grey line says "· also plans …" — what you see is what you can
filter. It is how the CAT ticks already work (only the CATs someone on the list holds). It gives back the tick you
were shown, and keeps the one the build added.

**What it costs.** The Role row can grow by a tick or two; with eight squadrons it may run to a second line, as the
Squadron ticks already do. The words are ones you approved ("Plans 149"), but two "Plans" ticks side by side were never
drawn — **drawn for you first**.

**Pictures.** `fable/q-b-plans-142-ticked.png` (142's list tonight: the tick on, nobody found);
`fable/q-b-hunter-row-also-plans-149.png` (Hunter's row on the same list, found by no tick);
`fable/q-b-plans-149-on-149.png` (149's list: "Plans 149" finds him there); `q-b-filter-role-plans-142.png` (this
morning's).

---

### (n) Hunter's bell when he is made a master admin and later taken off

**What happens to Hunter.** Hunter is an admin of 142 and Saber has given him Plan of 149. Saber then makes him a
master admin. A master admin already has every squadron, so the app quietly removes his separate Plan of 149 at that
moment. Later Saber takes master admin off. The Plan of 149 does not come back: Hunter is left with 142 only.

**Why it matters.** His bell never tells him. The last thing it says about 149 is "Given Plan of 149", which is no
longer true. He finds out when 149 is missing from his "142 ▾" menu.

**See it.** Two pictures of Hunter's bell, newest line on top, the changed lines ringed in red:
- today: `fable/q-n-today.png`
- after the fix: `fable/q-n-after.png` (a mock-up: the app's own bell with the new words put in for the picture)

**The fix — three lines, the exact words.**

When Saber makes him a master admin, the bell gets two lines where today it gets one:

> Made a master admin: full access to every squadron · Saber
> Plan of 149 ended: master admin covers every squadron · Saber

When Saber takes it off:

> Master admin taken off: full access to every squadron ended · Saber

If he held View of a squadron, it ends the same way and is said the same way: "View of 150 ended: master admin covers
every squadron · Saber".

**The choice.**
- A — leave it as it is.
- B — only reword the two master admin lines (last night's recommendation). Withdrawn: "full access to every squadron
  ended" still lets Hunter think he is back to what he had before, Plan of 149 included.
- C (recommended) — the three lines above. The Plan is said to have ended on the day it ends, in the words the bell
  already uses for a Plan that ends ("Plan of 149 ended: archived"). The bell's last word on 149 is then true.

Putting his old Plan back by itself when master admin comes off is not offered: access nobody gave would come back.

**What it costs.** One more line on the day he is made a master admin, and the lines are longer: each takes two rows
in the bell, as the "after" picture shows. Nothing else about the bell changes.

**For Saber, unchanged.** When he sets Hunter's Role back to Admin, the row shows "149 None · View · Plan" with None
lit before he saves (`fable/q-n-row-admin-picked-again.png`), and he can give Plan again in the same Save; Hunter's
bell then says "Given Plan of 149: full access to 149 · Saber" as usual.

---

### (f) Request access — the Squadron box starts on 142

**Where, and who meets it.** The card a newcomer fills in after signing in with no access. Example: Kite, who belongs
to 149.

**What happens today.** The card's first box, Squadron, already shows "142". The other two boxes he must choose from,
"Pilot, WSO or personnel" and "CAT", start on "Pick…". If Kite fills in the rest and presses "Request access" without
changing Squadron, his request goes to 142's admins. A request is answered only by its own squadron's admins, so 149's
never see it; 142's get a stranger.

**The choice.**
- A — keep it starting on 142, as drawn.
- B (recommended) — Squadron starts on "Pick…", and "Request access" will not send until he has chosen, saying so in
  the card's own way: "Pick your squadron".

**Why B.** The same as the two boxes below it, and he cannot ask the wrong squadron by not looking. With only one
squadron in the app the box is not shown at all, as today.

**What it costs.** One more tap for every newcomer. The same choice on Admin → Users' "Add a person" stays as it is
(it starts on the admin's own squadron, and the admin knows where he is). **New words ("Pick…" there, "Pick your
squadron"): drawn for you first.**

**Picture.** `q-f-request-access-starts-on-142.png` (unchanged tonight).

---

### (j) Admin → Users — a Squadron tick left on when another squadron is picked

**Where, and who meets it.** Admin → Users, the Filter's Squadron group. Only a master admin has it. Example: Saber.

**What happens today.** Saber is on 142's list and ticks Squadron "142". Nothing changes, as it should. He then picks
149 from "142 ▾". The top bar now says 149 — but the list still shows 142's 61 people, under a heading "142 · 61", with
"People · 61" above. Every other page has moved to 149; this one has not. With three or more squadrons it is easier to
hit: tick 149, pick 150, and the list still shows 149.

The count beside "People": this morning's recommendation was to make it always count the top bar's squadron. That would
put "People · 61" over a list of 149's ten people. As built it counts the people of the squadrons listed, which is also
what the drawing you approved shows ("People · 71" with both ticked). So that half of this morning's question is
withdrawn: the count is right as it is.

**The choice.**
- A — leave the tick on after a pick.
- B (recommended) — a pick clears the Squadron ticks, so Admin → Users always opens on the squadron just picked. Seat,
  CAT and Role ticks and the search stay, as they do today.

**Why B.** A pick means "show me this squadron". The page should not need a second step to obey.

**What it costs.** A master admin who wants both squadrons listed ticks them again after a pick. No new words.

**Pictures.** `fable/q-j-142-ticked-then-149-picked.png` (top bar 149, the list 142's);
`fable/q-j-149-ticked-on-142.png` (149 ticked on 142's page — "People · 10" over "149 · 10", which is right);
`q-j-filter-149-people-10.png` (this morning's).

---

### (k) The Inputs settings window when another squadron is picked

**Where, and who meets it.** The Inputs page's ⚙ window ("Inputs calendar settings": the late cut-off, "Members may
file duties for others", Calendar…), for an admin who can pick another squadron. Example: Saber.

**What happens today.** Saber opens the window on 142 and picks 149. The window closes. Anything he had changed in it
and not saved is dropped. The SANS settings and the Calendar window do the same.

The plan for this half said the window would stay open, still 142's. A fix round the night before changed it to close,
after the readers found a window left open across a change of squadron saving into the wrong one. You were asked about
the same windows for the midnight of a man's move, asked "so closing it will have lesser bugs?", were told yes, and
chose "close with the note".

This morning's recommendation was to keep the window open as 142's. That goes against your own answer for the same
windows, and brings back the risk it was closed to remove.

**The choice.**
- A (recommended) — keep as built: the three settings windows close at a pick, nothing saved.
- B — keep them open, still 142's, while every page behind shows 149.

**Why A.** One rule for these windows whenever the squadron under them changes. Fewer places for a change to land in
the wrong squadron. The windows that hold typed work — a Leave War day, an input — are the ones you ruled stay open,
greyed, with their band; settings are quick to reopen.

**What it costs.** Unsaved settings are lost without a word. The short note you chose for the midnight case ("… the
Inputs settings were closed. Nothing was saved.") is still to be drawn; I would draw the pick's version with it, shown
only when something was changed and not saved. **That note is new words: drawn for you first.**

**Pictures.** `q-k-inputs-settings-before-pick.png`, `q-k-inputs-settings-after-pick.png` (unchanged tonight).

---

### (l) The Undo words for a master admin

**Where, and who meets it.** The small bubble after Undo, and the Undo button's hover text. A master admin. Example:
Saber makes Hunter a master admin, then presses Undo.

**What happens today.** The bubble reads "Undid: the master admin mark". The hover text before the press reads
"Undo — the master admin mark", and Redo the same. No name, and the same words whether Hunter was made a master admin
or taken off it. Your approved shape for access is "Undid: Plan of 149 given · Hunter".

**The choice.**
- A — keep.
- B (recommended) — the bell's own words, in your approved shape:
  "Undid: Made a master admin · Hunter" and "Undid: Master admin taken off · Hunter"; the hover texts the same after
  "Undo —" and "Redo —".

**Why B.** It says who and which way. It uses the words Hunter's own bell uses for the same act, and drops "mark",
which is not a word anyone sees on the row (the row says Role: Master admin).

**What it costs.** Nothing elsewhere. **New words: drawn for you first.**

**Pictures.** `fable/q-l-undo-master-today.png` (tonight); `q-l-undo-master-mark.png` (this morning's).

---

### (o) The Undo words when one Save changed two things

**Where, and who meets it.** The same bubble. Example: Saber opens Hunter's row, changes his sign-in and gives him
Plan of 149, and presses Save once. One Undo takes both back — that part is right.

**What happens today.** The bubble reads "Undid: Plan of 149 given · Hunter". The sign-in went back too, and nothing
says so. Checked tonight, the same happens with other pairs: made a master admin and renamed in one Save reads only
"Undid: the master admin mark".

**The choice.**
- A — keep: the bubble names the main change only.
- B (recommended) — the bubble names each thing that Save changed, a comma between, the person last:
  "Undid: Plan of 149 given, sign-in name changed · Hunter".

**Why B.** Undo should never take back something it does not name. Two squadron lines changed in one Save are already
joined this way ("View of 149 given, Plan of 150 given · Hunter"); this finishes the rule.

**What it costs.** A longer bubble; on an iPhone it may take two lines. **New words: drawn for you first.** This
morning's suggested wording, "Plan of 149 given and his sign-in name", is replaced — "his sign-in name" did not say
what happened to it.

**Pictures.** `fable/q-o-undo-rename-plan-today.png` (tonight); `q-o-undo-rename-and-plan.png` (this morning's).

---

### (p) Escape on an opened person's row

**Where, and who meets it.** Admin → Users on a desktop, a person's row opened. Any admin.

**What happens today.** Escape does nothing; only Cancel (or tapping the row's name again) closes it. Checked tonight
with the cursor in the sign-in box and outside it. The Filter panel next to it does close on Escape. This is older
than the two-squadron work.

**The choice.**
- A — leave it.
- B (recommended) — Escape closes the opened row exactly as Cancel does: nothing saved, no question. The rows on Admin
  → Squadrons, which open the same way, get the same. If the Filter panel is open, Escape closes that first.

**Why B.** Escape closes every other opened thing in the app.

**What it costs.** A stray Escape drops what he had picked in the row and not saved — as a stray Cancel does today.
The row holds a few picks, not typed work, so no "lose them?" question is proposed. No new words.

**Picture.** `q-p-users-row-opened-desktop.png` (unchanged tonight).

---

### (m) A refused press on the bell's Show buttons

**Where, and who meets it.** The bell's "Show 142 149" buttons, for a master admin or a Plan holder.

**What happens today.** A press switches that squadron's lines on or off and is saved as his own choice. The night's
fix removed the one way a single person could get a press refused (a squadron made, then undone away). What is left
needs the app open in two tabs at once, one of them removing a squadron while the other is about to press its button.
I could not produce it in one browser. If it happens, the press changes nothing and the buttons redraw as they truly
are. If saving itself fails, the app's "Not saved" band already shows, as for any save.

This morning's recommendation was to show "This change could not be saved." under the row. By your own ruling a
refusal of one change is not a failed save and opens with "Blocked:", so those words would have been the wrong ones.

**The choice.**
- A (recommended) — no message.
- B — a "Blocked:" note under the row, in the grey look you chose for refusals. New words, drawn first.

**Why A.** A message for a case nobody can reach by ordinary use is one more thing to keep right. Nothing is lost when
it happens.

**Picture.** `q-m-bell-show-row.png` (unchanged tonight).

---

### (c) The roles table's two lines of words

**Where.** Admin → Users, a person's row, "What each role allows".

**What it says today.** Above the table: "View and Plan give access to another squadron." Under it: "✓ can change ·
read: can see, not change · — cannot open". The earlier written draft had "View and Plan are access to another
squadron." and "read = can see". The drawing you approved has the words as built, and you ruled the table is built as
drawn.

**Recommended.** Keep. Still true after today's change to View (the View column now shows a dash for Logic; the
picture is tonight's).

**Picture.** `fable/q-c-roles-table-today.png` (tonight); `q-c-roles-table-two-lines.png` (this morning's, before the
Logic cell changed).

---

### (d) An open Leave War window covers the top bar

**Where, and who meets it.** The Leave War, a day's window open (example: Ranger, Wed 25 Nov), for someone who can
pick another squadron.

**What happens today.** The window's shade lies over the whole screen, the top bar too. A press on "142 ▾" lands on
the shade and closes the window — as a press anywhere outside the window does. A second press opens the menu. Checked
tonight. So the band you approved for a window left open at a pick ("This is 142's. You picked 149 — close this to go
on.") can be reached on the Leave War only by keyboard; it stays as the safety net. On a desktop the Input window does
not cover the bar, so its band is reached in the ordinary way; on an iPhone the Input window covers the bar too.

**Recommended.** Leave as built. Closing the window first is what a person does anyway, and a pick can then never
happen under an open Leave War window by mouse or finger — one less way to go wrong.

**Picture.** `q-d-war-window-shade-over-142.png` (unchanged tonight).

---

### (g) Five small pieces of words on Admin → Squadrons that were in no drawing

**What they are, exactly as the app says them tonight.**
1. Hover text on a squadron's row he may change: "Change 142's place".
2. Hover text on one he may not: "Only an admin of 149 can change its place."
3. Hover text on a place's row: "Change Home base".
4. In "+ New squadron" with a new place, before its name is typed: "Saved together: 150 and its new place." (once
   typed: "… and its new place, Northern base.")
5. A squadron with one person reads "1 person", not "1 people".

**Recommended.** Keep all five. Each follows words you approved elsewhere (the "Only an admin of 149 can …" shape; the
"Saved together: …" line). Hover texts show on a desktop only; nothing depends on them.

**Picture.** `q-g-hover-change-142-place.png` (unchanged tonight).

---

### (h) The board's day chips start 32px further right than drawn

**Where.** Edit Schedule, a day opened, the top of the board, on a desktop.

**What happens today.** The day's title now ends with the grey squadron number. In some fonts "Wednesday" with the
number was cut short by 19px, so the title's space was widened from 312 to 344px. The day chips beside it therefore
start 32px further right — in the same place for every day, as your rule for those chips asks.

**Recommended.** Keep. The other way is to let the chips slide from day to day, which that rule forbids, or to cut the
day's name.

**Picture.** `q-h-board-day-chips-start.png` (unchanged tonight).

---

## Apart: what changed from this morning's version, and why

**Recommendations corrected.**
- **(k)** was "keep the settings window open as 142's". Now "keep it closing, as built". His ruling on the same three
  windows at the midnight of a move (D2263: "close with the note", after asking whether closing has fewer bugs) and
  the 22 Nov fix round that closed them (a window left open saved into the wrong squadron) both point the other way;
  the plan's line (§2 item 1, "stays 142's") predates both.
- **(m)** was "show 'This change could not be saved.'". Now "no message". Those words are the generic failed-save
  words; D1667 gives a refusal of one change the grey "Blocked:" note. And since the night's R1 fix the case is not
  reachable by one person in one browser (not reproduced tonight — read from the code, not pressed).
- **(n)** was "leave it", then "say it in the two master admin lines". Now those two lines and a third, "Plan of 149
  ended: master admin covers every squadron", on the day he is made a master admin (the host’s suggestion, checked
  against the code: that Save is where his Plan is removed, and today it tells him nothing of it). D2251 has a person
  told whenever View or Plan is given or ended; today his bell’s last word on 149 is "Given Plan of 149", no longer true.
- **(j)**, first half: "the heading keeps the page's own count" is withdrawn. As built the heading counts the squadrons
  listed, which matches the approved drawing (nfc: "People · 71", both ticked); the morning's version would have put
  142's count over 149's people. The second half (ticks clear at a pick) stands, now for the Squadron ticks only.

**Questions that were wider than stated.**
- **(e)** was put as a master admin's wording gap. Pressed through tonight as Hunter (Plan of 149): the band misleads
  every Plan holder as well. "Sign out and in" works only when the squadron wanted is his own; otherwise he must also
  pick it before opening the Tracker. Exact new words proposed for that case, both bands.
- **(b)** was put as "the chip reads 'Plans 142' where the drawing said 'Admin + Plan of 149' — keep as built". The
  real difference is who the tick finds: the build's finds outsiders who plan the list's squadron; the drawing's found
  the list's own people who plan another. As built, a man whose row says "· also plans 149" is found by no tick on his
  own squadron's list. Recommendation changed from "keep" to one tick per squadron planned by someone on the list.
- **(o)** is general, not only rename + Plan: any Save that changes more than one thing names one (master admin +
  rename reads "the master admin mark"). The morning's wording replaced by the comma-joined form the app already uses
  for two squadron lines.
- **(l)** also covers the Undo and Redo buttons' hover texts, and the same words being used for both directions.

**Still true on tonight's build, checked by pressing:** (b), (c), (d), (e), (f), (g), (j), (k), (l), (n), (o), (p).
**Checked in the code only:** (h) (the 344px title box), (m).

**Changed on screen since this morning's pictures:** the roles table's View × Logic cell is now a dash (D2381) — (c)'s
picture retaken; nothing else in (b)–(p) moved.

**Questions dropped.** None of (b)–(p) fell away. (a) and (i) had already gone with D2381. Four — (c), (d), (g), (h) —
ask for no change and could be "told, not asked" in the closing report rather than put to him again; they are kept
here in round 4 so nothing is silently decided.

**New, found while checking.**
1. **A role change swallows an access change in the Undo words.** One Save that makes Hunter a member and so ends his
   Plan of 149 reads "Undid: Hunter's role" — read from the code, not pressed. It is the same gap as (o) and is settled
   by (o)'s answer B; no separate question.
2. **"People · 10" over "Showing 11 of 11"** on 149's list when Hunter holds Plan of it: the heading counts 149's own
   people, the line counts the rows listed (the Plan holder is the eleventh). As the plan says, and not wrong, but the
   two numbers side by side may be asked about. Not put as a question; noted for the closing report.
3. **The 'gone' band's twin of (e):** "Sign out and in to open 142's." has the same flaw when the squadron his pages
   are on is not his own. Folded into (e).

**New pictures (tonight's build, 1536 wide, twice the sharpness), in `…/2026-11-23-msq-b1-morning/fable/`:**
`q-b-plans-142-ticked.png`, `q-b-hunter-row-also-plans-149.png`, `q-b-plans-149-on-149.png`,
`q-c-roles-table-today.png`, `q-e-tracker-band-hunter.png`, `q-e-tracker-band-hunter-149-open.png`,
`q-j-149-ticked-on-142.png`, `q-j-142-ticked-then-149-picked.png`, `q-l-undo-master-today.png`,
`q-n-row-master-picked.png`, `q-n-row-admin-picked-again.png`, `q-n-hunter-bell-today.png`,
`q-o-undo-rename-plan-today.png`. The script that took them: `raptor-port/.tmp/fable-q/p1.mjs` (not committed; the
whole-screen ones cut by `crop.mjs` beside it). No phone-size pictures were taken tonight; (f), (m) and (n) keep this
morning's phone pictures.

**Drawn first, if he takes the recommendation (D1625):** (e), (b), (n), (f), (l), (o), and (k)'s note. No drawing
needed: (j), (p), (m), (c), (d), (g), (h).
