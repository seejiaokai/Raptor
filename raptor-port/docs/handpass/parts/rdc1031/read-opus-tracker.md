# Fresh, blind Opus read — the Tracker (31 Oct 26, pull request 603)

Scope: `git diff origin/main...HEAD -- src/tracker`, every changed function read whole with its callers, the storage
doorway, the rows door, the stylesheet's weights and the tests; the recording's Info-panel picture opened. Read only.

## Findings

**F1 — MEDIUM — a "Next event" chip that can be flown changes colour.** In the Info panel's "Next event (flow-based)" card,
the first chip of a row whose event can be flown had the card's grey words on main; on the branch it took the card's bright
ink. Cause: `tracker.css` `.kv span:first-child{color:var(--muted)}` matched the chip while it was a `<span>` (the first child
of its row's `<b>`); the chip is now a `<button>`, and `.trbtn`'s `color:inherit` took the `<b>`'s ink. The recording missed
it because the demo student can fly none of his "Next event" chips — every one is dashed ("not yet"), whose own rule makes it
grey anyway. Fix: `.kv span:first-child,.kv b>.evchip:first-child{color:var(--muted)}`. Every other tag-based selector in
`tracker.css` checked: none matched a converted element. **Disposition: fixed red first, fix round 1 (the evidence sheet).**

**F2 — LOW, records only — the per-finding table paired kept reasons with the wrong lines.** `rdc-dispositions.mjs` marked the
first N findings of a file and rule KEPT, by order, so in core.js reasons sat on lines that were fixed (e.g. `familyFromStore`
325, `trkHydrateMem` 381) and fixed lines read as kept (e.g. Import's writes 6698…). The totals (204 / 84) were right, the
rows were not; the reasons in the code itself are in the right places. Fix: pair each added comment with the finding whose
line on main reads the same as the line under it. **Disposition: fixed — paired by text; three comments above lines the
clean-up also edited are paired by place and say so; totals unchanged.**

## Checked and sound (the reader's lines, condensed)

1. **Reads together:** the storage is synchronous under its async wrapper; `sGetOne` keeps its per-key guard; order and
   first-match kept (results filed by index); `trkHydrateMem` stops at the first failed read as the old loop threw;
   `sGetOne` never throws; `findEnrolment` now holds the course it started with (safer).
2. **`structuredClone`:** every changed source is plain JSON (`customDefs`, `SYLLABI`, `DEFAULT_LAYOUTS`, `eventInfo`); the live
   chart `SYL`, where the ball editor sets `label` / `num` to undefined, is never the source of a changed copy — `persistSyl`
   and `dupSyl` keep the JSON copy. No missed site.
3. **Kept reasons** each true; nothing fixed that should have been kept.
4. **The converted elements:** `.trbtn` (1-0-2) beats the wrapper's bare `button` rules and loses to its class rules; the
   wrapper's `button:hover` border is invisible where the reset removed the border; box sizing and font kept; the lull chip's
   gaps kept; no button in a label or a button; drag-through, touch, the ✕ buttons' exclusion, the lull chip's padding and the
   Failures title's Enter / Space all as before.
5. **Splits:** no new hooks in the parts, keys unchanged, DOM order identical.
6. **Warning line and dialog serial:** `shownFor` compares strings (no loop, no one-frame flash); `seenSerial` is React's
   documented form, safe under StrictMode; the fast-paste guarantee holds; back-to-back dialogs pinned by the new test.
7. **No longer done:** nothing that matters (`saveWords()` pure, called once; native button keys replace the title's own).

Tidiness: FlexSettings' Escape listener re-binds each redraw (harmless). **The D1538 short line** is word for word its full
row's bold sentence and says what the row means (D138).
