import { world, fileInput, pic, sleep, go, openBoard, oilOn } from './aa-B-lib.mjs'
import { groundIdx } from './aa-B-rows.mjs'
import { openInputs } from './lib.mjs'
for (const kind of ['CX', 'INFO', 'TAKEOFF']) {
  const w = await world('desk'); w.tag = 'p17' + kind
  const { page } = w
  const f = await fileInput(page, { iso: '2026-07-18', kind: 'Event', person: 'allavail', rmk: 'P17' + kind, s: '09:00', e: '12:00', oil: 'yes' })
  await openBoard(page, 5)
  const n = (await groundIdx(page, 'P17' + kind)).replace('g:', '')
  if (kind === 'CX') { await page.locator(`#schedBoard [data-grcx="${n}"]`).first().click(); await sleep(400); await page.locator('#cxPop').getByRole('button', { name: /Cancel line/ }).click() }
  else if (kind === 'INFO') await page.locator(`#schedBoard [data-grinfo="${n}"]`).first().click()
  else { await openInputs(page, 5); await page.locator(`#schedBoard [data-acc="x"][data-acck="${f.rec.iid}"]`).first().click() }
  await sleep(700)
  await oilOn(page, true)
  const info = await page.evaluate(r => {
    const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r))
    if (!row) return 'row gone from the programme'
    return { cls: row.className, text: row.innerText.replace(/\s+/g, ' '), titles: [...row.querySelectorAll('[title]')].map(e => e.className.slice(0, 30) + '=>' + e.title.slice(0, 160)), oilEls: [...row.querySelectorAll('[data-oilitem],[data-oilp],.oilcount')].map(e => e.className + '|' + e.title.slice(0, 120)) }
  }, 'P17' + kind)
  console.log(kind, JSON.stringify(info).slice(0, 1400))
  const cnt = page.locator('#schedBoard .oilcount')
  console.log(kind, 'count chips', await cnt.count())
  await pic(w, 'row')
  await w.browser.close()
}
