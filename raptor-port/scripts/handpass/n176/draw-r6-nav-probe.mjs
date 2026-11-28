// draw-r6-nav-probe - what Admin → Users is made of today, read before the jump navigation is drawn (chat 188, a fresh
// Fable, 26 Nov 26; brief docs/superpowers/briefs/2026-11-26-msq-r6-users-nav-brief.md). Reads only; writes scratch
// pictures and one facts file under .tmp/n176-draw/. Nothing here writes the app's code.
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, wait, vis, hit, usersTab, closeAll, typeInto, TMP } from './draw-r5b-lib.mjs'
const R6 = resolve(TMP, 'r6-users-state.json')
if (!existsSync(R6)) throw new Error('no r6 world: run draw-r6-users.mjs first')
const OUT = {}
const read = s => s.page.evaluate(() => {
  const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } }
  const cs = (e, ps) => { if (!e) return null; const c = getComputedStyle(e); return Object.fromEntries(ps.map(p => [p, c[p]])) }
  const q = sel => document.querySelector(sel)
  const scrollers = []; for (let e = q('.od-head'); e; e = e.parentElement) { const c = getComputedStyle(e); if (/(auto|scroll)/.test(c.overflowY) || e === document.documentElement) scrollers.push({ tag: e.tagName, id: e.id, cls: e.className, oy: c.overflowY, sh: e.scrollHeight, ch: e.clientHeight }) }
  const chain = []; for (let e = q('.od-head'); e && e !== document.body; e = e.parentElement) { const c = getComputedStyle(e); chain.push({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 60), pos: c.position, ov: c.overflow, bg: c.backgroundColor, box: r(e) }) }
  return {
    win: { w: innerWidth, h: innerHeight, docH: document.documentElement.scrollHeight },
    topbar: { box: r(q('.topbar')), st: cs(q('.topbar'), ['position', 'backgroundColor', 'zIndex']) },
    rail: { box: r(q('.adm-rail')), st: cs(q('.adm-rail'), ['position', 'top', 'display']), html: q('.adm-rail')?.outerHTML.slice(0, 2600) },
    cats: [...document.querySelectorAll('.adm-cat')].map(e => ({ t: e.innerText.replace(/\s+/g, ' ').trim(), on: e.classList.contains('on'), box: r(e) })),
    catL: cs(q('.adm-cat-l'), ['fontSize', 'fontWeight', 'color', 'fontFamily', 'letterSpacing']), catS: cs(q('.adm-cat-s'), ['fontSize', 'fontWeight', 'color']),
    catOn: cs(q('.adm-cat.on'), ['backgroundColor', 'borderLeftColor', 'borderLeftWidth', 'borderTopColor', 'borderRadius', 'padding', 'marginBottom']),
    paneHead: { box: r(q('.adm-pane-head')), html: q('.adm-pane-head')?.outerHTML.slice(0, 800) },
    paneBody: { box: r(q('.adm-pane-body')), st: cs(q('.adm-pane-body'), ['padding', 'backgroundColor']) },
    pane: cs(q('.adm-pane'), ['backgroundColor', 'overflow', 'borderRadius']),
    panelKids: [...q('.od-head').parentElement.children].map(e => ({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 50), t: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70), box: r(e) })),
    odHead: { html: q('.od-head').outerHTML.slice(0, 3000), st: cs(q('.od-head'), ['display', 'gap', 'alignItems', 'flexWrap', 'marginBottom', 'position']) },
    find: { box: r(q('#accFind')), wrap: r(q('#accFind').parentElement), st: cs(q('#accFind'), ['height', 'fontSize', 'backgroundColor', 'borderRadius']) },
    filter: { box: r(q('#accFilter')), st: cs(q('#accFilter'), ['height', 'fontSize', 'fontWeight', 'padding', 'borderRadius', 'backgroundColor', 'color', 'borderTopColor']) },
    sub: cs(q('.od-head .adm-sub'), ['fontSize', 'fontWeight', 'letterSpacing', 'color', 'margin']),
    arch: { html: q('#accArchived')?.outerHTML.slice(0, 900), box: r(q('#accArchived')), btn: cs(q('#accArchived button'), ['fontSize', 'fontWeight', 'padding', 'height', 'borderRadius', 'backgroundColor', 'color']) },
    groups: { box: r(q('[data-testid="acc-groups"]')), kids: [...q('[data-testid="acc-groups"]').children].slice(0, 6).map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 60), t: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) })) },
    colhead: (() => { const e = q('.od-cols') || q('.od-colhd'); return e ? { cls: e.className, box: r(e) } : [...q('[data-testid="acc-groups"]').parentElement.children].map(e => e.className) })(),
    scrollers, chain,
    vars: (() => { const c = getComputedStyle(document.documentElement); return Object.fromEntries(['--panel', '--panel-2', '--raised', '--edge', '--edge-2', '--accent', '--ink', '--ink-2', '--ink-3', '--bg'].map(v => [v, c.getPropertyValue(v).trim()])) })(),
    fchipRule: (() => { const b = document.createElement('button'); b.className = 'fchip'; b.textContent = 'People 60'; document.body.appendChild(b); const o = cs(b, ['height', 'fontSize', 'fontWeight', 'padding', 'borderRadius', 'backgroundColor', 'color', 'borderTopColor']); o.box = r(b); b.className = 'fchip on'; o.on = cs(b, ['backgroundColor', 'color', 'borderTopColor']); b.remove(); return o })(),
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
})
try {
  for (const [who, sz] of [['kestrel', 'd'], ['kestrel', 'p'], ['hunter', 'd'], ['hunter', 'p']]) await run(`navprobe.${who}.${sz}`, sz, async s => {
    await as(s, who); await usersTab(s); await wait(s, 500)
    const k = `${who}.${sz}`
    OUT[k] = await read(s)
    await s.page.screenshot({ path: `${TMP}/j6-probe-${who}-${sz}.png` })
    if (who === 'kestrel') {
      /* the Filter's own menu, opened and closed */
      await hit(s, '#accFilter', 500)
      OUT[k].filterMenu = await s.page.evaluate(() => { const m = document.querySelector('#accFilter').getAttribute('aria-controls'); const e = m && document.getElementById(m); return e ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 600) : [...document.querySelectorAll('[role=menu],[role=dialog],.od-fmenu')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 600)) })
      await s.page.screenshot({ path: `${TMP}/j6-probe-${who}-${sz}-filter.png` })
      await s.page.keyboard.press('Escape'); await wait(s, 300)
      if (await s.page.evaluate(() => document.querySelector('#accFilter').getAttribute('aria-expanded') === 'true')) await hit(s, '#accFilter', 300)
      /* the search today: "Bol", then something nobody has */
      for (const w of ['Bol', 'zzz']) {
        await typeInto(s, '#accFind', w); await wait(s, 500)
        OUT[k]['find.' + w] = await s.page.evaluate(() => ({ head: document.querySelector('.od-head .adm-sub')?.innerText, rows: [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)), groupsText: document.querySelector('[data-testid="acc-groups"]').innerText.replace(/\s+/g, ' ').trim().slice(0, 300), clear: !!document.querySelector('#accFind').parentElement.querySelector('button'), wrapHtml: document.querySelector('#accFind').parentElement.outerHTML.slice(0, 900) }))
        await s.page.screenshot({ path: `${TMP}/j6-probe-${who}-${sz}-find-${w}.png` })
      }
      await typeInto(s, '#accFind', ''); await wait(s, 300)
    }
    /* how far the page runs, and where the rail goes when the page is scrolled to its foot */
    await s.page.evaluate(() => scrollTo(0, 99999)); await wait(s, 400)
    OUT[k].atFoot = await s.page.evaluate(() => { const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return { y: Math.round(q.top), h: Math.round(q.height) } }; return { scrollY: Math.round(scrollY), rail: r(document.querySelector('.adm-rail')), paneHead: r(document.querySelector('.adm-pane-head')), arch: r(document.querySelector('#accArchived')), lastKids: [...document.querySelector('.od-head').parentElement.children].slice(-5).map(e => ({ tag: e.tagName, id: e.id, t: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70) })) } })
    await s.page.screenshot({ path: `${TMP}/j6-probe-${who}-${sz}-foot.png` })
  }, { state: R6 })
} finally {
  writeFileSync(`${TMP}/j6-probe.json`, JSON.stringify(OUT, null, 1))
  await closeAll()
}
