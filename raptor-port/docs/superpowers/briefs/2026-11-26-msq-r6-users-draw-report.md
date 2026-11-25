# Round 6 — Admin → Users across squadrons, drawn on the real app: the drawer's report (a fresh Fable; chat 188, 26 Nov 26)

Brief: `2026-11-26-msq-r6-users-draw-brief.md`. Nothing under `src`, nothing committed, no branch switched.

## How it was made
- **Server:** `http://localhost:4700/` — checked first: its page names `assets/index-7OsqMtMA.js`, which is in this
  folder's `raptor-port/dist/assets/`. Used as it stood; nothing started, stopped or rebuilt.
- **Scripts (mine):** `raptor-port/scripts/handpass/n176/draw-r6-users.mjs` and `words-r6-users.mjs`. Re-run:
  `node raptor-port/scripts/handpass/n176/draw-r6-users.mjs` (`ONLY=users,folded,edit,postout,askpost,bell,both`;
  `FRESH=1` remakes the set-up). A words change is an edit of `words-r6-users.mjs` and a re-run.
- **The world:** round 5's (`state-r5b.json`) plus one press by Saber on 142's page — Cinch given the sign-in "cinch"
  (Member) — saved as `raptor-port/.tmp/n176-draw/r6-users-state.json`. Cinch had no sign-in; without one his opened row
  has no Suspend and his row on 149's page has no live access line, so neither picture 5 nor 6 could be the brief's.
- **Drawn, not in the world** (the app cannot do them yet): Cinch's posting to 149 on 14 Dec, Raven's to 150 on 4 Jan,
  Mako's View of 149. Real: Hunter's Plan of 149, Bolt's View of 149, Saber a master admin.
- **Parts:** every heading is the page's own heading cloned (measured the same as "People · 10": 10.5px, weight 800,
  capitals); every row a row of the page's own list cloned; the folds are "▸ Archived" cloned; the amber tag is the
  app's own posting tag; every button the page's own plain button (28px high beside Save's and Suspend's 28px, one
  line); the sheet is the Leave War's real sheet for Cinch, copied with its look.
- **Violet dashed rings** (2px `#8B5CF6`, 4px clear) mark what is new since round 5. Nothing else is violet; no pink.
- Pictures in `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`, each whole plus `-crop`, desktop 1536 wide,
  phone 402×874, both at scale 2. I opened every one.

## The pictures

**1. `u6-d-users`, `u6-p-users` (+`-crop`)** — Kestrel, 149's admin, on Admin → Users.
- Under "Waiting for access", three new groups, then the page as round 5 had it: "From other squadrons · 4" (Hunter,
  Saber, the fold "▸ View only · 2 people"); "Incoming · 1" (Cinch); "Outgoing · 1" (Raven); then "People · 10" with
  the search, Filter and round 5's "+ Add a person"; 149's ten people; "▸ 142 · 60 people", "▸ 150 · 3 people".
- Violet: the three groups, and the amber tag on Raven's own row in the list.
- Hunter is no longer among 149's own people (round 5 had him there); he is in the block.
- FACT (desktop): `From other squadrons · 4` / `Hunter 142 — Pilot · CAT IP · admin · also plans 149` /
  `Saber 142 — Pilot · CAT IP · master admin, full access` / `▸ View only · 2 people` / `Incoming · 1` /
  `Cinch 142 — Pilot · CAT IP [POSTING IN 14 DEC]` / `Outgoing · 1` / `Raven — WSO · CAT B [POSTING OUT 4 JAN · TO 150]`
  / `PEOPLE · 10` / own rows Condor, Falcon, Gannet, Harrier, Heron, Kestrel, Merlin, Osprey, Raven, Shrike / Raven's
  row `no sign-in · WSO · CAT B [POSTING OUT 4 JAN · TO 150]` / `▸ 142 · 60 people`, `▸ 150 · 3 people`. Top bar: 149.
