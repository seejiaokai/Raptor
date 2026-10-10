// THE HOST'S OWN WALK of "an input's own title" ([INPUT-OWN-TITLE]; owner D715, D716, D717 — 9 Oct 26;
// docs/handpass/2026-10-09-input-title-check.md §3, §5). It drives the roll-call's rows through the app's own controls in
// the built bundle — every door that writes a title, every screen that draws an input's name, at a desktop and a phone,
// as the admin and as a member. A PASS is the right behaviour, so a run on a later build is the re-walk. The publication
// orders, the rule words and the roles' full matrix are the walkers' shares (Astra's scenarios); this is the "is it
// drawn, can it be pressed, does it sit where the drawing put it" pass.
//
//   node scripts/handpass/it-host-walk.mjs <out dir>          (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-09-input-title-check/host'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
let bad = 0, n = 0
const errs = []
const say = (ok, name, detail = '') => { n++; if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }
const step = async (name, fn) => { try { const r = await fn(); say(r === undefined ? true : !!r.ok, name, r && r.detail) } catch (e) { say(false, name, String(e.message || e).split('\n').slice(0, 7).join(' ⏎ ').slice(0, 600)) } }

async function open(viewport, who = 'ad', pass = 'a', touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  await page.goto(URL)
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  return { ctx, page }
}
async function month(p, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  throw new Error('the calendar never reached the month asked for')
}
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') })
const elShot = (p, sel, name) => p.locator(sel).first().screenshot({ path: join(OUT, name + '.png') })
const win = p => p.locator('[data-testid="win-inputedit"]')
const DAYWIN = '[data-testid="win-inputsday"]'
const press = (p, loc, touch) => touch ? loc.tap() : loc.click()
const recBy = (p, f) => p.evaluate(f => { const r = window.INPUTS.find(x => Object.keys(f).every(k => x[k] === f[k])); return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, acc: r.acc, hasTitle: 'title' in r } : null }, f)
const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

/* the month's own "+ Input" on a day, up to the open window */
async function openNew(p, iso, touch = false) {
  await p.evaluate(() => window.go('inputs'))
  const [y, m] = iso.split('-').map(Number)
  await month(p, y, m)
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await press(p, p.locator('#icPopAdd'), touch)
  await win(p).waitFor()
}
async function saveWin(p, oil, touch = false) {
  await press(p, p.locator('#inpEditSave'), touch)
  const sheet = p.locator('[data-testid="oilconf"]')
  let head = ''
  if (await sheet.waitFor({ timeout: oil ? 4000 : 800 }).then(() => true, () => false)) {
    head = (await sheet.locator('.airpop-head').innerText()).replace(/\s+/g, ' ').trim()
    await press(p, sheet.locator(`[data-testid="oil-${oil || 'no'}"]`), touch); await press(p, sheet.locator('[data-testid="oilconf-save"]'), touch)
  }
  await p.waitForTimeout(350)
  return head
}
async function closeBoard(p) {
  if (!(await p.locator('#schedBoard').count())) return
  const x = p.locator('#schedBoard').getByRole('button', { name: /Close|Done/ }).first()
  if (await x.count()) { await x.click(); await p.waitForTimeout(500) } else { await p.keyboard.press('Escape'); await p.waitForTimeout(400) }
}
async function openBoard(p, di) {
  await closeBoard(p)
  await p.evaluate(() => window.go('editsched'))
  await p.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await p.waitForSelector('#schedBoard'); await p.waitForTimeout(500)
}
/* the week's Ground Programme row of an input, by the row's printed name */
const weekRow = async (p, root, name) => {
  const found = await p.evaluate(({ root, name }) => {
    const r = [...document.querySelectorAll(`${root} .pl-row.gr-frominput`)].find(x => (x.querySelector(':scope > .nm .ntx')?.textContent || '').trim() === name)
    if (!r) return false
    const wk = document.querySelector(root), day = r.closest('.day')
    if (wk && day && wk.scrollWidth > wk.clientWidth + 4) wk.scrollLeft += day.getBoundingClientRect().left - wk.getBoundingClientRect().left - 6
    r.scrollIntoView({ block: 'center' })
    return true
  }, { root, name })
  if (!found) return null
  await p.waitForTimeout(450)
  return weekRowAt(p, root, name)
}
const weekRowAt = (p, root, name) => p.evaluate(({ root, name }) => {
  const r = [...document.querySelectorAll(`${root} .pl-row.gr-frominput`)].find(x => (x.querySelector(':scope > .nm .ntx')?.textContent || '').trim() === name)
  if (!r) return null
  const nm = r.querySelector(':scope > .nm'), ntx = nm.querySelector('.ntx'), tag = nm.querySelector('.nm-kind')
  const b = x => { const q = x.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), b: Math.round(q.bottom), r: Math.round(q.right) } }
  return { row: b(r), name: b(ntx), tag: tag ? { ...b(tag), text: tag.textContent, shown: getComputedStyle(tag).textTransform, inName: ntx.contains(tag), editable: tag.isContentEditable } : null, text: ntx.textContent }
}, { root, name })

