// shr-a-lib — walker A's helpers for share A (the Scheduler Board's Unavailable rows), 25 Nov 26. Built on wr4-lib.mjs
// (the host's proven route, shr-w3.mjs). Reads only; writes pictures to WR4_OUT and results to .tmp/shr-a/.
import * as L from './wr4-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
export { L }
export const { sleep, go, bundleOf, facts } = L
export const J = JSON.stringify
export const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', TAG = `${SZ}-${ENG}`
export const EXPECT_BUNDLE = 'index-BiU7Aj55.js'
const RES = []
export const add = (id, verdict, what, pics = []) => { RES.push({ id, tag: TAG, verdict, what, pics }); console.log('RESULT', id, TAG, '|', verdict, '|', typeof what === 'string' ? what : J(what), '|', pics.join(', ')) }
export async function done(name) {
  mkdirSync('.tmp/shr-a', { recursive: true })
  writeFileSync(`.tmp/shr-a/res-${name}-${TAG}.json`, J({ results: RES, errors: facts.errors }, null, 1))
  console.log('PAGE ERRORS', J(facts.errors))
  await L.finish()
}
let picN = 0
/* a world: signed in as the admin, bundle checked */
export async function world(user = 'ad') {
  const w = await L.newPage(SZ, undefined, L.NEW_DIR, ENG)
  await L.signIn(w, user)
  const b = await bundleOf(w.page); console.log('bundle', b)
  if (b !== EXPECT_BUNDLE) throw new Error('WRONG BUNDLE ' + b)
  return w
}
export async function openBoard(w) { await go(w.page, 'editsched'); await w.page.evaluate(() => window.openScheduler(2)); await sleep(900) }
/* a person's id by the name on his puck */
export const idOf = (p, name) => p.evaluate(n => { for (const e of document.querySelectorAll('[data-person]')) { const t = e.querySelector('.nm')?.textContent?.trim(); if (t === n) return e.getAttribute('data-person') } return null }, name)
export const NAMES = { bane: 'Ranger', rocky: 'Hex' }
/* the store: every input holding a watched man that touches 13–17 Jul */
export const store = (p, ids = Object.keys(NAMES)) => p.evaluate(([ids, names]) => {
  const days = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17']
  return window.INPUTS.filter(r => (r.people || []).some(x => ids.includes(x.p)) && (days.includes(r.date) || days.includes(r.endDate)))
    .map(r => `${r.type} ${(r.people || []).map(x => names[x.p] || x.p).join('+')} ${r.date}${r.endDate ? '–' + r.endDate : ''} ${r.allday ? 'allday' : (r.s ?? '?') + '-' + (r.e ?? '?')}${r.half ? ' half=' + r.half : ''} "${r.remarks || ''}"${r.cx ? ' CX' : ''}${r.acc ? ' acc=' + r.acc : ''} [${r.iid}]`)
}, [ids, NAMES])
/* the screen: each Unavailable row of a watched man, in order, with its boxes' values and addresses */
export const screen = (p, ids = Object.keys(NAMES), sec = 'unav') => p.evaluate(([ids, names, sec]) => {
  const s = document.querySelector(`#sbBoard > [data-secmove$=".${sec}"]`); if (!s) return ['NO SECTION ' + sec]
  return [...s.querySelectorAll('[data-inprow]')].map((row, i) => {
    const who = [...row.querySelectorAll('.seat [data-person]')].map(e => e.getAttribute('data-person'))
    if (!who.some(x => ids.includes(x))) return null
    const v = f => { const e = row.querySelector(`[data-ifld$=".${f}"]`); return e ? e.value : '∅' }
    const late = row.querySelector('.latechip'); const lab = row.querySelector('.inpedit')
    return `#${i} ${who.map(x => names[x] || x).join('+')} ${lab?.textContent?.trim()} ${v('str')}-${v('end')} "${v('rmks')}"${late ? ' LATE' + (late.getAttribute('aria-pressed') === 'true' ? '(hidden)' : '') : ''} <${row.getAttribute('data-inprow')}>`
  }).filter(Boolean)
}, [ids, NAMES, sec])
/* screen = store: each watched row's boxes against the record its address names */
export const agree = (p, ids = Object.keys(NAMES)) => p.evaluate(([ids]) => {
  const hm = m => m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
  const s = document.querySelector('#sbBoard > [data-secmove$=".unav"]'); const bad = []; let n = 0
  for (const row of s.querySelectorAll('[data-inprow]')) {
    const who = [...row.querySelectorAll('.seat [data-person]')].map(e => e.getAttribute('data-person'))
    if (!who.some(x => ids.includes(x))) continue
    n++
    const [iid, man] = row.getAttribute('data-inprow').split('~')
    let r = window.INPUTS.find(x => String(x.iid) === iid)
    if (!r) { bad.push(`${row.getAttribute('data-inprow')}: no such record`); continue }
    if (man && !(r.people || []).some(y => y.p === man)) {
      /* a held row: its address names the shared input he has left — compare with HIS input now (same kind, holding him) */
      const day = r.date
      const his = window.INPUTS.filter(x => x.type === r.type && (x.people || []).some(y => y.p === man) && (x.date === day || x.endDate))
      if (his.length !== 1) { bad.push(`${row.getAttribute('data-inprow')}: held row, ${his.length} inputs of his`); continue }
      r = his[0]
    }
    if (!who.every(x => (r.people || []).some(y => y.p === x))) bad.push(`${row.getAttribute('data-inprow')}: record lacks ${who}`)
    const v = f => row.querySelector(`[data-ifld$=".${f}"]`)?.value ?? null
    const ws = r.allday ? '' : hm(r.s), we = r.allday ? '' : hm(r.e)
    if (v('str') !== null && v('str') !== ws) bad.push(`${row.getAttribute('data-inprow')} start shows ${v('str')} store ${ws}`)
    if (v('end') !== null && v('end') !== we) bad.push(`${row.getAttribute('data-inprow')} end shows ${v('end')} store ${we}`)
    if (v('rmks') !== null && v('rmks') !== (r.remarks || '')) bad.push(`${row.getAttribute('data-inprow')} rmks shows "${v('rmks')}" store "${r.remarks || ''}"`)
  }
  return { rows: n, bad }
}, [ids])
export const caret = p => p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; return a.getAttribute('data-ifld') || (a.id ? '#' + a.id : a.tagName + '.' + a.className) })
export const undoState = p => p.evaluate(() => { const u = document.querySelector('#sbUndo'), r = document.querySelector('#sbRedo'); const st = b => b ? `${b.disabled || b.getAttribute('aria-disabled') === 'true' ? 'greyed' : 'live'} "${b.title || ''}"` : 'none'; return `undo ${st(u)}; redo ${st(r)}` })
export async function read(p, label, ids) {
  const o = { step: label, store: await store(p, ids), screen: await screen(p, ids), caret: await caret(p), undo: await undoState(p), agree: await agree(p, ids) }
  console.log('READ', label, J(o)); return o
}
/* a man's row box selector, by his name on the row, among rows of the section */
export async function boxSel(p, name, f, nth = 0) {
  const k = await p.evaluate(([n, f, nth]) => {
    const s = document.querySelector('#sbBoard > [data-secmove$=".unav"]')
    const rows = [...s.querySelectorAll('[data-inprow]')].filter(r => [...r.querySelectorAll('.seat [data-person] .nm')].some(e => e.textContent.trim() === n))
    const r = rows[nth]; return r ? r.querySelector(`[data-ifld$=".${f}"]`)?.getAttribute('data-ifld') : null
  }, [name, f, nth])
  if (!k) throw new Error(`no ${f} box on ${name}'s row`)
  return `#schedBoard [data-ifld="${k}"]`
}
export const rowSel = async (p, name, nth = 0) => (await boxSel(p, name, 'str', nth)).replace(/\[data-ifld="(.+)\.str"\]/, '[data-inprow="$1"]')
/* press a control as a person would; on a phone a picture within ~100ms of the lift, then the settled one */
export async function pressAt(w, sel, picName) {
  const l = w.page.locator(sel).first()
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (w.tap) {
    await l.tap()
    if (picName) await w.page.screenshot({ path: `${L.OUT}/${String(++picN).padStart(3, '0')}-${picName}-lift.png`, scale: 'css' }).catch(() => {})
    await sleep(650)
  } else { await l.click(); await sleep(250) }
}
export async function typeIn(w, sel, value, key = 'Tab', picName) {
  const l = w.page.locator(sel).first()
  await l.evaluate(el => el.scrollIntoView({ block: 'center' }))
  await pressAt(w, sel, picName)
  await w.page.keyboard.press('Control+A')
  if (value === '') await w.page.keyboard.press('Delete'); else await w.page.keyboard.type(value)
  if (key) await w.page.keyboard.press(key)
  await sleep(650)
}
export async function pic(w, name, sels = ['#sbBoard > [data-secmove$=".unav"]']) {
  const f = `${String(++picN).padStart(3, '0')}-${name}.png`
  const inView = await w.page.evaluate(s => { const e = document.querySelector(s); if (!e) return true; const r = e.getBoundingClientRect(); return r.bottom > 40 && r.top < innerHeight - 40 }, sels[0])
  if (!inView) await w.page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'start' }), sels[0])
  const clip = await L.boxOf(w.page, sels, 8)
  await w.page.screenshot({ path: `${L.OUT}/${f}`, ...(clip ? { clip } : {}) })
  return f
}
export async function reload(w) {
  await sleep(1200)
  await w.page.reload(); await w.page.waitForFunction(() => document.querySelector('#vWeek .day') || document.querySelector('#luser'))
  await w.page.addStyleTag({ content: L.NOMOTION }); await sleep(600)
  if (await w.page.locator('#luser').isVisible().catch(() => false)) { console.log('reload: sign-in asked again'); await L.signIn(w, 'ad') }
}
/* tap away: on the desk the page's corner; on the phone the blank middle of the Unavailable heading (the corner is the
   Board's own Undo on a phone) */
export const away = async w => {
  if (w.tap) {
    const b = await w.page.evaluate(() => { const h = document.querySelector('#sbBoard > [data-secmove$=".unav"] .sb-ph'); let r = h.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 10) { h.scrollIntoView({ block: 'center' }) } r = h.getBoundingClientRect(); return { x: r.left + r.width * 0.5, y: r.top + r.height / 2 } })
    console.log('away: tap at', Math.round(b.x), Math.round(b.y), 'which is', await w.page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className : 'none' }, [b.x, b.y]))
    await w.page.touchscreen.tap(b.x, b.y)
  } else await w.page.mouse.click(3, 3)
  await sleep(700)
}
export const note = p => L.shownToast(p)
/* the fixture: LL for the people, 08:00–10:00, Wed 15 Jul, through the Inputs page's window */
export async function fixture(w, people = [L.RANGER, L.HEX], spec = {}) {
  const before = await L.ids(w.page)
  const iid = await L.fileInput(w, TAG, L.WED, { type: 'LL', people, from: '08:00', to: '10:00', ...spec })
  if (!iid) throw new Error('fixture not filed; new ids ' + J((await L.ids(w.page)).filter(x => !before.includes(x))))
  return iid
}
