// Re-walker RW1 (one-rule re-walk, 12 Oct 26): my helpers. Imports the first walk's helpers (read-only use), own picture folder.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
export * from './or-B-lib2.mjs'
import { CHROMIUM } from './or-B-lib2.mjs'
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'

export const OUTP = 'docs/img/handpass/2026-10-12-one-rule/RW1'
mkdirSync(OUTP, { recursive: true })
export const shotP = async (p, name, clip) => { await p.screenshot({ path: join(OUTP, name + '.png'), ...(clip ? { clip } : {}) }); return name + '.png' }
export const toastNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || '').trim() + ' [op ' + t.style.opacity + ']' : '' })
export const waitQuiet = async p => { for (let i = 0; i < 30; i++) { const o = await p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.style.opacity : '0' }); if (o !== '1') return; await p.waitForTimeout(400) } }
export const undoTitle = p => p.evaluate(() => { const vis = id => { const b = document.getElementById(id); return b && b.offsetParent ? { id, title: b.getAttribute('title'), disabled: b.disabled } : null }; return vis('sbUndo') || vis('undoBtn') })
export const log = (...a) => console.log(a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '))
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const toastBoxOf = p => p.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return null
  const r = t.getBoundingClientRect(), cs = getComputedStyle(t), W = window.innerWidth, H = window.innerHeight
  return { text: (t.innerText || '').trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom), vw: W, vh: H, inside: r.x >= 0 && r.right <= W && r.y >= 0 && r.bottom <= H, op: t.style.opacity, overflowX: t.scrollWidth > t.clientWidth + 1, overflowY: t.scrollHeight > t.clientHeight + 1 }
})
