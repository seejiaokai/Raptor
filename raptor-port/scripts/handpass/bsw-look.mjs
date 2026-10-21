/* [BOARD-SIDE-WIDTH] D1115 — the look over the board's crew list: every state it draws, recorded, not changed.
   For each day of the demo week with no seat picked, and on the busiest day with one place of each kind picked (a front
   seat, a back seat, a duty desk's "+ add", a sim seat, a ground row, a programme row, an SC seat, a passenger seat), it
   writes out every entry of the crew list — its section and heading, its look (free / faded / crossed out / standby),
   its printed reason and its hover words — so the counts, the order and each reason can be checked against the rules,
   and takes a picture of the side column for each. An ATT B man is filed first (Havoc, Monday) so his look is in it.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/bsw-look.mjs  → <folder>/look.json */
console.log('bsw-look v1')
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/look'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await login(page, 'a')
await page.evaluate(() => {
  const P = window.PEOPLE, id = Object.keys(P).find(k => P[k].cs === 'Havoc')
  window.fileInput({ person: id, date: 'Jul 13', allday: true, type: 'ATT B', remarks: 'Medically down', mod: '2026-07-10' })
})
const noToasts = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
const read = () => page.evaluate(() => {
  const ros = document.querySelector('#schedBoard .sb-roster')
  const look = e => e.classList.contains('no') ? 'struck' : e.classList.contains('busy') ? 'faded' : e.classList.contains('standby') ? 'standby' : 'free'
  const entry = e => ({ cs: e.querySelector('.puck')?.textContent.trim().replace(/\s+/g, ' '), look: look(e), why: e.dataset.why || '', shown: e.querySelector('.rwhy')?.textContent || '', title: e.title })
  const out = { arm: ros.querySelector('.ros-arm')?.textContent.trim().replace(/\s+/g, ' ') || '', sections: [] }
  for (const sec of ros.querySelectorAll('.rcol, .rall')) {
    const head = sec.querySelector(':scope > .rh, :scope > .rh2')?.textContent.trim()
    const colWhy = sec.querySelector(':scope > .rwhy')?.textContent || ''
    const items = [...sec.querySelectorAll('.rpuck')].map(entry)
    if (sec.classList.contains('rsans')) sec.querySelectorAll('.rsans-row').forEach((r, i) => { items[i].badge = r.querySelector('.rsans-b')?.textContent || ''; items[i].remark = r.querySelector('.rsans-r')?.textContent || '' })
    out.sections.push({ head, colWhy, items })
  }
  return out
})
const shot = async name => {
  await noToasts()
  await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster'); r.scrollTop = 0 })
  const b = await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-side').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: Math.min(r.height, innerHeight - r.top) } })
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: b })
}
const disarm = () => page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
const result = { days: {}, arms: {} }

