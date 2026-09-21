/* Publish the everything-Saturday once and keep the world, so every scenario
   in blocks C and D starts from a real ISSUED day. Also the door check for the
   published-day controls. */
import { open, board, shot } from './lib.mjs'
import { dayHead, signAndPublish, bars, planMenu, history, warCells, oilTracker, dayWarn, BASE_STATE, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const WHO = [['bane', 'Ranger'], ['freak', 'Echo'], ['razer', 'Ridge'], ['sufa', 'Grit'], ['pump', 'Piston'],
  ['glass', 'Basher'], ['taipan', 'Cobra'], ['slipway', 'Drifter'], ['dice', 'Reaper'], ['snap', 'Cinch'],
  ['ammo', 'Cinder'], ['stiff', 'Saber'], ['ignite', 'Torch'], ['nact', 'Warden'], ['casper', 'Outlaw'],
  ['salsa', 'Saint'], ['prowler', 'Hunter'], ['split', 'Vandal']]

const { browser, ctx, page, errors } = await open({ state: BASE_STATE })
await board(page, di)

console.log('== DRAFT HEAD ==', JSON.stringify(await dayHead(page, di)))
console.log('== DRAFT WARN ==', JSON.stringify(await dayWarn(page)))
const before = await bars(page)
console.log('== DRAFT BARS ==')
before.forEach(b => console.log(`   ${b.who.padEnd(10)} ${(b.bar || '-').padEnd(6)} ${b.title.slice(0, 70)}`))

console.log('\n== PLAN MENU (draft) ==', JSON.stringify(await planMenu(page, di), null, 1))
await page.keyboard.press('Escape'); await page.waitForTimeout(400)

const pub = await signAndPublish(page, di)
console.log('\n== PUBLISH ==', JSON.stringify(pub))
await shot(page, 'CD-base-published')
console.log('== AFTER HEAD ==', JSON.stringify(await dayHead(page, di)))
console.log('== AFTER WARN ==', JSON.stringify(await dayWarn(page)))
const after = await bars(page)
console.log('== AFTER BARS ==')
after.forEach(b => console.log(`   ${b.who.padEnd(10)} ${(b.bar || '-').padEnd(6)} ${b.title.slice(0, 70)}`))

console.log('\n== PLAN MENU (published) ==', JSON.stringify(await planMenu(page, di), null, 1))
await page.keyboard.press('Escape'); await page.waitForTimeout(400)

const cells = await warCells(page, WHO.map(([id]) => [id, SAT]))
console.log('\n== LEAVE WAR Sat 18 Jul ==')
cells.forEach((c, i) => console.log(`   ${WHO[i][1].padEnd(10)} ${c.found ? '"' + c.text + '"' : 'NO CELL'}  ${c.title.slice(0, 60)}`))
await shot(page, 'CD-base-war')
const tr = await oilTracker(page)
console.log('\n== OIL TRACKER ==', tr.entries.length, 'entries')
tr.entries.slice(0, 30).forEach(e => console.log('   ' + e))
await shot(page, 'CD-base-tracker')

await page.waitForTimeout(1200)
await ctx.storageState({ path: PUB_STATE })
console.log('\nsaved world ->', PUB_STATE)
console.log('errors:', errors.slice(0, 6))
await browser.close()
