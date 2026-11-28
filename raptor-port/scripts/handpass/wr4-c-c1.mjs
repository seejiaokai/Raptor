// Walker c — C1, a time the app cannot read, typed at every door (copied from words-r4.mjs q4a).
// Run: node scripts/handpass/wr4-c-c1.mjs [desk|phone|ranger|all]
console.log('wr4-c-c1 v1')
const C = await (await import('./wr4-c-common.mjs')).setup('c1')
const { newPage, signIn, handOver, go, press, sleep, judge, save, note, noteGone, bundleOf, log, shot, finish, fileInput, recOf, openDay, RANGER, HEX, WED } = C
const ARG = process.argv[2] || 'all'
const EXP = v => `${v} is not a time. Try 0900 or 09:00.`
const LONG = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz01234567'   // 60 letters

const nCount = page => page.evaluate(() => (window.NOTICES || []).length)
/* the box's words now, read fresh by its key attribute (the row is redrawn after a commit) */
const boxNow = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); return e ? (e.tagName === 'INPUT' ? e.value : (e.textContent || '').trim()) : null }, sel)
const visible = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); if (!e) return false; e.scrollIntoView({ block: 'center', inline: 'center' }); return true }, sel)

/* type `v` in the box `sel`, leave by `how` (Tab | Enter); read the note, the box after, the record, the bell count */
async function typeAt(w, c, step, sel, v, how, iid, expected, pic = true) {
  if (!(await visible(w.page, sel))) { judge(c, step, 'NOT WALKED', 'box not drawn: ' + sel, expected); return null }
  await noteGone(w)
  const was = await boxNow(w.page, sel), recB = iid ? await recOf(w.page, iid) : null, nB = await nCount(w.page)
  const el = w.page.locator(sel).filter({ visible: true }).first()
  const tag = await el.evaluate(e => e.tagName)
  if (w.tap) { await el.tap(); } else await el.click()
  await sleep(w.tap ? 250 : 100)
  if (tag === 'INPUT') { await el.fill('') ; await w.page.keyboard.type(v, { delay: 10 }) } else { await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(v, { delay: 10 }) }
  await w.page.keyboard.press(how)
  const r = await note(w, c, pic ? `c1-${step}` : `c1-${step}`, /./, 3500)
  await sleep(500)
  const after = await boxNow(w.page, sel), recA = iid ? await recOf(w.page, iid) : null, nA = await nCount(w.page)
  const out = { typed: v, how, was, note: r.text || r.now || '', boxAfter: after, recChanged: JSON.stringify(recB) !== JSON.stringify(recA), recAfter: recA && { s: recA.s, e: recA.e, allday: recA.allday }, notices: nA - nB, active: await w.page.evaluate(() => document.activeElement?.getAttribute('data-inp') || document.activeElement?.getAttribute('data-ifld') || document.activeElement?.tagName), geo: r.geo }
  let verdict = 'RECORD'
  if (expected != null) verdict = out.note === expected && out.boxAfter === was && !out.recChanged && out.notices === 0 ? 'PASS' : 'FAIL'
  judge(c, step, verdict, out, expected, r.pic)
  return out
}
/* a good time typed afresh after a refusal (lesson 16): tap away, tap the box, type; EXPECTED it saves */
async function goodAt(w, c, step, sel, v, iid, field, want) {
  await w.page.mouse.click(5, w.page.viewportSize().height - 5).catch(() => {}); await sleep(300)
  if (!(await visible(w.page, sel))) { judge(c, step, 'NOT WALKED', 'box not drawn', want); return }
  await noteGone(w, 5000)
  const el = w.page.locator(sel).filter({ visible: true }).first(); const tag = await el.evaluate(e => e.tagName)
  if (w.tap) await el.tap(); else await el.click(); await sleep(200)
  if (tag === 'INPUT') { await el.fill(''); await w.page.keyboard.type(v) } else { await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(v) }
  await w.page.keyboard.press('Tab')
  const r = await note(w, c, `c1-${step}`, /./, 2500)
  await sleep(600)
  const rec = await recOf(w.page, iid), box = await boxNow(w.page, sel)
  const got = field === 'str' ? rec?.s : rec?.e
  const hm = typeof got === 'number' ? String(Math.floor(got / 60)).padStart(2, '0') + ':' + String(got % 60).padStart(2, '0') : got
  judge(c, step, hm === want && box === want ? 'PASS' : 'FAIL', { typed: v, saved: hm, box, note: r.text || r.now || '' }, want, r.pic)
}

