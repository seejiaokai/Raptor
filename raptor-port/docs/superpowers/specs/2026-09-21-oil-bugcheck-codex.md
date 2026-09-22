# Astra / Codex (gpt-5.6-sol, high) — independent bug check of the OIL build (21 Sep 26)

Read-only review of `claude/oil-auto-remove-design` against `main`. Opus 5 wrote the code; Codex did not.
Commissioned by the owner's standing cross-provider rule. Companion: `2026-09-21-oil-bugcheck-fable.md`.
The triage that decided which of these to act on is `2026-09-21-oil-bugcheck-fixplan.md`.

---

# Independent adversarial review

**Verdict: REVISE — do not merge yet.**

I found **five correctness defects capable of changing OIL money**, plus one material test-integrity problem. The most serious defects are live Leave War facts and live roster membership still changing published-day money.

## Finding 1 — Revoking a PH live removes issued OIL without republication and can defeat legacy protection

1. **Title:** Published holiday eligibility is re-read live instead of taken from the frozen evidence.

2. **Severity:** **HIGH** — wrong money and an old snapshot can be swept instead of protected.

3. **Where:** [sync.ts:911](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:911), [sync.ts:935](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:935), [sync.ts:852](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:852). The stale assertion is [oilsync.test.ts:387](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/oilsync.test.ts:387).

4. **What is wrong:** Both loaded- and stashed-week loops execute:

```ts
if (!iso || !warHolding(wars, iso) || !isNonWorkingISO(iso)) continue
```

before reading the issued `snap.d.oilev`. Therefore the live Leave War PH/off-day state can bypass both:

- the frozen `ev.earns` decision; and
- `creditFrom`’s missing-block protection.

This directly violates OIL24/OIL29 and sections 9.3/9.4. The existing test explicitly pins the obsolete behavior that revoking a PH should remove the credit immediately.

5. **Failure scenario:** Monday 13 July is marked PH. Bane has published 08:00–17:00 Duty and receives FO. An admin removes the PH event but does not reissue the schedule. `runOilPass()` skips Monday before reading its issued evidence, then the reverse pass deletes Bane’s FO. If the snapshot is legacy and has no `oilev`, the same early skip prevents `protectedDates.add(iso)`, so its standing credit is also deleted.

6. **EXACT FIX:**

   1. In the loaded-week loop, replace:

   ```ts
   if (!iso || !warHolding(wars, iso) || !isNonWorkingISO(iso)) continue
   if (liveUnsupported) { protectedDates.add(iso); continue }
   if (!dayApproved(di)) continue
   ```

   with:

   ```ts
   if (!iso) continue
   if (liveUnsupported) { protectedDates.add(iso); continue }
   if (!dayApproved(di)) continue
   ```

   2. Make the identical replacement in the stashed-week loop: only an invalid ISO should skip before resolving the issued snapshot. `oilEarnedWork()` already enforces frozen `ev.earns`.

   3. In `creditFrom`, replace:

   ```ts
   if (!ev) return false
   ```

   with:

   ```ts
   if (!ev || ev.iso !== iso) return false
   ```

   This makes the documented date binding real and protects a missing or misfiled block.

   4. Leave the forward write’s existing `warHolding(...)` check at `runOilPass` line 1129. It decides whether a new cell has a destination; it must not decide whether an existing issued credit is swept.

   5. Rewrite the test at line 387. Removing PH must leave FO standing until the evidence change is signed and published; only after that publication may the credit disappear.

7. **THE TEST THAT WOULD HAVE CAUGHT IT:** In `src/leavewar/oilsync.test.ts`:

   - Rename the existing test to `OIL24/OIL29 — revoking a PH does not move issued money until republication`.
   - Assert FO remains after `setDayEvent(..., '')` plus `runOilPass()`.
   - Assert `dayHasChanges(di)` becomes true.
   - Sign and publish the resulting OIL amendment, run the pass, then assert the cell disappears.
   - Add `OIL26 — a no-oilev PH snapshot remains protected after the live PH is removed`; remove `snap.d.oilev`, remove PH, and assert the existing cell survives.

   The current test is not merely blind: it asserts the wrong behavior.

8. **Confidence:** **certain**.

---

