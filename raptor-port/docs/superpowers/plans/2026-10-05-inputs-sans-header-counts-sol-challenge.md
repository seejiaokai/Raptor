# Independent Sol challenge — D581/D582 addendum

5 Oct 2026. Astra addendum at `2026-10-05-inputs-sans-header-counts-addendum.md`, SHA256 `df6ee8fd36ae744bb4edf8c0a2f403b4e8f87ca350dfbbeeba43cf7a52e24c5a`. Sol read the whole plan and personally opened all four private synthetic proposal pictures before source changes. This is the addendum's first plan challenge, not another code inspection or owner picture acceptance.

Disposition: **PASS with implementation constraints below**. D580 authorizes delegated product recommendations; D581/D582 settle the missing counts and header correction. Original plan and R1/R2 reports remain immutable.

- Primary Member Inputs/SANS tabs must each flex to half the available phone row. The synthetic picture leaves spare space after its fixed-width tabs; do not carry that into production.
- Use **Clear filters**, affecting current-mode person/type/search only. List date window, its separate reset/presets, sorting and Export remain explicitly visible. Applied filter text remains outside the collapsed phone controls, including the member's default own-person filter. Toggling the controls is not a filter change and must not release a saved-row reveal.
- Activity counts use the original unfiltered authored-date inputs with one set per flag. A person with all three flags increments each count once, O/A-only do not contribute to Fly shortage, and zero/unset targets remain distinct. The existing scheduler must not read these display counts.
- Native action targets remain at least 44px despite reducing accent, padding and rows. Verify 320px width, short height and long filter text; desktop controls reuse one DOM/stateful form. Hidden phone controls must leave keyboard traversal.
- R2 popup finding is carried forward as a correction, not withdrawn by later tests. Tests must cover document capture order, outside pointerdown, inside-origin drag-out, higher-editor Escape and role withdrawal.

The new source needs failing-first focused tests, a new frozen runtime walk and applicable final gates. Prior Freeze10 tests/pictures prove only that old snapshot. There is no third Astra code read; Claude's final independent code read of the expanded fixed branch after reset remains OWED before main. Branch preview only, no main merge or merging PR.

Rulings: D581/D582 already filed; none newly invented here.
