/* Walker F — fixture helpers for the X scenarios. Everything through the app's own controls; the probe bridge only reads. */
import * as F from './stk2-Q-flib.mjs'
import * as LIB from './lib.mjs'
import * as SEAT from './seat-lib.mjs'
export { LIB }
const { sleep } = F
const W = F.H.W
export const hit = async (p, loc) => { await loc.waitFor({ state: 'visible' }); await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(120); await loc.click() }

/* the squadron's Blue/Red switch on Logic (edit mode first), then back to where we were */
export async function tracking(p, on) {
  await F.H.W.boardOff(p).catch(() => {})
  await F.go(p, 'logic'); await sleep(300)
  const edit = p.locator('#lgEdit')
  if (await edit.isVisible()) await edit.click()
  await p.locator('#lgMissionMix').setChecked(on); await sleep(300)
  const done = p.locator('#lgDone'); if (await done.isVisible().catch(() => false)) { /* leave edit mode on: harmless */ }
  return p.locator('#lgMissionMix').isChecked()
}
/* a Logic number/word box (edit mode on): data-lgset="reportLead" etc. */
export async function logicSet(p, key, value) {
  await F.go(p, 'logic'); await sleep(300)
  const edit = p.locator('#lgEdit'); if (await edit.isVisible()) await edit.click()
  const box = p.locator(`[data-lgset="${key}"]`).first()
  await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await box.click(); await box.fill(''); await box.type(String(value), { delay: 8 }); await box.press('Tab'); await sleep(300)
  return box.inputValue()
}
export async function logicGet(p, key) {
  await F.go(p, 'logic'); await sleep(300)
  const edit = p.locator('#lgEdit'); if (await edit.isVisible()) { await edit.click(); await sleep(300) }
  return p.locator(`[data-lgset="${key}"]`).first().inputValue().catch(async () => (await p.locator(`[data-lgset="${key}"]`).first().textContent()))
}
/* open the board on day di (through the edit week's own door) */
export const board = (p, di) => LIB.board(p, di)
export const boardOff = p => W.boardOff(p)
/* a flying wave with ONE formation on day di, by the board's controls. crew = [pilot, wso] person ids (put via the crew list) */
export async function flyWave(p, di, { cs = 'VL', to = '12:00', ld = '13:00', crew = ['bane', 'freak'], gi = 0, kindBtn = 'Flying wave' } = {}) {
  await board(p, di)
  await LIB.tap(p, `[data-wvadd="${di}"]`)
  await p.getByRole('button', { name: kindBtn, exact: true }).click(); await sleep(500)
  await LIB.type(p, `[data-bfld="ff:${di}.${gi}.0.cs"]`, cs)
  await LIB.type(p, `[data-bfld="ff:${di}.${gi}.0.to"]`, to)
  await LIB.type(p, `[data-bfld="ff:${di}.${gi}.0.ld"]`, ld)
  const r1 = await LIB.put(p, `[data-slot="${di}.${gi}.0.0.p"]`, [crew[0]])
  const r2 = await LIB.put(p, `[data-slot="${di}.${gi}.0.0.w"]`, [crew[1]])
  return { r1, r2 }
}
/* the day's text, from the model (read only) */
export const day = (p, di) => p.evaluate(i => {
  const d = window.DAYS[i]
  return d.waves.map(w => ({ label: w.label, kind: w.kind, intimes: w.intimes, f: w.formations.map(f => ({ cs: f.cs, msn: f.msn, br: f.br, to: f.to, ld: f.ld, ac: f.aircraft.map(a => ({ p: a.p, w: a.w, rmks: a.rmks })) })) }))
}, di)
/* the day's warning list as the app holds it */
export const warns = (p, di) => F.H.warnsOf(p, di)
/* Insights read: tiles + the rows of each section (name, values) — opened by the surface's own door */
export async function insights(p, { door = 'desk', all = true } = {}) {
  if (door === 'desk') await p.locator('#insightBtn').click()
  else if (door === 'board') { if (p.viewportSize().width > 820) await p.locator('#sbInsights').click(); else { await p.locator('#sbMore').click(); await p.locator('#sbMoreInsights').click() } }
  await p.waitForSelector('#insightBody', { state: 'visible' }); await sleep(400)
  if (all) { const sh = p.locator('[data-insights-all]'); while (await sh.count() && /Show all/.test(await sh.first().innerText())) { await sh.first().click(); await sleep(300) } }
  const out = await p.evaluate(() => {
    const body = document.querySelector('#insightBody')
    const secs = []; let cur = null
    for (const n of body.children) {
      if (n.classList.contains('isec-h')) { cur = { h: n.innerText.trim(), rows: [] }; secs.push(cur) }
      else if (n.classList.contains('ibar') && cur) cur.rows.push({ nm: (n.querySelector('.nm') || {}).innerText, v: (n.querySelector('.v') || {}).innerText || null, blue: (n.querySelector('.mix-count-blue') || {}).innerText ?? null, red: (n.querySelector('.mix-count-red') || {}).innerText ?? null, fillCls: (n.querySelector('.fill') || {}).className || '', mix: n.classList.contains('mission-mix-row'), txt: n.innerText.replace(/\s+/g, ' ').trim() })
    }
    return { tiles: [...body.querySelectorAll('.itile')].map(t => t.innerText.replace(/\s+/g, ' ').trim()), secs, text: body.innerText.slice(0, 400) }
  })
  return out
}
export async function insightsClose(p) { await p.locator('#insightClose').click(); await sleep(300) }
/* sign the four boxes and publish (Publish day / Publish AL) on the board's day */
export async function publish(p, di) {
  await p.keyboard.press('Tab'); await sleep(150)
  const s = await W.signDay(p, di)
  const r = await (async () => { const b = p.locator(`#schedBoard [data-beak="${di}"]:visible, #schedBoard [data-alpub="${di}"]:visible`).first(); if (!(await b.count())) return { pressed: false, why: 'absent' }; if (await b.isDisabled()) return { pressed: false, why: 'disabled ' + (await b.getAttribute('title')) }; const label = (await b.innerText()).trim(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(900); return { pressed: true, label } })()
  return { signed: s, ...r, ver: await p.evaluate(i => window.dayCurVer(i), di) }
}
/* the day's head from the board */
export const head = (p, di) => W.head(p, di)
/* the state a role answer must not move (programme days, the book of versions/signs/pending) */
export const snap = p => p.evaluate(() => ({ days: JSON.stringify(window.DAYS), book: JSON.stringify(window.SCHED), seq: window.commandStreamLen(), last: window.lastEnvelope(), roleLines: window.ELOG.rows.filter(r => r.fld === 'mission-role').length, histN: window.ELOG.rows.length }))
export async function role(p, side) { await p.locator(`[data-role-side="${side}"]:visible`).first().click(); await sleep(350) }

/* ---- text boxes: the week's contenteditable boxes and the board's inputs ---- */
export const active = p => p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 'body'; const k = e.dataset.txt || e.dataset.bfld || e.dataset.itline || (e.dataset.bombs && 'bombs:' + e.dataset.bombs) || (e.dataset.area && 'area:' + e.dataset.area) || (e.dataset.atime && 'atime:' + e.dataset.atime) || e.id || e.tagName; const r = e.getBoundingClientRect(); return { k, text: (e.value !== undefined ? e.value : e.textContent) || '', visible: r.width > 0 && r.bottom > 0 && r.top < innerHeight, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } })
export const boxSel = (surf, key) => surf === 'board' ? `#schedBoard [data-bfld="${key}"]:visible, #schedBoard [data-txt="${key}"]:visible` : `#eWeek [data-txt="${key}"]:visible`
export async function typeIn(p, surf, key, text, { delay = 8 } = {}) {
  const el = p.locator(boxSel(surf, key)).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(120)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay })
  return el
}
/* type and leave by Tab (the way a scheduler commits) */
export async function set(p, surf, key, text) { await typeIn(p, surf, key, text); await p.keyboard.press('Tab'); await sleep(350) }
export async function relog(p) {
  await p.reload(); await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' }); await sleep(600)
}
export const questions = p => p.locator('.mission-role-question').count()
export async function later(p) { const l = p.locator('[data-role-side="later"]:visible'); if (await l.count()) { await l.first().click({ timeout: 4000 }).catch(() => {}); await sleep(300) } }
/* preview the latest published version on the board (plan menu → the version), and back to the working copy */
export async function previewLatest(p, ver) {
  await p.locator('#schedBoard [data-planmenu]').first().click(); await sleep(300)
  await p.locator(`.wavemenu [data-planpv="${ver}"]`).click(); await sleep(500)
}
export async function backToLive(p, di) { await p.locator(`#schedBoard [data-golive="${di}"]`).first().click(); await sleep(500) }
/* the published Remarks door: click the read-only box, then the Choose/Change button, then a side */
export async function answerPublished(p, side) {
  const f = p.locator('#schedBoard [data-role-remarks]').first()
  await f.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await f.click(); await sleep(250)
  const ch = p.locator('[data-role-choose]').first()
  if (await ch.count()) { await ch.click(); await sleep(250) }
  const qtext = await p.locator('.mission-role-question').first().innerText().catch(() => '')
  await p.locator(`[data-role-side="${side}"]`).first().click(); await sleep(400)
  return qtext
}
/* a Friday fixture: tracking, a wave, ACM + a cue in Remarks (via the week), the question left unanswered (Later) */
export async function condDay(p, di, { track = true, cue = 'DS FOR VL', crew = ['bane', 'freak'], to = '12:00', ld = '13:00' } = {}) {
  if (track) await tracking(p, true)
  const fw = await flyWave(p, di, { to, ld, crew })
  await boardOff(p); await F.go(p, 'editsched')
  await set(p, 'week', `ff:${di}.0.0.msn`, 'ACM')
  await set(p, 'week', `fr:${di}.0.0.0`, cue)
  if (await questions(p)) await later(p)
  return fw
}
/* a reporting line (data-itline="di|wave|i") on the week or the board */
export async function setLine(p, surf, di, i, text, wave = 0) {
  const sel = surf === 'board' ? `#schedBoard [data-itline="${di}|${wave}|${i}"]:visible` : `#eWeek [data-itline="${di}|${wave}|${i}"]:visible`
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(120)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay: 8 }); await p.keyboard.press('Tab'); await sleep(350)
}
export async function addLine(p, surf, di, wave = 0) {
  const sel = surf === 'board' ? `#schedBoard [data-itadd="${di}|${wave}"]:visible` : `#eWeek .day[data-day="${di}"] [data-itadd="${di}|${wave}"]:visible`
  const b = p.locator(sel).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await sleep(400)
  return p.evaluate(([d, w]) => window.DAYS[d].waves[w].intimes.slice(), [di, wave])
}
export const lines = (p, di, wave = 0) => p.evaluate(([d, w]) => window.DAYS[d].waves[w].intimes.slice(), [di, wave])
/* press "+ In-time / Rally" until the wave has n lines */
export async function ensureLines(p, surf, di, n, wave = 0) {
  let l = await lines(p, di, wave)
  for (let k = 0; k < 4 && l.length < n; k++) l = await addLine(p, surf, di, wave)
  return l
}
