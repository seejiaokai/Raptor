// K1 (peek) + K7 (View-only Sched as Saber and Ranger). One non-fresh world.
import * as K from './or-K-lib.mjs'
const { fileInput, goWeek, goView, goBoard, shot, shotEl, readRows, inputsOf, reload, saveRes, errs } = K
const out = {}
const { ctx, page: p } = await K.openWorld({ fresh: false })
await K.hideToast(p)
const filed = await fileInput(p, { type: 'Meeting', people: ['Ranger', 'Tally', 'Hex'], ph: ['allavail'], from: K.ISO, to: K.ISO, timed: ['14:00', '15:00'], title: K.TITLE, rmk: 'Bring ID' })
out.filed = filed
console.log('filed', JSON.stringify(filed))
await goWeek(p)
await K.openFold(p, 'week')
const r0 = await readRows(p)
out.editRows = r0
console.log('EDIT WEEK', JSON.stringify(r0))
await K.scrollToSec(p, 'ground'); await p.waitForTimeout(300)
await shotEl(p.locator(`#eWeek .day:not(.peek) [data-secmove="2.ground"]`).first(), 'k1-0-edit-week-ground')

// ---- K1: step to the week before so 13-19 Jul is the peek
const chips = await p.evaluate(() => [...document.querySelectorAll('button[data-wk]')].filter(b => b.offsetParent).map(b => b.textContent.trim() + '|' + b.getAttribute('data-wk')))
console.log('chips', JSON.stringify(chips))
out.chips = chips
await p.locator('button[data-wk]:visible', { hasText: 'Jul 06' }).first().click(); await p.waitForTimeout(1200)
const peek = () => p.evaluate(() => {
  const d = [...document.querySelectorAll('#eWeek .day.peek')][2]; if (!d) return null
  const rows = [...d.querySelectorAll('.pl-row')]
  return { head: (d.querySelector('.day-head')?.innerText || d.innerText.slice(0, 40)).replace(/\s+/g, ' '), rows: rows.map(r => ({ name: r.querySelector('.nm')?.textContent.trim(), who: [...r.querySelectorAll('.puck')].map(k => k.innerText.replace(/\s+/g, ' ').trim()), text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 160), controls: r.querySelectorAll('[contenteditable=true], [data-slot], [data-fill], button, input, textarea').length, cls: r.className })).filter(r => /range brief/i.test(r.name || '')) }
})
await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day.peek')][2]; d.scrollIntoView({ inline: 'center', block: 'nearest' }); const sec = d.querySelector('.sec-grnd'); window.scrollTo(0, Math.max(0, sec.getBoundingClientRect().top + window.scrollY - 96)) })
await p.waitForTimeout(500)
out.peek = await peek()
console.log('PEEK', JSON.stringify(out.peek))
await K.hideToast(p)
await shotEl(p.locator('#eWeek .day.peek').nth(2).locator('.sec-grnd').first(), 'k1-1-peek-wednesday-ground')
await shot(p, 'k1-1b-peek-page')
out.inputs1 = await inputsOf(p)

// ---- K7 as Saber: View-only Sched
await goView(p)
const hasWk = await p.locator('#vWeek button[data-wk]:visible', { hasText: 'Jul 13' }).count()
await K.openFold(p, 'view', K.DI, '#vWeek')
await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')]; if (d.length) console.log('vweek days', d.length) })
const v = await readRows(p)
out.k7saber = v
console.log('K7 SABER view', JSON.stringify({ g: v.viewGround, i: v.viewInputs }), 'wk on view', hasWk)
const vcur = await p.evaluate(() => ({ cur: window.CURWEEK, head: (document.querySelector('#vWeek .day:not(.peek) .day-head')?.innerText || '').replace(/\s+/g, ' ') }))
console.log('view week', JSON.stringify(vcur))
out.vcur = vcur
await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; if (d) { d.scrollIntoView({ inline: 'start', block: 'nearest' }); const sec = d.querySelector('.sec-grnd'); if (sec) window.scrollTo(0, Math.max(0, sec.getBoundingClientRect().top + window.scrollY - 96)) } })
await p.waitForTimeout(300)
await K.hideToast(p)
await shot(p, 'k7-1-saber-viewonly-ground')
const ctl = await p.evaluate(() => { const rows = [...document.querySelectorAll('#vWeek .day:not(.peek) .pl-row')].filter(r => /range brief/i.test(r.querySelector('.nm')?.textContent || '')); return rows.map(r => ({ editable: r.querySelectorAll('[contenteditable=true], input, textarea, select, button').length, slots: r.querySelectorAll('[data-slot],[data-fill]').length, text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) })) })
out.k7saberCtl = ctl
console.log('K7 saber controls', JSON.stringify(ctl))
// the Personal Inputs line on the view page
const sec = p.locator('#vWeek .day:not(.peek)').nth(2).locator('.sec-inp').first()
if (await sec.count()) { await shotEl(sec, 'k7-2-saber-viewonly-personal') }

// ---- K7 as Ranger: reload and sign in as us
await reload(p, 'us', 'us')
await goView(p)
await K.openFold(p, 'view', K.DI, '#vWeek')
const v2 = await readRows(p)
out.k7ranger = v2
console.log('K7 RANGER view', JSON.stringify({ g: v2.viewGround, i: v2.viewInputs }))
const ctl2 = await p.evaluate(() => { const rows = [...document.querySelectorAll('#vWeek .day:not(.peek) .pl-row')].filter(r => /range brief/i.test(r.querySelector('.nm')?.textContent || '')); return rows.map(r => ({ editable: r.querySelectorAll('[contenteditable=true], input, textarea, select, button').length, slots: r.querySelectorAll('[data-slot],[data-fill]').length, text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) })) })
out.k7rangerCtl = ctl2
console.log('K7 ranger controls', JSON.stringify(ctl2))
await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; if (d) { d.scrollIntoView({ inline: 'start', block: 'nearest' }); const sec = d.querySelector('.sec-grnd'); if (sec) window.scrollTo(0, Math.max(0, sec.getBoundingClientRect().top + window.scrollY - 96)) } })
await p.waitForTimeout(300)
await K.hideToast(p)
await shot(p, 'k7-3-ranger-viewonly-ground')
const sec2 = p.locator('#vWeek .day:not(.peek)').nth(2).locator('.sec-inp').first()
if (await sec2.count()) { await shotEl(sec2, 'k7-4-ranger-viewonly-personal') }
out.inputsEnd = await inputsOf(p)
out.errs = errs.slice()
saveRes('k1_k7', out)
console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
