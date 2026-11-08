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

Loads by itself with any accounts, sign-in, Admin → Users, Quals, one-door or posting file (the `paths:` above); open it before planning such work. Each line is a rule as it stands, its rulings after it; his words, the agent's readings told to him (never stated here as his rule), dates and history are in the full rows, `.claude/decisions-full/people-accounts.md` — open the row before acting on a rule's detail or asking him about it. The Leave War's architecture: `.claude/rules/seams/leave-war.md`. Other areas' rulings: pointers at the end, each stated on its own page; the map: `DECISIONS.md`.

## Accounts and signing in
- Accounts are built in the app as the real thing: the Admin tab creates and manages them, each tied to one callsign (the person), admin or member, admins creating admins and members; signing in makes you that callsign — no "View as" another person, every account already a callsign; the Leave War follows the signed-in callsign, a member bidding only on his own row [D166, D292, D165].
- Every record of who did something names the callsign as it was then, the person kept underneath (the scheduler's D1589) [D166, D292, D1589].
- Today's sign-in stands for the defence-mail sign-in: the sign-in name as the address, the password as the organisation's; at the database step Microsoft's sign-in, with an authenticator, replaces it, nobody signing in twice, IT's one piece tying each account to its real address [D166, D292].
- His database-step plan: everyone signs in with his own defence-mail account; an admin creates each person — callsign, name, admin or member — tied to his address, the first sign-in with it becoming him; the hand over then shows each what changed since he last looked [D165].
- The password box stays until then, when Microsoft's sign-in replaces the whole page; only the two seeded sign-ins check it, no password is stored [D223].
- No "Sign up" button: signed in and on no list, he lands on "Request access" by himself; in reserve, not built: a line under the button, "New here? Sign in with your defence mail to ask for access.", if new people are confused once live [D293].
- An account can be suspended — away overseas with another squadron he cannot sign in; back, an admin enables it — and deleted, for a man who leaves flying for good, the person going too (below) [D280, D287, D290, D297, D299, D1102, D981, D300, D1105].
- The buttons read "Suspend" / "Enable" (for "Switch off / Switch on"); the approved "Delete account" reads "Delete" since the one door; the tag "suspended" and the sign-in screen's "Your access is suspended" follow [D285, D310, D322].

## How a person joins
- Either way: the admin adds him first — defence mail, the puck (callsign) it belongs to, member or admin — and his first sign-in has that access; or he signs in on no list and asks with "Request access", his defence mail taken from the sign-in so it cannot be faked and he never types it, and an admin approves, sets member or admin and links him to a puck — a typed callsign never claims a puck by itself; the admin changes role, puck or account later either way [D204].
- Request access and Admin → Users' New person ask the same — callsign/name, initials, Pilot / WSO / Personnel, CAT — so approving makes his Quals row from what he gave; the sign-up no longer asks only callsign and name [D214, D224, D204].
- Admin → Users makes a brand-new person and his account in one step; Give access offers "On the roster / New person", as drawn and built, the first linking him to a man already on the roster [D214, D224, D322].
- Waiting, he sees the waiting screen; an admin switch, off by default, lets people waiting see the programme read only, as a guest — his "both ways" [D204]; on, the waiting screen offers a button into the guest view, no signing out and in again; off, no button [D221].
- A guest sees what a member sees on View-only Sched, read only — a published day as issued, an unpublished one as it stands now, a medical input's type and remarks as members see them; the switch stays the admin's, off by default [D215, D213, D211].
- Every member sees a medical input's type, remarks and documents, as today — the database brief's "the person and admins only" set aside, knowing the database step then departs from it; the change history shows a medical change in full to members too, his own since How we work's D1536, D1537 [D211, D213, D1536, D1537].
- A new request notifies the admins beyond the Admin tab's count, at the database step a Teams message too [D216, D204]. Each admin's bell is his own: lit for every admin, out for one only once he has had the waiting list on screen; another admin looking does not put it out; the Admin tab's count stays until the request is answered [D227, D216].
- Initials are asked, never required — sign-up and New person alike; a blank is filled in later on Quals [D225, D214]. The callsign/name stays at 14 letters, as the Quals callsign box does, and the box says so: more than 14 is refused with "at most 14 letters" on the form, so he picks a short form — never quietly cut [D226].
- The field that names a person reads "Callsign/Name" — a man with no callsign, ground crew for one, goes by his name in it; on the sign-up card only, "Displayed callsign/name" [D219, D222]. The seat reads "Pilot" and "WSO", no (FCP) / (RCP), wherever asked; "Personnel (ground crew)" stays [D220].

## Roles and permissions
- An admin switches to the member view and back by tapping his name badge, "SABER · ADMIN" to "SABER · MEMBER"; there the app behaves exactly as for a member (his own Quals row and a member's inputs; no Admin tab, no Edit Schedule); every sign-in starts as admin; he stays himself throughout [D292, D166].
- One place in the app answers "may this person do this?", mirroring the data model's permissions table (§11), which matches every ruling, a test failing when the two disagree; built with `[ACCOUNTS]`, a test per column [D200, D149, D218, D1510, D1651, D1589].
- The database's security roles are the agent's to design at the database step, not before — each table's permissions per role, row ownership set by the app, the protected columns, what stands in for a rule a role cannot hold; IT enters them, a member-only account tests them; IT's 8 Nov 26 answers (database rights theirs, who may do what the app's roles) are put to him, `[DB-SECURITY-ROLES]` [D1653].

## Admin → Users — the one door
- His direction, built as proposed: one door — Admin → Users shows each person's whole state, sign-in and roster, and carries every action on him but the dated posting, whose sheets stay on the Leave War, his row showing a posting waiting for its date [D309, D310].
- One row a person, A to Z, a search box; a Sign-in dot and a Roster dot — green on, red off, grey no sign-in; a tap opens his sign-in, role and the buttons for his state — never the signed-in admin's own row, which another admin changes ("Your own row can't be opened"); the list never reorders itself [D322, D310].
- Buttons by state: Active → Suspend · Archive · Delete; Suspended → Enable · Archive · Delete; no sign-in → Give sign-in · Archive · Delete; Archived, folded "▸ Archived · N" at the foot → Restore · Delete; Waiting → Give access · Refuse; the words stay — Suspend / Enable, Archive / Restore, Delete — "Give sign-in" new [D310, D322, D285, D298].
- An archived row opens his callsign box — a rename, "Restore as …" when a roster man holds his callsign — a Post in date opening on today, Restore and Delete [D322, D295, D310, D308].
- Archive also suspends the sign-in; Restore brings both back — even a sign-in suspended by hand before the archive, narrowing for Restore alone the post-out rule that "he's back" enables only a posting's suspension — asks the post-in date and says check his quals and CAT: no "can sign in but archived" half-state, Archive one tap, Restore undoing it, no Enable on an archived row, so no signing in while archived [D310, D322].
- "Add a person" at the foot makes a New person only, sign-in blank for someone who will not use the app; a roster man gets his sign-in on his own row, Give sign-in [D322, D310]. His first sign-in after Restore shows "Welcome back, <callsign> — check your quals and CAT", with "Check my quals" and "Later" [D322].
- His row shows a posting waiting — "posting out 14 Oct · Overseas Sqn", "posting in 19 Oct" — and "posted out <date>" once a posting out has run and left him on the roster [D326, D322].
- An archived row says how and when, one line — "Archived 27 Sep 26 by Saber", "Archived 14 Oct 26 by his posting (Overseas Sqn)" — the latest archive only, his pick, stored on the person; archived before it was built, none [D329].
- Quals keeps quals, CAT, flight and initials; its ✕ archive, Archived list, Restore, Restore as and the rename moved to Admin → Users; its "+ Add person" is a button there; renaming a roster man stays on Quals [D310, D322, D224].

## Quals
- A member edits his own row only, never another's — every column (initials, flight, CAT, SXO, SANS, every qualification) but three, each an admin's: the callsign, the Management tick, the Scheduler tick; his own Management and Scheduler cells read only, a member's command changing one refused at the Quals write and the commit gate as well [D149, D218, D1510, D1651, D1589].
- The Scheduler tick decides who may sign SKED CK, PLANNED BY and APPROVED BY, and a scheduler is always an admin; a member unticking his own had blanked his signatures, why the tick became an admin's [D1651, D1510].
- A rename stays on Quals, an admin's alone, and stays a label: every puck and his account follow it; the change history and every other record keep the name as it was, the person underneath (the scheduler's D1589) [D218, D1510, D1651, D1589].
- The buttons are one row at 36, as drawn — the idle date box removed, "Export to Excel" reading "Export" on a phone — and the paragraph under it ("similar to a LoX…", with its links) deleted whole [D935].
- The edit buttons read as Logic's: "✎ Edit" plain grey to start, "Done" bright blue while editing, on every width — for "Enable editing" and "Save changes" ("Save" on a phone), what each does unchanged: changes kept as made, "Done" only ends editing [D1128, D937]. While editing "Edit quals" is plain grey until pressed, as "✎ Edit" is, so "Done" is the one bright-blue button, the way out; pressed it reads "✕ Edit quals", plain, unchanged in what it does — this one button apart from his 5 Aug 26 rule that the thing to press is blue [D1129, D1128].
- Quals opens at its top — its buttons in sight — wherever opened from, as the Inputs page does [D937, D1128].
- Its pinned header row follows the table sideways, as the Leave War's pinned date row does, so it keeps up on his iPhone — that row alone, the Leave War's left as it was; both since take the row's place in the frame it reaches the top bar (the Leave War's D1789, D1850) [D993].
- On a phone a pinch zooms the table only — the top bar, "✎ Edit" (then "Enable editing"), Export, the filter and the Pilots · WSOs · Personnel · All switch stay; the heading row and name column stay pinned and lined up; out until the whole width fits, in to twice normal, the zoom kept while he stays on Quals [D1108, D1110, D1128].

## Posting in and stints
- Posted in, the app asks the admin for his post-in date, so the Leave War is right; his access can start a few days before it — the account works from the day he is added or restored, the post-in date decides from when he counts in the squadron: availability, manning, the crowds a placeholder stands for; every door onto the roster asks it, the box opening on today [D308, D322].
- The Leave War keeps every stint a man has, not one in-and-out window: posted out and restored with a post-in date he reads "away" between — not in manning or availability, no bids, the posting hatch — his months before the posting as they were, his leave included, counted again from the post-in date; a leave period he is away for all of shows no row for him, one holding his posting-out date shows his days before it as normal [D320, D308].
- The posting sheets are the admin's, open at any time — a posting date is an official date, not a bid — never the man's, as he was told; an earlier stint's dates are read-only, as built: its Post in sheet says "Back from a posting on …" with no Undo, a date aimed into an earlier stint is refused with the reason; the current stint's dates still move, chosen knowing an old stint's wrong date then has no door to correct it [D328].

## Posting out
- Four outcomes, the admin picks one and the app does it on the posting-out date: Overseas Sqn — archived, account suspended, back later; Delete — leaving flying for good, deleted, person and account; SANS — another workplace but still flying with us, he becomes SANS; Transfer to Sqn — future, with the multi-squadron database [D229, D1709, D287, D283, D290, D299, D297, D1102, D981, D300, D1105, D1692].
- Four short chips — "Overseas Sqn", "Delete", "SANS", "Transfer to Sqn" — taking little room; the "he's back" line on Quals lines up with the page's left edge [D294, D298, D1709].
- A ground-crew man cannot be posted out as SANS: no SANS chip for him — the one-day sheet, the posting sheet, the drag window — and the posting writer refuses it; SANS stays an aircrew status, the other outcomes stay his [D1709].
- No chip chosen — the chosen one tapped again — stays "off the manpower, nothing else": posted out on the Leave War from the date, still on Quals with his account open, nothing archived, deleted or made SANS — how a man leaving for another squadron is recorded until Transfer is built; the sheet still opens on Overseas Sqn [D303].
- The sheet says each thing once: the date in its box, one line for what happens on it, a button reading just "Post out"; the "Nothing changes until that day…" line goes, fewer words overall; his example line, "On 14 Oct: archived on Quals, account suspended.", predates the one door — the app writes "On 14 Oct: archived, account suspended." ("archived." with no sign-in), the agent's reading of D310 as built [D300, D1105, D310].
- Delete's line reads "On <date> the app deletes him automatically, with his account. Days he flew keep his puck.", his row "posting out <date> · auto delete" until the date; the button stays "Delete" [D1105, D298].
- Moving a Delete posting's date to today or earlier asks the Delete button's tap-twice question first, the date not saved until the second tap [D1102].
- A posting that would archive, suspend or delete the last admin able to sign in waits, whole, until another admin can — never half done; said before the confirm and on his account row, it runs by itself once the reason goes [D306].
- A posting out is no step of the Undo button — the sheet's "Undo post out" takes it back; a SANS posting moves his whole Leave War row, earlier months included, where it moves at all (below); an admin may still add leave or OIL on a deleted man's past days [D321, D327, D283, D1692].
- Posted out as SANS he becomes SANS on the date: with SANS off the Leave War — no "+ SANS" group, which replaced Show SANS — the war still shows him in his old place, marked posted out, his name wearing the SANS purple line, not a "SANS" tag, his leave untracked; "+ SANS" on, he moves into the SANS group that day, his leave tracked there; tracking SANS stays his choice [D283, D1692, D1221]. A hidden SANS man, once archived, shows on the war with his months here — leave and OIL seen — whatever the SANS setting, as a deleted man does, as built [D325, D1221].
- Back from overseas he returns as he was — his Quals kept — and the app prompts the admin to update them — the "he's back — check his Quals and CAT" note on Restore and on Enable of any suspended man, one suspended by hand and never archived too; "fresh" on return — new quals, new Leave War balances, his 13 Sep 26 rule — no longer covers a man archived while overseas [D284, D307].
- His direction: when a posting out runs on its date — archived, deleted, made SANS or transferred — the schedulers are told, so nobody is ever gone silently; his "A": it runs by itself, as before, never waiting for an Accept, and each admin's bell gets one line — the man in bold and the date, then "Posted out" and what the outcome did, "Ranger · Mon 16 Nov / Posted out · archived, account suspended", option B as drawn, not "Posting out" first [D1546, D1547, D1690, D1691].
- The outcome's words, as drawn: "archived, account suspended" ("archived" with no sign-in), "deleted", "now SANS", "off the manpower"; nobody is named as who set the posting, the app not keeping it [D1690]. A tap opens his row on Admin → Users; a deleted man's line opens nothing — no row left — and stays in the bell as the record, as an input's "Deleted" line does [D1691, D1547, D1690].
- The "off the manpower" line is worked out from the posting as it stands, as built: it moves with the date, goes with an undone posting — a read one taken back, the scheduler's rule for every bell line — and if the man is archived or deleted by hand later; it is not saved as the other three are [D1696, D1693]. The blue ring on the Admin → Users row a bell line lands on stands 8px outside the row each side, clear of his name, as built — not on the row's edge as drawn; the drawing check keeps the difference [D1694].

## Archive, restore, callsigns
- Archive on Admin → Users is "posted out from today" on the Leave War, his past kept: normal up to yesterday, leave and OIL kept, "PO" (away) from today, not counted in manning; a leave period wholly after today does not show him; Restore with a post-in date opens a new stint [D323, D320].
- An archived man stays in the ALL AVAIL crowd on every day before his archive — a published day's crowd stays as it went out, nothing pending for it; the working copy reads him by his stints, out from his archive on, a gap before a later Restore out too; a published day he is named on — a seat, a desk — reads "1 pending" until the next amendment [D327, D321].
- His callsign may go to a new person — one held on the roster is still refused; restored while it is in use, one of the two is renamed first: Restore refuses a taken name, never renaming anyone itself, and offers the rename on the spot ("Ace is taken — give him another callsign") [D286, D295, D310].
- An archived man is renamed by an admin on his row of the archived list — since the one door, no longer on Quals [D295, D310, D286]. A request whose callsign only an archived man holds: Approve opens on New person, filled from the request, a line saying an archived man holds it — the sign-up checks no names, the approve allows it [D286].

## Delete
- A man who leaves flying for good is deleted, account and person; the delete asks twice and names what goes, so does the date that sets one off [D287, D290, D297, D299, D1102, D981, D300, D1105, D280].
- Out of today and the future, the past keeps its record, shown only where the past is shown: his puck on every day he flew, published or not; past Leave War leave and OIL; past inputs with their documents; his signatures on published days (CUR CK, SKED CK, PLANNED BY, APPROVED BY); the change history; his Tracker record from finished courses [D299, D297, D981, D300, D1105].
- Goes: account and sign-in; his Quals row from every list, the Archived one included, and every picker; every day still to come, a published day reading pending as any change does; future leave, bids and inputs; his OIL balance; his Leave War row after he left and the war's current views; his place on any Tracker course still running; how long medical records are kept is the organisation's rule, applied at the database step [D299, D297, D981, D300, D1105].
- His callsign is free; a new man taking it, the old days still show the old one — the app knows each by his id; underneath a hidden "deleted" mark, never erased: in the database his row stays, marked deleted, invisible everywhere — the data model's tombstone [D290, D297]. A delete counts from the real calendar date, as built — every day before keeps his puck, every day from it loses him; the demo's "today" (13 Jul) is not the clock [D304, D297].
- The chip reads "Delete", not "Fully delete" — the past keeps his record, "fully" overstates it; the account button, once "Delete account", reads "Delete" since the one door [D298, D285, D310, D322].

## Many squadrons and aircraft types — not built yet
- One app for every squadron and aircraft type (F-15, F-16, F-35), each squadron configuring it inside the app, an aircraft-type setting carrying its rules, rule checks included; rules common to every type shared, each squadron's quirks kept; a change made once [D1100, D1101].
- Detachments — a squadron split across two places, each its own schedule and people, so a scheduler sees only who is with him — and squadrons sharing people — each other's schedules seen, a man lent for a day or a period, even split between the two in one day, so clash and crew-rest checks see both — come at the end, after the F-15 app's faults are fixed; work before then avoids what would have to be redone [D1100, D1101].
- Deployed separately for each aircraft type, each with its own database — his leaning of 21 Oct 26 ("Im thinking"), answering D1100's open question; one code base serves all, the squadrons of one type, detachments included, sharing that type's database — so far at most two squadrons a type [D1101, D1100].
- Not settled: his 5 Nov 26 direction (below) names one database for many squadrons, not aircraft types, so by its words does not end the split by type; IT's 8 Nov 26 answer (one production environment for code apps, so no database per type today) was put to him, recommended: no change now, settled when a second type joins; `[AIRCRAFT-TYPE-SETTING]`, `[MULTI-SQN-DESIGN]` (the agent's reading) [D1101, D1695].
- His direction (5 Nov 26): one app and one database for many squadrons — each person's squadron set when his account is made, other squadrons viewed read only, a permanent transfer when he posts out, a day planned half in each of two squadrons; its design goes to him with pictures as a job of its own before the database step, `[MULTI-SQN-DESIGN]` [D1695].
- A posting to another squadron will be a transfer — future, with the multi-squadron database: on the posting-out date he belongs to the other squadron, transferred by the admin automatically that date or by hand, his data going with him; not built now [D281, D282, D1100, D1101].
- Neighbouring squadrons plan each other's people as a matter of course, not only during a posting, his leave, quals and account staying his own squadron's [D282, D281, D1100, D1101].
- A community is the squadrons flying one aircraft type (F-15, F-16): callsigns unique within a community, not across the app, so the database must not make one unique app-wide; a guest flyer from another community is always marked — future, nothing built now [D288, D289].
- The guest mark is an orange corner on his puck (option A), taken knowing it is a little less distinct beside a red warning chip; his concern stands: the mark must never hide the callsign, a puck a fixed width that never wraps [D296, D289].

