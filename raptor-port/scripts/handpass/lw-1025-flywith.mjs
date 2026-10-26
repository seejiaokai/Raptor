// "FLY WITH" AS IT IS TODAY (25 Oct 26) — his idea to rename it "Attach" (attached to another job or squadron). Two real
// pictures, nothing drawn: the Inputs page's window with "Fly with" picked, and the seeded "Fly with" (Mon 13 Jul) where it
// lands on Edit Schedule. Each picture is the element itself, so it shows only what the question is about (D1222).
// Usage (from raptor-port/): node scripts/handpass/lw-1025-flywith.mjs   [LW_PORT=4180]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/q7'
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const T = L.T
const w = await L.newCtx('phone')
const P = w.page
await L.signInPlain(w, 'admin')
await P.addStyleTag({ content: '#toastEl, .toast, .savestat, .saveband { visibility: hidden !important; }' })
/* 1 — the window with "Fly with" picked */
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
if (!(await L.vis(P, T('in-new')))) { await L.press(w, '#inListBtn'); await P.waitForTimeout(700) }
await L.press(w, T('in-new')); await P.waitForSelector(T('win-inputedit')); await P.waitForTimeout(500)
await P.locator('#inpEditPerson').selectOption({ label: 'Drifter' })
await P.locator('#inpEditType').selectOption('Fly with'); await P.waitForTimeout(400)
const rows = await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-k')].map(e => e.textContent).join(' · '))
console.log('window rows with Fly with:', rows)
await P.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputedit"]')
  const f = [...w.querySelectorAll('.inped-f')]
  const a = f.find(x => x.querySelector('#inpEditType')), b = f.find(x => x.querySelector('#inpEditRmk'))
  a.scrollIntoView({ block: 'start' })
  const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect()
  const d = document.createElement('div'); d.id = 'qclip'
  Object.assign(d.style, { position: 'fixed', left: `${r1.left - 8}px`, top: `${r1.top - 8}px`, width: `${r1.width + 16}px`, height: `${r2.bottom - r1.top + 16}px`, pointerEvents: 'none' })
  document.body.appendChild(d)
})
const box = await P.locator('#qclip').boundingBox()
await P.screenshot({ path: path.join(L.OUT, 'att-today-window-phone.png'), clip: box, scale: 'device' })
await P.keyboard.press('Escape'); await P.waitForTimeout(400)
/* 2 — where the seeded "Fly with" lands on Edit Schedule (Mon 13 Jul, day 0) */
await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1500)
const D = '#eWeek section.day[data-day="0"]'
if (await L.vis(P, `${D} [data-pitog="0"]`)) { await L.press(w, `${D} [data-pitog="0"]`); await P.waitForTimeout(600) }
const found = await P.evaluate(D => {
  const r = [...document.querySelectorAll(`${D} .pl-row`)].find(r => /fly with/i.test(r.innerText) || /keen for any wave/i.test(r.innerText))
  if (!r) return null
  r.closest('.sec')?.setAttribute('data-qsec', '1'); r.setAttribute('data-qrow', '1'); r.scrollIntoView({ block: 'center' })
  return { row: r.innerText.replace(/\s+/g, ' '), sec: r.closest('.sec')?.className }
}, D)
console.log('seeded Fly with on Edit Schedule:', JSON.stringify(found))
if (found) await P.locator('[data-qsec="1"]').screenshot({ path: path.join(L.OUT, 'att-today-schedule-phone.png'), scale: 'device' })
console.log('errors:', w.errs.slice(0, 4).join(' || ') || 'none')
await w.ctx.close(); await L.closeBrowser()
