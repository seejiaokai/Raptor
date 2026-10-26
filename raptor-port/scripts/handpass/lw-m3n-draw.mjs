// DRAWINGS FOR HIS LOOK — the night of 26 Oct 26 (job 6): seven design asks drawn on the REAL app (the built bundle on
// LW_PORT), today beside proposed, at an iPhone's size (402 x 874, 3x) and a desktop's (1536 x 864, 2x). Nothing is built:
// each proposal is ONE named transform applied in the page (CSS, or nodes cloned from a real neighbour) and the changed
// area is outlined in dashed yellow on the proposed picture (D1222). Run one part: DRAW=d1,d2 node scripts/handpass/lw-m3n-draw.mjs
//   d1  D1382  the Leave War day panel's figures in columns of four
//   d2  D1384  each input card's square in its kind's colour (the Inputs calendar's opened day, the Inputs list)
//   d3  D1385  the Inputs calendar's opened day as wide as the list (phone)
//   d4  D1386  an expand control on the Inputs calendar
//   d5  D1387  "Delete — sure?" inside its button
//   d6  [LW-GRANT-HO-VISIBLE]  a visible FO / HO choice in Grant OIL
//   d7  [LW-TAP-HELD-DAY]  a short tap on a day holding a course opens the bid window with its line
process.env.LW_PORT ||= '4190'
process.env.LW_OUT ||= '2026-10-26-lw-m3-night/draw'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T, note } = H
fs.mkdirSync(H.OUT, { recursive: true })
const parts = (process.env.DRAW || 'd1,d2,d3,d4,d5,d6,d7').split(',')
const run = id => parts.includes(id)
console.log('lw-m3n-draw →', H.OUT, parts.join(' '))
const RING = 'outline:2px dashed #FFD23F !important;outline-offset:2px'
const inject = (P, id, css) => P.evaluate(([id, css]) => { let s = document.getElementById(id); if (!s) { s = document.createElement('style'); s.id = id; document.head.appendChild(s) } s.textContent = css }, [id, css])
const uninject = (P, id) => P.evaluate(id => document.getElementById(id)?.remove(), id)
const measure = (P, fn, arg) => P.evaluate(fn, arg)

async function ctxs() {
  const desk = await H.deskFrom(undefined, 2); await L.signInPlain(desk, 'admin', '2026-07-13')
  const phone = await H.phoneFrom(await desk.ctx.storageState()); await L.signInPlain(phone, 'admin', '2026-07-13')
  return { desk, phone }
}
const { desk, phone } = await ctxs()
/* the Inputs page's List (the page remembers the calendar, so the List button is pressed when it is not) */
async function listView(w) { const P = w.page; await H.openInputsList(w); if (await L.vis(P, '#inListBtn') && (await P.locator('#inListBtn').getAttribute('aria-pressed')) !== 'true') { await L.press(w, '#inListBtn'); await P.waitForTimeout(700) } if (!(await P.locator('#inList .icard').count())) { await L.press(w, '#inRangeBtn'); await P.waitForTimeout(400); await L.press(w, '#inRangeAll'); await P.waitForTimeout(700) } await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300) }
/* a day of the Inputs calendar opens from a press on its date at the top of the cell — the bars cover the rest */
async function openIcDay(P, day) { const b = await day.boundingBox(); await P.mouse.click(b.x + 10, b.y + 7); await P.waitForTimeout(800); await P.waitForSelector('[data-testid="win-inputsday"]', { timeout: 4000 }) }

