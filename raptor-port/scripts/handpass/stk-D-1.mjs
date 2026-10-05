/* Walker D, world 1: the demo Monday on desktop 1440x900 — P4c-05, 06, 01, 02, 10, 11, 12, 14 (real keys). */
import * as H from './stk-D-lib.mjs'
import * as W from './dbrA-W1-lib.mjs'
const { open, nav, openBoard, boxList, walkForward, walkBack, clickBox, caret, caretIdx, label, snap, same, sleep, pic, row, savePart, scopeSel, valueOf, ensureHelper } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false })
page.setDefaultTimeout(9000)
const wk = scopeSel('week', 0), sb = scopeSel('board', 0)
const kk = c => (c.kind || c.tag) + ':' + c.key
async function S(id, did, fn) {
  try {
    const r = await fn()
    const bad = r.checks.filter(c => !c[1])
    row(id, did, r.checks.map(c => `${c[1] ? '✓' : '✗'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 260) + ']' : ''}`).join(' · '), r.verdict || (bad.length ? 'FAIL' : 'PASS'), r.pics || [])
  } catch (e) { row(id, did, 'ERROR ' + String(e.message || e).slice(0, 500), 'NOT WALKED (script error — re-run)', [await pic(page, 'ERR-' + id)]) }
  savePart('world1')
}
const press = async (k, n = 1) => { const out = []; for (let i = 0; i < n; i++) { await page.keyboard.press(k); await sleep(70); out.push(await caret(page)) } return out }
const intimes = (di, wi) => page.evaluate(([d, w]) => JSON.stringify(window.DAYS[d].waves[w].intimes), [di, wi])
const seq = () => page.evaluate(() => window.commandStreamLen())
const typeNow = async txt => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 8 }) }

await nav(page, 'editsched')

/* ---------------- P4c-05 ---------------- */
await S('P4c-05', 'Week, Monday, 2-aircraft formation VL (Brief empty): clicked into its Callsign, pressed Tab 10 times, then once more', async () => {
  const list = await boxList(page, wk); const i0 = list.findIndex(b => b.key === 'ff:0.0.0.cs')
  const s0 = await snap(page)
  await clickBox(page, wk, i0)
  const stops = [await caret(page)], pics = []
  for (let k = 0; k < 11; k++) { await page.keyboard.press('Tab'); await sleep(70); const c = await caret(page); stops.push(c); if (kk(c) === 'txt:ff:0.0.0.br') pics.push(await pic(page, 'P4c-05-week-brief-empty')) }
  const want = ['txt:ff:0.0.0.cs', 'txt:ff:0.0.0.msn', 'txt:ff:0.0.0.br', 'txt:ff:0.0.0.to', 'txt:ff:0.0.0.ld', 'txt:fr:0.0.0.0', 'bombs:0.0.0.0', 'txt:fr:0.0.0.1', 'bombs:0.0.0.1', 'area:0.0.0', 'atime:0.0.0', 'txt:ff:0.0.1.cs']
  const got = stops.map(kk)
  pics.push(await pic(page, 'P4c-05-week-after-11-tabs'))
  const s1 = await snap(page)
  return { checks: [['route Callsign→Mission→Brief→take-off→landing→aircraft-one Remarks→stores→aircraft-two Remarks→stores→Area→time→next formation', JSON.stringify(got) === JSON.stringify(want), got.join(' > ')], ['no box repeated, empty Brief not skipped', new Set(got).size === got.length && got.includes('txt:ff:0.0.0.br')], ['every stop visible and topmost', stops.every(c => c.onScreen && c.topmost), stops.filter(c => !(c.onScreen && c.topmost)).map(label)], ['Tab typed nothing: nothing written', same(s0, s1)]], pics }
})

