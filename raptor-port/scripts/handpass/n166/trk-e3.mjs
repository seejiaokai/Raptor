// trk-e3 - case E(3): the Tracker failing part-way through a switch, with a window open.
// Saber opens the Tracker (its chart drawn, so it is loaded on 142), goes to Inputs, opens an input and types in its
// Remarks, then picks 149 by the top-bar list. STAND-IN (chat 162's sw-a.mjs 'mapget', installed from inside the page
// just before the pick): the in-memory store refuses every read of 149's Tracker records (Map.prototype.get throws for
// keys starting "tracker/u149@") - a store that cannot be read. What the Input window, the bar and the Tracker page say.
//   node raptor-port/scripts/handpass/n166/trk-e3.mjs <d|402x874>
// Pictures: E3-<d|p>-*.png
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, pic, windowsNow, reachPick, wait, bands, SZTAG } from './lib.mjs'
const SZ = process.argv[2] || 'd', T = SZTAG(SZ), k = `E3.${T}`, P = `E3-${T}`
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
async function hit(s, l, ms = 400) { l = typeof l === 'string' ? vis(s, l).first() : l; await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }); await wait(s, ms) }
const s = await mk(SZ); const { page } = s
try {
  console.log('trk-e3 v1', SZ)
  await signIn(s, 'ad', 'a')
  await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
  FACT(`${k}.trackerLoadedOn`, await barSq(s))
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!/All dates/.test((await page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '')) { await hit(s, '#inRangeBtn'); if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first(); const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  const r = vis(s, '#inpEditRmk').first(); await r.click(); await page.keyboard.press('Control+a'); await page.keyboard.type('N166E3 words')
  FACT(`${k}.windowOpen`, (await windowsNow(s)).map(x => x.what))
  await page.evaluate(() => { window.__n166 = { hits: 0 }; const g = Map.prototype.get; Map.prototype.get = function (key) { if (typeof key === 'string' && key.startsWith('tracker/u149@')) { window.__n166.hits++; throw new Error('store refused a read') } return g.call(this, key) } })
  FACT(`${k}.standIn`, 'reads of 149\'s Tracker records refused (Map.prototype.get throws for tracker/u149@ keys), from just before the pick')
  let p = await reachPick(s, 149, 'bar'); FACT(`${k}.press`, p)
  if (!p.pressed && !s.desk) { p = await reachPick(s, 149, 'menu'); FACT(`${k}.pressMenu`, p) }
  if (!p.pressed) { FACT(`${k}.result`, 'the pick cannot be reached with the window open at this size; the case is not reached by presses'); await pic(s, `${P}-1-pick-covered`); throw new Error('stop: not reachable') }
  await wait(s, 2500)
  FACT(`${k}.after`, { squadron: await barSq(s), page: await pageOn(s), bands: await bands(s), standInHits: await page.evaluate(() => window.__n166.hits) })
  FACT(`${k}.after.windows`, (await windowsNow(s)).map(x => ({ what: x.what, words: x.words.slice(0, 140), inert: x.inert })))
  await pic(s, `${P}-1-after-pick`)
  if (await vis(s, '#inpEditPop button, .inpedwin button').filter({ hasText: /^Close$/ }).count()) { await hit(s, vis(s, '.inpedwin button, #inpEditPop button').filter({ hasText: /^Close$/ }).first(), 600); FACT(`${k}.windowClosedByItsClose`, (await windowsNow(s)).map(x => x.what)) }
  await go(s, 'tracker'); await wait(s, 1500)
  const panel = await page.evaluate(() => { const root = document.querySelector('#page-tracker .tr-root'); return { text: (document.querySelector('#page-tracker')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240), buttons: root ? [...root.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()).slice(0, 8) : [], chart: !!document.querySelector('#flowSvg .ball') } })
  FACT(`${k}.trackerPage`, panel)
  await pic(s, `${P}-2-tracker-page`)
} catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)); process.exitCode = 1 } finally { await closeAll() }
