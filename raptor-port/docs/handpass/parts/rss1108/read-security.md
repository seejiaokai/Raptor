# The security read (D1411) — React Doctor on the shell, the state and the windows (8 Nov 26)

Brief: `docs/superpowers/briefs/2026-11-08-rd-shell-state-read-brief.md`, "The security reader's part". A fresh Opus 5.5
reader looking only for holes, blind to the two code reads. Read of `git diff 7744e66db 969042adb -- raptor-port/src`.
Saved as it came back.

**Findings**

There are no high or medium findings: neither change to `raptor-port/src/state/perms.ts` lets any envelope through that was refused before.

**Low: the posting-pass check can now throw where it used to return** (`raptor-port/src/state/perms.ts` lines 1057–1060). You asked whether it throws where it did not, and in one corner it does.
- **Cause.** `passOutcomeOf` passes any string in `poOutcome` through as the outcome. `PASS_FIELDS` is a plain object, so `PASS_FIELDS[outcome]` also finds keys every object inherits. For `toString`, `constructor`, `valueOf`, `hasOwnProperty`, `isPrototypeOf`, `propertyIsEnumerable`, `toLocaleString`, `__proto__` and the four `__define/__lookup` ones, `fields` comes back as a function (an object for `__proto__`). That is truthy, so it gets past `if (!fields || !b || !f)`.
- **What changed.**
  - Old code reached `fields.includes(k)` only when some field differed, and then it threw.
  - When no field differed, old code went on to the `marked` test, which falls through to the Delete branch. It refused, or allowed if the man already carried `deleted/archived/archivedBy:'del'`.
  - New `new Set(fields)` throws "not iterable" at once, before the loop, in every case.
- **Effect.** Only the case of a person change with no difference visible to JSON (a key set to `undefined` against one absent, or a NaN) moves from refuse/allow to throw. Such a change can exist, because `deepEqual` treats `{a: undefined}` and `{}` as different.
- **Concrete failure.** None reachable. The throw is caught by the commit's own try (`command/commit.ts` 284 → catch → rollback → `errResult`, reason `'invalid'`, one console error). That is the same fail-closed path as a returned refusal. The app writes `poOutcome` only from its own outcome choices (`leavewar/state/store.ts` 1990, 2256), so only a hand-made record could carry such a name. The one answer that changed went from allow to refuse, never the other way.
- **Optional hardening fix.** It gives a plain refusal again and also closes the older inherited-key lookup:
  `const fields = outcome && Object.prototype.hasOwnProperty.call(PASS_FIELDS, outcome) ? PASS_FIELDS[outcome] : undefined`

**Holes that were there before this change and are no worse**

- **Before this change:** `PASS_FIELDS[outcome]` reads inherited keys. It always failed closed on a real field change; the fix above removes it.
- **Before this change:** for any man whose posting the pass marks done, the pass may change his existing account row in every field but pid, role and name, or delete it, whatever the outcome (lines 1085–1087). That includes SANS and a posting with no outcome (`'none'`, which is a truthy string and so lands in `posted`), neither of which writes an account row. In practice it can switch `on`/`offBy`, or remove the row. Only the system actor's `lw.postoutRun` reaches it.
- **Before this change (database step):** the medical-document PDF frame in `ui/DocViewer.tsx` is not sandboxed. The new disable comment is true today, because filing accepts only PDFs and images and the frame shows the browser's own copy of the file. Once documents come from a shared store, the type the frame serves must be pinned to the stored kind.

**What I checked and found nothing in**

**`stampForged` / `firstFor` (lines 827–829): same answer for every input.**
- `halvesOfCode` always returns a fresh array of the literals `'am'`/`'pm'`, whatever `code` is: string, number, null, undefined, array, object, a "*"-ended or "*"-started string, empty, or a Symbol.
- Both sides of the comparison come from it, so `includes` and `Set.has` compare the same two strings the same way (SameValueZero).
- `String(code)` is called the same number of times, on the same values, in the same order, so a value whose conversion throws throws in both.
- `new Set` of a real array cannot throw, and the list is never changed after the Set is built.
- I tried a 19×19 grid of codes in a throwaway script: zero differences.
- The same-record, re-typed and new-bid branches and the decided-by check are untouched.

**`postingPassViolation` people branch: same answer for every other input.**
- Overseas, SANS and Delete give identical allow/refuse for marks set, for fields outside the outcome's list (callsign, role) and for quals besides `san` changed.
- `none`, `transfer`, `''`, `length`, `name` and anything else not on the object are refused at `!fields` before the Set, as before.
- Object keys are strings, field names are strings, there is no repeated or empty list, and `PASS_FIELDS` is never changed.
- I scripted every outcome against seven kinds of before/after: the 24 differences found were all the inherited-key, no-visible-change corner above.

**Unit tests.** `src/leavewar/postout-roster.test.ts` and `src/leavewar/m4sec.test.ts` both pass, 53 tests.

**Other files of the change: does any touch sign-in, who may do or see what, or what one person can see of another?**
- **Sign-in: none.**
  - `main.tsx` only re-points the save-indicator import.
  - `GuestApp.tsx` only swaps its mark for `TalonMark`, which has the same markup, character for character.
  - Shell's Sign out and the access flow are untouched.
- **Who may do what: only `perms.ts`.**
  - `Shell.tsx` and `Drawer.tsx` add disable comments and aria labels; the admin tabs' `hidden={!admin}` and the drawer's role filter are unchanged.
  - `InputsCal.tsx` changes only the highlight chips' import; its `isMe`/`mayDeleteInput` use is unchanged.
  - `DocViewer.tsx`'s `mine` gate is unchanged.
  - `person-delete.ts` (the guard against an undo bringing a deleted man back) and `people-settings-commit.ts` gain comments only.
  - `accounts-ui.test.tsx` only re-points an import; no assertion changed.
- **What one person sees of another: read the same way, no change in answer.**
  - **Notices** (`state/notices.ts` `noticePass` — who each bell tells about an input): `was` and `is` come from `ids()`, always `String[]`. Both Sets are built after the lists are final and are never changed in the loop, so the same people get the same lines.
  - **Change history and undo wording** (`state/changelines.ts`, `undo/describe.ts`, who was added or taken off): built from string lists, same answers.
  - **Insights** (everyone's sorties and work hours): the builder moved to `ui/insights-html.ts`, byte-identical to the old one. It still escapes every name, and `INSIGHTS_ALL` is still a live import from `./pops`.
  - **Medical documents** (`DocViewer.tsx`): only `role="presentation"` and a comment.
- **One HTML sink comment checked:** the new comment on `Drawn` in `ui/icons.tsx`'s `dangerouslySetInnerHTML` is true. `Drawn` is private and only ever given the fixed glyph constants.
- **Not access control:** `noticeseen.ts` (a person's own read marks; `ids` is always a string array on load) and `flyplan-model.ts` `only()` (a shape check against fixed key lists) are unchanged in answer.

I read the brief, the `perms.ts` diff and both checks whole with what feeds them, the commit gate's handling of a thrown check, and the full diff of the other 55 files. I opened nothing under `docs/handpass/parts/rss1108/`. I changed no file; the throwaway script was in the scratchpad only.
