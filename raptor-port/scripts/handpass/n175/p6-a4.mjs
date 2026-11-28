// p6-a4 - P6 case A4 (the code read's row A4): Hunter's own 142 OIL question reached by a bell tap with 149 picked.
// FIRST, the weekend route the brief names, tried by presses (Saber, desktop, on 142): Inputs → + Input: Hunter, Duty,
// Sat 12 Dec 2026 → Save. Its OIL pop-up is read: can it be left unanswered? (Its "Add" is read live or greyed; "Back".)
// THE SET-UP USED (by presses, Saber, desktop, on 142) - an unanswered OIL question of Hunter's with NO holiday line in
// his bell: Admin → Users: Hunter's row → "Access to 149" Plan → Save; Inputs → + Input: Hunter, Duty, Tue 8 Dec 2026,
// "n175 p6 A4" → Save (a weekday: nothing asked); Hunter's row → Suspend; Inputs → gear → Calendar → Holidays → + Add:
// 8 Dec "N175 A4 Day" → Save, its OIL list left with "Later"; Hunter's row → Enable. (A holiday made while his sign-in
// was off gives him no holiday line - notices.ts holidayLineAny's note - so the bell's direct OIL path is the one taken.)
// Then, in a fresh browser: Hunter signs in (142), picks 149 (top-bar picker; ☰ list on a phone): the bell lit? He taps
// the bell: what opens, the bar, the page, what it says. He answers as the window offers it, then Save: which saved
// record changed (its unit), the bar after.
//   node raptor-port/scripts/handpass/n175/p6-a4.mjs <d|p>
// Pictures: p6-a4-<d|p>-1-after-bell (the bar and the window ringed)
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachPick, barSq, give, usersTab, newInputWindow, pickDay, fileInput, snap, changed, state, saveState, winFacts, tapBell, bellLit, bellLines, toastNow, windowsNow, SEC, via } from './p6-lib.mjs'
const SZ = process.argv[2] || 'd'
const k = `p6.a4.${SZ}`, P = `p6-a4-${SZ}`
async function weekendTry(s) {
  const { page } = s
  await newInputWindow(s)
  const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => x.textContent.trim() === 'Hunter')?.value)
  await page.selectOption('#inpEditPerson', v); await page.selectOption('#inpEditType', 'Duty')
  await pickDay(s, 'Sat 12 Dec 2026'); await hit(s, '#inpEditSave', 900)
  const pop = (await windowsNow(s)).filter(w => /upconf/.test(w.what)).map(w => ({ words: w.words, buttons: w.buttons }))
  /* left as he would leave it: Back, then the window's own Cancel */
  const back = vis(s, '.upconf-pop button').filter({ hasText: /^Back$/ }); if (await back.count()) await hit(s, back.first(), 400)
  const c = vis(s, '#inpEditCancel'); if (await c.count()) await hit(s, c.first(), 400)
  if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 400)
  return { pop, savedWithoutAnswer: false }
}
export async function suspendToggle(s, pid) {
  await usersTab(s)
  await hit(s, s.page.locator(`[data-person="${pid}"] .acc-tap`).first(), 700)
  const words = (await vis(s, '#accEdOnOff').first().textContent()).trim()
  await hit(s, '#accEdOnOff', 700); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 500)
  return { pressed: words, toast: await toastNow(s) }
}
export async function addHoliday(s, name) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 500)
  await hit(s, '#inGear', 500); await hit(s, '[data-testid="iset-days"]', 700)
  if (await vis(s, '[data-testid="days-tab-holidays"]').count()) await hit(s, '[data-testid="days-tab-holidays"]')
  await hit(s, '[data-testid="hol-add"]', 500)
  await vis(s, '[data-testid="hol-name"]').first().fill(name)
  const cal = '[data-testid="hol-dates"]'
  const day = () => page.locator(`${cal} button[aria-label*="8 Dec"], ${cal} button[aria-label*="8 December 2026"], ${cal} [data-iso="2026-12-08"]`).first()
  for (let i = 0; i < 14 && !(await day().count()); i++) { const nx = page.locator(`${cal} button[aria-label^="Next"]`).first(); if (!(await nx.count())) break; await hit(s, nx, 250) }
  await hit(s, day(), 300); await hit(s, '[data-testid="hol-save"]', 900)
  const lead = await page.evaluate(() => document.querySelector('[data-testid="odl-lead"]')?.textContent.trim() ?? null)
  if (await vis(s, '[data-testid="odl-later"]').count()) await hit(s, '[data-testid="odl-later"]', 600)
  for (let i = 0; i < 3; i++) { const x = vis(s, '.floatwin button').filter({ hasText: /^✕$/ }).first(); if (!(await x.count())) break; await hit(s, x, 400) }
  return { lead }
}
export async function setupA4() {
  const s = await mk('d')
  try {
    await signIn(s, 'ad', 'a')
    FACT('p6.a4.setup.weekendTried', await weekendTry(s))
    FACT('p6.a4.setup.hunterPlan149', await give(s, 'prowler', '149', 'plan'))
    FACT('p6.a4.setup.hunterDuty8Dec', await fileInput(s, 'Hunter', 'Duty', 'Tue 8 Dec 2026', 'n175 p6 A4'))
    FACT('p6.a4.setup.suspend', await suspendToggle(s, 'prowler'))
    FACT('p6.a4.setup.holiday', await addHoliday(s, 'N175 A4 Day'))
    FACT('p6.a4.setup.enable', await suspendToggle(s, 'prowler'))
    return await saveState(s, 'a4')
  } finally { await s.ctx.close().catch(() => {}) }
}
if (process.argv[1].endsWith('p6-a4.mjs')) try {
  console.log('p6-a4 v2', SZ)
  const st = await setupA4()
  const s = await mk(SZ, { storageState: st })
  try {
    await signIn(s, 'ad2', 'a2')
    FACT(`${k}.0.signedIn`, { ...(await state(s)), bellLit: await bellLit(s), windows: (await winFacts(s)).map(w => w.slice(0, 120)) })
    const p = await reachPick(s, 149, via(s)); FACT(`${k}.1.pick149`, { pressed: !!p.pressed, ...(await state(s)), bellLit: await bellLit(s) })
    FACT(`${k}.2.bellTap`, await tapBell(s))
    await wait(s, 500)
    FACT(`${k}.2.afterBell`, { ...(await state(s)), bellLines: await bellLines(s), windows: await winFacts(s) })
    await shot(s, `${P}-1-after-bell`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', '.upconf-pop, .floatwin.inpedwin', '#toastEl'], null, 24)
    /* the answer, as the window offers it */
    const before = await snap(s)
    const ans = vis(s, '.upconf-pop button, .airpop button').filter({ hasText: /^Yes/ }).first()
    const ansWords = (await ans.count()) ? (await ans.textContent()).trim() : null
    FACT(`${k}.3.answerOffered`, ansWords)
    if (ansWords) {
      await hit(s, ans, 600)
      const add = vis(s, '.upconf-pop button').filter({ hasText: /^(Add|Save|Done|OK)$/ }).first()
      if (await add.count() && !(await add.isDisabled())) await hit(s, add, 800)
      FACT(`${k}.3.afterAnswer`, { ...(await state(s)), windows: (await winFacts(s)).map(w => w.slice(0, 200)) })
      const sv = vis(s, '#inpEditSave'); if (await sv.count() && !(await sv.first().isDisabled())) { await hit(s, sv.first(), 900); for (let i = 0; i < 2; i++) { const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first()); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk') } }
      await wait(s, 600)
      FACT(`${k}.4.afterSave`, { ...(await state(s)), bellLit: await bellLit(s), windows: (await winFacts(s)).map(w => w.slice(0, 120)) })
      FACT(`${k}.4.storageChanged`, changed(before, await snap(s)).filter(x => /inputs\/|elog/.test(x)).map(x => x.slice(0, 260)))
      await scratch(s, SEC, `${P}-2-after-save`)
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
