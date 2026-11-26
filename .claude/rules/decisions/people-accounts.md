---
paths:
  - raptor-port/src/state/auth.ts
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
  - raptor-port/src/leavewar/ui/OutcomeChips.tsx
  - raptor-port/e2e/*accounts*
  - raptor-port/e2e/*users*
  - raptor-port/docs/engine-rules.md
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/data-model.md
  - raptor-port/docs/data-schema.md
  - raptor-port/docs/handover-dataverse.md
  - raptor-port/docs/architecture-direction.md
  - raptor-port/docs/**/*accounts*
  - raptor-port/docs/**/*one-door*
  - raptor-port/docs/**/*post-out*
  - raptor-port/docs/**/*new-person*
---

# People & accounts — how it works now

<!-- shape: page -->

Loads by itself with any accounts, sign-in, Admin → Users, Quals, one-door or posting file (the `paths:` above). Each line is a rule as it stands, its rulings after it; his words, the agent's readings told to him (never stated here as his rule), dates and history are in the full rows, `.claude/decisions-full/people-accounts.md` — open the row before acting on a rule's detail or asking him about it. Other areas' rulings: pointers at the end, each stated on its own page; the map: `DECISIONS.md`.

## Accounts and signing in
- Accounts are built in the app as the real thing: the Admin tab creates and manages them, each tied to one callsign (the person), admin or member; signing in makes you that callsign — no "View as" another person, every account already a callsign; the Leave War follows the signed-in callsign [D166, D292, D165].
- Until the database step the password box stays, only the two seeded sign-ins check it, no password stored [D166, D292, D223].
- His database-step plan: everyone signs in with his own defence-mail account; an admin creates each person — callsign, name, admin or member — tied to his address [D165].
- No "Sign up" button: signed in and on no list, he lands on "Request access" by himself [D293].
- An account can be suspended — away overseas with another squadron he cannot sign in; back, an admin enables it — and deleted, for a man who leaves flying for good, the person going too (below) [D280, D287, D290, D297, D299, D1102, D981, D300, D1105].
- The buttons read "Suspend" / "Enable" (for "Switch off / Switch on"); the approved "Delete account" reads "Delete" since the one door [D285, D310, D2634, D322].

## How a person joins
- Either way: the admin adds him first — defence mail, the puck (callsign) it belongs to, member or admin — and his first sign-in has that access; or he signs in on no list and asks with "Request access", and an admin approves, sets member or admin and links him to a puck; until then he sees only the waiting screen [D204, D2239].
- Request access and Admin → Users' New person — a brand-new person and his account in one step — ask the same [D214, D224, D204, D322, D2239].
- Waiting, he sees only the waiting screen until his squadron's admin approves him; no guest view, switch or button into it (to be removed) [D2239, D204].
- Every member sees a medical input's type, remarks and documents, as today — the database brief's "the person and admins only" set aside [D211, D1536, D1537]; a View holder, another squadron's on its View-only Sched [D2387, D211].
- A new request notifies the admins beyond the Admin tab's count [D216, D204, D2239]. Each admin's bell is his own [D227, D216].
- Initials are asked, never required — sign-up and New person alike [D225, D214]. The callsign/name stays at 14 letters — never quietly cut [D226].
- The field that names a person reads "Callsign/Name"; on the sign-up card only, "Displayed callsign/name" [D219, D222]. The seat reads "Pilot" and "WSO" [D220].

