/* Walker TS — shared helpers on top of wh-lib (the codex-stack walk, 5 Oct 26). Everything a step does goes through the
   app's own controls; window.* is only read. */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { L, W, world, pic, row, judge, savePart, TABLE, PHONE, TAG, DAY, reloadAs, warnsOf, openList, readList, boardOpenFold, readBoard, csOf } from './wh-lib.mjs'
export { L, W, world, pic, row, judge, savePart, TABLE, PHONE, TAG, DAY, reloadAs, warnsOf, openList, readList, boardOpenFold, readBoard, csOf }
export const sleep = L.sleep

/* the waves of a day as the app holds them (read only) */
export const readDayModel = (p, di) => p.evaluate(i => {
  const d = window.DAYS[i]; if (!d) return null
  return (d.waves || []).map((w, gi) => ({ gi, kind: w.kind, label: w.label, intimes: JSON.parse(JSON.stringify(w.intimes || [])),
    forms: (w.formations || []).map((f, fi) => ({ fi, cs: f.cs, msn: f.msn, br: f.br, to: f.to, ldg: f.ldg, cx: f.cx, ac: (f.aircraft || []).map(a => ({ p: a.p, w: a.w, cx: a.cx, rmks: a.rmks })) })) }))
}, di)

/* the reporting lines of a wave as painted on the week (text of each) */
export const weekLines = (p, di, gi) => p.evaluate(([i, g]) => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] [data-itline^="${i}|${g}|"]`)].map(e => ({ at: e.dataset.itline, text: e.innerText.trim() })), [di, gi])
export const boardLines = (p, di, gi) => p.evaluate(([i, g]) => [...document.querySelectorAll(`#schedBoard [data-itline^="${i}|${g}|"]`)].filter(e => e.offsetParent !== null).map(e => ({ at: e.dataset.itline, text: e.innerText.trim() })), [di, gi])

/* type into a reporting line box and commit by Tab (the real keyboard) */
export async function typeLine(p, scope, at, value) {
  const el = p.locator(`${scope} [data-itline="${at}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await el.click()
  await p.keyboard.press('Control+A')
  if (value === '') await p.keyboard.press('Delete'); else await p.keyboard.type(value, { delay: 8 })
  await p.keyboard.press('Tab')
  await sleep(400)
}
/* the scheduler's text boxes on the week */
export async function weekBox(p, key, value) {
  const el = p.locator(`#eWeek [data-txt="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await el.click(); await p.keyboard.press('Control+A')
  if (value === '') await p.keyboard.press('Delete'); else await p.keyboard.type(String(value), { delay: 8 })
  await p.keyboard.press('Tab'); await sleep(400)
}
export const boardBox = (p, key, value) => W.boardText(p, key, value)

/* Insights window — open by its door; read its text and Work-hours rows */
export async function openInsights(p, where = 'week') {
  if (where === 'board') {
    const b = p.locator('#sbInsights:visible').first()
    if (await b.count()) await b.click(); else { await p.locator('#sbMore').click(); await sleep(200); await p.locator('#sbMoreInsights').click() }
  } else {
    const b = p.locator('#eWeek [data-insights]:visible, #weekInsights:visible, [data-wkinsights]:visible, #insightsBtn:visible, button:has-text("Insights"):visible').first()
    await b.click()
  }
  await p.waitForSelector('#insightBody', { state: 'visible', timeout: 6000 }); await sleep(500)
}
export const readInsights = p => p.evaluate(() => {
  const b = document.querySelector('#insightBody'); if (!b) return null
  return { text: b.innerText.replace(/\s+/g, ' ').trim().slice(0, 2500), rows: [...b.querySelectorAll('.ibar')].map(r => ({ cls: r.className, text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 140), w: (() => { const f = r.querySelector('.ifill, .bar, i, span[style*="width"]'); return f ? f.getAttribute('style') : '' })() })) }
})
export async function closeInsights(p) {
  const c = p.locator('#insightClose:visible').first(); if (await c.count()) await c.click(); else await p.keyboard.press('Escape'); await sleep(300)
}
/* Logic page */
export async function logicRead(p) {
  return p.evaluate(() => [...document.querySelectorAll('#page-logic [data-lgset], #page-logic input, #page-logic textarea')].map(e => ({ id: e.id, set: e.dataset.lgset, v: e.value, t: e.type, ph: e.placeholder })).slice(0, 200))
}
export async function savePic(p, name, opts = {}) { return pic(p, name, opts) }

