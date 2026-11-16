/* wwf w2 R3 — AVALON / BB template desks once the wave flies (D2080). usage: node scripts/handpass/wwf/wwf-w2-r3.mjs  (ONLY=avalon|bb) */
import * as H from './wwf-w2-lib.mjs'
const ONLY = process.env.ONLY || 'all'
const RUN = 'r3' + (ONLY === 'all' ? '' : '-' + ONLY)
const X = await H.init(RUN, false)
const { say, sleep, row, pic } = X
const w = await X.open({})
const { page } = w
const SZ = 'desktop'
const P = n => `w2/${RUN}/${n}.png`
const crewOf = ls => ls.filter(l => H.crew(l))
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); return null } }
const read = async (tag, di) => {
  await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
  const ww = await X.weekWarn(w, '#eWeek', di)
  await pic(w, tag)
  const dd = await X.dayDetails(w, '#eWeek', di); await X.closeDayPop(w, 'done')
  say(tag, ww.head, JSON.stringify(ww.items), 'DET', JSON.stringify(dd.items))
  return { strip: crewOf(ww.items).filter(l => /Ranger/.test(l)), det: crewOf(dd.items || []).filter(l => /Ranger/.test(l)), all: ww.items }
}
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')

async function scenario(kind, label, deskDay, flyDay, placeDesk) {
  const S = 'R3 ' + label
  // the wave, flown by an R on its first line
  await X.board(w, deskDay)
  const wi = await X.addWave(w, deskDay, kind)
  await X.typeIn(w, `[data-bfld="ff:${deskDay}.${wi}.0.rl"]`, '18:00')
  const rl = await page.evaluate(([d, i]) => JSON.stringify(window.DAYS[d].waves[i].formations[0].rl) + ' label=' + window.DAYS[d].waves[i].label + ' kind=' + (window.DAYS[d].waves[i].kind || window.DAYS[d].waves[i].sa || ''), [deskDay, wi])
  say(label, 'wave', wi, 'R typed:', rl)
  await pic(w, `${label}-01-wave`)
  const desk = await placeDesk()
  await pic(w, `${label}-02-desk`)
  await X.closeBoard(w)
  await X.board(w, flyDay)
  await H.flight2(X, w, flyDay, { to: '10:00', ld: '11:00', br: '07:00', front: 'bane', rear: null })
  await X.closeBoard(w)
  let r = await read(`${label}-03-blank-end`, flyDay)
  row(S, SZ, `wave flies (R 18:00), template desk START 20:00 END blank, Ranger; next-day flight B 07:00`, 'no crew-rest line for Ranger', `R ${rl} | desk ${JSON.stringify(desk)} | strip ${JSON.stringify(r.strip)} | details ${JSON.stringify(r.det)}`, !r.strip.length && !r.det.length ? 'PASS' : 'FAIL', P(`${label}-03-blank-end`))
  await H.setEnd(X, w, deskDay, desk.wi, 0, '23:00'); await pic(w, `${label}-04-end-board`); await X.closeBoard(w)
  r = await read(`${label}-05-end-2300`, flyDay)
  row(S, SZ, 'END 23:00', 'one crew-rest line naming the duty ending 23:00', `strip ${JSON.stringify(r.strip)} | details ${JSON.stringify(r.det)}`, r.strip.length === 1 && /23:00/.test(r.strip[0]) ? 'PASS' : 'FAIL', P(`${label}-05-end-2300`))
  await H.setEnd(X, w, deskDay, desk.wi, 0, ''); await X.closeBoard(w)
  r = await read(`${label}-06-end-cleared`, flyDay)
  row(S, SZ, 'END cleared', 'no crew-rest line', `strip ${JSON.stringify(r.strip)}`, !r.strip.length ? 'PASS' : 'FAIL', P(`${label}-06-end-cleared`))
  // control: the wave no longer flies
  await X.board(w, deskDay)
  await X.typeIn(w, `[data-bfld="ff:${deskDay}.${wi}.0.rl"]`, '')
  await X.closeBoard(w)
  r = await read(`${label}-07-wave-not-flying`, flyDay)
  row(S + ' control', SZ, 'R cleared (wave no longer flies), END blank', 'RECORD', `R after clear ${await page.evaluate(([d, i]) => JSON.stringify(window.DAYS[d].waves[i].formations[0].rl), [deskDay, wi])} | strip ${JSON.stringify(r.strip)} | details ${JSON.stringify(r.det)} | all lines ${JSON.stringify(r.all)}`, 'RECORDED', P(`${label}-07-wave-not-flying`))
}

