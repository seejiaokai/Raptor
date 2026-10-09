import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, closeWin, pubDay, credits, savePart } from './aa-B-lib.mjs'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's54'
const { page } = w
await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S54seed', s: '09:00', e: '12:00', oil: 'yes' })
await openBoard(page, 5)
const keys = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot], #schedBoard [data-fill]')].map(e => (e.dataset.slot ? 'slot:' + e.dataset.slot : 'fill:' + e.dataset.fill)))
const nPh = (pid) => page.evaluate(p => document.querySelectorAll(`#schedBoard .sb-sec .puck[data-person="${p}"], #schedBoard .sb-panel .puck[data-person="${p}"]`).length, pid)
const pageLines = () => page.evaluate(() => document.body.innerText.split(String.fromCharCode(10)).map(x => x.trim()).filter(Boolean))
let toastBefore = []
const toastText = async () => { const now = await pageLines(); return now.filter(l => !toastBefore.includes(l) && !/^(Who|PILOTS|WSOS)/.test(l)).slice(0, 6).join(' | ') }
async function addRow(sel, label) {
  const before = await keys()
  await page.locator(sel).first().scrollIntoViewIfNeeded(); await page.locator(sel).first().click(); await sleep(700)
  const after = await keys()
  const fresh = after.filter(k => !before.includes(k))
  say(label, 'new zones:', JSON.stringify(fresh.slice(0, 8))); return fresh
}
async function place(zoneCss, label, pid = 'allavail', how = 'pick') {
  const el = page.locator(`#schedBoard ${zoneCss}`).first()
  if (!(await el.count())) { say(label, 'zone not found', zoneCss); return { label, result: 'ZONE NOT FOUND' } }
  await el.scrollIntoViewIfNeeded(); await sleep(150)
  const b0 = await nPh(pid)
  toastBefore = await pageLines()
  const bb = await el.boundingBox()
  let armed = null, offered = null
  if (how === 'pick') {
    for (let t = 0; t < 3 && !armed; t++) { const b2 = await el.boundingBox(); await page.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2); await sleep(350); armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null) }
    const p = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
    offered = await p.count()
    if (armed && offered) { await p.scrollIntoViewIfNeeded(); await p.click(); await sleep(500) }
    else await page.keyboard.press('Escape')
  } else {
    const src = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible, #schedBoard .sb-side [data-person="${pid}"]:visible`).first()
    const sb = await src.boundingBox()
    await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.mouse.down()
    for (let i = 1; i <= 12; i++) { await page.mouse.move(sb.x + (bb.x + bb.width / 2 - sb.x) * i / 12, sb.y + (bb.y + bb.height / 2 - sb.y) * i / 12); await sleep(25) }
    await page.mouse.up(); await sleep(600)
  }
  const b1 = await nPh(pid), toast = await toastText()
  const r = { label, pid, how, armed, offered, placed: b1 - b0, toast: toast.slice(0, 200) }
  say(JSON.stringify(r)); return r
}
out.rows = []
// flying cockpit seat
await page.locator('#schedBoard [data-wvadd="5"]').first().click(); await sleep(500)
await page.getByRole('button', { name: 'Flying wave', exact: true }).first().click(); await sleep(900)
for (const pid of ['allavail', 'all']) { out.rows.push(await place('[data-slot="5.0.0.0.p"]', 'flying FCP seat (pick)', pid)); out.rows.push(await place('[data-slot="5.0.0.0.w"]', 'flying RCP seat (pick)', pid)) }
out.rows.push(await place('[data-slot="5.0.0.0.p"]', 'flying FCP seat (drag)', 'allavail', 'drag'))
await pic(w, 'flying')
// duty desk row
let z = await addRow('#schedBoard [data-dradd="5.0"]', 'duty row added')
out.rows.push(await place('[data-fill="d:5.0.1.+"] .addz', 'duty desk new row'))
// sim rows
z = await addRow('#schedBoard [data-sradd="5.amt"]', 'AMT row added'); await sleep(300)
const k1 = await keys(); say('sim zones now', JSON.stringify(k1.filter(k => /s:5/.test(k)).slice(0, 10)))
out.rows.push(await place('[data-slot="s:5.amt.0.p"]', 'AMT first seat'))
out.rows.push(await place('[data-slot="s:5.amt.0.w"]', 'AMT second seat'))
z = await addRow('#schedBoard [data-sradd="5.oft"]', 'OFT row added')
out.rows.push(await place('[data-slot="s:5.oft.0.p"]', 'OFT first seat')); out.rows.push(await place('[data-slot="s:5.oft.0.w"]', 'OFT second seat'))
// ground row + extras
z = await addRow('#schedBoard [data-gradd="5"]', 'ground row added')
out.rows.push(await place('[data-fill^="g:5."][data-fill$=".+"] .addz', 'ground row main (empty row)'))
out.rows.push(await place('[data-fill^="g:5."][data-fill$=".+"] .addz', 'ground row extras (after first)'))
// common programme item
z = await addRow('#schedBoard [data-padd="5"]', 'programme item added')
out.rows.push(await place('[data-fill="a:5.0.+"] .addz', 'common programme row'))
await pic(w, 'all')
// the placed state per destination
out.final = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.allavail, #schedBoard .puck[data-person="all"]')].filter(e => !e.closest('#sbRoster') && !e.closest('#sbSide')).map(e => (e.closest('[data-slot]') ? e.closest('[data-slot]').dataset.slot : (e.closest('[data-fill]') ? e.closest('[data-fill]').dataset.fill : '?')) + ' ' + e.dataset.person))
say('placeholder pucks now sitting in:', JSON.stringify(out.final))
out.errors = w.errors
await w.browser.close()
savePart('s54b-run', { out, log })
