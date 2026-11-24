// Walker c — C4, publishing a day no Leave War period covers (copied from words-r4.mjs s2), the week of 31 Jan 2028.
// Run: node scripts/handpass/wr4-c-c4.mjs [a,b,c,f]   (a also walks d and e)
console.log('wr4-c-c4 v3')
const C = await (await import('./wr4-c-common.mjs')).setup('c4')
const { newPage, signIn, handOver, go, sleep, judge, save, note, noteGone, bundleOf, log, shot, finish, shownToast, fileInput, answerAsks, press } = C
const ONLY = (process.argv[2] || 'a,b,c,f').split(',')
const SENT = 'No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War.'
const EXP_A = 'Saturday published and approved · ' + SENT

async function toWeek(w) {
  await go(w.page, 'editsched')
  await w.page.evaluate(() => window.loadWeek('31/01/2028')); await sleep(1200)
  const wk = await w.page.evaluate(() => window.DAYS.map(d => `${d.dow} ${d.dt}`))
  if (!/Jan 31/.test(wk[0])) throw new Error('week not loaded: ' + JSON.stringify(wk))
  return wk
}
const openBoard = async (w, di) => { await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900) }
const closeBoard = async w => { const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(600) } }
/* a man on day `di`: the board's "+ Item" on an empty day, times typed, an empty place armed, a free name pressed */
async function plant(w, c, di, tag) {
  await openBoard(w, di)
  const findEmpty = () => w.page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .seat[data-slot], #schedBoard [data-fill]')].find(x => x.getBoundingClientRect().width > 4 && !x.querySelector('.puck[data-person]')); return e ? (e.getAttribute('data-slot') || e.getAttribute('data-fill')) : null })
  let empty = await findEmpty()
  if (!empty) {
    const add = w.page.locator(`#schedBoard [data-gradd="${di}"]`).first()
    if (await add.count()) {
      await add.scrollIntoViewIfNeeded(); await add.click(); await sleep(700)
      for (const [f, v] of [['str', '0800'], ['end', '1600']]) {
        const box = w.page.locator(`#schedBoard [data-txt^="gr:${di}."][data-txt$=".${f}"], #schedBoard [data-bfld^="gr:${di}."][data-bfld$=".${f}"]`).first()
        if (await box.count()) { await box.scrollIntoViewIfNeeded(); await box.click(); const tg = await box.evaluate(e => e.tagName); if (tg === 'INPUT') await box.fill(v); else { await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(v) } await w.page.keyboard.press('Tab'); await sleep(300) }
      }
      empty = await findEmpty()
    }
  }
  if (!empty) { log(c, 'no empty place on day ' + di); await closeBoard(w); return null }
  const place = w.page.locator(`#schedBoard [data-slot="${empty}"], #schedBoard [data-fill="${empty}"]`).first()
  await place.scrollIntoViewIfNeeded(); await place.click(); await sleep(300)
  const man = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].find(x => x.offsetParent && !x.classList.contains('no') && !x.classList.contains('busy') && window.PEOPLE[x.getAttribute('data-person')] && !window.PEOPLE[x.getAttribute('data-person')].special); return e ? e.getAttribute('data-person') : null })
  await noteGone(w, 4000)
  await w.page.locator(`#sbRoster .rpuck[data-person="${man}"]:visible`).first().click()
  const r = await note(w, c, `c4-${tag}-plant`, /./, 3000)
  log(c, `planted ${man} on ${empty} (day ${di}): note ${JSON.stringify(r.text || r.now)}`)
  await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300)
  return { man, empty, plantNote: r.text || r.now }
}
async function sign(w, di, root = '#eWeek') {
  if (root === '#eWeek') { await go(w.page, 'editsched'); await w.page.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const sc = d && (d.closest('.week') || d.parentElement); if (sc && d) sc.scrollLeft = d.offsetLeft; scrollTo(0, 0) }, di); await sleep(400) }
  const signed = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = w.page.locator(`${root} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { signed[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0]); await sleep(250)
    signed[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return signed
}
/* press the day's publish (the beak, or the amendment's), answer a confirm, read the note */
async function publish(w, c, di, root, name, attr = 'data-beak', leaveOil = false) {
  const pub = w.page.locator(`${root} [${attr}="${di}"]:visible`).first()
  if (!(await pub.count())) return { err: 'no ' + attr }
  if (await pub.isDisabled()) return { err: 'greyed: ' + await pub.getAttribute('title') }
  await pub.scrollIntoViewIfNeeded()
  await noteGone(w, 5000)
  if (w.tap) {
    await pub.tap()
    await sleep(60); await w.page.screenshot({ path: `${process.env.WR4_OUT}/${name}-righttap.png` })
  } else await pub.click()
  await sleep(400)
  const dlg = await w.page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /^(Publish|Yes|Confirm)/.test(x.textContent.trim()) && x.closest('[role="dialog"], .airpop, .modal, .upconf-pop')); return b ? b.textContent.trim() : null })
  if (dlg) { const ok = w.page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first(); if (w.tap) await ok.tap(); else await ok.click() }
  let asked
  if (leaveOil) {
    await sleep(400); asked = []
    if (await w.page.locator('[data-testid="oilconf"]:visible').count()) {
      const lbl = await w.page.locator('[data-testid="oilconf-cancel"]').innerText()
      await shot(w.page, c, name + '-oilq', await C.boxOf(w.page, ['[data-testid="oilconf"] .upconf-box'], 10), lbl, w.size)
      asked.push('oil question: pressed ' + JSON.stringify(lbl)); await w.page.locator('[data-testid="oilconf-cancel"]').click()
    }
  } else asked = await answerAsks(w)
  const r = await note(w, c, name, /published|approved|amend|Leave War/i, 6000)
  return { dialog: dlg, asked, ...r }
}
/* the day's warning list, as drawn on the week (.witem) and on the board (.wln…), lines that speak of a period */
async function warnLines(w, di) {
  const read = sel => w.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => /Leave War period/i.test(e.textContent || '')).map(e => ({ shown: e.getBoundingClientRect().width > 2, text: (e.textContent || '').replace(/\s+/g, ' ').trim() })), sel)
  await go(w.page, 'editsched')
  let week = await read(`#eWeek .witem[data-wdi="${di}"], .witem[data-wdi="${di}"]`)
  await openBoard(w, di)
  const board = await read('#schedBoard [class*="wln"]:not(.wln-act)')
  await shot(w.page, 'C4', `c4-warnlist-board-${w.size}-${di}`, await C.boxOf(w.page, ['#schedBoard [class*="wln"]'], 16), board, w.size)
  await closeBoard(w)
  return { week, board }
}

