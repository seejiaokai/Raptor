/* [DB-READINESS] group A FULL walk — W2 part B: the planning calendar, and TWO PEOPLE AT ONCE (brief §W2 step 4).
   Two people = two tabs in ONE browser (they share its storage; the app never re-reads storage while open, so tab B does
   not see tab A's change until B reloads — exactly the case: B, opened BEFORE A's change, makes its own change to a
   DIFFERENT thing; a reload of either must show BOTH). Every gesture through the app's own controls: the Inputs page
   form and ✕, the month calendar's day popover (+ Pucks, the day title).
   Run from raptor-port/scripts/handpass: node dbrA-W2-b.mjs            */
process.env.HP_URL ||= 'http://localhost:4202'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W2'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W2-b.json'
const H = await import('./dbrA-W2-lib.mjs')
const { L, W, sleep } = H

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const A = await L.page(ctx, errors, 'A')
await L.signIn(A, 'a')
await L.settle(A)
const ELOG = /^settings\/elog:/
const cellFocus = iso => `#inpCal [data-icday="${iso}"]`

/* ================= the planning calendar, one person ================= */
let pp1 = null
await W(A, {
  id: 'W2-04a', focus: cellFocus('2026-10-14'), what: 'the Inputs month calendar: Wed 14 Oct → + Pucks → Ranger and Blade → ✓ Add 2',
  fn: async () => { const r = await H.addPucks(A, '2026-10-14', ['bane', 'slash']); await H.calDayClose(A); pp1 = (await H.planOf(A, '2026-10-14')).pp; return r },
  expect: { put: [/^plan\/pp:/], also: [ELOG], only: true },
  check: async (a) => { const c = await H.calCell(A, '2026-10-14'); return { what: 'ONE planning-puck row; the day shows Ranger + Blade', ok: a.put.filter(k => k.startsWith('plan/')).length === 1 && pp1.length === 1 && c && c.pucks.join() === 'Ranger+Blade', detail: { cell: c, pp: pp1 } } },
  after: async () => { await H.calTo(A, '2026-10'); const c = await H.calCell(A, '2026-10-14'); return { what: 'the day still shows Ranger + Blade', ok: c && c.pucks.join() === 'Ranger+Blade', detail: c, said: `14 Oct: ${c && c.pucks.join()}` } },
})
await W(A, {
  id: 'W2-04b', focus: cellFocus('2026-10-15'), what: 'the day popover of Thu 15 Oct: the day title typed "W2 DAY TITLE"',
  fn: async () => { const r = await H.dayTitle(A, '2026-10-15', 'W2 DAY TITLE'); await H.calDayClose(A); return r },
  expect: { put: [/^plan\/dm:2026-10-15$/], also: [ELOG], only: true },
  check: async () => { const c = await H.calCell(A, '2026-10-15'); return { what: 'the day reads its title', ok: c && c.title === 'W2 DAY TITLE', detail: c } },
  after: async () => { await H.calTo(A, '2026-10'); const c = await H.calCell(A, '2026-10-15'); return { what: 'the title kept', ok: c && c.title === 'W2 DAY TITLE', detail: c, said: `15 Oct title "${c && c.title}"` } },
})

/* ================= two people at once ================= */
const strip = x => JSON.parse(JSON.stringify(x, (k, v) => (k === 'rid' ? undefined : v)))
/* one two-tab step: A's gesture, then B's (B not reloaded since before A's), each audited; then each tab reloaded — the
   reload writes nothing and shows BOTH changes — and after both reloads the two tabs hold the same world */
