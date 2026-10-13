// W2 scenarios 4, 5, 6, 8 (+ the pictures of 14 for 4, 5, 6) — one context per size, a reload between the parts. VERSION 1
// usage: node s48.mjs desktop|phone
import { openWorld, tools, adminCategory, adminBack, login } from './lib.mjs'
const WHICH = process.argv[2] || 'desktop'
console.log(`s48 VERSION 1 — ${WHICH}`)
const w = await openWorld(WHICH)
const { page, TOUCH } = w
const t = tools(w, `${WHICH}-s48`)
const today = t.addDays(0)
const month = today.slice(0, 7)

const dataText = () => page.locator('#admData').innerText()
const btn = async sel => page.locator(sel).first().evaluate(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), disabled: e.disabled || e.getAttribute('aria-disabled') === 'true' }))
const toast = () => page.evaluate(() => { const c = [...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.top > innerHeight * 0.6 && (e.innerText || '').trim() && e.children.length < 4 }); return c.map(e => e.innerText.trim().replace(/\s+/g, ' ')).join(' | ') })
async function openData() { await adminCategory(page, '^Data'); await page.waitForSelector('#admWipeDate') }
let lastToast = ''
async function diffPress(sel) {
  const before = (await dataText()).split('\n').map(s => s.trim()).filter(Boolean)
  await t.press(sel)
  await page.waitForTimeout(150)
  lastToast = await toast()
  const after = (await dataText()).split('\n').map(s => s.trim()).filter(Boolean)
  return { added: after.filter(l => !before.includes(l)), removed: before.filter(l => !after.includes(l)) }
}
async function reloadToData() {
  await page.reload()
  await page.waitForSelector('#luser', { timeout: 6000 }).then(() => login(page, 'ad', 'a')).catch(() => {})
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await openData()
}

await openData()
// ---------------- 4
await page.locator('#admWipeDate').scrollIntoViewIfNeeded()
const b0 = await btn('#admWipe'), d0 = await t.text('#admWipeDate')
console.log(`S4 before a date: button "${b0.text}" disabled=${b0.disabled}; date box "${d0.replace(/\s+/g, ' ')}"`)
await t.shot('s4-before-date')
// try pressing the disabled button (a script click is forced so a real press is attempted)
const nopress = await page.locator('#admWipe').click({ timeout: 2000 }).then(() => 'clicked').catch(e => 'could not be pressed (disabled)')
console.log('S4 pressing it before a date:', JSON.stringify(nopress).slice(0, 80))
await t.press('#admWipeDate')
const cA = await t.cardOnTop('Older than')
await t.shot('s4-older-calendar')
const first = `${cA.month}-01`
await t.pick(first)
await page.locator('#admWipeDate').scrollIntoViewIfNeeded()
const d1 = await t.text('#admWipeDate'), b1 = await btn('#admWipe')
console.log(`S4 date box after pick: "${d1.replace(/\s+/g, ' ')}" (${await t.val('#admWipeDate')}); button "${b1.text}" disabled=${b1.disabled}`)
await t.shot('s4-date-picked')
let r1 = await diffPress('#admWipe')
let b2 = await btn('#admWipe')
console.log(`S4 first press with ${first}: toast "${lastToast}"; new text ${JSON.stringify(r1)}; button now "${b2.text}"`)
await t.shot('s4-after-press-1')
let armedDate = first, rearmedNote = ''
if (/tap again|clear \d|armed/i.test(b2.text) || /\d/.test(b2.text.replace('…', ''))) rearmedNote = 'armed'
// if nothing there, try a later date to see whether any clutter exists
let armed = /tap again/i.test(b2.text)
if (!armed) {
  for (const off of [0, 1, 2]) {
    await t.press('#admWipeDate'); await t.cardOnTop('Older than (retry)')
    for (let i = 0; i < off + 1; i++) await t.press('[data-testid="dcal-next"]')
    const cm = await page.getAttribute('[data-testid="dcal"]', 'data-month')
    const dd = `${cm}-28`
    await t.pick(dd); armedDate = dd
    const r = await diffPress('#admWipe'); const bb = await btn('#admWipe')
    console.log(`S4 retry with ${dd}: toast "${lastToast}" ${JSON.stringify(r)}; button "${bb.text}"`)
    await t.shot(`s4-retry-${off}`)
    if (/tap again/i.test(bb.text)) { armed = true; break }
  }
}
if (armed) {
  const armText = (await btn('#admWipe')).text
  await t.shot('s4-armed')
  // pick ANOTHER date: expect the button reads Clear old clutter… again
  await t.press('#admWipeDate'); await t.cardOnTop('Older than (disarm)')
  const cm = await page.getAttribute('[data-testid="dcal"]', 'data-month')
  const other = `${cm}-15`
  await t.pick(other)
  const bd = await btn('#admWipe')
  console.log(`S4 armed text "${armText}" -> after picking ${other}: button "${bd.text}"`)
  await t.shot('s4-disarmed')
  t.rec('4', WHICH, /Clear old clutter/i.test(bd.text) ? 'PASS' : 'FAIL', `button disabled before a date=${b0.disabled}; after ${first}: "${b2.text}"; armed with ${armedDate}: "${armText}"; after picking another date: "${bd.text}"`, `${WHICH}-s48-s4-armed.png / s4-disarmed.png`)
} else {
  t.rec('4', WHICH, b0.disabled ? 'PASS' : 'FAIL', `button disabled before a date=${b0.disabled} ("${b0.text}"); pressed with ${first}: toast "${lastToast}", button "${b2.text}"; later dates tried, never armed`, `${WHICH}-s48-s4-after-press-1.png`)
}

