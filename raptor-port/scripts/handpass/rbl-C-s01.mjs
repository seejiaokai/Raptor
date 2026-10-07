/* S01 — the specialised puck copies (SANS card, Personal Inputs row, Unavailable row, crew list) beside the cockpit's */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C
const which = process.argv[2] || 'all'

const copies = ps => {
  const g = {}
  for (const x of ps) (g[x.where] ||= []).push(x)
  return Object.entries(g).map(([w, xs]) => `${w}${xs.length > 1 ? ' x' + xs.length : ''}: ${xs.map(x => (x.solid ? 'SOLID' : 'no-solid') + (x.dashed ? '+DASHED' : '') + (x.dotted ? '+DOTTED' : '') + (x.chip ? ' chip ' + x.chip : '') + ' [' + x.cls.split(' ').filter(c => /^(warn|hard|adv|note|boxred|boxdash|boxdot)$/.test(c)).join(' ') + ' | shadow ' + (x.shadow ? x.shadow.replace(/rgb(240, 85, 95)/, 'red').slice(0, 40) : 'none') + ']').join(' / ')}`).join(' · ') || '(no puck drawn)'
}
async function boardRead(p, di, tag) {
  await K.boardTo(p, di); await C.sleep(400)
  const tog = p.locator('#schedBoard [data-pitog]:visible').first()
  if (await tog.count() && !(await p.locator('#schedBoard .sb-panel.pinp .puck:visible').count())) { await tog.click(); await C.sleep(400) }
  const day = await C.painted(p, '#schedBoard', C.ID)
  const pics = []
  for (const [sel, nm] of [['#schedBoard .sb-panel.sansav', 'sans'], ['#schedBoard .sb-panel.pinp', 'pinp'], ['#schedBoard .sb-panel.unav', 'unav'], ['#sbRoster', 'crew']]) {
    if (await p.locator(sel).count()) pics.push(await picEl(p, sel, `${tag}-board${di}-${nm}`, { pad: 6, maxH: 600 }))
  }
  return { day, pics }
}
async function weekRead(p, di, tag) {
  await B.toEdit(p); await W.showDay(p, di)
  const day = await C.painted(p, `#eWeek .day[data-day="${di}"]`, C.ID)
  const pic1 = await B.puckPic(p, '#eWeek', di, C.ID, `${tag}-week${di}`)
  return { day, pics: [pic1] }
}
async function scene(tag, dashed) {
  const { browser, p, errors } = await K.fresh()
  const out = { errors, pics: [] }
  try {
    const cs = await B.csOf(p, C.ID)
    let m, t
    if (!dashed) { const b = await C.baselineB(p); m = b.m; t = b.t }
    else {
      m = await C.flyWave(p, MON, { cs: 'ZM', msn: 'BFM', to: '15:00', ld: '17:00' })
      t = await C.flyWave(p, TUE, { cs: 'ZT', msn: 'BFM', br: '05:00', to: '08:00', ld: '09:00' })
      await W.boardText(p, `fr:${TUE}.${t.gi}.0.0`, 'LATE SHOW')
    }
    const filed = []
    for (const di of [MON, TUE]) {
      filed.push((await C.fileInput(p, { type: 'SANS Availability', di, allday: true, sans: [0] })).iid)
      filed.push((await C.fileInput(p, { type: 'Personal', di, allday: false, from: di === MON ? '06:30' : '15:30', to: di === MON ? '07:30' : '16:30', remarks: 'dentist' })).iid)
      filed.push((await C.fileInput(p, { type: 'LL', di, allday: false, from: di === MON ? '05:00' : '14:00', to: di === MON ? '06:00' : '15:00', remarks: 'leave bit' })).iid)
    }
    out.filed = filed.map(x => !!x)
    out.before = (await C.fullWarnsX(p, TUE)).map(w => `${w.sev}/${w.code}`)
    const x = await C.extraLine(p, TUE, t.gi)               /* the blank line, X on it */
    out.blank = x.took
    out.after = (await C.fullWarnsX(p, TUE)).map(w => `${w.sev}/${w.code}: ${w.msg}`)
    out.hold = await C.lineNow(p, TUE, t.gi, x.fi)
    out.cs = cs
    out.week = { tue: await weekRead(p, TUE, `${tag}`), mon: await weekRead(p, MON, `${tag}`) }
    const list = await C.seeWeek(p, TUE, `${tag}-list`)
    out.list = list
    out.board = { tue: await boardRead(p, TUE, tag), mon: await boardRead(p, MON, tag) }
  } catch (e) { out.err = String(e.stack || e).slice(0, 700); out.pics.push(await pic(p, `${tag}-X`).catch(() => '')) }
  await browser.close()
  return out
}
async function run(id, tag, dashed) {
  const o = await scene(tag, dashed)
  if (o.err) { R(id, `${tag} fixture`, 'script error: ' + o.err, 'NOT WALKED', o.pics); return }
  const pics = [...o.week.tue.pics, ...o.week.mon.pics, ...o.list.pics, ...o.board.tue.pics, ...o.board.mon.pics]
  const cockTue = o.week.tue.day.filter(x => x.where === 'flying line')
  const cockMon = o.week.mon.day.filter(x => x.where === 'flying line')
  const ok = o.blank && o.after.some(a => /CREW_REST/.test(a)) && cockTue.length >= 2 && cockTue.every(x => dashed ? x.dashed : x.solid) && cockMon.length >= 1 && cockMon.some(x => x.dotted)
  const did = `${dashed ? 'Monday ZM 15:00–17:00, Tuesday ZT Brief 05:00 take-off 08:00 with LATE SHOW typed in its remarks' : 'Baseline B (Monday ZM 20:00–22:30, Tuesday ZT Brief 05:00 take-off 07:00–08:00)'} with ${o.cs} on both; filed for him on Monday and Tuesday a SANS availability (Fly, all day), a part-day Personal input (Mon 06:30–07:30, Tue 15:30–16:30) and a part-day LL (Mon 05:00–06:00, Tue 14:00–15:00) through the Inputs page (all filed: ${o.filed.join(',')}); then "+ Line" on Tuesday's wave and ${o.cs} seated on it (took ${o.blank}).`
  const saw = `His Tuesday warnings before the blank line: [${o.before.join(', ')}]; after: ${JSON.stringify(o.after)}. Tuesday's list (the lines naming him): ${JSON.stringify(C.breachLines(o.list.list).map(t => t.slice(0, 200)))}. WEEK Tuesday copies: ${copies(o.week.tue.day)} · WEEK Monday copies: ${copies(o.week.mon.day)} · BOARD Tuesday copies: ${copies(o.board.tue.day)} · BOARD Monday copies: ${copies(o.board.mon.day)}. Errors: ${o.errors.join(' | ') || 'none'}`
  R(id, did, saw, ok ? 'PASS' : 'FAIL', pics)
}
const T = C.PHONE ? 'ph' : 'dk'
if (which === 'solid' || which === 'all') await run('S01.solid', 's01-solid', false)
if (which === 'dashed' || which === 'all') await run('S01.dashed', 's01-dashed', true)
B.savePart('rbl-C-s01')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
