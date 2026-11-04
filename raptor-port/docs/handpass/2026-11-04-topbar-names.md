# The page names beside TALON, ☰ where they do not fit — the bug check (4 Nov 26)

`claude/topbar-names-build`, pull request 634. His request D1641, his answers D1642 (build as the mock-up draws it) and
D1643 (a phone held sideways always ☰ and one row). The mock-up: https://claude.ai/artifact/Mxpwt7Qc27zRHWhxtj3pTY
(`docs/mock/2026-11-04-topbar-names/index.html`). Pictures `docs/img/handpass/2026-11-04-topbar-names/walk/`.

## 1. The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — the bar's layout only; nothing earned or counted |
| 2 | The published record | NO — no publish, sign or amendment path is touched |
| 3 | Saved data | NO — nothing is stored; the fold is worked out on each draw |
| 4 | A shared drawer | YES — the one top bar every page draws (`Shell.tsx`) |
| 5 | A new gesture or mode | YES — ☰ now shows on a desktop where the names do not fit; Escape closes the menu |
| 6 | A new surface | NO — the side menu is the phone's, unchanged |
| 7 | Roles | NO — who may do what is unchanged; an admin's and a member's names differ in number, walked as such |
| 8 | The warning list | NO |

**Tier: WALK.** No code read is required at this tier (§5); none was run.

## 2. The roll-call — every place the page names, or the bar that holds them, is drawn

| Place | Shows the change | Usable there | What else is on the same pixels |
|---|---|---|---|
| The app's top bar, every page (`Shell.tsx` `#topnav`), desktop above 821 | YES — beside TALON where they fit (S1, 54 page × size checks) | YES — a click on a name opens its page (e2e, S1) | the buttons on the right: on row 1 where they fit, else row 2 (S1 pictures) |
| The same bar, folded (`nav-fold`) | YES — ☰ shown, the names unseen (S1 at 830, S9) | YES — ☰ by mouse, keys (S7) and touch (S2, S8) | the names laid out unseen out of flow, `visibility:hidden` — not pressable, not reachable by Tab (S7 Shift+Tab) |
| A phone held sideways (874 × 402, touch) | YES — always folded, one row, Chromium and WebKit (S2, 18 checks) | YES — ☰ tapped, a page picked, a tap beside closes, Logout (S8) | the "Saving…" note hangs under the bar for a moment by design, as before |
| A phone upright (402 × 874) | must not change — unchanged ☰ (S3) | YES, as before | — |
| An iPad (1024 × 768, touch) | YES — measured, not forced (S4) | YES | — |
| The side menu (`Drawer.tsx`) at desktop widths | YES — opens from ☰ at 830 (S7) | YES — keys land on the page you are on, Tab + Enter picks, Escape closes, the keys back on ☰, a click beside closes (S7) | the dimmed page beside it |
| The side menu on a phone held sideways | YES — taller than the screen, scrolls to Account (S2, his question answered with a picture) | YES — Switch to the member view and Logout reached (S2, S8) | — |
| What is held under the bar: the Leave War's frozen dates | YES — right under the one-row bar at 830 and sideways (S5) | — | — |
| Quals' frozen heading row (`.qfixed`) | YES — right under the bar at 830 (S5; 59 there, 57 at 1600 — the bar's own height) | — | — |
| Edit Schedule's AIRCREW heading (D1116) | YES — under the bar at 1024 (S5) | — | — |
| The Scheduler Board's own bar | must not change — it covers the top bar with its own (D349); nothing of this touches it | — | — |
| The guest bar (`GuestApp.tsx` `.topbar.guestbar`) | must not change — it has no names; the new rules are aimed at `#topnav` / `#burger` by id | — | not walked: no names, no ☰, no rule reaches it (the CSS is by id, `wireNavFold` only in `Shell.tsx`) |
| The Leave War's own chrome (`.topbar.lw-top`) | must not change — same reason | — | the Leave War pages in S1, S2 show its chrome unmoved |

