// r4wf second walk, task A (25 Nov 26) — the orders the first walk did not reach: W2 (b)–(e), W3, W8 (measured in
// every Tab), W10's Tab route, W11's member, N1 (b)–(e), N4, and W4 / W5 (a) / W7 tried the way a person would keep
// the caret. Each line asserts the RIGHT behaviour, or says RECORD. Run on main's build and on the fix:
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit ONLY=<order,…> node scripts/handpass/r4wf-w2-a.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, bundleOf, log, finish, facts, catchToast, releaseToast } = L
const J = JSON.stringify
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', tag = `${SZ}-${ENG}`
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const LONG = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz01234567'
const res = []
const add = (id, verdict, what, pic = '') => { res.push([id, verdict, what, pic]); console.log('RESULT', id, '|', verdict, '|', String(what).slice(0, 900), '|', pic) }
let W = null
const pic = async (name) => { const f = `a-${tag}-${name}.png`; await W.page.screenshot({ path: `${process.env.WR4_OUT}/${f}` }); return f }
async function world(user = 'ad') { if (W) await W.ctx.close().catch(() => {}); W = await newPage(SZ, undefined, L.NEW_DIR, ENG); await signIn(W, user); log(tag, 'bundle ' + await bundleOf(W.page)); return W }
const P = () => W.page
const DI = { '2026-07-13': 0, '2026-07-15': 2 }
async function board(di) {
  await go(P(), 'editsched'); await P().evaluate(d => window.openScheduler(d), di); await sleep(900)
}
async function openPI() {
  const pin = await P().evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".inputs"]'); return s ? [...s.querySelectorAll('[data-ifld]')].some(e => e.getBoundingClientRect().height > 0) : null })
  if (pin === false) { const t = P().locator('#schedBoard [data-pitog]').first(); if (await t.count()) { await tapOrClick(t); await sleep(400) } }
}
const tapOrClick = async loc => { const l = loc.first(); await l.scrollIntoViewIfNeeded(); if (W.tap) await l.tap(); else await l.click(); await sleep(250) }
const gkOf = (di, iid) => P().evaluate(([di, id]) => { const ri = (window.DAYS[di].ground || []).findIndex(r => r.src === id); return ri < 0 ? null : `gr:${di}.${ri}` }, [di, iid])
const secText = sec => P().evaluate(s => { const e = document.querySelector(`#sbBoard > [data-secmove$=".${s}"]`); if (!e) return null; return (e.innerText + ' ' + [...e.querySelectorAll('input')].map(i => i.value).join(' ')).replace(/\s+/g, ' ').trim() }, sec)
const val = sel => P().evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 2); return e ? (e.value ?? e.textContent) : null }, sel)
const focusOf = () => P().evaluate(() => { const a = document.activeElement; return a && a !== document.body ? (a.getAttribute('data-ifld') || a.getAttribute('data-bfld') || a.getAttribute('data-txt') || a.getAttribute('data-inp') || a.id || a.tagName) + (a.closest('#schedBoard') ? '@board' : '') : 'none' })
/* type in a box and Tab, the way a person does; W8: the box the caret lands in measured before the Tab and after */
async function typeTab(sel, v, key = 'Tab') {
  const b = P().locator(sel).first()
  await b.evaluate(el => el.scrollIntoView({ block: 'center' })); await sleep(150)
  if (W.tap) await b.tap(); else await b.click(); await sleep(200)
  if (v != null) { await P().keyboard.press('Control+A'); await P().keyboard.type(v) }
  await P().evaluate(() => { window.__w2tops = new Map(); for (const e of document.querySelectorAll('#schedBoard input, #schedBoard textarea, #schedBoard [contenteditable="true"], #eWeek [contenteditable="true"]')) window.__w2tops.set(e, e.getBoundingClientRect().top) })
  await P().keyboard.press(key); await sleep(550)
  return P().evaluate(() => { const a = document.activeElement; const t0 = window.__w2tops.get(a); return { focus: a && a !== document.body ? (a.getAttribute('data-ifld') || a.getAttribute('data-bfld') || a.getAttribute('data-txt') || a.tagName) : 'none', moved: t0 == null ? 'new node or none' : Math.round((a.getBoundingClientRect().top - t0) * 10) / 10 } })
}
const inkOf = () => P().evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return null
  const r = document.createRange(); r.selectNodeContents(t); const rs = [...r.getClientRects()].filter(x => x.width > 0)
  const box = t.getBoundingClientRect(); const cs = getComputedStyle(t)
  const inR = box.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth)
  return { box: { l: Math.round(box.left), r: Math.round(box.right), w: Math.round(box.width), top: Math.round(box.top), bottom: Math.round(box.bottom) }, innerR: Math.round(inR), inkR: rs.length ? Math.round(Math.max(...rs.map(x => x.right))) : null, lines: new Set(rs.map(x => Math.round(x.top))).size, vw: innerWidth, vh: innerHeight, at: t.dataset.at }
})
/* file an input for ALL AVAIL (or ALL): the person list's own entry */
async function fileAll(iso, label, from, to, title) {
  await L.openDay(W, iso); const before = await L.ids(P())
  await L.press(W, '#icPopAdd'); await P().locator('#inpEditPop #inpEditType').waitFor()
  await P().selectOption('#inpEditPop #inpEditType', 'Training')
  const v = await P().evaluate(l => { const o = [...document.querySelectorAll('#inpEditPerson option')].find(o => o.textContent.trim().toUpperCase() === l); return o ? o.value : null }, label)
  if (!v) { log(tag, 'no person entry ' + label + ': ' + J(await P().evaluate(() => [...document.querySelectorAll('#inpEditPerson option')].map(o => o.textContent.trim()).filter(t => /all/i.test(t))))); return null }
  await P().selectOption('#inpEditPop #inpEditPerson', v)
  if (await P().locator('#inpEditSpan [data-span="custom"]').count()) await L.press(W, '#inpEditSpan [data-span="custom"]')
  await P().fill('#inpEditPop #inpEditStart', from); await P().fill('#inpEditPop #inpEditEnd', to)
  const t = P().locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill(title)
  await L.press(W, '#inpEditSave'); await L.answerAsks(W)
  if (await P().locator('[data-testid="win-inputsday-x"]').count()) await L.press(W, '[data-testid="win-inputsday-x"]')
  const made = (await L.ids(P())).filter(x => !before.includes(x)); return made.length === 1 ? made[0] : null
}
const want = o => !ONLY.length || ONLY.includes(o)
async function order(name, fn) { if (!want(name)) return; try { await fn() } catch (e) { add(`${name} ${tag}`, 'ERROR', e.message.split('\n')[0].slice(0, 300)); await pic(`${name}-error`).catch(() => {}) } }

