// walker C — exploration 5: the Inputs page: where an approved leave sits, how a remark is changed
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/c/explore'
const L = await import('./lw-m4-lib.mjs')
const { T, shot, press, vis, txt } = L
console.log('[lw-m4-walk-c-explore5 v3]')
const w = await L.newCtx('desk')
const P = w.page
const ids = () => P.evaluate(() => [...document.querySelectorAll('#page-inputs [data-testid], #page-inputs [id], .modal [data-testid], [role=dialog] [data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid || e.id))
await L.signIn(w, 'member')
await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
await L.switchTo(w, 'admin')
await L.openCell(w, 'bane', '2026-01-13'); await press(w, T('decide-approve')); await P.waitForTimeout(600)
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(900)
// the List view
await P.getByRole('button', { name: 'List' }).first().click(); await P.waitForTimeout(800)
await shot(w, 'inputs-list')
console.log('LIST ids:', JSON.stringify((await ids()).slice(0, 80)))
console.log('LIST text:', (await P.evaluate(() => document.querySelector('#page-inputs')?.innerText || '')).replace(/\s+/g, ' ').slice(0, 1500))
await P.click('#inRangeBtn'); await P.waitForTimeout(600)
await shot(w, 'inputs-range')
console.log('RANGE pop text:', (await P.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').match(/All dates.{0,200}/)?.[0])
const allDates = P.getByText('All dates', { exact: true }).first()
if (await allDates.count()) { await allDates.click(); await P.waitForTimeout(800) }
await P.selectOption('#inFPerson', { label: 'Ranger' }).catch(e => console.log('select person failed', String(e).slice(0, 100)))
await P.waitForTimeout(600)
await shot(w, 'inputs-list-ranger')
console.log('ROWS:', (await P.evaluate(() => [...document.querySelectorAll('#intbl tr')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).slice(0, 10))).join(' || '))
const row = P.locator('#intbl tr').filter({ hasText: '13 Jan' }).first()
console.log('row count', await row.count())
if (await row.count()) { await row.click(); await P.waitForTimeout(700); await shot(w, 'inputs-row-opened'); console.log('OPENED ids:', JSON.stringify((await P.evaluate(() => [...document.querySelectorAll('[data-testid], input, textarea, button')].filter(e => e.getBoundingClientRect().height > 0 && e.closest('[role=dialog], .modal, .iw, #inputWin, .inwin')).map(e => (e.dataset.testid || e.id || e.tagName + ':' + (e.innerText||e.placeholder||'').slice(0, 20))))).slice(0, 60))) }
console.log('errs', w.errs)
await w.ctx.close()
await L.closeBrowser()
console.log('DONE')
