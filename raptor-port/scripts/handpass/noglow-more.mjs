/* [GUIDE-NO-GLOW] the places the fresh read of version 3 found (M1, S1), drawn for his look: each in the state the app
   itself puts it in, by a real press or drag, then the same frame with one override taking the light off.
     N10 the sign-in page's claw logo (`.lb-glyph`, a cyan drop-shadow) — before sign-in
     N11 the Leave War's docked balance bar (`.balbar`, the same recipe as the move banner): a pale cyan band round it —
         opened by a real mouse drag down a figures column (an admin's balance entry)
     N12 the Fast sync switch while on: a pale green band round its dot (`.fastsync.on .dot`)
     N13 Admin → Users' sign-in / roster dots: a pale green or red band round each (`#page-admin .od-c i.g / i.r`)
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/mock/2026-10-15-noglow-places node scripts/handpass/noglow-more.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE
const NOGLOW = {
  logo: '.lb-glyph{filter:none !important}',
  bar: '.mv-banner,.balbar{box-shadow:0 18px 44px rgba(0,0,0,.7) !important}',
  sync: '.fastsync.on .dot{box-shadow:none !important}',
  dots: '#page-admin .od-c i.g,#page-admin .od-c i.r{box-shadow:none !important}',
}
const out = {}

/* N10 — the sign-in page, before anyone signs in (L.world signs in, so this one opens its own page) */
{
  const S = L.SIZES[SIZE], CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const b = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await b.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: S.dpr, ...(S.phone ? { isMobile: true, hasTouch: true } : {}) })
  const p = await ctx.newPage()
  await p.goto(L.BASE + '/?fresh=1'); await p.waitForSelector('.lb-glyph'); await L.sleep(500)
  const shot = async (name, opts) => { const r = await p.locator('.lb-glyph').first().boundingBox(); const pad = 40; await p.screenshot({ path: resolve(L.SHOTS, name + '.png'), ...(opts === 'where' ? {} : { clip: { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: r.width + pad * 2, height: r.height + pad * 2 } }) }); console.log('   pic', name + '.png') }
  await shot(`N10-logo-today-${T}`)
  await p.addStyleTag({ content: NOGLOW.logo }); await L.sleep(150)
  await shot(`N10-logo-noglow-${T}`)
  await p.evaluate(() => { const s = [...document.querySelectorAll('style')].pop(); s.remove() }); await L.sleep(150)
  await shot(`N10-logo-where-${T}`, 'where')
  out.N10 = 'drawn'
  await b.close()
}

const w = await L.world(SIZE), p = w.page
const noGlow = css => p.evaluate(c => { let s = document.getElementById('mk-noglow'); if (!s) { s = document.createElement('style'); s.id = 'mk-noglow'; document.head.appendChild(s) } s.textContent = c || '' }, css)
const marker = (sel, on) => p.evaluate(([sel, on]) => {
  document.getElementById('mk-box')?.remove(); if (!on) return
  const r = document.querySelector(sel).getBoundingClientRect(), b = document.createElement('div'); b.id = 'mk-box'
  Object.assign(b.style, { position: 'fixed', left: (r.left - 8) + 'px', top: (r.top - 8) + 'px', width: (r.width + 16) + 'px', height: (r.height + 16) + 'px', border: '2px dashed #FFB020', borderRadius: '8px', zIndex: 99999, pointerEvents: 'none' })
  document.body.appendChild(b)
}, [sel, on])
async function shots(name, sel, css, pad = 24) {
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  await noGlow(''); await L.sleep(150); await L.pic(w, `${name}-today-${T}`, { around: sel, pad })
  await noGlow(css); await L.sleep(150); await L.pic(w, `${name}-noglow-${T}`, { around: sel, pad })
  await noGlow(''); await marker(sel, true); await L.pic(w, `${name}-where-${T}`); await marker(sel, false)
}
async function place(k, fn) { try { out[k] = await fn() || 'drawn' } catch (e) { out[k] = 'NOT DRAWN — ' + String(e.message || e).slice(0, 200) } }

try {
  /* N12 — Fast sync pressed on, in the top bar (desktop shows it; a phone may keep it in its menu) */
  await place('N12', async () => {
    const b = p.locator('.fastsync').first()
    if (!await b.isVisible()) return 'NOT DRAWN — the Fast sync switch is not on screen at this size'
    await w.press(b); await L.sleep(300)
    await shots('N12-fastsync-on', '.fastsync.on', NOGLOW.sync, 20)
    await w.press(p.locator('.fastsync').first()); await L.sleep(200)
  })
  /* N11 — the balance bar, by a real drag down a figures column on the Leave War */
  await place('N11', async () => {
    await L.go(w, 'leavewar'); await p.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(700)
    const pts = await p.evaluate(() => {
      const cells = [...document.querySelectorAll('#page-leavewar .mx tbody td.figbox')].filter(c => c.getBoundingClientRect().width > 0)
      const col = cells.length ? cells[0].cellIndex : -1
      const same = cells.filter(c => c.cellIndex === col)
      const a = same[1], z = same[3]; if (!a || !z) return null
      a.scrollIntoView({ block: 'center' })
      const ra = a.getBoundingClientRect(), rz = z.getBoundingClientRect()
      return { ax: ra.x + ra.width / 2, ay: ra.y + ra.height / 2, zx: rz.x + rz.width / 2, zy: rz.y + rz.height / 2 }
    })
    if (!pts) throw new Error('no figures cells')
    if (w.phone) {
      /* a phone selects by a long press and drag (D636); the touch pointer is driven through the page's own events */
      await p.evaluate(async ({ ax, ay, zx, zy }) => {
        const at = (x, y) => document.elementFromPoint(x, y)
        const ev = (t, x, y) => new PointerEvent(t, { bubbles: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, button: 0 })
        at(ax, ay).dispatchEvent(ev('pointerdown', ax, ay)); await new Promise(f => setTimeout(f, 650))
        for (let i = 1; i <= 8; i++) { const y = ay + (zy - ay) * i / 8; window.dispatchEvent(ev('pointermove', zx, y)); await new Promise(f => setTimeout(f, 30)) }
        window.dispatchEvent(ev('pointerup', zx, zy))
      }, pts)
    } else {
      await p.mouse.move(pts.ax, pts.ay); await p.mouse.down()
      for (let i = 1; i <= 8; i++) { await p.mouse.move(pts.zx, pts.ay + (pts.zy - pts.ay) * i / 8); await L.sleep(30) }
      await p.mouse.up()
    }
    await L.sleep(500)
    if (!await p.locator('.balbar').count()) throw new Error('the balance bar did not open')
    await shots('N11-balance-bar', '.balbar', NOGLOW.bar, 22)
    await p.keyboard.press('Escape'); await L.sleep(200)
  })
  /* N13 — Admin → Users' dots */
  await place('N13', async () => {
    await L.adminPanel(w, 'Users'); await L.sleep(400)
    const ok = await p.evaluate(() => { const e = [...document.querySelectorAll('#page-admin .od-row')].find(r => r.querySelector('.od-c i.g') && r.getBoundingClientRect().width > 0); if (!e) return false; e.setAttribute('data-mk', 'a'); e.scrollIntoView({ block: 'center' }); return true })
    if (!ok) throw new Error('no user row with a lit dot')
    await shots('N13-admin-dots', '[data-mk="a"]', NOGLOW.dots, 14)
  })
  console.log(JSON.stringify(out, null, 1))
} finally { await L.close(w) }
