// The marking helper's self-test ([DRAW-MARK-HELPER], 14 Nov 26): a tiny page of its own, loaded in a real browser,
// on which each fault the helper exists to catch is staged and must be caught — and a good mark must pass. Run after
// any change to drawmark.mjs, or to the drawing check's measure:
//   cd raptor-port ; node scripts/handpass/drawmark-selftest.mjs        (exits 1 on a miss)
// The faults are the ones a drawing script once let through in silence (skill notes 820, 848, 822, 742).
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium, LAUNCH, measureParts } from '../drawcheck/lib.mjs'
import { drawMarks, MARK_COLOUR } from './drawmark.mjs'

console.log('[drawmark selftest v1]')
const PAGE = `<!doctype html><html><head><style>
  body { margin: 0; font: 14px sans-serif; background: #fff }
  #bell { position: fixed; top: 40px; right: 20px; width: 200px; background: #223; color: #fff }
  #bell .row { padding: 6px }
  .moves-it, #bell.moves-it { position: relative }    /* the 820 class: harmless on a static part, not on a fixed one */
  #panel { position: absolute; top: 200px; left: 20px; width: 240px; height: 40px; overflow: hidden; background: #ddd }
  #panel .cell { margin-top: 4px; padding: 4px }
  #para { margin: 320px 0 0 20px; width: 160px }
  #toast { position: fixed; bottom: 10px; left: 10px; background: #333; color: #fff; padding: 4px }
</style></head><body>
  <div id="bell"><div class="row">one</div><div class="row" id="two">two</div></div>
  <div id="panel"><div class="cell">inside the panel</div></div>
  <p id="para">a plain paragraph</p>
  <div id="toast">Saved</div>
</body></html>`

