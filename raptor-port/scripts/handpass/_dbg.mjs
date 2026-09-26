import { chromium } from '@playwright/test'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-accounts'
const lib = await import('./lib.mjs')
const b = await chromium.launch({ headless: true })
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await p.goto('http://localhost:4173/')
await lib.login(p, 'a')
await lib.board(p, 0); console.log(await lib.publish(p, 0)); await lib.closeBoard(p)
// medical inputs on Monday as the member sees them
const med = await p.evaluate(() => window.INPUTS.filter(i => i.date === 'Jul 13').map(i => `${i.person}:${i.type}:${i.remarks}`))
console.log('Monday inputs', med)
await p.evaluate(() => window.go('admin')); await p.waitForTimeout(300); await p.check('#admGuestView'); await p.waitForTimeout(200)
await p.click('#logout'); await p.waitForSelector('#luser')
await p.fill('#luser', 'g@mail'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(400)
await p.fill('#accCs', 'G'); await p.fill('#accFull', 'G'); await p.click('#accSend'); await p.waitForTimeout(300)
await p.click('#accOut'); await p.waitForSelector('#luser')
await p.fill('#luser', 'g@mail'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(800)
const words = /OML|ATT ?[BC]|medical|Medical|DNIF|downchit|Medic/
const grab = async (label) => { const t = await p.locator('#guestApp').innerText(); const hits = t.split('\n').filter(l => words.test(l)); console.log(label, hits.slice(0, 12)) }
await grab('plain')
// expand the warning list
const w = p.locator('#guestApp .daywarn, #guestApp [data-warnhead], #guestApp .dwarn').first()
const tap = p.getByText('tap to review').first(); if (await tap.count()) { await tap.click(); await p.waitForTimeout(400) }
await grab('warnings open')
await p.screenshot({ path: process.env.HP_SHOTS + '/x-guest-warnings.png' })
// the (i) panel
const info = p.locator('#guestApp button.dinfobtn').first()
console.log('info buttons', await p.locator('#guestApp button.dinfobtn').count(), 'HSP seen:', (await p.locator('#guestApp').innerText()).includes('HSP'))
if (await info.count()) { await info.click(); await p.waitForTimeout(400); await grab('info open'); console.log('popups after (i):', await p.evaluate(() => [...document.querySelectorAll('.sheet, .modal, .daypop, [role=dialog]')].map(e => e.className).slice(0,5))); await p.screenshot({ path: process.env.HP_SHOTS + '/x-guest-info.png' }) }
// tap a puck
const puck = p.locator('#guestApp .puck').first(); if (await puck.count()) { await puck.click(); await p.waitForTimeout(300); await grab('puck tapped') }
await b.close()
