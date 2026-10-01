/* probe 6 (phone): a seat change through the AIRCREW drawer (own world, thrown away) — run with HP_PHONE=1 */
import * as A from './ins-a-lib.mjs'
const { L, W } = A
const { browser, p, errors } = await A.world()
const log = (k, v) => console.log(`## ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`.slice(0, 3000))
const step = async (k, f) => { try { log(k, await f()) } catch (e) { log(k + ' ERR', String(e).slice(0, 400)) } }
await A.toEdit(p)
await W.boardOn(p, 1)
const seat = p.locator('#schedBoard [data-slot="1.1.1.0.p"]:visible').first()
await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
await seat.click(); await L.sleep(400)
await step('tab', () => p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => /^AIRCREW$/i.test((e.innerText || '').replace(/\s+/g, '')) && e.children.length < 3).map(e => e.tagName + '#' + e.id + '.' + e.className).slice(0, 6)))
const tab = p.locator('#schedBoard #sbRosTab:visible, #schedBoard .sb-rostab:visible, #schedBoard [data-rostog]:visible, #schedBoard .rostab:visible').first()
await step('tabcount', () => tab.count())
if (await tab.count()) { await tab.click(); await L.sleep(500) }
else { await p.mouse.click(376, 400); await L.sleep(500) }
await A.pic(p, 'probe6-drawer')
const rp = p.locator('#sbRoster .rpuck[data-person="shaft"]').first()
await step('rp box', () => rp.boundingBox())
await rp.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
await rp.click({ timeout: 4000 }).catch(e => log('rp err', String(e).slice(0, 200))); await L.sleep(600)
await step('seat after', () => p.evaluate(() => window.DAYS[1].waves[1].formations[1].aircraft[0].p))
await A.pic(p, 'probe6-after')
console.log('errors', errors)
await browser.close()
