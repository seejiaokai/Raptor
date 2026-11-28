// sw-a - subject A: the Tracker's move to another squadron fails part way (Saber, 142 -> 149, the Tracker tab open).
//   node raptor-port/scripts/handpass/n162/sw-a.mjs <d|402x874> [mapget|ls]
// STAND-INS (installed from inside the page just before the failing pick; a reload removes them):
//   mapget - the in-memory store refuses every read of 149's Tracker records (Map.prototype.get throws for keys
//            starting "tracker/u149@") - stands in for a store that cannot be read
//   ls     - the browser's storage refuses every write (localStorage.setItem throws QuotaExceededError, indexedDB.open
//            throws) - a full or locked browser storage
// Pictures: sw-a-<size>-<stand>-*.png
import { mk, signIn, go, pickSq, closeAll, note, FACT, die, bands, barSq, pic, press, pageOn } from './lib.mjs'
const SZ = process.argv[2] || 'd', STAND = process.argv[3] || 'mapget'
const P = `sw-a-${SZ}-${STAND}`, F = k => `A.${SZ}.${STAND}.${k}`
const s = await mk(SZ); let page = s.page
const wait = ms => s.page.waitForTimeout(ms)
const trkText = () => page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240))
const balls = () => page.locator('#flowSvg .ball').count()
const ready = async (what) => { try { await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(500) } catch { die(`the chart did not draw: ${what}`) } }
const undoState = () => page.evaluate(() => { const b = [...document.querySelectorAll('#trUndoBtn')].find(e => e.getBoundingClientRect().width > 0); return b ? { drawn: true, disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', title: b.getAttribute('title') } : { drawn: false } })
const depth = () => page.evaluate(() => window.__undoForTests ? window.__undoForTests() : null).then(d => d && { undo: d.undo, redo: d.redo, active: d.active })
const gradeOf = id => page.evaluate(id => window.__undoForTests().grade(id), id)
/* a mark: an ungraded event in view, tapped, graded DCO in its window */
async function markOne(tag) {
  const id = await page.evaluate(() => {
    const t = window.__undoForTests()
    for (const g of document.querySelectorAll('#flowSvg .ball')) {
      const r = g.getBoundingClientRect(); if (r.width < 4) continue
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      if (cx < 10 || cy < 120 || cx > innerWidth - 10 || cy > innerHeight - 60) continue
      const at = document.elementFromPoint(cx, cy); if (!at || !g.contains(at)) continue
      if (!t.grade(g.dataset.id)) return g.dataset.id
    }
    return null
  })
  if (!id) die(`no ungraded event in view to mark (${tag})`)
  const b = await page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox()
  if (s.desk) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  try { await page.waitForSelector('#pop', { state: 'visible', timeout: 5000 }) } catch { die(`the marking window did not open (${tag})`) }
  await press(s, page.locator('#pop button').filter({ hasText: /^\s*DCO\s*$/ }).first())
  await wait(500)
  if (await page.locator('#pop').filter({ visible: true }).count()) { await page.keyboard.press('Escape').catch(() => {}); await wait(300) }
  const g = await gradeOf(id)
  if (!g) die(`the mark did not land (${tag})`)
  return id
}
const tabsDrawn = () => page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page]')].filter(a => a.getBoundingClientRect().width > 0).map(a => a.dataset.page))
try {
  console.log('sw-a v1', SZ, STAND)
  await signIn(s, 'ad', 'a')
  await go(s, 'tracker'); await ready('142 first open')
  FACT(F('start.squadron'), await barSq(s))
  const m142 = await markOne('142'); const st142 = await depth()
  FACT(F('before.142.markedEvent'), m142); FACT(F('before.142.undoDepth'), st142); FACT(F('before.142.undoButton'), await undoState())
  await pickSq(s, '149'); await ready('149 first open')
  FACT(F('before.149.squadron'), await barSq(s))
  const m149 = await markOne('149'); const st149 = await depth()
  FACT(F('before.149.markedEvent'), m149); FACT(F('before.149.undoDepth'), st149); FACT(F('before.149.undoButton'), await undoState())
  await pickSq(s, '142'); await ready('back on 142')
  FACT(F('before.back142.undoDepth'), await depth()); FACT(F('before.back142.undoButton'), await undoState())
  FACT(F('before.back142.markKept'), await gradeOf(m142))
  /* the unsaved chart edit: a new test event made in Edit chart layout, the editor closed again */
  await press(s, '#sylMenuBtn'); await press(s, '#arrangeBtn'); await wait(300)
  let add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await press(s, page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first())
  await press(s, add); await page.waitForSelector('#dlgInput:visible')
  await page.locator('#dlgInput:visible').first().fill('SWA1'); await press(s, '#dlgOk'); await wait(400)
  await press(s, '#sylMenuBtn'); await press(s, '#arrangeBtn'); await wait(400)
  const swa = await page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').includes('SWA1'))
  if (!swa) die('the unsaved chart edit SWA1 is not on the chart')
  FACT(F('before.back142.unsavedEditOnChart'), swa); FACT(F('before.back142.undoDepthWithEdit'), await depth())
  await pic(s, `${P}-01-before-pick`)
  /* THE STAND-IN, then the pick */
  await page.evaluate(st => {
    window.__n162 = { hits: 0 }
    if (st === 'ls') {
      Storage.prototype.setItem = function () { window.__n162.hits++; throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') }
      indexedDB.open = function () { window.__n162.hits++; throw new DOMException('refused', 'UnknownError') }
    }
    if (st === 'mapget') { const g = Map.prototype.get; Map.prototype.get = function (k) { if (typeof k === 'string' && k.startsWith('tracker/u149@')) { window.__n162.hits++; throw new Error('store refused a read') } return g.call(this, k) } }
  }, STAND)
  await pickSq(s, '149')
  const q = await page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? { msg: m.textContent.trim(), btns: [...document.querySelectorAll('#dlgModal button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()) } : null })
  FACT(F('pick.question'), q)
  if (q) { await pic(s, `${P}-02-question`); const okw = await page.locator('#dlgOk').first().textContent(); await press(s, '#dlgOk'); FACT(F('pick.answered'), okw.trim()) }
  await wait(2500)
  const panel = await page.evaluate(() => {
    const root = document.querySelector('#page-tracker .tr-root'); if (!root) return null
    const divs = [...root.querySelectorAll(':scope > div')]
    return { heading: divs[0]?.textContent.trim() ?? null, line: divs[1]?.textContent.trim() ?? null, buttons: [...root.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()), board: !!document.querySelector('#flowSvg .ball') }
  })
  FACT(F('after.tracker'), await trkText())
  FACT(F('after.panel'), panel)
  FACT(F('after.squadron'), await barSq(s))
  await wait(4000)
  FACT(F('after.bands'), await bands(s))
  FACT(F('after.undoButton'), await undoState())
  FACT(F('after.standinHits'), await page.evaluate(() => window.__n162.hits))
  const pageButtons = await page.evaluate(() => [...document.querySelectorAll('#page-tracker button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim() || b.getAttribute('aria-label') || b.id))
  FACT(F('after.trackerPageButtons'), pageButtons)
  await pic(s, `${P}-03-after-pick`)
  await pic(s, `${P}-03-after-pick-crop`, ['#page-tracker .tr-root'], 24)
  /* the rest of the app */
  FACT(F('after.tabsDrawn'), await tabsDrawn())
  await go(s, 'viewsched'); FACT(F('after.weekTab.page'), await pageOn(s)); FACT(F('after.weekTab.days'), await page.locator('#vWeek .day').count())
  FACT(F('after.weekTab.bands'), await bands(s))
  await pic(s, `${P}-04-week-page`)
  await go(s, 'tracker'); await wait(800)
  FACT(F('after.backToTracker'), await trkText())
  /* the reload: the stand-in goes with the page */
  page.once('dialog', d => FACT(F('reload.browserAsked'), d.type())); await page.reload(); await wait(2500)
  const signedOut = await page.locator('#luser').filter({ visible: true }).count()
  FACT(F('reload.signedOut'), !!signedOut)
  if (signedOut) { await signIn(s, 'ad', 'a'); FACT(F('reload.signedInAgain'), true) }
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 }).catch(() => {})
  FACT(F('reload.squadron'), await barSq(s)); FACT(F('reload.page'), await pageOn(s))
  FACT(F('reload.bands'), await bands(s))
  await pic(s, `${P}-05-after-reload`)
  if ((await pageOn(s)) !== 'page-tracker') await go(s, 'tracker')
  await wait(1500)
  const okChart = await page.locator('#flowSvg .ball').count()
  FACT(F('reload.tracker'), okChart ? `chart drawn, ${okChart} events` : await trkText())
  if (okChart) {
    FACT(F('reload.trackerSquadron'), await barSq(s))
    FACT(F('reload.142.mark'), await gradeOf(m142))
    FACT(F('reload.142.unsavedEdit'), await page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').includes('SWA1')))
    FACT(F('reload.142.undoButton'), await undoState()); FACT(F('reload.142.undoDepth'), await depth())
    await pic(s, `${P}-06-tracker-after-reload`)
    await pickSq(s, '149'); await wait(2000)
    const c149 = await page.locator('#flowSvg .ball').count()
    FACT(F('reload.149.squadron'), await barSq(s))
    FACT(F('reload.149.tracker'), c149 ? `chart drawn, ${c149} events` : await trkText())
    if (c149) { FACT(F('reload.149.mark'), await gradeOf(m149)); FACT(F('reload.149.undoButton'), await undoState()); FACT(F('reload.149.undoDepth'), await depth()) }
    await pic(s, `${P}-07-149-after-reload`)
  }
  await s.ctx.close()
  /* the control: an ordinary reload, no failure - is Undo greyed after it too? */
  const c = await mk(SZ); const cp = c.page
  await signIn(c, 'ad', 'a'); await go(c, 'tracker')
  await cp.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await cp.waitForTimeout(500)
  const s0 = s; Object.assign(s, { page: cp, ctx: c.ctx }); page = cp
  const cm = await markOne('control')
  FACT(F('control.before.undoButton'), await undoState()); FACT(F('control.before.undoDepth'), await depth())
  await cp.reload(); await cp.waitForTimeout(2500)
  if (await cp.locator('#luser').filter({ visible: true }).count()) { FACT(F('control.reload.signedOut'), true); await signIn(c, 'ad', 'a') } else FACT(F('control.reload.signedOut'), false)
  if ((await pageOn(c)) !== 'page-tracker') await go(c, 'tracker')
  await cp.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await cp.waitForTimeout(800)
  FACT(F('control.reload.mark'), await cp.evaluate(id => window.__undoForTests().grade(id), cm))
  FACT(F('control.reload.undoButton'), await undoState()); FACT(F('control.reload.undoDepth'), await depth())
  void s0
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