async function twoTab(id, what, gA, gB, verify, focusAfter = null) {
  const n0 = L.results.length
  const pics = []
  const aA = await L.step(A, `${id} tab A: ${gA.name}`, gA.fn, gA.expect)
  if (gA.assert) { const x = gA.assert(aA); L.check(`${id} tab A — ${x.what}`, x.ok, x.detail) }
  if (gA.focus) { const el = A.locator(gA.focus).first(); if (await el.count()) await el.evaluate(e => e.scrollIntoView({ block: 'center' })) }
  pics.push(await H.pic(A, `${id}-a-tabA`))
  const aB = await L.step(B, `${id} tab B (not reloaded since before A's change): ${gB.name}`, gB.fn, gB.expect)
  if (gB.assert) { const x = gB.assert(aB); L.check(`${id} tab B — ${x.what}`, x.ok, x.detail) }
  if (gB.focus) { const el = B.locator(gB.focus).first(); if (await el.count()) await el.evaluate(e => e.scrollIntoView({ block: 'center' })) }
  pics.push(await H.pic(B, `${id}-a-tabB`))
  const said = []
  for (const [pg, tag] of [[A, 'A'], [B, 'B']]) {
    const r1 = await L.rows(pg)
    await pg.reload(); await L.signIn(pg, 'a', { goto: false }); await L.settle(pg, 700)
    const r2 = await L.rows(pg), rd = L.diff(r1, r2)
    L.check(`${id} — the reload of tab ${tag} wrote nothing`, !rd.put.length && !rd.del.length, rd.put.length || rd.del.length ? { put: rd.put, del: rd.del } : 'no row changed')
    const v = await verify(pg)
    L.check(`${id} — after tab ${tag}'s reload: ${v.what}`, v.ok, v.detail)
    said.push(`tab ${tag}: ${v.said || v.what}`)
    const fa = focusAfter ? focusAfter() : gA.focus
    if (fa) { const el = pg.locator(fa).first(); if (await el.count()) await el.evaluate(e => e.scrollIntoView({ block: 'center' })) }
    pics.push(await H.pic(pg, `${id}-b-tab${tag}`))
  }
  const sA = strip(await L.state(A)), sB = strip(await L.state(B))
  const d = L.stateDiff(sA, sB)
  L.check(`${id} — after both reloads the two tabs hold the same world`, !d.length, d.slice(0, 10).join(' || ') || 'same')
  const rs = L.results.slice(n0)
  const row = { step: id, width: 'desktop', what, afterReload: said.join(' · '), rows: `A: ${H.auditText(aA)} ‖ B: ${H.auditText(aB)}`, pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`.slice(0, 600)), pics }
  H.TABLE.push(row)
  console.log(`== ${row.pass ? 'PASS' : 'FAIL'} ${id} — ${what} :: ${row.rows}`)
}

const B = await L.page(ctx, errors, 'B')
/* opening a second tab and signing in must itself write nothing */
{
  const r0 = await L.rows(A)
  await L.signIn(B, 'a'); await L.settle(B)
  const d = L.diff(r0, await L.rows(B))
  L.check('W2-04c — opening tab B and signing in wrote nothing', !d.put.length && !d.del.length && !d.newBatches.length, d)
}
await H.toastSpy(A); await H.toastSpy(B)
await H.inputsList(A); await H.inputsList(B)

let iA = null, iB = null
await twoTab('W2-04c', 'two tabs on the Inputs page: A files an LL for Nomad (Mon 26 Oct); B, not reloaded, files an LL for Echo (Tue 27 Oct)',
  { name: 'files an LL for Nomad, 26 Oct', fn: async () => { const r = await H.fileReq(A, { person: 'pike', type: 'LL', from: '2026-10-26', remarks: 'W2 tab A' }); iA = r.iid; return r }, expect: { put: [/^inputs\//], also: [ELOG], only: true }, focus: '#inBody tr:first-child' },
  { name: 'files an LL for Echo, 27 Oct', fn: async () => { const r = await H.fileReq(B, { person: 'freak', type: 'LL', from: '2026-10-27', remarks: 'W2 tab B' }); iB = r.iid; return r }, expect: { put: [/^inputs\//], also: [ELOG], only: true }, focus: '#inBody tr:first-child' },
  async (pg) => {
    const o = await H.inputsAll(pg)
    const has = await pg.evaluate(([a, b]) => [window.INPUTS.some(x => x.iid === a), window.INPUTS.some(x => x.iid === b)], [iA, iB])
    const el = pg.locator(`#inBody tr[data-iid="${iA}"]`).first(); if (await el.count()) await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
    return { what: 'BOTH requests there (Nomad 26 Oct and Echo 27 Oct), listed on the Inputs page', ok: has[0] && has[1] && o.includes(iA) && o.includes(iB), detail: { has, listed: [o.includes(iA), o.includes(iB)] }, said: `Nomad ${has[0] ? 'there' : 'MISSING'}, Echo ${has[1] ? 'there' : 'MISSING'}` }
  }, () => `#inBody tr[data-iid="${iB}"]`)

await H.calTo(A, '2026-10'); await H.calTo(B, '2026-10')
await twoTab('W2-04d', 'two tabs, ONE date of the month calendar: A adds a pucks row (Hex) on Fri 16 Oct; B, not reloaded, adds another (Outlaw) on the same day',
  { name: '+ Pucks on 16 Oct: Hex', fn: async () => { const r = await H.addPucks(A, '2026-10-16', ['rocky']); await H.calDayClose(A); return r }, expect: { put: [/^plan\/pp:/], also: [ELOG], only: true }, focus: cellFocus('2026-10-16') },
  { name: '+ Pucks on 16 Oct: Outlaw', fn: async () => { const r = await H.addPucks(B, '2026-10-16', ['casper']); await H.calDayClose(B); return r }, expect: { put: [/^plan\/pp:/], also: [ELOG], only: true }, focus: cellFocus('2026-10-16') },
  async (pg) => {
    await H.calTo(pg, '2026-10')
    const c = await H.calCell(pg, '2026-10-16'), pl = await H.planOf(pg, '2026-10-16')
    const got = (c && c.pucks || []).slice().sort()
    return { what: 'BOTH pucks rows on 16 Oct (Hex, Outlaw)', ok: got.join() === 'Hex,Outlaw' && pl.pp.length === 2, detail: { cell: c, pp: pl.pp }, said: `16 Oct rows: ${(c && c.pucks || []).join(' | ')}` }
  })

