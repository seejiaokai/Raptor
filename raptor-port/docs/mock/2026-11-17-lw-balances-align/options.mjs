// The proposed Balances layouts (D2153) and pending looks (D2154), injected over the real page by bal.mjs.
// SHARED LAYOUT (all three): every column set from the left, its heading starting exactly where its box or figure
// starts (the design guide's lessons 36, 63, 64 — the Approvals list reads the same way); a long heading wraps to two
// lines rather than widening its column ("INCL. CARRIED / FWD"); the group labels (LVE, OTHER LEAVE) set left at their
// group's first column, their rule spanning exactly their columns; every column a set width, so the page reads as a grid.
// PENDING (D2154): never a minus sign, which reads as "taken"; the pending look is the grid's own for a pending bid —
// hollow and dashed — in amber, the colour every pending figure already wears (D1251).

const LAYOUT = `
#page-leavewar .bp-table th, #page-leavewar .bp-table td { text-align:left !important; }
#page-leavewar .bp-table th.ok { padding-right:10px !important; }
#page-leavewar .bp-table tr.h2 th { height:30px; line-height:12px; vertical-align:bottom; padding-bottom:6px; white-space:normal; }
#page-leavewar .bp-table tr.h2 th.l { white-space:nowrap; }
#page-leavewar .bp-table tr.h1 th.span { text-align:left !important; padding-left:10px; }
#page-leavewar .bp-table tr.h2 th { top:30px; }
/* min-width: the table's last (filler) column takes width 100%, so a plain width would be squeezed to the words */
#page-leavewar .bp-table .w-app { min-width:62px; } #page-leavewar .bp-table .w-cf { min-width:88px; max-width:88px; }
#page-leavewar .bp-table .w-pd { min-width:90px; } #page-leavewar .bp-table .w-war { min-width:60px; white-space:nowrap; }
#page-leavewar .bp-table .w-oil { min-width:46px; } #page-leavewar .bp-table .w-k { min-width:60px; }
#page-leavewar .bp-table .w-pk { min-width:34px; }
#page-leavewar .bp-table td.bp-war, #page-leavewar .bp-table td.bp-pend { padding-left:10px; }
/* phone: the same, every heading over the left edge of its box */
#page-leavewar .bp-cols > span, #page-leavewar .bp-row > * { text-align:left !important; justify-self:start; }
#page-leavewar .bp-cols .ok { padding-right:0 !important; }
#page-leavewar .bp-row .bp-fb { width:auto; }
#page-leavewar .bp-row .bp-fb .bp-bx { width:54px; }
#page-leavewar .bp-row > .bp-fb:nth-child(3) .bp-bx { width:44px; }
#page-leavewar .bp-oc { justify-content:flex-start !important; padding-right:0; }
#page-leavewar .bp-cols { height:30px; align-items:end; padding-bottom:5px; box-sizing:border-box; line-height:11px; }
#page-leavewar .bp-cols > span:first-child { align-self:stretch; align-items:end; }
`

const CHIP = `
#page-leavewar .mk-pd { display:inline-flex; align-items:center; box-sizing:border-box; height:22px; padding:0 7px; border:1px dashed rgba(242,200,121,.8); border-radius:6px; background:transparent; color:#F2C879; font:600 12.5px system-ui; white-space:nowrap; font-variant-numeric:tabular-nums; vertical-align:middle; }
#page-leavewar .bp-row .mk-pd { font-size:12px; height:22px; padding:0 6px; }
`

