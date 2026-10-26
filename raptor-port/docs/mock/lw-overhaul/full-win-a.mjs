// Pictures 6–9: a person's leave (D1141, D1148), the bid window (D1144, D1147, D1150, Q3, Q9), an entry already placed
// (D1150), the day panel (D1143, Q11). Each NEW window re-uses a real window of the app (its box, its rows, its chips) with
// its content re-lettered; the real one is pictured first as "today".
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, mark, unmark, q, esc, errs, OUT, gridTo } from './full-lib.mjs'
import { injectCss, LOCK_SVG, CLIP_SVG, lockDays } from './full-propose.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

import { H, fill } from './full-win-a-lib.mjs'

const LEAVE = [
  ['LL · Mon 19 – Wed 21 Jan', 'appr', `3 days · approved by Saber · <span style="white-space:nowrap">${CLIP_SVG} 1 document</span>`],
  ['LL · Mon 26 – Tue 27 Jan', 'wait', '2 days · placed Thu 8 Jan'],
  ['LL · Thu 29 Jan, AM', 'wait', '½ day · placed Thu 8 Jan'],
  ['LL · Mon 2 Feb', 'ref', '1 day · refused by Saber'],
]
function personHTML(member) {
  return H.hd('Ranger', member ? 'my leave' : 'his leave · tap one to see it on the grid') +
    `<div class="clist">` +
    `<div class="clegend zz-sec" style="margin:6px 2px 2px"><b>Balances</b></div>` +
    H.crow('LVE', '<span class="fb">14.5</span>', '20 given · 3 approved · 2.5 waiting', member ? '' : '<button class="cmv setbal">Set</button>') +
    H.crow('OIL', '<span class="fb">0</span>', 'tap to open the OIL tracker') +
    H.crow('Every balance', '<span class="fb">›</span>', 'CCL 0 · FCL 0 · CL 0 · PL 0') +
    `</div>` +
    H.row('Year', '<button class="pchip on zz-year">2026 and ahead ▾</button>', 'zz-yr') +
    `<div class="clist zz-list">` + LEAVE.map(([n, s, sub]) => H.crow(n, H.st(s), sub)).join('') + `</div>`
}

async function personScene(name, w, h, touch, who) {
  const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, who); await injectCss(p)
  await (touch ? p.tap(q('person-bane')) : p.click(q('person-bane'))); await p.waitForTimeout(500)
  await shot(p, `t-${name}`)
  await fill(p, personHTML(who === 'member'))
  await p.waitForTimeout(200); await shot(p, `p-${name}-clean`)
  const o = touch ? { num: true } : { below: false }
  await mark(p, '.zz-sec', touch ? '1' : '1 balances, as today', o)
  await mark(p, '.zz-yr', touch ? '2' : '2 NEW year picker (D1148)', o)
  await mark(p, '.zz-list', touch ? '3' : '3 NEW his leave, one line a request, its state', o)
  await shot(p, `p-${name}`)
  await unmark(p)
  // the year menu open: this year and ahead by default, past years kept
  await p.evaluate(() => {
    const b = document.querySelector('.zz-year'); const r = b.getBoundingClientRect()
    const m = document.createElement('div'); m.className = 'umlist zz-new zz-menu'
    Object.assign(m.style, { position: 'fixed', left: r.left + 'px', top: (r.bottom + 4) + 'px', zIndex: 99, minWidth: '190px' })
    m.innerHTML = '<div class="umlist-hd">Show</div><div class="umlist-body">' + ['2026 and ahead ✓', '2025', '2024'].map(t => `<button class="umrow"><span class="d">${t}</span></button>`).join('') + '</div>'
    document.body.appendChild(m)
  })
  await mark(p, '.zz-menu', touch ? '4' : '4 past years kept, picked here', o)
  await shot(p, `p-${name}-years`)
  await ctx.close()
}

