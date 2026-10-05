/* H-03 — a member never meets the question */
import * as C from './stk2-Q-lib.mjs'
import { fileTimed } from './p6-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const pics = []
const log = []
const { browser, p } = await C.world()
const roleStuff = p => p.evaluate(() => ({ ui: document.querySelectorAll('[data-role-ui]').length, choose: document.querySelectorAll('[data-role-choose]').length, side: document.querySelectorAll('[data-role-side]').length, q: document.querySelectorAll('.mission-role-question').length, remarksDoor: document.querySelectorAll('[data-role-remarks]').length, text: /Blue or Red|Choose mission role|Change mission role/.test(document.body.innerText) }))
try {
  await C.tracking(p, true); await C.board(p, 0)
  await C.bset(p, 'ff:0.0.0.msn', 'ACM'); await C.bset(p, 'fr:0.0.0.0', 'DS FOR RU'); await C.side(p, 'later')   // left unanswered
  await C.bset(p, 'ff:0.0.1.msn', 'ACM'); await C.bset(p, 'fr:0.0.1.0', 'DS FROM RU'); await C.side(p, 'red')    // answered Red
  const adminDoor = await C.doorLabel(p, 0, 0)
  await W.boardOff(p)
  await L.go(p, 'editsched')
  const adminIns = await C.insightsRead(p)
  const adminRows = C.mixRows(adminIns), adminTiles = adminIns.tiles.join('/')
  log.push(`admin: Remarks door on the unanswered formation says ${J(adminDoor.label)}; Insights ${adminRows.slice(0, 6).join(',')} … (${adminRows.length} people) [${adminTiles}]`)
  await C.sleep(1200)
  // member
  await p.locator('#logout:visible').first().click(); await C.sleep(800)
  await L.signIn(p, 'm', { goto: false }); await C.sleep(700)
  const nav = await p.evaluate(() => [...document.querySelectorAll('.nav [data-page]')].filter(e => e.offsetParent !== null).map(e => e.getAttribute('data-page')).join(','))
  log.push(`member signed in; visible pages: ${nav}`)
  // file a timed request from Inputs
  await L.go(p, 'inputs'); await C.sleep(500)
  const types = await p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value))
  const type = 'Meeting'
  const iid = await fileTimed(L, p, { person: null, type, iso: '2026-07-13', from: '10:00', to: '11:00', remarks: 'member walk request' })
  pics.push(await C.pic(p, 'h03-inputs'))
  const r1 = await roleStuff(p)
  log.push(`member filed a ${type} request 10:00–11:00 on Mon 13 Jul (id ${J(iid)}); role UI on the Inputs page: ${J(r1)}`)
  // view-only sched
  await L.go(p, 'viewsched'); await C.sleep(600)
  await W.showDay(p, 0, '#vWeek')
  pics.push(await C.pic(p, 'h03-viewsched'))
  const r2 = await roleStuff(p)
  // click and focus the Remarks text of the unanswered formation, type on it
  const rem = p.locator('#vWeek .day[data-day="0"]').getByText('DS FOR RU').first()
  let remInfo = 'not found'
  if (await rem.count()) { await rem.scrollIntoViewIfNeeded(); await rem.click().catch(() => {}); await C.sleep(300); await p.keyboard.type('x'); await C.sleep(300); remInfo = 'clicked and typed; text now ' + J(await p.evaluate(() => window.DAYS[0].waves[0].formations[0].aircraft[0].rmks)) }
  const r2b = await roleStuff(p)
  log.push(`View-only Sched, Monday: role UI before clicking ${J(r2)}; after clicking the Remarks text of the unanswered formation and typing: ${remInfo}; ${J(r2b)}`)
  // Insights from every door the member has — desktop
  const doors = []
  for (const [pg, nm] of [['viewsched', 'View-only Sched'], ['inputs', 'Inputs'], ['leavewar', 'Leave War']]) {
    await L.go(p, pg); await C.sleep(500)
    if (await p.locator('#insightBtn:visible').count()) {
      const o = await C.insightsRead(p); const rows = C.mixRows(o)
      const rs = await roleStuff(p)
      doors.push(`${nm} (desktop #insightBtn): ${rows.slice(0, 6).join(',')} … (${rows.length}) [${o.tiles.join('/')}] same as admin: ${J(rows) === J(adminRows) && o.tiles.join('/') === adminTiles}; role UI ${J(rs)}`)
    } else doors.push(`${nm}: no Insights button`)
  }
  log.push(doors.join(' | '))
  // phone
  await p.setViewportSize({ width: 390, height: 844 }); await C.sleep(500)
  await L.go(p, 'viewsched'); await C.sleep(600)
  pics.push(await C.pic(p, 'h03-phone-view'))
  await p.locator('#viewSchedMore').click(); await C.sleep(300)
  await p.locator('#viewSchedMoreInsights').click(); await p.waitForSelector('#insightBody', { state: 'visible' }); await C.sleep(400)
  const sa = p.locator('[data-insights-all]:visible'); const phoneTwelve = (await C.readInsights(p)); const twelveRows = C.mixRows(phoneTwelve); if (await sa.count()) { await sa.first().click(); await C.sleep(300) }
  const oP = await C.readInsights(p); const rowsP = C.mixRows(oP)
  pics.push(await C.pic(p, 'h03-phone-insights'))
  const rsP = await roleStuff(p)
  await p.locator('#insightClose').click(); await C.sleep(300)
  // drawer door
  await p.locator('#burger').click(); await C.sleep(400)
  const drawerIns = await p.locator('#drawerInsights:visible').count()
  pics.push(await C.pic(p, 'h03-phone-drawer'))
  log.push(`phone 390×844 View-only Sched ⋯ → Insights: ${rowsP.slice(0, 6).join(',')} … (${rowsP.length}) [${oP.tiles.join('/')}] same as admin (first twelve ${J(twelveRows) === J(adminRows.slice(0, 12))}; after Show all ${J(rowsP) === J(adminRows)} and tiles ${oP.tiles.join('/') === adminTiles}); role UI ${J(rsP)}; drawer has an Insights item: ${drawerIns}`)
  const bad = [r1, r2, r2b, rsP].some(r => r.ui || r.choose || r.side || r.q || r.remarksDoor || r.text)
  C.row('H-03', 'admin: tracking On, one formation unanswered ("DS FOR RU"), one answered Red; sign out; member (us) files a timed request from Inputs, opens View-only Sched, Inputs and Leave War doors to Insights on desktop and the phone ⋯ menu',
    log.join(' || '), bad ? 'FAIL' : 'CHECK', pics)
} catch (e) { C.row('H-03', 'aborted', String(e.stack || e).slice(0, 900) + ' LOG ' + log.join(' || '), 'FAIL', [await C.pic(p, 'h03-error')]) }
finally { await browser.close() }
console.log('ERRORS', J(C.ERR))
C.save('k')
