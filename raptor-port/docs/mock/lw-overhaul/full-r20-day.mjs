// Round 20f (22 Oct 26), his "How would the unfold look like if the date with number of events are pressed" — G3/G3b:
// a tap on a date (Tue 06, three events) opens that day from the foot (the day panel, D1143), its events listed first
// by their full names, then the day's figures and who is away. Round 20e's grid (full-r20-real.mjs, read between markers).
// Event names, figures and people are made up for the drawing.
//   r20-day-phone   Tue 06 tapped: its heading ringed, the day panel open
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r20-day.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, UNDER } from './full-r7-one.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state }, ['stage'])
const N = load(cut(SRC('full-r19-nav.mjs'), 'const IC = {', 'const res = {}'), { newPage, signIn, DC, state, browser }, ['page', 'draw'])
const RL = load(cut(SRC('full-r20-real.mjs'), 'const CSS = `', 'const firstPerson'), {}, ['load_', 'reorder'])

const PANEL = `
<div class="zz-dp" data-zz="day">
  <div class="g"></div>
  <div class="hd"><span class="ar">‹</span><b>Tue 6 Jan</b><span class="ar">›</span><span class="sp"></span><span class="x">✕</span></div>
  <div class="sec">EVENTS · 3</div>
  <div class="ev"><span class="t">OPS</span><span class="n">Operations planning day</span><span class="k">all day</span></div>
  <div class="ev"><span class="t">FAM</span><span class="n">Familiarisation week</span><span class="k">5–7 Jan</span></div>
  <div class="ev"><span class="t">SIM</span><span class="n">Simulator refresher</span><span class="k">PM</span></div>
  <div class="sec">MANNING</div>
  <div class="fg"><span>Available P</span><b>29</b><span>Available W</span><b>17</b><span>Required P</span><b>24</b></div>
  <div class="sec">AWAY · 2</div>
  <div class="aw"><span class="pk">Static</span><span class="lv">OML</span><span class="st">Approved</span></div>
  <div class="aw"><span class="pk">Cinder</span><span class="lv">LL</span><span class="st wt">Pending</span></div>
</div>`
const PCSS = `
.zz-dp{position:fixed;left:0;right:0;bottom:0;z-index:90;background:#161b22;border-top:1px solid #2f3a46;border-radius:16px 16px 0 0;box-shadow:0 -12px 30px rgba(0,0,0,.55);padding:6px 16px 18px;font:14px system-ui;color:#e6edf3}
.zz-dp .g{width:40px;height:4px;border-radius:2px;background:#3a4652;margin:2px auto 8px}
.zz-dp .hd{display:flex;align-items:center;gap:12px;height:36px}
.zz-dp .hd b{font:800 16px system-ui;min-width:96px;text-align:center}
.zz-dp .hd .ar{color:#5fd0e6;font:700 20px system-ui}.zz-dp .hd .sp{flex:1}.zz-dp .hd .x{color:#9aa5b1;font-size:16px}
.zz-dp .sec{margin:10px 0 4px;font:700 11px system-ui;letter-spacing:.12em;color:#8a96a3}
.zz-dp .ev{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:10px;height:34px;border-bottom:1px solid #222a33}
.zz-dp .ev .t{justify-self:start;padding:1px 6px;border-radius:4px;background:rgba(160,170,182,.16);color:#d6dde4;font:700 11px system-ui}
.zz-dp .ev .n{font-weight:600}.zz-dp .ev .k{color:#9aa5b1;font-size:12.5px}
.zz-dp .fg{display:grid;grid-template-columns:1fr auto;column-gap:16px;row-gap:6px;max-width:220px;font-size:13.5px;color:#c9d1d9}
.zz-dp .fg b{font-variant-numeric:tabular-nums;color:#fff;text-align:right}
.zz-dp .aw{display:grid;grid-template-columns:90px 44px 1fr;align-items:center;gap:10px;height:32px}
.zz-dp .aw .pk{padding:2px 8px;border-radius:6px;background:#3c3a1c;color:#f3efc7;font-weight:700;font-size:13px;justify-self:start}
.zz-dp .aw .lv{padding:1px 6px;border-radius:4px;background:rgba(236,104,140,.26);color:#FFD0DD;font:700 11px system-ui;justify-self:start}
.zz-dp .aw:last-child .lv{background:transparent;outline:1px dashed rgba(242,200,110,.95);color:#F2C879}
.zz-dp .aw .st{color:#9aa5b1;font-size:12.5px}
`
const { ctx, p } = await N.page(390, 844, true, 'admin')
await N.draw(p, true, false)
{ const m = p.locator('[data-testid="counts-toggle"]'); if ((await m.getAttribute('aria-expanded')) !== 'false') { await m.click({ force: true }); await p.waitForTimeout(500) } }
await RL.load_(p); await RL.reorder(p, 'shut')
await p.evaluate(([html, css]) => {
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
  document.body.insertAdjacentHTML('beforeend', html)
  const h = document.querySelector('[data-testid="head-2026-01-06"]'); if (h) h.style.boxShadow = 'inset 0 0 0 2px #3bc6e8'
}, [PANEL, PCSS])
await mk(p, '[data-testid="head-2026-01-06"]', '1', { prefer: ['n', 'ne'] })
await mk(p, '.zz-dp .sec', '2', { prefer: ['e'], ring: false })
await p.mouse.move(2, 2)
await shot(p, 'r20-day-phone')
await ctx.close(); await browser.close(); console.log('errors:', errs)
