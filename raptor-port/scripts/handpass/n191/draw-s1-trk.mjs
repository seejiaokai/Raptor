// draw-s1-trk - section 1, ledger row 1.23 on a phone: unsaved chart edits asked about at the member-view switch (his
// D2627 A20; the question of D2318, the member-view wording drawn 24 Nov as p5-d-after; D2637 its twin at a pick). On a
// phone the switch is pressed inside the ☰ menu; the plan's reading (D2637's row): the menu closes first, then the
// question. Today nothing is asked at the switch (p5-d-today).
// The question card is the app's own, raised by its own press (as n166 draw-trk's p5): an unsaved chart edit made in
// "Edit chart layout" (a new test event, the editor closed again), then a pick of 149 from the ☰ menu raises the real
// question "Save them before switching to 149?" - only its words then changed to the member-view wording (S1.chartAsk);
// its three buttons as they are. The ☰ menu closed (it closes first). Teal ring: the card.
//   node raptor-port/scripts/handpass/n191/draw-s1-trk.mjs
import { mk, closeAll, FACT, wait, hit, vis, reachPick, barSq, signIn, go, boxOf, tring, sshot, TMP1 } from './draw-s1-lib.mjs'
import { S1 } from './words-s1.mjs'
const s = await mk('p'), k = 's1.trk.p', { page } = s
const question = () => page.evaluate(() => { const m = document.querySelector('#dlgMsg'), d = document.querySelector('#dlgModal'); if (!m || m.getBoundingClientRect().width < 1) return null; return { words: m.textContent.replace(/\s+/g, ' ').trim(), buttons: [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()) } })
try {
  await signIn(s, 'ad', 'a')
  await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 700)
  await hit(s, '#sylMenuBtn', 400); await hit(s, '#arrangeBtn', 500)
  const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await hit(s, vis(s, '#page-tracker button').filter({ hasText: 'Tools ▾' }).first(), 400)
  await hit(s, add, 500); await page.waitForSelector('#dlgInput:visible')
  await vis(s, '#dlgInput').first().evaluate(i => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, 'S1EV'); i.dispatchEvent(new Event('input', { bubbles: true })) })
  await hit(s, '#dlgOk', 500)
  await hit(s, '#sylMenuBtn', 400); await hit(s, '#arrangeBtn', 600)
  FACT(`${k}.editMade`, await page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').includes('S1EV')))
  const p = await reachPick(s, 149, 'menu'); await wait(s, 700)
  const q0 = await question(); FACT(`${k}.realQuestion`, { pressed: !!p.pressed, ...q0 })
  if (!q0) throw new Error('the pick raised no question')
  FACT(`${k}.menuOpenUnderQuestion`, await page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open')))
  /* the menu closes first (the plan's reading of D2637): its own open class taken off */
  await page.evaluate(() => document.querySelector('#drawer')?.classList.remove('open')); await wait(s, 400)
  await page.evaluate(t => { document.querySelector('#dlgMsg').textContent = t }, S1.chartAsk); await wait(s, 200)
  const q = await question(); FACT(`${k}.question`, q)
  FACT(`${k}.state`, { squadron: await barSq(s), menuOpen: await page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open')) })
  if (q.buttons.join('|') !== S1.chartButtons.join('|')) FACT(`${k}.buttonsDiffer`, { drawn: q.buttons, ruled: S1.chartButtons })
  /* the card: the first box round the question that wears an edge of its own */
  const card = await page.evaluate(() => { let e = document.querySelector('#dlgMsg'); while (e && e.id !== 'dlgModal' && getComputedStyle(e).borderTopWidth === '0px') e = e.parentElement; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), el: e.className } })
  FACT(`${k}.card`, card)
  const ring = (await tring(s, card, 'the question')).ring
  await sshot(s, 'trk-p', [ring, { x: 0, y: 0, w: s.W, h: 60 }], 8)
} catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await page.screenshot({ path: `${TMP1}/trk-p-error.png` }).catch(() => {}) } finally { await s.ctx.close().catch(() => {}); await closeAll() }
