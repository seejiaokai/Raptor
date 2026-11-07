# The rules diet's step 3, reading by section — the fresh Opus reader's blind read (7 Nov 26)

Read at commit `ab8598e70` of `claude/rules-diet-step-3-f1a069` (against `main` at `32ac5bd59`) from the brief
`2026-11-07-rules-diet-step3-read-brief.md`, by a fresh Opus helper that wrote none of it and saw none of the writing
chat's reasoning; Astra read blind to this report (D1739). 34 tool uses, about 10 minutes. Saved as it came back; what was
done about each finding: the plan's §Step 3 review log.

---

Blind read of the rules diet's step 3, reading by section (commit ab8598e70 against 32ac5bd59). I left the scripts alone. I opened no file named step3-read-opus or step3-read-astra.

PART 1 — THE CHECKLIST (raptor-port/docs/bug-check-checklist.md) against the order

The checklist's steps follow §5's order of steps faithfully. The tier rule is copied correctly, including "a cosmetic change to a shared drawer is never LOOK". Each step's parentheses point to the right section. I found seven gaps, all medium or low.

Finding 1.1 (medium): §6's rows by kind of change sit behind a gate based on tier.
Where: checklist lines 28–32 (step 7).
What goes wrong: Step 7 sends the agent to §6 only for "WALK with a shared drawer, and FULL", and "read the list each time" sits inside that gate. But several of §6's rows apply by KIND of change, whatever the tier:
- a change that removes or replaces a control, form, event or way out ("the check is sized from this list, not from how the change looks");
- a listener added above its own component;
- a new branch that skips a call the others make (the readers' brief asks "what does the changed path no longer run?");
- a fix that changes when a writer reports "nothing happened";
- a component that gains a second home on a page;
- a navigating action, one row per opener.
An agent removing a button on one screen, or adding a key listener for a new gesture with no shared drawer, gets LOOK or WALK-without-drawer. It never opens §6, so it never lists what the removed control gave in each role and size, and it never lists the listener's live states. Under the old path (the order read whole) it would have seen these rows.
Fix: add after step 7: "7a. **§6's rows by kind of change, whatever the tier** — at the tier step, open **§6** whenever the change removes or replaces a control, form, event or way out (its list sizes the check), adds a listener above its component, skips a call the others make, changes when a writer reports 'nothing happened', gives a component a second home, adds a navigating action or a floating surface, or changes a wording or one writer of a record; each such row is run."

Finding 1.2 (medium): §2a's table is never opened for some WALKs.
Where: checklist lines 35–39 (step 9). §2a is named only at steps 5 (FULL), 7 (WALK with a shared drawer, and FULL) and 8 (a new gesture).
What goes wrong: §2a's own text says its table states "what must be COVERED for each kind of work; how much of it is driven … is decided per change in the sizing step (§7.0)". A WALK on a new surface with no shared drawer and no new gesture never opens §2a. Its rows then go unseen: walk both sides of a cross-app seam and confirm they agree; "a real touch target, not just a visible one"; "with the normal overlays present (a chip, a badge, a long name, a warning ring)". A new Leave War screen that shows a figure the scheduler also shows would be walked on one side only.
Fix, step 9: "open **§7.0**, **§2a's table** (what must be covered for each kind of work this change is), and the walk ledger's sizing step …".

Finding 1.3 (medium): §4 is in practice read in part at the walk.
Where: checklist lines 46–49 (step 13), "(§4, the fan-out paragraphs and the table of what each part holds still)"; and line 25, step 5's "open §4 (who reads now, …)".
What goes wrong: The parentheses read as the part to open. The builder's own measured case in the plan (§Step 3, the WALK row) counts "§4's fan-out paragraphs", not §4 whole. So on a WALK, §4's "Before a brief leaves" goes unread, because step 5 opens it on FULL only. That paragraph says a walker scenario's EXPECTED line naming a count, a refusal or a published-day state is checked against the rulings and `main`, or rewritten "RECORD exactly what it says". On 13 Oct 26 four of one walk's five FAILs were the host's own expected line contradicting an older ruling. A WALK-tier host who writes a walker's brief now skips that check.
Fix, step 13: "open **§4 whole** (the fan-out paragraphs, the table of what each part holds still, and 'Before a brief leaves' for every walker's brief that carries an EXPECTED line)". Add to the head: "A step's parentheses name what to mind in a section, never the part to read: the section is read whole."

Finding 1.4 (medium): the evidence sheet's section is opened too late.
Where: checklist lines 59–61 (step 19).
What goes wrong: §9 requires the sheet to be laid down at the START, with every heading and the roll-call table drawn, "so a row nobody walked shows as a blank during the walk, not at the close". It also requires that, before the sheet goes to a reader, every "proved by" test or file is checked to exist. The checklist sends the agent to §9 only at step 19, after the reads. An agent following the steps in order builds the sheet at the close (the failure §9 guards against) and hands readers (step 16) a sheet whose "proved by" cells are unchecked. The one line "made at the start" does not carry the list of headings, which is only in §9.
Fix: add to step 2 or 3: "Lay down the evidence sheet now — open **§9**: every heading it lists, the roll-call table drawn one row per surface." Add to step 16: "every 'proved by' cell checked to exist before the sheet goes to a reader (§9)." Step 19 keeps the closing lines.

Finding 1.5 (medium): a walk rule sits only in a "background" section.
Where: checklist line 69, "Background … §10", and line 46, step 13.
What goes wrong: §10's anti-pattern 21 holds a rule found nowhere else in the order:
- a mark, outline or highlight is asserted as PAINTED, by a computed style on each element it must cover;
- a mark of more than one colour is asserted per man, against that man's own item;
- every picture a step saves is opened before the step counts as looked at.
Lesson 22 (pixels drawn) is close but does not carry the per-man colour check. A walk of a change to the issues list's lighting would pass a list that lights every man in the day's worst colour (the 11 Oct 26 find), because §10 is never opened.
Fix, step 13 adds: "a mark, outline or highlight asserted as PAINTED — its computed style on each element it must cover, a mark of more than one colour per man against his own item — and every saved picture opened (§10, anti-pattern 21)". Background line: "§10 (anti-pattern 21 is a walk step, step 13)".

Finding 1.6 (low): some one-line lessons drop a clause that reaches further than the one line's trigger.
Where: checklist lines 78–79, 86, 93–94, 98–99, 101–102, 104–105.
What goes wrong: Step 9 opens a lesson's full text only "for each that applies", so the one line decides whether it applies. Five lessons lose a clause wider than their one line:
- Lesson 6: "a walk that judges scroll bars launches with the test browser's --hide-scrollbars taken off", for any walk that judges scroll bars.
- Lesson 18: "an 'only his phone can confirm' left in the backlog is put to him with the next look he is asked for", which applies to any look.
- Lesson 21: "every gesture's evidence sheet names what only his phone can show", for every gesture walk, not only when his fault does not reproduce.
- Lesson 11: "or a mark" is dropped, which narrows the trigger.
- The second 23: "with an iPhone's letters" is dropped. Also, step 9 says to open full text "in §7.11", where the second 23 is not.
Lesson 23 also drops "the ruled window is the expected one, never the build's".
Fix, replacement lines:
- 6: "A change that hands something to the phone itself (its scrolling, keyboard, bounce): name what only the real phone draws; his look or recording before merge. Any walk judging scroll bars: the test browser's --hide-scrollbars off."
- 11: "A reading or a mark that depends on how much fits on screen: zoomed out at 1536 and at 2560, pressed at the year's two ends."
- 18: add "; and any 'only his phone can confirm' waiting in the backlog goes to him with the next look."
- 21: "A test browser's touch is not his phone's: every gesture's sheet names what only his phone can show; where his fault does not reproduce, an on-screen log of what his phone hands the page, before any fix is guessed."
- 23: add "— the ruled window is the expected one, never the build's."
- Second 23: "… measured one height and one line, at a phone's width with an iPhone's letters as well as a desktop's."
- Step 9: "opening its full text in §7.11 (the second 23: after §8)".

Finding 1.7 (low, five small items):
(a) Step 2 (lines 15–16) drops parts of three of the eight questions:
- Question 1 loses "or how many count as present". Fix: "money (what a man is owed or paid, OIL included, or how many count as present)".
- Question 5 loses "a new control, tap target, mode or button". Fix: "a new control, tap target, mode or button".
- Question 8 loses "or how a rule is read". Fix: "the warning list (what warnings say, or how a rule is read)".
§5 is opened whole in the same step, so the risk is low.
(b) Step 5 (line 24) says "on FULL each is walked against the build". The project guide's standing order says on every build each applicable ruling is checked against the running build, pass or fail, with the list shown to him. The checklist follows §5's table, but its wording invites skipping that check on WALK. Fix: "listed for him in the app's words; each checked against the running build, pass or fail (the standing order); on FULL, swept one mark per surface (§5, §2a)".
(c) §8 item 7 ("before building the changed half, pin the unchanged half with a test") is reached only at step 15, after the build. Fix: add to step 5 "a ruling's 'left as it is today' half pinned by a test before the changed half is built (§8, 7)".
(d) §5's security read (D1411: sign-in, who may see what, or what one person sees of another — one more fresh reader, whatever the tier) is not named at step 16. Fix: add "and the security read (§5, D1411) where it applies, whatever the tier".
(e) §3 is named at step 8 and also listed as background (line 69). Fix: drop §3 from the background line. Separately, §11's "every defect he finds costs the method a line" (a roll-call row, order line, everything-day kind or anti-pattern) is wider than step 22's walk-missed lesson. Fix, step 22: "and, for any defect he finds, a roll-call row, order line, fixture kind or anti-pattern in the same change (§11)".

Is the head's framing enough to keep D68's narrowing inside D1735's condition? Its words are right ("whole", "required read", "a reminder, never the rule"), but on its own it does not hold, for three reasons shown above:
- parentheses that name parts are read as partial reads (1.3 — the builder's own measure does this);
- rules that apply by kind of change sit behind steps gated by tier (1.1, 1.2);
- the lesson one-liners act as filters for which lessons apply (1.6).
Add to the head: "A step's parentheses name what to mind, never the part to read. A section's rule that applies by kind of change applies whatever the tier gating its step."

Sections of the order checked, and the step that names each:
- §0: none. Its rule is carried by bug-check.md and §9; nothing lost.
- §0a: steps 1 and 3. The extra in §0a step 3 ("name no check beyond the tier's list unless its route is traced") is reached because §0a is named.
- §1: background. Nothing to do.
- §2: background. Nothing to do.
- §2a: steps 5, 7 and 8 (gap: 1.2).
- §2b: step 2.
- §3: step 8, also listed as background (1.7e).
- §4: steps 5 (FULL), 13 and 16 (gap: 1.3).
- §4a: step 16.
- "With the Claudex loop": none. It repeats §4a and the walk-before-inspection order, which the steps keep; nothing lost.
- §5: steps 2, 4, 6, 17 and 18, and the LOOK line. The batch rule, D490, D1625, the re-walk, "a fix is new code" and the touched suite between rounds are all reached through step 2's whole read.
- §6: step 7 (gap: 1.1).
- §7.0: step 9.
- §7.0a: step 10.
- §7.1 and §7.7: step 11.
- §7.2: step 12.
- §7.3–§7.10: step 13.
- §7.5 and §7.6: step 14.
- §7.11: step 9 (the lessons) and step 22 (its head).
- The second 23: step 9's list.
- §8: step 15 (1.7c).
- §9: step 19 (gap: 1.4).
- §9a: background. D1409 also loads every chat through the general rulings, so nothing is lost.
- §10: background (gap: 1.5).
- §11: steps 4 and 21.
- §12: steps 5 and 20.
- §13: background. Nothing to do.

I compared all 23 lessons of §7.11 and the second 23 closely, line by line against each full lesson. Lessons 1, 2, 4, 5, 7, 9, 12, 14, 15, 16, 19, 20 and 22 match their lessons at reminder level. Lessons 3, 8, 10, 13 and 17 drop detail, but their trigger is kept, so the full text is still opened. Lessons 6, 11, 18, 21, 23 and the second 23 are as in 1.6. The numbering matches the source (7 and 8 in number order). The two 23s and 8-before-7 are known and filed.

I found nothing wrong in: the tier rule; the LOOK and NONE lines; steps 6 and 18 (D1086); step 10; step 12; step 14's three dispositions; step 20; step 21's card; step 22's D1297 wording; the order's sequence (build → pull request → roll-call → sizing → walk → reads → fix → gates → sheet → look).

PART 2 — THE DESIGN GUIDE'S SECTION LIST (.claude/rules/ui-design.md lines 27–33; raptor-port/docs/design-practices.md lines 23–24)

His lessons are kept whole for every design job: "Every design job: the guide's head, §0 … and §9 … whole (D941, D1417)", and the guide's head says the same.

Finding 2.1 (medium): §2 is routed more narrowly than its own scope.
Where: ui-design.md line 31.
What goes wrong: "Anything opened, closed or typed in: §2" is narrower than §2, which binds anything NEW. Its test is "can it be opened, used and closed without a mouse"; "a control drawn from a picture or a glyph has a spoken name that says what it DOES"; and "something a mouse can do by hovering or dragging has a keyboard way too". A job adding a new icon button that only acts (no window, no box) is never sent to §2, so its spoken name and its keyboard set beside its picture are missed.
Fix: "**Any new control, or anything a person opens, closes, presses, hovers, drags or types in:** §2."

Finding 2.2 (medium): §1b is routed to new words only.
Where: ui-design.md lines 30–31.
What goes wrong: "to write new ones, §1b" narrows §1b, which says "For NEW text, and for any text being changed". D833 says the writing guide (§1, §1a and §1b) is used every time text is written or changed. An agent rewording a refusal without shortening it opens §1 only and misses §1b's voice tests (dashes, "you" never "we", the cold read of a new reason, cost or instruction).
Fix: "**Words** a person reads, written or changed: §1 and §1b; to shorten words already on screen, §1a too (D833)."

Finding 2.3 (low): a new action's feedback is not routed.
What goes wrong: §1's feedback point (D850) says "for a new action, its feedback is designed with it and drawn in its picture: what changes, where the eye lands, the mark, what a screen reader is told and where the keyboard is left". §4's "One mark, one look" holds the just-added mark. A new action with no words and no colours reaches neither section. ui-design.md's short form, point 2, carries the gist, so the risk is low.
Fix: add "**A new action:** §1's feedback point and §4's 'One mark, one look'."

Finding 2.4 (low): mock-up pages are not routed to §8.
What goes wrong: §8 also governs every mock-up page put to him: D1478 (an approved part drawn from its approved drawing and checked beside it before the page goes out) and D1237/D1363 (what to look at at the top; only what is open). A mock-up round is not "a look or review". The rulings' one-liners load every chat, so the risk is low.
Fix: "**A look or review, or any page of mock-ups put to him:** §8."

Finding 2.5 (low): changing the guide itself has no route.
What goes wrong: the last paragraph, "Where each piece came from — Changing this guide" (a change is read before he approves it, never by its writer; D70), has no route. §0 step 2's last sentence half-carries it.
Fix: "**Changing the guide itself:** its last paragraph, 'Changing this guide'."

Checked and found nothing: §3 (placing and grouping, D1122's arrows), §4 (colour and mark, no glow), §5 and §5a, §6 ("before anything built is shown to him" in practice covers every build), §7, and §8 for a look. "Unsure whether one applies: open it" is kept.

PART 3 — THE RIPPLE MAP'S NOTE (raptor-port/docs/feature-impact.md lines 11–15)

I ran the search. It prints 46 names, every row of §1's table (lines 124–169), and no row from any other table. That part is right.

Finding 3.1 (medium): the search does not list every surface.
What goes wrong: the note says the search "lists every one", but §1 also has two surfaces written as bullets under the table: "The failed-save warning's band" and "A shared store's empty pages". The second says a change to the Leave War's or the Tracker's first screen, or to what an empty store starts with, checks both under the blank policy. An agent following the note's list never sees them.
Fix (tested, prints 48): "`sed -n '/^## 1\./,/^## 2\./p' docs/feature-impact.md | grep -o '^| \*\*[^*]*\*\*\|^- \*\*[^*]*\*\*'` lists every one (run from `raptor-port/`)".

Finding 3.2 (low): names alone hide what feeds each surface.
What goes wrong: the standing order asks "which other surfaces read the same data or rule". That is the "Fed by" column, which a list of names hides. An agent may skip a surface whose name does not suggest the data.
Fix: "… and read in full the row of each surface the change touches, or that is fed by data or a rule the change writes or reads; where the name leaves it unclear, read the row".

Finding 3.3 (low): §4 has no list of its own.
What goes wrong: "§4's funnels and drift-seams for each it writes through or crosses" omits the standing order's "the drift-seams it might open", and gives no list to go down.
Fix: "go down §4's headings by name (`grep -n '^###\|^####' docs/feature-impact.md`, lines 683–1295) and read each funnel or seam the change writes through, reads, crosses or could copy; a new one is named under 'A new drift-seam is named in this list'".

Finding 3.4 (low): binding rules sit in the dated parts.
What goes wrong: some dated parts hold binding rules or are surfaces in all but name. The paragraphs under the title carry "A NEW reader of a published day's OIL must go through `oilDayWork` / `oilAmount`". The section "The app's one date calendar — a surface that floats over every form" (line 1499) is a surface outside §1.
Fix: "… a dated section — its titles: the bold starts under this title and `grep -n '^## ' docs/feature-impact.md` after §4 — when the change is in its subject or reads what it governs".

PART 4 — EACH CHANGED POINTER

No meaning change. Each pointer names the right file and keeps the rule it carried:
- bug-check.md's head and step 1 ("whole, whenever that step applies");
- the order's §0a step 1;
- the project guide's bug-check one-liner ("checklist first" — ambiguous, but it errs toward reading more);
- the three map rows;
- guide-full's §Weigh the whole ecosystem and §The bug-check standing order.
One small point: bug-check.md step 2's "its eight questions (§5)" now reads as the checklist's; that is harmless.
The ripple map's one-liner in the project guide, left unchanged, points to the file. The note is in its first 15 lines, so an agent opening it (in slices, since the file is too big to open in one read) meets the instruction at once. The map row and guide-full both say "by section". It is not misleading; at worst an agent reads more than it needs.
