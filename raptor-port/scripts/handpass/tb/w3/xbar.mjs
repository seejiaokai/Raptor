/* xbar — W3: B1 (the bar raised by the Inputs calendar's own drag), B2 (phone 390/360/320), B3 (keyboard, desk), B4 (Answer OIL → answer → right button),
   B5 (go to Quals and back, desk).   node xbar.mjs desk|phone
   Fixture: the X1 input (Training, Sat 18 Jul, 09:00-12:00, Ranger, answered Yes) filed on the Inputs calendar; its bar dragged from Sat 18 to Sun 19. */
import { L, inputsCal, openAdd, fillForm, rowOut, part } from './lib.mjs'
const size = process.argv[2] || 'desk'
console.log('xbar.mjs - W3 B1-B5 - ' + size)
const S = `[${size}]`
const w = await L.world(size); const p = w.page
const FROM = '2026-07-18', TO = '2026-07-19'
const AMBER = 'rgba(229, 194, 74, 0.5)'
let route = 'the Inputs calendar\'s own drag (mouse)'
const clear = async () => { await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(250) }
/** where each bar of the input stands */
const stands = () => p.evaluate(() => [...document.querySelectorAll('.ib-bar[data-iid]')].filter(b => /^Ranger · Range brief/.test(b.title)).map(b => b.title.split(String.fromCharCode(10))[0]))
const band = () => p.evaluate(() => {
  const b = document.querySelector('[data-testid="oilbar"]'); if (!b) return null
  const r = b.getBoundingClientRect(), under = b.closest('.sb-top') || b.closest('.topbar')
  const txt = b.querySelector('[data-testid="oilbar-text"]'), ans = b.querySelector('[data-testid="oilbar-answer"]'), ok = b.querySelector('[data-testid="oilbar-ok"]')
  const kids = [...b.children].map(k => { const q = k.getBoundingClientRect(); return { t: (k.textContent || '').trim(), mid: Math.round(q.top + q.height / 2), l: Math.round(q.left * 10) / 10, r: Math.round(q.right * 10) / 10, h: Math.round(q.height), cut: k.scrollWidth > k.clientWidth + 0.5, fs: getComputedStyle(k).fontSize } })
  const page = document.querySelector('#shell .page.on') || document.querySelector('.page.on'), pr = page ? page.getBoundingClientRect() : null
  const below = document.elementFromPoint(Math.min(innerWidth - 2, r.left + 10), r.bottom + 4)
  const tb = document.querySelector('#shell .topbar')
  return { where: under ? String(under.className).split(' ')[0] : 'NOWHERE', text: txt ? txt.textContent : '', btns: [ans && ans.textContent, ok && ok.textContent], x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), vw: innerWidth,
    edge: under ? getComputedStyle(under).borderBottomColor : '', oneLine: new Set(kids.map(k => k.mid)).size === 1, ellipsis: kids.some(k => /…|\.\.\./.test(k.t)) || (txt && getComputedStyle(txt).textOverflow === 'ellipsis' && txt.scrollWidth > txt.clientWidth + 0.5),
    nothingCut: kids.every(k => !k.cut) && b.scrollWidth <= b.clientWidth + 0.5, inside: kids.every(k => k.l >= r.left - 0.5 && k.r <= r.right + 0.5), fonts: kids.map(k => k.fs), kids: kids.map(k => `${k.t.slice(0, 24)}:${k.l}-${k.r}`),
    pageTop: pr ? Math.round(pr.top) : null, barBottom: Math.round(r.bottom), topbarH: tb ? Math.round(tb.getBoundingClientRect().height) : null, topbarBottom: tb ? Math.round(tb.getBoundingClientRect().bottom) : null, belowIsBar: !!below && b.contains(below), count: document.querySelectorAll('[data-testid="oilbar"]').length }
})
const bandOk = f => f && f.h === 36 && f.x === 0 && f.right === f.vw && f.edge === AMBER && f.oneLine && f.nothingCut && f.inside && !f.ellipsis && f.count === 1 && f.text === 'Not moved — OIL not answered'

