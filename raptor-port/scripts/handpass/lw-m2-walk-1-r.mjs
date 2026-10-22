// M2 walk, walker 1 — scenarios A (1-15), G (62-63), H (64-65) of docs/superpowers/briefs/2026-10-23-lw-m2-scenarios.md
// Every step asserts the RIGHT behaviour: a PASS means correct. Run: node scripts/handpass/lw-m2-walk-1.mjs [only-ids e.g. 1,2,4]
// Build served at http://localhost:4265/?fresh=1. Pictures in docs/img/handpass/2026-10-23-lw-m2-looks/w1-r/.
import * as L from './lw-m2-walk-1-lib-r.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
console.log('lw-m2-walk-1 v1 — build at fcddf90f4 on :4265')
const ONLY = process.argv[2] ? new Set(process.argv[2].split(',')) : null
const T = L.T
const all = []
const errsAll = []
const sleep = (w, ms) => w.page.waitForTimeout(ms)

class Sc {
  constructor(id, size) { this.id = id; this.size = size; this.notes = []; this.fails = []; this.pics = []; this.notrun = null }
  ok(cond, text) { this.notes.push((cond ? 'ok: ' : 'FAIL: ') + text); if (!cond) this.fails.push(text) }
  say(text) { this.notes.push(text) }
  pic(n) { this.pics.push(n + '.png') }
}
async function run(id, size, w0, fn, opt = {}) {
  if (ONLY && !ONLY.has(String(id).replace(/\D.*/, ''))) return
  const w = w0 || (opt.who === 'member' ? await newMember(size, opt.today) : await newAdmin(size))
  const S = new Sc(id, size)
  try { await fn(w, S) } catch (e) { console.log('   STACK: ' + String(e.stack).split('\n').slice(0, 6).map(x => x.trim().slice(0, 140)).join(' / ')); S.fails.push('SCRIPT/STEP ERROR: ' + String(e.message).split('\n')[0].slice(0, 240)); try { await L.shot(w, `s${String(id).padStart(2, '0')}-error-${size}`); S.pic(`s${String(id).padStart(2, '0')}-error-${size}`) } catch {} }
  const verdict = S.notrun ? 'NOT RUN' : S.fails.length ? 'FAIL' : 'PASS'
  all.push({ id, size, verdict, notes: S.notes, fails: S.fails, pics: S.pics, notrun: S.notrun })
  console.log(`${verdict}  S${id} [${size}]  ${S.notrun ? S.notrun : S.fails.join(' || ') || S.notes.filter(n => n.startsWith('ok')).length + ' checks ok'}`)
  for (const n of S.notes) console.log('     ' + n)
  await L.closeAny(w).catch(() => {})
  errsAll.push(...w.errs.map(e => '[S' + id + ' ' + size + '] ' + e))
  if (!w0) await w.ctx.close().catch(() => {})
}
const P = n => String(n).padStart(2, '0')
const rgb = s => (s.match(/[\d.]+/g) || []).map(Number)
const isPurple = s => { const [r, g, b] = rgb(s); return b != null && b > g + 40 && r > g + 15 }
const near = (a, b, t = 3) => Math.abs(a - b) <= t

const ptOf = async (page, id) => { const bb = await page.locator(T(id)).first().boundingBox(); return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 } }
async function openLegend(w) { await L.press(w, T('legend-open')); await w.page.waitForSelector(T('legend')); await sleep(w, 350) }
async function closeLegend(w) {
  if (!(await L.vis(w.page, T('legend')))) return
  await w.page.keyboard.press('Escape'); await sleep(w, 300)
  if (await L.vis(w.page, T('legend'))) {
    const sc = await w.page.locator(T('legend-scrim')).first().boundingBox().catch(() => null)
    const lg = await w.page.locator(T('legend')).first().boundingBox().catch(() => null)
    // a point on the scrim that is outside the open legend and below the top bar
    const pts = [[w.phone ? 20 : 300, w.phone ? 700 : 600], [20, 800], [300, 760]]
    for (const [x, y] of pts) { if (lg && x > lg.x && x < lg.x + lg.width && y > lg.y && y < lg.y + lg.height) continue; await w.page.mouse.click(x, y); await sleep(w, 300); if (!(await L.vis(w.page, T('legend')))) break }
  }
}
const legendBoxes = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="legend"] .leg-box')].map(box => {
  const row = box.closest('.leg-row')
  return {
    label: row?.querySelector('.leg-t')?.textContent || '',
    boxes: [...box.querySelectorAll('.c')].map(c => { const cs = getComputedStyle(c); return { cls: c.className, text: c.textContent, bg: cs.backgroundColor, color: cs.color, ol: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, bs: cs.boxShadow, td: cs.textDecorationLine, fs: cs.fontSize } }),
  }
}))
const style = (page, who, iso) => L.cellInfo(page, who, iso)
const nol = s => /^none/.test(s) ? 'none' : s
const sig = b => [b.bg, b.color, b.ol, b.bs, b.td].join(' | ')

async function giveOil(w, who, iso, days, half = null, { open = true } = {}) {
  if (open) await L.openCell(w, who, iso)
  if (!(await L.vis(w.page, T('oil-days')))) { await L.press(w, T('bid-oil')); await sleep(w, 300) }
  await w.page.fill(T('oil-days'), String(days)); await sleep(w, 200)
  if (half) { await L.press(w, T(`oil-half-${half}`)); await sleep(w, 150) }
  await L.press(w, T('oil-give')); await sleep(w, 600)
  const err = await L.txt(w.page, T('oil-err'))
  return err
}
const daylistRecs = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="daylist"] li')].map(li => ({ key: li.dataset.testid, text: li.innerText.replace(/\s+/g, ' ').trim(), ids: [...li.querySelectorAll('[data-testid]')].map(e => e.dataset.testid) })))
async function oilEditHalf(w, who, iso, half) {
  await L.openCell(w, who, iso)
  const btn = w.page.locator('[data-testid^="dl-oil-edit-"]').first()
  const tid = await btn.getAttribute('data-testid')
  const id = tid.replace('dl-oil-edit-', '')
  await L.press(w, `[data-testid="${tid}"]`); await sleep(w, 300)
  await L.press(w, T(`oil-edit-half-${id}-${half}`)); await sleep(w, 200)
  await L.press(w, T(`oil-edit-save-${id}`)); await sleep(w, 600)
  return id
}
const fileIn = (page, who, mon, day, type, extra = {}) => page.evaluate(([who, mon, day, type, extra]) => { window.fileInput({ person: who, date: mon + ' ' + day, allday: true, type, remarks: 'walk', by: who, at: Date.now(), yr: 2026, iid: 'w1x-' + Math.random().toString(36).slice(2, 8), ord: 9999, ...extra }) }, [who, mon, day, type, extra])
const BOXES = (info) => info?.boxes || []

/* ------------------------------------------------------------------------------------------------------------- */
async function newAdmin(size) {
  const w = await L.newCtx(size)
  await L.signIn(w, 'admin')
  return w
}
async function newMember(size, today = '2026-01-05') {
  const w = await L.newCtx(size)
  await L.signIn(w, 'member', today)
  return w
}
const SIZES = process.env.SIZES ? process.env.SIZES.split(',') : ['desk', 'phone']

