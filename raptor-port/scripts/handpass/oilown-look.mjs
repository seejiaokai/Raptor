// A LOOK, for his question of 11 Oct 26 (`[ALL-AVAIL-AS-MEMBER]`): "when the person files an input for multiple people
// can he select who gets OIL who doesn't? And if a man may answer for himself … show me what he will see exactly".
// Real screens of the build as it stands — the filer's OIL question for a shared input, and what one man of it sees for
// his own answer. Not a gate: it asserts nothing; a person opens the pictures.
//
//   npm run build && npx vite preview --port 4180 --strictPort
//   LOOK_URL=http://localhost:4180/ node scripts/handpass/oilown-look.mjs
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { launch, open, openDay, press, csId, WIN, DAYWIN, signOut, signIn } from './icard-A-lib.mjs'

const OUT = 'docs/mock/img/one-rule-oil'
mkdirSync(OUT, { recursive: true })
const PHONE = { width: 390, height: 844 }
const DAY = '2026-10-17'                                   // a Saturday
const snap = (p, name) => p.screenshot({ path: join(OUT, name + '.png') }).then(() => console.log('shot', name))
const say = async (p, what) => console.log(what, JSON.stringify(await p.evaluate(() => window.INPUTS.filter(r => r.type === 'Training' && r.date === 'Oct 17').map(r => ({ p: window.PEOPLE[r.person].cs, oil: r.oil || null })))))

const browser = await launch()
const { page: p } = await open(browser, PHONE, 'ad', 'a', true)
const T = true
try {
  const names = await p.evaluate(() => {
    const P = window.PEOPLE
    const crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers).map(id => P[id].cs)
    return crew.filter(c => c !== 'Saber' && c !== 'Ranger').slice(0, 2)
  })
  const three = ['Ranger', ...names]
  console.log('people', three.join(', '))

  // 1. Saber files a Training for three, on a Saturday
  await openDay(p, DAY, T)
  await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', 'Training')
  await press(T, p.locator(`${WIN} [data-testid="pp-several"]`))
  for (const cs of three) { const b = p.locator(`${WIN} [data-pp="${await csId(p, cs)}"]`); await b.scrollIntoViewIfNeeded().catch(() => {}); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(T, b) }
  await p.fill('#inpEditStart', '09:00').catch(() => {}); await p.fill('#inpEditEnd', '12:00').catch(() => {})
  await p.waitForTimeout(300)
  await snap(p, '1-filer-window')
  await press(T, p.locator('#inpEditSave'))
  const sheet = p.locator('[data-testid="oilconf"]')
  await sheet.waitFor({ timeout: 4000 })
  await p.waitForTimeout(300)
  await snap(p, '2-filer-oil-question')
  await press(T, sheet.locator('[data-testid="oil-yes"]'))
  await p.waitForTimeout(200)
  await snap(p, '2b-filer-oil-yes')
  await press(T, sheet.locator('[data-testid="oilconf-save"]'))
  await p.waitForTimeout(600)
  await say(p, 'after filing')
  if (!(await p.locator(DAYWIN).count())) await openDay(p, DAY, T)
  await p.waitForTimeout(300)
  await snap(p, '3-day-card')
  console.log('daywin testids', JSON.stringify(await p.locator(`${DAYWIN} [data-testid]`).evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-testid')))].slice(0, 40))))

  // 2. Ranger signs in, opens it: his own answer
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  await signOut(p, T); await signIn(p, 'us', 'us')
  await openDay(p, DAY, T)
  await p.waitForTimeout(300)
  await snap(p, '4-ranger-day')
  const card = p.locator(`${DAYWIN} [data-popiid]`).first()
  console.log('cards', await p.locator(`${DAYWIN} [data-popiid]`).count())
  await press(T, card); await p.locator(WIN).waitFor({ timeout: 4000 })
  await p.waitForTimeout(400)
  await snap(p, '5-ranger-window')
  const own = p.locator(`${WIN} [data-testid="oil-revise-own"]`)
  console.log('own change button', await own.count())
  await own.scrollIntoViewIfNeeded().catch(() => {})
  await snap(p, '5b-ranger-window-own')
  await press(T, own)
  await sheet.waitFor({ timeout: 4000 }); await p.waitForTimeout(300)
  await snap(p, '6-ranger-oil-question')
  await press(T, sheet.locator('[data-testid="oil-no"]'))
  await p.waitForTimeout(200)
  await press(T, sheet.locator('[data-testid="oilconf-save"]'))
  await p.waitForTimeout(600)
  await say(p, 'after Ranger said no')
  await snap(p, '7-ranger-after-no')

  // 3. Saber again: what the input says now
  await p.keyboard.press('Escape'); await p.waitForTimeout(200)
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  await signOut(p, T); await signIn(p, 'ad', 'a')
  await openDay(p, DAY, T)
  await press(T, p.locator(`${DAYWIN} [data-popiid]`).first()); await p.locator(WIN).waitFor({ timeout: 4000 })
  await p.waitForTimeout(400)
  await snap(p, '8-saber-window')
  const sum = p.locator(`${WIN} .inped-oilsum`).first()
  if (await sum.count()) { await sum.scrollIntoViewIfNeeded().catch(() => {}); console.log('summary:', await sum.innerText()); await snap(p, '8b-saber-window-oil') }
} catch (e) {
  console.log('STOPPED:', String(e).slice(0, 400))
  await snap(p, 'zz-stopped').catch(() => {})
} finally { await browser.close() }
