// [ASK-AT-THE-CONTROL] (D1626) — the Inputs window's questions, roll-call #1–#6 and #21, drawn TODAY and as the card hanging
// from the control pressed, at a desktop's and his iPhone's size, on the frozen build.
//   cd raptor-port && WALK_DIR=<frozen dist> ISR_OUT=docs/img/handpass/2026-11-04-ask-at-the-control/inputs-a LOOK_URL=http://localhost:4397/ node scripts/handpass/ask-at-inputs-a.mjs [n …]
// #1 the approved card itself (reference, no proposal) · #2 open the other input over unsaved work (the control: the
// other input's bar or card) · #3 Delete for everyone · #4 Take me out (signed in as Ranger) · #5 the Delete key on an
// opened day's card (no control: the card hangs from the card itself) · #6 a field changed both ways (raised by a drag —
// outside the ruling, today only, desktop) · #21 the holiday import's preview (raised by Import and the file picked).
// The lib's hangInPage is used through a variant made from its own source: today's box is taken out of the flow
// (display:none, not visibility:hidden — the card does not hold its old room open) and, where asked, the card is put on
// the page's body, so a control in a window behind another window still shows its card in front.
import * as L from './isr-A-lib.mjs'
import { CARD_CSS, hangInPage } from './ask-at-lib.mjs'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const { tid, note, check } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ONLY = process.argv.slice(2).map(Number)
const want = n => !ONLY.length || ONLY.includes(n)
const MPATH = join(L.OUT, '..', 'manifest.json')
if (!ONLY.length) L.clean()
const MAN = ONLY.length && existsSync(MPATH) ? JSON.parse(readFileSync(MPATH, 'utf8')).filter(x => !ONLY.includes(x.n)) : []
const man = o => { MAN.push(o); MAN.sort((a, b) => a.n - b.n); mkdirSync(L.OUT, { recursive: true }); writeFileSync(MPATH, JSON.stringify(MAN, null, 2)) }

const SRC = hangInPage.toString()
const hangSrc = (body) => {
  let s = SRC.replace("h.style.setProperty('visibility', 'hidden', 'important')", "h.style.setProperty('display', 'none', 'important')")
  if (body) s = s.replace(/const home = [^\n]*\n/, 'const home = document.body\n')
  return s
}
const hang = (page, ctl, spec, body = false) => page.evaluate(`(${hangSrc(body)})(${JSON.stringify([ctl, spec])})`)
const ring = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (e) e.classList.add('aq-ring'); return !!e }, sel)
const unring = page => page.evaluate(() => document.querySelectorAll('.aq-ring').forEach(e => e.classList.remove('aq-ring')))
/* a desktop clip: the union of the parts named, padded, with room above and below the control for a card, inside the screen */
const clipOf = (page, sels, ctl, room = 170) => page.evaluate(([sels, ctl, room]) => {
  const vis = s => [...document.querySelectorAll(s)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  let l = 1e9, t = 1e9, r = -1e9, b = -1e9
  const add = (x) => { l = Math.min(l, x.left); t = Math.min(t, x.top); r = Math.max(r, x.right); b = Math.max(b, x.bottom) }
  for (const s of sels) { const e = vis(s); if (e) add(e.getBoundingClientRect()) }
  const c = ctl && vis(ctl); if (c) { const x = c.getBoundingClientRect(); add({ left: x.left - 160, right: x.right + 160, top: x.top - room, bottom: x.bottom + room }) }
  const P = 40; l = Math.max(0, l - P); t = Math.max(0, t - P); r = Math.min(innerWidth, r + P); b = Math.min(innerHeight, b + P)
  return { x: Math.round(l), y: Math.round(t), width: Math.round(r - l), height: Math.round(b - t) }
}, [sels, ctl, room])
const grow = (page, clip) => page.evaluate(clip => { const c = document.querySelector('.aq-card'); if (!c) return clip; const x = c.getBoundingClientRect(); const l = Math.max(0, Math.min(clip.x, x.left - 20)), t = Math.max(0, Math.min(clip.y, x.top - 20)), r = Math.min(innerWidth, Math.max(clip.x + clip.width, x.right + 20)), b = Math.min(innerHeight, Math.max(clip.y + clip.height, x.bottom + 20)); return { x: Math.round(l), y: Math.round(t), width: Math.round(r - l), height: Math.round(b - t) } }, clip)
const still = async (page, tap) => { await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()); if (!tap) await page.mouse.move(5, 5); await sleep(120) }
async function pic(page, size, n, kind, clip) {
  const f = `${String(n).padStart(2, '0')}-${size}-${kind}.png`
  await page.screenshot(size === 'desktop' && clip ? { path: join(L.OUT, f), clip } : { path: join(L.OUT, f) })
  return 'A/' + f
}
const setVal = (page, sel, v) => page.evaluate(([sel, v]) => { const r = document.querySelector(sel); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(r, v); r.dispatchEvent(new Event('input', { bubbles: true })) }, [sel, v])
const text = (page, sel) => L.text(page, sel)
async function start(size, user = 'ad') { const s = await L.session(size, user); await s.page.addStyleTag({ content: CARD_CSS }); return s }
const WIN = '[data-testid="win-inputedit"]'
const DAYWIN = '[data-testid="win-inputsday"]'

