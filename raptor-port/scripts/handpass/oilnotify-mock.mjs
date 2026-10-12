// A MOCK-UP, NOT A BUILD — [OIL-ASK-NOTIFY] (owner D780, D781, D782 — 12 Oct 26): the pictures he asked to see before
// anything is built. Three things, each on the app's REAL screens, a phone and a desktop:
//   (1) THE SWAP whose OIL question is not answered — "it's hard to see a swap back as the pucks looks pretty similar";
//   (2) THE ONE LIST an admin answers a day's open OIL questions from, with "Yes to all" / "No to all";
//   (3) THE HOLIDAY'S NOTICE — a day made a holiday after inputs already stand on it: the admin is told at once, the
//       schedulers by ONE line on their bell.
// HOW: the real built app is driven to the real state, a picture is taken, and only THEN the proposed words and marks
// are put on it (class "mockx"). NOTHING INJECTED IS IN THE APP. Everything injected is drawn by the app's own
// stylesheet, from the app's own classes: the OIL question's own sheet, the landing flash (`lift-land`), the staying bar
// ("Set as default" — `secdef-snack`), the outline a just-added row wears (`sb-fresh`), the bell's own lines
// (`bl-line`), the input's own card (`icard`), the windows shell. What is REAL and what is DRAWN is printed beside
// every picture.
//   THE SWAP — Sat 18 Jul 26, the Scheduler Board. "Range brief" (Training, 09:00–12:00) is filed for Ranger by real
//   presses, its OIL question answered Yes; "Hangar open day" (13:00–15:00) is a plain programme row typed on the board,
//   Tally put on it (through the developer's bridge — a setup step, not what is pictured). Tally's puck is then DRAGGED
//   with the mouse onto Ranger's: the app swaps them and asks the OIL question again, as built today. Cancel and then
//   Undo (both real presses) give the state "not answered" ends in: both pucks where they were.
//   THE HOLIDAY — Fri 17 Jul 26, a working day: three inputs filed on it by real presses (no OIL question — a weekday),
//   then the day is made a public holiday through Inputs ⚙ → Calendar… → Holidays → + Add. The app then holds inputs
//   whose OIL question nobody has answered — these three and the demo's own overseas duty: that state is REAL, and the
//   day's window wears the app's own "OIL?" tags (D777).
// Phone 390 x 844 (touch) and desktop 1440 x 900, every picture at twice the pixels.
//
//   npm run build && npx vite preview --port 4180 --strictPort          (already running — this script starts nothing)
//   node scripts/handpass/oilnotify-mock.mjs [out dir] [swap|hol|all]   (default docs/mock/2026-10-12-oil-notify, all)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const OUT = process.argv[2] || 'docs/mock/2026-10-12-oil-notify'
const PART = process.argv[3] || 'all'
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const DPR = +(process.env.HP_DPR || 2)
mkdirSync(OUT, { recursive: true })
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true }
const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: DPR }
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const SAT = '2026-07-18', SAT_DI = 5, FRI = '2026-07-17'

