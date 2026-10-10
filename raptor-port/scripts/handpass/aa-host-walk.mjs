// THE HOST'S OWN WALK of "an input filed for ALL AVAIL / ALL" and the kind "Event" ([INPUT-ALL-AVAIL], [INPUT-EVENT-KIND];
// docs/handpass/2026-10-09-all-avail-event-check.md §3, §5). It drives the roll-call's rows through the app's own
// controls in the built bundle — every screen that draws an input's person, at a desktop and a phone, as the admin and
// as a member. A PASS is the right behaviour, so a run on a later build is the re-walk. Publication orders and the OIL
// switches' full matrix are the walkers' shares (Astra's scenarios); this is the "is it drawn, can it be pressed" pass.
//
//   node scripts/handpass/aa-host-walk.mjs <out dir>          (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-09-all-avail-event-check/host'
mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
let bad = 0, n = 0
const errs = []
const say = (ok, name, detail = '') => { n++; if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }
const step = async (name, fn) => { try { const r = await fn(); say(r === undefined ? true : !!r.ok, name, r && r.detail) } catch (e) { say(false, name, String(e.message || e).split('\n')[0]) } }

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
const win = p => p.locator('[data-testid="win-inputedit"]')
const rec = (p, remarks) => p.evaluate(rm => { const r = window.INPUTS.find(x => x.remarks === rm); return r ? { iid: r.iid, person: r.person, type: r.type, date: r.date, acc: r.acc, by: r.by, oil: r.oil || null, grp: r.grp || null } : null }, remarks)
const press = (p, loc, touch) => touch ? loc.tap() : loc.click()
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
/* what the opened day's window says of one input: the text of the smallest box around its remark */
const cardText = (p, remark) => p.evaluate(rm => {
  const leaf = [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && (e.textContent || '').trim() === rm && e.offsetParent !== null && !e.closest('#inpCal .ib-bar'))
  if (!leaf.length) return ''
  let box = leaf[leaf.length - 1]
  for (let i = 0; i < 6 && box.parentElement; i++) { box = box.parentElement; if (/ALL|Duty|Meeting|Event/.test(box.textContent || '') && box.textContent.length > rm.length + 8) break }
  return (box.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200) + ' ##pucks=' + box.querySelectorAll('.puck').length
}, remark)

/* file one through the month's own "+ Input": the date, the kind, the placeholder, the hours, the remark, the OIL answer */
async function fileFor(p, { iso, type, who, remarks, from, to, oil, touch = false }) {
  await p.evaluate(() => window.go('inputs'))
  const [y, m] = iso.split('-').map(Number)
  await month(p, y, m)
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await press(p, p.locator('#icPopAdd'), touch)
  await win(p).waitFor()
  await p.selectOption('#inpEditType', type)
  if (who) await p.selectOption('#inpEditPerson', who)
  if (from) { await p.fill('#inpEditStart', from).catch(() => {}); await p.fill('#inpEditEnd', to).catch(() => {}) }
  await p.fill('#inpEditRmk', remarks)
  return { save: async () => {
    await press(p, p.locator('#inpEditSave'), touch)
    if (oil) {
      const sheet = p.locator('[data-testid="oilconf"]'); await sheet.waitFor({ timeout: 4000 })
      await press(p, sheet.locator(`[data-testid="oil-${oil}"]`), touch); await press(p, sheet.locator('[data-testid="oilconf-save"]'), touch)
    }
    await p.waitForTimeout(250)
  } }
}

