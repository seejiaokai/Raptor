// The re-walk of what the blind read's three fixes touched — the night of 21 Oct 26 (job 2). VERSION 1
// L1: the Post out sheet, a Delete posting, a date before his post-in → refused at once, no question, nothing saved.
// L2 (desktop): Reset order armed in January, the grid scrolled to March under the open sheet, then back → not armed.
// L3: the Legend's half-day lines read "<LL" / "LL>". Run: node rewalk.mjs phone|desktop
import { openWorld, tools } from './w2lib.mjs'
const WHICH = process.argv[2] || 'desktop'
console.log(`rewalk.mjs VERSION 1 — ${WHICH}`)
const res = []
const rec = (id, ok, seen, pic = '') => { res.push({ id, verdict: ok ? 'PASS' : 'FAIL', seen, pic }); console.log(`  [${id}] ${ok ? 'PASS' : 'FAIL'} — ${seen}`) }

// ---- L3: the Legend
{
  const w = await openWorld(WHICH); const t = tools(w, 'rw-l3'); const { page } = w
  await t.lw('JAN')
  await t.press('[data-testid="legend-open"]'); await page.waitForTimeout(400)
  const text = await page.locator('[data-testid="legend"]').innerText()
  await page.locator('[data-testid="legend"] .leg-sec', { hasText: 'a half day' }).scrollIntoViewIfNeeded()
  const pic = await t.shot('legend')
  rec('L3', /<LL\s*AM \(the arrow before the code\)/.test(text) && /LL>\s*PM \(the arrow after the code\)/.test(text) && !/\*LL|LL\*/.test(text),
    `the Legend's half-day lines: ${JSON.stringify((text.match(/The arrow[^]*?after the code\)/) || [''])[0].replace(/\s+/g, ' '))}`, pic)
  console.log('  errors', JSON.stringify(w.errors)); await w.browser.close()
}

// ---- L1: a refused date asks nothing
{
  const w = await openWorld(WHICH); const t = tools(w, 'rw-l1'); const { page } = w
  const today = t.addDays(0), later = t.addDays(10), pin = t.addDays(-5), before = t.addDays(-8)
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  /* Hex (rocky): posted in five days ago through the war's own post-in sheet would need a struck day before it; set it
     through the one-day sheet's PO instead, then the post-in via the bridge-free route is not offered here — so the
     post-in is the one Admin → Users gives a new man: add Probey with a post-in five days ago */
  await t.adminUsers()
  await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
  await page.fill('#accAddCs', 'Probey'); await page.fill('#accAddIni', 'PB')
  await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
  await t.press('#accAddPostIn')
  for (let i = 0; i < 3 && !(await page.locator(`[data-testid="dcal-day-${pin}"]`).count()); i++) await t.press('[data-testid="dcal-prev"]')
  await t.press(`[data-testid="dcal-day-${pin}"]`)
  await t.press('#accAdd'); await page.waitForTimeout(500)
  const id = await t.personId('Probey')
  await t.lw(later.slice(5, 7) === '10' ? 'OCT' : 'NOV')
  await page.locator(`[data-testid="cell-${id}-${later}"]`).scrollIntoViewIfNeeded()
  await t.press(`[data-testid="cell-${id}-${later}"]`)
  await t.press('[data-testid="bid-postout"]')
  await t.press('[data-testid="po-delete"]')
  await t.press('[data-testid="po-confirm"]'); await t.press('[data-testid="po-confirm"]'); await page.waitForTimeout(500)
  const struck = t.addDays(12)
  await page.locator(`[data-testid="cell-${id}-${struck}"]`).scrollIntoViewIfNeeded()
  await t.press(`[data-testid="cell-${id}-${struck}"]`); await page.waitForTimeout(300)
  rec('L1-setup', await t.vis('[data-testid="postout-sheet"]'), `Probey: post-in ${pin}, Delete posting ${later}; his Post out sheet open`)
  await t.press('[data-testid="postout-date"]')
  for (let i = 0; i < 3 && !(await page.locator(`[data-testid="dcal-day-${before}"]`).count()); i++) await t.press('[data-testid="dcal-prev"]')
  await t.press(`[data-testid="dcal-day-${before}"]`); await page.waitForTimeout(300)
  const asked = await page.locator('[data-testid="postout-delete-go"]').count()
  const err = (await page.locator('[data-testid="postout-err"]').count()) ? await page.locator('[data-testid="postout-err"]').innerText() : ''
  const box = await page.locator('[data-testid="postout-date"]').getAttribute('data-value')
  const pic = await t.shot('refused')
  const body = await page.evaluate(i => window.PEOPLE[i], id)
  rec('L1', asked === 0 && /post-out has to be/.test(err) && box === later && !body.deleted,
    `picked ${before} (before his post-in ${pin}): question shown ${asked}; said "${err}"; box ${box}; deleted ${!!body.deleted}`, pic)
  console.log('  errors', JSON.stringify(w.errors)); await w.browser.close()
}

