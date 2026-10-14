/* W3 walker's helpers (14 Oct 26) — small windows' heads, the Inputs calendar, filing an input. Nothing here edits the app. */
import * as L from '../../dl-lib.mjs'
export { L }
export const sleep = L.sleep
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

/** go to the Inputs page, calendar (month) view, on the month holding `iso` */
export async function inputsCal(w, iso) {
  const p = w.page
  await L.go(w, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await w.press('#inCalBtn')
  await p.waitForSelector('#inpCal')
  for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    await w.press(at < want ? '#icNext' : '#icPrev')
  }
  console.log('   inputs calendar on', (await p.locator('#inpCal .ic-mon').innerText()).trim())
}

/** open a day's window on the Inputs calendar and its "+ Input" form */
export async function openAdd(w, iso) {
  const p = w.page
  await p.locator(`[data-icday="${iso}"]`).focus()
  await p.keyboard.press('Enter')
  await p.waitForSelector('[data-testid="win-inputsday"]')
  await w.press('#icPopAdd')
  await p.waitForSelector('#inpEditPop #inpEditType')
}

/** fill the open "+ Input" form: type, person, dates (a day or a span through the form's own calendar), times */
export async function fillForm(w, { type, person = 'bane', start, end, allday = false, title, remarks }) {
  const p = w.page
  await p.selectOption('#inpEditPop #inpEditType', type)
  if (person) await p.selectOption('#inpEditPop #inpEditPerson', person)
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (await ad.count()) {
    const on = await ad.isChecked()
    if (allday !== on) await ad.click()
  }
  if (!allday && start) { await p.fill('#inpEditPop #inpEditStart', start); await p.fill('#inpEditPop #inpEditEnd', end || '12:00') }
  if (title && await p.locator('#inpEditPop #inpEditOwnTitle').count()) await p.fill('#inpEditPop #inpEditOwnTitle', title)
  if (remarks && await p.locator('#inpEditPop #inpEditRmk').count()) await p.fill('#inpEditPop #inpEditRmk', remarks)
}

/** measure a small window's head: edges of the head, the ✕ and the title's words (Range), overlaps */
export const headOf = (w, scope) => w.page.evaluate(sel => {
  let root = document.querySelector(sel)
  if (!root) return { error: 'no window for ' + sel }
  if (!root.matches('.airpop-head, .win-bar, .fw-head') && !root.querySelector('.airpop-head, .win-bar, .fw-head')) root = root.closest('.airpop') || root
  const HS = '.airpop-head, .win-bar, .fw-head'
  const head = root.matches(HS) ? root : root.querySelector(HS)
  if (!head) return { error: 'no head in ' + sel }
  const r = n => Math.round(n * 10) / 10
  const hr = head.getBoundingClientRect(), x = head.querySelector('.x, .win-x'), xr = x ? x.getBoundingClientRect() : null
  const kids = [...head.children].map(k => { const q = k.getBoundingClientRect(); return { tag: k.tagName.toLowerCase() + (k.className ? '.' + String(k.className).split(' ')[0] : ''), text: (k.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), l: r(q.left), r: r(q.right), t: r(q.top), b: r(q.bottom) } })
  const b = head.querySelector('b, .win-ttl'); let tr = null
  if (b) { const g = document.createRange(); g.selectNodeContents(b); const q = g.getBoundingClientRect(); tr = { l: r(q.left), r: r(q.right) } }
  /* overlaps among the head's children that have a box */
  const boxed = kids.filter(k => k.r > k.l && k.b > k.t), over = []
  for (let i = 0; i < boxed.length; i++) for (let j = i + 1; j < boxed.length; j++) {
    const a = boxed[i], c = boxed[j]
    if (a.l < c.r - 0.5 && c.l < a.r - 0.5 && a.t < c.b - 0.5 && c.t < a.b - 0.5) over.push(`${a.tag}�-${c.tag}`)
  }
  return { cls: root.className, headL: r(hr.left), headR: r(hr.right), headT: r(hr.top), headW: r(hr.width), xR: xr ? r(xr.right) : null, xL: xr ? r(xr.left) : null, xT: xr ? r(xr.top) : null,
    xGap: xr ? r(hr.right - xr.right) : null, titleR: tr ? tr.r : null, titleToX: xr && tr ? r(xr.left - tr.r) : null, kids, over, vw: innerWidth, title: b ? b.textContent.trim().slice(0, 60) : '' }
}, scope)

/** verdict line for a head: ✕ within 20 px of the head's right edge, no overlaps */
export function judgeHead(h, extra = true) {
  if (h.error) return { ok: false, saw: h.error }
  const saw = `head ${h.headL}–${h.headR} (${h.headW} wide); ✕ ${h.xL}–${h.xR}, ${h.xGap}px inside the head's right edge; title "${h.title}" ends ${h.titleR}, ${h.titleToX}px before the ✕; overlaps: ${h.over.length ? h.over.join(',') : 'none'}; children: ${h.kids.map(k => `${k.tag}[${k.l}-${k.r}]`).join(' ')}`
  return { ok: h.xGap != null && h.xGap <= 20 && h.xGap >= -0.5 && h.over.length === 0 && extra, saw }
}

export const rowOut = (surface, key, expected, saw, ok) => L.row(surface, key, expected, saw, ok ? 'PASS' : 'FAIL')
export const nw = (surface, key, expected, why) => L.row(surface, key, expected, why, 'NOT WALKED')

/** a part of a script: when its own step cannot act, it is written down as NOT WALKED and the rest still run */
export async function part(w, surface, key, expected, fn) {
  try { await fn() } catch (e) {
    const why = 'the script could not act: ' + String(e && e.message || e).split(String.fromCharCode(10))[0].slice(0, 220)
    console.log('   !! ' + surface + ' ' + key + ' - ' + why)
    L.row(surface, key, expected, why, 'NOT WALKED')
    try { await w.page.screenshot({ path: L.SHOTS + '/notwalked-' + Date.now() + '.png' }) } catch {}
  }
}