if (ONLY === 'all' || ONLY === 'avalon') await step('avalon', () => scenario('avalon', 'avalon', 2, 3, async () => {
  const d = await H.makeDesk(X, w, 2, { tpl: 'avalon', str: '20:00', end: '', people: ['bane'] })
  return d
}))

if (ONLY === 'all' || ONLY === 'bb') await step('bb', async () => {
  // the template "BB test", for wave BB, one row
  await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
  await X.board(w, 4)
  await X.press(w, '[data-dwadd="4"]', { scope: 'board' }); await sleep(400)
  await X.press(w, '[data-blkedit]'); await sleep(600)
  await X.press(w, '.tpl-tab.new'); await sleep(500)
  const nm = page.locator('.tpl-name:visible').first(); await nm.fill('BB test'); await nm.blur(); await sleep(300)
  const sel = page.locator('.modal-body select:visible').first()
  say('For wave options', JSON.stringify(await sel.locator('option').allInnerTexts()))
  await sel.selectOption({ label: 'BB' }); await sleep(300)
  if (!(await page.locator('.modal-body input[aria-label=Role]:visible').count())) { await X.press(w, '.addrow'); await sleep(300) }
  await page.locator('.modal-body input[aria-label=Role]:visible').first().fill('DSK')
  const st = page.locator('.modal-body input[aria-label=Start]:visible').first(); await st.fill('20:00'); await st.blur(); await sleep(400)
  await pic(w, 'bb-00-template')
  say('For wave now', await sel.evaluate(e => e.options[e.selectedIndex].text))
  await X.press(w, '.modal-foot .primary'); await sleep(500)
  if (!(await page.locator('[data-blktpl]:visible').count())) { await X.press(w, '[data-dwadd="4"]', { scope: 'board' }); await sleep(400) }
  await pic(w, 'bb-00b-menu')
  await X.closeBoard(w)
  await scenario('bb', 'bb', 4, 5, async () => {
    const wiD = await page.evaluate(() => window.DAYS[4].dutywaves.length)
    await X.press(w, '[data-dwadd="4"]', { scope: 'board' }); await sleep(400)
    const id = await page.evaluate(() => { const e = [...document.querySelectorAll('[data-blktpl]')].filter(x => x.offsetWidth).find(x => /BB test/.test(x.innerText)); return e ? e.dataset.blktpl : null })
    say('BB test template id', id)
    await X.press(w, `[data-blktpl="${id}"]`); await sleep(500)
    const base = `4.${wiD}.0`
    await X.typeIn(w, `[data-bfld="dr:${base}.str"]`, '20:00'); await X.typeIn(w, `[data-bfld="dr:${base}.end"]`, '')
    const s = await X.seat(w, `[data-fill="d:${base}.+"]`, 'bane')
    const info = await page.evaluate(([d, i]) => { const b = window.DAYS[d].dutywaves[i]; return { label: b.label, sa: b.sa, wave: b.wave || b.forWave || null, str: b.rows[0].str, end: b.rows[0].end, who: JSON.stringify(b.rows[0].id) } }, [4, wiD])
    say('BB desk', JSON.stringify(info), s)
    return { wi: wiD, ...info, seat: s }
  })
})
await X.fin(w)
