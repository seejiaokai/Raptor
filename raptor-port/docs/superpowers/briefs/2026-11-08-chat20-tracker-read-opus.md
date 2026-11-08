# Chat 20 — the Tracker's small batch: the fresh Opus code read (D1860, [TRK-KEPT-COPIES])

A fresh, blind read by an Opus that did not write the code, to the brief
`2026-11-08-chat20-tracker-read-brief.md`. I read the code at commit `ef035e763` against its base `bf09f369b`, as
`git archive` trees unpacked in my scratchpad, not the working tree (the working tree has since taken `main` in, which moved
other files). I opened no other reader's report, no evidence sheet and no pictures. No file in the repo was changed
apart from this report.

**Result: 0 high, 0 medium, 1 low.** Nothing a person sees changes, on the Tracker or on any other page that draws the
app's icons. Both D1860 strings read exactly as ruled. The one low finding is a gap in the tests, not in what ships.

## What I checked, and how

### 1. The five icons — the very same page elements, proven by rendering both versions

- I transpiled both versions of `tracker/components/Glyphs.jsx`, and both versions of `ui/icons.tsx`, `ui/pen.ts` and
  `ui/glyphs.ts`, with the repo's own Rolldown transformer into the scratchpad. That is not the app's build: nothing went
  into `dist/`. I then rendered each mark at the base and at the fixed commit, two ways: (a) server markup, parsed back
  through jsdom, and (b) a real client render (`createRoot` + `flushSync`) into jsdom. The comparison covered
  `outerHTML` **and** the namespace of every element, so an `<svg>` whose children came out in the HTML namespace
  would have failed.
  - `PenGlyph`, `PenGlyph solo`, `ReorderGlyph`, `GearGlyph`, `ResetGlyph`, `ListGlyph` (plus `CopyGlyph` and `UpGlyph`
    as controls) all came out **identical** in both ways. Classes: `trkglyph trkpen`, `trkglyph trkpen solo`, and
    `trkglyph` for the others. Every shape is in the SVG namespace.
  - The app's own icons called with no class — `GearIcon`, `ReorderIcon`, `ResetIcon`, `ListIcon`, `PenIcon`,
    `PenIcon solo`, plus `TemplatesIcon`, `PhoneIcon`, `TicketIcon` through the same `Drawn` — printed **byte-for-byte the
    same server markup** at base and commit.
- The drawings match exactly. `PEN_INNER`, `REORDER_INNER`, `RESET_INNER` and `GEAR_INNER` are character for character
  the Tracker's old copies. `ListIcon`'s path is the old `ListGlyph`'s path. `Drawn`'s and `ListIcon`'s `<svg>`
  attributes (viewBox, `aria-hidden`, `fill="none"`, `stroke="currentColor"`, width 2, round caps and joins) are
  `G`'s, in the same order. `PenIcon`'s are the old `PenGlyph`'s (class, viewBox, `aria-hidden` only).
- Default classes still apply when no class is passed. `GearIcon`/`ReorderIcon`/`ResetIcon` pass `className={undefined}`
  through, so `Drawn`'s default `'btnglyph'` applies. `ListIcon` defaults to `'btnglyph'` and `PenIcon` to `'pen-ic'`.
  The project does not set `exactOptionalPropertyTypes`, so passing an undefined class type-checks.
- CSS: every rule that selects `.trkglyph`, `.trkpen`, `.solo`, `.pen-ic` or `.btnglyph` (tracker.css, 02-shell.css and
  the other scheduler and Leave War sheets) sees the same classes as before. The Tracker's marks never carried
  `btnglyph` or `pen-ic`, and still don't. The only `.solo` rule outside them, `.dwlist.solo`, is another element. With
  the same DOM, no rule can match differently.
- Callers: SidePanel, Pop, Modals, Header, FlexSettings, ArrangeTools and App all use the five as JSX elements. None
  calls them as plain functions or turns them into text.

### 2. Behaviour