/* ---- more helpers (walker TS) ---- */
export const hm = s => { const m = /^(\d+)h(\d{2})?$/.exec((s || '').trim()); if (m) return +m[1] * 60 + (m[2] ? +m[2] : 0); const n = /^(\d+)\s*min$/.exec((s||'').trim()); return n ? +n[1] : (/^-/.test(s||'') ? NaN : NaN) }
/* open Insights by whichever door is on screen, read the Work-hours section as {name: text}, plus the bars' widths; close it */
export async function hoursMap(p, { keepOpen = false, shot = null } = {}) {
  const b = await p.locator('#sbInsights:visible').count()
  let reopen = null
  if (b) await p.locator('#sbInsights:visible').first().click()
  else {
    if (await p.locator('#schedBoard:visible').count()) { reopen = await p.evaluate(() => window.SBDAY); await W.boardOff(p) }
    if (await p.locator('#insightBtn:visible').count()) await p.locator('#insightBtn:visible').first().click()
    else if (await p.locator('#burger:visible').count()) { await p.locator('#burger').click(); await sleep(400); await p.locator('#drawerInsights:visible').first().click() }
    else throw new Error('no Insights door visible')
  }
  await p.waitForSelector('#insightBody', { state: 'visible', timeout: 6000 }); await sleep(600)
  const r = await p.evaluate(() => {
    const body = document.querySelector('#insightBody')
    const heads = [...body.querySelectorAll('.isec-h')]
    const wh = heads.find(h => /^Work hours/i.test(h.innerText))
    const out = { hours: {}, widths: {}, titles: {}, all: [] }
    if (wh) { let e = wh.nextElementSibling; while (e && !e.classList.contains('isec-h')) { if (e.classList.contains('ibar')) { const n = e.querySelector('.nm').innerText.trim(); const v = e.querySelector('.v'); out.hours[n] = v.innerText.trim(); out.titles[n] = v.getAttribute('title') || ''; const f = e.querySelector('.fill'); out.widths[n] = f ? f.style.width : '' } e = e.nextElementSibling } }
    out.heads = heads.map(h => h.innerText.trim())
    return out
  })
  if (shot) r.pic = await pic(p, shot)
  if (!keepOpen) await closeInsights(p)
  if (reopen != null) await openBoard(p, reopen)
  return r
}
export async function addFlyWave(p, di) {
  await openBoard(p, di)
  await p.locator(`#schedBoard [data-wvadd="${di}"]`).first().scrollIntoViewIfNeeded()
  await p.locator(`#schedBoard [data-wvadd="${di}"]`).first().click(); await sleep(400)
  await p.locator('.wm[data-wmkind=""]').first().click(); await sleep(700)
}
/* arm a seat on the open board and drop a named person from the crew list (the app's own gesture) */
import { handPut } from './seat-lib.mjs'
export async function crew(p, key, pid) { return handPut(p, key, pid) }
/* the day's warning texts straight from what the app holds (read only) */
export async function warnTexts(p, di, re) {
  const w = await p.evaluate(i => ((window.WARN.byDay[i] || {}).warns || []).map(w => ({ sev: w.sev, code: w.code, msg: String(w.msg || ''), off: !!w.off, who: w.who || [] })), di)
  return re ? w.filter(x => re.test(x.code + ' ' + x.msg)) : w
}
export const reportWarns = (p, di) => warnTexts(p, di, /REPORT|in-?time|rally/i)
export async function boardOff(p) { return W.boardOff(p) }
export async function toLogicSet(p, key, value) {
  await boardOff(p)
  await L.go(p, 'logic')
  if (await p.locator('#lgEdit:visible').count()) { await p.locator('#lgEdit').click(); await sleep(300) }
  const el = p.locator(`#page-logic [data-lgset="${key}"]`).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(value, { delay: 8 }); await p.keyboard.press('Tab'); await sleep(500)
  const v = await el.inputValue()
  if (await p.locator('#lgDone:visible').count()) { await p.locator('#lgDone').click(); await sleep(400) }
  return v
}
export const logicVal = async (p, key) => { await boardOff(p); await L.go(p, 'logic'); return p.evaluate(k => { const e = document.querySelector(`#page-logic [data-lgset="${k}"]`); return e ? e.value : null }, key) }
export async function toWeek(p) { await boardOff(p); if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched') }
/* each line of a wave as painted on whichever surface is up: text, and any note near it */
export async function waveHead(p, di, gi) {
  return p.evaluate(([i, g]) => {
    const b = document.querySelector('#schedBoard'); const scope = b && b.offsetWidth ? b : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const lines = [...scope.querySelectorAll(`[data-itline^="${i}|${g}|"]`)].filter(e => e.offsetParent).map(e => e.innerText.trim())
    const asd = [...scope.querySelectorAll('.asd')].map(e => e.innerText.trim())
    const near = [...scope.querySelectorAll(`.intimes[data-intimes], .itnote, .itmsg, [data-itmsg]`)].map(e => e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 6)
    return { lines, asd, near }
  }, [di, gi])
}
export function fmtHours(h) { return Object.entries(h).map(([k, v]) => `${k}=${v}`).join(', ') }
/* scroll a thing to the middle of the window the way a person does, then take the picture */
export async function picAt(p, sel, name, opts = {}) {
  await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent !== null); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, sel)
  await sleep(350)
  return pic(p, name, opts)
}
export const logicValText = async (p) => { await boardOff(p); await L.go(p, 'logic'); return p.evaluate(() => { const r = [...document.querySelectorAll('#page-logic .lgrule')].find(x => /nominal report/i.test(x.innerText)); const i = r && r.querySelector('input[data-lgset="reportLead"]'); const v = r && r.querySelector('.val'); return { input: i ? i.value : null, text: v ? v.innerText : null } }) }
/* open the board on day di whatever state the page was left in (W.boardOn trusts a stale SBDAY) */
export async function openBoard(p, di) {
  if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') { await p.evaluate(() => window.go('editsched')); await sleep(500) }
  const drawn = await p.evaluate(d => window.SBDAY === d && !!document.querySelector('#schedBoard [data-bfld]') && document.querySelector('#schedBoard').offsetWidth > 0, di)
  if (drawn) return
  if (await p.locator('#schedBoard:visible').count()) { await W.boardOff(p) }
  const bt = p.locator('#eWeek [data-sbday="' + di + '"]').first()
  await W.showDay(p, di)
  await bt.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
  await bt.click()
  await p.waitForSelector('#schedBoard [data-bfld]', { state: 'attached', timeout: 8000 }); await sleep(700)
}
