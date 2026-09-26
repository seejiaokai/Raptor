# Behaviour register — `[ACCOUNTS]` (26 Sep 26)

One line per rule the build obeys, in the app's words, with its ruling and the test that names it. `npm run rulecheck`
fails when a line here has no test naming its id (`raptor-port/scripts/rulecheck.mjs`). Plan:
`docs/superpowers/plans/2026-09-26-accounts-plan.md`.

| Id | The rule | Ruling | Named by |
|---|---|---|---|
| AC1 | The sign-in stands for the defence-mail sign-in: the two seeded sign-ins keep their passwords (a wrong one refused), an added account takes any password, and no password is ever written to a stored record | D166 (2), 24 Aug 26, data-model §3 | `state/accounts.test.ts` |
| AC2 | Signing in makes you that callsign; every "who" names it; the Leave War follows the signed-in person, never unscoped for a session | D166 (3)–(5) | `state/accounts.test.ts` |
| AC3 | A new user joins either way: on no list he asks once, as himself, and waits; the admin approves (linking a puck he picks — a typed callsign never claims one) or declines; the guest switch is off by default | D204 | `state/accounts.test.ts` |
| AC4 | The guards: an admin never changes his own account; at least one admin always keeps access; one person one account; one sign-in name one account; an archived callsign keeps its account | D166, D204 (the agent's readings, on the look card) | `state/accounts.test.ts` |
| AC5 | The accounts load safely: loading never writes; a list with no admin gets the seed admin added, and the seed admin wins any collision; bad entries are dropped | Fable R2-6, Astra R3-4 | `state/accounts.test.ts` |
| AC6 | An account change is one command; its keys roll back together | Astra R2-3 | `state/accounts.test.ts` |
| AC7 | A member's command changes only his own records; a guest files nothing | D200 (3), D149 | `state/accounts.test.ts`, `state/quals-write.test.ts` |
| AC8 | On the Quals page a member edits his OWN row, every column; never another's; an admin any | D149 | `state/quals-write.test.ts`, `ui/quals.test.tsx` |
| AC9 | The Leave War's own writers agree with the permissions table | D200 (3) | `leavewar/permsparity.test.ts` |
| AC10 | No "View as", no role toggle; the badge names the signed-in person | D166 (3) | `ui/accounts-ui.test.tsx` |
| AC11 | The access screens: request access, waiting, switched off — each with Sign out | D204 | `ui/accounts-ui.test.tsx` |
| AC12 | The guest sees the published week only, walled off, and no medical detail | D204, D211 | `ui/accounts-ui.test.tsx` |
| AC13 | Admin → Users: the waiting count on the Admin tab, approve, add, never your own account | D166 (1), D204 | `ui/accounts-ui.test.tsx` |
| AC14 | One place answers "may this person do this?": the app's matrix IS data-model §11, and no file decides authority outside it | D200 (2)–(3), D202 | `state/perms.test.ts`, `state/perms-scan.test.ts` |
| AC15 | Every window closes at a sign-in and a sign-out; the undo list empties | Astra R1-3, D148, 13 Sep 26 | `ui/pops.test.ts`, `state/session-undo.test.ts` |
