// swl-w1A-rw — walker A's re-walk of the hide fix on build c207-build2 (chat 207, 27 Nov 26): a hidden SANS line stays tied to
// its own sim row — a new AMT row's line shows; hiding the OFT line leaves the AMT one; Undo / Redo of the hide.
// Run from raptor-port/: SWLA_RUN=<run> ONLY=R1|R2 SZ=d|p node scripts/handpass/swl-w1A-rw.mjs
import './swl-w1A-rw-env.mjs'
import path from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
const Y = await import('./swl-w1A-lib.mjs')
const { L, W5, sleep, J, run, need, addSimRow, place, commit, dayList, readDay, boardList, pucksOf, puckSay, clipOf, nOf, BOLT, ISO } = Y
const SCN = process.env.ONLY || 'R1', SZ = process.env.SZ || 'd'
const OUT = L.OUT
mkdirSync(path.join(OUT, 'taps'), { recursive: true })
console.log(`VERSION swl-w1A-rw 1 · ${SCN} · ${SZ} · bundle ${process.env.W2_URL} · out ${OUT}`)
const di = 5
const OFF = 'Bolt — SANS: offered Fly only today. Planned on Sim EP-9 10:00–11:00'
/* R2b: the AMT an hour and a half later, so his two sims do not overlap (R2-d: at the same hour they raise a red conflict, whose "C" outranks "A") */
const AS = process.env.AMT_AT ? process.env.AMT_AT.split('-') : ['10:00', '11:00']
const OFFA = `Bolt — SANS: offered Fly only today. Planned on Sim EP-9 ${AS[0]}–${AS[1]}`

/* a press with its picture taken right after it (~60ms), then settled */
async function pressNow(p, W, loc, tag) {
  const l = typeof loc === 'string' ? p.locator(loc).first() : loc
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) await l.tap(); else await l.click()
  await sleep(60)
  const f = `${W.scn}-${tag}-now-${W.sz.name}.png`
  await p.screenshot({ path: path.join(OUT, 'taps', f) }).catch(() => {})
  await sleep(500)
  return 'taps/' + f
}
/* the board's list for the day, each SANS line tied to the place that raised it (the app's own warning record, read only) */
async function read(p, W, tag) {
  const b = await boardList(p, W, di)
  const keys = await p.evaluate(i => ((window.WARN && window.WARN.byDay[i]) || {}).warns ? window.WARN.byDay[i].warns.map(w => ({ key: w.key || '', code: w.code, off: !!w.off })) : [], di)
  const lines = (b.lines || []).map(x => ({ ...x, key: (keys[x.ix] || {}).key || '?', code: (keys[x.ix] || {}).code || '?' }))
  const sans = lines.filter(x => /Bolt — SANS/.test(x.text))
  const pk = (await pucksOf(p, '#schedBoard', BOLT)).filter(x => x.where !== 'crew list')
  const amber = x => /229, 168, 59/.test(x.ring)
  const pics = [await clipOf(p, W, '#schedBoard .sb-warn', tag + '-board', 12)]
  for (const x of pk) pics.push(await clipOf(p, W, `#schedBoard [data-slot="${x.where}"]`, tag + '-puck-' + x.where.replace(/\W+/g, ''), 30))
  return { head: b.head, n: nOf(b.head), shown: lines.filter(x => !x.hid).length, lines, sans, pk, amber: pk.map(amber), pics: pics.filter(Boolean) }
}
const say = r => `head "${r.head}" (${r.n}; ${r.shown} lines not struck) · Bolt's: ${r.sans.map(x => `"${x.text}" [${x.key}]${x.hid || x.struck ? ' STRUCK' : ' shown'}`).join(' | ') || 'none'} · puck(s) ${r.pk.map(x => `${x.where} chips[${x.chips.join(',')}] ring ${x.ring}`).join(' · ') || 'none'}`
const esSay = async (p, W, tag) => { const e = await dayList(p, W, '#eWeek', di); const pic = await clipOf(p, W, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, tag + '-es', 12); return { e, pic, say: `ES bar "${e.bar}" · ${e.lines.filter(x => /Bolt — SANS/.test(x.text)).map(x => `"${x.text}"${x.struck ? ' STRUCK' : ' shown'}`).join(' | ')}` } }

