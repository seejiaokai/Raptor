// Re-walk round 2 — N1 / A2: the Leave War follows a pick made while it is open. All by presses.
//  Setup: Saber opens December for bidding in 142's and 149's wars (both on their "JAN - DEC 26" period — the same dates,
//  Astra's shape); Ranger (142) and Osprey (149) each bid LL on 9 Dec.
//  A. N1's route exactly (r3d): 142's Approvals visited first; View-only Sched; 149 picked; Leave War → Approvals.
//  B. 142 picked with Approvals open: at once only 142's requests, no 149 man, nothing "No longer there"; Ranger's 9 Dec
//     Approve works.  C. 149 picked with Approvals open: the same the other way; Osprey's Approve works.
//  D. Grid, Balances and OIL tabs each redraw after a pick.  E. Ordinary edits redraw: an OIL credit on the OIL tab (its
//     balance, then Balances' OIL figure), an LL placed on the Grid (its cell, then Balances).
import { serve, stop, newPage, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, toastText } from '../walk/w1-view.mjs'
import { step, as, press, shot, vis, text } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
const T = id => `[data-testid="${id}"]`
const P149 = ['kes9', 'osp9', 'mer9', 'har9', 'fal9', 'her9', 'rav9', 'shr9', 'con9', 'gan9']
async function cell(s, pid, d) {
  const l = s.page.locator(T(`cell-${pid}-${d}`)).first()
  if (!(await l.count())) { note(`[${s.sz}] no cell ${pid} ${d}`); return false }
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(350)
  const b = await l.boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await s.page.waitForTimeout(600); return true
}
async function ll(s) {   // LL, and LL again where the window asks "Tap the same leave again to go ahead."
  await press(s, T('bid-LL')); await s.page.waitForTimeout(300)
  const t = await text(s, T('bid-picker')); if (t && /Tap the same leave again/.test(t)) { await press(s, T('bid-LL')); await s.page.waitForTimeout(300) }
  for (const id of ['bid-cancel']) if (await vis(s, T(id))) await press(s, T(id))
}
async function openDec(s) {
  await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
  await press(s, T('open-chip')); await press(s, T('od-month-2026-12')); if (await vis(s, T('od-apply'))) await press(s, T('od-apply'))
  await s.page.keyboard.press('Escape').catch(() => {}); await s.page.waitForTimeout(300)
}
const st = s => s.page.evaluate(P149 => {
  const is149 = id => P149.includes(id)
  const ap = document.querySelector('[data-testid="approvals-page"]')
  const vis = e => e.getBoundingClientRect().height > 0
  const appr = ap && vis(ap) ? [...ap.querySelectorAll('[data-testid^="appr-line-"]')].filter(vis).map(l => l.dataset.testid.slice(10)) : null
  const grid = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4))
  const bal = [...document.querySelectorAll('[data-testid^="bal-row-"]')].filter(vis).map(e => e.dataset.testid.slice(8))
  const oil = [...document.querySelectorAll('[data-testid^="oil-row-"]')].filter(vis).map(e => e.dataset.testid.slice(8))
  const sum = a => a == null ? null : { n: a.length, of149: a.filter(is149).length, of142: a.filter(x => !is149(x)).length }
  return {
    mark: document.querySelector('#sqnMenuBtn')?.textContent.replace('TALON', '').trim(),
    period: document.querySelector('[data-testid="war-picker"]')?.textContent.replace(/\s+/g, ' ').trim(),
    appr: sum(appr), apprIds: appr && [...new Set(appr)].slice(0, 6),
    noLonger: ap ? (ap.innerText.match(/No longer there/g) || []).length : null,
    head: ap && vis(ap) ? ap.querySelector('.appr-title')?.parentElement?.textContent.replace(/\s+/g, ' ').trim().slice(0, 90) : null,
    grid: sum(grid), bal: sum(bal), oil: sum(oil),
  }
}, P149)
async function approveLine(s, pid, day, P, tag) {
  const line = s.page.locator(`${T('approvals-page')} ${T('appr-line-' + pid)}`).filter({ hasText: day }).first()
  if (!(await line.count())) { facts[`${P}-${tag}-approve`] = 'NO LINE'; return }
  const b = line.locator(T('appr-approve'))
  await b.scrollIntoViewIfNeeded()
  if (s.desk) await b.click(); else await b.tap()
  await s.page.waitForTimeout(700)
  facts[`${P}-${tag}-approve`] = { pressed: await b.getAttribute('aria-pressed'), line: (await line.innerText()).replace(/\s+/g, ' ').slice(0, 80), toast: await toastText(s), tab: await text(s, T('lw-tab-approvals')) }
}
async function tab(s, id) { await press(s, T(id)); await s.page.waitForTimeout(900) }

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r7-${sz}`
    await signIn(s, 'ad', 'a')
    await step('setup: December open in both', async () => {
      await openDec(s); facts[`${P}-period142`] = (await st(s)).period
      await navTo(s, 'View-only Sched'); await pick(s, '149'); await openDec(s); facts[`${P}-period149`] = (await st(s)).period
      await navTo(s, 'View-only Sched'); await pick(s, '142')
    })
    await as(s, 'us', 'us')
    await step('ranger bids', async () => { await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200); await cell(s, 'bane', '2026-12-09'); await ll(s) })
    await as(s, 'us9', 'us9')
    await step('osprey bids', async () => { await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200); await cell(s, 'osp9', '2026-12-09'); await ll(s) })
    await as(s, 'ad', 'a')
    await step('A: N1 route to 149 Approvals', async () => {
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1000); await tab(s, 'lw-tab-approvals')
      facts[`${P}-A0-142`] = await st(s)
      await navTo(s, 'View-only Sched'); await pick(s, '149'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1000); await tab(s, 'lw-tab-approvals')
      facts[`${P}-A1-149`] = await st(s)
      await shot(s, `${P}-A1-149-approvals.png`)
    })
    await step('B: pick 142 on Approvals', async () => {
      await pick(s, '142'); facts[`${P}-B0-at-once`] = await st(s)
      await shot(s, `${P}-B0-pick142-on-approvals.png`)
      await approveLine(s, 'bane', '9 Dec', P, 'B1')
      facts[`${P}-B1-after`] = await st(s)
      await shot(s, `${P}-B1-ranger-approved.png`)
    })
    await step('C: pick 149 on Approvals', async () => {
      await pick(s, '149'); facts[`${P}-C0-at-once`] = await st(s)
      await shot(s, `${P}-C0-pick149-on-approvals.png`)
      await approveLine(s, 'osp9', '9 Dec', P, 'C1')
      facts[`${P}-C1-after`] = await st(s)
      await shot(s, `${P}-C1-osprey-approved.png`)
    })
    await step('D: Grid, Balances, OIL after a pick', async () => {
      // the OIL tab opens the OIL tracker as a window over the whole page, top bar included (its ✕ closes it), so a pick
      // is made with it closed and the tab pressed again after
      const oil = t => t === 'oil-tracker'
      for (const t of ['lw-tab-grid', 'lw-tab-balances', 'oil-tracker']) {
        await tab(s, t); facts[`${P}-D-${t}-149`] = await st(s)
        if (oil(t)) await press(s, T('oil-close'))
        await pick(s, '142'); await s.page.waitForTimeout(400)
        if (oil(t)) await tab(s, t)
        facts[`${P}-D-${t}-142`] = await st(s)
        await shot(s, `${P}-D-${t}-after-pick142.png`)
        if (oil(t)) await press(s, T('oil-close'))
        await pick(s, '149'); await s.page.waitForTimeout(400)
        if (oil(t)) { await tab(s, t); facts[`${P}-D-${t}-149-again`] = await st(s); await press(s, T('oil-close')) }
        else facts[`${P}-D-${t}-149-again`] = await st(s)
      }
      await pick(s, '142'); await s.page.waitForTimeout(400)
    })
    await step('E: an OIL credit on the OIL tab', async () => {
      await tab(s, 'oil-tracker')
      const pid = 'dice'
      const bal = () => s.page.evaluate(p => document.querySelector(`[data-testid="oil-bal-${p}"]`)?.textContent.trim() ?? null, pid)
      facts[`${P}-E-oil-before`] = await bal()
      const nm = s.page.locator(T(`oil-name-${pid}`)).first()
      if (!(await nm.count())) { facts[`${P}-E-oil`] = `no OIL row ${pid}`; return }
      await nm.scrollIntoViewIfNeeded(); if (s.desk) await nm.click(); else await nm.tap(); await s.page.waitForTimeout(400)
      facts[`${P}-E-oil-panel`] = await vis(s, T('oil-credit-panel'))
      await s.page.locator(T('oil-amt')).first().fill('1'); await press(s, T('oil-credit-save')); await s.page.waitForTimeout(500)
      facts[`${P}-E-oil-after`] = await bal(); facts[`${P}-E-oil-err`] = await text(s, T('oil-credit-err'))
      await shot(s, `${P}-E1-oil-credit.png`)
      await press(s, T('oil-close'))
      await tab(s, 'lw-tab-balances')
      facts[`${P}-E-bal-oil`] = await s.page.evaluate(p => document.querySelector(`[data-testid="bal-oil-${p}"]`)?.textContent.trim() ?? null, pid)
      facts[`${P}-E-bal-row-before-ll`] = await s.page.evaluate(p => document.querySelector(`[data-testid="bal-row-${p}"]`)?.textContent.replace(/\s+/g, ' ').trim() ?? null, pid)
      await shot(s, `${P}-E2-balances-after-credit.png`)
    })
    await step('E: an LL placed on the Grid', async () => {
      await tab(s, 'lw-tab-grid')
      const pid = 'dice', day = '2026-12-14'
      facts[`${P}-E-cell-before`] = await text(s, T(`cell-${pid}-${day}`))
      await cell(s, pid, day); await ll(s); await s.page.waitForTimeout(400)
      facts[`${P}-E-cell-after`] = await text(s, T(`cell-${pid}-${day}`))
      await shot(s, `${P}-E3-grid-ll.png`)
      await tab(s, 'lw-tab-balances')
      facts[`${P}-E-bal-row-after-ll`] = await s.page.evaluate(p => document.querySelector(`[data-testid="bal-row-${p}"]`)?.textContent.replace(/\s+/g, ' ').trim() ?? null, pid)
      await tab(s, 'lw-tab-approvals'); facts[`${P}-E-appr-after-ll`] = await st(s)
    })
    await s.ctx.close()
  }
} finally { save('r7'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