/* W2 (b) — an ALL AVAIL input's start typed under Personal Inputs: its row under the Common Programme reads it at once */
await order('W2b', async () => {
  await world()
  const iid = await fileAll('2026-07-15', 'ALL AVAIL', '08:00', '09:00', 'All brief')
  if (!iid) return add(`W2b ${tag}`, 'NOT WALKED', 'no ALL AVAIL entry in the input window\'s person list')
  await board(2); await openPI()
  const before = await secText('prog')
  const m = await typeTab(`#schedBoard [data-ifld="${iid}.str"]`, '0730')
  const after = await secText('prog'), rec = await L.recOf(P(), iid)
  const order = await P().evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".prog"] input[data-bfld$=".str"]')].map(i => i.value))
  const ok = /07:30/.test(after || '') && rec.s === 450 && /@?/.test(m.focus) && (m.moved === 'new node or none' ? false : Math.abs(m.moved) <= 1)
  add(`W2b ${tag} ALL AVAIL start 0730 under Personal Inputs, Tab: the Common Programme row reads 07:30 at once; the caret's box holds`, ok ? 'PASS' : 'FAIL', J({ stored: rec.s, progHas0730: /07:30/.test(after || ''), progStarts: order, caret: m, progBefore: (before || '').slice(0, 160) }), await pic('W2b-after-tab'))
})
/* W2 (c) — Unavailable: a leave 08:00–17:00 for Ranger, who flies Monday's first wave at 12:40; its end typed 0900 in
   the Unavailable row: Available crew, SANS and the flying section's marks at once (RECORD what each shows) */
