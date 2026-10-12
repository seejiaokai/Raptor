// walker F - the hands (real mouse) and the readings shared by every case
import * as L from './or-F-lib.mjs'
const { toWeek, toBoard, boxOf, centre, mouseDrag, rosterPuck, toastText, shot } = L
export const DI = 2, ISO = '2026-07-15'
export const rec = { cases: {} }

export const meetingSpec = (people = ['Drifter', 'Hunter', 'Ranger'], over = {}) => ({ type: 'Meeting', people, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: L.TITLE, ...over })
export const trainingSpec = (person = 'Ranger', over = {}) => ({ type: 'Training', person, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: 'Ranger training', oil: 'yes', ...over })

/* the sign-off state on the board: the four selects and the publish button */
export async function signState(p, di = DI) {
  await toBoard(p, di)
  const r = await p.evaluate(di => {
    const b = document.querySelector('#schedBoard')
    const sels = [...b.querySelectorAll(`[data-signday="${di}"]`)].map(s => s.value || '(empty)')
    const btn = b.querySelector(`[data-alpub="${di}"], [data-beak="${di}"]`)
    return { signs: sels, button: btn ? btn.innerText.trim() + (btn.disabled ? ' [disabled]' : ' [enabled]') + ' title=' + (btn.title || '').slice(0, 120) : 'no button' }
  }, di)
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  return r
}

/* the row of an input on the week, by its title */
export const rowOf = (p, title, di = DI) => L.rowInfo(p, di, title)

/* drag a crew-list man onto the row's "+ add" */
export async function addFromCrew(p, cs, title, di = DI, target = 'add') {
  await toWeek(p)
  const row = L.rowLoc(p, di, title)
  await row.scrollIntoViewIfNeeded()
  const src = await rosterPuck(p, cs)
  await src.scrollIntoViewIfNeeded().catch(() => {})
  const tgt = target === 'add' ? row.locator('.addz').first() : row.locator('.puck', { hasText: target }).first()
  const sb = await src.boundingBox(), tb = await tgt.boundingBox()
  if (!sb || !tb) return { ok: false, why: 'no box src=' + !!sb + ' tgt=' + !!tb }
  await mouseDrag(p, centre(sb), centre(tb))
  return { ok: true, toast: await toastText(p) }
}
/* ALL AVAIL / ALL from the crew list onto the row */
export async function dropPlaceholder(p, id, title, di = DI) {
  await toWeek(p)
  const row = L.rowLoc(p, di, title)
  await row.scrollIntoViewIfNeeded()
  const src = p.locator(`#eRoster .rpuck[data-person="${id}"]`).first()
  await src.scrollIntoViewIfNeeded().catch(() => {})
  const tgt = row.locator('.addz').first()
  const sb = await src.boundingBox(), tb = await tgt.boundingBox()
  if (!sb || !tb) return { ok: false, why: 'no box src=' + !!sb + ' tgt=' + !!tb }
  await mouseDrag(p, centre(sb), centre(tb))
  return { ok: true, toast: await toastText(p) }
}
/* right-click a puck of the row: he leaves the input */
export async function takeOutRight(p, cs, title, di = DI) {
  await toWeek(p)
  const row = L.rowLoc(p, di, title)
  await row.scrollIntoViewIfNeeded()
  const pk = row.locator('.puck', { hasText: cs }).first()
  const b = await boxOf(pk)
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2, { button: 'right' }); await p.waitForTimeout(700)
  return { ok: true, toast: await toastText(p) }
}
/* type a start time over the row's start box */
export async function retime(p, title, val, di = DI) {
  await toWeek(p)
  const ri = await p.evaluate(([di, t]) => {
    const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
    for (const r of day.querySelectorAll('.sec-grnd .pl-row')) { const n = r.querySelector('[data-txt$=".prog"]'); if (n && new RegExp(t, 'i').test(n.textContent)) return n.dataset.txt.split('.')[1] }
    return null
  }, [di, title])
  const box = p.locator(`#eWeek [data-txt="gr:${di}.${ri}.str"]`).first()
  await box.scrollIntoViewIfNeeded(); await box.click(); await p.waitForTimeout(150)
  await p.keyboard.press('Control+A'); await p.keyboard.type(val); await p.keyboard.press('Tab')
  await p.waitForTimeout(700)
  return { ok: true, box: await box.textContent(), toast: await toastText(p) }
}
/* on the board, the row's own button: grcx (CX), grdel (the row's X) */
async function boardRowIdx(p, title, di) {
  return p.evaluate(([di, t]) => (window.DAYS[di].ground || []).findIndex(g => new RegExp(t, 'i').test(g.prog || g.name || '')), [di, title])
}
export async function boardCx(p, title, why, di = DI) {
  await toBoard(p, di)
  const ri = await p.evaluate(([t]) => { const rows = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(e => e.offsetParent); const r = rows.find(r => new RegExp(t, 'i').test(r.querySelector('textarea.ain')?.value || '')); return r ? r.querySelector('[data-grcx]').getAttribute('data-grcx') : null }, [title])
  if (!ri) return { ok: false, why: 'row not found' }
  const cx = p.locator(`#schedBoard [data-grcx="${ri}"]:visible`).first()
  await cx.scrollIntoViewIfNeeded(); await cx.click(); await p.waitForTimeout(500)
  if (why === 'UN') {
    await p.waitForSelector('#cxUn', { timeout: 4000 })
    await p.locator('#cxUn').click(); await p.waitForTimeout(600)
  } else if (why != null) {
    await p.waitForSelector('#cxSave', { timeout: 4000 })
    const q = p.locator(`#cxQuick [data-cxq="${why}"]`).first()
    if (await q.count()) await q.click(); else await p.locator('#cxReason').fill(why)
    await p.locator('#cxSave').click(); await p.waitForTimeout(600)
  }
  const toast = await toastText(p)
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  return { ok: true, ri, toast }
}
export async function boardX(p, title, di = DI) {
  await toBoard(p, di)
  const ri = await p.evaluate(([t]) => { const rows = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(e => e.offsetParent); const r = rows.find(r => new RegExp(t, 'i').test(r.querySelector('textarea.ain')?.value || '')); return r ? r.querySelector('[data-grdel]').getAttribute('data-grdel') : null }, [title])
  if (!ri) return { ok: false, why: 'row not found' }
  const x = p.locator(`#schedBoard [data-grdel="${ri}"]:visible`).first()
  await x.scrollIntoViewIfNeeded(); await x.click(); await p.waitForTimeout(700)
  const dlg = await p.locator('[role=dialog]:visible button, .confirm:visible button').allInnerTexts().catch(() => [])
  let confirmed = dlg.length ? dlg : null
  const toast = await toastText(p)
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  return { ok: true, ri, toast, confirmed }
}

