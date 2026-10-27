# The keyboard on his iPhone: the phone carries the window — 27 Oct 26 (WALK; Fable's round, D1366, his D1412)

**His four recordings** (25 Oct 26 20:43:46, 20:44:07 and 20:45:05 with `?kbdebug`; 27 Oct 26 08:20:16), all of the round-6
build (`claude/lw-m3-placing-leave`, merged to `main` 26 Oct 26), and his words of 27 Oct 26: *"I don't like how now all the
text areas I click screen jerks or bounce a little when the keyboard opens. Even for text that are above the keyboard. It
wasn't like that previously before the fix … clicking on text box that are below the keyboard. It seems very buggy that the
window top screen will shorten and I can see the background like the cyan input. Then it expands back out again. Why can't the
text box I click on, auto scroll proportionately with the keyboard that appears and the window doesn't shrink awhile. My idea
is a smooth feel for this app and this made it worse."* Recorded as D1412. Branch `claude/kbs-fable`, cut from `main` at
ab952f4c8. The six rounds before this one: `2026-10-25-kbs-other-remarks.md`.

## What the recordings show, frame by frame

Every frame pulled at 1/60 s (`scripts/handpass/video-frames.mjs`, its names widened to the millisecond in this job — at one decimal
it kept one frame in six, which no earlier round noticed), a landmark tracked numerically in each (the sign-in button; the input window's title bar; the
keyboard's top edge), the readout read off the frames where it was on.

- **The sign-in page, 25 Oct 26 20:43 (the readout on).** His iPhone's numbers with the keys up: the layout 684 read as 609
  (`iH609`), the visible screen `vv363@75` (363 tall, panned 75), the fixed sign-in layer `win-75-609` — the round-4 measure
  (every box from the visible top). First tap: the keys rise over 0.37–0.55 s and the card moves up 19 in step with them —
  smooth. Second tap (the password box): the keys vanish and come back (the phone's own password transition), the pan goes
  from 19 to 75, and the card wobbles for six frames (434, 440, 441, 432, 438, 437 — ±5 points back and forth) before it
  settles 17 higher. That wobble is the app: at the pan's word round 6's `compensate` shifted the card down by the pan's change
  and glided it; two frames later the placing read the box as above the keys and glided the shift back to zero — two glides on
  two clocks, fighting. The readout shows it: `vv-scroll … sh0`, `placed-win … sh0` with the shift set and unset between them.
- **The sign-in page, 27 Oct 26 08:20 (no readout).** Three openings and two closings; the card moves 19 up and down in step
  with the keys each time, no wobble — the same code, the pan told in one piece. So the bounce he sees on a box above the keys
  comes and goes with how the phone tells of its pan: nothing a model of the slide can promise.
- **The input window, "Other" → Remarks, 25 Oct 26 20:45 (no readout).** The keys rise 4.95–5.30 s. The window's title bar:
  120 → 112, 136, 111, 145, 149, 149, 145, 143, 139, 138, 130, 128, 121, 120, 116 — it dips about 30 points for ten frames while
  the window is shortened to the room (the hold, `--kbcap`) and its body scrolled; in those frames the day window behind it —
  "Wed 14 Oct", "+ Input", "No inputs on this day" — shows above the window's title. His "the window top screen will shorten
  and I can see the background like the cyan input". The keys going down (5.78–5.95 s): the title jumps 128 → 305, 245, 262,
  280, 297, then 115, 126, 133, 139, 111 — the put-back's glide drawing the window some 180 points low for five frames, then
  snapping. His "then it expands back out again".
- **The input window (OL), 25 Oct 26 20:44.** The same window at the top of the screen; the readout's lines confirm the
  event order of round 6 (`vv-resize` with the keys, `vv-scroll` with the pan, `placed`); the ✕ could not be tracked reliably
  through the hold, and the recording is kept as the context of the other two.

**Why the six rounds could not have fixed it.** Each one steered the window — raised it, held it to the room, pinned it,
brought it down, shifted it with the pan, glided it on a measured curve — against what Safari was going to draw. Safari pans the
visible screen over the page with the keys and draws everything fixed to the layout, a window included, riding up with the
page in that motion; it tells the app of the pan once, in final numbers, some 30 ms in; and what it draws between the app's
own frames (the shrink, a glide's start, two glides at once) is never quite the model the stand-in played. A window moved by
the app while the phone slides can only ever be nearly right, and "nearly" is a dip of 30 points and the page behind it.

## The design (his D1412; the brief's option b)

**The app leaves a window to the phone.** When a box in a window takes the focus and the keys come, the app does nothing to the
window: Safari's own pan carries it up with the page, in step with the keys, exactly as it carries page content (what D1081 did
for the Scheduler Board), and the box arrives above the keys because that pan is made to show it. When the keys go down the pan
carries it back. Once the pan has come to rest, the window's own scrolling body is scrolled only where the box is still
covered — by the keys, or by the window's own pinned Cancel / Add (round 1's fix stays); and only where a browser shrank the
visible screen without showing the box at all — which Safari never does — is a window raised, as a last resort, by its
`translate`, never past the visible top. **Gone:** the hold to the room (`--kbcap`, `[data-kbcap]`), the pin, the bringing down,
`compensate`, the glide and its two measured slides, and the stylesheet rule. `src/ui/kbscroll.ts` went from 673 lines to 420.

**What he will see on his iPhone**, by the recordings' numbers: tap Remarks in the "Other" window — the keys rise and the whole
window slides up 272 with the page over the quarter second, its title bar going off the top, Remarks coming to rest about 110
above the keys, Cancel / Add at the window's foot just above the keys; nothing shortens, nothing shows above the window. Tap
the page to close the keys — the window slides back down with the page. Tap Username on the sign-in page — the card rises 19
with the keys, once, and holds. A box higher up the window while the keys are up — the phone pans back to show it.

## Tier: WALK

The eight questions: money no; the published record no; saved data no (nothing stored); **a shared drawer yes** (the one lift
serves every box in every window, sheet and panel); a new gesture or surface no; roles no; the warning list no. Type of change
(`docs/walk-ledger.md`): A (one shared mechanism), E (motion of every window), R (his reported fault).

## Roll-call — every window a box can be typed in while the keys are up

| Where | What the keys do now | Walked |
|---|---|---|
| The input window from an Inputs calendar day (OL; "Other") | has it — the phone carries the window; the body scrolls only a covered box | A, A2; KS3g, KS3j, KS3k |
| The input window from a SANS calendar day | has it — the same window and lift | B; KS3h |
| The input window from the schedule (Edit Schedule, the board) | has it — the same component and layer as A | carried by A (KS3c, KS3d from the Inputs list) |
| The sign-in page's two boxes (a card on a full-screen fixed layer) | has it — the card carried by the pan, nothing shifted (his 20:43 and 08:20 recordings) | F, G; the unit case "the sign-in card" |
| The Tracker's All events → Edit (a window taller than the screen) | has it — carried; a box the pan did not reach is scrolled by its own list, the window untouched | C; KS3i |
| A window on a backdrop (Admin → Duty templates, Wave templates) | has it — the box on the backdrop, carried; raised only as a last resort (KS3, the stand-in's no-pan case) | E; KS3, KS3b |
| The Scheduler Board | must not, because it is page content carried by the phone's own scroll (D1081) — unchanged | KS1, KS6, KS7, KS8 |
| The Logic page and other page content (Admin → Users) | must not, because the page itself scrolls — unchanged | KS2, KS4, KS5 |
| The Leave War's sheets and bid windows | **not changed** — they place themselves at the pan's word (`leavewar/ui/Sheet.tsx useKeyboardInset`: their top set to the visible top and their height capped, at once), which on his iPhone is the same jump-then-slide class; named under D852 and filed in [KBS-PHONE-SLIDE], to be drawn for him if he sees it there | not walked (their own tests unchanged) |

## Sizing (D607, §7.0)

1. **Type:** A (one shared mechanism), E (motion of every window the keys meet), R (his fault, recorded).
2. **What only a walk could find:** the window's own place at every frame of his measured slide on each window the lift serves,
   and the picture of his screen through the slide — the tests prove the numbers, the pictures what he would see; what only
   the real phone draws (the order's §7.11, lesson 6): Safari's pan itself and what it draws between frames — his iPhone look
   before anything is called fixed, asked for below.
3. **The ledger:** the keyboard rows (19 and 25 Oct 26) found each fault only on his phone or his measure; every stand-in
   pass of rounds 1–6 was followed by a fault on his phone — lesson 7 of §7.11, written from this job.
4. **The walk chosen:** the host alone, `scripts/handpass/kbs-carried-walk.mjs` — his measured slides played on a stand-in
   measuring as his phone does, seven cases (A, A2, B, C, E, and the sign-in's F and G), up and down, phone 402 Chromium,
   the window's own place recorded every frame and his screen drawn frame by frame; the repeated routes into the same input
   window carried by A (same component, same layer). Checked against §7.11: lesson 1 (states — the keys up, then down, both
   driven); 2 (speed — his measured slide, not a slow one); 3 (feedback — the box in sight after, the pictures); 4 (a press
   behind a window — not this change); 5 (what stands over the box — Cancel / Add still kept clear, KS3d); 6 (the real phone
   — his look asked for); 7 (this job).
5. **The row:** added to `docs/walk-ledger.md`.

## Red first

- `src/ui/kbscroll.test.ts`: ten cases on the code before the fix — the window never held or shrunk (two), the pan's window
  left where the phone put it (three), his measure (three), and his four recordings' two cases (the sign-in card at the pan's
  word; the "Other" window's resize-then-pan, and the keys down) — **10 failed on the old code, 39 / 39 on the fix.**
- `e2e/kbscroll.spec.ts`: KS3b, KS3c, KS3d, KS3e, KS3f, KS3g, KS3h, KS3i, KS3j, KS3k rewritten to the new rule — **10 of 18
  failed on the old build, 18 / 18 on the fix** (the five that still failed on the first run were the tests' own stand-in
  numbers: Chromium lays the form out longer than his phone, so the body scrolled a few points the pan left wanting, and a
  keyboard with no pan at all cannot show a box that only a pan can — rewritten to assert what the change promises).

## The walk (`kbs-carried-walk.mjs`, the built bundle served on 4181; pictures `docs/img/handpass/2026-10-27-kbs-carried/`)

The window's own place in the layout, recorded every frame through his measured slide up and down (its top at rest; the
furthest it moved; anything shifted or held after); the box with the keys up, in his measure (from the visible top), against
the visible height and the window's Cancel / Add; and the largest step the window's own body scrolled through the slide:

| Case | At rest | Moved, up / down | Shifted or held after | The box with the keys up | Body's largest step |
|---|---|---|---|---|---|
| A input window, OL, Remarks | 12 | 0 / 0 | nothing | 187–220 of 393, Cancel / Add at 438 | 0 / 0 |
| A2 input window, "Other", Remarks | 12 | 0 / 0 | nothing | 278–311 of 390, Cancel / Add at 350 | 0 / 0 |
| B SANS day's input window, Remarks | 12 | 0 / 0 | nothing | 260–293 of 390, Cancel / Add at 458 | 0 / 0 |
| C Tracker All events, Name | 41 | 0 / 0 | nothing | 292–322 of 390 | 0 / 0 |
| E Duty templates, last time box | 129 | 0 / 0 | nothing | 221–249 of 393 | 0 / 0 |
| F sign-in, Username (pan 19) | 152 | 0 / 0 | nothing | 173–213 of 363 | 0 / 0 |
| G sign-in, Password (pan 75) | 152 | 0 / 0 | nothing | 187–227 of 363 | 0 / 0 |

**Looked at** (opened, the host): `A2-up.png` — the window rides up with the page over the slide, its title off the top by
120 ms, Remarks at rest above the keys with Cancel / Add under it, nothing of the page above the window at any frame;
`A2-down.png` — it rides back down, the title returning; `F-up.png` — the sign-in card rises 19 with the page and holds;
`C-up.png` — the Tracker's list rides up, the Name box above the keys at the end. No page or console errors in any case.

## Gates

- `src/ui/kbscroll.test.ts` 40 / 40 (39 before the read's fixes); with `freshbox.test.tsx` and `amendbatch-app.test.tsx` 65 / 65.
- `e2e/kbscroll.spec.ts` 18 / 18 on the built bundle, before and after the read's fixes (the lock taken for the builds and the runs).
- `npm run build` green; `npm run rulecheck` OK.
- GitHub's run of the pull request is the full set (D1086) — read after the push.
- A fresh, blind Opus read of the finished code (D790) — §The fresh read, below: four findings, all fixed, the touched checks run again.

## The fresh read (D790 — a fresh Opus reader, blind, on the finished commit 3f6eb7b38)

Every path meant to be unchanged checked unbroken (the Scheduler Board's, page content's, the window bar's refit, every
caller's import); no state that can get stuck; no reader of a removed name. Four findings, each with its failure, cause and
fix — all four taken:

- **F1 (a check that could not fail).** KS3d's "never shrunk" compared the window's height with itself, measured at the same
  moment. Now the height is measured before the tap and the window must still be that tall after the keys.
- **F2 (a walk that could not fail the way that matters).** The walk's pass rule checked only that the window never moved,
  never where the box ended or what the window's body did through the slide. Now each case also requires the box, with the
  keys up, in sight above the keys and above the window's own Cancel / Add where it has one, and reports the body's largest
  scroll step through the slide, up and down.
- **F3 (an 8-point move the raise could still make).** "In sight" was judged against the clear strip, so a box the phone's
  pan left within 8 points of the keys would still have had its window raised — two frames after the pan's word, mid-slide,
  the very kind of move D1412 forbids. Now a box the phone left in sight, to the keys' very edge, moves nothing: not the
  window, and not the window's body (the body scrolls only what the keys actually cover; the clear strip stays against a
  panel's own pinned foot, and on the page and the board as before). A box truly under the keys still rises to the strip.
- **F4 (the readout).** `?kbdebug` named the backdrop, not the window on it, for a window on a backdrop; now the window.

After the fixes: `kbscroll.test.ts` 40 / 40 (one more case — the box at the keys' very edge is left there), the browser set
and the walk run again — the figures below are the re-run's.

**Walk:** WALK — his measured slides played on seven windows, up and down (`kbs-carried-walk.mjs`): 7 / 7 the window never
moved by the app, the box in sight above the keys and above Cancel / Add in every case, the body never stepped; pictures opened. **Owed: his iPhone look** — the preview, the tab closed and reopened: the input window from
a calendar day (OL and "Other") → Remarks; the sign-in page's two boxes; the Tracker's All events → Edit.
