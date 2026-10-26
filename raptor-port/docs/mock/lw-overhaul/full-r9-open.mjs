// Round 9 (22 Oct 26): five pictures for the open questions, each the final set's picture with ONE change, drawn INTO
// THE REAL LOCAL BUILD on the staged squadron (clock Thu 8 Jan 26; <LWMOCK_OUT>/out/state.json). Nothing here is built.
//   r9-q1-admin-desk         r7-03 with Approvals showing only its count, no "● 3 new" (D1208: the admin is not flooded)
//   r9-urho-users-desk       Admin → Users with a "Leave War" column of dots (on for Ranger, the URHO)
//   r9-urho-ranger-phone     Ranger, a member who runs the Leave War: Approvals on line 1 and the ⚙ in the grid card's row
//   r9-q12-phone             r7-01 with no zoom buttons (pinch only); a pinch icon drawn as a hint for the PICTURE only
//   r9-remarks-bid-phone     r7-10 with a one-line "Remarks" box between Document and Which leave (D1210)
//   r9-remarks-closed-phone  r7-09 with its Remarks row holding "Form to follow", and Delete (Q5)
//   r9-q3-edit-phone         r7-21 with the line "left after your 2½ waiting days: 14.5" (Q3)
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r9-open.mjs        (R9_ONLY=q1,q12 for a few)
// Shared parts and marks: full-r7-one.mjs. The three r7 scripts draw every scene when imported, so their helpers are
// READ from their files (between named markers, unchanged) and run here — one source, nothing copied by hand.
// The bid window carries D1212's labels (Date, Duration) — ruled after r7-10 was drawn.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, unmk, UNDER, MGMT } from './full-r7-one.mjs'
import { LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H as WH, fill as WFILL } from './full-win-a-lib.mjs'
const ONLY = (process.env.R9_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

// ---- the r7 scripts' helpers, read from their files between two markers each
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const pageSrc = SRC('full-r7-page.mjs'), decideSrc = SRC('full-r7-decide.mjs'), personSrc = SRC('full-r7-person.mjs')
const PG = load(cut(pageSrc, 'const UP = ', '// ======================= r7-01') + cut(pageSrc, 'async function closedTap', "if (want('08'))"),
  { browser, state, newPage, signIn, shot, q, errs, OUT, gridTo, oneStage, oneFold, mk, unmk, join },
  ['setup', 'pastClosed', 'cellHTML', 'closedTap', 'HD', 'UP'])
const DC = load(cut(decideSrc, '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state },
  ['stage', 'zfOf', 'fill', 'reveal', 'ring', 'H', 'dayLine', 'docRow', 'whichLeave'])
const PR = load(cut(personSrc, 'const CHEV', '// ---------- r7-20'),
  { oneStage, mk, unmk, MGMT, LOCK_SVG, CLIP_SVG, H: WH, fill: WFILL, q, gridTo, shot, newPage, signIn, browser, state },
  ['stage', 'gridAsBuilt', 'openPerson', 'personHTML', 'placePhone', 'ME'])

// ======================= r9-q1 — the admin's desktop page: Approvals with its count only =======================
if (want('q1')) {
  const { ctx, p } = await PG.setup('desk', 'admin')
  // D1208: the admin is not flooded — Approvals shows its count, no "● 3 new" (the "new" mark stays a member's, Q1)
  await oneStage(p, { phone: false, member: false, mlNew: false, apNew: false })
  await shot(p, 'r9-q1-admin-desk-clean')
  await mk(p, '[data-zk="appr"]', '1', { prefer: ['e', 'ne'] })
  await shot(p, 'r9-q1-admin-desk')
  await ctx.close()
}

// ======================= r9-urho-users — Admin → Users, a "Leave War" column =======================
if (want('users')) {
  const { ctx, p } = await newPage(browser, 1536, 860, false, state)
  await signIn(p, 'admin')
  await p.evaluate(() => window.go('admin')); await p.waitForTimeout(1000)
  // the list's own search, so the column headings and Ranger stand in one screen
  await p.fill('#accFind', 'er'); await p.waitForTimeout(500)
  const r = await p.evaluate(() => {
    const hd = document.querySelector('.od-cols'); if (!hd) return 'no headings'
    const cols = [...hd.querySelectorAll('.od-c')]
    const h = cols[cols.length - 1].cloneNode(true); h.textContent = 'Leave War'; h.dataset.zk = 'lwcol'; Object.assign(h.style, { whiteSpace: 'nowrap', width: '84px', flex: 'none' }); cols[cols.length - 1].after(h)
    // the "off" dot is the app's own: a row with no sign-in shows it in its Sign-in column
    const offRow = [...document.querySelectorAll('.od-row')].find(r => /no sign-in/.test(r.textContent))
    const offCls = offRow?.querySelector('[data-testid^="dot-signin-"] i')?.className ?? ''
    let n = 0
    for (const row of document.querySelectorAll('.od-row')) {
      const ro = row.querySelector('[data-testid^="dot-roster-"]'); if (!ro) continue
      const id = row.dataset.person
      // Ranger runs the Leave War (the URHO); an admin always does, by his role
      const on = id === 'bane' || /\bAdmin\b/.test(row.querySelector('.od-rc')?.textContent || '')
      const s = ro.cloneNode(true); s.removeAttribute('data-testid'); s.dataset.zk = 'lw-' + id
      s.title = on ? 'Runs the Leave War' : 'Does not run the Leave War'; s.setAttribute('aria-label', s.title)
      s.querySelector('i').className = on ? 'g' : offCls
      Object.assign(s.style, { width: '84px', flex: 'none' })
      ro.after(s); n++
    }
    return { offCls, n, hdW: h.getBoundingClientRect().width, over: h.scrollWidth - h.clientWidth }
  })
  console.log('users', JSON.stringify(r))
  await p.evaluate(() => document.querySelector('[data-zk="lw-bane"]')?.scrollIntoView({ block: 'center' }))
  await p.evaluate(() => { const h = document.querySelector('.od-cols').getBoundingClientRect(); window.scrollBy(0, h.top - 150) })
  await p.mouse.move(2, 2)
  await shot(p, 'r9-urho-users-desk-clean')
  await mk(p, '[data-zk="lwcol"]', '1', { prefer: ['ne', 'n'] })
  await mk(p, '[data-zk="lw-bane"]', '2', { prefer: ['e', 'ne'] })
  await shot(p, 'r9-urho-users-desk')
  await ctx.close()
}

// ======================= r9-urho-ranger — Ranger, the URHO, on his phone =======================
if (want('ranger')) {
  const { ctx, p } = await PG.setup('phone', 'member')
  await PG.pastClosed(p)
  // he has the admin's Approvals (line 1, its count only — D1208) and the ⚙; nothing else of an admin's — no "+",
  // no ⇅ Rearrange, no rename cue. With Approvals on line 1, My leave takes its own third line, as the admin's phone has it
  await oneStage(p, { phone: true, member: false, apNew: false, fig: { lve: '14.5', oil: '0', waiting: 2, next: '19 Jan' } })
  await p.evaluate(() => {
    document.querySelector('#page-leavewar .zchip.sq')?.remove()
    const m = document.querySelector('[data-testid="counts-toggle"]')
    m?.insertAdjacentHTML('afterend', '<button class="rtbtn gear" data-zk="gear" title="Settings — counters, event rows and roster groups" aria-label="Settings">⚙</button>')
    // a member's Manning stays folded (Q9); the rename cue the admin stage added stays off for him
    for (const b of document.querySelectorAll('#page-leavewar td.who button.flyname')) { const w = b.parentElement; while (b.firstChild) w.insertBefore(b.firstChild, b); b.remove() }
  })
  await gridTo(p, '2026-01-06', 'bane')
  await shot(p, 'r9-urho-ranger-phone-clean')
  await mk(p, '[data-zk="appr"]', '1', { prefer: ['n', 'nw'] })
  await mk(p, '[data-zk="gear"]', '2', { prefer: ['n', 'ne'] })
  await shot(p, 'r9-urho-ranger-phone')
  await ctx.close()
}

// ======================= r9-q12 — no zoom buttons on a phone: pinch only =======================
const PINCH = '<svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true"><circle cx="48" cy="48" r="46" fill="rgba(11,13,16,.78)" stroke="rgba(241,244,247,.6)" stroke-width="1.5"/>'
  + '<circle cx="35" cy="61" r="9" fill="rgba(241,244,247,.9)"/><circle cx="61" cy="35" r="9" fill="rgba(241,244,247,.9)"/>'
  + '<g fill="none" stroke="rgba(241,244,247,.9)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M27 69 17 79M17 79h9M17 79v-9"/><path d="M69 27 79 17M79 17h-9M79 17v9"/></g></svg>'
if (want('q12')) {
  const { ctx, p } = await PG.setup('phone', 'member')
  await PG.pastClosed(p)
  await gridTo(p, '2026-01-06', 'bane')
  await p.evaluate(PINCH => {
    // the zoom pair goes; its place is kept empty only so the picture can mark where it stood
    document.querySelectorAll('[data-testid="lw-zoom"] > *').forEach(b => { b.style.visibility = 'hidden' })
    const d = document.createElement('div'); d.className = 'zz-pinch'; d.innerHTML = PINCH
    Object.assign(d.style, { position: 'fixed', left: '262px', top: '470px', width: '96px', height: '96px', zIndex: 90, pointerEvents: 'none' })
    document.body.appendChild(d)
  }, PINCH)
  await shot(p, 'r9-q12-phone-clean')
  await mk(p, '[data-testid="lw-zoom"]', '1')
  await mk(p, '.zz-pinch', '2', { ring: false, prefer: ['nw', 'w'] })
  await shot(p, 'r9-q12-phone')
  await ctx.close()
}

// ======================= r9-remarks-bid — the member's bid window with Remarks (D1210) =======================
const REM_CSS = `.bidsheet .zz-remrow .rmk-field{flex:1;min-width:0;height:30px;min-height:0;margin:0;padding:4px 10px;box-sizing:border-box;resize:none;font:inherit;font-size:var(--zf,13px);color:var(--ink,#e6edf3);background:var(--panel-2,#12161b);border:1px solid var(--edge,#2f3a46);border-radius:8px}
.bidsheet .zz-remrow .rmk-field::placeholder{color:#6b7785}`
const remRow = (H, val) => H.row('Remarks', `<input class="rmk-field" type="text" placeholder="Remarks" aria-label="Remarks"${val ? ` value="${val}"` : ''}>`, 'zz-remrow')
if (want('rbid')) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member'); await oneFold(p)
  await gridTo(p, '2026-01-19', 'bane'); await p.tap(q('cell-bane-2026-01-23')); await p.waitForTimeout(600)
  await DC.stage(p, true, { member: true, mlNew: true })
  await DC.zfOf(p)
  const H = DC.H
  const html = H.hd('Ranger', 'Fri 23 Jan') + DC.dayLine()
    + H.row('Date', '<button class="pchip on">Just this day</button><button class="pchip">Pick a range</button>')
    + H.row('Duration', '<button class="pchip on">Whole day</button><button class="pchip">AM</button><button class="pchip">PM</button>')
    + DC.docRow() + remRow(H) + DC.whichLeave('wt')
  await DC.fill(p, html)
  await p.evaluate(css => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s) }, REM_CSS)
  await p.waitForTimeout(200)
  console.log('reveal', await DC.reveal(p, 'cell-bane-2026-01-23')); await DC.ring(p, 'cell-bane-2026-01-23')
  await shot(p, 'r9-remarks-bid-phone-clean')
  await mk(p, '.zz-remrow', '1')
  await shot(p, 'r9-remarks-bid-phone')
  await ctx.close()
}

