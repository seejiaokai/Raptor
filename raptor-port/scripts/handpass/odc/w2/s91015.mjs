// W2 scenarios 9, 10, 15 — desktop only. A fresh world per scenario. VERSION 1
import { openWorld, tools, adminCategory } from './lib.mjs'
console.log('s91015 VERSION 1')
const all = []

async function fresh(prefix) {
  const w = await openWorld('desktop'); const t = tools(w, prefix)
  await adminCategory(w.page, '^Users')
  await w.page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
  return { w, t, page: w.page }
}
const cardRect = page => page.evaluate(() => { const c = document.querySelector('[data-testid="dcal-card"]'); if (!c) return null; const b = c.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), vw: innerWidth, vh: innerHeight } })
const boxRect = (page, sel) => page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) } }, sel)
const scrollers = page => page.evaluate(() => { const out = []; let e = document.querySelector('#accAddPostIn'); while (e) { if (e.scrollHeight > e.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)) out.push(e.tagName + '#' + e.id + '.' + e.className + ' top=' + e.scrollTop); e = e.parentElement } out.push('window y=' + scrollY); return out })

// ---------------------- 9
{
  const { w, t, page } = await fresh('desktop-s9')
  console.log('\n== 9')
  const box = '#accAddPostIn'
  await t.press(box)
  const c0 = await t.cardOnTop('Post in (1440x900)')
  const b0 = await boxRect(page, box)
  console.log(`S9 at 1440x900: box ${JSON.stringify(b0)}; card ${JSON.stringify(await cardRect(page))}; card left - box left = ${c0.l - b0.l}; card top - box bottom = ${c0.t - b0.b}`)
  await t.shot('s9-open-1440')
  await t.closeCal()
  await page.setViewportSize({ width: 1280, height: 640 }); await page.waitForTimeout(400)
  // scroll so the box sits near the foot
  const sc = await page.evaluate(() => {
    const e = document.querySelector('#accAddPostIn'); let p = e.parentElement
    while (p && !(p.scrollHeight > p.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(p).overflowY))) p = p.parentElement
    const target = p || document.scrollingElement
    const r = e.getBoundingClientRect(); target.scrollTop += r.bottom - (innerHeight - 40)
    return (p ? p.tagName + '#' + p.id + '.' + p.className : 'window')
  })
  await page.waitForTimeout(300)
  const b1 = await boxRect(page, box)
  console.log(`S9 at 1280x640, scroller ${sc}: box ${JSON.stringify(b1)} (viewport height 640)`)
  await t.press(box)
  const c1 = await t.cardOnTop('Post in (near the foot)')
  const cr1 = await cardRect(page)
  const above = c1.b <= b1.t + 2
  console.log(`S9 near the foot: card ${JSON.stringify(cr1)}; opens above the box: ${above}; left aligned: ${c1.l - b1.l}`)
  await t.shot('s9-open-near-foot')
  // the wheel
  const before = await scrollers(page)
  const cb = await cardRect(page), bb = await boxRect(page, box)
  await page.mouse.move(150, 300)
  await page.mouse.wheel(0, 300); await page.waitForTimeout(400)
  const after = await scrollers(page)
  const open1 = !!(await cardRect(page)), ca = await cardRect(page), ba = await boxRect(page, box)
  console.log(`S9 wheel over the page (mouse at 150,300): scrollers before ${JSON.stringify(before)} after ${JSON.stringify(after)}; calendar still open=${open1}; card ${JSON.stringify(cb)} -> ${JSON.stringify(ca)}; box ${JSON.stringify(bb)} -> ${JSON.stringify(ba)}`)
  await t.shot('s9-after-wheel-page')
  // wheel over the card itself
  if (open1) {
    await page.mouse.move((ca.l + ca.r) / 2, (ca.t + ca.b) / 2); const sB = await scrollers(page)
    await page.mouse.wheel(0, 300); await page.waitForTimeout(400)
    const sA = await scrollers(page); const cc = await cardRect(page)
    console.log(`S9 wheel over the card: scrollers before ${JSON.stringify(sB)} after ${JSON.stringify(sA)}; open=${!!cc}; card ${JSON.stringify(ca)} -> ${JSON.stringify(cc)}`)
    await t.shot('s9-after-wheel-card')
  }
  t.rec('9', 'desktop', c0.wholly && c0.onTop && c0.l - b0.l === 0 && c1.wholly && above ? 'PASS' : 'CHECK', `1440x900: card left-box left=${c0.l - b0.l}px, card top-box bottom=${c0.t - b0.b}px; 1280x640 box near foot (bottom ${b1.b}): card ${JSON.stringify(cr1)} above the box=${above}, wholly=${c1.wholly}; wheel over the page: ${JSON.stringify(before)} -> ${JSON.stringify(after)}, calendar open=${open1}, card ${JSON.stringify(cb)} -> ${JSON.stringify(ca)}`, 'desktop-s9-open-1440.png / s9-open-near-foot.png / s9-after-wheel-*.png')
  all.push(...t.results); console.log('errors', JSON.stringify(w.errors)); await w.browser.close()
}

