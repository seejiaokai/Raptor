/* w3 item 1 — the side panel's event chips (R64, owner 3 Sep 26):
   click → the chart snaps to that ball and rings it; mouse-over → the details
   bubble; on a phone a long press → the bubble WITHOUT leaving the Info tab,
   and a tap → switches to the Flow chart and lands on the ball. */
import { open, shot, save, log, DESK, PHONE } from './trk-lib.mjs'
import { sleep, bubble, halves, longPress } from './trk-w3-lib.mjs'

const L = log()
const chips = page => page.evaluate(() => [...document.querySelectorAll('#side .evchip')].map(c => ({
  ev: c.dataset.ev, where: c.closest('.c-next') ? 'next' : c.closest('.c-plan') ? 'plan' : '?', title: c.title || '',
})))
/* where the ball sits in the chart's box, and whether it wears the ring */
const ballState = (page, id) => page.evaluate(id => {
  const bd = document.getElementById('board'); const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
  if (!bd || !g) return null
  const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect()
  return { ringed: !!g.querySelector('circle.found'), rings: document.querySelectorAll('#flowSvg circle.found').length,
    dx: Math.round((r.left + r.width / 2) - (b.left + b.width / 2)), dy: Math.round((r.top + r.height / 2) - (b.top + b.height / 2)),
    inView: r.top >= b.top && r.bottom <= b.bottom && r.left >= b.left && r.right <= b.right, find: (document.getElementById('hSearch') || {}).value }
}, id)

/* ---------------- desktop ---------------- */
{
  const { browser, page, errors } = await open({ size: DESK, who: 'a' })
  const cs = await chips(page)
  L.note('desk: chips on the panel', cs.map(c => c.where + ':' + c.ev).join(' '))
  /* take the chart well away from the top first, so a snap has somewhere to go */
  const bd = await page.locator('#board').boundingBox()
  await page.mouse.move(bd.x + bd.width / 2, bd.y + bd.height / 2)
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 900); await sleep(60) }
  await sleep(300)
  const pick = [cs.find(c => c.where === 'next'), [...cs].reverse().find(c => c.where === 'plan')].filter(Boolean)
  for (const c of pick) {
    const el = page.locator(`#side .c-${c.where === 'next' ? 'next' : 'plan'} .evchip[data-ev="${c.ev}"]`).first()
    /* the Plannable-now card sits below the fold of the panel at 1440x900 —
       a person scrolls the panel to it first (the panel scrolls in its own box) */
    await el.scrollIntoViewIfNeeded(); await sleep(200)
    const eb = await el.boundingBox()
    /* hover */
    await page.mouse.move(eb.x + eb.width / 2, eb.y + eb.height / 2); await sleep(350)
    const hb = await bubble(page)
    L.ok(`desk ${c.where} ${c.ev}: mouse-over shows the details bubble`, hb.shown, hb.shown ? hb.text : 'no bubble')
    await shot(page, `w3-01-desk-hover-${c.where}`)
    await page.mouse.move(eb.x + eb.width / 2, eb.y - 200); await sleep(250)
    L.ok(`desk ${c.where} ${c.ev}: moving off puts it away`, !(await bubble(page)).shown, JSON.stringify(await bubble(page)))
    const before = await ballState(page, c.ev)
    /* click */
    await el.click(); await sleep(700)
    const after = await ballState(page, c.ev)
    L.ok(`desk ${c.where} ${c.ev}: click snaps the chart to the ball and rings it`, after && after.ringed && after.inView && Math.abs(after.dy) < 60 && Math.abs(after.dx) < 400,
      `before ${JSON.stringify(before)} → after ${JSON.stringify(after)}`)
    await shot(page, `w3-01-desk-click-${c.where}`)
    /* take the ring off with the Find box's ✕ (the promise: the box shows the code) */
    await page.click('#hSearchClear'); await sleep(300)
    L.ok(`desk ${c.where}: ✕ in Find takes the ring off`, (await ballState(page, c.ev)).rings === 0, JSON.stringify(await ballState(page, c.ev)))
    for (let i = 0; i < 8; i++) { await page.mouse.move(bd.x + bd.width / 2, bd.y + bd.height / 2); await page.mouse.wheel(0, 900); await sleep(60) }
  }
  L.note('desk errors', errors.join(' | ') || 'none')
  await browser.close()
}

/* ---------------- phone (touch) ---------------- */
{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
  const infoTab = await page.locator('#viewtabs [data-view="info"]').boundingBox()
  await page.touchscreen.tap(infoTab.x + infoTab.width / 2, infoTab.y + infoTab.height / 2); await sleep(500)
  L.ok('phone: the Info tab shows the panel only', JSON.stringify(await halves(page)).includes('"flow":false,"info":true'), JSON.stringify(await halves(page)))
  const cs = await chips(page)
  L.note('phone: chips', cs.map(c => c.where + ':' + c.ev).join(' '))
  const c = cs.find(x => x.where === 'plan') || cs[0]
  const el = page.locator(`#side .c-${c.where === 'next' ? 'next' : 'plan'} .evchip[data-ev="${c.ev}"]`).first()
  await el.scrollIntoViewIfNeeded(); await sleep(200)
  let eb = await el.boundingBox()
  /* long press */
  await longPress(page, eb.x + eb.width / 2, eb.y + eb.height / 2, 750)
  const lb = await bubble(page); const h1 = await halves(page)
  L.ok(`phone ${c.ev}: a long press shows the bubble`, lb.shown, lb.shown ? lb.text : 'no bubble')
  L.ok(`phone ${c.ev}: …and does NOT leave the Info tab`, h1.info && !h1.flow, JSON.stringify(h1))
  await shot(page, 'w3-01-phone-longpress')
  /* the next touch anywhere puts it away (a touch on a card heading) */
  const hd = await page.locator('#side .c-overall h3').boundingBox()
  await page.touchscreen.tap(hd.x + 10, hd.y + hd.height / 2); await sleep(350)
  L.ok('phone: the next touch anywhere puts the bubble away', !(await bubble(page)).shown, JSON.stringify(await bubble(page)))
  /* tap */
  await el.scrollIntoViewIfNeeded(); await sleep(200)
  eb = await el.boundingBox()
  await page.touchscreen.tap(eb.x + eb.width / 2, eb.y + eb.height / 2); await sleep(900)
  const h2 = await halves(page); const st = await ballState(page, c.ev)
  L.ok(`phone ${c.ev}: a tap switches to the Flow chart`, h2.flow && !h2.info, JSON.stringify(h2))
  L.ok(`phone ${c.ev}: …and lands on the ball, ringed`, st && st.ringed && st.inView, JSON.stringify(st))
  await shot(page, 'w3-01-phone-tap')
  /* a Next event chip too, from the Info tab again */
  await page.touchscreen.tap(infoTab.x + infoTab.width / 2, infoTab.y + infoTab.height / 2); await sleep(500)
  const n = cs.find(x => x.where === 'next')
  if (n) {
    const ne = page.locator(`#side .c-next .evchip[data-ev="${n.ev}"]`).first()
    await ne.scrollIntoViewIfNeeded(); const nb = await ne.boundingBox()
    await page.touchscreen.tap(nb.x + nb.width / 2, nb.y + nb.height / 2); await sleep(900)
    const s2 = await ballState(page, n.ev)
    L.ok(`phone next ${n.ev}: tap → Flow, ringed, in view`, (await halves(page)).flow && s2 && s2.ringed && s2.inView, JSON.stringify(s2))
    await shot(page, 'w3-01-phone-tap-next')
  }
  L.note('phone errors', errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-01-chips', { rows: L.rows })