## Roles and permissions
- An admin switches to the member view and back by tapping his name badge [D292, D166].
- One place in the app answers "may this person do this?", mirroring the data model's permissions table (§11), which matches every ruling, a test failing when the two disagree; built with `[ACCOUNTS]`, a test per column [D200, D149, D218, D1510, D1651, D1589].
- The database's security roles are the agent's to design at the database step, not before — each table's permissions per role, row ownership set by the app, the protected columns, what stands in for a rule a role cannot hold; IT enters them, a member-only account tests them; IT's 8 Nov 26 answers (database rights theirs, who may do what the app's roles) are put to him, `[DB-SECURITY-ROLES]` [D1653].
- Three levels: a few master admins (developers, into the database directly), admins, members; both admin levels create accounts and set rights, not IT [D1971].
- A master admin is never made a member while he holds the mark: refused, "Saber is a master admin — take that off first"; on the redesigned row, picking Member is itself taking master admin off, a master admin's alone [D2260, D2303].
- Always "master admin", on screen and to him, never "master" alone; where a master admin may act for a squadron, so may an admin with Plan of it, both named — giving or taking Plan itself apart (below) — a "who can" line: "an admin of 149" [D2240, D2241, D2626, D2201, D2336].

## Admin → Users — the one door
- His direction, built as proposed: one door — Admin → Users shows each person's whole state, sign-in and roster, and carries every action on him, his postings too — post out and post in, in an interface of its own, beside the Leave War's sheets, which stay — until [PLAN-AHEAD-ACTIVE] makes it their main door too, one sheet [D309, D310, D2345, D2634].
- One row a person, A to Z, a search box; a Sign-in dot and a Roster dot — green on, red off, grey no sign-in; a tap opens his sign-in, role and the buttons for his state — never the signed-in admin's own row, which another admin changes ("Your own row can't be opened"); the list never reorders itself [D322, D310, D2634].
- An archived row opens his callsign box — a rename, "Restore as …" when a roster man holds his callsign — a Post in date opening on today, Restore and Delete [D322, D295, D310, D2634, D308].
- His row shows a posting waiting and "posted out <date>" once a posting out has run and left him on the roster [D326, D322].
- An archived row says how and when, one line [D329].
- No control moves a sign-in to another person, for now [D2266].
- One squadron at a time; a filter button by the search opens tick boxes — seat, CAT, role ("Plans 149", master admin among them) — any tick of a group, groups combined, lit pale blue with its count, as tall as the search box, Inputs' phone button lit the same; the "All squadrons" tick is retired, the squadron picked open and the rest folded for everyone [D2654]; built as drawn 22 Nov [D2270, D2631, D2335, D2306, D2307, D2401].
- Admin → Users serves many squadrons: who from outside holds View or Plan of yours at one look, people moved between squadrons there, shown as Incoming and Outgoing [D2641, D2643]. "Add a person" sits at the top of Admin → Users, so an admin never scrolls down to add people: one "+ Add a person" button beside Filter (full width under the search on a phone) opening the form in place, "Add person" and "Cancel" at its foot [D2599, D2628, D2655, D2638, D2639]; never two add buttons on screen at once — the form redrawn through the design skill and shown first [D2726].
- The multi-squadron build's sections are built as their pages drew them, every open question as recommended: the guard rail, its give-up for a save that never answers filed with the database step [D2729, D2742], Admin → Users across squadrons [D2730, D2806, D2816, D2817], the bell, its colours and Admin → Display [D2731].
- In Admin → Users, to a Plan holder not 149's own admin nor a master admin: "Admin" greyed with one line saying who can, the last-admin note in those words, or "Only a master admin can make another." where the squadron has no admin of its own [D2806, D2730, D2816]; note 5 of "What each role allows" names who gives Plan and makes admins [D2817]; his Undo of making a 149 admin a member refused, saying why [D2807]; 149's admins get a bell line when a Plan of 149 ends by archive, overseas posting, delete or being made a master admin [D2808].
- Admin → Users across squadrons reads: one search at the top filtering every group, a group with no match hidden [D2647]; the own people first, then Incoming and Outgoing, then "From other squadrons", each folding, open by default [D2650]; a way to jump to each heading, desktop and phone [D2651] — under "Users" in Admin's left column, which stays put, and four jump buttons under the search on a phone; round 6's readings as the page wrote them [D2652].
- The guard rail's round-6 answers: the Calendar closes at a pick unless a form of it is half done, an unchanged settings window beside it closing too; show-only windows close; the chart editor closes at the member-view switch; a held input window is given back; the Plan line reaches all who get 149's admin lines [D2654].
- At a pick, of the Leave War's windows a leave filed on Inputs and an OIL award close by themselves; "Open for bidding", a person's window and "OIL TRACKER" refuse for everyone [D2740]; on a phone the Calendar over SANS calendar settings is named first in the note, as for Inputs [D2741]. The note names where unfinished work out of sight is: the Tracker’s Info tab [D2813]; Admin’s Squadrons or Users section, only while the other shows [D2814].
- Quals keeps quals, CAT, flight and initials; its ✕ archive, Archived list, Restore, Restore as and the rename moved to Admin → Users (an archived man renamed by an admin on his archived row, no longer on Quals); Quals' "+ Add person" is a button to Admin → Users; renaming a roster man stays on Quals [D310, D2634, D322, D224, D295, D286].

## Quals
- A member edits his own row only, never another's — every column (initials, flight, CAT, SXO, SANS, every qualification) but three, each an admin's: the callsign, the Management tick, the Scheduler tick; his own Management and Scheduler cells read only, a member's command changing one refused, the Scheduler's at the Quals write and the commit gate [D149, D218, D1510, D1651, D1589].
- The rename stays on Quals, an admin's alone, and stays a label: every puck and his account follow it; the change history and every record of who did something keep the name as it was then, the person underneath (the scheduler's D1589) [D218, D1510, D1651, D1589, D166, D292].
- The buttons are one row at 36, as drawn — the idle date box removed, "Export to Excel" reading "Export" on a phone — and the paragraph under it ("similar to a LoX…", with its links) deleted whole [D935].
- The edit buttons read as Logic's: "✎ Edit" plain grey to start, "Done" bright blue while editing, on every width — for "Enable editing" and "Save changes" ("Save" on a phone), what each does unchanged: changes kept as made, "Done" only ends editing [D1128, D937]. While editing "Edit quals" is plain grey until pressed, as "✎ Edit" is, so "Done" is the one bright-blue button, the way out; pressed it reads "✕ Edit quals", plain, unchanged in what it does — this one button apart from his 5 Aug 26 rule that the thing to press is blue [D1129, D1128].
- Quals opens at its top — its buttons in sight — wherever opened from, as the Inputs page does [D937, D1128].
- Its pinned header row follows the table sideways, as the Leave War's pinned date row does, so it keeps up on his iPhone — that row alone, the Leave War's left as it was; both since take the row's place in the frame it reaches the top bar (the Leave War's D1789, D1870) [D993].
- On a phone a pinch zooms the table only — the top bar, "✎ Edit" (then "Enable editing"), Export, the filter and the Pilots · WSOs · Personnel · All switch stay; the heading row and name column stay pinned and lined up; out until the whole width fits, in to twice normal, the zoom kept while he stays on Quals [D1108, D1110, D1128].

