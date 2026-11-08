// W1b part 2: S24 (faces), S30 (changes-window jump), S31 (hidden page, return). SZ=pc|phone ONLY=s24,s30,s31
import * as L from './sm-lib.mjs'
const SZ = process.env.SZ || 'pc'
const ONLY = (process.env.ONLY || 's24,s30,s31').split(',')
console.log('sm-w1b-b v1', SZ, ONLY.join(','))
const OUT = L.outDir('w1b')
const ORIGIN = 'http://localhost:4392'
const D = di => `#eWeek section.day[data-day="${di}"]`
const rows = []
const rec = (id, exp, got, verdict, pic = '') => { rows.push({ id, size: SZ, exp, got, verdict, pic }); console.log(`[${verdict}] ${id} | ${typeof got === 'string' ? got : JSON.stringify(got)} | ${pic}`) }
const sleep = L.sleep
async function fresh(pub = [2]) {
  const W = await L.launch(SZ, { origin: ORIGIN }); await L.signIn(W)
  for (const d of pub) { const r = await L.publishDay(W, d); if (!r.published) console.log('PUBLISH FAIL', JSON.stringify(r)); await L.closeBoard(W) }
  return W
}
const unav = (page, di) => page.evaluate(di => {
  const day = document.querySelector(`#eWeek section.day[data-day="${di}"]`); if (!day) return { err: 'no day' }
  const out = []
  for (const r of day.querySelectorAll('.sec-unav .pl-row')) {
    if (r.getBoundingClientRect().height <= 0) continue
    const b = r.querySelector('.nm .ntx'); if (!b) continue
    const cs = getComputedStyle(b)
    out.push({ name: b.textContent.trim().slice(0, 30), dotted: cs.textDecorationStyle === 'dotted' && cs.textDecorationLine.includes('underline'), color: cs.textDecorationColor })
  }
  const pend = [...day.querySelectorAll('.dpend')].find(e => /pending/.test(e.textContent))
  return { pend: pend ? pend.textContent.trim() : null, rows: out }
}, di)
const brief = s => s.err ? s.err : `pend=${s.pend} rows=` + s.rows.map(r => `${r.name}${r.dotted ? '[DOTTED ' + r.color + ']' : '[plain]'}`).join(';')
const ll = s => (s.rows || []).find(r => r.name === 'LL')
const run = async (k, fn) => { if (!ONLY.includes(k)) return; try { await fn() } catch (e) { rec(k + '.CRASH', '', e.message.split('\n')[0], 'NOT DRIVEN') } }
// everything painted dotted (underline or outline) inside a root, with its text
const dottedIn = (page, root) => page.evaluate(root => {
  const r = document.querySelector(root); if (!r) return { err: 'no ' + root }
  const out = []
  for (const e of r.querySelectorAll('*')) {
    if (e.getBoundingClientRect().width <= 0) continue
    const cs = getComputedStyle(e)
    const u = cs.textDecorationStyle === 'dotted' && cs.textDecorationLine.includes('underline')
    const o = cs.outlineStyle === 'dotted' && parseFloat(cs.outlineWidth) > 0
    if (u || o) out.push((u ? 'U ' : 'O ') + (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24))
  }
  return { n: out.length, items: out.slice(0, 10), aln: [...r.querySelectorAll('[data-aln]')].filter(e => e.getBoundingClientRect().width > 0).length, mute: r.querySelectorAll('.witem-mute,.wln-mute').length }
}, root)

