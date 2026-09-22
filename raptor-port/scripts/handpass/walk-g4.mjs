/* G4 — the phone pass (Fable S39, Codex 3).  390px, every OIL surface, with
   measurements: is the top bar one row, is anything clipped, is a tap target
   big enough, does the page scroll sideways, is the half bar still half. */
import { open, board, shot, publish, readDay } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 5
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ width: 390, height: 844, state: STATE })
await board(page, di)
const R = {}

const geom = (tag) => page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  const box = e => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } }
  const bar = root.querySelector('.daybar')
  const rows = (el) => {
    if (!el) return null
    const kids = [...el.querySelectorAll('button, .daybar-h, span')].filter(vis).filter(e => (e.innerText || '').trim())
    const ys = [...new Set(kids.map(e => Math.round(e.getBoundingClientRect().y / 8)))]
    return { lines: ys.length, items: kids.map(e => ({ t: (e.innerText || '').trim().slice(0, 22), ...box(e) })) }
  }
  const topbar = document.querySelector('#schedBoard .sb-top, #schedBoard .sb-daybar, .topbar')
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    sideScroll: { docW: document.documentElement.scrollWidth, winW: window.innerWidth, overflows: document.documentElement.scrollWidth > window.innerWidth + 1 },
    boardTopBarH: topbar ? Math.round(topbar.getBoundingClientRect().height) : null,
    dayBar: bar ? { box: box(bar), text: (bar.innerText || '').replace(/\n+/g, ' | '), ...rows(bar) } : null,
    oilBtnPhone: [...root.querySelectorAll('[data-oilmode]')].filter(vis).map(e => ({ t: e.innerText.trim(), ...box(e) })),
    oilBtnDesktop: (() => { const b = document.querySelector('#sbOil'); return b ? { vis: vis(b), ...box(b) } : null })(),
    clipped: [...root.querySelectorAll('button, .daybar-h')].filter(vis)
      .filter(e => { const b = e.getBoundingClientRect(); return b.right > window.innerWidth + 1 || b.left < -1 })
      .map(e => ({ t: (e.innerText || '').trim().slice(0, 22), ...box(e) })),
  }
})

R.beforePublish = await geom()
await shot(page, 'G-G4-01-phone-board-draft')

R.pub = await publish(page, di)
await page.waitForTimeout(700)
R.afterPublish = await geom()
await shot(page, 'G-G4-02-phone-board-published')

/* the green bars at phone size — strip width and half vs full */
R.bars = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const P = window.PEOPLE
  const out = []
  for (const e of root.querySelectorAll('.puck[data-person]')) {
    if (!(e.offsetParent)) continue
    if (e.closest('#sbRoster')) continue
    const cls = e.className
    const kind = /oilbar-fo/.test(cls) ? 'FULL' : /oilbar-ho/.test(cls) ? 'HALF' : null
    if (!kind) continue
    const cs = getComputedStyle(e, '::before')
    const b = e.getBoundingClientRect()
    out.push({ who: (P[e.dataset.person] || {}).cs || e.dataset.person, kind,
      puck: { w: Math.round(b.width), h: Math.round(b.height) },
      stripW: cs.width, stripH: cs.height, bg: cs.backgroundColor, grad: (cs.backgroundImage || '').slice(0, 70) })
  }
  return out.slice(0, 14)
})

/* the count chip beside ALL AVAIL — does the row wrap? */
R.chip = await page.evaluate(() => {
  const find = (scope) => {
    const r = document.querySelector(scope); if (!r) return null
    const c = [...r.querySelectorAll('.oilcount, [data-oilsent]')].filter(e => e.offsetParent)[0]
    if (!c) return { present: false }
    const b = c.getBoundingClientRect()
    const row = c.closest('.c6r, tr, [class*=row]')
    const rb = row ? row.getBoundingClientRect() : null
    return { present: true, text: c.innerText.trim(), title: c.getAttribute('title'), box: { w: Math.round(b.width), h: Math.round(b.height) }, rowH: rb ? Math.round(rb.height) : null }
  }
  return { board: find('#schedBoard'), week: find('#eWeek') }
})

