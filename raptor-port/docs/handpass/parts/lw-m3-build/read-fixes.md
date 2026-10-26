# The M3 build's FULL check — the narrow read of the code read's fixes (commit 01ec92551)

Read 25 Oct 26 by a fresh Opus reader who did not write the fix and has not seen the chat that did. Scope: `git show
01ec92551` (its `src` changes and its two test files), read against `read-opus.md` F1–F8, with every reader of what changed
searched across `raptor-port/src` (`inpDetailKey`, `warCounts`, `warsOwn`, the `unavoff` part, `panelLift`, `commitNewInput`'s
`toGround`). Read only — no project file changed but this one. Where a claim needed proof it was run as a scratch test
OUTSIDE the repo, against the source (the scratchpad's `nr/src/leavewar/probe1.test.tsx` with `nr/vitest.config.mjs`, and
`nr/r2/probe2.test.tsx` with `nr/vitest.raptor.mjs`); each finding says which. `m3read.test.tsx` (11) and
`bidbubble.test.tsx` (38) were run alone and pass. Not a finding by D56: a signature stored before the fix over a day
already pending on an Attach (its fingerprint now carries the To) — demo data on an unmerged branch.

**3 new findings (one a regression the F5 fix made), 0 fixes wrong for the finding they answer except F5.**

## Each fix against its finding

| # | Right and complete? | What it touched beside it |
|---|---|---|
| F1 | **Yes.** `inputedit.tsx:1042` files `acc:'u'` whatever the panel; `:1081` lands on the programme only when not `'u'`; `:2675` says "Input filed under Unavailable". The one-man save (`:2663`, `toGround = ctx==='g'`) and the several-people save (`commitInput` → `commitNewInput(…, false)`, `:2082`) now agree. The medical clash save (`:2723`) passes `toGround` too, but a medical never files `'u'` (`filingOf`), so it is unchanged. ALL AVAIL / ALL still never `'u'` (`!isSpecial`). | The OIL question is asked from the draft (`oilGate`, `:2836`), not from where it lands — still asked. Its row is on the Unavailable list (`board-html.ts:840`, `html.ts:2231`: `isUnavail(type) || acc==='u'`), not on the programme — probe1: `acc 'u'`, no ground row, line "Ranger · Other added · 14 Jul (under Unavailable)". A course from that panel now goes under Unavailable too, as the read foresaw (D1372). Nothing stored changes. |
| F2 | **Yes.** `absences.ts:129` adds `!inputSilent(row)` for a commitment; a course / OD / leave / medical still count by kind (Q1 untouched, as the read said). | Every reader goes through `warCounts`: the index (`contribsOfInput :193`, `sync.ts:196–206, :248`), the signature (`absences.ts:243` — empty when it stops counting, so the index rebuilds when CX goes on or off) and Undo's landing (`undo-wire.ts:249`, reads both sides). Faces copy `cx`/`info` (`inputs.ts facesOf`). The clash and bid-replacement gate reads `warVisible`, untouched. |
| F3 | **Key and change line: yes. Not complete — R3.** `inputs.ts:212` adds `to` only for an Attach that has one; `changelines.ts:165` writes "· to" with from → to. probe2: a published day with an Attach under Unavailable, To 145 → 149 Sqn: 0 → 1 pending, sign-offs fall, the issued face keeps "145 Sqn". | `inpDetailKey`'s readers are `frozenInputMatch` (both sides keyed by it, the frozen side a full JSON copy — `publish.ts:536`), `publish.ts:312` (`bare`) and `:667` (`fp`, both sides at read time). **An unchanged published day does not read pending:** an Attach keys the same on both sides, every other kind's key is byte for byte as before. The "To go out" list (`pendlist.ts inputWords`) was not taught the field — R3. |
| F4 | **Yes.** `changelines.ts:107` — only a leave is the war's decision; read by `inputLines :109` and `warInputLines :302`. | A commitment deleted inside a war command now reads "deleted", not "approval taken back"; the war cannot change a commitment anyway (`dayview OFF_WAR`). `changelines-lw.test.ts` round 2 still holds (OD has no `acc`, so no tail). |
| F5 | **No — R1.** On a desktop the fix works (a tall panel at `top:96` ends at most `innerHeight − 24`). On a phone it stops the lift it was meant to keep. | `panelLift` is read when the bubble is raised (`Matrix.tsx:1535`) and on scroll (`:1649`). |
| F6 | **Yes for Goes to and for Reject — and once only:** one `else if` chain (`notices.ts:102–108`), so a Reject (`'u'→'r'`) still says "Taken out of Unavailable" once (probe1 control: `[{"k":"unavoff"}]`). **Too wide — R2.** | Only `noticePass` writes it, on a user's own command (`sched-commit.ts:440–470` — never a restore or a seed). The week load keeps `'u'` (`store.ts:658, :1008`), the holder base keeps `'u'` (`holderbase.ts:196`). A plan switch or a load that moves an input out of Unavailable now says so, as the opposite move already did. Records: D815's full row, reading (2) ("no button does it"), is overtaken and not yet marked; `ui-contracts.md` §The bell's list of notices is general enough to stand. |
| F7 | **Yes.** `describe.ts:82`. | No test pinned the old words. |
| F8 | **Yes.** `changelines.ts:127`. | Reads the live `acc` (`accNow`), so a war-filed course or Other, and a course from the Inputs page, now end "(under Unavailable)"; no reader parses the line's words (`histbubble.ts`, `changesmodel.ts` key by ids). |

## New findings

### R1 — On a phone, the manning bubble now hides under a resting day panel (the F5 fix undid [LW-NIGHT1025-OLDER] (g))

