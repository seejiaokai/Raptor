// Pictures for the [TALON-CLAW-PAGES] design (D1607): for each slow page, at his iPhone's size (402 x 874, 3x) and a
// desktop's (1536 x 864, 1x), the three moments of opening it — the menu with its line (phone) or the top bar's tab
// (desktop), the BLANK moment under the top bar while the page's code downloads, and the page drawn — plus the
// proposed frame: the same blank moment with the app's own loading claw laid into the page area under the top bar.
// The claw is the BUILT one, copied from index.html's #bootclaw markup and styles at run time (never redrawn), only
// moved from covering the whole screen to covering the page area; its animations are paused at a fixed moment (all
// three claws whole) so the picture is the claw as it holds, not a frame caught mid-scratch.
// The blank moment is held long enough to picture by slowing the network for the page's own download only.
//   npm run build && node scripts/handpass/talon-page-pics.mjs
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = join(ROOT, 'docs/img/handpass/2026-11-03-talon-pages')
mkdirSync(OUT, { recursive: true })
const PORT = Number(process.env.PORT || 4294)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'

// the built claw, read from the built first page (dist/index.html), so the picture carries exactly what ships
const html = readFileSync(join(ROOT, 'dist/index.html'), 'utf8')
const clawCss = html.match(/<style>([\s\S]*?#bootclaw[\s\S]*?)<\/style>/)[1]
const clawHtml = html.match(/(<div id="bootclaw"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/)[1]

const PAGES = [
  ['leavewar', '#page-leavewar table.mx tbody tr', /LeaveWarPage/],
  ['tracker', '#page-tracker #board', /TrackerPage/],
]
const SIZES = {
  phone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  desk: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 },
}

const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

for (const [sizeName, size] of Object.entries(SIZES)) {
  for (const [page, sel, chunk] of PAGES) {
    const ctx = await browser.newContext(size)
    const pg = await ctx.newPage()
    await pg.goto(`http://localhost:${PORT}/?fresh=1`)
    await pg.waitForSelector('#luser')
    // the claw at start-up is the boot one, already gone once the app is up; the sign-in
    await pg.fill('#luser', 'ad'); await pg.fill('#lpass', 'a')
    await pg.click('#loginForm button[type=submit]')
    await pg.waitForSelector('#vWeek .day', { state: 'attached' })
    await pg.waitForTimeout(500)
    // hold the page's own download back until the blank moment is pictured
    let release
    const held = new Promise(r => { release = r })
    await pg.route(u => chunk.test(u.pathname), async route => { await held; await route.continue() })
    const tag = `${page}-${sizeName}`
    if (size.isMobile) {
      await pg.click('#burger'); await pg.waitForSelector('#drawer.open'); await pg.waitForTimeout(450)
      await pg.screenshot({ path: join(OUT, `${tag}-1-menu.png`) })
      await pg.click(`#drawerNav a[data-page="${page}"]`)
    } else {
      await pg.screenshot({ path: join(OUT, `${tag}-1-menu.png`) })
      await pg.click(`#topnav a[data-page="${page}"]`)
    }
    await pg.waitForSelector(`#page-${page}.on`)
    await pg.waitForTimeout(450)
    // premise: the page area is empty (its code not yet arrived)
    const empty = await pg.evaluate(p => document.getElementById('page-' + p).children.length === 0, page)
    if (!empty) throw new Error(`${tag}: the page drew before its blank moment could be pictured`)
    await pg.screenshot({ path: join(OUT, `${tag}-2-blank.png`) })
    // the proposed frame: the built claw laid into the page area under the top bar, paused whole
    await pg.evaluate(({ css, markup, p }) => {
      const st = document.createElement('style')
      st.id = 'pc-css'
      // index.html's claw covers the whole screen; here it covers the page area only: from the top bar's foot down
      st.textContent = css.replace('#bootclaw{position:fixed;inset:0;z-index:1000;', '#bootclaw{position:fixed;inset:var(--pc-top) 0 0 0;z-index:5;')
      document.head.appendChild(st)
      const bar = document.querySelector('.topbar').getBoundingClientRect()
      document.documentElement.style.setProperty('--pc-top', bar.bottom + 'px')
      const holder = document.createElement('div')
      holder.innerHTML = markup
      const claw = holder.firstElementChild
      claw.setAttribute('data-drawn-in', 'proposed')
      document.getElementById('page-' + p).appendChild(claw)
      // every claw whole: 1.2 s into a round (each claw drawn by 0.74 s, the fade starts at 1.29 s) — after the 0.3 s wait
      for (const a of claw.getAnimations({ subtree: true })) { a.pause(); a.currentTime = 1500 }
    }, { css: clawCss, markup: clawHtml, p: page })
    await pg.waitForTimeout(100)
    const ok = await pg.evaluate(() => { const c = document.querySelector('[data-drawn-in=proposed]'); return !!c && getComputedStyle(c).opacity === '1' })
    if (!ok) throw new Error(`${tag}: the drawn-in claw is not showing`)
    await pg.screenshot({ path: join(OUT, `${tag}-3-claw.png`) })
    await pg.evaluate(() => { document.querySelector('[data-drawn-in=proposed]')?.remove(); document.getElementById('pc-css')?.remove() })
    release()
    await pg.waitForSelector(sel, { timeout: 30000 })
    await pg.waitForTimeout(1200)
    await pg.screenshot({ path: join(OUT, `${tag}-4-drawn.png`) })
    console.log(`${tag}: four pictures`)
    await ctx.close()
  }
}
await browser.close()
await new Promise(r => server.httpServer.close(r))
