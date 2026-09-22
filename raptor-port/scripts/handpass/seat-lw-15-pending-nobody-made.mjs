/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 13: a pending change
   nobody made. The board picture taken for the count chips showed a Sunday
   that had JUST been published reading "1 pending · Publish AL1" with all four
   signatures cleared, although nothing had been touched since. The register
   promises the opposite in as many words: "No amendment nobody made."

   This opens the saved world and looks at both published days WITHOUT touching
   anything, then asks the day what the pending change actually is. */
import { open, board, shot, closeBoard } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json' })

for (const di of [5, 6]) {
  await board(page, di)
  const s = await page.evaluate(i => ({
    version: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
    pendingChip: [...document.querySelectorAll('#schedBoard .alchip, #schedBoard [data-alcount]')]
      .map(e => (e.innerText || '').trim()).join(' / '),
    sign: (document.querySelector('#sbSignBar .so-state') || {}).innerText || '',
    alBtn: (() => { const b = document.querySelector(`#sbSignBar [data-alpub="${i}"]`); return b ? b.innerText.trim() + (b.disabled ? ' (locked)' : '') : 'none' })(),
    topline: ((document.querySelector('#schedBoard .sb-pubrow, #schedBoard .sb-vers') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 160),
  }), di)
  console.log('DAY', di, JSON.stringify(s, null, 1))
  /* the ⓘ beside the count is the door to "what changed" */
  const info = page.locator('#schedBoard [data-alwhat], #schedBoard .alchip + button, #schedBoard button[title*="change"]').first()
  if (await info.count()) {
    await info.click(); await page.waitForTimeout(900)
    const list = await page.evaluate(() => [...document.querySelectorAll('.bidsheet, [role=dialog], .airpop')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
      .map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 600)))
    console.log('   what it says is pending:', JSON.stringify(list, null, 1).slice(0, 900))
    await shot(page, `LW-36-day${di}-pending-what`)
    await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  } else console.log('   (no "what changed" door found next to the count)')
  await shot(page, `LW-37-day${di}-just-published`)
  await closeBoard(page)
}
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
