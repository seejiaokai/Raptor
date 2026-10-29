// M5b (29 Oct 26): today's screens that M5b changes, pictured on main as it is (after M5a), before anything is drawn.
// The ⚙ Settings window (desktop admin and his iPhone), an Event row's window, the Calendar window's Holidays list.
// Nothing is drawn in: these are the "today" half of every M5b before/after.
//   cd raptor-port ; npm run build ; npx vite preview --port 4197 --strictPort   (in another shell)
//   LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-m5b-today.mjs
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
const facts = {}
for (const [dev, w, h, touch] of [['desk', 1536, 864, false], ['phone', 402, 874, true]]) {
  const { ctx, p } = await newPage(browser, w, h, touch)
  await signIn(p, 'admin')
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.click(q('settings-open')); await p.waitForTimeout(700)
  const sheet = p.locator(q('settings-sheet'))
  facts[dev] = await p.evaluate(() => {
    const s = document.querySelector('[data-testid="settings-sheet"]'); const r = s.getBoundingClientRect()
    const body = s.querySelector('.sheet-body, .sb') || s
    return { box: [r.x, r.y, r.width, r.height].map(Math.round), scrollH: s.scrollHeight, words: s.innerText.split(/\s+/).filter(Boolean).length,
      text: s.innerText.replace(/\n+/g, ' | ').slice(0, 1500) }
  })
  await shot(p, `m5b-t1-settings-${dev}`)
  // the whole window, scrolled through, for its full length
  await sheet.screenshot({ path: join(OUT, `m5b-t1-settings-${dev}-whole.png`) }).catch(e => console.warn('whole', e.message))
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)
  // an Event row's window: a tap on an empty Event cell (the first event row, a weekday in view)
  const ev = await p.evaluate(() => { const e = document.querySelector('[data-testid^="event-0-2026-01-1"]'); e?.scrollIntoView({ block: 'center', inline: 'center' }); return e?.dataset.testid })
  if (ev) { await p.waitForTimeout(400); await p.click(q(ev)); await p.waitForTimeout(600); await shot(p, `m5b-t2-event-${dev}`); await p.keyboard.press('Escape'); await p.waitForTimeout(400) }
  else console.warn('no event cell')
  // the Calendar window from ⚙ → Calendar…, its Holidays list
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.click(q('settings-open')); await p.waitForTimeout(500)
  await p.click(q('settings-days')); await p.waitForTimeout(900)
  const hol = p.locator(q('days-part-holidays'))
  if (await hol.count()) { await hol.scrollIntoViewIfNeeded(); await p.waitForTimeout(300) }
  await shot(p, `m5b-t3-calendar-${dev}`)
  facts[dev + '-hol'] = await p.evaluate(() => document.querySelector('[data-testid="days-part-holidays"]')?.innerText.replace(/\n+/g, ' | ').slice(0, 800))
  await ctx.close()
}
writeFileSync(join(OUT, 'm5b-today.json'), JSON.stringify(facts, null, 1))
console.log(JSON.stringify(facts, null, 1).slice(0, 4000))
await browser.close(); console.log('errors:', errs)