await twoTab('W2-04e', 'two tabs, ONE date: A types the day title of Sat 17 Oct; B, not reloaded, adds a pucks row (Ranger) on the same day',
  { name: 'day title on 17 Oct: "W2 TITLE A"', fn: async () => { const r = await H.dayTitle(A, '2026-10-17', 'W2 TITLE A'); await H.calDayClose(A); return r }, expect: { put: [/^plan\/dm:2026-10-17$/], also: [ELOG], only: true }, focus: cellFocus('2026-10-17') },
  { name: '+ Pucks on 17 Oct: Ranger', fn: async () => { const r = await H.addPucks(B, '2026-10-17', ['bane']); await H.calDayClose(B); return r }, expect: { put: [/^plan\/pp:/], also: [ELOG], only: true }, focus: cellFocus('2026-10-17') },
  async (pg) => {
    await H.calTo(pg, '2026-10')
    const c = await H.calCell(pg, '2026-10-17')
    return { what: 'BOTH on 17 Oct: the title "W2 TITLE A" and the Ranger row', ok: c && c.title === 'W2 TITLE A' && c.pucks.join() === 'Ranger', detail: c, said: `17 Oct: title "${c && c.title}", rows ${c && c.pucks.join()}` }
  })

await twoTab('W2-04f', 'two tabs, two dates: A types the title of Sun 18 Oct; B, not reloaded, the title of Mon 19 Oct',
  { name: 'day title on 18 Oct', fn: async () => { const r = await H.dayTitle(A, '2026-10-18', 'W2 TITLE 18'); await H.calDayClose(A); return r }, expect: { put: [/^plan\/dm:2026-10-18$/], also: [ELOG], only: true }, focus: cellFocus('2026-10-18') },
  { name: 'day title on 19 Oct', fn: async () => { const r = await H.dayTitle(B, '2026-10-19', 'W2 TITLE 19'); await H.calDayClose(B); return r }, expect: { put: [/^plan\/dm:2026-10-19$/], also: [ELOG], only: true }, focus: cellFocus('2026-10-19') },
  async (pg) => {
    await H.calTo(pg, '2026-10')
    const a = await H.calCell(pg, '2026-10-18'), b = await H.calCell(pg, '2026-10-19')
    return { what: 'both titles', ok: a && a.title === 'W2 TITLE 18' && b && b.title === 'W2 TITLE 19', detail: { a, b }, said: `18 Oct "${a && a.title}", 19 Oct "${b && b.title}"` }
  })

/* Astra's scenario 22 — planning rows under stale tabs: an INSERT (a note) in A while stale B REORDERS the day's rows;
   then a DELETE in A while stale B adds a man to another row of the same day */
const rowOf = async (pg, iso, pid) => ((await H.planOf(pg, iso)).pp.find(x => (x.ids || []).includes(pid)) || {}).id || null
const secOrder = async (pg, iso) => { const pl = await H.planOf(pg, iso); if (!(await H.calDayOpen(pg, iso))) return null; const ids = await H.secIds(pg); await H.calDayClose(pg); return ids.map(id => { const r = pl.pp.find(x => x.id === id); return r ? (r.kind === 'pucks' ? (r.ids || []).filter(Boolean).map(i => i).join('+') : 'note:' + r.text) : id }) }
let hexRow = null, outRow = null
await H.calTo(A, '2026-10'); await H.calTo(B, '2026-10')
await twoTab('W2-04h', 'two tabs, one day (16 Oct): A inserts a note ("+ Note"); B, not reloaded, drags Outlaw\'s row above Hex\'s (⠿)',
  { name: '+ Note on 16 Oct: "W2 NOTE A"', fn: async () => { hexRow = await rowOf(A, '2026-10-16', 'rocky'); outRow = await rowOf(A, '2026-10-16', 'casper'); const r = await H.addNote(A, '2026-10-16', 'W2 NOTE A'); await H.calDayClose(A); return r }, expect: { put: [/^plan\/pp:/], also: [ELOG], only: true }, focus: cellFocus('2026-10-16') },
  { name: '⠿ Outlaw\'s row dragged above Hex\'s', fn: async () => { if (!(await H.calDayOpen(B, '2026-10-16'))) return 'no popover'; const before = await H.secIds(B); const r = await H.dragSec(B, outRow, hexRow); const after = await H.secIds(B); await H.pic(B, 'W2-04h-drag'); await H.calDayClose(B); return { r, before, after } }, expect: { put: [new RegExp('^plan/pp:' + '.*')], also: [ELOG], only: true }, focus: cellFocus('2026-10-16'),
    assert: a => ({ what: 'the reorder wrote ONE planning row — the moved one', ok: a.put.filter(k => k.startsWith('plan/')).length === 1 && a.put.includes('plan/pp:' + outRow), detail: { put: a.put, ret: a.ret } }) },
  async (pg) => {
    const o = await secOrder(pg, '2026-10-16')
    await H.calTo(pg, '2026-10')
    /* a new note goes on TOP of its day (state/plan.ts addPlanPuck unshifts; a pucks row is pushed to the end): A's
       intent is the note first, B's is Outlaw above Hex — both kept reads note, Outlaw, Hex */
    return { what: 'all three kept, in one order on both tabs: the note (A put it on top), then Outlaw\'s row above Hex\'s (B\'s reorder)', ok: JSON.stringify(o) === JSON.stringify(['note:W2 NOTE A', 'casper', 'rocky']), detail: o, said: `16 Oct: ${JSON.stringify(o)}` }
  })
