/* THE LEAVE WAR'S CLASH NOTE, AS BUILT ([LW-CLASH-NOTE-PHONE] — owner D805, D823, D827; the words D837). The drawing he
   approved is scripts/handpass/dl-clash.mjs (modes N-closed / N-open) — that script DRAWS the proposal into the old
   build and stays as the design of record. THIS one checks the BUILT note against it: every line is an assertion of the
   right behaviour (`works` / `FAIL — what was seen`), with a picture at each step, so running it IS the walk's own
   re-check (docs/bug-check-order.md §5).
   The set-up is the developer's bridge, as dl-clash.mjs's (not what is pictured): Saturday 18 Jul 26 published with the
   seed's duty officer and five men on two programme rows; a bid typed on that day for one of them, then for the rest.
     DL_SHOTS=docs/img/handpass/2026-10-14-three-builds node scripts/handpass/dl-clash-built.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
console.log('dl-clash-built v2')
const size = process.argv[2] || 'phone'
const w = await L.world(size)
const p = w.page
const K = size
const SAT = '2026-07-18'
const ok = (key, expected, saw, pass) => L.row(`Clash note [${K}]`, key, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'works' : `FAIL — ${(typeof saw === 'string' ? saw : JSON.stringify(saw)).slice(0, 400)}`)
const ACCENT = await p.evaluate(() => { const i = document.createElement('i'); i.style.color = 'var(--accent)'; document.body.append(i); const c = getComputedStyle(i).color; i.remove(); return c })

/* five men to work the Saturday beside the duty officer: bane, nick, and the three longest callsigns on the roster */
const crew = await p.evaluate(() => {
  const W = window, di = 5
  const ids = Object.keys(W.PEOPLE).filter(id => !['plasma', 'bane', 'nick', 'all', 'allavail'].includes(id) && W.PEOPLE[id] && W.PEOPLE[id].cs && !W.PEOPLE[id].pers && !W.PEOPLE[id].sans && !W.PEOPLE[id].ph)
    .sort((a, b) => String(W.PEOPLE[b].cs).length - String(W.PEOPLE[a].cs).length).slice(0, 3)
  const rows = [['Hangar open day', ['nick', ids[0]], '13:00', '15:00'], ['Range brief', ['bane', ids[1], ids[2]], '09:00', '12:00']]
  for (const [prog, who, a, b] of rows) {
    W.DAYS[di].ground.push({ prog, str: a, end: b, who: '', rmks: '' }); W.afterSchedMutate()
    for (const id of who) { W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, id); W.afterSchedMutate() }
  }
  const g = W.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  W.setDayApproved(di, true); W.afterSchedMutate()
  return { ids, cs: Object.fromEntries(['plasma', 'bane', 'nick', ...ids].map(id => [id, W.PEOPLE[id].cs])) }
})
console.log('crew', JSON.stringify(crew))
await L.go(w, 'leavewar')
await p.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(600)
await p.evaluate(() => window.clearToast && window.clearToast()); await p.addStyleTag({ content: '#toastEl{display:none !important}' })
const top = () => p.evaluate(() => {
  const pg = document.querySelector('#page-leavewar'), f = pg.querySelector('.filters').getBoundingClientRect(), st = pg.querySelector('.stagetxt')
  return { filtersH: Math.round(f.height), filtersBottom: Math.round(f.bottom), gridTop: Math.round(pg.querySelector('.stage').getBoundingClientRect().top), stageCut: st ? st.scrollWidth > st.clientWidth : null, overflow: document.documentElement.scrollWidth > innerWidth }
})
const none = await top()
console.log('NO CLASH', JSON.stringify(none))
await L.pic(w, `clash-${K}-b0-no-clash`)

