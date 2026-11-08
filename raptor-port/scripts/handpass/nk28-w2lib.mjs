// W2 (his iPhone) helpers for chat 28's "Not kept" walk. Version: nk28-w2lib v1
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-08-chat28-not-kept/w2')
mkdirSync(OUT, { recursive: true })
process.env.HP_URL ||= 'http://localhost:4432'
process.env.C9_RESULTS ||= resolve(OUT, 'unused-results.json')
export const L = await import('./trk-chat9-lib.mjs')
const { serveFrozen, WALK_DIR } = await import('./isr-serve.mjs')
if (!WALK_DIR) { console.error('set WALK_DIR'); process.exit(2) }
export const sleep = L.sleep
export const LOCK_INIT = `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('denied', 'SecurityError') } })`
export const RESFILE = resolve(OUT, 'results.json')
export const R = existsSync(RESFILE) && process.env.W2_KEEP ? JSON.parse(readFileSync(RESFILE, 'utf8')) : []
export const ok = (sc, step, cond, said, pics = '') => { const res = cond === null ? 'NOTRUN' : cond ? 'PASS' : 'FAIL'; R.push({ sc, step, res, said: String(said).slice(0, 900), pics }); console.log(res.padEnd(6) + ' ' + sc + ' ' + step + ' — ' + String(said).slice(0, 300)); writeFileSync(RESFILE, JSON.stringify(R, null, 1)) }
export const note = (sc, step, said, pics = '') => { R.push({ sc, step, res: 'RECORD', said: String(said).slice(0, 900), pics }); console.log('RECORD ' + sc + ' ' + step + ' — ' + String(said).slice(0, 300)); writeFileSync(RESFILE, JSON.stringify(R, null, 1)) }
export const vis = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); const rest = e.querySelector('.sv-rest'), b = e.querySelector('b'); return { t: Math.round(r.top * 10) / 10, b: Math.round(r.bottom * 10) / 10, l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height * 10) / 10, text: e.innerText.replace(/\s+/g, ' ').trim(), bold: b ? b.innerText : null, rest: rest ? rest.innerText : null, btn: !!e.querySelector('button'), svg: !!e.querySelector('svg') || !!e.querySelector('.sv-sign'), sign: e.querySelector('.sv-sign') ? Math.round(e.querySelector('.sv-sign').getBoundingClientRect().width) : null, restCut: rest ? rest.scrollWidth > rest.clientWidth + 1 : null, restTrunc: rest ? getComputedStyle(rest).textOverflow : null, boldLeft: b ? Math.round(b.getBoundingClientRect().left) : null, restRight: rest ? Math.round(rest.getBoundingClientRect().right) : null, restH: rest ? Math.round(rest.getBoundingClientRect().height) : null, boldH: b ? Math.round(b.getBoundingClientRect().height) : null, border: getComputedStyle(e).borderBottomColor } }, sel)
// the first thing of the page: topmost visible leaf text/control box not inside the excluded selector
export const firstTop = (page, excl = '.topbar, .saveband, .savestat, #drawer, #scrim') => page.evaluate(excl => { let best = null; for (const e of document.querySelectorAll('body *')) { if (e.closest(excl)) continue; if (e.children.length && !(e.matches('button,input,select,a,svg'))) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue; if (e.checkVisibility && !e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue; if (e.matches('script,style')) continue; if (r.bottom < 0 || r.top > innerHeight) continue; if (!best || r.top < best.t) best = { t: Math.round(r.top * 10) / 10, tag: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''), text: (e.innerText || '').trim().slice(0, 24) } } return best }, excl)
// what is under points along the band: should be the band / the bar, nothing of the page
export const under = (page, pts) => page.evaluate(pts => pts.map(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('.savestat,.saveband') ? 'band' : e.closest('.topbar') ? 'bar' : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '')) : null }), pts)
// tap and take a picture at once (finger "left where it pressed" in the sense that no other pointer is moved), then the settled one
export async function tapShot(page, target, name, settle = 700) {
  const box = typeof target === 'string' ? await page.locator(target).first().boundingBox() : target
  if (!box) return null
  const x = box.x + box.width / 2, y = box.y + box.height / 2
  const t0 = Date.now(); await page.touchscreen.tap(x, y)
  const f1 = await pic(page, name + '-now'); const dt = Date.now() - t0
  await sleep(settle); const f2 = await pic(page, name + '-settled')
  return { quick: f1, settled: f2, ms: dt }
}
export const pic = async (page, name, o = {}) => { const f = name + '.png'; await page.screenshot({ path: resolve(OUT, f), ...o }); return 'w2/' + f }
export async function world({ locked = true, url = '/', wide = false, fail = false, clock = true, dsf = 2 } = {}) {
  const b = await L.browserFor('webkit', true, false)
  const ctx = await b.newContext({ viewport: L.PHONE, deviceScaleFactor: dsf, hasTouch: true, isMobile: true })
  await serveFrozen(ctx, L.BASE)
  await ctx.addInitScript('try { delete window.showSaveFilePicker; delete window.showOpenFilePicker } catch (e) {}')
  if (locked) await ctx.addInitScript(LOCK_INIT)
  if (wide) await ctx.addInitScript("(() => { const add = () => { const s = document.createElement('style'); s.textContent = '*, *::before, *::after { font-family: Verdana, \"DejaVu Sans\", sans-serif !important }'; document.head.appendChild(s) }; if (document.head) add(); else document.addEventListener('DOMContentLoaded', add) })()")
  if (fail) await ctx.addInitScript(`(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (window.__failSaves === true && String(k).startsWith('raptor:')) throw new DOMException('walk: forced', 'QuotaExceededError'); return o.call(this, k, v) } })()`)
  if (clock) await ctx.clock.install({ time: new Date('2026-11-08T09:00:00+08:00') })
  const page = await ctx.newPage(); page.setDefaultTimeout(12000)
  const errors = []
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(L.BASE + url)
  return { ctx, page, errors }
}
export const closeAll = L.closeAll
// reach a page by the phone's side menu (a tap on the burger, then on the page's name)
export async function nav(p, id) {
  await p.tap('#burger'); await sleep(450)
  await p.tap(`#drawer a[data-page="${id}"]`)
  if (id === 'tracker') await p.waitForSelector('#flowSvg .ball', { timeout: 30000 })
  await sleep(900)
}
