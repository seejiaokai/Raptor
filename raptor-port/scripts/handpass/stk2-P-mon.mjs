/* Walker P re-walk, Monday scenarios on the demo week, desktop 1440x900, each in a fresh world:
   P4c-05, 06, 01, 02, 10, 11, 12, 14 (real keys). ONLY=P4c-05,P4c-06 to choose. */
import * as R from './stk2-P-run.mjs'
import * as W from './dbrA-W1-lib.mjs'
const { S, finish, nav, openBoard, boxList, walkForward, walkBack, clickBox, caret, caretIdx, label, snap, same, sleep, pic, scopeSel, valueOf, ensureHelper, typeNow, kk, seqN } = R
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !ONLY || ONLY.includes(id)
const wk = scopeSel('week', 0), sb = scopeSel('board', 0)
const PART = 'mon' + (ONLY ? '-' + ONLY.join('+') : '')
const intimes = (page, di, wi) => page.evaluate(([d, w]) => JSON.stringify(window.DAYS[d].waves[w].intimes), [di, wi])

/* ---------------- P4c-05 ---------------- */
if (want('P4c-05')) await S(PART, 'P4c-05', 'Week, Monday, 2-aircraft formation VL (Brief empty): clicked into its Callsign, pressed Tab 11 times', {}, async page => {
  await nav(page, 'editsched')
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
if (want('P4c-06')) await S(PART, 'P4c-06', 'Board, formation VL: Tab through every displayed aircraft row from Callsign, then Shift+Tab the whole way back', {}, async page => {
  await openBoard(page, 0)
  const list = await boxList(page, sb)
  const ixs = list.map((b, i) => b.key === 'ff:0.0.0.cs' ? i : -1).filter(i => i >= 0)
  const s0 = await snap(page)
  await clickBox(page, sb, ixs[0])
  const stops = [await caret(page)], pics = []
  for (let k = 0; k < 17; k++) { await page.keyboard.press('Tab'); await sleep(70); stops.push(await caret(page)); if (k === 7) pics.push(await pic(page, 'P4c-06-board-aircraft-two-row')) }
  const got = stops.map(kk)
  const want = ['bfld:ff:0.0.0.cs', 'bfld:ff:0.0.0.msn', 'bfld:ff:0.0.0.br', 'bfld:ff:0.0.0.to', 'bfld:ff:0.0.0.ld', 'bfld:fr:0.0.0.0', 'bombs:0.0.0.0', 'bfld:ff:0.0.0.cs', 'bfld:ff:0.0.0.msn', 'bfld:ff:0.0.0.br', 'bfld:ff:0.0.0.to', 'bfld:ff:0.0.0.ld', 'bfld:fr:0.0.0.1', 'bombs:0.0.0.1', 'area:0.0.0', 'atime:0.0.0', 'bfld:ff:0.0.1.cs', 'bfld:ff:0.0.1.msn']
  const back = []
  for (let k = 0; k < 17; k++) { await page.keyboard.press('Shift+Tab'); await sleep(70); back.push(await caret(page)) }
  const gotB = back.map(kk), wantB = want.slice(0, 17).reverse()
  pics.push(await pic(page, 'P4c-06-board-after-reverse'))
  const s1 = await snap(page)
  return { checks: [['forward: both aircraft rows each give Callsign/Mission/Brief/take-off/landing/Remarks/stores, then Area/time, then next formation', JSON.stringify(got) === JSON.stringify(want), got.join(' > ')], ['reverse is the exact mirror', JSON.stringify(gotB) === JSON.stringify(wantB), gotB.join(' > ')], ['every stop visible and topmost', [...stops, ...back].every(c => c.onScreen && c.topmost), [...stops, ...back].filter(c => !(c.onScreen && c.topmost)).map(label)], ['no writes', same(s0, s1)]], pics }
})

/* ---------------- P4c-01 ---------------- */
if (want('P4c-01')) await S(PART, 'P4c-01', 'Board, formation VL: on aircraft one typed Callsign KILO, Mission DACT, take-off 12:50 (Tab between); Tabbed on into aircraft two\'s repeated boxes; typed LIMA there and Shift+Tabbed back to aircraft one', {}, async page => {
  await openBoard(page, 0)
  const list = await boxList(page, sb)
  const ixs = list.map((b, i) => b.key === 'ff:0.0.0.cs' ? i : -1).filter(i => i >= 0), a1 = ixs[0], a2 = ixs[1]
  const pics = []
  await clickBox(page, sb, a1); await typeNow(page, 'KILO'); await page.keyboard.press('Tab'); await sleep(200)
  let c = await caret(page); const atMsn = kk(c)
  await typeNow(page, 'DACT'); await page.keyboard.press('Tab'); await sleep(200)
  await page.keyboard.press('Tab'); await sleep(200)
  c = await caret(page); const atTo = kk(c)
  await typeNow(page, '12:50'); await page.keyboard.press('Tab'); await sleep(250)
  const ac1 = await page.evaluate(() => { const f = window.DAYS[0].waves[0].formations[0]; return { cs: f.cs, msn: f.msn, to: f.to, ld: f.ld } })
  const seen = []
  for (let k = 0; k < 7; k++) {
    await page.keyboard.press('Tab'); await sleep(120)
    const cc = await caret(page), ix = await caretIdx(page, sb)
    if (ix >= a2 && ix <= a2 + 4) seen.push({ at: kk(cc), ix, shown: cc.txt })
  }
  pics.push(await pic(page, 'P4c-01-aircraft-two-repeated'))
  const wantShown = ['KILO', 'DACT', '', '12:50']
  await clickBox(page, sb, a2); await typeNow(page, 'LIMA'); await page.keyboard.press('Shift+Tab'); await sleep(250)
  const cAfter = await caret(page), ixAfter = await caretIdx(page, sb)
  for (let k = 0; k < 6; k++) { await page.keyboard.press('Shift+Tab'); await sleep(90) }
  const cBack = await caret(page), ixBack = await caretIdx(page, sb)
  const vals = await valueOf(page, sb, 'ff:0.0.0.cs')
  const data = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].cs)
  pics.push(await pic(page, 'P4c-01-back-on-aircraft-one'))
  return { checks: [['Tab out of aircraft-one Callsign lands on Mission; ... to take-off', atMsn === 'bfld:ff:0.0.0.msn' && atTo === 'bfld:ff:0.0.0.to', [atMsn, atTo]], ['data after the three typed edits', ac1.cs === 'KILO' && ac1.msn === 'DACT' && /12:?50/.test(String(ac1.to)), ac1], ['aircraft two\'s repeated Callsign, Mission, Brief, take-off show the CURRENT shared values when the caret reaches them (KILO, DACT, blank, 12:50)', seen.slice(0, 4).map(s => s.shown).join('|') === wantShown.join('|'), seen], ['typing LIMA on aircraft two then Shift+Tab: caret leaves to the previous box and shared data = LIMA', data === 'LIMA' && ixAfter === a2 - 1, { data, ixAfter, at: label(cAfter) }], ['back on aircraft one\'s Callsign after Shift+Tab x6: caret there and BOTH callsign boxes read LIMA', ixBack === a1 && vals.every(v => v === 'LIMA'), { ixBack, vals }]], pics }
})

