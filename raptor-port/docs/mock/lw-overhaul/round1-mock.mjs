// Round 1 mock-ups for the Leave War overhaul (D1140), drawn into the REAL local build.
// Staging uses the app's own controls (Set a balance, drag-select + Approve / Refuse, the bid sheet), with the clock held at
// Thu 8 Jan 26 so "next leave" reads sensibly. New parts are drawn in with the app's own classes and marked NEW.
//   npm run build && npx vite preview --port 4197 --strictPort ; node mock.mjs
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const require = createRequire('C:/Users/User/projects/Raptor/.claude/worktrees/goofy-kirch-a073df/raptor-port/package.json')
const { chromium } = require('@playwright/test')
const SP = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-goofy-kirch-a073df/aaaf306c-c342-441c-ae8c-1b2661c4ca86/scratchpad'
const OUT = join(SP, 'mock'); mkdirSync(OUT, { recursive: true })
const URL = 'http://localhost:4197/'
const CURL = 'file:///' + join(SP, 'colleague/index.html').replace(/\\/g, '/')
const CLOCK = new Date('2026-01-08T09:00:00+08:00')
const q = t => `[data-testid="${t}"]`
const browser = await chromium.launch()
const errs = []
const PINK = '#ff2d95'

async function newPage(w, h, touch, state, dpr = 2) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: touch, isMobile: touch, timezoneId: 'Asia/Singapore', ...(state ? { storageState: state } : {}) })
  const p = await ctx.newPage()
  p.on('pageerror', e => errs.push(String(e)))
  await p.clock.setFixedTime(CLOCK)
  return { ctx, p }
}
async function signIn(p, who) {
  await p.goto(URL)
  await p.fill('#luser', who === 'admin' ? 'ad' : 'us'); await p.fill('#lpass', who === 'admin' ? 'a' : 'us')
  await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day')
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector(q('row-slipway')); await p.waitForTimeout(1200)
}
const esc = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(350) }
async function dragCells(p, a, b) {
  const A = await p.locator(q(a)).boundingBox(), B = await p.locator(q(b)).boundingBox()
  await p.mouse.move(A.x + 6, A.y + 6); await p.mouse.down(); await p.mouse.move(B.x + 6, B.y + 6, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(500)
}
// a marked box round an element (or a rect), with a numbered tag — absolute, so it survives full-page pictures
async function mark(p, sel, label, pad = 4) {
  await p.evaluate(([sel, label, pad, PINK]) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : null
    const r = el ? el.getBoundingClientRect() : { left: sel.x, top: sel.y, width: sel.w, height: sel.h }
    const box = document.createElement('div'); box.className = 'zz-mark'
    Object.assign(box.style, { position: 'absolute', left: (r.left + scrollX - pad) + 'px', top: (r.top + scrollY - pad) + 'px', width: (r.width + 2 * pad) + 'px', height: (r.height + 2 * pad) + 'px', border: `3px solid ${PINK}`, borderRadius: '10px', zIndex: 2147483646, pointerEvents: 'none', boxSizing: 'border-box' })
    const tag = document.createElement('div'); tag.textContent = label
    Object.assign(tag.style, { position: 'absolute', left: '-3px', top: '-24px', background: PINK, color: '#fff', font: '700 13px/1 system-ui,sans-serif', padding: '5px 8px', borderRadius: '6px', whiteSpace: 'nowrap' })
    box.appendChild(tag); document.body.appendChild(box)
  }, [sel, label, pad, PINK])
}
const unmark = p => p.evaluate(() => document.querySelectorAll('.zz-mark').forEach(n => n.remove()))
const fig = (p, person, f) => p.evaluate(([person, f]) => {
  const row = document.querySelector(`[data-testid="row-${person}"]`); if (!row) return null
  const c = row.querySelector(`td.figbox[data-fig="${f}"]`) || row.querySelector('td.figbox'); return c ? c.innerText.trim().split(/\s+/)[0] : null
}, [person, f])

