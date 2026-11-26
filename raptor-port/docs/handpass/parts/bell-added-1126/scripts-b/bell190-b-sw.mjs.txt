// bell190-b WebKit re-run of the phone cases (the host's ask): run with B_ENGINE=webkit B_URL=http://localhost:4173/
// B_SUFFIX=-webkit. "+ Input" for Ranger alone (List) and for several (a day opened); an existing input's window adding
// Ranger; Ranger's bell opened by a tap (a picture right after the tap and the settled one); a tap on his line; and the
// opened day's panel standing over the bell.
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-sw v1', 'url', L.URL, 'engine', process.env.B_ENGINE, 'suffix', process.env.B_SUFFIX)
const P = 'b-sw'
L.clearPics(P)
const { b, page, errs } = await L.launch('phone')
const log = (...a) => console.log(...a)
const ID = L.ID
log('saber:', await L.as.saber(page))
log('bundle:', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).join(' ')))
log('engine says:', await page.evaluate(() => navigator.userAgent))
await L.makeMoxie(page)
await L.goInputs(page)
const iids = {}
async function step(key, o) {
  const before = await L.notices(page)
  const r = await L.file(page, { picBefore: `${P}-${key}-window`, ...o })
  const nn = L.newNotices(await L.notices(page), before)
  iids[key] = r.rows[0]?.iid
  log(`[${key}] picked=${JSON.stringify(r.ppl)} open=${r.open} asked=${JSON.stringify(r.asked)} rows=${JSON.stringify(r.rows)}`)
  log(`[${key}] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
  if (r.open) { await L.pic(page, `${P}-${key}-still-open`); await L.closeWin(page) }
}
// W1: "+ Input" from the List, Training for Ranger alone
await step('w1', { from: 'list', type: 'Training', title: 'W1 Phone list', people: [ID.Ranger], date: '2026-07-15' })
// W2: a day opened on the calendar, one Meeting for Ranger, Moxie and Saber
await L.goInputs(page)
await step('w2', { from: 'day', type: 'Meeting', title: 'W2 Phone day', people: [ID.Ranger, ID.Moxie, ID.Saber], date: '2026-07-15' })
// THE OPENED DAY OVER THE BELL: the day is still open after the filing — what stands at the bell's middle, and a tap there
await page.waitForTimeout(400)
const dayOpen = await page.locator('[data-testid="win-inputsday-x"]').isVisible().catch(() => false)
const cover = await page.evaluate(() => {
  const bell = document.querySelector('#notifyBell'); const r = bell.getBoundingClientRect()
  const at = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
  const d = document.querySelector('[data-testid="win-inputsday-x"]'); const dr = d ? d.getBoundingClientRect() : null
  return { bell: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], atBellMiddle: at ? (at.getAttribute('data-testid') || at.id || at.className || at.tagName) : null,
    dayX: dr ? [Math.round(dr.x), Math.round(dr.y), Math.round(dr.width), Math.round(dr.height)] : null }
})
log('[cover] day open:', dayOpen, ' at the bell\'s middle:', JSON.stringify(cover))
await L.pic(page, `${P}-cover-day-open`)
let bellTap = 'tapped'
try { await page.tap('#notifyBell', { timeout: 3000 }) } catch (e) { bellTap = 'REFUSED: ' + String(e).split('\n').find(l => /intercepts/.test(l))?.trim() }
await page.waitForTimeout(60)
await L.pic(page, `${P}-cover-bell-tap`)
await page.waitForTimeout(400)
await L.pic(page, `${P}-cover-bell-after`)
log('[cover] a tap on the bell with the day open:', bellTap, ' bell list shown:', await page.evaluate(() => { const l = document.querySelector('.bell-list'); return !!l && l.getBoundingClientRect().width > 0 }))
await L.closeBell(page)
await L.closeDay(page)
// W3: Hex's Training from the List; Saber adds Ranger in its own window
await L.goInputs(page)
await step('w3', { from: 'list', type: 'Training', title: 'W3 Hex solo', people: [ID.Hex], date: '2026-07-16' })
await L.goInputs(page)
try { await L.openFromList(page, iids.w3) } catch (e) { log('[w3] List row not reached, opening by its bar:', String(e).slice(0, 80)); await L.goInputs(page); await L.openFromBar(page, iids.w3, '2026-07-16') }
await L.pic(page, `${P}-w3-opened`)
await L.setPeople(page, [ID.Hex, ID.Ranger], true)
await L.pic(page, `${P}-w3-edited`)
let before = await L.notices(page)
const s = await L.save(page)
log(`[w3 add] open=${s.open} now=${JSON.stringify(await L.input(page, iids.w3))}\n    new notices:\n    ` + L.fmt(L.newNotices(await L.notices(page), before)))
if (s.open) await L.closeWin(page)
const sb = await L.readBell(page, `${P}-saber-bell`)
log('SABER bell:', L.bellText(sb), JSON.stringify(sb.lit))
await L.signOut(page)
// Ranger: the bell opened by a tap, then a tap on his line
log('ranger:', await L.as.ranger(page))
const rb = await L.readBell(page, `${P}-ranger-bell`)
log('RANGER bell:', L.bellText(rb), JSON.stringify(rb.lit))
const t1 = await L.tapLine(page, 'W1 Phone list', `${P}-ranger-tap-w1`)
log('RANGER tap W1 ->', JSON.stringify(t1)); await L.closeWin(page)
await L.readBell(page, null)
const t3 = await L.tapLine(page, 'W3 Hex solo', `${P}-ranger-tap-w3`)
log('RANGER tap W3 ->', JSON.stringify(t3)); await L.closeWin(page)
await L.signOut(page)
for (const [who, fn] of [['moxie', L.as.moxie], ['hex', L.as.hex]]) {
  log(who + ':', await fn(page))
  const r = await L.readBell(page, `${P}-${who}-bell`)
  log(who.toUpperCase() + ' bell:', L.bellText(r), JSON.stringify(r.lit))
  await L.signOut(page)
}
log('errors', JSON.stringify(errs))
await b.close()
