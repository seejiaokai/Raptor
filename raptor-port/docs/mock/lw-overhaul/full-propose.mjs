// The proposal's transforms on the REAL page (the full mock-up, §9 of the design note). Each moves, clones or re-letters the
// app's own nodes; a NEW part is built from the app's own classes (.fchip, .bidsheet, .c …) and its few new styles are in
// NEW_CSS, said to him as design decisions. Nothing here is built into the app.

export const LOCK_SVG = '<svg class="zz-lockg" viewBox="0 0 10 12" width="9" height="11" aria-hidden="true"><rect x="1.2" y="5.2" width="7.6" height="5.8" rx="1.3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3 5.2V3.6a2 2 0 0 1 4 0v1.6" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>'
export const CLIP_SVG = '<svg viewBox="0 0 12 14" width="11" height="13" aria-hidden="true"><path d="M8.6 4.2 4.4 8.4a1.3 1.3 0 0 0 1.8 1.8l4.6-4.6a2.6 2.6 0 0 0-3.7-3.7L2.5 6.5a3.9 3.9 0 0 0 5.5 5.5l3.4-3.4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'

export const NEW_CSS = `
#page-leavewar .c.zz-wait{box-shadow:none!important;background:transparent!important;color:#f1f4f7!important;outline:1px dashed rgba(241,244,247,.6);outline-offset:-1px}
#page-leavewar tr[data-testid^="row-"] > td{height:30px}
#page-leavewar .zz-halves{display:flex;flex-direction:column;justify-content:space-between;height:100%;min-height:28px}
#page-leavewar .zz-hf{display:flex;align-items:center;justify-content:center;height:50%}
#page-leavewar .c.zz-half{font-size:9px;line-height:12px;padding:0 3px;min-width:18px;border-radius:3px;background-image:none}
#page-leavewar .c.zz-half::after{display:none}
#page-leavewar th.zz-locked{color:#8a96a3}
#page-leavewar .zz-lockg{display:block;margin:1px auto 0;color:#8a96a3}
#page-leavewar .zz-count{display:inline-block;margin-left:6px;min-width:18px;padding:0 5px;border-radius:9px;background:rgba(59,198,232,.18);color:#9FDCEE;font-weight:800;font-size:11px;line-height:18px;text-align:center}
#page-leavewar .fchip .zz-lockg{display:inline-block;margin:0 5px -1px 0;color:currentColor}
`
export const injectCss = p => p.evaluate(css => { const s = document.createElement('style'); s.id = 'zz-css'; s.textContent = css; document.head.appendChild(s) }, NEW_CSS)

// Read every waiting request (no decision, Ack counted as waiting) as runs: one person, one code, consecutive days.
export const waitingRuns = p => p.evaluate(() => {
  const runs = []
  for (const tr of document.querySelectorAll('#page-leavewar tr[data-testid^="row-"]')) {
    const id = tr.dataset.testid.slice(4), name = tr.querySelector('.cs')?.textContent.trim() || id
    let cur = null
    for (const td of tr.querySelectorAll('td[data-testid^="cell-"]')) {
      const c = td.querySelector('.c'), date = td.dataset.testid.slice(-10)
      const waiting = c && !/\b(appr|ref|info|sc)\b/.test(c.className) && c.textContent.trim() && c.textContent.trim() !== 'PO'
      const code = waiting ? c.textContent.replace(/[<>*]/g, '').trim() : null
      const half = c && /\bam\b/.test(c.className) ? 'AM' : c && /\bpm\b/.test(c.className) ? 'PM' : ''
      if (waiting && cur && cur.code === code && !half && !cur.half && (new Date(date) - new Date(cur.to)) / 864e5 === 1) { cur.to = date; cur.days++ }
      else if (waiting) { cur = { id, name, code, from: date, to: date, days: half ? 0.5 : 1, half }; runs.push(cur) }
      else cur = null
    }
  }
  return runs
})

