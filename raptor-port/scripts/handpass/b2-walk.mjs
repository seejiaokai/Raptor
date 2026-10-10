// THE HOST'S WALK of "the second batch of the Inputs pages" ([SEEN-BATCH-2]; owner D730, D731 — 10 Oct 26;
// docs/handpass/2026-10-10-batch2-check.md §3, §4). It drives the roll-call's rows through the app's own controls in
// the built bundle: at a desktop, at his PC's 125% scaling, and on a phone by touch; as the admin (Saber) and as the
// member (Ranger), signing out and in through the app's own sign-in (each context is a fresh browser, so its demo world
// is its own; one write is made before any sign-in — the order's §7.7). A PASS is the right behaviour, so a run on a
// later build is the re-walk.
//
//   node scripts/handpass/b2-walk.mjs <out dir> [only]      (LOOK_URL=http://localhost:4173/ by default;
//                                                           `only` = letters of the blocks to run, e.g. "AC")
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-10-batch2-check/host'
const ONLY = (process.argv[3] || '').toUpperCase()
mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const launch = (args = []) => chromium.launch({ ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), args })
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
let bad = 0, n = 0
const errs = []
const say = (ok, name, detail = '') => { n++; if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }
const step = async (name, fn) => { try { const r = await fn(); say(r === undefined ? true : !!r.ok, name, r && r.detail) } catch (e) { say(false, name, String(e.message || e).split('\n').slice(0, 6).join(' | ')) } }
const want = b => !ONLY || ONLY.includes(b)

async function signIn(page, who, pass) {
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
}
async function open(browser, viewport, who = 'ad', pass = 'a', touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await signIn(page, who, pass)
  return { ctx, page }
}
/* the app's own sign-out and sign-in: the page reloads, and the world a write has already saved comes back */
async function swap(page, who, pass, touch = false) {
  await closeWins(page)
  if (touch && !(await page.locator('#logout').isVisible())) { await page.locator('#menuBtn, .hamb, [aria-label="Menu"]').first().tap(); await page.waitForTimeout(250) }
  await page.locator('#logout').click()
  await page.waitForSelector('#luser')
  await signIn(page, who, pass)
}
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') })
const WIN = '[data-testid="win-inputedit"]', DAYWIN = '[data-testid="win-inputsday"]'
const press = (touch, loc) => (touch ? loc.tap() : loc.click())
const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
const ids = p => p.evaluate(() => window.INPUTS.map(r => r.iid))
const fresh = (p, had) => p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, person: r.person, cs: window.PEOPLE[r.person]?.cs, type: r.type, date: r.date, endDate: r.endDate, yr: r.yr, oil: r.oil, grp: r.grp, acc: r.acc, remarks: r.remarks })), had)
const rec = (p, iid) => p.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? { person: r.person, date: r.date, endDate: r.endDate, oil: r.oil, remarks: r.remarks, acc: r.acc } : null }, iid)
const toast = p => p.evaluate(() => (document.getElementById('toastEl')?.textContent || '').trim())
const toastAt = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null; const r = t.getBoundingClientRect(); return { at: t.dataset.at, top: Math.round(r.top), bottom: Math.round(r.bottom), shown: t.style.opacity === '1', text: t.textContent } })
const clearToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.textContent = '' })
const txt = async (p, sel) => ((await p.locator(sel).count()) ? (await p.locator(sel).first().textContent() || '').replace(/\s+/g, ' ').trim() : null)
const at = (p, sel) => p.evaluate(sel => {
  const e = document.querySelector(sel); if (!e) return null
  const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y)
  return { x, y, top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height), reached: !!hit && (hit === e || e.contains(hit)), vh: innerHeight, vw: innerWidth }
}, sel)
async function month(p, y, m, touch) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(touch, p.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  throw new Error('the calendar never reached the month asked for')
}
async function closeWins(p) {
  if (await p.locator('[data-testid="oilconf"]').count()) { await p.locator('[data-testid="oilconf"] .abtn.ghost').click(); await p.waitForTimeout(120) }
  /* an input's window — or, once the page behind it has changed, the same form as the blocking pop-up it becomes there */
  if (await p.locator('#inpEditCancel:visible').count()) { await p.locator('#inpEditCancel').click(); await p.waitForTimeout(150) }
  if (await p.locator(DAYWIN).count()) { await p.locator(DAYWIN + ' .win-x').click(); await p.waitForTimeout(150) }
}
async function toCal(p, y, m, touch) {
  await p.evaluate(() => window.go('inputs'))
  await closeWins(p)
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inCalBtn'))
  await month(p, y, m, touch)
}
async function toList(p, touch, all = true) {
  await p.evaluate(() => window.go('inputs'))
  await closeWins(p)
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inListBtn'))
  if (all) {
    if (!(await p.locator('#inRangePop').count())) await press(touch, p.locator('#inRangeBtn'))
    await press(touch, p.locator('#inRangeAll')); await p.waitForTimeout(250)
  }
}
async function openDay(p, iso, touch) {
  await toCal(p, +iso.slice(0, 4), +iso.slice(5, 7), touch)
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await p.locator(DAYWIN).waitFor()
}
/* a new input through the opened day's "+ Input": its kind, its people (callsigns; more than one = "Several people"),
   a title, remarks — then Add. Returns what the OIL question was headed, if it was asked (it is left OPEN). */
