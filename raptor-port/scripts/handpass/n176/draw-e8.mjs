// draw-e8 - the badge where he can only look (his D2628 C7). Hunter (142's admin, View of 150, Plan of 149).
//  e8t-d     TODAY, 150 picked: the badge pressed once - what it does (FACT), the picture after the press.
//  e8-d      150 picked: the badge's words changed to W.badgeViewOnly('Hunter') (the app's own badge, its words alone).
//  e8-p      150 picked, ☰ opened: the menu's "Signed in as …" line the same words.
//  e8b-d     149 picked (Plan): the badge as today - "Admin" - one picture, nothing changed.
//   node raptor-port/scripts/handpass/n176/draw-e8.mjs        (ONLY=e8t,e8,e8p,e8b)
import { run, as, W, FACT, want, wait, hit, reachPick, shot, box, words, closeAll, barSq, roleNow, windowsNow, pageOn, shut } from './draw-lib.mjs'
const BADGE = '#roleBadge'
const badge = s => s.page.evaluate(sel => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 1); if (!b) return null; const r = b.getBoundingClientRect(); return { text: b.textContent.replace(/\s+/g, ' ').trim(), shown: b.innerText.replace(/\s+/g, ' ').trim(), title: b.title || null, box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, html: b.innerHTML.slice(0, 300) } }, BADGE)
/* the badge's words, its own text only (no element added), the same everywhere the words stand in it */
const setBadge = (s, from, to) => s.page.evaluate(([sel, from, to]) => {
  for (const b of document.querySelectorAll(sel)) { const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); const ns = []; let n; while ((n = w.nextNode())) ns.push(n)
    const all = ns.map(n => n.textContent).join('')
    if (all.replace(/\s+/g, ' ').trim() === from) { ns.forEach((n, i) => { n.textContent = i === 0 ? to : '' }) } }
}, [BADGE, from, to])
try {
  if (want('e8t')) await run('e8t', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 150, 'bar'); await wait(s, 500)
    const b = await badge(s); FACT('e8t.before', { squadron: await barSq(s), page: await pageOn(s), badge: b })
    await hit(s, BADGE, 700)
    FACT('e8t.afterPress', { squadron: await barSq(s), page: await pageOn(s), badge: await badge(s), role: await roleNow(s), windows: (await windowsNow(s)).map(w => `${w.what}: ${w.words.slice(0, 120)}`), toast: await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); return t && getComputedStyle(t).opacity !== '0' ? t.textContent.replace(/\s+/g, ' ').trim() : null }) })
    await shot(s, 'e8t-d-today-pressed', [{ x: 0, y: 0, w: s.W, h: 160 }])
  })
  if (want('e8')) await run('e8', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 150, 'bar'); await wait(s, 500)
    const b = await badge(s); FACT('e8.today', b)
    await setBadge(s, b.text, W.badgeViewOnly('Hunter')); await wait(s, 200)
    const a = await badge(s); FACT('e8.drawn', { squadron: await barSq(s), badge: a })
    await shot(s, 'e8-d-badge', [a.box, await box(s, '.topbar .mark')].map(x => x && { ...x }).concat([{ x: a.box.x - 400, y: 0, w: 10, h: 60 }]))
  })
  if (want('e8p')) await run('e8p', 'p', async s => {
    await as(s, 'hunter'); await reachPick(s, 150, 'menu'); await wait(s, 500)
    await hit(s, '#burger', 500)
    const line = await s.page.evaluate(() => { const e = [...document.querySelectorAll('#drawer *')].find(x => x.children.length < 3 && /^Signed in as/.test(x.textContent.trim())); if (!e) return null; e.id = e.id || 'n176signed'; const r = e.getBoundingClientRect(); return { sel: '#' + e.id, text: e.textContent.replace(/\s+/g, ' ').trim(), box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } } })
    FACT('e8p.today', { squadron: await barSq(s), line, roleLine: (await roleNow(s)).menuLine })
    if (!line) throw new Error('no "Signed in as" line in the menu')
    /* the words after "Signed in as " take the badge's words */
    const changed = await s.page.evaluate(([sel, to]) => { const e = document.querySelector(sel); const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); const ns = []; let n; while ((n = w.nextNode())) ns.push(n); const all = ns.map(n => n.textContent).join(''); const head = all.match(/^\s*Signed in as\s*/)[0]; ns.forEach((n, i) => { n.textContent = i === 0 ? head + to : '' }); return e.textContent.replace(/\s+/g, ' ').trim() }, [line.sel, W.badgeViewOnly('Hunter')])
    FACT('e8p.drawn', { was: line.text, now: changed })
    await shot(s, 'e8-p-menu', [await box(s, line.sel), await box(s, '#drawer .mark, .drawer-sqn')])
  })
  if (want('e8b')) await run('e8b', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 149, 'bar'); await wait(s, 500)
    const b = await badge(s); FACT('e8b.today149', { squadron: await barSq(s), badge: b })
    await shot(s, 'e8b-d-badge-149', [b.box, { x: b.box.x - 400, y: 0, w: 10, h: 60 }])
  })
} finally { await closeAll() }