/* ---------- d1 the day panel in columns of four (D1382) ---------- */
if (run('d1')) {
  const iso = '2026-07-15'
  for (const w of [phone, desk]) {
    const P = w.page, sz = w.phone ? 'phone' : 'desk'
    await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
    await H.warOpen(w, await H.idOf(P, 'Comet'), iso)
    const th = P.locator(`th.day[data-d="${iso}"]`).first()
    await th.scrollIntoViewIfNeeded(); await th.click(); await P.waitForTimeout(800)
    await H.pic(w, `d1-${sz}-1-today`, [T('win-lwday')], { pad: 4, scale: 'device' })
    /* the transform: the figures run down columns of four, filling left, middle, right; each column's names and figures
       share its width (name left, figure right); a long name wraps; rows line up across the columns */
    await inject(P, 'd1', `.lwday-figs{grid-template-columns:none !important;grid-template-rows:repeat(4,auto);grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);column-gap:16px !important;row-gap:4px !important;${RING}}
      .lwday-figs .dl-row{display:flex !important;align-items:baseline;justify-content:space-between;gap:6px;min-width:0}
      .lwday-figs .dl-name{min-width:0;overflow-wrap:anywhere}
      .lwday-figs .dl-fig{flex:none}`)
    await P.waitForTimeout(250)
    const m = await measure(P, () => { const f = document.querySelector('[data-testid="lwday-figs"]'); const rows = f ? [...f.querySelectorAll('.dl-row')] : []; return { rows: rows.length, cols: new Set(rows.map(r => Math.round(r.getBoundingClientRect().left))).size, h: f ? Math.round(f.getBoundingClientRect().height) : 0 } })
    await H.pic(w, `d1-${sz}-2-proposed`, [T('win-lwday')], { pad: 4, scale: 'device' })
    note('d1-' + sz, 'draw', `figures ${m.rows} in ${m.cols} columns, ${m.h}px tall`)
    await uninject(P, 'd1'); await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  }
}

/* ---------- d2 the card squares in the kind's colour (D1384) ---------- */
/* the transform: each card's square takes its kind's colour from the one table the bars use (inputscal-model colourOf):
   an absence filled in --k-<kind>, a duty or commitment outlined as its bar is (D1321) */
const SQ = `
  .icard .icard-sq.dr-k{background:rgba(var(--kc),.9) !important;box-shadow:inset 0 0 0 1px rgba(var(--kc),1)}
  .icard .icard-sq.dr-duty{background:rgba(232,237,242,.05) !important;box-shadow:inset 0 0 0 1.5px rgba(200,212,228,.78)}
  .icard .icard-sq.dr-k,.icard .icard-sq.dr-duty{${RING};outline-offset:1px !important}`
const paintSquares = P => P.evaluate(() => {
  const COL = { LL: 'll', OL: 'ol', OIL: 'oilt', CCL: 'care', FCL: 'care', PL: 'care', CL: 'care', EL: 'care', HL: 'med', OML: 'med', 'ATT B': 'med', 'ATT C': 'med', UPCHIT: 'med', CSE: 'cse', CRS: 'cse', OD: 'od' }
  let n = 0
  for (const c of document.querySelectorAll('.icard')) {
    const id = c.getAttribute('data-popiid') || c.getAttribute('data-iid')
    const r = (window.INPUTS || []).find(x => String(x.iid) === String(id)); const sq = c.querySelector('.icard-sq')
    if (!r || !sq) continue
    const k = COL[String(r.type || '').trim().toUpperCase()]
    sq.classList.remove('dr-k', 'dr-duty')
    if (k) { sq.classList.add('dr-k'); sq.style.setProperty('--kc', `var(--k-${k})`) } else sq.classList.add('dr-duty')
    n++
  }
  return n
})
if (run('d2')) {
  const w = phone, P = w.page
  await H.inCalMonth(w, 2026, 7)
  const day = P.locator('#inpCal [data-icday="2026-07-15"]').first()
  await day.scrollIntoViewIfNeeded(); await openIcDay(P, day)
  await H.pic(w, 'd2-phone-1-day-today', [T('win-inputsday')], { pad: 4, scale: 'device' })
  await inject(P, 'd2', SQ); const n1 = await paintSquares(P); await P.waitForTimeout(200)
  await H.pic(w, 'd2-phone-2-day-proposed', [T('win-inputsday')], { pad: 4, scale: 'device' })
  await uninject(P, 'd2'); await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await listView(w)
  const list = '#inBody, #inList'
  await H.pic(w, 'd2-phone-3-list-today', [list], { pad: 0, scale: 'device' })
  await inject(P, 'd2', SQ); const n2 = await paintSquares(P); await P.waitForTimeout(200)
  await H.pic(w, 'd2-phone-4-list-proposed', [list], { pad: 0, scale: 'device' })
  await uninject(P, 'd2')
  note('d2', 'draw', `squares painted: the day ${n1}, the list ${n2}`)
}

