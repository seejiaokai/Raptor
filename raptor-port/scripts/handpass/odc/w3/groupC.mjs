// W3 group C - scenarios 6 (2031 pick), 8 (a posting that cannot be moved), 14 (Pick a range). Fresh worlds.
import { newWorld, rec } from './lib.mjs'
const which = process.argv[2] || 'desktop'
console.log(`w3 groupC VERSION 1 - ${which}`)
const P = which === 'phone' ? 'p' : 'd'
const sheetText = page => page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ') : '(no sheet up)' })
const gone = page => page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-slipway-2026-0"]')].filter(e => /gone/.test(e.className)).map(e => e.getAttribute('data-testid').slice(-5)))
const range = a => a.length ? (a.length > 3 ? `${a[0]}..${a[a.length - 1]} (${a.length} days)` : a.join(' ')) : '(none)'
async function scrollList(page, sel, text) {
  return page.evaluate(([s, t]) => {
    const list = document.querySelector(s); if (!list) return 'no list'
    const opt = [...list.querySelectorAll('[role="option"]')].find(o => o.textContent.trim().startsWith(t)); if (!opt) return 'no option ' + t
    const lb = list.getBoundingClientRect(), ob = opt.getBoundingClientRect()
    list.scrollTop += (ob.top + ob.height / 2) - (lb.top + lb.height / 2)
    return 'scrolled to ' + t
  }, [sel, text])
}
const selected = (page, sel) => page.evaluate(s => { const o = document.querySelector(s + ' [aria-selected="true"]'); return o ? o.textContent.trim() : '(none)' }, sel)

