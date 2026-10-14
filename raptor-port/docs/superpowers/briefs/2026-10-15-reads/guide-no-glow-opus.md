# Read of the "a ring never glows" wording, version 1 — one fresh, blind Opus reader (D70, D790, D880)

Read 15 Oct 26: `raptor-port/docs/superpowers/specs/2026-10-15-guide-no-glow-draft.md` whole; `design-practices.md` §0, §1,
§4 (the colour table and "One mark, one look"), §5; the full rows of D852, D876, D877, D879, D880, and D164, D861; the
Leave War's settled list in `.claude/rules/decisions/leave-war.md`; every `box-shadow` / `drop-shadow` in
`raptor-port/src/ui/scheduler/*.css` and `raptor-port/src/leavewar/ui/matrix.css`, and, for completeness, every other
stylesheet under `raptor-port/src` (the Tracker's, the Leave War's other sheets, `postout.css`). A glow is taken as the
brief defines it: a coloured, blurred shadow.

The four places the draft lists are each correct: the green take ring (`03-week.css` `.oktake`, `0 0 8px 1px` green),
the open-bidding box (`matrix.css` `.lw-bidbox`, `0 0 8px 1px` green plus an inner halo), the SANS stripe
(`04-pucks-sections.css` `.puck.san::after`, two purple blurs) and the Calendar button (`02-shell.css` `.title .calview`,
`0 2px 14px` blue). The rings D877 and D879 cover are plain in the stylesheets now (`.puck.me`, `.puck.hl`,
`.puck.oilglow`, the warning rings, `--lift-box`, `.ic-pickp.on`).

## Findings

### 1. MUST — the list of places that still glow misses five, three of them rings
**Problem.** The draft's list is put to him as the places the rule would change, but these still glow and are not on it:
- **The Leave War's "this row is you" ring** — the thin blue ring on the seat bar of his own row also wears a blue glow
  (`matrix.css`, `.mx tbody tr.me .who .whoedit .cs`: `inset 0 0 0 1px` accent `, 0 0 8px` blue). It is a ring that
  says "this is you" — the same meaning as his own puck, whose glow D877 took off — so the rule as worded is untrue of it
  today.
- **The Tracker's two rings** — the gold ring round an event he can fly next (`tracker/tracker.css` `.avail`,
  `drop-shadow(0 0 5px #ffd23f)`) and the turquoise ring round the event a search found (`.found`,
  `drop-shadow(0 0 6px #00e5c8)`). Both are rings saying something about a thing. The code's comment says the glow was
  chosen on purpose, as a second way to tell the found ring from the selection ring — so taking it off needs his word
  and a picture, like the others.
- **Today's day card on the week** — its blue edge carries a blue-tinted shadow (`03-week.css` `.day.today`,
  `0 24px 60px -30px` blue). A blue edge with a glow, saying "today".
- **The Leave War's Rearrange button while it is on** — a pale blue halo and a blue glow round it (`matrix.css`
  `.rtbtn.on`, `0 0 0 3px` pale blue `, 0 0 12px` blue); the comment: "ON now GLOWS, not just tints". A ring round a
  button saying "on".
- **The Leave War's landing line** — while a person's row or a group heading is dragged, the 3px blue line where it will
  land glows on the name column (`matrix.css` `tr.dragover .who`, `tr.dragover.after .who`, `tr.grp.dragover td.grphd`
  and its `.after`: `0 ±1px 10px` blue). The rule names "a thing ... just landed"; this is where it lands. A line, not
  a ring.

**Cause.** The search stopped at the places the Scheduler Board's and Inputs pages' job had drawn; the Leave War's other
marks, the week's card and the Tracker were not searched.

**Fix.** Add to "Places that still glow today", after item 4:
> 5. **The Leave War's "this row is you" ring** (`.mx tbody tr.me .who .whoedit .cs`, `src/leavewar/ui/matrix.css`) — the
>    thin blue ring on the seat bar of his own row glows blue past it (6 Sep 26, "what carries the row at a glance on a
>    phone"). The same meaning as his own puck, whose glow went (D877).
> 6. **The Tracker's two rings** (`.avail`, `.found`, `src/tracker/tracker.css`) — gold round an event he can fly next,
>    turquoise round the event a search found; the glow was chosen to tell the found ring from the selection ring.
> 7. **Today's day card on the week** (`.day.today`, `03-week.css`) — its blue edge casts a soft blue light below it.
> 8. **The Leave War's Rearrange button while on** (`.rtbtn.on`, `matrix.css`) — a pale blue halo and a blue glow round it.
> 9. **The Leave War's landing line while a row or a heading is dragged** (`tr.dragover .who`, `tr.grp.dragover td.grphd`,
>    `matrix.css`) — the blue line glows on the name column; a line, not a ring, so outside the rule as worded; named so
>    he can say.

