/* [DB-READINESS] phase 7 walk — walker C, C32 (the PHONE, 390 × 844): the phone's tap-arm on the board and on the week,
   and a finger's long-press drag, onto a flying line's cockpit — on a DRAFT Tuesday (the desktop pass used a published
   one). A blank line is added with the wave's own "+ Line" so both of its seats are empty. */
import { boot, world } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L, { phone: true })
await C.toastSpy(p)
const DI = 1
const NAME = { all: 'ALL', allavail: 'ALL AVAIL' }
await W.boardOn(p, DI)
const add = p.locator('#schedBoard [data-gline="1.0"]:visible').first()
await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200); await add.tap(); await L.sleep(700)
const EP = '1.0.2.0.p', EW = '1.0.2.0.w', OP = '1.0.0.0.p', OW = '1.0.0.0.w'
const KEYS = [EP, EW, OP, OW]
const attempt = C.makeAttempt({ L, p, di: DI, keys: KEYS })
await L.settle(p)
const empty = await p.evaluate(ks => ks.map(k => k + '=' + (window.slotVal(k) || 'empty')), [EP, EW])
await p.locator(`#schedBoard [data-slot="${EP}"]:visible`).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
await L.shot(p, 'C32-phone-00-blank-line')
C.row('C32-phone-setup', 'phone, board, Tuesday (a draft day): the 1st wave\'s "+ Line" tapped', `a blank third line with two empty seats: ${empty.join(', ')}`, 'toast "Line added"', empty.every(x => /empty/.test(x)) ? 'PASS' : 'FAIL', ['C32-phone-00-blank-line.png'])

/* the crew drawer covers the rear seats: a person shuts it by its own AIRCREW tab before tapping one */
async function drawerState(ros) { return p.evaluate(r => { const e = document.querySelector(r + ' .rpuck[data-person="all"]'); if (!e) return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.x >= 0 && b.x + b.width <= innerWidth }, ros) }
async function tabTap() {
  const tab = await p.evaluate(() => { const c = [...document.querySelectorAll('body *')].filter(e => e.offsetParent !== null && /^s*AIRCREWs*$/.test(e.innerText || '')); const e = c[c.length - 1]; if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } })
  if (!tab) return false
  await p.touchscreen.tap(tab.x, tab.y); await L.sleep(600); return true
}
async function shutDrawer(ros) { for (let i = 0; i < 2 && await drawerState(ros); i++) await tabTap(); return !(await drawerState(ros)) }
async function armTapPhone(surface, key, pid, shoot, shotId) {
  const root = surface === 'board' ? '#schedBoard' : '#eWeek', ros = surface === 'board' ? '#sbRoster' : '#eRoster'
  const shut = await shutDrawer(ros)
  const seat = p.locator(`${root} [data-slot="${key}"]:visible`).first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(300)
  if (!shut) throw new Error('the crew drawer would not shut')
  await seat.tap({ timeout: 6000 }); await L.sleep(600)
  const armed = await p.evaluate(() => window.armedKey())
  if (armed !== key) throw new Error(`the seat did not arm (armed: ${armed})`)
  const struck = await p.evaluate(([ros, pid]) => { const e = document.querySelector(`${ros} .rpuck[data-person="${pid}"]`); if (!e) return null; const b = e.getBoundingClientRect(); const rowEl = e.closest('.rall') || e.parentElement
    const why = e.nextElementSibling; const wb = why ? why.getBoundingClientRect() : null
    return { cls: e.className, onScreen: b.x >= 0 && b.x + b.width <= innerWidth && b.y >= 0 && b.y + b.height <= innerHeight, row: rowEl.innerText.replace(/\s+/g, ' ').trim().slice(0, 200), why: why ? { text: why.innerText, w: Math.round(wb.width), h: Math.round(wb.height), right: Math.round(wb.right), size: getComputedStyle(why).fontSize } : null } }, [ros, pid])
  await shoot(shotId + '-armed')
  await p.locator(`${ros} .rpuck[data-person="${pid}"]`).first().tap({ timeout: 6000 }); await L.sleep(350)
  const still = await p.evaluate(() => window.armedKey())
  return { note: `armed ${armed}; the crew drawer opened by itself; ${NAME[pid]} there: class "${struck.cls}", on screen ${struck.onScreen}; the reason printed under it: ${JSON.stringify(struck.why)}; still armed after the tap: ${still === key}` }
}
/* ---------- the phone board: tap-arm, tap the placeholder in the crew drawer ---------- */
for (const key of [EP, EW]) for (const pid of ['all', 'allavail'])
  await attempt(`C32-phone-board-${pid}-${key.slice(-1)}`, `phone, board: tap the empty ${key.endsWith('p') ? 'front' : 'rear'} seat of the new line, then tap ${NAME[pid]} in the AIRCREW drawer`, sh => armTapPhone('board', key, pid, sh, `C32-phone-board-${pid}-${key.slice(-1)}`))

