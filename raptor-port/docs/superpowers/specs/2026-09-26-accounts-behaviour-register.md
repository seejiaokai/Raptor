# Behaviour register — `[ACCOUNTS]` (26 Sep 26)

One line per rule the build obeys, in the app's words, with its ruling and the test that names it. `npm run rulecheck`
fails when a line here has no test naming its id (`raptor-port/scripts/rulecheck.mjs`). Plan:
`docs/superpowers/plans/2026-09-26-accounts-plan.md`.

| Id | The rule | Ruling | Named by |
|---|---|---|---|
| AC1 | The sign-in stands for the defence-mail sign-in: the two seeded sign-ins keep their passwords (a wrong one refused), an added account takes any password, and no password is ever written to a stored record | D166 (2), 24 Aug 26, data-model §3 | `state/accounts.test.ts` |
| AC2 | Signing in makes you that callsign; every "who" names it; the Leave War follows the signed-in person, never unscoped for a session | D166 (3)–(5) | `state/accounts.test.ts` |
| AC3 | A new user joins either way: on no list he asks once, as himself, giving what the admin's New person form asks (callsign/name, initials, pilot / WSO / personnel, CAT — `[ACCOUNTS-NEW-PERSON]`, D214), and waits; the admin approves (linking a puck he picks — a typed callsign never claims one — or making a new person from the request, NP5) or declines; the guest switch is off by default | D204, D214 | `state/accounts.test.ts` |
| AC4 | The guards: an admin never changes his own account; at least one admin always keeps access; one person one account; one sign-in name one account; an archived callsign keeps its account | D166, D204 (the agent's readings, on the look card) | `state/accounts.test.ts` |
| AC5 | The accounts load safely: loading never writes; a list with no admin gets the seed admin added, and the seed admin wins any collision; bad entries are dropped | Fable R2-6, Astra R3-4 | `state/accounts.test.ts` |
| AC6 | An account change is one command; its keys roll back together | Astra R2-3 | `state/accounts.test.ts` |
| AC7 | A member's command changes only his own records; a guest files nothing | D200 (3), D149 | `state/accounts.test.ts`, `state/quals-write.test.ts` |
| AC8 | On the Quals page a member edits his OWN row, every column but the callsign (an admin's, D218); never another's; an admin any | D149, D218 | `state/quals-write.test.ts`, `ui/quals.test.tsx` |
| AC9 | The Leave War's own writers agree with the permissions table | D200 (3) | `leavewar/permsparity.test.ts` |
| AC10 | No "View as", no role toggle; the badge names the signed-in person | D166 (3) | `ui/accounts-ui.test.tsx` |
| AC11 | The access screens: request access (the four fields — NP4), waiting (what he gave, in one line), switched off — each with Sign out; waiting, with the guest switch on, one tap into the guest view | D204, D221, D214 | `ui/accounts-ui.test.tsx`, `ui/accounts-newperson.test.tsx` |
| AC12 | The guest sees what a member sees on View-only Sched, read only and walled off — a medical input in full | D204, D213, D215 | `ui/accounts-ui.test.tsx` |
| AC13 | Admin → Users: the waiting count on the Admin tab, approve, add, never your own account | D166 (1), D204 | `ui/accounts-ui.test.tsx` |
| AC14 | One place answers "may this person do this?": the app's matrix IS data-model §11, and no file decides authority outside it | D200 (2)–(3), D202 | `state/perms.test.ts`, `state/perms-scan.test.ts` |
| AC15 | Every window closes at a sign-in and a sign-out; the undo list empties | Astra R1-3, D148, 13 Sep 26 | `ui/pops.test.ts`, `state/session-undo.test.ts` |

**`[ACCOUNTS-NEW-PERSON]` (26 Sep 26)** — plan `docs/superpowers/plans/2026-09-26-accounts-new-person-plan.md`; evidence
`docs/handpass/2026-09-26-accounts-new-person.md`.

| Id | The rule | Ruling | Named by |
|---|---|---|---|
| NP1 | A new person is made only on Admin → Users — alone (a blank sign-in) or with his account — and the Quals page's "+ Add person" goes there, New person chosen | D217 | `state/roster-add.test.ts`, `ui/accounts-newperson.test.tsx`, `ui/quals.test.tsx` |
| NP2 | The one add keeps the one callsign rule: a callsign that is anyone's (callsign or id, archived and the placeholders included) is refused with its reason; only a real archived person is pointed at Restore | D214, PID-01 (14 Sep 26) | `state/roster-add.test.ts` |
| NP3 | A new person with his account is ONE step: both are made or neither (one command, one storage group), and a refusal inside still says why | D214 | `state/accounts.test.ts`, `state/roster-add.test.ts`, `state/txn-wiring.test.ts` |
| NP4 | The sign-up asks what the admin's form asks — displayed callsign/name, initials (never required), pilot / WSO / personnel, CAT — and refuses a missing pick or an over-long name with its reason, never cutting it; it never tells a person not yet let in whether a callsign is taken | D214, D222, D225, D226, D204 | `state/accounts.test.ts`, `ui/accounts-newperson.test.tsx` |
| NP5 | Approving offers New person, filled from the request, the admin's corrections winning; a typed callsign that is someone's opens "On the roster", named by his callsign, and is never picked for the admin; Cancel discards | D214, D204 | `state/accounts.test.ts`, `ui/accounts-newperson.test.tsx` |
| NP6 | A new request lights each admin's bell until HE has had the waiting list on screen (the phone's category list does not count); a member's never; the tap goes to Admin → Users first, from any page | D216, D227 | `state/accounts.test.ts`, `ui/accounts-newperson.test.tsx` |
| NP7 | The words: "Callsign/Name" (sign-up card: "Displayed callsign/name") at 14 letters, said when over — the Quals head, its CSV and every picker; "Pilot", "WSO", "Personnel (ground crew)" | D219, D220, D222, D226 | `state/roster-add.test.ts`, `ui/accounts-newperson.test.tsx`, `ui/quals.test.tsx` |
| NP8 | Only an admin adds a person, approves or marks requests seen — at the function, the command gate (every table the command writes) and the ownership check | D200, D217 | `state/perms.test.ts`, `state/accounts.test.ts`, `state/roster-add.test.ts` |
