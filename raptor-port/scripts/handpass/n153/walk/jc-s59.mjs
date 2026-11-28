// jc-s59 - S59, the Leave War everyday round: admin opens July for bidding; Ranger bids on his own row; the admin approves it in Approvals;
// the grid, My leave, Balances, Inputs and the bell read back; the page's secondary windows opened and closed.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, as, go, shut, state } from './jlib.mjs'
import { bell } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-s59 v1', SZ)
picsFor('jc-s59-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const q = t => `[data-testid="${t}"]`
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(320) }
const DAY = '2026-12-15'
const cell = (who = 'bane') => `[data-testid="cell-${who}-${DAY}"]`
const cellText = s => s.page.evaluate(c => { const e = document.querySelector(c); return e ? e.textContent.trim() : null }, cell())
const visible = (s, sel) => s.page.locator(sel).filter({ visible: true }).count().then(n => n > 0)
const pickerBtns = s => s.page.evaluate(p => { const r = document.querySelector(p); return r ? [...r.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.dataset.testid ? b.dataset.testid + ':' : '') + b.textContent.replace(/\s+/g, ' ').trim().slice(0, 14)) : null }, q('bid-picker'))
async function toJuly(s) {
  await go(s, 'leavewar'); await shut(s); await s.page.waitForSelector(q('month-strip'), { timeout: 15000 }); await s.page.waitForTimeout(700)
  const w = s.page.locator(q('war-picker')).filter({ visible: true }); if (await w.count()) { const v = await w.first().inputValue(); if (v !== 'y2026') { await s.page.selectOption(q('war-picker'), 'y2026'); await s.page.waitForTimeout(700) } }
  await tapIt(s, q('month-DEC')); await s.page.waitForTimeout(800)
}
const showCell = (s, sel) => s.page.evaluate(c => document.querySelector(c)?.scrollIntoView({ block: 'center', inline: 'center' }), sel)
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('S59 admin opens December for bidding', async () => {
    await toJuly(s); await pic(s, 'a1-july')
    await tapIt(s, q('open-chip')); await page.waitForTimeout(350); check('S59 Open for bidding opens', await visible(s, q('open-dates')), 'open'); await pic(s, 'a2-open-dates')
    const m = page.locator('[data-testid^="od-month-"]', { hasText: /dec/i }).filter({ visible: true }).first(); rec('S59 December row', await m.textContent()); await tapIt(s, m); await page.waitForTimeout(250)
    if (await visible(s, q('od-apply'))) await tapIt(s, q('od-apply'))
    if (await visible(s, q('open-dates-close'))) await tapIt(s, q('open-dates-close')); await page.waitForTimeout(300); check('S59 the window closed', !(await visible(s, q('open-dates'))), 'closed')
  })
  await step('S59 Ranger bids on his own row', async () => {
    await as(s, 'us', 'us'); await toJuly(s); await showCell(s, cell()); await page.waitForTimeout(350); await pic(s, 'm1-grid')
    rec('S59 cell before', await cellText(s))
    await tapIt(s, cell()); await page.waitForTimeout(450); check('S59 his day opens the bid window', await visible(s, q('bid-picker')), 'open'); rec('S59 picker', await pickerBtns(s)); await pic(s, 'm2-picker')
    await tapIt(s, q('bid-cancel')); await page.waitForTimeout(250); check('S59 ✕ closes it', !(await visible(s, q('bid-picker'))), 'closed')
    await showCell(s, cell()); await tapIt(s, cell()); await page.waitForTimeout(350); await page.keyboard.press('Escape'); await page.waitForTimeout(300); check('S59 Escape closes it', !(await visible(s, q('bid-picker'))), 'closed')
    await showCell(s, cell()); await tapIt(s, cell()); await page.waitForTimeout(350)
    const ol = page.locator(`${q('bid-leave-grid')} button`, { hasText: /^OL/ }).filter({ visible: true }).first(); check('S59 OL offered', (await ol.count()) > 0, await ol.count()); await tapIt(s, ol); await page.waitForTimeout(450); await pic(s, 'm3-after-OL')
    rec('S59 picker after OL', await pickerBtns(s)); const q1 = await page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null }); if (q1) { rec('S59 question', q1); await tapIt(s, '#dlgOk') }
    if (await visible(s, q('bid-picker'))) { if (await visible(s, q('bid-cancel'))) await tapIt(s, q('bid-cancel')) }
    await page.waitForTimeout(250); const c = await cellText(s); rec('S59 cell after the bid', c); check('S59 his bid stands on his row', /OL/.test(c || ''), c); await pic(s, 'm4-bid-on-grid')
  })
  await step('S59 member: My leave and Balances', async () => {
    const tabs = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="lw-tab-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + ':' + e.textContent.trim().slice(0, 12))); rec('S59 member tabs', tabs)
    const ml = page.locator('[data-testid^="lw-tab-"]', { hasText: /My leave/ }).filter({ visible: true }); if (await ml.count()) { await tapIt(s, ml.first()); await page.waitForTimeout(450); const t = await page.evaluate(sel => document.querySelector(sel)?.innerText.replace(/\s+/g, ' ').slice(0, 220), q('my-leave')); rec('S59 My leave', t); await pic(s, 'm5-my-leave'); check('S59 My leave names the bid', /OL/.test(t || ''), (t || '').slice(0, 60)) } else note('no My leave tab drawn')
    const g = page.locator(q('lw-tab-grid')).filter({ visible: true }); if (await g.count()) await tapIt(s, g.first())
  })
  await step('S59 admin decides it in Approvals', async () => {
    await as(s, 'ad', 'a'); await toJuly(s)
    const t = page.locator('[data-testid^="lw-tab-"]', { hasText: /Approvals/ }).filter({ visible: true }); check('S59 Approvals tab', (await t.count()) > 0, await t.count()); rec('S59 count', await page.evaluate(sel => document.querySelector(sel)?.textContent.trim(), q('lw-approvals-count')))
    await tapIt(s, t.first()); await page.waitForTimeout(500); await pic(s, 'a3-approvals')
    const line = page.locator(q('appr-line-bane')).filter({ hasText: '15 Dec' }).filter({ visible: true }); check('S59 Ranger on the Approvals list', (await line.count()) > 0, await line.count())
    rec('S59 line', await line.first().textContent()); const inner = line.first().locator(q('appr-approve')); if (await inner.count()) await tapIt(s, inner.first()); else { await tapIt(s, line.first()); await page.waitForTimeout(300); await tapIt(s, q('appr-approve')) }
    await page.waitForTimeout(450); const a = await page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null }); if (a) { rec('S59 approve asks', a); await tapIt(s, '#dlgOk'); await page.waitForTimeout(350) }
    await pic(s, 'a4-approved'); check('S59 the line now reads Approved', /Approved/.test(await line.first().textContent()), (await line.first().textContent()).slice(-30))
    const g = page.locator(q('lw-tab-grid')).filter({ visible: true }); if (await g.count()) await tapIt(s, g.first()); await page.waitForTimeout(450)
    const c = await cellText(s); rec('S59 grid after approval', c); check('S59 grid shows the leave', /OL/.test(c || ''), c)
  })
  await step('S59 admin: Balances, person window, Legend, Settings, Manning open and close', async () => {
    const b = page.locator('[data-testid^="lw-tab-"]', { hasText: /Balances/ }).filter({ visible: true }); if (await b.count()) { await tapIt(s, b.first()); await page.waitForTimeout(450); check('S59 Balances opens', await visible(s, q('balances-page')), 'open'); await pic(s, 'a5-balances') }
    const g = page.locator(q('lw-tab-grid')).filter({ visible: true }); if (await g.count()) await tapIt(s, g.first()); await page.waitForTimeout(400)
    const closeTop = async name => { const before = await page.evaluate(() => document.querySelectorAll('.sheet, [role=dialog]').length); await page.keyboard.press('Escape'); await page.waitForTimeout(280); const after = await page.evaluate(() => [...document.querySelectorAll('.sheet, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 0).length); rec(`S59 ${name} after Escape: windows drawn`, { before, after }) }
    for (const [name, re] of [['Legend', /^Legend/i], ['Manning', /Manning/i], ['Settings', null]]) {
      const c = re ? page.locator('#page-leavewar button', { hasText: re }).filter({ visible: true }).first() : page.locator('#page-leavewar button[aria-label*="ettings"], #page-leavewar button[title*="ettings"]').filter({ visible: true }).first()
      if (await c.count()) { await tapIt(s, c); await page.waitForTimeout(350); await pic(s, `a6-${name}`); await closeTop(name); await pic(s, `a6-${name}-closed`); const st = await state(s); check(`S59 ${name} closes back on the Leave War`, st.page === 'page-leavewar', st.page) } else note(`no ${name} control drawn`)
    }
  })
  await step('S59 Ranger: bell, Inputs and the grid agree', async () => {
    await as(s, 'us', 'us'); await bell.open(s); const L = await bell.lines(s); rec('S59 Ranger bell', L.slice(0, 3)); await pic(s, 'm6-bell'); check('S59 his bell names the decision', L.some(x => /OL|Approved|approved/.test(x)), L.slice(0, 1)); await bell.close(s)
    await toJuly(s); const c = await cellText(s); rec('S59 his grid', c); check('S59 his grid shows it', /OL/.test(c || ''), c)
    await go(s, 'inputs'); await shut(s); await page.waitForTimeout(450); await tapIt(s, '#inListBtn'); await page.waitForTimeout(250); const all = page.locator('#inRangeBtn').filter({ visible: true })
    /* the list opens on two weeks from today: its date button's "All dates" shows 15 Dec */
    await tapIt(s, all.first()); await page.waitForTimeout(250); const allBtn = page.locator('button', { hasText: /^All dates$/ }).filter({ visible: true }); rec('S59 All dates offered', await allBtn.count()); if (await allBtn.count()) await tapIt(s, allBtn.first()); await page.waitForTimeout(300)
    if (await page.locator('#inRangeBtn[aria-expanded="true"]').count()) await tapIt(s, '#inRangeBtn')
    /* a phone's card carries no date: its day stands in the heading drawn above it, so each row is read with the last day heading over it */
    const rows = await page.evaluate(() => {
      const heads = [...document.querySelectorAll('#page-inputs *')].filter(e => !e.children.length && /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\s+[A-Za-z]{3}$/i.test(e.textContent.trim()) && e.getBoundingClientRect().height > 0).map(e => ({ y: e.getBoundingClientRect().top, t: e.textContent.trim() }))
      return [...document.querySelectorAll('[data-iid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => { const y = e.getBoundingClientRect().top; const h = heads.filter(x => x.y <= y).pop(); return `${h ? h.t + ' | ' : ''}${e.innerText.replace(/\s+/g, ' ').slice(0, 60)}` })
    })
    const dec15 = rows.filter(t => /15 Dec/i.test(t)); rec('S59 Inputs rows, all dates', dec15)
    check('S59 Inputs shows his approved leave once', dec15.length === 1 && /Ranger/.test(dec15[0]) && /OL/.test(dec15[0]), dec15)
    await pic(s, 'm7-inputs')
  })
  await s.ctx.close()
} finally { finish('jc-s59-' + SZ); await closeAll() }
