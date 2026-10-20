# The night of 21 Oct 26 — vetting the small fixes (three readers, read-only)

Each reader checked its items on `main` at `b3db0675f`: still open, needs him or not, size, type of change
(`docs/walk-ledger.md`). Saved as they arrived, condensed only by dropping repetition; every verdict and line kept.

## The night's way of working — one fresh session per job (D1103, his "Ok yes", 21 Oct 26)

From job 2 on, each job is built and checked in a fresh session of its own, started by the night's chat one after another; the night's chat only coordinates, checks each result and writes the morning report. The weekly figure is read at the start and in the morning to measure it. If it works, the overnight guide is changed to say so — while he is awake, read before his approval (D70): filed as [OVERNIGHT-SESSION-PER-JOB].

## Reader 1 — the Leave War and the Tracker

No ruling names any of these items, except LW-LOCKMARK in D147's work order. None is archived as done.

- **[LW-SEL-HALF-LABELS]** — the drag-selection sheet's half-day buttons print the stored code ("FCL*", "*LL"); the
  one-day sheet shows "<FCL" / "FCL>". Still open (SelectSheet.tsx 249–250 print `formatCell`; BidPicker.tsx 542 prints
  `displayCell(formatCell(…))`). No owner: D264 says the two sheets share one format and one look. Tiny; F/E. CAN RUN.