const dir = mkdtempSync(join(tmpdir(), 'drawmark-'))
const logFile = join(dir, 'run.log')
const results = []
const ok = (name, pass, more = '') => { results.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${more ? ' — ' + more : ''}`) }
const refused = async (fn) => { try { await fn(); return '' } catch (e) { return e.message } }
const boxOf = (page, sel) => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, sel)
const sameBox = (a, b) => ['x', 'y', 'w', 'h'].every(k => Math.abs(a[k] - b[k]) <= 0.5)

const browser = await chromium.launch(LAUNCH)
try {
  const page = await (await browser.newContext({ viewport: { width: 800, height: 600 } })).newPage()
  await page.setContent(PAGE)
  const lines = []
  const dm = await drawMarks(page, { logFile, log: s => { lines.push(s); console.log('      log: ' + s) } })

  // 1. a mark that would move a fixed list (820): the caller's class sets position:relative on the bell's fixed list
  const bell0 = await boxOf(page, '#bell')
  const m1 = await refused(() => dm.mark('#bell', { tag: '1', addClass: 'moves-it' }))
  const bell1 = await boxOf(page, '#bell')
  ok('a mark that would move a fixed list is refused', /moved or resized/.test(m1), m1.slice(0, 140))
  ok('… and taken back: the list is where it was, no ring, no tag', sameBox(bell0, bell1)
    && await page.evaluate(() => !document.querySelector('#bell[data-drawmark-ring], #bell [data-drawmark-tag]') && !document.querySelector('#bell').classList.contains('moves-it')))

  // 2. a tag cut off by a panel that hides its overflow (848): pinned above the cell it is refused; left to find its
  // place it moves inside, wholly visible
  const m2 = await refused(() => dm.mark('#panel .cell', { tag: '2', place: 'above' }))
  ok('a tag cut off by an overflow-hidden parent is refused', /cut off by div#panel/.test(m2), m2.slice(0, 160))
  const r2 = await dm.mark('#panel .cell', { tag: '2' })
  ok('… or moved inside, where it is wholly visible', r2.ok && r2.place === 'inside', `placed ${r2.place}`)

  // 3. a page error printed as it happens (822)
  await page.evaluate(() => setTimeout(() => { throw new Error('drawmark selftest boom') }, 0))
  await page.waitForTimeout(150)
  const said = lines.find(l => /\[page error\] drawmark selftest boom/.test(l))
  ok('a page error is printed to the run\'s log as it happens', !!said && dm.errors.length === 1, said || 'nothing printed')
  ok('… and written to the log file at once', existsSync(logFile) && /drawmark selftest boom/.test(readFileSync(logFile, 'utf8')))

  // a good mark on a fixed list's row: its box unchanged, its tag above it, inside the window, in the marker colour
  const two0 = await boxOf(page, '#two')
  const r3 = await dm.mark('#two', { tag: 'Ranger' })
  ok('a good mark passes, its part\'s box unchanged', r3.ok && sameBox(two0, await boxOf(page, '#two')), `placed ${r3.place}`)
  const look = await page.evaluate(() => { const e = document.querySelector('#two'), t = e.querySelector('[data-drawmark-tag]'), s = getComputedStyle(e); return { outline: s.outlineStyle + ' ' + s.outlineColor, pos: s.position, tag: t && getComputedStyle(t).backgroundColor } })
  ok('… a ring drawn as an outline in the marker colour, the part\'s position untouched', look.outline === 'solid rgb(255, 45, 149)' && look.pos === 'static' && look.tag === 'rgb(255, 45, 149)', JSON.stringify(look))
  // the drawing check's measure never reads the tag as the part's words (742)
  const meas = await page.evaluate(measureParts, [{ name: 'two', sel: '#two' }])
  ok('the drawing check measures the part\'s own words, not its tag', meas.parts.two.text === 'two' && sameBox(two0, meas.parts.two.box), `measured "${meas.parts.two.text}"`)

  // hide, never remove (822)
  const h = await dm.hide('#toast')
  ok('hide() takes a part out of the picture and leaves it in the page', h.count === 1
    && await page.evaluate(() => { const t = document.querySelector('#toast'); return !!t && getComputedStyle(t).display === 'none' }))
  ok('the helper offers no remove()', !('remove' in dm) && typeof dm.hide === 'function')

  // the picture: taken when every mark holds, refused when the app's redraw wiped one
  const shot1 = await refused(() => dm.shot({ path: join(dir, 'good.png') }))
  ok('the picture is taken while every mark holds', !shot1 && existsSync(join(dir, 'good.png')), shot1)
  await page.evaluate(() => { document.querySelector('#bell').style.top = '90px' })     // the app moves the list after the mark
  const shot2 = await refused(() => dm.shot({ path: join(dir, 'moved.png') }))
  ok('the picture is refused when a marked part moved after it was marked', /moved or changed size since it was marked/.test(shot2) && !existsSync(join(dir, 'moved.png')), shot2.slice(0, 160))
  await page.evaluate(() => { document.querySelector('#bell').style.top = '' })
  await page.evaluate(() => { document.querySelector('#two').textContent = 'two' })   // the app redraws the row: our tag is gone
  const shot3 = await refused(() => dm.shot({ path: join(dir, 'wiped.png') }))
  ok('… and when a redraw wiped a tag', /tag was wiped/.test(shot3) && !existsSync(join(dir, 'wiped.png')), shot3.slice(0, 140))
  const c = await dm.clear()
  ok('clear() takes away only the helper\'s own marks', c.count === 2 && await page.evaluate(() => !document.querySelector('[data-drawmark-tag], [data-drawmark-ring]') && !!document.querySelector('#two') && !!document.querySelector('#toast')))
  ok('a ring colour of its own: the marker the drawing check leaves out', MARK_COLOUR === '#ff2d95')
} finally {
  await browser.close()
}
const bad = results.filter(r => !r).length
console.log(bad ? `${bad} FAILED` : `all ${results.length} PASS`)
process.exit(bad ? 1 : 0)
