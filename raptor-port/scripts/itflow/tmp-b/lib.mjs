import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
export const SP = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-docs-rulings-slim-down-e83c74/bd625616-9217-44be-8d31-64893dff3b57/scratchpad/research-b'
mkdirSync(SP, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const errors = []
export async function fresh(who = 'ad') {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto('http://localhost:4185/?fresh=1')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : who)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
  return page
}
export async function go(page, p) {
  await page.evaluate(p => window.go(p), p)
  await page.waitForFunction(p => window.CURPAGE === p, p)
  await page.waitForTimeout(700)
}
export async function shot(page, name, clip) {
  await page.screenshot({ path: `${SP}/${name}.png`, ...(clip ? { clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h } } : {}) })
}
export async function box(page, sel) {
  const l = typeof sel === 'string' ? page.locator(sel).first() : sel
  if (!(await l.count())) return 'ABSENT'
  const b = await l.boundingBox(); return b ? `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}` : 'HIDDEN'
}
export async function sign(page, di = 0) {
  for (const k of ['cur', 'sked', 'plan', 'appr']) {
    const s = `select[data-sign="${k}"][data-signday="${di}"]`
    const v = await page.$eval(s, el => [...el.options].find(o => o.value)?.value)
    await page.selectOption(s, v); await page.waitForTimeout(250)
  }
}
/* capture.mjs-style shot: crop + marks, report each mark's box relative to the crop and whether it is inside */
export async function cap(page, id, crop, marks = []) {
  const rep = []
  for (const m of marks) {
    const el = typeof m.sel === 'string' ? page.locator(m.sel).first() : m.sel
    const b = (await el.count()) ? await el.boundingBox() : null
    if (!b) { rep.push(`  ${m.see ? 'see' : m.n}: ${m.sel} -> NOT ON SCREEN`); continue }
    const inside = b.x >= crop.x && b.y >= crop.y && b.x + b.width <= crop.x + crop.w && b.y + b.height <= crop.y + crop.h
    rep.push(`  ${m.see ? 'see' : m.n}: ${m.sel} @${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)} ${inside ? 'INSIDE' : '*** OUTSIDE ***'}`)
  }
  await page.screenshot({ path: `${SP}/${id}.png`, clip: { x: crop.x, y: crop.y, width: crop.w, height: crop.h } })
  console.log(`[${id}] crop ${JSON.stringify(crop)}\n` + rep.join('\n'))
}
export async function mdrag(page, srcSel, dstSel, { hold = false } = {}) {
  const sb = await page.locator(srcSel).first().boundingBox(), cb = await page.locator(dstSel).first().boundingBox()
  await page.mouse.move(sb.x + 5, sb.y + 5); await page.mouse.down(); await page.mouse.move(sb.x + 15, sb.y + 15, { steps: 3 })
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2, { steps: 12 })
  if (!hold) { await page.mouse.up(); await page.waitForTimeout(800) }
}
export const toastOf = (page) => page.evaluate(() => { const t = document.getElementById('toastEl'); return t && t.style.opacity !== '0' ? t.textContent.trim() : '' })
export async function center(page, sel) { await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(350) }
/* a 4:3 crop of width w around a centre point, clamped to the 1440x900 viewport */
export function around(cx, cy, w = 560) { const h = Math.round(w * 3 / 4); let x = Math.round(cx - w / 2), y = Math.round(cy - h / 2); x = Math.max(0, Math.min(1440 - w, x)); y = Math.max(0, Math.min(900 - h, y)); return { x, y, w, h } }
export async function mid(page, sel) { const b = await page.locator(sel).first().boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2] }
export async function menuDump(page) { return page.evaluate(() => [...document.querySelectorAll('.wavemenu')].filter(e => e.offsetWidth).map(e => [...e.querySelectorAll('button, h5, .wm-note, .wm-hdr')].map(x => `${x.tagName}[${[...x.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' ')}]"${x.innerText.replace(/\s+/g, ' ').slice(0, 60)}"`).join(' | '))) }
export async function typeIn(page, sel, v) { const el = page.locator(sel).first(); await el.click(); await el.fill(v); await el.evaluate(e => e.blur()); await page.waitForTimeout(300) }
export async function modals(page) { return page.evaluate(() => [...document.querySelectorAll('.modal')].filter(e => !e.hidden && e.offsetWidth).map(e => (e.id || e.className) + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 400))) }
