/* D4 — [AMEND-SMALL-SEEN] 4: at 390px the solid "AL1" tag beside a changed time is clipped to "AL" (the re-test's W1:
   s1-phone-5-reissued-line — a flying line's time; rc-phone-R7-view-sat-duty — a duty desk's time, its tag running into
   the people column). A flying line's take-off and landing and a duty's start are changed on a published Saturday and
   issued as AL1; then, on the edit week, the board and View-only Sched, at 1440, 390 and 360, every tag beside a time
   must be whole: inside its own cell, not cut by the cell's edge, not over the next column, and no digit covered.
   Usage: node sf-d4-altag.mjs [outdir-suffix] */
const OUT = 'd4-altag' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, go, editWeek, editText, signDay, publishAL, board, closeBoard, check, note, summary, SF_STATE, DESK } = L
const DI = 5

/* Every AL tag riding a TIME: its own box worked out from the ::after's computed style (a pseudo-element has no rect of
   its own), the box of the text it trails, and the cell that holds them. "whole" = the tag's box inside the cell's box
   (so the cell's overflow never cuts it and it never lies over the next column) and clear of the digits. */
const tags = (page, scope) => page.evaluate(scope => {
  const cv = document.createElement('canvas').getContext('2d')
  const out = []
  for (const el of document.querySelectorAll(`${scope} [data-alc]`)) {
    if (!el.offsetWidth || el.matches('.seat, .verchip, .areacell, .rmkcell, .intimes, .sb-rcell')) continue
    const txt = (el.textContent || '').trim()
    if (!/^\d{1,2}:?\d{2}$/.test(txt)) continue                    // a time, and only a time
    const cell = el.closest('.fcell, .timecell, .pl-row > *, .ah-row > *, td, .dl-row > *') || el.parentElement
    const a = getComputedStyle(el, '::after')
    if (!a.content || a.content === 'none') continue
    cv.font = `${a.fontWeight} ${a.fontSize} ${a.fontFamily}`
    const label = 'AL' + el.getAttribute('data-alc')
    const tw = cv.measureText(label).width + parseFloat(a.paddingLeft) + parseFloat(a.paddingRight)
    const th = parseFloat(a.fontSize) * 1.1 + parseFloat(a.paddingTop) + parseFloat(a.paddingBottom)
    const r = el.getBoundingClientRect(), c = cell.getBoundingClientRect()
    const range = document.createRange(); range.selectNodeContents(el.firstChild || el)
    const t = range.getBoundingClientRect()                           // the digits alone
    let box
    if (a.position === 'absolute') {
      const right = r.right - parseFloat(a.right || '0'), top = r.top + parseFloat(a.top || '0')
      box = { left: right - tw, right, top, bottom: top + th }
    } else if (a.display === 'block') {
      box = { left: r.left, right: r.left + tw, top: t.bottom, bottom: t.bottom + th }
    } else {
      const left = t.right + parseFloat(a.marginLeft || '0'); box = { left, right: left + tw, top: t.top, bottom: t.top + th }
    }
    const cs = getComputedStyle(cell)
    const inCell = box.left >= c.left - 0.5 && box.right <= c.right + 0.5
    const coversDigit = box.left < t.right - 0.5 && box.right > t.left + 0.5 && box.top < t.bottom - 1.5 && box.bottom > t.top + 1.5
    out.push({ label, txt, cellCls: String(cell.className).slice(0, 30), cellOverflow: cs.overflowX, pos: a.position, disp: a.display,
      tag: [box.left, box.right].map(Math.round), cell: [c.left, c.right].map(Math.round), digits: [t.left, t.right].map(Math.round), inCell, coversDigit })
  }
  return out
}, scope)

function judge(where, rows) {
  note(where, JSON.stringify(rows))
  check(`${where}: a changed time carries its AL tag`, rows.length > 0, 'none found')
  for (const r of rows) check(`${where}: "${r.label}" beside ${r.txt} is whole inside its cell, no digit covered`, r.inCell && !r.coversDigit, JSON.stringify(r))
}

const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
await editWeek(page)
/* the published Saturday: a flying line's take-off and landing, and a duty's start, changed and issued as the next AL */
const keys = await page.evaluate(di => {
  const all = [...document.querySelectorAll(`#eWeek [data-txt]`)].map(e => e.getAttribute('data-txt'))
  const fly = all.filter(k => new RegExp(`^ff:${di}\\.`).test(k))
  const duty = all.filter(k => !k.startsWith('ff:') && new RegExp(`:${di}\\.`).test(k) && /\.(str|start)$/.test(k))
  return { to: fly.find(k => /\.to$/.test(k)), ld: fly.find(k => /\.ld$/.test(k)), str: duty[0] }
}, DI)
note('the changed times', JSON.stringify(keys))
if (keys.to) await editText(page, keys.to, '0915')
if (keys.ld) await editText(page, keys.ld, '1045')
if (keys.str) await editText(page, keys.str, '0810')
await signDay(page, DI)
const pub = await publishAL(page, DI)
note('Publish AL', JSON.stringify(pub))

for (const [w, h] of [[1440, 900], [390, 844], [360, 780]]) {
  await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(700)
  await go(page, 'editsched'); await page.waitForTimeout(500)
  judge(`edit week ${w}`, await tags(page, `#eWeek .day:nth-of-type(${DI + 1})`).catch(() => tags(page, '#eWeek')))
  await go(page, 'viewsched'); await page.waitForTimeout(600)
  const vrows = await tags(page, '#vWeek')
  judge(`View-only Sched ${w}`, vrows)
  const first = page.locator('#vWeek [data-alc]').filter({ hasText: /^\d{2}:\d{2}$/ }).first()
  if (await first.count()) {
    await first.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
    const bb = await first.boundingBox()
    if (bb) await page.screenshot({ path: `${process.env.HP_SHOTS}/d4-view-${w}.png`, clip: { x: Math.max(0, bb.x - 120), y: Math.max(0, bb.y - 60), width: Math.min(w - Math.max(0, bb.x - 120), 380), height: 170 } })
  }
  /* THE BOARD draws no tag here by design: its times are <input>s, which take no ::after, so a changed time wears a
     solid outline in the AL's colour instead (scheduler.css, "the board's fields are <input>/<textarea>") — counted,
     not judged */
  await board(page, DI)
  note(`board ${w}: time boxes outlined in an AL's colour`, String(await page.evaluate(() => document.querySelectorAll('#schedBoard input[data-alc]').length)))
  await closeBoard(page)
}
check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
process.exitCode = summary('sf-d4-altag') ? 1 : 0