/* the five readings + pictures: tag names the files */
export async function snap(p, tag, di = DI, o = {}) {
  const c = await L.counts(p, { di, keepWin: true })
  const pics = []
  pics.push(await L.shotWin(p, `${tag}-window`).catch(() => null))
  await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
  pics.push(await L.shotAmend(p, `${tag}-amend`))
  pics.push(await L.shotHead(p, `${tag}-head`, di, 170).catch(() => null))
  const row = await rowOf(p, o.title || L.TITLE, di)
  return { c, fmt: L.fmt(c), lines: c.lines, pics: pics.filter(Boolean), row: JSON.stringify(row.map(r => ({ times: r.times, pucks: r.pucks, cls: r.cls }))) }
}

/* "Discard N edits": look at the issued Original, press Load, read; if it arms, read the label and confirm */
export async function discardProbe(p, tag, di = DI, title = L.TITLE) {
  await toWeek(p)
  const out = { steps: [] }
  await p.locator(`[data-planmenu="${di}"]`).first().scrollIntoViewIfNeeded()
  await p.locator(`[data-planmenu="${di}"]`).first().click(); await p.waitForTimeout(500)
  await p.locator('.wavemenu button', { hasText: /^Original/ }).first().click(); await p.waitForTimeout(900)
  const btn = () => p.evaluate(() => [...document.querySelectorAll('#eWeek button')].filter(b => b.offsetParent && /discard|load onto|keep editing/i.test(b.innerText)).map(b => b.innerText.replace(/\s+/g, ' ').trim()))
  out.before = await btn()
  await p.locator('#eWeek .dprev-restore').first().click(); await p.waitForTimeout(800)
  out.afterFirstPress = await btn()
  out.toast1 = await toastText(p)
  out.armed = out.afterFirstPress.some(t => /^Discard/.test(t))
  if (out.armed) {
    await shot(p, `${tag}-discard-offer`).catch(() => {})
    out.offer = out.afterFirstPress.find(t => /^Discard/.test(t))
    await p.locator('#eWeek .dprev-restore').first().click(); await p.waitForTimeout(900)
    out.toast2 = await toastText(p)
  }
  await shot(p, `${tag}-after-load`).catch(() => {})
  const a = await L.counts(p, { di })
  out.afterCounts = L.fmt(a); out.afterLines = a.lines; out.afterNums = a.n
  out.afterRow = JSON.stringify((await rowOf(p, title, di)).map(r => ({ times: r.times, pucks: r.pucks, cls: r.cls })))
  return out
}

/* drag a puck from one input's row onto another input's row ("+ add") */
export async function movePuck(p, cs, fromTitle, toTitle, di = DI) {
  await toWeek(p)
  const from = L.rowLoc(p, di, fromTitle), to = L.rowLoc(p, di, toTitle)
  await to.scrollIntoViewIfNeeded()
  const pk = from.locator('.puck', { hasText: cs }).first()
  let sb = await pk.boundingBox(), tb = await to.locator('.addz').first().boundingBox()
  const vh = p.viewportSize().height
  if (!sb || !tb || sb.y < 0 || sb.y > vh || tb.y < 0 || tb.y > vh) { await pk.scrollIntoViewIfNeeded(); sb = await pk.boundingBox(); tb = await to.locator('.addz').first().boundingBox() }
  if (!sb || !tb) return { ok: false, why: 'no box' }
  await mouseDrag(p, centre(sb), centre(tb))
  return { ok: true, toast: await toastText(p), from: sb, to: tb }
}
