// Round 19c (22 Oct 26), his "Is it helpful to show manning 1 short? If there are multiple shorts. And short is for amber
// or red" on round 19's Manning button (picture 4). What today's app does (Chrome.tsx, the under-manned chip): it counts
// the days where a Manning rule is RED, and a tap OPENS A LIST of those days ("Days breaking a manning rule"), each with
// the rule and the figure that broke it; a tap on a line jumps the grid there. Amber is not counted.
// Two ways drawn on round 19's admin phone, the list open:
//   r19c-short-red      A: the right half counts the red days only, "1 red ›", the list names each (amber stays a colour)
//   r19c-short-both     B: red and amber counted apart, "1 red · N amber ›", the list red first, then amber
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r19c-short.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, UNDER } from './full-r7-one.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state }, ['stage'])
// round 19's own top, read between markers, unchanged
const N = load(cut(SRC('full-r19-nav.mjs'), 'const IC = {', 'const res = {}'), { newPage, signIn, DC, state, browser }, ['page', 'draw'])

// the year's red and amber days on the sample squadron, as round 7's one setup marks them (desktop: the whole year drawn)
let days
{
  const { ctx, p } = await N.page(1536, 860, false, 'admin')
  days = await p.evaluate(() => {
    const pick = cls => [...document.querySelectorAll(`#page-leavewar td.${cls}[data-testid^="avail-p-"]`)].map(td => [td.dataset.testid.slice(-10), td.textContent.trim()])
    return { red: pick('zz-red'), amb: pick('zz-amb') }
  })
  await ctx.close()
}
console.log('red', days.red.length, 'amber', days.amb.length, JSON.stringify(days))

const LCSS = `
.zz-ul{position:fixed;z-index:95;width:300px;background:#161b22;border:1px solid #2f3a46;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.6);padding:6px;font:13.5px system-ui;color:#e6edf3}
.zz-ul .hd{padding:6px 10px 8px;color:#9aa5b1;font:700 11px system-ui;letter-spacing:.1em;text-transform:uppercase}
.zz-ul .ln{display:grid;grid-template-columns:88px 1fr auto;align-items:center;gap:8px;height:38px;padding:0 10px;border-radius:8px}
.zz-ul .ln .d{font-weight:700}
.zz-ul .ln .w{color:#c9d1d9}
.zz-ul .ln b{font-variant-numeric:tabular-nums}
.zz-ul .red{color:#FF7A82}.zz-ul .amb{color:#F2B84B}
.zz-ul .ch{color:#5fd0e6;font-weight:700}
.zz-ul hr{border:0;border-top:1px solid #2a313a;margin:4px 6px}
#page-leavewar .zz-short b.r{color:#FF7A82}#page-leavewar .zz-short b.a{color:#F2B84B}
`
const fmt = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')
for (const v of ['red', 'both']) {
  const { ctx, p } = await N.page(390, 844, true, 'admin')
  await N.draw(p, true, false)
  await p.evaluate(([css, v, days, lines]) => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
    const sh = document.querySelector('[data-zz="short"]')
    sh.innerHTML = v === 'red' ? `<b class="r">${days.red.length}</b> red <i>›</i>` : `<b class="r">${days.red.length}</b> red · <b class="a">${days.amb.length}</b> amber <i>›</i>`
    const R = document.querySelector('[data-zz="manning"]').getBoundingClientRect()
    const ul = document.createElement('div'); ul.className = 'zz-ul'; ul.setAttribute('data-zz', 'ulist')
    ul.innerHTML = `<div class="hd">${v === 'red' ? 'Days under-manned' : 'Days under-manned, then tight'}</div>` + lines
    Object.assign(ul.style, { left: R.left + 'px', top: (R.bottom + 6) + 'px' }); document.body.appendChild(ul)
  }, [LCSS, v, days, [
    ...days.red.map(([d, f]) => `<div class="ln"><span class="d">${fmt(d)}</span><span class="w">Available P <b class="red">${f}</b> of 24</span><span class="ch">›</span></div>`),
    ...(v === 'both' ? ['<hr>', ...days.amb.slice(0, 5).map(([d, f]) => `<div class="ln"><span class="d">${fmt(d)}</span><span class="w">Available P <b class="amb">${f}</b> of 24</span><span class="ch">›</span></div>`),
      days.amb.length > 5 ? `<div class="ln"><span class="w" style="grid-column:1/-1;color:#9aa5b1">and ${days.amb.length - 5} more</span></div>` : ''] : []),
  ].join('')])
  const over = await p.evaluate(() => { const b = document.querySelector('.zz-bar'); return b.scrollWidth - b.clientWidth })
  console.log(v, 'bar overflow', over)
  await mk(p, '[data-zz="short"]', v === 'red' ? 'A' : 'B', { prefer: ['ne'] })
  await p.mouse.move(2, 2)
  await shot(p, 'r19c-short-' + v, { clip: { x: 0, y: 0, width: 390, height: v === 'red' ? 330 : 560 } })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
