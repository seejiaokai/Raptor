/* THE DESIGN LOOK — the Leave War's "clashes with the schedule" note ([LW-CLASH-NOTE-PHONE], owner D805): as built at
   both sizes, then THREE WAYS TO REDO IT ON A PHONE, DRAWN INTO THE RUNNING APP.
   WHAT IS REAL AND WHAT IS DRAWN IN: the "today" pictures are the built app untouched. In the option pictures the app's
   own amber note is hidden and the proposal is injected in its place — built from the page's own parts where they
   exist (the chip is the page's `.fchip`; option B's list is the page's own under-manned list, `.umlist` / `.umrow`),
   and from the note's own colours (`.syncclash`: the amber edge, wash and inks) where they do not. The only style the
   app does not already have is the block marked NEW below.
   The set-up is the developer's bridge (not what is pictured): Saturday 18 Jul 26 published with three men working it (the seed's duty officer and two on programme rows),
   two of them holding leave that day — two clashes of the "weekend work earns FO but the day holds leave" kind.
   node scripts/handpass/dl-clash.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
const size = process.argv[2] || 'phone'
const w = await L.world(size)
const p = w.page
const K = size
const SAT = '2026-07-18'

await p.evaluate(() => {
  const W = window, di = 5
  for (const [prog, who, a, b] of [['Hangar open day', 'nick', '13:00', '15:00'], ['Range brief', 'bane', '09:00', '12:00']]) {
    W.DAYS[di].ground.push({ prog, str: a, end: b, who: '', rmks: '' }); W.afterSchedMutate()
    W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, who); W.afterSchedMutate()
  }
  const g = W.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  W.setDayApproved(di, true); W.afterSchedMutate()
})
await L.go(w, 'leavewar')
await p.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(600)
console.log('set', JSON.stringify(await p.evaluate(d => [['plasma', 'LL'], ['nick', 'OML'], ['bane', 'OL']].map(([id, c]) => [id, window.lwSetCell(id, d, c)]), SAT)))
await p.waitForSelector('[data-testid="sync-clashes"]', { timeout: 15000 }); await L.sleep(500)
const today = await p.evaluate(() => { const s = document.querySelector('[data-testid="sync-clashes"]'); const r = s.getBoundingClientRect(); const f = document.querySelector('#page-leavewar .filters').getBoundingClientRect(); return { text: [...s.querySelectorAll('.row')].map(x => x.textContent.replace(/\s+/g, ' ').trim()), n: s.querySelector('.n').textContent.trim(), strip: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`, filters: `${Math.round(f.width)}×${Math.round(f.height)}`, gridTop: Math.round(document.querySelector('#page-leavewar .stage').getBoundingClientRect().top) } })
console.log('TODAY', JSON.stringify(today, null, 1))
/* the passing note the set-up's own publish left is not part of the picture */
await p.evaluate(() => window.clearToast && window.clearToast()); await p.addStyleTag({ content: '#toastEl{display:none !important}' }); await L.sleep(200)
await L.pic(w, `clash-${K}-0-today`)
if (!w.phone) await L.pic(w, `clash-${K}-0c-today-top`, { clip: { x: 0, y: 60, width: 1440, height: 190 } })

