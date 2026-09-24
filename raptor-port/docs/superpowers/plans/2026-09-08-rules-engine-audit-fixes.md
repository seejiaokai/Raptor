# Rules-Engine Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the six CONFIRMED bugs and the one owner-decided seam ("don't pad") from the 7 Sep 26 two-engine rules audit, each pinned by a test that fails without its fix.

**Architecture:** Every fix is local to one engine file (plus one export in `events.ts`), with its test added to the existing test file that already owns that seam. No new modules, no UI changes, no schema changes. The picker/validator "cannot drift" invariant is the organising idea: three of the seven fixes bring one side back into line with the other.

**Tech Stack:** Vite/React/TypeScript in `raptor-port/`; vitest (`npm test`), `tsc -b && vite build` (`npm run build`), the reference suite (`npm run test:reference`, "tfin").

## Global Constraints

- Branch: `claude/read-handoff-docs-wuftw9` only. Never push elsewhere. Merge to main ONLY on the owner's explicit "merge live". Do not watch the PR (unsubscribe after opening).
- Repository is PUBLIC: no student names / marks / dates, no secrets.
- Every task: write the failing test FIRST, see it fail, fix, see it pass, commit. One commit per task.
- All commands run from `/home/user/Raptor/raptor-port` unless stated.
- Single-test runs: `npx vitest run src/engine/<file>.test.ts -t "<test name fragment>"`.
- Commit-message style is the repo's own — a plain-prose subject naming the file/seam and WHY, e.g. `avail.ts: the AVALON/BB desk is saExempt in the picker too, matching the validator`. Every commit ends with the session's attribution footer (the `Co-Authored-By:` line for the model running the task, then `Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3`).
- Existing behaviour that is NOT in scope must not change. In particular: whether an SC SPARE occupies time on the available-crew strip (Task 7 unpads a standalone line; it does not touch spare semantics — see "Out of scope" at the end).
- Audit source: `/tmp/claude-0/…/scratchpad/rules-engine-audit-findings.md` (also summarised per task below, so the file is not required).

---

### Task 1: The AVALON / BB desk is exempt from the cross-day rules in the picker, as it already is in the validator

**Files:**
- Modify: `raptor-port/src/engine/avail.ts:161` (the `d:` branch of `slotRules`)
- Test: `raptor-port/src/engine/avalon-rules.test.ts` (append a new `describe` at the end of the file)

**Why:** `slotRules` sets `saExempt` for an AVALON/BB **jet seat** (avail.ts:216) but not for the **desk** key, so `slotBar` (avail.ts:569) runs `crossDayIfPlaced` — the 7-day-run / crew-rest check — on the desk and greys a man out, while the validator never raises `DAYS_RUN` for that desk because an AVALON/BB desk row never becomes an event (events.ts:452 pushes it to `sacrew` and returns). Picker bars what the warning list will never flag.

**Interfaces:**
- Consumes: `slotRules(key)` → `{ …, avDuty, saExempt }`; `slotBar(id, key, ?, fromKey?)`; `blockFromTpl(kind)`; `VCONF.maxRun`.
- Produces: nothing new — `slotRules(d:…).saExempt === true` for an AVALON/BB desk.

- [ ] **Step 1: Write the failing test**

Append to `raptor-port/src/engine/avalon-rules.test.ts`. Add two imports at the top of the file (next to the existing `./avail` and `./rules`-free imports):

```ts
import { slotRules } from './avail'
import { VCONF } from './rules'
```

(`slotBar`, `blockFromTpl`, `validate`, `DAYS`, `desk`, `DESK`, `SEAT`, `warns`, `TUE` already exist in this file.) Then at the end of the file:

```ts
/* THE DESK IS EXEMPT LIKE THE SEAT (audit, 8 Sep 26). slotRules set saExempt
   on an AVALON/BB jet seat but not on its desk key, so the crew picker ran
   the cross-day (run / crew-rest) question on a desk the validator never
   sees as an event — the picker barred a plant the warning list never
   flagged, the exact drift the 7 Sep review closed for the seat. */
describe('the AVALON / BB desk stands outside the cross-day rules in the picker too', () => {
  const workOn = (id: string, di: number) => {
    const d: any = DAYS[di]; d.ground = d.ground || []
    d.ground.push({ prog: 'DUTY SPELL', str: '0900', end: '1000', who: id })
  }
  it('slotRules marks the desk key saExempt, exactly as it marks the jet seat', () => {
    expect(slotRules(SEAT(0, 'p')).saExempt).toBe(true)
    expect(slotRules(DESK(0)).saExempt).toBe(true)
  })
  it('a run of days does not bar the desk — and the validator raises no DAYS_RUN for it either', () => {
    const was = VCONF.maxRun
    VCONF.maxRun = 1
    try {
      workOn('split', 0)                                   // Monday worked → Tuesday would be his 2nd day
      validate()
      /* the control: an ORDINARY desk in the same hours IS barred, so the exemption is doing the work */
      const std = blockFromTpl('std'); std.rows[0].str = '19:00'; std.rows[0].end = '21:00'
      const d: any = DAYS[TUE]; d.dutywaves.push(std); const si = d.dutywaves.length - 1
      validate()
      expect(slotBar('split', `d:${TUE}.${si}.0`)).toMatch(/day in a row/)
      expect(slotBar('split', DESK(0))).toBe('')
      desk.rows[0].id = 'split'
      expect(warns('split', 'DAYS_RUN')).toEqual([])
    } finally { VCONF.maxRun = was }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/engine/avalon-rules.test.ts -t "cross-day rules in the picker"`
