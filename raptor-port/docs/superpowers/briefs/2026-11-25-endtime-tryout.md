# The end-time try-out page — what it is, what is real, what is assumed (25 Nov 26)

The page: `raptor-port/docs/mock/2026-11-25-endtime-tryout/index.html` — one self-contained file (461 KB, no outside
script or font), for the host to publish as an Artifact. Nothing in the app changed; nothing was committed.

## How it was made
- `capture.mjs` signed in as `ad` on a preview of the existing build (no build run) and took Thursday 16 Jul's section
  from Edit Schedule in six REAL states, and the app's stylesheets whole: the draft (`capture/1-draft.html`), signed,
  published (Original), a published day with one time changed (pending), that change signed, and AL1 published. Each
  state's head, Signed line, sign-off panel and amendment marks in the page are copied from these captures, not guessed.
- `build.mjs` folds the draft capture, the app's CSS and `src/` (frame, the try-out's CSS, its script) into `index.html`.
  No app script is carried over.
- `walk.mjs` walks the whole flow at his iPhone's width (402, WebKit, touch) and a desktop (1536, Chromium, mouse):
  draft → refused sign-off → refused Publish day → the count line → fill → singular words → sign ×4 → Publish day →
  clear a time → refused Publish AL1 → fill → sign → Publish AL1 → Reset → each switch. 33 checks a width, all pass, no
  console or page errors, no sideways scroll at 402. Pictures: `img/` (iphone402-*, desktop1536-*).

## What works
- Staged rows: VL with crew, take-off empty, landing 14:10 · SXO with Anvil, no times · OFT EP-4 with no START ·
  SQN PT 15:00, ALL AVAIL, no end · DINNER WITH CMD 18:30, nobody, no end · the AMT block's BRIEF and DEBRIEF (their END
  empty, never counted) · a blank Standard duty line · a whole-day ATTACH (Hunter) under Unavailable. Start: 4 items.
- Grey outline while drafting; red once a sign-off box or Publish is pressed, staying red until filled; each box loses
  its outline as it is typed. The count line "4 items missing a time · 4 to sign" (singular too) sits where the app's
  "4 to sign" is, goes at 0, and a tap scrolls to and focuses the first empty box.
- The refusals in the app's grey "Blocked:" note with its exact look (the app's own `28-blocked.css`, built as
  `ui/toast.ts` `blockedFace` builds it), all four wordings as given.
- Times take 1540, 15:40, 930, 0800; one tap then typing replaces; Enter keeps, Escape puts back; a non-time is put back
  with a plain note. A changed time clears the four sign-offs, as the app does.
- Sign-offs: four demo names a box (CUR CK: Ace, Anvil, Basher, Blade; the ✦ boxes: Anvil, Basher, Bolt, Cinch).
- Publish day → ORIG tag, the Signed line, empty sign-offs, "Thursday published and approved". On the published day a
  changed or emptied time shows "1 pending", "Not yet signed" (then "Not yet published"), the dotted mark in AL1's colour,
  a locked Publish AL1; Publish AL1 → the AL1 tag, "Published AL1 · 1 item on Thu only · approved by …", and the changed
  time keeps its solid AL1 mark. AL2, AL3… follow.
- The three switches and Reset change the behaviour live.

## Approximate — where it differs from the real app
- One day only, centred, at the width the desktop week gives a day (552px); the top bar, crew panel and other days are
  not drawn. On a phone it is the app's own phone styling of the day.
- Only the time boxes take typing; every other box, button and puck is drawn but does nothing. "Unpublish" is inert.
  "1 pending" scrolls to the change instead of opening the list of changes.
- Removed from the capture: the day's warning list (it described the demo day, not this one) and the "N changes" chip.
- The pending count counts changed time boxes; the app counts its own way (D109 — one man moved is one change). For
  time-only edits they agree.
- Publish day stays pressable while a time is missing so the press can be refused; it wears the app's locked look
  (copied from `.dbeak[disabled]`). With nothing missing and not signed it is disabled, as built.
- The ALL AVAIL count "22" is made up, and its place after the puck is approximate.
- The outline is a 1px line drawn inside the box (as the earlier drawings drew it: `2026-11-25-guardrail-wording/draw-jk.mjs`),
  grey `--ink-3`, red `--hard` #F0555F, no glow. An empty list box is held 34px wide to carry it.

## Assumed — say so to him if it matters
- After a publish the four boxes are empty and the Signed line names who signed: seen in the capture, and in the code
  (`ui/html.ts` `signoffHTML` reads `signShown`; `signedLineHTML`).
- The words when Publish AL1 is refused reuse "Thursday was not published." — the brief said "refused the same way".
- "Signing starts" (switch a) means any press of a sign-off box or Publish on that day, refused or not; it resets when the
  day is published, so on a published day "Grey until signing" means grey until the next press.
- "Block too" (switch b) counts a row with nobody on it only where at least one time is typed; a line with no person and
  no time (the blank Standard line) never counts.
- The ATTACH sits under Unavailable because an Attach lands there by itself (D1372, D1374); every Unavailable row is
  never counted.
- No standby line is staged (Thursday has none); the rule for it is in the script but not shown.
- Code read for the published and amendment looks: `ui/html.ts` `verTagHTML`, `verChipHTML`, `signedLineHTML`,
  `nysMarkHTML`, `dayStatHTML` (the Publish day / Publish ALn / "N pending" buttons), `signoffHTML` (the status words,
  "Published at Original · 1 change to publish — Publish AL1"); `ui/scheduler/04-pucks-sections.css` (amendment marks:
  dotted while waiting, solid with its tag once out; `.dbeak[disabled]`, `.dbeak.locked`); `ui/toast.ts` (the note's
  place, hold and phone width).