async function caseA() {
  const c = 'C4'
  const w = await newPage('desk'); await signIn(w, 'ad'); log(c, 'bundle: ' + await bundleOf(w.page))
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x)); const MON = 0
  const p = await plant(w, c, SAT, 'a'); if (!p) { judge(c, 'a desk', 'NOT WALKED', 'nothing to put a man in', EXP_A); return }
  judge(c, 'a plant note desk', 'RECORD', p.plantNote, '', 'c4-a-plant.png')
  await closeBoard(w)
  const s = await sign(w, SAT)
  const r = await publish(w, c, SAT, '#eWeek', 'c4-a-publish-desk')
  judge(c, 'a publish desk', r.text === EXP_A ? 'PASS' : 'FAIL', { signed: s, ...r }, EXP_A, r.pic)
  judge(c, 'a one full stop at end', /\.$/.test(r.text || '') && !/\.\.$/.test(r.text || '') ? 'PASS' : 'FAIL', (r.text || '').slice(-30), 'ends "Leave War."')
  const wl = await warnLines(w, SAT)
  const all = [...wl.week, ...wl.board].map(x => x.text)
  judge(c, 'a warning list same sentence', all.length && all.some(t => t.includes(SENT)) ? 'PASS' : 'FAIL', wl, 'contains: ' + SENT, `c4-warnlist-board-desk-${SAT}.png`)
  /* (d) an amendment published on that Saturday: one more man, then its publish */
  const p2 = await plant(w, c, SAT, 'd'); await closeBoard(w)
  await go(w.page, 'editsched'); await sleep(300)
  const attrs = await w.page.evaluate(i => [...document.querySelectorAll(`#eWeek [data-alpub="${i}"], #eWeek [data-beak="${i}"]`)].map(e => ({ a: e.hasAttribute('data-alpub') ? 'alpub' : 'beak', dis: e.disabled, t: e.getAttribute('title'), shown: e.getBoundingClientRect().width > 2 })), SAT)
  log(c, 'after the change, the Saturday\'s publish buttons: ' + JSON.stringify(attrs))
  let rd = await publish(w, c, SAT, '#eWeek', 'c4-d-amend-desk', 'data-alpub')
  if (rd.err) { const s2 = await sign(w, SAT); log(c, 'signed again ' + JSON.stringify(s2)); rd = await publish(w, c, SAT, '#eWeek', 'c4-d-amend-desk', 'data-alpub') }
  judge(c, 'd amendment desk', 'RECORD', { planted: p2 && p2.man, ...rd }, '', rd.pic)
  /* (e) a weekday of that week */
  const pe = await plant(w, c, MON, 'e'); await closeBoard(w)
  const se = await sign(w, MON)
  const re = await publish(w, c, MON, '#eWeek', 'c4-e-monday-desk')
  judge(c, 'e weekday desk', re.text && !/Leave War period/i.test(re.text) ? 'PASS' : (re.text ? 'FAIL' : 'NOT WALKED'), { planted: pe && pe.man, signed: se, ...re }, 'no no-period sentence', re.pic)
  await w.ctx.close()
}

