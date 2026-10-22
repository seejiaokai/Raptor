// Round 19 (22 Oct 26), D1240 on round 17's tabs drawing (A): "the manning button position went off to the right. I also
// want to have less vertical space used at the top … less buttons. What is under 1 day? Is it needed?"
// Navigation A redrawn with the design skill (Impeccable, shape + distill) — one row fewer at the top on a phone AND a
// desktop, Manning back at the LEFT of the grid card, "Under 1 day" folded into Manning:
//   row 1  the tabs, the app's own Inputs-page tab row (.inputs-tabs / .intab, lesson 17): Grid · Approvals 15 ·
//          Balances · OIL (a member: Grid · Balances · OIL — D1242); ⚙ at its right end (an admin's). On a desktop the same row carries
//          View and the period picker and My leave too.
//   row 2  (phone only) View, the period picker and My leave — the line a member's phone already has (D1227), now an
//          admin's too, so his third line goes. "+" (a new period) moves into the picker's own list, its last line.
//   grid card's bar  [▾ Manning | 1 short ›] · the open dates · … · Legend. Manning where it is today; the right half
//          of its button is the under-manned count and jumps to the next short day; Rearrange goes into ⚙, OIL is a tab,
//          the zoom pair is gone (D1228).
// Drawn into the real local build with the round's top rows (full-r7-one.mjs via full-r7-decide.mjs's stage).
//   r19-nav-admin-phone / -admin-desk / -member-phone   the new top, numbered
//   r19-nav-member-twobal                                  a member: A the Balances tab, B the grid's Balances fold
//   r19-nav-picker-phone                                   the picker's list, "+ New period" its last line
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r19-nav.mjs
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

// the tabs' small icons, line icons as the Inputs page's are (its calendar, people and medical glyphs)
const IC = {
  grid: '<svg class="btnglyph" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 6.2h12M2 9.8h12M6 2.5v11M10 2.5v11" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>',
  appr: '<svg class="btnglyph" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.2h6M3 8h4.5M3 11.8h3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M9 10.6l1.9 1.9L14 8.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bal: '<svg class="btnglyph" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13.5V8.5M8 13.5V3M13 13.5V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  oil: '<svg class="btnglyph" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.6V8l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}
const CSS = `
#page-leavewar .zz-nav{display:flex;align-items:center;gap:8px;padding:8px 20px;border-bottom:1px solid #2a313a}
#page-leavewar .zz-nav.ph{gap:6px;padding:4px 10px}
#page-leavewar.zz-tight .topbar{padding-top:4px!important;padding-bottom:4px!important;min-height:0!important}
#page-leavewar .zz-bar.ph{gap:5px;padding-top:6px!important;padding-bottom:6px!important}
#page-leavewar.zz-tight .zml2{height:34px}
#page-leavewar .zz-bar.ph .zz-short{padding:0 7px;font-size:11.5px}
#page-leavewar .zz-bar.ph .zchip{padding:0 8px}
#page-leavewar .zz-nav .inputs-tabs{flex:0 0 auto}
#page-leavewar .zz-nav.ph .inputs-tabs{flex:1 1 auto;min-width:0}
#page-leavewar .zz-nav.ph .intab{flex:1 1 auto;padding:4px 5px;gap:4px;font-size:12.5px}
#page-leavewar .zz-nav.ph .intab .btnglyph{width:13px;height:13px}
#page-leavewar .zz-nav .intab .n{font-style:normal;font:800 10.5px/1 system-ui;padding:2px 6px;border-radius:9px;background:rgba(59,198,232,.16);color:#5fd0e6}
#page-leavewar .zz-nav .zz-gear{flex:none;width:44px;height:44px;margin:0;border-radius:11px}
#page-leavewar .zz-nav.ph .zz-gear{width:40px;height:44px}
/* the grid card's one bar: Manning at the left, the open dates beside it, Legend at the right end */
#page-leavewar .zz-bar{display:flex!important;align-items:center;gap:8px;flex-wrap:nowrap}
#page-leavewar .zz-split{display:inline-flex;align-items:stretch;flex:none}
#page-leavewar .zz-split > [data-testid="counts-toggle"]{margin:0!important;border-top-right-radius:0!important;border-bottom-right-radius:0!important}
#page-leavewar .zz-short{display:inline-flex;align-items:center;gap:4px;padding:0 10px;margin-left:-1px;border:1px solid #3a4652;border-left-color:#2a323c;border-radius:0 8px 8px 0;background:#141a21;color:#e6edf3;font:700 12.5px/1 system-ui;white-space:nowrap}
#page-leavewar .zz-short b{color:#F2C879;font-weight:800}
#page-leavewar .zz-short i{font-style:normal;color:#9aa5b1;font-weight:600}
#page-leavewar .zz-bar .zchip{height:auto;align-self:stretch}
/* the picker's own list, drawn open (a native list on the device) */
.zz-plist{position:fixed;z-index:95;min-width:200px;background:#161b22;border:1px solid #2f3a46;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.6);padding:5px;font:600 14px system-ui;color:#e6edf3}
.zz-plist div{display:flex;align-items:center;gap:10px;height:40px;padding:0 12px;border-radius:8px}
.zz-plist div.on{background:#1a2129;color:#8FE0A8}
.zz-plist div.on::after{content:'✓';margin-left:auto}
.zz-plist hr{border:0;border-top:1px solid #2a313a;margin:4px 2px}
.zz-plist div.nw{color:#5fd0e6}
`
async function page(w, h, touch, who) {
  const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, who)
  await DC.stage(p, touch, who === 'member' ? { member: true } : {})
  await p.evaluate(css => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s) }, CSS)
  // "pending", not "waiting" (D1217)
  await p.evaluate(() => { for (const n of document.querySelectorAll('#page-leavewar .zml, #page-leavewar .zml2 .b')) n.innerHTML = n.innerHTML.replace(/ waiting/, ' pending') })
  return { ctx, p }
}
const reqTop = p => p.evaluate(() => Math.round(document.querySelector('[data-testid="figures-toggle"]')?.getBoundingClientRect().top ?? -1))
const buttons = p => p.evaluate(() => {
  const pg = document.querySelector('#page-leavewar'), G = pg.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect()
  // every control above the grid's first row, the page's and the grid card's own
  return [...pg.querySelectorAll('.zchip, .zml, .zml2, .intab, .zz-short, .zz-gear, button, select')]
    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom <= G.bottom + 2 && !e.closest('.zz-split > .zz-short ~ *') }).length
})

