# [LW-GROUPS-STALE-AFTER-ARCHIVE] — the diagnosis (27 Oct 26, a fresh Opus helper, the night of 26–27 Oct 26)

**Not a fault: the 21 Oct walk compared two different months, not a stale session against a reload.**

Probe on the demo world through the real Archive (`archivePerson`); the "reload" re-opened the war's store on the same
saved data, then `setPeople(projectPeople())`. Heading counts:

| | January | October | December |
|---|---|---|---|
| Before any archive | IWSO 5, OPS W 11 | | IWSO 5, OPS W 11 |
| One WSO archived (Echo) | SXO 12 | SXO 12 | SXO 11 (his row gone) |
| Every WSO archived, same session | IWSO 5, OPS W 11 | IWSO 5, OPS W 11 | no IWSO or OPS W heading |
| Every WSO archived, after reload | IWSO 5, OPS W 11 | IWSO 5, OPS W 11 | no IWSO or OPS W heading |

The walker's `s6.mjs` (same session) read the war as it opened, on January; `s6b.mjs` (after the reload) pressed
`month-DEC` first (its line 15) — December is after the archived men left, so `rowInWindow` hides their rows and the
emptied groups lose their headings. The code agrees with itself and the rulings: `reprojectRoster` (`sync.ts` ~1771–1786)
and `setPeople` (`store.ts` ~2175) keep a man with a posting window; `closeStintOnArchive` closes his stint yesterday
(D323 — Archive is "posted out from today"); the headings are counted from the rows drawn (`Matrix.tsx` ~3971 —
"an emptied group takes its heading with it"); `rowInWindow` lets a posted-out man ride every month up to his last day
(owner, 19 Aug 26); D320 and D323 keep his past months. Nothing here is his product choice.

**Done with it:** a regression test pins the right answer (it passes before and after — a guard, not red-first); the item
is closed as a walk artefact; the walk lesson ("a before/after comparison reads the same month on both sides — the war
opens on its bidding window, not today") goes into `docs/walk-scripts.md`.