## Posting in and stints
- Posted in, the app asks the admin his post-in date, so the Leave War is right; access can start a few days before it; till it he is not ours, SANS and planned or not [D308, D322, D2328].
- The Leave War keeps every stint a man has, not one in-and-out window: posted out and restored with a post-in date he reads "away" between — not in manning or availability, no bids, the posting hatch — his months before the posting as they were, his leave included, counted again from the post-in date; a leave period he is away for all of shows no row for him, one holding his posting-out date shows his days before it as normal [D320, D308].
- The posting sheets are the admin's, open at any time — a posting date is an official date, not a bid — never the man's, as he was told; an earlier stint's dates are read-only, as built: its Post in sheet says "Back from a posting on …" with no Undo, a date aimed into an earlier stint is refused with the reason; the current stint's dates still move, chosen knowing an old stint's wrong date then has no door to correct it [D328].

## Posting out
- A posting the app cannot run for any reason but the last admin shows its amber line on the man's row and rings his squadron's admins' bells once, a tap opening his row; drawn first [D2214].
- Four outcomes; the app does the one picked on the posting date: Overseas Sqn — archived, account suspended, back later; Delete — leaving flying for good, deleted, person and account; SANS — another workplace, still flying with us, he becomes SANS; Transfer to Sqn — to the squadron named, SANS too, by fixed rules (below) [D2136, D2160, D2165, D2163, D229, D1709, D287, D283, D290, D299, D297, D1102, D981, D300, D1105, D1692, D1697, D1698, D2184, D2195].
- Four short chips — "Overseas Sqn", "Delete", "SANS", "Transfer to Sqn" — taking little room; the "he's back" line on Quals lines up with the page's left edge [D294, D298, D1709].
- A ground-crew man cannot be posted out as SANS: no SANS chip for him — the one-day sheet, the posting sheet, the drag window — and the posting writer refuses it; SANS stays an aircrew status, the other outcomes stay his [D1709].
- No chip chosen — the chosen one tapped again — stays "off the manpower, nothing else": posted out on the Leave War from the date, still on Quals with his account open, nothing archived, deleted or made SANS — how a man leaving for another squadron is recorded until Transfer is built; the sheet still opens on Overseas Sqn [D303].
- The sheet says each thing once: the date in its box, one line for what happens on it, a button reading just "Post out"; the "Nothing changes until that day…" line goes, fewer words overall; his example line, "On 14 Oct: archived on Quals, account suspended.", predates the one door — the app writes "On 14 Oct: archived, account suspended." ("archived." with no sign-in), the agent's reading of D310 as built [D300, D1105, D310, D2634]; redesigned as way C, the kind of posting first [D2653].
- Delete's line reads "On <date> the app deletes him automatically, with his account. Days he flew keep his puck.", his row "posting out <date> · auto delete" until the date; the button stays "Delete" [D1105, D298].
- Moving a Delete posting's date to today or earlier asks the Delete button's tap-twice question first, the date not saved until the second tap [D1102].
- A posting that would archive, suspend or delete the last admin able to sign in waits, whole, until another admin can — never half done; said before the confirm and on his account row, it runs by itself once the reason goes [D306].
- A posting out is no step of the Undo button — the sheet's "Undo post out" takes it back; a SANS posting moves his whole Leave War row, earlier months included, where it moves at all (below); an admin may still add leave or OIL on a deleted man's past days [D321, D327, D283, D1692, D1697, D1698].
- Posted out as SANS he becomes SANS on the date: with SANS off the Leave War — no "+ SANS" group — the war still shows him in his old place, his name wearing the purple SANS line, his leave untracked; "+ SANS" on, he moves into the SANS group that day, his leave tracked there [D283, D1692, D1697, D1698, D1221].
- A SANS tick taken off on Quals and later put back counts from the day it is put back — the days between an ordinary man's, the posting's earlier SANS days kept; "Undo post out" wipes the posting's SANS days, an untick or an archive keeps them; the SANS highlight chip goes by who is SANS today, SANS availability by the day filed, so a man posted out as SANS ahead is filed for once it is saved [D2327, D2313, D2340].
- A man counts as SANS only from his SANS date, on every screen, the crew list too: a SANS tick put on or taken off on Quals counts from the day it is made, and a man named on an earlier published day leaves it unchanged [D2313, D2327, D2340]. A hidden SANS man, once archived, shows on the war with his months here, whatever the SANS setting, as a deleted man does, as built [D325, D1221].
- Back from overseas he returns as he was — his Quals kept — and the app prompts the admin to update them — the "he's back — check his Quals and CAT" note on Restore and on Enable of any suspended man, one suspended by hand and never archived too; "fresh" on return — new quals, new Leave War balances, his 13 Sep 26 rule — no longer covers a man archived while overseas [D284, D307].
- His direction: when a posting out runs on its date — archived, deleted, made SANS or transferred — the schedulers are told, so nobody is ever gone silently; his "A": it runs by itself, as before, never waiting for an Accept, and each admin's bell gets one line — the man in bold and the date, then "Posted out" and what the outcome did, "Ranger · Mon 16 Nov / Posted out · archived, account suspended", option B as drawn, not "Posting out" first [D1546, D1547, D1690, D1691].
- A transfer to another squadron, taken back, tells both squadrons' admins, each read line answered as the scheduler page says, naming the other bell lines reaching both — save the SANS reminder, which simply goes [D2215, D2219, D2220, D1693, D1699, D1710, D2194, D2195, D2391, D2423, D2437].
- On the day a person moves squadron his old squadron's bell lines leave his bell, read or unread, never struck later; a line about himself stays and follows him — his own leave undone by the old squadron goes or is struck "taken back", a Redo putting it back — an input line only where he is named in it; a filer who never moved stays told, for a moved named man only on days still the filer's squadron's; a moved filer only as an admin of the man's squadron again; any other take-back is told to whoever would be told today [D2218, D2222, D2223, D2225, D2228, D2194, D2195].
- A man moved while the old squadron's posting out of him is set takes it with him or ends it, the sheet saying which; leave across his move stays one input, changed or removed only by him or an admin of both squadrons [D2221, D2261].
- The 19 Nov drawings' pieces are built as drawn, its questions answered as recommended — the access row now one line per squadron [D2217, D2303].
- The last-admin refusal to someone who cannot make an admin of that squadron says who can — "Hunter is 150's last admin. Only a master admin or an admin of 150 can make another." — and its dated form the same; a master admin or an admin of it keeps the approved words [D2246, D2241, D2336].
- While a squadron has an admin of its own, a Plan holder from another never counts as its last admin: its last own admin stays until another of its own is made; with none of its own, a Plan holder counts, so a new squadron can start; Plan's full access is unchanged [D2247, D2626, D2201].
- An admin of a man's own squadron (at home, by Plan, or a master admin) may make him a member though he holds Plan of another squadron; his Plan ends with it, the last-admin check still guarding that squadron [D2250, D2626, D2199, D2201, D2203].
- A person is told on his own bell whenever his account's status changes — admin or member, suspended or enabled, View or Plan given or ended, master admin made or unmade: what changed and who, "Given Plan of 149: full access to 149 · Saber", a tap opening nothing [D2251, D2200, D2309].
- Nobody moves himself to another squadron — "You can't move yourself to another squadron — ask another admin" — and only a master admin moves a master admin, anyone else told "Only a master admin can do that" [D2249].
- A tap on his bell line opens his row on Admin → Users; a deleted man's line opens nothing — no row left — and stays in the bell as the record, as an input's "Deleted" line does [D1691, D1547, D1690].
- The "off the manpower" line is worked out from the posting as it stands, as built: it moves with the date, goes with an undone posting — a read one answered, the scheduler's rule for every bell line, save the SANS reminder, which simply goes (D2391) — and if the man is archived or deleted by hand later; it is not saved as the others are [D1696, D1693, D1699, D1710, D2391, D2423, D2437]. The blue ring on the Admin → Users row a bell line lands on stands 8px outside the row each side, clear of his name, as built — not on the row's edge as drawn; the drawing check keeps the difference [D1694].

