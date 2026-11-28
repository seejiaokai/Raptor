// rc-10 - the plain-user round, Inputs and the top bar's squadron list: file an input, open it, edit, save, close by Close, the cross,
// Escape and a press outside; the Inputs filter; the squadron list opened and closed by press, Escape, Tab out, a press outside, picks both ways.
import { signIn, mk, closeAll, finish, step, pic, picsFor, press, go, shut, state, note, check, pickSq } from './rlib.mjs'
const SZ = process.env.SZ || 'd'
const RUN = process.env.RUN || '1'
const tag = `rc10-${SZ}-${RUN}`
console.log('rc-10 v1', SZ, RUN, process.env.MQ_PORT)
picsFor(tag)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const ROW = s => s.desk ? '#inBody tr[data-iid]' : '[data-testid^="inl-row-"]'
const winOpen = s => s.page.evaluate(() => [...document.querySelectorAll('#inpEditSave')].some(e => e.getBoundingClientRect().width > 0))
const rmk = s => s.page.evaluate(() => [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0)?.value ?? null)
const rowsText = s => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()), ROW(s))
const listOpen = s => s.page.evaluate(() => { const m = document.querySelector('#sqnMenu'); return !!m && m.getBoundingClientRect().width > 0 })
const listAll = async s => {
  const { page } = s
  await go(s, 'inputs'); if (!s.desk) await shut(s); await wait(s, 600)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await wait(s, 350)
  if (await page.locator('#inRangePop').filter({ visible: true }).count()) { await press(s, '#inRangeBtn'); await wait(s, 200) }
}
const openRow = async (s, words) => {
  const r = s.page.locator(ROW(s), { hasText: words }).filter({ visible: true }).first()
  await r.scrollIntoViewIfNeeded().catch(() => {})
  await press(s, s.desk ? r.locator('[data-testid="in-open"]').first() : r, s.desk ? undefined : 'open'); await wait(s, 500)
  return winOpen(s)
}
const tapAt = async (s, x, y) => { if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y); await wait(s, 450) }
try {
  const s = await mk(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  const W = `RC plain ${SZ}`
  await step('file an input', async () => {
    await listAll(s); const before = (await rowsText(s)).length
    await press(s, '#inNew', 'new'); await wait(s, 500); check('+ Input opens the window', await winOpen(s), await winOpen(s)); await pic(s, '01-new-window')
    await page.locator('#inpEditRmk').filter({ visible: true }).first().fill(W); await wait(s, 200)
    const day = page.locator('.floatwin button, .airpop button').filter({ hasText: /^20$/ }).filter({ visible: true }).first()
    await day.scrollIntoViewIfNeeded().catch(() => {}); await press(s, day, 'day'); await wait(s, 250); await pic(s, '01b-day-picked')
    await press(s, '#inpEditSave', 'save'); await wait(s, 600)
    for (let i = 0; i < 3; i++) { const nd = page.locator('button', { hasText: /^No document$/ }).filter({ visible: true }); if (await nd.count()) { await press(s, nd.first()); await wait(s, 350) } if (await page.locator('#dlgModal').count()) { note('filing asked', await page.locator('#dlgMsg').textContent()); await press(s, '#dlgOk'); await wait(s, 350) } }
    await wait(s, 500); await pic(s, '02-after-filing')
    const open = await winOpen(s); if (open) note('the window stayed open after Save', JSON.stringify(await page.evaluate(() => document.querySelector('.inped-err, .saveband, [role=alert]')?.textContent ?? null)))
    await listAll(s); const after = await rowsText(s); check('the new input is in the list', after.some(x => x.includes(W)) && after.length === before + 1, { before, after: after.length }); await pic(s, '03-list-with-new')
  })
  await step('open, edit, save', async () => {
    check('its row opens the window', await openRow(s, W), true)
    await page.locator('#inpEditRmk').filter({ visible: true }).first().fill(W + ' edited'); await wait(s, 200)
    await press(s, '#inpEditSave', 'save2'); await wait(s, 800); await listAll(s)
    check('the edit shows in the list', (await rowsText(s)).some(x => x.includes(W + ' edited')), true); await pic(s, '04-edited')
  })
  const NOW = W + ' edited'
  await step('close by Cancel, the cross, Escape and a press outside, with nothing typed', async () => {
    await openRow(s, NOW); await press(s, '#inpEditCancel', 'cancel'); await wait(s, 300); check('Cancel closes', !(await winOpen(s)), await winOpen(s))
    await openRow(s, NOW); const x = page.locator('.win-x, #inpEditClose').filter({ visible: true }).first()
    note('the cross found', await x.count()); await press(s, x, 'cross'); await wait(s, 300); check('the cross closes', !(await winOpen(s)), await winOpen(s))
    if (s.desk) { await openRow(s, NOW); await page.keyboard.press('Escape'); await wait(s, 350); check('Escape closes', !(await winOpen(s)), await winOpen(s)) }
    await openRow(s, NOW); await pic(s, '05-open-before-outside')
    const p = await page.evaluate(() => { const w = [...document.querySelectorAll('.floatwin, .airpop-box')].find(e => e.getBoundingClientRect().width > 40)?.getBoundingClientRect(); return w ? { l: w.left, t: w.top, r: w.right, b: w.bottom, W: innerWidth, H: innerHeight } : null })
    note('window box', JSON.stringify(p))
    const px = s.desk ? 950 : 6, py = s.desk ? 28 : Math.min(p ? p.b + 8 : 860, 868)
    const on = await page.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return t ? `${t.tagName}.${String(t.className).slice(0, 30)}` : null }, [px, py]); note('what a press outside lands on', on)
    await tapAt(s, px, py); await pic(s, '06-after-outside'); note('after a press outside: window open', await winOpen(s))
    if (await winOpen(s)) await press(s, '#inpEditCancel', 'cancel3')
  })
  await step('close over typed words: the question, Keep editing, then discard', async () => {
    await openRow(s, NOW); await page.locator('#inpEditRmk').filter({ visible: true }).first().fill(NOW + ' X'); await wait(s, 200)
    const x = page.locator('.win-x, #inpEditClose').filter({ visible: true }).first()
    await press(s, x, 'cross-typed'); await wait(s, 350); await pic(s, '07-question')
    const keep = page.locator('button', { hasText: /^Keep editing$/ }).filter({ visible: true }).first()
    check('the cross over typed words asks first', (await keep.count()) > 0, await keep.count())
    if (await keep.count()) { await press(s, keep, 'keep'); await wait(s, 250); check('Keep editing keeps the words', (await rmk(s)) === NOW + ' X', await rmk(s)) }
    await press(s, x, 'cross-typed2'); await wait(s, 300); const go2 = page.locator('button', { hasText: /^Discard and close$/ }).filter({ visible: true }).first()
    if (await go2.count()) { await press(s, go2, 'discard'); await wait(s, 400) }
    check('Discard closes the window', !(await winOpen(s)), await winOpen(s))
    await listAll(s); const t = await rowsText(s); check('the discarded words were not saved', t.some(x => x.includes(NOW)) && !t.some(x => x.includes(NOW + ' X')), true)
  })
  await step('the Inputs filter', async () => {
    await listAll(s); const all = (await rowsText(s)).length
    if (!(await page.locator('#inFSearch').filter({ visible: true }).count())) await press(s, '#inFiltersBtn', 'filter'); await wait(s, 300); await pic(s, '08-filter-open')
    await page.locator('#inFSearch').filter({ visible: true }).first().fill('RC plain'); await wait(s, 500)
    const f = await rowsText(s); await pic(s, '09-filtered'); check('the search narrows the list to the input', f.length === 1 && f[0].includes(NOW), { all, shown: f.length })
    await page.locator('#inFSearch').filter({ visible: true }).first().fill(''); await wait(s, 400); check('emptying it brings the list back', (await rowsText(s)).length === all, (await rowsText(s)).length)
    if (!s.desk && (await page.locator('#inFiltersBtn[aria-expanded="true"]').count())) await press(s, '#inFiltersBtn')
  })
  if (s.desk) {
    await step('the squadron list on a desktop: every way of closing it, picks both ways', async () => {
      const btn = page.locator('#sqnMenuBtn').filter({ visible: true }).first()
      await btn.click(); await wait(s, 300); check('a press opens the list', await listOpen(s), true); await pic(s, '10-list-open')
      await btn.click(); await wait(s, 300); check('a second press on the mark closes it', !(await listOpen(s)), await listOpen(s))
      await btn.click(); await wait(s, 300); await page.keyboard.press('Escape'); await wait(s, 300); check('Escape closes it', !(await listOpen(s)), await listOpen(s))
      const fo = await page.evaluate(() => { const a = document.activeElement, b = document.querySelector('#sqnMenuBtn'); return { onMark: a === b || !!b?.contains(a) || !!a?.contains(b), tag: a?.tagName, id: a?.id, cls: String(a?.className).slice(0, 40), label: a?.getAttribute('aria-label'), text: a?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 30) } })
      check('focus goes back to the mark after Escape', fo.onMark, fo)
      await btn.focus(); await page.keyboard.press('Enter'); await wait(s, 300); const f1 = (await state(s)).focus; check('Enter opens it with a row in focus', (await listOpen(s)) && /button/.test(f1 || ''), f1)
      const way = []; for (let i = 0; i < 5 && (await listOpen(s)); i++) { await page.keyboard.press('Tab'); await wait(s, 220); way.push((await state(s)).focus) }
      check('Tab out closes it', !(await listOpen(s)), { presses: way.length, way }); await pic(s, '11-after-tab')
      await btn.click(); await wait(s, 300); await page.mouse.click(950, 28); await wait(s, 300); check('a press outside closes it', !(await listOpen(s)), await listOpen(s))
      await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click(); await wait(s, 300); await page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: /^149$/ }) }).first().click(); await wait(s, 800)
      check('a pick goes to 149', ((await state(s)).barMark || '').startsWith('149'), (await state(s)).barMark); await pic(s, '12-on-149')
      await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click(); await wait(s, 300); await page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: /^142$/ }) }).first().click(); await wait(s, 800)
      check('a pick goes back to 142', ((await state(s)).barMark || '').startsWith('142'), (await state(s)).barMark); await pic(s, '13-on-142')
    })
  } else {
    await step('the ☰ list on a phone: open, close, picks both ways', async () => {
      await press(s, '#burger', 'b1'); await wait(s, 250); await press(s, '#drawerSqnBtn', 'b2'); await wait(s, 300); await pic(s, '10-phone-list')
      check('the ☰ list opens', !!(await state(s)).dList?.length, (await state(s)).dList)
      await press(s, '#drawerSqnBtn', 'b3'); await wait(s, 300); const c = await state(s); check('a second tap on the mark closes the list', !c.dList, c.dList)
      await shut(s); await wait(s, 300); check('a tap outside closes the menu', !(await state(s)).drawerOpen, (await state(s)).drawerOpen)
      await pickSq(s, '149', 'p149'); await shut(s); await wait(s, 500); check('a pick goes to 149', /149/.test((await state(s)).dMark || ''), (await state(s)).dMark); await pic(s, '12-phone-149')
      await pickSq(s, '142', 'p142'); await shut(s); await wait(s, 500); check('a pick goes back to 142', /142/.test((await state(s)).dMark || ''), (await state(s)).dMark); await pic(s, '13-phone-142')
    })
  }
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
