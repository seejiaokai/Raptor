// The final set's ONE set of choices (D1206, the consistency pass of 22 Oct 26). The three scripts full-r7-page.mjs,
// full-r7-decide.mjs and full-r7-person.mjs each draw their own windows and cells; every picture then goes through
// oneStage(), so the parts every picture shares are drawn ONE way:
//   - the top rows (a member's: My leave in line 1's right half, Manning folded — Q9's recommended answer; an admin's
//     phone: My leave its third line), "● 3 new" on My leave / Approvals until he opens it (Q1),
//   - "Balances" a button like "Manning", ▸ shut / ▾ open (D1185, as full-r4b.mjs drew it),
//   - the zoom pair as magnifiers (Q12's recommended answer),
//   - the Required / Available pairs tinted faintly, pilots olive, WSOs green (D1194),
//   - ONE demo setup for manning: Required P 24 on every weekday that is not a public holiday (INVENTED — the demo
//     squadron types no Required figure), Available P amber under Required + 2 and red under Required + 0 (D1191,
//     D1202), and "Under N days" counting the red days (Q7's recommended answer): measured, only Tue 27 Jan (23), so 1,
//   - Management drawn first, Reaper and Anvil in it (D1200; the Settings window counts the same 2, SXO 10),
//   - the events' short forms in the Event row (D1155, D645): SP Fri 23 Jan, EX Mon 9 – Fri 13 Feb, PH Good Friday
//     Fri 3 Apr (the app already prints PH on 1 Jan, 17–18 Feb, 9 Aug, 25 Dec),
//   - Required P / W renamable (D1193) drawn for an admin only; a member sees no rename cue.
// mk() places every pink mark as a small numbered circle where it covers no content. Nothing here is built.
export const UNDER = 1
export const MGMT = ['Reaper', 'Anvil']
const CHEV = '<svg viewBox="0 0 12 8" width="1em" height=".7em" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="#57c97a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const DOT = '<i class="zd" aria-hidden="true"></i>'
const MAG = s => `<svg viewBox="0 0 18 18" width="15" height="15" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M11.4 11.4 16 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5 7.5h5${s === '+' ? 'M7.5 5v5' : ''}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`

