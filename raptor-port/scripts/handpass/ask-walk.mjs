// [ASK-AT-THE-CONTROL] the walk (D1627, D1628 — eight questions hang from the control pressed), on the frozen build.
//   cd raptor-port && WALK_DIR=<frozen dist> ISR_OUT=docs/img/handpass/2026-11-04-ask-at-the-control/walk LOOK_URL=http://localhost:4397/ node scripts/handpass/ask-walk.mjs [S1 …]
// Each scenario presses the real control, then asserts the RIGHT behaviour (a PASS means correct — re-running it is the
// re-walk): the card is up, drawn (not still measuring), whole on the screen, its pointer inside the control's width, a few
// pixels off its edge, not over the control; each answer reachable where it is drawn and its words inside it; the keyboard
// on the SAFE answer. Then each answer is pressed: the safe one changes nothing and gives the keyboard back to the control;
// the go-ahead does what it says; Escape is the safe answer. Pictures at each step; on a phone one right after the tap
// too (D1281). The plain-user round (D1557) looks at the other places that show the result.
import * as L from './isr-A-lib.mjs'
import { join } from 'node:path'
const { tid, note, check } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ONLY = process.argv.slice(2)
const want = s => !ONLY.length || ONLY.includes(s)
if (!ONLY.length) L.clean()