await run('s24', async () => {
  const W = await fresh()
  await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
  await L.fileInput(W, { who: 'Saint', type: 'Meeting', iso: '2026-07-15', remarks: 'Safety brief' })
  await L.goEdit(W)
  const s = await unav(W.page, 2)
  const gr = await W.page.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="2"] .pl-row.gr-frominput .ntx')].filter(b => b.getBoundingClientRect().height > 0).map(b => { const cs = getComputedStyle(b); return b.textContent.trim().slice(0, 20) + ' ' + cs.textDecorationStyle + ' aln=' + b.dataset.aln }))
  await L.center(W.page, `${D(2)} .sec-unav`); await sleep(400)
  rec('S24.0 admin Edit Schedule (reference)', '2 pending, Ground name and LL name both dotted', `${brief(s)} // Ground: ${gr.join('; ')}`, 'RECORDED', await L.pic(W, OUT, `${SZ}-s24-0-admin-edit`, { sel: `${D(2)} .sec-unav` }))
  // View-only Sched as admin
  await W.page.evaluate(() => window.go('viewsched')); await sleep(1500)
  const VD = '#vWeek section.day[data-day="2"]'
  await L.center(W.page, VD); await sleep(400)
  let d1 = await dottedIn(W.page, VD)
  const sels = await W.page.evaluate(() => [...document.querySelectorAll('#vWeek section.day[data-day="2"] select')].filter(e => e.getBoundingClientRect().width).map(e => e.id + '|' + [...e.options].map(o => o.value + '=' + o.text.trim().slice(0, 30)).join(',')))
  rec('S24.1 View-only Sched (admin) default face', 'follows the Ground name on the same face', JSON.stringify(d1) + ' selects=' + sels.join(' ;; '), 'RECORDED', await L.pic(W, OUT, `${SZ}-s24-1-viewonly-admin`, { sel: VD }))
  // each face
  const sel = W.page.locator(`${VD} select`).filter({ visible: true }).first()
  if (await sel.count()) {
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text.trim() })))
    for (const [i, o] of opts.entries()) {
      await sel.selectOption(o.v); await sleep(900)
      const d = await dottedIn(W.page, VD); await L.center(W.page, VD)
      // the Ground name vs the unavailable name on this face
      const gu = await W.page.evaluate(() => { const day = document.querySelector('#vWeek section.day[data-day="2"]'); const f = sel => { const e = [...day.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0); return e.map(x => x.textContent.trim().slice(0, 12) + ':' + getComputedStyle(x).textDecorationStyle).slice(0, 4).join('|') }; return { ground: f('.gr-frominput .ntx, .gr-frominput [data-aln]'), unav: f('.sec-unav .ntx') } })
      rec(`S24.2.${i} View-only face "${o.t}"`, 'Unavailable name follows Ground name', JSON.stringify(d) + ' ' + JSON.stringify(gu), 'RECORDED', await L.pic(W, OUT, `${SZ}-s24-2-face${i}`, { sel: VD }))
    }
  } else rec('S24.2 View-only faces', 'RECORD', 'no version select found on day 2 of the view-only page', 'NOT DRIVEN')
  // member
  await W.page.evaluate(() => window.raptorRole('member')); await sleep(1500)
  const role = await W.page.evaluate(() => window.CURPAGE)
  await L.center(W.page, VD).catch(() => {}); await sleep(400)
  const dm = await dottedIn(W.page, VD)
  rec('S24.3 member on View-only Sched (page=' + role + ')', 'same as Ground; no x / Reset', JSON.stringify(dm), dm.mute === 0 ? 'RECORDED' : 'FAIL', await L.pic(W, OUT, `${SZ}-s24-3-member`, { sel: VD }))
  const mgr = await W.page.evaluate(() => { const d = document.querySelector('#vWeek section.day[data-day="2"]'); return { warn: d ? d.querySelectorAll('.witem-mute').length : -1, menu: typeof window.openScheduler } })
  // member face selector
  const msel = W.page.locator(`${VD} select`).filter({ visible: true }).first()
  if (await msel.count()) {
    const opts = await msel.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text.trim() })))
    for (const [i, o] of opts.entries()) {
      await msel.selectOption(o.v); await sleep(900); const d = await dottedIn(W.page, VD)
      rec(`S24.4.${i} member face "${o.t}"`, 'RECORD', JSON.stringify(d), 'RECORDED', await L.pic(W, OUT, `${SZ}-s24-4-member-face${i}`, { sel: VD }))
    }
  }
  // board as member
  const bopen = await W.page.evaluate(async () => { try { window.openScheduler(2); await new Promise(r => setTimeout(r, 1200)); const b = document.querySelector('#schedBoard'); return b ? { open: true, unav: [...b.querySelectorAll('.sb-panel.unav .sbi-ty')].filter(x => x.getBoundingClientRect().width > 0).map(x => x.textContent.trim().slice(0, 10) + ':' + getComputedStyle(x).outlineStyle).join('|'), mute: b.querySelectorAll('.wln-mute').length, ro: b.className } : { open: false } } catch (e) { return { err: e.message } } })
  rec('S24.5 board as a member', 'read-only; Unavailable box follows Ground; no x / Reset', JSON.stringify(bopen) + ' ' + JSON.stringify(mgr), 'RECORDED', await L.pic(W, OUT, `${SZ}-s24-5-board-member`, {}))
  if (bopen.open) { await L.center(W.page, '#schedBoard .sb-panel.unav'); await sleep(300); await L.pic(W, OUT, `${SZ}-s24-5b-board-member-unav`, { sel: '#schedBoard .sb-panel.unav' }); await L.closeBoard(W) }
  // guest
  await W.page.evaluate(() => { try { window.raptorRole('guest') } catch (e) {} }); await sleep(1500)
  const gst = await W.page.evaluate(() => ({ page: window.CURPAGE, body: document.body.innerText.replace(/\s+/g, ' ').slice(0, 120) }))
  const dg = await dottedIn(W.page, VD)
  rec('S24.6 guest', 'RECORD; guest medical info protected; no x / Reset', JSON.stringify(gst) + ' ' + JSON.stringify(dg), 'RECORDED', await L.pic(W, OUT, `${SZ}-s24-6-guest`, {}))
  rec('S24 errors', 'none', W.errs.join(' || ') || 'none', 'RECORDED')
  await L.closeAll(W)
})

