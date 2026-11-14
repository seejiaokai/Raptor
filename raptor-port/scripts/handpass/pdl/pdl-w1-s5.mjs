/* pdl-w1-s5 v1 — S5 the plain-user round (desktop): Logic edit / change / Done / Reset; board open and ✓ Done; changes window from a pending count (✕ and Escape);
   Undo / Redo after an edit; View-only Sched's week arrows. A picture right after each press; every row RECORDED. STOPAT=<n> stops after block n. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 's5'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/' + RUN)
const STOPAT = +(process.env.STOPAT || 99)
console.log('pdl-w1-s5 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w1-lib.mjs')
const { X, W, L, sleep, row, SHOTS } = P
const w = await X.world('desktop')
const { page } = w
const man = w.ID('Vandal'), NAME = 'Vandal'
const j = o => JSON.stringify(o)
const shot = n => P.shotPage(page, n)
const state = () => page.evaluate(() => ({
  page: window.CURPAGE, crewRest: VCONF.crewRest, longDay: VCONF.longDay,
  board: !!(document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth),
  banner: ((document.querySelector('#lgBody')?.parentElement?.innerText || '').match(/\d+ settings? changed[^.]*\./) || [''])[0],
  btns: [...document.querySelectorAll('#lgEdit, #lgDone, #lgReset, button')].filter(b => b.offsetWidth && /^(Edit|Done|Reset)/i.test(b.textContent.replace(/[^\w ]/g, '').trim())).map(b => b.textContent.replace(/\s+/g, ' ').trim()).slice(0, 4),
  wins: [...document.querySelectorAll('.win, [role=dialog], .chgwin, #chgWin, .changes-win')].filter(e => e.offsetWidth).map(e => (e.id || e.className).toString().slice(0, 30) + ':' + e.innerText.replace(/[\s ]+/g, ' ').slice(0, 60)).slice(0, 3)
}))
async function press(sel, pic, label) {
  const loc = page.locator(sel + ':visible').first()
  await loc.waitFor({ state: 'visible', timeout: 8000 })
  await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await loc.click(); await sleep(450)
  const st = await state()
  await shot(pic)
  console.log(label, j(st))
  return st
}

/* ---- A: Logic page ---- */
await L.go(page, 'logic'); await sleep(600)
let s = await state(); await shot('s5-a0-logic-open'); console.log('A0', j(s))
row('S5.A0 Logic page opened', 'RECORDED', j(s), 's5-a0-logic-open.png')
s = await press('#lgEdit', 's5-a1-edit-pressed', 'A1')
row('S5.A1 pressed ✎ Edit', 'RECORDED', j(s), 's5-a1-edit-pressed.png')
const ld = page.locator('#lgBody input[data-lgset="longDay"]').first()
await ld.scrollIntoViewIfNeeded()
const ldBefore = await ld.inputValue()
await ld.fill('13h'); await ld.press('Tab'); await sleep(600)
s = await state(); await shot('s5-a2-longday-13h'); console.log('A2', j(s))
row('S5.A2 changed "Long work day" (typed 13h)', 'RECORDED', `box was "${ldBefore}" now "${await ld.inputValue()}"; ` + j(s), 's5-a2-longday-13h.png')
s = await press('#lgDone', 's5-a3-done-pressed', 'A3')
row('S5.A3 pressed Done', 'RECORDED', j(s), 's5-a3-done-pressed.png')
/* Reset to standard */
const rs = page.getByRole('button', { name: /Reset to standard|Reset all/ }).first()
const rsText = (await rs.count()) ? (await rs.innerText()).trim() : 'NO RESET BUTTON'
await rs.click(); await sleep(600)
s = await state(); await shot('s5-b1-reset-pressed'); console.log('B1', rsText, j(s))
const confirmBtn = page.getByRole('button', { name: /^(Reset|Yes|Confirm|OK)/ }).filter({ hasNotText: /Reset to standard/ }).first()
let conf = ''
if (await confirmBtn.count() && await confirmBtn.isVisible().catch(() => false)) { conf = 'confirm: ' + (await confirmBtn.innerText()); await confirmBtn.click(); await sleep(600) }
s = await state(); await shot('s5-b2-after-reset'); console.log('B2', conf, j(s))
row('S5.B "' + rsText + '" pressed', 'RECORDED', `${conf} after: ${j(s)} (longDay was set to 13h before)`, 's5-b1-reset-pressed.png, s5-b2-after-reset.png')
if (STOPAT <= 1) { P.finish(w); await w.browser.close(); process.exit(0) }

