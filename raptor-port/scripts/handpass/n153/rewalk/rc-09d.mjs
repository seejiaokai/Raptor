// rc-09d - the lead from rc-09c: a window of 142 with typed words, "Open Blade's input and lose them?" up, a pick of 149, then "Discard and open".
// Blade's input (142's) comes up LIVE over 149. What do its Save and its Delete write, and where? Read back through each squadron's own Inputs list.
import { signIn, mk, closeAll, finish, step, pic, picsFor, press, go, state, note, check, pickSq, shut } from './rlib.mjs'
const RUN = process.env.RUN || '1'
const tag = `rc09d-d-${RUN}`
console.log('rc-09d v1', RUN, process.env.MQ_PORT)
picsFor(tag)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const tid = t => `[data-testid="${t}"]`
const rowLoc = (s, n) => s.page.locator('#sqnMenu .sqm-row', { has: s.page.locator('.sqm-num', { hasText: new RegExp(`^${n}$`) }) }).first()
const listAll = async s => {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 600)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await wait(s, 350)
  if (await page.locator('#inRangePop').filter({ visible: true }).count()) { await press(s, '#inRangeBtn'); await wait(s, 200) }
}
const rows = s => s.page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(r => r.innerText.replace(/\s+/g, ' ').trim()))
const form = s => s.page.evaluate(() => {
  const r = [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0)
  if (!r) return null
  const w = r.closest('.floatwin') || r.closest('.airpop')
  return { head: w?.innerText.split('\n')[0]?.trim(), rmk: r.value, band: w?.querySelector('.moveband')?.textContent.replace(/\s+/g, ' ').trim() ?? null, inert: !!w?.querySelector('.inped-body')?.hasAttribute('inert') }
})
const toast = s => s.page.evaluate(() => [...document.querySelectorAll('.toast, [role=status]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 3))
/* Drifter's window on 142, words typed, Blade asked for, 149 picked, "Discard and open" */
async function crossed(s) {
  const { page } = s
  await listAll(s)
  await page.locator('#inBody tr[data-iid]', { hasText: 'Drifter' }).filter({ visible: true }).first().locator(tid('in-open')).first().click(); await wait(s, 600)
  await page.locator('#inpEditRmk').filter({ visible: true }).first().fill('RC first words'); await wait(s, 150)
  const other = page.locator('#inBody tr[data-iid]', { hasText: 'Blade' }).filter({ visible: true }).first()
  await other.scrollIntoViewIfNeeded(); await other.locator(tid('in-open')).first().click(); await wait(s, 450)
  await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click(); await wait(s, 320)
  const b = await rowLoc(s, '149').boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 900)
  const held = await form(s); note('after the pick', JSON.stringify(held), (await state(s)).barMark)
  await page.locator(tid('inped-swap-go')).filter({ visible: true }).first().click(); await wait(s, 800)
  return { held, live: await form(s), bar: (await state(s)).barMark }
}
try {
  {
    const s = await mk('d'); const { page } = s
    await signIn(s, 'ad', 'a')
    await step('S: Save from the crossed window', async () => {
      await listAll(s); const a142 = await rows(s); await pickSq(s, '149'); await wait(s, 500); await listAll(s); const a149 = await rows(s); await pickSq(s, '142'); await wait(s, 500)
      note('rows before', a142.length, a149.length)
      const c = await crossed(s); note('crossed', JSON.stringify(c)); await pic(s, 's-1-crossed-live')
      check('S the window that opens over 149 is held, not live', !!c.live?.band || !!c.live?.inert, c.live)
      if (c.live && !c.live.inert) {
        await page.locator('#inpEditRmk').filter({ visible: true }).first().fill('RC crossed save'); await wait(s, 150); await pic(s, 's-2-typed')
        await press(s, '#inpEditSave'); await wait(s, 800); const t = await toast(s); note('after Save: form', JSON.stringify(await form(s)), 'toast', JSON.stringify(t)); await pic(s, 's-3-after-save')
        await listAll(s); const n149 = await rows(s); const on149 = n149.filter(x => x.includes('RC crossed save')); await pic(s, 's-4-149-list')
        await pickSq(s, '142'); await wait(s, 600); await listAll(s); const n142 = await rows(s); const on142 = n142.filter(x => x.includes('RC crossed save')); await pic(s, 's-5-142-list')
        note('149 rows', a149.length, '->', n149.length, JSON.stringify(on149)); note('142 rows', a142.length, '->', n142.length, JSON.stringify(on142))
        check('S nothing written on 149', n149.length === a149.length && on149.length === 0, { before: a149.length, after: n149.length, on149 })
        check('S the Save while 149 is in view did not change 142\'s input', on142.length === 0, on142)
      }
    })
    await s.ctx.close()
  }
  {
    const s = await mk('d'); const { page } = s
    await signIn(s, 'ad', 'a')
    await step('D: Delete from the crossed window', async () => {
      await listAll(s); const a142 = await rows(s)
      const c = await crossed(s); note('crossed', JSON.stringify(c))
      if (c.live && !c.live.inert) {
        const del = page.locator('.airpop, .floatwin').locator('button', { hasText: /^Delete$/ }).filter({ visible: true }).first()
        await del.click(); await wait(s, 450); await pic(s, 'd-1-delete-asked')
        const yes = page.locator('button', { hasText: /^(Delete|Delete it|Yes, delete|Delete input)$/ }).filter({ visible: true })
        note('delete buttons', await yes.count(), JSON.stringify(await yes.allTextContents()))
        if (await yes.count() > 0) { await yes.last().click(); await wait(s, 800) }
        const t = await toast(s); note('after Delete: form', JSON.stringify(await form(s)), 'toast', JSON.stringify(t)); await pic(s, 'd-2-after-delete')
        await pickSq(s, '142'); await wait(s, 600); await listAll(s); const n142 = await rows(s); await pic(s, 'd-3-142-list')
        const gone = a142.filter(x => !n142.includes(x)); note('142 rows', a142.length, '->', n142.length, 'gone', JSON.stringify(gone))
        check('D a Delete while 149 is in view removes nothing of 142', n142.length === a142.length, { before: a142.length, after: n142.length, gone })
      }
    })
    await s.ctx.close()
  }
} finally { finish(tag); await closeAll() }
