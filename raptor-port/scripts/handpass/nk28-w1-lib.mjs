// W1 helpers for chat 28's "Not kept" walk. Version: nk28-w1-lib v1
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-08-chat28-not-kept/w1')
mkdirSync(OUT, { recursive: true })
process.env.HP_URL ||= 'http://localhost:4431'
process.env.C9_RESULTS ||= resolve(OUT, 'unused-results.json')
export const L = await import('./trk-chat9-lib.mjs')
const { serveFrozen } = await import('./isr-serve.mjs')
export const LOCK_INIT = `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('denied', 'SecurityError') } })`
export const R = []
export const ERRS = []
export const ok = (step, cond, said, pics = '') => { const res = cond === null ? 'NOTRUN' : cond ? 'PASS' : 'FAIL'; R.push({ step, res, said: String(said).slice(0, 900), pics }); console.log(res + ' ' + step + ' — ' + String(said).slice(0, 400) + (pics ? ' [' + pics + ']' : '')) }
export const note = (step, said, pics = '') => { R.push({ step, res: 'RECORD', said: String(said).slice(0, 900), pics }); console.log('RECORD ' + step + ' — ' + String(said).slice(0, 400)) }
export const sleep = L.sleep
export const vis = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); const kids = [...e.children].filter(k => k.getBoundingClientRect().width > 1).map(k => k.tagName + ':' + k.textContent.replace(/\s+/g, ' ').trim()); const cs = getComputedStyle(e); return { t: Math.round(r.top * 10) / 10, b: Math.round(r.bottom * 10) / 10, l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height * 10) / 10, text: e.innerText.replace(/\s+/g, ' ').trim(), kids, btn: !!e.querySelector('button'), color: cs.color, bbc: cs.borderBottomColor, bbw: cs.borderBottomWidth, pos: cs.position } }, sel)
export async function shot(page, name, opts = {}) { const f = name + '.png'; await page.screenshot({ path: resolve(OUT, f), ...opts }); return 'w1/' + f }
export async function world({ size = L.PC, dpr = 2, locked = true, url = '/', clock = true } = {}) {
  const b = await L.browserFor('chromium', true, false)
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: dpr })
  await serveFrozen(ctx, L.BASE)
  if (locked) await ctx.addInitScript(LOCK_INIT)
  await ctx.addInitScript('try { delete window.showSaveFilePicker; delete window.showOpenFilePicker } catch (e) {}')
  if (clock) await ctx.clock.install({ time: new Date('2026-11-08T09:00:00+08:00') })
  const page = await ctx.newPage(); page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  ERRS.push(errors)
  await page.goto(L.BASE + url)
  return { ctx, page, errors }
}
// press a top tab on screen (the bar's own link)
export async function tab(page, name) {
  const t = page.locator(`#topnav a[data-page="${name}"]:visible`)
  if (await t.count()) { await t.first().click(); await sleep(1100); return true }
  return false
}
export function finish(file) {
  writeFileSync(resolve(OUT, file), JSON.stringify({ R, errors: ERRS.flat() }, null, 1))
  const c = x => R.filter(r => r.res === x).length
  console.log(`done: ${c('PASS')} pass, ${c('FAIL')} fail, ${c('NOTRUN')} notrun; page errors ${ERRS.flat().length}`)
}
export { L as lib }
