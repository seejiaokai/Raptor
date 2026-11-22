// sud-w5-a3 — A3: an armed seat uses its own day and activity (flying, OFT, AMT; then a filed OFT-only 09:00–10:00
// offer: a fitting OFT seat, an afternoon OFT seat, flying, AMT, a briefing). D2338 walk, 23 Nov 26, chat 147.
// Run from raptor-port/:  RUN=<folder> ONLY=a3d,a3p node scripts/handpass/sud-w5-a3.mjs
import { L, S, run, NOTE17, TODAYW, crewOf, crewLine, firstShown, clip, moveClock, commit, addWave, addSim, armRead, disarm } from './sud-w5-lib.mjs'
const { J, HEX, sleep } = L
const VERSION = 'sud-w5-a3 v4'
const ONLY = (process.env.ONLY || 'a3d,a3p').split(',')
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const FRI = 4
const said = r => { const x = firstShown(r.c); return x ? (x.printed || '') : '' }
const why = r => { const x = firstShown(r.c); return x ? (x.why || '') : '' }

async function a3(p, W) {
  const po = await L.postOut(p, W, HEX, '2026-07-17', 'a3-01')
  W.rec('a3-01', 'Wed 15: Hex posted out as SANS from Fri 17 Jul (read back)', /17 Jul: becomes SANS/.test(po.line), `line "${po.line}"`, po.pic)
  /* Fri 17 has no flying and no AMT in the demo world: a flying wave, an AMT row and a short OFT row are made on the board */
  const wv = await addWave(p, W, FRI, 'AA1', '12:00', '13:30')
  const am = await addSim(p, W, FRI, 'amt', 'AMT1', '11:00', '12:00')
  const of = await addSim(p, W, FRI, 'oft', 'OFTA', '09:00', '10:00')
  /* an afternoon OFT row with empty seats of its own (EP-6's seats hold pucks: a phone tap there picked Wildcard) */
  const op = await addSim(p, W, FRI, 'oft', 'OFTP', '14:00', '15:00')
  W.rec('a3-02', 'Fri 17 board: + Wave → Flying wave AA1 12:00–13:30; AMT row AMT1 11:00–12:00; OFT rows OFTA 09:00–10:00 and OFTP 14:00–15:00 (read back)', !!(wv.f && am.r && of.r && op.r && am.r.str && of.r.str && op.r.str), `wave ${wv.wi} ${J(wv.f)} · AMT[${am.ri}] ${J(am.r)} · OFT[${of.ri}] ${J(of.r)} · OFT[${op.ri}] ${J(op.r)}`, await W.pic(p, 'a3-02-fixture'))
  const seat = `[data-slot="${FRI}.${wv.wi}.0.0.w"]`
  const oftS = `[data-slot="s:${FRI}.oft.${of.ri}.w"]`, amtS = `[data-slot="s:${FRI}.amt.${am.ri}.w"]`
  const zoneOr = async (sel, alt) => (await p.locator(L.B(sel)).count()) ? sel : alt

  /* Edit Schedule: the crew panel on Thu 16, then a seat on Friday's card pressed */
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const d0 = await S.crewPanelTo(p, W, 'thu')
  /* on the phone the crew drawer covers the week: a person closes it to reach Friday's card (it opens again below) */
  await S.crewPanelClose(p, W)
  const card = p.locator(`#eWeek ${seat}`).first()
  let es = 'no seat on the card'
  if (await card.count()) {
    await card.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
    if (W.isPhone) await card.tap(); else await card.click()
    await sleep(600)
    const armed = await p.evaluate(() => window.ARM && window.ARM.key)
    let opened = 'already shown'
    if (W.isPhone) {
      const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
      if (!shown) { await W.press(p, '#rosTab', 'crew-tab'); opened = 'opened by its tab' }
    }
    const day = ((await p.locator('.ros-body .er-dayname').first().textContent().catch(() => '')) || '').trim() + ' (drawer ' + opened + ')'
    const head = ((await p.locator('.ros-body').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').slice(0, 60)
    const c = await crewOf(p, '.ros-body')
    const pc = await clip(p, W, p.locator(`.ros-body .rpuck[data-person="${HEX}"]`).first(), 'a3-03-week-armed')
    const x = firstShown(c)
    W.rec('a3-03', `Edit Schedule: crew panel on ${d0}, a flying seat on Fri 17's card pressed: Hex's printed reason is Fri 17's look-ahead words`, !!(x && (x.printed === NOTE17)), `armed ${armed} · panel day now "${day}" · panel head "${head}" · ${crewLine(c)}`, [pc, await W.pic(p, 'a3-03-week-armed')].filter(Boolean).join(', '))
    await disarm(p, W)
  } else W.rec('a3-03', 'Edit Schedule: a flying seat on Friday\'s card', 'NW', es, await W.pic(p, 'a3-03-noseat'))
  await S.crewPanelClose(p, W)

  /* the board, Fri 17: each kind of seat armed */
  await L.openBoard(p, W, FRI)
  for (const [sel, nm, id] of [[seat, 'the AA1 flying seat (WSO)', 'a3-04'], [await zoneOr(oftS, `[data-fill="s:${FRI}.oft.${of.ri}.+"]`), 'the OFTA OFT seat', 'a3-05'], [await zoneOr(amtS, `[data-fill="s:${FRI}.amt.${am.ri}.+"]`), 'the AMT1 seat', 'a3-06']]) {
    const r = await armRead(p, W, sel, id)
    W.rec(id, `Wed 15, board Fri 17, ${nm} armed (${r.armed}): Hex struck, the look-ahead words printed under his name`, said(r) === NOTE17, crewLine(r.c), r.pic)
    await disarm(p, W)
  }
  await L.closeBoard(p, W)

  /* Friday arrives; Saber files Hex's OFT-only 09:00–10:00 */
  const t = await moveClock(p, W, '2026-07-17T08:00:00')
  W.rec('a3-07', "clock set to Fri 17 Jul 08:00 (setSystemTime), reloaded, Saber signed in: the app's today", /Fri Jul 17 2026/.test(t), t)
  const c = await commit(p, W, '2026-07-17', HEX, ['oft'], ['09:00', '10:00'], 'a3-08')
  W.rec('a3-08', 'Saber: Inputs → SANS → Fri 17 Jul → + Commitment, Hex, OFT only, 09:00–10:00, Add (read back)', !!(c.rec && c.rec.person === HEX && c.rec.sans && c.rec.sans.o && !c.rec.sans.f), `record ${J(c.rec)}${c.noPerson ? ' · Hex NOT OFFERED: ' + c.opts.join(',') : ''}`, c.pic)
  await L.openBoard(p, W, FRI)
  const un = await crewOf(p, '#schedBoard')
  W.rec('a3-09', 'board Fri 17, nothing armed, after the filing: no "nothing filed" words for Hex', !/no availability filed/.test((firstShown(un) || {}).title || ''), crewLine(un), await clip(p, W, `#schedBoard .rpuck[data-person="${HEX}"]:visible`, 'a3-09'))
  const cases = [
    [await zoneOr(oftS, `[data-fill="s:${FRI}.oft.${of.ri}.+"]`), 'OFTA 09:00–10:00 (fits his offer)', 'a3-10', x => !/SANS/.test(x), 'no SANS reason'],
    /* EP-6's empty extra seat (its "+" box under Wildcard), never the row's middle, where a puck stands on a phone */
    [`[data-slot="s:${FRI}.oft.${op.ri}.w"]`, 'OFTP 14:00–15:00 (afternoon) WSO seat', 'a3-11', x => x === 'SANS — available 09:00–10:00 only', '"SANS — available 09:00–10:00 only"'],
    [seat, 'the AA1 flying seat 12:00–13:30', 'a3-12', x => x === 'SANS — not offering Fly', '"SANS — not offering Fly"'],
    [await zoneOr(amtS, `[data-fill="s:${FRI}.amt.${am.ri}.+"]`), 'the AMT1 seat 11:00–12:00', 'a3-13', x => x === 'SANS — not offering AMT', '"SANS — not offering AMT"'],
    [`[data-fill="g:${FRI}.0.+"]`, 'the GROUND SCHOOL - EW row 09:00–11:00 (a briefing)', 'a3-14', x => !/SANS/.test(x), 'no SANS (flying-availability) stop'],
  ]
  for (const [sel, nm, id, judge, want] of cases) {
    const r = await armRead(p, W, sel, id)
    const x = firstShown(r.c) || {}
    W.rec(id, `Fri 17 after the filing, ${nm} armed (${r.armed}): ${want}`, r.armed ? judge(x.printed || x.why || '') : 'NW', `printed "${x.printed || ''}" · data-why "${x.why || ''}" · struck ${x.struck} · ${crewLine(r.c)}`, r.pic)
    await disarm(p, W)
  }
  await L.closeBoard(p, W)
}

const FN = { a3 }
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run(name, sz, FN[name]) }
L.saveResults('a3-' + ONLY.join('_'))
console.log('done')