// ---------------------------------------------------------------- #1 the approved card (reference)
if (want(1)) {
  const e = { n: 1, area: 'Inputs', screen: 'an input’s window (Inputs page)', control: 'the window’s ✕ (and Escape)', proposal: 'none — already at the control', pics: { today: {} }, newWords: [], notes: 'the approved card (D1626, design C), built and live; drawn here as the reference every other card copies' }
  for (const size of ['desktop', 'phone']) {
    const { page, tap } = await start(size)
    const men = await L.freeMen(page, 1, [2])
    const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
    await L.press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
    await setVal(page, '#inpEditPop #inpEditRmk', 'flights changed, back at 10:30')
    await L.press(page, tap, '[data-testid="win-inputedit-x"]'); await sleep(300)
    await still(page, tap)
    const ok = await page.locator('[data-testid="inped-escask"]').count()
    check(1, `${size}: the ✕ question is up`, ok === 1, ok)
    e.question = await text(page, '.inped-xask-q'); e.answers = ['Discard and close', 'Keep editing']
    e.today = 'a card hanging from the ✕, over the top of the form'
    await ring(page, '[data-testid="win-inputedit-x"]')
    e.pics.today[size] = await pic(page, size, 1, 'today', await clipOf(page, [WIN], '[data-testid="win-inputedit-x"]', 0))
    await page.context().close()
  }
  man(e)
}