async function session(tag, size, body) {
  const touch = !!size.isMobile
  const ctx = await browser.newContext(size)
  const page = await ctx.newPage()
  /* the demo week is 13 Jul 26; the clock stands three weeks before it, so nothing filed here reads LATE */
  await page.clock.setFixedTime(new Date('2026-06-22T09:00:00'))
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const VW = size.viewport.width, VH = size.viewport.height
  const press = loc => (touch ? loc.tap() : loc.click())
  const say = (step, what) => console.log(`${tag} ${step}: ${typeof what === 'string' ? what : JSON.stringify(what)}`)
  const file = name => join(OUT, `${tag}-${name}.png`)
  const hush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  const unhush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  const shot = async (name, clip) => { await page.screenshot({ path: file(name), ...(clip ? { clip } : {}) }); say('picture', `${tag}-${name}.png`) }
  const unpaint = () => page.evaluate(() => {
    document.querySelectorAll('.mockx').forEach(e => e.remove())
    document.querySelectorAll('[data-mockx-was]').forEach(e => { e.textContent = e.getAttribute('data-mockx-was'); e.removeAttribute('data-mockx-was') })
    document.querySelectorAll('[data-mockx-hid]').forEach(e => { e.style.display = ''; e.removeAttribute('data-mockx-hid') })
    document.querySelectorAll('.mockx-flash').forEach(e => e.classList.remove('lift-land', 'mockx-flash'))
    document.querySelectorAll('.mockx-ring').forEach(e => e.classList.remove('sb-fresh', 'mockx-ring'))
    document.querySelectorAll('[data-mockx-ttl]').forEach(e => { e.firstChild.nodeValue = e.getAttribute('data-mockx-ttl'); e.removeAttribute('data-mockx-ttl') })
    document.querySelectorAll('[data-mockx-by]').forEach(e => { e.style.marginLeft = ''; e.removeAttribute('data-mockx-by') })
    document.querySelectorAll('[data-mockx-style]').forEach(e => { e.setAttribute('style', e.getAttribute('data-mockx-style')); e.removeAttribute('data-mockx-style') })
  })

  const toMonth = async () => {
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal, #inCalBtn').first().waitFor()
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page.locator('#inCalBtn'))
    await page.locator('#inpCal').waitFor()
    const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
    let d = 2026 * 12 + 6 - await at()
    for (; d > 0; d--) await press(page.locator('#icNext'))
    for (; d < 0; d++) await press(page.locator('#icPrev'))
    await page.waitForSelector(`[data-icday="${SAT}"]`)
  }
  const openDay = async iso => {
    if (await page.locator('[data-testid="win-inputsday"]').count()) return
    await page.locator(`[data-icday="${iso}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]')
    await page.waitForTimeout(350)
  }
  const closeDay = async () => { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await press(x); await page.waitForTimeout(250) } }

  /* FILE ONE by real presses: the Inputs calendar's day, "+ Input", the kind, who, the hours, the title, Add — and the
     OIL question answered Yes where the day asks it */
  const fileIt = async (iso, spec) => {
    const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
    await toMonth(); await openDay(iso)
    await press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop #inpEditType')
    await page.selectOption('#inpEditPop #inpEditType', spec.type)
    if (spec.people.length > 1) {
      await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
      for (const p of spec.people) { const b = page.locator(`#inpEditPop [data-pp="${p}"]`); if (await b.getAttribute('aria-pressed') !== 'true') await press(b) }
      const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
      for (const id of lit) if (!spec.people.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
    } else await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
    const ad = page.locator('#inpEditPop #inpEditAllday')
    if (spec.from) {
      if (await ad.count() && await ad.isChecked()) await press(ad)
      await page.locator('#inpEditPop #inpEditStart').fill(spec.from)
      await page.locator('#inpEditPop #inpEditEnd').fill(spec.to)
    } else if (await ad.count() && !(await ad.isChecked())) await press(ad)
    if (spec.title) await page.locator('#inpEditPop #inpEditOwnTitle').fill(spec.title)
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
      iid: r.iid, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, people: (r.people || []).map(e => (e && e.p) || e), oil: r.oil || null })), had)
    say('filed', { asked, made })
    await closeDay()
    return made.map(r => r.iid)
  }

  await page.goto(URL + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} .mockx-flash.lift-land::after{animation-play-state:paused !important}' })
  await body({ page, press, say, file, shot, hush, unhush, unpaint, toMonth, openDay, closeDay, fileIt, touch, VW, VH, tag })
  console.log(tag, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors, page errors or failed requests')
  await ctx.close()
}

/* ------------------------------------------------------------------------------------------------------------------
   (1) THE SWAP
   ------------------------------------------------------------------------------------------------------------------ */