// ---------- 1. stage the member's state through the app's own controls (desktop, admin then member) ----------
let { ctx, p } = await newPage(1536, 730, false)
await signIn(p, 'admin')
await p.click(q('person-bane')); await p.waitForTimeout(400)
await p.click(q('lve-edit')); await p.fill(q('lve-input'), '20'); await p.click(q('lve-save')); await p.waitForTimeout(300); await esc(p)
for (const d of ['2026-01-19', '2026-01-20', '2026-01-21', '2026-02-02']) await p.evaluate(([d]) => window.lwSetCell('bane', d, 'LL'), [d])
await p.waitForTimeout(400)
await dragCells(p, 'cell-bane-2026-01-19', 'cell-bane-2026-01-21'); await p.click(q('sel-approve')); await p.waitForTimeout(400); await esc(p)
await dragCells(p, 'cell-bane-2026-02-02', 'cell-bane-2026-02-03'); await p.click(q('sel-refuse')); await p.waitForTimeout(400); await esc(p)
// a few other people's bids on 27 Jan, so a day has company
for (const [who, d] of [['slipway', '2026-01-27'], ['glass', '2026-01-27'], ['dice', '2026-01-27']]) await p.evaluate(([w, d]) => window.lwSetCell(w, d, 'LL'), [who, d])
await p.click('button:has-text("Logout")'); await p.waitForSelector('#luser')
await signIn(p, 'member')
for (const d of ['2026-01-26', '2026-01-27']) { await p.click(q(`cell-bane-${d}`)); await p.waitForTimeout(400); await p.click(q('bid-LL')); await p.waitForTimeout(400); await esc(p) }
const LVE = await fig(p, 'bane', 'lve')
console.log('Ranger LVE after staging:', LVE)
await p.screenshot({ path: join(OUT, 'stage-check-desk.png') })
const state = await ctx.storageState({ indexedDB: true })
writeFileSync(join(OUT, 'state.json'), JSON.stringify(state))

// ---------- 2. ours, desktop member: today, and the "My leave" line drawn in ----------
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300)
await p.screenshot({ path: join(OUT, 'r1q1-ours-desk-today.png') })
// ONE line, one button: the bidding-dates chip's own look (its classes), so nothing new is styled by eye
const STRIP = (lve, phone) => `<div class="zz-new zz-strip" style="display:flex;align-items:center;padding:${phone ? '8px 12px' : '8px 20px'};border-bottom:1px solid #26303a">
  <button class="zz-c" style="width:100%;display:flex;align-items:center;gap:10px;justify-content:flex-start">
   <span style="font:600 11px/1 system-ui;letter-spacing:.12em;opacity:.7">MY LEAVE</span>
   <span><b>LVE ${lve}</b> · OIL 0 · 2 waiting · next LL ${phone ? '19 Jan' : 'Mon 19 Jan'}</span>
   <span style="margin-left:auto;opacity:.8">›</span></button></div>`
async function addStrip(p, lve, phone = false) {
  await p.evaluate(([html]) => {
    const pg = document.querySelector('#page-leavewar'), after = pg.querySelector(':scope > .filters') || pg.querySelector('.filters')
    const ref = document.querySelector('[data-testid="bid-window"]')
    const tmp = document.createElement('div'); tmp.innerHTML = html; const strip = tmp.firstElementChild
    strip.querySelectorAll('.zz-c').forEach(c => { if (ref) { c.className = ref.className + ' zz-c'; c.removeAttribute('data-testid') } })
    after.after(strip)
  }, [STRIP(lve, phone)])
  await p.waitForTimeout(200)
}
await p.evaluate(([lve]) => {
  const ref = document.querySelector('[data-testid="bid-window"]'), row = ref.closest('.filters') || ref.parentElement
  const c = document.createElement('button'); c.className = ref.className + ' zz-desk'; c.style.marginLeft = 'auto'
  c.innerHTML = `<span style="opacity:.7;letter-spacing:.1em;font-size:11px">MY LEAVE</span>&nbsp; <b>LVE ${lve}</b> · OIL 0 · 2 waiting · next LL Mon 19 Jan ›`
  row.appendChild(c)
}, [LVE])
await mark(p, '.zz-desk', '1 · NEW: in the stage row, no new line', 2)
await p.screenshot({ path: join(OUT, 'r1q1-ours-desk-mock.png') })
await ctx.close()

