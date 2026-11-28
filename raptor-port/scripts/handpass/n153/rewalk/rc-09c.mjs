// rc-09c - three close looks at 1536.
//  Q: an Input window with typed words, a press on another row raises "Open X's input and lose them?", then a pick of 149 with that question up:
//     what do its two answers do, and does anything land on the wrong squadron?
//  E: Escape with the list open over an Input window, no typed words and typed words: what closes.
//  L: the Leave War's windows: can the top bar's list be reached at all, and what stands over its button.
import { signIn, mk, closeAll, finish, step, pic, picsFor, press, go, state, note, check } from './rlib.mjs'
const RUN = process.env.RUN || '1'
const tag = `rc09c-d-${RUN}`
console.log('rc-09c v1', RUN, process.env.MQ_PORT)
picsFor(tag)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const tid = t => `[data-testid="${t}"]`
const rowLoc = (s, n) => s.page.locator('#sqnMenu .sqm-row', { has: s.page.locator('.sqm-num', { hasText: new RegExp(`^${n}$`) }) }).first()
const listOpen = s => s.page.evaluate(() => { const m = document.querySelector('#sqnMenu'); return !!m && m.getBoundingClientRect().width > 0 })
const openList = async s => { await s.page.locator('#sqnMenuBtn').filter({ visible: true }).first().click({ timeout: 4000 }); await wait(s, 320) }
const form = s => s.page.evaluate(() => {
  const r = [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0)
  if (!r) return null
  const w = r.closest('.floatwin') || r.closest('.airpop')
  return { title: w?.querySelector('.win-title, .airpop-title, h3')?.textContent.replace(/\s+/g, ' ').trim() ?? null, rmk: r.value, band: w?.querySelector('.moveband')?.textContent.replace(/\s+/g, ' ').trim() ?? null }
})
const asks = s => s.page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && /^(Discard and open|Discard and close|Keep editing)$/.test(b.textContent.trim())).map(b => b.textContent.trim()))
const snap = s => s.page.evaluate(() => { const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + ':' + t.length }; const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = hash(localStorage.getItem(k) || '') } return o })
const diff = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => a[k] !== b[k])
const listAll = async s => {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 600)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await wait(s, 350)
  if (await page.locator('#inRangePop').filter({ visible: true }).count()) { await press(s, '#inRangeBtn'); await wait(s, 200) }
}
const openRow = async (s, name, words) => {
  const row = s.page.locator('#inBody tr[data-iid]', { hasText: name }).filter({ visible: true }).first()
  await row.locator(tid('in-open')).first().click(); await wait(s, 600)
  if (words) { await s.page.locator('#inpEditRmk').filter({ visible: true }).first().fill(words); await wait(s, 150) }
}
try {
  for (const answer of ['Keep editing', 'Discard and open']) {
    const s = await mk('d'); const { page } = s
    await signIn(s, 'ad', 'a')
    await step(`Q: the swap question up across a pick, then "${answer}"`, async () => {
      await listAll(s); await openRow(s, 'Drifter', 'RC question words')
      const other = page.locator('#inBody tr[data-iid]', { hasText: 'Blade' }).filter({ visible: true }).first()
      await other.scrollIntoViewIfNeeded(); await other.locator(tid('in-open')).first().click(); await wait(s, 450)
      const a0 = await asks(s); note(answer, 'question up', JSON.stringify(a0), JSON.stringify(await form(s))); await pic(s, `q-${answer[0]}-1-question`)
      check(`Q(${answer}) the question is up before the pick`, a0.includes('Keep editing'), a0)
      const before = await snap(s)
      await openList(s); const b = await rowLoc(s, '149').boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 900)
      const st = await state(s), f1 = await form(s), a1 = await asks(s); note(answer, 'after the pick', st.barMark, JSON.stringify(f1), JSON.stringify(a1)); await pic(s, `q-${answer[0]}-2-after-pick`)
      const btn = page.locator('button', { hasText: new RegExp(`^${answer}$`) }).filter({ visible: true }).first()
      if (await btn.count()) {
        await btn.click(); await wait(s, 800)
        const st2 = await state(s), f2 = await form(s), wrote = diff(before, await snap(s)); note(answer, 'after the answer', st2.barMark, JSON.stringify(f2), 'stores', JSON.stringify(wrote)); await pic(s, `q-${answer[0]}-3-after-answer`)
        check(`Q(${answer}) nothing saved by the answer`, wrote.length === 0, wrote)
        if (answer === 'Keep editing') check('Q(Keep editing) the typed words are still in the held window', f2?.rmk === 'RC question words', f2)
        else check('Q(Discard and open) no input of 142 opens live on 149', !f2 || !!f2.band || !/Blade/.test(f2.title || ''), { bar: st2.barMark, form: f2 })
      } else note(answer, 'the question left with the pick')
    })
    await s.ctx.close()
  }
  {
    const s = await mk('d'); const { page } = s
    await signIn(s, 'ad', 'a')
    await step('E: Escape with the list open over an Input window', async () => {
      await listAll(s); await openRow(s, 'Drifter')
      await openList(s); await pic(s, 'e-1-list-over-clean-window')
      await page.keyboard.press('Escape'); await wait(s, 420)
      const a = { list: await listOpen(s), form: await form(s), asks: await asks(s) }; note('clean window, one Escape', JSON.stringify(a)); await pic(s, 'e-2-after-one-escape')
      check('E clean window: one Escape closes the list and leaves the window', !a.list && !!a.form, a)
      if (a.list) { await page.keyboard.press('Escape'); await wait(s, 350); note('second Escape', JSON.stringify({ list: await listOpen(s) })) }
      await listAll(s); await openRow(s, 'Drifter', 'RC escape words')
      await openList(s); await page.keyboard.press('Escape'); await wait(s, 420)
      const c = { list: await listOpen(s), form: await form(s), asks: await asks(s) }; note('typed window, one Escape', JSON.stringify(c)); await pic(s, 'e-3-typed-after-one-escape')
      check('E typed window: one Escape closes the list and asks nothing', !c.list && c.asks.length === 0 && c.form?.rmk === 'RC escape words', c)
    })
    await s.ctx.close()
  }
  {
    const s = await mk('d'); const { page } = s
    await signIn(s, 'ad', 'a')
    const over = () => page.evaluate(() => { const b = document.querySelector('#sqnMenuBtn'), r = b.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { onButton: t === b || b.contains(t), top: t ? `${t.tagName}.${String(t.className).slice(0, 40)}` : null } })
    const toDec = async () => {
      await go(s, 'leavewar'); await page.waitForSelector(tid('month-strip'), { timeout: 15000 }); await wait(s, 500)
      const w = page.locator(tid('war-picker')).filter({ visible: true }); if (await w.count() && (await w.first().inputValue()) !== 'y2026') { await page.selectOption(tid('war-picker'), 'y2026'); await wait(s, 500) }
      await page.locator(tid('month-DEC')).filter({ visible: true }).first().click(); await wait(s, 600)
    }
    await step('L: the Leave War windows', async () => {
      await toDec(); await page.locator(tid('open-chip')).filter({ visible: true }).first().click(); await wait(s, 500)
      const o = await over(); note('Open for bidding: over the squadron button', JSON.stringify(o)); await pic(s, 'l-1-open-bidding')
      if (o.onButton) { await openList(s); const r = await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(e => { const b = e.getBoundingClientRect(), t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return e.contains(t) })); check('L the list stands above Open for bidding', r.length >= 2 && r.every(Boolean), r); await pic(s, 'l-2-open-bidding-list'); await page.keyboard.press('Escape'); await wait(s, 350); note('after Escape', JSON.stringify({ list: await listOpen(s), win: await page.locator(tid('open-dates')).filter({ visible: true }).count() })) }
      else note('Open for bidding covers the top bar: the list cannot be opened over it')
      await page.keyboard.press('Escape'); await wait(s, 350)
      if (await page.locator(tid('open-dates')).filter({ visible: true }).count()) { await page.locator(tid('open-dates-close')).filter({ visible: true }).first().click().catch(() => {}); await wait(s, 300) }
      const c = page.locator('[data-testid="cell-bane-2026-12-15"]').first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 250); await c.click(); await wait(s, 600)
      const o2 = await over(); note('a day window: over the squadron button', JSON.stringify(o2), JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.floatwin, .bidsheet, .airpop')].filter(e => e.getBoundingClientRect().width > 40).map(e => e.dataset.testid || e.className.split(' ')[0])))); await pic(s, 'l-3-day-window')
      if (o2.onButton) { await openList(s); const r = await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(e => { const b = e.getBoundingClientRect(), t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return e.contains(t) })); check('L the list stands above the day window', r.length >= 2 && r.every(Boolean), r); await pic(s, 'l-4-day-list'); await page.keyboard.press('Escape'); await wait(s, 350) }
      else note('the day window covers the top bar: the list cannot be opened over it')
    })
    await s.ctx.close()
  }
} finally { finish(tag); await closeAll() }
