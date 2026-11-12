/* rcsb-w2-warn v1 — W2: the warning-name walk (N1 On leave + planned, N2 Downchit + planned), one function for both.
   usage: node scripts/handpass/rcsb/w2/rcsb-w2-n1.mjs [pc|phone]   (see rcsb-w2-n1.mjs / rcsb-w2-n2.mjs) */
const C = await import('./rcsb-w2-common.mjs')
export { C }
const clean = C.clean, j = C.j

/* the board's warning region, cropped */
async function warnPic(Q, w, name) {
  const { R, X } = Q
  const sel = w.phone ? '#schedBoard #sbWarn' : '#schedBoard .sb-warn'
  if (await w.page.locator(sel + ':visible').count()) return X.pic(w.page, name, sel, { pad: 6 })
  return R.shot(w.page, name)
}
/* every drawn warning line of the edit week's day box: name (the bold wcode) + message; the box pictured */
async function dayStrip(Q, w, di, picName) {
  const { X, sleep } = Q
  const page = w.page
  const s = await X.stripItems(page, '#eWeek', di)
  const hid = await page.evaluate(i => [...document.querySelectorAll(`#eWeek [data-dwbox="${i}"] .witem`)].map(e => ({ cls: e.className.replace(/\s+/g, ' '), code: (e.querySelector('.wcode') || {}).innerText || '', text: e.innerText.replace(/[\s ]+/g, ' ').trim(), struck: getComputedStyle(e.querySelector('.wtx') || e).textDecorationLine.includes('line-through') || !!e.closest('.hid') || e.classList.contains('hid') })), di)
  if (picName) await X.pic(page, picName, `#eWeek [data-dwbox="${di}"]`, { pad: 8 })
  return { head: s.head, lines: hid }
}
async function dayInfoPop(Q, w, di, picName, pageSel = '#eWeek') {
  const { R, sleep } = Q
  const page = w.page
  const b = page.locator(`${pageSel} .dinfobtn[data-dayinfo="${di}"]:visible`).first()
  if (!(await b.count())) return 'NO i BUTTON'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  await C.hit(w, b); await sleep(700)
  const t = await page.evaluate(() => { const m = document.querySelector('#dayPop'); return m && m.offsetWidth ? m.innerText.replace(/[\s ]+/g, ' ').trim() : 'NO PANEL' })
  await R.shot(page, picName)
  return t
}
async function closeInfoPop(Q, w, how, picName = null) {
  const { R, sleep } = Q
  const page = w.page
  const open = () => page.locator('#dayPop:visible').count()
  if (how === 'x') {
    const x = page.locator('#dayPop:visible .dpx, #dayPop:visible [data-dpclose], #dayPop:visible button[aria-label*="lose" i], #dayPop:visible .x').first()
    if (await x.count()) await C.hit(w, x)
    else return 'NO X FOUND: ' + (await page.evaluate(() => [...document.querySelectorAll('#dayPop button, #dayPop [role=button]')].map(e => e.outerHTML.slice(0, 120)).join(' || ')))
  } else if (how === 'esc') await page.keyboard.press('Escape')
  else if (how === 'outside') { await page.mouse.click(4, 300) }
  await sleep(500)
  if (picName) await R.shot(page, picName)
  return (await open()) ? 'STILL OPEN' : 'closed'
}
async function logicRead(Q, w, tag, words) {
  const { R, X, L, sleep } = Q
  const page = w.page
  await L.go(page, 'logic'); await sleep(800)
  const res = {}
  /* leaf elements that draw a check's name; the row's own sentence is the next leaf after it */
  const rowOf = () => page.evaluate(() => {
    const all = [...document.querySelectorAll('#page-logic *')].filter(e => e.offsetWidth)
    const pick = re => all.filter(e => re.test(e.innerText || '') && ![...e.children].some(c => re.test(c.innerText || ''))).map(e => e.innerText.replace(/[\s ]+/g, ' ').trim().slice(0, 80))
    return { onleave: pick(/On leave \+ \w+/), downchit: pick(/Downchit \+ \w+/), flyingNames: pick(/\+ flying/i), planned: pick(/\+ planned/) }
  })
  res.names = await rowOf()
  const toRow = () => page.evaluate(() => { const e = [...document.querySelectorAll('#page-logic *')].filter(x => x.offsetWidth && /On leave \+ \w+/.test(x.innerText || '') && ![...x.children].some(c => /On leave \+ \w+/.test(c.innerText || '')))[0]; if (e) e.scrollIntoView({ block: 'center' }); else window.scrollTo(0, 0) })
  await toRow(); await sleep(300)
  await R.shot(page, `${tag}-g0-logic-list`)
  const box = page.locator('#lgSearch')
  for (const q of words) {
    await box.scrollIntoViewIfNeeded()
    await box.fill(''); await box.fill(q); await sleep(700)
    const names = await rowOf()
    const body = await page.evaluate(() => { const r = document.querySelector('#lgBody') || document.querySelector('#page-logic'); return r.innerText.replace(/[\s ]+/g, ' ').slice(0, 700) })
    res['q:' + q] = { names, body }
    await toRow(); await sleep(300)
    await R.shot(page, `${tag}-g-logic-filter-${q.replace(/\W/g, '')}`)
  }
  await box.fill(''); await sleep(500)
  res.cleared = (await box.inputValue()) === ''
  return res
}
async function insightsRead(Q, w, picName, closePic) {
  const { R, sleep } = Q
  const page = w.page
  const b = page.locator('#insightBtn:visible').first()
  if (!(await b.count())) return { err: 'NO INSIGHTS BUTTON' }
  await C.hit(w, b); await sleep(1200)
  const info = await page.evaluate(() => {
    const h = [...document.querySelectorAll('*')].find(e => e.offsetWidth && e.children.length === 0 && /^Week insights/.test((e.innerText || '').trim()))
    if (!h) return null
    let el = h; while (el.parentElement && el.innerText.length < 900) el = el.parentElement
    const t = el.innerText.replace(/[\s ]+/g, ' ').trim()
    const i = t.search(/Conflicts? by type/i)
    return { cls: String(el.className), text: t.slice(0, 200), conflicts: i >= 0 ? t.slice(i, i + 900) : 'NO Conflicts-by-type TEXT', hasFlyingName: /\+ flying/.test(t), hasPlanned: /\+ planned/.test(t) }
  })
  await R.shot(page, picName)
  if (info && /^Conflicts/.test(info.conflicts)) {
    await page.evaluate(() => { const e = [...document.querySelectorAll('*')].find(x => x.offsetWidth && x.children.length === 0 && /Conflicts? by type/i.test(x.innerText || '')); if (e) e.scrollIntoView({ block: 'center' }) })
    await sleep(500); await R.shot(page, picName + '-conflicts')
  }
  return info || { err: 'no insights panel found' }
}
async function closeInsights(Q, w, how, picName) {
  const { R, sleep } = Q
  const page = w.page
  const sel = 'text=Week insights'
  if (how === 'x') {
    const found = await page.evaluate(() => {
      const h = [...document.querySelectorAll('*')].find(e => e.offsetWidth && e.children.length === 0 && /^Week insights/.test((e.innerText || '').trim()))
      if (!h) return 'no heading'
      const el = h.closest('.modal-box') || h.parentElement
      const bs = [...el.querySelectorAll('button, [role=button]')].filter(b => b.offsetWidth && !/Show all/.test(b.innerText))
      const b = bs[0]; if (!b) return 'no button'
      b.setAttribute('data-w2x', '1'); return b.outerHTML.slice(0, 160)
    })
    console.log('insights close control', found)
    const x = page.locator('[data-w2x]').first()
    if (await x.count()) await C.hit(w, x); else return 'NO CLOSE FOUND'
  } else await page.keyboard.press('Escape')
  await sleep(600)
  if (picName) await R.shot(page, picName)
  const still = await page.evaluate(() => [...document.querySelectorAll('*')].some(e => e.offsetWidth && e.children.length === 0 && /^Week insights/.test((e.innerText || '').trim())))
  return still ? 'STILL OPEN' : 'closed'
}