// ======================= r9-remarks-closed — his waiting bid on a day since closed, its Remarks typed =======================
if (want('rclosed')) {
  // the closed-tap scene of r7-09 (its window lettered in the app's own pieces); the remarks style rides in a <style> of the window
  const bid = PG.cellHTML([{ code: 'LL', st: 'wait', half: '' }])
  await PG.closedTap('r9-remarks-closed-phone', {
    setup: { cells: { 'cell-bane-2026-04-01': [{ code: 'LL', st: 'wait', half: '' }] }, fig: { lve: '13.5', waiting: 3 } }, bal: ['13.5', '6.5'],
    html: `<style>${REM_CSS}</style>` + PG.HD('Ranger', 'Wed 1 Apr')
      + `<div class="bidsheet-row"><span class="lab">Your bid</span><span class="zz-bidln" data-zk="bid"><span class="zkb">${bid}</span>Whole day<span class="s">· waiting</span></span></div>`
      + `<div class="zz-note" data-zk="note">Your bid waits for a decision. Delete it if you no longer want it.</div>`
      + `<div class="bidsheet-row"><span class="lab">Selected</span><button class="dchip del" data-zk="del">Delete</button><button class="pchip" data-zk="doc" style="display:inline-flex;align-items:center;gap:6px">${PG.UP} Document</button></div>`
      + `<div class="bidsheet-row zz-remrow" data-zk="rem"><span class="lab">Remarks</span><input class="rmk-field" type="text" placeholder="Remarks" aria-label="Remarks" value="Form to follow"></div>`,
    marks: [['[data-zk="rem"]', '1'], ['[data-zk="del"]', '2']],
  })
}

