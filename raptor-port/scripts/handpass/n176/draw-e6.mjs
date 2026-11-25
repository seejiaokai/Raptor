// draw-e6 - another squadron's archived callsign (his D2632, D2633), on 149's Admin → Users, Kestrel (149's admin) in the
// new "+ Add a person" form (drawn as e1 draws it: the button cloned from Filter, the page's own form moved under the
// People row, "Add person" · "Cancel" at its foot).
// SET-UP by presses (Saber, from the world): 142's Jester (Pilot, CAT B) → Archive. So Jester is archived on 142 alone;
// Ace is archived on 142 (Pilot, CAT A) and on 150 (Pilot, CAT B) - the world.
//  e6a (d, p)  "Jester" typed: W.archivedNote('142', …) with his real details (read from his archived row on 142's page),
//              the button W.someoneNew and the words W.askAdmin('142') - in the page's own parts: the note the Give access
//              form shows for an archived man (`.adm-note.acc-note`), a plain button (`.abtn`) and a quiet line
//              (`.acc-sub`), under the callsign's row.
//  e6b-d       "Ace" typed: W.archivedMany('Ace'), each archived Ace listed as the page's own archived row draws him (its
//              markup read on 142's and 150's pages), his squadron's grey number beside his callsign, W.askAdmin(n) under
//              his row; one W.someoneNew under them.
//  e6c-d       after "Someone new: add him" on Jester: 142's admin's bell (Hunter) with the line W.someoneNewLine('149',
//              'Jester') · Kestrel, cloned from a real line of his bell; his bell shows two squadrons, so the line wears
//              "142" first, as e3 draws every line.
//  e6d-d       a LIVE man's callsign: "Ranger" typed, the form's real add pressed - today's refusal note raised by the app;
//              e6d-d-today keeps it, e6d-d its words changed to W.taken('Ranger', '142').
//   node raptor-port/scripts/handpass/n176/draw-e6.mjs        (ONLY=e6a-d,e6a-p,e6b,e6c,e6d; FRESH=1 remakes the set-up)
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, W, FACT, want, wait, vis, hit, usersTab, reachPick, archive, shot, box, words, closeAll, world, TMP, addButton, openFormInPlace, typeInto, LIST, lineParts, numbersFirst, linesOf } from './draw-lib.mjs'
import { tapBell } from '../n175/p6-lib.mjs'
const ST = resolve(TMP, 'state-e6.json'), SRC = resolve(TMP, 'e6-sources.json')
async function setup() {
  if (existsSync(ST) && existsSync(SRC) && !process.env.FRESH) return JSON.parse(readFileSync(SRC, 'utf8'))
  const src = {}
  await run('e6.setup', 'd', async s => {
    await as(s, 'saber')
    FACT('e6.setup.archiveJester', await archive(s, 'ipman'))
    const rows = async () => { if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 400); return s.page.evaluate(() => [...document.querySelectorAll('#accArchList .acc-row[data-person]')].map(e => ({ cs: e.querySelector('.acc-name').textContent, sub: e.querySelector('.acc-sub').textContent, line: e.querySelector('.od-archline')?.textContent ?? null, html: e.outerHTML }))) }
    await usersTab(s); src['142'] = await rows()
    await reachPick(s, 150, 'bar'); await usersTab(s); await wait(s, 400); src['150'] = await rows()
    await reachPick(s, 142, 'bar'); await wait(s, 500)
    writeFileSync(ST, JSON.stringify(await s.ctx.storageState()))
  }, { state: await world() })
  FACT('e6.setup.archived', { '142': src['142'].map(r => `${r.cs} | ${r.sub} | ${r.line}`), '150': src['150'].map(r => `${r.cs} | ${r.sub} | ${r.line}`) })
  writeFileSync(SRC, JSON.stringify(src))
  return src
}
/* "Pilot · CAT B" and "Archived 25 Nov 26 by Saber" read off his archived row */
const details = r => { const parts = r.sub.split(' · ').map(x => x.trim()); const seat = parts.find(p => /^(Pilot|WSO|Personnel)$/.test(p)); const cat = (parts.find(p => /^CAT /.test(p)) || '').replace(/^CAT /, ''); const date = (r.line || '').replace(/^Archived /, '').replace(/ by .*$/, ''); return { seat, cat, date } }
async function formWith(s, cs) {
  await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
  await addButton(s, W); await openFormInPlace(s, W)
  const typed = await typeInto(s, '#accAddCs', cs)
  await s.page.evaluate(desk => { if (desk) { scrollTo(0, 0); return } const h = document.querySelector('.od-head').getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect(); scrollBy(0, h.top - bar.bottom - 10) }, s.desk)
  await wait(s, 300)
  return typed
}
/* the note's block under the callsign's row: the page's own note, plain button and quiet line */
async function noteBlock(s, { note, rows = [], button, ask }) {
  return s.page.evaluate(({ note, rows, button, ask }) => {
    const csRow = document.querySelector('#accAddCs').closest('.adm-2col')
    const blk = document.createElement('div'); blk.id = 'n176arch'; blk.style.marginBottom = '12px'
    const p = document.createElement('p'); p.className = 'adm-note acc-note'; p.textContent = note; blk.appendChild(p)
    const sqn = document.createElement('span'); sqn.className = 'acc-sqn'
    if (rows.length) {
      const list = document.createElement('div'); list.className = 'acc-list od-list'; list.id = 'accArchList'
      for (const r of rows) {
        const h = document.createElement('div'); h.innerHTML = r.html; const row = h.firstElementChild
        row.dataset.person = 'n176-' + row.dataset.person; row.querySelector('.acc-tap')?.removeAttribute('title')
        const nm = row.querySelector('.acc-name'); const m = document.createElement('span'); m.className = 'acc-sqn'; m.textContent = r.num; nm.appendChild(m)
        const a = document.createElement('span'); a.className = 'acc-sub'; a.textContent = r.ask; row.querySelector('.acc-main').appendChild(a)
        list.appendChild(row)
      }
      blk.appendChild(list)
    }
    const acts = document.createElement('div'); acts.className = 'acc-acts'
    const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn'; b.id = 'n176new'; b.textContent = button; acts.appendChild(b)
    if (ask) { const q = document.createElement('span'); q.className = 'acc-sub'; q.id = 'n176ask'; q.textContent = ask; q.style.alignSelf = 'center'; acts.appendChild(q) }
    blk.appendChild(acts)
    csRow.insertAdjacentElement('afterend', blk)
    const r = blk.getBoundingClientRect()
    return { box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, words: blk.innerText.replace(/\s+/g, ' ').trim() }
  }, { note, rows, button, ask })
}
/* an app-raised passing note held for the picture (its fade stopped), its words read */
async function holdToast(s) {
  await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); t.getAnimations?.().forEach(a => a.cancel()); const put = () => { if (t.style.opacity !== '1') t.style.opacity = '1' }; put(); new MutationObserver(put).observe(t, { attributes: true, attributeFilter: ['style'] }) })
  await wait(s, 150)
  return s.page.evaluate(() => { const t = document.querySelector('#toastEl'), b = t.getBoundingClientRect(); return { words: t.textContent.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } } })
}
try {
  const src = await setup()
  const jester = src['142'].find(r => r.cs === 'Jester'), d = details(jester)
  for (const sz of ['d', 'p']) if (want('e6a-' + sz)) await run(`e6a.${sz}`, sz, async s => {
    const k = `e6a.${sz}`
    FACT(`${k}.typed`, await formWith(s, 'Jester'))
    FACT(`${k}.todayOnTyping`, await words(s, '#accAddBlock .adm-note, #accAddBlock .od-err, #accAddBlock .acc-note'))
    const n = await noteBlock(s, { note: W.archivedNote('142', 'Jester', d.seat, d.cat, d.date), button: W.someoneNew, ask: W.askAdmin('142') })
    FACT(`${k}.drawn`, { ...n, details: d, noteLines: await linesOf(s, '#n176arch .acc-note'), askLines: await linesOf(s, '#n176ask') })
    await shot(s, `e6a-${sz}-archived`, [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  }, { state: ST })
  if (want('e6b')) await run('e6b', 'd', async s => {
    FACT('e6b.typed', await formWith(s, 'Ace'))
    const rows = [...src['142'].filter(r => r.cs === 'Ace').map(r => ({ ...r, num: '142', ask: W.askAdmin('142') })), ...src['150'].filter(r => r.cs === 'Ace').map(r => ({ ...r, num: '150', ask: W.askAdmin('150') }))]
    const n = await noteBlock(s, { note: W.archivedMany('Ace'), rows, button: W.someoneNew })
    FACT('e6b.drawn', { ...n, rows: rows.map(r => `${r.num} | ${r.cs} | ${r.sub} | ${r.line} | ${r.ask}`) })
    await shot(s, 'e6b-d-archived-many', [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  }, { state: ST })
  if (want('e6c')) await run('e6c', 'd', async s => {
    await as(s, 'hunter'); await tapBell(s)
    const real = await lineParts(s); FACT('e6c.realLines', real)
    const acct = real.find(l => /^Given /.test(l.what || '')) || real[0]
    const r = await numbersFirst(s, { home: '142', about: ['^Given (Plan|View) of', '^Plan of .* ended'], clones: [{ name: 'Jester', mark: null, day: acct.day, what: `${W.someoneNewLine('149', 'Jester')} · Kestrel`, ago: 'now', unread: true, after: null }] })
    /* the new line on top, as the newest */
    await s.page.evaluate(L => { const e = document.querySelector(L + ' [data-n176="cloned"]'); e.parentElement.prepend(e) }, LIST)
    FACT('e6c.drawn', { column: r.column, lines: (await lineParts(s)).map(l => `${l.mark ?? '-'} | ${l.name} ${l.day} | ${l.what} | ${l.ago}`), whatLines: await s.page.evaluate(L => { const e = document.querySelector(L + ' [data-n176="cloned"] .bl-what'); return Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight || '17')) }, LIST) })
    FACT('e6c.clonedFrom', { line: acct, note: 'a real line of his bell cloned; its day kept, its name, words and age replaced' })
    await shot(s, 'e6c-d-bell', [await box(s, LIST), await box(s, '#notifyBell, .bellbtn')])
  }, { state: ST })
  if (want('e6d')) await run('e6d', 'd', async s => {
    FACT('e6d.typed', await formWith(s, 'Ranger'))
    await s.page.evaluate(() => document.querySelector('#accAdd').click()); await wait(s, 500)
    const t = await holdToast(s); FACT('e6d.today', t)
    await shot(s, 'e6d-d-today', [t.box, await box(s, '#accAddCs')])
    await s.page.evaluate(([w]) => { const t = document.querySelector('#toastEl'); const walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT); let n; while ((n = walk.nextNode())) if (/already taken/.test(n.textContent)) { n.textContent = w; return } throw new Error('no taken words in the note') }, [W.taken('Ranger', '142')])
    await wait(s, 150)
    const t2 = await holdToast(s); FACT('e6d.drawn', { ...t2, lines: await linesOf(s, '#toastEl') })
    await shot(s, 'e6d-d-taken', [t2.box, await box(s, '#accAddCs')])
  }, { state: ST })
} finally { await closeAll() }
