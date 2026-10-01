/* probe 5 (phone): the board, a seat, the ☰ (own world, thrown away) — run with HP_PHONE=1 */
import * as A from './ins-a-lib.mjs'
const { L, W } = A
const { browser, p, errors } = await A.world()
const log = (k, v) => console.log(`## ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`.slice(0, 3000))
const step = async (k, f) => { try { log(k, await f()) } catch (e) { log(k + ' ERR', String(e).slice(0, 400)) } }
await step('ins viewsched', async () => A.sum(await A.ins(p, 'probe5-ins')))
await A.toEdit(p)
await step('pub', () => A.pubOrig(p, 1))
await step('head', () => A.head(p, 1))
await A.pic(p, 'probe5-edit')
await W.boardOn(p, 1)
await A.pic(p, 'probe5-board')
await step('bar', () => p.evaluate(() => { const b = document.querySelector('#schedBoard'); const top = e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.width ? (h === e || e.contains(h) ? 'top' : 'covered by ' + (h ? h.id || h.className : '?')) : 'not drawn' }
  return { boardBtns: [...b.querySelectorAll('button')].filter(e => e.offsetParent !== null && e.getBoundingClientRect().top < 120 && e.getBoundingClientRect().top >= 0).map(e => (e.id || e.className) + ':' + e.innerText.trim().slice(0, 14)), burger: document.querySelector('#burger') ? top(document.querySelector('#burger')) : 'absent', insBtn: document.querySelector('#insightBtn') ? top(document.querySelector('#insightBtn')) : 'absent', z: getComputedStyle(b).zIndex } }))
/* the seat */
const seat = p.locator('#schedBoard [data-slot="1.1.1.0.p"]:visible').first()
await step('seat count', async () => seat.count())
await seat.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await L.sleep(300)
await seat.click().catch(e => log('click err', String(e).slice(0, 200))); await L.sleep(500)
await A.pic(p, 'probe5-seat-tapped')
await step('after tap', () => p.evaluate(() => ({ arm: window.ARM, roster: !!document.querySelector('#sbRoster') && document.querySelector('#sbRoster').offsetParent !== null, sheets: [...document.querySelectorAll('.sheet:not([hidden]), .drawer.open, .sb-ros.open, [class*=open]')].map(e => (e.id || '') + '.' + String(e.className).slice(0, 50)).slice(0, 10), rp: [...document.querySelectorAll('.rpuck[data-person="shaft"]')].map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), e.offsetParent !== null, (e.closest('[id]') || {}).id] }) })))
const rp = p.locator('.rpuck[data-person="shaft"]:visible').first()
if (await rp.count()) { await rp.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200); await rp.click().catch(e => log('rp err', String(e).slice(0, 200))); await L.sleep(600) }
await step('seat after', () => p.evaluate(() => window.DAYS[1].waves[1].formations[1].aircraft[0].p))
await A.pic(p, 'probe5-after-pick')
await step('head2', () => A.head(p, 1))
console.log('errors', errors)
await browser.close()
