// E7 (phone or desktop: SIZE=desk) + E10: Ranger files a Duty for Saber; Saber's bell on Edit Schedule's top bar and on the Scheduler Board.
import { world, sleep, DI, PHONE, DESK, browser, summarise } from './or-E-lib.mjs'
const DSK = process.env.SIZE === 'desk'
const tagp = DSK ? 'e7d' : 'e7'
const w = await world({ size: DSK ? DESK : PHONE, touch: !DSK, who: 'us', pass: 'us', clock: '2026-06-22T09:00:00', tag: tagp })
const { page, press } = w
const tap = async (x, y) => { if (DSK) await page.mouse.click(x, y); else await page.touchscreen.tap(x, y) }
try {
  // Ranger files a Duty for Saber (Wed 15 Jul 14:00-15:00)
  await w.fileIt({ pick: ['Saber'], title: 'Standby brief', from: '14:00', to: '15:00', kind: 'Duty', oil: 'no' })
  w.say(tagp + ' filed', JSON.stringify(await w.rec('Standby brief')))
  w.say(tagp + ' Ranger own bell after filing', JSON.stringify(await w.bellState()))
  await w.signOut(); await w.signIn('ad', 'a')
  // ---- Edit Schedule's top bar
  await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor(); await sleep(500)
  const b1 = await w.bellState(); w.say(tagp + ' Edit Schedule bell', JSON.stringify(b1))
  await w.shot(tagp + '-01-editsched-bell-lit')
  await press(await w.bell()); await sleep(450)
  const f1 = await w.shotList(tagp + '-02-editsched-list')
  w.say(tagp + ' Edit Schedule list', JSON.stringify(summarise(f1)))
  w.say(tagp + ' Edit Schedule list: under pressed bell?', JSON.stringify({ bell: f1.bellRect, list: f1.box, hitIsList: f1.hitIsList, hitTag: f1.hitTag, rightEdgeDelta: f1.rightEdge, vw: f1.vw }))
  w.res(tagp + '_editsched_list', summarise(f1))
  // a press on the page outside closes the list
  const out1 = await page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight - 40); return e ? (e.className || e.tagName) : null })
  await tap(Math.round(page.viewportSize().width / 2), page.viewportSize().height - 40); await sleep(400)
  w.say(tagp + ' press outside (Edit Schedule): hit', out1, 'list open:', await page.locator('.bell-list').count(), 'bell', JSON.stringify(await w.bellState()))
  w.res(tagp + '_editsched_outside', { hit: out1, listOpen: await page.locator('.bell-list').count() })
  // ---- the Scheduler Board
  await w.openBoard(DI); await sleep(300)
  const b2 = await w.bellState(); w.say(tagp + ' board bell', JSON.stringify(b2))
  await w.shot(tagp + '-03-board-bell-lit')
  await press(await w.bell()); await sleep(450)
  const f2 = await w.shotList(tagp + '-04-board-list')
  w.say(tagp + ' board list', JSON.stringify(summarise(f2)))
  w.say(tagp + ' board list: under pressed bell?', JSON.stringify({ bell: f2.bellRect, list: f2.box, hitIsList: f2.hitIsList, hitTag: f2.hitTag, vw: f2.vw }))
  w.res(tagp + '_board_list', summarise(f2))
  // exact elementFromPoint at the list's centre and at each line's centre
  w.say(tagp + ' elementFromPoint at the centre of each list line', JSON.stringify(await page.evaluate(() => { const l = document.querySelector('.bell-list'); return [...l.querySelectorAll('.bl-line')].map(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !!h && (h === l || l.contains(h)) }) })))
  const vp = page.viewportSize()
  const out2 = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.className || e.tagName) + (e.closest('#schedBoard') ? ' (inside board)' : '') : null }, [Math.round(vp.width / 2), vp.height - 30])
  await tap(Math.round(vp.width / 2), vp.height - 30); await sleep(400)
  w.say(tagp + ' press outside (board): hit', out2, '| list open:', await page.locator('.bell-list').count(), '| board open:', await page.locator('#schedBoard:visible').count())
  w.res(tagp + '_board_outside', { hit: out2, listOpen: await page.locator('.bell-list').count(), boardOpen: await page.locator('#schedBoard:visible').count() })
  await w.shot(tagp + '-05-after-outside-press')
  // E10 (phone and desktop): open the list, sign out, sign in as someone else
  if (!DSK || true) {
    await w.openBoard(DI)
    await press(await w.bell()); await sleep(450)
    w.say(tagp + ' E10 list open before sign-out:', await page.locator('.bell-list').count())
    await w.closeBoard().catch(() => {})
    if (!(await page.locator('.bell-list').count())) { await press(await w.bell()); await sleep(400) }
    w.say(tagp + ' E10 list open (top bar) before sign-out:', await page.locator('.bell-list').count())
    await w.shot(tagp + '-06-list-open-before-signout')
    try { await w.signOut() } catch (e) { w.say(tagp + ' E10 sign-out failed: ' + String(e).slice(0, 200)) }
    w.say(tagp + ' E10 after sign-out: list nodes', await page.locator('.bell-list').count(), 'login form', await page.locator('#loginForm').count())
    await w.signIn('us', 'us'); await sleep(500)
    w.say(tagp + ' E10 as Ranger: list nodes', await page.locator('.bell-list').count(), 'bell', JSON.stringify(await w.bellState()))
    w.res(tagp + '_e10', { listNodesAfterSignIn: await page.locator('.bell-list').count(), bell: await w.bellState() })
    await w.shot(tagp + '-07-after-signin-as-ranger')
  }
  w.say(tagp + ' errors', JSON.stringify(w.errors)); w.res(tagp + '_errors', w.errors)
} catch (e) { w.say(tagp + ' SCRIPT FAILED', String(e).slice(0, 700)); await w.shot(tagp + '-zz-fail').catch(() => {}) }
await browser.close()
