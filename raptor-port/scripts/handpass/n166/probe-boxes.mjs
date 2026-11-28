// probe-boxes - exploration only: the text boxes drawn on a page (and on Admin → Users with a row opened)
import { mk, closeAll, signIn, go, wait } from './lib.mjs'
const SZ = process.argv[2] || 'd'
const boxes = s => s.page.evaluate(() => [...document.querySelectorAll('.page.on input, .page.on textarea, .page.on [contenteditable="true"], .page.on [contenteditable=""]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !['checkbox', 'radio', 'file', 'hidden', 'range'].includes(e.type) }).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className).slice(0, 30)} [${e.getAttribute('aria-label') || e.placeholder || e.dataset.testid || ''}] ${e.readOnly ? 'RO' : ''}${e.disabled ? 'DIS' : ''}`).slice(0, 25))
const s = await mk(SZ)
try {
  await signIn(s, 'ad', 'a')
  for (const p of ['editsched', 'logic', 'quals']) { await go(s, p); await wait(s, 900); console.log(p, JSON.stringify(await boxes(s), null, 0)) }
  await go(s, 'admin'); await wait(s, 600)
  const r = s.page.locator('[data-person="stiff"] .acc-tap, .acc-tap').first(); await r.click(); await wait(s, 800)
  console.log('admin-row', JSON.stringify(await boxes(s)))
  /* cells of Edit Schedule that become a box when pressed */
  await go(s, 'editsched'); await wait(s, 800)
  console.log('editsched clickables', JSON.stringify(await s.page.evaluate(() => [...new Set([...document.querySelectorAll('.page.on [data-edit], .page.on .rmk, .page.on .rmks, .page.on [data-rmk], .page.on .editable, .page.on td[data-f]')].map(e => e.className + '|' + (e.dataset.edit || e.dataset.f || '')))].slice(0, 20))))
} finally { await closeAll() }