// ---------- 3. ours, phone member (his iPhone's size, 3x) ----------
;({ ctx, p } = await newPage(390, 844, true, state, 3))
await signIn(p, 'member')
await p.screenshot({ path: join(OUT, 'r1q1-ours-phone-today.png') })
await addStrip(p, LVE, true)
await mark(p, '.zz-strip', '1 · NEW: my leave, one line', 2)
await p.screenshot({ path: join(OUT, 'r1q1-ours-phone-mock.png') })
await unmark(p)
// 1 option B: no new line — the "Viewing as" chip carries his numbers when it is himself
await p.evaluate(() => document.querySelector('.zz-strip')?.remove())
await p.evaluate(([lve]) => {
  const v = document.querySelector('[data-testid="lw-viewing"]'); if (!v) return
  v.dataset.zzOld = v.innerHTML
  v.innerHTML = `<b>Ranger</b>&nbsp;· LVE ${lve} · 2 waiting&nbsp;›`
}, [LVE])
await mark(p, '[data-testid="lw-viewing"]', '1 · option B', 2)
await p.screenshot({ path: join(OUT, 'r1q1-ours-phone-mockB.png') })
await unmark(p)
await p.evaluate(() => { const v = document.querySelector('[data-testid="lw-viewing"]'); if (v && v.dataset.zzOld) v.innerHTML = v.dataset.zzOld })
await addStrip(p, LVE, true)
// 1b: tapping the line opens "My leave": the person sheet's own window and row look, its rows re-lettered as his leave
await p.tap(q('person-bane')); await p.waitForTimeout(500)
await p.evaluate(([lve]) => {
  const sh = document.querySelector('[role=dialog]'); if (!sh) return
  const walker = document.createTreeWalker(sh, NodeFilter.SHOW_TEXT); let n
  while ((n = walker.nextNode())) { if (/every figure/i.test(n.textContent)) n.textContent = 'my leave · tap one to go to it' }
  const rows = [...sh.querySelectorAll('button')].filter(b => /set by admin|tap to open|All leave|Medical days|Balance of|opening/.test(b.textContent))
  if (!rows.length) return
  const tpl = rows[0], leafs = [...tpl.querySelectorAll('*')].filter(e => !e.children.length && e.textContent.trim())
  const cs = el => { const s = getComputedStyle(el); return `font:${s.fontWeight} ${s.fontSize}/${s.lineHeight} ${s.fontFamily};letter-spacing:${s.letterSpacing};color:${s.color}` }
  const tStyle = leafs[0] ? cs(leafs[0]) : '', dStyle = leafs.length ? cs(leafs[leafs.length - 1]) : ''
  // the box holding every row: the nearest ancestor of the first row that also holds the last; emptied, then refilled
  let host = tpl.parentElement
  while (host && !host.contains(rows[rows.length - 1])) host = host.parentElement
  host.innerHTML = ''; host.style.display = 'flex'; host.style.flexDirection = 'column'; host.style.gap = '8px'
  const keys = [...sh.querySelectorAll('*')].filter(e => /balance left/.test(e.textContent) && !e.querySelector('button')).sort((a, b) => b.textContent.length - a.textContent.length)
  if (keys[0]) keys[0].style.display = 'none'
  const L = [['LL · Mon 19 – Wed 21 Jan', 'Approved', '#58c48a', '3 days · tap to see it on the grid'], ['LL · Mon 26 – Tue 27 Jan', 'Waiting', '#e6edf3', '2 days'], ['LL · Mon 2 Feb', 'Refused', '#ff6b6b', '1 day'], ['LVE left', String(lve), '#e6edf3', 'already less the 2 waiting · 20 given']]
  for (const [t, st, col, d] of L) {
    const b = tpl.cloneNode(false); b.style.display = 'block'; b.style.width = '100%'; b.style.textAlign = 'left'
    b.innerHTML = `<span style="display:flex;justify-content:space-between;align-items:baseline;width:100%;${tStyle}"><span>${t}</span><span style="color:${col}">${st}</span></span><span style="display:block;margin-top:4px;${dStyle}">${d}</span>`
    host.appendChild(b)
  }
}, [LVE])
await mark(p, '[role=dialog]', '1b · NEW: tap the line — his own leave, one line a request', 2)
await p.screenshot({ path: join(OUT, 'r1q1-ours-phone-list-mock.png') })
await unmark(p); await esc(p)

// ---------- 4. Q2 — told when his bid is decided: the app's bell ----------
await p.evaluate(() => { scrollTo(0, 0); document.querySelector('.zz-strip')?.remove() })
await p.screenshot({ path: join(OUT, 'r1q2-ours-phone-today.png') })
await p.tap('.bellbtn'); await p.waitForTimeout(500)
await p.evaluate(() => {
  const list = document.querySelector('.bell-list'); if (!list) return
  list.querySelector('.bl-empty')?.remove()
  const line = (name, day, what, ago) => `<button type="button" class="bl-line unread"><span class="bl-dot"></span><span class="bl-main"><span class="bl-t"><b class="bl-name">${name}</b><i class="bl-day">${day}</i></span><span class="bl-what">${what}</span></span><span class="bl-ago">${ago}</span></button>`
  list.insertAdjacentHTML('afterbegin', line('Your leave', 'Mon 2 Feb', 'LL refused · Saber', '1h') + line('Your leave', 'Mon 19 – Wed 21 Jan', 'LL approved · Saber', '1h'))
  document.querySelector('.belldot')?.classList.add('on')
})
await mark(p, '.bell-list', '2 · NEW: the bell tells him', 2)
await p.screenshot({ path: join(OUT, 'r1q2-ours-phone-bell-mock.png') })
await unmark(p); await esc(p)

