import { histTab } from './sf-A-lib.mjs'
import { launch, ctxOpen, sleep, go, shot, openBoard, closeBoard, addStandby, seat, wave, bf, bType, errors, rec, waveShot, chips, summ, bPublish, pending, topShot, undo, redo, oilRead, dayBadge } from './sf-A-lib.mjs'
console.log('sf-A-s11 v1')
const b = await launch()
const DI = 5
const { ctx, p } = await ctxOpen(b, 's11')
const gi = await addStandby(p, DI, 'sc')
const seated = await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1]])
await openBoard(p, DI)
console.log('publish', JSON.stringify(await bPublish(p, DI)))
const key = r => `${DI}.${gi}.0.${r}`
const lit = async (li = 0) => (await chips(p, DI, gi, li)).map(c => c.chips.some(x => x.on) ? (c.chips.some(x => x.tag === 'BUTTON') ? 'B' : 'L') : (c.chips.length ? 'd' : '-')).join('')
const roles = async (li = 0) => (await chips(p, DI, gi, li)).map(c => c.role[0]).join('')
const pend = async () => { const x = (await pending(p)).join('|'); return (x.match(/(\d+) pending/) || [, '0'])[1] }
const badge = () => p.evaluate(di => (document.querySelector(`#eWeek .day[data-day="${di}"] .badge`) || {}).textContent, DI)
const oilFor = async names => (await oilRead(p)).filter(x => names.some(n => x.startsWith(n + ' '))).join(' | ')
const spare = seated[2][2], spareW = seated[2][3]
async function drag(fromSel, toSel) {
  const f = p.locator(fromSel + ':visible').first(), t = p.locator(toSel + ':visible').first()
  await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const fb = await f.boundingBox(); let tb = await t.boundingBox()
  await p.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await p.mouse.down(); await sleep(150)
  await p.mouse.move(fb.x + fb.width / 2 + 12, fb.y + fb.height / 2 + 12, { steps: 4 }); await sleep(100)
  tb = await t.boundingBox()
  await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 14 }); await sleep(200)
  await p.mouse.up(); await sleep(700)
}

/* (a) tick the SPARE row 0.2, flip its badge MAIN and back */
await p.locator(`#schedBoard [data-safly="${key(2)}"]`).click(); await sleep(500)
const a0 = { lit: await lit(), roles: await roles(), pend: await pend(), oil: await oilFor([spare]) }
await p.locator(`#schedBoard [data-sarole="${key(2)}"]`).click(); await sleep(600)
const a1 = { lit: await lit(), roles: await roles(), pend: await pend(), oil: await oilFor([spare]) }
const c1 = (await chips(p, DI, gi, 0))[2]
const hw = ((await histTab(p, /go out/)) || '').replace(/^.*?Waiting to go out/, 'Waiting to go out').slice(0, 420); await p.keyboard.press('Escape'); await sleep(300)
const pa = await waveShot(p, DI, gi, 'A-11a-1-flipped-main')
await p.locator(`#schedBoard [data-sarole="${key(2)}"]`).click(); await sleep(600)
const a2 = { lit: await lit(), roles: await roles(), pend: await pend(), oil: await oilFor([spare]) }
rec('11a', 'Pub Sat: hand-tick the SPARE, flip its badge to MAIN, flip back', 'still lit and a button both ways; pending counts both changes (2 after the flip, 1 after flipping back to the original role + tick = 1); OIL default on both ways', `ticked: ${JSON.stringify(a0)}; as MAIN: ${JSON.stringify(a1)} changes window: [${hw}] chip ${JSON.stringify(c1.chips.map(x => x.tag + (x.on ? ':on' : '')))}; back: ${JSON.stringify(a2)}`, a1.lit[2] === 'B' && a2.lit[2] === 'B' && /(HO|FO)/.test(a1.oil) && /(HO|FO)/.test(a2.oil) && a1.pend === '2' ? 'PASS' : 'RECORD', pa)

