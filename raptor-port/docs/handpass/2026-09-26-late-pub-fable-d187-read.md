# Fable's read of the D187 change — a look at a published version wears its warnings (26 Sep 26, blind)

Brief: `docs/superpowers/briefs/2026-09-26-d187-read-brief.md`; the code as of `e53f9786`. Read-only; nothing run. Its nine
findings, in short (the full text was its final message in the session; the dispositions are in the evidence sheet §9):
1. View-only Sched taps resolve against a look left behind on Edit Schedule (`view.ts displayedBundle` consults DPREV on
   any page) — fix: only on `editsched`.
2. The edit week's look still offers the mute ✕ and "Create the period", and filters by existing mutes — fix:
   `dayWarnHTML` read-only under PV.
3. The board's look: tapping a check does not light its crew (`highlights.ts` excludes `.pv-frozen` / `.preview`).
4. The edit week's look at the current version: the "Breaks Tuesday" row's index is found in the look's world but the tap
   resolves in Tuesday's working list — the wrong Tuesday warning focuses. Fix: `dayTraceHTML` under PV&&OFW finds the
   index in `displayedBundle(tdi)`.
5. The ⓘ panel under an edit-page look describes the working copy (`Modals.tsx DayPop`), and its rows tap into the
   version's list — fix: replay the looked-at version; pending 0 under PV.
6. An older version's look drops the crew-rest, 7-day, qualification and OIL warnings it went out with (only the frozen
   class is stored) — fix: keep the whole face at issue in a field the detector never reads.
7. The board's look: an AVALON/BB desk man wears the day's worst ring (`board-html.ts sbSeat`'s `pv?undefined:` guard).
8. Leaving a look keeps the warning focus by index — fix: `setDayPreview` clears that day's focus.
9. The board's look folds muted checks under "N hidden" — fix: show the full record under a look.
Explicit negatives: no write surface returns under a look; the current version's look is View-only Sched's face by
construction; a plan look stays flag-free; caches rebuild on every validate; phone uses the same builders.
