// Walker a — A8: the long line on his iPhone (Chromium 402, WebKit 402) and the desktop; each row's boxes measured.
// Run: node scripts/handpass/wr4-a-a8.mjs [run] [chromium,webkit]
import { setup } from './wr4-a-common.mjs'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
console.log('wr4-a-a8 v1')
const RUN = process.argv[2] || 'a8-r1'
const ONLY = (process.argv[3] || '').split(',').filter(Boolean)
const { L, A } = await setup(RUN)
const { TMP } = await import('./wr4-a-common.mjs')
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, press, sleep, shot, boxOf, NEW_DIR, RANGER, HEX } = L
const c = 'A8'
const LONG = 'Advanced range safety procedures brief 1'   // 40 letters
const day = (w, iso) => press(w, `#inpEdCal [data-iso="${iso}"]`)
const T = (title) => ({ type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title, remarks: 'Bring your kit' })
async function build(w) {
  log(c, 'LONG has ' + LONG.length + ' letters')
  const m = {}
  m.a = await fileInput(w, c, '2026-07-15', T('Training'))
  m.c = await fileInput(w, c, '2026-07-13', T('Training'))
  m.long = await fileInput(w, c, '2026-07-29', T('Training'))
  for (const [i, iso] of ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24'].entries()) await fileInput(w, c, iso, T('Filler ' + (i + 1)))
  const ed = async (k, iso, fn) => { if (!m[k]) { A.judge(c, k + ' fixture', false, 'not filed'); return } await editInput(w, c, m[k], iso, fn); log(c, `${k} after ${JSON.stringify(await recOf(w.page, m[k]))}`) }
  await ed('a', '2026-07-15', async () => { await day(w, '2026-07-16'); await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief'); await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water') })
  await ed('c', '2026-07-13', async () => {
    await day(w, '2026-07-16'); await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range talk'); await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water')
    const x = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp]')].map(b => b.getAttribute('data-pp')).filter(id => !['bane', 'rocky', 'stiff'].includes(id) && !/9$/.test(id)))
    await press(w, `#inpEditPop [data-pp="${x[0]}"]`)
  })
  await ed('long', '2026-07-29', async () => {
    await day(w, '2026-07-30')
    if (!(await w.page.locator('#inpEdCal [data-iso="2026-08-03"]').count())) await press(w, '#inpEdCal button[aria-label="Next month"]')
    await day(w, '2026-08-03')
    await w.page.fill('#inpEditPop #inpEditOwnTitle', LONG); await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water and a hat')
    await w.page.fill('#inpEditPop #inpEditStart', '08:00')
  })
}
/* every row's boxes: line 2 against the age and the dot; anything cut; sideways scroll; the foot covered */
const measure = page => page.evaluate(() => {
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } }
  const hit = (a, b) => a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
  const rows = [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(l => {
    const what = l.querySelector('.bl-what'), name = l.querySelector('.bl-name'), ago = l.querySelector('.bl-ago'), dot = l.querySelector('.bl-dot'), dy = l.querySelector('.bl-day')
    const cs = what && getComputedStyle(what), lh = cs ? (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.35) : 0
    const W = R(what), A = R(ago), D = R(dot), N = R(name), Y = R(dy), Lb = R(l)
    return { what: (what?.textContent || '').replace(/\s+/g, ' ').trim(), lines: W ? Math.round(W.h / lh) : null, whatBox: W, ago: A, dot: D, line: Lb,
      cut: !!what && (what.scrollWidth > what.clientWidth + 1 || /…/.test(what.textContent || '')), nameCut: !!name && name.scrollWidth > name.clientWidth + 1,
      agoOverWhat: hit(A, W), agoOverName: hit(A, N), agoOverDay: hit(A, Y), dotOverWhat: hit(D, W), whatInsideLine: !!(W && Lb && W.l >= Lb.l && W.r <= Lb.r + 1) }
  })
  const sc = document.querySelector('[data-testid="bell-list"] .bl-scroll') || document.querySelector('[data-testid="bell-list"]')
  const foot = document.querySelector('[data-testid="bell-list"] .bl-foot'), more = document.querySelector('[data-testid="bell-list"] .bl-more')
  const btn = [...document.querySelectorAll('[data-testid="bell-list"] button')].find(b => /Mark all read/.test(b.textContent || ''))
  const free = e => { if (!e) return null; const r = e.getBoundingClientRect(); if (r.width < 1) return 'not shown'; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (e === t || e.contains(t)) }
  return { rows, list: R(document.querySelector('[data-testid="bell-list"]')), pageSideways: document.scrollingElement.scrollWidth > innerWidth, listSideways: sc ? sc.scrollWidth > sc.clientWidth + 1 : null,
    scroller: sc ? { scrollH: sc.scrollHeight, clientH: sc.clientHeight, top: sc.scrollTop } : null,
    more: more ? { text: (more.textContent || '').trim(), free: free(more), box: R(more) } : null, markAll: btn ? { free: free(btn), box: R(btn) } : null, foot: R(foot), vw: innerWidth }
})
async function read(w, tag) {
  const lines = await L.openBell(w)
  const m = await measure(w.page)
  writeFileSync(join(TMP, `${RUN}-${tag}-measure.json`), JSON.stringify(m, null, 1))
  await shot(w.page, c, `A8-top-${tag}`, await L.bellClip(w.page), A.said(lines), w.size, { m })
  const a = m.rows.find(r => r.what === 'Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber')
  A.judge(c, `${tag}: A6(a)'s line 2 is two lines in its box, whole, "· Saber" shown`, !!a && a.lines === 2 && !a.cut && a.whatInsideLine, a && { lines: a.lines, box: a.whatBox, cut: a.cut })
  const cRow = m.rows.find(r => /and 2 more changes · Saber$/.test(r.what))
  A.judge(c, `${tag}: A6(c)'s line (RECORD) and its line count`, null, cRow ? { what: cRow.what, lines: cRow.lines, cut: cRow.cut } : 'none')
  const lg = m.rows.reduce((x, r) => (!x || (r.lines || 0) > (x.lines || 0) ? r : x), null)
  A.judge(c, `${tag}: the longest line (RECORD its line count)`, null, lg && { what: lg.what, lines: lg.lines })
  const longName = lines.find(l => l.name === LONG)
  A.judge(c, `${tag}: the 40-letter case (RECORD the whole line)`, null, longName ? `${longName.name} ${longName.day} / ${longName.what}` : A.said(lines).filter(s => /Jul 29|Jul 30|Aug/.test(s)))
  A.judge(c, `${tag}: nothing cut with "…" or clipped`, m.rows.length > 0 && m.rows.every(r => !r.cut && !r.nameCut && r.whatInsideLine), m.rows.filter(r => r.cut || r.nameCut || !r.whatInsideLine).map(r => r.what))
  A.judge(c, `${tag}: the age never overlaps the words; the dot clear of line 2`, m.rows.every(r => !r.agoOverWhat && !r.agoOverName && !r.agoOverDay && !r.dotOverWhat), m.rows.filter(r => r.agoOverWhat || r.agoOverName || r.agoOverDay || r.dotOverWhat).map(r => r.what))
  A.judge(c, `${tag}: no sideways scroll of the list or the page`, !m.pageSideways && !m.listSideways, { page: m.pageSideways, list: m.listSideways })
  A.judge(c, `${tag}: "Mark all read" not covered; the "↓ N more" foot (RECORD its words)`, !!m.markAll && m.markAll.free === true && (!m.more || m.more.free !== false), { markAll: m.markAll, more: m.more, scroller: m.scroller, rows: m.rows.length })
  // scroll the list to its foot with the wheel (desktop) or by its own scroller (phone, set directly — said in the report)
  if (m.scroller && m.scroller.scrollH > m.scroller.clientH) {
    if (w.tap) await w.page.evaluate(() => { const s = document.querySelector('[data-testid="bell-list"] .bl-scroll'); if (s) s.scrollTop = s.scrollHeight })
    else { const b = m.list; await w.page.mouse.move(b.l + b.w / 2, b.t + b.h / 2); await w.page.mouse.wheel(0, 2000) }
    await sleep(500)
    const m2 = await measure(w.page)
    A.judge(c, `${tag}: after scrolling the list to its foot — moved, foot read (RECORD)`, m2.scroller.top > 0 ? null : false, { top: m2.scroller.top, more: m2.more, markAll: m2.markAll })
    await shot(w.page, c, `A8-foot-${tag}`, await L.bellClip(w.page), 'the list scrolled to its foot', w.size, { m2 })
  } else A.judge(c, `${tag}: the list scrolls`, false, m.scroller)
  return lines
}
try {
  if (!ONLY.length || ONLY.includes('chromium')) {
    let w = await newPage('desk'); await signIn(w, 'ad')
    log(c, 'bundle ' + await bundleOf(w.page))
    await build(w)
    w = await handOver(w, 'phone', 'us'); await read(w, 'phone')
    w = await handOver(w, 'desk', 'us'); await read(w, 'desk')
    await w.ctx.close()
  }
  if (!ONLY.length || ONLY.includes('webkit')) {
    const w = await newPage('phone', undefined, NEW_DIR, 'webkit'); w.engine = 'webkit'
    await signIn(w, 'ad'); log(c, 'webkit bundle ' + await bundleOf(w.page))
    await build(w)
    await sleep(1200)
    await signIn(w, 'us'); await read(w, 'wk')
    await w.ctx.close()
  }
} catch (e) { L.facts.errors.push('A8: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
