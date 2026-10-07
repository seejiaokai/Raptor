/* Walker A of the Codex-stack check (5 Oct 26) — shared helpers. Every fixture goes through the app's own controls;
   window.* is only read (bug-check order §7.7). */
import { world, reloadAs, pic, row, judge, savePart, TABLE, L, W, readList, openList, warnsOf, head } from './wh-lib.mjs'
import { tap, type, put } from './lib.mjs'
export { world, reloadAs, pic, row, judge, savePart, TABLE, L, W, readList, openList, warnsOf, head, tap, type, put }
export const sleep = ms => new Promise(r => setTimeout(r, ms))

/* ---- getting around ---- */
export async function toWeek(p) { await W.boardOff(p); if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched'); await sleep(300) }
export const toBoard = async (p, di) => { await W.boardOn(p, di) }
export const closeBoard = async p => { await W.boardOff(p) }

/* ---- reading ---- */
/* the pending marks on a day, the way the app holds them */
export const pendingKeys = (p, di) => p.evaluate(i => Object.keys(window.SCHED.pending || {}).filter(k => window.keyDay(k) === i), di)
export const orig = (p, di) => p.evaluate(i => !!(window.SCHED.orig || {})[i], di)
export const curVer = (p, di) => p.evaluate(i => window.dayCurVer(i), di)
export const alsOf = (p, di) => p.evaluate(i => window.SCHED.als.filter(a => a.di === i).map(a => a.id || ('AL' + a.seq)), di)
export async function discardControls(p) {
  return p.evaluate(() => {
    const all = [...document.querySelectorAll('button, [role=button], a')].filter(e => /discard\s+marks/i.test((e.textContent || '') + ' ' + (e.title || '') + ' ' + (e.getAttribute('aria-label') || '')))
    return { alDrop: document.querySelectorAll('#alDrop, [data-aldrop], [data-drop-marks]').length, textMatches: all.map(e => (e.textContent || e.title).slice(0, 40)), bodyHasPhrase: /discard\s+marks/i.test(document.body.textContent) }
  })
}
export async function alPanel(p) {
  return p.evaluate(() => { const a = document.querySelector('#alPanel'); return a ? { vis: a.offsetParent !== null, text: a.innerText.replace(/\s+/g, ' ').trim(), btns: [...a.querySelectorAll('button')].map(b => b.innerText.trim() + (b.disabled ? ' (locked)' : '')) } : null })
}
/* the day's own head (the week's day box) */
export const dayHead = (p, di) => W.head(p, di)
/* marks painted: the day's change chip(s) (.dpend), every element whose class carries chg / mark, as the screen draws them */
export async function marksPainted(p, scope, di) {
  return p.evaluate(([s, i]) => {
    const root = s === 'board' ? document.querySelector('#schedBoard') : document.querySelector('#eWeek .day[data-day="' + i + '"]')
    if (!root) return null
    const chips = [...root.querySelectorAll('.dpend')].filter(e => e.offsetParent !== null).map(e => e.innerText.replace(/\s+/g, ' ').trim())
    const cls = {}
    ;[...root.querySelectorAll('*')].forEach(e => { if (typeof e.className === 'string') e.className.split(/\s+/).filter(c => /chg|mark|amd|edited/i.test(c)).forEach(c => { cls[c] = (cls[c] || 0) + 1 }) })
    return { chips, cls }
  }, [scope, di])
}

/* ---- typing ---- */
export const weekText = (p, key, v) => W.weekText(p, key, v)
export const boardText = (p, key, v) => W.boardText(p, key, v)
/* read the text of a week / board box */
export async function readBox(p, key) {
  return p.evaluate(k => { const e = [...document.querySelectorAll(`[data-txt="${k}"],[data-bfld="${k}"]`)].find(x => x.offsetParent !== null); if (!e) return null; return e.value != null && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.innerText }, key)
}

/* ---- publishing ---- */
export async function publishNew(p, di) {
  await toBoard(p, di)
  const s = await W.signDay(p, di)
  const r = await W.publishDay(p, di)
  await sleep(500)
  return { s, r, head: await W.head(p, di) }
}
export async function publishAm(p, di) {
  await toBoard(p, di)
  const s = await W.signDay(p, di)
  const r = await W.publishAL(p, di)
  await sleep(500)
  return { s, r, head: await W.head(p, di) }
}

/* ---- insights ---- */
export async function openInsights(p) {
  const onBoard = await p.locator('#schedBoard:visible').count()
  const b = p.locator(onBoard ? '#sbInsights:visible' : '#insightBtn:visible').first()
  if (!(await b.count())) throw new Error('no Insights button')
  await b.click(); await p.waitForSelector('#insightBody', { state: 'visible', timeout: 8000 }); await sleep(400)
}
export async function readInsights(p) {
  return p.evaluate(() => {
    const body = document.querySelector('#insightBody'); if (!body) return null
    const out = { flyers: {}, hours: {}, hoursW: {}, tiles: [...body.querySelectorAll('.itile')].map(t => t.innerText.replace(/\s+/g, ' ').trim()) }
    let sec = ''
    for (const el of body.querySelectorAll('.isec-h, .ibar')) {
      if (el.classList.contains('isec-h')) { sec = el.innerText.trim(); continue }
      if (el.classList.contains('ibar')) {
        const nm = el.querySelector('.nm').innerText.trim(), v = el.querySelector('.v').innerText.trim(), tt = (el.querySelector('.v').title || '')
        const fill = el.querySelector('.fill, .mix-segments')
        const w = fill ? fill.style.width : ''
        if (/^work hours/i.test(sec)) { out.hours[nm] = v; out.hoursW[nm] = w; out.days = out.days || {}; out.days[nm] = tt } else if (/^flying load/i.test(sec)) out.flyers[nm] = v
      }
    }
    return out
  })
}
export async function closeInsights(p) {
  const x = p.locator('#insightClose:visible').first()
  if (await x.count()) { await x.click(); await sleep(300) } else { await p.keyboard.press('Escape'); await sleep(300) }
}
/* open, read, picture, close */
export async function insightsOf(p, picName) {
  await openInsights(p)
  const i = await readInsights(p)
  const f = picName ? await pic(p, picName) : null
  await closeInsights(p)
  return { ...i, pic: f }
}

/* ---- logic ---- */
export async function logicGet(p) { return p.evaluate(() => ({ reportLead: window.VCONF.reportLead, reportText: window.VCONF.reportText, debrief: window.VCONF.debrief })) }
export async function logicSet(p, set, value) {
  await W.boardOff(p)
  await L.go(p, 'logic')
  const ed = p.locator('#lgEdit'); if (await ed.count() && await ed.isVisible()) { await ed.click(); await sleep(400) }
  const f = p.locator(`input[data-lgset="${set}"]`).first()
  await f.scrollIntoViewIfNeeded(); await f.click(); await f.fill(String(value)); await f.press('Tab'); await sleep(500)
  return f.inputValue()
}

/* ---- a wave on a day, built on the board ---- */
export async function addFlyingWave(p, di, { cs, to, ld, p1, w1 }) {
  await toBoard(p, di)
  const wi = await p.evaluate(i => window.DAYS[i].waves.length, di)
  await tap(p, `[data-wvadd="${di}"]`)
  await p.getByRole('button', { name: 'Flying wave', exact: true }).click(); await sleep(500)
  await type(p, `[data-bfld="ff:${di}.${wi}.0.cs"]`, cs)
  await type(p, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  await type(p, `[data-bfld="ff:${di}.${wi}.0.ld"]`, ld)
  const got = []
  if (p1) got.push(await put(p, `[data-slot="${di}.${wi}.0.0.p"]`, [p1]))
  if (w1) got.push(await put(p, `[data-slot="${di}.${wi}.0.0.w"]`, [w1]))
  return { wi, got }
}
/* the "+ In-time / Rally" button of wave (di, gi) on the surface that is up */
export async function addItBtn(p, di, gi) {
  const board = await p.locator('#schedBoard:visible').count()
  const b = p.locator(`${board ? '#schedBoard' : '#eWeek'} [data-itadd="${di}|${gi}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  await b.click(); await sleep(600)
}
export const intimes = (p, di, gi) => p.evaluate(([d, g]) => (window.DAYS[d].waves[g].intimes || []).slice(), [di, gi])
/* the in-time lines as painted for a wave (week or board) */
export async function itPainted(p, di, gi) {
  return p.evaluate(([d, g]) => {
    const board = document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth
    const root = board ? document.querySelector('#schedBoard') : document.querySelector('#eWeek')
    const blk = [...root.querySelectorAll(`.intimes[data-intimes="${d}|${g}"]`)].find(e => e.offsetParent !== null)
    return blk ? [...blk.querySelectorAll('.itline')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) : null
  }, [di, gi])
}
/* an in-time line's own box: type over it, commit with Tab */
export async function setItLine(p, di, gi, ix, text) {
  const board = await p.locator('#schedBoard:visible').count()
  const el = p.locator(`${board ? '#schedBoard' : '#eWeek'} [data-itline="${di}|${gi}|${ix}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(120)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay: 8 })
  await p.keyboard.press('Tab'); await sleep(500)
}
/* the day's warning list text (week list or board panel), every line as painted, plus the in-time feedback under the lines */
export async function dayWarns(p, di) {
  const board = await p.locator('#schedBoard:visible').count()
  if (board) { await W.boardOpenFold(p); const b = await W.readBoard(p); return { head: b.head, lines: b.lines.map(l => l.text) } }
  await openList(p, '#eWeek', di)
  const l = await readList(p, '#eWeek', di)
  return { head: l.bar, lines: (l.lines || []).map(x => x.text) }
}
export async function feedback(p, di, gi) {
  return p.evaluate(([d, g]) => {
    const board = document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth
    const root = board ? document.querySelector('#schedBoard') : document.querySelector('#eWeek')
    return [...root.querySelectorAll('[data-reporting-feedback]')].filter(e => e.offsetParent !== null).map(e => e.innerText.replace(/\s+/g, ' ').trim())
  }, [di, gi])
}

/* ---- Leave War ---- */
export async function lwOpenMonth(p, mon) {
  await L.go(p, 'leavewar'); await sleep(1200)
  const m = p.locator(`[data-testid="month-${mon}"]`)
  if (await m.count()) { await m.first().click(); await sleep(1200) }
}
export async function lwCellOf(p, id, iso) {
  return p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); return c ? { text: (c.innerText || '').trim(), cls: String(c.className).slice(0, 90), title: c.getAttribute('title') || '' } : 'NO CELL DRAWN' }, [id, iso])
}
export async function oilRow(p, id) {
  await L.go(p, 'leavewar'); await sleep(900)
  const b = p.locator('[data-testid="oil-tracker"]:visible').first()
  await b.click(); await sleep(1200)
  const r = await p.evaluate(i => { const e = document.querySelector(`[data-testid="oil-row-${i}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : 'NO ROW' }, id)
  const row_ = p.locator(`[data-testid="oil-row-${id}"]`).first()
  if (await row_.count()) { await row_.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300) }
  return r
}
export async function closeOil(p) {
  const x = p.locator('[data-testid="oil-close"]:visible').first()
  if (await x.count()) { await x.click().catch(() => {}); await sleep(400) }
}
export const SAT = '2026-07-18', SUN = '2026-07-19', TUE = '2026-07-14'

/* the wave header's In-time / Rally words as painted on the week day */
export async function waveHeader(p, di) {
  return p.evaluate(i => { const d = document.querySelector('#eWeek .day[data-day="' + i + '"]'); if (!d) return null; return [...d.querySelectorAll('.go')].map(e => { const m = /In-time \/ Rally[^\n]*/.exec(e.innerText); return m ? m[0].replace(/\s+/g, ' ').slice(0, 80) : null }).filter(Boolean) }, di)
}
export { pucks, flagged } from './wh-lib.mjs'
