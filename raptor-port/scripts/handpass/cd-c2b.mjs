/* C2 part two — a row cancelled then un-cancelled, and a row turned info-only
   then back, while a man earns from it.  F19 / C15.
   Subject: OCU REVIEW 09:00-11:00 with Saber (he also has MASS BRIEF 15:00-16:00,
   so the whole day is 09:00-16:00 = FO; without OCU REVIEW it is 1h = HO). */
import { open, board, shot, tap } from './lib.mjs'
import { bars, modeSnap, warCells, publishAL, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const rowIx = (p, name) => p.evaluate(([i, n]) => window.DAYS[i].ground.findIndex(g => (g.prog || '').toUpperCase() === n), [di, name])


/** The CX button opens a little reason popup; pick the first reason it offers. */
async function cx(page, key) {
  await tap(page, `[data-grcx="${key}"]`)
  await page.waitForTimeout(600)
  const pop = page.locator('#cxPop')
  if (await pop.count() && await pop.isVisible()) {
    const txt = (await pop.innerText()).replace(/\s+/g, ' ').trim()
    const btns = await pop.locator('button').evaluateAll(bs => bs.map(b => (b.innerText || '').trim()))
    await pop.locator('button').first().click()
    await page.waitForTimeout(800)
    return { popup: txt.slice(0, 200), offered: btns, pressed: btns[0] }
  }
  return { popup: null }
}

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
const ix = await rowIx(page, 'OCU REVIEW')
say('OCU REVIEW is ground row', ix)
say('WAR Saber at the start:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)

/* 1 — CANCEL the row */
say('the CX popup:', JSON.stringify(await cx(page, `${di}.${ix}`)))
say('row after CX:', JSON.stringify(await page.evaluate(([i, x]) => { const g = window.DAYS[i].ground[x]; return `${g.prog}|${g.str}-${g.end}|${g.who}|cx=${!!g.cx}|info=${!!g.info}` }, [di, ix])))
say('head:', await headTxt(page))
say('Saber bars with the row cancelled:', JSON.stringify((await bars(page)).filter(b => b.who === 'Saber').slice(0, 3)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Saber with the row cancelled:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
say('MODE items — is a cancelled row still offering a switch?', JSON.stringify((await modeSnap(page)).items.filter(i => /OCU/i.test(i.text))))
await shot(page, 'CD-C2-07-row-cancelled')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p1 = await publishAL(page, di)
say('PUBLISH:', p1.label, '->', await headTxt(page))
say('WAR Saber with the row cancelled:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)

/* 2 — un-cancel it */
say('the un-CX popup:', JSON.stringify(await cx(page, `${di}.${ix}`)))
say('row after un-CX:', JSON.stringify(await page.evaluate(([i, x]) => { const g = window.DAYS[i].ground[x]; return `${g.prog}|cx=${!!g.cx}` }, [di, ix])))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Saber after un-CX:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p2 = await publishAL(page, di)
say('PUBLISH:', p2.label, '->', await headTxt(page))
say('WAR Saber after un-CX:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await shot(page, 'CD-C2-08-row-restored')
await board(page, di)

/* 3 — turn it info-only */
await tap(page, `[data-grinfo="${di}.${ix}"]`)
await page.waitForTimeout(800)
say('row after the ⓘ:', JSON.stringify(await page.evaluate(([i, x]) => { const g = window.DAYS[i].ground[x]; return `${g.prog}|info=${!!g.info}` }, [di, ix])))
const infoTip = await page.evaluate(([i, x]) => { const b = document.querySelector(`#schedBoard [data-grinfo="${i}.${x}"]`); return b ? { t: (b.innerText || '').trim(), title: b.title, cls: b.className } : null }, [di, ix])
say('the ⓘ button says:', JSON.stringify(infoTip))
say('Saber bars on an info-only row:', JSON.stringify((await bars(page)).filter(b => b.who === 'Saber').slice(0, 3)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Saber on an info-only row:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
say('MODE items — does the info-only row offer a switch?', JSON.stringify((await modeSnap(page)).items.filter(i => /OCU/i.test(i.text))))
await shot(page, 'CD-C2-09-row-info-only')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p3 = await publishAL(page, di)
say('PUBLISH:', p3.label, '->', await headTxt(page))
say('WAR Saber with the row info-only:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)

/* 4 — and back to an ordinary row */
await tap(page, `[data-grinfo="${di}.${ix}"]`)
await page.waitForTimeout(800)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Saber when the row is ordinary again:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p4 = await publishAL(page, di)
say('PUBLISH:', p4.label, '->', await headTxt(page))
say('WAR Saber at the end:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await shot(page, 'CD-C2-10-row-ordinary-again')
await board(page, di)
say('HISTORY:', JSON.stringify((await history(page) || {}).top))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