/* ============================================================== a desktop, the admin (Saber) */
{
  const { ctx, page } = await open({ width: 1440, height: 900 })
  const ranger = await csId(page, 'Ranger')
  let S = null, M = null

  await step('T1 the window: a Title box straight under Type for a commitment, filled with the kind’s name; none for a leave', async () => {
    await openNew(page, '2026-07-18')
    const seen = {}
    for (const t of ['Event', 'Meeting', 'Other', 'OD', 'LL', 'OML']) {
      await page.selectOption('#inpEditType', t)
      seen[t] = (await page.locator('#inpEditOwnTitle').count()) ? await page.inputValue('#inpEditOwnTitle') : null
    }
    await page.selectOption('#inpEditType', 'Event')
    const order = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-f .inped-k')].map(k => k.textContent))
    await elShot(page, '[data-testid="win-inputedit"]', 't1-window-title-box')
    const ok = seen.Event === 'Event' && seen.Meeting === 'Meeting' && seen.Other === 'Other' && seen.OD === 'OD' && seen.LL === null && seen.OML === null
      && order.indexOf('Title') === order.indexOf('Type') + 1
    return { ok, detail: `${JSON.stringify(seen)} · rows: ${order.join(' › ')}` }
  })
  await step('T2 typed over, an emptied box stays empty (its hint says the kind); a kind changed to Duty keeps the typed title', async () => {
    await page.fill('#inpEditOwnTitle', '')
    const empty = await page.inputValue('#inpEditOwnTitle'), hint = await page.getAttribute('#inpEditOwnTitle', 'placeholder')
    await page.fill('#inpEditOwnTitle', 'Sports day')
    await page.selectOption('#inpEditType', 'Duty')
    const kept = await page.inputValue('#inpEditOwnTitle')
    await page.selectOption('#inpEditType', 'Event')
    return { ok: empty === '' && hint === 'Event' && kept === 'Sports day', detail: `emptied "${empty}" hint "${hint}" · after Duty "${kept}"` }
  })
  await step('T3 a Saturday Event for ALL AVAIL titled "Sports day": the OIL question is headed by the title; ONE record carries the title', async () => {
    await page.selectOption('#inpEditPerson', 'allavail')
    await page.fill('#inpEditRmk', 'bring boots')
    const head = await saveWin(page, 'yes')
    S = await recBy(page, { person: 'allavail', type: 'Event', date: 'Jul 18' })
    await shot(page, 't3-after-save')
    return { ok: !!S && S.title === 'Sports day' && S.remarks === 'bring boots' && /Sports day/.test(head) && !/Event/.test(head), detail: `question "${head}" → ${JSON.stringify(S)}` }
  })
  await step('T4 the month: its bar reads "ALL AVAIL · Sports day"; its tip says the title AND the kind', async () => {
    if (await page.locator(DAYWIN).count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
    const bar = page.locator(`#inpCal .ib-bar[data-iid="${S.iid}"]`)
    const text = (await bar.innerText()).replace(/\s+/g, ' '), tip = (await bar.getAttribute('title') || '').split('\n')[0]
    await elShot(page, `#inpCal .ib-bar[data-iid="${S.iid}"]`, 't4-month-bar')
    return { ok: /ALL AVAIL · Sports day/.test(text) && !/Event/.test(text) && /· Sports day · Event · /.test(tip), detail: `bar "${text}" · tip "${tip}"` }
  })
  await step('T5 the opened day: the card is named by the title; the kind stands small at the head of the small-print line, then the remark', async () => {
    await page.locator(`#inpCal [data-icday="2026-07-18"]`).click({ position: { x: 8, y: 8 } })
    const card = page.locator(`[data-testid="idy-row-${S.iid}"]`); await card.waitFor()
    const d = await card.evaluate(c => { const f = c.querySelector('.sd-foot'); return { name: c.querySelector('.idy-kind').textContent, first: f.firstElementChild.getAttribute('data-testid'), tag: f.querySelector('.sd-kindtag')?.textContent, rmk: f.querySelector('.sd-rmk')?.textContent, label: c.querySelector('[data-testid="idy-open"]').getAttribute('aria-label') } })
    await elShot(page, DAYWIN, 't5-day-card')
    await page.keyboard.press('Escape')
    return { ok: d.name === 'Sports day' && d.first === 'idy-kindtag' && d.tag === 'Event' && d.rmk === 'bring boots', detail: JSON.stringify(d) }
  })
  await step('T6 a Wednesday Meeting for Ranger titled "Open house" beside an untitled Training for him: filed through the window', async () => {
    await openNew(page, '2026-07-15')
    await page.selectOption('#inpEditType', 'Meeting'); await page.selectOption('#inpEditPerson', ranger)
    await page.fill('#inpEditStart', '09:00').catch(() => {}); await page.fill('#inpEditEnd', '10:00').catch(() => {})
    await page.fill('#inpEditOwnTitle', 'Open house'); await saveWin(page)
    await openNew(page, '2026-07-15')
    await page.selectOption('#inpEditType', 'Training'); await page.selectOption('#inpEditPerson', ranger)
    await page.fill('#inpEditStart', '13:00').catch(() => {}); await page.fill('#inpEditEnd', '14:00').catch(() => {})
    await saveWin(page)
    M = await recBy(page, { person: ranger, type: 'Meeting', date: 'Jul 15' })
    const U = await recBy(page, { person: ranger, type: 'Training', date: 'Jul 15' })
    return { ok: !!M && M.title === 'Open house' && !!U && U.hasTitle === false, detail: `${JSON.stringify(M)} · untitled ${JSON.stringify(U)}` }
  })
  await step('T7 the List: a titled row prints its title in bold above its kind; an untitled row is as it was; the search finds the title', async () => {
    if (await page.locator(DAYWIN).count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
    await page.locator('#inListBtn').click()
    if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').click()
    await page.locator('#inRangeAll').click()
    const cells = await page.evaluate(() => [...document.querySelectorAll('#inBody tr [data-label="Type"]')].map(c => ({ t: c.querySelector('[data-testid="in-title"]')?.textContent || '', k: c.querySelector('.intag')?.textContent || '' })))
    const titled = cells.filter(c => c.t)
    await shot(page, 't7-list')
    await page.fill('#inFSearch', 'open house'); await page.waitForTimeout(200)
    const found = await page.locator('#inBody tr [data-testid="in-title"]').allInnerTexts()
    await page.fill('#inFSearch', '')
    const ok = titled.some(c => c.t === 'Open house' && c.k === 'Meeting') && titled.some(c => c.t === 'Sports day' && c.k === 'Event')
      && cells.some(c => !c.t && c.k === 'Training') && found.length === 1 && found[0] === 'Open house'
    return { ok, detail: `titled ${JSON.stringify(titled)} · search → ${JSON.stringify(found)}` }
  })
  await step('T8 the List’s pencil editor: the title is edited in the row and saved; back to the kind’s name stores none', async () => {
    const row = page.locator('#inBody tr').filter({ has: page.locator('[data-testid="in-title"]', { hasText: 'Open house' }) })
    await row.locator('[data-edit]').click()
    const ed = page.locator('#inBody tr.ined'); await ed.waitFor()
    const was = await ed.locator('input[data-ed="title"]').inputValue()
    await ed.locator('input[data-ed="title"]').fill('Open day')
    await shot(page, 't8-list-pencil')
    await ed.locator('[data-save]').click(); await page.waitForTimeout(300)
    const a = await recBy(page, { iid: M.iid })
    const row2 = page.locator('#inBody tr').filter({ has: page.locator('[data-testid="in-title"]', { hasText: 'Open day' }) })
    await row2.locator('[data-edit]').click()
    await page.locator('#inBody tr.ined input[data-ed="title"]').fill('meeting')
    await page.locator('#inBody tr.ined [data-save]').click(); await page.waitForTimeout(300)
    const b = await recBy(page, { iid: M.iid })
    /* put it back for the steps that follow */
    await page.evaluate(() => window.go('inputs'))
    return { ok: was === 'Open house' && a.title === 'Open day' && b.hasTitle === false, detail: `was "${was}" → ${JSON.stringify(a.title)} → hasTitle ${b.hasTitle}` }
  })
  await step('T9 the window on a saved input: the title typed again there; Undo takes it back, Redo returns it', async () => {
    await page.locator('#inCalBtn').click().catch(() => {})
    await page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); window.__open = r }, M.iid)
    await month(page, 2026, 7)
    await page.locator(`#inpCal .ib-bar[data-iid="${M.iid}"]`).first().click()
    if (!(await win(page).count())) { const c = page.locator(`[data-testid="idy-row-${M.iid}"] [data-testid="idy-open"]`); if (await c.count()) await c.click() }
    await win(page).waitFor()
    await page.fill('#inpEditOwnTitle', 'Open house'); await saveWin(page)
    const a = (await recBy(page, { iid: M.iid })).title
    await page.keyboard.press('Escape')
    await page.locator('#undoBtn, [data-testid="undo"]').first().click().catch(() => {}); await page.waitForTimeout(300)
    const b = (await recBy(page, { iid: M.iid })).hasTitle
    await page.locator('#redoBtn, [data-testid="redo"]').first().click().catch(() => {}); await page.waitForTimeout(300)
    const c = (await recBy(page, { iid: M.iid })).title
    return { ok: a === 'Open house' && b === false && c === 'Open house', detail: `typed "${a}" · after Undo hasTitle ${b} · after Redo "${c}"` }
  })
  await step('T10 Edit Schedule’s week: Wednesday’s row is named OPEN HOUSE with "Meeting" beside it, outside the name that is typed in; the untitled TRAINING row has no label', async () => {
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500)
    const a = await weekRow(page, '#eWeek', 'OPEN HOUSE'), b = await weekRow(page, '#eWeek', 'TRAINING')
    await weekRow(page, '#eWeek', 'OPEN HOUSE')
    await page.waitForTimeout(150)
    await shot(page, 't10-week-rows')
    const ok = !!a && !!a.tag && a.tag.text === 'Meeting' && a.tag.shown === 'uppercase' && !a.tag.inName && !a.tag.editable && !!b && !b.tag
    return { ok, detail: `titled ${JSON.stringify(a)} · untitled ${JSON.stringify(b && { row: b.row, tag: b.tag })}` }
  })
  await step('T11 the name is typed in place on the week: the kind label is not swallowed into the name, and the label stays', async () => {
    const name = page.locator('#eWeek .pl-row.gr-frominput > .nm .ntx', { hasText: 'OPEN HOUSE' }).first()
    await name.click(); await page.keyboard.press('End'); await page.keyboard.type(' 2'); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
    const row = await page.evaluate(iid => { const g = window.DAYS[2].ground.find(g => g.src === iid); return g && { prog: g.prog, srcType: g.srcType } }, M.iid)
    const a = await weekRow(page, '#eWeek', 'OPEN HOUSE 2')
    /* typed back */
    const n2 = page.locator('#eWeek .pl-row.gr-frominput > .nm .ntx', { hasText: 'OPEN HOUSE 2' }).first()
    await n2.click(); await page.keyboard.press('End'); await page.keyboard.press('Backspace'); await page.keyboard.press('Backspace'); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
    return { ok: !!row && row.prog === 'OPEN HOUSE 2' && !!a && !!a.tag && a.tag.text === 'Meeting', detail: `the row now ${JSON.stringify(row)} · label ${JSON.stringify(a && a.tag && a.tag.text)}` }
  })
  await step('T12 the Scheduler Board: the same row — the label under its name box, the box where every other row’s box is', async () => {
    await openBoard(page, 2)
    const d = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#schedBoard .sb-arow.c6r')]
      const val = r => { const f = r.querySelector('[data-bfld$=".prog"]'); return f ? (f.value || f.textContent || '').trim() : '' }
      const t = rows.find(r => val(r) === 'OPEN HOUSE'), u = rows.find(r => val(r) === 'TRAINING')
      if (!t || !u) return { t: !!t, u: !!u }
      t.scrollIntoView({ block: 'center' })
      const b = x => { const q = x.getBoundingClientRect(); return { x: Math.round(q.left), w: Math.round(q.width), h: Math.round(q.height) } }
      const tb = t.querySelector('[data-bfld$=".prog"]'), ub = u.querySelector('[data-bfld$=".prog"]'), tag = t.querySelector('.nm-kind')
      return { t: true, u: true, tBox: b(tb), uBox: b(ub), tRow: b(t), uRow: b(u), tag: tag && { text: tag.textContent, under: tag.getBoundingClientRect().top >= tb.getBoundingClientRect().bottom - 1 }, kids: [t.children.length, u.children.length], uTag: !!u.querySelector('.nm-kind') }
    })
    await page.waitForTimeout(150); await shot(page, 't12-board-rows')
    const ok = d.t && d.u && d.tag && d.tag.text === 'Meeting' && d.tag.under && d.tBox.x === d.uBox.x && d.tBox.w === d.uBox.w && d.kids[0] === d.kids[1] && !d.uTag
    return { ok, detail: JSON.stringify(d) }
  })
  await step('T13 Saturday’s board in OIL Earn: the titled row draws, nothing breaks, and the mode goes off again', async () => {
    const before = errs.length
    await openBoard(page, 5)
    await page.locator('#sbOil').click(); await page.waitForTimeout(600)
    const cells = await page.locator('#schedBoard .oilitem').count()
    await shot(page, 't13-board-oil-earn')
    await page.locator('#sbOil').click(); await page.waitForTimeout(400)
    return { ok: cells > 0 && errs.length === before, detail: `${cells} item cells in the mode · new errors ${errs.length - before}` }
  })
  await step('T14 the Personal Inputs cards (the board): the titled input is named by its title, its kind small beside it', async () => {
    await openBoard(page, 2)
    const has = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .inprow')].some(r => /Open house/.test(r.textContent)))
    if (!(await has())) { await page.locator('#schedBoard [data-pitog]').first().click(); await page.waitForTimeout(400) }
    const cards = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .inprow')].map(r => ({ name: (r.querySelector('.sbi-ty')?.childNodes[0]?.textContent || r.querySelector('.sbi-ty')?.textContent || '').trim(), tag: r.querySelector('.nm-kind')?.textContent || '' })).filter(c => c.name))
    const t = cards.find(c => c.name === 'Open house')
    if (t) await page.evaluate(() => [...document.querySelectorAll('#schedBoard .inprow')].find(r => /Open house/.test(r.textContent))?.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(150); await shot(page, 't14-board-input-cards')
    await closeBoard(page)
    return { ok: !!t && t.tag === 'Meeting' && cards.some(c => c.name === 'Training' && !c.tag), detail: JSON.stringify(cards.slice(0, 8)) }
  })
  await step('T15 View-only Sched (the working copy shown read only): the row is named by the title with its kind', async () => {
    await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(500)
    const a = await weekRow(page, '#vWeek', 'OPEN HOUSE')
    await page.waitForTimeout(150); await shot(page, 't15-view-only')
    return { ok: !!a && !!a.tag && a.tag.text === 'Meeting', detail: JSON.stringify(a && { tag: a.tag && a.tag.text, name: a.text }) }
  })
  await step('T16 a title that is a rule word decides nothing: the Meeting titled "Open house" retitled "TRAINING" is still one Meeting — no new warning on Ranger that day', async () => {
    const count = () => page.evaluate(r => window.validate().all.filter(w => w.di === 2 && (w.who || []).includes(r)).map(w => w.code + ':' + w.sev).sort().join(','), ranger)
    const before = await count()
    await page.evaluate(() => window.go('inputs')); await month(page, 2026, 7)
    await page.locator(`#inpCal .ib-bar[data-iid="${M.iid}"]`).first().click()
    if (!(await win(page).count())) { const c = page.locator(`[data-testid="idy-row-${M.iid}"] [data-testid="idy-open"]`); if (await c.count()) await c.click() }
    await win(page).waitFor(); await page.fill('#inpEditOwnTitle', 'Training'); await saveWin(page)
    const mid = await count()
    await page.locator(`#inpCal .ib-bar[data-iid="${M.iid}"]`).first().click()
    if (!(await win(page).count())) { const c = page.locator(`[data-testid="idy-row-${M.iid}"] [data-testid="idy-open"]`); if (await c.count()) await c.click() }
    await win(page).waitFor(); await page.fill('#inpEditOwnTitle', 'Open house'); await saveWin(page)
    if (await page.locator(DAYWIN).count()) await page.keyboard.press('Escape')
    return { ok: before === mid, detail: `Ranger’s Wednesday warnings before "${before}" · titled "Training" "${mid}"` }
  })
  await ctx.close()
}

