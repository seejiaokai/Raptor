// draw-r6-misc-d8 - round 6, D8: "It's him", end to end (his D2632, D2633, D2643; "u can draw this in the new chat").
// The archived Jester on 142 is the man joining 149. Round 1's e6 state (Jester archived on 142 - draw-e6.mjs).
//  m6-?-itshim        Kestrel on 149's Admin → Users, "+ Add a person", "Jester" typed (round 5's e6a-?-archived-r): the
//                     note "142 has an archived Jester … Is this him?" now with TWO answers, W6.itsHim and W.someoneNewR5 -
//                     both plain buttons laid as the app's own pair (the opened row's Save · Cancel, measured: Cancel's
//                     metrics on each, its gap) - the quiet "If this is him, ask 142's admin" gone (the button says it);
//                     "Add person" greyed, W.answerFirst under it, as round 5. Ringed: the pair.
//  m6-d-itshim-asked  after "It's him": the form folds shut and empties (as its Cancel does), "+ Add a person" back to its
//                     plain look; the app's passing note (its 'ok' kind, raised by the app's own toast) says W6.askedNote.
//                     Nothing is added to 149 (FACT: 149's list has no Jester). Ringed: the note.
//  m6-?-itshim-bell   Hunter (142's admin) taps his bell: on top, a line cloned from a real line of his bell - "Jester" in
//                     the name place, W6.askLine('149') · Kestrel, "now", unread - its squadron number first (round 5's
//                     column, 142); where his bell shows more than one squadron, every number in its squadron's colour
//                     (his D2638 - round 5's sample colours). Ringed: the line.
//  m6-?-itshim-row    what the tap opens: 142's Admin → Users, Archived open, Jester's archived row opened as the app opens
//                     it (callsign, post-in date, Restore · Delete · Cancel), with W6.askRowNote above its fields and a new
//                     main button W6.restoreAndPost('149') first - a copy of the row's own Restore - and Restore taking the
//                     plain look (one main button a row). Ringed: the note and the new button.
//  m6-d-itshim-sheet  that press opens the Leave War's own posting sheet: the real bid sheet's Post out panel (opened on the
//                     Leave War on a 142 man's day, read, its parts kept whole) - its leave rows left out (they are the day's
//                     leave, not the posting), its head "Jester", PO FROM 1 Dec 26, POSTING with "✓ Transfer to Sqn" chosen
//                     (today drawn and not pressable), a new row W6.toLabel with the squadrons as the same chips (149 chosen,
//                     150), its line W6.transferLine, "Post out" - laid over the opened row on Admin → Users.
//   node raptor-port/scripts/handpass/n176/draw-r6-misc-d8.mjs   (ONLY=a-d,a-p,asked,bell-d,bell-p,row-d,row-p,sheet)
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { run, as, W, W6, FACT, want, wait, vis, hit, usersTab, shot, box, words, closeAll, TMP, linesOf, greyLook, LIST, lineParts, numbersFirst, vring, union, form6, REF, pairLike, boxIn, DRAWN } from './draw-r6-misc-lib.mjs'
import { tapBell, go } from '../n175/p6-lib.mjs'
const ST = resolve(TMP, 'state-e6.json'), SRC = resolve(TMP, 'e6-sources.json')
const COL = { '142': '#F28C28', '149': '#D4AF37', '150': '#3B82F6' }
const details = r => { const parts = r.sub.split(' · ').map(x => x.trim()); const seat = parts.find(p => /^(Pilot|WSO|Personnel)$/.test(p)); const cat = (parts.find(p => /^CAT /.test(p)) || '').replace(/^CAT /, ''); const date = (r.line || '').replace(/^Archived /, '').replace(/ by .*$/, ''); return { seat, cat, date } }
/* round 5's note block under the callsign's row, now with the two answers in one row */
const block2 = (s, note, a, b) => s.page.evaluate(([note, a, b]) => {
  const csRow = document.querySelector('#accAddCs').closest('.adm-2col')
  const blk = document.createElement('div'); blk.id = 'n176arch'; blk.style.marginBottom = '12px'
  const p = document.createElement('p'); p.className = 'adm-note acc-note'; p.textContent = note; blk.appendChild(p)
  const acts = document.createElement('div'); acts.className = 'acc-acts'; acts.id = 'm6pair'
  for (const [id, t] of [['m6him', a], ['m6new', b]]) { const x = document.createElement('button'); x.type = 'button'; x.className = 'abtn'; x.id = id; x.textContent = t; acts.appendChild(x) }
  blk.appendChild(acts); csRow.insertAdjacentElement('afterend', blk)
  return blk.innerText.replace(/\s+/g, ' ').trim()
}, [note, a, b])
const addUnder = (s, why) => s.page.evaluate(why => { const p = document.createElement('p'); p.className = 'adm-note'; p.id = 'r5bAnswer'; p.textContent = why; p.style.margin = '12px 0 0'; document.querySelector('#n176acts').insertAdjacentElement('afterend', p) }, why)
/* the app's passing note raised by its own toast ('ok'), its fade held */
async function okNote(s, text) {
  const ok = await s.page.evaluate(t => { if (typeof window.toast !== 'function') return false; window.toast(t, 'ok'); return true }, text)
  if (!ok) throw new Error('window.toast is not on the page')
  await wait(s, 450)
  await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); t.getAnimations?.().forEach(a => a.cancel()); const put = () => { if (t.style.opacity !== '1') t.style.opacity = '1' }; put(); new MutationObserver(put).observe(t, { attributes: true, attributeFilter: ['style'] }) })
  await wait(s, 150)
  return s.page.evaluate(() => { const t = document.querySelector('#toastEl'), b = t.getBoundingClientRect(); return { words: t.innerText.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } } })
}
/* Jester's archived row on 142's page, opened as the app opens it, then the request drawn in */
async function jesterRow(s) {
  await as(s, 'hunter'); await usersTab(s); await wait(s, 400)
  if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 400)
  await hit(s, s.page.locator('#accArchList [data-person="ipman"] .acc-tap').first(), 700)
  const today = await s.page.evaluate(() => { const e = document.querySelector('#accArchList [data-person="ipman"]'); return { text: e.innerText.replace(/\s+/g, ' ').trim(), buttons: [...e.querySelectorAll('.abtn')].map(b => `${b.textContent.trim()} (${b.className}) h ${Math.round(b.getBoundingClientRect().height)}`) } })
  const r = await s.page.evaluate(([note, label]) => {
    const row = document.querySelector('#accArchList [data-person="ipman"]'), rs = row.querySelector('#accArRestore'), acts = rs.parentElement
    const nb = rs.cloneNode(true); nb.id = 'm6RestorePost'; nb.textContent = label; nb.className = 'abtn primary'; rs.before(nb)
    rs.className = 'abtn'
    /* the request, in the row's own note look, first in the opened part (under the row's head) */
    const tap = row.querySelector('.acc-tap'); const p = document.createElement('p'); p.className = 'adm-note acc-note'; p.id = 'm6Ask'; p.textContent = note
    p.style.margin = '10px 0 12px';
    (row.querySelector('input:not([type=hidden])').closest('.adm-2col') || row.querySelector('input').parentElement).before(p)
    const bx = e => { const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } }
    return { buttons: [...acts.querySelectorAll('button')].map(b => ({ words: b.textContent.trim(), cls: b.className, ...bx(b) })), wraps: new Set([...acts.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().top))).size > 1 }
  }, [W6.askRowNote('Kestrel', '149'), W6.restoreAndPost('149')])
  return { today, drawn: r }
}
try {
  if (!existsSync(ST) || !existsSync(SRC)) throw new Error('round 1\'s e6 state is missing - run draw-e6.mjs first')
  const src = JSON.parse(readFileSync(SRC, 'utf8'))
  const jester = details(src['142'].find(r => r.cs === 'Jester'))
  FACT('jester', jester)
  /* a */
  for (const sz of ['d', 'p']) if (want('a-' + sz)) await run(`a.${sz}`, sz, async s => {
    FACT(`a.${sz}.typed`, await form6(s, 'kestrel', 'Jester'))
    FACT(`a.${sz}.note`, await block2(s, W.archivedNote('142', 'Jester', jester.seat, jester.cat, jester.date), W6.itsHim, W.someoneNewR5))
    FACT(`a.${sz}.pair`, { measuredFrom: 'Osprey\'s opened row on 149 (Save · Cancel)', ref: { cancelHeight: REF.cancel.height, saveHeight: REF.save.height, gap: REF.gapBetween, savedBoxes: REF.boxes }, laid: await pairLike(s, '#m6pair', REF) })
    FACT('greyLook', await greyLook(s, '#n176save')); await addUnder(s, W.answerFirst); await wait(s, 200)
    FACT(`a.${sz}.foot`, await s.page.evaluate(() => { const r = q => { const e = document.querySelector(q), b = e.getBoundingClientRect(); return `${e.textContent}${e.disabled ? ' [greyed]' : ''}: h ${Math.round(b.height)}, y ${Math.round(b.top)}` }; return [r('#n176save'), r('#n176cancel'), r('#m6him'), r('#m6new')] }))
    FACT(`a.${sz}.noteLines`, await linesOf(s, '#n176arch .acc-note'))
    await vring(s, await box(s, '#m6pair'), 'pair')
    await s.page.evaluate(() => { const a = document.querySelector('#m6pair'); const r = a.getBoundingClientRect(); const bs = [...a.children].map(b => b.getBoundingClientRect()); const ring = document.querySelector('.__m6ring'); ring.style.width = (bs[bs.length - 1].right - r.left + 8) + 'px' })
    await shot(s, `m6-${sz}-itshim`, [await box(s, '.od-head'), await box(s, '#accAddBlock')])
  }, { state: ST })
  /* b */
  if (want('asked')) await run('asked', 'd', async s => {
    await form6(s, 'kestrel', 'Jester')
    await block2(s, W.archivedNote('142', 'Jester', jester.seat, jester.cat, jester.date), W6.itsHim, W.someoneNewR5)
    /* "It's him" pressed: the form folds shut and empties as its Cancel does - the page's form put back where the app keeps
       it (hidden here: the drawing's open form was the page's own block moved), the button's "on" look off */
    await s.page.evaluate(() => { document.querySelector('#accAddCs').value = ''; document.querySelector('#accAddBlock').style.display = 'none'; document.querySelector('#n176add').classList.remove('on') })
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200)
    const n = await okNote(s, W6.askedNote('Jester', '142', '149'))
    FACT('asked.note', n)
    FACT('asked.149people', { count: (await words(s, '[data-testid="acc-groups"] .acc-row[data-person] .acc-name')).length, jesterListed: (await words(s, '[data-testid="acc-groups"] .acc-row[data-person] .acc-name')).some(w => /^Jester/.test(w)) })
    await vring(s, n.box, 'note')
    const hb = await box(s, '.od-head')
    await shot(s, 'm6-d-itshim-asked', [hb, n.box])
    /* THE CROP, cut (the host, after the words review): round 6 puts the "From other squadrons" block and Incoming /
       Outgoing above "People" (the Fable drawer's u6-d-users), and this picture's list is round 5's - so the crop shows
       only the folded form's row and the passing note, two strips of the same picture one above the other, a gap
       between, and no list to compare. The whole-screen picture is left as drawn. */
    {
      const L = Math.max(0, Math.min(hb.x, n.box.x) - 14), R = Math.min(s.W, Math.max(hb.x + hb.w, n.box.x + n.box.w) + 14)
      const a = `${TMP}/m6-asked-a.png`, b = `${TMP}/m6-asked-b.png`
      await s.page.screenshot({ path: a, clip: { x: L, y: hb.y - 14, width: R - L, height: hb.h + 28 } })
      /* the note's strip cut to the note and its ring alone (no row of the list beside it), set at its own place */
      const bx = n.box.x - 10, bw = n.box.w + 20
      await s.page.screenshot({ path: b, clip: { x: bx, y: n.box.y - 10, width: bw, height: n.box.h + 20 } })
      /* the colour drawn behind the row: the first ancestor with a colour of its own */
      const bg = await s.page.evaluate(() => { for (let e = document.querySelector('#page-admin .od-head'); e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c } return getComputedStyle(document.body).backgroundColor })
      const hex = '0x' + bg.match(/\d+/g).slice(0, 3).map(v => (+v).toString(16).padStart(2, '0')).join('')
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', a, '-i', b, '-filter_complex', `[0]pad=iw:ih+48:0:0:color=${hex}[t];[1]pad=${(R - L) * 2}:ih:${(bx - L) * 2}:0:color=${hex}[n];[t][n]vstack`, '-update', '1', `${DRAWN}/m6-d-itshim-asked-crop.png`])
      FACT('asked.crop', { strips: [{ x: L, y: hb.y - 14, w: R - L, h: hb.h + 28 }, { x: L, y: n.box.y - 14, w: R - L, h: n.box.h + 28 }], gap: '24px of the page\'s own colour ' + bg })
    }
  }, { state: ST })
  /* c - the bell */
  for (const sz of ['d', 'p']) if (want('bell-' + sz)) await run(`bell.${sz}`, sz, async s => {
    await as(s, 'hunter'); await tapBell(s)
    const real = await lineParts(s); FACT(`bell.${sz}.realLines`, real.map(l => `${l.mark ?? '-'} | ${l.name} ${l.day} | ${l.what}`))
    const show = await s.page.evaluate(L => [...document.querySelectorAll(L + ' [data-testid="bell-show"] button')].map(b => `${b.textContent.trim()}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'}`), LIST)
    FACT(`bell.${sz}.show`, show)
    const tpl = real.find(l => /^Given /.test(l.what || '')) || real[0]
    const r = await numbersFirst(s, { home: '142', about: ['^Given (Plan|View) of', '^Plan of .* ended'], clones: [{ name: 'Jester', mark: null, day: tpl.day, what: `${W6.askLine('149')} · Kestrel`, ago: 'now', unread: true, after: null }] })
    await s.page.evaluate(L => { const e = document.querySelector(L + ' [data-n176="cloned"]'); e.parentElement.prepend(e); e.id = 'm6line' }, LIST)
    const many = show.filter(x => /:on$/.test(x)).length > 1
    if (many) await s.page.evaluate(([L, COL]) => { const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(','); for (const m of document.querySelectorAll(L + ' .bl-sqn')) { const c = COL[m.textContent.trim()]; if (c) Object.assign(m.style, { color: c, borderColor: `rgba(${hex(c)},.6)`, background: `rgba(${hex(c)},.16)` }) } for (const b of document.querySelectorAll(L + ' [data-testid="bell-show"] button')) { const c = COL[b.textContent.trim()]; if (c) { const on = b.getAttribute('aria-pressed') === 'true'; Object.assign(b.style, { color: c, borderColor: `rgba(${hex(c)},${on ? .6 : .35})`, background: `rgba(${hex(c)},${on ? .16 : .06})` }) } } }, [LIST, COL])
    /* the line's day: the request is about no day - its day place left as the real line's (the app's lines all carry one) */
    FACT(`bell.${sz}.drawn`, { coloured: many, column: r.column, lines: (await lineParts(s)).map(l => `${l.mark ?? '-'} | ${l.name} ${l.day} | ${l.what} | ${l.ago}`), whatLines: await linesOf(s, '#m6line .bl-what') })
    await s.page.evaluate(() => document.activeElement?.blur())
    await vring(s, await box(s, '#m6line'), 'line')
    await shot(s, `m6-${sz}-itshim-bell`, [await box(s, LIST)])
  }, { state: ST })
  /* c - what the tap opens */
  for (const sz of ['d', 'p']) if (want('row-' + sz)) await run(`row.${sz}`, sz, async s => {
    const r = await jesterRow(s); FACT(`row.${sz}`, r)
    await s.page.evaluate(() => { const e = document.querySelector('#accArchList [data-person="ipman"]'); const b = e.getBoundingClientRect(); const bar = document.querySelector('.topbar').getBoundingClientRect(); scrollBy(0, b.top - bar.bottom - 70) }); await wait(s, 300)
    await vring(s, await box(s, '#m6Ask'), 'note'); await vring(s, await box(s, '#m6RestorePost'), 'button')
    await shot(s, `m6-${sz}-itshim-row`, [await box(s, '#accArchList [data-person="ipman"]'), await box(s, '.__m6ring')])
  }, { state: ST })
  /* d - the Leave War's own posting sheet */
  if (want('sheet')) await run('sheet', 'd', async s => {
    await as(s, 'hunter'); await go(s, 'leavewar'); await s.page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await wait(s, 800)
    await s.page.locator('[data-testid="month-DEC"]').filter({ visible: true }).first().click(); await wait(s, 900)
    const c = s.page.locator('[data-testid="cell-bane-2026-12-01"]').first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 300); await c.click(); await wait(s, 700)
    await hit(s, vis(s, '[data-testid="bid-more"]').first(), 500); await hit(s, vis(s, '[data-testid="bid-postout"]').first(), 600)
    /* the real sheet read: its words, and the look of its parts, to compare with the copy laid over Admin → Users */
    const look = sel => s.page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return { bg: c.backgroundColor, border: c.borderTopColor + ' ' + c.borderTopWidth, radius: c.borderTopLeftRadius, font: c.fontSize + ' ' + c.fontWeight, color: c.color, w: Math.round(e.getBoundingClientRect().width) } }, sel)
    const real = { sheet: await look('.bidsheet[role="dialog"]'), lab: await look('.bidsheet[role="dialog"] .po-outcomes .lab'), chipOn: await look('[data-testid="po-overseas"]'), chip: await look('[data-testid="po-delete"]'), button: await look('[data-testid="po-confirm"]') }
    FACT('sheet.real', { words: (await words(s, '.bidsheet[role="dialog"]'))[0], look: real })
    const html = await s.page.evaluate(([W6t]) => {
      const sh = document.querySelector('.bidsheet[role="dialog"]').cloneNode(true)
      sh.id = 'm6sheet'; sh.removeAttribute('data-testid')
      /* the leave rows are the day's leave, not the posting: left out (the panel's own rows kept whole) */
      for (const q of ['.bidsheet-dayline', '[data-testid="bid-rmk-row"]', '.bp-dur', '[data-testid="bid-leave-grid"]']) sh.querySelector(q)?.closest('.bidsheet-hd ~ *')?.remove()
      sh.querySelector('.bidsheet-hd .who').textContent = 'Jester'; sh.querySelector('.bidsheet-hd .when')?.remove(); sh.querySelector('[data-testid="bid-approve-tick"]')?.remove()
      /* POSTING: Transfer to Sqn chosen */
      const ov = sh.querySelector('[data-testid="po-overseas"]'), tr = sh.querySelector('[data-testid="po-transfer"]')
      ov.classList.remove('on'); ov.textContent = 'Overseas Sqn'; ov.setAttribute('aria-pressed', 'false')
      tr.disabled = false; tr.removeAttribute('disabled'); tr.removeAttribute('title'); tr.classList.add('on'); tr.textContent = '✓ Transfer to Sqn'; tr.setAttribute('aria-pressed', 'true')
      /* the new line "To 149 ▾" - drawn as the Fable drawer's u6-d-postout-sheet draws it (draw-r6-users.mjs), so one sheet
         is drawn one way: the "PO from" line cloned, its date box's look holding the squadron (a drop-down still fits
         many squadrons) */
      const outRow = sh.querySelector('.po-outcomes'); const to = sh.querySelector('[data-testid="po-date"]').closest('.bidsheet-row').cloneNode(true)
      to.id = 'm6to'; to.querySelector('.lab').textContent = W6t.toLabel
      const bx = to.querySelector('.datebox'); bx.removeAttribute('data-testid'); bx.removeAttribute('aria-label'); bx.querySelector('.datebox-txt').textContent = '149'
      outRow.after(to)
      sh.querySelector('[data-testid="po-line"]').textContent = W6t.line
      return sh.outerHTML
    }, [{ toLabel: W6.toLabel, line: W6.transferLine('1 Dec', '142', '149') }])
    /* to Admin → Users, Jester's archived row opened with the request (c), the press made; the sheet laid over it */
    await hit(s, vis(s, '[data-testid="bid-cancel"]').first(), 400)
    await usersTab(s); await wait(s, 500)
    if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 400)
    await hit(s, s.page.locator('#accArchList [data-person="ipman"] .acc-tap').first(), 700)
    await s.page.evaluate(([note, label]) => {
      const row = document.querySelector('#accArchList [data-person="ipman"]'), rs = row.querySelector('#accArRestore')
      const nb = rs.cloneNode(true); nb.id = 'm6RestorePost'; nb.textContent = label; nb.className = 'abtn primary'; rs.before(nb); rs.className = 'abtn'
      const tap = row.querySelector('.acc-tap'); const p = document.createElement('p'); p.className = 'adm-note acc-note'; p.id = 'm6Ask'; p.textContent = note; p.style.margin = '10px 0 12px'; (row.querySelector('input:not([type=hidden])').closest('.adm-2col') || row.querySelector('input').parentElement).before(p)
      const b = row.getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect(); scrollBy(0, b.top - bar.bottom - 20)
    }, [W6.askRowNote('Kestrel', '149'), W6.restoreAndPost('149')])
    await wait(s, 300)
    const placed = await s.page.evaluate(html => {
      /* the Leave War's sheet styles are scoped under its page (#page-leavewar, bidpicker.css): the copy is held in a
         transparent box of that name, its own `.stage` inside, so the page's own rules draw it */
      const host = document.createElement('div'); host.id = 'page-leavewar'; host.dataset.m6 = 'host'
      const stage = document.createElement('div'); stage.className = 'stage'; stage.innerHTML = html; host.appendChild(stage)
      Object.assign(host.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 600, background: 'transparent', display: 'block', padding: '0', margin: '0' })
      document.body.appendChild(host)
      const sh = host.querySelector('#m6sheet'); sh.style.pointerEvents = 'auto'
      /* the sheet hangs under the pressed button, as the Leave War hangs it under the pressed day */
      const btn = document.querySelector('#m6RestorePost').getBoundingClientRect()
      Object.assign(sh.style, { position: 'fixed', left: Math.round(btn.left - 12) + 'px', top: Math.round(btn.bottom + 10) + 'px', right: 'auto', bottom: 'auto', transform: 'none', margin: '0' })
      const r = sh.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), fits: r.bottom <= innerHeight }
    }, html)
    const copy = { sheet: await look('#m6sheet'), lab: await look('#m6sheet .po-outcomes .lab'), chipOn: await look('#m6sheet [data-testid="po-transfer"]'), chip: await look('#m6sheet [data-testid="po-delete"]'), button: await look('#m6sheet [data-testid="po-confirm"]') }
    FACT('sheet.copy', { placed, words: (await words(s, '#m6sheet'))[0], look: copy, sameLook: JSON.stringify({ ...real.sheet, w: 0 }) === JSON.stringify({ ...copy.sheet, w: 0 }) && JSON.stringify(real.chipOn) === JSON.stringify(copy.chipOn) && JSON.stringify(real.lab) === JSON.stringify(copy.lab) })
    await vring(s, await box(s, '#m6Ask'), 'note'); await vring(s, await box(s, '#m6RestorePost'), 'button')
    await vring(s, union(await box(s, '#m6sheet [data-testid="po-transfer"]'), await box(s, '#m6to'), await box(s, '#m6sheet [data-testid="po-line"]')), 'transfer')
    await shot(s, 'm6-d-itshim-sheet', [await box(s, '#m6sheet'), await box(s, '#accArchList [data-person="ipman"]')])
  }, { state: ST })
} finally { await closeAll() }