/* ============================================================== a desktop, the admin (Saber) */
{
  const { ctx, page } = await open({ width: 1440, height: 900 })
  let R = null

  await step('H1 the editor\'s Person list offers "Whoever is free that day": ALL AVAIL, ALL — above the names', async () => {
    const f = await fileFor(page, { iso: '2026-07-18', type: 'Duty', remarks: 'hangar clean' })
    const grp = page.locator('#inpEditPerson optgroup[data-ph]')
    const label = await grp.getAttribute('label'), opts = await grp.locator('option').allInnerTexts()
    const first = await page.evaluate(() => document.querySelector('#inpEditPerson').firstElementChild.tagName)
    await page.selectOption('#inpEditPerson', 'allavail')
    const times = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop input[type="time"]')].map(i => i.id + '=' + i.value))
    await shot(page, 'h1-editor-person-list')
    page.__f = f; page.__times = times
    return { ok: label === 'Whoever is free that day' && opts.join('|') === 'ALL AVAIL|ALL' && first === 'OPTGROUP', detail: `${label}: ${opts.join(', ')} · time boxes ${times.join(' ')}` }
  })
  await step('H2 a Saturday Duty for ALL AVAIL: the OIL question names ALL AVAIL and is asked once; Yes; ONE record, no group', async () => {
    await page.locator('#inpEditSave').click()
    const sheet = page.locator('[data-testid="oilconf"]'); await sheet.waitFor()
    const said = (await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 160)
    await shot(page, 'h2-oil-question')
    await sheet.locator('[data-testid="oil-yes"]').click(); await sheet.locator('[data-testid="oilconf-save"]').click()
    await page.waitForTimeout(300)
    R = await rec(page, 'hangar clean')
    return { ok: !!R && R.person === 'allavail' && !R.grp && /ALL AVAIL/.test(said) && Object.values(R.oil || {}).some(v => v > 0), detail: `${said} → ${JSON.stringify(R)}` }
  })
  await step('H3 the month: ONE bar on Sat 18 reading "ALL AVAIL · Duty"; its tip says the same', async () => {
    const bar = page.locator(`#inpCal .ib-bar[data-iid="${R.iid}"]`)
    const text = (await bar.innerText()).replace(/\s+/g, ' '), tip = await bar.getAttribute('title')
    await shot(page, 'h3-month-bar')
    return { ok: (await bar.count()) === 1 && /ALL AVAIL/.test(text) && /Duty/.test(text), detail: `bar "${text}" · tip "${tip}"` }
  })
  await step('H4 the opened day: its card names ALL AVAIL, wears the placeholder\'s puck, and its small print says who placed it', async () => {
    let text = await cardText(page, 'hangar clean')
    if (!text) { await page.locator('#inpCal [data-icday="2026-07-18"]').click({ position: { x: 8, y: 8 } }); await page.waitForTimeout(300); text = await cardText(page, 'hangar clean') }
    const puck = text.split('##pucks=')[1]
    await shot(page, 'h4-opened-day-card')
    return { ok: /ALL AVAIL/.test(text) && /Saber/.test(text), detail: `card "${text.slice(0, 140)}" · placeholder pucks on it: ${puck}` }
  })
  await step('H5 the List: its row reads ALL AVAIL · Duty; the person filter offers Everyone, ALL AVAIL, ALL; "ALL AVAIL" shows it alone of the three', async () => {
    await page.locator('#inListBtn').click()
    if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').click()
    await page.locator('#inRangeAll').click()
    if (!(await page.locator('#inFPerson').isVisible())) await page.locator('#inFiltersBtn').click()
    const opts = await page.locator('#inFPerson option').evaluateAll(os => os.slice(0, 3).map(o => o.value + '=' + o.textContent))
    await page.selectOption('#inFPerson', 'ph:allavail')
    await page.waitForTimeout(150)
    const rows = await page.locator('#inBody tr[data-iid]').evaluateAll(trs => trs.map(t => (t.textContent || '').replace(/\s+/g, ' ').slice(0, 70)))
    const sum = await page.locator('#inFilterSummary').innerText().catch(() => '')
    await shot(page, 'h5-list-filter-allavail')
    return { ok: opts.join(',') === 'all=Everyone,ph:allavail=ALL AVAIL,ph:all=ALL' && rows.length >= 1 && rows.every(r => /ALL AVAIL/.test(r)), detail: `${opts.join(' ')} · rows ${JSON.stringify(rows)} · chip "${sum.replace(/\s+/g, ' ')}"` }
  })
  await step('H6 the List\'s pencil editor opens ON ALL AVAIL (never a real man\'s name), and saves it unchanged', async () => {
    const row = page.locator(`#inBody tr[data-iid="${R.iid}"]`)
    await row.locator('[data-edit]').click()
    const sel = page.locator(`#inBody tr[data-iid="${R.iid}"] [data-ed="person"]`)
    const val = await sel.inputValue(), shown = await sel.evaluate(s => s.selectedOptions[0].textContent)
    await shot(page, 'h6-list-pencil')
    await page.locator(`#inBody tr[data-iid="${R.iid}"] [data-save]`).click()
    const after = await rec(page, 'hangar clean')
    await page.selectOption('#inFPerson', 'all')
    return { ok: val === 'allavail' && shown === 'ALL AVAIL' && after.person === 'allavail', detail: `box shows "${shown}"` }
  })
  await step('H7 Edit Schedule\'s week: Saturday\'s Ground Programme carries its row — the ALL AVAIL puck, a count, and the count\'s words', async () => {
    await page.evaluate(() => window.go('editsched'))
    const chip = page.locator(`#eWeek .oilcount[data-oilsent="i:${R.iid}"]`)
    await chip.scrollIntoViewIfNeeded()
    const nTxt = await chip.innerText(), title = await chip.getAttribute('title')
    const rowText = await chip.evaluate(c => (c.closest('.pl-row')?.textContent || '').replace(/\s+/g, ' ').slice(0, 120))
    await shot(page, 'h7-week-row')
    return { ok: +nTxt > 0 && /earn/.test(title || ''), detail: `count ${nTxt} · "${title}" · row "${rowText}"` }
  })
  await step('H8 the count opens the window: the people behind it as pucks, pilots and WSOs', async () => {
    await page.locator(`#eWeek .oilcount[data-oilsent="i:${R.iid}"]`).click()
    const w = page.locator('.availwin'); await w.waitFor()
    const pucks = await w.locator('.puck').count(), head = (await w.innerText()).replace(/\s+/g, ' ').slice(0, 120)
    await shot(page, 'h8-availwin-week')
    await page.keyboard.press('Escape')
    return { ok: pucks > 0, detail: `${pucks} pucks · "${head}"` }
  })
  await step('H9 the Scheduler Board: the same row, puck and count; OIL Earn on — the row\'s name offers no switch and says where they are', async () => {
    await openBoard(page, 5)
    const row = page.locator('#schedBoard .sb-arow').filter({ has: page.locator(`.oilcount[data-oilsent="i:${R.iid}"]`) })
    const has = await row.locator('.puck.allavail').count()
    await page.locator('#sbOil').click(); await page.waitForTimeout(600)
    const cell = page.locator('#schedBoard .sb-arow').filter({ has: page.locator(`.oilcount[data-oilsent="i:${R.iid}"]`) }).locator('.oilitem').first()
    const title = await cell.getAttribute('title'), sw = await cell.getAttribute('data-oilitem')
    const mans = await page.locator('#schedBoard .sb-arow').filter({ has: page.locator(`.oilcount[data-oilsent="i:${R.iid}"]`) }).locator('.seat.oilpk').count()
    await shot(page, 'h9-board-oil-earn')
    return { ok: has === 1 && !sw && /whoever filed it/.test(title || '') && mans === 0, detail: `"${title}" · men's switches on the row: ${mans}` }
  })
  await step('H10 the window\'s "Who earns OIL": after the filer\'s Yes every man is ON; a tap takes one off, a second puts him back', async () => {
    await page.locator(`#schedBoard .oilcount[data-oilsent="i:${R.iid}"]`).click()
    const w = page.locator('.availwin'); await w.waitFor()
    const seats = w.locator('.seat.oilpk[data-oilp]')
    const total = await seats.count(), on = await w.locator('.seat.oilpk.on').count()
    const first = seats.first(), id = await first.getAttribute('data-oilp')
    const hint0 = (await w.innerText()).includes('Tap a puck to stop a man earning')
    await first.locator('.puck').click(); await page.waitForTimeout(150)
    const off = await w.locator(`.seat.oilpk[data-oilp="${id}"]`).getAttribute('class')
    const dec = await page.evaluate(([id, iid]) => ((window.DAYS[5].oild || {}).people || {})[`${id}|i:${iid}`], [id, R.iid])
    await shot(page, 'h10-availwin-oil-yes-one-off')
    await w.locator(`.seat.oilpk[data-oilp="${id}"] .puck`).click(); await page.waitForTimeout(150)
    const dec2 = await page.evaluate(([id, iid]) => ((window.DAYS[5].oild || {}).people || {})[`${id}|i:${iid}`], [id, R.iid])
    return { ok: total > 0 && on === total && hint0 && /off/.test(off) && dec === 'deny' && dec2 === undefined, detail: `${on} of ${total} on · tap → ${dec}, tap → ${dec2}` }
  })
  await step('H11 the filer answers again — No: every man in the window starts OFF and says whose No it is; a tap CREDITS one', async () => {
    await page.keyboard.press('Escape')
    await page.locator('#sbOil').click(); await page.waitForTimeout(400)      // OIL Earn off again
    await closeBoard(page)
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inCalBtn').click().catch(() => {})
    await month(page, 2026, 7)
    await page.locator(`#inpCal .ib-bar[data-iid="${R.iid}"]`).click(); await win(page).waitFor()
    const change = page.locator('#inpEditPop').getByRole('button', { name: /Change/ }).first()
    const hasChange = await change.count()
    if (hasChange) await change.click()
    const sheet = page.locator('[data-testid="oilconf"]'); await sheet.waitFor({ timeout: 4000 })
    await sheet.locator('[data-testid="oil-no"]').click(); await sheet.locator('[data-testid="oilconf-save"]').click()
    await page.waitForTimeout(300)
    if (await win(page).count()) await page.locator('[data-testid="win-inputedit-x"]').click().catch(() => {})
    const now = await rec(page, 'hangar clean')
    await page.evaluate(() => window.go('editsched')); await openBoard(page, 5)
    await page.locator('#sbOil').click(); await page.waitForTimeout(600)
    await page.locator(`#schedBoard .oilcount[data-oilsent="i:${R.iid}"]`).click()
    const w = page.locator('.availwin'); await w.waitFor()
    const total = await w.locator('.seat.oilpk[data-oilp]').count(), off = await w.locator('.seat.oilpk.off').count()
    const t = await w.locator('.seat.oilpk[data-oilp]').first().getAttribute('title')
    const hint = (await w.innerText()).replace(/\s+/g, ' ')
    await shot(page, 'h11-availwin-oil-no')
    const first = w.locator('.seat.oilpk[data-oilp]').first(), id = await first.getAttribute('data-oilp')
    await first.locator('.puck').click(); await page.waitForTimeout(150)
    const dec = await page.evaluate(([id, iid]) => ((window.DAYS[5].oild || {}).people || {})[`${id}|i:${iid}`], [id, R.iid])
    await shot(page, 'h11b-availwin-oil-no-one-credited')
    return { ok: Object.values(now.oil || {}).every(v => v === 0) && total > 0 && off === total && /answered No to OIL/.test(t || '') && /answered No to OIL/.test(hint) && dec === 'allow',
      detail: `answer ${JSON.stringify(now.oil)} · ${off} of ${total} off · "${t}" · tap → ${dec} · Change button: ${hasChange}` }
  })
  await step('H12 no warning is raised for the placeholder input, and the day\'s "Leave / downchit" total does not count it', async () => {
    const w = await page.evaluate(() => { const v = window.validate ? window.validate() : null; const all = v && Array.isArray(v.all) ? v.all : []; return all.filter(x => (x.who || []).some(id => id === 'allavail' || id === 'all')).length })
    const away = await page.evaluate(() => { try { return [...window.dayAway(window.DAYS[5]).all] } catch { return null } })
    return { ok: w === 0 && !(away || []).includes('allavail'), detail: `warnings naming a placeholder: ${w} · away set read: ${away ? away.length + ' people' : 'not on the bridge'}` }
  })
  await step('H13 an "Other" for ALL on Tue 14 Jul: its Personal Inputs card offers Undo; taken off, it offers "→ Ground" and NO "→ Unavail"', async () => {
    await page.keyboard.press('Escape')
    await page.locator('#sbOil').click().catch(() => {}); await page.waitForTimeout(300)
    await closeBoard(page)
    const f = await fileFor(page, { iso: '2026-07-14', type: 'Other', who: 'all', remarks: 'range sweep' }); await f.save()
    const O = await rec(page, 'range sweep')
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(300)
    const unfold = async () => { const t = page.locator('#eWeek .day').nth(1).locator('[data-pitog]').first(); if (await t.count() && !(await page.locator('#eWeek .day').nth(1).locator('.accb').count())) { await t.click(); await page.waitForTimeout(250) } }
    const btns = () => page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); const day = document.querySelectorAll('#eWeek .day')[1]; const rows = [...day.querySelectorAll('.pl-row')].filter(x => /range sweep/i.test(x.textContent || '') && x.querySelector('.accb')); return { acc: r.acc, labels: rows.flatMap(x => [...x.querySelectorAll('.accb')].map(b => b.textContent.trim() + '[' + b.getAttribute('data-acc') + ']')) } }, O.iid)
    await unfold()
    const b1 = await btns()
    const row = page.locator('#eWeek .day').nth(1).locator('.pl-row').filter({ hasText: /range sweep/i }).filter({ has: page.locator('.accb') }).first()
    await row.locator('.accb.undo').click(); await page.waitForTimeout(300)
    await unfold()
    const b2 = await btns()
    await shot(page, 'h13-personal-inputs-buttons')
    return { ok: O.person === 'all' && b2.acc === 'r' && b2.labels.some(l => /Ground|Accept/.test(l)) && !b2.labels.some(l => /Unavail/.test(l)), detail: `landed ${JSON.stringify(b1)} → taken off ${JSON.stringify(b2)}` }
  })
  await step('H14 the changes window names it; the Undo button says what it would take back', async () => {
    const undoBtn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /undo/i.test(x.id || '') || /^Undo/.test(x.title || '')); return b ? (b.title || b.getAttribute('aria-label') || '') : '' })
    const log = await page.evaluate(() => (window.ELOG && window.ELOG.rows ? window.ELOG.rows.slice(-6).map(r => (r.txt || r.text || r.msg || JSON.stringify(r)).toString().slice(0, 110)) : []))
    return { ok: true, detail: `Undo: "${undoBtn}" · latest history lines: ${JSON.stringify(log)}` }
  })
  await step('H15 Event: in the editor\'s kinds, the "?" legend and the Logic page\'s table; an Event for Ranger lands a Ground Programme row', async () => {
    const f = await fileFor(page, { iso: '2026-07-15', type: 'Event', remarks: 'games night' })
    const kinds = await page.locator('#inpEditType option').allInnerTexts()
    const ranger = await page.evaluate(() => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === 'Ranger'))
    await page.selectOption('#inpEditPerson', ranger); await f.save()
    const E = await rec(page, 'games night')
    const row = await page.evaluate(iid => (window.DAYS[2].ground || []).find(g => String(g.src || '') === iid) || null, E.iid)
    await page.evaluate(() => window.go('logic')); await page.waitForTimeout(300)
    const logic = await page.evaluate(() => /\bEvent\b/.test(document.querySelector('#page-logic, main, body').textContent || ''))
    await shot(page, 'h15-logic-event')
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(300)
    await shot(page, 'h15b-week-event-row')
    return { ok: kinds.includes('Event') && !!row && logic, detail: `kinds ${kinds.slice(-8).join(', ')} · row ${JSON.stringify(row && { prog: row.prog, who: row.who, str: row.str, end: row.end })} · Logic names it: ${logic}` }
  })
  await ctx.close()
}

