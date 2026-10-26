// WALKER 1 — scenarios 1 to 5 (the bubble: under the button, red; desktop keys; second and third bids on a red day; amber; mixed rows).
// Usage, from raptor-port/:  LW_PORT=4180 [SIZES=phone,desk] [ONLY=1,2] node scripts/handpass/lw-night-w1-a.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-a v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(String(id))
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s0[1-5]-/.test(f) && SIZES.some(s => f.includes(`-${s}`))) unlinkSync(path.join(L.OUT, f))

const RED = { border: /240, 85, 95/, bg: /46, 20, 24/, ink: /255, 170, 176/ }
/* judge: a list of [label, ok, observed] → PASS or FAIL with every failing label and its observed value */
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const redBubbleConds = (b, words, where = 'mid') => [
  [`bubble ${where === 'mid' ? 'under the Manning button' : 'at the foot'}`, b.where === where, b.where],
  [`words "${words}"`, b.text === words, b.text],
  ['data-level red', b.level === 'red', b.level],
  ['border red 240,85,95', RED.border.test(b.border || ''), b.border],
  ['fill #2e1418', RED.bg.test(b.bg || ''), b.bg],
  ['words #FFAAB0', RED.ink.test(b.color || ''), b.color],
  ...(b.arrow ? [['arrow fill red-family', RED.bg.test(b.arrow.bg), b.arrow.bg]] : []),
  ...(b.showColor ? [['Show › in red family', RED.ink.test(b.showColor), b.showColor]] : []),
  ['box inside the screen', b.inside, JSON.stringify(b.rect)],
  ...(where === 'foot' ? [['centre hit is the bubble', b.hitIsBubble, b.hitTag]] : []),
  ['not both notes', !(b.all.mid && b.all.foot), JSON.stringify(b.all)],
  ['no sideways page scroll', b.docOverflowX <= 0 && b.pageScrollX === 0, `overflow ${b.docOverflowX} scrollX ${b.pageScrollX}`],
]
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-2026"]'); return !!e && e.getBoundingClientRect().height > 0 })
async function foldRows(w) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  if (await rowsOpen(P)) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) }
  return !(await rowsOpen(P))
}
const cellInView = (P, who, iso) => P.evaluate(([who, iso]) => { const e = document.querySelector(`[data-testid="cell-${who}-${iso}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, r: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] } }, [who, iso])
/* F1: Required P typed equal to the day's Available P; asserts the figure, level and the typed figure */
async function f1(w, iso) {
  const P = w.page
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0))
  await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  if (req !== String(Number(a0)) && req !== a0) throw new Error(`Required P shows "${req}" not ${a0}`)
  if (H.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P is ${cell.text} ${H.levelOf(cell)} — expected ok`)
  return { a0, req, cell }
}
async function setAvailPoints(w, amberText, redText) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  if (!(await H.availP(w, '2026-12-15'))) throw new Error('no avail row')
  await L.press(w, T('fly-name-avail-p')); await P.waitForSelector(T('cform-amber-pt'), { timeout: 4000 })
  await P.locator(T('cform-amber-pt')).fill(amberText); await P.locator(T('cform-red-pt')).fill(redText)
  await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
  if (await L.vis(P, T('counter-form'))) throw new Error('Available P window stayed open: ' + (await L.sheetDump(P))?.text?.slice(0, 160))
}
async function setCounterAmber(w, ruleId, n) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  if (!(await H.availP(w, '2026-12-15'))) throw new Error('no rows')
  await L.press(w, T(`manning-info-${ruleId}`)); await P.waitForTimeout(400)
  await L.press(w, T('counter-edit-open')); await P.waitForSelector(T('cform-amber'), { timeout: 4000 })
  await P.locator(T('cform-amber')).fill(String(n)); await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
  if (await L.vis(P, T('counter-form'))) throw new Error('counter window stayed open: ' + (await L.sheetDump(P))?.text?.slice(0, 160))
}
const cnt = async (P, rule, iso) => H.rowCell(P, `count-${rule}-${iso}`)

