import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bPutKey, bPutFill, puckAt, bType, bf, bPublish, sleep, shot, rec, go, errors, chipLine, weekHead, warnLines, oilOpen, oilClose, oilLine, undo, redo, pendText } = L
const S = 'M'
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched')
await p.evaluate(() => { window.addWave(5, 'bb'); window.addWave(5, 'avalon') }); await sleep(500)
await openBoard(p, 5)
const st = [await bPut(p, 5, 0, 0, 0, 'p', ['stiff']), await bPut(p, 5, 0, 0, 2, 'p', ['bane']), await bPut(p, 5, 1, 0, 2, 'p', ['dice'])]
rec(S, 'set-up: BB (no times) with Saber MAIN, Ranger SPARE; AVALON SPARE Reaper', 'seated', st, st.every(x => x !== 'FAILED') ? 'PASS' : 'NOT WALKED')
const w0 = await warnLines(p)
rec(S, 'BB standing by, nothing typed', 'no BB advisory', w0, !w0.some(x => /BB/.test(x)) ? 'PASS' : 'FAIL')
// H1: tick Ranger's BB row by hand with no times at all
await p.locator('#schedBoard [data-safly="5.0.0.2"]:visible').first().click(); await sleep(700)
const wH1 = await warnLines(p), cH1 = await chipLine(p)
await shot(p, 'M-1-bb-hand-tick')
const bbLine = wH1.find(x => /BB/.test(x))
rec(S, 'BB: tick a row by hand with R, START and END all empty', 'the amber line also fires for a hand-ticked row', { wH1, bbLine }, bbLine ? 'PASS' : 'FAIL', 'C-M-1-bb-hand-tick.png')
// tap on the line lands on START box
let land = null
if (bbLine) {
  await p.locator('#sbSide').getByText(/BB SHIFT flies but has no START or END/).first().click().catch(async () => { await p.locator('#sbSide li, #sbSide .wrow').filter({ hasText: /BB/ }).first().click() })
  await sleep(700)
  land = await p.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, bfld: a.dataset && a.dataset.bfld, val: a.value } : null })
  await shot(p, 'M-2-bb-tap-lands')
}
rec(S, "tap the amber BB line", "lands on the BB's START box (desktop)", land, land && /ff:5\.0\.0\.to/.test(land.bfld || '') ? 'PASS' : 'FAIL', 'C-M-2-bb-tap-lands.png')
// untick, type R only
await p.locator('#schedBoard [data-safly="5.0.0.2"]:visible').first().click().catch(() => {}); await sleep(500)
await bType(p, bf(5, 0, 0, 'rl'), '08:00')
const wH2 = await warnLines(p)
rec(S, 'BB: R 08:00 typed, no START or END', 'amber line present', wH2.filter(x => /BB/.test(x)), wH2.some(x => /BB SHIFT flies but has no START or END/.test(x)) ? 'PASS' : 'FAIL')
await bType(p, bf(5, 0, 0, 'to'), '08:30'); await bType(p, bf(5, 0, 0, 'ld'), '14:00')
const wH3 = await warnLines(p), cH3 = await chipLine(p)
await oilOpen(p); const oB = await oilLine(p); await shot(p, 'M-3-bb-oil'); await oilClose(p)
rec(S, 'BB: START 08:30 and END 14:00 typed', 'advisory goes; OIL by default for the BB rows, from 08:00', { wH3: wH3.filter(x => /BB/.test(x)), oB }, !wH3.some(x => /BB SHIFT flies but has no/.test(x)) && /Saber:ON/.test(oB) && /Ranger:ON/.test(oB) ? 'PASS' : 'FAIL', 'C-M-3-bb-oil.png')
await bType(p, bf(5, 0, 0, 'ld'), '')
const wH4 = await warnLines(p)
rec(S, 'BB: clear END only', 'the advisory returns', wH4.filter(x => /BB/.test(x)), wH4.some(x => /BB SHIFT flies but has no/.test(x)) ? 'PASS' : 'FAIL')
await bType(p, bf(5, 0, 0, 'ld'), '14:00')
// G: AVALON desk stays out/off while the flying row is ON
await bType(p, bf(5, 1, 0, 'rl'), '18:30')
await p.locator('#schedBoard [data-dwadd="5"]:visible').first().click(); await sleep(500)
await p.locator('button').filter({ hasText: /^AVALON/ }).first().click(); await sleep(700)
const dwi = await p.evaluate(() => window.DAYS[5].dutywaves.length - 1)
const sd = await bPutFill(p, `d:5.${dwi}.0.+`, ['taipan'])
await oilOpen(p); const oA = await oilLine(p); await shot(p, 'M-4-avalon-desk-oil'); await oilClose(p)
rec(S, 'AVALON flying row ON, an AVALON duty desk beside it', 'the flying row ON; the desk stays out of the default (off)', { sd, oA }, 'RECORD', 'C-M-4-avalon-desk-oil.png')
// D: palette barred reasons + ring on an AVALON flying SPARE
await p.locator('#schedBoard [data-sradd="5.oft"]:visible').first().click(); await sleep(500)
const sim = await p.evaluate(() => window.DAYS[5].sims.oft.length - 1)
await bType(p, `#schedBoard [data-bfld="sr:5.oft.${sim}.label"]`, 'EP-9'); await bType(p, `#schedBoard [data-bfld="sr:5.oft.${sim}.str"]`, '22:00'); await bType(p, `#schedBoard [data-bfld="sr:5.oft.${sim}.end"]`, '23:00')
await p.locator(`#schedBoard [data-slot="s:5.oft.${sim}.p"]:visible`).first().click(); await sleep(500)
const pal = await p.evaluate(() => { const e = document.querySelector('#sbRoster .rpuck[data-person="dice"]'); return e ? { cls: e.className, title: e.title } : null })
await shot(p, 'M-5-palette-avalon')
rec(S, 'palette with a 22:00-23:00 sim seat armed; Reaper is on the AVALON SPARE (R 18:30, flying)', 'Reaper barred, the reason names the AVALON shift', pal, pal && /AV|AVALON/.test(pal.title) && /no/.test(pal.cls) ? 'PASS' : 'FAIL', 'C-M-5-palette-avalon.png')
await p.keyboard.press('Escape'); await sleep(300)
const sp = await bPutKey(p, `s:5.oft.${sim}.p`, ['dice']).catch(e => 'ERR ' + e.message.slice(0, 60))
const pk = await puckAt(p, `s:5.oft.${sim}.p`), pkA = await puckAt(p, '5.1.0.2.p')
const wS = await warnLines(p)
await shot(p, 'M-6-avalon-puck-ring')
rec(S, "Reaper (AVALON flying SPARE) also put on the 22:00 sim", 'red ring on both, the clash in the list', { sp, sim: pk && pk.cls, avalon: pkA && pkA.cls, w: wS.filter(x => /Reaper/.test(x)) }, wS.some(x => /Reaper/.test(x) && /clash/.test(x)) ? 'PASS' : 'FAIL', 'C-M-6-avalon-puck-ring.png')
rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
await b.close()