/* ---- what is measured of a card and the control it hangs from ---- */
const GEO = ([cardSel, ctlSel]) => {
  const vis = s => [...document.querySelectorAll(s)].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).pop()
  const c = vis(cardSel), k = ctlSel ? vis(ctlSel) : null
  if (!c) return { up: false }
  const r = c.getBoundingClientRect(), cr = k && k.getBoundingClientRect()
  const side = c.classList.contains('ac-below') ? 'below' : c.classList.contains('ac-above') ? 'above' : 'measure'
  const px = parseFloat(c.style.getPropertyValue('--ac-px')) || 0
  const tip = r.left + px
  const mid = cr ? (cr.left + cr.right) / 2 : null
  const gap = cr ? (side === 'below' ? r.top - cr.bottom : cr.top - r.bottom) : null
  const btns = [...c.querySelectorAll('button')].map(b => { const x = b.getBoundingClientRect(); const h = document.elementFromPoint(x.left + x.width / 2, x.top + x.height / 2); return { t: b.textContent.trim(), hit: !!h && (h === b || b.contains(h)), fits: b.scrollWidth <= b.clientWidth + 1 } })
  let covered = null
  if (cr) { const h = document.elementFromPoint(mid, (cr.top + cr.bottom) / 2); covered = !!h && c.contains(h) }
  const a = document.activeElement
  return { up: true, side, vis: getComputedStyle(c).visibility, op: getComputedStyle(c).opacity, inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5,
    tipOff: mid == null ? null : Math.round(tip - mid), tipInCtl: cr ? tip >= cr.left - 1 && tip <= cr.right + 1 : null, gap: gap == null ? null : Math.round(gap),
    btns, focus: a && c.contains(a) ? a.textContent.trim() : (a ? `outside:${a.tagName}${a.id ? '#' + a.id : ''}${a.dataset && a.dataset.testid ? '[' + a.dataset.testid + ']' : ''}` : null), covered, w: Math.round(r.width), q: (c.querySelector('.askcard-q') || {}).textContent }
}
const geo = (page, card, ctl) => page.evaluate(GEO, [card, ctl])
/* the standard assertions on a card just raised */
function judge(id, size, g, safe, qRe) {
  check(id, `${size}: the card is up and drawn`, g.up && g.vis === 'visible' && g.side !== 'measure' && g.op === '1', g.up ? { side: g.side, vis: g.vis } : g)
  if (!g.up) return
  check(id, `${size}: whole on the screen`, g.inView, g)
  check(id, `${size}: its pointer inside the control's width, ${g.side} it, a few px off its edge`, g.tipInCtl && g.gap >= 5 && g.gap <= 14, { tipOff: g.tipOff, gap: g.gap, side: g.side })
  check(id, `${size}: it does not cover the control`, g.covered === false, g.covered)
  check(id, `${size}: each answer reachable where drawn, its words inside it`, g.btns.length >= 2 && g.btns.every(b => b.hit && b.fits), g.btns)
  check(id, `${size}: the keyboard on the safe answer (${safe})`, g.focus === safe, g.focus)
  if (qRe) check(id, `${size}: the question reads as drawn`, qRe.test(g.q || ''), g.q)
}
const focusOn = (page) => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}${a.id ? '#' + a.id : ''}${a.dataset && a.dataset.testid ? '[' + a.dataset.testid + ']' : ''}${a.dataset && a.dataset.iid ? '{' + a.dataset.iid + '}' : ''}` : null })
async function pic(page, id, size, what) { const f = join(L.OUT, `${id}-${size}-${what}.png`); await page.screenshot({ path: f }); return f }
const setVal = (page, sel, v) => page.evaluate(([sel, v]) => { const r = document.querySelector(sel); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(r, v); r.dispatchEvent(new Event('input', { bubbles: true })) }, [sel, v])
const WIN = '[data-testid="win-inputedit"]', DAYWIN = '[data-testid="win-inputsday"]'
const peopleOf = (page, iid) => page.evaluate(iid => { const r = window.INPUTS.find(x => String(x.iid) === String(iid)); return r ? (r.people || []).map(e => e.p) : null }, iid)
const esc = page => page.keyboard.press('Escape').then(() => sleep(250))

/* ============================================================ S1 — #3 "Delete this input for all 3 people?" */
if (want('S1')) for (const size of ['desktop', 'phone']) {
  const id = 'S1', { page, tap } = await L.session(size)
  const men = await L.freeMen(page, 3, [2])
  const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
  await L.press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
  await L.press(page, tap, '#inpEditDel')
  if (tap) await pic(page, id, size, '1-just-tapped')
  await sleep(250)
  judge(id, size, await geo(page, '[data-testid="inped-delall"]', '#inpEditDel'), 'Keep', /Delete this input for all 3 people\?/)
  await pic(page, id, size, '2-card')
  await L.press(page, tap, '[data-testid="inped-delall-no"]')
  check(id, `${size}: Keep keeps all three, the card gone`, (await peopleOf(page, iid))?.length === 3 && !(await page.locator('[data-testid="inped-delall"]').count()), await peopleOf(page, iid))
  if (!tap) check(id, `${size}: the keyboard back on Delete`, (await focusOn(page)) === 'BUTTON#inpEditDel', await focusOn(page))
  await L.press(page, tap, '#inpEditDel'); await esc(page)
  check(id, `${size}: Escape is Keep — the card gone, the window stays`, !(await page.locator('[data-testid="inped-delall"]').count()) && (await page.locator(WIN).count()) === 1, null)
  await L.press(page, tap, '#inpEditDel'); await L.press(page, tap, '#inpEditDel')
  check(id, `${size}: Delete pressed again while asked — still one question, nothing deleted`, (await page.locator('[data-testid="inped-delall"]').count()) === 1 && (await peopleOf(page, iid))?.length === 3, null)
  await L.press(page, tap, '[data-testid="inped-delall-yes"]'); await sleep(300)
  check(id, `${size}: its Delete deletes the input for all three, the window closes`, (await peopleOf(page, iid)) === null && !(await page.locator(WIN).count()), await peopleOf(page, iid))
  /* the plain user's look elsewhere (D1557): the opened day and the month no longer show it */
  check(id, `${size}: gone from the opened day`, !(await page.locator(`[data-testid="idy-row-${iid}"]`).count()), null)
  await pic(page, id, size, '3-after-delete')
  await page.context().close()
}

/* ============================================================ S2 — #4 "Take yourself out of this input?" (Ranger) */
if (want('S2')) for (const size of ['desktop', 'phone']) {
  const id = 'S2', { page, tap } = await L.session(size, 'ad')
  const ranger = await page.evaluate(() => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === 'Ranger'))
  const other = (await L.freeMen(page, 3, [2])).filter(x => x !== ranger).slice(0, 2)
  const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: [ranger, ...other], from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' })
  await page.evaluate(() => document.getElementById('logout').click()); await page.waitForSelector('#luser')
  await page.fill('#luser', 'us'); await page.fill('#lpass', 'us'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(400)
  await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, '2026-07-15')
  await L.press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
  const BTN = '[data-testid="inped-takeout"]'
  await L.press(page, tap, BTN)
  if (tap) await pic(page, id, size, '1-just-tapped')
  await sleep(250)
  judge(id, size, await geo(page, '[data-testid="inped-takeout-ask"]', BTN), 'Stay in', /Take yourself out of this input\? It stays for the other 2 people\./)
  check(id, `${size}: Take me out stays in sight while asked (D1627, as drawn)`, (await page.locator(BTN).count()) === 1 && (await page.locator(BTN).getAttribute('aria-expanded')) === 'true', null)
  await pic(page, id, size, '2-card')
  await L.press(page, tap, BTN)
  check(id, `${size}: Take me out pressed again — the question stays, one card`, (await page.locator('[data-testid="inped-takeout-ask"]').count()) === 1, null)
  await L.press(page, tap, '[data-testid="inped-takeout-no"]')
  check(id, `${size}: Stay in keeps him in, the card gone`, (await peopleOf(page, iid))?.includes(ranger) && !(await page.locator('[data-testid="inped-takeout-ask"]').count()), null)
  if (!tap) check(id, `${size}: the keyboard back on Take me out`, (await focusOn(page)) === 'BUTTON[inped-takeout]', await focusOn(page))
  await L.press(page, tap, BTN); await esc(page)
  check(id, `${size}: Escape is Stay in — the window stays`, !(await page.locator('[data-testid="inped-takeout-ask"]').count()) && (await page.locator(WIN).count()) === 1 && (await peopleOf(page, iid))?.includes(ranger), null)
  await L.press(page, tap, BTN); await L.press(page, tap, '[data-testid="inped-takeout-yes"]'); await sleep(300)
  const ppl = await peopleOf(page, iid)
  check(id, `${size}: its Take me out takes Ranger alone out, the input staying for the other two`, ppl && ppl.length === 2 && !ppl.includes(ranger), ppl)
  check(id, `${size}: the opened day's card no longer names him`, !((await L.text(page, `[data-testid="idy-row-${iid}"]`)) || '').includes('Ranger'), await L.text(page, `[data-testid="idy-row-${iid}"]`))
  await pic(page, id, size, '3-after')
  await page.context().close()
}

