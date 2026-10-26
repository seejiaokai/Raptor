// Round 17 (22 Oct 26), D1232 (lesson 33): "do u find the main page of the leave war layout pretty confusing. Like so
// many buttons. How to navigate to find a page" — and D1236's "standardisation … speed. Lesser taps … intuitive".
// The Leave War as the overhaul will build it, every button counted, then two ways to find its sub-pages:
//   A (recommended) — TABS, as the Inputs page already has (Inputs · SANS · Medical, the app's own sub-page pattern):
//     Grid · Approvals 15 · Balances · OIL. The grid's own controls on one row; Rearrange moves into Settings (where
//     its groups are); OIL tracker becomes a tab; the zoom buttons are gone already (D1228).
//   B — ONE MENU: the grid page stays; Balances, OIL tracker, Rearrange and Settings go into one "⋯" menu.
// Drawn into the real local build with the round's top rows (full-r7-one.mjs via full-r7-decide.mjs's stage).
//   r17-nav-today-desk / -phone   every button, numbered
//   r17-nav-A-desk / -phone       tabs
//   r17-nav-B-phone               one menu, open
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r17-nav.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo, mark } from './full-lib.mjs'
import { oneStage, oneFold, mk, UNDER } from './full-r7-one.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state }, ['stage'])
const DECO = load(cut(SRC('full-r12-dot.mjs'), 'const DECO = `', 'const deco ='), {}, ['DECO']).DECO

const CSS = `
.zz-tabs{display:flex;gap:2px;padding:3px;margin:8px 20px 0;border:1px solid #2a313a;border-radius:11px;background:#11161c;width:max-content}
.zz-tabs.ph{margin:6px 10px 0;width:auto;display:flex}
.zz-tab{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:4px 16px;border:1px solid transparent;border-radius:8px;color:#9aa5b1;font:700 13px/1 system-ui;white-space:nowrap}
.zz-tabs.ph .zz-tab{flex:1 1 auto;padding:4px 6px;font-size:12.5px}
.zz-tab.on{border-color:#3bc6e8;background:#1a2129;color:#5fd0e6}
.zz-tab em{font-style:normal;font:800 10.5px/1 system-ui;padding:2px 6px;border-radius:9px;background:rgba(59,198,232,.16);color:#5fd0e6}
.zz-menu{position:fixed;z-index:90;width:250px;background:#161b22;border:1px solid #2f3a46;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.6);padding:6px;font:13.5px system-ui;color:#e6edf3}
.zz-menu div{display:flex;align-items:center;gap:10px;height:40px;padding:0 12px;border-radius:8px}
.zz-menu div span{margin-left:auto;color:#8a96a3;font-size:12px}
.zz-menu hr{border:0;border-top:1px solid #2a313a;margin:4px 2px}
.zz-more{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9px;border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:800 16px/1 system-ui;letter-spacing:1px}
`
const deco = p => p.addScriptTag({ content: DECO })
async function page(w, h, touch) {
  const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, 'admin')
  await DC.stage(p, touch, {})
  await p.evaluate(css => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s) }, CSS)
  // "pending", not "waiting" (D1217)
  await p.evaluate(() => { for (const n of document.querySelectorAll('#page-leavewar .zml')) n.innerHTML = n.innerHTML.replace(/ waiting/, ' pending') })
  return { ctx, p }
}
const T = tid => `[data-testid="${tid}"]`

// ---------- today, as the overhaul will build it: every button numbered ----------
const TODAY = [['[data-zk="pick"]', 'View'], ['[data-zk="appr"]', 'Approvals'], ['[data-zk="open"]', 'Open for bidding'], ['[data-zk="under"]', 'Under-manned'],
  ['[data-zk="legend"]', 'Legend'], ['[data-zk="ml"]', 'My leave'], [T('counts-toggle'), 'Manning'], [T('settings-open'), 'Settings'],
  [T('roster-arrange'), 'Rearrange'], [T('oil-tracker'), 'OIL tracker'], [T('lw-zoom-out'), 'zoom'], [T('lw-zoom-in'), 'zoom'], [T('figures-toggle'), 'Balances']]
for (const [w, h, touch, name] of [[1536, 860, false, 'desk'], [390, 844, true, 'phone']]) {
  const { ctx, p } = await page(w, h, touch)
  // "+ New" sits between View and Approvals: numbered too
  let n = 1
  for (const [sel] of TODAY.slice(0, 1)) await mark(p, sel, String(n++), { num: true })
  await p.evaluate(() => { const ap = document.querySelector('[data-zk="appr"]'); ap.previousElementSibling.setAttribute('data-zz', 'new') })
  await mark(p, '[data-zz="new"]', String(n++), { num: true })
  for (const [sel] of TODAY.slice(1)) await mark(p, sel, String(n++), { num: true })
  console.log('today', name, n - 1, 'buttons')
  await p.mouse.move(2, 2)
  await shot(p, 'r17-nav-today-' + name, { clip: { x: 0, y: 0, width: w, height: touch ? 420 : 470 } })
  await ctx.close()
}