async function caseB() {
  const c = 'C4'
  /* a member's weekend request: Ranger files it, its OIL question is put away unanswered (InputWindow's "Not answered yet") */
  let w = await newPage('desk'); await signIn(w, 'us')
  const made = await fileInput(w, c, '2028-02-05', { type: 'Training', people: ['bane'], from: '09:00', to: '11:00', title: 'Range brief' })
  if (!made) { judge(c, 'b desk', 'NOT WALKED', 'Ranger could not file his Saturday input', ''); await w.ctx.close(); return }
  w = await handOver(w, 'desk', 'ad')
  /* Saber opens it: does its window say the question is unanswered? (read only; nothing pressed) */
  await C.openDay(w, '2028-02-05')
  const card = w.page.locator(`[data-testid="win-inputsday"] [data-iid="${made}"], [data-testid="win-inputsday"] [data-popiid="${made}"]`).first()
  let unanswered = '(no card)'
  if (await card.count()) {
    await press(w, card); await w.page.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 }); await sleep(400)
    unanswered = await w.page.locator('[data-testid="oil-unanswered"]').innerText().catch(() => '(no unanswered line)')
    await shot(w.page, c, 'c4-b-window-desk', await C.boxOf(w.page, ['[data-testid="win-inputedit"]'], 8), unanswered, w.size)
    await w.page.keyboard.press('Escape'); await sleep(300)
    const d = w.page.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {})
  }
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  log(c, '(b) the window\'s OIL line: ' + JSON.stringify(unanswered))
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x))
  const p = await plant(w, c, SAT, 'b'); await closeBoard(w)
  const s = await sign(w, SAT)
  const r = await publish(w, c, SAT, '#eWeek', 'c4-b-publish-desk', 'data-beak', true)
  const t = r.text || ''
  judge(c, 'b publish with OIL open desk', 'RECORD', { unanswered, planted: p && p.man, signed: s, ...r }, 'no "..", no sentence with a small letter, the no-period sentence once', r.pic)
  judge(c, 'b checks', t && !/\.\./.test(t) && (t.split(SENT).length - 1) === 1 && !/[.]\s+[a-z]/.test(t) ? 'PASS' : 'FAIL', { doubleDot: /\.\./.test(t), periodSentences: t.split(SENT).length - 1, smallStart: (t.match(/[.·:]\s+[a-z][^ ]*/g) || []) }, 'all three hold')
  await w.ctx.close()
}

