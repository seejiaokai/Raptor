---
target: raptor-port/src/ui — the scheduler interface
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-15T17-39-08Z
slug: raptor-port-src-ui-the-scheduler-interface
---
# Design critique — RAPTOR scheduler interface

Method: dual-agent (design review + detector/browser evidence), both on the production build at 1500px and 390px. No console/page/network errors on any surface.

## Design Health Score: 35/40 (Good, top of band)
1 Visibility 4 · 2 Match-real-world 4 · 3 Control/freedom 3 · 4 Consistency 3 · 5 Error prevention 4 · 6 Recognition 3 · 7 Flexibility 3 · 8 Minimalist 3 · 9 Error recovery 4 · 10 Help/docs 4

## Design specificity: strongly product-authored
Warning engine writes real sentences (names + clock times + causal chains); puck ring taxonomy (solid/dashed/dotted breach states); qualification-driven colours; Logic page in squadron voice. Detector flags a generic cyan-on-dark theme + heavy small text — deliberate, not a fault.

## Strengths
1. Warning language (names, times, plain-English cause) — top trust driver.
2. Publish gating — disabled until 4 sign-offs, names the missing ones.
3. Logic page — genuine plain-language self-documentation.

## Priority issues
- [P0] Keyboard can't reach main nav. Shell.tsx:196-200 / Drawer.tsx:30 — nav items are <a> with no href/role, skipped by Tab. Verified live. Fix: real buttons or href+role. → /harden
- [P1] Safety info by colour alone + contrast fails. html.ts:164-165 — "CP" amber ("needs approval") vs red ("not authorised"), same letters, colour-only. Qualification badges white-on-red/blue/purple 3.4–4.33:1 (scheduler.css:296, html.ts:148-168), under 4.5:1 AA. Fix: add glyph/shape to CP states + raise contrast. → /harden
- [P1, known stub] "Throw pucks (auto)" (Shell.tsx:273) enabled, toasts "(stub in prototype)". Deliberate carry-over; decide hide/mark. → /harden
- [P2] Mobile Quals loses CALLSIGN column on horizontal scroll. Fix: position:sticky left:0. → /adapt
- [P2] Mobile week front-loads ~20-row legend before content. Fix: collapse on narrow, closed default. → /layout

## Persona red flags
Sam (a11y): P0 nav + colour-only CP + badge contrast. Casey (mobile): aircrew palette occludes drop target; 40-name VIEW AS list no search; all phone tap targets <44×44. Riley: dead "Throw pucks" erodes trust. Alex: served well except keyboard nav.

## Detector/browser evidence
detect.mjs on dist/: 8 findings (side-tab accent borders, Inter overused) — degraded regex mode. Overlay on Edit Schedule: 1593 undersized-ui-text (9-10px), 272 ai-color-palette, 168 low-contrast (3.4-4.3:1 white-on-colour), 172 cramped-padding. Contrast: qualification badges fail AA; topbar adv/note pills measured 1.49/1.86:1 but against 8%-alpha wash (likely OK vs composited page bg — needs confirm). Touch targets: every phone control <44×44. Focus: 6 outline:none rules without a focus replacement (scheduler.css 223,288,601,871,909,934). No horizontal overflow at 390px on any page. No console/page/network errors.

## Minor
Small text app-wide; Insights closes only via backdrop (vs Manage-users ✕); dashed/dotted/solid rings never taught on-screen; "4 X 4" badge unlabeled.
