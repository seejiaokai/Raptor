// M5b round 1 (29 Oct 26): the admin's set-up redrawn on today's main (after M5a), each part drawn the way the app already
// draws that kind of part (his D1496) — nothing here is built. ONE transform per drawing, every new part cloned from a real
// neighbour on the same screen and ringed with a numbered tag:
//   1  ⚙ Settings (D1205 fewer words, D1221 "+ SANS", D1200 Management first, D1485 no Balances line, D1270 no sideways
//      scroll): the three trays and their sentences become the bid window's own label rows (`.bidsheet-row` + `.lab`);
//      "Events…" beside "Calendar…" (a clone of it); the groups' sentence becomes a last, muted "Everyone else" row (a
//      clone of a group row, grip and ✕ taken off); "+ SANS" first among the add chips (a clone of a chip). 1b: SANS added
//      by the REAL Show SANS button first, so its row is the app's own.
//   2  The Events list (D1155): the Settings window's own frame and title bar, the period in View in its title, "＋ Event"
//      (the Settings window's own ＋ button) and "Edit presets" (the Event window's own); each event one line of the
//      Calendar window's Holidays list (`.hol-line`), its kind the mark a tap on a filled event cell already shows
//      (`.evpeek-kind`). The events are the REAL ones on the grid after four are added through the store's own writer.
//   3  Holidays by file (D1155), in the Calendar window's Holidays list (the second door onto the same records — D638):
//      "Import sheet" is the app's one Document button (`.abtn.docbtn`, its upload arrow); "Export sheet" the same button
//      with the arrow turned down (the one new glyph). 3b the import's preview, in place of the list: each line of the
//      sheet as a Holidays-list line — new, already there, or not read with its reason — then "Add 7" and "Cancel".
//   4  Management on Quals (D1200): a tick column cloned from SXO's, beside it.
//   cd raptor-port ; npm run build ; npx vite preview --port 4197 --strictPort   (another shell)
//   LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-m5b-draw.mjs
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, PINK, mark, unmark } from './full-lib.mjs'
const browser = await chromium.launch()
const facts = {}
const DESK = ['desk', 1536, 864, false], PHONE = ['phone', 402, 874, true]

// four events added through the store's own writer (the localhost bridge's lwSetDayEvent, as the e2e tests do), so the
// list has every kind: an Off day, an exercise with no kind, a No Leave week on the second row, an SC day
async function stageEvents(p) {
  const put = (d, line, t) => p.evaluate(([d, line, t]) => window.lwSetDayEvent(d, line, t), [d, line, t])
  const ok = []
  ok.push(await put('2026-01-23', 0, 'Off day'))
  for (const d of ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13']) ok.push(await put(d, 0, 'EX SHIELD'))
  for (const d of ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06']) ok.push(await put(d, 1, 'No Leave'))
  ok.push(await put('2026-03-16', 0, 'SC'))
  await p.waitForTimeout(600)
  if (ok.some(x => x === false)) console.warn('an event was refused', JSON.stringify(ok))
}
// the year's events read off the grid's own Event rows (the desktop draws the whole year once it is on screen): runs of
// one word on one row on next-door days are one line, as a band is one event
async function readEvents(p) {
  return p.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-testid^="event-0-"], [data-testid^="event-1-"], [data-testid^="event-band-"]')]
    const days = []
    for (const c of cells) {
      const m = c.dataset.testid.match(/^event-(?:band-)?(\d)-(\d{4}-\d{2}-\d{2})$/); if (!m) continue
      const t = c.textContent.trim(); if (!t || t === '＋') continue
      const span = +(c.getAttribute('colspan') || 1)
      for (let i = 0; i < span; i++) { const d = new Date(m[2] + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + i); days.push({ line: +m[1], date: d.toISOString().slice(0, 10), t, title: c.getAttribute('title') || '' }) }
    }
    days.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.line - b.line)
    const runs = []
    for (const d of days) {
      const last = runs.find(r => r.line === d.line && r.t === d.t && (new Date(d.date) - new Date(r.to)) === 86400000)
      if (last) last.to = d.date; else runs.push({ line: d.line, t: d.t, title: d.title, from: d.date, to: d.date })
    }
    return runs.sort((a, b) => a.from < b.from ? -1 : 1)
  })
}