## Follow-up, 26 Nov 26 — the waiting mark on an emptied time

**What was wrong.** The page drew no amendment underline at all — not the dotted one under a changed time, nor the
solid one under an AL1 time (the old `img/*-12-al1-mark.png` shows "15:00" with its AL1 tag and no line). The cause was
the capture, not the script: `capture.mjs` rebuilt the stylesheets from `cssRules`, and the browser writes a shorthand
holding `var()` back out as empty longhands (`text-decoration-line: ;`), so the app's two underline rules and about a
dozen borders arrived empty. The "dotted mark in AL1's colour" in §What works above was never on screen.

**What changed.**
- `capture.mjs` now takes each stylesheet's own text as served (`CSS_ONLY=1` refreshes only `capture/app.css`); the
  CSS was re-taken from this branch's build (served once on port 4796, stopped). `index.html` is now 391 KB.
- `src/tryout.css`: an emptied box waiting to go out lays an invisible "00:00" over its faint dash, so the app's own
  dotted rule runs the width a time takes, at exactly the place it sits under a typed time (typing one moves nothing);
  while outlined as missing, that box's outline steps 3px out left and below (negative margins, the row unchanged) so
  the dotted line sits inside it, not on its edge.
- `walk.mjs`: five new checks a width (step 1 ×2, step 2, step 3, and the grey-until-signing case). 37 a width, all
  pass at 402 (WebKit) and 1536 (Chromium); no console or page errors; no sideways scroll at 402.
- Pictures, cropped to the SXO desk and the rows either side: `img/amend-1-emptied-*`, `img/amend-2-retyped-*`,
  `img/amend-3-published-*` (`iphone402`, `desktop1536`). Looked at, all six.

**How the real app marks a cleared time — seen, not read.** Edit Schedule, Thursday 16 Jul signed and published, the
SXO END cleared in its own box: the box gets exactly what a changed time gets — `data-alp="1" data-aln="1"`, title
"Edited — goes out as AL1", "1 pending", "Publish AL1" (`engine/publish.ts` `alAttr` marks a key, not a value). The look
is the same rule too (`04-pucks-sections.css`, `#eWeek :is(span,b,i,div)[data-aln]…` — a dotted underline in the AL
colour). **The difference:** that underline is a text line, and an empty box has no text — only the faint "—" the
editor draws for any empty box (`12-schedule-editing.css` `.txed:empty::before`). So in the app the mark on a cleared
time is about three cyan dots under a faint dash: practically invisible (`img/realapp-cleared-1-emptied-desktop-4x.png`,
4× magnified; `…-2-retyped-…` and `…-3-al1-…` show the same box once retyped and once out as AL1). The page draws the
line a time's width instead, as the design asked. Building this needs the same small change in the app; until then the
app shows a cleared time's waiting mark far fainter than this page does.

## Follow-up, 26 Nov 26 — the rule on the real Scheduler Board

`board.mjs` (beside the page) draws it on the REAL board, served from this branch's build, using the guard-rail kit
(`2026-11-25-guardrail-wording/kit.mjs`). Thursday staged through the app: "+ Item" made SQN PT (15:00, ALL AVAIL, no
end); VL's take-off, the SXO desk's START and END and the OFT EP-4's START emptied; for (c) all filled, the four signed,
Publish day pressed, then the SXO END emptied by typing in the board's own box. The only things the script adds: the
outline classes on the empty boxes, and the count words in front of the board's status line (allowed to wrap).
Pictures, 26 (`img/board-*`): for each size, (a) and (b) a wide view plus the flying, duty, sims and programme rows;
(c) a wide view of the sign-off, a wide view of the duties and the SXO row. Looked at.

- **The outline:** the try-out's own 1px line inside each empty box (`--ink-3`, then `--hard`). The board's boxes
  already have a grey edge, so the line sits just inside it: grey reads as a brighter edge, red clearly as red. On a
  phone the board stacks R over B and TO over LD, and the outline sits on the TO box; on the desktop R · B · TO · LD in
  one line.
- **(c) the amended case:** on the board the app's waiting mark on a time box is not an underline — it is a dotted
  outline in the AL colour on the box's own edge (`#schedBoard :is(input,textarea)[data-aln]`, an input cannot carry
  the underline). Seen on the emptied SXO END: dotted cyan edge, red line just inside it. Both show; they sit on
  neighbouring pixels, so at a glance it reads as one red box with a cyan dotted rim (`board-c-duty-*`). If he finds
  that busy, the alternative is to recolour the box's own edge red and keep the dotted mark — that would hide one of
  the two, so it is not drawn.
- **Sign-off and Publish on the board: it has both.** The board's sign-off bar (`#sbSignBar`, `ui/board.ts`
  `boardSignBody`) carries the same four sign-off boxes, the status line ("4 to sign · CUR CK, SKED CK, PLANNED BY,
  APPROVED BY") and Publish day / Publish AL1 — the week's own builders. So the count line goes where it goes on the
  week: in front of that status line — "4 items missing a time · 4 to sign · CUR CK, …" (drawn so). No new control. One
  difference: the board's status line names the missing roles and never wraps; with the count in front it is too long
  for a phone, so it is drawn wrapping onto a second line. Needs his call: whether the board keeps the role names after
  the count.
- **Left as found:** the preview server is stopped. This worktree had no `node_modules` and no build; a link to the main
  checkout's installed packages (the documented way, `gates-and-deploy.md`) and this branch's `dist/` stay, both
  ignored by git, so `walk.mjs` and `board.mjs` can run again.