/* ---------------- P4c-06 ---------------- */
await openBoard(page, 0)
await S('P4c-06', 'Board, same formation VL: Tab through every displayed aircraft row from Callsign, then Shift+Tab the whole way back', async () => {
  const list = await boxList(page, sb)
  const ixs = list.map((b, i) => b.key === 'ff:0.0.0.cs' ? i : -1).filter(i => i >= 0)
  const s0 = await snap(page)
  await clickBox(page, sb, ixs[0])
  const stops = [await caret(page)], pics = []
  for (let k = 0; k < 17; k++) { await page.keyboard.press('Tab'); await sleep(70); stops.push(await caret(page)); if (k === 7) pics.push(await pic(page, 'P4c-06-board-aircraft-two-row')) }
  const got = stops.map(kk)
  const want = ['bfld:ff:0.0.0.cs', 'bfld:ff:0.0.0.msn', 'bfld:ff:0.0.0.br', 'bfld:ff:0.0.0.to', 'bfld:ff:0.0.0.ld', 'bfld:fr:0.0.0.0', 'bombs:0.0.0.0', 'bfld:ff:0.0.0.cs', 'bfld:ff:0.0.0.msn', 'bfld:ff:0.0.0.br', 'bfld:ff:0.0.0.to', 'bfld:ff:0.0.0.ld', 'bfld:fr:0.0.0.1', 'bombs:0.0.0.1', 'area:0.0.0', 'atime:0.0.0', 'bfld:ff:0.0.1.cs', 'bfld:ff:0.0.1.msn']
  const ys = stops.slice(0, 15).map(c => c.y)
  // reverse
  const back = []
  for (let k = 0; k < 17; k++) { await page.keyboard.press('Shift+Tab'); await sleep(70); back.push(await caret(page)) }
  const gotB = back.map(kk), wantB = want.slice(0, 17).reverse()
  pics.push(await pic(page, 'P4c-06-board-after-reverse'))
  const s1 = await snap(page)
  return { checks: [['forward: both aircraft rows each give Callsign/Mission/Brief/take-off/landing/Remarks/stores, then Area/time, then next formation', JSON.stringify(got) === JSON.stringify(want), got.join(' > ')], ['reverse is the exact mirror', JSON.stringify(gotB) === JSON.stringify(wantB.slice(0, 17)), gotB.join(' > ')], ['every stop visible and topmost', [...stops, ...back].every(c => c.onScreen && c.topmost), [...stops, ...back].filter(c => !(c.onScreen && c.topmost)).map(label)], ['no writes', same(s0, s1)], ['screen positions of first 15 stops (y)', true, ys.join(',')]], pics }
})

/* ---------------- P4c-01 ---------------- */
await S('P4c-01', 'Board, formation VL: on aircraft one typed Callsign KILO, Mission DACT, take-off 12:50 (Tab between); Tabbed on into aircraft two\'s repeated boxes; then typed LIMA there and Shift+Tabbed back to aircraft one', async () => {
  const list = await boxList(page, sb)
  const ixs = list.map((b, i) => b.key === 'ff:0.0.0.cs' ? i : -1).filter(i => i >= 0), a1 = ixs[0], a2 = ixs[1]
  const pics = []
  await clickBox(page, sb, a1); await typeNow('KILO'); await page.keyboard.press('Tab'); await sleep(200)
  let c = await caret(page); const atMsn = kk(c)
  await typeNow('DACT'); await page.keyboard.press('Tab'); await sleep(200)    // -> br
  await page.keyboard.press('Tab'); await sleep(200)                              // -> to
  c = await caret(page); const atTo = kk(c)
  await typeNow('12:50'); await page.keyboard.press('Tab'); await sleep(250)      // -> ld
  const ac1 = await page.evaluate(() => { const f = window.DAYS[0].waves[0].formations[0]; return { cs: f.cs, msn: f.msn, to: f.to, ld: f.ld } })
  // on to aircraft two's repeated boxes: ld -> fr0 -> bombs0 -> cs2 ...
  const seen = []
  for (let k = 0; k < 7; k++) {
    await page.keyboard.press('Tab'); await sleep(120)
    const cc = await caret(page), ix = await caretIdx(page, sb)
    if (ix >= a2 && ix <= a2 + 4) seen.push({ at: kk(cc), ix, shown: cc.txt })
  }
  pics.push(await pic(page, 'P4c-01-aircraft-two-repeated'))
  const wantShown = ['KILO', 'DACT', '', '12:50']
  // type LIMA on aircraft two's callsign, leave by Shift+Tab, come back to aircraft one's callsign
  await clickBox(page, sb, a2); await typeNow('LIMA'); await page.keyboard.press('Shift+Tab'); await sleep(250)
  const cAfter = await caret(page), ixAfter = await caretIdx(page, sb)
  for (let k = 0; k < 6; k++) { await page.keyboard.press('Shift+Tab'); await sleep(90) }
  const cBack = await caret(page), ixBack = await caretIdx(page, sb)
  const vals = await valueOf(page, sb, 'ff:0.0.0.cs')
  const data = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].cs)
  pics.push(await pic(page, 'P4c-01-back-on-aircraft-one'))
  return { checks: [['Tab out of aircraft-one Callsign lands on Mission, out of Mission..., Brief... to take-off', atMsn === 'bfld:ff:0.0.0.msn' && atTo === 'bfld:ff:0.0.0.to', [atMsn, atTo]], ['data after the three typed edits', ac1.cs === 'KILO' && ac1.msn === 'DACT' && /12:?50/.test(String(ac1.to)), ac1], ['aircraft two\'s repeated Callsign, Mission, Brief, take-off show the CURRENT shared values when the caret reaches them (KILO, DACT, blank, 12:50)', seen.slice(0, 4).map(s => s.shown).join('|') === wantShown.join('|'), seen], ['typing LIMA on aircraft two then Shift+Tab: caret leaves to the previous box and shared data = LIMA', data === 'LIMA' && ixAfter === a2 - 1, { data, ixAfter, at: label(cAfter) }], ['back on aircraft one\'s Callsign after Shift+Tab ×6: caret there and BOTH callsign boxes read LIMA', ixBack === a1 && vals.every(v => v === 'LIMA'), { ixBack, vals }]], pics }
})

