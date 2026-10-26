# Grant OIL's half-day pick reads "HO · 0.5" (D1397) — the evidence sheet

Branch `claude/lw-half-reads-0-5` (PR 571), 26 Oct 26. His answer to [LW-HALF-GLYPH]: "Show 0.5 instead", "Not 1/2".

**Tier: LOOK.** The eight answers: 1 earned leave, no (the pick still stands for 0.5 day: only its words change, its value
`'0.5'` and `oilNumber` are untouched; a typed "1½" is still read as 1.5) · 2 published record, no · 3 saved data, no · 4 shared
drawer, no (the one amount control `OilAmount.tsx` is drawn by the one-day bid window and the drag window, and both were
pictured) · 5 new gesture, no · 6 new surface, no · 7 roles, no · 8 warnings, no. Cosmetic on one control, but "0.5" is
wider than "½", so the row's fit was pictured on a phone and a desktop.

**Walk:** the M3 walk's Grant OIL step re-run on this build — `LW_OUT=2026-10-26-lw-half/after ONLY=w2 node
scripts/handpass/lw-m3c-walk.mjs` — 8 PASS, 0 FAIL (both windows, desk and phone; the row inside the window at both).
Before: `docs/img/handpass/2026-10-26-lw-m3-batch/walk/w2-*`; after: `docs/img/handpass/2026-10-26-lw-half/after/w2-*`. The host
opened phone-2 before and after, phone-5 (drag window) and desk-1 after: "HO · 0.5" fits; the box's hint is cut to
"other: 1.5, 2" in narrow windows exactly as "other: 1½, 2" was before — not new. Touched tests: oilhalf, draggrantoil,
creditdays — 39 passed. Gates: GitHub's run of PR 571 (D1086).
