// desk1: W1 (ALL AVAIL + Escape from each opener), W5b (the ring), W7 (Tab) — desktop 1536x864, Chromium. v1
import { launch, go, pic, cropPic, say, rec, state, press, bringIn, errors } from './wlib.mjs'
say('desk1 v1')
const { browser, page } = await launch('chromium', false, true)
await go(page, 'editsched')
say('availwin buttons present when open: checked in the run')
async function scenario(id, fn) { try { await fn() } catch (e) { rec(id, false, 'SCRIPT ERROR ' + String(e.message).split('\n')[0]) } }
const blur = () => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur() })
const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(350) }
const D0 = '#eWeek .day[data-day="0"]'
const chips = { programme: `${D0} [data-fill="a:0.0.+"] .oilcount`, sim: `${D0} [data-fill="s:0.amt.0.+"] .oilcount`, ground: `${D0} [data-fill="g:0.0.+"] .oilcount` }

async function openThenEsc(id, loc, pictag, { focusTab = false } = {}) {
  const start = await state(page)
  if (start.ava) { await esc(); }
  await blur()
  await press(page, loc, false)
  await page.waitForTimeout(500)
  const s1 = await state(page)
  const sent = await loc.getAttribute('data-oilsent')
  await pic(page, `w1-${pictag}-open`)
  if (focusTab) { const tab = page.locator('.availwin:not([hidden]) button').first(); await tab.focus(); }
  else await blur()
  const s1b = await state(page)
  await esc()
  const s2 = await state(page)
  await cropPic(page, `w1-${pictag}-closed`, loc, 120)
  const keysBack = await page.evaluate(sent => { const a = document.activeElement; return !!(a && a.classList.contains('oilcount') && a.dataset.oilsent === sent) }, sent)
  const ok = s1.ava && !s2.ava && keysBack
  rec(id, ok, `opened=${s1.ava} keysBefore=${s1b.active} closedByEsc=${!s2.ava} keysAfter=${s2.active} armedAfter=${s2.arm}`)
  return s2
}
await scenario('W1 week programme row', () => openThenEsc('W1 week programme row', page.locator(chips.programme).first(), 'week-prog'))
await scenario('W1 week sim seat', () => openThenEsc('W1 week sim seat', page.locator(chips.sim).first(), 'week-sim'))
await scenario('W1 week ground row, keys on the window tab', () => openThenEsc('W1 week ground row, keys on the window tab', page.locator(chips.ground).first(), 'week-ground-tab', { focusTab: true }))

// the board
await scenario('W1 board', async () => {
  await press(page, page.locator(`${D0} .dt.sb-open`), false)
  await page.waitForSelector('#schedBoard:not([hidden])')
  await page.waitForTimeout(500)
  const chip = page.locator('#schedBoard .oilcount').first()
  await blur()
  await press(page, chip, false)
  await page.waitForTimeout(500)
  const s1 = await state(page)
  await pic(page, 'w1-board-open')
  await blur()
  await esc()
  const s2 = await state(page)
  await pic(page, 'w1-board-after-esc1')
  await esc()
  const s3 = await state(page)
  await pic(page, 'w1-board-after-esc2')
  rec('W1 board', s1.ava && !s2.ava && s2.board && !s3.board, `open=${s1.ava} afterEsc1 ava=${s2.ava} board=${s2.board} afterEsc2 board=${s3.board}`)
})
// View-only Sched
await scenario('W1 View-only Sched', async () => {
  await go(page, 'viewsched')
  const chip = page.locator('#vWeek .day[data-day="0"] .oilcount').first()
  await blur()
  await press(page, chip, false)
  await page.waitForTimeout(500)
  const s1 = await state(page)
  await pic(page, 'w1-viewonly-open')
  await blur(); await esc()
  const s2 = await state(page)
  await cropPic(page, 'w1-viewonly-closed', chip, 120)
  rec('W1 View-only Sched', s1.ava && !s2.ava, `open=${s1.ava} closed=${!s2.ava} keys=${s2.active}`)
})
// W5b the ring: keys-originated focus after Escape shows cyan ring; mouse close does not
await scenario('W5b ring', async () => {
  await go(page, 'editsched')
  const chip = page.locator(chips.programme).first()
  await blur()
  await press(page, chip, false); await page.waitForTimeout(400)
  await blur(); await esc()
  const ring1 = await chip.evaluate(e => { const cs = getComputedStyle(e); return { fv: e.matches(':focus-visible'), focus: e.matches(':focus'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow } })
  await cropPic(page, 'w5b-ring-after-esc', chip, 60)
  // mouse: open, close by the window's own close button, then see ring state
  await blur()
  await press(page, chip, false); await page.waitForTimeout(400)
  const x = page.locator('.availwin:not([hidden]) [aria-label*="lose"], .availwin:not([hidden]) .aw-x, .availwin:not([hidden]) button:has-text("✕")').first()
  const hasX = await x.count()
  if (hasX) await x.click(); await page.waitForTimeout(400)
  const ring2 = await chip.evaluate(e => { const cs = getComputedStyle(e); return { fv: e.matches(':focus-visible'), focus: e.matches(':focus'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor } })
  await cropPic(page, 'w5b-ring-after-mouse-close', chip, 60)
  rec('W5b ring', ring1.fv && /rgb\(\s*0|rgb\(\s*[0-9]{1,2},/.test(ring1.outline + ring1.shadow) && !ring2.fv, `afterEsc ${JSON.stringify(ring1)} | afterMouseX(hasX=${hasX}) ${JSON.stringify(ring2)}`)
})
// W7 Tab route
await scenario('W7 Tab', async () => {
  await go(page, 'editsched')
  await page.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="0"] .sb-open'); window.scrollTo(0, 0); e.focus() })
  const seen = []
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab')
    const a = await page.evaluate(() => { const a = document.activeElement; return a ? { oc: a.classList.contains('oilcount'), d: a.closest && a.closest('.day') ? a.closest('.day').dataset.day : null, t: a.tagName + '.' + String(a.className).slice(0, 20), fill: a.dataset && a.dataset.fill ? a.dataset.fill : (a.closest && a.closest('[data-fill]') ? a.closest('[data-fill]').dataset.fill : null) } : null })
    seen.push(a)
  }
  const onCount = seen.filter(a => a && a.oc).length
  const inDay0 = seen.filter(a => a && a.d === '0').length
  const fills = [...new Set(seen.filter(a => a && a.fill).map(a => a.fill))]
  rec('W7 Tab', onCount === 0 && inDay0 > 5, `120 tabs: stops on a count=${onCount}; stops inside day 0=${inDay0}; seats reached=${fills.slice(0, 12).join(',')}`)
})
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
