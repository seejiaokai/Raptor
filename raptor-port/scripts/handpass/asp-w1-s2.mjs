// asp-w1-s2 — S2: in place of the event row, an input of kind Event filed for ALL AVAIL on Sat 18 Jul 10:00–17:00, its
// OIL question answered Yes; Hex named on the 08:00–09:00 briefing; posted out as SANS from Wed 15 Jul; publish;
// "+ SANS" both ways.  Run from raptor-port/:  ONLY=d|p node scripts/handpass/asp-w1-s2.mjs
import * as L from './asp-w1-lib.mjs'
const { sleep, J, HEX, SAT, SAT_ISO, B } = L
const VERSION = 'asp-w1-s2 v1'
const ONLY = (process.env.ONLY || 'd,p').split(',')
console.log(VERSION, L.URL_, ONLY.join(','))
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

async function inputsDay(p, W, iso) {
  await L.go(p, 'inputs'); await sleep(500)
  if (!(await p.locator('#inpCal').count())) { const c = p.locator('#inCalBtn:visible').first(); if (await c.count()) await W.press(p, c, 'cal-view') }
  const [y, m] = iso.split('-').map(Number)
  for (let i = 0; i < 30; i++) {
    const [name, yy] = (await p.locator('#inpCal .ic-mon').first().innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+yy * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await p.locator(d > 0 ? '#icNext' : '#icPrev').first().click(); await sleep(350)
  }
  await sleep(400)
  const day = p.locator(`#inpCal [data-icday="${iso}"]`).first()
  if (W.isPhone) { await day.tap({ position: { x: 8, y: 8 } }); await p.screenshot({ path: W.dir + `/taps/${W.scn}-day-${iso}-now-phone.png` }) }
  else await day.click({ position: { x: 8, y: 8 } })
  await sleep(600)
}

async function run(k) {
  const sz = L.SIZES[k], RUN = 's2-' + sz.name
  L.clearRun(RUN)
  const W = L.mk(RUN, 's2', sz)
  const { b, p } = await L.world(sz, W)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('premise', 'the app\'s today', null, await L.today(p))
    /* 1. the input: Inputs calendar → Sat 18 Jul → + Input → Event, ALL AVAIL, 10:00–17:00 → Add → OIL Yes → Save */
    await inputsDay(p, W, SAT_ISO)
    await W.press(p, '#icPopAdd:visible', 'plus-input')
    await p.waitForSelector('[data-testid="win-inputedit"]', { timeout: 8000 })
    await p.selectOption('#inpEditType', 'Event'); await sleep(250)
    const opts = await p.locator('#inpEditPerson option').evaluateAll(os => os.map(o => o.value).filter(v => /all/i.test(v)))
    await p.selectOption('#inpEditPerson', 'allavail'); await sleep(250)
    const ad = p.locator('#inpEditAllday'); if (await ad.count() && await ad.isChecked()) await W.press(p, ad, 'allday-off')
    for (const [sel, v] of [['#inpEditStart', '10:00'], ['#inpEditEnd', '17:00']]) { const l = p.locator(sel).first(); if (await l.count()) { await l.fill(v); await l.evaluate(e => e.blur()) } }
    const rmk = p.locator('#inpEditRmk'); if (await rmk.count()) await rmk.fill('SQN EVENT W1')
    const draft = await W.pic(p, '01a-input-window')
    await W.press(p, '#inpEditSave:visible', 'add'); await sleep(600)
    let oil = 'not asked'
    if (await p.locator('[data-testid="oilconf"]:visible').count()) {
      const ask = ((await p.locator('[data-testid="oilconf"]').innerText()) || '').replace(/\s+/g, ' ').slice(0, 200)
      await W.pic(p, '01b-oil-question')
      await W.press(p, '[data-testid="oil-yes"]:visible', 'oil-yes'); await W.press(p, '[data-testid="oilconf-save"]:visible', 'oil-save'); await sleep(600)
      oil = 'asked: ' + ask
    }
    const inp = await p.evaluate(() => { const x = window.INPUTS.find(i => i.remarks === 'SQN EVENT W1' || i.rmk === 'SQN EVENT W1'); return x ? { iid: x.iid, person: x.person, people: x.people, type: x.type || x.kind, s: x.s, e: x.e, oil: x.oil, acc: x.acc } : null })
    W.rec('s2-01', 'Event input for ALL AVAIL on Sat 18 Jul 10:00–17:00 filed, OIL answered Yes', !!inp && /allavail/.test(J(inp)) && /Yes|yes|FO|true|1/.test(J(inp.oil)), `placeholder options ${J(opts)} · ${oil} · read from window.INPUTS: ${J(inp)}`, draft + ', ' + await W.pic(p, '01c-filed'))
    const x = p.locator('[data-testid="win-inputsday"] .win-x:visible, .floatwin .win-x:visible').first(); if (await x.count()) await W.press(p, x, 'close-day')
    /* 2. the briefing naming Hex on the board */
    await L.openBoard(p, W, SAT)
    const br = await L.briefingRow(p, W, SAT, HEX)
    const where = await p.evaluate(i => ({ allhands: window.DAYS[i].allhands.map(r => r.prog + '|' + r.who + '|' + (r.iid || '')), ground: window.DAYS[i].ground.map(r => r.prog + '|' + r.who) }), SAT)
    W.rec('s2-02', 'BRIEFING 08:00–09:00 naming Hex on the board; the input\'s row on the Common Programme', br.row && br.row.who === HEX, `${J(br.row)} · rows ${J(where)}`, await W.pic(p, '02-board-rows'))
    await L.closeBoard(p, W)
    /* 3. posting */
    const po = await L.postOutSans(p, W, HEX, '2026-07-15', '03')
    W.rec('s2-03', 'Hex posted out as SANS from Wed 15 Jul', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
    /* 4. the input's crowd before Publish, sign and publish */
    await L.openBoard(p, W, SAT)
    const o1 = await L.openChip(p, W, '#schedBoard', SAT, null)
    W.rec('s2-04', 'board, before Publish: the input row\'s window lists Hex (purple SANS line)', o1.win.has === true, `chips ${J(o1.chips)} · window ${J(o1.win)}`, await W.pic(p, '04-window-before'))
    await L.closeWin(p, W)
    await L.signAll(p)
    const pt = await L.publish(p, W, SAT)
    const pe = await L.pendingOf(p, SAT)
    const o2 = await L.openChip(p, W, '#schedBoard', SAT, null)
    W.rec('s2-05', `published (${pt}): nothing pending, the window lists Hex`, pe.pend === 0 && o2.win.has === true, `${J(pe)} · chip ${J(o2.chip)} · window ${J(o2.win)}`, await W.pic(p, '05-published-window'))
    const base = { n: o2.win.n, chipTxt: o2.chip && o2.chip.txt }
    await L.closeWin(p, W)
    await L.closeBoard(p, W)
    const lw = await L.lwCell(p, W, HEX, SAT_ISO)
    W.rec('s2-06', 'Hex\'s Leave War cell Sat 18 Jul reads FO', /^FO/.test(lw.text), `cell "${lw.text}"`, await W.pic(p, '06-lw-cell'))
    /* 5. both ways */
    for (const [i, on] of [[7, true], [8, false]]) {
      const s = await L.sansOnWar(p, W, on, `0${i}-sans-${on ? 'on' : 'off'}`)
      const c = (await L.lwCell(p, W, HEX, SAT_ISO)).text
      const S = await L.satLook(p, W, `0${i}-${on ? 'on' : 'off'}`, null)
      W.rec(`s2-0${i}`, `"+ SANS" ${on ? 'on' : 'off'}: nothing pending, signed, same count, Hex in the input's crowd, cell FO`, s.groupAfter === on && S.pe.pend === 0 && !S.pe.notSigned && /SIGNED/i.test(S.pe.signed) && S.win.has === true && S.win.n === base.n && /^FO/.test(c), `pending ${S.pe.pend} · signed "${S.pe.signed.slice(0, 70)}" · chip ${J(S.chip)} · window ${J(S.win)} · cell "${c}"`, [s.pic, S.picDay, S.picWin].join(', '))
    }
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}
for (const k of ONLY) await run(k)
L.saveResults('s2-' + ONLY.join('_'))
console.log('done')
