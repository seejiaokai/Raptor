import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, closeWin, pubDay, credits, savePart } from './aa-B-lib.mjs'
import { addGroundRow, slotByRmk, putMain } from './aa-B-rows.mjs'
const M = 'shaft'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's44'
const { page } = w
await openBoard(page, 5)
async function mk(rmk, s, e) {
  await addGroundRow(page, 5, rmk, s, e, rmk)
  const sl = await slotByRmk(page, rmk)
  const r = await putMain(page, sl, 'allavail'); say(rmk, `(${s || '-'}→${e || '-'})`, 'placeholder put:', r)
  return sl
}
async function look(rmk, label) {
  const info = await page.evaluate(r => {
    const t = [...document.querySelectorAll('#schedBoard textarea[data-bfld$=".rmks"]')].find(x => x.value === r)
    const row = t && t.closest('.sb-arow')
    if (!row) return null
    const c = row.querySelector('.oilcount')
    return { chip: c ? c.innerText + ' | ' + c.title : 'no chip', puck: !!row.querySelector('.puck.allavail') }
  }, rmk)
  say(label, 'row chip:', JSON.stringify(info))
  const c = page.locator(`#schedBoard .sb-arow:has(textarea[data-bfld$=".rmks"]) .oilcount`).filter({ has: page.locator('xpath=.') })
  // open the chip of THIS row
  await page.evaluate(r => { document.querySelectorAll('[data-aa-row]').forEach(e => e.removeAttribute('data-aa-row')); const t = [...document.querySelectorAll('#schedBoard textarea[data-bfld$=".rmks"]')].find(x => x.value === r); const row = t && t.closest('.sb-arow'); if (row) row.setAttribute('data-aa-row', '1') }, rmk)
  const chip = page.locator('[data-aa-row] .oilcount').first()
  let res = { info }
  if (await chip.count()) {
    await chip.click(); await sleep(600)
    const a = await page.evaluate(() => { const w = document.querySelector('.availwin'); return w ? { tabs: [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ')), one: (w.querySelector('.win-one') || {}).innerText, tail: w.innerText.replace(/\s+/g, ' ').slice(-260), head: w.innerText.replace(/\s+/g, ' ').slice(0, 120) } : null })
    say(label, 'window:', JSON.stringify(a)); res.win = a
    await pic(w, label.replace(/\W+/g, '-'))
    await page.locator('.availwin .win-x').click().catch(() => {}); await sleep(300)
  }
  return res
}
// plain (OIL Earn off)
await mk('S44start', '18:30', null); out.startOnly = await look('S44start', 'start only, OIL off')
await mk('S44none', null, '19:30'); out.noStart = await look('S44none', 'no start (end only), OIL off')
await mk('S44eq', '18:30', '18:30'); out.equal = await look('S44eq', 'start = end, OIL off')
await oilOn(page, true)
out.startOil = await look('S44start', 'start only, OIL Earn on'); out.noStartOil = await look('S44none', 'no start, OIL Earn on'); out.eqOil = await look('S44eq', 'equal, OIL Earn on')
await pic(w, 'oil-rows')
// the Logic setting
await oilOn(page, false)
await go(page, 'logic'); await sleep(500)
await page.getByRole('button', { name: /Edit rules/ }).click(); await sleep(500)
const inp = page.locator('[data-lgset="openEnd"]').first(); await inp.scrollIntoViewIfNeeded()
say('logic edit input visible:', await inp.count())
if (await inp.count()) { await inp.fill('3h'); await inp.press('Enter'); await inp.blur(); await sleep(700) }
say('logic value now', await page.locator('[data-lgset="openEnd"]').first().inputValue(), '| sentence:', (await page.locator('.lgrule', { hasText: 'assumed to run' }).first().innerText()).slice(0, 80))
await pic(w, 'logic')
await openBoard(page, 5)
out.startAfterLogic = await look('S44start', 'start only after Assumed length changed to 3h')
// issue the day with these rows
say('publish', JSON.stringify(await pubDay(page, 5)))
out.c0 = await credits(page, [M, 'glass']); say('credits (crowd of the unusable rows)', JSON.stringify(out.c0))
out.errors = w.errors
await w.browser.close()
savePart('s44-run', { out, log })
