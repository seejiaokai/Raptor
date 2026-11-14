/* rcf-w3 S35 v1 — ground crew (Ratchet) on all-day local leave, put on a BRIEFING row 09:00-10:00 (D1992).
   usage: RCF_RUN=s35-r1 node scripts/handpass/rcf/rcf-w3-s35.mjs */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check, nrm } = W
const W4 = await import('../am/w4-lib.mjs')
console.log('rcf-w3-s35 v1', W.SHOTS)
const { browser, page, errors } = await W.openWorld()
const D = 4, ISO = '2026-07-17', ID = 'torque'
const I = await import('./rcf-w3-inp.mjs')
await L.go(page, 'inputs'); await page.waitForTimeout(600)
const n0 = await page.evaluate(() => window.INPUTS.length)
await I.openDay(page, ISO)
await page.locator('#icPopAdd').click(); await page.waitForSelector('#inpEditPerson'); await page.waitForTimeout(300)
await page.selectOption('#inpEditPerson', ID)
await page.selectOption('#inpEditType', 'LL')
await page.locator('#inpEditRmk').fill('rcfw3')
await L.shot(page, '00-leave-form')
await page.getByRole('button', { name: 'Add', exact: true }).click(); await page.waitForTimeout(800)
for (let k = 0; k < 3; k++) {
  const nd = page.locator('[data-testid="docconf-nodoc"]')
  if (await nd.count() && await nd.first().isVisible()) { say('document question shown; answering "no document"'); await L.shot(page, '00b-docconf'); await nd.first().click(); await page.waitForTimeout(700) } else break
}
const n1 = await page.evaluate(() => window.INPUTS.length)
const f = { added: n1 - n0 }
say('filed leave:', JSON.stringify(f), 'last input:', JSON.stringify(await page.evaluate(() => { const r = window.INPUTS[window.INPUTS.length - 1]; return r && { type: r.type, people: r.people || r.who, from: r.from || r.d0, to: r.to || r.d1, span: r.span } })))
await L.shot(page, '01-leave-filed')
check('S35 leave filed for Ratchet (set-up)', f.added === 1 ? true : 'NOT WALKED', JSON.stringify(f))
const inp = await page.evaluate(id => window.INPUTS.filter(i => (i.people || [i.who || i.p]).flat().includes(id) || i.person === id || i.who === id).map(i => ({ type: i.type, from: i.from || i.d0 || i.date, to: i.to || i.d1, allday: i.allday })), ID)
say('Ratchet inputs:', JSON.stringify(inp))
await L.board(page, D)
await L.shot(page, '0-board')
// a BRIEFING row 09:00-10:00
const rid0 = await page.evaluate(d => window.DAYS[d].ground.map(g => g.rid), D)
await L.tap(page, `[data-gradd="${D}"]`); await page.waitForTimeout(400)
const gi = await page.evaluate(([d, r]) => window.DAYS[d].ground.findIndex(g => !r.includes(g.rid)), [D, rid0])
await W.setF(page, `gr:${D}.${gi}.prog`, 'BRIEFING'); await W.setF(page, `gr:${D}.${gi}.str`, '09:00'); await W.setF(page, `gr:${D}.${gi}.end`, '10:00')
// the crew list while armed: what does it show for him?
await L.tap(page, `[data-fill="g:${D}.${gi}.+"]`); await page.waitForTimeout(400)
const armed = await page.evaluate(() => window.ARM && window.ARM.key)
const rp = await page.evaluate(id => { const e = document.querySelector(`#sbRoster .rpuck[data-person="${id}"]`); return e ? { cls: e.className.replace(/\s+/g, ' '), title: e.title, text: e.innerText.replace(/\s+/g, ' '), vis: e.offsetWidth > 0 } : null }, ID)
say('RECORD armed ground row', armed, '— crew list entry for Ratchet:', JSON.stringify(rp))
await L.shot(page, '1-armed-roster', page.locator('#sbRoster'))
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
const r = await W.seat(page, `[data-fill="g:${D}.${gi}.+"]`, ID)
say('seat Ratchet on BRIEFING:', r)
const wt = await W.warnText(page)
say('Friday warnings:\n  ' + wt.join('\n  '))
const absence = wt.filter(l => /leave|Ratchet/i.test(l))
check('S35 his absence is flagged', absence.length > 0, absence.join(' / ') || 'nothing about leave: ' + wt.join(' / ').slice(0, 300))
await L.shot(page, '2-seated-board')
await L.shot(page, '2-seated-warn', page.locator('#sbSide'))
const pk = await page.evaluate(id => [...document.querySelectorAll(`#schedBoard [data-person="${id}"]`)].filter(e => e.offsetWidth > 0 && !e.closest('#sbRoster')).map(e => e.title + ' | ' + e.className.replace(/\s+/g, ' ')), ID)
say('Ratchet puck(s):', JSON.stringify(pk))
// the warning's own title, read by the element
const titles = await page.evaluate(() => [...document.querySelectorAll('#sbSide li, #sbSide .wrow, #sbSide .sb-warn')].filter(e => e.offsetWidth > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 8))
say('warning rows:', JSON.stringify(titles))
const tt = await page.evaluate(() => [...document.querySelectorAll('#sbSide [title], #sbSide [aria-label], #sbSide [data-why], #sbSide [data-warntitle]')].filter(e => e.offsetWidth > 0).map(e => e.tagName + ' title=' + (e.title || '') + ' aria=' + (e.getAttribute('aria-label') || '') + ' why=' + (e.getAttribute('data-why') || '') + ' | ' + e.innerText.replace(/\s+/g, ' ').slice(0, 60)))
say('RECORD title/aria attributes in the warning list:', JSON.stringify(tt))
// the (i) behind the warning, if one is offered
const info = page.locator('#sbSide [data-why]:visible, #sbSide button:has-text("ⓘ"):visible, #sbSide .winfo:visible').first()
if (await info.count()) { await info.click(); await page.waitForTimeout(500); await L.shot(page, '3-warning-info'); say('RECORD after pressing the warning ⓘ:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .airpop, .why, [data-testid*=why]')].filter(e => e.offsetWidth > 0).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 400))))) }
// the Logic page's name for the check
await L.closeBoard(page)
await page.locator('a[data-page="logic"]:visible').first().click(); await page.waitForSelector('#page-logic.on'); await page.waitForTimeout(500)
const lg = await page.evaluate(() => { const t = document.querySelector('#page-logic').innerText; const i = t.search(/On leave/); return i >= 0 ? t.slice(Math.max(0, i - 40), i + 220).replace(/\s+/g, ' ') : null })
say('RECORD the Logic page line for the check:', lg)
check('S35 no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
W.summary()
