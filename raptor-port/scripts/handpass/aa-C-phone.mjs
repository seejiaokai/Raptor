// Phone pass for the publishing scenarios: S10 (order A) on a 390x844 touch phone, then the editor and the ALL AVAIL window at 390x568
const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, fileInput, pubSat, closeBoard, editWeek, face, fs, cr, crS, signDay, reanswer, oilOf, undoRedo, reload, inputsPage, openDay, openSaved, closeWins, pend } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const SAT = '2026-07-18', RMK = 'PH duty'
const w = await world({ width: 390, height: 844, mobile: true }); const { page } = w
try {
  await fileInput(page, { iso: SAT, kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'yes' })
  say('P1 filed on the phone', await page.evaluate(r => { const x = window.INPUTS.find(i => i.remarks === r); return x && { person: x.person, oil: x.oil } }, RMK))
  say('P1 credits before issue (zero)', crS(await cr(page, SAT)))
  await go(page, 'editsched'); say('P2 issue', await pubSat(page, 5)); await closeBoard(page)
  say('P2 face', fs(await face(page, 5))); say('P2 credits (HO)', crS(await cr(page, SAT)))
  await shot(page, 'PH-01-issued-credits')
  await go(page, 'editsched'); await editWeek(page); await signDay(page, 5, 3)
  await reanswer(page, SAT, RMK, 'no')
  say('P3 oil', await oilOf(page, RMK))
  await go(page, 'editsched'); say('P3 face (pending, signs cleared)', fs(await face(page, 5))); say('P3 credits (HO fixed)', crS(await cr(page, SAT)))
  await shot(page, 'PH-02-after-no')
  say('P4 undo', await undoRedo(page, 'undo')); say('P4 after undo', fs(await face(page, 5)))
  say('P4 redo', await undoRedo(page, 'redo')); say('P4 after redo', fs(await face(page, 5)))
  await reload(page); await go(page, 'editsched'); say('P4 after reload', fs(await face(page, 5)))
  await go(page, 'editsched'); say('P5 AL1', await pubSat(page, 5)); await closeBoard(page)
  say('P5 face', fs(await face(page, 5))); say('P5 credits (zero)', crS(await cr(page, SAT)))
  await shot(page, 'PH-03-al1-credits')
} catch (e) { say('STOPPED', e.message.split('\n')[0]); await shot(page, 'PH-ZZ-stopped') }
say('errors 844', w.errors); await w.browser.close()
// 390x568: the editor window and the ALL AVAIL window
{
  const w2 = await world({ width: 390, height: 568, mobile: true }); const { page: p2 } = w2
  try {
    await inputsPage(p2); await openDay(p2, SAT)
    await p2.locator('#icPopAdd').click(); await sleep(600)
    await p2.selectOption('#inpEditType', 'Duty'); await p2.selectOption('#inpEditPerson', 'allavail'); await sleep(300)
    await shot(p2, 'PH-04-editor-568')
    say('S4 editor 568: save button reachable', await p2.evaluate(() => { const b = document.querySelector('#inpEditSave'); if (!b) return 'no save'; const r = b.getBoundingClientRect(); const at = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { y: Math.round(r.y), bottom: Math.round(r.bottom), vh: innerHeight, hit: at === b || b.contains(at) } }))
    await p2.fill('#inpEditRmk', 'PH 568'); await p2.locator('#inpEditSave').click(); await sleep(500)
    await shot(p2, 'PH-05-oil-question-568')
    await p2.locator('[data-testid="oil-yes"]').click(); await p2.locator('[data-testid="oilconf-save"]').click(); await sleep(500); await closeWins(p2)
    await go(p2, 'editsched'); await sleep(400)
    const cnt = p2.locator('#eWeek .day[data-day="5"] .oilcount:visible').first()
    await cnt.scrollIntoViewIfNeeded(); await cnt.tap(); await sleep(700)
    await shot(p2, 'PH-06-availwin-568')
    say('S4 availwin 568', await p2.evaluate(() => { const w = document.querySelector('.availwin'); if (!w) return 'no window'; const r = w.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), vh: innerHeight, text: w.innerText.replace(/\s+/g, ' ').slice(0, 90) } }))
  } catch (e) { say('STOPPED 568', e.message.split('\n')[0]); await shot(p2, 'PH-ZZ-stopped-568') }
  say('errors 568', w2.errors); await w2.browser.close()
}
