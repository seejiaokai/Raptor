---
paths:
  - raptor-port/src/engine/**
  - raptor-port/src/ui/**
  - raptor-port/src/state/**
  - raptor-port/src/undo/**
  - raptor-port/src/command/**
  - raptor-port/src/storage/**
  - raptor-port/src/*.ts*
  - raptor-port/src/testing/**
  - raptor-port/e2e/**
  - raptor-port/probes/**
  - raptor-port/docs/engine-rules.md
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/feature-impact.md
  - raptor-port/docs/performance.md
  - raptor-port/docs/undo-contract.md
  - raptor-port/docs/data-schema.md
  - raptor-port/docs/mock/**
  - raptor-port/docs/**/*allavail*
  - raptor-port/docs/**/*amend*
  - raptor-port/docs/**/*crewrest*
---

# Rulings — the scheduler and amendments

**Loads by itself** whenever a session reads a scheduler, board, engine, amendment or storage file (the
`paths:` at the top of this file). The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of every ruling and how to add or retire one: `DECISIONS.md`.
**One line per ruling — its number, its date, the rule as it stands (D390). Its full row** — his words, the readings he
was told, where it lives — **is in `.claude/decisions-full/scheduler.md`, never loaded by itself: open it before acting on a
ruling's detail or asking him about it** (`grep -h '^| D… |' .claude/decisions-full/*.md` — the shell; the Grep tool
hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.
**The Inputs pages have a file of their own since 13 Oct 26 (owner D802): `inputs.md`** — the Inputs list and calendar, the
SANS calendar, the Calendar window, an input's own window and card (101 rulings, moved out of this file whole). It loads
by itself with those screens' files; **open it yourself before planning or changing anything of an input, the Inputs or the SANS calendar, the Calendar
window or the late cut-off** — who may
file or change one (**D655, D658, D763, D770**), what ALL / ALL AVAIL is not offered for (**D712**), an input's own
title box (**D715**), its card and the cancelled input's place and window (**D718–D725, D727–D729, D768, D771**), its OIL sign (**D777**), the
late cut-off (**D628, D639**), a day's class and the holidays (**D627, D631, D633, D638**), the SANS day's needs
(**D617–D622**). A ruling that governs BOTH an Inputs page and the schedule stayed HERE.
**Also read** — in `leave-war.md`: **D881** (the green "he can take this seat" ring on Edit Schedule loses its glow, keeping its solid green ring — with three Leave War and Tracker places); **D882** (the light under today's day card and a SANS puck's stripe's light go too). In `oil.md` (it loads by itself with the placeholder, publishing and OIL files): **D28, D31,
D32, D43, D46, D52** (what the ALL / ALL AVAIL pucks earn wherever they may land — the earning list follows
the landing list), **D48, D49** (a published day and a rule change), **D19** (a weekend no Leave War period
covers). In `people-accounts.md` (it loads by itself with the accounts, Quals and posting files): **D297, D299**
(a deleted man keeps his puck on every day he already flew; the past keeps its record of him), **D321, D327** (an
archived man on published days and in the ALL AVAIL crowd), **D213, D215** (a guest sees what a member sees on
View-only Sched, medical inputs included).

**Where the detail lives:** the rules engine — `raptor-port/docs/engine-rules.md`; how each surface renders,
drags and edits — `raptor-port/docs/ui-contracts.md`; what a change touches — `raptor-port/docs/feature-impact.md`;
speed — `raptor-port/docs/performance.md`; what is stored — `raptor-port/docs/data-schema.md`; undo —
`raptor-port/docs/undo-contract.md`; the files — `raptor-port/docs/file-map.md`. The rules every area shares
(the store, the funnels, what persists, the robustness doctrine) stay in `raptor-port/CLAUDE.md`.

| # | Date | The rule |
|---|---|---|
| D1028 | 19 Oct 26 | A suggested time (the brief's, and a formation's default rally) is shown in its own box's row area, never on a line of its own above the box, so a row's boxes stay level and the row grows no taller; a tap puts it in. Inside the empty box, faint, is the agent's proposal, drawn for him before it is built. |
| D1027 | 19 Oct 26 | A formation's rally box offers a default rally — its take-off less a time set on the Logic page, 3 hours to start — which the scheduler selects; that it is a suggestion, not filled in by itself, is the agent's reading. |
| D1026 | 19 Oct 26 | Each formation gets its own rally time in a box of its own: a flying row's second time column is headed R / B, the rally above the brief, and the third TO / LD, the take-off above the landing, on the week and Edit Schedule; the typed lines above the wave are for the in-time only, their button "+ In-time"; a mock-up comes before the build. |
| D1021 | 18 Oct 26 | When tomorrow's crew-rest warning is focused, the day before keeps the dashed "same man, other day" mark over its dotted ring, as built; nothing changes. |
| D1020 | 18 Oct 26 | The calendar that floats over a date box behaves as the calendars inside a form do (D1012): Escape with its month or year list open closes only that list; a second Escape closes the calendar. |
| D1017 | 18 Oct 26 | Every copy of a man's puck on a day — the Ground and Personal Inputs rows, the SANS card, the Unavailable row and the crew list — wears his seat's crew-rest ring and chip; a puck lit by an open issues list keeps its dotted or dashed ring, standing out because the rest dims, as today. |
| D1013 | 18 Oct 26 | Every copy of a man's puck on a day wears the same crew-rest ring as his seat (dotted, dashed or solid) — his SANS card, Unavailable and Personal Inputs rows and the crew list included — and an open issues list lights its crew without hiding those rings; drawn for him before it is built. |
| D1012 | 18 Oct 26 | In a calendar inside a form — the OIL question's "Only some days…" and an input's own window — Escape with the month or year list open closes only that list; a second Escape closes the form — and the calendar over a date box the same (D1020). — changed by D1020 |
| D1011 | 18 Oct 26 | On the Scheduler Board, Escape in a take-off, landing, brief or duty-start box puts the old time back and saves nothing, as every other box does. |
| D1010 | 18 Oct 26 | On View-only Sched the next-week preview shows a published day's published version; Edit Schedule's preview keeps the working copy. |
| D1009 | 18 Oct 26 | Insights keeps counting a flying line with nobody on it as a sortie and its formation as a formation — the same count as the day's own heading; nothing changes. |
| D997 | 18 Oct 26 | On a phone every window that pops up for a task stands in the middle of the screen, as tall as what is in it up to the visible screen less 24px; the day panels pulled up and down by their bar (the Inputs and SANS calendars' day) and the ALL AVAIL and changes windows stay at the foot. |
| D995 | 18 Oct 26 | On a phone the schedule's own input window, opened from Edit Schedule or the Scheduler Board, stands in the middle of the screen, not at its foot; it is still as tall as what is in it, up to the visible screen less 24px. |
| D958 | 17 Oct 26 | Where an ALL AVAIL / ALL input's row sits on the Common Programme (D955), the three places that named it "ground" say "Common" — the board's note after ✕, Personal Inputs' button and the phone's banner while a place waits for a puck; a row on the Ground Programme keeps "ground". |
| D957 | 17 Oct 26 | Where an ALL AVAIL / ALL input stands on the Common Programme (D955), the same line as the Ground Programme's stands under the Common Programme's heading — "to take an input off, press reject on it in Personal Inputs below." — only on a day where such an input stands there, on the Scheduler Board and Edit Schedule's week, never on View-only Sched. |
| D955 | 17 Oct 26 | An ALL AVAIL / ALL input lands on the Common Programme, in time order, for every kind it is offered for; no move between the two programmes (reject still takes it off); changed to named people only it goes to the Ground Programme, and back with ALL AVAIL; everything else about it is unchanged. |
| D950 | 17 Oct 26 | Round 2 of the words pass, as answered: View-only Sched's boxed "Draft" goes (the DRAFT tag stays); the peek reads "Next week: click a day to load it"; "· accepted" / "· removed" once a row, after the name; "Placeholders · drag in" reads "Placeholders". |
| D949 | 17 Oct 26 | The night's Q1–Q3 as recommended: the board's wave header shows a small "(prev day)" where a wave's in-time / rally is the evening before; a rejected input is called "rejected", never "removed"; a Ground Programme row's "till <date>" stands in grey after its remark box. |
| D947 | 16 Oct 26 | Round 1B, as answered: the board's wave header loses "in-time / rally HH:MM · N AC"; the Ground Programme's line reads "to take an input off, press reject on it in Personal Inputs below."; on a phone an input's button sits on its puck's line (board and week); Unavailable stays as it is. |
| D945 | 16 Oct 26 | The button on an accepted input's row that takes it off the programme (or back out of Unavailable) reads "Reject", not "undo" — on the Scheduler Board and Edit Schedule's week, phone and desktop; what it does is unchanged, and the row still offers accept again. |
| D940 | 16 Oct 26 | On Edit Schedule and the Scheduler Board: the board's nine panel subtitles go (a folded Personal Inputs keeps its count, "show" goes); "tap to review", "press a card to edit" and the fold words go, the carets stay; the removed-input note's dash becomes a full stop; the empty amendments box says "No amendments published yet." |
| D938 | 16 Oct 26 | The editing hint on Edit Schedule's and the Scheduler Board's Personal Inputs and Unavailable panels ("times and remarks type in place · clear a time for all day · press the type to change it") is deleted, not moved into the legend: nothing takes its place. — changed by D942 |
| D936 | 16 Oct 26 | On the Logic page the passing note after a value is changed ("crew rest → 11H") is deleted — the row itself shows the new value and its standard (D850); and on a phone, while editing, "Reset to standard" reads "Reset all" so the row stays one row, as built. |
| D933 | 15 Oct 26 | On the Logic page a check's key info is said as his crew-rest example says it: who and what it applies to, and its limit, in a few plain words — for crew rest: a flying member's earliest in-time, at least the crew rest setting after the day before. |
| D932 | 15 Oct 26 | On the Logic page, every number in the text that is an editable setting is read from that setting, so it changes the moment the setting changes — never typed as a fixed number; and every line is correct for whatever the settings are. |
| D931 | 15 Oct 26 | The Logic page is a guide for a user who wants to know how the app's rules work in depth — without jargon and without what is not essential; every line is written and checked by reading it as that user would. |
| D929 | 15 Oct 26 | The Logic page is written so a member or an admin reading it understands how each rule applies to them and how the rules affect one another — key pointers, never the app's inside detail. |
| D928 | 15 Oct 26 | The Logic page is built as drawn: two parts, settings then the checks, in the groups shown; every check listed with one line, four with a folded "How it works"; the "fired this week" count leaves each row (the filter stays); the two unused settings are removed from the page. |
| D925 | 15 Oct 26 | The Logic page is designed for the scheduler or admin reading it, not as a description of how the app works: intuitive, less cluttered, the editable settings together at the top (D809), each with what changing it affects (the brief time moves the automatic B); the app's fine detail left out, a short "How it works" only where needed (crew rest). — changed by D928 |
| D901 | 15 Oct 26 | Calendar step two is built as recommended on its page: no "Clear" under any calendar except the bidding dates, which keep a small "Clear dates"; today is shown on the Leave War's calendars too; one finger-sized date everywhere; and the inputs list's date filter moves in step two too. |
| D877 | 15 Oct 26 | The Scheduler Board's other glows go, each keeping its ring: the landing flash after a drag or an undo and the picked-up look; the crew and the time boxes a tapped warning lights (red, amber, grey); a puck earning OIL in OIL Earn; his own puck ("this is you", its purple fill and ring kept) and a puck lit by a highlight chip. |
| D860 | 15 Oct 26 | The just-added mark is one look everywhere — the Scheduler Board's plain blue ring with no glow, on the inputs pages too — and it sits on the edge of the thing added: a note added on the board is ringed round its own box, not round its whole row. |
| D845 | 14 Oct 26 | The refusal under the day's "Nothing today earns" switch reads "Nothing on this day earns. Turn off the switch first." — his own wording, in every place it is said: a man's puck, an event's own OIL mark, a man in the ALL AVAIL window. |
| D844 | 14 Oct 26 | The refusal under the day's "Nothing today earns" switch never says "turn that off" — it says what to turn off, in every place it is said (a man's puck, an event's own OIL mark, a man in the ALL AVAIL window), from one source; its wording is now D845's ("turn off the switch first"), not the switch's name in quotes. |
| D842 | 14 Oct 26 | A picked answer that also has the keyboard on it shows one ring, never two: the keyboard's ring sits on the picked answer's own edge (one slightly thicker cyan ring) instead of a second ring round it. |
| D841 | 14 Oct 26 | While a bar that stays is up under the top bar — the "Not saved" warning, the OIL bar, or both — the line under it is the bar's own amber, never the top bar's cyan edge; and the two bars are the same height. |
| D840 | 14 Oct 26 | The bar that stays after an unanswered OIL question is built in the band under the top bar as drawn, and it is always one line — its words and its two buttons — on his iPhone's wider letters too; the drawing's second line for wider letters is not built. |
| D839 | 14 Oct 26 | The ten wordings a fresh reader tripped on are all taken, as the writing-guide page's section 4 gives them, and are built with the rest — each replaces the wording its note has in the other two lists. |
| D838 | 14 Oct 26 | The notes left whole on 13 Oct 26 have their dashes changed in the same build as the rest, as the writing-guide page's section 3 gives them — every word kept, the dash becoming its linking word, a colon or a full stop — not left for the whole-app words job. — changed by D843 |
| D837 | 14 Oct 26 | The wordings reworked by the writing guide are approved as the writing-guide page gives them and are the ones built: the passing notes N1 to N4, N7, N10, N11, N14, N16, N19, N24 and N26, the clash note's words and the OIL question's words — they replace the wordings of 13 Oct 26. |
| D836 | 14 Oct 26 | The writing guide is approved as written — what each kind of text says, how text is shortened, how the app speaks — with its order when the aims pull apart: every fact first, then a sentence a person would say, then as short as those two allow. |
| D834 | 13 Oct 26 | The long dash is not the app's ordinary way of joining two thoughts — it reads as machine-written, not as a person writes; a colon may be used in its place, and a dash may still be used where it makes sense. |
| D833 | 13 Oct 26 | The writing guide is a standing companion to the design guide and the design skill, used every time text in the app is written or changed — its aim: intuitive, clean, simple, smooth, less verbose, more human, with fewer dashes — and the wordings approved on 13 Oct 26 are rechecked against the finished guide before anything is built. — changed by D839, D836, D834 |
| D831 | 13 Oct 26 | The bar that stays after an unanswered OIL question ("Not swapped — OIL not answered · Answer OIL · OK") takes the band under the top bar, where the "Not saved" warning sits (D587) — not the foot of the screen; a picture is put to him before it is built. — changed by D840 |
| D830 | 13 Oct 26 | The small fixes of the design look of 13 Oct 26 — its findings L1 to L17 and the keyboard gaps K1 to K4, K7 to K10 and K12, none left out — are built as one batch with its own check, before calendar step two. — changed by D839, D837, D833 |
| D828 | 13 Oct 26 | On a phone a passing note takes the screen's full width less a small margin — never half the screen; the desktop's note stays as it is. |
| D825 | 13 Oct 26 | A shorter wording keeps every key word — what happened, why, what it costs and where to put it right; only filler is cut. A wording that reads as a summary of the old one is redone, and one that cannot lose a word without losing a fact is left as it is. — changed by D833 |
| D824 | 13 Oct 26 | On the app's one date calendar the picked date is the plain bright disc with no ring round it — a ring shows only while a keyboard is on a date, never after a tap or a click. |
| D815 | 13 Oct 26 | A member's bell says "Filed under Unavailable" when a scheduler files his input there and "Taken out of Unavailable" when it is taken out again — never "Back on the programme" or "Taken off the programme" for those two; fixed with the inputs batch. |
| D809 | 13 Oct 26 | The Logic page is re-laid: everything that can be edited is gathered at the top, everything that only explains a rule sits below it, and each of the two parts is arranged into its types; a picture is put to him before it is built. — changed by D925 |
| D807 | 13 Oct 26 | The designs just built and the ones coming are looked over with the design guide, keyboard use included — whatever a keyboard cannot yet do is listed; the findings are put to him before anything is changed. |
| D806 | 13 Oct 26 | The passing notes the app shows after an action are shortened — the ones after publishing and unpublishing a day first: the fewest words that still say what happened and the one thing he must know; the shorter wordings are put to him, before beside after, before they are built. — changed by D836 |
| D800 | 13 Oct 26 | A sideways finger on the app's one date calendar turns its month — left for the next, right for the last — as it does in the Calendar window and on his iPhone's own; a swipe that begins on a date picks nothing; the arrows and the lists stay. And calendar step two waited for his look at step one — given 15 Oct 26, happy with it as built (D889). — changed by D889 |
| D797 | 13 Oct 26 | The one calendar sits by what the date is to its form: one box among others opens it over the form; where the dates are what the form is for, it stays inside; its weeks start on MONDAY; it is built in two steps — the Calendar window and every date box still the phone's own first, the app's small calendars second, with a check of their own. — changed by D914 |
| D796 | 13 Oct 26 | The app gets one date calendar of its own, on the iPhone calendar's pattern in the Raptor look — the month and year as a title that opens a month-and-year chooser, a today icon right of the year (no reset), no tick: a tap picks — used wherever the app picks a date: every small calendar it draws today and every date box still the phone's own. |
| D776 | 12 Oct 26 | A personal input may hold several people, as every other kind of input does — "A Personal input is one person's own" is no longer refused — and a puck dropped on its row swaps or joins as on any input's. |
| D769 | 12 Oct 26 | The bell's list of notices uses the shorter wording — the input first, in bold, with its date; then what happened and who; its age at the right — and a tap on the bell still goes straight to an OIL question, an access request or a bug report where one waits, opening the list only otherwise. |
| D778 | 12 Oct 26 | A personal input is the same as an event for everything about people — several people (D776), ALL AVAIL or ALL on a one-day one, a member may file it for other people under the same switch — and it is still not work: no OIL question, nothing earned. |
| D767 | 12 Oct 26 | A cancelled input on the inputs calendar's card and the List's row shows a small red "CX" tag before its title, the title struck through, and the reason after it in red; on the month's bar its words are struck through and the bar faded, with no tag. |
| D762 | 11 Oct 26 | For an input with several people the OIL question has one answer, for everyone in it: whoever filed it, or an admin, gives it; no man in it gives an answer of his own, and the filer does not pick people out; only the scheduler leaves one person out, in OIL Earn on the day. |
| D760 | 11 Oct 26 | A CX the scheduler puts on a row that came from an input cancels the input itself: the Inputs calendar shows it cancelled with its reason, the member is told by his bell, and it goes with the input if it moves; the red box and "information only" go with the input too, shown on the schedule only. |
| D759 | 11 Oct 26 | The stored shape of D756 is confirmed now that its cost has been laid out to him: one record per input with the list of its people, changed in this job and built in steps — the first step changes nothing on screen. |
| D757 | 11 Oct 26 | The walk-through in words of the one rule is agreed as the behaviour the plan is written to: a person or ALL AVAIL dropped on an input's row shows on the schedule and the Inputs calendar alike and follows the input's OIL answer; ALL AVAIL stays when anyone leaves; the member is told by his bell; a drop that cannot apply is refused with its reason. — changed by D776 |
| D756 | 11 Oct 26 | An input is stored as one record with the list of its people — not as one record a person kept in step — and the stored shape is changed in the one-rule job itself, not left for the database step. |
| D755 | 11 Oct 26 | A row that came from an input is the input: whoever stands on it — a named person or ALL AVAIL / ALL, whoever put them there, whether the input began with one person or several — is in the input, and the schedule and the Inputs calendar always show the same people, time and remark. — changed by D776 |
| D753 | 11 Oct 26 | When ALL AVAIL or ALL is one of a shared input's own people: the men behind it follow the OIL answer given for the input, and the scheduler may still switch any one man; it is offered only where the input is a single day; and an input takes all or ALL AVAIL, never both. — changed by D755 |
| D751 | 11 Oct 26 | A long work day is grey wherever the app shows it — its line in the day's issues list, the ring on the puck at rest, and the ring that lights when the list is open or its line is tapped; it never lights amber. |
| D748 | 11 Oct 26 | The window a tap on a shared input opens from the schedule — its line under Personal Inputs, its row on the Ground Programme — shows everyone in the input and changes it for everyone, the same as the input's window on the Inputs page; it is never one man's form. |
| D747 | 11 Oct 26 | On the Scheduler Board the coloured line down the left of a row — amber for a late input, blue for a row that came from an input — sits clear of the row's pucks and buttons, a little to their left; it is never drawn through them. |
| D743 | 10 Oct 26 | The ten pictures of the schedule's one row for a shared input are approved as drawn and are the design of record for its build: the Ground Programme and Personal Inputs, the week and the board, a phone and a desktop, a man on leave flagged on the row, a published day, ten people. |
| D742 | 10 Oct 26 | For every kind of input, what the scheduler changes on its row on the schedule changes the input itself, and no change made there makes an input that was on time read late — on the Unavailable list and under Personal Inputs as on the Ground Programme. |
| D740 | 10 Oct 26 | A one-man request's row follows the same rule as a shared input's (D739) — a time or a remark the scheduler types on it changes the request itself — and it is built inside the shared-row job: the shared row first, the one-man rows second, one merge. |
| D739 | 10 Oct 26 | A time or a remark the scheduler types on a shared input's row on the schedule changes the input itself, for everyone in it: the schedule and the Inputs calendar always agree, and what was filed is kept only in the change history, with the scheduler's name. |
| D737 | 10 Oct 26 | An input filed for several people that lands on the schedule's Unavailable list — leave, an overseas duty, a course — stays one row a man there; the single row (D661) is for Personal Inputs and the Ground Programme only. |
| D736 | 10 Oct 26 | On a published day a shared input filed, taken off the programme or re-timed is one change waiting — one line, naming its people — and one man taken off its row or added to it is one change each. |
| D735 | 10 Oct 26 | One shared row has one time for everyone on it: to give one man a different time, or to cancel it for him alone, the scheduler takes him off the row and gives him a row of his own — the row never splits or joins by itself. |
| D734 | 10 Oct 26 | On a shared input's row the pucks are the input's people: a puck taken off the row takes that man out of the input itself, and a puck put on the row adds him to it — the same as doing it in the input's own window. — changed by D755 |
| D733 | 10 Oct 26 | In the changes window, a tap on a change whose place another man has since taken lands on that place, whoever stands there now — as built; nothing more is said, because the line tapped already names who moved. |
| D731 | 10 Oct 26 | The small choices of the inputs pages are answered "Yes to all" — each as recommended on the pictures page (1 to 5 and 7 to 12; 6 withdrawn as no fault) — and the second batch is built on his word: the ten ready small faults and these answers as one batch, tests first, with its own check; no merge without "merge live". — changed by D762 |
| D717 | 9 Oct 26 | Where an input's title differs from its kind's own name, the kind stays in sight, small: under the title on the schedule's row, and on the small-print line of the opened day's card; the drawing is approved and the title is built. |
| D714 | 9 Oct 26 | An event clashes as Training, appointment and duty do — a red clash across a standby shift, not Meeting’s amber advisory; and there is no "count me in / out". |
| D713 | 9 Oct 26 | A new input kind, "Event", is added as a commitment like the others: it asks the OIL question (it is work — it may be official), it clashes as a Ground Programme item does, and it shows on the Inputs calendar and lands on the schedule unless an admin takes it off; for ALL AVAIL, ALL or several people. |
| D711 | 9 Oct 26 | For an input filed for ALL / ALL AVAIL: (1) the filer answers the OIL question once and the scheduler may switch any one man — a man behind it does not change his own answer; (2) not for an overseas duty or a course; (3) one day at a time; (4) an OIL question nobody answered goes to the filer’s bell, and only his. |
| D710 | 9 Oct 26 | The list a delete shows of what it took away names the notes the man was taken off, one line a note — built as a small later job. |
| D706 | 9 Oct 26 | On a phone a window is as tall as what is in it, up to nearly the whole screen — never a short box to scroll inside while the screen above it stands empty; a window with little in it stays short. The three-quarters limit goes. |
| D703 | 9 Oct 26 | D686 is confirmed on his iPhone: a finger on a window no longer scrolls the page behind it — "it’s fixed". |
| D702 | 9 Oct 26 | An input filed for "ALL AVAIL" or "ALL" stands for whoever is free, worked out live — it changes as availability changes; members may choose it too; it shows on the day and the schedule only; on a weekend or holiday the filer answers the OIL question once for everyone (D660). Duties and other commitments only (D700). |
| D686 | 9 Oct 26 | A finger on a window never scrolls the page behind it: a scroll that begins on a window moves what is in the window, or nothing. |
| D682 | 9 Oct 26 | When whoever filed a shared input answers its OIL question again, the answer is written for everyone in it — a man’s own earlier answer, a "no" included, is replaced; the scheduler’s refusal on the day still wins. — changed by D762 |
| D716 | 9 Oct 26 | An input's own title, as recommended: (1) only the "Duty & other commitments" kinds take one, never leave or medical; (2) the title shows wherever the kind's name stands as a name, the kind small beside it where there is room; (3) "Other" takes the same title box and its remarks become plain remarks; (4) the remarks stay as they are. |
| D668 | 8 Oct 26 | The required P and required W rows keep their names: they are not renamed or customised; only the two available rows are his to rename and re-define (D640). |
| D665 | 8 Oct 26 | The Leave War's four rows (required P and W, available P and W) sit at the foot of the manning block, not under the event rows; built there, nothing covers the month buttons and the green open-bidding outline stays round the dates. — changed by D674 |
| D663 | 7 Oct 26 | In the changes window a group filing is one item — its kind and how many people, the names listed under it — not a line for each man; built in the calendar job. — changed by D736 |
| D661 | 7 Oct 26 | On the schedule a group input is one row holding everyone in it — not a row for each man. |
| D660 | 7 Oct 26 | When an input is filed for other people, the person filing it answers the OIL question for all of them, once, at the save — nobody is left to be asked by his own bell. — changed by D762, D738, D711, D682 |
| D645 | 7 Oct 26 | The Leave War's Event sheet is built as redrawn — a "Presets" row with the picked one lit, an optional name, "On grid" for the short form, the Kind row only under "Other…"; the grid shows the short form and a tap opens the full name and kind; every preset carries its own short form — PH, OFF, NL and SC to start. |
| D644 | 7 Oct 26 | The event sheet as drawn is too wordy — it carries fewer words; and its first row is not called "type": those buttons are the squadron's own ready-made events, set up by them, and the row — and the button that edits them — takes a word that says so. — changed by D645 |
| D642 | 7 Oct 26 | Saturday and Sunday start with no flying set; a no-fly day still shows and takes OFT and AMT commitments; the Leave War's panel for a picked block of people's days is brought into line with D641 in this job — it stays up and the grid behind it works — and the war's other windows are left for a job of their own. |
| D641 | 7 Oct 26 | Every pop-up window drawn in this job's mock-ups can be dragged around the screen, and the page behind it still works — clickable and editable — while the window is up. — changed by D642 |
| D640 | 7 Oct 26 | The available P and available W rows the SANS calendar reads are ordinary Leave War count rows: an admin can rename them in free text and change who they count — for example leaving out OCU — and the SANS calendar uses whatever they count. |
| D637 | 7 Oct 26 | The required P and required W rows are the typed ones (available is worked out); the four rows sit at the foot of the Leave War's manning block (D665 — first "Under the event rows"); a figure can run "from a date on", skipping weekends, public holidays, off days and no-fly days; there is no "SANS needed" row. — changed by D665 |
| D636 | 7 Oct 26 | The required pilots and WSOs are typed straight into their cells on the Leave War — no sheet to open — and several cells can be picked at once and given one number: shift and drag on a desktop, a long press and drag on a phone, and the long press and drag works on a desktop too, so nobody wonders why it does not. — changed by D637 |
| D634 | 7 Oct 26 | The Leave War's Event sheet stays as built — its coloured type chips, its tag row, "Edit types", the typed event, "This day" or "A range": nothing of it is removed or redrawn in this job. — changed by D643 |
| D605 | 6 Oct 26 | A man who is on leave or grounded for the whole day is flagged the moment he is seated anywhere that day — on a line or row with no times yet too; a part-day absence against a seat with no times stays silent (nothing to compare). |
| D603 | 6 Oct 26 | A blue/red answer can be changed to the other colour but not put back to "not chosen" once the sign-in has ended — left as built; undo still clears it while he is signed in. |
| D600 | 6 Oct 26 | The second press of "+ In-time / Rally" on a wave that already has a line copies that line's clock — left as built; only a wave's first line is filled with its earliest take-off less the Logic time (D510). |
| D599 | 6 Oct 26 | On Edit Schedule's week an open blue/red question waits on its day until it is answered or later is pressed — swiping or stepping to another day does not end it; on the Scheduler Board moving to another day still ends it (D535). |
| D598 | 6 Oct 26 | When a second formation needs a blue/red answer while another formation's question is still open, both questions show, each under its own formation; a newer question never removes an older one. |
| D597 | 6 Oct 26 | When a day has no button below its last open text box, tab from that box keeps the caret in it — nothing vanishes and no other day is reached; shift+tab goes back as before. |
| D594 | 5 Oct 26 | D593's details: the in-time / rally lines drag on the Scheduler Board only — Edit Schedule's week gets no drag and shows the board's order; auto sort (the wave's own and Sort all) orders them by time, earliest first — an evening-before clock before the same day's, a line with no clock last; a new order on a published day is a pending change. |
| D562 | 4 Oct 26 | Keep the existing close cross visible and reachable at the top while scrolling the Week Insights window. — changed by D563 |
| D561 | 4 Oct 26 | On Logic, keep search visible while scrolling alongside the controls already kept visible, and pack those buttons more closely into fewer rows. — changed by D563 |
| D558 | 4 Oct 26 | The owner accepts the phone Insights menu picture and authorizes its build: ellipsis then Insights on Edit Schedule and View-only Sched, with the drawer's week section removed. |
| D555 | 4 Oct 26 | Flow B includes the already-open headings and notes, continuing through open sections in their displayed order. |
| D554 | 4 Oct 26 | Tab uses flow B: callsign, mission, brief, take-off, landing, then remarks and stores text, on both Edit Schedule week and board; shift+tab reverses that sequence. — changed by D555 |
| D553 | 4 Oct 26 | After the day's last open text box, tab continues to the next normal button or control without looping or changing day; where the day has no button below that box, the caret stays in it (D597). — changed by D597 |
| D551 | 4 Oct 26 | Tab traverses only text boxes already available for typing, including empty ones; closed editors, folded sections and popups stay closed. — changed by D555 |
| D550 | 4 Oct 26 | The new tab route covers both Edit Schedule's week view and the Scheduler Board. |
| D548 | 4 Oct 26 | Fix only the phone board's desktop layout; leave the other investigated UI behaviours unchanged. |
| D546 | 4 Oct 26 | Defer the earlier day-scheduling and phone-usability priorities; the owner will introduce ideas during building. The keyboard and tab work stays pending. |
| D544 | 4 Oct 26 | Prioritise faster keyboard entry of times and notes in the workflow UI pass; keep the existing enter and Escape meanings. |
| D537 | 3 Oct 26 | On a phone a tall pop-up window runs up to a thin strip at the top of the visible screen — no large gap above it; a short window stays as tall as its content, at the bottom — only the calendars' day panels and the ALL AVAIL and changes windows; every other pop-up window stands in the middle (D997). — changed by D997, D996, D995 |
| D535 | 3 Oct 26 | An open blue/red question stays until blue, red or later is pressed, the formation's own mission or cue wording changes, the formation goes, or he moves to another week, version or sign-in — on the Scheduler Board, another day too (the week: D599); an unrelated edit that day, or another formation's question (D598), does not remove it. — changed by D599, D598 |
| D532 | 3 Oct 26 | Approve the final Insights look: temporary choose/change mission role below area, working/published context wording, latest-published read-only remarks access, chart and board entry placement. Build the agreed revised plan in this isolated build chat. |
| D531 | 3 Oct 26 | A mission box that contains DS or red but is not exactly DS, red or red air (for example DS-2, red air 2, ACM/DS) asks the blue/red question; it is never counted blue or red by guessing. |
| D530 | 3 Oct 26 | A blue/red answer counts in Insights at once, on a published day too: it needs no amendment and does not touch the day's sign-offs. A change to the mission or remarks wording on a published day still waits for its amendment. |
| D529 | 3 Oct 26 | Ask blue/red automatically only straight after the scheduler's own edit — to remarks or to the mission — leaves a formation needing an answer; otherwise show a temporary "Choose mission role" button while its remarks box is being edited. Passing through an unchanged remarks box never asks. |
| D527 | 3 Oct 26 | Offer change mission role temporarily while editing relevant remarks so a chosen blue/red answer can be corrected without rewriting the wording. |
| D526 | 3 Oct 26 | Save completed remarks even if the blue/red question is unanswered; keep ordinary total bars until the role is chosen. — changed by D530 |
| D525 | 3 Oct 26 | Remember the chosen formation role until its mission or relevant DS/red support wording changes; crew and timing changes do not ask again. |
| D524 | 3 Oct 26 | Approve the shown Logic Insights switch labelled track blue/red sorties, starting off. |
| D523 | 3 Oct 26 | When blue/red tracking is enabled, a person with unanswered flight roles keeps an ordinary total bar until those roles are chosen; do not guess colours; one gesture never opens several questions, but questions asked one at a time after his own edits stand together (D598). — changed by D598, D530 |
| D522 | 3 Oct 26 | Blue/red sortie tracking starts off for a squadron's first setup; enable it on Logic when wanted. |
| D521 | 3 Oct 26 | Blue/red sortie tracking can be turned on or off per squadron on the Logic page. |
| D520 | 3 Oct 26 | Approve the temporary blue/red question below the formation after leaving completed remarks; remarks stay visible and either answer removes the question's temporary space. — changed by D529 |
| D519 | 3 Oct 26 | Do not add a red indicator to schedule lines for Insights' mission role; the scheduler's remarks are enough. |
| D518 | 3 Oct 26 | When blue/red tracking is enabled, missions DS, red and red air count red without a question. For other missions, DS or red in remarks triggers a blue/red mission-role question; the remarks do not decide the answer. — changed by D531, D529, D521, D520 |
| D517 | 3 Oct 26 | Blue/red mission role applies to the whole formation; its aircraft are not on different sides. |
| D516 | 3 Oct 26 | SC, AVALON and BB standby duties do not count as flying load. SC main counts towards work hours. |
| D514 | 3 Oct 26 | DS for another formation means our flight is red air for them. DS wording may also name another formation supporting us, so a DS mention in remarks alone does not settle our blue/red category. |
| D513 | 3 Oct 26 | Insights initially shows the first twelve flying people, with a show all option for the rest. |
| D512 | 3 Oct 26 | When tracking is on and all a person's sortie roles are resolved, split their weekly bar into blue/red; mixed shows both. DS/red/red air are red; other missions are blue except D518's conditional answer. Any unanswered role keeps their ordinary total bar (D523). — changed by D523, D521, D518 |
| D511 | 3 Oct 26 | The words the "+ In-time / Rally" button fills in are a free-text setting in Logic, beside its time (D510); the default stays "in time + WX/NOTAMS". — changed by D1026 |
| D510 | 3 Oct 26 | The "+ In-time / Rally" button fills in a time set in Logic: the wave's earliest take-off less the "Nominal report before T/O" setting — 3 hours by default; on a wave that already has a line it copies that line's clock (D600). — changed by D600 |
| D509 | 3 Oct 26 | No timing-order problem blocks publishing: an in-time, rally or brief out of order shows as a red warning in the warning list and is explained while editing, and the day can still be published — like every other warning. A blank brief is checked as the suggested brief, and the message says "suggested brief". |
| D507 | 2 Oct 26 | Rally and flight brief may have the same time. Do not require a new gap between them; keep existing brief-before-take-off and exception checks. |
| D506 | 2 Oct 26 | For multiple applicable lines for the same formation and activity, use the earliest resolved time, regardless of line order. |
| D505 | 2 Oct 26 | Resolve formation-specific overrides separately for in-time and rally. A formation rally does not cancel the whole-wave in-time, or vice versa. Use the earliest applicable stage as report start. |
| D504 | 2 Oct 26 | Approve the actual-app in-time / rally label in its existing position. Reporting instructions apply to named formations or, when unnamed, the whole wave; do not add individual-person targeting. |
| D503 | 2 Oct 26 | Assume a reporting clock later than its applicable take-off clock is on the immediately preceding day, never more than one day back. Omit the routine reporting/day interpretation line and change day control. |
| D502 | 2 Oct 26 | Explain an incorrect timing pair during draft editing. Keep the draft editable and saveable; block publication until the timing conflict is corrected. — changed by D509 |
| D501 | 2 Oct 26 | Use one operative reporting clock per in-time / rally line, with activity wording and remarks. Preserve the existing recognised free-text format and formation callsigns. |
| D500 | 2 Oct 26 | Preserve existing formation callsign recognition in the in-time / rally design: a named formation gets that line; without a formation name, the line supplies the wave-wide time. Keep the existing free-text format for the typed lines, now for the in-time only; a formation's rally is its own box (D1026). — changed by D1026 |
| D498 | 2 Oct 26 | Assess the simpler in-time / rally box: the earliest applicable entered time is the flying wave report start; a person's earlier qualifying event may start their day sooner. — changed by D591, D502, D501 |
| D497 | 2 Oct 26 | Design rally time with three options: rally only, in-time with rally immediately after, or separate in-time and rally. The order is in-time, rally, brief, take-off, landing. Rally is the report start when in-time is absent. — changed by D1026, D502 |
| D488 | 2 Oct 26 | The "Discard marks" button is removed from the amendments box: a day not yet published keeps its change marks until it is published, which clears them as now. |
| D482 | 1 Oct 26 | A rule changed on the Logic page moves Insights' work hours at once, published days included — as built; it does not wait for an amendment. |
| D481 | 1 Oct 26 | The Scheduler Board gets a way to open Insights. |
| D479 | 1 Oct 26 | The amber "already on …" note stays: a drop that recreates a clash already hidden still says, once, to the scheduler doing it, that the man is already busy then — leave it. |
| D478 | 1 Oct 26 | Insights counts each day's latest published version — the original, or the latest amendment (AL1, AL2 …) — and the working copy only for a day not yet published; changes waiting on a published day are not counted until they go out. — changed by D530 |
| D475 | 1 Oct 26 | The hidden-warning mock-up is approved as drawn — the design of record for [WARN-HIDE-KEPT]: View-only Sched shows the struck-out line too, with no ↺; a day with every issue hidden keeps a quiet "✓ No issues" bar that opens the list; the hidden line is struck out and grey, dashed-outlined on Edit Schedule, its ↺ at full strength. |
| D472 | 1 Oct 26 | A hidden warning is not counted: a day with 3 issues and one hidden reads "2 issues" — no "1 hidden" beside it; the hidden one is seen only by opening the day's issues list, where its line is struck through and darker. |
| D471 | 1 Oct 26 | The hidden-warning change (D469) is built as its own job, on its own branch, after phase 7; a warning hidden on a day already published waits for the next amendment, like every other change to a published day; and the published and printed schedule drop the hidden item's flag too. |
| D469 | 1 Oct 26 | A hidden warning stays hidden — for everyone, across a reload and a sign-in — until someone unhides it; while it is hidden the pucks carry no flag for that item, and its line in the day's warning list stays where it is, struck out and darker, one tap from being flagged again. — changed by D475, D472, D471 |
| D454 | 29 Sep 26 | A take-over asks the holder first ("Saber asks to take over Tuesday" — Hand over / Keep editing); no answer within 1 minute hands it over; Keep editing tells the asker, who can still "Take over anyway" (asked again, noted in the history); every take-over first saves the day as a saved plan "<callsign> — at take-over HH:MM". |
| D452 | 29 Sep 26 | In the database, fast sync (every second) switches itself off after 20 minutes, or when the page is left, with a small note saying so; one tap turns it back on; the normal check every 30 seconds carries on. |
| D451 | 29 Sep 26 | A change on a day no one holds takes the day for the scheduler at once — the strip turns to "you're editing" — and the ✎ edit button stays as the other way in. |
| D450 | 29 Sep 26 | The day lock is firm: the database itself refuses a schedule save from anyone who does not hold that day — not only a sign on screen. |
| D356 | 29 Sep 26 | In the database: (A) "idle" means no change by the lock's holder on that day for 30 minutes (looking does not count), with a warning at 25; closing the page or signing out frees it at once; (B) changes save as they are made, "Done editing" releases the lock; (C) others' changes arrive by themselves every 30 seconds. |
| D355 | 29 Sep 26 | Once the app is in the database, a scheduler edits a day by taking it: the lock is per day (one day or several chosen), others see "<callsign> – editing" and read it only; it frees itself after 30 minutes idle, and an admin can take it over. — changed by D454, D451 |
| D367 | 29 Sep 26 | A flying line's callsign on the week wraps onto more lines and the cell grows downward, so the whole name always shows — never cut to "…" — on Edit Schedule, View-only Sched, a published day and the next-week peek; the column takes no more room from the remarks (76PX desktop, 50PX phone, 36PX on a phone under 375PX wide). |
| D363 | 29 Sep 26 | Loading an older issued version puts back every row that version had — a deleted request's row included — and the pending list names it ("… on the programme → deleted"); left as built. |
| D362 | 29 Sep 26 | AL8 and every later amendment wear AL7's orange; the tag's number tells them apart — left as it is, no new colours. |
| D361 | 29 Sep 26 | The ALL AVAIL count on a row with a start and no end stays as built — a plain number, the assumed hour named in the window a tap opens, set by the Logic tab (a change on a published day reads pending); a "?" where a row has no timing or no end time is a future job, filed. |
| D360 | 28 Sep 26 | ALL AVAIL / ALL on a row with a start but no end: count availability over the schedule’s one-hour Logic default and show the assumed time. Credit no OIL. Admin OIL views say “No OIL worked out — this row has no end time”; the public view shows only the assumption. Frozen at publication; changes are pending. No start: a ? opens the existing reason. |
| D346 | 28 Sep 26 | Three readings of the changes window stand as built: changes that belong to no single item sit under one group, "The day"; on a desktop a remark's gold dot sits at the far right of its column; in the week view an input covering two days shows as an item under each day. |
| D345 | 28 Sep 26 | Both mock-ups are the designs of record: [CHG-BY-ITEM] — the changes window grouped by item (the default, "Group by: Item / Who"), the latest-changed on top, every group open; [HIST-PHONE-HIDE] — the phone's "Hide ▾" to a slim bar and a gold dot on every detail with a history. |
| D344 | 28 Sep 26 | The history hint reads, in his words: "History on: Tap a gold dot on the schedule". |
| D340 | 28 Sep 26 | The changes window sorts by item and every line is labelled by its item first — the item in bold, the change under it, never the man first; one group per item, the group whose latest change is newest at the top, a sub-line per change inside an item changed more than once; settled by D345's approved mock-up, its calls with it. — changed by D345 |
| D339 | 28 Sep 26 | History on a phone says it is on and lets the schedule be seen: the hint "History on: Tap a gold dot on the schedule" (D344); "Hide ▾" sends the changes window to a slim bar at the bottom ("Show ▴" brings it back, ✕ turns History off); a gold dot on every detail with a history — as approved with D345's mock-up. — changed by D345, D344 |
| D338 | 28 Sep 26 | The one changes window's eleven readings stand as built — among them: the change history outlives a sign-out and a reload, what is new kept per person; one count per day; History mode is on while the window is open; the clock icon is on Edit Schedule only; members see the To go out tab, read only. |
| D337 | 28 Sep 26 | Deleting a man lists everything the delete took away, one line each, as built — changed by D710 |
| D279 | 27 Sep 26 | A struck name looks the same whether a tap will be refused or only warned — the words say which. |
| D278 | 27 Sep 26 | A placeholder (ALL / ALL AVAIL) may stand on a row twice — "one man, once per row" (D271) is about men. |
| D277 | 27 Sep 26 | In OIL Earn mode his own puck that earns nothing keeps its purple "this is you" ring, faded with the puck. |
| D276 | 27 Sep 26 | One man in both seats of one jet stays a warning (the red "two events at once"), not a refusal. |
| D275 | 27 Sep 26 | The desktop week goes back to no room beside the ‹ arrow — the day at the front sits flush at the left, the arrow floating over its first few pixels, as on `main`. |
| D274 | 27 Sep 26 | Three of the five-flags batch's four visible changes are approved as built — his own flagged puck without the glow, Leave War ⚙ Reset order, a swap inside one crowd without "already on"; the room beside the ‹ arrow was not approved. — changed by D275 |
| D272 | 27 Sep 26 | In OIL Earn mode his own puck shows the green OIL ring, not the purple one — the purple fill stays. |
| D271 | 27 Sep 26 | A man put on a row he is already on is refused — one man, once per row. |
| D270 | 27 Sep 26 | On your own puck a flag's ring wins over the purple "this is you" ring — amber, thin red, grey, dotted, as on anyone's puck, with no glow; the purple fill stays; in OIL Earn mode the green OIL ring shows too (D272). — changed by D877, D272 |
| D263 | 27 Sep 26 | The change history records every change to an absence, not only its filing and removal |
| D212 | 26 Sep 26 | The four sign-offs stay as they are: an admin picks all four names |
| D189 | 26 Sep 26 | Keep it: when a leave or downchit is stretched or trimmed, every published day it still covers reads "1 pending" and its sign-offs fall, because the "till <date>" note it printed is now out of date; View-only Sched keeps the old words until the next AL. |
| D188 | 26 Sep 26 | Confirmed as built (D185's reading): on a published face the Qualification-flag warnings and the crew-rest tight-turn note stay live; the crew-pairing warnings stay frozen and read pending when they change. |
| D187 | 26 Sep 26 | The board's (and the edit week's) 👁 look at a published version shows its warnings, as View-only Sched does |
| D186 | 26 Sep 26 | Keep it: a man's CAT / seat / posting on his puck and a blank line's suggested brief time stay as published until the next AL (a change reads pending, the four sign-offs fall); a callsign rename updates at once; this narrows the "no rule versioning" invariant for that one printed value. |
| D185 | 26 Sep 26 | A crew-rest or 7-day break on a published day, and a lapsed qualification, stay live on its face; a medical downchit stays frozen (D179 unchanged for it). |
| D184 | 26 Sep 26 | The 7-day run warning stays live on a published day's face too |
| D183 | 26 Sep 26 | The dotted "breaks tomorrow's crew rest" mark (and its RUN twin) stays live on a published day's face — an exception to D179's "freeze everything for now". |
| D179 | 25 Sep 26 | Everything on a published day freezes for now, and a change shows as pending for the admin — a medical downchit included; the exceptions ruled since stay live on the face: the dotted crew-rest mark and its RUN twin, a crew-rest or 7-day breach on the day, and the Qualification-flag warnings (D183, D184, D185). — changed by D185, D184, D183 |
| D178 | 25 Sep 26 | Every member input change after a day is published — filed, edited, deleted or moved — is a pending change for the admin, and the published face keeps what it was issued with; what still stays live on the face is D179's rule with its exceptions (D183, D184, D185). — changed by D179 |
| D177 | 25 Sep 26 | A leave filed after a day is published is a pending change: the day reads "1 pending", the four sign-offs fall, the published face keeps what it was issued with until the next AL — widened to every input change (D178); a medical downchit freezes and reads pending too (D179, D185). — changed by D185, D179, D178 |
| D176 | 25 Sep 26 | A request that was "taken off" when the day was published, and is since deleted (or re-dated off the day), is no pending change — the day reads 0 and the four sign-offs hold. |
| D175 | 25 Sep 26 | A load or a plan switch never puts a request on a second day: it leaves that row out and says so — built on its own small branch right after PR #435 merges, BEFORE `[ACCOUNTS]`. |
| D174 | 25 Sep 26 | A request that was not there when the day was published, filed since and then taken off, is no pending change — the day reads 0. |
| D172 | 25 Sep 26 | The corner tag on a changed puck of a day not yet published reads "OG", in the plain white dotted outline — shorter than "ORIG", never gold or amber; the day headings stay as they are: ORIG keeps its ticked seal (D111), the AL tags stay solid with no tick. |
| D171 | 25 Sep 26 | The ways into the changes window: members open it from a day's own count (no top-bar button); admins get a top-bar clock icon only — on Edit Schedule, desktop too — whose number counts what is new to you across the whole loaded week; every day heading's count stays the per-day way in. — changed by D338 |
| D170 | 25 Sep 26 | No hand over button. Changes are "new to you" until you mark them seen — like unread email. |
| D169 | 25 Sep 26 | Members see the full change history too — who changed what, on every day — from View-only Sched via the live working copy, read only; a medical change in full too (D211). — changed by D211 |
| D168 | 25 Sep 26 | One changes window for the whole app — the published day's pending list, an unpublished day's hand-over list and the Edit history list merged: movable, resizable, a day picker, "Group by", a tap goes there; grouped by item, every line led by its item (D340). — changed by D340 |
| D167 | 25 Sep 26 | The changes list is a movable, resizable window that does not block the schedule (on a phone a bottom panel that shrinks to a bar); a tap takes the schedule to the change and the window stays; it lists people and sittings, not hand overs (D170); every group opens by default (D345). — changed by D345, D170 |
| D119 | 25 Sep 26 | The pending list shows the newest change first, as edit history does. |
| D118 | 25 Sep 26 | An unpublished day's count must not miscount or be untappable: it is a hand-over between schedulers, the next one seeing what changed — settled by D170: changes are "new to you" until you mark them seen; the hollow corner tag reads "OG" (D172). — changed by D172, D170 |
| D117 | 25 Sep 26 | The edit history list shows the whole week, with a day picker to narrow it to one day. |
| D116 | 25 Sep 26 | Edit Schedule's History button works like the board's: a toggle. |
| D114 | 25 Sep 26 | Taking an accepted request off a published day is one pending change, not two. |
| D113 | 25 Sep 26 | A replacement in one seat is one pending change. |
| D111 | 25 Sep 26 | The ORIG tag is "A1, seal": a faint white wash, a thin light outline, and a drawn tick in a white disc before "ORIG" |
| D110 | 25 Sep 26 | The ORIG tag takes option A's direction — no colour, a tick — and gets a nicer design within it. |
| D109 | 25 Sep 26 | A man moved from one place to another on the same day is one pending change, not two. |
| D107 | 25 Sep 26 | A tap on a change in edit history keeps him on the page he is on. |
| D105 | 25 Sep 26 | The change bubble stays — hover on a desktop, tap on a phone — and a long one scrolls inside itself. |
| D103 | 25 Sep 26 | Any change that shows as pending on a published day wipes the sign-offs — one rule: something waiting means sign again. |
| D102 | 25 Sep 26 | The slim "Signed ALn" line under the day head — on View-only Sched, the Scheduler Board and the edit week. |
| D101 | 25 Sep 26 | No "Reissue AL1" button: after an Unpublish the withdrawn amendment's changes stay on the working copy as pending, and "Publish AL1" brings the day back. |
| D100 | 25 Sep 26 | The pending-list mock-up was approved, look and function, as D99's design of record: "N pending ▾" opens the short list of what will go out (where, before → after, who, when), a tap takes the view to it, a long list scrolls inside the window — since D168 that list lives in the one changes window. — changed by D168 |
| D99 | 25 Sep 26 | "N pending" becomes a button that lists what is waiting to go out on that day, and tapping an item takes the view to it. |
| D98 | 25 Sep 26 | A day that is back to what was published shows nothing pending and is no amendment — and "Load onto working copy" must get it there. |
| D97 | 25 Sep 26 | The working-copy marker on a published day with changes waiting has two states: "Not yet signed" while any of the four sign-offs is missing or no longer valid; "Not yet published" once all four are valid — never on the issued face. |
| D96 | 25 Sep 26 | A day template cannot be applied to a published day. |
| D95 | 25 Sep 26 | View-only Sched shows who signed off each published version — the original and every amendment — compactly. |
| D94 | 25 Sep 26 | The board draws all three warning rings as the edit week does |
| D93 | 24 Sep 26 | The mock-up is the design of record for [AMEND-MARK-RING-CLASH]: a change waiting to go out is a hollow ALn tag with no dotted line round the puck (a published one its solid tag, no ring); a puck's edge carries only its warnings; times, areas and remarks keep their marks. |
| D92 | 24 Sep 26 | A published change on a puck is marked by its solid ALn tag only — no ring round the puck. |
| D91 | 24 Sep 26 | Don't build it. Taking a man off a seat leaves no mark on the row |
| D161 | 24 Sep 26 | Not now — [ADMIN-DISPLAY] stays open and unbuilt; put it to him again when Admin or the section folds are next touched, not before. |
| D77 | 23 Sep 26 | No phone resize corner for the ALL AVAIL window: on a phone it keeps the full-width bottom panel (62% tall), movable, not resizable; desktop resizing unchanged — do not build it or ask again unless he raises it. |
| D66 | 23 Sep 26 | The ALL AVAIL window closes when he changes page — and on a switch between Edit Schedule and View-only Sched, a week change and logout; a click on the schedule behind it never closes it. |
| D65 | 23 Sep 26 | A tap on a man in the ALL AVAIL window depends on the mode: with OIL Earn off it highlights him everywhere (the ordinary selection) and the window shows his reason; with OIL Earn on it only switches his earning and selects nothing. |
| D51 | 22 Sep 26 | Pilots left, WSOs right when a crowd opens on a phone in the earn mode — but this adds nothing new and is not built on its own: it is D38–D41's ALL AVAIL window ([ALL-AVAIL-WINDOW]), which shows the crowd as real pucks in two columns; do not patch two-across into the in-row crowd. |
| D50 | 22 Sep 26 | A sim row always shows one spare seat, even when it is full. |
| D47 | 22 Sep 26 | D33 stands whole: ALL / ALL AVAIL are refused on flying-line cockpit seats at every door, but a placeholder still arms its seat everywhere else it is legal, and tapping an empty cockpit seat still narrows the crew list — only the cockpit instance of the 13 Aug shortcut is gone. |
| D45 | 22 Sep 26 | Nothing on a published schedule may change without the scheduler acknowledging it — the standing test for any change that touches an issued day: who was available is frozen at publication, a later change shows as pending (cleared by an amendment or the EOD version), every day the same; any pending change now wipes the sign-offs (D103). — changed by D103 |
| D44 | 22 Sep 26 | Who was behind a placeholder puck is frozen at publication on every day, earning or not. |
| D41 | 22 Sep 26 | The ALL AVAIL window mock-up is the design of record for [ALL-AVAIL-WINDOW]: movable by the six-dot grip, resizable, non-blocking; one puck per row, pilots left, WSOs right; 212px default, 186px floor; reasons under pucks; a counter with no "free"; the OIL tab only while OIL Earn is on. |
| D40 | 22 Sep 26 | The window opens skinny, and its drag handle is the app’s own six-dot grip. |
| D39 | 22 Sep 26 | Two fixes to the ALL AVAIL window's default, both from his own picture: one puck per row — each column a list running down, pilots left, WSOs right, at every width; and the counter chip drops the word "free" (it reads "ALL AVAIL · 27"). |
| D38 | 22 Sep 26 | The name bubble is replaced by a movable, non-blocking window of real pucks — pilots left, WSOs right, flagged, clickable — serving both counters (who is available, who is credited OIL); resizable on desktop, not on a phone (D77). — changed by D77 |
| D37 | 22 Sep 26 | The count stays, on every seat the puck can land on — but it must read as what it is, not as a promise. |
| D36 | 22 Sep 26 | The availability window stays narrow — step before take-off to dekit after landing. Do not widen it to the report or the debrief. |
| D33 | 22 Sep 26 | The two placeholder pucks (ALL / ALL AVAIL) are refused on flying lines only — both cockpit seats of every flying line, with the reason on screen; everywhere else they land (sim seats, duty desks, passengers, extras, ground and programme rows), and there they earn by default (D43). — changed by D43 |
| D27 | 22 Sep 26 | ALL AVAIL / ALL are a scheduling feature, not an OIL feature: dropped anywhere, the puck works out who would be available and shows the count, with OIL Earn off too; where they earn is D43's rule — on by default wherever they land. — changed by D43 |

## Settled before this list — moved from `raptor-port/CLAUDE.md` §Stable decisions (24 Sep 26)

**CLOSED: a new decision is a row in the table above, with a D-number — never a line added here.** These are
the scheduler's (the board, the week, the waves and duties, time, inputs and Admin) settled decisions from before the rulings list began (21 Sep 26), MOVED WHOLE, word for word
(D138), so they load with this area instead of in every chat (D140). Where a row above changes an entry
here, the row wins (newest instruction wins). The preamble they carried in `raptor-port/CLAUDE.md`, unchanged:

Each entry is a tripwire: the decision is SETTLED — don't rebuild, re-propose or
re-litigate it. Where a reference doc holds the full story, the line keeps the
decision + a pointer. Owner + date establish authority; keep them.

### The late-input mark (owner, 9 Aug 26 unless noted)
Rules: `docs/engine-rules.md` §The late-input mark. Placement: `docs/ui-contracts.md`
§The late-input mark on screen, §The LATE marks can be dropped per input.
- **It is a MARK, not a warning** — never in the checks list, never closes a slot,
  invisible to `validate()`. Measures the input's **last change**, not first
  submission (an early input amended after the deadline reads late).
- **Downchits are EXEMPT** (going DNIF isn't planned); leave and overseas duty stay
  in scope (they're applied for). Don't re-propose either.
- **It reads in the REMARKS cell**, not beside name/type (moved there the day after
  it shipped) — except the board's promoted ground row (bare `<input>`, no room to
  nest a chip) which keeps its amber row edge.
- **The word stays a word — a compact dot was OFFERED and DECLINED.** Measured on an
  11-input day: desktop costs nothing (666px w/ and w/o); phone costs 33px over 11
  rows (757 vs 724) and splits long remarks mid-word ("Medic al appt"); a dot
  measured 724 (free). Owner kept the word and the cost. Dead ends, don't retry:
  word at END of remark saved nothing (759); turning off mid-word breaking saved
  nothing (757). Don't "fix" the split by shrinking the badge — its WIDTH is the
  whole cost. (These measurements live only here.)
- **It CAN be dropped per input** (owner, 21 Aug 26; REPLACED the 20 Aug global
  "Hide LATE marks" button, now removed). A session-only forgiven registry
  (`LATEOFF` in `state/view.ts`) with the way back = tapping the same chip again.
  Three fixed parts: the board's LIVE rows (Personal Inputs + Unavailable) always
  draw a clickable `latechip` (solid shown, dim ghost dropped); the GATE is at the
  passive printers (`ui/html.ts lateShown`, `isLateInput` still answers); the Inputs
  page KEEPS printing it (paperwork record). Admin-only at the write path, cleared
  on login/logout. Don't move the gate into the engine, don't bring back the global
  button, don't silence the Inputs page.

### Board behaviour
- **No warning / advisory / note counts in the top bar** (owner, 20 Aug 26). The
  three `pillbtn` counts are gone (each day leads with its own "N issues · N
  warning · tap to review"). `openWarns` KEPT with no caller (reference behaviour /
  future "expand everything"). Pinned in `app.test.tsx` — don't put the sum back.
- **Nothing on the board re-orders itself** (owner, 10 Aug 26 — "prevent … the line
  jumps"). Auto sort / Sort all are the only reorderers, by START TIME not role
  rank. Don't add an automatic sort to any board list. (The Ground Programme's
  render-time time sort predates this and stays — time-less rows sink to append.)
- **MAIN/SPARE on a standalone line is a clickable BADGE in the remarks cell; a click
  flips the line** (owner, 24 Aug 26; supersedes the 10 Aug ghost-text). `saRoleHTML`
  draws it week+board (button in edit mode, chip read-only); placeholder is plain
  `Remarks`. The flip is ENGINE-VISIBLE: `a.spare`+`a.role` flip together,
  `scSpare`/`saExempt`/shift count follow, marks the `st:` key pending (rides next
  AL). Next-week peek keeps role as fallback text (`saRoleText`). Don't restore the
  placeholder or make the flip label-only. Pins: `sarole.test.tsx`.
- **On SC, the B box is an IN-TIME; its sortie furniture is gone** (owner, 24 Aug 26,
  SC only; AVALON/BB untouched). Board drops the SC header "in-time · N ac" note; SC
  lines lose the blue suggested-brief ghost but KEEP the empty B box; the engine
  reads a typed SC `f.br` as the crew's in-time (`events.ts` → `intime`,
  `insOf` anchors crew rest on the earlier of it and shift start). Blank = byte-
  identical to before. Extended same day: an early B on a MAIN starts the long-day/
  duty-hours span (`workSpan` = `min(report,start)`), and anything cutting into the
  B→start window raises the amber `SC_INTIME` advisory (already-overlapping events
  stay with the hard-clash loop). SPARE rows have no event stream (both MAIN-only).
  Known seam (documented, don't silently "fix"): the SC in-time shows on the board
  only — the desktop week renders SC as SHIFT/START/END with no B, so a board value
  isn't mirrored to the week. Owner said it'll be rare; raise mirroring only if he
  asks. Pins: `scintime.test.ts`, `scboard.test.tsx`. Rules: `engine-rules.md`;
  placement: `ui-contracts.md` §The B box.
- **Amendment marks are a PUBLISHED-day thing — a draft day shows none** (owner,
  25 Aug 26). `alAttr` emits `data-alp`/`data-aln` only when `dayApproved`; a draft
  edit emits nothing but is still tracked in `SCHED.pending` (count/publish/History
  unchanged — History finds cells by key+edit log). Don't re-add a draft-day mark.
  Pinned in `publish.test.ts`/`interact.test.tsx`; `ui-contracts.md` §Amendment marks.
- **A new flying line comes up blank** (owner, 10 Aug 26) — `+ Line` no longer copies
  the previous callsign/mission/times. **`+ Wave` follows the same rule** (owner,
  25 Aug 26): a plain flying wave's first line is blank (`cs/msn/to/ld` empty),
  byte-identical to a `+ Line` add — no more `NEW / 12:00 / 13:00` seed and its green
  suggested-brief. Standalone waves (`makeStandalone`) keep their kind-specific
  structure (the `!kind` branch only). Pinned in `board.test.tsx`.

### Waves & duties — templates and defaults
- **Duties are decoupled from waves** (owner, 13 Aug 26; supersedes 10 Aug "AVALON
  auto-creates its desk"). No wave auto-creates a duty desk (AVALON included);
  deleting a wave leaves duty blocks alone. Every desk comes from the `+ Block`
  template picker (`engine/dutytpl.ts`, persisted): a chosen template copies onto the
  day as a block carrying the template's WAVE, if it names one (owner, 7 Sep 26 —
  "a duty role that falls under AVALON will not have any warning … unless OL, HL,
  OML, ATT C, OD" / "sc duties desk … not … the same time as main or spare"): the
  editor's "For wave" picker (None / SC / AVALON / BB) → `blockFromTpl` mints `sa`
  (+ `noconf` for AVALON and BB — BB is AVALON's twin, owner 7 Sep 26), so that
  desk is exempt as its wave is and earns no
  OIL, an SC desk is an SC seat for the spare rule, and a template with no wave
  mints the PLAIN block it always did. This amends the 13 Aug "always plain"
  clause; the decoupling itself stands. Seed week carries no template desk, parity
  untouched. Editor `ui/DutyTplModal.tsx`. Do NOT re-add
  `SAWAVE.autoDuty` or the wave-delete → `saDutyIx` linkage (`waveDutyBlock`/
  `saDutyIx` remain in `waves.ts` only for old AL snapshots).
- **Flying-wave templates + a + Wave show/hide list** (owner, 25 Aug 26). Sibling of
  duty templates one level up: `engine/wavetpl.ts` library, `ui/WaveTplModal.tsx`
  editor (from the + Wave pencil, `WAVEEDIT`), `+ Wave` lists templates beside its 4
  built-in kinds. Template `{id,title,kind,lines}`: **one rule-set per template** —
  exactly one of `fly`/`sc`/`avalon`/`bb`. Placing one mints an ordinary wave
  (`waveFromTpl`) whose OWN kind flags drive checking — `validate.ts` never reads a
  template, parity untouched. **A STANDBY-kind template mints the built-in's SHAPE**
  (owner, 26 Aug 26): consecutive same-shift lines become ONE formation with a crew
  row per line (like `makeStandalone`); a fly line stays one formation per line —
  don't return the standby mint to 1:1. Times store raw, normalise on blur/mint/load
  (`waveTime`, colon form `07:00`). Show/hide via a `WAVEHIDE` set (default all-shown,
  deleted template drops its flag), persisted (`wavetpl`+`wavehide`), boot-loaded,
  untrusted storage clamped. Don't seed built-in templates (library starts empty),
  don't make `validate` read a template, don't move the gate off `WAVEHIDE`. Pins:
  `wavetpl.test.ts`, `WaveTplModal.test.tsx`, `wavepicker.test.tsx`.
  - **Manage + edit are ONE sheet, ONE gear** (owner, 30 Aug 26; folds in the 29 Aug
    "remove it from Admin"). The + Wave menu carries a single ⚙ (`data-wvedit`) +
    "N hidden · Manage", both opening the unified `WaveTplModal.tsx` (edits templates
    AND shows/hides/deletes: a "Wave types" list with an EYE per built-in kind,
    `setWaveHidden`; per template an EYE + footer Delete; built-ins hide but never
    delete). Old `WaveManageSheet.tsx`/`WAVEMANAGE` DELETED — don't re-add it or a
    second button. Admin's `WaveVisibility` stays REMOVED; Admin keeps only the
    template-editor button (same sheet). Don't strand a hidden wave — the "N hidden"
    line + eyes are the way back.
  - **Kind-picker rule notes have ONE source, on the picker AND the Logic page**
    (owner, 30 Aug 26). `wavetpl.kindNote(k)` is the single count-free summary of
    each kind's checking rule, verified against `validate.ts`/`events.ts`; the editor
    and the Logic "Wave types at a glance" group render the SAME strings. Deliberately
    NOT `SAWAVE.note` (keeps its "2 MAIN + 2 SPARE" count for the built-in popup where
    the count is real). When a kind's rule changes, update rule + `kindNote` + the
    Logic "standby lines" row together (`logic.test.tsx` pins it). *[AMENDED 15 Oct 26 by D928 (the Logic page
    rewritten): the "Wave types at a glance" group and "The standby lines" are gone; each kind's `kindNote` is now one
    check line on the Logic page (Flying lines; Standby) — still the SAME strings, still pinned by `logic.test.tsx`.]*
  - **The leave/absence "what each type costs" sentence has ONE source too** (owner,
    30 Aug 26), shared by the Inputs "?" legend and the Logic type matrix.
    `inputs.ts inputRuleText(t)`, derived from the enforced flags; both `InputsPage`
    and `logic-html.ts` read it (they'd drifted). `inputs.test.tsx`/`logic.test.tsx`
    guard it. *[AMENDED 15 Oct 26 by D928: the Logic page's type matrix is gone with its rewrite — the Inputs "?"
    legend is the sentence's one reader now, guarded by `inputs.test.tsx`.]* Deliberately still separate, don't "helpfully" merge: `SAWAVE.note`,
    the `satag` caption, the OIL-confirm prose (different jobs/voices).
- **The DEFAULT arrangement is admin-set; the wave half is "new schedules only"**
  (owner, 29 Aug 26 pt.2). Admin → Squadron config → **Default arrangement** panel,
  two ▲▼ lists persisted on the `wavehide` footing: **section order**
  (`engine/order.ts SEC_DEFAULT`, `secdefault`) is display-only fallback `secOrder`
  uses for un-arranged sections (hand-arranged day still wins, canonical baseline
  keeps 728/0); **wave order** (`engine/reorder.ts WAVE_DEFAULT`, `wavedefault`,
  default OFF) applies ONLY at wave-add on a not-signed-off day. DON'T make the wave
  default reorder existing/published days, and DON'T give it a display-only layer (it
  would fight `sortWaves`). Unset = append. Pins: `arrdefaults.test.ts`,
  `wavedefault-add.test.tsx`, `admin.test.tsx`.

### Drag-reordering (sections, waves, dense rows)
Contract: `docs/ui-contracts.md` §Dragging sections and waves, §Dense row reorder.
- **Sections and waves re-order by IN-PLACE DRAG, not a sheet** (owner, 30 Aug 26;
  the 29 Aug `⇅ Arrange` sheet is DELETED). One machine `ui/rowdrag.ts` (board wrap +
  edit-week root) tells section/wave/row apart by the grip pressed and validates via
  `applyMove`'s same-container rule. Grips draggable at EVERY width. The SECTION grip
  is the SAME dotted `⠿` (owner, 31 Aug 26, reversing the 30 Aug drawn-rail),
  placed INLINE at the panel header (not an overlay rail); headers set
  `user-select:none`. Don't turn it back into a rail or drop the no-select. Don't add
  arrows back to any of them.
  - **Overall Notes and Common Programme are two SEPARATE draggable board sections**
    (owner, 31 Aug 26). On the EDIT WEEK day notes still print inside the Common
    Programme block, so the week keeps 'notes' EMPTY/skipped (keeps view week ==
    reference byte-identical). The week's Flying-waves `.wv-sech` header stays (its
    grip needs a header; stripped in the reference compare).
  - **The four CREW WORKING-AID panels join the SAME draggable list** (owner, 31 Aug
    26): Personal Inputs, Available crew, SANS availability, Unavailable are ordinary
    section keys, each a `.sb-sec` card. **They drag on the EDIT SCHEDULER too** —
    `dayHTML` in EDIT mode emits all ten sections through the SAME `secOrder` loop, so
    a drag on either surface drives the ONE per-day order. The VIEW week is UNTOUCHED
    and parity-locked (four not draggable, only Unavailable prints in its fixed tail;
    whole change gated on `ed`, 728/0). This is a scheduler WORKSPACE arrangement, not
    a published property. A SECTION drag is display-only (`moveSectionTo` →
    `reorderSectionTo`, histPush, no markEdit) then offers the "Set default order?"
    snackbar (`SecDefaultSnackbar.tsx`, promotes via the SAME `setSecDefault` as
    Admin). A WAVE drag is a real amendment (`applyMove('mv:w…')` → `moveWave`). A held
    drag AUTO-SCROLLS at screen edges (`pointermove` on the DOCUMENT — don't move it
    back onto the container). Don't fold the crew panels into a fixed tail or let
    their order reach the VIEW week. The old one-week "Apply to all days" is GONE.
    Pins: `rowdrag.test.tsx`, `SecDefaultSnackbar.test.tsx`, `board.test.tsx`,
    `html.test.ts`.
- **Dense ROW reorder is by DRAG too — the ▲▼ nudge is GONE** (owner, 31 Aug 26;
  reverses the 8 Aug "phone hides grip, shows ▲▼"). Every dense row shows its dotted
  `⠿` at ALL widths; `sbNudge` returns '' (also ~2 nodes/row off the board budget);
  phone grid gains a leading marker track, first box shortens by it, each box stays
  under its heading. A same-week follow-up widened the lane 13→20px (glyph
  left-aligned, handle clear of the first box) and shifted puck containers to span
  track 1 (`.sb-line .sb-seatpair 1/4`, `.sb-arow.c6r>.ppl 1/3`) so crew pucks go
  flush-left and a two-wide box's second puck clears the remarks. No puck resized.
  **ALIGNMENT is a HARD RULE**: every grip's centre measured to delta-0 against the
  box beside it (flying-line grip bottom-aligns `align-self:end;height:24px`; c6r/
  notes centre naturally). Don't re-add ▲▼, don't hide the row grip on a phone, don't
  move a grip without re-measuring delta-0. `boardMbtn mv:up/dn` stays as inert guard.
  Pins: `rowdrag.test.tsx`, `board.test.tsx`.
- **No ⋯ collapse of the phone row control strips** (owner, 16 Aug 26 — built +
  rolled back same day). Row `▲▼/CX/■/✕` strips stay always-visible on a phone; the
  `CTLOPEN` implementation is one `git revert` away — don't rebuild or re-propose.
  Sibling touches from that batch (aircrew-tab gutter, plural warnings, week's faded
  `Remarks` placeholder) STAND; only the ⋯ collapse was undone (and the batch's
  4-digit board input times were later reversed by the 30 Aug hh:mm decision).

### Time format
- **EVERY time in the app reads `08:00` — colon, 24-hour, everywhere** (owner, 30 Aug
  26, reversing their own 29 Aug "just 0800"). hh:mm is native and the reference gate
  PINS it (`tfin.js`). Three layers: **Display** wraps every stored time in
  `engine/time.ts fmtHM` (the ONE display fold; board renderers, week already folds
  via `fmtT`); **Minting** `dutytpl.tplTime`/`DUTYTPL_STD`/`waveDutyBlock`/"+ In time"
  now mint `07:00` (old templates refold on load); **Typing** every box accepts
  `800`/`0800`/`8:00`/`08:00` (`parseHM`), shows hh:mm after commit (user never types
  the colon). Engine untouched (readers go through `parseHM`), parity **728/0**. ONE
  deliberate 4-digit survivor: the AREA window token (`0800-0900`, `atimeText`) — the
  reference pins it compact; changing it needs owner sign-off. Don't add a second
  display formatter — `fmtHM` is the one. `ui-contracts.md` §Every time reads hh:mm.

### Week navigation & cross-week continuity
- **The phone board's top bar is ONE row; the day is STEPPED BY ARROWS** (owner,
  11–12 Aug 26). Getting the bar from 166→70px was the whole point — don't add a
  control to its FIRST LINE without taking one off (the geometry gate counts ROWS).
  History added an 8th button and stayed at 70px only because the same change fixed
  `.sb-title` to shrink (`flex:1 1 0`) — that was the last free 33px; the next control
  must displace one (the changes list is the worked alternative — it went to the
  checks panel). `+ Line` is off the bar (every wave header has one); labels icon-only
  under 820px. **The swipe is GONE (12 Aug); do not rebuild it** — `#sbPrevDay`/
  `#sbNextDay` call `boardDayStep(±1)`, CONTINUOUS across weeks since 22 Aug
  (`loadWeek`+`boardTab`; don't re-add the end-of-week `disabled`). `#sbCal` opens the
  week picker in 'board' context. Arrows flank the DAY STRIP (bar 70→75px). Above
  820px they aren't drawn (desktop has 7 day chips). The Mon–Sun chips became dots
  then LEFT the phone bar on 23 Aug (freed row carries `#searchB`+`#sbHl`), removal is
  CSS `display:none` so `dayTabsHTML`/`wireDayDots`/jsdom tests untouched. **Day name
  is THREE letters on a phone** (12 Aug — split `Wed`+`.bl` tail, desktop still reads
  `Wednesday` off one path; don't restore/ shorten). The DESKTOP scrub survives
  (Mon–Sun chips): every chip keeps its footprint whatever is selected — don't grow
  the current one. `boardTab` is view-only (must not validate; its board lane must not
  wake EditWeek/EditRoster). `ui-contracts.md` §The board on a phone is ONE window.
- **Week navigation is a rolling window + a calendar, and it is CONTINUOUS** (owner,
  22–25 Aug 26). The fixed 5-chip `WEEKS` strip is gone; `weekWindow(CURWEEK)`
  (`ui/weeknav.ts`) draws four `data-wk` buttons (prev·current·+1·+2, re-centring).
  `WeekCal` (single-date, whole-week highlight) jumps to any day's week; it's a DAY
  picker (loads that week AND lands that exact day) — don't turn it back into a
  week-row picker. All week/Monday math lives in `weeknav.ts` (one drift seam). The
  big `#vTitle`/`#vSub` were removed as clutter (cards carry dates) — don't re-add
  them, the fixed chips, or the end-of-week clamp. `WEEKS` kept for probe-bridge/
  reference only. Pinned mechanics:
  - **Phone**: view/edit stepped day-to-day by SWIPE, continuous across weeks
    (`pan.ts` edge-overswipe + `WEEKJUMP`). A wave-dense day no longer traps it
    (owner, 23 Aug) — the `.go` block's ownership is decided at touch-END (a wave
    already at its edge lets the gesture fall through); don't restore the touch-start
    `.go` bail. The cross GLIDES (owner, 23 Aug, `ui/weekglide.ts:beginGlide`,
    phone-only ≤820px, reduced-motion-aware, no-ops without layout). It slides TWO
    FROZEN CLONES (owner, 24 Aug) — outgoing frozen on the finger's day, incoming
    frozen on its landing day, both `overflow:hidden` so neither scrolls/flings, real
    week painted but COVERED behind them (`pointer-events:none`, never
    `visibility:hidden` — 5 Sep 26, a hidden week came back unpainted). Load-bearing
    details: landing day derives from cross DIRECTION (`fwd?0:weekScrollMax`), NOT
    live `scrollLeft`; the clone box is as TALL as the taller of the two weeks,
    measured on both sides of the swap (5 Sep 26 — sized from the leaving week it
    clipped a tall arriving Monday at a short week's height: the "split" / "lower
    half black"); each clone is ONE opaque day card (`snapshot()`), inserted
    ON-SCREEN under the leaving one and left two frames to paint before it slides;
    real week covered so its fling/snap never shows. Clones at `z-index` 40/41,
    BELOW the sticky `.topbar` (60) — keep them under the chrome. Don't slide the
    live week, use a single clone, size a clone from one week, clone the whole
    week, or start a clone off-screen.
    Swipe NOT locked to one day (owner kept this) — no `scroll-snap-stop`; within-week
    swipes never glide, desktop instant.
  - **Desktop arrows are continuous across weeks** (owner, 23 Aug), landings instant.
    They **walk EVERY live day incl Sat/Sun to the FRONT before crossing** —
    `weekScrollMax` = "last live day at the front" (`(liveDays−1)×dayStep` clamped),
    the next-week peek's real columns are the runway; the JS-sized trailing spacer
    stays (`.week::after`/`--week-tail`, desktop only). Don't reintroduce a fixed
    `calc()` spacer or the flush-right ceiling. **One press = one day even mid-glide,
    both directions** — `panDays` counts from the COMMANDED target (`panTgt`) via a
    BURST CORRIDOR anchored at the burst start (`panAnchor`→`panTgt` = `panBase`); a
    manual pan or new week drops it. Don't narrow the corridor back to the last step.
    **A park NEAR a boundary counts as ON it, and a plain horizontal wheel drops the
    corridor** (owner, 24 Aug) — `PARK_TOL` 0.35-of-a-day decides step counting and
    edge-cross; `onWheel` drops `panWk` on any plain horizontal tick. Don't shrink
    `PARK_TOL` to a hairline or remove the deltaX invalidation. **The glide OWNS the
    week while in flight** (owner, 24–25 Aug) — the proxy scrollbar and any repaint
    are pure FOLLOWERS: `panDays` arms a short `glideEnd`/`GLIDE_MS` window (cleared on
    land or manual pan) during which `onTrackScroll` never drives the week, and a
    mid-glide repaint holds the glide's TARGET (`panHold` in EditWeek/ViewWeek), not
    the captured mid-glide position; `mirrorToTrack` records `trkEcho`. Don't remove
    the `glideEnd` guard, revert `panHold` to pinning live `sl`, or let `onTrackScroll`
    write unconditionally. Pinned `pan.test.tsx`; `ui-contracts.md` §desktop arrow
    glide + §spacer; `performance.md` §Single-writer during a glide.
  - **The desktop scheduler BOARD now has week navigation** (owner, 23 Aug) — `‹ ›`
    week-jump chips inside `#sbDays` (`data-sbweek`, `boardWeekStep`, one press = a
    week keeping the open day); `#sbDays` is `display:none` on a phone so the phone
    board keeps its edge arrows. The `.crew-hint` edge hint stays RETIRED.
- **Personal INPUTS are GLOBAL, not week-scoped** (owner, 22 Aug 26). `loadWeek` swaps
  DAYS/DATES but NOT `INPUTS`; every authored week's inputs merge into one `INPUTS`
  at boot (idempotent, boot-only → parity 728/0). Each week's schedule shows only its
  own (builders match by DATE). Gotcha kept in `loadWeek`: it clears every input's
  `acc` so `autoAcceptSeedInputs` re-lands date-matching rows on the fresh days. Don't
  re-add the `INPUTS` swap or move the `acc` clear. Flow: `feature-impact.md` §Flow E.
- **The flagging engine reads across week boundaries** (owner, 23 Aug 26). Two rules
  fixed to look past the loaded week: `DAYS_RUN` (`VCONF.maxRun`) walks in seeded days
  before Monday; Monday's `CREW_REST`/`CREW_TIGHT` runs against the previous week's
  Sunday (so `REST[0]` is real). Bounded to those lookbacks + one lookahead day (the
  midnight-tail sliver past Sunday + the forward crew-rest trace); nothing else looks
  further — don't widen either window without a named case. **A flag still lands on the
  day it BREAKS**: next Monday's breach only becomes clickable when next week is
  loaded. **The forward "Breaks Monday" trace** (owner asked from the deployed site,
  23 Aug, reversing this entry's old "don't build a same-page hint") — a loaded week's
  Sunday whose late finish busts next Monday draws the same trace box, off
  `nextMondaySeed` + a phantom pass of the real `crewRestDay` (one body, two callers,
  can't drift); it carries `di:null` (no jump target) and writes no second warning.
  `CREW_TIGHT` never traces. Session edits ARE read now via the stash
  (`weekctx.ts:bundle()` checks it before the pure seed); `SCHED`/publish state still
  isn't read by these seed functions. Rules: `engine-rules.md` §validation/crew rest;
  screen: `ui-contracts.md` §Three crew-rest rings; `feature-impact.md` Flow F.
- **Weeks remember their edits — the per-week stash** (owner, 23 Aug 26).
  `engine/weekstash.ts` remembers, per week-start key, the last snapshot `loadWeek`
  handed it on the way OUT — decided parts:
  - **SUPERSEDED 17 Sep 26 — stashed weeks PERSIST.** The 23 Aug "session memory
    only, a reload forgets" decision (and its reasoning that `INPUTS` and Leave War
    forget in lockstep) was overtaken by the 8 Sep 26 storage work: `persistAll`
    writes `inputs`, `people`, the `plan` layer AND every stashed week to the
    whiteboard, and a built site runs on the Browser backend. A reload KEEPS them.
    Memory-only is now just dev/tests/`?fresh=1`. Don't "fix" this by removing the
    persistence — it is deliberate; see `docs/data-schema.md`. *(30 Sep 26: the weeks
    are no longer written by `persistAll` but as ROWS from each command's changes —
    `[DB-READINESS]` group A, phase 1; still persisted, `docs/data-schema.md` §The week record.)*
  - **Pristine weeks are deliberately NOT stashed** (a persisted byte-copy of the seed
    would outrank a later demo-week update forever). Stashed on the way out only if
    changed since load or already carrying an entry. Don't re-add the unconditional
    stash.
  - **Publish state rides the restore** — the stash shares its SCHED field list with
    `history.ts:schedFields` (the two serializers can't drift).
  - **Seeds read the stash first** — cross-week reads go through `weekctx.ts:bundle()`,
    stash ahead of the pure seed.
  - **The "Sync" chip stays decorative** — per-browser, no server; don't present the
    stash as shared/multi-device or move storage off `HOOKS.storeBackend`.
  - Undo still re-baselines per week; the edit log stays session-only — the stash is
    additive to both. Flow: `feature-impact.md` Flow E.

### Inputs & Admin
- **Manage users lives on the Admin tab** (owner, 23 Aug 26). Topbar `#manageUsers`
  and `#userModal` gone; same fields/list/mutations on `ui/AdminPage.tsx` (7th nav
  tab, ALWAYS LAST, admin-hidden like Edit — but the PAGE is the gate, `#admDeny`).
  Don't put the button back on the topbar or add a tab after Admin.
- **No repeat-weeks on inputs** (owner, 22 Aug 26). The "Repeat wks" field, Recurring
  column and `recur` write are deleted — the feature never actually repeated (one
  span stored, `recur` a label nothing expanded). A truly repeating input is a real
  future feature (build only if he asks); a member files the same absence per week.
  Pinned in `inputs.test.tsx`. (`reference/` keeps its own Repeat field — test-only.)
  Moving an `Other` row to Ground/Unavailable is the `→ Ground`/`→ Unavail` buttons
  in `html.ts` (week + board); don't add drop targets to `drag.ts` (pucks only).
- **The calendar day popover — five owner asks** (23 Aug 26, all in `InputsCal.tsx`/
  `scheduler.css`; `ui-contracts.md` §The Inputs month calendar):
  - A SANS input reads its F/O/A letters on the popover row too (`isSansAvail ?
    (sansLetters||'F/O/A') : inpLabel`) — don't put "SANS Availability" back.
  - The day TITLE matches the date number's size (15px/700) — don't drop the explicit
    size (without it the input takes the 16px UA default).
  - A cell NOTE is plain text, no box (the dashed accent border is gone); on a phone a
    muted `--edge-2` bar so it stays visible — don't re-add the dashed border.
  - The cell mini-pucks (`.ic-pk`) are standard-olive (`--fcp`), CAT a right-edge line
    (`--pk-cat` via `::after`), a SANS person a purple LEFT line — pseudo-elements not
    inline box-shadows. Not the old full CAT-tint fill.
  - `+ Pucks` opens the MULTI-SELECT picker (`.ic-pick`): category buttons
    (`personMatchesCat` — the SAME predicate as the highlight chips, one body) light a
    category, ✓ Add batches the ticks (`addPuckRow`/`addPuckPeople`, dedupe). A seated
    puck removes 3 ways (✕, right-click, drag off its row). Don't restore the
    per-person `<select>`; keep `personMatchesCat` the one predicate.

### Leave War grid & scheduler render/drag performance
Full detail for this whole group: `docs/performance.md` (Part 1 invariants + Part 2
ledger). Read it before any layout/render/drag-touching change.
- **The board DOM ceiling of 1150 is settled** (owner, 28 Aug 26). Raised 960→1150 in
  PR #333 (board ~1051 nodes; timings held at 0.57× reference). Lives at
  `DOM_CEILING` in `perf-port.cjs`. Don't re-litigate the raise or trim the board to
  the old ceiling. (`performance.md`.)
- **The Leave War grid — the open-bidding box, opening on the war being bid on, the window of months** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/leave-war.md` §Settled before this list → Leave War grid performance.
- **A dragged puck's ghost rides its own compositor layer, moved by ONE transform;
  cell hover highlights are off in flight** (6 Sep 26). `.dragimg`/`.tdghost` carry
  `will-change:transform` with left/top pinned at 0; `drag.ts ghostXf` writes
  `translate(x,y)…` — no page paint (left/top moves relaid the whole page, ~170ms/
  move). The three cell-hover rules are scoped `body:not(.tdrag)` (`.dragover` is the
  drag's feedback). Don't move the ghost by left/top or re-enable hover under a drag.
  Measured-and-done dead ends (don't chase): toggling ghost `pointer-events`,
  any cursor rule on body, every re-layering ghost variant (the cost is the page's
  ~230 compositor layers, not the ghost); the `translateZ(0)` "fix" was a broken-
  experiment artefact, retracted. Nothing here touches native drag. `performance.md`
  §Drag; `ui-contracts.md` §the mouse rides the pointer machine.
- **A changed day rewrites only its changed BLOCKS, and a drop hit-tests before it
  takes the ghost down** (6 Sep 26). `ui/dayswap.ts` parses the new day into a
  `<template>` and replaces only the top-level/`.day-body` blocks whose CANONICAL
  markup (freshly parsed, never the live decorated node) differs from the last write;
  any shape mismatch falls back to whole-day replace (the old `outerHTML=`). Both
  weeks use it (keep `prev.chunks`). `drag.ts onPointerUp` hit-tests with the ghost
  still up, removes it after, leaves `body.tdrag/.mdrag` to `tdClear()`. Drop long
  task ~600→400–490ms at 4×. Dead ends (don't retry): every paint-isolation variant on
  the week (equal/worse — the ~60–100ms repaint records the two visible days); a
  "quiet path" in `refreshHighlights` (2× slower). Don't swap by live `outerHTML`
  comparison, match blocks by index across a count mismatch, or take the ghost down
  before the hit-test. Pins `ui/dayswap.test.ts` (`drag.test.tsx` unchanged).
  `performance.md`; `ui-contracts.md` §Rendering (per-block swap).
