// W2 part I — the roll-call rows that the numbered scenarios do not picture by themselves:
//   R15  the SANS calendar's OPENED DAY (its Required / Available / SANS / still-needed figures) after an Other under Unavailable
//   R8   the input window's type list and what Attach offers for people (no ALL / ALL AVAIL)
//   R4   the member's bell after a scheduler files his Training under Unavailable and takes it out again
// Desktop 1536 x 864, admin and (in place) Ranger, one fresh world.   Usage (from raptor-port/): node scripts/handpass/lw-m3b-w2-i.mjs
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
process.env.HP_SHOTS = H.OUT
const SETS = (process.env.SETS || 'R15,R8,R4').split(',')
for (const k of SETS) H.clearPrefix('i-' + k)
console.log('lw-m3b-w2-i', H.OUT)
const num = s => (s == null ? null : Number(String(s).replace(/[^\d.\-]/g, '')))
const sc = async (id, fn) => { if (!SETS.includes(id)) return; console.log('-- ' + id); try { await fn() } catch (e) { note(id, 'desk', 'NOT DONE — ' + String(e).slice(0, 600)); L.rec(id, 'desk', 'NOT WALKED', 'script stopped: ' + String(e).split('\n')[0].slice(0, 300), []) } }
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
const ranger = await H.idOf(P, 'Ranger')
const EDIT = di => `#eWeek section.day[data-day="${di}"]`
const accList = iid => P.evaluate(iid => [...document.querySelectorAll(`#eWeek [data-acck="${iid}"]`)].filter(b => b.getBoundingClientRect().width > 0).map(b => b.dataset.acc + ':' + b.textContent.trim()), iid)
async function press(scope, iid, dest, di) {
  const sel = `${scope} [data-acc="${dest}"][data-acck="${iid}"]`
  const vis = async () => { const n = await P.locator(sel).count(); for (let i = 0; i < n; i++) if (await P.locator(sel).nth(i).isVisible()) return i; return -1 }
  let at = await vis()
  if (at < 0 && di != null) { const t = P.locator(`${scope} [data-pitog="${di}"]`).first(); if (await t.count()) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500); at = await vis() } }
  if (at < 0) throw new Error(`no ${dest} button`)
  const b = P.locator(sel).nth(at); await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click(); await P.waitForTimeout(1000)
}
const asMember = async () => { await P.evaluate(() => { window.raptorRole('member'); if (window.raptorMe) window.raptorMe('bane'); window.lwSetRole('member') }); await P.waitForTimeout(600) }
const asAdmin = async () => { await P.evaluate(() => { window.raptorRole('admin'); if (window.raptorMe) window.raptorMe('stiff'); window.lwSetRole('admin') }); await P.waitForTimeout(600) }

