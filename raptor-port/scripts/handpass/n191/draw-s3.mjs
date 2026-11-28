// draw-s3 - section 3 (the bell, colours and Display), the drawings still owed (chat 191, 26 Nov 26; brief
// docs/superpowers/briefs/2026-11-26-msq-sections-draw-brief.md; the ledger's section 3, rows 3.7, 3.8, 3.9 P, 3.10).
// Drawn on the REAL app served at 4700 (this folder's build; never started or stopped here). Nothing here writes the app's
// code. Every new word comes from ./words-s3.mjs (S3). What is NEW IN THE APP wears a teal dashed ring, 2px #0D9488,
// 4px clear of the part. Pictures to docs/mock/2026-11-25-msq-pick-guard-q3/drawn/, each with its -crop.
// THE WORLDS: round 6's (r6-users-state.json: three squadrons; Hunter 142 with Plan of 149 and View of 150; Kestrel 149's
// admin only), read only; for 3.10 that world plus Ranger (142, member) given View of 149 by Saber (made here, kept in
// raptor-port/.tmp/n191-s3/).
//  s3-8-d-column        3.8  Hunter on 142: Admin's left column with Users' jumps (way A, D2652) AND the Display card
//  s3-8-p-list          3.8  (extra) the phone's Admin list with the Display card
//  s3-7-d-A-nocard      3.7  recommended: Kestrel (149 only) - no Display card in his column
//  s3-7-p-A-nocard      3.7  recommended: the same, his phone's Admin list
//  s3-7-d-B-empty       3.7  the other answer: the card shown, its page saying there is nothing to set
//  s3-7-p-B-empty       3.7  the other answer, phone
//  s3-9-p-numbers       3.9  bug reports on a phone, each wearing its squadron's grey number (D2655 D9, as the desktop's e7-d)
//  s3-9-d-colour        3.9  question: the same numbers in the admin's squadron colours (D2638's look) - desktop
//  s3-9-p-colour        3.9  question: the same, phone
//  s3-10-d-mine         3.10 Ranger (a member, View of 149): "Your reports" - one sent on 142, one on 149 - no number
//  s3-10-p-mine         3.10 the same, phone
//   node raptor-port/scripts/handpass/n191/draw-s3.mjs      (ONLY=8,7,9,10  FRESH=1 remakes Ranger's world)
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { run, as, W, FACT, wait, vis, hit, go, signIn, words, box, shot, shotTall, closeAll, usersTab, reachPick, addButton, barSq, give, toastNow } from '../n176/draw-r6-misc-lib.mjs'
import { R6, readSources, build, spec142, spec149 } from './draw-s3-navcopy.mjs'
import { S3 } from './words-s3.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const TMP3 = resolve(HERE, '../../../.tmp/n191-s3'); mkdirSync(TMP3, { recursive: true })
const RANGER = resolve(TMP3, 'state-s3-ranger.json')
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const TEAL = '#0D9488'
const COL = { '142': '#F28C28', '149': '#D4AF37', '150': '#3B82F6' }   /* round 6's drawn colours (e3d, e3g) */

