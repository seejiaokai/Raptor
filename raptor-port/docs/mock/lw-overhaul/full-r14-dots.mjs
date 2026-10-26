// Round 14 (22 Oct 26), his "Ok give me a mock up of the recommendation" (grid dots): the recommendation drawn —
// NO dot on the grid; what is new is found in Approvals' "New" choice; a tap on a request's dates shows it on the grid,
// the grid scrolling there and ringing his cell with the app's one just-added ring (plain 2px blue, no glow, about six
// seconds — design guide §4 "one mark, one look"); on a desktop Approvals stays docked beside the grid, so the ringed
// cell is in view at its left; on a phone Approvals drops to a slim bar at the foot while the grid shows the cell.
// Pictures cut to the area asked about, the change named in words on each (lesson 32). Nothing here is built.
//   r14-dots-1-new      desktop: Approvals docked, on "New 3": only the three new requests; their dates in cyan
//   r14-dots-2-shown    desktop: after a tap on Reaper's "Tue 27 Jan": the grid at its left, his cell ringed
//   r14-dots-3-phone    phone: Approvals on "New 3", then after the tap: the grid with the ring, Approvals a slim bar
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r14-dots.mjs      (R14_ONLY=1,2,3)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, UNDER } from './full-r7-one.mjs'
const ONLY = (process.env.R14_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

// the r7 Approvals window and the r12 labels, read from their files between markers and run unchanged
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state },
  ['stage', 'apDesk', 'apPhone', 'approvals', 'readFigs'])
const DECO = load(cut(SRC('full-r12-dot.mjs'), 'const DECO = `', 'const deco ='), {}, ['DECO']).DECO
const deco = p => p.addScriptTag({ content: DECO })
const crop = (p, name, r) => p.evaluate(() => [scrollX, scrollY]).then(([sx, sy]) =>
  shot(p, name, { clip: { x: Math.round(r.left + sx), y: Math.round(r.top + sy), width: Math.round(r.width), height: Math.round(r.height) } }))

// The round's changes to the r7 window: "pending", not "waiting" (D1217); the dates are the way to the grid — cyan, as
// everything pressable is, with "›" (the also-lines lose their separate "Show on grid ›", so every line works alike)
const CSS = `
.zapw .dt.lnk{color:#5fd0e6;font-weight:600}
.zapw .dt.lnk .ch{margin-left:4px;opacity:.8}
.zapw.ph .l1 .dt.lnk{color:#5fd0e6}
#page-leavewar td.zz-ring{box-shadow:inset 0 0 0 2px #1E86FF!important}
/* the phone's slim bar while the grid shows a request */
.zslim{position:fixed;left:6px;right:6px;bottom:6px;height:46px;z-index:85;display:flex;align-items:center;gap:10px;padding:0 14px;border-radius:12px;background:#161b22;border:1px solid #2a323c;box-shadow:0 10px 30px rgba(0,0,0,.6);color:#c9d1d9;font:13px system-ui}
.zslim b{font:800 15px system-ui;letter-spacing:.06em;color:#f1f4f7}.zslim .sub{color:#8a96a3;font:500 12.5px system-ui}
.zslim .zd{display:inline-block;width:7px;height:7px;border-radius:50%;background:#3bc6e8}
.zslim .up{margin-left:auto;color:#5fd0e6;font:700 13px system-ui}.zslim .x{color:#9aa5b1;font-size:16px;margin-left:6px}
`
const tweak = html => html
  .replace(/15 waiting · 3 new since you last looked, Wed 7 Jan 16:40|15 waiting · 3 new/, () => '15 pending · 3 new')
  .replace(/<span style="color:#5fd0e6;font:600 12\.5px system-ui">Show on grid ›<\/span>/g, () => '')
  .replace(/<span class="dt">([^<]+)<\/span>/g, (m, d) => `<span class="dt lnk">${d}<span class="ch">›</span></span>`)
const prep = p => p.evaluate(css => {
  if (!document.getElementById('zz14')) { const s = document.createElement('style'); s.id = 'zz14'; s.textContent = css; document.head.appendChild(s) }
  // "pending", not "waiting" (D1217), on the top rows' My leave too
  for (const n of document.querySelectorAll('#page-leavewar .zml, #page-leavewar .zml2 .b')) n.innerHTML = n.innerHTML.replace(/ waiting/, ' pending')
}, CSS)

let FIGS
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {}); FIGS = await DC.readFigs(p); await ctx.close()
}

