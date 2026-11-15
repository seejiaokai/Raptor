/* www W2 scenario 4: crew list, ALL AVAIL and ALL vs the conflict list for the same window (Friday, Ranger free).
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/www/www-w2-s4.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's4-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w2-lib.mjs')
const { X, say, sleep } = H
const P = PHONE ? 'p' : 'd', size = PHONE ? '402' : '1536'
const R = (did, exp, saw, v, pic) => X.row('4 crew list / ALL AVAIL / ALL vs conflicts', size, did, exp, saw, v, pic)
say('www-w2-s4 v1', size)
const w = await X.open({ phone: PHONE })
const { page } = w
const FRI = X.FRI
await X.board(w, FRI)
const wi = await H.frFlight(w, FRI, '12:00', '', null)
const g0 = await H.gRow(w, FRI, 'BRIEFING', '13:10', '13:20', null)
const gslot = `g:${FRI}.${g0}`
// 1. roster with no seat picked, then with the briefing seat armed, Ranger still free
let r = await H.rosterRead(w)
await X.pic(w, `4-1-nosel-${P}`)
R('crew list, no seat picked, nobody yet on the flight', 'RECORD', JSON.stringify(r), 'RECORDED', `4-1-nosel-${P}.png`)
say('armed', await H.arm(w, `[data-fill="${gslot}.+"]`))
r = await H.rosterRead(w)
await X.pic(w, `4-2-armed-free-${P}`)
R('briefing seat 13:10-13:20 armed, Ranger not yet on the flight', 'Ranger offered free', JSON.stringify(r), /busy|off|dim|grey|unavail/i.test(r.rpuck + r.puck) ? 'FAIL' : 'PASS', `4-2-armed-free-${P}.png`)
await H.disarm(w)
// 2. Ranger on the flight (assumed landing 13:00, dekit to 13:30)
say('seat flight', await X.seat(w, `[data-slot="${FRI}.${wi}.0.0.p"]`, 'bane'))
await sleep(300)
let bw = await X.boardWarn(w)
say('BOARD WARN after Ranger on flight', JSON.stringify(bw))
say('armed', await H.arm(w, `[data-fill="${gslot}.+"]`))
r = await H.rosterRead(w)
await X.pic(w, `4-3-armed-busy-${P}`)
R('Ranger now flies 12:00 (landing assumed 13:00, dekit to 13:30); briefing 13:10-13:20 seat armed: crew list', 'Ranger shown unavailable for 13:10-13:20 (busy to 13:30)', JSON.stringify(r), /busy|off|dim|grey|unavail|no/i.test(r.rpuck + ' ' + r.puck + ' ' + r.note) || /line-through|none/.test(r.struck) ? 'RECORDED' : 'FAIL', `4-3-armed-busy-${P}.png`)
await H.disarm(w)
// 3. ALL AVAIL and ALL on the briefing row
say('ALLAVAIL seat', await X.seat(w, `[data-fill="${gslot}.+"]`, 'allavail'))
await sleep(300)
const chipAA = await H.chipText(w, gslot)
const wa = await H.openAvail(w, gslot)
await X.pic(w, `4-4-allavail-win-${P}`)
say('AVAIL WIN', JSON.stringify(wa).slice(0, 2500))
R('ALL AVAIL on briefing 13:10-13:20: chip count and its window', 'RECORD; Ranger excluded', `chip ${chipAA}; ${JSON.stringify(wa).slice(0, 1200)}`, 'RECORDED', `4-4-allavail-win-${P}.png`)
// lesson 4: press the page behind the window — a puck on the ground row — and see what lights, window stays
const winOpen = () => page.locator('.availwin:visible').count()
const behind = page.locator(`#schedBoard [data-slot="g:${FRI}.0"] .puck:visible`).first()
await behind.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
const wBefore = await winOpen()
if (PHONE) await behind.tap(); else await behind.click()
await sleep(500)
const lit = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck')].filter(e => e.classList.contains('sel') || e.classList.contains('lit') || /selected|picked/.test(e.className)).map(e => e.innerText.replace(/\s+/g, ' ') + ':' + e.className).slice(0, 4))
await X.pic(w, `4-5-page-behind-${P}`)
R('ALL AVAIL window open: pressed Saber\'s puck on the ground row behind it', 'page still works (puck selected), window stays', `window open before ${wBefore}, after ${await winOpen()}; lit: ${JSON.stringify(lit)}`, (await winOpen()) && lit.length ? 'PASS' : 'RECORDED', `4-5-page-behind-${P}.png`)
// close window by ✕
const xBtn = page.locator('.availwin:visible button:has-text("✕"), .availwin:visible [aria-label*="lose" i]').first()
if (PHONE) await xBtn.tap(); else await xBtn.click()
await sleep(400)
R('ALL AVAIL window closed by ✕', 'closes', `still open: ${await winOpen()}`, (await winOpen()) ? 'FAIL' : 'PASS', '')
// ALL placeholder on a second row, same window
const g1 = await H.gRow(w, FRI, 'BRIEFING B', '13:10', '13:20', null)
const gs1 = `g:${FRI}.${g1}`
say('ALL seat', await X.seat(w, `[data-fill="${gs1}.+"]`, 'all'))
const wl = await H.openAvail(w, gs1)
await X.pic(w, `4-6-all-win-${P}`)
say('ALL WIN', JSON.stringify(wl).slice(0, 1800))
R('ALL placeholder, same window 13:10-13:20: its window', 'RECORD; may keep Ranger and say why', JSON.stringify(wl).slice(0, 900), 'RECORDED', `4-6-all-win-${P}.png`)
const hasRanger = /Ranger/.test(JSON.stringify(wl))
if (hasRanger) {
  const rp = page.locator('.availwin:visible .puck', { hasText: 'Ranger' }).first()
  if (PHONE) await rp.tap(); else await rp.click(); await sleep(500)
  const why = await page.evaluate(() => document.querySelector('.availwin')?.innerText.replace(/\s+/g, ' ').slice(0, 600))
  await X.pic(w, `4-7-all-why-${P}`)
  R('ALL window: tapped Ranger for why', 'a reason naming the flight and assumed landing/dekit', why, 'RECORDED', `4-7-all-why-${P}.png`)
}
const xb = page.locator('.availwin:visible button:has-text("✕")').first(); if (await xb.count()) { if (PHONE) await xb.tap(); else await xb.click(); await sleep(300) }
// Ranger onto briefing: conflict
say('seat Ranger on BRIEFING', await X.seat(w, `[data-fill="${gslot}.+"]`, 'bane'))
let wns = await X.boardWarn(w)
await X.pic(w, `4-8-conflict-${P}`)
R('Ranger put on BRIEFING 13:10-13:20 (flight 12:00, assumed landing 13:00, dekit to 13:30)', 'Conflict: VL BFM (landing assumed? 13:00, dekit to 13:30) & BRIEFING 13:10-13:20', JSON.stringify(wns), wns.some(l => /Conflict:/.test(l)) ? 'RECORDED' : 'FAIL', `4-8-conflict-${P}.png`)
// ALL AVAIL membership while Ranger conflicts: window excludes him
const wa2 = await H.openAvail(w, gslot)
R('ALL AVAIL window (briefing 13:10-13:20) after Ranger is on it', 'Ranger not in ALL AVAIL', `Ranger listed: ${/Ranger/.test(JSON.stringify(wa2))}; ${JSON.stringify(wa2).slice(0, 200)}`, /Ranger/.test(JSON.stringify(wa2)) ? 'FAIL' : 'PASS', '')
{ const xb2 = page.locator('.availwin:visible button:has-text("✕")').first(); if (await xb2.count()) { if (PHONE) await xb2.tap(); else await xb2.click(); await sleep(300) } }
// move the item out of the window: 13:40-13:50
await H.setF(w, `gr:${FRI}.${g0}.str`, '13:40'); await H.setF(w, `gr:${FRI}.${g0}.end`, '13:50')
wns = await X.boardWarn(w)
await X.pic(w, `4-9-moved-out-${P}`)
R('BRIEFING moved to 13:40-13:50 (after dekit 13:30)', 'conflict gone', JSON.stringify(wns), wns.some(l => /Conflict:/.test(l)) ? 'FAIL' : 'PASS', `4-9-moved-out-${P}.png`)
// back in window and type landing 12:30 (dekit to 13:00); item at 13:10 then clear
await H.setF(w, `gr:${FRI}.${g0}.str`, '13:10'); await H.setF(w, `gr:${FRI}.${g0}.end`, '13:20')
wns = await X.boardWarn(w)
R('BRIEFING back to 13:10-13:20', 'conflict returns', JSON.stringify(wns), wns.some(l => /Conflict:/.test(l)) ? 'PASS' : 'FAIL', '')
await H.setF(w, `ff:${FRI}.${wi}.0.ld`, '12:30')
wns = await X.boardWarn(w)
await X.pic(w, `4-10-landing-typed-${P}`)
R('landing typed 12:30 (dekit to 13:00)', 'conflict gone (13:10 is after dekit)', JSON.stringify(wns), wns.some(l => /Conflict:/.test(l)) ? 'FAIL' : 'PASS', `4-10-landing-typed-${P}.png`)
const wa3 = await H.openAvail(w, gslot)
R('ALL AVAIL window after landing typed and Ranger on the row', 'RECORD (Ranger is on the row, so not in the free list)', `Ranger listed: ${/Ranger/.test(JSON.stringify(wa3))}`, 'RECORDED', '')
{ const xb3 = page.locator('.availwin:visible button:has-text("✕")').first(); if (await xb3.count()) { if (PHONE) await xb3.tap(); else await xb3.click(); await sleep(300) } }
// rotate destination: duty desk and sim seat with Ranger armed -> roster class
const rot = {}
const fills = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.fill))
say('FILLS', JSON.stringify(fills))
const dFill = fills.find(f => /^d:4\./.test(f)), sFill = fills.find(f => /^s:4\./.test(f)), aFill = fills.find(f => /^a:4\./.test(f))
for (const [nm, sel] of [['duty desk ' + dFill, `[data-fill="${dFill}"]`], ['sim seat ' + sFill, `[data-fill="${sFill}"]`], ['programme row ' + aFill, `[data-fill="${aFill}"]`], ['ground seat BRIEFING B', `[data-fill="${gs1}.+"]`]]) {
  try { const k = await H.arm(w, sel); const rr = await H.rosterRead(w); rot[nm] = { armed: k, rpuck: rr.rpuck }; await H.disarm(w) } catch (e) { rot[nm] = 'ERR ' + e.message.slice(0, 60) }
}
R('Ranger (flies 12:00-12:30 landing typed) in the crew list for other destinations', 'RECORD', JSON.stringify(rot), 'RECORDED', '')
await X.fin(w)