export async function run({ kind, tag, man, di, iso, type, expect, other, msgRe, doPublish }) {
  const Q = await C.load()
  const { R, I, W, X, L, sleep, row } = Q
  const w = await R.world(kind)
  const { page } = w
  const id = w.ID(man), P = kind === 'phone' ? 'p-' : 'd-'
  const out = { tag, kind, man, id }
  console.log(`run ${tag} ${kind} man=${man} id=${id} day=${iso}`)
  // 1 filing
  const f = await C.fileInput(w, Q, iso, id, type, P + '00-input-form')
  out.filed = { added: f.added, nodoc: f.nodoc, types: f.opts.join(' ') }
  out.inputRow = await page.evaluate(([i]) => JSON.stringify(window.INPUTS.filter(x => JSON.stringify(x).includes('"' + i + '"') && /Jul 1[67]/.test(x.date || '')).map(x => ({ t: x.type, d: x.date, ad: x.allday, p: x.person, ppl: x.people }))), [id])
  console.log('filed', j(out.filed), out.inputRow)
  await R.shot(page, P + '01-after-filing')
  // 2 the board: a flying wave + a briefing row
  await L.board(page, di)
  const gi = await X.addWave(w, di, '')
  await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.to"]`, '10:00'); await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.ld"]`, '11:30')
  out.seatFly = await X.seatPhoneAware(w, `[data-slot="${di}.${gi}.0.0.p"]`, id)
  const g = await C.addGround(w, Q, di, 'BRIEFING', '09:00', '10:00')
  out.seatGround = await X.seatPhoneAware(w, `[data-fill="g:${di}.${g}.+"]`, id)
  console.log('seats', out.seatFly, out.seatGround)
  // (c) the board's issues list
  const bw = await X.boardWarn(page, w)
  out.board = bw.items.filter(t => t.includes(man))
  out.boardLineAttrs = await page.evaluate(m => [...document.querySelectorAll('#schedBoard .wln')].filter(e => e.offsetWidth && e.innerText.includes(m)).map(e => 'title=' + e.title + ' | ' + e.innerText.replace(/\s+/g, ' ').trim()), man)
  console.log('(c) board', j(out.board))
  await warnPic(Q, w, P + '02-c-board-issues')
  await R.shot(page, P + '02-c-board-whole')
  // (d) the board's own ⓘ? — the week's. Close the board, go to Edit Schedule
  await L.closeBoard(page)
  await L.go(page, 'editsched'); await sleep(700)
  // (a)
  const a = await dayStrip(Q, w, di, P + '03-a-edit-strip')
  out.edit = a.lines.filter(l => l.text.includes(man))
  console.log('(a) edit', j(out.edit))
  // (d)
  out.info = await dayInfoPop(Q, w, di, P + '04-d-dayinfo')
  console.log('(d) info', out.info.slice(0, 1500))
  out.infoClose = {}
  out.infoClose.x = await closeInfoPop(Q, w, 'x', P + '04-d-dayinfo-after-x')
  if (out.infoClose.x !== 'closed') {
    out.infoClose.esc = await closeInfoPop(Q, w, 'esc', P + '04-d-dayinfo-after-esc')
  }
  if (!kind.startsWith('x')) {
    // reopen, Escape, then outside
    await dayInfoPop(Q, w, di, P + '04-d-dayinfo-b')
    out.infoClose.esc2 = await closeInfoPop(Q, w, 'esc', P + '04-d-dayinfo-after-esc2')
    if (out.infoClose.esc2 !== 'closed') await closeInfoPop(Q, w, 'outside')
    await dayInfoPop(Q, w, di, P + '04-d-dayinfo-c')
    out.infoClose.outside = await closeInfoPop(Q, w, 'outside', P + '04-d-dayinfo-after-outside')
    if (out.infoClose.outside !== 'closed') await closeInfoPop(Q, w, 'esc')
  }
  console.log('info close', j(out.infoClose))
  if (kind === 'pc') {
    // (b) hide the flying one, struck line, Undo, Redo, Reset arrow
    const strip = page.locator(`#eWeek [data-dwbox="${di}"]`)
    const flyRe = new RegExp(man + ' — .*planned to fly')
    const lineIx = await page.evaluate(([d, re]) => { const r = new RegExp(re); const it = [...document.querySelectorAll(`#eWeek [data-dwbox="${d}"] .witem`)].find(e => r.test(e.innerText.replace(/\s+/g, ' '))); return it ? it.dataset.wix : null }, [di, flyRe.source])
    out.hideIx = lineIx
    if (lineIx !== null) {
      const btn = page.locator(`#eWeek [data-dwbox="${di}"] .witem-mute[data-woff="${di}.${lineIx}"]`).first()
      await btn.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
      await btn.click(); await sleep(700)
      const h1 = await dayStrip(Q, w, di, P + '05-b-hidden')
      out.hidden = h1.lines.filter(l => l.text.includes(man))
      out.hiddenHead = h1.head
      console.log('(b) hidden', j(out.hidden), h1.head)
      // undo / redo of the hide, from the top bar
      const u = await X.undoBtn(w, 'undo'); await sleep(500)
      const h2 = await dayStrip(Q, w, di, P + '05-b-after-undo')
      out.afterUndo = { r: u, lines: h2.lines.filter(l => l.text.includes(man)) , head: h2.head }
      const rr = await X.undoBtn(w, 'redo'); await sleep(500)
      const h3 = await dayStrip(Q, w, di, P + '05-b-after-redo')
      out.afterRedo = { r: rr, lines: h3.lines.filter(l => l.text.includes(man)), head: h3.head }
      console.log('undo', j(out.afterUndo), 'redo', j(out.afterRedo))
      // the Reset arrow on the struck line
      const reset = page.locator(`#eWeek [data-dwbox="${di}"] .witem-mute[data-woff="${di}.${lineIx}"]`).first()
      out.resetBtn = await reset.evaluate(e => e.outerHTML.slice(0, 200)).catch(() => 'none')
      await reset.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
      await reset.click(); await sleep(700)
      const h4 = await dayStrip(Q, w, di, P + '05-b-after-reset')
      out.afterReset = { lines: h4.lines.filter(l => l.text.includes(man)), head: h4.head }
      console.log('(b) reset', j(out.afterReset))
    }
    // (f) Insights
    out.insights = await insightsRead(Q, w, P + '06-f-insights')
    console.log('(f) insights', j(out.insights).slice(0, 1800))
    out.insightsClose = await closeInsights(Q, w, 'x', P + '06-f-insights-closed')
    if (out.insightsClose !== 'closed') out.insightsClose2 = await closeInsights(Q, w, 'esc', P + '06-f-insights-closed-esc')
    await C.hit(w, page.locator('#insightBtn:visible').first()); await sleep(900)
    out.insightsEsc = await closeInsights(Q, w, 'esc', P + '06-f-insights-closed-by-esc')
    console.log('insights close x:', out.insightsClose, 'esc:', out.insightsEsc)
  }
  // (g) Logic
  out.logic = await logicRead(Q, w, P + '07', kind === 'pc' ? ['planned', 'leave', 'flying', 'downchit'] : ['planned', 'flying'])
  console.log('(g)', j(out.logic).slice(0, 2500))
  // (e) publish (PC), View-only Sched
  if (doPublish) {
    await L.go(page, 'editsched'); await sleep(600)
    const sp = await X.signAndPublish(w, di)
    out.publish = { p: sp.p, h: sp.h }
    console.log('publish', j(out.publish))
    await L.closeBoard(page)
    await L.go(page, 'viewsched'); await sleep(900)
    const vs = await X.stripItems(page, '#vWeek', di)
    out.view = { head: vs.head, lines: vs.items.filter(t => t.includes(man)) }
    await X.pic(page, P + '08-e-view-strip', `#vWeek [data-dwbox="${di}"]`, { pad: 8 })
    console.log('(e) view', j(out.view))
  }
  out.errors = w.errors
  console.log('errors', j(w.errors))
  return { w, Q, out, id }
}