/* ---------------- R15: the SANS day ---------------- */
await sc('R15', async () => {
  const ISO = '2026-07-15'
  await H.warOpen(w, ranger, ISO)
  await L.setRequired(w, 'p', ISO, 30)
  await H.sansOpen(w); await H.sansMonth(w, 2026, 7)
  const needBefore = await H.sansNeed(P, ISO)
  await L.press(w, T('sc-day-' + ISO)); await P.waitForTimeout(900)
  const dayBefore = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-sansday"], [data-testid="sd-work"]'); return e ? e.closest('[data-testid^="win-"]')?.innerText.replace(/\s+/g, ' ').slice(0, 500) || e.innerText.replace(/\s+/g, ' ') : null })
  note('R15-before', 'desk', `month need ${needBefore}; the opened day: ${dayBefore}`)
  await H.pic(w, 'i-R15-day-before', ['[data-testid="sd-work"]', '[data-testid="win-sansday"]'], { pad: 10 })
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  const f = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: ISO, remarks: 'Sans other', goes: 'u', tag: 'R15', beforeSave: async () => { if (!(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
  await H.sansOpen(w); await H.sansMonth(w, 2026, 7)
  const needAfter = await H.sansNeed(P, ISO)
  await L.press(w, T('sc-day-' + ISO)); await P.waitForTimeout(900)
  const dayAfter = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-sansday"], [data-testid="sd-work"]'); return e ? e.closest('[data-testid^="win-"]')?.innerText.replace(/\s+/g, ' ').slice(0, 500) || e.innerText.replace(/\s+/g, ' ') : null })
  const figs = await P.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-testid^="sd-req-"],[data-testid^="sd-avail-"],[data-testid^="sd-sans-"],[data-testid^="sd-need-"]')].map(e => [e.dataset.testid, e.innerText.replace(/\s+/g, ' ')])))
  note('R15-after', 'desk', `acc ${f.rec?.acc}; month need ${needAfter}; the opened day: ${dayAfter}; figures ${JSON.stringify(figs)}`)
  await H.pic(w, 'i-R15-day-after', ['[data-testid="sd-work"]', '[data-testid="win-sansday"]'], { pad: 10 })
  await H.pic(w, 'i-R15-month-after', [T('sc-day-' + ISO)], { pad: 24 })
  L.rec('R15', 'desk', 'RECORD', `SANS month cell for Wed 15 Jul: still needed ${needBefore} → ${needAfter} after Ranger's Other under Unavailable (Required P typed 30); the opened day before: "${(dayBefore || '').slice(0, 220)}"; after: "${(dayAfter || '').slice(0, 220)}"; figures ${JSON.stringify(figs)}`, ['i-R15-day-before', 'i-R15-day-after', 'i-R15-month-after'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
})

/* ---------------- R8: the type list, and what Attach offers ---------------- */
await sc('R8', async () => {
  await H.newWindow(w, 'Ranger', 'Attach')
  const types = await P.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value))
  const persons = await P.evaluate(() => [...document.querySelectorAll('#inpEditPerson option')].map(o => o.value + '=' + o.textContent.trim()).filter(x => /^all/i.test(x)))
  const flyWith = types.filter(t => /fly/i.test(t))
  await P.locator(T('win-inputedit') + ' ' + T('pp-several')).click(); await P.waitForTimeout(400)
  const ph = await P.evaluate(() => [...document.querySelectorAll('[data-ph]')].map(b => b.dataset.ph + ':' + (b.disabled ? 'disabled' : 'enabled') + ':' + b.getAttribute('aria-pressed')).join(', '))
  const why = await L.txt(P, '[data-testid="pp-phwhy"], [data-testid="pp-why"]')
  note('R8', 'desk', `types ${JSON.stringify(types)}; "Fly with" kinds ${JSON.stringify(flyWith)}; ALL options in the person list for Attach ${JSON.stringify(persons)}; in Several people: ${ph || 'no placeholder pucks'}; words "${why}"`)
  await H.winTop(P); await H.pic(w, 'i-R8-attach-several', [H.WIN], { pad: 6 })
  await P.locator(T('win-inputedit') + ' ' + T('pp-several')).click().catch(() => {}); await P.waitForTimeout(300)
  /* ALL AVAIL chosen first, then the kind Attach */
  await P.locator('#inpEditType').selectOption('Meeting'); await P.waitForTimeout(300)
  await P.locator('#inpEditPerson').selectOption('allavail'); await P.waitForTimeout(300)
  await P.locator('#inpEditType').selectOption('Attach'); await P.waitForTimeout(400)
  const stay = { person: await P.locator('#inpEditPerson').inputValue(), type: await P.locator('#inpEditType').inputValue(), why: await L.txt(P, '[data-testid="pp-why"], [data-testid="pp-phwhy"]') }
  note('R8-allavail', 'desk', 'ALL AVAIL first, then Attach: ' + JSON.stringify(stay))
  await H.pic(w, 'i-R8-allavail-attach', [H.WIN], { pad: 6 })
  const before = await H.inputsNow(P)
  await P.locator('#inpEditRmk').fill('allavail attach')
  note('R8-allavail', 'desk', 'dates: ' + await H.pickDates(w, '2026-07-16'))
  await H.winTop(P); await H.pic(w, 'i-R8-allavail-attach-dated', [H.WIN], { pad: 6 })
  await L.press(w, '#inpEditSave'); await P.waitForTimeout(1000)
  const made = (await H.inputsNow(P)).filter(i => !before.includes(i))
  note('R8-allavail', 'desk', `Add pressed: inputs made ${made.length}; window still open ${(await H.winsOpen(P)).join(',')}`)
  await H.pic(w, 'i-R8-allavail-attach-save', [H.WIN], { pad: 6 })
  await L.press(w, '#inpEditCancel').catch(() => {}); await P.waitForTimeout(400)
  L.rec('R8', 'desk', types.includes('Attach') && !flyWith.length && !persons.length && made.length === 0 ? 'PASS?' : 'FAIL?', `type list has Attach ${types.includes('Attach')}, "Fly with" ${JSON.stringify(flyWith)}; ALL options for Attach ${JSON.stringify(persons)}; Several people → ${ph}; ALL AVAIL then Attach: ${JSON.stringify(stay)}; saved ${made.length}`, ['i-R8-attach-several', 'i-R8-allavail-attach', 'i-R8-allavail-attach-save'])
})

/* ---------------- R4: the member's bell ---------------- */
await sc('R4', async () => {
  const ISO = '2026-07-16', DI = 3
  const f = await H.fileInput(w, { who: 'Ranger', type: 'Training', from: ISO, remarks: 'Bell trg', tag: 'R4', beforeSave: async () => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
  const iid = f.rec.iid
  await H.goEdit(w)
  await press(EDIT(DI), iid, 'x', DI); await press(EDIT(DI), iid, 'u', DI)
  note('R4', 'desk', 'moved under Unavailable: acc ' + (await H.inputById(P, iid))?.acc)
  await asMember()
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1200)
  const b1 = await H.bellText(w); await H.pic(w, 'i-R4-member-bell-unavail', null)
  await H.closeBell(w)
  note('R4', 'desk', 'member bell after "→ Unavail": ' + b1)
  await asAdmin()
  await H.goEdit(w)
  await press(EDIT(DI), iid, 'x', DI); await press(EDIT(DI), iid, 'g', DI)
  note('R4', 'desk', 'taken out and put on the Ground Programme: acc ' + (await H.inputById(P, iid))?.acc)
  await asMember()
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1200)
  const b2 = await H.bellText(w); await H.pic(w, 'i-R4-member-bell-ground', null)
  await H.closeBell(w)
  note('R4', 'desk', 'member bell after Reject, "→ Ground": ' + b2)
  L.rec('R4', 'desk', /Unavailable/i.test(b1) ? 'RECORD' : 'RECORD', `Ranger's bell after a scheduler's "→ Unavail" of his Training: "${b1}"; after Reject and "→ Ground": "${b2}"`, ['i-R4-member-bell-unavail', 'i-R4-member-bell-ground'])
  await asAdmin()
})

note('errors', 'desk', JSON.stringify(w.errs))
H.saveLog('i-run.json')
await w.ctx.close()
await H.closeBrowser()
console.log('RESULTS'); for (const r of L.results) console.log(r.verdict, r.id, '|', r.said)