## Archive, restore, callsigns
- Archive on Admin → Users is "posted out from today" on the Leave War, his past kept: normal up to yesterday, leave and OIL kept, "PO" (away) from today, not counted in manning; a leave period wholly after today does not show him; Restore with a post-in date opens a new stint [D323, D320].
- An archived man stays in the ALL AVAIL crowd on every day before his archive — a published day's crowd stays as it went out, nothing pending for it; the working copy reads him by his stints, out from his archive on, a gap before a later Restore out too; a published day he is named on — a seat, a desk — reads "1 pending" until the next amendment [D327, D321].
- His callsign may go to a new person — one held on the roster is still refused; restored while it is in use, one of the two is renamed first: Restore refuses a taken name, never renaming anyone itself [D286, D295, D310, D2634].

## Delete
- A man who leaves flying for good is deleted, account and person; the delete asks twice and names what goes [D287, D290, D297, D299, D1102, D981, D300, D1105, D280].
- Out of today and the future, the past keeps its record, shown only where the past is shown: his puck on every day he flew, published or not; past Leave War leave and OIL; past inputs with their documents; his signatures on published days (CUR CK, SKED CK, PLANNED BY, APPROVED BY); the change history; his Tracker record from finished courses [D299, D297, D981, D300, D1105].
- Goes: account and sign-in; his Quals row from every list, the Archived one included, and every picker; every day still to come, a published day reading pending as any change does; future leave, bids and inputs; his OIL balance; his Leave War row after he left and the war's current views; his place on any Tracker course still running; how long medical records are kept is the organisation's rule, applied at the database step [D299, D297, D981, D300, D1105].
- His callsign is free; a new man taking it, the old days still show the old one — the app knows each by his id; underneath a hidden "deleted" mark, never erased: in the database his row stays, marked deleted, invisible everywhere — the data model's tombstone [D290, D297]. A delete counts from the real calendar date, as built [D304, D297].
- The chip reads "Delete", not "Fully delete" [D298, D285, D310, D322].