const RANGE = { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' }
const groundNow = page => page.evaluate(di => (window.DAYS[di].ground || []).map(r => {
  const cs = x => (window.PEOPLE[x] && window.PEOPLE[x].cs) || x || ''
  return `${r.prog || '(blank)'}: ${cs(r.who)}${(r.more || []).map(m => ' + ' + cs(m)).join('')}`
}), SAT_DI)

async function swap(s) {
  const { page, press, say, shot, hush, unhush, unpaint, touch, VW, VH } = s
  await s.fileIt(SAT, RANGE)
  /* Saturday's board, by the scheduler's own door: the date in the day's heading on Edit Schedule */
  await page.evaluate(() => window.go('editsched'))
  await page.waitForTimeout(500)
  await page.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
  await page.waitForTimeout(400)
  /* a plain programme row, typed on the board: "+ Item", its name and hours — then Tally put on it (SETUP: through the
     developer's bridge; the row and the puck that result are the app's own) */
  await page.locator(`#sbBoard [data-gradd="${SAT_DI}"]`).evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
  await page.waitForTimeout(300)
  const type = async (fld, v) => { const b = page.locator(`#sbBoard [data-bfld="${fld}"]`); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.fill(v); await b.blur(); await page.waitForTimeout(200) }
  await type(`gr:${SAT_DI}.1.prog`, 'Hangar open day')
  await type(`gr:${SAT_DI}.1.str`, '13:00')
  await type(`gr:${SAT_DI}.1.end`, '15:00')
  say('SETUP — Tally put on the plain row through the bridge', await page.evaluate(di => { const ok = window.fillSlot(`g:${di}.1.+`, 'nick'); window.afterSchedMutate(); return ok }, SAT_DI))
  await page.waitForTimeout(400)
  /* the blue outline a just-added row wears for a moment is not part of the look */
  await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-fresh').forEach(e => e.classList.remove('sb-fresh')))
  say('the programme before', await groundNow(page))

  const rowSel = i => `#sbBoard [data-move="mv:g.${SAT_DI}.${i}"]`
  const puckSel = i => `#sbBoard [data-slot="g:${SAT_DI}.${i}"] .puck`
  /* the frame: the Ground Programme's panel and what is under it, down to the foot of the screen (where a note shows);
     on the phone the whole screen */
  const frame = async () => {
    await page.locator(rowSel(0)).evaluate((e, top) => {
      const sec = e.closest('.sb-sec'); sec.scrollIntoView({ block: 'start' })
      let sc = sec.parentElement; while (sc && sc.scrollHeight <= sc.clientHeight + 1) sc = sc.parentElement
      if (sc) sc.scrollTop -= top
    }, touch ? 76 : 260)
    await page.waitForTimeout(250)
  }
  const panelClip = async () => {
    if (touch) return null
    const b = await page.locator(rowSel(0)).evaluate(e => { const r = e.closest('.sb-sec').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })
    const y = Math.max(0, Math.floor(b.y - 10))
    return { x: Math.max(0, Math.floor(b.x - 10)), y, width: Math.min(VW, Math.ceil(b.w + 20)), height: VH - y }
  }
  /* the question's frame on a desktop: the two windows it stands in, with a margin (the whole screen on the phone) */
  const sheetClip = async () => {
    if (touch) return null
    const b = await page.evaluate(() => { const rs = [...document.querySelectorAll('.airpop-box')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect())
      return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) } })
    const x = Math.max(0, Math.floor(b.x - 150)), y = Math.max(0, Math.floor(b.y - 40))
    return { x, y, width: Math.min(VW, Math.ceil(b.r + 150)) - x, height: Math.min(VH, Math.ceil(b.b + 40)) - y }
  }
  await frame(); await hush()
  await shot('swap-0-before', await panelClip())

  /* THE DRAG — Tally's puck onto Ranger's, with the mouse (the app's pointer machine takes a mouse on a touch page too) */
  const drag = async (from, to) => {
    const fb = await page.locator(from).boundingBox(), tb = await page.locator(to).boundingBox()
    const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2, tx = tb.x + tb.width / 2, ty = tb.y + tb.height / 2
    await page.mouse.move(fx, fy); await page.mouse.down()
    await page.mouse.move(fx + 6, fy + 6, { steps: 3 })
    await page.mouse.move(tx, ty, { steps: 14 }); await page.waitForTimeout(150)
    await page.mouse.move(tx + 1, ty + 1); await page.waitForTimeout(150)
    await page.mouse.up(); await page.waitForTimeout(700)
  }
  await unhush()
  await drag(puckSel(1), puckSel(0))
  const asked = await page.locator('[data-testid="oilconf"]').count()
  say('REAL — after the drag', { programme: await groundNow(page), oilQuestion: asked ? (await page.locator('[data-testid="oilconf"] .airpop-head b').innerText()) : 'NOT ASKED', note: (await page.locator('#toastEl').innerText().catch(() => '')).trim() })
  if (!asked) { say('STOPPED', 'the drag did not raise the question on this surface'); return }
  await hush()
  /* AS BUILT TODAY: the swap is made, the question stands over it, and Cancel leaves the swap with no answer */
  await shot('swap-1-question-asbuilt', await sheetClip())

  /* THE PROPOSED WORDS on that same real sheet. `how`: 'wait' — the swap is not made until the question is answered;
     'back' — the swap is made at once, and taken back if nobody answers. Only the words differ. */
  const words = how => page.evaluate(how => {
    const sheet = [...document.querySelectorAll('[data-testid="oilconf"]')].pop(); if (!sheet) return 'no sheet'
    const set = (el, t) => { if (!el) return; if (!el.hasAttribute('data-mockx-was')) el.setAttribute('data-mockx-was', el.textContent); el.textContent = t }
    /* the hint stays the sheet's own ("Choose an option above"); the two buttons say what each does */
    set(sheet.querySelector('.airpop-foot .abtn.ghost'), how === 'wait' ? 'Don’t swap' : 'Take the swap back')
    if (how === 'wait') set(sheet.querySelector('[data-testid="oilconf-save"]'), 'Swap')
    /* a statement, never a second question above the Yes / No */
    const lead = document.createElement('div'); lead.className = 'oilconf-what mockx'; lead.style.marginBottom = '10px'
    lead.innerHTML = how === 'wait' ? '<b>Swapping Tally and Ranger</b>' : '<b>Tally and Ranger swapped</b>'
    const body = sheet.querySelector('.upconf-body'); body.insertBefore(lead, body.firstChild)
    return 'ok'
  }, how)
  const sheetHTML = await page.locator('[data-testid="oilconf"]').evaluate(e => e.outerHTML)
  await words('back')
  await shot('swap-2-question-takenback', await sheetClip())
  await unpaint()

  /* Cancel (real): today the swap STAYS and the question is left open. Then Undo (real) — the app's own put-back: both
     pucks where they were, which is the state "not answered" ends in under either wording. */
  await press(page.locator('[data-testid="oilconf"] .airpop-foot .abtn.ghost'))
  await page.waitForTimeout(400)
  say('REAL, AS BUILT — after Cancel the swap stays, unanswered', await groundNow(page))
  await unhush()
  await press(page.locator((await page.locator('#sbUndo').isVisible()) ? '#sbUndo' : '#undoBtn'))
  await page.waitForTimeout(600)
  say('REAL — after Undo, the state "not answered" ends in', await groundNow(page))
  await hush()

  /* THE SWAP WAITS — the question's own sheet (its markup as the app drew it a moment ago) put back over the board as
     it stood BEFORE the swap: nothing has moved, so no window of the input is open behind it and both pucks show */
  await page.locator(rowSel(0)).evaluate(e => e.closest('.sb-sec').scrollIntoView({ block: 'start' }))
  await page.waitForTimeout(250)
  await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-fresh').forEach(e => e.classList.remove('sb-fresh')))   // the passing outline of a row just changed
  await page.evaluate(html => {
    const d = document.createElement('div'); d.className = 'mockx'; d.innerHTML = html
    d.firstElementChild.style.zIndex = '2000'
    document.body.appendChild(d)
  }, sheetHTML)
  await words('wait')
  const waitsClip = async () => {
    if (touch) return null
    const b = await page.evaluate(sel => { const rs = [document.querySelector(sel).closest('.sb-sec'), [...document.querySelectorAll('.airpop-box')].filter(e => e.offsetParent).pop()].map(e => e.getBoundingClientRect())
      return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) } }, rowSel(0))
    const x = Math.max(0, Math.floor(b.x - 10)), y = Math.max(0, Math.floor(b.y - 10))
    return { x, y, width: Math.min(VW, Math.ceil(b.r + 10)) - x, height: Math.min(VH, Math.ceil(b.b + 30)) - y }
  }
  await shot('swap-3-question-waits', await waitsClip())
  await unpaint()

  /* THE MOMENT AFTER — both pucks where they were. Three ways of saying so:
       'note'  the passing note, and both pucks flash (the app's own landing flash);
       'stay'  the flash, and a bar that stays until it is answered (the app's own "Set as default" bar);
       'ring'  the passing note, and both ROWS outlined for a few seconds (the outline a just-added row wears). */
  const TEXT = 'Not swapped — OIL not answered'
  const after = async (name, way) => {
    await frame()
    await page.evaluate(([pucks, rows, text, way]) => {
      if (way !== 'ring') for (const q of pucks) { const p = document.querySelector(q); if (p) { const host = p.closest('.seat') || p; host.classList.remove('lift-land'); void host.offsetWidth; host.classList.add('lift-land', 'mockx-flash') } }
      if (way === 'ring') for (const q of rows) { const r = document.querySelector(q); if (r) r.classList.add('sb-fresh', 'mockx-ring') }
      if (way === 'stay') {
        const b = document.createElement('div'); b.className = 'secdef-snack mockx'; b.setAttribute('role', 'status'); b.style.zIndex = '1000'   // over the board, as the build would mount it
        b.innerHTML = '<span class="secdef-msg"></span><button class="secdef-btn yes" type="button">Answer OIL</button><button class="secdef-btn" type="button">OK</button>'
        b.querySelector('.secdef-msg').textContent = text
        document.body.appendChild(b)
      } else window.toast(text, 'warn')
    }, [[puckSel(0), puckSel(1)], [rowSel(0), rowSel(1)], TEXT, way])
    if (way === 'stay') await hush(); else await unhush()
    await page.waitForTimeout(way === 'stay' ? 150 : 350)
    await shot(name, await panelClip())
    await unpaint(); await hush()
    await page.waitForTimeout(2800)   // the passing note leaves before the next picture
  }
  await after('swap-4-after-note', 'note')
  await after('swap-5-after-stays', 'stay')
  await after('swap-6-after-rows', 'ring')
}

