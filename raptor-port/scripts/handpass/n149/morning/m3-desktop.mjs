// The morning page — desktop pictures (1536, ×2), by presses: Leave War Approvals after a pick made with it open, showing
// the picked squadron's requests (a8); Admin → Data's two clears lit for a View holder with 149 picked (q-i).
import { serve, stop, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn } from '../walk/w1-view.mjs'
import { step, as, press, vis, text } from '../rewalk/rlib.mjs'
import { newPage, ringShot, saveManifest } from './mlib.mjs'

const T = id => `[data-testid="${id}"]`
async function cell(s, pid, d) {
  const l = s.page.locator(T(`cell-${pid}-${d}`)).first()
  if (!(await l.count())) { note(`no cell ${pid} ${d}`); return }
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(350)
  const b = await l.boundingBox(); await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await s.page.waitForTimeout(600)
}
async function ll(s) {   // LL, and LL again where the window asks "Tap the same leave again to go ahead."
  await press(s, T('bid-LL')); await s.page.waitForTimeout(300)
  const t = await text(s, T('bid-picker')); if (t && /Tap the same leave again/.test(t)) { await press(s, T('bid-LL')); await s.page.waitForTimeout(300) }
  if (await vis(s, T('bid-cancel'))) await press(s, T('bid-cancel'))
}
async function openDec(s) {
  await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
  await press(s, T('open-chip')); await press(s, T('od-month-2026-12')); if (await vis(s, T('od-apply'))) await press(s, T('od-apply'))
  await s.page.keyboard.press('Escape').catch(() => {}); await s.page.waitForTimeout(300)
}
const apprLines = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')].filter(e => e.offsetParent).map(e => e.dataset.testid.slice(10)))

await serve()
try {
  const s = await newPage('d')
  await signIn(s, 'ad', 'a')
  await step('a8 set up: December open in both; Ranger and Osprey each ask for LL on 9 Dec', async () => {
    await openDec(s); await navTo(s, 'View-only Sched'); await pick(s, '149'); await openDec(s)
    await navTo(s, 'View-only Sched'); await pick(s, '142')
  })
  await as(s, 'us', 'us'); await step('ranger bids', async () => { await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200); await cell(s, 'bane', '2026-12-09'); await ll(s) })
  await as(s, 'us9', 'us9'); await step('osprey bids', async () => { await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200); await cell(s, 'osp9', '2026-12-09'); await ll(s) })
  await as(s, 'ad', 'a')
  await step('a8 Approvals, then 149 picked with it open', async () => {
    await navTo(s, 'Leave War'); await s.page.waitForTimeout(1000); await press(s, T('lw-tab-approvals')); await s.page.waitForTimeout(900)
    facts['a8-before'] = await apprLines(s)
    await pick(s, '149'); await s.page.waitForTimeout(900)
    facts['a8-after'] = await apprLines(s); facts['a8-mark'] = await text(s, '#sqnMenuBtn')
    await ringShot(s, 'a8-approvals-after-pick.png', { rings: [['#sqnMenuBtn'], [`${T('approvals-page')} ${T('appr-line-osp9')}`]], pad: 20,
      what: "Leave War → Approvals, with 149 picked while the page was open: it now lists 149's requests — Osprey's LL on 9 Dec (ringed) — and the top bar reads 149 (ringed)." })
    await pick(s, '142'); await navTo(s, 'View-only Sched')
  })
  await step('q-i set up: Saber gives Hunter View of 149', async () => {
    await adminCat(s, 'Users'); await openRow(s, 'prowler'); await press(s, lineBtn('149', 'view')); await press(s, '#accEdSave')
  })
  await as(s, 'ad2', 'a2')
  await step('q-i Hunter, 149 picked, Admin → Data', async () => {
    await pick(s, '149'); await adminCat(s, 'Data')
    for (const idp of ['admWipe', 'admLog']) {
      if (!(await s.page.locator(`#${idp}Date`).count())) { note(`no #${idp}Date`); continue }
      await s.page.click(`#${idp}Date`); await s.page.waitForTimeout(400)
      const day = s.page.locator('.dcal button:not([disabled]), [data-iso]:not([disabled])').filter({ hasText: /^\d{1,2}$/ }).filter({ visible: true })
      if (await day.count()) { await day.nth(Math.min(5, (await day.count()) - 1)).click(); await s.page.waitForTimeout(400) }
      await s.page.keyboard.press('Escape').catch(() => {}); await s.page.waitForTimeout(200)
      facts[`q-i-${idp}`] = await s.page.evaluate(id => { const b = document.getElementById(id); return b ? { on: !b.disabled, label: b.textContent.trim() } : null }, idp)
    }
    facts['q-i-mark'] = await text(s, '#sqnMenuBtn')
    await ringShot(s, 'q-i-data-clears-view-holder-149.png', { rings: [['#sqnMenuBtn'], ['#admWipe'], ['#admLog']], whole: true,
      what: "Question (i): Admin → Data as Hunter, who holds only View of 149, with 149 picked (the top bar reads 149, ringed) — both clears (\"Clear old clutter…\", \"Clear edit history…\") lit and pressable (ringed); not pressed." })
  })
  await s.ctx.close()
} finally { saveManifest('m3'); save('m3'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
