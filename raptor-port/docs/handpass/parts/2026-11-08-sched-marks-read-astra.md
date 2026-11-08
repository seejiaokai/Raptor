# Astra's final code read — chat 13, 8 Nov 26

*(Saved verbatim from his final message — `codex exec -m gpt-6-astra`, reasoning high, read-only; brief `docs/superpowers/briefs/2026-11-08-sched-marks-code-read.md`, commit `19551d882`. Blind to Sol 6.1's and the fresh Opus reader's reads. Dispositioned in the evidence sheet §13.)*

**Three P2 findings in the waiting-list navigation.** I found no defect in the new Unavailable mark or the icon replacements in the paths traced. Reading **(d)** overstates the refusal coverage.

References below are to **`19551d882`**, compared with **`f9267b2fe`**. These are source-established failures; the host should drive the reproductions below. The permitted unit test could not start because the read-only environment blocked its temporary directory. I changed no files and remained blind to the other results.

**1. P2 — SANS changes gain a link with no destination**

**Host reproduction**

1. File a SANS availability on a future day and publish that day.
2. Change the availability’s remarks.
3. Open that day’s **To go out** list on Edit Schedule.
4. Tap the availability’s change. Repeat on the board.

**Expected:** the new fallback is offered only for a row the current surface can address. SANS should retain its previous non-clickable entry unless a SANS destination is deliberately implemented.

**Code produces:** a clickable entry, followed by “That input is not shown on this day”, although its SANS card is visible.

**Cause:** [pendlist.ts:218](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/src/ui/pendlist.ts:218) treats date coverage as sufficient for an `iu:` destination. SANS cards emitted by [html.ts:986](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/src/ui/html.ts:986) have no `data-inprow`. Neither lookup in `histbubble.ts:144–166` can find them. The board uses the same card builder.

**Main:** the pending entry was non-clickable. This is a regression introduced by the fallback.

**Exact fix**

1. Import `listedUnavail` and `listedPersonal` into the pending-list module.
2. Require one of those predicates, as well as date coverage, before constructing fallback `iu:` keys.
3. Preserve existing programme destinations.
4. Add a test using a newly filed, published, then edited SANS availability. Assert that its pending entry has no new fallback button on either surface.

**2. P2 — A Personal Inputs destination can remain folded, or be absent altogether**

**Host reproduction**

1. File a Monday–Tuesday Meeting with its Ground Programme row on Monday.
2. Publish Tuesday.
3. Change the Meeting’s remarks.
4. Leave Tuesday’s **Personal Inputs** section folded.
5. Open Tuesday’s **To go out** list and tap the Meeting’s change. Repeat on the board.
6. Repeat as a member using Tuesday’s working draft on View-only Sched.

**Expected:** on the scheduler’s surfaces, the tap opens Personal Inputs and reaches the Meeting’s row. A member must not receive a link to a section their page does not draw.

**Code produces:** the new fallback points to the input, but the scheduler’s section stays folded. On View-only Sched, Personal Inputs is absent. The jump consequently reports that the input is not shown.

**Cause:** the new keys reach [interactions.ts:163](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/src/ui/interactions.ts:163), which opens Personal Inputs only when `acc` is neither `u` nor `g`. This input is `g`, despite having a Personal Inputs row on Tuesday. Both renderers omit folded rows: `html.ts:2208` and `board-html.ts:825`. Separately, `html.ts:2282` omits Personal Inputs entirely when `ed` is false.

**Main:** this details-only pending entry had no fallback button. The older jump handler’s assumptions become a new failure through this change.

**Exact fix**

1. In `jumpToChange`, replace the filing-state test for opening Personal Inputs with `listedPersonal(inp)`.
2. Keep that opening before `notify()` and the deferred destination lookup.
3. Make fallback eligibility reflect the current surface: do not emit a Personal Inputs fallback for View-only Sched, which draws no such section.
4. Test the Monday–Tuesday case with Personal Inputs initially folded on both scheduler surfaces.
5. Test the member’s working draft separately, ensuring it receives no unusable fallback link. Keep Unavailable links working there.

**3. P2 — Filing changes still discard the new jump keys**

