// Walker A, scenario 1 (member, open day: the day line, eight buttons, hollow, AM moves .5, LL pending, reload).
// usage: node lw-m3-walk-a1.mjs <desktop|phone> <chromium|webkit>
import * as L from './lw-m3-walk-a-lib.mjs'
const size = process.argv[2] || 'desktop', engine = process.argv[3] || 'chromium'
const tag = `s1-${size === 'phone' ? 'ph' : 'dk'}${engine === 'webkit' ? '-wk' : ''}`
console.log('lw-m3-walk-a1 v1', size, engine, tag)
const w = await L.newCtx(size, engine)
const P = w.page
const ID = `1 ${size}/${engine}`
await L.signInPlain(w, 'member', '2026-02-15')
await L.openCellR(w, 'bane', '2026-02-20', w.phone ? tag + '-01-celltap-q' : null)
await P.waitForTimeout(300); await L.shot(w, tag + '-01-open')
const g = await L.winGeom(P)
console.log('window', JSON.stringify(g.win), 'viewport', g.vp)
const it = g.items
const dl = await L.dayline(P)
console.log('dayline:', dl)
const row1 = ['LL', 'OL', 'OIL', 'CCL'].map(k => it['bid-' + k].y), row2 = ['FCL', 'PL', 'EL', 'CL'].map(k => it['bid-' + k].y)
const twoRows = new Set(row1).size === 1 && new Set(row2).size === 1 && row2[0] > row1[0]
const looks = {}; for (const k of ['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL']) looks[k] = await L.btnLook(P, k)
const hollow = Object.values(looks).every(l => l && l.bg === 'rgba(0, 0, 0, 0)')
const left = await L.needLeft(P)
console.log('rows y', row1, row2, 'twoRows', twoRows, 'hollow', hollow, 'left', JSON.stringify(left))
console.log('row heights', JSON.stringify(g.rows.filter(r => /bidsheet-row|bid-doc-row|bid-rmk-row|bidsheet-hd/.test(r.cls + r.tid)).map(r => [r.cls, r.h, r.t])))
console.log('title bar: ✕', JSON.stringify(it['bid-cancel']), 'till tick', JSON.stringify(it['bid-till']))
L.rec(ID + ' a (window opens: dayline, 8 buttons, 2 rows, hollow)', size, dl.includes('28 → 27') && twoRows && hollow ? 'PASS' : 'FAIL', `dayline "${dl}"; eight buttons ${Object.keys(left).length}; two rows of four: ${twoRows}; all hollow: ${hollow}; figures ${JSON.stringify(left)}`, [tag + '-01-open'])
// Duration AM
await L.step(w, tag + '-02-am', L.T('portion-am'))
const dl2 = await L.dayline(P)
L.rec(ID + ' b (Duration AM moves the line .5)', size, /28 → 27\.5/.test(dl2) ? 'PASS' : 'FAIL', `dayline after AM: "${dl2}"`, [tag + '-02-am'])
// LL (below zero → tap again)
await L.step(w, tag + '-03-ll1', L.T('bid-LL'))
const stillOpen = await L.vis(P, L.T('bid-picker'))
const confirmText = stillOpen ? (await L.winGeom(P)).text.match(/That takes[^|]*/)?.[0] : null
console.log('after LL tap 1: window open', stillOpen, 'note:', confirmText)
if (stillOpen) await L.step(w, tag + '-04-ll2', L.T('bid-LL'))
await P.waitForTimeout(400)
const closed = !(await L.vis(P, L.T('bid-picker')))
await L.reachCell(w, 'bane', '2026-02-20')
await L.cellShot(w, 'bane', '2026-02-20', tag + '-05-cell-pending')
const b1 = await L.boxes(w, 'bane', '2026-02-20')
const cellLook = await P.evaluate(() => { const c = document.querySelector('[data-testid="cell-bane-2026-02-20"] .c'); if (!c) return null; const s = getComputedStyle(c); return { bs: s.borderTopStyle, bgi: s.backgroundImage.slice(0, 60), bg: s.backgroundColor, cls: c.className } })
console.log('cell after:', JSON.stringify(b1), JSON.stringify(cellLook))
L.rec(ID + ' c (LL: below-zero note then placed, pending box)', size, closed && b1 && b1.text === 'LL' && /w/.test(cellLook.cls) ? 'PASS' : 'FAIL', `tap1 kept window open with note "${confirmText}"; tap2 closed it: ${closed}; cell "${b1?.text}" class "${cellLook?.cls}" border ${cellLook?.bs} bg ${cellLook?.bg}`, [tag + '-03-ll1', tag + '-04-ll2', tag + '-05-cell-pending'])
// reload
await P.reload(); await P.waitForTimeout(1200)
const loginShown = await L.vis(P, '#luser')
await L.signInPlain(w, 'member', '2026-02-15')
await L.reachCell(w, 'bane', '2026-02-20')
await L.cellShot(w, 'bane', '2026-02-20', tag + '-06-after-reload')
const b2 = await L.boxes(w, 'bane', '2026-02-20')
L.rec(ID + ' d (reload: still there)', size, b2 && b2.text === 'LL' ? 'PASS' : 'FAIL', `after reload (login page shown first: ${loginShown}; signed in again) cell "${b2?.text}"`, [tag + '-06-after-reload'])
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