/* ---------------- P4c-02 ---------------- */
async function reporting(page, surf, wi, scope) {
  const root = surf === 'week' ? '#eWeek .day[data-day="0"]' : '#sbBoard'
  const add = page.locator(`${root} [data-itadd="0|${wi}"]:visible`).first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await sleep(400)
  const pics = [], out = {}
  const L0 = await intimes(page, 0, wi)
  const list = await boxList(page, scope)
  const key = n => `0|${wi}|${n}`
  const ixOf = n => list.findIndex(b => b.key === key(n))
  out.start = JSON.parse(L0)
  await clickBox(page, scope, ixOf(0)); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace')
  await page.keyboard.press('Tab'); await sleep(350)
  let c = await caret(page)
  out.afterDelete = { at: label(c), key: c.key, txt: c.txt, lines: JSON.parse(await intimes(page, 0, wi)) }
  pics.push(await pic(page, `P4c-02-${surf}-after-empty-first`))
  await typeNow(page, '10:45H: EDITED SECOND'); await page.keyboard.press('Tab'); await sleep(350)
  c = await caret(page)
  out.afterEdit = { at: label(c), key: c.key, txt: c.txt, lines: JSON.parse(await intimes(page, 0, wi)) }
  await add.click(); await sleep(400)
  const list2 = await boxList(page, scope); const ix1 = list2.findIndex(b => b.key === key(1))
  const before = JSON.parse(await intimes(page, 0, wi))
  await clickBox(page, scope, ix1); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace')
  await page.keyboard.press('Shift+Tab'); await sleep(350)
  c = await caret(page)
  out.backBefore = before
  out.backAfterDelete = { at: label(c), key: c.key, txt: c.txt, lines: JSON.parse(await intimes(page, 0, wi)) }
  pics.push(await pic(page, `P4c-02-${surf}-after-empty-middle-shift-tab`))
  await typeNow(page, '10:46H: EDITED FIRST'); await page.keyboard.press('Tab'); await sleep(350)
  c = await caret(page)
  out.backAfterEdit = { at: label(c), key: c.key, txt: c.txt, lines: JSON.parse(await intimes(page, 0, wi)) }
  pics.push(await pic(page, `P4c-02-${surf}-after-edit-then-tab`))
  return { out, pics }
}
for (const surf of ['week', 'board']) {
  if (!want('P4c-02')) break
  await S(PART, 'P4c-02-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, Monday wave 1: added a third In-time/Rally line; emptied the first line and Tabbed on, edited the survivor and Tabbed on; then added another, emptied the middle line and Shift+Tabbed, edited the line landed on and Tabbed on`, {}, async page => {
    if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
    const { out, pics } = await reporting(page, surf, 0, surf === 'week' ? wk : sb)
    const s = out.start, a = out.afterDelete, b = out.afterEdit, c1 = out.backAfterDelete, d = out.backAfterEdit
    const strs = arr => arr.map(x => typeof x === 'string' ? x : (x.txt || x.text || JSON.stringify(x)))
    return { checks: [
      ['started with the lines the day has plus the one added (>= 2 lines, the check below needs 3)', s.length === 3, strs(s)],
      ['after emptying the FIRST line and Tab: 2 lines remain = old second and third, unchanged; caret on the survivor (now first) or next', a.lines.length === s.length - 1 && JSON.stringify(a.lines[0]) === JSON.stringify(s[1]) && JSON.stringify(a.lines[1]) === JSON.stringify(s[2]), { caretAt: a.at, text: a.txt, lines: strs(a.lines) }],
      ['edit typed where the caret landed went to a surviving line; the third stayed unchanged; 2 lines', b.lines.length === 2 && JSON.stringify(b.lines[1]) === JSON.stringify(s[2]) && /EDITED SECOND/.test(JSON.stringify(b.lines[0])), { caretAfterEdit: b.at, lines: strs(b.lines) }],
      ['BACKWARD: emptying the middle of 3 lines and Shift+Tab lands on the first line (unchanged text), 2 lines remain', c1.lines.length === 2 && JSON.stringify(c1.lines[0]) === JSON.stringify(out.backBefore[0]) && JSON.stringify(c1.lines[1]) === JSON.stringify(out.backBefore[2]), { before: strs(out.backBefore), caretAt: c1.at, txt: c1.txt, lines: strs(c1.lines) }],
      ['edit there then Tab: first line edited, last line unchanged, 2 lines', d.lines.length === 2 && /EDITED FIRST/.test(JSON.stringify(d.lines[0])) && JSON.stringify(d.lines[1]) === JSON.stringify(out.backBefore[2]), { caretAt: d.at, lines: strs(d.lines) }],
    ], pics }
  })
}

