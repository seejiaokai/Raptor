// A MOCK-UP, NOT A BUILD — how an input whose OIL question NOBODY HAS ANSWERED could say so on the Inputs pages.
// Today the only sign of it on a list is the small outlined "OIL?" button at the far right of the DESKTOP Inputs List's
// row (ui/InputsPage.tsx, `.roil.ask`), and only for an input of ONE person. The idea drawn here:
//   (1) the desktop row wears that same button for an input of SEVERAL people too;
//   (2) the input's CARD — the day opened on the Inputs calendar, and the Inputs List on a phone (ui/InputCard.tsx) —
//       gains a small "OIL?" TAG on its top line, where LATE sits: a mark, not a button. The month's bars get nothing.
// HOW: the real built app is driven by real presses — "Range brief" (Training, Sat 18 Jul 2026, 09:00–12:00, "Bring your
// kit") filed for Ranger and Tally, and "Solo drill" (Training, 13:00–15:00) for Ranger alone, the OIL question answered
// Yes at each save (the save does not go through without an answer). THEN, FOR THE MOCK ONLY, the answer is taken off
// the two records directly in the page's data (printed as "answer cleared") so the app is in the state the idea is
// about: on the desktop the one-person row then wears the app's OWN "OIL?" button, and the several-people row nothing.
// A picture is taken AS BUILT, then the proposed marks are injected (class "mockx") and the SAME crop is taken again.
// NOTHING INJECTED IS IN THE APP. The injected looks are read off the app's own elements, never invented:
//   the row's button  an element with the app's own classes `roil ask`, in the row's last cell — the stylesheet draws it;
//   the card's tag    the LATE tag's (`.sd-late`) font, size, weight, spacing, radius and height, with the row button's
//                     own colour and 1px outline instead of LATE's amber fill.
// A third phone session has its clock AFTER the cut-off (10 Jul 26), so the same input is really LATE: one picture of
// LATE and "OIL?" side by side, and one of a six-person input, where the names wrap.
// Phone 390 x 844 (touch) and desktop 1440 x 900, every picture at twice the pixels.
//
//   npm run build && npx vite preview --port 4186 --strictPort          (already running — this script starts nothing)
//   node scripts/handpass/onerule-mock-oilask.mjs [out dir]             (default docs/mock/2026-10-12-oil-ask)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const OUT = process.argv[2] || 'docs/mock/2026-10-12-oil-ask'
const URL = process.env.LOOK_URL || 'http://localhost:4186/'
mkdirSync(OUT, { recursive: true })
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }
const DAY = '2026-07-18'
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
/* the people, by the roster's own hidden ids: Ranger, Tally; and for the six — Sidewinder, Talisman, Trident, Wildcard */
const TEAM = { title: 'Range brief', people: ['bane', 'nick'], from: '09:00', to: '12:00', rmk: 'Bring your kit' }
const SOLO = { title: 'Solo drill', people: ['bane'], from: '13:00', to: '15:00', rmk: '' }
const SIX = { title: 'Range brief', people: ['bane', 'nick', 'mamba', 'haowen', 'harpoon', 'bapster'], from: '13:00', to: '16:00', rmk: 'Bring your kit' }

