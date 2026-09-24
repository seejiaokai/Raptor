/* THE EXAMPLE for [AMEND-LOAD-FILING] (25 Sep 26, his ask about question 7: "can u explain with examples or mock
   ups?"). Pictures of the REAL app (the production build, the everything-week), the same flow the re-test walked in
   w4-10-reaccept.mjs, cropped to the three things that matter — the day's head (version, what is waiting), the
   appointment's row on the ground programme, and the request's own row under Personal Inputs:
     1. Hex files a dentist appointment for Tuesday (published). It lands on the day; AL1 publishes it.
     2. The scheduler takes it off (Undo on the request): the row leaves the day, the request reads removed.
     3. He changes his mind and loads AL1 back onto the working copy: the row comes back from AL1 — but the request
        still reads removed, and the day says it differs from AL1 (the question: should the load put it back too?).
   The proposal's result is picture 1: the day exactly as AL1 went out.
   Usage, with the build served on :4173:  node mk-load-input.mjs desktop  |  node mk-load-input.mjs phone */
import { mkdirSync } from 'node:fs'
const w = process.argv[2] || 'desktop'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/load-input'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w4-lib.mjs')
const { STATE, PHONE, DESK, editWeek, board, closeBoard, openInputs, head, signDay, publishAL, clearToast, toastNow, fileInput, planMenuItems } = L
/* opened at the phone's own density (3x) so its pictures are sharp on a phone; w2-lib's opener takes a density */
const { openHi } = await import('./w2-lib.mjs')
const { browser, page, errors } = await openHi({ ...(w === 'phone' ? { ...PHONE, height: 1400 } : { ...DESK, height: 1200 }), state: STATE, dpr: w === 'phone' ? 3 : 1 })
const TUE = 1, REM = 'DENTIST'
const DAY = `#eWeek .day[data-day="${TUE}"]`
const state = () => page.evaluate(r => {
  const i = window.INPUTS.find(x => (x.remarks || '') === r); if (!i) return { acc: 'NO INPUT' }
  return { acc: i.acc || 'fresh', groundRows: window.DAYS[1].ground.filter(g => g.src && (g.rmks || '') === r).length }
}, REM)
async function acc(which) {              // a request's own buttons on the board: g = → Ground, x = Undo
  await board(page, TUE); await openInputs(page, TUE)
  const iid = await page.evaluate(r => String((window.INPUTS.find(x => (x.remarks || '') === r) || {}).iid || ''), REM)
  const b = page.locator(`#schedBoard [data-acc="${which}"][data-acck="${iid}"]:visible`).first()
  if (await b.count()) { await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(700) }
  await closeBoard(page)
}
/* one crop around an element, a little padding, the sticky top bar kept off it */
async function crop(name, finder) {
  const box = await page.evaluate(([DAY, REM, finder]) => {
    const d = document.querySelector(DAY); if (!d) return null
    const hasRem = e => ((e.innerText || e.value || '') + '').includes(REM)
    let el = null
    if (finder === 'head') el = d.querySelector('.day-head')
    if (finder === 'ground') {             // the ground-programme row carrying the appointment (outside Personal Inputs)
      const hit = [...d.querySelectorAll('input, textarea, span, div')].find(e => !e.closest('.sec-inp') && e.children.length === 0 && hasRem(e))
      el = hit && (hit.closest('.pl-row, .gp-row, .gr-row, .sb-arow') || hit.parentElement)
      if (!el) { const sec = [...d.querySelectorAll('.dsec, .sb-sec')].find(s => /ground/i.test((s.querySelector('h3, .sech, .dsech, .sb-sech') || {}).innerText || '')); el = sec }
    }
    if (finder === 'input') {              // the request's own row under Personal Inputs
      const sec = d.querySelector('.sec-inp, .pinp')
      const hit = sec && [...sec.querySelectorAll('*')].find(e => e.children.length === 0 && hasRem(e))
      el = hit ? (hit.closest('.pl-row, .sb-arow, .sbi-row') || hit.parentElement) : sec
    }
    if (!el) return null
    el.scrollIntoView({ block: 'center', inline: 'center' })
    const r = el.getBoundingClientRect(), dr = d.getBoundingClientRect()
    return { x: dr.left, y: r.top, w: dr.width, h: r.height, what: el.className }
  }, [DAY, REM, finder])
  if (!box) { console.log('NOTHING FOR', name); return null }
  await page.screenshot({ path: `${OUT}/${w}-${name}.png`, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y - 8), width: box.w, height: box.h + 16 } })
  console.log('shot', name, box.what)
  return box
}
async function step(n) {
  await editWeek(page); await page.waitForTimeout(300)
  const h = await head(page, TUE)
  const s = await state()
  console.log(`STEP ${n}`, JSON.stringify({ tag: h.tag, pending: h.pending || '(none)', input: s.acc, rowsOnDay: s.groundRows }))
  await crop(`${n}-head`, 'head'); await crop(`${n}-ground`, 'ground'); await crop(`${n}-input`, 'input')
}

/* 1 — the appointment lands and goes out in AL1 */
console.log('file', JSON.stringify(await fileInput(page, { person: 'rocky', type: 'Other', from: '2026-07-14', start: '10:00', end: '11:00', remarks: REM })))
await editWeek(page); await signDay(page, TUE); await clearToast(page)
console.log('publish', JSON.stringify(await publishAL(page, TUE)))
await step(1)
/* 2 — taken off */
await acc('x')
await step(2)
/* 3 — AL1 loaded back onto the working copy */
await editWeek(page)
await planMenuItems(page, TUE)
const row = page.locator('.wm[data-planpv="2026-07-14#1"]:visible').first()
if (await row.count()) {
  await row.click(); await page.waitForTimeout(700)
  for (let i = 0; i < 2; i++) {
    const ld = page.locator(`#eWeek [data-restore="${TUE}"]:visible`).first()
    if (!(await ld.count())) break
    await clearToast(page); await ld.click(); await page.waitForTimeout(700)
  }
  console.log('load', await toastNow(page))
} else console.log('NO AL1 IN THE PLANS MENU')
await step(3)
console.log('errors', JSON.stringify(errors))
await browser.close()
