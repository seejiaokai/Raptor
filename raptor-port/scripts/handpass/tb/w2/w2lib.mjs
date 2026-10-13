/* W2 shared helpers: the passing notes, read straight after a gesture on the screen's own controls. */
import * as L from '../../dl-lib.mjs'
export { L }
export const sleep = L.sleep

/** the note on screen right now: its words, opacity and box */
export const toastNow = page => page.evaluate(() => {
  const t = document.getElementById('toastEl')
  if (!t) return null
  const cs = getComputedStyle(t), r = t.getBoundingClientRect()
  return { text: t.textContent, opacity: cs.opacity, box: { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, right: Math.round(r.right * 10) / 10, bottom: Math.round(r.bottom * 10) / 10 }, vw: innerWidth, vh: innerHeight, align: cs.textAlign }
})
/** wait up to ms for a showing note; returns the first reading with opacity 1 */
export async function toastShown(page, ms = 2500) {
  const end = Date.now() + ms
  let last = null
  while (Date.now() < end) {
    last = await toastNow(page)
    if (last && last.text && parseFloat(last.opacity) >= 0.99) return last
    await sleep(40)
  }
  return last
}
/* this build has no window.clearToast: wait for the note to fade out (opacity 0), up to 6 s */
export const clearToast = async page => {
  const end = Date.now() + 6000
  while (Date.now() < end) { const t = await toastNow(page); if (!t || !t.text || parseFloat(t.opacity) < 0.05) break; await sleep(150) }
  await sleep(150)
}

const closeBoardIf = async (w) => {
  const page = w.page
  if (await page.locator('#schedBoard:visible').count()) {
    const x = page.locator('#sbDone:visible, #sbClose:visible').first()
    if (await x.count()) await x.evaluate(e => e.click())
    else await page.keyboard.press('Escape')
    await sleep(600)
  }
}
export const closeBoard = closeBoardIf

/** Open the board of day di by the week's own "board" entry */
export async function openBoard(w, di) {
  const page = w.page
  const open = await page.evaluate(() => (document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? window.SBDAY : null))
  if (open === di) return
  if (open != null) await closeBoardIf(w)
  await L.go(w, 'editsched')
  const b = page.locator(`#eWeek [data-sbday="${di}"]`).first()
  await b.evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.waitForSelector('#schedBoard .sb-sec', { state: 'attached' })
  await sleep(500)
}
const rootSel = async page => (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
export async function signDay(page, di) {
  const r = await rootSel(page)
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${r} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (!opts.length) { out[role] = 'NO NAMES'; continue }
    await sel.selectOption(opts[0]); await sleep(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return out
}
/** press a day button by attribute on the current surface; returns the note read straight after */
export async function pressDay(w, attr, di) {
  const page = w.page
  const r = await rootSel(page)
  const b = page.locator(`${r} [${attr}="${di}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled: ' + (await b.getAttribute('title')) }
  const label = (await b.innerText()).trim()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await clearToast(page)
  if (w.phone) await b.tap(); else await b.click()
  const t = await toastShown(page)
  return { pressed: true, label, toast: t }
}
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const head = async (page, di) => {
  const r = await rootSel(page)
  return page.evaluate(([r, i]) => {
    const scope = r === '#schedBoard' ? document.querySelector('#schedBoard') : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const btn = s => { const b = scope.querySelector(s); return b ? { text: b.innerText.trim(), disabled: !!b.disabled, title: b.title } : null }
    return { tag: (scope.querySelector('.verchip') || {}).innerText || '', beak: btn(`[data-beak="${i}"]`), alpub: btn(`[data-alpub="${i}"]`), unpub: btn(`[data-unpub="${i}"]`) }
  }, [r, di])
}
