// W3 / §4 the plain-user round (D1557): the member's Inputs task start to finish, then the admin's, pressing every control that
// opens or closes something, and looking at every other place that should show the result. SIZE=desktop|phone.
// Every write through the app's controls; the probe bridge (INPUTS, DAYS) is only READ. One continuous world: us, then ad, then us.
import * as L from './isr-A-lib.mjs'
import { pubDay, face, editWeek, showDay, closeBoard } from './isr-A-pub.mjs'
const { say, check, note, notWalked, tid, press, shot, text } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const SIZE = process.env.SIZE || 'desktop'
const Z = SIZE === 'phone' ? 'ph' : 'dk'
console.log('ibc-w3-plain v1', SIZE)
const { ctx, page, tap } = await L.session(SIZE, 'us')
const DI = 2, ISO = '2026-07-15'
let IID = null
const wins = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !/-x$/.test(e.getAttribute('data-testid')) }).map(e => e.getAttribute('data-testid').replace(/^win-/, '')))
const undoS = () => page.evaluate(() => { const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn'); return { undo: u && (u.title || u.getAttribute('aria-label')), undoOff: u && u.disabled, redo: r && (r.title || r.getAttribute('aria-label')), redoOff: r && r.disabled } })
const recOf = () => page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r ? { remarks: r.remarks, mod: r.mod, modBy: r.modBy, modAt: r.modAt, lateOff: !!r.lateOff, type: r.type, title: r.title } : null }, IID)
const toastNow = async () => ({ now: await L.toastText(page), all: (await L.notes(page)).slice(-4) })
const sh = (id, what) => shot(page, `${Z}-${id}`, SIZE, what)
/* phone: a picture right after each tap's lift (D1281) is taken by the caller with pressQuick */
const pressQuick = async (loc, id, what) => { const l = (typeof loc === 'string' ? page.locator(loc) : loc).first(); if (tap) { await l.tap(); await sleep(90) } else { await l.click(); await sleep(90) } await sh(id, what + '-t100'); await sleep(tap ? 600 : 150) }
const onScreen = async (sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'absent'; const r = e.getBoundingClientRect(); const inside = r.width > 0 && r.height > 0 && r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { inside, top: !!(t && e.contains(t)), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } }, sel)
async function step(id, fn) { try { await fn() } catch (e) { say(`ERROR ${Z} ${id}: ${e.message.split('\n').slice(0, 3).join(' / ')} @ ${(e.stack.split('\n').find(l => l.includes('ibc-w3-plain')) || '').trim()}`); await sh(id, 'error').catch(() => {}) } }
const cardSel = () => `[data-testid="win-inputsday"] [data-iid="${IID}"], [data-testid="win-inputsday"] [data-popiid="${IID}"]`
const cardInfo = () => page.evaluate(sel => { const c = document.querySelector(sel); if (!c) return null; return { txt: (c.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120), fresh: c.hasAttribute('data-fresh') || /fresh|innew|just/.test(String(c.className)), cls: String(c.className).slice(0, 60) } }, cardSel())
const openCard = async () => { await press(page, tap, page.locator(cardSel()).first()); await page.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 4000 }); await sleep(500) }
const topPress = async (id) => { const cov = await page.evaluate(id => { const e = document.getElementById(id); if (!e) return 'absent'; const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === e || e.contains(t)) ? 'free' : 'covered by ' + (t ? t.tagName + '.' + String(t.className).slice(0, 25) : 'nothing') }, id); if (cov !== 'free') { note(`${id} ${Z}`, `the top-bar button is ${cov}${cov.startsWith('covered') ? ' while the day window is open: the day is closed first to reach it' : ''}`); if (await tid(page, 'win-inputsday-x').count()) { await press(page, tap, '[data-testid="win-inputsday-x"]'); await sleep(400) } } await press(page, tap, '#' + id); await sleep(500) }
const bell = async () => { await press(page, tap, '#notifyBell'); await sleep(500); const t = await page.evaluate(() => { const p = document.querySelector('.bell-list'); return p ? (p.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300) : '(no panel found)' }); return t }
const closeAnyPop = async () => { for (let i = 0; i < 3; i++) { const w = await wins(); if (!w.length) break; const x = page.locator(`[data-testid="win-${w[w.length - 1]}-x"]`).first(); if (await x.count()) { await x.click().catch(() => {}); await sleep(300) } else await page.keyboard.press('Escape') } }
async function signIn(user) {
  if (await page.locator('#logout:visible').count()) { await page.locator('#logout:visible').click(); await sleep(800) }
  else if (await page.locator('#burger').count()) { await press(page, tap, '#burger'); await sleep(500); await press(page, tap, page.getByRole('button', { name: /^Log ?out/i }).first()); await sleep(800) }
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
}
const lateTags = (surf, di) => page.evaluate(([s, i]) => { const d = document.querySelector(`${s} .day[data-day="${i}"]`); return d ? [...d.querySelectorAll('.latetag')].filter(e => e.getBoundingClientRect().height > 0).length : null }, [surf, di])
const viewDay = async () => { await closeBoard(page); await L.go(page, 'viewsched'); await showDay(page, DI, '#vWeek'); return page.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); return d ? (d.innerText || '').replace(/\s+/g, ' ').trim() : null }, DI) }

