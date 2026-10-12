// B10 — a man on leave on the row (RECORDED)
import { launch, openWorld, fileInput, shot, rowIdx, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs,
  toWeek, openBoard, centre, boardRowEl, boardRowNames, weekRowEl, weekRowNames, drag2, rosterPuckOf } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const toastNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.innerText + ' [op ' + t.style.opacity + ']' : '' })
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 2
const ll = await fileInput(p, { type: 'LL', person: 'Tally', from: '2026-07-15', to: '2026-07-15' })
say('LL filed', ll)
const mt = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['17:00', '18:00'], title: 'Range sync' })
const iid = mt[0].iid
say('meeting', mt)
await openBoard(p, DI)
const ri = await rowIdx(p, DI, iid)
const side = () => p.evaluate(() => { const s = document.querySelector('#sbSide'); const t = s ? s.innerText : ''; const cut = t.indexOf('PLACEHOLDERS'); return (cut > 0 ? t.slice(0, cut) : t).split(/\r?\n/).map(x => x.trim()).filter(Boolean).filter(l => /Tally/.test(l)) })
say('warnings naming Tally before', await side())
const row = boardRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300)
const pk = await rosterPuckOf(p, '#sbRoster', 'Tally')
say('roster puck for Tally', await pk.evaluate(e => ({ cls: e.className, title: e.getAttribute('title') })))
const m = await toastMark(p)
await drag2(p, pk, row.locator('.puck', { hasText: 'Hunter' }).first())
say('toasts', await toastsSince(p, m)); say('toast now', await toastNow(p))
say('input after', (await inputOf(p, iid)).people)
say('board row', await boardRowNames(p, DI, ri))
say('puck of Tally on board row', await boardRowEl(p, DI, ri).locator('.puck', { hasText: 'Tally' }).first().evaluate(e => ({ cls: e.className, title: e.getAttribute('title'), chip: (e.querySelector('.lchip') || {}).textContent })).catch(() => null))
say('warnings naming Tally after (board)', await side())
await centre(boardRowEl(p, DI, ri)); await shot(p, 's10-1-board-row')
await p.locator('#sbSide').first().evaluate(e => e.scrollIntoView({ block: 'start' })).catch(() => {})
await toWeek(p)
say('week row', await weekRowNames(p, DI, ri))
say('week puck of Tally', await weekRowEl(p, DI, ri).locator('.puck', { hasText: 'Tally' }).first().evaluate(e => ({ cls: e.className, title: e.getAttribute('title') })).catch(() => null))
await centre(weekRowEl(p, DI, ri)); await shot(p, 's10-2-week-row')
/* the week's warning list for Wed */
say('week warnings naming Tally', await p.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek)')].map((d, i) => i + ':' + [...d.querySelectorAll('.warnlist li, .warn-line, [data-warn]')].map(e => e.innerText.replace(/\s+/g, ' ')).filter(t => /Tally/.test(t)).join(' | ')).filter(s => !/:$/.test(s))))
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B10 = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
