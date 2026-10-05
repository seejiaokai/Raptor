/* L-06 — how a Blue/Red answer is listed in the changes window. RECORD. */
import * as G from './stk2-M-lib.mjs'
import { tap, type, put } from './lib.mjs'
const { L, W } = G
const TAG = process.env.HP_PHONE ? 'ph' : 'dk'
const w = await G.world(); const p = w.p; const D = 5
const out = {}
const ID = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [v.cs, k])))
await W.toastSpy(p)
/* tracking on (Logic → Edit rules → the switch) */
await G.logicEditOn(p)
await p.locator('#lgMissionMix').setChecked(true); await G.sleep(400)
out.tracking = await p.locator('#lgMissionMix').getAttribute('aria-checked')
await G.logicDone(p)
/* the day: a VL formation, built on the board */
await G.boardOn(p, D)
await G.addWave(p, D)
await type(p, `[data-bfld="ff:${D}.0.0.cs"]`, 'VL')
await type(p, `[data-bfld="ff:${D}.0.0.to"]`, '10:00')
await type(p, `[data-bfld="ff:${D}.0.0.ld"]`, '11:15')
console.log('seat', await put(p, `[data-slot="${D}.0.0.0.p"]`, [ID.Reaper]))
await G.boardOff(p)
await L.go(p, 'editsched'); await W.showDay(p, D)

const rem = () => p.locator(`#eWeek [data-txt="fr:${D}.0.0.0"]`).first()
async function answer(side) {
  const b = p.locator(`[data-role-side="${side}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await G.sleep(500)
}
/* type the remarks and leave the box */
await rem().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await rem().click(); await p.keyboard.press('Control+A'); await p.keyboard.type('DS FOR VL', { delay: 8 })
await p.keyboard.press('Tab'); await G.sleep(600)
out.questionShown = await p.locator('.mission-role-question').count()
await G.pic(p, 'L06-1-question')
await answer('red')
out.afterRed = await p.evaluate(() => ({ toast: (document.getElementById('toastEl') || {}).textContent, q: document.querySelectorAll('.mission-role-question').length }))
await G.pic(p, 'L06-2-answered-red')
/* later change it to Blue: click into the remarks, press Change mission role, Blue */
await rem().click(); await G.sleep(400)
const ch = p.locator('[data-role-choose]:visible').first()
out.changeBtnText = (await ch.count()) ? (await ch.innerText()).trim() : 'NO BUTTON'
await ch.click(); await G.sleep(400)
await answer('blue')
out.afterBlue = await p.evaluate(() => ({ toast: (document.getElementById('toastEl') || {}).textContent }))
await G.pic(p, 'L06-3-answered-blue')
out.elogRole = await p.evaluate(() => (window.ELOG.rows || []).filter(r => r.fld === 'mission-role').map(r => ({ fld: r.fld, lbl: r.lbl, key: r.key, from: r.from, to: r.to, sub: r.sub, loc: r.loc, wave: r.wave, who: r.who })))
console.log('ELOG role rows', JSON.stringify(out.elogRole))

async function openWin(di) {
  await W.showDay(p, di)
  const c = p.locator(`#eWeek .day[data-day="${di}"] [data-chgday], #eWeek .day[data-day="${di}"] [data-pendlist]`).first()
  if (!(await c.count())) return false
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await c.click(); await G.sleep(700)
  return true
}
async function readWin(label) {
  const r = await p.evaluate(() => {
    const w = document.querySelector('.chgwin'); if (!w || w.hidden) return null
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    return { title: t(w.querySelector('.win-ttl') || w), tabs: [...w.querySelectorAll('.win-tab')].map(e => t(e) + (e.classList.contains('on') ? ' [on]' : '')),
      groups: [...w.querySelectorAll('.cw-gh')].map(t), lines: [...w.querySelectorAll('.cw-l')].map(t), none: w.querySelector('.cw-none') ? t(w.querySelector('.cw-none')) : null }
  })
  if (r) r.pic = await G.pic(p, `L06-${label}`)
  console.log('WIN', label, JSON.stringify(r))
  out['win_' + label] = r
  return r
}
const clickTab = async re => { const b = p.locator('.chgwin .win-tab').filter({ hasText: re }).first(); if (await b.count()) { await b.click(); await G.sleep(500) } }
const clickGrp = async n => { const b = p.locator('.chgwin .cw-g-btn').filter({ hasText: n }).first(); if (await b.count()) { await b.click(); await G.sleep(500) } }
async function bothGroupings(label) {
  await clickTab(/All changes/)
  await clickGrp('Item'); await readWin(label + '-item')
  await clickGrp('Who'); await readWin(label + '-who')
}
out.opened1 = await openWin(D)
await bothGroupings('4-sat-two-answers')
await p.locator('.chgwin .win-x').first().click(); await G.sleep(300)

/* a day template carrying the answered formation: save Saturday as a template, apply it to Sunday */
await W.showDay(p, D)
const tplBtn = p.locator(`#eWeek [data-daytplopen="${D}"]`).first()
await tplBtn.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await tplBtn.click(); await G.sleep(400)
await p.locator('[data-daytplsave]').first().click(); await G.sleep(700)
out.tplToast = (await G.toast(p))
await G.pic(p, 'L06-5-template-saved')
const dn = p.locator('#daytplClose:visible').first(); if (await dn.count()) { await dn.click(); await G.sleep(400) } else { console.log('no #daytplClose visible'); await G.pic(p, 'L06-5b-no-modal') }
const S = 6
await W.showDay(p, S)
const tb2 = p.locator(`#eWeek [data-daytplopen="${S}"]`).first()
await tb2.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await tb2.click(); await G.sleep(400)
const pk = p.locator('[data-daytplpick]').first(); out.pickText = (await pk.innerText()).replace(/\s+/g, ' ')
await pk.click(); await G.sleep(700)
out.applyToast1 = await G.toast(p)
if (/replaces your unpublished edits/.test(out.applyToast1 || '')) {
  await tb2.click(); await G.sleep(400); await p.locator('[data-daytplpick]').first().click(); await G.sleep(800); out.applyToast2 = await G.toast(p)
}
out.sunday = await p.evaluate(() => ({ waves: DAYS[6].waves.map(w => w.formations.map(f => ({ cs: f.cs, to: f.to, rm: f.aircraft.map(a => a.rmks) }))) }))
console.log('SUNDAY', JSON.stringify(out.sunday), out.applyToast1, out.applyToast2)
await W.showDay(p, S); await G.pic(p, 'L06-6-template-applied-sunday')
out.opened2 = await openWin(S)
await bothGroupings('7-sun-after-template')
/* the insights state of Sunday's formation? record Insights role marker in week: is the question/button present */
await p.locator('.chgwin .win-x').first().click(); await G.sleep(300)

/* one Undo */
await W.toasts(p)
const u = await W.door(p, 'top', 'undo'); out.undo = u
console.log('UNDO', JSON.stringify(u))
out.sundayAfterUndo = await p.evaluate(() => ({ waves: DAYS[6].waves.map(w => w.formations.map(f => ({ cs: f.cs, rm: f.aircraft.map(a => a.rmks) }))) }))
out.opened3 = await openWin(S)
await bothGroupings('8-sun-after-undo')
await p.locator('.chgwin .win-x').first().click(); await G.sleep(300)
out.opened4 = await openWin(D)
await bothGroupings('9-sat-after-undo')
console.log('errors', w.errors)
G.save('L06-' + TAG, { out, errors: w.errors })
console.log('FINAL', JSON.stringify(out).slice(0, 12000))
await w.browser.close()