/* ---------- 1 · the member files an input through the day ---------- */
await step('1', async () => {
  await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, ISO)
  await sh('1', 'day-open')
  const before = await page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
  await pressQuick('#icPopAdd', '1', 'plus-input')
  await page.locator('#inpEditPop #inpEditType').waitFor()
  note(`1 ${Z}`, `the new input's window is on screen: ${JSON.stringify(await onScreen('[data-testid="win-inputedit"]'))}`)
  await page.selectOption('#inpEditPop #inpEditType', 'Appointment')
  const ot = page.locator('#inpEditPop #inpEditOwnTitle'); if (await ot.count()) await ot.fill('ISR brief')
  await page.fill('#inpEditPop #inpEditRmk', 'Room 2')
  await sh('1', 'window-filled')
  await pressQuick('#inpEditSave', '1', 'save')
  if (await tid(page, 'docconf-nodoc').count()) { await press(page, tap, '[data-testid="docconf-nodoc"]'); await sleep(400) }
  const made = await page.evaluate(b => window.INPUTS.filter(r => !b.includes(String(r.iid))).map(r => String(r.iid)), before)
  check(`1 ${Z}`, 'exactly one new input saved', made.length === 1, made)
  IID = made[0]
  const t = await toastNow(); const c = await cardInfo()
  const markOnBar = await page.evaluate(() => [...document.querySelectorAll('#inpCal [data-fresh]')].length)
  note(`1 ${Z}`, `passing notes seen: ${JSON.stringify(t)}; the card in the day: ${JSON.stringify(c)}; month bars wearing the just-added mark: ${markOnBar}; windows: ${JSON.stringify(await wins())}`)
  check(`1 ${Z}`, 'no "Input added" note is shown where the new input is in view (D851)', !t.all.some(x => /added/i.test(x)) && !/added/i.test(t.now || ''), t)
  check(`1 ${Z}`, 'the card in the day wears the just-added mark', !!c && c.fresh, c)
  await sh('1', 'after-save')
})

/* ---------- 2 · open it, change nothing, Save ---------- */
await step('2', async () => {
  if (!IID) return notWalked(`2 ${Z}`, 'premise: step 1 saved no input')
  const u0 = await undoS(), r0 = await recOf()
  await openCard()
  await sh('2', 'window-open')
  await pressQuick('#inpEditSave', '2', 'save-unchanged')
  const u1 = await undoS(), r1 = await recOf()
  const w = await wins()
  check(`2 ${Z}`, 'the window closes on Save with nothing changed', !w.includes('inputedit'), w)
  check(`2 ${Z}`, 'no "changed by" stamp and no new Undo step (F1)', JSON.stringify([r0.mod, r0.modBy, r0.modAt]) === JSON.stringify([r1.mod, r1.modBy, r1.modAt]) && JSON.stringify(u0) === JSON.stringify(u1), { rec0: r0, rec1: r1, undo0: u0, undo1: u1 })
  await sh('2', 'after')
})

