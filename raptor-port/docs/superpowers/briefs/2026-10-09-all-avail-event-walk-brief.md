# The walk brief — an input filed for ALL AVAIL / ALL, and the new input kind "Event" — 9 Oct 26

One walker, one world (D16, D588). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen
said — pictures and a filled table. You do not review code, you decide nothing, and you fix nothing.

*(This brief is handed, word for word, to two walkers working apart — each with its own share of the scenarios, its own
server, its own picture folder and its own files. Your letter, your server and your share are in the message that gave
you this brief. Walk exactly your share.)*

## What the app should now do (read once, before you start)
- **An input can be filed for "ALL AVAIL" or "ALL"** — the schedule's two placeholders, offered in every Person list
  under the heading "Whoever is free that day". It is ONE ordinary input: nobody's name is stored; who stands behind it
  is worked out for the day (whoever is free), shown by the count on its puck and the window that count opens, and frozen
  when the day is published. Only for six kinds — Training, Meeting, Appointment, Duty, Event, Other; one day at a time;
  never with other people ("Several people"). A refusal is said in words where the person pressed, and nothing is saved.
- **OIL:** on a weekend or holiday whoever files it answers the OIL question ONCE. A man behind it has no answer of his
  own: he earns by default exactly when the filer said Yes. A man the scheduler typed onto its row earns by default
  whatever the filer said. In OIL Earn the scheduler switches any one man in the window (after a No a tap CREDITS him;
  after a Yes a tap takes him off). The placeholder itself never earns. An unanswered question lights the FILER's bell,
  nobody else's.
- **Who may:** an admin; a member while "members filing for other people" is on (the gear on the Inputs calendar). The
  filer or an admin may change or delete it. It is nobody's "mine": a member's list opens on his own inputs and shows it
  only under "Everyone". The person filter offers Everyone, ALL AVAIL and ALL as three different choices.
- **The kind "Event"** is a commitment like Training, Appointment and Duty: in every list of kinds under "Duty & other
  commitments"; it lands on the Ground Programme; asks the OIL question on a weekend; across a standby (SC MAIN) shift
  it is a RED warning (a Meeting is amber); a man on it is not "free" for an ALL AVAIL at that time.
- The owner's rulings: `grep -h '^| D711 |' .claude/decisions-full/*.md` (D700, D702, D711, D712, D713, D714 — the
  shell's grep). The plan: `raptor-port/docs/superpowers/plans/2026-10-09-input-all-avail-plan.md` §3–§5. How the screens
  are meant to behave, with their test ids: `raptor-port/docs/ui-contracts.md` — search `"ALL AVAIL" and "ALL" as a
  choice of person` and read that paragraph.
- **The demo carries two already** (the week after the demo week): a Duty for ALL AVAIL on Sat 25 Jul 2026, answered
  Yes, and an Event for ALL on Wed 22 Jul 2026 — both filed by Saber.

## The scenarios
`raptor-port/docs/superpowers/briefs/2026-10-09-reads/all-avail-event-scenarios-astra.md` (numbered S1 …) — each with
its setup, action, expected result and what would disprove it. **Walk ALL of your share, in the order given, and cite
each by its number.**

## Hard rules — the method
**Every rule under "Hard rules" in `raptor-port/docs/superpowers/briefs/2026-10-08-inputs-sans-check-walk-brief.md`
applies here, word for word** (read that section whole: read-only on the app; your own files only; scripts written with
the Write tool and run as files; every fixture through the app's own controls; a step asserts what a person SEES; a
gesture is driven for real; sizes; the error list; what is not a finding) — with these names in place of its own:
- **Your own files only** (`<L>` is your letter): scripts `raptor-port/scripts/handpass/aa-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-09-all-avail-event-check/<L>/`; results
  `raptor-port/docs/handpass/parts/aa-<L>.json` and your report `raptor-port/docs/handpass/parts/aa-<L>.md`.
- **Signing in:** `#luser` / `#lpass` / `#loginForm button[type=submit]`; `ad` / `a` is the admin Saber, `us` / `us` the
  member Ranger; `#vWeek .day` is the "week is up" signal. The demo week is 13–19 Jul 2026 (Sat 18, Sun 19 the weekend).
  Open the app at your server's address WITHOUT `?fresh=1` when a scenario reloads the page (a fresh world keeps nothing).
- **Useful selectors** (verify each on the page before leaning on it): the Inputs month `#inpCal`, a date
  `[data-icday="2026-07-18"]`, a bar `.ib-bar`, "+ Input" in the opened day `#icPopAdd`; the editor window
  `[data-testid="win-inputedit"]`, its Person list `#inpEditPerson`, kind `#inpEditType`, remark `#inpEditRmk`, Save
  `#inpEditSave`, the picker's line `[data-testid="pp-why"]` and its one press `[data-testid="pp-fix"]`, "Several people"
  `[data-testid="pp-several"]`; the OIL question `[data-testid="oilconf"]` with `oil-yes` / `oil-no` / `oilconf-save`;
  the List `#inListBtn`, its person filter `#inFPerson` (Everyone = `all`, ALL AVAIL = `ph:allavail`, ALL = `ph:all`);
  on the schedule a placeholder puck `.puck.allavail`, its count `.oilcount`, the window `.availwin`; the board's OIL
  Earn button `[data-oilmode]`; a man's OIL switch `.seat.oilpk[data-oilp]`.
- **OIL scenarios state both** what the screen shows AND who is credited (read `window.INPUTS` / the day's figures
  through `page.evaluate` only to READ; the OIL tracker on the Leave War tab is the screen that shows a man's credit).
- **Sizes:** desktop 1440×900 and phone 390×844 for every scenario that names a screen; 390×568 once for the editor
  window and the ALL AVAIL window.
- **Judging:** a scenario with an EXPECTED line is PASS or FAIL — never "recorded". A FAIL names the step, what the
  screen said, and the picture. Do not explain a FAIL away; the host decides whether it is real.
- **Not part of this job:** one row for a group input on the schedule (D661 — its own job); how many are free shown on
  the Inputs calendar's card (told to the owner as a limit); anything of the Tracker.

## What to hand back
`aa-<L>.md`: one row per scenario — its number, the size, the role, PASS / FAIL, what the screen said in a line, the
picture file(s) you opened. Then: every console or page error seen; anything you saw that looked wrong and was not in a
scenario (a line each, with its picture). `aa-<L>.json`: the same rows as data.
