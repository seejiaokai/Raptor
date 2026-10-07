/* walker C — the ordered pairs {U, V, M} × {Lr, T~}, both orders, from an unpublished and from a published day (24 runs).
   RUNS=0,1,2 picks runs by index (see the list printed with LIST=1). Each run is a fresh world.
   U Unpublish the latest version · V look at the Original and "Load onto working copy" · M the member changes his accepted, OIL-confirmed
   request 06:00–06:30 → 07:00–07:30 · Lr nominal lead 3h → 2h30 · T~ the existing in-time line → IN TIME 08:30.
   Flight VIPER 12:00–13:00, Ranger. Fixture by pair: T~ → an IN TIME 10:00 line; M → the request; else none. */
import * as C from './ows-C-lib.mjs'
const { S, L, W, LW, WB, RC, world, judge, row, pic, sleep, SAT } = C
const di = C.SATI, M = 'bane'
const PAIRS = [['U', 'Lr'], ['U', 'T~'], ['V', 'Lr'], ['V', 'T~'], ['M', 'Lr'], ['M', 'T~']]
const RUNSALL = []
for (const [a, b] of PAIRS) for (const order of [[a, b], [b, a]]) for (const start of ['UNPUB', 'PUB']) RUNSALL.push({ pair: [a, b], order, start })
if (process.env.LIST) { RUNSALL.forEach((r, i) => console.log(i, r.order.join(' then '), r.start)); process.exit(0) }
const pick = (process.env.RUNS || '').split(',').filter(Boolean).map(Number)

async function memberEdit(p, iid) {
  await C.reloadAs(p, 'm'); await sleep(500)
  await L.go(p, 'inputs'); await sleep(700)
  await p.locator('#inRangeBtn').click(); await sleep(300)
  const all = p.locator('button:visible, [role=option]:visible, li:visible', { hasText: /^All dates$/ }).first(); if (await all.count()) { await all.click(); await sleep(500) }
  await p.locator(`#inBody tr[data-iid="${iid}"] [data-edit]`).first().click(); await sleep(400)
  await p.locator('#inBody tr.ined [data-ed="stime"]').fill('07:00'); await p.locator('#inBody tr.ined [data-ed="stime"]').blur()
  await p.locator('#inBody tr.ined [data-ed="etime"]').fill('07:30'); await p.locator('#inBody tr.ined [data-ed="etime"]').blur()
  await p.locator('#inBody tr.ined [data-save]').click(); await sleep(700)
  const conf = p.locator('[data-testid="oilconf"]:visible')
  if (await conf.count()) { await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(500) }
  const after = await p.evaluate(i => { const t = document.querySelector(`#inBody tr[data-iid="${i}"]`); return t ? t.innerText.replace(/\s+/g, ' ').trim().slice(0, 80) : '(row gone)' }, iid)
  await C.reloadAs(p, 'a'); await sleep(400)
  return after
}