await run('s30', async () => {
  const W = await fresh()
  await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15', remarks: 'a long remark to make the row tall and wrap on small screens' })
  await L.goEdit(W); await W.page.evaluate(() => window.scrollTo(0, 0)); await sleep(500)
  const open = async () => { await L.press(W, W.page.locator(`${D(2)} [data-pendlist="2"]`)); await sleep(900) }
  await open()
  const win = await W.page.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? { btns: [...w.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width).map(b => (b.dataset.chgtab || '') + '|' + b.textContent.trim().slice(0, 24)), lines: [...w.querySelectorAll('[data-chgline],[data-chggo],.chgrow,.chgline,li')].slice(0, 6).map(e => e.className + '|' + e.textContent.trim().slice(0, 40)) } : null })
  rec('S30.0 changes window opened from the day', 'RECORD', JSON.stringify(win), 'RECORDED', await L.pic(W, OUT, `${SZ}-s30-0-window`, {}))
  const jump = async (label, pickText) => {
    const line = W.page.locator('.chgwin').getByText(pickText).first()
    const before = await W.page.evaluate(() => window.scrollY)
    await L.press(W, line); await sleep(1400)
    const r = await W.page.evaluate(() => {
      const b = [...document.querySelectorAll(`#eWeek section.day[data-day="2"] .sec-unav .pl-row`)].find(x => /LL/.test(x.textContent) && x.getBoundingClientRect().height > 0)
      const winOpen = !!document.querySelector('.chgwin') && document.querySelector('.chgwin').getBoundingClientRect().width > 0
      const board = !!document.querySelector('#schedBoard')
      const input = !!document.querySelector('[data-testid="win-inputedit"]')
      if (!b) return { rowFound: false, winOpen, board, input, y: scrollY }
      const rc = b.getBoundingClientRect(); const mx = rc.x + rc.width / 2, my = rc.y + rc.height / 2
      const top = document.elementFromPoint(mx, my); const inRow = top && b.contains(top)
      const n = b.querySelector('.nm .ntx'); const cs = n && getComputedStyle(n)
      return { rowFound: true, top: Math.round(rc.top), bottom: Math.round(rc.bottom), vh: innerHeight, visible: rc.top >= 0 && rc.bottom <= innerHeight, atMid: inRow, covered: top ? (top.className || top.tagName).toString().slice(0, 30) : null, dotted: cs && cs.textDecorationStyle, winOpen, board, input, y: scrollY }
    })
    rec('S30.' + label, 'row brought into view, identifiable, still dotted', `scrollBefore=${before} ` + JSON.stringify(r), r.rowFound && r.visible && r.atMid && r.dotted === 'dotted' ? 'PASS' : 'FAIL', await L.pic(W, OUT, `${SZ}-s30-${label.replace(/\W+/g, '_')}`, {}))
    return r
  }
  await jump('1 tap line "Bolt LL" grouped by item', /Bolt\s*·\s*LL|LL/)
  // close the window by each way then reopen and group by who
  await W.page.evaluate(() => window.scrollTo(0, 0)); await sleep(400)
  const stillOpen = await W.page.evaluate(() => { const w = document.querySelector('.chgwin'); return !!w && w.getBoundingClientRect().width > 0 })
  rec('S30.1b window after the jump', 'RECORD', 'changes window still open=' + stillOpen, 'RECORDED')
  if (!stillOpen) await open()
  // lesson 4: press the page behind the open window
  const behind = await W.page.evaluate(() => { const b = document.querySelector('#eWeek section.day[data-day="4"] [data-planmenu="4"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, onscreen: r.top > 0 && r.bottom < innerHeight } })
  if (behind) {
    await L.center(W.page, `${D(4)} [data-planmenu="4"]`); await sleep(300)
    await L.press(W, `${D(4)} [data-planmenu="4"]`); await sleep(600)
    const m = await W.page.evaluate(() => ({ menu: !!document.querySelector('.wavemenu') && document.querySelector('.wavemenu').getBoundingClientRect().width > 0, win: !!document.querySelector('.chgwin') && document.querySelector('.chgwin').getBoundingClientRect().width > 0 }))
    rec('S30.2 press the page behind the open changes window (Friday plans menu)', 'RECORD: page behind works', JSON.stringify(m), 'RECORDED', await L.pic(W, OUT, `${SZ}-s30-2-behind`, {}))
    await W.page.keyboard.press('Escape'); await sleep(400)
  }
  // close by Escape, by x
  await W.page.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  if (!(await W.page.locator('.chgwin').count())) await open()
  await W.page.keyboard.press('Escape'); await sleep(500)
  const afterEsc = await W.page.evaluate(() => !!document.querySelector('.chgwin') && document.querySelector('.chgwin').getBoundingClientRect().width > 0)
  await open(); const x = W.page.locator('.chgwin button').filter({ hasText: '✕' }).first(); await L.press(W, x); await sleep(500)
  const afterX = await W.page.evaluate(() => !!document.querySelector('.chgwin') && document.querySelector('.chgwin').getBoundingClientRect().width > 0)
  rec('S30.3 closing the window: Escape, then ✕', 'window closes each way', `after Escape open=${afterEsc}; after ✕ open=${afterX}`, !afterEsc && !afterX ? 'PASS' : 'RECORDED')
  // group by Who: find a tab
  await open()
  const tabs = await W.page.evaluate(() => [...document.querySelectorAll('.chgwin button, .chgwin [role=tab]')].filter(b => b.getBoundingClientRect().width).map(b => b.textContent.trim().slice(0, 20)))
  rec('S30.4 window tabs / groupings offered', 'RECORD', tabs.join(' | '), 'RECORDED')
  const byWho = W.page.locator('.chgwin button').filter({ hasText: /^Who$|By who|Who/ }).first()
  if (await byWho.count()) { await L.press(W, byWho); await sleep(500); await jump('5 tap line grouped by Who', /LL/) } else rec('S30.5 group by Who', 'RECORD', 'no Who grouping control found', 'NOT DRIVEN')
  // board open then window
  await W.page.keyboard.press('Escape').catch(() => {}); await sleep(300)
  await L.openBoard(W, 2)
  const bp = await W.page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-pendlist],#schedBoard [data-chgday]')].filter(b => b.getBoundingClientRect().width).map(b => b.textContent.trim().slice(0, 20)))
  rec('S30.6 board: is a changes-window opener drawn', 'RECORD', bp.join(' | ') || 'none', 'RECORDED')
  if (bp.length) {
    await L.press(W, W.page.locator('#schedBoard [data-pendlist],#schedBoard [data-chgday]').filter({ visible: true }).first()); await sleep(900)
    await jump('7 tap line with the board open', /LL/)
  }
  rec('S30 errors', 'none', W.errs.join(' || ') || 'none', 'RECORDED')
  await L.closeAll(W)
})