/* ---- C: board open / ✓ Done ---- */
await P.openBoard(w, 0)
const gM = await P.line(w, 0, { to: '18:00', ld: '19:00', who: man }); await L.closeBoard(page)
await P.openBoard(w, 1)
const gT = await P.line(w, 1, { to: '12:00', ld: '13:00', who: man }); await L.closeBoard(page)
console.log('built', j(gM), j(gT))
await L.go(page, 'editsched'); await sleep(500)
await page.locator('#eWeek [data-sbday="1"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(700)
s = await state(); await shot('s5-c1-board-open'); console.log('C1', j(s))
row('S5.C1 Scheduler Board opened for Tue (door on the week)', 'RECORDED', j(s), 's5-c1-board-open.png')
const done = await press('#schedBoard #sbDone', 's5-c2-board-done', 'C2')
row('S5.C2 pressed ✓ Done on the board', 'RECORDED', j(done), 's5-c2-board-done.png')
/* publish Tuesday then edit it, for the pending count */
await P.openBoard(w, 1)
const sp = await X.signAndPublish(w, 1)
await L.closeBoard(page)
console.log('publish', j({ p: sp.p, tag: sp.h && sp.h.tag }))
await L.go(page, 'editsched'); await sleep(500)
const hd0 = await L.head(page, 1)
await P.openBoard(w, 1)
await X.typeIn(w, `[data-bfld="ff:1.${gT.gi}.0.msn"]`, 'BFM2')
await L.closeBoard(page)
await L.go(page, 'editsched'); await sleep(600)
const hd1 = await L.head(page, 1)
console.log('Tue head before edit', hd0.tag, hd0.pending, '| after edit', hd1.tag, hd1.pending)
await shot('s5-d0-tue-pending')
row('S5.D0 Tue published then its mission edited (VL BFM -> BFM2)', 'RECORDED', `before: ${hd0.tag} "${hd0.pending}"; after: ${hd1.tag} "${hd1.pending}"`, 's5-d0-tue-pending.png')
if (STOPAT <= 2) { P.finish(w); await w.browser.close(); process.exit(0) }

/* ---- D: the changes window from the day's pending count ---- */
const pend = page.locator('#eWeek .day[data-day="1"] .dpend:visible').first()
await pend.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
const pendText = (await pend.innerText()).replace(/\s+/g, ' ')
await pend.click(); await sleep(800)
const winInfo = await page.evaluate(() => {
  const cands = [...document.querySelectorAll('div, section, aside')].filter(e => e.offsetWidth > 200 && /pending|changes|History/i.test((e.querySelector('h1,h2,h3,.win-t,.ttl,[class*=title]') || {}).innerText || '') && getComputedStyle(e).position === 'fixed')
  return cands.slice(0, 3).map(e => ({ id: e.id, cls: String(e.className).slice(0, 40), text: e.innerText.replace(/[\s ]+/g, ' ').slice(0, 160), xs: [...e.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => (b.id || b.className) + '|' + b.textContent.trim().slice(0, 8)).slice(0, 8) }))
})
await shot('s5-d1-changes-window-open')
console.log('D1 pending text', pendText, j(winInfo))
row('S5.D1 pressed the day\'s "' + pendText + '" count: window opens', 'RECORDED', j(winInfo), 's5-d1-changes-window-open.png')
const winTitle = page.locator('text=/^Changes · Tuesday/').first()
const winOpen = async () => (await winTitle.count()) && (await winTitle.isVisible().catch(() => false))
const xBtn = () => winTitle.locator('xpath=ancestor::*[.//button[normalize-space()="✕"]][1]').locator('button:has-text("✕")').first()
const winRead = async () => page.evaluate(() => ({ undo: (document.getElementById('undoBtn') || {}).disabled, hist: document.querySelector('#histBtn, [data-histbtn]') ? 'btn' : '', topWin: [...document.querySelectorAll('div')].filter(e => e.offsetWidth > 200 && /^Changes · /.test((e.innerText || '').trim()) && getComputedStyle(e).position === 'fixed').map(e => e.innerText.replace(/[\s ]+/g, ' ').slice(0, 70)).slice(0, 1) }))
console.log('D1 open?', await winOpen())
await xBtn().click(); await sleep(600)
await shot('s5-d2-closed-by-x')
console.log('D2 open after ✕?', await winOpen(), j(await winRead()))
row('S5.D2 closed the changes window with its ✕', 'RECORDED', `window still showing: ${await winOpen()}; page ${await page.evaluate(() => window.CURPAGE)}; ` + j(await winRead()), 's5-d2-closed-by-x.png')
await pend.click(); await sleep(800)
const reopened = await winOpen()
await shot('s5-d3-reopened')
await page.keyboard.press('Escape'); await sleep(600)
await shot('s5-d4-after-escape')
console.log('D3 reopened?', reopened, 'D4 open after Escape?', await winOpen())
row('S5.D3 reopened it from the count, then pressed Escape', 'RECORDED', `reopened: ${reopened}; after Escape still showing: ${await winOpen()}`, 's5-d3-reopened.png, s5-d4-after-escape.png')
if (STOPAT <= 3) { P.finish(w); await w.browser.close(); process.exit(0) }

/* ---- E: Undo / Redo after an edit on Tuesday ---- */
const msnNow = () => page.evaluate(g => window.DAYS[1].waves[g].formations[0].msn, gT.gi)
const m0 = await msnNow()
const ub = page.locator('#undoBtn:visible').first(), rb = page.locator('#redoBtn:visible').first()
const ubInfo = { disabled: await ub.isDisabled(), title: await ub.getAttribute('title') }
await ub.click(); await sleep(800)
const m1 = await msnNow(); const hdU = await L.head(page, 1)
await shot('s5-e1-after-undo')
console.log('E1', m0, '->', m1, j(ubInfo), 'head', hdU.pending, hdU.tag)
row('S5.E1 pressed Undo after the Tuesday edit', 'RECORDED', `mission ${m0} -> ${m1}; Undo button before: ${j(ubInfo)}; Tue head now: ${hdU.tag} "${hdU.pending}"`, 's5-e1-after-undo.png')
const rbInfo = { disabled: await rb.isDisabled(), title: await rb.getAttribute('title') }
await rb.click(); await sleep(800)
const m2 = await msnNow(); const hdR = await L.head(page, 1)
await shot('s5-e2-after-redo')
console.log('E2', m1, '->', m2, j(rbInfo), 'head', hdR.pending, hdR.tag)
row('S5.E2 pressed Redo', 'RECORDED', `mission ${m1} -> ${m2}; Redo button before: ${j(rbInfo)}; Tue head now: ${hdR.tag} "${hdR.pending}"`, 's5-e2-after-redo.png')
const ed = await P.strips(w, 1, man)
row('S5.E3 after Undo/Redo, Tuesday on View-only still the issued face', 'RECORDED', `view head "${ed.viewHead}", rest lines for ${NAME}: ${j((ed.view.items || []).filter(t => /rest/i.test(t) && /Vandal/.test(t)))}`, '')

/* ---- F: View-only Sched's week arrows ---- */
await L.go(page, 'viewsched'); await sleep(700)
const front = () => page.evaluate(() => { const ds = [...document.querySelectorAll('#vWeek .day')].map(d => ({ n: d.dataset.day, x: Math.round(d.getBoundingClientRect().left) })).filter(d => d.x > -40); return 'front day index ' + (ds.sort((a, b) => a.x - b.x)[0] || {}).n + '; scrollLeft ' + Math.round((document.querySelector('#vWeek').scrollLeft || document.scrollingElement.scrollLeft)) })
const f0 = await front(); await shot('s5-f0-view-start'); console.log('F0', f0)
const arrow = async (id, pic) => { await page.mouse.move(id === 'hsR' ? 1530 : 6, 430); await sleep(400); const b = page.locator('#' + id).first(); const vis = await b.isVisible(); const box = vis ? await b.boundingBox() : null; await b.click({ force: true }); await sleep(900); await shot(pic); return { id, vis, box } }
const a1 = await arrow('hsR', 's5-f1-arrow-right'); const f1 = await front(); console.log('F1', j(a1), f1)
const a2 = await arrow('hsR', 's5-f2-arrow-right2'); const f2 = await front(); console.log('F2', j(a2), f2)
const a3 = await arrow('hsL', 's5-f3-arrow-left'); const f3 = await front(); console.log('F3', j(a3), f3)
row('S5.F View-only week arrows: start / › / › / ‹', 'RECORDED', `${f0} | after › : ${f1} | after › : ${f2} | after ‹ : ${f3}`, 's5-f0-..f3.png')
const chip = async (iso, pic) => { const c = page.locator(`.wk[data-wk="${iso}"]:visible`).first(); await c.click(); await sleep(900); await shot(pic); return await page.evaluate(() => window.CURWEEK + ' / Monday ' + window.DAYS[0].dt) }
const w1 = await chip('20/07/2026', 's5-f4-next-week'); const w2 = await chip('13/07/2026', 's5-f5-back-to-week')
const tueHead = await page.evaluate(() => { const e = document.querySelector('#vWeek .day[data-day="1"] .day-head'); return e ? e.innerText.replace(/[\s ]+/g, ' ').trim() : 'NO HEAD' })
console.log('F4', w1, 'F5', w2, 'Tue', tueHead)
row('S5.F2 View-only week chips Jul 20 then Jul 13', 'RECORDED', `after Jul 20: ${w1}; back: ${w2}; Tuesday head: ${tueHead}`, 's5-f4-next-week.png, s5-f5-back-to-week.png')
P.finish(w)
await w.browser.close()
