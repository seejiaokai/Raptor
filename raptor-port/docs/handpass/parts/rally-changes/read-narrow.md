# [RALLY-BOX-CHANGES] — the narrow read of the F1–F3 fix (19 Oct 26)

Reader: a fresh Opus 5.5, blind to the chat that wrote the fix (D790; no Fable, D903). Read: `git show HEAD -- raptor-port/src`
(484b65738), `git show HEAD~1 -- raptor-port/src/ui/interactions.ts` (the walkers' ring fix), `read.md` §F1–§F3, and around
them `placeSuggestion`, its two callers (the click route and the press-then-focus route), and the Escape branches of
`textedit.ts routeKeyDown` and the board's write path (`boardChange` → `txtSet`). Ran: `npx vitest run
src/ui/brieftime-ui.test.tsx` — 25 of 25 pass. No other file changed.

## Findings

None. Each fix is right and complete, and nothing beside it is broken. The reasoning is below so it can be checked.

## F1 — the kind of change (`firstChange(sug, v, kind)`) — right and complete

Gate: the insertion branch only for `kind === ''` or `insert…`; the deletion branch only for `kind === ''` or `delete…`;
everything else keeps what the box holds. Walked against every kind a browser gives on an `<input>` and on the week's
contenteditable (both give an `InputEvent` with `inputType` — Chrome, Firefox, Safari 10.1+ / iOS 10.3+):

| Kind | Example (suggestion 09:40 / 10:40) | Result | Right? |
|---|---|---|---|
| `insertText` at the end, the start or the middle | `09:401`, `109:40`, `009:40` | `1`, `1`, `0` | yes — only what was typed |
| `insertText` over a select-all (the F1 case) | `10:40` → `1` | kept `1`; `1100` saves 11:00 | yes — was 01:00 before |
| `insertText` `0` over a select-all of `09:40` | `0` | kept | yes — shape alone emptied it |
| `insertText` over part of it | select `40`, type `5` → `09:5` | kept | yes, as before |
| `insertFromPaste` at the caret / over a select-all | `09:401100` / `0940` | `1100` / kept | yes |
| `insertReplacementText` (iOS autocorrect, QuickType), `insertFromDrop`, `insertTranspose` | — | read as an insertion, or kept | yes — none can make a deletion look like an insertion |
| `insertCompositionText` (IME) | — | read as an insertion | as before the fix (see below) |
| `deleteContentBackward` / `Forward`, `deleteWord…`, `deleteSoftLine…`, `deleteByCut` | `09:4`, `0940`, `` | emptied | yes — "a Backspace empties it"; a cut of all already left it empty |
| `historyUndo` / `historyRedo`, `format…` on the week box | — | kept as it stands | yes — never misread either way |
| empty (a synthetic `new Event('input')`, jsdom) | — | the shape alone, as before | yes — no code in `src` raises one on these boxes |

- The reverse mistake F1 also rules out: a deletion can no longer be read as an insertion (pinned: `09:401` with
  `deleteContentBackward` → `null`).
- A side benefit: a box taken twice (tap, Backspace, tap again — the box keeps focus, so the first take's spent
  listeners stay) used to run the second take's first change by shape after the first; with the kind, `insertText` that
  left `1` from `10:40` can no longer be emptied by a second reader.
- Not reachable: a paste over a PART of the time whose text begins with what it replaced (select `40`, paste `405`) would
  keep only `5`. Typing cannot do it, only a contrived paste; not a finding.
- IME text (composition) as the first change rewrites the box mid-composition, which an IME may answer by inserting the
  text again. That is the same with the shape-only reading before this fix, the owner's iPhone keyboard sends digits as
  `insertText`, and no failure was seen; noted, not a finding.
- The handler's event: both `addEventListener('input', typed)` calls pass the event, so the board box and the week box
  both get the kind. `(e as InputEvent)?.inputType || ''` is safe on a plain `Event`.

## F2 — a running flash ended first — right and complete

- The real cause of F2 is fixed by `clearTimeout(t)` inside `end`: in the F2 sequence (tap, Escape, tap) the Escape
  already runs `end` (the flash's own keydown listener, and the box's Escape branch blurs it), so it is this clear, not
  the `prev()` call, that stops the first take's timer cutting the second ring short. `prev()` covers the remaining way —
  a second take while a flash is still running — and removes the first flash's listeners too, so none pile up.
- No temporal-dead-zone throw: `end` refers to `t`, declared after it, but nothing can call `end` between the
  `addEventListener` calls and `const t = setTimeout(…)` (adding a listener fires nothing).
- `_sugEnd` is deleted only when it is still this flash's `end`, so an old timer can never delete a newer flash's handle.
- A box redrawn between the tap and the key: the new box has no class, no `_sugEnd` and no listeners; the old, detached
  box's timer removes a class and two listeners from a node nobody sees and lets it go after 1.2 s. Nothing leaks past
  that. `void el.offsetWidth` on a detached node is harmless.
- The walkers' fix (HEAD~1) is kept whole: any input or Escape ends the ring. A value written by `firstTypingReplaces`
  raises no input of its own, so it cannot end anything twice.
- The new test pins F2 at the right moments (0.9 s into the second take, 1.5 s after the first — the old timer would have
  ended it at 1.2 s).

## Checked beside it, fine

- Listeners across takes on the board box: Escape puts the box back and blurs it (`textedit.ts`, D1011 branch), so
  `leave` removes `typed`, `enter` and itself before any second take. Tap → Backspace → tap (no blur) leaves two `leave`
  and two `enter` listeners; leaving then raises `change` twice, and the second is refused by `txtSet` as the same value
  (`was === v`) and reverts the box to that same value — no second history line, nothing visible.
- The week box: `done` on blur removes `typed`; a second take adds a second `done`, harmless.
- `save` still checks the box is in the page, so a redrawn-away box raises no `change`.
- F3's six comment and test-name corrections say what the code now does; no code changed with them.
