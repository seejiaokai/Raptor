/* KS5's steps on a phone, traced (21 Oct 26): where does the keyboard go when the SANS settings window is opened from the
   Logic page right after a setting was saved, and a number in it is tapped? node scripts/handpass/logic-repro-ks5.mjs [port] */
import { chromium } from 'playwright'
import { existsSync } from 'fs'
const PORT = process.argv[2] || '4290'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await (await browser.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })).newPage()
await page.goto(`http://localhost:${PORT}/`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('logic')); await page.waitForTimeout(400)
await page.click('#lgEdit')
await page.evaluate(() => {
  const t0 = performance.now(), log = window.__log = []
  const d = el => el && el.tagName ? `${el.tagName}${el.dataset?.lgset ? ':' + el.dataset.lgset : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}${el.isConnected ? '' : '(gone)'}` : 'null'
  const pd = Event.prototype.preventDefault; Event.prototype.preventDefault = function () { if (/key|input|mouse|pointer|touch/.test(this.type)) log.push('preventDefault on ' + this.type + ' — ' + new Error().stack.split('\n').slice(2, 4).join(' | ')); return pd.call(this) }
  for (const ev of ['focusin', 'focusout', 'change', 'keydown', 'beforeinput', 'input'])
    document.addEventListener(ev, e => log.push(`${Math.round(performance.now() - t0)} ${ev} ${d(e.target)} → ${d(e.relatedTarget)} ${e.data ?? e.key ?? ''} v=${e.target?.value ?? ''}`), true)
  const qm = window.queueMicrotask
  window.queueMicrotask = cb => qm(() => { log.push(`${Math.round(performance.now() - t0)} microtask runs — ${new Error().stack.split('\n').slice(2, 3).join('')}`); cb() })
  const f = HTMLElement.prototype.focus
  HTMLElement.prototype.focus = function (...a) { log.push(`${Math.round(performance.now() - t0)} focus() on ${d(this)} — ${new Error().stack.split('\n').slice(2, 4).join(' | ')}`); return f.apply(this, a) }
  new MutationObserver(() => log.push(`${Math.round(performance.now() - t0)} list redrawn`)).observe(document.getElementById('lgBody'), { childList: true })
})
const tap = async loc => { const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(b.height / 2, 8)) }
const rest = page.locator('input.lgin[data-lgset="crewRest"]')
await rest.evaluate(e => e.scrollIntoView({ block: 'center' }))
await tap(rest); await page.keyboard.type('11h'); await page.keyboard.press('Enter'); await rest.blur()
await page.waitForTimeout(600)
await tap(rest); await page.waitForTimeout(600); await tap(rest)
await page.keyboard.press('End'); await page.keyboard.type('5')
await page.keyboard.press('ControlOrMeta+a'); await page.keyboard.type('11h'); await page.keyboard.press('Enter'); await rest.blur()
await page.evaluate(() => window.__log.push('--- door click'))
await page.evaluate(() => document.querySelector('[data-lgopen="sans"]').click())
const yellow = page.locator('input.sset-num').first()
await yellow.waitFor()
await page.evaluate(() => window.__log.push('--- tap yellow'))
await page.evaluate(() => {
  const log = window.__log, y = document.querySelector('input.sset-num')
  window.__y = y
  window.addEventListener('keydown', e => log.push(`keydown at the end: defaultPrevented=${e.defaultPrevented}`))
  document.addEventListener('keypress', e => log.push(`keypress ${e.key}`), true)
  window.addEventListener('keypress', e => log.push(`keypress at the end: defaultPrevented=${e.defaultPrevented}`))
  for (const t of [document, window, document.body]) if (t.onkeydown || t.onkeypress) log.push(`an on-key property is set on ${t === window ? 'window' : t === document ? 'document' : 'body'}`)
  log.push(`yellow: type=${y.type} readOnly=${y.readOnly} disabled=${y.disabled} armed=${y.dataset.fresh || '-'}`)
  new MutationObserver(r => log.push(`window changed: ${r.length} records; the first yellow still on the page: ${window.__y.isConnected}`)).observe(y.closest('.floatwin') || document.body, { childList: true, subtree: true, attributes: true })
})
await tap(yellow)
await page.evaluate(() => window.__log.push(`after tap: focused is the first yellow: ${document.activeElement === window.__y}; armed=${window.__y.dataset.fresh || '-'}; maxLength=${window.__y.maxLength}; selection ${window.__y.selectionStart}-${window.__y.selectionEnd}; the page's cursor in: ${(() => { const s = getSelection(); const n = s.anchorNode; return n ? (n.nodeType === 1 ? n.tagName + '.' + n.className + ' ' + (n.dataset?.lgset || '') : '#text in ' + n.parentElement?.className) + ' type=' + s.type : 'none' })()}`))
await page.keyboard.type('2'); await page.waitForTimeout(200)
console.log((await page.evaluate(() => window.__log)).join('\n'))
console.log('yellow now:', await yellow.inputValue(), '· keyboard on:', await page.evaluate(() => { const a = document.activeElement; return a?.dataset?.lgset || a?.className || a?.tagName }))
await browser.close()
