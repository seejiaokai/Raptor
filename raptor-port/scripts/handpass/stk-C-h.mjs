/* P3-16 — first twelve / Show all through every door */
import * as C from './stk-C-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)

async function rowsNow(p) {
  return p.evaluate(() => [...document.querySelectorAll('#insightModal .ibar.mission-mix-row')].map(e => ({ nm: e.querySelector('.nm').textContent, n: +(e.querySelector('.v') || {}).textContent || null, txt: e.innerText.replace(/\s+/g, ' ').trim() })))
}
const ordered = rows => rows.every((r, i) => i === 0 || rows[i - 1].n > r.n || (rows[i - 1].n === r.n && rows[i - 1].nm.localeCompare(r.nm) <= 0))
const tiles = p => p.evaluate(() => [...document.querySelectorAll('#insightModal .itile')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' / '))

async function viaDoor(p, label, openFn) {
  await openFn()
  await p.waitForSelector('#insightBody', { state: 'visible', timeout: 8000 }); await C.sleep(350)
  const t = await tiles(p)
  const twelve = await rowsNow(p)
  const btn = p.locator('[data-insights-all]:visible').first()
  const btnTxt = await btn.count() ? (await btn.innerText()).trim() : null
  const pic1 = await C.pic(p, 'p316-' + label.replace(/\W+/g, '-') + '-12')
  let all = [], less = null
  if (btnTxt) {
    await btn.click(); await C.sleep(300)
    all = await rowsNow(p)
    const pic2 = await C.pic(p, 'p316-' + label.replace(/\W+/g, '-') + '-all')
    await p.locator('[data-insights-all]:visible').first().click(); await C.sleep(300)
    less = (await rowsNow(p)).length
    var closeBtnTxt = await p.locator('[data-insights-all]:visible').first().innerText()
  }
  const hit = await p.locator('#insightClose').evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e || e.contains(h) })
  await p.locator('#insightClose').click(); await C.sleep(300)
  return { label, tiles: t, twelve, btnTxt, all, less, closeBtnTxt, hit, pics: [pic1] }
}

async function desktop() {
  const w = await C.world(); const p = w.p
  try {
    await C.tracking(p, true)
    const res = []
    await L.go(p, 'editsched')
    res.push(await viaDoor(p, 'desktop-edit', () => p.locator('#insightBtn').click()))
    await L.go(p, 'viewsched')
    res.push(await viaDoor(p, 'desktop-view', () => p.locator('#insightBtn').click()))
    await C.board(p, 0)
    res.push(await viaDoor(p, 'board-desktop', () => p.locator('#sbInsights').click()))
    return res
  } finally { await w.browser.close() }
}
async function phone() {
  const w = await C.world({ phone: true }); const p = w.p
  try {
    await C.tracking(p, true)
    const res = []
    await L.go(p, 'editsched')
    res.push(await viaDoor(p, 'phone-edit-menu', async () => { await p.locator('#editSchedMore').click(); await C.sleep(250); await p.locator('#editSchedMoreInsights').click() }))
    await L.go(p, 'viewsched')
    res.push(await viaDoor(p, 'phone-view-menu', async () => { await p.locator('#viewSchedMore').click(); await C.sleep(250); await p.locator('#viewSchedMoreInsights').click() }))
    await C.board(p, 0)
    res.push(await viaDoor(p, 'board-phone-more', async () => { await p.locator('#sbMore').click(); await C.sleep(250); await p.locator('#sbMoreInsights').click() }))
    return res
  } finally { await w.browser.close() }
}
const all = [...await desktop(), ...await phone()]
const ref = all[0]
const lines = all.map(r => `${r.label}: [${r.tiles}] twelve=${r.twelve.length} first=${r.twelve.slice(0, 3).map(x => x.nm + ' ' + x.n).join(',')} … last12=${r.twelve.slice(-1).map(x => x.nm + ' ' + x.n)}; button ${J(r.btnTxt)}; all=${r.all.length}; ordered(12)=${ordered(r.twelve)} ordered(all)=${ordered(r.all)}; after Show less ${r.less} rows, button now ${J(r.closeBtnTxt)}; close cross is what a finger lands on: ${r.hit}`)
const sameTwelve = all.every(r => J(r.twelve.map(x => x.txt)) === J(ref.twelve.map(x => x.txt)))
const sameAll = all.every(r => J(r.all.map(x => x.txt)) === J(ref.all.map(x => x.txt)))
const sameTiles = all.every(r => r.tiles === ref.tiles)
const extra = `Same first-twelve list on every door: ${sameTwelve}; same full list: ${sameAll}; same tiles: ${sameTiles}. Tied-total people in the full list (equal totals): ${J(Object.entries(ref.all.reduce((a, x) => (a[x.n] = (a[x.n] || 0) + 1, a), {})))}`
C.row('P3-16', '38 flying people already in the demo week (many equal totals), tracking On: opened Insights through desktop direct (Edit Schedule, View-only Sched), Board desktop button, and at 390×844 the Edit Schedule ⋯ menu, the View-only Sched ⋯ menu and the Board ⋯ More; pressed Show all / Show less on each',
  lines.join(' || ') + ' || ' + extra,
  sameTwelve && sameAll && sameTiles && all.every(r => r.twelve.length === 12 && r.all.length > 12 && ordered(r.all) && r.hit) ? 'PASS' : 'CHECK', all.flatMap(r => r.pics))
console.log('ERRORS', J(C.ERR))
C.save('h')
