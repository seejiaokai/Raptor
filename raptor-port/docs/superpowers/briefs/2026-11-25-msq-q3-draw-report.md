# [MSQ-PICK-GUARD] the third round — the drawings (Opus drawer; chat 176, 25 Nov 26)

Brief: `2026-11-25-msq-q3-draw-brief.md`. Saved whole by the host from the helper's hand-back (its e3 section appended after the host asked for Saber's bell, D2191).

# n176 drawer — hand-back ([MSQ-PICK-GUARD] third round, 25 Nov 26)

Scripts: `raptor-port/scripts/handpass/n176/` (`world.mjs`, `draw-lib.mjs`, `draw-e1` … `draw-e11.mjs`), each re-runnable from the repo root; set-up states cached in `raptor-port/.tmp/n176-draw/` (`FRESH=1` remakes). Pictures/films: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/` (93 files, each whole + `-crop`). All taken with the updated words.mjs. Nothing under src, nothing committed.

**Clash avoided:** the pressing helper also writes `raptor-port/.tmp/n176/state-world.json`; it overwrote my first world, so mine moved to `.tmp/n176-draw/`. I did not touch its file.

## The world (world.mjs, Saber's presses)
- "+ New squadron" 150 with no first admin is refused ("Name the squadron's first admin."), so I picked Kestrel. Kestrel's Plan of 150 was ended once 150 had its own admin.
- 150's people: Mako (sign-in mako, Admin), Jackal, Onyx.
- Hunter: Plan of 149 and View of 150.
- Ace (142, Pilot CAT A) archived. A new Ace (150, Pilot CAT B) added, then archived. No rename was needed.
- FACT: 142 has 60 people plus archived Ace. 149 has 10 people, plus Hunter listed as "also plans 149". 150 has 3 people plus archived Ace.
- Extra set-up inside scripts: e3 adds inputs and a "Squadron Day" holiday on 149 and 150. e6 archives Jester (142). e11 gives Hunter the Scheduler tick.

## Pictures
- **e1t-d**: today's form, 3061px down the page.
- **e1a-d / e1a-p**: "+ Add a person" (cloned from Filter, same 36px height) beside Filter on desktop; full width under the search on phone.
- **e1b-d / e1b-p**: the page's own form under the People row, "Nova" typed, "Add person" · "Cancel" at its foot. Its "Add a person" heading and the rule above it are hidden; its note sits above the buttons.
- **e1c-d**: form folded after Cancel, nobody added.
- **e1d-d / e1d-p**: "Blocked: add or cancel the new person, then pick 149." on one line; under the picker (d), at the foot (p).
- **e2-d / e2-p .mp4** (H.264, 4 s), **e2-d-rm / e2-p-rm**, stills **e2-d-1/2/3**: measured opacity 0.33 at 250 ms, back to 1. With less motion: white for 1 s, then grey. The fade starts two frames after the number reads 150.
- **e3-d / e3-p**: Hunter's bell with every line's number first in one column:
  - 149: "Squadron Day Tue 8 Dec · 1 input needs an OIL answer · Saber"
  - 150: the same line, **cloned**
  - 142: "Duty · You were added · Saber"
  - his two account lines ("Given View of 150", "Given Plan of 149: full access to 149"), with the number's place left empty.
- **e3b-d / e3b2-d**: Kestrel's bell (one squadron, so no numbers). Two cloned lines: "Hunter Wed 25 Nov / Plan of 149 ended · Kestrel" and "… / Given Plan of 149 · Kestrel". In e3b2 they show Hunter with "142".
- **e4a-d / e4a-p**: under 149's people, "▸ 142 · 60 people" and "▸ 150 · 3 people", cloned from "▸ Archived".
- **e4b-d / e4b-p**: "▾ 142 · 60 people" open. 60 rows, each callsign + 142 + seat · CAT + None/View/Plan. Hunter's line shows Plan; Saber's shows "Full access".
- **e4c-d-greyed**: as Hunter, Plan greyed, with an imitated hover label "Only 149's own admins or a master admin can give or end Plan of 149."
- **e4c-d-note**: the same words as the opened row's inline note.
- **e4t-d**: today, Ranger on 149 as Hunter: Save, Suspend, Archive, Delete and None/View all live.
- **e4d-d**: roles note 5 = W.rolesNote, 2 lines.
- **e5t-d / e5-d-primary-top / e5-d-primary-open**: "All squadrons" (the Filter's Squadron ticks): 142 open; "▸ 149 · 10 people" and "▸ 150 · 3 people" under it, then "▸ Archived · 2".
- **e6a-d / e6a-p**: "142 has an archived Jester: Pilot, CAT B, archived 25 Nov 26. Is this him?", the button "Someone new: add him" and the words "If this is him, ask 142's admin". The note takes 2 lines on the phone.
- **e6b-d**: "More than one archived man is called Ace…". It lists the real archived rows: Ace 142 (CAT A) and Ace 150 (CAT B), each with its own "ask …'s admin", and one "Someone new" under them.
- **e6c-d**: Hunter's bell: "142 | Jester Wed 25 Nov / 149 added a new Jester. Delete yours if he has left flying for good · Kestrel", 2 lines.
- **e6d-d-today / e6d-d-taken**: "Ranger is already taken — callsigns must be unique" becomes "Ranger is already taken on 142".
- **e7t-d / e7-d**: 3 reports, newest first, wearing 150 / 149 / 142.
- **e8t-d**: today a press on the badge on 150 switches Hunter to the member view ("Hunter · Member").
- **e8-d**: "HUNTER · VIEW ONLY". **e8-p**: "Signed in as Hunter · View only". **e8b-d**: on 149 the badge stays "Admin".
- **e9t-d / e9-d**: "+ Commitment" greyed, imitated hover "150 has no SANS aircrew."
- **e10t-d / e10-d**: today the Person box offers Hunter (picked first) plus 149's 10 men. Drawn: an empty choice first, then 149's men only.
- **e11t-d / e11-d**: PLANNED BY offers Kestrel, Hunter 142, Saber 142.

## What I cloned, and from where
| Drawn | Cloned from |
|---|---|
| "+ Add a person" button | Filter |
| The form | moved, the page's own |
| Folded headings | "▸ Archived" (149 has none, so read on 142's page) |
| Rows and grey 142 | 149's own rows and `.acc-sqn` |
| Access line | Hunter's opened row on 149 |
| Bell lines and numbers | real lines and `.bl-sqn` |
| Archived rows in e6b | the real archived rows on 142 and 150 |
| e6a's parts | Give access's archived note, `.abtn`, `.acc-sub` |
| e11's list | the SANS calendar's Highlight list |
| e10's list | the select drawn open with `size` |

Hover labels are imitated, because a screenshot holds none.

## What would not draw
- **e3, 150 line:** Hunter has only View of 150, and D2191 says a View holder's bell never shows that squadron's lines. So it is cloned with the real words of 150's holiday line. His Show row has no 150 button. This clashes with D2191 and needs a decision.
- **e7, real reports from other people:** today reports live only while the page is open, and a Logout or reload loses them for everyone. So Saber filed all three in one page.
- **e10 / e11, the open lists:** a browser's own list can't be photographed or carry a badge. For the build, "Hunter 142" as plain words or an app-made list is his call.

## What the owner should know
- **e2:** the number is small and already grey, so the dim is subtle.
- **e3b:** Kestrel is told his own action. Today nobody is told their own change, so it would reach other 149 admins. Today the app already writes "Plan of 150 ended · Saber" to the man himself.
- **e4b:** 60 bright cyan "None" buttons in a row are heavy.
- **e4c:** today greyed-access reasons show as an inline note, which also shows on a phone; hover text never shows on an iPhone. The same is true of e9.
- **e6:** today Add a person gives no warning for an archived callsign (the new Ace went in silently). The foot's "Add person" stays live beside "Someone new: add him", so there are two ways to add.
- **e6d:** today's warning stands at the screen's foot, far from the box, over a row.
- **e8:** "View only" sits beside a live "Switch to the member view". The menu already reads "150 · View only" under its mark.
- **Seen once, not re-checked:** 150's "+ Input" Person list offered the archived Ace (and Saber).
- **e1d-d:** the note covers part of the page title "Admin".

## Words used that are not in words.mjs
- Test data: "Nova", "Squadron Day", the three "Test report - …" texts.
- The opened fold's ▾: the app's own glyph swap.
- "Full access": the app's existing words.

planEndedMoved and planEndedMember were not drawn (not asked).

---

# e3 redrawn: Saber's bell (the host's correction on D2191)

All four of Saber's bell lines are real, raised by presses; none is cloned. Hunter's earlier pictures are kept and renamed `e3h-d-bell[-crop].png` and `e3h-p-bell[-crop].png`. `draw-e3.mjs` now makes both versions: `ONLY=e3-d,e3-p` for Saber, `ONLY=e3h-d,e3h-p` for Hunter.

## The presses for Saber (saved as state e3s, built on e3's state)
- **149 and 150 lines:** from e3's set-up. Saber filed a duty on 8 Dec (Heron on 149, Mako on 150), then added "Squadron Day" on 8 Dec in each squadron's Calendar.
- **142 holiday line:** new. Saber adds "Squadron Day" on 8 Dec in 142's Calendar. Hunter's 8 Dec duty stands on that day.
- **A line about Saber himself:** new. Hunter signs in and files a 142 duty for Saber on Wed 9 Dec. Saber can't raise one himself, because nobody is told about their own change.
- **Tried and not possible:** Kestrel filing a 149 duty for Saber. 149's "+ Input" does not offer Saber.

## Bell pictures
- **The switch:** Saber's Show row read 142 on, 149 off, 150 on beforehand. 150 was on only because e3's set-up had pressed it. He then pressed 149 on, his own saved choice (D2198). After: 142, 149 and 150 all on.
- **e3-d-bell and e3-p-bell** (each with `-crop`). The grey number comes first on every line, in one column:
  - `142 | Duty Wed 9 Dec | You were added · Hunter | now`
  - `142 | Squadron Day Tue 8 Dec | 1 input needs an OIL answer · Saber | now`
  - `150 | Squadron Day Tue 8 Dec | 1 input needs an OIL answer · Saber | 18 min`
  - `149 | Squadron Day Tue 8 Dec | 1 input needs an OIL answer · Saber | 18 min`
- **Footer:** "Show 142 149 150" and "Mark all read".
- **Account lines:** Saber has none, so no empty number places appear. No press I have can give a master admin an account line. The empty place is shown in `e3h-*` on Hunter's account lines.
- **The change drawn:** the app's grey squadron badge moved to the start of each line's first row, in a fixed 32px column. Today's 149 and 150 badges are moved, not doubled. The 142 lines have no badge today, so the badge is cloned onto them.

## What the owner should know
- **Same words:** three of the four lines read alike ("Squadron Day … 1 input needs an OIL answer · Saber"), so only the number tells them apart.
- **"Saber" as signer:** the holiday lines carry Saber's own name as their signer, and he still receives them. Holiday lines go to every admin, the person who added the holiday included.
- **Phone pointer:** on the phone, the press on 149's Show button left the pointer over the last line, which then showed as hovered. The script moves the pointer away before the picture.