/* --- into the mode, by the phone's own door --- */
R.doorCheck = await page.evaluate((i) => {
  const vis = e => !!(e && (e.offsetParent || e.getClientRects().length))
  const phone = document.querySelector(`#schedBoard [data-oilmode="${i}"]`)
  const desk = document.querySelector('#sbOil')
  return { phoneBtnVisible: vis(phone), phoneBtnText: phone ? phone.innerText.trim() : null, desktopBtnVisible: vis(desk) }
}, di)
await page.locator(`#schedBoard [data-oilmode="${di}"]:visible`).first().click()
await page.waitForTimeout(900)
R.inMode = await geom()
await shot(page, 'G-G4-03-phone-mode-on-top')

R.modeBar = await page.evaluate(() => {
  const bar = document.querySelector('#schedBoard .daybar')
  if (!bar) return null
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  const kids = [...bar.querySelectorAll('button, .daybar-h, .daybar-note')].filter(vis)
  return {
    text: (bar.innerText || '').replace(/\n+/g, ' | '),
    h: Math.round(bar.getBoundingClientRect().height),
    parts: kids.map(e => { const b = e.getBoundingClientRect(); return { t: (e.innerText || '').trim().slice(0, 40), y: Math.round(b.y), x: Math.round(b.x), right: Math.round(b.right), w: Math.round(b.width) } }),
    overflowRight: kids.filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).map(e => (e.innerText || '').trim().slice(0, 24)),
  }
})

/* tap targets: the small pucks in the mode */
R.tapTargets = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const P = window.PEOPLE
  const all = [...root.querySelectorAll('[data-oilp]')].filter(e => e.offsetParent)
  const boxes = all.map(e => { const b = e.getBoundingClientRect(); return { who: (P[e.getAttribute('data-oilp')] || {}).cs, w: Math.round(b.width), h: Math.round(b.height) } })
  const hs = boxes.map(b => b.h).sort((a, b) => a - b)
  return { n: boxes.length, minH: hs[0], medH: hs[Math.floor(hs.length / 2)], under44: boxes.filter(b => b.h < 44).length, under30: boxes.filter(b => b.h < 30).length, sample: boxes.slice(0, 6) }
})

/* really tap four of them, on the phone */
const ID = await page.evaluate(() => { const o = {}; for (const [k, v] of Object.entries(window.PEOPLE)) o[v.cs] = k; return o })
R.phoneTaps = {}
for (const cs of ['Ranger', 'Piston', 'Saber', 'Sidewinder']) {
  const el = page.locator(`#schedBoard [data-oilp="${ID[cs]}"]:visible`).first()
  if (!await el.count()) { R.phoneTaps[cs] = 'no puck'; continue }
  await el.scrollIntoViewIfNeeded().catch(() => {})
  const b4 = await el.getAttribute('title')
  await el.click()
  await page.waitForTimeout(400)
  const af = await page.locator(`#schedBoard [data-oilp="${ID[cs]}"]:visible`).first().getAttribute('title').catch(() => null)
  R.phoneTaps[cs] = { flipped: b4 !== af, after: (af || '').slice(0, 60) }
}
await shot(page, 'G-G4-04-phone-mode-taps')

/* blanket on and off, at phone width */
const blank = page.locator('#schedBoard [data-oilblank]:visible').first()
await blank.click(); await page.waitForTimeout(700)
R.blanketOn = await page.evaluate(() => ({ bar: ((document.querySelector('#schedBoard .daybar') || {}).innerText || '').replace(/\n+/g, ' | '), h: Math.round((document.querySelector('#schedBoard .daybar') || {}).getBoundingClientRect?.().height || 0) }))
await shot(page, 'G-G4-05-phone-blanket-on')
await blank.click(); await page.waitForTimeout(600)

