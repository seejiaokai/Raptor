// ph-probe2 - what the dates button opens on 149's Inputs List at a size. node ph-probe2.mjs <size>
import { mk, signIn, go, pickSq, closeAll, note, press, pic } from './lib.mjs'
const SZ = process.argv[2] || '874x402'
const s = await mk(SZ); const { page } = s
try {
  await signIn(s, 'ad', 'a'); await pickSq(s, '149'); await go(s, 'inputs'); await page.waitForTimeout(600)
  if (await page.locator('#inListBtn[aria-pressed="false"]').filter({ visible: true }).count()) await press(s, '#inListBtn')
  await press(s, '#inCalBtn'); await page.waitForTimeout(800)
  await pic(s, `ph-probe2-${SZ}`)
  note(await page.evaluate(() => [...document.querySelectorAll('#icPrev, [id^=ic]')].map(e => e.id + ':' + Math.round(e.getBoundingClientRect().height) + ':' + e.textContent.trim().slice(0, 40))))
  note(await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => /All dates/.test(b.textContent)).map(b => (b.id || b.className) + ':' + Math.round(b.getBoundingClientRect().top))))
} finally { await closeAll() }
