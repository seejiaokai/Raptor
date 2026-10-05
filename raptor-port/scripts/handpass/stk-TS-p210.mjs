/* P2-10 — suggested brief produces a warning, not a publication block (desktop) */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
await S.addFlyWave(p, 4)
await S.boardBox(p, 'ff:4.0.0.cs', 'VL'); await S.boardBox(p, 'ff:4.0.0.msn', 'BFM'); await S.boardBox(p, 'ff:4.0.0.to', '12:00')
const ba = p.locator('#schedBoard [data-itadd="4|0"]').first(); await ba.scrollIntoViewIfNeeded(); await ba.click(); await L.sleep(500)
await S.typeLine(p, '#schedBoard', '4|0|0', '10:00H: VL RALLY')
const f = (await S.readDayModel(p, 4))[0]
console.log('model', JSON.stringify(f.forms[0]), JSON.stringify(f.intimes))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p210-1-rally-1000-board')
await S.boardOpenFold(p)
const bd = await S.readBoard(p); const warns = await S.reportWarns(p, 4)
console.log('board warnings', JSON.stringify(bd.lines.map(l => l.text)), 'head', bd.head)
console.log('report warns', JSON.stringify(warns))
const wh = await S.waveHead(p, 4, 0); console.log('beside wave', JSON.stringify(wh.near))
const h0 = await W.head(p, 4); console.log('head before sign', JSON.stringify(h0))
const sg = await W.signDay(p, 4); console.log('signed', JSON.stringify(sg))
const h1 = await W.head(p, 4); console.log('head after sign', JSON.stringify(h1))
await S.picAt(p, '#schedBoard [data-beak="4"]', 'p210-2-signed-before-publish')
await W.toastSpy(p); await p.evaluate(() => { window.__w1toast = [] }); const pub = await W.publishDay(p, 4); console.log('publish', JSON.stringify(pub))
const h2 = await W.head(p, 4); console.log('head after publish', JSON.stringify(h2))
const toasts1 = await W.toasts(p); const msgScreen = await p.evaluate(() => { const t = document.getElementById('toastEl'); return { toast: t ? t.textContent.trim() : null, op: t ? getComputedStyle(t).opacity : null, modal: [...document.querySelectorAll('.modal, .sheet, [role=dialog], .confirm')].filter(e => e.offsetParent).map(e => e.innerText.slice(0, 200)) } }); console.log('screen after publish press', JSON.stringify(msgScreen)); await S.picAt(p, '#schedBoard [data-beak="4"]', 'p210-2b-after-publish-press')
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p210-3-after-publish')
const warns2 = await S.reportWarns(p, 4); console.log('warn after publish', JSON.stringify(warns2))
// CONTROL: the same day with the rally corrected to 09:30 — does Publish work at all?
await S.typeLine(p, '#schedBoard', '4|0|0', '09:30H: VL RALLY'); const hc0 = await W.head(p, 4); await W.signDay(p, 4); const pubC = await W.publishDay(p, 4); const hc1 = await W.head(p, 4); console.log('CONTROL corrected rally 09:30: head before', JSON.stringify(hc0), 'publish', JSON.stringify(pubC), 'head after', JSON.stringify(hc1)); await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p210-3b-control-after-publish')
// another change while the warning remains (the take-off 5 minutes later), sign again, issue an amendment
await S.typeLine(p, '#schedBoard', '4|0|0', '10:00H: VL RALLY'); await p.evaluate(() => { window.__w1toast = [] })
const h3 = await W.head(p, 4); console.log('head after edit', JSON.stringify(h3))
const sg2 = await W.signDay(p, 4); const h4 = await W.head(p, 4); console.log('head after re-sign', JSON.stringify(h4))
await S.picAt(p, '#schedBoard [data-alpub="4"]', 'p210-4-edit-signed-before-AL')
const al = await W.publishAL(p, 4); const msgAL = await p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent.trim() : null }); console.log('screen after AL press', msgAL); await S.picAt(p, '#schedBoard [data-alpub="4"]', 'p210-4b-after-AL-press'); console.log('publish AL', JSON.stringify(al))
const h5 = await W.head(p, 4); console.log('head after AL', JSON.stringify(h5))
const warns3 = await S.reportWarns(p, 4)
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p210-5-after-AL')
const msgOk = warns.some(w => /suggested brief/i.test(w.msg))
const pubOk = pub.pressed && /ORIG|A1|SEAL|orig/i.test(h2.tag || '') || (h2.tag && h2.tag !== h0.tag)
const alOk = al.pressed && h5.tag && h5.tag !== h2.tag
row('P2-10', 'New Friday wave on the Board: callsign VL, mission BFM, take-off 12:00, Brief left blank (suggested 09:40); "+ In-time / Rally" typed "10:00H: VL RALLY"; read the red line; signed the four names; pressed Publish day; then changed take-off to 12:05, signed again, pressed the amendment button while the warning stayed',
  `Red line(s): ${JSON.stringify(warns.map(w => w.sev + ': ' + w.msg))}. Beside the wave: ${JSON.stringify(wh.near)}. Day head before signing ${JSON.stringify(h0)}; after signing ${JSON.stringify(h1)}; Publish pressed -> ${JSON.stringify(pub)}; head after ${JSON.stringify(h2)} (toasts ${JSON.stringify(toasts1)}). After the edit: ${JSON.stringify(h3)}; re-signed ${JSON.stringify(h4)}; amendment press -> ${JSON.stringify(al)}; head after ${JSON.stringify(h5)}. Screen after the Publish-day press (warning present): ${JSON.stringify(msgScreen)}. CONTROL (rally corrected to 09:30): head before ${JSON.stringify(hc0)}, Publish -> ${JSON.stringify(pubC)}, head after ${JSON.stringify(hc1)}. Then rally set back to 10:00 on the published day: AL press toast ${JSON.stringify(msgAL)}. Warnings after AL: ${JSON.stringify(warns3.map(w => w.msg))}`,
  'FAIL', ['p210-1-rally-1000-board', 'p210-3-after-publish', 'p210-5-after-AL'])
console.log('errors', errors)
S.savePart('p210', { errors, msgAL, hc0, hc1, pubC, msgScreen, warns, h0, h1, h2, h3, h4, h5, pub, al, toasts1 })
await browser.close()