await order('W2c', async () => {
  await world()
  const iid = await L.fileInput(W, tag, '2026-07-13', { type: 'LL', people: [L.RANGER], from: '08:00', to: '17:00' })
  if (!iid) return add(`W2c ${tag}`, 'NOT WALKED', 'the leave was not filed')
  await board(0)
  const look = () => P().evaluate(() => {
    const avail = document.querySelector('#sbBoard > [data-secmove$=".avail"]'), wv = document.querySelector('#sbBoard > [data-secmove$=".waves"]')
    const pk = wv ? [...wv.querySelectorAll('.puck')].filter(p => /RANGER/i.test(p.textContent)).map(p => p.className) : []
    return { availHasRanger: avail ? /Ranger/i.test(avail.innerText) : null, rangerPucks: pk, warnPucks: wv ? wv.querySelectorAll('.puck.warn').length : null, warnList: (document.querySelector('#schedBoard .sb-warn, #schedBoard [data-warnlist], #schedBoard .wlist')?.innerText || '').replace(/\s+/g, ' ').slice(0, 200) }
  })
  const unav = await P().evaluate(id => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-ifld]')].map(e => e.getAttribute('data-ifld')).filter(k => k.startsWith(id)), iid)
  const endKey = unav.find(k => k.endsWith('.end'))
  if (!endKey) return add(`W2c ${tag}`, 'NOT WALKED', 'no end box on the Unavailable row: ' + J(unav))
  const b = await look(); const fb = await pic('W2c-before')
  await P().evaluate(() => document.querySelector('#sbBoard > [data-secmove$=".avail"]')?.setAttribute('data-w2old', '1'))
  const m = await typeTab(`#schedBoard [data-ifld="${endKey}"]`, '0900')
  const a = await look(); const rec = await L.recOf(P(), iid)
  const availRewritten = await P().evaluate(() => !document.querySelector('#sbBoard > [data-secmove$=".avail"]')?.hasAttribute('data-w2old'))
  add(`W2c ${tag} leave end 0900 typed in the Unavailable row, Tab — RECORD the other sections at once`, 'RECORD', J({ stored: [rec.s, rec.e], caret: m, before: b, after: a, availRewritten }), `${fb}, ${await pic('W2c-after-tab')}`)
})
/* W2 (d) — the phone's folded Personal Inputs: the caret in an input's Ground Programme START, Tab; the folded heading
   keeps its count; opened, its row reads the new time */
