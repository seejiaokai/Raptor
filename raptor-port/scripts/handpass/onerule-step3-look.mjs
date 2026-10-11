// A LOOK at step 3 of the one-rule build in the RUNNING build, phone and desktop — the builder's own eye before the owner's:
// ALL AVAIL / ALL as one of an input's own people (owner D750, D753, D755, D757). By real presses:
//   A — "Several people" in a new input's window shows the two placeholder pucks under "Whoever is free that day"; one is
//       picked beside two people and the input is filed; with the kind turned to a leave they are greyed, the reason under.
//   B — on the schedule that input is ONE row: the people A to Z, then ALL AVAIL with its counter.
//   C — a second input filed for two people; on the schedule its "+ add" is armed and ALL AVAIL tapped in the crew list:
//       it JOINS; ALL tapped next is refused ("This input already has ALL AVAIL").
//   D — (desktop: a right-click is the mouse's way) both named pucks taken off: ALL AVAIL stays, alone.
//   E — the Inputs calendar says the same of both inputs: the bar and the card.
// Not a gate and not the job's walk (that is the FULL check after step 8): it asserts little and a person opens the
// pictures. What it reads off the app it prints, so a picture that missed its target says so.
//
//   npm run build && npx vite preview --port 4186 --strictPort
//   node scripts/handpass/onerule-step3-look.mjs <out dir>
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/onerule-step3-look'
const URL = process.env.LOOK_URL || 'http://localhost:4186/'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { ...devices['iPhone 13'] },
}
const DAY = '2026-07-15', DI = 2
const A = { title: 'Range brief', pick: ['bane', 'pike'] }      // filed WITH ALL AVAIL, in the picker
const C = { title: 'Kit check', pick: ['split', 'rocky'] }      // filed for two; ALL AVAIL put on its row on the schedule
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