// ---------------------------------------------------------------- #2 open the other input over unsaved work
if (want(2)) {
  const e = { n: 2, area: 'Inputs', screen: 'an input’s window, with another input pressed on the page behind it', control: 'the other input — its bar on the Inputs calendar (desktop), its card in the opened day (phone)', proposal: 'card', pics: { today: {}, card: {} }, measures: {}, newWords: [], notes: '' }
  for (const size of ['desktop', 'phone']) {
    const { page, tap } = await start(size)
    const men = await L.freeMen(page, 2, [2])
    const a = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: [men[0]], from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
    await L.press(page, tap, '[data-testid="win-inputsday-x"]').catch(() => {})
    const b = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: [men[1]], from: '11:00', to: '12:00', title: 'Sim brief', remarks: 'second card' }, true)
    await L.press(page, tap, `[data-testid="idy-row-${a}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
    await setVal(page, '#inpEditPop #inpEditRmk', 'typed, not saved')
    let ctl
    if (!tap) {
      ctl = `#inpCal [data-iid="${b}"]`
      await page.locator(ctl).first().click(); await sleep(350)
    } else {
      /* the phone: the day's window is brought forward by its bar (as a person would), then the other card is tapped */
      const bar = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); for (const y of [r.top + 10, r.top + 20, r.top + 30]) for (const x of [r.left + 70, r.left + 120, r.left + 30, r.left + 5, r.right - 5]) { const h = document.elementFromPoint(x, y); if (h && e.contains(h) && !h.closest('.win-x, .win-tools')) return { x, y } } return null }, `${DAYWIN} .win-bar`)
      if (bar) { await page.touchscreen.tap(bar.x, bar.y); await sleep(350) }
      ctl = `${DAYWIN} [data-testid="idy-row-${b}"] [data-testid="idy-open"]`
      const pt = await page.evaluate(sel => { const o = document.querySelector(sel); if (!o) return null; const r = o.getBoundingClientRect(); for (const y of [r.top + 5, r.top + r.height / 2, r.bottom - 5]) { const x = r.left + r.width / 3, h = document.elementFromPoint(x, y); if (h && o.contains(h)) return { x, y } } return null }, ctl)
      e.notes += `phone: day window brought forward by its bar: ${!!bar}; the other card reachable: ${!!pt}. `
      if (pt) { await page.touchscreen.tap(pt.x, pt.y); await sleep(400) }
      ctl = `${DAYWIN} [data-testid="idy-row-${b}"]`   // the whole card tapped is the control ringed and hung from
    }
    const up = await page.locator('[data-testid="inped-swap"]').count()
    check(2, `${size}: the swap question is up`, up === 1, up)
    if (!up) { note(2, `${size}: not pictured — the question did not come up`); await page.context().close(); continue }
    await still(page, tap)
    e.question = await text(page, '[data-testid="inped-swap"] .inped-ask-q'); e.answers = ['Discard and open', 'Keep editing']
    e.today = 'a box across the top of the input window’s body, above the form — away from the bar or card pressed'
    const front = await page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]'); return /\bfront\b/.test(w.className) })
    e.notes += `${size}: input window in front after the press: ${front}. `
    await ring(page, ctl)
    const clip = await clipOf(page, [WIN, '[data-testid="inped-swap"]'], ctl)
    e.pics.today[size] = await pic(page, size, 2, 'today', clip)
    await unring(page)
    /* the phone: the day pressed stays in front while its card is up (a design call — today the input's window comes to the front and covers the card tapped) */
    if (tap) await page.evaluate(() => { document.querySelector('[data-testid="win-inputsday"]').style.zIndex = '412' })
    const m = await hang(page, ctl, { q: '[data-testid="inped-swap"] .inped-ask-q', btns: ['[data-testid="inped-swap-go"]', '[data-testid="inped-swap-stay"]'], hide: '[data-testid="inped-swap"]', safe: 'Keep editing' }, true)
    await still(page, tap)
    e.measures[size] = m; note(2, `${size}: ${JSON.stringify(m)}`)
    check(2, `${size}: the card is on screen, its answers' words inside them`, m.onScreen && m.btns.every(x => x.fits), m)
    e.pics.card[size] = await pic(page, size, 2, 'card', await grow(page, clip))
    await page.context().close()
  }
  man(e)
}

// ---------------------------------------------------------------- #3 Delete for everyone
if (want(3)) {
  const e = { n: 3, area: 'Inputs', screen: 'an input’s window (an input for several people)', control: 'Delete, at the window’s foot', proposal: 'card', pics: { today: {}, card: {} }, measures: {}, newWords: [], notes: '' }
  for (const size of ['desktop', 'phone']) {
    const { page, tap } = await start(size)
    const men = await L.freeMen(page, 3, [2])
    const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
    await L.press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
    await L.press(page, tap, '#inpEditDel'); await sleep(300)
    const up = await page.locator('[data-testid="inped-delall"]').count()
    check(3, `${size}: the question is up`, up === 1, up)
    await still(page, tap)
    e.question = await text(page, '[data-testid="inped-delall"] .inped-ask-q'); e.answers = ['Delete', 'Keep']
    e.today = 'a box in the form’s flow just above the window’s foot, scrolled into view'
    await ring(page, '#inpEditDel')
    const clip = await clipOf(page, [WIN], '#inpEditDel', 0)
    e.pics.today[size] = await pic(page, size, 3, 'today', clip)
    await unring(page)
    const m = await hang(page, '#inpEditDel', { q: '[data-testid="inped-delall"] .inped-ask-q', btns: ['[data-testid="inped-delall-yes"]', '[data-testid="inped-delall-no"]'], hide: '[data-testid="inped-delall"]', safe: 'Keep' })
    await still(page, tap)
    e.measures[size] = m; note(3, `${size}: ${JSON.stringify(m)}`)
    check(3, `${size}: the card is on screen, its answers' words inside them`, m.onScreen && m.btns.every(x => x.fits), m)
    e.pics.card[size] = await pic(page, size, 3, 'card', await grow(page, clip))
    await page.context().close()
  }
  man(e)
}

