# Section 1 (the guard rail) — K2a's three gaps against its drawing: the report (chat 198, 26 Nov 26)

Brief: `2026-11-26-msq-s1-k2a-gaps-brief.md`. Status: **all three closed, 0 points from the drawing on a desktop and a
phone**; nothing committed or pushed.

## What changed — `raptor-port/src/ui/postout.css` only, two new rules scoped to the open form

```css
#page-admin .od-add{margin-top:-2px}
#page-admin .od-add .adm-note.acc-note{margin-top:8px}
```

(with a comment above them naming the drawing and the measures). Why each number:

- **`-2px` on the form (`#accAddBlock`):** the heading "ADD A PERSON" and the six fields under it sat 2 lower than drawn
  on both sizes; all of them move together, so the whole form comes up 2. The top row's own 12 under it is untouched,
  so the closed page (no form) cannot move.
- **`8px` above the note (was `-2px` from `.acc-note`, 15-admin-help.css):** the note sat 10 nearer the Sign-in box than
  drawn (19.5 for 29.5 on a desktop, 21 for 31 on a phone); −2 + 10 = 8. The selector carries one class more than the
  page-wide `.adm-note.acc-note`, so it wins only inside the add form — an opened row's note and every other `.acc-note`
  keep −2. Its bottom margin (12) is unchanged.
- **Add person · Cancel:** no rule of their own. They were 8 higher = the 2 the fields sat low minus the 10 the note sat
  high; with both fixed they land where drawn. Their size (93 × 28 and 65 × 28 on screen), their gap of 6 and their left
  edge are unchanged (the script's figures before and after are identical).

## The three parts — drawing, before, after (screen points)

Measured two ways that agree: the presser's edge scans of the pictures (`k0p-p1-measure.mjs`, each image lined up on the
search box's top edge), and the app's own box positions printed by `k0p-p1-add.mjs`.

| Part | Size | Drawing | Before | After |
|---|---|---|---|---|
| Heading and the six fields (top edge, from the search box's top) | desktop | heading text 54.5, Callsign/Initials boxes 87 | 2 lower (56.5, 89) | 54.5, 87 — **0** |
| | phone | heading text 55, Callsign/Initials boxes 85 | 2 lower (57, 87) | 55, 85 — **0** |
| The note "Makes his Quals row…" (below the Sign-in box) | desktop | 29.5 | 19.5 (10 nearer) | 29.5 — **0** (scan: note text 288.5 from the search top drawn, 289.5 built — within half a point) |
| | phone | 31 | 21 (10 nearer) | 31 — **0** |
| Add person · Cancel (foot of the cyan button, from the search top) | desktop | 339 | 331 (8 higher) | 339 — **0** |
| | phone | 330 (top of the button) | 322 (8 higher) | 330 — **0** |

The app's own box positions, desktop (phone in brackets): heading 184 → 182 (183 → 181); each field −2; the note 410 →
418 (412 → 420), i.e. 9 → 19 below the Sign-in box's foot (the box, not the text; the scan above measures text); Add person
438.5 → 446.5 (457 → 465). Every width and left edge unchanged; the phone's 6-narrower fields remain the 390-vs-402 width
difference the brief names, not a fault.

## The closed page did not move

- The closed top-row pictures, `p1-1-closed-d-crop.png` and `p1-1-closed-p-crop.png` (search, Filter, "+ Add a person"
  and "WAITING FOR ACCESS" under them), compared pixel by pixel before and after the change: **0 differing pixels** on
  both sizes, same size.
- The script's own figures: the top row's boxes (search, Filter, "+ Add a person", the row) identical on both sizes; the
  edge scans of both closed pictures identical line for line.
- An opened row's Save · Cancel (`3.rowPair`) identical before and after, on both sizes.
- With the form open, everything under it (the thin separator, "Waiting for access") sits 8 lower, as the taller form
  requires — the drawing does not show that part.

## Pictures (in `raptor-port/docs/img/handpass/2026-11-26-msq-s1-k0p/`)

Re-made by the presser's Part 1 script for the desktop and the phone (the Saber/Quals part, `p1-7`, was not re-run):
`p1-1-closed-{d,p}`, `p1-2-open-{d,p}` (+ `-crop`), `p1-3-addpair-*`, `p1-3-rowpair-d`, `p1-4-*`, `p1-5-*`, `p1-6-*`,
`p1-8-under-*`, and the four side-by-sides `p1-side-{closed,open}-{d,p}.png`. I opened `p1-side-open-d.png` and
`p1-side-open-p.png`: the heading, fields, note and pair line up with the drawing; the drawing's crop starts 4 points
lower than the build's, which is why the two halves look offset by the same small amount top to bottom. The "before"
crops were kept only in the scratchpad for the pixel comparison.

## Tests

- `npx vitest run src/ui/msq-guard-g.test.tsx` (in `raptor-port/`): **13 passed, 0 failed** (1 file).
- `e2e/`: two files open the add form. `datecal.spec.ts` only opens it to use Post in's calendar (no position inside
  the form). `geometry.spec.ts` "the New person fields fit the Users pane on a phone (add and approve)" measures the
  form's boxes against the pane's left and right edges — run alone, `E2E_PORT=4742` (port checked free first): **1
  passed**.
- `npm run build` green before and after.

## Anything not closed or not checked

- Nothing left open in the form. Not this job, left as the brief says: on the CLOSED page "WAITING FOR ACCESS" sits 6
  nearer the top row than another section's drawing shows (that drawing is Admin → Users'); the thin separator under the
  open form stays (the builder's addition, to be named to the owner).
- No measuring script was changed.
- Housekeeping this run left in the working copy: `raptor-port/node_modules` (this copy had none; `npm ci` was needed to
  build) and `raptor-port/.tmp/n194-k0p/` (the presser library's saved world). Both are outside git's tracked files.
  `HANDOFF.md` and `2026-11-26-msq-s1-k1a-brief.md` show as changed/new in git status — not mine, left untouched.
- The checks lock was taken for the run and released; ports 4741 and 4742 are free.
