// The marking helper's self-test ([DRAW-MARK-HELPER], 14 Nov 26): a tiny page of its own, loaded in a real browser,
// on which each fault the helper exists to catch is staged and must be caught — and a good mark must pass. Run after
// any change to drawmark.mjs, or to the drawing check's measure:
//   cd raptor-port ; node scripts/handpass/drawmark-selftest.mjs        (exits 1 on a miss)
// DRAWMARK=<file> runs it against another copy of the helper — how the fix round showed each new case red against the
// helper as it was before (docs/handpass/2026-11-14-check-tools.md §Fix round).
// The faults are the ones a drawing script once let through in silence (skill notes 820, 848, 822, 742), and those the
// two readers of the helper found (the fix round, 14 Nov 26).
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium, LAUNCH, measureParts } from '../drawcheck/lib.mjs'

const helper = process.env.DRAWMARK ? pathToFileURL(resolve(process.env.DRAWMARK)).href : './drawmark.mjs'
const { drawMarks, MARK_COLOUR } = await import(helper)
console.log(`[drawmark selftest v2]${process.env.DRAWMARK ? ' against ' + process.env.DRAWMARK : ''}`)
const PAGE = `<!doctype html><html><head><style>
  body { margin: 0; font: 14px sans-serif; background: #fff }
  #bell { position: fixed; top: 40px; right: 20px; width: 200px; background: #223; color: #fff }
  #bell .row { padding: 6px }
  .moves-it, #bell.moves-it { position: relative }    /* the 820 class: harmless on a static part, not on a fixed one */
  .moves-far { margin-left: 40px }
  .hl { color: rgb(200, 0, 0) }
  #panel { position: absolute; top: 200px; left: 20px; width: 240px; height: 40px; overflow: hidden; background: #ddd }
  #panel .cell { margin-top: 4px; padding: 4px }
  #wrap { margin: 320px 0 0 20px; width: 160px }
  #toast { position: fixed; bottom: 10px; left: 10px; background: #333; color: #fff; padding: 4px }
  /* a fixed part inside a panel that clips: the panel does not cut it off (it escapes), so a tag above it stands */
  #clipbox { position: absolute; top: 400px; left: 300px; width: 200px; height: 40px; overflow: hidden; background: #eee }
  #fixedin { position: fixed; top: 410px; left: 320px; width: 120px; background: #9cf }
  /* a panel drawn at half its size: it shows 100px across, not its own 200 */
  #scaled { position: absolute; top: 480px; left: 400px; width: 200px; height: 60px; overflow: hidden; transform: scale(.5); transform-origin: 0 0; background: #fd9 }
  #scaled .far { margin-left: 150px; width: 40px; height: 30px; background: #c96 }
  #zoomed { position: absolute; top: 480px; left: 560px; width: 200px; height: 60px; overflow: hidden; zoom: .5; background: #9fd }
  #zoomed .far { margin-left: 150px; width: 40px; height: 30px; background: #6c9 }
  #scroller { position: absolute; top: 300px; left: 520px; width: 160px; height: 80px; overflow: auto; background: #eef }
  #scroller .it { height: 30px; margin: 4px; background: #ccf }
  /* the app's own rules that read a part's children */
  #list { position: absolute; top: 120px; left: 300px; margin: 0; padding: 0 0 0 20px; width: 150px }
  #list > li:last-child { color: rgb(0, 128, 0) }
  #emptycell { position: absolute; top: 160px; left: 300px; width: 60px; height: 20px; background: #eee }
  #emptycell:empty::before { content: '–' }
  #pre { position: absolute; top: 560px; left: 20px; width: 120px }
</style></head><body>
  <div id="bell"><div class="row">one</div><div class="row" id="two">two</div></div>
  <div id="panel"><div class="cell">inside the panel</div></div>
  <div id="wrap"><p id="para">a plain paragraph</p></div>
  <div id="toast">Saved</div>
  <div id="clipbox"><div id="fixedin">fixed, not clipped</div></div>
  <div id="scaled"><div class="far"></div></div>
  <div id="zoomed"><div class="far"></div></div>
  <div id="scroller"><div class="it">a</div><div class="it" id="sitem">b</div><div class="it">c</div><div class="it">d</div><div class="it">e</div></div>
  <ul id="list"><li>first</li><li id="lastli">last</li></ul>
  <div id="emptycell"></div>
  <div id="pre" class="hl">already lit</div>
</body></html>`

