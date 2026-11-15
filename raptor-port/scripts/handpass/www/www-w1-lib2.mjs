/* www w1 helpers 2: Leave War, sign and publish, the day head. Imports www-w1-lib.mjs */
export * from './www-w1-lib.mjs'
import { X, sleep, L, nrm } from './www-w1-lib.mjs'

const MONTH3 = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export async function lwOpen(w, iso) {
  const page = w.page
  await L.go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 })
  await sleep(600)
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await sleep(300) }
  const m = page.locator(`[data-testid="month-${MONTH3[+iso.slice(5, 7) - 1]}"]:visible`).first()
  if (await m.count()) { await m.click(); await sleep(900) }
  await page.locator(`[data-testid="head-${iso}"]`).waitFor({ state: 'attached', timeout: 8000 }).catch(() => {})
  await sleep(400)
}
/** a man's Leave War cell on a date: its drawn text, class and the box's width */
export async function lwCellRead(w, person, iso) {
  return w.page.evaluate(([p, d]) => {
    const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
    if (!c) return null
    const r = c.getBoundingClientRect()
    return { text: (c.innerText || '').replace(/\s+/g, ' ').trim(), cls: String(c.className).slice(0, 80), w: Math.round(r.width) }
  }, [person, iso])
}
/** sign four, publish the day or the amendment (copied from rcb2-w1-lib) */
export async function signAndPublish(w, di) {
  const page = w.page
  const r0 = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${r0} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (!opts.length) { out[role] = 'NO NAMES'; continue }
    await sel.selectOption(opts[0]); await sleep(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  let which = null
  for (const attr of ['data-beak', 'data-alpub']) {
    const b = page.locator(`${r0} [${attr}="${di}"]:visible`).first()
    if (await b.count()) { which = attr; if (await b.isDisabled()) return { pressed: false, why: 'disabled ' + (await b.getAttribute('title')), signs: out }
      await b.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await b.tap(); else await b.click(); await sleep(900); break }
  }
  if (!which) return { pressed: false, why: 'no publish button', signs: out }
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await sleep(900) }
  return { pressed: true, which, signs: out }
}
/** the day's head (tag, pending, buttons, signs) on the board or week */
export async function head(w, di) {
  const page = w.page
  const r0 = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  return page.evaluate(([r, i]) => {
    const scope = r === '#schedBoard' ? document.querySelector('#schedBoard') : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const q = s => scope.querySelector(s)
    const btn = s => { const b = q(s); return b ? { text: b.innerText.trim(), disabled: !!b.disabled } : null }
    return { notYet: /Not yet signed/i.test(scope.innerText), tag: ((q('.verchip') || {}).innerText || '').replace(/\s+/g, ' ').trim(), pending: ((q('.dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim(),
      beak: btn(`[data-beak="${i}"]`), alpub: btn(`[data-alpub="${i}"]`), signState: ((q('.so-state') || {}).innerText || '').replace(/\s+/g, ' ').trim(),
      signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex]?.text || '') }
  }, [r0, di])
}
export async function satFixture(w, { msn = 'OIL FLT', to = '12:00', ld = '' } = {}) {
  await X.board(w, X.SAT)
  return X.flight(w, X.SAT, to, ld, 'bane', { msn })
}