// ---------------------------------------------------------------- 1. ⚙ Settings
const SETTINGS_T = () => {
  const s = document.querySelector('[data-testid="settings-sheet"]')
  const before = { words: s.innerText.split(/\s+/).filter(Boolean).length, h: s.scrollHeight }
  const tag = (el, n) => { el.dataset.zz = n; el.classList.add('zz-new') }
  // the title: "SETTINGS" alone
  s.querySelector('.bidsheet-hd .dt')?.remove()
  // the three trays → the bid window's label rows
  const secs = [...s.querySelectorAll(':scope > .gs-sec, :scope .gs-sec')]
  const trays = [...s.querySelectorAll('.set-tray')]
  const cal = s.querySelector('[data-testid="settings-days"]'), ctr = s.querySelector('[data-testid="counter-add"]')
  const evr = s.querySelector('[data-testid="event-add"]'), evrm = s.querySelector('[data-testid="event-remove"]')
  const rea = s.querySelector('[data-testid="settings-rearrange"]'), rst = s.querySelector('[data-testid="roster-reset-order"]')
  const sans = s.querySelector('[data-testid="sans-toggle"]')
  const row = (lab, ...btns) => {
    const r = document.createElement('div'); r.className = 'bidsheet-row zz-lrow'
    const l = document.createElement('span'); l.className = 'lab'; l.textContent = lab; r.appendChild(l)
    for (const b of btns) if (b) r.appendChild(b)
    return r
  }
  const events = cal.cloneNode(true); events.textContent = 'Events…'; events.removeAttribute('data-testid'); tag(events, '2')
  const rows = [row('Year', cal, events), row('Manning', ctr, evr, evrm), row('Order', rea, rst)]
  const first = secs[0]
  const box = document.createElement('div'); box.className = 'zz-rows'; rows.forEach(r => box.appendChild(r))
  first.before(box)
  tag(box, '1')
  // what leaves: the three headings, the trays (now empty but for their sentences), the SANS sentence, Show SANS
  for (const sec of secs) if (/^(Calendar|Counters|Roster order)/.test(sec.textContent.trim())) sec.remove()
  trays.forEach(t => t.remove()); sans?.remove()
  s.querySelectorAll('.gs-note').forEach(n => { if (/Showing SANS|no group above claims/.test(n.textContent)) n.remove() })
  // groups: the heading's words and its hint
  for (const sec of s.querySelectorAll('.gs-sec')) {
    sec.querySelector('.gs-hint')?.remove()
    if (/^Groups/.test(sec.textContent.trim())) sec.firstChild.textContent = 'Groups'
  }
  // Management first: a group row cloned from the first one (SXO), a qual group, Reaper and Anvil ticked (2)
  const list = s.querySelector('[data-testid="group-chosen"]')
  const sxo = list.querySelector('.set-grow')
  const mg = sxo.cloneNode(true); mg.removeAttribute('data-testid')
  mg.querySelector('.set-gname').textContent = 'Management'
  const sw = mg.querySelector('.set-sw'); if (sw) { sw.className = 'set-sw set-swbtn'; sw.style.background = '#4FA3E0' }
  const kd = mg.querySelector('.set-gkd'); if (kd) kd.textContent = 'qual'
  const ct = mg.querySelector('.set-gct'); if (ct) ct.textContent = '2'
  list.prepend(mg); tag(mg, '3')
  // "Everyone else": the sentence as the list's last row — a group row with no grip, no colour and no ✕, muted
  const ee = sxo.cloneNode(true); ee.removeAttribute('data-testid'); ee.removeAttribute('data-grow')
  ee.querySelector('.set-grip').classList.add('off'); ee.querySelector('.set-grip').textContent = ''
  const esw = ee.querySelector('.set-sw'); if (esw) { esw.className = 'set-sw'; esw.style.background = 'transparent'; esw.style.border = '1px dashed #4a5563' }
  const en = ee.querySelector('.set-gname'); en.textContent = 'Everyone else'; en.style.color = 'var(--ink-3)'; en.style.fontWeight = '600'
  const ek = ee.querySelector('.set-gkd'); if (ek) ek.textContent = 'last'
  const ec = ee.querySelector('.set-gct'); if (ec) ec.textContent = String(window.__zzOther ?? 0)
  const ed = ee.querySelector('.set-gdel'); if (ed) ed.style.visibility = 'hidden'
  list.appendChild(ee); tag(ee, '4')
  // "+ SANS" first among the chips, while SANS is off (D1215: off unless added)
  const offer = s.querySelector('[data-testid="group-offer"]')
  if (!list.querySelector('.set-grow.sans')) {
    const chip = offer.querySelector('.tchip').cloneNode(true); chip.removeAttribute('data-testid'); chip.textContent = '+ SANS'
    offer.prepend(chip); tag(chip, '5')
  }
  // who wins: its "— rarely needed"
  const dh = s.querySelector('[data-testid="who-wins-toggle"] .dh'); if (dh) dh.textContent = dh.textContent.replace(' — rarely needed', '')
  const after = { words: s.innerText.split(/\s+/).filter(Boolean).length, h: s.scrollHeight }
  return { before, after }
}
const ROW_CSS = `
#page-leavewar .zz-rows{padding:8px 2px 4px;display:flex;flex-direction:column;gap:2px}
#page-leavewar .zz-rows .bidsheet-row{margin-top:4px}
#page-leavewar .zz-rows .bidsheet-row .lab{min-width:78px}
`
async function ringNew(p, dev) {
  // a numbered tag on each new or changed part, drawn ON the element (an outline and a child tag)
  await p.evaluate(PINK => {
    for (const el of document.querySelectorAll('.zz-new')) {
      el.style.outline = `2px solid ${PINK}`; el.style.outlineOffset = '2px'
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
      const t = document.createElement('span'); t.className = 'zz-tag'; t.textContent = el.dataset.zz
      Object.assign(t.style, { position: 'absolute', right: '-10px', top: '-11px', background: PINK, color: '#fff', font: '700 11px/1 system-ui', padding: '3px 5px', borderRadius: '9px', boxShadow: '0 0 0 2px #0b0d10', zIndex: 99, pointerEvents: 'none' })
      el.appendChild(t)
    }
  }, PINK)
}

