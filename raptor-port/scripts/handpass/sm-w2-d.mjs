// W2 part D: S12 (loaded U), S11 (U stashed, week 20 Jul loaded), S1 probe (medical), S13 probe. SZ=pc|phone
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
const size = process.env.SZ || 'pc'
console.log('sm-w2-d v2', size)
const OUT = L.outDir('w2')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const state = JSON.parse(readFileSync(SCR + '/w2-state3.json', 'utf8'))
const key2 = 'raptor:weeks/13-07-2026#2'
const U = await L.launch(size, { origin: ORIGIN, state, init: L.damageInit(key2) })
const { page } = U
const snap = () => page.evaluate(() => JSON.stringify(window.INPUTS || []))
const log = (k, v) => console.log(k, JSON.stringify(v))
const vp = page.viewportSize()
const full = { x: 0, y: 0, width: vp.width, height: vp.height }
await L.signIn(U)
log('boot', { inputs: (await page.evaluate(() => window.INPUTS.length)), notices: await page.evaluate(() => [...document.querySelectorAll('#eWeek .dprev-bar')].filter(b => b.getBoundingClientRect().height > 0).length) })

async function closeWin() {
  for (let i = 0; i < 3; i++) {
    const d = page.locator('button:has-text("Discard and close")').filter({ visible: true }).first()
    if (await d.count()) { await d.click(); await L.sleep(400); continue }
    if (!(await page.locator(L.T('win-inputedit')).count())) break
    const x = page.locator(L.T('win-inputedit-x')).filter({ visible: true }).first()
    if (await x.count()) { await x.click(); await L.sleep(500) } else await page.keyboard.press('Escape')
  }
}
async function openRow(who, dateTxt, typeTxt) {
  await L.openInputsList(U)
  const r = page.locator(`tr[data-iid]:has-text("${who}"):has-text("${dateTxt}")${typeTxt ? `:has-text("${typeTxt}")` : ''} .in-open`).first()
  if (!(await r.count())) throw new Error('no row ' + who + ' ' + dateTxt)
  await L.press(U, r); await page.waitForSelector(L.T('win-inputedit')); await L.sleep(500)
}
async function setDay(iso) { await L.press(U, page.locator(`[data-testid="inpEdCal-day-${iso}"]`)); await L.sleep(200); await L.press(U, page.locator(`[data-testid="inpEdCal-day-${iso}"]`)); await L.sleep(200) }
async function attempt(name, fn, { pic = true } = {}) {
  for (let i = 0; i < 40; i++) { const t0 = await L.toastText(page); if (!t0 || !t0.shown) break; await L.sleep(250) }
  const before = await snap()
  try { await fn() } catch (e) { log(name, { setupErr: e.message.split('\n')[0] }); await closeWin(); return }
  const t = await L.toastText(page)
  const after = await snap()
  if (pic) await L.pic(U, OUT, `${name}-${size}`, { clip: full })
  log(name, { toast: t, saved: before !== after, win: await page.locator(L.T('win-inputedit')).count() })
  await closeWin(); await L.sleep(300)
}
const save = async () => { await L.press(U, page.locator('#inpEditSave')); await L.sleep(700) }
// answer follow-up questions if any
const answer = async () => { for (let i = 0; i < 3; i++) { const q = await page.locator('[data-testid="docconf-nodoc"],[data-testid="oil-no"]').filter({ visible: true }).first(); if (!(await q.count())) break; await q.click(); await L.sleep(300); const s = page.locator(L.T('oilconf-save')).filter({ visible: true }).first(); if (await s.count()) await s.click(); await L.sleep(500) } }

/* ---- S12 on loaded U ---- */
await attempt('s12-edit-remarks', async () => { await openRow('Bolt', '15 Jul', 'LL'); await page.locator('#inpEditRmk').fill('changed note'); await save(); await answer() })
await attempt('s12-delete', async () => { await openRow('Bolt', '15 Jul', 'LL'); await L.press(U, page.locator('#inpEditDel')); await L.sleep(600); const y = page.locator('button:has-text("Delete")').filter({ visible: true }); const n = await y.count(); log('s12-delete.confirm-buttons', await y.evaluateAll(es => es.map(e => e.textContent.trim()))); if (n > 1) await y.last().click(); await L.sleep(700) })
await attempt('s12-redate-within-U', async () => { await openRow('Bolt', '15 Jul', 'LL'); await setDay('2026-07-16'); await save(); await answer() })
await attempt('s12-redate-into-healthy', async () => { await openRow('Bolt', '15 Jul', 'LL'); await setDay('2026-07-21'); await save(); await answer() })
await attempt('s12-medical-edit-U', async () => { await openRow('Bolt', '19 Jul', 'HL'); await page.locator('#inpEditRmk').fill('hl note'); await save(); await answer() })
await attempt('s12-person-change', async () => { await openRow('Bolt', '15 Jul', 'LL'); await page.locator('#inpEditPerson').selectOption({ label: 'Saint' }); await save(); await answer() })

/* ---- S11: stash U, load 20 Jul ---- */
await L.goEdit(U)
await page.locator('[data-wk="20/07/2026"]').filter({ visible: true }).first().click(); await L.sleep(1800)
log('s11.loaded', await page.evaluate(() => ({ notices: [...document.querySelectorAll('#eWeek .dprev-bar')].filter(b => b.getBoundingClientRect().height > 0).length, days: [...document.querySelectorAll('#eWeek section.day')].slice(0, 7).map(d => d.querySelector('h3,.dh,.dname') ? d.querySelector('h3,.dh,.dname').textContent.trim() : d.textContent.slice(0, 14)) })))
await L.pic(U, OUT, `s11-${size}-week20-loaded`, { clip: full })
await attempt('s11-file-on-15Jul', async () => { await L.fillNew(U, { who: 'Saint', type: 'Meeting', iso: '2026-07-15', remarks: 'stash test' }); await save(); await answer() })
await attempt('s11-edit-healthy-into-U', async () => { await openRow('Vapor', '20 Jul'); await setDay('2026-07-16'); await save(); await answer() })
await attempt('s11-edit-out-of-U', async () => { await openRow('Bolt', '15 Jul', 'LL'); await setDay('2026-07-21'); await save(); await answer() })
await attempt('s11-span-crossing', async () => { await openRow('Quill', '19 Jul', 'LL'); await page.locator('#inpEditRmk').fill('span edit'); await save(); await answer() })
await attempt('s11-unrelated-healthy', async () => { await L.fillNew(U, { who: 'Saint', type: 'Meeting', iso: '2026-07-22', remarks: 'healthy filing' }); await save(); await answer() })
log('errs', U.errs)
await L.closeAll(U)
console.log('DONE')
