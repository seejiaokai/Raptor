// Chat 28's route check for the "Not kept" band (D1901): the host drives the route every walker starts from, before any
// walker is sent (walk-scripts.md §1, §2). A frozen build is answered inside the browser (WALK_DIR, isr-serve.mjs), so no
// port is held. Four worlds: storage refused (chat 20's LOCK_INIT) on his PC and on his iPhone; the ?nostore switch;
// a plain browser (no band). Pictures and results: docs/img/handpass/2026-11-08-chat28-not-kept/route/.
//   WALK_DIR=<dist> node scripts/handpass/nk28-route.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('nk28-route v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-08-chat28-not-kept/route')
mkdirSync(OUT, { recursive: true })
process.env.HP_URL ||= 'http://localhost:4428'
process.env.C9_RESULTS ||= resolve(OUT, 'unused-results.json')
const L = await import('./trk-chat9-lib.mjs')
const { serveFrozen, WALK_DIR } = await import('./isr-serve.mjs')
if (!WALK_DIR) { console.error('set WALK_DIR to the frozen build folder'); process.exit(2) }

const LOCK_INIT = `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('denied', 'SecurityError') } })`
const R = []
const ok = (step, cond, said) => { R.push({ step, res: cond ? 'PASS' : 'FAIL', said }); console.log((cond ? 'PASS ' : 'FAIL ') + step + ' — ' + said) }
const vis = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), text: e.innerText.replace(/\s+/g, ' ').trim(), btn: !!e.querySelector('button') } }, sel)
const shot = (page, name) => page.screenshot({ path: resolve(OUT, name + '.png') })

async function world({ engine = 'chromium', size = L.PC, touch = false, locked = false, url = '/' }) {
  const b = await L.browserFor(engine, true, false)
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: 2, ...(touch ? { hasTouch: true, isMobile: true } : {}) })
  await serveFrozen(ctx, L.BASE)
  if (locked) await ctx.addInitScript(LOCK_INIT)
  await ctx.clock.install({ time: new Date('2026-11-08T09:00:00+08:00') })
  const page = await ctx.newPage(); page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.goto(L.BASE + url)
  return { ctx, page, errors }
}

async function walkOne(tag, opts, expectBand) {
  const w = await world(opts); const p = w.page
  try {
    await p.waitForSelector('#luser', { timeout: 20000 }); await L.sleep(600)
    const sign = await vis(p, '.saveband.is-screen')
    await shot(p, tag + '-1-signin')
    ok(tag + ' sign-in', expectBand ? !!sign && /Not kept/.test(sign.text) && !sign.btn : !sign, JSON.stringify(sign))
    await L.login(p, 'a'); await p.evaluate(() => window.go('editsched')); await L.sleep(1200)
    const band = await vis(p, '.topbar > .savestat.nokeep'), bar = await vis(p, '.topbar')
    await shot(p, tag + '-2-editsched')
    ok(tag + ' Edit Schedule band', expectBand ? !!band && band.text === 'Not kept — this browser loses your work on a reload' && !band.btn && Math.abs(band.b - bar.b) <= 2 : !band, JSON.stringify({ band, barB: bar && bar.b }))
    const saving = await vis(p, '.topbar > .savestat:not(.nokeep):not(.failed)')
    ok(tag + ' no "Saving…" beside it', !saving || !expectBand, JSON.stringify(saving))
    await L.navTracker(p)
    const corner = await p.evaluate(() => { const s = document.getElementById('saveStat'); return s ? { hidden: s.hidden || getComputedStyle(s).display === 'none', text: s.textContent.trim() } : null })
    await shot(p, tag + '-3-tracker')
    ok(tag + ' Tracker corner', expectBand ? !corner || corner.hidden || corner.text === '' : !!corner && /saved/.test(corner.text), JSON.stringify(corner))
    ok(tag + ' Tracker band', expectBand ? !!(await vis(p, '.topbar > .savestat.nokeep')) : !(await vis(p, '.topbar > .savestat.nokeep')), '')
  } catch (e) { ok(tag + ' route', false, 'stopped: ' + String(e.message).split('\n')[0]) }
  if (w.errors.length) console.log(' errors ' + tag + ': ' + w.errors.join(' | '))
  R.push({ step: tag + ' errors', res: w.errors.length ? 'RECORD' : 'PASS', said: w.errors.join(' | ') })
  await w.ctx.close()
}

await walkOne('pc-locked', { locked: true }, true)
await walkOne('phone-locked', { engine: 'webkit', size: L.PHONE, touch: true, locked: true }, true)
await walkOne('pc-nostore', { url: '/?nostore' }, true)
await walkOne('pc-plain', {}, false)
await walkOne('pc-fresh', { url: '/?fresh=1' }, false)
await L.closeAll()
writeFileSync(resolve(OUT, 'results.json'), JSON.stringify(R, null, 1))
const fails = R.filter(r => r.res === 'FAIL').length
console.log(`done: ${R.filter(r => r.res === 'PASS').length} pass, ${fails} fail`)
process.exit(fails ? 1 : 0)