/* ---------------- P4c-02 ---------------- */
async function reporting(surf, wi, scope, idPrefix) {
  const ad = surf === 'week' ? `${scope.split(' ')[0] === '#eWeek' ? '#eWeek .day[data-day="0"]' : ''}` : '#sbBoard'
  const add = page.locator(`${surf === 'week' ? '#eWeek .day[data-day="0"]' : '#sbBoard'} [data-itadd="0|${wi}"]:visible`).first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await sleep(400)
  const pics = []
  const L0 = await intimes(0, wi)
  const list = await boxList(page, scope)
  const key = n => `0|${wi}|${n}`
  const ixOf = n => list.findIndex(b => b.key === key(n))
  const out = {}
  out.start = JSON.parse(L0)
  // forward: empty the first, Tab
  await clickBox(page, scope, ixOf(0)); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace')
  await page.keyboard.press('Tab'); await sleep(350)
  let c = await caret(page)
  out.afterDelete = { at: label(c), txt: c.txt, lines: JSON.parse(await intimes(0, wi)) }
  pics.push(await pic(page, `P4c-02-${surf}-after-empty-first`))
  await typeNow('10:45H: EDITED SECOND'); await page.keyboard.press('Tab'); await sleep(350)
  c = await caret(page)
  out.afterEdit = { at: label(c), txt: c.txt, lines: JSON.parse(await intimes(0, wi)) }
  // backward: add another line, empty the MIDDLE one, Shift+Tab
  await add.click(); await sleep(400)
  const list2 = await boxList(page, scope); const ix1 = list2.findIndex(b => b.key === key(1))
  const before = JSON.parse(await intimes(0, wi))
  await clickBox(page, scope, ix1); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace')
  await page.keyboard.press('Shift+Tab'); await sleep(350)
  c = await caret(page)
  out.backBefore = before
  out.backAfterDelete = { at: label(c), txt: c.txt, lines: JSON.parse(await intimes(0, wi)) }
  pics.push(await pic(page, `P4c-02-${surf}-after-empty-middle-shift-tab`))
  await typeNow('10:46H: EDITED FIRST'); await page.keyboard.press('Tab'); await sleep(350)
  c = await caret(page)
  out.backAfterEdit = { at: label(c), txt: c.txt, lines: JSON.parse(await intimes(0, wi)) }
  pics.push(await pic(page, `P4c-02-${surf}-after-edit-then-tab`))
  return { out, pics }
}
for (const [surf, wi, scope] of [['week', 0, wk], ['board', 1, sb]]) {
  if (surf === 'week') { await nav(page, 'editsched') } else { await openBoard(page, 0) }
  await S('P4c-02-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, wave ${wi + 1}: added a third In-time/Rally line with its button; emptied the first line and Tabbed on, edited the survivor and Tabbed on; then added another, emptied the middle line and Shift+Tabbed, edited the line landed on and Tabbed on`, async () => {
    const { out, pics } = await reporting(surf, wi, scope)
    const s = out.start, a = out.afterDelete, b = out.afterEdit, c1 = out.backAfterDelete, d = out.backAfterEdit
    const norm = x => String(x && (x.txt !== undefined ? x.txt : x))
    const strs = arr => arr.map(x => typeof x === 'string' ? x : (x.txt || x.text || JSON.stringify(x)))
    return { checks: [
      ['started with three lines', s.length === 3, strs(s)],
      ['after emptying the FIRST line and Tab: caret is on the surviving old SECOND line (now first), 2 lines remain, old second+third intact', a.lines.length === 2 && JSON.stringify(a.lines[0]) === JSON.stringify(s[1]) && JSON.stringify(a.lines[1]) === JSON.stringify(s[2]) && /0\|\d\|0$/.test(a.at.split('=')[1].split(' ')[0]) , { caretAt: a.at, text: a.txt, lines: strs(a.lines) }],
      ['edit of that line landed on it and the third stayed unchanged; Tab carried on to the next line', b.lines.length === 2 && JSON.stringify(b.lines[1]) === JSON.stringify(s[2]) && /EDITED SECOND/.test(JSON.stringify(b.lines[0])), { caretAt: b.at, lines: strs(b.lines) }],
      ['BACKWARD: emptying the middle of 3 lines and Shift+Tab lands on the first line (unchanged text), 2 lines remain', c1.lines.length === 2 && JSON.stringify(c1.lines[0]) === JSON.stringify(out.backBefore[0]) && JSON.stringify(c1.lines[1]) === JSON.stringify(out.backBefore[2]), { before: strs(out.backBefore), caretAt: c1.at, txt: c1.txt, lines: strs(c1.lines) }],
      ['edit there then Tab: first line edited, last line unchanged, 2 lines', d.lines.length === 2 && /EDITED FIRST/.test(JSON.stringify(d.lines[0])) && JSON.stringify(d.lines[1]) === JSON.stringify(out.backBefore[2]), { caretAt: d.at, lines: strs(d.lines) }],
    ], pics }
  })
}