for (const [dev, w, h, touch] of [DESK, PHONE]) {
  for (const sansOn of [false, true]) {
    if (sansOn && dev === 'phone') continue
    const { ctx, p } = await newPage(browser, w, h, touch)
    await signIn(p, 'admin')
    await p.addStyleTag({ content: ROW_CSS })
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.click(q('settings-open')); await p.waitForTimeout(600)
    if (sansOn) { await p.click(q('sans-toggle')); await p.waitForTimeout(500) }
    // how many people Everyone else holds today: the grid's own heading of that name, if it is drawn
    await p.evaluate(() => { const g = [...document.querySelectorAll('#page-leavewar .gname')].find(n => /Everyone else/i.test(n.textContent)); window.__zzOther = g ? (g.parentElement.textContent.match(/(\d+)\s*$/) || [0, 0])[1] : 0 })
    const m = await p.evaluate(SETTINGS_T)
    facts[`settings-${dev}${sansOn ? '-sans' : ''}`] = m
    await ringNew(p, dev)
    const name = `m5b-d1-settings-${dev}${sansOn ? '-sans' : ''}`
    await shot(p, name)
    // the whole window, its full length (a taller page for this one picture; the window's own height cap lifted)
    await p.setViewportSize({ width: w, height: 1700 }); await p.waitForTimeout(400)
    await p.locator(q('settings-sheet')).screenshot({ path: join(OUT, name + '-whole.png') })
    await ctx.close()
  }
}