/* ---------- 3 · type, Escape, the question, Keep editing, Save, Undo, Redo ---------- */
await step('3', async () => {
  if (!IID) return notWalked(`3 ${Z}`, 'premise: no input')
  await openCard()
  await page.fill('#inpEditPop #inpEditRmk', 'Room 3'); await sleep(200)
  await page.keyboard.press('Escape'); await sleep(600)
  const q = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.textContent || '').trim()); const t = (document.body.innerText || '').replace(/\s+/g, ' '); return { buttons: b.filter(x => /keep|discard|close|lose/i.test(x)), words: (/This input has unsaved changes[^?]*\?/.exec(t) || [null])[0] } })
  check(`3 ${Z}`, 'Escape with typing asks "This input has unsaved changes. Close it and lose them?" (F2)', /unsaved changes/.test(q.words || ''), q)
  await sh('3', 'question')
  const keep = page.getByRole('button', { name: /Keep editing/ }).first()
  if (!(await keep.count())) return notWalked(`3 ${Z}`, `premise: no Keep editing button (${JSON.stringify(q.buttons)})`)
  await pressQuick(keep, '3', 'keep-editing')
  check(`3 ${Z}`, 'Keep editing leaves the window and its typing', (await wins()).includes('inputedit') && (await page.inputValue('#inpEditPop #inpEditRmk')) === 'Room 3', { wins: await wins(), rmk: await page.inputValue('#inpEditPop #inpEditRmk') })
  await pressQuick('#inpEditSave', '3', 'save')
  if (await tid(page, 'docconf-nodoc').count()) { await press(page, tap, '[data-testid="docconf-nodoc"]'); await sleep(400) }
  check(`3 ${Z}`, 'Save wrote Room 3', (await recOf()).remarks === 'Room 3', await recOf())
  const u = await undoS(); note(`3 ${Z}`, `Undo's own label now: ${JSON.stringify(u)}`)
  await topPress('undoBtn')
  const t1 = await toastNow(); note(`3 ${Z}`, `after Undo: notes ${JSON.stringify(t1)}; remarks ${JSON.stringify((await recOf()).remarks)}`)
  check(`3 ${Z}`, 'the Undo bubble reads "Undid: Ranger\'s ISR brief" (D1582)', /Undid: Ranger.s ISR brief/.test([t1.now, ...t1.all].join(' | ')), t1)
  await sh('3', 'after-undo')
  await topPress('redoBtn')
  const t2 = await toastNow(); note(`3 ${Z}`, `after Redo: notes ${JSON.stringify(t2)}; remarks ${JSON.stringify((await recOf()).remarks)}`)
  check(`3 ${Z}`, 'Redo puts Room 3 back', (await recOf()).remarks === 'Room 3', await recOf())
})

/* ---------- 4 · the window's ✕ and Cancel with typing (RECORD) ---------- */
await step('4', async () => {
  if (!IID) return notWalked(`4 ${Z}`, 'premise: no input')
  if (!(await wins()).includes('inputsday')) await L.openDay(page, ISO)
  await openCard(); await page.fill('#inpEditPop #inpEditRmk', 'Room 4 x'); await sleep(200)
  await pressQuick('[data-testid="win-inputedit-x"]', '4', 'x-with-typing')
  const a = { wins: await wins(), asked: await page.evaluate(() => /unsaved changes/.test(document.body.innerText || '')), rmk: (await recOf()).remarks }
  note(`4 ${Z}`, `the window's ✕ with typing: ${JSON.stringify(a)}`)
  if (a.wins.includes('inputedit') && a.asked) await page.keyboard.press('Escape')
  await sleep(300)
  if ((await wins()).includes('inputedit')) { await page.keyboard.press('Escape'); await sleep(400); const k = page.getByRole('button', { name: /Discard/ }).first(); if (await k.count()) await k.click(); await sleep(300) }
  await openCard(); await page.fill('#inpEditPop #inpEditRmk', 'Room 4 y'); await sleep(200)
  await pressQuick('#inpEditCancel', '4', 'cancel-with-typing')
  const b = { wins: await wins(), asked: await page.evaluate(() => /unsaved changes/.test(document.body.innerText || '')), rmk: (await recOf()).remarks }
  note(`4 ${Z}`, `Cancel with typing: ${JSON.stringify(b)}`)
  if ((await wins()).includes('inputedit')) { await page.keyboard.press('Escape'); await sleep(400); const k = page.getByRole('button', { name: /Discard/ }).first(); if (await k.count()) await k.click(); await sleep(300) }
  check(`4 ${Z}`, 'the saved remarks are still Room 3 after both', (await recOf()).remarks === 'Room 3', await recOf())
})

