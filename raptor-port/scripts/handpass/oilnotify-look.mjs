// THE BUILT SCREENS BESIDE THE APPROVED PICTURES — [OIL-ASK-NOTIFY] (owner D783: the pictures of
// docs/mock/2026-10-12-oil-notify/ are the design of record; D624: each approved picture set beside the built screen
// at the same size). The same two stories the mock-up script walked (scripts/handpass/oilnotify-mock.mjs), on the
// REAL built app, by real presses — nothing is drawn onto the page here. Every step asserts what the screen and the
// record say (PASS / FAIL), so re-running it on a fixed build is the re-walk.
//   THE SWAP — Sat 18 Jul 26, the Scheduler Board: "Range brief" (Training 09:00–12:00) filed for Ranger, answered Yes;
//   a plain programme row "Hangar open day" with Tally on it; Tally's puck DRAGGED onto Ranger's. Expected (D783): the
//   question FIRST, nothing moved; "Don't swap" → both pucks where they were, the bar; "Answer OIL" → Yes → "Swap".
//   THE HOLIDAY — Fri 17 Jul 26: three inputs filed on the working Friday, then the day made a public holiday through
//   Inputs ⚙ → Calendar… → Holidays → + Add. Expected: the ONE list opens by itself; picks; Later; the other
//   scheduler's bell carries ONE line, counting what is left; a tap on it opens the list.
// Phone 390 x 844 (touch) and desktop 1440 x 900, every picture at twice the pixels.
//
//   npm run build && npx vite preview --port 4180 --strictPort
//   node scripts/handpass/oilnotify-look.mjs [out dir] [swap|hol|all]
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-13-oil-ask-notify/look'
const PART = process.argv[3] || 'all'
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const DPR = +(process.env.HP_DPR || 2)
mkdirSync(OUT, { recursive: true })
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true }
const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: DPR }
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const SAT = '2026-07-18', SAT_DI = 5, FRI = '2026-07-17'
let fails = 0, passes = 0

async function session(tag, size, body) {
  const touch = !!size.isMobile
  const ctx = await browser.newContext(size)
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date('2026-06-22T09:00:00') })      // three weeks before the demo week: nothing reads LATE; the clock MOVES
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const VW = size.viewport.width, VH = size.viewport.height
  const press = loc => (touch ? loc.tap() : loc.click())
  const say = (step, what) => console.log(`${tag} ${step}: ${typeof what === 'string' ? what : JSON.stringify(what)}`)
  const check = (name, ok, got) => { if (ok) passes++; else fails++; console.log(`${tag} ${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' — got ' + JSON.stringify(got)}`) }
  const shot = async (name, clip) => { await page.screenshot({ path: join(OUT, `${tag}-${name}.png`), ...(clip ? { clip } : {}) }); say('picture', `${tag}-${name}.png`) }
  const hush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  const unhush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  const tid = t => page.locator(`[data-testid="${t}"]`)

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
    for (let k = 0; k < 4; k++) {
      const sheet = page.locator('[data-testid="oilconf"]')
      if (await sheet.count()) {
        const one = sheet.locator('[data-testid="oil-yes"]'), many = sheet.locator('[data-testid="oil-all"]')
        await press((await one.count()) ? one : many)
        await press(sheet.locator('[data-testid="oilconf-save"]'))
      } else if (await page.locator('[data-testid="docconf"]').count()) await press(page.locator('[data-testid="docconf-nodoc"]'))
      else break
      await page.waitForTimeout(350)
    }
    await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => say('STILL OPEN', 'the input window'))
    await page.waitForTimeout(300)
    const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => r.iid), had)
    await closeDay()
    return made[0]
  }

  await page.goto(URL + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await body({ page, press, say, check, shot, hush, unhush, tid, toMonth, openDay, closeDay, fileIt, touch, VW, VH, tag })
  check('no console errors, page errors or failed requests', errors.length === 0, errors)
  await ctx.close()
}

/* ---------------------------------------------------------------- (1) THE SWAP ---------------------------------------- */
const groundNow = page => page.evaluate(di => (window.DAYS[di].ground || []).map(r => {
  const cs = x => (window.PEOPLE[x] && window.PEOPLE[x].cs) || x || ''
  return `${r.prog || '(blank)'}: ${cs(r.who)}${(r.more || []).map(m => ' + ' + cs(m)).join('')}`
}), SAT_DI)

