/* THE MOCK-UP for D118 (25 Sep 26): the handover point on a day never published — his "can u show me a mock up of 1
   and 3" (the button's word: "Set checkpoint" / "Hand over") and "a mock up of orig tag hollow and another one thats
   hollow and dotted exterior just like the rest of the tags when they are pending changes".
   Drawn on the real app (the demo week, the production build): Monday published as the Original with one change
   waiting (its REAL hollow dotted AL1 tag, the comparison); Tuesday never published, carrying the proposed head (the
   button beside Publish day, the "who set it" line under the head, the pending button) and the proposed ORIG tag on two
   changed pucks. Everything proposed is injected just before each picture; nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-checkpoint.mjs desktop  |  node mk-checkpoint.mjs phone */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = W === 'phone' ? 3 : 2
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/checkpoint'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, signDay, publishDay, board, closeBoard } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })

await editWeek(page)
await signDay(page, 0); await publishDay(page, 0)          // Monday: the published Original
/* …with one REAL change waiting, so the app draws its own hollow dotted AL1 tag: Monday's first flying seat's man
   swapped with its back-seater, through the app's own write */
await page.evaluate(() => { const a = window.slotVal('0.0.0.0.p'), b = window.slotVal('0.0.0.0.w'); window.setSlotVal('0.0.0.0.p', b); window.setSlotVal('0.0.0.0.w', a); window.afterSchedMutate() })
await page.waitForTimeout(600)

const WORDS = {
  cp: { btn: 'Set checkpoint', line: 'Checkpoint', chip: '3 since checkpoint' },
  ho: { btn: 'Hand over', line: 'Handed over', chip: '3 since hand-over' },
}
const TAGS = {
  plain: 'border:1px solid rgba(241,244,247,.9)',
  dotted: 'border:1px dotted #F1F4F7',
}
const TAGCSS = (b) => `.seat[data-mkorig]{position:relative}
.seat[data-mkorig]::after{content:'ORIG';position:absolute;top:-5px;right:-3px;z-index:4;font-family:'Barlow Condensed','Inter Tight',sans-serif;
  font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;padding:0 2px;border-radius:4px;background:var(--panel);color:#F1F4F7;${b};pointer-events:none}
.mk-line .sl-h{color:#F1F4F7}`

/* stage one variant on the surface in view: the proposed head on Tuesday, the ORIG tag on two of Tuesday's pucks, the real
   waiting AL1 tag on one of Monday's */
