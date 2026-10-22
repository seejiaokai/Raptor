// Walker 3, section D part 2 (scenarios 39-45).  node scripts/handpass/lw-m2-walk-3-d2.mjs [numbers...]
import * as L from './lw-m2-walk-3-lib-r.mjs'
import { writeFileSync } from 'node:fs'
const { T, tap, vis, txt, rec, shot, undo, redo } = L
const only = process.argv.slice(2).map(Number)
const want = n => !only.length || only.includes(n)
const all = []
const run = async (n, fn) => { if (!want(n)) return; try { await fn() } catch (e) { L.rec(n, '?', 'NOT RUN', 'script error: ' + String(e).slice(0, 300)) } }
const near = (a, b, tol) => Math.abs(a - b) <= tol
const cy = b => b.y + b.height / 2
const myl = async w => ({ text: await txt(w.page, T('my-leave')), lve: await txt(w.page, T('my-leave-lve')), oil: await txt(w.page, T('my-leave-oil')), pending: await txt(w.page, T('my-leave-pending')) })
const closeSheets = async w => { for (const t of ['pfig-close', 'bid-cancel', 'daylist-close', 'sel-cancel', 'settings-close']) if (await vis(w.page, T(t))) { await tap(w, T(t)); await w.page.waitForTimeout(250) } }
const pick = async (w, dateIso) => w.page.evaluate(d => document.querySelector(`[data-testid^="cell-"][data-testid$="${d}"]`) ? 1 : 0, dateIso)
const first = s => (s || '').match(/-?\d+(\.\d+)?/)?.[0]

/* 39 My leave */
await run(39, async () => {
  for (const [who, size] of [['admin', 'desk'], ['member', 'phone'], ['admin', 'phone']]) {
    const row = who === 'admin' ? 'stiff' : 'bane'
    const w = await L.newWorld(size); await L.signIn(w, who, who === 'member' ? '2026-01-05' : undefined)
    const d1 = who === 'admin' ? '2026-11-10' : '2026-01-12'
    const d2 = who === 'admin' ? '2026-11-11' : '2026-01-13'
    if (who === 'member') await tap(w, T('month-JAN'))
    const base = await myl(w)
    const barBal = await txt(w.page, T(`bal-${row}`))
    await tap(w, T('my-leave')); await w.page.waitForSelector(T('person-figures'))
    const pwLve = await txt(w.page, T('pfig-lve')); const pwOil = await txt(w.page, T('pfig-oil'))
    await shot(w, `s39-${who}-${size}-person-window`)
    await closeSheets(w)
    const agree = first(base.lve) === first(pwLve) && first(base.oil) === first(pwOil) && first(base.lve) === first(barBal)
    rec(39, `${size} ${who}`, agree ? 'PASS' : 'FAIL', `LVE/OIL agree three places: My leave "${base.lve} / ${base.oil}", name's figure "${barBal}", person window LVE "${pwLve}" OIL "${pwOil}"`, [`s39-${who}-${size}-person-window.png`])
    // half-day pending
    await L.bid(w, row, d1, 'LL', { portion: 'am' })
    const p1 = await myl(w); await shot(w, `s39-${who}-${size}-half-pending`, { clip: { x: 0, y: 0, width: w.page.viewportSize().width, height: 200 } })
    const halfOk = /^0\.5 pending/.test(p1.pending || '') && !/½/.test(p1.text)
    rec(39, `${size} ${who}`, halfOk ? 'PASS' : 'FAIL', `after a half-day pending bid: "${p1.text}" (needs "0.5 pending", no ½)`, [`s39-${who}-${size}-half-pending.png`])
    if (who === 'admin') {
      // approve it
      await tap(w, T(L.cellId(row, d1))); await w.page.waitForSelector(T('bid-picker'))
      await tap(w, T('decide-approve')); await w.page.waitForTimeout(500); await closeSheets(w)
      const p2 = await myl(w); await shot(w, `s39-${who}-${size}-approved`, { clip: { x: 0, y: 0, width: w.page.viewportSize().width, height: 200 } })
      const apprOk = /^0 pending/.test(p2.pending || '') && /next/i.test(p2.text)
      rec(39, `${size} ${who}`, apprOk ? 'PASS' : 'FAIL', `after Approve: "${p2.text}" (needs pending 0 and a next date)`, [`s39-${who}-${size}-approved.png`])
      // refuse a second, later bid
      await L.bid(w, row, d2, 'LL')
      const p3a = await myl(w)
      await tap(w, T(L.cellId(row, d2))); await w.page.waitForSelector(T('bid-picker'))
      await tap(w, T('decide-refuse')); await w.page.waitForTimeout(500); await closeSheets(w)
      const p3 = await myl(w)
      const refOk = /^0 pending/.test(p3.pending || '') && !new RegExp('next ' + d2.slice(8).replace(/^0/, '') + ' ').test(p3.text) && first(p3.lve) === first(p2.lve)
      rec(39, `${size} ${who}`, refOk ? 'PASS' : 'FAIL', `a second whole-day bid: pending "${p3a.pending}" / LVE "${p3a.lve}"; after Refuse: "${p3.text}" (needs not counted, not "next" ${d2.slice(8)}, LVE back to "${p2.lve}")`)
      // second period
      await w.page.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await w.page.waitForTimeout(900)
      await tap(w, T('month-JAN')); await w.page.waitForTimeout(500)
      const iso27 = '2027-01-12'
      const placed = await L.bid(w, row, iso27, 'LL')
      const p4 = await myl(w); await shot(w, `s39-${who}-${size}-second-period`, { clip: { x: 0, y: 0, width: w.page.viewportSize().width, height: 200 } })
      await w.page.selectOption(T('war-picker'), { label: 'JAN - DEC 26' }); await w.page.waitForTimeout(700)
      const p5 = await myl(w)
      rec(39, `${size} ${who}`, placed && /^1 pending/.test(p4.pending || '') && /^1 pending/.test(p5.pending || '') ? 'PASS' : 'FAIL', `a bid in the 2027 period (placed=${placed}): My leave "${p4.text}"; switching back to the 2026 period: "${p5.text}" (needs 1 pending in both)`, [`s39-${who}-${size}-second-period.png`])
    }
    w.errs.forEach(x => all.push('39: ' + x)); await w.ctx.close()
  }
})