await run('s31', async () => {
  const W = await fresh()
  await L.goEdit(W)
  const first = async name => { // go back to Edit Schedule and read the very first frame
    await W.page.evaluate(() => window.go('editsched'))
    const f = L.pic(W, OUT, `${SZ}-s31-${name}-first`, {})
    const s0 = await unav(W.page, 2); await f
    await sleep(1500); const s1 = await unav(W.page, 2)
    return { first: s0, settled: s1 }
  }
  await W.page.evaluate(() => window.go('viewsched')); await sleep(1200)
  await W.page.evaluate(() => window.go('inputs')); await sleep(1000)
  await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
  const t0 = Date.now(); await sleep(16000)
  const r = await first('filed')
  rec('S31.1 filed on Inputs, away 16 s, back to Edit Schedule (go)', 'first frame already marked + 1 pending', `away=${Math.round((Date.now() - t0) / 1000)}s first: ${brief(r.first)} // settled: ${brief(r.settled)}`, ll(r.first) && r.first.rows.find(x => x.name === 'LL').dotted && /^1/.test(r.first.pend || '') ? 'PASS' : 'FAIL', `${SZ}-s31-filed-first.png`)
  await L.center(W.page, `${D(2)} .sec-unav`); await L.pic(W, OUT, `${SZ}-s31-filed-settled`, { sel: `${D(2)} .sec-unav` })
  // other route: the nav button
  await W.page.evaluate(() => window.go('inputs')); await sleep(1000)
  const nb = W.page.getByRole('button', { name: /Edit Schedule/ }).filter({ visible: true }).first()
  let navDone = false
  if (await nb.count()) { await L.press(W, nb); navDone = true } else {
    const menu = W.page.locator('#menuBtn, [aria-label*="enu"], .hamb').filter({ visible: true }).first()
    if (await menu.count()) { await L.press(W, menu); await sleep(600); const nb2 = W.page.getByText('Edit Schedule', { exact: true }).filter({ visible: true }).first(); if (await nb2.count()) { await L.press(W, nb2); navDone = true } }
  }
  if (navDone) { await sleep(60); const f = await L.pic(W, OUT, `${SZ}-s31-nav-first`, {}); const s0 = await unav(W.page, 2); rec('S31.2 return by the page-name button', 'marked at the first frame', brief(s0), ll(s0) && ll(s0).dotted ? 'PASS' : 'FAIL', f) }
  else rec('S31.2 return by the page-name button', 'RECORD', 'no Edit Schedule name button or menu found by role/text', 'NOT DRIVEN')
  // undo from the Inputs page, wait, return
  await W.page.evaluate(() => window.go('inputs')); await sleep(1000)
  await W.page.evaluate(() => window.scrollTo(0, 0)); await L.press(W, '#undoBtn'); await sleep(900)
  await sleep(16000)
  const r2 = await first('undone')
  rec('S31.3 Undo on Inputs, away 16 s, back', 'first frame: no LL row, no pending', `first: ${brief(r2.first)} // settled: ${brief(r2.settled)}`, !ll(r2.first) && r2.first.pend == null ? 'PASS' : 'FAIL', `${SZ}-s31-undone-first.png`)
  // redo from inputs
  await W.page.evaluate(() => window.go('inputs')); await sleep(1000)
  await W.page.evaluate(() => window.scrollTo(0, 0)); await L.press(W, '#redoBtn'); await sleep(900); await sleep(16000)
  const r3 = await first('redone')
  rec('S31.4 Redo on Inputs, away 16 s, back', 'first frame marked, 1 pending', `first: ${brief(r3.first)} // settled: ${brief(r3.settled)}`, ll(r3.first) && ll(r3.first).dotted && /^1/.test(r3.first.pend || '') ? 'PASS' : 'FAIL', `${SZ}-s31-redone-first.png`)
  // publish AL1 from board, away on View-only, return
  await L.goEdit(W); await L.publishDay(W, 2); await L.closeBoard(W)
  await W.page.evaluate(() => window.go('viewsched')); await sleep(1000); await sleep(16000)
  const r4 = await first('published')
  rec('S31.5 Publish AL1, away on View-only 16 s, back', 'first frame clean: LL plain, no pending', `first: ${brief(r4.first)} // settled: ${brief(r4.settled)}`, ll(r4.first) && !ll(r4.first).dotted && r4.first.pend == null ? 'PASS' : 'FAIL', `${SZ}-s31-published-first.png`)
  rec('S31.6 Leave War as the hidden page', 'RECORD', 'not driven: the route to the Leave War was not proven in this world', 'NOT DRIVEN')
  rec('S31 errors', 'none', W.errs.join(' || ') || 'none', 'RECORDED')
  await L.closeAll(W)
})

L.saveJson(OUT, `w1b-b-${SZ}-${ONLY.join('_')}`, rows)
console.log('DONE')
