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
    Object.assign(tag.style, { position: fixed ? 'fixed' : 'absolute', left: Math.max(4, r.left + (fixed ? 0 : scrollX) - (o.off ?? 2)) + 'px', top: Math.max(2, (o.below ? r.bottom + 6 : r.top - 26) + (fixed ? 0 : scrollY)) + 'px', background: PINK, color: '#fff', font: '700 13px/1 system-ui,sans-serif', padding: '5px 8px', borderRadius: '6px', whiteSpace: 'nowrap', zIndex: 2147483647, pointerEvents: 'none', maxWidth: '92vw', overflow: 'hidden', textOverflow: 'ellipsis' })
    document.body.appendChild(tag); return true
  }, [sel, label, PINK, opts])
  if (!ok) console.warn('MARK MISSED:', sel, label)
  return ok
}
export const unmark = p => p.evaluate(() => { document.querySelectorAll('.zz-tag').forEach(n => n.remove()); document.querySelectorAll('.zz-marked').forEach(n => { n.style.outline = ''; n.style.outlineOffset = ''; n.classList.remove('zz-marked') }) })
export const shot = async (p, name, opts = {}) => { await p.waitForTimeout(250); await p.screenshot({ path: join(OUT, name + '.png'), ...opts }); console.log('shot', name) }
