# Section 2's three questions — a fresh Fable's review of the words (D2441; chat 199, 26 Nov 26)

Reviewed: `2026-11-26-msq-s2-questions-draft.md` and `raptor-port/scripts/handpass/n199/words-s2q.mjs` (Opus drafts).
Read-only: no words file, drawing script, plan or app file was edited; nothing built, run or committed. This file is
the only thing written — **the host applies section 1's "Final" column to `words-s2q.mjs`, re-points the drawing
scripts, and pastes section 2's cards.** `npm run docsize` was not run (the brief: no runs).

Read: the writing guide (`design-practices.md` head, §0, §1, §1a, §1b, §9); the last words review's §2, §5, §6; the
questions brief and draft; `n199/words-s2q.mjs`, `draw-s2q-b.mjs`, `draw-s2q-c.mjs`; `n191/words-s2.mjs`,
`n176/words.mjs`; the plan's §21.2 step-0 block (Q8, Q11, "Still held" 1–3); the full rows of D2730, D2626, D2396,
D2319, D2311, D2310, D2247, D2336, D2241, D2439, D2739. **Read in the code, to check what the drafts state as fact:**
`undo/timeline.ts` (`OUT_OF_BAND`, `outOfBandWords`, `sayBlocked`), `state/undo-wire.ts masterRightRefusal`,
`state/notices.ts acctWords` and `PO_DID`, `state/acctlines.ts` (`accessParts`, `acctByApp`, `tellAccess`),
`state/accounts.ts lockWords`, `ui/UserAccess.tsx RoleBox`, `ui/UsersPanel.tsx` (`RoleSelect`, `done`, the button
names), `ui/toast.ts` (the `warn` and `blocked` faces), the U0 report's "three ways" section.

**In short: 8 drafted app wordings read. 4 kept, 2 adjusted, 1 dropped, 1 found untrue for its case (B's — a new
sentence drafted in its place, his to approve); and 1 more owed that the draft never wrote (the last-admin line Q8 makes untrue). The
three cards are rewritten in full. No picture exists yet for any of the three, so none can go to him until drawn.**

## 1. The app's words

