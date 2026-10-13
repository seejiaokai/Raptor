---
target: the designs of 13 Oct 26 — the date calendar, the Tracker date boxes, the OIL question, the bar that stays
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-10-13T14-06-37Z
slug: raptor-port-src-ui-datecal-tsx
---
Method: dual-agent (A: a fresh Opus reader given the pictures, the guide and the app's record · B: a Sonnet helper running the detector). The browser overlay was not run — the owner reads from his phone; 73 pictures of the built app at 390 × 844 and 1440 × 900 are the evidence. The host also pressed every control and key (`raptor-port/docs/mock/2026-10-13-design-look/keyboard.json`).

Target: the four surfaces built on 13 Oct 26 — the app's one date calendar, the Tracker's date boxes, the OIL question put before a change, the bar that stays. The page put to the owner: `raptor-port/docs/mock/design-look-13oct.html`; the record with file and line: `raptor-port/docs/handpass/2026-10-13-design-look.md`.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | On a phone the calendar card does not say which date it is picking |
| 2 | Match system / real world | 3 | The OIL question speaks in "non-working day (weekend / PH)", "HO cell" |
| 3 | User control and freedom | 3 | Escape, a tap outside, the ✕ on a filled box, "Don't swap", "Answer OIL", Undo |
| 4 | Consistency and standards | 2 | The close ✕ in two places; a picked choice drawn two ways; two focus rings; "Add" becomes "Save" |
| 5 | Error prevention | 2 | Today looks live where it cannot be picked; the Tracker lets a future day be picked, then refuses it |
| 6 | Recognition rather than recall | 3 | The phone card makes him remember which box he tapped |
| 7 | Flexibility and efficiency | 3 | A puck cannot be picked up by keyboard; the bar is 114 Tab presses away |
| 8 | Aesthetic and minimalist design | 2 | The OIL question is a box in a box in a window; the phone bar breaks one sentence in two |
| 9 | Error recovery | 3 | The bar offers the way back where the thing went wrong |
| 10 | Help and documentation | 3 | The OIL small print is help nobody reads at that length |
| **Total** | | **27/40** | Good — the calendar is clean; the OIL question's frame and the bar pull it down |

## Design Specificity Verdict

Mostly made for this product: the calendar is his iPhone's pattern in the Raptor look and knows the app (the weekday that stands out, the faint dates before a start, the squadron's own today); the swap that waits on its OIL answer could belong to no other app. What reads as leftover is the OIL question's frame and the bar on a phone, whose shape is an accident of how it is centred.

Deterministic scan: `detect.mjs` over the seven screen files — exit 0, no finding.

## What's Working

1. Nothing on the calendar moves under the finger — a fixed room for the title, six rows always, lists as tall as the dates they replace.
2. The ✕ inside the Tracker's filled box — no extra box or column, and it says what it does.
3. The swap that waits — nothing moves until answered; the buttons say what each does; the bar offers the way back.

## Priority Issues

- **[P1] The bar that stays cannot be reached or closed by keyboard** (L7; K8, K9). Fix: focus "Answer OIL" when it appears; Escape closes it. → /impeccable harden
- **[P2] The OIL question is a box inside a box, with its ✕ trailing the title** (L1, L2). Cause: the answers' row wears the week strip's style; the sheet family's head has no spring. Fix: flat answers; the ✕ in the corner, the whole family at once. → /impeccable distill
- **[P2] On a phone the bar and every passing note are half the screen wide** (L6; the notes' W). Cause: a box centred by `left:50%`. Fix: the full width less the gutters on a phone. → /impeccable adapt
- **[P2] A date that cannot be picked can look alive, and a future day in the Tracker is refused only after the pick** (L8, L14). Fix: one "cannot be picked" look that wins; a latest date on the calendar. → /impeccable harden
- **[P2] The OIL question's words — about 70 where about 40 do** (L3, L4, L5). → /impeccable clarify

## Persona Red Flags

**The scheduler at a desktop, in a hurry:** cannot pick up, put down or take off a puck by keyboard (440 Tab stops that do nothing — K11); the bar is out of the keyboard's reach; two presses and 70 words for each OIL answer.
**The member on a phone:** the calendar card does not say whether it is "From" or "Until", "Done on" or "Failed on"; a date in the marking pop-up reads as a record before anything is marked.

## Minor Observations

The run's sentence under a calendar is in the "press me" colour (L11) · the faint dates about 2 to 1 (L12) · the lists' keyboard place shown by a cyan word (L13) · the Tracker's side-panel boxes change width when filled (L16).

## Questions to Consider

Should the bar name the two men it did not swap? Should a picked answer look the same in the question and in the day's one list?
