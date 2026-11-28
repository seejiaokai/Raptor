# The read: a squadron he only views, and the ☰ menu's squadron drop-down (RAPTOR), 23 Nov 26

You are one of the readers of finished code, each blind to the others and to the walk. Do NOT open
`raptor-port/docs/handpass/` or any report under `raptor-port/docs/superpowers/briefs/` dated 23 Nov other than this
brief. Read-only: change no file in the repo, run nothing that builds, commit nothing.

**The code:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`. The change is
`git diff 7b03ae0b1 <HEAD> -- raptor-port/src` (HEAD as named in your call); the source at `git show <HEAD>:<path>`.

**What it does (the owner's rulings D2381–D2384):**
- With a squadron he only views picked — the Schedules menu labels it "View only": a View of it, or a Plan of it or the
  master mark while he is in the member view (D2253) — the top bar and the ☰ menu offer its View-only Sched and Help
  alone; his own squadron picked brings every page back. Roles table: View × Logic "—".
- A pick of it from a page it does not offer lands on its View-only Sched; Help stays Help. One of his own pages opened
  from elsewhere while it is picked (a bell line, a link, the OIL list, "Check my quals", an Undo's landing) brings his
  own squadron back into view, the page opened (the builder's reading).
- The phone's ☰ menu opens with the TALON mark: two squadrons or more, a button "149 ▾" whose list (the top bar's
  Schedules rows) opens under it inside the menu; a pick switches, the list closes, the menu stays open; Escape or a
  press elsewhere closes the list first. Under the mark a grey line: "149 · View only" etc. One squadron: the mark alone,
  the line still there.

**Files:** `state/perms.ts` (viewOnlyPick, pageOffered, VIEW_ONLY_PAGES), `state/store.ts` (landOnOfferedPage in
realNotify; enterSquadron's landing), `ui/Shell.tsx` (the tabs' `hidden`), `ui/Drawer.tsx` (DrawerSquadron, the items
filter), `ui/SquadronMenu.tsx` (SquadronRows), `ui/rolestable.ts`, CSS `ui/scheduler/02-shell.css`,
`09-week-responsive.css`; tests `ui/msq-view-only-menu.test.tsx` and four rewritten (msq-fix3-drawer-edit, msq-bell-tap,
msq-inputscal-own-calendar, rolestable). Rulings: `.claude/rules/decisions/people-accounts.md` §Many squadrons; full rows
`grep -h '^| D2381 |' .claude/decisions-full/*.md` (and D2382–D2384, D2253, D148).

**Look for what is MISSING or wrong, each with a concrete failure — who, what pressed, what shows, what should:**
- a way to reach a page it does not offer that still works (a key, a link, a bell line, a deep link, the Leave War's own
  links, an Undo landing, sign-in, midnight, a right changed while on a page) — or a landing that loses typed work, an open
  window or unsaved Tracker edits;
- the standing check in `realNotify` misjudging "the page moved" against "the squadron moved" — a loop, a re-entry at
  the wrong moment, a re-entry while a Leave War window holds the war (typing-hold), a re-entry inside another entry;
- `enterSquadron` called from inside `notify` breaking something it relies on;
- the drop-down: focus, Escape order with the menu's own Escape, a list left open on reopen, a pick that closes the menu,
  a stale label after a right changes;
- anything a View holder now sees or reaches of another squadron that he should not (or loses of his own).

**Not a finding (D56, D785):** a problem only in data already stored, with the code right going forward; a scheduler who
is not an admin. Every claim you make must carry: the failure, its cause in the code (file and function), and its fix.