const dir = mkdtempSync(join(tmpdir(), 'drawmark-'))
const logFile = join(dir, 'run.log')
const results = []
const ok = (name, pass, more = '') => { results.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${more ? ' — ' + more : ''}`) }
const refused = async (fn) => { try { await fn(); return '' } catch (e) { return e.message } }
const boxOf = (page, sel) => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, sel)
const sameBox = (a, b) => ['x', 'y', 'w', 'h'].every(k => Math.abs(a[k] - b[k]) <= 0.5)
const faultsNow = async dm => { try { const r = await dm.check(); return r.faults || [] } catch (e) { return [e.message] } }

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
    && await page.evaluate(() => !document.querySelector('#bell[data-drawmark-ring], [data-drawmark-tag]') && !document.querySelector('#bell').classList.contains('moves-it')))

  // 2. a tag cut off by a panel that hides its overflow (848): pinned above the cell it is refused; left to find its
  // place it moves inside, wholly visible
  const m2 = await refused(() => dm.mark('#panel .cell', { tag: '2', place: 'above' }))
  ok('a tag cut off by an overflow-hidden parent is refused', /div#panel/.test(m2), m2.slice(0, 160))
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
  const look = await page.evaluate(() => { const e = document.querySelector('#two'), t = document.querySelector('[data-drawmark-tag]:last-of-type'), s = getComputedStyle(e); return { outline: s.outlineStyle + ' ' + s.outlineColor, pos: s.position, tag: t && getComputedStyle(t).backgroundColor } })
  ok('… a ring drawn as an outline in the marker colour, the part\'s position untouched', look.outline === 'solid rgb(255, 45, 149)' && look.pos === 'static' && look.tag === 'rgb(255, 45, 149)', JSON.stringify(look))
  // the drawing check's measure never reads the tag as the part's words (742), and records that the part is marked
  const meas = await page.evaluate(measureParts, [{ name: 'two', sel: '#two' }, { name: 'one', sel: '#bell .row' }])
  ok('the drawing check measures the part\'s own words, not its tag', meas.parts.two.text === 'two' && sameBox(two0, meas.parts.two.box), `measured "${meas.parts.two.text}"`)
  ok('… and records which part the drawing marked (the marker colour is excused only there)', meas.parts.two.marked === true && meas.parts.one.marked === false, `two ${meas.parts.two.marked}, one ${meas.parts.one.marked}`)

  // hide, never remove (822)
  const h = await dm.hide('#toast')
  ok('hide() takes a part out of the picture and leaves it in the page', h.count === 1
    && await page.evaluate(() => { const t = document.querySelector('#toast'); return !!t && getComputedStyle(t).display === 'none' }))
  ok('the helper offers no remove()', !('remove' in dm) && typeof dm.hide === 'function')
  await dm.show('#toast')

  // ---- the fix round's cases (the two readers, 14 Nov 26) ----
  // K1 (E): the tag never becomes the part's child, so the app's own rules that read children are untouched
  const li0 = await page.evaluate(() => getComputedStyle(document.querySelector('#lastli')).color)
  const e0 = await page.evaluate(() => getComputedStyle(document.querySelector('#emptycell'), '::before').content)
  const k1a = await refused(() => dm.mark('#list', { tag: 'the list' }))
  const k1b = await refused(() => dm.mark('#emptycell', { tag: 'empty' }))
  const li1 = await page.evaluate(() => getComputedStyle(document.querySelector('#lastli')).color)
  const e1 = await page.evaluate(() => getComputedStyle(document.querySelector('#emptycell'), '::before').content)
  ok('marking a list leaves its last row as the app draws it (`:last-child`)', !k1a && li0 === li1, `${li0} → ${li1}${k1a ? ' ' + k1a.slice(0, 80) : ''}`)
  ok('marking an empty cell leaves its dash (`:empty`)', !k1b && e0 === e1, `${e0} → ${e1}${k1b ? ' ' + k1b.slice(0, 80) : ''}`)
  ok('… the tags stand outside the app\'s tree, none inside a part', await page.evaluate(() => !document.querySelector('body [data-drawmark-tag]')))

  // K2 (the blockOf guard): a fixed part inside a clipping panel escapes it, so a tag pinned above it stands
  const k2 = await refused(() => dm.mark('#fixedin', { tag: 'fixed', place: 'above' }))
  ok('a fixed part inside a clipping panel: a tag pinned above it is not refused (the panel does not cut it)', !k2, k2.slice(0, 140))

  // K3 (F): a scaled panel and a zoomed one show half their width — a tag past that is cut off, refused
  const k3 = await refused(() => dm.mark('#scaled .far', { tag: 'scaled part', place: 'inside' }))
  ok('a panel drawn at half size cuts off a tag past its drawn edge: refused', /div#scaled/.test(k3), k3.slice(0, 160) || 'NOT REFUSED')
  const k3z = await refused(() => dm.mark('#zoomed .far', { tag: 'zoomed part', place: 'inside' }))
  ok('… and a zoomed panel the same', /div#zoomed/.test(k3z), k3z.slice(0, 160) || 'NOT REFUSED')

  // K4: a scroller scrolled after the mark — the picture is refused
  await dm.mark('#sitem', { tag: 'b', place: 'inside' })
  await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 20 })
  const k4 = await refused(() => dm.shot({ path: join(dir, 'scrolled.png') }))
  ok('a panel scrolled after the mark: the picture is refused', /sitem/.test(k4) && !existsSync(join(dir, 'scrolled.png')), k4.slice(0, 160) || 'NOT REFUSED')
  await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 0 })

  // K5 (I): a marked part made see-through by an ancestor, or hidden — check and the picture refuse
  await dm.mark('#para', { tag: 'para' })
  await page.evaluate(() => { document.querySelector('#wrap').style.opacity = '0' })
  const k5 = (await faultsNow(dm)).join(' | ')
  const k5s = await refused(() => dm.shot({ path: join(dir, 'invisible.png') }))
  ok('a part made see-through by its parent: check reports it, the picture is refused', /no longer shown/.test(k5) && /no longer shown/.test(k5s) && !existsSync(join(dir, 'invisible.png')), (k5 || 'NO FAULT').slice(0, 160))
  await page.evaluate(() => { document.querySelector('#wrap').style.opacity = ''; document.querySelector('#para').style.visibility = 'hidden' })
  const k5b = (await faultsNow(dm)).join(' | ')
  ok('… and a part made hidden', /no longer shown/.test(k5b), (k5b || 'NO FAULT').slice(0, 160))
  await page.evaluate(() => { document.querySelector('#para').style.visibility = '' })

  // K6 (J): a second mark on a marked part is refused before it touches the first, and says why
  const k6 = await refused(() => dm.mark('#para', { tag: 'again', addClass: 'moves-far' }))
  const k6f = await faultsNow(dm)
  ok('a second mark on a marked part is refused, and says it is already marked', /already marked/.test(k6), k6.slice(0, 140) || 'NOT REFUSED')
  ok('… the first mark stays whole: no fault after it', k6f.length === 0 && await page.evaluate(() => document.querySelector('#para').hasAttribute('data-drawmark-ring')), k6f.join(' | ').slice(0, 160))

  // K7 (G): addClass is taken back exactly — a class the part already had stays, on a refusal and on clear()
  const k7 = await refused(() => dm.mark('#pre', { addClass: 'hl moves-far' }))
  const k7c = await page.evaluate(() => document.querySelector('#pre').className)
  ok('a refused mark takes off only the classes it added (the part\'s own "hl" stays)', /moved or resized/.test(k7) && k7c === 'hl', `class now "${k7c}"`)
  await dm.mark('#toast', { addClass: 'hl' })
  await dm.clear()
  const k7d = await page.evaluate(() => ({ toast: document.querySelector('#toast').className, pre: document.querySelector('#pre').className }))
  ok('clear() takes off the classes the marks added, and only those', k7d.toast === '' && k7d.pre === 'hl', JSON.stringify(k7d))

  // K8 (H): hide inside a surface that is not there refuses and hides nothing
  const k8 = await refused(() => dm.hide('#toast', { within: '#no-such-panel' }))
  const k8v = await page.evaluate(() => getComputedStyle(document.querySelector('#toast')).display)
  ok('hide() inside a missing surface is refused and hides nothing', !!k8 && k8v !== 'none', `${k8.slice(0, 100) || 'NOT REFUSED'}; toast ${k8v}`)

  // the picture: taken when every mark holds, refused when a marked part moved, or the app redrew it
  await dm.mark('#two', { tag: 'Ranger' })
  const shot1 = await refused(() => dm.shot({ path: join(dir, 'good.png') }))
  ok('the picture is taken while every mark holds', !shot1 && existsSync(join(dir, 'good.png')), shot1)
  await page.evaluate(() => { document.querySelector('#bell').style.top = '90px' })     // the app moves the list after the mark
  const shot2 = await refused(() => dm.shot({ path: join(dir, 'moved.png') }))
  ok('the picture is refused when a marked part moved after it was marked', /moved or changed size since it was marked/.test(shot2) && !existsSync(join(dir, 'moved.png')), shot2.slice(0, 160))
  await page.evaluate(() => { document.querySelector('#bell').style.top = '' })
  await page.evaluate(() => { const o = document.querySelector('#two'); o.outerHTML = '<div class="row" id="two">two</div>' })   // the app redraws the row
  const shot3 = await refused(() => dm.shot({ path: join(dir, 'wiped.png') }))
  ok('… and when the app redrew the marked part', /redrawn and the mark is gone/.test(shot3) && !existsSync(join(dir, 'wiped.png')), shot3.slice(0, 140))
  await dm.clear()
  await dm.mark('#two', { tag: 'Ranger' })
  await page.evaluate(() => document.querySelectorAll('[data-drawmark-tag]').forEach(t => t.remove()))
  const shot4 = await refused(() => dm.shot({ path: join(dir, 'tagless.png') }))
  ok('… and when its tag was wiped', /tag was wiped/.test(shot4) && !existsSync(join(dir, 'tagless.png')), shot4.slice(0, 140))
  const c = await dm.clear()
  ok('clear() takes away only the helper\'s own marks', c.count === 1 && await page.evaluate(() => !document.querySelector('[data-drawmark-tag], [data-drawmark-ring]') && !!document.querySelector('#two') && !!document.querySelector('#toast')))
  ok('a ring colour of its own: the marker the drawing check leaves out on a marked part', MARK_COLOUR === '#ff2d95')
} finally {
  await browser.close()
}
const bad = results.filter(r => !r).length
console.log(bad ? `${bad} FAILED` : `all ${results.length} PASS`)
process.exit(bad ? 1 : 0)