/* ---------------- P4c-10 ---------------- */
for (const surf of ['week', 'board']) {
  if (!want('P4c-10')) break
  await S(PART, 'P4c-10-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, Monday: typed END in the LAST open box and pressed Tab once; clicked the FIRST open box and pressed Shift+Tab once`, {}, async page => {
    if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
    const scope = surf === 'week' ? wk : sb
    const list = await boxList(page, scope), last = list.length - 1
    const day0 = await page.evaluate(() => ({ sb: window.SBDAY, page: window.CURPAGE }))
    await clickBox(page, scope, last)
    const lastInfo = list[last]
    await typeNow(page, 'END'); await sleep(100)
    const n0 = await seqN(page)
    await page.keyboard.press('Tab'); await sleep(350)
    const c = await caret(page), ix = await caretIdx(page, scope)
    const stored = (await valueOf(page, scope, lastInfo.key))[0]
    const n1 = await seqN(page)
    const pics = [await pic(page, `P4c-10-${surf}-after-last-tab`)]
    const behind = () => page.evaluate(() => !!(document.activeElement && document.activeElement.closest('#eWeek')) && !!document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth > 0)
    const insideWeekBehind = await behind()
    await clickBox(page, scope, 0); await sleep(100)
    const n2 = await seqN(page)
    await page.keyboard.press('Shift+Tab'); await sleep(350)
    const c2 = await caret(page), ix2 = await caretIdx(page, scope)
    const behind2 = await behind()
    const n3 = await seqN(page)
    pics.push(await pic(page, `P4c-10-${surf}-after-first-shifttab`))
    const day1 = await page.evaluate(() => ({ sb: window.SBDAY, page: window.CURPAGE }))
    return { checks: [
      ['the text typed in the last box committed (box reads END, one command)', stored === 'END' && n1 === n0 + 1, { stored, commands: n1 - n0, lastKey: lastInfo.key }],
      ['Tab from the last box leaves text entry (no loop to the first box)', ix === -1, { caretAt: label(c) }],
      ['day and page unchanged', JSON.stringify(day0) === JSON.stringify(day1), { day0, day1 }],
      ['focus did not enter the week hidden behind the Board', surf === 'week' || !insideWeekBehind, { insideWeekBehind }],
      ['Shift+Tab from the first box leaves text entry (no loop to the last box)', ix2 === -1, { caretAt: label(c2) }],
      ['and not into the hidden week behind the Board', surf === 'week' || !behind2, { behind2 }],
      ['no ordinary control was activated by either press (no command added by Shift+Tab)', n3 === n2, { n2, n3 }],
    ], pics }
  })
}