/* ------------------------------------------------------------------------------------------------------------------
   (2) + (3) THE HOLIDAY'S NOTICE, THE ONE LIST, THE BELL
   ------------------------------------------------------------------------------------------------------------------ */
const ON_FRI = [
  { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' },
  { type: 'Duty', people: ['harpoon'], title: 'Gate duty' },
  { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Safety board' },
]
async function holiday(s) {
  const { page, press, say, shot, hush, unhush, unpaint, touch, VW, VH } = s
  for (const spec of ON_FRI) await s.fileIt(FRI, spec)
  /* the day is made a public holiday — Inputs ⚙ → Calendar… → Holidays → + Add (real presses) */
  await page.evaluate(() => window.go('inputs'))
  await press(page.locator('#inGear')); await page.waitForTimeout(400)
  await press(page.locator('[data-testid="iset-days"]')); await page.waitForTimeout(600)
  const tab = page.locator('[data-testid="days-tab-holidays"]'); if (await tab.count()) { await press(tab); await page.waitForTimeout(300) }
  await press(page.locator('[data-testid="hol-add"]')); await page.waitForTimeout(500)
  await press(page.locator('[data-testid="hol-kind-ph"]'))
  await page.locator('[data-testid="hol-name"]').fill('National Day')
  for (let i = 0; i < 24 && !(await page.locator(`[data-testid="holcal-day-${FRI}"]`).count()); i++) await press(page.locator('[data-testid="holcal-next-month"]'))
  await press(page.locator(`[data-testid="holcal-day-${FRI}"]`)); await page.waitForTimeout(200)
  await hush()
  await shot('hol-0-form-asbuilt')
  await press(page.locator('[data-testid="hol-save"]')); await page.waitForTimeout(700)
  say('REAL — the holiday saved', await page.evaluate(() => ({ err: (document.querySelector('[data-testid="hol-err"]') || {}).textContent || null, formStillOpen: !!document.querySelector('[data-testid="win-holiday"]') })))
  /* the settings window goes; the Calendar window stays up (the page behind a window works — D641) */
  await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(250)
  await s.toMonth(); await s.openDay(FRI)
  const real = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .icard')].map(c => ({
    who: c.querySelector('.icard-who').textContent, kind: c.querySelector('.icard-kind').textContent, when: c.querySelector('.icard-hrs').textContent, oilTag: !!c.querySelector('.oiltag') })))
  say('REAL — the day’s inputs, and which wear the app’s own "OIL?" tag (nobody has answered)', real)
  await hush()
  await shot('hol-1-day-asbuilt')

  /* THE ONE LIST (D782), drawn on that real window: the day's own cards, only those that need an answer; in each a Yes
     and a No (the OIL question's own buttons, with the amount the single question offers — a full day for an all-day
     input, half a day up to six hours); "Yes to all" / "No to all"; Save. `picked`: what is lit, by the card's place. */
  const list = (lead, picked) => page.evaluate(([lead, picked]) => {
    const win = document.querySelector('[data-testid="win-inputsday"]'); if (!win) return 'no window'
    const hide = e => { if (e) { e.style.display = 'none'; e.setAttribute('data-mockx-hid', '') } }
    const set = (el, t) => { if (!el) return; if (!el.hasAttribute('data-mockx-was')) el.setAttribute('data-mockx-was', el.textContent); el.textContent = t }
    const ttl = win.querySelector('.win-ttl'); ttl.setAttribute('data-mockx-ttl', ttl.firstChild.nodeValue); ttl.firstChild.nodeValue = 'OIL — ' + ttl.firstChild.nodeValue
    hide(win.querySelector('.win-tools'))
    /* on a phone a window is as tall as what is in it (D706): the day's window opens tall (D683), the list would not */
    if (window.matchMedia('(max-width:820px)').matches) { win.setAttribute('data-mockx-style', win.getAttribute('style') || ''); win.style.height = 'auto'; win.style.top = 'auto'; win.style.minHeight = '0' }
    const top = win.querySelector('.sd-top')
    const cards = [...win.querySelectorAll('.icard')]
    const ask = cards.filter(c => c.querySelector('.oiltag'))
    cards.filter(c => !ask.includes(c)).forEach(hide)
    if (lead) { [...top.children].forEach(hide); const l = document.createElement('div'); l.className = 'oilconf-what mockx'; l.style.margin = '0'; l.textContent = lead; top.appendChild(l) }
    else hide(top)
    let done = 0
    ask.forEach((c, i) => {
      const hrs = c.querySelector('.icard-hrs').textContent.trim()
      const m = /^(\d\d):(\d\d)\D+(\d\d):(\d\d)$/.exec(hrs)
      const amt = !m || ((+m[3] * 60 + +m[4]) - (+m[1] * 60 + +m[2])) > 360 ? 'FO' : 'HO'
      const pick = picked[i] || ''
      if (pick) done++
      hide(c.querySelector('.oiltag'))
      const words = c.querySelector('.icard-words'), by = words.querySelector('.icard-by')
      const seg = document.createElement('span'); seg.className = 'mockx'; seg.style.cssText = 'display:inline-flex;gap:6px;margin-left:auto;align-self:center;flex:none'
      seg.innerHTML = `<button type="button" class="upconf-seg${pick === 'y' ? ' on-keep' : ''}">Yes · ${amt}</button><button type="button" class="upconf-seg"${pick === 'n' ? ' style="background:var(--edge-2);border-color:transparent;color:var(--ink)"' : ''}>No</button>`
      if (by) { by.style.marginLeft = '0'; by.setAttribute('data-mockx-by', '') }
      words.appendChild(seg)
    })
    const h = win.querySelector('[data-testid="idy-count"]'); hide(h)
    const row = document.createElement('div'); row.className = 'mockx'; row.style.cssText = 'display:flex;gap:8px;align-items:center;margin:2px 0 10px'
    row.innerHTML = '<h3 class="sd-gh" style="margin:0;flex:1"></h3><button type="button" class="abtn sm">Yes to all</button><button type="button" class="abtn sm">No to all</button>'
    row.firstChild.textContent = done ? `${done} of ${ask.length} answered` : `${ask.length} to answer`
    h.parentNode.insertBefore(row, h)
    const foot = document.createElement('div'); foot.className = 'mockx'; foot.style.cssText = 'display:flex;gap:8px;align-items:center;padding:12px 12px 14px'
    foot.innerHTML = `<span class="upconf-need" style="flex:1"></span><button type="button" class="abtn ghost">Later</button><button type="button" class="abtn primary"${done ? '' : ' disabled'}>Save</button>`
    foot.querySelector('.upconf-need').textContent = done === ask.length ? '' : 'What is left goes to the schedulers’ bells'
    win.querySelector('.win-body').appendChild(foot)
    return { needAnAnswer: ask.length, answered: done }
  }, [lead, picked])
  const winClip = async (sels, pad = 14) => {
    if (touch) return null
    const b = await page.evaluate(sels => { const rs = sels.map(q => document.querySelector(q)).filter(Boolean).map(e => e.getBoundingClientRect())
      return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) } }, sels)
    const x = Math.max(0, Math.floor(b.x - pad)), y = Math.max(0, Math.floor(b.y - pad))
    return { x, y, width: Math.min(VW, Math.ceil(b.r + pad)) - x, height: Math.min(VH, Math.ceil(b.b + pad)) - y }
  }
  const DAYWIN = '[data-testid="win-inputsday"]', CALWIN = '[data-testid="win-days"]'
  /* (3) THE NOTICE TO THE ADMIN WHO DECLARED IT: the list opens by itself the moment the holiday is saved */
  say('DRAWN — the notice', await list('National Day is now a public holiday.', []))
  await shot('hol-2-notice', await winClip([DAYWIN, CALWIN]))
  await unpaint()
  /* (2) THE LIST, part answered */
  say('DRAWN — the list, part answered', await list('', ['', 'y', 'y', 'n']))
  await shot('hol-3-list', await winClip([DAYWIN]))
  await unpaint()
  say('DRAWN — the list after "Yes to all"', await list('', ['y', 'y', 'y', 'y']))
  await shot('hol-4-list-yes-to-all', await winClip([DAYWIN]))
  await unpaint()

  /* THE SCHEDULERS' BELL — one line a holiday. Another scheduler is signed in in place (the bridge: Warden, an admin who
     filed none of these, so his bell opens its LIST — a bell with a question of his own goes straight to it, D769).
     The list is the app's own, opened by a real tap; the ONE line in it is drawn, in the bell's own line. */
  await page.locator(`${DAYWIN} .win-x`).evaluate(e => e.click()).catch(() => {})
  await page.locator(`${CALWIN} .win-x`).evaluate(e => e.click()).catch(() => {})
  await page.waitForTimeout(300)
  await page.evaluate(() => window.raptorMe('nact'))
  await page.waitForTimeout(400)
  await unhush()
  await press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(400)
  const opened = await page.locator('[data-testid="bell-list"]').count()
  say('REAL — the other scheduler’s bell today', { list: opened ? (await page.locator('[data-testid="bell-list"]').innerText()).replace(/\s+/g, ' ').trim() : 'NO LIST OPENED', note: (await page.locator('#toastEl').innerText().catch(() => '')).trim() })
  await hush()
  if (!opened) return
  const clipOfBell = async () => {
    if (touch) return { x: 0, y: 0, width: VW, height: 300 }
    const b = await page.locator('[data-testid="bell-list"]').boundingBox()
    const x = Math.max(0, Math.floor(b.x - 40))
    return { x, y: 0, width: VW - x, height: Math.ceil(b.y + b.height + 30) }
  }
  await shot('hol-5-bell-asbuilt', await clipOfBell())
  say('DRAWN — the bell’s line', await page.evaluate(n => {
    const l = document.querySelector('[data-testid="bell-list"]'); if (!l) return 'no list'
    l.querySelectorAll('.bl-empty').forEach(e => { e.style.display = 'none'; e.setAttribute('data-mockx-hid', '') })
    const b = document.createElement('button'); b.type = 'button'; b.className = 'bl-line unread mockx'
    b.innerHTML = '<span class="bl-dot" aria-hidden="true"></span><span class="bl-main"><span class="bl-t"><b class="bl-name">National Day</b><i class="bl-day">Fri 17 Jul</i></span><span class="bl-what"></span></span><span class="bl-ago">now</span>'
    b.querySelector('.bl-what').textContent = `${n} inputs need an OIL answer · Saber`
    l.insertBefore(b, l.firstChild)
    const f = document.createElement('div'); f.className = 'bl-foot mockx'; f.innerHTML = '<button type="button" class="abtn sm ghost">Mark all read</button>'; l.appendChild(f)
    document.querySelectorAll('.bellbtn').forEach(e => e.classList.add('on'))
    return 'one line'
  }, real.filter(r => r.oilTag).length))
  await shot('hol-6-bell', await clipOfBell())
}

const want = p => PART === 'all' || PART === p
for (const [tag, size] of [['desk', DESK], ['phone', PHONE]]) {
  if (want('swap')) await session(tag, size, swap)
  if (want('hol')) await session(tag, size, holiday)
}
await browser.close()