// ---- L2 (desktop): the arm is taken back when the line greys under the open sheet
if (WHICH === 'desktop') {
  const w = await openWorld(WHICH); const t = tools(w, 'rw-l2'); const { page } = w
  await t.lw('JAN')
  await t.press('[data-testid="roster-arrange"]')
  /* W2's drag (w2b.mjs dragRow): the grip picked up, a first small move, then onto the upper half of DJ's row */
  await page.locator('[data-testid="row-dj"]').evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
  const g = await page.locator('[data-testid="drag-ignite"]').boundingBox(), d = await page.locator('[data-testid="row-dj"]').boundingBox()
  const x = g.x + g.width / 2, y0 = g.y + g.height / 2, y1 = d.y + 4
  await page.mouse.move(x, y0); await page.mouse.down()
  await page.mouse.move(x, y0 + (y1 > y0 ? 6 : -6), { steps: 3 }); await page.mouse.move(x + 40, y1, { steps: 8 })
  await page.waitForTimeout(100); await page.mouse.up(); await page.waitForTimeout(500)
  await t.press('[data-testid="roster-arrange"]')
  await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(400)
  const btn = () => page.evaluate(() => { const b = document.querySelector('[data-testid="roster-reset-order"]'); return { disabled: b.disabled, text: b.innerText.trim() } })
  const s0 = await btn()
  await t.press('[data-testid="roster-reset-order"]')
  const s1 = await btn()
  /* the grid moved to March under the open sheet — the wheel over the grid, as a person scrolls it */
  const wrap = await page.locator('.mx-wrap').boundingBox()
  for (let i = 0; i < 12; i++) { await page.mouse.move(wrap.x + wrap.width * 0.75, wrap.y + 120); await page.mouse.wheel(600, 0); await page.waitForTimeout(80) }
  await page.waitForTimeout(900)
  const s2 = await btn(); const p2 = await t.shot('march-greyed')
  for (let i = 0; i < 12; i++) { await page.mouse.move(wrap.x + wrap.width * 0.75, wrap.y + 120); await page.mouse.wheel(-600, 0); await page.waitForTimeout(80) }
  await page.waitForTimeout(900)
  const s3 = await btn(); const p3 = await t.shot('january-back')
  rec('L2-armed', s1.text === 'Really reset?' && !s0.disabled, `January, Torch moved: ${JSON.stringify(s0)} → first tap ${JSON.stringify(s1)}`)
  rec('L2-greyed', s2.disabled === true, `scrolled to March under the sheet: ${JSON.stringify(s2)} (the wheel ${s2.disabled ? 'reached' : 'did not reach'} the grid)`, p2)
  rec('L2-back', s2.disabled ? (!s3.disabled && /Reset order/.test(s3.text)) : true, `back to January: ${JSON.stringify(s3)}`, p3)
  console.log('  errors', JSON.stringify(w.errors)); await w.browser.close()
}
console.log('RESULTS ' + JSON.stringify(res))