// ---------------- 8 (the date picked above stays in the form; change the Period)
await page.selectOption('#admWipeMode', { label: 'A date range' }); await page.waitForTimeout(350)
await page.locator('#admWipeRun').scrollIntoViewIfNeeded()
const foot8 = await t.text('[data-testid="admWipeRun-foot"]').catch(() => '(no foot)')
const b8 = await btn('#admWipe')
const fits8 = await t.boxFits('#admWipeRun', '#admData', 'range calendar')
console.log(`S8 after switching to a date range: foot "${foot8.replace(/\s+/g, ' ')}"; button "${b8.text}" disabled=${b8.disabled}; month shown ${await page.getAttribute('[data-testid="admWipeRun"]', 'data-month').catch(() => '?')}`)
await page.locator('#admWipe').scrollIntoViewIfNeeded()
await t.shot('s8-range-from-older')
t.rec('8', WHICH, /to|\bone day\b|1 day/i.test(foot8) || foot8.includes(armedDate.slice(8)) ? 'RECORD' : 'RECORD', `date picked before: ${armedDate}; after changing Period: foot "${foot8.replace(/\s+/g, ' ')}", button "${b8.text}" disabled=${b8.disabled}`, `${WHICH}-s48-s8-range-from-older.png`)

// ---------------- 5
await page.selectOption('#admWipeMode', { label: 'A specific date' }); await page.waitForTimeout(350)
await page.locator('#admWipeDate').scrollIntoViewIfNeeded()
const lab5 = await page.evaluate(() => { const b = document.getElementById('admWipeDate'); const l = document.querySelector('label[for="admWipeDate"]'); const wrap = b.closest('.mfield, div'); return { label: l ? l.textContent.trim() : null, wrapText: wrap ? wrap.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) : null } })
const boxes5 = await page.evaluate(() => [...document.querySelectorAll('#admWipe, #admData button')].filter(b => b.id === 'admWipeDate' || b.id === 'admWipeDate2').length)
const v5 = await t.val('#admWipeDate'), tx5 = await t.text('#admWipeDate')
console.log(`S5 specific date: label ${JSON.stringify(lab5)}; date boxes in this block: ${boxes5}; box reads "${tx5.replace(/\s+/g, ' ')}" (${v5}); button ${JSON.stringify(await btn('#admWipe'))}`)
await t.shot('s5-specific')
await t.press('#admWipeDate'); await t.cardOnTop('A specific date')
await t.shot('s5-specific-calendar')
await t.closeCal()
t.rec('5', WHICH, /^Date$/i.test(lab5.label || '') ? 'PASS' : 'FAIL', `label "${lab5.label}"; wrap "${lab5.wrapText}"; one box (${boxes5} button id admWipeDate); reads "${tx5.replace(/\s+/g, ' ')}" (${v5})`, `${WHICH}-s48-s5-specific.png / s5-specific-calendar.png`)

