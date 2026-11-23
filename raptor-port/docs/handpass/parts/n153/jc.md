# Night of 24 Nov 26, job 4: Walker C (accounts, words, filter, keys, plain-user rounds)

**Build walked:** `fcca051f0`, frozen, port 4713. **Sizes:** d = 1536 Chromium; p = 402 WebKit phone.
**Result:** 24 scenarios walked at both sizes. **961 checks passed, 2 failed (one fault, seen at both sizes).** No page or
console error in any run. 385 pictures. Nothing committed; no app file touched.

Scripts: `raptor-port/scripts/handpass/n153/walk/jc-*.mjs`. Pictures: `raptor-port/docs/handpass/2026-11-24-msq-night-check/jc/<run>/`
(the paths below start at that folder). Raw logs: the job's scratchpad, `job4/jc/`.

## Scenarios

| Id | Size | Result | What the screen showed | Picture |
|---|---|---|---|---|
| S29 | d, p | **RECORD (q1)** | Hunter (Plan of 149) made a Member and renamed in one Save, either field first. Hover and bubble: "Undid: Hunter's role". The one Undo puts back his role, his sign-in name **and his Plan of 149**; Redo and a reload agree. See F1: q1 hides the Plan too | `jc-acc1-d/s29-role-first-2-undid.png`, `jc-acc1-p/…` |
| S30 | d, p | PASS | From Admin and from Member: "Made a master admin · Hunter/Ranger", "Master admin taken off · …", hover after "Undo —" / "Redo —", bubble after "Undid:" / "Redid:", right way round, state right after a reload | `jc-acc1-d/s30-admin-2-undid-made.png`, `s30-member-3-undid-off.png` |
| S31 | d, p | **FAIL (case H, F1)**; the other 7 cases PASS | View/Plan given, replaced, ended, with a rename, master on and off, both field orders, a field returned to its start: each named once, person last, one Undo restores all. A role change alone that also ends a Plan does not name the Plan | `jc-acc2-d/s31-H-1-edited.png`, `s31-H-2-undid.png`, `jc-acc2-p/s31-H-2-undid.png` |
| S32 | d, p | PASS | Hunter's bell: "Made a master admin: full access to every squadron · Saber", "Plan of 149 ended: master admin covers every squadron · Saber", "View of 150 ended: …", once each, and all stay with every Show button off | `jc-acc3-d/s32-1-hunter-bell.png`, `s32-2-after-shows.png` |
| S33 | d, p | PASS; one part NOT WALKED | Ordinary demotion brings no old Plan back; a Plan given in the demotion's Save is announced; Undo removes the promotion's two lines, Redo brings them back once each, a second Undo removes them again, and his account agrees each time. **Not walked:** Undo after Hunter has read the notice: Undo clears at sign-out, so one tab cannot reach it | `jc-acc3-d/s33-1-bell-demoted.png`, `s33-3-bell-regrant.png`, `jc-s33b-d/undo-redo-bell.png`, `jc-s33b-d/undo-redo-undo-bell.png` |
| S35 | d, p | PASS | Starts on "Pick…"; the button and Enter each say "Pick your squadron"; nothing reaches 142's or 149's list or the bell | `jc-req-d/s35-1-opens.png`, `s35-2-error.png`, `jc-req-p/…` |
| S36 | d, p | PASS | Error, then 142, then 149, one send: on 149's list only, once. The bell lands on 149's Admin ("1 waiting for access to 149"). Approved: he signs in on 149. Refused: back to the Request access card | `jc-req-d/s36-approve-2-bell.png`, `s36-approve-6-applicant.png`, `s36-refuse-6-applicant.png` |
| S37 | d, p | PASS; first part NOT WALKED | Add a person keeps its own default, the list in view (142, then 149). **Not walked:** a one-squadron world: the demo has two and no control removes one | `jc-req-d/s37-1-add-person.png` |
| S38 | d, p | PASS | Each group alone and together, closed, reopened, last tick off, Clear all, the line's Clear: pale blue and the right count only while a tick is on. Opening an empty Filter, or search alone, stays unlit. 36 high beside a 36-high search box throughout | `jc-f38-d/f1-off.png`, `f4b-five-closeup.png`, `f5-search-alone.png`, `jc-f38-p/…` |
| S39 | d, p | PASS + RECORD | By the top bar, ☰, the bell and with the Filter open: Squadron ticks clear; Seat, CAT, Role and search stay. **RECORD:** picking the squadron already in view changes nothing, ticks kept. **RECORD:** leaving Users clears every tick and the search even with no pick, so "Users hidden" has nothing left to keep | `jc-f39-d/s39-2-picked.png`, `s39-4-open-after.png`, `s39-5-bell.png` |
| S40 | d, p | PASS | One Plans tick, for the list in view. "Plans 149" finds Hunter on 149's list; "Plans 142" finds nobody. People 10 beside "Showing 1 of 11" is the outside Plan holder, as ruled | `jc-f39-d/s40-1-plans-149.png`, `s40-2-plans-142.png` |
| S41 | d, p | PASS | Ordinary, accountless and archived rows, from a field and from elsewhere, with Delete armed: closed, nothing saved, no question, focus back on that row, Delete no longer armed | `jc-esc1-d/s41-2-after-escape.png`, `s41-3-armed.png`, `s41-5-archived-row.png` |
| S42 | d, p | PASS + RECORD | Filter first, row second. **RECORD:** "What each role allows" is a fold inside the row, so one Escape closes the row with it. A native list opened by keys (d only) takes the first Escape itself | `jc-esc1-d/s42-1-filter-over.png`, `s42-2-role-help-open.png` |
| S43 | d, p | PASS (lead L1) | With his row hidden by search or filter, Escape acts on the search box or the Filter; nothing is saved, and focus stays on the page. On Squadrons and Inputs, Escape closes what is showing there | `jc-esc2-d/s43-1-search-hid.png` |
| S44 | d, p | PASS | Squadron and place rows: Escape equals Cancel, after an error too; no half-made place. Hunter cannot press 149's row; a shared place's time zone is locked for him | `jc-esc2-d/s44-1-new-place.png`, `s44-3-error.png`, `s44-4-hunter.png` |
| S45 | d, p | PASS + RECORD | **RECORD:** Escape leaves "+ New squadron" open with its number, and Add a person with its words. Closing a row by Escape does not touch either form | `jc-esc2-d/` (S45 is in the log) |
| S46 | d, p | PASS | Enter, Space, ↓ and ↑ each open on the ticked row; arrows, Home and End pick nothing; Enter or Space picks; Escape cancels with focus back on the button | `jc-keys-d/s46-1-open-enter.png`, `s46-2-moved.png` |
| S47 | d, p | PASS; one part NOT WALKED | Tab and Shift+Tab out of both ends close the list. Another browser tab leaves it open. **Not walked:** a real switch of application: the driven browser keeps the page focused | `jc-keys-d/s47-1-tab-out.png` |
| S54 | d, p | PASS + RECORD | Phone: Person, Type, Search, alone and together: pale blue, count 1 to 3, unlit when cleared, admin and member. Desktop keeps its boxes. **RECORD:** a member's Inputs opens already lit with 1, because it opens filtered on himself (lead L2) | `jc-s54-p/S54admin-4-three-closed.png`, `S54member-0-as-it-opens.png`, `jc-s54-d/d-1-boxes.png` |
| S56 | d, p | PASS | Add, find, roles table, Cancel, Escape, Save; old sign-in stops, new one works; bell agrees; View holder gets only View-only Sched and Help on 149; Suspend, Enable, Archive, Restore, Delete; a member has no Admin; an own admin cannot make a master admin. Not separately walked: a Plan holder's own edits on this round | `jc-s56-d/a2-search.png`, `a5-quokka-149.png`, `a7-suspended-signin.png`, `a9-deleted.png` |
| S57 | d, p | PASS (lead L3) | Rows open and close; refusals; a squadron on an existing place and one with + New place…, saved together; first admin gets Plan and Admin; move says "applies from tomorrow"; no + New squadron for an own admin | `jc-s57-d/n-151-saved.png`, `k2-on-150.png`, `p1-move.png`, `h1-tz-locked.png` |
| S58 | d, p | PASS | Member files, finds, edits and deletes his own input; ✕, Cancel, Escape close it; admin files for Hunter; a calendar day leads to the window; Custom; Document's chooser opens (d, no file chosen); Medical and SANS open; 149 never shows 142's input. Not separately walked: a Plan holder | `jc-s58-d/m2-list.png`, `m4-deleted.png`, `a4-kestrel.png`, `jc-s59b-d/c2-custom.png` |
| S59 | d, p | PASS | Opens December; Ranger bids one day and a 3-day range; ✕ and Escape; approved; grid, Approvals, Inputs and bell agree; period list, My leave, person window, OIL (✕ and Escape), dates → Grid → Back, Balances, Legend, Manning, Settings each open and close. Not walked: remarks or a document on a bid | `jc-s59-d/a4-approved.png`, `m7-inputs.png`, `jc-s59b-d/l5-from-approvals.png`, `l10-range-placed.png` |
| S60 | d, p | PASS (lead L4) | Button, outside press and Escape close it; Show never hides personal lines; a request lands on the right list; read stays read after signing in again; lines follow Undo and Redo; member has no Show row | `jc-s60-d/saber-2-request.png`, `hunter-2-on-149.png`, `ranger-1-bell.png` |

