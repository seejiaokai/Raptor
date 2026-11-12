// THE APPROVALS PAGE ON A NARROW PC (13 Nov 26, [APPROVALS-SCROLL-INSIDE] — the fresh code read's F1): wider than the
// phone's 700 but narrower than the lines' columns (about 1,210) — an iPad, half a 1920 screen. A line's fixed columns run
// past the box that scrolls: the pinned column headings must cover the whole width the lines take (D1518 — nothing pinned
// leaks), at every place in the list, scrolled down and sideways. Measured on any build, `main` included.
//   cd raptor-port ; APPR_DIST=<build> APPR_OUT=<picture folder> [APPR_TAG=<name>] node scripts/handpass/appr-narrow-pc.mjs
import { launchDesk, stageWorld, pic, writeLog, watchErrors, sleep, PAGE } from './appr-pc-lib.mjs'

console.log('[appr-narrow-pc v1]')
const TAG = process.env.APPR_TAG || 'build'
const log = []; const note = s => { log.push(s); console.log(s) }
let fails = 0
const errs = []
for (const [w, h] of [[1000, 733], [820, 1180], [1280, 733]]) {
  const { browser, page } = await launchDesk({ width: w, height: h })
  watchErrors(page, errs)
  await stageWorld(page)
  const read = () => page.evaluate(sel => {
    const q = s => document.querySelector(`${sel} ${s}`)
    const sc = q('.appr-scroll'), cols = q('.appr-cols'), se = document.scrollingElement
    const line = [...document.querySelectorAll(`${sel} [data-testid^="appr-line-"]`)]
    const bx = e => e && e.getBoundingClientRect()
    const scb = bx(sc), cb = bx(cols)
    /* every line's Approve and Refuse that stands, on screen, in the headings' strip but outside the headings' own box */
    const leak = []
    if (scb && cb) for (const l of line) for (const b of l.querySelectorAll('button')) {
      const r = b.getBoundingClientRect()
      const inStrip = r.bottom > cb.top && r.top < cb.bottom
      const visibleX = Math.max(r.left, scb.left) < Math.min(r.right, scb.left + sc.clientWidth)
      const outsideCols = r.right > cb.right + 0.5 || r.left < cb.left - 0.5
      if (inStrip && visibleX && outsideCols) leak.push(`${b.textContent.trim()} ${Math.round(r.left)}–${Math.round(r.right)} (headings to ${Math.round(cb.right)})`)
    }
    return { winSide: se.scrollWidth - se.clientWidth, scWide: sc ? sc.scrollWidth - sc.clientWidth : null, colsRight: cb && +cb.right.toFixed(1), scRight: scb && +(scb.left + sc.clientWidth).toFixed(1), lineW: line[0] && +line[0].scrollWidth, leak }
  }, PAGE)
  for (const [y, x] of [[0, 0], [60, 0], [120, 0], [200, 0], [120, 200]]) {
    await page.evaluate(([sel, y, x]) => { const sc = document.querySelector(`${sel} .appr-scroll`); if (sc) { sc.scrollTop = y; sc.scrollLeft = x } else scrollTo(x, y) }, [PAGE, y, x]); await sleep(250)
    const m = await read()
    const bad = m.leak.length > 0
    if (bad) fails++
    note(`${TAG} ${w}×${h} list at ${y}, sideways ${x}: ${bad ? 'LEAK' : 'clear'} — headings to ${m.colsRight}, box to ${m.scRight}, a line ${m.lineW} wide, the box scrolls sideways by ${m.scWide}, the window by ${m.winSide}${bad ? ' — ' + m.leak.slice(0, 3).join('; ') : ''}`)
    if (y === 120) await pic(page, `narrow-${TAG}-${w}-at${y}-x${x}`)
  }
  await browser.close()
}
note(`errors: ${errs.length ? errs.join(' | ') : 'none'}`)
note(fails ? `LEAKS at ${fails} places` : 'no leak at any place')
writeLog(`narrow-${TAG}-log.txt`, log)
process.exit(fails ? 1 : 0)