## Finding 2 — Archiving a person live silently withdraws their issued OIL

1. **Title:** `creditable` uses the current Leave War roster as a second money authority.

2. **Severity:** **HIGH** — wrong balance on every affected published date.

3. **Where:** [sync.ts:865](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:865), especially lines 868–884 and 892–903. The production archive trigger is [QualsPage.tsx:468](/C:/Users/User/projects/Raptor/raptor-port/src/ui/QualsPage.tsx:468).

4. **What is wrong:** `oilEarnedWork` can correctly return frozen work for an archived person, but `add` drops it when `creditable(person)` consults the live Leave War roster. Archiving through Quals removes an ordinary body from `getState().people`; unlike hidden SANS, an archived regular then fails `creditable`. The reverse sweep sees no desired cell and deletes the previously issued credit.

5. **Failure scenario:** Bane is behind a published Saturday ALL AVAIL puck and receives FO. On Monday an admin archives Bane in Quals. Roster reprojection removes him from Leave War. `runOilPass()` reads the unchanged frozen Saturday evidence, but `creditable('bane')` rejects him, so the reverse pass deletes his FO and changes his balance without any schedule amendment.

6. **EXACT FIX:**

   1. Delete:

   ```ts
   const known = new Set(people.map(p => p.id))
   ```

   2. Replace the current `creditable` body:

   ```ts
   const creditable = (id: string) => {
     if (known.has(id)) return true
     const p: any = (PEOPLE as any)[id]
     return !!(p && p.san && !p.archived && !p.special && !p.pers)
   }
   ```

   with:

   ```ts
   const creditable = (id: string) => {
     const p: any = (PEOPLE as any)[id]
     return !!(p && !p.special)
   }
   ```

   3. Do not test `archived`, `san`, `pers`, or current Leave War visibility here. Those eligibility decisions occurred before/frozen at publication; named ground crew are deliberately creditable, and hiding/archiving is not authority to rewrite an issued document.

   4. Update the surrounding comment: the guard now rejects only sentinel/non-person identities, not bodies hidden from the current roster.

7. **THE TEST THAT WOULD HAVE CAUGHT IT:** Add to `src/leavewar/oilsync.test.ts`:

   `OIL24 — archiving a person after publication does not withdraw his frozen credit`

   Publish a Saturday credit for Bane, archive `PEOPLE.bane`, run the actual roster reprojection path or `setPeople(projectPeople())`, run `runOilPass()`, and assert Bane’s FO and owned record remain.

   The existing `oilev.test.ts` test `OIL24 — who an ALL AVAIL puck stood for cannot change under the reader` is blind because its `figure()` helper calls `oilEarnedWork` directly and never passes through `creditable` or the reverse sweep.

8. **Confidence:** **certain**.

---

## Finding 3 — A cancelled or deleted accepted-input row still earns through the input half

1. **Title:** The frozen input projection ignores whether its landed source row was cancelled, marked info-only, or removed.

2. **Severity:** **HIGH** — cancelled work receives FO/HO.

3. **Where:** [oilev.ts:278](/C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts:278), [oil.ts:178](/C:/Users/User/projects/Raptor/raptor-port/src/engine/oil.ts:178), and [oilmode.ts:313](/C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:313).

4. **What is wrong:** `dayOilWork` correctly skips every `g.src` row so the input’s answer owns the claim. But `oilEarnedWork` then accepts that input solely from `acc`, `win`, and `ans`. It never checks the issued day for the corresponding `ground[].src` row or its `cx`/`info` state. `oilEligible` makes the same omission. This violates OIL28/OIL31: cancellation and info-only are structural ineligibility, and `allow` must not resurrect them.

5. **Failure scenario:** Bane files 08:00–17:00 Training and answers Yes. It auto-lands as a ground row with `src` and `acc:'g'`. The scheduler clicks CX on that row and publishes. The schedule half correctly skips it, but the frozen input half still adds 08:00–17:00 and pays Bane FO. Deleting the landed row while leaving `acc:'g'` has the same result.