| Draft | Final | Reason |
|---|---|---|
| **A, the reason under the Role box:** Only 149's own admins or a master admin can make an admin of 149. | **Kept** | Every fact is there (who can; it is not his). It is the approved Plan reason with only its act changed ("…can give or end Plan of 149."), so the two read as one family. "Make an admin of 149" is the app's own verb: the bell's "Made an admin of 149", the lock's "Make another admin of 149 first." No one role covers the two it names (an admin with Plan of 149 is the one it shuts out), so lesson 98's "one role named once" does not apply — as D2626's line already shows. 65 letters against the approved line's 68: two lines on a phone expected, **not measured** (nothing is drawn). |
| **A, the alternative:** Only 149's own admins or a master admin can make him an admin. | **Dropped — not put to him** | Two near-identical sentences are not a choice worth his time. "Him" names nobody on "+ Add a person" and on "Give access" before a person is picked, and the sentence must serve all four places a role is picked; it also drops whose admin. One wording, the one above. |
| **A, the other choice's refusal:** Blocked: only 149's own admins or a master admin can make an admin of 149. | **Kept as words; its look is not settled — section 3, point 3** | The same sentence behind the guard rail's lead, small letter after the colon as "Blocked: save or cancel the new person, then pick 149." has. But a refused Save on Admin → Users today is the **amber** passing note with the bare sentence and no "Blocked:" (the last-admin refusal: `UsersPanel.tsx done` → `toast(bad, 'warn')`). If the builder keeps the page's own look, the words are the bare sentence, exactly the line of the row above. |
| Member · Admin · Master admin (the Role box) | **Not read** | His ruled choices (D2302, D2305). |
| **B, today's Undo sentence:** Something else changed this after your action — it can’t be undone now. | **Not true for this case. Not changed (it is the app's sentence for its own cases); a new sentence is drafted in the row below.** | Read in `undo/timeline.ts`: the sentence is raised where a change made outside his line of steps blocks the Undo and nothing names who made it. Here nothing changed after Hunter's Save — not Osprey's row, not Hunter's rights. The Undo is refused by a standing rule about who Hunter is. So "Something else changed this after your action" states a thing that did not happen; only "it can’t be undone" is true. It is not the case he ruled on either: Q11's "today's words, naming nobody" was for a man who **has since lost the right** — there something did change after his action. The draft's "You ruled these words should stay" stretches that answer to a case he was not asked about. |
| *(no draft)* **B, the honest sentence** | **Only 149's own admins or a master admin can make an admin of 149, so this can’t be undone.** — **new words, his to approve** | A's sentence whole, then the Undo family's own ending ("…can’t be undone"), joined by "so": the link is true and read from the code's rule, not guessed (the Undo is refused *because* it would make an admin). "Now" is left off: this never passes later. No dash. It shows where every refused Undo shows today, the amber passing note at the screen's foot. Where older steps wait, the app adds its own "Press Undo again for: <step>." after it (`sayBlocked`), as after every Undo it passes over for good. About 90 letters: three lines on a phone likely, **not measured**. Using it means one new key in `words-s2q.mjs` and `draw-s2q-b.mjs` drawing it, not `undoRefused`. Owed §1a test 9's cold read (it carries a reason). |
| **C, archived:** Plan of 149 ended: archived · Hunter | **Kept** | His own bell's ruled words for the same event ("Plan of 149 ended: archived") with the signer the admins' family carries ("…: made a member · Hunter"). |
| **C, overseas posting:** Plan of 149 ended: posted overseas | **Plan of 149 ended: posted out overseas** | One name for one thing: the act is "Post out" everywhere a person meets it — the button, the row's "posting out 4 Jan · Overseas Sqn", the bell's "Posted out · archived, account suspended". "Posted overseas" is a second name for it. One word longer than the draft. Kept apart from "archived" on purpose: it tells 149's admins he is away with another squadron and may be back, which "archived" does not. No name where the posting ran by itself on its date; "· Hunter" where the Post out press ran it at once — the family's rule (who pressed, nobody where the app did it). |
| **C, deleted:** Plan of 149 ended: deleted · Hunter | **Kept** | The family's shape; "deleted" is the app's word (the bell's "Posted out · deleted", the Delete button). No name where a Delete posting ran on its date. |
| **C, made a master admin:** Plan of 149 ended: master admin covers every squadron · Saber | **Plan of 149 ended: made a master admin · Saber** — the draft stays as the other wording, his to pick (section 3, point 9) | The draft borrows the line ruled for the man's **own** bell, where it sits under "Made a master admin: full access to every squadron" and so needs no more. On Kestrel's bell it stands alone and never says the one thing that happened: Hunter was made a master admin. Read cold it can even be taken to mean Saber, the master admin who signed it, now covers 149. The final is the exact pair of the approved "Plan of 149 ended: made a member · Hunter" — on the admins' bell the reason is the act, said in the Role box's own words. 15 letters shorter, so likelier one line on a phone (not measured). What it leaves to the reader: that a master admin has full access to 149 — which every admin reads on the roles table and in the Role box. |
| *(no draft)* **The last-admin line for one who cannot make an admin** (his D2246): "Kestrel is 149's last admin. Only a master admin or an admin of 149 can make another." | **Kestrel is 149's last admin. Only 149's own admins or a master admin can make another.** — **owed, a ruled wording that Q8 makes untrue; his to approve** | Under Q8 Hunter is "an admin of 149" in that sentence's sense and yet can no longer make one, so the built tail would send him to himself. The plan's "Still held" 1 names it ("today's nearest words say the opposite"); the draft's question A never puts it to him. Same family as A's line. |

## 2. The three cards, final

Plain words only: no file names, ruling numbers or builder's nouns. "A planner" is not a word the screen uses (it says
"Plan", "Plans 149", "also plans 149"), so the cards say "an admin with Plan of 149". The made-up frequencies ("a few
times a month at most", "a few times a year") are gone — nobody measured them. The reply values use the plan's
numbers for these questions (10, 11, 12); the host changes them if the page numbers differently.

### Card A (question 10)

**Title:** Where an admin with Plan of 149 can no longer make an admin of 149
**Top-list line:** Recommended: "Admin" is greyed in the Role box, with one line under it saying who can.

**When it happens.** Hunter is 142's admin and has Plan of 149. With 149 picked he is on Admin → Users and opens
Merlin, a 149 member, to change his sign-in or his role. Not often: only when an admin from another squadron who has
Plan of 149 opens the row of one of 149's people.

**What happens now.** The Role box offers Member, Admin and Master admin. "Master admin" is greyed for Hunter.
"Admin" is not: he can pick it and press Save, and Merlin becomes an admin of 149. You chose on the section page that
only 149's own admins or a master admin can do that, so the app has to stop him. This question is how he is told.

**Recommended.** "Admin" is greyed in the Role box, as "Master admin" already is, and one grey line under the box
says who can:

> Only 149's own admins or a master admin can make an admin of 149.

Hunter sees it is not his to do before he presses anything, and nothing he has typed on the row is lost. The line
follows the one you approved under the greyed Plan button ("Only 149's own admins or a master admin can give or end
Plan of 149."). On a phone it should take two lines, as that one does.

The same greyed "Admin" and the same line would show in the three other places a role is picked: "+ Add a person",
"Give access" on a waiting request, and "Give sign-in" on a man with no sign-in. Those three are not drawn.

**The other choice.** "Admin" stays pickable and the row looks as it does today, with no extra line on it. When
Hunter presses Save the app refuses and says why in a note at the foot of the screen:

> Blocked: only 149's own admins or a master admin can make an admin of 149.

Nothing is saved. He learns the rule only after picking "Admin" and pressing Save.

**Radio labels and reply values**
- "Grey it, with the reason" → `10: Admin greyed, reason under the Role box (recommended)`
- "Leave it, refuse the Save" → `10: Admin stays pickable, Save refused with a note`

### Card B (question 11)

**Title:** Undo, after an admin with Plan of 149 makes a 149 admin a member
**Top-list line:** Recommended: his Undo is refused, with a sentence saying who can make the man an admin again.

**When it happens.** Hunter is 142's admin and has Plan of 149. On 149's Admin → Users he opens Osprey, one of 149's
two admins, sets his Role to Member and presses Save. He is allowed to. Then he presses Undo, for example because he
opened the wrong man. Rare: only when an admin with Plan of another squadron makes one of its admins a member and
then changes his mind.

**What happens now.** The Undo goes through and Osprey is an admin of 149 again. But you chose that only 149's own
admins or a master admin make an admin of 149, and this Undo is Hunter making one.

**Recommended.** The Undo is refused, and the note at the foot of the screen says why:

> Only 149's own admins or a master admin can make an admin of 149, so this can’t be undone.

One rule everywhere, Undo included. What it costs: Osprey stays a member until Kestrel (149's admin) or Saber (a
master admin) makes him an admin again, and Hunter has to ask one of them. There is always someone to ask, because
the app never lets the last of 149's own admins be made a member. Nothing warns Hunter before he saves. He finds out
when he presses Undo.

This sentence is new, so picking this answer approves it. The app's usual words for an Undo that cannot go through
are "Something else changed this after your action — it can’t be undone now." They would not be true here: nothing
else changed.

**The other choice.** Hunter's Undo of his own step goes through, as today. The man who made the slip puts it right
himself, at once, and no new words are needed. What it costs: Undo then does what his Save cannot. It stays one way
an admin with Plan of 149 makes an admin of 149. It can only put back an admin he himself has just made a member,
and only until he signs out, when his Undo list empties.

**Radio labels and reply values**
- "Refuse it, say why" → `11: Undo refused, with the new sentence (recommended)`
- "Let his Undo through" → `11: his own Undo goes through`

### Card C (question 12)

**Title:** Telling 149's admins when someone's Plan of 149 ends another way
**Top-list line:** Recommended: one bell line each for archived, posted out overseas, deleted and made a master admin.

**When it happens.** Cobra, Blade, Basher and Hunter are 142 admins who each have Plan of 149. A Plan of 149 can end
with nobody at 149 pressing anything: a 142 admin archives the man, his posting out to an overseas squadron runs, he
is deleted, or a master admin makes him a master admin. Rare.

**What happens now.** His Plan of 149 ends and 149's admins are told nothing. They find out only when one of them
next looks at Admin → Users. You have approved bell lines for three other endings ("Plan of 149 ended · Kestrel",
"Plan of 149 ended: he moved to 150", "Plan of 149 ended: made a member · Hunter"). These four have none.

**Recommended.** 149's admins get one bell line for each, in the shape you approved: what ended, why, then who did
it. Each stands under the man's name, as every bell line does.

| What happened | The line on the bell of 149's admins |
|---|---|
| Hunter archives Cobra | Plan of 149 ended: archived · Hunter |
| Blade's overseas posting runs on its date | Plan of 149 ended: posted out overseas |
| Hunter deletes Basher | Plan of 149 ended: deleted · Hunter |
| Saber makes Hunter a master admin | Plan of 149 ended: made a master admin · Saber |

A line carries no name where the app did it by itself on a posting's date. A posting dated today or earlier runs at
the Post out press, so its line carries the name of whoever pressed. Hunter loses nothing as a master admin, who has
full access to every squadron; his line tells 149's admins why he no longer shows as holding Plan. That line could
instead reuse the words on Hunter's own bell, "Plan of 149 ended: master admin covers every squadron · Saber". It is
longer and does not say he was made one.

**The other choice.** No bell line for these four, as today. 149's admins' bells stay quieter, and the change still
shows on Admin → Users the next time one of them looks. But nothing tells them that someone who could change
everything on 149 no longer can, or why.

**Radio labels and reply values**
- "Tell 149's admins" → `12: four bell lines as drawn (recommended)`
- "No line, as today" → `12: no bell line for these four`

## 3. Facts not checked, and choices not put to him

**For the host, before any card is published**

1. **No picture exists for A, B or C.** The scripts were never run (the checks lock was held). Anything on screen put
   to him comes with marked pictures of the real app (D853, D2739), so the cards wait for the drawing run. The phone
   line counts for A's line, B's sentence and C's lines are all unmeasured; the cards say "should take two lines"
   for A only, and that sentence is corrected or dropped once measured.
2. **B's picture would contradict B's card.** `draw-s2q-b.mjs` draws today's sentence. If the recommended answer
   stands, it must draw the new one. C's script draws "posted overseas" and "master admin covers every squadron";
   both change with section 1. C's card uses the script's own names (Cobra, Blade, Basher) so words and pictures
   agree; they are drawn, not in the test world, and are not on the section page's cast.
3. **A's other choice — which note?** The draft and the card call it the grey "Blocked:" note. A refused Save on
   Admin → Users today is the amber passing note, bare sentence, no "Blocked:" (the last-admin refusal). Either is
   defensible; the picture and the words must match whichever the builder means. Builder's call, not his.
4. **A — a row whose man is already an admin (Osprey).** Nothing says what Hunter sees there. If "Admin" is greyed on
   that row too, then after picking Member he cannot pick Admin back before saving and must Cancel; and the reason
   line under an admin's row would refuse nothing. The honest build greys "Admin" only where picking it would make
   someone an admin. Builder's fact, to be drawn in U2b if it shows.
5. **A's "Nothing is saved" and "nothing he has typed is lost"** are the draft's statements, not checked: no code
   exists for either yet. Each must be true of the build, or its sentence leaves the card.
6. **"He is allowed to" (B) and "there is always someone to ask" (B)** rest on D2250 and D2247, read in their rows,
   not pressed in the app. "The Undo goes through today" is the U0 report's pinned fact (way iii).

**Choices the drafts settled without him — each now said on its card, or named here**

7. **B: three ways, not two.** Refused with the new sentence; refused in today's words (as he answered the
   neighbouring Q11); let through. The card recommends the first, says in plain words that today's sentence would
   be untrue here, and gives no radio for it: an untrue sentence is not offered as an equal. If the host thinks he
   should be able to tap it, it is a third radio — "Refuse it, today's words" → `11: Undo refused, in today's Undo
   words`.
8. **B: nothing warns before the Save.** The recommended answer makes "made a member" the one step on that row
   Hunter cannot take back, and he learns it only at Undo. Said on the card. A warning before Save was not drafted
   and is not proposed here; if he asks, it is a new drawing.
9. **C: the master admin line has two wordings.** The card recommends "made a master admin" and names the ruled
   own-bell words as the other in one sentence. The draft's further sub-choice — no line at all for this one
   ending, since he loses nothing — is left off the card to keep it one decision; he can still say "three, not
   four".
10. **C: three places the admins' bell will differ from the man's own bell for the same event**, each on purpose and
    none changing his ruled lines: (a) his own "Plan of 149 ended: archived" carries no name even when a person
    archived him (the app treats the ended right as its own doing); the admins' line is signed. (b) For an overseas
    posting his own bell says "archived"; the admins' says "posted out overseas". (c) The master admin wording,
    point 9.
11. **A: the alternative wording was dropped**, and the last-admin line Q8 makes untrue was never drafted (section
    1's last row). The second is his ruled wording changing, so it needs his yes: it can ride on card A as one more
    quoted line ("the last-admin note would read …") or go as its own short question. Unanswered, U2b ships a
    sentence that tells Hunter he can do what the app refuses.

**Knock-on effects seen while reading, not worked through**

12. **B, when the man made a member also held Plan of a third squadron (150).** Making him a member ends that Plan
    too (D2250). Under the recommended answer a slip then costs Osprey his Plan of 150 as well, given back only by
    150's own admins or a master admin. Under the other choice Hunter's Undo would also be putting Plan of 150 back,
    which he may not give (D2626 covers an Undo that puts Plan back) — so that Undo may be refused anyway, or go
    half through. Neither card says so. To be read in the code before U2b.
13. **C: a tap on any of the four lines.** By his Q4 answer a line about a man with no row on 149's page (archived,
    deleted) opens nothing and stays as the record. Hunter's master admin line would open his row under "From other
    squadrons". Not on the card; consistent with what he approved.
14. **The roles table's note** ("…Plan of a squadron is given by its own admins or a master admin.") and the table's
    column for an admin with Plan may now need to say who makes admins. Not read here.

**Owed after this review**

- §1a test 9's cold read, by a reader who has seen neither the drafts nor this file, for the three wordings that
  carry a reason: A's line, B's new sentence, the reworded last-admin line.
- This reader did not see any picture, so nothing here judges the look, the ring or the crop of a drawing.