export const ONE_CSS = `
#page-leavewar .zrow{display:flex;align-items:center;gap:8px;width:100%;white-space:nowrap}
#page-leavewar .zsp{flex:1}
#page-leavewar .zlab{font:600 11px system-ui;letter-spacing:.14em;color:#8a96a3}
#page-leavewar .zchip{display:inline-flex;align-items:center;gap:6px;height:var(--ch);padding:0 10px;border-radius:7px;border:1px solid #2a323c;background:#12161b;color:#e6edf3;font:600 var(--fs) system-ui;white-space:nowrap}
#page-leavewar .zchip b{font-weight:700;color:#fff}
#page-leavewar .zchip b.amb{color:#F2C879}
#page-leavewar .zchip .n{font-style:normal;font:700 calc(var(--fs) - 1px) system-ui;color:#5fd0e6;background:#16303b;border-radius:9px;padding:1px 7px}
#page-leavewar .zchip.pick{border-color:rgba(87,201,122,.55);background:#0f1d15;font-weight:700;height:28px;font-size:var(--pf)}
#page-leavewar .zchip.sq{width:28px;height:28px;justify-content:center;padding:0;font-size:18px;font-weight:400;color:#c9d1d9}
#page-leavewar .zchip.open{border-color:rgba(87,201,122,.7);background:#0f1d15}#page-leavewar .zchip.open b{color:#8FE0A8}
#page-leavewar .zchip.open em{font-style:normal;color:#8a96a3;font-weight:600}
#page-leavewar .zchip.shut{border-color:#4a5560;color:#c9d1d9}
#page-leavewar .zml{display:flex;align-items:center;gap:5px;height:var(--mh);padding:0 12px;border-radius:8px;border:1px solid #2a323c;background:#1a1f26;color:#e6edf3;font:600 var(--fs) system-ui;white-space:nowrap}
#page-leavewar .zml b{font-weight:800}#page-leavewar .zml .zlab{margin-right:4px}
#page-leavewar .zrow>.zml:only-child{flex:1}
#page-leavewar .zrow3{display:flex;align-items:center;padding:6px 10px;border-bottom:1px solid #2a313a}
#page-leavewar .zd{display:inline-block;flex:none;width:7px;height:7px;border-radius:50%;background:#3bc6e8;font-style:normal}
#page-leavewar .zd.off{background:transparent}
#page-leavewar .znw{display:inline-flex;align-items:center;gap:4px;color:#5fd0e6;font:700 calc(var(--fs) - 1px) system-ui;margin-left:2px}
#page-leavewar .zml2{flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:36px;padding:0 8px 0 10px;border-radius:8px;border:1px solid #2a323c;background:#1a1f26;color:#e6edf3;font-family:system-ui}
#page-leavewar .zml2 .st{display:flex;flex-direction:column;justify-content:center;gap:3px;min-width:0;flex:1}
#page-leavewar .zml2 .a{display:flex;align-items:center;gap:6px;font:700 9px/1 system-ui;letter-spacing:.12em;color:#8a96a3}
#page-leavewar .zml2 .a .znw{font:700 9.5px/1 system-ui;letter-spacing:0;gap:3px;margin-left:auto}
#page-leavewar .zml2 .a .zd{width:6px;height:6px}
#page-leavewar .zml2 .a .nx{letter-spacing:0;font:600 10px/1 system-ui;color:#c9d1d9;margin-left:-2px}
#page-leavewar .zml2 .b{font:600 11.5px/1 system-ui;white-space:nowrap}
#page-leavewar .zml2 .b b{font-weight:800}
#page-leavewar .zml2 .chev{color:#9aa5b1;font:600 13px system-ui}
/* "Balances" a button like "Manning" (D1185; the look full-r4b.mjs drew) */
#page-leavewar .figbar.zz-bal{display:inline-flex!important;align-items:center;gap:6px;width:auto!important;height:22px;margin:3px 6px;padding:0 10px!important;border-radius:6px;border:1px solid #3a4652!important;background:#141a21!important;color:#e6edf3!important;font:700 12px/1 system-ui!important;letter-spacing:.01em!important;text-transform:none!important;box-sizing:border-box}
#page-leavewar .figbar.zz-bal i{font-style:normal;color:#9aa5b1;font-size:10px}
/* the Required / Available pairs tinted (D1194): pilots olive, WSOs green */
#page-leavewar tr.zz-tp > td{background-image:linear-gradient(rgba(150,140,50,.15),rgba(150,140,50,.15))!important;box-shadow:none!important}
#page-leavewar tr.zz-tw > td{background-image:linear-gradient(rgba(40,160,110,.15),rgba(40,160,110,.15))!important;box-shadow:none!important}
/* Available P at its amber and red points (D1191, D1202), the figure in the colour */
#page-leavewar td.zz-amb{color:#F2B84B!important;font-weight:800}
#page-leavewar td.zz-red{color:#FF7A82!important;font-weight:800}
`

// the top rows: every picture's, one way
function topRows(o) {
  const nw = n => `<span class="znw" data-zk="${n === 'ml' ? 'mlnew' : 'apnew'}">${DOT}3 new</span>`
  const open = o.closed ? '<span class="zchip shut" data-zk="open">Bidding closed</span>'
    : `<span class="zchip open" data-zk="open"><span>${o.phone ? 'Open' : 'Open for bidding'}</span><b>1 Jan – 31 Mar</b>${o.more ? `<em>+${o.more}</em>` : ''}</span>`
  const day = UNDER === 1 ? 'day' : 'days'
  const appr = `<span class="zchip" data-zk="appr">Approvals <i class="n">15</i>${o.apNew ? nw('ap') : ''}</span>`
  const f = o.member ? { lve: '14.5', oil: '0', waiting: 2, next: '19 Jan' } : { lve: '17', oil: '0', waiting: 0, next: '30 Jan' }
  Object.assign(f, o.fig || {})
  if (o.phone) {
    const ml2 = `<span class="zml2" data-zk="ml"><span class="st"><span class="a">MY LEAVE<span class="nx">· next ${f.next}</span>${o.mlNew ? nw('ml') : ''}</span><span class="b"><b>LVE ${f.lve}</b> · OIL ${f.oil} · ${f.waiting} waiting</span></span><span class="chev">›</span></span>`
    const r1 = `<div class="zrow"><span class="zlab" data-zk="viewlab">VIEW</span><span class="zchip pick" data-zk="pick">JAN - DEC 26 ${CHEV}</span>${o.member ? ml2 : `<span class="zchip sq">+</span>${appr}<span class="zsp"></span>`}</div>`
    const r2 = `<div class="zrow">${open}<span class="zchip" data-zk="under">Under <b class="amb">${UNDER}</b> ${day}</span><span class="zsp"></span><span class="zchip" data-zk="legend">Legend</span></div>`
    const r3 = o.member ? '' : `<div class="zrow"><span class="zml" data-zk="ml"><span class="zlab">MY LEAVE</span><b>LVE ${f.lve}</b> · OIL ${f.oil} · ${f.waiting} waiting · next ${f.next}<span class="zsp"></span>›</span></div>`
    return [r1, r2, r3]
  }
  const r1 = `<div class="zrow"><span class="zlab" data-zk="viewlab">VIEW</span><span class="zchip pick" data-zk="pick">JAN - DEC 26 ${CHEV}</span>${o.member ? '' : `<span class="zchip">+ New</span>${appr}`}</div>`
  const r2 = `<div class="zrow">${open}<span class="zlab">UNDER-MANNED</span><span class="zchip" data-zk="under"><b class="amb">${UNDER}</b> ${day}</span><span class="zchip" data-zk="legend">Legend</span><span class="zsp"></span><span class="zml" data-zk="ml"><span class="zlab">MY LEAVE</span><b>LVE ${f.lve}</b> · OIL ${f.oil} · ${f.waiting} waiting · next ${f.next} ›</span></div>`
  return [r1, r2, '']
}

