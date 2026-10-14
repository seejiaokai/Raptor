# `[GUIDE-NO-GLOW]` version 3 — one fresh, blind read (Opus 5.5, 15 Oct 26)

**Read:** `../../specs/2026-10-15-guide-no-glow-draft.md` — "Version 3 — set to his answers" whole and "Places that still
glow today"; `raptor-port/docs/design-practices.md` §0, §4 whole, §5; the full rows of D880, D164, D860, D861, D876, D877,
D879, D881, D882, D883, D270, D651 (shell grep of `.claude/decisions-full/`); every `box-shadow`, `drop-shadow`,
`text-shadow`, `filter:` and `radial-gradient` in the 36 stylesheets under `raptor-port/src` (a script that parses each
declaration, comments stripped), plus inline styles in `.ts`/`.tsx`/`.js`; "glow" / "halo" in `raptor-port/docs/` (live
docs, not archive / handpass / specs / mock), in `.claude/rules/decisions/` and in stylesheet comments.
**Not read:** the reader's report of version 1 (`guide-no-glow-opus.md`). **Changed:** this file only. Nothing committed.

**Summary:** 3 MUST, 4 SHOULD, 3 LOW. The rule's text is sound for the places it names; the problems are (1) two glows
the list missed, so "nothing in this app glows" is not yet true; (2) a general rule about every "on" button read out of
D882, which named two controls, and which the app's other "on" looks contradict; (3) the D201 list misses documents that
still describe the glows as kept.

---

## MUST

### M1. "Nothing in this app glows" is false after the nine places: two more glows exist that are not among them
**Problem.** The stylesheets still carry coloured soft light the nine places (D877, D879, D881, D882) do not cover:

| File | Selector | The shadow | What it is | Mark or not |
|---|---|---|---|---|
| `src/ui/scheduler/00-foundation-login.css:125–126` | `.lb-glyph` | `filter: drop-shadow(0 0 16px rgba(59,198,232,.55))` | the RAPTOR claw logo on the sign-in page and the access screens (`Login.tsx`, `AccessScreen.tsx`) — a cyan glow 16px wide | not a mark — decoration; but the rule's headline says *nothing* |
| `src/leavewar/ui/matrix.css:2490` | `.mv-banner, .balbar` | `0 0 0 4px rgba(59,198,232,.16)` (+ a dark drop shadow, which is depth) | the Leave War's docked move banner and balance bar: a pale cyan band round the panel | a mark ("this panel just popped up"); `ui-contracts.md` §Bulk balance entry calls it "the glow" ("which is what the ring and the glow answer"), and the stylesheet comment at `matrix.css:2468` says "a solid accent ring and a glow" — he asked for it on 6 Sep 26 ("visually blended in with the background") |

The second is the same recipe as the Rearrange button's "pale blue halo" (`0 0 0 3px rgba(59,198,232,.18)`) that D882
took off — so by the draft's own vocabulary it is a halo. (Two smaller ones of the same unblurred kind:
`02-shell.css:93` `.fastsync.on .dot` — `0 0 0 3px rgba(87,201,122,.2)` round the Fast sync dot while on; and
`postout.css:51–52` `#page-admin .od-c i.g / i.r` — 3px pale green / red rings round Admin → Users' status dots. See S1.)
Also borderline: a faint cyan wash of light across the top of every page and of the sign-in page (`body` and `.login`
backgrounds, `radial-gradient(… rgba(59,198,232,.09 / .13) …)`, `00-foundation-login.css:66–68, 112`).
**Cause.** The search for places looked for blurred ring-like shadows on marks; a `filter: drop-shadow` on a logo and a
wide pale spread with no blur were not counted. D882's row ("with D881 every place found still glowing goes, so the
guide's rule can say plainly that nothing in the app glows") rests on that list being complete; it is not.
**Fix.** Before round 3, put the two to him as places 10 and 11 with pictures (D853): the sign-in logo's cyan light and
the docked banner / balance bar's pale cyan band — each "today / no glow / where", recommended as the agent sees fit (the
banner's band answered his own 6 Sep 26 ask, so say so). Keep "Nothing in this app glows" only once he has ruled both off.
If he keeps either, the headline becomes **"No mark in this app glows"** and the point names the kept one(s) as his
exception, e.g. add after "is depth, not a glow, and stays.": *"The sign-in page's logo keeps its light (D8xx) — it is the
app's mark, not a mark about a thing."* And say in the point whether a background wash counts (see S1).