/* the full set at one door: start / end keys of the row `base` (selector stem ending before ".str") */
async function door(w, c, tag, stem, iid, full) {
  const S = `${stem}.str"]`, E = `${stem}.end"]`
  await typeAt(w, c, `${tag}-2560-tab`, S, '2560', 'Tab', iid, EXP('2560'))
  await typeAt(w, c, `${tag}-2560-enter`, S, '2560', 'Enter', iid, EXP('2560'))
  await typeAt(w, c, `${tag}-0975-end`, E, '0975', 'Tab', iid, EXP('0975'))
  if (full) {
    for (const v of ['abc', '25:00', '0960']) await typeAt(w, c, `${tag}-${v.replace(':', '')}`, S, v, 'Tab', iid, EXP(v))
    await typeAt(w, c, `${tag}-spaces`, S, '  2560  ', 'Tab', iid, EXP('2560'))
    await typeAt(w, c, `${tag}-9`, S, '9', 'Tab', iid, null)
    await typeAt(w, c, `${tag}-long`, S, LONG, 'Tab', iid, null)
  }
  await goodAt(w, c, `${tag}-good-0900`, S, '0900', iid, 'str', '09:00')
  await goodAt(w, c, `${tag}-setup-0800`, S, '0800', iid, 'str', '08:00')
  await goodAt(w, c, `${tag}-good-09colon00`, S, '09:00', iid, 'str', '09:00')
}

async function toWeekDay(w, iso) {
  await go(w.page, 'editsched'); await w.page.evaluate(() => scrollTo(0, 0))
  const di = await w.page.evaluate(iso => { const [y, m, d] = iso.split('-').map(Number); const mon = new Date(y, m - 1, d).toLocaleString('en', { month: 'short' }); return window.DAYS.findIndex(x => x.dt === `${mon} ${d}`) }, iso)
  return di
}
async function openFold(w, di, iid) {
  const sel = `#eWeek [data-inp^="${iid}"]`
  if (await visible(w.page, sel)) return true
  const tog = w.page.locator(`#eWeek [data-pitog="${di}"]`)
  for (let i = 0; i < (await tog.count()); i++) { await tog.nth(i).evaluate(e => e.click()); await sleep(300); if (await visible(w.page, sel)) return true }
  return visible(w.page, sel)
}

async function makeWorld() {
  const w = await newPage('desk'); await signIn(w, 'ad')
  log('C1', 'bundle desk: ' + await bundleOf(w.page))
  const iT = await fileInput(w, 'C1', WED, { type: 'Training', people: [RANGER], from: '10:00', to: '11:00', title: 'Range brief' })
  const iL = await fileInput(w, 'C1', WED, { type: 'LL', people: [RANGER, HEX], span: 'all' })
  const iT2 = await fileInput(w, 'C1', WED, { type: 'Training', people: [RANGER, HEX], from: '13:00', to: '14:00', title: 'Sim brief' })
  log('C1', 'filed ' + JSON.stringify({ iT, iL, iT2, recT: await recOf(w.page, iT), recL: await recOf(w.page, iL), recT2: await recOf(w.page, iT2) }))
  return { w, iT, iL, iT2 }
}

