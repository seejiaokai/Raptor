# The drawing check of multi-squadron batch 1 — the built app against the approved drawings (D1494, D1495)

Measured on commit `f94606328` (branch `claude/msq-b1-screens-135`, 23 Nov 26), the night's job 5. Built once, served
with `vite preview`, driven at his iPhone's size (402×874, WebKit, ×2) and a desktop's (1536×864, Chromium, ×2). The
drawings are `docs/mock/2026-11-22-msq-b1-screens/img/*.png`; the scripts that took the built pictures are
`scripts/handpass/n149/measure-night1.mjs`, `measure-job2.mjs`, `measure-job3.mjs`, `measure-job4.mjs` (the builders'
own, re-run) and `measure-job5.mjs` (every other picture); `compare-job5.mjs` lays each built picture on its drawing,
sets the drawing's pink "New" marks aside and lists every differing region in CSS pixels. A state was reached only with
the app's own controls (access given on Admin → Users, the menu pressed, a row opened, the bell tapped, a newcomer's
request made on the Request access card); where none exists the picture is listed under "not reached". Raw runs and all
side-by-sides are in the run's scratch folder; the pictures of the differences are beside this sheet
(`2026-11-23-msq-b1-drawing-check/`, the drawing left, the build right, each difference outlined in red).

**Kinds:** FAULT = something plainly missing or wrong; DEPARTURE = a ruling or a builder's report explains it; OWNER = a
difference for him to rule on. "Data" differences (a name, a date, a count the demo data gives the build and not the
drawing) are not listed. The b1-* drawings were drawn at 1440 and 390 wide; the builders' scripts measure those at the
drawings' own sizes too (job 3), and b1-1, b1-6, b1-8 were re-taken here at 1440×900 and 390×844.

**Totals.** 112 drawings are in scope (55 desktop, 57 phone; 23 more are replaced, see the end). 95 compared (48 desktop,
47 phone): 65 match — every difference in them data, a clip, or an explained departure — and 30 carry a FAULT or OWNER
line (f1a ×2, f1b ×2, b1-8 ×2, k1/k3/k4/k5 ×8, rB1–rB4 ×8, f4 ×2, f8 ×2, mA1-p and mA2-p, f3a ×2). 17 could not be
reached (below; two of them, f7a-p and f7b-p, have a file that does not show the state).

## Differences — outright faults
1. **f1a (desktop and phone) — Squadron config does not follow the schedule in view.** Hunter (142's admin, View of
   149) picks 149; the bar reads "149", the Admin page opens Squadron config — and it shows the unchanged page: the
   heading "Squadron config" (drawn "Squadron config · 149", 13px cyan, +36px wide), no line "This is 149's set-up. Only
   an admin of 149 can change it." (drawn, 36px tall at the top), and 4 controls greyed (drawn: every control greyed,
   the day/wave/duty template buttons among them). Built the page is Hunter's 142 set-up, fully editable. Picture:
   `2026-11-23-msq-b1-drawing-check/f1a-d.png`, `…/f1a-p.png`. Not named in any of the four builders' reports (plan §
   F1, D2317, was not built by jobs 1–4).
2. **f1b — the same page with 142 picked: the heading lacks "· 142"** (drawn "Squadron config · 142"; a 35×9px
   region). Everything else equals the drawing to the pixel (0.02% differing). Picture `…/f1b-d.png`. Same cause as 1.
3. **b1-8 (desktop and phone) — the holiday window lacks the quiet line "Off days stay each squadron's own"** at the
   right of the KIND label (drawn ~183×12px, 11px grey), and the amber warning before Save ("142's published Fri 7 Aug
   and 149's published Fri 7 Aug become holidays after publishing…", drawn 354×72px) does not show: window 702px tall
   against 775 drawn (desktop), 714 against 767 (phone). Reached as Kestrel (149's admin), Settings → Days → Holidays →
   + Add, Fri 7 Aug picked; the bar reads 149. The warning needs both squadrons to have published that day — the demo
   has no published Fri 7 Aug, so its absence here is not shown to be a fault; the quiet line has no condition and is
   not in the code (searched). Pictures `…/b1-8-d.png`, `…/b1-8-p.png`. No builder's report names b1-8.

## Differences for the owner
4. **The roles fold sits 6px lower than drawn** (k1, k3, k4, k5, rB1–rB4, f4, f8 — both sizes; k1-d 421px against 415
   drawn, k5-p 353 against 347, k3-d 771 against 765): between the squadron lines' note and "What each role allows" the
   build leaves ~6px more than the drawing (k3-d: 65 against 54 half-pixels). Picture `…/k3-d.png`. Also in k2-d/p
   (fold open): built 748/813 against 801/882 drawn — that is data (the drawing held a 150 line the run had not made).
5. **mA1/mA2 phone rows are 38px, drawn 44** (`draw-menu.mjs` 44 on a phone). The build equals f5d's 38 (page question B,
   recommended). The sheet is 56px / 12px shorter in mA1-p / mA2-p for that and for no detachment line. Picture
   `…/mA1-p.png` (desktop `…/mA1-d.png`: panel 268 wide against 276 drawn — the drawing's "249 · Exercise North" line
   was wider; the two rows are 38px as drawn). It is listed for him because a phone's row height is his rule.
6. **f3a — the bell's own-account lines:** built every line unread with a blue dot and "now", drawn only the first
   unread and dated days back (data of the run: all seven changes were made now). Real difference to look at: the list
   gains its "Show 142 149 / Mark all read" foot (42px taller: 480 against 438 desktop) which the drawing does not
   show — the builders' job 4 report names it. Picture not copied (the lines match word for word: "Given Plan of 149:
   full access to 149 · Saber", "View of 149 ended", "Given View of 149", "Enabled", "Suspended", "Made an admin of
   142", "Made a member").

## Departures already explained
- **mA1/mA2** words "Your squadron" / "View only" / "Full access" as drawn; option A chosen (draw-menu.mjs, f5d caption).
  **b1-1** (cards, "142 ●") is replaced by option A's checklist menu, so the built menu differs by design (the ✓ rows).
  Picture `…/b1-1-d.png`.
- **b1-6** ("Home squadron · 142" as its own grey line above an "Other squadrons" select) is replaced by design B: the
  "142 Home squadron" line in the squadron lines (rB*, k*). Picture `…/b1-6-d.png`.
- **n1a, n1b, n1c, n1c0** (the old filter row, Pilots · WSOs…) are replaced by the one Filter button, nfa–nfd (D2335;
  job 1). The built pictures equal nfa/nfb/nfd as measured by job 1 (within 1.2px); nfb-d/nfd-d are 331/191px tall
  against 554 drawn only because the run's frame shows the first rows (job 1's `FRAME_ND`) — the panel's place and
  width are exact.
