# Questions I, J and K on the round-2 page — a fresh Fable helper's report (25 Nov 26)

His three questions of the afternoon on the end-time guard rail (D2612, D2613): "What if no start time is indicated.
Will it flag the same", "Will it be irritating to the user planning the schedule that it keeps seeing red?" and "Also
will view schedule see the red too?". Nothing committed or pushed; the host does that.

## What was added to `../../mock/2026-11-25-rulings-round2/index.html`

- **Question I** (`#qi`, after H): his words, when it happens, the Thursday example, what the app does today, three
  choices each with its cost (yes for any row with a person or a name; only flights and sims; no, as drawn in C), the
  recommendation (yes), three numbered points (I1 all-day input row: left out · I2 standby line: same rule, outline
  only, no warning line · I3 a blank block or line: plain until a person or a name is on it), and "If I is yes, the
  notes in C change", with the two final notes and their pictures.
- **Question J** (`#qj`): red as ruled (softened by E12), quiet grey while drafting and red when refused, or red only
  near flying. Looks 1 and 2 drawn side by side on the same Thursday, phone and desktop, plus look 2's count line.
  **Recommended: 2**, said plainly to change his 25 Nov ruling (D2613) on when the red shows. Reason, after drawing:
  three red boxes are not loud, but a real week holds many more for days, beside the red that means a conflict; grey
  reads "still to type", and red arrives when the press is refused. It needs G's line to be a yes.
- **Question K** (`#qk`): View-only Sched never shows the outline (recommended). One phone picture of the draft
  Thursday there, as the app draws it today, with a caption saying what is not there. It notes that K settles E4.
- "What to look at now": I, J, K first, each tagged Added. The answer line gained "I yes, all as recommended", "I2",
  "J 2", "K as recommended". One sentence added to the lede. No other item, letter or highlight was changed. No ruling
  number or review code is on the page (checked by a search).
- Per D2616, no cost is counted in demo-week rows.

## The two notes, reviewed (D2441) by `design-practices.md` §1, §1a, §1b and `design.md` §Saving

| | Draft | Final | Why |
|---|---|---|---|
| Sign-off refused | Blocked: 3 items are missing a time, each outlined in red. Type the times, then sign. | **Blocked: 3 items are missing a time, each outlined in red. Type the missing times, then sign.** — longer, 16 → 17 words; cold read owed | "The times" points at nothing in particular and can be read as every time on the day (§1a test 5, a named thing not traded for a vaguer word). "Missing" is added from the first sentence, so no new fact. The rest stands: "Blocked:" opens it, the reason, then the instruction as its own sentence (§1b test 2b), the family's shape. |
| Publish refused | Blocked: 3 items are missing a time, each outlined in red. Thursday was not published. | **Kept.** | Same shape as C's reviewed note; the day named once; says how many, as his ruling words it. |

Forms the drafts did not give (form only): one item, "Blocked: 1 item is missing a time, outlined in red. Type the
missing time, then sign." / "…Thursday was not published."; an amendment, "…AL1 was not published." "A time" is kept
though a desk may lack two: the count is of items, and each empty box is outlined.

Knock-ons named on the page: G's line would read "3 items missing a time · 4 to sign" ("3 times missing" reads as
"three times"), and E11's Legend line "time missing — needed to sign and publish". **Those two wordings are mine, so
by D2441 they are owed a different fresh Fable's look**, as is the count line drawn in J.

The pictures `ns-sign-refused-*` show the draft ("Type the times"); the page says so under the picture and gives the
words to build. Both pictures carry the drawing's pink "DRAFT: words owed a Fable review" tag; the caption names it.

## Pictures

Copied, stacked or cropped (never redrawn) by `../../mock/2026-11-25-guardrail-wording/compose-ijk.py` into the page's
`img/` as `ns-*.png` (16 files):
- I: `ns-flight-today-phone`, `ns-flight-proposed-phone`, `ns-desk-proposed-phone`, `ns-sim-proposed-phone`,
  `ns-three-proposed-desktop` (the three desktop crops stacked), `ns-attach-if-flagged-phone` (cropped to the last two
  rows), `ns-sign-refused-phone`, `ns-sign-refused-desktop`, `ns-publish-refused-phone` (head and foot, middle cut).
- J: `ns-j1-red-phone/-desktop`, `ns-j2-quiet-phone/-desktop`, `ns-j2-count-line-phone/-desktop`.
- K: `ns-k-view-only-phone` (the day's heading, VL, the SXO desk).

J and K were drawn on the running app by a new script, `../../mock/2026-11-25-guardrail-wording/draw-jk.mjs` (kit.mjs;
the same staging as draw-no-start.mjs; sources in `img/jk/`, facts in `img/jk/facts-jk.json`). Look 2 is one class:
the same 1px edge in the app's muted grey (`--ink-3`). The existing build was served on port 4796 with no build, and
the server was stopped by its port. The checks lock was held by another chat's unit suite; nothing here builds.

## Things the host should know

- **Names follow the pictures, not the brief.** The brief said "Shaft on the SXO desk"; the screen shows him as Anvil,
  so the page says Anvil. VL's crew are Blade, Basher, Saint and Scope; the sim's are Talisman and Fable.
- **I3 is my reading of the brief's (c).** I recommend a blank block or line stays plain until a person is put on it or
  a name is typed, and that a desk's built-in role (SDO, SXO, OPS O) does not count as a name. If the host meant the
  block to be outlined the moment it is placed, I3's recommendation needs changing.
- The page says the earlier "a row with no times at all is not touched" was told to him and never asked (per D2612's row).

## Not checked

- No cold read (§1a test 9) of the changed sign-off note, nor of the two knock-on wordings: owed before the build.
- Whether a squadron's own duty template keeps typed times was not tried in the app, so the page claims nothing about
  templates saving the typing. Whether a standby template keeps times: not checked either.
- "Yes" on I for a row with only a callsign or a remark and no person: the page says "a person or a name"; a row with
  only a remark was not drawn or put to him.
- The page was not opened in a browser after the edit; image paths, sizes and the article tags were checked by script.
- K: the "Working draft" picker on a published day was taken from the host's reading of the code, not drawn.
- `npm run docsize` fails on `HANDOFF.md` and `OUTSTANDING.md` being over their ceilings; neither was touched here.