// ---------- the new top ----------
async function draw(p, touch, member) {
  return p.evaluate(([touch, member, IC]) => {
    const pg = document.querySelector('#page-leavewar'), top = pg.querySelector('.topbar'), fil = pg.querySelector('.filters')
    const pick = pg.querySelector('[data-zk="pick"]'), lab = pg.querySelector('[data-zk="viewlab"]')
    const open = pg.querySelector('[data-zk="open"]'), legend = pg.querySelector('[data-zk="legend"]')
    const man = pg.querySelector('[data-testid="counts-toggle"]'), gear = pg.querySelector('[data-testid="settings-open"]')
    const bar = man.parentElement
    // the tabs: the app's own tab row (the Inputs page's .inputs-tabs / .intab)
    const nav = document.createElement('div'); nav.className = 'zz-nav' + (touch ? ' ph' : ''); nav.setAttribute('data-zz', 'nav')
    const T = (k, label, on, n) => `<button type="button" role="tab" class="intab" aria-selected="${on}" data-zz="tab-${k}">${IC[k]}<span class="intab-t">${label}</span>${n ? `<i class="n">${n}</i>` : ''}</button>`
    const tabs = document.createElement('div'); tabs.className = 'inputs-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('data-zz', 'tabs')
    tabs.innerHTML = T('grid', 'Grid', true) + (member ? T('bal', 'Balances', false) : T('appr', 'Approvals', false, 15) + T('bal', 'Balances', false)) + T('oil', 'OIL', false)
    nav.appendChild(tabs)
    // My leave: the member's two-line chip (D1227) on a phone, the one-line chip on a desktop
    let ml = pg.querySelector('[data-zk="ml"]')
    if (touch && !member) {
      const f = { lve: '17', oil: '0', pend: 0, next: '30 Jan' }
      const s = document.createElement('span'); s.className = 'zml2'; s.setAttribute('data-zk', 'ml')
      s.innerHTML = `<span class="st"><span class="a">MY LEAVE<span class="nx">· next ${f.next}</span></span><span class="b"><b>LVE ${f.lve}</b> · OIL ${f.oil} · ${f.pend} pending</span></span><span class="chev">›</span>`
      ml = s
    }
    if (touch) {
      // phone: row 1 the tabs and ⚙; row 2 View, the picker and My leave; the admin's third line goes
      top.before(nav)
      top.innerHTML = ''; const r = document.createElement('div'); r.className = 'zrow'; r.append(lab, pick, ml); top.appendChild(r)
      fil.style.display = 'none'
      pg.querySelectorAll('.zrow3').forEach(n => n.remove())
      if (!member && gear) { gear.classList.add('zz-gear'); nav.appendChild(gear) }
    } else {
      // desktop: ONE row — the tabs, View and the picker, My leave, ⚙ at its right end
      top.before(nav)
      const sp = document.createElement('span'); sp.className = 'zsp'
      lab.style.marginLeft = '10px'
      nav.append(lab, pick, sp, ml)
      if (!member && gear) { gear.classList.add('zz-gear'); gear.style.width = '40px'; gear.style.height = '40px'; nav.appendChild(gear) }
      top.style.display = 'none'; fil.style.display = 'none'
    }
    // the grid card's bar: [Manning | 1 short ›] · the open dates · … · Legend
    for (const t of ['roster-arrange', 'oil-tracker', 'lw-zoom-out', 'lw-zoom-in', 'settings-open']) { const e = bar.querySelector(`[data-testid="${t}"]`); if (e && e !== gear) e.remove() }
    const split = document.createElement('span'); split.className = 'zz-split'; split.setAttribute('data-zz', 'manning')
    man.before(split); split.appendChild(man)
    const sh = document.createElement('button'); sh.type = 'button'; sh.className = 'zz-short'; sh.setAttribute('data-zz', 'short')
    sh.title = 'Days a Manning or Available row is amber or red — tap for the next one'
    sh.innerHTML = '<b>1</b> short <i>›</i>'; split.appendChild(sh)
    open.removeAttribute('style'); bar.appendChild(open)
    const sp2 = document.createElement('span'); sp2.style.flex = '1'; bar.appendChild(sp2)
    bar.appendChild(legend)
    bar.classList.add('zz-bar'); if (touch) { bar.classList.add('ph'); pg.classList.add('zz-tight') }
    // the bar's chips as tall as Manning
    const mh = man.getBoundingClientRect().height
    for (const c of [open, legend, sh]) c.style.height = mh + 'px'
    return { mh }
  }, [touch, member, IC])
}

