/* P2-12 — missing and malformed clocks do not invent attendance (desktop) */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
const who = 'dj'
const hrs = async (shot) => { const h = await S.hoursMap(p, { shot }); return { h: h.hours.Ace || '(not on the list)', w: h.widths.Ace } }
const warnAll = async () => (await S.warnTexts(p, 4)).filter(w => !w.off).map(w => w.sev + ' ' + w.code + ': ' + w.msg)
await S.openBoard(p, 4)
const H0 = await hrs('p212-0-ace-before')
console.log('Ace before', JSON.stringify(H0))
await S.addFlyWave(p, 4)
// an empty formation (no callsign, no take-off) with a crew member, and the text "RALLY AFTER IN TIME"
const put = await S.crew(p, '4.0.0.0.p', who); console.log('put', JSON.stringify(put))
const add = async () => { const b = p.locator('#schedBoard [data-itadd="4|0"]').first(); await b.scrollIntoViewIfNeeded(); await b.click(); await L.sleep(500) }
await add(); await S.typeLine(p, '#schedBoard', '4|0|0', 'RALLY AFTER IN TIME')
const m1 = (await S.readDayModel(p, 4))[0]
const S1 = { tag: 'no take-off, crew seated, line "RALLY AFTER IN TIME"', model: m1.intimes, form: m1.forms[0] && { cs: m1.forms[0].cs, to: m1.forms[0].to }, warns: await warnAll(), near: (await S.waveHead(p, 4, 0)).near[0], hrs: await hrs('p212-1-rally-after') }
console.log(JSON.stringify(S1))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p212-1b-board-no-takeoff')
// an invalid clock
await S.typeLine(p, '#schedBoard', '4|0|0', '25:99H: IN TIME')
const S2 = { tag: 'invalid clock "25:99H: IN TIME"', warns: await warnAll(), near: (await S.waveHead(p, 4, 0)).near[0], hrs: await hrs('p212-2-invalid') }
console.log(JSON.stringify(S2))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p212-2b-board-invalid')
// valid take-off, callsign, in-time; rally after in-time
await S.boardBox(p, 'ff:4.0.0.cs', 'VL'); await S.boardBox(p, 'ff:4.0.0.msn', 'BFM'); await S.boardBox(p, 'ff:4.0.0.to', '12:00')
await S.typeLine(p, '#schedBoard', '4|0|0', '08:00H: IN TIME')
await add(); await S.typeLine(p, '#schedBoard', '4|0|1', 'RALLY AFTER IN TIME')
const S3 = { tag: 'T/O 12:00, in-time 08:00H, "RALLY AFTER IN TIME"', warns: await warnAll(), near: (await S.waveHead(p, 4, 0)).near[0], hrs: await hrs('p212-3-valid') }
console.log(JSON.stringify(S3))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p212-3b-board-valid')
// cancel the formation with its CX
const cx = await p.evaluate(() => { const r = [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetParent && /^CX$/.test(b.innerText.trim()) && /^data-l/.test([...b.attributes].map(a => a.name).find(n => n.startsWith('data-')) || '')); return cx0(r) ; function cx0(r) { return r.map(b => [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')) } })
console.log('CX buttons (line)', JSON.stringify(cx))
await p.locator('#schedBoard [data-lcx="4.0.0.0"]').first().click(); await L.sleep(400); await S.picAt(p, '#cxPop', 'p212-4a-cx-popup'); await p.locator('#cxSave').click(); await L.sleep(700); const pressed = 'CX button on aircraft line 4.0.0.0 then Cancel line'
const m4 = (await S.readDayModel(p, 4))[0]
const S4 = { tag: 'formation cancelled (CX)', pressed, cx: m4.forms[0] && m4.forms[0].cx, warns: await warnAll(), near: (await S.waveHead(p, 4, 0)).near[0], hrs: await hrs('p212-4-cancelled') }
console.log(JSON.stringify(S4))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p212-4b-board-cancelled')
const ok = S3.hrs.h !== S1.hrs.h && S4.hrs.h === H0.h
row('P2-12', 'Friday, new wave on the Board: blank formation, Ace seated, line "RALLY AFTER IN TIME" typed; then "25:99H: IN TIME"; then callsign VL, mission BFM, take-off 12:00, line 1 "08:00H: IN TIME" and an added "RALLY AFTER IN TIME"; then the formation cancelled with its CX. Ace\'s Work hours read from Insights at each step.',
  `Ace Work hours: before ${H0.h}; no take-off+RALLY AFTER IN TIME ${S1.hrs.h}; invalid clock ${S2.hrs.h}; valid T/O+in-time ${S3.hrs.h}; cancelled ${S4.hrs.h}. Warnings: S1 ${JSON.stringify(S1.warns)}; S2 ${JSON.stringify(S2.warns)}; S3 ${JSON.stringify(S3.warns)}; S4 ${JSON.stringify(S4.warns)}. Beside the wave: S1 ${S1.near}; S2 ${S2.near}; S3 ${S3.near}; S4 ${S4.near}. CX pressed: ${pressed}, formation cx flag after = ${S4.cx}`,
  ok ? 'PASS' : 'PARTIAL', ['p212-1b-board-no-takeoff', 'p212-2b-board-invalid', 'p212-3b-board-valid', 'p212-4b-board-cancelled'])
console.log('errors', errors)
S.savePart('p212', { errors, H0, S1, S2, S3, S4 })
await browser.close()
