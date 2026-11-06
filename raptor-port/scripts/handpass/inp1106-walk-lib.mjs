// Shared helpers for the 6 Nov 26 Inputs batch walk (inp1106-walk-*.mjs)
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
export { chromium, webkit, LAUNCH }
export const sleep = ms => new Promise(r => setTimeout(r, ms))
const here = path.dirname(fileURLToPath(import.meta.url))
// a re-walk sends its pictures to a folder of its own (INP1106_OUT), the first walk's kept as they were (walk-scripts §6)
export const OUT = process.env.INP1106_OUT ? path.resolve(process.env.INP1106_OUT) : path.resolve(here, '../../docs/img/handpass/2026-11-06-inputs-batch/walk')
mkdirSync(OUT, { recursive: true })
export const ORIGIN = 'http://localhost:4394'
const NOW = new Date('2026-07-14T09:30:00+08:00')
export async function open(size) {
  const phone = size === 'phone'
  const br = phone ? await webkit.launch() : await chromium.launch(LAUNCH)
  const ctx = await br.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })
  await serveDist(ctx, ORIGIN, process.env.INP1106_DIST || 'C:/da1106/dist')
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push('pageerror: ' + e.message))
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  await p.clock.install({ time: NOW })
  await p.goto(ORIGIN + '/?fresh=1')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(1500)
  await p.evaluate(() => window.go('inputs')); await sleep(1000)
  const shot = async (name, opts = {}) => { await p.screenshot({ path: path.join(OUT, name + '.png'), ...opts }); }
  // phone: a picture right after a tap, then the settled one
  const tap = async (target, name) => {
    const loc = typeof target === 'string' ? p.locator(target).first() : target
    await loc.tap()
    await p.screenshot({ path: path.join(OUT, name + '-quick.png') })
    await sleep(700)
    await p.screenshot({ path: path.join(OUT, name + '.png') })
  }
  const press = async (target, name) => {
    const loc = typeof target === 'string' ? p.locator(target).first() : target
    if (phone) await tap(loc, name); else { await loc.click(); await sleep(500); await shot(name) }
  }
  return { br, ctx, p, errs, phone, shot, tap, press }
}
