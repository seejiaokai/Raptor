// A2 / A3 / W2.6 / W2.7 with ALL AVAIL placed through the board (mouse drag from the roster), PC and phone (mouse drag as SET-UP only; every tap is a real touch on the phone)
import { newWorld, openBoard, oilOn, sleep, close, shot, setField, fieldVal, tapSpec, tag, selCount, toast, press, VERSION } from './oeb-w2-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const size = process.env.SIZE || 'pc'
console.log(VERSION, 'cp', size)
const OUT = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/e324d8f6-0c85-4339-be37-1d188075a056/scratchpad/res'
mkdirSync(OUT, { recursive: true })
const slim = r => r && r.missing ? { MISSING: r.n } : r && { note: r.note, op: r.noteOp, sel: r.sel, selAfter: r.selAfter, fpSame: r.fpSame, hit: r.hit, wrap: r.tag && r.tag.wrap, title: r.tag && r.tag.title }
const w = await newWorld(size, 'sat')
const { page } = w
const r = {}
const keysOf = () => page.evaluate(() => [...document.querySelectorAll('#sbBoard .puck.allavail')].filter(p => p.getBoundingClientRect().width > 2).map(p => { let e = p, k = ''; for (let i = 0; i < 8 && e; i++, e = e.parentElement) { const f = e.querySelector('[data-bfld]'); if (f) { k = f.dataset.bfld; break } } return k }))
async function drag(targetSel, label) {
  const src = page.locator('#sbRoster .puck.allavail', { hasText: 'ALL AVAIL' }).first()
  const t = page.locator(targetSel).first(); await t.scrollIntoViewIfNeeded(); await sleep(400)
  await src.scrollIntoViewIfNeeded().catch(() => {})
  const a = await src.boundingBox(), b = await t.boundingBox()
  if (!a || !b || a.y < 0 || a.y > 800) return 'source not on screen: ' + JSON.stringify(a)
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + 30, a.y + 5, { steps: 4 }); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); await sleep(200)
  await page.mouse.up(); await sleep(800)
  return keysOf()
}
const countOf = async key => {
  const ok = await page.evaluate(k => { document.querySelectorAll('[data-w3]').forEach(e => e.removeAttribute('data-w3')); const f = document.querySelector(`#sbBoard [data-bfld="${k}"]`); let row = f; for (let i = 0; i < 6 && row; i++, row = row.parentElement) { const c = row.querySelector('.oilcount'); if (c) { c.setAttribute('data-w3', '1'); return true } } return false }, key)
  return ok
}
const winState = () => page.evaluate(() => {
  const x = document.querySelector('.availwin'); if (!x) return null
  const seats = [...x.querySelectorAll('.seat.oilpk')].map(s => [s.dataset.oilp || '', ['on', 'off', 'inert'].find(k => s.classList.contains(k)) || '?', s.title])
  return { head: x.querySelector('.win-h, .win-t, header')?.textContent.replace(/\s+/g, ' ').slice(0, 60), tabs: [...x.querySelectorAll('.win-tab')].map(t => t.textContent.replace(/\s+/g, ' ').trim()), nSeats: seats.length, inert: seats.filter(s => s[1] === 'inert').length, inertTitles: [...new Set(seats.filter(s => s[1] === 'inert').map(s => s[2].replace(/^\S+ — /, '')))], on: seats.filter(s => s[1] === 'on').length, tail: x.innerText.replace(/\s+/g, ' ').slice(-200) }
})
async function openWin(key, name) {
  if (!(await countOf(key))) return 'no count in row'
  const c = page.locator('[data-w3="1"]'); await c.scrollIntoViewIfNeeded(); await sleep(250)
  if (w.phone) await c.tap(); else await c.click()
  await sleep(800); await shot(w, `${name}-${size}-window`)
  return !!(await winState())
}
const closeWin = async () => { const x = page.locator('.availwin .win-x').first(); if (await x.count()) { if (w.phone) await x.tap(); else await x.click(); await sleep(400) } }
const tab = async i => { const t = page.locator('.availwin .win-tab').nth(i); if (w.phone) await t.tap(); else await t.click(); await sleep(400) }
async function seat(which, name) {
  const s = page.locator(`.availwin .seat.oilpk${which ? '.' + which : ''}`).filter({ visible: true }).first()
  if (!(await s.count())) return { none: true }
  await s.scrollIntoViewIfNeeded(); await sleep(200)
  const pid = await s.getAttribute('data-oilp'), title = await s.getAttribute('title')
  const before = await page.evaluate(() => document.querySelector('.availwin').innerText.replace(/\s+/g, ' ').slice(-170))
  await page.evaluate(() => { const t = document.querySelector('#toastEl'); if (t) t.textContent = '' })
  if (w.phone) await s.tap(); else await s.click()
  await sleep(w.phone ? 100 : 200); if (w.phone) await shot(w, `${name}-${size}-phone-right-after-tap`)
  await sleep(200)
  const t = await toast(page); await shot(w, `${name}-${size}-after`)
  const after = await page.evaluate(() => document.querySelector('.availwin').innerText.replace(/\s+/g, ' ').slice(-170))
  await sleep(1200)
  return { pid, title, note: t && t.text, sel: await selCount(page), footerBefore: before, footerAfter: after }
}
try {
  await openBoard(w)
  r.endCleared = await setField(w, 'ap:5.0.end', '')
  await oilOn(w, true)
  r.body = slim(await tapSpec(w, { cs: 'ALL AVAIL', key: 'ap:5.0', exact: true }, `a3-cp-body-noend-${size}`)); await sleep(2300)
  r.count = await openWin('ap:5.0.str', `a3-cp-noend-count-${size}`)
  if (r.count === true) { await tab(1); r.win = await winState(); await shot(w, `a3-cp-noend-${size}-oiltab`); r.inertSeat = await seat('inert', `a3-cp-noend-inert-seat`); r.after = await winState()
    await press(w, '#schedBoard .daybar label.lgmix').catch(() => {}); await sleep(600)
    r.seatUnderSwitch = await seat('', `a3-cp-noend-seat-switchon`) }
  await closeWin()
} catch (e) { r.error = e.message.slice(0, 300) }
console.log(JSON.stringify(r).slice(0, 4000))
writeFileSync(`${OUT}/cp-${size}.json`, JSON.stringify(r, null, 1))
await close(w)
