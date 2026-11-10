// Chat 61's small schedule-and-board fixes: the shared helpers of its reproduction and its walk. Version: sb61-lib v1
// The build folder is WALK_DIR (served inside the test browser — no port), the picture folder SB61_OUT (walk-scripts §1).
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT = resolve(process.env.SB61_OUT || resolve(HERE, '../../docs/img/handpass/2026-11-10-sched-board-small/repro'))
mkdirSync(OUT, { recursive: true })
process.env.HP_URL ||= 'http://localhost:4461'
process.env.C9_RESULTS ||= resolve(OUT, 'unused-results.json')
export const L = await import('./trk-chat9-lib.mjs')
const { serveFrozen, WALK_DIR } = await import('./isr-serve.mjs')
if (!WALK_DIR) { console.log('sb61-lib: set WALK_DIR to the build folder'); process.exit(2) }
export const sleep = L.sleep
export const PC = { width: 1536, height: 730 }, PHONE = { width: 402, height: 874 }
export const R = []
export const ok = (step, cond, said, pics = '') => { const res = cond === null ? 'NOTRUN' : cond ? 'PASS' : 'FAIL'; R.push({ step, res, said: String(said), pics }); console.log(res + ' ' + step + ' — ' + String(said).slice(0, 700)) }
export const note = (step, said, pics = '') => { R.push({ step, res: 'RECORD', said: String(said), pics }); console.log('RECORD ' + step + ' — ' + String(said).slice(0, 700)) }
export async function shot(page, name, opts = {}) { await page.screenshot({ path: resolve(OUT, name + '.png'), ...opts }); return name + '.png' }
export async function world({ size = PC, dpr = 1, phone = false, engine = 'chromium' } = {}) {
  const b = await L.browserFor(engine, true, false)
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: dpr, ...(phone ? { hasTouch: true, isMobile: engine === 'chromium' } : {}) })
  await serveFrozen(ctx, L.BASE)
  // the clock starts at a set time and RUNS (walk-scripts §1)
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00+08:00') })
  const page = await ctx.newPage(); page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.goto(L.BASE + '/')
  await L.login(page, 'a')
  // the sign-in lands on View-only Sched: every step here starts from Edit Schedule
  await page.locator('#topnav a[data-page="editsched"]:visible').first().click(); await sleep(1100)
  return { ctx, page, errors }
}
/** the drawn element matching sel (a box wider than zero), as a plain rect — or null */
export const vis = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), text: (e.textContent || '').trim().slice(0, 200) } }, sel)
export async function openBoard(page, di) {
  await page.click(`#eWeek [data-sbday="${di}"]:visible`)
  await page.waitForSelector('#schedBoard'); await sleep(600)
}
export const act = page => page.evaluate(() => { const e = document.activeElement; if (!e) return null; const r = e.getBoundingClientRect(); return { tag: e.tagName, id: e.id, cls: (e.className + '').slice(0, 60), text: (e.textContent || '').trim().slice(0, 30), wvadd: e.getAttribute('data-wvadd'), attrs: [...e.attributes].map(a => a.name).filter(n => n.startsWith('data-')).join(','), t: Math.round(r.top) } })
export function finish(file) {
  writeFileSync(resolve(OUT, file), JSON.stringify({ R }, null, 1))
  const c = x => R.filter(r => r.res === x).length
  console.log(`done: ${c('PASS')} pass, ${c('FAIL')} fail, ${c('NOTRUN')} notrun, ${c('RECORD')} records`)
}
