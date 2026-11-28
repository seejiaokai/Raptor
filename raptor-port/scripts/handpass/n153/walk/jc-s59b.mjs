// jc-s59b - the rest of the plain-user rounds S58 and S59: every secondary control that opens or closes. Leave War: the period list, My leave, a person's window,
// OIL, Approvals' dates → Grid → Back, Balances, a range bid. Inputs: a calendar day, Custom times, the Document button (its file chooser left unanswered).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, as, go, shut, state } from './jlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-s59b v1', SZ)
picsFor('jc-s59b-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const q = t => `[data-testid="${t}"]`
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click({ timeout: 6000 }); else await l.tap({ timeout: 6000 }); await s.page.waitForTimeout(320) }
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true }).count().then(n => n > 0)
const esc = async s => { await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300) }
const sheets = s => s.page.evaluate(() => [...document.querySelectorAll('.sheet, [role=dialog], .floatwin')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.getAttribute('aria-label') || e.querySelector('h2,h3,.ttl,.title')?.textContent || e.className).toString().trim().slice(0, 40)))
async function toMonth(s, m) { await go(s, 'leavewar'); await shut(s); await s.page.waitForSelector(q('month-strip'), { timeout: 15000 }); await s.page.waitForTimeout(500); await tapIt(s, q(`month-${m}`)); await s.page.waitForTimeout(600) }
const toGrid = async s => { if (await vis(s, q('lw-tab-grid'))) await tapIt(s, q('lw-tab-grid')); await s.page.waitForTimeout(300) }
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('S59 the period list', async () => {
    await toMonth(s, 'DEC'); const opts = await page.evaluate(sel => [...document.querySelector(sel).options].map(o => `${o.value}|${o.textContent}`), q('war-picker')); rec('S59 periods', opts)
    const v0 = await page.inputValue(q('war-picker')); const other = opts.map(o => o.split('|')[0]).find(v => v !== v0)
    if (other) { await page.selectOption(q('war-picker'), other); await page.waitForTimeout(600); await pic(s, 'l1-other-period'); check('S59 the period changed', (await page.inputValue(q('war-picker'))) === other, other); await page.selectOption(q('war-picker'), v0); await page.waitForTimeout(600); check('S59 and back', (await page.inputValue(q('war-picker'))) === v0, v0) }
  })
  await step('S59 My leave', async () => {
    await tapIt(s, q('my-leave')); await page.waitForTimeout(300); const w = await sheets(s); rec('S59 My leave opens', w); await pic(s, 'l2-my-leave'); check('S59 My leave opens a window', w.length > 0, w)
    await esc(s); check('S59 Escape closes My leave', (await sheets(s)).length === 0, await sheets(s)); check('S59 still on the Leave War', (await state(s)).page === 'page-leavewar', (await state(s)).page)
  })
  await step('S59 a person window from the grid', async () => {
    const who = page.locator('td.who button, td.who [role=button], td.who .np').filter({ hasText: 'Ranger' }).first()
    if (!(await who.count())) { note('S59 NOT WALKED person window: no name control found'); return }
    await who.scrollIntoViewIfNeeded(); await tapIt(s, who); await page.waitForTimeout(350); const w = await sheets(s); rec('S59 person window', w); await pic(s, 'l3-person'); check('S59 his window opens', w.length > 0, w)
    const x = page.locator('.sheet button[aria-label^="Close"], [role=dialog] button[aria-label^="Close"], .floatwin button[aria-label^="Close"]').filter({ visible: true }).first()
    if (await x.count()) { await tapIt(s, x); check('S59 ✕ closes it', (await sheets(s)).length === 0, await sheets(s)); await who.scrollIntoViewIfNeeded(); await tapIt(s, who); await page.waitForTimeout(300) }
    await esc(s); check('S59 Escape closes it', (await sheets(s)).length === 0, await sheets(s))
  })
  await step('S59 OIL page', async () => {
    await tapIt(s, q('oil-tracker')); await page.waitForTimeout(450); await pic(s, 'l4-oil'); rec('S59 OIL page words', await page.evaluate(() => document.querySelector('#page-leavewar').innerText.replace(/\s+/g, ' ').slice(0, 120)))
    /* OIL opens as a window of its own over the grid: its ✕, then opened again and closed by Escape */
    check('S59 OIL has its close button', await vis(s, q('oil-close')), await vis(s, q('oil-close')))
    await tapIt(s, q('oil-close')); await page.waitForTimeout(300); check('S59 ✕ closes OIL', !(await vis(s, q('oil-close'))), 'closed')
    await tapIt(s, q('oil-tracker')); await page.waitForTimeout(400); await esc(s); check('S59 Escape closes OIL', !(await vis(s, q('oil-close'))), 'closed')
    check('S59 back on the Grid', await vis(s, q('month-strip')), 'grid')
  })
  await step('S59 Approvals: dates → Grid → Back', async () => {
    await tapIt(s, q('lw-tab-approvals')); await page.waitForTimeout(450)
    const d = page.locator(q('appr-dates')).filter({ visible: true }).first(); rec('S59 first date link', await d.textContent()); await tapIt(s, d); await page.waitForTimeout(600); await pic(s, 'l5-from-approvals')
    const back = page.locator(q('appr-back')).filter({ visible: true }); check('S59 the Grid offers Back', (await back.count()) > 0, await back.count())
    if (await back.count()) { await tapIt(s, back.first()); await page.waitForTimeout(450); check('S59 Back returns to Approvals', await vis(s, q('approvals-page')), 'approvals'); await pic(s, 'l6-back') }
    await toGrid(s)
  })
  await step('S59 Balances and a person from there', async () => {
    await tapIt(s, q('lw-tab-balances')); await page.waitForTimeout(450); check('S59 Balances opens', await vis(s, q('balances-page')), 'open')
    const n = page.locator(`${q('balances-page')} button, ${q('balances-page')} [role=button]`).filter({ hasText: 'Ranger' }).first()
    if (await n.count()) { await n.scrollIntoViewIfNeeded(); await tapIt(s, n); await page.waitForTimeout(350); const w = await sheets(s); rec('S59 person from Balances', w); await pic(s, 'l7-bal-person'); if (w.length) { await esc(s); check('S59 Escape returns to Balances', await vis(s, q('balances-page')) && (await sheets(s)).length === 0, await sheets(s)) } } else note('no name control on Balances')
    await toGrid(s)
  })
  await step('S59 a range bid by the member', async () => {
    await tapIt(s, q('open-chip')); await page.waitForTimeout(300); const m = page.locator('[data-testid^="od-month-"]', { hasText: /dec/i }).filter({ visible: true }).first(); await tapIt(s, m); await page.waitForTimeout(200); if (await vis(s, q('od-apply'))) await tapIt(s, q('od-apply')); if (await vis(s, q('open-dates-close'))) await tapIt(s, q('open-dates-close'))
    await as(s, 'us', 'us'); await toMonth(s, 'DEC')
    const c = d => `[data-testid="cell-bane-2026-12-${d}"]`; await page.evaluate(x => document.querySelector(x)?.scrollIntoView({ block: 'center', inline: 'center' }), c('21')); await page.waitForTimeout(300); await tapIt(s, c('21')); await page.waitForTimeout(350)
    check('S59 the bid window opens', await vis(s, q('bid-picker')), 'open'); await tapIt(s, q('span-range')); await page.waitForTimeout(350); await pic(s, 'l8-range-open')
    const days = page.locator(`${q('bid-picker')} button[aria-label*="23"]`).filter({ visible: true }); rec('S59 range: day buttons for the 23rd', await days.count())
    if (await days.count()) { await tapIt(s, days.first()); await page.waitForTimeout(300) } else { await page.evaluate(x => document.querySelector(x)?.scrollIntoView({ block: 'center', inline: 'center' }), c('23')); await tapIt(s, c('23')); await page.waitForTimeout(350) }
    await pic(s, 'l9-range-picked'); rec('S59 range: the window says', await page.evaluate(x => document.querySelector(x)?.querySelector('.bidsheet-hd .when')?.textContent, q('bid-picker')))
    const ol = page.locator(`${q('bid-leave-grid')} button`, { hasText: /^OL/ }).filter({ visible: true }).first(); if (await ol.count()) await tapIt(s, ol); await page.waitForTimeout(400); const ask = await page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null }); if (ask) { rec('S59 range: asks', ask); await tapIt(s, '#dlgOk') }
    if (await vis(s, q('bid-picker'))) await tapIt(s, q('bid-cancel'))
    const cells = await page.evaluate(() => ['21', '22', '23', '24'].map(d => document.querySelector(`[data-testid="cell-bane-2026-12-${d}"]`)?.textContent.trim())); rec('S59 range: his cells 21 to 24', cells); await pic(s, 'l10-range-placed'); check('S59 the range covers 21, 22, 23 and stops', /OL/.test(cells[0] || '') && /OL/.test(cells[2] || '') && !/OL/.test(cells[3] || ''), cells)
  })
  await step('S58 Inputs: a calendar day, Custom, Document', async () => {
    await go(s, 'inputs'); await shut(s); await page.waitForTimeout(400); await tapIt(s, '#inCalBtn'); await page.waitForTimeout(300)
    for (let i = 0; i < 6 && !(await page.locator('#page-inputs button[aria-label*="December 2026"]').count()); i++) await tapIt(s, '#icNext')
    const labels = await page.evaluate(() => [...document.querySelectorAll('#page-inputs [aria-label]')].map(b => b.getAttribute('aria-label')).filter(a => /input/i.test(a))); rec('S58 calendar labels sample', labels.slice(0, 3))
    const dayLabel = labels.find(a => /(^|\D)16(\D|$)/.test(a)); rec('S58 calendar day label', dayLabel)
    const day = page.locator(`#page-inputs [aria-label="${dayLabel}"]`).first(); await tapIt(s, day); await page.waitForTimeout(350); await pic(s, 'c1-day'); const w = await sheets(s); rec('S58 the day opens', w)
    const add = page.locator('button', { hasText: /^\+ Input$/ }).filter({ visible: true }); if (await add.count()) { await tapIt(s, add.last()); await page.waitForTimeout(300) }
    check('S58 a calendar day leads to the input window', await vis(s, '.floatwin.inpedwin'), await sheets(s))
    const custom = page.locator('.floatwin.inpedwin button', { hasText: /^Custom$/i }).first(); await tapIt(s, custom); await page.waitForTimeout(250); const times = await page.locator('.floatwin.inpedwin input').filter({ visible: true }).count(); rec('S58 boxes after Custom', times); await pic(s, 'c2-custom')
    const doc = page.locator('.floatwin.inpedwin button', { hasText: /^Document$/ }).first(); if (s.desk) { const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null), doc.click()]); check('S58 Document opens the file chooser', !!fc, !!fc) } else { await doc.tap(); await page.waitForTimeout(300); rec('S58 Document pressed on the phone; windows', await sheets(s)) }
    await page.waitForTimeout(250); await tapIt(s, '#inpEditCancel'); await page.waitForTimeout(300); check('S58 Cancel closes the window', !(await vis(s, '.floatwin.inpedwin')), 'closed')
    if ((await sheets(s)).length) { await esc(s) } check('S58 nothing left open', (await sheets(s)).length === 0, await sheets(s)); await pic(s, 'c3-closed')
  })
  await s.ctx.close()
} finally { finish('jc-s59b-' + SZ); await closeAll() }
