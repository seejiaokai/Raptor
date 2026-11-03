// Publishing a day and reading what the schedule says of it — through the real controls (copied in shape from it-B-lib.mjs).
import * as L from './isr-A-lib.mjs'
const sleep = ms => new Promise(r => setTimeout(r, ms))
export async function closeBoard(page) {
  if (!(await page.locator('#schedBoard:visible').count())) return
  const x = page.locator('#sbDone:visible, #sbClose:visible').first()
  if (await x.count()) { await x.click(); await sleep(600) } else { await page.keyboard.press('Escape'); await sleep(500) }
}
export async function editWeek(page) { await closeBoard(page); if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(page, 'editsched') }
export async function showDay(page, di, surf = '#eWeek') {
  await page.evaluate(([s, i]) => {
    const d = document.querySelector(`${s} .day[data-day="${i}"]`)
    if (!d) return
    const sc = d.closest('.week') || d.parentElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0)
    window.scrollTo(0, 0)
  }, [surf, di])
  await sleep(350)
}
const pressDay = async (page, tap, attr, di) => {
  const r = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const b = page.locator(`${r} [${attr}="${di}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled: ' + (await b.getAttribute('title')) }
  const label = (await b.innerText()).trim()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (tap) await b.tap(); else await b.click()
  await sleep(900)
  return { pressed: true, label }
}
export async function signDay(page, di) {
  const r = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${r} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0]); await sleep(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return out
}
/* sign all four and publish (first issue, else an amendment) on the edit week */
export async function pubDay(page, tap, di) {
  await editWeek(page); await showDay(page, di)
  const sg = await signDay(page, di)
  let r = await pressDay(page, tap, 'data-beak', di), kind = 'ORIG'
  if (!r.pressed) { r = await pressDay(page, tap, 'data-alpub', di); kind = 'AL' }
  await sleep(500)
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await sleep(700) }
  return { sg, r, kind }
}
/* what the edit week says about day di */
export async function face(page, di) {
  await editWeek(page); await showDay(page, di)
  return page.evaluate(i => {
    const d = document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!d) return null
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    return { tag: t(d.querySelector('.verchip')), pend: [...d.querySelectorAll('.dpend:not(.dnew):not(.dchg)')].map(t), nys: t(d.querySelector('.nysmark')) }
  }, di)
}
export async function closeChg(page) {
  if (!(await page.locator('.chgwin:not([hidden])').count())) return
  const x = page.locator('.chgwin .win-x, .chgwin button[aria-label^="Close"]').first()
  if (await x.count()) { await x.click().catch(() => {}); await sleep(300) }
}
/* the changes window for day di, on its "To go out" tab: its text and its separate lines */
export async function toGoOut(page, di, pic) {
  await editWeek(page); await showDay(page, di)
  const b = page.locator(`#eWeek [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return { text: '(no pending button)', lines: [] }
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
  const tab = page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first()
  if (await tab.count()) { await tab.click(); await sleep(400) }
  const out = await page.evaluate(() => {
    const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return { text: '(window not found)', lines: [] }
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    const el = w.querySelector('.cw-out') || w
    const lines = [...el.querySelectorAll('[class*="cw-"], li, .chg-row, [data-chg]')].filter(e => e.children.length === 0 && t(e)).map(t)
    return { text: t(el), lines, html: el.innerHTML.slice(0, 1500) }
  })
  if (pic) await L.shot(page, pic[0], pic[1], pic[2])
  return out
}
