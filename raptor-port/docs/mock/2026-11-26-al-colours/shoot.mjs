/* The pictures of the REAL running app for the AL colours page: the staged Monday (stage.mjs) on Edit Schedule, View-only
   Sched and the Scheduler Board, at a desktop's size (1536, Chromium, 2x) and his iPhone's (402 x 874, WebKit, 3x), each in
   three looks:
     a  today — the app as it draws itself, nothing added
     b  colour only — src/looks.css class alx-b + alx-pk-name on <html>, today's colours
     c  the recommendation — alx-c + alx-pk-tab, the proposed colours, and the NEW key line under the signed line
   Edit Schedule and the board are pictured with AL4 still waiting; View-only Sched with AL4 out (its published face never
   shows a waiting change). Nothing here builds.
     GW_URL=http://localhost:4817/ GW_STATE=<the folder stage.mjs wrote> node docs/mock/2026-11-26-al-colours/shoot.mjs */
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
const K = await import('../2026-11-25-guardrail-wording/kit.mjs')
const HERE = dirname(fileURLToPath(import.meta.url))
const IMG = join(HERE, 'img')
const CSS = readFileSync(join(HERE, 'src/looks.css'), 'utf8'), JS = readFileSync(join(HERE, 'src/looks.js'), 'utf8')
const DI = 0

async function setLook(p, look, root) {
  await p.evaluate(([look, root, CSS, JS]) => {
    if (!document.getElementById('alx-css')) { const s = document.createElement('style'); s.id = 'alx-css'; s.textContent = CSS; document.head.appendChild(s) }
    if (!window.ALX) (0, eval)(JS)
    const A = window.ALX
    document.getElementById('alx-pal')?.remove()
    document.querySelectorAll('.alx-key').forEach(k => k.remove())
    if (look === 'a') return A.look(document.documentElement, { look: 'a', puck: 'chip' })
    if (look === 'b') return A.look(document.documentElement, { look: 'b', puck: 'name' })
    A.palette(A.NEW); A.look(document.documentElement, { look: 'c', puck: 'tab' }); A.key(document.querySelector(root))
  }, [look, root, CSS, JS])
  await K.wait(p, 250)
}
/* bring the Common Programme to the top of what is on screen; return the box to cut the picture to */
async function frame(p, sz, root, anchor, cut) {
  return p.evaluate(([root, anchor, cut, phone]) => {
    const r = document.querySelector(root), a = r.querySelector(anchor)
    a.scrollIntoView({ block: 'start', inline: 'nearest' })
    /* leave room above the anchor for whatever is pinned over the page */
    let sc = a.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
    const up = phone ? 170 : 250; if (sc) sc.scrollTop -= up; else window.scrollBy(0, -up)
    const c = (cut ? r.querySelector(cut) || r : r).getBoundingClientRect()
    return { x: c.left, y: c.top, w: c.width, h: c.height }
  }, [root, anchor, cut, K.isPhone(sz)])
}
async function three(p, sz, name, root, anchor, cut) {
  for (const look of ['a', 'b', 'c']) {
    await setLook(p, look, root)
    const c = await frame(p, sz, root, anchor, cut); await K.wait(p, 350)
    const vw = sz.opts.viewport.width, vh = sz.opts.viewport.height
    const clip = K.isPhone(sz) ? { x: 0, y: 0, width: vw, height: vh }
      : { x: Math.max(0, c.x - 6), y: 130, width: Math.min(vw - Math.max(0, c.x - 6), Math.min(c.w + 12, 760)), height: vh - 130 - 40 }
    await p.screenshot({ path: join(IMG, `${name}-${look}-${sz.name}.png`), clip })
    K.log('  picture', `${name}-${look}-${sz.name}.png`)
  }
  await setLook(p, 'a', root)
}
for (const key of ['d', 'p']) {
  /* Edit Schedule and the board: AL4 waiting */
  let w = await K.world(key, join(K.STATE, 'alc-waiting.json')), p = w.p, sz = w.sz
  await K.signIn(p)
  await K.weekDay(p, sz, DI); await K.neutral(p)
  await three(p, sz, 'edit', `#eWeek .day[data-day="${DI}"]`, `[data-txt="dn:${DI}.0"]`, null)
  await K.board(p, sz, DI); await K.neutral(p)
  await three(p, sz, 'board', '#schedBoard', `[data-bfld="ap:${DI}.0.prog"]`, null)
  if (p.errs.length) K.log('ERRORS', p.errs.join(' | '))
  await w.b.close()
  /* View-only Sched: all four out */
  w = await K.world(key, join(K.STATE, 'alc-out.json')); p = w.p; sz = w.sz
  await K.signIn(p)
  await p.evaluate(di => { const d = document.querySelector(`#vWeek .day[data-day="${di}"]`); d && d.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollTo(0, 0) }, DI)
  await K.wait(p, 600)
  await three(p, sz, 'view', `#vWeek .day[data-day="${DI}"]`, `[data-txt="dn:${DI}.0"], .dnote, .sec`, null)
  if (p.errs.length) K.log('ERRORS', p.errs.join(' | '))
  await w.b.close()
}
