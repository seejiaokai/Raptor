// draw-s1-notes - section 1 (Core, the guard rail): the grey "Blocked:" notes still owed (chat 191, 26 Nov 26).
// The note is the app's own (window.toast(text, 'blocked')), its fade stopped; ONLY its place is changed (n175's raise /
// place): on a desktop just under the control pressed (D2590), on a phone at the foot (D2590, D2627 A14, A15). The press
// itself is not made: the picker's list is opened and closed again (or the ☰ menu's list), as the built guard leaves it.
// What is new in the app - the note - is ringed teal (2px dashed #0D9488, 4px clear). Words from ./words-s1.mjs.
// Three squadrons (142, 149, 150) in every picture: n176's world, or, for the Undo of "+ New squadron", 150 made by the
// picture itself from the two seeded squadrons (his E7 case: Saber makes 150, picks it, opens a window, presses Undo).
//  undo-d / undo-p     1.29  Undo of "+ New squadron" refused (D2654 E7): desktop an Input window open, the note under
//                            Undo; phone the Calendar with a holiday half done (an Input window covers Undo on a phone),
//                            the note at the foot.
//  qual-d / qual-p     1.30  "LOW LEVEL" typed in Quals' "Add qualification" box, then a pick of 149 (the reading §3.2 (i)).
//  qual-other-d        1.30  the other answer: the pick goes through, 149's Quals opens with Edit and an empty box.
//  cal-<case>-<d|p>    1.27  the Calendar's notes (D2654 E1): new · changed · every · sheet · noleave · settings.
//  bellline-p          1.3   a phone: a bell line that would change squadron, refused - the list open, the line unread.
//  belltap-p           1.4   a phone: the lit bell's tap refused - the bell stays lit.
//   node raptor-port/scripts/handpass/n191/draw-s1-notes.mjs        (ONLY=undo-d,qual-p,cal-new-d,…)
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, boxOf, covered, barSq, pageOn, reachPick, windowsNow, toastNow, world, raise, noteFacts, shut, want, words, S1, tring, sshot, underCtl, atFoot, clearOfNamed, TMP1, union } from './draw-s1-lib.mjs'
import { tapBell, bellLines, bellShow, LIST, newInputWindow, pickDay, saveInput } from '../n175/p6-lib.mjs'

