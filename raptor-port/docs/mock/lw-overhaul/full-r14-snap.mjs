// Round 14 (22 Oct 26): a standalone copy of round 13's LVE tile, unlocked and locked, for the design skill's
// automatic checker (Impeccable's detect.mjs reads markup files, not a running page). Each file holds the person
// window's Balances block as the real build draws it, with every stylesheet the page had inlined. Nothing is built.
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r14-snap.mjs
//   -> <scratch>/out/r14-snap-unlocked.html, r14-snap-locked.html
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, q, errs, OUT, gridTo, shot } from './full-lib.mjs'
import { oneStage, mk, unmk, MGMT } from './full-r7-one.mjs'
import { LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H as WH, fill as WFILL } from './full-win-a-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const PR = load(cut(SRC('full-r7-person.mjs'), 'const CHEV', '// ---------- r7-20'),
  { oneStage, mk, unmk, MGMT, LOCK_SVG, CLIP_SVG, H: WH, fill: WFILL, q, gridTo, shot, newPage, signIn, browser, state },
  ['stage', 'gridAsBuilt', 'openPerson', 'personHTML', 'placePhone', 'ME', 'kb', 'LOCKI'])
// round 13's own tile code, read between its markers and run unchanged
const R13 = load(cut(SRC('full-r13-lve.mjs'), 'const CSS = `', "if (want('unlocked'))"),
  { PR, mk, newPage, signIn, browser, state, shot, OUT, readFileSync, join },
  ['scene'])

for (const locked of [false, true]) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await R13.scene(p, { locked })
  const html = await p.evaluate(() => {
    const css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\n') } catch { return '' } }).join('\n')
    const sheet = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop()
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LVE tile</title><style>${css}</style></head><body><div id="page-leavewar">${sheet.outerHTML}</div></body></html>`
  })
  writeFileSync(join(OUT, `r14-snap-${locked ? 'locked' : 'unlocked'}.html`), html)
  console.log('wrote', locked ? 'locked' : 'unlocked', html.length)
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