async function scheduleDoors(w, sz, iT, iL, iT2, full) {
  const c = 'C1'
  const di = await toWeekDay(w, WED)
  log(c, `Wed index ${di}`)
  /* the take-off box of the week, for comparison (q4a (1)) */
  const ff = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek [data-txt^="ff:"][data-txt$=".to"]')].find(x => x.getBoundingClientRect().width > 4); return e ? e.getAttribute('data-txt') : null })
  if (ff) await typeAt(w, c, `takeoff-2560-${sz}`, `#eWeek [data-txt="${ff}"]`, '2560', 'Tab', null, EXP('2560'))
  else judge(c, `takeoff ${sz}`, 'NOT WALKED', 'no take-off box drawn', '')
  /* door 1: the Training's own row on Edit Schedule */
  if (await openFold(w, di, iT)) {
    const keys = await w.page.evaluate(i => [...document.querySelectorAll(`#eWeek [data-inp^="${i}"]`)].map(e => e.getAttribute('data-inp')), iT)
    log(c, 'door 1 keys ' + JSON.stringify(keys))
    await door(w, c, `d1-week-${sz}`, `#eWeek [data-inp="${iT}`, iT, full)
  } else judge(c, `d1 ${sz}`, 'NOT WALKED', 'the Training row has no time box on the week', '')
  /* door 3: one man's row of the LL shared by two (the Unavailable list) */
  if (await openFold(w, di, iL)) {
    const keys = await w.page.evaluate(i => [...document.querySelectorAll(`#eWeek [data-inp^="${i}"]`)].filter(e => e.getBoundingClientRect().width > 2).map(e => e.getAttribute('data-inp')), iL)
    log(c, 'door 3 keys (LL for two) ' + JSON.stringify(keys))
    const one = keys.find(k => k.includes(`~${RANGER}.`)) || keys[0]
    if (one) {
      const stem = one.replace(/\.(str|end|rmks)$/, '')
      await door(w, c, `d3-week-${sz}`, `#eWeek [data-inp="${stem}`, iL, false)
      judge(c, `d3 who ${sz}`, 'RECORD', { rowKey: stem, recAfter: await recOf(w.page, iL) }, '')
    }
  } else judge(c, `d3 ${sz}`, 'NOT WALKED', 'the two-man LL has no time box on the week', '')
  /* the shared Training: ONE row for both on the week (D735) */
  if (await openFold(w, di, iT2)) {
    const keys = await w.page.evaluate(i => [...document.querySelectorAll(`#eWeek [data-inp^="${i}"]`)].filter(e => e.getBoundingClientRect().width > 2).map(e => e.getAttribute('data-inp')), iT2)
    judge(c, `d3b shared Training rows ${sz}`, 'RECORD', keys, '')
    if (keys[0]) await typeAt(w, c, `d3b-week-2560-${sz}`, `#eWeek [data-inp="${keys[0].replace(/\.(str|end|rmks)$/, '')}.str"]`, '2560', 'Tab', iT2, EXP('2560'))
  }
  /* door 2: the same row on the Scheduler Board */
  await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
  const bkeys = await w.page.evaluate(([a, b]) => [...document.querySelectorAll('#schedBoard [data-ifld]')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.getAttribute('data-ifld')).filter(k => k.startsWith(a) || k.startsWith(b)), [iT, iL])
  log(c, 'board keys ' + JSON.stringify(bkeys))
  if (bkeys.some(k => k.startsWith(iT))) await door(w, c, `d2-board-${sz}`, `#schedBoard [data-ifld="${iT}`, iT, full)
  else judge(c, `d2 ${sz}`, 'NOT WALKED', 'no time box for the Training on the board', '')
  const lk = bkeys.find(k => k.startsWith(iL) && k.includes(RANGER)) || bkeys.find(k => k.startsWith(iL))
  if (lk) await typeAt(w, c, `d3-board-2560-${sz}`, `#schedBoard [data-ifld="${lk.replace(/\.(str|end|rmks)$/, '')}.str"]`, '2560', 'Tab', iL, EXP('2560'))
  const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(600) }
}

