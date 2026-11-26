# Round 6's two new designs — the second fresh Fable's review of their words (chat 190, 26 Nov 26)

Brief: `2026-11-26-msq-r6-words2-fable-review-brief.md`. Folder `C:\Users\User\projects\Raptor-msq`, branch
`claude/msq-b1-screens-135`. Nothing under `src`, nothing committed or pushed, no branch switched, the served app at
4700 used as it stood (not rebuilt, not stopped). The design skill was loaded (`impeccable`, clarify, Operate mode, its
setup run once). `Questions skipped: a helper has no user to ask` — the skill's "audience and emotional state" question
was answered from the product record (a scheduler at a desk, the owner on his iPhone).

Read first: both designers' reports, both words files, round 6's words and its review, the full rows of D2648, D2650,
D2647, D2641, D2643, D2634, D2628, D2629, D2625, D300, D294, D1462, D2441, and the People & accounts page's lines on
Admin → Users across squadrons.

**In short: two words files changed, one word on screen changed ("To" → "To squadron"), eight pictures re-made and
every one opened. Everything else is kept. Six readings are named for him in §3.**

## 1. Every new word — kept or changed

### The posting sheet (`words-r6-posting.mjs`)
| Key | Words | Verdict | Why |
|---|---|---|---|
| `to` | To → **To squadron** | **Changed** | In round 6 "To" stood on a line of its own. Direction C now puts it beside "PO from" and its date, so the pair reads "from 14 Dec to …" — the end of a date range, most of all before a squadron is chosen. The label now names what the box holds. Fits: at 402 the label takes about 88 of the box's 171px; at 375 the box is about 158px. "Squadron" spelled out, never "Sqn" over a number (D58, D294's reading). |
| `titleOut` | Post out (the sheet's head, after his callsign) | Kept | The app's own name for the act (the ⋯ menu's row, the button). The head still says which man; which day is the first box under it. See reading 1. |
| `titleIn` | Post in (the head — the one new word) | Kept | The same shape as "Post out"; the app's own name. |
| `from`, `fromIn`, `posting` | PO from · PI from · Posting | Kept | The app's own. The new order (Posting first, then PO from) reads in the order a person decides: what happens, then from when, then where to. |
| `overseas`, `del`, `sans`, `transfer` | Overseas Sqn · Delete · SANS · Transfer to Sqn | Kept | His own words (D294, D298). |
| `transferLine` | On 14 Dec: moves to 149 with his sign-in. | Kept | Round 6's, reviewed. One line at 402 (about 210 of 330px); two lines only when the second sentence about a right he holds is added. |
| `postOut`, `postIn` | Post out · Post in (the button) | Kept | The app's own; D300's "a button that reads just Post out". The head and the button now say the same two words — see reading 2. |
| `cancel` | Cancel (Admin → Users' row only) | Kept | Beside "Post out" it can only mean "leave without posting". (The earlier worry was Cancel beside "Undo post out"; not this pair.) |
| `rowPostOut` | Post out… | Kept | Round 6's, reviewed; the dots rightly say a form follows. |

The other lines on the sheet are read off the real app and are not this file's ("On 14 Dec: archived, account
suspended.", Post in's note). Not re-reviewed; one remark in §4.

### Admin → Users' jumps and folds (`words-r6-nav.mjs`)
| Key | Words | Verdict | Why |
|---|---|---|---|
| `jumpPeople`, `jumpOutgoing`, `jumpIncoming` | People · Outgoing · Incoming | Kept | Each is its heading's own word, so the jump and the place it lands read the same. |
| `jumpOther` | From other squadrons (desktop) | Kept | The heading whole. |
| `jumpOtherShort` | Others (phone only) | Kept | Nothing closer to the heading fits 78px: "Other squadrons" needs about 100. "Others" keeps the heading's own word "other". Its weakness is real — see reading 3. |
| the count | "People 60" on a jump, "People · 60" on the heading | Kept | On the desktop the counts stand in their own column at the right, so a dot would be noise. On the phone the count is paler than the word, which does the dot's job, and a dot would cost about 8px a jump when "Outgoing 1" already fills its button. One fact, one number, in both places. |
| `open`, `closed`, `opened` | ▾ Outgoing · 1 · ▸ From other squadrons · 4 · ▾ View only · 2 people | Kept | The app's own fold marks, as on "▸ Archived"; the count stays when shut, so a shut group still says how many. |
| `kestrelHolds` | also views 142 | Kept — **the file changed, not the words** | It was the same words typed a second time. It now reads round 6's own wording from round 6's file, so the two can never drift apart. Nothing on any picture changes. |
| `navName` | On this page (a screen reader only) | Kept | Plain and usual for a list of jumps within one page. |

Checked across both designs and round 6, one wording per fact: "posting out 14 Dec · to 149", "posting in 4 Jan",
"also plans / also views", "From other squadrons", "Post out…", the sheet's line — the same everywhere I looked.
Nothing promises what the app will not do.

## 2. Pictures re-made and opened

`ONLY=A,C node raptor-port/scripts/handpass/n176/draw-r6-posting.mjs` — exit 0; every run closed the real sheet with
nothing posted. Eight pictures re-made (each whole and `-crop`); all eight crops opened one by one:

- `p6-d-C-war`, `p6-p-C-war` — "TO SQUADRON" over the 149 box, one line, clear of "PO FROM".
- `p6-d-C-users`, `p6-p-C-users` — the same inside Cinch's opened row.
- `p6-d-A-war`, `p6-p-A-war`, `p6-d-A-users`, `p6-p-A-users` — the label fits on one line; see §4, point 1.

Not re-run, no word of theirs changed: direction B (it has no "To" label — the squadron sits at the end of the
Transfer row), `-overseas`, `-postin`, today's four, and every `j6-*` picture. Also opened, unchanged, to judge the
words in place: `p6-p-C-postin-crop`, `p6-p-today-postout-crop`, `j6-p-149-crop`, `j6-d-A-149-crop`,
`j6-p-search-crop`, `j6-p-jump-crop`.

No drawing carries a word of its own: the changed label comes from the words file in every picture.

## 3. Readings for him — each one short question, with an example and my recommendation

1. **The sheet's head names the act, not the day.** Today the head reads "Cinch · Mon 14 Dec"; drawn, it reads
   "Cinch · Post out", and the day is the "PO from" box just under it. His ruling of 28 Oct made the day in such a
   head bigger and brighter (D1462) — so this takes away something he asked to see better. *Example: he taps Cinch on
   Mon 14 Dec, then ⋯, then Post out; the head no longer says 14 Dec.* Recommended: the act in the head — the day is
   the sheet's first box, filled in, and can be changed there, so a day in the head would go stale the moment he
   changes it.
2. **"Post out" is written twice on one sheet** — in the head and on the button. He ruled the sheet "says each thing
   once" (D300). *Example: "Cinch · Post out" at the top, the cyan "Post out" at the foot.* Recommended: keep both —
   the head says what the sheet is, the button does it; neither can go without the sheet losing its name or its
   action. On Admin → Users the form sits inside the man's row and has no head, so there it is said once.
3. **On a phone the fourth jump reads "Others".** The heading it jumps to reads "From other squadrons", which does not
   fit four across. *Example: Kestrel on 149 sees "People 10 · Outgoing 1 · Incoming 1 · Others 4".* The risk: under
   "From other squadrons" sit the folded squadrons ("142 · 60 people"), which are also "others", and "Others 4" does
   not count them. Recommended: keep "Others" — it carries the heading's own word, and the tap lands on the full
   heading, which explains it. If he trips on it, the next best is a row that slides sideways with the words whole.
4. **The new label "To squadron"** (my change, from round 6's "To"). *Example: "PO from — Mon 14 Dec 26" and beside
   it "To squadron — 149".* Recommended: "To squadron". It should then be the label on every sheet that sends a man
   to a squadron (round 6's Admin sheet and the "It's him" sheet still say "To" — §4, point 2).
5. **"PO from" on Admin → Users.** That page spells its own label out ("Post in", on the Add a person form); the
   Leave War says "PO from" and "PI from". Drawn, the Leave War's short form comes to Admin → Users. *Example: an
   admin who never opens the Leave War meets "PO FROM" for the first time in Cinch's row.* Recommended: keep "PO from"
   on both — he asked for one design for both doors (D2648), and the button under it says "Post out" in full.
6. **A jump writes its count without the heading's dot** ("People 60"; the heading "People · 60"). Recommended: as
   drawn. A small point; the host may fold it into the picture's caption rather than ask it.

## 4. Found, not fixed — and why

1. **Direction A's label column is too narrow for "To squadron".** A keeps today's labels in a 78px column at the
   left; the new label is about 12px wider, so its 149 box starts a little right of the two boxes above it (seen on
   all four A pictures). It is a drawing matter, not a word, and A is not the recommended direction. If he picks A,
   the column is widened or A's label goes over its box.
2. **Round 6's two earlier sheets still say "To"** (`u6-d-postout-sheet` from `words-r6-users.mjs`, and
   `m6-d-itshim-sheet` from `words-r6-misc.mjs`). I may edit only the two files of this brief. The posting designer's
   report already says both are redrawn to the chosen design; the label should follow then. Until then the page shows
   "To" on those two pictures and "To squadron" on the new ones — worth one line in their captions.
3. **The phone's four jumps are at their limit.** "Outgoing 1" nearly fills its 78px button at 402. At 375 each is
   about 71px, and at any width a two-figure count ("Outgoing 12") does not fit. The words cannot fix this; the build
   needs a rule (tighter side padding, or the row sliding) and a drawing at 375 with a two-figure count before it is
   called done. The designer's report names the 375 case as not drawn.
4. **A screen reader should hear the heading's full words** for the phone's fourth jump ("From other squadrons, 4"),
   not "Others 4". A note for the build; nothing drawn changes.
5. **The lit jump sits right under "Filter" on the phone and wears the filter chip's "on" look**, so "People 10" lit
   can read as "showing only People". The designer raised this against direction B's desktop; it is as true of the
   phone in direction A. A design choice, not a word — said here, not redrawn.
6. **While searching, the lit jump keeps the whole count** ("Others 4" lit over one row, Bolt). The designer's report
   gives the reason (the page keeps whole counts today) and lists it; it stands out more on the phone.
7. **The app's own Post in note says "Their first day in the squadron"**, while the transfer line says "his sign-in".
   The note is the app's own text today, outside this job's new words; left. One for the whole-app words pass.
8. **Both designers' reports still list "To"** in their word tables. I did not edit another helper's report; this
   file is the record of the change.
9. Not re-reviewed: round 6's own words (already reviewed), the words read off the real app, the pictures of
   directions A and B beyond their re-made crops.

## 5. Files touched
- `raptor-port/scripts/handpass/n176/words-r6-posting.mjs` — `to`, with a note of why.
- `raptor-port/scripts/handpass/n176/words-r6-nav.mjs` — `kestrelHolds` reads round 6's wording; one import line.
- The eight re-made pictures and their crops in `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/` (§2).
- This report. Run log: `raptor-port/.tmp/words2-posting.log`.