async function fileNew(p, iso, { type, people, title, remarks, touch = false }) {
  await openDay(p, iso, touch)
  await press(touch, p.locator('#icPopAdd'))
  await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', type)
  if (people && people.length > 1) {
    await press(touch, p.locator(`${WIN} [data-testid="pp-several"]`))
    const mine = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    const wantIds = []
    for (const cs of people) wantIds.push(await csId(p, cs))
    for (const id of wantIds) if (!mine.includes(id)) await press(touch, p.locator(`${WIN} [data-pp="${id}"]`))
    for (const id of mine) if (!wantIds.includes(id)) await press(touch, p.locator(`${WIN} [data-pp="${id}"]`))
  } else if (people && people.length === 1) {
    const id = await csId(p, people[0])
    if (await p.locator('#inpEditPerson').count()) await p.selectOption('#inpEditPerson', id)
  }
  if (title != null) await p.fill('#inpEditOwnTitle', title)
  if (remarks != null) await p.fill('#inpEditRmk', remarks)
  await press(touch, p.locator('#inpEditSave'))
  await p.waitForTimeout(350)
  return (await p.locator('[data-testid="oilconf"]').count()) ? txt(p, '[data-testid="oilconf"] .airpop-head b') : null
}
async function answerOil(p, how, touch = false) {
  const sheet = p.locator('[data-testid="oilconf"]')
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await press(touch, (await one.count()) ? one : many)
  await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
  await p.waitForTimeout(300)
}
/* the card of an input in the opened day */
const card = (p, iid) => p.locator(`${DAYWIN} [data-popiid]`).filter({ has: p.locator(`xpath=self::*[@data-popiid]`) }).filter({ hasNot: p.locator('nope') }).locator(`xpath=self::*[contains(@data-testid,"idy-row-")]`).filter({ has: p.locator('[data-testid="idy-open"]') }).nth(0)
async function openCard(p, iso, word, touch = false) {
  await openDay(p, iso, touch)
  const c = p.locator(`${DAYWIN} [data-testid^="idy-row-"]`).filter({ hasText: word }).first()
  await press(touch, c.locator('[data-testid="idy-open"]'))
  await p.locator(WIN).waitFor()
}
/* ══════════════════ A · A DESKTOP: the admin, then the member, then the admin again — the OIL lines ══════════════════ */
if (want('A')) {
  const browser = await launch()
  const { ctx, page } = await open(browser, { width: 1440, height: 900 })
  /* NOT READ HERE: the earned leave on the Leave War. A request's answer earns there only when its day is PUBLISHED
     (D2, D142), so reading it would mean publishing the Saturday twice — a walk of the publishing of OIL, which this
     batch does not touch (the sheet's §6 says what carries that instead). */
  const SAT = '2026-07-18'
  let g = []
  await step('A1 D731 (4)/A8 a Duty on Saturday 18 Jul for Ranger, Ace and Drifter, through "+ Input": ONE question, headed for the group', async () => {
    const had = await ids(page)
    const head = await fileNew(page, SAT, { type: 'Duty', people: ['Ranger', 'Ace', 'Drifter'], remarks: 'range safety' })
    await shot(page, 'A1-group-question')
    await answerOil(page, 'yes')
    g = await fresh(page, had)
    return { ok: head === 'OIL — Ace +2, Duty' && g.length === 3 && g.every(r => r.oil && Object.values(r.oil)[0] > 0), detail: JSON.stringify({ head, g: g.map(r => [r.cs, r.oil]) }) }
  })
  await step('A2 opened by the admin: the OIL line reads as it always did while everyone is alike, with "Change…"', async () => {
    await openCard(page, SAT, 'range safety')
    const line = await txt(page, '#inpEditPop .inped-oilsum'), btn = await page.locator('#inpEditPop [data-testid="oil-revise"]').count()
    await shot(page, 'A2-admin-alike')
    return { ok: /^credited on its non-working day$/.test(line || '') && btn === 1, detail: JSON.stringify({ line, btn }) }
  })
  await step('A3 A8 "Change…" by the admin: the question is headed "Ace +2", as the window’s title is', async () => {
    await page.locator('#inpEditPop [data-testid="oil-revise"]').click()
    const head = await txt(page, '[data-testid="oilconf"] .airpop-head b'), title = await page.locator(WIN).getAttribute('aria-label')
    await shot(page, 'A3-admin-change-heading')
    await page.locator('[data-testid="oilconf"] .abtn.ghost').click()
    return { ok: head === 'OIL — Ace +2, Duty' && /Ace \+2/.test(title || ''), detail: JSON.stringify({ head, title }) }
  })
  await step('A5 A7 Ranger signs in and opens it: read only, the entry’s line has NO "Change…", his own line has one', async () => {
    await swap(page, 'us', 'us')
    await openCard(page, SAT, 'range safety')
    const m = { ro: await txt(page, '[data-testid="inped-ro"]'), line: await txt(page, '#inpEditPop .inped-body .inped-oilsum'), dead: await page.locator('#inpEditPop [data-testid="oil-revise"]').count(),
      own: await txt(page, '.inped-own .inped-oilsum'), ownBtn: await page.locator('[data-testid="oil-revise-own"]').count(), why: await page.locator('#inpEditPop [data-testid="pp-why"]').count() }
    await shot(page, 'A5-member-reads')
    return { ok: !!m.ro && m.line === 'credited on its non-working day' && m.dead === 0 && /^Your OIL: credited/.test(m.own || '') && m.ownBtn === 1 && m.why === 0, detail: JSON.stringify(m) }
  })
  await step('A6 A8 his own "Change…": the question is headed with HIS name alone; he answers No; the note says so', async () => {
    await page.locator('[data-testid="oil-revise-own"]').click()
    const head = await txt(page, '[data-testid="oilconf"] .airpop-head b')
    await shot(page, 'A6-member-own-question')
    await answerOil(page, 'no')
    const note = await toast(page)
    return { ok: head === 'OIL — Ranger, Duty' && note === 'OIL answer saved', detail: JSON.stringify({ head, note }) }
  })
  await step('A7 D731 (4) the entry’s line now COUNTS: "credited for 2 of 3 — Ranger: no" — to Ranger, in the window still open', async () => {
    const line = await txt(page, '#inpEditPop .inped-body .inped-oilsum'), own = await txt(page, '.inped-own .inped-oilsum')
    await shot(page, 'A7-member-counts')
    return { ok: line === 'credited for 2 of 3 — Ranger: no' && /^Your OIL: no OIL/.test(own || ''), detail: JSON.stringify({ line, own }) }
  })
  await step('A8 D731 (4) …and to the admin, whichever card he opens it from; "Change…" is still the one button', async () => {
    await swap(page, 'ad', 'a')
    await openCard(page, SAT, 'range safety')
    const line = await txt(page, '#inpEditPop .inped-oilsum'), btns = await page.locator('#inpEditPop [data-testid="oil-revise"], #inpEditPop [data-testid="oil-answer"]').count()
    await shot(page, 'A8-admin-counts')
    return { ok: line === 'credited for 2 of 3 — Ranger: no' && btns === 1, detail: JSON.stringify({ line, btns }) }
  })
  await step('A10 D731 (7) another answered duty, on Saturday 17 Oct: its bar dragged to Tuesday 20 Oct and back, by a real mouse — the answer is kept, and nobody is asked again', async () => {
    const SAT = '2026-10-17'
    const had0 = await ids(page)
    await fileNew(page, SAT, { type: 'Duty', people: ['Ace', 'Drifter'], remarks: 'october watch' })
    await answerOil(page, 'yes')
    g = await fresh(page, had0)
    await toCal(page, 2026, 10)
    const drag = async (from, to) => {
      const a = await at(page, `#inpCal [data-icday="${from}"]`), b = await at(page, `#inpCal [data-icday="${to}"]`)
      const bar = await page.evaluate(() => { const e = [...document.querySelectorAll('#inpCal [data-iid]')].find(x => /Duty/.test(x.textContent)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + 12, y: r.top + r.height / 2 } })
      if (!bar) return false
      await page.mouse.move(bar.x, bar.y); await page.mouse.down(); await page.mouse.move(bar.x + 6, bar.y + 3, { steps: 3 })
      await page.mouse.move(b.x - (a.x - bar.x), b.y - (a.y - bar.y), { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(400)
      return true
    }
    const one = await drag(SAT, '2026-10-20')
    const away = await rec(page, g[1].iid), asked1 = await page.locator('[data-testid="oilconf"]').count()
    await shot(page, 'A10a-moved-to-tuesday')
    const two = await drag('2026-10-20', SAT)
    const back = await rec(page, g[1].iid), asked2 = await page.locator('[data-testid="oilconf"]').count()
    await shot(page, 'A10b-moved-back')
    await closeWins(page)
    return { ok: one && two && away.date === 'Oct 20' && !!away.oil && away.oil[SAT] > 0 && asked1 === 0 && back.date === 'Oct 17' && asked2 === 0, detail: JSON.stringify({ away, asked1, back, asked2 }) }
  })
  await step('A11 A5 a Duty on Saturday 9 Jan 2027: its question names "9 Jan 2027"; cancelled, the window’s line and the List’s chip say 2027 too', async () => {
    const had = await ids(page)
    const head = await fileNew(page, '2027-01-09', { type: 'Duty', people: ['Ace'], remarks: 'new year watch' })
    const q = await txt(page, '[data-testid="oilconf"] .upconf-h')
    await shot(page, 'A11a-question-2027')
    await answerOil(page, 'no')
    const made = await fresh(page, had)
    await toList(page, false)
    const row = page.locator(`#inBody tr[data-iid="${made[0]?.iid}"]`)
    const chip = await row.locator('[data-oilrev], [data-oilask]').first().evaluate(e => ({ tag: e.tagName, title: e.title, text: e.textContent }))
    await shot(page, 'A11b-list-chip')
    return { ok: /9 Jan 2027/.test(q || '') && chip.tag === 'BUTTON', detail: JSON.stringify({ head, q, chip }) }
  })
  await ctx.close(); await browser.close()
}

/* ══════════════════ B · A DESKTOP: the members' switch, the filer, every door ══════════════════ */
if (want('B')) {
  const browser = await launch()
  const { ctx, page } = await open(browser, { width: 1440, height: 900 }, 'us', 'us')
  const DAY = '2026-10-21'
  let g = []
  await step('B1 Ranger files a Meeting for himself and Echo on Wed 21 Oct (the switch on, as it starts)', async () => {
    const had = await ids(page)
    await fileNew(page, DAY, { type: 'Meeting', people: ['Ranger', 'Echo'], remarks: 'crew sync' })
    g = await fresh(page, had)
    return { ok: g.length === 2, detail: JSON.stringify(g.map(r => r.cs)) }
  })
  await step('B2 THE CONTROL the switch on: his window offers Save, and says nothing about who may change it', async () => {
    await openCard(page, DAY, 'crew sync')
    const m = { ro: await page.locator('[data-testid="inped-ro"]').count(), save: await page.locator('#inpEditSave').count() }
    return { ok: m.ro === 0 && m.save === 1, detail: JSON.stringify(m) }
  })
  await step('B3 the admin turns "members may file for other people" off, behind the gear', async () => {
    await swap(page, 'ad', 'a')
    await toCal(page, 2026, 10)
    await page.locator('#inGear').click()
    const sw = page.locator('[data-testid="iset-memberfile"]')
    const was = await sw.isChecked()
    if (was) await sw.click()
    await shot(page, 'B3-switch-off')
    await page.locator('[data-testid="iset-save"]').click(); await page.waitForTimeout(300)
    return { ok: was === true && (await page.locator('[data-testid="win-inpset"], [data-testid="iset-save"]').count()) === 0, detail: `was ${was}` }
  })
  await step('B4 D731 (8) Ranger opens his own input: "Filing for other people is switched off — an admin can change this." — and "Take me out" is still his', async () => {
    await swap(page, 'us', 'us')
    await openCard(page, DAY, 'crew sync')
    const m = { ro: await txt(page, '[data-testid="inped-ro"]'), out: await page.locator('[data-testid="inped-takeout"]').count(), save: await page.locator('#inpEditSave').count(), del: await page.locator('#inpEditDel').count() }
    await shot(page, 'B4-filer-switch-off')
    return { ok: m.ro === 'Filing for other people is switched off — an admin can change this.' && m.out === 1 && m.save === 0 && m.del === 0, detail: JSON.stringify(m) }
  })
  await step('B5 D731 (8) his bar on the month does not lift (he may not move it for everyone) and nothing moves', async () => {
    await toCal(page, 2026, 10)
    const bar = await page.evaluate(() => { const e = [...document.querySelectorAll('#inpCal [data-iid]')].find(x => /Meeting/.test(x.textContent) && /2/.test(x.textContent)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + 12, y: r.top + r.height / 2 } })
    const to = await at(page, '#inpCal [data-icday="2026-10-23"]')
    await clearToast(page)
    await page.mouse.move(bar.x, bar.y); await page.mouse.down(); await page.mouse.move(bar.x + 8, bar.y + 4, { steps: 3 }); await page.mouse.move(to.x, to.y, { steps: 10 })
    const ghost = await page.locator('.ic-ghost').count()
    await page.mouse.up(); await page.waitForTimeout(300)
    const after = await rec(page, g[0].iid), note = await toast(page)
    await closeWins(page)
    return { ok: after.date === 'Oct 21' && (ghost === 0 || note === 'Filing for other people is switched off — an admin can change this.'), detail: JSON.stringify({ ghost, note, date: after.date }) }
  })
  await step('B6 the Delete key on the day’s line asks him only about HIMSELF ("Take yourself out…"), as the rules already say', async () => {
    await openDay(page, DAY)
    const c = page.locator(`${DAYWIN} [data-testid^="idy-row-"]`).filter({ hasText: 'crew sync' }).first()
    await c.locator('[data-testid="idy-open"]').focus()
    await page.keyboard.press('Delete')
    const q = await txt(page, '[data-testid="idy-ask"] .idy-ask-q')
    await shot(page, 'B6-delete-key')
    await page.locator('[data-testid="idy-del-no"]').click()
    return { ok: q === 'Take yourself out of this input?', detail: String(q) }
  })
  await step('B7 THE CONTROL the admin turns the switch on again: Ranger’s window offers Save again', async () => {
    await swap(page, 'ad', 'a')
    await toCal(page, 2026, 10)
    await page.locator('#inGear').click()
    await page.locator('[data-testid="iset-memberfile"]').click()
    await page.locator('[data-testid="iset-save"]').click(); await page.waitForTimeout(300)
    await swap(page, 'us', 'us')
    await openCard(page, DAY, 'crew sync')
    const m = { ro: await page.locator('[data-testid="inped-ro"]').count(), save: await page.locator('#inpEditSave').count() }
    return { ok: m.ro === 0 && m.save === 1, detail: JSON.stringify(m) }
  })
  await step('B8 A3 Ranger opens another man’s medical input from the List: read only, no yellow box about filing', async () => {
    await toList(page, false)
    await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(250)   // a member's List opens on himself
    const row = page.locator('#inBody tr').filter({ has: page.locator('.intag', { hasText: /^(ATT C|ATT B|OML|HL)$/ }) }).filter({ hasNotText: 'Ranger' }).first()
    await row.locator('[data-testid="in-open"]').click()
    await page.locator(WIN).waitFor()
    const m = { ro: await txt(page, '[data-testid="inped-ro"]'), why: await page.locator('#inpEditPop [data-testid="pp-why"]').count(), title: await page.locator(WIN).getAttribute('aria-label') }
    await shot(page, 'B8-member-reads-medical')
    return { ok: !!m.ro && m.why === 0, detail: JSON.stringify(m) }
  })
  await ctx.close(); await browser.close()
}

/* ══════════════════ C · A DESKTOP, THE ADMIN: the day, the List, the schedule, Quals ══════════════════ */
if (want('C')) {
  const browser = await launch()
  const { ctx, page } = await open(browser, { width: 1440, height: 900 })
  await step('C1 D731 (2) a day whose one input the Person filter hides: "No inputs match on this day." and "Clear filters", on one line', async () => {
    await fileNew(page, '2026-10-22', { type: 'Meeting', people: ['Ace'], remarks: 'filter me' })
    await toCal(page, 2026, 10)
    await page.selectOption('#inFPerson', await csId(page, 'Drifter'))
    await page.locator('#inpCal [data-icday="2026-10-22"]').click({ position: { x: 8, y: 8 } })
    await page.locator(DAYWIN).waitFor()
    const line = await txt(page, '[data-testid="idy-empty"] span'), b = await at(page, '[data-testid="idy-clear"]'), s = await at(page, '[data-testid="idy-empty"] span')
    await shot(page, 'C1-day-filtered')
    await page.locator('[data-testid="idy-clear"]').click()
    const rows = await page.locator(`${DAYWIN} [data-testid^="idy-row-"]`).count(), f = await page.locator('#inFPerson').inputValue()
    await shot(page, 'C1b-day-cleared')
    return { ok: line === 'No inputs match on this day.' && !!b && b.reached && Math.abs((b.top + b.bottom) / 2 - (s.top + s.bottom) / 2) < 12 && rows === 1 && f === 'all', detail: JSON.stringify({ line, b, rows, f }) }
  })
  await step('C2 THE CONTROL a day with no inputs at all, under a filter: "No inputs on this day. Tap + Input to add one." and no "Clear filters"', async () => {
    await toCal(page, 2026, 10)
    await page.selectOption('#inFPerson', await csId(page, 'Drifter'))
    await page.locator('#inpCal [data-icday="2026-10-29"]').click({ position: { x: 8, y: 8 } })
    await page.locator(DAYWIN).waitFor()
    const line = await txt(page, '[data-testid="idy-empty"]'), clear = await page.locator('[data-testid="idy-clear"]').count()
    await closeWins(page)
    await page.selectOption('#inFPerson', 'all')
    return { ok: line === 'No inputs on this day. Tap + Input to add one.' && clear === 0, detail: JSON.stringify({ line, clear }) }
  })
  await step('C3 D731 (9) Escape while a new note is typed: the box goes, nothing is made, the day stays; the next Escape closes the day', async () => {
    await openDay(page, '2026-10-22')
    await page.locator('#icAddPuck').click()
    await page.locator('.ic-newnote .ic-poppuck-edit').fill('half a thought')
    await shot(page, 'C3a-note-typed')
    await page.keyboard.press('Escape')
    const m = { box: await page.locator('.ic-newnote').count(), day: await page.locator(DAYWIN).count(), notes: await page.locator('[data-testid^="idy-note-"]').count() }
    await shot(page, 'C3b-after-escape')
    await page.keyboard.press('Escape')
    const day2 = await page.locator(DAYWIN).count()
    return { ok: m.box === 0 && m.day === 1 && m.notes === 0 && day2 === 0, detail: JSON.stringify({ ...m, day2 }) }
  })
  await step('C4 D731 (9) an existing note being edited: Escape puts its words back; Enter still saves a change', async () => {
    await openDay(page, '2026-10-22')
    await page.locator('#icAddPuck').click()
    await page.locator('.ic-newnote .ic-poppuck-edit').fill('brief the new guy')
    await page.keyboard.press('Enter'); await page.waitForTimeout(200)
    await page.locator('[data-ppedit]').first().click()
    await page.locator('.ic-note .ic-poppuck-edit').fill('changed my mind')
    await page.keyboard.press('Escape'); await page.waitForTimeout(150)
    const kept = await txt(page, '.ic-note .ic-poppuck-txt'), day = await page.locator(DAYWIN).count()
    await page.locator('[data-ppedit]').first().click()
    await page.locator('.ic-note .ic-poppuck-edit').fill('brief the new guy at 0800')
    await page.keyboard.press('Enter'); await page.waitForTimeout(200)
    const saved = await txt(page, '.ic-note .ic-poppuck-txt')
    await shot(page, 'C4-note-edit')
    return { ok: kept === 'brief the new guy' && day === 1 && saved === 'brief the new guy at 0800', detail: JSON.stringify({ kept, day, saved }) }
  })
  await step('C5 D731 (9) the people picker over a new note still takes Escape first, and the day stays (the older rule, unbroken)', async () => {
    await page.locator('#icAddPuck').click()
    await page.locator('.ic-newnote .ic-poppuck-edit').fill('with people')
    await page.locator('#icNewNotePpl').click(); await page.waitForTimeout(200)
    const up = await page.locator('.ic-pick').count()
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    const m = { up, pick: await page.locator('.ic-pick').count(), day: await page.locator(DAYWIN).count() }
    await closeWins(page)
    return { ok: m.up === 1 && m.pick === 0 && m.day === 1, detail: JSON.stringify(m) }
  })
  await step('C6 D731 (11) three days dragged across on the month: the new-input window opens at once, with the three days', async () => {
    await toCal(page, 2026, 10)
    const a = await at(page, '#inpCal [data-icday="2026-10-06"]'), b = await at(page, '#inpCal [data-icday="2026-10-08"]')
    await page.mouse.move(a.x, a.y + 20); await page.mouse.down(); await page.mouse.move(a.x + 10, a.y + 20, { steps: 3 }); await page.mouse.move(b.x, b.y + 20, { steps: 10 }); await page.mouse.up()
    await page.waitForTimeout(300)
    const title = (await page.locator(WIN).count()) ? await page.locator(WIN).getAttribute('aria-label') : null
    await shot(page, 'C6-three-days')
    await closeWins(page)
    return { ok: /New input · Oct 6 → Oct 8/.test(title || ''), detail: String(title) }
  })
  await step('C7 D731 (3)/A6 the List’s dates calendar: two dates tapped and it is still up; Escape closes it; a click outside closes it', async () => {
    await toList(page, false, false)
    await page.locator('#inRangeBtn').click()
    await page.locator('#inRangeCal .rc-d').nth(8).click(); await page.locator('#inRangeCal .rc-d').nth(12).click()
    const still = await page.locator('#inRangePop').count(), label = await txt(page, '#inRangeBtn')
    await shot(page, 'C7a-range-still-open')
    await page.keyboard.press('Escape')
    const esc = await page.locator('#inRangePop').count()
    await page.locator('#inRangeBtn').click()
    await page.mouse.click(900, 600)
    const out = await page.locator('#inRangePop').count()
    return { ok: still === 1 && /→/.test(label || '') && esc === 0 && out === 0, detail: JSON.stringify({ still, label, esc, out }) }
  })
  await step('C8 A6 Escape with the dates calendar AND an input’s window up: the calendar first, the window (and what was typed) next', async () => {
    await toList(page, false)
    await page.locator('#inBody [data-testid="in-open"]').first().click()
    await page.locator(WIN).waitFor()
    await page.locator('#inRangeBtn').click()
    await page.locator('#inpEditRmk').fill('typed, not saved')
    await page.keyboard.press('Escape')
    const m1 = { pop: await page.locator('#inRangePop').count(), win: await page.locator(WIN).count(), val: (await page.locator(WIN).count()) ? await page.locator('#inpEditRmk').inputValue() : null }
    await page.keyboard.press('Escape'); await page.waitForTimeout(150)
    const win2 = await page.locator(WIN).count()
    return { ok: m1.pop === 0 && m1.win === 1 && m1.val === 'typed, not saved' && win2 === 0, detail: JSON.stringify({ ...m1, win2 }) }
  })
  await step('C9 A2 Enter in a new input’s Title box (from the List’s "+ Input"): one input, no second window, its row lit', async () => {
    await toList(page, false)
    const had = await ids(page)
    await page.locator('#inNew').click(); await page.locator(WIN).waitFor()
    await page.selectOption('#inpEditType', 'Event')
    for (let i = 0; i < 6 && !(await page.locator('#inpEdCal [data-cal="2026-10-28"]').count()); i++) await page.locator('#inpEdCal button[aria-label="Next month"]').click()
    await page.locator('#inpEdCal [data-cal="2026-10-28"]').click()
    await page.locator('#inpEditOwnTitle').fill('Sports day')
    await page.locator('#inpEditOwnTitle').press('Enter'); await page.waitForTimeout(500)
    const made = await fresh(page, had), win = await page.locator(WIN).count()
    await shot(page, 'C9-enter-in-title')
    return { ok: made.length === 1 && win === 0, detail: JSON.stringify({ made: made.length, win }) }
  })
  await step('C10 A4 the row’s chips: buttons a Tab reaches, drawn as before (30 high, the app’s typeface, no button face)', async () => {
    await fileNew(page, '2026-10-24', { type: 'Duty', people: ['Ace'], remarks: 'weekend desk' })
    await answerOil(page, 'yes')
    await toList(page, false)
    const row = page.locator('#inBody tr').filter({ hasText: 'weekend desk' }).first()
    await row.locator('[data-testid="in-open"]').focus()
    await page.keyboard.press('Tab')
    const m = await page.evaluate(() => { const e = document.activeElement, r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { tag: e.tagName, oil: e.getAttribute('data-oilrev') != null, h: r.height, bg: cs.backgroundColor, font: cs.fontFamily === getComputedStyle(e.closest('td')).fontFamily, text: e.textContent } })
    await shot(page, 'C10-chip-focused')
    return { ok: m.tag === 'BUTTON' && m.oil && m.h === 30 && m.bg === 'rgba(0, 0, 0, 0)' && m.font && m.text === 'OIL', detail: JSON.stringify(m) }
  })
  await step('C11 A10 a meeting’s window, new dates tapped in it; its bar dragged a week on behind it — the note names both; the drag UNDONE — the note goes, his dates stay; REDONE — it is back (Astra 12)', async () => {
    const had = await ids(page)
    await fileNew(page, '2026-10-12', { type: 'Meeting', people: ['Drifter'], remarks: 'clash me' })
    await page.waitForTimeout(300); await closeWins(page)
    const made = await fresh(page, had)
    await toCal(page, 2026, 10)
    await page.locator(`#inpCal [data-iid="${made[0].iid}"]`).first().click(); await page.locator(WIN).waitFor()
    await page.locator('#inpEdCal [data-cal="2026-10-14"]').click(); await page.locator('#inpEdCal [data-cal="2026-10-15"]').click()
    /* the window may stand over the month: it is dragged clear by its bar, as a person would */
    const wb = await at(page, `${WIN} .win-bar .win-ttl`)
    await page.mouse.move(wb.x, wb.y); await page.mouse.down(); await page.mouse.move(1230, 110, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(200)
    const a = await page.evaluate(iid => { const e = document.querySelector(`#inpCal [data-iid="${iid}"]`); const r = e.getBoundingClientRect(); return { x: r.left + 12, y: r.top + r.height / 2 } }, made[0].iid)
    const from = await at(page, '#inpCal [data-icday="2026-10-12"]'), to = await at(page, '#inpCal [data-icday="2026-10-19"]')
    await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + 6, a.y + 3, { steps: 3 }); await page.mouse.move(a.x + (to.x - from.x), a.y + (to.y - from.y), { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(500)
    const moved = await rec(page, made[0].iid), note1 = await txt(page, '[data-testid="inped-clash"]')
    await shot(page, 'C11a-clash-after-drag')
    await page.locator('#undoBtn').click(); await page.waitForTimeout(500)
    const back = await rec(page, made[0].iid), note2 = await page.locator('[data-testid="inped-clash"]').count(), read = await txt(page, '#inpEditPop .rc-read')
    await shot(page, 'C11b-after-undo')
    await page.locator('#redoBtn').click(); await page.waitForTimeout(500)
    const again = await rec(page, made[0].iid), note3 = await txt(page, '[data-testid="inped-clash"]')
    await shot(page, 'C11c-after-redo')
    await closeWins(page)
    return { ok: moved.date === 'Oct 19' && /start date — theirs 19 Oct, yours 14 Oct/.test(note1 || '') && back.date === 'Oct 12' && note2 === 0 && /Oct 14 → Oct 15/.test(read || '') && again.date === 'Oct 19' && /theirs 19 Oct/.test(note3 || ''), detail: JSON.stringify({ moved: moved.date, note1, back: back.date, note2, read, again: again.date, note3 }) }
  })
  await step('C12 D731 (5) the Scheduler Board, Wednesday: Ranger’s "Sports day" on the ground programme is taken off — the note names it; accepted again; under Unavailable and out again', async () => {
    const had = await ids(page)
    await openDay(page, '2026-07-15')
    await page.locator('#icPopAdd').click(); await page.locator(WIN).waitFor()
    await page.selectOption('#inpEditType', 'Event')
    await page.selectOption('#inpEditPerson', await csId(page, 'Ranger'))
    await page.locator('#inpEditOwnTitle').fill('Sports day')
    await page.locator('#inpEditSave').click(); await page.waitForTimeout(400)
    await closeWins(page)
    const made = await fresh(page, had)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500)
    await page.locator('#eWeek [data-sbday="2"]:visible').first().click(); await page.locator('#schedBoard').waitFor(); await page.waitForTimeout(500)
    const rows = () => page.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow, #schedBoard .pinp .sbi-row').length)
    if (!(await rows()) && await page.locator('#schedBoard [data-pitog="2"]:visible').count()) { await page.locator('#schedBoard [data-pitog="2"]:visible').first().click(); await page.waitForTimeout(400) }
    const out = { before: made.map(r => r.acc), made: made.length }
    /* the control of THIS request: its key rides the button (data-acck) */
    const key = await page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); const b = [...document.querySelectorAll('#schedBoard [data-acck]')].find(e => e.offsetParent && /Sports day/.test((e.closest('.sb-arow, .sbi-row, .sb-row, tr, li, div') || e).parentElement.textContent)); return b ? b.getAttribute('data-acck') : (r ? r.iid : null) }, made[0].iid)
    out.key = key
    const ctl = dest => page.locator(`#schedBoard [data-acc="${dest}"][data-acck="${key}"]:visible`).first()
    if (!(await ctl('x').count())) { await shot(page, 'C12-no-control'); return { ok: false, detail: 'no take-off control for Sports day on the board: ' + JSON.stringify(out) } }
    await ctl('x').click(); await page.waitForTimeout(300)
    out.off = await toast(page)
    await shot(page, 'C12a-board-taken-off')
    if (await ctl('g').count()) { await ctl('g').click(); await page.waitForTimeout(300); out.on = await toast(page) }
    if (await ctl('x').count()) { await ctl('x').click(); await page.waitForTimeout(300) }
    if (await ctl('u').count()) { await ctl('u').click(); await page.waitForTimeout(300); out.un = await toast(page); if (await ctl('x').count()) { await ctl('x').click(); await page.waitForTimeout(300); out.unOff = await toast(page) } }
    await shot(page, 'C12b-board-out-of-unavailable')
    const x = page.locator('#schedBoard').getByRole('button', { name: /Close|Done/ }).first()
    if (await x.count()) await x.click(); else await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    return { ok: out.off === "Ranger's Sports day taken off the programme" && (!out.on || /Ranger's Sports day (added to the ground programme|is on the ground programme again)/.test(out.on)) && (!out.un || out.unOff === "Ranger's Sports day taken out of Unavailable"), detail: JSON.stringify(out) }
  })
  await step('C13 A9 Quals: Enable editing, Save changes — the note says "Quals saved" and nothing more', async () => {
    await page.evaluate(() => window.go('quals')); await page.waitForTimeout(400)
    await page.locator('#qEdit').click(); await page.locator('#qSave').click(); await page.waitForTimeout(200)
    const note = await toast(page)
    await shot(page, 'C13-quals-saved')
    return { ok: note === 'Quals saved', detail: note }
  })
  await step('C14 D731 (10) the viewer of an input with two documents (1440 × 900): "Edit input" and "Close" in sight, the page scrolling above them', async () => {
    const pdf = w => Buffer.from(`%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 400]>>endobj\n% ${w}\ntrailer<</Root 1 0 R>>\n%%EOF`)
    await toList(page, false)
    await page.locator('#inNew').click(); await page.locator(WIN).waitFor()
    await page.selectOption('#inpEditType', 'ATT C')
    for (let i = 0; i < 6 && !(await page.locator('#inpEdCal [data-cal="2026-10-26"]').count()); i++) await page.locator('#inpEdCal button[aria-label="Next month"]').click()
    await page.locator('#inpEdCal [data-cal="2026-10-26"]').click()
    await page.locator(`${WIN} .docfield input[type=file]`).first().setInputFiles([{ name: 'cert-one.pdf', mimeType: 'application/pdf', buffer: pdf('one') }, { name: 'cert-two.pdf', mimeType: 'application/pdf', buffer: pdf('two') }])
    await page.waitForTimeout(500)
    await page.locator('#inpEditRmk').fill('two papers')
    await page.locator('#inpEditSave').click(); await page.waitForTimeout(500)
    await closeWins(page)
    const row = page.locator('#inBody tr').filter({ hasText: 'two papers' }).first()
    await row.locator('.rclip').click(); await page.waitForTimeout(400)
    const done = await at(page, '#docViewDone'), edit = await at(page, '#docViewEdit'), bx = await at(page, '#docViewPop .docviewbox'), count = await txt(page, '.docview-count')
    await shot(page, 'C14-viewer-two-docs')
    await page.locator('#docViewDone').click()
    return { ok: count === '1 of 2' && done.reached && edit.reached && done.bottom <= bx.bottom && edit.bottom <= bx.bottom, detail: JSON.stringify({ count, done: [done.top, done.bottom, done.reached], box: [bx.top, bx.bottom] }) }
  })
  await ctx.close(); await browser.close()
}

/* ══════════════════ D · HIS PC: A DESKTOP STARTED AT 125% (1536 × 864 of page) — what could run off ══════════════════ */
if (want('D')) {
  const browser = await launch(['--force-device-scale-factor=1.25'])
  const { ctx, page } = await open(browser, { width: 1536, height: 864 })
  await step('D1 D731 (10) at 125%: the viewer of the demo’s own medical document — its buttons inside the box and reached', async () => {
    await toList(page, false)
    const n = await page.locator('#inBody .rclip').count()
    if (!n) return { ok: false, detail: 'the demo carries no document on the List' }
    await page.locator('#inBody .rclip').first().click(); await page.waitForTimeout(400)
    const done = await at(page, '#docViewDone'), bx = await at(page, '#docViewPop .docviewbox')
    await shot(page, 'D1-viewer-125')
    await page.locator('#docViewDone').click()
    return { ok: done.reached && done.bottom <= bx.bottom && bx.bottom <= done.vh, detail: JSON.stringify({ done: [done.top, done.bottom], box: [bx.top, bx.bottom], vh: done.vh }) }
  })
  await step('D2 D731 (3) at 125%: the List’s dates calendar keeps its small desktop days and stays on the screen', async () => {
    await toList(page, false, false)
    await page.locator('#inRangeBtn').click()
    const d = await at(page, '#inRangeCal .rc-d'), pop = await at(page, '#inRangePop')
    await shot(page, 'D2-range-125')
    await page.keyboard.press('Escape')
    return { ok: d.h < 26 && pop.bottom <= pop.vh && pop.right <= pop.vw, detail: JSON.stringify({ day: d.h, pop: [pop.top, pop.bottom], vh: pop.vh }) }
  })
  await step('D3 A4 at 125%: a row with a chip measures exactly as it does with a <span> put in the button’s place (the look it had)', async () => {
    await fileNew(page, '2026-10-24', { type: 'Duty', people: ['Ace'], remarks: 'weekend desk' })
    await answerOil(page, 'yes')
    await toList(page, false)
    await shot(page, 'D3-list-125')
    const m = await page.evaluate(() => {
      const row = [...document.querySelectorAll('#inBody tr')].find(r => r.querySelector('.inact button.roil'))
      if (!row) return null
      const btn = row.querySelector('.inact button.roil'), a = btn.getBoundingClientRect(), rowA = row.getBoundingClientRect().height, csA = getComputedStyle(btn)
      const was = { w: a.width, h: a.height, color: csA.color, border: csA.borderTopColor, font: csA.fontFamily, size: csA.fontSize, pad: csA.paddingLeft }
      const span = document.createElement('span'); span.className = btn.className; span.textContent = btn.textContent
      btn.replaceWith(span)
      const b = span.getBoundingClientRect(), csB = getComputedStyle(span)
      const now = { w: b.width, h: b.height, color: csB.color, border: csB.borderTopColor, font: csB.fontFamily, size: csB.fontSize, pad: csB.paddingLeft }
      const rowB = row.getBoundingClientRect().height
      span.replaceWith(btn)
      return { was, now, rowA, rowB }
    })
    return { ok: !!m && JSON.stringify(m.was) === JSON.stringify(m.now) && m.rowA === m.rowB, detail: JSON.stringify(m) }
  })
  await ctx.close(); await browser.close()
}

/* ══════════════════ E · A PHONE (390 × 844), BY TOUCH: the admin ══════════════════ */
if (want('E')) {
  const browser = await launch()
  const { ctx, page } = await open(browser, { width: 390, height: 844 }, 'ad', 'a', true)
  const T = true
  await step('E1 D731 (1) a note said with an input’s window up is at the TOP, clear of Cancel and Add', async () => {
    await toList(page, T)
    await page.locator('#inNew').tap(); await page.locator(WIN).waitFor()
    await page.locator('#inpEditSave').tap(); await page.waitForTimeout(250)
    const n = await toastAt(page), c = await at(page, '#inpEditCancel'), s = await at(page, '#inpEditSave')
    await shot(page, 'E1-phone-note-top')
    return { ok: n.at === 'top' && n.top >= 0 && n.bottom < c.top && c.reached && s.reached, detail: JSON.stringify({ n, cancel: [c.top, c.bottom] }) }
  })
  await step('E2 D731 (1) "Input added" after a save from the opened day: at the top while the day’s window is still up', async () => {
    await closeWins(page)
    await openDay(page, '2026-10-21', T)
    await page.locator('#icPopAdd').tap(); await page.locator(WIN).waitFor()
    await page.locator('#inpEditRmk').fill('from the phone')
    await page.locator('#inpEditSave').tap(); await page.waitForTimeout(350)
    const n = await toastAt(page), day = await page.locator(DAYWIN).count(), add = await at(page, '#icPopAdd')
    await shot(page, 'E2-phone-added-note-top')
    return { ok: /Input added/.test(n.text) && n.at === 'top' && day === 1 && n.bottom <= add.top + 60, detail: JSON.stringify({ n, day }) }
  })
  await step('E3 D731 (1) THE CONTROL with every window closed the next note is at the foot again', async () => {
    await closeWins(page)
    await toList(page, T)
    await page.evaluate(() => window.toast('a note with no window up'))
    const n = await toastAt(page)
    await shot(page, 'E3-phone-note-foot')
    return { ok: n.at === 'foot' && 844 - n.bottom < 40, detail: JSON.stringify(n) }
  })
  await step('E4 D731 (12) the List’s dates calendar: days a finger’s size, the calendar as wide as its pop-up, all on the screen; a finger picks two dates and it stays', async () => {
    await toList(page, T, false)
    await page.locator('#inRangeBtn').tap()
    const d = await at(page, '#inRangeCal .rc-d'), cal = await at(page, '#inRangeCal'), pop = await at(page, '#inRangePop')
    await shot(page, 'E4a-phone-range-844')
    const d1 = await page.evaluate(() => { const e = document.querySelectorAll('#inRangePop .rc-d')[8], r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    const d2 = await page.evaluate(() => { const e = document.querySelectorAll('#inRangePop .rc-d')[12], r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    await page.touchscreen.tap(d1.x, d1.y); await page.touchscreen.tap(d2.x, d2.y); await page.waitForTimeout(200)
    const still = await page.locator('#inRangePop').count(), label = await txt(page, '#inRangeBtn')
    await shot(page, 'E4b-phone-range-picked')
    /* a finger on the list behind it closes it */
    await page.touchscreen.tap(195, 800); await page.waitForTimeout(200)
    const out = await page.locator('#inRangePop').count()
    return { ok: d.h >= 32 && d.w >= 40 && cal.w >= pop.w - 24 && pop.bottom <= 844 && still === 1 && /→/.test(label || '') && out === 0, detail: JSON.stringify({ day: [d.w, d.h], cal: cal.w, pop: [pop.w, pop.top, pop.bottom], still, label, out }) }
  })
  await step('E5 D731 (2) on the phone: the filtered day’s line and its "Clear filters", a finger’s target', async () => {
    await toCal(page, 2026, 10, T)
    await page.locator('#inFiltersBtn').tap()
    await page.selectOption('#inFPerson', await csId(page, 'Drifter'))
    await page.locator('#inpCal [data-icday="2026-10-21"]').tap({ position: { x: 8, y: 8 } }); await page.locator(DAYWIN).waitFor()
    const line = await txt(page, '[data-testid="idy-empty"] span'), b = await at(page, '[data-testid="idy-clear"]')
    await shot(page, 'E5-phone-day-filtered')
    await page.touchscreen.tap(b.x, b.y); await page.waitForTimeout(250)
    const rows = await page.locator(`${DAYWIN} [data-testid^="idy-row-"]`).count()
    return { ok: line === 'No inputs match on this day.' && b.reached && b.h >= 44 && rows >= 1, detail: JSON.stringify({ line, b: [b.w, b.h], rows }) }
  })
  await step('E6 A1 a saved input’s window with typing in it; the day’s bar tapped, then another card: the question is in FRONT and "Keep editing" answers it', async () => {
    await closeWins(page)
    await fileNew(page, '2026-10-21', { type: 'Meeting', remarks: 'second card', touch: T })
    await page.waitForTimeout(300); await closeWins(page)
    await openCard(page, '2026-10-21', 'from the phone', T)
    await page.locator('#inpEditRmk').fill('typed, not saved')
    const shows = sel => page.evaluate(sel => { for (const c of [...document.querySelectorAll(sel)]) { const r = c.getBoundingClientRect(); for (const y of [r.top + 5, r.top + r.height / 2, r.bottom - 5]) { const x = r.left + r.width / 3, hit = document.elementFromPoint(x, y); if (hit && c.contains(hit)) return { x, y } } } return null }, sel)
    const other = `${DAYWIN} [data-testid^="idy-row-"]`
    const pickOther = () => page.evaluate(sel => { for (const c of [...document.querySelectorAll(sel)]) { if (!/second card/.test(c.textContent)) continue; const o = c.querySelector('[data-testid="idy-open"]'), r = o.getBoundingClientRect(); for (const y of [r.top + 5, r.top + r.height / 2, r.bottom - 5]) { const x = r.left + r.width / 3, hit = document.elementFromPoint(x, y); if (hit && o.contains(hit)) return { x, y } } } return null }, other)
    let pt = await pickOther(), viaBar = false
    if (!pt) { const bar = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); for (const y of [r.top + 6, r.top + 10, r.top + 14, r.top + 18]) for (const x of [r.left + 70, r.left + 120, r.left + 30]) { const hit = document.elementFromPoint(x, y); if (hit && e.contains(hit) && !hit.closest('.win-x, .win-tools')) return { x, y } } return null }, `${DAYWIN} .win-bar`); if (!bar) { await shot(page, 'E6-dbg'); return { ok: false, detail: 'neither a card nor the day’s bar shows beside the input’s window ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.floatwin')].map(w => { const r = w.getBoundingClientRect(); return [w.getAttribute('data-testid'), Math.round(r.top), Math.round(r.bottom), w.className] }))) } } await page.touchscreen.tap(bar.x, bar.y); await page.waitForTimeout(300); viaBar = true; pt = await pickOther() }
    if (!pt) return { ok: false, detail: 'the other card cannot be reached by a finger' }
    await shot(page, 'E6a-phone-day-in-front')
    await page.touchscreen.tap(pt.x, pt.y); await page.waitForTimeout(300)
    const q = await page.locator('[data-testid="inped-swap"]').count(), front = /\bfront\b/.test(await page.locator(WIN).getAttribute('class') || ''), keep = await at(page, '[data-testid="inped-swap-stay"]')
    await shot(page, 'E6b-phone-question-in-front')
    if (keep && keep.reached) await page.touchscreen.tap(keep.x, keep.y)
    await page.waitForTimeout(200)
    const val = await page.locator('#inpEditRmk').inputValue()
    return { ok: q === 1 && front && !!keep && keep.reached && val === 'typed, not saved', detail: JSON.stringify({ viaBar, q, front, keep: keep && [keep.top, keep.bottom, keep.reached], val }) }
  })
  await step('E7 D731 (10) on the phone: the viewer of a document — "Close" in sight and reached', async () => {
    await closeWins(page)
    await toList(page, T)
    const docCard = await page.evaluate(() => { const r = window.INPUTS.find(x => (x.docIds && x.docIds.length) || x.docId); return r ? r.iid : null })
    if (!docCard) return { ok: false, detail: 'the demo carries no document' }
    await page.evaluate(iid => { const e = document.querySelector(`#inList [data-iid="${iid}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, docCard)
    await page.locator(`#inList [data-iid="${docCard}"] [data-testid="inl-open"]`).tap(); await page.locator(WIN).waitFor()
    await page.locator('[data-testid="inped-docview"]').tap(); await page.waitForTimeout(400)
    const done = await at(page, '#docViewDone'), bx = await at(page, '#docViewPop .docviewbox')
    await shot(page, 'E7-phone-viewer')
    await page.locator('#docViewDone').tap()
    return { ok: !!done && done.reached && done.bottom <= Math.min(bx.bottom, 844), detail: JSON.stringify({ done: done && [done.top, done.bottom, done.reached], box: bx && [bx.top, bx.bottom] }) }
  })
  await step('E8 D731 (1) another window of the same shell — the Inputs calendar settings: a note said while it is up is at the top too', async () => {
    await closeWins(page)
    await toCal(page, 2026, 10, T)
    await page.locator('#inGear').tap(); await page.waitForTimeout(300)
    const up = await page.locator('.floatwin').count()
    await page.evaluate(() => window.toast('a note with the settings window up'))
    const n = await toastAt(page), save = await at(page, '[data-testid="iset-save"]')
    await shot(page, 'E8-phone-settings-note-top')
    await page.locator('[data-testid="iset-cancel"]').tap()
    return { ok: up === 1 && n.at === 'top' && !!save && n.bottom < save.top, detail: JSON.stringify({ up, n, save: save && [save.top, save.bottom] }) }
  })
  await ctx.close(); await browser.close()
}

/* ══════════════════ F · A SHORT PHONE (390 × 568), BY TOUCH ══════════════════ */
if (want('F')) {
  const browser = await launch()
  const { ctx, page } = await open(browser, { width: 390, height: 568 }, 'ad', 'a', true)
  await step('F1 D731 (12) at 568 tall: the dates calendar — finger-size days — and its two quick buttons and an admin’s "Default window" all on the screen', async () => {
    await toList(page, true, false)
    await page.locator('#inRangeBtn').tap()
    const d = await at(page, '#inRangeCal .rc-d'), pop = await at(page, '#inRangePop'), all = await at(page, '#inRangeAll'), cfg = await at(page, '#inRangeEdit')
    await shot(page, 'F1-phone-range-568')
    return { ok: d.h >= 32 && pop.bottom <= 568 && all.reached && !!cfg && cfg.reached, detail: JSON.stringify({ day: [d.w, d.h], pop: [pop.top, pop.bottom], all: all.bottom, cfg: cfg && cfg.bottom }) }
  })
  await step('F1b D731 (12) at 568 tall, a SIX-week month (Aug 2026), "Default window" opened too: the dates and both quick buttons are on the screen; what runs past the foot is reached by scrolling the page (Astra 39)', async () => {
    for (let i = 0; i < 12; i++) { const mon = await txt(page, '#inRangeCal .rc-mon'); if (/Aug 2026/i.test(mon || '')) break; await page.locator(`#inRangeCal button[aria-label="${/(Sep|Oct|Nov|Dec) 2026/i.test(mon || '') ? 'Previous' : 'Next'} month"]`).tap() }
    const rows = await page.evaluate(() => Math.ceil(document.querySelectorAll('#inRangeCal .rc-grid > *').length / 7))
    const last = await page.evaluate(() => { const d = [...document.querySelectorAll('#inRangeCal .rc-d')].pop(), r = d.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { bottom: Math.round(r.bottom), reached: hit === d } })
    const all = await at(page, '#inRangeAll'), cfg0 = await at(page, '#inRangeEdit')
    await page.locator('#inRangeEdit').scrollIntoViewIfNeeded(); await page.waitForTimeout(150)
    const cfg1 = await at(page, '#inRangeEdit')
    await page.touchscreen.tap(cfg1.x, cfg1.y); await page.waitForTimeout(200)
    const save = await page.locator('#inLookSave').count()
    await page.locator('#inLookSave').scrollIntoViewIfNeeded(); await page.waitForTimeout(150)
    const sv = await at(page, '#inLookSave'), wide = await page.evaluate(() => document.documentElement.scrollWidth)
    await shot(page, 'F1b-phone-range-568-six-weeks')
    await page.touchscreen.tap((await at(page, '#inLookCancel')).x, (await at(page, '#inLookCancel')).y)
    await page.evaluate(() => scrollTo(0, 0))
    return { ok: rows === 6 && last.reached && last.bottom <= 568 && all.reached && all.bottom <= 568 && cfg1.reached && save === 1 && sv.reached && wide <= 390, detail: JSON.stringify({ rows, last, all: all.bottom, cfgBefore: cfg0 && [cfg0.bottom, cfg0.reached], cfgAfterScroll: [cfg1.bottom, cfg1.reached], save: [sv.bottom, sv.reached], wide }) }
  })
  await step('F2 D731 (1) at 568 tall: the note at the top with a window up', async () => {
    await page.touchscreen.tap(195, 540); await page.waitForTimeout(150)
    await toList(page, true)
    await page.locator('#inNew').tap(); await page.locator(WIN).waitFor()
    await page.locator('#inpEditSave').tap(); await page.waitForTimeout(250)
    const n = await toastAt(page), c = await at(page, '#inpEditCancel')
    await shot(page, 'F2-phone-note-top-568')
    return { ok: n.at === 'top' && n.bottom < c.top, detail: JSON.stringify({ n, cancel: [c.top, c.bottom] }) }
  })
  await ctx.close(); await browser.close()
}

console.log(`\n${n - bad} of ${n} steps as they should be${bad ? ` — ${bad} NOT` : ''}`)
console.log(errs.length ? 'ERRORS SEEN:\n  ' + [...new Set(errs)].join('\n  ') : 'no console error, page error or failed request')
process.exit(bad ? 1 : 0)
