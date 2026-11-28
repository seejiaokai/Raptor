// Re-walk R2, a probe of what r3 found: with Saber on 149's Approvals holding a request, a pick of 142 left the war on
// 149's. Is a Leave War window open (mounted) at that moment, and which? The same world as r3, made the same way (by
// presses); at each pick the page's open war windows (role=dialog .bidsheet) and any band are read. Desktop.
import { serve, stop, newPage, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo } from '../walk/w1-view.mjs'
import { step, as, press, shot, vis, text } from './rlib.mjs'

const T = id => `[data-testid="${id}"]`
const SKIP_BID = process.env.SKIP_BID === '1'
const sheets = s => s.page.evaluate(() => [...document.querySelectorAll('.bidsheet, .sheetscrim')].map(e => `${e.className}|${e.dataset.testid || ''}|${e.getAttribute('aria-label') || ''}|${e.getBoundingClientRect().width}x${e.getBoundingClientRect().height}`))
const st = s => s.page.evaluate(() => { const r = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4)); const ap = document.querySelector('[data-testid="approvals-page"]'); return { mark: document.querySelector('#sqnMenuBtn')?.textContent.replace('TALON', ''), rows: r.length, first: r[0], appr: ap ? ap.querySelectorAll('[data-testid^="appr-line-"]').length : null } })
async function cell(s, pid, d) {
  const l = s.page.locator(T(`cell-${pid}-${d}`)).first()
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(350)
  const b = await l.boundingBox(); await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await s.page.waitForTimeout(600)
}
async function openDec(s) {
  await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
  await press(s, T('open-chip')); await press(s, T('od-month-2026-12')); if (await vis(s, T('od-apply'))) await press(s, T('od-apply'))
  for (const id of ['open-dates-close']) if (await vis(s, T(id))) await press(s, T(id))
  await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300)
}
await serve()
try {
  const s = await newPage('d')
  await signIn(s, 'ad', 'a')
  await step('setup', async () => {
    await openDec(s); facts.sheetsAfterOpenDec142 = await sheets(s)
    await navTo(s, 'View-only Sched'); await pick(s, '149'); await openDec(s); facts.sheetsAfterOpenDec149 = await sheets(s)
    await navTo(s, 'View-only Sched'); await pick(s, '142')
  })
  if (!SKIP_BID) {
    await as(s, 'us9', 'us9')
    await step('osprey bids', async () => {
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
      await cell(s, 'osp9', '2026-12-09'); await press(s, T('bid-LL')); await press(s, T('bid-LL'))
      facts.ospreySheets = await sheets(s)
    })
  }
  await as(s, 'ad', 'a')
  await step('saber', async () => {
    facts.s0 = { ...(await st(s)), sheets: await sheets(s) }
    if (process.env.VISIT142 === '1') {   // r3's path: 142's Approvals first, then View-only Sched
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1000); await press(s, T('lw-tab-approvals')); await s.page.waitForTimeout(800)
      facts.s0b_appr142 = { ...(await st(s)), sheets: await sheets(s) }
      await navTo(s, 'View-only Sched')
    }
    await pick(s, '149'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
    facts.s1_grid149 = { ...(await st(s)), sheets: await sheets(s) }
    if (process.env.PICK_ON !== 'grid') await press(s, T('lw-tab-approvals')); await s.page.waitForTimeout(800)
    facts.s2_appr149 = { ...(await st(s)), sheets: await sheets(s) }
    await pick(s, '142'); await s.page.waitForTimeout(1500)
    facts.s3_after_pick142 = { ...(await st(s)), sheets: await sheets(s), band: await text(s, '.movebar, [data-testid="move-band"]') }
    await shot(s, `r3d-${SKIP_BID ? 'nobid' : 'bid'}-${process.env.VISIT142 === '1' ? 'v142-' : ''}${process.env.PICK_ON || 'appr'}-after-pick142.png`)
    await s.page.waitForTimeout(4000); facts.s4_after_4s_more = await st(s)
    if (process.env.APPROVE === '1') {
      // what an Approve pressed on the line still shown does: Osprey's (149) request, with 142 in the top bar
      const ln = s.page.locator('[data-testid="approvals-page"] [data-testid="appr-approve"]').first()
      facts.s4a_line = await s.page.evaluate(() => document.querySelector('[data-testid="approvals-page"] [data-testid^="appr-line-"]')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 80))
      if (await ln.count()) { await ln.click(); await s.page.waitForTimeout(900) }
      facts.s4b_after_approve = { ...(await st(s)), toast: await text(s, '#toastEl'), line: await s.page.evaluate(() => document.querySelector('[data-testid="approvals-page"] [data-testid^="appr-line-"]')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)) }
      await shot(s, 'r3d-approve-on-stale-line.png')
      // where did it land? 149's Approvals (picked from another page) and Osprey's own cell there
      await navTo(s, 'View-only Sched'); await pick(s, '149'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
      facts.s4c_osprey_cell_149 = await s.page.evaluate(() => { const c = document.querySelector('[data-testid="cell-osp9-2026-12-09"]'); return c ? c.textContent.trim() + ' | ' + c.className : null })
      await press(s, T('lw-tab-approvals')); await s.page.waitForTimeout(800)
      facts.s4d_149_approvals = { ...(await st(s)), line: await s.page.evaluate(() => document.querySelector('[data-testid="approvals-page"] [data-testid^="appr-line-"]')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)) }
      await shot(s, 'r3d-approve-then-149.png')
      await navTo(s, 'View-only Sched'); await pick(s, '142'); await navTo(s, 'Leave War')
      return
    }
    // the other tab pressed, then back
    await press(s, T(process.env.PICK_ON === 'grid' ? 'lw-tab-balances' : 'lw-tab-grid')); await s.page.waitForTimeout(1000)
    facts.s5_other_tab = await st(s)
    await press(s, T(process.env.PICK_ON === 'grid' ? 'lw-tab-grid' : 'lw-tab-approvals')); await s.page.waitForTimeout(1000)
    facts.s6_back = await st(s)
    await shot(s, `r3d-${SKIP_BID ? 'nobid' : 'bid'}-${process.env.VISIT142 === '1' ? 'v142-' : ''}${process.env.PICK_ON || 'appr'}-after-tab-back.png`)
  })
  await s.ctx.close()
} finally { save('r3d'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