- Focus and events: the DOM is the same, so tab order, click targets and `aria-hidden` are unchanged. No marks gain
  `tabindex` or `focusable`.
- React: `dangerouslySetInnerHTML` gets a constant string, so a re-render does not touch the DOM. The app already draws
  its own round-4 icons this way.
- Test rendering: jsdom puts the injected shapes in the SVG namespace, which my run proved. The tests that walk the
  pencil's `<g>` and use `drawnAs` pass.
- Bundle: `ui/icons.tsx` imports only `ui/pen.ts` and `ui/glyphs.ts`, which import nothing. There is no cycle and
  nothing heavy is pulled in. The import runs from the Tracker to the app, never the other way, so the lazy Tracker chunk
  still loads only on the tab. The Tracker already imported the app's screen helpers of the same kind (`ui/DateBox`,
  `ui/kbscroll`, `ui/edgescroll`, `ui/lift`), so this is not a new kind of crossing the seams note would count. The
  no-import guard covers `tracker/role.js` and `tracker/people.js`, which this change does not touch.

### 3. The page colours — every token resolves to the value it had

- Raptor's `:root` (00-foundation-login.css) holds exactly the old copies' values: `--bg #0B0D10`, `--panel #14181D`,
  `--panel-2 #1A1F26`, `--edge #2A313A`, `--ink #F1F4F7`, `--ink-3 #8A96A3`, `--accent #3BC6E8`, `--accent-ink #052A34`,
  `--flight #3BC6E8`, `--ok #57C97A`, `--hard #F0555F`, `--adv #E5A83B`, `--san #B24DEA`, `--edge-2 #39424D`,
  `--raised #20262E`. Every new link (`--panel2`, `--line`, `--muted`, `--acad`, `--test`, `--sim`, `--device`,
  `--marg`, `--fail`, `--orange`, `--red`) is resolved on `#page-tracker` to the same hex as its old copy.
- Nothing between `:root` and `#page-tracker` sets any of these names. I searched every CSS file, every inline style and
  every `setProperty` in `src/` at the commit. Only `:root` declares them. The Leave War's `.c.k-*` / `.tchip.lv.k-*`
  cells re-declare `--ink` for themselves, and no Tracker element carries those classes. No run-time code sets a colour
  token: the `setProperty` calls are all sizes. There is no `@media print` and no `prefers-color-scheme` block anywhere,
  so no mode re-points a token that the Tracker used to shield itself from.
- No `var()` cycle: no Tracker name links to itself, and Raptor's tokens are plain values.
- Every `var(--x)` in tracker.css names something defined: a Raptor `:root` token, a Tracker-declared name, or
  `--tr-top`, which is set at run time with a `0px` fallback. The only fallback left is `--lift-box`'s (tidiness, below).
- Outside `#page-tracker`: core.js hangs only `#detailBubble` off `<body>` (plus a hidden file box and a download link,
  both unstyled). The bubble's rules use only Raptor names that `:root` defines, so losing their fallbacks changes
  nothing. Its content (`infoHtml`, `markHtml`, `showDetailBubble`) has no inline colours.
- `color-scheme`: Raptor sets `html{…color-scheme:dark}`, and `color-scheme` is inherited. Nothing in `src/` sets a light
  or `normal` scheme. The only other declarations (`select{color-scheme:dark}`, two Leave War sheets, 23-days.css) are
  dark. The Tracker's date boxes are Raptor's own `DateBox`. Its selects, checkboxes and scrollbars inherit dark as
  before.
- The Tracker builds no page of its own: no `window.open`, no `<style>` copy, no serialised document. So nothing lost the
  copies or fallbacks that a page outside Raptor would have needed.

### 4. D1860 — exactly as ruled

- `delCourse`: `'…kept: Restore in Reorder courses brings it back in this browser.'` The diff removes only `↺ ` and
  `⇅ `. The ruling's "…" covers "in this browser."
- `importClick`: `' (Restore in Reorder brings ' + (it|them) + ' back).'` The ruling's "(Restore in Reorder brings it
  back)" holds, with its plural branch kept. The comment placed between the two `+` terms is valid JavaScript.
