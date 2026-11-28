// jb-s53b v1 - the desktop's Calendar window open at a pick, by small steps: the bar's list opened, what stands over its rows, a real
// press on the 149 row, then the windows left. Saber.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, shut, press, state, go, check } from './jlib.mjs'
import { wait } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jb-s53b v1', SZ)
const tag = `s53b-${SZ}`
picsFor(tag)
const wins = s => s.page.evaluate(() => [...document.querySelectorAll('.floatwin')].filter(e => e.getBoundingClientRect().width > 40).map(e => { const r = e.getBoundingClientRect(); return `${e.dataset.testid}@${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)} z${getComputedStyle(e).zIndex}` }))
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await go(s, 'inputs'); await wait(s, 900)
  await press(s, '#inGear'); await wait(s, 300); await press(s, '[data-testid="iset-days"]'); await wait(s, 600)
  note('windows', JSON.stringify(await wins(s))); await pic(s, '01-calendar-open')
  await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click({ timeout: 2500 }); await wait(s, 350); await pic(s, '02-list-open')
  const r = await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(e => { const b = e.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); const m = getComputedStyle(document.querySelector('#sqnMenu')); return { row: e.textContent.replace(/\s+/g, ' ').trim(), box: [b.left, b.top, b.width, b.height].map(Math.round), over: t ? (e.contains(t) ? 'self' : `${t.tagName}.${String(t.className).slice(0, 26)} in ${t.closest('.floatwin')?.dataset?.testid || ''}`) : null, listZ: m.zIndex } }))
  note('rows', JSON.stringify(r))
  const row = page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: /^149$/ }) }).first()
  const b = await row.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 900)
  const st = await state(s); note('after a real press at the row: bar', st.barMark, 'windows', JSON.stringify(await wins(s))); await pic(s, '03-after-press')
  check('the pick lands with the Calendar open', (st.barMark || '').startsWith('149'), st.barMark)
  check('the settings windows closed at the pick', (await wins(s)).length === 0, await wins(s))
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