/* (b), attempt 3: Ranger files his Saturday Training and, at the OIL question, presses its other button (or its ✕) */
async function caseG() {
  const c = 'C4'
  let w = await newPage('desk'); await signIn(w, 'us')
  await C.openDay(w, '2028-02-05')
  const before = await C.ids(w.page)
  await press(w, '#icPopAdd'); await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', 'Training')
  if (await w.page.locator('#inpEditSpan [data-span="custom"]').count()) await press(w, '#inpEditSpan [data-span="custom"]')
  else { const ad = w.page.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click() }
  await w.page.fill('#inpEditPop #inpEditStart', '09:00'); await w.page.fill('#inpEditPop #inpEditEnd', '11:00')
  const t = w.page.locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill('Range brief')
  const steps = []
  for (const how of ['cancel', 'x']) {
    await press(w, '#inpEditSave'); await sleep(500)
    if (await w.page.locator('[data-testid="docconf-nodoc"]:visible').count()) { steps.push('document'); await press(w, '[data-testid="docconf-nodoc"]'); await sleep(400) }
    if (!(await w.page.locator('[data-testid="oilconf"]:visible').count())) { steps.push('no OIL question'); break }
    const lbl = how === 'cancel' ? await w.page.locator('[data-testid="oilconf-cancel"]').innerText() : '✕'
    await shot(w.page, c, `c4-g-oilq-${how}-desk`, await C.boxOf(w.page, ['[data-testid="oilconf"] .upconf-box'], 10), lbl, w.size)
    await press(w, how === 'cancel' ? '[data-testid="oilconf-cancel"]' : '[data-testid="oilconf"] .airpop-head .x'); await sleep(500)
    const made = (await C.ids(w.page)).filter(x => !before.includes(x))
    steps.push({ pressed: lbl, made, windowOpen: await w.page.locator('[data-testid="win-inputedit"]:visible').count(), note: await shownToast(w.page) })
    if (made.length) break
  }
  const made = (await C.ids(w.page)).filter(x => !before.includes(x))
  log(c, '(b3) Ranger at the OIL question: ' + JSON.stringify(steps))
  judge(c, 'b3 the question left unanswered', 'RECORD', steps, 'a door that files the input with its question unanswered', `c4-g-oilq-cancel-desk.png`)
  if (!made.length) { judge(c, 'b publish with OIL open', 'NOT WALKED', '3 attempts: Saber Back, Ranger answered by the helper, Ranger Back / ✕ — no door left the input filed with its question open', ''); await w.ctx.close(); return }
  w = await handOver(w, 'desk', 'ad')
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x))
  await plant(w, c, SAT, 'g'); await closeBoard(w)
  const s = await sign(w, SAT)
  const r = await publish(w, c, SAT, '#eWeek', 'c4-g-publish-desk', 'data-beak', true)
  const tx = r.text || ''
  judge(c, 'b3 publish with OIL open desk', 'RECORD', { signed: s, ...r }, 'no "..", no small-letter sentence, the no-period sentence once', r.pic)
  judge(c, 'b3 checks', tx && !/\.\./.test(tx) && (tx.split(SENT).length - 1) === 1 && !/[.]\s+[a-z]/.test(tx) ? 'PASS' : 'FAIL', { doubleDot: /\.\./.test(tx), periodSentences: tx.split(SENT).length - 1 }, 'all hold')
  await w.ctx.close()
}

async function caseBold() {
  const c = 'C4'
  const w = await newPage('desk'); await signIn(w, 'ad')
  const wkIso = '2028-02-05'
  /* an input on the Saturday, its OIL question left: filed through the Inputs calendar, the question's other button pressed */
  await C.openDay(w, wkIso)
  const before = await C.ids(w.page)
  await press(w, '#icPopAdd'); await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', 'Training')
  if (await w.page.locator('#inpEditPop #inpEditPerson').count()) await w.page.selectOption('#inpEditPop #inpEditPerson', 'bane')
  if (await w.page.locator('#inpEditSpan [data-span="custom"]').count()) await press(w, '#inpEditSpan [data-span="custom"]')
  else { const ad = w.page.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click() }
  await w.page.fill('#inpEditPop #inpEditStart', '09:00'); await w.page.fill('#inpEditPop #inpEditEnd', '11:00')
  await press(w, '#inpEditSave'); await sleep(500)
  const asks = []
  for (let i = 0; i < 4; i++) {
    if (await w.page.locator('[data-testid="docconf-nodoc"]:visible').count()) { asks.push('document'); await press(w, '[data-testid="docconf-nodoc"]'); continue }
    if (await w.page.locator('[data-testid="oilconf"]:visible').count()) {
      const lbl = await w.page.locator('[data-testid="oilconf-cancel"]').innerText()
      await shot(w.page, c, 'c4-b-oilquestion-desk', await C.boxOf(w.page, ['[data-testid="oilconf"] .upconf-box'], 10), lbl, w.size)
      asks.push('oil: pressed ' + JSON.stringify(lbl)); await press(w, '[data-testid="oilconf-cancel"]'); await sleep(400); continue
    }
    break
  }
  const made = (await C.ids(w.page)).filter(x => !before.includes(x))
  log(c, `(b) the Saturday's input: asks ${JSON.stringify(asks)}; made ${JSON.stringify(made)}; note ${JSON.stringify(await shownToast(w.page))}; window open ${await w.page.locator('[data-testid="win-inputedit"]:visible').count()}`)
  if (await w.page.locator('[data-testid="win-inputedit"]:visible').count()) { await w.page.keyboard.press('Escape'); await sleep(300); const d = w.page.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {}) }
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  if (!made.length) { judge(c, 'b desk', 'NOT WALKED', { asks }, 'the input with its question left'); await w.ctx.close(); return }
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x))
  const p = await plant(w, c, SAT, 'b'); await closeBoard(w)
  const s = await sign(w, SAT)
  const r = await publish(w, c, SAT, '#eWeek', 'c4-b-publish-desk')
  const t = r.text || ''
  judge(c, 'b publish with OIL open desk', 'RECORD', { asks, planted: p && p.man, signed: s, ...r }, 'no "..", no sentence with a small letter, the no-period sentence once', r.pic)
  judge(c, 'b checks', !/\.\./.test(t) && (t.split(SENT).length - 1) === 1 && !/[.·]\s+[a-z]/.test(t) ? 'PASS' : 'FAIL', { doubleDot: /\.\./.test(t), periodSentences: t.split(SENT).length - 1, smallStart: (t.match(/[.·]\s+[a-z][^ ]*/g) || []) }, 'all three hold')
  await w.ctx.close()
}