- The words match the screen: the Reorder window's button reads "Restore" (Modals.jsx), and the menu item reads
  "Reorder courses" (Header.jsx).
- `retest.test.tsx` now pins both strings whole. The import case covers the singular "it" only, and the plural branch's
  logic is unchanged.

### 5. The tests — none weakened

I ran three of the changed test files one at a time (no build, no lock needed): `icons-markup.test.tsx` 6/6,
`trk-palette.test.ts` 43/43, `onepencil.test.ts` 3/3. These three read only files that are the same in the working tree
and at the fixed commit.

- `icons-markup.test.tsx` (new): its "before" strings really are the base's markup — my base-against-commit render
  printed the same strings. A genuine pin.
- `onepencil.test.ts`: the shape-equality check on the Tracker's copy became "the Tracker passes its class to the app's
  `PenIcon` and draws no pencil shapes of its own". Equal or stronger, since there is no copy left to drift. If the slice
  went empty, it would turn red, not pass silently. The rendered shapes are still compared with pen.ts by
  `tracker.test.tsx`, which walks `#courseMenuBtn svg.trkpen g`.
- `trk-palette.test.ts`:
  - The name map is now structural. A same-name token must be undeclared, and any other name must be exactly
    `var(--theirs)`. The resolved hex is still compared, and a re-added copy or a wrong link turns it red.
  - The bubble check still demands that each name is in Raptor's `:root`. It now forbids the fallback it used to demand,
    which is right with no standalone page.
  - The `color-scheme` check moved from "the Tracker sets dark" to "Raptor's `<html>` sets dark, and the Tracker sets no
    other scheme".
  - The "found both palettes" floor (>15) still bites: the Tracker block has 19 names.
- `tracker.test.tsx`, `trk-flex-setting.test.tsx`: comment changes only. Their `drawnAs`/shape checks run on the
  rendered DOM and still compare with `RESET_INNER`, `GEAR_INNER` and pen.ts.
- At the base, no test held the Tracker's Reorder and list copies equal to the app's. They are now equal by
  construction.

## Findings

### L1 (low) — two Raptor colour names the Tracker now reads bare are pinned by no test

- **What:** the File and pencil menus (tracker.css, `.menupanel`, lines 659–666 at the commit) read `var(--edge-2)` for
  their border and `var(--raised)` for a row's hover or focus shade. Before, each carried Raptor's value as a fallback
  (`#39424D`, `#20262E`), so the menus drew the same even if those names went. This change took the fallbacks away, which
  is right with no standalone Tracker. But nothing took over their guard. `trk-palette.test.ts` pins only the Tracker's
  own names (the map) and the rules above `#page-tracker {` (the bubble). `.menupanel` sits inside the wrapper, and
  neither `--edge-2` nor `--raised` is in the map.
- **Concrete failure:** rename `--raised` in Raptor's `:root`, for example in a palette edit. I did this in a scratch copy,
  and the check script I wrote lists `raised` as undefined in tracker.css. Every Tracker test stays green, while a menu
  row under the mouse or keyboard loses its shade: the declaration is invalid at computed-value time, so the background
  falls back to transparent. An `--edge-2` rename would likewise drop the menu's border colour back to the text colour.
  Nothing a person sees today. This is a guard the change removed without replacing.
- **Cause:** the fallbacks were the guard, and no test was added for the tokens the wrapper reads by Raptor's name.
- **Fix:** one test in `trk-palette.test.ts`. It passes today. With `--raised` renamed it lists `['raised']`:
  ```ts
  it("every colour name the Tracker's sheet reads is defined — by the Tracker, by Raptor's :root, or at run time", () => {
    const declared = new Set(Object.keys(vars(trkCss)))      // every --x: the sheet declares (its block, --sideW …)
    const runtime = new Set(['tr-top'])                       // set on the page by TrackerPage.tsx (with its 0px fallback)
    const used = [...new Set([...strip(trkCss).matchAll(/var\(--([\w-]+)/g)].map(m => m[1]!))]
    expect(used.filter(n => !(n in RAPTOR) && !declared.has(n) && !runtime.has(n))).toEqual([])
  })
  ```