// a member's Manning opens folded (Q9) — through the app's own button, before anything is drawn over the grid
export async function oneFold(p) {
  const t = p.locator('[data-testid="counts-toggle"]')
  if (await t.count() && await t.getAttribute('aria-expanded') === 'true') { await t.click(); await p.waitForTimeout(400) }
}

// o: { phone, member, mlNew, apNew, closed, more, fig }
export async function oneStage(p, o) {
  if (o.member) await oneFold(p)
  const r = await p.evaluate(([css, rows, o, MAGM, MAGP, MGMT]) => {
    document.getElementById('oneCss')?.remove()
    const st = document.createElement('style'); st.id = 'oneCss'; st.textContent = css; document.head.appendChild(st)
    const pg = document.querySelector('#page-leavewar'), top = pg.querySelector('.topbar'), fil = pg.querySelector('.filters')
    pg.style.setProperty('--ch', o.phone ? '23px' : '32px'); pg.style.setProperty('--fs', o.phone ? '11.2px' : '13.5px')
    pg.style.setProperty('--pf', o.phone ? '12.6px' : '13.5px'); pg.style.setProperty('--mh', o.phone ? '25px' : '34px')
    // the top rows; an open window drawn inside them is kept
    const keep = [...top.querySelectorAll('.bidsheet'), ...fil.querySelectorAll('.bidsheet')]
    top.innerHTML = rows[0]; fil.innerHTML = rows[1]; keep.forEach(k => fil.appendChild(k))
    pg.querySelectorAll('.zrow3, .zz-strip').forEach(n => n.remove())
    if (rows[2]) { const r3 = document.createElement('div'); r3.className = 'zrow3'; r3.innerHTML = rows[2]; fil.after(r3) }
    // "Balances" a button (D1185)
    const fb = pg.querySelector('[data-testid="figures-toggle"]')
    if (fb) { fb.classList.remove('r7-bal', 'zz-btn'); fb.classList.add('zz-bal'); fb.innerHTML = `<i>${fb.getAttribute('aria-expanded') === 'true' ? '▾' : '▸'}</i>Balances` }
    // the zoom pair as magnifiers (Q12)
    const zo = pg.querySelector('[data-testid="lw-zoom-out"]'), zi = pg.querySelector('[data-testid="lw-zoom-in"]')
    if (zo) zo.innerHTML = MAGM; if (zi) zi.innerHTML = MAGP
    // the pairs tinted (D1194), one rule
    for (const [t, c] of [['req-p', 'zz-tp'], ['avail-p', 'zz-tp'], ['req-w', 'zz-tw'], ['avail-w', 'zz-tw']]) {
      const tr = pg.querySelector(`[data-testid="fly-row-${t}"]`); if (!tr) continue
      tr.classList.remove('r7-tp', 'r7-tw', 'zpair-p', 'zpair-w'); tr.classList.add(c)
    }
    // the events' short forms (D1155, D645); Good Friday a public holiday
    const EV = { '2026-01-23': ['SP', 'Sqn sports day'], '2026-04-03': ['PH', 'Good Friday'] }
    for (const d of ['09', '10', '11', '12', '13']) EV['2026-02-' + d] = ['EX', 'EX SAMPLE SHIELD']
    for (const [d, [s, t]] of Object.entries(EV)) {
      const c = pg.querySelector(`[data-testid="event-0-${d}"]`); if (!c) continue
      c.className = 'ev has tap editable'; c.textContent = s; c.title = t; c.style.minWidth = '2ch'
    }
    // Required P 24 on every weekday not a public holiday (invented); Available P amber under 26, red under 24
    const ph = new Set([...pg.querySelectorAll('[data-testid^="event-"]')].filter(c => c.textContent.trim() === 'PH').map(c => c.dataset.testid.slice(-10)))
    let red = 0
    for (const td of pg.querySelectorAll('[data-testid^="req-p-2026"]')) {
      const iso = td.dataset.testid.slice(-10), wd = new Date(iso + 'T12:00:00').getDay()
      if (wd === 0 || wd === 6 || ph.has(iso)) continue
      td.textContent = '24'; td.classList.remove('none')
      const a = pg.querySelector(`[data-testid="avail-p-${iso}"]`); if (!a) continue
      a.classList.remove('under', 'r7-amb', 'r7-red', 'zz-amb', 'zz-red'); a.style.color = ''
      const v = parseFloat(a.textContent); if (isNaN(v)) continue
      if (v < 24) { a.classList.add('zz-red'); red++ } else if (v < 26) a.classList.add('zz-amb')
    }
    // Management first (D1200): Reaper and Anvil, every copy of the grid's rows moved alike
    let moved = 0
    if (!pg.querySelector('.zz-mgmt')) {
      const tables = [...pg.querySelectorAll('.mx-outer table')]
      const named = tables.find(t => t.querySelector('tr.grp .gname'))
      if (named) {
        const nrows = [...named.querySelectorAll('tr')]
        const sxoAt = nrows.findIndex(tr => tr.classList.contains('grp'))
        const at = MGMT.map(n => -sxoAt + nrows.findIndex(tr => !tr.classList.contains('grp') && tr.querySelector('.cs')?.textContent.trim() === n))
        for (const t of tables) {
          const rs = [...t.querySelectorAll('tr')]; const s0 = rs.findIndex(tr => tr.classList.contains('grp')); const sxo = rs[s0]; if (!sxo) continue
          const g = sxo.cloneNode(true); g.removeAttribute('data-testid'); g.classList.add('zz-mgmt'); g.dataset.zk = 'mgmt'
          const gn = g.querySelector('.gname'); if (gn) gn.textContent = 'Management'
          const gc = g.querySelector('.gcount'); if (gc) gc.textContent = '· ' + MGMT.length
          const sw = g.querySelector('.gsw'); if (sw) sw.style.background = '#4FA3E0'
          sxo.before(g)
          let last = g
          for (const i of at) { const r = rs[s0 + i]; if (r && i > 0) { last.after(r); last = r; moved++ } }
          const c = sxo.querySelector('.gcount'); if (c) c.textContent = '· ' + (parseInt(c.textContent.replace(/[^0-9]/g, '')) - MGMT.length)
        }
      }
    }
    // Required P / W renamable (D1193): drawn for an admin only; a member sees no rename cue on any of the four
    for (const t of ['req-p', 'req-w', 'avail-p', 'avail-w']) {
      const w = pg.querySelector(`[data-testid="fly-row-${t}"] td.who`); if (!w) continue
      const b = w.querySelector('button.flyname')
      if (o.member) { if (b) { while (b.firstChild) w.insertBefore(b.firstChild, b); b.remove() } }
      else if (!b) { const nb = document.createElement('button'); nb.type = 'button'; nb.className = 'flyname'; nb.dataset.zk = 'rn-' + t; while (w.firstChild) nb.appendChild(w.firstChild); w.appendChild(nb) }
    }
    return { red, moved, over: [...pg.querySelectorAll('.zrow, .zml2 .b, .zml2 .a')].map(r => r.scrollWidth - r.clientWidth).filter(x => x > 0) }
  }, [ONE_CSS, topRows(o), o, MAG('-'), MAG('+'), MGMT])
  if (r.over.length) console.warn('TOP ROWS OVERFLOW', r.over)
  await p.waitForTimeout(200)
  return r
}

