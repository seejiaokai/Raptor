# Fix read 3 — the fresh, blind Opus read (07:27–07:40 19 Nov 26)

Read of an exported copy of `claude/multi-sqn-b1-107` at `b322cad23` (the fixes `2b792ebc5..b322cad23`), brief `…-fixread3-brief.md`. Blind to the walk and to Astra's report. Saved by the night coordinator after both readers had reported, condensed by it — every finding, cause, fix, proof and negative kept, only wording shortened (the proof tests kept in the night chat's scratch folder `fixread3-opus-proofs/`).

---

Two real faults, both proven by failing tests: an admin's own leave across a move of squadron is refused while a member's goes through, and the top bar's Undo of the war's own bell-writing commands (Open for bidding, closing it, a decision) is refused once a man it told has moved. Both need a saved move of squadron, and no screen saves one yet. The month-jump fix lands correctly in real browsers at every scale tried; its one new risk, on a phone, is not proven. No file under `raptor-port/src` was changed.

## 1. An admin's own leave across a saved move is refused; a member's goes through (medium-low; `8328a3578` covers members only)
Setup: the master saves a move of Hunter (142's plain admin, `ad2`) to 149 from tomorrow (only a test can save it today). (a) Hunter files his own leave 20–22 Jul (149 days for him); (b) after the move Hunter changes the remarks on his own leave of 15 Jul (a 142 day). Both refused; with no move, allowed; Ranger (a member) in the same setup, allowed.
Cause: `state/perms.ts` `inputUnitViolation` (~1320–1322): the F2 exception is gated `a.role !== 'admin'` — `if (a.role !== 'admin' && a.personId != null && onlyMe(was) && onlyMe(is)) continue`. An admin's own input is judged by `levelInForce` in the squadron of each day; with rights read today he holds admin in neither for the far side (D2203). Contradicts the fix's own comment ("changed only by a master or by the man himself") and §11 "C R U D own". Not introduced by these commits.
Fix: drop the `a.role !== 'admin'` clause from that line; keep the role test only on the forward take-out branch above it (a member's rule); optionally, for admins, require `String(r.by) === String(a.personId)` inside `onlyMe`.
Test failing today: `proof-admin-own-input.test.ts` — 2 failed (the admin cases), 2 passed (member and no-move controls).

## 2. The top bar's Undo of a war command that wrote bell lines is refused once a man it told has moved (low-medium; the shape `013b695f8` fixed for "Undo post out", missed for the top bar's Undo)
Setup: Kestrel (`ad9`) opens bidding; Osprey is told "Bidding open". Osprey's move to 142 arrives in the shared store (a raw stored home row in the test, standing in for another device's write). Midnight passes, Kestrel still signed in. Action: Undo. Refused: "That couldn't be completed just now." — reason `member-writes-own: a bell line of another squadron's man (notices/…)`.
Cause: the Undo restores the stored image, deleting the line from Osprey's bell; Osprey is now 142's; `adminOwnerViolation` (~1830–1838) judges the deletion like any other — war lines carry `iid: ''` (`notices.ts` `noticeWar` 384), so `to !== self && !ownsHim(to)` refuses. The `atWarHome` filters cover `tellWar`, `warAudience`, `warNoticesReversed`, `postingLinesOf`, `retractPostingLines` — not the Undo's own restore. Same for closing bidding and any decision the war told a man about.
Fix: in `adminOwnerViolation`'s notices loop, before the `ownsHim` test: `if (env.origin === 'restore' && REPLAY && REPLAY(env)?.(c) && String(n.by ?? '') === self) continue` (the existing `verifiedReplay`); or, if refusing is preferred under D148, words that name the man.
Test failing today: `proof-undo-open-moved.test.ts` — no-move control passes; the moved case and the cause probe fail.

## 3. Leave War grid on a touch screen: a fill-month correction may write a sub-pixel scroll where the old code wrote nothing (low; not proven on a device)
`leavewar/ui/Matrix.tsx` ~3240–3243: `edge` is true whenever the day sits within 1px of the frozen edge, jump or not; on a coarse pointer with `colShift` the effect calls `landOnEdge`, writing up to 1px where the old code wrote only over 1px. The column window's anchor is taken only when not in motion (3066), but iOS's coast leaves lulls the 120ms rest mistakes for a stop; a write there kills the fling — roughly a few per cent of fill steps.
Fix if wanted: `if (a.edge && (fromJump || !coarse)) { landOnEdge(wrap, cell); return }`. Test: none in jsdom; a device walk (a phone fling across a month boundary while the fill draws left).

## Checked and found sound
- Month-jump landing measured (`edge-probe.cjs`, Chromium at scales 1, 1.25, 1.5, a phone at 3, WebKit phone): 11 landings 0.27–0.98px clear, never under; no second write; no loop; a manual rest within 1px moves at most 1px once on a desktop; a touch anchor without jump or column shift returns before `landOnEdge`; the pending jump and 1200ms window as before; year start a no-op.
- SEC-5 (`lwx.*`): only Archive, Restore, Restore as and Delete write it (= `LWX_DOORS`), all in `NOT_UNDONE_TYPES`; `lw.postout` returns before the second store; the posting pass runs as the app.
- Bell (`toldBy`) against `noticePass`: named before/after, filer before/after, a split-out man, deleted inputs' people and filer; a member's Undo / Redo of his own lines give the same set; a holiday line only `oilhol` parts.
- SEC-1: other read records `lwseen:` (own-only, `perms.ts:1875`), `seen:`, `noticeseen:` — no other `*seen:` prefix.
- Last-admin lock from today on every home date compares before and after, so an unrelated command never trips a squadron already short; the door's `lockProblem` counts archived men but Archive turns the account off, so door and gate agree for new data; a held posting never archives.
- SEC-4 (`daysOf`): a new man's input dated before his home row uses his earliest home (`proof-newman-past.test.ts`, kept, not a finding).
- History (`editlog.ts` `push`, `changelines.ts`): guests file in the squadron in view; master, admins and members unchanged; the `u == null` drop needs a giver with no home and no rights in view; `elogOwnUnit` and `elogWriteProblem` share `lineOk`; the master's Delete writes its bid and OIL-award lines in the other squadron's stored war; the doors' posting-window rows write no line.
- `atWarHome` sites, take-out (Astra 3): sound.

Rulings: none. Lessons: none.
