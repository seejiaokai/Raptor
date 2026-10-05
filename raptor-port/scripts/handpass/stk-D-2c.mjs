/* Walker D, world 2c: P4c-04 (reordered sections, on Sunday of the built world) and two probes for P4c-03 (reload; the focus after the last input box) */
import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, boxList, walkForward, walkBack, clickBox, caret, caretIdx, label, snap, same, sleep, pic, row, savePart, scopeSel, ensureHelper, tap, type } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false, state: process.env.STK_STATE })
page.setDefaultTimeout(9000)
async function S(id, did, fn) {
  try {
    const r = await fn()
    const bad = r.checks.filter(c => !c[1])
    row(id, did, r.checks.map(c => `${c[1] ? '✓' : '✗'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 400) + ']' : ''}`).join(' · '), r.verdict || (bad.length ? 'FAIL' : 'PASS'), r.pics || [])
  } catch (e) { row(id, did, 'ERROR ' + String(e.message || e).slice(0, 500), 'NOT WALKED (script error — re-run)', [await pic(page, 'ERR-' + id)]) }
  savePart('world2c')
}
const typeNow = async txt => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 8 }) }
const iid = await page.evaluate(() => window.INPUTS.find(i => /TAB/.test(i.remarks || '')).iid)
const gi = await page.evaluate(i => window.DAYS[5].ground.findIndex(r => r.src === i), iid)

/* ---------- probe 1: edit the programme row of an input-owned row, reload, read both ---------- */
await openBoard(page, 5)
await S('P4c-03-probe-reload', 'Board, Saturday: typed 10:15 into the input\'s PROGRAMME row start, Tab; reloaded and signed in again; read the input and the row', async () => {
  const sb = scopeSel('board', 5)
  const list = await boxList(page, sb); const ix = list.findIndex(b => b.key === `gr:5.${gi}.str`)
  await clickBox(page, sb, ix); await typeNow('10:15'); await page.keyboard.press('Tab'); await sleep(500)
  const before = await page.evaluate(([i, g]) => ({ input: window.INPUTS.find(x => x.iid === i).s, row: window.DAYS[5].ground[g].str }), [iid, gi])
  await H.lib.go(page, 'editsched').catch(() => {})
  await sleep(1500)
  await page.reload(); await H.lib.login(page, 'a'); await sleep(800)
  const after = await page.evaluate(([i]) => { const g = window.DAYS[5].ground.find(r => r.src === i); return { input: window.INPUTS.find(x => x.iid === i).s, row: g ? g.str : 'ROW MISSING' } }, [iid])
  return { checks: [['before reload: the row says 10:15, the input says ' + before.input + ' (660 = 11:00)', true, before], ['after reload: row and input', true, after]], verdict: 'RECORDED' }
})

/* ---------- probe 2: where the caret is after Tab out of the LAST input echo box, over time ---------- */
await nav(page, 'editsched')
await openBoard(page, 5)
await S('P4c-03-probe-caret', 'Board, Saturday: Tab out of the input\'s Remarks echo box (typed text first); read where the caret is at once, after 100 ms and after 600 ms', async () => {
  const sb = scopeSel('board', 5)
  const rowsNow = () => page.evaluate(() => document.querySelectorAll('#sbBoard .pinp .sb-arow, #sbBoard .pinp .sbi-row').length)
  if (!(await rowsNow())) { await page.locator('#sbBoard [data-pitog="5"]:visible').first().click(); await sleep(500) }
  const list = await boxList(page, sb); const ix = list.findIndex(b => b.key === `${iid}.rmks`)
  await clickBox(page, sb, ix); await typeNow('CARET PROBE')
  const reads = []
  await page.keyboard.press('Tab')
  reads.push(['0', label(await caret(page))]); await sleep(100); reads.push(['100ms', label(await caret(page))]); await sleep(500); reads.push(['600ms', label(await caret(page))])
  return { checks: [['caret over time', true, reads]], verdict: 'RECORDED' }
})

