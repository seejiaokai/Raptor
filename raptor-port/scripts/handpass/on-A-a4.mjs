import { world, usualSat, groundNow, oilOf, drag, flashing, toast, toastsAll, undoState, measure, liveBell, SAT_DI } from './on-A-lib.mjs'
const onSat = (page, id) => page.evaluate(([di, id]) => (JSON.stringify(window.DAYS[di]).match(new RegExp('"' + id + '"', 'g')) || []).length, [SAT_DI, id])
async function run(mode) {
  const W = await world({ tag: 'A4' + mode, fresh: false })
  const { page, tid, press, shot, errors } = W
  const wk = i => `#eWeek .day:not(.peek) [data-slot="g:${SAT_DI}.${i}"] .puck`
  const bd = i => `#sbBoard [data-slot="g:${SAT_DI}.${i}"] .puck`
  const iid = await usualSat(W, { goToBoard: mode === 'board' })
  let from, to, ranger
  if (mode === 'week') {
    await page.locator('#schedBoard').getByRole('button', { name: /Done/ }).first().click().catch(() => {}); await page.waitForTimeout(600)
    await page.locator('#eWeek .day:not(.peek) .sec-grnd').nth(SAT_DI).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    from = page.locator('#eRoster .rpuck[data-person="rocky"]').first(); to = page.locator(wk(0))
  } else {
    const row = `#sbBoard [data-move="mv:g.${SAT_DI}.0"]`
    await page.locator(row).evaluate(e => { const sec = e.closest('.sb-sec'); sec.scrollIntoView({ block: 'start' }); let sc = sec.parentElement; while (sc && sc.scrollHeight <= sc.clientHeight + 1) sc = sc.parentElement; if (sc) sc.scrollTop -= 260 }); await page.waitForTimeout(250)
    from = page.locator('#sbRoster .rpuck[data-person="rocky"]').first(); to = page.locator(bd(0))
  }
  const before = await groundNow(page), oil0 = await oilOf(page, iid), undo0 = await undoState(page)
  console.log(mode, 'before', JSON.stringify(before), 'Ranger refs on Sat', await onSat(page, 'bane'), 'Hex refs', await onSat(page, 'rocky'))
  console.log(mode, 'roster puck visible', await from.count(), JSON.stringify(await from.boundingBox()))
  await drag(page, from, to)
  console.log(mode, 'Q', await tid('oilconf').count(), await tid('oilconf-lead').innerText().catch(() => 'NO'), '|', await tid('oilconf-cancel').innerText().catch(() => ''), '|', await tid('oilconf-save').innerText().catch(() => ''), 'saveDisabled', await tid('oilconf-save').isDisabled().catch(() => null))
  console.log(mode, 'ground (should be unchanged)', JSON.stringify(await groundNow(page)), 'undoSame', (await undoState(page)) === undo0)
  await shot(`A4-${mode}-1-question`)
  await press(tid('oilconf-cancel')); await page.waitForTimeout(100)
  const sels = mode === 'week' ? [wk(0)] : [bd(0)]
  console.log(mode, 'flash on Ranger puck', JSON.stringify(await flashing(page, sels)))
  await page.waitForTimeout(500)
  console.log(mode, 'bar', await tid('oilbar-text').innerText().catch(() => 'NO'), '|', await tid('oilbar-answer').innerText().catch(() => ''), '|', await tid('oilbar-ok').innerText().catch(() => ''))
  console.log(mode, 'cancelled ground', JSON.stringify(await groundNow(page)), 'Ranger refs', await onSat(page, 'bane'), 'Hex refs', await onSat(page, 'rocky'), 'oil same', (await oilOf(page, iid)) === oil0, 'undoSame', (await undoState(page)) === undo0)
  await shot(`A4-${mode}-2-bar`)
  await press(tid('oilbar-answer')); await page.waitForTimeout(300)
  console.log(mode, 'question again', await tid('oilconf-lead').innerText().catch(() => 'NO'))
  await press(tid('oil-yes')); await press(tid('oilconf-save')); await page.waitForTimeout(600)
  console.log(mode, 'toast', await toast(page))
  console.log(mode, 'answered ground', JSON.stringify(await groundNow(page)), 'Ranger refs on Sat', await onSat(page, 'bane'), 'Hex refs', await onSat(page, 'rocky'), 'oil', await oilOf(page, iid))
  console.log(mode, 'input person', await page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r && JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => /person|who|date|oil|title/.test(k)))) }, iid))
  await shot(`A4-${mode}-3-answered`)
  const ub = await page.locator(mode === 'board' ? '#sbUndo' : '#undoBtn').first(); await ub.click(); await page.waitForTimeout(600)
  console.log(mode, 'after one Undo', JSON.stringify(await groundNow(page)), 'Ranger refs', await onSat(page, 'bane'), 'Hex refs', await onSat(page, 'rocky'), 'oil back', (await oilOf(page, iid)) === oil0)
  console.log(mode, 'errors', JSON.stringify(errors))
  await W.ctx.close()
}
await run('week')
await run('board')
process.exit(0)
