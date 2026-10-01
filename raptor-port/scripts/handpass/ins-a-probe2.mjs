/* probe 2: learn the gestures (own world, thrown away) */
import * as A from './ins-a-lib.mjs'
import { handPut } from './seat-lib.mjs'
const { L, W } = A
const { browser, p, errors } = await A.world()
const log = (k, v) => console.log(`## ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`.slice(0, 2500))
try {
  await A.toEdit(p)
  log('ids', await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [k, v.cs + '/' + (v.seat || v.role || '') + (v.pers ? '/pers' : '')]))))
  log('pub', await A.pubOrig(p, 1))
  log('head', await A.head(p, 1))
  await W.boardOn(p, 1)
  log('bfld keys', await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld]')].map(e => e.dataset.bfld + '=' + (e.value ?? e.innerText)).filter(s => /^(ff|it|fr|wl):1\.1\./.test(s))))
  /* replace romeo (1.1.1.0.p) by an idle pilot */
  const idle = await p.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(e => e.offsetParent !== null).slice(0, 60).map(e => e.dataset.person + ':' + e.className.replace(/\s+/g, '.')))
  log('roster', idle)
  const r1 = await handPut(p, '1.1.1.0.p', 'anvil').catch(e => String(e))
  log('handPut anvil', r1)
  log('head after put', await A.head(p, 1))
  await A.pic(p, 'probe2-after-put')
  log('undo', await W.door(p, 'board', 'undo'))
  log('head after undo', await A.head(p, 1))
  /* drag the seat's puck onto the roster = take him off */
  const src = p.locator('#schedBoard [data-slot="1.1.1.0.p"] [data-person]:visible').first()
  const dst = p.locator('#sbRoster:visible').first()
  log('src/dst', [await src.count(), await dst.count(), await dst.boundingBox()])
  const a = await src.boundingBox(), b = await dst.boundingBox()
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
  const a2 = await src.boundingBox()
  await p.mouse.move(a2.x + a2.width / 2, a2.y + a2.height / 2); await p.mouse.down(); await p.mouse.move(a2.x + a2.width / 2 + 8, a2.y + a2.height / 2 + 8, { steps: 3 })
  await p.mouse.move(b.x + b.width / 2, b.y + 300, { steps: 14 }); await L.sleep(150); await p.mouse.up(); await L.sleep(700)
  log('seat now', await p.evaluate(() => window.DAYS[1].waves[1].formations[1].aircraft[0].p))
  log('head after drag-off', await A.head(p, 1))
  await A.pic(p, 'probe2-after-dragoff')
  log('undo2', await W.door(p, 'board', 'undo'))
  /* CX a line */
  const cx = p.locator('#schedBoard [data-lcx="1.1.1.1"]:visible').first()
  await cx.evaluate(e => e.scrollIntoView({ block: 'center' })); await cx.click(); await L.sleep(400)
  log('cxpop', await p.evaluate(() => { const e = document.querySelector('#cxPop'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : null }))
  await A.pic(p, 'probe2-cxpop')
  await p.locator('#cxSave').click(); await L.sleep(600)
  log('cx set', await p.evaluate(() => window.DAYS[1].waves[1].formations[1].aircraft.map(a => !!a.cx)))
  log('undo3', await W.door(p, 'board', 'undo'))
  /* plans menu */
  const m = p.locator('#schedBoard [data-planmenu="1"]:visible').first()
  await m.click(); await L.sleep(400)
  log('plan menu', await p.evaluate(() => { const e = document.querySelector('.planmenu, .plmenu, [class*=planm]'); const all = [...document.querySelectorAll('[data-planpv],[data-plansave],[data-plannew],[data-planswitch],[data-plan]')].filter(x => x.offsetParent !== null).map(x => x.outerHTML.slice(0, 160)); return { cls: e ? e.className : null, txt: e ? e.innerText.replace(/\s+/g, ' ').slice(0, 400) : null, all } }))
  await A.pic(p, 'probe2-planmenu')
  await p.keyboard.press('Escape'); await L.sleep(200)
  /* duty / ground add */
  log('duty', await p.evaluate(() => JSON.stringify(window.DAYS[1].duty).slice(0, 700)))
  log('ground', await p.evaluate(() => JSON.stringify(window.DAYS[1].ground).slice(0, 700)))
  log('tabs', await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-sbtab]')].map(e => e.dataset.sbtab + ':' + e.innerText.trim())))
  await W.boardOff(p)
  /* view-only version switch */
  await L.go(p, 'viewsched'); await W.showDay(p, 1, '#vWeek')
  log('dver', await p.evaluate(() => { const s = document.querySelector('#vWeek .day[data-day="1"] select.dver'); return s ? [...s.options].map(o => o.value + ':' + o.text) : null }))
  /* logic page */
  await L.go(p, 'logic'); await L.sleep(400)
  await A.pic(p, 'probe2-logic')
  log('logic', await p.evaluate(() => { const pg = document.querySelector('#page-logic'); return { btns: [...pg.querySelectorAll('button')].filter(e => e.offsetParent !== null).map(e => (e.id || '') + ':' + e.innerText.trim().slice(0, 30)).slice(0, 40), txt: pg.innerText.replace(/\s+/g, ' ').slice(0, 600) } }))
  /* week nav */
  log('weeknav', await p.evaluate(() => [...document.querySelectorAll('.wkbtn, [data-wk], #weekCalBtn, .wknav button, [data-week]')].filter(e => e.offsetParent !== null).map(e => e.outerHTML.slice(0, 140))))
} catch (e) { console.log('STOP', e.stack) }
console.log('errors', errors)
await browser.close()