/* ---- ONE clash: it starts open ---- */
console.log('set one', JSON.stringify(await p.evaluate(d => window.lwSetCell('plasma', d, 'LL'), SAT)))
await p.waitForSelector('[data-testid="sync-clashes"]', { timeout: 15000 }); await L.sleep(400)
const note = () => p.evaluate(() => {
  const pg = document.querySelector('#page-leavewar'), n = pg.querySelector('[data-testid="sync-clashes"]'), r = n.getBoundingClientRect(), filters = pg.querySelector('.filters')
  const line = n.querySelector('[data-testid="clash-line"]'), list = n.querySelector('[data-testid="clash-list"]')
  const rows = [...n.querySelectorAll('.clashrow')].map(row => {
    const q = c => row.querySelector(c).getBoundingClientRect(), lh = parseFloat(getComputedStyle(row).lineHeight)
    const rr = row.getBoundingClientRect(), hit = document.elementFromPoint(rr.left + rr.width / 2, rr.top + rr.height / 2)
    return { who: row.querySelector('.clash-who').textContent, day: row.querySelector('.clash-day').textContent, go: row.querySelector('.clash-do').textContent.replace(/ /g, ' '), what: row.querySelector('.clash-what').textContent,
      whoL: Math.round(q('.clash-who').left), dayL: Math.round(q('.clash-day').left), doR: Math.round(q('.clash-do').right), dayLines: Math.round(q('.clash-day').height / lh), whatLines: Math.round(q('.clash-what').height / lh), doLines: Math.round(q('.clash-do').height / lh),
      nameCut: row.querySelector('.clash-who').scrollWidth > row.querySelector('.clash-who').clientWidth + 0.5, h: Math.round(rr.height), onTop: !!hit && (hit === row || row.contains(hit)), tag: row.tagName }
  })
  const strip = [...n.querySelectorAll('.row')].map(x => x.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim())
  const ls = list ? getComputedStyle(list) : null
  return { cls: n.className, inFilters: filters.contains(n), afterFilters: filters.nextElementSibling === n, box: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`, w: Math.round(r.width), vw: innerWidth,
    line: line ? line.textContent.replace(/\s+/g, ' ').trim() : null, expanded: line ? line.getAttribute('aria-expanded') : null, lineTag: line ? line.tagName : null, lineH: line ? Math.round(line.getBoundingClientRect().height) : null,
    linePadL: line ? getComputedStyle(line).paddingLeft : null, chipL: Math.round(filters.querySelector(':scope > .fchip').getBoundingClientRect().left),
    rows, strip, innerScroll: list ? (list.scrollHeight > list.clientHeight + 1 || /auto|scroll/.test(ls.overflowY)) : false, sizerN: n.querySelectorAll('.clashsizer i').length }
})

if (w.phone) {
  let n = await note()
  ok('where it sits', 'a note of its own AFTER the two lines of buttons, the width of the screen — never inside the second line', { cls: n.cls, inFilters: n.inFilters, afterFilters: n.afterFilters, box: n.box, vw: n.vw }, n.cls === 'clashnote' && !n.inFilters && n.afterFilters && n.w === n.vw)
  ok('ONE clash starts open', 'the line says "⚠ 1 clash with the schedule" and offers Hide; the list is open', { line: n.line, expanded: n.expanded, rows: n.rows.length }, n.line === '⚠ 1 clash with the schedule Hide' && n.expanded === 'true' && n.rows.length === 1)
  ok('the row\'s words', `${crew.cs.plasma} · Sat 18 Jul · Decide the bid › — then "Weekend/PH work earns …, but the day holds LL"`, n.rows[0], !!n.rows[0] && n.rows[0].who === crew.cs.plasma && n.rows[0].day === 'Sat 18 Jul' && n.rows[0].go === 'Decide the bid ›' && /^Weekend\/PH work earns \*?[FH]O\*?, but the day holds LL$/.test(n.rows[0].what))
  let t = await top()
  ok('the two lines above are untouched', `the second line as tall as with no clash (${none.filtersH}), its stage name cut no more than before (${none.stageCut}), no sideways scroll`, t, t.filtersH === none.filtersH && t.stageCut === none.stageCut && !t.overflow)
  await L.pic(w, `clash-${K}-b1-one-clash-starts-open`)

  /* ---- SEVERAL: they start closed ---- */
  console.log('set more', JSON.stringify(await p.evaluate(([d, ids]) => [['bane', 'OL'], ['nick', 'LL'], [ids[0], 'OL'], [ids[1], 'LL'], [ids[2], 'LL']].map(([id, c]) => [id, window.lwSetCell(id, d, c)]), [SAT, crew.ids])))
  await L.sleep(700)
  n = await note()
  const count = +(n.line.match(/(\d+) clash/) || [])[1]
  ok('SEVERAL start closed', 'the line counts them and offers Show; no list', { line: n.line, expanded: n.expanded, rows: n.rows.length }, count > 1 && n.line === `⚠ ${count} clashes with the schedule Show` && n.expanded === 'false' && n.rows.length === 0)
  t = await top()
  ok('closed, the grid starts high', 'the grid\'s card starts one slim line lower than with no clash (the line is about 30 tall)', { gridTop: t.gridTop, noClash: none.gridTop, lineH: n.lineH }, t.gridTop - none.gridTop === n.lineH + 1 && n.lineH <= 34)
  ok('the line\'s edges are the buttons\' above it', 'its words start where the first button starts', { linePadL: n.linePadL, firstButtonLeft: n.chipL }, parseFloat(n.linePadL) === n.chipL)
  await L.pic(w, `clash-${K}-b2-several-closed`)

  await w.press('[data-testid="clash-line"]'); await L.sleep(300)
  n = await note()
  const same = k => new Set(n.rows.map(r => r[k])).size === 1
  ok('Show opens the list in place', `${count} rows, each a button, the line now offers Hide`, { line: n.line, rows: n.rows.length, tags: [...new Set(n.rows.map(r => r.tag))] }, n.rows.length === count && n.expanded === 'true' && /Hide$/.test(n.line) && n.rows.every(r => r.tag === 'BUTTON'))
  ok('the columns are in line', 'every name starts at one edge, every day at one edge, every instruction ends at one edge; every day on ONE line; no name cut', { who: [...new Set(n.rows.map(r => r.whoL))], day: [...new Set(n.rows.map(r => r.dayL))], doRight: [...new Set(n.rows.map(r => r.doR))], dayLines: n.rows.map(r => r.dayLines), nameCut: n.rows.map(r => r.nameCut) },
    same('whoL') && same('dayL') && same('doR') && n.rows.every(r => r.dayLines === 1 && !r.nameCut))
  /* the first row has no line above it, so it is one pixel shorter than the rest */
  ok('every row the same shape', 'two lines a row — who, the day, what to do; then what clashes — so one height, to the pixel of the rule between rows', { heights: n.rows.map(r => r.h), whatLines: n.rows.map(r => r.whatLines), doLines: n.rows.map(r => r.doLines) }, Math.max(...n.rows.map(r => r.h)) - Math.min(...n.rows.map(r => r.h)) <= 1 && n.rows.every(r => r.whatLines === 1 && r.doLines === 1))
  ok('the names\' column is the roster\'s', 'sized by every callsign on the roster, not by who happens to clash', { sizer: n.sizerN, roster: await p.evaluate(() => document.querySelectorAll('#page-leavewar [data-testid^="row-"]').length) }, n.sizerN > 20)
  ok('no scroll inside the list', 'a long list pushes the grid down; it never scrolls inside itself', { innerScroll: n.innerScroll }, !n.innerScroll)
  ok('nothing lies over a row', 'a finger at each row\'s centre meets that row', n.rows.map(r => r.onTop), n.rows.every(r => r.onTop))
  t = await top()
  ok('open, the two lines above are still untouched', `second line ${none.filtersH} tall, no sideways scroll`, t, t.filtersH === none.filtersH && !t.overflow)
  console.log('OPEN', JSON.stringify({ gridTop: t.gridTop, rows: n.rows.length, rowH: n.rows[0].h }))
  await L.pic(w, `clash-${K}-b3-several-open`)

  /* ---- wider letters: a stand-in for his iPhone's (about a seventh wider) ---- */
  await p.addStyleTag({ content: '#page-leavewar .clashnote.dl-wide .clashline,#page-leavewar .clashnote.dl-wide .clashrow,#page-leavewar .clashnote.dl-wide .clashsizer{font-size:13.7px;line-height:18px}' })
  await p.evaluate(() => document.querySelector('[data-testid="sync-clashes"]').classList.add('dl-wide')); await L.sleep(250)
  n = await note(); t = await top()
  ok('in letters a seventh wider', 'every day still on one line, the columns still in line, no name cut, nothing off the screen — the instruction is the part that may wrap', { dayLines: n.rows.map(r => r.dayLines), who: [...new Set(n.rows.map(r => r.whoL))], day: [...new Set(n.rows.map(r => r.dayL))], doRight: [...new Set(n.rows.map(r => r.doR))], nameCut: n.rows.map(r => r.nameCut), doLines: n.rows.map(r => r.doLines), overflow: t.overflow },
    n.rows.every(r => r.dayLines === 1 && !r.nameCut) && new Set(n.rows.map(r => r.whoL)).size === 1 && new Set(n.rows.map(r => r.dayL)).size === 1 && new Set(n.rows.map(r => r.doR)).size === 1 && !t.overflow)
  await L.pic(w, `clash-${K}-b4-several-open-wider-letters`)
  await p.evaluate(() => document.querySelector('[data-testid="sync-clashes"]').classList.remove('dl-wide')); await L.sleep(150)

  /* ---- a tap opens that day FOR that person ---- */
  const first = (await note()).rows[0]
  await w.press('[data-testid="clash-row-0"]'); await L.sleep(600)
  const sheet = await p.evaluate(() => { const s = document.querySelector('#page-leavewar [role="dialog"]'); return s ? { tid: s.getAttribute('data-testid'), head: (s.textContent || '').replace(/\s+/g, ' ').slice(0, 60), buttons: [...s.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 12) } : null })
  ok('a tap on a clash', `opens ${first.who}'s Sat 18 Jul — the sheet where the bid is decided (Ack · Approve · Refuse on it)`, sheet, !!sheet && sheet.head.startsWith(first.who + 'Sat 18 Jul') && ['Ack', 'Approve', 'Refuse'].every(b => sheet.buttons.includes(b)))
  await L.pic(w, `clash-${K}-b5-a-tap-opens-the-day`)
  await p.evaluate(() => { const x = document.querySelector('#page-leavewar [role="dialog"] [data-testid$="-close"], #page-leavewar [role="dialog"] .x'); if (x) x.click() }); await L.sleep(300)

  /* ---- Hide, and the choice is kept for the visit ---- */
  await w.press('[data-testid="clash-line"]'); await L.sleep(250)
  n = await note()
  ok('Hide is the way back', 'the list closes; the line offers Show again', { line: n.line, rows: n.rows.length }, n.rows.length === 0 && /Show$/.test(n.line))
  await w.press('[data-testid="clash-line"]'); await L.sleep(200)             // he opens it…
  await L.go(w, 'editsched'); await L.go(w, 'leavewar'); await L.sleep(500)     // …goes to another page and comes back
  n = await note()
  ok('his choice is kept for the visit', 'opened by him, it is still open after a look at another page', { line: n.line, rows: n.rows.length }, n.rows.length === count && /Hide$/.test(n.line))
  await L.pic(w, `clash-${K}-b6-kept-open-after-another-page`)

  /* ---- a member sees none ---- */
  await p.evaluate(() => window.lwSetRole && window.lwSetRole('member')); await L.sleep(400)
  const memberSees = await p.locator('[data-testid="sync-clashes"]').count()
  ok('a member', 'sees no clash note', `notes on screen: ${memberSees}`, memberSees === 0)
  await p.evaluate(() => window.lwSetRole && window.lwSetRole('admin')); await L.sleep(300)
} else {
  /* ---- A DESKTOP KEEPS ITS STRIP (D679): the same words, the instruction its own link ---- */
  await p.evaluate(([d, ids]) => [['bane', 'OL'], [ids[0], 'OL']].map(([id, c]) => window.lwSetCell(id, d, c)), [SAT, crew.ids]); await L.sleep(700)
  let n = await note()
  const t = await top()
  ok('where it sits', 'the strip, inside the stage line as before (one block under the buttons), no phone line', { cls: n.cls, inFilters: n.inFilters, line: n.line, box: n.box }, n.cls === 'syncclash' && n.inFilters && n.line === null)
  ok('its words', 'each clash: the name · the day · what clashes as a sentence. Then the instruction ›', n.strip, n.strip.length >= 2 && n.strip.every(s => /^.+ · Sat 18 Jul · Weekend\/PH work earns \*?[FH]O\*?, but the day holds (LL|OL)\. Decide the bid ›$/.test(s)) && n.strip.every(s => !/—/.test(s)))
  ok('no sideways scroll', 'the page is no wider than the screen', t, !t.overflow)
  await L.pic(w, `clash-${K}-b1-strip`)
  await L.pic(w, `clash-${K}-b1c-strip-top`, { clip: { x: 0, y: 60, width: 1440, height: 190 } })
  /* by keyboard: the instruction is a Tab stop with the app's ring, and Enter goes where a click goes */
  await p.locator('[data-testid="legend-open"]').focus(); await p.keyboard.press('Tab')
  const on = await L.focusOf(w)
  const ring = await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` })
  ok('by keyboard: Tab after Legend', 'lands on the first clash\'s instruction, wearing the app\'s ring', `${on} · ${ring}`, /clash-go-0/.test(on) && ring === `solid 2px ${ACCENT}`)
  await L.pic(w, `clash-${K}-b2-keyboard-on-the-instruction`, { clip: { x: 0, y: 60, width: 1440, height: 190 } })
  const who0 = n.strip[0].split(' · ')[0]
  await p.keyboard.press('Enter'); await L.sleep(600)
  const sheet = await p.evaluate(() => { const s = document.querySelector('#page-leavewar [role="dialog"]'); return s ? { tid: s.getAttribute('data-testid'), head: (s.textContent || '').replace(/\s+/g, ' ').slice(0, 60), buttons: [...s.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 12) } : null })
  ok('Enter on "Decide the bid ›"', `opens ${who0}'s Sat 18 Jul — the sheet where the bid is decided`, sheet, !!sheet && sheet.head.startsWith(who0 + 'Sat 18 Jul') && ['Ack', 'Approve', 'Refuse'].every(b => sheet.buttons.includes(b)))
  await L.pic(w, `clash-${K}-b3-the-day-opened`)
}
await L.close(w)
