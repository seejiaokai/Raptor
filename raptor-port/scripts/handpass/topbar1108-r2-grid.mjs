// D1873 re-walk (host, chat 16, 8 Nov 26): does the Leave War grid at rest land differently with the fixed bar, or is it
// run-to-run noise? Alternates the build before the top-bar work (b0968d50d) and the build after (dist), several runs
// each, at the phone (WebKit 402x874 @3) and the desktop (Chromium 1536x900 @1.25), reading each day column's x and width.
// Usage (under the checks lock, after npm run build): node scripts/handpass/topbar1108-r2-grid.mjs [runs] [beforeDist]
// Never write a walk's scripts or evidence under test-results/: every Playwright run empties it.
import { open, tab } from './topbar1108-lib.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
const RUNS = Number(process.argv[2] || 4)
const BEFORE = process.argv[3] || 'C:/Users/User/AppData/Local/Temp/raptor-topbar-r2-ffbf07/raptor-port/dist'
const AFTER = 'dist'
const out = 'docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/topbar/R2'; mkdirSync(out, { recursive: true })
const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
const rec = []
for (const [size, engine, w, h, dsf] of [['phone', 'webkit', 402, 874, 3], ['desk', 'chromium', 1536, 900, 1.25]]) {
  for (let i = 0; i < RUNS; i++) for (const tag of ['before', 'after']) {
    const { br, p, errs } = await open({ dist: tag === 'before' ? BEFORE : AFTER, engine, w, h, dsf, clock: true })
    try {
      await p.addStyleTag({ content: QUIET })
      await tab(p, 'leavewar', true)
      await p.waitForSelector('.mx-wrap .mxhead .day')
      await p.clock.runFor(3000)
      const st = await p.evaluate(() => {
        const bar = document.querySelector('#shell>.topbar').getBoundingClientRect()
        const wrap = document.querySelector('.mx-wrap')
        const days = [...document.querySelectorAll('.mx-wrap .mxhead .day')].filter(e => e.dataset.d >= '2026-07-13' && e.dataset.d <= '2026-07-26')
          .map(e => { const r = e.getBoundingClientRect(); return { d: e.dataset.d, x: +r.x.toFixed(3), w: +r.width.toFixed(3) } })
        const first = document.querySelector('.mx-wrap tbody tr')?.getBoundingClientRect()
        return { barH: bar.height, topbarH: document.documentElement.style.getPropertyValue('--topbar-h'), scrollbar: innerWidth - document.documentElement.clientWidth,
          wrapLeft: wrap?.scrollLeft, wrapTop: +wrap?.getBoundingClientRect().top.toFixed(3), table: +document.querySelector('.mx-wrap>table')?.getBoundingClientRect().width.toFixed(3),
          firstRowY: first ? +first.y.toFixed(3) : null, days }
      })
      rec.push({ size, tag, i, st, errs: errs.slice(0, 3) })
      console.log(size, tag, i, 'bar', st.barH, 'table', st.table, 'scrollLeft', st.wrapLeft, 'row1', st.firstRowY, 'day0', JSON.stringify(st.days[0]), 'errs', errs.length)
    } finally { await br.close() }
  }
}
// the spread of each measure within before and within after, and whether every shape seen after was also seen before
const sum = {}
for (const size of ['phone', 'desk']) {
  const of = tag => rec.filter(r => r.size === size && r.tag === tag)
  const key = r => JSON.stringify({ table: r.st.table, row1: r.st.firstRowY, top: r.st.wrapTop, left: r.st.wrapLeft, days: r.st.days.map(d => [d.x, d.w]) })
  const b = new Set(of('before').map(key)), a = new Set(of('after').map(key))
  const range = (tag, f) => { const v = of(tag).map(f); return [Math.min(...v), Math.max(...v)] }
  sum[size] = {
    beforeShapes: b.size, afterShapes: a.size, afterAllSeenBefore: [...a].every(k => b.has(k)),
    table: { before: range('before', r => r.st.table), after: range('after', r => r.st.table) },
    row1: { before: range('before', r => r.st.firstRowY), after: range('after', r => r.st.firstRowY) },
    day0x: { before: range('before', r => r.st.days[0]?.x), after: range('after', r => r.st.days[0]?.x) },
    day0w: { before: range('before', r => r.st.days[0]?.w), after: range('after', r => r.st.days[0]?.w) },
    lastx: { before: range('before', r => r.st.days.at(-1)?.x), after: range('after', r => r.st.days.at(-1)?.x) },
    errors: rec.filter(r => r.size === size && r.errs.length).length,
  }
}
console.log(JSON.stringify(sum, null, 1))
writeFileSync(`${out}/grid-xs.json`, JSON.stringify({ summary: sum, runs: rec }, null, 2))