/* ---------------- P4c-11 ---------------- */
for (const surf of ['week', 'board']) {
  if (!want('P4c-11')) break
  await S(PART, 'P4c-11-' + surf, `${surf === 'week' ? 'Week' : 'Board'}: for a time box, a Remarks box, a reporting line and a day note: recorded the saved value; typed a replacement then Escape; typed a replacement then Enter; then Tab`, {}, async page => {
    if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
    const scope = surf === 'week' ? wk : sb
    const list = await boxList(page, scope)
    const T = surf === 'week' ? 'W' : 'B', targets = [['time (take-off)', 'ff:0.0.0.to', surf === 'week' ? '09:09' : '09:19'], ['Remarks', 'fr:0.0.0.0', 'ESC ENT REMARKS ' + T], ['reporting line', '0|0|0', '08:08H: ESC ENT LINE ' + T], ['day note', 'dn:0.0', 'ESC ENT NOTE ' + T]]
    const checks = [], pics = [], info = []
    for (const [nm, key, rep] of targets) {
      const ix = list.findIndex(b => b.key === key)
      if (ix < 0) { checks.push([`${nm}: box ${key} found`, false]); continue }
      const orig = (await valueOf(page, scope, key))[0]
      const n0 = await seqN(page)
      await clickBox(page, scope, ix); await typeNow(page, rep); await page.keyboard.press('Escape'); await sleep(300)
      const afterEsc = (await valueOf(page, scope, key))[0], nEsc = await seqN(page)
      await clickBox(page, scope, ix); await typeNow(page, rep); await page.keyboard.press('Enter'); await sleep(350)
      const afterEnter = (await valueOf(page, scope, key))[0], nEnter = await seqN(page)
      const cEnter = await caret(page), ixEnter = await caretIdx(page, scope)
      await page.keyboard.press('Tab'); await sleep(300)
      const cTab = await caret(page), ixTab = await caretIdx(page, scope), nTab = await seqN(page)
      checks.push([`${nm}: Escape restores the saved value (no write)`, afterEsc === orig && nEsc === n0, { orig, afterEsc, commands: nEsc - n0 }])
      checks.push([`${nm}: Enter commits (one write), caret after Enter`, afterEnter !== orig && nEnter === nEsc + 1, { afterEnter, commands: nEnter - nEsc, caretAfterEnter: label(cEnter), ixEnter, ix }])
      const rep3 = nm.startsWith('time') ? (surf === 'week' ? '09:11' : '09:21') : rep + ' T'
      // third round: type a replacement and leave with Tab — saved once, the caret moves on to the next box
      await clickBox(page, scope, ix); await typeNow(page, rep3); const nT0 = await seqN(page)
      await page.keyboard.press('Tab'); await sleep(350)
      const cT = await caret(page), ixT = await caretIdx(page, scope), nT1 = await seqN(page), afterT = (await valueOf(page, scope, key))[0]
      checks.push([`${nm}: typing a replacement then Tab saves it once and the caret moves on to the next box of the route`, afterT === rep3 && nT1 === nT0 + 1 && ixT === ix + 1, { saved: afterT, commands: nT1 - nT0, ix, ixT, caret: label(cT) }])
      info.push([`${nm}: after Enter the caret is ${ixEnter === ix ? 'still in the box' : 'in no box'}; a Tab pressed next lands on ${label(cTab)} (box ${ixTab}; the Enter-box was ${ix}); second write: ${nTab !== nEnter}`, ixEnter === ix ? ixTab === ix + 1 && nTab === nEnter : false])
    }
    pics.push(await pic(page, `P4c-11-${surf}-end`))
    const strictBad = checks.some(c => !c[1]), infoBad = info.some(c => !c[1])
    for (const i of info) checks.push(['OBSERVED, Tab pressed after Enter: ' + i[0], i[1]])
    return { checks, pics, verdict: strictBad ? 'FAIL' : infoBad ? 'PARTIAL' : 'PASS' }
  })
}