/* ---------- a finger's long-press drag from the drawer, and from a legal seat ---------- */
async function touchDrag(src, dst, shotId, { hold = 750, steps = 18 } = {}) {
  const cdp = await p.context().newCDPSession(p)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  if (!a || !b) throw new Error('no box for the finger drag')
  const x1 = a.x + a.width / 2, y1 = a.y + a.height / 2, x2 = b.x + Math.min(b.width / 2, 30), y2 = b.y + b.height / 2
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y1, id: 1 }] })
  await L.sleep(hold)
  const lifted = await p.evaluate(() => ({ body: document.body.className, ghost: !!document.querySelector('.tdghost, .dragimg') }))
  for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / steps, y: y1 + (y2 - y1) * i / steps, id: 1 }] }); await L.sleep(30) }
  await L.sleep(250)
  const over = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const s = e && e.closest('[data-slot]'); return { slot: s ? s.dataset.slot : null, cls: s ? s.className : (e ? e.className : null) } }, [x2, y2])
  await L.shot(p, shotId + '-held')
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await L.sleep(600)
  await cdp.detach().catch(() => {})
  return { lifted, over }
}
/* open the drawer by its own tab, with nothing armed */
async function openDrawer() {
  const inView = () => p.evaluate(() => { const e = document.querySelector('#sbRoster .rpuck[data-person="all"]'); if (!e) return false; const b = e.getBoundingClientRect(); return b.x >= 0 && b.x + b.width <= innerWidth })
  if (await inView()) return 'already open'
  const tab = await p.evaluate(() => { const c = [...document.querySelectorAll('#schedBoard *')].filter(e => e.offsetParent !== null && /^\s*AIRCREW\s*$/.test(e.innerText || '')); const e = c[c.length - 1]; if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, tag: e.tagName + '.' + e.className } })
  if (!tab) return 'no AIRCREW tab'
  await p.touchscreen.tap(tab.x, tab.y); await L.sleep(600)
  return (await inView()) ? 'opened by the AIRCREW tab' : 'the tab did not open it'
}
for (const [key, pid] of [[EP, 'all'], [EP, 'allavail'], [OP, 'all']]) {
  await attempt(`C32-phone-drag-${pid}-${key.replace(/\./g, '')}`, `phone, board: the AIRCREW drawer opened by its tab, a finger held on ${NAME[pid]} and dragged onto the ${key === EP ? 'empty front seat of the new line' : 'OCCUPIED front seat of VL #1'}`, async sh => {
    await shutDrawer('#sbRoster')
    const seat = p.locator(`#schedBoard [data-slot="${key}"]:visible`).first()
    await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
    const dr = (await tabTap()) && (await drawerState('#sbRoster')) ? 'opened by its AIRCREW tab' : 'the tab did not open it'
    const r = await touchDrag(p.locator(`#sbRoster .rpuck[data-person="${pid}"]`).first(), seat, `C32-phone-drag-${pid}-${key.replace(/\./g, '')}`)
    return { note: `drawer: ${dr}; the puck lifted: ${JSON.stringify(r.lifted)}; the finger was over: ${JSON.stringify(r.over)}` }
  })
}

/* ---------- the phone week: its own arm + crew drawer ---------- */
await p.keyboard.press('Escape'); await shutDrawer('#sbRoster'); await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, DI)
for (const key of [EP, EW]) for (const pid of ['all', 'allavail'])
  await attempt(`C32-phone-week-${pid}-${key.slice(-1)}`, `phone, Edit Schedule (the week): tap the empty ${key.endsWith('p') ? 'front' : 'rear'} seat of Tuesday's new line, then tap ${NAME[pid]} in the crew drawer`, async sh => { await W.showDay(p, DI); return armTapPhone('week', key, pid, sh, `C32-phone-week-${pid}-${key.slice(-1)}`) })

/* ---------- a reload ---------- */
await shutDrawer('#eRoster')
await L.reloadCompare(p, 'C32-phone-reload', 'a', { page: 'editsched' })
const sEnd = await C.snap(p, DI, KEYS)
await W.showDay(p, DI); await L.shot(p, 'C32-phone-99-after-reload')
const rr = L.results.filter(r => /C32-phone-reload/.test(r.name))
C.row('C32-phone-reload', 'phone: reload, sign in again, Edit Schedule', `the new line's seats: ${sEnd.seats[EP].val || 'empty'} / ${sEnd.seats[EW].val || 'empty'}; VL #1: ${sEnd.seats[OP].val} / ${sEnd.seats[OW].val}`, rr.map(r => (r.ok ? 'ok ' : 'FAIL ') + r.name.split('— ')[1] + (r.ok ? '' : ' ' + r.detail)).join(' · '), rr.every(r => r.ok) && !KEYS.some(k => ['all', 'allavail'].includes(sEnd.seats[k].val)) ? 'PASS' : 'FAIL', ['C32-phone-99-after-reload.png'])
console.log('ERRORS', JSON.stringify(errors))
C.savePart('doors-phone', { errors })
await browser.close()
