// Round 6 (night of 21–22 Oct 26): the Leave War's ⚙ Settings window redesigned (D1205 — "very wordy and not clean and
// not intuitive. Fix it."). Drawn INTO the real local build: today's window with every sentence or control that goes or
// moves marked by number, then the proposed window built in place of its contents with the app's own classes
// (.bidsheet, .gs-sec, .set-grow, .rtbtn, .tchip, .creset, .set-disc). The same number marks the same change in both.
// Nothing here is built into the app.
//   cd raptor-port && LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r6-settings.mjs
import { chromium, newPage, signIn, shot, mark, unmark, q, errs } from './full-lib.mjs'
const browser = await chromium.launch()

const LOCK = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" style="vertical-align:-1px;margin-right:5px"><rect x="3.2" y="7" width="9.6" height="7" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.3 7V5a2.7 2.7 0 0 1 5.4 0v2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'

// a few looks the app does not yet have, made only of its own tokens
const CSS = `
.bidsheet .zz-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:7px 2px;border-top:1px solid rgba(42,49,58,.55)}
.bidsheet .zz-row:first-of-type{border-top:none}
.bidsheet .zz-row .lab{flex:none;width:86px;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.bidsheet .zz-row .ctl{display:flex;flex-wrap:wrap;gap:7px;flex:1;min-width:0}
.bidsheet .zz-step{display:inline-flex;align-items:center;gap:0}
.bidsheet .zz-step .rtbtn{min-width:30px;text-align:center;font-size:13px;line-height:1;padding:5px 7px}
.bidsheet .zz-step .n{min-width:26px;text-align:center;font:700 13px system-ui;color:var(--ink);font-variant-numeric:tabular-nums}
.bidsheet .zz-step .rtbtn:disabled{opacity:.4}
.bidsheet .set-gct.zz-ct{min-width:38px;text-align:center;background:var(--panel-2);border:1px solid var(--edge-2);border-radius:7px;padding:3px 7px;color:var(--ink-2);font-family:inherit;cursor:pointer}
.bidsheet .set-gct.zz-ct.on{color:var(--accent);border-color:rgba(59,198,232,.6);background:rgba(59,198,232,.12)}
.bidsheet .set-grow.zz-else .set-gname{color:var(--ink-3);cursor:default}
.bidsheet .set-gct.zz-plain{min-width:38px;text-align:center}
.bidsheet .zz-gdel-gap{width:22px;flex:none}
.bidsheet .zz-foot{display:flex;align-items:center;gap:8px;padding:10px 2px 2px;border-top:1px solid rgba(42,49,58,.55);margin-top:8px}
.bidsheet .zz-foot .st{font-size:10.5px;color:var(--ink-3)}
.bidsheet .zz-foot .sp{flex:1}
.bidsheet .zz-foot .rtbtn:disabled{opacity:.45}
.bidsheet .set-disc.zz-fold{border-color:var(--edge-2)}
.bidsheet .set-disc.zz-fold .cv{color:var(--ink-2)}
.bidsheet .set-gname:not(.on){color:var(--ink)!important}
.bidsheet .zz-else .set-gname{color:var(--ink-3)!important}
.bidsheet .zz-add{padding:0 2px 4px}
@media (max-width:500px){.bidsheet .zz-row .lab{width:70px}}
.bidsheet .zz-who{display:flex;flex-wrap:wrap;gap:6px;padding:4px 6px 8px 49px}
`

// ---- today's window: number each sentence or control that goes or moves ----
const TODAY_MARKS = [
  ['.bidsheet-hd .dt', '1'],
  ['[data-testid="settings-days-hint"]', '2'],
  ['[data-testid="counter-add"]', '3'],
  ['[data-testid="event-add"]', '4'],
  ['[data-testid="sans-toggle"]', '5'],
  ['.bidsheet .gs-note', '5', 0],
  ['.bidsheet .gs-sec .gs-hint', '7', 0],
  ['[data-testid="roster-order-hint"]', '7'],
  ['[data-testid="roster-reset-order"]', '7'],
  ['.bidsheet .gs-sec .gs-hint', '8', 1],
  ['.bidsheet .gs-note', '10', 1],
  ['.bidsheet .gs-sec .gs-hint', '11', 2],
  ['[data-testid="who-wins-toggle"] .dh', '12'],
]
async function today(touch) {
  const [w, h] = touch ? [390, 1240] : [1536, 1000] // tall enough that the whole window shows, unrolled
  const { ctx, p } = await newPage(browser, w, h, touch)
  await signIn(p, 'admin')
  await (touch ? p.tap(q('settings-open')) : p.click(q('settings-open'))); await p.waitForTimeout(600)
  for (const [sel, n, nth] of TODAY_MARKS) await mark(p, sel, n, { num: true, nth: nth ?? 0 })
  await shot(p, `r6-settings-today-${touch ? 'phone' : 'desk'}`)
  await ctx.close()
}

