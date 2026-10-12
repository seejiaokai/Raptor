// B9 — the admin in the member view
import { launch, openWorld, fileInput, shot, rowIdx, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs,
  toWeek, centre, weekRowEl, weekRowNames, drag3, rosterPuckOf } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const toastNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.innerText + ' [op ' + t.style.opacity + ']' : '' })
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 4
const f = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-17', to: '2026-07-17', timed: ['14:00', '15:00'], title: 'Gear brief' })
const iid = f[0].iid
const snap = async () => { const x = await inputOf(p, iid); return { people: x.people, t: x.t, rmk: x.rmk, title: x.title, cx: x.cx } }
await toWeek(p)
const ri = await rowIdx(p, DI, iid)
say('admin: editable boxes on the row', await weekRowEl(p, DI, ri).locator('[contenteditable="true"]').count())
const before = await snap(); say('before', before)
/* switch to the member view */
await p.locator('#roleBadge').click(); await p.waitForTimeout(800)
say('badge', await p.locator('#roleBadge').innerText()); say('page', await p.evaluate(() => window.CURPAGE))
say('tabs', await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent && e.getBoundingClientRect().top < 50).map(e => e.textContent.trim()).filter(Boolean)))
/* Friday's Meeting row on View-only Sched */
const day = p.locator('#vWeek .day:not(.peek)').nth(DI)
await day.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await p.waitForTimeout(400)
const row = day.locator('.pl-row', { hasText: /GEAR BRIEF/i }).first()
say('row found', await row.count())
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await p.waitForTimeout(400)
say('row: editable boxes / cx buttons / puck draggable', await row.evaluate(e => ({ ce: e.querySelectorAll('[contenteditable="true"]').length, cx: e.querySelectorAll('[data-grcx]').length, drag: [...e.querySelectorAll('[data-drag]')].length, pucks: [...e.querySelectorAll('.puck .nm')].map(n => n.textContent) })))
await shot(p, 's09-1-member-view-row')
let m = await toastMark(p)
/* a typed box */
const tbox = row.locator('.t-s').first()
await tbox.click({ force: true }).catch(() => {}); await p.keyboard.type('10:00').catch(() => {}); await p.keyboard.press('Enter').catch(() => {}); await p.waitForTimeout(500)
say('typed: input after', await snap())
/* a right-click on a puck */
await row.locator('.puck').first().click({ button: 'right' }).catch(() => {}); await p.waitForTimeout(600)
say('right-click: input after', await snap()); say('toasts', await toastsSince(p, m))
/* a drag of a puck off the row */
const pk = row.locator('.puck').first()
await pk.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
const bb = await pk.boundingBox()
await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + 40, bb.y + 40, { steps: 4 }); await p.mouse.move(420, 30, { steps: 12 }); await p.waitForTimeout(200); await p.mouse.up(); await p.waitForTimeout(600)
say('drag-off: input after', await snap()); say('toast', await toastNow(p))
say('all unchanged after member-view hands', JSON.stringify(await snap()) === JSON.stringify(before))
await shot(p, 's09-2-after-member-hands')
/* try to reach the editor by navigation */
await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(700)
say('go(editsched) while member: page', await p.evaluate(() => window.CURPAGE)); say('edit week drawn', await p.locator('#eWeek .day:visible').count())
await shot(p, 's09-3-member-go-editsched')
/* switch back */
await p.locator('#roleBadge').click(); await p.waitForTimeout(800)
say('badge back', await p.locator('#roleBadge').innerText()); say('page back', await p.evaluate(() => window.CURPAGE))
await toWeek(p)
say('admin again: editable boxes', await weekRowEl(p, DI, ri).locator('[contenteditable="true"]').count())
/* a hand works again: type 10:00 over the start */
const st = weekRowEl(p, DI, ri).locator('[data-txt="gr:' + DI + '.' + ri + '.str"]').first()
await centre(st); await st.click(); await p.keyboard.press('Control+a'); await p.keyboard.type('10:00'); await p.keyboard.press('Enter'); await p.waitForTimeout(700)
say('admin typed start: input', await snap())
/* and a drag: Tally onto the row */
const rowE = weekRowEl(p, DI, ri); await centre(rowE)
const tally = await rosterPuckOf(p, '#eRoster', 'Tally')
await drag3(p, tally, rowE.locator('.puck').first())
say('admin drag Tally: input', await snap())
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B9 = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