### M2. A rule for EVERY button or switch that is on is read out of D882, which named two — and it is not marked as a reading, and the app contradicts it
**Problem.** Version 3 says: *"A button or switch that is on shows it by the filter chip's 'on' look — a pale cyan fill,
cyan words and a cyan edge — never by a glow or a halo; a solid cyan fill stays the main button's (D882)."* and the new
colour-table row gives that look the meaning "a button or switch that is on". D882 rules it for **the Rearrange button and
the Show SANS switch** only (both `.rtbtn.on`). D882 says nothing about a solid cyan fill. The closing parenthesis marks
"a stripe, a box, a line and a button come under the rule" and "a shadow in the mark's own colour" as readings, but not
"every on-state takes the chip's fill" nor "a solid cyan fill stays the main button's", and it lists "'on' as the chip's
fill, D882" among his words. And the app's other "on" looks differ today, so the sentence as written makes them all wrong:
- Fast sync switch on (`02-shell.css:91`): a pale GREEN fill, green words and edge, plus a halo on its dot;
- the picked week button (`.wk.on`, `02-shell.css:206`): green — already in §4's table as its own meaning;
- OIL Earn's button on (`18-oil-board.css` `.mbtn.oilbtn.on`): a SOLID green fill; `.mbtn.oilblank.on` solid amber;
- the bell while lit (`.bellbtn.on`, `02-shell.css:119`): a cyan edge and icon, no fill;
- the nav's page link (`.nav a.on`): a pale cyan fill at .12 — close, not the same;
- the Leave War's event chips on (`eventsheet.css:87` `.evchip.on`): a pale white ring.
§4 itself says "nothing is recoloured as a side effect" — this sentence would order recolouring by side effect.
**Cause.** D882's specific answer (two controls) generalised in the wording to a rule for all controls.
**Fix.** Replace the sentence with: *"The Rearrange button and the Show SANS switch show that they are on by the filter
chip's 'on' look — a pale cyan fill, cyan words and a cyan edge — never by a glow or a halo (D882)."* Drop "a solid cyan
fill stays the main button's (D882)" (the table's Cyan row already says a main button). If the agent wants the wider rule
(any NEW on/off control uses the chip's look), write it as *"A new on/off control takes the same look, unless he rules
otherwise; the app's other 'on' looks (Fast sync, the week buttons, OIL Earn, the bell) stay as they are"* and add to the
closing parenthesis: *"that a new on/off control takes the chip's look … began as the agent's reading"*. The table row's
meaning becomes: *"Rearrange and Show SANS while on (D882); a picked filter chip"* — see S3.

### M3. The D201 list ("In the same change") misses documents that still state the glows as kept — two of them say the opposite of the new rule
**Problem.** The list names only `ui-contracts.md` §"No flag ring glows" and the just-added box passage, plus stylesheet
comments. Still stating the old looks after the build:
- `.claude/rules/decisions/leave-war.md:196–201` (a settled point a Leave War chat loads by itself): *"The open-bidding
  dates wear a glowing dark-green border … + low-opacity halo … don't brighten or swap to `--ok` without asking"* — a
  future chat will read this as the standing look and could restore the halo (D881 took it off).
- `ui-contracts.md` the `[GLOW-OFF]` paragraph (≈ line 3565): *"**Still glowing, not ruled:** the SANS puck's purple
  stripe"* — false once D882 is built.
- `ui-contracts.md` §Selection also rings where the man could GO (≈ 3449): *"solid bright green with a glow (`.oktake`)"*
  — place 1.
- `ui-contracts.md` §The open-bidding box (≈ 8431–8450): *"refined to a glowing, deeper, more faded green border"*,
  *"continuous glow"* — place 2.
- `ui-contracts.md` the Leave War's lit row (≈ 7399–7402): *"the full-width seat bar in the name cell gains a glow past
  its ring"* — place 3.
- `ui-contracts.md` the landing bars (≈ 7531–7533): *"Leave War's still runs the WHOLE row at 3px with a glow on the
  sticky cell"* — place 8.
- `ui-contracts.md` the Rearrange toggle (≈ 7657–7658 and 7686): *"it GLOWS accent (`.rtbtn.on`: … plus a soft ring and
  halo)"*, *"The ON state also carries a glow of its own now"* — place 6.
