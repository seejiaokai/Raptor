/* w3 items 10 + 11.
   10 — arrange mode on a phone (Fable #42): Syllabus ✎ → Edit chart layout;
   how much chart is left under the tool strip (photograph); drag a ball by
   TOUCH → it moves and saves itself (a reload keeps it); a two-finger pinch;
   Done editing → the view comes back where it was.
   11 — landscape phone 844x390 (Fable #43, predicted): the grading pop-up on a
   ball near the top — can every part of it be reached, ✎ Edit details too? */
import { open, shot, save, log, login, toTracker, PHONE } from './trk-lib.mjs'
import { sleep, ball, box, touchDrag } from './trk-w3-lib.mjs'

const L = log()
const tapSel = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }
const view = page => page.evaluate(() => { const b = document.getElementById('board'); return { top: b.scrollTop, left: b.scrollLeft, zoom: (document.getElementById('fzPct') || {}).textContent } })
const tr = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); return g ? g.getAttribute('transform') : null }, id)

/* ---------------- 10 ---------------- */
{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
  const v0 = await view(page)
  const bd0 = await box(page, '#board')
  const st02 = await tr(page, 'ST-02')
  await tapSel(page, '#sylMenuBtn'); await tapSel(page, '#arrangeBtn'); await sleep(400)
  const strip = await box(page, '#arrTools'), bd1 = await box(page, '#board'), hint = await box(page, '#arrhint'), tabs = await box(page, '#viewtabs')
  const rows = await page.evaluate(() => { const ys = new Set([...document.querySelectorAll('#arrTools > button, #arrTools > label')].filter(e => e.getBoundingClientRect().width).map(e => Math.round(e.getBoundingClientRect().top))); return ys.size })
  L.note('10. arrange on: the tool strip', `${strip && strip.h}px tall in ${rows} rows (y ${strip && strip.y}–${strip && strip.b}); the chart's box ${bd0.h}px → ${bd1 && bd1.h}px tall (${bd1 && Math.round(100 * bd1.h / 844)}% of the screen); hint ${JSON.stringify(hint)}; tabs ${JSON.stringify(tabs)}`)
  L.ok('10. the tool strip leaves a usable chart (at least a third of the screen)', bd1 && bd1.h >= 844 / 3, `${bd1 && bd1.h}px of chart`)
  await shot(page, 'w3-10-arrange-on')
  /* a ball in view to drag */
  const target = await page.evaluate(() => {
    const bd = document.getElementById('board').getBoundingClientRect()
    const g = [...document.querySelectorAll('#flowSvg .ball')].map(x => ({ id: x.dataset.id, r: x.getBoundingClientRect() })).find(o => o.r.top > bd.top + 20 && o.r.bottom < bd.bottom - 60 && o.r.left > bd.left + 10 && o.r.right < bd.right - 90)
    return g ? { id: g.id, x: g.r.left + g.r.width / 2, y: g.r.top + g.r.height / 2 } : null
  })
  L.note('10. dragging', JSON.stringify(target))
  if (target) {
    const t0 = await tr(page, target.id)
    await touchDrag(page, target.x, target.y, target.x + 60, target.y + 40, 12)
    const t1 = await tr(page, target.id)
    L.ok(`10. a finger drag moves ${target.id}`, t0 !== t1, `${t0} → ${t1}`)
    L.ok('10. …with no ✓ Save changes needed (a moved ball saves itself)', !(await page.locator('#saveChanges').count()), (await page.locator('#saveStat').innerText()))
    await shot(page, 'w3-10-after-touch-drag')
    /* pinch: two fingers apart */
    const cdp = await page.context().newCDPSession(page)
    const cx = 195, cy = (bd1.y + bd1.b) / 2
    const zBefore = await page.evaluate(() => { const v = document.querySelector('#viewport'); return v ? v.getAttribute('transform') : null })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx - 30, y: cy, id: 1 }, { x: cx + 30, y: cy, id: 2 }] })
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - 30 - i * 10, y: cy, id: 1 }, { x: cx + 30 + i * 10, y: cy, id: 2 }] }); await sleep(30) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach(); await sleep(300)
    const zAfter = await page.evaluate(() => { const v = document.querySelector('#viewport'); return v ? v.getAttribute('transform') : null })
    L.note('10. a two-finger pinch in arrange mode', `${zBefore} → ${zAfter}`)
    await tapSel(page, '#sylMenuBtn'); await tapSel(page, '#arrangeBtn'); await sleep(500)
    const v2 = await view(page)
    L.ok('10. Done editing → the view comes back where it was (scroll and zoom)', v2.zoom === v0.zoom && Math.abs(v2.top - v0.top) < 30 && Math.abs(v2.left - v0.left) < 30, `before ${JSON.stringify(v0)} → after ${JSON.stringify(v2)}`)
    await shot(page, 'w3-10-done-editing')
    const tDone = await tr(page, target.id)
    await page.reload(); await login(page, 'a'); await toTracker(page)
    const tReload = await tr(page, target.id)
    L.ok(`10. the move survives a reload (${target.id} stays where it was dropped)`, tReload === tDone && tDone !== st02 || tReload === tDone, `after Done ${tDone} → after reload ${tReload}`)
  }
  L.note('10 errors', errors.join(' | ') || 'none')
  await browser.close()
}