// ---------------------------------------------------------------- #4 Take me out (Ranger, in an input Saber filed)
if (want(4)) {
  const e = { n: 4, area: 'Inputs', screen: 'an input’s window, opened by a member who is in it but did not file it', control: 'Take me out, at the window’s foot', proposal: 'card', pics: { today: {}, card: {} }, measures: {}, newWords: [], notes: '' }
  for (const size of ['desktop', 'phone']) {
    const { page, tap } = await start(size, 'ad')
    const ranger = await page.evaluate(() => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === 'Ranger'))
    const other = (await L.freeMen(page, 3, [2])).filter(x => x !== ranger).slice(0, 2)
    const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: [ranger, ...other], from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' })
    /* signed out, and in again as Ranger: the saved data stays in this browser */
    await page.evaluate(() => document.getElementById('logout').click()); await page.waitForSelector('#luser')
    await page.fill('#luser', 'us'); await page.fill('#lpass', 'us'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(400)
    await page.addStyleTag({ content: CARD_CSS })
    await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, '2026-07-15')
    await L.press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
    const has = await page.locator('[data-testid="inped-takeout"]').count()
    check(4, `${size}: Ranger sees Take me out`, has === 1, { has, iid, ranger })
    if (!has) { note(4, `${size}: not pictured — no Take me out`); await page.context().close(); continue }
    /* the button goes away while its question stands (`mineRow && !takeOut`): a copy is kept to put back for the card */
    await page.evaluate(() => { window.__aqTake = document.querySelector('[data-testid="inped-takeout"]').cloneNode(true) })
    await L.press(page, tap, '[data-testid="inped-takeout"]'); await sleep(300)
    const up = await page.locator('[data-testid="inped-takeout-ask"]').count()
    check(4, `${size}: the question is up`, up === 1, up)
    await still(page, tap)
    e.question = await text(page, '[data-testid="inped-takeout-ask"] .inped-ask-q'); e.answers = ['Take me out', 'Stay in']
    e.today = 'a box in the form’s flow just above the window’s foot; the Take me out button itself disappears while it stands'
    const clip = await clipOf(page, [WIN], '[data-testid="inped-takeout-ask"]', 0)
    e.pics.today[size] = await pic(page, size, 4, 'today', clip)
    await page.evaluate(() => { const f = document.querySelector('[data-testid="win-inputedit"] .airpop-foot'); const c = window.__aqTake; c.setAttribute('data-testid', 'aq-takeout'); const del = f.querySelector('#inpEditDel'); if (del) del.after(c); else f.prepend(c) })
    const m = await hang(page, '[data-testid="aq-takeout"]', { q: '[data-testid="inped-takeout-ask"] .inped-ask-q', btns: ['[data-testid="inped-takeout-yes"]', '[data-testid="inped-takeout-no"]'], hide: '[data-testid="inped-takeout-ask"]', safe: 'Stay in' })
    await still(page, tap)
    e.measures[size] = m; note(4, `${size}: ${JSON.stringify(m)}`)
    check(4, `${size}: the card is on screen, its answers' words inside them`, m.onScreen && m.btns.every(x => x.fits), m)
    e.pics.card[size] = await pic(page, size, 4, 'card', await grow(page, clip))
    e.notes = 'In the card picture the Take me out button stays where it was, so the card has something to hang from — today it disappears while its question stands; the build would keep it.'
    await page.context().close()
  }
  man(e)
}