// ======================= r9-q3 — his LVE edited: the line under the box (Q3) =======================
if (want('q3')) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await PR.stage(p, true, PR.ME.member); await PR.gridAsBuilt(p)
  await PR.openPerson(p, true, 'bane', PR.personHTML('bane', { edit: true, editing: true }))
  // Q3's wording: his waiting bids counted in days (2½: Mon 26 – Tue 27 Jan and Thu 29 Jan AM), not in bids
  await p.evaluate(() => { const n = document.querySelector('.zz-note'); if (n) n.innerHTML = 'left after your 2½ waiting days: <b>14.5</b>' })
  await p.evaluate(() => {
    const k = document.createElement('div'); k.className = 'r7-kbd zz-kbd'
    const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['.', '', 'f'], ['0', ''], ['⌫', '', 'f']]
    k.innerHTML = `<div class="acc">Done</div><div class="keys">${keys.map(([a, b, f]) => `<span class="k${f ? ' f' : ''}">${a}${b ? `<small>${b}</small>` : ''}</span>`).join('')}</div>`
    document.body.appendChild(k)
  })
  const kh = await p.evaluate(() => document.querySelector('.zz-kbd').getBoundingClientRect().height)
  await PR.placePhone(p, Math.round(kh))
  const fit = await p.evaluate(() => { const n = document.querySelector('.zz-note'); return n ? n.scrollWidth - n.clientWidth : 'none' })
  console.log('q3 note overflow', fit)
  await shot(p, 'r9-q3-edit-phone-clean')
  await mk(p, '.zz-note', '1', { prefer: ['in'] })
  await shot(p, 'r9-q3-edit-phone')
  await ctx.close()
}

await browser.close(); console.log('errors:', errs)
