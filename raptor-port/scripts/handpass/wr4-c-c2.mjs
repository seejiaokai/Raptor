// Walker c — C2, a puck dragged back onto its own seat (copied from words-r4.mjs q4b). Run: node scripts/handpass/wr4-c-c2.mjs
console.log('wr4-c-c2 v4')
const C = await (await import('./wr4-c-common.mjs')).setup('c2')
const { newPage, signIn, handOver, go, sleep, judge, save, note, noteGone, bundleOf, log, shot, finish, catchToast, releaseToast, shownToast } = C

const undoState = (page, sel) => page.evaluate(sel => { const b = document.querySelector(sel); return b ? { disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', title: b.getAttribute('title') || b.getAttribute('aria-label') || '' } : null }, sel)
const histLen = page => page.evaluate(() => { try { return window.commandStreamLen ? window.commandStreamLen() : null } catch { return null } })
const slotPeople = (page, root, key, attr = 'data-slot') => page.evaluate(([root, key, attr]) => [...document.querySelectorAll(`${root} [${attr}="${key}"] .puck[data-person]`)].filter(p => p.getBoundingClientRect().width > 3).map(p => p.getAttribute('data-person')), [root, key, attr])

async function dragBack(w, c, step, root, key, person, nth = 0, attr = 'data-slot', undoSel = '#undoBtn') {
  const expectedCs = await w.page.evaluate(p => window.PEOPLE[p]?.cs || p, person)
  const exp = `${expectedCs} — already in that seat`
  const puckSel = `${root} [${attr}="${key}"] .puck[data-person="${person}"]`
  const puck = w.page.locator(puckSel).filter({ visible: true }).nth(nth)
  if (!(await puck.count())) { judge(c, step, 'NOT WALKED', 'no puck ' + puckSel, exp); return }
  await puck.scrollIntoViewIfNeeded(); await sleep(250)
  await noteGone(w)
  const before = await slotPeople(w.page, root, key, attr), uB = await undoState(w.page, undoSel), hB = await histLen(w.page)
  const a = await puck.boundingBox()
  const cx = a.x + a.width / 2, cy = a.y + a.height / 2
  await w.page.mouse.move(cx, cy); await w.page.mouse.down()
  await w.page.mouse.move(cx + 10, cy + 10, { steps: 3 })
  await w.page.mouse.move(cx + 60, cy + 70, { steps: 8 }); await sleep(120)
  const ghost = await w.page.evaluate(() => { const g = [...document.querySelectorAll('.drag-ghost, .ghost, [class*="ghost"], .dragging')].find(e => e.getBoundingClientRect().width > 3); return g ? String(g.className).slice(0, 60) : null })
  await w.page.screenshot({ path: `${process.env.WR4_OUT}/c2-${step}-carried.png`, clip: { x: Math.max(0, cx - 220), y: Math.max(0, cy - 140), width: 520, height: 320 } })
  /* back to the seat where it NOW stands (the board can scroll under a carried puck) */
  const back = await w.page.evaluate(([root, key, attr]) => { const s = [...document.querySelectorAll(`${root} [${attr}="${key}"]`)].find(e => e.getBoundingClientRect().width > 3); if (!s) return null; const r = s.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 40), y: r.top + r.height / 2 } }, [root, key, attr])
  const bx = back ? back.x : cx, by = back ? back.y : cy
  await w.page.mouse.move(bx, by, { steps: 10 }); await sleep(250)
  await w.page.mouse.up()
  /* the seat at the drop, at once */
  await w.page.screenshot({ path: `${process.env.WR4_OUT}/c2-${step}-drop.png`, clip: { x: Math.max(0, cx - 220), y: Math.max(0, cy - 140), width: 520, height: 320 } })
  const seatAtDrop = await w.page.evaluate(([root, key, attr]) => { const s = [...document.querySelectorAll(`${root} [${attr}="${key}"]`)].find(e => e.getBoundingClientRect().width > 3); return s ? { cls: String(s.className).slice(0, 80), text: (s.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) } : null }, [root, key, attr])
  const r = await note(w, c, `c2-${step}-note`, /./, 3000)
  await sleep(400)
  const after = await slotPeople(w.page, root, key, attr), uA = await undoState(w.page, undoSel), hA = await histLen(w.page)
  const got = { note: r.text || r.now || '', before, after, undoBefore: uB, undoAfter: uA, hist: [hB, hA], ghostWhileCarried: ghost, seatAtDrop }
  const ok = got.note === exp && JSON.stringify(before) === JSON.stringify(after) && JSON.stringify(uB) === JSON.stringify(uA) && hB === hA
  judge(c, step, ok ? 'PASS' : 'FAIL', got, exp, r.pic || `c2-${step}-drop.png`)
}

const ROOTS = [['week', '#eWeek', '#undoBtn'], ['board', '#schedBoard', '#sbUndo']]
const w = await newPage('desk'); await signIn(w, 'ad')
log('C2', 'bundle desk: ' + await bundleOf(w.page))
let G2ROW = []
/* fixture: a second man on Monday's first ground row, by the board's own "+" place and a tap on a free name */
try {
  await go(w.page, 'editsched')
  await w.page.evaluate(() => window.openScheduler(0)); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
  const fill = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard [data-fill^="g:0."]')].find(x => x.getBoundingClientRect().width > 3); return e ? e.getAttribute('data-fill') : null })
  if (fill) {
    const pl = w.page.locator(`#schedBoard [data-fill="${fill}"]`).first(); await pl.scrollIntoViewIfNeeded(); await pl.click(); await sleep(350)
    const man = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].find(x => x.offsetParent && !x.classList.contains('no') && !x.classList.contains('busy') && window.PEOPLE[x.getAttribute('data-person')] && !window.PEOPLE[x.getAttribute('data-person')].special); return e ? e.getAttribute('data-person') : null })
    await w.page.locator(`#sbRoster .rpuck[data-person="${man}"]:visible`).first().click(); await sleep(600)
    const row = await w.page.evaluate(f => { const pre = f.replace(/\.\+$/, ''); return [...document.querySelectorAll(`#schedBoard [data-slot^="${pre}"]`)].map(e => [e.getAttribute('data-slot'), [...e.querySelectorAll('.puck[data-person]')].map(p => p.getAttribute('data-person'))]) }, fill)
    G2ROW = row.filter(r => r[1].length)
    log('C2', `fixture: ${man} put via ${fill}; the row's seats ${JSON.stringify(row)}; note ${JSON.stringify(await shownToast(w.page))}`)
  } else log('C2', 'fixture: no ground "+" place on the board')
  await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300)
  const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(600) }
} catch (e) { log('C2', 'fixture error ' + e.message.split('\n')[0]) }
for (const [where, root, undoSel] of ROOTS) {
  const c = 'C2'
  try {
    await go(w.page, 'editsched'); await w.page.evaluate(() => scrollTo(0, 0))
    if (where === 'board') { await w.page.evaluate(() => window.openScheduler(0)); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900) }
    const seats = await w.page.evaluate(root => {
      const vis = e => e.getBoundingClientRect().width > 3
      const first = re => { const s = [...document.querySelectorAll(root + ' [data-slot]')].find(e => vis(e) && new RegExp(re).test(e.getAttribute('data-slot')) && e.querySelector('.puck[data-person]') && !window.PEOPLE[e.querySelector('.puck[data-person]').getAttribute('data-person')]?.special); return s ? { key: s.getAttribute('data-slot'), who: [...s.querySelectorAll('.puck[data-person]')].map(p => p.getAttribute('data-person')) } : null }
      const g2 = [...document.querySelectorAll(root + ' [data-slot^="g:0."]')].find(e => vis(e) && e.querySelectorAll('.puck[data-person]').length >= 2) || (() => { const two = [...document.querySelectorAll(root + ' [data-slot^="g:0."]')].filter(e => vis(e) && e.querySelector('.puck[data-person]')); const byRow = {}; for (const e of two) { const k = e.getAttribute('data-slot').split('.').slice(0, 2).join('.'); (byRow[k] ||= []).push(e) } const r = Object.values(byRow).find(v => v.length >= 2); return r ? null : null })()
      const inps = [...document.querySelectorAll(root + ' [data-inpseat]')].filter(e => vis(e) && e.querySelector('.puck[data-person]')); const inp = inps.find(e => { const id = e.getAttribute('data-inpseat').split('~')[0]; const r = window.INPUTS.find(x => String(x.iid) === id); return r && !/L$|leave|MC|MED/i.test(r.type) }) || inps[0]
      return { fly: first('^\\d+\\.\\d+\\.\\d+\\.\\d+\\.p$'), duty: first('^d:0\\.'), ground: first('^g:0\\.'), ground2: g2 ? { key: g2.getAttribute('data-slot'), who: [...g2.querySelectorAll('.puck[data-person]')].map(p => p.getAttribute('data-person')) } : null, sim: first('^s:0\\.oft\\.\\d+\\.p$'), simPax: first('^s:0\\.amt\\.\\d+\\.pax'), alert: first('^a:0\\.'), inp: inp ? { key: inp.getAttribute('data-inpseat'), who: [inp.querySelector('.puck[data-person]').getAttribute('data-person')] } : null }
    }, root)
    log(c, where + ' seats ' + JSON.stringify(seats))
    for (const kind of ['fly', 'duty', 'ground', 'sim', 'simPax', 'alert']) if (seats[kind]) await dragBack(w, c, `${kind}-${where}-desk`, root, seats[kind].key, seats[kind].who[0], 0, 'data-slot', undoSel); else judge(c, `${kind}-${where}-desk`, 'NOT WALKED', 'no such seat drawn', '')
    if (seats.ground2) { await dragBack(w, c, `ground1st-${where}-desk`, root, seats.ground2.key, seats.ground2.who[0], 0, 'data-slot', undoSel); await dragBack(w, c, `ground2nd-${where}-desk`, root, seats.ground2.key, seats.ground2.who[1], 0, 'data-slot', undoSel) }
    else if (G2ROW.length >= 2) { await dragBack(w, c, `ground1st-${where}-desk`, root, G2ROW[0][0], G2ROW[0][1][0], 0, 'data-slot', undoSel); await dragBack(w, c, `ground2nd-${where}-desk`, root, G2ROW[1][0], G2ROW[1][1][0], 0, 'data-slot', undoSel) }
    else judge(c, `ground two men ${where}`, 'NOT WALKED', 'no ground row with two men: ' + JSON.stringify(G2ROW), '')
    if (seats.inp) await dragBack(w, c, `inputrow-${where}-desk`, root, seats.inp.key, seats.inp.who[0], 0, 'data-inpseat', undoSel)
    else judge(c, `inputrow-${where}-desk`, 'NOT WALKED', 'no input row with a puck drawn on Monday', '')
    if (where === 'board') {
      /* a placeholder in a seat: ALL AVAIL put by a tap into an empty seat (the recipe), the tap's twin, then the drag */
      const e2 = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot]')].find(x => x.getBoundingClientRect().width > 4); return e ? e.getAttribute('data-slot') : null })
      const s2 = `#schedBoard [data-slot="${e2}"]`, pn = '#sbRoster .rpuck[data-person="allavail"]'
      await w.page.locator(s2).first().scrollIntoViewIfNeeded(); await w.page.locator(s2).first().click(); await sleep(350)
      await w.page.locator(pn + ':visible').first().click(); await sleep(500)
      log(c, `placeholder put in ${e2}: holds ${JSON.stringify(await w.page.evaluate(k => window.slotVal(k), e2))}; note ${JSON.stringify(await shownToast(w.page))}`)
      await noteGone(w)
      await w.page.locator(s2 + ' .puck:visible, ' + s2).first().click(); await sleep(350)
      const armed = await w.page.evaluate(() => (window.ARM && window.ARM.key) || null)
      const uB = await undoState(w.page, '#sbUndo')
      await w.page.locator(pn + ':visible').first().click()
      const r = await note(w, c, 'c2-placeholder-tap-board-desk', /./, 3000)
      judge(c, 'placeholder tap twin board desk', r.text === 'ALL AVAIL — already in that seat' ? 'PASS' : 'FAIL', { armed, note: r.text || r.now, undo: [uB, await undoState(w.page, '#sbUndo')] }, 'ALL AVAIL — already in that seat', r.pic)
      await w.page.keyboard.press('Escape'); await sleep(300)
      await dragBack(w, c, 'placeholder-board-desk', '#schedBoard', e2, 'allavail', 0, 'data-slot', '#sbUndo')
      /* and the same placeholder seat seen on the week */
      const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(600) }
      await go(w.page, 'editsched')
      await dragBack(w, c, 'placeholder-week-desk', '#eWeek', e2, 'allavail', 0, 'data-slot', '#undoBtn')
    }
  } catch (e) { console.log('ERR', where, e.message.split('\n')[0]); C.facts.errors.push(where + ' ' + e.stack) }
}
/* the phone: is a drag possible on the board? one finger, carried off and back, rested, lifted */
try {
  const p = await handOver(w, 'phone', 'ad')
  await go(p.page, 'editsched')
  await p.page.evaluate(() => window.openScheduler(0)); await p.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
  const puck = p.page.locator('#schedBoard [data-slot="0.0.0.1.p"] .puck[data-person="bane"]').filter({ visible: true }).first()
  if (await puck.count()) {
    await puck.scrollIntoViewIfNeeded(); await sleep(300)
    const a = await puck.boundingBox(); const x = a.x + a.width / 2, y = a.y + a.height / 2
    const cdp = await p.ctx.newCDPSession(p.page)
    const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y })) })
    const before = await slotPeople(p.page, '#schedBoard', '0.0.0.1.p'), sY = await p.page.evaluate(() => scrollY)
    await T('touchStart', [[x, y]]); await sleep(450)
    for (let i = 1; i <= 8; i++) { await T('touchMove', [[x + i * 6, y + i * 8]]); await sleep(30) }
    await p.page.screenshot({ path: `${process.env.WR4_OUT}/c2-drag-carried-phone.png` })
    for (let i = 7; i >= 0; i--) { await T('touchMove', [[x + i * 6, y + i * 8]]); await sleep(30) }
    await sleep(90); await T('touchEnd', [])
    await p.page.screenshot({ path: `${process.env.WR4_OUT}/c2-drag-drop-phone.png` })
    const r = await note(p, 'C2', 'c2-drag-note-phone', /./, 3000)
    judge('C2', 'drag phone board', 'RECORD', { note: r.text || r.now || '', before, after: await slotPeople(p.page, '#schedBoard', '0.0.0.1.p'), scrollMoved: (await p.page.evaluate(() => scrollY)) - sY }, 'is a drag possible; what it says', r.pic || 'c2-drag-drop-phone.png')
  } else judge('C2', 'drag phone board', 'NOT WALKED', 'no Ranger puck on the phone board', '')
  await p.ctx.close()
} catch (e) { console.log('ERR phone', e.message.split('\n')[0]); C.facts.errors.push('phone ' + e.stack) }
save(); await finish()
console.log('errors:', C.facts.errors.length, C.facts.errors.slice(0, 5).map(s => s.slice(0, 200)))
