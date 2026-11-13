/* d-lib v1 — the D2028 walk's shared helpers. Import AFTER HP_URL / HP_SHOTS are set (dynamic import).
   Reuses rcsb-lib / rcf-w1-lib for the world, sign-in, boards, seating, publishing, Logic. */
const R = await import('../rcsb/rcsb-lib.mjs')
export { R }
export const { X, L, sleep } = R
export const W4 = X.W4
export const SHOTS = process.env.HP_SHOTS
export const j = o => JSON.stringify(o)
export const clean = s => String(s || '').replace(/[\s\u00a0]+/g, ' ').trim()
export const ROWS = []
export function row(id, verdict, saw, pic = '') { ROWS.push({ id, verdict, saw, pic }); console.log(`ROW ${id} | ${verdict} | ${saw} | ${pic}`) }
export const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png` }).then(() => name + '.png')
export const ISO = X.ISO
export const FRI = 4, SAT = 5

export async function world(kind = 'pc', who = 'a') { return R.world(kind, { who }) }
export async function bundle(page) { return page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).map(s => s.split('/').pop()).join(',')) }

/** a tap on a touch world, a click otherwise, aimed at one element handle/locator */
export async function hit(w, loc) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  if (w.phone) await loc.tap(); else await loc.click()
}

/** Common Programme row: "+ Item", name, start, optional end. Returns its row index. */
export async function addCommon(w, di, name, str, end = null) {
  const page = w.page
  await L.board(page, di)
  const n0 = await page.evaluate(i => window.DAYS[i].allhands.length, di)
  await X.press(w, `[data-padd="${di}"]`)
  await page.waitForFunction(([i, n]) => window.DAYS[i].allhands.length === n + 1, [di, n0])
  await sleep(300)
  const ri = n0
  await X.typeIn(w, `[data-bfld="ap:${di}.${ri}.prog"]`, name)
  await X.typeIn(w, `[data-bfld="ap:${di}.${ri}.str"]`, str.replace(':', ''))
  if (end) await X.typeIn(w, `[data-bfld="ap:${di}.${ri}.end"]`, end.replace(':', ''))
  const got = await page.evaluate(([i, r]) => { const a = window.DAYS[i].allhands[r]; return [a.prog, a.str, a.end, a.who] }, [di, ri])
  return { ri, got }
}
/** Ground Programme row: "+ Item", name, times, optional man. */
export async function addGround(w, di, name, str, end, who = null) {
  const page = w.page
  await L.board(page, di)
  const n0 = await page.evaluate(i => window.DAYS[i].ground.length, di)
  await X.press(w, `[data-gradd="${di}"]`)
  await page.waitForFunction(([i, n]) => window.DAYS[i].ground.length === n + 1, [di, n0])
  await sleep(300)
  const ri = n0
  await X.typeIn(w, `[data-bfld="gr:${di}.${ri}.prog"]`, name)
  await X.typeIn(w, `[data-bfld="gr:${di}.${ri}.str"]`, str.replace(':', ''))
  await X.typeIn(w, `[data-bfld="gr:${di}.${ri}.end"]`, end.replace(':', ''))
  let seat = null
  if (who) seat = await X.seatPhoneAware(w, `[data-fill="g:${di}.${ri}.+"]`, who)
  const got = await page.evaluate(([i, r]) => { const a = window.DAYS[i].ground[r]; return [a.prog, a.str, a.end, a.who] }, [di, ri])
  return { ri, got, seat }
}
/** drop a puck (id) on a "+" fill zone (data-fill value) */
export async function drop(w, fill, id) {
  const hasFill = await w.page.locator(`#schedBoard [data-fill="${fill}"]:visible`).count()
  const sel = hasFill ? `[data-fill="${fill}"]` : `[data-slot="${fill}"]`
  const r = await X.seatPhoneAware(w, sel, id)
  return r
}

/** what the app holds about the day's signing / publishing, as the board draws it */
export async function boardHead(w, di) {
  await L.board(w.page, di)
  const h = await L.head(w.page, di)
  return h
}
/** sign four and publish (first publication or Publish ALn); closes the board */
export async function pub(w, di) {
  const sp = await X.signAndPublish(w, di)
  await L.closeBoard(w.page)
  await L.go(w.page, 'editsched'); await sleep(600)
  return { pressed: sp.p, head: await L.head(w.page, di) }
}
/** sign all four on the open board (the working copy's four sign-offs), no publishing */
export async function signFour(w, di) {
  await L.board(w.page, di)
  const sg = await L.signDay(w.page, di, 0)
  return { sg, head: await L.head(w.page, di) }
}

/** Surfaces where the ALL AVAIL count can be tapped: 'view' (View-only Sched), 'edit' (Edit Schedule's week), 'board' (the Scheduler Board) */
export async function toSurface(w, surf, di) {
  const page = w.page
  if (surf === 'view') { await L.go(page, 'viewsched'); await sleep(500) }
  else if (surf === 'edit') { if (await page.locator('#schedBoard').count()) await L.closeBoard(page); await L.go(page, 'editsched'); await sleep(500) }
  else if (surf === 'board') { await L.board(page, di) }
}
export const chipScope = (surf, di) => surf === 'view' ? `#vWeek .day[data-day="${di}"]` : surf === 'edit' ? `#eWeek .day[data-day="${di}"]` : `#schedBoard`

