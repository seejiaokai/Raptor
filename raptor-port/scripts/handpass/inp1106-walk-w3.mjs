console.log('[inp1106-walk-w3 v1]')
import { open, sleep } from './inp1106-walk-lib.mjs'
const size = process.argv[2] || 'desk'
const { br, p, errs, shot, tap, phone } = await open(size)
const T = `w3-${size}-`
const log = (...a) => console.log(...a)
const click = async (loc, name) => { if (phone) await tap(loc, T + name); else { await loc.click(); await sleep(500); await shot(T + name) } }
const wins = () => p.evaluate(() => [...document.querySelectorAll('[data-testid^=win-],[data-testid^=dcal-],[data-testid=docconf]')].filter(e => e.offsetWidth).map(e => e.dataset.testid))
const boxTxt = () => p.locator('#inpEditUpDate').innerText().then(t => t.replace(/\s+/g, ' ').trim())
const vp = () => p.evaluate(() => ({ w: innerWidth, h: innerHeight }))
const cardInfo = async () => p.evaluate(() => { const c = document.querySelector('[data-testid="dcal-card"]'); if (!c) return null; const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); const sc = document.querySelector('[data-testid="dcal-scrim"]'); const sr = sc && sc.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), vis: cs.visibility, op: cs.opacity, inside: r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, scrim: sr ? [Math.round(sr.x), Math.round(sr.y), Math.round(sr.width), Math.round(sr.height)] : null } })
await click(p.locator('#inMedBtn'), 's0-medical')
await p.locator('.medsec.med-pend .medcard').first().scrollIntoViewIfNeeded()
await click(p.locator('.medsec.med-pend .medcard').first(), 's0-medcard')
await p.waitForSelector('#docViewPop:not([hidden])')
log('route: Medical tab > pending-upchit card > Upchit button (a plain "+ Input" window with kind Upchit has no Upchit date box: it uses the window calendar)')
await click(p.locator('#docViewUpchit'), 's0-upchit-window')
await sleep(400)
const box = p.locator('#inpEditUpDate')
log('upchit box count:', await box.count(), 'visible:', await box.isVisible().catch(() => false), 'text:', await boxTxt().catch(() => 'n/a'), 'class:', await box.getAttribute('class').catch(() => ''))
log('viewport', JSON.stringify(await vp()))
await box.scrollIntoViewIfNeeded()
// open
await click(box, 's1-opened')
log('S1 open: wins', JSON.stringify(await wins()), 'card', JSON.stringify(await cardInfo()))
// pick a date
const days = await p.evaluate(() => [...document.querySelectorAll('[data-testid="dcal-card"] button')].filter(b => b.offsetWidth).map(b => (b.dataset.testid || b.className.slice(0, 12)) + ':' + b.textContent.trim().slice(0, 8)))
log('card buttons:', JSON.stringify(days.slice(0, 50)))
const before = await boxTxt()
const pick = p.locator('[data-testid="dcal-card"] button', { hasText: /^16$/ }).first()
await click(pick, 's2-picked')
log('S2 before:', before, '| after:', await boxTxt(), '| wins', JSON.stringify(await wins()))
// scrim tap
await click(box, 's3-reopened')
const ci = await cardInfo(); log('S3 reopened card', JSON.stringify(ci))
const v = await vp()
const val = await boxTxt()
// a point on the scrim away from the card
const pts = [[8, v.h - 8], [v.w - 8, v.h - 8], [8, 8], [v.w - 8, 8]]
let pt = pts.find(([x, y]) => !(x >= ci.x && x <= ci.x + ci.w && y >= ci.y && y <= ci.y + ci.h))
log('S3 scrim tap point', JSON.stringify(pt), 'element there:', await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e.tagName + '.' + (e.className + '').slice(0, 25) + ' ' + (e.dataset.testid || '') }, pt))
if (phone) await p.touchscreen.tap(pt[0], pt[1]); else await p.mouse.click(pt[0], pt[1])
await p.screenshot({ path: `${(await import('./inp1106-walk-lib.mjs')).OUT}/${T}s3-scrim-quick.png` }); await sleep(700); await shot(T + 's3-scrim-tapped')
log('S3 after scrim tap: wins', JSON.stringify(await wins()), 'box', await boxTxt().catch(() => 'n/a'), 'unchanged:', (await boxTxt().catch(() => '')) === val)
// escape (desktop)
if (!phone) {
  await click(box, 's4-reopened')
  log('S4 open wins', JSON.stringify(await wins()))
  await p.keyboard.press('Escape'); await sleep(600); await shot(T + 's4-esc1')
  log('S4 after Escape 1: wins', JSON.stringify(await wins()), 'box', await boxTxt().catch(() => 'n/a'))
  await p.keyboard.press('Escape'); await sleep(600); await shot(T + 's4-esc2')
  log('S4 after Escape 2: wins', JSON.stringify(await wins()), 'confirm text:', await p.evaluate(() => [...document.querySelectorAll('.airpop')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 80))))
}
log('ERRORS', JSON.stringify(errs))
await br.close()