async function dragBar(from, to) {
  const bar = p.locator('.ib-bar[data-iid][title^="Ranger · Range brief"]').first()
  await bar.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
  const bb = await bar.boundingBox(), tc = await p.locator(`[data-icday="${to}"]`).first().boundingBox()
  const fx = bb.x + bb.width / 2, fy = bb.y + bb.height / 2, tx = tc.x + tc.width / 2, ty = tc.y + tc.height / 2
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 8, fy + 6, { steps: 4 })
  await p.mouse.move(tx, ty, { steps: 16 }); await p.mouse.move(tx + 1, ty + 1)
  await p.mouse.up()
  try { await p.waitForSelector('[data-testid="oilconf"]', { timeout: 3500 }); return 'mouse' } catch {}
  /* a finger: hold, then move, over the browser's own touch input */
  route = 'the Inputs calendar\'s own drag (a held touch, sent through the browser\'s touch input)'
  const cdp = await w.ctx.newCDPSession(p)
  const pt = (x, y) => [{ x, y, id: 1 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(fx, fy) }); await L.sleep(320)
  for (let i = 1; i <= 16; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(fx + (tx - fx) * i / 16, fy + (ty - fy) * i / 16) }); await L.sleep(30) }
  await L.sleep(120)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await p.waitForSelector('[data-testid="oilconf"]', { timeout: 4000 })
  return 'touch'
}
const raise = async () => {                                     // drag, then the left-hand button
  const how = await dragBar(FROM, TO)
  await L.sleep(400); await clear()
  await w.press('[data-testid="oilconf-cancel"]')
  await p.waitForSelector('[data-testid="oilbar"]', { timeout: 6000 }); await L.sleep(900)
  return how
}
const hideToast = on => p.evaluate(on => { const t = document.querySelector('#toastEl'); if (t) t.style.display = on ? 'none' : '' }, on)
try {
  await inputsCal(w, FROM)
  await openAdd(w, FROM)
  await fillForm(w, { type: 'Training', person: 'bane', start: '09:00', end: '12:00', title: 'Range brief' })
  await w.press('#inpEditSave'); await p.waitForSelector('[data-testid="oilconf"]'); await L.sleep(300)
  await w.press('[data-testid="oil-yes"]'); await w.press('[data-testid="oilconf-save"]')
  await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300)
  await p.locator('[data-testid="win-inputsday-x"]').click(); await L.sleep(400); await clear()
  const base = await p.evaluate(() => Math.round(document.querySelector('#shell .topbar').getBoundingClientRect().height))
  const s0 = await stands()
  console.log('   baseline top bar height', base, '· the input stands on', s0.join(','))

  /* B1 */
  await part(w, `B1 the bar from the calendar ${S}`, 'the bar', 'one amber line under the top bar, edge to edge, 36 tall; the page below moved down; the input has not moved', async () => {
    const how = await raise()
    const f = await band(), s1 = await stands()
    console.log('   B1 raised by:', how, '·', route)
    rowOut(`B1 the bar from the calendar ${S}`, 'the bar and the page', 'ONE amber line directly under the app\'s top bar, edge to edge, 36 px tall, "Not moved — OIL not answered" with Answer OIL and OK; the page below moved down (nothing under the bar); the input has not moved',
      `raised by: ${route}; ${JSON.stringify({ where: f && f.where, text: f && f.text, btns: f && f.btns, box: f && `${f.x},${f.y} ${f.w}×${f.h}`, edge: f && f.edge, oneLine: f && f.oneLine, topbarH: f && f.topbarH, topbarBottom: f && f.topbarBottom, barBottom: f && f.barBottom, pageTop: f && f.pageTop, belowIsBar: f && f.belowIsBar, count: f && f.count })}; the input stands on ${s1.join(',')} (before: ${s0.join(',')})`,
      !!f && f.where === 'topbar' && bandOk(f) && f.btns.join('|') === 'Answer OIL|OK' && f.pageTop >= f.barBottom - 1 && !f.belowIsBar && s1.join() === s0.join())
    await L.pic(w, `b01-${size}-bar-under-top-bar`, { clip: { x: 0, y: 0, width: w.S.w, height: Math.min(w.S.h, 320) } })
    await L.pic(w, `b01-${size}-whole-screen`)
  })

  /* B2 — phone: three widths */
  if (w.phone) await part(w, `B2 the bar at three widths ${S}`, 'one line', 'words and both buttons on ONE line; nothing cut or "…"; nothing out of the bar', async () => {
    for (const W of [390, 360, 320]) {
      await p.setViewportSize({ width: W, height: 844 }); await L.sleep(900)
      const f = await band()
      const per = { w: W, vw: f && f.vw, box: f && `${f.x},${f.y} ${f.w}×${f.h}`, oneLine: f && f.oneLine, ellipsis: f && f.ellipsis, nothingCut: f && f.nothingCut, inside: f && f.inside, fonts: f && f.fonts.join('/'), kids: f && f.kids.join(' | '), edge: f && f.edge }
      rowOut(`B2 the bar at three widths ${S}`, `${W} wide`, 'the words and both buttons on ONE line; no word cut or ending in "…"; nothing sticks out of the bar (letters may be a little smaller — report their size)', JSON.stringify(per), !!f && f.oneLine && !f.ellipsis && f.nothingCut && f.inside && f.right === f.vw && f.h === 36)
      await L.pic(w, `b02-${size}-bar-${W}`, { clip: { x: 0, y: 0, width: W, height: 200 } })
    }
    await p.setViewportSize({ width: 390, height: 844 }); await L.sleep(700)
  })

  /* B3 — desk: the keyboard */
  if (!w.phone) await part(w, `B3 the bar by keyboard ${S}`, 'keys', 'on Answer OIL as it appears; Tab to OK; Escape closes it; the input has not moved', async () => {
    if (!(await p.locator('[data-testid="oilbar"]').count())) throw new Error('the bar was not up (B1 set-up failed)')
    const a0 = await L.focusOf(w)
    rowOut(`B3 the bar by keyboard ${S}`, 'where the keyboard is as the bar appears', 'on "Answer OIL"', a0, /oilbar-answer/.test(a0))
    await L.pic(w, `b03-${size}-keyboard-on-answer-oil`, { clip: { x: 0, y: 0, width: w.S.w, height: 140 } })
    await p.keyboard.press('Tab'); const a1 = await L.focusOf(w)
    rowOut(`B3 the bar by keyboard ${S}`, 'Tab', 'goes to "OK"', a1, /oilbar-ok/.test(a1))
    await p.keyboard.press('Shift+Tab'); const a2 = await L.focusOf(w)
    rowOut(`B3 the bar by keyboard ${S}`, 'Shift+Tab', 'goes back to "Answer OIL"', a2, /oilbar-answer/.test(a2))
    const before = await p.locator('[data-testid="oilbar"]').count()
    await p.keyboard.press('Escape'); await L.sleep(500)
    const after = await p.locator('[data-testid="oilbar"]').count(), s1 = await stands()
    rowOut(`B3 the bar by keyboard ${S}`, 'Escape on the bar', 'closes the bar; the input still has not moved', `bar before ${before ? 'up' : 'gone'}, after ${after ? 'still up' : 'gone'}; the input stands on ${s1.join(',')}`, !!before && !after && s1.join() === s0.join())
  })

  /* B5 — desk: raise it again, go to Quals and back */
  if (!w.phone) await part(w, `B5 Quals and back ${S}`, 'the bar is gone', 'the bar is gone and the top bar is its usual height', async () => {
    await raise()
    const up = await band()
    await L.go(w, 'quals'); await L.sleep(400)
    const q = await p.evaluate(() => ({ bars: document.querySelectorAll('[data-testid="oilbar"]').length, h: Math.round(document.querySelector('#shell .topbar').getBoundingClientRect().height) }))
    await L.go(w, 'inputs'); await L.sleep(500)
    const b = await p.evaluate(() => ({ bars: document.querySelectorAll('[data-testid="oilbar"]').length, h: Math.round(document.querySelector('#shell .topbar').getBoundingClientRect().height) }))
    rowOut(`B5 Quals and back ${S}`, 'the bar after another page', 'the bar is gone and the top bar is its usual height', `bar up before leaving (${up ? up.h : '?'}px); at Quals: ${q.bars} bar(s), top bar ${q.h}px; back on Inputs: ${b.bars} bar(s), top bar ${b.h}px (usual: ${base}px)`, !!up && q.bars === 0 && b.bars === 0 && b.h === base && q.h === base)
    await L.pic(w, `b05-${size}-after-quals-and-back`, { clip: { x: 0, y: 0, width: w.S.w, height: 220 } })
  })

  /* B4 — both: raise again; Answer OIL, pick, the right-hand button */
  await part(w, `B4 Answer OIL, then the move ${S}`, 'the move is made', 'the question comes back; after the answer the move is made and the bar is gone', async () => {
    await L.go(w, 'inputs'); await L.sleep(300)
    await inputsCal(w, FROM)
    const sBefore = await stands()
    await raise()
    await w.press('[data-testid="oilbar-answer"]')
    await p.waitForSelector('[data-testid="oilconf"]', { timeout: 6000 }); await L.sleep(400); await clear()
    const lead = await p.locator('[data-testid="oilconf"]').innerText()
    await w.press('[data-testid="oil-yes"]'); await L.sleep(200)
    const lbl = await p.locator('[data-testid="oilconf-save"]').innerText()
    await hideToast(true); await L.pic(w, `b04-${size}-question-back-answered`); await hideToast(false)
    await w.press('[data-testid="oilconf-save"]'); await L.sleep(900)
    const bars = await p.locator('[data-testid="oilbar"]').count(), sAfter = await stands(), q = await p.locator('[data-testid="oilconf"]').count()
    rowOut(`B4 Answer OIL, then the move ${S}`, 'the move', 'the question comes back; after the answer the move is made and the bar is gone', `question came back: ${/OIL:/.test(lead)} ("${lead.replace(/\s+/g, ' ').slice(0, 70)}"); right-hand button read "${lbl}"; after it: question ${q ? 'still up' : 'closed'}, bar ${bars ? 'STILL UP' : 'gone'}; the input stood on ${sBefore.join(',')}, now on ${sAfter.join(',')}`, /OIL:/.test(lead) && !bars && !q && sAfter.join() !== sBefore.join())
    await L.pic(w, `b04-${size}-after-the-move`)
  })
} finally { await L.close(w) }