Expected: FAIL — `slotRules(DESK(0)).saExempt` is `false`, and `slotBar('split', DESK(0))` matches `/day in a row/`.

- [ ] **Step 3: Set `saExempt` on the desk branch**

In `raptor-port/src/engine/avail.ts` line 161, change

```ts
    if(kk==='d'){const dwx=((DAYS[+parts[0]]||{}).dutywaves||[])[+parts[1]]; if(dwx&&saExemptKind(dwx.sa))out.avDuty=true;   // AVALON's desk, or BB's — its twin (7 Sep 26)
```

to

```ts
    if(kk==='d'){const dwx=((DAYS[+parts[0]]||{}).dutywaves||[])[+parts[1]];
      /* AVALON's desk, or BB's — its twin (7 Sep 26). saExempt too (audit,
         8 Sep 26): the desk row never becomes an event (events.ts sacrew), so
         the cross-day question at the foot of slotBar must stand down for it
         exactly as it does for the jet seat below — else the picker bars a
         run the validator never flags. */
      if(dwx&&saExemptKind(dwx.sa)){out.avDuty=true; out.saExempt=true;}
```

- [ ] **Step 4: Run the test to verify it passes, then the whole file**

Run: `npx vitest run src/engine/avalon-rules.test.ts`
Expected: PASS, every test in the file (the earlier desk tests at lines ~200–235 and ~459–480 must still pass).

- [ ] **Step 5: Commit**

```bash
git add src/engine/avail.ts src/engine/avalon-rules.test.ts
git commit -m "avail.ts: the AVALON/BB desk is saExempt in the crew picker, matching the validator" -m "slotRules set saExempt for an AVALON/BB jet seat but not for its desk key, so slotBar ran the run/crew-rest check on a desk the validator never sees as an event. Pinned by the desk twin of the seat's test.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3"
```

---

### Task 2: The ⓘ info-only flag rides the row composite, so a flip on a published day is a real amendment

**Files:**
- Modify: `raptor-port/src/engine/restore.ts:54` (allhands `ap:` composite) and `:97` (ground `gr:` composite)
- Test: `raptor-port/src/engine/restore.test.ts` (inside `describe('the dayKeys walker')`) and `raptor-port/src/engine/drafts.test.ts` (inside the reconcile `describe` that defines `pub` at line ~437)

**Why:** `dayKeys()` is the fingerprint both `rebaseDayPending` and `reconcileIssuedMarks` (drafts.ts:207, :353) compare live vs issued. The row's `info` boolean is not in it, so after `board.ts` flips ⓘ and marks `gr:di.ri.prog` / `ap:di.ri.prog` pending (board.ts:801, :937), the reconcile sees "no difference" and deletes the mark — the flip never reaches an AL. The fingerprint is recomputed on both sides from stored snapshots (never persisted as strings), so extending it is safe for existing published days.

**Interfaces:**
- Consumes: `dayKeys(d, di): Map<string,string>`; `reconcileIssuedMarks()`; `pub()` (test helper: `sign(0); setDayApproved(0, 1)`).
- Produces: `ap:…prog` = `prog␟cx␟cxr␟flag␟info`; `gr:…prog` = `prog␟cx␟flag␟info`.

- [ ] **Step 1: Write the failing tests**

In `raptor-port/src/engine/restore.test.ts`, inside `describe('the dayKeys walker', …)` after the `'row state without a text key rides the row composite (cx / flag)'` test:

```ts
  it('the ⓘ info-only flag rides the row composite too — allhands and ground', () => {
    const g0 = dayKeys(DAYS[0], 0).get('gr:0.0.prog')
    DAYS[0].ground[0].info = true
    expect(dayKeys(DAYS[0], 0).get('gr:0.0.prog')).not.toBe(g0)
    const a0 = dayKeys(DAYS[0], 0).get('ap:0.4.prog')
    DAYS[0].allhands[4].info = true
    expect(dayKeys(DAYS[0], 0).get('ap:0.4.prog')).not.toBe(a0)
  })
```

In `raptor-port/src/engine/drafts.test.ts`, inside the `describe` block that declares `const pub = () => { sign(0); setDayApproved(0, 1) }` at line ~437, after the `'id-vs-callsign round trip…'` test:

```ts
  it('an ⓘ info-only flip on a published day is a real amendment — reconcile keeps the mark, and drops it when flipped back', () => {
    pub()
    DAYS[0].ground[0].info = true
    SCHED.pending['gr:0.0.prog'] = 1                  // what board.ts marks on the ⓘ tap
    reconcileIssuedMarks()
    expect(SCHED.pending['gr:0.0.prog'], 'the flip differs from the issued day').toBe(1)
    DAYS[0].ground[0].info = false
    reconcileIssuedMarks()
    expect(SCHED.pending['gr:0.0.prog'], 'flipped back = nothing to publish').toBeUndefined()
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/engine/restore.test.ts src/engine/drafts.test.ts -t "info-only"`
Expected: FAIL — both composites read the same before and after the flip; reconcile deletes the mark.