/* 40 My leave tap / OIL tracker already up / opening the tracker from a name's OIL figure */
await run(40, async () => {
  for (const [who, size] of [['admin', 'desk'], ['member', 'phone']]) {
    const w = await L.newWorld(size); await L.signIn(w, who, who === 'member' ? '2026-01-05' : undefined)
    await tap(w, T('my-leave')); await w.page.waitForTimeout(400)
    const pwUp = await vis(w.page, T('person-figures'))
    await shot(w, `s40-${who}-${size}-person-window`)
    // OIL tracker from the person window's OIL figure
    await tap(w, T('pfig-oil')); await w.page.waitForTimeout(700)
    const oilUp = await vis(w.page, T('oil-window'))
    const tabs = await w.page.evaluate(() => ({ grid: document.querySelector('[data-testid="lw-tab-grid"]').getAttribute('aria-selected'), oil: document.querySelector('[data-testid="oil-tracker"]').getAttribute('aria-selected') }))
    const pwStill = await vis(w.page, T('person-figures'))
    await shot(w, `s40-${who}-${size}-oil-from-figure`)
    // with the tracker up, is My leave reachable?
    const ml = await w.page.evaluate(() => { const e = document.querySelector('[data-testid="my-leave"]'); if (!e) return null; const b = e.getBoundingClientRect(); const top = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return { covered: !(e === top || e.contains(top)), topEl: top && (top.closest('[data-testid]')?.dataset.testid || top.className) } })
    const tabsHidden = await w.page.evaluate(() => { const e = document.querySelector('[data-testid="oil-tracker"]'); const b = e.getBoundingClientRect(); const top = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return !(e === top || e.contains(top)) })
    if (await vis(w.page, T('oil-close'))) { await tap(w, T('oil-close')); await w.page.waitForTimeout(400) }
    await closeSheets(w)
    const afterClose = await w.page.evaluate(() => ({ grid: document.querySelector('[data-testid="lw-tab-grid"]').getAttribute('aria-selected'), pw: !!document.querySelector('[data-testid="person-figures"]') }))
    rec(40, `${size} ${who}`, pwUp && oilUp && tabs.oil === 'true' ? 'PASS' : 'FAIL', `My leave tap opened his person window=${pwUp}; its OIL figure opened the tracker=${oilUp}, OIL tab aria-selected=${tabs.oil}, Grid=${tabs.grid}; person window left behind=${pwStill}; with the tracker up My leave is covered=${JSON.stringify(ml)} and the tab row itself is covered=${tabsHidden} (so the lit OIL tab cannot be seen); after closing: Grid selected=${afterClose.grid}, person window still open=${afterClose.pw}`, [`s40-${who}-${size}-person-window.png`, `s40-${who}-${size}-oil-from-figure.png`])
    w.errs.forEach(x => all.push('40: ' + x)); await w.ctx.close()
  }
})