## Many squadrons and aircraft types — not built yet
- Every example, table, drawing, scenario and walk of this work considers more than two squadrons — 142, 149, 150 — and one person holding rights in several at once [D2630].
- One app for every squadron and aircraft type (F-15, F-16, F-35), each squadron configuring it inside the app, an aircraft-type setting carrying its rules [D1100, D1101].
- Detachments and squadrons sharing people come at the end, after the F-15 app's faults are fixed; work before then avoids what would have to be redone [D1100, D1101].
- Deployed separately for each aircraft type, each with its own database; the squadrons of one type, detachments included, share that type's database [D1101, D1100].
- Not settled: his 5 Nov 26 direction (below) names one database for many squadrons, not aircraft types, so by its words does not end the split by type; IT's 8 Nov 26 answer (one production environment for code apps, so no database per type today) was put to him, recommended: no change now, settled when a second type joins; `[AIRCRAFT-TYPE-SETTING]`, `[MULTI-SQN-DESIGN]` (the agent's reading) [D1101, D1695].
- His direction: one app, one database for many squadrons — a master admin makes each in Admin, its admins its detachments; a person's one primary squadron is set with his account, "Request access" asking it, telling its admins; an admin may give him others to view only, never at sign-up, filing inputs and leave only in his primary; a day planned half in each of two squadrons [D1695, D2087, D2634, D2093, D2094, D2160, D2165, D2184, D2195].
- A master admin makes squadrons, names each new one's first admin and acts as an admin of every squadron; only a master admin makes another; Admin → Users lists the admin's own squadron, a man of the other found by search or under its closed heading to be given View, nothing else of his row changeable; View shows the other's View-only Sched read only, never its bell [D2629, D2652, D2191, D2093, D2094, D2160, D2165, D2184, D2195, D2198, D2626, D2199, D2250, D2201, D2381].
- To one who may not give it, the row reads "Only an admin of 149 can give access to 149." — one role named once [D2336, D2241].
- On 149's Admin → Users a man of another squadron shows only his callsign, his squadron's grey number, seat, CAT and his 149 access line; his sign-in mail, role, Suspend, Archive and Delete only on his own squadron's page [D2625, D2622]; his short row adds his role in words ("admin") and opens on a press to that one line with Save and Cancel [D2652, D2655].
- Each other squadron is one closed heading at the page's foot, after "From other squadrons", "▸ 142 · 38 people", opening its people grouped; the search finds them too; shown only to whoever may give access to 149 [D2629, D2652, D2635, D2625, D2655]; a master admin sees his own primary open on his own page, the rest folded [D2631, D2654].
- Where roles and access are given, a table says what each role may do: pages down the side, roles across, a tick, "read" or a dash, short numbered notes under it; built as drawn 22 Nov, Role's choices "Member", "Admin", "Master admin" [D2302, D2300, D2305].
- A person's opened row: Role, then one line per squadron — "142 Home squadron", "149 None · View · Plan" — a master admin's "Full access"; a member's Plan greyed, "Plan is for admins only."; on another squadron's page, that squadron's line alone [D2303, D2306, D2625, D2655, D2652].
- "+ New squadron": number, place, first admin picked from existing admins and given Plan, its last admin till it has its own [D2308, D2298].
- Plan ended without a move — taken, made a member, master admin off — takes that squadron's lines off his bell at once; archived or posted overseas, View and Plan end; suspended, they stay [D2310, D2311].
- Squadron config follows the squadron in view, only its admin changing it; a View holder never reaches it [D2317, D2381]; the Tracker follows the squadron picked, no sign-out, unsaved chart changes asked first, at the switch to the member view too [D2395, D2318, D2403, D2596, D2597, D2594], a pick of a View-only squadron too [D2637, D2318].
- His own account's lines read as drawn, no squadron mark [D2319, D2309]; no sign-in, no access to give [D2320]; many squadrons on a phone: the bell's Show buttons one sliding row [D2321].
- A shared computer's next sign-in reloads once the save lands, his name kept [D2322, D2205].
- The squadron number at the top left flashes twice, fading, whenever the squadron in view changes, so he sees it changed — a pick, a bell line, the refresh card, never at sign-in or opening, none at a refused pick; the number only, dimmed to about a third and back twice in about a second; with less motion, white about a second; on a phone after the ☰ menu closes [D2620, D2628, D2655, D2638, D2639, D2642].
- A pick or the switch to or from the member view is refused while a window is open (one only showing things — "Who's available", Changes, Insights, a SANS day, the Leave War's day panel, a Tracker event's details — closes itself), a note saying close it first, unsaved Tracker edits asked at both; where the squadron or his rights change without his press a note asks him to refresh, its button reloading the app, unsaved work lost, said so; the greyed bands have no case left; a change not saved refuses them too [D2403, D2596, D2597, D2594, D2405, D2323, D2389].
- The guard's refusal is the grey "Blocked:" note, under the control pressed on a desktop, at the foot on a phone, "close the open window, then pick 149." [D2590]; the refresh note a shaded card with one Refresh button, "Refresh and sign in again" in this build [D2591]; an opened Admin → Users row with any change not saved counts as a window, and Give access, "+ New squadron" and "Add a person" once something is in them, Add a person's Cancel clearing it all [D2595, D2598].
- At a pick Traffic, Jump to a date, a day's ⓘ and a document still close; the Scheduler Board is no window; Logic's and Quals' edit mode ends; a window left open on a page out of sight refuses, the note naming the page, unless the squadron picked no longer offers it; a lit bell's tap is refused as a line is; a save in flight is waited for until it lands or shows "Not saved" [D2627].
- The notes name the way out — "save or cancel the open row", "press Retry to save your changes" — one reason at a time, window, row, Retry, before the Tracker's question; a refused bell line stays unread, its list open; the squadron list opens and the one pressed is refused, the ☰ menu closing; the note under the control wherever the top bar shows the picker, at the foot from the ☰ menu, over Inputs settings or the Calendar too [D2627, D2590].
- A button bringing his own squadron back is refused as a pick is; a holiday's bell line brings its squadron into view first; unsaved chart edits are asked at the member-view switch both ways [D2627, D2621].
- Group B of the guard rail's questions (Logout, Undo, the refresh card) is put to him after Build 1, the agent reminding him; none of it built before [D2636].
- Logout is never refused: the open window's question, then the Tracker's, one at a time [D2592]; Undo and Redo reach only the squadron in view, the greyed Undo saying why [D2593, D148]; an unsaved change ("Not saved") refuses a pick, the view switch and a bell line till Retry saves, Logout asking, the "Not kept" band never blocking [D2594].
- Batch 1's second-half questions (c)–(p) as Fable's questions page recommends, new words drawn first; the filter's Plans tick stays as built [D2396, D2400, D2402].
- A request is answered only by its squadron's admins [D2324], a bell tap moving him there [D2325]; an Undo of access reads "Undid: Plan of 149 given · Hunter" [D2326], of a role change each thing it takes back in the bell's words, "Undid: Made a member, Plan of 149 ended · Hunter" [D2402].
- A squadron's admins make admins of their own squadron only, never of another; another squadron is View only, unless he is given Plan (below) [D2626, D2192, D2629, D2652, D2191, D2198, D2199, D2250, D2201].
- View never reaches another squadron's Inputs, Quals, Logic, Leave War or Tracker, even read only — a master admin and a Plan holder work there as its admins [D2252, D2132, D2197, D2626, D2201, D2629, D2652, D2191, D2198, D2199, D2250, D2381].
- With a squadron he only views picked, member or admin, he is offered its View-only Sched and Help alone; his own squadron picked brings all back [D2381, D2252].
- In the member view a Plan holder or master admin is a member of his own squadron with View of what he could edit: on that schedule he stays, as a View holder [D2253, D292, D2252, D2381].
- A master admin edits every page of every squadron: a squadron picked in the "Schedules" menu moves every page to it, Admin → Users too; his own inputs and leave stay filed in his primary [D2197, D2132, D2629, D2652, D2191, D2198, D1695, D2626, D2199, D2250, D2201].
- Separate squadrons, separate views: what belongs to a squadron is seen only on it, unless a man is deliberately planned onto another (borrowing) [D2622]; Help's bug reports one list for every admin, each wearing its squadron's grey number on its title line (colour only on the bell's), its bell ringing that squadron's admins and a master admin [D2623, D2628, D2655, D2638, D2639].
- On another squadron "+ Input" offers only its men, starting empty; "+ Commitment" only its SANS aircrew, greyed with its reason where it has none; "Welcome back" shows only at home; the name badge reads "View only" where he can only look, "Admin" where he holds Plan; a sign-off box's name from another squadron wears its grey number (colour only on the bell's) [D2628, D2638, D2639]; the sign-off boxes and "+ Input"'s Person list stay the browser's own list, as his iPhone shows them, no app-drawn drop-down [D2646]; where he only views the badge is plain words, no switch [D2655].
- Another squadron picked, the Inputs page lists none of his own inputs of a squadron he can still pick — a moved man still sees his old ones; a bell line about one brings its squadron into view first [D2621].
- The Schedules menu: a tick on the squadron in view, a grey "Your squadron", "View only" or "Full access" beside each; rows 38 high on an iPhone too [D2301, D2304]; the ☰ menu opens with the TALON mark as the same drop-down, no chips, its list opening under it in the menu, which stays open after a pick; a grey line under it saying his access, one squadron too [D2382, D2383, D2384].
- A master admin's bell carries his primary squadron's lines by default, every other squadron's off, his to switch on (the agent's reading) [D2198, D2629, D2652, D2191, D227, D2626, D2199, D2250, D2201].
- Each person chooses which notifications reach his bell, a few that need him to act always on; built after the multi-squadron batches, drawn first [D2200, D2198].
- A named admin may be given "Plan" of another squadron — on his row in Admin → Users, off by default, given and taken away by that squadron's own admins or a master admin, never passed on by a Plan holder, its admins told on the bell; ended too by his move or by his own squadron's admin making him a member: full access to it, as its own admins have, the row's line saying so in plain words, not by that comparison [D2211, D2626, D2199, D2250, D2201, D2192, D2629, D2652, D2191, D2198, D785].
- While he holds Plan his bell carries that squadron's admin lines, on by default, his to switch off; with more than one squadron shown every line wears its squadron, his home's too — the number first on the line, in its squadron's colour as its Show button wears it, the unread dot staying blue; each admin picks his own colours on Admin → Display, colour and brightness sliders with a live preview, Display built as sections to grow, no warning when colours are close, the admin judges [D2202, D2624, D2628, D2655, D2638, D2639, D2640, D2198, D2649].
- A person who moves to another squadron loses every View and Plan he held of others [D2203, D2087, D2634].
- Only a master admin changes a master's account; a sign-in waits for the last person's pending save, drawn first [D2205].
- The transfer: only a posting out — the Leave War's or Admin → Users' — moves his primary squadron, on its date. Neighbouring squadrons plan each other's people as a matter of course, not only during a posting [D281, D2087, D2634, D282, D1100, D1101].
- A callsign held by another squadron's archived man: the note names it, seat, CAT and date archived; "it's him" asks that squadron's admins on their bell to bring him back and move him, the request waiting; "someone new" adds him at once, its admins asked to delete the old one if he has left; "it's him" waits for the Transfer build, the note till then "If this is him, ask 142's admin" [D2632, D2633, D286]; "Someone new" only answers, the form's "Add person" adds [D2655].
- A community is the squadrons flying one aircraft type (F-15, F-16): callsigns unique within a community, not across the app; a guest flyer from another community is always marked — an orange corner on his puck (option A) [D288, D289, D296].

