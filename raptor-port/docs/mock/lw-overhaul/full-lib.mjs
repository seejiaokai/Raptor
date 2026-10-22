// Shared helpers for the Leave War overhaul's full mock-up (D1140, 21 Oct 26), drawn into the REAL local build.
//   cd raptor-port && npm run build && npx vite preview --port 4197 --strictPort ; node docs/mock/lw-overhaul/<script>.mjs
// New parts are drawn with the app's own classes and marked NEW; nothing here is built into the app.
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
const require = createRequire(new URL('../../../package.json', import.meta.url))
export const { chromium } = require('@playwright/test')
export const SP = process.env.LWMOCK_OUT || 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-fervent-chatelet-6c9af5/3dac9d92-4551-43ea-9173-a6413b75b220/scratchpad'
export const OUT = join(SP, 'out'); mkdirSync(OUT, { recursive: true })
export const APP = 'http://localhost:4197/'
export const CLOCK = new Date('2026-01-08T09:00:00+08:00')
export const q = t => `[data-testid="${t}"]`
export const PINK = '#ff2d95'
export const errs = []

export async function newPage(browser, w, h, touch, state, dpr) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr ?? (touch ? 3 : 1.25), hasTouch: touch, isMobile: touch, timezoneId: 'Asia/Singapore', ...(state ? { storageState: state } : {}) })
  const p = await ctx.newPage()
  p.on('pageerror', e => errs.push(String(e)))
  await p.clock.setFixedTime(CLOCK)
  return { ctx, p }
}
export async function signIn(p, who) {
  await p.goto(APP)
  await p.fill('#luser', who === 'admin' ? 'ad' : 'us'); await p.fill('#lpass', who === 'admin' ? 'a' : 'us')
  await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day')
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector(q('row-slipway')); await p.waitForTimeout(1200)
}
export const esc = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(350) }
export async function dragCells(p, a, b) {
  const A = await p.locator(q(a)).boundingBox(), B = await p.locator(q(b)).boundingBox()
  await p.mouse.move(A.x + 6, A.y + 6); await p.mouse.down(); await p.mouse.move(B.x + 6, B.y + 6, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(500)
}
// A mark drawn ON the element (outline) with a numbered tag pinned to it — it moves with the element (observation 617).
export async function mark(p, sel, label, opts = {}) {
  const ok = await p.evaluate(([sel, label, PINK, o]) => {
    const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
    const el = els[o.nth || 0]; if (!el) return false
    el.classList.add('zz-marked'); el.style.outline = `3px solid ${PINK}`; el.style.outlineOffset = (o.off ?? 2) + 'px'
    const r = el.getBoundingClientRect()
    const tag = document.createElement('div'); tag.className = 'zz-tag'; tag.textContent = label
    const fixed = getComputedStyle(el).position === 'fixed' || el.closest('[role=dialog],.bidsheet,.zz-fixed')
    Object.assign(tag.style, { position: fixed ? 'fixed' : 'absolute', left: (o.num ? Math.min(innerWidth - 22, r.right - 12) : o.right ? r.right + 10 : Math.max(4, r.left - (o.off ?? 2))) + (fixed ? 0 : scrollX) + 'px', top: Math.max(2, (o.num ? r.top - 10 : o.right ? r.top + r.height / 2 - 12 : o.below ? r.bottom + 6 : r.top - 26) + (fixed ? 0 : scrollY)) + 'px', borderRadius: o.num ? '11px' : '6px', minWidth: o.num ? '12px' : '', textAlign: 'center', boxShadow: '0 0 0 2px #0b0d10', background: PINK, color: '#fff', font: '700 13px/1 system-ui,sans-serif', padding: o.num ? '4px 6px' : '5px 8px', whiteSpace: 'nowrap', zIndex: 2147483647, pointerEvents: 'none', maxWidth: '92vw', overflow: 'hidden', textOverflow: 'ellipsis' })
    // inside the phone's zoomed grid a rect reads unzoomed: the tag rides inside the element instead
    if (el.closest('.mx-wrap, .mxband')) {
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
      Object.assign(tag.style, { position: 'absolute', left: o.num ? 'auto' : '-3px', right: o.num ? '-8px' : 'auto', top: o.below ? 'calc(100% + 4px)' : '-22px' })
      el.appendChild(tag); return true
    }
    document.body.appendChild(tag); return true
  }, [sel, label, PINK, opts])
  if (!ok) console.warn('MARK MISSED:', sel, label)
  return ok
}
export const unmark = p => p.evaluate(() => { document.querySelectorAll('.zz-tag').forEach(n => n.remove()); document.querySelectorAll('.zz-marked').forEach(n => { n.style.outline = ''; n.style.outlineOffset = ''; n.classList.remove('zz-marked') }) })
export const shot = async (p, name, opts = {}) => { await p.waitForTimeout(250); await p.screenshot({ path: join(OUT, name + '.png'), ...opts }); console.log('shot', name) }
export const toDay = (p, id, inline = 'center') => p.evaluate(([id, inline]) => { const e = document.querySelector(`[data-testid="${id}"]`); e?.scrollIntoView({ block: 'nearest', inline }); window.scrollTo(0, 0) }, [id, inline])
// the grid's own horizontal scroller, set so a date sits just right of the frozen columns
export const gridTo = async (p, date, row = 'bane') => {
  // the year's own sideways scroller (.mx-wrap): a rect inside the phone's zoomed grid is read unzoomed, so the frozen
  // band's right edge (drawn outside the zoom) is divided by the zoom before comparing
  let d = 999
  for (let i = 0; i < 6 && Math.abs(d) > 2; i++) {
    d = await p.evaluate(([date, row]) => {
      const c = document.querySelector(`[data-testid="cell-${row}-${date}"]`); if (!c) return 0
      const s = c.closest('.mx-wrap'); const z = parseFloat(getComputedStyle(c.closest('table')).zoom) || 1
      const band = document.querySelector('.mxband')
      const fr = band && getComputedStyle(band).display !== 'none' ? band.getBoundingClientRect().right / z
        : [...c.parentElement.children].filter(td => getComputedStyle(td).position === 'sticky').reduce((m, td) => Math.max(m, td.getBoundingClientRect().right), 0)
      const dd = c.getBoundingClientRect().left - fr - 1
      s.scrollLeft += dd
      return dd
    }, [date, row])
    await p.waitForTimeout(400)
  }
  await p.mouse.move(2, 2); await p.waitForTimeout(150)
  return Math.round(d)
}
