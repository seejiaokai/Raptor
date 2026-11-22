# Night of 22–23 Nov 26, job 1 — the builder's report (Admin → Users, the rest)

Saved whole as it arrived (chat 149's helper, commit `ac2890fa4`, branch `claude/msq-b1-screens-135`).

**Built:** (1) the filter — "Filter" beside the search, a panel of tick chips in the `.fchip` look (Seat; CAT; Role:
Member, Admin, "Plans <page squadron>", Master admin; Squadron for a master admin only; "Clear all"); any-of within a
group, groups combined; the button lit with its count ("Filter · 2"); "Showing 1 of 61 · Clear" over the list; rows only
hidden, A to Z kept; Escape and an outside press close the panel. `src/ui/usersfilter-model.ts`, `src/ui/UsersFilter.tsx`,
CSS in `src/ui/postout.css`. (2) A master admin's grouped list — each ticked squadron under its own heading ("142 · 61",
"149 · 10"), A to Z, other squadrons' people with the grey badge; "People · 71"; both of two ticked: "Filter · 1" and
"Showing both squadrons, grouped · Clear" (nfc); eight squadrons, two ticks count 2 (f5c-p). (3) The roles table — a
closed "▸ What each role allows" fold under the squadron lines; cells one table `src/ui/rolestable.ts`; `RolesFold` in
`UserAccess.tsx`; `src/ui/rolestable.test.tsx` signs in each role and checks all 8 pages' cells and the notes against the
app's own readers. (4) Home squadron on Add a person — first in the form, the squadrons the admin is an admin of, the
page's first and picked, passed to the existing door. (5) [ROLE-BOX-CUT-IPHONE] — `e2e/users-fit.spec.ts` at 402 (two and
eight squadrons, Plan picked, Master admin picked, Ranger's row); `raptorAddUnit` added to `src/probe-bridge.ts`
(localhost only, through the real `addUnit`).

**Tests:** `msq-users-filter.test.tsx` 14 of 15 red on the old code, 15/15 now; `rolestable.test.tsx` red (no table),
12/12 now; `users-fit.spec.ts` guards work built before tonight — its measure proven on the old long Role words (221px and
198px against 137px). **Checks:** 25 unit files 205/205 under the lock; `npm run build`; `reference/tfin.js` 728/0; code
check clean; docsize (it needed `e2e/users-fit.spec.ts` in `scheduler.md`'s `paths:`); browser tests touching Admin →
Users 44/44 under the lock. One early two-file vitest run went without the lock.

**Measured against the drawings** (402×874 WebKit, 1536×864 Chromium, `scripts/handpass/n149/measure-night1.mjs`): nfa,
nfd within 1.2px; nfb, nfc the panel's place and width exact; b1-7 within 1px; k2 laid out as drawn; f5c-p 8 chips on 2
rows. **Left:** the CAT chips include IR and D (the roster holds them; the drawing hard-coded six) — the phone panel 34px
taller; the Role chip reads "Plans 142" on 142's list (the drawing showed "Admin + Plan of 149"); the nfc drawing left
149's people inside 142's list (a fault of the drawing script — the build groups them as the caption says); f5b-p's
editor 705px tall against 463 drawn (data: Hunter holds Plan of 150–155, each line carrying Plan's two-line note).

**One drawn roles-table cell the app disagrees with:** View × Admin — drawn "—", the app answers "read" (an admin of 142
with View of 149, 149 picked, keeps his Admin tab; Admin → Squadron config follows the schedule in view, D2317, read
only). Neither changed; the test lists it as KNOWN with both answers. The other 39 cells agree.

**Words:** the drawn words used where the brief differed — "View and Plan give access to another squadron." and "✓ can
change · read: can see, not change · — cannot open" (two constants in `rolestable.ts`). No new words beyond the
drawings ("Showing 71 of 71 · Clear" reuses the drawn shape).

**Its decisions:** "Member" is a sign-in that is not an admin's (no sign-in matches no Role tick); "Admin" leaves out
master admins; the Home squadron box hides when only one squadron can be offered; ticks also filter the Archived fold;
empty groups hidden; a search still finds a man of an unticked squadron under his own heading.
