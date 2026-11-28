# Scenario design: a squadron he only views, and the ☰ menu's squadron drop-down (RAPTOR), 23 Nov 26

You design the walk's scenarios. You do not judge whether the code is right: say what a person could do that the
builder may not have thought of, and what the screen must show after each step. Read-only: change no file, run nothing
that builds, commit nothing. Do not open `raptor-port/docs/handpass/` or any report under `raptor-port/docs/superpowers/briefs/`
dated 23 Nov other than this one.

**The code:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`. The change is
`git diff 7b03ae0b1 -- raptor-port/src` (working copy or the commit after 7b03ae0b1).

**His rulings (the owner's, in force):**
- D2381: with a squadron he only views picked, a person (member or admin) is offered its View-only Sched and Help alone;
  his own squadron picked brings every page back. "Only views" = the Schedules menu labels it "View only": a View of it,
  or a Plan of it or the master mark while he is in the member view (D2253). The roles table on a person's opened row in
  Admin → Users: View's Logic cell becomes "—".
- D2382–D2384 (version D): the phone's ☰ menu opens with the TALON mark as the squadron drop-down ("149 ▾"); a tap opens
  the same list as the top bar's "149 ▾" (tick, number, "Your squadron" / "View only" / "Full access") right under the
  mark inside the menu; a pick switches the squadron, the list closes, the menu stays open with its pages changed. Under
  the mark one grey line says his access to the squadron in view ("149 · View only"). One squadron: the mark alone, no ▾,
  the line still shown ("142 · Your squadron"). Drawing: `raptor-port/docs/mock/2026-11-23-view-only-tabs/d1–d5` and
  `manifest.md`.
- The builder's reading (not a ruling): a pick of a view-only squadron made from a page it does not offer lands on its
  View-only Sched; Help stays Help. One of his own pages opened from elsewhere while it is picked (a bell line, a link,
  the OIL list, "Check my quals", an Undo's landing) brings his own squadron back into view, the page opened.

**Files:** `state/perms.ts viewOnlyPick, pageOffered`; `state/store.ts landOnOfferedPage, enterSquadron`;
`ui/Shell.tsx` (top bar tabs); `ui/Drawer.tsx DrawerSquadron`; `ui/SquadronMenu.tsx SquadronRows`; `ui/rolestable.ts`;
CSS `ui/scheduler/02-shell.css`, `09-week-responsive.css`. Area rulings: `.claude/rules/decisions/people-accounts.md`
§Many squadrons, `.claude/rules/decisions/design.md`; full rows `grep -h '^| D2381 |' .claude/decisions-full/*.md`.

**The demo world:** Saber (`ad`/`a`) a master admin of 142; Hunter (`hunter`) 142's admin; Ranger (`us`/`us`) a 142
member; Kestrel 149's admin; Osprey a 149 member. Saber gives View or Plan on a person's opened row in Admin → Users.

**What not to raise (D56, D785):** a problem only in data already stored, with the code right going forward; a scheduler
who is not an admin.

**Give back** 15–30 scenarios, each: a name; who, on which device (phone 402 × 874, desktop 1536 × 864, a narrow desktop
where ☰ shows); the steps pressed in the app; EXPECTED — what the screen must show after each deciding step. Cover
especially: every way to reach a page (tabs, ☰, bell lines, links, the OIL list, Undo landings, the member-view switch,
sign-in, midnight, a right given or taken away while he is on a page, an open Leave War window or unsaved Tracker edits
at the pick); the drop-down's keys (Escape, arrows, outside press), closing and reopening the menu; many squadrons; the
desktop top bar folded and unfolded. Name any case where the rulings above do not say what should happen — as a
question, not a scenario.
