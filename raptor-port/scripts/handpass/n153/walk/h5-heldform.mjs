// h5 - the check lead's look at walker B's F2 against the approved drawing (docs/mock/2026-11-24-msq-new-words/img/
// i1-desk-input-window.png, another person's input): an input of ANOTHER person on 149, words typed, the role chip pressed.
// What does the held window draw, and what does a press on the chip do?
import { signIn, newPage, closeAll, finish, step, pic, picsFor, press, as, grant, go, shut, pickSq, state, note, facts } from './jlib.mjs'
console.log('h5-heldform v1', process.env.MQ_PORT)
picsFor('h5-heldform')
const read = s => s.page.evaluate(() => {
  const shown = e => !!e && e.getBoundingClientRect().width > 0
  const btn = [...document.querySelectorAll('#inpEditCancel, #inpEditSave, #inpEditClose')].find(shown)
  if (!btn) return null
  const fw = btn.closest('.floatwin') || btn.closest('[role=dialog]') || btn.parentElement.parentElement
  const heads = [...fw.querySelectorAll('label, .lbl, .inped-l, h4, h5, div')].filter(e => shown(e) && e.children.length === 0 && /^(PERSON|TYPE|DURATION|DOCUMENT|REMARKS|DATES)$/i.test(e.textContent.trim())).map(e => e.textContent.trim().toUpperCase())
  const rmk = fw.querySelector('#inpEditRmk')
  const b = document.querySelector('#roleBadge').getBoundingClientRect()
  const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
  return { heads, hint: fw.querySelector('.inped-hint')?.textContent.trim() ?? null, band: fw.querySelector('.moveband')?.textContent.replace(/\s+/g, ' ').trim() ?? null, rmk: rmk ? rmk.value : null, overChip: top ? `${top.tagName}.${String(top.className).slice(0, 24)}#${top.id}` : null }
})
try {
  const s = await newPage('d'); const { page } = s
  await signIn(s, 'ad', 'a'); await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched'); await shut(s)
  await as(s, 'ad2', 'a2'); await pickSq(s, '149'); await shut(s)
  await step('another person\'s input, held', async () => {
    await go(s, 'inputs'); await page.waitForTimeout(800)
    if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
    if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
    if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
    await page.waitForTimeout(400)
    const row = page.locator('#inBody tr[data-iid]', { hasText: 'Gannet' }).filter({ visible: true }).first()
    await press(s, row.locator('[data-testid="in-open"]').first()); await page.waitForTimeout(600)
    await page.locator('#inpEditRmk').filter({ visible: true }).first().fill('H5 typed words')
    facts.live = await read(s); note('live', JSON.stringify(facts.live))
    await press(s, '#roleBadge'); await page.waitForTimeout(700)
    facts.held = await read(s); note('held', JSON.stringify(facts.held)); await pic(s, '01-held-other-person')
    const b = await page.evaluate(() => { const r = document.querySelector('#roleBadge').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    await page.mouse.click(b.x, b.y); await page.waitForTimeout(600)
    facts.afterChip = { form: await read(s), badge: (await state(s)).badge }; note('after a press on the chip', JSON.stringify(facts.afterChip))
    await pic(s, '02-after-chip')
  })
  await s.ctx.close()
} finally { finish('h5-heldform'); await closeAll() }
