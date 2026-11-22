// Helpers for the pictures that explain the agent's readings 2–4 of D2313 to him (chat 140, 22 Nov 26).
// Desktop only (1536 wide), the browser's clock set to the demo week; routes copied from sfd-w2.mjs / sfd-host.mjs.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '../..')
export const URL_ = process.env.SFD_URL || 'http://localhost:4326/'
export const OUT = process.env.SFD_OUT || path.join(ROOT, 'docs/mock/2026-11-22-sans-readings/img')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(OUT, { recursive: true })
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const MAN = 'rocky'   // Hex, a WSO

export async function world(at, scale = 2) {
  const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await b.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: scale })
  await ctx.clock.install({ time: new Date(at) })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
  await p.goto(URL_)
  await p.waitForSelector('#luser'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(800)
  return { b, ctx, p, errs }
}
export const go = async (p, to) => { await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await sleep(600) }
export const nextDay = async p => { await p.clock.fastForward('24:00:00'); await sleep(600) }
export const state = (p, id = MAN) => p.evaluate(id => { const q = window.PEOPLE[id]; return { today: new Date().toDateString(), san: !!q.san, sanFrom: q.sanFrom || null, sanWas: q.sanWas || null, sanBy: q.sanBy || null, archived: !!q.archived } }, id)

export async function closeBoard(p) {
  if (!(await p.locator('#schedBoard').count())) return
  const done = p.locator('#schedBoard button:visible', { hasText: 'Done' }).first()
  if (await done.count()) await done.click(); else await p.keyboard.press('Escape')
  await sleep(500)
}
export async function openBoard(p, di) {
  await closeBoard(p)
  await go(p, 'editsched')
  const d = p.locator(`#eWeek [data-sbday="${di}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await d.click(); await p.waitForSelector('#schedBoard'); await sleep(900)
}
export async function lwCell(p, id, iso) {
  await closeBoard(p)
  await go(p, 'leavewar'); await sleep(900)
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][Number(iso.slice(5, 7)) - 1]
  const m = p.locator(`[data-testid="month-${mon}"]:visible`).first()
  if (await m.count()) { await m.click(); await sleep(900) }
  const c = p.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
  return c
}
export async function postOutSans(p, id, iso) {
  const c = await lwCell(p, id, iso)
  await c.click(); await sleep(400)
  await p.click('[data-testid="bid-more"]:visible'); await sleep(300)
  await p.click('[data-testid="bid-postout"]:visible'); await sleep(300)
  await p.click('[data-testid="po-sans"]:visible'); await sleep(300)
  await p.click('[data-testid="po-confirm"]:visible'); await sleep(1000)
}
export async function qualsCell(p, id) {
  await closeBoard(p)
  await go(p, 'quals')
  await p.click('#qViewW'); await sleep(300)
  if (await p.locator('#qEdit:visible').count()) { await p.click('#qEdit'); await sleep(300) }
  const cell = p.locator(`td[data-q="${id}|san"]`).first()
  await cell.scrollIntoViewIfNeeded()
  return cell
}

/* THE MARK: a red ring round each element, and one short label beside the first. Removed by unmark(). */
export async function mark(p, sels, label, where = 'right') {
  await p.evaluate(([sels, label, where]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    let first = true
    for (const s of sels) for (const e of [...document.querySelectorAll(s)].filter(vis)) {
      const r = e.getBoundingClientRect()
      const o = document.createElement('div'); o.className = 'xp-mark'
      o.style.cssText = `position:fixed;left:${r.left - 5}px;top:${r.top - 5}px;width:${r.width + 10}px;height:${r.height + 10}px;border:3px solid #e11d48;border-radius:9px;z-index:99998;pointer-events:none;box-shadow:0 0 0 2px #fff`
      document.body.appendChild(o)
      if (first && label) {
        const l = document.createElement('div'); l.className = 'xp-mark'
        l.textContent = label
        l.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;background:#e11d48;color:#fff;font:600 13px/1.25 system-ui,sans-serif;padding:4px 8px;border-radius:6px;max-width:260px;white-space:normal'
        document.body.appendChild(l)
        const lr = l.getBoundingClientRect()
        let x = where === 'left' ? r.left - lr.width - 12 : where === 'below' || where === 'above' ? r.left - 4 : r.right + 12
        let y = where === 'below' ? r.bottom + 10 : where === 'above' ? r.top - lr.height - 10 : r.top + r.height / 2 - lr.height / 2
        x = Math.max(4, Math.min(x, innerWidth - lr.width - 4)); y = Math.max(4, Math.min(y, innerHeight - lr.height - 4))
        l.style.left = x + 'px'; l.style.top = y + 'px'
      }
      first = false
    }
  }, [sels, label, where])
}
export const unmark = p => p.evaluate(() => document.querySelectorAll('.xp-mark').forEach(e => e.remove()))
/* a picture cut to the box round the given elements (plus the marks), with a margin */
export async function shot(p, name, sels, pad = 14) {
  const box = sels ? await p.evaluate(([sels, pad]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const es = [...sels.flatMap(s => [...document.querySelectorAll(s)]), ...document.querySelectorAll('.xp-mark')].filter(vis)
    if (!es.length) return null
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
    for (const e of es) { const r = e.getBoundingClientRect(); x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom) }
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(innerWidth, x1 + pad); y1 = Math.min(innerHeight, y1 + pad)
    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
  }, [sels, pad]) : null
  const f = path.join(OUT, name + '.png')
  await p.screenshot(box ? { path: f, clip: box } : { path: f })
  console.log('PIC', name, box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'full')
  return f
}