- FACT (phone): the same words; each new row 46–47px high, as the page's own (46px); the search box starts 538px down
  the first screen (874 high), so it is still in sight without scrolling. On the phone Raven's tag in the list drops to
  a line of its own under "no sign-in · WSO · CAT B" (the app's tag does this today on a narrow row).

**2. The role in words** — shown on pictures 1 and 3: an admin adds "admin", a master admin "master admin, full
access", a member and a man with no sign-in add nothing.

**3. `u6-d-folded`, `u6-p-folded` (+`-crop`)** — Kestrel has opened "▾ 142 · 60 people".
- Sixty short rows, none with the grey "142". Violet: "admin" on Blade's row. (The missing grey number cannot be
  ringed; the caption has to say it.)
- FACT: 60 rows; grey numbers on the rows inside the group: 0; first rows `Anvil — Pilot · CAT IP`, `Basher — WSO ·
  CAT IW`, `Blade — Pilot · CAT IP · admin`, `Bolt — Pilot · CAT C · also views 149`, `Cinch — Pilot · CAT IP`; further
  down (not in the cut) `Hunter — Pilot · CAT IP · admin · also plans 149`, `Saber — Pilot · CAT IP · master admin,
  full access`.

**4. `u6-d-edit`, `u6-p-edit` (+`-crop`)** — e8j redrawn, because e8j carries the grey "142" on every row of the
opened group and picture 3 now has none. Saber, 149 picked, Ranger's short row opened: his 149 line (None lit, View,
Plan greyed, "Plan is for admins only."), Save, Cancel, and "Edit on 142 →" at the right.
- No violet: nothing on it is new but the missing grey numbers.
- **`u6-d-edit-after` not drawn: e8j2 stands**, with one difference — the row it lands on would now also carry
  "Post out…", which picture 5 shows on Cinch's row.
- FACT: `Ranger — Pilot · CAT IP / 149 None View Plan[greyed] / Plan is for admins only. / Save · Cancel · Edit on
  142 →`; top bar 149; the phone picture shows `Saber — Pilot · CAT IP · master admin, full access` lower in the group.

**5. `u6-d-postout`, `u6-d-postout-sheet` (+`-crop`)** — Hunter on 142's page, Cinch's real row opened by a press.
- `u6-d-postout`: "Post out…" stands between Save and Suspend. Violet round it.
  FACT: the line read `Save · Suspend · Archive · Delete · Cancel` before, `Save · Post out… · Suspend · Archive ·
  Delete · Cancel` after; "Post out…" and Suspend both 28px high on one line.
- `u6-d-postout-sheet`: the sheet it opens, hung under the button. It is the posting part of the Leave War's own sheet,
  read off Cinch's real sheet on 142's war (Mon 14 Dec pressed, ⋯, Post out) and closed again with nothing posted.
  Violet round the whole sheet (it is new on this page).
  FACT (the real sheet today): `PO FROM Mon 14 Dec 26 ▾ / POSTING ✓ Overseas Sqn · Delete · SANS · Transfer to Sqn
  [greyed, hover "Comes with the shared database"] / On 14 Dec: archived, account suspended. / Post out`.
  FACT (drawn): `Cinch  Post out  ✕ / PO FROM Mon 14 Dec 26 ▾ / POSTING Overseas Sqn · Delete · SANS · ✓ Transfer to
  Sqn / TO 149 ▾ / On 14 Dec: moves to 149 with his sign-in. His View and Plan of other squadrons end. / Post out`.
- Changed from the real sheet: the leave parts taken out (day line, remarks, document, portion, the leaves,
  Auto-approve); the head's date replaced by "Post out"; Transfer to Sqn live and chosen; the new "To" line, made from
  the "PO from" line with the squadron in the date box's look.
- 142's page here also shows the empty block: `From other squadrons` / `Nobody from another squadron plans or views 142.`

**6. `u6-d-askpost`, `u6-d-askpost-bell` (+`-crop`)** — **new, needs his word.**
- `u6-d-askpost`: Kestrel on 149's page, "▾ 142 · 60 people" open, Cinch's short row opened: his 149 line, Save,
  Cancel, and at the right of that line the plain button "Ask 142 to post him here". Violet round it. No Incoming line
  for Cinch on this picture: nobody has posted him yet.
  FACT: `Cinch — Pilot · CAT IP / 149 None View Plan[greyed] / Plan is for admins only. / Save · Cancel · Ask 142 to
  post him here`; all three buttons 28px high on one line.
