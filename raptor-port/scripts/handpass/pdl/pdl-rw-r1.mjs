/* pdl-rw-r1 v1 — R1 re-walk: the ALL AVAIL window's reason, desktop. Published Tue 28 Jul (di 1) vs unpublished Thu 30 Jul (di 3, control).
   Ranger flies 12:00-13:00; ground row BRIEFING 14:30-15:00 with ALL AVAIL dropped on it; "Flight debrief after land" 2h -> 3h. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL = 'http://localhost:4292'
process.env.HP_SHOTS = resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/rewalk/r1')
console.log('pdl-rw-r1 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep, check, note, pic } = P
const FX = await import('../rcf/rcf-w2-fx.mjs')
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')

async function fixture(di) {
  await L.board(page, di); await sleep(400)
  await P.flight(w, di, { to: '1200', ld: '1300', who: w.ID('Ranger') })
  const g = await P.ground(w, di, { prog: 'BRIEFING', str: '1430', end: '1500', who: null })
  const from = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  await from.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const to = page.locator(`#schedBoard [data-fill="g:${di}.${g.ri}.+"]:visible`).first()
  await to.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  await FX.dragBox(page, from, to)
  const gr = await page.evaluate(d => JSON.stringify(window.DAYS[d].ground.map(x => x.prog + ' ' + x.str + '-' + x.end + ' ' + x.who)), di)
  check(`R1.0 fixture day ${di}: ground row 14:30-15:00 holds ALL AVAIL (dragged)`, /allavail/.test(gr), gr)
  await L.closeBoard(page)
}
await fixture(1)
await fixture(3)

async function openCount(di, surface, tag) {
  if (surface === 'board') { await L.board(page, di); await sleep(500) }
  else if (surface === 'edit') { await L.closeBoard(page); await L.go(page, 'editsched'); await sleep(600) }
  else { await L.closeBoard(page); await L.go(page, 'viewsched'); await sleep(600) }
  const root = surface === 'board' ? '#schedBoard' : surface === 'edit' ? `#eWeek .day[data-day="${di}"]` : `#vWeek .day[data-day="${di}"]`
  const chip = page.locator(`${root} .oilcount:visible`).first()
  if (!(await chip.count())) { console.log('NO CHIP on', surface); return { chip: null, win: [] } }
  const n = (await chip.innerText()).trim()
  await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await page.evaluate(() => { window.__seen = new WeakSet([...document.querySelectorAll('body *')]) })
  await chip.click(); await sleep(900)
  const win = await page.evaluate(() => {
    const fresh = [...document.querySelectorAll('body *')].filter(e => !window.__seen.has(e) && e.offsetWidth)
    const tops = fresh.filter(e => !fresh.includes(e.parentElement))
    return tops.map(e => ({ cls: String(e.className).slice(0, 60), id: e.id, text: e.innerText.replace(/[\s ]+/g, ' ').slice(0, 2500) }))
  })
  await pic(page, `${tag}-${surface}`)
  console.log('COUNT', tag, surface, 'chip', n, JSON.stringify(win).slice(0, 3000))
  return { chip: n, win }
}
const closeWin = async () => { await page.keyboard.press('Escape'); await sleep(300); await page.mouse.click(5, 300); await sleep(300) }
const textOf = r => (r.win || []).map(x => x.text).join(' | ')
const ranger = r => (textOf(r).match(/Ranger[^|]{0,160}/) || ['(no Ranger line)'])[0]
const reasonRe = /Not enough time to attend[^(]*\(land \+ \d+h\)/
const reasonOf = r => (textOf(r).match(reasonRe) || ['(no reason shown)'])[0]

const sp = await X.signAndPublish(w, 1)
console.log('publish Tue', JSON.stringify({ p: sp.p, tag: sp.h.tag }))
await L.closeBoard(page)
const R = {}
for (const [di, nm] of [[1, 'tue-pub'], [3, 'thu-unpub']]) for (const s of ['board', 'edit', 'view']) { R[`${nm}-${s}-before`] = await openCount(di, s, `r1-${nm}-before`); await closeWin() }
const lg = await P.setLogic(w, 'debrief', '3h')
console.log('debrief', JSON.stringify(lg))
await pic(page, 'r1-logic-debrief-3h')
for (const [di, nm] of [[1, 'tue-pub'], [3, 'thu-unpub']]) for (const s of ['board', 'edit', 'view']) { R[`${nm}-${s}-after`] = await openCount(di, s, `r1-${nm}-after`); await closeWin() }
for (const s of ['board', 'edit', 'view']) {
  const a = R[`tue-pub-${s}-before`], b = R[`tue-pub-${s}-after`]
  note(`R1 Tue published ${s} (RECORD)`, `BEFORE reason "${reasonOf(a)}" | AFTER reason "${reasonOf(b)}" | Ranger line before: "${ranger(a)}" after: "${ranger(b)}"`)
  check(`R1.1 published Tue ${s}: Ranger's reason is the same before and after debrief 3h`, reasonOf(a) === reasonOf(b) && /land \+ 2h/.test(reasonOf(a)), `before "${reasonOf(a)}" | after "${reasonOf(b)}"`)
  const c = R[`thu-unpub-${s}-before`], d = R[`thu-unpub-${s}-after`]
  note(`R1 Thu unpublished ${s} (RECORD)`, `BEFORE reason "${reasonOf(c)}" | AFTER reason "${reasonOf(d)}"`)
  check(`R1.2 unpublished Thu ${s}: reason reads (land + 3h) after the change`, /land \+ 3h/.test(reasonOf(d)) && /land \+ 2h/.test(reasonOf(c)), `before "${reasonOf(c)}" | after "${reasonOf(d)}"`)
}
P.finish(w, { R })
await w.browser.close()
