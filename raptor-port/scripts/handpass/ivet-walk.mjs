// THE HOST'S OWN WALK of "the design vet's changes to the Inputs calendar and list" ([INPUTS-VET]; owner D726–D729 —
// 10 Oct 26; docs/handpass/2026-10-10-inputs-vet-check.md §3, §3a, §4). It drives the roll-call's rows and the DOOR
// LIST — every thing the List's own add form did, now through "+ Input" and the input's window — through the app's own
// controls in the built bundle: at a desktop and on a phone (by touch), as the admin and as a member; and the surfaces
// that must NOT have changed (the SANS calendar's window, the schedule's own dialog). A PASS is the right behaviour,
// so a run on a later build is the re-walk.
//
//   node scripts/handpass/ivet-walk.mjs <out dir>          (LOOK_URL=http://localhost:4174/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-10-inputs-vet-check/host'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4174/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
let bad = 0, n = 0
const errs = []
const say = (ok, name, detail = '') => { n++; if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }
const step = async (name, fn) => { try { const r = await fn(); say(r === undefined ? true : !!r.ok, name, r && r.detail) } catch (e) { say(false, name, String(e.message || e).split('\n').slice(0, 6).join(' ⏎ ').slice(0, 500)) } }

async function open(viewport, who = 'ad', pass = 'a', touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  return { ctx, page }
}
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') })
const WIN = '[data-testid="win-inputedit"]', DAYWIN = '[data-testid="win-inputsday"]'
const press = (touch, loc) => (touch ? loc.tap() : loc.click())
const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
const count = p => p.evaluate(() => window.INPUTS.length)
const newest = (p, had) => p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, person: r.person, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, s: r.s, e: r.e, oil: r.oil || null, grp: r.grp || null, by: r.by, docs: (r.docIds || []).length })), had)
const ids = p => p.evaluate(() => window.INPUTS.map(r => r.iid))
const toast = p => p.evaluate(() => (document.getElementById('toastEl')?.textContent || '').trim())
const clearToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.textContent = '' })
async function month(p, y, m, touch) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(touch, p.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  throw new Error('the calendar never reached the month asked for')
}
async function toCal(p, touch) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inCalBtn'))
  await month(p, 2026, 7, touch)
}
async function toList(p, touch, all = true) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inListBtn'))
  if (all) {
    if (!(await p.locator('#inRangePop').count())) await press(touch, p.locator('#inRangeBtn'))
    await press(touch, p.locator('#inRangeAll')); await p.waitForTimeout(250)
  }
}
async function openDay(p, iso, touch) {
  await toCal(p, touch)
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await p.locator(DAYWIN).waitFor()
}
/* "+ Input" on the List: the window comes up */
async function plus(p, touch) {
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  await press(touch, p.locator('#inNew'))
  await p.locator(WIN).waitFor()
}
/* a day on the window's own calendar, turning its months to reach it */
async function pick(p, iso, touch) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await press(touch, p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
  }
  await press(touch, p.locator(`#inpEdCal [data-cal="${iso}"]`))
}
async function answerOil(p, touch, how) {
  const sheet = p.locator('[data-testid="oilconf"]')
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await press(touch, (await one.count()) ? one : many)
  await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
}
const rowOf = (p, iid) => p.evaluate(iid => {
  const want = window.INPUTS.find(r => r.iid === iid); if (!want) return null
  const el = [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')].find(e => { const r = window.INPUTS.find(x => x.iid === e.getAttribute('data-iid')); return r && (r.iid === iid || (want.grp && r.grp === want.grp)) })
  if (!el) return null
  const all = [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')]
  const b = el.getBoundingClientRect()
  return { at: all.indexOf(el), lit: el.classList.contains('innew'), text: el.textContent.replace(/\s+/g, ' ').trim(), name: el.querySelector('[data-label="Name"], [data-testid="inl-who"]')?.textContent || '',
    by: el.querySelector('.in-placed, [data-testid="inl-by"]')?.textContent || '', rmk: el.querySelector('[data-testid="inl-rmk"]')?.textContent ?? null, when: el.querySelector('[data-testid="inl-when"]')?.textContent ?? null,
    onScreen: b.top >= 0 && b.bottom <= innerHeight, h: Math.round(b.height) }
}, iid)

/* ══════════════════ A · A DESKTOP, THE ADMIN (Saber) ══════════════════ */
{
  const { ctx, page } = await open({ width: 1440, height: 900 })
  const T = false
  const id = cs => csId(page, cs)

  await step('A1 the List opens on its list: no form, "+ Input" first in its row, the table straight under the tools', async () => {
    await toList(page, T)
    const m = await page.evaluate(() => {
      const add = document.querySelector('#inNew').getBoundingClientRect(), range = document.querySelector('#inRangeBtn').getBoundingClientRect(), tbl = document.querySelector('#intbl').getBoundingClientRect()
      return { form: document.querySelectorAll('.inbar, .ingrid, #inAdd, #inType, #inRemarks').length, word: document.querySelector('#inNew').textContent, left: add.right <= range.left + 1, gap: Math.round(tbl.top - add.bottom), tblTop: Math.round(tbl.top), heads: [...document.querySelectorAll('#intbl thead th')].map(t => t.textContent.replace(/[▲▼]/g, '').trim()).filter(Boolean) }
    })
    await shot(page, 'A1-desk-list')
    return { ok: m.form === 0 && m.word === '+ Input' && m.left && m.gap < 40 && m.tblTop < 320 && m.heads.join('|') === 'Name|Start|End|Type|Remarks|Changed', detail: JSON.stringify(m) }
  })

  await step('A2 "+ Input": the window opens with NO date, no paragraph of instructions, the signed-in person, the calendar’s first kind', async () => {
    await plus(page, T)
    const m = await page.evaluate(() => ({ read: document.querySelector('#inpEditPop .rc-read')?.textContent, hint: document.querySelectorAll('#inpEditPop .inped-hint').length, who: document.querySelector('#inpEditPerson')?.selectedOptions[0]?.textContent, type: document.querySelector('#inpEditType')?.value, title: document.querySelector('[data-testid="win-inputedit"] .win-ttl')?.textContent, save: document.querySelector('#inpEditSave')?.textContent, picked: document.querySelectorAll('#inpEdCal .rc-d.s, #inpEdCal .rc-d.e').length }))
    await shot(page, 'A2-desk-new-window')
    return { ok: m.read === 'pick a start date' && m.hint === 0 && m.who === 'Saber' && !!m.type && /New input/.test(m.title || '') && m.picked === 0, detail: JSON.stringify(m) }
  })

  await step('A3 Add with no date is refused in words BEFORE any question — for a duty, for a medical kind, for a weekend-asking kind — and nothing is written', async () => {
    const out = []
    const before = await count(page)
    for (const t of ['Training', 'OML', 'Duty', 'Upchit']) {
      await page.selectOption('#inpEditType', t)
      await clearToast(page)
      await page.locator('#inpEditSave').click(); await page.waitForTimeout(250)
      out.push([t, await toast(page), await page.locator('[data-testid="oilconf"], [data-testid="docconf"], [data-testid="upconf"], [data-testid="medclash"]').count()])
    }
    const after = await count(page)
    return { ok: after === before && out.every(o => o[1] === 'Pick a start date on the calendar first' && o[2] === 0) && (await page.locator(WIN).count()) === 1, detail: JSON.stringify(out) }
  })

  await step('A4 the "?" beside Type: opens a card INSIDE the window that names every kind and says ATT B may still work; Escape closes the card and not the window; a press outside closes it; the "?" closes it', async () => {
    await page.selectOption('#inpEditType', 'Meeting')
    await page.locator('#inTypeHelp').click(); await page.locator('#inTypePop').waitFor()
    const m = await page.evaluate(() => {
      const win = document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect(), pop = document.querySelector('#inTypePop').getBoundingClientRect()
      const t = document.querySelector('#inTypePop').textContent
      const kinds = [...document.querySelector('#inpEditType').options].map(o => o.value)
      const save = document.querySelector('#inpEditSave').getBoundingClientRect(), hit = document.elementFromPoint(save.left + save.width / 2, save.top + save.height / 2)
      return { inside: pop.left >= win.left - 0.5 && pop.right <= win.right + 0.5, kindsMissing: kinds.filter(k => !t.includes(k)), attb: /no flying — may still stand a duty/.test(t), head: /What each type means/.test(t), saveReached: !!hit?.closest('#inpEditSave'), inLabel: !!document.querySelector('#inTypeHelp').closest('label') }
    })
    await shot(page, 'A4-desk-help-card')
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    const afterEsc = { card: await page.locator('#inTypePop').count(), win: await page.locator(WIN).count() }
    await page.locator('#inTypeHelp').click(); await page.locator('#inTypePop').waitFor()
    await page.locator('#inpEditRmk').click(); await page.waitForTimeout(150)
    const afterOut = await page.locator('#inTypePop').count()
    await page.locator('#inTypeHelp').click(); await page.locator('#inTypePop').waitFor()
    await page.locator('#inTypeHelp').click(); await page.waitForTimeout(150)
    const afterToggle = await page.locator('#inTypePop').count()
    return { ok: m.inside && !m.kindsMissing.length && m.attb && m.head && m.saveReached && !m.inLabel && afterEsc.card === 0 && afterEsc.win === 1 && afterOut === 0 && afterToggle === 0, detail: JSON.stringify({ ...m, afterEsc, afterOut, afterToggle }) }
  })

  let solo = null
  await step('A5 ONE PERSON through "+ Input": Ranger, a Meeting with a title and a remark, 14 Jul 09:00–10:30 → saved as picked; its row is in the list, LIT, and says "By Saber"', async () => {
    const had = await ids(page)
    await page.selectOption('#inpEditPerson', await id('Ranger'))
    await page.selectOption('#inpEditType', 'Meeting')
    await pick(page, '2026-07-14', T)
    if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').click()
    await page.fill('#inpEditStart', '09:00'); await page.fill('#inpEditEnd', '10:30')
    await page.fill('#inpEditOwnTitle', 'Vet walk brief'); await page.fill('#inpEditRmk', 'room 2')
    const rmkWhilePicking = await page.inputValue('#inpEditRmk')
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' })
    const made = await newest(page, had); solo = made[0]
    const row = solo && await rowOf(page, solo.iid)
    await shot(page, 'A5-desk-added-lit')
    return { ok: made.length === 1 && solo.cs === 'Ranger' && solo.type === 'Meeting' && solo.title === 'Vet walk brief' && solo.remarks === 'room 2' && solo.date === 'Jul 14' && !solo.endDate && solo.s === 540 && solo.e === 630 && !!row && row.lit && row.by === 'By Saber' && row.name === 'Ranger', detail: JSON.stringify({ solo, row, rmkWhilePicking }) }
  })

  await step('A6 added while the SEARCH, the KIND and the DATES all hide it: it stands FIRST in the list, lit — and lets go when a heading is pressed', async () => {
    await page.fill('#inFSearch', 'zzz-nothing'); await page.selectOption('#inFType', 'OML')
    await press(T, page.locator('#inRangeBtn')); await press(T, page.locator('#inRangeCal [data-cal="2026-07-01"]')); await press(T, page.locator('#inRangeCal [data-cal="2026-07-02"]'))
    await page.mouse.click(700, 760)
    const had = await ids(page)
    await plus(page, T)
    await page.selectOption('#inpEditType', 'Training'); await pick(page, '2026-07-21', T); await page.fill('#inpEditRmk', 'kept in view')
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' })
    const made = await newest(page, had)
    const row = made[0] && await rowOf(page, made[0].iid)
    const rows = await page.locator('#inBody tr').count()
    await shot(page, 'A6-desk-kept-in-view')
    await page.locator('#intbl thead th[data-sort="start"]').click(); await page.waitForTimeout(200)
    const after = made[0] && await rowOf(page, made[0].iid)
    await page.locator('#intbl thead th[data-sort="start"]').click()
    await page.fill('#inFSearch', ''); await page.selectOption('#inFType', 'all')
    await press(T, page.locator('#inRangeBtn')); await press(T, page.locator('#inRangeAll'))
    return { ok: made.length === 1 && !!row && row.at === 0 && row.lit && rows === 1 && after === null, detail: JSON.stringify({ row, rows, after }) }
  })

  await step('A7 Undo takes the last input away; Redo brings it back, in view and lit', async () => {
    const before = await count(page), last = await page.evaluate(() => window.INPUTS.find(r => r.remarks === 'kept in view')?.iid)
    await page.waitForTimeout(6300)                                   // every earlier light has gone out (six seconds)
    const dark = await page.locator('#inBody tr.innew').count()
    await page.locator('#undoBtn').click(); await page.waitForTimeout(350)
    const gone = await count(page), rowGone = (await rowOf(page, last)) === null
    await page.locator('#redoBtn').click(); await page.waitForTimeout(450)
    const back = await count(page)
    const row = await rowOf(page, last)
    const lit = await page.locator('#inBody tr.innew').count()
    await shot(page, 'A7-desk-redo-lit')
    return { ok: dark === 0 && gone === before - 1 && rowGone && back === before && !!row && row.lit && row.onScreen && lit === 1, detail: JSON.stringify({ before, dark, gone, rowGone, back, row, lit }) }
  })

  let trio = null
  await step('A8 SEVERAL PEOPLE through "+ Input": three picked, one Add → ONE shared input; its row names all three A to Z (never "+2"), keeps the pill, says "By Saber"', async () => {
    const had = await ids(page)
    await plus(page, T)
    await page.selectOption('#inpEditType', 'Meeting')
    await page.locator(`${WIN} [data-testid="pp-several"]`).click()
    for (const cs of ['Wisp', 'Ace']) await page.locator(`${WIN} [data-pp="${await id(cs)}"]`).click()
    await pick(page, '2026-07-15', T); await page.fill('#inpEditRmk', 'three of us')
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' })
    const made = await newest(page, had); trio = made
    const row = made[0] && await rowOf(page, made[0].iid)
    const pill = await page.evaluate(iid => { const want = window.INPUTS.find(r => r.iid === iid); const tr = [...document.querySelectorAll('#inBody tr')].find(t => window.INPUTS.find(r => r.iid === t.getAttribute('data-iid'))?.grp === want.grp); const tag = tr?.querySelector('.intag'); return tag ? { text: tag.textContent, radius: parseFloat(getComputedStyle(tag).borderTopLeftRadius), bg: getComputedStyle(tag).backgroundColor } : null }, made[0]?.iid)
    return { ok: made.length === 3 && new Set(made.map(r => r.grp)).size === 1 && !!row && row.name === 'Ace, Saber, Wisp' && row.by === 'By Saber' && row.lit && !!pill && pill.radius > 8 && pill.text === 'Meeting', detail: JSON.stringify({ row, pill, n: made.length }) }
  })

  await step('A9 ALL AVAIL through "+ Input": several days are refused in words and nothing is saved; one day is saved as ONE record, its row reads "ALL AVAIL" and "By Saber"', async () => {
    await plus(page, T)
    await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', 'allavail')
    await pick(page, '2026-07-28', T); await pick(page, '2026-07-30', T)
    const before = await count(page)
    await clearToast(page); await page.locator('#inpEditSave').click(); await page.waitForTimeout(300)
    const refused = await toast(page), still = await count(page)
    await pick(page, '2026-07-28', T)
    const had = await ids(page)
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    if (await page.locator('[data-testid="oilconf"]').count()) await answerOil(page, T, 'no')
    const made = await newest(page, had)
    const row = made[0] && await rowOf(page, made[0].iid)
    return { ok: /one day at a time/.test(refused) && still === before && made.length === 1 && made[0].person === 'allavail' && !made[0].grp && !!row && row.name === 'ALL AVAIL' && row.by === 'By Saber', detail: JSON.stringify({ refused, made, row }) }
  })

  await step('A10 A POSTED-OUT MAN, for an admin’s NEW input: archive a man on Admin → Users, then "+ Input" offers him under "Posted out / archived" and a leave is filed for him', async () => {
    /* through the app's own door: Admin → Users → the man's Archive */
    const who = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].archived && !window.PEOPLE[k].special && !window.PEOPLE[k].deleted) || null)
    let gone = who, how = 'the demo already holds a posted-out man'
    if (!gone) {
      const pid = await id('Ridge')
      await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
      if (!(await page.locator('#accList:visible').count())) { await page.getByText('Sign-in and roster').first().click(); await page.waitForTimeout(600) }
      await page.locator(`#accList [data-person="${pid}"]`).first().click(); await page.waitForTimeout(400)
      await page.getByRole('button', { name: 'Archive', exact: true }).first().click(); await page.waitForTimeout(700)
      gone = await page.evaluate(pid => (window.PEOPLE[pid].archived ? pid : null), pid)
      how = 'Ridge archived on Admin → Users'
      await shot(page, 'A10-desk-admin-users-archived')
      if (!gone) return { ok: false, detail: 'the Archive press did not archive Ridge' }
    }
    await toList(page, T)
    await plus(page, T)
    await page.selectOption('#inpEditType', 'LL')
    const offered = await page.evaluate(g => [...(document.querySelector('#inpEditPerson optgroup[label="Posted out / archived"]')?.querySelectorAll('option') || [])].map(o => o.value).includes(g), gone)
    if (!offered) return { ok: false, detail: `${how}; the group does not offer him` }
    await page.selectOption('#inpEditPerson', gone); await pick(page, '2026-07-29', T)
    const had = await ids(page)
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    const made = await newest(page, had)
    await shot(page, 'A10-desk-posted-out')
    return { ok: made.length === 1 && made[0].person === gone && made[0].type === 'LL', detail: `${how}; ` + JSON.stringify(made) }
  })

  await step('A11 A WEEKEND DUTY: Add asks the OIL question; Cancel writes nothing and keeps the window with what was typed; Yes saves the input with its answer', async () => {
    await toList(page, T); await plus(page, T)
    await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', await id('Vapor'))
    await pick(page, '2026-07-18', T); await page.fill('#inpEditRmk', 'weekend desk')
    const before = await count(page)
    await page.locator('#inpEditSave').click()
    const sheet = page.locator('[data-testid="oilconf"]'); await sheet.waitFor({ timeout: 4000 })
    await shot(page, 'A11-desk-oil-question')
    await sheet.locator('button', { hasText: /^Cancel$/ }).click(); await page.waitForTimeout(250)
    const afterCancel = { n: await count(page), win: await page.locator(WIN).count(), rmk: await page.inputValue('#inpEditRmk') }
    const had = await ids(page)
    await page.locator('#inpEditSave').click(); await sheet.waitFor({ timeout: 4000 }); await answerOil(page, T, 'yes')
    await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 })
    const made = await newest(page, had)
    const chip = made[0] && await page.locator(`#inBody tr[data-iid="${made[0].iid}"] [data-oilrev]`).count()
    return { ok: afterCancel.n === before && afterCancel.win === 1 && /weekend desk/.test(afterCancel.rmk) && made.length === 1 && !!made[0].oil && Object.values(made[0].oil)[0] === 1 && chip === 1, detail: JSON.stringify({ afterCancel, made, chip }) }
  })

  await step('A12 A MEDICAL ENTRY with no document: Add ASKS; "Upload" writes nothing and keeps the window; "No document" files it bare. Then an UPCHIT over it shows its summary before anything is written', async () => {
    await plus(page, T)
    await page.selectOption('#inpEditType', 'OML'); await page.selectOption('#inpEditPerson', await id('Havoc'))
    await pick(page, '2026-07-21', T); await pick(page, '2026-07-23', T)
    const before = await count(page)
    await page.locator('#inpEditSave').click(); await page.locator('[data-testid="docconf"]').waitFor({ timeout: 4000 })
    await page.locator('[data-testid="docconf-upload"]').click(); await page.waitForTimeout(200)
    const up = { n: await count(page), win: await page.locator(WIN).count(), type: await page.inputValue('#inpEditType') }
    const had = await ids(page)
    await page.locator('#inpEditSave').click(); await page.locator('[data-testid="docconf"]').waitFor({ timeout: 4000 })
    await page.locator('[data-testid="docconf-nodoc"]').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 })
    const made = await newest(page, had)
    /* the upchit */
    await plus(page, T)
    await page.selectOption('#inpEditType', 'Upchit'); await page.selectOption('#inpEditPerson', await id('Havoc'))
    await pick(page, '2026-07-22', T)
    const n2 = await count(page)
    await page.locator('#inpEditSave').click()
    if (await page.locator('[data-testid="docconf"]').waitFor({ timeout: 1500 }).then(() => true, () => false)) await page.locator('[data-testid="docconf-nodoc"]').click()
    const sum = await page.locator('[data-testid="upconf"]').waitFor({ timeout: 4000 }).then(() => true, () => false)
    const words = sum ? (await page.locator('[data-testid="upconf"]').innerText()).replace(/\s+/g, ' ').slice(0, 160) : ''
    await shot(page, 'A12-desk-upchit-summary')
    const unwritten = await count(page)
    if (sum) { await page.locator('[data-testid="upconf-save"]').click(); await page.waitForTimeout(500) }
    const after = await page.evaluate(h => window.INPUTS.filter(r => r.person === h).map(r => `${r.type} ${r.date}${r.endDate ? '–' + r.endDate : ''}`).sort(), await id('Havoc'))
    return { ok: up.n === before && up.win === 1 && up.type === 'OML' && made.length === 1 && made[0].docs === 0 && made[0].endDate === 'Jul 23' && sum && unwritten === n2 && after.some(x => /^Upchit Jul 22/.test(x)) && after.some(x => /^OML Jul 21$/.test(x)), detail: JSON.stringify({ up, made, words, after }) }
  })

  await step('A13 A DOWNCHIT over a different kind of downchit asks which days win (the clash question) before anything is written', async () => {
    if (await page.locator(WIN).count()) await page.locator('#inpEditCancel').click()
    await plus(page, T)
    await page.selectOption('#inpEditType', 'ATT B'); await page.selectOption('#inpEditPerson', await id('Grit'))
    await pick(page, '2026-07-15', T); await pick(page, '2026-07-16', T)
    const before = await count(page)
    await page.locator('#inpEditSave').click()
    if (await page.locator('[data-testid="docconf"]').waitFor({ timeout: 1500 }).then(() => true, () => false)) await page.locator('[data-testid="docconf-nodoc"]').click()
    const asked = await page.locator('[data-testid="medclash"]').waitFor({ timeout: 4000 }).then(() => true, () => false)
    await shot(page, 'A13-desk-medical-clash')
    const unwritten = await count(page)
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    if (await page.locator(WIN).count()) await page.locator('#inpEditCancel').click()
    return { ok: asked && unwritten === before, detail: JSON.stringify({ asked, before, unwritten }) }
  })

  await step('A14 THE DATES AND THE HOURS: two taps make a range, a backwards second tap is a new start, AM fills 00:00–12:00, Custom frees the hours, equal hours are refused — and "till <date>" writes itself into Remarks', async () => {
    await plus(page, T)
    await page.selectOption('#inpEditType', 'LL')
    await pick(page, '2026-07-20', T); const r1 = await page.locator('#inpEditPop .rc-read').textContent(); const rm1 = await page.inputValue('#inpEditRmk')
    await pick(page, '2026-07-22', T); const r2 = await page.locator('#inpEditPop .rc-read').textContent(); const rm2 = await page.inputValue('#inpEditRmk')
    await pick(page, '2026-07-24', T); await pick(page, '2026-07-21', T); const r3 = await page.locator('#inpEditPop .rc-read').textContent()
    await page.locator('#inpEditSpan [data-span="am"]').click()
    const am = [await page.inputValue('#inpEditStart'), await page.inputValue('#inpEditEnd')]
    const hiddenAllDay = await (async () => { await page.locator('#inpEditSpan [data-span="all"]').click(); return page.locator('#inpEditStart').isHidden() })()
    await page.locator('#inpEditSpan [data-span="custom"]').click()
    await page.fill('#inpEditStart', '10:20'); await page.fill('#inpEditEnd', '10:20')
    const before = await count(page)
    await clearToast(page); await page.locator('#inpEditSave').click(); await page.waitForTimeout(250)
    const refused = await toast(page), n1 = await count(page)
    await page.locator('#inpEditCancel').click()
    return { ok: r1 === 'Jul 20' && rm1 === 'till 20 Jul' && r2 === 'Jul 20 → Jul 22' && rm2 === 'till 22 Jul' && r3 === 'Jul 21' && am.join() === '00:00,12:00' && hiddenAllDay && /not the same time/.test(refused) && n1 === before, detail: JSON.stringify({ r1, rm1, r2, rm2, r3, am, hiddenAllDay, refused }) }
  })

  await step('A15 "+ Input" pressed while a new input’s window holds typing ASKS before throwing it away; "Keep editing" keeps it, "Discard and open" starts clean', async () => {
    await plus(page, T)
    await page.selectOption('#inpEditType', 'Training'); await page.fill('#inpEditRmk', 'half typed')
    await page.locator('#inNew').click(); await page.waitForTimeout(250)
    const asked = await page.locator('[data-testid="inped-swap"]').count()
    const words = asked ? await page.locator('[data-testid="inped-swap"]').innerText() : ''
    if (asked) await page.locator('[data-testid="inped-swap-stay"]').click()
    const kept = await page.inputValue('#inpEditRmk')
    await page.locator('#inNew').click(); await page.waitForTimeout(250)
    if (await page.locator('[data-testid="inped-swap-go"]').count()) await page.locator('[data-testid="inped-swap-go"]').click()
    await page.waitForTimeout(250)
    const fresh = { rmk: await page.inputValue('#inpEditRmk'), read: await page.locator('#inpEditPop .rc-read').textContent() }
    await shot(page, 'A15-desk-swap')
    await page.locator('#inpEditCancel').click()
    return { ok: asked === 1 && kept === 'half typed' && fresh.rmk === '' && fresh.read === 'pick a start date', detail: JSON.stringify({ asked, words: words.replace(/\s+/g, ' ').slice(0, 120), kept, fresh }) }
  })

  await step('A16 THE DESKTOP ROW: nine names wrap inside the 250px Name column; a plain row is one line; "By" stands on the remark’s line; the Person filter set to the LAST name still names everyone; sorting by Name works', async () => {
    const had = await ids(page)
    await plus(page, T)
    await page.selectOption('#inpEditType', 'Event')
    await page.locator(`${WIN} [data-testid="pp-several"]`).click()
    for (const cs of ['Ranger', 'Ace', 'Drifter', 'Vapor', 'Blade', 'Cinch', 'Echo', 'Wisp']) { const b = page.locator(`${WIN} [data-pp="${await id(cs)}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
    await pick(page, '2026-07-23', T)
    if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').click()
    await page.fill('#inpEditStart', '15:00'); await page.fill('#inpEditEnd', '15:30'); await page.fill('#inpEditOwnTitle', 'Squadron photo'); await page.fill('#inpEditRmk', 'outside the hangar')
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' })
    const made = await newest(page, had)
    const m = await page.evaluate(iid => {
      const want = window.INPUTS.find(r => r.iid === iid)
      const tr = [...document.querySelectorAll('#inBody tr')].find(t => window.INPUTS.find(r => r.iid === t.getAttribute('data-iid'))?.grp === want.grp)
      const name = tr.querySelector('[data-label="Name"]'), btn = name.querySelector('.in-open'), rmk = tr.querySelector('[data-label="Remarks"]'), by = rmk.querySelector('.in-placed')
      const rg = document.createRange(); rg.selectNodeContents(btn)
      const text = [...rmk.childNodes].find(x => x.nodeType === 3 && x.textContent.trim()); const tr2 = document.createRange(); tr2.selectNodeContents(text)
      const plain = [...document.querySelectorAll('#inBody tr')].filter(t => !t.querySelector('.intitle') && !t.querySelector('.rclip, .roil') && !/,/.test(t.querySelector('[data-label="Name"]').textContent)).map(t => Math.round(t.getBoundingClientRect().height))
      return { names: btn.textContent, lines: new Set([...rg.getClientRects()].map(r => Math.round(r.top))).size, nameW: Math.round(name.getBoundingClientRect().width), inCol: btn.getBoundingClientRect().right <= name.getBoundingClientRect().right + 0.5,
        by: by.textContent, sameLine: Math.abs(by.getBoundingClientRect().top - tr2.getBoundingClientRect().top) <= 6, gap: Math.round(by.getBoundingClientRect().left - tr2.getBoundingClientRect().right), plainMax: Math.max(...plain), plainMin: Math.min(...plain), wide: document.documentElement.scrollWidth <= innerWidth }
    }, made[0].iid)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.selectOption('#inFPerson', await id('Wisp')); await page.waitForTimeout(200)
    const filtered = (await rowOf(page, made[0].iid))?.name
    await page.selectOption('#inFPerson', 'all')
    await page.locator('#intbl thead th[data-sort="name"]').click(); await page.waitForTimeout(200)
    const sorted = await page.evaluate(() => [...document.querySelectorAll('#inBody tr [data-label="Name"]')].map(x => x.textContent.split(', ')[0].toLowerCase()))
    const inOrder = sorted.every((v, i) => !i || sorted[i - 1].localeCompare(v) <= 0)
    await page.locator('#intbl thead th[data-sort="start"]').click()
    await page.evaluate(iid => { const want = window.INPUTS.find(r => r.iid === iid); [...document.querySelectorAll('#inBody tr')].find(t => window.INPUTS.find(r => r.iid === t.getAttribute('data-iid'))?.grp === want.grp)?.scrollIntoView({ block: 'center' }) }, made[0].iid)
    await page.waitForTimeout(300); await shot(page, 'A16-desk-nine-names')
    return { ok: made.length === 9 && m.names.split(', ').length === 9 && m.lines >= 2 && m.nameW === 250 && m.inCol && m.by === 'By Saber' && m.sameLine && m.gap >= 8 && m.plainMax <= 42 && m.wide && filtered === m.names && inOrder, detail: JSON.stringify({ ...m, filtered, inOrder }) }
  })

  await step('A17 THE EMPTY LIST says its dates in few words — one month, across two months, across a year, a start alone — and "No inputs match." under all dates', async () => {
    await page.evaluate(() => window.scrollTo(0, 0))
    const out = {}
    const range = async (a, b) => {
      if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').click()
      const go = async iso => { for (let i = 0; i < 40 && !(await page.locator(`#inRangeCal [data-cal="${iso}"]`).count()); i++) { const [m, y] = (await page.locator('#inRangeCal .rc-mon').textContent()).split(' '); const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`; await page.locator(`#inRangeCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click() } await page.locator(`#inRangeCal [data-cal="${iso}"]`).click() }
      await go(a); if (b) await go(b)
      await page.waitForTimeout(150)
      return (await page.locator('#inEmpty').isVisible()) ? await page.locator('#inEmpty').textContent() : '(not empty)'
    }
    await page.fill('#inFSearch', 'zzz-nothing-matches-this')
    out.oneMonth = await range('2026-03-10', '2026-03-24')
    out.twoMonths = await range('2026-03-28', '2026-04-03')
    out.overYear = await range('2026-12-28', '2027-01-03')
    out.startOnly = await range('2026-03-10', null)
    await shot(page, 'A17-desk-empty-list')
    await page.locator('#inRangeAll').click(); await page.waitForTimeout(150)
    out.all = await page.locator('#inEmpty').textContent()
    await page.fill('#inFSearch', '')
    return { ok: out.oneMonth === 'No inputs 10–24 Mar. Try All dates.' && out.twoMonths === 'No inputs 28 Mar – 3 Apr. Try All dates.' && out.overYear === 'No inputs 28 Dec – 3 Jan 2027. Try All dates.' && out.startOnly === 'No inputs from 10 Mar. Try All dates.' && out.all === 'No inputs match.', detail: JSON.stringify(out) }
  })

  await step('A18 "TILL" SAID ONCE: Grit’s ATT C (13–17 Jul, "Medically down till 17 Jul") — the opened day’s card on its first day and a middle day says the corner’s "till 17 Jul" and the remark "Medically down"; on its LAST day the corner says "All day" and the remark is whole; the desktop row and the window keep it whole', async () => {
    const iid = await page.evaluate(() => window.INPUTS.find(r => r.type === 'ATT C' && /till 17 Jul/.test(r.remarks || ''))?.iid)
    if (!iid) return { ok: false, detail: 'the demo no longer holds Grit’s ATT C' }
    const card = async iso => { await openDay(page, iso, T); await page.waitForTimeout(200); return page.evaluate(iid => { const c = document.querySelector(`[data-testid="idy-row-${iid}"]`); return c ? { when: c.querySelector('[data-testid="idy-when"]')?.textContent, rmk: c.querySelector('[data-testid="idy-rmk"]')?.textContent ?? null } : null }, iid) }
    const first = await card('2026-07-13'); await shot(page, 'A18-desk-day-13jul')
    const mid = await card('2026-07-15'), last = await card('2026-07-17')
    await page.keyboard.press('Escape')
    await toList(page, T)
    const rowRmk = await page.evaluate(iid => document.querySelector(`#inBody tr[data-iid="${iid}"] [data-label="Remarks"]`)?.textContent, iid)
    await page.locator(`#inBody tr[data-iid="${iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    const winRmk = await page.inputValue('#inpEditRmk'); await page.locator('#inpEditCancel').click()
    const stored = await page.evaluate(iid => window.INPUTS.find(r => r.iid === iid).remarks, iid)
    const good = c => c && c.when === 'till 17 Jul' && c.rmk === 'Medically down'
    return { ok: good(first) && good(mid) && last && last.when === 'All day' && last.rmk === 'Medically down till 17 Jul' && /Medically down till 17 Jul/.test(rowRmk) && winRmk === 'Medically down till 17 Jul' && stored === 'Medically down till 17 Jul', detail: JSON.stringify({ first, mid, last, rowRmk, winRmk }) }
  })

  await step('A19 …and when the dates are CHANGED in the window the remark follows, and the card still says it once: a Training 27–29 Jul with a typed remark, moved to 27–30', async () => {
    await toList(page, T); await plus(page, T)
    const had = await ids(page)
    await page.selectOption('#inpEditType', 'Training'); await page.selectOption('#inpEditPerson', await id('Blade'))
    await pick(page, '2026-07-27', T); await pick(page, '2026-07-29', T)
    await page.fill('#inpEditRmk', 'bring ID card till 29 Jul')
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' })
    const made = await newest(page, had)
    await page.locator(`#inBody tr[data-iid="${made[0].iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    await pick(page, '2026-07-27', T); await pick(page, '2026-07-30', T)
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' })
    const stored = await page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return { rmk: r.remarks, end: r.endDate } }, made[0].iid)
    await openDay(page, '2026-07-28', T); await page.waitForTimeout(200)
    const card = await page.evaluate(iid => { const c = document.querySelector(`[data-testid="idy-row-${iid}"]`); return c ? { when: c.querySelector('[data-testid="idy-when"]')?.textContent, rmk: c.querySelector('[data-testid="idy-rmk"]')?.textContent ?? null } : null }, made[0].iid)
    await shot(page, 'A19-desk-day-28jul')
    await page.keyboard.press('Escape')
    return { ok: stored.end === 'Jul 30' && stored.rmk === 'bring ID card till 30 Jul' && !!card && /till 30 Jul$/.test(card.when) && card.rmk === 'bring ID card', detail: JSON.stringify({ stored, card }) }
  })

  await step('A20 THE MONTH: a shared bar reads its count first and no bar says "+N"; a timed bar is PAINTED lighter with a solid edge and an all-day one is not; the key says "duty"; the fold is four lines; a shared bar’s tooltip still names everyone', async () => {
    await toCal(page, T)
    const m = await page.evaluate(() => {
      const bars = [...document.querySelectorAll('.ib-bar')]
      const lum = c => { const v = c.match(/[\d.]+/g).map(Number); const k = /srgb/.test(c) ? 255 : 1; return Math.round((0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) * k) }
      const paint = b => ({ t: b.textContent, timed: b.classList.contains('timed'), tone: b.classList.contains('red') ? 'red' : 'amb', lum: lum(getComputedStyle(b).backgroundColor), shadow: getComputedStyle(b).boxShadow })
      const all = bars.map(paint)
      const four = bars.find(b => /^4 · Meeting$/.test(b.textContent))
      return { plusN: all.filter(b => /\+\d/.test(b.t)).map(b => b.t), counts: all.filter(b => /^\d+ · /.test(b.t)).map(b => b.t), tip: four?.title || '',
        timedNoEdge: all.filter(b => b.timed && !/inset/.test(b.shadow)).length, solidWithEdge: all.filter(b => !b.timed && b.shadow !== 'none').length,
        ambSolid: [...new Set(all.filter(b => !b.timed && b.tone === 'amb').map(b => b.lum))], ambTimed: [...new Set(all.filter(b => b.timed && b.tone === 'amb').map(b => b.lum))], redSolid: [...new Set(all.filter(b => !b.timed && b.tone === 'red').map(b => b.lum))], redTimed: [...new Set(all.filter(b => b.timed && b.tone === 'red').map(b => b.lum))],
        key: [...document.querySelectorAll('[data-testid="ib-legend"] .ib-key')].map(k => k.textContent) }
    })
    await shot(page, 'A20-desk-month')
    await page.locator('[data-testid="ib-how"]').click()
    const fold = await page.locator('[data-testid="ib-how-list"] li').allInnerTexts()
    await shot(page, 'A20-desk-month-fold')
    await page.locator('[data-testid="ib-how"]').click()
    const lighter = m.ambTimed.length && m.ambSolid.length ? Math.max(...m.ambTimed) < Math.min(...m.ambSolid) : null
    return { ok: !m.plusN.length && m.counts.includes('4 · Meeting') && m.counts.includes('9 · Squadron photo') && m.counts.includes('3 · Meeting') && /Drifter/.test(m.tip) && /Saber/.test(m.tip) && m.timedNoEdge === 0 && m.solidWithEdge === 0 && lighter === true && m.key.join('|') === 'absence|duty' && fold.length === 4 && fold[0] === 'Tap a day to open it. Tap a bar to edit it, drag to move it.' && fold[2] === 'NF no-fly · green public holiday · grey Off day.', detail: JSON.stringify({ ...m, fold, lighter }) }
  })

  await step('A21 THE WINDOW’S WORDS: a new input from a day — none; a saved one-person input — none; a saved shared input — "Date changes apply to all 4."; after a man is added and saved — "…all 5."', async () => {
    await openDay(page, '2026-07-20', T); await page.locator('#icPopAdd').click(); await page.locator(WIN).waitFor()
    const fresh = await page.locator(`${WIN} .inped-hint`).count(); const read = await page.locator('#inpEditPop .rc-read').textContent()
    await page.locator('#inpEditCancel').click(); await page.keyboard.press('Escape')
    await toList(page, T)
    const one = await page.evaluate(() => window.INPUTS.find(r => r.type === 'Appointment' && !r.grp)?.iid)
    await page.locator(`#inBody tr[data-iid="${one}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    const solo = await page.locator(`${WIN} .inped-hint`).count(); const placed = await page.locator('[data-testid="inped-placed"]').count() ? await page.locator('[data-testid="inped-placed"]').textContent() : ''
    await page.locator('#inpEditCancel').click()
    const four = await page.evaluate(() => { const g = window.INPUTS.find(r => r.grp && r.type === 'Meeting' && /Flight safety/.test(r.remarks || '')); return g ? window.INPUTS.filter(r => r.grp === g.grp).map(r => r.iid) : [] })
    const openGroup = async () => { const sel = four.map(i => `#inBody tr[data-iid="${i}"] [data-testid="in-open"]`).join(', '); await page.locator(sel).first().click(); await page.locator(WIN).waitFor() }
    await openGroup()
    const shared = await page.locator(`${WIN} .inped-hint`).textContent()
    await page.locator(`${WIN} .inped-hint`).scrollIntoViewIfNeeded(); await shot(page, 'A21-desk-shared-window-words')
    await page.locator(`${WIN} [data-pp="${await id('Havoc')}"]`).click()
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    if (await page.locator('[data-testid="oilconf"]').count()) await answerOil(page, T, 'no')
    await openGroup()
    const five = await page.locator(`${WIN} .inped-hint`).textContent()
    await page.locator('#inpEditCancel').click()
    return { ok: fresh === 0 && read === 'Jul 20' && solo === 0 && /^Placed by /.test(placed) && shared === 'Date changes apply to all 4.' && five === 'Date changes apply to all 5.', detail: JSON.stringify({ fresh, read, solo, placed, shared, five }) }
  })

  await step('A22 NOT CHANGED — the SANS calendar’s "+ Commitment" keeps its own line ("…your available hours…"), carries no "?" card and no posted-out group', async () => {
    await page.locator('#inSansMode').click(); await page.waitForTimeout(400)
    const cell = page.locator('[data-scday]:not([disabled]), [data-testid^="sc-day-"]').nth(14)
    await cell.click({ position: { x: 8, y: 8 } }).catch(() => {})
    const dayWin = page.locator('[data-testid="win-sansday"]'); await dayWin.waitFor({ timeout: 4000 })
    await dayWin.locator('button', { hasText: /Commitment/ }).first().click(); await page.locator(WIN).waitFor({ timeout: 4000 })
    const m = await page.evaluate(() => ({ hint: document.querySelector('[data-testid="win-inputedit"] .inped-hint')?.textContent || '', help: document.querySelectorAll('[data-testid="win-inputedit"] #inTypeHelp').length, archived: document.querySelectorAll('#inpEditPerson optgroup[label="Posted out / archived"]').length, typeFixed: document.querySelector('#inpEditTypeFixed')?.textContent }))
    await shot(page, 'A22-desk-sans-commitment')
    await page.locator('#inpEditCancel').click(); await page.keyboard.press('Escape'); await page.locator('#inMemberMode').click(); await page.waitForTimeout(300)
    return { ok: /your available hours/.test(m.hint) && m.help === 0 && m.archived === 0, detail: JSON.stringify(m) }
  })

  await step('A23 NOT CHANGED — an input opened from EDIT SCHEDULE is the schedule’s own dialog: its old line of words, no "?" card, Save not Add', async () => {
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500)
    const key = await page.evaluate(() => { for (const el of document.querySelectorAll('[data-inpedit]')) { const r = window.INPUTS.find(x => x.iid === el.getAttribute('data-inpedit')); if (r && !/SANS/.test(r.type) && el.getClientRects().length) return el.getAttribute('data-inpedit') } return null })
    if (!key) return { ok: false, detail: 'no ordinary input row with its edit door on Edit Schedule this week' }
    const el = page.locator(`[data-inpedit="${key}"]`).first()
    await el.scrollIntoViewIfNeeded(); await el.click(); await page.waitForTimeout(400)
    const m = await page.evaluate(() => { const pop = document.querySelector('#inpEditPop'); return { open: !!pop && !pop.hidden, floating: !!document.querySelector('[data-testid="win-inputedit"]'), hint: pop?.querySelector('.inped-hint')?.textContent || '', help: pop?.querySelectorAll('#inTypeHelp').length, typeLabel: pop?.querySelector('label[for="inpEditType"]')?.textContent || '' } })
    await shot(page, 'A23-desk-schedule-dialog')
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    return { ok: m.open && !m.floating && /changed on the Inputs page/.test(m.hint) && m.help === 0 && m.typeLabel === 'Type', detail: JSON.stringify(m) }
  })

  await step('A24 THE GEAR’S SETTINGS: one short line under each of the three, the worked example kept, and a Save still saves', async () => {
    await toCal(page, T)
    await page.locator('#inGear').click(); const w = page.locator('[data-testid="win-inputsset"]'); await w.waitFor()
    const m = await w.evaluate(el => ({ hints: [...el.querySelectorAll('.sset-hint')].map(h => h.textContent), check: el.querySelector('.sset-check span')?.textContent, example: el.querySelector('.sset-example')?.textContent || '' }))
    await shot(page, 'A24-desk-gear')
    const box = w.locator('[data-testid="iset-memberfile"]'); const was = await box.isChecked()
    await box.click(); await w.locator('[data-testid="iset-save"]').click(); await page.waitForTimeout(400)
    await page.locator('#inGear').click(); await w.waitFor()
    const now = await w.locator('[data-testid="iset-memberfile"]').isChecked()
    await w.locator('[data-testid="iset-memberfile"]').click(); await w.locator('[data-testid="iset-save"]').click(); await page.waitForTimeout(300)
    return { ok: m.hints.join('|') === 'Day, night or no-fly dates, and holidays.|Later than this is LATE. Medical is never late.|Never leave, medical or SANS.' && m.check === 'Members may file duties for others' && /^For the week of /.test(m.example) && now === !was, detail: JSON.stringify({ ...m, was, now }) }
  })
  await ctx.close()
}

