// W3 group A - scenarios 1, 2, 3 (PO from, the Post out sheet, undo). One fresh world, in one context.
import { newWorld, rec } from './lib.mjs'
const which = process.argv[2] || 'desktop'
console.log(`w3 groupA VERSION 2 - ${which}`)
const w = await newWorld(which, { tag: 'A' })
const { page } = w
const P = which === 'phone' ? 'p' : 'd'
const struck = iso => page.locator(`[data-testid="cell-slipway-${iso}"]`).evaluate(e => e.className).catch(() => 'no-cell')
const goneDays = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-slipway-2026-07-"]')].filter(e => /gone/.test(e.className)).map(e => e.getAttribute('data-testid').slice(-5)).join(' '))
const histCount = () => page.evaluate(() => ({ undoDisabled: document.querySelector('#undoBtn')?.disabled, redoDisabled: document.querySelector('#redoBtn')?.disabled }))
try {
  await w.login(); await w.toLeaveWar()
  // ---------- S1
  console.log('\n== S1')
  await w.tapCell('slipway', '2026-07-14')
  await w.press('[data-testid="bid-postout"]')
  await page.waitForSelector('[data-testid="po-date"]')
  const boxRead = await w.text('[data-testid="po-date"]'), boxVal = await w.val('[data-testid="po-date"]')
  const fit = await w.boxFits('[data-testid="po-date"]', '.bidsheet', 'PO from')
  await w.press('[data-testid="po-date"]')
  const c1 = await w.cardOnTop('S1 PO from')
  await w.shot(`s1-${P}-po-calendar-open`)
  await w.pickDay('2026-07-20')
  const sheetUp = await w.vis('.bidsheet'), boxAfter = await w.text('[data-testid="po-date"]'), valAfter = await w.val('[data-testid="po-date"]')
  const line = await page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ').split('POSTING')[1] || s.innerText : '' })
  await w.shot(`s1-${P}-po-picked`)
  const lineFull = await w.text('.bidsheet')
  console.log('  sheet text after pick:', lineFull)
  const ok1 = boxVal === '2026-07-14' && /14 Jul 2026/.test(boxRead) && c1.ok && fit.ok && sheetUp && valAfter === '2026-07-20' && /20 Jul 2026/.test(boxAfter)
  await w.press('[data-testid="po-confirm"]')
  await page.waitForTimeout(600)
  const sheetGone = !(await w.vis('.bidsheet'))
  const gone1 = await goneDays()
  await w.shot(`s1-${P}-grid-after-post-out`)
  rec(w, '1', ok1 ? 'PASS' : 'FAIL', `box before: "${boxRead}" (data-value ${boxVal}); calendar on top ${c1.ok}; after the tap sheet still up=${sheetUp}, box reads "${boxAfter}" (${valAfter}); line under chips: "${line.trim().slice(0, 160)}"; after Post out the sheet ${sheetGone ? 'closed' : 'still up'}; struck (gone) July days: ${gone1}`, `s1-${P}-po-picked.png, s1-${P}-grid-after-post-out.png`)
  // ---------- S2
  console.log('\n== S2')
  await w.tapCell('slipway', '2026-07-22')
  const so = await page.locator('[data-testid="postout-date"]').count()
  console.log('  postout-date present:', so, ' sheet:', await w.text('.bidsheet').catch(() => '(no sheet)'))
  if (!so) { rec(w, '2', 'NOT WALKED', 'the Post out sheet did not open on a struck day', ''); }
  else {
    const v0 = await w.val('[data-testid="postout-date"]')
    await w.boxFits('[data-testid="postout-date"]', '.bidsheet', 'Post out date')
    await w.press('[data-testid="postout-date"]')
    const c2 = await w.cardOnTop('S2 postout-date')
    await w.shot(`s2-${P}-postout-calendar-open`)
    await w.pickDay('2026-07-16')
    const v1 = await w.val('[data-testid="postout-date"]')
    const gone2 = await goneDays()
    await w.shot(`s2-${P}-earlier-picked`)
    const sheetAfterEarlier = await w.text('.bidsheet').catch(() => '(no sheet)')
    const okEarlier = v1 === '2026-07-16' && !/\b17\b/.test('') && /gone/.test(await struck('2026-07-17')) && !/gone/.test(await struck('2026-07-15'))
    console.log('  after earlier: sheet:', sheetAfterEarlier)
    // later date past the day tapped (22)
    const stillBox = await page.locator('[data-testid="postout-date"]').count()
    let later = 'the Post out sheet had gone, so the box was not there to open'
    if (stillBox) {
      await w.press('[data-testid="postout-date"]')
      await w.cardOnTop('S2 postout-date (later)')
      await w.pickDay('2026-07-28')
      await page.waitForTimeout(500)
      const sheetNow = await page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ') : '(no sheet up)' })
      later = `sheet after: ${sheetNow}; postout-date present ${await page.locator('[data-testid="postout-date"]').count()}, bid-picker present ${await page.locator('[data-testid="bid-picker"]').count()}; gone days ${await goneDays()}`
      await w.shot(`s2-${P}-later-picked`)
    }
    rec(w, '2', okEarlier && c2.ok ? 'PASS' : 'FAIL', `box opened on ${v0}; earlier pick 07-16 -> data-value ${v1}, struck days now: ${gone2}; day 17 gone=${/gone/.test(await struck('2026-07-17'))}, day 15 gone=${/gone/.test(await struck('2026-07-15'))}; sheet after earlier: "${sheetAfterEarlier.slice(0, 200)}". LATER date 07-28 (past tapped 07-22): ${later}`, `s2-${P}-earlier-picked.png, s2-${P}-later-picked.png`)
  }
  // ---------- S3
  console.log('\n== S3')
  const h0 = await histCount()
  console.log('  top bar undo/redo now:', h0)
  // state of the sheet / struck days now
  const sheetNow = await page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ') : '(none)' })
  console.log('  sheet now:', sheetNow, ' gone:', await goneDays())
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
  // reopen a struck day's Post out sheet and press its Undo
  const goneNow = (await goneDays()).split(' ').filter(Boolean)
  const pick = goneNow.length ? '2026-' + goneNow[goneNow.length - 1] : null
  console.log('  will tap struck day', pick)
  if (pick) {
    await w.tapCell('slipway', pick)
    const hasU = await page.locator('[data-testid="postout-undo"]').count()
    console.log('  postout-undo present:', hasU, ' sheet:', await w.text('.bidsheet').catch(() => '(none)'))
    if (hasU) {
      const gBefore = await goneDays()
      await w.shot(`s3-${P}-postout-sheet-before-undo`)
      await w.press('[data-testid="postout-undo"]')
      await page.waitForTimeout(500)
      const gAfter = await goneDays()
      const sheetU = await page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ') : '(no sheet up)' })
      await w.shot(`s3-${P}-after-sheet-undo`)
      const hAfter = await histCount()
      rec(w, '3a', 'RECORD', `Post out sheet's Undo pressed: struck days before "${gBefore}" -> after "${gAfter}"; sheet after: "${sheetU.slice(0, 200)}"; top-bar undo/redo disabled state: ${JSON.stringify(hAfter)}`, `s3-${P}-after-sheet-undo.png`)
    } else rec(w, '3a', 'NOT WALKED', 'no postout-undo control on the Post out sheet', '')
  }
  // the app's Undo / Redo after a posting. First make a fresh posting so there is something to undo
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
  await w.tapCell('slipway', '2026-07-10')
  await w.press('[data-testid="bid-postout"]')
  await w.press('[data-testid="po-date"]'); await w.cardOnTop('S3 po-date'); await w.pickDay('2026-07-12')
  await w.press('[data-testid="po-confirm"]'); await page.waitForTimeout(600)
  const g0 = await goneDays(), hh0 = await histCount()
  await w.shot(`s3-${P}-after-new-posting`)
  const undoBtn = page.locator('#undoBtn'), redoBtn = page.locator('#redoBtn')
  let r3 = `after posting out from 07-12: struck days "${g0}", undo/redo disabled ${JSON.stringify(hh0)}`
  if (await undoBtn.isEnabled()) {
    if (w.TOUCH) await undoBtn.tap(); else await undoBtn.click(); await page.waitForTimeout(600)
    const g1 = await goneDays(), h1 = await histCount(); await w.shot(`s3-${P}-after-app-undo`)
    r3 += `; app Undo -> struck days "${g1}", ${JSON.stringify(h1)}`
    if (await redoBtn.isEnabled()) {
      if (w.TOUCH) await redoBtn.tap(); else await redoBtn.click(); await page.waitForTimeout(600)
      const g2 = await goneDays(), h2 = await histCount(); await w.shot(`s3-${P}-after-app-redo`)
      r3 += `; app Redo -> struck days "${g2}", ${JSON.stringify(h2)}`
    } else r3 += '; Redo stayed disabled'
  } else r3 += '; the top-bar Undo was DISABLED after the posting (nothing to undo)'
  rec(w, '3b', 'RECORD', r3, `s3-${P}-after-app-undo.png, s3-${P}-after-app-redo.png`)
} catch (e) { console.log('ERR', String(e).slice(0, 500)); await w.shot(`A-ERR-${P}`).catch(() => {}) }
console.log('\nRESULTS', JSON.stringify(w.results, null, 1))
await w.close()
