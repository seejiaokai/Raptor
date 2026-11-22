const L = await import('./msq-pa-a-lib.mjs')
const { X, say, sleep, sj, tap, phone } = L
say('msq-pa-a-s6 v1', L.size)
const w = await L.start(true)
const p = w.page
await X.login(p, 'ad2')
const who = async () => p.evaluate(() => {
  const t = id => (document.querySelector(id)?.innerText || '')
  const n = (s, c) => ({ osprey: /Osprey/.test(s), kestrel: /Kestrel/.test(s), hunter: /Hunter/.test(s), saber: /Saber/.test(s), ranger: /Ranger/.test(s), has149only: /Osprey|Kestrel/.test(s) })
  return { page: window.CURPAGE, n: n(t('#page-' + window.CURPAGE)), head: t('#page-' + window.CURPAGE).replace(/\s+/g, ' ').slice(0, 250), people: Object.keys(window.PEOPLE || {}).length }
})
// ---- S6
for (const pg of ['inputs', 'leavewar', 'quals']) {
  await X.L.go(p, pg); await sleep(2200)
  if (pg === 'inputs' && !(await p.locator('#inNew:visible').count())) { await tap(p.locator('#inListBtn')); await sleep(800) }
  await X.pic(w, 's6-h-' + pg)
  const r = await who()
  say('S6', pg, sj(r))
  L.rep('S6', 'Hunter (Plan of 149): ' + pg + ' page, whose people', 'EXPECTED 142\'s only', 'page=' + r.page + ' Osprey(149)=' + r.n.osprey + ' Kestrel(149)=' + r.n.kestrel + ' Hunter=' + r.n.hunter + ' Saber=' + r.n.saber + ' Ranger=' + r.n.ranger + ' head=' + r.head, 'RECORDED', 's6-h-' + pg)
}
// quals: look for Osprey by a find box if any
// ---- plain-user round on Admin -> Users
await L.toUsers(w)
await X.pic(w, 'r0-users')
const O = 'Osprey'
const editOpen = () => p.locator('#page-admin .acc-edit:visible').count()
// open by header, close by header
await L.search(w, O)
await tap(L.rowBtn(w, O)); await sleep(700)
let o1 = await editOpen(); await X.pic(w, 'r1-open')
await tap(L.rowBtn(w, O)); await sleep(700)
let o2 = await editOpen(); await X.pic(w, 'r1-closed-by-header')
L.rep('Round', 'row opened then closed by its header', 'open=1 then 0', 'after open=' + o1 + ' after header again=' + o2, (o1 === 1 && o2 === 0) ? 'PASS' : 'FAIL', 'r1-open')
// Cancel
await tap(L.rowBtn(w, O)); await sleep(700)
await tap(p.locator('#accEdCancel')); await sleep(700)
let o3 = await editOpen(); await X.pic(w, 'r2-cancel')
L.rep('Round', 'row opened then Cancel', 'closed', 'open after Cancel=' + o3, o3 === 0 ? 'PASS' : 'FAIL', 'r2-cancel')
// Escape (desktop)
if (!phone) {
  await tap(L.rowBtn(w, O)); await sleep(700)
  await p.keyboard.press('Escape'); await sleep(700)
  let o4 = await editOpen(); await X.pic(w, 'r3-escape')
  L.rep('Round', 'row opened then Escape', 'RECORD (closed?)', 'open after Escape=' + o4, 'RECORDED', 'r3-escape')
  if (o4) { await tap(p.locator('#accEdCancel')); await sleep(600) }
}
// tap outside
await tap(L.rowBtn(w, O)); await sleep(700)
const outside = p.locator('#page-admin .adm-cat', { hasText: 'Data' }).first()
const ob = await p.locator('#page-admin h2, #page-admin .acc-list').first().boundingBox()
await p.mouse.click(5, 450); await sleep(700)
let o5 = await editOpen(); await X.pic(w, 'r4-tap-outside')
L.rep('Round', 'row opened then tap on empty page area outside', 'RECORD (closed?)', 'open after outside tap=' + o5, 'RECORDED', 'r4-tap-outside')
if (o5) { await tap(p.locator('#accEdCancel')); await sleep(600) }
// search typed and cleared by its x
const f = L.find(w)
await f.fill(''); await sleep(400)
await f.type('Kes', { delay: 60 }); await sleep(700)
const cnt1 = await p.locator('#page-admin button.acc-main').count()
await X.pic(w, 'r5-search-typed')
const clr = p.locator('#page-admin button[aria-label*="lear" i]:visible, #page-admin .acc-search button:visible, #page-admin .sb-x:visible, #page-admin input[type=search] ~ button:visible').first()
say('clear button count', await clr.count(), await clr.evaluate(e => e.outerHTML).catch(() => ''))
let cnt2 = -1
if (await clr.count()) { await tap(clr); await sleep(700); cnt2 = await p.locator('#page-admin button.acc-main').count() }
await X.pic(w, 'r5-search-cleared')
L.rep('Round', 'search typed "Kes" then cleared by its x', 'rows 1 then many', 'rows typed=' + cnt1 + ' after x=' + cnt2 + ' box=' + await f.inputValue(), (cnt1 === 1 && cnt2 > 10) ? 'PASS' : 'FAIL', 'r5-search-cleared')
// changes then Undo / Redo from top bar
await L.openRow(w, O)
await L.press(w, p.locator('#accEdOnOff'), 'r6-suspend')
await L.press(w, L.undoBtn(w), 'r6-undo')
let s = await L.state(w, O)
L.rep('Round', 'Suspend Osprey, Undo from top bar', 'dot green again', 'toast=' + s.toast + ' dot=' + s.row.signin, s.row.signin === 'g' ? 'PASS' : 'FAIL', 'r6-undo')
await L.press(w, L.redoBtn(w), 'r6-redo')
s = await L.state(w, O)
L.rep('Round', 'Redo from top bar', 'dot red again', 'toast=' + s.toast + ' dot=' + s.row.signin, s.row.signin === 'r' ? 'PASS' : 'FAIL', 'r6-redo')
// Quals page: Osprey's row
await X.L.go(p, 'quals'); await sleep(2200)
const q = await p.evaluate(() => { const t = document.querySelector('#page-quals')?.innerText || ''; return { osprey: /Osprey/.test(t), len: t.length, head: t.replace(/\s+/g, ' ').slice(0, 250) } })
await X.pic(w, 'r7-quals')
L.rep('Round', 'Quals page after Osprey suspended', 'RECORD Osprey row', sj(q), 'RECORDED', 'r7-quals')
await L.done(w)
