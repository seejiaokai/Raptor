/* [INSIGHTS-WHICH-COPY] walker S — helpers on top of wh-b-lib (Insights window reading, doors, topmost test). */
import * as B from './wh-b-lib.mjs'
export * from './wh-b-lib.mjs'
export { B }
const { L, W } = B
export const sleep = ms => new Promise(r => setTimeout(r, ms))

/* the way in: desktop #insightBtn, phone ☰ drawer #drawerInsights. Returns what happened. */
export async function openIns(p) {
  if (await p.locator('#insightModal:not([hidden]) #insightBody').count()) return { how: 'already open' }
  const b = p.locator('#insightBtn:visible').first()
  if (await b.count()) {
    const hit = await b.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!x && (x === e || e.contains(x)) })
    if (!hit) return { how: 'desktop button present but COVERED', err: true }
    await b.click(); await sleep(500)
    return { how: 'desktop Insights button', ok: await p.locator('#insightBody').count() > 0 }
  }
  const bg = p.locator('#burger:visible').first()
  if (!(await bg.count())) return { how: 'no Insights button and no burger', err: true }
  await bg.click(); await sleep(400)
  const d = p.locator('#drawerInsights:visible').first()
  if (!(await d.count())) return { how: 'burger opened, no Week insights row', err: true }
  const hit = await d.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!x && (x === e || e.contains(x)) })
  await d.click(); await sleep(500)
  return { how: 'phone menu Week insights' + (hit ? '' : ' (covered at centre!)'), ok: await p.locator('#insightBody').count() > 0 }
}
export async function closeIns(p) {
  const x = p.locator('#insightClose:visible').first()
  if (await x.count()) { await x.click().catch(() => {}); await sleep(300) }
}
/* what the window says, as painted */
export async function readIns(p) {
  return p.evaluate(() => {
    const m = document.querySelector('#insightModal'); const b = document.querySelector('#insightBody')
    if (!b || !m || m.hidden) return { none: true }
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const tiles = [...b.querySelectorAll('.itile')].map(e => ({ n: t(e.querySelector('.n')), l: t(e.querySelector('.l')) }))
    const secs = {}; let cur = ''
    for (const e of b.children) {
      if (e.classList.contains('isec-h')) { cur = t(e); secs[cur] = [] }
      else if (e.classList.contains('ibar')) secs[cur].push(t(e.querySelector('.nm')) + '=' + t(e.querySelector('.v')))
      else if (e.classList.contains('irow')) secs[cur].push(t(e))
      else if (e.classList.contains('ichips')) secs[cur].push('chips:' + [...e.querySelectorAll('.ichip')].map(t).join(','))
      else if (cur && !e.classList.contains('itiles')) secs[cur].push('txt:' + t(e))
    }
    const r = m.querySelector('.modal-box').getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1)
    const hit = document.elementFromPoint(cx, cy)
    const bodyEl = b
    return { title: t(m.querySelector('.modal-head b')), tiles, secs,
      topmost: !!hit && m.contains(hit), centre: [Math.round(cx), Math.round(cy)],
      box: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) },
      ...(() => { let e = bodyEl; while (e && e !== document.body) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 2) return { scrolls: true, sh: e.scrollHeight, ch: e.clientHeight, scroller: e.className || e.id } ; e = e.parentElement } return { scrolls: false, sh: bodyEl.scrollHeight, ch: bodyEl.clientHeight, scroller: '' } })(),
      vw: innerWidth, vh: innerHeight,
      z: getComputedStyle(m).zIndex, page: window.CURPAGE }
  })
}
/* a compact one-line fingerprint of the whole window for comparisons */
export function fp(r) {
  if (!r || r.none) return '(no window)'
  return [r.title, r.tiles.map(x => x.n + ' ' + x.l).join(' | '), ...Object.entries(r.secs).map(([k, v]) => k + ': ' + v.join('; '))].join(' ## ')
}
/* the figures that matter in short */
export function brief(r) {
  if (!r || r.none) return '(no window)'
  const g = k => { const e = Object.entries(r.secs).find(([a]) => a.toLowerCase().startsWith(k.toLowerCase())); return e ? e[1] : [] }
  return `tiles [${r.tiles.map(x => x.n + ' ' + x.l).join(' | ')}] · flying load [${g('Flying load').join(', ')}] · hours [${g('Work hours').join(', ')}] · idle [${g('Not on').join(',').slice(0, 200)}] · types [${g('Conflicts').join('; ')}] · byday [${g('By day').join('; ')}]`
}
/* open → read → picture (viewport) → optionally the foot picture → close */
export async function look(p, name, { keep = false, foot = false } = {}) {
  const o = await openIns(p)
  const r = await readIns(p)
  r.how = o.how; r.openErr = !!o.err
  r.shot = await B.pic(p, name)
  if (foot && !process.env.HP_LITE) {
    await p.evaluate(() => { const rows = document.querySelectorAll('#insightBody .irow'); if (rows.length) rows[rows.length - 1].scrollIntoView({ block: 'end' }) }); await sleep(250)
    r.shot2 = await B.pic(p, name + '-foot')
  }
  if (!keep) await closeIns(p)
  return r
}
/* the day's own bar on a surface */
export async function dayBar(p, surf, di) {
  await B.openList(p, surf, di)
  const l = await B.readList(p, surf, di)
  return l
}

/* ---------- board gestures (the app's own controls) ---------- */
export async function board(p, di) { await W.boardOn(p, di); await sleep(200) }
export async function cx(p, di, key, reason = 'walk') {
  await board(p, di)
  const b = p.locator(`#schedBoard [data-lcx="${key}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await b.click(); await sleep(400)
  await p.waitForSelector('#cxPop:not([hidden])', { timeout: 4000 })
  await p.locator('#cxReason').fill(reason)
  await p.locator('#cxSave').click(); await sleep(600)
}
export async function uncx(p, di, key) {
  await board(p, di)
  const b = p.locator(`#schedBoard [data-lcx="${key}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await b.click(); await sleep(400)
  await p.waitForSelector('#cxPop:not([hidden])', { timeout: 4000 })
  await p.locator('#cxUn').click(); await sleep(600)
}
export async function setTime(p, di, key, v) { await board(p, di); await W.boardText(p, key, v) }
/* drag a seated puck off its seat into empty space (the board's own way of taking a man off) */
export async function takeOff(p, di, slot) {
  await board(p, di)
  const el = p.locator(`#schedBoard [data-slot="${slot}"] .puck`).first()
  if (!(await el.count())) return 'no puck on ' + slot
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  const box = await el.boundingBox()
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await p.mouse.down(); await sleep(200)
  for (let i = 1; i <= 8; i++) { await p.mouse.move(box.x + box.width / 2, Math.max(2, box.y + box.height / 2 - 30 * i)); await sleep(60) }
  await p.mouse.move(20, 300); await sleep(200)
  await p.mouse.up(); await sleep(900)
  return 'dragged off ' + slot
}
export async function seatHolder(p, slot) { return p.evaluate(k => { const d = window.DAYS[+k.split('.')[0]]; const [, gi, fi, ai, s] = k.split('.'); const a = d.waves[+gi].formations[+fi].aircraft[+ai]; return a[s] }, slot) }