## Settled — leave as they are
- Designs of record, in `raptor-port/docs/mock/`: `one-door.html` for `[ONE-DOOR]`, the agent's calls on it approved with it [D322, D309, D310]; `post-out.html`, trimmed to say each thing once, for `[POST-OUT-OUTCOMES]` and for the guest mark when `[XFER]` is built [D299, D300, D981, D1105, D296].
- Designs of record, there too: `new-person-account.html` for `[ACCOUNTS-NEW-PERSON]`, the post-in date added, approved as drawn — a change he names later is a new ruling; its add's "On the roster" gave way to the one door's "Add a person" [D224, D308, D322]; `2026-11-05-postout-bell/` (pictures 4 and 6) for the bell's line, its ring 8px outside the row kept as built [D1690, D1694].
- The post-out and one-door look cards' answers, as built [D328, D303, D304, D306, D307, D325].
- Quals' buttons as built: one row, "✎ Edit" and "Done", "Edit quals" grey until pressed [D935, D1128, D1129].
- Edit Schedule's "Publish AL1", which a member sees looking pressable only through this PC's developer route, is left as it is: no member reaches the page anywhere else, every change he tries there is refused [D1658].

## From other areas (each stated on its own area's file)
- The Leave War's (postings, Management, SANS, Quals as its source, its controls, the pinned rows, filing): D1555, D1545, D1541, D1521, D1447, D1460, D1502, D1200, D1149, D1223, D1215, D1221, D461, D460, D1692, D1697, D1698, D1711, D1446, D1728, D1729, D1730, D1720, D1326, D1173, D1542, D1789, D1850, D1388, D1398.
- The scheduler's (a published day's keep, the delete's lines, the puck, the sign-offs, the history, bell lines taken back, the date calendar, one seat, a shared input): D44, D45, D103, D337, D710, D186, D212, D169, D338, D1693, D1699, D1710, D1589, D796, D797, D1099, D762, D660.
- The Tracker's: D981, D376.
- The Inputs pages' (Quals' drag, filing): D893, D655, D658, D763.
- The design file's (the waiting screen, the failed-save band, TALON, no glow, the delete card, the phone pinch, the pencil, the search box, undo to a row): D1649, D1650, D1654, D1656, D1657, D1664, D1590, D1606, D1608, D887, D1614, D1627, D1628, D1567, D1134, D1127, D672.
- How we work's (a scheduler always an admin, the one undo, "Clear edit history…", the security read, the type setting, the hosting trial, the one table): D785, D350, D148, D1752, D1411, D1536, D1537, D1532, D1682, D1662, D1749, D1571, D473, D1587.
