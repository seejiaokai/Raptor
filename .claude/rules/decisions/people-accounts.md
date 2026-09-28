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
  - raptor-port/src/engine/slots.ts
  - raptor-port/src/engine/schema.ts
  - raptor-port/src/leavewar/sync.ts
  - raptor-port/src/leavewar/engine/people.ts
  - raptor-port/src/leavewar/engine/stages.ts
  - raptor-port/src/leavewar/state/**
  - raptor-port/src/leavewar/ui/BidPicker.tsx
  - raptor-port/src/leavewar/ui/Matrix.tsx
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

# Rulings — People & accounts

**Loads by itself** whenever a session reads an accounts, sign-in, Admin → Users, Quals, one-door or posting file (the
`paths:` at the top of this file) — **and open it yourself before PLANNING such work**, before any of those files is
open (`.claude/rules/doc-structure.md`). Its rulings moved here from How we work and the scheduler file on 28 Sep 26
(D390); the general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of every
ruling and how to add or retire one: `DECISIONS.md`.

**One line per ruling — its number, its date, the rule as it stands** (D390). **Its full row** — his words, the
readings he was told, where it lives — is in `.claude/decisions-full/people-accounts.md`, never loaded by itself:
**open it before acting on a ruling's detail or asking him about it** — `grep -h '^| D323 |' .claude/decisions-full/*.md`
(the shell; the Grep tool hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.
**Also read** — the Leave War's posting sheets and stints: `leave-war.md` (§Architecture); what a published day keeps
when a man is deleted or archived: `scheduler.md` (D44, D45).

| # | Date | The rule |
|---|---|---|
| D329 | 28 Sep 26 | AN ARCHIVED MAN'S ROW SAYS HOW HE CAME TO BE ARCHIVED AND WHEN |
| D328 | 28 Sep 26 | AN EARLIER STINT'S DATES ARE READ-ONLY ON THE LEAVE WAR, AS BUILT |
| D327 | 28 Sep 26 | AN ARCHIVED MAN STAYS IN THE ALL AVAIL CROWD ON EVERY DAY BEFORE HIS ARCHIVE — THE CROWD ON A DAY ALREADY PUBLISHED STAYS AS IT WENT OUT, AND NOTHING READS PENDING FOR IT. |
| D326 | 28 Sep 26 | A MAN WHOSE POSTING OUT HAS RUN AND LEFT HIM ON THE ROSTER SHOWS "POSTED OUT <DATE>" ON HIS ADMIN → USERS ROW |
| D325 | 28 Sep 26 | A HIDDEN SANS MAN, ONCE ARCHIVED, SHOWS ON THE LEAVE WAR WITH HIS MONTHS HERE, WHATEVER SHOW SANS SAYS — AS A DELETED MAN DOES (D299). |
| D323 | 27 Sep 26 | ARCHIVE ON ADMIN → USERS IS "POSTED OUT FROM TODAY" ON THE LEAVE WAR — HIS PAST KEPT. |
| D322 | 27 Sep 26 | The one-door mock-up is the design of record for [ONE-DOOR]: Admin → Users lists every person A–Z with a Sign-in and a Roster dot, a row opens his actions, the archived fold at the foot; Restore asks the post-in date; a welcome-back note on his first sign-in; Quals loses its ✕ and archived list. |
| D321 | 27 Sep 26 | The post-out look card's answers stand as built: a SANS posting moves his whole Leave War row into the SANS group; a day he is named on reads pending once he is archived (the ALL AVAIL crowd before his archive keeps him, D327); a posting out is no Undo step; leave or OIL may still be added on a deleted man's past days. — changed by D327 |
| D320 | 27 Sep 26 | THE LEAVE WAR KEEPS EVERY STINT A MAN HAS IN THE SQUADRON, NOT ONE IN-AND-OUT WINDOW. |
| D310 | 27 Sep 26 | ONE DOOR, AS PROPOSED: ADMIN → USERS SHOWS EVERY PERSON'S SIGN-IN AND ROSTER STATE AND CARRIES EVERY ACTION; QUALS LOSES ITS ARCHIVE. |
| D309 | 27 Sep 26 | HIS DIRECTION: ONE DOOR — ADMIN → USERS SHOWS EACH PERSON'S WHOLE STATE (SIGN-IN AND ROSTER, A GREEN OR RED DOT EACH) AND CARRIES EVERY ACTION ON IT. |
| D308 | 27 Sep 26 | WHEN SOMEONE IS POSTED IN, THE APP ASKS THE ADMIN FOR HIS POST-IN DATE, SO THE LEAVE WAR IS RIGHT; HIS ACCESS CAN START A FEW DAYS BEFORE IT. |
| D307 | 27 Sep 26 | ENABLE ON ANY SUSPENDED MAN SHOWS THE "HE'S BACK — CHECK HIS QUALS AND CAT" NOTE, NOT ONLY ONE BACK FROM AN OVERSEAS POSTING |
| D306 | 27 Sep 26 | A POSTING THAT WOULD LEAVE NO ADMIN ABLE TO SIGN IN WAITS, WHOLE, UNTIL ANOTHER ADMIN CAN |
| D305 | 27 Sep 26 | A man back from overseas can update his own quals: Restore puts him back on the roster with his sign-in on, and his first sign-in after it shows "Welcome back — check your quals and CAT" with a button to his own Quals row. — changed by D322, D310 |
| D304 | 27 Sep 26 | A DELETE COUNTS FROM THE REAL CALENDAR DATE, AS BUILT. |
| D303 | 27 Sep 26 | A POSTING WITH NO CHIP CHOSEN STAYS: "OFF THE MANPOWER, NOTHING ELSE". |
| D301 | 27 Sep 26 | [POST-OUT-OUTCOMES] started before PR #443 merged, on a new branch cut from claude/accounts-new-person, with its own FULL check; its "merge live" comes only after #443's. |
| D300 | 27 Sep 26 | THE POST-OUT SHEET SAYS EACH THING ONCE: THE DATE IN ITS BOX, ONE LINE FOR WHAT HAPPENS ON IT ("On 14 Oct: archived on Quals, account suspended."), AND A BUTTON THAT READS JUST "POST OUT". |
| D299 | 27 Sep 26 | A delete takes him out of today and the future while the past keeps its record of him — his pucks on days flown, his past leave and OIL, his inputs and signatures, the history; the post-out mock-up, trimmed to say each thing once (D300), is the design of record for [POST-OUT-OUTCOMES]. — changed by D300 |
| D298 | 27 Sep 26 | THE POST-OUT CHIP READS "DELETE", NOT "FULLY DELETE". |
| D297 | 27 Sep 26 | A MAN DELETED FOR LEAVING FLYING FOR GOOD KEEPS HIS PUCK ON EVERY DAY HE ALREADY FLEW — PUBLISHED OR NOT — AND IS TAKEN OFF EVERY DAY STILL TO COME |
| D296 | 27 Sep 26 | A GUEST FROM ANOTHER COMMUNITY IS MARKED BY AN ORANGE CORNER ON HIS PUCK (option A). |
| D295 | 27 Sep 26 | An archived man can be renamed directly — on Admin → Users' archived list since the one door (D310); when Restore meets a callsign a man on the roster holds, it offers the rename on the spot. — changed by D310 |
| D294 | 27 Sep 26 | The post-out choices are four short chips — "Overseas Sqn", "Delete" (first "Fully delete", D298), "SANS", "Transfer to Sqn" — with one short line saying what the chosen one does on the date; the "he's back" line lines up with the page's left edge. — changed by D298 |
| D293 | 27 Sep 26 | NO "SIGN UP" BUTTON ON THE SIGN-IN PAGE. |
| D292 | 27 Sep 26 | AN ADMIN CAN SWITCH HIMSELF TO THE MEMBER VIEW AND BACK, BY TAPPING HIS NAME BADGE. |
| D291 | 27 Sep 26 | [POST-OUT-OUTCOMES] is built next, before [DRAFT-PENDING], on its own branch with its own FULL check — started before PR #443 merged, on a branch cut from it (D301). — changed by D301 |
| D290 | 27 Sep 26 | A MAN DELETED FOR LEAVING FLYING FOR GOOD (D287) IS KEPT UNDERNEATH AS A HIDDEN "DELETED" MARK — never erased. |
| D289 | 27 Sep 26 | A COMMUNITY IS THE SQUADRONS FLYING ONE AIRCRAFT TYPE (F-15, F-16), AND A GUEST FROM ANOTHER COMMUNITY IS ALWAYS MARKED AS ONE. |
| D288 | 27 Sep 26 | CALLSIGNS ARE UNIQUE WITHIN A COMMUNITY, NOT ACROSS THE APP. |
| D287 | 26 Sep 26 | A man who leaves flying for good is deleted — his account and his person, from every list and every day still to come — while every day he already flew keeps his puck (D297) and the past keeps his record (D299); he is kept underneath as a hidden mark (D290); the delete asks twice. — changed by D299, D297, D290 |
| D286 | 26 Sep 26 | AN ARCHIVED MAN'S CALLSIGN MAY BE GIVEN TO A NEW PERSON. IF THE ARCHIVED MAN IS LATER RESTORED WHILE HIS CALLSIGN IS IN USE, ONE OF THE TWO MUST BE RENAMED FIRST. |
| D285 | 26 Sep 26 | THE ACCOUNT BUTTONS READ "SUSPEND" / "ENABLE" AND "DELETE ACCOUNT". |
| D284 | 26 Sep 26 | A MAN BACK FROM OVERSEAS RETURNS AS HE WAS — HIS QUALS KEPT — AND THE APP PROMPTS THE ADMIN TO UPDATE THEM. |
| D283 | 26 Sep 26 | A MAN POSTED OUT AS SANS: ON THE POSTING-OUT DATE HE BECOMES SANS. WITH "SHOW SANS" OFF, THE LEAVE WAR STILL SHOWS HIM, MARKED POSTED OUT, AND DOES NOT TRACK HIS LEAVE; WITH "SHOW SANS" ON, HE MOVES INTO THE SANS GROUP THAT DAY AND HIS LEAVE IS TRACKED THERE. |
| D282 | 26 Sep 26 | NEIGHBOURING SQUADRONS PLAN EACH OTHER'S PEOPLE AS A MATTER OF COURSE — not only while a man is being posted. |
| D281 | 26 Sep 26 | A posting to another squadron will be a transfer — future, with the multi-squadron database; neighbouring squadrons may plan each other's people as a matter of course (D282), while his leave, quals and account stay his own squadron's. — changed by D282 |
| D280 | 26 Sep 26 | An account can be suspended and enabled again (a man away, then back) and deleted (a man who leaves flying for good) — a delete now takes the person too (D287). — changed by D287 |
| D229 | 26 Sep 26 | A posting out has four outcomes; the admin picks one and the app does it on the posting-out date: overseas to another squadron → archived, account suspended (D280); leaving flying for good → deleted, person and account (D287); another workplace but still flies → SANS (D283); transferred to another squadron → future (D281). — changed by D287, D283 |
| D227 | 26 Sep 26 | EACH ADMIN'S BELL IS HIS OWN (D216's "he" read per admin). |
| D226 | 26 Sep 26 | THE CALLSIGN/NAME STAYS AT 14 LETTERS, AND THE BOX SAYS SO — IT NEVER QUIETLY CUTS A NAME. |
| D225 | 26 Sep 26 | INITIALS ARE ASKED BUT NEVER REQUIRED — on the sign-up and on Admin → Users' New person alike. |
| D224 | 26 Sep 26 | The new-person mock-up is the design of record for [ACCOUNTS-NEW-PERSON]; the work is planned by Opus 5.5, the plan red-teamed by Fable and Astra, then built, walked and FULL-checked, then his look and "merge live". |
| D223 | 26 Sep 26 | THE SIGN-IN KEEPS ITS PASSWORD BOX UNTIL THE DATABASE STEP |
| D222 | 26 Sep 26 | ON THE SIGN-UP CARD ONLY, THE FIRST FIELD READS "DISPLAYED CALLSIGN/NAME" |
| D221 | 26 Sep 26 | WITH GUEST ACCESS ON, THE WAITING SCREEN OFFERS A BUTTON INTO THE GUEST VIEW |
| D220 | 26 Sep 26 | THE SEAT CHOICE READS "PILOT" AND "WSO" |
| D219 | 26 Sep 26 | The field that names a person reads "Callsign/Name" — one field, the label on his puck — wherever it is asked or headed; on the sign-up card it reads "Displayed callsign/name" (D222). — changed by D222 |
| D217 | 26 Sep 26 | One door for a new person: Admin → Users (the sign-in may be blank for someone who will not use the app); Quals keeps quals, CAT, flight and initials — archive and restore moved to Admin → Users too (D310). — changed by D310 |
| D216 | 26 Sep 26 | A NEW ACCESS REQUEST NOTIFIES THE ADMINS |
| D215 | 26 Sep 26 | A GUEST SEES WHAT A MEMBER SEES ON VIEW-ONLY SCHED, READ ONLY |
| D214 | 26 Sep 26 | ADMIN → USERS CAN CREATE A BRAND-NEW PERSON WITH HIS ACCOUNT, IN ONE STEP |
| D213 | 26 Sep 26 | A GUEST SEES A MEDICAL INPUT AS MEMBERS DO — its type and remarks on the published schedule. |
| D211 | 26 Sep 26 | Every member sees a medical input's type, remarks and documents, as today — setting aside the database brief's "person and admins only"; a guest sees them too (D213). — changed by D213 |
| D210 | 26 Sep 26 | [ACCOUNTS] gets its own full check before the changes window ([DRAFT-PENDING]) is built on it; the window gets its own later — amending D173 in part. |
| D204 | 26 Sep 26 | A new user joins either way: the admin adds him first (defence mail, callsign, member or admin), or he signs in and asks ("Request access") and an admin approves and links him to a puck; while waiting he sees a waiting screen, and an admin switch — off by default — can let him view read-only as a guest. |
| D200 | 26 Sep 26 | [ACCOUNTS] carries the permissions work: D149 built (a member edits his own Quals row only); the data model's permissions table (§11) matches every ruling; one place in the app answers "may this person do this?", tested against that table. |
| D218 | 26 Sep 26 | ON QUALS ONLY AN ADMIN CHANGES A CALLSIGN. |
| D166 | 25 Sep 26 | Accounts are built in the app now, shaped as the real thing: the Admin tab manages accounts, each tied to one callsign; signing in makes you that callsign ("View as" goes); the Leave War follows the signed-in callsign; records name the callsign; an admin may switch himself to the member view and back (D292). — changed by D292 |
| D165 | 25 Sep 26 | HIS PLAN FOR ACCOUNTS AT THE DATABASE STEP: EVERYONE SIGNS IN WITH THEIR OWN DEFENCE MAIL ACCOUNT; AN ADMIN (HIM) CREATES EACH PERSON IN THE APP — callsign, name, admin or member — AND TIES IT TO THAT PERSON'S DEFENCE MAIL ADDRESS; "VIEW AS" GOES AWAY, because every account already IS a callsign. |
| D149 | 24 Sep 26 | On Quals a member edits his own row only — every column of it — never another person's; the callsign is an admin's to change (D218). — changed by D218 |
