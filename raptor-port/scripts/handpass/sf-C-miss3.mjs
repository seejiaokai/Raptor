import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, sleep, shot, rec, go, errors } = L
const S = 'W'
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched')
await p.evaluate(() => { window.addWave(5, 'sc'); window.addWave(5, 'avalon'); window.addWave(5, 'bb') }); await sleep(600)
await p.locator('#eWeek .day').nth(5).scrollIntoViewIfNeeded(); await sleep(400)
const tags = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day')][5] && [...[...document.querySelectorAll('#eWeek .day')][5].querySelectorAll('*')].filter(e => e.children.length === 0 && /STANDALONE|standalone/.test(e.textContent + (e.title || ''))).map(e => e.className + '|' + e.textContent.trim() + '|' + (e.title || '')))
const tags2 = await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day')][5]; return [...d.querySelectorAll('[title]')].filter(e => /standby|standalone|checks|cross/i.test(e.title)).map(e => e.className + '|' + e.textContent.trim().slice(0, 30) + '|' + e.title.slice(0, 300)).slice(0, 10) })
await shot(p, 'W-1-week-waves')
rec(S, "the week's heading note on the SC / AVALON / BB waves", 'must not still say standby lines are only availability / currency / seat checks', { tags, tags2 }, 'RECORD', 'C-W-1-week-waves.png')
// + Wave picker (week)
const wv = p.locator('#eWeek [data-wvadd="5"]:visible').first()
let picker = null
if (await wv.count()) { await wv.click(); await sleep(600); picker = await p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu, .wvmenu, [class*=wavemenu]')].find(e => e.offsetParent); return m ? m.innerText.replace(/\s+/g, ' ') : 'none' }); await shot(p, 'W-2-wave-picker'); await p.keyboard.press('Escape') }
rec(S, '+ Wave picker notes (Edit Schedule week)', 'each kind\'s sentence; must not say a rally there is shown only', picker, picker && /shown only|only shown|not checked|outside the warnings/i.test(picker) ? 'FAIL' : 'RECORD', 'C-W-2-wave-picker.png')
// Logic page
await go(p, 'logic'); await sleep(1000)
const lg = await p.evaluate(() => { const t = document.querySelector('#page-logic').innerText.replace(/\s+/g, ' '); const out = []; const re = /[^.]{0,200}(standby|Standby|SPARE|AVALON|BB)[^.]{0,300}\./g; let m; while ((m = re.exec(t)) && out.length < 12) out.push(m[0].trim()); return out })
await shot(p, 'W-3-logic')
rec(S, "the Logic page's lines on standby / SC / AVALON / BB", 'must agree with D1044-D1046: a typed R makes the shift fly', lg, lg.some(x => /shown only|only shown|outside the warnings|not checked/i.test(x)) ? 'FAIL' : 'RECORD', 'C-W-3-logic.png')
rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
await b.close()