/* ══════════════════ B · A DESKTOP, A MEMBER (Ranger) ══════════════════ */
{
  const { ctx, page } = await open({ width: 1440, height: 900 }, 'us', 'us')
  const T = false
  const id = cs => csId(page, cs)
  await step('B1 a member: "+ Input" opens on HIMSELF; for a duty he has a list and the switch; turned into leave his Person is a plain value — no list, no switch, no posted-out group; no gear', async () => {
    await toList(page, T); await plus(page, T)
    await page.selectOption('#inpEditType', 'Meeting')
    const duty = await page.evaluate(() => ({ sel: document.querySelector('#inpEditPerson')?.selectedOptions[0]?.textContent, sw: document.querySelectorAll('[data-testid="win-inputedit"] [data-testid="pp-several"]').length, arch: document.querySelectorAll('#inpEditPerson optgroup[label="Posted out / archived"]').length }))
    await page.selectOption('#inpEditType', 'LL')
    const leave = await page.evaluate(() => ({ sel: document.querySelectorAll('#inpEditPerson').length, fixed: document.querySelector('#inpEditPersonFixed')?.textContent, sw: document.querySelectorAll('[data-testid="win-inputedit"] [data-testid="pp-several"]').length }))
    const gear = await page.locator('#inGear').count()
    await shot(page, 'B1-member-new-leave')
    return { ok: duty.sel === 'Ranger' && duty.sw === 1 && duty.arch === 0 && leave.sel === 0 && leave.fixed === 'Ranger' && leave.sw === 0 && gear === 0, detail: JSON.stringify({ duty, leave, gear }) }
  })
  await step('B2 he files his own leave: saved for him; its row is lit and says NO "By" (the first column already says who)', async () => {
    const had = await ids(page)
    await pick(page, '2026-07-24', T)
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' })
    const made = await newest(page, had)
    await page.selectOption('#inFPerson', 'all')
    const row = made[0] && await rowOf(page, made[0].iid)
    return { ok: made.length === 1 && made[0].cs === 'Ranger' && made[0].type === 'LL' && !!row && row.by === '' && row.lit, detail: JSON.stringify({ made, row }) }
  })
  await step('B3 he files a DUTY for another man: saved for that man, its row says "By Ranger"; a LEAVE for another man cannot even be picked, and a hand-turned one is refused in words', async () => {
    await plus(page, T)
    await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', await id('Blade'))
    await pick(page, '2026-07-22', T)
    const had = await ids(page)
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 })
    const made = await newest(page, had)
    const row = made[0] && await rowOf(page, made[0].iid)
    await plus(page, T)
    await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', await id('Blade'))
    await page.selectOption('#inpEditType', 'LL'); await pick(page, '2026-07-22', T)
    const why = await page.locator('[data-testid="pp-why"]').count() ? await page.locator('[data-testid="pp-why"]').innerText() : ''
    const before = await count(page)
    await clearToast(page); await page.locator('#inpEditSave').click(); await page.waitForTimeout(250)
    const refused = await toast(page), n1 = await count(page)
    await shot(page, 'B3-member-leave-for-another')
    await page.locator('#inpEditCancel').click()
    return { ok: made.length === 1 && made[0].cs === 'Blade' && !!row && row.by === 'By Ranger' && /only for yourself/.test(why) && /only for yourself/.test(refused) && n1 === before, detail: JSON.stringify({ made, row, why: why.replace(/\s+/g, ' ').slice(0, 90), refused }) }
  })
  await step('B4 another man’s input opens for him READ ONLY: no Save, no Delete, no line of instructions, and the "?" card still opens', async () => {
    const other = await page.evaluate(() => window.INPUTS.find(r => r.type === 'Appointment' && !r.grp && window.PEOPLE[r.person]?.cs !== 'Ranger' && r.by !== Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ranger'))?.iid)
    await page.locator(`#inBody tr[data-iid="${other}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    const m = await page.evaluate(() => ({ save: document.querySelectorAll('#inpEditSave').length, del: document.querySelectorAll('#inpEditDel').length, hint: document.querySelectorAll('[data-testid="win-inputedit"] .inped-hint').length, ro: document.querySelector('[data-testid="inped-ro"]')?.textContent || '', inert: !!document.querySelector('[data-testid="win-inputedit"] .inped-body')?.hasAttribute('inert') }))
    await shot(page, 'B4-member-read-only')
    await page.locator('#inpEditCancel').click()
    return { ok: m.save === 0 && m.del === 0 && m.hint === 0 && /can change this/.test(m.ro), detail: JSON.stringify(m) }
  })
  await ctx.close()
}

/* ══════════════════ C · A PHONE, BY TOUCH, THE ADMIN ══════════════════ */
for (const size of [{ width: 390, height: 844 }, { width: 390, height: 568 }]) {
  const { ctx, page } = await open(size, 'ad', 'a', true)
  const T = true, tag = `${size.width}x${size.height}`
  const id = cs => csId(page, cs)
  await step(`C1 ${tag} — the List opens on its cards under ONE "+ Input": no form, the button a finger’s size, the first heading in the top half of the screen`, async () => {
    await toList(page, T); await page.evaluate(() => window.scrollTo(0, 0))
    const m = await page.evaluate(() => { const add = document.querySelector('#inNew').getBoundingClientRect(), first = document.querySelector('[data-testid="inl-day"]').getBoundingClientRect(); return { form: document.querySelectorAll('.inbar, #inAdd').length, addH: Math.round(add.height), addTop: Math.round(add.top), listTop: Math.round(first.top), h: innerHeight, wide: document.documentElement.scrollWidth } })
    await shot(page, `C1-phone-${tag}-list`)
    return { ok: m.form === 0 && m.addH >= 44 && m.listTop < m.h * 0.62 && m.wide <= size.width, detail: JSON.stringify(m) }
  })
  await step(`C2 ${tag} — the filters open with NO words over their three boxes, and each box says what it is`, async () => {
    await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(250)
    const m = await page.evaluate(() => ({ spans: document.querySelectorAll('#inFilters label > span').length, text: document.querySelector('#inFilters').innerText.replace(/\s+/g, ' ').slice(0, 60), person: document.querySelector('#inFPerson').selectedOptions[0].textContent, type: document.querySelector('#inFType').selectedOptions[0].textContent, search: document.querySelector('#inFSearch').placeholder, visible: document.querySelector('#inFPerson').getBoundingClientRect().height > 30 }))
    await shot(page, `C2-phone-${tag}-filters`)
    await page.locator('#inFiltersBtn').tap()
    return { ok: m.spans === 0 && m.person === 'Everyone' && m.type === 'All types' && m.search === 'Search inputs' && m.visible, detail: JSON.stringify(m) }
  })
  await step(`C3 ${tag} — "+ Input": the window; the "?" card opens inside it, its last line can be scrolled to above the pinned buttons, and Add is still the thing a tap on it reaches`, async () => {
    await page.locator('#inNew').tap(); await page.locator(WIN).waitFor()
    await page.locator('#inTypeHelp').tap(); await page.locator('#inTypePop').waitFor()
    const m = await page.evaluate(() => { const win = document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect(), pop = document.querySelector('#inTypePop').getBoundingClientRect(), save = document.querySelector('#inpEditSave').getBoundingClientRect(); const hit = document.elementFromPoint(save.left + save.width / 2, save.top + save.height / 2); return { inside: pop.left >= win.left - 0.5 && pop.right <= win.right + 0.5, w: Math.round(pop.width), saveReached: !!hit?.closest('#inpEditSave'), saveOnScreen: save.bottom <= innerHeight + 0.5, wide: document.documentElement.scrollWidth } })
    await shot(page, `C3-phone-${tag}-help-card`)
    await page.locator('#inTypePop .tylegend-r').last().scrollIntoViewIfNeeded()
    const clear = await page.evaluate(() => { const rows = document.querySelectorAll('#inTypePop .tylegend-r'); const r = rows[rows.length - 1].getBoundingClientRect(), f = document.querySelector('#inpEditPop .airpop-foot').getBoundingClientRect(); return r.bottom <= f.top + 0.5 })
    await shot(page, `C3-phone-${tag}-help-card-end`)
    await page.locator('#inTypeHelp').scrollIntoViewIfNeeded(); await page.locator('#inTypeHelp').tap(); await page.waitForTimeout(150)
    const closed = await page.locator('#inTypePop').count() === 0 && await page.locator(WIN).count() === 1
    return { ok: m.inside && m.w >= 280 && m.saveReached && m.saveOnScreen && m.wide <= size.width && clear && closed, detail: JSON.stringify({ ...m, clear, closed }) }
  })
  await step(`C4 ${tag} — a leave of three days added by finger while a search hides it: its card stands first under its day’s heading, lit; the corner says "till 30 Jul" and the card says it ONCE`, async () => {
    await page.locator('#inpEditCancel').tap()
    await page.locator('#inFiltersBtn').tap(); await page.fill('#inFSearch', 'zzz-nothing'); await page.locator('#inFiltersBtn').tap()
    await page.locator('#inNew').tap(); await page.locator(WIN).waitFor()
    await page.selectOption('#inpEditType', 'LL'); await page.selectOption('#inpEditPerson', await id('Cinch'))
    await pick(page, '2026-07-28', T); await pick(page, '2026-07-30', T)
    const rmk = await page.inputValue('#inpEditRmk')
    const had = await ids(page)
    await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden' }); await page.waitForTimeout(500)
    const made = await newest(page, had)
    const m = await page.evaluate(iid => { const c = document.querySelector(`[data-testid="inl-row-${iid}"]`); if (!c) return null; const all = [...document.querySelectorAll('[data-testid^="inl-row-"]')]; const head = c.previousElementSibling; const b = c.getBoundingClientRect(); return { first: all.indexOf(c) === 0, lit: c.classList.contains('innew'), head: head?.getAttribute('data-testid') === 'inl-day' ? head.querySelector('b').textContent : '', when: c.querySelector('[data-testid="inl-when"]').textContent, rmk: c.querySelector('[data-testid="inl-rmk"]')?.textContent ?? null, tills: (c.textContent.match(/till 30 Jul/g) || []).length, onScreen: b.top >= 0 && b.bottom <= innerHeight, cards: all.length } }, made[0]?.iid)
    await shot(page, `C4-phone-${tag}-added-card`)
    await page.locator('#inFiltersBtn').tap(); await page.fill('#inFSearch', ''); await page.locator('#inFiltersBtn').tap()
    return { ok: rmk === 'till 30 Jul' && made.length === 1 && made[0].remarks === 'till 30 Jul' && !!m && m.first && m.lit && /28 Jul/i.test(m.head) && m.when === 'till 30 Jul' && m.rmk === null && m.tills === 1 && m.onScreen && m.cards === 1, detail: JSON.stringify({ rmk, m }) }
  })
  await step(`C5 ${tag} — the month: a shared bar reads "4 · Meeting" (never "+N"), timed bars are painted lighter; the fold and the key share a line and fit the screen`, async () => {
    await toCal(page, T)
    const m = await page.evaluate(() => { const bars = [...document.querySelectorAll('.ib-bar')]; const how = document.querySelector('[data-testid="ib-how"]').getBoundingClientRect(), key = document.querySelector('[data-testid="ib-legend"]').getBoundingClientRect(); return { four: bars.some(b => /^4 · Meeting$/.test(b.textContent)), plusN: bars.filter(b => /\+\d/.test(b.textContent)).length, timedEdge: bars.filter(b => b.classList.contains('timed')).every(b => /inset/.test(getComputedStyle(b).boxShadow)), timed: bars.filter(b => b.classList.contains('timed')).length, oneLine: Math.abs((how.top + how.height / 2) - (key.top + key.height / 2)) <= 8, keyRight: Math.round(key.right), key: document.querySelector('[data-testid="ib-legend"]').innerText.replace(/\s+/g, ' ') } })
    await shot(page, `C5-phone-${tag}-month`)
    return { ok: m.four && m.plusN === 0 && m.timedEdge && m.timed > 0 && m.oneLine && m.keyRight <= size.width, detail: JSON.stringify(m) }
  })
  await step(`C6 ${tag} — a day opened on the phone: Grit’s card says "till 17 Jul" once, and the shared meeting’s card names all four`, async () => {
    await openDay(page, '2026-07-13', T); await page.waitForTimeout(300)
    const grit = await page.evaluate(() => { const r = window.INPUTS.find(x => x.type === 'ATT C' && /till 17 Jul/.test(x.remarks || '')); const c = r && document.querySelector(`[data-testid="idy-row-${r.iid}"]`); return c ? { when: c.querySelector('[data-testid="idy-when"]').textContent, rmk: c.querySelector('[data-testid="idy-rmk"]')?.textContent ?? null, tills: (c.textContent.match(/till 17 Jul/g) || []).length } : null })
    await shot(page, `C6-phone-${tag}-day-13jul`)
    await openDay(page, '2026-07-23', T); await page.waitForTimeout(300)
    const who = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid="idy-who"]')].map(x => x.textContent))
    await page.keyboard.press('Escape')
    return { ok: !!grit && grit.when === 'till 17 Jul' && grit.rmk === 'Medically down' && grit.tills === 1 && who.includes('Drifter, Echo, Ranger, Saber'), detail: JSON.stringify({ grit, who }) }
  })
  await ctx.close()
}

await browser.close()
console.log(`\n${n - bad} of ${n} PASS${bad ? ` — ${bad} FAIL` : ''}`)
console.log(errs.length ? 'ERRORS SEEN:\n' + [...new Set(errs)].join('\n') : 'no page errors, no failed requests')
process.exit(bad ? 1 : 0)