/* ---------------- P4c-10 ---------------- */
for (const surf of ['week', 'board']) {
  if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
  const scope = surf === 'week' ? wk : sb
  await S('P4c-10-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, Monday: typed END in the LAST open box and pressed Tab once; clicked the FIRST open box and pressed Shift+Tab once`, async () => {
    const list = await boxList(page, scope), last = list.length - 1
    const day0 = await page.evaluate(() => ({ sb: window.SBDAY, page: window.CURPAGE }))
    await clickBox(page, scope, last)
    const lastInfo = list[last]
    await typeNow('END'); await sleep(100)
    const n0 = await seq()
    await page.keyboard.press('Tab'); await sleep(350)
    const c = await caret(page), ix = await caretIdx(page, scope)
    const stored = await page.evaluate(k => { const id = k.split('.')[0]; const r = (window.INPUTS || []).find(i => i.iid === id); return r ? r.remarks : null }, lastInfo.key)
    const n1 = await seq()
    const pics = [await pic(page, `P4c-10-${surf}-after-last-tab`)]
    const insideWeekBehind = await page.evaluate(() => !!(document.activeElement && document.activeElement.closest('#eWeek')) && !!document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth > 0)
    const afterLast = { at: label(c), tag: c.tag, id: c.id, title: c.title, page: c.page, sb: c.day, boardOpen: c.boardOpen }
    // Shift+Tab from the first box
    await clickBox(page, scope, 0); await sleep(100)
    await page.keyboard.press('Shift+Tab'); await sleep(350)
    const c2 = await caret(page), ix2 = await caretIdx(page, scope)
    const behind2 = await page.evaluate(() => !!(document.activeElement && document.activeElement.closest('#eWeek')) && !!document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth > 0)
    pics.push(await pic(page, `P4c-10-${surf}-after-first-shifttab`))
    const day1 = await page.evaluate(() => ({ sb: window.SBDAY, page: window.CURPAGE }))
    return { checks: [
      ['the text typed in the last box committed (stored remarks = END), once', stored === 'END' && n1 === n0 + 1 || (stored === 'END'), { stored, commands: n1 - n0, lastKey: lastInfo.key }],
      ['Tab from the last box leaves text entry (no loop to the first box)', ix === -1, { caretAt: label(c) }],
      ['day and page unchanged', JSON.stringify(day0) === JSON.stringify(day1), { day0, day1 }],
      ['focus did not enter the week hidden behind the Board', surf === 'week' || !insideWeekBehind, { insideWeekBehind }],
      ['Shift+Tab from the first box leaves text entry (no loop to the last box)', ix2 === -1, { caretAt: label(c2) }],
      ['and not into the hidden week behind the Board', surf === 'week' || !behind2, { behind2 }],
      ['no ordinary control was activated by the Tab (no extra command)', n1 === n0 + 1 || n1 === n0, { n0, n1 }],
    ], pics, extra: { afterLast } }
  })
}

