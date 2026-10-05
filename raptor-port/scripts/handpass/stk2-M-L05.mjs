/* L-05 — the name of the reporting lines in four places. RECORD the exact words. */
import * as G from './stk2-M-lib.mjs'
import { tap, type, put } from './lib.mjs'
const { L, W } = G
const TAG = process.env.HP_PHONE ? 'ph' : 'dk'
const w = await G.world(); const p = w.p; const D = 5
const out = {}
const ID = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [v.cs, k])))
await W.toastSpy(p)
await G.boardOn(p, D)
await G.addWave(p, D)
await type(p, `[data-bfld="ff:${D}.0.0.cs"]`, 'VIPER')
await type(p, `[data-bfld="ff:${D}.0.0.to"]`, '10:00')
await type(p, `[data-bfld="ff:${D}.0.0.ld"]`, '11:15')
console.log('seat', await put(p, `[data-slot="${D}.0.0.0.p"]`, [ID.Reaper]))
await G.tapSel(p, `#schedBoard [data-itadd="${D}|0"]`); await G.sleep(400)
await G.tapSel(p, `#schedBoard [data-itadd="${D}|0"]`); await G.sleep(400)
await G.itLine(p, '#schedBoard', D, 0, 1, '08:30H: VL RALLY AFTER IN TIME')
console.log('lines', JSON.stringify(await p.evaluate(() => DAYS[5].waves[0].intimes.slice())))
const sg = await W.signDay(p, D); const pb = await W.publishDay(p, D)
console.log('sign', JSON.stringify(sg), 'pub', JSON.stringify(pb))
await G.sleep(700)
await G.boardOff(p)
await L.go(p, 'editsched'); await W.showDay(p, D)
await W.toastSpy(p)
out.head0 = await W.head(p, D)
await G.pic(p, 'L05-1-published')

/* change line 0, delete line 1 with its cross, on the week */
await G.itLine(p, '#eWeek', D, 0, 0, '07:45H: IN TIME + WX/NOTAMS')
out.toastsAfterChange = await W.toasts(p)
out.undoTitleAfterChange = await p.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.title, aria: b.getAttribute('aria-label'), text: b.innerText, disabled: b.disabled } : null })
await W.showDay(p, D)
const x = p.locator(`#eWeek [data-itdel^="${D}|0|"]`).nth(1)
await x.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await x.click(); await G.sleep(700)
out.toastAfterX = await W.toasts(p)
out.toastNow = await G.toast(p)
out.undoTitleAfterX = await p.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.title, aria: b.getAttribute('aria-label'), text: b.innerText, disabled: b.disabled } : null })
out.lines = await p.evaluate(() => DAYS[5].waves[0].intimes.slice())
out.head1 = await W.head(p, D)
await W.showDay(p, D)
await G.pic(p, 'L05-2-after-change-and-delete')
console.log('OUT1', JSON.stringify(out))

/* the day's pending list = the pending chip → To go out tab */
const chip = p.locator(`#eWeek .day[data-day="${D}"] [data-pendlist], #eWeek .day[data-day="${D}"] [data-chgday]`)
out.chips = await chip.evaluateAll(es => es.map(e => ({ text: e.innerText.trim(), attrs: [...e.attributes].map(a => a.name + '=' + a.value).join(' ').slice(0, 120) })))
console.log('chips', JSON.stringify(out.chips))
const pend = p.locator(`#eWeek .day[data-day="${D}"] [data-pendlist]`).first()
if (await pend.count()) { await pend.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await pend.click(); await G.sleep(700) }
async function readWin(label) {
  const r = await p.evaluate(() => {
    const w = document.querySelector('.chgwin'); if (!w || w.hidden) return null
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    return { title: t(w.querySelector('.win-ttl') || w), tabs: [...w.querySelectorAll('.win-tab')].map(e => t(e) + (e.classList.contains('on') ? ' [on]' : '')),
      groups: [...w.querySelectorAll('.cw-gh')].map(t), lines: [...w.querySelectorAll('.cw-l')].map(t), out: w.querySelector('.cw-out') ? t(w.querySelector('.cw-out')) : null, none: w.querySelector('.cw-none') ? t(w.querySelector('.cw-none')) : null }
  })
  r.pic = await G.pic(p, `L05-${label}`)
  console.log('WIN', label, JSON.stringify(r))
  out['win_' + label] = r
  return r
}
await readWin('3-to-go-out')
const clickTab = async re => { const b = p.locator('.chgwin .win-tab').filter({ hasText: re }).first(); if (await b.count()) { await b.click(); await G.sleep(500); return true } return false }
const clickGrp = async n => { const b = p.locator('.chgwin .cw-g-btn').filter({ hasText: n }).first(); if (await b.count()) { await b.click(); await G.sleep(500); return true } return false }
await clickTab(/All changes/); await clickGrp('Item'); await readWin('4-all-by-item')
await clickGrp('Who'); await readWin('5-all-by-who')
await clickTab(/New to you/); await clickGrp('Item'); await readWin('6-new-by-item')
await clickGrp('Who'); await readWin('7-new-by-who')

/* the History bubble: hover the in-times block of Saturday on the week */
await W.showDay(p, D)
const blk = p.locator(`#eWeek .intimes[data-intimes="${D}|0"]`).first()
await blk.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await G.sleep(300)
out.dot = await blk.evaluate(e => ({ histdot: e.hasAttribute('data-histdot') }))
const bb = await blk.boundingBox()
await p.mouse.move(bb.x + 5, bb.y + 5); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 6 }); await G.sleep(700)
out.bubble = await p.evaluate(() => { const b = document.querySelector('.histbub'); return b ? { shown: getComputedStyle(b).display !== 'none' && getComputedStyle(b).visibility !== 'hidden', text: b.innerText.replace(/\s+/g, ' ').trim() } : null })
out.bubblePic = await G.pic(p, 'L05-8-history-bubble')
console.log('BUBBLE', JSON.stringify(out.bubble), JSON.stringify(out.dot))
/* also hover the first line's element specifically */
await p.mouse.move(5, 5); await G.sleep(500)

/* close the window; the Undo / Redo words */
await p.locator('.chgwin .win-x').first().click(); await G.sleep(400)
await W.toastSpy(p); await W.toasts(p)
const u1 = await W.door(p, 'top', 'undo'); out.undo1 = u1
await G.pic(p, 'L05-9-after-undo')
const r1 = await W.door(p, 'top', 'redo'); out.redo1 = r1
console.log('UNDO', JSON.stringify(u1), 'REDO', JSON.stringify(r1))
out.undoTitleNow = await p.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.title, aria: b.getAttribute('aria-label') } : null })
console.log('errors', w.errors)
G.save('L05-' + TAG, { out, errors: w.errors })
console.log('FINAL', JSON.stringify(out).slice(0, 9000))
await w.browser.close()