/* ---------- 5 · the day window's every way in and out ---------- */
await step('5', async () => {
  if (!(await wins()).includes('inputsday')) { await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, ISO) }
  await pressQuick('[data-testid="win-inputsday-x"]', '5', 'day-x')
  check(`5 ${Z}`, 'the day closes by its ✕', !(await wins()).includes('inputsday'), await wins())
  await L.openDay(page, ISO)
  check(`5 ${Z}`, 'Enter on the date reopens it', (await wins()).includes('inputsday'), await wins())
  await page.keyboard.press('Escape'); await sleep(500)
  check(`5 ${Z}`, 'Escape closes it', !(await wins()).includes('inputsday'), await wins())
  await L.openDay(page, ISO); await sh('5', 'reopened')
  /* a tap outside: a spot of the page not under any window and not a control */
  const pt = await page.evaluate(() => { for (let y = 120; y < innerHeight; y += 23) for (let x = 6; x < innerWidth; x += 31) { const e = document.elementFromPoint(x, y); if (e && !e.closest('[data-testid^="win-"], button, [role=button], select, input, [data-icday], a') && e.closest('#page-inputs')) return { x, y, el: e.tagName + '.' + String(e.className).slice(0, 25) } } return null })
  if (!pt) return notWalked(`5 ${Z}`, 'premise: no plain spot of the page is uncovered by the window')
  if (tap) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y)
  await sleep(500)
  check(`5 ${Z}`, 'a tap on the page behind leaves the day open (D641)', (await wins()).includes('inputsday'), { pt, wins: await wins() })
  await sh('5', 'tap-outside')
})

/* ---------- 6 · the other places that should show the result ---------- */
await step('6', async () => {
  await closeAnyPop()
  const vd = await viewDay()
  note(`6 ${Z}`, `View-only Sched, Wed 15 Jul, words naming ISR/Ranger: ${JSON.stringify(((vd || '').match(/.{0,40}(ISR|Ranger).{0,40}/g) || []).slice(0, 3))}`)
  await showDay(page, DI, '#vWeek'); await sh('6', 'view-wed')
  const b = await bell(); note(`6 ${Z}`, `the bell for the member: ${JSON.stringify(b)}`); await sh('6', 'bell')
  await press(page, tap, '#notifyBell'); await sleep(300)
  const pk = page.locator('#vWeek .day[data-day="2"]').getByText('Ranger', { exact: true }).first()
  if (await pk.count()) { await pk.scrollIntoViewIfNeeded(); await press(page, tap, pk); await sleep(600); note(`6 ${Z}`, `person window after a tap on Ranger's puck: windows ${JSON.stringify(await wins())}; text ${JSON.stringify(await page.evaluate(() => (document.querySelector('[data-testid="win-person"], .personwin, [role=dialog]')?.innerText || '(none)').replace(/\s+/g, ' ').slice(0, 300)))}`); await sh('6', 'person-window'); await closeAnyPop() }
  else note(`6 ${Z}`, 'no puck of Ranger on the view-only Wed to tap (he has no row there yet)')
  await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 8); await sh('6', 'next-month'); await L.incalMonth(page, tap, 2026, 7)
  const bar = await page.evaluate(i => !!document.querySelector(`#inpCal [data-iid="${i}"], #inpCal [data-barid="${i}"], #inpCal [data-popiid="${i}"]`), IID)
  note(`6 ${Z}`, `back on July, the input's bar on the month: ${bar}`); await sh('6', 'back-july')
})