/* ============================================================ S3 — #2 "Open the other input and lose them?" */
if (want('S3')) for (const size of ['desktop', 'phone']) {
  const id = 'S3', { page, tap } = await L.session(size)
  const men = await L.freeMen(page, 2, [2])
  const a = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: [men[0]], from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
  await L.press(page, tap, '[data-testid="win-inputsday-x"]').catch(() => {})
  const b = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: [men[1]], from: '11:00', to: '12:00', title: 'Sim brief', remarks: 'second card' }, true)
  const raise = async () => {
    /* each try starts as the first did: an input's window left open (and perhaps pulled down) is closed by its Cancel */
    if (await page.locator('#inpEditCancel').count()) { await page.locator('#inpEditCancel').evaluate(b => b.click()); await sleep(300) }
    /* (the set-up, not the control walked: the first input opened by its card's own click wherever the day has scrolled it) */
    await page.locator(`[data-testid="idy-row-${a}"] [data-testid="idy-open"]`).first().evaluate(b => b.click()); await tid(page, 'win-inputedit').waitFor()
    await setVal(page, '#inpEditPop #inpEditRmk', 'typed, not saved')
    let ctl
    if (!tap) { ctl = `#inpCal [data-iid="${b}"]`; await page.locator(ctl).first().click() }
    else {
      const bar = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); for (const y of [r.top + 10, r.top + 20]) for (const x of [r.left + 70, r.left + 120, r.left + 30]) { const h = document.elementFromPoint(x, y); if (h && e.contains(h) && !h.closest('.win-x, .win-tools')) return { x, y } } return null }, `${DAYWIN} .win-bar`)
      if (bar) { await page.touchscreen.tap(bar.x, bar.y); await sleep(350) }
      ctl = `${DAYWIN} [data-testid="idy-row-${b}"] [data-testid="idy-open"]`
      const find = () => page.evaluate(sel => { const o = document.querySelector(sel); if (!o) return null; const r = o.getBoundingClientRect(); for (const y of [r.top + 5, r.top + r.height / 2, r.bottom - 5]) for (const f of [1 / 3, 1 / 2, 2 / 3]) { const x = r.left + r.width * f, h = document.elementFromPoint(x, y); if (h && o.contains(h)) return { x, y } } return null }, ctl)
      let pt = await find()
      /* the input's window stands over the other card (D997, D909): pulled down by its bar, as a finger would, first */
      if (!pt) {
        const g = await page.evaluate(() => { const b = document.querySelector('[data-testid="win-inputedit"] .win-bar'); const r = b.getBoundingClientRect(); return { x: r.left + 60, y: r.top + r.height / 2 } })
        const cdp = await page.context().newCDPSession(page)
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: g.x, y: g.y, id: 3 }] })
        for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: g.x, y: Math.round(g.y + 52 * i), id: 3 }] }); await sleep(25) }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(400)
        await page.evaluate(sel => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), ctl); await sleep(250)
        pt = await find()
        note('S3', `phone: the input window pulled down by its bar to reach the other card — reachable after: ${!!pt}`)
      }
      if (pt) await page.touchscreen.tap(pt.x, pt.y)
    }
    return ctl
  }
  const ctl = await raise()
  if (tap) await pic(page, id, size, '1-just-tapped')
  await sleep(350)
  judge(id, size, await geo(page, '[data-testid="inped-swap"]', ctl), 'Keep editing', /This input has unsaved changes\. Open .+’s input and lose them\?/)
  if (tap) check(id, `${size}: the opened day keeps the front, the card in it (as drawn)`, await page.evaluate(() => /\bfront\b/.test(document.querySelector('[data-testid="win-inputsday"]').className) && !!document.querySelector('[data-testid="win-inputsday"] [data-testid="inped-swap"]')), null)
  await pic(page, id, size, '2-card')
  await L.press(page, tap, '[data-testid="inped-swap-stay"]')
  check(id, `${size}: Keep editing keeps what was typed, the card gone`, (await page.inputValue('#inpEditPop #inpEditRmk')) === 'typed, not saved' && !(await page.locator('[data-testid="inped-swap"]').count()), { v: await page.inputValue('#inpEditPop #inpEditRmk'), n: await page.locator('[data-testid="inped-swap"]').count(), front: await page.evaluate(() => [...document.querySelectorAll('.floatwin.front')].map(w => w.dataset.testid)) })
  await raise(); await sleep(350); await esc(page)
  check(id, `${size}: Escape is Keep editing — the opened day stays open`, !(await page.locator('[data-testid="inped-swap"]').count()) && (await page.inputValue('#inpEditPop #inpEditRmk')) === 'typed, not saved' && (await page.locator(DAYWIN).count()) === 1, await page.evaluate(() => ({ day: !!document.querySelector('[data-testid="win-inputsday"]'), front: [...document.querySelectorAll('.floatwin.front')].map(w => w.dataset.testid) })))
  await raise(); await sleep(350)
  await L.press(page, tap, '[data-testid="inped-swap-go"]'); await sleep(350)
  check(id, `${size}: Discard and open shows the other input, the typing thrown away`, (await page.inputValue('#inpEditPop #inpEditRmk')) === 'second card', await page.inputValue('#inpEditPop #inpEditRmk'))
  check(id, `${size}: the first input kept as filed`, (await L.rec(page, a))?.remarks === 'as filed', (await L.rec(page, a))?.remarks)
  await pic(page, id, size, '3-after-open')
  await page.context().close()
}