// ===================== S6
{
  const w = await newWorld(which, { tag: 'C-s6' }); const { page } = w
  try {
    console.log('\n== S6')
    await w.login(); await w.toLeaveWar()
    await w.tapCell('slipway', '2026-07-14')
    await w.press('[data-testid="bid-postout"]')
    await w.press('[data-testid="po-date"]'); await w.cardOnTop('S6 PO from')
    await w.press('[data-testid="dcal-title"]')
    await page.waitForSelector('[data-testid="dcal-years"]')
    console.log('  years list selected before:', await selected(page, '[data-testid="dcal-years"]'), ' title:', await w.text('[data-testid="dcal-title"]'))
    console.log('  ', await scrollList(page, '[data-testid="dcal-years"]', '2031'))
    await page.waitForTimeout(700)
    const yrSel = await selected(page, '[data-testid="dcal-years"]'), t1 = await w.text('[data-testid="dcal-title"]')
    console.log('  after year scroll: selected', yrSel, 'title', t1)
    await w.shot(`s6-${P}-year-list-2031`)
    console.log('  ', await scrollList(page, '[data-testid="dcal-months"]', 'March'))
    await page.waitForTimeout(700)
    const moSel = await selected(page, '[data-testid="dcal-months"]'), t2 = await w.text('[data-testid="dcal-title"]')
    console.log('  after month scroll: selected', moSel, 'title', t2)
    await w.shot(`s6-${P}-month-list-march`)
    await w.press('[data-testid="dcal-title"]')
    await page.waitForTimeout(300)
    const month = await page.locator('[data-testid="dcal"]').getAttribute('data-month')
    console.log('  dates are back for month', month)
    await w.shot(`s6-${P}-dates-march-2031`)
    await w.pickDay('2031-03-03')
    const read = await w.text('[data-testid="po-date"]'), val = await w.val('[data-testid="po-date"]')
    const up = await w.vis('.bidsheet'), sh = await sheetText(page)
    await w.shot(`s6-${P}-box-2031`)
    const g0 = range(await gone(page))
    await w.press('[data-testid="po-confirm"]'); await page.waitForTimeout(700)
    const shAfter = await sheetText(page), g1 = await gone(page)
    const topbar = await page.evaluate(() => document.body.innerText.slice(0, 0))
    await w.shot(`s6-${P}-after-post-out-2031`)
    // is there a note anywhere (toast)? read visible toast-like elements
    const toast = await page.evaluate(() => [...document.querySelectorAll('[role="status"],[role="alert"],.toast,.snack,.lw-toast')].map(e => e.innerText.trim()).filter(Boolean).join(' | '))
    const okBox = val === '2031-03-03' && /Mon 3 Mar 2031/.test(read)
    rec(w, '6', okBox ? 'PASS' : 'FAIL', `year list chose "${yrSel}" (title "${t1}"); month list chose "${moSel}" (title "${t2}"); dates came back on ${month}; box reads "${read}" (data-value ${val}); sheet text at that point: "${sh.slice(0, 200)}". Then Post out: sheet ${(await w.vis('.bidsheet')) ? 'still up: "' + shAfter.slice(0, 260) + '"' : 'closed'}; July 2026 struck days after: ${range(g1)}; toast/status text: "${toast}"`, `s6-${P}-box-2031.png, s6-${P}-after-post-out-2031.png`)
  } catch (e) { console.log('ERR S6', String(e).slice(0, 500)); await w.shot(`C-S6-ERR-${P}`).catch(() => {}); rec(w, '6', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
  await w.close()
}

// ===================== S8
{
  const w = await newWorld(which, { tag: 'C-s8' }); const { page } = w
  try {
    console.log('\n== S8')
    await w.login(); await w.toLeaveWar()
    // post Drifter out from 07-10
    await w.tapCell('slipway', '2026-07-14')
    await w.press('[data-testid="bid-postout"]')
    await w.press('[data-testid="po-date"]'); await w.cardOnTop('S8 PO'); await w.pickDay('2026-07-10')
    await w.press('[data-testid="po-confirm"]'); await page.waitForTimeout(700)
    const g0 = range(await gone(page)); console.log('  after PO from 07-10, struck:', g0)
    // tap a struck day, use "Place leave or OIL here instead..." to reach the PI
    await w.tapCell('slipway', '2026-07-25')
    const sh1 = await sheetText(page); console.log('  sheet on 07-25:', sh1)
    const alt = page.locator('button', { hasText: 'Place leave or OIL here instead' })
    let piOk = false
    if (await alt.count()) {
      if (w.TOUCH) await alt.first().tap(); else await alt.first().click(); await page.waitForTimeout(500)
      console.log('  after "Place leave or OIL here instead": sheet:', await sheetText(page))
      if (await page.locator('[data-testid="bid-postin"]').count()) {
        await w.press('[data-testid="bid-postin"]'); await w.press('[data-testid="pi-date"]'); await w.cardOnTop('S8 PI'); await w.pickDay('2026-07-22')
        await w.press('[data-testid="pi-confirm"]'); await page.waitForTimeout(700)
        piOk = true
      }
    }
    if (!piOk) {
      // fall back: the PI door may be on the Post out sheet
      console.log('  PI door not reached by the alternate-leave button; sheet:', await sheetText(page))
    }
    const g1 = await gone(page)
    console.log('  after PI from 07-22, struck:', range(g1))
    await w.shot(`s8-${P}-grid-out-then-in`)
    if (!piOk) { rec(w, '8', 'NOT WALKED', `could not post him in again later from the Leave War: sheet read "${sh1.slice(0, 200)}"`, `s8-${P}-grid-out-then-in.png`) }
    else {
      // tap a day at the end of his EARLIER stay (07-09)
      await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
      await w.tapCell('slipway', '2026-07-09')
      const sh2 = await sheetText(page)
      const hasBox = await page.locator('[data-testid="po-date"],[data-testid="postout-date"],[data-testid="postin-date"]').count()
      const info = await page.evaluate(() => [...document.querySelectorAll('.bidsheet [data-testid]')].map(e => e.getAttribute('data-testid') + (e.disabled ? '(disabled)' : '') + (e.getAttribute('aria-disabled') === 'true' ? '(aria-disabled)' : '')).join(' '))
      await w.shot(`s8-${P}-earlier-stay-end-sheet`)
      let tapRes = ''
      for (const id of ['postout-date', 'po-date', 'postin-date']) {
        const loc = page.locator(`[data-testid="${id}"]`)
        if (await loc.count()) {
          const dis = await loc.first().evaluate(e => ({ disabled: e.disabled === true, ariaDisabled: e.getAttribute('aria-disabled'), opacity: getComputedStyle(e).opacity, cursor: getComputedStyle(e).cursor, pe: getComputedStyle(e).pointerEvents }))
          await w.press(`[data-testid="${id}"]`)
          const opened = await page.locator('[data-testid="dcal-card"]').count()
          tapRes += ` box ${id}: ${JSON.stringify(dis)}, a tap opened a calendar: ${opened > 0}.`
          await w.shot(`s8-${P}-tap-on-${id}`)
          if (opened) { await w.close().catch(() => {}); break }
        }
      }
      rec(w, '8', 'RECORD', `Drifter posted out from 07-10 then posted in from 07-22 (struck now: ${range(g1)}); tapped 07-09 (end of the earlier stay): sheet reads "${sh2.slice(0, 300)}"; controls on it: ${info}.${tapRes || ' No date box on the sheet.'}`, `s8-${P}-earlier-stay-end-sheet.png`)
    }
  } catch (e) { console.log('ERR S8', String(e).slice(0, 500)); await w.shot(`C-S8-ERR-${P}`).catch(() => {}); rec(w, '8', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
  await w.close().catch(() => {})
}

// ===================== S14
{
  const w = await newWorld(which, { tag: 'C-s14' }); const { page } = w
  try {
    console.log('\n== S14')
    await w.login(); await w.toLeaveWar()
    await w.tapCell('slipway', '2026-07-14')
    await w.press('[data-testid="span-range"]'); await page.waitForTimeout(500)
    const cal = await page.evaluate(() => ({
      newCard: !!document.querySelector('[data-testid="dcal-card"]'), newToday: !!document.querySelector('[data-testid="dcal-today"]'),
      sheet: document.querySelector('.bidsheet') ? document.querySelector('.bidsheet').innerText.replace(/\s+/g, ' ') : '(no sheet)',
      testids: [...document.querySelectorAll('.bidsheet [data-testid]')].map(e => e.getAttribute('data-testid')).join(' '),
      classes: [...document.querySelectorAll('.bidsheet [class*="cal"], .bidsheet [class*="range"], .bidsheet [class*="rp-"]')].slice(0, 12).map(e => e.className.toString()).join(' | ') }))
    console.log('  after Pick a range:', JSON.stringify(cal))
    await w.shot(`s14-${P}-pick-a-range-open`)
    // find a day button inside the sheet's own calendar
    const days = await page.evaluate(() => [...document.querySelectorAll('.bidsheet button, .bidsheet [role="button"], .bidsheet td, .bidsheet [data-iso], .bidsheet [data-date]')].slice(0, 80).map(e => (e.getAttribute('data-testid') || e.getAttribute('data-iso') || e.getAttribute('data-date') || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 4)).join(' ; '))
    console.log('  candidate controls:', days)
    rec(w, '14a', 'RECORD', `Pick a range tapped on 14 Jul: new round-disc calendar present=${cal.newCard}; Today icon present=${cal.newToday}; sheet text: "${cal.sheet.slice(0, 400)}"`, `s14-${P}-pick-a-range-open.png`)
  } catch (e) { console.log('ERR S14', String(e).slice(0, 500)); await w.shot(`C-S14-ERR-${P}`).catch(() => {}); rec(w, '14', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
  await w.close().catch(() => {})
}
console.log('\nDONE')