const res = {}
for (const [w, h, touch, who, name] of [[1536, 860, false, 'admin', 'admin-desk'], [390, 844, true, 'admin', 'admin-phone'], [390, 844, true, 'member', 'member-phone']]) {
  const { ctx, p } = await page(w, h, touch, who)
  const before = await reqTop(p), nb = await buttons(p)
  await draw(p, touch, who === 'member')
  await p.waitForTimeout(300)
  const after = await reqTop(p), na = await buttons(p)
  const over = await p.evaluate(() => [...document.querySelectorAll('#page-leavewar .zz-nav, #page-leavewar .zrow, #page-leavewar .zz-bar')].map(r => r.scrollWidth - r.clientWidth).filter(x => x > 0))
  res[name] = { before, after, saved: before - after, buttonsBefore: nb, buttonsAfter: na, overflow: over }
  console.log(name, JSON.stringify(res[name]))
  // the marks: numbered, where they cover nothing
  const M = touch
    ? [['[data-zz="tabs"]', '1', 's'], ...(who === 'member' ? [] : [['.zz-gear', '2', 'sw']]), ['[data-zk="ml"]', '3', 'ne'], ['[data-zz="manning"]', '4', 'ne'], ['[data-zk="open"]', '5', 'ne'], ['[data-zk="legend"]', '6', 'nw']]
    : [['[data-zz="tabs"]', '1', 'ne'], ['.zz-gear', '2', 'nw'], ['[data-zk="ml"]', '3', 'nw'], ['[data-zz="manning"]', '4', 'ne'], ['[data-zk="open"]', '5', 'ne'], ['[data-zk="legend"]', '6', 'nw']]
  for (const [sel, n, at] of M) await mk(p, sel, n, { prefer: [at] })
  await p.mouse.move(2, 2)
  await shot(p, 'r19-nav-' + name, { clip: { x: 0, y: 0, width: w, height: touch ? 400 : 330 } })
  if (name === 'admin-phone') {
    // the picker's list, "+ New period" its last line (in place of the "+" button)
    await p.evaluate(() => { document.querySelectorAll('.zz-tag').forEach(n => n.remove()); document.querySelectorAll('.zz-marked').forEach(n => { n.style.outline = '' }) })
    await p.evaluate(() => {
      const R = document.querySelector('[data-zk="pick"]').getBoundingClientRect()
      const m = document.createElement('div'); m.className = 'zz-plist'; m.setAttribute('data-zz', 'plist')
      m.innerHTML = '<div class="on">JAN - DEC 26</div><hr><div class="nw">+ New period</div>'
      Object.assign(m.style, { left: R.left + 'px', top: (R.bottom + 6) + 'px' }); document.body.appendChild(m)
    })
    await mk(p, '.zz-plist .nw', '7', { prefer: ["e"] })
    await shot(p, 'r19-nav-picker-phone', { clip: { x: 0, y: 0, width: 390, height: 330 } })
  }
  if (name === 'member-phone') {
    // two things called Balances (D1242 gave a member the tab; the grid's fold is D1185's): A the tab, B the fold
    await p.evaluate(() => { document.querySelectorAll('.zz-tag').forEach(n => n.remove()); document.querySelectorAll('.zz-marked').forEach(n => { n.style.outline = '' }) })
    await mk(p, '[data-zz="tab-bal"]', 'A', { prefer: ['s'] })
    await mk(p, '[data-testid="figures-toggle"]', 'B', { prefer: ['e'] })
    await shot(p, 'r19-nav-member-twobal', { clip: { x: 0, y: 0, width: w, height: 400 } })
  }
  await ctx.close()
}
console.log(JSON.stringify(res))
await browser.close(); console.log('errors:', errs)