// A pink mark: the thing outlined (unless ring:false), and a small circle — "1" or "Q9" — set beside it where it covers
// no content (text, a cell's box, a puck, another mark). The places tried, in order: o.prefer, then the corners and sides.
export async function mk(p, sel, label, o = {}) {
  const ok = await p.evaluate(([sel, label, o]) => {
    const el = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth })[o.nth || 0]
    if (!el) return false
    if (o.ring !== false) { el.classList.add('zz-marked'); el.style.outline = '3px solid #ff2d95'; el.style.outlineOffset = (o.off ?? 2) + 'px' }
    const r = el.getBoundingClientRect()
    const t = document.createElement('div'); t.className = 'zz-tag'; t.textContent = label
    Object.assign(t.style, { position: 'fixed', zIndex: 2147483647, background: '#ff2d95', color: '#fff', font: '800 13px/1 system-ui,sans-serif', padding: '4px 6px', borderRadius: '11px', minWidth: '12px', textAlign: 'center', boxShadow: '0 0 0 2px #0b0d10', whiteSpace: 'nowrap', pointerEvents: 'none', left: '-200px', top: '-200px' })
    document.body.appendChild(t)
    const w = t.offsetWidth, h = t.offsetHeight, g = (o.off ?? 2) + 3
    const midY = r.top + r.height / 2 - h / 2, midX = r.left + r.width / 2 - w / 2
    const C = {
      ne: [r.right - 8, r.top - h + 6], nw: [r.left - w + 8, r.top - h + 6], e: [r.right + g + 2, midY], w: [r.left - w - g - 2, midY],
      se: [r.right - 8, r.bottom - 6], sw: [r.left - w + 8, r.bottom - 6], n: [midX, r.top - h - g], s: [midX, r.bottom + g],
      nr: [r.right - w, r.top - h - g], nl: [r.left, r.top - h - g], sr: [r.right - w, r.bottom + g], sl: [r.left, r.bottom + g],
      e2: [r.right + g + 26, midY], w2: [r.left - w - g - 26, midY], n2: [midX, r.top - h - g - 22], s2: [midX, r.bottom + g + 22],
      in: [r.right - w - 5, r.top + 4], inb: [r.right - w - 5, r.bottom - h - 4],
    }
    const order = [...(o.prefer || []), 'ne', 'e', 'nw', 'w', 'se', 'sw', 'nr', 'nl', 'sr', 'sl', 'n', 's', 'e2', 'w2', 'n2', 's2', 'in', 'inb']
    const BOX = '.zf,.r7-cb,.zkb,.r7-kb,.cs,.catchip,.c,.zz-tag,.zd,svg,img,input,.zmb,.mb,.apall,.ap,.rf,.dchip,.pchip,.rtbtn,.zchip,.zml,.zml2,.tchip,.zlb,.r7-fig,button'
    const content = (x, y) => {
      const hits = document.elementsFromPoint(x, y).filter(e => e !== t && !t.contains(e))
      const e = hits[0]; if (!e) return false
      // the marked thing's own edge may be overlapped by its circle; only its words may not
      if (!el.contains(e) && e.closest(BOX)) return true
      for (const n of e.childNodes) {
        // an empty cell's dash and an Event row's faint "＋" are placeholders, not content
        if (n.nodeType !== 3 || !n.textContent.trim() || /^[–＋+]$/.test(n.textContent.trim())) continue
        const rg = document.createRange(); rg.selectNodeContents(n)
        for (const q of rg.getClientRects()) if (x >= q.left - 2 && x <= q.right + 2 && y >= q.top - 2 && y <= q.bottom + 2) return true
      }
      return false
    }
    const cost = (x, y) => {
      if (x < 2 || y < 2 || x + w > innerWidth - 2 || y + h > innerHeight - 2) return 999
      let n = 0
      for (const fx of [0.05, 0.3, 0.5, 0.7, 0.95]) for (const fy of [0.1, 0.5, 0.9]) if (content(x + w * fx, y + h * fy)) n++
      return n
    }
    // the cells' boxes and the other marks are drawn with pointer-events off: let them answer the hit test while the places
    // are tried (an overlay such as the open-dates outline stays see-through)
    const pe = document.createElement('style'); pe.textContent = '.zf,.r7-cb,.zkb,.r7-kb,.zz-tag,.zmk{pointer-events:auto!important}'; document.head.appendChild(pe)
    let best = null
    for (const k of order) { const [x, y] = C[k]; const c = cost(x, y); if (!best || c < best.c) best = { k, x, y, c }; if (c === 0) break }
    pe.remove()
    let { x, y } = best
    x = Math.max(2, Math.min(innerWidth - w - 2, x)); y = Math.max(2, Math.min(innerHeight - h - 2, y))
    Object.assign(t.style, { left: x + 'px', top: y + 'px' })
    t.dataset.at = best.k + ':' + best.c
    return best.c
  }, [sel, label, o])
  if (ok === false) console.warn('MARK MISSED:', sel, label)
  else if (ok > 0) console.warn('MARK COVERS SOMETHING:', sel, label, ok)
  return ok
}
export const unmk = p => p.evaluate(() => { document.querySelectorAll('.zz-tag').forEach(n => n.remove()); document.querySelectorAll('.zz-marked').forEach(n => { n.style.outline = ''; n.style.outlineOffset = ''; n.classList.remove('zz-marked') }) })
