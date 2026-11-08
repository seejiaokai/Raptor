# Chat 20 — the code read of the Tracker's small batch (D1860, [TRK-KEPT-COPIES])

**One brief, two readers, blind to each other:** Astra (Codex) and a fresh Opus reader that did not write the code.
Read-only: change no file, commit nothing. Do not open any other reader's report, the walk's evidence sheet
(`raptor-port/docs/handpass/2026-11-08-chat20-tracker.md`) or its pictures
(`raptor-port/docs/img/handpass/2026-11-08-chat20-tracker/`). Write your whole report to the file your launch names,
and nothing else.

## What to read — a fixed commit, not the working tree

The working tree may change while you read. **Read the code at commit `ef035e763`** of branch
`claude/chat20-tracker-small-batch`, against its base `bf09f369b` (the `main` it was cut from):

```
git diff bf09f369b ef035e763 -- raptor-port/src
git show ef035e763:raptor-port/src/tracker/components/Glyphs.jsx
```

The changed files: `raptor-port/src/tracker/app/core.js` (two strings, D1860), `src/tracker/components/Glyphs.jsx` (five
icons now the app's own), `src/ui/icons.tsx` (`GearIcon`, `ReorderIcon`, `ResetIcon`, `ListIcon`, `PenIcon` take an
optional class), `src/tracker/tracker.css` (the page colours linked to Raptor's tokens; fallbacks gone; the
`color-scheme` copy gone), notes in `src/ui/pen.ts`, `src/ui/glyphs.ts`, and the tests `src/ui/icons-markup.test.tsx`
(new), `src/ui/onepencil.test.ts`, `src/tracker/trk-palette.test.ts`, `src/tracker/tracker.test.tsx`,
`src/tracker/trk-flex-setting.test.tsx`, `src/tracker/retest.test.tsx`. Read their callers and neighbours at the same
commit as you need: every Tracker component that renders `PenGlyph`, `ReorderGlyph`, `GearGlyph`, `ResetGlyph`,
`ListGlyph`; every CSS rule that selects `.trkglyph`, `.trkpen`, `.solo`, `.pen-ic`, `.btnglyph`; Raptor's tokens in
`src/ui/scheduler/00-foundation-login.css` (`:root`, `html`); the Tracker's mount `src/ui/TrackerPage.tsx`; the places
the Tracker hangs things off `<body>` (`#detailBubble` in `core.js`, any portal).

**The rules to hold it to** (none of `.claude/rules/` loads by itself for Codex — open each): the Tracker's rulings
`.claude/rules/decisions/tracker.md` (D1860, D1538, D157, D1132, D1135, D1705) and their full rows
(`grep -h '^| D1860 |' .claude/decisions-full/*.md`); the screen-design rulings `.claude/rules/decisions/design.md`
(D1134 the one pencil, D1509 and D1707 the one gear, D1703 the drawn marks, D1127); the Tracker's architecture
`.claude/rules/seams/tracker.md`; `.claude/rules/raptor-executor.md`; the backlog item `OUTSTANDING.md`
§[TRK-KEPT-COPIES].

## The promise

- **D1860 (8 Nov 26):** "The Tracker's 'Delete course' question and an import's note on a deleted course drop their typed
  ↺ and ⇅ marks: they read 'Restore in Reorder courses brings it back…' and '(Restore in Reorder brings it back)', every
  other word kept."
- **[TRK-KEPT-COPIES]:** the Tracker's own copies of the app's glyphs, pencil and colours merged into the app's own
  (kept only for a standalone Tracker, which D1538 ended) — **with nothing a person sees changing.** Any visible change
  is a defect here (it would need his look first, D1625). The Tracker's magnifier (`SrchGlyph.jsx`), which has drifted
  from the app's, was deliberately NOT changed — out of scope. The chart's SVG colours in `core.js` (PAL, TYPE_COLOR,
  GRADE_FILL) deliberately stay copies.

## What to look for

1. Anything a person would see differently: a class, size, colour, gap or alignment the five icons lose or gain, on
   the Tracker or on any other page that draws the app's icons (called with no class — must print exactly the markup
   it printed before); a colour the Tracker now resolves differently — an ancestor between `:root` and `#page-tracker`
   that sets one of the same-name tokens, a `var()` cycle, an element outside `#page-tracker` that relied on a Tracker
   name or on a removed fallback, a control that relied on the Tracker's own `color-scheme`.
2. Behaviour: anything the icons' new route changes — focus, events, `aria-hidden`, server-side or test rendering,
   bundle split (the Tracker is a lazy chunk; the no-import guard on `tracker/role.js` and `people.js`).
3. The tests: does each changed test still guard what it guarded, or is any weakened? (`onepencil.test.ts` now checks
   the Tracker keeps no drawing of its own; `trk-palette.test.ts` now pins links instead of copies.)
4. D1860's two strings exactly as ruled, every other word kept.

**Not a finding (D56):** a problem that lives only in data already stored, with the code correct going forward. A claim
is a finding only with a concrete failure, its cause and its fix — write each as a test that would fail, where you
can. Rank by severity. End with a **tidiness note**: three questions of the changed lines (is anything left that only a
standalone Tracker needed; is anything duplicated that one source could carry; is any comment now untrue) — filed, not
fixed, never the rules engine.
