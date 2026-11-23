// The app's three Filter buttons, each with a filter set, pressed through the app from a copy of the build (the night's
// builder owns dist/). The "after" picture changes only the Admin → Users button's look in the page.
import { spawn, execSync } from 'node:child_process'
const L = 'file:///C:/Users/User/projects/Raptor-msq/raptor-port/scripts/handpass/'
const { signIn, facts, errs, PORT } = await import(L + 'n149/walk/lib.mjs')
const { adminCat } = await import(L + 'n149/walk/w1-view.mjs')
const { press, step } = await import(L + 'n149/rewalk/rlib.mjs')
const { newPage, ringShot } = await import(L + 'n149/morning/mlib.mjs')
const { go, closeMenuOutside, state } = await import(L + 'n150/walk/vlib.mjs')
const shut = async s => { for (let i = 0; i < 3 && (await state(s)).drawerOpen; i++) await closeMenuOutside(s) }
const look = (s, sel) => s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const c = getComputedStyle(e), r = e.getBoundingClientRect(); return { text: e.textContent.replace(/\s+/g, ' ').trim(), bg: c.backgroundColor, color: c.color, border: c.borderTopColor, radius: c.borderTopLeftRadius, w: Math.round(r.width), h: Math.round(r.height), font: `${c.fontSize}/${c.fontWeight}`, icon: !!e.querySelector('svg') } }, sel)
const blur = s => s.page.evaluate(() => document.activeElement && document.activeElement.blur())

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--outDir', process.env.DIST], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://localhost:${PORT}/`)).ok) break } catch {} await new Promise(r => setTimeout(r, 500)) }
try {
  for (const sz of (process.env.SZ || 'd,p').split(',')) {
    const w = sz === 'd' ? 'desk' : 'phone'
    if (!process.env.INPUTS_ONLY) await step(`users ${sz}`, async () => {
      const s = await newPage(sz); await signIn(s, 'ad', 'a'); await adminCat(s, 'Users')
      facts[`users-off-${w}`] = await look(s, '#accFilter')
      await press(s, '#accFilter'); await s.page.waitForTimeout(250)
      await s.page.locator('#accFilterPanel button', { hasText: /^Pilots$/ }).first().click(); await s.page.waitForTimeout(250)
      await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(250)
      if (await s.page.locator('#accFilterPanel').filter({ visible: true }).count()) await press(s, '#accFilter')
      await blur(s); await s.page.waitForTimeout(150)
      facts[`users-on-${w}`] = await look(s, '#accFilter')
      await ringShot(s, `users-today-${w}.png`, { ring: ['#accFilter'], clip: ['#page-admin .od-head'], pad: 12, what: 'today' })
      await s.page.evaluate(() => { const b = document.querySelector('#accFilter'); b.classList.remove('primary'); Object.assign(b.style, { background: 'rgba(59,198,232,.16)', color: 'var(--accent)', borderColor: 'rgba(59,198,232,.6)', minHeight: '36px', height: '36px' }) })
      await s.page.waitForTimeout(120)
      facts[`users-after-${w}`] = await look(s, '#accFilter')
      facts[`users-search-on-${w}`] = await s.page.evaluate(() => { const e = [...document.querySelectorAll('#page-admin .od-head .searchbox')].find(x => x.getBoundingClientRect().width > 0); return e ? Math.round(e.getBoundingClientRect().height) : null })
      await ringShot(s, `users-after-${w}.png`, { ring: ['#accFilter'], clip: ['#page-admin .od-head'], pad: 12, what: 'after' })
      await s.ctx.close()
    })
    if (!process.env.INPUTS_ONLY) await step(`logic ${sz}`, async () => {
      const s = await newPage(sz); await signIn(s, 'ad', 'a'); await go(s, 'logic'); await s.page.waitForTimeout(600); await shut(s)
      facts[`logic-off-${w}`] = await look(s, '#lgFilterBtn')
      await press(s, '#lgFilterBtn'); await s.page.waitForTimeout(250)
      facts[`logic-menu-${w}`] = await s.page.evaluate(() => [...document.querySelectorAll('#lgFilters [role^=menuitem]')].map(e => e.textContent.trim()))
      await s.page.locator('#lgFilters [role^=menuitem]').nth(1).click(); await s.page.waitForTimeout(350)
      if (await s.page.locator('#lgFilters').filter({ visible: true }).count()) await s.page.keyboard.press('Escape')
      await blur(s); await s.page.waitForTimeout(150)
      facts[`logic-on-${w}`] = await look(s, '#lgFilterBtn')
      await ringShot(s, `logic-today-${w}.png`, { ring: ['#lgFilterBtn'], clip: ['.lgbar'], pad: 10, what: 'logic' })
      await s.ctx.close()
    })
    if (sz === 'p') await step(`inputs ${sz}`, async () => {
      const s = await newPage(sz); await signIn(s, 'ad', 'a'); await go(s, 'inputs'); await s.page.waitForTimeout(800); await shut(s)
      if (await s.page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
      facts[`inputs-off-${w}`] = await look(s, '#inFiltersBtn')
      await press(s, '#inFiltersBtn'); await s.page.waitForTimeout(300)
      const sel = s.page.locator('#inFilters select').filter({ visible: true }).first()
      const opts = await sel.evaluate(e => [...e.options].map(o => o.value).filter(v => v && v !== e.value)); facts[`inputs-opts-${w}`] = opts.slice(0, 3); await sel.selectOption(opts[0]); await s.page.waitForTimeout(450)
      facts[`inputs-summary-${w}`] = await s.page.evaluate(() => document.querySelector('#inFilterSummary')?.textContent || null)
      await press(s, '#inFiltersBtn'); await blur(s); await s.page.waitForTimeout(250)
      facts[`inputs-on-${w}`] = await look(s, '#inFiltersBtn')
      await ringShot(s, `inputs-today-${w}.png`, { ring: ['#inFiltersBtn'], clip: ['#inFiltersBtn'], pad: 34, what: 'inputs' })
      await s.page.evaluate(() => Object.assign(document.querySelector('#inFiltersBtn').style, { background: 'rgba(59,198,232,.16)', color: 'var(--accent)', borderColor: 'rgba(59,198,232,.6)' }))
      await s.page.waitForTimeout(120)
      await ringShot(s, `inputs-after-${w}.png`, { ring: ['#inFiltersBtn'], clip: ['#inFiltersBtn'], pad: 34, what: 'inputs after' })
      await s.ctx.close()
    })
  }
} finally {
  try { execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' }) } catch {}
  try { for (const l of execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' }).split('\n')) { const m = l.trim().match(/LISTENING\s+(\d+)/); if (m) execSync(`taskkill /pid ${m[1]} /T /F`, { stdio: 'ignore' }) } } catch {}
}
for (const k of Object.keys(facts)) if (/-(on|off|after)-|fail/.test(k)) console.log(k, JSON.stringify(facts[k]))
console.log('errs', errs.length, errs.slice(0, 4))
process.exit(0)
