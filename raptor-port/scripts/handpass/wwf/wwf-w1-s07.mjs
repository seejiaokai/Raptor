/* wwf w1 scenario 7 — every illegal-seat producer. usage: [PHONE=1] [RUN=x] node scripts/handpass/wwf/wwf-w1-s07.mjs */
import * as H from './wwf-w1-lib.mjs'
const PHONE = process.env.PHONE === '1'
const X = await H.init(process.env.RUN || (PHONE ? 's07-p' : 's07'))
const { say, sleep, row, pic } = X
const w = await X.open({ phone: PHONE })
const { page } = w
const S = 'S7', SZ = PHONE ? 'phone' : 'desktop'
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); return null } }
const toastRead = () => page.evaluate(() => [...document.querySelectorAll('.toast, #toast, [role=status], .passnote, .snote, #note')].filter(e => e.offsetWidth && e.innerText.trim()).map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' | '))
let counter = 0
const place = async (tag, slotSel, id, expectRe) => {
  counter++
  const t0 = Date.now()
  const res = await X.seat(w, slotSel, id)
  const toast = await toastRead()
  const warns = (await X.boardWarn(w)).filter(l => /seat/i.test(l))
  await pic(w, `${String(counter).padStart(2, '0')}-${tag}-${id}`)
  say('PLACE', tag, id, res, 'toast:', toast, '| seat warnings:', JSON.stringify(warns))
  return { res, toast, warns }
}
const res = []
const mkrow = (sc, did, exp, r, id, name) => {
  const ok = r.res === 'ok'
  const ill = r.warns.filter(l => new RegExp(name, 'i').test(l) && /Illegal seat/.test(l))
  const wrong = r.warns.filter(l => /Wrong seat/i.test(l))
  const verdict = !ok ? 'NOT WALKED' : (ill.length && !wrong.length ? 'PASS' : 'FAIL')
  row(sc, SZ, did, exp, `seat ${r.res}; note: ${r.toast}; warnings: ${JSON.stringify(r.warns)}`, verdict, 'w1/' + (process.env.RUN || (PHONE ? 's07-p' : 's07')))
}
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
const DAY = 1
await X.board(w, DAY)
const wave = async kind => {
  const n0 = await page.evaluate(d => window.DAYS[d].waves.length, DAY)
  await X.press(w, `[data-wvadd="${DAY}"]`, { scope: 'board' }); await sleep(300)
  await X.press(w, `.wavemenu [data-wmkind="${kind}"]`); await sleep(700)
  return n0
}
const people = [['rocky', 'Hex', 'WSO'], ['spanner', 'Cotter', 'ground crew']]
// AVALON (MAIN front = aircraft 0, SPARE front = aircraft 2) and BB sibling
const av = await wave('avalon')
const bb = await wave('bb')
say('waves', av, bb)
for (const [k, v] of [['to', '19:00'], ['ld', '07:00']]) for (const n of [0, 2]) { const b = page.locator(`#schedBoard [data-bfld="ff:${DAY}.${bb}.0.${k}"]:visible`).nth(n); await b.fill(v); await b.blur(); await sleep(250) }
say('bb hours', await page.evaluate(([d, i]) => JSON.stringify(window.DAYS[d].waves[i].formations[0]), [DAY, bb]).then(s => s.slice(0, 300)))
for (const [id, nm, kind] of people) {
  const r1 = await place('avalon-main', `[data-slot="${DAY}.${av}.0.${id === 'rocky' ? 0 : 1}.p"]`, id)
  mkrow(S + ' AVALON MAIN', `${kind} ${nm} in AVALON MAIN front seat`, 'Illegal seat: names the person, AVALON MAIN and hours', r1, id, nm)
}
{ const r = await place('avalon-spare', `[data-slot="${DAY}.${av}.0.2.p"]`, 'rocky'); mkrow(S + ' AVALON SPARE', 'WSO Hex in AVALON SPARE front seat', 'Illegal seat: Hex, AVALON SPARE, hours', r, 'rocky', 'Hex') }
{ const r = await place('bb-main', `[data-slot="${DAY}.${bb}.0.0.p"]`, 'freak'); mkrow(S + ' BB MAIN', 'WSO Echo in BB MAIN front seat', 'Illegal seat: Echo, BB MAIN, hours', r, 'freak', 'Echo') }
{ const r = await place('bb-spare', `[data-slot="${DAY}.${bb}.0.2.p"]`, 'torque'); mkrow(S + ' BB SPARE', 'ground crew Ratchet in BB SPARE front seat', 'Illegal seat: Ratchet, BB SPARE, hours', r, 'torque', 'Ratchet') }
// SC SPARE
const sc = await wave('sc')
{ const r = await place('sc-spare', `[data-slot="${DAY}.${sc}.0.2.p"]`, 'freak'); mkrow(S + ' SC SPARE', 'WSO Echo in SC SPARE front seat', 'Illegal seat: Echo, SPARE, hours', r, 'freak', 'Echo') }
{ const r = await place('sc-spare-gc', `[data-slot="${DAY}.${sc}.0.3.p"]`, 'spanner'); mkrow(S + ' SC SPARE', 'ground crew Cotter in SC SPARE front seat', 'Illegal seat: Cotter, SPARE, hours', r, 'spanner', 'Cotter') }
// ordinary flight
const fl = await wave('')
await X.typeIn(w, `[data-bfld="ff:${DAY}.${fl}.0.to"]`, '09:00'); await X.typeIn(w, `[data-bfld="ff:${DAY}.${fl}.0.ld"]`, '10:00')
{ const r = await place('flight', `[data-slot="${DAY}.${fl}.0.0.p"]`, 'rocky'); mkrow(S + ' flight', 'WSO Hex in an ordinary flight front seat, TO 09:00', 'Illegal seat: formation, take-off time', r, 'rocky', 'Hex') }
const fl2 = await wave('')
await X.typeIn(w, `[data-bfld="ff:${DAY}.${fl2}.0.to"]`, '11:00'); await X.typeIn(w, `[data-bfld="ff:${DAY}.${fl2}.0.ld"]`, '12:00')
{ const r = await place('flight-gc', `[data-slot="${DAY}.${fl2}.0.0.p"]`, 'spanner'); mkrow(S + ' flight', 'ground crew Cotter in front seat of a second aircraft', 'Illegal seat: Cotter', r, 'spanner', 'Cotter') }
// negative control: a pilot in the rear seat
{ const r = await place('flight-pilot-rear', `[data-slot="${DAY}.${fl}.0.0.w"]`, 'bane'); const ill = r.warns.filter(l => /Ranger/.test(l)); row(S + ' flight', SZ, 'negative control: pilot Ranger in the rear seat', 'legal: no illegal-seat warning for Ranger', `seat ${r.res}; Ranger seat warnings ${JSON.stringify(ill)}`, r.res !== 'ok' ? 'NOT WALKED' : (ill.length ? 'FAIL' : 'PASS'), 'w1/s07') }
// OFT and AMT BOX
await X.typeIn(w, `[data-bfld="sr:${DAY}.oft.0.label"]`, 'OFT 1').catch(() => {})
await step('oft row', async () => {
  const hasOft = await page.locator(`#schedBoard [data-slot="s:${DAY}.oft.0.p"]:visible`).count()
  if (!hasOft) { await X.press(w, `[data-sradd="${DAY}.oft"]`, { scope: 'board' }); await sleep(500) }
  await X.typeIn(w, `[data-bfld="sr:${DAY}.oft.0.str"]`, '13:00'); await X.typeIn(w, `[data-bfld="sr:${DAY}.oft.0.end"]`, '15:00')
  const r = await place('oft', `[data-slot="s:${DAY}.oft.0.p"]`, 'rocky'); mkrow(S + ' OFT', 'WSO Hex in the OFT front seat, 13:00-15:00', 'Illegal seat: Hex, OFT, hours', r, 'rocky', 'Hex')
  const r2 = await place('oft-gc', `[data-slot="s:${DAY}.oft.0.w"]`, 'spanner'); say('(Cotter in OFT rear seat — a control for what a ground man in a rear sim seat does)', r2.toast, JSON.stringify(r2.warns))
})
await step('amt box', async () => {
  const hasBox = await page.locator(`#schedBoard [data-slot="s:${DAY}.amt.1.pax.0"]:visible`).count()
  if (!hasBox) { await X.press(w, `[data-sblkadd="${DAY}"]`, { scope: 'board' }); await sleep(500) }
  await X.typeIn(w, `[data-bfld="sr:${DAY}.amt.1.str"]`, '10:00'); await X.typeIn(w, `[data-bfld="sr:${DAY}.amt.1.end"]`, '12:00')
  const r = await place('amt-box', `[data-slot="s:${DAY}.amt.1.pax.0"]`, 'freak'); mkrow(S + ' AMT BOX', 'WSO Echo in the AMT BOX first seat, 10:00-12:00', 'Illegal seat or none: record what the AMT BOX says', r, 'freak', 'Echo')
})
say('FINAL board warnings', JSON.stringify(await X.boardWarn(w)))
await pic(w, '99-final-board')
await X.closeBoard(w)
await X.fin(w)
