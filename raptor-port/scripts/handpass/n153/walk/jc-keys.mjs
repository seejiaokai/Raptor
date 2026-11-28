// jc-keys - S46 (the top bar's squadron list opens on the ticked row, by every opening key; moving alone picks nothing) and S47 (Tab out, both ways; a browser tab switch).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, admCat, state } from './jlib.mjs'
import { makeThird } from './jc-third.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-keys v1', SZ)
picsFor('jc-keys-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const read = s => s.page.evaluate(() => {
  const m = document.querySelector('#sqnMenu'); const a = document.activeElement
  const open = !!m && m.getBoundingClientRect().height > 0
  const row = a && a.closest ? a.closest('.sqm-row') : null
  return { open, focus: row ? row.querySelector('.sqm-num')?.textContent.trim() : (a ? `${a.tagName}${a.id ? '#' + a.id : ''}` : null), ticked: open ? [...m.querySelectorAll('.sqm-row')].filter(r => r.getAttribute('aria-checked') === 'true').map(r => r.querySelector('.sqm-num').textContent.trim()) : null, bar: document.querySelector('#sqnMenuBtn')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 12), expanded: document.querySelector('#sqnMenuBtn')?.getAttribute('aria-expanded') }
})
const key = async (s, k) => { await s.page.keyboard.press(k); await s.page.waitForTimeout(170) }
async function toBtn(s) {
  /* the key route: Tab from the top of the page until the squadron button holds the focus */
  await s.page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); const f = document.querySelector('#burger'); if (f && f.getBoundingClientRect().width > 0) f.focus(); else document.querySelector('.topbar a, .topbar button')?.focus() })
  if (await s.page.evaluate(() => document.activeElement?.id === 'sqnMenuBtn')) return 1
  for (let i = 0; i < 6; i++) { await key(s, 'Tab'); if (await s.page.evaluate(() => document.activeElement?.id === 'sqnMenuBtn')) return i + 1 }
  /* the top bar's first stop may lie after the button: step back */
  for (let i = 0; i < 6; i++) { await key(s, 'Shift+Tab'); if (await s.page.evaluate(() => document.activeElement?.id === 'sqnMenuBtn')) return 100 + i }
  return 0
}
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('setup: three squadrons, 149 picked', async () => {
    await makeThird(s); await page.waitForTimeout(250)
    await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click(); await page.waitForTimeout(240)
    await page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: /^149$/ }) }).first().click(); await page.waitForTimeout(500)
    const r = await read(s); check('S46 149 in view', /149/.test(r.bar || ''), r.bar)
  })
  for (const k of ['Enter', 'Space', 'ArrowDown', 'ArrowUp']) {
    await step(`S46 open by ${k}`, async () => {
      const n = await toBtn(s); check(`S46 Tab reaches the button (${k})`, n > 0, n)
      await key(s, k); await page.waitForTimeout(150)
      const r = await read(s); rec(`S46 opened by ${k}`, r); if (k === 'Enter') await pic(s, 's46-1-open-enter')
      check(`S46 ${k} opens the list`, r.open, r.open); check(`S46 ${k} focus on the ticked row`, r.focus === '149', r.focus)
      await key(s, 'Escape'); const c = await read(s); check(`S46 ${k} Escape closes`, !c.open, c.open); check(`S46 ${k} Escape returns focus to the button`, c.focus === 'BUTTON#sqnMenuBtn', c.focus); check(`S46 ${k} squadron unchanged`, /149/.test(c.bar || ''), c.bar)
    })
  }
  await step('S46 arrows, Home and End move and pick nothing', async () => {
    await toBtn(s); await key(s, 'Enter'); const seq = []
    for (const k of ['ArrowDown', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowDown', 'Home', 'ArrowUp']) { await key(s, k); const r = await read(s); seq.push(`${k}→${r.focus}`) }
    rec('S46 movement', seq); await pic(s, 's46-2-moved')
    const r = await read(s); check('S46 still open after moving', r.open, r.open); check('S46 movement picked nothing', /149/.test(r.bar || '') && (r.ticked || []).join() === '149', { bar: r.bar, ticked: r.ticked })
    check('S46 Home goes first', seq[3].endsWith('142'), seq[3]); check('S46 End goes last', seq[4].endsWith('150'), seq[4])
    await key(s, 'Escape'); const c = await read(s); check('S46 Escape after moving keeps 149', !c.open && /149/.test(c.bar || ''), c.bar)
  })
  await step('S46 Enter picks the focused row', async () => {
    await toBtn(s); await key(s, 'Enter'); await key(s, 'Home'); const f = (await read(s)).focus
    await key(s, 'Enter'); await page.waitForTimeout(500); const r = await read(s); rec('S46 Enter on row', { f, r })
    check('S46 Enter picks 142', f === '142' && /142/.test(r.bar || ''), r.bar); check('S46 list closed after pick', !r.open, r.open); rec('S46 focus after a pick', r.focus)
  })
  await step('S46 Space picks the focused row', async () => {
    await toBtn(s); await key(s, 'Enter'); const on = (await read(s)).focus; check('S46 opens on the new tick', on === '142', on)
    await key(s, 'ArrowDown'); await key(s, 'Space'); await page.waitForTimeout(500); const r = await read(s)
    check('S46 Space picks 149', /149/.test(r.bar || ''), r.bar); check('S46 Space closes', !r.open, r.open)
  })
  await step('S47 Tab and Shift+Tab', async () => {
    await toBtn(s); await key(s, 'Enter'); await key(s, 'End'); const at = (await read(s)).focus
    await key(s, 'Tab'); await page.waitForTimeout(150); const a = await read(s); rec('S47 Tab from the last row', { at, a }); await pic(s, 's47-1-tab-out')
    check('S47 Tab out of the bottom closes', !a.open, a.open); check('S47 focus is not lost to the body', a.focus !== 'BODY', a.focus); check('S47 no pick', /149/.test(a.bar || ''), a.bar)
    await toBtn(s); await key(s, 'Enter'); await key(s, 'Home'); await key(s, 'Shift+Tab'); await page.waitForTimeout(150); const b = await read(s); rec('S47 Shift+Tab from the first row', b)
    /* the button and its list are one control: Shift+Tab from the first row lands on the button; the step-by-step walk below goes on past it */
    if (b.open) { await key(s, 'Escape'); check('S47 Escape on the button closes it', !(await read(s)).open, 'shut') }
    await toBtn(s); await key(s, 'Enter'); await key(s, 'Tab'); const c = await read(s); rec('S47 Tab from the middle row', c)
    if (c.open) { await key(s, 'Escape') }
    await toBtn(s); await key(s, 'Enter'); await key(s, 'Shift+Tab'); const d = await read(s); rec('S47 Shift+Tab from the middle row', d); if (d.open) await key(s, 'Escape')
    await page.evaluate(() => document.activeElement?.blur?.()); await toBtn(s); await key(s, 'Shift+Tab'); const e = await read(s); rec('S47 Shift+Tab off the button, list shut', e)
    check('S47 list stays shut going backwards', !e.open, e.open)
  })
  await step('S47 Shift+Tab step by step, from the ticked row out past the first stop', async () => {
    for (const startAt of ['middle', 'first']) {
      await toBtn(s); await key(s, 'Enter'); if (startAt === 'first') await key(s, 'Home')
      const seq = [(await read(s)).focus]
      for (let i = 0; i < 5; i++) { await key(s, 'Shift+Tab'); const r = await read(s); seq.push(`${r.focus}${r.open ? ' [open]' : ' [shut]'}`); if (!r.open) break }
      rec(`S47 backwards from the ${startAt} row`, seq)
      /* the page's own first stop: going back past it, the browser's own toolbar takes the focus and the page reads "BODY" */
      const end = await read(s); check(`S47 backwards from the ${startAt} row ends with the list shut`, !end.open, end)
      if (end.open) await key(s, 'Escape')
    }
  })
  await step('S47 browser tab switch', async () => {
    await toBtn(s); await key(s, 'Enter'); const o = await read(s); check('S47 list open', o.open, o.open)
    const other = await s.ctx.newPage(); await other.goto('about:blank'); await other.bringToFront(); await other.waitForTimeout(250); await other.close(); await page.bringToFront(); await page.waitForTimeout(200)
    const a = await read(s); rec('S47 after another browser tab was shown and closed', a)
    check('S47 the list is still open', a.open, a.open)
    await page.evaluate(() => window.dispatchEvent(new Event('blur', {}))); await page.waitForTimeout(150); const b = await read(s); rec('S47 after a window blur event', b)
    if (b.open) await key(s, 'Escape')
    note('a real switch of application focus is not walked here: the driven browser keeps the page focused')
  })
  await step('S46 the mouse still works after keys', async () => {
    await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click(); await page.waitForTimeout(240)
    const r = await read(s); check('S46 pointer opens', r.open, r.open); await page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: /^142$/ }) }).first().click(); await page.waitForTimeout(450)
    const c = await read(s); check('S46 pointer picks 142', /142/.test(c.bar || ''), c.bar); await pic(s, 's46-3-after')
  })
  await s.ctx.close()
} finally { finish('jc-keys-' + SZ); await closeAll() }
