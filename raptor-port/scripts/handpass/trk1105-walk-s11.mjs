/* S11 — the pair is in the top bar once, and nowhere on the Tracker's bar (D A+M; P A+M; L M).  node scripts/handpass/trk1105-walk-s11.mjs */
import { open, navTo, pair, grade, mark, click, shot, tap2, mk, sleep, D, P, Lnd } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s11 v1')
const L = mk('S11')
const style = (page, ids = ['trUndoBtn', 'trRedoBtn']) => page.evaluate(ids => { const g = id => { const e = document.getElementById(id); if (!e) return null; const r = e.getBoundingClientRect(), c = getComputedStyle(e); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left), bg: c.backgroundColor, bd: c.borderTopColor + ' ' + c.borderTopWidth, rad: c.borderTopLeftRadius, fs: c.fontSize, txt: e.textContent.trim(), op: c.opacity } }; return { u: g(ids[0]), r: g(ids[1]), sync: g('fastSync'), bell: g('notifyBell') } }, ids)
const cfgs = [['D', 'chromium', D, false, 'a'], ['D', 'chromium', D, false, 'u'], ['P', 'webkit', P, true, 'a'], ['P', 'webkit', P, true, 'u'], ['L', 'webkit', Lnd, true, 'u']]
for (const [tag, engine, size, touch, who] of cfgs) {
  const role = who === 'a' ? 'admin' : 'member', id = `${tag}-${role}`
  const { browser, page, errors } = await open({ engine, size, touch, who })
  const pr = await pair(page)
  const extra = await page.evaluate(() => ({ inBar: !!document.querySelector('#page-tracker header .controls #trUndoBtn, #page-tracker .controls #trUndoBtn'), inMenus: !!document.querySelector('#page-tracker [id*=Menu] #trUndoBtn'), arrIn: !!document.querySelector('#arrTools #trUndoBtn'), anyTrackerUndo: document.querySelectorAll('#page-tracker button[id*=ndo], #page-tracker button[title*=Undo], #page-tracker button[aria-label*=Undo]').length }))
  L.ok('exactly one #trUndoBtn and one #trRedoBtn, both inside the top bar, none in the Tracker', tag, role, pr.undo === 1 && pr.redo === 1 && pr.inTop && !pr.inTracker && !extra.anyTrackerUndo, JSON.stringify({ pr, extra }), await shot(page, `S11-${id}-open`))
  L.ok('both greyed, tooltip "Nothing to undo"', tag, role, pr.undoOff === true && pr.redoOff === true && /Nothing to undo/.test(pr.title), `title "${pr.title}" / "${pr.rtitle}"`)
  const st = await style(page)
  if (touch) {
    const ord = st.u.left < st.r.left && st.r.left < st.sync.left && st.sync.left < st.bell.left
    const tabs = await page.evaluate(() => { const t = document.querySelector('#page-tracker button[data-view="flow"]'); const r = t && t.getBoundingClientRect(); return r ? { top: r.top, bottom: r.bottom } : null })
    const tb = await page.evaluate(() => { const r = document.querySelector('.topbar').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, right: r.right } })
    L.ok('phone: icon-only, order Undo · Redo · sync dot · bell, inside the screen, not over the Tracker tabs', tag, role, ord && st.u.txt === '' && st.u.left + st.u.w <= size.width && st.bell.left + st.bell.w <= size.width + 1 && (!tabs || tb.bottom <= tabs.top + 1), JSON.stringify({ ord, undoText: st.u.txt, lefts: [st.u.left, st.r.left, st.sync.left, st.bell.left], topbarBottom: tb.bottom, tabsTop: tabs && tabs.top, topbarRows: tb }))
  }
  if (tag === 'L') {
    const nav = await page.evaluate(() => ({ topnavVisible: [...document.querySelectorAll('#topnav a')].filter(e => e.getBoundingClientRect().width > 0).length, burger: !!document.querySelector('#burger') && document.querySelector('#burger').getBoundingClientRect().width > 0, barH: Math.round(document.querySelector('.topbar').getBoundingClientRect().height) }))
    L.ok('sideways phone: top bar is one row, page names in the side menu, pair inside the screen', tag, role, nav.topnavVisible === 0 && nav.burger && nav.barH < 70 && st.u.left + st.u.w <= size.width && st.bell.left + st.bell.w <= size.width + 1, JSON.stringify({ nav, u: st.u, bell: st.bell }), await shot(page, `S11-${id}-bar`))
  }
  // Edit Schedule's pair, same size
  await shot(page, `S11-${id}-bar-tracker`, { el: '.topbar' })
  if (who === 'a') {
  await navTo(page, 'editsched', touch); await sleep(500)
  const es = await style(page, ['undoBtn', 'redoBtn'])
  await shot(page, `S11-${id}-bar-editsched`, { el: '.topbar' })
  const same = ['w', 'h', 'bg', 'bd', 'rad', 'fs'].every(k => es.u[k] === st.u[k] && es.r[k] === st.r[k])
  L.ok("same look as Edit Schedule's pair (size, background, border, radius, font) — crops beside each other", tag, role, same, JSON.stringify({ trk: st.u, es: es.u }), `S11-${id}-bar-tracker.png,S11-${id}-bar-editsched.png`)
  await navTo(page, 'tracker', touch); await page.waitForSelector('#flowSvg .ball'); await sleep(500)
  } else L.note('member: no Edit Schedule tab, so no pair of Edit Schedule to put it beside', 'the member Tracker bar is cropped in S11-' + id + '-bar-tracker.png')
  // mark → lights; press ↶ → goes; ↷ lights; press ↷
  await mark(page, 'ST-02', 'dco', touch)
  let p1 = await pair(page)
  L.ok('mark ST-02 lights ↶ with tooltip "Undo the mark on ST-02 for STUDENT A"', tag, role, p1.undoOff === false && /Undo the mark on ST-02 for STUDENT A/.test(p1.title), `title "${p1.title}"`, await shot(page, `S11-${id}-marked`))
  let pics = ''
  if (touch) pics = await tap2(page, '.topbar #trUndoBtn', `S11-${id}-undo`); else { await page.hover('.topbar #trUndoBtn'); await shot(page, `S11-${id}-hover`); await click(page, '.topbar #trUndoBtn') }
  await sleep(700)
  let g = await grade(page, 'ST-02'); let p2 = await pair(page)
  L.ok('↶ takes the mark back and lights ↷', tag, role, g !== 'dco' && p2.redoOff === false, `grade ${g}; redo title "${p2.rtitle}"`, pics)
  if (touch) pics = await tap2(page, '.topbar #trRedoBtn', `S11-${id}-redo`); else await click(page, '.topbar #trRedoBtn')
  await sleep(700)
  g = await grade(page, 'ST-02')
  L.ok('↷ puts it back', tag, role, g === 'dco', `grade ${g}`, pics)
  if (!touch) {
    await page.locator('#board').hover(); // focus on the page body, not a text box
    await page.keyboard.press('Control+z'); await sleep(600); const a = await grade(page, 'ST-02')
    await page.keyboard.press('Control+y'); await sleep(600); const b = await grade(page, 'ST-02')
    await page.keyboard.press('Control+z'); await sleep(600); const c = await grade(page, 'ST-02')
    await page.keyboard.press('Control+Shift+z'); await sleep(600); const d = await grade(page, 'ST-02')
    L.ok('keyboard: Ctrl+Z undoes, Ctrl+Y redoes, Ctrl+Shift+Z redoes', tag, role, a !== 'dco' && b === 'dco' && c !== 'dco' && d === 'dco', `after Ctrl+Z ${a}; Ctrl+Y ${b}; Ctrl+Z ${c}; Ctrl+Shift+Z ${d}`)
  }
  L.note('errors', errors.join(' | ').slice(0, 400) || 'none')
  await browser.close()
}
L.save('S11')