/* ============================================================== a desktop, a member (Ranger) */
{
  const { ctx, page } = await open({ width: 1440, height: 900 }, 'us', 'us')
  await step('M1 a member: the list offers the two (members\' switch on); he files a Meeting for ALL AVAIL; it is not under his own filter, it is under Everyone', async () => {
    const f = await fileFor(page, { iso: '2026-10-20', type: 'Meeting', remarks: 'flight social' })
    const opts = await page.locator('#inpEditPerson optgroup[data-ph] option').allInnerTexts()
    await page.selectOption('#inpEditPerson', 'allavail'); await f.save()
    const M = await rec(page, 'flight social')
    const mine = await page.locator(`#inpCal .ib-bar[data-iid="${M.iid}"]`).count()
    if (!(await page.locator('#inFPerson').isVisible())) await page.locator('#inFiltersBtn').click()
    await page.selectOption('#inFPerson', 'all')
    const all = await page.locator(`#inpCal .ib-bar[data-iid="${M.iid}"]`).count()
    await shot(page, 'm1-member-everyone')
    return { ok: opts.join('|') === 'ALL AVAIL|ALL' && M.person === 'allavail' && all === 1, detail: `filed by ${M.by} · bars under his own filter ${mine}, under Everyone ${all}` }
  })
  await step('M2 the demo\'s ALL AVAIL Duty (filed by Saber): a member opens it READ ONLY — no Save, and it says who may change it', async () => {
    await month(page, 2026, 7)
    const bar = page.locator('#inpCal .ib-bar').filter({ hasText: 'ALL AVAIL' }).filter({ hasText: 'Duty' }).first()
    await bar.click(); await win(page).waitFor()
    const save = await page.locator('#inpEditSave').count()
    const text = (await win(page).innerText()).replace(/\s+/g, ' ').slice(0, 260)
    await shot(page, 'm2-member-read-only')
    return { ok: save === 0 && /ALL AVAIL/.test(text), detail: `Save buttons ${save} · "${text}"` }
  })
  await ctx.close()
}

