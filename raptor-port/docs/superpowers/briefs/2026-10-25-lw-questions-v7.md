# The Leave War questions page, version 7 — what goes on it and how each picture is drawn (25 Oct 26)

Written by the chat that fixed the keyboard's sixth round (`claude/lw-m3-placing-leave`), at a handoff, so the next chat
draws the page without redoing the research. **The agent's reading** throughout — the rulings named are the spec; open
each full row before drawing (`grep -h '^| D1356 |' .claude/decisions-full/*.md`).

## The page

Update the page he answered as version 6: https://claude.ai/artifact/AuALCgzEgpoxooyyGX7EM6 (source
`raptor-port/docs/img/handpass/2026-10-25-lw-drawings/page/index.html`, pictures published under `n25/`). Only what is
still open, newest first (D1363, D1237's top list): O1, N3, B1b, N2, N4 are answered (D1356, D1359–D1362), B1 (the bubble
built) and K1 are overtaken — all leave the page. In D1301's order, a colour before the looks it shapes. Each picture cut to
its question, the change named on the picture (D1222); phone pictures on the page, desk pictures kept beside them.

| Tag | Question | Recommended |
|---|---|---|
| K2 | His iPhone look at the keyboard's sixth round (the window held still as the keys come; `[KBS-PHONE-SLIDE]`) | Look: close the tab, reopen the preview, Inputs → a day → + Input → Remarks; picture `raptor-port/docs/img/handpass/2026-10-25-kbs-slide/look-before-after.png` |
| C1 | An Other's colour on the Leave War — and, by D1357's reading, every commitment a scheduler moves under Unavailable | The Inputs calendar's outlined commitment look (D1321): so an Other looks alike on both pages (D1304); the code (OTH) tells it apart |
| C2 | A tap on a day holding a half-day Other: ruled (D1353, narrowed by D1356) — the window for the free half. What is open is how that window shows the held half | As drawn: the window on the free half, the held morning named with its box in C1's look and its remarks; changed on the Inputs page (D1365) |
| Q1 | His "for the others in input as well perhaps have a tick box to ask if War manning reduced?" | No separate tick: the Inputs window's choice for an Other (D1356) is the one place, with a grey line under it that follows the pick ("Counted as away on the Leave War" / "Still counted in the manning") |
| Q2 | His "is CSE under ground programme still? Should it go to unavailable" | Yes: a course lands under Unavailable by itself, as an overseas duty does, so the schedule and the war agree |

**C1, the colours.** The outlined look is `.ib-bar.duty` in `raptor-port/src/ui/scheduler/25-inputs-calendar.css`:
fill `rgba(232,237,242,.05)`, edge 1.5px `rgba(200,212,228,.78)`, words `#E8EDF2` (13.6 : 1). The alternative is his D1349
grey for UNA, light grey (a): `--h 184,190,198`, fill 1, words `#0b1116` (box `#B8BEC6`, 10.1 : 1). Last night's dark grey
(b) is nearly the outlined look and is not offered apart. Draw on Drifter's row, one week: OD · an Other whole day · a
refused LL · an Other for the morning · an approved LL, each look in turn, measured as `lw-1025-una-grey.mjs` measures (fill,
edge, words, contrast, ΔE against the OD and the refused box). The Other is not on the war yet: place a UNA through the bid
window's own UNA button (`bid-una`, with `portion-am` for the morning), its letters changed to OTH and its look set by a
style on `.c.k-una` — say "Drawn:" on the picture.

**C2.** Base: `lw-1025-una-tap.mjs` 3a (a morning LL filed through `window.fileInput`, the admin's tap opens the window on
PM with the line "The morning is LL, filed on the Inputs page — change that there."); draw the held half as the Other:
OTH in C1's look, its remarks, "change it on the Inputs page".

**Q1, two readings of his tick, both drawn.** (a) A tick beside the choice: it can disagree with where the input sits
(D1357: anything under Unavailable counts him out), so the picture shows the clash; (b) the tick as the choice itself
(ticked = under Unavailable): it says the war's effect but not that the input lands under Unavailable on the schedule,
with its remarks shown to everyone. Draw on the Inputs page's input window for an Other (admin, Drifter, "Under
investigation"): today; drawn A, recommended — a "Goes to" row of two buttons, Ground Programme · Unavailable, cloned from
an OL window's Duration buttons, with its grey line; drawn B — his tick, cloned from the window's "all day" tick.

**Q2.** A course files with `ground: true` (`raptor-port/src/engine/inputs.ts`) and lands on the Ground Programme while the
war counts it away (D998, D1357). Draw on Edit Schedule, a CSE filed for Drifter on Thu 16 Jul through the Inputs page's
own window: today (Ground Programme, real) and under Unavailable — moved with the schedule's own Reject then "→ Unavail"
if they are offered for a course, else drawn and said so.

## How

Helpers to copy, as last night's scripts did: `frame()`, `alignGrid()`, `dateHeadUnderBars()`, `tagRow()`, `centreOn()`,
`openInputsList()`, `answerAsks()` from `raptor-port/scripts/handpass/lw-1025-oth.mjs`; the colour arithmetic from
`lw-1025-una-grey.mjs`; `raptor-port/scripts/handpass/lw-r3-lib.mjs` for signing in, cells and windows. Serve this
branch's build on port 4180 (`npm run build && npx vite preview --port 4180`, from `raptor-port/`). Output folder
`raptor-port/docs/img/handpass/2026-10-25-lw-drawings/q7/`. Read `.claude/skills/brainstorming/mockups-on-the-real-app.md`
and `raptor-port/docs/design-practices.md` first; the design skill (Impeccable) for C1 and Q1 (D819).