/* ---------------- 11 ---------------- */
{
  const { browser, page, errors } = await open({ size: { width: 844, height: 390 }, who: 'a', touch: true })
  const chrome = await page.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { y: Math.round(b.top), h: Math.round(b.height), b: Math.round(b.bottom) } }; return { topbar: r('.topbar'), bar: r('#page-tracker header'), tabs: r('#viewtabs'), board: r('#board'), zoomCtl: r('#flowZoomCtl') } })
  L.note('11. landscape 844x390 — what is left for the chart', JSON.stringify(chrome))
  await shot(page, 'w3-11-landscape')
  /* the balls near the top and near the bottom of the chart's box */
  const pick = await page.evaluate(() => {
    const bd = document.getElementById('board').getBoundingClientRect()
    const all = [...document.querySelectorAll('#flowSvg .ball')].map(x => ({ id: x.dataset.id, r: x.getBoundingClientRect() })).filter(o => o.r.top >= bd.top && o.r.bottom <= bd.bottom && o.r.left >= bd.left && o.r.right <= bd.right)
    all.sort((a, b) => a.r.top - b.r.top)
    const s = o => o && { id: o.id, x: o.r.left + o.r.width / 2, y: o.r.top + o.r.height / 2 }
    return { top: s(all[0]), bottom: s(all[all.length - 1]) }
  })
  for (const which of ['top', 'bottom']) {
    const t = pick[which]; if (!t) { L.note(`11. no ball fully in view for "${which}"`, ''); continue }
    await page.touchscreen.tap(t.x, t.y); await sleep(500)
    const parts = await page.evaluate(() => {
      const pop = document.getElementById('pop'); if (!pop) return null
      const cs = getComputedStyle(pop), r = pop.getBoundingClientRect()
      const part = s => { const e = pop.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { y: Math.round(b.top), b: Math.round(b.bottom), seen: b.top >= 0 && b.bottom <= innerHeight } }
      return { pos: cs.position, overflowY: cs.overflowY, maxH: cs.maxHeight, y: Math.round(r.top), h: Math.round(r.height), b: Math.round(r.bottom), vh: innerHeight,
        title: part('#popTitle'), grades: part('.opts'), doneOn: part('#popDoneDate'), fails: part('.fails'), failedOn: part('#popFailDate'), info: part('#popInfo'), editDetails: part('#popEditInfo') }
    })
    const hidden = parts ? Object.entries(parts).filter(([k, v]) => v && typeof v === 'object' && v.seen === false).map(([k]) => k) : ['no pop-up']
    L.ok(`11. landscape, ${which} ball ${t.id}: every part of the grading pop-up is on screen`, parts && !hidden.length, parts ? `pop-up ${parts.y}–${parts.b} in a ${parts.vh}px screen (${parts.pos}, overflow ${parts.overflowY}); off screen: ${hidden.join(', ') || 'none'}` : 'no pop-up')
    await shot(page, `w3-11-pop-${which}`)
    /* can a finger reach the cut-off part? try scrolling the pop-up and the page */
    if (parts && hidden.length) {
      await touchDrag(page, 844 / 2 + 100, Math.max(10, parts.y + 40), 844 / 2 + 100, Math.min(380, parts.y + 240), 8)
      const again = await page.evaluate(() => { const e = document.getElementById('popEditInfo'), t = document.getElementById('popTitle'); const a = e && e.getBoundingClientRect(), b = t && t.getBoundingClientRect(); return { editDetails: a && [Math.round(a.top), Math.round(a.bottom)], title: b && [Math.round(b.top), Math.round(b.bottom)], pageY: scrollY, open: !!document.getElementById('pop') } })
      L.note(`11. ${which}: after a finger drag over the pop-up`, JSON.stringify(again))
    }
    if (await page.locator('#pop').isVisible().catch(() => false)) { await page.keyboard.press('Escape'); await sleep(250) }
  }
  L.note('11 errors', errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-10-phone-arrange', { rows: L.rows })