const browser = await chromium.launch(launchOptions)
for (const size of Object.keys(SIZES)) {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const press = loc => (size === 'desk' ? loc.click() : loc.tap())
  const shot = name => page.screenshot({ path: join(OUT, `${size}-${name}.png`) })
  const say = (step, what) => console.log(`${size} ${step}: ${what}`)
  const note = async () => (await page.locator('#toastEl').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
  const rec = title => page.evaluate(t => { const r = window.INPUTS.find(x => x.title === t && x.date === 'Jul 15'); return r ? { iid: r.iid, people: (r.people || []).map(e => e.p), type: r.type } : null }, title)
  const rowInfo = iid => page.evaluate(([di, id]) => {
    const g = (window.DAYS[di].ground || []), rows = g.filter(r => r.src === id)
    return { rows: rows.length, who: rows[0] && rows[0].who, more: rows[0] && rows[0].more, ri: g.indexOf(rows[0]) }
  }, [DI, iid])
  const drawnOn = ri => page.evaluate(([di, r]) => [...document.querySelectorAll(`#eWeek [data-slot^="g:${di}.${r}"]`)].filter(e => e.offsetParent && /^g:\d+\.\d+(\.x\d+)?$/.test(e.getAttribute('data-slot')))
    .map(e => (e.getAttribute('data-person') || (e.querySelector('[data-person]') || { getAttribute: () => '' }).getAttribute('data-person') || e.textContent.trim().slice(0, 14))), [DI, ri])
  const openDay = async () => {
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal').waitFor()
    const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
    let d = 2026 * 12 + 6 - await at()
    for (; d > 0; d--) await press(page.locator('#icNext'))
    for (; d < 0; d++) await press(page.locator('#icPrev'))
    await page.waitForSelector(`[data-icday="${DAY}"]`)
    await page.locator(`[data-icday="${DAY}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]')
  }
  const newInput = async pick => {
    await press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop [data-testid="pp-several"]')
    await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
    for (const p of pick) {
      if (await page.locator(`#inpEditPop [data-pp="${p}"]`).getAttribute('aria-pressed') !== 'true') await press(page.locator(`#inpEditPop [data-pp="${p}"]`))
    }
    /* un-pick whoever the window lit that is not wanted (the signed-in admin) */
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!pick.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
  }
  const setTitle = async t => { const el = page.locator('#inpEditPop #inpEditOwnTitle').first(); if (await el.count()) await el.fill(t) }

  await page.goto(URL + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')

  /* A — the picker: the two placeholders among "Several people"; one picked beside two people; filed */
  await openDay()
  await newInput(A.pick)
  const ph = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-ph]')].map(b => ({ id: b.getAttribute('data-ph'), off: b.disabled, on: b.getAttribute('aria-pressed') })))
  say('A the two placeholder pucks', JSON.stringify(ph))
  await page.locator('#inpEditPop [data-ppgroup="ph"]').scrollIntoViewIfNeeded().catch(() => {})
  await shot('1-picker-two-placeholders')
  await press(page.locator('#inpEditPop [data-ph="allavail"]'))
  say('A the count line', JSON.stringify(await page.locator('#inpEditPop [data-testid="pp-count"]').innerText().catch(() => '')))
  await setTitle(A.title)
  await page.locator('#inpEditPop [data-ppgroup="ph"]').scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(200)
  await shot('2-picker-allavail-picked')
  await press(page.locator('#inpEditSave'))
  await page.waitForTimeout(500)
  const a = await rec(A.title)
  say('A filed', JSON.stringify(a))
  if (!a) { say('STOP', 'the input with ALL AVAIL was not filed — the note: ' + await note()); await shot('2x-not-filed'); await ctx.close(); continue }

  /* …and where the input cannot hold one: the kind turned to a leave — the two greyed, the reason under them */
  await newInput(C.pick)
  await page.locator('#inpEditPop #inpEditType').selectOption('LL').catch(async () => { say('A', 'the kind list has no LL — ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#inpEditPop #inpEditType option')].map(o => o.value)))) })
  await page.waitForTimeout(200)
  say('A greyed for a leave', JSON.stringify({
    pucks: await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-ph]')].map(b => ({ id: b.getAttribute('data-ph'), off: b.disabled }))),
    why: await page.locator('#inpEditPop [data-testid="pp-phwhy"]').innerText().catch(() => '(no reason line)'),
  }))
  await page.locator('#inpEditPop [data-ppgroup="ph"]').scrollIntoViewIfNeeded().catch(() => {})
  await shot('3-picker-greyed-for-leave')
  /* back to a meeting, and filed for the two — ALL AVAIL comes to this one on the schedule */
  await page.locator('#inpEditPop #inpEditType').selectOption('Meeting').catch(() => {})
  await setTitle(C.title)
  await press(page.locator('#inpEditSave'))
  await page.waitForTimeout(500)
  const c = await rec(C.title)
  say('C filed', JSON.stringify(c))
  await shot('4-day-two-inputs')

  /* B — the schedule: ONE row, the people A to Z, then ALL AVAIL */
  await page.keyboard.press('Escape')
  await page.evaluate(() => window.go('editsched'))
  await page.locator('#eWeek .day').first().waitFor()
  const ra = await rowInfo(a.iid)
  say('B the row of the input filed with ALL AVAIL', JSON.stringify(ra))
  await page.locator(`#eWeek [data-slot="g:${DI}.${ra.ri}"]`).first().scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(300)
  say('B drawn on the week', JSON.stringify(await drawnOn(ra.ri)))
  await shot('5-week-row-with-allavail')

  /* C — "+ add" armed on the other input's row, ALL AVAIL tapped in the crew list: it joins; ALL next: refused */
  if (c) {
    let rc = await rowInfo(c.iid)
    for (const [id, step] of [['allavail', 'C ALL AVAIL tapped'], ['all', 'C then ALL tapped']]) {
      await page.evaluate(k => window.armSlot(k), `g:${DI}.${rc.ri}.+`).catch(() => {})
      const pk = page.locator(`#eRoster .rpuck[data-person="${id}"]:visible`).first()
      if (await pk.count()) { await pk.scrollIntoViewIfNeeded().catch(() => {}); await press(pk) } else say(step, 'the crew list did not offer ' + id + ' on this size')
      await page.waitForTimeout(500)
      rc = await rowInfo(c.iid)
      say(step, JSON.stringify({ input: (await rec(C.title)).people, row: [rc.who, rc.more], note: await note() }))
      if (id === 'all') await shot('7-week-all-refused')
      else { await page.locator(`#eWeek [data-slot="g:${DI}.${rc.ri}"]`).first().scrollIntoViewIfNeeded().catch(() => {}); await page.waitForTimeout(200); await shot('6-week-allavail-joined') }
      await page.evaluate(() => window.disarmSlot && window.disarmSlot()).catch(() => {})
    }

    /* D — both named pucks taken off by right-click: ALL AVAIL stays, alone; the last puck is then refused */
    if (size === 'desk') {
      for (const p of [...C.pick, 'allavail']) {
        rc = await rowInfo(c.iid)
        const pk = page.locator(`#eWeek [data-slot^="g:${DI}.${rc.ri}"][data-person="${p}"]:visible, #eWeek [data-slot^="g:${DI}.${rc.ri}"] [data-person="${p}"]:visible`).first()
        if (await pk.count()) { await pk.scrollIntoViewIfNeeded().catch(() => {}); await pk.click({ button: 'right' }); await page.waitForTimeout(500) } else say('D', p + ': puck not found on the row')
        say('D ' + p + ' right-clicked off', JSON.stringify({ input: (await rec(C.title)).people, note: await note() }))
      }
      await shot('8-week-allavail-alone')
    }
  }

  /* E — the Inputs calendar says the same */
  await openDay()
  await page.waitForTimeout(300)
  for (const [t, r] of [[A.title, a], [C.title, c]]) if (r) {
    const card = await page.locator(`[data-testid="win-inputsday"] [data-popiid="${r.iid}"]`).first().innerText().catch(() => '(no card found)')
    say('E the card of ' + t, JSON.stringify(card.replace(/\s+/g, ' ').slice(0, 200)))
  }
  await shot('9-day-cards')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  say('E the bars on the month', JSON.stringify(await page.evaluate(day => [...document.querySelectorAll(`[data-icday="${day}"] .ic-bar, [data-icbar]`)].filter(e => e.offsetParent).map(e => e.textContent.trim()).slice(0, 8), DAY)))
  await shot('10-month-bars')

  console.log(size, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors, page errors or failed requests')
  await ctx.close()
}
await browser.close()