/* ============================================================== a phone, the admin */
{
  const { ctx, page } = await open({ width: 390, height: 760 }, 'ad', 'a', true)
  const ranger = await csId(page, 'Ranger')
  let S = null
  await step('P1 a phone, the window: the Title box under Type; an Event for ALL AVAIL titled "Sports day" on Sat 18 Jul, and for Ranger an untitled Duty and a Meeting titled "Open house"', async () => {
    await openNew(page, '2026-07-18', true)
    await page.selectOption('#inpEditType', 'Event'); await page.selectOption('#inpEditPerson', 'allavail')
    await page.fill('#inpEditOwnTitle', 'Sports day')
    await elShot(page, '[data-testid="win-inputedit"]', 'p1-phone-window')
    const box = await page.locator('#inpEditOwnTitle').boundingBox(), type = await page.locator('#inpEditType').boundingBox()
    await saveWin(page, 'yes', true)
    S = await recBy(page, { person: 'allavail', type: 'Event', date: 'Jul 18' })
    await openNew(page, '2026-07-18', true)
    await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', ranger)
    await page.fill('#inpEditStart', '13:00').catch(() => {}); await page.fill('#inpEditEnd', '15:00').catch(() => {})
    await saveWin(page, 'no', true)
    await openNew(page, '2026-07-18', true)
    await page.selectOption('#inpEditType', 'Meeting'); await page.selectOption('#inpEditPerson', ranger)
    await page.fill('#inpEditStart', '16:00').catch(() => {}); await page.fill('#inpEditEnd', '17:00').catch(() => {})
    await page.fill('#inpEditOwnTitle', 'Open house'); await saveWin(page, 'no', true)
    return { ok: !!S && S.title === 'Sports day' && box.y > type.y && Math.abs(box.x - type.x) < 2 && Math.abs(box.width - type.width) < 2, detail: `the box ${Math.round(box.width)}px wide under Type (${Math.round(type.width)}px) · ${JSON.stringify(S)}` }
  })
  await step('P2 a phone, the opened day: the title is whole (not cut), the kind at the head of the small-print line, the card no taller than the untitled one beside it by more than a line', async () => {
    if (!(await page.locator(DAYWIN).count())) await page.locator(`#inpCal [data-icday="2026-07-18"]`).tap({ position: { x: 8, y: 8 } })
    const card = page.locator(`[data-testid="idy-row-${S.iid}"]`); await card.waitFor()
    const d = await page.evaluate(iid => {
      const c = document.querySelector(`[data-testid="idy-row-${iid}"]`), k = c.querySelector('.idy-kind')
      const others = [...document.querySelectorAll('[data-testid^="idy-row-"]')].filter(x => x !== c).map(x => Math.round(x.getBoundingClientRect().height))
      return { name: k.textContent, cut: k.scrollWidth > k.clientWidth + 1, tag: c.querySelector('.sd-kindtag')?.textContent, h: Math.round(c.getBoundingClientRect().height), others }
    }, S.iid)
    await elShot(page, DAYWIN, 'p2-phone-day-card')
    await page.keyboard.press('Escape')
    return { ok: d.name === 'Sports day' && !d.cut && d.tag === 'Event', detail: JSON.stringify(d) }
  })
  await step('P3 a phone, Edit Schedule: the kind sits UNDER the title; the titled row is no taller than the untitled row beside it', async () => {
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
    /* like for like: Ranger's titled Meeting against Ranger's untitled Duty (the ALL AVAIL row is taller either way — its count) */
    const s0 = await weekRow(page, '#eWeek', 'SPORTS DAY'), b = await weekRow(page, '#eWeek', 'DUTY'), a = await weekRow(page, '#eWeek', 'OPEN HOUSE')
    await page.waitForTimeout(200)
    await shot(page, 'p3-phone-week-row')
    const ok = !!a && !!a.tag && a.tag.text === 'Meeting' && a.tag.y >= a.name.b - 1 && Math.abs(a.tag.x - a.name.x) <= 2 && !!b && !b.tag && a.row.h <= b.row.h + 1
      && !!s0 && !!s0.tag && s0.tag.text === 'Event' && a.name.x >= 0 && a.name.r <= 390
    return { ok, detail: `Ranger’s titled row ${a && a.row.h}px, name ${JSON.stringify(a && a.name)}, label ${JSON.stringify(a && a.tag)} · his untitled row ${b && b.row.h}px · the ALL AVAIL row ${s0 && s0.row.h}px` }
  })
  await step('P4 a phone, the Scheduler Board: the titled row draws with its label inside the screen', async () => {
    await page.locator(`#eWeek [data-sbday="5"]:visible`).first().tap().catch(async () => { await page.locator(`#eWeek [data-sbday="5"]`).first().click() })
    await page.waitForSelector('#schedBoard'); await page.waitForTimeout(600)
    const d = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#schedBoard .sb-arow.c6r')]
      const t = rows.find(r => { const f = r.querySelector('[data-bfld$=".prog"]'); return f && (f.value || f.textContent || '').trim() === 'SPORTS DAY' })
      if (!t) return null
      t.scrollIntoView({ block: 'center' })
      const tag = t.querySelector('.nm-kind'), q = tag && tag.getBoundingClientRect(), box = t.querySelector('[data-bfld$=".prog"]').getBoundingClientRect()
      return { tag: tag && tag.textContent, inside: !!q && q.left >= 0 && q.right <= innerWidth, under: !!q && q.top >= box.bottom - 1, row: Math.round(t.getBoundingClientRect().height) }
    })
    await page.waitForTimeout(200); await shot(page, 'p4-phone-board-row')
    await closeBoard(page)
    return { ok: !!d && d.tag === 'Event' && d.inside && d.under, detail: JSON.stringify(d) }
  })
  await ctx.close()
}

