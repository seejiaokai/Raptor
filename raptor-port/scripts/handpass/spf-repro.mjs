/* The scheduling-on-a-phone batch (18 Oct 26, D994) — the "before" pictures and measurements.
   [PHONE-WIDE-BOARD-BLANK] (fixed 4 Oct, D548 — the picture on today's build) and
   [SCHED-INPUT-WINDOW-PHONE] (the schedule's own input window on a phone; "+ Input" on a phone on its side).
   Run: HP_URL=http://localhost:4174 HP_SHOTS=<folder> node scripts/handpass/spf-repro.mjs */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const here = dirname(fileURLToPath(import.meta.url))
process.env.HP_SHOTS ||= resolve(here, '../../docs/img/handpass/2026-10-18-sched-phone/before')
const { open, go, shot, SHOTS } = await import('./lib.mjs')
console.log('spf-repro v1 →', SHOTS)

const out = {}
/* 1 — the board's Desktop layout on a phone */
{
  const { browser, page, errors } = await open({ width: 390, height: 844 })
  await page.locator('#burger').click()
  await page.locator('#drawerNav [data-page="editsched"]').click()
  await page.locator('#eWeek [data-sbday="0"]:visible').click()
  await page.locator('#sbBoard .sb-sec').first().waitFor({ state: 'attached' })
  await page.locator('#sbMore').click()
  await page.locator('#sbMoreWide').click()
  await page.waitForTimeout(600)
  out.wide = await page.locator('#sbBoard .sb-sec').evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().width)))
  await shot(page, 'w01-phone-desktop-layout')
  await page.evaluate(() => { const b = document.querySelector('#schedBoard'); b.scrollTop = 600 })
  await page.waitForTimeout(300)
  await shot(page, 'w02-phone-desktop-layout-lower')
  out.wideErrors = errors.slice()
  await browser.close()
}
console.log(JSON.stringify(out, null, 1))
