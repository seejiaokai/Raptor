/* THE EVERYTHING WEEK for the amendment re-test (24 Sep 26) — built through the app's own controls only
   (bug-check order §7.1, §7.7). Saves the world to HP_OUT (a Playwright storage state, keyed to
   http://localhost:4173) so every walker starts from the same week in its own browser context.

   What each day ends up as:
     Mon 0  Original → AL1 (a day note changed) → a SECOND change left pending (goes out as AL2)
     Tue 1  Original, nothing pending
     Wed 2  never published; two plans (A and B), Plan B live and edited
     Thu 3  Original; a contingency Plan B made AFTER publishing and edited; Plan A (= the issued) live
     Fri 4  never published, untouched
     Sat 5  the everything Saturday (../fixture.mjs) — published as its Original, so it earns OIL
     Sun 6  Original → AL1 (a note) → Unpublished (AL1 retired; the day is correcting AL1)          */
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/fixture'
const OUT = process.env.HP_OUT || 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
const L = await import('./am-lib.mjs')
const { buildSaturday } = await import('../fixture.mjs')
const { open, editWeek, board, closeBoard, signDay, publishDay, publishAL, unpublish, head, book, editText, planMenuItems, planMenuPick, shot } = L
const { browser, ctx, page, errors } = await open({ fresh: true })
const log = (k, v) => console.log(k.padEnd(22), typeof v === 'string' ? v : JSON.stringify(v))
const must = (ok, what) => { if (!ok) { console.log('FIXTURE FAILED at: ' + what); throw new Error(what) } }

/* --- Saturday first: the long build, on the board ---------------------------------------- */
const sat = await buildSaturday(page, 5)
log('sat build', sat.filter(s => /FAILED/.test(s)).length ? sat : 'ok (' + sat.length + ' steps)')
must(!sat.some(s => /FAILED/.test(s)), 'Saturday build')
log('sat sign', await signDay(page, 5))
const satPub = await publishDay(page, 5)
log('sat publish', satPub)
must(satPub.pressed, 'Saturday publish')
log('sat head', await head(page, 5))
await closeBoard(page)

/* --- the weekdays on the edit week ------------------------------------------------------- */
await editWeek(page)
// Monday: Original → AL1 → a pending second change
await signDay(page, 0); must((await publishDay(page, 0)).pressed, 'Mon publish')
await editText(page, 'dn:0.0', 'MON NOTE — AL1'); await signDay(page, 0)
must((await publishAL(page, 0)).pressed, 'Mon AL1')
const monKeys = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-txt]')].map(e => e.dataset.txt))
const monTime = monKeys.find(k => /^ff:0\.\d+\.\d+\.to$/.test(k)) || monKeys.find(k => /^ap:0\.\d+\.str$/.test(k))
log('mon pending key', monTime)
await editText(page, monTime, '07:45')
log('mon head', await head(page, 0))

// Tuesday: Original only
await signDay(page, 1); must((await publishDay(page, 1)).pressed, 'Tue publish')

// Wednesday: never published, Plan A / Plan B, Plan B edited
log('wed menu', await planMenuItems(page, 2))
await planMenuPick(page, /\+ Alt Plan/)
log('wed head', await head(page, 2))
await editText(page, 'dn:2.0', 'WED PLAN B NOTE')

// Thursday: publish, then a contingency made after publishing, edited, and the day back on Plan A
await signDay(page, 3); must((await publishDay(page, 3)).pressed, 'Thu publish')
await planMenuItems(page, 3); await planMenuPick(page, /\+ Alt Plan/)
await editText(page, 'dn:3.0', 'THU PLAN B — WET WEATHER')
const thuMenu = await planMenuItems(page, 3)
log('thu menu', thuMenu)
await planMenuPick(page, /Plan A/)
log('thu head', await head(page, 3))

// Sunday: Original → AL1 → Unpublish
await signDay(page, 6); must((await publishDay(page, 6)).pressed, 'Sun publish')
const sunKeys = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="6"] [data-txt]')].map(e => e.dataset.txt))
const sunKey = sunKeys.find(k => k.startsWith('dn:6.')) || sunKeys[0]
await editText(page, sunKey, 'SUN NOTE — AL1'); await signDay(page, 6)
must((await publishAL(page, 6)).pressed, 'Sun AL1')
log('sun unpublish', await unpublish(page, 6))
log('sun head', await head(page, 6))

await shot(page, 'fx-week-desktop')
log('book', await book(page))
await ctx.storageState({ path: OUT })
log('saved', OUT)
console.log('errors', errors)
await browser.close()
