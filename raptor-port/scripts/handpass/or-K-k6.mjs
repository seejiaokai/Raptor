// K6 - two tabs, one browser (RECORDED). Two pages in ONE context, both Saber, Meeting of three on screen in both.
import * as K from './or-K-lib.mjs'
const { fileInput, goWeek, shot, shotEl, readRows, inputsOf, reload, saveRes, errs, toast, toastMark, toastsSince } = K
const out = {}
const { ctx, page: p1 } = await K.openWorld({ fresh: false })
await K.hideToast(p1)
const filed = await fileInput(p1, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: K.ISO, to: K.ISO, timed: ['14:00', '15:00'], title: K.TITLE })
const iid = filed[0].iid
console.log('filed', JSON.stringify(filed))
await goWeek(p1); await K.openFold(p1, 'week')
// page 2: second tab in the same context
const p2 = await ctx.newPage()
await K.wire(p2, 'page2')
await p2.clock.setFixedTime(new Date('2026-06-22T09:00:00'))
await p2.goto(K.BASE)
await p2.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await p2.waitForSelector('#luser', { state: 'attached', timeout: 8000 }).catch(() => {})
if (await p2.locator('#loginForm').isVisible().catch(() => false)) { await p2.fill('#luser', 'ad'); await p2.fill('#lpass', 'a'); await p2.click('#loginForm button[type=submit]') }
await p2.waitForSelector('#vWeek .day', { state: 'attached' }); await p2.waitForTimeout(700)
await goWeek(p2); await K.openFold(p2, 'week')
const r1 = await readRows(p1), r2 = await readRows(p2)
console.log('page1 row', JSON.stringify(r1.weekGround), '\npage2 row', JSON.stringify(r2.weekGround))
out.before = { p1: r1.weekGround, p2: r2.weekGround, inputs1: await inputsOf(p1), inputs2: await inputsOf(p2) }
await p1.bringToFront(); await K.scrollToSec(p1, 'ground'); await K.hideToast(p1)
await shotEl(p1.locator('#eWeek .day:not(.peek) [data-secmove="2.ground"]').first(), 'k6-1-page1-before')
await p2.bringToFront(); await K.scrollToSec(p2, 'ground'); await K.hideToast(p2)
await shotEl(p2.locator('#eWeek .day:not(.peek) [data-secmove="2.ground"]').first(), 'k6-2-page2-before')
// page 1: type 10:00 on the row's start box
await p1.bringToFront()
const ri = await p1.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [K.DI, iid])
const box = p1.locator(`#eWeek [data-txt="gr:${K.DI}.${ri}.str"]`).first()
await box.scrollIntoViewIfNeeded(); await box.click(); await p1.waitForTimeout(150)
await p1.keyboard.press('Control+A'); await p1.keyboard.type('10:00'); await p1.keyboard.press('Tab'); await p1.waitForTimeout(900)
out.p1AfterTime = { rows: (await readRows(p1)).weekGround, inputs: await inputsOf(p1), toast: await toast(p1) }
console.log('PAGE1 after 10:00', JSON.stringify(out.p1AfterTime))
await K.hideToast(p1)
await shotEl(p1.locator('#eWeek .day:not(.peek) [data-secmove="2.ground"]').first(), 'k6-3-page1-after-1000')
// page 2 (not reloaded): what does it show now, then open the window and save a remark
await p2.bringToFront(); await p2.waitForTimeout(500)
out.p2Now = { rows: (await readRows(p2)).weekGround, inputs: await inputsOf(p2) }
console.log('PAGE2 now (not reloaded)', JSON.stringify(out.p2Now))
await K.openFold(p2, 'week')
const line = p2.locator('#eWeek .day:not(.peek) .sec-inp .pl-row').filter({ hasText: /Range brief/i }).first()
await line.scrollIntoViewIfNeeded()
const opener = line.locator('.inpedit').first()
await opener.click(); await p2.waitForTimeout(700)
const win = p2.locator(K.WIN + ', [data-testid="win-inputedit"]')
console.log('window count', await win.count())
out.p2Window = await p2.evaluate(() => ({ start: document.querySelector('#inpEditStart')?.value, end: document.querySelector('#inpEditEnd')?.value, rmk: document.querySelector('#inpEditRmk')?.value, title: (document.querySelector('#inpEditPop .win-ttl, #inpEditPop h2, #inpEditPop [class*=title]') || {}).innerText }))
console.log('PAGE2 window', JSON.stringify(out.p2Window))
await shot(p2, 'k6-4-page2-window-open')
const mk = await toastMark(p2)
await p2.fill('#inpEditRmk', 'Bring maps')
await p2.locator('#inpEditSave').click(); await p2.waitForTimeout(900)
// any question left standing?
const extra = await p2.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"], [data-testid="docconf"], .win, [role=dialog]')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 200)))
out.p2Said = { toast: await toastsSince(p2, mk), now: await toast(p2), standing: extra }
console.log('PAGE2 said', JSON.stringify(out.p2Said))
await shot(p2, 'k6-5-page2-after-save')
out.p2AfterSave = { rows: (await readRows(p2)).weekGround, inputs: await inputsOf(p2) }
console.log('PAGE2 after save', JSON.stringify(out.p2AfterSave))
// page 1 not reloaded
await p1.bringToFront(); await p1.waitForTimeout(500)
out.p1BeforeReload = { rows: (await readRows(p1)).weekGround, inputs: await inputsOf(p1) }
console.log('PAGE1 not reloaded', JSON.stringify(out.p1BeforeReload))
// page 1 after a reload
await reload(p1); await goWeek(p1); await K.openFold(p1, 'week')
out.p1AfterReload = { rows: (await readRows(p1)).weekGround, line: (await readRows(p1)).weekInputs, inputs: await inputsOf(p1) }
console.log('PAGE1 after reload', JSON.stringify(out.p1AfterReload))
await K.scrollToSec(p1, 'ground'); await K.hideToast(p1)
await shotEl(p1.locator('#eWeek .day:not(.peek) [data-secmove="2.ground"]').first(), 'k6-6-page1-after-reload')
await reload(p2); await goWeek(p2); await K.openFold(p2, 'week')
out.p2AfterReload = { rows: (await readRows(p2)).weekGround, inputs: await inputsOf(p2) }
console.log('PAGE2 after reload', JSON.stringify(out.p2AfterReload))
out.errs = errs.slice(); saveRes('k6', out); console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
