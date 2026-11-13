/* d-24-explain v1 — pictures for his two questions of 13 Nov 26 (no change to the app; the real pending list, read).
   usage (from raptor-port/): node scripts/handpass/d2028/d-24-explain.mjs pc|phone q1|vague [mock]
   q1    — [OIL-LINE-DECISION-HIDDEN]: his D2028 fixture (Saturday: Briefing 09:00 no end + ALL AVAIL; Ranger's Ground row
           10:15–10:45; published, signed), Logic "Any other row" 1h → 2h, then OIL Earn's "No OIL earned" switched ON
           for the day. The pending list as it reads today. With "mock": the recommended line DRAWN over it (a drawing).
   vague — the same published day, NO Logic change, "No OIL earned" switched on: the line "What this day earns: changed"
           as the app draws it (the words the rare tie [CROWD-TIE-KEPT-LENGTH] would show). */
const KIND = process.argv[2] || 'phone', MODE = process.argv[3] || 'q1', MOCK = process.argv[4] === 'mock'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/explain-' + MODE + '-' + KIND
const { mkdirSync } = await import('node:fs'); mkdirSync(process.env.HP_SHOTS, { recursive: true })
console.log('d-24 v1', KIND, MODE, MOCK)
const D = await import('./d-lib.mjs')
const { X, L, sleep, j, SAT } = D
const w = await D.world(KIND)
const { page } = w
const ranger = w.ID('Ranger')
const press = async loc => { await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); if (w.phone) await loc.tap(); else await loc.click(); await sleep(700) }

const a = await D.addCommon(w, SAT, 'Briefing', '09:00')
await D.drop(w, `a:${SAT}.${a.ri}.+`, 'allavail')
await D.addGround(w, SAT, 'Ground Programme', '10:15', '10:45', ranger)
const p = await D.pub(w, SAT); await D.signFour(w, SAT); await L.closeBoard(page)
console.log('published', j(p.pressed))
if (MODE === 'q1') console.log('logic', j(await D.setLogic(w, 'openEnd', '2h', 'e0-logic-2h')))

await L.board(page, SAT)
await press(page.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first())
await D.shot(page, 'e1-oil-earn-on')
const sw = page.locator(`#schedBoard [data-oilblank="${SAT}"]:visible`).first()
console.log('switch found', await sw.count())
await press(sw)
console.log('switch on', await page.evaluate(i => { const e = document.querySelector(`#schedBoard [data-oilblank="${i}"]`); return e && e.checked }, SAT))
await D.shot(page, 'e2-no-oil-earned-on')
await press(page.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first())
await L.closeBoard(page)

const b = page.locator(`#eWeek .day[data-day="${SAT}"] .dpend:visible`).first()
console.log('pending button', await b.count() ? (await b.innerText()).replace(/\s+/g, ' ') : '(none)')
await press(b)
const win = page.locator('.chgwin:visible').first()
console.log('LIST', (await win.innerText()).replace(/\s+/g, ' ').slice(0, 600))
console.log('ITEMS', await win.evaluate(e => { const its = [...e.querySelectorAll('*')].filter(x => /who it stands for|What this day earns/.test(x.textContent) && x.children.length && x.children.length < 8); const it = its[its.length - 1]; return it ? it.parentElement.outerHTML.slice(0, 1800) : '(none)' }))
await D.shot(page, 'e3-pending-list-today')
const rect = sel => win.evaluate((e, q) => { const x = e.querySelector(q); if (!x) return null; const r = x.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v * devicePixelRatio)) }, sel)
console.log('RECT list', JSON.stringify(await rect('.pl-list')), 'dpr', await page.evaluate(() => devicePixelRatio))
if (MOCK) {
  // A DRAWING: the recommended line, made from the list's own parts (the line's own element, its words changed).
  await win.evaluate(e => {
    const it = e.querySelector('.pl-list .pl-item'); if (!it) return
    it.querySelector('.pl-where').textContent = 'What this day earns'
    const chg = it.querySelector('.pl-chg')
    chg.innerHTML = '<b>No OIL earned: switched on</b><br><span style="font-weight:400">Briefing · who it stands for: </span><s>Ranger</s> → <b>no longer free</b>'
  })
  await sleep(300)
  console.log('RECT list drawn', JSON.stringify(await rect('.pl-list')))
  await D.shot(page, 'e4-recommended-DRAWING')
}
await w.browser.close()
