/* WALKER B — Astra's scenario 43: a 👁 look at each of three versions (Original flagged, AL1 hidden, AL2 flagged
   again) on Edit Schedule and on the Scheduler Board — each carries the hides IT went out with, read only; the working
   copy's own pending hide (Saint's clash, hidden after AL2) must not bleed into any of them. */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE, judge, row, pic, savePart, nIssues, lineOf, short, pk, flagged, K, bshort } = B
const S = '43', k = K.long
B.prefix('s43-')
const { browser, p, errors } = await B.world()
const bAll = id => B.pucks(p, '#schedBoard', id)
const bPucks = async id => (await bAll(id)).filter(q => q.where !== 'crew list')
try {
  await B.toEdit(p)
  await B.pubOrig(p, TUE)
  await B.hide(p, TUE, k.re); const a1 = await B.pubAL(p, TUE)
  await B.again(p, TUE, k.re); const a2 = await B.pubAL(p, TUE)
  const d3 = await B.hide(p, TUE, K.clash.re)
  let w = await B.work(p, TUE)
  const vs = await B.versions(p, TUE); await p.keyboard.press('Escape'); await L.sleep(200)
  let s0 = await pic(p, `s${S}-0-three-versions`)
  judge(`${S}.0`, 'setup: Original (flagged) → ✕ long day → AL1 → ↺ → AL2; then ✕ on Saint\'s clash on the working copy (pending)', [
    ['AL1 and AL2 went out', a1.r.pressed && a2.r.pressed && /AL2/.test(w.head.tag), [a1.r, a2.r, w.head.tag]], ['the working copy: the clash struck, the long day plain, 1 pending', d3 === 'pressed' && lineOf(w.list, K.clash.re).struck && !lineOf(w.list, k.re).struck && /^1\s*pending/.test(w.head.pending), [short(w.list), w.head.pending]],
    ['the plans selector offers Original, AL1, AL2', !!vs.vs && ['Original', 'AL1', 'AL2'].every(n => vs.vs.some(v => v.label.startsWith(n))), vs.vs && vs.vs.map(v => v.label)]], [s0])

  const want = { Original: { struck: false, n: 4 }, AL1: { struck: true, n: 3 }, AL2: { struck: false, n: 4 } }
  for (const name of ['Original', 'AL1', 'AL2']) {
    const x = want[name]
    /* ---- Edit Schedule ---- */
    await B.toEdit(p)
    const lk = await B.look(p, TUE, new RegExp('^' + name))
    await B.openList(p, '#eWeek', TUE)
    const list = await B.readList(p, '#eWeek', TUE), face = await B.lookFace(p, TUE)
    const l = lineOf(list, k.re), lc = lineOf(list, K.clash.re)
    const st = await B.dayPucks(p, '#eWeek', TUE, k.who), sa = await B.dayPucks(p, '#eWeek', TUE, 'salsa')
    const palette = await B.pucks(p, '#eRoster', k.who)
    const s1 = await pic(p, `s${S}-${name}-week-look`), s1p = await B.puckPic(p, '#eWeek', TUE, k.who, `s${S}-${name}-week-look-puck`)
    /* a tap on the long-day line (struck on AL1): it still lights its crew */
    let lit = null
    if (l) {
      await B.openList(p, '#eWeek', TUE)
      const t = p.locator(`#eWeek .day[data-day="${TUE}"] .witem[data-wix="${l.ix}"]`).first()
      await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150)
      const before = (await B.dayPucks(p, '#eWeek', TUE, k.who)).map(q => /wfoc/.test(q.cls))
      await t.click({ position: { x: 60, y: 12 } }).catch(() => {}); await L.sleep(450)
      const after = (await B.dayPucks(p, '#eWeek', TUE, k.who)).map(q => /wfoc/.test(q.cls))
      lit = { before, after, shot: await pic(p, `s${S}-${name}-week-line-tapped`) }
      /* the same tap again drops the focus (so the board starts clean) */
      await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150)
      await t.click({ position: { x: 60, y: 12 } }).catch(() => {}); await L.sleep(350)
    }
    judge(`${S}.${name}.week`, `Edit Schedule: plans selector → ${name} (👁 read-only)`, [
      ['the look opened', !lk.err && /Viewing the issued/.test(face.bar || ''), lk.err || face.bar],
      [`the bar reads ${x.n} issues`, nIssues(list) === x.n, list.bar], [`Static's long-day line is ${x.struck ? 'painted STRUCK' : 'NOT struck'}`, !!l && l.struck === x.struck, short(list)],
      ['Saint\'s clash is NOT struck (the working copy\'s pending hide does not bleed in)', !!lc && !lc.struck, short(list)],
      ['no ✕ and no ↺ on any line', list.lines.every(q => !q.btn) && face.woff === 0, short(list)], ['no sign-off boxes, no "Not yet signed" marker', face.signs === 0 && !face.nys, [face.signs, face.nys]],
      [`Static's puck in the day is ${x.struck ? 'plain' : 'flagged (L)'}`, st.length > 0 && (flagged(st).length > 0) === !x.struck, pk(st)],
      ['Saint\'s puck in the day carries its red clash flag', sa.some(q => q.sev === 'hard'), pk(sa)],
      ['a tap on the long-day line lights Static\'s pucks', !!lit && lit.after.some(Boolean), lit]], [s1, s1p, lit && lit.shot])
    row(`${S}.${name}.week.r`, `RECORDED — beside the ${name} look on Edit Schedule: the count chip on the day, and Static in the crew list beside the week`, `chip "${face.pend}" · crew list: ${pk(palette)}`, 'RECORDED', [s1])

    /* ---- the Scheduler Board (the look carries over; if not, the board's own selector) ---- */
    await W.boardOn(p, TUE); await L.sleep(500)
    let onLook = await p.evaluate(() => { const b = document.querySelector('#schedBoard .dprev-bar'); return b ? b.innerText.replace(/\s+/g, ' ') : '' })
    let via = 'the look carried from the week'
    if (!new RegExp(name).test(onLook)) { const r2 = await B.look(p, TUE, new RegExp('^' + name), '#schedBoard'); via = r2.err ? r2.err : 'the board\'s own plans selector'; onLook = await p.evaluate(() => { const b = document.querySelector('#schedBoard .dprev-bar'); return b ? b.innerText.replace(/\s+/g, ' ') : '' }) }
    await B.boardOpenFold(p)
    const bd = await B.readBoard(p)
    const bl = bd.lines ? bd.lines.find(q => k.re.test(q.text)) : null, bc = bd.lines ? bd.lines.find(q => /APPOINTMENT clash/.test(q.text)) : null
    const bst = await bPucks(k.who), bros = (await bAll(k.who)).filter(q => q.where === 'crew list')
    const bw = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return { woff: b.querySelectorAll('[data-woff]').length, signs: [...b.querySelectorAll('select[data-sign]')].filter(e => e.offsetParent !== null && !e.disabled).length, nys: (b.querySelector('.nysmark') || {}).innerText || '', pend: (b.querySelector('.dpend') || {}).innerText || '' } })
    const s2 = await pic(p, `s${S}-${name}-board-look`)
    let blit = null
    if (bl) {
      const t = p.locator(`#schedBoard .sb-warn .wln[data-wix="${bl.ix}"]`).first()
      await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150)
      const before = (await bPucks(k.who)).map(q => /wfoc/.test(q.cls))
      await t.click({ position: { x: 50, y: 10 } }).catch(() => {}); await L.sleep(450)
      const after = (await bPucks(k.who)).map(q => /wfoc/.test(q.cls))
      blit = { before, after, shot: await pic(p, `s${S}-${name}-board-line-tapped`) }
    }
    const nb = /(\d+) (issue|conflict|check)/i.exec(bd.head || '')
    judge(`${S}.${name}.board`, `the Scheduler Board on Tuesday, looking at ${name} (${via})`, [
      ['the board shows the look\'s bar', new RegExp(name).test(onLook) && /read-only/.test(onLook), onLook],
      [`its issues panel counts ${x.n}`, !!nb && +nb[1] === x.n, bd.head], [`Static's long-day line is ${x.struck ? 'painted STRUCK' : 'NOT struck'}`, !!bl && bl.struck === x.struck, bshort(bd)],
      ['Saint\'s clash is NOT struck', !!bc && !bc.struck, bshort(bd)], ['no ✕ and no ↺ on any line', !!bd.lines && bd.lines.every(q => !q.btn) && bw.woff === 0, bshort(bd)],
      ['no "Not yet signed" marker', !bw.nys, bw],
      [`Static's pucks on the board are ${x.struck ? 'plain' : 'flagged (L)'}`, bst.length > 0 && (flagged(bst).length > 0) === !x.struck, pk(bst)],
      ['a tap on the long-day line lights Static\'s pucks', !!blit && blit.after.some(Boolean), blit]], [s2, blit && blit.shot])
    row(`${S}.${name}.board.r`, `RECORDED — beside the ${name} look on the board: the count chip, the sign-off boxes that can be changed`, `chip "${bw.pend}" · open sign-off boxes ${bw.signs} · Static in the board's crew list: ${pk(bros)}`, 'RECORDED', [s2])
    const back = await B.backLive(p, TUE, '#schedBoard')
    await W.boardOff(p)
    if (back !== 'back') { await B.toEdit(p); await B.backLive(p, TUE) }
  }
  /* after every look: the working copy is untouched */
  w = await B.work(p, TUE)
  const s9 = await pic(p, `s${S}-9-work-after-looks`)
  judge(`${S}.9`, 'back on the live copy after the six looks', [
    ['the working copy is as it was: the clash struck with ↺, the long day plain with ✕, 1 pending, AL2', lineOf(w.list, K.clash.re).struck && lineOf(w.list, K.clash.re).btn === '↺' && !lineOf(w.list, k.re).struck && /^1\s*pending/.test(w.head.pending) && /AL2/.test(w.head.tag), [short(w.list), w.head.pending, w.head.tag]]], [s9])
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