async function swap(s) {
  const { page, press, say, check, shot, hush, unhush, tid, touch, VW, VH } = s
  const iid = await s.fileIt(SAT, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
  const oil0 = await page.evaluate(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil || null), iid)
  await page.evaluate(() => window.go('editsched'))
  await page.waitForTimeout(500)
  await page.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
  await page.waitForTimeout(400)
  await page.locator(`#sbBoard [data-gradd="${SAT_DI}"]`).evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
  await page.waitForTimeout(300)
  const type = async (fld, v) => { const b = page.locator(`#sbBoard [data-bfld="${fld}"]`); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.fill(v); await b.blur(); await page.waitForTimeout(200) }
  await type(`gr:${SAT_DI}.1.prog`, 'Hangar open day')
  await type(`gr:${SAT_DI}.1.str`, '13:00')
  await type(`gr:${SAT_DI}.1.end`, '15:00')
  await page.evaluate(di => { window.fillSlot(`g:${di}.1.+`, 'nick'); window.afterSchedMutate() }, SAT_DI)   // SETUP: Tally on the plain row
  await page.waitForTimeout(400)
  await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-fresh').forEach(e => e.classList.remove('sb-fresh')))
  const before = await groundNow(page)
  say('the programme before', before)

  const rowSel = i => `#sbBoard [data-move="mv:g.${SAT_DI}.${i}"]`
  const puckSel = i => `#sbBoard [data-slot="g:${SAT_DI}.${i}"] .puck`
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
    const b = await page.locator(rowSel(0)).evaluate(e => { const r = e.closest('.sb-sec').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width } })
    const y = Math.max(0, Math.floor(b.y - 10))
    return { x: Math.max(0, Math.floor(b.x - 10)), y, width: Math.min(VW, Math.ceil(b.w + 20)), height: VH - y }
  }
  const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#sbUndo') || document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
  const drag = async (from, to) => {
    const fb = await page.locator(from).boundingBox(), tb = await page.locator(to).boundingBox()
    const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2, tx = tb.x + tb.width / 2, ty = tb.y + tb.height / 2
    await page.mouse.move(fx, fy); await page.mouse.down()
    await page.mouse.move(fx + 6, fy + 6, { steps: 3 })
    await page.mouse.move(tx, ty, { steps: 14 }); await page.waitForTimeout(150)
    await page.mouse.move(tx + 1, ty + 1); await page.waitForTimeout(150)
    await page.mouse.up(); await page.waitForTimeout(600)
  }
  await frame(); await hush()
  const undo0 = await undoLabel()
  await unhush()
  /* THE DRAG — Tally's puck onto Ranger's */
  await drag(puckSel(1), puckSel(0))
  const sheet = tid('oilconf')
  check('the question is up', await sheet.count() === 1, await sheet.count())
  if (!(await sheet.count())) return
  check('its heading names the man who would hold it', (await sheet.locator('.airpop-head b').innerText()).trim() === 'OIL — Tally, Range brief', await sheet.locator('.airpop-head b').innerText())
  check('its first line says what is waiting', (await tid('oilconf-lead').innerText()).trim() === 'Swapping Tally and Ranger', await tid('oilconf-lead').innerText().catch(() => ''))
  check('"Don’t swap" and "Swap"', (await tid('oilconf-cancel').innerText()) === 'Don’t swap' && (await tid('oilconf-save').innerText()) === 'Swap', [await tid('oilconf-cancel').innerText(), await tid('oilconf-save').innerText()])
  check('Swap is greyed until an answer is picked', await tid('oilconf-save').isDisabled(), false)
  check('NOTHING moved behind it', JSON.stringify(await groundNow(page)) === JSON.stringify(before), await groundNow(page))
  check('no window of the input stands behind it', await page.locator('#inpEditPop:not([hidden])').count() === 0, 'open')
  check('Undo is as it was — no step', (await undoLabel()) === undo0, [undo0, await undoLabel()])
  await hush()
  const waitsClip = async () => {
    if (touch) return null
    const b = await page.evaluate(sel => { const rs = [document.querySelector(sel).closest('.sb-sec'), [...document.querySelectorAll('.airpop-box')].filter(e => e.offsetParent).pop()].map(e => e.getBoundingClientRect())
      return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) } }, rowSel(0))
    const x = Math.max(0, Math.floor(b.x - 10)), y = Math.max(0, Math.floor(b.y - 10))
    return { x, y, width: Math.min(VW, Math.ceil(b.r + 10)) - x, height: Math.min(VH, Math.ceil(b.b + 30)) - y }
  }
  await shot('swap-3-question-waits', await waitsClip())

  /* NOT ANSWERED — "Don't swap": both pucks flash where they were, the bar stays */
  await press(tid('oilconf-cancel'))
  await page.waitForTimeout(120)
  const lit = await page.evaluate(sels => sels.map(q => { const p = document.querySelector(q); const host = p && (p.closest('.seat') || p); return !!host && host.classList.contains('lift-land') }), [puckSel(0), puckSel(1)])
  check('both pucks flash where they stand', lit[0] && lit[1], lit)
  check('the bar: "Not swapped — OIL not answered"', (await tid('oilbar-text').innerText().catch(() => '')) === 'Not swapped — OIL not answered', await tid('oilbar-text').innerText().catch(() => ''))
  check('its two buttons: Answer OIL, OK', (await tid('oilbar-answer').innerText().catch(() => '')) === 'Answer OIL' && (await tid('oilbar-ok').innerText().catch(() => '')) === 'OK', '')
  check('nothing was swapped', JSON.stringify(await groundNow(page)) === JSON.stringify(before), await groundNow(page))
  check('the input keeps its first answer', await page.evaluate(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil || null), iid) === oil0, '')
  /* the bar is inside the screen, and on top (nothing of the board covers it) */
  const bar = await tid('oilbar').boundingBox()
  check('the bar is inside the screen', !!bar && bar.x >= 0 && bar.y >= 0 && bar.x + bar.width <= VW + 0.5 && bar.y + bar.height <= VH + 0.5, bar)
  check('the bar is on top of the board', await page.evaluate(() => { const b = document.querySelector('[data-testid="oilbar"]'); const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return hit === b || b.contains(hit) }), false)
  await frame()
  await shot('swap-5-after-stays', await panelClip())
  await page.waitForTimeout(5000)
  check('the bar is still there five seconds on', await tid('oilbar').count() === 1, 0)

  /* ANSWER OIL — the question again; Yes; Swap */
  await press(tid('oilbar-answer'))
  await page.waitForTimeout(300)
  check('"Answer OIL" brings the question back, and the bar steps aside', await tid('oilconf').count() === 1 && await tid('oilbar').count() === 0, [await tid('oilconf').count(), await tid('oilbar').count()])
  await press(tid('oil-yes'))
  check('with an answer picked, Swap is live', !(await tid('oilconf-save').isDisabled()), 'disabled')
  await unhush()
  await press(tid('oilconf-save'))
  await page.waitForTimeout(700)
  const after = await groundNow(page)
  check('answered: Tally is on Range brief and Ranger on Hangar open day', after[0] === 'RANGE BRIEF: Tally' || /Range brief: Tally/i.test(after[0]) && /Hangar open day: Ranger/i.test(after[1]), after)
  check('the input has the answer given with the swap', await page.evaluate(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil), iid) === JSON.stringify({ [SAT]: 0.5 }), await page.evaluate(i => (window.INPUTS.find(r => r.iid === i) || {}).oil, iid))
  check('the note says they swapped', /Tally and Ranger swapped/.test(await page.locator('#toastEl').innerText().catch(() => '')), await page.locator('#toastEl').innerText().catch(() => ''))
  check('no question and no bar is left', await tid('oilconf').count() === 0 && await tid('oilbar').count() === 0, '')
  await hush(); await frame()
  await shot('swap-7-answered-swapped', await panelClip())
  /* ONE Undo puts both back, and the first answer */
  await unhush()
  await press(page.locator((await page.locator('#sbUndo').isVisible()) ? '#sbUndo' : '#undoBtn'))
  await page.waitForTimeout(600)
  check('ONE Undo puts both men back', JSON.stringify(await groundNow(page)) === JSON.stringify(before), await groundNow(page))
  check('…and the first man’s answer', await page.evaluate(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil || null), iid) === oil0, '')
}