- A dedicated check of all built and planned so far for an admin with Plan left out or let in wrongly, its faults fixed before the reshape build [D2242].
- At a move, built at the Transfer step, new words drawn first: held schedule windows say his sentence naming the page; a course, medical or Delete across it its own sentence; 149's war starts him empty and 142's keeps counting his hidden leave until his leave is carried; the mover may take it back before its day; a meeting naming him stays where filed; a group OIL credit gives the lawful ones, naming who was left; Balances gets the band [D2265].
- On a man's move: an ALL AVAIL meeting stays where filed, as does one naming him [D2265]; sign-off boxes offer the day's people, and after them, in SKED CK, PLANNED BY and APPROVED BY, a Plan holder of the squadron and a master admin who carry the Scheduler tick [D2245]; no one puts his leave in his old war after it; his View and Plan end at his move day's start; his old war's row striped from then, the new one's before; an open window gets the drawn band at midnight [D2243].

## Settled — leave as they are
- Designs of record, in `raptor-port/docs/mock/`: `one-door.html` for `[ONE-DOOR]` [D322, D309, D310]; `post-out.html` for `[POST-OUT-OUTCOMES]` and for the guest mark when `[XFER]` is built [D299, D300, D981, D1105, D296].
- Designs of record, there too: `new-person-account.html` for `[ACCOUNTS-NEW-PERSON]` [D224, D308, D322]; `2026-11-05-postout-bell/` (pictures 4 and 6) for the bell's line [D1690, D1694].
- The post-out and one-door look cards' answers, as built [D328, D303, D304, D306, D307, D325].
- Quals' buttons as built: one row, "✎ Edit" and "Done", "Edit quals" grey until pressed [D935, D1128, D1129].
- Edit Schedule's "Publish AL1", which a member sees looking pressable only through this PC's developer route, is left as it is: no member reaches the page anywhere else, every change he tries there is refused [D1658].

