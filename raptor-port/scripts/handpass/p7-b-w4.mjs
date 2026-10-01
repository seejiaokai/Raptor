/* [DB-READINESS] group A phase 7 — the FULL check's walk, WALKER B, part 4 (1 Oct 26): one thing the pictures of part 1
   showed and its checks did not ask — THE WINDOW'S FOOT after a time is edited behind the open window. A man is tapped
   (the foot gives his sentence), then the event's time is typed behind the window so his flag goes: what does the foot
   say? Read as drawn, pictured; then closed and re-opened. Desktop, Tuesday 14 Jul, a fresh world.
   Env: HP_URL, HP_SHOTS, HP_OUT, HP_TAG=p7. */
import { boot, fact, facts } from './p6-lib.mjs'
import { handPut } from './seat-lib.mjs'
import * as B from './p7-b-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await B.world(L)
const DI = 1, TAL = 'haowen'
const pics = []
const wpic = async (name) => { const f = await B.winPic(L, p, name); pics.push(f); return f }
const o = {}
try {
  await W.boardOn(p, DI)
  await W.boardText(p, `sr:${DI}.oft.0.label`, 'EP-1'); await W.boardText(p, `sr:${DI}.oft.0.str`, '10:00'); await W.boardText(p, `sr:${DI}.oft.0.end`, '11:00')
  const ri = await B.addGround(L, W, p, DI, 'OPS BRIEF', '09:45', '09:58')
  await handPut(p, `g:${DI}.${ri}.+`, 'allavail')
  const OPS = await B.chipItem(p, DI, 'ground', 'OPS BRIEF')
  const w0 = await B.openChip(p, OPS); o.opened = { foot: w0.foot, tal: B.man(w0, TAL).why }
  await B.tapMan(p, TAL)
  const w1 = await B.win(p); o.tapped = { title: w1.title, foot: w1.foot, tal: B.man(w1, TAL).why }
  await wpic('B19f-1-foot-after-tap')
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '09:20', '09:40')
  const w2 = await B.win(p); const t2 = B.man(w2, TAL)
  o.edited = { title: w2.title, foot: w2.foot, tal: t2 ? (t2.why || '(listed, no flag)') : '(not listed)' }
  await wpic('B19f-2-foot-after-time-edited-behind')
  await B.closeWin(p)
  const w3 = await B.openChip(p, OPS); const t3 = B.man(w3, TAL)
  o.reopened = { title: w3.title, foot: w3.foot, tal: t3 ? (t3.why || '(listed, no flag)') : '(not listed)' }
  await wpic('B19f-3-foot-after-reopen')
  fact('B19f', o)
  L.check('B19f after the time is edited behind the window the LIST follows: Talisman is listed with no flag', o.edited.tal === '(listed, no flag)', o.edited)
  L.check('B19f …and the FOOT no longer gives him a sentence about minutes the event has left', !/sits inside 09:45.10:00/.test(o.edited.foot), o.edited.foot)
  L.check('B19f closing and re-opening the window gives a foot that agrees with the list', !/sits inside 09:45.10:00/.test(o.reopened.foot), o.reopened.foot)
} catch (e) { L.check('B19f — the step ran', false, String(e && e.stack || e).slice(0, 700)) }
fact('errors', errors)
B.saveSection('w4-foot-after-edit-behind', { checks: L.results, facts, errors, pics, out: o })
console.log(JSON.stringify(o, null, 1)); console.log('errors', errors)
await browser.close()