// ---------------------------------------------------------------- #5 the Delete key on an opened day's card
if (want(5)) {
  const e = { n: 5, area: 'Inputs', screen: 'a day opened on the Inputs calendar', control: 'no control — the Delete (or Backspace) key on a card that has the keyboard’s focus; the card hangs from the card itself', proposal: 'card', pics: { today: {}, card: {} }, measures: {}, newWords: [], notes: 'Raised by a key, not a control: D1626’s reading says a key hangs from the control that does the same thing; a card in the opened day has no Delete button of its own, so the card hangs from the card the key acted on. On a phone this needs a keyboard.' }
  for (const size of ['desktop', 'phone']) {
    const { page, tap } = await start(size)
    const men = await L.freeMen(page, 2, [2])
    const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
    const card = `${DAYWIN} [data-testid="idy-row-${iid}"]`
    await page.locator(`${card} [data-testid="idy-open"]`).focus(); await page.keyboard.press('Delete'); await sleep(300)
    const up = await page.locator('[data-testid="idy-ask"]').count()
    check(5, `${size}: the question is up`, up === 1, up)
    if (!up) { await page.context().close(); continue }
    await still(page, tap)
    e.question = await text(page, '[data-testid="idy-ask"] .idy-ask-q'); e.answers = [await text(page, '[data-testid="idy-del-yes"]'), await text(page, '[data-testid="idy-del-no"]')]
    e.today = 'a row inside the card itself, under its facts'
    await ring(page, card)
    const clip = await clipOf(page, [DAYWIN], card, 0)
    e.pics.today[size] = await pic(page, size, 5, 'today', clip)
    await unring(page)
    const m = await hang(page, card, { q: '[data-testid="idy-ask"] .idy-ask-q', btns: ['[data-testid="idy-del-yes"]', '[data-testid="idy-del-no"]'], hide: '[data-testid="idy-ask"]', safe: 'Keep' })
    await still(page, tap)
    e.measures[size] = m; note(5, `${size}: ${JSON.stringify(m)}`)
    check(5, `${size}: the card is on screen, its answers' words inside them`, m.onScreen && m.btns.every(x => x.fits), m)
    e.pics.card[size] = await pic(page, size, 5, 'card', await grow(page, clip))
    await page.context().close()
  }
  man(e)
}