/* ============================================================ S4 — #5 the Delete key on the opened day's card */
if (want('S4')) for (const size of ['desktop', 'phone']) {
  const id = 'S4', { page, tap } = await L.session(size)
  const men = await L.freeMen(page, 2, [2])
  const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
  const CARD = `${DAYWIN} [data-testid="idy-row-${iid}"]`
  await page.locator(`${CARD} [data-testid="idy-open"]`).focus(); await page.keyboard.press('Delete'); await sleep(300)
  judge(id, size, await geo(page, '[data-testid="idy-ask"]', CARD), 'Keep', /Delete this input for all 2 people\?/)
  await pic(page, id, size, '2-card')
  await esc(page)
  check(id, `${size}: Escape is Keep — the card gone, the day open`, !(await page.locator('[data-testid="idy-ask"]').count()) && (await page.locator(DAYWIN).count()) === 1 && (await peopleOf(page, iid))?.length === 2, null)
  check(id, `${size}: the keyboard back on the card`, /idy-open/.test((await focusOn(page)) || ''), await focusOn(page))
  await page.locator(`${CARD} [data-testid="idy-open"]`).focus(); await page.keyboard.press('Delete'); await sleep(250)
  await L.press(page, tap, '[data-testid="idy-del-no"]')
  check(id, `${size}: Keep (pressed) keeps it`, (await peopleOf(page, iid))?.length === 2 && !(await page.locator('[data-testid="idy-ask"]').count()), null)
  await page.locator(`${CARD} [data-testid="idy-open"]`).focus(); await page.keyboard.press('Delete'); await sleep(250)
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Enter'); await sleep(300)
  check(id, `${size}: Shift+Tab, Enter — Delete deletes it`, (await peopleOf(page, iid)) === null, await peopleOf(page, iid))
  await pic(page, id, size, '3-after')
  await page.context().close()
}

/* ---- the Leave War's own steps (as ask-at-leave-war.mjs drives them) ---- */
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
async function lwOpen(page, iso) {
  await L.go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await sleep(500)
  const m = page.locator(`[data-testid="month-${MON[+iso.slice(5, 7) - 1]}"]:visible`).first()
  if (await m.count()) { await m.click(); await sleep(900) }
}
async function tapCell(page, tap, pid, iso) {
  const c = page.locator(`[data-testid="cell-${pid}-${iso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
  if (tap) await page.touchscreen.tap(at.x, at.y); else await page.mouse.click(at.x, at.y)
  await sleep(700)
}
async function lwPress(page, tap, sel) { const b = page.locator(sel).filter({ visible: true }).last(); await b.scrollIntoViewIfNeeded().catch(() => {}); if (tap) await b.tap(); else await b.click(); await sleep(tap ? 650 : 250) }
async function dragSel(page, tap, pid, from, to) {
  const c = page.locator(`[data-testid="cell-${pid}-${from}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(350)
  const pt = d => page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } }, `[data-testid="cell-${pid}-${d}"]`)
  const a = await pt(from), b = await pt(to)
  if (tap) {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 7 }] }); await sleep(450)
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(a.x + (b.x - a.x) * i / 8), y: Math.round(a.y + (b.y - a.y) * i / 8), id: 7 }] }); await sleep(30) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else { await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + 8, a.y); await page.mouse.move(b.x, b.y, { steps: 6 }); await page.mouse.up() }
  await sleep(900); await page.locator('[data-testid="select-sheet"]').waitFor({ timeout: 5000 })
}
const SHEET = '.bidsheet[role="dialog"]', SEL = '[data-testid="select-sheet"]', PO = '[data-testid="postout-sheet"]'
const lwP = (page, pid) => page.evaluate(pid => { const s = window.__lw && window.__lw.getState ? window.__lw.getState() : null; const p = s && s.people.find(x => x.id === pid); return p ? { to: p.to, poOutcome: p.poOutcome } : null }, pid)
const person = (page, pid) => page.evaluate(pid => { const p = window.PEOPLE[pid]; return p ? { cs: p.cs, deleted: !!p.deleted, deletedFrom: p.deletedFrom || null } : null }, pid)
const usersRow = (page, cs) => page.evaluate(cs => { const all = [...document.querySelectorAll('#page-admin *')].filter(e => (e.textContent || '').includes(cs) && /posting out|auto delete|posted out/i.test(e.textContent || '')); all.sort((a, b) => a.textContent.length - b.textContent.length); const r = all[0]; return r ? r.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) : null }, cs)

