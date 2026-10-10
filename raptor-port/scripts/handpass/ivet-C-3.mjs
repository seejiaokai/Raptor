// Walker C, script 3 — the empty list's words: 40 (desktop, Saber), 41 (phone, Saber), 42 (desktop, Ranger)
import * as L from './ivet-C-lib.mjs'

async function rangePick(page, touch, a, b) {
  if (!(await page.locator('#inRangePop').count())) await L.press(touch, page.locator('#inRangeBtn'))
  await page.locator('#inRangePop').waitFor()
  const go = async iso => {
    for (let i = 0; i < 40 && !(await page.locator(`#inRangeCal [data-cal="${iso}"]`).count()); i++) {
      const [m, y] = (await page.locator('#inRangeCal .rc-mon').textContent()).split(' ')
      const at = `${y}-${String(L.MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
      await L.press(touch, page.locator(`#inRangeCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
    }
    await L.press(touch, page.locator(`#inRangeCal [data-cal="${iso}"]`))
  }
  await go(a); if (b) await go(b)
  await page.waitForTimeout(250)
}
const emptyInfo = page => page.evaluate(() => {
  const e = document.querySelector('#inEmpty'); if (!e || !e.getClientRects().length) return null
  const r = e.getBoundingClientRect()
  const rg = document.createRange(); rg.selectNodeContents(e); const rects = [...rg.getClientRects()]
  return { text: e.textContent, fits: rects.every(x => x.left >= -0.5 && x.right <= innerWidth + 0.5) && document.documentElement.scrollWidth <= innerWidth, lines: new Set(rects.map(x => Math.round(x.top))).size, w: Math.round(r.width) }
})

/* ---------------- 40 ---------------- */
{
  const { ctx, page } = await L.open(L.DESK, 'ad', 'a', false)
  await L.step('40', 'desktop', 'Saber', async () => {
    await L.toList(page, false, false)
    await page.fill('#inFSearch', 'zz-no-match')
    await rangePick(page, false, '2026-10-10', '2026-10-24')
    await page.mouse.click(700, 760); await page.waitForTimeout(150)
    const e = await emptyInfo(page)
    const pic = await L.shot(page, '40-desk-empty-oct')
    // + Input and the dates control still usable
    await page.locator('#inNew').click(); const winOpen = await page.locator(L.WIN).waitFor({ timeout: 3000 }).then(() => true, () => false)
    if (winOpen) await page.locator('#inpEditCancel').click()
    await page.locator('#inRangeBtn').click(); const popOpen = await page.locator('#inRangePop').waitFor({ timeout: 3000 }).then(() => true, () => false)
    await page.mouse.click(700, 760)
    const ok = e && e.text === 'No inputs 10–24 Oct. Try All dates.' && e.fits && winOpen && popOpen
    L.rec('40', 'desktop', 'Saber', ok ? 'PASS' : 'FAIL', `empty line reads "${e && e.text}" (${e && e.w}px wide, ${e && e.lines} line, fits=${e && e.fits}); "+ Input" opens its window=${winOpen}; dates button opens its calendar=${popOpen}`, [pic])
  })
  await ctx.close()
}

/* ---------------- 41 ---------------- */
{
  const { ctx, page } = await L.open(L.PHONE, 'ad', 'a', true)
  await L.step('41', 'phone', 'Saber', async () => {
    await L.toList(page, true, false)
    await page.locator('#inFiltersBtn').tap(); await page.fill('#inFSearch', 'zz-no-match'); await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(200)
    const out = {}, pics = []
    const cases = [['twoMonths', '2026-10-30', '2026-11-02', 'No inputs 30 Oct – 2 Nov. Try All dates.'], ['overYear', '2026-12-30', '2027-01-02', 'No inputs 30 Dec – 2 Jan 2027. Try All dates.'], ['startOnly', '2026-10-30', null, 'No inputs from 30 Oct. Try All dates.']]
    for (const [k, a, b, want] of cases) {
      await rangePick(page, true, a, b)
      await page.mouse.click(5, 300).catch(() => {}); await page.waitForTimeout(200)
      out[k] = await emptyInfo(page); out[k] = out[k] || { text: '(no empty line)' }
      out[k].want = want
      pics.push(await L.shot(page, `41-phone-empty-${k}`))
    }
    const problems = []
    for (const [k, a, b, want] of cases) {
      const o = out[k]
      if (o.text !== want) problems.push(`${k}: reads "${o.text}", expected "${want}"`)
      if (o.fits === false) problems.push(`${k}: does not fit the screen`)
      if (/undefined|NaN|→|Invalid/.test(o.text)) problems.push(`${k}: unfinished/invalid text`)
      if (!/ Try All dates\.$/.test(o.text)) problems.push(`${k}: does not end "Try All dates."`)
    }
    L.rec('41', 'phone', 'Saber', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : `30 Oct–2 Nov: "${out.twoMonths.text}"; 30 Dec–2 Jan: "${out.overYear.text}"; start only: "${out.startOnly.text}"; all fit 390px (${out.twoMonths.lines}/${out.overYear.lines}/${out.startOnly.lines} lines)`, pics)
  })
  await ctx.close()
}

/* ---------------- 42 ---------------- */
{
  const { ctx, page } = await L.open(L.DESK, 'us', 'us', false)
  await L.step('42', 'desktop', 'Ranger', async () => {
    await L.toList(page, false, true)
    await page.selectOption('#inFPerson', 'all')
    const before = await page.locator('#inBody tr[data-iid]').count()
    await page.fill('#inFSearch', 'zz-no-match'); await page.waitForTimeout(300)
    const e = await emptyInfo(page)
    const pic = await L.shot(page, '42-desk-no-match')
    await page.fill('#inFSearch', ''); await page.waitForTimeout(300)
    const after = await page.locator('#inBody tr[data-iid]').count()
    const emptyAfter = await emptyInfo(page)
    const pic2 = await L.shot(page, '42-desk-cleared')
    const ok = e && e.text === 'No inputs match.' && e.fits && after === before && before > 0 && !emptyAfter
    L.rec('42', 'desktop', 'Ranger', ok ? 'PASS' : 'FAIL', `with All dates and an unmatched search the line reads "${e && e.text}" (no date instruction); clearing the search brings back ${after} rows (${before} before)`, [pic, pic2])
  })
  await ctx.close()
}
L.savePartial('3')
console.log('errors:', L.errs)
await L.browser.close()
