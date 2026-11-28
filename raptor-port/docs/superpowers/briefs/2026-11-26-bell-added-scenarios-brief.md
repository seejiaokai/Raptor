# Brief — design the walk's scenarios: a person added to an input by someone else is told on his bell (chat 190, 26 Nov 26)

**For:** Astra and a fresh Fable, each blind to the other (his D2443). You DESIGN scenarios; you do not walk the app,
change any file, or judge whether the code is right. Write your list to the report file named in your prompt.

## What the owner asked

"Check on the running app that a person added to an input by someone else is told on their bell, every way of adding
(schedule drop, Inputs page window, Leave War)." This is a check of the app AS IT IS TODAY, before a coming change
(below) adds new ways of adding a person. Opus walks your scenarios in the real app (desktop and phone), with pictures.

## The rules that apply (read the full rows: `grep -h '^| D769 |' .claude/decisions-full/*.md`)

- **D769** — the bell: a person put in an input, or one filed for him, is told ("You were added"); its other people are
  told who was added or taken off; everyone is told when it is deleted. `raptor-port/docs/notifications-register.md`
  rows B1, B2, B8 and the Leave War's P-rows (P2: an admin enters leave on his row with auto-approve; P11).
- **D755, D757, D776** — a man dropped on a row that came from an input joins or replaces in the input; "the member is
  told by his bell".
- **D702, D711** — an input filed for ALL AVAIL or ALL is not in each man's own bell.
- **D2200** — each person's own choice of notifications (on by default): a person who switched a kind off is not told.
- **D2779 (26 Nov 26, not built)** — after the coming change, a drop on any input row (leave included) adds or replaces,
  nothing asked or noted on screen, "the man still told on his own bell".

## The coming change (context only — do NOT design scenarios for what is not built)

The combined-row job (`raptor-port/docs/superpowers/specs/2026-11-26-combined-input-rows.md`, rulings D2770–D2780 on
`.claude/rules/decisions/scheduler.md` §Inputs on the schedule): a shared input becomes one row under Unavailable too,
and every input row takes drops as a sim row. Today's check is the baseline it will be measured against, so name the
cases where today's bell behaviour would matter to that change.

## Every way a person can be added by someone else today — check this list and add what is missing

1. Edit Schedule and the Scheduler Board (desktop and phone): a puck dropped on a Ground Programme row that came from an
   input — onto an empty place (add), onto a shared input's puck (join), onto a one-man input's only puck (replace); a
   drop on an Unavailable row's puck (replace, today); the input's own window opened from the schedule.
2. The Inputs page: a new input filed by an admin for one other person, for several; an existing input's window, a
   person added; a member filing a duty or commitment for others (the Inputs rulings: a member files for others only
   duties and commitments); a note's pucks on a day opened on the calendar (is that an input?).
3. The Leave War: an admin enters leave on a man's row (auto-approve on and off); the several-people window; an Other or
   a commitment filed from the war; full editing of an entry there (D1724 — not built, say so).
4. Anything else: an amendment on a published day; ALL AVAIL standing in; a SANS commitment filed by an admin;
   Undo of the add (does the line go — D1693 [NOTICE-UNDO-RETRACT]); a man of another squadron.

## What to hand back

A numbered list. Each scenario: who does what, where (page, desktop or phone), the starting state, the EXPECTED bell
line for the added man (and for the input's other people), and the ruling that says so — or "no ruling; the agent must
ask". Mark the ones you think most likely to fail. Then a short list: what in the rules is unclear or contradicts.
Signing in: admin `ad`/`a` (Saber), member `us`/`us` (Ranger); the demo week Wed 15 Jul.
