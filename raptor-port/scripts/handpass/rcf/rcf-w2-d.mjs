console.log('rcf-w2-d v1 — W2 item 7 (S29 + Advisory), item 6 Meeting variant (S05), item 4 start (S01), desktop')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'd1'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/' + RUN)
const W = await import('./rcf-w2-lib.mjs')
const F = await import('./rcf-w2-fx.mjs')
const fileInput = async (page, f) => { const n0 = await page.evaluate(() => window.INPUTS.length); const hm = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }; await page.evaluate(x => window.fileInput(x), { person: f.person, type: f.type, date: 'Jul 18', yr: 2026, allday: false, s: hm(f.start), e: hm(f.end), remarks: f.remarks, iid: 'rcf' + Math.random().toString(36).slice(2, 7) }); await sleep(600); const n1 = await page.evaluate(() => window.INPUTS.length); return { added: n1 - n0, via: 'window.fileInput (the Inputs write door; the Inputs page is now a calendar)' } }
const { L, sleep, check, PASSIF, shot } = W
const { DI, sortie, ground, readAll } = F
const browser = await W.launch()
const warnCrop = (page, name) => page.locator('#schedBoard .sb-warn').first().screenshot({ path: process.env.HP_SHOTS + '/' + name + '.png' }).then(() => name + '.png')
const crop = async (page, sel, name) => { const l = page.locator(sel).first(); await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); await l.screenshot({ path: process.env.HP_SHOTS + '/' + name + '.png' }); return name + '.png' }
const rosterEntry = (page, id) => page.evaluate(id => {
  const e = document.querySelector(`#sbRoster .rpuck[data-person="${id}"]`); if (!e) return null
  const w = e.querySelector('.rwhy')
  return { cls: e.className.replace(/\s+/g, ' '), why: w ? w.textContent.replace(/\s+/g, ' ').trim() : '', title: e.title }
}, id)
const logicKind = async (page, label) => page.evaluate(l => { const k = [...document.querySelectorAll('#page-logic .lgkinds .lgk')].find(e => e.querySelector('span').textContent.trim() === l); return k ? k.className + ' | ' + k.innerText.replace(/\s+/g, ' ') : 'none' }, label)
const setLogicShift = async (page, want) => {
  await page.locator('a[data-page="logic"]:visible').first().click()
  await page.waitForSelector('#page-logic.on'); await sleep(400)
  await page.locator('#lgEdit').click(); await sleep(300)
  let cur = await logicKind(page, 'another shift')
  console.log('another shift before', cur)
  if (!(new RegExp(want, 'i')).test(cur)) {
    await page.locator('#page-logic input[data-lgkind="shift"]').first().click(); await sleep(400)
    cur = await logicKind(page, 'another shift')
  }
  console.log('another shift now', cur)
  const pic = await crop(page, '#page-logic .lgset-kinds', 's29-logic-' + want.toLowerCase())
  await page.locator('#lgDone').click(); await sleep(400)
  return { cur, pic }
}

