// shr-a-a13 — share A, A13 (the plain-user round): file the leave, open the Board, type on his row (start 0900 Tab, end
// 1100 Tab), open the input's window from the leave's name and close it by EACH of its ways (Cancel, ✕, Escape, a tap
// outside), Undo, then look at the Inputs page, the week, the Leave War grid and the bell.
// EXPECTED: every way of closing closes that window and nothing else. RECORD what each page shows.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium node scripts/handpass/shr-a-a13.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, rowSel, typeIn, pressAt, pic, away, fixture, note, caret, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a13 v1', TAG)
const steps = [], pics = [], checks = [], recs = []
const chk = (n, ok, seen) => checks.push(`${ok ? 'ok' : 'WRONG'} ${n}: ${seen}`)
const winOpen = p => p.evaluate(() => { const w = document.querySelector('#inpEditPop'); if (!w) return false; const r = w.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(w).visibility !== 'hidden' })
const boardOpen = p => p.evaluate(() => { const b = document.querySelector('#schedBoard'); return !!b && b.getBoundingClientRect().width > 0 })
try {
  const w = await world(); const p = w.page
  const iid = await fixture(w); await openBoard(w)
  steps.push(await read(p, 'filed'))
  await typeIn(w, await boxSel(p, 'Ranger', 'str'), '0900', 'Tab'); await typeIn(w, await boxSel(p, 'Ranger', 'end'), '1100', 'Tab')
  steps.push(await read(p, 'start 0900 Tab, end 1100 Tab'))
  for (const way of ['Cancel', '✕', 'Escape', 'tap outside']) {
    const row = await rowSel(p, 'Ranger')
    await pressAt(w, `${row} .inpedit`, `label-${way}`)
    const head = await p.evaluate(() => (document.querySelector('#inpEditPop')?.innerText || '').split('\n')[0])
    const o1 = await winOpen(p)
    pics.push(await pic(w, `a13-window-before-${way.replace(/\W/g, '') || 'x'}`, ['#inpEditPop']))
    if (way === 'Cancel') await pressAt(w, '#inpEditCancel', 'cancel')
    else if (way === '✕') await pressAt(w, '#inpEditClose', 'x')
    else if (way === 'Escape') { await p.keyboard.press('Escape'); await sleep(600) }
    else {
      const pt = await p.evaluate(() => { const r = document.querySelector('#inpEditPop .airpop-box, #inpEditPop [class*="box"]')?.getBoundingClientRect() || document.querySelector('#inpEditPop').getBoundingClientRect(); const x = r.left > 40 ? r.left / 2 : (r.right + innerWidth) / 2; const y = Math.min(innerHeight - 20, Math.max(20, r.top > 60 ? r.top / 2 : r.bottom + 20)); const e = document.elementFromPoint(x, y); return { x, y, what: e ? e.tagName + '.' + e.className : 'none', box: [r.left, r.top, r.right, r.bottom].map(Math.round) } })
      recs.push(`tap outside at (${Math.round(pt.x)},${Math.round(pt.y)}), on ${pt.what}; window box ${J(pt.box)}`)
      if (w.tap) await p.touchscreen.tap(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y)
      await sleep(700)
    }
    const asked = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth && /Discard|Keep|Close it/i.test(b.textContent)).map(b => b.textContent.trim()))
    const o2 = await winOpen(p), b2 = await boardOpen(p)
    const r = await read(p, `window ("${head}") closed by ${way}`); steps.push({ ...r, asked })
    pics.push(await pic(w, `a13-after-${way.replace(/\W/g, '') || 'x'}`, ['body']))
    chk(`${way} closes that window and nothing else`, o1 && !o2 && b2 && J(r.store) === J(steps[1].store), `opened ${o1} ("${head}"), open after ${o2}, Board open ${b2}, asked ${J(asked)}, store ${J(r.store)}`)
    if (o2) { await p.keyboard.press('Escape'); await sleep(500) }
  }
  const u = await (async () => { await pressAt(w, '#sbUndo', 'undo'); return read(p, 'Undo pressed') })(); steps.push(u)
  recs.push(`after Undo: store ${J(u.store)}; rows ${J(u.screen)}; ${u.undo}`)
  pics.push(await pic(w, 'a13-after-undo'))
  /* the other pages */
  await pressAt(w, '#sbDone'); await sleep(600)
  await L.openDay(w, L.WED)
  const inp = await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-iid], [data-testid="win-inputsday"] [data-popiid]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /Ranger|Hex/.test(t)))
  recs.push(`Inputs page, Wed 15 Jul: ${J(inp)}`)
  pics.push(await pic(w, 'a13-inputs-page', ['[data-testid="win-inputsday"]']))
  if (await p.locator('[data-testid="win-inputsday-x"]').count()) await L.press(w, '[data-testid="win-inputsday-x"]')
  await L.go(p, 'editsched'); await sleep(500)
  const wk = await p.evaluate(() => [...document.querySelectorAll('#eWeek [data-inp]')].filter(e => /~(bane|rocky)\.|^[^~]+\.(str|end|rmks)$/.test(e.getAttribute('data-inp'))).map(e => e.getAttribute('data-inp') + '=' + (e.value ?? e.textContent)).filter(s => s.length < 120).slice(0, 30))
  const wkRows = await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day')].find(d => /15/.test(d.querySelector('.dh, .dayh, h3, .hd')?.textContent || '') ) || document.querySelector('#eWeek .day[data-day="2"]'); return d ? [...d.querySelectorAll('[data-inprow]')].filter(r => r.querySelector('[data-person="bane"],[data-person="rocky"]')).map(r => r.innerText.replace(/\s+/g, ' ').trim() + ' ' + [...r.querySelectorAll('input,textarea')].map(i => i.value).join('|')) : ['no day'] })
  recs.push(`the week, Wed 15: rows ${J(wkRows)}`)
  await p.evaluate(() => document.querySelector('#eWeek .day[data-day="2"]')?.scrollIntoView({ block: 'start' }))
  pics.push(await pic(w, 'a13-week', ['#eWeek .day[data-day="2"]']))
  await L.go(p, 'leavewar'); await sleep(800)
  const mon = p.locator('[data-testid="month-JUL"]').first(); if (await mon.count()) { await mon.click(); await sleep(1200) }
  const cells = await p.evaluate(() => ['bane', 'rocky'].map(x => { const td = document.querySelector(`[data-testid="cell-${x}-2026-07-15"]`); return `${x}: ${td ? td.innerText.replace(/\s+/g, ' ').trim() || '(empty)' : 'no cell'}` }))
  recs.push(`Leave War grid, 15 Jul: ${J(cells)}`)
  await p.evaluate(() => document.querySelector('[data-testid="cell-bane-2026-07-15"]')?.scrollIntoView({ block: 'center', inline: 'center' }))
  pics.push(await pic(w, 'a13-leavewar', ['[data-testid="cell-bane-2026-07-15"]', '[data-testid="cell-rocky-2026-07-15"]']))
  const bell = await L.openBell(w)
  recs.push(`the admin's bell: ${J(bell.slice(0, 8).map(l => `${l.name} ${l.day} / ${l.what}`))}`)
  pics.push(await pic(w, 'a13-bell', ['[data-testid="bell-list"]']))
  add('A13', checks.every(c => c.startsWith('ok')) ? 'PASS' : 'FAIL', { fixture: iid, checks, steps }, pics)
  add('A13-pages', 'RECORDED', recs.join(' ; '), pics)
} catch (e) { add('A13', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J({ checks, recs, steps }).slice(0, 3000), pics) }
await done('a13')