- `file-map.md:616`: *"a glowing deep-faded-green border around the `bidFrom..bidTo` columns"* — place 2.
**Cause.** The list was written from the two passages the version-1 read pointed at, not from a search for the subject
(D201 step 1: search for the thing, not the D-number).
**Fix.** Replace the list's first clause with: *"`.claude/rules/decisions/leave-war.md`'s settled point on the
open-bidding border (its "glowing" and "low-opacity halo" corrected to the plain green outline, D881); in
`raptor-port/docs/ui-contracts.md` §"No flag ring glows" (its closing "two glows are NOT flags and stay") and the
just-added box passage ("inset + soft glow") corrected to the plain ring (D877, D860), the `[GLOW-OFF]` paragraph's "Still
glowing, not ruled: the SANS puck's purple stripe" removed (D882), and the passages on `.oktake`, the open-bidding box,
the Leave War's lit row, its landing bars and the Rearrange toggle corrected to their plain line (D881, D882) — the
section names D880–D882; `file-map.md`'s open-bidding box line likewise"*. If M1's band is ruled off, add
`ui-contracts.md` §Bulk balance entry's "the ring and the glow" and the `matrix.css:2468` comment.

## SHOULD

### S1. Whether a pale band with no blur counts as a glow is not said, and the draft already treats it both ways
**Problem.** The point defines a glow as "soft light spreading out from it or into it" and "a shadow in the mark's own
colour". The Rearrange button's 3px pale cyan band (no blur) was ruled off as a "halo" (D882), yet the same kind of band
stays on the move banner / balance bar (`matrix.css:2490`, 4px), the Fast sync dot (`02-shell.css:93`, 3px), and Admin →
Users' dots (`postout.css:51–52`, 3px). A builder or a later look cannot tell from the words whether these break the rule.
The background wash (M1) has the same question.
**Cause.** "Halo" is used in the point ("never by a glow or a halo") but never defined; "shadow" suggests only blurred
shadows.
**Fix.** Add after "A shadow in the mark's own colour is a glow.": *"So is a pale, see-through band of its colour round
it, blurred or not (a halo); a solid ring drawn as a shadow is a line, not a glow."* — and mark it in the closing
parenthesis as the agent's reading (from D882's halo). Then the three bands above are places to put to him (M1), or name
them as kept if he keeps them.

