console.log('[inp1106-walk-w4 v1]')
import { open, sleep } from './inp1106-walk-lib.mjs'
const size = process.argv[2] || 'desk'
const { br, p, errs, shot, tap, phone } = await open(size)
const T = `w4-${size}-`
const log = (...a) => console.log(...a)
const click = async (loc, name) => { if (phone) await tap(loc, T + name); else { await loc.click(); await sleep(500); await shot(T + name) } }
const wins = () => p.evaluate(() => [...document.querySelectorAll('[data-testid^=win-]')].filter(e => e.offsetWidth).map(e => e.dataset.testid))
// month facts from the visible tab: title, the weekday of the 1st by column, count of day cells
const month = async (scope) => p.evaluate(sc => {
  const root = document.querySelector(sc) || document
  const cells = [...root.querySelectorAll('[data-icday],[data-sday],[data-testid^="cell-"]')].filter(e => e.offsetWidth)
  const dows = [...root.querySelectorAll('.ic-dow > *, .ic-head > *, [class*=dow] > *')].filter(e => e.offsetWidth).map(e => e.textContent.trim().slice(0, 3))
  const key = e => e.dataset.icday || e.dataset.sday || (e.dataset.testid || '').replace(/^cell-[a-z]+-/, '')
  const first = cells.find(e => key(e).endsWith('-01'))
  const heads = [...root.querySelectorAll('*')].filter(e => e.children.length === 0 && /^(MON|TUE|WED|THU|FRI|SAT|SUN)$/i.test(e.textContent.trim()) && e.offsetWidth)
  let col = null
  if (first) { const fx = first.getBoundingClientRect(); const cx = fx.x + fx.width / 2; const h = heads.find(h => { const r = h.getBoundingClientRect(); return cx >= r.x - fx.width / 2 && cx <= r.right + fx.width / 2 }); col = h && h.textContent.trim() }
  const title = (root.querySelector('[data-testid=ic-mon]') || {}).textContent || ''
  return { cells: cells.length, first: first && key(first), firstUnderHeading: col, heads: heads.slice(0, 7).map(h => h.textContent.trim()), title: title.trim() }
}, scope)
const navs = () => p.evaluate(() => [...document.querySelectorAll('.page.on button')].filter(b => b.offsetWidth && /^[‹›]$/.test(b.textContent.trim())).map(b => (b.id || b.dataset.testid || b.className) + ':' + b.textContent.trim()))

// Inputs month
await click(p.locator('#inCalBtn'), 's1-inputs-july')
log('Inputs July:', JSON.stringify(await month('#inpCal')), 'navs', JSON.stringify(await navs()))
await click(p.locator('#icPrev'), 's1-inputs-june'); await sleep(500)
log('Inputs after ‹:', JSON.stringify(await month('#inpCal')))
await shot(T + 's1-inputs-june-settled')
await click(p.locator('#icNext'), 's1-inputs-back-july'); await sleep(500)
log('Inputs after ›:', JSON.stringify(await month('#inpCal')))
await shot(T + 's1-inputs-back-july-settled')
// SANS
await click(p.locator('#inSansMode'), 's2-sans')
await sleep(400)
log('SANS navs:', JSON.stringify(await navs()), 'page text head:', await p.evaluate(() => document.querySelector('.page.on').innerText.replace(/\s+/g, ' ').slice(0, 120)))
log('SANS July:', JSON.stringify(await month('.page.on')))
const sp = p.locator('.page.on button', { hasText: '‹' }).first(), sn = p.locator('.page.on button', { hasText: '›' }).first()
await click(sp, 's2-sans-prev'); await sleep(500); await shot(T + 's2-sans-prev-settled')
log('SANS after ‹:', JSON.stringify(await month('.page.on')))
await click(sn, 's2-sans-next'); await sleep(500); await shot(T + 's2-sans-next-settled')
log('SANS after ›:', JSON.stringify(await month('.page.on')))
// Medical
await click(p.locator('#inMedBtn'), 's3-medical'); await sleep(400)
log('Medical navs:', JSON.stringify(await navs()), 'has month grid:', await p.evaluate(() => !!document.querySelector('.page.on [data-icday],.page.on [data-sday]')), 'text head:', await p.evaluate(() => document.querySelector('.page.on').innerText.replace(/\s+/g, ' ').slice(0, 140)))
// Inputs month; new input window open; click another date behind (desktop)
await click(p.locator('#inMemberMode'), 's4-inputs-tab'); await sleep(500)
if (!await p.locator('#icPrev').isVisible()) await click(p.locator('#inCalBtn'), 's4-cal')
if (!phone) {
  await p.click('#inpCal [data-icday="2026-07-14"]', { position: { x: 10, y: 10 } }); await sleep(600)
  log('day opened wins', JSON.stringify(await wins()))
  await p.click('[data-testid=win-inputsday-x]'); await sleep(400)
  // new input window: the day window's + Input is the usual door; try the page-level one via the day
  await p.click('#inpCal [data-icday="2026-07-14"]', { position: { x: 10, y: 10 } }); await sleep(500)
  await p.locator('[data-testid=win-inputsday] button', { hasText: '+ Input' }).click(); await sleep(700)
  log('new input window wins', JSON.stringify(await wins()))
  const hi = () => p.evaluate(() => ({ sel: [...document.querySelectorAll('#inpCal [data-icday]')].filter(e => /sel|pick|on|today|lit|active/.test(e.className) ).map(e => e.dataset.icday + '.' + e.className.slice(0, 30)), title: (document.querySelector('[data-testid=win-inputedit] .win-title,[data-testid=win-inputedit] .win-bar') || {}).textContent, dcalSel: [...document.querySelectorAll('[data-testid=win-inputedit] .dcal-d')].filter(e => /sel|on|rng|pick|start|end/.test(e.className)).map(e => e.dataset.testid.slice(-10) + '.' + e.className.slice(0, 40)) }))
  log('before click:', JSON.stringify(await hi())); await shot(T + 's5-before')
  await p.click('#inpCal [data-icday="2026-07-28"]', { position: { x: 10, y: 10 } }); await sleep(600)
  log('after clicking 28 Jul on the month behind:', JSON.stringify(await hi()), 'wins', JSON.stringify(await wins()))
  await shot(T + 's5-after-click-28')
  log('day window title now:', await p.locator('[data-testid=win-inputsday]').innerText().then(t => t.split(String.fromCharCode(10)).slice(0, 2).join(' / ')), '| open-class day:', await p.evaluate(() => [...document.querySelectorAll('#inpCal .is-open')].map(e => e.dataset.icday)))
  log('window words:', await p.locator('[data-testid=win-inputedit]').innerText().then(t => t.split(String.fromCharCode(10)).slice(0, 3).join(' / ')))
}
log('ERRORS', JSON.stringify(errs))
await br.close()
