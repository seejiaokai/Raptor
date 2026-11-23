// jb-s48b v1 - S48 by hand-sized steps on a phone: after a clean pick inside the menu, does a tap on the squadron mark fold the list?
// Each tap a real finger on the mark's own box, its state read after it; then a close by Escape and by a press outside.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, shut, press, state, openMenu, check } from './jlib.mjs'
import { wait } from './jb-lib.mjs'
const SZ = process.env.SZ || 'p'
console.log('jb-s48b v1', SZ)
const tag = `s48b-${SZ}`
picsFor(tag)
const read = async s => { const st = await state(s); const el = await s.page.evaluate(() => { const b = document.querySelector('#drawerSqnBtn'); if (!b) return null; const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { box: [r.left, r.top, r.width, r.height].map(Math.round), top: t ? `${t.tagName}.${String(t.className).slice(0, 20)}#${t.id}` : null, expanded: b.getAttribute('aria-expanded') } }); return { open: st.drawerOpen, list: st.dList, expanded: st.dBtnExpanded, btn: el } }
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await openMenu(s, 'o1'); note('menu open', JSON.stringify(await read(s)))
  await press(s, '#drawerSqnBtn', 't1'); await wait(s, 300); note('tap 1 on the mark (opens)', JSON.stringify(await read(s))); await pic(s, '01-open')
  await press(s, '#drawerSqnBtn', 't2'); await wait(s, 300); const shutBefore = await read(s); note('tap 2 on the mark, before any pick', JSON.stringify(shutBefore)); await pic(s, '02-folded')
  check('before a pick the mark folds its list', !shutBefore.list, shutBefore.list)
  if (!(await page.locator('#drawerSqnList').count())) await press(s, '#drawerSqnBtn', 't3')
  await wait(s, 200)
  const row = page.locator('#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: /^149$/ }) }).first()
  await press(s, row, 'pick'); await wait(s, 700); note('after a clean pick of 149', JSON.stringify(await read(s))); await pic(s, '03-picked')
  await press(s, '#drawerSqnBtn', 't4'); await wait(s, 500); const one = await read(s); note('tap on the mark after the pick', JSON.stringify(one)); await pic(s, '04-after-tap')
  if (one.list) { await wait(s, 900); await press(s, '#drawerSqnBtn', 't5'); await wait(s, 500); const two = await read(s); note('a second tap, a second later', JSON.stringify(two)); await pic(s, '05-after-second') }
  const end = await read(s); check('after a pick the mark folds its list', !end.list, end.list)
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