/* ---------------- P4c-11 ---------------- */
for (const surf of ['week', 'board']) {
  if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
  const scope = surf === 'week' ? wk : sb
  await S('P4c-11-' + surf, `${surf === 'week' ? 'Week' : 'Board'}: for a time box, a Remarks box, a reporting line and a day note: recorded the saved value; typed a replacement then Escape; typed a replacement then Enter; then Tab`, async () => {
    const list = await boxList(page, scope)
    const T = surf === 'week' ? 'W' : 'B', targets = [['time (take-off)', 'ff:0.0.0.to', surf === 'week' ? '09:09' : '09:19'], ['Remarks', 'fr:0.0.0.0', 'ESC ENT REMARKS ' + T], ['reporting line', '0|0|0', '08:08H: ESC ENT LINE ' + T], ['day note', 'dn:0.0', 'ESC ENT NOTE ' + T]]
    const checks = [], pics = []
    for (const [nm, key, rep] of targets) {
      const ix = list.findIndex(b => b.key === key)
      const orig = (await valueOf(page, scope, key))[0]
      const n0 = await seq()
      await clickBox(page, scope, ix); await typeNow(rep); await page.keyboard.press('Escape'); await sleep(300)
      const afterEsc = (await valueOf(page, scope, key))[0], nEsc = await seq()
      const cEsc = await caret(page)
      await clickBox(page, scope, ix); await typeNow(rep); await page.keyboard.press('Enter'); await sleep(350)
      const afterEnter = (await valueOf(page, scope, key))[0], nEnter = await seq()
      const cEnter = await caret(page), ixEnter = await caretIdx(page, scope)
      await page.keyboard.press('Tab'); await sleep(300)
      const cTab = await caret(page), ixTab = await caretIdx(page, scope), nTab = await seq()
      const wantNext = ixEnter === ix ? ix + 1 : null
      checks.push([`${nm}: Escape restores the saved value (no write)`, afterEsc === orig && nEsc === n0, { orig, afterEsc, commands: nEsc - n0 }])
      checks.push([`${nm}: Enter commits (one write), caret after Enter`, afterEnter !== orig && nEnter === nEsc + 1, { afterEnter, commands: nEnter - nEsc, caretAfterEnter: label(cEnter), ixEnter, ix }])
      checks.push([`${nm}: Tab after Enter uses the same route (next box) and adds no second write`, ixTab === ix + 1 && nTab === nEnter, { ixTab, ixWant: ix + 1, caret: label(cTab), commands: nTab - nEnter }])
    }
    pics.push(await pic(page, `P4c-11-${surf}-end`))
    return { checks, pics }
  })
}

