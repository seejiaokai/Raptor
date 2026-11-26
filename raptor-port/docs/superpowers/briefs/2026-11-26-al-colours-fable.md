# AL colours — a fresh Fable design helper's report (26 Nov 26)

His ask: "what if my AL just changes the text colour. No need to indicate the AL text there. This includes changing the
puck colours … find the most suitable colours … distinctly different between each AL … see if I totally remove the AL
chip is ok." Then: "Create mock up for this."

The page for him: `raptor-port/docs/mock/2026-11-26-al-colours/index.html` (pictures in `img/`). Not committed, not
published. Design skill used: impeccable (colorize, critique), on top of `design-practices.md` head, §0, §4, §9.

## What was made

- **A try-out he can play with**, built the end-time try-out's way: one real staged Monday captured from the running
  build as Edit Schedule, View-only Sched and the Scheduler Board (markup + the app's stylesheets whole, no app script),
  with a "Try-out settings" strip: Screen · Look (Today / Colour only, no chips / My recommendation) · A changed puck
  wears (today's chip / small tab / number only / name in colour / nothing) · Colours (today's / proposed, and each AL's
  swatch can be tapped and given another colour from a short list) · Colour-blind view (off / red-green) · The newest
  change (AL4 still waiting / all four out) · Reset.
- **The static analysis under it**: swatches on the measured panel colour with contrast, both palettes checked against
  the colours the app already spends, the hardest pair to tell apart (ordinary sight and red-green), colour-blind
  simulations, 18 pictures of the REAL app (3 screens × phone 402 WebKit / desktop 1536 Chromium × looks a, b, c), and
  four questions in his format.
- **The staged day** (through the app's own writes, sign-off boxes and publish buttons): Monday 13 Jul published, then
  AL1 (SODB 18:00–20:00, VL take-off, a duty desk's holder), AL2 (MET NOTAM BRIEF renamed, its start, a flight remark, a
  programme puck), AL3 (WPNS & TACTICS SYNC 17:00–20:00, RU landing, a WSO), AL4 (OCU PROGRESS REVIEW 15:00, INTEL +
  THREAT UPDATE, VL night take-off, three pucks) — captured with AL4 waiting and with AL4 out.

Scripts, all in the mock's folder: `stage.mjs` → `capture.mjs` → `shoot.mjs` → `build.mjs` (`--tables` prints the
figures below) → `test.mjs` (both widths, presses every setting, fails on a setting that changes nothing, a page error,
a broken picture or a sideways scroll: last run "no problems"). `colour.mjs` is the arithmetic; `search.mjs`,
`extend.mjs`, `probe.mjs`, `probe2.mjs` are how the sequence was found. They use the 25 Nov kit
(`docs/mock/2026-11-25-guardrail-wording/kit.mjs`), read only.

## Measurements

### Backgrounds and letters, read off the running app (`capture/measured.json`)

| Where an amendment mark sits | Colour behind it | Letters |
|---|---|---|
| Week (Edit Schedule, View-only Sched): programme and flying panels | `#1A1F2A` (the lightest) | JetBrains Mono 11px desktop / 10px phone; names Inter Tight 12 / 11px; regular weight |
| Week: duty / sim panels | `#181C21`, `#1D1A20` | 11px desktop, 9px and 8.5px phone |
| Scheduler Board: every box | `#0B0D10` | 11px, both sizes |
| Day's version tag | `#14181D`–`#182222` | 10px/800 dark letters on the AL colour |
| Pucks | pilot `#6E6A2E`, WSO `#1F6E52`, ground crew `#FFFFFF` | callsign cream `#FBFAF0` / `#EAFBF3` / dark `#18202C` |

Identical markup at 1536 and 402 (the stylesheets do the rest), so one capture serves both widths.

### Contrast (WCAG) and nearest colour the app already spends (CIEDE2000)

Spent colours checked: cyan `#3BC6E8` (accent, focus, CAT C), red `#F0555F`, amber `#E5A83B`, green `#57C97A`, purple
`#B24DEA`, CAT D blue `#3673DD`, text `#F1F4F7` / `#B6C0CB`, day-note yellow `#F2D699`.

| | Today | on week | on board | nearest spent (ΔE00) | Proposed | on week | on board | nearest spent (ΔE00) |
|---|---|---|---|---|---|---|---|---|
| AL1 | `#3BC6E8` cyan | 8.2 | 9.7 | **accent, 0.0** | `#FFE815` lemon | 13.2 | 15.6 | day-note yellow 15.9 (amber 20) |
| AL2 | `#E5C24A` yellow | 9.5 | 11.3 | **amber 9.6** | `#8FA6FF` periwinkle | 7.1 | 8.4 | grey text 15.4 |
| AL3 | `#3DE86B` green | 10.2 | 12.0 | **green 8.9** | `#4FEBC8` mint | 11.0 | 13.0 | green 14.4 |
| AL4 | `#FFFFFF` white | 16.5 | 19.5 | **white text 2.9** | `#FF9548` orange | 7.6 | 8.9 | amber 14.0 |
| AL5 | `#B388FF` purple | 6.2 | 7.3 | SANS purple 13.8 | `#EDC4FF` lilac | 10.9 | 12.9 | grey text 18.1 |
| AL6 | `#FF7FC4` pink | 7.1 | 8.4 | red 21.3 | `#9FB07A` sage | 7.0 | 8.3 | green 14.7 |
| AL7+ | `#E5872B` dark orange | 6.2 | 7.3 | amber 12.1 | `#6FB0B2` teal | 6.7 | 7.9 | cyan 11.8 |

Every proposed colour clears 4.5:1 on every measured background (lowest 6.7); none is nearer than 11.8 to a spent colour.

### Pairwise difference: normal sight / worst of normal, deuteranopia, protanopia (Machado 2009, full strength)

Today:

| | AL1 | AL2 | AL3 | AL4 | AL5 | AL6 | AL7+ |
|---|---|---|---|---|---|---|---|
| AL1 | - | 47/47 | 42/42 | 28/21 | 33/9 | 59/10 | 49/49 |
| AL2 | | - | 31/**5** | 29/28 | 64/58 | 58/35 | 22/9 |
| AL3 | | | - | 31/25 | 56/53 | 84/31 | 53/10 |
| AL4 | | | | - | 36/34 | 33/19 | 36/34 |
| AL5 | | | | | - | 20/14 | 51/51 |
| AL6 | | | | | | - | 43/34 |

Proposed:

| | AL1 | AL2 | AL3 | AL4 | AL5 | AL6 | AL7+ |
|---|---|---|---|---|---|---|---|
| AL1 | - | 64/62 | 36/29 | 33/13 | 60/48 | 25/23 | 41/41 |
| AL2 | | - | 40/27 | 47/47 | 21/14 | 47/43 | 25/17 |
| AL3 | | | - | 52/25 | 42/16 | 23/18 | 19/15 |
| AL4 | | | | - | 41/41 | 34/**10** | 42/36 |
| AL5 | | | | | - | 49/35 | 33/15 |
| AL6 | | | | | | - | 22/22 |

Minimum pairwise difference:

| Among | Today, normal | Today, red-green | Proposed, normal | Proposed, red-green |
|---|---|---|---|---|
| first 2 | 46.6 | 49.8 | 63.8 | 62.3 |
| first 3 | 31.3 | **5.1** (AL2/AL3) | 36.2 | 26.8 |
| first 4 | 27.5 | 5.1 | 32.8 | 12.9 (AL1/AL4) |
| all 7 | 20.4 (AL5/AL6) | 5.1 | 19.0 (AL3/AL7+) | 9.8 (AL4/AL6) |

Honest reading: for ordinary sight the proposed seven are NOT more distinct than today's (19.0 against 20.4 across all
seven; better for the first four). The gain is (1) none collides with a colour that already means something, (2) AL4
is no longer the colour of unchanged words, (3) the order puts the three colour-blind-safe colours first. A search over
bright colours (`search.mjs`) could not do better than about 23 for three, 15 for four and 8 for seven under red-green
simulation: bright colours collapse onto one yellow-to-blue line. Seven colour-blind-safe text colours do not exist.

### A callsign in the AL colour, on a puck (contrast)

| | pilot olive | WSO green | ground-crew white |
|---|---|---|---|
| lemon | 4.5 | 4.9 | 1.2 |
| periwinkle | 2.4 | 2.7 | 2.3 |
| mint | 3.7 | 4.1 | 1.5 |
| orange | 2.6 | 2.8 | 2.2 |
| today's callsign | 5.3 | 5.7 | 16.4 |

## Recommendation

1. **Text marks: colour + a thin line under the words + one "Changed in" line per day** (look C). The words take the
   AL colour; the line is solid once out, dotted while waiting; the small "ALn" words go; a Scheduler Board box is
   underlined at its foot, never boxed. Each amended day gets one key line under its signed line ("Changed in AL1 AL2
   AL3 AL4 waiting"), each entry drawn as its marks are. Colour alone (look B) loses waiting-against-out, the
   colour-blind reader, a black-and-white print, and — with today's colours — AL4 entirely.
2. **Pucks: never recoloured.** A small corner tab, today's chip with its words out and about a third the size: filled
   once out, a plain hollow ring while waiting (dots are noise at 12×7px). Keeps D92/D93 (a tag alone, never a ring).
   A coloured callsign fails contrast on every puck but lemon-on-olive.
3. **Colours:** lemon, periwinkle, mint, orange, lilac, sage, teal, in that order; AL8+ keep sharing AL7's.
4. **The chip cannot go completely:** its words can; the mark (tab, line) and the day's own ALn tag stay; hover and
   screen-reader words stay (and need adding to the week's changed words); print keeps today's small "ALn" words.

Critique findings worth his eye, all on the page: today's AL1 box on the board is the focus cyan exactly; AL2 sits
9.6 from advisory amber and AL3 8.9 from the "fine" green; AL4 is 2.9 from ordinary text; AL6 is pink.

## Rulings this would change (for the host to record on his answer — none recorded by me)

- D92/D93 "times, areas and remarks keep their marks": they keep a mark but lose the ALn words and, on the board, the
  outline. The puck's tag loses its words and its dotted edge; "tag alone, solid out, hollow waiting, never a ring" holds.
- `[AMEND-SMALL-SEEN]` 4 (the tag on its own line under a time) becomes unnecessary.
- D362 (AL8+ share AL7's colour, "the tag's number telling them apart"): with no number on each mark, only the key and
  the hover words tell AL7 from AL8. Put to him on the page.
- D1784 (waiting Unavailable row: dotted name / dotted box) keeps dotted, gains the colour; the board's name box would
  be underlined, not outlined.
- D2333/D2429/D2430 (ALL AVAIL crowd marks, not built) would use the same tab.
- The AL colours themselves (the publish module's fixed list and the stylesheet's matching rules), the Legend if it
  names them, `ui-contracts.md` §Amendment marks on screen, `design-practices.md` §4's table row.
- Lesson 52 ("no pink") was said of the Leave War's kinds; reading it onto AL6 is mine, said so on the page.
- New things he would see, drawn here first (D1625): the "Changed in" key line, the tab, the foot-line on a board box.

## Could not check

- **How many ALs a real day gets:** the demo week has no amendments at all until staged; "a day rarely passes AL3" is my
  assumption, stated on the page.
- **Colour vision in his squadron:** aircrew are screened; whether ground crew and SANS are, I do not know.
- **A real iPhone:** phone pictures and the phone test are WebKit at 402×874 on the PC, not iOS with Apple's font.
  The colour-blind switch uses an SVG colour filter; it worked in WebKit here, untested on iOS Safari itself.
- **Print:** nothing was printed; the print recommendation is reasoning, not a test.
- **Screen reader:** not run. Board boxes and seats carry "Changed at ALn" hover words in the captured markup; I did not
  confirm the week's text marks do.
- **The Legend / other places that list AL colours** (ALPanel's tags, History, the plans menu's version list, exports):
  not roll-called; the looks leave the amendments panel's own tags untouched.
- **The phone pictures of Edit Schedule and the board in look C** do not include the key line (it sits above the
  Common Programme, out of the crop); View Schedule's phone picture and the try-out show it.
- **Artifact rules:** the page is one HTML file (821 KB) with relative `img/` pictures, no outside scripts or fonts;
  always dark (it is a picture of a dark app). I did not publish it or load the artifact skills; the host publishes.
- `docs/file-map.md` has no row for the new mock folder; left for the host (I was told not to commit).

## Round 2 (26 Nov 26): clearance, the sims, the missing-time rule, look-alikes

Three follow-ups from him, answered on the same page (new sections `#clear`, `#sims`, `#missing`, `#alike`; three new
lines at the top of "What to look at now", marked new).

### A mistake of mine in round 1, and the palette change

Round 1 checked the proposed colours against the warning, button and puck colours only, not the sections' own stripe
and heading colours. Three of its first four sat on one: periwinkle 7 from the Common Programme, mint 7 from Available
crew, orange 4 from Personal Inputs (teal 12 from the flying waves' cyan). He caught it ("green on duties, orange on
red, blue on blue"). The schedule colours are now one list, `sched.mjs` (19 colours read off the running app by
`sections.mjs`), and every amendment colour is measured against all of them (CIEDE2000; under 12 is flagged).

New sequence: AL1 lemon `#F8F337`, AL2 pink `#FF95D9`, AL3 ice `#9DF7F0`, AL4 clay `#D9A88C`, AL5 sky `#A9C8FF`,
AL6 sage `#9FB07A`, AL7+ lilac `#D9B3FF`. None is under 12 from any schedule colour (nearest: clay 12.5 from Personal
Inputs, sky 12.5 from grey words, sage 14.7 from Duties, lilac 15.2 from grey words, ice 16.6 from Available crew, lemon
16.8 from the in-time lines, pink 23.8). Contrast on the week panel 14.0, 8.3, 13.3, 7.8, 9.7, 7.0, 9.3.

The cost, stated on the page: only lemon and pink are strong colours with nothing near them; from AL3 on the set is
pale tints, so among themselves the seven are less distinct than today (hardest pair 13.8 against 20.4) and worse for a
red-green reader than round 1 (first three 9.3 against 26.8; sky and lilac identical to them). Colour is therefore a
help only; the line under the words and the day's "Changed in" line carry the meaning.

**His call, flagged on the page:** pink for AL2. He said "can we don't use pink" about the Leave War's kinds; I do not
know if that is app-wide. Alternatives offered in the try-out's swatch list: azure `#19AFFE` (13 from the waves' cyan)
or rose `#E6A3A7` (18 from the warning red).

### Clearance: what was chosen

The line is the text's own underline at offset 0, 1px thick, skip-ink off (solid once out, dotted while waiting); it
ends 1px under the baseline, inside the line box. Round 1's ended 4 to 4.5px under and left the line box. Offsets of
2px and 1px were tried and still came under 2px of the stores chips or a row edge. No padding is added anywhere, so no
row, marked or not, moves. A stores change colours the chips (edge dotted while waiting) instead of underlining the
remark cell. A board box draws its line inside the box, 4px up from its foot.

Measured on the real app by `src/measure.js` (shoot.mjs, `capture/clearance.json`): Edit Schedule, View-only Sched and
the board, 402 and 1536, AL4 waiting and all out, plus missing-time scenes 3 and 4. Smallest gap under a line, px:

| Where the line is | Today | Recommendation | Tightest spot |
|---|---|---|---|
| duty block label | 0.0 | 2.0 | Edit Schedule, desktop |
| a name on View-only Sched | 0.0 | 2.0 | desktop |
| flight remark over its stores chips | 0.3 | 2.3 | Edit Schedule, phone |
| in-time line | no line | 3.0 | Edit Schedule, desktop |
| flying line: callsign, mission, times | 1.3 | 3.3 | Edit Schedule, phone |
| any box on the board (to the box foot) | outline | 4.0 | both sizes |
| Common Programme time / name | 4.0 / 4.5 | 6.0 / 7.0 | View-only Sched |
| sim OFT row: time / name / remark | 6.0 / 4.0 cut / 4.5 cut | 6.0 / 6.0 / 6.6 | View-only Sched |
| sim AMT block: time / remark | 4.0 / cut | 7.0 / 47.4 | |
| area, area time | no line | 6.1 | Edit Schedule, phone |
| duty desk: time / name | 4.0 / 6.0 | 6.0 / 14.4 | |
| Ground Programme: time / remark | 4.0 / 4.5 cut | 7.5 / 13.4 | |
| wave label | 8.0 | 10.0 | |

Nothing is cut off in the recommendation (today's small ALn words are cut off in five places). `test.mjs`
repeats the measure on the built page at both widths, both states, all three screens (264 lines each; tightest 2.3 at
402, 3.0 at 1536) and fails under 2px or on a cut.

### Staging added (`stage.mjs`)

Flight remarks over chips, a store pressed, areas and an area time, a wave label, an in-time line, R / B / TO / LD on
one formation, both duty blocks (times, a role, a block label, two holders), AMT BRIEF / BOX / DEBRIEF, three OFT rows
and the outside squadron's slot, a programme name that wraps, Ground Programme rows; saved states for the missing-time
scenes (`alc-draft`, `alc-m3`, `alc-m4`). The try-out's captured day was re-captured from this staging.

### The missing-time rule beside the marks

Five scenes pictured at both sizes (draft grey; refused red; published day with AL4 waiting and two ENDs emptied, one
on the desk whose holder changed in AL2; one typed again; AL4 published), Edit Schedule and the board, View-only Sched
for scenes 1 and 5 (no outline). The outline stays red on the box edge; the waiting line sits inside it. AL4 clay
against the outline red `#F0555F`: 24 ordinary, 10 red-green (round 1's orange 26 / 13): two colours for ordinary
sight, not safe by colour alone for a red-green reader, so shape carries it. Put to him as one decision (keep red and
outermost; alternatives: move AL4, or hide the line while empty). On the board this differs from the end-time
try-out: the waiting mark is no longer a dotted edge round the box.

### Found in the app, not fixed (for the host to file)

- The free-text sim crew (the outside squadron's slot) shows no amendment mark when changed, in any look, today's
  included; the change is still counted and listed.
- A changed traffic line shows no mark either.

### Could not check

AL5 to AL7 on the real screen (the staged day stops at AL4); a real iPhone; print. The clearance figures are
Chromium at 1536 and WebKit at 402 on the PC. `docs/file-map.md` still has no row for the folder. Nothing committed.

## Round 3 (26 Nov 26): underline only the latest, and the puck's mark

**His idea, and his answer.** "The latest AL will have the underline ... the old AL 1-3 will just have colours." Three
choices were built into the try-out's new "Underline" setting: every AL; latest only (waiting counts); latest out +
waiting. I recommended the third; **he picked it ("choice 3 is better i guess")**. It is now the try-out's default, the
recommended look's behaviour and how every picture of the recommendation is drawn (all re-shot). The page marks the line
in "What to look at now" as answered and does not ask it again. "Newest" is per day.

How it is built: `ALX.underline(day, mode)` in `src/looks.js` gives the class `alx-nl` to each mark of an older
amendment on its day (and `alx-old` to an older puck's seat); `src/looks.css` leaves such a mark its colour alone.
Classes only; no style from script.

**Measured, colour alone against unchanged words** (ordinary / red-green / lightness difference in black and white):

| | from white words | from grey times | from faint grey |
|---|---|---|---|
| AL1 lemon | 32 / 31 / 2 | 40 / 40 / 16 | 46 / 45 / 32 |
| AL2 pink | 26 / 15 / 21 | 24 / 4 / 3 | 27 / 12 / 13 |
| AL3 ice | 21 / 1 / 4 | 22 / 9 / 14 | 29 / 21 / 30 |
| AL4 clay | 25 / 23 / 23 | 24 / 23 / 5 | 26 / 26 / 11 |
| AL5 sky | 19 / 20 / 16 | 13 / 13 / 3 | 18 / 18 / 19 |
| AL6 sage | 27 / 26 / 27 | 26 / 24 / 8 | 27 / 26 / 8 |
| AL7+ lilac | 22 / 20 / 17 | 15 / 13 / 1 | 20 / 18 / 17 |

Ordinary sight: every older tint is still told from unchanged words (weakest: a sky time 13, a lilac time 15).
**A real problem, put to him plainly as a point with a fix, his pick not changed:** a red-green reader cannot tell an
ice name from a white name (1) or a pink time from a grey time (4), so for him older changes vanish from the row.
Fix offered: a personal "Underline every amendment" switch. Black and white loses nearly all of it; print keeps the
small ALn words (already said under question 4).

**The puck's mark (his next question: "what about the number chips if i choose that?").** Three choices in the try-out's
puck setting, pictured on the sims (AL1, AL3 and waiting AL4 pucks) on Edit Schedule and View-only Sched, both sizes:
A a number on every AL; B a number on the newest out and on waiting ones, a plain tab on older; C nothing on older
(a puck changed in AL1 then looks unchanged). Recommended: B, now the recommended look's puck mark; it replaces my
round-1 suggestion of a plain tab on every changed puck. Open for him.

`test.mjs` now also checks, at both widths: which amendments draw a line for each Underline choice on each screen and
state, and what an older, the newest and a waiting puck wear for each puck choice.

## Round 4 (26 Nov 26): his picks, and the busy day

**His picks (recorded by the host as his ruling):** the recommended look (colour and a line, no ALn words, the
"Changed in" line); underline the newest amendment out plus anything waiting; a number on the newest pucks and a tab on
older ones; and his own seven colours: AL1 lemon `#F8F337`, AL2 orange `#FF9548`, AL3 mint `#4FEBC8`, AL4 lilac
`#D9B3FF`, AL5 green `#3DE86B`, AL6 azure `#19AFFE`, AL7+ pink `#FF7FC4`. All seven are in the try-out's candidate
list. Two could be a neighbour of what the host read from his picture: the pink (today's `#FF7FC4` or the proposed
`#FF95D9`) and the orange (`#FF9548` or today's `#E5872B`); the page says so. The try-out opens on his picks ("Your
pick" preset, `ALX.HIS` in `src/looks.js`); Today's and Proposed remain as choices. "What to look at now" marks the
look, underline, puck mark and colours as done, keeps the missing-time outline and the colour-blind switch open, and
adds "The busy day: does it still read clearly?".

**The busy day (`stage2.mjs`, states `cx-waiting` / `cx-out`).** Monday published and amended seven times through the
app's own writes and publish button: AL1 to AL6 out (10 to 16 items each), AL7 waiting (20 items). Changes in the
Common Programme, both flying waves (remarks, stores, areas, an area time, an in-time line, wave labels), both duty
blocks, AMT and OFT rows, the Ground Programme, a request filed under Unavailable (AL2) and two under Personal Inputs
(AL5, AL7), and 14 pucks. One programme row changed twice (times AL2, name AL5). Two times emptied as waiting changes:
the SXO's END (holder changed in AL2) and the night RU's take-off. Tuesday is a draft with five empty times on rows
holding people (a flight's take-off, a desk START, a desk END, a sim start, a ground row with ALL AVAIL and no end).
Checked in the captured markup afterwards: the filed requests show marks on the Ground Programme only; the Personal Inputs and Unavailable sections carry no amendment mark on this day, so those two sections are NOT covered (the page says so). Not staged: a changed traffic line (the app draws no mark for one). The try-out's captured day is now this Monday
(`ALC_STATE=cx node capture.mjs`); the earlier sections' pictures remain the simpler four-amendment Monday in my
proposed colours, and the page says so.

**Pictures (`shoot2.mjs`):** each screen whole, cut into slices at section tops: Edit Schedule, View-only Sched and the
board for Monday; Edit Schedule and the board for Tuesday; 402 and 1536 (38 pictures, `img/cx-*`, `img/cxd-*`).

**His colours, measured (CIEDE2000; under 12 from a schedule colour is flagged):**

| | on the week | nearest schedule colour | nearest other AL | from the outline red (ordinary / red-green) |
|---|---|---|---|---|
| AL1 lemon | 14.0 | 17 in-time lines | 26 from AL5 | 62 / 26 |
| AL2 orange | 7.6 | **4 Personal Inputs** | 37 from AL1 | 26 / 13 |
| AL3 mint | 11.0 | **7 Available crew** (14 from Duties) | 17 from AL5 | 71 / 24 |
| AL4 lilac | 9.3 | 15 grey words | 18 from AL7 | 34 / 39 |
| AL5 green | 10.2 | **9 Duties** | 17 from AL3 | 80 / 14 |
| AL6 azure | 6.8 | 13 flying waves' cyan | 34 from AL4 | 53 / 39 |
| AL7+ pink | 7.1 | 21 warning red | 18 from AL4 | 21 / 29 |

Put to him as points with fixes, his picks drawn unchanged: AL2 orange is Personal Inputs' own colour (fix: clay, 12.5
away, and 30+ from each of his others); AL5 green sits by Duties' green (fix: sage, 14.7, or move green to AL7); AL3
mint is near Available crew but that section holds pucks, not words (no fix needed); AL6 azure is blue on the waves'
cyan once it is no longer the newest (leave; a day rarely reaches AL6 - my assumption). AL7 pink inside the red outline
is two colours for ordinary sight and two shapes for everyone. For red-green readers the whole set collapses (hardest
pair 6), as every set of seven does; the open colour-blind switch covers it.

**Does it read as too busy?** My reading from the pictures: no, because only AL6 (solid) and AL7 (dotted) carry lines
among about ninety marks; the Common Programme and the flying waves are the busiest. Which older amendment a colour
means is carried by the "Changed in" line. Clearance on this day: 132 lines measured on the real app, tightest 2.3px.

**One fix made to the look:** on a flying line take-off sits directly over landing, so the missing-time outline of an
emptied take-off steps out 1px there instead of 4, and no longer lies on the landing time.

`test.mjs` (both widths) now also checks that the try-out opens on his picks and that AL2 is his orange; its underline
and puck expectations are for seven amendments (454 lines in the clearance check, tightest 2.3 / 3.0).
