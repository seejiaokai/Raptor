// Q4 follow-up (his question: "what if there are more counters at the top how would it look like"):
// the squadron given the eleven counters the tests use (the app ships with none — D669), a REAL bid placed to measure
// exactly which counters it moves, then the bid window drawn two ways from those measured numbers.
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const require = createRequire('C:/Users/User/projects/Raptor/.claude/worktrees/goofy-kirch-a073df/raptor-port/package.json')
const { chromium } = require('@playwright/test')
const SP = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-goofy-kirch-a073df/aaaf306c-c342-441c-ae8c-1b2661c4ca86/scratchpad'
const OUT = join(SP, 'mock'); mkdirSync(OUT, { recursive: true })
// the eleven counters, read from the test file as plain data (it has one type import and a few type words)
const src = readFileSync('C:/Users/User/projects/Raptor/.claude/worktrees/goofy-kirch-a073df/raptor-port/src/leavewar/testing/eleven.ts', 'utf8')
  .replace(/^import type .*$/m, '').replace(/ as const/g, '').replace(/: readonly ManningRule\[\]/, '').replace(/\((\w+): string\)/g, '($1)')
writeFileSync(join(SP, 'eleven.mjs'), src); const { ELEVEN_COUNTERS } = await import('file:///' + join(SP, 'eleven.mjs').replace(/\\/g, '/'))
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
const counts = p => p.evaluate(([day, ids]) => ids.map(id => {
  const c = document.querySelector(`[data-testid="count-${id}-${day}"]`)
  return [id, c ? c.textContent.trim() : null, c ? c.className : '']
}), [DAY, ELEVEN_COUNTERS.map(r => r.id)])
async function mark(p, sel, label) {
  await p.evaluate(([sel, label, PINK]) => {
    const r = document.querySelector(sel).getBoundingClientRect(), box = document.createElement('div')
    Object.assign(box.style, { position: 'absolute', left: (r.left + scrollX - 3) + 'px', top: (r.top + scrollY - 3) + 'px', width: (r.width + 6) + 'px', height: (r.height + 6) + 'px', border: `3px solid ${PINK}`, borderRadius: '10px', zIndex: 2147483646, pointerEvents: 'none', boxSizing: 'border-box' })
    const tag = document.createElement('div'); tag.textContent = label
    Object.assign(tag.style, { position: 'absolute', left: '-3px', top: '-24px', background: PINK, color: '#fff', font: '700 13px/1 system-ui,sans-serif', padding: '5px 8px', borderRadius: '6px', whiteSpace: 'nowrap' })
    box.appendChild(tag); document.body.appendChild(box)
  }, [sel, label, PINK])
}

// 1. the admin makes the eleven counters (the same writer "+ Counter" saves with), on top of round 1's staged state
let { ctx, p } = await page(1536, 730, false, state, 1)
await signIn(p, 'admin')
const refused = await p.evaluate(rules => rules.filter(r => !window.lwSaveManningRule(r)).map(r => r.id), JSON.parse(JSON.stringify(ELEVEN_COUNTERS)))
console.log('counters refused:', refused)
await p.waitForSelector(q('count-scn'))
await p.click('button:has-text("Logout")'); await p.waitForSelector('#luser')
const st2 = await ctx.storageState({ indexedDB: true }); await ctx.close()

// 2. measure: Ranger's counters on Wed 28 Jan before and after a real LL bid (the bid is in a throwaway context)
;({ ctx, p } = await page(390, 844, true, st2, 3))
await signIn(p, 'member')
await p.evaluate(d => document.querySelector(`[data-testid="cell-bane-${d}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), DAY); await p.waitForTimeout(600)
const before = await counts(p)
await p.tap(q(`cell-bane-${DAY}`)); await p.waitForTimeout(500); await p.tap(q('bid-LL')); await p.waitForTimeout(700)
const after = await counts(p)
await ctx.close()
const names = Object.fromEntries(ELEVEN_COUNTERS.map(r => [r.id, r.label]))
const thr = Object.fromEntries(ELEVEN_COUNTERS.map(r => [r.id, r.threshold]))
const rows = before.map(([id, b, cb], i) => ({ id, name: names[id], b, a: after[i][1], ca: after[i][2] }))
console.log(JSON.stringify(rows))
const moved = rows.filter(r => r.b !== r.a)
const colour = (r, v) => { const n = parseFloat(v); const t = thr[r.id]; if (isNaN(n) || !t) return ''; return n < t.red ? 'red' : n < t.amber ? 'amber' : '' }

// 3. draw, on the state BEFORE the bid: the window with every counter (A as asked) and with only the ones it moves (A2)
for (const variant of ['warn']) {
  ;({ ctx, p } = await page(390, 844, true, st2, 3))
  await signIn(p, 'member')
  await p.evaluate(d => document.querySelector(`[data-testid="cell-bane-${d}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), DAY); await p.waitForTimeout(600)
  await p.tap(q(`cell-bane-${DAY}`)); await p.waitForTimeout(600)
  const list = (variant === 'all' ? rows : variant === 'moved' ? moved : moved.filter(r => colour(r, r.a))).map(r => ({ n: r.name, b: r.b, a: r.a, ch: r.b !== r.a, col: colour(r, r.a) }))
  await p.evaluate(([list, variant]) => {
    const sh = document.querySelector('[data-testid="bid-picker"]'); if (!sh) return
    const COL = { red: '#ff6b6b', amber: '#f5b942', '': '#c9d1d9' }
    const line = document.createElement('div'); line.className = 'zz-eff'
    Object.assign(line.style, { margin: '10px 0 2px', padding: '9px 10px', borderRadius: '8px', background: 'rgba(255,255,255,.04)', color: '#c9d1d9', font: '500 13.5px/1.5 system-ui' })
    const item = r => `<span style="white-space:nowrap;color:${COL[r.col]}">${r.n} ${r.ch ? `${r.b} → <b>${r.a}</b>` : r.b}</span>`
    line.innerHTML = `<b style="color:#e6edf3">Wed 28 Jan</b>${variant === 'all' ? ' · if you bid:' : variant === 'moved' ? ' · your bid moves:' : ' ·'} ` +
      (list.length ? list.map(item).join(' · ') : (variant === 'warn' ? 'Avail P 28 → 27 · <span style="color:#58c48a">no manning row turns amber or red</span>' : 'no manning row'))
    const head = [...sh.querySelectorAll('*')].find(e => !e.children.length && /HOW MANY/i.test(e.textContent))
    const row = head ? head.closest('div:not([role=dialog])') : null
    if (row && row.parentElement) row.parentElement.insertBefore(line, row); else sh.appendChild(line)
    const bal = { LL: 15, OL: 15, OIL: 0, CCL: 0, FCL: 0, PL: 0, CL: 0 }
    for (const [t, v] of Object.entries(bal)) { const c = sh.querySelector(`[data-testid="bid-${t}"]`); if (c) c.insertAdjacentHTML('beforeend', `<small style="margin-left:6px;opacity:.75;font-weight:600">${v}</small>`) }
  }, [list, variant])
  await mark(p, '.zz-eff', variant === 'all' ? 'A · every manning row, as you asked' : variant === 'moved' ? 'A2 · only the rows your bid moves' : 'A3 · only a row your bid turns amber or red')
  // the top of the screen shows the Manning block, so the picture carries the real rows beside the line
  await p.screenshot({ path: join(OUT, `r1q4-more-${variant}.png`) })
  await ctx.close()
}
console.log('moved:', JSON.stringify(moved.map(r => `${r.name} ${r.b}->${r.a}`)), 'errors:', errs.length, errs.slice(0, 2))
await browser.close()
