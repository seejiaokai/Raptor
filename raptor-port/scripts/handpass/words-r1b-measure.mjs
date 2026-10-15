// THE WORDS PASS, ROUND 1b — measured on the BUILT app (D945, D947): the board's Personal Inputs at several phone widths
// (does the Reject button clear the puck and the remark on its puck's line?), the week's Personal Inputs on a phone, the
// Ground Programme's line, and the wave header. Reads only; nothing is changed.
//   node scripts/handpass/words-r1b-measure.mjs [out dir]     (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-16-words-pass/r1b-built')
mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = [], facts = {}

async function signIn(page) {
  await page.goto(URL)
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(700)
}
async function openBoard(page) {
  await signIn(page)
  await page.locator('#eWeek [data-sbday="0"]').first().click()
  await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(600)
  await page.evaluate(() => document.querySelector('#schedBoard [data-pitog="0"]')?.click()); await page.waitForTimeout(300)
}
/* every Personal Inputs row: its height, its Reject's box, and whether the button touches the puck or the remark */
const rowsOf = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].map(r => {
  const R = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom), w: Math.round(b.width) } }
  const btn = R(r.querySelector('.accb')), pk = [...r.querySelectorAll('.ppl .pk, .ppl .seat')].map(R), rm = R(r.querySelector('.rmkin, .rmk'))
  const hit = (a, b) => !!(a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b)
  return { text: (r.querySelector('.accb')?.textContent || ''), up: r.className.includes('accup') || r.className.includes('accd'), h: Math.round(r.getBoundingClientRect().height), btn, overPuck: pk.some(p => hit(btn, p)), overRmk: hit(btn, rm), offRow: !!(btn && (btn.r > r.getBoundingClientRect().right + 1)) }
}), sel)

for (const w of [360, 375, 390, 430, 1440]) {
  const phone = w < 821
  const ctx = await browser.newContext({ viewport: { width: w, height: 9000 }, deviceScaleFactor: phone ? 3 : 2, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${w} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${w} console: ` + m.text().slice(0, 200)) })
  await openBoard(page)
  facts[w + ' board wave notes'] = await page.evaluate(() => document.querySelectorAll('#schedBoard .sb-go-h .asd').length)
  facts[w + ' board wave header h'] = await page.evaluate(() => Math.round(document.querySelector('#schedBoard .sb-go-h')?.getBoundingClientRect().height || 0))
  facts[w + ' board GP line'] = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-pinote')].map(e => e.textContent))
  facts[w + ' board PI rows'] = await rowsOf(page, '#schedBoard .sb-panel.pinp .sb-arow.inprow')
  const pi = await page.evaluate(() => { const p = document.querySelector('#schedBoard .sb-panel.pinp'); if (!p) return null; p.scrollIntoView(); const b = p.getBoundingClientRect(); return { x: 0, y: Math.round(b.top + scrollY) - 8, width: innerWidth, height: Math.min(700, Math.round(b.height) + 16) } })
  if (pi) await page.screenshot({ path: join(OUT, `board-pi-${w}.png`), clip: pi, fullPage: true })
  const gp = await page.evaluate(() => { const p = document.querySelector('#schedBoard .sb-panel.grnd'); if (!p) return null; const b = p.getBoundingClientRect(); return { x: Math.max(0, Math.round(b.left) - 6), y: Math.round(b.top + scrollY) - 8, width: Math.min(innerWidth, Math.round(b.width) + 12), height: Math.min(420, Math.round(b.height) + 16) } })
  if (gp && (w === 390 || w === 1440)) await page.screenshot({ path: join(OUT, `board-gp-${w}.png`), clip: gp, fullPage: true })
  const wv = await page.evaluate(() => { const p = document.querySelector('#schedBoard .sb-go'); if (!p) return null; const b = p.getBoundingClientRect(); return { x: Math.max(0, Math.round(b.left) - 6), y: Math.round(b.top + scrollY) - 8, width: Math.min(innerWidth, Math.round(b.width) + 12), height: 200 } })
  if (wv && (w === 390 || w === 1440)) await page.screenshot({ path: join(OUT, `board-wave-${w}.png`), clip: wv, fullPage: true })
  /* the week */
  await signIn(page)
  await page.evaluate(() => document.querySelector('#eWeek [data-pitog="0"]')?.click()); await page.waitForTimeout(400)
  const D = '#eWeek .day[data-day="0"]'
  facts[w + ' week GP line'] = await page.evaluate(D => [...document.querySelectorAll(D + ' .sec-grnd .pl-inpnote')].map(e => e.textContent), D)
  facts[w + ' week PI rows'] = await rowsOf(page, `${D} .sec-inp .pl-row`)
  const wpi = await page.evaluate(D => { const p = document.querySelector(D + ' .sec-inp'); if (!p) return null; const b = p.getBoundingClientRect(); return { x: Math.max(0, Math.round(b.left) - 6), y: Math.round(b.top + scrollY) - 8, width: Math.min(innerWidth - Math.max(0, Math.round(b.left) - 6), Math.round(b.width) + 12), height: Math.min(600, Math.round(b.height) + 16) } }, D)
  if (wpi) await page.screenshot({ path: join(OUT, `week-pi-${w}.png`), clip: wpi, fullPage: true })
  const wgp = await page.evaluate(D => { const p = document.querySelector(D + ' .sec-grnd'); if (!p) return null; const b = p.getBoundingClientRect(); return { x: Math.max(0, Math.round(b.left) - 6), y: Math.round(b.top + scrollY) - 8, width: Math.min(innerWidth - Math.max(0, Math.round(b.left) - 6), Math.round(b.width) + 12), height: Math.min(420, Math.round(b.height) + 16) } }, D)
  if (wgp && (w === 390 || w === 1440)) await page.screenshot({ path: join(OUT, `week-gp-${w}.png`), clip: wgp, fullPage: true })
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify(facts, null, 1))
console.log(JSON.stringify(facts, null, 1).slice(0, 9000))
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
