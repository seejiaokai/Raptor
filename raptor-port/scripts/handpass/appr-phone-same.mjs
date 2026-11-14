// THE PHONE STAYS AS IT IS TODAY (13 Nov 26, [APPROVALS-SCROLL-INSIDE], D2006's phone half): the Approvals page measured at his
// iPhone's 402 × 874, in WebKit and Chromium, on the build of `main` and on this branch's — every part's box, the page's
// height, the window's room to scroll, whether a box scrolls inside it, and the same with "Pick dates…" open — written as
// text and compared line for line (walk-scripts §8: when nothing on screen should change). The words of "since you last
// looked" carry the clock and are left out.
//   cd raptor-port ; APPR_DIST=<any built folder> APPR_OUT=<picture folder> APPR_BEFORE=<main's build> APPR_AFTER=<branch build>
//   node scripts/handpass/appr-phone-same.mjs
import path from 'node:path'
import { writeFileSync } from 'node:fs'
import { webkit, chromium, devices, LAUNCH, ORIGIN, OUT, PAGE, T, sleep, stageWorld, watchErrors } from './appr-pc-lib.mjs'
import { serveDist } from '../drawcheck/lib.mjs'

console.log('[appr-phone-same v1]')
const BEFORE = process.env.APPR_BEFORE, AFTER = process.env.APPR_AFTER
if (!BEFORE || !AFTER) throw new Error('APPR_BEFORE and APPR_AFTER must name built folders')

const measure = page => page.evaluate(sel => {
  const b = e => { const r = e.getBoundingClientRect(); return [r.left, r.top + scrollY, r.width, r.height].map(n => Math.round(n * 10) / 10).join(',') }
  const pg = document.querySelector(sel), se = document.scrollingElement
  const out = [`window room ${se.scrollHeight - se.clientHeight}`, `page style height "${pg.style.height}"`, `body "${document.body.className}"`,
    `box that scrolls: ${pg.querySelector('[data-testid="appr-scroll"]') ? 'YES' : 'none'}`]
  for (const e of pg.querySelectorAll('.appr-card, .appr-head, .appr-filters, .appr-filters > *, .appr-pickpop, .appr-list, .appr-cols, [data-testid^="appr-line-"], .appr-also'))
    out.push(`${e.dataset.testid || e.className} ${b(e)}`)
  return out
}, PAGE)

async function run(engine, dist, tag) {
  const eng = engine === 'webkit' ? webkit : chromium
  const browser = await eng.launch(engine === 'webkit' ? {} : LAUNCH)
  const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
  process.env.APPR_DIST = dist
  await serveDist(ctx, ORIGIN, dist)
  const page = await ctx.newPage(); const errs = []; watchErrors(page, errs)
  const n = await stageWorld(page)
  await page.evaluate(() => scrollTo(0, 0)); await sleep(300)
  const shut = await measure(page)
  if (OUT) await page.screenshot({ path: path.join(OUT, `phone-${engine}-${tag}.png`), fullPage: true })
  await page.locator(T('appr-pick')).click(); await sleep(400)
  const open = await measure(page)
  if (OUT) await page.screenshot({ path: path.join(OUT, `phone-${engine}-${tag}-pick.png`) })
  await browser.close()
  return { n, lines: [`lines ${n}`, ...shut, '— Pick dates… open —', ...open], errs }
}

const log = []; let diff = 0
for (const engine of ['webkit', 'chromium']) {
  const a = await run(engine, BEFORE, 'main'), b = await run(engine, AFTER, 'branch')
  const len = Math.max(a.lines.length, b.lines.length)
  let d = 0
  for (let i = 0; i < len; i++) if (a.lines[i] !== b.lines[i]) { d++; log.push(`${engine} DIFF main: ${a.lines[i]}  |  branch: ${b.lines[i]}`) }
  log.push(`${engine}: ${a.lines.length} lines measured on main, ${b.lines.length} on the branch — ${d ? d + ' DIFFER' : 'IDENTICAL'}; errors main ${a.errs.length}, branch ${b.errs.length}`)
  if (OUT) writeFileSync(path.join(OUT, `phone-${engine}-measures.txt`), ['main:', ...a.lines, '', 'branch:', ...b.lines].join('\n') + '\n')
  diff += d
}
log.forEach(l => console.log(l))
if (OUT) writeFileSync(path.join(OUT, 'phone-same-log.txt'), log.join('\n') + '\n')
process.exit(diff ? 1 : 0)
