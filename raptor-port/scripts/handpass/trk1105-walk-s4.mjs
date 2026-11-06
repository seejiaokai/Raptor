/* S4 — a browser whose storage cannot be touched (D admin Chromium; P member WebKit).  node scripts/handpass/trk1105-walk-s4.mjs */
import { showAllSel, open, words, pair, grade, mark, exportFile, click, shot, tap2, mk, sleep, D, P } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s4 v1')
const L = mk('S4')
for (const [tag, engine, size, touch, who] of [['D', 'chromium', D, false, 'a'], ['P', 'webkit', P, true, 'u']]) {
  const role = who === 'a' ? 'admin' : 'member'
  let r
  try { r = await open({ engine, size, touch, who, locked: true }) } catch (e) { L.ok('app boots and the Tracker opens with storage locked', tag, role, false, e.message.slice(0, 200)); continue }
  const { browser, page, errors } = r
  const lk = await page.evaluate(() => { try { void window.localStorage; return 'readable' } catch (e) { return 'throws ' + e.name } })
  L.ok('premise: reading localStorage throws', tag, role, /throws/.test(lk), lk)
  L.ok('app boots, Tracker opens with its chart', tag, role, (await page.locator('#flowSvg .ball').count()) > 3, 'balls ' + await page.locator('#flowSvg .ball').count(), await shot(page, `S4-${tag}-opened`))
  await mark(page, 'ST-02', 'dco', touch)
  const g = await grade(page, 'ST-02'), w = await words(page), pr = await pair(page)
  L.ok('mark shows', tag, role, g === 'dco', `grade ${g}; corner "${w.corner}"; band "${w.band}"`, await shot(page, `S4-${tag}-marked`))
  L.ok('corner shows no error', tag, role, !/not saved|error|fail/i.test(w.corner + w.band), `corner "${w.corner}" band "${w.band}"`)
  await click(page, '.topbar #trUndoBtn', touch); await sleep(600)
  L.ok('mark undoes from the top bar', tag, role, (await grade(page, 'ST-02')) !== 'dco', 'grade ' + await grade(page, 'ST-02'))
  await click(page, showAllSel(touch), touch)
  await sleep(900)
  const sa = await shot(page, `S4-${tag}-showall`)
  const open_ = await page.evaluate(() => !!document.querySelector('#showAllModal, #allModal, .showall, [id*=howAll]'))
  L.note('Show All state', 'a Show All-like element ' + open_)
  if (!touch) { await page.keyboard.press('Escape'); await sleep(400)
    try { await exportFile(page, 'S4-export.json'); L.ok('Export produces a file', tag, role, true, 'saved; alert "' + (exportFile.lastAlert || '').slice(0, 80).replace(/\n/g, ' ') + '"') } catch (e) { L.ok('Export produces a file', tag, role, false, e.message.slice(0, 150)) } }
  L.note('errors', errors.join(' | ') || 'none')
  await browser.close()
}
L.save('S4')