/* ============================================================== a desktop, a member (Ranger) */
{
  const { ctx, page } = await open({ width: 1440, height: 900 }, 'us', 'us')
  await step('M1 a member titles his own Appointment ("Dentist"): saved, named by its title on the month', async () => {
    await openNew(page, '2026-07-16')
    await page.selectOption('#inpEditType', 'Appointment')
    await page.fill('#inpEditOwnTitle', 'Dentist'); await saveWin(page)
    const r = await page.evaluate(() => { const x = window.INPUTS.find(i => i.title === 'Dentist'); return x && { iid: x.iid, type: x.type, title: x.title } })
    if (await page.locator(DAYWIN).count()) await page.keyboard.press('Escape')
    const text = r ? (await page.locator(`#inpCal .ib-bar[data-iid="${r.iid}"]`).first().innerText()).replace(/\s+/g, ' ') : ''
    return { ok: !!r && r.type === 'Appointment' && /Dentist/.test(text), detail: `${JSON.stringify(r)} · bar "${text}"` }
  })
  await step('M2 a member opens the admin’s titled Event for ALL (the demo’s "Sports afternoon", Wed 22 Jul): its title is shown, nothing can be saved', async () => {
    await month(page, 2026, 7)
    const iid = await page.evaluate(() => { const x = window.INPUTS.find(i => i.person === 'all' && i.type === 'Event'); return x && x.iid })
    if (!(await page.locator('#inFPerson').isVisible())) await page.locator('#inFiltersBtn').click()
    await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(200)
    await page.locator(`#inpCal [data-icday="2026-07-22"]`).click({ position: { x: 8, y: 8 } })
    await page.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`).click()
    await win(page).waitFor()
    const d = await page.evaluate(() => { const b = document.querySelector('#inpEditOwnTitle'); return { title: b && b.value, inert: !!(b && b.closest('[inert]')), save: !!document.querySelector('#inpEditSave') } })
    await elShot(page, '[data-testid="win-inputedit"]', 'm2-member-read-only')
    return { ok: d.title === 'Sports afternoon' && d.inert && !d.save, detail: JSON.stringify(d) }
  })
  await ctx.close()
}

/* ============================================================== a STORED world (no ?fresh=1): a reload */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  await page.goto(URL.replace('?fresh=1', ''))
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  await step('R1 a stored world: an Event titled "Sports day" is still titled after a reload — the record, the month’s bar and the schedule’s row', async () => {
    await openNew(page, '2026-07-15')
    await page.selectOption('#inpEditType', 'Event'); await page.fill('#inpEditOwnTitle', 'Sports day'); await saveWin(page)
    const a = await page.evaluate(() => { const x = window.INPUTS.find(i => i.title === 'Sports day'); return x && x.iid })
    await page.reload(); await page.waitForSelector('#vWeek .day, #loginForm')
    if (await page.locator('#loginForm').count()) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day') }
    const r = await page.evaluate(iid => { const x = window.INPUTS.find(i => i.iid === iid); return x && { title: x.title, type: x.type } }, a)
    const row = await page.evaluate(iid => { const g = window.DAYS[2].ground.find(g => g.src === iid); return g && g.prog }, a)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(400)
    const w = await weekRow(page, '#eWeek', 'SPORTS DAY')
    await page.waitForTimeout(150); await shot(page, 'r1-after-reload')
    return { ok: !!r && r.title === 'Sports day' && row === 'SPORTS DAY' && !!w && !!w.tag && w.tag.text === 'Event', detail: `record ${JSON.stringify(r)} · row "${row}" · label ${JSON.stringify(w && w.tag && w.tag.text)}` }
  })
  await ctx.close()
}

await browser.close()
console.log(`\n${n - bad} of ${n} PASS${errs.length ? ' · errors: ' + JSON.stringify([...new Set(errs)].slice(0, 6)) : ' · no console or page error'}`)
process.exit(bad ? 1 : 0)