/* ---------------- P4c-12: sign + publish Monday with an answered Remarks, then traverse unchanged ---------------- */
if (want('P4c-12')) await S(PART, 'P4c-12', 'Tracking on; Board Monday: Mission ACM, Remarks "DS FOR RU" answered Red; signed the four names, published; then on Board and then Week clicked into the first box and Tabbed through every open box, one more Tab, Shift+Tab all the way back — typed nothing', {}, async page => {
  await nav(page, 'logic')
  await page.locator('#lgEdit').click().catch(() => {}); await sleep(300)
  await page.locator('#lgMissionMix').check().catch(() => {}); await sleep(400)
  await openBoard(page, 0)
  await R.typeInto(page, page.locator('#sbBoard [data-bfld="ff:0.0.0.msn"]:visible').first(), 'ACM')
  if (await page.locator('[data-role-side="later"]').count()) await page.locator('[data-role-side="later"]').first().click()
  await R.typeInto(page, page.locator('#sbBoard [data-bfld="fr:0.0.0.0"]:visible').first(), 'DS FOR RU')
  await sleep(400)
  const q = await page.locator('.mission-role-question').count()
  if (q) { await page.locator('[data-role-side="red"]').first().click(); await sleep(500) }
  const signed = await W.signDay(page, 0)
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(1200)
  let pubr = null
  for (let t = 0; t < 8; t++) { await sleep(900); pubr = await W.publishDay(page, 0); if (pubr.pressed) break }
  await sleep(1500)
  const head0 = await W.head(page, 0)
  const pics = [await pic(page, 'P4c-12-published-monday-board')]
  const checks = [['setup: question asked once and answered Red; day signed and published (tag, sign-offs)', q > 0 && /ORIG|AL/.test(head0.tag || '') && /SIGNED/.test(head0.signed || ''), { asked: q, signed, pubr, head0 }]]
  await sleep(1500)
  for (const surf of ['board', 'week']) {
    if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
    const scope = surf === 'week' ? wk : sb
    await ensureHelper(page)
    const hb = await W.head(page, 0), s0 = await snap(page)
    const fw = await walkForward(page, scope, { keepStops: false })
    await page.keyboard.press('Tab'); await sleep(200)
    const bk = await walkBack(page, scope)
    const hb2 = await W.head(page, 0), s1 = await snap(page)
    const qq = await page.locator('.mission-role-question:visible').count()
    pics.push(await pic(page, `P4c-12-${surf}-after-traversal`))
    checks.push([`${surf}: forward route over all ${fw.n} boxes in order`, fw.bad.length === 0, fw.bad.slice(0, 6)])
    checks.push([`${surf}: reverse route in order`, bk.bad.length === 0, bk.bad.slice(0, 6)])
    checks.push([`${surf}: nothing changed (days, inputs, settings, command count, history lines, pending counts)`, same(s0, s1), { seq: [s0.seq, s1.seq], elog: [s0.elog, s1.elog], pend: s1.pend }])
    checks.push([`${surf}: the day's bar and four sign-offs as before`, JSON.stringify(hb) === JSON.stringify(hb2), { before: hb, after: hb2 }])
    checks.push([`${surf}: no Blue/Red question appeared`, qq === 0, qq])
  }
  return { checks, pics }
})

