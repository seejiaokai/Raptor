// Round 20 (22 Oct 26), his "what is frozen at the top when the app is scrolled down?" — round 19's top drawn into the
// real build, then the page scrolled down the way a finger would (the page's own scroller, or the grid's if it has one),
// and every band measured before and after: what stays put is frozen.
//   r20-frozen-admin-phone / -member-phone / -admin-desk   after scrolling down
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r20-frozen.mjs
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

const PARTS = {
  'app top bar': '.topbar', tabs: '[data-zz="nav"]', 'View + My leave': '#page-leavewar .topbar', 'grid bar (Manning…Legend)': '.zz-bar',
  'Manning rows': '[data-testid="fly-row-req-p"]', 'month buttons': '.mstripe', 'date headings': '[data-testid="head-2026-01-02"]',
  'event rows': '[data-testid="event-0-2026-01-02"]', 'first group heading': '[data-testid^="row-"]',
}
const measure = p => p.evaluate(P => Object.fromEntries(Object.entries(P).map(([k, s]) => { const e = document.querySelector(s); const r = e && e.getBoundingClientRect(); return [k, r && r.height ? Math.round(r.top) : null] })), PARTS)
for (const [w, h, touch, who, name] of [[390, 844, true, 'admin', 'admin-phone'], [390, 844, true, 'member', 'member-phone'], [1536, 860, false, 'admin', 'admin-desk']]) {
  const { ctx, p } = await N.page(w, h, touch, who)
  await N.draw(p, touch, who === 'member')
  await p.waitForTimeout(300)
  const before = await measure(p)
  // scroll down as a finger or wheel would, over the middle of the grid
  const g = await p.locator('.mx-wrap').boundingBox()
  await p.mouse.move(g.x + g.width / 2, Math.min(g.y + g.height - 40, h - 120))
  for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 150); await p.waitForTimeout(120) }
  await p.waitForTimeout(500)
  const after = await measure(p)
  const who2 = await p.evaluate(() => ({ page: Math.round(scrollY), grid: Math.round(document.querySelector('.mx-wrap').scrollTop) }))
  console.log(name, 'scrolled', JSON.stringify(who2))
  for (const k of Object.keys(PARTS)) console.log('  ', k.padEnd(28), String(before[k]).padStart(5), '→', String(after[k]).padStart(5), before[k] != null && after[k] != null && Math.abs(before[k] - after[k]) < 2 ? 'STAYS' : '')
  await p.mouse.move(2, 2)
  await shot(p, 'r20-frozen-' + name)
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
