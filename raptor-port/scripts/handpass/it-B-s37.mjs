// Scenario 37 - Shared title after publication (member files, admin publishes, member retitles). usage: node it-B-s37.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const FOC = 'team session|team review'
for (const variant of ['A', 'B']) {
  const W = await L.mk(size, { who: 'us', pass: 'us' })
  const p = W.page
  L.setWeek(null)
  const tag = `s37-${size}-${variant}`
  // 1. the member files a shared Event (Ranger himself + Saber + Basher)
  await L.openNew(W, ISO)
  await p.selectOption('#inpEditType', 'Event')
  const picked = await L.severalPick(W, ['Saber', 'Basher'])
  await p.fill('#inpEditStart', '09:00').catch(() => {}); await p.fill('#inpEditEnd', '10:00').catch(() => {})
  await p.fill('#inpEditTitle', 'Team session')
  await L.shot(p, tag + '-1member-window')
  const head0 = await L.saveWin(W); await L.closeWins(p)
  const before = await L.recsBy(p, 'Team session', 'Event')
  console.log('picked', picked, 'filed', JSON.stringify(before), 'oil q', head0)
  // 2. the admin publishes the day
  await L.switchUser(W, 'ad', 'a')
  const pub = await L.pubDay(W, DI)
  console.log('pub', JSON.stringify(pub.r))
  const rd = async t => { const S = await L.snap(W, DI, { focus: FOC, pic: t }); const recs = await p.evaluate(() => window.INPUTS.filter(x => /^team (session|review)$/i.test(x.title || '')).map(x => x.person + ':' + x.title)); return { s: { S, recs }, text: L.brief(S) + ` | records ${recs.join(',')}`, pics: [t + '-edit.png', t + '-togo.png', t + '-view.png'] } }
  const base = await rd(tag + '-2published')
  // 3. the member changes only the title
  await L.switchUser(W, 'us', 'us')
  await L.retitleText(W, ISO, /Team session/, 'Team review')
  const after = await p.evaluate(() => window.INPUTS.filter(x => x.type === 'Event' && x.date === 'Jul 15').map(x => x.person + ':' + x.title))
  console.log('after retitle (member view of records):', after.join(','))
  const allNew = after.length === before.length && after.every(s => /:Team review$/.test(s))
  let okMember = allNew
  if (variant === 'A') {
    // member checkpoint: Undo -> Redo -> reload, read the records
    const readRecs = () => p.evaluate(() => window.INPUTS.filter(x => x.type === 'Event' && x.date === 'Jul 15').map(x => x.person + ':' + x.title).join(','))
    const ub = p.locator('#undoBtn:visible').first()
    await ub.click(); await L.sleep(800); const u = await readRecs()
    await p.locator('#redoBtn:visible').first().click(); await L.sleep(800); const r = await readRecs()
    await L.reload(W); const rl = await readRecs()
    const ok = /Team session/.test(u) && !/Team review/.test(u) && !/Team session/.test(r) && !/Team session/.test(rl) && /Team review/.test(rl)
    L.row('37', size, 'member', ok ? 'PASS' : 'FAIL', `[A] member's own checkpoint — after Undo: ${u} | after Redo: ${r} | after reload: ${rl}`, [])
  } else {
    await p.locator('#undoBtn:visible').first().click(); await L.sleep(800)
    await L.reload(W)
    const rl = await p.evaluate(() => window.INPUTS.filter(x => x.type === 'Event' && x.date === 'Jul 15').map(x => x.person + ':' + x.title).join(','))
    L.row('37', size, 'member', /Team session/.test(rl) && !/Team review/.test(rl) ? 'PASS' : 'FAIL', `[B] member Undo then reload — records: ${rl}`, [])
  }
  // 4. the admin reads the day
  await L.switchUser(W, 'ad', 'a')
  const chg = await rd(tag + '-3retitled')
  const S = chg.s.S
  const expectPending = variant === 'A'
  const okAdmin = expectPending
    ? (S.f.pend.length >= 1 && /not yet signed/i.test(S.f.nys) && chg.s.recs.length === before.length && chg.s.recs.every(x => /Team review$/.test(x)) && !S.v.rows.some(x => /review/i.test(x.name)) && /Team review/.test(S.togo || '') && /Team session/.test(S.togo || ''))
    : (!S.f.pend.length && !S.f.nys && chg.s.recs.every(x => /Team session$/.test(x)))
  L.row('37', size, 'admin', okAdmin ? 'PASS' : 'FAIL', `[${variant}] shared Event of ${before.length} people (${picked}) filed by the member, published by the admin; base: ${base.text}; after the member's retitle: ${chg.text}`, [tag + '-1member-window.png', ...chg.pics])
  const togoText = (S.togo || '').replace(/^.*?Waiting/, 'Waiting')
  const grouped = variant === 'A' ? (/·s*1 change/.test(togoText) && /Ranger/.test(togoText) && /Saber/.test(togoText) && /Basher/.test(togoText)) : true
  L.row('37', size, 'admin', grouped ? 'PASS' : 'FAIL', `[${variant}] To go out for the shared retitle should be ONE item with its people underneath; the screen said: pending chip "${S.f.pend.join(',') || '0'}"; changes window: ${togoText.slice(0, 420)}`, [tag + '-3retitled-togo.png', tag + '-3retitled-edit.png'])
  console.log('allNew', allNew, 'okAdmin', okAdmin, 'grouped', grouped)
  await W.browser.close()
}
L.saveRows('s37-' + size)
console.log('ERRORS', L.ERRS)