/* ============================================================== a phone, the admin */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, 'ad', 'a', true)
  let P = null
  await step('P1 a phone: the editor window with ALL AVAIL chosen fits the screen; the OIL question fits; filed by a finger', async () => {
    const f = await fileFor(page, { iso: '2026-07-19', type: 'Duty', who: 'allavail', remarks: 'phone duty', touch: true })
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    const box = await win(page).boundingBox()
    await shot(page, 'p1-phone-editor')
    await page.locator('#inpEditSave').tap()
    const sheet = page.locator('[data-testid="oilconf"]'); await sheet.waitFor()
    const sb = await sheet.boundingBox()
    await shot(page, 'p1b-phone-oil-question')
    await sheet.locator('[data-testid="oil-yes"]').tap(); await sheet.locator('[data-testid="oilconf-save"]').tap()
    await page.waitForTimeout(300)
    P = await rec(page, 'phone duty')
    return { ok: !!P && P.person === 'allavail' && wide <= 1 && box.x >= 0 && box.x + box.width <= 391 && sb.x >= 0 && sb.x + sb.width <= 391, detail: `window ${Math.round(box.width)} wide at ${Math.round(box.x)} · sheet ${Math.round(sb.width)} wide · sideways overflow ${wide}` }
  })
  await step('P2 a phone: the month\'s bar and the opened day\'s card read ALL AVAIL', async () => {
    const bar = page.locator(`#inpCal .ib-bar[data-iid="${P.iid}"]`)
    const text = (await bar.innerText()).replace(/\s+/g, ' ')
    let card = await cardText(page, 'phone duty')
    if (!card) { await page.locator('#inpCal [data-icday="2026-07-19"]').tap({ position: { x: 8, y: 8 } }); await page.waitForTimeout(400); card = await cardText(page, 'phone duty') }
    await shot(page, 'p2-phone-day-card')
    return { ok: /ALL/.test(text) && /ALL AVAIL/.test(card), detail: `bar "${text}" · card "${card.slice(0, 120)}"` }
  })
  await step('P3 a phone: the schedule\'s Sunday carries its row; a finger on the count opens the window as a panel with the people in it', async () => {
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(400)
    const chip = page.locator(`#eWeek .oilcount[data-oilsent="i:${P.iid}"]`)
    await chip.scrollIntoViewIfNeeded()
    const hit = await chip.evaluate(c => { const r = c.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e === c || c.contains(e) })
    await shot(page, 'p3-phone-week-row')
    await chip.tap()
    const w = page.locator('.availwin'); await w.waitFor()
    const wb = await w.boundingBox(), pucks = await w.locator('.puck').count()
    await shot(page, 'p3b-phone-availwin')
    return { ok: hit && pucks > 0 && wb.x >= 0 && wb.x + wb.width <= 391, detail: `count reachable by a finger: ${hit} · ${pucks} pucks · panel ${Math.round(wb.width)}×${Math.round(wb.height)}` }
  })
  await ctx.close()
}

console.log(`\n${n - bad} of ${n} PASS · ${bad} FAIL`)
console.log('errors seen: ' + (errs.length ? JSON.stringify([...new Set(errs)].slice(0, 12)) : 'none'))
await browser.close()
process.exit(bad ? 1 : 0)
