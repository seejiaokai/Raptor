// extra for P3-08 (a dragged window keeps its place across a repaint of the page behind) and P3-10 (SANS Highlight menu with a window up)
import { world, toLeaveWar, toInputs, tid, press, pic, sleep, closeAll, judge, rec, recErrors, openWins, active } from './cal-C-lib.mjs'
const SIZE = 'desk'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const rect = async (page, id) => { const b = await tid(page, id).boundingBox(); return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null }
const dragBar = async (page, id, dx, dy) => { const bar = await page.locator(`[data-testid="${id}"] .win-bar`).boundingBox(); const sx = bar.x + 60, sy = bar.y + bar.height / 2; await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx + dx / 2, sy + dy / 2, { steps: 6 }); await page.mouse.move(sx + dx, sy + dy, { steps: 6 }); await page.mouse.up(); await sleep(300) }
const rows = []
/* ---- repaint: the window dragged, then the page behind changes (month arrow), then the same page typed into ---- */
let w = await world(SIZE); let p = w.page; await toInputs(p)
const monthOf = async () => { const t = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase(); const [m, y] = t.split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
for (let d = 2026 * 12 + 6 - await monthOf(); d !== 0; d += d > 0 ? -1 : 1) await press(SIZE, p.locator(d > 0 ? '#icNext' : '#icPrev'))
await press(SIZE, p.locator('[data-icday="2026-07-15"]'), { position: { x: 8, y: 8 } }); await tid(p, 'win-inputsday').waitFor(); await sleep(300)
await dragBar(p, 'win-inputsday', -300, 120)
const r1 = await rect(p, 'win-inputsday')
await press(SIZE, p.locator('#icNext')); await sleep(400); await press(SIZE, p.locator('#icPrev')); await sleep(400)
await p.locator('#inFSearch').fill('x').catch(() => {}); await sleep(300); await p.locator('#inFSearch').fill('').catch(() => {}); await sleep(300)
const r2 = await rect(p, 'win-inputsday')
await pic(p, 'desk-extra-inputsday-after-repaint')
rows.push(['Inputs day: dragged by (-300,+120), then the month arrows and the filter box pressed: window kept its place', r1 && r2 && r1.x === r2.x && r1.y === r2.y, { r1, r2 }])
await press(SIZE, tid(p, 'in-gear')); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
await dragBar(p, 'win-inputsset', -200, 200)
const s1 = await rect(p, 'win-inputsset')
await press(SIZE, p.locator('#icNext')); await sleep(400)
const s2 = await rect(p, 'win-inputsset')
rows.push(['Inputs settings: dragged, then the page behind repainted: kept its place', s1 && s2 && s1.x === s2.x && s1.y === s2.y, { s1, s2 }])
/* Save acts once: change the switch? press Save, the window closes, one Undo step */
const undoBefore = await p.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? b.disabled : null })
await p.locator('[data-testid="iset-memberfile"]').click(); await sleep(150)
await press(SIZE, tid(p, 'iset-save')); await sleep(500)
const closed = (await tid(p, 'win-inputsset').count()) === 0
await press(SIZE, p.locator('#undoBtn')); await sleep(400)
await press(SIZE, tid(p, 'in-gear')); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
const memberAfterUndo = await tid(p, 'iset-memberfile').isChecked().catch(() => null)
await pic(p, 'desk-extra-inputs-settings-save')
rows.push(['Inputs settings: Save closes the window; one Undo takes the switch back (acted once)', closed && memberAfterUndo === true, { closed, memberAfterUndo, undoWasDisabledBefore: undoBefore }])
await w.ctx.close()

/* ---- SANS highlight menu with the SANS day window up ---- */
w = await world(SIZE); p = w.page; await toInputs(p); await press(SIZE, p.locator('#inSansMode')); await tid(p, 'sanscal').waitFor()
const smon = async () => { const t = (await tid(p, 'sc-month').textContent()).trim().toLowerCase(); const [m, y] = t.split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
for (let d = 2026 * 12 + 6 - await smon(); d !== 0; d += d > 0 ? -1 : 1) await press(SIZE, tid(p, d > 0 ? 'sc-next' : 'sc-prev'))
await press(SIZE, tid(p, 'sc-day-2026-07-15')); await tid(p, 'win-sansday').waitFor(); await sleep(300)
await press(SIZE, tid(p, 'sc-hl')); await sleep(400)
const menuOpen = await tid(p, 'sc-hl-menu').count()
await pic(p, 'desk-extra-sans-highlight-open')
await p.mouse.click(300, 190); await sleep(400)     // the page behind, a quiet spot
const afterOut = { menu: await tid(p, 'sc-hl-menu').count(), wins: await openWins(p) }
await press(SIZE, tid(p, 'sc-hl')); await sleep(400)
await p.keyboard.press('Escape'); await sleep(400)
const afterEsc = { menu: await tid(p, 'sc-hl-menu').count(), wins: await openWins(p) }
rows.push(['SANS Highlight menu opens beside an open SANS day', menuOpen === 1, { menuOpen }])
rows.push(['outside press closes the menu and the SANS day stays', afterOut.menu === 0 && afterOut.wins.includes('win-sansday'), afterOut])
rows.push(['Escape with the menu open closes the menu and the SANS day stays', afterEsc.menu === 0 && afterEsc.wins.includes('win-sansday'), afterEsc])
await w.ctx.close()
judge('P3-08x', 'extra: a dragged window across a repaint, Save acting once (Inputs settings), and the SANS Highlight menu with a window up (outside press, Escape)', rows, ['desk-extra-inputsday-after-repaint.png', 'desk-extra-inputs-settings-save.png', 'desk-extra-sans-highlight-open.png'])
await closeAll()
