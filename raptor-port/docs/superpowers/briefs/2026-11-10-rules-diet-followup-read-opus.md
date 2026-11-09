# The rules diet's follow-up — the fresh, blind Opus read (10 Nov 26, chat 48)

*(Saved word for word from the helper's final report — a fresh Opus reader, blind to Astra, brief
`2026-11-10-rules-diet-followup-read-brief.md`, on `497c1d3df`.)*

Blind read of [RULES-DIET-FOLLOWUP] (diff 786886b6d..HEAD), fresh Opus reader. Read only: I changed no repo file. I ran the measure from git objects into the scratchpad, and ran docsize, which reports OK.

**Measure reproduced.**
- Before (786886b6d): Leave War 304,434, Tracker 270,651. Both match the item.
- After (HEAD): Leave War **264,482**, Tracker **230,343**.
- The scheduler page no longer loads in either job. The Leave War architecture file still loads in the Tracker job through the performance guide, as the item says.

## Q1 — rulings a job can no longer reach

**1. MEDIUM — Leave War rulings left out of the new pointers.**
- **Where:** `.claude/rules/decisions/leave-war.md:300-303` against `scheduler.md:335-336, 339, 341`.
- **What is missing:** three groups of Leave War rulings are stated only on the scheduler page. They are on no page a Leave War job loads, and the new pointer lines do not name them:
  - (a) D642's first clause: Saturday and Sunday start with no flying set, and a no-fly day still shows and takes OFT and AMT commitments. Line 301 cites D642, but its words cover only the picked-days panel.
  - (b) D636 and D637: the Required cells can be picked several at once and given one number (shift-drag on a desktop, long-press-drag on either device). A figure can run "from a date on", skipping weekends, public holidays, Off days and no-fly days. There is no "SANS needed" row. The page's own line 224 says only "typed in their cells", and the older line 300 cites D665 only.
  - (c) D634 (scheduler.md:341): through any tidy, the Event sheet keeps its colours and its Edit presets button.
- **Searches done:** I grepped leave-war.md, seams/leave-war.md, oil.md, people-accounts.md, design.md, ui-design.md and design-practices.md. Result: D634 and D636 are on none of them. D637 appears only in feature-impact.md, which is a guide, not a rulings page. The only Leave War page hit for "OFT" or "no-fly" is the war's own unrelated line 107.
- **Consequence:** a Leave War job that changes weekend flying defaults, the no-fly day, the Required cells' gesture or run-on figure, or tidies the Event sheet would never meet these rules. Before this change, any Leave War interface job had them loaded through the performance guide. The "open the scheduler page first" line (303) only fires if the reader sees that lines 300–302 govern the change, and their words do not cover (a) or (c), and cover (b) only loosely.
- **Cause:** the writer's check listed the scheduler page's Leave War statements by number (the handoff block names D641, D642, D644, D645, D901, D263, D796, D797, D1012, D1020 and D1048). It missed the §"The Leave War's rows and the Event sheet" lines 335, 336, 339 (first half) and 341.
- **Fix:** add to line 301 (or 300):
  - "Saturday and Sunday starting with no flying set, a no-fly day still showing and taking OFT and AMT commitments"
  - "the Required figures typed in their cells, several picked at once by shift-drag or long-press-drag on either device, a figure running from a date on past weekends, public holidays, Off and no-fly days, no 'SANS needed' row"
  - "through any tidy the Event sheet keeping its colours and its Edit presets button"
  - and cite D634, D636 and D637 with them.

**2. LOW — the time-format rule now reaches neither job.**
- **Where:** `scheduler.md:142`.
- **What:** "every time in the app reads as 08:00 … through one display fold" is app-wide, but it is stated only on the scheduler page. It is not in the Leave War or Tracker pointers, nor in design.md or design-practices.md (which carry only "Enter a time as 08:00" as an error-message example).
- **Consequence:** a Leave War or Tracker job that shows a time would not see the rule.
- **Fix:** name it on the Tracker pointer (`tracker.md:100`) and the Leave War pointer, or accept it, saying so.

**Checked and not findings:**
- Tracker job: the Tracker pointer already covers what the scheduler page states for every screen. D824, D842, D828, D860 and D997 reach it through design.md:98, and D995 through design guide lesson 6. The writing-guide rules (D833, D834, D836, D825) reach it through ui-design.md and design guide §1a/§1b.
- OIL and People & accounts jobs: their Leave War files load the Leave War page, so they get the new pointers.
- IT flow guide job: it needs none of the scheduler page.
- Speed rulings: the board's are scheduler-only screens. The Leave War grid's are on `leave-war.md` §Settled before this list (lines 134–139).

## Q2 — are the pointer lines faithful?

**3. LOW — some conditions dropped where cited numbers cover them.**
- **Where:** `leave-war.md:301-302`.
- **Line 302:** it cites D901 but drops:
  - "one finger-sized date everywhere — smaller only where a sheet would not fit his iPhone, shown to him first" (scheduler.md:168);
  - "no Clear under any other calendar".
  - It also omits D916, which governs the one calendar's placement and Monday-first weeks (scheduler.md:167).
