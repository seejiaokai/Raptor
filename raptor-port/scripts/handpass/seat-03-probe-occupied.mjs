/* What does the app DO when a scheduler taps a seat that already holds a man?
   The roll-call has to place by hand on every seat kind, and most of the
   everything-Saturday's seats are already full — so this has to be known
   before the roll-call can be trusted. It is also the DOOR CHECK's "drag as a
   swap" case. */
import { open, board, tap, shot, STATE } from './lib.mjs'
import { toast } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

async function probe(key, label) {
  const before = await page.evaluate(() => (window.ARM && JSON.stringify(window.ARM)) || null)
  await tap(page, `[data-slot="${key}"], [data-fill="${key}"]`)
  await page.waitForTimeout(300)
  const after = await page.evaluate(() => ({
    arm: (window.ARM && JSON.stringify(window.ARM)) || null,
    pop: [...document.querySelectorAll('.pop, .menu, [class*=pop], [role=dialog]')]
      .filter(e => e.offsetParent !== null).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200)),
    sel: [...document.querySelectorAll('#schedBoard .sel, #schedBoard .selected, #schedBoard .armed')]
      .filter(e => e.offsetParent !== null).length,
  }))
  console.log(`${label}\n   ARM before=${before} after=${after.arm}\n   popups=${JSON.stringify(after.pop)}  selected=${after.sel}  said=${await toast(page)}`)
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
}

await probe(`${di}.0.0.0.p`, 'OCCUPIED flying cockpit (VIPER P, Ranger)')
await probe(`${di}.1.0.1.p`, 'EMPTY flying cockpit (SC MAIN 2nd jet P)')
await probe(`d:${di}.0.0`,   'OCCUPIED duty position (SDO)')
await probe(`d:${di}.1.1`,   'EMPTY duty position (AVALON OPS O)')
await probe(`g:${di}.0`,     'OCCUPIED ground who (OCU REVIEW, Saber)')
await probe(`s:${di}.oft.0.p`, 'OCCUPIED sim front seat')

/* which seat addresses are EMPTY right now — the roll-call needs these */
const empt = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const out = { slot: [], fill: [] }
  for (const a of ['data-slot', 'data-fill']) {
    for (const e of b.querySelectorAll(`[${a}]`)) {
      if (e.offsetParent === null) continue
      if (!e.querySelector('[data-person]')) out[a === 'data-slot' ? 'slot' : 'fill'].push(e.getAttribute(a))
    }
  }
  return out
})
console.log('\nEMPTY slots:', empt.slot.join(', '))
console.log('EMPTY fills:', empt.fill.join(', '))
console.log('errors:', errors.slice(0, 5))
await browser.close()
