// D1144 (A3, stacked): the bid window's day line with several manning rows turned amber or red, each on its own line,
// flush left, names in one column and figures in a second. The figures are the ones MEASURED from Ranger's real bid on
// Wed 28 Jan with the eleven counters (q4more.mjs); none of them turns amber or red with the counters' own thresholds,
// so for this picture three are shown as if their thresholds were higher — said so on his page.
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const require = createRequire('C:/Users/User/projects/Raptor/.claude/worktrees/goofy-kirch-a073df/raptor-port/package.json')
const { chromium } = require('@playwright/test')
const SP = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-goofy-kirch-a073df/aaaf306c-c342-441c-ae8c-1b2661c4ca86/scratchpad'
const OUT = join(SP, 'mock')
const { ELEVEN_COUNTERS } = await import('file:///' + join(SP, 'eleven.mjs').replace(/\\/g, '/'))
const URL = 'http://localhost:4197/', CLOCK = new Date('2026-01-08T09:00:00+08:00'), DAY = '2026-01-28', PINK = '#ff2d95'
const q = t => `[data-testid="${t}"]`
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const browser = await chromium.launch(); const errs = []
async function page(w, h, touch, st, dpr) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: touch, isMobile: touch, timezoneId: 'Asia/Singapore', ...(st ? { storageState: st } : {}) })
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e))); await p.clock.setFixedTime(CLOCK); return { ctx, p }
}
async function signIn(p, who) {
  await p.goto(URL); await p.fill('#luser', who === 'admin' ? 'ad' : 'us'); await p.fill('#lpass', who === 'admin' ? 'a' : 'us')
  await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day')
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector(q('row-slipway')); await p.waitForTimeout(1200)
}
async function mark(p, sel, label) {
  await p.evaluate(([sel, label, PINK]) => {
    const r = document.querySelector(sel).getBoundingClientRect(), box = document.createElement('div')
    Object.assign(box.style, { position: 'absolute', left: (r.left + scrollX - 3) + 'px', top: (r.top + scrollY - 3) + 'px', width: (r.width + 6) + 'px', height: (r.height + 6) + 'px', border: `3px solid ${PINK}`, borderRadius: '10px', zIndex: 2147483646, pointerEvents: 'none', boxSizing: 'border-box' })
    const tag = document.createElement('div'); tag.textContent = label
    Object.assign(tag.style, { position: 'absolute', left: '-3px', top: '-24px', background: PINK, color: '#fff', font: '700 13px/1 system-ui,sans-serif', padding: '5px 8px', borderRadius: '6px', whiteSpace: 'nowrap' })
    box.appendChild(tag); document.body.appendChild(box)
  }, [sel, label, PINK])
}
let { ctx, p } = await page(1536, 730, false, state, 1)
await signIn(p, 'admin')
await p.evaluate(rules => rules.forEach(r => window.lwSaveManningRule(r)), JSON.parse(JSON.stringify(ELEVEN_COUNTERS)))
await p.waitForSelector(q('count-scn'))
await p.click('button:has-text("Logout")'); await p.waitForSelector('#luser')
const st2 = await ctx.storageState({ indexedDB: true }); await ctx.close()

const cases = {
  stacked: [['IP', '16', '15', 'amber'], ['FL P', '19', '18', 'amber'], ['SXO', '12', '11', 'red']],
  one: [['SXO', '12', '11', 'red']],
}
for (const [name, rows] of Object.entries(cases)) {
  ;({ ctx, p } = await page(390, 844, true, st2, 3))
  await signIn(p, 'member')
  await p.evaluate(d => document.querySelector(`[data-testid="cell-bane-${d}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), DAY); await p.waitForTimeout(600)
  await p.tap(q(`cell-bane-${DAY}`)); await p.waitForTimeout(600)
  await p.evaluate(([rows]) => {
    const sh = document.querySelector('[data-testid="bid-picker"]'); if (!sh) return
    const COL = { red: '#ff6b6b', amber: '#f5b942' }
    const box = document.createElement('div'); box.className = 'zz-eff'
    Object.assign(box.style, { margin: '10px 0 2px', padding: '9px 10px', borderRadius: '8px', background: 'rgba(255,255,255,.04)', color: '#c9d1d9', font: '500 14px/1.5 system-ui' })
    // the day line, then one line a row the bid turns amber or red: the names one column, the figures a second
    box.innerHTML = `<div><b style="color:#e6edf3">Wed 28 Jan</b> · Avail P 28 → 27</div>
      <div style="display:grid;grid-template-columns:max-content max-content;column-gap:14px;row-gap:2px;margin-top:4px;font-variant-numeric:tabular-nums">
      ${rows.map(([n, b, a, c]) => `<span style="color:${COL[c]};font-weight:600">${n}</span><span style="color:${COL[c]}">${b} → <b>${a}</b> · ${c}</span>`).join('')}</div>`
    const head = [...sh.querySelectorAll('*')].find(e => !e.children.length && /HOW MANY/i.test(e.textContent))
    const row = head ? head.closest('div:not([role=dialog])') : null
    if (row && row.parentElement) row.parentElement.insertBefore(box, row); else sh.appendChild(box)
    const bal = { LL: 15, OL: 15, OIL: 0, CCL: 0, FCL: 0, PL: 0, CL: 0 }
    for (const [t, v] of Object.entries(bal)) { const c = sh.querySelector(`[data-testid="bid-${t}"]`); if (c) c.insertAdjacentHTML('beforeend', `<small style="margin-left:6px;opacity:.75;font-weight:600">${v}</small>`) }
  }, [rows])
  await mark(p, '.zz-eff', name === 'stacked' ? 'A3 · three rows turned: one a line, flush left' : 'A3 · one row turned')
  await p.screenshot({ path: join(OUT, `r1q4-a3-${name}.png`) })
  await ctx.close()
}
console.log('errors:', errs.length, errs.slice(0, 2))
await browser.close()