### S2. "a plain line, edge or fill in its colour" can be read as flattening the SANS stripe's gradient, which D882 did not rule
**Problem.** The SANS stripe (`04-pucks-sections.css:11`) is a three-stop purple GRADIENT with a 1px white inner blur
(`inset 0 0 1px #fff`). D882 says each place "keeps its edge, stripe or line as it is" and only the light goes. "Plain"
in version 3 could make the builder flatten the gradient, and the white 1px inner blur is "light into it" — the words do
not say whether it goes. (D651: the stripe is "deliberately the brightest thing on the puck".)
**Cause.** "Plain" carries two meanings: "without a glow" and "one flat colour".
**Fix.** Change "is a plain line, edge or fill in its colour, with no soft light spreading out from it or into it" to
*"is a line, edge or fill drawn as it is — its colours, a stripe's shading included — with no soft light spreading out
from it or into it"*; and in the draft's place 7 say which goes: the two purple outer layers, and whether the 1px white
inner line stays (recommend: it stays — it is the stripe's own highlight, inside its edge, 1px).

### S3. The new colour-table row overlaps the Cyan row and §4's "cyan is 'press me' (and 'picked')"
**Problem.** The Cyan row already gives "the picked date or tab"; `.mjump.on` (the Leave War's picked month) wears exactly
the chip's pale fill and is a picked tab — so it now belongs to two rows with two meanings ("picked" and "on"). The new row
is consistent with "a main button" (solid vs pale), but as a separate row it reads as a new meaning for cyan, against §4's
"do not spend [a colour] on anything else".
**Cause.** The row was added beside the Cyan row instead of as part of it.
**Fix.** Do not add a separate row; extend the Cyan row's meaning to: *"a main button (a solid fill); the picked date or
tab; today's date; the focus outline; the picked-up look of a drag; and, as a pale fill with cyan words and edge, a picked
filter chip and Rearrange / Show SANS while on (D882)"*, with "D882" added to its "Where from".

### S4. Stylesheet comments left by D877 still describe glows that are gone
**Problem.** The D201 list covers comments of the nine places only ("a glow being taken off"); three earlier ones are
already wrong and will contradict "nothing glows": `04-pucks-sections.css:194` *"the purple RING and its glow are drawn
only while…"* (D877 took the glow); `18-oil-board.css:51–53` *"every puck that earns glows. Solid glow = a full day, an
outline only = a half"* (D877: both wear the same ring, the comment at line 58 says so); `02-shell.css:113` the bell
*"glows (.on)"* (it only turns cyan). Also the D270 full row (`.claude/decisions-full/scheduler.md`) still says *"Unflagged,
his puck keeps the purple ring and its purple glow"* with no "changed by D877" mark.
**Cause.** D877's own sweep missed them; this change's "nothing glows" makes them contradictions.
**Fix.** Add to the D201 list: *"and the comments D877 left (`04-pucks-sections.css` "the purple RING and its glow",
`18-oil-board.css` "every puck that earns glows…", `02-shell.css` the bell "glows" → "lights"); D270's full row marked
'— changed by D877' for its purple glow."*

## LOW

### L1. "A new glow, on anything, is his to rule" and the window / menu extension are not marked as readings
D880's reading names only "a dark drop shadow under a dragged thing"; "a window, a menu" and "a new glow … is his to rule"
are the agent's. **Fix:** add to the closing parenthesis: *"…that a dark shadow under a window or a menu is depth too, and
that a new glow is his to rule, began as the agent's reading…"*.

### L2. "His words: 'a ring in this app never glows', D880" — his words were "3 yes"
The phrase is the question he said yes to. **Fix:** *"His ruling: 'a ring in this app never glows' (his yes, D880)"*.

### L3. §0's line cites D880 alone and says "a plain line or fill"
"Nothing" comes from D881–D882, and the point says "line, edge or fill". **Fix:** *"**nothing glows** (D880–D882) — a mark
is a line, edge or fill in its colour; a dark shadow that lifts a thing is depth, not a glow (§4);"*. Also the
closing "he approved them as written here, D8xx" placeholder must carry the round-3 ruling's number.

**Checked, no finding:** §5 (the motion it keeps — the ring's fade, the picked-up look, the landing flash, a new flag's
flash — has no blurred layer left: the keyframes are spread-only); D270 "this is you" (the purple fill and ring stay; only
the glow went, D877) and D651 (the SANS edge stays on the puck, inside it, from the one builder — the stripe's light going
reaches the SANS calendar too, which the build's walk should look at); "One mark, one look" (no clash — its "no glow" is a
case of this rule); inline styles in code (dark depth shadows only); no SVG blur filters.