/* ---------- d3 the opened day as wide as the list (D1385, phone) ---------- */
if (run('d3')) {
  const w = phone, P = w.page
  await listView(w)
  const listInset = await measure(P, () => { const c = document.querySelector('#inBody .icard, #inList .icard'); const r = c?.getBoundingClientRect(); return r ? { l: Math.round(r.left), r: Math.round(innerWidth - r.right) } : null })
  await H.inCalMonth(w, 2026, 7)
  const day = P.locator('#inpCal [data-icday="2026-07-15"]').first()
  await day.scrollIntoViewIfNeeded(); await openIcDay(P, day)
  const insetOf = () => measure(P, () => { const win = document.querySelector('[data-testid="win-inputsday"]'); const c = win?.querySelector('.icard'); const wr = win?.getBoundingClientRect(); const r = c?.getBoundingClientRect(); return r && wr ? { card: { l: Math.round(r.left), r: Math.round(innerWidth - r.right) }, win: { l: Math.round(wr.left), r: Math.round(innerWidth - wr.right) } } : null })
  const before = await insetOf()
  await P.screenshot({ path: `${H.OUT}/d3-phone-1-today.png`, scale: 'device' })
  /* the transform: the window and its own padding narrow (not the cards' insides) until its cards stand where the list's do */
  const want = listInset ? listInset.l : 20
  const pad = await measure(P, () => { const win = document.querySelector('[data-testid="win-inputsday"]'); const c = win?.querySelector('.icard'); if (!win || !c) return null; return Math.round(c.getBoundingClientRect().left - win.getBoundingClientRect().left) }, null)
  /* the window runs from edge to edge (no side gap) and the paddings between its edge and the cards shrink, so the cards
     stand exactly where the list's do; the cards' insides are untouched */
  await P.evaluate(want => {
    const win = document.querySelector('[data-testid="win-inputsday"]'); const c = win?.querySelector('.icard'); if (!win || !c) return
    win.style.cssText += ';left:0 !important;right:0 !important;width:auto !important;max-width:none !important;border-left-width:0 !important;border-right-width:0 !important'
    win.setAttribute('data-draw', 'd3')
    let left = c.getBoundingClientRect().left - want
    for (let e = c.parentElement; e && left > 0.5; e = e.parentElement) {
      const cs = getComputedStyle(e), pl = parseFloat(cs.paddingLeft) || 0, ml = parseFloat(cs.marginLeft) || 0
      const take = Math.min(pl, left); if (take > 0) { e.style.paddingLeft = (pl - take) + 'px'; e.style.paddingRight = Math.max(0, (parseFloat(cs.paddingRight) || 0) - take) + 'px'; left -= take }
      const tm = Math.min(ml, left); if (tm > 0) { e.style.marginLeft = (ml - tm) + 'px'; e.style.marginRight = Math.max(0, (parseFloat(cs.marginRight) || 0) - tm) + 'px'; left -= tm }
      if (e === win) break
    }
  }, want)
  await inject(P, 'd3', `[data-draw="d3"] .icard{${RING};outline-offset:0 !important}`)
  await P.waitForTimeout(300)
  const after = await insetOf()
  await P.screenshot({ path: `${H.OUT}/d3-phone-2-proposed.png`, scale: 'device' })
  note('d3', 'draw', `the list's cards ${JSON.stringify(listInset)}; the day's today ${JSON.stringify(before)}; proposed ${JSON.stringify(after)} (window padding ${pad})`)
  await uninject(P, 'd3'); await P.keyboard.press('Escape')
}

if (run('d1') || run('d2') || run('d3')) H.saveLog('draw-log-a.json')

/* ---------- d4 an expand control on the Inputs calendar (D1386) ---------- */
/* the transform: one icon button on the calendar's top row (cloned from its own ‹ › buttons, a ⤢ in it), and — for the
   expanded picture — the month drawn with room for every input: on a phone the calendar fits as many lines a day as the
   screen's height gives, so the screen is made tall enough that no day needs "+n more", and the page is pictured whole
   (it scrolls); collapsed it stays today's month */