/* ======================= the administrator ======================= */
const WORDS = 'Brief 0700'
const openBoard = async (di) => { await closeBoard(page); await L.go(page, 'editsched'); await showDay(page, di); await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click(); await page.waitForSelector('#schedBoard'); await sleep(800) }
const chipsB = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .latechip')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ id: e.getAttribute('data-lateoff'), off: e.classList.contains('off') })))
const inputsLate = async () => { await closeBoard(page); await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, ISO); const c = await cardInfo(); if (await tid(page, 'win-inputsday-x').count()) await press(page, tap, '[data-testid="win-inputsday-x"]'); return c && /LATE/.test(c.txt) ? 1 : 0 }
const weekTags = async (pg) => { await closeBoard(page); await L.go(page, pg); const s = pg === 'editsched' ? '#eWeek' : '#vWeek'; await showDay(page, DI, s); return lateTags(s, DI) }
const undoBoard = async (which) => { const id = (await page.locator(`#sb${which}:visible`).count()) ? `#sb${which}` : `#${which.toLowerCase()}Btn`; await page.locator(id).first().click(); await sleep(600) }
await step('7', async () => {
  await signIn('ad')
  if (!IID) return notWalked(`7 ${Z}`, 'premise: no input from step 1')
  const t0 = { edit: await weekTags('editsched'), view: await weekTags('viewsched'), inputs: await inputsLate() }
  note(`7 ${Z}`, `LATE marks before the drop: edit week Wed ${t0.edit}, view-only Wed ${t0.view}, Inputs page ${t0.inputs}`)
  await openBoard(DI)
  const pi = page.locator('#schedBoard').getByText(/personal inputs/i).first()
  note(`7 ${Z}`, `Personal Inputs heading on the board: ${await pi.count()} ${JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.children.length === 0 && /personal|inputs/i.test(e.textContent || '') && e.getBoundingClientRect().height > 0).map(e => e.tagName + '.' + String(e.className).slice(0, 20) + ':' + e.textContent.trim().slice(0, 40)).slice(0, 6)))}`)
  if (await pi.count()) { await pi.scrollIntoViewIfNeeded(); await pi.click().catch(() => {}); await sleep(600) }
  const c0 = await chipsB(); note(`7 ${Z}`, `live LATE chips on the board's Wed: ${JSON.stringify(c0)}`)
  await sh('7', 'board-before')
  const lateEls = await page.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.children.length === 0 && /LATE/.test(e.textContent || '') && e.getBoundingClientRect().height > 0).map(e => e.tagName + '.' + String(e.className).slice(0, 30) + '[' + [...e.attributes].map(a => a.name).filter(n => /data-/.test(n)).join(',') + '] in ' + ((e.closest('[data-iid],[data-rid],tr,.sb-row') || {}).textContent || '').replace(/s+/g, ' ').slice(0, 60)))
  note(`7 ${Z}`, `every LATE word on the board: ${JSON.stringify(lateEls)}`)
  const isr = page.locator('#schedBoard').getByText('ISR brief').first()
  if (await isr.count()) { await isr.scrollIntoViewIfNeeded(); await sleep(300); await sh('7', 'board-isr-row') }
  if (!c0.find(c => String(c.id) === String(IID))) return notWalked(`7 ${Z}`, `premise: no LATE chip for the member's input on the board (${JSON.stringify(c0)})`)
  await pressQuick(`#schedBoard .latechip[data-lateoff="${IID}"]`, '7', 'chip-tap')
  const c1 = await chipsB(); const tt = await toastNow()
  check(`7 ${Z}`, 'the tapped chip turns dim', !!c1.find(c => String(c.id) === String(IID) && c.off), c1)
  note(`7 ${Z}`, `note shown: ${JSON.stringify(tt)}`)
  await sh('7', 'board-after')
  const t1 = { edit: await weekTags('editsched'), view: await weekTags('viewsched'), inputs: await inputsLate() }
  note(`7 ${Z}`, `LATE marks after the drop: edit week Wed ${t1.edit}, view-only Wed ${t1.view}, Inputs page ${t1.inputs}`)
  check(`7 ${Z}`, 'Edit Schedule Wed shows no LATE for it (one badge fewer)', t1.edit === t0.edit - 1, { before: t0.edit, after: t1.edit })
  check(`7 ${Z}`, 'View-only Sched Wed shows no LATE for it (one badge fewer)', t1.view === t0.view - 1, { before: t0.view, after: t1.view })
  check(`7 ${Z}`, 'the Inputs page still prints LATE', t1.inputs === t0.inputs, { before: t0.inputs, after: t1.inputs })
  await L.go(page, 'viewsched'); await showDay(page, DI, '#vWeek'); await sh('7', 'view-after')
  await L.go(page, 'inputs'); await sh('7', 'inputs-after')
  await press(page, tap, '#histBtn'); await sleep(700)
  const h = await page.evaluate(() => { const t = (document.body.innerText || '').replace(/\s+/g, ' '); return { lines: (t.match(/[^.]{0,60}LATE mark[^.]{0,60}/g) || []).slice(0, 3), wins: [...document.querySelectorAll('[data-testid^="win-"],.chgwin')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.getAttribute('data-testid') || e.className.toString().slice(0, 20)) } })
  note(`7 ${Z}`, `the change history's words about it: ${JSON.stringify(h)}`); await sh('7', 'history')
  await closeAnyPop(); await page.keyboard.press('Escape').catch(() => {})
  await openBoard(DI)
  await undoBoard('Undo'); const r1 = await recOf(); const t2 = await toastNow()
  check(`7 ${Z}`, 'Undo brings the mark back (one step)', r1.lateOff === false, { rec: r1, notes: t2 })
  await undoBoard('Redo'); const r2 = await recOf()
  check(`7 ${Z}`, 'Redo drops it again', r2.lateOff === true, r2)
  await sh('7', 'after-redo')
})
await step('8', async () => {
  await closeBoard(page); await editWeek(page); await showDay(page, DI)
  const box = page.locator(`#eWeek .blknote.ed[data-txt="pn:${DI}"]`).first()
  await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await box.click(); await page.keyboard.type(WORDS); await sleep(150)
  await page.locator('#eWeek').evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(500)
  await openBoard(DI)
  const b = page.locator(`#schedBoard [data-notepub="pn:${DI}"]`).first()
  if (!(await b.count())) return notWalked(`8 ${Z}`, 'premise: no Make public toggle on the board for the Programme note')
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sh('8', 'board-note-before')
  await pressQuick(b, '8', 'make-public')
  note(`8 ${Z}`, `after Make public the note said ${JSON.stringify(await toastNow())}; board toggle: ${JSON.stringify(await page.evaluate(i => { const e = document.querySelector(`#schedBoard [data-notepub="pn:${i}"]`); return e && { on: e.classList.contains('on'), txt: (e.textContent || '').trim(), title: e.title } }, DI))}`)
  await sh('8', 'board-note-public')
  const vd = await viewDay()
  check(`8 ${Z}`, 'View-only Sched Wed shows "Notes" with Brief 0700', /notes/i.test(vd || '') && /Brief 0700/.test(vd || ''), (vd || '').match(/.{0,30}Brief 0700.{0,30}/g))
  await showDay(page, DI, '#vWeek'); await sh('8', 'view-note')
  await openBoard(DI)
  note(`8 ${Z}`, `board closed by Done and reopened: toggle on ${await page.evaluate(i => { const e = document.querySelector(`#schedBoard [data-notepub="pn:${i}"]`); return e && e.classList.contains('on') }, DI)}`)
  await closeBoard(page)
  await page.reload(); await sleep(900)
  if (await page.locator('#luser').isVisible().catch(() => false)) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]') }
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
  const np = await page.evaluate(i => window.DAYS[i] && window.DAYS[i].npub, DI)
  check(`8 ${Z}`, 'after a reload the note is still public on the day', JSON.stringify(np) === '["pn"]', np)
})
await step('9', async () => {
  await openBoard(DI)
  const acc = page.getByRole('button', { name: /^Accept/ })
  note(`9 ${Z}`, `Accept buttons visible on the board: ${await acc.count()}; the member's input already on the day's data: ${await page.evaluate(i => JSON.stringify(window.DAYS[2]).includes(i), IID)}`)
  await sh('9', 'board-accept')
  await closeBoard(page)
  const pub = await pubDay(page, tap, DI)
  note(`9 ${Z}`, `publish Wed: ${JSON.stringify(pub)}`)
  const f = await face(page, DI); await showDay(page, DI); await sh('9', 'edit-wed-published')
  check(`9 ${Z}`, 'Wed is published (a version tag shows)', !!f && /ORIG|AL/.test(f.tag || ''), f)
  const vd = await viewDay(); await showDay(page, DI, '#vWeek'); await sh('9', 'view-wed-published')
  note(`9 ${Z}`, `View-only Wed after publish: ISR row ${JSON.stringify(((vd || '').match(/.{0,50}ISR.{0,60}/g) || []).slice(0, 2))}; LATE badges ${await lateTags('#vWeek', DI)}; the note ${JSON.stringify(((vd || '').match(/.{0,20}Brief 0700.{0,20}/g) || []).slice(0, 1))}`)
})
await step('10', async () => {
  await closeBoard(page); await L.toInputsCal(page, tap); await sleep(300)
  await pressQuick('#inGear', '10', 'gear')
  note(`10 ${Z}`, `windows after the gear: ${JSON.stringify(await wins())}`)
  await pressQuick('[data-testid="iset-days"]', '10', 'calendar-open')
  const w1 = await wins(); note(`10 ${Z}`, `windows after Calendar: ${JSON.stringify(w1)}`)
  const cal = w1.find(w => w !== 'inputsset')
  if (!cal) return notWalked(`10 ${Z}`, `premise: Calendar window did not open (${JSON.stringify(w1)})`)
  note(`10 ${Z}`, `the Calendar window is on screen: ${JSON.stringify(await onScreen(`[data-testid="win-${cal}"]`))}; the settings window's X reachable: ${JSON.stringify(await onScreen('[data-testid="win-inputsset-x"]'))}`)
  await pressQuick(`[data-testid="win-${cal}-x"]`, '10', 'calendar-x')
  check(`10 ${Z}`, 'the Calendar window closes by its X and the settings window stays', !(await wins()).includes(cal) && (await wins()).includes('inputsset'), await wins())
  await press(page, tap, '[data-testid="iset-days"]'); await sleep(500)
  await page.keyboard.press('Escape'); await sleep(500)
  const w3 = await wins(); note(`10 ${Z}`, `after reopening Calendar and Escape: ${JSON.stringify(w3)}`)
  check(`10 ${Z}`, 'Escape closes the Calendar window only (the newest)', !w3.includes(cal) && w3.includes('inputsset'), w3)
  await sh('10', 'after-escape')
  if (!(await wins()).includes('inputsset')) await press(page, tap, '#inGear')
  await press(page, tap, '[data-testid="iset-days"]'); await sleep(400)
  await L.go(page, 'editsched'); await sleep(500)
  note(`10 ${Z}`, `on Edit Schedule, with settings and Calendar up before the page change: windows now ${JSON.stringify(await wins())}`)
  await sh('10', 'page-away')
  await L.go(page, 'inputs'); await sleep(500)
  note(`10 ${Z}`, `back on Inputs: windows ${JSON.stringify(await wins())}`); await sh('10', 'page-back')
  await closeAnyPop()
  await press(page, tap, '#inSansMode'); await sleep(600)
  const dayBtn = await page.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="sc-day-2026-"]')].filter(e => e.getBoundingClientRect().height > 0)[10]; return c ? 'data-testid=' + c.getAttribute('data-testid') : null })
  note(`10 ${Z}`, `a SANS day cell found by: ${dayBtn}`)
  if (!dayBtn) return notWalked(`10 ${Z}`, 'premise: no SANS day cell found')
  const [a, v] = dayBtn.split('='); await press(page, tap, `#page-inputs [${a}="${v}"]`); await sleep(600)
  note(`10 ${Z}`, `windows after a SANS day tap: ${JSON.stringify(await wins())}`); await sh('10', 'sans-day')
  const cb = page.getByRole('button', { name: /Calendar/ }).first()
  if (!(await cb.count())) return notWalked(`10 ${Z}`, 'premise: no Calendar button on the SANS day window')
  await pressQuick(cb, '10', 'sans-calendar')
  const w5 = await wins(); const c2 = w5.find(x => x !== 'sansday')
  note(`10 ${Z}`, `windows: ${JSON.stringify(w5)}; day box ${JSON.stringify(await onScreen('[data-testid="win-sansday"]'))}; calendar box ${JSON.stringify(await onScreen(`[data-testid="win-${c2 || 'none'}"]`))}`)
  await sh('10', 'sans-beside')
  if (c2) {
    await pressQuick(`[data-testid="win-${c2}-x"]`, '10', 'sans-cal-x'); check(`10 ${Z}`, 'the SANS day Calendar closes by its X', !(await wins()).includes(c2), await wins())
    await press(page, tap, page.getByRole('button', { name: /Calendar/ }).first()); await sleep(500); await page.keyboard.press('Escape'); await sleep(500)
    check(`10 ${Z}`, 'and by Escape', !(await wins()).includes(c2), await wins())
  }
  await closeAnyPop()
})
await step('11', async () => {
  await L.go(page, 'leavewar'); await sleep(500)
  await press(page, tap, '[data-testid="oil-tracker"]'); await sleep(700)
  note(`11 ${Z}`, `the OIL tracker, entries with a July date: ${JSON.stringify(((await page.evaluate(() => (document.querySelector('[data-testid="oil-sheet"]')?.innerText || '').replace(/\s+/g, ' '))).match(/.{0,30}\d+ Jul.{0,30}/g) || []).slice(0, 4))}`)
  await sh('11', 'oil-tracker')
  if (await page.locator('[data-testid="oil-close"]').count()) await page.locator('[data-testid="oil-close"]').first().click()
  await sleep(400)
  const opts = await page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? [...s.options].map(o => o.text.trim()) : [] })
  const other = opts.find(o => /27/.test(o))
  if (other) { await page.selectOption('[data-testid="war-picker"]', { label: other }); await sleep(600); await sh('11', 'other-period'); await page.selectOption('[data-testid="war-picker"]', { label: opts[0] }); await sleep(600) }
  note(`11 ${Z}`, `View picker options ${JSON.stringify(opts)}; went to ${other} and back to ${opts[0]}: now ${await page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s && s.options[s.selectedIndex].text })}`)
  await press(page, tap, '[data-testid="month-JUL"]'); await sleep(500); await sh('11', 'july')
})
await step('12', async () => {
  await signIn('us')
  const b = await bell(); note(`12 ${Z}`, `the member's bell: ${JSON.stringify(b)}`); await sh('12', 'bell'); await press(page, tap, '#notifyBell'); await sleep(300)
  const vd = await viewDay(); await showDay(page, DI, '#vWeek'); await sh('12', 'view-wed')
  note(`12 ${Z}`, `View-only Wed: the public note ${JSON.stringify(((vd || '').match(/.{0,20}Brief 0700.{0,20}/g) || []).slice(0, 1))}; LATE badges ${await lateTags('#vWeek', DI)}`)
  check(`12 ${Z}`, 'the member sees the public note and no LATE on his row', /Brief 0700/.test(vd || '') && (await lateTags('#vWeek', DI)) === 0, { late: await lateTags('#vWeek', DI) })
  const il = await inputsLate(); note(`12 ${Z}`, `the member's Inputs page prints LATE ${il} times`); await sh('12', 'inputs-page')
  check(`12 ${Z}`, 'the Inputs page still prints LATE for his input', il >= 1, il)
})
await ctx.close()
await L.finish(`plain-${SIZE}`)