/* ---------------- P4c-14: read-only views ---------------- */
const EDITABLE = 'input:not([disabled]):not([readonly]):not([type=hidden]):not([type=checkbox]):not([type=radio]),textarea:not([disabled]):not([readonly]),[contenteditable="true"]'
if (want('P4c-14')) await S(PART, 'P4c-14', 'Tracking on, Monday ACM + "DS FOR RU" left unanswered, signed and published (Original), amended (callsign MIKE on formation 2) and published as an amendment; then View-only Sched as admin, the older and latest version previews on the Board, the live published Remarks box, and the member\'s View-only Sched: Tab x12 and typing QQQ in each', {}, async page => {
  await nav(page, 'logic'); await page.locator('#lgEdit').click().catch(() => {}); await sleep(300); await page.locator('#lgMissionMix').check().catch(() => {}); await sleep(400)
  await openBoard(page, 0)
  await R.typeInto(page, page.locator('#sbBoard [data-bfld="ff:0.0.0.msn"]:visible').first(), 'ACM')
  if (await page.locator('[data-role-side="later"]').count()) await page.locator('[data-role-side="later"]').first().click()
  await R.typeInto(page, page.locator('#sbBoard [data-bfld="fr:0.0.0.0"]:visible').first(), 'DS FOR RU'); await sleep(400)
  const asked = await page.locator('.mission-role-question').count()
  if (asked) { await page.locator('[data-role-side="later"]').first().click(); await sleep(400) }
  await W.signDay(page, 0)
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(1200)
  let pubr = null; for (let t = 0; t < 8; t++) { await sleep(900); pubr = await W.publishDay(page, 0); if (pubr.pressed) break }
  await sleep(1500)
  const ver0 = await page.evaluate(() => window.dayCurVer && window.dayCurVer(0))
  const checks = [], pics = []
  // the live published day's Remarks box: focus it and see whether a role action shows; Tab; type
  await clickBox(page, sb, (await boxList(page, sb)).findIndex(b => b.key === 'fr:0.0.0.0')); await sleep(500)
  const liveBtn = await page.evaluate(() => ({ choose: [...document.querySelectorAll('[data-role-choose]')].map(e => e.innerText), q: document.querySelectorAll('.mission-role-question').length }))
  pics.push(await pic(page, 'P4c-14-live-published-remarks-focus'))
  // amendment
  await R.typeInto(page, page.locator('#sbBoard [data-bfld="ff:0.0.1.cs"]:visible').first(), 'MIKE'); await sleep(600)
  await W.signDay(page, 0)
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(1200)
  let alr = null; for (let t = 0; t < 8; t++) { await sleep(900); alr = await W.publishAL(page, 0); if (alr.pressed) break }
  await sleep(1500)
  const ver1 = await page.evaluate(() => window.dayCurVer && window.dayCurVer(0))
  checks.push(['setup: two issued versions (Original and an amendment)', !!ver0 && !!ver1 && ver0 !== ver1, { ver0, ver1, pubr, alr }])
  async function tapType(label0, n = 12) {
    const s0 = await snap(page); const stops = []
    for (let i = 0; i < n; i++) { await page.keyboard.press('Tab'); await sleep(60); const c = await caret(page); stops.push(c.none ? '(body)' : `${c.tag}${c.id ? '#' + c.id : ''}${c.kind ? ':' + c.kind + '=' + c.key : ''}`) }
    await page.keyboard.type('QQQ', { delay: 10 }); await sleep(300)
    const s1 = await snap(page)
    return { stops, wrote: !same(s0, s1), diff: Object.keys(s0).filter(k => JSON.stringify(s0[k]) !== JSON.stringify(s1[k])) }
  }
  // view-only as admin
  await nav(page, 'viewsched')
  { const edCount = await page.locator(`#vWeek ${EDITABLE.split(',').join(',#vWeek ')}`).count()
    const day = page.locator('#vWeek .day[data-day="0"]').first()
    await day.evaluate(e => e.scrollIntoView({ block: 'start' })); await day.click({ position: { x: 20, y: 12 } }).catch(() => {})
    const r = await tapType('vw'); pics.push(await pic(page, 'P4c-14-viewonly-after-tabs'))
    checks.push(['View-only Sched (admin): no editable schedule box; Tab x12 + typing QQQ + Enter wrote nothing', edCount === 0 && !r.wrote, { editable: edCount, diff: r.diff, stops: r.stops.join(' > ') }]) }
  // previews on the board
  await openBoard(page, 0)
  for (const [nm, ver] of [['older version (Original)', ver0], ['latest version (the amendment)', ver1]]) {
    await page.locator('#schedBoard [data-planmenu]').first().click(); await sleep(300)
    await page.locator(`.wavemenu [data-planpv="${ver}"]`).first().click(); await sleep(700)
    const frozen = await page.locator('#sbBoard .pv-frozen').count()
    const ed = await page.locator(`#sbBoard ${EDITABLE.split(',').join(',#sbBoard ')}`).count()
    const rm = page.locator('#sbBoard [data-bfld="fr:0.0.0.0"]:visible').first()
    const rmInfo = await rm.evaluate(e => ({ tag: e.tagName, ro: e.readOnly, dis: e.disabled, ce: e.getAttribute('contenteditable') })).catch(() => null)
    await rm.click({ force: true }).catch(() => {})
    const roleBtns = await page.locator('[data-role-choose]:visible, .mission-role-question:visible').count()
    const r = await tapType('pv')
    pics.push(await pic(page, 'P4c-14-preview-' + (ver === ver0 ? 'older' : 'latest')))
    await page.locator('#schedBoard [data-golive="0"]').first().click().catch(() => {}); await sleep(600)
    checks.push([`Board preview, ${nm}: frozen, no editable box, typing QQQ wrote nothing`, frozen > 0 && ed === 0 && !r.wrote, { frozen, editable: ed, rmInfo, roleButtonsInPreview: roleBtns, diff: r.diff, stops: r.stops.join(' > ') }])
  }
  // live published Remarks box: Tab then QQQ -> a published day's text edit must go the amendment way, not through role action; record the role action
  checks.push(['live published day: focusing the Remarks box — what role action shows (the admin\'s published role action stays apart from text traversal)', true, liveBtn])
  await page.locator('#sbDone').click().catch(() => {}); await sleep(400)
  // member
  await page.locator('#logout').click().catch(() => {}); await sleep(800)
  await R.login(page, 'm')
  await nav(page, 'viewsched')
  { const edCount = await page.locator(`#vWeek ${EDITABLE.split(',').join(',#vWeek ')}`).count()
    const roleBtn = await page.locator('[data-role-choose], .mission-role-question').count()
    const day = page.locator('#vWeek .day[data-day="0"]').first()
    await day.evaluate(e => e.scrollIntoView({ block: 'start' })); await day.click({ position: { x: 20, y: 12 } }).catch(() => {})
    const r = await tapType('mem'); pics.push(await pic(page, 'P4c-14-member-after-tabs'))
    checks.push(['member View-only Sched: no editable box, no role button; Tab x12 + QQQ + Enter wrote nothing', edCount === 0 && roleBtn === 0 && !r.wrote, { editable: edCount, roleBtn, diff: r.diff, stops: r.stops.join(' > ') }]) }
  return { checks, pics }
})
await finish(PART)