- **[LW-SETTINGS-SMALL]** — "Reset order" judges the whole roster where the grid draws only the visible months; an armed
  "Really reset?" survives a page switch. Still open (store.ts 2453 `rosterFollowsDefault`; SettingsSheet.tsx 85
  `armOrder`). No owner (the code's own rule: judge by what the grid shows). Small; A+C. CAN RUN.
- **[LW-DOZE-GUARDS]** — do the grid's "not laid out yet" guards run while the page dozes? Unchecked; the guards are now at
  Matrix.tsx 1823 / 2671 / 2673 (the item's line numbers are stale). Tiny; R. CHECK FIRST — then fix or close.
- **[LW-MONTH-MEMO-UNPINNED]** — one changed cell redraws every month of every row (5,840 month redraws); no test pins the
  month guard (MatrixRows.tsx 353). Medium; speed; risk of a cell not repainting. CAN RUN, last or dropped.
- **[LW-ROWS-STALE-NOTES]** — notes and comments still name the grid file for code that moved (table in
  `docs/handpass/parts/lwrows/read-opus.md` ~112–129). Its table also proposes editing D261's full-row home and a rulings
  file's `paths:` — leave those or flag them. Tiny; F. CAN RUN.
- **[LW-PHONE-AWAY-ROW-MISSING]** — on a phone, a man posted in, archived the same day, restored with a later post-in, has
  no row; the desktop draws him. Not yet reproduced; intended result settled (as the desktop). Small–medium; D/A. CHECK
  FIRST — reproduce, test, fix or close.
- **[PO-MOVE-DATE-DELETE-ASK]** — the Post out sheet saves a picked date at once; with outcome Delete and a date today or
  past, the man may be deleted at one tap. Likely real (BidPicker.tsx ~1033 calls `onChange` at once; sync.ts ~1758 runs
  due Deletes). The item reserves the question for him (D287 (3), D801). G+C, high consequence. NOT TONIGHT as a fix;
  tonight only the test that settles yes or no, the question parked if yes.
- **[LW-OFFER-ONLY-TAKEABLE]**, **[LW-LOCKMARK]** — still open; a medium refactor of the war's leave lock near published
  remarks (D147's order). NOT TONIGHT as small fixes — a night of their own.
- **[LW-HARNESS-VIEWER-PIN]** — in the war's browser tests a role switch drops the pinned viewer (auth.ts 26; sync.ts
  2165–2167; probe-bridge.ts 176). Test harness only. Tiny. CAN RUN.
- **[TRK-PINCH-OLD-EDGES]** — Edit chart layout switched on mid-pinch throws; a pinch ended by a lift lost to a redraw
  leaves the % label stale and the zoom not his (core.js ~3721, ~3769 vs 3838). The agent's to place. Tiny–small; C. CAN RUN.
- **[TRK-REFUSALS-UNTESTED]** — the chart editor's refusals have no test. Tests only. Small. CAN RUN.

Recommended: Leave War batch ~3–4 h (5–6 h with the month redraw); Tracker batch ~2–2.5 h.

## Reader 2 — People and Quals, the look of the whole app, Insights

- **[QUALS-PINNED-COLS-REFLOW]** — Quals' pinned heading row sits a few pixels off after one column changes width at the
  same table width (desktop, after an undo of a remark or rename). Still open; the agent's. Small; E. CAN RUN.
- **[MEMBER-EDITPAGE-CHECK]** — a member pushed onto Edit Schedule by the developer bridge sees live-looking Amendments
  buttons; "Discard marks" is gone (D488), only "Publish AL#" left. Never run. H (who may do what) — any fix gets the fresh
  blind Opus read. CHECK FIRST — then fix or close.
- **[GUEST-SAVE-WARNING]** — the guest page (58 lines: a week switcher and Sign out) saves nothing. Expect a close with
  the reason. R. CHECK FIRST.
- **[FLOATWIN-TWO-LINE-BAR]** — the changes and ALL AVAIL windows open at a fixed 96px; a two-line bar (~103px) loses
  its last 7px under them. Measure first whether the bar is still two lines. E, settled (as the failed-save band does).
  CAN RUN.
- **[READONLY-WEEK-WORDS]** — partly stale: the old words are gone; D837's sentence ("published by an older version") is
  reused for a damaged week, where it is untrue. New words for him. NOT TONIGHT.
- **[BATCH-14OCT-LEFTOVERS]** — heading stale (went live 15 Oct, pull request 506). (a) Cancel-item sheet's chips and
  "✎ Edit" wear the browser's white focus ring — the app's cyan ring is settled (D830/K10), CAN RUN; (b) Quals dead links —
  DONE (D930/D935), close; (c) a clash note prints a raw id — show the callsign as everywhere else, CAN RUN; (d) comments
  naming the Medical view as full-screen — CAN RUN; (e) three Inputs tests on the real clock — CAN RUN; (f) the passing
  note not read by a screen reader — a polite live region, CAN RUN.
- **[WINDOWS-KEEP-KEYS]** — his word under the design guide §2 (D807) and it meets D641's non-blocking windows. NOT
  TONIGHT (its AB-F2 test could ride alone).
- **[OG-TAG-OVER-COUNT]** — the "OG" tag overlaps the ALL AVAIL count's top edge. Settled overlap fix; D588/D595 make it
  the one Sonnet building trial, read by Opus. Tiny; E. CAN RUN, reproduce first.
- **[INP-OIL-CHIP-PHONE]** — possibly stale after the card rebuilds. Look, add the test, fix or close. CHECK FIRST.
- **[BOARD-NARROW-DESKTOP-REMARKS]** — a new layout; picture first. NOT TONIGHT.
- **[STACK-LEFTOVERS]** — (1) two Insights edges never tried: a walk check, CHECK FIRST, park a choice; (2) the shared
  Blue/Red wording helper — placed with [CODE-TIDY-AUDIT], not tonight; (3), (4) not tonight. Its "Seen 10 Oct" note
  lists three items already archived.

Recommended: "look, keys and words" ~3–4 h; People/Quals and Insights checks ~2–3 h.

## Reader 3 — the schedule, the Inputs pages, checks and documents

- **[OIL-NOTIFY-SEEN]** — (1), (5) and the sideways edge band done; (4) answered by D792. Left: (2) a puck dropped on
  nothing says nothing — D850 likely answers it, his to close; (3) the ALL AVAIL chip out of reach — layout, picture
  first; the crew-list puck on a sideways phone — the design guide says a drag already built that does otherwise is named
  to him, not changed. NOT TONIGHT.
- **[BOARD-SIDEWAYS-KEYS]** — layout, picture first. NOT TONIGHT as a fix.
- **[INNERHTML-REPAINT-SWEEP]** — Quals fixed 19 Oct, Logic by pull request 554 (the item's list stale on Logic). Left:
  ALPanel, AvailWindow, ChangesWindow, InputsCal, MedicalView, Modals, PeoplePick, SansCal, SansDay, Shell (boxes in the
  file itself: InputsCal, Modals, Shell). Nothing he sees changes. Small; C. CAN RUN.
- **[LOOK-PENDING-COUNT]** — not reproduced; a published record's count. CHECK FIRST; a fix is FULL tier.
- **[TITLE-CHECK-SEEN]** — (1) looks done by the one-rule build, one look then close; (3) published pending list, FULL,
  reproduce only; (8) a look change, not tonight.
- **[ALLAVAIL-CHECK-SEEN]** — no-change Save making an Undo step (D948 settles it): check, fix; Escape closing both
  windows: check, fix; second tap in the editor calendar: may be stale, check; a 1–2px speck where a desktop has its
  resize corner (D77): tiny, can run; "till" in the remark and the List pencil: gone; "2 pending" for one act: OIL and
  published, check only; new words and the print's Ground Programme row: not tonight.
- **[CAL-CHECK-SEEN]** — each man's LATE tag: stale (removed with D718/D721), close; two gesture finds, Escape on a day's
  Delete question, a settings window left up after a page change: check, then fix; sideways layouts, the 568-tall window,
  "Calendar…" placement, Escape while a control behind holds the keys: his, not tonight.
- **[CI-UNIT-SHARE-2-6]** — still true (unit 2/6 5m19s, the slowest). Split by time; deploy.yml (not a hook or setting);
  2–3 GitHub runs to measure. CAN RUN.
- **[GATELOCK-STALE-LIVE]** — the push-and-lock guard HOOK keeps its own copy of the 2-hour rule; the fix changes the
  hook. NOT TONIGHT (the item's "scripts only" is wrong).
- **[SAVE-NOTE-TEST-GAPS]** — still open (save-note.spec.ts 52; no resized-window case). Tests only, under the lock. CAN RUN.
- **[DOCSIZE-MERGE-CEILING]** — still open (`ceilingMovedWithCode` without `--no-merges`). A script; a documents-only
  branch of its own. Tiny. CAN RUN.
- **[RULINGS-LF-PIN]** — still open; all rulings files LF today. Rides a job running the full checks. CAN RUN.
- **[DEPLOY-DOCS]** — docs half done 24 Sep; live-check.mjs retired 26 Sep; left: deploy.yml's header and comments (keep
  the workflow name and concurrency group). Tiny. CAN RUN.
- **[DOC-POINTERS-CODE]** — all pointers still there. Comments only. CAN RUN.
- **[ONE-RULE-LEFTOVERS]** — (2) done; (3) four stale comments, tiny, CAN RUN; (1) wire the 55 register ids into test
  titles and the rule check — medium, tests only, CAN RUN.

Recommended: checks file ~1.5–2 h; document-gate fix ~30–45 min; tests and comments ~3–4 h; repaint sweep ~1.5–2 h;
Inputs "reproduce, then fix or close" ~3 h.
