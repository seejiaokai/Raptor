/* d-07-d5 v1 — D5: every place the ALL AVAIL puck can be put (desktop). usage (from raptor-port/): node scripts/handpass/d2028/d-07-d5.mjs [pc|phone] */
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/d5-' + KIND
console.log('d-07-d5 v1', KIND, process.env.HP_SHOTS)
const D = await import('./d-lib.mjs')
const { X, L, sleep, j, row, FRI } = D
const w = await D.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'P' : 'D'
console.log('bundle', await D.bundle(page))
const ranger = w.ID('Ranger'), blade = w.ID('Blade'), cobra = w.ID('Cobra')
const tryDrop = async (what, fill, id) => { const r = await D.drop(w, fill, id).catch(e => 'ERR ' + e.message.split('\n')[0]); console.log('DROP', what, fill, id, '->', r); return r }

// (a) Ground Programme row with ALL AVAIL on it
const ga = await D.addGround(w, FRI, 'Ground A', '09:00', '', null).catch(async e => { console.log('addGround a err', e.message.split('\n')[0]); return null })
console.log('ground a', j(ga))
const gai = ga ? ga.ri : null
if (gai != null) await tryDrop('a ground', `g:${FRI}.${gai}.+`, 'allavail')
// Ranger's own ground row 10:15-10:45
const gr = await D.addGround(w, FRI, 'Ranger ground', '10:15', '10:45', ranger)
console.log('ranger ground', j(gr))
// (b) duty desk, ALL AVAIL as its holder
await L.board(page, FRI)
const dn0 = await page.evaluate(i => window.DAYS[i].dutywaves[0].rows.length, FRI)
await X.press(w, `[data-dradd="${FRI}.0"]`)
await page.waitForFunction(([i, n]) => window.DAYS[i].dutywaves[0].rows.length === n + 1, [FRI, dn0]); await sleep(300)
await X.typeIn(w, `[data-bfld="dr:${FRI}.0.${dn0}.role"]`, 'Desk B')
await X.typeIn(w, `[data-bfld="dr:${FRI}.0.${dn0}.str"]`, '0900')
await tryDrop('b duty holder', `d:${FRI}.0.${dn0}`, 'allavail').then(async r => { if (/FAILED|ERR/.test(r)) await tryDrop('b duty fill', `d:${FRI}.0.${dn0}.+`, 'allavail') })
console.log('duty row', await page.evaluate(([i, r]) => JSON.stringify(window.DAYS[i].dutywaves[0].rows[r]), [FRI, dn0]))
// (c) Common Programme row with a named man + ALL AVAIL on its extra-people line
const c = await D.addCommon(w, FRI, 'Common C', '09:00')
console.log('common c', j(c))
await tryDrop('c named man', `a:${FRI}.${c.ri}.+`, blade)
await tryDrop('c ALL AVAIL extras', `a:${FRI}.${c.ri}.+`, 'allavail')
console.log('common row', await page.evaluate(([i, r]) => JSON.stringify(window.DAYS[i].allhands[r]), [FRI, c.ri]))
// (d) sim: a named man in the seat, ALL AVAIL as a passenger
await L.board(page, FRI)
const sn0 = await page.evaluate(i => window.DAYS[i].sims.oft.length, FRI)
await X.press(w, `[data-sradd="${FRI}.oft"]`)
await page.waitForFunction(([i, n]) => window.DAYS[i].sims.oft.length === n + 1, [FRI, sn0]); await sleep(300)
await X.typeIn(w, `[data-bfld="sr:${FRI}.oft.${sn0}.label"]`, 'Sim D')
await X.typeIn(w, `[data-bfld="sr:${FRI}.oft.${sn0}.str"]`, '0900')
await tryDrop('d sim seat named', `s:${FRI}.oft.${sn0}.p`, cobra)
await tryDrop('d sim passenger', `s:${FRI}.oft.${sn0}.x0`, 'allavail').then(async r => { if (/FAILED|ERR/.test(r)) await tryDrop('d sim passenger via +', `s:${FRI}.oft.${sn0}.+`, 'allavail') })
console.log('sim row', await page.evaluate(([i, r]) => JSON.stringify(window.DAYS[i].sims.oft[r]), [FRI, sn0]))
await D.shot(page, 'd5-0-board-built')
const pr = await page.evaluate(i => { const d = window.DAYS[i]; return JSON.stringify({ g: d.ground.map(x => [x.prog, x.str, x.end, x.who, x.more]), duty: d.dutywaves[0].rows.map(x => [x.role, x.str, x.end, x.id, x.more]), ah: d.allhands.map(x => [x.prog, x.str, x.end, x.who, x.more]), sim: d.sims.oft.map(x => [x.label, x.str, x.end, x.p, x.w, x.more, x.pax]) }) }, FRI)
console.log('ROWS BUILT', pr)
await L.closeBoard(page)
const p = await D.pub(w, FRI)
console.log('published', j(p.pressed), j(p.head && { tag: p.head.tag, pending: p.head.pending }))
const s4 = await D.signFour(w, FRI)
console.log('signed four again', j(s4.head && s4.head.signs))
await L.closeBoard(page)

async function readEvery(tag) {
  const out = {}
  for (const s of ['view', 'edit', 'board']) {
    await D.toSurface(w, s, FRI)
    const c = await D.chips(w, s, FRI)
    out[s] = []
    for (let i = 0; i < c.length; i++) {
      if (s === 'board') await D.toSurface(w, s, FRI)
      const o = await D.readAA(w, s, FRI, i, `${tag}-${s}-${i}`)
      const ns = await D.names(w, o.text)
      out[s].push({ i, row: c[i].row, chip: o.chip, title: o.title, n: ns.length, ranger: ns.includes('Ranger'), people: ns.join(',') })
    }
  }
  out.face = await D.face(w, tag, FRI)
  console.log('EVERY', tag, j(out))
  return out
}
const before = await readEvery('d5-1-before')
const l1 = await D.setLogic(w, 'openEnd', '2h', 'd5-2-logic-2h')
const l2 = await D.setLogic(w, 'simLen', '3h', 'd5-2-logic-3h')
console.log('logic', j(l1), j(l2))
const after = await readEvery('d5-3-after')
row(`D5-${P}`, 'RECORD', j({ pr, before, l1, l2, after }))
D.finish(w, 'd5-' + KIND)
await w.browser.close()
