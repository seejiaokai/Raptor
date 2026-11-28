# Section 2's question cards 13–15 — a second fresh Fable's cold read (chat 199, 26 Nov 26)

Read cold, with no builder's context: the cards (`2026-11-26-msq-s2-questions-cards-13-15.md`), the first Fable's words
review (`…-msq-s2-questions-words-review.md`), the prep report (`…-msq-s2-questions-prep-report.md`),
`scripts/handpass/n199/words-s2q.mjs`, the plain-language rule and the general rulings' "Showing him, asking him".
Opened to check a stated fact, read only: `src/state/accounts.ts lockWords` (today's last-admin words), the full rows of
D2246, D2185 and D2730, `n176/words.mjs` (the approved lines the cards quote), the design guide's §1a test 9 and §1b
tests 2 and 11, and the earlier pages put to him for how they name a button.

**Changed: the cards file only. No sentence the app would show was changed, so `words-s2q.mjs` is untouched by this
read; `node --check` on it passes.** Nothing under `raptor-port/src` was changed; nothing committed, staged, pushed,
built or run. `npm run docsize` was not run (the brief: no script but `node --check`) — owed by the host.

**In short: 6 passages changed on the cards (2 on card 13 rewritten, 1 on card 14, 3 on card 15), plus the cards
file's own header. The three reason-carrying wordings pass the cold read and stand as the first review wrote them. One
contradiction between cards found and fixed, one inside card 15 found and fixed. Five points are the host's to settle
(section 4).**

## 1. The changes, before → after

### Card 13 — the row of a man who is already an admin (the helper's sentence)

- **Before:** On the row of a man who is already an admin of 149, such as Osprey, "Admin" is not greyed: it is what he
  already is, so leaving it picked makes nobody an admin.
- **After:** One kind of row is different: a man who is already an admin of 149, such as Osprey. On his row "Admin" is
  not greyed and the line does not show, because Hunter is not making anyone an admin there: Osprey already is one.
  Hunter can still set him to Member, as he can today, and if he picks Member by mistake he can pick "Admin" back before
  he presses Save. That row is not drawn either.
- **Why:** read cold, "leaving it picked makes nobody an admin" took two reads and said nothing a person would see or
  do. The new words say what Hunter sees (not greyed, no line), why, and the one thing it is for — picking "Admin" back
  after a slip, the first review's own reason (its §3 point 4). "As he can today" is the prep report's fact (b): Member
  and Admin are both pickable on Osprey's row today and he may save Member. It stood at the tail of the paragraph about
  the three other places; it is now a paragraph of its own. **Two statements the build must make true** — "the line
  does not show" on such a row (my reading of the first review's "the reason line under an admin's row would refuse
  nothing"; the helper's sentence did not say) and "he can pick Admin back before he presses Save" — section 4, point 2.

### Card 13 — the last-admin note (the helper's "Either way…" paragraph)

- **Before:** **Either way, one sentence you approved changes.** When Hunter tries to make Kestrel a member and Kestrel
  is 149's last admin, the note today ends "Make another admin of 149 first.", which would send Hunter to do what he no
  longer can. It would read: > Kestrel is 149's last admin. Only 149's own admins or a master admin can make another.
- **After:** **With either answer, one more note changes its words.** The app never lets a squadron's last admin be made
  a member. That only comes up when a squadron is down to one admin of its own. Suppose Kestrel were 149's only admin,
  and Hunter set his Role to Member and pressed Save. The app refuses, and today it tells Hunter: > Kestrel is 149's
  last admin. Make another admin of 149 first. — Hunter could no longer do that. So for him the note would read: >
  Kestrel is 149's last admin. Only 149's own admins or a master admin can make another. — Kestrel himself, or a master
  admin, would still be told "Make another admin of 149 first." The new words would also replace the ones you approved
  for someone who cannot make an admin of 149, "Only a master admin or an admin of 149 can make another.", which Hunter
  could read as meaning himself. Either answer above approves the new words. If you want them different, say so with
  your answer. — In the picture the note is drawn on: there 149 has a second admin, Osprey, so the real app would let
  that Save through.
- **Why, five faults in the old one:**
  1. **It contradicted its own card and card 14.** Two paragraphs up, Osprey "is already an admin of 149"; card 14
     calls him "one of 149's two admins". Then the same card said "Kestrel is 149's last admin" as plain fact. Now it is
     a supposed case ("Suppose Kestrel were 149's only admin").
  2. **"One sentence you approved changes" was not what happens.** Read in the code and in D2246's row: "Make another
     admin of 149 first." does not change — 149's own admins and a master admin still get it. What changes is (a) which
     of the two approved endings Hunter gets, and (b) the words of the other approved ending, "Only a master admin or an
     admin of 149 can make another." The old paragraph named neither truthfully; the new one says both, each in a
     sentence.
  3. **It never said when this happens in real life** (D2439) or that the Save is refused, as it is today.
  4. **It was a second approval hidden on a card with two radios.** Nothing told him that either answer also approves
     this sentence. Card 14 already says "picking this answer approves it"; this now says the same and tells him how to
     ask for other words.
  5. **Its picture would mislead.** The picture shows the refusal on a page where Osprey is also a 149 admin. The card
     now says in one sentence that the note is drawn on. (The host may move that sentence into the picture's caption.)
- "Today it tells Hunter … Make another admin of 149 first." is checked: an admin by Plan counts as one who can, in
  today's words table.

### Card 14 — the other choice's cost

- **Before:** What it costs: Undo then does what his Save cannot. It stays one way an admin with Plan of 149 makes an
  admin of 149. It can only put back an admin he himself has just made a member, …
- **After:** What it costs: with Undo he can do what he cannot do with Save, so one way is left for an admin with Plan
  of 149 to make an admin of 149. He can only put back an admin he himself has just made a member, …
- **Why:** "Undo then does what his Save cannot" writes an action as if it were a person, on a card full of callsigns
  (his ruling of 17 Nov: a person does it). The two "It"s that followed had no clear owner. No fact changed.

### Card 15 — three sentences

- **Before:** **What happens now.** His Plan of 149 ends … → **After:** The man's Plan of 149 ends …
  **Why:** a section that opens on "His" names nobody; the man was in the section before.
- **Before:** A posting dated today or earlier runs at the Post out press, so its line carries the name of whoever
  pressed. → **After:** A posting dated today or earlier runs as soon as someone presses "Post out", so its line carries
  that person's name. **Why:** "at the Post out press" is not how a person would say it; the button is named in quotes,
  as the earlier pages put to him name it.
- **Before:** But nothing tells them that someone who could change everything on 149 no longer can, or why. → **After:**
  But nothing tells them that someone who had Plan of 149 no longer has it, or why.
  **Why:** untrue for one of the four cases, and against the card's own words three lines up: a man made a master admin
  "loses nothing" and can still change everything on 149. "Had Plan of 149, no longer has it" is true of all four.

### The cards file's header

One bullet added to its list of changes, naming this read and this report.

## 2. The owed cold read — the three wordings that carry a reason

Each read alone, as a whole line with real names, with only what a person at the screen has. For each: what happened,
why, what it costs, where it is put right, can any part be read two ways.

| The wording, and where it shows | What a cold reader takes from it | Result |
|---|---|---|
| **Only 149's own admins or a master admin can make an admin of 149.** — a grey line under the Role box, "Admin" greyed above it | "Admin" cannot be picked here because making someone an admin of 149 is for 149's own admins or a master admin. Nothing is lost. To get it done: ask one of them. | **Passes, unchanged.** Why and who to ask are both there. "149's own admins" is the one phrase that could be read two ways (does Hunter, working on 149's page, count?); "own" is what shuts him out, the same word doing the same job in the line he approved under the greyed Plan button, and the greyed "Admin" above the line settles it on screen. |
| **Only 149's own admins or a master admin can make an admin of 149, so this can’t be undone.** — the amber note at the foot, after Hunter presses Undo | My Undo did not go through. Why: putting it back would make Osprey an admin of 149 again, and that is not mine to do. Cost: Osprey stays a member. To put it right: ask one of 149's own admins or a master admin. | **Passes, unchanged.** One link is supplied by the reader, not said: that this Undo would make an admin. The screen settles it — he has just pressed Undo on the step that made Osprey a member, and Osprey's row reads Member. A second reading, "it can never be put back by anyone", is shut out by the first half, which says who can. Recorded for the host: where older steps wait, the app adds "Press Undo again for: <step>." after it, and "this" then points at a step the note does not name — the same is true of today's Undo words, so it is the family's, not this sentence's. |
| **Kestrel is 149's last admin. Only 149's own admins or a master admin can make another.** — the amber note at the foot, after Hunter sets Kestrel to Member and presses Save | Not saved, because 149 would be left with no admin. To put it right: another admin of 149 is made first, by one of 149's own admins or a master admin. | **Passes, unchanged — with one stumble named.** "149's own admins", said straight after "Kestrel is 149's last admin", is a group of one: Kestrel. A reader pauses there, and could take the plural to include himself. I did not change it: the meaning restated is the first review's meaning; the dated form of the same note ("…last admin from Fri 27 Nov, when Osprey moves to 142. …") needs the plural, since two own admins still stand that day; and one ending for both forms is the family the first review built. The other wording, if the host wants it put: "Only Kestrel or a master admin can make another." — exact for the undated note, wrong for the dated one. Section 4, point 3. |

None fails, so no on-screen sentence was adjusted.

## 3. Read and found sound

- **Every sentence the app would show is quoted on the cards exactly as `words-s2q.mjs` holds it** — `roleReason`,
  `roleRefused`, `lastAdmin`, `undoRefusedPlan`, `undoToday`, the four `planEnd…` lines and `planEndMasterAlt`, the
  curly apostrophe in "can’t" and the long dash in today's Undo sentence included.
- **The approved lines the cards quote are as approved:** the greyed Plan button's line; "Plan of 149 ended · Kestrel",
  "…: he moved to 150", "…: made a member · Hunter"; the own-bell master admin line with "· Saber" (signed in the built
  app); "Kestrel is 149's last admin. Make another admin of 149 first."
- **Each card opens on when it happens** — who, doing what, at what point, how often — and the frequencies are stated
  as "only when…", none a made-up figure. Each choice has a quoted line or a described screen; each card names its
  recommendation in the top-list line and under "Recommended."
- **Card 13's other choice — the amber note with the bare sentence** — agrees with the prep report's fact (a); every
  refusal on Admin → Users today is that amber note.
- **Card 14 whole**, but for the one sentence above: the three ways are honestly put as two, today's Undo words are
  quoted only to say why they would be untrue, the cost of each answer is said, and "there is always someone to ask"
  agrees with card 13's last-admin note.
- **Card 15's table and its rule for when a line carries a name.** The four lines agree with the words file and with
  the three approved endings' shape.
- **No ruling number, file name, function name or review code** in any card's text. Button names: "presses Save",
  "presses Undo" unquoted is how the pages already put to him write them; left.
- **Across the cards:** Hunter (142's admin, Plan of 149), Kestrel and Osprey (149's two admins), Merlin (149 member),
  Saber (master admin) are the same people doing consistent things on all three, now that card 13 no longer calls
  Kestrel the last admin outright.

## 4. For the host — real choices and facts owed, none decided here

1. **The last-admin note rides on card 13 as a second approval.** It does not depend on the A/B answer, and the card
   now says so and how to ask for other words; but it is still two decisions on one card, against "one decision a
   question". The other way is a short question of its own (it would need a number from the coordinator). My
   recommendation: let it ride as now written — it is one sentence, and card 14 already carries an approval the same
   way.
2. **Card 13 states two things about the row of a man already an admin that no build or drawing shows yet:** the grey
   line does not show there, and "Admin" can be picked back before Save. If the builder means otherwise (say, the line
   shows on every row), that paragraph changes before the card is published. It is not drawn; if it will show in the
   build, a picture of Osprey's row is owed with it (D1625).
3. **The last-admin wording — keep "Only 149's own admins or a master admin can make another."** (as now, one ending
   for the plain and the dated note) **or put "Only Kestrel or a master admin can make another."** for the plain note
   only. Kept as the first review wrote it; named because the plural reads oddly straight after "last admin". The dated
   note's ending changes with it either way — the card does not mention the dated form.
4. **Card 15 carries a second wording choice with no radio** (the master admin line: "made a master admin" or the
   own-bell words) — the first review's point 9, unchanged. He can answer it only in his own words.
5. **Pictures, since none exists yet (not judged here):**
   - card 13's phone picture shows the Role box closed with the line under it, while the card says "Admin is greyed in
     the Role box" — its caption should say the phone opens its own list;
   - card 15's first picture is Saber's bell (a master admin's), while the card speaks of "the bell of 149's admins" —
     its caption should say whose bell it is, or the picture be taken on Kestrel's;
   - card 13's last-admin picture: the card now says it is drawn on; the caption can carry that instead.
6. **Still unmeasured or unchecked, as the first review left them:** "On a phone it should take two lines" (the host's
   marker stays on the card — remove the marker either way before pasting); "Nothing is saved" and "nothing he has
   typed on the row is lost" (true only once built so); "You chose on the section page" — he answered it on section 2's
   mock-up page on 26 Nov, so the phrase is his page, not checked against what that page is called on screen.
7. **`npm run docsize`** is owed for the two briefs written or changed here.