/* door 4: the Inputs list — any in-place time box?  door 5: the input's own window */
async function inputsDoors(w, sz, iid, who) {
  const c = 'C1'
  await go(w.page, 'inputs')
  if (await w.page.locator('#inListBtn').count()) await press(w, '#inListBtn')
  await sleep(400)
  const inplace = await w.page.evaluate(() => [...document.querySelectorAll('#inputsPage [contenteditable="true"], .inputs-list input[type="time"], .inputs-list input[type="text"], [data-testid="inputs-list"] input')].filter(e => e.getBoundingClientRect().width > 2).length)
  const anyEditable = await w.page.evaluate(() => [...document.querySelectorAll('[contenteditable="true"]')].filter(e => e.getBoundingClientRect().width > 2).length)
  await shot(w.page, c, `c1-d4-list-${who}-${sz}`, { x: 0, y: 0, ...w.page.viewportSize() }, { inplace, anyEditable }, w.size)
  judge(c, `d4 inputs list ${who} ${sz}`, 'RECORD', { inPlaceTimeBoxes: inplace, contentEditableOnPage: anyEditable }, 'say if none', `c1-d4-list-${who}-${sz}.png`)
  /* door 5 */
  await openDay(w, WED)
  const card = w.page.locator(`[data-testid="win-inputsday"] [data-iid="${iid}"], [data-testid="win-inputsday"] [data-popiid="${iid}"]`).first()
  if (!(await card.count())) { judge(c, `d5 ${who} ${sz}`, 'NOT WALKED', 'no card for the input on its day', ''); return }
  await press(w, card)
  await w.page.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 }); await sleep(400)
  const st = w.page.locator('#inpEditStart')
  if (!(await st.count())) { judge(c, `d5 ${who} ${sz}`, 'RECORD', 'no Start box in the window', ''); return }
  const recB = await recOf(w.page, iid), nB = await nCount(w.page)
  const type = await st.getAttribute('type'), disabled = await st.isDisabled()
  if (!disabled) { if (w.tap) await st.tap(); else await st.click(); await sleep(200); await w.page.keyboard.type('2560', { delay: 30 }) }
  const v1 = await st.inputValue()
  await shot(w.page, c, `c1-d5-typed-${who}-${sz}`, await C.boxOf(w.page, ['[data-testid="win-inputedit"]'], 10), { type, disabled, value: v1 }, w.size)
  await noteGone(w, 4000)
  await press(w, '#inpEditSave')
  const r = await note(w, c, `c1-d5-save-${who}-${sz}`, /./, 3500)
  const asked = await C.answerAsks(w)
  await sleep(500)
  const recA = await recOf(w.page, iid), nA = await nCount(w.page)
  judge(c, `d5 window ${who} ${sz}`, 'RECORD', { boxType: type, disabled, valueAfterTyping2560: v1, saveNote: r.text || r.now || '', asked, recBefore: recB && { s: recB.s, e: recB.e }, recAfter: recA && { s: recA.s, e: recA.e }, notices: nA - nB }, 'can a bad time be entered at all; what Save answers', r.pic || `c1-d5-typed-${who}-${sz}.png`)
  if (await w.page.locator('[data-testid="win-inputedit"]:visible').count()) { await w.page.keyboard.press('Escape'); await sleep(300); const d = w.page.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {}) }
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
}

try {
  let { w, iT, iL, iT2 } = await makeWorld()
  if (ARG === 'all' || ARG === 'desk') {
    try { await scheduleDoors(w, 'desk', iT, iL, iT2, true) } catch (e) { console.log('ERR desk sched', e.message.split('\n')[0]); C.facts.errors.push('desk sched ' + e.stack) }
    try { await inputsDoors(w, 'desk', iT, 'saber') } catch (e) { console.log('ERR desk inputs', e.message.split('\n')[0]); C.facts.errors.push('desk inputs ' + e.stack) }
  }
  if (ARG === 'all' || ARG === 'phone') {
    w = await handOver(w, 'phone', 'ad')
    log('C1', 'bundle phone: ' + await bundleOf(w.page))
    try { await scheduleDoors(w, 'phone', iT, iL, iT2, false) } catch (e) { console.log('ERR phone sched', e.message.split('\n')[0]); C.facts.errors.push('phone sched ' + e.stack) }
    try { await typeAt(w, 'C1', 'd1-week-phone-long', `#eWeek [data-inp="${iT}.str"]`, LONG, 'Tab', iT, null) } catch (e) { console.log('ERR phone long', e.message.split('\n')[0]) }
    try { await inputsDoors(w, 'phone', iT, 'saber') } catch (e) { console.log('ERR phone inputs', e.message.split('\n')[0]); C.facts.errors.push('phone inputs ' + e.stack) }
  }
  if (ARG === 'all' || ARG === 'ranger') {
    for (const sz of ['desk', 'phone']) {
      w = await handOver(w, sz, 'us')
      const di = await toWeekDay(w, WED).catch(() => -1)
      const cells = await w.page.evaluate(() => [...document.querySelectorAll('[data-inp], [data-ifld]')].filter(e => e.getBoundingClientRect().width > 2 && (e.isContentEditable || (e.tagName === 'INPUT' && !e.disabled))).length)
      judge('C1', `ranger schedule time boxes ${sz}`, 'RECORD', { page: await w.page.evaluate(() => window.CURPAGE), weekDay: di, editableInputTimeBoxes: cells }, 'member: doors 1-3 exist?')
      try { await inputsDoors(w, sz, iT, 'ranger') } catch (e) { console.log('ERR ranger inputs', e.message.split('\n')[0]); C.facts.errors.push('ranger inputs ' + e.stack) }
    }
  }
  await w.ctx.close().catch(() => {})
} catch (e) { console.log('ERR', e.message.split('\n')[0]); C.facts.errors.push(e.stack) }
save(); await finish()
console.log('errors:', C.facts.errors.length, C.facts.errors.slice(0, 8).map(s => s.slice(0, 200)))