/* THE MARK: teal dashed, 2px, its inner edge 4px clear of the part; placed in the page so it scrolls with it */
const tring = (s, b) => b && s.page.evaluate(([b, c]) => { const d = document.createElement('div'); d.className = '__s3ring'; Object.assign(d.style, { position: 'absolute', boxSizing: 'border-box', left: (b.x - 6 + scrollX) + 'px', top: (b.y - 6 + scrollY) + 'px', width: (b.w + 12) + 'px', height: (b.h + 12) + 'px', border: '2px dashed ' + c, borderRadius: '10px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d); return { x: b.x - 6, y: b.y - 6, w: b.w + 12, h: b.h + 12 } }, [b, TEAL])
const union = (...bs) => { bs = bs.filter(Boolean); const L = Math.min(...bs.map(b => b.x)), T = Math.min(...bs.map(b => b.y)), R = Math.max(...bs.map(b => b.x + b.w)), B = Math.max(...bs.map(b => b.y + b.h)); return { x: L, y: T, w: R - L, h: B - T } }
const railNow = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin .adm-rail .adm-cat')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.querySelector('.adm-cat-l')?.textContent || '') + ' / ' + (e.querySelector('.adm-cat-s')?.textContent || '') + (e.classList.contains('on') ? ' (lit)' : '')))

/* THE DISPLAY CARD (round 5's, draw-r5b-display): the column's last card cloned, its words S3's, the palette icon; `on` lights
   it (and unlights the rest), as the column's own selected card */
const displayCard = (s, on) => s.page.evaluate(({ T, on }) => {
  const rail = document.querySelector('#page-admin .adm-rail'), cats = [...rail.querySelectorAll('.adm-cat')]
  const last = cats[cats.length - 1]
  const d = last.cloneNode(true); d.id = 's3Display'; d.classList.remove('on'); d.removeAttribute('aria-current')
  d.querySelector('.adm-cat-l').textContent = T.cardLabel; d.querySelector('.adm-cat-s').textContent = T.cardSub
  d.querySelector('.adm-cat-ic').innerHTML = '<svg class="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><circle cx="8.5" cy="10" r="1.3"></circle><circle cx="12" cy="7.5" r="1.3"></circle><circle cx="15.5" cy="10" r="1.3"></circle><path d="M12 21a2.5 2.5 0 0 1 0-5h2.5"></path></svg>'
  ;(document.querySelector('#j6card') && last.closest('#j6card') ? last.closest('#j6card') : last).after(d)
  if (on) { cats.forEach(c => { c.classList.remove('on'); c.removeAttribute('aria-current') }); d.classList.add('on'); d.setAttribute('aria-current', 'page') }
  const r = d.getBoundingClientRect(), lr = last.getBoundingClientRect()
  return { box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, sameSizeAsLast: Math.round(r.width) === Math.round(lr.width) && Math.round(r.height) === Math.round(lr.height), gapAbove: Math.round(r.top - lr.bottom) }
}, { T: S3, on })

/* ---- 3.8 the column with both, desktop; and the phone's list with the card ---- */
async function job8() {
  await readSources()
  if (want('8')) await run('s3-8-d', 'd', async s => {
    await as(s, 'hunter'); await usersTab(s); await wait(s, 400); FACT('s3-8-d.addButton', await addButton(s, W))
    const b = await build(s, spec142('A'))
    FACT('s3-8-d.jumps', b.jumps.map(j => j.words + (j.lit ? ' (lit)' : '')))
    FACT('s3-8-d.card', await displayCard(s, false))
    FACT('s3-8-d.column', await railNow(s))
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 250)
    const rail = await box(s, '#page-admin .adm-rail'), pane = await box(s, '#page-admin .adm-pane'), disp = await box(s, '#s3Display')
    await tring(s, await box(s, '#j6rail')); await tring(s, disp)
    await shot(s, 's3-8-d-column', [{ x: rail.x, y: rail.y, w: pane.x + pane.w - rail.x, h: disp.y + disp.h + 8 - rail.y }], 16)
  }, { state: R6 })
  if (want('8')) await run('s3-8-p', 'p', async s => {
    await as(s, 'hunter'); await go(s, 'admin'); await wait(s, 600)
    if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
    FACT('s3-8-p.card', await displayCard(s, false))
    FACT('s3-8-p.list', await railNow(s))
    const rail = await box(s, '#page-admin .adm-rail'), disp = await box(s, '#s3Display')
    await tring(s, disp)
    await shot(s, 's3-8-p-list', [union(rail, disp)], 14)
  }, { state: R6 })
}

/* ---- 3.7 Display for an admin whose bell shows one squadron (Kestrel, 149 only) ---- */
async function job7() {
  await readSources()
  /* A (recommended): no card - his column as way A draws it, nothing else  (BONLY=1 skips A, redrawing only B) */
  if (!process.env.BONLY) {
  await run('s3-7-d-A', 'd', async s => {
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400); await addButton(s, W)
    await build(s, spec149('A'))
    FACT('s3-7-d-A.column', await railNow(s))
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 250)
    const rail = await box(s, '#page-admin .adm-rail'), pane = await box(s, '#page-admin .adm-pane')
    await tring(s, await box(s, '#j6rail'))
    await shot(s, 's3-7-d-A-nocard', [{ x: rail.x, y: rail.y, w: pane.x + pane.w - rail.x, h: rail.h + 8 }], 16)
  }, { state: R6 })
  await run('s3-7-p-A', 'p', async s => {
    await as(s, 'kestrel'); await go(s, 'admin'); await wait(s, 600)
    if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
    FACT('s3-7-p-A.list', await railNow(s))
    await shot(s, 's3-7-p-A-nocard', [await box(s, '#page-admin .adm-rail')], 14)
  }, { state: R6 })
  }
  /* B (the other answer): the card shown and lit, its page one quiet line */
  for (const sz of ['d', 'p']) await run(`s3-7-${sz}-B`, sz, async s => {
    const k = `s3-7-${sz}-B`
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 500)
    FACT(`${k}.card`, await displayCard(s, true))
    const r = await s.page.evaluate(T => {
      document.querySelector('#page-admin .adm-pane-head h3').textContent = T.cardLabel
      const body = document.querySelector('#page-admin .adm-pane-body')
      body.querySelectorAll('.adm-panel').forEach(p => p.classList.remove('on'))
      const sec = document.createElement('section'); sec.className = 'adm-panel on'; sec.id = 's3Empty'
      const p = document.createElement('p'); p.className = 'adm-note'; p.id = 's3EmptyNote'; p.textContent = T.emptyNote; p.style.margin = '0'
      sec.appendChild(p); body.prepend(sec)
      return { head: document.querySelector('#page-admin .adm-pane-head h3').textContent, note: p.textContent, noteFont: getComputedStyle(p).fontSize }
    }, S3)
    FACT(`${k}.page`, r); FACT(`${k}.column`, await railNow(s))
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 250)
    const pane = await box(s, '#page-admin .adm-pane'), note = await box(s, '#s3EmptyNote'), head = await box(s, '#page-admin .adm-pane-head')
    if (sz === 'd') {
      const rail = await box(s, '#page-admin .adm-rail'), disp = await box(s, '#s3Display')
      await tring(s, disp); await tring(s, union(pane, note))
      await shot(s, 's3-7-d-B-empty', [{ x: rail.x, y: rail.y, w: pane.x + pane.w - rail.x, h: Math.max(rail.h, note.y + note.h - rail.y) + 8 }], 16)
    } else {
      await tring(s, union(pane, note))
      await shot(s, 's3-7-p-B-empty', [{ x: pane.x, y: pane.y, w: pane.w, h: Math.max(pane.y + pane.h, note.y + note.h) + 4 - pane.y }], 14)
    }
  }, { state: R6 })
}