/** every ALL AVAIL count chip visible in the scope: its text and the row beside it */
export async function chips(w, surf, di) {
  return w.page.evaluate(sc => [...document.querySelectorAll(sc + ' .oilcount')].filter(e => e.offsetWidth).map((e, i) => {
    const r = e.closest('tr, .sb-arow, .arow, .row, .grow, .prow, li') || e.parentElement
    return { i, chip: e.innerText.replace(/[\s\u00a0]+/g, ' ').trim(), cls: String(e.className).slice(0, 60), row: (r ? r.innerText : '').replace(/[\s\u00a0]+/g, ' ').trim().slice(0, 90) }
  }), chipScope(surf, di))
}
/** open the window of chip n on a surface, read it (title + whole text + people), picture it; the window is LEFT OPEN (close it with closeAA) */
export async function openAA(w, surf, di, n = 0, tag = null) {
  const page = w.page
  const sel = chipScope(surf, di) + ' .oilcount:visible'
  const el = page.locator(sel).nth(n)
  if (!(await el.count())) return { ok: false, why: 'no chip ' + n + ' on ' + surf + ' day ' + di }
  await page.evaluate(() => { window.__seen = new WeakSet([...document.querySelectorAll('body *')]) })
  const chip = clean(await el.innerText())
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  const b = await el.boundingBox()
  if (w.phone) { await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(60); if (tag) await shot(page, tag + '-tap') ; await sleep(700) }
  else { await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(800) }
  const fw = await page.evaluate(() => {
    const f = [...document.querySelectorAll('body *')].filter(e => !window.__seen.has(e) && e.offsetWidth)
    const tops = f.filter(e => !f.includes(e.parentElement))
    return tops.map(e => ({ cls: String(e.className).slice(0, 50), text: e.innerText.replace(/[\s\u00a0]+/g, ' ').trim() }))
  })
  if (tag) await shot(page, tag)
  const winTxt = await page.evaluate(() => { const ws = [...document.querySelectorAll('.win-bar')].filter(e => e.offsetWidth); const e = ws[ws.length - 1] && ws[ws.length - 1].parentElement; return e ? e.innerText.replace(/[\s ]+/g, ' ').trim() : '' })
  const text = winTxt || fw.map(x => x.text).join(' || ')
  const m = /(\d\d:\d\d[–-]\d\d:\d\d)( · no end time, [^·|]*? assumed)?/.exec(text)
  return { ok: fw.length > 0, chip, title: m ? m[0].trim() : '(no title found)', text, fresh: fw.map(x => x.cls) }
}
export async function closeAA(w) {
  const page = w.page
  const xs = page.locator('button:visible', { hasText: /^✕$/ })
  const n = await xs.count()
  if (n) { const x = xs.last(); const b = await x.boundingBox(); if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(500) }
  else { await page.keyboard.press('Escape'); await sleep(500) }
}
/** read the window of the first/nth chip, then close it */
export async function readAA(w, surf, di, n, tag) {
  const o = await openAA(w, surf, di, n, tag)
  await closeAA(w)
  return o
}
/** the listed callsigns: pull every callsign of the roster that the window text names */
export async function names(w, text) {
  const cs = Object.values(w.CS).filter(c => c && !/^ALL/.test(c))
  return cs.filter(c => new RegExp('(^|[^A-Za-z])' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^A-Za-z]|$)').test(text))
}

/** Logic: one setting */
export const setLogic = (w, key, val, pic) => R.setLogic(w, key, val, pic)

/** the day's face right now: tag, pending, nys, selects */
export async function dayFace(w, di) {
  const page = w.page
  if (await page.locator('#schedBoard').count()) await L.closeBoard(page)
  await L.go(page, 'editsched'); await sleep(500)
  const head = await L.head(page, di)
  const card = await page.evaluate(i => {
    const d = document.querySelector(`#eWeek .day[data-day="${i}"]`)
    const q = s => { const e = d.querySelector(s); return e && e.offsetWidth ? e.innerText.replace(/[\s\u00a0]+/g, ' ').trim() : null }
    return { signedln: q('.signedln'), sostate: q('.so-state'), nys: q('.nysmark'), dpend: q('.dpend'), signoff: q('.signoff') }
  }, di)
  return { head, card }
}
export function finish(w, tag) { R.finish(w, tag) }

/** read the window of the chip whose row text matches rowRe (or the only chip) on a surface */
export async function readOne(w, surf, tag, di, rowRe = null) {
  await toSurface(w, surf, di)
  const c = await chips(w, surf, di)
  let idx = rowRe ? c.findIndex(x => rowRe.test(x.row)) : -1
  if (idx < 0 && c.length >= 1 && (!rowRe || c.length === 1)) idx = 0
  if (idx < 0) return { surf, why: 'NO CHIP matching ' + rowRe + ': ' + j(c) }
  const o = await readAA(w, surf, di, idx, `${tag}-${surf}`)
  const ns = await names(w, o.text)
  return { surf, chip: o.chip, title: o.title, count: ns.length, people: ns, ranger: ns.includes('Ranger'), chips: c.length, ok: o.ok }
}
/** the day's face + two pictures */
export async function face(w, tag, di) {
  const f = await dayFace(w, di)
  await X.pic(w.page, tag + '-edit-head', `#eWeek .day[data-day="${di}"] .day-head`)
  await X.pic(w.page, tag + '-edit-signoff', `#eWeek .day[data-day="${di}"] .signoff`)
  return { tag: f.head.tag, pending: f.head.pending, nys: f.head.nys, signs: f.head.signs, beak: f.head.beak && f.head.beak.text, alpub: f.head.alpub && f.head.alpub.text, soState: f.card.sostate, nysText: f.card.nys, signedln: f.card.signedln }
}
