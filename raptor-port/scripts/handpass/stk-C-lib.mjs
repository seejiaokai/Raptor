/* Codex stack walk (D589), walker C — shared helpers. Every fixture goes through the app's own controls;
   window.* is read only (and used to get to a place). Pictures to HP_SHOTS; results appended to HP_OUT. */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import * as L from './dbrA-lib.mjs'
import * as W from './dbrA-W1-lib.mjs'
export { L, W }
export const sleep = L.sleep
export const OUT = process.env.HP_OUT
export const SHOTS = process.env.HP_SHOTS
export const ERR = []
let N = 0
export const TAG = process.env.HP_TAG || 'x'

export async function pic(p, name, opts = {}) {
  mkdirSync(SHOTS, { recursive: true })
  const f = `${TAG}-${String(++N).padStart(2, '0')}-${name}.png`
  await p.screenshot({ path: `${SHOTS}/${f}`, ...opts }).catch(() => {})
  return f
}
/* the table */
export const TABLE = []
export function row(id, did, saw, verdict, pics = []) {
  TABLE.push({ id, did, saw, verdict, pics })
  console.log(`== ${verdict}  ${id} — ${did}\n     saw: ${String(saw).slice(0, 1500)}`)
}
export function save(name) {
  mkdirSync(dirname(OUT), { recursive: true })
  let all = { parts: {} }
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch { all = { parts: {} } } }
  if (!all.parts) all = { parts: {} }
  const old = (all.parts[name] && all.parts[name].table) || []
  const ids = new Set(TABLE.map(r => r.id))
  all.parts[name] = { at: new Date().toISOString(), base: process.env.HP_URL, table: [...old.filter(r => !ids.has(r.id)), ...TABLE], errors: ERR.slice() }
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log('saved', name, '→', OUT, 'errors:', ERR.length)
}

