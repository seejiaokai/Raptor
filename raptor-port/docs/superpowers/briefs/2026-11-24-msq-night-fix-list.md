# The night of 24 Nov 26: the fix job's list (chat 153)

From the walk (`docs/handpass/2026-11-24-msq-night-check.md`, its F1–F5) and the four blind reads of `fcca051f0` (`2026-11-24-msq-night-read-{astra,opus,security,fable}.md`, beside this file). Each item: a test that FAILS first, seen failing, then the fix. A reader's claim is not believed until that test fails; if it cannot be made to fail, say so and leave the code.

## Fix, most serious first

1. **A mouse or finger drag crossing a squadron change** (Astra 1, high). A bend-handle drag begun on 142 and released after a pick of 149 changes and saves 149's layout. Give every active gesture in `tracker/app/core.js` one cancel, run before the departing squadron is parked or emptied, and reject stale move, release and edge-pan callbacks. Check every gesture (balls, links, bends, edge pan, mouse and touch), not only this one.
2. **The held draft is lost** (Opus F1, Fable F1). In the member view with a chart draft held on 149, a tap opening one of his own pages, or Logout, drops the draft with no question. Both readers give a fix; choose the one that keeps the draft and asks.
3. **The question in the member view** (the walk's F2, Fable F2, Opus F3). "Save them before switching to 142?" opens at zero size inside the hidden Tracker and jams later picks; "Save them" there hides its refusal. The question and any refusal must be visible and answerable over the page he is on. Save is refused there by the gate: keep the three approved buttons and show the app's existing "This change could not be saved." No new words.
4. **The Leave War left on the home squadron** (security F1). After a member-view round trip over a draft, the top bar says 149 but the Leave War loaded is 142's, and Approve writes into 142's war. The fix is the `maybeReenter` key in `state/store.ts`.
5. **A pending Export crossing a squadron change** (Astra 2). Capture the session and squadron when Export starts; abandon it if either changed, at every await and before writing.
6. **A copied course shares its remembered place** (the walk's F1). `lastSyl:` / `lastCrew:` in `tracker/app/core.js` are keyed per course: key them per squadron, as `lastCourse@` is. Also settle Opus's lead on `lastCoursePref` reading the plain key first.
7. **A held Input window's "Switch back" cannot be pressed** (the walk's F3). The shade covers the role chip, Tab cannot reach it, and a press there closes the window and loses typed words with no question. Keep the chip pressable while held. Restore the drawn PERSON line on the held form (see `docs/mock/2026-11-24-msq-new-words/img/i1-desk-input-window.png` and `i1-phone-input-window.png`).
8. **Discard closes Edit chart layout** (Opus F4). Discard from + Add syllabus, + Add course or Rename course must keep him in the layout editor.
9. **The squadron list opens behind the Calendar window on a desktop** (the walk's F4, low, older). Fix the stacking if it is a small, safe change; otherwise report it.

## Test each, and fix if it fails

- A held Input window's lock after a pick, a switch to the member view and back: are its boxes live under the grey band? Does any control inside write at once (an attachment first)? (security lead)
- A dropped draft left drawn if the same squadron is wanted again before memory is emptied: `follow(B, false)` then `stay()` with a dirty chart. (Fable lead)
- After a draft is saved following a member-view round trip, does the next switch leave the door on 149? (Opus lead)
- A right lowered in another tab: Hunter's already-open tab still saves a mark on 149 with no message until a refresh (the walk). Reproduce it, compare with the build before tonight at `scratchpad/filter/dist`, and report whether it is new. Do not change it unless tonight caused it.

## Do NOT build

- Undo naming a role beside another change (Opus F2, Fable F3, Astra 3, the walk's F5): its words are not drawn; it waits for the owner (D1625).
- Anything else that adds words, marks or controls.