/* ---- 3.9 bug reports: three filed by Saber on 142, 149, 150 (draw-e7's way, its texts), then Help with the numbers ---- */
const FILE = [['142', 'Schedule board', 'Test report - the week did not load'], ['149', 'Inputs & calendar', 'Test report - a leave shows twice'], ['150', 'Inputs & calendar', 'Test report - a holiday is missing']]
const paint = (s, cols) => s.page.evaluate(cols => {
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',')
  return [...document.querySelectorAll('#bugList .s3num')].map(m => { const c = cols[m.textContent.trim()]; Object.assign(m.style, { color: c, borderColor: `rgba(${hex(c)},.6)`, background: `rgba(${hex(c)},.16)` }); return m.textContent + ' ' + getComputedStyle(m).color })
}, cols)
async function job9() {
  for (const sz of ['p', 'd']) await run(`s3-9-${sz}`, sz, async s => {
    const k = `s3-9-${sz}`, via = sz === 'd' ? 'bar' : 'menu'
    await as(s, 'saber')
    const mine = []
    for (const [num, cat, text] of FILE) {
      await reachPick(s, Number(num), via); await go(s, 'help'); await wait(s, 500)
      await s.page.selectOption('#bugCat', cat); await s.page.fill('#bugText', text); await hit(s, '#bugSend', 600)
      FACT(`${k}.filed.${num}`, { squadronInView: await barSq(s), toast: await toastNow(s) })
      mine.push({ num, text }); await wait(s, 1100)
    }
    await reachPick(s, 142, via); await go(s, 'help'); await wait(s, 600)
    FACT(`${k}.today`, { lead: await words(s, '#bugAdmin .help-lead'), rows: await words(s, '#bugList .bugrow') })
    const r = await s.page.evaluate(mine => [...document.querySelectorAll('#bugList .bugrow')].map(row => {
      const text = row.querySelector('.bugtext').textContent
      const num = mine.find(m => m.text === text)?.num || '142'
      const m = document.createElement('span'); m.className = 'bl-sqn s3num'; m.textContent = num; m.style.marginLeft = '0'
      row.querySelector('.bughead').prepend(m)
      return `${num} | ${row.querySelector('.bughead').innerText.replace(/\s+/g, ' ').trim()} | ${text}`
    }), mine)
    FACT(`${k}.drawn`, r)
    const at = async () => { await s.page.evaluate(() => { document.querySelector('#bugAdmin').scrollIntoView({ block: 'start' }); scrollBy(0, -80) }); await wait(s, 300) }
    const rings = async () => { for (const i of [0, 1, 2]) await tring(s, await s.page.evaluate(i => { const r = document.querySelectorAll('#bugList .s3num')[i].getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }, i)) }
    const unring = () => s.page.evaluate(() => document.querySelectorAll('.__s3ring').forEach(e => e.remove()))
    if (sz === 'p') {
      await at(); await rings()
      FACT(`${k}.headLines`, await s.page.evaluate(() => [...document.querySelectorAll('#bugList .bughead')].map(h => Math.round(h.getBoundingClientRect().height))))
      await shot(s, 's3-9-p-numbers', [await box(s, '#bugAdmin')]); await unring()
    }
    FACT(`${k}.colour`, await paint(s, COL))
    await at(); await rings()
    await shot(s, `s3-9-${sz}-colour`, [await box(s, '#bugAdmin')])
  })
}