async function stage(word, tag, where) {
  await page.evaluate(([w, css, where]) => {
    document.querySelectorAll('style[data-mk],.mk-el').forEach(x => x.remove())
    document.querySelectorAll('[data-mkorig]').forEach(x => x.removeAttribute('data-mkorig'))
    const st = document.createElement('style'); st.dataset.mk = '1'; st.textContent = css; document.head.appendChild(st)
    const root = where === 'board' ? document.querySelector('#schedBoard') : document.querySelector('#eWeek .day[data-day="1"]')
    const seats = [...root.querySelectorAll('.seat')].filter(s => s.querySelector('.puck') && s.offsetWidth)
    ;[seats[0], seats[2]].forEach(s => s && s.setAttribute('data-mkorig', '1'))
    if (where === 'week') {
      /* Monday's AL1 tag is REAL (a change made above) */
    }
    const pub = root.querySelector('[data-beak="1"]')
    if (pub) pub.insertAdjacentHTML('afterend', `<button class="dbeak dunpub mk-el" title="">${w.btn}</button>`)
    const chip = `<button class="dpend dpendbtn mk-el">${w.chip}</button>`
    const tpl = where === 'board' ? null : [...root.querySelectorAll('button')].find(b => /Templates/.test(b.textContent || ''))
    const tag = where === 'board' ? root.querySelector('.sb-pub .verchip') : null
    if (tpl) tpl.insertAdjacentHTML('afterend', chip); else if (tag) tag.insertAdjacentHTML('afterend', chip); else if (pub) pub.insertAdjacentHTML('beforebegin', chip)
    const line = `<div class="signedln mk-line mk-el"><span class="sl-h">${w.line}</span><span class="sl-n"><i>BY</i>Admin</span><span class="sl-n"><i>AT</i>25/9 14:05</span></div>`
    const head = where === 'board' ? root.querySelector('.sb-pub') : root.querySelector('.day-head')
    head && head.insertAdjacentHTML('afterend', line)
  }, [WORDS[word], TAGCSS(TAGS[tag]), where])
  await page.waitForTimeout(150)
}
async function shot(sel, name, { pad = 6, h = 0, mon = false } = {}) {
  const clip = await page.evaluate(([sel, pad, h, mon]) => {
    const el = document.querySelector(sel); el.scrollIntoView({ block: 'start', inline: 'nearest' })
    /* clear of the sticky bars: scroll up until the element's own top edge is what the page shows there */
    for (let i = 0; i < 20; i++) {
      const q = el.getBoundingClientRect(), hit = document.elementFromPoint(Math.max(1, q.left + 8), Math.max(1, q.top + 3))
      if (hit && (el === hit || el.contains(hit))) break
      window.scrollBy(0, -30)
    }
    window.scrollBy(0, -8)
    /* the day repaints as it scrolls into view, so Monday's AL1 tag goes on after the scroll */
    const r = el.getBoundingClientRect()
    const x = Math.max(0, r.left - pad), y = Math.max(0, r.top - pad)
    return { x, y, width: Math.min(r.width + 2 * pad, innerWidth - x), height: Math.min((h || r.height) + 2 * pad, innerHeight - y) }
  }, [sel, pad, h, mon])
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${OUT}/${W}-${name}.png`, clip })
}

/* the edit week: Tuesday's head and top, per word; Tuesday's pucks beside Monday's, per tag */
const tue = '#eWeek .day[data-day="1"]'
await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="1"]'); d && d.scrollIntoView({ block: 'start', inline: 'start' }) })
await page.waitForTimeout(300)
for (const w of Object.keys(WORDS)) { await stage(w, 'dotted', 'week'); await shot(tue, `week-head-${w}`, { h: W === 'phone' ? 330 : 300 }) }
for (const t of Object.keys(TAGS)) {
  await stage('cp', t, 'week')
  const sel = await page.evaluate(() => {
    const s = document.querySelector('#eWeek .day[data-day="1"] [data-mkorig]'); const blk = s && s.closest('.wave,.go,.sb-go,.blk,section,.panel,.dsec')
    if (blk) { blk.setAttribute('data-mkshot', 'tue'); return '[data-mkshot="tue"]' } return null
  })
  if (sel) await shot(sel, `week-tags-${t}`, { h: 260 })
  const mon = await page.evaluate(() => {
    const s = document.querySelector('#eWeek .day[data-day="0"] .seat[data-aln="1"]'); const blk = s && s.closest('.wave,.go,.sb-go,.blk,section,.panel,.dsec')
    if (blk) { blk.setAttribute('data-mkshot', 'mon'); return '[data-mkshot="mon"]' } return null
  })
  if (mon && t === 'plain') await shot(mon, `week-tags-monday-al1`, { h: 260, mon: true })
}

/* the board, on Tuesday: its strip per word, and its pucks per tag */
await board(page, 1)
for (const w of Object.keys(WORDS)) { await stage(w, 'dotted', 'board'); await shot('#schedBoard .sb-pub', `board-strip-${w}`, { h: 120 }) }
for (const t of Object.keys(TAGS)) {
  await stage('cp', t, 'board')
  const sel = await page.evaluate(() => {
    const s = document.querySelector('#schedBoard [data-mkorig]'); const blk = s && s.closest('.sb-go,.sb-sec,.go,section')
    if (blk) { blk.setAttribute('data-mkshot', 'b'); return '[data-mkshot="b"]' } return null
  })
  if (sel) await shot(sel, `board-tags-${t}`, { h: 240 })
}
await closeBoard(page)
console.log('errors', JSON.stringify(errors))
await browser.close()
