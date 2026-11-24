// type-c - case C: unsaved typing on a page, not in a window, then a pick of 149 by the top-bar list (and, on a phone, also
// by ☰'s list in its own browser): is the typing kept, lost or asked about? Then 142 picked back: is it there?
//   (users) Admin → Users, Saber's own row opened, words typed in its sign-in box (name@mail)
//   (sched) Edit Schedule, a day's note (a text you type straight onto the page), words typed, not left
//   (logic) Logic, its search box;  (quals) Quals, its filter box  - the only boxes those pages draw
//   node raptor-port/scripts/handpass/n166/type-c.mjs <d|402x874>   (ONLY=users,sched ...)
// No stand-ins. Pictures: C-<d|p>-<case>-*.png
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, pic, windowsNow, reachPick, wait, SZTAG } from './lib.mjs'
const SZ = process.argv[2] || 'd', T = SZTAG(SZ)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const WORDS = 'N166C words'
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
async function hit(s, l, ms = 400) { l = typeof l === 'string' ? vis(s, l).first() : l; await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }); await wait(s, ms) }
/* the box: where to go, how to open, what to type into, how to read it back */
const C = {
  users: { go: 'admin', open: async s => { if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back'); const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600); const r = vis(s, '#page-admin .acc-tap').first(); await r.scrollIntoViewIfNeeded(); const b = await r.boundingBox(); if (s.desk) await s.page.mouse.click(b.x + 40, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + 40, b.y + b.height / 2); await wait(s, 800) }, box: '#accGiveName' },
  sched: { go: 'editsched', open: async () => {}, box: '.page.on .ah-note.txed' },
  logic: { go: 'logic', open: async () => {}, box: '#lgSearch' },
  quals: { go: 'quals', open: async () => {}, box: '#qFilter' },
}
const readBox = (s, sel) => s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) return { drawn: false }; return { drawn: true, text: 'value' in e && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.textContent, focused: document.activeElement === e } }, sel)
const pageHas = s => s.page.evaluate(w => (document.querySelector('.page.on')?.innerText || '').includes(w) || [...document.querySelectorAll('.page.on input')].some(i => i.value === w), WORDS)
async function one(key, via) {
  const c = C[key], k = `C.${T}.${key}.${via}`, P = `C-${T}-${key}-${via}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a'); await go(s, c.go); await wait(s, 700); await c.open(s)
    const box = vis(s, c.box).first()
    if (!(await box.count())) { FACT(`${k}.box`, `no box ${c.box} drawn`); return }
    await box.scrollIntoViewIfNeeded().catch(() => {})
    if (s.desk) await box.click(); else await box.tap()
    await wait(s, 300)
    if (key === 'sched') await s.page.keyboard.press('End')
    else await s.page.keyboard.press('Control+a')
    await s.page.keyboard.type(WORDS); await wait(s, 300)
    const b0 = await readBox(s, c.box)
    FACT(`${k}.typed`, b0)
    await pic(s, `${P}-1-typed`)
    const did = await reachPick(s, 149, via)
    FACT(`${k}.press`, did)
    await wait(s, 800)
    FACT(`${k}.after`, { squadron: await barSq(s), page: await pageOn(s), box: await readBox(s, c.box), wordsOnPage: await pageHas(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 80)) })
    await pic(s, `${P}-2-after-pick`)
    await reachPick(s, 142, via); await wait(s, 800)
    if ((await pageOn(s)) !== `page-${c.go}`) await go(s, c.go)
    if (key === 'users') await c.open(s).catch(() => {})
    FACT(`${k}.back142`, { squadron: await barSq(s), page: await pageOn(s), box: await readBox(s, c.box), wordsOnPage: await pageHas(s) })
    await pic(s, `${P}-3-back-142`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('type-c v1', SZ)
  for (const key of (ONLY.length ? ONLY : Object.keys(C))) for (const via of (SZ === 'd' ? ['bar'] : ['bar', 'menu'])) await one(key, via)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