// The cells: AM top half / PM bottom half (D1145), two entries stacked (D1146), a third behind "+1", waiting dashed (Q2 A),
// Ack gone (Q3), rows grown so a half's letters read (Q4 A). `extra` adds what the cell's "+n" hides today.
export const proposeCells = (p, extra = {}) => p.evaluate(extra => {
  for (const td of document.querySelectorAll('#page-leavewar td[data-testid^="cell-"]')) {
    const chips = [...td.querySelectorAll(':scope > .c')]; if (!chips.length) continue
    const id = td.dataset.testid
    let entries = chips.map(c => ({ code: c.textContent.replace(/[<>]/g, '').trim(), cls: c.className, half: /\bam\b/.test(c.className) ? 'am' : /\bpm\b/.test(c.className) ? 'pm' : '' }))
    if (extra[id]) entries = extra[id]
    const mk = e => {
      const s = document.createElement('span')
      const waiting = !/\b(appr|ref|info|sc)\b/.test(e.cls)
      s.className = e.cls.replace(/\b(am|pm|tbc)\b/g, '') + (waiting ? ' zz-wait' : '')
      s.textContent = e.code; return s
    }
    const stacked = entries.length > 1 || entries.some(e => e.half)
    td.querySelector(':scope > .mk.more')?.remove()
    chips.forEach(c => c.remove())
    if (!stacked) { td.prepend(mk(entries[0])); continue }
    const am = entries.find(e => e.half === 'am') || entries.find(e => !e.half)
    const pm = entries.find(e => e.half === 'pm') || entries.filter(e => !e.half && e !== am)[0]
    const box = document.createElement('span'); box.className = 'zz-halves'
    for (const e of [am, pm]) { const h = document.createElement('span'); h.className = 'zz-hf'; if (e) { const c = mk(e); c.classList.add('zz-half'); h.appendChild(c) } box.appendChild(h) }
    td.prepend(box)
    if (entries.length > 2) { const m = document.createElement('span'); m.className = 'mk more'; m.textContent = '+' + (entries.length - 2); td.appendChild(m) }
    td.classList.add('mkd')
  }
}, extra)

// The stage row → Approvals (admin) · Lock dates · under-manned · Legend, and "My leave" (D1141): the free end on a desktop,
// a third line on a phone.
export const proposeTop = (p, o) => p.evaluate(([o, LOCK]) => {
  const row = document.querySelector('#page-leavewar .filters'); if (!row) return 'no row'
  for (const sel of ['[data-testid="stage-now"]', '[data-testid="stage-advance"]', '[data-testid="stage-back"]', '[data-testid="bid-window"]']) row.querySelector(sel)?.remove()
  ;[...row.querySelectorAll('.lab')].filter(l => /stage|bidding on/i.test(l.textContent)).forEach(l => l.remove())
  const under = row.querySelector('[data-testid="undermanned"]')
  const before = row.querySelector('.lab') && /under/i.test(row.querySelector('.lab').textContent) ? row.querySelector('.lab') : under
  const chip = (html, cls = '') => { const b = document.createElement('button'); b.className = 'fchip zz-new ' + cls; b.innerHTML = html; return b }
  if (o.admin) { const a = chip(`Approvals<span class="zz-count">${o.waiting}</span>`, 'zz-appr'); row.insertBefore(a, before) }
  const l = chip(`${LOCK}${o.phone ? o.locks + ' locked' : 'Lock dates · ' + o.locks}`, 'zz-lock'); row.insertBefore(l, before)
  if (o.admin && !o.phone) { l.style.marginRight = '12px' }
  const ml = o.myLeave
  if (!o.phone) {
    const m = chip(`<span style="opacity:.7;letter-spacing:.1em;font-size:11px">MY LEAVE</span>&nbsp; <b>LVE ${ml.lve}</b> · OIL ${ml.oil} · ${ml.waiting} waiting · next ${ml.next} ›`, 'zz-my')
    m.style.marginLeft = 'auto'; row.appendChild(m)
  } else {
    const strip = document.createElement('div'); strip.className = 'zz-new zz-strip'
    strip.style.cssText = 'display:flex;align-items:center;padding:6px 12px 8px;border-bottom:1px solid #26303a'
    const b = chip(`<span style="font:600 11px/1 system-ui;letter-spacing:.12em;opacity:.7">MY LEAVE</span><span><b>LVE ${ml.lve}</b> · OIL ${ml.oil} · ${ml.waiting} waiting · next ${ml.nextShort}</span><span style="margin-left:auto;opacity:.8">›</span>`, 'zz-my')
    b.style.cssText = 'width:100%;display:flex;align-items:center;gap:10px;justify-content:flex-start'
    strip.appendChild(b); row.after(strip)
  }
  return 'ok'
}, [o, LOCK_SVG])

