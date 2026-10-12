// Walker C, C6 - red box and information only (desktop 1440x900). One world.
import * as L from './or-C-lib.mjs'
import * as L2 from './or-C-lib2.mjs'
const { browser, page: p, errs } = await L.openWorld()
const DI = 2, ISO = '2026-07-15'
const j = o => JSON.stringify(o)
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Ranger', 'Hex'], from: ISO, to: ISO, timed: ['10:00', '11:30'], title: 'Range brief', rmk: 'Bring ID' }))[0]
const iid = mt.iid
console.log('filed', j(mt))
const rawNow = () => L.recRaw(p, iid)
const rowMarks = async () => {
  await L.goEdit(p)
  const ri = await L.rowIdx(p, DI, iid)
  const w = await p.evaluate(([di, ri]) => { const z = document.querySelectorAll('#eWeek .day:not(.peek)')[di]; const f = z.querySelector(`[data-fill="g:${di}.${ri}.+"]`); const r = f && f.closest('.pl-row'); return r ? `class="${r.className}" flagEls=${r.querySelectorAll('.flag, .rbox, .gr-flag, [class*=flag]').length} infoEls=${r.querySelectorAll('.info, .ginfo, [class*=info]').length} text="${(r.innerText || '').replace(/\s+/g, ' ').trim()}"` : '(no row)' }, [DI, ri])
  await L.openBoard(p, DI)
  const b = await p.evaluate(([di, ri]) => { const rows = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(e => e.offsetParent); const r = rows.find(x => x.querySelector(`[data-fill="g:${di}.${ri}.+"], [data-slot="g:${di}.${ri}"]`)); if (!r) return '(no row)'; const bt = s => { const e = r.querySelector(`[${s}]`); return e ? `${s}: class="${e.className}" pressed=${e.getAttribute('aria-pressed')} title="${e.getAttribute('title')}"` : `${s}: none` }; return `class="${r.className}" | ${bt('data-grflag')} | ${bt('data-grinfo')} | ${bt('data-grcx')}` }, [DI, ri])
  return { week: w, board: b }
}
async function inputsPages() {
  const s = await L2.surfaces(p, { di: DI, iso: ISO, iid })
  const w = await L2.readWindow(p, { iso: ISO, iid })
  return { bar: j(s.bar), card: s.card, list: s.list, win: w.head + ' | ' + w.body.slice(0, 160), line: s.weekLine }
}
const warnLines = async () => {
  await L.openBoard(p, DI)
  return p.evaluate(() => { const side = document.querySelector('#sbSide'); if (!side) return []; const t = side.innerText || ''; const cut = t.indexOf('PLACEHOLDERS'); return (cut > 0 ? t.slice(0, cut) : t).split(/\r?\n/).map(s => s.trim()).filter(x => x && x !== '✕' && x !== '·') })
}
async function boardPress(attr) {
  await L.openBoard(p, DI)
  const ri = await L.rowIdx(p, DI, iid)
  const b = p.locator(`#schedBoard [${attr}="${DI}.${ri}"]`).first(); await b.scrollIntoViewIfNeeded()
  const m = await L.toastMark(p)
  await b.click(); await p.waitForTimeout(500)
  return L.toastsSince(p, m)
}
const boardShot = async name => { await L.openBoard(p, DI); const ri = await L.rowIdx(p, DI, iid); const r = p.locator('#schedBoard .sb-panel.grnd .sb-arow').filter({ has: p.locator('[data-grcx="' + DI + '.' + ri + '"]') }).first(); await r.scrollIntoViewIfNeeded(); await p.waitForTimeout(250); await L.shot(p, name) }
const diff = (a, b) => Object.keys(a).filter(k => a[k] !== b[k]).map(k => k + ': [' + a[k] + '] -> [' + b[k] + ']')

// A baseline
const base = await inputsPages(); const baseRaw = await rawNow(); const baseMarks = await rowMarks()
console.log('A baseline marks', j(baseMarks)); console.log('A baseline inputs raw', baseRaw)
console.log('A baseline Inputs pages', j(base))
console.log('A warnings (baseline):', j(await warnLines()))

// B red box
let t = await boardPress('data-grflag')
console.log('B red box pressed: toast', t)
const m1 = await rowMarks(); console.log('B marks', j(m1))
await boardShot('c6-1-redbox-board')
const raw1 = await rawNow(); const pg1 = await inputsPages()
console.log('B INPUTS raw same as baseline?', raw1 === baseRaw, raw1 === baseRaw ? '' : raw1)
console.log('B Inputs pages changed?', j(diff(base, pg1)))
await L.openBoard(p, DI)
let u = await L.undoRedo(p, 'undo'); console.log('B UNDO', u.used, '|', j((await rowMarks()).board))
let r = await L.undoRedo(p, 'redo'); console.log('B REDO', r.used, '|', j((await rowMarks()).board))

