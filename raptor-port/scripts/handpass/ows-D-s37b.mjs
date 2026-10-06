/* S37 (second part) — the ALL AVAIL window on an open-ended Common Programme item, OIL Earn on and off */
import * as D from './ows-D-lib.mjs'
import * as K from './stk-B-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, SAT, ISO } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log('>>', ...a)
const cE = await R.addRow(p, 'prog', SAT, 'CP-OPEN', '09:00', null, 'allavail')
log('seated', cE.took)
await D.oilMode(p, false)
const info = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .oilcount, #schedBoard [data-oilsent], #schedBoard .puck.ph, #schedBoard [data-person="allavail"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => `${e.tagName}.${String(e.className).slice(0, 50)} data=${JSON.stringify(Object.assign({}, e.dataset)).slice(0, 80)} "${(e.innerText || '').trim()}"`))
log('candidates', JSON.stringify(info))
async function openWin(label) {
  const sels = ['#schedBoard .oilcount:visible', '#schedBoard .puck[data-person="allavail"]:visible', '#schedBoard .sb-ppl .count:visible']
  for (const s of sels) {
    const c = p.locator(s).first()
    if (!(await c.count())) continue
    await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await c.click().catch(() => {}); await sleep(900)
    const w = await p.evaluate(() => { const e = document.querySelector('.availwin:not([hidden])'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
    if (w) { log(label, 'opened via', s); return w }
  }
  return null
}
const w1 = await openWin('mode off')
const pic1 = await P(p, 'S37b-window-modeoff')
log('window (mode off)', (w1 || '(none)').slice(0, 500))
await p.keyboard.press('Escape'); await sleep(300)
await p.evaluate(() => { const e = document.querySelector('.availwin .win-x, .availwin [aria-label="Close"]'); if (e) e.click() }); await sleep(300)
await D.oilMode(p, true)
const w2 = await openWin('mode on')
const pic2 = await P(p, 'S37b-window-modeon')
log('window (mode on)', (w2 || '(none)').slice(0, 700))
judge('S37.allavail-window', 'ALL AVAIL placeholder on the Common Programme item "CP-OPEN" (start 09:00, no end); tapped its count chip with OIL Earn off, then on', [
  ['seated', cE.took, cE.took],
  ['window opens with OIL Earn off (the availability half)', !!w1, (w1 || '').slice(0, 250)],
  ['window opens with OIL Earn on', !!w2, (w2 || '').slice(0, 250)],
  ['in the mode it says there is no end time / no OIL worked out', /no end time/i.test(w2 || ''), (w2 || '').slice(0, 300)],
], [pic1, pic2])
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s37b', { errors: D.cleanErr(errors), w1, w2, pics: D.pics.saved })
await browser.close()
