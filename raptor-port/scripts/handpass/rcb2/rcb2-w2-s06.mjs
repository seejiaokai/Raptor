/* rcb2-w2 S06 — the published OIL Saturday end to end (Sat 18 Jul = SAT index 5; Bane 12:00-13:00; rally 09:00; debrief to 15:00; "Full day of OIL" 6h01 -> HO;
   changed to 5h -> "1 pending", sign-offs gone, credit still HO; put back -> clears; changed again + republished -> FO once).
   usage: STEPS=probe|full [PHONE=1] node rcb2-w2-s06.mjs */
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 's06-' + (PHONE ? 'p' : 'd') + '1'
const X = await import('./rcb2-w2-lib.mjs')
const { L, say, sleep, SAT } = X
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const ISO = '2026-07-18'

async function lwRead(tag) {
  // the Leave War's cell for Bane on Sat 18 Jul + his person window's OIL figure
  const cell = await L.lwCell(page, ['bane'], ISO)
  await X.pic(w, `s06-${tag}-leavewar-${P}`)
  return cell
}
async function setFull(val) {
  await L.go(page, 'logic'); await sleep(500)
  if (!(await page.locator('#lgBody input[data-lgset="oilFullMin"]:visible').count())) { const e = page.locator('#lgEdit:visible').first(); if (await e.count()) { await X.press(w, '#lgEdit'); await sleep(400) } }
  const inp = page.locator('#lgBody input[data-lgset="oilFullMin"]').first()
  if (!(await inp.count())) return { ok: false, why: 'no oilFullMin box' }
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded()
  await inp.fill(String(val)); await inp.press('Tab'); await sleep(600)
  const after = await inp.inputValue()
  await X.pic(w, `s06-logic-${String(val).replace(/\W/g, '')}-${P}`)
  return { ok: true, before, after }
}
const sat = async () => {
  await X.board(w, SAT)
}
const chipText = () => page.evaluate(() => ({
  ver: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
  pend: [...document.querySelectorAll('#schedBoard [data-alcount], #schedBoard .alchip, #schedBoard .pendchip, #schedBoard [data-pendchip]')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()),
  sign: [...document.querySelectorAll('#schedBoard .sb-sign select')].filter(e => e.offsetWidth).map(e => e.value),
  head: ((document.querySelector('#schedBoard .sb-head, #schedBoard .dayhead') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 200),
}))

// --- setup: Saturday flight 12:00-13:00, Bane
await sat()
const wi = await X.flight(w, SAT, '12:00', '13:00')
const ffx = await page.evaluate(([d, g]) => { const f = window.DAYS[d].waves[g].formations[0]; return JSON.stringify({ to: f.to, ld: f.ld, br: f.br, rl: f.rl, it: f.it }) }, [SAT, wi])
say('Sat formation', ffx)
await X.pic(w, `s06-0-board-before-publish-${P}`)
const pr = await L.publish(page, SAT)
say('publish', JSON.stringify(pr))
await X.pic(w, `s06-1-after-publish-${P}`)
X.row('S06', size, 'Sat 12:00-13:00 Bane; sign four; Publish day', 'published', JSON.stringify(pr), pr.published ? 'PASS' : 'FAIL', `s06-1-after-publish-${P}.png`)
say('chips', JSON.stringify(await chipText()))
const puck = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].filter(e => !e.closest('#sbRoster')).map(e => ({ cls: e.className, title: e.getAttribute('title') })))
say('Bane puck', JSON.stringify(puck))
await X.closeBoard(w)
const lw1 = await lwRead('a-published')
say('LW cell', JSON.stringify(lw1))
X.row('S06', size, 'Leave War cell for Bane on Sat 18 Jul after publishing (6h01 -> 6h on the day)', 'credited HO', JSON.stringify(lw1), /HO/.test(JSON.stringify(lw1)) ? 'PASS' : 'FAIL', `s06-a-published-leavewar-${P}.png`)