/* ============================================================ S5 — #45 the one-day sheet's Post out, Delete chosen */
if (want('S5')) for (const size of ['desktop', 'phone']) {
  const id = 'S5', PID = 'wolf', ISO = '2026-11-20', { page, tap } = await L.session(size)
  const cs = (await person(page, PID)).cs
  const open = async () => { await tapCell(page, tap, PID, ISO); await lwPress(page, tap, `${SHEET} [data-testid="bid-more"]`); await lwPress(page, tap, '[data-testid="bid-postout"]'); await lwPress(page, tap, `${SHEET} [data-testid="po-delete"]`) }
  await lwOpen(page, ISO); await open()
  const BTN = `${SHEET} [data-testid="po-confirm"]`
  await lwPress(page, tap, BTN)
  if (tap) await pic(page, id, size, '1-just-tapped')
  await sleep(200)
  judge(id, size, await geo(page, '[data-testid="po-delete-ask"]', BTN), 'Cancel', new RegExp(`^Delete ${cs}\\?$`))
  check(id, `${size}: Post out keeps its word`, (await L.text(page, BTN)) === 'Post out', await L.text(page, BTN))
  await pic(page, id, size, '2-card')
  await lwPress(page, tap, BTN)
  check(id, `${size}: Post out pressed again — still one question, nothing posted`, (await page.locator('[data-testid="po-delete-ask"]').count()) === 1 && !(await person(page, PID)).deleted, null)
  await lwPress(page, tap, '[data-testid="po-delete-cancel"]')
  check(id, `${size}: Cancel posts nothing, the card gone, the sheet up`, !(await page.locator('[data-testid="po-delete-ask"]').count()) && (await page.locator(SHEET).count()) >= 1, null)
  await lwPress(page, tap, BTN); await esc(page)
  check(id, `${size}: Escape is Cancel — the sheet stays`, !(await page.locator('[data-testid="po-delete-ask"]').count()) && (await page.locator(SHEET).count()) >= 1, null)
  await lwPress(page, tap, BTN); await lwPress(page, tap, '[data-testid="po-delete-go"]'); await sleep(500)
  const row = await page.evaluate(([pid, iso]) => { const c = document.querySelector(`[data-testid="cell-${pid}-${iso}"]`); return c ? (c.textContent || '').trim() : null }, [PID, ISO])
  check(id, `${size}: its Delete posts him out, Delete chosen (the sheet closes)`, !(await page.locator(SHEET).count()), { row })
  await pic(page, id, size, '3-after')
  await L.go(page, 'admin'); await sleep(500)
  const ur = await usersRow(page, cs)
  check(id, `${size}: Admin → Users says "posting out … auto delete" (D1105)`, /auto delete/i.test(ur || ''), ur)
  await pic(page, id, size, '4-admin-users')
  await page.context().close()
}

/* ============================================================ S6 — #46 the drag sheet's Post out, Delete chosen */
if (want('S6')) for (const size of ['desktop', 'phone']) {
  const id = 'S6', PID = 'stuff', A = '2026-11-18', B = '2026-11-20', { page, tap } = await L.session(size)
  const cs = (await person(page, PID)).cs
  const open = async () => { await dragSel(page, tap, PID, A, B); await lwPress(page, tap, `${SEL} [data-testid="sel-more"]`); await lwPress(page, tap, '[data-testid="sel-postout"]'); await lwPress(page, tap, `${SEL} [data-testid="sel-po-delete"]`) }
  await lwOpen(page, A); await open()
  const BTN = `${SEL} [data-testid="sel-po-confirm"]`
  await lwPress(page, tap, BTN)
  if (tap) await pic(page, id, size, '1-just-tapped')
  await sleep(200)
  judge(id, size, await geo(page, '[data-testid="sel-po-delete-ask"]', BTN), 'Cancel', new RegExp(`^Delete ${cs}\\?$`))
  await pic(page, id, size, '2-card')
  await lwPress(page, tap, '[data-testid="sel-po-delete-cancel"]')
  check(id, `${size}: Cancel posts nothing, the sheet stays`, !(await page.locator('[data-testid="sel-po-delete-ask"]').count()) && (await page.locator(SEL).count()) === 1, null)
  await lwPress(page, tap, BTN); await esc(page)
  check(id, `${size}: Escape is Cancel — the sheet stays`, !(await page.locator('[data-testid="sel-po-delete-ask"]').count()) && (await page.locator(SEL).count()) === 1, null)
  await lwPress(page, tap, BTN); await lwPress(page, tap, '[data-testid="sel-po-delete-go"]'); await sleep(500)
  check(id, `${size}: its Delete posts him out (the sheet closes)`, !(await page.locator(SEL).count()), null)
  await L.go(page, 'admin'); await sleep(500)
  const ur = await usersRow(page, cs)
  check(id, `${size}: Admin → Users says "auto delete"`, /auto delete/i.test(ur || ''), ur)
  await pic(page, id, size, '3-admin-users')
  await page.context().close()
}

