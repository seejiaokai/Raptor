# [MED-NEWYEAR] — a medical input across New Year on the Medical tab (17 Oct 26)

Branch `claude/medical-newyear-display-298bb6`, cut from `main` after pull request 525.

## What the item said, and what was found

The item (found by the Medical cards job's fix read, `docs/handpass/2026-10-17-medical-cards.md` R3) said a downchit filed
for 28 Dec – 3 Jan is never in Medically Down or Pending Upchit on any "as of" date, because the Medical tab reads an
entry's end in its start's year. **That happens only to a row stored without the end's year** — "Jan 3" anchored to
2026 — and that row was planted by a test straight into the data (`fileInput`), not filed through a window.

**Every way the app writes an input's dates stores the end WITH its year** when it is not the start's: the input window's
save (`ui/inputedit.tsx normalizeInputDraft` — `fmt` adds the year; its own comment says the yearless span was the 12 Aug
26 fault, fixed then), a calendar drag (through the same edit), and a medical trim or split (`engine/medical.ts ordLabel`,
anchored to the row). Filed through "+ Medical", the row reads `{ date: 'Dec 28', endDate: 'Jan 3 2027', yr: 2026 }` and
the tab answers right. So by D56 there is no finding: the harm lives only in data already stored (a planted test row, or
a row from before 12 Aug 26), and the code is correct going forward. **No app code changed.**

Not changed, on purpose: the Medical calculation does not turn a yearless backward end into the next year. The schedule's
own reading of an input (`engine/inputs.ts inputCoversDate`) does not either; turning it in one reader only would put a
man down on the Medical tab while the schedule shows him free.

## Tier — the eight questions

1–8 all NO for the app: nothing under `raptor-port/src` changed. **Tier NONE for the app.** What was added: one browser
test (`e2e/medical.spec.ts`, "[MED-NEWYEAR] a downchit filed for 28 Dec – 3 Jan…") and this walk — the proof that the
item's premise does not hold for a real filing, and a pin so it stays true.

## Sizing (D607)

1. **Type:** none changed (a check of an existing calculation's reading of a real filing — type A's reader, no change).
2. **What only a walk could find:** whether a person filing through the window gets the year saved — the item's evidence
   had bypassed the window (D608: a test that changes the data directly never stands in for pressing a control).
3. **The ledger:** the Medical cards walk (17 Oct 26) was the host alone, about 2 min a run.
4. **The walk chosen:** the host alone, one script, phone 390 and desktop 1500, three "as of" dates, through the tab's own
   picker; the browser test carries the same path at 390.
5. **After:** its row is in `docs/walk-ledger.md`.

## Walk

`node scripts/handpass/med-newyear.mjs` on the built app (port 4173) — 12 of 12 PASS, no page or console error.
Pictures: `docs/img/handpass/2026-10-17-med-newyear/` (`phone-1-window.png` the window with 28 Dec → 3 Jan picked;
`*-2-asof-2026-12-30`, `*-3-asof-2027-01-02` the card under Medically Down, "28 Dec – 3 Jan 2027"; `*-4-asof-2027-01-05`
the card under Pending Upchit). Opened: phone 1 and 3, desktop 4.

Walk: 2 sizes × 3 dates, 12/12 PASS, pictures in `docs/img/handpass/2026-10-17-med-newyear/`.

## Gates

`npx playwright test e2e/medical.spec.ts` — 15 passed (the new test among them). The whole set: see `HANDOFF.md`
§Gate baseline and the branch's block.

## Reads

None: no app code changed, so no code read is owed (D790 applies to code).

## D977 — every Medical card one even width (the same chat, after his look at this walk's pictures)

He asked why Pending Upchit's cards had no symmetry with Medically Down's and sat pushed to the left; "Fix", then "make
them Evenly width so that it's nice even on the desktop. Wrap text as required" (D977). Built in
`src/ui/scheduler/16-medical.css`: a phone card exactly a third of the row, a desktop card 120 (chosen from what the cards
hold, measured on the built app: 84–90 of words beside a 74 puck; the long New Year period 142), words wrapping inside.

**Tier: LOOK** — one surface's layout (the Medical tab's cards, one component drawing all three sections); no shared
drawer, gesture, saved data, role or rule. Before and after at phone 390, the narrowest 320 and desktop 1500:
`node scripts/handpass/med-even-width.mjs` → `docs/img/handpass/2026-10-17-med-even-width/` (after, 18/18 PASS) and
`docs/img/handpass/2026-10-17-med-even-width-before/` (the same script on the old build: 8 FAIL at phone and desktop — cards of 88 and 94 in one section on a phone, 94, 100 and 152 on a desktop — the proof
the check catches the old layout). Opened: phone and desktop, "as of 2 Jan 2027".
The browser test that pinned the old rule ("every card hugs its own content", `e2e/medical.spec.ts`) now pins D977: one
width, the sections' columns lined up, a third on a phone, 120 on a desktop, nothing past the card's edge. Every browser
test touching the cards: 33 passed; their unit tests 21 passed.

Walk: phone 390, 320 and desktop 1500, before and after, 18/18 PASS after, pictures in `docs/img/handpass/2026-10-17-med-even-width/`.