/* (b) remove both crew from the ticked row, then drag a different man on */
const seatP = `#schedBoard [data-slot="${key(2)}.p"]`, seatW = `#schedBoard [data-slot="${key(2)}.w"]`
const bd0 = await badge()
const roster = '#sbRoster'
await drag(`${seatP} .puck, ${seatP} [data-person]`, roster).catch(e => console.log('drag out P failed', e.message.slice(0, 60)))
await drag(`${seatW} .puck, ${seatW} [data-person]`, roster).catch(e => console.log('drag out W failed', e.message.slice(0, 60)))
const w1 = await wave(p, DI, gi)
const b1 = { seatedP: w1.f[0].ac[2].p, seatedW: w1.f[0].ac[2].w, lit: await lit(), pend: await pend(), badge: await badge(), badgeBefore: bd0, chipDetail: (await chips(p, DI, gi, 0))[2].chips.map(x => x.tag + ':' + x.txt + (x.on ? ':on' : '')) }
const pb = await waveShot(p, DI, gi, 'A-11b-1-emptied')
rec('11b', 'tick a SPARE, then remove both his crew from the row (dragged back to the crew list)', 'RECORD: the badge drops him (nobody seated); the chip', JSON.stringify(b1), 'RECORD', pb)
/* drag a different man in: take someone from the palette */
const other = await p.evaluate(() => { const r = [...document.querySelectorAll('#sbRoster .rpuck')].filter(e => e.offsetParent); return r.slice(0, 2).map(e => e.getAttribute('data-person')) })
console.log('palette first two', other)
const fcp = await p.evaluate(() => { const ids = [...document.querySelectorAll('#sbRoster .rpuck')].filter(e => e.offsetParent).map(e => e.getAttribute('data-person')); return ids.find(i => window.PEOPLE[i] && !window.PEOPLE[i].special && window.PEOPLE[i].seat === 'FCP') })
await drag(`#sbRoster .rpuck[data-person="${fcp}"]`, seatP).catch(e => console.log('drag in failed', e.message.slice(0, 60)))
const w2 = await wave(p, DI, gi)
const b2 = { seatedP: w2.f[0].ac[2].p, lit: await lit(), pend: await pend(), badge: await badge(), chipDetail: (await chips(p, DI, gi, 0))[2].chips.map(x => x.tag + ':' + x.txt + (x.on ? ':on' : '')), tickStored: !!(await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].aircraft[2].fly, [DI, gi])) }
const pb2 = await waveShot(p, DI, gi, 'A-11b-2-new-man')
rec('11b', 'drag a different man onto the emptied row', 'RECORD: he inherits the tick (the tick is the row\'s, not the man\'s); say whether a scheduler would expect that', JSON.stringify(b2), 'RECORD', pb2)

/* (c) drag a man from a ticked row to another unticked row */
await go(p, 'editsched'); await openBoard(p, DI)
const pre = { lit: await lit(), seats: (await wave(p, DI, gi)).f[0].ac.map(a => a.p) }
const w3 = await wave(p, DI, gi)
console.log('row2 p', w3.f[0].ac[2].p)
if (w3.f[0].ac[2].p) {
  console.log("moving", w3.f[0].ac[2].p)
  await drag(`${seatP} .puck, ${seatP} [data-person]`, `#schedBoard [data-slot="${DI}.${gi}.1.2.p"]`).catch(e => console.log('drag move failed', e.message.slice(0, 60)))
  const w4 = await wave(p, DI, gi)
  rec('11c', 'drag the ticked row\'s FCP onto another row\'s FCP seat', 'the tick stays behind on the old row (row 2 still lit), the other row not lit by it', `before lit ${pre.lit} AM seats ${pre.seats}; after: AM lit ${await lit(0)} AM seats ${w4.f[0].ac.map(a => a.p)}; PM lit ${await lit(1)} PM seats ${w4.f[1].ac.map(a => a.p)}`, 'RECORD', await waveShot(p, DI, gi, 'A-11c-moved'))
}
console.log('errors', JSON.stringify(errors))
await ctx.close(); await b.close()
