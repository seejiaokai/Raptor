// bell190 walker A — group 4: an Unavailable row's puck replaced — an Other "→ Unavailable" (week desk, Board desk,
// Board phone by tap), a leave filed on the Inputs page, a leave the Leave War approved, a medical, one man's row of a
// shared Other (and a time typed on the other man's row) [F13-F15, F17, F18, A7-A9]. Usage: node bell190-a-g4.mjs [filter]
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-g4 v4', L.LIBV)
const R = L.recorder('bell190-a-g4')
const only = process.argv[2] || ''
const { ID, J } = L
const goesU = async w => { if (await w.page.locator('[data-testid="inpEdit-goes-u"]').count()) await L.press(w, '[data-testid="inpEdit-goes-u"]'); else console.log('  NOTE: no Goes-to Unavailable button') }
/* the Leave War: Saber enters LL on a man's row, Auto-approve on */
async function lwApprove(w, pid, iso, log) {
  const p = w.page
  await L.go(p, 'leavewar'); await L.sleep(1500)
  const mon = p.locator('[data-testid="month-strip"] button').filter({ hasText: /JUL/i }).first()
  if (await mon.count()) { await mon.click(); await L.sleep(700) }
  const cell = p.locator(`[data-testid="cell-${pid}-${iso}"]`).first()
  if (!(await cell.count())) { log('  no Leave War cell ' + pid + ' ' + iso); return false }
  await cell.scrollIntoViewIfNeeded(); await cell.click(); await L.sleep(600)
  const tick = p.getByTestId('bid-approve-tick')
  if (await tick.count() && (await tick.getAttribute('aria-checked')) !== 'true') await tick.click()
  await L.shot(w, 'a-A4-war-window')
  await p.getByTestId('bid-LL').click(); await L.sleep(600)
  if (await p.getByText(/Tap the same leave again/).isVisible().catch(() => false)) { await p.getByTestId('bid-LL').click(); await L.sleep(600) }
  if (await p.getByTestId('bid-picker').isVisible().catch(() => false)) { const x = p.getByTestId('bid-cancel'); if (await x.count()) await x.click() }
  const cls = await cell.evaluate(e => e.innerHTML.slice(0, 300))
  log('  Leave War cell after: ' + cls.replace(/\s+/g, ' ').slice(0, 200))
  return true
}
/* the man's Unavailable puck on day di, the input standing behind it */
const unavOf = (p, root, di, pid) => p.evaluate(([root, pid]) => {
  const e = [...document.querySelectorAll(`${root} [data-inpseat]`)].filter(x => x.getBoundingClientRect().width > 3 && x.querySelector(`.puck[data-person="${pid}"]`))
  return e.map(x => ({ key: x.getAttribute('data-inpseat'), x: Math.round(x.getBoundingClientRect().left) }))
}, [root, pid])
const CASES = [
  { id: 'other-week-desk', kind: 'desk', door: 'week', fixture: async w => L.fileInput(w, L.WED, { type: 'Other', people: [ID.Tally], title: 'Dentist', before: goesU }), name: /Dentist|Other/ },
  { id: 'other-board-desk', kind: 'desk', door: 'board', fixture: async w => L.fileInput(w, L.WED, { type: 'Other', people: [ID.Tally], title: 'Dentist', before: goesU }), name: /Dentist|Other/ },
  { id: 'other-board-phone', kind: 'phone', door: 'board', fixture: async w => L.fileInput(w, L.WED, { type: 'Other', people: [ID.Tally], title: 'Dentist', before: goesU }), name: /Dentist|Other/ },
  { id: 'll-inputs-week-desk', kind: 'desk', door: 'week', fixture: async w => L.fileInput(w, L.WED, { type: 'LL', people: [ID.Tally] }), name: /^LL/ },
  { id: 'll-war-week-desk', man: 'rocky', kind: 'desk', door: 'week', record: true, fixture: async (w, log) => { const before = await L.ids(w.page); const ok = await lwApprove(w, ID.Hex, L.WED, log); const made = (await L.ids(w.page)).filter(x => !before.includes(x)); log('  war made inputs ' + J(made)); return made[0] || (ok ? 'war' : null) }, name: /LL|leave/i },
  { id: 'medical-week-desk', kind: 'desk', door: 'week', record: true, fixture: async w => L.fileInput(w, L.WED, { type: 'ATT C', people: [ID.Tally] }), name: /ATT|Med/i },
  { id: 'shared-other-week-desk', kind: 'desk', door: 'week', shared: true, fixture: async w => L.fileInput(w, L.WED, { type: 'Other', people: [ID.Hex, ID.Tally], title: 'Dentist', before: goesU }), name: /Dentist|Other/ },
  { id: 'shared-other-board-desk', kind: 'desk', door: 'board', shared: true, typeTime: true, fixture: async w => L.fileInput(w, L.WED, { type: 'Other', people: [ID.Hex, ID.Tally], title: 'Dentist', before: goesU }), name: /Dentist|Other/ },
]
for (const K of CASES) {
  const c = 'A4-' + K.id
  if (only && !c.includes(only)) continue
  console.log('\n=====', c)
  const log = s => console.log(s)
  let w = await L.newWorld('desk')
  try {
    await L.signIn(w, 'ad')
    const iid0 = await K.fixture(w, log)
    if (!iid0) { R(c, 'fixture', 'NOT WALKED', 'not filed'); await w.ctx.close(); continue }
    if (K.kind === 'phone') { w = await L.handOver(w, 'phone'); await L.signIn(w, 'ad') }
    const p = w.page
    let root
    if (K.door === 'week') { await L.go(p, 'editsched'); root = '#eWeek' } else { await L.openBoard(w, 2); root = '#schedBoard' }
    const MAN = K.man || ID.Tally
    const tl = (await unavOf(p, root, 2, MAN))
    const key = tl[0]?.key
    if (!key) { R(c, 'fixture', 'NOT WALKED', 'no Unavailable puck of Tally on Wed'); await w.ctx.close(); continue }
    const iid = key.split('~')[0]
    const recB = await L.rec(p, iid)
    log('  Tally\'s Unavailable row ' + key + ' input ' + J(recB))
    const n0 = await L.allNotices(p)
    const pb = `a-${c}`
    const target = `${root} [data-inpseat="${key}"] .puck[data-person="${MAN}"]`
    let d
    if (K.kind === 'phone') {
      /* tap Tally's Unavailable puck (the row's person cell arms its hand-over), then Ranger in the crew drawer */
      const t = p.locator(target).filter({ visible: true }).first(); await t.scrollIntoViewIfNeeded(); await L.sleep(300)
      const bb = await t.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await L.sleep(90)
      await L.shot(w, pb + '-2-armtap-lift'); await L.sleep(650)
      const armed = await p.evaluate(() => { try { return window.armedKey() } catch { return null } })
      const m = p.locator('#sbRoster .rpuck[data-person="bane"]').filter({ visible: true }).first()
      await m.scrollIntoViewIfNeeded(); await L.sleep(250)
      const vis = await m.evaluate(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && getComputedStyle(e).visibility !== 'hidden' })
      const mb = await m.boundingBox(); await p.touchscreen.tap(mb.x + mb.width / 2, mb.y + mb.height / 2); await L.sleep(90)
      await L.shot(w, pb + '-2-pick-lift'); await L.sleep(800)
      d = { ok: true, armed, rangerInView: vis }
    } else { await L.shot(w, pb + '-1-before'); d = await L.drag(w, `#${root === '#eWeek' ? 'eRoster' : 'sbRoster'} .rpuck[data-person="bane"]`, target, pb + '-2') }
    let note = await L.toast(p)
    await L.sleep(500)
    /* whatever question the drop raised: picture it, its words; then the plain answer (Yes / go on) */
    const q = await p.evaluate(() => { const vis = e => e && e.getBoundingClientRect().width > 3 && getComputedStyle(e).visibility !== 'hidden'; const d = [...document.querySelectorAll('[data-testid$="conf"], [data-testid*="confirm"], [role="dialog"], [data-testid^="medmove"], [data-testid^="medclash"], .askcard, [data-testid="oilwait"], .oilwait')].filter(vis); return d.map(x => ({ id: x.getAttribute('data-testid') || x.className, text: (x.innerText || '').replace(/\s+/g, ' ').slice(0, 400), btns: [...x.querySelectorAll('button')].map(b => (b.getAttribute('data-testid') || '') + '|' + (b.textContent || '').trim()) })) })
    let qpic = null
    if (q.length) { qpic = await L.shot(w, pb + '-2-question'); R(c, 'what the drop asks', 'RECORD', q, '', [qpic]) }
    const n1 = await L.allNotices(p)
    const freshQ = L.newSince(n0, n1)
    if (q.length) R(c, 'lines while the question is up', freshQ.length ? 'FAIL' : 'PASS', freshQ.map(L.fmtN), 'none before the answer')
    if (q.length) {
      const go = p.locator('button').filter({ hasText: /^(Yes|Move|Hand|Go|Replace|Swap|Continue|OK|Add|Save)/ }).filter({ visible: true }).first()
      if (await go.count()) { log('  answering: ' + (await go.textContent())); await go.click(); await L.sleep(900); note = (note + ' / ' + await L.toast(p)).trim() }
    }
    await L.shot(w, pb + '-3-after')
    const recA = await L.rec(p, iid)
    const fresh = L.newSince(n0, await L.allNotices(p))
    const changed = recA && (recA.people || []).includes('bane')
    R(c, 'the act', d.ok ? 'DONE' : 'BLOCKED', { act: d, note, inputBefore: recB, inputAfter: recA, unavNow: await unavOf(p, root, 2, ID.Ranger) }, '', [pb + '-2-carried.png', pb + '-3-after.png'])
    const all = fresh.map(L.fmtN)
    if (K.shared) {
      const j = L.judgeSet(fresh.map(n => ({ ...n, what: [...n.what].sort((a, b) => a.k.localeCompare(b.k)) })), ['bane|X|in', 'nick|X|out', 'rocky|X|add:bane,rem:nick'], { X: iid })
      R(c, 'lines written (the store)', j.ok ? 'PASS' : 'FAIL', j, 'Ranger "You were added"; Tally "You were taken off"; Hex one line "Ranger added, Tally taken off"; Saber none (F18/A8)')
    } else if (!changed) {
      R(c, 'refused or not made — lines', fresh.length ? 'FAIL' : (K.record ? 'RECORD' : 'FAIL'), { note, lines: all }, K.record ? 'RECORD what happens' : 'expected the hand-over to be made')
    } else {
      const j = L.judgeLines(fresh, { bane: 'in', [MAN]: 'out', stiff: null }, iid)
      R(c, 'lines written (the store)', K.record ? 'RECORD' : (j.ok ? 'PASS' : 'FAIL'), { judged: j.out, lines: all }, 'Ranger "You were added" · Saber; Tally "You were taken off" · Saber; one each; nothing from the Leave War')
    }
    if (K.typeTime && changed) {
      /* F18's second half: a time typed on Hex's own Unavailable row — he must not be told "taken off" + "added" */
      const hk = (await unavOf(p, root, 2, ID.Hex))[0]?.key
      const box = hk ? `${root} [data-inprow="${hk}"] [data-ifld$=".str"]` : null
      if (box && await p.locator(box).count()) {
        const m0 = await L.allNotices(p)
        await p.locator(box).first().click(); await p.keyboard.press('Control+A'); await p.keyboard.type('09:00'); await p.keyboard.press('Tab'); await L.sleep(500)
        const eb = `${root} [data-inprow="${hk}"] [data-ifld$=".end"]`
        if (await p.locator(eb).count()) { await p.locator(eb).first().click(); await p.keyboard.press('Control+A'); await p.keyboard.type('11:00'); await p.keyboard.press('Tab'); await L.sleep(700) }
        const f2 = L.newSince(m0, await L.allNotices(p))
        const hexLines = f2.filter(n => [].concat(n.to).includes('rocky'))
        const bad = hexLines.some(n => n.what.some(x => x.k === 'in' || x.k === 'out'))
        R(c, 'a time typed on Hex\'s own row (F18 second half)', bad ? 'FAIL' : 'RECORD', { hexKey: hk, note: await L.toast(p), lines: f2.map(L.fmtN) }, 'Hex not told "You were taken off" + "You were added"; only what changed for him', [await L.shot(w, pb + '-6-hex-time')])
      } else R(c, 'a time typed on Hex\'s own row', 'NOT WALKED', 'no start box on Hex\'s row: ' + hk)
    }
    if (K.door === 'board') await L.closeBoard(w)
    if (/war/.test(K.id)) {
      /* F15: does the Leave War show the leave on Ranger's row now, and is it gone from Hex's */
      await L.go(p, 'leavewar'); await L.sleep(1500)
      const mon = p.locator('[data-testid="month-JUL"]').first(); if (await mon.count()) { await mon.click(); await L.sleep(700) }
      const cells = await p.evaluate(() => ['bane', 'rocky'].map(id => { const e = document.querySelector(`[data-testid="cell-${id}-2026-07-15"]`); if (!e) return id + ': no cell'; e.scrollIntoView({ block: 'center', inline: 'center' }); return `${id}: "${(e.innerText || '').replace(/\s+/g, ' ').trim()}" ${String(e.innerHTML).replace(/\s+/g, ' ').slice(0, 160)}` }))
      await L.sleep(300)
      R(c, 'the Leave War after the drop (Ranger\'s and Hex\'s Wed cells)', 'RECORD', cells, '', [await L.shot(w, pb + '-5-war-after')])
    }
    const rr = await L.readAs(w, 'us', pb + '-4-ranger', K.name)
    const mine = (rr.bell.lines || []).filter(l => /You were/.test(l.what))
    const verdictR = K.record || !changed ? 'RECORD' : (mine.length === 1 && /^You were added · Saber$/.test(mine[0].what) && /Wed 15 Jul/.test(mine[0].day) ? 'PASS' : 'FAIL')
    R(c, 'Ranger\'s bell on screen', verdictR, { lit: rr.bell.lit, lines: (rr.bell.lines || []).map(l => `${l.name} | ${l.day} | ${l.what} | ${l.cls}`), toast: rr.bell.toast }, '', [rr.bell.lift, rr.bell.pic].filter(Boolean))
    if (rr.tap) R(c, 'a tap on Ranger\'s line', 'RECORD', rr.tap, 'opens the input', [rr.tap.pic])
    if (w.errs.length) R(c, 'page errors', 'NOTE', w.errs)
  } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
  await w.ctx.close().catch(() => {})
}
await L.closeAll()