/* a fresh world, signed in */
export async function world({ who = 'a', phone = !!process.env.HP_PHONE, w, h } = {}) {
  const browser = await L.launch()
  const ctx = await browser.newContext({ viewport: w ? { width: w, height: h } : (phone ? L.PHONE : L.DESK), ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const p = await L.page(ctx, ERR, who === 'a' ? 'A' : 'M')
  await L.signIn(p, who)
  await W.toastSpy(p)
  return { browser, ctx, p }
}

/* ---- Logic page ---- */
export async function logicEdit(p) {
  await L.go(p, 'logic')
  const e = p.locator('#lgEdit:visible')
  if (await e.count()) { await e.click(); await sleep(300) }
}
export async function tracking(p, on) {
  await W.boardOff(p)
  await logicEdit(p)
  const sw = p.locator('#lgMissionMix')
  const cur = (await sw.isChecked().catch(() => null))
  if (cur !== on) { await sw.setChecked(on); await sleep(400) }
  return await sw.isChecked()
}

/* ---- the board / week ---- */
export async function board(p, di) {
  const open = await p.evaluate(() => (document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? window.SBDAY : null))
  if (open === di) return
  if (open != null) await W.boardOff(p)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched')
  await W.showDay(p, di)
  const live = p.locator(`#eWeek [data-golive="${di}"]:visible`)
  if (await live.count()) { await live.first().click(); await sleep(300) }
  await p.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await p.waitForSelector('#schedBoard', { timeout: 10000 })
  await sleep(500)
}
export async function toWeek(p, di) {
  await W.boardOff(p)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched')
  await W.showDay(p, di)
}
/* type into a board input and leave it with Tab (the way a person commits) */
export async function bset(p, key, value, { commit = 'Tab' } = {}) {
  const el = p.locator(`#schedBoard [data-bfld="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await el.click()
  await el.fill(String(value))
  if (commit) await el.press(commit)
  await sleep(250)
}
/* a contenteditable on the week */
export async function wset(p, key, value, { commit = 'Tab' } = {}) {
  const el = p.locator(`#eWeek [data-txt="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await el.click()
  await p.keyboard.press('Control+A')
  if (value === '') await p.keyboard.press('Delete'); else await p.keyboard.type(String(value), { delay: 6 })
  if (commit) await p.keyboard.press(commit)
  await sleep(250)
}
/* set a flying-line field (mission/remarks/...) on whichever editor is showing */
export async function fset(p, key, value, o) {
  if (await p.locator('#schedBoard:visible').count()) return bset(p, key, value, o)
  return wset(p, key, value, o)
}
export const bounds = e => e

/* ---- the question ---- */
export async function question(p) {
  return p.evaluate(() => {
    const q = document.querySelector('.mission-role-question')
    const ui = [...document.querySelectorAll('[data-role-ui]')]
    const ch = document.querySelector('[data-role-choose]')
    const vis = e => !!e && e.offsetParent !== null
    return {
      q: q ? q.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) : null,
      nQ: document.querySelectorAll('.mission-role-question').length,
      sides: [...document.querySelectorAll('[data-role-side]')].filter(vis).map(e => e.dataset.roleSide),
      choose: ch && vis(ch) ? ch.innerText.trim() : null,
      nUi: ui.length,
    }
  })
}
export async function side(p, s) {
  const b = p.locator(`[data-role-side="${s}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'nearest' }))
  await b.click(); await sleep(350)
}
/* Insights through the doors: desktop #insightBtn / board #sbInsights; phone: board #sbMore -> #sbMoreInsights */
export async function insightsRead(p, { open = null, keep = false, keepTwelve = false } = {}) {
  if (open) await open()
  else if (await p.locator('#schedBoard:visible').count()) {
    if (await p.locator('#sbInsights:visible').count()) await p.locator('#sbInsights').click()
    else { await p.locator('#sbMore').click(); await sleep(200); await p.locator('#sbMoreInsights').click() }
  } else if (await p.locator('#insightBtn:visible').count()) await p.locator('#insightBtn:visible').first().click()
  else { const pg = await p.evaluate(() => window.CURPAGE); const id = pg === 'viewsched' ? 'viewSched' : 'editSched'; await p.locator('#' + id + 'More').click(); await sleep(250); await p.locator('#' + id + 'MoreInsights').click() }
  await p.waitForSelector('#insightBody', { state: 'visible', timeout: 8000 })
  await sleep(350)
  const all = p.locator('[data-insights-all]:visible')
  const hadAll = await all.count()
  const twelve = await p.locator('#insightModal .ibar.mission-mix-row').count()
  if (hadAll && !keepTwelve) { await all.first().click(); await sleep(250) }
  const o = await readInsights(p)
  o.twelve = twelve
  const pic1 = await pic(p, 'insights')
  if (!keep) { await p.locator('#insightClose').click(); await sleep(300) }
  return { ...o, hadAll, pic: pic1 }
}
export async function readInsights(p) {
  return p.evaluate(() => {
    const m = document.querySelector('#insightModal') || document
    const rows = [...m.querySelectorAll('.ibar')].map(e => ({
      sect: (e.closest('.isec,section,.insec') || {}).innerText ? '' : '',
      nm: (e.querySelector('.nm') || {}).textContent,
      v: (e.querySelector('.v') || {}).textContent,
      blue: (e.querySelector('.mix-count-blue') || {}).textContent ?? null,
      red: (e.querySelector('.mix-count-red') || {}).textContent ?? null,
      mix: e.classList.contains('mission-mix-row'),
    }))
    return { text: m.querySelector('#insightBody') ? m.querySelector('#insightBody').innerText.replace(/\s+/g, ' ').slice(0, 1800) : '', tiles: [...m.querySelectorAll('.itile')].map(e => e.innerText.replace(/\s+/g, ' ').trim()), rows }
  })
}
/* the flying people's blue/red rows only */
export const mixRows = o => o.rows.filter(r => r.mix).map(r => `${r.nm}:${r.blue ?? '-'}b/${r.red ?? '-'}r/${r.v}`)
export const mixOf = (o, ...names) => names.map(n => { const r = o.rows.find(x => x.mix && x.nm === n); return r ? `${n}:${r.blue ?? '-'}b/${r.red ?? '-'}r/total${r.v}` : `${n}:(none)` }).join('  ')
export async function logicRead(p) { return p.evaluate(() => ({ nominal: (document.querySelector('#lgNominal,[data-lgnom]') || {}).value })) }

/* ---- sign off and publish through the day's own controls ---- */
export async function publish(p, di) {
  const s = await W.signDay(p, di)
  const r = await W.publishDay(p, di)
  return { s, r }
}
export async function pending(p, di) { return p.evaluate(i => ({ pend: window.pendCount ? window.pendCount(i) : null, ver: window.dayCurVer ? window.dayCurVer(i) : null }), di) }
export async function dayRem(p, di) { return p.evaluate(i => { const f = window.DAYS[i].waves[0].formations; return f.map(x => ({ cs: x.cs, msn: x.msn, rm: x.aircraft.map(a => a.rmks) })) }, di) }
export async function errs() { return ERR.slice() }

/* ---- published days: the version door, the sign-off ---- */
export async function menuOpen(p) { await p.locator('#schedBoard [data-planmenu]:visible').first().click(); await sleep(300) }
export async function preview(p, ver) {
  await menuOpen(p)
  await p.locator(`.wavemenu [data-planpv="${ver}"]`).first().click(); await sleep(500)
  await p.waitForSelector('#schedBoard .pv-frozen', { timeout: 6000 })
}
export async function versions(p) {
  await menuOpen(p)
  const v = await p.locator('.wavemenu [data-planpv]').evaluateAll(es => es.map(e => e.getAttribute('data-planpv') + '|' + e.innerText.replace(/\s+/g, ' ').trim()))
  await p.keyboard.press('Escape'); await sleep(200)
  if (await p.locator('.wavemenu:visible').count()) await p.locator('#schedBoard .sb-title, #sbDay').first().click().catch(() => {})
  return v
}
export async function live(p, di) {
  await p.locator(`#schedBoard [data-golive="${di}"]:visible`).first().click(); await sleep(500)
}
export async function snap(p) {
  return p.evaluate(() => ({ days: JSON.stringify(window.DAYS), book: JSON.stringify(window.SCHED), seq: window.commandStreamLen ? window.commandStreamLen() : null }))
}
/* press Tab on, then click, the remarks box of the (published or working) formation, bring up its question */
export async function openQuestion(p, di, { published = false, fi = 0 } = {}) {
  const field = published ? p.locator('#schedBoard [data-role-remarks]:visible').first() : p.locator(`#schedBoard [data-bfld="fr:${di}.0.${fi}.0"]:visible`).first()
  await field.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await field.click(); await sleep(250)
  const ch = p.locator('[data-role-choose]:visible')
  if (await ch.count()) { await ch.first().click(); await sleep(300) }
  return question(p)
}
export async function publish2(p, di) {
  await p.evaluate(() => { const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur() }); await sleep(300)
  const s = await W.signDay(p, di)
  await sleep(200)
  const r = await W.publishDay(p, di)
  await sleep(1200)
  const ver = await p.evaluate(i => window.dayCurVer(i), di)
  return { s, r, ver }
}
/* the day's head as painted: every chip, the sign-off line, the AL button, the "not yet signed" mark */
export async function headOf(p, di) {
  return p.evaluate(i => {
    const b = document.querySelector('#schedBoard')
    const scope = b && b.offsetWidth ? b : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const q = s => scope.querySelector(s)
    return { chips: [...scope.querySelectorAll('.dpend, .verchip')].map(t).join(' | '), alpub: t(q(`[data-alpub="${i}"]`)), signed: t(q('.signedln')), nys: t(q('.nysmark')), pend: window.pendCount ? window.pendCount(i) : null }
  }, di)
}
/* sign the four boxes of the day again and issue the next amendment */
export async function alIssue(p, di) {
  await p.evaluate(() => { const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur() }); await sleep(300)
  const s = await W.signDay(p, di); await sleep(200)
  const r = await W.publishAL(p, di); await sleep(1200)
  return { s, r, ver: await p.evaluate(i => window.dayCurVer(i), di) }
}
/* the Changes window (History): open it, All changes tab, read its text, close it */
export async function histRead(p, { tab = 'All changes', day = null, keep = false } = {}) {
  const b = (await p.locator('#sbHist:visible').count()) ? p.locator('#sbHist:visible').first() : p.locator('#histBtn:visible').first()
  if (!(await p.locator('.chgwin:visible').count())) { await b.click(); await sleep(500) }
  if (tab) { const t = p.locator('.chgwin .win-tab').filter({ hasText: tab }).first(); if (await t.count()) { await t.click(); await sleep(300) } }
  const text = await p.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? w.innerText.replace(/\s+/g, ' ').trim() : null })
  const f = await pic(p, 'changes')
  if (!keep) { const x = p.locator('.chgwin button').filter({ hasText: /[×✕x]/ }).first(); if (await x.count()) await x.click(); else await b.click(); await sleep(300) }
  return { text, pic: f }
}
/* focus a formation's Remarks on the board and read what the manual door says, without pressing it; then Tab out */
export async function doorLabel(p, di, fi = 0, { ai = 0 } = {}) {
  const f = p.locator(`#schedBoard [data-bfld="fr:${di}.0.${fi}.${ai}"]:visible`).first()
  await f.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await f.click(); await sleep(300)
  const label = await p.evaluate(() => { const b = document.querySelector('[data-role-choose]'); return b && b.offsetParent ? b.innerText.trim() : null })
  const nQ = await p.locator('.mission-role-question').count()
  await f.press('Tab'); await sleep(300)
  return { label, nQ }
}
/* focus a Remarks box (board or week), read the manual door's label without pressing it, Tab out */
export async function doorLabel2(p, editor, key) {
  const f = editor === 'Board' ? p.locator(`#schedBoard [data-bfld="${key}"]:visible`).first() : p.locator(`#eWeek [data-txt="${key}"]:visible`).first()
  await f.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await f.click(); await sleep(300)
  const label = await p.evaluate(() => { const b = document.querySelector('[data-role-choose]'); return b && b.offsetParent ? b.innerText.trim() : null })
  const nQ = await p.locator('.mission-role-question').count()
  await p.keyboard.press('Tab'); await sleep(300)
  return { label, nQ }
}

/* can a finger land on each visible question button? (centre hit-test, inside the window) */
export async function reach(p) {
  return p.evaluate(() => [...document.querySelectorAll('[data-role-side], [data-role-choose]')].filter(e => e.offsetParent !== null).map(e => {
    const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return (e.dataset.roleSide || 'choose') + ':' + ((h === e || e.contains(h)) ? 'ok' : 'COVERED') + (r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth ? '' : '(off-screen)')
  }).join(' '))
}