/* ---- the proposals ---- */
const CSS = `
/* NEW — the only rules the app does not already have. Colours are the built note's own (.syncclash). */
#page-leavewar .dl-line{display:flex;align-items:center;gap:8px;width:100%;margin:0;padding:6px 12px;border:0;border-bottom:1px solid rgba(229,168,59,.5);background:rgba(229,168,59,.16);color:#FFF0D6;font:700 12px/16px inherit;font-family:inherit;text-align:left;cursor:pointer}
#page-leavewar .dl-line .dl-go{margin-left:auto;font-weight:600;color:#F5E3BF}
#page-leavewar .dl-list{margin:0;padding:0;border-bottom:1px solid rgba(229,168,59,.5);background:rgba(229,168,59,.08)}
#page-leavewar .dl-row{display:flex;align-items:baseline;gap:8px;width:100%;padding:7px 12px;border:0;border-top:1px solid rgba(229,168,59,.22);background:none;color:#F5E3BF;font:500 12px/16px inherit;font-family:inherit;text-align:left}
#page-leavewar .dl-row b{color:#FFF0D6;font-weight:700}
#page-leavewar .dl-row .dl-do{margin-left:auto;white-space:nowrap;color:#FFF0D6;font-weight:600}
#page-leavewar .fchip.dl-chip{background:rgba(229,168,59,.16);color:#FFF0D6;border-color:rgba(229,168,59,.65);font-weight:700}
#page-leavewar .umlist.dl-um{position:fixed;left:10px;right:10px;width:auto;max-width:none}
#page-leavewar .umlist.dl-um .umrow{display:flex;gap:8px;align-items:baseline;width:100%;text-align:left}
#page-leavewar .umlist.dl-um .umrow .why{margin-left:0;color:#F5E3BF}
#page-leavewar .umlist.dl-um .umrow .dl-do{margin-left:auto;white-space:nowrap}
.dl-hide{display:none !important}
/* THE NEATER A (owner D823, 13 Oct 26 — "this but neater like alignment"). ONE GRID FOR THE WHOLE LIST, so every row's
   parts start at the same place: the name | the day | what to do | its arrow, and under them, across the whole row,
   edge to the row's right edge, what clashes — said with its key words (owner D825: "weekend/PH work", "the day
   holds"). Each row is the same shape — two lines — whatever its words. The line's own edges are the buttons' above it (10px), not the screen's. */
#page-leavewar .dn-line{display:flex;align-items:center;width:100%;margin:0;padding:6px 10px;border:0;border-bottom:1px solid rgba(229,168,59,.5);background:rgba(229,168,59,.16);color:#FFF0D6;font-size:12px;line-height:18px;font-weight:700;font-family:inherit;text-align:left;cursor:pointer}
#page-leavewar .dn-line .dn-go{margin-left:auto;font-weight:600;color:#F5E3BF}
#page-leavewar .dn-list{display:grid;grid-template-columns:var(--dn-name,74px) max-content minmax(0,1fr);column-gap:10px;margin:0;padding:0 10px;border-bottom:1px solid rgba(229,168,59,.5);background:rgba(229,168,59,.08)}
#page-leavewar .dn-row{display:grid;grid-template-columns:subgrid;grid-column:1 / -1;align-items:start;padding:7px 0;border:0;border-top:1px solid rgba(229,168,59,.22);background:none;color:#F5E3BF;font-size:12px;line-height:16px;font-weight:500;font-family:inherit;text-align:left}
#page-leavewar .dn-row:first-child{border-top:0}
#page-leavewar .dn-who{font-weight:700;color:#FFF0D6}
#page-leavewar .dn-who{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#page-leavewar .dn-day{color:#FFF0D6;font-variant-numeric:tabular-nums;white-space:nowrap}
#page-leavewar .dn-what{grid-column:1 / -1;color:#F5E3BF;opacity:.85}
#page-leavewar .dn-do{font-weight:500;color:#FFF0D6;text-align:right}
#page-leavewar .dn-wide{font-size:13.7px;line-height:18px}
#page-leavewar .dn-wide .dn-row{font-size:13.7px;line-height:18px}
`
await p.addStyleTag({ content: CSS })
/* the same two clashes the built note shows, under every option, in the shorter words: who · the day — what clashes · what to do */
const ROWS = [
  { who: 'Fable', day: 'Sat 18 Jul', what: 'earns FO, holds LL', go: 'Decide the bid' },
  { who: 'Ranger', day: 'Sat 18 Jul', what: 'earns *HO, holds OL', go: 'Decide the bid' },
]
const stage = (mode, rows) => p.evaluate(([mode, rows]) => {
  const pg = document.querySelector('#page-leavewar')
  pg.querySelectorAll('.dl-new').forEach(n => n.remove())
  const real = pg.querySelector('[data-testid="sync-clashes"]')
  real.classList.add('dl-hide')
  const filters = pg.querySelector('.filters')
  const el = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls + ' dl-new'; e.innerHTML = html; return e }
  const n = rows.length
  const rowHtml = r => `<b>${r.who}</b><span>${r.day} · ${r.what}</span><span class="dl-do">${r.go} ›</span>`
  if (mode === 'A-closed' || mode === 'A-open') {
    const line = el('button', 'dl-line', `<span>⚠ ${n} clashes with the schedule</span><span class="dl-go">${mode === 'A-open' ? 'Hide ▴' : 'Show ▾'}</span>`)
    filters.after(line)
    if (mode === 'A-open') { const list = el('div', 'dl-list', rows.map(r => `<button class="dl-row">${rowHtml(r)}</button>`).join('')); line.after(list) }
  }
  if (mode === 'B-closed' || mode === 'B-open') {
    const chip = el('button', 'fchip dl-chip', `⚠ ${n}`)
    filters.querySelector('[data-testid="legend-open"]').before(chip)
    if (mode === 'B-open') {
      const top = filters.getBoundingClientRect().bottom + 2
      const list = el('div', 'umlist dl-um', `<div class="umlist-hd">${n} clashes with the schedule</div><div class="umlist-body">${rows.map(r => `<button class="umrow"><span class="d">${r.who}</span><span class="why">${r.day} · ${r.what}</span><span class="dl-do">›</span></button>`).join('')}</div>`)
      list.style.top = top + 'px'
      filters.append(list)
    }
  }
  if (mode === 'N-closed' || mode === 'N-open') {
    const line = el('button', 'dn-line', `<span>⚠ ${n} ${n === 1 ? 'clash' : 'clashes'} with the schedule</span><span class="dn-go">${mode === 'N-open' ? 'Hide ▴' : 'Show ▾'}</span>`)
    filters.after(line)
    if (mode === 'N-open') {
      const list = el('div', 'dn-list', rows.map(r => `<button class="dn-row"><span class="dn-who">${r.who}</span><span class="dn-day">${r.day}</span><span class="dn-do">${r.go}&nbsp;›</span><span class="dn-what">${r.what}</span></button>`).join(''))
      line.after(list)
      /* the name's column: as wide as the roster's longest callsign in the list's own letters — the same on every visit */
      const cv = document.createElement('canvas').getContext('2d'); cv.font = '700 12px ' + getComputedStyle(list).fontFamily
      const longest = Math.max(...Object.values(window.PEOPLE || {}).map(p => cv.measureText(String(p.cs || '')).width), 40)
      list.style.setProperty('--dn-name', Math.ceil(longest * (mode === 'N-open' && window.__dnWide ? 1.142 : 1)) + 'px')
      if (window.__dnWide) list.classList.add('dn-wide')
    }
  }
  if (mode === 'C') {
    const line = el('button', 'dl-line', `<span>⚠ <b>${rows[0].who}</b> · ${rows[0].day} · ${rows[0].what}</span><span class="dl-go">+${n - 1} more ›</span>`)
    filters.after(line)
  }
  const f = filters.getBoundingClientRect()
  const stageEl = pg.querySelector('.stage').getBoundingClientRect()
  const chips = [...filters.querySelectorAll(':scope > .fchip')].map(c => `${c.textContent.trim().slice(0, 18)}:${Math.round(c.getBoundingClientRect().width)}`)
  const st = filters.querySelector('.stagetxt')
  const cols = [...pg.querySelectorAll('.dn-row')].map(r => ({ who: Math.round(r.querySelector('.dn-who').getBoundingClientRect().left), day: Math.round(r.querySelector('.dn-day').getBoundingClientRect().left), doR: Math.round(r.querySelector('.dn-do').getBoundingClientRect().right), chev: Math.round(r.querySelector('.dn-do').getBoundingClientRect().right), dayLines: Math.round(r.querySelector('.dn-day').getBoundingClientRect().height / parseFloat(getComputedStyle(r).lineHeight)), nameCut: r.querySelector('.dn-who').scrollWidth > r.querySelector('.dn-who').clientWidth + 0.5, h: Math.round(r.getBoundingClientRect().height) }))
  const firstChip = filters.querySelector(':scope > .fchip').getBoundingClientRect().left, lastChip = [...filters.querySelectorAll(':scope > .fchip')].pop().getBoundingClientRect().right
  return { mode, cols, chipEdges: [Math.round(firstChip), Math.round(lastChip)], has: pg.querySelectorAll('.dl-new').length, filtersH: Math.round(f.height), gridTop: Math.round(stageEl.top), chips, stageCut: st ? st.scrollWidth > st.clientWidth : null, overflow: document.documentElement.scrollWidth > innerWidth }
}, [mode, rows])

