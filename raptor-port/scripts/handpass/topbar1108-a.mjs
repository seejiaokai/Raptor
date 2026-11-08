// Part A of the top-bar-fixed walk (D1873): every page at scroll 0, build BEFORE (twice) against build AFTER, pixel for pixel.
// Method: scripts/handpass/rss1108-same.mjs (walk-scripts §8). Usage: node scripts/handpass/topbar1108-a.mjs [only,names]
import { chromium, LAUNCH, DIST_BEFORE, DIST_AFTER, open, press, tab, V } from './topbar1108-lib.mjs'
import { pictureDiff } from '../drawcheck/lib.mjs'
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('[topbar1108-a v1]')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const out = path.join(root, 'docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/topbar/A')
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true })
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
const T = (p, pg) => tab(p, pg, true)
const P = (p, s) => press(p, s, true)
const SCREENS = [
  ['view', async p => { await T(p, 'viewsched') }],
  ['edit', async p => { await T(p, 'editsched') }],
  ['board', async p => { await T(p, 'editsched'); await P(p, '#eWeek .sb-open[data-sbday="0"]'); await p.clock.runFor(900) }],
  ['inputs-list', async p => { await T(p, 'inputs'); if (await p.locator(V('#inListBtn')).count()) await P(p, '#inListBtn') }],
  ['inputs-cal', async p => { await T(p, 'inputs'); await P(p, '#inCalBtn') }],
  ['quals', async p => { await T(p, 'quals') }],
  ['lw-grid', async p => { await T(p, 'leavewar') }],
  ['lw-approvals', async p => { await T(p, 'leavewar'); await P(p, '[data-testid="lw-tab-approvals"]'); await p.clock.runFor(700) }],
  ['lw-balances', async p => { await T(p, 'leavewar'); await P(p, '[data-testid="lw-tab-balances"]'); await p.clock.runFor(700) }],
  ['lw-oil', async p => { await T(p, 'leavewar'); await P(p, '[data-testid="oil-tracker"]'); await p.clock.runFor(700) }],
  ['tracker', async p => { await T(p, 'tracker'); await p.clock.runFor(1500) }],
  ['logic', async p => { await T(p, 'logic') }],
  ['admin', async p => { await T(p, 'admin') }],
  ['help', async p => { await T(p, 'help') }],
]
const record = {}
async function shoot(dist, tag) {
  const pics = {}
  for (const [size, engine] of [['desk', 'chromium'], ['phone', 'webkit']]) {
    for (const [name, reach] of SCREENS) {
      if (ONLY.length && !ONLY.includes(name)) continue
      const phone = size === 'phone'
      const { br, p, errs } = await open({ dist, engine, w: phone ? 402 : 1536, h: phone ? 874 : 900, dsf: phone ? 3 : 1.25, clock: true })
      let reached = true, why = ''
      try { await p.addStyleTag({ content: QUIET }).catch(() => {}); await reach(p) } catch (e) { reached = false; why = e.message.split('\n')[0]; console.log(`  ${tag} ${size} ${name}: could not reach — ${why}`) }
      await p.clock.runFor(1500)
      const f = path.join(out, `${tag}-${size}-${name}.png`)
      await p.screenshot({ path: f })
      const st = await p.evaluate(() => { const b = document.querySelector('#shell > .topbar'); const r = b.getBoundingClientRect(); return { barTop: r.top, barH: r.height, pos: getComputedStyle(b).position, pages: [...document.querySelectorAll('[id^=page-]')].filter(e => e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden').map(e => e.id), board: !!document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetParent !== null } })
      pics[`${size}-${name}`] = f
      ;(record[`${size}-${name}`] ||= {})[tag] = { reached, why, st, errors: errs.slice(0, 4) }
      if (errs.length) console.log(`  ${tag} ${size} ${name}: errors — ${errs.slice(0, 2).join(' | ')}`)
      await br.close()
    }
  }
  return pics
}
const A = await shoot(DIST_BEFORE, 'before'), A2 = await shoot(DIST_BEFORE, 'before-again'), B = await shoot(DIST_AFTER, 'after')
const cmp = await chromium.launch(LAUNCH)
// a marked side-by-side: before | after | difference marked red
async function sideBySide(a, b, f) {
  const pg = await (await cmp.newContext()).newPage()
  const url = x => 'data:image/png;base64,' + readFileSync(x).toString('base64')
  const data = await pg.evaluate(async ([ua, ub]) => {
    const load = s => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = s })
    const [A, B] = await Promise.all([load(ua), load(ub)]); const W = A.width, H = A.height
    const c = document.createElement('canvas'); c.width = W * 3 + 20; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#888'; g.fillRect(0, 0, c.width, c.height)
    g.drawImage(A, 0, 0); g.drawImage(B, W + 10, 0)
    const ca = document.createElement('canvas'); ca.width = W; ca.height = H; const ga = ca.getContext('2d'); ga.drawImage(A, 0, 0); const da = ga.getImageData(0, 0, W, H)
    const cb = document.createElement('canvas'); cb.width = W; cb.height = H; const gb = cb.getContext('2d'); gb.drawImage(B, 0, 0); const db = gb.getImageData(0, 0, W, H)
    const o = g.createImageData(W, H)
    for (let i = 0; i < da.data.length; i += 4) { const d = Math.abs(da.data[i] - db.data[i]) > 24 || Math.abs(da.data[i + 1] - db.data[i + 1]) > 24 || Math.abs(da.data[i + 2] - db.data[i + 2]) > 24; o.data[i] = d ? 255 : 235; o.data[i + 1] = d ? 0 : 235; o.data[i + 2] = d ? 0 : 235; o.data[i + 3] = 255 }
    g.putImageData(o, 2 * W + 20, 0)
    return c.toDataURL('image/png').split(',')[1]
  }, [url(a), url(b)])
  writeFileSync(f, Buffer.from(data, 'base64')); await pg.context().close()
}
let same = 0, diff = 0, noise = 0
for (const k of Object.keys(A)) {
  const self = await pictureDiff(cmp, A[k], A2[k]), d = await pictureDiff(cmp, A[k], B[k])
  const ok = d.same !== false && !(d.share > 0)
  const verdict = ok ? 'SAME' : (self.same === false && d.pixels <= self.pixels * 1.5 ? 'NOISE' : 'DIFF')
  ok ? same++ : verdict === 'NOISE' ? noise++ : diff++
  record[k].self = self; record[k].diff = d; record[k].verdict = verdict
  if (!ok && d.size) await sideBySide(A[k], B[k], path.join(out, `SIDE-${k}.png`))
  console.log(`${verdict.padEnd(5)} ${k} before/before-again: ${JSON.stringify(self)} before/after: ${JSON.stringify(d)} afterState: ${JSON.stringify(record[k].after?.st)} reached: ${record[k].after?.reached}/${record[k].before?.reached}`)
}
await cmp.close()
writeFileSync(path.join(out, 'record.json'), JSON.stringify(record, null, 1))
console.log(`${same} same, ${noise} noise, ${diff} differ`)
