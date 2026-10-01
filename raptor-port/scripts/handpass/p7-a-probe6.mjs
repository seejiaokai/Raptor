/* [DB-READINESS] phase 7 — walker A, probe 6: the plans menu (+ Alt Plan), where a parked plan can be previewed, and
   the next-week peek columns. Fixtures through the app's own controls. */
import { boot, world, fileTimed } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const SUN = 6
const out = {}
const iid = await fileTimed(L, p, { person: 'bane', type: 'Personal', iso: '2026-07-19', from: '10:00', to: '11:00', remarks: 'P7A plan' })
await W.boardOn(p, SUN)
const ri = await A.rowIdx(p, SUN, iid)
out.put = (await A.place(S, p, SUN, ri, 'extras', 'allavail')).took
await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, SUN)
const menuDump = () => p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? [...m.querySelectorAll('.wm')].map(e => `[${[...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' ')}] ${e.innerText.replace(/\s+/g, ' ').trim()}`) : 'no menu' })
const openMenu = async () => { const pm = p.locator(`#eWeek [data-planmenu="${SUN}"]:visible`).first(); await pm.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await pm.click(); await L.sleep(400) }
await openMenu(); out.menu0 = await menuDump()
const dup = p.locator('.wavemenu .wm[data-plandup]:visible').first()
if (await dup.count()) { await dup.click(); await L.sleep(800) }
out.toasts = await W.toasts(p)
await L.shot(p, 'probe6-after-altplan')
await openMenu(); out.menu1 = await menuDump(); await L.shot(p, 'probe6-menu-after-altplan'); await p.mouse.click(5, 895); await L.sleep(300)
out.head = await W.head(p, SUN)
out.row = await A.rowOf(p, SUN, iid)
out.chips = await A.chips(p, `#eWeek .day[data-day="${SUN}"]`, null)
await L.go(p, 'viewsched')
out.viewPicker = await p.evaluate(d => { const s = document.querySelector(`#vWeek select[data-dver="${d}"], #vWeek select[data-vwork="${d}"]`); return s ? { attr: [...s.attributes].map(a => a.name + '=' + a.value).join(' '), opts: [...s.options].map(o => `${o.value}=${o.text}${o.selected ? '*' : ''}`) } : 'no picker' }, SUN)
out.viewChips = await A.chips(p, `#vWeek .day[data-day="${SUN}"]`, null)
/* the peek */
await W.toEdit(L, p)
out.peek = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day.peek, #vWeek .day.peek')].map(e => ({ in: e.closest('#eWeek') ? 'edit' : 'view', day: e.dataset.day, cls: e.className, head: (e.querySelector('.dhead, .dh, header') || e).innerText.replace(/\s+/g, ' ').slice(0, 80), vis: e.offsetParent !== null })))
out.wkBtns = await p.evaluate(() => [...document.querySelectorAll('[data-wk]')].map(e => ({ wk: e.dataset.wk, txt: e.innerText.trim(), vis: e.offsetParent !== null })))
out.days = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day')].map(e => `${e.dataset.day}:${e.className}`))
out.errors = errors
console.log(JSON.stringify(out, null, 1))
await browser.close()
