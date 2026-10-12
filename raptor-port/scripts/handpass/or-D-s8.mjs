// D8 — a member who is in an input he did not file: Ranger files for himself, Tally and Hex; become Hex
import { open, fileInput, shot, sleep, log, errs, browser, press, WIN, csId, inputsOf, inputsPages, swipeIn, toastBox, tapCdp, goWeek } from './or-D-lib.mjs'
const { ctx, page } = await open({ who: 'us', pass: 'us' })
const TITLE = 'Sat meeting'
const f = await fileInput(page, { type: 'Meeting', people: ['Ranger', 'Tally', 'Hex'], from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '10:00'], title: TITLE, oil: 'yes' })
const iid = f[0].iid
log('D8 Ranger filed:', JSON.stringify(f))
// become Hex, in place
const hex = await csId(page, 'Hex')
await page.evaluate(id => { window.raptorMe(id); window.raptorRole('member') }, hex); await sleep(600)
log('D8 now Hex: INPUTS people =', JSON.stringify((await inputsOf(page, TITLE))[0].people))

/* the member's surfaces for the input: View-only Sched's Sat row, the Inputs pages */
async function viewRow() {
  await page.evaluate(() => window.go('viewsched')); await sleep(900)
  return page.evaluate(t => {
    const D = [...document.querySelectorAll('#page-viewsched .day:not(.peek), #vWeek .day:not(.peek)')]
    const out = []
    D.forEach((d, i) => { [...d.querySelectorAll('.pl-row')].forEach(r => { const nm = (r.querySelector('.nm .ntx, .nm') || {}).textContent || ''; if (nm.toUpperCase().includes(t.toUpperCase())) out.push({ day: i, names: [...r.querySelectorAll('.puck .nm')].map(n => n.textContent.trim()), text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) }) }) })
    return out
  }, TITLE)
}
log('D8 View-only Sched (as Hex) before:', JSON.stringify(await viewRow()))
const p0 = await inputsPages(page, iid, { iso: '2026-07-18', title: TITLE, win: false, picDay: 'D8-01-before' })
log('D8 Inputs pages (as Hex) before:', JSON.stringify(p0))

// open the input's window from the day's card
await page.evaluate(() => window.go('inputs')); await sleep(500)
if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await press(page.locator('#inCalBtn')); await sleep(300) }
await page.locator('[data-icday="2026-07-18"]').tap({ position: { x: 8, y: 8 } }); await sleep(600)
await page.locator(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`).first().tap(); await sleep(900)
await page.locator(WIN).waitFor()
const readWin = () => page.evaluate(sel => {
  const w = document.querySelector(sel); const r = w.getBoundingClientRect()
  const fields = [...w.querySelectorAll('input, select, textarea')].map(e => (e.id || e.type) + ':' + (e.disabled ? 'disabled' : e.readOnly ? 'readonly' : 'EDITABLE') + ':' + (e.value || '').slice(0, 14))
  const btns = [...w.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width).map(b => (b.id || b.getAttribute('data-testid') || '') + '|' + b.innerText.replace(/\s+/g, ' ').trim().slice(0, 30) + (b.disabled ? '|disabled' : ''))
  return { rect: [r.x, r.y, r.width, r.height].map(Math.round), title: (w.querySelector('.airpop-head, .win-head, h2, b') || {}).innerText, pickerPucks: w.querySelectorAll('[data-pp]').length, severalToggle: !!w.querySelector('[data-testid="pp-several"]'), placeholders: w.querySelectorAll('[data-ph]').length, namedInWindow: [...w.querySelectorAll('[data-pp][aria-pressed="true"], .pp-chip, .pp-readonly .puck')].map(b => b.innerText.replace(/\s+/g, ' ').trim()), fields, btns, text: w.innerText.replace(/\s+/g, ' ').trim().slice(0, 700) }
}, WIN)
const w0 = await readWin()
log('D8 Hex opens the input window:', JSON.stringify(w0))
await shot(page, 'D8-02-window-top')
await page.evaluate(sel => { const w = document.querySelector(sel); w.querySelectorAll('*').forEach(e => { if (e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY)) e.scrollTop = e.scrollHeight }) }, WIN); await sleep(1500)
const w1 = await readWin()
log('D8 window scrolled down: buttons =', JSON.stringify(w1.btns), '| text tail =', w1.text.slice(-260))
await shot(page, 'D8-03-window-bottom')
log('D8 OIL line words:', JSON.stringify(await page.evaluate(sel => { const w = document.querySelector(sel); return [...w.querySelectorAll('*')].filter(e => /OIL/.test(e.textContent || '') && e.children.length < 3 && (e.textContent || '').length < 200).map(e => e.tagName + ':' + e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 8) }, WIN)))
log('D8 any "Change" control in the window:', JSON.stringify(await page.evaluate(sel => [...document.querySelector(sel).querySelectorAll('button, a, [role=button]')].filter(b => /change/i.test(b.innerText)).map(b => b.innerText.trim()), WIN)))
// Take me out
const out = page.locator(`${WIN} button`, { hasText: /take me out/i }).first()
log('D8 "Take me out" present:', await out.count())
if (await out.count()) {
  await out.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(3500)
  await out.tap(); await sleep(900)
  log('D8 after Take me out: note =', JSON.stringify(await toastBox(page)), '| window still open:', await page.locator(WIN).count(), '| question:', await page.evaluate(sel => { const w = document.querySelector(sel); return w ? w.innerText.replace(/\s+/g, ' ').slice(-200) : null }, WIN))
  await shot(page, 'D8-04-after-take-me-out')
  // a confirm inside the window?
  const conf = page.locator(`${WIN} button`, { hasText: /^(Take me out|Yes|Confirm|Leave)/i })
  log('D8 the question inside the window:', await page.evaluate(sel => { const t = document.querySelector(sel).innerText; const m = t.match(/Take yourself out[^]*?Stay in/); return m ? m[0].replace(/s+/g, " ") : null }, WIN)); await shot(page, "D8-04b-question")
  await sleep(2500); await page.locator(`${WIN} button`, { hasText: /^Take me out$/ }).last().tap(); await sleep(900)
  log("D8 after confirming: note =", JSON.stringify(await toastBox(page)), "| window open:", await page.locator(WIN).count())
}
if (await page.locator(WIN).count()) { await press(page.locator('#inpEditCancel')).catch(() => {}); await sleep(400) }
log('D8 INPUTS (Hex out?):', JSON.stringify((await inputsOf(page, TITLE)).map(r => r.people)))
log('D8 View-only Sched after:', JSON.stringify(await viewRow()))
const p1 = await inputsPages(page, iid, { iso: '2026-07-18', title: TITLE, win: true, picDay: 'D8-05-after' })
log('D8 Inputs pages after:', JSON.stringify(p1))
// Undo as Hex
await page.evaluate(() => window.go('inputs')); await sleep(500)
const ub = page.locator('#undoBtn')
log('D8 Undo button:', JSON.stringify({ title: await ub.getAttribute('title'), disabled: await ub.isDisabled() }))
await ub.tap(); await sleep(900)
log('D8 after Undo: note =', JSON.stringify(await toastBox(page)), '| INPUTS people =', JSON.stringify((await inputsOf(page, TITLE)).map(r => r.people)))
log('D8 View-only Sched after Undo:', JSON.stringify(await viewRow()))
const p2 = await inputsPages(page, iid, { iso: '2026-07-18', title: TITLE, win: false, picDay: 'D8-06-undone' })
log('D8 Inputs pages after Undo:', JSON.stringify(p2))
log('D8 errs', errs)
await ctx.close(); await browser.close()
