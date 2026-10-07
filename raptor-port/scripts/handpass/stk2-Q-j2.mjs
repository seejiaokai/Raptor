/* H-02 (second pass, walker Q) â€” the Blue/Red answer draws no mark on the schedule. Same states as before (unanswered, Red, Blue),
   but every capture is a whole-viewport picture taken from a NEUTRAL state (caret out, pointer parked, toast gone), and the three
   pictures of a surface are compared pixel by pixel: where do they differ, and what is painted there. Controls only. */
import * as C from './stk2-Q-lib.mjs'
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { PNG } = require('playwright-core/lib/utilsBundle')
const { L, W } = C
const J = x => JSON.stringify(x)
const w = await C.world(); const p = w.p
const pics = [], log = [], checks = []
const SURF = {
  board: { go: async () => { await C.board(p, 0) } },
  week: { go: async () => { await W.boardOff(p); await L.go(p, 'editsched'); await W.showDay(p, 0) } },
  view: { go: async () => { await W.boardOff(p); await L.go(p, 'viewsched'); await W.showDay(p, 0, '#vWeek') } },
}
const SHOTS = {}
async function neutral() {
  await p.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur(); window.scrollTo(0, 0) })
  await p.mouse.move(2, 450); await C.sleep(3500)   // toast and hover gone
}
async function capture(state) {
  for (const [k, s] of Object.entries(SURF)) {
    await s.go(); await neutral()
    /* a fixed place on the page: the top of the day / the board's first wave */
    await p.evaluate(k => {
      if (k === 'board') { const e = document.querySelector('#schedBoard .sb-go'); if (e) e.scrollIntoView({ block: 'start' }) }
      else { const d = document.querySelector((k === 'week' ? '#eWeek' : '#vWeek') + ' .day[data-day="0"]'); if (d) d.scrollIntoView({ block: 'start', inline: 'nearest' }) }
    }, k)
    await p.mouse.move(2, 450); await C.sleep(600)
    const f = await C.pic(p, `h02b-${k}-${state}`)
    pics.push(f)
    SHOTS[`${k}/${state}`] = { file: f, buf: await p.screenshot() }
    SHOTS[`${k}/${state}`].dom = await p.evaluate(k => { const e = document.querySelector(k === 'board' ? '#schedBoard' : (k === 'week' ? '#eWeek' : '#vWeek')); return e ? e.outerHTML : '' }, k)
  }
}
function diffOf(a, b) {
  const A = PNG.sync.read(a), B = PNG.sync.read(b)
  if (A.width !== B.width || A.height !== B.height) return { size: 'differs' }
  let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1
  for (let y = 0; y < A.height; y++) for (let x = 0; x < A.width; x++) {
    const i = (y * A.width + x) * 4
    if (Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 12) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  }
  return { n, bbox: n ? [x0, y0, x1, y1] : null }
}
try {
  await C.tracking(p, true); await C.board(p, 0)
  await C.bset(p, 'ff:0.0.0.msn', 'ACM'); await C.bset(p, 'fr:0.0.0.0', 'DS FOR RU')
  await C.side(p, 'later')
  await capture('1-unanswered')
  await C.board(p, 0)
  await C.openQuestion(p, 0, { published: false }); await C.side(p, 'red')
  await capture('2-red')
  await C.board(p, 0)
  await C.openQuestion(p, 0, { published: false }); await C.side(p, 'blue')
  await capture('3-blue')
  /* three formations at once: Red / Blue / unanswered */
  await C.board(p, 0)
  await C.openQuestion(p, 0, { published: false }); await C.side(p, 'red')
  await C.bset(p, 'ff:0.0.1.msn', 'ACM'); await C.bset(p, 'fr:0.0.1.0', 'DS FROM RU'); await C.side(p, 'blue')
  await C.bset(p, 'ff:0.1.0.msn', 'ACM'); await C.bset(p, 'fr:0.1.0.0', 'DS FOR RU'); await C.side(p, 'later')
  for (const k of ['board', 'week', 'view']) { await SURF[k].go(); await neutral(); pics.push(await C.pic(p, `h02b-three-${k}`)) }
  const rows = []
  for (const k of ['board', 'week', 'view']) {
    for (const [a, b] of [['1-unanswered', '2-red'], ['2-red', '3-blue'], ['1-unanswered', '3-blue']]) {
      const d = diffOf(SHOTS[`${k}/${a}`].buf, SHOTS[`${k}/${b}`].buf)
      let what = null
      if (d.bbox) {
        const cx = Math.round((d.bbox[0] + d.bbox[2]) / 2), cy = Math.round((d.bbox[1] + d.bbox[3]) / 2)
        what = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.tagName + '.' + String(e.className).slice(0, 50) + ' "' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40) + '"') : null }, [cx, cy]).catch(() => null)
      }
      rows.push(`${k} ${a} vs ${b}: ${d.size || (d.n + ' px differ' + (d.bbox ? ' in box ' + J(d.bbox) : ''))}${what ? ' (the element there now: ' + what + ')' : ''}`)
      log.push(rows[rows.length - 1])
    }
  }
  /* what the DOM of each surface says that differs in the three states, apart from the day's change count */
  const strip = s => s.replace(/(\d+)(&nbsp;|\s)changes?/g, 'N changes').replace(/rid="[^"]*"/g, '')
  for (const k of ['board', 'week', 'view']) {
    const same = strip(SHOTS[`${k}/1-unanswered`].dom) === strip(SHOTS[`${k}/2-red`].dom) && strip(SHOTS[`${k}/2-red`].dom) === strip(SHOTS[`${k}/3-blue`].dom)
    log.push(`${k}: the surface's HTML apart from the day's "N changes" count is identical in the three states: ${same}`)
    if (!same) for (const [a, b] of [['1-unanswered', '2-red'], ['2-red', '3-blue']]) { const x = strip(SHOTS[`${k}/${a}`].dom), y = strip(SHOTS[`${k}/${b}`].dom); let i = 0; while (i < x.length && x[i] === y[i]) i++; log.push(`${k} ${a}->${b} first markup difference at ${i}: «${x.slice(Math.max(0, i - 120), i + 100)}» vs «${y.slice(Math.max(0, i - 120), i + 100)}»`) }
    checks.push([`${k}: nothing but the day's change count differs in the markup (unanswered / Red / Blue)`, same, ''])
  }
  /* the print path */
  await C.board(p, 0)
  await C.publish2(p, 0)
  await W.boardOff(p); await L.go(p, 'editsched'); await C.sleep(500)
  await p.locator('#exportPdf:visible').first().click(); await C.sleep(1500)
  let html = null
  for (const f of p.frames()) { if (f === p.mainFrame()) continue; try { const c = await f.content(); if (c && c.length > 500) html = c } catch (e) {} }
  let printNote = 'print sheet NOT captured'
  if (html) {
    const pg = await p.context().newPage(); await pg.setViewportSize({ width: 1100, height: 900 }); await pg.setContent(html); await C.sleep(400)
    pics.push(await C.pic(pg, 'h02b-print-preview'))
    const txt = await pg.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
    const hit = ['Blue', 'Red', 'mission role', 'role'].filter(t => new RegExp(t, 'i').test(txt.replace(/RED AIR|Red box/gi, '')))
    printNote = `print sheet captured (${html.length} chars); words Blue/Red/role in it apart from the typed "RED AIR": ${J(hit)}; role attributes in its HTML: ${J(/mission-role|data-role|mix-blue|mix-red/.test(html))}`
    checks.push(['the printed sheet carries no Blue/Red/role words or attributes', !hit.length && !/mission-role|data-role|mix-blue|mix-red/.test(html), printNote])
    await pg.close()
  } else checks.push(['the printed sheet could be read', false, printNote])
  log.push(printNote)
  const bad = checks.filter(c => !c[1])
  C.row('H-02', 'Mon VL (ACM, "DS FOR RU") unanswered / Red / Blue; whole-viewport pictures of the Board, Edit Schedule and View-only Sched taken from a parked pointer and compared pixel by pixel; then three formations Red / Blue / unanswered; then Monday published and Export as PDF read',
    checks.map(c => `${c[1] ? 'OK' : 'NOT OK'} ${c[0]}${c[2] ? ' [' + String(c[2]).slice(0, 300) + ']' : ''}`).join(' || ') + ' || PIXELS: ' + rows.join(' || ') + ' || ' + log.filter(l => !/^(board|week|view) \d-\w+ vs /.test(l)).join(' ;; '), bad.length ? 'FAIL' : 'CHECK', pics)
} catch (e) { C.row('H-02', 'aborted', String(e.stack || e).slice(0, 900) + ' LOG ' + log.join(' ;; '), 'FAIL', [await C.pic(p, 'h02b-error')]) }
console.log('ERRORS', J(C.ERR))
C.save('j2')
await w.browser.close()
