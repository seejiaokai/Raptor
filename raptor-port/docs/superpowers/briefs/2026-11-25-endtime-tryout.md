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
