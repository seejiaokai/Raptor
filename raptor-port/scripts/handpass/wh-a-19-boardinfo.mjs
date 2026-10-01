/* [WARN-HIDE-KEPT] walker A — scenario 23 on the Scheduler Board: the board's own ⓘ, with one warning hidden and with
   all hidden (the working face). One world. */
import { world, boardOpenFold, readBoard, tapBoardLine, judge, row, savePart, pic, guard, L, W } from './wh-a-lib.mjs'
const TUE = 1
const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
const info = async (shot) => {
  const b = p.locator('#schedBoard [data-dayinfo="1"]:visible').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150); await b.click(); await L.sleep(600)
  const out = await p.evaluate(() => { const m = document.querySelector('#dayPop'); if (!m || !m.getBoundingClientRect().width) return { none: true }
    const t = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; const ih = [...m.querySelectorAll('.dip-h')].find(e => /issues/i.test(e.innerText)); let after = ''; if (ih) { let n = ih.nextElementSibling; while (n && !n.classList.contains('dip-list') && !n.classList.contains('dip-h')) { after += ' ' + t(n); n = n.nextElementSibling } }
    return { sev: t(m.querySelector('.dip-sev')), under: after.trim(), buttons: m.querySelectorAll('.dip-list button').length, lines: [...m.querySelectorAll('.dip-list .witem')].map(e => { const x = e.querySelector('.wtx') || e.children[1] || e; return { struck: getComputedStyle(x).textDecorationLine.includes('line-through'), text: t(e).slice(0, 60) } }) } })
  await p.evaluate(() => { const h = [...document.querySelectorAll('#dayPop .dip-h')].find(e => /issues/i.test(e.innerText)); if (h) h.scrollIntoView({ block: 'start' }) }); await L.sleep(250)
  out.pic = await pic(p, shot)
  await p.locator('#dayPopDone, #dayPopClose').first().click().catch(() => {}); await L.sleep(400)
  return out
}
await guard('23-board', 'the board\'s ⓘ', async () => {
  await L.go(p, 'editsched'); await W.boardOn(p, TUE); await boardOpenFold(p)
  await tapBoardLine(p, TUE, 3)
  const d1 = await info('23c-board-dayinfo-one-hidden')
  await boardOpenFold(p); for (const ix of [0, 1, 2]) { await tapBoardLine(p, TUE, ix); await boardOpenFold(p) }
  const d2 = await info('23d-board-dayinfo-all-hidden')
  judge('23 (the board\'s ⓘ, working face)', 'Scheduler Board, Tuesday: ✕ on the long-day line, the board\'s ⓘ tapped; the other three hidden, ⓘ again', [
    ['one hidden: the popup counts 2 warning · 1 advisory, no note', /2 warning/i.test(d1.sev) && /1 advisory/i.test(d1.sev) && !/note/i.test(d1.sev), d1.sev],
    ['one hidden: all four lines listed in place, the hidden one struck', d1.lines.length === 4 && d1.lines[3].struck && d1.lines.slice(0, 3).every(x => !x.struck) && /Long work day/.test(d1.lines[3].text), d1.lines.map(x => x.struck)],
    ['all hidden: it says "Nothing flagged" and still lists the four, struck', /nothing flagged/i.test(d2.sev + ' ' + d2.under) && d2.lines.length === 4 && d2.lines.every(x => x.struck), `${d2.sev} | ${d2.under}`],
  ], [d1.pic, d2.pic])
}, () => pic(p, '23-board-error'))
console.log('ERRORS', JSON.stringify(errors))
if (errors.length) row('errors (19-boardinfo)', 'the browser\'s error list through this file', errors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('19-boardinfo', { errors })
await browser.close()
