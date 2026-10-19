/* host probe — [KEYBOARD-SCROLL] his seventh report (19 Oct 26 16:49): "after I tapped a place and scroll to tap another
   text box, the screen jumps abit for every tap and I couldn't select the new text box. I have to tap again". On the
   board at a phone's size, the stand-in keys opening and closing with the focus as an iPhone's do: type in one box, scroll
   the board a little, tap another box lower down — is the new box the one with the caret, and did anything jump? */
import { open, version, KB } from './kbs-A-lib.mjs'
version('host-hop-1')
const { browser, page, errors } = await open({ width: 402, height: 874 })
await page.evaluate(kb => {
  const typing = e => e && (e.isContentEditable || (e.tagName === 'INPUT' && !/^(checkbox|radio|button|submit|range|color|file)$/i.test(e.type)) || e.tagName === 'TEXTAREA')
  const set = up => { const v = window.__vv; const h = up ? innerHeight - kb : innerHeight; if (v.height === h) return; setTimeout(() => { v.height = h; v.dispatchEvent(new Event('resize')) }, 120) }
  document.addEventListener('focusin', e => set(typing(e.target)), true)
  document.addEventListener('focusout', () => setTimeout(() => set(typing(document.activeElement)), 0), true)
  window.__ev = []
  for (const t of ['touchend', 'click', 'focusin', 'focusout']) document.addEventListener(t, e => window.__ev.push(t + ':' + (e.target.getAttribute?.('data-bfld') || e.target.getAttribute?.('data-txt') || e.target.tagName)), true)
}, KB)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
const tapAt = async loc => { const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(8, b.height / 2)) }
const key = e => e?.getAttribute?.('data-bfld') || e?.getAttribute?.('data-txt') || e?.tagName
const who = () => page.evaluate(() => { const a = document.activeElement; return a?.getAttribute?.('data-bfld') || a?.getAttribute?.('data-txt') || a?.tagName })
const sel = k => `#schedBoard [data-txt="${k}"], #schedBoard [data-bfld="${k}"]`
const keyA = process.env.A || 'ap:0.1.rmks', keyB = process.env.B || 'ap:0.6.rmks'
const A = page.locator(sel(keyA)).first()
await A.scrollIntoViewIfNeeded(); await tapAt(A); await page.waitForTimeout(700)
console.log('after tap A:', await who(), 'want', keyA)
await page.keyboard.type('ZZ'); await page.waitForTimeout(300)
/* he scrolls the board to the next box, as a finger does */
await page.evaluate(k => { const b = document.querySelector(`#schedBoard [data-txt="${k}"], #schedBoard [data-bfld="${k}"]`); let s = b.parentElement; while (s && !(/(auto|scroll)/.test(getComputedStyle(s).overflowY) && s.scrollHeight > s.clientHeight + 1)) s = s.parentElement; s.scrollTop += b.getBoundingClientRect().top - 300 }, keyB)
await page.waitForTimeout(400); page.evaluate(() => { window.__ev = [] })
const Bnow = page.locator(sel(keyB)).first()
const before = await Bnow.evaluate(e => Math.round(e.getBoundingClientRect().top))
await tapAt(Bnow); await page.waitForTimeout(900)
console.log('after tap B:', await who(), 'want', keyB, '| B top before', before, 'after', await page.locator(sel(keyB)).first().evaluate(e => Math.round(e.getBoundingClientRect().top)))
console.log('events', (await page.evaluate(() => window.__ev)).join(' '))
console.log('A saved as', await page.locator(sel(keyA)).first().inputValue())
console.log('errors', errors.length ? errors : 'none')
await browser.close()
