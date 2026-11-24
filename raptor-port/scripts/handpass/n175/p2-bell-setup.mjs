// p2-bell-setup - the bell cases' SET-UP, by presses, once per run, on a desktop browser (Saber, master admin, on 142).
// The saved data after it is copied into each fresh browser (Playwright's storage copy - n166 bell-a's way; no app state
// written by hand):
//   1. Admin → Users: Hunter's row → 149 "Plan" → Save; Ranger's row → 149 "View" → Save.
//   2. Inputs → New: Hunter, Duty, Tue 8 Dec 2026, remarks → Save.  Inputs → New: Ranger, Duty, Tue 8 Dec 2026 → Save.
//      (a weekday: no OIL question at the Save.) Their bells now carry a 142 line "You were added …".  → state A
//   3. Inputs → the gear → Calendar → Holidays → + Add: Tue 8 Dec 2026, named "N175 Day" → Save. The OIL list opens by
//      itself ("N175 Day is now a public holiday."); "Later" pressed - nobody answers. Hunter's and Ranger's 8 Dec duty
//      inputs now hold an unanswered OIL question.  → state B
// Run by p2-bell.mjs; by itself: node raptor-port/scripts/handpass/n175/p2-bell-setup.mjs
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { mk, FACT, signIn, go, wait, vis, hit, scratch, toastNow, windowsNow, tmpDir } from './lib.mjs'
const lineBtn = (unitNum, v) => `[data-testid="acc-sq"] [aria-label="Access to ${unitNum}"] button[data-line="${v}"]`
async function give(s, pid, line) {
  const { page } = s
  await go(s, 'admin'); await wait(s, 600)
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
  const r = page.locator(`[data-person="${pid}"] .acc-tap`).first(); await r.scrollIntoViewIfNeeded(); await r.click(); await page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 }); await wait(s, 300)
  const b = page.locator(lineBtn('149', line)); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
  await page.locator('#accEdSave').click(); await wait(s, 700)
  return toastNow(s)
}
async function fileDuty(s, who, words) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 500)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  await hit(s, '#inNew', 600)
  const v = await page.evaluate(w => [...document.querySelector('#inpEditPerson').options].find(x => x.textContent.trim() === w)?.value, who)
  await page.selectOption('#inpEditPerson', v)
  await page.selectOption('#inpEditType', 'Duty')
  const day = () => page.locator('.floatwin.inpedwin button[aria-label^="Tue 8 Dec 2026"]').first()
  for (let i = 0; i < 12 && !(await day().count()); i++) await hit(s, page.locator('.floatwin.inpedwin button[aria-label="Next month"]').first(), 250)
  await hit(s, day()); await page.fill('#inpEditRmk', words); await hit(s, '#inpEditSave', 600)
  for (let i = 0; i < 3; i++) {
    const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first())
    if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk')
  }
  return !(await vis(s, '#inpEditRmk').count())
}
async function addHoliday(s) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 500)
  await hit(s, '#inGear', 500); await hit(s, '[data-testid="iset-days"]', 700)
  if (await vis(s, '[data-testid="days-tab-holidays"]').count()) await hit(s, '[data-testid="days-tab-holidays"]')
  await hit(s, '[data-testid="hol-add"]', 500)
  await vis(s, '[data-testid="hol-name"]').first().fill('N175 Day')
  const cal = '[data-testid="hol-dates"]'
  const day = () => page.locator(`${cal} button[aria-label*="8 Dec"], ${cal} button[aria-label*="8 December 2026"], ${cal} [data-iso="2026-12-08"]`).first()
  for (let i = 0; i < 14 && !(await day().count()); i++) { const nx = page.locator(`${cal} button[aria-label^="Next"]`).first(); if (!(await nx.count())) break; await hit(s, nx, 250) }
  if (!(await day().count())) { FACT('p2.bell.setup.holidayDayButtons', await page.evaluate(c => [...document.querySelectorAll(c + ' button')].slice(0, 12).map(b => (b.getAttribute('aria-label') || '') + '|' + b.textContent.trim()), cal)); throw new Error('no 8 Dec in the holiday calendar') }
  await hit(s, day(), 300)
  await hit(s, '[data-testid="hol-save"]', 900)
  const lead = await page.evaluate(() => document.querySelector('[data-testid="odl-lead"]')?.textContent.trim() ?? null)
  const count = await page.evaluate(() => document.querySelector('[data-testid="odl-count"]')?.textContent.trim() ?? null)
  if (await vis(s, '[data-testid="odl-later"]').count()) await hit(s, '[data-testid="odl-later"]', 600)
  return { lead, count, after: (await windowsNow(s)).map(w => w.what) }
}
export async function setupBell() {
  const TMP = tmpDir('p2'); const A = `${TMP}/bell-state-A.json`, B = `${TMP}/bell-state-B.json`
  const s = await mk('d')
  try {
    await signIn(s, 'ad', 'a')
    FACT('p2.bell.setup.hunterPlan149', await give(s, 'prowler', 'plan'))
    FACT('p2.bell.setup.rangerView149', await give(s, 'bane', 'view'))
    FACT('p2.bell.setup.hunterDutyFiled', await fileDuty(s, 'Hunter', 'n175 duty hunter'))
    FACT('p2.bell.setup.rangerDutyFiled', await fileDuty(s, 'Ranger', 'n175 duty ranger'))
    await wait(s, 600); writeFileSync(A, JSON.stringify(await s.ctx.storageState()))
    FACT('p2.bell.setup.holiday', await addHoliday(s))
    await wait(s, 600); writeFileSync(B, JSON.stringify(await s.ctx.storageState()))
    await scratch(s, 'p2', 'bell-setup-end')
  } finally { await s.ctx.close().catch(() => {}) }
  return { A, B }
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) { const { closeAll } = await import('./lib.mjs'); try { console.log(await setupBell()) } finally { await closeAll() } }
