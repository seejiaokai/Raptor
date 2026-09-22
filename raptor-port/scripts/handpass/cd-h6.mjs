/* H6 — Saturday and Sunday each own their own amendment number.  C22. */
import { open, board, shot } from './lib.mjs'
import { modeSnap, tapOilPerson, warCells, signAndPublish, publishAL, history, BASE_STATE } from './cd-lib.mjs'

const SAT = '2026-07-18', SUN = '2026-07-19'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })

const { browser, page, errors } = await open({ state: BASE_STATE })

/* who is on Sunday at all? */
await board(page, 6)
say('SUNDAY duties:', JSON.stringify(await page.evaluate(() => window.DAYS[6].dutywaves.map(b => b.rows.map(r => `${r.role}|${r.str}-${r.end}|${(window.PEOPLE[r.id] || {}).cs || r.id}`)))))
const SUNMAN = await page.evaluate(() => {
  const r = window.DAYS[6].dutywaves.flatMap(b => b.rows).find(x => x.id)
  return r ? { id: r.id, cs: (window.PEOPLE[r.id] || {}).cs, role: r.role } : null
})
say('Sunday earner:', JSON.stringify(SUNMAN))

/* publish both days */
for (const di of [5, 6]) {
  await board(page, di)
  const r = await signAndPublish(page, di)
  say(`day ${di} published ->`, (r.head || {}).headRow || r.why)
}
await shot(page, 'CD-H6-01-both-published')
say('WAR after both go out:', JSON.stringify(await warCells(page, [['plasma', SAT], [SUNMAN.id, SUN]])))

/* one OIL denial on each day */
for (const [di, cs] of [[5, 'Fable'], [6, SUNMAN.cs]]) {
  await board(page, di)
  await page.locator('#sbOil').click(); await page.waitForTimeout(900)
  const k = await tapOilPerson(page, cs, 0)
  say(`day ${di}: tapped ${cs} ->`, k, JSON.stringify((await modeSnap(page)).people.filter(p => p.who === cs).slice(0, 1)))
  await page.locator('#sbOil').click(); await page.waitForTimeout(700)
  say(`day ${di} head:`, await headTxt(page))
}

/* publish Saturday's change first */
await board(page, 5)
const s1 = await publishAL(page, 5)
say('SATURDAY:', s1.label, '->', await headTxt(page))
await board(page, 6)
say('SUNDAY head while Saturday is AL1:', await headTxt(page))
const sunBtn = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard [data-alpub]')
  return b ? { t: (b.innerText || '').replace(/\s+/g, ' ').trim(), dis: b.disabled, title: b.title } : null
})
say('SUNDAY amendment button reads:', JSON.stringify(sunBtn))
await shot(page, 'CD-H6-02-sunday-still-al1')
const s2 = await publishAL(page, 6)
say('SUNDAY:', s2.label, '->', await headTxt(page))
await shot(page, 'CD-H6-03-both-al1')
await board(page, 5)
say('SATURDAY head at the end:', await headTxt(page))
say('WAR at the end:', JSON.stringify(await warCells(page, [['plasma', SAT], [SUNMAN.id, SUN]])))

/* undo the Sunday publish, then redo it */
await board(page, 6)
say('SUNDAY before undo:', await headTxt(page))
await page.locator('#sbUndo').click(); await page.waitForTimeout(1200)
say('SUNDAY after Undo:', await headTxt(page))
await shot(page, 'CD-H6-04-sunday-after-undo')
say('WAR after Undo:', JSON.stringify(await warCells(page, [['plasma', SAT], [SUNMAN.id, SUN]])))
await board(page, 6)
await page.locator('#sbRedo').click(); await page.waitForTimeout(1200)
say('SUNDAY after Redo:', await headTxt(page))
say('WAR after Redo:', JSON.stringify(await warCells(page, [['plasma', SAT], [SUNMAN.id, SUN]])))
await board(page, 5)
say('SATURDAY untouched by all that:', await headTxt(page))
await shot(page, 'CD-H6-05-after-redo')
say('HISTORY (Sunday):', JSON.stringify((await history(page) || {}).top))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