async function oneRun(idx, spec) {
  const id = 'PR' + String(idx).padStart(2, '0')
  const { order, pair, start } = spec
  const { browser, p, errors } = await world()
  const log = []
  let iid = null, wi = 0
  try {
    await C.expiryForever(p)
    if (pair.includes('M')) iid = (await RC.fileInput(p, { person: M, type: 'Duty', di, allday: false, from: '06:00', to: '06:30', remarks: id })).iid
    await L.go(p, 'editsched'); await sleep(400)
    const w = await C.flyWave(p, di, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: M }); wi = w.wi
    if (pair.includes('T~')) await C.inTime(p, di, wi, 'IN TIME 10:00')
    await S.closeBoard(p)
    if (start === 'PUB') await C.pubOrig(p, di)
    const snap = async (tag, pics = false) => {
      const o = await C.oilOf(p, M, SAT, id + '-' + tag, { sheet: false, pics })
      const d = await C.dayState(p, di, id + '-' + tag, { list: true, noPic: !pics })
      return { tag, letters: o.letters, cell: o.cell.text, row: o.row.replace(/ \[ARCHIVE OPENED\]/, ''), bal: o.bal, dtag: d.head.tag, chip: d.head.pending, signs: d.signsEmpty ? 'empty' : d.signsFull ? 'full' : d.head.signs.join('|'), list: d.list.slice(0, 260), pics: [...o.pics, ...d.pics] }
    }
    const money = s => `${s.letters}|${s.bal}|${((s.row.match(/·\s*((?:\d\d:\d\d–\d\d:\d\d(?:, )?)+)/) || [])[1]) || '-'}`
    const base = await snap('0-start'); log.push(base)
    const fx = `fixture ${pair.includes('T~') ? 'IN TIME 10:00' : 'no report'}${pair.includes('M') ? ' + request 06:00–06:30' : ''}, ${start}`
    let issued = start === 'PUB'
    const frozen = issued ? base : null     /* the money of the issued ORIGINAL */
    const checks = []
    const chk = (name, ok, detail) => checks.push([name, !!ok, detail])
    chk('start: ' + (issued ? 'published ORIG pays (a credit is on the war)' : 'unpublished pays nothing'), issued ? base.letters === (pair.includes('M') || pair.includes('T~') && false ? 'FO' : base.letters) && /FO|HO/.test(base.cell) : !/FO|HO/.test(base.cell), `${base.cell} bal ${base.bal} tag ${base.dtag}`)
    const act = async (a) => {
      if (a === 'Lr') { const v = await S.logicSet(p, 'reportLead', '2h30'); return `lead now ${v}` }
      if (a === 'T~') { const l = await C.inTimeChange(p, di, wi, 0, 'IN TIME 08:30'); await S.closeBoard(p); return `line reads ${JSON.stringify(l)}` }
      if (a === 'M') { const t = await memberEdit(p, iid); return `member's row now: ${t}` }
      if (a === 'U') { const u = await C.unpublish(p, di); if (!u.pressed) return `ABSENT: ${u.why}`; return `pressed (${u.first}${u.second ? ' → ' + u.afterFirst : ''}); said: ${[...u.toasts].join(' / ').slice(0, 240)}` }
      if (a === 'V') {
        await S.toWeek(p); await W.showDay(p, di)
        const lk = await WB.look(p, di, /Original/i)
        if (lk.err) return `ABSENT: ${lk.err}`
        const ld = await WB.load(p, di, { confirm: true })
        await S.toWeek(p); await WB.backLive(p, di).catch(() => {})
        return `looked at "${lk.label}", Load onto working copy → ${JSON.stringify(ld.said)}${ld.err ? ' ' + ld.err : ''}`
      }
    }
    const names = { Lr: 'Logic lead 3h→2h30', 'T~': 'in-time → 08:30', U: 'Unpublish', V: 'Load Original onto working copy', M: 'member edits request → 07:00–07:30' }
    let prev = base, state = []
    for (let k = 0; k < 2; k++) {
      const a = order[k]
      const said = await act(a)
      const absent = /^ABSENT/.test(said)
      if (a === 'U' && !absent) issued = false
      const s = await snap(`${k + 1}-${a.replace('~', 't')}`, k === 1)
      log.push(s)
      /* money invariants: while an issued version exists the war holds the ORIGINAL's money; after an Unpublish it holds nothing */
      chk(`after ${a}: ${issued ? 'the ORIGINAL\'s money holds (cell, worked times, balance)' : 'no automatic credit on the war, balance back'}`,
        issued ? money(s) === money(frozen) : !/FO|HO/.test(s.cell) && s.bal === '0', `${s.cell} bal ${s.bal} ← ${prev.cell} bal ${prev.bal}; row ${s.row.slice(0, 120)}`)
      if (a === 'U' && absent) chk('U unavailable on an unpublished day: absence verified, data unchanged', start === 'UNPUB' && money(s) === money(prev), said)
      if (a === 'V' && absent) chk('V unavailable with no issued version: absence verified, data unchanged', start === 'UNPUB' && money(s) === money(prev), said)
      state.push({ a, said, chip: s.chip, dtag: s.dtag, signs: s.signs, list: s.list })
      prev = s
    }
    /* the second action: Undo → Redo → reload (the member's own edit is not on the admin's stack: reload only) */
    const s2 = prev, a2 = order[1], a1 = order[0]
    const s1 = log[1]
    let undoNote = ''
    if (a2 !== 'M') {
      await S.closeBoard(p); await S.toWeek(p)
      const u = await W.door(p, 'top', 'undo'); await sleep(500)
      const su = await snap('3-undo'); log.push(su)
      const issuedBefore = start === 'PUB' && !(a1 === 'U' && !/^ABSENT/.test(state[0].said))
      chk(`Undo of ${a2}: back to the state after ${a1}`, u.pressed ? (money(su) === money(s1) && su.dtag === s1.dtag) : /ABSENT/.test(state[1].said), `${JSON.stringify(u).slice(0, 120)} → ${su.cell} bal ${su.bal} tag ${su.dtag} (after ${a1}: ${s1.cell} bal ${s1.bal} tag ${s1.dtag})`)
      const r = await W.door(p, 'top', 'redo'); await sleep(500)
      const sr = await snap('4-redo'); log.push(sr)
      chk(`Redo of ${a2}: the state after ${a2} again`, r.pressed ? (money(sr) === money(s2) && sr.dtag === s2.dtag) : /ABSENT/.test(state[1].said), `${JSON.stringify(r).slice(0, 120)} → ${sr.cell} bal ${sr.bal} tag ${sr.dtag} (after ${a2}: ${s2.cell} bal ${s2.bal} tag ${s2.dtag})`)
      undoNote = `Undo ${u.pressed ? 'pressed' : 'unavailable (' + (u.title || 'no button') + ')'} · Redo ${r.pressed ? 'pressed' : 'unavailable'}`
    } else undoNote = 'M is a member session edit: no admin Undo (reload only)'
    await C.reloadAs(p, 'a'); await sleep(500)
    const sl = await snap('5-reload'); log.push(sl)
    const fin = log.filter(x => /^(2-|4-)/.test(x.tag)).pop()
    chk('after a reload: the same money and tag as before the reload', money(sl) === money(fin) && sl.dtag === fin.dtag, `${sl.cell} bal ${sl.bal} tag ${sl.dtag} chip "${sl.chip}" (before: ${fin.cell} bal ${fin.bal} tag ${fin.dtag} chip "${fin.chip}")`)
    const pics = log.flatMap(x => x.pics)
    const stateTxt = state.map((x, k) => `${k + 1}. ${names[x.a]} → ${x.said.slice(0, 200)} ⇒ day ${x.dtag}, chip "${x.chip}", sign-offs ${x.signs}${x.list ? ', To go out: ' + x.list.slice(0, 200) : ''}`).join(' || ')
    judge(`${id}.${order.join('>')}.${start}`, `${order.map(a => names[a]).join('  THEN  ')} — from ${start === 'PUB' ? 'a PUBLISHED' : 'an UNPUBLISHED'} day (${fx})`, [...checks, ['(record) what the day said', true, stateTxt + ' || ' + undoNote]], pics)
  } catch (e) {
    row(`${id}.${order.join('>')}.${start}`, `${order.join(' then ')} from ${start}`, 'SCRIPT STOPPED: ' + String(e.message || e).slice(0, 400) + ' :: ' + log.map(x => x.tag).join(','), 'NOT WALKED', [])
  }
  const er = errors.filter(x => !/favicon/i.test(x)); if (er.length) row(id + '.err', 'browser errors', er.join(' | ').slice(0, 500), 'FAIL')
  await browser.close()
}
for (const i of pick) await oneRun(i, RUNSALL[i])
C.savePart('ows-C-pairs-' + (process.env.RUNS || 'x').replace(/,/g, '_'))
