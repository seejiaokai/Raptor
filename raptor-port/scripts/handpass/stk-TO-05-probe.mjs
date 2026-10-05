/* walker TO — probe (phone): how a seat is filled on the phone board (a throw-away world; nothing here is evidence) */
import * as T from './stk-TO-lib.mjs'
const { W, L } = T
const w = await T.world({ phone: true })
const p = w.p
const say = async (k) => console.log(k, JSON.stringify(await p.evaluate(() => ({ arm: window.ARM, seat: (window.DAYS[0].waves[2] || { formations: [{ aircraft: [{}] }] }).formations[0].aircraft[0], rosVis: (() => { const r = document.querySelector('#sbRoster'); if (!r) return null; const b = r.getBoundingClientRect(); return { x: Math.round(b.x), w: Math.round(b.width), cls: r.className, par: r.parentElement.className } })(), puck: (() => { const e = document.querySelector('#sbRoster .rpuck[data-person="beams"]'); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), cls: e.className } })() }))))
try {
  const gi = await T.addWave(p, 0)
  await T.form(p, 0, gi, 0, { cs: 'VL', to: '1200', ld: '1300' })
  await say('start')
  const seat = p.locator('#schedBoard [data-slot="0.2.0.0.p"]:visible').first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(250)
  await seat.click(); await L.sleep(500)
  await say('after seat tap'); await T.pic(p, 'probe-ph-seat-tapped')
  /* is the crew list on screen now? if not, open AIRCREW */
  const onScreen = await p.evaluate(() => { const e = document.querySelector('#sbRoster .rpuck[data-person="beams"]'); if (!e) return false; const b = e.getBoundingClientRect(); return b.x >= 0 && b.x < innerWidth && b.width > 0 })
  console.log('puck on screen after seat tap:', onScreen)
  if (!onScreen) { await p.locator('#schedBoard .ros-tab:visible').first().click(); await L.sleep(500); await say('after AIRCREW'); await T.pic(p, 'probe-ph-aircrew-open') }
  const rp = p.locator('#sbRoster .rpuck[data-person="beams"]').first()
  await rp.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(250)
  await T.pic(p, 'probe-ph-before-name')
  await rp.click({ timeout: 4000 }).catch(e => console.log('name click failed', String(e).slice(0, 200))); await L.sleep(600)
  await say('after name tap'); await T.pic(p, 'probe-ph-after-name')
} catch (e) { console.log('ERR', String(e && e.stack || e).slice(0, 600)) }
await w.browser.close()
