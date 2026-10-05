/* H-02 — the Blue/Red answer draws no mark on the schedule */
import * as C from './stk-C-lib.mjs'
import { createHash } from 'node:crypto'
const { L, W } = C
const J = x => JSON.stringify(x)
const md5 = b => createHash('md5').update(b).digest('hex').slice(0, 8)
const pics = []
const { browser, p } = await C.world()
const SURF = {
  board: { sel: '#schedBoard .sb-go', go: async () => { await C.board(p, 0) } },
  week: { sel: '#eWeek .day[data-day="0"]', go: async () => { await W.boardOff(p); await L.go(p, 'editsched'); await W.showDay(p, 0) } },
  view: { sel: '#vWeek .day[data-day="0"]', go: async () => { await W.boardOff(p); await L.go(p, 'viewsched'); await W.showDay(p, 0, '#vWeek') } },
}
async function capture(state) {
  const out = {}
  for (const [k, s] of Object.entries(SURF)) {
    await s.go(); await p.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() }); await C.sleep(400)
    const loc = p.locator(s.sel).first()
    await loc.evaluate(e => e.scrollIntoView({ block: 'start' })); await C.sleep(300)
    const html = await loc.evaluate(e => e.outerHTML)
    const buf = await loc.screenshot().catch(() => null)
    out[k] = { html: html.length + ':' + md5(html), shot: buf ? md5(buf) : null, htmlRaw: html }
    pics.push(await C.pic(p, `h02-${k}-${state}`, {}))
  }
  return out
}
try {
  await C.tracking(p, true); await C.board(p, 0)
  await C.bset(p, 'ff:0.0.0.msn', 'ACM'); await C.bset(p, 'fr:0.0.0.0', 'DS FOR RU')
  await C.side(p, 'later')
  const sU = await capture('unanswered')
  await C.board(p, 0)
  await C.openQuestion(p, 0, { published: false }); await C.side(p, 'red')
  const sR = await capture('red')
  await C.board(p, 0)
  await C.openQuestion(p, 0, { published: false }); await C.side(p, 'blue')
  const sB = await capture('blue')
  const cmp = k => `${k}: unanswered ${sU[k].html}/${sU[k].shot}, red ${sR[k].html}/${sR[k].shot}, blue ${sB[k].html}/${sB[k].shot} → DOM identical ${sU[k].htmlRaw === sR[k].htmlRaw && sR[k].htmlRaw === sB[k].htmlRaw}, picture identical ${sU[k].shot === sR[k].shot && sR[k].shot === sB[k].shot}`
  const lines = ['board', 'week', 'view'].map(cmp)
  // diff of DOM where they differ
  const diffs = []
  for (const k of ['board', 'week', 'view']) {
    for (const [a, b, n] of [[sU, sR, 'unanswered→red'], [sR, sB, 'red→blue']]) {
      if (a[k].htmlRaw !== b[k].htmlRaw) {
        const x = a[k].htmlRaw, y = b[k].htmlRaw; let i = 0; while (i < x.length && x[i] === y[i]) i++
        diffs.push(`${k} ${n}: first difference at ${i}: «${x.slice(Math.max(0, i - 60), i + 80)}» vs «${y.slice(Math.max(0, i - 60), i + 80)}»`)
      }
    }
  }
  // three formations at once: Red / Blue / unanswered
  await C.board(p, 0)
  await C.bset(p, 'ff:0.0.1.msn', 'ACM'); await C.bset(p, 'fr:0.0.1.0', 'DS FROM RU'); await C.side(p, 'blue')
  await C.bset(p, 'ff:0.1.0.msn', 'ACM'); await C.bset(p, 'fr:0.1.0.0', 'DS FOR RU'); await C.side(p, 'later')
  const states = await p.evaluate(() => 'ok')
  for (const k of ['board', 'week', 'view']) { await SURF[k].go(); await C.sleep(300); await p.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() }); pics.push(await C.pic(p, `h02-three-${k}`)) }
  // any element carrying "role"/"red"/"blue" colour classes in the week/view?
  const classes = await p.evaluate(() => { const o = {}; for (const s of ['#eWeek', '#vWeek']) { o[s] = [...document.querySelectorAll(s + ' *')].filter(e => /mix|role|mission-role|blue|red(?!box)/.test(e.className && e.className.baseVal === undefined ? e.className : '')).map(e => e.className).slice(0, 8) } return o })
  // publish Monday, then the print path
  await C.board(p, 0)
  await C.publish2(p, 0)
  const ver = await p.evaluate(() => window.dayCurVer(0))
  await W.boardOff(p); await L.go(p, 'editsched'); await C.sleep(500)
  const frameCount0 = p.frames().length
  await p.evaluate(() => { window.__printed = []; const o = window.print; })
  await p.locator('#exportPdf:visible').first().click(); await C.sleep(1500)
  let html = null
  for (const f of p.frames()) { if (f === p.mainFrame()) continue; try { const c = await f.content(); if (c && c.length > 500) html = c } catch (e) {} }
  let printNote = ''
  if (html) {
    const pg = await p.context().newPage(); await pg.setViewportSize({ width: 1100, height: 900 }); await pg.setContent(html); await C.sleep(400)
    pics.push(await C.pic(pg, 'h02-print-preview'))
    const txt = await pg.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
    const hit = ['Blue', 'Red', 'mission role', 'role'].filter(t => new RegExp(t, 'i').test(txt.replace(/RED AIR|Red box/gi, '')))
    printNote = `print sheet captured (${html.length} chars, ${txt.length} text chars); words Blue/Red/role in it (apart from the typed "RED AIR"): ${J(hit)}; colour/role attributes in its HTML: ${J(/mission-role|data-role|mix-blue|mix-red/.test(html))}`
    await pg.close()
  } else printNote = 'print sheet NOT captured (the print dialog could not be read from the hidden frame)'
  const allOK = ['board', 'week', 'view'].every(k => sU[k].htmlRaw === sR[k].htmlRaw && sR[k].htmlRaw === sB[k].htmlRaw)
  C.row('H-02', 'Mon VL formation (ACM, "DS FOR RU") taken through unanswered (Later) → Red → Blue via the Remarks door; after each, the Board wave, Edit Schedule day and View-only Sched day were captured (HTML text and picture); then three formations Red/Blue/unanswered side by side; then Monday published and Export as PDF (print) read',
    `${lines.join(' || ')}${diffs.length ? ' || DIFFS: ' + diffs.join(' || ') : ''} || coloured/role-looking classes on the week and View-only Sched: ${J(classes)} || published ${ver}; ${printNote}`,
    allOK ? 'PASS' : 'CHECK', pics)
} catch (e) { C.row('H-02', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'h02-error')]) }
finally { await browser.close() }
console.log('ERRORS', J(C.ERR))
C.save('j')
