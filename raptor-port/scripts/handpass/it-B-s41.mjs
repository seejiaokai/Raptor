// Scenario 41 - Taken off before publication. usage: node it-B-s41.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const FOC = 'sports day|games afternoon|^event$'
for (const variant of ['A', 'B']) {
  const W = await L.mk(size)
  const p = W.page
  L.setWeek(null)
  const ranger = await L.csId(p, 'Ranger')
  const tag = `s41-${size}-${variant}`
  await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
  const r = await L.recBy(p, { person: ranger, type: 'Event' })
  // take it off the day (board Personal Inputs)
  await L.openBoard(W, DI)
  if (await p.locator('#schedBoard [data-pitog]').count()) { await p.locator('#schedBoard [data-pitog]').first().click(); await L.sleep(500) }
  const x = p.locator(`#schedBoard [data-acc="x"][data-acck="${r.iid}"]`).first()
  const hadX = await x.count()
  if (hadX) { await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await (W.mobile ? x.tap() : x.click()); await L.sleep(900) }
  await L.closeBoard(p)
  await L.pubDay(W, DI)
  const inputsName = async () => {
    await L.go(p, 'inputs'); await L.month(p, 2026, 7)
    if (await p.locator(L.DAYWIN).count()) { await p.keyboard.press('Escape'); await L.sleep(200) }
    const cell = p.locator(`#inpCal [data-icday="${ISO}"]`)
    if (W.mobile) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
    await L.sleep(400)
    const t = await p.evaluate(iid => { const c = document.querySelector(`[data-testid="idy-row-${iid}"] .idy-kind`); return c ? c.textContent.trim() : null }, r.iid)
    await L.shot(p, tag + '-inputs-' + (Date.now() % 100000))
    await L.closeWins(p)
    return t
  }
  const rd = async t => { const S = await L.snap(W, DI, { focus: FOC, pic: t }); const rec = await L.rec(p, r.iid); const nmI = await inputsName(); return { s: { S, rec, nmI }, text: L.brief(S) + ` | saved title ${JSON.stringify(rec && rec.title)} | Inputs day card names it ${JSON.stringify(nmI)}`, pics: [t + '-edit.png', t + '-view.png'] } }
  const base = await rd(tag + '-0published-off')
  const noRow = S => !S.f.rows.some(x => /sports day|games afternoon|^event$/i.test(x.name)) && !S.v.rows.some(x => /sports day|games afternoon|^event$/i.test(x.name))
  const baseOk = hadX && noRow(base.s.S) && !base.s.S.f.pend.length && !base.s.S.f.nys && base.s.nmI === 'Sports day'
  await L.retitle(W, r.iid, ISO, 'Games afternoon')
  const chg = await rd(tag + '-1retitled-dormant')
  const applied = ({ S, rec, nmI }) => rec.title === 'Games afternoon' && nmI === 'Games afternoon' && noRow(S) && !S.f.pend.length && !S.f.nys
  const reverted = ({ S, rec, nmI }) => rec.title === 'Sports day' && nmI === 'Sports day' && noRow(S) && !S.f.pend.length && !S.f.nys
  L.row('41', size, 'admin', baseOk && applied(chg.s) ? 'PASS' : 'FAIL', `[${variant}] taken off (button present: ${!!hadX}) then published: ${base.text} || dormant request retitled: ${chg.text}`, [...base.pics, ...chg.pics])
  console.log('baseOk', baseOk, 'applied', applied(chg.s))
  await L.checkpoint(W, variant, { n: '41', tag, read: rd, applied, reverted })
  if (variant === 'A') {
    // accept it afterwards
    await L.openBoard(W, DI)
    if (!(await p.locator('#schedBoard .accb').count()) && await p.locator('#schedBoard [data-pitog]').count()) { await p.locator('#schedBoard [data-pitog]').first().click(); await L.sleep(500) }
    const a = p.locator(`#schedBoard [data-acc="g"][data-acck="${r.iid}"]`).first()
    const hadA = await a.count()
    if (hadA) { await a.evaluate(e => e.scrollIntoView({ block: 'center' })); await (W.mobile ? a.tap() : a.click()); await L.sleep(900) }
    await L.closeBoard(p)
    const acc = await rd(tag + '-2accepted')
    const ok = hadA && acc.s.S.f.pend.length === 1 && /not yet signed/i.test(acc.s.S.f.nys) && acc.s.S.f.rows.some(x => x.name === 'GAMES AFTERNOON' && x.kind === 'EVENT') && !acc.s.S.v.rows.some(x => /games/i.test(x.name)) && /Games afternoon/.test(acc.s.S.togo || '')
    L.row('41', size, 'admin', ok ? 'PASS' : 'FAIL', `[A] accepted afterwards (button present: ${!!hadA}): ${acc.text}`, acc.pics)
  }
  await W.browser.close()
}
L.saveRows('s41-' + size)
console.log('ERRORS', L.ERRS)