// C information only
t = await boardPress('data-grinfo')
console.log('C info only pressed: toast', t)
const m2 = await rowMarks(); console.log('C marks', j(m2))
await boardShot('c6-2-info-board')
const raw2 = await rawNow(); const pg2 = await inputsPages()
console.log('C INPUTS raw same as baseline?', raw2 === baseRaw, raw2 === baseRaw ? '' : raw2)
console.log('C Inputs pages changed (vs baseline)?', j(diff(base, pg2)))
await L.openBoard(p, DI)
u = await L.undoRedo(p, 'undo'); console.log('C UNDO', u.used, '|', j((await rowMarks()).board))
r = await L.undoRedo(p, 'redo'); console.log('C REDO', r.used, '|', j((await rowMarks()).board))
// week row picture
await L.goEdit(p); await p.locator('#eWeek .day:not(.peek)').nth(DI).locator('.sec-grnd .pl-row').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 150)); await L.shot(p, 'c6-3-week-marks')

// D info only ON -> put Ranger on a flying line at the same hour
const wBefore = await warnLines(); console.log('D warnings with info only on, before Ranger flies:', j(wBefore))
await L.goEdit(p)
const rid = await L.csId(p, 'Ranger')
const seat = p.locator('#eWeek .day:not(.peek)').nth(DI).locator('[data-slot="2.0.1.0.p"]').first()
await seat.scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
let m = await L.toastMark(p)
await L.drag(p, p.locator(`#eRoster .rpuck[data-person="${rid}"]:visible`).first(), seat)
console.log('D Ranger on the flying seat: toast', await L.toastsSince(p, m), '| seat now', await p.evaluate(() => window.PEOPLE[window.DAYS[2].waves[0].formations[1].aircraft[0].p]?.cs))
const wOn = await warnLines()
console.log('D warnings (info only ON):', j(wOn))
console.log('D lines naming the Meeting / Range brief:', j(wOn.filter(x => /range brief|meeting/i.test(x))), '| lines naming Ranger:', j(wOn.filter(x => /ranger/i.test(x))))

// E info only OFF
t = await boardPress('data-grinfo'); console.log('E info only taken off: toast', t)
const wOff = await warnLines()
console.log('E warnings (info only OFF):', j(wOff))
console.log('E lines naming the Meeting / Range brief:', j(wOff.filter(x => /range brief|meeting/i.test(x))), '| lines naming Ranger:', j(wOff.filter(x => /ranger/i.test(x))))

u = await L.undoRedo(p, 'undo'); console.log('E UNDO (info only back on?)', u.used, '|', j((await rowMarks()).board), '| warnings lines naming Meeting:', j((await warnLines()).filter(x => /range brief|meeting/i.test(x))))
r = await L.undoRedo(p, 'redo'); console.log('E REDO', r.used, '|', j((await rowMarks()).board), '| warnings lines naming Meeting:', j((await warnLines()).filter(x => /range brief|meeting/i.test(x))))

// F a scheduler's OWN ground row: the three buttons
await L.openBoard(p, DI)
const nBefore = await p.evaluate(() => window.INPUTS.length), rawBefore = await rawNow()
const addB = p.locator(`#schedBoard [data-gradd="${DI}"]:visible`).first(); await addB.scrollIntoViewIfNeeded(); await addB.click(); await p.waitForTimeout(500)
const own = await p.evaluate(di => { const g = window.DAYS[di].ground; const i = g.findIndex(x => !x.src && (x.prog === '' || x.prog == null || /^NEW|^ITEM/i.test(x.prog))); return { idx: i, all: g.map(x => x.prog + (x.src ? '(input)' : '(own)')) } }, DI)
console.log('F own row added:', j(own))
const oi = own.all.length - 1
const nameBox = p.locator(`#schedBoard [data-fill="g:${DI}.${oi}.+"]`).first()
const oRow = p.locator('#schedBoard .sb-panel.grnd .sb-arow').filter({ has: p.locator(`[data-grcx="${DI}.${oi}"]`) }).first()
await oRow.scrollIntoViewIfNeeded()
await oRow.locator('input.ain, textarea.ain').first().fill('Own item'); await oRow.locator('input.ain, textarea.ain').first().blur(); await p.waitForTimeout(400)
const ownMarks = async () => p.evaluate(([di, i]) => { const x = window.DAYS[di].ground[i]; return `cx=${!!x.cx} cxr="${x.cxr || ''}" flag=${!!x.flag} info=${!!x.info}` }, [DI, oi])
for (const [attr, label] of [['data-grflag', 'red box'], ['data-grinfo', 'info only'], ['data-grcx', 'CX']]) {
  const b = oRow.locator(`[${attr}]`).first(); const m0 = await L.toastMark(p); await b.click(); await p.waitForTimeout(500)
  if (attr === 'data-grcx') { const q = p.locator('#cxQuick [data-cxq="WX"]').first(); if (await q.count()) await q.click(); await p.locator('#cxSave').click(); await p.waitForTimeout(500) }
  console.log('F own row', label, '| toast:', await L.toastsSince(p, m0), '| row now:', await ownMarks())
}
await L.shot(p, 'c6-6-own-row-board')
console.log('F the Meeting input unchanged by the own row buttons?', (await rawNow()) === rawBefore, '| INPUTS count', nBefore, '->', await p.evaluate(() => window.INPUTS.length))
console.log('ERRORS', errs.join(' | ') || 'none')
await browser.close()