/* 42 Rearrange from the gear */
const rowsOrder = w => w.page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].slice(0, 8).map(e => e.dataset.testid.replace('row-', '')))
async function dragRow(w, fromId, toId) {
  const a = await L.boxOf(w.page, T(`drag-${fromId}`)); const b = await L.boxOf(w.page, T(`row-${toId}`))
  const sx = a.x + a.width / 2, sy = a.y + a.height / 2, ex = sx + 4, ey = b.y + b.height * 0.8
  if (w.touch) {
    const pts = [{ x: sx, y: sy }]; for (let i = 1; i <= 8; i++) pts.push({ x: sx + (ex - sx) * i / 8, y: sy + (ey - sy) * i / 8 })
    await L.holdDrag(w, pts, 150)
  } else {
    await w.page.mouse.move(sx, sy); await w.page.mouse.down()
    for (let i = 1; i <= 10; i++) { await w.page.mouse.move(sx + (ex - sx) * i / 10, sy + (ey - sy) * i / 10); await w.page.waitForTimeout(30) }
    await w.page.waitForTimeout(150); await w.page.mouse.up()
  }
  await w.page.waitForTimeout(500)
}
await run(42, async () => {
  for (const size of ['desk', 'phone']) {
    const w = await L.newWorld(size); await L.signIn(w, 'admin')
    const manningBefore = await w.page.evaluate(() => !!document.querySelector('[data-testid="fly-row-req-p"]'))
    await tap(w, T('settings-open')); await w.page.waitForSelector(T('settings-rearrange'))
    await shot(w, `s42-${size}-settings`)
    const label = await txt(w.page, T('settings-rearrange'))
    await tap(w, T('settings-rearrange')); await w.page.waitForTimeout(700)
    const settingsGone = !(await vis(w.page, T('settings-rearrange')))
    const manningNow = await w.page.evaluate(() => !!document.querySelector('[data-testid="fly-row-req-p"]'))
    const done = await w.page.evaluate(() => { const b = document.querySelector('[data-testid="roster-arrange"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { t: b.innerText.replace(/\s+/g, ' ').trim(), w: Math.round(r.width), onBar: r.y < 260, aria: b.getAttribute('aria-label') || b.title } })
    const grips = await w.page.evaluate(() => document.querySelectorAll('[data-testid^="drag-"]').length)
    await shot(w, `s42-${size}-rearranging`)
    const order0 = await rowsOrder(w)
    await dragRow(w, 'shaft', 'snap')
    const order1 = await rowsOrder(w)
    await shot(w, `s42-${size}-after-drop`)
    const moved = order1.join() !== order0.join()
    await undo(w); const order2 = await rowsOrder(w)
    await redo(w); const order3 = await rowsOrder(w)
    await shot(w, `s42-${size}-after-redo`)
    const undone = order2.join() === order0.join(); const redone = order3.join() === order1.join()
    await tap(w, T('roster-arrange')); await w.page.waitForTimeout(600)
    const gripsAfter = await w.page.evaluate(() => document.querySelectorAll('[data-testid^="drag-"]').length)
    const manningAfter = await w.page.evaluate(() => !!document.querySelector('[data-testid="fly-row-req-p"]'))
    await shot(w, `s42-${size}-done`)
    const phoneOk = size === 'desk' || (manningBefore === false && manningAfter === false)
    const ok = settingsGone && manningNow && done && done.onBar && grips > 0 && moved && undone && redone && gripsAfter === 0 && phoneOk
    rec(42, size === 'desk' ? 'desk1536' : 'phone390', ok ? 'PASS' : 'FAIL', `gear -> line "${label}"; Settings closed=${settingsGone}; Manning rows visible before=${manningBefore}, while rearranging=${manningNow}, after Done=${manningAfter}; bar button reads "${done && done.t}" (width ${done && done.w}, title "${done && done.aria}"); drag handles=${grips}; dragged Anvil below Snap: ${order0.slice(0, 5)} -> ${order1.slice(0, 5)} (moved=${moved}); Undo back=${undone} (${order2.slice(0, 5)}); Redo again=${redone}; after Done handles=${gripsAfter}`, [`s42-${size}-settings.png`, `s42-${size}-rearranging.png`, `s42-${size}-after-drop.png`, `s42-${size}-done.png`])
    w.errs.forEach(x => all.push('42: ' + x)); await w.ctx.close()
  }
})

/* 43 member: no gear, no Rearrange */
await run(43, async () => {
  for (const size of ['desk', 'phone']) {
    const w = await L.newWorld(size); await L.signIn(w, 'member', '2026-01-05')
    const gear = await L.has(w.page, T('settings-open')); const rear = await L.has(w.page, T('roster-arrange')) || await L.has(w.page, T('settings-rearrange'))
    // keyboard: Tab through the top and look for any settings control
    let reached = false
    await w.page.evaluate(() => window.scrollTo(0, 0))
    for (let i = 0; i < 14; i++) { await w.page.keyboard.press('Tab'); const t = await w.page.evaluate(() => (document.activeElement?.getAttribute('data-testid') || '') + '|' + (document.activeElement?.getAttribute('aria-label') || '')); if (/settings/i.test(t)) reached = true }
    await shot(w, `s43-${size}-member-top`)
    const sheetOpen = await vis(w.page, T('settings-close'))
    rec(43, size === 'desk' ? 'desk1536' : 'phone390', !gear && !rear && !reached && !sheetOpen ? 'PASS' : 'FAIL', `member: gear in page=${gear}; Rearrange control in page=${rear}; Tab x14 reached a Settings control=${reached}; a Settings window open=${sheetOpen}`, [`s43-${size}-member-top.png`])
    w.errs.forEach(x => all.push('43: ' + x)); await w.ctx.close()
  }
})

/* 44 zoom pair */
await run(44, async () => {
  for (const size of ['desk', 'phone']) {
    const w = await L.newWorld(size); await L.signIn(w, 'admin')
    const present = await vis(w.page, T('lw-zoom'))
    const read = () => w.page.evaluate(() => ({ out: document.querySelector('[data-testid="lw-zoom-out"]').disabled, inn: document.querySelector('[data-testid="lw-zoom-in"]').disabled, z: getComputedStyle(document.querySelector('table.mx')).zoom, cw: document.querySelector('table.mx').getBoundingClientRect().width }))
    const s0 = await read()
    const seq = [s0]
    for (let i = 0; i < 6; i++) { if ((await read()).out) break; await tap(w, T('lw-zoom-out')); seq.push(await read()) }
    await shot(w, `s44-${size}-zoomed-out`)
    for (let i = 0; i < 12; i++) { if ((await read()).inn) break; await tap(w, T('lw-zoom-in')); seq.push(await read()) }
    await shot(w, `s44-${size}-zoomed-in`)
    const end = seq[seq.length - 1]
    rec(44, size === 'desk' ? 'desk1536' : 'phone390', present && seq.some(s => s.out) && end.inn ? 'PASS' : 'FAIL', `zoom pair present=${present}; start zoom ${s0.z} out-disabled=${s0.out} in-disabled=${s0.inn}; steps seen (zoom/out-disabled/in-disabled): ${seq.map(s => `${s.z}/${s.out}/${s.inn}`).join(' ')}`, [`s44-${size}-zoomed-out.png`, `s44-${size}-zoomed-in.png`])
    w.errs.forEach(x => all.push('44: ' + x)); await w.ctx.close()
  }
})

/* 45 short screen */
await run(45, async () => {
  const w = await L.newWorld('side'); await L.signIn(w, 'admin')
  await w.page.evaluate(() => window.scrollTo(0, 0))
  const bar = await w.page.evaluate(() => { const ids = ['counts-toggle', 'open-chip', 'lw-zoom', 'legend-open']; return ids.map(i => { const e = document.querySelector(`[data-testid="${i}"]`); if (!e) return [i, null]; const b = e.getBoundingClientRect(); return [i, [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]] }) })
  const ys = bar.filter(x => x[1]).map(x => x[1][1] + x[1][3] / 2)
  const one = Math.max(...ys) - Math.min(...ys) < 8
  const vw = 844
  const inside = bar.filter(x => x[1]).every(x => x[1][0] >= 0 && x[1][0] + x[1][2] <= vw)
  await shot(w, 's45-side-bar')
  const dw = await L.docWidth(w.page)
  await tap(w, T('legend-open')); await w.page.waitForTimeout(400)
  const legendUp = await vis(w.page, T('legend'))
  await shot(w, 's45-side-legend')
  rec(45, 'side 844x390', one && inside && legendUp && dw.sw <= dw.cw ? 'PASS' : 'FAIL', `bar controls ${JSON.stringify(bar)}; one line=${one}; all inside the screen=${inside}; document ${dw.sw}/${dw.cw}; Legend opened=${legendUp}`, ['s45-side-bar.png', 's45-side-legend.png'])
  w.errs.forEach(x => all.push('45: ' + x)); await w.ctx.close()
})

writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-leave-war-overhaul-e11c0a/41598151-b62f-4130-886a-f6dcd3903085/scratchpad/w3-d2.out.json', JSON.stringify({ results: L.results, errs: all }, null, 1))
console.log('ERRORS', JSON.stringify(all))
await L.closeBrowser()