- `u6-d-askpost-bell`: Hunter's bell (a 142 admin). Violet round the new line.
  FACT: `142 | Cinch  Thu 26 Nov | 149 asks you to post him there · Kestrel | now`, above his two real lines
  (`Given View of 150 · Saber`, `Given Plan of 149: full access to 149 · Saber`). The line is a real line of his bell
  cloned; the number sits first in round 5's column.
- Not drawn: what Kestrel sees while he waits, and what the bell line opens when pressed (my proposal said: Cinch's
  row on 142, ready for "Post out…").

**7. `u6-d-both-pages` (one picture), made of `u6-d-both-pages-142` and `u6-d-both-pages-149` (+`-crop` each)**
- 142's page, Hunter: `From other squadrons` / `Nobody from another squadron plans or views 142.` / `Outgoing · 1` /
  Cinch's row **opened**: `Cinch — Pilot · CAT IP [POSTING OUT 14 DEC · TO 149]` / `Undo post out · Cancel` / then
  `PEOPLE · 60` and, in the list, `Cinch — cinch · Pilot · CAT IP [POSTING OUT 14 DEC · TO 149] MEMBER`. Violet: the
  Outgoing group and the tag on his own row.
- 149's page, Kestrel: the block as picture 1; `Incoming · 1` / `Cinch 142 — Pilot · CAT IP [POSTING IN 14 DEC]`
  (violet); `Outgoing · 1` Raven.
- The one picture stacks the two cuts under two plain captions, "142's page · Hunter, its admin" and "149's page ·
  Kestrel, its admin" — the picture's words, not the app's.

## Where I departed from my own proposal, and why
1. **"Undo post out" is inside the opened row, not on the row's face.** On the row's face it was a live button on a
   list that scrolls under a thumb — the fault round 5 found with live buttons on sixty rows. Tried first on the face:
   the button wrapped to three lines on a desktop and had no room at all on a phone. Now an Outgoing row opens as every
   row on this page opens, to "Undo post out" and "Cancel". Picture 7 shows it opened; picture 1 shows it closed.
2. **"also plans 149" / "also views 149", not "plans 149" / "views 149".** These are the app's own words on a row
   today and round 5's; with the role now in words, "admin · plans 149" could be read as one thing. One wording in the
   block, under a heading and in a search.
3. **The posting reads as the app's own amber tag**, not a sentence: "posting in 14 Dec", "posting out 4 Jan · to 150"
   in place of "joins 149 on 14 Dec", "leaves for 150 on 4 Jan". The app already says "posting out 14 Oct · Overseas
   Sqn" this way on a row and on the Leave War; the grey number and the group's heading say the rest. One fact, one
   wording, on the group's row and on his own row.
4. **Hunter is listed inside "▾ 142 · 60 people" too.** Round 5 left him out only because he sat in 149's own list.
   The heading says 60, so the group shows 60; the block is the short answer, the group the whole squadron.
5. **"Ask 142 to post him here" sits at the right of the Save · Cancel line**, where "Edit on 142 →" sits for someone
   who is an admin of 142. One place for "the way across": the link if you may do it yourself, the ask if you may not;
   never both. The proposal had it on a line of its own.
6. **"Post out…" goes on the row's one line of buttons**, after Save and before Suspend, not on a second line: the
   real row has one line.
7. **The block stays above "People"**, as proposed. I weighed moving the search above it and kept the proposal: the
   page already puts "Waiting for access" above "People", so this is the page's own order, and on a phone the search
   is still on the first screen (538px down).

## Against his rulings — readings he has not ruled
- **Incoming and Outgoing (D2643)** are drawn with squadron-to-squadron moves only. My reading, not drawn: a posting
  out overseas, to SANS or to Delete would also list under Outgoing with the app's tag as it reads today, and a
  restore dated ahead under Incoming. His to say.
- **A master admin's row in the block** ("master admin, full access") adds to D2625's short row. Proposed before,
  still not ruled.
