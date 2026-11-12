/* rcsb-w1-common v1 — W1's shared readers for the OIL-across-a-Logic-change walk (13 Nov 26).
   Import AFTER HP_URL / HP_SHOTS are set. It never writes anywhere but HP_SHOTS. */
const R = await import('../rcsb-lib.mjs')
export { R }
export const { X, L, sleep, row } = R
export const W4 = X.W4
export const j = o => JSON.stringify(o)
export const clean = s => String(s || '').replace(/[\s ]+/g, ' ').trim()

/* a flying line on Saturday/Sunday: take-off, landing, Ranger in the front seat; returns what the formation holds */
export async function build(w, di, to, ld, who) {
  await L.board(w.page, di)
  const g = await X.addWave(w, di, '')
  await X.typeIn(w, `[data-bfld="ff:${di}.${g}.0.to"]`, to); await X.typeIn(w, `[data-bfld="ff:${di}.${g}.0.ld"]`, ld)
  const s = await X.seatPhoneAware(w, `[data-slot="${di}.${g}.0.0.p"]`, who)
  const f = await w.page.evaluate(([d, gi]) => { const f = window.DAYS[d].waves[gi].formations[0]; return `to ${f.to} ld ${f.ld} p=${f.aircraft[0].p}` }, [di, g])
  return { gi: g, seat: s, f }
}
/* publish what the board is on (Publish day, or Publish ALn once published); close the board; return the head */
export async function publish(w, di) {
  const sp = await X.signAndPublish(w, di)
  await L.closeBoard(w.page)
  await L.go(w.page, 'editsched'); await sleep(600)
  const head = await L.head(w.page, di)
  return { pressed: sp.p, head }
}
/* the day's sign-off block as the edit week draws it */
export async function dayCard(page, di) {
  return page.evaluate(i => {
    const d = document.querySelector(`#eWeek .day[data-day="${i}"]`)
    const sl = d.querySelector('.signedln')
    const st = d.querySelector('.so-state')
    return { signedLine: sl && sl.offsetWidth ? sl.innerText.replace(/\s+/g, ' ').trim() : '(no signed line)', soState: st ? st.innerText.replace(/\s+/g, ' ').trim() : '(none)',
      nys: !!d.querySelector('.nysmark') && !!d.querySelector('.nysmark').offsetWidth, nysText: (d.querySelector('.nysmark') || {}).innerText || '' }
  }, di)
}
/* the pending / changes button: press it, read the window it opens, picture it, close it */
export async function pendingList(w, di, picName) {
  const page = w.page
  const b = page.locator(`#eWeek .day[data-day="${di}"] .dpend:visible`).first()
  if (!(await b.count())) return { label: '(no pending/changes button)', text: '' }
  const label = clean(await b.innerText())
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  if (w.phone) await b.tap(); else await b.click()
  await sleep(800)
  const win = page.locator('.chgwin:visible').first()
  const text = (await win.count()) ? clean(await win.innerText()) : '(no window opened)'
  if (picName) await R.shot(page, picName)
  const x = page.locator('.chgwin:visible [data-chgx], .chgwin:visible .wx, .chgwin:visible button[aria-label*="lose" i]').first()
  if (await x.count()) { if (w.phone) await x.tap(); else await x.click() } else await page.keyboard.press('Escape')
  await sleep(500)
  if (await page.locator('.chgwin:visible').count()) { await page.keyboard.press('Escape'); await sleep(400) }
  return { label, text, closed: !(await page.locator('.chgwin:visible').count()) }
}
/* the Leave War grid box for a man on a date, its picture, the window a tap opens (text, picture), closed after */
export async function lwGrid(w, id, iso, tag) {
  const page = w.page
  await W4.lwOpen(page, iso)
  const lb = await W4.lwCell(page, id, iso)
  await W4.lwShot(page, tag + '-lw-grid', id, iso)
  const t = await W4.lwTap(page, id, iso)
  const win = await page.evaluate(() => { const b = document.querySelector('[data-testid="bid-picker"]') || document.querySelector('[data-testid="daylist-sheet"]'); return b ? b.innerText.replace(/\s+/g, ' ').trim() : '(no window)' })
  await page.screenshot({ path: `${R.SHOTS}/${tag}-lw-window.png` })
  await W4.lwCloseSheet(page)
  return { box: lb.box, title: lb.title, cls: lb.cls, tapOpened: t.opened, win }
}
/* the OIL tracker's row, the Balances page's OIL figure (picture its row) — and back to the grid tab */
export async function lwOther(w, id, iso, tag) {
  const page = w.page
  const trk = await W4.lwTracker(page, id, tag + '-lw-tracker')
  await page.locator('[data-testid="lw-tab-balances"]').click(); await sleep(900)
  const fig = await page.evaluate(p => { const e = document.querySelector(`[data-testid="bal-oil-${p}"]`); const r = document.querySelector(`[data-testid="bal-row-${p}"]`); return { oil: e ? e.innerText.replace(/\s+/g, ' ').trim() : 'NO FIGURE', row: r ? r.innerText.replace(/\s+/g, ' ').trim() : '' } }, id)
  const r = page.locator(`[data-testid="bal-row-${id}"]`).first()
  if (await r.count()) { await r.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300) }
  await page.screenshot({ path: `${R.SHOTS}/${tag}-lw-balances.png` })
  await page.locator('[data-testid="lw-tab-grid"]').click(); await sleep(700)
  return { tracker: trk.bal, trackerText: (trk.text || '').slice(0, 300), balOil: fig.oil, balRow: fig.row }
}
/* the board's OIL Earn on a day: what it shows on a man's seat, and anything near it about issue status; board left closed */
export async function boardOil(w, di, id, tag) {
  const page = w.page
  await L.board(page, di)
  const sel = '#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible'
  const tapOil = async () => { const b = page.locator(sel).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); if (w.phone) await b.tap(); else await b.click(); await sleep(800) }
  const cs = w.CS[id]
  await tapOil()
  const seat = await page.evaluate(c => [...document.querySelectorAll('#schedBoard .seat.oilpk, #schedBoard .puck.oilbar, #schedBoard .oilitem')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.includes(c)).slice(0, 4), cs)
  const near = await page.evaluate(() => {
    const sc = document.querySelector('#schedBoard')
    const els = [...sc.querySelectorAll('*')].filter(e => e.offsetWidth && /oil/i.test(String(e.className) + ' ' + (e.id || '')) && !/^(svg|path)$/i.test(e.tagName))
    const out = new Set()
    for (const e of els) { const t = e.innerText ? e.innerText.replace(/\s+/g, ' ').trim() : ''; if (t && t.length < 220) out.add((e.className || e.id || e.tagName).toString().slice(0, 30) + ' :: ' + t) }
    return [...out].slice(0, 25)
  })
  const titleOfSeat = await page.evaluate(c => [...document.querySelectorAll('#schedBoard .seat.oilpk, #schedBoard .puck.oilbar, #schedBoard .oilitem')].filter(e => e.offsetWidth && e.innerText.includes(c)).map(e => e.title).filter(Boolean).slice(0, 3), cs)
  await R.shot(page, tag + '-board-oilearn')
  const head = await L.head(page, di)
  await tapOil()
  await L.closeBoard(page)
  return { seat, titleOfSeat, near, headPending: head && head.pending, nys: head && head.nys }
}
/* View-only Sched's face of a day */
export async function viewFace(w, di, tag) {
  const page = w.page
  await L.go(page, 'viewsched'); await sleep(600)
  const text = await page.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); return d ? d.innerText.replace(/\s+/g, ' ').trim().slice(0, 520) : 'NO DAY' }, di)
  await X.pic(page, tag + '-view-head', `#vWeek .day[data-day="${di}"] .day-head`)
  return text
}
/* a look at the Original through the day's version menu; back to the live working copy afterwards */
export async function lookOriginal(w, di, tag) {
  const page = w.page
  await L.go(page, 'editsched'); await sleep(500)
  const ok = await L.lookAt(page, di, /Original/)
  await sleep(700)
  const head = await L.head(page, di)
  const card = await page.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const ft = [...d.querySelectorAll('[data-bfld],.fcell,.ffrow,tr')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /\d\d:\d\d/.test(t)).slice(0, 4); return ft }, di)
  await X.pic(page, tag + '-look-original', `#eWeek .day[data-day="${di}"] .day-head`)
  // back to the live copy
  await L.planMenuItems(page, di)
  const back = await L.menuLive(page)
  await sleep(500)
  if (!back) await L.menuClose(page)
  const head2 = await L.head(page, di)
  return { ok, headLook: head && { tag: head.tag, selector: head.selector, pending: head.pending }, rows: card, backOk: back, headBack: head2 && { selector: head2.selector, pending: head2.pending } }
}
/* every place at one moment (PC). Returns an object of strings; prints it. */
export async function readAll(w, di, id, tag, { skipExtras = false } = {}) {
  const page = w.page
  const iso = X.ISO[di]
  const out = { tag }
  await L.go(page, 'editsched'); await sleep(500)
  out.head = await L.head(page, di)
  out.card = await dayCard(page, di)
  await X.pic(page, tag + '-edit-head', `#eWeek .day[data-day="${di}"] .day-head`)
  await X.pic(page, tag + '-edit-signoff', `#eWeek .day[data-day="${di}"] .signoff`)
  out.pending = await pendingList(w, di, tag + '-edit-pendinglist')
  out.grid = await lwGrid(w, id, iso, tag)
  out.person = await X.lwOil(w, id, iso, tag + '-lw-person')
  const o = await lwOther(w, id, iso, tag)
  out.tracker = o.tracker; out.trackerText = o.trackerText; out.balOil = o.balOil; out.balRow = o.balRow
  out.board = await boardOil(w, di, id, tag)
  out.view = await viewFace(w, di, tag)
  if (!skipExtras) out.look = await lookOriginal(w, di, tag)
  console.log(tag, j(out))
  return out
}
