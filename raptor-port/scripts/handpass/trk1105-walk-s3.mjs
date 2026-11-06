/* S3 — ?fresh=1 keeps the session in memory and leaves the browser's storage untouched (D admin).
     node scripts/handpass/trk1105-walk-s3.mjs */
import { open, back, keys, diffKeys, classify, ocuAny, words, pair, grade, mark, addFirst, exportFile, shot, mk, sleep, click, D, BASE } from './trk1105-walk-lib.mjs'
import { readFileSync } from 'node:fs'
console.log('trk1105-walk-s3 v1')
const L = mk('S3')
const { browser, ctx, page, errors } = await open({})
await mark(page, 'ST-02', 'dco', false)     // the stored world
await sleep(1500)
const stored = await keys(page)
await page.close()
const f = await ctx.newPage()
const ferr = []
f.on('console', m => { if (m.type() === 'error') ferr.push(m.text()) }); f.on('pageerror', e => ferr.push('PAGEERROR ' + e.message)); f.on('response', r => { if (r.status() >= 400) ferr.push('HTTP ' + r.status() + ' ' + r.url()) })
await f.goto(BASE + '/?fresh=1')
const { login, toTracker } = await import('./trk1105-walk-lib.mjs')
await login(f, 'a'); await toTracker(f, false)
const k0 = await keys(f)
await mark(f, 'ST-01', 'dco', false); await mark(f, 'ST-03', 'dco', false)
const g = [await grade(f, 'ST-01'), await grade(f, 'ST-03')]
const who = await addFirst(f, false)
const w = await words(f); const pr = await pair(f)
const pic = await shot(f, 'S3-fresh-session')
L.ok('fresh session: the two marks show and a student was added', 'D', 'admin', g[0] === 'dco' && g[1] === 'dco', `grades ${g}, added ${who}, corner "${w.corner}"`, pic)
L.ok('fresh session: the top bar ↶ is lit (undo works in this mode)', 'D', 'admin', pr.undoOff === false, JSON.stringify(pr))
await f.locator('.topbar #trUndoBtn').click(); await sleep(600)
const gAfter = await grade(f, 'ST-03')
L.ok('fresh session: ↶ takes the last mark (ST-03) back', 'D', 'admin', gAfter !== 'dco', 'ST-03 grade after ↶: ' + gAfter + '; student list ' + (await f.locator('#activeSel option').allInnerTexts()).join('/'))
let file = null
try { file = await exportFile(f, 'S3-fresh-export.json') } catch (e) { L.ok('fresh session: Export', 'D', 'admin', false, e.message) }
if (file) { const j = JSON.parse(readFileSync(file, 'utf8')); L.ok('fresh session: Export file parses', 'D', 'admin', !!j, 'top keys ' + Object.keys(j).slice(0, 8).join(',')) }
const k1 = await keys(f)
const ch = diffKeys(k0, k1), cl = classify(ch)
const trackerChanged = cl.tracker.length, fromStored = diffKeys(stored, k1)
L.ok('fresh session: no raptor:tracker/ key changed, no ocu: key, vs the stored world', 'D', 'admin', cl.tracker.length === 0 && cl.ocu.length === 0 && ocuAny(k1).length === 0, `changes since fresh-open: ${JSON.stringify(cl).slice(0, 400)}`)
L.note('storage vs the stored world before the fresh session (all keys)', JSON.stringify(classify(fromStored)).slice(0, 600))
L.note('ocuLocal moved in fresh session?', cl.ocuLocal.length ? 'yes: ' + cl.ocuLocal.join(',') : 'no')
L.note('fresh errors', ferr.join(' | ') || 'none')
await f.close()
const n = await ctx.newPage()
await n.goto(BASE + '/'); await back(n, 'a', false)
const g2 = [await grade(n, 'ST-02'), await grade(n, 'ST-01'), await grade(n, 'ST-03')]
const opts = await n.locator('#activeSel option').allInnerTexts()
const pic2 = await shot(n, 'S3-normal-after')
L.ok('normal open after: the stored mark (ST-02) is back and the fresh marks are not', 'D', 'admin', g2[0] === 'dco' && g2[1] !== 'dco' && g2[2] !== 'dco', `grades ST-02,ST-01,ST-03 = ${g2}; students ${opts.join('/')}`, pic2)
L.note('errors', errors.join(' | ') || 'none')
await browser.close()
L.save('S3')