async function session(tag, size, clock, body) {
  const touch = !!size.isMobile
  const ctx = await browser.newContext(size)
  const page = await ctx.newPage()
  /* the demo week is 13 Jul 26: on the PC's own date every input filed now is LATE; the clock is set before the load */
  await page.clock.setFixedTime(new Date(clock))
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const VW = size.viewport.width, VH = size.viewport.height
  const press = loc => (touch ? loc.tap() : loc.click())
  const say = (step, what) => console.log(`${tag} ${step}: ${typeof what === 'string' ? what : JSON.stringify(what)}`)
  const file = name => join(OUT, name)
  const quiet = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })   // a passing note is not part of the look

  const toMonth = async () => {
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal, #inCalBtn').first().waitFor()
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page.locator('#inCalBtn'))
    await page.locator('#inpCal').waitFor()
    const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
    let d = 2026 * 12 + 6 - await at()
    for (; d > 0; d--) await press(page.locator('#icNext'))
    for (; d < 0; d++) await press(page.locator('#icPrev'))
    await page.waitForSelector(`[data-icday="${DAY}"]`)
  }
  const openDay = async () => {
    if (await page.locator('[data-testid="win-inputsday"]').count()) return
    await page.locator(`[data-icday="${DAY}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]')
    await page.waitForTimeout(350)
  }
  const closeDay = async () => { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await press(x); await page.waitForTimeout(250) } }

  /* FILE ONE by real presses: the Inputs calendar's day, "+ Input", the kind, who (one from the list, or "Several people"
     and their pucks), the hours, the title, the remark, Add — and the OIL question answered Yes */
  const fileIt = async spec => {
    const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
    await toMonth(); await openDay()
    await press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop #inpEditType')
    await page.selectOption('#inpEditPop #inpEditType', 'Training')
    if (spec.people.length > 1) {
      await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
      for (const p of spec.people) { const b = page.locator(`#inpEditPop [data-pp="${p}"]`); if (await b.getAttribute('aria-pressed') !== 'true') await press(b) }
      const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
      for (const id of lit) if (!spec.people.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
    } else await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
    const ad = page.locator('#inpEditPop #inpEditAllday')
    if (await ad.count() && await ad.isChecked()) await press(ad)
    await page.locator('#inpEditPop #inpEditStart').fill(spec.from)
    await page.locator('#inpEditPop #inpEditEnd').fill(spec.to)
    await page.locator('#inpEditPop #inpEditOwnTitle').fill(spec.title)
    await page.locator('#inpEditPop #inpEditRmk').fill(spec.rmk)
    await press(page.locator('#inpEditSave'))
    await page.waitForTimeout(450)
    const asked = []
    for (let k = 0; k < 4; k++) {
      const sheet = page.locator('[data-testid="oilconf"]')
      if (await sheet.count()) {
        const one = sheet.locator('[data-testid="oil-yes"]'), many = sheet.locator('[data-testid="oil-all"]')
        await press((await one.count()) ? one : many)
        await press(sheet.locator('[data-testid="oilconf-save"]'))
        asked.push('the OIL question, answered Yes')
      } else if (await page.locator('[data-testid="docconf"]').count()) { await press(page.locator('[data-testid="docconf-nodoc"]')); asked.push('the document question') }
      else break
      await page.waitForTimeout(350)
    }
    await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 5000 }).catch(async () =>
      say('STILL OPEN', (await page.locator('#inpEditPop, .airpop:not([hidden])').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 400)))
    await page.waitForTimeout(300)
    const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({
      iid: r.iid, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, person: r.person, people: (r.people || []).map(e => (e && e.p) || e), oil: r.oil || null })), had)
    say('filed', { asked, made, note: (await page.locator('#toastEl').innerText().catch(() => '')).replace(/\s+/g, ' ').trim() })
    await closeDay()
    return made.map(r => r.iid)
  }
  /* FOR THE MOCK ONLY: the answer is taken off the record, so the question is one nobody has answered — the state the
     idea is about. A real save cannot leave it so (the question must be answered for the save to go through). */
  const clearOil = async ids => {
    const left = await page.evaluate(ids => window.INPUTS.filter(r => ids.includes(r.iid)).map(r => {
      delete r.oil; (r.people || []).forEach(e => { if (e && typeof e === 'object') delete e.oil })
      return { iid: r.iid, oil: r.oil || null }
    }), ids)
    await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(250)
    say('answer cleared (SET DIRECTLY in the page\'s data, for the mock)', left)
  }

  /* THE PROPOSED MARKS, put on whatever the page has drawn for these inputs. `late` adds a copy of the LATE tag where the
     card has none of its own (only used if the late clock did not make a real one). */
  const unpaint = () => page.evaluate(() => {
    document.querySelectorAll('.mockx').forEach(e => e.remove())
    document.querySelectorAll('[data-mockx-hid]').forEach(e => { e.style.display = ''; e.removeAttribute('data-mockx-hid') })
  })
  const paint = (ids, opt = {}) => page.evaluate(([ids, opt]) => {
    document.querySelectorAll('.mockx').forEach(e => e.remove())
    document.querySelectorAll('[data-mockx-hid]').forEach(e => { e.style.display = ''; e.removeAttribute('data-mockx-hid') })
    const out = { cards: 0, lateCopies: 0, rowsDrawn: 0, rowsOwn: 0, look: null }
    const px = v => parseFloat(v) || 0
    const cards = [...document.querySelectorAll('.icard')].filter(c => ids.includes(c.getAttribute('data-popiid')))
    if (cards.length) {
      /* the LATE tag's look, read off a real one — or off one made of the app's own class for the reading, then removed */
      const corner0 = cards[0].querySelector('.icard-corner')
      let late = document.querySelector('.icard .sd-late'), tmp = null
      if (!late) { tmp = document.createElement('button'); tmp.type = 'button'; tmp.className = 'sd-late'; tmp.textContent = 'LATE'; corner0.prepend(tmp); late = tmp }
      const L = getComputedStyle(late)
      const lateLook = { fontFamily: L.fontFamily, fontSize: L.fontSize, fontWeight: L.fontWeight, letterSpacing: L.letterSpacing, lineHeight: L.lineHeight,
        radius: L.borderTopLeftRadius, padT: L.paddingTop, padL: L.paddingLeft, h: late.getBoundingClientRect().height, fill: L.backgroundColor, ink: L.color }
      if (tmp) tmp.remove()
      /* the row button's colour and outline, read off the app's own classes standing in the card (so the colour it
         inherits is the card's) */
      const holder = document.createElement('span'); holder.className = 'inact'; holder.style.cssText = 'position:absolute;visibility:hidden'
      holder.innerHTML = '<button type="button" class="roil ask">OIL?</button>'
      cards[0].querySelector('.icard-top').appendChild(holder)
      const R = getComputedStyle(holder.firstChild)
      const rowLook = { color: R.color, borderColor: R.borderTopColor, borderWidth: R.borderTopWidth, borderStyle: R.borderTopStyle, fontSize: R.fontSize, radius: R.borderTopLeftRadius }
      holder.remove()
      const bw = px(rowLook.borderWidth) || 1
      let st = document.getElementById('mockx-style'); if (!st) { st = document.createElement('style'); st.id = 'mockx-style'; document.head.appendChild(st) }
      st.textContent = `.mockx.oiltag{display:inline-block;box-sizing:border-box;flex:none;font-family:${lateLook.fontFamily};font-size:${lateLook.fontSize};` +
        `font-weight:${lateLook.fontWeight};letter-spacing:${lateLook.letterSpacing};line-height:${lateLook.lineHeight};` +
        `padding:${px(lateLook.padT) - bw}px ${px(lateLook.padL) - bw}px;border:${bw}px ${rowLook.borderStyle} ${rowLook.borderColor};` +
        `border-radius:${lateLook.radius};color:${rowLook.color};background:none;white-space:nowrap}`
      out.look = { late: lateLook, row: rowLook }
      for (const card of cards) {
        const corner = card.querySelector('.icard-corner'), hrs = corner.querySelector('.icard-hrs')
        if (opt.late && !corner.querySelector('.sd-late')) {
          const l = document.createElement('button'); l.type = 'button'; l.className = 'sd-late mockx'; l.tabIndex = -1; l.textContent = 'LATE'
          corner.insertBefore(l, hrs); out.lateCopies++
        }
        const t = document.createElement('span'); t.className = 'mockx oiltag'; t.textContent = 'OIL?'
        corner.insertBefore(t, hrs); out.cards++
      }
    }
    /* the desktop List's rows: the app's own button, by its own classes, in the row's last cell. A row that already wears
       the app's own "OIL?" is left alone; an answered row's "OIL" chip gives its place to it. */
    for (const tr of document.querySelectorAll('tr[data-iid]')) {
      if (!ids.includes(tr.getAttribute('data-iid'))) continue
      const cell = tr.querySelector('td.inact'); if (!cell) continue
      if (cell.querySelector('.roil.ask')) { out.rowsOwn++; continue }
      const ans = cell.querySelector('.roil'); if (ans) { ans.style.display = 'none'; ans.setAttribute('data-mockx-hid', '') }
      const b = document.createElement('button'); b.type = 'button'; b.className = 'roil ask mockx'; b.tabIndex = -1; b.textContent = 'OIL?'
      cell.appendChild(b); out.rowsDrawn++
    }
    return out
  }, [ids, opt])

  /* what a card or a row says and measures — printed beside every picture, so a look can be checked against numbers */
  const facts = sels => page.evaluate(sels => sels.map(s => {
    const e = document.querySelector(s); if (!e) return { sel: s, missing: true }
    const r = e.getBoundingClientRect(), q = c => e.querySelector(c), box = x => x ? x.getBoundingClientRect() : null
    const o = { text: e.innerText.replace(/\s+/g, ' ').slice(0, 160), w: Math.round(r.width), h: Math.round(r.height) }
    const corner = box(q('.icard-corner')), hrs = box(q('.icard-hrs')), who = box(q('.icard-who')), tag = box(q('.oiltag')), late = box(q('.sd-late')), kind = box(q('.icard-kind'))
    if (corner) Object.assign(o, { cornerW: Math.round(corner.width), cornerInside: corner.right <= r.right + .5 && corner.left >= r.left - .5,
      hoursInside: !!hrs && hrs.right <= r.right + .5, hoursOnFirstLine: !!hrs && !!who && Math.abs((hrs.top + hrs.height / 2) - (who.top + Math.min(who.height, 20) / 2)) < 8,
      nameLines: who ? Math.round(q('.icard-who').getClientRects().length) : 0, kindUnderNames: !!kind && !!who && kind.top > who.top + 10,
      late: late ? { w: Math.round(late.width), h: Math.round(late.height) } : null,
      tag: tag ? { w: Math.round(tag.width * 10) / 10, h: Math.round(tag.height * 10) / 10, sameTopAsLate: late ? Math.abs(tag.top - late.top) < .6 : null, leftOfHours: !!hrs && tag.right <= hrs.left } : null })
    const cell = q('td.inact')
    if (cell) o.lastCell = [...cell.querySelectorAll('button')].filter(b => b.style.display !== 'none').map(b => {
      const c = getComputedStyle(b), br = b.getBoundingClientRect()
      return { text: b.textContent, own: !b.classList.contains('mockx'), color: c.color, border: c.borderTopColor, w: Math.round(br.width), h: Math.round(br.height) } })
    return o
  }), sels)
  const present = async sels => { const out = []; for (const s of sels) if (await page.locator(s).count()) out.push(s); return out }
  const union = async (sels, pad) => {
    const b = await page.evaluate(sels => { const rs = sels.map(s => document.querySelector(s).getBoundingClientRect())
      return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) } }, sels)
    const x = Math.max(0, Math.floor(b.x - pad[3])), y = Math.max(0, Math.floor(b.y - pad[0]))
    return { x, y, width: Math.min(VW, Math.ceil(b.r + pad[1])) - x, height: Math.min(VH, Math.ceil(b.b + pad[2])) - y }
  }
  /* ONE CROP, TWICE: as built, then with the proposed marks. `own` = each picture measures its own crop (a card that
     grows when the mark is added). */
  const pair = async (name, sels, ids, pad, { opt = {}, own = false, names = null } = {}) => {
    await unpaint()
    await page.locator(sels[0]).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(300); await quiet()
    const rect = await union(sels, pad), before = await facts(sels)
    const [a, b] = names || [`${name}-asbuilt.png`, `${name}-proposed.png`]
    await page.screenshot({ path: file(a), clip: rect })
    const drawn = await paint(ids, opt)
    await page.waitForTimeout(120)
    const rect2 = own ? await union(sels, pad) : rect, after = await facts(sels)
    await page.screenshot({ path: file(b), clip: rect2 })
    say(name, { files: [a, b], crop: rect, cropProposed: rect2, drawn, before, after })
    return { rect, rect2 }
  }

  await page.goto(URL + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await body({ page, press, say, file, quiet, toMonth, openDay, closeDay, fileIt, clearOil, paint, unpaint, facts, present, union, pair, touch, VW, VH })
  console.log(tag, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors, page errors or failed requests')
  await ctx.close()
}
const dayCard = id => `[data-testid="win-inputsday"] .icard[data-popiid="${id}"]`
const listCard = id => `.icard[data-iid="${id}"]`
const listRow = id => `tr[data-iid="${id}"]`
const toList = async s => {
  await s.closeDay()
  await s.press(s.page.locator('#inListBtn')); await s.page.waitForTimeout(400)
  if (!(await s.page.locator('#inRangeAll').count())) await s.press(s.page.locator('#inRangeBtn'))
  await s.press(s.page.locator('#inRangeAll')); await s.page.waitForTimeout(450)
}

/* 1, 2 — THE PHONE, on time: the opened day's two cards, then the List's two cards */
await session('phone', PHONE, '2026-06-22T09:00:00', async s => {
  const ids = [...await s.fileIt(TEAM), ...await s.fileIt(SOLO)]
  await s.clearOil(ids)
  await s.toMonth(); await s.openDay()
  const day = await s.present(ids.map(dayCard))
  if (day.length) await s.pair('phone-day', day, ids, [30, 10, 10, 10]); else s.say('phone-day', 'NO CARD FOUND on the opened day')
  await toList(s)
  const list = await s.present(ids.map(listCard))
  if (list.length) await s.pair('phone-list', list, ids, [34, 10, 12, 10]); else s.say('phone-list', 'NO CARD FOUND on the List')
})

/* 3 — THE DESKTOP, on time: the List's two rows (whole, and their right-hand end again, closer) */
await session('desk', DESK, '2026-06-22T09:00:00', async s => {
  const ids = [...await s.fileIt(TEAM), ...await s.fileIt(SOLO)]
  await s.clearOil(ids)
  await s.toMonth(); await toList(s)
  const rows = await s.present(ids.map(listRow))
  if (!rows.length) { s.say('desk-list', 'NO ROW FOUND on the List'); return }
  const { rect } = await s.pair('desk-list', rows, ids, [3, 0, 3, 0])
  /* the same two rows' right-hand end, where the button stands — the whole row is 1440 wide, small on a phone */
  const end = { x: rect.x + rect.width - 620, y: rect.y, width: 620, height: rect.height }
  await s.unpaint(); await s.quiet()
  await s.page.screenshot({ path: s.file('desk-list-asbuilt-end.png'), clip: end })
  await s.paint(ids); await s.page.waitForTimeout(120)
  await s.page.screenshot({ path: s.file('desk-list-proposed-end.png'), clip: end })
  s.say('desk-list end', { files: ['desk-list-asbuilt-end.png', 'desk-list-proposed-end.png'], crop: end })
})

/* 4 — THE PHONE, AFTER THE CUT-OFF (the clock at 10 Jul 26): the same input is really LATE — LATE and "OIL?" side by side;
   and a six-person input, where the names wrap */
await session('phone-late', PHONE, '2026-07-10T09:00:00', async s => {
  const team = await s.fileIt(TEAM), six = await s.fileIt(SIX)
  await s.clearOil([...team, ...six])
  await s.toMonth(); await s.openDay()
  const reallyLate = await s.page.locator(team.map(dayCard).join(',')).first().locator('.sd-late').count()
  s.say('late', reallyLate ? 'the card wears the app\'s OWN LATE tag (the clock is after the cut-off)' : 'NO LATE TAG of its own — a copy of the LATE tag is drawn beside the mark')
  const opt = { late: !reallyLate }
  const a = await s.present(team.map(dayCard)), b = await s.present(six.map(dayCard))
  if (a.length) await s.pair('phone-day-late', a, [...team, ...six], [3, 10, 3, 10], { opt, own: true, names: ['phone-day-asbuilt-late.png', 'phone-day-proposed-late.png'] })
  if (b.length) await s.pair('phone-day-longnames', b, [...team, ...six], [3, 10, 3, 10], { opt, own: true, names: ['phone-day-asbuilt-longnames.png', 'phone-day-proposed-longnames.png'] })
})

await browser.close()