## From other areas (each stated on its own area's file)
- The Leave War's (a posting and his leave, the Management tick, SANS on the war, Quals as its one source, its row and bid controls, a member's filing): D1555, D1545, D1541, D1521, D1447, D1460, D1502, D1200, D1149, D1223, D1215, D1221, D461, D460, D1692, D1697, D1698, D1711, D1446, D1728, D1729, D1730, D1720, D1326, D1173, D1542, D1789, D1388, D1398.
- The scheduler's (the published day, the delete's lines, sign-offs, the history, bell lines, the date calendar, one seat, a shared input): D44, D45, D103, D337, D710, D186, D212, D169, D338, D1693, D1699, D1710, D1589, D796, D797, D1099, D762, D660.
- The Tracker's: D981, D376.
- The Inputs pages' (Quals' drag, filing): D893, D655, D658, D763.
- The design file's (the waiting screen, the failed-save band, TALON, no glow, the delete card, the pinch, the pencil, the search box, undo): D1649, D1650, D1654, D1656, D1657, D1664, D1590, D1606, D1608, D887, D1614, D1627, D1628, D1567, D1134, D1127, D672.
- How we work's (a scheduler always an admin, the one undo, "Clear edit history…", the security read, the type setting, the hosting trial, the one table): D785, D350, D148, D1752, D1411, D1536, D1537, D1532, D1682, D1662, D1749, D1571, D473, D1587.