await twoTab('W2-04i', 'two tabs, one day (16 Oct): A deletes Hex\'s row (✕); B, not reloaded and still showing it, adds Ranger to Outlaw\'s row (+ add)',
  { name: '✕ on Hex\'s row', fn: async () => { await H.calDayOpen(A, '2026-10-16'); const r = await H.delSec(A, hexRow); await H.calDayClose(A); return r }, expect: { del: [new RegExp('^plan/pp:')], also: [ELOG], only: true }, focus: cellFocus('2026-10-16') },
  { name: '+ add on Outlaw\'s row: Ranger', fn: async () => { await H.calDayOpen(B, '2026-10-16'); const r = await H.pkAdd(B, outRow, ['bane']); await H.calDayClose(B); return r }, expect: { put: [new RegExp('^plan/pp:')], also: [ELOG], only: true }, focus: cellFocus('2026-10-16') },
  async (pg) => {
    const o = await secOrder(pg, '2026-10-16')
    const stored = await pg.evaluate(id => localStorage.getItem('raptor:plan/pp:' + id) != null, hexRow)
    await H.calTo(pg, '2026-10')
    return { what: 'Hex\'s row stays deleted (not drawn, not stored); Outlaw\'s row holds Outlaw + Ranger; the note kept', ok: JSON.stringify(o) === JSON.stringify(['note:W2 NOTE A', 'casper+bane']) && !stored, detail: { o, hexStored: stored }, said: `16 Oct: ${JSON.stringify(o)}` }
  })

/* the plan's own two-client test, walked: A deletes a request X while B (opened before, still holding X) files Y —
   X must stay deleted (B's save must not bring it back) */
await H.inputsAll(A); await H.inputsAll(B)
await twoTab('W2-04g', 'two tabs: A deletes Nomad\'s LL (26 Oct); B, not reloaded and still showing it, files an Appointment for Hex (Wed 28 Oct)',
  { name: '✕ on Nomad\'s LL', fn: () => H.delReq(A, iA), expect: { del: [new RegExp('^inputs/' + iA + '$')], also: [ELOG], only: true } },
  { name: 'files an Appointment for Hex, 28 Oct', fn: async () => { const r = await H.fileReq(B, { person: 'rocky', type: 'Appointment', from: '2026-10-28', remarks: 'W2 tab B after A deleted' }); iB = r.iid; return r }, expect: { put: [/^inputs\//], also: [ELOG], only: true }, focus: '#inBody tr:first-child' },
  async (pg) => {
    const o = await H.inputsAll(pg)
    const has = await pg.evaluate(([a, b]) => [window.INPUTS.some(x => x.iid === a), window.INPUTS.some(x => x.iid === b)], [iA, iB])
    const stored = await pg.evaluate(a => localStorage.getItem('raptor:inputs/' + a) != null, iA)
    return { what: 'Nomad\'s LL stays deleted (not on the page, not stored); Hex\'s Appointment there', ok: !has[0] && !stored && has[1] && !o.includes(iA) && o.includes(iB), detail: { deletedBack: has[0], storedBack: stored, newThere: has[1] }, said: `Nomad's LL ${has[0] ? 'CAME BACK' : 'stays deleted'}; Hex's Appointment ${has[1] ? 'there' : 'MISSING'}` }
  }, () => `#inBody tr[data-iid="${iB}"]`)

console.log('\nerrors:', errors.length ? errors : 'none')
H.save({ errors })
await browser.close()
process.exit(0)