- **Steps.** A phone (402 or 393 wide): Leave War → press a date's header (the day panel rests at the foot, two-thirds high)
  → tap a cell above it and place a bid that turns a row red (W1 9's set-up). Before the fix the bubble stood 12 px above
  the panel (W1 9: panel top 285 of 874, bubble y 227–273). Now its bottom is the stylesheet's 12 px from the foot, inside
  the panel's area, and the panel (z-index 410, `22-float-windows.css:10`) is drawn over the bubble (z-index 55,
  `chrome.css:1206`): he never sees "This bid: …".
- **Cause.** `Matrix.tsx:1482` lifts only where `r.bottom >= window.innerHeight − 2`. A phone's resting panel never reaches
  the foot: `.floatwin` on a phone has `bottom:12px` (`22-float-windows.css:52`) and `.rests` keeps it (`:58`, `:59` — only
  `top`, `margin` and `height` are set). W1 9 measured it: top 285 + 577 tall = 862 = 874 − 12. The unit test that pins (g)
  (`bidbubble.test.tsx:473`) fakes the panel's bottom AT `innerHeight`, so it passes while the real panel fails.
- **Proved** by the code, the stylesheet and W1 9's own measurement (862 < 872 → lift 0); not walked since the fix.
- **Fix.** Ask the window's own rule instead of its geometry — only a phone's panel rests at the foot (`FloatWindow.tsx:141`
  `sheet = !!rests && phoneLayout()`): in `panelLift` start with `if (!phoneLayout()) return 0` (import `phoneLayout` from
  `../../ui/floatwin`) and drop the `r.bottom` term, back to `r.height > 0 && r.top < window.innerHeight ? … : 0`. In
  `bidbubble.test.tsx` give the (g) test a phone (`window.matchMedia` stubbed to match `(max-width:620px)` — jsdom has none)
  and the real foot (`bottom: window.innerHeight − 12`), still expecting `312px`; the F5 test keeps no stub (a desktop) and
  expects `''`. (A tolerance — `>= innerHeight − 16` — would also pass both, but lifts a desktop panel capped at
  `innerHeight − top − 12` under a tall top bar, `floatwin.ts:152`; the phone test is the one rule.) Re-walk W1 9 and the
  F5 desktop case after.

### R2 — "Taken out of Unavailable" is said when a commitment filed there is retyped to a leave, a medical or an overseas duty, which stand on the Unavailable list by their kind

- **Steps.** Signed in as Saber: Ranger's Other with Goes to Unavailable → open it, change its kind to OL, Save. Ranger's
  bell: "Taken out of Unavailable · renamed from Other" — but the OL stands on the schedule's Unavailable list (by its kind).
  The same for a course (under Unavailable by itself) retyped to OD: "Taken out of Unavailable · renamed from CSE".
- **Proved** (scratch `nr/src/leavewar/probe1.test.tsx`): OL → new parts `[{"k":"unavoff"},{"k":"title","was":"Other"}]`,
  `acc` gone; OD → `[{"k":"unavoff"},{"k":"title","was":"CSE"}]`.
- **Cause.** `notices.ts:105` now fires on any `'u'` → not-`'u'`; a retype into a kind the list draws by itself drops
  `acc` (`inputedit.tsx:1390`, "a retype to a kind that is never filed there"), so `acc` leaves while the input stays on
  the list. Before the fix this move said nothing of the filing (only the rename).
- **Fix.** `else if (b.acc === 'u' && a.acc !== 'u' && (a.acc === 'r' || !isUnavail(a.type))) out.push({ k: 'unavoff' })`,
  importing `isUnavail` from `../engine/inputs`; and a test beside F6's: Other (Unavailable) → OL tells no `unavoff`.

### R3 — An Attach's To changed on a published day reads only "changed" in the "To go out" list

- **Steps.** A published day holding Ranger's "Attach · 145 Sqn" under Unavailable; change To to "149 Sqn". The day reads
  1 pending, but the changes window's "To go out" line says "Ranger · Attach · 149 Sqn — changed": nothing of what it was.
  A title changed the same way reads "Event → Sports day" there (`latepub.test.tsx:1083`).
- **Proved** (scratch `nr/r2/probe2.test.tsx`): the list's words `Ranger · Attach · 149 Sqn … changed`.
- **Cause.** `pendlist.ts:231` pairs the two names only when the TITLE differs; the To is in neither the title nor any other
  pair, so no pair is made and `:248` says "changed".
- **Fix.** `pendlist.ts:231`: `if (titleOf(was.type, was.title) !== titleOf(now.type, now.title) || (isFly(now.type) && toOf(was.to) !== toOf(now.to))) pair(inpLabel(was), inpLabel(now))`
  (import `isFly`, `toOf`), so it reads "Attach · 145 Sqn → Attach · 149 Sqn"; and probe2's case as a test in `latepub.test.tsx`.

## The questions asked

1. **Does an existing published day now read pending when nothing changed?** No. Both sides of the comparison are keyed by
   the same `inpDetailKey` over full copies (`publish.ts:536`); `to` is named only for an Attach that has one. F2, F4–F8
   touch nothing the published-day comparison reads; F1 changes where a NEW filing lands only.
2. **Does an input the Ground panel files under Unavailable still get its OIL question and its row?** Yes — the question
   from the draft (`oilGate`), the row on the Unavailable list, not on the Ground Programme (probe1).
3. **Does a notice now fire twice or wrongly?** Not twice — Reject from Unavailable is still one "Taken out of
   Unavailable". Wrongly, yes, on a retype into a kind the Unavailable list draws by itself — R2.