6. **EXACT FIX:**

   1. Add this exported helper in `engine/oilev.ts`:

   ```ts
   export function oilInputEligible(day: any, inp: OilInputEv): boolean {
     if (!inp.asks || inp.acc === 'r' || !inp.win) return false
     if (inp.acc !== 'g') return true
     const row = (day.ground || []).find(
       (g: any) => g && String(g.src || '') === inp.iid
     )
     return !!row && !row.cx && !row.info
   }
   ```

   2. In `oilEarnedWork`, replace:

   ```ts
   if (!inp.asks || inp.acc === 'r' || !inp.win) continue
   ```

   with:

   ```ts
   if (!oilInputEligible(day, inp)) continue
   ```

   3. In `ui/oilmode.ts`, import `oilInputEligible`.

   4. Replace the claim branch in `oilEligible`:

   ```ts
   if (inp) return !!(inp.asks && inp.acc !== 'r' && inp.win)
   ```

   with:

   ```ts
   if (inp) return oilInputEligible(d, inp)
   ```

   5. No serializer change is required: `cx`, `info`, and row deletion are already frozen/canonical day content.

7. **THE TEST THAT WOULD HAVE CAUGHT IT:** In `src/engine/oilev.test.ts`, add:

   `OIL28/OIL31 — allow and member Yes cannot resurrect a cancelled accepted-input row`

   Create an input with `acc:'g'`, a matching ground row with `src:iid` and `cx:true`, member answer Yes, plus an admin `allow`; publish and assert `figure(...)` is null. Repeat with `info:true` and with the matching row absent.

   In `src/ui/oilmode.test.tsx`, assert that the cancelled input-derived puck is inert and has no `data-oilp`.

8. **Confidence:** **certain**.

---

## Finding 4 — Tapping a puck while its item/day is masked silently destroys the decision underneath

1. **Title:** The click path calculates a new person decision from the masked `false` state.

2. **Severity:** **HIGH** — a hidden decision is silently lost and can later change money.

3. **Where:** [oilmode.ts:125](/C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:125), [oilmode.ts:196](/C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:196), [oilmode.ts:211](/C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:211), and [board.ts:1148](/C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:1148).

4. **What is wrong:** `oilPersonOn` returns false when a blanket or item mark is active. `toggleOilPerson` then treats that masked false as the underlying decision and may delete a stored `deny` or create an `allow`. Person pucks remain tappable under both masks. The item handler blocks blanket-time item taps, but the person handler has no equivalent guard.

5. **Failure scenario:** Bane has a stored `deny` on Family Day. The admin turns on “Nothing today earns”; Bane appears dim. While the blanket is active, the admin taps Bane. `want` becomes true, the default is true, and the code deletes the hidden `deny`. The puck still appears dim because the blanket masks it. When the blanket is removed, Bane unexpectedly earns and can be paid.

6. **EXACT FIX:**

   1. In `toggleOilPerson`, insert this before `decOf(di)`:

   ```ts
   if (!oilItemOn(di, item)) return false
   ```

   2. Harden `toggleOilItem` too by replacing:

   ```ts
   if (!item) return false
   ```

   with:

   ```ts
   if (!item || oilBlanketOn(di)) return false
   ```

   3. Import `oilItemOn` in `ui/board.ts`.

   4. In the `[data-oilp]` handler, before calling `toggleOilPerson`, add:

   ```ts
   if (!oilItemOn(di, item)) {
     e.stopPropagation()
     return toast(
       oilBlanketOn(di)
         ? 'Nothing on this day earns — turn that off first'
         : 'This item earns nobody any OIL — turn the item on first'
     )
   }
   ```

   5. Keep the stored decision untouched; do not reinterpret a masked state as `allow` or `inherit`.

7. **THE TEST THAT WOULD HAVE CAUGHT IT:** In `src/ui/oilmode.test.tsx`, add:

   `OIL9 — puck taps cannot change decisions masked by the day blanket or item switch`

   Create a deny through the real puck click, enable the blanket, click the same puck, and assert the exact `oild.people` object is unchanged. Disable the blanket and assert the deny still applies. Repeat with the item switched off.

   The current OIL9 test only turns the blanket on and back off; it never operates a masked puck.

8. **Confidence:** **certain**.

---

## Finding 5 — A dormant leave/medical/OD input still excludes a person from ALL AVAIL

1. **Title:** `availableFor` applies `acc !== 'r'` only to commitments, not away-making inputs.

