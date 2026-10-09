// P3-01 — Escape closes the FRONT window, not an editor behind it. SZ=desk|phone, Saber, Inputs page, July 2026
import { world, toInputs, tid, press, pic, sleep, closeAll, judge, rec, recErrors, big, active, openWins } from './cal-C-lib.mjs'
const SIZE = process.env.SZ || 'desk'
const { page, errors } = await world(SIZE)
const P = n => `${SIZE}-${n}`
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
await toInputs(page)
const mon = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
for (let d = 2026 * 12 + 6 - await mon(); d !== 0; d += d > 0 ? -1 : 1) await press(SIZE, page.locator(d > 0 ? '#icNext' : '#icPrev'))
await sleep(300)
const state = async () => ({ wins: await openWins(page), active: await active(page), remark: await page.locator('#inpEditRmk').inputValue().catch(() => null), front: await page.evaluate(() => { const f = document.querySelector('.floatwin.front'); return f ? f.getAttribute('data-testid') : null }) })
async function openEditor() {
  await press(SIZE, page.locator('[data-icday="2026-07-15"]'), { position: { x: 8, y: 8 } }); await sleep(500)
  await press(SIZE, page.locator('#icPopAdd')); await sleep(600)
  await page.locator('#inpEditRmk').click(); await page.locator('#inpEditRmk').fill('my unsaved remark'); await sleep(200)
}
async function openSettings() { if ((await openWins(page)).includes('win-inputsset')) return; await press(SIZE, tid(page, 'in-gear')); await tid(page, 'win-inputsset').waitFor(); await sleep(400) }
async function clean() { for (const id of ['win-inputsset', 'win-inputedit', 'win-inputsday']) { if (await tid(page, id).count()) { await tid(page, id + '-x').click().catch(() => {}); await sleep(200) } } }
async function stack() { await clean(); await openEditor(); await openSettings() }
const rows = []
/* ---- V1: settings opened over the editor; focus is where the window put it (the window); Escape ---- */
await openEditor()
await pic(page, P('p301-1-editor-typed'))
await openSettings()
const v1pre = await state()
await pic(page, P('p301-2-settings-over-editor'))
await page.keyboard.press('Escape'); await sleep(400)
const v1post = await state(); console.log('V1', JSON.stringify({ pre: v1pre, post: v1post }))
await pic(page, P('p301-3-after-escape-v1'))
rows.push(['V1 settings in front, focus on the window itself (not a text box): Escape closes settings; editor and its remark stay', !v1post.wins.includes('win-inputsset') && v1post.wins.includes('win-inputedit') && v1post.remark === 'my unsaved remark', { pre: v1pre, post: v1post }])
await stack()
/* ---- V2: settings reopened; focus a BUTTON inside it (Cancel); Escape ---- */
await openSettings()
await tid(page, 'iset-cancel').focus()
const v2pre = await state()
await page.keyboard.press('Escape'); await sleep(400)
const v2post = await state(); console.log('V2', JSON.stringify({ pre: v2pre, post: v2post }))
rows.push(['V2 focus on a button in settings (Cancel): Escape closes settings; editor and remark stay', !v2post.wins.includes('win-inputsset') && v2post.wins.includes('win-inputedit') && v2post.remark === 'my unsaved remark', { pre: v2pre, post: v2post }])
await stack()
/* ---- V3: settings reopened, then the title bar of settings pressed (focus lands on the window/title), Escape ---- */
await openSettings()
const bar = await page.locator('[data-testid="win-inputsset"] .win-bar').boundingBox()
await page.mouse.click(bar.x + 60, bar.y + 14); await sleep(200)
const v3pre = await state()
await page.keyboard.press('Escape'); await sleep(400)
const v3post = await state(); console.log('V3', JSON.stringify({ pre: v3pre, post: v3post }))
rows.push(['V3 press the front window\'s title, then Escape: settings closes; editor stays', !v3post.wins.includes('win-inputsset') && v3post.wins.includes('win-inputedit') && v3post.remark === 'my unsaved remark', { pre: v3pre, post: v3post }])
await stack()
/* ---- V4 (extra, a text box behind): focus the remark box in the editor while settings is in front ---- */
await openSettings()
await page.locator('#inpEditRmk').focus(); await sleep(200)
const v4pre = await state()
await page.keyboard.press('Escape'); await sleep(400)
const v4post = await state()
await pic(page, P('p301-4-escape-in-textbox-behind'))
const v4 = { pre: v4pre, post: v4post }
/* ---- V5: reversed stacking — settings opened, then the EDITOR brought to the front by pressing its title; focus on the editor's title; Escape ---- */
await stack()
const ebar = await page.locator('[data-testid="win-inputedit"] .win-bar').boundingBox()
await page.mouse.click(ebar.x + 8, ebar.y + 40); await sleep(300)
const v5pre = await state()
await pic(page, P('p301-5-editor-in-front'))
await page.keyboard.press('Escape'); await sleep(400)
const v5post = await state()
await pic(page, P('p301-6-after-escape-v5'))
rows.push(['V5 reversed: editor brought in front (its visible edge pressed), settings behind: Escape closes the EDITOR, settings stays', v5pre.front === 'win-inputedit' && !v5post.wins.includes('win-inputedit') && v5post.wins.includes('win-inputsset'), { pre: v5pre, post: v5post }])
const okMain = rows.every(r => r[1])
judge('P3-01-' + SIZE, `Inputs page July 2026 at ${SIZE}: day -> + Input -> editor, typed an unsaved remark; gear -> Inputs settings in front; Escape with focus on (V1) the window, (V2) a button, (V3) the title; reversed stacking (V5). Text-box case V4 recorded: ${JSON.stringify(v4).slice(0, 700)}`, rows, [P('p301-2-settings-over-editor') + '.png', P('p301-3-after-escape-v1') + '.png', P('p301-4-escape-in-textbox-behind') + '.png', P('p301-5-editor-in-front') + '.png', P('p301-6-after-escape-v5') + '.png'])
console.log('V4', JSON.stringify(v4))
recErrors(P('script6'), errors)
await closeAll()