/* ===== S29 ===== */
if (!process.env.SKIP29) {
  const { page } = await W.world(browser)
  const bane = await W.pid(page, 'Ranger')
  const adv = await setLogicShift(page, 'adv')
  PASSIF('S29.0 Logic: "SC MAIN clashes" → another shift set to Advisory', /adv/i.test(adv.cur) && /Advisory/.test(adv.cur), adv.cur, adv.pic)
  await W.openBoard(page, DI)
  const gi = await W.addWave(page, DI, 'sc')
  await W.setF(page, `ff:${DI}.${gi}.0.rl`, '0630')
  await W.setF(page, `ff:${DI}.${gi}.1.to`, '0900'); await W.setF(page, `ff:${DI}.${gi}.1.ld`, '1500')
  await sleep(300)
  console.log('S29 shifts', JSON.stringify(await page.evaluate(([d, gi]) => window.DAYS[d].waves[gi].formations.map(f => [f.shift, f.to, f.ld, f.rl, f.br]), [DI, gi])))
  const r1 = await L.put(page, `[data-slot="${DI}.${gi}.0.0.p"]`, [bane])
  const r2 = await L.put(page, `[data-slot="${DI}.${gi}.1.0.p"]`, [bane])
  console.log('S29 put', r1, r2)
  await W.openWarnFold(page)
  process.env.SEV = '1'
  let o = await readAll(page, bane, 'AM flies (R 06:30), PM 09:00-15:00 stands by, Advisory set')
  let c = o.lines.filter(l => !/not published/.test(l))
  PASSIF('S29.1 AM flies, PM stands by, Ranger on both: the AM–PM clash is RED (D1996), though the setting says Advisory', c.some(l => /\{wln hard/.test(l)) && o.boardRings.some(x => /RED/.test(x)), JSON.stringify(c) + ' | rings ' + o.boardRings, await warnCrop(page, 's29-1-flying-red'))
  await shot(page, 's29-1-board')
  await W.setF(page, `ff:${DI}.${gi}.0.rl`, '')
  o = await readAll(page, bane, 'AM R cleared: both stand by, Advisory set')
  c = o.lines.filter(l => !/not published/.test(l))
  PASSIF('S29.2 both stand by: the clash is AMBER, following Advisory', c.length > 0 && c.every(l => !/\{wln hard/.test(l)) && !o.boardRings.some(x => /RED/.test(x)), JSON.stringify(c) + ' | rings ' + o.boardRings, await warnCrop(page, 's29-2-standby-amber'))
  await shot(page, 's29-2-board')
  await W.closeBoard(page)
  const back = await setLogicShift(page, 'hard')
  PASSIF('S29.3 setting restored to Warning', /Warning/.test(back.cur), back.cur, back.pic)
  await page.close()
}

/* ===== S05 variant: an unaccepted Meeting from the Inputs page ===== */
{
  const { page } = await W.world(browser)
  const bane = await W.pid(page, 'Ranger')
  const f = await fileInput(page, { person: bane, type: 'Meeting', from: '2026-07-18', start: '09:00', end: '10:00', remarks: 'rcf meeting', oil: 'no' })
  console.log('filed Meeting', JSON.stringify(f))
  if (!f.added) check('S05.M.0 fixture: Meeting filed on the Inputs page', 'NOT WALKED', 'nothing filed: ' + JSON.stringify(f), '')
  else {
    await W.openBoard(page, DI)
    const gi = await W.addWave(page, DI, 'sc')
    await W.setF(page, `ff:${DI}.${gi}.0.rl`, '0630')
    await W.openWarnFold(page)
    await L.tap(page, `[data-slot="${DI}.${gi}.0.0.p"]`); await sleep(400)
    let e = await rosterEntry(page, bane)
    PASSIF('S05.M.1 flying SC (R 06:30), MAIN armed, Ranger has a Meeting 09:00-10:00 filed on Inputs: crew list crosses him out', e && /\bno\b/.test(e.cls), JSON.stringify(e), await crop(page, '#sbRoster .rpuck[data-person="' + bane + '"]', 's05m-1-crew-list-flying'))
    const p = page.locator(`#sbRoster .rpuck[data-person="${bane}"]:visible`).first()
    await p.evaluate(x => x.scrollIntoView({ block: 'center' })); await sleep(100); await p.click(); await sleep(500)
    let o = await readAll(page, bane, 'seated on flying SC with a Meeting')
    let c = o.lines.filter(l => !/not published/.test(l))
    PASSIF('S05.M.2 seated anyway: a red clash in the list', c.some(l => /\{wln hard/.test(l)), JSON.stringify(c) + ' | rings ' + o.boardRings, await warnCrop(page, 's05m-2-flying'))
    await shot(page, 's05m-2-board')
    await W.setF(page, `ff:${DI}.${gi}.0.rl`, '')
    o = await readAll(page, bane, 'R cleared')
    c = o.lines.filter(l => !/not published/.test(l))
    PASSIF('S05.M.3 R cleared (standby): the clash is not red', !c.some(l => /\{wln hard/.test(l)) && !o.boardRings.some(x => /RED/.test(x)), JSON.stringify(c) + ' | rings ' + o.boardRings, await warnCrop(page, 's05m-3-standby'))
    const u = await F.unseat2(page, `[data-slot="${DI}.${gi}.0.0.p"]`)
    await L.tap(page, `[data-slot="${DI}.${gi}.0.0.p"]`); await sleep(400)
    e = await rosterEntry(page, bane)
    PASSIF('S05.M.4 R cleared, MAIN armed: the crew list no longer crosses him out for the Meeting', e && !/\bno\b/.test(e.cls), 'unseat ' + JSON.stringify(u) + ' | ' + JSON.stringify(e), await crop(page, '#sbRoster .rpuck[data-person="' + bane + '"]', 's05m-4-crew-list-standby'))
  }
  await page.close()
}

/* ===== S01: personal input against flying ===== */
{
  const { page } = await W.world(browser)
  const bane = await W.pid(page, 'Ranger')
  await W.openBoard(page, DI)
  const s = await sortie(page, { who: bane, to: '1200', ld: '1300' })
  await W.closeBoard(page)
  const f = await fileInput(page, { person: bane, type: 'Meeting', from: '2026-07-18', start: '12:00', end: '12:30', remarks: 'rcf meeting', oil: 'no' })
  console.log('S01 filed Meeting', JSON.stringify(f))
  await W.openBoard(page, DI)
  await W.openWarnFold(page)
  await L.openInputs(page, DI)
  process.env.SEV = '1'
  let o = await readAll(page, bane, 'S01 Meeting 12:00-12:30 over sortie 12:00-13:00')
  let c = o.lines.filter(l => !/not published/.test(l))
  const cl = c.find(l => /Meeting|clash/i.test(l))
  check('S01.1 (record) a Meeting filed over his sortie time', cl ? 'RECORD' : 'RECORD', JSON.stringify(c) + ' | rings ' + o.boardRings + ' | ' + o.head, await warnCrop(page, 's01-1-clash'))
  await shot(page, 's01-1-board')
  if (cl && /:live/.test(cl)) {
    await W.hideIx(page, DI, Number(cl.split(':')[0]))
    o = await readAll(page, bane, 'S01 hidden')
    check('S01.2 (record) hide the personal-input clash with ✕', 'RECORD', JSON.stringify(o.lines.filter(l => !/not published/.test(l))) + ' | rings ' + o.boardRings, 's01-2-hidden.png')
    await warnCrop(page, 's01-2-hidden'); await shot(page, 's01-2-board')
  } else check('S01.2 hide', 'NOT WALKED', 'no live clash line to hide: ' + JSON.stringify(c), '')
  /* the Meeting's own row on the board's Personal Inputs: what controls it offers */
  const rows = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .pinp [data-inpedit], #schedBoard .pinp .sb-arow, #schedBoard .pinp .sbi-row')].slice(0, 6).map(e => e.tagName + ' ' + Object.entries(e.dataset).map(([k, v]) => k + '=' + v).join(',') + ' :: ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 80)))
  console.log('S01 pinp rows', JSON.stringify(rows))
  await page.close()
}
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify({ results: W.results, errors: W.errorsAll }, null, 1))
console.log('ERRORS', JSON.stringify(W.errorsAll.slice(0, 5)))
await browser.close()
console.log('DONE', W.results.filter(r => r.verdict === 'PASS').length + '/' + W.results.length)
