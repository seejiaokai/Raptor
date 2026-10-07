/* P3-17 roles and first-use settings */
import * as C from './stk-C-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const pics = []
const log = []
const sw = async p => p.evaluate(() => { const e = document.querySelector('#lgMissionMix'); return e ? { checked: e.type === 'checkbox' ? e.checked : e.getAttribute('aria-checked') === 'true' || e.classList.contains('on'), disabled: e.disabled === true || e.getAttribute('aria-disabled') === 'true' || e.type !== 'checkbox', tag: e.tagName, label: (e.parentElement || {}).innerText && e.parentElement.innerText.replace(/\s+/g, ' ').slice(0, 60), edit: !!document.querySelector('#lgEdit') } : null })
const topRows = async p => { const o = await C.insightsRead(p); return C.mixRows(o).slice(0, 8).join(',') + ' [' + o.tiles.join('/') + '] all=' + o.rows.filter(r => r.mix).length }
const { browser, p } = await C.world()
try {
  // 1 fresh: Off
  await L.go(p, 'logic')
  const s0 = await sw(p); pics.push(await C.pic(p, 'p317-logic-fresh'))
  log.push(`fresh squadron, admin on Logic: ${J(s0)}`)
  const rows0 = await topRows(p)
  log.push(`Insights with tracking Off: ${rows0}`)
  // 2 admin turns it on
  await C.tracking(p, true)
  const s1 = await sw(p); pics.push(await C.pic(p, 'p317-logic-on'))
  const rowsOn = await topRows(p)
  log.push(`admin turned it On: ${J(s1)}; Insights ${rowsOn}`)
  // 3 admin as member
  await p.locator('#roleBadge').click(); await C.sleep(700)
  const badge = await p.evaluate(() => document.querySelector('#roleBadge').innerText)
  await L.go(p, 'logic'); const s2 = await sw(p); pics.push(await C.pic(p, 'p317-admin-as-member-logic'))
  const navNow = await p.evaluate(() => [...document.querySelectorAll('.nav [data-page]')].filter(e => e.offsetParent !== null).map(e => e.getAttribute('data-page')).join(','))
  const rowsM1 = await topRows(p)
  log.push(`admin switched to member view (badge ${J(badge)}; nav ${navNow}): switch ${J(s2)}; Insights ${rowsM1} (same as admin: ${rowsM1 === rowsOn})`)
  await p.locator('#roleBadge').click(); await C.sleep(700)
  // 4 actual member
  await p.locator('#logout:visible').first().click(); await C.sleep(800)
  await L.signIn(p, 'm', { goto: false }); await C.sleep(600)
  await L.go(p, 'logic'); const s3 = await sw(p); pics.push(await C.pic(p, 'p317-member-logic'))
  const nav3 = await p.evaluate(() => [...document.querySelectorAll('.nav [data-page]')].filter(e => e.offsetParent !== null).map(e => e.getAttribute('data-page')).join(','))
  const rowsM2 = await topRows(p)
  log.push(`real member (us): nav ${nav3}; switch ${J(s3)} (setting not reset by the account change); Insights ${rowsM2} (same: ${rowsM2 === rowsOn})`)
  // try to write as member through the control a finger could reach
  const tryW = await p.evaluate(() => { const e = document.querySelector('#lgMissionMix'); if (!e) return 'no control'; const before = e.type === 'checkbox' ? e.checked : null; e.click(); return 'clicked; still ' + (e.type === 'checkbox' ? e.checked : e.getAttribute('aria-checked')) })
  await C.sleep(400)
  const s3b = await sw(p)
  log.push(`member clicks the switch: ${tryW}; after ${J(s3b)}`)
  // 5 guest: admin enables guest viewing first
  await p.locator('#logout:visible').first().click(); await C.sleep(800)
  await L.signIn(p, 'a', { goto: false }); await C.sleep(600)
  await L.go(p, 'admin'); await p.locator('.adm-cat').filter({ hasText: 'Users' }).click(); await C.sleep(500)
  await p.locator('#admGuestView').check().catch(() => {}); await C.sleep(400)
  pics.push(await C.pic(p, 'p317-guest-enabled'))
  await p.locator('#logout:visible').first().click(); await C.sleep(800)
  await p.fill('#luser', 'menu.guest'); await p.fill('#lpass', 'demo'); await p.click('#loginForm button[type=submit]'); await C.sleep(800)
  pics.push(await C.pic(p, 'p317-guest-card'))
  const card = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300))
  await p.fill('#accCs', 'Menu Guest'); await p.fill('#accIni', 'MG'); await p.selectOption('#accSeat', 'GND'); await p.click('#accSend'); await C.sleep(900)
  pics.push(await C.pic(p, 'p317-after-request'))
  const afterReq = await p.evaluate(() => ({ text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300), guestBtn: !!document.querySelector('#accGuest'), shell: !!document.querySelector('#shell'), vWeek: !!document.querySelector('#vWeek .day') }))
  log.push(`unknown identity signs in: card says ${J(card)}; after sending the access request: ${J(afterReq)}`)
  if (afterReq.guestBtn) {
    await p.click('#accGuest'); await C.sleep(900)
    pics.push(await C.pic(p, 'p317-guest-view'))
    const g = await p.evaluate(() => ({ guestApp: !!document.querySelector('#guestApp'), shell: !!document.querySelector('#shell'), insightBtn: !!document.querySelector('#insightBtn, #viewSchedMore, #sbInsights'), editable: document.querySelectorAll('[contenteditable="true"], textarea, input:not([type=hidden])').length, text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 200) }))
    log.push(`entered as guest (read-only): ${J(g)}`)
  }
  // 6 no-access: a second unknown identity stays at the card / waiting
  await p.evaluate(() => { try { window.raptorSignOut && window.raptorSignOut() } catch (e) {} })
  const ctx2 = await browser.newContext({ viewport: L.DESK })
  const p2 = await L.page(ctx2, C.ERR, 'N')
  await p2.goto(L.BASE + '/')
  await p2.fill('#luser', 'no.access'); await p2.fill('#lpass', 'demo'); await p2.click('#loginForm button[type=submit]'); await C.sleep(900)
  await p2.fill('#accCs', 'No Access'); await p2.fill('#accIni', 'NA'); await p2.selectOption('#accSeat', 'GND'); await p2.click('#accSend'); await C.sleep(900)
  pics.push(await C.pic(p2, 'p317-no-access'))
  const na = await p2.evaluate(() => ({ text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 260), shell: !!document.querySelector('#shell'), nav: document.querySelectorAll('.nav [data-page]').length, vWeek: !!document.querySelector('#vWeek .day'), guestBtn: !!document.querySelector('#accGuest') }))
  log.push(`a second identity requesting access, not approved: ${J(na)}`)
  C.row('P3-17', 'fresh world: Logic on first sign-in; admin switches Track Blue/RED sorties On; admin-as-member (top-bar badge); real member (us); Admin → Users guest viewing On, an unknown sign-in as guest; another unknown sign-in left waiting',
    log.join(' || '), 'CHECK', pics)
} catch (e) { C.row('P3-17', 'aborted', String(e.stack || e).slice(0, 900) + ' LOG: ' + log.join(' || '), 'FAIL', [await C.pic(p, 'p317-error')]) }
finally { await browser.close() }
console.log('ERRORS', J(C.ERR))
C.save('i')