// ---------------------------------------------------------------- 2. the Events list
const EVENTS_T = ([runs, period]) => {
  const s = document.querySelector('[data-testid="settings-sheet"]')
  // the Settings window's own frame: its title bar kept, its body replaced
  const hd = s.querySelector('.bidsheet-hd')
  hd.querySelector('.who').textContent = 'EVENTS'
  let dt = hd.querySelector('.dt'); if (!dt) { dt = document.createElement('span'); dt.className = 'dt'; hd.querySelector('.who').after(dt) }
  dt.textContent = period
  const add = s.querySelector('[data-testid="counter-add"]').cloneNode(true); add.textContent = '＋ Event'; add.removeAttribute('data-testid')
  const presets = document.createElement('button'); presets.className = 'evtypes-open'; presets.textContent = 'Edit presets'
  presets.style.marginLeft = 'auto'
  for (const n of [...s.children]) if (n !== hd) n.remove()
  const top = document.createElement('div'); top.className = 'bidsheet-row zz-evtop'; top.append(add, presets)
  const KIND = { PH: ['off', 'Public holiday'], 'Off day': ['free', 'Off day'], 'No Leave': ['nolv', 'No leave'], SC: ['work', 'Working event'] }
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const say = iso => { const d = new Date(iso + 'T00:00:00Z'); return `${W[d.getUTCDay()]} ${d.getUTCDate()} ${M[d.getUTCMonth()]}` }
  const list = document.createElement('div'); list.className = 'hol-list zz-evlist'
  for (const r of runs) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'hol-line' + (r.to < '2026-01-08' ? ' is-past' : '')
    // the cell prints the short form; its full name is the cell's title (what a tap on it shows)
    // an event with no kind shows no kind mark, as a tap on its cell shows none (Matrix.tsx, the event peek)
    const k = KIND[r.title] || KIND[r.t] || null
    b.innerHTML = `<span class="hol-when"></span><span class="hol-name"></span>` + (k ? `<span class="evpeek-kind ${k[0]}"></span>` : '')
    b.children[0].textContent = r.from === r.to ? say(r.from) : r.from.slice(0, 7) === r.to.slice(0, 7) ? `${say(r.from).replace(/ [A-Za-z]+$/, '')} – ${say(r.to)}` : `${say(r.from)} – ${say(r.to)}`
    b.children[1].textContent = r.title || r.t
    if (k) b.children[2].textContent = k[1]
    list.appendChild(b)
  }
  s.append(top, list)
  return runs.length
}
const EV_CSS = `
#page-leavewar .zz-evtop{margin:6px 2px 10px}
#page-leavewar .zz-evlist{margin:0 2px 4px}
/* each line keeps the Holidays list's own columns (23-days.css: the date 42%, the name the rest), so the names line up */
#page-leavewar .zz-evlist .evpeek-kind{flex:0 0 auto;margin-left:auto}
`
for (const [dev, w, h, touch] of [DESK, PHONE]) {
  const { ctx, p } = await newPage(browser, w, h, touch)
  await signIn(p, 'admin')
  await stageEvents(p)
  await p.waitForTimeout(1500)
  // the phone draws a few months at a time: the list is read on a desktop page, then drawn on this one
  let runs
  if (dev === 'desk') { runs = await readEvents(p); facts.events = runs }
  else runs = facts.events
  await p.addStyleTag({ content: ROW_CSS + EV_CSS })
  // what the Holidays list's lines and the event peek's kind mark look like is read from the app; their rules are global
  // (23-days.css, matrix.css) — confirm they reach a node inside the Leave War page
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.click(q('settings-open')); await p.waitForTimeout(600)
  const period = await p.evaluate(() => (document.querySelector('[data-testid="period-pick"], .lw-period, .pp-btn')?.textContent || 'JAN – DEC 26').replace(/\s+/g, ' ').trim())
  const n = await p.evaluate(EVENTS_T, [runs, /\d/.test(period) ? period.replace(/[▾⌄]/g, '').trim() : 'JAN – DEC 26'])
  facts[`events-${dev}`] = { lines: n, styled: await p.evaluate(() => { const l = document.querySelector('.zz-evlist .hol-line'); const k = document.querySelector('.zz-evlist .evpeek-kind'); return { lineH: l?.getBoundingClientRect().height, kindBefore: k ? getComputedStyle(k, '::before').backgroundColor : null } }) }
  await shot(p, `m5b-d2-events-${dev}`)
  await ctx.close()
}