## The fault

### F1. Undo does not name the Plan it puts back when a role change alone ends it (S31 case H, d and p)

**To reproduce, from a clean world:**
1. Sign in as Saber (`ad` / `a`). Admin → Users → Hunter. Set 149 to Plan. Save.
2. Open Hunter again. Change Role to Member. The row greys Plan and says "Plan is for admins only." Save.
3. Hunter's row no longer says "also plans 149". His bell says "Plan of 149 ended · Saber".
4. Hover Undo: "Undo — Hunter's role". Press it: "Undid: Hunter's role".
5. Open Hunter: he is an Admin again **and holds Plan of 149 again**.

**What should happen:** the words name everything the one Undo does, for example "Undid: Made a member, Plan of 149 ended · Hunter"
(the exact words are the owner's to approve). D2396 (o), a change Undo makes is named whole; the scenario's "disproved by":
"Hunter's role" as the whole description while Undo also changes his name or access. The code's own comment on these words says
Undo should never take back something it does not name.

**How it relates to the open question q1.** q1 asks about a role change with a rename. This case has no rename, so it is not q1.
It also shows that **q1 is wider than it was put to the owner**: in the q1 case, when Hunter holds a Plan, the same bubble also hides
that Plan coming back (S29). One wording decision would settle both.

**Script and pictures:** `jc-acc2.mjs` (step H), `jc-h.mjs`; `jc-acc2-d/s31-H-1-edited.png`, `jc-acc2-d/s31-H-2-undid.png`,
`jc-acc2-p/s31-H-2-undid.png`, `jc-h-d/h1-bell.png`.

## The drawing check

Each control measured with the filter off and on, at 2x, beside its approved picture. **No difference over 2px and no colour
difference on any control below.**

| Control | Height | Fill (drawing = build) | Edge (drawing = build) | Words | Beside the drawing |
|---|---|---|---|---|---|
| Users Filter, 1536 | 36, search box 36 | 25,52,61 | 44,139,162 | computed 59,198,232 | `jc-draw/users-desk-beside-drawing.png` |
| Users Filter, 402 | 36, search box 36 | 26,52,61 | 46,140,164 | computed 59,198,232 | `jc-draw/users-phone-beside-drawing.png` |
| Inputs button, 402 | 36, box unchanged | 18,43,50 | 43,136,159 | computed 59,198,232, small 1 kept | `jc-draw/inputs-beside-drawing.png` |

The fill and edge were read from the pixels of both pictures; the words' colour is the computed one.
**Neighbours, off → on:** at 1536 the search box, heading and Filter's top edge stay, and the Filter grows 77.3 → 94.7 to the right.
At 402 the search box narrows 242.7 → 225.3 to make that room, which is the width in the approved picture. The rows below move down
24.5 because "Showing 34 of 61 · Clear" appears, as drawn. On Inputs nothing moves.
**One small note, not counted:** in the Inputs capture the button's top edge spreads over three device pixels where the drawing has
two; its colours are the same. It was not traced further.

**The new words beside their drawings, read letter for letter and by eye, 2x, both sizes:** `jc-words/w-f1-*.png` and `w-f2-*.png`
(Request access), `w-l1-*.png`, `w-l2-*.png`, `w-o1-*.png` (Undo; the two-change bubble fits one line on the phone: 36 high, inside
the screen), `w-n1-*.png` (the bell). All match. The hover (the drawing's `l3`) was compared by its words only, since a browser's
hover label does not appear in a picture.

## Odd things no scenario asked about (leads, to check; none is called a fault)

- **L1. A typed draft vanishes when a search or filter hides its row.** Open Hunter's row, type a new sign-in name, type a search
  that hides him, clear it. The row comes back open with the **saved** name; the typing is gone with no word. It happens with no
  Escape pressed, so it is not the new Escape. Nothing wrong is saved. (`jc-esc2.mjs`, the control step.)
- **L2. Every member's phone Inputs opens with the Filter lit and "1".** It is true: the list opens filtered on himself. With the
  new look it is more noticeable, on a filter he did not set. Worth showing the owner. (`jc-s54-p/S54member-0-as-it-opens.png`)
- **L3. After a place change, the squadron stands under both places until tomorrow.** Moving 150 to Northfield: its own row still
  says Home base (right, "applies from tomorrow"), but the Places list shows 150 under **both** Home base and Northfield, with nothing
  saying which is from tomorrow. (`jc-s57-d/p2-moved.png`)
- **L4. A bell lit by waiting requests takes a press each before its list opens.** With requests waiting on 142 and 149, Hunter's first
  press lands on 142's list, the second moves him to 149's, and only the third opens his notices. (`jc-s60.mjs`, log.)
- **Small:** on the desktop, Shift+Tab from the list's first row once closed the list on reaching the button and once left it open
  until the next Shift+Tab. Both end shut with nothing picked.

## My own script errors, corrected before these results

A reload signs out in this demo; ticked chips read "✓ Pilots"; the search's frame is the input's parent; the Inputs window asks
"No document"; the Leave War's past months cannot be opened, so December was used; OIL is a window with its own ✕; a phone's Inputs
card carries its date in the heading above. None was an app fault. The earlier attempts' logs were overwritten; each picture folder
holds the final run.
