/* w4 · roll-call R19 — the HEADINGS of the OIL advisories in a day's warning list. Every warning prints a plain
   heading ("Crew rest (<12h)", "Long work day"); an advisory with no plain heading falls back to its internal
   code (validate.ts wlbl(WCODE[code] || code)). Seen on Tuesday after a PH: "OIL_STALE_DAY".
   Here: Saturday taken back to a draft (Unpublish, two taps) → the "not published yet" advisory; and Tuesday
   declared a PH on the war, then the page reloaded → the "started earning" advisory.
   Usage: node w4-11-warn-titles.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, login, STATE, PHONE, DESK, lwOpen, editWeek, unpublish, head, shot, checker, frame } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('WARN-TITLES ' + w)
const titles = async di => {
  const s = page.locator(`#eWeek [data-daywarn="${di}"]:visible`).first()
  if (!(await s.count())) return []
  if (!(await page.locator(`#eWeek [data-dwbox="${di}"].open`).count())) { await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click(); await page.waitForTimeout(400) }
  return page.evaluate(i => [...document.querySelectorAll(`#eWeek [data-dwbox="${i}"] .witem`)].map(e => ({ title: (e.querySelector('.wcode') || {}).innerText?.trim() || '', text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) })), di)
}
const raw = ls => ls.filter(x => /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/.test(x.title))

/* Saturday back to a draft */
await editWeek(page)
await unpublish(page, 5, { confirm: true })
note('Saturday after Unpublish', (await head(page, 5)).tag)
const t5 = await titles(5)
note('Saturday (draft) warning list', t5)
await frame(page, '#eWeek .day[data-day="5"]')
await shot(page, `wt-${w}-1-sat-draft-warnings`)
ck('every warning on the draft Saturday carries a plain heading (no internal code)', raw(t5).length === 0, 'plain headings', raw(t5))

/* Tuesday declared a PH on the war; reload so the list catches up (the lag is w4 finding F1) */
await lwOpen(page, '2026-07-14')
await page.locator('[data-testid="event-0-2026-07-14"]').first().click(); await page.waitForTimeout(500)
await page.locator('[data-testid="event-text"]').first().fill('PH')
await page.locator('[data-testid="event-apply"]').first().click(); await page.waitForTimeout(800)
await page.reload(); await login(page); await editWeek(page)
const t1 = await titles(1)
note('Tuesday (published, PH declared after) warning list', t1)
await frame(page, '#eWeek .day[data-day="1"]')
await shot(page, `wt-${w}-2-tue-ph-warnings`)
ck('every warning on the PH Tuesday carries a plain heading (no internal code)', raw(t1).length === 0, 'plain headings', raw(t1))

ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