// ---------- 5. Q3 — a day panel on a phone (who is away, the day's figures) ----------
await p.evaluate(() => document.querySelector('[data-testid="cell-bane-2026-01-27"]')?.scrollIntoView({ block: 'center', inline: 'center' })); await p.waitForTimeout(800)
const away = await p.$$eval('[data-testid$="-2026-01-27"][data-testid^="cell-"]', els => els.filter(e => /^(LL|OL|OIL|CCL|FCL|PL|EL|CL)/.test(e.textContent.trim())).map(e => { const id = e.getAttribute('data-testid').slice(5, -11); const cs = document.querySelector(`[data-testid="person-${id}"]`); return [cs ? cs.textContent.replace(/[A-Z]{1,2}$/, '').trim() : id, e.textContent.trim()] }))
const avail = await p.evaluate(() => { const g = id => { const r = document.querySelector(`[data-testid="${id}"]`); return r ? r.textContent : '' }; return { p: document.querySelector('[data-testid="fly-row-avail-p"] [data-date="2026-01-27"], [data-testid="fly-avail-p-2026-01-27"]')?.textContent || '27', w: '18' } })
console.log('away 27 Jan:', JSON.stringify(away))
await p.screenshot({ path: join(OUT, 'r1q3-ours-phone-today.png') })
await p.evaluate(([away]) => {
  const ref = document.querySelector('[data-testid="bid-window"]')
  const panel = document.createElement('div'); panel.className = 'bidsheet zz-day'
  Object.assign(panel.style, { position: 'fixed', left: '0', right: '0', bottom: '0', top: 'auto', maxHeight: '52vh', zIndex: 60, borderRadius: '14px 14px 0 0', padding: '10px 14px 16px', overflow: 'auto', background: '#161b22', border: '1px solid #30363d', boxShadow: '0 -12px 30px rgba(0,0,0,.55)', width: 'auto', transform: 'none' })
  const chip = t => `<span class="${ref ? ref.className : ''}" style="pointer-events:none">${t}</span>`
  panel.innerHTML = `<div style="width:40px;height:4px;border-radius:2px;background:#4a5562;margin:0 auto 10px"></div>
   <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><span style="font:700 20px system-ui;color:#c9d1d9">‹</span><b style="font:700 16px system-ui;color:#e6edf3;letter-spacing:.04em">TUE 27 JAN</b><span style="font:700 20px system-ui;color:#c9d1d9">›</span></div>
   <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${chip('Avail P 25')}${chip('Avail W 17')}${chip('Required P –')}</div>
   <div style="font:600 11px system-ui;letter-spacing:.12em;color:#8b98a5;margin:4px 0 6px">AWAY · ${away.length}</div>
   ${away.map(([n, c]) => `<div style="display:flex;justify-content:space-between;padding:9px 2px;border-top:1px solid #26303a;color:#e6edf3;font:600 15px system-ui"><span>${n}</span><span style="color:#c9d1d9">${c} · waiting</span></div>`).join('')}`
  ;(document.querySelector('#page-leavewar') || document.body).appendChild(panel)
}, [away])
await mark(p, '.zz-day', '3 · NEW: tap a date — that day, who is away', 0)
await p.screenshot({ path: join(OUT, 'r1q3-ours-phone-day-mock.png') })
await unmark(p); await p.evaluate(() => document.querySelector('.zz-day')?.remove())

