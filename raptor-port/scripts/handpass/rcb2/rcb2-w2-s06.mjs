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

// --- change "Full day of OIL" to 5h
const sf = await setFull('5h'); say('setFull 5h', JSON.stringify(sf))
const bodyText = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
await sat()
const t0 = await bodyText()
const dp = page.locator('.dpendbtn:visible').first()
say('dpendbtn count', await page.locator('.dpendbtn:visible').count(), await dp.innerText().catch(() => 'none'))
await X.pic(w, `s06-b-board-pending-${P}`)
const ch = await chipText(); say('chips after 5h', JSON.stringify(ch))
X.row('S06', size, 'Full day of OIL 6h01 -> 5h; open the published Saturday', 'day reads "1 pending"; sign-off strip gone', JSON.stringify({ pend: await dp.innerText().catch(() => null), sign: ch.sign, ver: ch.ver }), (await dp.count()) ? 'PASS' : 'FAIL', `s06-b-board-pending-${P}.png`)
if (await dp.count()) {
  await X.press(w, '.dpendbtn')
  await sleep(500)
  const t1 = await bodyText()
  const list = await page.evaluate(() => [...document.querySelectorAll('div,section,aside')].filter(e => e.offsetWidth && /^Changes . Saturday/.test(e.innerText || '') && (e.innerText || '').length < 900).map(e => e.innerText.replace(/\s+/g, ' ').trim()).sort((a, b) => a.length - b.length).slice(0, 1))
  const added = t1.length > t0.length ? t1.replace(t0.slice(0, 40), '').slice(0, 900) : '(no new text)'
  say('pending list', JSON.stringify(list)); say('added', added)
  await X.pic(w, `s06-c-pending-list-${P}`)
  X.row('S06', size, 'press "1 pending": RECORD the list wording', 'RECORD', JSON.stringify(list), 'RECORDED', `s06-c-pending-list-${P}.png`)
  await page.keyboard.press('Escape'); await sleep(300)
}
await X.closeBoard(w)
const lw2 = await lwRead('b-pending')
X.row('S06', size, 'Leave War cell while the Saturday reads pending', 'still credited HO (published keeps its OIL)', JSON.stringify(lw2), /HO/.test(JSON.stringify(lw2)) ? 'PASS' : 'FAIL', `s06-b-pending-leavewar-${P}.png`)
// View-only
await L.go(page, 'viewsched'); await sleep(600)
await X.pic(w, `s06-d-viewonly-${P}`)
const vo = await page.evaluate(() => [...document.querySelectorAll('#vWeek .dpendbtn, #vWeek [data-daywarn="5"] .witem')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))
X.row('S06', size, 'View-only week, Saturday', 'no sign-off / pending trouble on the viewer; RECORD', JSON.stringify(vo), 'RECORDED', `s06-d-viewonly-${P}.png`)
// put back
const sb = await setFull('6h01'); say('setFull back', JSON.stringify(sb))
await sat(); await sleep(1200); const dp2 = await page.locator('.dpendbtn:visible').count(); await X.pic(w, `s06-e-putback-${P}`)
X.row('S06', size, 'put "Full day of OIL" back to 6h01', 'pending clears', 'pending buttons: ' + dp2 + '; chips ' + JSON.stringify(await chipText()), dp2 === 0 ? 'PASS' : 'FAIL', `s06-e-putback-${P}.png`)
await X.closeBoard(w)
// change again and republish
await setFull('5h'); await sat()
const pr2 = await L.publish(page, SAT).catch(e => ({ err: String(e).slice(0, 150) }))
say('republish', JSON.stringify(pr2)); await X.pic(w, `s06-f-republished-${P}`)
const ch3 = await chipText(); await X.closeBoard(w)
const lw3 = await lwRead('c-republished')
X.row('S06', size, '5h again, sign, Publish AL1', 'Leave War FO once (5h < full day)', JSON.stringify({ pr2, ch3, lw3 }), /FO/.test(JSON.stringify(lw3)) ? 'PASS' : 'FAIL', `s06-f-republished-${P}.png`)
await X.fin(w)