- **"His home squadron first, then the rest by number"** cannot be shown in this world: for Kestrel on 149 the others
  are 142 and 150 either way, and nobody whose home is 150 holds a right elsewhere. The rule is unshown, not broken.
- **The "All squadrons" tick gone (E8):** nothing to draw — it lives inside Filter, which stays closed on every picture.
- **The sheet's line** says only what D2243 supports (his View and Plan end) and "with his sign-in". It leaves out
  inputs, leave and OIL on purpose: D2265 treats leave at a move in a way one line cannot promise.
- **The ask (picture 6)** is new and needs his word.

## Every new word (for the second fresh Fable, D2441) — all in `words-r6-users.mjs`
| Key | Words | Where |
|---|---|---|
| fromOther | From other squadrons · 4 | the block's heading |
| nobodyOutside | Nobody from another squadron plans or views 142. | the empty block |
| viewOnly | ▸ View only · 2 people (· 1 person) | the fold in the block |
| roleAdmin | admin | a short row, after seat and CAT |
| roleMaster | master admin, full access | a short row |
| incoming / outgoing | Incoming · 1 / Outgoing · 1 | headings |
| postingOutTo | posting out 4 Jan · to 150 | the amber tag; "to 150" is the new part |
| undoPostOut | Undo post out | an Outgoing row, opened (the war's reads "Undo post out (PO)") |
| postOutBtn | Post out… | a man's own opened row |
| sheetTitle | Post out | the sheet's head, after the callsign |
| sheetTo | To | the sheet's new line |
| transferLine | On 14 Dec: moves to 149 with his sign-in. His View and Plan of other squadrons end. | the sheet |
| askPost | Ask 142 to post him here | another squadron's man, opened |
| askBell | 149 asks you to post him there | the bell line, then "· Kestrel" |
| capPage | 142's page · Hunter, its admin | caption on picture 7 only |

Reused, not new: "also plans 149" and "posting in 14 Dec" (the app's), "also views 149", "▸ 142 · 60 people",
"Edit on 142 →", "+ Add a person" (round 5), "Cancel".

## What I could not draw, and small faults in the pictures
- The sheet's head shows two thin rules close together under "Cinch  Post out": the copied head's own rule and the
  first line's. A build would have one.
- The sheet's "Post out" button looks hatched: that is the real button's look on the war today, copied.
- On the phone, the violet ring round Raven's tag in the list touches the line above it (the tag wrapped).
- No phone picture of pictures 5, 6 or 7 (the brief asked for desktop). "Ask 142 to post him here" beside Save and
  Cancel will not fit one line at 402 wide; it needs its phone drawing before a build.
- Not drawn: "▸ View only" opened; a block row opened to end someone's access; the block for a Plan holder or a
  master admin looking; the day a posting lands.

## After the words review
(The second fresh Fable's report: `2026-11-26-msq-r6-fable-review-report.md`. Its words in `words-r6-users.mjs` are kept;
the FACT lines above quote my first words where it changed them — the pictures now carry its words.)
- **`u6-d-askpost-bell` redrawn (D2638).** Hunter's bell shows two squadrons (Show: 142 on, 149 on), so the new line's
  number wears its squadron's colour and the two Show buttons wear theirs — round 5's sample colours, 142 orange,
  149 gold — made the same way as `m6-d-itshim-bell`. The unread dot stays blue. His two account lines carry no number.
  FACT: `142 (orange) | Cinch  Thu 26 Nov | Post him to 149? · Kestrel | now`; Show `142` orange, `149` gold.
- **`u6-d-postout-sheet`: the "To 149 ▾" drop-down is kept**, on the host's second word (it still fits with many
  squadrons). No chip row was made. It therefore differs from `m6-d-itshim-sheet`, which draws "To" as chips — one of
  the two has to follow the other before he sees both.
  FACT (as re-run with the reviewed words): `Cinch  Post out  ✕ / PO FROM Mon 14 Dec 26 ▾ / POSTING Overseas Sqn ·
  Delete · SANS · ✓ Transfer to Sqn / TO 149 ▾ / On 14 Dec: moves to 149 with his sign-in. / Post out`.
- Both pictures opened after the re-run. Nothing else re-made by me in this pass.