const addExpand = (P, on) => P.evaluate(on => {
  /* on the "How this works" row, after the legend — the top row is full on a phone (a button there pushed ⚙ to a second
     line, the first drawing); cloned from the calendar's own › button, made the row's height */
  const nx = document.querySelector('#icNext'); const leg = document.querySelector('[data-testid="ib-legend"]')
  if (!nx || !leg) return false
  document.getElementById('dr-expand')?.remove()
  const b = nx.cloneNode(true); b.id = 'dr-expand'; b.removeAttribute('data-testid'); b.setAttribute('aria-label', on ? 'Show the month compact' : 'Show every input')
  b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.textContent = on ? '⤡' : '⤢'
  b.style.cssText += ';margin-left:10px;width:34px;height:30px;min-width:0;padding:0;font-size:16px;flex:none;outline:2px dashed #FFD23F;outline-offset:2px' + (on ? ';color:var(--acc,#3ad1f0);border-color:currentColor' : '')
  leg.after(b); return true
}, on)
if (run('d4')) {
  for (const w of [phone, desk]) {
    const P = w.page, sz = w.phone ? 'phone' : 'desk'
    await H.inCalMonth(w, 2026, 7)
    const vp0 = P.viewportSize()
    if (w.phone) { await P.setViewportSize({ width: vp0.width, height: 660 }); await P.waitForTimeout(900) }   // his iPhone's visible height under Safari's bars
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    const more = await P.evaluate(() => [...document.querySelectorAll('#inpCal *')].filter(e => e.children.length === 0 && /^\+\d+ more$/.test((e.textContent || '').trim())).length)
    await H.pic(w, `d4-${sz}-1-today`, ['#inpCal'], { pad: 4, scale: 'device' })
    await addExpand(P, false); await P.waitForTimeout(150)
    /* a week's height as the compact month draws it on his screen — expanded, a week keeps at least this and grows only as its inputs need */
    const rowH = await P.evaluate(() => Math.round(parseFloat(getComputedStyle(document.querySelector('.ib-week')).minHeight) || 0))
    await H.pic(w, `d4-${sz}-2-collapsed-with-control`, ['#inpCal'], { pad: 4, scale: 'device' })
    let moreAfter = null
    if (w.phone) {
      const vp = vp0
      await P.setViewportSize({ width: vp.width, height: 2600 }); await P.waitForTimeout(900)
      await addExpand(P, true)
      /* the tall screen only lets every input be drawn; each week then takes its own height, never the tall screen's share */
      await inject(P, 'd4', `.ib-week{min-height:${rowH}px !important}`); await P.waitForTimeout(300)
      moreAfter = await P.evaluate(() => [...document.querySelectorAll('#inpCal *')].filter(e => e.children.length === 0 && /^\+\d+ more$/.test((e.textContent || '').trim())).length)
      await H.pic(w, `d4-${sz}-3-expanded`, ['#inpCal'], { pad: 4, scale: 'device' })
      await uninject(P, 'd4'); await P.setViewportSize(vp); await P.waitForTimeout(700)
    }
    await P.evaluate(() => document.getElementById('dr-expand')?.remove())
    note('d4-' + sz, 'draw', `"+n more" today ${more}; expanded ${moreAfter ?? '(phone only)'}`)
  }
}

