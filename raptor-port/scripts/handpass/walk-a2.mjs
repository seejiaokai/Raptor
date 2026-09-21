/* A7 — a live "stop this item earning" switch on rows that can never earn.
   A1 — the pending bar: the scheduler's screen loses the green bar at once
        while the Leave War still pays the issued figure, and nothing says so. */
import { open, board, tap, shot, readDay, publish, warnings, oilMode, lwCell, go, STATE, SHOTS } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}

/* publish it first — both scenarios are about a day that has gone out */
R.publish = await publish(page, di)
await page.waitForTimeout(600)

/* ---- A7: which rows offer a switch, and can any of them earn anybody? ---- */
await oilMode(page, true)
R.switches = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  return [...b.querySelectorAll('[data-oilitem]')].map(e => {
    const row = e.closest('.sb-arow, .sb-line, .sb-prow') || e.parentElement
    const people = row ? [...row.querySelectorAll('[data-oilp]')].length : -1
    const earners = row ? [...row.querySelectorAll('[data-oilp]')].filter(p => /FO|HO/.test(p.innerText || '')).length : -1
    return { key: e.dataset.oilitem, name: (e.innerText || '').split('\n')[0].trim(), title: e.getAttribute('title') || '', peopleOnRow: people, earnersOnRow: earners }
  }).filter(x => x.name && !/^(Ace|Warden|Blade|Trident|Anvil|Forge|Havoc|Comet|Reaper|Vandal|Outlaw|Nomad|Diesel|Vapor|Wildcard|Recon|Static|Relay|Scope|Rune|Hex|Vector|Dash|Ghost|Wisp|Ryder|Cutter|Saber|Torch|Ranger|Echo|Ridge|Grit|Piston|Basher|Fable|Drifter|Cinch|Cinder|Talisman|Gambit|Sidewinder)$/.test(x.name))
})
R.deadSwitches = R.switches.filter(s => s.earnersOnRow === 0)

/* tap one of the dead ones and see whether the day claims a change */
const dead = R.deadSwitches[0]
if (dead) {
  R.deadTapped = dead
  R.pendingBefore = await page.evaluate(() => {
    const el = document.querySelector('#schedBoard .alchip, #schedBoard [data-alcount], #schedBoard .pendchip')
    return el ? el.innerText.trim() : (document.querySelector('#schedBoard')?.innerText.match(/\d+ changes?/)?.[0] || 'none')
  })
  await page.locator(`#schedBoard [data-oilitem="${dead.key}"]:visible`).first().click()
  await page.waitForTimeout(700)
  R.toastAfterDeadTap = await page.evaluate(() => {
    const t = [...document.querySelectorAll('[class*=toast],[class*=snack]')].filter(e => e.offsetParent).map(e => e.innerText.trim())
    return t
  })
  await oilMode(page, false)
  R.pendingAfter = await page.evaluate(() => {
    const el = document.querySelector('#schedBoard .alchip, #schedBoard [data-alcount], #schedBoard .pendchip')
    return el ? el.innerText.trim() : (document.querySelector('#schedBoard')?.innerText.match(/\d+ changes?/)?.[0] || 'none')
  })
  R.afterDeadTapWarn = await warnings(page)
  await shot(page, 'A7-dead-switch-tapped')
}

/* ---- A1: the pending bar ---- */
/* money as issued, before any OIL decision */
R.moneyIssued = await lwCell(page, ['plasma', 'stiff', 'bane', 'pump'], '2026-07-18')
await board(page, di)
await oilMode(page, true)
await page.locator('#schedBoard [data-oilp]:visible').filter({ hasText: 'Fable' }).first().click()
await page.waitForTimeout(700)
await oilMode(page, false)
await page.waitForTimeout(400)

R.afterDeny = await readDay(page, di)
R.fablePuck = R.afterDeny.pucks.filter(p => p.who === 'Fable').map(p => ({ bar: p.bar, cls: p.cls, title: p.title }))
R.pendingAfterDeny = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const m = (b.innerText || '').match(/(\d+)\s+changes?/)
  const chip = b.querySelector('.alchip, [data-alcount], .pendchip')
  return { chip: chip ? chip.innerText.trim() : null, text: m ? m[0] : null }
})
await shot(page, 'A1-pending-board')

/* the issued face — the View-only page a reader sees */
await go(page, 'viewsched')
await page.waitForTimeout(900)
R.issuedFace = await page.evaluate(() => {
  const P = window.PEOPLE
  return [...document.querySelectorAll('#vWeek [data-person]')]
    .filter(e => e.classList.contains('puck'))
    .map(e => ({ who: (P[e.dataset.person] || {}).cs || e.dataset.person, bar: e.className.match(/oilbar-(fo|ho)/)?.[1] || null }))
    .filter(x => ['Fable', 'Saber', 'Ranger', 'Piston'].includes(x.who))
})
await shot(page, 'A1-issued-face')

/* and the money, which must not have moved */
R.moneyAfterDeny = await lwCell(page, ['plasma', 'stiff', 'bane', 'pump'], '2026-07-18')

R.errors = errors.slice(0, 8)
const { writeFileSync } = await import('node:fs')
writeFileSync(SHOTS + '/../walk-a2.json', JSON.stringify(R, null, 1))
console.log('PUBLISH:', JSON.stringify(R.publish))
console.log('SWITCHES (' + R.switches.length + '), of which offer a switch with NOBODY earning on the row (' + R.deadSwitches.length + '):')
R.switches.forEach(s => console.log('  ' + s.name.padEnd(12) + ' people=' + s.peopleOnRow + ' earners=' + s.earnersOnRow + '  "' + s.title + '"'))
console.log('TAPPED DEAD SWITCH:', JSON.stringify(R.deadTapped))
console.log('  pending before:', R.pendingBefore, ' after:', R.pendingAfter)
console.log('  toast:', JSON.stringify(R.toastAfterDeadTap))
console.log('  warnings after:', JSON.stringify(R.afterDeadTapWarn))
console.log('MONEY as issued:', JSON.stringify(R.moneyIssued))
console.log('FABLE puck after denying him on the board:', JSON.stringify(R.fablePuck))
console.log('pending chip:', JSON.stringify(R.pendingAfterDeny))
console.log('ISSUED FACE:', JSON.stringify(R.issuedFace))
console.log('MONEY after the unpublished denial:', JSON.stringify(R.moneyAfterDeny))
console.log('errors:', R.errors)
await browser.close()
