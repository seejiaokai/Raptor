---
paths:
  - raptor-port/src/state/accounts.ts
  - raptor-port/src/state/auth.ts
  - raptor-port/src/state/perms.ts
  - raptor-port/src/state/roster-add.ts
  - raptor-port/src/state/person-delete.ts
  - raptor-port/src/state/quals-write.ts
  - raptor-port/src/state/view.ts
  - raptor-port/src/state/store.ts
  - raptor-port/src/ui/UsersPanel.tsx
  - raptor-port/src/ui/AccessScreen.tsx
  - raptor-port/src/ui/Login.tsx
  - raptor-port/src/ui/WelcomeBack.tsx
  - raptor-port/src/ui/QualsPage.tsx
  - raptor-port/src/ui/AdminPage.tsx
  - raptor-port/src/ui/Shell.tsx
  - raptor-port/src/ui/html.ts
  - raptor-port/src/**/*accounts*
  - raptor-port/src/**/*perms*
  - raptor-port/src/**/*onedoor*
  - raptor-port/src/**/*roster*
  - raptor-port/src/**/*posting*
  - raptor-port/src/**/*postout*
  - raptor-port/src/engine/people.ts
  - raptor-port/src/engine/qualcols.ts
  - raptor-port/src/engine/slots.ts
  - raptor-port/src/engine/schema.ts
  - raptor-port/src/leavewar/sync.ts
  - raptor-port/src/leavewar/engine/people.ts
  - raptor-port/src/leavewar/engine/access.ts
  - raptor-port/src/leavewar/state/**
  - raptor-port/src/leavewar/ui/BidPicker.tsx
  - raptor-port/src/leavewar/ui/Matrix.tsx
  - raptor-port/src/leavewar/ui/MatrixRows.tsx
  - raptor-port/src/leavewar/ui/OutcomeChips.tsx
  - raptor-port/e2e/*accounts*
  - raptor-port/e2e/*users*
  - raptor-port/docs/engine-rules.md
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/data-model.md
  - raptor-port/docs/data-schema.md
  - raptor-port/docs/handover-dataverse.md
  - raptor-port/docs/architecture-direction.md
  - raptor-port/docs/mock/one-door.html
  - raptor-port/docs/mock/post-out.html
  - raptor-port/docs/mock/new-person-account.html
  - raptor-port/docs/**/*accounts*
  - raptor-port/docs/**/*one-door*
  - raptor-port/docs/**/*post-out*
  - raptor-port/docs/**/*new-person*
---

# People & accounts — how it works now

<!-- shape: page -->

Loads by itself whenever a chat reads an accounts, sign-in, Admin → Users, Quals, one-door or posting file (the `paths:`
above) — and open it yourself before planning such work, before one of those files is open
(`.claude/rules/doc-structure.md`).

Each line is a rule as it stands today; the numbers after it are the rulings that set it. His words, the readings he was
told, each ruling's date and the history are in the full rows, `.claude/decisions-full/people-accounts.md` — open the row
before acting on a rule's detail or asking him about it (`grep -h '^| D323 |' .claude/decisions-full/*.md`, the shell;
the Grep tool hides a long row).

These rulings moved here from How we work and the scheduler file on 28 Sep 26, in the rulings slim-down. The main
rulings of other areas that bear on people and accounts are pointed to at the end, each stated on its own area's file —
among them the Leave War's that govern Quals, its column list, `engine/people.ts` and `state/store.ts`, since the Leave
War's own file no longer loads with them (7 Nov 26).

The Leave War's architecture — its own store and storage seam, its roster projected from the app's people, the one
absence record, the seams where it meets the rest of the app — still loads with them: `.claude/rules/seams/leave-war.md`.
The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every chat; the map of every ruling, and
how to record or retire one: `DECISIONS.md`.

## Accounts and signing in
- Accounts are built in the app now, shaped as the real thing: the Admin tab creates and manages them, each tied to one
  callsign (the person), admin or member, and an admin creates new admins and members; signing in makes you that
  callsign, so "View as" another person is gone — every account already is a callsign, as his plan for the database
  step has it; the Leave War follows the signed-in callsign, a member bidding only on his own row; everything that
  records who did something names the callsign [D166, D292, D165].
- Today's sign-in screen stands for the defence-mail sign-in, in his words: the account's sign-in name plays the
  defence-mail address and its password the organisation's; at the database step Microsoft's sign-in, with an
  authenticator, replaces it and nobody signs in twice, the one piece left to the IT side being to tie each account to
  its real address; the agent's readings: the demo passwords are not security and never real ones, and accounts, like
  all data, live in one browser until the database [D166, D292].
- His plan for the database step: everyone signs in with his own defence-mail account; an admin creates each person in
  the app — callsign, name, admin or member — and ties it to that person's defence-mail address, the first sign-in with
  it becoming that person; with personal accounts the hand over shows each person what changed since he last looked
  [D165].
- The agent's readings of that plan, told to him: getting into the app at all is granted in the organisation's
  Microsoft set-up by whoever runs it, and inside the app he manages the people list; the agent never sets up the
  tenant, the accounts or any login; real names and e-mail addresses live only in the organisation's environment, never
  in this repository [D165].