/* ---------- P4c-04: reorder on Sunday ---------- */
await page.setViewportSize({ width: 1440, height: 2100 })
await nav(page, 'editsched')
await openBoard(page, 6)
// a flying wave on Sunday so Flying has boxes
await tap(page, '[data-wvadd="6"]')
await page.getByRole('button', { name: 'Flying wave', exact: true }).click(); await sleep(600)
await type(page, '[data-bfld="ff:6.0.0.cs"]', 'SUNDAY')
await type(page, '[data-bfld="ff:6.0.0.to"]', '10:00')
await type(page, '[data-bfld="ff:6.0.0.ld"]', '11:00')
async function order(scope) { return page.evaluate(s => [...document.querySelectorAll(`${s} [data-secmove]`)].map(e => ({ k: e.getAttribute('data-secmove').split('.')[1], top: Math.round(e.getBoundingClientRect().top + scrollY) })).sort((a, b) => a.top - b.top).map(e => e.k), scope) }
async function grab(scope, fromK, toK, where = 'top') {
  const g = page.locator(`${scope} [data-secmove="6.${fromK}"] .secgrip`).first()
  await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  const a = await g.boundingBox(); const t = await page.locator(`${scope} [data-secmove="6.${toK}"]`).first().boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  await page.mouse.move(t.x + Math.min(t.width / 2, 200), where === 'top' ? t.y + 6 : t.y + t.height - 6, { steps: 14 }); await sleep(150)
  await page.mouse.up(); await sleep(700)
}
const o0 = await order('#sbBoard')
console.log('Sunday order before', JSON.stringify(o0))
await pic(page, 'P4c-04-board-before')
await grab('#sbBoard', 'ground', 'waves', 'top')
const o1 = await order('#sbBoard'); console.log('after ground->before waves', JSON.stringify(o1))
await grab('#sbBoard', 'prog', 'duty', 'top')
const o2 = await order('#sbBoard'); console.log('after prog->before duty', JSON.stringify(o2))
await pic(page, 'P4c-04-board-after-drags')
for (const surf of ['board', 'week']) {
  if (surf === 'week') { await H.nav(page, 'editsched') } else { await openBoard(page, 6) }
  const scope = surf === 'board' ? '#sbBoard' : scopeSel('week', 6)
  await S('P4c-04-' + surf, `${surf === 'board' ? 'Board' : 'Week'}, Sunday: sections dragged by their grips so Ground sits before Flying and Common Programme after it; Tabbed forward over the whole day (headings and notes) then Shift+Tab back`, async () => {
    await ensureHelper(page)
    const sc = await order(surf === 'board' ? '#sbBoard' : '#eWeek > .day[data-day="6"]')
    const fw = await walkForward(page, scope, { keepStops: true })
    await page.keyboard.press('Tab'); await sleep(150)
    const bk = await walkBack(page, scope)
    const secSeq = fw.list.map(b => b.sec).filter((x, i, a) => i === 0 || a[i - 1] !== x).map(s => s.split('.')[1])
    const pics = [await pic(page, `P4c-04-${surf}-after-route`)]
    const exp = sc.filter(k => secSeq.includes(k))
    return { checks: [
      ['the day\'s displayed section order after the drags (Ground before Flying; Common Programme after Flying)', sc.indexOf('ground') < sc.indexOf('waves') && sc.indexOf('waves') < sc.indexOf('prog'), sc],
      [`forward route: all ${fw.n} open boxes in order, section by section = the displayed order`, fw.bad.length === 0 && JSON.stringify(secSeq) === JSON.stringify(exp), { bad: fw.bad.slice(0, 3), routeSections: secSeq, displayed: exp }],
      ['backward route is the exact mirror', bk.bad.length === 0, bk.bad.slice(0, 3)],
      ['each section\'s own note box is reached inside its section (notes: dn, pn, dtn, sn, gn)', ['dn:6', 'pn:6', 'dtn:6', 'sn:6', 'gn:6'].every(k => fw.list.some(b => b.key.startsWith(k.split(':')[0]))), fw.list.filter(b => /^(dn|pn|dtn|sn|gn)$/.test(b.key.split(':')[0]) || /^(dn|pn|dtn|sn|gn):/.test(b.key)).map(b => b.key + '@' + b.sec)],
      ['nothing written', fw.noWrite && bk.noWrite],
    ], pics }
  })
}
console.log('ERRORS', JSON.stringify(errors))
row('ERRORS-world2c', 'console / page errors / 4xx during world 2c', errors.length ? errors.join(' || ') : 'none', errors.length ? 'FINDING' : 'PASS')
savePart('world2c', { errors })
await browser.close()
