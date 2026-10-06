/* S03 — current published look: Baseline B published through the four sign-offs; read on Edit Schedule, the 👁 look, the Board,
   View-only Sched (as admin and as the member), the day details and Insights. variant plain | blank. Env HP_PHONE=1 for 390x844. */
import * as K from './rbl-B-lib.mjs'
const { B, W, L, R, pic, picEl, sleep } = K
const variant = process.argv[2] || 'plain'
const T = K.TUE, M = K.MON
const sz = B.PHONE ? 'phone' : 'desktop'
const ID = `S03${variant === 'blank' ? 'b' : 'a'}-${sz}`
const P = (s) => `s03${variant === 'blank' ? 'b' : 'a'}-${s}`
const sg = h => h ? h.signs.map(x => x.replace(/—\s*name\s*—/, '·')).join('|') : '?'
const signedAll = h => !!h && h.tag === 'ORIG' && (/CUR CK\S.*SKED CK\S.*PLANNED\S.*APPROVED\S/.test(h.signed || '') || /^SIGNED ORIG (\S+ ){3}\S+$/.test(h.signed || ''))

K.cleanPics([`s03${variant === 'blank' ? 'b' : 'a'}`])
const { browser, p, errors } = await K.fresh()
async function step(sub, did, fn) {
  try { await fn(sub, did) } catch (e) { R(`${ID}.${sub}`, did, 'script error: ' + String(e.stack || e).slice(0, 500), 'FAIL', [await pic(p, P('X-' + sub))]) }
}
try {
  const cs = await B.csOf(p, K.X)
  const b = await K.baseB(p)
  let blankInfo = ''
  if (variant === 'blank') {
    await K.addLine(p, M, b.m.gi); const fm = (await K.nLines(p, M, b.m.gi)) - 1
    const sm = await K.seat(p, M, b.m.gi, fm, 0, 'w', K.X)
    await K.addLine(p, T, b.t.gi); const ft = (await K.nLines(p, T, b.t.gi)) - 1
    const st = await K.seat(p, T, b.t.gi, ft, 0, 'w', K.X)
    blankInfo = ` + a blank "+ Line" on Monday (line ${fm}, ${cs} seated: ${sm.took}) and on Tuesday (line ${ft}, ${cs} seated: ${st.took})`
  }
  const s0 = await K.see(p, P('0-work'))
  const ins0 = await K.insx(p, P('0-ins'))
  R(`${ID}.0`, `${sz}: Baseline B (Mon ZM 20:00-22:30, Tue ZT 07:00-08:00 Brief 05:00, ${cs} on both, took ${b.tookM}/${b.tookT})${blankInfo}; working copy before publishing`,
    `${K.says(s0)} · ${K.hd(s0.head)} · Insights Crew rest row ${JSON.stringify(ins0.byType.filter(x => /rest/i.test(x)))}`, K.whole(s0) ? 'PASS' : 'FAIL', [...s0.pics, ins0.shot])

  /* publish Monday then Tuesday through the four sign-offs */
  await B.toEdit(p)
  const pm = await B.pubOrig(p, M)
  const hM = await B.head(p, M)
  const pt = await B.pubOrig(p, T)
  const hT = await B.head(p, T)
  const s1 = await K.see(p, P('1-pub'))
  s1.pics.push(await K.headPic(p, '#eWeek', T, P('1-pub-head')))
  const okPub = K.whole(s1) && signedAll(s1.head) && signedAll(s1.headMon) && !s1.head.nys && !/pending/i.test(s1.head.pending || '')
  R(`${ID}.1`, `${sz}: sign-offs + Publish on Monday (${JSON.stringify(pm.r)}) then Tuesday (${JSON.stringify(pt.r)}); Edit Schedule face`,
    `${K.says(s1)} · Tue ${K.hd(s1.head)} · Mon ${K.hd(s1.headMon)}`, okPub ? 'PASS' : 'FAIL', s1.pics)

  /* the 👁 look at the current issued version — week */
  await step('2', 'look', async (sub) => {
    await B.toEdit(p); await W.showDay(p, T)
    const vs = await B.versions(p, T)
    await p.keyboard.press('Escape'); await sleep(250)
    const lab = (vs.vs || []).map(x => x.label)
    const pick = (vs.vs || []).find(x => !/working|draft/i.test(x.label)) || (vs.vs || [])[0]
    const lk = pick ? await B.look(p, T, new RegExp(pick.label.slice(0, 6).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) : { err: 'no version' }
    await sleep(500)
    const face = await B.lookFace(p, T)
    await B.openList(p, '#eWeek', T)
    const list = await B.readList(p, '#eWeek', T)
    const csn = cs
    const lines = (list.lines || []).filter(x => /Crew rest/i.test(x.text) && x.text.includes(csn))
    const pk = await B.dayPucks(p, '#eWeek', T, K.X)
    const pMon = null
    const p1 = await picEl(p, `#eWeek .day[data-day="${T}"]`, P('2-look-week'), { pad: 8, maxH: 800 })
    await B.backLive(p, T)
    const ok = !lk.err && lines.length === 1 && pk.some(x => x.warn && x.sev === 'hard')
    R(`${ID}.${sub}`, `${sz}: the current issued version's 👁 look on Edit Schedule's week (menu: ${lab.join(' / ')})`,
      `look ${lk.err || lk.label} · face ${JSON.stringify(face)} · list bar "${list.bar}" lines ${JSON.stringify(lines.map(x => x.text.slice(0, 100)))} · his pucks [${B.pk(pk)}]`, ok ? 'PASS' : 'FAIL', [p1])
  })
  /* the Board's look */
  await step('3', 'board look', async (sub) => {
    await W.boardOn(p, T); await sleep(400)
    const vs = await B.versions(p, T, '#schedBoard')
    await p.keyboard.press('Escape'); await sleep(250)
    const pick = (vs.vs || []).find(x => !/working|draft/i.test(x.label)) || (vs.vs || [])[0]
    const lk = pick ? await B.look(p, T, new RegExp(pick.label.slice(0, 6).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), '#schedBoard') : { err: 'no versions on the board: ' + JSON.stringify(vs) }
    await sleep(600)
    await B.boardOpenFold?.(p)
    const bd = await B.readBoard(p)
    const pk = await B.pucks(p, '#schedBoard', K.X)
    const crew = (bd.lines || []).filter(x => /Crew rest/i.test(x.text) && x.text.includes(cs))
    const p1 = await B.pic(p, P('3-look-board'))
    await B.backLive(p, T, '#schedBoard')
    const ok = !lk.err && crew.length >= 1
    R(`${ID}.${sub}`, `${sz}: the current issued version's 👁 look on the Board (menu ${(vs.vs || []).map(x => x.label).join(' / ')})`,
      `look ${lk.err || lk.label} · board head "${bd.head}" · his crew rest lines ${JSON.stringify(crew.map(x => x.text.slice(0, 100)))} · his pucks on the board [${pk.map(x => `${x.where}:${x.warn ? 'ring(' + x.sev + ')' : 'plain'}${x.chip ? ' ' + x.chip : ''}${x.dot ? ' dotted' : ''}${x.dash ? ' dashed' : ''}`).join(', ')}]`, ok ? 'PASS' : 'FAIL', [p1])
    await W.boardOff(p)
  })
  /* View-only Sched as admin */
  await step('4', 'viewonly admin', async (sub) => {
    await L.go(p, 'viewsched'); await sleep(300)
    const v = await K.see(p, P('4-view-admin'), { surf: '#vWeek' })
    const hv = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null; const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; return { tag: t(d.querySelector('.verchip')), pend: t(d.querySelector('.dpend')), nys: t(d.querySelector('.nysmark')), signed: t(d.querySelector('.signedln')), woff: d.querySelectorAll('[data-woff]').length } }, T)
    R(`${ID}.${sub}`, `${sz}: View-only Sched (signed in as admin), Tuesday and Monday`,
      `${K.says(v)} · Tue head ${JSON.stringify(hv)}`, (v.breach && v.ringTue && v.dotMon && v.lines.some(x => /Crew rest/i.test(x.text))) ? 'PASS' : 'FAIL', v.pics)
  })
  /* day details */
  await step('5', 'day details', async (sub) => {
    await B.toEdit(p); await W.showDay(p, T)
    const d1 = await B.dayInfo(p, '#eWeek', T, P('5-details-edit'))
    await L.go(p, 'viewsched'); await W.showDay(p, T, '#vWeek')
    const d2 = await B.dayInfo(p, '#vWeek', T, P('5-details-view'))
    const has = d => d && !d.err && d.lines.some(l => /Crew rest/i.test(l.text) && l.text.includes(cs)) || (d && d.lines && d.lines.some(l => /Crew rest/i.test(l.text)))
    R(`${ID}.${sub}`, `${sz}: the day-details panel on Edit Schedule and on View-only Sched`,
      `edit: ${B.infoShort(d1)} ${JSON.stringify((d1.lines || []).map(l => l.text))} · view: ${B.infoShort(d2)} ${JSON.stringify((d2.lines || []).map(l => l.text))}`, has(d1) && has(d2) ? 'PASS' : 'FAIL', [d1.shot, d2.shot].filter(Boolean))
  })
  /* Insights */
  await step('6', 'insights', async (sub) => {
    await B.toEdit(p)
    const i1 = await K.insx(p, P('6-ins'))
    R(`${ID}.${sub}`, `${sz}: Insights after publishing (week), Conflicts by type`,
      `before publishing: ${JSON.stringify(ins0.byType)} · after: ${JSON.stringify(i1.byType)} · tile "${i1.tile}" (before "${ins0.tile}") · by day ${JSON.stringify(i1.byDay)}`,
      JSON.stringify(ins0.byType) === JSON.stringify(i1.byType) && i1.byType.some(x => /rest/i.test(x)) ? 'PASS' : 'FAIL', [i1.shot, i1.shot2].filter(Boolean))
  })
  /* the member */
  await step('7', 'member', async (sub) => {
    const mT = await B.member(p, T, [K.X], P('7-member-tue'))
    const paT = await K.paintAll(p, '#vWeek', T)
    const mM = await B.member(p, M, [K.X], P('7-member-mon'))
    await K.closeList(p, '#vWeek', M)
    const paM = await K.paintAll(p, '#vWeek', M)
    mM.shots.push(await B.puckPic(p, '#vWeek', M, K.X, P('7-member-mon-listshut-puck')))
    const csn = cs
    const rl = (mT.list.lines || []).filter(x => /Crew rest/i.test(x.text) && x.text.includes(csn))
    const role = await p.evaluate(() => window.raptorRole || null)
    const pt = mT.pks[K.X] || [], pm = mM.pks[K.X] || []
    const ok = rl.length === 1 && K.solidRing(paT) && K.dottedRing(paM) && mT.hd && !mT.hd.pend && mT.hd.woff === 0
    R(`${ID}.${sub}`, `${sz}: signed in as the member (us/us), View-only Sched, Tuesday then Monday`,
      `role ${role} · Tue bar "${mT.list.bar}" lines ${JSON.stringify(rl.map(x => (x.struck ? '[STRUCK] ' : '') + x.text.slice(0, 100)))} · his Tue pucks [${B.pk(pt)}] painted [${K.pn(paT)}] · his Mon pucks [${B.pk(pm)}] painted [${K.pn(paM)}] · Tue head ${JSON.stringify(mT.hd)} · ✕/↺ buttons on the day: ${mT.hd && mT.hd.woff} · Mon head ${JSON.stringify(mM.hd)}`,
      ok ? 'PASS' : 'FAIL', [...mT.shots, ...mM.shots])
  })
} catch (e) { R(`${ID}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, P('X'))]) }
R(`${ID}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart(`s03-${variant}`)
