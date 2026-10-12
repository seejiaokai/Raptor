// Walker C, C9 - deleted from its window (desktop 1440x900). One world.
import * as L from './or-C-lib.mjs'
import * as L2 from './or-C-lib2.mjs'
const { browser, page: p, errs } = await L.openWorld()
const DI = 5, ISO = '2026-07-18'
const j = o => JSON.stringify(o)
const duty = (await L.fileInput(p, { type: 'Duty', person: 'Ranger', from: ISO, to: ISO, timed: ['09:00', '12:00'], oil: 'yes' }))[0]
const iid = duty.iid, key = `i:${iid}`
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
await L.goEdit(p); await day().locator('.sec-grnd').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 150)); await p.waitForTimeout(300)
await L.drag(p, p.locator('#eRoster .rpuck[data-person="allavail"]:visible').first(), day().locator(`[data-fill="g:${DI}.0.+"] .addz`).first())
console.log('fixture:', j((await L.rec(p, iid)).people))
await L.oilOn(p, DI, true)
const chipNow = () => p.evaluate(k => { const c = document.querySelector(`#schedBoard [data-oilsent="${k}"]`); return c ? c.textContent.trim() + ' | ' + (c.getAttribute('title') || '').slice(0, 60) : '(no chip)' }, key)
await L.openCrowd(p, key); await L.crowdTab(p, /earns OIL/i)
const c0 = await L.crowd(p)
const off = c0.rows.filter(r => r.cs !== 'Ranger').slice(0, 2)
for (const o of off) await L.crowdToggle(p, o.id)
const c1 = await L.crowd(p)
console.log('two switched off:', j(off.map(o => o.cs)), '| tabs:', j(c1.tabs), '| their rows off?', j(c1.rows.filter(r => off.some(o => o.id === r.id)).map(r => r.cs + ':' + r.off)))
await L.crowdClose(p)
console.log('chip before delete:', await chipNow())
await L.oilOn(p, DI, false); await L.closeBoard(p)
const before = await L2.surfaces(p, { di: DI, iso: ISO, iid })
console.log('BEFORE delete surfaces:', j(before))

// delete in the window
await p.evaluate(() => window.go('inputs')); await p.locator('#inCalBtn').waitFor()
if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await p.locator('#inCalBtn').click()
await p.locator('#inpCal').waitFor()
for (let i = 0; i < 12; i++) { const [mm, y] = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); const at = +y * 12 + L.MONTHS.findIndex(x => x.startsWith(mm)); if (at === 2026 * 12 + 6) break; await p.locator(at < 2026 * 12 + 6 ? '#icNext' : '#icPrev').click() }
await p.locator(`[data-icday="${ISO}"]`).focus(); await p.keyboard.press('Enter'); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(300)
await p.locator(`.icard[data-popiid="${iid}"]`).first().click(); await p.waitForSelector('#inpEditPop'); await p.waitForTimeout(400)
let m = await L.toastMark(p)
await p.locator('#inpEditDel').click(); await p.waitForTimeout(500)
console.log('after pressing Delete: dialogs on screen:', await p.evaluate(() => [...document.querySelectorAll('[role=dialog], .confirm, [data-testid*=conf]')].filter(e => e.offsetParent).map(e => (e.getAttribute('data-testid') || e.className) + ': ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 160)).join(' || ')))
await L.shot(p, 'c9-1-delete-press')
// confirm if asked
const conf = p.locator('[data-testid="delconf-yes"], [data-testid="inpdel-yes"], button:visible').filter({ hasText: /^(Delete|Yes|Confirm|Delete it|Delete input)/ }).first()
if (await conf.count()) { console.log('confirming with button:', (await conf.textContent()).trim()); await conf.click(); await p.waitForTimeout(600) }
console.log('after delete: toast', await L.toastsSince(p, m), '| INPUTS has it?', await p.evaluate(id => !!window.INPUTS.find(x => x.iid === id), iid), '| Sat ground rows:', await p.evaluate(() => window.DAYS[5].ground.map(g => g.prog + (g.src ? '(input)' : '(own)'))))
const gone = await L2.surfaces(p, { di: DI, iso: ISO, iid })
console.log('AFTER delete surfaces:', j(gone))
await L.oilOn(p, DI, true)
console.log('OIL Earn after delete: items:', j(await L.oilAll(p)), '| chips:', await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilsent]')].filter(e => e.offsetParent).map(e => e.getAttribute('data-oilsent') + ' ' + e.textContent.trim())).then(j))
await L.shot(p, 'c9-2-oil-after-delete')
await L.oilOn(p, DI, false); await L.closeBoard(p)
// undo
await p.evaluate(() => window.go('editsched')); await p.locator('#eWeek .day').first().waitFor()
const u = await L.undoRedo(p, 'undo'); console.log('UNDO', u.used, '| toast', await L.toastNow(p), '| INPUTS has it?', await p.evaluate(id => !!window.INPUTS.find(x => x.iid === id), iid), '| people:', j((await L.rec(p, iid))?.people))
const back = await L2.surfaces(p, { di: DI, iso: ISO, iid })
console.log('AFTER undo surfaces:', j(back))
await L.oilOn(p, DI, true)
console.log('OIL Earn after undo: chip', await chipNow(), '| items', j(await L.oilAll(p)))
await L.openCrowd(p, key); await L.crowdTab(p, /earns OIL/i)
const c2 = await L.crowd(p)
console.log('crowd after undo: tabs', j(c2.tabs), '| the two men off?', j(c2.rows.filter(r => off.some(o => o.id === r.id)).map(r => r.cs + ':' + r.off)), '| all off:', j(c2.rows.filter(r => r.off).map(r => r.cs)))
await L.shot(p, 'c9-3-after-undo')
console.log('ERRORS', errs.join(' | ') || 'none')
await browser.close()
