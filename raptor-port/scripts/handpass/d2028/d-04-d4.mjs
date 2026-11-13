/* d-04-d4 v1 — D4: the sim twin (desktop). usage (from raptor-port/): node scripts/handpass/d2028/d-04-d4.mjs [pc|phone] */
const KIND = process.argv[2] || 'pc'
const SEAT = process.argv[3] || 'p'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/d4-' + KIND + (SEAT === 'p' ? '' : '-seat' + SEAT)
console.log('d-04-d4 v1', KIND, process.env.HP_SHOTS)
const D = await import('./d-lib.mjs')
const { X, L, sleep, j, row, FRI } = D
const w = await D.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'P' : 'D'
console.log('bundle', await D.bundle(page))
const ranger = w.ID('Ranger')
await L.board(page, FRI)
const n0 = await page.evaluate(i => window.DAYS[i].sims.oft.length, FRI)
await X.press(w, `[data-sradd="${FRI}.oft"]`)
await page.waitForFunction(([i, n]) => window.DAYS[i].sims.oft.length === n + 1, [FRI, n0]); await sleep(300)
const ri = n0
await X.typeIn(w, `[data-bfld="sr:${FRI}.oft.${ri}.label"]`, 'OFT Brief')
await X.typeIn(w, `[data-bfld="sr:${FRI}.oft.${ri}.str"]`, '0900')
console.log('seat ALL AVAIL', await D.drop(w, `s:${FRI}.oft.${ri}.${SEAT}`, 'allavail').catch(e => 'ERR ' + e.message.split('\n')[0]))
console.log('sim row', await page.evaluate(([i, r]) => JSON.stringify(window.DAYS[i].sims.oft[r]), [FRI, ri]))
const g = await D.addGround(w, FRI, 'Ground Programme', '10:35', '10:55', ranger)
console.log('ground', j(g))
await D.shot(page, 'd4-0-board-built')
const p = await D.pub(w, FRI)
console.log('published', j(p.pressed), j(p.head))
const s4 = await D.signFour(w, FRI)
console.log('signed four again', j(s4.head && s4.head.signs))
await L.closeBoard(page)
const rx = /OFT Brief|ALL AVAIL/
const before = {}
for (const s of ['view', 'edit', 'board']) before[s] = await D.readOne(w, s, 'd4-1-before', FRI, rx)
before.face = await D.face(w, 'd4-1-before', FRI)
console.log('BEFORE', j(before))
const lg = await D.setLogic(w, 'simLen', '3h', 'd4-2-logic-3h')
console.log('logic', j(lg))
const after = {}
for (const s of ['view', 'edit', 'board']) after[s] = await D.readOne(w, s, 'd4-3-after', FRI, rx)
after.face = await D.face(w, 'd4-3-after', FRI)
console.log('AFTER', j(after))
row(`D4-${P}`, 'RECORD', j({ before, lg, after }))
D.finish(w, 'd4-' + KIND + (SEAT === 'p' ? '' : '-seat' + SEAT))
await w.browser.close()