await go(page, 'editsched')
await page.click('#eWeek [data-sbday="0"]:visible')
await page.waitForSelector('#schedBoard'); await page.waitForTimeout(700)
const nDays = await page.evaluate(() => window.DAYS.length)
for (let di = 0; di < nDays; di++) {
  await page.evaluate(d => document.querySelector(`#schedBoard [data-sbtab="${d}"]`)?.click(), di)
  await page.waitForTimeout(500)
  result.days[di] = await read()
  await shot(`day${di}-none`)
}
/* the arms, on Monday; a blank line first so a flying seat is free */
await page.evaluate(() => document.querySelector('#schedBoard [data-sbtab="0"]')?.click()); await page.waitForTimeout(500)
await page.locator('#schedBoard [data-gline="0.0"]:visible').first().click(); await page.waitForTimeout(600)
const targets = await page.evaluate(() => {
  const all = [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot], #schedBoard .seat[data-slot], #schedBoard [data-fill]')]
    .filter(e => e.offsetParent && (!e.matches('.seat') || !e.querySelector('.puck[data-person]')))
  return all.map(e => e.dataset.slot || e.dataset.fill)
})
const kinds = [['front', /^0\.\d+\.\d+\.\d+\.p$/], ['back', /^0\.\d+\.\d+\.\d+\.w$/], ['desk', /^d:0\./], ['sim', /^s:0\.[^.]+\.\d+\.(\d+|\+)$/], ['simpax', /^s:0\..*pax/], ['ground', /^g:0\./], ['programme', /^a:0\./], ['flypax', /^0\..*\.x\d+$/]]
result.targets = targets
for (const [k, re] of kinds) {
  const key = targets.find(t => re.test(t))
  if (!key) { result.arms[k] = { missing: true }; continue }
  await disarm(); await page.waitForTimeout(250)
  await page.evaluate(k => { const e = [...document.querySelectorAll('#schedBoard [data-slot], #schedBoard [data-fill]')].find(x => (x.dataset.slot || x.dataset.fill) === k && x.offsetParent); e.scrollIntoView({ block: 'center' }); e.setAttribute('data-bswpick', '1') }, key)
  await page.locator('#schedBoard [data-bswpick="1"]').first().click(); await page.waitForTimeout(500)
  await page.evaluate(() => document.querySelector('[data-bswpick]')?.removeAttribute('data-bswpick'))
  const armed = await page.evaluate(() => window.ARM && window.ARM.key)
  result.arms[k] = { key, armed, ...(await read()) }
  await shot(`arm-${k}`)
  /* and the SANS section, scrolled into view (it sits under the two crew columns) */
  if (k === 'desk' || k === 'front') {
    await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster'), s = r.querySelector('.rsans'); r.scrollTop = s.offsetTop - r.offsetTop - 60 })
    await noToasts()
    const b = await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-side').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: Math.min(r.height, innerHeight - r.top) } })
    await page.screenshot({ path: `${OUT}/arm-${k}-sans.png`, clip: b })
  }
}
/* an SC wave added on Monday through + Wave → SC (the demo week has none): its first seat picked (the list cut to the
   SC-current crew), then Comet (free all day) put in its last SPARE seat, so the standby look can be read with no seat picked */
await disarm(); await page.waitForTimeout(250)
await page.locator('#schedBoard [data-wvadd="0"]:visible').first().click(); await page.waitForTimeout(300)
await page.locator('.wavemenu [data-wmkind="sc"]').first().click(); await page.waitForTimeout(600)
const sc = await page.evaluate(() => { const gi = window.DAYS[0].waves.length - 1, w = window.DAYS[0].waves[gi]
  return { gi, rows: w.formations.map((f, fi) => f.aircraft.map((a, ai) => `0.${gi}.${fi}.${ai}`)).flat() } })
const pick = async key => {
  await page.evaluate(k => { const e = [...document.querySelectorAll('#schedBoard [data-slot]')].find(x => x.dataset.slot === k && x.offsetParent); e.scrollIntoView({ block: 'center' }); e.setAttribute('data-bswpick', '1') }, key)
  await page.locator('#schedBoard [data-bswpick="1"]').first().click(); await page.waitForTimeout(500)
  await page.evaluate(() => document.querySelector('[data-bswpick]')?.removeAttribute('data-bswpick'))
  return page.evaluate(() => window.ARM && window.ARM.key)
}
result.sc = sc
result.arms.sc = { key: sc.rows[0] + '.p', armed: await pick(sc.rows[0] + '.p'), ...(await read()) }
await shot('arm-sc')
await disarm(); await page.waitForTimeout(250)
const spareKey = sc.rows[sc.rows.length - 1] + '.p'
await pick(spareKey)
/* Comet: free all Monday, so nothing else outranks the standby look */
const put = await page.evaluate(() => { const id = Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Comet'); const e = document.querySelector(`#schedBoard .sb-roster .rcol .rpuck[data-person="${id}"]:not(.no)`); if (!e) return null; e.setAttribute('data-bswpick', '1'); return e.dataset.person })
if (put) { await page.locator('#schedBoard [data-bswpick="1"]').first().click(); await page.waitForTimeout(500); await page.evaluate(() => document.querySelector('[data-bswpick]')?.removeAttribute('data-bswpick')) }
await disarm(); await page.waitForTimeout(300)
result.standby = { spareKey, put, inSeat: await page.evaluate(k => window.slotVal ? window.slotVal(k) : null, spareKey), ...(await read()) }
await shot('standby-none')
result.errors = errors
writeFileSync(`${OUT}/look.json`, JSON.stringify(result, null, 1))
console.log('days', Object.keys(result.days).length, 'arms', Object.entries(result.arms).map(([k, v]) => `${k}:${v.missing ? 'MISSING' : v.armed}`).join(' '), 'errors', errors.length)
await browser.close()
