// Scenario 42 - History and the history bubble. usage: node it-B-s42.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const tag = `s42-${size}`
const lines = txt => ({
  added: /Sports day added/.test(txt), t1: /title\s+Sports day\s*→\s*Games afternoon/.test(txt), t2: /title\s+Games afternoon\s*→\s*Event/.test(txt), who: /Saber/.test(txt),
  person: /Ranger/.test(txt), kindShown: /Event/.test(txt),
})
{
  const W = await L.mk(size)
  const p = W.page
  L.setWeek(null)
  const ranger = await L.csId(p, 'Ranger')
  await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
  const r = await L.recBy(p, { person: ranger, type: 'Event' })
  await L.retitle(W, r.iid, ISO, 'Games afternoon')
  await L.retitle(W, r.iid, ISO, '')
  const rec = await L.rec(p, r.iid)
  const hist = await L.allChanges(W, DI)
  await L.shot(p, tag + '-admin-allchanges')
  await L.closeChg(p)
  const l1 = lines(hist)
  const ok1 = l1.added && l1.t1 && l1.t2 && l1.who && l1.person && !rec.title
  L.row('42', size, 'admin', ok1 ? 'PASS' : 'FAIL', `History tab (All changes) after add "Sports day" / retitle "Games afternoon" / clear: ${hist.replace(/^.*?Changes/, 'Changes').slice(0, 520)} | saved title now ${JSON.stringify(rec.title)}`, [tag + '-admin-allchanges.png'])
  // the day's own change bubble (the "3 changes" chip)
  await L.editWeek(p); await L.showDay(p, DI)
  const chip = p.locator(`#eWeek .day[data-day="${DI}"] .dpend.dchg:visible`).first()
  const hadChip = await chip.count()
  let bub = '(no chip)'
  if (hadChip) {
    await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await (W.mobile ? chip.tap() : chip.click()); await L.sleep(600)
    bub = await p.evaluate(() => { const c = [...document.querySelectorAll('.chgwin, .chgpop, .histpop, .dchgpop, [class*=bubble], [class*=pop]')].filter(e => e.offsetWidth && /Games afternoon|Sports day/.test(e.innerText)).sort((a, b) => a.innerText.length - b.innerText.length)[0]; return c ? c.className + ' :: ' + c.innerText.replace(/\s+/g, ' ').slice(0, 600) : '(bubble not found)' })
    await L.shot(p, tag + '-admin-bubble')
  }
  const l2 = lines(bub)
  L.row('42', size, 'admin', hadChip && l2.t1 && l2.t2 ? 'PASS' : 'FAIL', `the day's change bubble (chip "n changes"): ${bub}`, [tag + '-admin-bubble.png'])
  await L.closeChg(p); await L.closeWins(p)
  await L.reload(W)
  const hist2 = await L.allChanges(W, DI)
  await L.shot(p, tag + '-admin-allchanges-reload'); await L.closeChg(p)
  const l3 = lines(hist2)
  L.row('42', size, 'admin', l3.added && l3.t1 && l3.t2 ? 'PASS' : 'FAIL', `after reload, History tab: ${hist2.replace(/^.*?Changes/, 'Changes').slice(0, 450)}`, [tag + '-admin-allchanges-reload.png'])
  await W.browser.close()
}
{
  // the member's own input
  const W = await L.mk(size, { who: 'us', pass: 'us' })
  const p = W.page
  L.setWeek(null)
  const ranger = await L.csId(p, 'Ranger')
  await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'member one' })
  const r = await L.recBy(p, { person: ranger, type: 'Event', title: 'Sports day' })
  await L.retitle(W, r.iid, ISO, 'Games afternoon')
  await L.retitle(W, r.iid, ISO, '')
  const rec = await L.rec(p, r.iid)
  await L.go(p, 'viewsched'); await L.showDay(p, DI, '#vWeek')
  const hasBtn = await p.locator('#histBtn:visible').count()
  const chip = await p.locator(`#vWeek .day[data-day="${DI}"] .dpend.dchg:visible`).count()
  await L.shot(p, tag + '-member-view')
  let txt = '(no Changes window offered)'
  if (hasBtn) { txt = await L.allChanges(W, DI); await L.shot(p, tag + '-member-allchanges'); await L.closeChg(p) }
  else if (chip) {
    const c = p.locator(`#vWeek .day[data-day="${DI}"] .dpend.dchg:visible`).first()
    await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await (W.mobile ? c.tap() : c.click()); await L.sleep(600)
    const tab = p.locator('.chgwin button', { hasText: /All changes/ }).first()
    if (await tab.count()) { await (W.mobile ? tab.tap() : tab.click()); await L.sleep(500) }
    await L.sleep(500)
    txt = await p.evaluate(() => { const e = document.querySelector('.chgwin'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(window not found)' })
    await L.shot(p, tag + '-member-allchanges'); await L.closeChg(p)
  }
  const l = lines(txt.replace(/Saber/g, 'Saber'))
  L.row('42', size, 'member', (hasBtn || chip) ? (/Sports day added/.test(txt) && /Sports day\s*→\s*Games afternoon/.test(txt) && /Games afternoon\s*→\s*Event/.test(txt) ? 'PASS' : 'FAIL') : 'NOT WALKED', `member's own Event (saved title now ${JSON.stringify(rec.title)}): Changes button on View-only Sched: ${hasBtn ? 'yes' : 'no'}; day change chip: ${chip ? 'yes' : 'no'}; window text: ${txt.slice(0, 400)}`, [tag + '-member-view.png', tag + '-member-allchanges.png'])
  await W.browser.close()
}
L.saveRows('s42-' + size)
console.log('ERRORS', L.ERRS)