/* ============================================================ S7 — #47 the Posted out sheet's Delete chip */
if (want('S7')) for (const size of ['desktop', 'phone']) {
  const id = 'S7', PID = 'dirty', ISO = '2026-11-20', { page, tap } = await L.session(size)
  const cs = (await person(page, PID)).cs
  await lwOpen(page, ISO)
  await tapCell(page, tap, PID, ISO); await lwPress(page, tap, `${SHEET} [data-testid="bid-more"]`); await lwPress(page, tap, '[data-testid="bid-postout"]')
  await lwPress(page, tap, `${SHEET} [data-testid="po-overseas"]`).catch(() => {})
  if ((await page.locator(`${SHEET} [data-testid="po-overseas"]`).getAttribute('aria-pressed')) !== 'true') await lwPress(page, tap, `${SHEET} [data-testid="po-overseas"]`)
  await lwPress(page, tap, `${SHEET} [data-testid="po-confirm"]`); await sleep(500)
  await tapCell(page, tap, PID, ISO); await page.locator(PO).waitFor({ timeout: 5000 })
  const CHIP = `${PO} [data-testid="postout-delete"]`
  await lwPress(page, tap, CHIP)
  if (tap) await pic(page, id, size, '1-just-tapped')
  await sleep(200)
  judge(id, size, await geo(page, '[data-testid="postout-delete-ask"]', CHIP), 'Cancel', new RegExp(`^Delete ${cs}\\?$`))
  check(id, `${size}: no "Tap again to delete" row is left on the sheet`, !/Tap again/.test((await L.text(page, PO)) || ''), null)
  await pic(page, id, size, '2-card')
  await lwPress(page, tap, '[data-testid="postout-delete-cancel"]')
  check(id, `${size}: Cancel — the chip back on Overseas, nothing changed`, !(await page.locator('[data-testid="postout-delete-ask"]').count()) && (await page.locator(`${PO} [data-testid="postout-overseas"]`).getAttribute('aria-pressed')) === 'true', null)
  await lwPress(page, tap, CHIP); await lwPress(page, tap, CHIP)
  check(id, `${size}: the Delete chip tapped again backs out (as today)`, !(await page.locator('[data-testid="postout-delete-ask"]').count()), null)
  await lwPress(page, tap, CHIP); await lwPress(page, tap, '[data-testid="postout-delete-go"]'); await sleep(400)
  check(id, `${size}: its Delete makes it a Delete posting`, (await page.locator(`${PO} [data-testid="postout-delete"]`).getAttribute('aria-pressed')) === 'true', null)
  await pic(page, id, size, '3-after')
  await page.context().close()
}

/* ============================================================ S8 — #48 a Delete posting's date moved to today */
if (want('S8')) for (const size of ['desktop', 'phone']) {
  const id = 'S8', PID = 'wolf', ISO = '2026-11-20', { page, tap } = await L.session(size)
  const NOW = await page.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })
  const cs = (await person(page, PID)).cs
  await lwOpen(page, ISO)
  await tapCell(page, tap, PID, ISO); await lwPress(page, tap, `${SHEET} [data-testid="bid-more"]`); await lwPress(page, tap, '[data-testid="bid-postout"]')
  await lwPress(page, tap, `${SHEET} [data-testid="po-delete"]`); await lwPress(page, tap, `${SHEET} [data-testid="po-confirm"]`); await lwPress(page, tap, '[data-testid="po-delete-go"]'); await sleep(500)
  const BOX = `${PO} [data-testid="postout-date"]`
  const pick = async () => { await tapCell(page, tap, PID, ISO); await page.locator(PO).waitFor({ timeout: 5000 }); await lwPress(page, tap, BOX); await lwPress(page, tap, `[data-testid="dcal-day-${NOW}"]`) }
  await pick()
  if (tap) await pic(page, id, size, '1-just-picked')
  await sleep(250)
  judge(id, size, await geo(page, '[data-testid="postout-delete-ask"]', BOX), 'Cancel', new RegExp(`^Delete ${cs} now\\?$`))
  check(id, `${size}: not deleted at the pick`, !(await person(page, PID)).deleted, await person(page, PID))
  await pic(page, id, size, '2-card')
  await lwPress(page, tap, '[data-testid="postout-delete-cancel"]')
  const back = await page.evaluate(s => (document.querySelector(s) || {}).textContent, BOX)
  check(id, `${size}: Cancel puts the date back, deletes no one`, !(await page.locator('[data-testid="postout-delete-ask"]').count()) && !(await person(page, PID)).deleted && /20 Nov/.test(back || ''), back)
  await lwPress(page, tap, BOX); await lwPress(page, tap, `[data-testid="dcal-day-${NOW}"]`); await sleep(250)
  await lwPress(page, tap, '[data-testid="postout-delete-go"]'); await sleep(500)
  check(id, `${size}: its Delete deletes him from today`, (await person(page, PID))?.deleted === true || (await person(page, PID)) === null, await person(page, PID))
  await pic(page, id, size, '3-after')
  await page.context().close()
}