/* ---------- d5 "Delete — sure?" inside its button (D1387) ---------- */
/* first an OIL award on Saber's day, given through the real Grant OIL panel, so the day's Delete asks again as in his picture */
async function bidOpen(w, who, iso) { await L.openCellR(w, who, iso); await w.page.waitForSelector(T('bid-picker'), { timeout: 5000 }) }
async function closeBid(P) { await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(400) }
if (run('d5') || run('d6')) {
  const w = phone, P = w.page
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
  const saber = await H.idOf(P, 'Saber'), iso = '2026-11-16'
  await bidOpen(w, saber, iso)
  if (run('d6')) {
    await L.press(w, T('bid-oil')); await P.waitForTimeout(400)
    await H.pic(w, 'd6-phone-1-today', [T('bid-picker')], { pad: 4, scale: 'device' })
    /* the transform (a visible FO / HO choice): a row of two chips cloned from the panel's own AM / PM chips — "FO · a day"
       lit, "HO · half a day" — over the Days row; HO picked fills Days with 0.5 and the app's own Half row comes */
    const addChoice = ho => P.evaluate(ho => {
      document.getElementById('dr-fh')?.remove()
      const days = document.querySelector('[data-testid="oil-days"]')?.closest('.bidsheet-row'); const half = document.querySelector('[data-testid="span-range"]')
      const chipSrc = document.querySelector('[data-testid="bid-portion-am"], .pchip')
      if (!days || !chipSrc) return false
      const row = days.cloneNode(false); row.id = 'dr-fh'; row.style.cssText = 'outline:2px dashed #FFD23F;outline-offset:2px'
      const lab = document.createElement('span'); lab.className = 'lab'; lab.textContent = 'Give'; row.appendChild(lab)
      for (const [t, on] of [['FO · a day', !ho], ['HO · half a day', ho]]) { const c = chipSrc.cloneNode(false); c.removeAttribute('data-testid'); c.textContent = t; c.className = 'pchip' + (on ? ' on' : ''); c.setAttribute('aria-pressed', String(on)); row.appendChild(c) }
      days.before(row); return true
    }, ho)
    const okA = await addChoice(false); await P.waitForTimeout(150)
    await H.pic(w, 'd6-phone-2-proposed-fo', [T('bid-picker')], { pad: 4, scale: 'device' })
    await P.locator(T('oil-days')).fill('0.5'); await P.waitForTimeout(300)
    const okB = await addChoice(true); await P.waitForTimeout(150)
    await H.pic(w, 'd6-phone-3-proposed-ho', [T('bid-picker')], { pad: 4, scale: 'device' })
    await P.locator(T('oil-days')).fill('1'); await P.waitForTimeout(200)
    await P.evaluate(() => document.getElementById('dr-fh')?.remove())
    note('d6', 'draw', `choice drawn ${okA} / ${okB}`)
  } else { await L.press(w, T('bid-oil')); await P.waitForTimeout(400) }
  if (run('d5')) {
    await P.locator(T('oil-why')).fill('Weekend exercise'); await L.press(w, T('oil-give')); await P.waitForTimeout(900)
    if (await L.vis(P, T('bid-picker'))) await closeBid(P)
    await bidOpen(w, saber, iso)
    await L.press(w, T('bid-clear')); await P.waitForTimeout(400)
    const fit = () => P.evaluate(() => { const b = document.querySelector('[data-testid="bid-clear"]'); if (!b) return null; return { text: b.textContent.trim(), w: Math.round(b.getBoundingClientRect().width), need: b.scrollWidth } })
    const t = await fit()
    await H.pic(w, 'd5-phone-1-today', [T('bid-clear'), '[data-testid="bid-picker"] .note.warn'], { pad: 10, scale: 'device' })
    /* option A: while it asks, the Delete takes the next column too (the row is four even columns, D1330) — only where that
       column is free */
    await inject(P, 'd5', `.bidsheet .bp-acts > .dchip.del{grid-column:span 2 !important;${RING}}`)
    await P.waitForTimeout(200); const a = await fit()
    await H.pic(w, 'd5-phone-2-option-a-grows', [T('bid-clear'), '[data-testid="bid-picker"] .note.warn'], { pad: 10, scale: 'device' })
    /* option B: the button keeps its width; while it asks it reads "Sure?" — the line under it already says what goes */
    await uninject(P, 'd5')
    await P.evaluate(() => { const b = document.querySelector('[data-testid="bid-clear"]'); if (b) { b.dataset.was = b.textContent; b.textContent = 'Sure?'; b.style.outline = '2px dashed #FFD23F'; b.style.outlineOffset = '2px' } })
    await P.waitForTimeout(150); const bb = await fit()
    await H.pic(w, 'd5-phone-3-option-b-short', [T('bid-clear'), '[data-testid="bid-picker"] .note.warn'], { pad: 10, scale: 'device' })
    await P.evaluate(() => { const b = document.querySelector('[data-testid="bid-clear"]'); if (b && b.dataset.was) { b.textContent = b.dataset.was; b.style.outline = '' } })
    /* option C (recommended): the same words in the same place, on two lines inside the button while it asks */
    await inject(P, 'd5', `.bidsheet .bp-acts > .dchip.del{white-space:normal !important;line-height:1.15 !important;padding-top:4px !important;padding-bottom:4px !important;${RING}}`)
    await P.evaluate(() => { const b = document.querySelector('[data-testid="bid-clear"]'); if (b) b.innerHTML = 'Delete —<br>sure?' })
    await P.waitForTimeout(150); const cc = await fit()
    await H.pic(w, 'd5-phone-4-option-c-two-lines', [T('bid-clear'), '[data-testid="bid-picker"] .note.warn'], { pad: 10, scale: 'device' })
    await uninject(P, 'd5')
    note('d5c', 'draw', `C ${JSON.stringify(cc)}`)
    note('d5', 'draw', `today ${JSON.stringify(t)}; A ${JSON.stringify(a)}; B ${JSON.stringify(bb)}`)
    await closeBid(P)
  } else await closeBid(P)
}