// ---------- A: tabs ----------
for (const [w, h, touch, name] of [[1536, 860, false, 'desk'], [390, 844, true, 'phone']]) {
  const { ctx, p } = await page(w, h, touch)
  await p.evaluate(touch => {
    const ap = document.querySelector('[data-zk="appr"]'), row1 = ap.closest('.zrow') || ap.parentElement
    const tabs = document.createElement('div'); tabs.className = 'zz-tabs' + (touch ? ' ph' : ''); tabs.setAttribute('data-zz', 'tabs')
    tabs.innerHTML = '<span class="zz-tab on">Grid</span><span class="zz-tab">Approvals <em>15</em></span><span class="zz-tab">Balances</span><span class="zz-tab">OIL</span>'
    row1.before(tabs)
    { const par = tabs.parentElement, cs = getComputedStyle(par); if (cs.display.includes('flex') && !cs.flexDirection.startsWith('column')) { par.style.flexWrap = 'wrap'; tabs.style.flex = '0 0 ' + (touch ? 'calc(100% - 20px)' : 'auto'); if (!touch) { tabs.style.marginRight = '100%' } } }
    ap.remove()
    // the grid's own buttons: Manning and Settings join the page's row; Rearrange goes into Settings; OIL is a tab; no zoom (D1228)
    const man = document.querySelector('[data-testid="counts-toggle"]'), gear = document.querySelector('[data-testid="settings-open"]')
    const bar = man.parentElement
    for (const t of ['roster-arrange', 'oil-tracker', 'lw-zoom-out', 'lw-zoom-in']) document.querySelector(`[data-testid="${t}"]`)?.remove()
    if (!touch) {
      // desktop: one row of the grid's controls — the open dates, under-manned, Legend, Manning, Settings, then My leave
      const row2 = document.querySelector('[data-zk="open"]').closest('.zrow') || document.querySelector('[data-zk="open"]').parentElement
      const ml = row2.querySelector('[data-zk="ml"]')
      const pick = document.querySelector('[data-zk="pick"]'), plus = pick.nextElementSibling
      const lab = document.querySelector('[data-zk="viewlab"]')
      row2.prepend(lab, pick, plus)
      if (ml) ml.before(man, gear); else row2.append(man, gear)
      man.style.margin = '0 0 0 6px'; gear.style.margin = '0 4px'
      row1.remove()
      bar.style.display = 'none'
    } else {
      // phone: the picker's row keeps + and gains Settings; the grid card keeps Manning and its months
      const pick = document.querySelector('[data-zk="pick"]')
      const sp = document.createElement('span'); sp.style.flex = '1'; row1.append(sp, man, gear); man.style.margin = '0 6px 0 0'; bar.style.display = 'none'
      gear.style.margin = '0'
    }
  }, touch)
  await deco(p)
  await p.evaluate(touch => {
    const d = window.__d, t = d.R('[data-zz="tabs"]')
    d.ring(t, 2)
    d.tag('one tap to each sub-page, as on the Inputs page', touch ? { left: 10, top: 300 } : { left: t.right + 16, cy: t.top + t.height / 2 })
  }, touch)
  await p.mouse.move(2, 2)
  await shot(p, 'r17-nav-A-' + name, { clip: { x: 0, y: 0, width: w, height: touch ? 420 : 470 } })
  await ctx.close()
}

// ---------- B: one menu (phone) ----------
{
  const { ctx, p } = await page(390, 844, true)
  await p.evaluate(() => {
    const ap = document.querySelector('[data-zk="appr"]'), row1 = ap.closest('.zrow') || ap.parentElement
    for (const t of ['roster-arrange', 'oil-tracker', 'lw-zoom-out', 'lw-zoom-in', 'settings-open']) document.querySelector(`[data-testid="${t}"]`)?.remove()
    const sp = document.createElement('span'); sp.style.flex = '1'
    const more = document.createElement('span'); more.className = 'zz-more'; more.textContent = '⋯'; more.setAttribute('data-zz', 'more')
    row1.append(sp, more)
    const R = more.getBoundingClientRect()
    const m = document.createElement('div'); m.className = 'zz-menu'
    m.innerHTML = '<div>Balances &amp; grades</div><div>OIL tracker</div><hr><div>Settings</div><div>Rearrange</div><div>Events</div><div>Calendar</div>'
    Object.assign(m.style, { right: (innerWidth - R.right) + 'px', top: (R.bottom + 6) + 'px' }); document.body.appendChild(m)
  })
  await deco(p)
  await p.evaluate(() => { const d = window.__d, m = d.R('.zz-menu'); d.ring(d.R('[data-zz="more"]'), 2); d.tag('everything else behind one ⋯', { left: 10, top: m.bottom + 12 }) })
  await shot(p, 'r17-nav-B-phone', { clip: { x: 0, y: 0, width: 390, height: 560 } })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
