// q9 (the owner's "Q9"): publish Wed 15 Jul with one flying line without times + SDO 08:00-15:00,
// then make 15 Jul a public holiday on the Leave War Event row, reopen the day, publish again.
// DEV=desk (1440x900 @2) or DEV=phone (402x874 @3, touch). Pictures: docs/img/handpass/2026-11-11-rules-check-q9/
process.env.HP_URL ||= 'http://localhost:4180'
const DEV = process.env.DEV || 'desk'
const OUT = new URL('../../docs/img/handpass/2026-11-11-rules-check-q9/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
process.env.HP_SHOTS ||= OUT + 'scratch-' + DEV
import { existsSync, writeFileSync } from 'node:fs'
const L = await import('./lib.mjs')
const { chromium } = await import('@playwright/test')
console.log('q9-flow v7 ' + DEV)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const phone = DEV === 'phone'
const ctx = await b.newContext(phone
  ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true }
  : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
await page.goto('http://localhost:4180/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await L.login(page, 'a')
const DI = 2, ISO = '2026-07-15'
const pic = async (name, o = {}) => { await page.screenshot({ path: OUT + `${name}-${DEV}.png`, ...o }); console.log('PIC', name) }
const log = (...a) => console.log(...a)
const press = loc => phone ? loc.tap() : loc.click()

/* Picture-only helpers: nothing saved changes. */
async function opened() {   // let the warnings list show in full, scroll the board to its top
  if (phone) {   // the phone folds the issues bar: open it with a real tap, as a scheduler would
    const open = await page.evaluate(() => [...document.querySelectorAll('#schedBoard *')].some(e => e.offsetWidth && /(Gambit|Nomad|Trident) —/.test(e.innerText || '')))
    if (!open) { await page.locator('#schedBoard').getByText(/\d+ issues/).first().tap(); await page.waitForTimeout(600); log('PHONE issues bar opened') }
  }
  await page.evaluate(() => {
    const lis = [...document.querySelectorAll('#sbSide *')].filter(e => /publish it again|no usable times|issues/.test(e.innerText || '') && e.offsetWidth)
    for (const e of lis) {
      let p = e.parentElement
      while (p && p.id !== 'sbSide' && p !== document.body) {
        if (p.scrollHeight > p.clientHeight + 4) { p.dataset.q9open = '1'; p.style.maxHeight = 'none'; p.style.height = 'auto'; p.style.overflow = 'visible' }
        p = p.parentElement
      }
    }
    const sb = document.querySelector('#sbSide'); if (sb) { sb.style.maxHeight = 'none'; sb.style.overflow = 'visible' }
    const bd = document.querySelector('#schedBoard'); if (bd) bd.scrollTop = 0
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(300)
}
async function mark(on) {
  return page.evaluate(on0 => {
    document.querySelectorAll('[data-q9mark]').forEach(e => { e.style.outline = ''; e.style.outlineOffset = ''; delete e.dataset.q9mark })
    if (!on0) return []
    const found = []
    const vis = e => e.offsetWidth > 0 && e.offsetHeight > 0
    const smallest = (re, root = '#schedBoard') => {
      const c = [...document.querySelectorAll(root + ' *')].filter(e => vis(e) && re.test((e.innerText || '').replace(/\s+/g, ' ')))
      return c.filter(e => !c.some(o => o !== e && e.contains(o)))
    }
    const pick = (label, re, root) => smallest(re, root).forEach(e => { e.style.outline = '3px solid #ff00ff'; e.style.outlineOffset = '2px'; e.dataset.q9mark = label; found.push(label + ' :: ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 120)) })
    pick('publish-again', /publish it again/i)
    pick('no-usable-times', /no usable times/i)
    pick('pending-chip', /^(Not yet signed|\d+ pending)$/i)
    pick('to-sign', /^\d+ to sign/i)
    return found
  }, on)
}
async function panelClip(name) {   // one picture cut to the status header and the warnings list
  await opened()
  log('WARNLINES ' + name, JSON.stringify(await page.evaluate(() => {
    const vis = e => e.offsetWidth > 0 && e.offsetHeight > 0
    const c = [...document.querySelectorAll('#schedBoard *')].filter(e => vis(e) && /(issues|warnings?|—|earns OIL|publish it again)/.test(e.innerText || '') && (e.innerText || '').length < 220 && !/PLACEHOLDERS/.test(e.innerText))
    return c.filter(e => !c.some(o => o !== e && e.contains(o))).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim())
  })))
  const r = await page.evaluate(() => {
    const vis = e => e.offsetWidth > 0 && e.offsetHeight > 0
    const bd = document.querySelector('#schedBoard')
    const top = [...bd.querySelectorAll('*')].filter(e => vis(e) && /^SIGNED\b/.test((e.innerText || '').trim())).map(e => e.getBoundingClientRect().top).sort((a, b) => a - b)[0] ?? 0
    const side = [...document.querySelectorAll('#sbSide')].find(vis)
    let bottoms = [], sTop = 0
    if (side) {
      bottoms = [...side.querySelectorAll('li, .warn, [class*=warn], [class*=wrow]')].filter(vis).map(e => e.getBoundingClientRect().bottom)
      sTop = side.getBoundingClientRect().top
    } else {   // phone: the list sits inside the board, under the opened issues bar
      const c = [...bd.querySelectorAll('*')].filter(e => vis(e) && /(Gambit|Nomad|Trident|Kraken|publish it again) /.test(e.innerText || ''))
      const leaf = c.filter(e => !c.some(o => o !== e && e.contains(o)))
      bottoms = leaf.map(e => e.getBoundingClientRect().bottom)
    }
    return { top: Math.max(0, top - 10), bottom: Math.max(...bottoms, sTop + 40, top + 200) + 10, sideTop: sTop }
  })
  const vh = page.viewportSize().height, vw = page.viewportSize().width
  const y = Math.max(0, Math.floor(r.top)), h = Math.min(Math.ceil(r.bottom - r.top), 2400)
  await page.screenshot({ path: OUT + `${name}-${DEV}.png`, fullPage: true, clip: { x: 0, y, width: vw, height: h } })
  log('CLIP', name, JSON.stringify({ y, h, vh }))
}
async function dayText() {
  return page.evaluate(() => {
    const vis = e => e.offsetWidth > 0 && e.offsetHeight > 0
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    const b = document.querySelector('#schedBoard'); if (!b) return null
    const side = [...document.querySelectorAll('#sbSide')].filter(vis).map(t).join(' || ')
    return { head: t(b).slice(0, 380), side: side.slice(0, side.indexOf('PLACEHOLDERS')) }
  })
}
async function watchSidePicture(name) {   // whole screen
  await page.evaluate(() => window.scrollTo(0, 0))
  await pic(name)
}
async function sdoRead() {
  return page.evaluate(() => { const d = window.DAYS[2]; return { sdo: d.dutywaves[0].rows[0].role + '|' + d.dutywaves[0].rows[0].str + '-' + d.dutywaves[0].rows[0].end } })
}
async function lwProbe(label) {
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 15000 })
  await page.waitForTimeout(600)
  const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(900) }
  const cells = await page.evaluate(d => {
    const P = window.PEOPLE, out = {}
    for (const c of document.querySelectorAll('[data-testid^="cell-"]')) {
      if (!c.dataset.testid.endsWith(d)) continue
      const t = (c.innerText || '').trim(); if (!t) continue
      const id = c.dataset.testid.slice(5, -(d.length + 1)); out[(P[id] && P[id].cs) || id] = t
    }
    return out
  }, ISO)
  log('LWCELLS ' + label, JSON.stringify(cells))
  const ev = await page.evaluate(d => { const e = document.querySelector(`[data-testid="event-0-${d}"]`); return e ? e.innerText.trim() : null }, ISO)
  log('LWEVENT ' + label, ev)
  await page.evaluate(d => { const e = document.querySelector(`[data-testid="event-0-${d}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, ISO)
  await page.waitForTimeout(400)
  await pic('lw-grid-' + label)
  // OIL tracker
  await press(page.locator('[data-testid="oil-tracker"]')); await page.waitForTimeout(1200)
  const oil = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '))
  const i = oil.search(/15 Jul|Jul 15/); log('OILTRACKER ' + label, i >= 0 ? oil.slice(Math.max(0, i - 120), i + 300) : '(no 15 Jul text) ' + oil.slice(0, 300))
  await pic('oil-tracker-' + label)
  await page.keyboard.press('Escape'); await page.waitForTimeout(700); if (await page.locator('[data-testid="oil-sheet"]').count()) { const x = page.locator('[data-testid="oil-sheet"] .bidsheet-hd button').last(); await press(x); await page.waitForTimeout(600) }
}
async function bell(label) {
  const bl = page.locator('button.bellbtn:visible').first()
  if (await bl.count()) { await press(bl); await page.waitForTimeout(600); log('BELL ' + label, JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"], [data-testid="bell-empty"]')].filter(e => e.offsetWidth).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 500))))); await pic('bell-' + label); await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  else log('BELL ' + label, 'no bell found')
}

// ---------- 1. set up the day through the board's own boxes
await L.board(page, DI)
await L.type(page, '[data-bfld="ff:2.0.0.to"]', '')
await L.type(page, '[data-bfld="ff:2.0.0.ld"]', '')
await L.type(page, '[data-bfld="dr:2.0.0.end"]', '1500')
const set = await L.readDay(page, DI)
log('SET', JSON.stringify(set.waves[0].f[0]), JSON.stringify(set.duties[0]), JSON.stringify(await sdoRead()))
// ---------- 2. publish as an ordinary working day (A)
const pub1 = await L.publish(page, DI)
log('PUBLISH 1', JSON.stringify(pub1))
await page.waitForTimeout(600)
log('A', JSON.stringify(await dayText()))
await watchSidePicture('a-before-whole')
await panelClip('a-before')
await L.closeBoard(page)
await L.go(page, 'editsched'); await page.waitForTimeout(500)
await pic('a-week-before')
await lwProbe('a-before')
await bell('a-before')

// ---------- 3. Leave War Event row: make 15 Jul a public holiday
await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 15000 }); await page.waitForTimeout(600)
const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(900) }
const cellSel = `[data-testid="event-0-${ISO}"]`
await page.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, cellSel)
await page.waitForTimeout(400)
await press(page.locator(cellSel))
await page.locator('[data-testid="event-sheet"]').waitFor(); await page.waitForTimeout(400)
await press(page.locator('[data-testid="event-quick-0"]')); await page.waitForTimeout(300)
await pic('lw-event-sheet')
await press(page.locator('[data-testid="event-apply"]')); await page.waitForTimeout(1200)
log('LW event after', await page.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.trim() : null }, cellSel))
const oilList = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-oilday"]')].filter(e => e.offsetWidth).map(e => (e.innerText || '').replace(/\s+/g, ' ')))
log('OIL LIST', JSON.stringify(oilList))
await pic('lw-oil-list-opened')
const later = page.getByRole('button', { name: /^Later$/ })
if (await later.count() && await later.first().isVisible()) { await press(later.first()); await page.waitForTimeout(700) }
await pic('lw-after-ph')
await lwProbe('b-after')
await bell('b-after')

// ---------- 4. back to the schedule, open the published day (B)
await L.go(page, 'editsched'); await page.waitForTimeout(600)
await pic('b-week-after')
log('WEEK Wed', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#eWeek .day')].filter(e => e.offsetWidth && /Wednesday/.test(e.innerText)).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 130)))))
await L.board(page, DI); await page.waitForTimeout(800)
log('B', JSON.stringify(await dayText()))
log('B sign', JSON.stringify(await L.signState(page, DI)))
await watchSidePicture('b-after-whole')
await panelClip('b-after')
log('MARKS', JSON.stringify(await mark(true)))
await watchSidePicture('b-after-whole-marked')
await panelClip('b-after-marked')
await mark(false)

// ---------- 5. publish again (C)
const pub2 = await L.publish(page, DI)
log('PUBLISH 2', JSON.stringify(pub2))
await page.waitForTimeout(800)
log('C', JSON.stringify(await dayText()))
log('C sign', JSON.stringify(await L.signState(page, DI)))
await watchSidePicture('c-after-whole')
await panelClip('c-after')
await L.closeBoard(page)
await L.go(page, 'editsched'); await page.waitForTimeout(500)
await pic('c-week-after')
log('WEEK Wed C', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#eWeek .day')].filter(e => e.offsetWidth && /Wednesday/.test(e.innerText)).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 130)))))
await lwProbe('c-after')
await bell('c-after')

writeFileSync(OUT + `scratch-${DEV}-errors.txt`, errors.join('\n'))
log('ERRORS', JSON.stringify(errors))
await b.close()