if (w.phone) {
  for (const [mode, name] of [['A-closed', 'A1-line-closed'], ['A-open', 'A2-line-open'], ['B-closed', 'B1-chip'], ['B-open', 'B2-chip-list-open'], ['C', 'C1-line-names-first']]) {
    const m = await stage(mode, ROWS)
    if (!m.has) throw new Error('nothing was drawn for ' + mode)
    console.log('OPTION', JSON.stringify(m))
    await L.sleep(150)
    await L.pic(w, `clash-${K}-${name}`)
    await L.pic(w, `clash-${K}-${name}-top`, { clip: { x: 0, y: 40, width: 390, height: mode.endsWith('open') ? 250 : 170 } })
  }
  /* the busy case: six clashes, a long callsign, the three kinds of "what to do" — under A (open) and B (open) */
  const BUSY = [...ROWS,
    { who: 'Sidewinder', day: 'Sun 19 Jul', what: 'earns FO, holds OML', go: 'Change it on Inputs' },
    { who: 'Warden', day: 'Mon 10 Aug', what: 'input OML, bid LL', go: 'Decide the bid' },
    { who: 'Drifter', day: 'Sat 22 Aug', what: 'earns FO, holds LL', go: 'Send back or delete' },
    { who: 'Basher', day: 'Sun 23 Aug', what: 'earns HO, holds OL', go: 'Step back to Closed' }]
  for (const [mode, name] of [['A-open', 'A3-line-open-busy'], ['B-open', 'B3-chip-list-busy']]) {
    console.log('BUSY', JSON.stringify(await stage(mode, BUSY))); await L.sleep(150)
    await L.pic(w, `clash-${K}-${name}`)
  }
  /* THE NEATER A — closed, open with the two real clashes, one clash, and the busy case; the words with their key
     words kept (D825) */
  const NROWS = [
    { who: 'Fable', day: 'Sat 18 Jul', what: 'Weekend/PH work earns FO, but the day holds LL', go: 'Decide the bid' },
    { who: 'Ranger', day: 'Sat 18 Jul', what: 'Weekend/PH work earns *HO, but the day holds OL', go: 'Decide the bid' }]
  const NBUSY = [...NROWS,
    { who: 'Sidewinder', day: 'Sun 19 Jul', what: 'Weekend/PH work earns FO, but the day holds OML', go: 'Change the leave on Inputs' },
    { who: 'Warden', day: 'Mon 10 Aug', what: 'Input OML against bid LL', go: 'Decide the bid' },
    { who: 'Drifter', day: 'Sat 22 Aug', what: 'Weekend/PH work earns FO, but the day holds LL', go: 'Send the leave back or delete it' },
    { who: 'Basher', day: 'Sun 23 Aug', what: 'Weekend/PH work earns HO, but the day holds published OL', go: 'Step back to Bidding Closed' }]
  for (const [mode, name, rows] of [['N-closed', 'N1-neat-closed', NROWS], ['N-open', 'N2-neat-open', NROWS], ['N-open', 'N3-neat-open-busy', NBUSY], ['N-open', 'N4-neat-open-one', NROWS.slice(0, 1)], ['N-open', 'N5-neat-busy-wider-letters', NBUSY]]) {
    /* N5: THE SAME LIST IN LETTERS ABOUT A SEVENTH WIDER — a stand-in for his iPhone's own (the app loads no font; GitHub's
       machines' were a seventh wider, chrome.css says). Not proof for his phone: it shows which part gives way. */
    await p.evaluate(v => { window.__dnWide = v }, name.includes('wider'))
    const m = await stage(mode, rows)
    if (!m.has) throw new Error('nothing was drawn for ' + mode)
    const same = k => new Set(m.cols.map(c => c[k])).size <= 1
    console.log('NEAT', name, JSON.stringify({ gridTop: m.gridTop, rows: m.cols.length, heights: [...new Set(m.cols.map(c => c.h))], dayOneLine: m.cols.every(c => c.dayLines === 1), nameCut: m.cols.some(c => c.nameCut), aligned: { who: same('who'), day: same('day'), doRight: same('doR') }, edges: m.cols[0] ? [m.cols[0].who, m.cols[0].chev] : null, chipEdges: m.chipEdges, overflow: m.overflow }))
    await L.sleep(150)
    await L.pic(w, `clash-${K}-${name}`)
    await L.pic(w, `clash-${K}-${name}-top`, { clip: { x: 0, y: 40, width: 390, height: name.includes('busy') ? 470 : name.includes('open') ? 250 : 170 } })
  }
} else {
  /* the desktop keeps its strip (D679, D805 reading 1) — shown once with the same shorter words, for him to take or leave */
  await p.evaluate(rows => { const s = document.querySelector('[data-testid="sync-clashes"]'); [...s.querySelectorAll('.row')].forEach((r, i) => { const x = rows[i]; if (x) r.innerHTML = `<b style="color:#FFF0D6">${x.who}</b> · ${x.day} · ${x.what} — ${x.go.toLowerCase()}` }) }, ROWS)
  await L.pic(w, `clash-${K}-1-same-strip-shorter-words-top`, { clip: { x: 0, y: 60, width: 1440, height: 190 } })
}
await L.close(w)
