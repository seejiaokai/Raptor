// sss-w1B-probe — route proofs on the c182 build for walker B (chat 182): the served bundle, the standby waves' boxes
// (B / R / START / END, FLIES), the duty desks a standby wave brings, a sim row's places, Ranger's week-2 demo holdings,
// and the amber SANS mark on a seated puck. Run: SZ=d|p SSSB_RUN=probe node scripts/handpass/sss-w1B-probe.mjs
import './sss-w1B-env.mjs'
import { writeFileSync } from 'node:fs'
const Y = await import('./sns-w1B-lib.mjs')
const { K, T, L, W5, A, RANGER, D, WK1, WK2, J, sleep, scene, postR, OUT, path } = Y
const SZ = process.env.SZ || 'd'
console.log('VERSION sss-w1B-probe 1 · size', SZ, '· out', OUT)
const html = await (await fetch(process.env.W2_URL)).text()
console.log('SERVED bundle:', (html.match(/index-[^"]*\.js/) || ['none'])[0])

const dumpWave = (p, di, wi) => p.evaluate(([di, wi]) => {
  const wv = window.DAYS[di].waves[wi]
  const box = document.querySelector('#schedBoard')
  const flds = [...box.querySelectorAll(`[data-bfld*=":${di}.${wi}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.dataset.bfld}=${e.value ?? ''}${e.placeholder ? '(ph ' + e.placeholder + ')' : ''}`)
  const fl = [...box.querySelectorAll(`[data-safly^="${di}.${wi}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.dataset.safly}:${e.getAttribute('aria-pressed')}:${(e.textContent || '').trim()}`)
  const cx = [...box.querySelectorAll(`[data-lcx^="${di}.${wi}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.lcx)
  return { label: wv.label, kind: wv.kind, forms: wv.formations.map(f => ({ keys: Object.keys(f).join('/'), to: f.to, ld: f.ld, ac: f.aircraft.map(a => JSON.stringify(a)) })), flds, fl, cx }
}, [di, wi])

const SC = {}
SC.probe = async (p, W) => {
  W.rec('bundle', 'the page served', 'REC', await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).join(' ')))
  await postR(p, W, 'pr.post')
  const dutyBefore = await p.evaluate(() => JSON.stringify(window.DAYS[5].dutywaves || window.DAYS[5].duties || null).slice(0, 400))
  W.rec('duty0', 'Sat 18 duty block before', 'REC', dutyBefore)
  const ws = {}
  for (const kind of ['SC', 'AVALON', 'BB']) { const a = await A.addLine(p, W, 5, { kind }); ws[kind] = a.wi; W.rec('add-' + kind, kind, 'REC', J(a)) }
  for (const [k, wi] of Object.entries(ws)) W.rec('dump-' + k, k, 'REC', J(await dumpWave(p, 5, wi)))
  const dutyAfter = await p.evaluate(() => { const d = window.DAYS[5]; return JSON.stringify({ keys: Object.keys(d), dw: d.dutywaves }).slice(0, 1500) })
  W.rec('duty1', 'Sat 18 after the three standby waves', 'REC', dutyAfter)
  await W.pic(p, 'board-standby')
  await p.evaluate(() => document.querySelector('#schedBoard').scrollTo?.(0, 0))
  /* a sim row's places */
  const o = await W5.addSim(p, W, 5, 'oft', 'PB SIM', '', '')
  const zones = await p.evaluate(ri => [...document.querySelectorAll(`#schedBoard [data-slot^="s:5.oft.${ri}"], #schedBoard [data-fill^="s:5.oft.${ri}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.slot ? 'slot ' + e.dataset.slot : 'fill ' + e.dataset.fill) + ' «' + (e.textContent || '').trim().slice(0, 20) + '»'), o.ri)
  W.rec('sim', 'OFT row places', 'REC', J({ ri: o.ri, r: o.r, zones }))
  const simF = await p.evaluate(ri => [...document.querySelectorAll(`#schedBoard [data-bfld^="sr:5.oft.${ri}."], #schedBoard [data-srcx="5.oft.${ri}"]`)].map(e => e.dataset.bfld || 'cx ' + e.dataset.srcx), o.ri)
  W.rec('simf', 'OFT row boxes', 'REC', J(simF))
  await W.pic(p, 'board-sim')
  /* week 2: what Ranger holds in the demo */
  await L.closeBoard(p, W)
  await T.gotoWeek(p, W, WK2)
  W.rec('wk2', 'Ranger in week 2 (demo)', 'REC', await T.holds(p, RANGER))
  await T.gotoWeek(p, W, WK1)
  W.rec('wk1', 'Ranger in week 1', 'REC', await T.holds(p, RANGER))
}
SC.amber = async (p, W) => {
  await postR(p, W, 'am.post')
  await Y.fileFor(p, W, D[18], RANGER, ['oft'], 'all', 'am.file')
  const a = await Y.blank(p, W, 5, 'am.line', { cs: 'TIMED', to: '13:00', ld: '14:00' })
  await Y.armB(p, W, 5, a.fcp, 'am-arm')
  const k = await Y.pickB(p, W, a.fcp, 'am-pick')
  W.rec('pick', 'Ranger placed on the timed flight (OFT only filed)', 'REC', J({ placed: k.placed, toast: k.toast }))
  await Y.disarm(p, W)
  const pk = await p.evaluate(fcp => { const e = document.querySelector(`#schedBoard [data-slot="${fcp}"]`); return e ? e.outerHTML.slice(0, 900) : 'none' }, a.fcp)
  W.rec('seated', 'the seated puck markup', 'REC', pk)
  const w = await A.warns(p, W, 5, 'am')
  W.rec('warn', 'warning list', 'REC', A.warnSay(w), w.pic)
  await W.pic(p, 'am-board')
  const wk = await p.evaluate(() => { const e = [...document.querySelectorAll('#eWeek [data-slot]')].find(x => /bane/.test(x.outerHTML) && x.dataset.slot.startsWith('5.')); return e ? e.outerHTML.slice(0, 700) : 'none' })
  W.rec('weekpuck', 'week puck (board open)', 'REC', wk)
}
const only = (process.env.ONLY || 'probe,amber').split(',')
for (const n of only) await T.run(n, SZ, scene(SC[n]))
writeFileSync(path.join(OUT, `probe-${SZ}.json`), JSON.stringify(L.results, null, 1))
