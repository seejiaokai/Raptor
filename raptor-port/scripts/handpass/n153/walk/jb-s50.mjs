// jb-s50 v1 - S50 and S51 on the Leave War. Hunter (Plan of 149) on 149's Leave War: the day's window, a dragged range, the
// person window; the member view and a pick, each door tried as drawn; band, greyed parts, balance boxes, Close and the X.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, as, grant, go, state, openMenu } from './jlib.mjs'
import { wait } from './jb-lib.mjs'
import { over, wins, T } from '../../n150/walk/r-lib.mjs'
const SZ = process.env.SZ || 'd'
const tag = `s50-${SZ}`
console.log('jb-s50 v1', SZ)
picsFor(tag)
const norm = t => (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
const MEMBER = 'Member view. Switch back to the admin view to change this, or close it.'
const PICKED = (a, b) => `This is ${a}'s. You picked ${b} — close this to go on.`
const MAN = 'osp9', D1 = '2026-12-09', D2 = '2026-12-11'
const to149 = async s => { if (!(await state(s)).barMark?.startsWith('149')) { await go(s, 'viewsched'); await pickSq(s, '149'); await shut(s) } await go(s, 'leavewar'); await wait(s, 1400); await shut(s) }
async function dayWin(s) {
  const c = s.page.locator(T(`cell-${MAN}-${D1}`)).first(); if (!(await c.count())) return false
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 350); const b = await c.boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await wait(s, 800)
  const box = s.page.locator('.bidsheet textarea, .bidsheet input[type=text], .bidsheet input:not([type])').filter({ visible: true }).first()
  if (await box.count()) { await box.click(); await box.fill('JB50 words') }
  return (await wins(s)).length > 0
}
async function rangeWin(s) {
  if (!s.desk) return false
  const a = s.page.locator(T(`cell-${MAN}-${D1}`)).first(), z = s.page.locator(T(`cell-${MAN}-${D2}`)).first(); if (!(await a.count()) || !(await z.count())) return false
  await a.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 350)
  const p = await a.boundingBox(), q = await z.boundingBox()
  await s.page.mouse.move(p.x + p.width / 2, p.y + p.height / 2); await s.page.mouse.down(); await wait(s, 120)
  await s.page.mouse.move((p.x + q.x + q.width) / 2, p.y + p.height / 2, { steps: 5 }); await s.page.mouse.move(q.x + q.width / 2, q.y + q.height / 2, { steps: 5 }); await wait(s, 100); await s.page.mouse.up(); await wait(s, 800)
  const box = s.page.locator('.bidsheet textarea, .bidsheet input[type=text], .bidsheet input:not([type])').filter({ visible: true }).first()
  if (await box.count()) { await box.click(); await box.fill('JB50 words') }
  return (await wins(s)).length > 0
}
async function personWin(s) {
  let n = s.page.locator(T(`person-${MAN}`)).filter({ visible: true }).first()
  if (!(await n.count()) || (await over(s, `[data-testid="person-${MAN}"]`)) !== 'self') n = s.page.locator(`.mxband [data-band-id="${MAN}"] .whoedit`).filter({ visible: true }).first()
  if (!(await n.count())) return false
  const b = await n.boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await wait(s, 800); return (await wins(s)).length > 0
}
const boxes = s => s.page.evaluate(() => { const w = [...document.querySelectorAll('.bidsheet, .floatwin')].find(e => e.getBoundingClientRect().width > 0); if (!w) return null; return [...w.querySelectorAll('input')].filter(i => i.getBoundingClientRect().width > 0 && i.type !== 'checkbox').length })
async function closeWin(s) {
  for (let i = 0; i < 3 && (await wins(s)).length; i++) {
    let done = false
    for (const sel of ['.moveband button', T('pw-close'), T('bid-cancel'), '.bidsheet .bidsheet-hd button.x', '.bidsheet button[aria-label="Close"]']) {
      if ((await over(s, sel)) === 'self') { await press(s, sel); done = true; break }
    }
    if (!done) await s.page.keyboard.press('Escape'); await wait(s, 400)
  }
}
const toRole = async (s, name) => {
  if (s.desk) { const o = await over(s, '#roleBadge'); if (o !== 'self') return { pressed: false, cover: o }; await press(s, '#roleBadge', name); return { pressed: true } }
  const o = await over(s, '#burger'); if (o !== 'self') return { pressed: false, cover: o }
  const n = (await wins(s)).length; await openMenu(s, name && name + '-menu')
  if (!(await state(s)).drawerOpen) return { pressed: false, cover: `the ☰ tap opened no menu; windows ${n} to ${(await wins(s)).length}` }
  await press(s, '#drawerRole', name); await shut(s); return { pressed: true }
}
const toPick = async (s, u, name) => {
  const o = await over(s, s.desk ? '#sqnMenuBtn' : '#burger'); if (o !== 'self') return { pressed: false, cover: o }
  if (!s.desk) { await openMenu(s); if (!(await state(s)).drawerOpen) return { pressed: false, cover: 'the ☰ tap opened no menu' } }
  await pickSq(s, u, name); await shut(s); await wait(s, 400); return { pressed: true }
}
const member = async s => /Member/.test((await state(s)).badge || (await state(s)).role || '') || (await state(s)).role === 'Switch to the admin view'
try {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a'); check('grant', await grant(s, 'prowler', '149', 'plan'), 'plan'); await go(s, 'viewsched'); await shut(s)
  await as(s, 'ad2', 'a2')
  for (const [kind, opener] of [['day', dayWin], ['range', rangeWin], ['person', personWin]]) {
    await step(`member view: ${kind}`, async () => {
      const k = `mv-${kind}`
      await to149(s)
      if (!(await opener(s))) { note(`NOT WALKED ${k}: the window did not open at this size`); await pic(s, `${k}-0-none`); return }
      const w0 = (await wins(s))[0]; const b0 = await boxes(s); note(`${k} open`, JSON.stringify(w0), 'boxes', b0); await pic(s, `${k}-1-open`)
      const r = await toRole(s, `${k}-sw`); note(`${k} switch`, JSON.stringify(r))
      if (!r.pressed) { note(`RECORD ${k}: the switch is covered by`, r.cover); await pic(s, `${k}-2-covered`); await closeWin(s); if (await member(s)) await toRole(s); return }
      await wait(s, 500); const w = (await wins(s))[0]; const b1 = await boxes(s); note(`${k} held`, JSON.stringify(w), 'boxes', b1, 'page', (await state(s)).page); await pic(s, `${k}-2-held`)
      check(`${k}: band reads "${MEMBER}"`, !!w && norm(w.band) === MEMBER, w && w.band)
      check(`${k}: greyed parts`, !!w && w.held > 0, w && w.held)
      if (kind === 'person') check(`${k}: balance boxes stay boxes`, b1 === b0 && b0 > 0, { b0, b1 })
      if (w0.typed.length) check(`${k}: typed words kept`, !!w && w.typed.join() === w0.typed.join(), w && w.typed)
      const back = await toRole(s, `${k}-swb`); note(`${k} back`, JSON.stringify(back)); check(`${k}: the way back the band names can be pressed`, back.pressed, back)
      if (back.pressed) { await wait(s, 500); const v = (await wins(s))[0]; note(`${k} back window`, JSON.stringify(v)); await pic(s, `${k}-3-back`); check(`${k}: back live, no band, words kept`, !!v && !v.band && v.held === 0 && v.typed.join() === w0.typed.join(), v) }
      await closeWin(s); check(`${k}: closes`, (await wins(s)).length === 0, await wins(s))
      if (await member(s)) { await toRole(s); await wait(s, 300) }
    })
    await step(`pick: ${kind}`, async () => {
      const k = `pk-${kind}`
      await to149(s)
      if (!(await opener(s))) { note(`NOT WALKED ${k}: the window did not open at this size`); return }
      const w0 = (await wins(s))[0]; const b0 = await boxes(s)
      const p = await toPick(s, '142', `${k}-pick`); note(`${k} pick`, JSON.stringify(p))
      if (!p.pressed) { note(`RECORD ${k}: the pick is covered by`, p.cover); await pic(s, `${k}-2-covered`); await closeWin(s); return }
      const w = (await wins(s))[0]; note(`${k} held`, JSON.stringify(w), 'page', (await state(s)).page); await pic(s, `${k}-2-held`)
      check(`${k}: band reads "${PICKED('149', '142')}"`, !!w && norm(w.band) === PICKED('149', '142'), w && w.band)
      if (kind === 'person') check(`${k}: balance boxes stay boxes`, (await boxes(s)) === b0 && b0 > 0, { b0, b1: await boxes(s) })
      const r = await toRole(s, `${k}-sw`); note(`${k} member view on top`, JSON.stringify(r))
      if (r.pressed) { await wait(s, 400); const v = (await wins(s))[0]; check(`${k}: still the pick's band in the member view`, !!v && norm(v.band) === PICKED('149', '142'), v && v.band); await pic(s, `${k}-3-member`); await toRole(s); await wait(s, 300) }
      const q = await toPick(s, '149', `${k}-ret`); await wait(s, 400); const x = (await wins(s))[0]; note(`${k} return`, JSON.stringify(q), JSON.stringify(x)); await pic(s, `${k}-4-return`)
      if (q.pressed) check(`${k}: back on 149 live with its words`, !!x && !x.band && x.held === 0 && x.typed.join() === w0.typed.join(), x)
      await closeWin(s); check(`${k}: closes`, (await wins(s)).length === 0, await wins(s))
      if (await member(s)) { await toRole(s); await wait(s, 300) }
    })
  }
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
