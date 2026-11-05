# The member / guest build — the scenario design (a fresh, blind Opus reader, 5 Nov 26)

Saved whole as returned (read-only; the reader changed no file). Brief: the order's §4 finder wording, the D56 exclusion,
the plain-user round (D1557), the §7.11 lessons. Its rows and scenarios are dispositioned in the evidence sheet §2 and §6.

## (a) Roll-call rows to add

1. **Under a failed save, the pass still says "Request sent ✓".** The pass ticks "Request sent" and shows "Waiting for an admin" whatever the save state. The only sign of the failure is the band above it. D1657's stated purpose is "a stranger whose request was not saved is never told it was sent". Today it is the band versus the pass. The roll-call has no row for the pass's words and steps while the band is up. Row: "the pass's step 1 under a failed save — MISSING a ruling". Put it to him (D1625: any change he would see is drawn first).
2. **The tall screens with the band up can push their top out of reach.** `.login` centres its card and scrolls (`align-items:center` with `overflow:auto`, `top:36px` when the band is up). When the card is taller than the screen, the top part can end up where scrolling never reaches. The pass is new and taller than the old card. Row: "pass / request form / sign-in on a short screen (phone sideways 874×402), band up and down — every part reachable".
3. **The band can show on the sign-in before anyone signs in.** At start-up, a save group left unfinished makes the save system start in the failed state (`storage/boot.ts` → `Postman initialFailed`), so the band is up on the very first screen. Row: "sign-in at a cold start with an unfinished save".
4. **The guest page now shows "Saving…" too.** GuestApp mounts the whole top-bar `SaveStatus`, so the floating "Saving…" note can now appear under the guest bar. Nothing ruled this. Row: "has it — new, unruled; must not cover the week strip".
5. **The Quals keyboard row describes a door that does not exist.** The Quals cells have no tab stop and no key handler. Re-word the row to "no keyboard door — the cells cannot be reached by keys (unchanged)".
6. **Who reads the Scheduler tick is not listed:** the SKED CK / PLANNED BY / APPROVED BY lists and the sign check (`engine/publish.ts`). Row: "reader — follows an admin's tick or untick of a member".
7. **An admin in member view (D292):** his own Scheduler cell should read only, as his Management cell does.
8. **Ranger is seeded with Scheduler ticked.** The cell empty and read-only needs a member without the tick. The data itself is not a finding (D56); the two looks are what to walk.
9. **The OIL bar on the board's Desktop layout above 820 wide** (a phone held sideways), panned; the words now carry a sign.
10. **The OIL bar's new sign does not shrink** (a fixed 16px) with the bar's one-line squeeze: the OIL bar at 320 and 375 wide, longest wording.

## (b) Scenarios, ranked (most specialised first)