const S = {}
S.R1 = async (p, W) => {
  const f = await commit(p, W, ISO[18], BOLT, ['fly'], 'all', 'file'); await W5.closeSansWin(p, W)
  need(W, 'set.file', 'Saber files for Bolt on Sat 18: Fly only, all day', !!f.iid, J(f.rec), f.pic)
  const o = await addSimRow(p, W, di, 'oft', 'EP-9', '10:00', '11:00')
  need(W, 'set.oft', 'Sat 18: OFT "EP-9" 10:00–11:00', o.ri >= 0 && o.r.str === '10:00' && o.r.end === '11:00', J(o.r))
  const r0 = await place(p, W, di, `s:5.oft.${o.ri}.p`, BOLT, 'r1-oft')
  need(W, 'set.place.oft', 'Bolt placed in the OFT front seat', r0.placed, `notes ${J(r0.seen)}`, r0.pic)
  let s = await read(p, W, 'r1-1')
  W.rec('R1.1', `before the hide: one line "${OFF}" on the OFT, shown`, s.sans.length === 1 && s.sans[0].text === OFF && !s.sans[0].hid && /oft/.test(s.sans[0].key), say(s), s.pics.join(', '))
  // hide it with its ✕ on Edit Schedule's list
  await L.closeBoard(p, W)
  const e0 = await dayList(p, W, '#eWeek', di)
  const ln = e0.lines.find(x => x.text === OFF)
  const now = ln ? await pressNow(p, W, `#eWeek .day[data-day="${di}"] [data-woff="${di}.${ln.ix}"]`, 'r1-hide') : 'no line'
  const e1 = await readDay(p, '#eWeek', di)
  const hl = e1.lines.find(x => x.text === OFF)
  W.rec('R1.2', 'his line hidden with its ✕ (Edit Schedule): struck in place, the count down by one', !!hl && hl.struck && nOf(e1.bar) === nOf(e0.bar) - 1, `before "${e0.bar}" after "${e1.bar}" · ${hl ? (hl.struck ? 'STRUCK' : 'shown') : 'gone'}`, [now, await clipOf(p, W, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, 'r1-2-es', 12)].join(', '))
  // remove the OFT row (its own ✕ on the board)
  await L.openBoard(p, W, di)
  const del = p.locator(L.B(`[data-srdel="${di}.oft.${o.ri}"]`)).first()
  const now2 = (await del.count()) ? await pressNow(p, W, del, 'r1-oftdel') : 'no ✕'
  const gone = await p.evaluate(i => (window.DAYS[i].sims.oft || []).length, di)
  W.rec('R1.3', 'the OFT row removed by its own ✕', gone === 0, `OFT rows now ${gone} · note "${await L.toastSaid(p)}"`, now2)
  // an AMT row EP-9 10:00–11:00, Bolt in it
  const m = await addSimRow(p, W, di, 'amt', 'EP-9', '10:00', '11:00')
  need(W, 'set.amt', 'Sat 18: AMT "EP-9" 10:00–11:00', m.ri >= 0 && m.r.str === '10:00' && m.r.end === '11:00', J(m.r))
  const r1 = await place(p, W, di, `s:5.amt.${m.ri}.p`, BOLT, 'r1-amt')
  W.rec('R1.4n', 'Bolt placed in the AMT front seat: the note (RECORDED)', r1.placed ? 'REC' : 'NW', `notes ${J(r1.seen)}`, r1.pic)
  s = await read(p, W, 'r1-5')
  const am = s.sans.filter(x => /amt/.test(x.key))
  W.rec('R1.5', `EXPECTED: his AMT line "${OFF}" shows (not struck), the day's count includes it, his puck the amber ring and "A"`,
    am.length === 1 && am[0].text === OFF && !am[0].hid && !am[0].struck && s.n === s.shown && s.pk.some((x, i) => /amt/.test(x.where) && x.chips.includes('A') && s.amber[i]), say(s), s.pics.join(', '))
  const es = await esSay(p, W, 'r1-5')
  W.rec('R1.5es', 'the same on Edit Schedule\'s list', /⚠ \d/.test(es.e.bar) && es.e.lines.some(x => x.text === OFF && !x.struck) && nOf(es.e.bar) === es.e.lines.filter(x => !x.hid).length, es.say, es.pic)
}
S.R2 = async (p, W) => {
  const f = await commit(p, W, ISO[18], BOLT, ['fly'], 'all', 'file'); await W5.closeSansWin(p, W)
  need(W, 'set.file', 'Saber files for Bolt on Sat 18: Fly only, all day', !!f.iid, J(f.rec), f.pic)
  const o = await addSimRow(p, W, di, 'oft', 'EP-9', '10:00', '11:00'), m = await addSimRow(p, W, di, 'amt', 'EP-9', AS[0], AS[1])
  need(W, 'set.rows', 'Sat 18: OFT and AMT "EP-9", both 10:00–11:00', o.ri >= 0 && m.ri >= 0 && o.r.str === '10:00' && m.r.end === AS[1], J({ o: o.r, m: m.r }))
  const a = await place(p, W, di, `s:5.oft.${o.ri}.p`, BOLT, 'r2-oft'), b = await place(p, W, di, `s:5.amt.${m.ri}.p`, BOLT, 'r2-amt')
  need(W, 'set.place', 'Bolt in both front seats', a.placed && b.placed, `notes ${J([...a.seen, ...b.seen])}`, [a.pic, b.pic].join(', '))
  let s = await read(p, W, 'r2-1')
  W.rec('R2.1', 'EXPECTED: two lines, one for the OFT and one for the AMT, both shown', s.sans.length === 2 && s.sans.every(x => (/oft/.test(x.key) ? x.text === OFF : x.text === OFFA) && !x.hid) && s.sans.some(x => /oft/.test(x.key)) && s.sans.some(x => /amt/.test(x.key)), say(s), s.pics.join(', '))
  const n0 = s.n
  // hide the OFT one with its ✕ on the board's panel
  const oft = s.sans.find(x => /oft/.test(x.key))
  const now = await pressNow(p, W, p.locator(`#schedBoard [data-woff="${di}.${oft.ix}"]`).first(), 'r2-hide')
  s = await read(p, W, 'r2-2')
  const so = s.sans.find(x => /oft/.test(x.key)), sa = s.sans.find(x => /amt/.test(x.key))
  W.rec('R2.2', 'EXPECTED: the OFT line hidden (struck); the AMT one still shows, counted; his "A" stays', !!so && (so.hid || so.struck) && !!sa && !sa.hid && !sa.struck && s.n === n0 - 1 && s.n === s.shown && (AS[0] === '10:00' || s.pk.some(x => /amt/.test(x.where) && x.chips.includes('A'))), `count ${n0} → ${s.n} · ` + say(s) + (AS[0] === '10:00' ? ' · chips RECORDED: the two sims overlap, so a red conflict "C" outranks "A"' : ''), [now, ...s.pics].join(', '))
  const es = await esSay(p, W, 'r2-2')
  W.rec('R2.2es', 'the same on Edit Schedule\'s list: one struck, one shown', es.e.lines.filter(x => x.text === OFF && x.struck).length === 1 && es.e.lines.filter(x => x.text === OFFA && !x.struck).length === 1 && nOf(es.e.bar) === s.n, es.say, es.pic)
  // R3: Undo the hide, then Redo it (the board's own pair)
  await L.openBoard(p, W, di)
  const ut = await p.locator('#sbUndo:visible').first().getAttribute('title').catch(() => '')
  const nu = await pressNow(p, W, '#sbUndo:visible', 'r3-undo')
  s = await read(p, W, 'r3-1')
  W.rec('R3.1', `Undo (its title "${ut}"): the OFT line comes back (shown), the AMT one still shown, count ${n0}`, s.sans.length === 2 && s.sans.every(x => !x.hid && !x.struck) && s.n === n0, say(s), [nu, ...s.pics].join(', '))
  const rt = await p.locator('#sbRedo:visible').first().getAttribute('title').catch(() => '')
  const nr = await pressNow(p, W, '#sbRedo:visible', 'r3-redo')
  s = await read(p, W, 'r3-2')
  const ro = s.sans.find(x => /oft/.test(x.key)), ra = s.sans.find(x => /amt/.test(x.key))
  W.rec('R3.2', `Redo (its title "${rt}"): the OFT line goes (struck) again, the AMT one stays shown, count ${n0 - 1}`, !!ro && (ro.hid || ro.struck) && !!ra && !ra.hid && !ra.struck && s.n === n0 - 1, say(s), [nr, ...s.pics].join(', '))
}

await run(SCN, SZ, async (p, W) => {
  const bundle = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean))
  W.rec('bundle', 'the page serves index-Bt57FROH.js', bundle.some(s => /index-Bt57FROH\.js$/.test(s)), J(bundle))
  await S[SCN](p, W)
})
writeFileSync(`D:/raptor-work/c207-walk/A2/results-${SCN}-${SZ}-${process.env.SWLA_RUN || 'rw1'}.json`, JSON.stringify(L.results, null, 1))
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE ${SCN} ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')} · NOT WALKED ${c('NW')}`)
process.exit(0)
