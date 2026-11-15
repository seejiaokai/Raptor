/* www host (16 Nov 26): the Logic page's flag order on a puck ("Several problems on one puck") — each chip's short name,
   read where it is drawn (Astra's 6, the Opus read's F3). usage: [PHONE=1] node scripts/handpass/www/www-host-lgchips.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_WHO = 'host'
process.env.WWW_RUN ||= 'lgchips-' + (PHONE ? 'p' : 'd')
const X = await import('./www-lib.mjs')
const { say, sleep } = X
const w = await X.open({ phone: PHONE })
const { page } = w
if (PHONE) { await X.press(w, '#navBurger, .navburger, [aria-label="Menu"]'); await sleep(500) }
await X.press(w, 'a[data-page="logic"]'); await sleep(900)
const where = page.locator('.lgchips').first()
say('chip rows found', await page.locator('.lgchips').count())
if (await where.count()) {
  await where.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
  const names = await page.evaluate(() => [...document.querySelectorAll('.lgchips .lgc')]
    .filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  say('DRAWN', JSON.stringify(names))
  await X.pic(w, `lg-chips-${PHONE ? 'p' : 'd'}`, where)
  const want = ['Misses flight brief', 'Misses flight debrief', 'Misses sim brief', 'Misses sim debrief', 'Wrong seat', 'Long day (>12h)', 'Days in a row']
  const missing = want.filter(n => !names.some(s => s.endsWith(n)))
  say(missing.length ? 'FAIL: missing ' + JSON.stringify(missing) : 'PASS: every one-check chip carries its new name')
} else { await X.pic(w, `lg-nochips-${PHONE ? 'p' : 'd'}`); say('NOT FOUND: no chip row drawn') }
await X.fin(w)