// ---------------------------------------------------------------- 3. holidays by file, in the Calendar window
const DOWN = '<svg class="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3"/><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/></svg>'
const UP = '<svg class="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3"/><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/></svg>'
// a sample sheet for 2026 as it might come back filled in: the four holidays the year already has, seven more, and one
// line whose date cannot be read. A drawing's sample, not a statement of the year's holidays.
const SHEET = [
  ['2026-01-01', '2026-01-01', 'New Year’s Day', 'had'],
  ['2026-02-17', '2026-02-18', 'Chinese New Year', 'had'],
  ['2026-03-21', '2026-03-21', 'Hari Raya Puasa', 'new'],
  ['2026-04-03', '2026-04-03', 'Good Friday', 'new'],
  ['2026-05-01', '2026-05-01', 'Labour Day', 'new'],
  ['2026-05-27', '2026-05-27', 'Hari Raya Haji', 'new'],
  ['2026-06-01', '2026-06-01', 'Vesak Day (in lieu)', 'new'],
  ['2026-08-09', '2026-08-09', 'National Day', 'had'],
  ['2026-08-10', '2026-08-10', 'National Day (in lieu)', 'new'],
  ['', '', 'Deepavali', 'bad:Row 11: the date “8/11” cannot be read. Write it as 2026-11-08.'],
  ['2026-11-09', '2026-11-09', 'Deepavali (in lieu)', 'new'],
  ['2026-12-25', '2026-12-25', 'Christmas Day', 'had'],
]
const FILE_T = ([DOWN, UP]) => {
  const part = document.querySelector('[data-testid="days-part-holidays"]')
  const add = part.querySelector('[data-testid="hol-add"]')
  const row = document.createElement('div'); row.className = 'zz-filerow'
  const mk = (svg, words) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn docbtn'; b.innerHTML = svg + `<span>${words}</span>`; return b }
  row.append(mk(DOWN, 'Export sheet'), mk(UP, 'Import sheet'))
  ;(part.querySelector('[data-testid="hol-list"]') || part.lastElementChild).after(row)
  row.classList.add('zz-new'); row.dataset.zz = '6'
  return !!add
}
const PREVIEW_T = ([SHEET]) => {
  const part = document.querySelector('[data-testid="days-part-holidays"]')
  const list = part.querySelector('[data-testid="hol-list"]')
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const say = iso => { const d = new Date(iso + 'T00:00:00Z'); return `${W[d.getUTCDay()]} ${d.getUTCDate()} ${M[d.getUTCMonth()]}` }
  const head = document.createElement('div'); head.className = 'zz-pvhead'
  const nNew = SHEET.filter(r => r[3] === 'new').length, nHad = SHEET.filter(r => r[3] === 'had').length, nBad = SHEET.filter(r => r[3].startsWith('bad')).length
  head.innerHTML = `<b>holidays-2026.csv</b><span>${nNew} to add · ${nHad} already here · ${nBad} not read</span>`
  const pv = document.createElement('div'); pv.className = 'hol-list zz-pv'
  for (const [from, to, name, st] of SHEET) {
    const b = document.createElement('div'); b.className = 'hol-line zz-pv-' + st.split(':')[0] + (st === 'had' ? ' is-past' : '')
    if (st.startsWith('bad')) {
      b.innerHTML = `<span class="hol-when">—</span><span class="hol-name"></span><span class="zz-why"></span>`
      b.children[1].textContent = name; b.children[2].textContent = st.slice(4)
    } else {
      b.innerHTML = `<span class="hol-when"></span><span class="hol-name"></span><span class="zz-st"></span>`
      b.children[0].textContent = from === to ? say(from) : from.slice(0, 7) === to.slice(0, 7) ? `${say(from).replace(/ [A-Za-z]+$/, '')} – ${say(to)}` : `${say(from)} – ${say(to)}`
      b.children[1].textContent = name
      b.children[2].textContent = st === 'new' ? 'new' : ''
    }
    pv.appendChild(b)
  }
  const foot = document.createElement('div'); foot.className = 'zz-pvfoot'
  const ok = document.createElement('button'); ok.type = 'button'; ok.className = 'abtn primary'; ok.textContent = `Add ${nNew} holidays`
  const no = document.createElement('button'); no.type = 'button'; no.className = 'abtn'; no.textContent = 'Cancel'
  foot.append(no, ok)
  const box = document.createElement('div'); box.className = 'zz-pvbox'; box.append(head, pv, foot)
  list.replaceWith(box)
  part.querySelector('.zz-filerow')?.remove()
  box.classList.add('zz-new'); box.dataset.zz = '7'
}
const FILE_CSS = `
.zz-filerow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.zz-pvhead{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;margin:2px 0 8px;font-size:13px;color:var(--ink-2)}
.zz-pvhead b{color:var(--ink)}
.zz-pv .hol-line{cursor:default}
.zz-pv .zz-st{flex:0 0 auto;min-width:30px;text-align:right;font-size:11.5px;color:var(--ink-3)}
.zz-pv .zz-pv-new .zz-st{color:#5fd0e6;font-weight:700}
.zz-pv .zz-pv-bad{flex-wrap:wrap}
.zz-pv .zz-pv-bad .hol-name{color:#FF9098}
.zz-pv .zz-why{flex-basis:100%;font-size:11.5px;color:#FF9098;padding-left:0}
.zz-pvfoot{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}
`
for (const [dev, w, h, touch] of [DESK, PHONE]) {
  for (const step of ['buttons', 'preview']) {
    const { ctx, p } = await newPage(browser, w, h, touch)
    await signIn(p, 'admin')
    await p.addStyleTag({ content: FILE_CSS })
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.click(q('settings-open')); await p.waitForTimeout(500)
    await p.click(q('settings-days')); await p.waitForTimeout(900)
    // on a phone the Holidays list is the window's second tab
    if (dev === 'phone') {
      const tab = p.locator('[role=tab], button').filter({ hasText: /^Holidays$/ }).first()
      if (await tab.count()) { await tab.click(); await p.waitForTimeout(500) } else console.warn('no Holidays tab on the phone')
    }
    await p.evaluate(FILE_T, [DOWN, UP])
    if (step === 'preview') await p.evaluate(PREVIEW_T, [SHEET])
    await ringNew(p, dev)
    await p.evaluate(() => document.querySelector('[data-testid="days-part-holidays"]')?.scrollIntoView({ block: 'start' }))
    await p.mouse.move(2, 2)
    await shot(p, `m5b-d3-holidays-${step}-${dev}`)
    await ctx.close()
  }
}