/* the sentinel, opened out on the phone */
R.sentinelPhone = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const row = [...root.querySelectorAll('.c6r, tr, [class*=row]')].find(r => /FAMILY DAY/.test(r.innerText || ''))
  if (!row) return null
  const b = row.getBoundingClientRect()
  return { rowH: Math.round(b.height), pucks: row.querySelectorAll('[data-oilp]').length,
    wraps: Math.round(b.height) > 60, text: (row.innerText || '').replace(/\n+/g, ' ').slice(0, 90) }
})
const famRow = page.locator('#schedBoard').getByText('FAMILY DAY').first()
await famRow.scrollIntoViewIfNeeded().catch(() => {})
await shot(page, 'G-G4-06-phone-sentinel-open')

/* ✓ Done, on the phone */
const done = page.locator(`#schedBoard [data-oilmode="${di}"]:visible`).first()
R.doneBtn = await page.evaluate((i) => { const e = document.querySelector(`#schedBoard [data-oilmode="${i}"]`); const b = e.getBoundingClientRect(); return { t: e.innerText.trim(), x: Math.round(b.x), right: Math.round(b.right), w: Math.round(b.width), inView: b.right <= window.innerWidth + 1 } }, di)
await done.click()
await page.waitForTimeout(900)
R.afterDone = await page.evaluate(() => ({
  modeOff: !document.querySelector('#schedBoard [data-oilitem]'),
  boxesEditable: [...document.querySelectorAll('#schedBoard input[data-bfld]')].filter(e => !e.disabled).length,
  bar: ((document.querySelector('#schedBoard .daybar') || {}).innerText || '').replace(/\n+/g, ' | '),
}))
await shot(page, 'G-G4-07-phone-after-done')

/* just below and just above 390 */
for (const w of [360, 389, 391, 430]) {
  await page.setViewportSize({ width: w, height: 844 })
  await page.waitForTimeout(600)
  R['w' + w] = await geom()
  await shot(page, 'G-G4-08-width-' + w)
}
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(500)

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-g4.json', JSON.stringify(R, null, 1))
const g = (n, o) => { console.log(`--- ${n} ---`); console.log('  sideScroll ' + JSON.stringify(o.sideScroll) + '  topbarH=' + o.boardTopBarH)
  console.log('  dayBar lines=' + (o.dayBar && o.dayBar.lines) + ' h=' + (o.dayBar && o.dayBar.box.h) + '  "' + (o.dayBar && o.dayBar.text) + '"')
  console.log('  clipped: ' + JSON.stringify(o.clipped)) }
g('phone, draft', R.beforePublish); g('phone, published', R.afterPublish); g('phone, IN THE MODE', R.inMode)
console.log('publish:', JSON.stringify(R.pub))
console.log('door check:', JSON.stringify(R.doorCheck))
console.log('mode bar:', JSON.stringify(R.modeBar, null, 1))
console.log('bars:', JSON.stringify(R.bars, null, 1))
console.log('count chip:', JSON.stringify(R.chip))
console.log('tap targets:', JSON.stringify(R.tapTargets))
console.log('phone taps:', JSON.stringify(R.phoneTaps))
console.log('blanket on:', JSON.stringify(R.blanketOn))
console.log('sentinel:', JSON.stringify(R.sentinelPhone))
console.log('Done button:', JSON.stringify(R.doneBtn), ' after Done:', JSON.stringify(R.afterDone))
for (const w of [360, 389, 391, 430]) { const o = R['w' + w]; console.log(`  @${w}px  dayBar lines=${o.dayBar && o.dayBar.lines} h=${o.dayBar && o.dayBar.box.h}  sideScroll=${o.sideScroll.overflows}  clipped=${o.clipped.length}`) }
console.log('errors:', R.errors)
await browser.close()
