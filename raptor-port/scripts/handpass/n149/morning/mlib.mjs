// The owner's morning page, 23 Nov 26 — pictures of the real app at deviceScaleFactor 2, each cut to what it is about,
// the place marked by a ring (a positioned outline element laid over it just before the shot, removed after — never a
// glow). Built on the FULL walk's helpers (../walk/lib.mjs) and the re-walk's (../rewalk/rlib.mjs).
// Run from raptor-port/ with the build in dist/: MQ_PORT=<a free port> MQ_PICS=<the pictures' folder>
// MQ_OUT=<raw facts, outside the checkout> MQ_RAW=<the same> node <script>
import { writeFileSync } from 'node:fs'
import { newPage as baseNew, facts, note } from '../walk/lib.mjs'

export const DIR = process.env.MQ_PICS   // the pictures' folder; MQ_OUT (the walk's raw facts) and MQ_RAW stay outside the checkout
export const manifest = []   // [file, what it shows, size]
export async function newPage(sz) { return baseNew(sz, sz === 'd' ? { deviceScaleFactor: 2 } : {}) }

const box = async (s, t) => {
  const l = typeof t === 'string' ? s.page.locator(t).filter({ visible: true }).first() : t
  if (!(await l.count())) return null
  await l.scrollIntoViewIfNeeded().catch(() => {})
  return l.boundingBox()
}
const union = bs => {
  const v = bs.filter(Boolean); if (!v.length) return null
  const L = Math.min(...v.map(b => b.x)), T = Math.min(...v.map(b => b.y)), R = Math.max(...v.map(b => b.x + b.width)), B = Math.max(...v.map(b => b.y + b.height))
  return { x: L, y: T, width: R - L, height: B - T }
}
/* ring: what to mark (selectors or locators); clip: what the picture is about (selectors or locators, the ring added);
   pad: room around the cut; whole: a whole-screen picture with the ring */
export async function ringShot(s, file, { ring, rings, clip = [], pad = 16, whole = false, what, size }) {
  const { page } = s
  await page.mouse.move(1, 1).catch(() => {})
  const groups = rings || (ring ? [ring] : [])
  const rbs = []
  for (const g of groups) rbs.push(union(await Promise.all(g.map(t => box(s, t)))))
  const rb = union(rbs)
  if (groups.length && rbs.some(r => !r)) note(`[${s.sz}] ${file}: a ring found nothing`)
  for (const r of rbs.filter(Boolean)) await page.evaluate(r => {
    const d = document.createElement('div'); d.className = 'mRing'
    Object.assign(d.style, { position: 'fixed', left: `${r.x - 5}px`, top: `${r.y - 5}px`, width: `${r.width + 10}px`, height: `${r.height + 10}px`, border: '3px solid #ff3b30', borderRadius: '10px', boxSizing: 'border-box', pointerEvents: 'none', zIndex: '2147483647' })
    document.body.appendChild(d)
  }, r)
  await page.waitForTimeout(120)
  let cut = null
  if (!whole) {
    const cb = union([rb && { x: rb.x - 8, y: rb.y - 8, width: rb.width + 16, height: rb.height + 16 }, ...(await Promise.all(clip.map(t => box(s, t))))])
    if (cb) {
      const vp = page.viewportSize()
      const x = Math.max(0, cb.x - pad), y = Math.max(0, cb.y - pad)
      cut = { x, y, width: Math.min(vp.width, cb.x + cb.width + pad) - x, height: Math.min(vp.height, cb.y + cb.height + pad) - y }
    }
  }
  await page.screenshot({ path: `${DIR}/${file}`, ...(cut ? { clip: cut } : {}) })
  await page.evaluate(() => document.querySelectorAll('.mRing').forEach(e => e.remove()))
  manifest.push([file, what, size || (s.desk ? 'desktop 1536 × 864' : 'phone 402 × 874')])
  facts[file] = { ring: rbs.filter(Boolean).length, cut }
}
/* the manifest lines this script made, kept outside the checkout (MQ_RAW) for the sheet */
export function saveManifest(name) {
  writeFileSync(`${process.env.MQ_RAW}/${name}-manifest.json`, JSON.stringify(manifest, null, 1))
}
export const byText = (s, sel, re) => s.page.locator(sel).filter({ hasText: re }).filter({ visible: true }).first()