/* ============================================================ S9 — #3 from the schedule's own window (the Scheduler Board's
   Personal Inputs line): the same question, the same card, in the pop-up that opens there (the roll-call's second door) */
if (want('S9')) for (const size of ['desktop', 'phone']) {
  const id = 'S9', { page, tap } = await L.session(size)
  const men = await L.freeMen(page, 3, [2])
  const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Range brief', remarks: 'board door' })
  await L.go(page, 'editsched')
  await page.evaluate(di => window.openScheduler(di), 2); await sleep(700)
  const fold = page.locator('#schedBoard [data-pitog="2"]').first()
  if (await fold.count() && /⌄/.test(await fold.innerText())) { await L.press(page, tap, fold); await sleep(300) }
  const row = page.locator('#schedBoard .sb-panel.pinp .sb-arow.inprow .inpedit').first()
  if (!(await row.count())) { L.notWalked(id, `${size}: no Personal Inputs line found on the board`); await page.context().close(); continue }
  await row.scrollIntoViewIfNeeded(); await L.press(page, tap, row); await page.locator('#inpEditDel').waitFor({ timeout: 5000 })
  await L.press(page, tap, '#inpEditDel')
  if (tap) await pic(page, id, size, '1-just-tapped')
  await sleep(250)
  judge(id, size, await geo(page, '[data-testid="inped-delall"]', '#inpEditDel'), 'Keep', /Delete this input for all 3 people\?/)
  await pic(page, id, size, '2-card')
  await L.press(page, tap, '[data-testid="inped-delall-no"]')
  check(id, `${size}: Keep keeps it`, (await peopleOf(page, iid))?.length === 3, await peopleOf(page, iid))
  await L.press(page, tap, '#inpEditDel'); await L.press(page, tap, '[data-testid="inped-delall-yes"]'); await sleep(400)
  check(id, `${size}: Delete deletes it — gone from the board's Personal Inputs`, (await peopleOf(page, iid)) === null && !/Range brief/.test((await L.text(page, '#schedBoard .sb-panel.pinp')) || ''), await peopleOf(page, iid))
  await pic(page, id, size, '3-after')
  await page.context().close()
}

/* ============================================================ S10 — #2 from the Inputs LIST (another door to the swap) */
if (want('S10')) for (const size of ['desktop', 'phone']) {
  const id = 'S10', { page, tap } = await L.session(size)
  const men = await L.freeMen(page, 2, [2])
  const a = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: [men[0]], from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' })
  const b = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: [men[1]], from: '11:00', to: '12:00', title: 'Sim brief', remarks: 'second card' })
  await L.go(page, 'inputs')
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await L.press(page, tap, '#inListBtn')
  await sleep(400)
  const rowOf = iid => `#page-inputs [data-iid="${iid}"]:not(#inpCal *)`
  const ra = page.locator(rowOf(a)).filter({ visible: true }).first(), rb = page.locator(rowOf(b)).filter({ visible: true }).first()
  if (!(await ra.count()) || !(await rb.count())) { L.notWalked(id, `${size}: the two inputs' rows not found in the list`); await page.context().close(); continue }
  await ra.scrollIntoViewIfNeeded(); await L.press(page, tap, ra); await tid(page, 'win-inputedit').waitFor()
  await setVal(page, '#inpEditPop #inpEditRmk', 'typed, not saved')
  const vis = await rb.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 3, r.top + r.height / 2); return !!h && e.contains(h) })
  if (!vis) { L.notWalked(id, `${size}: the other row lies under the window — not reachable without moving it`); await page.context().close(); continue }
  await L.press(page, tap, rb); await sleep(350)
  judge(id, size, await geo(page, '[data-testid="inped-swap"]', rowOf(b)), 'Keep editing', /Open .+’s input and lose them\?/)
  await pic(page, id, size, '2-card')
  await L.press(page, tap, '[data-testid="inped-swap-stay"]')
  check(id, `${size}: Keep editing keeps the typing`, (await page.inputValue('#inpEditPop #inpEditRmk')) === 'typed, not saved', null)
  await page.context().close()
}