- **S1 · both sizes — the pass under a failed save.** A stranger, guest switch on, saves refused, the request sent. Expected: the band across the top, the pass below it, nothing covered; RECORD what the pass says (step 1 ticked? "Waiting for an admin"?) — put to him against D1657.
- **S2 · phone sideways 874×402, WebKit — the pass on a short screen,** band up and then down after Retry; scroll to top and foot: the logo, claws, callsign, View the schedule, Sign out and "Signed in as" all reachable. Repeat with the Request access form, and the sign-in at 402 tall.
- **S3 · phone 402×874 — the sign-in boxes with the band up** (lesson 5): tap each, a picture after each tap; each box clear of the band and the keys. Only his iPhone's real keyboard can settle it: his look card (lesson 6).
- **S4 · both sizes — a 14-letter callsign on the pass** (`WWWWWWWWWWWWWW`): RECORD whether the name breaks mid-word (an outright fault, D1426) or runs past the card.
- **S5 · both sizes — each of the pass's states,** measured against `C-diag-phone.png` / `C-desk.png`: pilot with initials and CAT; no initials; personnel (no CAT); guest switch off; a long sign-in name.
- **S6 · both sizes — the plain-user round for a stranger** (D1557): sign in → Request access → the pass → View the schedule → guest page → Sign out → sign in again → the pass again → Sign out → admin approves → he signs in to the app; and again with saves refused from the request on: the band on every screen of the chain; Retry on the sign-in; the admin then sees the request.
- **S7 · both sizes — Retry on each new screen** (sign-in, request form, pass, suspended, guest bar): saves allowed → the band goes and the screen moves back; saves still refused → the band stays.
- **S8 · phone 402 — the guest page with the band:** the guest bar's last line, the week strip below, cards not covered; swipe a day and scroll (lesson 15); RECORD whether "Saving…" shows under the guest bar.
- **S9 · both sizes — the band at a cold start** (an unfinished save group, then reload): RECORD; NOT WALKED with its reason if it cannot be made.
- **S10 · phone 320 and 375 — the OIL bar's longest wording,** with and without the band above: one line, the sign whole, OK on screen.
- **S11 · phone sideways 874 — the board's Desktop layout with both bars,** panned left, middle, right: RECORD against main; nothing piled up, Retry on screen.
- **S12 · both sizes — the strip in every place it shows:** the top bar on two pages, the board's bar, the Leave War OIL tracker's grid and settings, both bars up together; the sign drawn (its pixels, lesson 22), "Not saved" bold, Retry solid amber at the right, 36px, the amber line, no glow.
- **S13 · desktop — the keyboard:** Tab to Retry on the sign-in with the band up (a visible ring); on the OIL bar Answer OIL gets the keys when it comes up, its ring shows, Escape closes it.
- **S14 · both sizes — the plain-user round for a member on Quals:** `us` → Quals → Edit → tick and untick NVG → change his CAT → initials → press the Scheduler cell (a picture right after the tap) → press Management → Done; NVG, CAT, initials save; Scheduler refused with "Only an admin can appoint a scheduler", his ✓ and purple look kept; the hover title on a desktop; then reload, and the sign-off lists still list Ranger.
- **S15 · both sizes — an admin's tick and untick:** untick Ranger's Scheduler → he leaves a day's SKED CK list; tick again → back; as `us` the cell unticked and read only.
- **S16 · desktop — an admin in member view:** his own Scheduler and Management cells read only; back to admin: editable.
- **S17 · desktop — a member with no Scheduler tick** (one an admin adds): the empty cell reads only; a press adds nothing.
- **S18 · both sizes — the suspended screen with the band.**
- **S19 · both sizes — the band carried through a sign-in:** `us` with saves refused → sign out → the sign-in with the band → sign in again: exactly one band, in the top bar; one status for a screen reader.
- **S20 · phone — the Desktop-layout board's "Not saved" band only, panned:** the words at the left and Retry at the right at each pan.

## (c) §7.11 lessons

1 one state only: S5, S1, S12 · 2 gesture speed: no new gesture (taps, S14) · 3 feedback: S14, S7 · 4 a press behind a window: no window — not applicable · 5 a box under something standing over it: S3 · 6 only the real phone: S3, his look card · 7 a modelled motion: none · 8 the drawing: S5, S12 · 9 alignment measured: S5's fields, each kind · 10 a hidden page shown again: S6 · 11 how much fits: S2, S10, S11 · 12 opened from several pages: S12, the OIL bar from the week and the board · 13 pinch: not applicable (D1567) · 14 keyboard boxes by search: the sign-in's and request form's, S3, S6 · 15 a pinned bar's fill: S8, S2 · 16 a warning cleared only by a change: S7, S14 · 17 a control that resizes the page: S7 · 18 print: n/a · 19 a window over a window: n/a · 20 gesture forms: n/a · 21 test-browser touch: n/a beyond 6 · 22 judged by pixels: S12's sign, the pass's claws and fade (S5).

## (d) Negatives — checked, no scenario needed

- The OIL bar's words: only the seven fixed wordings reach it (`oilwait.ts`), each with one dash; one walked plus the test of its words.
- Other "Not saved" texts in the Leave War's boxes and the grades sheet are box refusals, not the band — out of D1655.
- The Tracker's own save note: the new rules are scoped to `.sv-msg`, `.saveband` and `.oilband`, which it does not carry.
- Quals writers: only Quals' cell press and Admin → Users' callsign box call the Quals write; nothing cascades into the Scheduler tick; SXO sets it only in the start-up seed over demo people (D56).
- A member's undo replaying an old Scheduler change: the undo list clears at sign-out (D148); stored history is demo data (D56).
- The covering count of full-screen bands on the sign-in and access screens: harmless, no top bar there; S19 covers the hand-over.
- The commit gate's refusal message: no member screen reaches it; proven by the two test files.
- Colour variables: the band's background and sign are defined at the root; nothing overrides them where the band sits.