// the bid window: balances on each leave button, the day's line (D1144), a document, Ack gone; for an admin's NEW entry
// the "Approve what I enter" tick (off each time it opens — Q9)
async function bidScene(name, w, h, touch, who, cell, kind) {
  const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, who); await injectCss(p)
  await gridTo(p, cell.slice(-10), cell.split('-')[1])
  const avp = await p.evaluate(date => { const h = document.querySelector(`[data-testid="head-${date}"]`).getBoundingClientRect(); const cx = h.left + h.width / 2; const tr = document.querySelector('[data-testid="fly-row-avail-p"]'); const td = [...tr.children].find(td => { const r = td.getBoundingClientRect(); return r.left <= cx && r.right >= cx }); return td ? parseFloat(td.textContent) : NaN }, cell.slice(-10))
  await (touch ? p.tap(q(cell)) : p.click(q(cell))); await p.waitForTimeout(600)
  await shot(p, `t-${name}`)
  await p.evaluate(([kind, CLIP, avp]) => {
    const sh = document.querySelector('[data-testid="bid-picker"]'); if (!sh) return
    const hd = sh.querySelector('.bidsheet-hd')
    const bal = { LL: '14.5', OL: '14.5', OIL: '0', CCL: '0', FCL: '0', PL: '0', EL: '0', CL: '0' }
    for (const [t, v] of Object.entries(bal)) { const c = sh.querySelector(`[data-testid="bid-${t}"]`); if (c) c.insertAdjacentHTML('beforeend', `<small class="zz-bal" style="margin-left:6px;opacity:.75;font-weight:600">${v}</small>`) }
    if (kind !== 'existing') {
      const line = document.createElement('div'); line.className = 'zz-new zz-day'
      line.style.cssText = 'margin:8px 2px 4px;font:500 13px/1.45 system-ui,sans-serif;color:#c9d1d9'
      line.innerHTML = `<div><b style="color:#e6edf3">Wed 28 Jan</b> · Avail P ${avp} → ${avp - 1} if you bid</div><div style="color:#8a96a3">No manning row turns amber or red</div>`
      hd.after(line)
    }
    // Ack gone (Q3): Approve · Refuse
    sh.querySelector('[data-testid="decide-ack"]')?.remove()
    if (kind === 'existing') {
      const placed = document.createElement('div'); placed.className = 'zz-new zz-placed'
      placed.style.cssText = 'margin:8px 2px 2px;font:500 12.5px/1.4 system-ui,sans-serif;color:#8a96a3'
      placed.textContent = 'Placed by Ranger · Thu 8 Jan, 09:12'
      hd.after(placed)
    }
    // a document on every entry (D1150), in the Inputs window's own look
    const rows = [...sh.querySelectorAll('.bidsheet-row')]
    const docRow = document.createElement('div'); docRow.className = 'bidsheet-row zz-new zz-doc'
    docRow.innerHTML = `<span class="lab">Document</span><button class="pchip" style="display:inline-flex;align-items:center;gap:6px">${CLIP}<span>Add a photo or PDF</span></button>`
    rows[rows.length - 1].after(docRow)
    if (kind === 'admin-new') {
      const which = rows.find(r => /which leave/i.test(r.textContent))
      const tick = document.createElement('div'); tick.className = 'bidsheet-row zz-new zz-tick'
      tick.innerHTML = `<span class="lab"></span><button class="pchip" style="display:inline-flex;align-items:center;gap:8px"><span style="width:14px;height:14px;border:1.5px solid #8a96a3;border-radius:3px;display:inline-block"></span>Approve what I enter</button>`
      which.before(tick)
    }
  }, [kind, CLIP_SVG, avp])
  await p.waitForTimeout(250); await shot(p, `p-${name}-clean`)
  const o = touch ? { num: true } : { right: true }
  let n = 1; const T = t => touch ? String(n++) : `${n++} ${t}`
  if (kind !== 'existing') await mark(p, '.zz-day', T('the day, before you bid (D1144)'), o)
  if (kind === 'existing') await mark(p, '.zz-placed', T('NEW who placed it, and when'), o)
  if (kind === 'existing') await mark(p, '.bidsheet-row:has([data-testid="decide-approve"])', T('Approve · Refuse — Ack gone (Q3)'), o)
  if (kind === 'admin-new') await mark(p, '.zz-tick', T('NEW Approve what I enter (D1147)'), o)
  if (kind !== 'existing') await mark(p, '[data-testid="bid-LL"]', T('what is left, on each button (D1144)'), touch ? o : { below: true })
  await mark(p, '.zz-doc', T('NEW a document (D1150)'), o)
  await shot(p, `p-${name}`)
  await ctx.close()
}

