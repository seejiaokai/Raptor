// WALKER 1 — scenario 18 (better or no change: nothing is raised, each with proof the press happened).
// Usage, from raptor-port/:  LW_PORT=4180 [SIZES=phone,desk] [ONLY=a,b,...] node scripts/handpass/lw-night-w1-g.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-g v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(String(id))
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s18-/.test(f) && SIZES.some(s => f.includes(`-${s}-`)) && (!ONLY || [...ONLY].some(o => f.startsWith(`s18${o}-`)))) unlinkSync(path.join(L.OUT, f))
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
async function openRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (!(await rowsOpen(P))) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
/* the day's Available P, the rows opened by hand if a bubble-less press left them folded */
async function readA(w, iso) { const P = w.page; let a = await availCell(P, iso); if (a === null) { await openRows(w); await L.reachCell(w, 'bane', iso); a = await availCell(P, iso) } return a }
async function f1(w, iso, minus = 0) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0) - minus); await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  if (H.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P ${cell.text} ${H.levelOf(cell)}`)
  return { a0, req, cell }
}

for (const size of SIZES) {
  const phone = size === 'phone'
  const w = await H.startWorld(size)
  const P = w.page
  const ids = await H.peopleIds(P)
  const sc = async (id, fn) => { if (!run(id)) return; console.log(`-- S18${id} [${size}]`); try { await fn() } catch (e) { rec(`S18${id}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await H.closeAll(w).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}) } }
  /* the proof-and-reading pattern: press, read the bubble right after, then settled; assert the press happened by the cell's state */
  const noBubble = (b, seen) => [['no bubble (settled)', b.where === 'none', H.bubbleLine(b)], ['no bubble right after the press', !seen || seen.where === 'none', seen ? H.bubbleLine(seen) : 'n/a']]

  /* (a) Refuse a pending bid on a red day */
  await sc('a', async () => {
    const D = '2026-12-08'
    const f = await f1(w, D)
    await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
    const before = await readA(w, D)
    if (phone) { await P.evaluate(() => window.scrollTo(0, 0)) }
    await L.openCellR(w, ids.Hunter, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setManningView(w, true)
    const seen = await H.tapPic(w, T('decide-refuse'), `s18a-${size}-after-tap`)
    await P.waitForTimeout(700)
    const b = await H.bubbleNow(P), k = await H.kinds(w, ids.Hunter, D)
    const after = await readA(w, D)
    const pic = await H.settled(w, `s18a-${size}-settled`)
    judge('S18a Refuse a pending bid on a red day', size, [
      ['proof: the bid now reads refused (s-r)', k.some(x => /^LL\|k-ll\|s-r/.test(x)), JSON.stringify(k)],
      ['the figure got better', Number((after || '').split(' ')[0]) === Number(f.a0), `${before} → ${after}`],
      ...noBubble(b, seen),
    ], `Available P ${before} → ${after}; cell ${JSON.stringify(k)}; ${H.bubbleLine(b)}`, [`s18a-${size}-after-tap.png`, pic])
  })
  /* (b) Delete a bid on a red day */
  await sc('b', async () => {
    const D = '2026-12-09'
    const f = await f1(w, D)
    await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
    const before = await readA(w, D)
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.openCellR(w, ids.Hunter, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setManningView(w, true)
    let seen = await H.tapPic(w, T('bid-clear'), `s18b-${size}-after-tap`)
    await P.waitForTimeout(500)
    if (await L.vis(P, T('bid-picker'))) seen = await H.tapPic(w, T('bid-clear'), `s18b-${size}-after-tap`)
    await P.waitForTimeout(700)
    const b = await H.bubbleNow(P), k = await H.kinds(w, ids.Hunter, D)
    const after = await readA(w, D)
    const pic = await H.settled(w, `s18b-${size}-settled`)
    judge('S18b Delete a bid on a red day', size, [
      ['proof: the cell is empty', k.length === 0, JSON.stringify(k)],
      ['the figure got better', Number((after || '').split(' ')[0]) === Number(f.a0), `${before} → ${after}`],
      ...noBubble(b, seen),
    ], `Available P ${before} → ${after}; ${H.bubbleLine(b)}`, [`s18b-${size}-after-tap.png`, pic])
  })
  /* (c) LL changed to OL, same man, same half */
  await sc('c', async () => {
    const D = '2026-12-10'
    const f = await f1(w, D)
    await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
    const before = await readA(w, D)
    await P.evaluate(() => window.scrollTo(0, 0))
    const r = await H.bidType(w, ids.Hunter, D, { type: 'OL', inView: true, approve: false, name: `s18c-${size}-after-tap` })
    const b = await H.bubbleNow(P)
    const after = await readA(w, D)
    judge('S18c LL changed to OL, same man, same half', size, [
      ['proof: the cell now reads OL (pending)', r.k.some(x => /^OL\|k-ol\|s-w/.test(x)) && !r.k.some(x => /^LL/.test(x)), JSON.stringify(r.k)],
      ['the figure unchanged', after === before, `${before} → ${after}`],
      ...noBubble(b, r.seen),
    ], `Available P ${before} → ${after}; ${H.bubbleLine(b)}`, [`s18c-${size}-after-tap.png`])
  })
  /* (d) a bid that lowers a row still above its amber point */
  await sc('d', async () => {
    const D = '2026-12-11'
    const f = await f1(w, D, 5)
    const before = await readA(w, D)
    const ipB = await H.rowCell(P, `count-ip-${D}`).catch(() => null)
    await P.evaluate(() => window.scrollTo(0, 0))
    const r = await H.bidType(w, ids.Ridge, D, { type: 'LL', inView: true, approve: false, name: `s18d-${size}-after-tap` })
    const b = await H.bubbleNow(P)
    const after = await readA(w, D)
    judge('S18d a bid that lowers Available P but it stays ok (above its point)', size, [
      ['proof: the cell reads LL (pending)', r.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r.k)],
      ['the figure went down by 1 and stays ok', after === `${Number(f.a0) - 1} ok`, `${before} → ${after}`],
      ...noBubble(b, r.seen),
    ], `Required P ${f.req}; Available P ${before} → ${after}; ${H.bubbleLine(b)}`, [`s18d-${size}-after-tap.png`])
  })
  /* (e) a ground-crew man; a man posted out that day; a shown SANS man */
  await sc('e1', async () => {
    const D = '2026-12-14'
    const f = await f1(w, D)
    await P.evaluate(() => window.scrollTo(0, 0))
    const r = await H.bidType(w, ids.Ratchet, D, { type: 'LL', inView: true, approve: false, name: `s18e1-${size}-ground-after-tap` })
    const b = await H.bubbleNow(P)
    const after = await readA(w, D)
    judge('S18e a ground-crew man’s bid', size, [
      ['proof: the cell reads LL (pending)', r.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r.k)],
      ['the figure unchanged (ground crew never count)', after === `${f.a0} ok`, `${f.a0} → ${after}`],
      ...noBubble(b, r.seen),
    ], `Available P ${f.a0} → ${after}; ${H.bubbleLine(b)}`, [`s18e1-${size}-ground-after-tap.png`])
  })
  await sc('e2', async () => {
    const D16 = '2026-12-16', D17 = '2026-12-17'
    const po = await H.postOut(w, ids.Diesel, '2026-12-15')
    await P.evaluate(() => window.scrollTo(0, 0))
    const f = await f1(w, D16)
    if (!(await H.dragCells(w, [ids.Diesel, D16], [ids.Diesel, D17]))) throw new Error('no drag window')
    await H.setSwitch(w, false, 'sel')
    await H.setManningView(w, true)
    const r = await H.selPress(w, T('sel-LL'), `s18e2-${size}-posted-after-tap`, { ask: 'ask-then-go' })
    await P.waitForTimeout(500)
    const b = await H.bubbleNow(P)
    const k = [(await H.kinds(w, ids.Diesel, D16)).join('+'), (await H.kinds(w, ids.Diesel, D17)).join('+')]
    const after = await readA(w, D16)
    judge('S18e a man posted out that day (a fill over his gone days)', size, [
      ['the posting went through', !po.stillOpen, po.line],
      ['proof: the window closed and LL stands on his gone days', !r.open && k.every(x => /LL\|k-ll\|s-w/.test(x)), `open=${r.open} ${JSON.stringify(k)}`],
      ['the figure unchanged (he was already out)', after === `${f.a0} ok`, `${f.a0} → ${after}`],
      ...noBubble(b, r.seen2 || r.seen),
    ], `Available P ${f.a0} → ${after}; ${H.bubbleLine(b)}`, [`s18e2-${size}-posted-after-tap.png`])
  })
  await sc('e3', async () => {
    const D = '2026-12-18'
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.press(w, T('settings-open')); await P.waitForTimeout(500)
    const has = await L.vis(P, T('sans-toggle'))
    if (has) { await L.press(w, T('sans-toggle')); await P.waitForTimeout(600) }
    await L.press(w, T('settings-close')).catch(() => {}); await P.waitForTimeout(500)
    if (!has) { rec('S18e a shown SANS man’s bid', size, 'NOT DONE', 'no "Show SANS" control in the settings window to put SANS men on the roster'); return }
    const f = await f1(w, D)
    const sans = ids.Zenith
    const there = await P.locator(T(`row-${sans}`)).count()
    if (!there) throw new Error('SANS row not drawn: ' + sans)
    await L.reachCell(w, sans, D)
    const r = await H.bidType(w, sans, D, { type: 'LL', inView: true, approve: false, name: `s18e3-${size}-sans-after-tap` })
    const b = await H.bubbleNow(P)
    const after = await readA(w, D)
    judge('S18e a shown SANS man’s bid', size, [
      ['proof: the cell reads LL (pending)', r.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r.k)],
      ['the figure unchanged (a SANS man is never counted in Available P)', after === `${f.a0} ok`, `${f.a0} → ${after}`],
      ...noBubble(b, r.seen),
    ], `Available P ${f.a0} → ${after}; ${H.bubbleLine(b)}`, [`s18e3-${size}-sans-after-tap.png`])
  })
  /* (f) UNA or OD on a day he already holds approved leave */
  await sc('f', async () => {
    const D = '2026-12-21'
    const f = await f1(w, D)
    await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
    await P.evaluate(() => window.scrollTo(0, 0))
    for (const [code, who] of [['UNA', ids.Gambit], ['OD', ids.Ridge]]) {
      await H.bidType(w, who, D, { type: 'LL', inView: true, approve: true }); await H.dismissBubble(w)
      const before = await readA(w, D)
      await P.evaluate(() => window.scrollTo(0, 0))
      const kB = (await H.kinds(w, who, D)).join('+')
      await L.openCellR(w, who, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
      await H.setManningView(w, true)
      const sel = code === 'UNA' ? T('bid-una') : T('bid-file-OD')
      const seen = await H.tapPic(w, sel, `s18f-${size}-${code}-after-tap`)
      await P.waitForTimeout(800)
      const stillOpen = await L.vis(P, T('bid-picker'))
      const note = stillOpen ? ((await L.sheetDump(P))?.text || '').match(/[^|]*(?:already|clash|cannot|not filed|not written|holding)[^|]*/)?.[0] || '' : ''
      if (stillOpen) { await L.closeAny(w) }
      const b = await H.bubbleNow(P), kA = (await H.kinds(w, who, D)).join('+')
      const after = await readA(w, D)
      const pic = await H.settled(w, `s18f-${size}-${code}-settled`)
      judge(`S18f ${code} on a day he already holds approved leave`, size, [
        ['the window answered (closed, or said why)', !stillOpen || note.length > 0, `stillOpen=${stillOpen} note="${note}"`],
        ['the figure unchanged (he was already out)', after === before, `${before} → ${after}`],
        ...noBubble(b, seen),
      ], `cells ${kB} → ${kA}; ${stillOpen ? 'window stayed: "' + note + '"' : 'window closed'}; Available P ${before} → ${after}; ${H.bubbleLine(b)}`, [`s18f-${size}-${code}-after-tap.png`, pic])
      await H.dismissBubble(w)
    }
  })
  /* (g) the second tap on a lit Approve (back to a bid) */
  await sc('g', async () => {
    const D = '2026-12-22'
    const f = await f1(w, D)
    const r0 = await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: true }); await H.dismissBubble(w)
    const before = await readA(w, D)
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.openCellR(w, ids.Hunter, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setManningView(w, true)
    const pressed0 = await P.locator(T('decide-approve')).getAttribute('aria-pressed')
    const seen = await H.tapPic(w, T('decide-approve'), `s18g-${size}-after-tap`)
    await P.waitForTimeout(700)
    const b = await H.bubbleNow(P), k = await H.kinds(w, ids.Hunter, D)
    const after = await readA(w, D)
    const pic = await H.settled(w, `s18g-${size}-settled`)
    judge('S18g the second tap on a lit Approve (back to a bid)', size, [
      ['the leave was approved and Approve lit before', r0.k.some(x => /^LL\|k-ll\|s-a/.test(x)) && pressed0 === 'true', `${JSON.stringify(r0.k)} aria-pressed=${pressed0}`],
      ['proof: the cell is back to a pending bid', k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(k)],
      ['the figure unchanged', after === before, `${before} → ${after}`],
      ...noBubble(b, seen),
    ], `Available P ${before} → ${after}; ${H.bubbleLine(b)}`, [`s18g-${size}-after-tap.png`, pic])
  })
  rec('errors-18', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
H.saveResults(`g-${SIZES.join('-')}${ONLY ? '-' + [...ONLY].join('') : ''}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