// ======================= 1, 2 — the desktop: Approvals docked on "New 3"; then after a tap on Reaper's dates =======================
for (const v of ['1', '2']) {
  if (!want(v)) continue
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  if (await p.locator(q('figures-toggle')).count()) { await p.click(q('figures-toggle')); await p.waitForTimeout(400) }
  await gridTo(p, '2026-01-19', 'bane')
  await DC.stage(p, false, {}); await prep(p)
  console.log('approvals overflow', await DC.approvals(p, tweak(DC.apDesk(FIGS, { newOnly: true })), false))
  await deco(p)
  const r = await p.evaluate(v => {
    const d = window.__d, w = document.querySelector('.zapw'), W = d.R(w)
    // the window as tall as what it holds (the three requests and the two "also" lines), not the grid's full height
    const last = [...w.querySelectorAll('.list .r')].pop()
    w.style.bottom = 'auto'; w.style.height = Math.ceil(last.getBoundingClientRect().bottom - W.top + 10) + 'px'
    const W2 = d.R(w)
    const reaper = w.querySelector('.list .r.zz-first')
    const dt = d.R(reaper.querySelector('.dt'))
    if (v === '1') {
      // the crop: the window, with a band on the left for the words
      const C = { left: W2.left - 300, top: W2.top - 70, right: W2.right + 10, bottom: W2.bottom + 12 }
      d.back({ left: C.left, top: C.top, width: C.right - C.left, height: C.bottom - C.top }, 84)
      const nw = d.R('.zz-new3'); d.ring(nw, 2)
      const t1 = d.tag('“New”: only what arrived<br>since you last opened Approvals', { right: W2.left - 26, cy: nw.top + nw.height / 2 })
      d.hline(nw.top + nw.height / 2, t1.right, nw.left - 5)
      d.ring(dt, 2)
      const t2 = d.tag('tap the dates:<br>the grid shows it', { right: W2.left - 26, cy: dt.top + dt.height / 2 + 40 })
      d.hline(t2.top + t2.height / 2, t2.right, dt.left - 30); d.vline(dt.left - 30, t2.top + t2.height / 2 + 1.5, dt.top + dt.height / 2 - 1.5); d.hline(dt.top + dt.height / 2, dt.left - 31.5, dt.left - 5)
      return { left: C.left, top: C.top, width: C.right - C.left, height: C.bottom - C.top }
    }
    // 2: the grid ringed on Reaper's Tue 27 Jan, the window as it was (open, docked) — its line under the finger
    const cell = document.querySelector('[data-testid="cell-dice-2026-01-27"]'); cell.classList.add('zz-ring')
    const c = d.R(cell)
    const outer = d.R('#page-leavewar .mx-outer')
    // the crop: from the name column to just past Reaper's line in the window, rows from the dates' heading to Anvil
    const top = c.top - 200, bottom = c.bottom + 140
    const C = { left: outer.left, top, right: dt.right + 40, bottom }
    // blank the window's rows other than Reaper's, so the eye goes from his line to his cell
    for (const l of w.querySelectorAll('.list .r:not(.h)')) if (l !== reaper) l.style.opacity = '.28'
    d.ring(dt, 2)
    const t = d.tag('his line’s dates, tapped', { cx: dt.left + dt.width / 2, top: dt.bottom + 10 })
    d.vline(dt.left + dt.width / 2, dt.bottom + 5, t.top)
    // blank the rows under Anvil's, so nothing else in the grid competes with the ring
    const anvil = d.R('[data-testid="cell-shaft-2026-01-27"]')
    d.back({ left: outer.left, top: anvil.bottom + 1, width: dt.right + 40 - outer.left, height: bottom - anvil.bottom }, 84)
    const tc = d.tag('the grid scrolls there; his cell wears<br>the app’s blue ring for about 6 seconds', { left: c.left - 40, top: c.bottom + 50 })
    d.vline(c.left + c.width / 2, c.bottom + 5, tc.top)
    return { left: C.left, top: C.top, width: C.right - C.left, height: C.bottom - C.top }
  }, v)
  await p.mouse.move(2, 2)
  await crop(p, v === '1' ? 'r14-dots-1-new' : 'r14-dots-2-shown', r)
  await ctx.close()
}

// ======================= 3 — a phone: Approvals on "New 3"; after the tap, the grid with the ring and a slim bar =======================
if (want('3')) {
  const shots = []
  for (const v of ['a', 'b']) {
    const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'admin')
    await gridTo(p, '2026-01-23', 'bane')
    await DC.stage(p, true, {}); await prep(p)
    if (v === 'a') {
      console.log('phone approvals overflow', await DC.approvals(p, tweak(DC.apPhone(FIGS, { newOnly: true })), true))
      await deco(p)
      await p.evaluate(() => {
        const d = window.__d, w = document.querySelector('.zapw')
        const card = w.querySelector('.card'), dt = d.R(card.querySelector('.dt'))
        d.ring(dt, 2)
        const lastCard = d.R([...w.querySelectorAll('.card')].pop())
        d.tag('tap a request’s dates (ringed):<br>the grid shows it', { left: 22, top: lastCard.bottom + 24 })
        d.ring(d.R('.zz-new3'), 2)
      })
    } else {
      await p.evaluate(() => {
        const s = document.createElement('div'); s.className = 'zslim'
        s.innerHTML = '<span class="zd"></span><b>Approvals</b><span class="sub">15 pending · 3 new</span><span class="up">Back ▴</span><span class="x">✕</span>'
        document.body.appendChild(s)
        document.querySelector('[data-testid="cell-dice-2026-01-27"]').classList.add('zz-ring')
        // the grid scrolled so his row sits clear of the bar
        const c = document.querySelector('[data-testid="cell-dice-2026-01-27"]')
        document.scrollingElement.scrollTop += c.getBoundingClientRect().top - 420
      })
      await deco(p)
      await p.evaluate(() => {
        const d = window.__d, c = d.R('[data-testid="cell-dice-2026-01-27"]'), s = d.R('.zslim')
        d.tag('his cell, ringed', { left: Math.max(8, c.left - 60), top: c.bottom + 14 })
        d.ring(s, 1)
        d.tag('Approvals waits here: “Back” opens it again', { cx: 195, bottom: s.top - 10 })
      })
    }
    await shot(p, 'r14-dots-3' + v)
    shots.push(join(OUT, 'r14-dots-3' + v + '.png'))
    await ctx.close()
  }
  // side by side
  const { ctx, p } = await newPage(browser, 800, 844, false, null, 2)
  const img = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  await p.setContent(`<body style="margin:0;background:#0b0d10;display:flex;gap:20px;align-items:flex-start">${shots.map(s => `<img src="${img(s)}" style="width:390px;display:block">`).join('')}</body>`)
  await p.waitForTimeout(200)
  await shot(p, 'r14-dots-3-phone', { clip: { x: 0, y: 0, width: 800, height: 844 } })
  await ctx.close()
}

await browser.close(); console.log('errors:', errs)