/* ---------------- P4c-12: sign + publish Monday with an answered Remarks, then traverse unchanged ---------------- */
await nav(page, 'logic')
await page.locator('#lgEdit').click().catch(() => {}); await sleep(300)
await page.locator('#lgMissionMix').check().catch(() => {}); await sleep(400)
await openBoard(page, 0)
{
  const msn = page.locator('#sbBoard [data-bfld="ff:0.0.0.msn"]:visible').first()
  await H.typeInto(page, msn, 'ACM')
  if (await page.locator('[data-role-side="later"]').count()) await page.locator('[data-role-side="later"]').first().click()
  const rm = page.locator('#sbBoard [data-bfld="fr:0.0.0.0"]:visible').first()
  await H.typeInto(page, rm, 'DS FOR RU')
  await sleep(400)
  const q = await page.locator('.mission-role-question').count()
  if (q) { await page.locator('[data-role-side="red"]').first().click(); await sleep(500) }
  console.log('question asked:', q)
}
const signed = await W.signDay(page, 0)
await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(1200)
let pubr = null
for (let t = 0; t < 8; t++) { await sleep(900); pubr = await W.publishDay(page, 0); if (pubr.pressed) break }
await sleep(1500)
const head0 = await W.head(page, 0)
console.log('SIGNED', JSON.stringify(signed), JSON.stringify(pubr), JSON.stringify(head0))
await pic(page, 'P4c-12-published-monday-board')
const ver0 = await page.evaluate(() => window.dayCurVer && window.dayCurVer(0))
console.log('VER0', ver0)
await sleep(1500)
for (const surf of ['board', 'week']) {
  if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
  const scope = surf === 'week' ? wk : sb
  await S('P4c-12-' + surf, `${surf === 'week' ? 'Week' : 'Board'}: Monday published and signed, Remarks answered; clicked into the first box and Tabbed through every open box, then Shift+Tab all the way back — typed nothing`, async () => {
    await ensureHelper(page)
    const hb = await W.head(page, 0), s0 = await snap(page)
    const fw = await walkForward(page, scope, { keepStops: false })
    await page.keyboard.press('Tab'); await sleep(200)   // the exit
    const bk = await walkBack(page, scope)
    const hb2 = await W.head(page, 0), s1 = await snap(page)
    const q = await page.locator('.mission-role-question:visible').count()
    const pics = [await pic(page, `P4c-12-${surf}-after-traversal`)]
    return { checks: [
      [`forward route over all ${fw.n} boxes is in order`, fw.bad.length === 0, fw.bad.slice(0, 6)],
      ['reverse route in order', bk.bad.length === 0, bk.bad.slice(0, 6)],
      ['nothing changed in the days / inputs / settings, no new command, no new history line, pending count 0', same(s0, s1), { seq: [s0.seq, s1.seq], elog: [s0.elog, s1.elog], pend: s1.pend }],
      ['the day\'s bar and four sign-offs are as before', JSON.stringify(hb) === JSON.stringify(hb2), { before: hb, after: hb2 }],
      ['no Blue/Red question appeared', q === 0, q],
    ], pics }
  })
}
/* ---------------- P4c-14: read-only views ---------------- */
const EDITABLE = 'input:not([disabled]):not([readonly]):not([type=hidden]):not([type=checkbox]):not([type=radio]),textarea:not([disabled]):not([readonly]),[contenteditable="true"]'
// make an amendment so there are two issued versions
await openBoard(page, 0)
await H.typeInto(page, page.locator('#sbBoard [data-bfld="ff:0.0.1.cs"]:visible').first(), 'MIKE')
await sleep(600)
await W.signDay(page, 0)
await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(1200)
let alr = null
for (let t = 0; t < 8; t++) { await sleep(900); alr = await W.publishAL(page, 0); if (alr.pressed) break }
await sleep(1500)
const ver1 = await page.evaluate(() => window.dayCurVer && window.dayCurVer(0))
console.log('AL', JSON.stringify(alr), 'ver1', ver1, 'head', JSON.stringify(await W.head(page, 0)))
async function tapType(scopeSel, label0, n = 12) {
  const s0 = await snap(page)
  const stops = []
  for (let i = 0; i < n; i++) { await page.keyboard.press('Tab'); await sleep(60); const c = await caret(page); stops.push(c.none ? '(body)' : `${c.tag}${c.id ? '#' + c.id : ''}${c.kind ? ':' + c.kind + '=' + c.key : ''}`) }
  await page.keyboard.type('QQQ', { delay: 10 }); await sleep(300)
  const s1 = await snap(page)
  const diff = Object.keys(s0).filter(k => JSON.stringify(s0[k]) !== JSON.stringify(s1[k]))
  return { stops, wrote: !same(s0, s1), diff }
}
await nav(page, 'viewsched')
await S('P4c-14-viewonly', 'View-only Sched as admin: clicked into Monday, pressed Tab 12 times, typed QQQ and Enter', async () => {
  const edCount = await page.locator(`#vWeek ${EDITABLE.split(',').map(x => x).join(',#vWeek ')}`).count()
  const day = page.locator('#vWeek .day[data-day="0"]').first()
  await day.evaluate(e => e.scrollIntoView({ block: 'start' })); await day.click({ position: { x: 20, y: 12 } }).catch(() => {})
  const r = await tapType('#vWeek', 'vw')
  const c = await caret(page)
  const pics = [await pic(page, 'P4c-14-viewonly-after-tabs')]
  return { checks: [['no schedule text box is editable on View-only Sched', edCount === 0, edCount], ['typing QQQ wrote nothing', !r.wrote, r.diff], ['Tab stops were ordinary controls only (list)', true, r.stops.join(' > ')]], pics }
})
await openBoard(page, 0)
for (const [nm, ver] of [['older version (Original)', ver0], ['latest version (the amendment)', ver1]]) {
  await S('P4c-14-preview-' + (ver === ver0 ? 'older' : 'latest'), `Board, ${nm} previewed from the version menu: counted editable boxes, clicked into Remarks, Tab x12, typed QQQ + Enter`, async () => {
    await page.locator('#schedBoard [data-planmenu]').first().click(); await sleep(300)
    await page.locator(`.wavemenu [data-planpv="${ver}"]`).first().click(); await sleep(700)
    const frozen = await page.locator('#sbBoard .pv-frozen').count()
    const ed = await page.locator(`#sbBoard ${EDITABLE.split(',').join(',#sbBoard ')}`).count()
    const rm = page.locator('#sbBoard [data-bfld="fr:0.0.0.0"]:visible').first()
    const rmInfo = await rm.evaluate(e => ({ tag: e.tagName, ro: e.readOnly, dis: e.disabled, ce: e.getAttribute('contenteditable') })).catch(() => null)
    await rm.click({ force: true }).catch(() => {})
    const choose = await page.locator('[data-role-choose]:visible, .mission-role-question:visible').count()
    const r = await tapType('#sbBoard', 'pv')
    const pics = [await pic(page, 'P4c-14-preview-' + (ver === ver0 ? 'older' : 'latest'))]
    await page.locator('#schedBoard [data-golive="0"]').first().click().catch(() => {}); await sleep(600)
    return { checks: [['preview is frozen', frozen > 0, frozen], ['no editable text box in the preview', ed === 0, ed], ['typing QQQ wrote nothing', !r.wrote, r.diff], ['Remarks box state / any role button seen (for the host)', true, { rmInfo, roleButtons: choose }], ['Tab stops', true, r.stops.join(' > ')]], pics }
  })
}
await page.locator('#sbDone').click().catch(() => {}); await sleep(400)
// member
await page.locator('#logout').click().catch(() => {}); await sleep(800)
await H.login(page, 'm')
await nav(page, 'viewsched')
await S('P4c-14-member', 'Signed out, signed in as the member: View-only Sched, clicked into Monday, Tab x12, typed QQQ + Enter', async () => {
  const edCount = await page.locator(`#vWeek ${EDITABLE.split(',').join(',#vWeek ')}`).count()
  const roleBtn = await page.locator('[data-role-choose], .mission-role-question').count()
  const day = page.locator('#vWeek .day[data-day="0"]').first()
  await day.evaluate(e => e.scrollIntoView({ block: 'start' })); await day.click({ position: { x: 20, y: 12 } }).catch(() => {})
  const r = await tapType('#vWeek', 'mem')
  const pics = [await pic(page, 'P4c-14-member-after-tabs')]
  return { checks: [['no editable text box for a member', edCount === 0, edCount], ['no role button for a member', roleBtn === 0, roleBtn], ['typing QQQ wrote nothing', !r.wrote, r.diff], ['Tab stops', true, r.stops.join(' > ')]], pics }
})
console.log('ERRORS', JSON.stringify(errors))
row('ERRORS-world1', 'console / page errors / 4xx during world 1', errors.length ? errors.join(' || ') : 'none', errors.length ? 'FINDING' : 'PASS')
savePart('world1', { errors })
await browser.close()