/* ---------- d7 a short tap on a day holding a course (his question, [LW-TAP-HELD-DAY]) ---------- */
/* today: a tap on Comet's course (filed for the drawing) opens the read-only sheet. The transform: the one-day bid window
   opened on the next day he is free, re-dated to the course's day, with ONE line for the held entry at its top — the
   course's box, "Whole day", its words, "· change it on the Inputs page" — cloned from the window's own held-half line
   (D1371); everything under it (the leaves, Grant OIL, the ⋯) is the window as it is */
if (run('d7')) {
  const w = phone, P = w.page
  const iso = '2026-07-15', free = '2026-07-16'
  const comet = await H.idOf(P, 'Comet')
  await H.fileInput(w, { who: 'Comet', type: 'CSE', from: iso, remarks: 'Instructor course', tag: 'd7', oil: 'no' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
  await L.openCellR(w, comet, iso); await P.waitForTimeout(500)
  await P.screenshot({ path: `${H.OUT}/d7-phone-1-today.png`, scale: 'device' })
  await closeBid(P)
  await bidOpen(w, comet, free)
  const ok = await P.evaluate(([iso]) => {
    const win = document.querySelector('[data-testid="bid-picker"]'); if (!win) return false
    const head = [...win.querySelectorAll('*')].find(e => e.children.length === 0 && /\b16 Jul\b/.test(e.textContent || ''))
    if (head) head.textContent = head.textContent.replace('16 Jul', '15 Jul').replace('Thu', 'Wed')
    /* every date the window prints for the day it opened on (its till box too) reads the course's day */
    for (const e of win.querySelectorAll('*')) if (e.children.length === 0 && /\b16 Jul\b/.test(e.textContent || '')) e.textContent = e.textContent.replace('16 Jul', '15 Jul')
    const anchor = win.querySelector('.bidsheet-row'); if (!anchor) return false
    const line = document.createElement('div'); line.className = 'bidsheet-row'; line.id = 'dr-held'
    const n = document.createElement('span'); n.className = 'note bp-wide bp-heldline'; n.style.cssText = 'outline:2px dashed #FFD23F;outline-offset:2px'
    const box = document.querySelector('[data-testid^="cell-"] .c.k-cse')?.cloneNode(true)
    if (box) { box.style.position = 'static'; box.style.display = 'inline-flex'; n.appendChild(box) } else { const b = document.createElement('b'); b.textContent = 'CSE'; n.appendChild(b) }
    for (const [t, cls] of [['Whole day', ''], ['“Instructor course”', 'bp-heldwords'], ['· change it on the Inputs page', '']]) { const s = document.createElement('span'); s.textContent = t; if (cls) s.className = cls; n.appendChild(s) }
    line.appendChild(n); anchor.before(line); return true
  }, [iso])
  await P.waitForTimeout(200)
  await H.pic(w, 'd7-phone-2-proposed', [T('bid-picker')], { pad: 4, scale: 'device' })
  note('d7', 'draw', `held line drawn ${ok}`)
  await closeBid(P)
}
if (run('d4') || run('d5') || run('d6') || run('d7')) H.saveLog('draw-log-b.json')

await H.closeBrowser()