await order('W2d', async () => {
  await world()
  const iid = await L.fileInput(W, tag, '2026-07-15', { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Range brief' })
  await board(2)
  const gk = await gkOf(2, iid)
  const head = () => P().evaluate(() => (document.querySelector('#schedBoard [data-pitog]')?.closest('[data-secmove]')?.querySelector('[data-pitog]')?.innerText || document.querySelector('#schedBoard [data-pitog]')?.innerText || '').replace(/\s+/g, ' ').trim())
  const folded = await P().evaluate(id => !document.querySelector(`#schedBoard [data-ifld="${id}.str"]`) || document.querySelector(`#schedBoard [data-ifld="${id}.str"]`).getBoundingClientRect().height === 0, iid)
  const h0 = await head()
  const m = await typeTab(`#schedBoard [data-bfld="${gk}.str"]`, '0915')
  const h1 = await head(); const f1 = await pic('W2d-after-tab-folded')
  await openPI()
  const pi = await val(`#schedBoard [data-ifld="${iid}.str"]`)
  add(`W2d ${tag} Personal Inputs ${folded ? 'folded' : 'OPEN (not folded at this size)'}; Ground Programme START 0915, Tab: the heading keeps its count; opened, the row reads 09:15`, h0 === h1 && pi === '09:15' ? 'PASS' : 'FAIL', J({ folded, headBefore: h0, headAfter: h1, piStart: pi, caret: m }), `${f1}, ${await pic('W2d-opened')}`)
})
/* W2 (e) — "abc" typed in the input's start under Personal Inputs, Tab: the amber note, the box back to 08:00, the
   Ground Programme row unchanged */
await order('W2e', async () => {
  await world()
  const iid = await L.fileInput(W, tag, '2026-07-15', { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Range brief' })
  await board(2); await openPI()
  const gk = await gkOf(2, iid)
  const m = await typeTab(`#schedBoard [data-ifld="${iid}.str"]`, 'abc')
  const note = await catchToast(P(), /not a time|time/i, 3000)
  const f = await pic('W2e-note'); await releaseToast(P())
  const r = { note, box: await val(`#schedBoard [data-ifld="${iid}.str"]`), ground: await val(`#schedBoard [data-bfld="${gk}.str"]`), stored: (await L.recOf(P(), iid)).s, caret: m }
  add(`W2e ${tag} "abc" in the input's start, Tab: a note, the box back to 08:00, the Ground Programme row 08:00`, note && r.box === '08:00' && r.ground === '08:00' && r.stored === 480 ? 'PASS' : 'FAIL', J(r), f)
})
/* W3 — one man's row of a shared, timed Unavailable input (Ranger and Hex, 08:00–10:00), edited three times */
await order('W3', async () => {
  await world()
  const iid = await L.fileInput(W, tag, '2026-07-15', { type: 'LL', people: [L.RANGER, L.HEX], from: '08:00', to: '10:00' })
  if (!iid) return add(`W3 ${tag}`, 'NOT WALKED', 'the shared leave was not filed')
  await board(2)
  const rows = () => P().evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-ifld$=".str"]')].map(e => { const row = e.closest('tr, .sb-arow, .sb-row') || e.parentElement; return { k: e.getAttribute('data-ifld'), who: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40), s: e.value, e: row.querySelector('[data-ifld$=".end"]')?.value, r: row.querySelector('[data-ifld$=".rmks"]')?.value } }))
  const r0 = await rows()
  const mine = r0.find(r => /Ranger/i.test(r.who)) || r0.find(r => r.k.startsWith(iid))
  if (!mine) return add(`W3 ${tag}`, 'NOT WALKED', 'no Ranger row in Unavailable: ' + J(r0))
  const steps = []
  steps.push(await typeTab(`#schedBoard [data-ifld="${mine.k}"]`, '0900'))
  const recs = () => P().evaluate(id => window.INPUTS.filter(r => String(r.iid).startsWith(id) || (r.type === 'LL' && (r.people || []).some(p => ['bane', 'rocky'].includes(p.p)) && JSON.stringify(r).includes('2026-07-15'))).map(r => ({ iid: r.iid, date: r.date, people: (r.people || []).map(p => JSON.stringify(p).slice(0, 120)), s: r.s, e: r.e, rmks: r.remarks })), iid)
  const after1 = await recs(); const r1 = await rows(); const f1 = await pic('W3-start-0900')
  const nk = r1.find(r => /Ranger/i.test(r.who))
  if (nk) { steps.push(await typeTab(`#schedBoard [data-ifld="${nk.k.replace(/\.str$/, '.end')}"]`, '1100')) }
  const r2 = await rows(); const nk2 = r2.find(r => /Ranger/i.test(r.who))
  if (nk2) { steps.push(await typeTab(`#schedBoard [data-ifld="${nk2.k.replace(/\.str$/, '.rmks')}"]`, 'own hours')) }
  const after3 = await recs(); const r3 = await rows(); const f3 = await pic('W3-after-three')
  const ranger = after3.filter(r => r.people.some(p => p.includes('"bane"'))), hex = after3.filter(r => r.people.some(p => p.includes('"rocky"')))
  const ok = ranger.length === 1 && ranger[0].people.length === 1 && ranger[0].s === 540 && ranger[0].e === 660 && /own hours/.test(ranger[0].rmks || '') && hex.length === 1 && hex[0].s === 480 && hex[0].e === 600 && !/own hours/.test(hex[0].rmks || '')
  add(`W3 ${tag} Ranger's row of a shared leave: 0900, 1100, "own hours" — his own input, Hex keeps 08:00–10:00`, ok ? 'PASS' : 'FAIL', J({ rowsBefore: r0, afterFirst: after1, rowsAfter: r3, records: after3, carets: steps }), `${f1}, ${f3}`)
})
/* W10 — the Tab route across sections: from Personal Inputs' first box, 14 Tabs typing nothing, then 4 Shift+Tabs; each
   stop a text box of the Board, in the order on screen (its top never going back up, a new row allowed to start left) */
await order('W10', async () => {
  await world()
  const iid = await L.fileInput(W, tag, '2026-07-15', { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Range brief' })
  await board(2); await openPI()
  const gk = await gkOf(2, iid)
  const b = P().locator(`#schedBoard [data-bfld="${gk}.str"]`).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' }))
  if (W.tap) await b.tap(); else await b.click(); await sleep(250)
  const stops = []
  const where = () => P().evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const sec = a.closest('#sbBoard > [data-secmove]')?.getAttribute('data-secmove'); return { k: a.getAttribute('data-ifld') || a.getAttribute('data-bfld') || a.tagName + ':' + (a.textContent || '').trim().slice(0, 12), sec, onBoard: !!a.closest('#schedBoard'), box: /INPUT|TEXTAREA/.test(a.tagName) || a.isContentEditable, y: Math.round(r.top + (a.closest('.sb-boardwrap')?.scrollTop || 0)) } })
  stops.push(await where())
  for (let i = 0; i < 14; i++) { await P().keyboard.press('Tab'); await sleep(250); stops.push(await where()) }
  for (let i = 0; i < 4; i++) { await P().keyboard.press('Shift+Tab'); await sleep(250); stops.push(await where()) }
  const fwd = stops.slice(0, 15), allBoxes = stops.every(s => s.onBoard && s.box)
  let backUp = 0; for (let i = 1; i < fwd.length; i++) if (fwd[i].y < fwd[i - 1].y - 2) backUp++
  const back = stops.slice(15).map(s => s.k), expectBack = fwd.slice(10, 14).reverse().map(s => s.k)
  add(`W10 ${tag} the Tab route from the input's Ground Programme START: text boxes of the Board only, down the screen; Shift+Tab retraces`, allBoxes && backUp === 0 && J(back) === J(expectBack) ? 'PASS' : 'FAIL', J({ stops: stops.map(s => `${s.sec}:${s.k}@${s.y}`), wentBackUp: backUp }), await pic('W10-route-end'))
})
/* W4 / W5 (a) / W7 — can a person press OIL Earn, the Board's Undo or the next-day arrow and keep the caret in a box?
   The caret put in Personal Inputs' start; each control pressed the way this size presses (a click; a tap); and the
   keyboard: Tab from the box, 40 times, never reaching a button would mean no key route keeps the caret either */
await order('KEEP', async () => {
  await world()
  const iid = await L.fileInput(W, tag, '2026-07-18', { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Sat brief' })
  await board(5); await openPI()
  const S = `#schedBoard [data-ifld="${iid}.str"]`
  const ctl = {
    'OIL Earn (W4)': (await P().locator('#sbOil:visible').count()) ? P().locator('#sbOil:visible') : P().locator('#schedBoard button:visible').filter({ hasText: /^\s*(⋯|…|\.\.\.)\s*$/ }),
    'Undo (W5 a)': P().locator('#sbUndo'),
    'next day (W7)': (await P().getByRole('button', { name: /^Sun 19/ }).locator('visible=true').count()) ? P().getByRole('button', { name: /^Sun 19/ }).locator('visible=true') : P().locator('#sbNextDay:visible'),
  }
  log(tag, 'controls found: ' + J(await Promise.all(Object.entries(ctl).map(async ([k, l]) => `${k}: ${await l.count()} ${await l.first().evaluate(e => (e.id || '') + ' ' + (e.getAttribute('aria-label') || e.title || e.textContent.trim()).slice(0, 30)).catch(() => '-')}`))))
  await typeTab(S, '0815')   // something the Undo can take back
  for (const [name, loc] of Object.entries(ctl)) {
    const n = await loc.count()
    if (!n) { add(`KEEP ${tag} ${name}`, 'NOT WALKED', 'no such control found on the Board'); continue }
    const b = P().locator(S).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' })); if (W.tap) await b.tap(); else await b.click(); await sleep(250)
    const f0 = await focusOf()
    const l = loc.first(); await l.scrollIntoViewIfNeeded().catch(() => {})
    let pressed = true
    if (W.tap) await l.tap({ timeout: 4000 }).catch(e => { pressed = false; log(tag, name + ' tap: ' + e.message.slice(0, 80)) }); else await l.click({ timeout: 4000 }).catch(e => { pressed = false; log(tag, name + ' click: ' + e.message.slice(0, 80)) })
    const f1 = await focusOf(); await sleep(500); const f2 = await focusOf()
    const what = await l.first().evaluate(e => (e.id || '') + ' ' + (e.getAttribute('aria-label') || e.title || e.textContent.trim()).slice(0, 30)).catch(() => '-')
    add(`KEEP ${tag} ${name} pressed with the caret in the input's start box`, !pressed ? 'NOT PRESSED' : f2.startsWith(`${iid}.str`) ? 'MADE' : 'COULD NOT BE MADE', J({ control: what, before: f0, rightAfter: f1, settled: f2, sbday: await P().evaluate(() => window.SBDAY) }), await pic(`KEEP-${name.split(' ')[0]}`))
    if (name.startsWith('next')) { await board(5); await openPI() }
    if (name.startsWith('OIL')) { const o = ctl['OIL Earn (W4)']; if (await o.count()) { if (W.tap) await o.first().tap().catch(() => {}); else await o.first().click().catch(() => {}); await sleep(500) } }
  }
  /* the keyboard */
  const b = P().locator(S).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' })); if (W.tap) await b.tap(); else await b.click(); await sleep(200)
  const seen = new Set()
  for (let i = 0; i < 40; i++) { await P().keyboard.press('Tab'); await sleep(120); seen.add(await P().evaluate(() => { const a = document.activeElement; return a.tagName + (a.tagName === 'BUTTON' ? ':' + (a.id || a.textContent.trim().slice(0, 14)) : '') })) }
  add(`KEEP ${tag} the keyboard: 40 Tabs from the box — does the route reach a button?`, [...seen].some(s => s.startsWith('BUTTON')) ? 'RECORD (a button reached)' : 'RECORD (text boxes only)', J([...seen]))
})
/* W11 — the member: the schedule as Ranger sees it takes no typing */
await order('W11', async () => {
  await world('us')
  await go(P(), 'viewsched'); await sleep(500)
  const opened = await P().evaluate(() => { try { window.openScheduler && window.openScheduler(2); return true } catch { return false } }); await sleep(800)
  const r = await P().evaluate(() => ({ page: window.CURPAGE, board: !!document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth > 0, editable: [...document.querySelectorAll('#schedBoard input:not([readonly]):not([disabled]), #schedBoard [contenteditable="true"], #vWeek [contenteditable="true"], #eWeek [contenteditable="true"]')].filter(e => e.getBoundingClientRect().width > 0 && e.type !== 'checkbox').length }))
  add(`W11 ${tag} signed in as Ranger (a member): no box on the schedule takes typing`, r.editable === 0 ? 'PASS' : 'FAIL', J({ ...r, triedBoard: opened }), await pic('W11-member'))
})
/* N1 (b)–(e) — the 60 letters at the other doors: the Board's take-off box, an input's start under Personal Inputs on
   the Board, the same input's start on the week, an Unavailable row's start; each note's letters inside its border */
await order('N1', async () => {
  await world()
  const iid = await L.fileInput(W, tag, '2026-07-15', { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Range brief' })
  const lv = await L.fileInput(W, tag, '2026-07-15', { type: 'LL', people: [L.HEX], from: '08:00', to: '17:00' })
  const doors = [
    ['b', 'the Board\'s take-off box', '#schedBoard [data-bfld="ff:2.0.0.to"]', 'board'],
    ['c', 'an input\'s start under Personal Inputs (Board)', `#schedBoard [data-ifld="${iid}.str"]`, 'board'],
    ['e', 'an Unavailable row\'s start (Board)', `#sbBoard > [data-secmove$=".unav"] [data-ifld^="${lv}"][data-ifld$=".str"]`, 'board'],
    ['d', 'the same input\'s start on the week', `#eWeek [data-inp^="${iid}"][data-inp$=".str"]`, 'week'],
  ]
  for (const [k, what, sel, where] of doors) {
    if (where === 'board') { if (!(await P().evaluate(() => window.SBDAY === 2))) await board(2); await openPI() }
    else { await L.boardOff?.(P()); const x = P().locator('#sbDone:visible').first(); if (await x.count()) { await tapOrClick(x); await sleep(600) } await go(P(), 'editsched') }
    const loc = P().locator(sel).first()
    if (!(await loc.count())) { add(`N1${k} ${tag} ${what}`, 'NOT WALKED', 'no such box: ' + sel); continue }
    await loc.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
    if (W.tap) await loc.tap(); else await loc.click(); await sleep(250)
    await P().keyboard.press('Control+A'); await P().keyboard.type(LONG); await P().keyboard.press('Tab')
    const t = await catchToast(P(), /not a time/, 4000)
    const m = await inkOf(); const f = await pic(`N1${k}`); await releaseToast(P())
    const back = await P().evaluate(s => { const e = document.querySelector(s); return e ? (e.value ?? e.textContent).trim() : null }, sel)
    const inside = t && m && m.inkR <= m.innerR + 1 && m.box.l >= 0 && m.box.r <= m.vw
    add(`N1${k} ${tag} 60 letters in ${what}, Tab: the note's letters inside its border`, inside ? 'PASS' : (t ? 'FAIL' : 'RECORD (no note)'), J({ note: (t || '').slice(0, 50), ...m, boxAfter: back }), f)
    await sleep(2500)
  }
})
/* N4 — where the note stands with an input's window up (a phone: the top, D731 (1)) — RECORD; the note raised by the
   app's own note call with the window up (no time box is in the window to type in) */
await order('N4', async () => {
  await world()
  await L.openDay(W, '2026-07-15'); await L.press(W, '#icPopAdd'); await P().locator('#inpEditPop #inpEditType').waitFor()
  await P().evaluate(l => window.toast(`${l} is not a time. Try 0900 or 09:00.`, 'warn'), LONG); await sleep(300)
  const m = await inkOf()
  add(`N4 ${tag} the long note with an input's window up — RECORD where it stands`, 'RECORD', J(m), await pic('N4-window-up'))
})
facts.results = res
await finish()
console.log('errors:', facts.errors.length, J(facts.errors.slice(0, 6)))