**Host reproduction**

1. Publish a future day.
2. File a new **Other**, choosing **Goes to → Unavailable**; complete any OIL question.
3. Confirm its Unavailable name carries the waiting mark.
4. Open the day’s **N pending → To go out** list.
5. Repeat with a Meeting published on Ground Programme, then **Reject → Unavail**.

**Expected:** each waiting-list entry reaches its existing Unavailable row.

**Code produces:** an inert entry claiming the change has no place of its own, despite the visible marked row.

**Cause:** [pendlist.ts:382](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/src/ui/pendlist.ts:382) computes `inputWords`, including the new keys, but discards that result when filing wording takes precedence. The later filing return at line 482 hard-codes `jump: false`. A Ground removal paired with filing similarly returns false at line 451. A filing-only change need not enter `inputWords` at all.

**Main:** the same failure exists. This is an incomplete repair of the navigation promise expressly included in this review.

**Exact fix**

1. Extract fallback destination resolution from `inputWords` into one helper taking the day and pending item.
2. Resolve the input through `inputIdOf`, preferring the paired live record where supplied.
3. Require a live record covering the day and a row drawable on the current surface, including findings 1 and 2’s restrictions.
4. Preserve the person-specific key and split-record-first ordering.
5. Apply the fallback after choosing the entry’s wording, including filing-only entries and paired Ground removals. Preserve valid programme jumps.
6. Keep deleted and moved-off inputs non-clickable.
7. Add production-writer tests for new Other-to-Unavailable, filing-only Ground-to-Unavailable, and rejected-to-Unavailable. Assert both the rendered button and its destination, not merely the generated key.

**The builder’s readings**

| Reading | Verdict | Settling code |
|---|---|---|
| **(a) One list and per-pass memo** | **Supported**, after the normal repaint; the acknowledged caret deferral remains. | `publish.ts:214` counts `dayPendingItems`; `460–468` derives marked IDs from it. `885–891` clears the outer read-pass cache in `finally`. It does not survive Undo, Redo, reload, publication or navigation. |
| **(b) Excluded places** | **Supported.** | `html.ts:2384` excludes draft days and frozen rendering; the callers exclude Personal Inputs. `board-html.ts:741` excludes OIL Earn. Issued versions and saved-plan looks enter the frozen rendering wrapper. Unchanged inputs yield no matching ID. |
| **(c) Read-only board mark** | **Supported.** | `board-html.ts:741–745` supplies the attribute to the read-only name span as well as the editable button. The stylesheet outlines either. |
| **(d) Every refusal distinguishes the two reasons** | **Contradicted as an all-door claim.** | Several early refusal paths below never call the new message selector. |
| **(e) Moved `inputIdOf` is unchanged** | **Supported for valid pending items.** | `publish.ts:443–448` preserves the address order, prefix test, decoding and result. The added null guards only make invalid arguments safer. |
| **(f) Every new jump lands on a drawn row, never a look** | **Contradicted** by findings 1–3. The **never-a-look** part is supported. | `interactions.ts:160` leaves the selected preview; `histbubble.ts:128–166` excludes preview/frozen destinations. |

For **(d)**, these are the actual doors:

| Door | What I found |
|---|---|
| Input window: new, edit, delete, re-date and person change; Goes to; inline input edits | The relevant guards use `protectedInput`, checking the existing record and destination where applicable, and issue the new grey refusal. |
| Medical segmentation, trimming, tails and upchit removals | The changed preflights use the new message and `blocked` kind. |
| Store backstop, including input writes reached through dragging | A protected write reaching `runInputWrite` gets the new message and command rollback (`store.ts:202–212`). |
| Accept, → Unavail and Reject | **Exception.** `slots.ts:496` and `678` return false before a write. `interactions.ts:1042–1050,1146` supplies its older warning, including “load that week first” or “can’t be changed here right now”. The changed store message is never reached. |
| Leave War approve, change/send back, file and delete | **Exception.** `sync.ts:481,563,702,892` retains “locked week” reasons without distinguishing unreadable from older-format. |
| Leave War move | **Exception.** `sync.ts:923` returns `window`; `Matrix.tsx:83` says “That lands outside what you can edit — pick another day.” |
| Person deletion | **Exception.** `person-delete.ts:159–174` retains its own “can’t be changed” / “can’t be read” messages, without the reporting instruction. |
| Publish | The engine guards select the unreadable message correctly (`publish.ts:485,1406`). The week’s notice replaces its ordinary controls. The board has a separately rendered sign-off strip, so “the board draws only the notice” is not a sufficient reachability proof. |