// ---- the proposed window, built in place of today's contents ----
async function proposed(touch, who = false, tall = false) {
  const [w, h] = touch ? [390, tall ? 1240 : 844] : [1536, 860]
  const name = `r6-settings-new-${touch ? 'phone' : 'desk'}${who ? '-who' : touch && !tall ? '-fit' : ''}`
  const { ctx, p } = await newPage(browser, w, h, touch)
  await signIn(p, 'admin')
  // who stands under SXO on the grid today: two of them are drawn as Management (D1200: a Quals tick, standing first)
  const sxo = await p.evaluate(() => {
    let g = '', out = []
    for (const tr of document.querySelectorAll('tr[data-testid]')) {
      const t = tr.dataset.testid
      if (t.startsWith('group-')) g = t.slice(6)
      else if (t.startsWith('row-') && g === 'SXO') out.push(tr.querySelector('.cs')?.textContent.trim() || t.slice(4))
    }
    return out
  })
  const mgmt = sxo.slice(0, 2)
  await (touch ? p.tap(q('settings-open')) : p.click(q('settings-open'))); await p.waitForTimeout(600)
  await p.addStyleTag({ content: CSS })
  await p.evaluate(([LOCK, mgmt, who]) => {
    const s = document.querySelector('[data-testid="settings-sheet"]')
    const hd = s.querySelector('.bidsheet-hd'); hd.querySelector('.dt')?.remove()
    // today's counts, read from today's rows
    const ct = {}; for (const r of s.querySelectorAll('[data-testid^="grow-"]')) ct[r.dataset.testid.slice(5)] = +r.querySelector('.set-gct').textContent
    ct.SXO -= mgmt.length
    const offer = [...s.querySelectorAll('[data-testid^="gadd-"]')].map(b => b.textContent.trim())
    const row = (lab, ctl, cls = '') => `<div class="zz-row ${cls}"><span class="lab">${lab}</span><span class="ctl">${ctl}</span></div>`
    const grow = (id, name, kind, n, sw, opts = {}) => `<div class="set-grow ${opts.cls || ''}">` +
      (opts.nogrip ? '<span class="set-grip off"></span>' : '<span class="set-grip">⠿</span>') + sw +
      `<button class="set-gname">${name}</button>` + (kind ? `<span class="set-gkd">${kind}</span>` : '') +
      (opts.plain ? `<span class="set-gct zz-plain">${n}</span>` : `<button class="set-gct zz-ct${opts.open ? ' on' : ''}" data-zz="ct-${id}">${n} ${opts.open ? '▴' : '▾'}</button>`) +
      (opts.nodel ? '<span class="zz-gdel-gap"></span>' : '<button class="set-gdel">✕</button>') + '</div>' +
      (opts.open ? `<div class="zz-who gs-chips">${opts.open.map(c => `<span class="gs-chip">${c}</span>`).join('')}</div>` : '')
    const sw = c => `<span class="set-sw g-${c}"></span>`
    const html =
      `<div class="zz-new zz-rows">` +
        row('Year', '<button class="rtbtn" data-zz="cal">Calendar…</button><button class="rtbtn" data-zz="ev">Events…</button>', 'zz-r1') +
        row('Manning', (innerWidth < 500 ? ['Req P', 'Req W', 'Avail P', 'Avail W'] : ['Required P', 'Required W', 'Available P', 'Available W']).map((t, i) => `<button class="rtbtn" data-zz="mr${i}">${t}</button>`).join('') + '<button class="rtbtn" data-zz="ctr">＋ Counter</button>', 'zz-r2') +
        row('Event rows', '<span class="zz-step" data-zz="evr"><button class="rtbtn" disabled aria-label="One event row fewer">−</button><span class="n">2</span><button class="rtbtn" aria-label="One event row more">＋</button></span>', 'zz-r3') +
        row('Balances', `<button class="rtbtn" data-zz="lock">${LOCK}Lock balances</button>`, 'zz-r4') +
      `</div>` +
      `<div class="gs-sec" data-zz="gh">Groups</div>` +
      `<div class="set-grows">` +
        grow('mg', 'Management', 'qual', mgmt.length, '<button class="set-sw set-swbtn" style="background:#4FA3E0" aria-label="Pick a colour for Management"></button>', { cls: 'zz-mg', open: who ? mgmt : null }) +
        grow('SXO', 'SXO', 'cat', ct.SXO, sw('sxo')) + grow('IP', 'IP', 'cat', ct.IP, sw('ip')) + grow('OPSP', 'OPS P', 'cat', ct['OPS P'] ?? ct.OPSP ?? 8, sw('opsp')) +
        grow('IWSO', 'IWSO', 'cat', ct.IWSO, sw('iwso')) + grow('OPSW', 'OPS W', 'cat', ct['OPS W'] ?? ct.OPSW ?? 11, sw('opsw')) + grow('OCU', 'OCU', 'cat', ct.OCU, sw('ocu')) +
        grow('PERS', 'Personnel', 'cat', ct.Personnel ?? ct.PERS ?? 3, sw('pers')) +
        grow('OTHER', 'Everyone else', '', 0, '<span class="set-sw"></span>', { cls: 'zz-else', nogrip: true, nodel: true, plain: true }) +
      `</div>` +
      `<div class="gs-sec zz-addh">Add from Quals</div><div class="gs-chips zz-add">` + ['+ SANS', ...offer].map((t, i) => `<button class="tchip"${i === 0 ? ' data-zz="sans"' : ''}>${t}</button>`).join('') + `</div>` +
      `<button class="set-disc zz-fold" data-zz="who"><span class="cv">▸</span><span class="dl">Who wins when someone fits two</span><span class="dh">follows the page</span></button>` +
      `<div class="zz-foot" data-zz="foot"><button class="rtbtn set-order" disabled data-zz="reset">↺ Reset order</button><span class="st" data-zz="st">In default order</span><span class="sp"></span><button class="creset">Back to the standard groups</button></div>`
    ;[...s.children].forEach(c => { if (c !== hd) c.remove() })
    hd.insertAdjacentHTML('afterend', html)
  }, [LOCK, mgmt, who])
  await p.waitForTimeout(250)
  // on a desktop the window is a little wider, so the Manning row's four names and + Counter hold one line
  if (!touch) await p.evaluate(() => {
    const s = document.querySelector('[data-testid="settings-sheet"]'); const r = s.getBoundingClientRect()
    s.style.width = '680px'; s.style.maxWidth = '680px'; s.style.left = Math.round(r.left + r.width / 2 - 340) + 'px'; s.style.right = 'auto'; s.style.transform = 'none'
  })
  // on a phone the window stands in the middle, as tall as what is in it, up to the visible screen less 24px (D997)
  if (touch) await p.evaluate(() => {
    const s = document.querySelector('[data-testid="settings-sheet"]'); s.style.maxHeight = (innerHeight - 24) + 'px'; s.style.height = 'auto'; s.style.bottom = 'auto'
    const hgt = s.getBoundingClientRect().height; s.style.top = Math.max(12, Math.round((innerHeight - hgt) / 2)) + 'px'
  })
  await p.waitForTimeout(200)
  const fit = await p.evaluate(() => { const s = document.querySelector('[data-testid="settings-sheet"]'); return [Math.round(s.getBoundingClientRect().height), s.scrollHeight, s.clientHeight, innerHeight] })
  console.log(touch ? 'phone' : 'desk', 'window height, content, box, screen:', fit)
  const M = [
    ['.zz-r1 [data-zz="ev"]', '2'], ['.zz-r2 [data-zz="mr0"]', '3'], ['.zz-r3 [data-zz="evr"]', '4'], ['[data-zz="sans"]', '5'],
    ['.zz-r4 [data-zz="lock"]', '6'], ['[data-zz="foot"]', '7'], ['[data-zz="ct-SXO"]', '8'], ['.zz-mg', '9'],
    ['.zz-else', '10'], ['.zz-addh', '11'], ['[data-zz="who"]', '12'],
  ]
  if (who) {
    await mark(p, '.zz-who', 'who is in Management: a tap on its count', { right: true })
    await shot(p, name)
  } else {
    await shot(p, name + '-clean')
    for (const [sel, n] of M) await mark(p, sel, n, { num: true })
    await shot(p, name)
  }
  await unmark(p)
  await ctx.close()
}

await today(true); await today(false)
await proposed(true, false, true); await proposed(true); await proposed(false); await proposed(false, true)
await browser.close(); console.log('errors:', errs)