And in "Still to do" and the backlog item `[GUIDE-NO-GLOW]`: "the four places" → "the nine places". Each needs its own
picture (D853).

### 2. MUST — the rule text does not say the places still glowing stay until he rules, and reads as untrue of the app
**Problem.** "Every ring the app draws … is a plain line" states a fact that is false today (finding 1), and nothing in
the text a reader of the guide will meet says the exceptions are held. D880 says "nothing of them changes before he
says", but that sits only in the draft file, which leaves when the point goes in. A later look reading the guide would
report the green take ring and the open-bidding box as faults to fix — and both are looks he chose: the take ring is
his approved comp (13 Aug 26), and the open-bidding box is a settled Leave War decision ("The open-bidding dates wear a
glowing dark-green border", `leave-war.md`, owner 1 Sep 26 — "don't brighten or swap … without" his word). The guide's
own §0 says a finding against a look he approved from a picture is put to him, never fixed; the new point should say
so where it applies.

**Cause.** The hold was written into the draft's list heading, not into the wording that goes into the guide.

**Fix.** In the rule text, after the drop-shadow sentence, add:
> The places that still glow today (`OUTSTANDING.md` `[GUIDE-NO-GLOW]`), two of them looks he chose — the green "he can
> take this seat" ring and the Leave War's open-bidding box — stay as they are until he rules on each from its picture;
> a look names them and changes none.

### 3. SHOULD — "on the thing's edge" claims a position his rulings set only for the just-added mark
**Problem.** Where a ring sits is ruled only for the just-added mark (D860, D876 — "on the edge of the thing added").
Other rings the clause lists do not sit on the edge: the warning and OIL rings are drawn just outside the puck
(`0 0 0 1.5px`, `0 0 0 2px`), the green take ring 1px off it (`outline-offset:1px`), the armed seat's dashed ring inside
it (`outline-offset:-2px`). So the clause is untrue of rings he has already approved, and claims more than D880.

**Cause.** "One mark, one look"'s wording carried over to every ring.

**Fix.** Replace "is a plain line in its colour, on the thing's edge: no soft light spreading out from it, and none
spreading in." with:
> is a plain line in its colour, with no soft light spreading out from it or into it.

### 4. SHOULD — "Where it goes" names the wrong section, and the line for it is not written
**Problem.** "One line in §1's short list of his rulings that bound design" — that list is §0 ("What wins when two
rules meet", item 1); §1 is "Words on screen". And the line itself is not drafted, so this reader cannot check it and
he cannot approve it.

**Fix.** Replace the "Where it goes" sentence's second half with: "and one line in §0's list of his rulings that bound
almost every design choice, after 'the Raptor look stays':" and give the line:
> - **a ring never glows** (D880) — a plain line in its colour; a dark shadow that lifts a thing is depth, not a glow (§4);

### 5. SHOULD — the agent's readings are not marked, and two earlier rulings are not cited
**Problem.** Every approved point of the guide marks which parts are his words and which began as the agent's reading
("One mark, one look"'s closing parenthesis; §0's D852 paragraph). D880's own row names readings ("the rule covers
rings that say something about a thing, not a dark drop shadow under a dragged thing"), and "A new glow anywhere is his
to rule" is also a reading — it reaches past rings to every glow, which D880 did not say. Without the mark, once it is
in the guide nobody can tell what he said from what was inferred. Separately, the citation (D877, D879, D880) leaves out
his first glow ruling, D164 ("A flagged puck does not glow" — "can u not make it glow", 24 Sep 26), which the contracts
page cites for the same rule, and D860 (the just-added mark lost its glow), which the clause's first item rests on.

**Fix.** Head the point "**A ring never glows (owner D164, D860, D877, D879, D880 — 24 Sep and 15 Oct 26).**" and end
it with:
> (His words: "a ring in this app never glows", D880; a flagged puck, D164, the just-added mark, D860, the board's other
> marks, D877, and the picked person's chip, D879, lost theirs. That the rule covers rings that say something about a
> thing, that a dark shadow is depth and stays, and that a new glow anywhere is his to rule, began as the agent's
> reading; he approved them as written here, D8xx.)

### 6. SHOULD — "never added as a variant" — a variant of what?
**Problem.** A reader who never saw the conversation cannot tell what the variant is of. In "One mark, one look" it is
"a variant of this one" (the mark); here there is no one thing for it to vary.

**Fix.** Replace "A new glow anywhere is his to rule, never added as a variant." with:
> A new glow, on a ring or anything else, is his to rule, never added without his word.

### 7. SHOULD — item 3 (the SANS stripe) is a stripe, not a ring, but is listed as one the rule covers
**Problem.** The heading says "The rule above would cover these", and only item 4 is flagged "not a ring". The SANS
mark is a stripe down the puck's right edge (the guide's own table: "Purple right edge — a SANS person", D651), not a
ring, so the rule as worded does not cover it; D879 and the contracts page record it as "not ruled". The item also does
not say what a person sees, unlike the other three; and D651's row records the stripe as deliberately "the brightest
thing on the puck", which he should hear with the question.

**Fix.** Replace item 3 with:
> 3. **A SANS man's purple stripe** (`.puck.san::after`, `04-pucks-sections.css`) — the bright purple stripe down the
>    right edge of his puck glows purple; made the brightest thing on the puck so SANS reads at a glance (D651). A
>    stripe, not a ring, so outside the rule as worded; named so he can say.

and the heading's first sentence: "The rule above would cover the rings among these; the others are named so he can
say."

### 8. LOW — item 2 quotes a code comment as his words
**Problem.** "a glowing, deep, faded green rectangle" is the stylesheet's comment, not a recorded quotation of his. His
recorded decision is the Leave War's settled line: "glowing dark-green border … (owner, 1 Sep 26)", the colour his pick
of two greens he compared.

**Fix.** Replace the quotation with: "— a dark-green border with a soft green glow round the columns open for bidding;
his pick of two greens, a settled Leave War decision (`leave-war.md`, owner 1 Sep 26)". Changing it changes his earlier
pick, so if he rules it off, that line is marked and corrected in the same change (D90, D201).

### 9. LOW — the drop-shadow exception names only a dragged thing
**Problem.** Windows, menus, sheets and the Leave War's selection dock all cast dark shadows too. A reader applying "a
dark drop shadow under a thing being dragged is depth" could ask whether a window's shadow is a glow.

**Fix.** "A dark shadow that lifts a thing off the page — a window, a menu, a thing being dragged — is depth, not a
glow, and stays." Two flat, unblurred pale halos remain outside both readings — the sync button's green dot
(`02-shell.css` `.fastsync.on .dot`, `0 0 0 3px` pale green) and the Leave War's selection dock (`matrix.css`,
`0 0 0 4px` pale blue); the draft may name them with item 4 as "not a glow by the rule's measure (no blur), named so he
can say", or leave them. The sign-in page's talon logo also glows blue (`00-foundation-login.css` `.lb-glyph`,
`drop-shadow(0 0 16px)`) — not a ring, and "the talon logo stays" is a product invariant; naming it is optional.

