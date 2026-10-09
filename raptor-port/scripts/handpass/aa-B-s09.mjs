import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, seatTap, seatTitle, closeWin, pubDay, credits, reanswer, savePart } from './aa-B-lib.mjs'
const P = 'dice', W = 'glass', M = 'shaft'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's9'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S9', s: '09:00', e: '12:00', oil: 'no' })
const iid = f.rec.iid
const st = async (label) => { await openCount(page, iid); await tabTo(page, 'earn'); const s = await winState(page); say(label, `P=${s.seats[P]} W=${s.seats[W]} M=${s.seats[M]} on=${s.on}/${s.total}`, '|', s.tabs[1], '| hint:', s.text.slice(-160)); const r = { P: s.seats[P], W: s.seats[W], M: s.seats[M], on: s.on, text: s.text.slice(-200) }; return r }
await openBoard(page, 5); await oilOn(page, true)
await openCount(page, iid); await tabTo(page, 'earn'); await seatTap(page, P); say('No world: tapped P (explicit grant)'); await closeWin(page)
await reanswer(page, iid, 'yes'); say('filer -> Yes')
await openBoard(page, 5); await oilOn(page, true)
await openCount(page, iid); await tabTo(page, 'earn'); await seatTap(page, W); say('Yes world: tapped W (explicit deny)'); await closeWin(page)
out.setup = await st('setup state'); await pic(w, 'setup'); await closeWin(page)
say('publish ORIG', JSON.stringify(await pubDay(page, 5)))
out.c0 = await credits(page, [P, W, M]); say('credits after ORIG', JSON.stringify(out.c0))
await openBoard(page, 5); await oilOn(page, true)
const bl = page.locator('#schedBoard .mbtn.daybtn').filter({ hasText: /earns|Everything|today/i }).first()
say('blanket button text', await bl.innerText())
await bl.click(); await sleep(700)
say('blanket button now', await page.locator('#schedBoard .mbtn.daybtn').first().evaluate(e => e.className + ' | ' + e.innerText + ' | ' + e.title))
await pic(w, 'blanket-off')
out.off1 = await st('blanket OFF'); await pic(w, 'win-blanket-off')
say('seats offered under the blanket:', await page.locator('.availwin .seat.oilpk').count(), '| P seat:', await page.locator(`.availwin .seat.oilpk[data-oilp="${P}"]`).count())
out.off2 = await st('after tapping P and W under the blanket'); await pic(w, 'win-blanket-taps'); await closeWin(page)
await reanswer(page, iid, 'no'); say('filer -> No'); await reanswer(page, iid, 'yes'); say('filer -> Yes')
await openBoard(page, 5); await oilOn(page, true)
out.off3 = await st('blanket OFF after filer re-answers'); await closeWin(page)
say('publish AL (blanket off)', JSON.stringify(await pubDay(page, 5)))
out.c1 = await credits(page, [P, W, M]); say('credits blanket-off AL', JSON.stringify(out.c1))
await openBoard(page, 5); await oilOn(page, true)
const bl2 = page.locator('#schedBoard .mbtn.daybtn').first()
say('blanket button', await bl2.innerText()); await bl2.click(); await sleep(700)
say('blanket button after restore', await page.locator('#schedBoard .mbtn.daybtn').first().innerText())
out.on1 = await st('blanket RESTORED'); await pic(w, 'win-restored'); await closeWin(page)
say('publish AL (restored)', JSON.stringify(await pubDay(page, 5)))
out.c2 = await credits(page, [P, W, M]); say('credits restored AL', JSON.stringify(out.c2))
await pic(w, 'lw')
out.errors = w.errors
await w.browser.close()
savePart('s09-run', { out, log })
