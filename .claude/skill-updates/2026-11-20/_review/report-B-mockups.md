# Helper B-mockups — report (saved by the coordinator from the hand-back, 20 Nov 26)

**Counts (17):** APPLY 13 · FILED 2 (967, 968) · REFLECTED 1 (970). Table: `dispositions-B-mockups.md`.

## Files drafted
- `.claude/skills/brainstorming/mockups-on-the-real-app.md` (MOCK) — 18,956 → 22,330 bytes.
- `.claude/skills/brainstorming/SKILL.md` — one bullet sharpened, no new line.
- `raptor-port/docs/design-practices.md` (DP) — §1a test 9 only.
- `_docs/OUTSTANDING-items-B-mockups.md` — two new items.

## Changes
- DP §1a test 9 (949, 952): "alone" = without the writer's reasons, not without what anyone at the screen has; the reader gets the word list's line for each app word and the line above; each item a whole line as a person sees it, a real value in every slot, never a table fragment; the writer reads the list first; a second reading the line above or the word list settles is recorded, not sent back.
- MOCK step 1 (955): phone at his iPhone's 402 x 874 (WebKit, touch, 3x), never typed by hand; another width beside, never instead.
- MOCK step 3 (962): an edge shared with a neighbour measured against the neighbour's first letter; fails above ~0.5px unless on purpose and captioned.
- MOCK step 3 (960): where the element cannot hold a tag (text box, clipping panel) and the screen is still, the tag alone goes on the page from the element's box; outline stays on the element (inside where a list clips); crop takes every tag.
- MOCK step 3 (973): a tag shows a number he answers by, or "New", never a review code or ruling number (D2164).
- MOCK step 5 (974): a drawing brief gives each part's purpose and his ruled words; shape and values read from the running app; the helper reports every difference; the plan fixed before the page goes out.
- MOCK step 6 (959): a drawing script's one home `raptor-port/docs/mock/<date>-<name>/`, never `scripts/`.
- MOCK step 6 (956): a pure-style proposal drawn by injecting the exact rule, recorded then on the unchanged build; after the build the same script checks with nothing injected.
- MOCK step 6 "From the picture to the build" (967): a rule moved from an injected drawing is asserted painted (computed style) in the built app; points at [CSS-SCOPE-GUARD].
- MOCK §Judging "Reusing an older drawing" (971): every line of words the old script draws listed in the brief and checked against later rulings.
- MOCK §Judging "Choose the state" (963): a scroll-reached state checked per device by co-visibility; not drawn where impossible, the page says why.
- MOCK §Judging "works like the existing X" (953): a row for a check's output staged and read back, or its values checked against what the check compares.
- MOCK §Showing It, new bullet (961): several parties' views — every picture keeps the part naming whose view; where none, the page says so and offers a mark.
- SKILL.md "Working in existing codebases" (958): before recommending a new record, list or screen, say how the product enters the same fact today; a new mechanism needs the reason the old one cannot carry it.

## Filed (new items)
- [CSS-SCOPE-GUARD] (967, repeats 728): extend `src/ui/css-wrapper-css.test.ts` to fail on a `body`/`html`/`:root` selector inside a page wrapper, red with the 17 Nov 26 rule.
- [ASK-PAGE-CHECK] (968, 973): a script run on a mock-up or questions page before publishing — codes, ruling numbers in sentences, record words, tags other than a number or "New", more than one "look at now" list, answered items left. Third break of D1237/D1363.

## Reflected
970: how-we-work D2140 and D754 (full rows read); D2140 predates 970.

## For another file
- SUPERPOWERS-VENDORED.md change 8 (this review; his approval to come; read by Astra and a fresh, blind Opus reader, D1761, D1770): row for `brainstorming` listing the changes above.
- Optional: WS §10's phone state at 402 x 874 — C may close as already covered.
- [REVIEW-LAYERS] step 3 already holds 959's notes-only file-list check.

## Doubts
1. DP test 9's "recorded, not sent back" loosens an approved method (D832, D836) — check against D825.
2. MOCK step 3's page-laid tag vs the same paragraph's ban on marks laid over the page (drift, 16 and 20 Oct 26).
3. 968 FILED vs REFLECTED (how-we-work D1237, D1363, D2159; DP §8) — if [ASK-PAGE-CHECK] is not worth it, drop it.
Smaller: MOCK grew ~18%; 961 vs lesson 32 (D1222 crop) read as compatible.
