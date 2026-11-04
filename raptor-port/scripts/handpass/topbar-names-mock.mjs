/* [TOPBAR-NAMES-BESIDE-TALON] (D1641) — the mock-up: the app's top bar today beside the proposal, on the real app.
   ONE transform: the page names never wrap inside themselves; where they fit on the first row beside TALON they stand
   there, and where they do not, the bar folds them into the side menu (☰) exactly as a phone does today. Whether they
   fit is measured on the bar itself (`fit()` below) — the build takes the same rule.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/topbar-names-mock.mjs → <folder>/topbar/ */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/topbar'; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const out = {}

/* the proposal, injected; `tbm-` prefixed so nothing of the app's own is touched */
const PROPOSE = (force) => {
  if (!document.getElementById('tbm-css')) {
    const st = document.createElement('style'); st.id = 'tbm-css'
    st.textContent = `
      @media (min-width:821px){
        .topbar .nav{flex-wrap:nowrap;flex:0 0 auto}
        .topbar.tbm-fold .nav{display:none}
        .topbar.tbm-fold .burger{display:flex}
      }`
    document.head.appendChild(st)
  }
  const tb = document.querySelector('.topbar'); if (!tb) return 'no bar'
  const nav = tb.querySelector('.nav'), mark = tb.querySelector('.mark')
  tb.classList.remove('tbm-fold')
  if (innerWidth <= 820) return 'phone'
  const cs = getComputedStyle(tb)
  const gap = parseFloat(cs.columnGap) || 14
  const avail = tb.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - mark.offsetWidth - gap - (parseFloat(getComputedStyle(nav).marginLeft) || 0)
  const need = nav.scrollWidth
  if (need > avail || force) tb.classList.add('tbm-fold')
  return { need, avail: Math.round(avail), fold: need > avail, forced: !!force }
}
/* the place marked: an outline on the names (or on ☰ where they folded), never a box laid over the page */
const MARK = () => {
  const tb = document.querySelector('.topbar')
  const fold = tb.classList.contains('tbm-fold') || getComputedStyle(tb.querySelector('.nav')).display === 'none'
  const el = fold ? tb.querySelector('.burger') : tb.querySelector('.nav')
  el.style.outline = '2px dashed #ffb020'; el.style.outlineOffset = '3px'
}
const UNMARK = () => document.querySelectorAll('.topbar .nav,.topbar .burger').forEach(e => { e.style.outline = ''; e.style.outlineOffset = '' })
const barInfo = page => page.evaluate(() => {
  const tb = document.querySelector('.topbar').getBoundingClientRect()
  const rows = new Set([...document.querySelectorAll('.topbar > *')].filter(e => e.getBoundingClientRect().width > 0).map(e => Math.round(e.getBoundingClientRect().top)))
  return { height: Math.round(tb.height), rows: rows.size }
})
async function shot(page, name, vp, h) {
  await page.evaluate(() => { document.activeElement?.blur?.(); scrollTo(0, 0) })
  await sleep(300)
  const info = await barInfo(page)
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, Math.max(h, info.height + 70)) } })
  out[name] = info
}

const SIZES = [
  ['wide', { width: 1920, height: 1080 }, false],
  ['pc1536', { width: 1536, height: 864 }, false],
  ['laptop1280', { width: 1280, height: 800 }, false],
  ['tablet1024', { width: 1024, height: 768 }, false],
  ['iphone-side', { width: 874, height: 402 }, true],
  ['iphone', { width: 402, height: 874 }, true],
]
for (const who of ['a', 'm']) {
  for (const [tag, vp, touch] of SIZES) {
    if (who === 'm' && !['pc1536', 'tablet1024', 'iphone-side'].includes(tag)) continue
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
    await ctx.clock.install({ time: new Date('2026-11-04T09:00:00') })
    const page = await ctx.newPage(); await page.goto(BASE + '/'); await login(page, who)
    const pages = who === 'a' ? ['leavewar', 'editsched'] : ['leavewar']
    for (const p of pages) {
      try {
        await go(page, p); await page.waitForSelector('.topbar'); await sleep(p === 'leavewar' ? 1800 : 700)
        const H = touch && vp.width < 500 ? 120 : 150
        await page.evaluate(MARK); await shot(page, `${who}-${tag}-${p}-today`, vp, H); await page.evaluate(UNMARK)
        /* his iPhone's letters are wider than this PC's: on his sideways iPhone the admin's names wrap (his picture of
           4 Nov 26), so the fold this PC would not measure is drawn as his phone measures it */
        const force = who === 'a' && tag === 'iphone-side'
        out[`${who}-${tag}-${p}-fit`] = await page.evaluate(PROPOSE, force)
        await page.evaluate(MARK); await shot(page, `${who}-${tag}-${p}-proposed`, vp, H); await page.evaluate(UNMARK)
        /* the side menu itself, where the names folded: open it as he would */
        if (p === 'leavewar' && who === 'a' && tag === 'iphone-side') {
          const b = page.locator('#burger'); if (touch) await b.tap(); else await b.click()
          await sleep(500); await page.screenshot({ path: `${OUT}/${who}-${tag}-${p}-menu.png` }); out[`${who}-${tag}-${p}-menu`] = 'shot'
          await page.keyboard.press('Escape'); await page.locator('.drawer.open').click({ position: { x: vp.width - 20, y: vp.height / 2 } }).catch(() => {})
        }
        await page.evaluate(() => { document.querySelector('.topbar')?.classList.remove('tbm-fold'); document.getElementById('tbm-css')?.remove() })
      } catch (e) { out[`${who}-${tag}-${p}`] = 'ERR ' + e.message.slice(0, 120) }
    }
    await ctx.close()
  }
}
writeFileSync(`${OUT}/topbar.json`, JSON.stringify(out, null, 1))
console.log(JSON.stringify(out, null, 1))
await browser.close()