**Doors:** a page by its name (desktop, names shown) · by ☰ and the menu (folded, any size; upright phone as before) · by keys
(Shift+Tab to ☰, Enter, Tab, Enter) · the role switch (the menu's "Switch to the member view", S6). No door was removed.

## 3. The sizing step (§7.0)

- **Type of change:** C (a control shown in a new place, the menu's Escape) and E (the layout of the bar every page draws).
- **What only a walk could find here:** the bar wrapping on real letters (his iPhone's are wider — the mock-up's finding);
  what is held under the bar when its height changes; the menu at desktop sizes (keys, a click beside it); a role switch that
  changes the number of names at a fixed width; a resize loop the browser would report.
- **What the ledger says about walks of this type:** C and E walks find their faults in the surfaces over and under the
  changed part and in key handling (2026-11-04 ask-at-the-control: six, all keys and layering); none in a re-check of sizes.
- **The walk chosen:** the host alone, one script (`scripts/handpass/topbar-names-walk.mjs`), S1–S10: six desktop widths on
  all nine pages, the phone held sideways in Chromium and WebKit with a picture right after the tap (D1281), upright, an iPad,
  what is held under the bar, the role switch, the keyboard, live resizes, and wider letters. 138 checks.
- **Its row:** added to `docs/walk-ledger.md`.
- **The §7.11 lessons, for this change:** 3 (feedback — ☰ and the menu's open state pictured), 6 and 21 (only the real phone
  — his iPhone's letters decide where a desktop or iPad folds; on a phone held sideways it always folds, so his look is
  for the picture, not the rule), 17 (a control that changes a page's width — the role switch and live resizes, S6, S9),
  19 (a window over the page closed by each of its ways — Escape, a tap or click beside it, a page picked; S2, S7, S8), 22
  (seen by what it draws — every picture opened). The rest do not apply: no list, no pinch, no print, no hidden page.

## 4. Orders walked

| Order | Result |
|---|---|
| Wide → narrow → wide, live (1600, 830, 1280, 830, 1600, 900, 1536) | the names fold and come back by themselves, no resize loop (S9) |
| Admin folded → member view → admin | folds → unfolds (seven names fit at 830) → folds again (S6) |
| ☰ by keys → page → ☰ → Escape | the keys on the page you are on, then back on ☰ (S7) |
| ☰ by touch → page → ☰ → page → ☰ → tap beside → ☰ → Logout | each closes the menu, the bar still one row; signed out (S8, both engines) |

## 5. Cases carried by a test

| Case | Test | What it proves | Through the real controls? |
|---|---|---|---|
| Fit to the pixel, the member's fewer names, the sideways phone, the phone layout, no layout | `src/ui/navfold.test.tsx` (6) | the rule `mustFold` decides | no — stand-in sizes; the walk drives the real bar |
| Escape closes the menu, the keys back on ☰, nothing under it hears the Escape | `src/ui/drawer-keys.test.tsx` (2, red without the change) | the menu's key handling | a dispatched key in the mounted app |
| The rule at 1600, 1280, 1024, 900, 830 for both roles; the keys at 830; the sideways phone one row and its menu to Logout | `e2e/topbar-names.spec.ts` (12) | the rule in a real browser, every run | yes — clicks, keys, taps, a wheel |

## 6. Break tests

| Surface | Broken | Went red |
|---|---|---|
| The fold itself (`Shell.tsx` — `nav-fold` never applied) | the class removed | `e2e/topbar-names.spec.ts`: 4 of 12 red (830, the keys at 830, both sideways) |
| The menu's Escape (`Drawer.tsx`) | the change taken out | `drawer-keys.test.tsx`: 1 of 2 red |

## 7. Errors seen

None — the browser's error list was empty through every step (S1-err, S2-err for both engines, S9-err).

## 8. Not walked, and why

- **The guest bar and the Leave War's chrome** — they wear `.topbar` but have no names and no ☰; the new rules are by id
  and the measure runs only on the app's bar.
- **The Admin waiting badge widening the names at a borderline width** — the measure watches the names' own width
  (`ResizeObserver` on `#topnav`), the same route the role switch walked in S6.
- **His iPhone's letters on a desktop or iPad** — no test browser has them; the walk's wider letters (S10, Verdana) stand in,
  calibrated: at 874 on a desktop this PC's letters fit (695 of 706) and the wider ones fold. His look on his iPhone held
  sideways and upright is on his look card.

## 9. Gates

GitHub's full run of the pull request is the gate set while the repo is public (D1086): **red once** on the first push — one case of the new browser test, which assumed a member's side menu must scroll on a sideways phone; on GitHub's Linux letters it fits as it stands (the test's premise, not the app) — the test now scrolls only where the menu is taller; **green on the fix commit** (`2057ee465`: the full set, the secrets scan, the documents guard).
On his PC: the new unit files and the five around the top bar 52 / 52, the new browser file 12 / 12 under the lock, the code
check "no new finding".

## 10. What the walk found

Three FAILs on the first run, all of them the walk script's, none the app's: on the Tracker the passing "Saving…" note,
which hangs under the bar for a moment by design, was counted as a second row (twice, one per engine); on Quals the
script measured the table's own heading, which scrolls away by design, instead of its frozen copy, which sat exactly under
the bar. Both fixed in the script; the re-run: **138 / 138.**

## 11. His look card

1. On your iPhone held sideways: ☰, TALON and the buttons on one row on every page; ☰ opens the menu; scroll it to Logout.
2. On your iPhone upright: as before.
3. On your PC: the names beside TALON; narrow the window — at some point they fold into ☰, and widen it again.
