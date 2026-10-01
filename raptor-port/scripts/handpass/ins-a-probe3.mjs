/* probe 3: gestures on a published day (own world, thrown away) */
import * as A from './ins-a-lib.mjs'
const { L, W } = A
const { browser, p, errors } = await A.world()
const log = (k, v) => console.log(`## ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`.slice(0, 3000))
try {
  await A.toEdit(p)
  await A.pubOrig(p, 1)
  log('head pub', await A.head(p, 1))
  await W.boardOn(p, 1)
  /* drag a roster puck (Anvil = shaft) onto Rebel's seat */
  const seat = p.locator('#schedBoard [data-slot="1.1.1.0.p"]:visible').first()
  const rp = p.locator('#sbRoster .rpuck[data-person="shaft"]:visible').first()
  await W.drag(p, rp, seat).catch(e => log('drag err', String(e)))
  log('seat', await p.evaluate(() => window.DAYS[1].waves[1].formations[1].aircraft[0].p))
  log('head pend', await A.head(p, 1))
  await A.pic(p, 'probe3-board-pending')
  /* tap on an occupied seat: what happens */
  await W.door(p, 'board', 'undo')
  log('head after undo', await A.head(p, 1))
  await seat.click(); await L.sleep(400)
  log('ARM', await p.evaluate(() => ({ arm: window.ARM, sel: [...document.querySelectorAll('#schedBoard .armed, #schedBoard .sel, #schedBoard .arm')].map(e => e.className).slice(0, 5) })))
  await A.pic(p, 'probe3-seat-tapped')
  await p.keyboard.press('Escape')
  /* plans menu → + Alt Plan */
  const m = p.locator('#schedBoard [data-planmenu="1"]:visible').first()
  await m.click(); await L.sleep(400)
  log('menu', await p.evaluate(() => [...document.querySelectorAll('[data-planpv],[data-plansel],[data-plandup],[data-planmanage],[data-planedit],[data-plangolive]')].filter(x => x.offsetParent !== null).map(x => x.outerHTML.replace(/\s+/g, ' ').slice(0, 220))))
  await A.pic(p, 'probe3-planmenu')
  const dup = p.locator('[data-plandup]:visible').first()
  if (await dup.count()) { await dup.click(); await L.sleep(600) }
  await A.pic(p, 'probe3-altplan')
  log('after altplan', await p.evaluate(() => ({ drafts: JSON.stringify(window.SCHED.drafts).slice(0, 300), cur: JSON.stringify(window.SCHED.curDraft), modal: [...document.querySelectorAll('.modal:not([hidden]), .airpop:not([hidden]), dialog[open]')].map(e => (e.id || e.className) + ':' + e.innerText.replace(/\s+/g, ' ').slice(0, 200)) })))
  log('head', await A.head(p, 1))
  await m.click().catch(() => {}); await L.sleep(400)
  log('menu2', await p.evaluate(() => [...document.querySelectorAll('[data-planpv],[data-plansel],[data-plandup],[data-planmanage],[data-planedit],[data-plangolive]')].filter(x => x.offsetParent !== null).map(x => x.outerHTML.replace(/\s+/g, ' ').slice(0, 260))))
  await A.pic(p, 'probe3-planmenu2')
  await p.keyboard.press('Escape'); await L.sleep(200)
  /* duty and ground */
  log('duty', await p.evaluate(() => JSON.stringify(window.DAYS[1].duty).slice(0, 500)))
  log('ground', await p.evaluate(() => JSON.stringify(window.DAYS[1].ground).slice(0, 500)))
  log('dutyDOM', await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="dl:1"], #schedBoard [data-bfld^="dr:1"], #schedBoard [data-bfld^="gr:1"], #schedBoard [data-fill^="d:1"], #schedBoard [data-fill^="g:1"]')].map(e => (e.dataset.bfld || e.dataset.fill)).slice(0, 60)))
  await W.boardOff(p)
  await L.go(p, 'viewsched'); await W.showDay(p, 1, '#vWeek')
  log('dver', await p.evaluate(() => { const s = document.querySelector('#vWeek .day[data-day="1"] select.dver, #vWeek [data-dver="1"]'); return s ? s.outerHTML.slice(0, 500) : null }))
  await A.pic(p, 'probe3-viewsched')
  await L.go(p, 'logic'); await L.sleep(400)
  await A.pic(p, 'probe3-logic')
  log('logic', await p.evaluate(() => { const pg = document.querySelector('#page-logic') || document.querySelector('.page:not([hidden])'); return { id: pg && pg.id, btns: [...pg.querySelectorAll('button')].filter(e => e.offsetParent !== null).map(e => (e.id || '') + ':' + e.innerText.trim().slice(0, 30)).slice(0, 40), txt: pg.innerText.replace(/\s+/g, ' ').slice(0, 500) } }))
  log('weeknav', await p.evaluate(() => [...document.querySelectorAll('header button, .topbar button, .subbar button, #weekbar button, .wkbar button')].filter(e => e.offsetParent !== null).map(e => (e.id || e.className) + ':' + e.innerText.trim().slice(0, 16) + (Object.keys(e.dataset).length ? JSON.stringify(e.dataset) : '')).slice(0, 40)))
} catch (e) { console.log('STOP', e.stack) }
console.log('errors', errors)
await browser.close()
