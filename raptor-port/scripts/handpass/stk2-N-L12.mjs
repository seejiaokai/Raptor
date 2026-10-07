import * as K from './stk2-N-klib.mjs'
const { L, W, H } = K
const TYPING = '[data-txt],[data-bfld],[data-inp],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
const size = process.env.K_SIZE || 'desk', phone = size === 'phone'
const { browser, p, errors } = await H.world({ who: 'a', phone })
await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(700)

const boxes = (scope) => p.evaluate(([sc, TY]) => {
  const root = document.querySelector(sc); if (!root) return []
  return [...root.querySelectorAll(TY)].filter(e => e.offsetParent !== null && ((e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true'))
    .map(e => e.dataset.txt || e.dataset.bfld || e.dataset.inp || e.dataset.ifld || e.dataset.atime || e.dataset.area || e.dataset.bombs || e.dataset.itline || e.tagName)
}, [scope, TYPING])
const focusDesc = () => p.evaluate(() => {
  const a = document.activeElement
  if (!a || a === document.body || a === document.documentElement) return { kind: 'nothing - the page body' }
  const r = a.getBoundingClientRect()
  return { kind: a.tagName.toLowerCase() + (a.getAttribute('role') ? '[' + a.getAttribute('role') + ']' : '') + (a.type ? ':' + a.type : ''), key: a.dataset.txt || a.dataset.bfld || a.dataset.inp || a.dataset.atime || a.id || '', words: (a.innerText || a.value || a.getAttribute('aria-label') || a.title || '').replace(/\s+/g, ' ').trim().slice(0, 40), cls: String(a.className).slice(0, 40), inDay: (a.closest('.day') || { dataset: {} }).dataset.day ?? null, inBoard: !!a.closest('#schedBoard'), top: Math.round(r.top), left: Math.round(r.left) }
})
async function focusNth(scope, which) {  // real click on the first/last editable box of the scope
  const idx = await p.evaluate(([sc, TY, w]) => {
    const root = document.querySelector(sc)
    const l = [...root.querySelectorAll(TY)].filter(e => e.offsetParent !== null && ((e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true'))
    const e = w === 'first' ? l[0] : l[l.length - 1]
    document.querySelectorAll('[data-k12]').forEach(x => x.removeAttribute('data-k12'))
    e.setAttribute('data-k12', '1'); return l.length
  }, [scope, TYPING, which])
  const el = p.locator('[data-k12="1"]').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(250)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(300)
  return idx
}
async function tabAfter(label, key = 'Tab') {
  const out = {}
  await p.keyboard.press(key)
  out.t0 = await focusDesc()
  await K.sleep(500)
  out.t500 = await focusDesc()
  const sc = await p.evaluate(() => [Math.round(scrollX), Math.round(scrollY)])
  out.scroll = sc
  return out
}
const say = f => JSON.stringify(f)
/* ---- (a) the week, nothing changed ---- */
const list = await boxes('#eWeek .day[data-day="0"]')
console.log('Mon boxes', list.length, 'first', list[0], 'last', list[list.length - 1])
const n = await focusNth('#eWeek .day[data-day="0"]', 'last')
const lastNow = await focusDesc()
const pcA0 = await K.pic(p, `L12a-${size}-last-box-focused`)
const a1 = await tabAfter('a1')
const pcA1 = await K.pic(p, `L12a-${size}-after-first-tab`)
const a2 = await tabAfter('a2')
const pcA2 = await K.pic(p, `L12a-${size}-after-second-tab`)
K.note('L-12', `a-week-${size}`, `Edit Schedule, Monday (${list.length} open boxes; last is ${list[list.length - 1]}), nothing changed: real click into the last box, Tab, half a second later, Tab again`,
  `last box focused: ${say(lastNow)}; after the Tab: ${say(a1.t0)}; half a second later: ${say(a1.t500)}; after another Tab: ${say(a2.t0)}, then ${say(a2.t500)}`, 'RECORD', [pcA0, pcA1, pcA2])
/* ---- (d) Shift+Tab from the first box ---- */
await focusNth('#eWeek .day[data-day="0"]', 'first')
const firstNow = await focusDesc()
const d1 = await tabAfter('d1', 'Shift+Tab')
const pcD = await K.pic(p, `L12d-${size}-after-shift-tab`)
const d2 = await tabAfter('d2', 'Shift+Tab')
K.note('L-12', `d-week-${size}`, `Edit Schedule, Monday: real click into the day's first box (${list[0]}), Shift+Tab, then once more`,
  `first box focused: ${say(firstNow)}; after Shift+Tab: ${say(d1.t0)} then ${say(d1.t500)}; after a second Shift+Tab: ${say(d2.t0)}`, 'RECORD', [pcD])
await p.evaluate(() => document.activeElement && document.activeElement.blur())
/* ---- (b) change one box earlier in the day, then Tab to the end ---- */
// change the first formation's callsign remarks earlier in the day: the Monday Wave 1 'VL' remarks ... use the day note's neighbour: the common programme remark
const edit = p.locator('#eWeek [data-txt="ff:0.0.0.cs"]').first()
await edit.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(250)
const eb = await edit.boundingBox()
await p.mouse.click(eb.x + eb.width / 2, eb.y + eb.height / 2); await K.sleep(200)
await p.keyboard.press('Control+A'); await p.keyboard.type('VK', { delay: 20 })
const pre = await p.evaluate(() => window.ELOG.rows.length)
// Tab to the end of the day
let count = 0, lastIn = null
for (let i = 0; i < 400; i++) {
  await p.keyboard.press('Tab'); await K.sleep(20); count++
  const f = await focusDesc()
  if (f.inDay !== '0') { lastIn = f; break }
}
const b0 = await focusDesc()
await K.sleep(500)
const b500 = await focusDesc()
const post = await p.evaluate(() => ({ elog: window.ELOG.rows.length, cs: window.DAYS[0].waves[0].formations[0].cs }))
const pcB = await K.pic(p, `L12b-${size}-after-end`)
const b2 = await tabAfter('b2')
K.note('L-12', `b-week-${size}`, `Edit Schedule, Monday: changed the first formation's callsign VL -> VK, then Tab ${count} times to the end of the day (nothing else typed)`,
  `focus at the end of the run: ${say(b0)}; half a second later: ${say(b500)}; callsign now ${post.cs}; edit-history rows ${pre}->${post.elog}; one more Tab: ${say(b2.t0)} / ${say(b2.t500)}`, 'RECORD', [pcB])

/* ---- (c) the Scheduler Board ---- */
await W.boardOn(p, 0); await L.sleep(600)
const bl = await boxes('#schedBoard')
console.log('board boxes', bl.length, bl[0], bl[bl.length - 1])
await focusNth('#sbBoard', 'last')
const bLast = await focusDesc()
const pcC0 = await K.pic(p, `L12c-${size}-board-last-box`)
const c1 = await tabAfter('c1')
const pcC1 = await K.pic(p, `L12c-${size}-board-after-tab`)
const c2 = await tabAfter('c2')
K.note('L-12', `c-board-nochange-${size}`, `Scheduler Board (Mon): ${bl.length} open boxes; real click into the last (${bl[bl.length - 1]}), Tab, half a second later, Tab again`,
  `last focused: ${say(bLast)}; after Tab: ${say(c1.t0)}; half a second later: ${say(c1.t500)}; after another Tab: ${say(c2.t0)} / ${say(c2.t500)}`, 'RECORD', [pcC0, pcC1])
// (c) with a change earlier
const bc = p.locator('#schedBoard [data-bfld="ff:0.0.0.cs"]').first()
await bc.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(200)
const bb = await bc.boundingBox()
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await K.sleep(200)
await p.keyboard.press('Control+A'); await p.keyboard.type('VL', { delay: 20 })
let cnt2 = 0
for (let i = 0; i < 400; i++) { await p.keyboard.press('Tab'); await K.sleep(20); cnt2++; const f = await focusDesc(); if (!f.inBoard) break }
const e0 = await focusDesc(); await K.sleep(500); const e500 = await focusDesc()
const pcC2 = await K.pic(p, `L12c-${size}-board-change-end`)
K.note('L-12', `c-board-change-${size}`, `Scheduler Board (Mon): changed the first formation's callsign VK -> VL, then Tab ${cnt2} times to the end`,
  `focus at the end: ${say(e0)}; half a second later: ${say(e500)}`, 'RECORD', [pcC2])
// (d) on the board: Shift+Tab from the first box
await focusNth('#sbBoard', 'first')
const bf = await focusDesc()
const bd1 = await tabAfter('bd', 'Shift+Tab')
K.note('L-12', `d-board-${size}`, `Scheduler Board (Mon): real click into the first box (${bl[0]}), Shift+Tab`, `first focused: ${say(bf)}; after Shift+Tab: ${say(bd1.t0)} then ${say(bd1.t500)}`, 'RECORD', [])
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