The build brief at lines **104–106 explicitly retains doors with their own true reasons**. I therefore report these as retained exceptions, rather than additional newly introduced findings. **Whether that exception should give way to a literal every-door interpretation of D1785 is the owner’s to decide.** The report must not describe current coverage as universal.

**Explicit negatives**

These are code-read negatives, not claims of a completed browser walk.

| Surface or path checked | Result |
|---|---|
| OIL Earn: earning inputs and ordinary non-earning leave | I checked both and found no new waiting mark or changed OIL control. |
| Original, later issued versions and saved-plan looks, on week and board | I checked the frozen wrappers and found no new Unavailable waiting mark. |
| View-only Sched’s issued face; member and guest restrictions | I checked these and found no new waiting mark or editing control. The Personal Inputs navigation exception is finding 2. |
| Read-only board | I checked the name-span path and found no missing mark. |
| Leave, medical, OD, Course, Attach and Other under Unavailable | I checked their shared render paths and found no missing mark call. |
| Shared inputs, person additions/removals, moves between inputs, replacement records and split records | I checked the pending-ID derivation and per-person faces and found no missing marked ID in these paths. |
| Deleted or moved-off inputs | I checked the new fallback’s date/existence check and found no new destination assigned solely because an old record existed. |
| Amendment colour, type tint, CX, LATE and keyboard focus | I checked the added attributes and CSS and found no changed fill, overwritten edit title or displaced existing tag. Visual fit still needs the host’s pictures. |
| Pending counts, publication snapshots, persistence and OIL calculations | I found no new writer or changed stored representation introduced by the marking helper. |
| Damaged-week day notices: edit week, view week, issued face and board | I checked their shared notice selection and found the required unreadable text. Older-format notices retain their separate wording. |
| Version selector, week banner, board banner and wave-template eye | I checked the shared drawing and callers and found no missing replacement or changed navigation control. |
| Hidden warnings: week and board, scheduler/member, live/issued/look | I checked order, stored index, strike-through, typed ✕, Reset drawing and permission gates and found no defect. Clicking an SVG descendant still reaches the existing button through `closest`. |

I found no change worsening the two acknowledged older behaviours: caret-held panel repainting, and the damaged-week demo rendering in next-week preview, print and spreadsheet export.

**Remaining host checks**

Beyond the finding reproductions:

- Publish a day, change an Unavailable input, then **Undo → Redo → reload → another week → back**. After each completed repaint, compare the row mark with its pending entry. Publish AL1: the waiting mark must clear. Edit again: it must use the next amendment colour.
- Split one person from a shared Unavailable input. From both waiting-list openers, verify the tap reaches that person’s new record first. Repeat while a version look is open; the tap must return to the working copy.
- On a freshly saved week, damage one stored day row and reload. Check every day’s notice, then new/edit/delete/re-date refusals from another readable week. Check Accept separately against the retained exception above.
- Hide and restore warnings on phone and desktop by pressing the drawn arrow itself. The line must retain its position; a member must have neither control.
- Compare phone and desktop marks, type pills and preview labels. Repeat a board edit with the caret held, then blur: the deferred panel must catch up.

**Tidiness — filed, not fixed**

- **Repeated:** the newly added person-first input-key construction repeats the construction in `changesjump.ts:44–45`. One shared destination helper could hold it.
- **Wrong comment:** `pendlist.ts:214` implies Personal Inputs wears the new waiting mark. It deliberately does not; the comment should distinguish the navigation destination from the marked Unavailable row.
- **Unused:** I found no newly unused declaration among the changed lines.

**Rulings:** no new owner ruling in this review.  
**Walk:** not run, as instructed; no test pass claimed.