/* ---------------------------------------------------------------- (2) + (3) THE HOLIDAY ------------------------------- */
const ON_FRI = [
  { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' },
  { type: 'Duty', people: ['harpoon'], title: 'Gate duty' },
  { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Safety board' },
]
async function holiday(s) {
  const { page, press, say, check, shot, hush, unhush, tid, touch, VW, VH } = s
  /* A SECOND SCHEDULER — the demo has one admin sign-in (Saber's). Warden is given one on Admin → Users, by the row's
     own controls: "the schedulers" are the people with an admin sign-in, and a man with none is told nothing. */
  /* (a SETUP step, done at a desktop's width on both runs — Admin → Users is not what is being looked at) */
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.evaluate(() => window.go('admin'))
  const row = page.locator('.acc-row[data-person="nact"]').first()
  await row.locator('.acc-tap').evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
  await page.locator('#accGiveName').fill('warden')
  await page.selectOption('#accGiveRole', 'admin')
  await page.locator('#accGive').evaluate(e => e.click())
  await page.waitForTimeout(300)
  check('SETUP — Warden has an admin sign-in', await page.locator('.acc-row[data-person="nact"][data-acct]').count() === 1, 'no account')
  await page.setViewportSize({ width: VW, height: VH })
  const ids = []
  for (const spec of ON_FRI) ids.push(await s.fileIt(FRI, spec))
  await page.evaluate(() => window.go('inputs'))
  await press(page.locator('#inGear')); await page.waitForTimeout(400)
  await press(tid('iset-days')); await page.waitForTimeout(600)
  const tab = tid('days-tab-holidays'); if (await tab.count()) { await press(tab); await page.waitForTimeout(300) }
  await press(tid('hol-add')); await page.waitForTimeout(500)
  await press(tid('hol-kind-ph'))
  await tid('hol-name').fill('National Day')
  for (let i = 0; i < 24 && !(await tid(`holcal-day-${FRI}`).count()); i++) await press(tid('holcal-next-month'))
  await press(tid(`holcal-day-${FRI}`)); await page.waitForTimeout(200)
  check('before the holiday: no list is up', await tid('win-oilday').count() === 0, '')
  await press(tid('hol-save')); await page.waitForTimeout(800)
  await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(250)
  const win = tid('win-oilday')
  check('the ONE list opens by itself when the holiday is saved', await win.count() === 1, await win.count())
  if (!(await win.count())) return
  const n = await win.locator('.icard').count()
  check('it lists the three filed and the demo’s own overseas duty', n === 4, n)
  check('its title and second line', /OIL — Fri 17 Jul/.test(await win.locator('.win-ttl').innerText()) && /Public holiday · National Day/.test(await win.locator('.win-ttl').innerText()), await win.locator('.win-ttl').innerText())
  check('"National Day is now a public holiday."', (await tid('odl-lead').innerText().catch(() => '')) === 'National Day is now a public holiday.', await tid('odl-lead').innerText().catch(() => ''))
  check('"4 to answer"', /^4 to answer$/i.test((await tid('odl-count').innerText()).trim()), await tid('odl-count').innerText())
  check('no "OIL?" tag inside the list', await win.locator('.oiltag').count() === 0, '')
  check('Save is greyed until something is picked', await tid('odl-save').isDisabled(), false)
  check('"What is left goes to the schedulers’ bells"', (await tid('odl-left').innerText()) === 'What is left goes to the schedulers’ bells', await tid('odl-left').innerText())
  const box = await win.boundingBox()
  check('the list is inside the screen', !!box && box.x >= -0.5 && box.y >= -0.5 && box.x + box.width <= VW + 0.5 && box.y + box.height <= VH + 0.5, box)
  const winClip = async sels => {
    if (touch) return null
    const b = await page.evaluate(sels => { const rs = sels.map(q => document.querySelector(q)).filter(Boolean).map(e => e.getBoundingClientRect())
      return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) } }, sels)
    const x = Math.max(0, Math.floor(b.x - 14)), y = Math.max(0, Math.floor(b.y - 14))
    return { x, y, width: Math.min(VW, Math.ceil(b.r + 14)) - x, height: Math.min(VH, Math.ceil(b.b + 14)) - y }
  }
  const LIST = '[data-testid="win-oilday"]', CALWIN = '[data-testid="win-days"]'
  await hush()
  await shot('hol-2-notice', await winClip([LIST, CALWIN]))
  /* part answered, as the approved picture: Yes, Yes, No on the last three */
  await press(tid(`odl-yes-${ids[1]}`)); await press(tid(`odl-yes-${ids[0]}`)); await press(tid(`odl-no-${ids[2]}`))
  check('"3 of 4 answered"', /^3 of 4 answered$/i.test((await tid('odl-count').innerText()).trim()), await tid('odl-count').innerText())
  check('Save is live', !(await tid('odl-save').isDisabled()), 'disabled')
  await tid('odl-count').hover().catch(() => {})
  await page.waitForTimeout(500)                    // a phone's own tap highlight on the button just pressed has gone
  await shot('hol-3-list', await winClip([LIST]))
  await press(tid('odl-yesall'))
  check('"Yes to all": 4 of 4, and nothing is left for the bells', /^4 of 4 answered$/i.test((await tid('odl-count').innerText()).trim()) && (await tid('odl-left').innerText()) === '', [await tid('odl-count').innerText(), await tid('odl-left').innerText()])
  await shot('hol-4-list-yes-to-all', await winClip([LIST]))
  /* LATER — nothing written */
  await press(tid('odl-later')); await page.waitForTimeout(300)
  check('Later closes it and writes nothing', await win.count() === 0 && await page.evaluate(i => !(window.INPUTS.find(r => r.iid === i) || {}).oil, ids[0]), '')
  /* THE OTHER SCHEDULER'S BELL — Warden, signed in in place */
  await page.locator(`${CALWIN} .win-x`).evaluate(e => e.click()).catch(() => {})
  await page.evaluate(() => window.raptorMe('nact'))
  await page.waitForTimeout(400)
  check('his bell is lit', await page.locator('.bellbtn.on:visible').count() >= 1, 0)
  await unhush()
  await press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(400)
  const bl = tid('bell-list')
  check('his bell opens its list', await bl.count() === 1, await bl.count())
  if (!(await bl.count())) return
  const lineText = (await bl.locator('.bl-line').first().innerText()).replace(/\s+/g, ' ').trim()
  check('ONE line: the holiday, its day, "4 inputs need an OIL answer · Saber"', await bl.locator('.bl-line').count() === 1 && /^National Day\s*Fri 17 Jul\s*4 inputs need an OIL answer · Saber/.test(lineText), lineText)
  await hush()
  const b = await bl.boundingBox()
  await shot('hol-6-bell', touch ? { x: 0, y: 0, width: VW, height: 300 } : { x: Math.max(0, Math.floor(b.x - 40)), y: 0, width: VW - Math.max(0, Math.floor(b.x - 40)), height: Math.ceil(b.y + b.height + 30) })
  await press(bl.locator('.bl-line').first()); await page.waitForTimeout(400)
  check('a tap on the line opens the ONE list — without "is now a public holiday"', await win.count() === 1 && await tid('odl-lead').count() === 0 && await bl.count() === 0, [await win.count(), await tid('odl-lead').count(), await bl.count()])
  /* he answers two and saves: the count on the bell falls */
  await press(tid(`odl-yes-${ids[0]}`)); await press(tid(`odl-no-${ids[1]}`))
  await unhush()
  await press(tid('odl-save')); await page.waitForTimeout(500)
  check('Save closes it and writes the two answers', await win.count() === 0 && await page.evaluate(([a, b, d]) => { const o = i => (window.INPUTS.find(r => r.iid === i) || {}).oil || {}; return o(a)[d] === 0.5 && o(b)[d] === 0 }, [ids[0], ids[1], FRI]), '')
  await press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(400)
  const line2 = (await bl.locator('.bl-line').first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
  check('the line now counts 2', /2 inputs need an OIL answer/.test(line2), line2)
  await hush()
  await shot('hol-8-bell-two-left', touch ? { x: 0, y: 0, width: VW, height: 300 } : null)
  await press(bl.locator('.bl-line').first()); await page.waitForTimeout(300)
  await press(tid('odl-yesall')); await unhush(); await press(tid('odl-save')); await page.waitForTimeout(500)
  await press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(400)
  check('all answered: the line is gone', await bl.locator('.bl-line').count() === 0, await bl.locator('.bl-line').count())
}

const want = p => PART === 'all' || PART === p
for (const [tag, size] of [['desk', DESK], ['phone', PHONE]]) {
  if (want('swap')) await session(tag, size, swap)
  if (want('hol')) await session(tag, size, holiday)
}
await browser.close()
console.log(`\nTOTAL ${passes} PASS, ${fails} FAIL`)
process.exit(fails ? 1 : 0)
