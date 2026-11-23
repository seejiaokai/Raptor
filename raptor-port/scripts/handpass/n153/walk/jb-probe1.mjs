// jb-probe1 - look at the Tracker's controls on one clean world before writing the walker's helpers (reads only, and one mark)
import { signIn, newPage, closeAll, finish, go, pic, picsFor, note, ask, press, state } from './jlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jb-probe1 v1', SZ)
picsFor('probe1-' + SZ)
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await go(s, 'tracker'); await page.waitForTimeout(2200)
  await pic(s, '01-tracker')
  const ids = await page.evaluate(() => [...document.querySelectorAll('#page-tracker [id]')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }).map(e => e.id + ':' + e.tagName.toLowerCase()).slice(0, 120))
  note('ids', ids.join(' '))
  const sel = id => page.evaluate(i => { const e = document.getElementById(i); return e && e.options ? [...e.options].map(o => o.value + '=' + o.text.trim()) : null }, id)
  note('course', JSON.stringify(await sel('courseSel')), 'syl', JSON.stringify(await sel('sylSel')), 'active', JSON.stringify(await sel('activeSel')))
  const nodes = await page.evaluate(() => {
    const out = []
    for (const e of document.querySelectorAll('#page-tracker svg g, #page-tracker [data-id], #page-tracker .node')) {
      const b = e.getBoundingClientRect(); if (b.width > 4 && b.width < 120 && out.length < 8) out.push(`${e.tagName}.${e.getAttribute('class') || ''} id=${e.getAttribute('data-id') || e.id || ''} ${Math.round(b.left)},${Math.round(b.top)},${Math.round(b.width)}x${Math.round(b.height)} "${(e.textContent || '').trim().slice(0, 16)}"`)
    }
    return out
  })
  note('nodes', JSON.stringify(nodes, null, 0))
  // the course menu
  const cm = page.locator('#courseMenuBtn').filter({ visible: true })
  note('courseMenuBtn', await cm.count())
  if (await cm.count()) { await press(s, cm.first(), 'cm'); await pic(s, '02-course-menu'); note('menu', await page.evaluate(() => [...document.querySelectorAll('#course button, #course [role=menuitem]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.id + ':' + e.textContent.trim()).join(' | '))); await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  const sm = page.locator('#sylMenuBtn').filter({ visible: true })
  if (await sm.count()) { await press(s, sm.first(), 'sm'); await pic(s, '03-syl-menu'); note('sylmenu', await page.evaluate(() => [...document.querySelectorAll('#syl button')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.id + ':' + e.textContent.trim()).join(' | '))); await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  const fm = page.locator('#fileMenuBtn').filter({ visible: true })
  if (await fm.count()) { await press(s, fm.first(), 'fm'); await pic(s, '04-file-menu'); note('filemenu', await page.evaluate(() => [...document.querySelectorAll('#file button')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.id + ':' + e.textContent.trim()).join(' | '))); await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  note('state', JSON.stringify(await state(s)))
  note('ask', JSON.stringify(await ask(s)))
  await s.ctx.close()
} finally { finish('probe1-' + SZ); await closeAll() }