const N = (lead, end = S1.end.pick(149)) => S1.note(lead, end)
async function run(key, sz, fn, state) {
  const s = await mk(sz, state ? { storageState: state } : {})
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP1}/${key}-error.png` }).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
const listRows = (s, sel) => words(s, sel)
async function pickerOpenedAndClosed(s, k) {
  await hit(s, '#sqnMenuBtn', 400)
  FACT(`${k}.listOpened`, await listRows(s, '#sqnMenu .sqm-row'))
  await hit(s, '#sqnMenuBtn', 400)
  if ((await listRows(s, '#sqnMenu .sqm-row')).length) { await s.page.keyboard.press('Escape'); await wait(s, 300) }
  FACT(`${k}.listClosed`, !(await listRows(s, '#sqnMenu .sqm-row')).length)
}
async function menuListOpenedAndClosed(s, k) {
  FACT(`${k}.burger`, await covered(s, '#burger'))
  await hit(s, '#burger', 500)
  if (!(await s.page.locator('#drawerSqnList').count())) await hit(s, '#drawerSqnBtn', 400)
  FACT(`${k}.listOpened`, await listRows(s, '#drawerSqnList .sqm-row'))
  await shut(s)
  FACT(`${k}.menuClosed`, !(await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))))
}
/* the refusal of a pick of 149, drawn: the press made as far as the guard lets it, the note raised and placed */
async function refusePick(s, k, text, sels = {}, extra = '') {
  if (s.desk) await pickerOpenedAndClosed(s, k); else await menuListOpenedAndClosed(s, k)
  await raise(s, text)
  if (s.desk) await underCtl(s, k, '#sqnMenuBtn'); else { await atFoot(s, k); await clearOfNamed(s, k, extra) }
  const m = await noteFacts(s, k, text, { picker: '#sqnMenuBtn', burger: '#burger', ...sels })
  FACT(`${k}.state`, { squadron: await barSq(s), windows: (await windowsNow(s)).map(w => w.what) })
  return m
}
const ringNote = async (s, m) => (await tring(s, m.box, 'the note')).ring

/* ---------------- 1.29 Undo of "+ New squadron" ---------------- */
async function newSquadron(s, num) {
  const { page } = s
  await go(s, 'admin'); await wait(s, 700)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back')
  await hit(s, vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Squadrons/ }).first(), 700)
  await hit(s, '#sqNew', 500)
  await page.fill('#sqNewNum', String(num)); await page.selectOption('#sqNewPlace', 'p1').catch(() => {})
  await page.selectOption('#sqNewAdmin', { label: 'Kestrel · 149' })
  await hit(s, '#sqNewSave', 1000)
  return { toast: await toastNow(s), list: (await page.locator('#sqList').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 160) }
}
const undoNow = s => s.page.evaluate(() => { const b = [...document.querySelectorAll('[aria-label="Undo"]')].find(e => e.getBoundingClientRect().width > 0); return b ? { id: b.id, title: b.title, greyed: b.disabled } : null })
async function openCalendar(s, { closeSettings = true } = {}) {
  await go(s, 'inputs'); await wait(s, 600)
  await hit(s, '#inGear', 600)
  await hit(s, '[data-testid="iset-days"]', 900)
  if (closeSettings && s.desk) {
    const x = await s.page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputsset"]'); const b = w && [...w.querySelectorAll('button')].find(b => /close/i.test(b.getAttribute('aria-label') || '') || b.textContent.trim() === '✕'); if (b) { b.setAttribute('data-s1x', '1'); return true } return false })
    if (x) await hit(s, '[data-s1x]', 600)
  }
  return (await windowsNow(s)).map(w => w.what)
}
async function holidaysTab(s) { if (await vis(s, '[data-testid="days-tab-holidays"]').count()) await hit(s, '[data-testid="days-tab-holidays"]', 500) }
async function typeName(s, text) {
  const l = vis(s, '[data-testid="hol-name"]').first()
  if (s.desk) { await l.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(text) }
  else await l.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, text)
  await wait(s, 250); await s.page.evaluate(() => document.activeElement?.blur?.())
  return l.inputValue()
}
const calWin = s => boxOf(s, '.floatwin.dayswin')

if (want('undo-d')) await run('undo-d', 'd', async s => {
  const k = 's1.undo.d', text = N(S1.lead.window, S1.end.undo)
  await signIn(s, 'ad', 'a'); FACT(`${k}.newSquadron`, await newSquadron(s, 150))
  await reachPick(s, 150, 'bar'); await wait(s, 700)
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  await hit(s, '#inNew', 800)
  const r = vis(s, '#inpEditRmk').first(); await r.click(); await s.page.keyboard.type('Ground school brief')
  FACT(`${k}.state.before`, { squadron: await barSq(s), undo: await undoNow(s), undoCovered: await covered(s, '#undoBtn'), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 60)) })
  await raise(s, text); await underCtl(s, k, '#undoBtn', 'left')
  const m = await noteFacts(s, k, text, { undo: '#undoBtn', window: '.inpedwin', windowX: '.inpedwin .win-x' })
  FACT(`${k}.state.after`, { squadron: await barSq(s), undo: await undoNow(s) })
  const ring = await ringNote(s, m), u = await boxOf(s, '#undoBtn'), w = await boxOf(s, '.inpedwin'), mk_ = await boxOf(s, '.topbar .mark')
  FACT(k + '.bar', { mark: mk_, reads: await barSq(s) }); await sshot(s, 'undo-d', [ring, u, { x: w.x, y: w.y, w: w.w, h: 90 }], 16)
})
if (want('undo-p')) await run('undo-p', 'p', async s => {
  const k = 's1.undo.p', text = N(S1.lead.holNewUndo, S1.end.undo)
  await signIn(s, 'ad', 'a'); FACT(`${k}.newSquadron`, await newSquadron(s, 150))
  await reachPick(s, 150, 'menu'); await wait(s, 700)
  FACT(`${k}.calendar`, await openCalendar(s)); await holidaysTab(s); await hit(s, '[data-testid="hol-add"]', 600)
  FACT(`${k}.typed`, await typeName(s, 'Squadron Day'))
  FACT(`${k}.state.before`, { squadron: await barSq(s), undo: await undoNow(s), undoCovered: await covered(s, '#undoBtn'), windows: (await windowsNow(s)).map(w => w.what) })
  await raise(s, text); await atFoot(s, k); await clearOfNamed(s, k, '#undoBtn')
  const m = await noteFacts(s, k, text, { undo: '#undoBtn', cal: '.floatwin.dayswin', holName: '[data-testid="hol-name"]', holSave: '[data-testid="hol-save"]', holCancel: '[data-testid="hol-cancel"]' })
  const ring = await ringNote(s, m)
  await sshot(s, 'undo-p', [ring, { x: 0, y: 0, w: s.W, h: 60 }, await boxOf(s, '[data-testid="hol-name"]')], 8)
})

/* ---------------- 1.30 Quals' "Add qualification" box ---------------- */
async function qualTyped(s, k) {
  await go(s, 'quals'); await wait(s, 800)
  FACT(`${k}.edit`, await covered(s, '#qEdit'))
  await hit(s, '#qEdit', 700)
  FACT(`${k}.editQuals`, await covered(s, '#qEditQuals')); await hit(s, '#qEditQuals', 700)
  const box = vis(s, '#qNewQual').first()
  if (!(await box.count())) throw new Error('no Add qualification box in edit mode')
  await box.scrollIntoViewIfNeeded()
  if (s.desk) { await box.click(); await s.page.keyboard.type('LOW LEVEL') } else await box.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, 'LOW LEVEL')
  await wait(s, 250); await s.page.evaluate(() => document.activeElement?.blur?.())
  const around = await s.page.evaluate(() => { const b = document.querySelector('#qNewQual'); const row = b.closest('div'); return { typed: b.value, placeholder: b.placeholder, row: row.innerText.replace(/\s+/g, ' ').trim().slice(0, 120), buttons: [...row.querySelectorAll('button')].map(x => x.textContent.trim()) } })
  FACT(`${k}.box`, around)
}
for (const sz of ['d', 'p']) if (want('qual-' + sz)) await run('qual-' + sz, sz, async s => {
  const k = `s1.qual.${sz}`, text = N(S1.lead.qual)
  await signIn(s, 'ad', 'a'); await qualTyped(s, k)
  if (!s.desk) { await vis(s, '#qNewQual').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await wait(s, 300) }
  const m = await refusePick(s, k, text, { box: '#qNewQual', done: '#qEdit' }, '#qNewQual, #qAddQualBtn')
  FACT(`${k}.after`, { typed: await vis(s, '#qNewQual').first().inputValue().catch(() => null), done: await covered(s, '#qSave'), editQuals: await s.page.evaluate(() => document.querySelector('#qEditQuals')?.textContent.trim()) })
  const ring = await ringNote(s, m), qb = await boxOf(s, '#qNewQual')
  if (s.desk) await sshot(s, 'qual-d', [ring, await boxOf(s, '#sqnMenuBtn'), qb, await boxOf(s, '#qSave'), await boxOf(s, '#qEditQuals')], 16)
  else await sshot(s, 'qual-p', [ring, qb, { x: 0, y: 0, w: s.W, h: 60 }], 8)
})
if (want('qual-other-d')) await run('qual-other-d', 'd', async s => {
  const k = 's1.qualOther.d'
  await signIn(s, 'ad', 'a'); await reachPick(s, 149, 'bar'); await wait(s, 600)
  await go(s, 'quals'); await wait(s, 800)
  FACT(`${k}.state`, { squadron: await barSq(s), edit: await s.page.evaluate(() => document.querySelector('#qEdit')?.textContent.trim()), box: await s.page.evaluate(() => document.querySelector('#qNewQual')?.value ?? '(not drawn: not in edit mode)') })
  await sshot(s, 'qual-other-d', [await boxOf(s, '.topbar .mark'), await boxOf(s, '#qEdit')], 16)
})

/* ---------------- 1.27 the Calendar (D2654 E1) ---------------- */
const SHEET = resolve(TMP1, 'holidays-2026.csv')
writeFileSync(SHEET, 'From,To,Name,Kind,On grid\n2026-12-28,2026-12-28,Stand-down Day,Off day,\n2026-12-31,2026-12-31,Year-end Off day,Off day,\n')
const CAL = {
  new: { lead: S1.lead.holNew, async set(s, k) { await openCalendar(s); await holidaysTab(s); await hit(s, '[data-testid="hol-add"]', 600); FACT(`${k}.typed`, await typeName(s, 'Squadron Day')); return ['[data-testid="hol-name"]', '[data-testid="hol-save"]'] } },
  changed: { lead: S1.lead.holChanged, async set(s, k) {
    await openCalendar(s); await holidaysTab(s)
    const line = vis(s, '.hol-list .hol-line').first(); if (!(await line.count())) throw new Error('no holiday listed')
    FACT(`${k}.opened`, await line.getAttribute('aria-label')); await hit(s, line, 600)
    const before = await vis(s, '[data-testid="hol-name"]').first().inputValue()
    FACT(`${k}.changed`, { from: before, to: await typeName(s, before + ' (observed)') }); return ['[data-testid="hol-name"]', '[data-testid="hol-save"]'] } },
  every: { lead: S1.lead.everyMonday, async set(s, k) {
    await openCalendar(s)
    await hit(s, '[data-testid="days-wd-0"]', 600)
    const opt = await s.page.evaluate(() => { const b = [...document.querySelectorAll('[data-testid^="every-cls-"]')].find(b => b.getBoundingClientRect().width > 0 && !b.classList.contains('lit') && b.getAttribute('aria-pressed') !== 'true'); if (b) { b.setAttribute('data-s1o', '1'); return b.textContent.trim() } return null })
    if (opt) await hit(s, '[data-s1o]', 300)
    FACT(`${k}.everyForm`, { pressed: opt, says: await s.page.evaluate(() => document.querySelector('[data-testid="every-says"]')?.textContent.trim() ?? null) })
    return ['[data-testid="every-says"]', '[data-testid="every-save"]'] } },
  sheet: { lead: S1.lead.sheet, async set(s, k) {
    await openCalendar(s); await holidaysTab(s)
    await s.page.locator('[data-testid="hol-import-file"]').setInputFiles(SHEET); await wait(s, 900)
    FACT(`${k}.preview`, { file: await s.page.evaluate(() => document.querySelector('[data-testid="hol-pv-file"]')?.textContent), counts: await s.page.evaluate(() => document.querySelector('[data-testid="hol-pv-counts"]')?.textContent), add: await s.page.evaluate(() => document.querySelector('[data-testid="hol-pv-add"]')?.textContent) })
    return ['[data-testid="hol-preview"]'] } },
  noleave: { lead: S1.lead.holNoLeave, async set(s, k) {
    await openCalendar(s); await holidaysTab(s)
    for (let i = 0; i < 4; i++) { const y = await s.page.evaluate(() => document.querySelector('[data-testid="hol-year"]')?.textContent.trim()); FACT(`${k}.year.${i}`, { year: y, nocover: await s.page.evaluate(() => document.querySelector('[data-testid="hol-nocover"]')?.textContent.trim() ?? null) }); if (await s.page.locator('[data-testid="hol-nocover"]').count()) break; await hit(s, '[data-testid="hol-next"]', 400) }
    await hit(s, '[data-testid="hol-add"]', 600); await typeName(s, 'Squadron Day')
    /* a date: the first day the form's calendar offers in the shown month */
    const d = await s.page.evaluate(() => { const c = document.querySelector('[data-testid="hol-dates"]'); const b = c && [...c.querySelectorAll('[data-testid$="-grid"] button[aria-label]')].find(b => /\d{4}/.test(b.getAttribute('aria-label')) && !b.disabled && b.getBoundingClientRect().width > 0 && /\b14\b/.test(b.getAttribute('aria-label'))); if (b) { b.setAttribute('data-s1d', '1'); return b.getAttribute('aria-label') } return null })
    if (d) await hit(s, '[data-s1d]', 400)
    await hit(s, '[data-testid="hol-save"]', 900)
    FACT(`${k}.saved`, { date: d, err: await s.page.evaluate(() => document.querySelector('[data-testid="hol-err"]')?.textContent.trim() ?? null), waiting: await s.page.evaluate(() => document.querySelector('[data-testid="hol-waiting"]')?.textContent.trim() ?? null), button: await s.page.evaluate(() => (document.querySelector('[data-testid="hol-wait-create"]') || document.querySelector('[data-testid="hol-wait-period"]'))?.textContent.trim() ?? null) })
    if (!(await s.page.locator('[data-testid="hol-waiting"]').count())) throw new Error('the holiday is not waiting for a leave period')
    return ['[data-testid="hol-waiting"]', '[data-testid="hol-name"]'] } },
  settings: { lead: S1.lead.inputsSettings, async set(s, k) {
    FACT(`${k}.windows`, await openCalendar(s, { closeSettings: false }))
    /* a change in Inputs calendar settings: its first number box (the late cut-off's days), one up */
    const ch = await s.page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputsset"]'); const i = w && [...w.querySelectorAll('input[type="number"], input[inputmode="numeric"]')].find(e => e.getBoundingClientRect().width > 0); if (!i) return null; i.setAttribute('data-s1n', '1'); return { label: i.getAttribute('aria-label') || i.closest('label')?.textContent.trim().slice(0, 60) || null, value: i.value } })
    if (!ch) throw new Error('no number box in Inputs calendar settings')
    const l = s.page.locator('[data-s1n]').first(); const v = String(Number(ch.value || 0) + 1)
    await l.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }, v)
    await wait(s, 300)
    FACT(`${k}.changed`, { ...ch, to: v, saveLit: await s.page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputsset"]'); const b = w && [...w.querySelectorAll('button')].find(b => /^Save$/.test(b.textContent.trim())); return b ? !b.disabled : null }), settingsCovered: await covered(s, '[data-s1n]') })
    return ['[data-testid="win-inputsset"]'] } },
}
for (const [c, def] of Object.entries(CAL)) for (const sz of ['d', 'p']) if (want(`cal-${c}-${sz}`) || want(`cal-${c}`)) await run(`cal-${c}-${sz}`, sz, async s => {
  const k = `s1.cal.${c}.${sz}`, text = N(def.lead)
  await signIn(s, 'ad', 'a')
  const sels = await def.set(s, k)
  const m = await refusePick(s, k, text, { cal: '.floatwin.dayswin', settings: '[data-testid="win-inputsset"]' })
  const ring = await ringNote(s, m)
  const parts = []; for (const q of sels) parts.push(await boxOf(s, q))
  const cw = await calWin(s)
  if (s.desk) await sshot(s, `cal-${c}-d`, [ring, await boxOf(s, '#sqnMenuBtn'), ...parts, cw && { x: cw.x, y: cw.y, w: cw.w, h: 40 }], 16)
  else await sshot(s, `cal-${c}-p`, [ring, ...parts, { x: 0, y: 0, w: s.W, h: 60 }], 8)
}, await world())

/* 1.27, words gap 1a: on a phone the settings window lies under the Calendar, so the note names a window he cannot see.
   The question's other wording, drawn beside the plain one: the Calendar named first (S1.lead.calThenSettings) */
if (want('cal-settings-alt-p')) await run('cal-settings-alt-p', 'p', async s => {
  const k = 's1.cal.settingsAlt.p', text = N(S1.lead.calThenSettings)
  await signIn(s, 'ad', 'a')
  const sels = await CAL.settings.set(s, k)
  const m = await refusePick(s, k, text, { cal: '.floatwin.dayswin', settings: '[data-testid="win-inputsset"]' })
  const ring = await ringNote(s, m)
  await sshot(s, 'cal-settings-alt-p', [ring, { x: 0, y: 0, w: s.W, h: 60 }], 8)
  void sels
}, await world())

/* ---------------- 1.3 / 1.4 on a phone ---------------- */
const BELLST = resolve(TMP1, 'state-bell2.json')
async function bellWorld() {
  if (existsSync(BELLST) && !process.env.FRESH) return BELLST
  await run('bell.setup', 'd', async s => {
    /* p4b's way (n166 draw-beside): Saber, on 142, files an input for Hunter on Tue 8 Dec - a line on Hunter's own bell,
       about his 142 input; seen while 149 is picked, its press would take him to 142 */
    await signIn(s, 'ad', 'a')
    await newInputWindow(s)
    const v = await s.page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent))?.value)
    await s.page.selectOption('#inpEditPerson', v); await s.page.selectOption('#inpEditType', 'OL')
    await pickDay(s, 'Tue 8 Dec 2026'); await s.page.fill('#inpEditRmk', 'family wedding')
    FACT('bell.setup.saved', await saveInput(s))
    await wait(s, 800); writeFileSync(BELLST, JSON.stringify(await s.ctx.storageState()))
  }, await world())
  return BELLST
}
async function myLeave(s) { await go(s, 'leavewar'); await s.page.waitForSelector('[data-testid="my-leave"]', { timeout: 15000 }); await hit(s, '[data-testid="my-leave"]', 900) }
if (want('bellline-p')) await run('bellline-p', 'p', async s => {
  const k = 's1.bellline.p', text = N(S1.lead.window, S1.end.line)
  /* Hunter picks 149 (☰), opens a 149 man's leave window from the Leave War's Balances (his own "My leave" is 142's) */
  await signIn(s, 'ad2', 'a2'); await reachPick(s, 149, 'menu'); await wait(s, 700)
  await go(s, 'leavewar'); await wait(s, 1200)
  await hit(s, vis(s, '#page-leavewar button').filter({ hasText: /^\s*Balances\s*$/ }).first(), 900)
  const nm = vis(s, '[data-testid^="bal-name-"]').first(); FACT(`${k}.opens`, await nm.getAttribute('aria-label')); await hit(s, nm, 900)
  FACT(`${k}.window`, (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 60)))
  FACT(`${k}.tap`, await tapBell(s))
  FACT(`${k}.show`, await bellShow(s)); FACT(`${k}.lines`, await bellLines(s))
  const line = s.page.locator(`${LIST} .bl-line`).filter({ hasText: /8 Dec/ }).first()
  if (!(await line.count())) throw new Error('no 8 Dec line in his bell')
  await line.evaluate(e => e.setAttribute('data-s1line', '1'))
  FACT(`${k}.line`, { words: (await line.innerText()).replace(/\s+/g, ' ').trim(), unread: await line.evaluate(e => e.classList.contains('unread')), covered: await covered(s, '[data-s1line]') })
  await raise(s, text); await atFoot(s, k); await clearOfNamed(s, k)
  const m = await noteFacts(s, k, text, { list: LIST, line: '[data-s1line]', sheet: '.bidsheet' })
  FACT(`${k}.state`, { squadron: await barSq(s), listOpen: !!(await boxOf(s, LIST)), lineUnread: await s.page.evaluate(() => document.querySelector('[data-s1line]')?.classList.contains('unread')) })
  const ring = await ringNote(s, m)
  await sshot(s, 'bellline-p', [ring, await boxOf(s, LIST), { x: 0, y: 0, w: s.W, h: 60 }], 8)
}, await bellWorld())
if (want('belltap-p')) await run('belltap-p', 'p', async s => {
  const k = 's1.belltap.p', text = N(S1.lead.window, S1.end.bell)
  await signIn(s, 'ad', 'a'); await myLeave(s)
  const lit = () => s.page.evaluate(() => { const b = [...document.querySelectorAll('#notifyBell')].find(e => e.getBoundingClientRect().width > 0); return b ? { on: b.classList.contains('on'), covered: null } : null })
  FACT(`${k}.window`, (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 60)))
  FACT(`${k}.bellBefore`, { ...(await lit()), covered: await covered(s, '#notifyBell') })
  /* THE STAND-IN (n175's d3c, named): the bell given the app's own lit look (class "on"); nothing waits behind it. The
     tap itself is the guard's to refuse, so it is not made. */
  await s.page.evaluate(() => { const b = [...document.querySelectorAll('#notifyBell')].find(e => e.getBoundingClientRect().width > 0); b.classList.add('on'); window.__s1bell = new MutationObserver(() => { if (!b.classList.contains('on')) b.classList.add('on') }); window.__s1bell.observe(b, { attributes: true, attributeFilter: ['class'] }) })
  FACT(`${k}.standIn`, 'the bell lit by its own class "on" (n175 d3c): a tap on a lit bell acts directly; the case that would change squadron is the guard\'s to refuse')
  await raise(s, text); await atFoot(s, k); await clearOfNamed(s, k, '#notifyBell')
  const m = await noteFacts(s, k, text, { bell: '#notifyBell', sheet: '.bidsheet' })
  FACT(`${k}.state`, { squadron: await barSq(s), bell: await lit() })
  const ring = await ringNote(s, m)
  await sshot(s, 'belltap-p', [ring, { x: 0, y: 0, w: s.W, h: 60 }], 8)
}, await world())
await closeAll()
void pageOn; void union