/* ============================================================ B — break tests */
/* B1: the card follows its control when what holds it scrolls, and when the screen changes size (desktop) */
if (want('B1')) {
  const id = 'B1', size = 'desktop', { page, tap } = await L.session(size)
  const men = await L.freeMen(page, 2, [2])
  const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
  const CARD = `${DAYWIN} [data-testid="idy-row-${iid}"]`
  await page.locator(`${CARD} [data-testid="idy-open"]`).focus(); await page.keyboard.press('Delete'); await sleep(300)
  await page.setViewportSize({ width: 1100, height: 760 }); await sleep(400)
  const g = await geo(page, '[data-testid="idy-ask"]', CARD)
  check(id, 'the screen made smaller with the card up — it still hangs from its card, whole on the screen', g.up && g.inView && g.tipInCtl && g.gap >= 5 && g.gap <= 14, g)
  await pic(page, id, size, 'resized')
  await page.context().close()
}
/* B2: a Leave War sheet moved by its handle first (a transform), then the question — the card still at its button */
if (want('B2')) {
  const id = 'B2', size = 'desktop', PID = 'wolf', ISO = '2026-11-20', { page, tap } = await L.session(size)
  await lwOpen(page, ISO); await tapCell(page, tap, PID, ISO)
  await lwPress(page, tap, `${SHEET} [data-testid="bid-more"]`); await lwPress(page, tap, '[data-testid="bid-postout"]'); await lwPress(page, tap, `${SHEET} [data-testid="po-delete"]`)
  const h = await page.evaluate(s => { const sh = document.querySelector(s); const hd = sh && (sh.querySelector('.bidsheet-grip, .grip, .bidsheet-hd')); const r = hd.getBoundingClientRect(); return { x: r.left + 40, y: r.top + 8 } }, SHEET)
  await page.mouse.move(h.x, h.y); await page.mouse.down(); await page.mouse.move(h.x - 180, h.y - 60, { steps: 8 }); await page.mouse.up(); await sleep(300)
  const moved = await page.evaluate(s => getComputedStyle(document.querySelector(s)).transform, SHEET)
  note(id, `the sheet's transform after the drag: ${moved}`)
  const BTN = `${SHEET} [data-testid="po-confirm"]`
  await lwPress(page, tap, BTN); await sleep(250)
  judge(id, size, await geo(page, '[data-testid="po-delete-ask"]', BTN), 'Cancel')
  await pic(page, id, size, 'moved-sheet')
  await page.context().close()
}
/* B3: the swap raised by "+ Input" in the opened day (a new input asked for over unsaved work) hangs from + Input */
if (want('B3')) for (const size of ['desktop', 'phone']) {
  const id = 'B3', { page, tap } = await L.session(size)
  const men = await L.freeMen(page, 1, [2])
  const a = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: [men[0]], from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
  await L.press(page, tap, `[data-testid="idy-row-${a}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
  await setVal(page, '#inpEditPop #inpEditRmk', 'typed, not saved')
  const ADD = `${DAYWIN} #icPopAdd`
  const has = await page.locator(ADD).count()
  if (!has) { L.notWalked(id, `${size}: no + Input found in the opened day by its usual names`); await page.context().close(); continue }
  /* the day's + Input lies under the input's window: the day brought forward by a press on its bar's free part, as a person would; on a phone where its bar is covered too, the input's window is pulled down first */
  { const hitBar = () => page.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); for (const x of [r.left + 70, r.left + 120, r.left + 40]) { const y = r.top + r.height / 2, h = document.elementFromPoint(x, y); if (h && e.contains(h) && !h.closest('.win-x, .win-tools, button')) return { x, y } } return null }, `${DAYWIN} .win-bar`)
    let bar = await hitBar()
    if (!bar && tap) { const g = await page.evaluate(() => { const r = document.querySelector('[data-testid="win-inputedit"] .win-bar').getBoundingClientRect(); return { x: r.left + 60, y: r.top + r.height / 2 } }); const cdp = await page.context().newCDPSession(page); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: g.x, y: g.y, id: 3 }] }); for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: g.x, y: Math.round(g.y + 52 * i), id: 3 }] }); await sleep(25) } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(400); bar = await hitBar() }
    if (!bar && !tap) { const g = await page.evaluate(() => { const r = document.querySelector('[data-testid="win-inputedit"] .win-ttl, [data-testid="win-inputedit"] .win-bar').getBoundingClientRect(); return { x: r.left + 40, y: r.top + r.height / 2 } }); await page.mouse.move(g.x, g.y); await page.mouse.down(); await page.mouse.move(g.x - 520, g.y + 40, { steps: 10 }); await page.mouse.up(); await sleep(300); bar = await hitBar() }
    if (bar) { if (tap) await page.touchscreen.tap(bar.x, bar.y); else await page.mouse.click(bar.x, bar.y); await sleep(350) }
    note(id, size + ': the day brought forward by its bar: ' + !!bar) }
  await L.press(page, tap, page.locator(ADD).first()); await sleep(350)
  judge(id, size, await geo(page, '[data-testid="inped-swap"]', ADD), 'Keep editing', /Open a new input and lose them\?/)
  await pic(page, id, size, 'card-from-add')
  await page.context().close()
}

await L.finish('ask-walk')