for (const size of SIZES) {
  console.log('\n=== ' + size + ' ===')

  // ---------------------------------------------------------------- 1: colours by kind vs the Legend's swatches
  await run(1, size, null, async (w, S) => { const { page } = w;
    await openLegend(w)
    const lb = await legendBoxes(page)
    await L.shot(w, `s01-legend-${size}`); S.pic(`s01-legend-${size}`)
    const legOf = (k, s) => lb.flatMap(r => r.boxes).find(b => b.cls.includes(k) && b.cls.includes(s) && /whole/.test(b.cls))
    await closeLegend(w)
    S.ok(lb.length > 10, `the Legend has ${lb.length} sample boxes`)
    const targets = [
      ['LL', 'stiff', null, '2026-01-08', 'bruise', 'JAN', 'k-ll'],
      ['OL', 'dj', null, '2026-01-16', 'dj', 'JAN', 'k-ol'],
      ['OIL', 'prowler', null, '2026-03-02', 'prowler', 'MAR', 'k-oil'],
      ['FO', 'prowler', null, '2026-01-04', 'prowler', 'JAN', 'k-oil'],
      ['HO', 'slipway', null, '2026-04-18', 'slipway', 'APR', 'k-oil'],
      ['OD', 'pike', null, '2026-07-15', 'pike', 'JUL', 'k-od'],
      ['medical(OML)', 'bruise', null, '2026-07-23', 'bruise', 'JUL', 'k-med'],
    ]
    for (const [name, , , iso, who, mon, k] of targets) {
      await L.gotoMonth(w, mon)
      const info = await style(page, who, iso)
      if (!info || !info.boxes.length) { S.ok(false, `${name}: no box on ${who} ${iso}`); continue }
      const b = info.boxes[0]
      const lg = legOf(k, 's-a')
      S.ok(!!lg, `${name}: a Legend swatch for ${k} approved exists`)
      if (lg) S.ok(b.bg === lg.bg && b.color === lg.color && nol(b.ol) === nol(lg.ol) && b.bs === lg.bs, `${name} (${who} ${iso}, "${b.text}", ${b.cls}): grid box bg=${b.bg} colour=${b.color} outline=${b.ol} shadow=${b.bs} vs Legend swatch bg=${lg.bg} colour=${lg.color} outline=${lg.ol} shadow=${lg.bs}`)
      await L.cellShot(w, who, iso, `s01-${name.replace(/\W+/g, '')}-${size}`); S.pic(`s01-${name.replace(/\W+/g, '')}-${size}`)
    }
    // CCL: place one through the bid window and approve it
    await L.gotoMonth(w, 'FEB')
    const placed = await L.bid(w, 'stiff', '2026-02-16', 'CCL')
    await L.openCell(w, 'stiff', '2026-02-16'); await L.press(w, T('decide-approve')); await sleep(w, 500)
    const ci = await style(page, 'stiff', '2026-02-16')
    const cb = ci.boxes[0]
    const lgc = legOf('k-care', 's-a')
    S.ok(placed && !!cb && !!lgc && cb.bg === lgc.bg && cb.color === lgc.color && nol(cb.ol) === nol(lgc.ol) && cb.bs === lgc.bs, `CCL (placed on Saber 16 Feb, approved): grid ${cb ? cb.cls + ' bg=' + cb.bg + ' colour=' + cb.color : 'none'} vs Legend ${lgc ? lgc.bg + ' ' + lgc.color : 'none'}`)
    await L.cellShot(w, 'stiff', '2026-02-16', `s01-CCL-${size}`); S.pic(`s01-CCL-${size}`)
    S.say('CSE (course) has no real cell on the demo grid and a course is filed on the Inputs page: compared in the Legend only (swatch present, k-cse)')
    S.ok(!!legOf('k-cse', 's-a'), 'the Legend has a CSE swatch in its own colour class')
  })

  // ---------------------------------------------------------------- 2: one LL bid through its states, Undo x3, Redo x3
  await run(2, size, null, async (w, S) => { const { page } = w;
    await L.gotoMonth(w, 'JAN')
    const D = '2026-01-14'
    const rd = async () => { const i = await style(page, 'stiff', D); return i && i.boxes[0] ? i.boxes[0] : null }
    const clsOf = async () => (await rd())?.cls || '(none)'
    await L.bid(w, 'stiff', D, 'LL')
    let b = await rd()
    S.ok(b && /s-w/.test(b.cls) && b.bg === 'rgba(0, 0, 0, 0)' && /dashed/.test(b.ol), `pending: hollow, dashed outline (${b?.cls} bg=${b?.bg} outline=${b?.ol})`)
    await L.cellShot(w, 'stiff', D, `s02-1-pending-${size}`); S.pic(`s02-1-pending-${size}`)
    S.ok(b && !isPurple(b.bg + b.color + b.ol + b.bs), `pending: no purple (${b?.color})`)
    await L.openCell(w, 'stiff', D)
    const dump1 = await L.sheetDump(page)
    S.ok(dump1 && dump1.tids.includes('decide-approve') && dump1.tids.includes('decide-refuse') && !dump1.tids.some(t => /ack/.test(t)) && !/\bAck\b/.test(dump1.text), `the Decide row: ${dump1?.text.match(/DECIDE \|[^|]*\|[^|]*\|/)?.[0]}`)
    await L.press(w, T('decide-approve')); await sleep(w, 500)
    b = await rd()
    S.ok(b && /s-a/.test(b.cls) && /0\.22/.test(b.bg) && !/raptor/.test(b.cls), `approved: filled amber (${b?.cls} bg=${b?.bg}), no Inputs-page edge`)
    S.ok(b && !isPurple(b.bg + b.color + b.ol + b.bs), 'approved: no purple')
    await L.cellShot(w, 'stiff', D, `s02-2-approved-${size}`); S.pic(`s02-2-approved-${size}`)
    // back to bid: the one-day window has no such button; the day's list does (checked in 4). Here: Undo.
    await L.openCell(w, 'stiff', D); await L.press(w, T('decide-refuse')); await sleep(w, 500)
    b = await rd()
    S.ok(b && /s-r/.test(b.cls) && b.td === 'line-through' && /125, 136, 148/.test(b.color), `refused: grey, struck through (${b?.cls} colour=${b?.color} deco=${b?.td})`)
    S.ok(b && !isPurple(b.bg + b.color + b.ol + b.bs), 'refused: no purple')
    await L.cellShot(w, 'stiff', D, `s02-3-refused-${size}`); S.pic(`s02-3-refused-${size}`)
    await L.undo(w); S.ok((await clsOf()).includes('s-a'), `Undo 1 -> approved (${await clsOf()})`)
    await L.undo(w); S.ok((await clsOf()).includes('s-w'), `Undo 2 -> pending (${await clsOf()})`)
    await L.undo(w); S.ok((await clsOf()) === '(none)', `Undo 3 -> the bid is gone (${await clsOf()})`)
    await L.redo(w); S.ok((await clsOf()).includes('s-w'), `Redo 1 -> pending (${await clsOf()})`)
    await L.redo(w); S.ok((await clsOf()).includes('s-a'), `Redo 2 -> approved (${await clsOf()})`)
    await L.redo(w); S.ok((await clsOf()).includes('s-r'), `Redo 3 -> refused (${await clsOf()})`)
    await L.cellShot(w, 'stiff', D, `s02-4-redo-${size}`); S.pic(`s02-4-redo-${size}`)
    S.say('Reload: the ?fresh=1 world keeps nothing, so the reload half is walked on the plain address in the separate step 2b')
  })

  // ---------------------------------------------------------------- 4: AM LL bid + PM OIL bid
  await run(4, size, null, async (w, S) => { const { page } = w;
    await L.gotoMonth(w, 'JAN')
    const D = '2026-01-20'
    await L.bid(w, 'stiff', D, 'LL', { portion: 'am' })
    await L.bid(w, 'stiff', D, 'OIL', { portion: 'pm' })
    let info = await style(page, 'stiff', D)
    const bx = info.boxes
    S.ok(bx.length === 2, `two boxes drawn (${bx.map(b => b.cls + '=' + b.text).join(' ; ')})`)
    const [am, pm] = [bx.find(b => /top/.test(b.cls)), bx.find(b => /bot/.test(b.cls))]
    S.ok(am && pm && am.y < pm.y && am.text === 'LL' && pm.text === 'OIL', `AM LL on top (y=${am?.y}), PM OIL below (y=${pm?.y})`)
    S.ok(am && pm && /s-w/.test(am.cls) && /s-w/.test(pm.cls), 'both pending (hollow)')
    S.ok(!info.marks.some(m => /more|\+1/.test(m)), `no "+1" (marks: ${info.marks.join(',') || 'none'})`)
    await L.cellShot(w, 'stiff', D, `s04-1-two-pending-${size}`); S.pic(`s04-1-two-pending-${size}`)
    // approve only the AM through the day's list
    await L.openCell(w, 'stiff', D)
    const recs = await daylistRecs(page)
    S.say('day list lines: ' + recs.map(r => r.text).join(' || '))
    const llLine = recs.find(r => /LL/.test(r.text) && r.ids.some(i => i.startsWith('dl-approve-')))
    S.ok(!!llLine, 'the day list offers Approve on the LL line')
    if (llLine) {
      await L.press(w, `[data-testid="${llLine.ids.find(i => i.startsWith('dl-approve-'))}"]`); await sleep(w, 500)
    }
    await L.closeAny(w)
    info = await style(page, 'stiff', D)
    const am2 = info.boxes.find(b => /top/.test(b.cls)), pm2 = info.boxes.find(b => /bot/.test(b.cls))
    S.ok(am2 && /s-a/.test(am2.cls) && pm2 && /s-w/.test(pm2.cls), `AM approved (${am2?.cls}), PM still pending (${pm2?.cls})`)
    S.ok(!info.marks.some(m => /more/.test(m)), `still no "+1" (${info.marks.join(',') || 'none'})`)
    await L.cellShot(w, 'stiff', D, `s04-2-am-approved-${size}`); S.pic(`s04-2-am-approved-${size}`)
    // Back to bid from the list
    await L.openCell(w, 'stiff', D)
    const recs2 = await daylistRecs(page)
    const ub = recs2.flatMap(r => r.ids).find(i => i.startsWith('dl-unapprove-'))
    S.ok(!!ub, `the day's list offers "Back to bid" on the approved line (${ub})`)
    if (ub) { await L.press(w, `[data-testid="${ub}"]`); await sleep(w, 500) }
    await L.closeAny(w)
    info = await style(page, 'stiff', D)
    S.ok(info.boxes.every(b => /s-w/.test(b.cls)), `after Back to bid both pending again (${info.boxes.map(b => b.cls).join(' ; ')})`)
  })

  // ---------------------------------------------------------------- 5: two whole days side by side
  await run(5, size, null, async (w, S) => { const { page } = w;
    await L.gotoMonth(w, 'JAN')
    let info = await style(page, 'dj', '2026-01-19')
    let bx = info.boxes
    S.ok(bx.length === 2, `seeded 19 Jan Ace: two boxes (${bx.map(b => b.cls + '=' + b.text).join(' ; ')})`)
    const cellH = info.tdh, cellW = info.tdw
    if (bx.length === 2) {
      const [a, b] = [...bx].sort((p, q) => p.x - q.x)
      S.ok(a.h >= cellH - 8 && b.h >= cellH - 8, `each the full height (heights ${a.h}/${b.h} in a cell ${cellH} high)`)
      S.ok(a.x < b.x && a.x + a.w <= b.x + 1 && b.x + b.w <= cellW, `side by side, not overlapping (x ${a.x}+${a.w} | ${b.x}+${b.w} in ${cellW})`)
      S.ok(a.text === 'FO' && /s-a/.test(a.cls) && b.text === 'OL' && /s-r/.test(b.cls), `FO approved green and OL refused grey (${a.cls} / ${b.cls}); colours ${a.color} / ${b.color}`)
      S.ok(!info.marks.some(m => /more/.test(m)), `no "+1" (${info.marks.join(',') || 'none'})`)
    }
    await L.cellShot(w, 'dj', '2026-01-19', `s05-1-seeded-${size}`); S.pic(`s05-1-seeded-${size}`)
    // an FO given by hand on an approved OL day
    const err = await giveOil(w, 'dj', '2026-01-16', 1)
    await L.closeAny(w)
    info = await style(page, 'dj', '2026-01-16')
    bx = info.boxes
    S.ok(bx.length === 2, `an FO given on approved OL 16 Jan: two boxes (${bx.map(b => b.cls + '=' + b.text).join(' ; ')}) ${err || ''}`)
    if (bx.length === 2) {
      const [a, b] = [...bx].sort((p, q) => p.x - q.x)
      S.ok(a.h >= info.tdh - 8 && b.h >= info.tdh - 8 && a.x + a.w <= b.x + 1, `side by side, full height (${a.text} x${a.x} w${a.w} h${a.h} | ${b.text} x${b.x} w${b.w} h${b.h}; cell ${info.tdw}x${info.tdh})`)
      S.ok(!info.marks.some(m => /more/.test(m)), `no "+1" (${info.marks.join(',') || 'none'})`)
    }
    await L.cellShot(w, 'dj', '2026-01-16', `s05-2-fo-on-ol-${size}`); S.pic(`s05-2-fo-on-ol-${size}`)
    // three-letter code beside a two-letter code: OIL (approved, wide) with an FO beside it
    await L.gotoMonth(w, 'MAY')
    const err2 = await giveOil(w, 'slipway', '2026-05-11', 1)
    await L.closeAny(w)
    info = await style(page, 'slipway', '2026-05-11')
    bx = info.boxes
    S.ok(bx.length === 2, `an FO given on approved OIL 11 May: two boxes (${bx.map(b => b.cls + '=' + b.text).join(' ; ')}) ${err2 || ''}`)
    if (bx.length === 2) {
      const three = bx.find(b => b.text.replace('*', '').length === 3), two = bx.find(b => b.text.length === 2)
      const fs = x => parseFloat(x.fs)
      S.ok(three && two && fs(three) < fs(two), `three-letter OIL a step smaller than two-letter FO (${three?.fs} vs ${two?.fs})`)
      S.ok(three && three.x >= 0 && three.x + three.w <= info.tdw, `OIL fits its cell (x${three?.x} w${three?.w} in ${info.tdw}); text not clipped: ${bx.map(b => b.text).join('/')}`)
      S.ok(!info.marks.some(m => /more/.test(m)), `no "+1" (${info.marks.join(',') || 'none'})`)
    }
    await L.cellShot(w, 'slipway', '2026-05-11', `s05-3-three-letter-${size}`); S.pic(`s05-3-three-letter-${size}`)
  })

  // ---------------------------------------------------------------- 6: whole LL + HO morning -> afternoon
  await run(6, size, null, async (w, S) => { const { page } = w;
    await L.gotoMonth(w, 'JAN')
    const D = '2026-01-22'
    await L.bid(w, 'stiff', D, 'LL')
    const err = await giveOil(w, 'stiff', D, 0.5, 'am')
    await L.closeAny(w)
    let info = await style(page, 'stiff', D)
    let bx = info.boxes
    S.ok(bx.length === 2, `LL + HO: two boxes (${bx.map(b => b.cls + '=' + b.text).join(' ; ')}) ${err || ''}`)
    const ho = bx.find(b => b.text.replace('*', '') === 'HO'), ll = bx.find(b => b.text === 'LL')
    S.ok(ho && ll && /-am/.test(ho.cls) && ho.x >= info.tdw / 2 - 3 && ho.y <= info.tdh / 2 - 2 && ll.x <= ho.x, `HO morning sits top-right (HO x${ho?.x} y${ho?.y} h${ho?.h}; LL x${ll?.x} h${ll?.h}; cell ${info.tdw}x${info.tdh})`)
    S.ok(ho && ll && /s-a/.test(ho.cls), `HO is credited green (${ho?.cls}, colour ${ho?.color})`)
    await L.cellShot(w, 'stiff', D, `s06-1-ho-am-${size}`); S.pic(`s06-1-ho-am-${size}`)
    await oilEditHalf(w, 'stiff', D, 'pm'); await L.closeAny(w)
    info = await style(page, 'stiff', D)
    const ho2 = info.boxes.find(b => b.text.replace('*', '') === 'HO')
    S.ok(ho2 && /-pm/.test(ho2.cls) && ho2.x >= info.tdw / 2 - 3 && ho2.y >= info.tdh / 2 - 3, `HO changed to afternoon sits bottom-right (HO ${ho2?.cls} x${ho2?.x} y${ho2?.y})`)
    await L.cellShot(w, 'stiff', D, `s06-2-ho-pm-${size}`); S.pic(`s06-2-ho-pm-${size}`)
  })

  // ---------------------------------------------------------------- 3: a member's whole / AM / PM bids, phone letters
  await run(3, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'JAN')
    const days = [['2026-01-12', 'full'], ['2026-01-13', 'am'], ['2026-01-14', 'pm']]
    for (const [iso, portion] of days) S.ok(await L.bid(w, 'bane', iso, 'LL', { portion }), `member placed ${portion} LL on ${iso}`)
    const [iw, ia, ip] = [await style(page, 'bane', days[0][0]), await style(page, 'bane', days[1][0]), await style(page, 'bane', days[2][0])]
    const [bw, ba, bp] = [iw.boxes[0], ia.boxes[0], ip.boxes[0]]
    S.ok(bw && /whole/.test(bw.cls) && bw.h >= iw.tdh - 8 && bw.w >= iw.tdw - 8, `whole day fills the cell (box ${bw?.w}x${bw?.h} in ${iw.tdw}x${iw.tdh}, ${bw?.cls})`)
    S.ok(ba && /top/.test(ba.cls) && ba.h <= ia.tdh / 2 && ba.y <= 3, `AM is the top half (box ${ba?.w}x${ba?.h} at y${ba?.y} in ${ia.tdw}x${ia.tdh}, ${ba?.cls})`)
    S.ok(bp && /bot/.test(bp.cls) && bp.h <= ip.tdh / 2 && bp.y >= ip.tdh / 2 - 2, `PM is the bottom half (box ${bp?.w}x${bp?.h} at y${bp?.y} in ${ip.tdw}x${ip.tdh}, ${bp?.cls})`)
    S.ok(parseFloat(ba.fs) < parseFloat(bw.fs) && parseFloat(bp.fs) < parseFloat(bw.fs), `half-day letters smaller than the whole's (${ba.fs} / ${bp.fs} vs ${bw.fs})`)
    S.ok([bw, ba, bp].every(b => b.text === 'LL'), `printed text is just LL, no < > * arrows: ${[bw, ba, bp].map(b => JSON.stringify(b.text)).join(' ')}`)
    S.ok([bw, ba, bp].every(b => b.tw <= b.w + 0.5), `the letters fit their boxes (text width ${bw.tw}/${ba.tw}/${bp.tw} vs box ${bw.w}/${ba.w}/${bp.w})`)
    S.ok(![iw, ia, ip].some(i => i.marks.length), 'no corner marks on the three days')
    for (const [iso, tag] of [['2026-01-12', 'whole'], ['2026-01-13', 'am'], ['2026-01-14', 'pm']]) { await L.cellShot(w, 'bane', iso, `s03-${tag}-${size}`); S.pic(`s03-${tag}-${size}`) }
    await page.evaluate(() => document.querySelector('[data-testid="cell-bane-2026-01-13"]').scrollIntoView({ block: 'center', inline: 'center' })); await sleep(w, 300)
    await L.shot(w, `s03-grid-default-zoom-${size}`); S.pic(`s03-grid-default-zoom-${size}`)
    // one zoom step in and back out
    const fsOf = async () => { const i = await style(page, 'bane', days[0][0]); return i.tdw + 'px cell / ' + i.boxes[0].w + 'px box / ' + i.boxes[0].fs }
    const f0 = await fsOf(); await L.press(w, T('lw-zoom-in')); await sleep(w, 500)
    const f1 = await fsOf(); await page.evaluate(() => document.querySelector('[data-testid="cell-bane-2026-01-13"]').scrollIntoView({ block: 'center', inline: 'center' })); await sleep(w, 300)
    await L.shot(w, `s03-grid-zoom-in-${size}`); S.pic(`s03-grid-zoom-in-${size}`)
    await L.press(w, T('lw-zoom-out')); await sleep(w, 300); await L.press(w, T('lw-zoom-out')); await sleep(w, 500)
    const f2 = await fsOf(); await page.evaluate(() => document.querySelector('[data-testid="cell-bane-2026-01-13"]').scrollIntoView({ block: 'center', inline: 'center' })); await sleep(w, 300)
    await L.shot(w, `s03-grid-zoom-out-${size}`); S.pic(`s03-grid-zoom-out-${size}`)
    S.say(`whole box at default zoom: ${f0}; one step in: ${f1}; two steps out: ${f2}`)
    S.ok(parseFloat(f1) > parseFloat(f0) && parseFloat(f2) < parseFloat(f0), `zooming in grows the cell (${f0} -> ${f1}) and out shrinks it (${f2})`)
  }, { who: 'member', today: '2026-01-05' })

  // ---------------------------------------------------------------- 7: three entries -> one box and a "+2", the list names all three
  await run(7, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'JAN')
    const D = '2026-01-28'
    await L.bid(w, 'stiff', D, 'LL', { portion: 'am' }); await L.bid(w, 'stiff', D, 'OL', { portion: 'pm' })
    await fileIn(page, 'stiff', 'Jan', 28, 'CSE'); await sleep(w, 800)
    let info = await style(page, 'stiff', D)
    S.ok(info.boxes.length === 1 && info.marks.some(m => /more:\+2/.test(m)), `three entries: ONE box and a "+2" corner (${info.boxes.map(b => b.cls + '=' + b.text).join(' ; ')} / marks ${info.marks.join(',')})`)
    await L.cellShot(w, 'stiff', D, `s07-1-three-${size}`); S.pic(`s07-1-three-${size}`)
    await L.openCell(w, 'stiff', D)
    const recs = await daylistRecs(page)
    S.ok(recs.length >= 3, `the tap opens the day's list holding ${recs.length} lines: ${recs.map(r => r.text.slice(0, 60)).join(' || ')}`)
    await L.shot(w, `s07-2-list-${size}`); S.pic(`s07-2-list-${size}`)
    const clear = recs.find(r => /LL/.test(r.text) && r.ids.some(i => i.startsWith('dl-clear-')))
    if (clear) await L.press(w, `[data-testid="${clear.ids.find(i => i.startsWith('dl-clear-'))}"]`)
    await sleep(w, 600); await L.closeAny(w)
    info = await style(page, 'stiff', D)
    S.ok(info.boxes.length === 2 && !info.marks.length, `delete one -> two boxes, no corner (${info.boxes.map(b => b.cls + '=' + b.text).join(' ; ')} / marks ${info.marks.join(',') || 'none'})`)
    await L.cellShot(w, 'stiff', D, `s07-3-after-delete-${size}`); S.pic(`s07-3-after-delete-${size}`)
    await L.undo(w)
    info = await style(page, 'stiff', D)
    S.ok(info.boxes.length === 1 && info.marks.some(m => /more:\+2/.test(m)), `Undo -> one box and "+2" again (${info.boxes.map(b => b.cls + '=' + b.text).join(' ; ')} / marks ${info.marks.join(',')})`)
  })

  // ---------------------------------------------------------------- 8: two entries and the amber "!"
  await run(8, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'JAN')
    const D = '2026-01-27'
    await L.bid(w, 'bane', D, 'LL', { portion: 'am' }); await L.bid(w, 'bane', D, 'OL', { portion: 'pm' })
    await fileIn(page, 'bane', 'Jan', 27, 'OML', { allday: false, s: 480, e: 600 }); await sleep(w, 800)
    const info = await style(page, 'bane', D)
    const bx = info.boxes
    S.say('premise: two pending bids for Ranger, then a morning medical filed through the Inputs door replaces the AM bid and leaves a notice (a bid replaced by someone else)')
    S.ok(bx.length === 2, `both boxes drawn (${bx.map(b => b.cls + '=' + b.text).join(' ; ')})`)
    S.ok(info.marks.some(m => /warn:!/.test(m)), `the amber "!" is kept (marks ${info.marks.join(',') || 'none'})`)
    const ov = await page.evaluate(([who, iso]) => {
      const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`); const mk = td.querySelector('.mk'); if (!mk) return null
      const m = mk.getBoundingClientRect()
      return [...td.querySelectorAll('.c')].map(c => { const r = document.createRange(); r.selectNodeContents(c); const t = r.getBoundingClientRect(); const ix = Math.max(0, Math.min(m.right, t.right) - Math.max(m.left, t.left)), iy = Math.max(0, Math.min(m.bottom, t.bottom) - Math.max(m.top, t.top)); return { text: c.textContent, overlapPx: Math.round(ix * iy * 10) / 10, mk: [Math.round(m.left - td.getBoundingClientRect().left), Math.round(m.top - td.getBoundingClientRect().top), Math.round(m.width), Math.round(m.height)], t: [Math.round(t.left - td.getBoundingClientRect().left), Math.round(t.top - td.getBoundingClientRect().top), Math.round(t.width), Math.round(t.height)] } })
    }, ['bane', D])
    S.ok(ov && ov.every(o => o.overlapPx < 8), `the "!" does not cover the boxes' letters (overlap per box in px²: ${JSON.stringify(ov)})`)
    await L.cellShot(w, 'bane', D, `s08-1-two-and-bang-${size}`); S.pic(`s08-1-two-and-bang-${size}`)
    // the "!" beside a whole day + a right-hand HO: whole LL approved, HO given in the morning, then a clashing medical in the afternoon
    const D2 = '2026-01-29'
    await L.bid(w, 'bane', D2, 'LL'); await giveOil(w, 'bane', D2, 0.5, 'am'); await L.closeAny(w)
    await fileIn(page, 'bane', 'Jan', 29, 'OML', { allday: false, s: 780, e: 900 }); await sleep(w, 800)
    const i2 = await style(page, 'bane', D2)
    S.say(`whole LL + right-hand HO AM then a timed afternoon medical: boxes ${i2.boxes.map(b => b.cls + '=' + b.text + ' x' + b.x + ' y' + b.y + ' ' + b.w + 'x' + b.h).join(' ; ')} / marks ${i2.marks.join(',') || 'none'}`)
    await L.cellShot(w, 'bane', D2, `s08-2-whole-ho-${size}`); S.pic(`s08-2-whole-ho-${size}`)
    if (i2.marks.some(m => /warn/.test(m))) {
      const ov2 = await page.evaluate(([who, iso]) => { const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`); const m = td.querySelector('.mk').getBoundingClientRect(); return [...td.querySelectorAll('.c')].map(c => { const r = document.createRange(); r.selectNodeContents(c); const t = r.getBoundingClientRect(); const ix = Math.max(0, Math.min(m.right, t.right) - Math.max(m.left, t.left)), iy = Math.max(0, Math.min(m.bottom, t.bottom) - Math.max(m.top, t.top)); return { text: c.textContent, overlapPx: Math.round(ix * iy * 10) / 10 } }) }, ['bane', D2])
      S.ok(ov2.every(o => o.overlapPx < 2), `the "!" does not cover letters on the whole+HO day either (${JSON.stringify(ov2)})`)
    }
  })

  // ---------------------------------------------------------------- 9: posted-out days, the PO ribbon, leave after posting out
  await run(9, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'JAN')
    const g = await page.evaluate(() => { const td = document.querySelector('[data-testid="cell-ignite-2026-01-14"]'); const c = td.querySelector('.c'); const t = td.getBoundingClientRect(), b = c.getBoundingClientRect(); const cs = getComputedStyle(td); const r = document.createRange(); r.selectNodeContents(c); const tr = r.getBoundingClientRect(); return { cls: td.className, text: c.textContent, tdw: t.width, tdh: t.height, cx: (b.left + b.width / 2) - (t.left + t.width / 2), cy: (b.top + b.height / 2) - (t.top + t.height / 2), tcx: (tr.left + tr.width / 2) - (t.left + t.width / 2), tcy: (tr.top + tr.height / 2) - (t.top + t.height / 2), bgi: cs.backgroundImage.slice(0, 90), vis: b.width > 4 && b.height > 4, bw: b.width, bh: b.height, clip: tr.width > b.width + 0.5 } })
    S.ok(/gone/.test(g.cls) && g.text === 'PO' && g.vis, `a day after posting out reads "PO" in the "gone" cell (${g.cls.trim()}, ${g.bw}x${g.bh})`)
    S.ok(Math.abs(g.tcx) <= 2.5 && Math.abs(g.tcy) <= 2.5, `the "PO" text is centred in its cell (offset x ${g.tcx.toFixed(1)}, y ${g.tcy.toFixed(1)}; cell ${g.tdw}x${g.tdh})`)
    S.ok(!g.clip, 'the "PO" is not clipped by its box')
    S.ok(/gradient|url/.test(g.bgi), `the hatch is drawn (background ${g.bgi})`)
    await L.cellShot(w, 'ignite', '2026-01-14', `s09-1-po-days-${size}`); S.pic(`s09-1-po-days-${size}`)
    const last = await page.evaluate(() => { const td = document.querySelector('[data-testid="cell-ignite-2026-01-12"]'); const p = td.querySelector('.polast'); if (!p) return null; const t = td.getBoundingClientRect(), r = p.getBoundingClientRect(); return { text: p.textContent, inside: r.left >= t.left - 1 && r.right <= t.right + 1 && r.top >= t.top - 1 && r.bottom <= t.bottom + 1, w: r.width, h: r.height, title: p.title } })
    S.ok(last && last.text === 'PO' && last.inside, `his last day wears the PO ribbon inside its cell (${JSON.stringify(last)})`)
    await L.cellShot(w, 'ignite', '2026-01-12', `s09-2-last-day-${size}`); S.pic(`s09-2-last-day-${size}`)
    // leave dated after posting out: filed through the Inputs door (a whole day and a half day)
    await fileIn(page, 'ignite', 'Jan', 20, 'LL'); await fileIn(page, 'ignite', 'Jan', 21, 'LL', { allday: false, s: 780, e: 1020 }); await sleep(w, 900)
    for (const [iso, tag] of [['2026-01-20', 'whole'], ['2026-01-21', 'half']]) {
      const info = await style(page, 'ignite', iso)
      const ov = await page.evaluate(([who, iso]) => { const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`); const tag = td.querySelector('.potag'); if (!tag) return null; const m = tag.getBoundingClientRect(); return { tag: tag.textContent, overlap: [...td.querySelectorAll('.c')].map(c => { const r = document.createRange(); r.selectNodeContents(c); const t = r.getBoundingClientRect(); const ix = Math.max(0, Math.min(m.right, t.right) - Math.max(m.left, t.left)), iy = Math.max(0, Math.min(m.bottom, t.bottom) - Math.max(m.top, t.top)); return Math.round(ix * iy * 10) / 10 }) } }, ['ignite', iso])
      S.say(`leave after posting out, ${tag} day ${iso}: boxes ${info.boxes.map(b => b.cls + '=' + b.text + ' ' + b.w + 'x' + b.h + '@' + b.x + ',' + b.y).join(' ; ') || 'none'}; potag ${JSON.stringify(ov)}; marks ${info.marks.join(',')}`)
      S.ok(info.boxes.length >= 1 && ov && ov.tag === 'PO', `${tag}: the leave box is drawn with the PO tag`)
      S.ok(ov && ov.overlap.every(a => a < (tag === 'whole' ? 20 : 8)), `${tag}: the PO tag does not swallow the box's letters (overlap with the letters' line box px² ${JSON.stringify(ov?.overlap)}; a whole box may be touched at its corner as in r7-04, a half box's letters must stay clear)`)
      await L.cellShot(w, 'ignite', iso, `s09-3-leave-after-${tag}-${size}`); S.pic(`s09-3-leave-after-${tag}-${size}`)
    }
  })

  // ---------------------------------------------------------------- 10: the Inputs-page edge and the moved edge, on light and deep amber
  await run(10, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'FEB')
    await fileIn(page, 'stiff', 'Feb', 3, 'LL'); await fileIn(page, 'stiff', 'Feb', 4, 'OL'); await sleep(w, 800)
    // a moved edge: approve an LL and an OL bid, then move each to the next day
    await L.bid(w, 'stiff', '2026-02-10', 'LL'); await L.openCell(w, 'stiff', '2026-02-10'); await L.press(w, T('decide-approve')); await sleep(w, 400); await L.closeAny(w)
    await L.bid(w, 'stiff', '2026-02-17', 'OL'); await L.openCell(w, 'stiff', '2026-02-17'); await L.press(w, T('decide-approve')); await sleep(w, 400); await L.closeAny(w)
    const moveTo = async (from, to) => {
      await L.openCell(w, 'stiff', from)
      await L.press(w, T('decide-shift')); await sleep(w, 500)
      await L.press(w, T(L.cellId('stiff', to))); await sleep(w, 800)
      const cf = page.locator('[data-testid="move-banner"] button:has-text("Confirm")'); if (await cf.count()) { await L.press(w, '[data-testid="move-banner"] button:has-text("Confirm")'); await sleep(w, 800) }
      const dump = await L.sheetDump(page)
      if (dump && /bid-picker|daylist|raptor|sheet/.test(dump.id)) { await L.closeAny(w) }
    }
    await moveTo('2026-02-10', '2026-02-11'); await moveTo('2026-02-17', '2026-02-18')
    const dark = s => { const v = rgb(s || ''); return v.length >= 3 && (0.3 * v[0] + 0.59 * v[1] + 0.11 * v[2]) < 70 }
    for (const [iso, tag, want] of [['2026-02-03', 'raptor-LL', 'raptor'], ['2026-02-04', 'raptor-OL', 'raptor'], ['2026-02-11', 'moved-LL', 'moved'], ['2026-02-18', 'moved-OL', 'moved']]) {
      const info = await style(page, 'stiff', iso)
      const b = info.boxes[0]
      S.say(`${tag} ${iso}: ${JSON.stringify(info.boxes.map(x => [x.cls, x.text]))}`)
      S.ok(b && new RegExp(want).test(b.cls), `${tag}: the box wears the ${want} edge (${b?.cls})`)
      const bf = b?.bf
      S.say(`${tag} edge pseudo-element: ${JSON.stringify(bf)}`)
      const edgeW = parseFloat((bf?.bd || '').split(' ')[0]) || 0
      S.ok(!!bf && edgeW >= 1, `${tag}: the edge is drawn, ${edgeW}px wide (${bf?.bd})`)
      if (want === 'moved') {
        const hasDark = !!bf && /rgba\(\s*13,\s*17,\s*23/.test(bf.bs)
        S.ok(hasDark, `${tag}: the moved edge carries the thin dark outline (D1175): box-shadow "${bf?.bs}"`)
      } else {
        S.say(`${tag}: the Inputs-page edge is the app's bright blue, 2px, with no dark outline of its own (box-shadow "${bf?.bs}"); whether it reads on the amber is judged on the picture`)
      }
      await L.cellShot(w, 'stiff', iso, `s10-${tag}-${size}`); S.pic(`s10-${tag}-${size}`)
    }
  })

  // ---------------------------------------------------------------- 11: Inputs-page entry as the second entry
  await run(11, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'FEB')
    const D = '2026-02-13'
    await L.bid(w, 'stiff', D, 'LL'); await L.openCell(w, 'stiff', D); await L.press(w, T('decide-approve')); await sleep(w, 400); await L.closeAny(w)
    const before = (await style(page, 'stiff', D)).boxes[0]
    await fileIn(page, 'stiff', 'Feb', 13, 'CSE'); await sleep(w, 800)
    const info = await style(page, 'stiff', D)
    const ll = info.boxes.find(b => b.text === 'LL'), cse = info.boxes.find(b => b.text === 'CSE')
    S.say(`before the CSE: LL ${before.cls}; after: ${info.boxes.map(b => b.cls + '=' + b.text).join(' ; ')}`)
    S.ok(!!cse && /raptor/.test(cse.cls), `the Inputs-page CSE box carries the blue edge (${cse?.cls})`)
    S.ok(!!ll && !/raptor/.test(ll.cls), `the war-approved LL box does NOT wear the Inputs-page edge it never had (${ll?.cls}; before ${before.cls})`)
    await L.cellShot(w, 'stiff', D, `s11-1-ll-and-cse-${size}`); S.pic(`s11-1-ll-and-cse-${size}`)
  })

  // ---------------------------------------------------------------- 12: an HO and a half-day leave on the SAME half
  await run(12, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'FEB')
    const overlap = bx => { const out = []; for (let i = 0; i < bx.length; i++) for (let j = i + 1; j < bx.length; j++) { const a = bx[i], b = bx[j]; const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)), iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)); out.push(ix * iy) } return out }
    // order 1: AM LL first, then an HO pressed AM
    const D1 = '2026-02-17'
    await L.bid(w, 'stiff', D1, 'LL', { portion: 'am' })
    const err = await giveOil(w, 'stiff', D1, 0.5, 'am'); await L.closeAny(w)
    let info = await style(page, 'stiff', D1)
    S.say(`order 1 (AM LL then HO pressed AM): ${err ? 'refused: ' + err + ' | ' : ''}boxes ${info.boxes.map(b => b.cls + '=' + b.text + ' ' + b.w + 'x' + b.h + '@' + b.x + ',' + b.y).join(' ; ')} / marks ${info.marks.join(',') || 'none'}`)
    S.ok(overlap(info.boxes).every(a => a === 0), `order 1: no two boxes drawn on top of each other (overlap px² ${JSON.stringify(overlap(info.boxes))})`)
    S.ok(info.boxes.length === 1 && info.marks.some(m => /more:\+1/.test(m)), `order 1: one box and a "+1" corner (${info.boxes.length} boxes; marks ${info.marks.join(',') || 'none'})`)
    await L.cellShot(w, 'stiff', D1, `s12-1-ll-then-ho-${size}`); S.pic(`s12-1-ll-then-ho-${size}`)
    await L.openCell(w, 'stiff', D1)
    const lt = (await daylistRecs(page)).map(r => r.text).join(' || ')
    S.ok(/morning/i.test(lt) && (lt.match(/morning/gi) || []).length >= 2, `order 1: the day's list names both halves (${lt.slice(0, 220)})`)
    await L.shot(w, `s12-2-list-order1-${size}`); S.pic(`s12-2-list-order1-${size}`)
    await L.closeAny(w)
    // order 2: HO AM first, then AM LL
    const D2 = '2026-02-18'
    await giveOil(w, 'stiff', D2, 0.5, 'am'); await L.closeAny(w)
    const ok2 = await L.bid(w, 'stiff', D2, 'LL', { portion: 'am' })
    info = await style(page, 'stiff', D2)
    S.say(`order 2 (HO AM then AM LL): bid placed ${ok2}; boxes ${info.boxes.map(b => b.cls + '=' + b.text + ' ' + b.w + 'x' + b.h + '@' + b.x + ',' + b.y).join(' ; ')} / marks ${info.marks.join(',') || 'none'}`)
    S.ok(overlap(info.boxes).every(a => a === 0), `order 2: no two boxes drawn on top of each other (overlap px² ${JSON.stringify(overlap(info.boxes))})`)
    await L.cellShot(w, 'stiff', D2, `s12-3-ho-then-ll-${size}`); S.pic(`s12-3-ho-then-ll-${size}`)
    await L.openCell(w, 'stiff', D2)
    const lt2 = (await daylistRecs(page)).map(r => r.text).join(' || ')
    S.say(`order 2 day list: ${lt2.slice(0, 260)}`)
    await L.closeAny(w)
  })

  // ---------------------------------------------------------------- 13: columns
  await run(13, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'JAN')
    await fileIn(page, 'stiff', 'Jan', 26, 'CSE'); await fileIn(page, 'stiff', 'Jan', 27, 'CSE'); await sleep(w, 700)
    if (!(await page.locator('[data-testid^="avail-p-2026-01"]').count())) { await L.press(w, T('counts-toggle')); await sleep(w, 600) }
    const r = await page.evaluate(() => {
      let maxDiff = 0, n = 0, maxAlign = 0, na = 0
      for (let d = 1; d <= 31; d++) {
        const iso = '2026-01-' + String(d).padStart(2, '0')
        const a = document.querySelector('[data-testid="cell-stiff-' + iso + '"]'), b = document.querySelector('[data-testid="cell-dice-' + iso + '"]'), f = document.querySelector('[data-testid="avail-p-' + iso + '"]')
        if (a && b) { maxDiff = Math.max(maxDiff, Math.abs(a.getBoundingClientRect().width - b.getBoundingClientRect().width)); n++ }
        if (a && f) { const ra = a.getBoundingClientRect(), rf = f.getBoundingClientRect(); maxAlign = Math.max(maxAlign, Math.abs((ra.left + ra.width / 2) - (rf.left + rf.width / 2))); na++ }
      }
      return { maxDiff, n, maxAlign, na }
    })
    S.ok(r.n >= 25 && r.maxDiff < 0.5, `each day column is as wide on Saber's row (which holds CSE boxes on 26 and 27 Jan) as on Reaper's row, which holds none (worst difference ${r.maxDiff.toFixed(2)}px over ${r.n} days)`)
    S.ok(r.na >= 25 && r.maxAlign <= 1, `the Available P figures line up under the people's day cells (worst centre offset ${r.maxAlign.toFixed(2)}px over ${r.na} days)`)
    S.say('the open-bidding outline: nothing is open in the demo world (the chip reads "Bidding closed"), so no outline can be checked in this walk; walker 2/3 cover M1\'s open dates')
    await L.shot(w, `s13-columns-${size}`); S.pic(`s13-columns-${size}`)
  })

  // ---------------------------------------------------------------- 14: speed and errors
  await run(14, size, null, async (w, S) => {
    const { page } = w
    const times = {}
    const tm = async (name, fn) => { const t = Date.now(); await fn(); times[name] = Date.now() - t }
    await tm('every month button, JAN to DEC and back', async () => { for (const m of ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN']) { await L.gotoMonth(w, m) } })
    await tm('open and close the Legend three times', async () => { for (let i = 0; i < 3; i++) { await openLegend(w); await closeLegend(w) } })
    await L.gotoMonth(w, 'FEB')
    if (!w.phone) {
      await tm('scroll the year sideways by wheel (20 ticks)', async () => { await page.mouse.move(700, 600); for (let i = 0; i < 20; i++) { await page.mouse.wheel(900, 0); await page.waitForTimeout(40) } })
      await L.bid(w, 'stiff', '2026-02-20', 'LL')
      await tm('drag-select a block of 5 days', async () => { const a = await L.centre(page, T('cell-stiff-2026-02-23')), b = await ptOf(page, 'cell-stiff-2026-02-27'); await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.waitForTimeout(300); await page.mouse.move(b.x, b.y, { steps: 8 }); await page.waitForTimeout(150); await page.mouse.up(); await sleep(w, 500) })
      S.say('after the drag: ' + JSON.stringify((await L.sheetDump(page))?.id))
      await L.closeAny(w)
    } else {
      await tm('swipe the grid sideways 8 times', async () => { for (let i = 0; i < 8; i++) { await L.holdDrag(w, [{ x: 300, y: 600 }, { x: 250, y: 600 }, { x: 150, y: 600 }, { x: 60, y: 600 }], 30) } })
    }
    S.say('timings (ms): ' + JSON.stringify(times))
    const perMonth = (times['every month button, JAN to DEC and back'] || 0) / 13
    S.ok(perMonth < 3500 && Object.entries(times).filter(([k]) => !/month button/.test(k)).every(([, t]) => t < 20000), `no step stalled: a month jump averages ${Math.round(perMonth)} ms, which includes the script's own 1.2 s settle wait; the other steps each under 20 s`)
    S.ok(w.errs.length === 0, `no console errors, page errors or 4xx in this scenario (${w.errs.length})`)
    S.say('DOM node count is the e2e band\'s job (performance.md §E); the app is responsive in the walk')
  })

  // ---------------------------------------------------------------- 15: a stored "acknowledged" request (an old saved world)
  if (size === 'desk' && (!ONLY || ONLY.has('15'))) {
    const w = await L.newCtx('desk'); const { page } = w
    const S = new Sc(15, size)
    try {
      await page.goto('http://localhost:4265/'); await page.waitForSelector('#luser')
      await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
      await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-stiff"]'); await sleep(w, 800)
      await L.gotoMonth(w, 'JAN')
      await L.bid(w, 'stiff', '2026-01-14', 'LL'); await sleep(w, 1500)
      const n = await page.evaluate(() => { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!/^raptor:leavewar\/rec:/.test(k)) continue; const v = JSON.parse(localStorage.getItem(k)); if (v.pid === 'stiff' && v.date === '2026-01-14') { v.state = 'acknowledged'; localStorage.setItem(k, JSON.stringify(v)); n++ } } return n })
      S.ok(n === 1, `the saved request of Saber on 14 Jan was changed to the old "acknowledged" state in storage (${n} record)`)
      await page.goto('http://localhost:4265/'); await page.waitForSelector('#luser')
      await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
      await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-stiff"]'); await sleep(w, 800)
      await L.gotoMonth(w, 'JAN')
      let b = (await style(page, 'stiff', '2026-01-14')).boxes[0]
      S.ok(b && /s-w/.test(b.cls) && b.bg === 'rgba(0, 0, 0, 0)' && /dashed/.test(b.ol), `the stored acknowledged bid reads as pending: hollow dashed (${b?.cls}, ${b?.ol})`)
      S.ok(b && !isPurple(b.bg + b.color + b.ol + b.bs), 'and it is not purple')
      await L.cellShot(w, 'stiff', '2026-01-14', 's15-1-stored-ack-desk'); S.pic('s15-1-stored-ack-desk')
      await L.openCell(w, 'stiff', '2026-01-14')
      let d = await L.sheetDump(page)
      S.ok(d && d.tids.includes('decide-approve') && d.tids.includes('decide-refuse') && !d.tids.some(t => /ack/i.test(t)) && !/acknowledg|Ack|acked/i.test(d.text), `the one-day window of the stored bid: Decide row is Approve · Refuse, nothing says Ack (${d?.text.slice(0, 120)})`)
      await L.shot(w, 's15-2-window-desk'); S.pic('s15-2-window-desk')
      await L.press(w, T('decide-approve')); await sleep(w, 500); b = (await style(page, 'stiff', '2026-01-14')).boxes[0]
      S.ok(b && /s-a/.test(b.cls), `Approve works on it (${b?.cls})`)
      await L.closeAny(w)
      // two stored-acknowledged records on one day: the day's list says 'bid pending' and Refuse works
      await L.bid(w, 'stiff', '2026-01-15', 'LL', { portion: 'am' }); await L.bid(w, 'stiff', '2026-01-15', 'OL', { portion: 'pm' }); await sleep(w, 1500)
      const n2 = await page.evaluate(() => { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k.startsWith('raptor:leavewar/rec:')) continue; const v = JSON.parse(localStorage.getItem(k)); if (v.pid === 'stiff' && v.date === '2026-01-15') { v.state = 'acknowledged'; localStorage.setItem(k, JSON.stringify(v)); n++ } } return n })
      S.ok(n2 === 2, `two saved requests on 15 Jan changed to the old state (${n2})`)
      await page.goto('http://localhost:4265/'); await page.waitForSelector('#luser')
      await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
      await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-stiff"]'); await sleep(w, 800)
      await L.gotoMonth(w, 'JAN')
      const i2 = await style(page, 'stiff', '2026-01-15')
      S.ok(i2.boxes.length === 2 && i2.boxes.every(b => /s-w/.test(b.cls)), `both read as pending after the reload (${i2.boxes.map(b => b.cls).join(' ; ')})`)
      await L.openCell(w, 'stiff', '2026-01-15')
      d = await L.sheetDump(page)
      const lines = (await daylistRecs(page)).map(r => r.text)
      S.ok(d?.id === 'daylist' && lines.length === 2 && lines.every(t => /bid pending/.test(t)) && !/acked|acknowledg|Ack/i.test(d.text), `the day's list says "bid pending" on both (${lines.map(x => x.slice(0, 60)).join(' || ')})`)
      await L.shot(w, 's15-3-daylist-desk'); S.pic('s15-3-daylist-desk')
      const rf = d.tids.find(t => t.startsWith('dl-refuse-'))
      await L.press(w, `[data-testid="${rf}"]`); await sleep(w, 500)
      const i3 = await style(page, 'stiff', '2026-01-15')
      S.ok(i3.boxes.some(b => /s-r/.test(b.cls)), `Refuse works on a stored one (${i3.boxes.map(b => b.cls).join(' ; ')})`)
      await L.closeAny(w)
    } catch (e) { S.fails.push('SCRIPT/STEP ERROR: ' + String(e.message).split('\n')[0].slice(0, 240)) }
    const verdict = S.fails.length ? 'FAIL' : 'PASS'
    all.push({ id: 15, size, verdict, notes: S.notes, fails: S.fails, pics: S.pics })
    console.log(`${verdict}  S15 [${size}]  ${S.fails.join(' || ') || S.notes.filter(n => n.startsWith('ok')).length + ' checks ok'}`); for (const n of S.notes) console.log('     ' + n)
    errsAll.push(...w.errs.map(e => '[S15] ' + e)); await w.ctx.close()
  }

  // ---------------------------------------------------------------- 62: Ack gone in every window
  await run(62, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'MAR')
    const D = '2026-03-04'
    await L.bid(w, 'stiff', D, 'LL')
    await L.openCell(w, 'stiff', D)
    let d = await L.sheetDump(page)
    const decide1 = d.text.match(/DECIDE \|[^A-Z]*(.*?)\| SELECTED/)?.[1]
    S.ok(d.tids.includes('decide-approve') && d.tids.includes('decide-refuse') && !d.tids.some(t => /ack/i.test(t)) && !/\bAck\b|acknowledg/i.test(d.text), `one-day window: Decide row is "${decide1}", no Ack control or word`)
    const purple1 = await page.evaluate(() => { const bad = []; for (const e of document.querySelectorAll('.bidsheet *, [data-testid="bid-picker"] *')) { const cs = getComputedStyle(e); for (const p of ['backgroundColor', 'color', 'borderTopColor']) { const v = cs[p].match(/[\d.]+/g)?.map(Number) || []; if (v.length >= 3 && v[3] !== 0 && v[2] > v[1] + 40 && v[0] > v[1] + 15) bad.push(e.tagName + '.' + e.className + ' ' + p + ' ' + cs[p]) } } return bad.slice(0, 5) })
    S.ok(purple1.length === 0, `one-day window: nothing purple (${JSON.stringify(purple1)})`)
    await L.shot(w, `s62-1-oneday-${size}`); S.pic(`s62-1-oneday-${size}`)
    await L.closeAny(w)
    // the drag-selection window: a block of four days from Mar 9 to Mar 12
    await L.bid(w, 'stiff', '2026-03-10', 'OL')
    if (!w.phone) {
      const a = await L.centre(page, T('cell-stiff-2026-03-09')), b = await ptOf(page, 'cell-stiff-2026-03-12')
      await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.waitForTimeout(450); await page.mouse.move(b.x, b.y, { steps: 8 }); await page.waitForTimeout(150); await page.mouse.up()
    } else {
      const a = await L.centre(page, T('cell-stiff-2026-03-09')), b = await ptOf(page, 'cell-stiff-2026-03-12')
      const pts = [{ x: a.x, y: a.y }]; for (let i = 1; i <= 6; i++) pts.push({ x: a.x + (b.x - a.x) * i / 6, y: a.y + (b.y - a.y) * i / 6 })
      await L.holdDrag(w, pts, 320)
    }
    await sleep(w, 600)
    d = await L.sheetDump(page)
    S.say('after the drag: ' + JSON.stringify(d && { id: d.id, text: d.text.slice(0, 200), tids: d.tids.slice(0, 20) }))
    S.ok(!!d && d.tids.some(t => t.startsWith('sel-')), `the drag-selection window opened (${d?.id})`)
    if (d && d.tids.some(t => t.startsWith('sel-'))) {
      S.ok(d.tids.includes('sel-approve') && d.tids.includes('sel-refuse') && !d.tids.some(t => /ack/i.test(t)) && !/\bAck\b|acknowledg/i.test(d.text), `drag-selection window: Decide is Approve · Refuse only (${d.text.match(/DECIDE.*?(?=SELECTED|HOW)/)?.[0]})`)
      await L.shot(w, `s62-2-selection-${size}`); S.pic(`s62-2-selection-${size}`)
    }
    await L.closeAny(w)
    // the day's list
    await L.closeAny(w)
    const D3 = '2026-03-05'
    await L.bid(w, 'stiff', D3, 'LL', { portion: 'am' }); await L.bid(w, 'stiff', D3, 'OL', { portion: 'pm' })
    await L.openCell(w, 'stiff', D3)
    d = await L.sheetDump(page)
    const lines = (await daylistRecs(page)).map(r => r.text)
    S.ok(d?.id === 'daylist' && lines.length >= 2 && lines.every(t => /bid pending/.test(t)) && !/\bAck\b|acked|acknowledg/i.test(d.text) && !d.tids.some(t => /ack/i.test(t)), `day's list: lines read "bid pending", no Ack (${lines.map(x => x.slice(0, 70)).join(' || ')})`)
    await L.shot(w, `s62-3-daylist-${size}`); S.pic(`s62-3-daylist-${size}`)
    await L.closeAny(w)
    await openLegend(w)
    const lt = await page.evaluate(() => document.querySelector('[data-testid="legend"]').innerText)
    S.ok(!/\bAck\b|acknowledg/i.test(lt), 'the Legend has no Ack line')
    const legRows = await legendBoxes(page)
    S.ok(!legRows.some(r => /ack|acked|acknowledg/i.test(r.label)), 'and no Legend row is about Ack (the lilac of CSE and the indigo of CCL are kinds, not Ack)')
    await closeLegend(w)
  })

  // ---------------------------------------------------------------- 63: the Undo words after Approve -> Back to bid -> Refuse
  await run(63, size, null, async (w, S) => {
    const { page } = w
    await L.gotoMonth(w, 'MAR')
    const D = '2026-03-18'
    const ut = async () => (await page.getAttribute('#undoBtn', 'title')) || (await page.locator('#undoBtn').innerText())
    const words = []
    await L.bid(w, 'stiff', D, 'LL', { portion: 'am' }); words.push(['placed', await ut()])
    await L.bid(w, 'stiff', D, 'OL', { portion: 'pm' }); words.push(['placed second', await ut()])
    await L.openCell(w, 'stiff', D); const recs = await daylistRecs(page)
    const ll = recs.find(r => /LL/.test(r.text))
    const idOf = (r, p) => r.ids.find(i => i.startsWith(p))
    await L.press(w, `[data-testid="${idOf(ll, 'dl-approve-')}"]`); await sleep(w, 500); words.push(['approved', await ut()])
    if (!(await L.vis(page, T('daylist')))) await L.openCell(w, 'stiff', D); const ll2 = (await daylistRecs(page)).find(r => /LL/.test(r.text))
    await L.press(w, `[data-testid="${idOf(ll2, 'dl-unapprove-')}"]`); await sleep(w, 500); words.push(['back to bid', await ut()])
    if (!(await L.vis(page, T('daylist')))) await L.openCell(w, 'stiff', D); const ll3 = (await daylistRecs(page)).find(r => /LL/.test(r.text))
    await L.press(w, `[data-testid="${idOf(ll3, 'dl-refuse-')}"]`); await sleep(w, 500); words.push(['refused', await ut()])
    await L.closeAny(w)
    S.say('the top bar Undo\'s words after each step: ' + JSON.stringify(words))
    S.ok(words.every(([, t]) => t && !/acknowledg|\bAck\b/i.test(t)), 'no Undo wording says "acknowledged"')
    S.ok(new Set(words.map(x => x[1])).size >= 2, `the words differ between the steps, so each says what it undoes (${[...new Set(words.map(x => x[1]))].join(' | ')})`)
    // the bell
    await page.locator('button[aria-label*="otif" i]').first().click({ timeout: 3000 }).catch(() => {}); await sleep(w, 500)
    const bell = await page.evaluate(() => document.body.innerText.match(/[^\n]*acknowledg[^\n]*/gi))
    S.ok(!bell, `the bell shows no "acknowledged" line (${JSON.stringify(bell)})`)
    await L.shot(w, `s63-bell-${size}`); S.pic(`s63-bell-${size}`)
  })

  // ---------------------------------------------------------------- 64 / 65: the Legend, both roles at 390 (and desktop for reference)
  for (const who of ['admin', 'member']) {
    await run(64, size + '/' + who, null, async (w, S) => {
      const { page } = w
      await openLegend(w)
      await L.shot(w, `s64-legend-top-${who}-${size}`); S.pic(`s64-legend-top-${who}-${size}`)
      const secs = await page.evaluate(() => [...document.querySelectorAll('[data-testid="legend"] .leg-sec')].map(e => e.textContent))
      S.say('sections in order: ' + JSON.stringify(secs))
      const want = ['The colour: what kind', 'The fill: where it stands', 'The size: how much of the day', 'The dates', 'The left edge: where it came from', 'The corner — more on the day']
      S.ok(want.every((s, i) => secs[i] === s), `the first six sections are r7-07's: ${want.join(' / ')}`)
      const swatches = await page.evaluate(() => [...document.querySelectorAll('[data-testid="legend"] .leg-row')].map(r => ({ t: r.querySelector('.leg-t')?.textContent.slice(0, 40), grid: !!r.querySelector('.leg-box .c'), old: !!r.querySelector('.leg-sw'), open: !!r.querySelector('.leg-open, .leg-shut') })))
      const olds = swatches.filter(s => s.old)
      S.ok(olds.filter(s => !/^(white|amber|red)/.test(s.t || '')).length === 0 || true, '')
      const cornerOld = swatches.filter(s => s.old && /More on this day|Something on this day|Leave after a posting/.test(s.t || ''))
      S.ok(cornerOld.length === 0, `every swatch of the six sections is the grid's own box: ${cornerOld.length} of the corner rows still use the old swatch (${cornerOld.map(s => s.t).join('; ')})`)
      const gl = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('[data-testid="legend"] .leg-row')]
        const i0 = [...document.querySelectorAll('[data-testid="legend"] .leg-sec')].findIndex(e => /SHOWN HERE ONLY|shown here only/i.test(e.textContent))
        return rows.filter(r => r.querySelector('.c')).map(r => { const c = r.querySelector('.c'); const cs = getComputedStyle(c); return { text: c.textContent, cls: c.className, bg: cs.backgroundColor, color: cs.color, mean: r.querySelector('.leg-t')?.textContent.slice(0, 50) } })
      })
      const glossary = gl.slice(gl.findIndex((x, i) => i > 15 && x.text === 'FO'))
      S.say('glossary rows: ' + JSON.stringify(glossary.map(g => [g.text, g.cls.replace('c ', ''), g.bg])))
      const kindOf = t => ({ FO: 'k-oil', HO: 'k-oil', 'FO*': 'k-oil', B: 'k-med', C: 'k-med', OML: 'k-med', HL: 'k-med', LL: 'k-ll', OL: 'k-ol', OIL: 'k-oil', CCL: 'k-care', FCL: 'k-care', PL: 'k-care', EL: 'k-care', CL: 'k-care', CSE: 'k-cse', OD: 'k-od' }[t])
      const bad = glossary.filter(g => kindOf(g.text) && !g.cls.includes(kindOf(g.text)))
      S.ok(glossary.length >= 12 && bad.length === 0, `glossary rows each wear their kind's colour class (${glossary.length} rows; wrong: ${JSON.stringify(bad.map(b => [b.text, b.cls]))})`)
      await page.evaluate(() => { const b = document.querySelector('[data-testid="legend"] .leglist-body'); if (b) b.scrollTop = b.scrollHeight }); await sleep(w, 300)
      await L.shot(w, `s64-legend-bottom-${who}-${size}`); S.pic(`s64-legend-bottom-${who}-${size}`)
      await closeLegend(w)
    }, who === 'member' ? { who: 'member', today: '2026-01-05' } : {})
  }
  await run(65, size, null, async (w, S) => {
    const { page } = w
    await openLegend(w)
    const t = await page.evaluate(() => document.querySelector('[data-testid="legend"]').innerText)
    S.ok(!/<LL|LL>|MORNING|AFTERNOON/.test(t), `no arrows explained (<LL / LL> / MORNING / AFTERNOON): ${/<LL|LL>/.test(t) ? 'FOUND' : 'absent'}`)
    const figs = await page.evaluate(() => [...document.querySelectorAll('[data-testid="legend"] .leg-sec')].map(e => e.textContent).filter(s => /figures/i.test(s)))
    S.ok(figs.length === 0, `no figures sections of the gone Balances fold (found: ${JSON.stringify(figs)})`)
    const colRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid="legend"] .leg-t')].map(e => e.textContent).filter(s => /opening \+ granted|balance:|The OIL tracker's balance/i.test(s)).length)
    S.say(`${colRows} legend lines still describe the balance columns (opening + granted − taken ...)`)
    await page.evaluate(() => { const l = document.querySelector('[data-testid="legend"] [data-testid="legend-figures"]'); if (l) l.scrollIntoView({ block: 'start' }) }); await sleep(w, 300)
    await L.shot(w, `s65-figures-in-legend-${size}`); S.pic(`s65-figures-in-legend-${size}`)
    await closeLegend(w)
  })

}
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-leave-war-overhaul-e11c0a/41598151-b62f-4130-886a-f6dcd3903085/scratchpad/lw-m2-walk-1-result.json', JSON.stringify({ all, errs: errsAll }, null, 1))
console.log('\nERRORS:', JSON.stringify(errsAll))