for (const size of SIZES) {
  const phone = size.startsWith('phone')
  const engine = size.endsWith('webkit') ? 'webkit' : 'chromium'
  const base = phone ? 'phone' : 'desk'
  const sc = async (id, fn, w) => { if (!run(id)) return; console.log(`-- S${id} [${size}]`); try { await fn() } catch (e) { rec(`S${id}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); if (w) await H.closeAll(w).catch(() => {}) } }

  /* ============ S1 + S3 + S2: one world — 15 Dec (S1, S3), 16 Dec (S2 keys) ============ */
  {
    const w = await H.startWorld(base, engine)
    const P = w.page
    const ids = await H.peopleIds(P)
    const { Drifter, Ridge, Trident, Hunter } = ids
    const D1 = '2026-12-15', D2 = '2026-12-16'

    /* ---- S1: under the button, red (phone); the same at the desktop as a control ---- */
    await sc(1, async () => {
      const f = await f1(w, D1)
      const folded = phone ? await foldRows(w) : true
      const rowsBefore = await rowsOpen(P)
      const r = await H.bidType(w, Drifter, D1, { type: 'LL', inView: true, name: `s01-${size}-after-tap` })
      const b = r.seen
      const bLater = await H.bubbleNow(P)
      const rowsAfter = await rowsOpen(P)
      const cell = await H.rowCell(P, `avail-p-${D1}`)
      const cv = await cellInView(P, Drifter, D1)
      const pic = await H.cropPic(w, `s01-${size}-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D1}`)])
      const whole = await H.settled(w, `s01-${size}-settled-full`)
      const conds = [
        ['F1 fixture: Required P typed equals Available P, level ok', f.cell.text === f.a0, `${f.a0}/${f.req}`],
        [phone ? 'Manning rows folded before the bid (a phone’s start)' : 'Manning rows open before the bid', phone ? (folded && !rowsBefore) : rowsBefore, `folded=${folded} rowsOpenBefore=${rowsBefore}`],
        ['the window closed', !(await L.vis(P, T('bid-picker'))), 'bid-picker visible'],
        ['LL pending on the cell', r.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r.k)],
        ['Manning rows open by themselves', rowsAfter, `rowsOpenAfter=${rowsAfter}`],
        ['Available P 27', cell?.text === String(Number(f.a0) - 1), cell?.text],
        ['Available P in red', H.levelOf(cell) === 'red', `${H.levelOf(cell)} ${cell?.cls} ${cell?.color}`],
        ['the bid’s box still in view', !!cv?.inView, JSON.stringify(cv)],
        ...redBubbleConds(bLater, 'This bid turns Available P red.'),
        ['right-after-tap reading is the same bubble', b.text === bLater.text && b.where === bLater.where, `${b.where}/${b.text}`],
      ]
      judge('S1 bubble', size, conds, `Available P ${f.a0} → ${cell?.text} (${H.levelOf(cell)}); right after the tap: ${H.bubbleLine(b)}; settled: ${H.bubbleLine(bLater)}`, [`s01-${size}-after-tap.png`, pic, whole].filter(Boolean))
      /* reopen the bid window on that bid: the day line reads Available P 27 · red (D1296) */
      await L.openCellR(w, Drifter, D1)
      await P.waitForSelector(T('bid-picker'), { timeout: 4000 })
      const dl = await L.dayline(P)
      const dlp = await H.settled(w, `s01-${size}-reopened-dayline`)
      const bAfterTap = await H.bubbleNow(P)
      judge('S1 reopened day line', size, [
        ['day line names Available P 27 · red', /Available P\s*27\s*·\s*red/.test(dl || ''), dl],
        ['no manning-bubble leftover after the opening tap', bAfterTap.where === 'none', H.bubbleLine(bAfterTap)],
      ], `bid window on the bid reads: "${dl}"`, [dlp])
      await L.closeAny(w)
    }, w)

    /* ---- S3: a second and third bid on the red day (D1345) ---- */
    await sc(3, async () => {
      for (const [who, name, expectFig, tag] of [[Ridge, 'Ridge', 26, 'second'], [Trident, 'Trident', 25, 'third']]) {
        const before = await H.availNow(P, D1)
        const r = await H.bidType(w, who, D1, { type: 'LL', inView: true, name: `s03-${size}-${tag}-after-tap` })
        const b = await H.bubbleNow(P)
        const cell = await H.rowCell(P, `avail-p-${D1}`)
        const pic = await H.cropPic(w, `s03-${size}-${tag}-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D1}`)])
        judge(`S3 ${tag} bid (${name})`, size, [
          [`Available P ${before} → ${expectFig}`, cell?.text === String(expectFig), `${before} → ${cell?.text}`],
          ['LL pending on the cell', r.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r.k)],
          ['not the word "turns"', !/turns/.test(b.text || ''), b.text],
          ...redBubbleConds(b, 'This bid takes Available P lower, still red.'),
        ], `Available P ${before} → ${cell?.text} ${H.levelOf(cell)}; right after the tap: ${H.bubbleLine(r.seen)}; settled: ${H.bubbleLine(b)}`, [`s03-${size}-${tag}-after-tap.png`, pic].filter(Boolean))
      }
    }, w)

    /* ---- S2: under the button on the desktop, and what dismisses it (a click, an arrow key; Tab alone does not) ---- */
    await sc(2, async () => {
      if (phone) { rec('S2', size, 'NOT DONE', 'the list puts S2 on the desktop (keys); the phone is covered by S1/S21 taps'); return }
      const f = await f1(w, D2)
      const steps = [
        { who: Drifter, name: 'a click', act: async () => { await P.mouse.click(700, 8); await P.waitForTimeout(200) }, gone: true, words: 'This bid turns Available P red.' },
        { who: Ridge, name: 'an arrow key', act: async () => { await P.keyboard.press('ArrowDown'); await P.waitForTimeout(200) }, gone: true, words: 'This bid takes Available P lower, still red.' },
        { who: Trident, name: 'Tab alone', act: async () => { await P.keyboard.press('Tab'); await P.waitForTimeout(250) }, gone: false, words: 'This bid takes Available P lower, still red.' },
      ]
      for (const s of steps) {
        await P.evaluate(() => window.scrollTo(0, 0))
        const r = await H.bidType(w, s.who, D2, { type: 'LL', inView: true, name: `s02-${size}-up-before-${s.name.replace(/\W+/g, '')}` })
        const b0 = await H.bubbleNow(P)
        await s.act()
        const b1 = await H.bubbleNow(P)
        const p1 = await H.cropPic(w, `s02-${size}-after-${s.name.replace(/\W+/g, '')}`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D2}`)])
        judge(`S2 ${s.name}`, size, [
          ...redBubbleConds(b0, s.words),
          [s.gone ? `${s.name} makes it go` : `${s.name} leaves it up`, s.gone ? b1.where === 'none' : b1.where === 'mid' && b1.text === s.words, H.bubbleLine(b1)],
        ], `after the bid: ${H.bubbleLine(b0)}; after ${s.name}: ${H.bubbleLine(b1)}`, [`s02-${size}-up-before-${s.name.replace(/\W+/g, '')}.png`, p1].filter(Boolean))
        if (!s.gone) {
          /* after Tab alone, one more key ends it */
          await P.keyboard.press('ArrowDown'); await P.waitForTimeout(200)
          const b2 = await H.bubbleNow(P)
          judge('S2 Tab then a key', size, [['an arrow key after Tab makes it go', b2.where === 'none', H.bubbleLine(b2)]], `after Tab then ArrowDown: ${H.bubbleLine(b2)}`, [])
        }
      }
    }, w)
    H.rec('errors-1', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx) in the S1/S3/S2 world')
    await w.ctx.close()
  }

  /* ============ S4: amber, then lower amber, then red (own world: the Available P points are set) ============ */
  {
    const w = await H.startWorld(base, engine)
    const P = w.page
    const ids = await H.peopleIds(P)
    const D = '2026-12-17'
    await sc(4, async () => {
      await setAvailPoints(w, '+ 4', '+ 2')
      const a0 = await H.availP(w, D)
      let R = Number(a0) - 4, lvl = null
      for (let i = 0; i < 3; i++) {
        await H.setReq(w, D, R); await P.waitForTimeout(300)
        lvl = H.levelOf(await H.rowCell(P, `avail-p-${D}`))
        if (lvl === 'ok') break
        R -= 1
      }
      if (lvl !== 'ok') throw new Error(`could not set a day to ok with the amber point (Required ${R})`)
      const base = await H.rowCell(P, `avail-p-${D}`)
      if (phone) await foldRows(w)
      const seq = [
        { who: ids.Drifter, nm: 'Drifter', exp: ['This bid turns Available P amber.', 'amber'] },
        { who: ids.Ridge, nm: 'Ridge', exp: ['This bid takes Available P lower, still amber.', 'amber'] },
        { who: ids.Trident, nm: 'Trident', exp: ['This bid turns Available P red.', 'red'] },
      ]
      let n = 0
      for (const s of seq) {
        n++
        const before = await H.rowCell(P, `avail-p-${D}`).catch(() => null)
        const r = await H.bidType(w, s.who, D, { type: 'LL', inView: true, name: `s04-${size}-bid${n}-after-tap` })
        const b = await H.bubbleNow(P)
        const cell = await H.rowCell(P, `avail-p-${D}`)
        const pic = await H.cropPic(w, `s04-${size}-bid${n}-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D}`)])
        const conds = [
          ['LL pending', r.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r.k)],
          ['bubble under the button', b.where === 'mid', b.where],
          [`words "${s.exp[0]}"`, b.text === s.exp[0], b.text],
          [`data-level ${s.exp[1]}`, b.level === s.exp[1], b.level],
          ['colour matches the words (red only when it names red)', s.exp[1] === 'red' ? RED.border.test(b.border) : !RED.border.test(b.border) && b.level === 'amber', `${b.level} ${b.border} ${b.bg} ${b.color}`],
          ['the cell level agrees', H.levelOf(cell) === s.exp[1], `${H.levelOf(cell)} ${cell?.text}`],
          ['box inside the screen', b.inside, JSON.stringify(b.rect)],
        ]
        judge(`S4 bid ${n} (${s.nm})`, size, conds, `Required P ${R}, Available P ${a0} base ${base.text} ${H.levelOf(base)} → ${cell?.text} ${H.levelOf(cell)}; right after the tap: ${H.bubbleLine(r.seen)}; settled: ${H.bubbleLine(b)}`, [`s04-${size}-bid${n}-after-tap.png`, pic].filter(Boolean))
      }
    }, w)
    H.rec('errors-4', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx) in the S4 world')
    await w.ctx.close()
  }

  /* ============ S5: mixed rows, the worst colour and the list "A and B" (own world: IP's amber number is set) ============ */
  {
    const w = await H.startWorld(base, engine)
    const P = w.page
    const ids = await H.peopleIds(P)
    const X = '2026-12-17', Y = '2026-12-18'
    await sc(5, async () => {
      const ipx = await H.availP(w, X)
      await setCounterAmber(w, 'ip', 16)
      const ip0 = await cnt(P, 'ip', X)
      const ip0y = await cnt(P, 'ip', Y)
      const fx = await f1(w, X), fy = await f1(w, Y)
      if (phone) await foldRows(w)
      /* X: a non-IP pilot (Drifter) first → Available P red; then an IP pilot (Trident) → IP amber + Available P lower, still red */
      const r1 = await H.bidType(w, ids.Drifter, X, { type: 'LL', inView: true, name: `s05-${size}-x1-after-tap` })
      const b1 = await H.bubbleNow(P)
      judge('S5 setup bid on the F2 day (non-IP pilot)', size, [['LL pending', r1.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r1.k)], ['IP not amber (a non-IP pilot)', H.levelOf(await cnt(P, 'ip', X)) === 'ok', JSON.stringify(await cnt(P, 'ip', X))], ...redBubbleConds(b1, 'This bid turns Available P red.')], `IP before ${ip0.text}; ${H.bubbleLine(b1)}`, [`s05-${size}-x1-after-tap.png`])
      const r2 = await H.bidType(w, ids.Trident, X, { type: 'LL', inView: true, name: `s05-${size}-x2-after-tap` })
      const b2 = await H.bubbleNow(P)
      const ipx2 = await cnt(P, 'ip', X), apx2 = await H.rowCell(P, `avail-p-${X}`)
      const pic2 = await H.cropPic(w, `s05-${size}-x2-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${X}`), T(`count-ip-${X}`)])
      judge('S5 IP amber + Available P lower, still red', size, [
        ['LL pending', r2.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r2.k)],
        ['IP amber', H.levelOf(ipx2) === 'amber', JSON.stringify(ipx2)],
        ['Available P red and lower', H.levelOf(apx2) === 'red' && Number(apx2.text) === Number(fx.a0) - 2, JSON.stringify(apx2)],
        ['not the old comma form', !/IP amber,/.test(b2.text || ''), b2.text],
        ['not amber', b2.level !== 'amber', b2.level],
        ...redBubbleConds(b2, 'This bid turns IP amber and takes Available P lower, still red.'),
      ], `IP ${ip0.text} → ${ipx2.text} ${H.levelOf(ipx2)}; Available P ${fx.a0} → ${apx2.text}; right after: ${H.bubbleLine(r2.seen)}; settled: ${H.bubbleLine(b2)}`, [`s05-${size}-x2-after-tap.png`, pic2].filter(Boolean))
      /* Y: F1 + F3 — an IP pilot's bid turns IP amber and Available P red */
      if (phone) await foldRows(w)
      const r3 = await H.bidType(w, ids.Hunter, Y, { type: 'LL', inView: true, name: `s05-${size}-y1-after-tap` })
      const b3 = await H.bubbleNow(P)
      const ipy = await cnt(P, 'ip', Y), apy = await H.rowCell(P, `avail-p-${Y}`)
      const pic3 = await H.cropPic(w, `s05-${size}-y1-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${Y}`), T(`count-ip-${Y}`)])
      judge('S5 IP amber and Available P red (one bid, two rows turned)', size, [
        ['LL pending', r3.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r3.k)],
        ['IP amber', H.levelOf(ipy) === 'amber', JSON.stringify(ipy)],
        ['Available P red', H.levelOf(apy) === 'red', JSON.stringify(apy)],
        ['not the old comma form', !/IP amber,/.test(b3.text || ''), b3.text],
        ...redBubbleConds(b3, 'This bid turns IP amber and Available P red.'),
      ], `IP ${ip0y.text} → ${ipy.text} ${H.levelOf(ipy)}; Available P ${fy.a0} → ${apy.text}; right after: ${H.bubbleLine(r3.seen)}; settled: ${H.bubbleLine(b3)}`, [`s05-${size}-y1-after-tap.png`, pic3].filter(Boolean))
    }, w)
    H.rec('errors-5', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx) in the S5 world')
    await w.ctx.close()
  }
}
await L.closeBrowser()
H.saveResults(`a-${SIZES.join('-')}${ONLY ? '-' + [...ONLY].join('') : ''}`)
const c = r => results.filter(x => x.verdict === r).length
const results = H.results
console.log('DONE', results.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('NOT DONE'), 'NOT DONE')
