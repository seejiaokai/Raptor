# Opus 7 — a 142 admin can rewrite a 149 man's inputs (open, 18 Nov 26)

The fix read of multi-squadron batch 1's full check (night of 17-18 Nov 26). Its read: `2026-11-18-multi-sqn-b1-fixread-opus.md`,
claim 7. Taken as real (reproduced by the host), built red first, then **backed out** the same night and left open for the
morning. This file keeps the proof and the built fix, so the next chat starts from them.

## The fault

The commit gate (`src/state/perms.ts ownershipViolation`, section 8) holds a man's person row, his account and his home to
his own squadron's admins, never his inputs. An admin's command that changes a 149 man's input — his leave, a course, their
remarks — is let through for 142's plain admin. No screen offers it (Inputs stay on his own squadron, D2132): it takes a
forged write, the same class as Astra 1 and 2.

## The proof (red on the code as committed)

Put back into `src/state/units-sqn-fixread.test.ts` (imports: `switchUnit, writeInputsBatch` from `./store`; `INPUTS, leadOf`
from `../engine/inputs`):

```ts
describe("Opus 7 — a man's inputs are his own squadron's", () => {
  const her9 = () => INPUTS.find((x: any) => String(leadOf(x)) === 'her9') as any
  it("142's plain admin cannot rewrite a 149 man's leave remarks, by any write of the inputs", () => {
    signInAs('ad2', 'a2')
    const r = her9()
    expect(r, 'the 149 seed input').toBeTruthy()
    const was = r.remarks
    expect(writeInputsBatch(() => { r.remarks = 'rewritten by 142' }), 'refused').toBeFalsy()
    expect(her9().remarks).toBe(was)
  })
  it("…while 149's admin and the master may, and 142's admin keeps his own men's", () => {
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { her9().remarks = 'by 149' })).toBeTruthy()
    expect(her9().remarks).toBe('by 149')
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { her9().remarks = 'by the master' })).toBeTruthy()
    signInAs('ad2', 'a2')
    const own = INPUTS.find((x: any) => homeOn(String(leadOf(x))) === 'u142') as any
    expect(own, 'a 142 input').toBeTruthy()
    expect(writeInputsBatch(() => { own.remarks = 'by 142' })).toBeTruthy()
  })
})
```

## The fix as built (green on that test)

In `perms.ts`, called in `ownershipViolation` right after `homeUnitViolation` (imports `namedOf, placeholderOf, inputAtIso`
from `../engine/inputs`):

```ts
function inputUnitViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role !== 'admin') return null
  const ins = env.changes.filter(c => c.collection === 'inputs')
  if (!ins.length) return null
  const today = todayIso()
  const before = unitRowsBefore(env.changes)
  const row: any = ACCOUNTS_LIST.find(x => x.id === a.id)
  const acct = row
    ? { id: row.id, pid: String(row.pid), role: String(a.role), master: row.master === true }
    : { id: a.id, pid: String(a.personId ?? ''), role: 'admin' }
  const unitsOf = (r: any): string[] => {
    if (!r || typeof r !== 'object') return []
    const iso = inputAtIso(r.date, r.yr) || today
    const named = namedOf(r)
    if (named.length) return named.map((e: any) => homeBefore(String(e.p), iso, before)).filter(Boolean) as string[]
    const ph = placeholderOf(r)
    const by = ph && ph.by != null && ph.by !== '' ? ph.by : r.by
    const u = by == null || by === '' ? null : homeBefore(String(by), iso, before)
    return u ? [u] : []
  }
  for (const c of ins) {
    const was = c.before ?? null, is = c.op === 'delete' ? null : c.after ?? null
    if (JSON.stringify(was) === JSON.stringify(is)) continue
    for (const u of new Set([...unitsOf(was), ...unitsOf(is)]))
      if (levelBefore(acct, u, today, before) !== 'admin') return `an input of another squadron (${u}) changed by one who is not its admin (inputs/${c.id})`
  }
  return null
}
```

## Why it was backed out

With it, the full unit suite failed 30 tests in 7 files: `ui/rowtwice-refusal`, `ui/oilmode`, `ui/oilrowpucks`,
`ui/oilseat-refusal`, `ui/availwin`, `ui/oilswitch`, `state/command-write-seam`. Every one is the same shape: the test's
world empties or resets `INPUTS` in memory outside every command (a snapshot taken when the file loads, or
`INPUTS.length = 0` inside the test), then runs a command as a made-up admin session (`{ user: 'ad', role: 'admin' }` — not
a real account, so not the master, and read as 142's). The command's save then deletes the 149 seed inputs the store
still holds, and the gate refuses it. Nothing in the app empties `INPUTS` outside a command, so the gate is right and the
test worlds are wrong — but each file needs its world put right (its snapshot taken after the first `initStore`, or the
149 inputs kept), file by file, which did not fit the night.

## For the morning

1. Put the fix and the proof back, then repair the seven files' worlds one by one (never by weakening an assertion).
2. Run the whole unit suite under the lock; then a fresh, blind Opus read and Astra's read of the fix (the gate decides
   permissions — a security read too, D1411).