export const renameFigures = p => p.evaluate(() => {
  const b = document.querySelector('[data-testid="figures-toggle"]'); if (b) b.textContent = b.textContent.replace(/figures/i, 'BALANCES')
})

// a lock on these dates' headings (everyone sees it); for a member the days dim as today's out-of-window days do
export const lockDays = (p, dates, member) => p.evaluate(([dates, member, LOCK]) => {
  for (const d of dates) {
    const th = document.querySelector(`[data-testid="head-${d}"]`); if (th && !th.querySelector('.zz-lockg')) { th.classList.add('zz-locked'); th.insertAdjacentHTML('beforeend', LOCK) }
    if (member) document.querySelectorAll(`td[data-testid$="-${d}"][data-testid^="cell-"]`).forEach(td => td.classList.add('locked'))
  }
}, [dates, member, LOCK_SVG])

// Management (Q12 A): a group made from a Quals column, standing first; its people move under it (they still count in
// their own seat — a group never moves a count)
export const management = (p, names) => p.evaluate(names => {
  // every copy of the grid's rows moves alike, by position: the year's table (names, days), the desktop's copy of the
  // balance columns, the phone's frozen band (names) — found from the copy that carries the names
  const tables = [...document.querySelectorAll('#page-leavewar .mx-outer table')]
  const named = tables.find(t => t.querySelector('tr.grp .gname')); if (!named) return 0
  const nrows = [...named.querySelectorAll('tr')]
  const sxoAt = nrows.findIndex(tr => tr.classList.contains('grp')) // the first group (SXO): every copy's rows line up from it
  const at = names.map(n => -sxoAt + nrows.findIndex(tr => !tr.classList.contains('grp') && tr.querySelector('.cs')?.textContent.trim() === n))
  let done = 0
  for (const t of tables) {
    const rows = [...t.querySelectorAll('tr')]; const s0 = rows.findIndex(tr => tr.classList.contains('grp')); const sxo = rows[s0]; if (!sxo) continue
    const g = sxo.cloneNode(true); g.removeAttribute('data-testid'); g.classList.add('zz-new', 'zz-mgmt')
    const gn = g.querySelector('.gname'); if (gn) gn.textContent = 'MANAGEMENT'
    const gc = g.querySelector('.gcount'); if (gc) gc.textContent = '· ' + names.length
    const sw = g.querySelector('.gsw'); if (sw) sw.style.background = '#d7dde4'
    sxo.before(g)
    let last = g
    for (const i of at) { const r = rows[s0 + i]; if (r) { last.after(r); last = r; done++ } }
    const c = sxo.querySelector('.gcount'); if (c) c.textContent = '· ' + (parseInt(c.textContent.replace(/[^0-9]/g, '')) - names.length)
  }
  return done
}, names)

export const figOf = (p, id) => p.evaluate(id => document.querySelector(`[data-testid="bal-${id}"] .fb`)?.textContent.trim(), id)