- [ ] **Step 3: Add `info` to both composites**

In `raptor-port/src/engine/restore.ts` line 54, change

```ts
    m.set(`ap:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+S(r.cxr)+'␟'+(r.flag?1:0));
```

to

```ts
    /* `info` (the ⓘ info-only flag) rides the composite (audit, 8 Sep 26):
       without it a flip on a published day fingerprinted as "no change" and
       reconcile threw the pending mark away — the flip could never be issued */
    m.set(`ap:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+S(r.cxr)+'␟'+(r.flag?1:0)+'␟'+(r.info?1:0));
```

and line 97, change

```ts
    m.set(`gr:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0));
```

to

```ts
    m.set(`gr:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0)+'␟'+(r.info?1:0));   // + info, as ap: above
```

- [ ] **Step 4: Run the tests to verify they pass, then every file that reads dayKeys**

Run: `npx vitest run src/engine/restore.test.ts src/engine/drafts.test.ts src/engine/accept.test.ts src/engine/audit-d-keyspace.test.ts src/engine/audit-d-published.test.ts src/engine/audit-a-editlog.test.ts`
Expected: PASS, all.

- [ ] **Step 5: Commit**

```bash
git add src/engine/restore.ts src/engine/restore.test.ts src/engine/drafts.test.ts
git commit -m "restore.ts: the ⓘ info-only flag rides the row fingerprint, so a flip on a published day is a real amendment" -m "dayKeys() left info out of the ap:/gr: composites, so reconcile read a flip as no change and deleted the pending mark — the flip could never reach an AL. Pinned at the walker and at reconcileIssuedMarks.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3"
```

---

### Task 3: Leave War team counts round ONCE — four pilots on a three-pilot team read 4, not 3.999

**Files:**
- Modify: `raptor-port/src/leavewar/engine/availability.ts:196-199` (`teamsOf` tail) and `:225-228` (`ruleHave` team branch)
- Test: `raptor-port/src/leavewar/engine/counterrules.test.ts` (inside `describe('ruleHave')`)

**Why:** `teamsOf` rounds the team ratio to 3 places (4/3 → 1.333), then `ruleHave` multiplies by the team size and rounds again (1.333 × 3 = 3.999). A threshold of "red below 4" then paints a day RED with exactly four present. Round once, at the end.

**Interfaces:**
- Consumes: `ruleHave(rc, people, grid, states, date): number`; `RuleCount` `{ kind:'team', slots, show?, presence? }`.
- Produces: `teamsOf` now returns the RAW ratio (≥ 0, finite); `ruleHave` is the only rounder.

- [ ] **Step 1: Write the failing test**

In `raptor-port/src/leavewar/engine/counterrules.test.ts`, inside `describe('ruleHave', …)` after the `'show: people reports the bodies…'` test:

```ts
  it('show: people rounds ONCE — four pilots on a three-pilot team read 4, not 3.999', () => {
    // 4/3 of a team rounded to 1.333 and then × 3 gave 3.999, which a
    // "red below 4" threshold painted RED with exactly four present.
    const rc: RuleCount = { kind: 'team', slots: [{ count: 3, filter: { seats: ['pilot'] } }], show: 'people' }
    const four = [p('a', 'pilot', 'ops'), p('b', 'pilot', 'ops'), p('c', 'pilot', 'ops'), p('d', 'pilot', 'ops')]
    expect(ruleHave(rc, four, {}, {}, D)).toBe(4)
    expect(ruleHave({ ...rc, show: 'teams' }, four, {}, {}, D)).toBe(1.333)
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/leavewar/engine/counterrules.test.ts -t "rounds ONCE"`
Expected: FAIL — `3.999` received, `4` expected.

- [ ] **Step 3: Move the rounding to `ruleHave`**

In `raptor-port/src/leavewar/engine/availability.ts`, change the tail of `teamsOf` (lines 196–199)

```ts
  if (!Number.isFinite(teams)) return 0
  // Never negative, and rounded to kill float dust (0.9999999 must read 1 —
  // a team the squadron actually has must not paint the day red).
  return Math.max(0, Math.round(teams * 1000) / 1000)
```

to

```ts
  if (!Number.isFinite(teams)) return 0
  // Never negative. RAW — ruleHave rounds once at the end (audit, 8 Sep 26):
  // rounding here and again after × size gave 1.333 × 3 = 3.999, and a
  // "red below 4" threshold painted the day red with four present.
  return Math.max(0, teams)
```

and the team branch of `ruleHave` (lines 225–228)

```ts
  const teams = teamsOf(rc.slots, weightOf, people)
  if (rc.show !== 'people') return teams
  const size = rc.slots.reduce((n, s) => n + s.count, 0)
  return Math.round(teams * size * 1000) / 1000
```

to

```ts
  // One rounding, on the number the cell shows — it kills float dust
  // (0.9999999 must read 1: a team the squadron has must not paint the day
  // red) without stacking a second rounding on top of the first.
  const r3 = (x: number) => Math.round(x * 1000) / 1000
  const teams = teamsOf(rc.slots, weightOf, people)
  if (rc.show !== 'people') return r3(teams)
  const size = rc.slots.reduce((n, s) => n + s.count, 0)
  return r3(teams * size)
```

- [ ] **Step 4: Run the test to verify it passes, then the Leave War engine suite**

Run: `npx vitest run src/leavewar`
Expected: PASS, all (the seed-migration pin in counterrules.test.ts and evaluate.test.ts must be unmoved — they read whole or 3-place numbers that a single rounding reproduces).

- [ ] **Step 5: Commit**

```bash
git add src/leavewar/engine/availability.ts src/leavewar/engine/counterrules.test.ts
git commit -m "leavewar availability.ts: a team count rounds once, so four on a three-slot team read 4 and not 3.999" -m "teamsOf rounded the ratio and ruleHave rounded the product again; the double rounding tripped a red-below-4 threshold with exactly four present.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3"
```

---

### Task 4: An SC spare on three places at once is three conflicts, each said

**Files:**
- Modify: `raptor-port/src/engine/events.ts` (add `scSeatHits` beside `scSeatHit` at line 87) and `raptor-port/src/engine/validate.ts:5` (import) and `:997-1006` (the spare same-hours loop)
- Test: `raptor-port/src/engine/scspare-rules.test.ts` (inside the first `describe`)

**Why:** The spare same-hours rule calls `scSeatHit` — the FIRST hit — per spare seat. A man on two SPARE rows and the SC desk at once is three pairs; the first-hit walk lets one spare "use up" the other and the spare↔desk pairs go unsaid (one warning where there are three). The AVALON path already does it right with `avSeatHits` (events.ts:110) — this is its SC twin.

**Interfaces:**
- Consumes: `standaloneHits(di,id,s,e,selfKey,kind,seatsOnly?)` (private in events.ts); `blockFromTpl('sc')` → an SC desk block (row 0 = SXO AM 07:00–13:00).
- Produces: `export function scSeatHits(di,id,s,e,selfKey): Hit[]` in events.ts.

- [ ] **Step 1: Write the failing test**

In `raptor-port/src/engine/scspare-rules.test.ts` add the import

```ts
import { blockFromTpl } from './dutytpl'
```

and, inside `describe('two SC seats in the same hours are one man in two places', …)` after the `'the same man on two spare rows of ONE shift is caught too'` test:

```ts
  it('two SPARE rows and the SC desk at once is THREE pairs, each said (audit, 8 Sep 26)', () => {
    const d: any = DAYS[TUE]
    const sdesk = blockFromTpl('sc'); d.dutywaves = d.dutywaves || []; d.dutywaves.push(sdesk)
    AM().aircraft[2].p = 'split'
    AM().aircraft[3].p = 'split'
    sdesk.rows[0].id = 'split'                   // SXO AM duty, 07:00–13:00
    const hits = warns('split', 'DOUBLE_BOOK')
    expect(hits.length, JSON.stringify(hits.map((h: any) => h.msg))).toBe(3)
    expect(hits.filter((h: any) => /SXO AM duty/.test(h.msg)).length, 'both spare↔desk pairs are worded').toBe(2)
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/engine/scspare-rules.test.ts -t "THREE pairs"`
Expected: FAIL — 1 hit received (the spare↔spare pair only).

- [ ] **Step 3: Add `scSeatHits` and use it in the validator**

In `raptor-port/src/engine/events.ts`, directly after `scSeatHit` (line 89) add:

```ts
/* EVERY SC place, not the first — the SC twin of avSeatHits (audit, 8 Sep
   26): a man on two SPARE rows and the SC desk at once is three pairs, and
   the first-hit walk let one spare "use up" the other and left spare↔desk
   unspoken. The picker keeps scSeatHit's single answer (one refusal reason). */
export function scSeatHits(di:any,id:any,s:any,e:any,selfKey:any){
  return standaloneHits(di,id,s,e,selfKey,'sc');
}
```

In `raptor-port/src/engine/validate.ts` line 5, change `scSeatHit` to `scSeatHits` in the import:

```ts
import { collectEvents, shiftEvHard, scSeatHits, avSeatHits } from './events'
```

and replace lines 997–1006 (the `f.spareAcs` same-hours loop)

```ts
        (f.spareAcs||[]).forEach((sa:any)=>{
          [['p',sa.p],['w',sa.w]].forEach(([seat,id]:any)=>{ if(!id||!PEOPLE[id]||isSpecial(id))return;
            const own=`${sa.key}.${seat}`;
            const hit=scSeatHit(di,id,f.s,f.e,own); if(!hit)return;
            const pk=[own,hit.key].sort().join('|')+'·'+id;
            if(scPairSeen.has(pk))return; scPairSeen.add(pk);
            markChip(di,id,'C'); markRing(di,id,'hard');
            add('hard','DOUBLE_BOOK',[id],
              `${PEOPLE[id].cs} is standing SC SPARE (${f.label} ${hm24(f.s)}–${hm24(f.e)})`
              +` and also on ${hit.what} (${hm24(hit.s)}–${hm24(hit.e)})`,own); }); });
```

with

```ts
        (f.spareAcs||[]).forEach((sa:any)=>{
          [['p',sa.p],['w',sa.w]].forEach(([seat,id]:any)=>{ if(!id||!PEOPLE[id]||isSpecial(id))return;
            const own=`${sa.key}.${seat}`;
            /* every place, not the first (audit, 8 Sep 26 — the avSeatHits
               precedent): two spares + the desk is three pairs, each worded */
            scSeatHits(di,id,f.s,f.e,own).forEach((hit:any)=>{
              const pk=[own,hit.key].sort().join('|')+'·'+id;
              if(scPairSeen.has(pk))return; scPairSeen.add(pk);
              markChip(di,id,'C'); markRing(di,id,'hard');
              add('hard','DOUBLE_BOOK',[id],
                `${PEOPLE[id].cs} is standing SC SPARE (${f.label} ${hm24(f.s)}–${hm24(f.e)})`
                +` and also on ${hit.what} (${hm24(hit.s)}–${hm24(hit.e)})`,own); }); }); });
```

Also update the prose comment above it (line ~987) from `through the same scSeatHit body` to `through the same standaloneHits body (scSeatHits — every hit)`.

- [ ] **Step 4: Run the test to verify it passes, then the SC and AVALON suites**

Run: `npx vitest run src/engine/scspare-rules.test.ts src/engine/scrole-rules.test.ts src/engine/avalon-rules.test.ts src/engine/audit-c-exempt.test.ts`
Expected: PASS, all — the existing "said once" tests (MAIN+SPARE, SPARE+SPARE across waves, two spare rows of one shift) still read exactly 1, because each of those is one pair.

- [ ] **Step 5: Commit**

```bash
git add src/engine/events.ts src/engine/validate.ts src/engine/scspare-rules.test.ts
git commit -m "validate.ts: an SC spare on three places at once is three conflicts, each said — the SC twin of avSeatHits" -m "The spare same-hours rule took scSeatHit's first hit, so two spare rows plus the SC desk printed one pair and left both spare↔desk pairs unspoken.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3"
```

---

### Task 5: A stale flying key reads blank and writes nothing, instead of throwing

**Files:**
- Modify: `raptor-port/src/engine/slots.ts:68` (`slotVal`) and `:85-98` (`setSlotVal`)
- Test: `raptor-port/src/engine/slots.test.ts` (next to `'and flyRef returns nothing rather than throwing'`)

**Why:** `flyRef` deliberately returns `undefined` for a key that outlives its row (slots.ts:20–27), and every `d:/s:/g:/a:` branch of `slotVal`/`setSlotVal` guards for that — the flying branch alone dereferences `flyRef(key)[seat]` and throws a TypeError. The audit's reviewer found no live UI path that reaches it (the disarm logic prevents it), so this is a contract fix: defensive, pinned.

**Interfaces:**
- Consumes: `flyRef(key)`, `slotVal(key)`, `setSlotVal(key, id)`, `SCHED.pending`.
- Produces: `slotVal('<stale flying key>') === ''`; `setSlotVal` on a stale flying key is a silent no-op (no throw, no pending mark).

- [ ] **Step 1: Write the failing test**

In `raptor-port/src/engine/slots.test.ts`, after the `'and flyRef returns nothing rather than throwing'` test:

```ts
  it('a stale flying key reads blank and writes nothing — no throw, no phantom mark (audit, 8 Sep 26)', () => {
    expect(slotVal('99.99.99.99.p')).toBe('')
    expect(slotVal('0.0.0.99.w')).toBe('')
    expect(() => setSlotVal('0.0.0.99.w', 'bane')).not.toThrow()
    expect(SCHED.pending['0.0.0.99.w']).toBeUndefined()
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/engine/slots.test.ts -t "stale flying key"`
Expected: FAIL — `TypeError: Cannot read properties of undefined`.

- [ ] **Step 3: Guard the flying branch on both sides**

In `raptor-port/src/engine/slots.ts` line 68, change

```ts
  if(c<0)return flyRef(key)[key.split('.')[4]];
```

to

```ts
  /* the flying branch guards like every other (audit, 8 Sep 26): flyRef is
     built to answer nothing for a key that outlived its row, and reading a
     seat off that nothing threw out of the middle of a click handler */
  if(c<0){const r=flyRef(key); return r?(r[key.split('.')[4]]||''):'';}
```

In `setSlotVal`, after `key=String(key);const c=key.indexOf(':');` (line 86) add

```ts
  if(c<0&&!flyRef(key))return;                   // a stale flying key: nothing to write, nothing to mark
```

and change line 98

```ts
  if(c<0){flyRef(key)[key.split('.')[4]]=id||'';return;}
```

to

```ts
  if(c<0){flyRef(key)[key.split('.')[4]]=id||'';return;}   // non-null: guarded above
```

- [ ] **Step 4: Run the test to verify it passes, then the funnel suites**

Run: `npx vitest run src/engine/slots.test.ts src/engine/accept.test.ts src/engine/audit-d-applymove.test.ts src/engine/editlog.test.ts`
Expected: PASS, all — the `'slot round-trip all prefixes'` and `'a no-op assignment is not an edit'` tests must be unmoved.

- [ ] **Step 5: Commit**

```bash
git add src/engine/slots.ts src/engine/slots.test.ts
git commit -m "slots.ts: a stale flying key reads blank and writes nothing, like every other branch of the funnel" -m "slotVal/setSlotVal dereferenced flyRef(key) without the null guard the d:/s:/g:/a: branches have, so a key that outlived its row threw a TypeError.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3"
```

---

### Task 6: A saved day-template carries no cancellation reason on sim, duty or ground rows either

**Files:**
- Modify: `raptor-port/src/engine/daytpl.ts:122`, `:133`, `:139` (`mintBlob`)
- Test: `raptor-port/src/engine/daytpl.test.ts` (extend `'strips cx / cxr / red-flag marks'`)

**Why:** `mintBlob` strips `cx`/`cxr`/`flag` from all-hands, formations and aircraft but only `cx`/`flag` from sim, duty and ground rows — so a typed reason ("U/S JET", "WX") rides into the template and pre-fills the cancel box on any day it is later applied to. The comment above the strip already says cxr goes with cx "for the same reason"; the three rows just missed it.

**Interfaces:**
- Consumes: `tplFromDay(di, title): DayTpl` (→ `.d` is the minted blob).
- Produces: `cxr` absent on every row kind of a minted template.

- [ ] **Step 1: Extend the test so it fails**

In `raptor-port/src/engine/daytpl.test.ts`, in `it('strips cx / cxr / red-flag marks', …)`, add after `DAYS[0].allhands[0]!.flag = true`:

```ts
    DAYS[0].sims.oft[0].cxr = 'U/S BOX'
    DAYS[0].dutywaves[0].rows[0].cxr = 'SICK'
    DAYS[0].ground[0].cxr = 'WX'
```

and after `expect(t.d.allhands[0].flag).toBeUndefined()`:

```ts
    /* the typed reason goes with the cx on EVERY row kind (audit, 8 Sep 26):
       it used to ride sim / duty / ground rows into the template and pre-fill
       the cancel box on the day the template was applied to */
    expect(t.d.sims.oft[0].cxr).toBeUndefined()
    expect(t.d.dutywaves[0].rows[0].cxr).toBeUndefined()
    expect(t.d.ground[0].cxr).toBeUndefined()
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/engine/daytpl.test.ts -t "strips cx"`
Expected: FAIL — `t.d.sims.oft[0].cxr` is `'U/S BOX'`.

- [ ] **Step 3: Strip `cxr` on the three row kinds**

In `raptor-port/src/engine/daytpl.ts`:

line 122 (sims): `delete r.cx; delete r.flag` → `delete r.cx; delete r.cxr; delete r.flag`
line 133 (dutywaves rows): `delete r.cx; delete r.flag` → `delete r.cx; delete r.cxr; delete r.flag`
line 139 (ground): `delete r.cx; delete r.flag` → `delete r.cx; delete r.cxr; delete r.flag`

- [ ] **Step 4: Run the test to verify it passes, then the file**

Run: `npx vitest run src/engine/daytpl.test.ts`
Expected: PASS, all.

- [ ] **Step 5: Commit**

```bash
git add src/engine/daytpl.ts src/engine/daytpl.test.ts
git commit -m "daytpl.ts: a minted day-template drops the typed CX reason on sim, duty and ground rows too" -m "mintBlob stripped cxr only from all-hands, formations and aircraft, so a reason typed on a sim/duty/ground row rode into the template and pre-filled the cancel box on the day it was applied to.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3"
```

---

### Task 7: The available-crew strip reads a standalone shift as a SHIFT — no step in front, no dekit behind (owner, 8 Sep 26: "don't pad")

**Files:**
- Modify: `raptor-port/src/engine/avail.ts:19-27` (`personBusy`, the waves loop)
- Test: `raptor-port/src/engine/avail.test.ts` (inside `describe('personBusy follows the editable step / dekit rules')`)

**Why:** `personBusy` — which the "available crew · by wave" strip is built from (avail.ts:99) — pads EVERY wave line by `[to − VCONF.step, ld + VCONF.dekit]`, standalone shifts included. Everything else in the engine (slotRules avail.ts:223–224, events.ts, and the rulebook at docs/engine-rules.md:1003) reads a standalone line as unpadded: "07:00–13:00 means exactly that". So the strip greyed an SC man ~90 min wider than the engine reserves him. The owner decided: don't pad.

**Interfaces:**
- Consumes: `isStandalone(w)` (already imported in avail.ts), `personBusy(d, id): [s,e][]`, `makeStandalone('sc')` (AM shift 07:00–13:00 = minutes 420–780).
- Produces: a standalone line contributes exactly `[to, ld]` to `personBusy`.

- [ ] **Step 1: Write the failing test**

In `raptor-port/src/engine/avail.test.ts`, inside `describe('personBusy follows the editable step / dekit rules', …)` after the `'raising the step rule widens the busy window…'` test:

```ts
  it("a standalone SC shift is a SHIFT — occupied exactly its hours, no step or dekit (owner, 8 Sep 26: \"don't pad\")", () => {
    const sc: any = makeStandalone('sc'); DAYS[0].waves.push(sc)
    sc.formations[0].aircraft[0].p = 'split'                 // SC AM MAIN, 07:00–13:00
    const spans = personBusy(DAYS[0], 'split')
    expect(spans).toContainEqual([420, 780])
    expect(spans.some(([s, e]: any) => s === 420 - VCONF.step && e === 780 + VCONF.dekit), 'no padded copy').toBe(false)
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/engine/avail.test.ts -t "standalone SC shift"`
Expected: FAIL — `[420, 780]` not found; the padded window `[420 − step, 780 + dekit]` is present instead.

- [ ] **Step 3: Unpad the standalone line in `personBusy`**

In `raptor-port/src/engine/avail.ts`, replace lines 19–27

```ts
  (d.waves||[]).forEach((w:any)=>w.formations.forEach((f:any)=>{ if(f.cx)return; f.aircraft.forEach((a:any)=>{
    if(a.cx)return;
    if(a.p===id||a.w===id){const to=parseHM(f.to); let ld=parseHM(f.ld);
      /* the step and dekit pads are VCONF's, not literals: both are editable on
         the Logic tab (0–240), and slotRules/events.ts/validate.ts all read them
         from there. Hardcoding 60/30 here matched only at the defaults, so
         raising either rule left this strip offering a man the validator already
         considered occupied. */
      if(to!=null&&ld!=null){if(ld<to)ld+=1440; out.push([to-VCONF.step,ld+VCONF.dekit]);}}});}));
```

with

```ts
  (d.waves||[]).forEach((w:any)=>{const shift=isStandalone(w); w.formations.forEach((f:any)=>{ if(f.cx)return; f.aircraft.forEach((a:any)=>{
    if(a.cx)return;
    if(a.p===id||a.w===id){const to=parseHM(f.to); let ld=parseHM(f.ld);
      /* the step and dekit pads are VCONF's, not literals: both are editable on
         the Logic tab (0–240), and slotRules/events.ts/validate.ts all read them
         from there. Hardcoding 60/30 here matched only at the defaults, so
         raising either rule left this strip offering a man the validator already
         considered occupied.
         A standalone line is a SHIFT, not a sortie (owner, 8 Sep 26 — "don't
         pad"): 07:00–13:00 occupies exactly that, no step in front and no dekit
         behind — the reading slotRules and events.ts already give it. This strip
         was the one place still padding it, greying an SC man ~90 min wider
         than the engine reserves him. */
      if(to!=null&&ld!=null){if(ld<to)ld+=1440; out.push(shift?[to,ld]:[to-VCONF.step,ld+VCONF.dekit]);}}});});});
```

- [ ] **Step 4: Run the test to verify it passes, then the availability suites**

Run: `npx vitest run src/engine/avail.test.ts src/engine/infoflag.test.ts src/engine/audit-c-exempt.test.ts src/engine/overnight.test.ts`
Expected: PASS, all — the two existing `flyWindow` tests (an ORDINARY sortie stays padded) must be unmoved.

- [ ] **Step 5: Commit**

```bash
git add src/engine/avail.ts src/engine/avail.test.ts
git commit -m "avail.ts: the available-crew strip reads a standalone shift unpadded — no step, no dekit (owner: don't pad)" -m "personBusy padded every wave line by step/dekit, standalone SC shifts included, while slotRules, events.ts and the rulebook read a standalone line as exactly its hours. Owner's call, 8 Sep 26: don't pad.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3"
```

---

### Task 8: Docstring, rulebook, bug-testing row, handoff, gates, review, PR

**Files:**
- Modify: `raptor-port/src/leavewar/engine/stages.ts:180` (docstring only)
- Modify: `raptor-port/docs/engine-rules.md` (~line 1003, the `slotRules` bullet)
- Modify: `BUG-TESTING.md` (one new row after `#376`), `HANDOFF.md` (the "In flight" section)
- No test — prose only, then the full gates.

- [ ] **Step 1: Fix the "latest PUBLISHED" docstring (contested B — keep the code, fix the words)**

In `raptor-port/src/leavewar/engine/stages.ts` line 180, change

```ts
 * of those, the latest PUBLISHED; and a DRAFT war — not yet opened, nothing
```

to

```ts
 * of those, a PUBLISHED one (the tie-break below says which); and a DRAFT war — not yet opened, nothing
```

(The paragraph two lines down already explains that ties go to the EARLIEST bidding start — the code at `betterDefault` does exactly that; only this one phrase disagreed with it. Owner's default for the plan: earliest; if the owner later says "latest", flip `betterDefault`'s bid-start comparison instead and revert this phrase.)

- [ ] **Step 2: Rulebook — say the strip now agrees**

In `raptor-port/docs/engine-rules.md`, in the bullet that begins `**\`slotRules\` reports the slot's own window**` (line ~1000), after the sentence ending `a standalone line is unpadded (it is a shift),` insert nothing; instead add a new bullet directly after that bullet's end (after the `null means UNKNOWN, never FREE` paragraph ends):

```markdown
- **`personBusy` (the Available-crew strip) reads the same windows** — a
  sortie `[to − step, ld + dekit]`, a standalone line exactly its hours
  (owner, 8 Sep 26: "don't pad"). The strip was the one reader still padding
  a standalone SC shift, so an SC man read busy ~90 min wider on the strip
  than the engine reserved him. Pinned in `avail.test.ts`.
```

- [ ] **Step 3: BUG-TESTING.md row + HANDOFF.md**

Append a row to the batches table in `BUG-TESTING.md` immediately after the `#376` row (use the PR number once the PR exists — open the PR in Step 7 first, then fill it in and amend into the docs commit):

```markdown
| **#NNN** | **Rules-engine audit fixes (7–8 Sep 26).** A 26-agent read of both rules engines (~196 rules verified correct; the leave/day charge maths, the OIL ledger and the medical trims came back clean) found six real bugs, all fixed and pinned: (1) the AVALON/BB **desk** no longer greys a man out for "too many days in a row" in the crew list when the warning list never flags it (the jet seat was already right); (2) the ⓘ info-only tap on a row of an already-published day now shows up as an amendment to publish — it used to vanish silently; (3) Leave War manning no longer paints a false RED when exactly enough people are present (a 3.999-for-4 rounding slip); (4) an SC spare on two SPARE rows and the SC desk at once now gets all three conflicts said, not one; (5) a stale flying-seat key reads blank instead of throwing; (6) saving a day as a template no longer carries a typed cancellation reason on sim/duty/ground rows. Plus the owner's call: a standalone SC shift on the **Available-crew strip** is exactly its hours — no ~90 min buffer either side ("don't pad"). | ⬜ — owner to check on the preview: Edit Schedule → + Wave → AVALON, + Block → AVALON, give a pilot ground rows Mon–Sat, then open the crew list for the Sunday AVALON SXO row: he is offered (no "day in a row" line); publish a day, tap ⓘ on a ground row → "Publish AL" now has that item; Leave War → a team counter of 3 pilots with 4 present reads 4 and stays green; SC wave: the same man on SPARE AM twice and on the SC desk SXO AM → three red C lines; the Available-crew strip on a day with an SC shift: the SC man reads free right up to 07:00 and again from 13:00. |
```

In `HANDOFF.md` under "In flight", add one line naming the PR, the branch, that it is the audit-fixes batch (7 fixes, each pinned), the gate counts from Step 5, and that merge waits on the owner's "merge live".

- [ ] **Step 4: Commit the docs**

```bash
git add raptor-port/src/leavewar/engine/stages.ts raptor-port/docs/engine-rules.md BUG-TESTING.md HANDOFF.md
git commit -m "docs: the audit-fixes batch — rulebook, bug-testing row, handoff; stages.ts docstring says a PUBLISHED war, tie-break below" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3"
```

(Run from the repo root `/home/user/Raptor`, not `raptor-port`.)

- [ ] **Step 5: Run the full gates**

From `/home/user/Raptor/raptor-port`:

```bash
npm test 2>&1 | tail -15          # expect: all files pass; count ≥ 4165 + the 8 new tests
npm run build 2>&1 | tail -5      # expect: tsc clean, vite build done
npm run test:reference 2>&1 | tail -5   # expect: tfin  N passed / 0 failed
```

Expected: every gate green. If `npm run build` reports an unused import (`scSeatHit` in validate.ts), Task 4 Step 3 was not fully applied — fix the import, do not suppress.

- [ ] **Step 6: Request code review**

Use the `requesting-code-review` skill on the range `f6cc0ad..HEAD` (base = the merge of main incl. #375 that the audit read). Requirements to give the reviewer: this plan file. Address every Critical and Important finding before pushing; verify each finding against the code first (`receiving-code-review`).

- [ ] **Step 7: Push and open the draft PR**

```bash
git push -u origin claude/read-handoff-docs-wuftw9
```

(retry 4× on network failure: 2s, 4s, 8s, 16s). PR #374 is already open on this branch — if it is still open, the push lands there: retitle it to `Rules-engine audit fixes — six confirmed bugs + "don't pad"` and rewrite the body (summary above, the seven fixes, gate counts, the BUG-TESTING row's owner checks), ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)` and the session link. If #374 has been merged or closed, open a NEW draft PR with that title and body. Then unsubscribe from PR activity (owner: do not watch PRs). Merge waits for the owner's "merge live".

---

## Self-review (done at planning time)

- **Spec coverage:** audit findings 1–6 → Tasks 1–6; contested A ("don't pad") → Task 7; contested B (docstring) → Task 8 Step 1. Docs/gates/review/PR → Task 8. Nothing from the findings file is unassigned.
- **Placeholder scan:** none — every code step shows the exact before/after; every test is complete. The one deliberate open value is the PR number in the BUG-TESTING row (`#NNN`), filled in at Step 7 by design.
- **Type consistency:** `scSeatHits` (Task 4) is the only new name and is used with the same signature in events.ts and validate.ts. `r3` is local to `ruleHave`. `shift` is local to `personBusy`.

## Out of scope (surfaced, not done)

- **SC SPARE on the strip.** `personBusy` still counts an SC SPARE seat as occupying its shift hours, while `dayEngaged` deliberately treats a SPARE as free ("standing by, may be planned for anything else"). Task 7 unpads the window; it does not change whether a SPARE occupies it. That is a separate owner decision — raise it, do not fold it in.
- **Contested B flip.** If the owner wants "latest published" rather than earliest, the change is one comparison in `betterDefault` (stages.ts) plus its test in `stages.test.ts`, not this plan.
