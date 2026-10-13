// W3 group B - scenarios 4 and 5 (PI from, the Post in sheet, a posting out before a post-in). One fresh world.
import { newWorld, rec } from './lib.mjs'
const which = process.argv[2] || 'desktop'
console.log(`w3 groupB VERSION 1 - ${which}`)
const w = await newWorld(which, { tag: 'B' })
const { page } = w
const P = which === 'phone' ? 'p' : 'd'
const cls = iso => page.locator(`[data-testid="cell-slipway-${iso}"]`).evaluate(e => e.className).catch(() => 'no-cell')
const julClasses = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-slipway-2026-07-"]')].map(e => e.getAttribute('data-testid').slice(-5) + ':' + e.className.replace(/\s+/g, '.')).join(' | '))
const sheetText = () => page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ') : '(no sheet up)' })
try {
  await w.login(); await w.toLeaveWar()
  // ---------- S4
  console.log('\n== S4')
  await w.tapCell('slipway', '2026-07-14')
  await w.press('[data-testid="bid-postin"]')
  await page.waitForSelector('[data-testid="pi-date"]')
  console.log('  PI sheet:', await sheetText())
  const read0 = await w.text('[data-testid="pi-date"]'), val0 = await w.val('[data-testid="pi-date"]')
  const fit = await w.boxFits('[data-testid="pi-date"]', '.bidsheet', 'PI from')
  await w.press('[data-testid="pi-date"]')
  const c = await w.cardOnTop('S4 PI from')
  await w.shot(`s4-${P}-pi-calendar-open`)
  await w.pickDay('2026-07-20')
  const up = await w.vis('.bidsheet'), read1 = await w.text('[data-testid="pi-date"]'), val1 = await w.val('[data-testid="pi-date"]')
  await w.shot(`s4-${P}-pi-picked`)
  const lineAfter = await sheetText()
  await w.press('[data-testid="pi-confirm"]'); await page.waitForTimeout(700)
  const sheetClosed = !(await w.vis('.bidsheet'))
  await w.shot(`s4-${P}-grid-after-post-in`)
  const classesAfterPI = await julClasses()
  console.log('  classes after PI:', classesAfterPI)
  const ok4a = val0 === '2026-07-14' && /14 Jul 2026/.test(read0) && c.ok && fit.ok && up && val1 === '2026-07-20' && /20 Jul 2026/.test(read1)
  rec(w, '4a', ok4a ? 'PASS' : 'FAIL', `PI from box read "${read0}" (${val0}) before; calendar on top ${c.ok}; after the tap sheet up=${up}, box reads "${read1}" (${val1}); sheet text then: "${lineAfter.slice(0, 220)}"; after Post in the sheet ${sheetClosed ? 'closed' : 'still up'}`, `s4-${P}-pi-calendar-open.png, s4-${P}-pi-picked.png`)
  // tap a day BEFORE the post-in date
  console.log('  -- a day before the post-in (07-17)')
  await w.tapCell('slipway', '2026-07-17')
  const sh = await sheetText()
  console.log('  sheet:', sh)
  await w.shot(`s4-${P}-day-before-sheet`)
  const hasPin = await page.locator('[data-testid="postin-date"]').count()
  if (!hasPin) {
    rec(w, '4b', 'RECORD', `tapped 07-17 (before the post-in 07-20): no Post in date box; sheet reads "${sh.slice(0, 250)}"; cell class "${await cls('2026-07-17')}"`, `s4-${P}-day-before-sheet.png`)
  } else {
    const v0 = await w.val('[data-testid="postin-date"]')
    await w.boxFits('[data-testid="postin-date"]', '.bidsheet', 'Post in date')
    await w.press('[data-testid="postin-date"]')
    const c2 = await w.cardOnTop('S4 postin-date')
    await w.shot(`s4-${P}-postin-calendar-open`)
    await w.pickDay('2026-07-24')
    const v1 = await w.val('[data-testid="postin-date"]')
    const sh2 = await sheetText()
    await w.shot(`s4-${P}-postin-moved-later`)
    const cl2 = await julClasses()
    // move earlier
    let earlier = ''
    if (await page.locator('[data-testid="postin-date"]').count()) {
      await w.press('[data-testid="postin-date"]'); await w.cardOnTop('S4 postin-date (earlier)'); await w.pickDay('2026-07-08')
      earlier = `then moved to 07-08: data-value ${await w.val('[data-testid="postin-date"]').catch(() => '(box gone)')}; sheet "${(await sheetText()).slice(0, 200)}"; classes ${await julClasses()}`
      await w.shot(`s4-${P}-postin-moved-earlier`)
    } else earlier = 'the Post in box was gone after the later pick, so no earlier pick'
    rec(w, '4b', c2.ok && v1 === '2026-07-24' ? 'PASS' : 'FAIL', `tapped 07-17 (before post-in 07-20): Post in box opened on ${v0}; calendar on top ${c2.ok}; picked 07-24 -> data-value ${v1}; sheet "${sh2.slice(0, 220)}"; day classes now: ${cl2}; ${earlier}. HOW THE DAYS BEFORE READ: see classes above and pictures`, `s4-${P}-day-before-sheet.png, s4-${P}-postin-moved-later.png, s4-${P}-postin-moved-earlier.png`)
  }
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
  // ---------- S5
  console.log('\n== S5')
  const piNow = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-slipway-2026-07-"]')].map(e => e.className.replace(/\s+/g, '.')).join(' | '))
  console.log('  state before S5:', piNow)
  // tap a day AFTER the current post-in (07-30), make a posting out dated before the post-in (07-05)
  await w.tapCell('slipway', '2026-07-30')
  console.log('  sheet on 07-30:', await sheetText())
  if (!(await page.locator('[data-testid="bid-postout"]').count())) {
    rec(w, '5', 'NOT WALKED', `no PO control on the sheet for 07-30; sheet: "${(await sheetText()).slice(0, 200)}"`, '')
  } else {
    await w.press('[data-testid="bid-postout"]')
    await w.press('[data-testid="po-date"]'); await w.cardOnTop('S5 po-date')
    await w.pickDay('2026-07-05')
    const poVal = await w.val('[data-testid="po-date"]'), shBefore = await sheetText()
    await w.shot(`s5-${P}-po-before-postin-picked`)
    const conf = page.locator('[data-testid="po-confirm"]')
    const confDisabled = await conf.isDisabled().catch(() => 'n/a')
    await w.press('[data-testid="po-confirm"]'); await page.waitForTimeout(600)
    const up = await w.vis('.bidsheet'), shAfter = await sheetText()
    await w.shot(`s5-${P}-after-post-out-before-post-in`)
    rec(w, '5', up && /./.test(shAfter) ? 'PASS' : 'FAIL', `PO from picked ${poVal} (earlier than the post-in); sheet text at the pick: "${shBefore.slice(0, 220)}"; Post out button disabled=${confDisabled}; after pressing Post out: sheet up=${up}; sheet text: "${shAfter.slice(0, 300)}"; day classes ${await julClasses()}`, `s5-${P}-after-post-out-before-post-in.png`)
  }
} catch (e) { console.log('ERR', String(e).slice(0, 500)); await w.shot(`B-ERR-${P}`).catch(() => {}) }
console.log('\nRESULTS', JSON.stringify(w.results))
await w.close()
