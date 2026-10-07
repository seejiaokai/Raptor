/* walker B — S23 (the + buttons, repeated presses, missing take-off) and S24 (Escape versus delete; HP_PHONE=1 for the phone) */
import * as K from './ows-B-lib.mjs'
const { judge, row, savePart, sleep, pic } = K
const PH = !!process.env.HP_PHONE
const errs = []
const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !only || only.includes(id)
const wrap = async (id, fn) => { try { await fn() } catch (e) { row(id, 'script', 'SCRIPT ERROR ' + String(e.stack || e).slice(0, 500), 'NOT WALKED') } }
const allWarns = (p, di) => p.evaluate(i => ((window.WARN.byDay[i] || {}).warns || []).map(w => `${w.sev}/${w.code}: ${String(w.msg).slice(0, 110)}`), di)

/* ---------------- S23 ---------------- */
async function plus(p, surf, di, wi) {
  if (surf === 'board') await K.toBoard(p, di); else { await K.closeBoard(p); await K.toWeek(p); await K.W.showDay(p, di) }
  await K.addItBtn(p, di, wi)
  return K.intimes(p, di, wi)
}
if (want('S23')) {
  for (const variant of ['nominal', 'resolved']) await wrap('S23-' + variant, async () => {
    const T = 'S23-' + variant
    const wd = await K.world(); const { p, browser } = wd
    const base = await K.baseline(p, 'bane')
    await K.L.go(p, 'editsched'); await sleep(300)
    const w = await K.flight(p, 5, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
    const trace = []
    if (variant === 'resolved') {
      trace.push(['board +', await plus(p, 'board', 5, w.wi)])
      await K.setItLine(p, 5, w.wi, 0, 'IN TIME 08:30')
      trace.push(['line typed 08:30', await K.intimes(p, 5, w.wi)])
    }
    trace.push(['week +', await plus(p, 'week', 5, w.wi)])
    const picA = await pic(p, T + '-week1')
    trace.push(['board +', await plus(p, 'board', 5, w.wi)])
    const picB = await pic(p, T + '-board1')
    trace.push(['week + again', await plus(p, 'week', 5, w.wi)])
    trace.push(['board + again', await plus(p, 'board', 5, w.wi)])
    const picC = await pic(p, T + '-board2')
    const last = trace[trace.length - 1][1]
    const pub = await K.publishNew(p, 5); await K.closeBoard(p)
    const o = await K.oilOf(p, 'bane', K.SAT, T + '-pub')
    const exp = variant === 'nominal' ? ['HO', '09:00', 0.5] : ['FO', '08:30', 1]
    judge(T, variant === 'nominal'
      ? 'Saturday flight 12:00–13:00, no report: "+ In-time / Rally" pressed on the week, on the board, and again on each; published'
      : 'same flight, first line typed IN TIME 08:30, then "+ In-time / Rally" pressed on the week, the board and again on each; published', [
      ['every press leaves the clock at ' + exp[1] + ' (no line reads another clock)', last.length > 0 && last.every(l => (variant === 'nominal' ? /09:00/ : /08:30/).test(l)), trace.map(t => t[0] + ': ' + JSON.stringify(t[1]))],
      ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
      ['cell ' + exp[0], o.letters === exp[0], o.cell.text], ['worked ' + exp[1] + '–15:00', new RegExp(exp[1] + '.15:00').test(o.row), o.row.slice(0, 150)], ['balance +' + exp[2], +o.bal === +base.bal + exp[2], { base: base.bal, now: o.bal }]], [picA, picB, picC, ...o.pics])
    errs.push(...wd.errors); await browser.close()
  })
  await wrap('S23-notakeoff', async () => {
    const T = 'S23-notakeoff'
    const wd = await K.world(); const { p, browser } = wd
    const base = await K.baseline(p, 'bane')
    await K.L.go(p, 'editsched'); await sleep(300)
    const w = await K.flight(p, 5, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
    await K.toBoard(p, 5)
    await K.W.boardText(p, `ff:5.${w.wi}.0.to`, '')
    await K.W.boardText(p, `ff:5.${w.wi}.0.ld`, '')
    const ff = await p.evaluate(([i, g]) => JSON.stringify(window.DAYS[i].waves[g].forms ? window.DAYS[i].waves[g].forms[0] : window.DAYS[i].waves[g]).slice(0, 220), [5, w.wi])
    const lines = await plus(p, 'board', 5, w.wi)
    const lines2 = await plus(p, 'week', 5, w.wi)
    const pre = await pic(p, T + '-week')
    const warns = await allWarns(p, 5)
    const pub = await K.publishNew(p, 5); await K.closeBoard(p)
    const o = await K.oilOf(p, 'bane', K.SAT, T + '-pub')
    const d = await K.dayState(p, 5, T + '-day', { list: false })
    judge(T, 'Saturday wave whose take-off and landing were blanked; "+ In-time / Rally" pressed (board, then week); then the day published', [
      ['no clock invented by the button', lines.concat(lines2).every(l => !/\d\d:?\d\d/.test(l)) || lines.length === 0, { board: lines, week: lines2 }],
      ['no credit: cell empty', !/HO|FO/.test(o.cell.text || ''), o.cell.text], ['balance unchanged', +o.bal === +base.bal, { base: base.bal, now: o.bal }]], [pre, ...o.pics, ...d.pics])
    row(T + '-words', 'the line\'s boxes, the day\'s warning words, what publishing did', JSON.stringify({ ff, warns, pubr: pub.r, head: pub.head }), 'RECORDED', [pre])
    errs.push(...wd.errors); await browser.close()
  })
}

/* ---------------- S24 ---------------- */
async function published0830() {
  const wd = await K.world(); const { p, browser } = wd
  const base = await K.baseline(p, 'bane')
  await K.L.go(p, 'editsched'); await sleep(300)
  const w = await K.flight(p, 5, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
  await K.toBoard(p, 5)
  const add = await K.addLines(p, 5, w.wi, ['IN TIME 08:30'])
  const pub = await K.publishNew(p, 5); await K.closeBoard(p)
  const o0 = await K.oilOf(p, 'bane', K.SAT, 'base')
  return { wd, p, browser, base, w, add, pub, o0 }
}
const T24 = PH ? 'S24ph' : 'S24'
if (want('S24')) {
  /* a: Escape, then (same world) delete */
  await wrap('S24a', async () => {
    const { wd, p, browser, base, w, add, pub, o0 } = await published0830()
    const ok0 = o0.letters === 'FO' && /08:30.15:00/.test(o0.row)
    await K.toBoard(p, 5)
    const el = p.locator(`#schedBoard [data-itline="5|${w.wi}|0"]:visible`).first()
    await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('IN TIME 10:00', { delay: 8 })
    const typed = await el.evaluate(e => e.innerText || e.value)
    await p.keyboard.press('Escape'); await sleep(500)
    const after = await K.intimes(p, 5, w.wi)
    const shown = await el.evaluate(e => e.innerText || e.value).catch(() => '(gone)')
    const picEsc = await pic(p, T24 + 'a-escape')
    await K.closeBoard(p)
    const dEsc = await K.dayState(p, 5, T24 + 'a-esc-day')
    const oEsc = await K.oilOf(p, 'bane', K.SAT, T24 + 'a-esc')
    judge(T24 + '.a', 'published IN TIME 08:30 (FO); the line typed over with 10:00 but Escape pressed', [
      ['base: published FO 08:30–15:00', ok0 && pub.head.tag === 'ORIG', { cell: o0.cell.text, row: o0.row.slice(0, 100) }],
      ['while typing the box read 10:00', /10:00/.test(typed), typed], ['after Escape the line holds ' + JSON.stringify(after), /08:?30/.test(after[0] || ''), { stored: after, shown }],
      ['no pending', dEsc.pend === '0', dEsc.head.pending], ['paid FO 08:30 holds', oEsc.letters === 'FO' && /08:30.15:00/.test(oEsc.row), oEsc.row.slice(0, 100)], ['balance unchanged', oEsc.bal === o0.bal, { was: o0.bal, now: oEsc.bal }]], [picEsc, ...dEsc.pics, ...oEsc.pics])
    /* delete the line */
    await K.toBoard(p, 5)
    const del = p.locator(`#schedBoard [data-itdel="5|${w.wi}|0"]:visible`).first()
    const hasDel = await del.count()
    if (hasDel) { await del.evaluate(e => e.scrollIntoView({ block: 'center' })); await del.click(); await sleep(600) }
    const lines = await K.intimes(p, 5, w.wi)
    const picDel = await pic(p, T24 + 'b-deleted')
    await K.closeBoard(p)
    const d2 = await K.dayState(p, 5, T24 + 'b-del-day')
    const o2 = await K.oilOf(p, 'bane', K.SAT, T24 + 'b-del')
    const am = await K.publishAm(p, 5); await K.closeBoard(p)
    const o3 = await K.oilOf(p, 'bane', K.SAT, T24 + 'b-am')
    judge(T24 + '.b', 'the line then deleted with its own ✕; then Publish AL', [
      ['✕ was there', !!hasDel, hasDel], ['no In-time/Rally line left', lines.length === 0, lines], ['1 pending', d2.pend === '1', d2.head.pending],
      ['paid FO 08:30 holds until amendment', o2.letters === 'FO' && /08:30.15:00/.test(o2.row), o2.row.slice(0, 100)],
      ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
      ['now HO 09:00–15:00 (nominal)', o3.letters === 'HO' && /09:00.15:00/.test(o3.row), { cell: o3.cell.text, row: o3.row.slice(0, 100) }], ['balance +0.5', +o3.bal === +base.bal + 0.5, { base: base.bal, now: o3.bal }]], [picDel, ...d2.pics, ...o2.pics, ...o3.pics])
    errs.push(...wd.errors); await browser.close()
  })
  /* c: commit 10:00, then amend */
  await wrap('S24c', async () => {
    const { wd, p, browser, base, w, add, pub, o0 } = await published0830()
    await K.toBoard(p, 5)
    await K.setItLine(p, 5, w.wi, 0, 'IN TIME 10:00')
    const lines = await K.intimes(p, 5, w.wi)
    const pic1 = await pic(p, T24 + 'c-board')
    await K.closeBoard(p)
    const d2 = await K.dayState(p, 5, T24 + 'c-day')
    const o2 = await K.oilOf(p, 'bane', K.SAT, T24 + 'c-held')
    const am = await K.publishAm(p, 5); await K.closeBoard(p)
    const o3 = await K.oilOf(p, 'bane', K.SAT, T24 + 'c-am')
    judge(T24 + '.c', 'published IN TIME 08:30 (FO); the line committed as IN TIME 10:00; then Publish AL', [
      ['line reads 10:00', /10:00/.test(lines[0] || ''), lines], ['1 pending', d2.pend === '1', d2.head.pending],
      ['paid FO 08:30 holds', o2.letters === 'FO' && /08:30.15:00/.test(o2.row), o2.row.slice(0, 100)], ['balance holds', o2.bal === o0.bal, { was: o0.bal, now: o2.bal }],
      ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
      ['now HO 10:00–15:00', o3.letters === 'HO' && /10:00.15:00/.test(o3.row), { cell: o3.cell.text, row: o3.row.slice(0, 100) }], ['balance +0.5', +o3.bal === +base.bal + 0.5, { base: base.bal, now: o3.bal }]], [pic1, ...d2.pics, ...o2.pics, ...o3.pics])
    errs.push(...wd.errors); await browser.close()
  })
}
console.log('ERRORS', JSON.stringify(errs))
savePart('ows-B-sC' + (PH ? 'ph' : '') + (only ? '-' + only.join('') : ''), { errors: errs })