/* ---- 3.10 a member's own "Your reports": Ranger (142, member) holding View of 149 sends one on each ---- */
async function rangerWorld() {
  if (existsSync(RANGER) && !process.env.FRESH) return RANGER
  await run('s3-10.setup', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 500)
    FACT('s3-10.setup.ranger.view149', await give(s, 'bane', '149', 'view'))
    FACT('s3-10.setup.ranger.row', await s.page.evaluate(() => document.querySelector('[data-person="bane"]')?.innerText.replace(/\s+/g, ' ').trim()))
    await wait(s, 600); writeFileSync(RANGER, JSON.stringify(await s.ctx.storageState()))
  }, { state: R6 })
  return RANGER
}
const MINE = [['142', 'Schedule board', 'Test report - my duty shows on the wrong day'], ['149', 'Inputs & calendar', 'Test report - my leave is missing from the calendar']]
async function job10() {
  const st = await rangerWorld()
  for (const sz of ['d', 'p']) await run(`s3-10-${sz}`, sz, async s => {
    const k = `s3-10-${sz}`, via = sz === 'd' ? 'bar' : 'menu'
    await signIn(s, 'us', 'us')
    for (const [num, cat, text] of MINE) {
      const p = await reachPick(s, Number(num), via); if (num !== '142') FACT(`${k}.pick${num}`, { pressed: p.pressed, list: p.listRows, now: await barSq(s) })
      await go(s, 'help'); await wait(s, 500)
      await s.page.selectOption('#bugCat', cat); await s.page.fill('#bugText', text); await hit(s, '#bugSend', 600)
      FACT(`${k}.filed.${num}`, { squadronInView: await barSq(s), toast: await toastNow(s) })
      await wait(s, 1100)
    }
    await reachPick(s, 142, via); await go(s, 'help'); await wait(s, 600)
    FACT(`${k}.mine`, { cards: await words(s, '.help-card h3'), rows: await words(s, '#bugMine .bugrow'), numbers: await s.page.evaluate(() => document.querySelectorAll('#bugMine .bl-sqn').length), squadron: await barSq(s) })
    await s.page.evaluate(() => { document.querySelector('#bugMine').scrollIntoView({ block: 'center' }) }); await wait(s, 300)
    await shot(s, `s3-10-${sz}-mine`, [await box(s, '#bugMine')], 8)
  }, { state: st })
}

try {
  if (want('8')) await job8()
  if (want('7')) await job7()
  if (want('9')) await job9()
  if (want('10')) await job10()
} finally { await closeAll() }
