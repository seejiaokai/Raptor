/* [DB-READINESS] group A FULL walk — W2 part A: the first boot, and the requests on the Inputs page
   (brief §W2 steps 1, 2, 3 and 11). One fresh desktop world, driven through the Inputs page's own form, its table's
   ✎ / ✕ and the clash sheet. After every step: the rows it wrote, named by its change-log batch (L.step), and a reload
   that gives everything back and writes nothing (L.reloadCompare), the Inputs page read again.
   Run from raptor-port/scripts/handpass: node dbrA-W2-a.mjs            */
process.env.HP_URL ||= 'http://localhost:4202'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W2'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W2-a.json'
const H = await import('./dbrA-W2-lib.mjs')
const { L, W, sleep } = H

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const p = await L.page(ctx, errors, 'A')

/* ---- the first boot: its rows by collection, ONE change-log batch of type boot ---- */
await L.signIn(p, 'a')
await L.settle(p)
const boot = await L.rows(p)
const bootCols = H.byCollection(boot)
const bootBatches = H.batchList(boot)
console.log('first boot rows by collection', JSON.stringify(bootCols))
{
  const named = new Set((bootBatches[0] && bootBatches[0].items || []).map(i => i.key))
  const others = Object.keys(boot).filter(k => !k.startsWith('changes/'))
  const unnamed = others.filter(k => !named.has(k))
  L.check('W2-00 the first boot wrote ONE change-log batch, of type boot, naming every row it stored',
    bootBatches.length === 1 && bootBatches[0].type === 'boot' && !unnamed.length,
    { batches: bootBatches.map(b => `${b.key} ${b.type}/${b.n} by ${b.actorId}`), rows: others.length, unnamed: unnamed.slice(0, 10) })
}
H.TABLE.push({ step: 'W2-00', width: 'desktop', what: 'a fresh browser signs in (the first boot)', afterReload: '', rows: `first boot: ${JSON.stringify(bootCols)} · batches ${bootBatches.map(b => `${b.type}/${b.n}`).join(' ')}`, pass: L.results.every(r => r.ok), fails: L.results.filter(r => !r.ok).map(r => r.name), pics: [await H.pic(p, 'W2-00-a')] })
await H.toastSpy(p)