export const OPTS = [
  {
    id: 'a',
    // A: a dashed amber tag with its word, "2.5 pending", in LVE's Pending column and beside each other kind's box
    css: LAYOUT + CHIP + `
#page-leavewar .bp-zoom.bal .bp-cols, #page-leavewar .bp-zoom.bal .bp-row { grid-template-columns: 132px 54px 44px 84px 50px 44px repeat(5, 112px) !important; }
#page-leavewar .bp-opd.mk-pd { min-width:0; margin-left:5px; padding:0 5px; font-size:11.5px; }
#page-leavewar .bp-table .w-k { min-width:136px; padding-left:6px !important; padding-right:6px !important; }
#page-leavewar .bp-table tr[data-testid] td:nth-child(n+8):not(:last-child) { padding-left:6px; padding-right:6px; }
#page-leavewar .bp-oc .bp-opd.mk-pd { margin-left:5px; font-size:12px; }
`,
    js: () => {
      const h2 = document.querySelector('#page-leavewar .bp-table tr.h2')
      if (h2) { const cls = ['', '', 'w-app', 'w-cf', 'w-pd', 'w-war', 'w-oil', 'w-k', 'w-k', 'w-k', 'w-k', 'w-k', '']; [...h2.children].forEach((t, i) => cls[i] && t.classList.add(cls[i])) }
      const num = s => s.replace(/^[−-]/, '')
      document.querySelectorAll('#page-leavewar .bp-pend.pd').forEach(e => { e.innerHTML = `<span class="mk-pd">${num(e.textContent)} pending</span>` })
      document.querySelectorAll('#page-leavewar .bp-opd').forEach(e => { if (e.textContent.trim()) { e.textContent = num(e.textContent) + ' pending'; e.classList.add('mk-pd') } })
    },
  },
  {
    id: 'b',
    // B: the figure alone in the dashed amber tag, under a heading that says it — LVE's column reads "PENDING APPROVAL";
    // for another kind the tag rides the corner of its box, so every column stays one box wide
    css: LAYOUT + CHIP + `
#page-leavewar .bp-zoom.bal .bp-cols, #page-leavewar .bp-zoom.bal .bp-row { grid-template-columns: 132px 54px 44px 64px 50px 44px repeat(5, 54px) !important; }
#page-leavewar .bp-table .w-pd { min-width:70px; } #page-leavewar .bp-table .w-k { min-width:66px; }
#page-leavewar .bp-fb.mk-host { position:relative; }
#page-leavewar .mk-badge { position:absolute; top:-8px; right:-12px; z-index:3; height:17px; padding:0 4px; border:1px dashed rgba(242,200,121,.85); border-radius:5px; background:#11161c; color:#F2C879; font:700 11px/15px system-ui; font-variant-numeric:tabular-nums; box-sizing:border-box; }
#page-leavewar .bp-row .mk-badge { background:#0b0d10; }
#page-leavewar .bp-opd { display:none !important; }
#page-leavewar .bp-table td { overflow:visible; }
`,
    js: () => {
      const h2 = document.querySelector('#page-leavewar .bp-table tr.h2')
      if (h2) { const cls = ['', '', 'w-app', 'w-cf', 'w-pd', 'w-war', 'w-oil', 'w-k', 'w-k', 'w-k', 'w-k', 'w-k', '']; [...h2.children].forEach((t, i) => cls[i] && t.classList.add(cls[i])); h2.children[4].textContent = 'PENDING APPROVAL' }
      const ph = document.querySelector('#page-leavewar .bp-cols'); if (ph) ph.children[3].innerHTML = 'PENDING<br>APPROVAL'
      const num = s => s.replace(/^[−-]/, '')
      document.querySelectorAll('#page-leavewar .bp-pend.pd').forEach(e => { e.innerHTML = `<span class="mk-pd">${num(e.textContent)}</span>` })
      document.querySelectorAll('#page-leavewar .bp-opd').forEach(e => {
        const t = e.textContent.trim(); if (!t) return
        const fb = e.previousElementSibling; if (!fb) return
        fb.classList.add('mk-host'); const b = document.createElement('span'); b.className = 'mk-badge'; b.textContent = num(t); fb.appendChild(b)
      })
    },
  },
  {
    id: 'c',
    // C: every pending figure in a group of its own at the end, "PENDING APPROVAL", one column a kind — the balances
    // stay clean columns of boxes and nothing amber stands among them
    css: LAYOUT + CHIP + `
#page-leavewar .bp-zoom.bal .bp-cols, #page-leavewar .bp-zoom.bal .bp-row { grid-template-columns: 132px 54px 44px 50px 44px repeat(5, 50px) repeat(6, 46px) !important; }
#page-leavewar .bp-table .w-pk { width:44px; }
#page-leavewar .bp-opd { display:none !important; }
#page-leavewar .mk-pc { color:#F2C879; font:600 13.5px system-ui; font-variant-numeric:tabular-nums; }
#page-leavewar .bp-row .mk-pc { font-size:14px; }
#page-leavewar .bp-cols .mk-pk { color:#c9a35c; }
#page-leavewar .bp-table th.mk-pk { color:#c9a35c; transform:translateY(-7px); }
#page-leavewar .bp-table tr.h1 th.mk-pg { color:#c9a35c; border-bottom-color:rgba(242,200,121,.45); }
`,
    js: () => {
      const KINDS = ['LVE', 'CCL', 'FCL', 'PL', 'EL', 'CL']
      const num = s => s.replace(/^[−-]/, '').trim()
      const cell = (tag, v) => { const c = document.createElement(tag); if (v) { const s = document.createElement('span'); s.className = 'mk-pc'; s.textContent = v; c.appendChild(s) } return c }
      const tab = document.querySelector('#page-leavewar .bp-table')
      if (tab) {
        const h1 = tab.querySelector('tr.h1'), h2 = tab.querySelector('tr.h2')
        h1.children[1].colSpan = 3
        const g = document.createElement('th'); g.className = 'span sep mk-pg'; g.colSpan = 6; g.textContent = 'PENDING APPROVAL'; h1.insertBefore(g, h1.lastElementChild)
        h2.children[4].remove()
        const cls = ['', '', 'w-app', 'w-cf', 'w-war', 'w-oil', 'w-k', 'w-k', 'w-k', 'w-k', 'w-k', '']; [...h2.children].forEach((t, i) => cls[i] && t.classList.add(cls[i]))
        KINDS.forEach((k, i) => { const t = document.createElement('th'); t.className = 'w-pk mk-pk' + (i ? '' : ' sep'); t.textContent = k; h2.insertBefore(t, h2.lastElementChild) })
        tab.querySelectorAll('tr[data-testid^="bal-row-"]').forEach(tr => {
          const pd = tr.querySelector('td.bp-pend'); const vals = [pd.classList.contains('pd') ? num(pd.textContent) : '']
          tr.querySelectorAll('.bp-opd').forEach(o => vals.push(num(o.textContent)))
          pd.remove()
          vals.forEach((v, i) => { const c = cell('td', v); if (!i) c.className = 'sep'; tr.insertBefore(c, tr.lastElementChild) })
        })
        tab.querySelectorAll('tr.bp-grp td').forEach(td => { td.colSpan = 18 })
      }
      const cols = document.querySelector('#page-leavewar .bp-cols')
      if (cols) {
        cols.children[3].remove()
        KINDS.forEach((k, i) => { const s = document.createElement('span'); s.className = 'mk-pk' + (i ? '' : ' sep'); s.innerHTML = i ? `<br>${k}` : `PEND.<br>${k}`; cols.appendChild(s) })
        document.querySelectorAll('#page-leavewar .bp-row').forEach(r => {
          const pd = r.querySelector('.bp-pend'); const vals = [pd.classList.contains('pd') ? num(pd.textContent) : '']
          r.querySelectorAll('.bp-opd').forEach(o => vals.push(num(o.textContent)))
          pd.remove()
          vals.forEach((v, i) => { const c = cell('span', v); if (!i) c.className = 'sep'; r.appendChild(c) })
        })
      }
    },
  },
]
