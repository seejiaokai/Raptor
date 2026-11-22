# Astra's blind read of the fixes — multi-squadron batch 1's full check (18 Nov 26)

Head: Astra (`codex exec --skip-git-repo-check -m gpt-6-astra -c model_reasoning_effort=high -s read-only`), in an exported copy of `43273f997` (app code = the fixes, `a7d0e9e22`, on step 4's `7e0a7c661`) at `scratchpad/fixread/copy`, the walk's results, the evidence sheet below its job-5 heading and every earlier reader's report removed from the copy; brief `2026-11-18-multi-sqn-b1-fixread-brief.md` (FIX-READ-BRIEF.md) as its prompt; blind to the Opus fix read (started after this one ended). Started Wed 18 Nov 26 06:40:33 MPST, finished 06:52:15. Read-only: no proof tests; it named its proof inputs for the host. Saved as it came.

---

I would return these fixes for another pass. I found **six concrete gaps**, including two ways around the account checks.

This is a read-only review of the supplied export. I changed no files and ran no tests. The failures below are conclusions from tracing the code; each includes the exact input for the host to prove. I did not read the other readers’ reports, the prohibited full-check section, or an externally pasted post-compaction handoff.

For the test inputs below, use the fresh demo-store fixture and `signInAs` helper from `units-sqn-guard.test.ts`. Reset the store between cases. File references are relative to `raptor-port/src`.

**1. P1 — A first account-list write can silently remove another squadron’s account**

Fix 1 remains incomplete.

The new check examines changed account records individually. On a fresh demo store, however, omitting a seeded account from the first stored list removes that account without producing a change record for it. The whole-list comparison added for the master catches this for masters only.

Exact forged input:

```ts
signInAs('ad2', 'a2')

const r = commitSettingsIntent('account.update', null, () => {
  for (const a of seedAccounts()) {
    if (a.id !== 'acus9') store.set(`account:${a.id}`, a)
  }
})

accountsLoad()
expect(r.ok).toBe(false)
expect(accountById('acus9')).toBeTruthy()
```

**Expected:** 142’s plain admin cannot remove Osprey’s 149 account.

**Code-predicted failure:** the command succeeds; `acus9` disappears. Every included account equals its seed, so the account loop skips it. The omitted account never reaches that loop. The master remains present, satisfying the separate master comparison.

**Cause:** `state/perms.ts:1397–1408`; contrast the whole-list handling at `1252–1259` and `1286–1292`.

**Fix:**

1. Reconstruct effective account lists before and after the command.
2. Compare the union of account IDs, including accounts missing from either list.
3. Check authority over both owners of every effective change.
4. Preserve the legitimate Undo that returns an untouched seeded list to its unstored representation.

This is a remaining gap in fix 1, not a migration problem: a fresh store can produce it now. I found no ordinary Users-panel route around its preflight refusal; this reproduction uses the explicitly requested forged-command door.

**2. P1 — The per-squadron last-admin lock is absent from the commit check**

Fix 5 protects the normal helpers, but a command can still disable the last home admin.

Exact forged input:

```ts
signInAs('ad', 'a')
expect(updateAccount('acus9', { name: 'osprey9' })).toBe(null)

const a = { ...accountById('acad9')! }
const r = commitSettingsIntent('account.update', null, () => {
  store.set('account:acad9', { ...a, on: false })
})

accountsLoad()
expect(r.ok).toBe(false)
expect(accountById('acad9')!.on).toBe(true)
```

**Expected:** refusal, even for the master, because Kestrel is 149’s only enabled home admin.

**Code-predicted failure:** the command succeeds and disables Kestrel. The master has authority over the account, and the master mark is unchanged. No commit invariant checks the last-admin condition.

**Cause:** the lock lives in `state/accounts.ts:287–297` and its helper callers. `state/perms.ts:1428–1461` completes the ownership checks and accepts an admin without applying that lock.

**Fix:**

1. Make the last-admin calculation operate on explicit before/after account, person and home images.
2. Apply it at the commit boundary to relevant account/person changes.
3. Retain the screen preflight for the readable refusal.
4. Test disabling, demoting, deleting and restoring against the same invariant.

This is a pre-existing missing enforcement path left open by fix 5. The normal `updateAccount` and deletion preflights do call the revised lock; I found no additional fault in those direct calls.

**3. P2 — A mission-role history line is mistaken for a person’s history**

Fix 11 introduces a regression on a specialised schedule surface.

The mission-role writer uses `sub` for a **formation ID**. The new ownership rule treats every `sub` without a schedule key as a person ID. A formation has no home row, so the demo home resolver returns 142.

**Production action:** sign in as `ad9 / a9`, enable blue/red tracking, and answer Red on a qualifying formation in 149’s Edit Schedule.

**Exact proof fixture:** use the formation from `state/mission-roles.test.ts:34`, with:

- `rid: 'role149fix'`
- `cs: 'VIPER'`
- `msn: 'ACM'`
- pilot `osp9`
- remarks `DS for EAGLE`

After establishing the schedule baseline and enabling tracking:

```ts
expect(setMissionRole(roleTarget(0, 'role149fix')!, 'red').ok).toBe(true)
elogFlush()

const rows = store.keys('elog:')
  .map(k => store.get(k, null))
  .filter((r: any) => r?.fld === 'mission-role' && r.sub === 'role149fix')

expect(rows.length).toBeGreaterThan(0)
expect(rows.every((r: any) => r.u === 'u149')).toBe(true)
expect(ELOG.rows.some(r => r.sub === 'role149fix')).toBe(true)
```

**Expected:** the answer’s history belongs to 149, appears in 149’s changes window, and survives clearing 142’s history.

**Code-predicted failure:** it is stored under `u142` and omitted from 149’s in-memory history. Switching to 142 exposes it there.

**Cause:** `state/changelines.ts:682` supplies the formation ID; `engine/editlog.ts:444` interprets it as a person.

**Fix:**

1. Give history writers an explicit ownership distinction between a person and a schedule item.
2. Keep formation IDs available for history grouping without resolving them as people.
3. File mission-role answers and copied annotations under their schedule’s unit.
4. Test the live answer and day-template-copy writers, including clear and reload.

Schedule value changes carrying a schedule key bypass the new person rule correctly; I found no equivalent fault in that path.

**4. P2 — Undo and Redo still file a cross-squadron person change under the viewed squadron**

Fix 11 corrects the forward line but misses its reversal writer.

Exact input, extending the existing master/Osprey history test:

```ts
signInAs('ad', 'a') // 142 in view
const originalCat = (PEOPLE as any).osp9.q

expect(updatePersonField('osp9', { cat: 'OCU' })).toBe(null)
elogFlush()

expect(globalUndo().ok).toBe(true)
expect((PEOPLE as any).osp9.q).toBe(originalCat)
elogFlush()

expect(globalRedo().ok).toBe(true)
elogFlush()
```

Capture the newly saved history rows after each operation. Assert that the forward, Undo and Redo lines all have `u === 'u149'`, and that none appears in 142’s `ELOG.rows`. Do this before signing out, which clears Undo.

**Expected:** the master can reverse his own permitted change, and all three history entries remain with Osprey’s squadron.

**Code-predicted failure:** the forward line is correctly filed under 149; Undo and Redo are filed under 142. Their writer supplies neither the subject nor a unit, so the fallback is the viewed squadron.

**Cause:** `state/changelines.ts:650–655`, called by `state/undo-wire.ts:397`.

**Fix:**

1. Carry or derive history ownership from the original change when logging its reversal.
2. For a person change, retain that person’s history destination.
3. For changes spanning destinations, emit appropriately separated reversal lines.
4. Test forward → Undo → Redo while the master remains in 142.

This is an existing reversal writer missed by fix 11. The defect concerns the history destination; I found no static reason this particular person-change Undo would be refused.

**5. P2 — A forged “tomorrow” home row can still move a seeded person today**

Fix 2’s normal `setHome` path writes the necessary baseline. Its commit check does not enforce the resulting dated behaviour.

Exact forged input on a fresh store:

```ts
signInAs('ad', 'a')
expect(homeOn('bane', todayIso())).toBe('u142')

const r = commitSettingsIntent('home.set', null, () => {
  store.set('home:hfuture', {
    id: 'hfuture',
    pid: 'bane',
    unit: 'u149',
    from: moveFrom(todayIso())
  })
})

unitsLoad()
expect(r.ok).toBe(false)
expect(homeOn('bane', todayIso())).toBe('u142')
```

**Expected:** reject the incomplete move, leaving today unchanged.

**Code-predicted failure:** the command succeeds. After reloading the home rows, Ranger is already 149 today—and on earlier dates.

**Cause:** `state/perms.ts:1419–1422` checks the row’s `from` value. But `state/units-model.ts:127–140` deliberately extends a person’s first row backwards. Therefore a tomorrow-dated first row can change today.

**Fix:**

1. Compare effective home assignments before and after the command, not only row dates.
2. Reject an existing person’s move that changes today or earlier days.
3. Keep the baseline insertion in `setHome`.
4. Cover missing baselines, baseline deletion and first-row replacement.

This is an incomplete fix 2. The normal seeded-person move at `state/units.ts:196–212` supplies the baseline correctly; I found no fault in that specific path.

**6. P2 — Marking 142’s history as seen also marks unseen 149 history as seen**

Fix 8 filters the loaded history by squadron, but the seen cursor remains global per person.

Exact input using the existing fresh-store fixture and controlled time:

```ts
vi.useFakeTimers()
vi.setSystemTime(new Date('2026-11-18T01:00:00Z'))
signInAs('ad9', 'a9')
logAction(0, '149 unread probe')
elogFlush()

vi.setSystemTime(new Date('2026-11-18T01:01:00Z'))
signInAs('ad2', 'a2')
logAction(0, '142 read probe')
elogFlush()

signInAs('ad', 'a')
expect(markSeen(ELOG.rows.filter(r => r.lbl === '142 read probe'))).toBe(true)

switchUnit('u149')
const unseen = ELOG.rows.find(r => r.lbl === '149 unread probe')!
expect(isNewToMe(unseen)).toBe(true)
```

Restore real timers afterwards. The switch is the existing internal switch, not a request to build the deferred switch interface.

**Expected:** marking the lines displayed in 142’s changes window affects those lines only. The earlier 149 line remains new.

**Code-predicted failure:** the final assertion is false. Marking the newer 142 line advances the shared cursor past the unseen 149 line. The new-count and gold-dot readers consequently lose that unread indication.

**Cause:** `state/changes.ts:85–95` advances a global cursor using only the currently loaded squadron’s rows. It also discards extra seen IDs absent from that filtered list.

**Fix:**

1. Keep a separate cursor and extra-ID set for each squadron within the viewer’s seen state.
2. Read and update only the relevant squadron’s state.
3. Preserve other squadrons’ extra IDs.
4. Test both chronological orders, repeated switches, individual marks and “Mark all as seen”.

This is a regression caused by fix 8’s filtering exposing the previously global cursor assumption.

**Coverage of all eleven fixes and the wording**

These are static-read conclusions, not runtime passes.

| Promise | Result |
|---|---|
| 1. Other squadron’s accounts | Normal preflights and explicit changed-row checks traced; first-list omission remains finding 1. |
| 2. Home source, destination and tomorrow | Source/destination checks and normal baseline traced; forged effective-date bypass is finding 5. |
| 3. People and Quals | Checked rename, category, deletion and `mayEditQualsOf`; no additional static fault found in the revised ownership checks. |
| 4. Master deletion | Checked seeded and stored whole-list comparisons, and restore handling; no additional static fault found in this fix. |
| 5. Last admin per squadron | Normal helper callers use the per-squadron lock; commit enforcement remains finding 2. |
| 6. Request approval | Existing-person approval preserves home; new-person approval creates home with the person. No additional static fault found. |
| 7. Next-Monday cache | Unit is included in the seed-cache key; no additional static fault found. |
| 8. History isolation and clear | Load, switch and clear operate on the selected unit’s history. Ownership and unread-state gaps remain findings 3, 4 and 6. |
| 9. Delayed sign-out reload | Traced successful flush, waiting/failed saves, later landing and unsubscribe; no additional static fault found. The explicitly excluded intervening-sign-in question is not reported. |
| 10. Actor’s own account | Both old and new linked people are now checked. No additional direct relink bypass found; finding 1 is the separate whole-list omission problem. |
| 11. Person-history ownership | Ordinary forward person lines are corrected; mission-role classification and reversal calls remain findings 3 and 4. |
| Refusal wording | The other-squadron message derives the target’s home number. The last-admin helper derives the departing admin’s callsign and squadron. Users-panel failures reach the existing warning toast. No additional wording fault found. |

I traced the specialised mission-role and reversal writers first, then history readers and clear/seen operations; account editing, adding, suspension, deletion and restore; Quals; request approval; posting helpers; and sign-out/save completion. The role checks included the master, each squadron’s plain admin, members, and the developer bridge’s effective admin role. I found no additional static fault in the raised-role rule that permits home-squadron work while retaining the other-squadron restriction.

The visible checks still owed to the host are the corresponding Edit Schedule answer, changes-window lines/counts, Users-panel warning notes, Quals edit/refusal, request approval, posting outcomes, and Tracker state after completed sign-out. I did not verify their rendering or gestures in a running browser.

Tidiness: the main maintainability issue is already part of the findings—history ownership is inferred from an overloaded field, while account protection mixes whole-list and individual-row interpretations. I recommend fixing those shared meanings with the behavioural repairs, without a separate cleanup.

Walk: not performed; blind code read only.  
Rulings: none this session.

