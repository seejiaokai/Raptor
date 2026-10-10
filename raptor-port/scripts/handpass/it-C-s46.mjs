import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = process.argv[2] || 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const sb = await C.pid(p, 'Saber'), rg = await C.pid(p, 'Ranger')
const pics = []
const f = await C.fileShared(w, { iso: '2026-07-25', type: 'Event', ids: [sb, rg], title: 'Shared session', s: '09:00', e: '13:00', rmk: 'shr', oil: 'yes' })
let rows = await C.recAll(p, { remarks: 'shr' })
console.log('filed', JSON.stringify(f), JSON.stringify(rows))
await C.switchUser(w, 'us')
const mine = rows.find(r => r.person === rg)
await C.openSaved(w, '2026-07-25', mine.iid)
const i0 = await C.winInfo(p)
pics.push(await C.pic(w, 's46-ranger-shared'))
// try typing into the title
try { await p.locator('#inpEditTitle').click({ force: true, timeout: 2000 }); await p.keyboard.press('End'); await p.keyboard.type('ZZ') } catch (e) {}
const i0b = await C.winInfo(p)
// own OIL answer: open its question, read heading, cancel
let oilHead = null
if (i0.oilOwn) {
  await C.press(w, p.locator('[data-testid="oil-revise-own"]')); await sleep(500)
  oilHead = await C.oilText(p)
  const c = p.locator('[data-testid="oilconf"] .abtn.ghost').first(); if (await c.count()) { await C.press(w, c); await sleep(300) }
}
// take me out
await C.press(w, p.locator('[data-testid="inped-takeout"]')); await sleep(300)
pics.push(await C.pic(w, 's46-takeout-ask'))
await C.press(w, p.locator('[data-testid="inped-takeout-yes"]')); await sleep(700)
await C.closeWins(p)
const after = await C.recAll(p, { remarks: 'shr' })
const ok = i0.title === 'Shared session' && !i0.save && !i0.del && (i0.bodyInert) && i0b.title === 'Shared session' && i0.takeout && after.length === 1 && after[0].person === sb && after[0].title === 'Shared session'
row(46, size, 'member (Ranger) in Saber\'s shared Event', ok ? 'PASS' : 'FAIL',
  `Saber filed a shared Saturday Event "Shared session" for Saber + Ranger (${f.cnt}; OIL question asked: ${f.asked}, heading "${f.head}"). Ranger opened it: title "${i0.title}" locked (body inert ${i0.bodyInert}), Save ${i0.save}, Delete ${i0.del}, text "${i0.ro}", Take me out ${i0.takeout}, own OIL "Change..." ${i0.oilOwn}${oilHead ? ` (its question: "${oilHead.slice(0, 160)}")` : ''}; after typing ZZ title "${i0b.title}". Took himself out: records left ${after.length} (${after.map(r => r.person === sb ? 'Saber' : r.person + ' titled "' + r.title + '"').join(', ')})`, pics)
await C.finish(w, 's46-' + size)