// an entry already placed and approved, as the member opens it: who placed it, who decided, its document, remarks
async function entryScene(name, w, h, touch) {
  const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, 'member'); await injectCss(p)
  await gridTo(p, '2026-01-19')
  await p.tap(q('cell-bane-2026-01-19')); await p.waitForTimeout(600)
  await shot(p, `t-${name}`)
  await fill(p, H.hd('Ranger', 'Mon 19 – Wed 21 Jan · LL') +
    `<div class="clist">` +
    H.crow('LL · 3 days', '<span class="c appr">Approved</span>', 'by Saber · Thu 8 Jan, 10:02') +
    H.crow('Placed', '', 'by Ranger · Thu 8 Jan, 09:12') + `</div>` +
    H.row('Document', `<span class="docchip zz-chipdoc" style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid #30363d;border-radius:8px;color:#c9d1d9;font:600 13px system-ui">${CLIP_SVG}leave-approval.pdf</span><button class="pchip">Add</button>`, 'zz-doc') +
    H.row('Remarks', '<button class="pchip" style="min-width:60%;text-align:left;opacity:.8">Family trip</button>') +
    `<div style="margin:10px 4px 2px;font:500 12.5px/1.45 system-ui,sans-serif;color:#8a96a3" class="zz-ask">An approved leave is changed by a scheduler.</div>`)
  await p.waitForTimeout(200); await shot(p, `p-${name}-clean`)
  await mark(p, '.clist', '1', { num: true }); await mark(p, '.zz-doc', '2', { num: true }); await mark(p, '.zz-ask', '3', { num: true })
  await shot(p, `p-${name}`)
  await ctx.close()
}

