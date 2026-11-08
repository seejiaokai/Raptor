# Build brief — chat 13, group 3 (for the Opus builder helper)

Repo: `C:\Users\User\projects\Raptor\.claude\worktrees\pr-day-start-7b064c` (a git worktree; work ONLY here; never `cd ..`
above it). App: `raptor-port/` (React + TS; dense surfaces are HTML-string builders). Branch `claude/pr-sched-marks-3205d7`.
Read first: `raptor-port/CLAUDE.md` §Coding conventions (src/engine is verbatim-port style — compressed one-line,
semicolons; src/ui and src/state ordinary TS, 2-space, no semicolons, single quotes; comments say WHY, in prose, above the
code, naming the owner's ruling number), `.claude/rules/raptor-executor.md`.
Do NOT touch: `src/ui/SchedBoard.tsx` outside the published-version banner (lines ~466–478), `src/ui/sheetfocus.ts`,
`src/ui/kbscroll.ts`, `src/ui/scheduler/10-board-history.css`, `src/ui/scheduler/13-board-rows-responsive.css` (another
chat owns them). No commits, no pushes — the host commits. Every change lands with a test that pins it (red first where it
is a behaviour). Run only the touched test files (`cd raptor-port && npx vitest run <files>`), then `npm run build` once at
the end (it type-checks; `tsc --noEmit` is hollow here). No browser tests (the host runs them).
Return: a short list of what changed (file + what + why), the tests added/changed and their result, anything you were
unsure of. No file dumps.

Full rulings (read each before its job): `grep -h '^| D1785 |' .claude/decisions-full/*.md` (and D1784, D1792, D1669,
D837). Notes and drawings: `raptor-port/docs/img/handpass/2026-11-07-pictures-round/notes-sched.md` Q1 (g), Q2 (d)–(g);
`notes-marks.md` §3 (g); pictures `q-unavmark-*-A.png`, `q-readonly-*-A.png`, `q-r5a-*-drawn.png`, `q-r5d-*-drawn.png`.

## Job 1 — D1785, the unreadable week's words (and the refusal's grey note)
A loaded week is read-only ("protected") in two cases (`engine/publish.ts` `protectedWeek`, `engine/quarantine.ts`,
`state/store.ts` `applyWeekModel`, `state/persist.ts` `readStoredWeek`): (i) its saved copy will NOT READ — the stash /
preserved blob does not parse to an object with a `d` days array (persist writes `{"unreadable":true}`); (ii) it reads,
but in a form this app will not edit — an older version's book (amFormatOf 'unsupported'), a whole-week old record, or
records of another week. D1785 changes case (i) only; case (ii) keeps its own reason ("published by an older version").
1. `engine/quarantine.ts`: `weekLockReason(key): 'unreadable'|'older'|null` — null when not protected; for the LOADED week
   (key === CURWEEK) protected = `protectedWeek()`, reason 'unreadable' when `isPreservedWeek(key)` and its
   `preservedBlob(key)` does not read as a week (no object with an array `d`), else 'older'; for a STASHED week use
   `stashProtected(key, stashGet(key))`, reason by the same "reads as a week" test on its preserved blob if any, else its
   stash json. Plus `anyUnreadableWeek()` — the loaded week or any stashed week is 'unreadable'. Guard every parse (a
   damaged blob must never throw out of a reader — see stashProtected's own comment).
2. The refusal (`engine/publish.ts`, where `LOCKED_WEEK_NOTE` lives — D837's one source; keep one source):
   - unreadable: `Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved. Report it with “Report a problem” on the Help page.`
   - older: `Blocked: this week was published by an older version of the app, so it can’t be edited. Nothing was saved.`
   (curled ’ “ ” exactly as written). `lockedWeekNote()` picks: unreadable words if `anyUnreadableWeek()`, else the older
   words (a mixed case needs an older-format week, which only data already stored can hold — D56; say so in the comment).
   Every door says it in the grey refusal note: `HOOKS.toast(lockedWeekNote(), 'blocked')` (D1667–D1669; the toast's
   'blocked' face is `ui/toast.ts`) — `state/store.ts` ~210, `ui/inputedit.tsx` ~864, ~884 (`medicalLocked`), ~1002, ~1140.
   `lockedDayNote` (the publish refusal, `publish.ts` ~444, ~1365): when the LOADED week is 'unreadable' it says the
   unreadable refusal above (kind 'blocked'); otherwise exactly as today (words and kind unchanged). Find out whether a
   publish can be pressed at all on a protected week (the week and board draw only the notice) and report it.
3. The notice on each day (`ui/html.ts` `QUARANTINE_NOTE` ~186 used by `dayUnsupportedHTML`; `ui/board.ts` ~83): one
   function both call (keep "the two surfaces can never drift"): loaded week 'unreadable' → `This week’s saved copy could
   not be read, so it can’t be shown. The saved copy is kept as it was. Report it with “Report a problem” on the Help
   page.` (one paragraph, as drawn); otherwise today's QUARANTINE_NOTE unchanged (this also covers an approved day with no
   issued copy on an ordinary week — `dayIssuedHTML`'s `ver==null` branch).
4. Tests: rewrite `engine/lockednote.test.ts` to pin the new words to the letter and keep its scan (every door reads the
   one source; no typed copy of either sentence elsewhere in src). Update every test that pins the old refusal words —
   `leavewar/quarantine-medical-ui-pile1.test.tsx`, `state/quarantine-funnel.test.ts`, `state/reqorphan.test.ts`,
   `ui/audit-guards-inputs.test.tsx`, `engine/quarantine-schedule.test.tsx` — by which case each sets up (a damaged stash
   → unreadable words; an older-format book → older words), and assert the kind 'blocked'. New: an UNREADABLE loaded week
   (damage a stored row the way persist does, or stash `{"unreadable":true}` and load it) → every day's notice and the
   board's say the new words; a filing on it refused with the unreadable words, kind 'blocked', nothing saved; an
   unreadable STASHED (not loaded) week refuses an input on its dates with the unreadable words; an older-format week →
   today's notice and the older refusal, grey.

## Job 2 — D1784, the waiting mark on an Unavailable row
His ruling: an input filed, changed or moved after its day was published wears, on its Unavailable row, the same waiting
mark a Ground Programme row wears — on the week its NAME underlined dotted in the amendment's colour; on the board its
name box outlined dotted — until the day's next amendment goes out. No new words, no new look. The count and the marks
must agree: the day's "N pending" comes from `dayPendingItems(di)` (`engine/publish.ts` ~228–330), so the mark reads it.
Facts (from the code map — verify each): an input under Unavailable has NO `SCHED.pending` key, so `alAttr` cannot mark
it. Its PendItems: axis 'filing' (`entry.addr = inp:<di>.<iid>`), axis 'input' (`val.addr = inv:<di>.<iid>`), the people
step (`pp`, `entry = item.val`), and "→ Unavail" / an Other's Goes to of an input the issued day had on the Ground — a
content `kind:'delete'` item carrying `.inp`. `ui/pendlist.ts` ~175 `inputIdOf(it)` already extracts the id from all of
these (`/^in[pv]:/`). Gaps: a record replaced by another of the same man's (`inputs.ts` ~282) — the addr carries the
FROZEN id, the row draws the live record: accept `it.now?.iid` too; one man split out of a shared input
(`inputs.ts` ~271–275) — his new record's id is dropped: make his row match if you can, else report it.
1. `engine/publish.ts`: an exported `pendingInputIds(di): Set<string>` (or a function answering "is this input waiting
   on day di"), cached per read pass with the file's own `passMemo` (`publish.ts` ~426, ~843–850 — `dayPendingItems` is
   costly outside a pass), empty unless `dayApproved(di)`, and EMPTY during a look at a version or a plan (inside
   `withDaySnap` the swap misses the cache and the filing half reads the live inputs — `ui/html.ts` ~123–127, ~1600–1604;
   find the flag that says a look is being drawn). Move `inputIdOf` into the engine and have `pendlist.ts` import it, so
   the window and the marks read one extractor. The AL number is `nextSeq(di)`.
2. The week (`ui/html.ts` ~2244, `inpEditLabel` ~2350): the Unavailable row's name gets ` data-alp="1" data-aln="<n>"`
   when its input is waiting — NOT a second `title` (the button's own "Edit this input…" stays; a duplicate attribute is
   dropped by the browser). Same emission in the read-only branch (view page — CSS shows nothing there, as for Ground).
   Only the Unavailable list's rows — not Personal Inputs, not SANS.
3. The board (`ui/board-html.ts` `sbInpRow` ~700–790, from `sbUnavailPanel` ~840): the Unavailable panel's name
   (`.sbi-ty`, both the editable button and the read-only span ~732); NOT in OIL Earn mode (`oilItemCellHTML` — the Ground
   name has no mark there either); not the Personal Inputs panel (it shares `sbInpRow` — pass a flag).
4. CSS (`src/ui/scheduler/04-pucks-sections.css` ~639–650, beside the mark's own rules): the week's
   `#eWeek button.inpedit[data-aln]` underlined dotted as the span rule does; the board's
   `#schedBoard .sbi-ty[data-aln]` outlined `1px dotted var(--alc)`, `outline-offset:-1px`, and `.sbi-ty` taken out of the
   board's underline rule (the read-only span must get the outline, not an underline). `:not(:focus-visible)` on the
   outline so the keyboard ring (`14-input-editors.css` ~153) still shows. The pill keeps its own tint and border (check
   `.sbi-ty.ty-*` in 10-board-history.css — read it, do not edit it).
5. Tests (red first): on a published day — LL filed for Bolt after publishing → its week name and board name carry
   `data-aln="<next AL>"`; the day's count includes it; after the amendment goes out the mark is gone; a details edit
   (times/remarks) of an Unavailable input after publishing → marked; re-dated onto the day → marked; "→ Unavail" of a
   Ground input → marked; an Other's Goes to → marked; a draft (unpublished) day → no mark; a look at the Original → no
   mark; OIL Earn mode → no mark; Personal Inputs rows → no mark; an input untouched since publishing → no mark; a
   member's view (same as the Ground row). Each kind of PendItem above has one case.

## Added after Astra's scenario design (`docs/handpass/parts/2026-11-08-sched-marks-scenarios.md` — read its "missing" list)
- Job 2: **a man split out of a shared input keeps his mark** — required, not "if you can" (D1784 has no exception).
- Job 2: **every input the pending list names wears the mark** — when a man moves between two inputs, the input he left
  (still on the list for the others) as well as the one he joined; a test each.
- Job 2: **OIL Earn mode** draws Unavailable names two ways (an OIL claim's cell and a plain name): mirror what the Ground
  name does in OIL Earn mode for each kind, measured first, and test both.
- Job 1: **every other surface that draws a stored week's days** — the desktop next-week preview, print, the CSV export —
  find what each shows for an unreadable week; where it draws the seed or blames an older version, make it say the notice
  through the same one function if that is small; otherwise report it, with its place, and the host files it.
- Job 1: **every other refusal on a protected week** — the Leave War's approve, send back, delete and move, person
  deletion's check, and any other found — list each with its words; one that blames an older version on an unreadable
  week reads `lockedWeekNote()`; one with its own true reason stays and is reported.
- Job 1: the refusal's words follow "any week unreadable", not the week the change touches — Astra contradicts this; it is
  kept on D56 (its one counter-case needs an older-format week, which only stored data holds). Say so in the comment.

## Job 3 — D1792 (a) the 👁 → the app's line eye; (d) a hidden warning's ↺ → the Reset arrow
(a) Add `EYE_INNER` to `ui/glyphs.ts` — the wave templates window's own eye (`ui/WaveTplModal.tsx` `EyeOn` ~43:
`<path d="M1.5 12S5 5 12 5s10.5 7 10.5 7S19 19 12 19 1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3.2"/>`), and have
`EyeOn` draw from it with its look unchanged (`.wvmng-eye svg` in 08-windows-tools.css sets its stroke). Replace the typed
👁 with `glyphSvg(EYE_INNER, '<cls>')` followed by the same space: `ui/html.ts` `planSelectorHTML` ~295 (the selector's
label — 11 px, `vertical-align:-1.5px`), ~1777 and ~1779 (the week's banner — 12 px, `vertical-align:-2px`);
`ui/SchedBoard.tsx` ~473 and ~475 ONLY (the board's banner, 12 px). Colour: `currentColor`. Size it with a class in a
stylesheet you may edit (03-week.css beside `.planselbtn .psl` ~369 is fine). Update UI comments that name 👁
(`board.ts` ~438, `html.ts` ~160, ~284, ~1815); leave `engine/validate.ts`'s comment (engine = behaviour changes only).
Tests naming 👁: `ui/html.test.ts` ~660, `ui/amendretest.test.tsx` ~404–410, `ui/board.test.tsx` ~2258–2261,
`ui/planselector.test.tsx` ~82–89, ~173 — assert the drawn eye and the words, and that no 👁 is typed anywhere in src/ui.
(d) `ui/board.ts` ~539 (`.wln-mute`) and `ui/html.ts` ~1179 (`.witem-mute`): the hidden line's ↺ becomes
`glyphSvg(RESET_INNER, '<cls>')` at 13 px, `vertical-align:-2px`; ✕ stays typed; titles unchanged ("Flag this again").
Tests: `ui/warnmute-week.test.ts` (~49, 55–69, 86, 103, 109, 124–136) — assert the drawn arrow in place of ↺;
`e2e/warnhide.spec.ts` ~70, ~107 read the button's text as '↺': change them to detect the arrow (the host runs e2e; you
don't). The CSS for the arrow: not in 10-board-history.css (find where `.wln-mute` / `.witem-mute` are styled; if that is
10-board-history.css, add your rule in 08-windows-tools.css near the warn-hide block ~328 instead).