- The sign-in keeps its password box until the database step, when Microsoft's sign-in replaces the whole page; only
  the two seeded sign-ins check it, and the app never stores a password; his "ok" took that recommendation — "remove it"
  would reverse it [D223].
- No "Sign up" button on the sign-in page: anyone who signs in and is on no list lands on "Request access" by himself,
  and at the database step the sign-in is Microsoft's; kept in reserve, not built, is one line under the button — "New
  here? Sign in with your defence mail to ask for access." — if new people are confused once it is live [D293].
- An account can be suspended and enabled again — a man away, overseas with another squadron, cannot sign in, and on
  his return an admin enables it and he signs in as before; suspend is the old "Switch off", which a posting out can
  also do on its date (the agent's reading) — and deleted, for a man who leaves flying for good, the delete taking the
  person too (below) [D280, D287, D290, D297, D299, D1102, D981, D300, D1105].
- The account buttons read "Suspend" / "Enable" and "Delete account", "Suspend / Enable" in place of "Switch off / Switch
  on"; the screens that name the state follow — the account's tag "suspended", the sign-in screen "Your access is
  suspended" (the agent's reading) [D285].

## How a person joins
- A new user joins either way: the admin adds him first — his defence mail, the puck (callsign) it belongs to, member
  or admin — and his first sign-in has that access at once; or he signs in on no list, asks with "Request access", and
  an admin, told of it, approves, sets member or admin and links him to a puck — a typed callsign never claims a puck by
  itself; either way the admin changes his role, his puck or his account later [D204].
- The sign-up card (Request access) and Admin → Users' New person ask the same things — callsign/name, initials, Pilot /
  WSO / Personnel and CAT — so approving a request makes his Quals row from what he gave; the sign-up no longer asks only
  callsign and name [D214, D224, D204].
- Admin → Users can create a brand-new person with his account in one step, making his Quals row and his account
  together through the same one add Quals uses — the one callsign rule, never a second copy; the same "New person" is
  offered when approving a request, filled from what he typed; the rest of his Quals row (flight, quals) is set on Quals
  (the agent's readings) [D214].
- While he waits he sees the waiting screen; an admin switch, off by default, can let people waiting see the programme
  read only, as a guest — the agent's reading of his "both ways", off because anyone who reaches the app could then read
  the squadron's programme [D204].
- With guest access on, the waiting screen offers a button into the guest view, with no signing out and in again; with
  it off, no button; the agent's readings: the button reads "View the schedule", with a line saying he can look while he
  waits, and the guest view keeps its Sign out [D221].
- A guest sees what a member sees on View-only Sched, read only — a published day as issued, a day not yet published as
  it stands now, its medical inputs too (below); read only means no buttons — no working-draft picker, no ⓘ day panel, no
  warning list, no pending list (the agent's reading); the switch stays the admin's and off by default [D215, D213,
  D211].
- A guest sees a medical input as members do — its type and remarks on the schedule he sees; the agent's readings: its
  times too, as a member reads them, and still no door to a document, the Inputs page or the medical view, none of them
  mounted for a guest [D213, D211].
- Every member sees a medical input's type, remarks and documents, as today, setting aside the database brief's "the
  person and admins only" — chosen knowing the database step then departs from that rule; the change history shows a
  medical change in full to members too (the agent's reading) [D211, D213].
- A new access request notifies the admins beyond the Admin tab's count: the top-bar bell lights, on a desktop and a
  phone; a tap says "N waiting for access" and takes him to Admin → Users; a member's bell never lights for it; at the
  database step it also becomes a Teams message — the agent's readings, shown on the mock-up [D216, D204].
- Each admin's bell is his own: a new request lights every admin's bell and goes out for one admin only once he has had
  the waiting list on screen — Admin → Users itself, on a phone only once he taps into Users, stored with the request so
  it survives a reload and goes once the request is answered (the agent's readings); another admin looking does not put it out; the Admin tab's count stays
  until the request is answered [D227, D216].
- Initials are asked but never required — on the sign-up and on Admin → Users' New person alike; a blank is filled in
  later on Quals [D225, D214].
- The callsign/name stays at 14 letters, as the Quals callsign box does, and the box says so: more than 14 on the sign-up
  or on Admin → Users' New person is refused with the reason ("at most 14 letters") shown on the form, so the person
  picks a short form — never quietly cut [D226].
- The field that names a person reads "Callsign/Name", a man with no callsign — ground crew, for one — going by his name
  in it; on the sign-up card only it reads "Displayed callsign/name"; the agent's readings: it is one field, the label
  on his puck, relabelled wherever it is asked or headed — the sign-up, Admin → Users' add, approve and account editor,
  the Quals column head — and the sign-up's wording is a new label on that field, not a second one [D219, D222].
- The seat choice reads "Pilot" and "WSO" — no (FCP) / (RCP) — wherever a new person's seat is asked, the sign-up and
  Admin → Users; "Personnel (ground crew)" stays as it was [D220].

## Roles, the member view and permissions
- An admin can switch himself to the member view and back by tapping his name badge, "SABER · ADMIN" to "SABER ·
  MEMBER"; in the member view the app behaves exactly as for a member (his own Quals row and inputs only, no Admin tab,
  no Edit Schedule); every sign-in starts as admin; he stays himself throughout; on a phone the switch sits in the
  drawer's account line (the agent's reading) [D292, D166].
- One place in the app answers "may this person do this?", mirroring the data model's permissions table
  (`raptor-port/docs/data-model.md` §11, what IT builds the security roles from), which matches every ruling, with a
  test that fails when the two disagree; built with `[ACCOUNTS]`, a member's own Quals row held at the page and the
  write path, a test per column [D200, D149, D218, D1510, D1651].
- The database's security roles are designed by the agent at the database step, not before: each table's permissions
  per role, row ownership set by the app, the protected columns, and what stands in for each rule a role cannot hold; IT
  enters them, and a member-only account tests them; the IT side's answers of 8 Nov 26 — database rights are theirs, who
  may do what the app's own roles — were put to him that day, held on `[DB-SECURITY-ROLES]` [D1653].
- Joining stays one choice for the admin, member or admin: the app puts the person into the matching group, which
  carries the role — the agent's reading, to check in the hosting trial and with the IT side [D1653].

## Admin → Users — the one door
- His direction, built as proposed: one door — Admin → Users shows each person's whole state, his sign-in and his place
  on the roster, and carries every action on him but the dated posting, whose sheets stay on the Leave War, his row
  showing a posting that waits for its date (below) [D309, D310].
- One row per person on the roster, A to Z, with a search box; a Sign-in dot and a Roster dot in two columns — green on,
  red off, grey no sign-in; a tap on a row opens his sign-in, his role and the buttons for his state; the list never
  reorders itself (the agent's call, approved with the mock-up) [D322, D310].
- The buttons by state: Active → Suspend · Archive · Delete; Suspended → Enable · Archive · Delete; no sign-in → Give
  sign-in · Archive · Delete; Archived, in the folded "▸ Archived · N" group at the foot → Restore · Delete; Waiting →
  Give access · Refuse; the words stay — Suspend / Enable, Archive / Restore, Delete — and "Give sign-in" is new [D310,
  D322, D285, D298].
- Archive also suspends the sign-in; Restore brings both back, asks the post-in date and tells him to check his quals
  and CAT, so there is no "can sign in but archived" half-state; the agent's calls, approved with the mock-up: Archive is
  one tap, Restore undoing it, and no Enable on an archived row, so no signing in while archived [D310, D322].
- Restore turns his sign-in back on even when it was suspended by hand before he was archived — the agent's call,
  approved with the mock-up, narrowing for Restore alone the post-out rule that "he's back" enables only the suspension
  a posting made [D322].
- "Add a person" at the foot makes a New person only, its sign-in left blank for someone who will not use the app; a man
  already on the roster gets his sign-in on his own row, with Give sign-in [D322, D310].
- His first sign-in after Restore shows "Welcome back, <callsign> — check your quals and CAT", with "Check my quals" and
  "Later" [D322].
- A posting waiting for its date shows on his row — "posting out 14 Oct · Overseas Sqn", "posting in 19 Oct"; a man
  whose posting out has run and left him on the roster shows "posted out <date>"; the agent's readings: that covers a
  posting with no outcome and a SANS posting — "posted out 14 Oct · SANS" — and the tag goes if the posting is undone
  [D326, D322].
- An archived man's row says how he came to be archived and when, on one line — "Archived 27 Sep 26 by Saber", or
  "Archived 14 Oct 26 by his posting (Overseas Sqn)" — the latest archive only, his pick; stored on the person, so it
  survives a reload; a man archived before it was built shows none [D329].
- Quals keeps quals, CAT, flight and initials; its ✕ archive, its Archived list, Restore, Restore as and the rename moved
  to Admin → Users; Quals' "+ Add person" is a button to Admin → Users; renaming a man on the roster stays on Quals (the
  agent's call, approved with the mock-up) [D310, D322, D224].

## Quals — who edits what
- On Quals a member edits his own row only, never another person's, so members keep their own qualifications up to date
  themselves: every column of it — initials, flight, CAT, SXO, SANS, every qualification — but three, each an admin's:
  the callsign, the Management tick and the Scheduler tick [D149, D218, D1510, D1651].
- A member's own Management and Scheduler cells read only, and a member's command that changes one is refused at the
  Quals write and the commit gate as well; for Management, refused at the screen, the write and the gate alike is the
  agent's reading [D1510, D1651].
- The Scheduler tick decides who may sign SKED CK, PLANNED BY and APPROVED BY, and a scheduler is always an admin; a
  member unticking his own had blanked his signatures, the reason the tick became an admin's [D1651, D1510].
- A callsign's rename stays on Quals, an admin's alone, and stays a label: every puck, the history and his account
  follow it [D218, D1510, D1651].

## Quals — its row of buttons, and on a phone
- Quals' row of buttons is one row at 36, as drawn — the date box that did nothing removed, "Export to Excel" reading
  "Export" on a phone — and the paragraph under it ("similar to a LoX…", with its links) is deleted whole; "+ Add
  person" alone on its row stays as it is (the agent's reading) [D935].
- Quals' edit buttons read as Logic's: "✎ Edit" in plain grey to start, "Done" in the bright blue while editing, on
  every width — in place of "Enable editing" and "Save changes" ("Save" on a phone); what each does is unchanged:
  Quals keeps each change as it is made, and "Done" only ends editing [D1128, D937].
- While editing, "Edit quals" is plain grey until pressed, as "✎ Edit" is, so "Done" is the one bright-blue button, the
  way out; pressed it reads "✕ Edit quals", plain; what it does is unchanged — for this one button in place of his 5 Aug
  26 rule that it is blue while it is the thing to press [D1129, D1128].
- Quals opens at its top — its row of buttons in sight — wherever it is opened from, as the Inputs page does; Logic and
  the other pages are not part of this (the agent's reading) [D937, D1128].
- Quals' pinned header row follows the table sideways by the browser itself, as the Leave War's pinned date row does,
  so it keeps up with the table on his iPhone — that row alone, the Leave War's left as it was [D993]; both rows since
  take the row's place in the same frame it reaches the top bar (the Leave War's D1789, D1850, below).
- On a phone a pinch on Quals zooms the table only — the top bar, "✎ Edit" (then "Enable editing"), Export, the filter
  and the Pilots · WSOs · Personnel · All switch stay as they are; the heading row and the name column stay pinned and
  lined up; it zooms out until the whole table's width fits and in to twice normal, and keeps its zoom while he stays on
  Quals [D1108, D1110, D1128].
- The agent's readings of the pinch, told to him: "stays on Quals" means it goes back to normal when he leaves the page;
  switching Pilots / WSOs / Personnel / All keeps the zoom; the desktop is unchanged [D1110].

## Posting in, and a man's stints
- When someone is posted in, the app asks the admin for his post-in date, so the Leave War is right; his access can
  start a few days before it — his account works from the day the admin adds or restores him, while his post-in date
  decides from when he counts in the squadron: availability, the manning counts, the crowds a placeholder stands for
  [D308].
- "Posted in" is every door that puts a man on the roster — Admin → Users' New person, added by the admin or approving a
  request as one, and Restore / Restore as, now on Admin → Users — its date box opening on today's date, changed by the
  admin when he arrives later (the agent's readings) [D308, D322].
- The Leave War keeps every stint a man has in the squadron, not one in-and-out window: posted out and later restored
  with a post-in date, he reads "away" between the two — not counted in manning or availability, no bids, the posting
  hatch — his months before the posting stay as they were, his leave there included, and he counts again from the
  post-in date [D320, D308].
- A leave period he is away for the whole of shows no row for him; one holding his posting-out date shows his days
  before it as normal; a stint opens on a post-in date and closes on a posting-out date, Restore opens a new one, never
  rewriting an old one, and the war's own Post in / Post out edit the stint the day falls in (the agent's readings)
  [D320].
- The posting sheets are the admin's, open at any time — a posting date is an official date, not a bid — and never the
  man's, as he was told; an earlier stint's dates are read-only on the Leave War, as built: the Post in sheet of the
  stint he came back for says "Back from a posting on …" and offers no Undo, and a date aimed into an earlier stint is
  refused with the reason [D328].
- His current stint's post-in and post-out still move; the read-only earlier stint was chosen knowing an old stint's
  wrong date then has no door to correct it anywhere [D328].

## Posting out — its four outcomes and its sheet
- A posting out has four outcomes; the admin picks one and the app does it on the posting-out date: Overseas Sqn —
  archived, account suspended, back later; Delete — a man who leaves flying for good, deleted, person and account; SANS —
  posted to another workplace but still flying with us, he becomes SANS; Transfer to Sqn — future, with the
  multi-squadron database; each can also be done by hand later (the agent's reading) [D229, D1709, D287, D283, D290,
  D299, D297, D1102, D981, D300, D1105, D1692].
- The choices are four short chips — "Overseas Sqn", "Delete", "SANS" and "Transfer to Sqn" — taking little room, and
  the "he's back" line on Quals lines up with the page's left edge; the agent's readings: one short line under the chips
  says what the chosen one does on the date, and "Sqn" alone is fine, the bar on unit names forbidding only a squadron
  number paired with it [D294, D298, D1709].
- A ground-crew man cannot be posted out as SANS: the Post out choices offer him no SANS — on the one-day sheet, the
  posting sheet and the drag window — and the posting writer refuses it; SANS stays an aircrew status, and the other
  outcomes stay his [D1709].
- A posting with no chip chosen — the chosen one tapped again — stays "off the manpower, nothing else": the Leave War
  shows him posted out from the date, and he stays on Quals with his account open, nothing archived, deleted or made
  SANS; it is how a man leaving for another squadron is recorded until Transfer is built; the sheet still opens on
  Overseas Sqn [D303].
- The post-out sheet says each thing once: the date in its box, one line for what happens on it, and a button that
  reads just "Post out"; the "Nothing changes until that day…" line goes, with fewer words overall; the post-in button
  reads just "Post in" the same way (the agent's reading) [D300, D1105].
- His example of that line, "On 14 Oct: archived on Quals, account suspended.", came before the one door; since Quals
  lost its archive the app writes "On 14 Oct: archived, account suspended." ("archived." for a man with no sign-in) — the
  agent's reading of the later D310, as built [D300, D1105, D310].
- For the Delete outcome the sheet's line reads "On <date> the app deletes him automatically, with his account. Days he
  flew keep his puck.", and until the date his row reads "posting out <date> · auto delete" — wherever the pending words
  show, Admin → Users and the Leave War (the agent's reading); the button stays "Delete"; a man whose delete has run
  shows no such word [D1105, D298].
- On the Post out sheet, changing the date of a posting whose outcome is Delete to today or earlier asks the same
  tap-twice question as the Delete button before he is deleted, the date not saved until the second tap; a date in the
  future deletes no one at once, so it is saved with no ask, and backing out leaves the posting and its date as they
  were (the agent's readings) [D1102].
- A posting that would archive, suspend or delete the last admin who can sign in waits, whole, until another admin can,
  as built — never half done; it is said before the confirm and on his account row, and it runs by itself once the
  reason goes [D306].
- A posting out is not a step of the Undo button — the sheet's "Undo post out" takes it back; a SANS posting moves his
  whole Leave War row into the SANS group on the date, earlier months included — the case where "+ SANS" is on, since
  with SANS off he stays in his old place (below; the agent's reading of the two together); an admin may still add leave
  or OIL on a deleted man's past days [D321, D327, D283, D1692].
- A man posted out as SANS becomes SANS on the posting-out date: with SANS kept off the Leave War — no "+ SANS" group,
  which replaced the Show SANS switch — the war still shows him in his old place, marked posted out, his name wearing
  the SANS purple line, not a "SANS" tag, and does not track his leave; with "+ SANS" on he moves into the SANS group that
  day and his leave is tracked there; whether to track SANS stays his choice [D283, D1692, D1221].
- A hidden SANS man, once archived, shows on the Leave War with his months here — his leave and OIL in them seen —
  whatever the SANS setting says ("+ SANS", once Show SANS), as a deleted man does, as built [D325, D1221].
- A man back from overseas returns as he was — his Quals kept, and his whole record, the Leave War's too (the agent's
  reading) — and the app prompts the admin to update them: on Restore, and on Enable of any suspended man, one suspended
  by hand and never archived too, as built, it says he is back and to check his quals and CAT, with a way straight to
  his Quals row, changing nothing by itself [D284, D307].
- "Fresh" on return — new quals and new Leave War balances, his 13 Sep 26 rule — no longer covers a man archived while
  overseas; it still covers a man who left flying for good and is ever taken back (the agent's reading) [D284].

## Posting out on its date — the admins' bells
- His direction: when a man's posting out runs on its date — archived, deleted, made SANS or transferred — the
  schedulers are told, so nobody is ever gone silently; answered by his "A": it runs and tells them, never waiting for an
  Accept [D1546, D1547, D1690, D1691].
- A posting out runs by itself on its date, as before, and each admin's bell then gets one line saying it ran — the man
  in bold and the date, then "Posted out" and what the outcome did, "Ranger · Mon 16 Nov / Posted out · archived, account
  suspended", option B as drawn, not "Posting out" first; the agent's readings: every outcome alike, Delete included, and
  no "auto" or "manual" choice at the Post out sheet — his idea, put back to him with that recommendation [D1547, D1690,
  D1691].
- The outcome's words, as drawn: "archived, account suspended" (or "archived" for a man with no sign-in), "deleted",
  "now SANS", "off the manpower"; nobody is named as who set the posting, since the app does not keep it [D1690].
- A tap on the line opens his row on Admin → Users; when the posting deleted him, his line opens nothing — he has no row
  left there — and stays in the bell as the record, as the bell's "Deleted" line for an input does [D1691, D1547,
  D1690].
- The "off the manpower" line is worked out from the posting as it stands, as built: it moves with the posting's date,
  goes with an undone posting — a read one taken back, by the scheduler's rule for every bell line — and goes if the
  man is archived or deleted by hand later; it is not saved as the other three lines are [D1696, D1693].
- On Admin → Users the blue ring on a row a bell's posting line lands on stands 8px outside the row on each side, clear
  of his name, as built — not on the row's edge, as drawn; the drawing check keeps the difference [D1694].

## Archive, restore and callsigns
- Archive on Admin → Users is "posted out from today" on the Leave War, his past kept: his row shows as normal up to
  yesterday, his leave and OIL in those months kept, reads "PO" (away) from today and is not counted in manning; a leave
  period wholly after today does not show him; Restore with a post-in date opens a new stint [D323, D320].
- The agent's readings of it, told to him: a posting that already closed his stint keeps its date; a man whose post-in
  is still to come is closed empty; a pending posting out is replaced by today's; it writes the war's posting as run, so
  the posting pass never repeats it [D323].
- An archived man stays in the ALL AVAIL crowd on every day before his archive — the crowd on a day already published
  stays as it went out and nothing reads pending for it; the working copy reads him by his stints, in the crowd on days
  he was here and out of it from his archive on, so a gap before a later Restore reads him out too; a published day he is named on — a seat, a desk — still reads "1 pending" until the
  next amendment, as built [D327, D321].
- An archived man's callsign may be given to a new person — one held by someone on the roster is still refused; if the
  archived man is later restored while his callsign is in use, one of the two is renamed first [D286].
- Restore refuses while the name is taken and says so, never renaming anyone by itself, and offers the rename on the
  spot ("Ace is taken — give him another callsign"), so the rename and the restore are one step (the agent's readings)
  [D286, D295, D310].
- An archived man can be renamed directly, by an admin, on his row of Admin → Users' archived list — since the one door,
  no longer Quals'; a typed callsign (a row, the search, a sign-up) finds the man on the roster, never the archived one,
  and old schedules keep showing the archived man's days as his (the agent's readings) [D295, D310, D286].
- When a request's callsign belongs only to an archived man, Approve opens on New person, filled from the request, with
  a line saying an archived man holds that callsign — the sign-up itself checks no names, the approve allows it (the
  agent's readings) [D286].

## Delete — a man who leaves flying for good
- A man who leaves flying for good is deleted, his account and his person; the delete asks twice and names what goes,
  and so does the date that sets one off; it cannot be undone, and if he is ever taken back he is a new person, asking
  for access afresh as someone who left the system (the agent's readings) [D287, D290, D297, D299, D1102, D981, D300,
  D1105, D280].
- What stays — a delete takes him out of today and the future while the past keeps its record of him, shown only where
  the past is shown: his puck on every day he already flew, published or not; his past Leave War leave and OIL in the
  months he was here; his past inputs with their documents; his signatures on published days (CUR CK, SKED CK, PLANNED
  BY, APPROVED BY); the change history; his Tracker record from courses he finished [D299, D297, D981, D300, D1105].
- What goes: his account and the sign-in; his Quals row from every list, the Archived one included, and every picker;
  every day still to come, a published day reading pending as any change does; his future leave, bids and inputs; his
  OIL balance; his Leave War row after he left, and the war's current views; his place on any Tracker course still
  running; how long medical records are kept is the organisation's rule, applied at the database step [D299, D297, D981,
  D300, D1105].
- His callsign is free, and if a new man takes it the old days still show the old one — the app knows each by his id;
  underneath he is kept as a hidden "deleted" mark, never erased: in the database his row stays, marked deleted and
  invisible everywhere — the data model's tombstone, and the platform's own way of deleting [D290, D297].
- A delete counts from the real calendar date, as built — every day before it keeps his puck, every day from it loses
  him; the demo's own "today" (13 Jul) is not the clock [D304, D297].
- The post-out chip reads "Delete", not "Fully delete" — the past keeps his record, so "fully" overstates it — and the
  same word names the act everywhere: the post-out chip, the account editor's second tap and the confirm line (the
  agent's reading); "Delete account" stands [D298, D285].

## Many squadrons and aircraft types — not built yet
- One app is built for every squadron and aircraft type (F-15, F-16, F-35), each squadron configuring it inside the app,
  with an aircraft-type setting that carries its rules, its rule checks included; rules common to every type are shared
  and each squadron keeps its quirks; a change is made once [D1100, D1101].
- Detachments — one squadron split across two places, each with its own schedule and its people moved to it, so a
  scheduler sees only who is with him — and squadrons sharing people — members seeing each other's schedules, a man lent
  for a day or a period, even flying with one in the morning and teaching at the other in the afternoon, so checks such
  as clashes and crew rest must see both — come at the end, after the F-15 app's faults are fixed, and work before then
  avoids what would have to be redone [D1100, D1101].
- The agent's reading of that last part, told to him: until then new work keeps squadron- and aircraft-specific choices
  as settings, never fixed in the code, and is never built so that one man on two squadrons' days, or a second schedule,
  would have to be undone; nothing of the feature itself is built early [D1100, D1101].
- The app is deployed separately for each aircraft type, each with its own database — his leaning of 21 Oct 26 ("Im
  thinking"), answering D1100's open question; one code base still serves them all, and the squadrons of one type, with
  their detachments, share that type's database — so far at most two squadrons a type, so lending a man between the two
  F-15 squadrons stays inside one system (the agent's reading) [D1101, D1100].
- Not settled: his direction of 5 Nov 26 below names one database for many squadrons, not aircraft types, so by its
  words it does not end the split by type; but the IT side's answer of 8 Nov 26 — one production environment for code
  apps, so no database per type today — was put to him that day, recommended: no change now, the F-15 squadrons first,
  settled when a second type joins; held on `[AIRCRAFT-TYPE-SETTING]` and `[MULTI-SQN-DESIGN]` (the agent's reading)
  [D1101, D1695].
- How a guest flyer from another type, or a man moving from one aircraft type to another — his data travelling with him
  today only within one system — crosses from one database to another is his question at the database step, not before;
  "one database" in the architecture guide meant one deployment's schedule, Leave War and Tracker; nothing is built for
  it now (the agent's readings) [D1101].
- His direction (5 Nov 26): one app and one database for many squadrons — each person's squadron set when his account
  is made, rights to view other squadrons read only, a permanent transfer when he posts out, a day planned half in one
  squadron and half in another; its design is put to him with pictures as a job of its own before the database step;
  the agent's readings: nothing is built now, and the table format for the IT side carries the squadron on each record
  [D1695].
- A posting to another squadron will be a transfer — future, with the multi-squadron database: on the posting-out date
  he belongs to the other squadron, the admin transferring him automatically on that date or by hand in the app, his
  data going with him; not built now [D281, D282, D1100, D1101].
- Neighbouring squadrons plan each other's people as a matter of course, not only during a posting — both ways, "plan"
  meaning put on the other squadron's schedule while his leave, quals and account stay his own squadron's; the database
  must not assume a squadron's schedule holds only its own people (the agent's readings) [D282, D281, D1100, D1101].
- A community is the squadrons flying one aircraft type (F-15, F-16): callsigns are unique within a community, not
  across the app, so the database must not make one unique across the whole app; a guest flyer from another community is
  always marked as one — future, nothing built now [D288, D289].
- The guest mark is an orange corner on his puck (option A), taken knowing it is a little less distinct beside a red
  warning chip; the mark never hides the callsign — "Viper · F-16" in full wherever there is room: the lists, the pickers,
  a tap (the agent's reading) [D296, D289].
- The agent's proposal of the same day, not yet answered by him: a guest is picked from a list of guest flyers, never by
  typing a bare callsign — a typed callsign means your own community's man; and a guest's leave, quals and account stay
  with his own squadron, as a neighbour's man's do [D288].

## Settled — leave as they are
- Admin → Users, the one door: the one-door mock-up, `raptor-port/docs/mock/one-door.html`, is the design of record for
  `[ONE-DOOR]`, with the agent's calls listed on it ("What I decided — say if any is wrong") approved with it [D322,
  D309, D310].
- The Post out sheet and the delete: the post-out mock-up, `raptor-port/docs/mock/post-out.html`, trimmed to say each
  thing once, is the design of record for `[POST-OUT-OUTCOMES]`, and for the guest mark when `[XFER]` is built [D299,
  D300, D981, D1105, D296].
- The new person and the sign-up: the new-person mock-up, `raptor-port/docs/mock/new-person-account.html`, is the design
  of record for `[ACCOUNTS-NEW-PERSON]`, the post-in date added to its form; his message left the template's "[or:
  change X]" unfilled, read as approved as drawn — a change he names later is a new ruling [D224, D308].
- The posting bell's line: its drawing of record, `raptor-port/docs/mock/2026-11-05-postout-bell/` (pictures 4 and 6),
  its ring 8px outside the row kept as built [D1690, D1694].
- The post-out and one-door look cards' answers, as built: an earlier stint read-only, a posting with no chip, a delete
  from the real calendar date, the held posting, Enable's note on any suspended man, a hidden SANS man shown once
  archived [D328, D303, D304, D306, D307, D325].
- Quals' row of buttons, as built: one row, "✎ Edit" and "Done", "Edit quals" grey until pressed [D935, D1128, D1129].
- Edit Schedule's "Publish AL1", which a member sees looking pressable only through this PC's developer route, is left
  as it is: no member reaches the page anywhere else, and every change he tries there is refused [D1658].

## From other areas (each stated on its own area's file)
- The Leave War's: a posting out with the Delete outcome refuses approving his leave from its date, but not moving leave
  of his already approved [D1555, D1545].
- The Leave War's: a posting-out date refuses no leave on the war, before or after the posting has run — he tells his
  superior himself — but for a posting with the Delete outcome [D1541, D1545].
- The Leave War's: a man deleted on Admin → Users before he ever arrived keeps his leftover leave line's words on
  Approvals, "Posted out — refuse or delete it", Refuse beside it taking the line away [D1521].
- The Leave War's: the M4 readings stand as built, R15 struck by D1460 and R20 by D1541; R21 — a man deleted on Admin →
  Users keeps the refusal of his leftover pending leave [D1447, D1541, D1460].
- The Leave War's: the Management tick column is already on Quals, empty, beside SXO, for every squadron; the admin
  ticks its people, and the war knows it by the column itself, not its name [D1502].
- The Leave War's: its Management group comes from that Quals column and stands first on the war; a man in Management
  still counts in his own seat [D1200, D1502, D1149].
- The Leave War's: whoever runs it is given an admin account; the app gets no Leave-War-only role [D1223].
- The Leave War's: SANS men are off the war unless the admin puts them on with "+ SANS" among its groups, in place of the
  Show SANS switch; they never fall into "Everyone else" [D1215, D1221].
- The Leave War's: it has no "Edit person" — a man's seat, band and SXO change only on Quals, and the war shows what
  Quals says; Quals' SXO tick is the one source, so nothing on the war makes anyone SXO [D461, D460].
- The Leave War's: a man posted out as SANS, in his old place on the grid, wears the SANS purple line on his name's chip
  from when the posting is set, as every SANS name there does; Balances and Approvals show it only from his posting date
  [D1692, D1697, D1698, D1711].
- The Leave War's: under a man posting out, Approvals reads "posting out 1 Mar · Overseas Sqn", where he goes named
  [D1446].
- The Leave War's: a man's last day in is a yellow line down the day's right edge; an entry filed on a day after his
  posting out is its box in full colour over faint dark stripes, counting nobody; a gone day with nothing filed keeps its
  bare "PO" [D1728, D1729, D1730, D1720].
- The Leave War's: in the bid window, Post out and Post in, with Grant OIL, are reached from the one "⋯" button in the
  row under the leaves [D1326].
- The Leave War's: its "Viewing as <callsign>" chip is gone — on a desktop the name badge says who is signed in, on a
  phone the menu's "Signed in as" line [D1173].
- The Leave War's: when its clash note names a man with no row on the war — an archived man, or a SANS man while SANS is
  off — its link goes to Approvals or to the leave's window on the Inputs page [D1542].
- The Leave War's: its pinned dates row and Quals' header take the row's place in the same frame the row reaches the top
  bar; they went live with one painted frame left on a quick scroll, a job of its own [D1789, D1850].
- The scheduler's: who was behind a placeholder puck is frozen at publication on every day; nothing on a published
  schedule changes without the scheduler acknowledging it — a later change reads pending, and any pending change wipes
  the sign-offs; this is what a published day keeps when a man is deleted or archived [D44, D45, D103].
- The scheduler's: deleting a man lists everything the delete took away in the changes window, one line each on its own
  day — his "deleted" line, each future input, bid and OIL award, and each planning note he was taken off; a credit the
  schedule earned is never a line [D337, D710].
- The scheduler's: a man's CAT, seat and posting on his puck stay as published until the next AL, a change reading
  pending; a callsign rename updates the published schedule at once [D186].
- The scheduler's: an admin picks all four sign-offs' names, whoever is signed in; who is offered in each comes from
  the Quals ticks, the Scheduler tick an admin's alone since this page's D1651 [D212].
- The scheduler's: members see the full change history, a medical change in full too [D169, D211, D213]; a Quals change is a
  line dated the day it was made, and someone given access later starts with nothing new [D338].
- The scheduler's: every bell line is taken back by the undo of what made it — a posting out's by its sheet's "Undo post
  out", or by a change of its date or outcome once it has run; a read line is struck through, then "taken back · <who>",
  unread, and an unread one simply goes [D1693, D1699, D1710].
- The scheduler's: a new person's Post in date — on Restore and on giving access too — opens the app's one date calendar
  over its form, its weeks starting on Monday [D796, D797].
- The scheduler's: a flying line with only its front seat filled works as fully as a two-seat one, for F-16 and F-35
  squadrons; a switch hiding the back seat is one of the aircraft-type settings, designed with him first [D1099, D1100, D1101].
- The Tracker's: a man deleted through Post out leaves every Tracker course on which he still has events to do — neither
  done nor N.A. — and stays, his record kept, on every course where all of his are; this is what the delete's "a course
  still running" means [D981].
- The Tracker's: each signed-in person reopens the Tracker on his own last course, chart and student; the admin's member
  view is the same person [D376].
- The Inputs pages': a column heading dragged on Quals to the table's edge scrolls the table sideways [D893].
- The design file's: the screen after asking for access takes look B's pass at its top — the claws, "Waiting for an
  admin", his callsign large, his initials, seat and CAT — and look A's three steps, the read-only line, "View the
  schedule" and "Sign out", with "Signed in as …" small at the foot [D1649, D1650, D1654, D1656].
- The design file's: while a save has failed, the "Not saved — keep this page open · Retry" band shows on that screen,
  the guest page and the sign-in screen too, and the pass reads "Not sent yet" [D1657, D1664].
- The design file's: the app is called TALON, not RAPTOR, the sign-in and the access screens included, where the claw
  sits 7px nearer the name [D1590, D1606, D1608].
- The design file's: Admin → Users' dots carry no band round them — no mark in the app glows [D887].
- The design file's: the posting's delete — at its Delete chip, its PO from date and the Post out button — asks its
  second step in a card hanging from the control, "Delete <name>?" with Delete and Cancel [D1627, D1628].
- The design file's: on a phone the page itself never zooms; Quals is one of the grids that zoom by their own pinch
  [D1567].
- The design file's: Quals' "✎ Edit" pencil is the app's one drawn pencil, and its search box takes the Edit Schedule
  week's look [D1134, D1127]; undo and redo move Quals to a man's row only when it is not wholly on screen [D672].
- How we work: a scheduler is always an admin — nothing is built, tested or walked for one who is not; a member, a guest
  and a person with no sign-in stay in scope; the admin's own member view is a member while it is on [D785].
- How we work: the one undo does not take back adding a person, archive, Restore / Restore as, delete or a posting —
  each has its own way back, and the greyed button says why; Undo steps back only through the signed-in person's own
  changes [D350, D148].
- How we work: at the database step Admin → Data's "Clear edit history…" is removed; until then it stays as built
  [D1752].
- How we work: a security read — an extra fresh reader looking only for holes — on any change to sign-in, permissions or
  what one person sees of another; one full security review of the app before the database step [D1411].
- How we work: at the move each aircraft type's deployment is set to its type by a setting, not by code — built then,
  not now, the agent's reading [D1536, D1537].
- How we work: no tables, security roles or day-lock flow on his M365 before the database step; his test account is set
  up then to match the IT side's restrictions, the same roles among them [D1662, D1749, D1571, D473].
- How we work: what does not read the one table — Quals ticks homed in one record, a posted-out man read from the person
  among it — is one item for the database step, nothing of it built before then [D1587, D473].