// ---------------------------------------------------------------- 4. Management on Quals
for (const [dev, w, h, touch] of [DESK]) {
  const { ctx, p } = await newPage(browser, w, h, touch)
  await p.goto('http://localhost:4197/'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day')
  await p.evaluate(() => window.go('quals')); await p.waitForTimeout(1500)
  const n = await p.evaluate(() => {
    const tbl = [...document.querySelectorAll('table')].find(t => [...t.querySelectorAll('th')].some(th => th.textContent.trim() === 'SXO'))
    if (!tbl) return 'no table'
    const ths = [...tbl.querySelectorAll('thead th, tr:first-child th')]
    const ix = ths.findIndex(th => th.textContent.trim() === 'SXO'); if (ix < 0) return 'no SXO'
    let made = 0
    for (const tr of tbl.querySelectorAll('tr')) {
      const cells = [...tr.children]
      if (cells.length <= ix) continue
      const c = cells[ix], nc = c.cloneNode(true)
      if (c.tagName === 'TH') { nc.childNodes.forEach(x => { if (x.nodeType === 3) x.textContent = '' }); nc.firstChild ? (nc.firstChild.nodeType === 3 ? nc.firstChild.textContent = 'MANAGEMENT' : nc.prepend('MANAGEMENT')) : nc.textContent = 'MANAGEMENT'; if (!/MANAGEMENT/.test(nc.textContent)) nc.textContent = 'MANAGEMENT' }
      else if (cells.length > 2) { const who = tr.firstElementChild.textContent.trim(); nc.innerHTML = /^(Reaper|Anvil)$/.test(who) ? c.innerHTML || '✓' : ''; if (/^(Reaper|Anvil)$/.test(who) && !nc.textContent.trim()) nc.textContent = '✓' }
      nc.removeAttribute('data-testid'); nc.style.outline = ''
      c.after(nc); made++
      if (c.tagName === 'TH') { nc.style.boxShadow = 'inset 0 0 0 2px #ff2d95' }
    }
    return made
  })
  facts.quals = n
  await shot(p, 'm5b-d4-quals-desk')
  await ctx.close()
}

writeFileSync(join(OUT, 'm5b-draw.json'), JSON.stringify(facts, null, 1))
console.log(JSON.stringify(facts, null, 1).slice(0, 3000))
await browser.close(); console.log('errors:', errs)
