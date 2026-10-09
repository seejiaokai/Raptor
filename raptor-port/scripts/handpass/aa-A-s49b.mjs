// S49 follow-up: a man in a shared group who did not file it and is not an admin (Ranger): can he press his own "Change…" and "Take me out"? (desktop then phone)
import { closeWins, world, closeAll, toInputs, openNew, openDay, setTimes, pic, T, oilAnswer, sleep, readInputs, observe, switchUser, setPerson } from './aa-A-lib.mjs'
const dump = async (page, tag) => { const r = await page.evaluate(() => window.INPUTS.filter(x => /walkS49b/.test(x.remarks || '')).map(x => window.PEOPLE[x.person]?.cs + '=' + JSON.stringify(x.oil)).sort()); console.log(tag, r.join(' | ')) }
for (const size of ['d', 'p']) {
  const w = await world({ who: 'ad', size })
  const A = w.page
  await toInputs(A)
  await openNew(A, '2026-07-18')
  await A.selectOption('#inpEditType', 'Event')
  await A.locator('#inpEditPop ' + T('pp-several')).click(); await sleep(400)
  for (const p of ['dj', 'glass', 'spanner', 'bane']) { const b = A.locator(`#inpEditPop [data-pp="${p}"]`).first(); await b.scrollIntoViewIfNeeded(); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click(); await sleep(150) }
  { const a = A.locator('#inpEditAllday'); if (await a.isChecked()) await a.uncheck() }
  await setTimes(A, '09:00', '12:00'); await A.fill('#inpEditRmk', 'walkS49b group')
  await A.locator('#inpEditSave').click(); await sleep(700)
  await oilAnswer(A, 'yes')
  await closeWins(A)
  await switchUser(A, 'us'); await toInputs(A); await setPerson(A, 'all'); await openDay(A, '2026-07-18')
  await A.locator('[data-testid="win-inputsday"] .sd-row').filter({ hasText: 'walkS49b' }).locator('.sd-open').first().click(); await sleep(800)
  const nBtn = await A.locator('#inpEditPop [data-testid^="oil-revise"]').count()
  for (let i = 0; i < nBtn; i++) {
    const b = A.locator('#inpEditPop [data-testid^="oil-revise"]').nth(i)
    await b.scrollIntoViewIfNeeded(); await sleep(250)
    const box = await b.boundingBox()
    const ctx = await b.evaluate(e => e.parentElement.innerText.replace(/s+/g, ' ').slice(0, 160))
    const hit = await A.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + String(e.className).slice(0, 40) + ' ' + (e.closest('[data-testid]')?.dataset.testid || '') : null }, [box.x + box.width / 2, box.y + box.height / 2])
    console.log(size, 'Ranger button', i, 'of', nBtn, '| context:', ctx, '| finger lands on:', hit)
  }
  await pic(A, `s49b-${size}-1-ranger-own-change`)
  const btn = A.locator('#inpEditPop [data-testid="oil-revise-own"]').last()
  await btn.click({ timeout: 5000 }).catch(e => console.log(size, 'press failed:', String(e).slice(0, 100).replace(/s+/g, ' ')))
  await sleep(700)
  const q = await A.locator(T('oilconf')).isVisible().catch(() => false)
  console.log(size, 'Ranger pressed his own Change… -> OIL question:', q)
  if (q) { await A.locator(T('oil-no')).click(); await A.locator(T('oilconf-save')).click(); await sleep(700); await dump(A, size + ' after Ranger answered No:') }
  // take me out button
  const tmo = A.locator('#inpEditPop').getByRole('button', { name: 'Take me out' })
  await tmo.scrollIntoViewIfNeeded().catch(() => {}); const tb = await tmo.boundingBox().catch(() => null)
  if (tb) { const hit2 = await A.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' ' + (e.closest('[data-testid]')?.dataset.testid || '') : null }, [tb.x + tb.width / 2, tb.y + tb.height / 2]); console.log(size, '"Take me out" finger lands on:', hit2) }
  console.log(size, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