- **Role box words** "Admin" / "Member" for the drawn "Admin — schedules and manages" / "Member — own inputs, quals and
  bids": D2305 (rB1–rB4, f4, f8, k*, b1-6). **Fold "What each role allows"** is in the build of rB1–rB4/f4 (+40px in
  the row) because the k pictures drew it (job 1).
- **b1-2** badge 31×14 beside the title (job 2, within the drawn figures); **b1-3, b1-4, b1-9, b1-10, p7** are 41–69px
  lower under the Admin panel's own "SQUADRONS" heading and back arrow, hidden in the drawing scripts (job 3); p7's Name
  and Save greyed too, the list above Places; b1-9's first-admin list is the real list (job 3). **b1-5** matches: 0% on
  the phone, 1.4% desktop (sub-pixel text); **b1-7** equals within 1px (job 1; the phone 360 wide against 348 only for
  402 against 390 wide).
- **f2a, f2c, f2d** band 36px desktop / 47px iPhone, words and veil as drawn (job 2); the chart's own place differs by
  a few px between runs (it centres on arrival). **f7a-d, f7b-d**: 20 and 50 controls greyed as drawn (job 2); the
  drawing's clip (1060 wide) is not the build's frame.
- **f5a, p3a, p3b, p3c** to 0px (job 4; the drawings showed no "Mark all read", the build shows it when something is
  unread, the row giving way). **f5b-p**: the editor is 705px against 463 drawn because Hunter holds Plan of 150–155,
  each with Plan's two-line note (job 1). **f5c-p**: the CAT chips include IR and D, the panel 34px taller (job 1).
  **f5d-p** equals: 8 rows each 38px, "142 Your squadron" ticked, "149–155 Full access".
- **f9** the toast reads "1 waiting for access to 149" as drawn; the bar reads "149" and the list is 149's, as the
  drawing's own caption says the build does. **f8** the toast reads "He asked to join 149 — only an admin of 149 can
  answer it." as drawn, in the app's amber toast (the drawing outlined it pink). **f10** the bubble reads "Undid: Plan
  of 149 given · Hunter"; the Undo button's hover title is "Undo" (the drawing's "Undo — Plan of 149 given · Hunter" is
  a hover a picture cannot show; not measured).
- **p2a, p2b, n3**: "· also plans 149" at the end of Hunter's line, 11.5px grey, beside the grey "142" on 149's list;
  n3's line "Given Plan of 149: full access to 149 · Saber" (the drawing's second line "made an admin of 142" and the
  scale line are not made by one Save).
- **nfa, nfb, nfc, nfd, k2** as job 1 measured.

## Not reached (no road through the app's controls; unit tests hold them)
f6a, f6b, p5 (both sizes): the held "Signing in…" needs the saver to be mid-save; this build has no server saver, so
`saveSettling()` is never true — held by `src/ui/signin-hold.test.tsx`. p8, p10 (both sizes): the "posting could not
run" line and bell line need the posting runner to give a posting up. f3b (both): its four lines are written by the app
itself (a move at midnight, an archive, an Overseas suspension). f2b (both), f2c-p: the Tracker after his Plan is
lowered / the member view on a phone — job 2 holds them by unit tests (`msq-trk-cover.test.tsx`). f7a-p, f7b-p: a Leave
War window's shade covers the top bar, so the menu cannot be pressed (job 2's finding, `docs/ui-contracts.md`).

## Not checked (replaced by later rulings)
p1a, p1b, p1c (the old ladder, replaced by design B), rA1, rA2, rC1, rC2 (options not chosen, both sizes), mB1, mC1
(options not chosen, both sizes).
