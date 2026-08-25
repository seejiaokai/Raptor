---
target: the whole app UI (desktop + mobile ergonomics, efficiency, snappiness)
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-25T08-26-12Z
slug: raptor-port-src-ui
---
# Raptor — Design Critique (25 Aug 2026)

Method: dual-agent (A: design-director review · B: detector + measured browser evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Banners/toasts/issue bars strong; "Sync · slow" implies live sync that doesn't exist |
| 2 | Match System / Real World | 4 | Squadron vocabulary throughout |
| 3 | User Control and Freedom | 3 | Undo/redo pinned; user removal fires with no confirm |
| 4 | Consistency and Standards | 3 | Icon-only export on Edit vs labelled elsewhere; three day-nav styles |
| 5 | Error Prevention | 3 | Publish sign-off gate excellent; clear-data two-tap; user removal unguarded |
| 6 | Recognition Rather Than Recall | 2 | Phone edit bar unlabelled glyphs; "4 X 4" unexplained |
| 7 | Flexibility and Efficiency | 3 | Real accelerators; zero keyboard shortcuts |
| 8 | Aesthetic and Minimalist Design | 3 | Edit page stacks four zones before the schedule |
| 9 | Error Recovery | 4 | Issues rail: named person, clash, reason |
| 10 | Help and Documentation | 2 | Help is only bug reports; how-to hides on Logic/tooltips |
| **Total** | | **29/40** | Good |

## Design Specificity
Authored for a fighter squadron, not generic (waves, FCP/RCP, ALs, sign-off ceremony, Logic prose rules). Drops to generic dark-form on Inputs and Admin. Detector: 35 CSS warnings — 20 accent left-border stripes (mostly SEMANTIC severity/category bars — largely false positive here) + 15 repeats of the one font. In-page detector emitted only totals (954–1333/page), not actionable. Overlays skipped: headless.

## Measured (Assessment B)
- Load 203ms; loadWeek 3.1ms; validate 0.3ms; zero console errors; zero horizontal overflow at 390px on all 8 pages.
- Tap targets <40px: phone editsched 97/298 (worst: ⓘ 16×16, day-nav ‹› 18×18, fastSync 25×21); desktop editsched 196/389 (worst: .stcfg "C" 15.8×12); phone viewsched 20/209 (8×8 day dots).
- Contrast pairs recorded, no AA failures flagged; microcopy SIZE (9–10px) is the accessibility concern, not contrast.

## Priority Issues
1. [P0] Edit controls finger-hostile: row ▲▼/CX/■/✕ ~19×15–26×18, config "C" 16×12, ✕ adjacent to nudges. Fix: ≥40px hit areas (invisible padding), spacer before ✕. → adapt
2. [P1] User removal instant/silent (verified). Fix: two-tap confirm matching Data panel. → harden
3. [P1] Inputs default window empty-trap; two different "now"s (table today+2wk vs form calendar on loaded week). Fix: "N inputs outside this range — show all" + one anchor month. → clarify
4. [P2] Desktop 1380px shows ~2.5 of 7 days. Fix: density step ≥3 days at 1366+, or glance mode. → layout
5. [P2] Phone loses day context on scroll; board Done/Close top-right thumb dead zone, one slip apart. Fix: sticky day label; thumb-reachable actions. → adapt

## Persona Red Flags
- Alex: no keyboard shortcuts at all; 7 clicks to cross a week with desktop arrows; locked Publish swallows clicks silently.
- Sam: publish-lock reason in a title attr on a disabled button (unreachable); 9–10px uppercase microcopy; UA-default focus rings.
- Casey: destructive ✕ beside nudges; Done/Close top-right; no day label when scrolled.

## Minor
Gradient seam on short pages; "4 X 4" and Quals date unexplained; "Sync · slow" fake status; Leave War phone grid scrolls date headers away; Insights no export; motion nearly absent (page switches teleport) — one authored transition set is most of the remaining "modern" gap.

## Questions
1. Should phone edit be a larger, fewer-options surface rather than a shrunken desktop board?
2. Tap warning → offending puck scrolls into view: what would it cost?
3. What do the fake sync chip and silent user deletion do to engine-trust?