// ---------------------------------------------------------------- #6 a field changed both ways (raised by a drag)
if (want(6)) {
  const e = { n: 6, area: 'Inputs', screen: 'an input’s window, after its bar was dragged on the calendar behind it', control: 'none — raised by a drag on the page behind, not a press', proposal: 'none — not a press', pics: { today: {} }, newWords: [], notes: 'phone not pictured: raised by dragging a bar on the month, which the phone does not offer beside an open window; the desktop picture shows how it is drawn' }
  const size = 'desktop'
  const { page, tap } = await start(size)
  const men = await L.freeMen(page, 1, [2])
  const iid = await L.fileOn(page, tap, '2026-07-21', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'clash me' })
  await page.locator(`#inpCal [data-iid="${iid}"]`).first().click(); await tid(page, 'win-inputedit').waitFor()
  await page.locator('#inpEdCal [data-iso="2026-07-22"]').click().catch(() => {}); await sleep(200)
  const a = await page.evaluate(iid => { const e = document.querySelector(`#inpCal [data-iid="${iid}"]`); const r = e.getBoundingClientRect(); return { x: r.left + 12, y: r.top + r.height / 2 } }, iid)
  const at = s => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, s)
  const from = await at('#inpCal [data-icday="2026-07-21"]'), to = await at('#inpCal [data-icday="2026-07-28"]')
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + 6, a.y + 3, { steps: 3 }); await page.mouse.move(a.x + (to.x - from.x), a.y + (to.y - from.y), { steps: 12 }); await page.mouse.up(); await sleep(500)
  const up = await page.locator('[data-testid="inped-clash"]').count()
  check(6, 'desktop: the both-ways panel is up', up === 1, up)
  if (up) {
    await still(page, tap)
    e.question = await text(page, '[data-testid="inped-clash"]'); e.answers = ['Keep mine', 'Take theirs']
    e.today = 'a block at the top of the window’s body'
    await page.evaluate(() => { document.querySelector('[data-testid="inped-clash"]').scrollIntoView({ block: 'nearest' }); const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' }); await sleep(150)
    e.pics.today.desktop = await pic(page, size, 6, 'today', await clipOf(page, [WIN, `#inpCal [data-iid="${iid}"]`], null))
  } else e.notes += ' — desktop: the panel did not come up; not pictured'
  await page.context().close()
  man(e)
}

// ---------------------------------------------------------------- #21 the holiday import's preview
if (want(21)) {
  const e = { n: 21, area: 'Inputs / Calendar window', screen: 'the Calendar window’s Holidays part (opened from the Leave War’s ⚙ → Days)', control: 'Import (a file picked)', pics: { today: {}, card: {} }, measures: {}, newWords: [], notes: '' }
  const bom = Buffer.from([0xEF, 0xBB, 0xBF])
  const buf = Buffer.concat([bom, Buffer.from(['From,To,Name,Kind,On grid', '2026-10-09,,Test Nine,PH,', '2026-10-13,,Test Thirteen,PH,', '2026-10-14,,Test Fourteen,PH,'].join('\r\n') + '\r\n', 'utf8')])
  const q = t => `[data-testid="${t}"]`
  for (const size of ['desktop', 'phone']) {
    const { page, tap } = await start(size)
    await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(q('row-slipway')); await sleep(800)
    await L.press(page, tap, q('settings-open')); await page.waitForSelector(q('settings-sheet')); await sleep(300)
    await L.press(page, tap, q('settings-days')); await sleep(900)
    await L.press(page, tap, q('days-tab-holidays')); await sleep(500)
    await page.waitForSelector(q('days-part-holidays'))
    await page.evaluate(() => document.querySelector('[data-testid="days-part-holidays"]')?.scrollIntoView({ block: 'start' })); await sleep(200)
    /* before: where Import stands, ringed — the preview takes its place once a file is picked */
    e.pics.before = e.pics.before || {}
    await ring(page, q('hol-import'))
    e.measures[size + '-import'] = await page.evaluate(() => { const x = document.querySelector('[data-testid="hol-import"]').getBoundingClientRect(); return { t: Math.round(x.top), b: Math.round(x.bottom), l: Math.round(x.left), r: Math.round(x.right) } })
    e.pics.before[size] = await pic(page, size, 21, 'before', await clipOf(page, [q('win-days')], null))
    await unring(page)
    await page.setInputFiles(q('hol-import-file'), { name: 'holidays-2026.csv', mimeType: 'text/csv', buffer: buf }); await sleep(500)
    const up = await page.locator(q('hol-preview')).count()
    check(21, `${size}: the preview is up`, up === 1, up)
    if (!up) { await page.context().close(); continue }
    await still(page, tap)
    e.question = await text(page, q('hol-pv-counts')); e.answers = ['Cancel', await text(page, q('hol-pv-add'))]
    const geo = await page.evaluate(() => { const r = s => { const e = document.querySelector(s); const x = e && e.getBoundingClientRect(); return x && { t: Math.round(x.top), b: Math.round(x.bottom), l: Math.round(x.left), r: Math.round(x.right) } }; return { imp: r('[data-testid="hol-import"]'), pv: r('[data-testid="hol-preview"]'), foot: r('.hol-pvfoot') } })
    e.measures[size] = { today: geo }; note(21, `${size}: ${JSON.stringify(geo)}`)
    const clip = await clipOf(page, [q('win-days')], null)
    e.pics.today[size] = await pic(page, size, 21, 'today', clip)
    await page.context().close()
  }
  e.today = 'the preview takes the place of the year’s list AND of the file row that holds Import (Import is gone while it stands), in the Holidays tab of the Calendar window'
  e.proposal = 'none (recommended) — not a question at a control: the system’s file picker stands between the press and the preview, and the preview is the list it would change, drawn in that list’s place'
  man(e)
}

await L.finish('inputs-a')