2. **Severity:** **HIGH** — a person can be omitted from a frozen sentinel and underpaid.

3. **Where:** [sync.ts:737](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:737).

4. **What is wrong:** The code says:

```ts
const away = isAway(inp) && !canWork(inp.type)
const commit = isPersonal(inp.type) && inp.acc !== 'r'
```

For leave, medical, and OD, `isAway(inp)` remains true when `acc === 'r'`. But `inputDormant`/`inpShow` define every removed input as silent. The source comment also claims a removed commitment is dormant; the implementation applies that only to `isPersonal`.

5. **Failure scenario:** Bane has a rejected/dormant LL input overlapping Saturday’s Family Day. The only programme entry is ALL AVAIL. At publication `availableFor` still treats the LL as active, omits Bane from the frozen `sent[item]`, and he receives no FO even though the input speaks nowhere else.

6. **EXACT FIX:**

   1. Replace the start of the `INPUTS.some` callback with:

   ```ts
   if (inp.person !== id || inp.acc === 'r') return false
   const away = isAway(inp) && !canWork(inp.type)
   const commit = isPersonal(inp.type)
   ```

   2. Leave the existing date/window checks unchanged.

   3. Update the function comment from “a commitment ... `acc === 'r'`” to “any input ... `acc === 'r'`”, matching `inputDormant`.

7. **THE TEST THAT WOULD HAVE CAUGHT IT:** Add to `src/leavewar/oilsync.test.ts`:

   `OIL13/OIL14 — dormant LL, medical and OD inputs do not remove a person from ALL AVAIL`

   For each representative type, create an overlapping `acc:'r'` input, assert `availableFor(...)` contains Bane, publish the sentinel row, and assert Bane receives the expected FO/HO. The existing dormant test covers only `Training`, which follows the `commit` branch and therefore misses this defect.

8. **Confidence:** **certain**.

---

## Finding 6 — Several OIL tests bypass the production routes they claim to prove

1. **Title:** Replacement-style fixtures and legacy signature writes leave the suite blind to production-only defects.

2. **Severity:** **LOW** — test-integrity defect, but it concealed multiple HIGH defects above.

3. **Where:** [oilev.test.ts:51](/C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.test.ts:51), lines 53–54, 105, 147, 174 and 213; [oilmode.test.tsx:75](/C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.test.tsx:75), lines 179–181, 209 and 241; [oilsync.test.ts:51](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/oilsync.test.ts:51), plus its direct row/input helpers and edits.

4. **What is wrong:** The problematic helper classes are:

   - `sign()` writes `signOf(di)[role]` directly. Production calls `setSign`, which creates `currentBind`. These helpers exercise the legacy “no binding means accepted” path and prove nothing about OIL signature invalidation.
   - `figure()` in `oilev.test.ts` calls `oilEarnedWork` directly. It bypasses `desiredOilCells`, `creditable`, `protectedDates`, and the reverse sweep. It missed Finding 2.
   - Most engine tests replace `DAYS[di].oild` wholesale. The board mutates it through `toggleOilPerson`, `toggleOilItem`, and `setOilBlanket`; this missed Finding 4 and previously missed the documented alias bug.
   - `claim`, `plant`, `input`, `groundRow`, `addRow`, and `ownHour` insert or replace arrays directly. Production uses `commitNewInput`/`commitInputEdit` and scheduler commands, which mint IDs, recreate accepted rows, apply `acc` transitions, advance baselines, and notify in a defined order.
   - Several publication tests mutate row fields directly and then use the unbound `sign()` helper, so they do not prove that a production edit invalidates and then renews a signature.

   Direct malformed-`SCHED` fixtures used specifically to simulate legacy/corrupt persisted books are legitimate adversarial fixtures; I do not count those as false production-route tests.

5. **Failure scenario:** The current OIL9 suite passes while the real board can delete a masked deny. The OIL24 sentinel-freeze test passes while the actual Leave War pass can sweep an archived person’s credit. Both happen because the assertions stop before the production paths containing the defects.