async function caseC() {
  const c = 'C4'
  const w = await newPage('desk'); await signIn(w, 'ad')
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x))
  const p = await plant(w, c, SAT, 'c')
  if (!(await w.page.locator('#schedBoard:visible').count())) await openBoard(w, SAT)
  const s = await sign(w, SAT, '#schedBoard')
  const r = await publish(w, c, SAT, '#schedBoard', 'c4-c-publish-board-desk')
  judge(c, 'c publish from board desk', r.text === EXP_A ? 'PASS' : 'FAIL', { planted: p && p.man, signed: s, ...r }, EXP_A, r.pic)
  await w.ctx.close()
}

async function caseF() {
  const c = 'C4'
  let w = await newPage('desk'); await signIn(w, 'ad')
  const wk = await toWeek(w); const SAT = wk.findIndex(x => /^Sat/.test(x))
  await plant(w, c, SAT, 'f'); await closeBoard(w)
  const s = await sign(w, SAT)
  w = await handOver(w, 'phone', 'ad')
  await toWeek(w)
  const pubs = await w.page.evaluate(i => [...document.querySelectorAll(`[data-beak="${i}"]`)].map(e => ({ shown: e.getBoundingClientRect().width > 2, dis: e.disabled })), SAT)
  log(c, 'phone: the Saturday\'s publish buttons ' + JSON.stringify(pubs))
  /* bring the Saturday's head into view the way the week does it on a phone: the day strip scrolled to it */
  await w.page.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); d && d.scrollIntoView({ block: 'start', inline: 'start' }) }, SAT); await sleep(500)
  const r = await publish(w, c, SAT, '#eWeek', 'c4-f-publish-phone')
  judge(c, 'f publish phone', r.text === EXP_A ? 'PASS' : 'FAIL', { signed: s, ...r }, EXP_A, r.pic)
  const g = r.geo
  if (g) judge(c, 'f note box on screen phone', g.l >= 0 && g.r <= g.vw && g.t >= 0 && g.b <= g.vh && g.sw <= g.vw ? 'PASS' : 'FAIL', g, 'inside 402x874, no sideways scroll', r.pic)
  const inner = await w.page.evaluate(() => { const e = document.getElementById('toastEl'); return e ? { scrollW: e.scrollWidth, clientW: e.clientWidth } : null })
  log(c, 'phone note inner ' + JSON.stringify(inner))
  await w.ctx.close()
}

for (const [k, f] of [['a', caseA], ['b', caseB], ['c', caseC], ['f', caseF], ['g', caseG]]) {
  if (!ONLY.includes(k)) continue
  try { await f() } catch (e) { console.log('ERR', k, e.message.split('\n')[0]); C.facts.errors.push(k + ' ' + e.stack) }
  save()
}
save(); await finish()
console.log('errors:', C.facts.errors.length, C.facts.errors.slice(0, 5).map(s => s.slice(0, 200)))