// ---------- 6. Q4 — the bid sheet says what a bid does before it is placed ----------
await p.tap(q('cell-bane-2026-01-28')); await p.waitForTimeout(600)
await p.screenshot({ path: join(OUT, 'r1q4-ours-phone-today.png') })
await p.evaluate(([lve]) => {
  const sh = document.querySelector('[data-testid="bid-picker"]'); if (!sh) return
  const lvN = parseFloat(lve) || 0
  const line = document.createElement('div'); line.className = 'zz-eff'
  Object.assign(line.style, { margin: '10px 0 2px', padding: '9px 10px', borderRadius: '8px', background: 'rgba(255,255,255,.04)', color: '#c9d1d9', font: '500 14px/1.4 system-ui' })
  line.innerHTML = `<b style="color:#e6edf3">Wed 28 Jan</b> · Avail P that day 28 → 27 if you bid`
  const bal = { LL: lvN, OL: lvN, OIL: 0, CCL: 0, FCL: 0, PL: 0, CL: 0 }
  for (const [t, v] of Object.entries(bal)) { const c = sh.querySelector(`[data-testid="bid-${t}"]`); if (c) { c.insertAdjacentHTML('beforeend', `<small class="zz-bal" style="margin-left:6px;opacity:.75;font-weight:600">${v}</small>`) } }
  // above HOW MANY: what he has and what a bid costs, before the one tap that places it
  const head = [...sh.querySelectorAll('*')].find(e => !e.children.length && /HOW MANY/i.test(e.textContent))
  const row = head ? head.closest('div:not([role=dialog])') : null
  if (row && row.parentElement) row.parentElement.insertBefore(line, row); else sh.appendChild(line)
}, [LVE])
await mark(p, '.zz-eff', '4 · NEW: the day, before he bids', 2)
await p.evaluate(() => { const c = document.querySelector('[data-testid="bid-LL"]'); const row = c && c.parentElement; if (row) row.classList.add('zz-row') })
await mark(p, '.zz-row', 'A · what is left, on each button', 3)
await p.screenshot({ path: join(OUT, 'r1q4-ours-phone-mock.png') })
await unmark(p)
// option B: pick, then confirm — LL lit, a line with what it does and a button that places it
await p.evaluate(([lve]) => {
  const sh = document.querySelector('[data-testid="bid-picker"]'); sh.querySelectorAll('.zz-bal').forEach(n => n.remove())
  const ll = sh.querySelector('[data-testid="bid-LL"]'), lit = sh.querySelector('[aria-pressed="true"], .on, .picked') || ll
  if (ll && lit) ll.className = lit.className
  const n = parseFloat(lve) || 0, box = document.createElement('div'); box.className = 'zz-conf'
  Object.assign(box.style, { margin: '10px 0 2px', padding: '9px 10px', borderRadius: '8px', background: 'rgba(255,255,255,.04)', color: '#c9d1d9', font: '500 14px/1.4 system-ui', display: 'flex', alignItems: 'center', gap: '10px' })
  const ref = sh.querySelector('[data-testid="span-one"]')
  box.innerHTML = `<span style="flex:1"><b style="color:#e6edf3">LL Wed 28 Jan:</b> LVE ${n} → ${n - 1}</span><button class="${ref ? ref.className : ''}">Place bid</button>`
  sh.appendChild(box)
}, [LVE])
await mark(p, '.zz-conf', 'B · pick, then confirm (one more tap)', 2)
await p.screenshot({ path: join(OUT, 'r1q4-ours-phone-mockB.png') })
await ctx.close()

// ---------- 7. theirs, marked ----------
;({ ctx, p } = await newPage(1536, 730, false))
await p.clock.setFixedTime(new Date('2026-10-21T09:00:00+08:00'))
await p.goto(CURL); await p.waitForSelector('table.war'); await p.waitForTimeout(700)
await mark(p, '.mine', '1 · his own numbers'); await mark(p, '.notice', '2 · since your last visit')
await p.screenshot({ path: join(OUT, 'r1-theirs-desk-top.png') }); await unmark(p)
await p.click('[data-act="apply"]'); await p.waitForTimeout(200)
await p.selectOption('#a-p', 'quill'); await p.selectOption('#a-c', 'LL')
await p.fill('#a-s', '2026-10-21'); await p.dispatchEvent('#a-s', 'change'); await p.fill('#a-e', '2026-10-23'); await p.dispatchEvent('#a-e', 'change'); await p.waitForTimeout(250)
await mark(p, '#a-prev', '4 · what it does, before it is sent')
await p.screenshot({ path: join(OUT, 'r1q4-theirs-desk-apply.png') })
await ctx.close()
;({ ctx, p } = await newPage(390, 844, true, null, 3))
await p.clock.setFixedTime(new Date('2026-10-21T09:00:00+08:00'))
await p.goto(CURL); await p.waitForSelector('table.war'); await p.waitForTimeout(700)
await mark(p, '.mine', '1'); await mark(p, '.notice', '2')
await p.screenshot({ path: join(OUT, 'r1-theirs-phone-top.png') }); await unmark(p)
await p.evaluate(() => document.querySelector('.dayview')?.scrollIntoView({ block: 'start' })); await p.waitForTimeout(300)
await mark(p, '.dayview', '3 · the day: who is away')
await p.screenshot({ path: join(OUT, 'r1q3-theirs-phone-day.png') })
await ctx.close()
console.log('page errors:', errs.length, errs.slice(0, 3))
await browser.close()
