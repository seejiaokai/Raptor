// S15 - a holiday is declared after filing, then revoked (desktop, admin filer; the member's bell checked in place)
const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, fileInput, declarePH, removePH, pubSat, closeBoard, editWeek, face, fs, cr, crS, undoRedo, reload, signDay, pidOf, answerOil, closeWins } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const WED = '2026-07-15', RMK = 'S15 duty'
const bellDot = page => page.evaluate(() => { const b = document.querySelector('button.bellbtn'); return { on: b ? b.classList.contains('on') : null, cls: b ? b.className : null } })
const oilOf = page => page.evaluate(r => { const x = window.INPUTS.find(i => i.remarks === r); return x && x.oil }, RMK)
async function bellTask(page, ans) {
  await page.locator('button.bellbtn:visible').first().click(); await sleep(700)
  const q = await page.locator('[data-testid="oilconf"]').count()
  await shot(page, 'S15-bell-' + Date.now() % 100000)
  if (q && ans) { await page.locator(`[data-testid="oil-${ans}"]`).click(); await page.locator('[data-testid="oilconf-save"]').click(); await sleep(600) }
  await closeWins(page)
  return { question: !!q }
}
// ---- A: filed on a weekday, issued as a zero-credit Original, THEN holiday declared
{
  console.log('=== A: weekday Duty, Original issued (zero), PH declared, answer Yes, issue; PH removed, amend')
  const w = await world(); const { page } = w
  const saber = await pidOf(page, 'Saber'), ranger = await pidOf(page, 'Ranger')
  await fileInput(page, { iso: WED, kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK })
  say('A1 rec oil', await oilOf(page)); say('A1 bell', await bellDot(page))
  await go(page, 'editsched'); await pubSat(page, 2); await closeBoard(page)
  say('A2 Original issued', fs(await face(page, 2))); say('A2 credits (zero: ordinary weekday)', crS(await cr(page, WED)))
  await go(page, 'editsched'); await editWeek(page); await signDay(page, 2, 3)
  say('A3 declare PH', await declarePH(page, WED))
  await go(page, 'editsched'); await sleep(500)
  say('A3 face after PH', fs(await face(page, 2))); say('A3 credits (published weekday still zero)', crS(await cr(page, WED)))
  say('A3 bell as the filer (Saber)', await bellDot(page))
  // the member Ranger's bell: change identity in place
  await page.evaluate(([r]) => { window.raptorRole('member'); window.raptorMe(r) }, [ranger]); await sleep(600)
  say('A3 bell as member Ranger (no task expected)', await bellDot(page)); await shot(page, 'S15-A1-member-bell')
  await page.evaluate(([s]) => { window.raptorMe(s); window.raptorRole('admin') }, [saber]); await sleep(600)
  say('A3 bell back as Saber', await bellDot(page))
  say('A4 bell task tapped, answer Yes', await bellTask(page, 'yes')); say('A4 rec oil', await oilOf(page))
  await go(page, 'editsched'); await sleep(400)
  say('A4 face', fs(await face(page, 2))); say('A4 credits before issue (zero)', crS(await cr(page, WED)))
  await go(page, 'editsched'); say('A5 issue AL1', await pubSat(page, 2)); await closeBoard(page)
  say('A5 face', fs(await face(page, 2))); say('A5 credits (HO each expected)', crS(await cr(page, WED)))
  await shot(page, 'S15-A2-al1-credits')
  // revoke the PH
  say('A6 remove PH', await removePH(page, '15 Jul'))
  await go(page, 'editsched'); await sleep(500)
  say('A6 face (explanation expected)', fs(await face(page, 2))); say('A6 credits (retained: HO)', crS(await cr(page, WED)))
  await shot(page, 'S15-A3-after-ph-removed')
  say('A6 undo', await undoRedo(page, 'undo')); say('A6 after undo', fs(await face(page, 2))); say('A6 credits', crS(await cr(page, WED)))
  say('A6 redo', await undoRedo(page, 'redo')); say('A6 after redo', fs(await face(page, 2)))
  await reload(page); await go(page, 'editsched'); await sleep(300)
  say('A6 after reload', fs(await face(page, 2))); say('A6 credits', crS(await cr(page, WED)))
  await go(page, 'editsched'); say('A7 issue AL2', await pubSat(page, 2)); await closeBoard(page)
  say('A7 face', fs(await face(page, 2))); say('A7 credits (zero expected)', crS(await cr(page, WED)))
  await shot(page, 'S15-A4-al2-credits')
  say('errors A', w.errors); await w.browser.close()
}
// ---- B: holiday declared BEFORE publication
{
  console.log('=== B: PH declared before the first publication')
  const w = await world(); const { page } = w
  await fileInput(page, { iso: WED, kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK })
  say('B1 declare PH', await declarePH(page, WED))
  await go(page, 'editsched'); say('B1 bell', await bellDot(page))
  say('B2 bell task tapped, answer Yes', await bellTask(page, 'yes')); say('B2 rec oil', await oilOf(page))
  await go(page, 'editsched'); await pubSat(page, 2); await closeBoard(page)
  say('B3 Original issued', fs(await face(page, 2))); say('B3 credits (HO expected)', crS(await cr(page, WED)))
  await shot(page, 'S15-B1-credits')
  say('B4 remove PH', await removePH(page, '15 Jul'))
  await go(page, 'editsched'); await sleep(400)
  say('B4 face', fs(await face(page, 2))); say('B4 credits (retained)', crS(await cr(page, WED)))
  await go(page, 'editsched'); say('B5 issue AL1', await pubSat(page, 2)); await closeBoard(page)
  say('B5 credits (zero expected)', crS(await cr(page, WED)))
  say('errors B', w.errors); await w.browser.close()
}
