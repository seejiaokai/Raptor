import { world, fileInput, pic, sleep, go, openBoard, availSet, closeWin, pubDay, credits, savePart } from './aa-B-lib.mjs'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const size = process.argv[2] || 'desk'
const w = await world(size); w.tag = 's39' + size
const { page } = w
const wed = await fileInput(page, { iso: '2026-07-15', kind: 'Event', person: 'allavail', rmk: 'S39wed', s: '10:00', e: '11:30', oil: null })
const sat = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S39sat', s: '09:00', e: '12:00', oil: 'yes' })
say('filed', wed.rec && wed.rec.iid, sat.rec && sat.rec.iid)
async function readSurface(root, label, iid) {
  const els = page.locator(`${root} .oilcount[data-oilsent="i:${iid}"]`)
  const n = await els.count()
  const info = await els.evaluateAll(es => es.map(e => ({ text: e.innerText, title: e.title.slice(0, 90), inPers: !!e.closest('.pinp'), inGround: !!e.closest('.sb-arow:not(.inprow), tr') })))
  let ids = null
  for (let i = 0; i < n; i++) {
    const e = els.nth(i)
    if (!(await e.isVisible())) { await e.scrollIntoViewIfNeeded().catch(() => {}) }
    try { await e.click({ timeout: 4000 }); await sleep(500); const a = await availSet(page); if (a) { ids = a.ids; info[i].win = { n: a.ids.length, tab: a.tabs.join(' | ') } } await closeWin(page) } catch (er) { info[i].clickErr = er.message.split('\n')[0] }
  }
  say(label, 'counts found:', n, JSON.stringify(info).slice(0, 500)); return { n, info, ids }
}
const res = {}
// Edit week
await go(page, 'editsched'); await sleep(500)
for (const [k, iid] of [['wed', wed.rec.iid], ['sat', sat.rec.iid]]) { res['edit-' + k] = await readSurface('#eWeek', 'EDIT WEEK ' + k, iid) }
await pic(w, 'edit-week')
// Board
for (const [k, iid, di] of [['wed', wed.rec.iid, 2], ['sat', sat.rec.iid, 5]]) { await openBoard(page, di); res['board-' + k] = await readSurface('#schedBoard', 'BOARD ' + k, iid); await pic(w, 'board-' + k) }
// publish Saturday then view-only
await openBoard(page, 5); say('publish Sat', JSON.stringify(await pubDay(page, 5)))
await go(page, 'viewsched'); await sleep(600)
for (const [k, iid] of [['wed', wed.rec.iid], ['sat', sat.rec.iid]]) { res['view-' + k] = await readSurface('#vWeek', 'VIEW-ONLY ' + k, iid) }
await pic(w, 'view-only')
for (const k of ['wed', 'sat']) {
  const a = res['edit-' + k].ids, b = res['board-' + k].ids, c = res['view-' + k].ids
  const same = (x, y) => x && y && x.length === y.length && x.every(v => y.includes(v))
  say(k, 'same crowd — week/board:', same(a, b), 'week/view-only:', same(a, c), 'sizes', a && a.length, b && b.length, c && c.length)
  out['same-' + k] = { weekBoard: same(a, b), weekView: same(a, c) }
}
out.c = await credits(page, ['dice', 'shaft']); say('Sat credits after issue', JSON.stringify(out.c))
out.res = Object.fromEntries(Object.entries(res).map(([k, v]) => [k, { n: v.n, info: v.info }]))
out.errors = w.errors
await w.browser.close()
savePart('s39-run' + size, { out, log })