// ---------------- 6 on a clean reload
await reloadToData()
await page.selectOption('#admWipeMode', { label: 'A date range' }); await page.waitForTimeout(350)
await page.locator('#admWipeRun').scrollIntoViewIfNeeded()
const calCard = await t.vis('[data-testid="dcal-card"]'), scrim = await t.vis('[data-testid="dcal-scrim"]')
const foot6a = await t.text('[data-testid="admWipeRun-foot"]')
const fits6 = await t.boxFits('#admWipeRun', '#admData', 'range calendar')
const secondBox = await page.evaluate(() => { const clutter = document.getElementById('admWipe'); const hist = document.getElementById('admLog'); return [...document.querySelectorAll('#admData button')].filter(b => /Pick a date/.test(b.innerText) && (b.compareDocumentPosition(clutter) & 4) !== 0 && (b.compareDocumentPosition(hist) & 4) !== 0).length })
console.log(`S6 clean range: foot "${foot6a.replace(/\s+/g, ' ')}"; floating card=${calCard} scrim=${scrim}; other "Pick a date" boxes in Data: ${secondBox}`)
await page.locator('#admWipe').scrollIntoViewIfNeeded()
await t.shot('s6-range-clean')
const bandInfo = async () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="admWipeRun-day-"]')].map(e => ({ d: e.getAttribute('data-testid').slice(-10), cls: e.className, bg: getComputedStyle(e).backgroundColor, aria: e.getAttribute('aria-pressed') || e.getAttribute('aria-selected') || '' })).filter(x => x.cls.replace(/dcal-day|\s/g, '') !== '' && /range|sel|start|end|band|picked|on/i.test(x.cls)))
const c6 = await page.getAttribute('[data-testid="admWipeRun"]', 'data-month')
console.log(`S6 range calendar month ${c6}`)
const m = c6
const A = `${m}-${m === today.slice(0, 7) ? '28' : '28'}`
// the range calendar's month is the current month; make a run from the 28th to 4th of next month
await t.press(`[data-testid="admWipeRun-day-${A}"]`)
const foot6b = await t.text('[data-testid="admWipeRun-foot"]')
console.log(`S6 after first tap ${A}: foot "${foot6b.replace(/\s+/g, ' ')}"`)
await page.locator('#admWipeRun').scrollIntoViewIfNeeded()
await t.shot('s6-one-tap')
await t.press('[data-testid="admWipeRun-next"]')
const nm = await page.getAttribute('[data-testid="admWipeRun"]', 'data-month')
const B = `${nm}-04`
await t.press(`[data-testid="admWipeRun-day-${B}"]`)
const foot6c = await t.text('[data-testid="admWipeRun-foot"]')
console.log(`S6 after second tap ${B} (month ${nm}): foot "${foot6c.replace(/\s+/g, ' ')}"; band days in this month: ${JSON.stringify((await bandInfo()).slice(0, 6))}`)
await t.shot('s6-run-month2')
await t.press('[data-testid="admWipeRun-prev"]')
console.log(`S6 back to month ${await page.getAttribute('[data-testid="admWipeRun"]', 'data-month')}; band days: ${JSON.stringify((await bandInfo()).slice(0, 6))}`)
await t.shot('s6-run-month1')
const b6 = await btn('#admWipe')
await page.locator('#admWipe').scrollIntoViewIfNeeded()
const r6 = await diffPress('#admWipe')
const b6b = await btn('#admWipe')
const toast6 = lastToast
console.log(`S6 button before "${b6.text}" disabled=${b6.disabled}; pressed: toast "${toast6}" ${JSON.stringify(r6)}; after "${b6b.text}"`)
await t.shot('s6-pressed')
// a tap on a new day starts over
await page.locator('#admWipeRun').scrollIntoViewIfNeeded()
const C = `${await page.getAttribute('[data-testid="admWipeRun"]', 'data-month')}-17`
await t.press(`[data-testid="admWipeRun-day-${C}"]`)
const foot6d = await t.text('[data-testid="admWipeRun-foot"]')
console.log(`S6 a new tap on ${C} after a finished run: foot "${foot6d.replace(/\s+/g, ' ')}"`)
await t.shot('s6-start-over')
const ok6 = /Tap the first day, then the last\./.test(foot6a) && !calCard && secondBox === 0 && foot6b === 'Wed 28 Oct 2026' && / to /.test(foot6c)
t.rec('6', WHICH, ok6 ? 'PASS' : 'CHECK', `before a tap: "${foot6a.replace(/\s+/g, ' ')}"; floating card=${calCard}; one tap: "${foot6b.replace(/\s+/g, ' ')}"; second tap: "${foot6c.replace(/\s+/g, ' ')}"; button "${b6.text}" -> pressed -> toast "${toast6}", button "${b6b.text}"; new tap starts over: "${foot6d.replace(/\s+/g, ' ')}"`, `${WHICH}-s48-s6-*.png`)

console.log('RESULTS', JSON.stringify(t.results, null, 1))
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