## Not findings — checked and set aside

- **Typed marks outside D1860's two messages:**
  - The built-in syllabus delete's question still ends "…bring it back later from ⇅ Reorder." (core.js, about line 6278).
  - The import note still says "Set them again in ⚙.".
  - The Tracker's Export and Import arrows differ from the app's own (`ui/icons.tsx` `DownloadIcon`/`UploadIcon`: rounded
    tray corners, shorter arrows).

  None of these is in D1860 or in [TRK-KEPT-COPIES], and changing any of them would be visible. A later commit on the
  branch files them as [TRK-MARKS-LEFT]. I saw that from its subject line and the item's heading at the branch head.
- **The Tracker's known-gaps note:** at the fixed commit, `docs/tracker/known-gaps.md` still said the copies were "still
  copies, not yet taken back". A later commit on the branch corrects it.
- **For the host's records, not the code:** at the branch head, `OUTSTANDING.md` still lists [TRK-POP-ASKED] ("drop the
  typed ↺ and ⇅ marks in two Tracker messages … built with the Tracker's next batch") as open. This commit builds it.
- **Out of scope by the brief:** the magnifier (`SrchGlyph.jsx`) and the chart's SVG colours in core.js. The palette test
  still pins the chart's colours to the tokens.

## Tidiness note (filed, not fixed — never the rules engine)

**1. Anything left that only a standalone Tracker needed?**
- `#ordList .ordrow.dragging{box-shadow:var(--lift-box, inset 0 0 0 2px var(--accent))}` (tracker.css, about line 249).
  The fallback repeats Raptor's `:root` `--lift-box` recipe value for value. It is the last such copy in the sheet:
  `--tr-top`'s fallback is a run-time default, not a copy. Dropping it changes nothing on screen.
- `icons-markup.test.tsx`'s `PRINT_ICON_MARKUP` switch, the recording tool: with the variable set, all six checks pass
  without comparing anything. It could be a separate script, or the print path could mark the checks skipped.

**2. Anything duplicated that one source could carry?**
- `ListIcon` (`ui/icons.tsx`) still writes its own `<svg>` wrapper and path inline, now with the same class logic as
  `Drawn`. A `LIST_INNER` in `ui/glyphs.ts`, drawn through `Drawn`, would make it one source like its siblings. The page
  would stay the same, but the recorded server markup would self-close the path (`<path …/>`), so the `ListIcon` string in
  `icons-markup.test.tsx` would need re-recording.
- The Tracker's `G` wrapper (Glyphs.jsx) repeats `Drawn`'s `<svg>` attributes for the same line style. That makes two
  wrappers, one taking children and one taking a string, which could drift apart.
- The `shapes()` regex helper is written twice, in `onepencil.test.ts` and `tracker.test.tsx` (it predates this change).

**3. Is any comment now untrue?**
- Glyphs.jsx header: "the marks only the Tracker wears are drawn here" overstates. Export (`DownloadGlyph`) and Import
  (`UploadGlyph`) are marks the app wears too, in its own different drawing, and the magnifier lives in `SrchGlyph.jsx`.
  [TRK-MARKS-LEFT] covers the drawings; the sentence could name them.
- tracker.css palette block, last line: "the copy here kept a standalone Tracker's date boxes dark" reads as if a copy
  still stands here. "The copy that stood here…" would say it.
- `ui/pen.ts`: the sentence after naming the Tracker's `PenGlyph` says "Sized by `.pen-ic` (02-shell.css)". That is true
  only of the app's pencil; the Tracker's is sized by `.trkglyph`/`.trkpen`.
- Older, not on a changed line: tracker.css's header still says "The ONE rule outside the wrapper is #detailBubble". In
  fact `body.tr-on` and the `.trbtn` reset sit outside it too, and the next comment block says so.
