/* THE KEYBOARD RING ON EVERY BOARD BUTTON (chat 11, 8 Nov 26 — [BOARD-KEYS-LOOKS], D1771, D1646). Opens the Scheduler
   Board, puts the keys on every button it draws, one by one, and lists each one that does NOT wear the app's cyan ring
   (the browser's own ring reads `auto`). Then the board's ⋯ menu and the week's ⋯ menu, item by item. A cropped picture
   of each named control under the keys. Usage: node scripts/handpass/bl-rings.mjs <port> <width> <height> <outdir> */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

const PORT = process.argv[2] || '4191'
const W = +(process.argv[3] || 1536), H = +(process.argv[4] || 864)
const OUT = process.argv[5] || 'docs/img/handpass/2026-11-08-board-layout/rings'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await browser.newPage({ viewport: { width: W, height: H } })
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()) })

await page.goto(`http://localhost:${PORT}/`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')

/* the week's ⋯ (Edit Schedule) first, item by item */
const ringOf = () => page.evaluate(() => {
  const a = document.activeElement, cs = a && getComputedStyle(a)
  return a ? { what: (a.id ? '#' + a.id : '') + '.' + [...a.classList].join('.') + ' "' + (a.textContent || '').trim().slice(0, 24) + '"',
    vis: a.matches(':focus-visible'), style: cs.outlineStyle, color: cs.outlineColor, off: cs.outlineOffset, bg: cs.backgroundColor } : null
})
const accent = await page.evaluate(() => { const d = document.createElement('i'); d.style.color = 'var(--accent)'; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c })
const rows = []
const judge = (r, where) => { const ok = r && r.vis && r.style === 'solid' && r.color === accent; rows.push({ where, ok, ...r }); return ok }

await page.click('[data-pg="editsched"], #nav-editsched, button:has-text("Edit Schedule")').catch(() => {})
await page.waitForSelector('#eWeek .day', { timeout: 8000 }).catch(() => {})
const wkMore = page.locator('#page-editsched .schedule-morewrap > button:visible').first()
if (await wkMore.count()) {
  await wkMore.focus(); await page.keyboard.press('Enter')
  await page.waitForTimeout(150)
  for (let i = 0; i < 3; i++) {
    const r = await ringOf(); if (!r || !/schedule-moreitem/.test(r.what)) break
    judge(r, 'week ⋯ item')
    if (i === 0) { const b = await page.locator('.schedule-moremenu:visible').boundingBox(); if (b) await page.screenshot({ path: `${OUT}/${W}-week-more-item.png`, clip: { x: Math.max(0, b.x - 12), y: Math.max(0, b.y - 12), width: b.width + 24, height: b.height + 24 } }) }
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60)
  }
  await page.keyboard.press('Escape')
}

/* the board */
await page.locator('#eWeek [data-sbday="0"]:visible').first().click()
await page.waitForSelector('#schedBoard:not([hidden])')
await page.waitForTimeout(300)
await page.keyboard.press('Shift')   // the keys are the last input, so a focus() below is a keyboard focus
const ids = await page.evaluate(() => {
  const sel = 'button, [tabindex]:not([tabindex="-1"])'
  const els = [...document.querySelectorAll(`#schedBoard:not([hidden]) :is(${sel})`)]
    .filter(e => e.offsetParent && !e.disabled && !e.closest('[hidden]'))
  els.forEach((e, i) => e.setAttribute('data-ringprobe', String(i)))
  return els.length
})
const seen = new Map()
for (let i = 0; i < ids; i++) {
  await page.keyboard.press('Shift')
  await page.evaluate(n => document.querySelector(`[data-ringprobe="${n}"]`)?.focus(), i)
  const r = await ringOf(); if (!r) continue
  const key = r.what.replace(/"[^"]*"$/, '').replace(/\d+/g, '#')
  const ok = r.vis && r.style === 'solid' && r.color === accent
  if (!seen.has(key)) seen.set(key, { ...r, ok, n: 0 })
  seen.get(key).n++
}
/* the board's ⋯ menu */
const more = page.locator('#schedBoard .sb-morewrap > button:visible, #sbMore:visible').first()
if (await more.count()) {
  await more.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(150)
  for (let i = 0; i < 3; i++) {
    const r = await ringOf(); if (!r || !/sb-moreitem/.test(r.what)) break
    judge(r, 'board ⋯ item')
    if (i === 0) { const b = await page.locator('.sb-moremenu:visible').boundingBox(); if (b) await page.screenshot({ path: `${OUT}/${W}-board-more-item.png`, clip: { x: Math.max(0, b.x - 12), y: Math.max(0, b.y - 12), width: b.width + 24, height: b.height + 24 } }) }
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60)
  }
  await page.keyboard.press('Escape')
}
/* a cropped picture of each named control under the keys */
const named = { 'block': '#schedBoard [data-dwadd]:visible', 'amt-block': '#schedBoard [data-sblkadd]:visible', 'wave': '#schedBoard [data-wvadd]:visible',
  'plans': '#schedBoard .planselbtn:visible', 'templates-bar': '#schedBoard #sbTpl:visible', 'templates-day': '#schedBoard .daybtn:visible' }
for (const [n, s] of Object.entries(named)) {
  const l = page.locator(s).first(); if (!(await l.count())) { rows.push({ where: n, ok: null, what: 'not on screen' }); continue }
  await l.scrollIntoViewIfNeeded(); await page.keyboard.press('Shift'); await l.focus(); await page.waitForTimeout(80)
  judge(await ringOf(), n)
  const b = await l.boundingBox(); if (b) await page.screenshot({ path: `${OUT}/${W}-${n}.png`, clip: { x: Math.max(0, b.x - 30), y: Math.max(0, b.y - 18), width: b.width + 60, height: b.height + 36 } })
}
const out = { W, H, accent, named: rows, board: [...seen.entries()].map(([k, v]) => ({ key: k, ...v })), errors }
writeFileSync(`${OUT}/${W}-rings.json`, JSON.stringify(out, null, 1))
for (const r of rows) console.log((r.ok ? 'RING ' : r.ok === null ? 'NONE ' : 'MISS ') + r.where + ' — ' + (r.what || '') + ' ' + (r.style || '') + ' ' + (r.color || ''))
console.log('--- board buttons without the cyan ring:')
for (const [k, v] of seen) if (!v.ok) console.log('  ' + v.n + '× ' + k + ' — ' + v.style + ' ' + v.color + ' "' + v.what.split('"')[1] + '"')
console.log('errors: ' + errors.length); errors.slice(0, 5).forEach(e => console.log('  ' + e))
await browser.close()