// the day panel from the foot (D1143): its figures, the manning rows stacked one a line (Q11), who is away with his
// leave's letters and state; a locked day says why first
async function dayScene(name, w, h, touch, date, locked) {
  const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, 'member'); await injectCss(p)
  await gridTo(p, touch ? '2026-01-21' : '2026-01-12')
  if (locked) { await gridTo(p, '2026-02-06'); await lockDays(p, ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13'], true) }
  const info = await p.evaluate(date => {
    const head = document.querySelector(`[data-testid="head-${date}"]`); const hx = head.getBoundingClientRect(); const cx = hx.left + hx.width / 2
    const at = id => { const tr = document.querySelector(`[data-testid="fly-row-${id}"]`); if (!tr) return '–'; const td = [...tr.children].find(td => { const r = td.getBoundingClientRect(); return r.left <= cx && r.right >= cx }); return td ? td.textContent.trim() : '–' }
    const away = [...document.querySelectorAll(`td[data-testid^="cell-"][data-testid$="-${date}"]`)].filter(td => td.textContent.trim() && td.querySelector('.c') && td.querySelector('.c').textContent.trim() !== 'PO').map(td => {
      const id = td.dataset.testid.slice(5, -11); const nm = document.querySelector(`[data-testid="person-${id}"] .cs`)?.textContent.trim() || id
      const c = td.querySelector('.c'); const st = /appr/.test(c.className) ? 'appr' : /ref/.test(c.className) ? 'ref' : /info/.test(c.className) ? 'info' : 'wait'
      return [nm, c.textContent.replace(/[<>]/g, '').trim(), st, /raptor/.test(c.className)]
    })
    return { p: at('avail-p'), w: at('avail-w'), away }
  }, date)
  console.log(name, JSON.stringify(info))
  await shot(p, `t-${name}`)
  const label = new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase().replace(',', '')
  await p.evaluate(([info, label, locked, LOCK, touch]) => {
    const pn = document.createElement('div'); pn.className = 'bidsheet zz-new zz-daypanel'
    Object.assign(pn.style, { position: 'fixed', left: touch ? '0' : '50%', right: touch ? '0' : 'auto', bottom: '0', top: 'auto', width: touch ? 'auto' : '560px', transform: touch ? 'none' : 'translateX(-50%)', maxHeight: '58vh', overflow: 'auto', zIndex: 60, borderRadius: '14px 14px 0 0' })
    const st = s => s === 'appr' ? '<span class="c appr" style="font-size:11px">approved</span>' : s === 'ref' ? '<span class="c ref" style="font-size:11px">refused</span>' : s === 'info' ? '' : '<span class="c zz-wait" style="font-size:11px">waiting</span>'
    const line = (a, b) => `<div style="display:grid;grid-template-columns:150px auto;gap:10px;padding:3px 2px;font:600 14px/1.4 system-ui,sans-serif;color:#e6edf3"><span style="color:#c9d1d9;font-weight:500">${a}</span><span>${b}</span></div>`
    pn.innerHTML = `<div style="width:40px;height:4px;border-radius:2px;background:#4a5562;margin:0 auto 8px"></div>
      <div class="bidsheet-hd" style="justify-content:space-between"><span class="who" style="font-size:20px">‹</span><span class="who" style="min-width:120px;text-align:center">${label}</span><span class="who" style="font-size:20px">›</span></div>
      ${locked ? `<div class="zz-lockline" style="display:flex;align-items:center;gap:8px;margin:8px 2px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.04);color:#c9d1d9;font:600 13.5px system-ui">${LOCK.replace('class="zz-lockg"', 'class="zz-lockg" style="display:inline-block;margin:0"')}<span>Locked: Exercise week. No leave changes.</span></div>` : ''}
      <div class="zz-figs" style="margin:6px 0 8px">${line('Available P', info.p)}${line('Available W', info.w)}<div style="padding:3px 2px;font:500 13px system-ui;color:#8a96a3">No manning row is short</div></div>
      <div style="font:600 11px system-ui;letter-spacing:.12em;color:#8a96a3;margin:6px 2px">AWAY · ${info.away.length}</div>
      <div class="zz-away">${info.away.map(([n, code, s, raptor]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 2px;border-top:1px solid #26303a;color:#e6edf3;font:600 14.5px system-ui"><span>${n}</span><span style="display:flex;gap:8px;align-items:center"><span class="c ${s === 'appr' ? 'appr' : s === 'ref' ? 'ref' : s === 'info' ? 'info' : 'zz-wait'}${raptor ? ' raptor' : ''}" style="font-size:11px">${code}</span>${st(s)}</span></div>`).join('') || '<div style="padding:8px 2px;color:#8a96a3;font:500 13.5px system-ui">Nobody away</div>'}</div>`
    ;(document.querySelector('#page-leavewar') || document.body).appendChild(pn)
  }, [info, label, locked, LOCK_SVG, touch])
  await mark(p, `[data-testid="head-${date}"]`, '1', { num: true })
  await p.waitForTimeout(200); await shot(p, `p-${name}-clean`)
  if (locked) await mark(p, '.zz-lockline', '2', { num: true })
  await mark(p, '.zz-figs', locked ? '3' : '2', { num: true })
  await shot(p, `p-${name}`)
  await ctx.close()
}

await personScene('w6-phone-member', 390, 844, true, 'member')
await personScene('w6-desk-admin', 1536, 860, false, 'admin')
await bidScene('w7-phone-member', 390, 844, true, 'member', 'cell-bane-2026-01-28', 'member-new')
await bidScene('w7-desk-admin-waiting', 1536, 860, false, 'admin', 'cell-bane-2026-01-26', 'existing')
await bidScene('w7-desk-admin-new', 1536, 860, false, 'admin', 'cell-snap-2026-01-28', 'admin-new')
await entryScene('w8-phone-member', 390, 844, true)
await dayScene('w9-phone-day', 390, 844, true, '2026-01-27', false)
await dayScene('w9-desk-day', 1536, 860, false, '2026-01-27', false)
await dayScene('w9-phone-locked', 390, 844, true, '2026-02-10', true)
await browser.close(); console.log('errors:', errs)