### 10. LOW — two passages of the contracts page still say glows stay (D201, when the rule goes in)
**Problem.** `raptor-port/docs/ui-contracts.md` §"No flag ring glows" still ends "Two glows are NOT flags and stay: the
purple 'this is you' glow on his UNFLAGGED puck and the clicked-warning focus" — both went with D877; and its
just-added box passage still says "inset + soft glow". Once the guide says a ring never glows, these contradict it.

**Fix.** In the change that puts the point into the guide, correct both to the plain ring and point to D877 / D860
(D201).

## The wording with the fixes above, for convenience

> - **A ring never glows (owner D164, D860, D877, D879, D880 — 24 Sep and 15 Oct 26).** A ring the app draws to say
>   something about a thing — the just-added mark, a picked or highlighted thing, the crew a tapped warning lights, a
>   thing picked up or just landed, a puck that earns OIL, his own puck — is a plain line in its colour, with no soft
>   light spreading out from it or into it. Its colour, its width and whether it is solid, dashed or dotted carry the
>   meaning; a glow adds none and blurs the edge it marks. A dark shadow that lifts a thing off the page — a window, a
>   menu, a thing being dragged — is depth, not a glow, and stays. The places that still glow today (`OUTSTANDING.md`
>   `[GUIDE-NO-GLOW]`), two of them looks he chose — the green "he can take this seat" ring and the Leave War's
>   open-bidding box — stay as they are until he rules on each from its picture; a look names them and changes none. A
>   new glow, on a ring or anything else, is his to rule, never added without his word. (His words: "a ring in this app
>   never glows", D880; a flagged puck, D164, the just-added mark, D860, the board's other marks, D877, and the picked
>   person's chip, D879, lost theirs. That the rule covers rings that say something about a thing, that a dark shadow
>   is depth and stays, and that a new glow anywhere is his to rule, began as the agent's reading; he approved them as
>   written here, D8xx.)

Nothing in it clashes with §4's colour table, "One mark, one look" or §5 (whose motion list already says "with no
glow"); the table's "A green outline round the Leave War's dates" row stays true either way.

Ready to put to him: no — after findings 1 and 2 (and preferably 3–7) are fixed, yes; no second read is needed for
those, as they add places and a hold rather than change what is asked.