const ELOG = /^settings\/elog:/
const reInput = iid => new RegExp('^inputs/' + iid + '$')
const allSame = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* ================= step 1 — one leave: file, edit its remarks, re-date it, delete it ================= */
let iid1 = null, order = null, nb = null, nbm = null
await W(p, {
  id: 'W2-01a', focus: () => `#inBody tr[data-iid="${iid1}"]`, what: 'Inputs page: Saber files an LL for Ranger, Mon 5 – Tue 6 Oct',
  fn: async () => { const r = await H.fileReq(p, { person: 'bane', type: 'LL', from: '2026-10-05', to: '2026-10-06', remarks: 'W2 step 1 leave' }); iid1 = r.iid; return r },
  expect: { put: [/^inputs\//], also: [ELOG], only: true },
  check: async (a) => {
    const inputsPut = a.put.filter(k => k.startsWith('inputs/'))
    const top = (await H.listOrder(p))[0]
    order = await H.inputsAll(p)
    return { what: 'exactly ONE request row, and the new row sits at the top of the table (pinned there after an add)', ok: inputsPut.length === 1 && inputsPut[0] === 'inputs/' + iid1 && top === iid1, detail: { inputsPut, top, iid1, toasts: await H.toasts(p) } }
  },
  after: async () => {
    const o = await H.inputsAll(p), r = await H.inputRow(p, iid1)
    return { what: 'the Inputs page lists the same rows in the same order, the leave among them', ok: allSame(o, order) && r && r.type === 'LL' && r.date === 'Oct 5' && r.endDate === 'Oct 6', detail: { same: allSame(o, order), n: o.length, row: r }, said: `${o.length} rows, same order; LL Oct 5–6 "W2 step 1 leave" listed` }
  },
})
await W(p, {
  id: 'W2-01b', focus: () => `#inBody tr[data-iid="${iid1}"]`, what: 'its ✎ editor: the remarks changed to "W2 step 1 — remarks edited"',
  fn: () => H.editRemarks(p, iid1, 'W2 step 1 — remarks edited'),
  expect: { put: [reInput(iid1)], also: [ELOG], only: true },
  check: async () => { const r = await H.inputRow(p, iid1); order = await H.inputsAll(p); return { what: 'the row reads the new remarks', ok: r && r.remarks === 'W2 step 1 — remarks edited', detail: r } },
  after: async () => { const o = await H.inputsAll(p), r = await H.inputRow(p, iid1); return { what: 'the new remarks, the same order', ok: allSame(o, order) && r && r.remarks === 'W2 step 1 — remarks edited', detail: { same: allSame(o, order), row: r, text: await H.rowText(p, iid1) }, said: 'remarks read "W2 step 1 — remarks edited"; same order' } },
})
await W(p, {
  id: 'W2-01c', focus: () => `#inBody tr[data-iid="${iid1}"]`, what: 'its ✎ editor: re-dated to Wed 7 – Thu 8 Oct',
  fn: () => H.redate(p, iid1, '2026-10-07', '2026-10-08'),
  expect: { put: [reInput(iid1)], also: [ELOG], only: true },
  check: async () => { const r = await H.inputRow(p, iid1); order = await H.inputsAll(p); return { what: 'the row reads Oct 7 – Oct 8', ok: r && r.date === 'Oct 7' && r.endDate === 'Oct 8', detail: r } },
  after: async () => { const o = await H.inputsAll(p), r = await H.inputRow(p, iid1); return { what: 'Oct 7 – Oct 8 kept, the same order (it moved down by date, as the table sorts)', ok: allSame(o, order) && r && r.date === 'Oct 7', detail: { same: allSame(o, order), row: r }, said: 'LL Oct 7–8; same order' } },
})
await W(p, {
  id: 'W2-01d', focus: () => nb ? `#inBody tr[data-iid="${nb}"]` : null, what: 'its ✕ on the table: the leave deleted',
  fn: async () => { const o = await H.inputsAll(p); const i = o.indexOf(iid1); nb = o[i + 1] || o[i - 1] || null; return H.delReq(p, iid1) },
  expect: { del: [reInput(iid1)], also: [ELOG], only: true },
  check: async (a) => { order = await H.inputsAll(p); return { what: 'the row is gone from the table and from the requests', ok: !order.includes(iid1) && !(await H.inputRow(p, iid1)), detail: { toasts: await H.toasts(p) } } },
  after: async () => { const o = await H.inputsAll(p); return { what: 'not back after the reload; the rest in the same order', ok: allSame(o, order) && !(await H.inputRow(p, iid1)), detail: { same: allSame(o, order), n: o.length }, said: `gone; ${o.length} rows in the same order` } },
})
/* a request that LANDS: a Training on the loaded week files onto Thursday's Ground Programme (the week, pristine till
   now, is saved for the first time — its week row and seven day rows, in the same batch as the request) */
let iidT = null
await W(p, {
  id: 'W2-01e', focus: '#eWeek .day[data-day="3"] [data-slot^="g:3."]', what: 'Inputs page: a Training for Ranger on Thu 16 Jul (the loaded week) — it lands on Thursday\'s Ground Programme',
  fn: async () => { const r = await H.fileReq(p, { person: 'bane', type: 'Training', from: '2026-07-16', remarks: 'W2 lands' }); iidT = r.iid; return r },
  expect: { put: [/^inputs\//, /^weeks\/[^#:]+#3$/], also: [ELOG, /^weeks\//], only: true },
  check: async (a) => {
    const ground = await p.evaluate(i => window.DAYS[3].ground.some(g => (g.iid === i) || (g.inp === i) || JSON.stringify(g).includes(i)), iidT)
    await H.closeBoard(p); await L.go(p, 'editsched')
    return { what: 'one request row; Thursday\'s Ground Programme carries it; the week\'s rows written with it', ok: a.put.filter(k => k.startsWith('inputs/')).length === 1 && ground, detail: { ground, weeks: a.put.filter(k => k.startsWith('weeks/')) } }
  },
  after: async () => { await H.closeBoard(p); await L.go(p, 'editsched'); const g = await p.evaluate(i => window.DAYS[3].ground.some(x => JSON.stringify(x).includes(i)), iidT); return { what: 'Thursday\'s Ground Programme still carries the Training', ok: g, detail: { g }, said: 'Thu 16 Jul Ground Programme shows Ranger\'s Training' } },
})

/* ================= step 2 — two requests in a row; then the middle one of the list deleted ================= */
let iidA = null, iidB = null
await W(p, {
  id: 'W2-02a', focus: () => `#inBody tr[data-iid="${iidA}"]`, what: 'two in a row (1 of 2): an Appointment for Ranger, Fri 9 Oct',
  fn: async () => { const r = await H.fileReq(p, { person: 'bane', type: 'Appointment', from: '2026-10-09', remarks: 'W2 two-in-a-row 1' }); iidA = r.iid; return r },
  expect: { put: [/^inputs\//], also: [ELOG], only: true },
  check: async (a) => { const top = (await H.listOrder(p))[0]; return { what: 'one request row; the new one at the top of the table', ok: a.put.filter(k => k.startsWith('inputs/')).length === 1 && top === iidA, detail: { top, iidA } } },
  reload: false,
})
await W(p, {
  id: 'W2-02b', focus: () => `#inBody tr[data-iid="${iidB}"]`, what: 'two in a row (2 of 2): an LL for Blade, Mon 12 Oct — then reload',
  fn: async () => { const r = await H.fileReq(p, { person: 'slash', type: 'LL', from: '2026-10-12', remarks: 'W2 two-in-a-row 2' }); iidB = r.iid; return r },
  expect: { put: [/^inputs\//], also: [ELOG], only: true },
  check: async (a) => {
    const vis = await H.listOrder(p)
    const arr = await p.evaluate(() => window.INPUTS.slice(0, 2).map(x => x.iid))
    order = await H.inputsAll(p)
    return { what: 'one request row; the newest pinned first, the first just under it; the requests list holds the newest first', ok: a.put.filter(k => k.startsWith('inputs/')).length === 1 && vis[0] === iidB && vis[1] === iidA && arr[0] === iidB && arr[1] === iidA, detail: { top2: vis.slice(0, 2), arr } }
  },
  after: async () => { const o = await H.inputsAll(p); const arr = await p.evaluate(() => window.INPUTS.slice(0, 2).map(x => x.iid)); return { what: 'the same order on the page; the requests still newest first', ok: allSame(o, order) && arr[0] === iidB && arr[1] === iidA, detail: { same: allSame(o, order), arr }, said: 'both there; table order the same; newest first behind it' } },
})
let mid = null, rest = null
await W(p, {
  id: 'W2-02c', focus: () => nbm ? `#inBody tr[data-iid="${nbm}"]` : null, what: 'the request in the MIDDLE of the table deleted (its ✕)',
  fn: async () => { const o = await H.inputsAll(p); mid = o[Math.floor(o.length / 2)]; nbm = o[Math.floor(o.length / 2) + 1]; rest = o.filter(x => x !== mid); return { mid, text: await H.rowText(p, mid), del: await H.delReq(p, mid) } },
  expect: { del: [/^inputs\//], also: [ELOG, /^weeks\//, /^leavewar\//], only: true },
  check: async (a) => { const o = await H.inputsAll(p); order = o; return { what: 'the rest keep their order', ok: allSame(o, rest) && a.del.length === 1 && a.del[0] === 'inputs/' + mid, detail: { mid, same: allSame(o, rest), del: a.del, put: a.put } } },
  after: async () => { const o = await H.inputsAll(p); return { what: 'after the reload the rest are in the same order, the deleted one not back', ok: allSame(o, rest) && !o.includes(mid), detail: { same: allSame(o, rest), n: o.length }, said: `the middle row gone; ${o.length} rows in the same order` } },
})

/* ================= step 3 — a medical leave over a medical: the clash rules cut it ================= */
let iidC = null
await W(p, {
  id: 'W2-03a', focus: () => `#inBody tr[data-iid="${iidC}"]`, what: 'an ATT C (medical) for Ranger, Tue 20 – Thu 22 Oct ("No document")',
  fn: async () => { const r = await H.fileReq(p, { person: 'bane', type: 'ATT C', from: '2026-10-20', to: '2026-10-22', remarks: 'W2 med' }); iidC = r.iid; return r },
  expect: { put: [/^inputs\//], also: [ELOG], only: true },
  check: async (a) => ({ what: 'one request row', ok: a.put.filter(k => k.startsWith('inputs/')).length === 1, detail: { iidC } }),
  reload: false,
})
let pieces = null
await W(p, {
  id: 'W2-03b', focus: () => `#inBody tr[data-iid="${iidC}"]`, what: 'an OML (medical leave) for Ranger, Mon 19 – Fri 23 Oct over it; the clash sheet: the ATT C keeps its days',
  fn: async () => {
    const r = await H.fileReq(p, { person: 'bane', type: 'OML', from: '2026-10-19', to: '2026-10-23', remarks: 'W2 cut' })
    await H.pic(p, 'W2-03b-sheet')
    const s = r.clash ? await H.clashAnswer(p, ['old']) : 'NO CLASH SHEET'
    pieces = await p.evaluate(() => window.INPUTS.filter(x => x.person === 'bane' && x.type === 'OML' && /W2 cut/.test(x.remarks || '')).map(x => ({ iid: x.iid, date: x.date, endDate: x.endDate || '' })))
    return { sheet: s, pieces }
  },
  expect: { put: [/^inputs\//], also: [ELOG], only: true },
  check: async (a) => {
    const c = await H.inputRow(p, iidC)
    const ip = a.put.filter(k => k.startsWith('inputs/')).sort(), want = pieces.map(x => 'inputs/' + x.iid).sort()
    return { what: 'the OML is filed as its two pieces (Oct 19 and Oct 23) — ONLY their rows written; the ATT C untouched', ok: pieces.length === 2 && allSame(ip, want) && !a.put.includes('inputs/' + iidC) && c && c.date === 'Oct 20' && c.endDate === 'Oct 22', detail: { pieces, put: ip, attc: c } }
  },
  after: async () => { const ps = await p.evaluate(() => window.INPUTS.filter(x => x.person === 'bane' && x.type === 'OML' && /W2 cut/.test(x.remarks || '')).map(x => x.date + (x.endDate ? '–' + x.endDate : ''))); await H.inputsAll(p); return { what: 'the two pieces and the ATT C as they were', ok: ps.length === 2, detail: ps, said: `OML pieces ${ps.join(', ')}; ATT C Oct 20–22` } },
})
let iidH = null
await W(p, {
  id: 'W2-03c', focus: () => `#inBody tr[data-iid="${iidC}"]`, what: 'an HL for Ranger on Wed 21 Oct over the ATT C; the clash sheet: HL replaces, the leftover (Oct 22) kept',
  fn: async () => {
    const r = await H.fileReq(p, { person: 'bane', type: 'HL', from: '2026-10-21', remarks: 'W2 split' })
    let s = 'NO CLASH SHEET'
    if (r.clash) {
      await p.locator('[data-testid="medclash-0"] button.upconf-seg').first().click(); await sleep(200)
      const keep = p.locator('[data-testid="medclash-tail-0"] button.upconf-seg').nth(1)
      if (await keep.count()) { await keep.click(); await sleep(200) }
      await H.pic(p, 'W2-03c-sheet')
      await p.locator('[data-testid="medclash-save"]').click(); await sleep(700); s = 'saved'
    }
    iidH = await p.evaluate(() => (window.INPUTS.find(x => x.type === 'HL' && /W2 split/.test(x.remarks || '')) || {}).iid || null)
    return { sheet: s }
  },
  expect: { put: [/^inputs\//], also: [ELOG], only: true },
  check: async (a) => {
    const meds = await p.evaluate(() => window.INPUTS.filter(x => x.person === 'bane' && ['ATT C', 'HL'].includes(x.type)).map(x => ({ iid: x.iid, t: x.type, d: x.date + (x.endDate ? '–' + x.endDate : '') })))
    const ip = a.put.filter(k => k.startsWith('inputs/'))
    return { what: 'the ATT C is cut to Oct 20, its leftover Oct 22 kept as a new piece, the HL Oct 21 — three request rows, nothing else', ok: ip.length === 3 && ip.includes('inputs/' + iidC) && ip.includes('inputs/' + iidH) && meds.length === 3, detail: { meds, put: ip } }
  },
  after: async () => { const meds = await p.evaluate(() => window.INPUTS.filter(x => x.person === 'bane' && ['ATT C', 'HL'].includes(x.type)).map(x => x.type + ' ' + x.date + (x.endDate ? '–' + x.endDate : ''))); await H.inputsAll(p); return { what: 'the three pieces as they were', ok: meds.length === 3, detail: meds, said: meds.join(', ') } },
})

/* ================= step 11 — delete EVERY request on the Inputs page, reload: none come back ================= */
{
  const n0 = L.results.length
  const all = await H.inputsAll(p)
  let n = 0, bad = []
  for (const iid of all) {
    const a = await L.step(p, `W2-11 delete ${iid}`, () => H.delReq(p, iid), { del: [reInput(iid)], also: [ELOG, /^weeks\//, /^leavewar\//, /^inputs\//], only: true })
    n++
    if (a.put.some(k => k.startsWith('inputs/')) || a.del.filter(k => k.startsWith('inputs/')).length !== 1) bad.push({ iid, put: a.put.filter(k => !ELOG.test(k)), del: a.del })
    if (n === 1) await H.pic(p, 'W2-11-a-first')
  }
  const left = await H.inputsAll(p)
  const extra = []
  L.check('W2-11 every request deleted through its ✕: the table is empty', !left.length && !(await p.evaluate(() => window.INPUTS.length)), { left: left.length })
  L.check('W2-11 each delete removed exactly its own request row (other rows it wrote are listed)', !bad.length, bad.slice(0, 8))
  await H.pic(p, 'W2-11-a')
  await L.reloadCompare(p, 'W2-11', 'a')
  const after = await H.inputsAll(p)
  const stored = Object.keys(await L.rows(p)).filter(k => k.startsWith('inputs/'))
  L.check('W2-11 after the reload no request comes back — not on the page, not in storage (no demo request returns)', !after.length && !stored.length && !(await p.evaluate(() => window.INPUTS.length)), { page: after.length, stored: stored.length })
  const pic2 = await H.pic(p, 'W2-11-b')
  const rs = L.results.slice(n0)
  const deletes = rs.filter(r => / delete /.test(r.name))
  H.TABLE.push({ step: 'W2-11', width: 'desktop', what: `every request on the Inputs page deleted, one ✕ at a time (${n}), then reload`, afterReload: `${after.length} requests on the page, ${stored.length} stored`, rows: `${n} deletes; ${bad.length} wrote more than their own request row`, pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`.slice(0, 500)), pics: ['W2-11-a-first.png', 'W2-11-a.png', pic2] })
}

console.log('\nerrors:', errors.length ? errors : 'none')
const bad = H.save({ errors, firstBoot: { cols: bootCols, batches: bootBatches.map(b => ({ key: b.key, type: b.type, n: b.n, actorId: b.actorId })) } })
await browser.close()
process.exit(0)
