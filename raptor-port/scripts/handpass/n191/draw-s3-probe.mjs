// draw-s3-probe - section 3's drawer (chat 191, 26 Nov 26; brief docs/superpowers/briefs/2026-11-26-msq-sections-draw-brief.md):
// reads the REAL app (served at 4700) before drawing - Admin's left column (desktop) and Admin's list (phone) for Hunter
// (142, Plan of 149, View of 150) and Kestrel (149 only), and the Help page's report parts for a member. Writes nothing.
//   node raptor-port/scripts/handpass/n191/draw-s3-probe.mjs
import { resolve } from 'node:path'
import { run, as, FACT, wait, vis, hit, go, signIn, words, box, closeAll, TMP, world } from '../n176/draw-r6-misc-lib.mjs'
const R6 = resolve(TMP, 'r6-users-state.json')
const railNow = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin .adm-cat')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(); return { l: e.querySelector('.adm-cat-l')?.textContent, s: e.querySelector('.adm-cat-s')?.textContent, on: e.classList.contains('on'), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } }))
try {
  for (const sz of ['d', 'p']) for (const who of ['hunter', 'kestrel']) await run(`probe.${who}.${sz}`, sz, async s => {
    await as(s, who); await go(s, 'admin'); await wait(s, 700)
    FACT(`probe.${who}.${sz}.landing`, { back: await vis(s, '.adm-back').count(), rail: await railNow(s), head: await words(s, '#page-admin .adm-pane-head h3'), railBox: await box(s, '#page-admin .adm-rail'), paneBox: await box(s, '#page-admin .adm-pane') })
    FACT(`probe.${who}.${sz}.bellShow`, await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-show"] button')].map(b => b.textContent.trim())))
  }, { state: R6 })
  /* a member: Ranger (us) - his Help page */
  for (const sz of ['d', 'p']) await run(`probe.ranger.${sz}`, sz, async s => {
    await signIn(s, 'us', 'us'); await go(s, 'help'); await wait(s, 600)
    FACT(`probe.ranger.${sz}.help`, { cards: await words(s, '.help-card h3'), mine: await words(s, '#bugMine'), badge: await words(s, '#roleBadge') })
  }, { state: await world() })
} finally { await closeAll() }