6. **EXACT FIX:**

   1. Replace each OIL-suite signing helper with calls to:

   ```ts
   setSign(di, 'cur', 'ignite')
   setSign(di, 'sked', 'bane')
   setSign(di, 'plan', 'stiff')
   setSign(di, 'appr', 'pump')
   ```

   Import `setSign`; reserve direct `signOf` writes only for tests explicitly labelled legacy/back-compat.

   2. For person/item/blanket behavior, use the exported toggle functions or actual jsdom clicks. Do not assign `oild` in tests claiming to cover the UI writer.

   3. Add integration variants using `commitNewInput` and `commitInputEdit`, including accepted-row recreation and `acc:'r'`.

   4. For money assertions, call `runOilPass()` and inspect the real Leave War cell/record; do not use `figure()` as a substitute.

   5. For schedule-edit publication tests, perform the edit through the board or `schedWriteValue`, then assert old signatures fail before re-signing.

   6. Keep the pure direct-object tests, but rename/descope them as algebra-only tests rather than production-path proofs.

7. **THE TEST THAT WOULD HAVE CAUGHT IT:** The tests specified in Findings 1–5, using the production routes above. In particular:

   - `OIL24 — archive after publish preserves actual Leave War cell`
   - `OIL9 — masked real click leaves oild byte-identical`
   - `OIL31 — cancelled accepted-input row produces no actual credit`
   - `OIL14 — dormant LL remains in real sentinel expansion`

8. **Confidence:** **certain**.

## Explicit aliasing answers

**(a) Other by-reference defects:** I found no second production consumer currently mutating evidence or issued snapshots by reference.

`oilEvidenceOf` returns `d.oilev` directly and `oilSentinelPeople` returns a stored sentinel array directly, while `daySnapOf` returns the stored snapshot object. I traced their production consumers: they read, iterate, map, or clone before installing anything on a working copy. `oilEvidenceKey` explicitly copies before sorting sentinel arrays, `oilEarnedWork` creates new span arrays, and `drafts.ts:liveDay` deep-clones and strips `oilev`. Therefore those references are not presently a copy-required alias.

The found alias fix at `oilEvidence`’s copied `oild` is the only demonstrated mutation alias in this evidence path.

**(b) Fixtures using non-production routes:** Yes. They are enumerated in Finding 6: direct unbound signing, `figure()` instead of the real money pass, whole-object `oild` replacement, raw input/row insertion, and raw schedule edits. Each blind spot is tied there to the real defect or risk it misses.

## Priority-area disposition

- **P1 / section 9:** Findings 1, 3, and 4 are direct failures. The three-state precedence itself works when unmasked: `allow` outranks member No, removing it restores the member answer, and ordinary cancelled schedule rows/no-times work cannot be allowed. The aggregate key is always compared and deterministic for production-generated IDs/types; I found no reachable serialization collision.
- **P2 / aliasing:** Explicitly answered above.
- **P3 / freeze boundary:** Findings 1 and 2 are the remaining live-money doors. I found no live `INPUTS` read inside `creditFrom` itself.
- **P4 / delta axis:** No additional missing-item/no-delta case found. Decisions survive draft selection, recovery, undo, and week stash by source inspection. The absent-binding normalization is safe because an earning-day evidence key includes its ISO even when otherwise empty.
- **P5 / cutover:** The schema-5 reset has the agreed coherent scope and runs before hydration. Finding 1 is nevertheless a path where a no-block snapshot can be swept before protection if live PH eligibility disappears.
- **P6 / ALL AVAIL:** Finding 5 is a wrong exclusion. I found no second money resolver: publication freezes through `availableFor`, and credit uses `creditFrom`. A genuinely empty sentinel is visible as a `0` count chip, so it is not silent.
- **Row IDs:** Normal scheduler commands mint IDs before their baseline, and `daySnap` has a backstop. I found no production snapshot path that omits both.
- **SANS:** Eligibility and timing exclusion are separate in `availableFor`; hidden-SANS storage is handled deliberately.
- **Ordering:** The OIL pass runs after command completion through notification/deferred effects; I found no half-applied production edit read.

## Limits and repository state

I did not run the app or test suite because the brief required a source-only, read-only review and test tooling could create cache/output files. Consequently I did not perform rendered geometry or runtime persistence verification.

I made no edits. During the review, the worktree independently acquired an unstaged `OUTSTANDING.md` change; I did not create or inspect it, and no reviewed implementation file changed.