// ---------------------- 10
{
  const { w, t, page } = await fresh('desktop-s10')
  console.log('\n== 10')
  const act = () => page.evaluate(() => { const a = document.activeElement; if (!a) return 'none'; return (a.getAttribute('data-testid') || a.id || a.tagName + '.' + (a.className || '')) + (a.getAttribute('aria-label') ? ' [' + a.getAttribute('aria-label') + ']' : '') })
  await page.focus('#accAddName'); await page.keyboard.press('Tab'); await page.waitForTimeout(150)
  const a1 = await act(); console.log(`S10 Tab from the sign-in field goes to: ${a1}`)
  const v0 = await t.val('#accAddPostIn')
  await page.keyboard.press('Enter'); await page.waitForTimeout(350)
  const open = !!(await cardRect(page)); const a2 = await act()
  console.log(`S10 Enter: calendar open=${open}; keyboard on: ${a2}`)
  await t.shot('s10-opened')
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(120); const a3 = await act()
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(120); const a4 = await act()
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(120); const a5 = await act()
  await page.keyboard.press('ArrowUp'); await page.waitForTimeout(120); const a6 = await act()
  console.log(`S10 arrows right/down/left/up: ${a3} / ${a4} / ${a5} / ${a6}`)
  const m0 = await page.getAttribute('[data-testid="dcal"]', 'data-month')
  await page.keyboard.press('PageDown'); await page.waitForTimeout(250)
  const m1 = await page.getAttribute('[data-testid="dcal"]', 'data-month'); const a7 = await act()
  console.log(`S10 Page Down: month ${m0} -> ${m1}; keyboard on ${a7}`)
  await t.shot('s10-pagedown')
  await page.keyboard.press('Enter'); await page.waitForTimeout(350)
  const v1 = await t.val('#accAddPostIn'); const a8 = await act(); const closed = !(await cardRect(page))
  console.log(`S10 Enter on ${a7}: box now ${v1} (was ${v0}); calendar closed=${closed}; keyboard on ${a8}`)
  await t.shot('s10-picked')
  // open again, Escape
  await page.keyboard.press('Enter'); await page.waitForTimeout(350)
  const open2 = !!(await cardRect(page))
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  const v2 = await t.val('#accAddPostIn'); const closed2 = !(await cardRect(page)); const a9 = await act()
  console.log(`S10 reopened=${open2}; Escape: closed=${closed2}; box ${v2} (unchanged from ${v1}: ${v2 === v1}); keyboard on ${a9}`)
  await t.shot('s10-escape')
  // Tab order inside an open calendar
  await page.keyboard.press('Enter'); await page.waitForTimeout(350)
  const tabs = []
  for (let i = 0; i < 9; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(100); tabs.push(await act()) }
  console.log(`S10 Tab inside the open calendar goes: ${tabs.join('  ->  ')}`)
  const stillOpen = !!(await cardRect(page))
  console.log(`S10 after 9 Tabs the calendar is still open: ${stillOpen}`)
  await t.shot('s10-tabbed')
  t.rec('10', 'desktop', 'RECORD', `Tab from the sign-in field lands on ${a1}; Enter opens=${open}, keyboard on ${a2}; arrows right/down/left/up -> ${a3} / ${a4} / ${a5} / ${a6}; Page Down month ${m0} -> ${m1} (on ${a7}); Enter picks: box ${v0} -> ${v1}, closed=${closed}, keyboard back on ${a8}; Escape: closed=${closed2}, box unchanged=${v2 === v1}, keyboard on ${a9}; Tab inside the open calendar: ${tabs.join(' -> ')} (still open=${stillOpen})`, 'desktop-s10-*.png')
  all.push(...t.results); console.log('errors', JSON.stringify(w.errors)); await w.browser.close()
}

// ---------------------- 15
{
  const { w, t, page } = await fresh('desktop-s15')
  console.log('\n== 15')
  const box = '#accAddPostIn'
  await t.press(box)
  const c0 = await t.cardOnTop('Post in (1440)')
  const rep = async label => {
    const open = !!(await cardRect(page)); const cr = await cardRect(page); const bx = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width) } }, box)
    const ch = await page.evaluate(() => { const c = document.querySelector('[data-testid="dcal-card"]'); if (!c) return null; const b = c.getBoundingClientRect(); const at = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === c || c.contains(h)) }; return { onTop: at(b.left + b.width / 2, b.top + b.height / 2), scrim: !!document.querySelector('[data-testid="dcal-scrim"]'), month: document.querySelector('[data-testid="dcal"]').getAttribute('data-month') } })
    const wholly = cr ? cr.l >= 0 && cr.t >= 0 && cr.r <= cr.vw && cr.b <= cr.vh : null
    console.log(`S15 ${label}: calendar open=${open}; card ${JSON.stringify(cr)}; box ${JSON.stringify(bx)}; wholly on screen=${wholly}; ${JSON.stringify(ch)}; admin shows: ${await page.evaluate(() => { const bk = document.querySelector('#page-admin .adm-back'); return bk && bk.getBoundingClientRect().width > 0 ? 'one category at a time (a back button is showing)' : 'list + panel side by side' })}`)
    return { open, cr, bx, wholly, ch }
  }
  const r1440 = await rep('1440 wide (start)')
  await page.setViewportSize({ width: 800, height: 900 }); await page.waitForTimeout(500)
  const r800 = await rep('800 wide')
  await t.shot('s15-800')
  await page.setViewportSize({ width: 560, height: 900 }); await page.waitForTimeout(500)
  const r560 = await rep('560 wide')
  await t.shot('s15-560')
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(500)
  const r1440b = await rep('back to 1440 wide')
  t.rec('15', 'desktop', 'RECORD', `800 wide: open=${r800.open}, card ${JSON.stringify(r800.cr)}, wholly=${r800.wholly}, on top=${r800.ch && r800.ch.onTop}; 560 wide: open=${r560.open}, card ${JSON.stringify(r560.cr)}, wholly=${r560.wholly}, on top=${r560.ch && r560.ch.onTop}; box at 800 ${JSON.stringify(r800.bx)}, at 560 ${JSON.stringify(r560.bx)}; back at 1440: open=${r1440b.open}`, 'desktop-s15-800.png / s15-560.png')
  all.push(...t.results); console.log('errors', JSON.stringify(w.errors)); await w.browser.close()
}
console.log('ALL RESULTS', JSON.stringify(all, null, 1))