- **Line 301:** it cites D645 but drops "the grid shows the short form and a tap opens the full name and kind" and "PH, OFF, NL and SC to start".
- **Consequence:** small, because line 303 sends the reader to the page. But a Leave War calendar or sheet change could shrink dates without the "shown to him first" safeguard.
- **Fix:** add those clauses, or D916, in a few words each.

**4. LOW — the new "does not load" lines are not quite true.**
- **Leave War line 303:** "The scheduler's page does not load with a Leave War file" is false for Leave War browser tests (`e2e/*leavewar*`, matched by the scheduler's `e2e/**`) and Leave War mock-ups (`docs/mock/**`). The handoff block itself notes this.
- **Tracker line 101:** false for `src/ui/logout.ts`, which is on tracker.md's `paths:` and also matches the scheduler's `src/ui/**`.
- **Consequence:** harmless in effect; the reader would only open a page already loaded.
- **Fix:** "does not load with the war's own source files" / "with most Tracker files".

**Otherwise:**
- Every number cited on lines 301–302 is one the words cover.
- The window rule keeps its "not built" sense through "waiting for their own job (`[LW-WINDOWS-NONBLOCKING]`)", which matches the backlog item: "Not started".
- No agent's reading is stated as his rule. D642's "Go with your pick" makes the panel rule his ruling.

## Q3 — the guides' notes

- **Placement is correct.** The performance-guide note sits inside `# Part 1` (`performance.md:27-31`), which the measure and CLAUDE.md read whole. The ripple-map note continues the "How to read it" paragraph (`feature-impact.md:20-22`), with no line starting a new block, so a read by section keeps it.
- **The claims are true.** The scheduler page's §Speed of the dense screens and §Settled exist, and so does leave-war.md §Settled. No rulings page now names either guide in its `paths:`; only `seams/leave-war.md`, an architecture file, still loads with the performance guide.
- **Minor:** the performance note names only "the board's" speed rulings. §Settled also holds the week pages' cross-week glide (D1577, scheduler.md:145), which points into performance.md §Compositor layers. It is reachable because the note names §Settled, so this is not a finding.

## Q4 — the handoff's leftovers

**5. LOW — tidiness notes no longer in the live backlog.**
- **What:** the chat 19/27 block said its readers' tidiness notes (D489, filed not fixed) were "filed in [SHELL-SCRIPT-GUARD]". That item was archived the same day. The notes now exist only in `OUTSTANDING-ARCHIVE.md:8291`: nativePath copied, not imported; the `<`/`>` pattern written twice; docsize's `.impeccable` comment; `python -VV` refused; a quoted `<` mid-word; the billed minutes. `OUTSTANDING.md` has none of them.
- **Fix:** carry the list into the `[CHECK-TOOLS-HARDEN]` addition (`OUTSTANDING.md` around line 1999).

**6. LOW — record accuracy.**
- **Where:** `OUTSTANDING.md:418` and `HANDOFF.md:86`.
- **What:** both state Leave War 304,434 → 273,940 and Tracker 270,651 → 239,801. The "after" figures are the measure taken before the handoff trim. HEAD measures 264,482 and 230,343: each job is a further 9,458 lower, because HANDOFF.md shrank (the notes job went 68,615 → 59,157).
- **Fix:** give the HEAD figures, or label the old ones "the paths change alone".

**The other blocks were checked and are filed or done:**
- Chat 13's five points are in `[SCHED-MARKS-ASKS]`, except the Leave War's "on a locked week" words, which were already in `[DAMAGED-WEEK-LEFTOVERS]` (5). The hide ✕ matches the evidence sheet.
- The secrets-scan retry and the unseen gold-dot skip are in `[CHECK-TOOLS-HARDEN]`. No edit to that stylesheet since 8 Nov, confirmed by git log.
- Chat 4's waiting points and two recommendations are in `[IT-QUESTIONS]`, faithfully.
- Coordinator-2: the away mark does lapse after 16 hours (`compact-lib.mjs:155-157`). The skill-notes review is re-offered by the short form whenever the log is over 7 days old. The other items it names all live in `OUTSTANDING.md`.
- Chats 46 and 47: residue in `[LW-PAGE-LEFTOVERS]` and `[RULES-DIET]`; pull request 734 merged.

## Q5 — anything else

**7. LOW — a stale comment in the measure script.**
- **Where:** `raptor-port/scripts/docsize-reads.mjs:16-17`.
- **What:** its header still says "layer J: the ripple map and the performance guide load the scheduler's rulings, the performance guide the Leave War's". The first half is now false; the second is the architecture file, not rulings.
- **Fix:** "the performance guide loads the Leave War's architecture file (seams/leave-war.md)". Or file it, since changing a script takes the pull request out of notes-only. It is a rules-diet step either way, so it waits for his "merge live".

**Also checked:**
- The rulings map still describes the scheduler page's trigger correctly (`DECISIONS.md:88`).
- No live document claims the scheduler page loads with either guide. The plan doc's layer-J text is historical.
- Sizes: leave-war.md is 82,493 bytes against its 121,825 limit; tracker.md is 16,008 against 20,061.

**Verdict:** sound in shape, measure reproduced, docsize green — but fix finding 1 (D642's weekend and no-fly clause, D636/D637's Required-cell rules and D634's Event-sheet safeguard missing from the Leave War pointers) before his "merge live"; the rest are low.
