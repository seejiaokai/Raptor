# Section 1 (the guard rail) — step K2a: "+ Add a person" at the top of Admin → Users (chat 194, 26 Nov 26)

**What he approved (D2729 Q10 and Q1, D2726, D2652 N13 i, D2644, D2655 D1).** The plan: `../plans/2026-11-25-msq-pick-guard-build1.md`
— §21.1's block "Step 0 — this part read against his answers" (rows Q10 and Q1) **wins over §18.3 wherever they
differ**; then §18.3 (today's code, the tests G3–G6), §21.1's "It must not touch". Read those, by section — never the
plan whole. Read `.claude/rules/decisions/people-accounts.md` with the Read tool (its "Add a person" line and the
Admin → Users rules), and `raptor-port/docs/design-practices.md` §0, §2, §3, §9 (his design lessons — 103 on the
button pair, 147 on two add buttons).

**The drawings he saw** (`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`), opened with the Read tool and
kept beside the build:
- closed, desktop `s3-8-d-column-crop.png` (the top row only — the column and jumps in it are another section's);
  closed, phone `s2-10-p-waiting-crop.png` (the button full width under the search row; the jumps are another section's);
- open, desktop `s1-add2-a-d-crop.png`; open, phone `s1-add2-a-p-crop.png` — the opener gone, the search widened into
  its place, the heading "ADD A PERSON", the fields, the note, "Add person" · "Cancel";
- no Home squadron box: `s1-add-home-d-crop.png`, `s1-add-home-p-crop.png` (the recommended pictures of Q1).

## What is built

1. **The top row.** The search, Filter and "+ Add a person" are one row at the very top of Admin → Users, above
   "Waiting for access". On a phone: the search and Filter on one row, "+ Add a person" full width under them. The old
   "Add a person" block at the page's foot is gone. The search still filters exactly what it filters today.
2. **The form opens under that row** when the button is pressed, above "Waiting for access", the callsign box focused
   (a desktop). **While it is open the "+ Add a person" button is not on the page** and the search widens into its
   place; the form wears the heading **"ADD A PERSON"** in the page's own section-heading look (the look of the
   page's other headings — read it from the stylesheet, never restyled by eye).
3. **Its foot: "Add person" and "Cancel", one pair** — the same size, on one line, measured from the app's own
   Save · Cancel pair on an opened row of this page (D2644, lesson 103), side by side on a phone too. Once a sign-in
   is typed the first still reads "Add person and sign-in", as today.
4. **Cancel** empties the form (`resetAddForm()`), shuts it and brings the opener back, the keyboard back on the
   opener. **Escape** does what Cancel does, as it leaves an opened row. **After a successful add** the form clears and
   stays open, for the next person. Nothing else shuts the form.
5. **No Home squadron box, on any page, for anyone.** The man is added to the squadron in view. `UsersPanel.tsx` no
   longer calls `addHomeChoices` and drops its `home` state; **do not edit `ui/usersfilter-model.ts`** (another
   section's file) — the function stays there.
6. **Quals' "+ Add person"** lands on Admin → Users with the form open and the callsign box ready — no scroll to a
   foot.
7. Nothing of the form's fields, their checks, their words or the note under it changes; adding is the same call
   with the same arguments as today, but for the home squadron now always being the squadron in view.
8. **Not in this step:** the form's report to the guard (`useGuardWork` — K2b), the jumps, the page's new order,
   the search filtering every group (the Admin → Users section's).

## Tests first, seen failing — `raptor-port/src/ui/msq-guard-g.test.tsx` (jsdom, `withThird()` in its set-up)

- **G3** — the button stands in the page's top row after the search and Filter; no form on the page until it is
  pressed; pressed, the form is under the top row, above "Waiting for access", headed "ADD A PERSON", the callsign box
  focused; no "Add a person" block at the page's foot; **the opener is not on the page while the form is open.**
- **G4** — every field typed or changed (callsign, initials, seat, CAT, sign-in, the post-in date, the role), then
  Cancel: the form gone, the opener back; opened again: every field as a fresh form's. The same with Escape. After a
  successful add: the form open and empty. **No Home squadron box** for Hunter on 149 and on 142, nor for Saber on
  142, 149 and 150; a man added on 149's page is 149's.
- **G5** — Quals' "+ Add person": Admin → Users, the form open, the opener absent.
- **G6** — adding makes the same call with the same arguments and the same notes as today (but for the home).
- The existing tests that type into the form (`ui/accounts-ui`, `ui/msq-users-filter`, `ui/msq-users-row`, Quals'
  "+ Add person" test, any that pins the Home squadron box) are re-pointed to press the button first, or — for the
  Home box — changed to the new rule; **each named in the report with what changed and why; none weakened.**

Files you may change: `raptor-port/src/ui/UsersPanel.tsx`, `raptor-port/src/ui/postout.css`, the new test file, and
the existing test files above. Anything else — above all `ui/usersfilter-model.ts`, `ui/userslist-model.ts`,
`ui/AdminPage.tsx`, `state/accounts.ts`, `state/units.ts`, `state/perms.ts` — stop and say so.

Then: the touched test files green; `npm run lint:changed` clean; `npm run build` (only with the checks lock free —
`node raptor-port/scripts/gatelock.mjs status` from the repo root; if held, say so). Do not commit.

Report → `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k2a-report.md`: what changed, each test seen failing
first then green (the counts), each existing test re-pointed and why, every place the build departs from a drawing
and why, what you could not check without a browser. End your reply with that path and a five-line summary.
