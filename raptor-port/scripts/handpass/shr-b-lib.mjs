// Walker b of the shared-row walk (pull request 845, 25 Nov 26): the run's own picture folder, the frozen build, then
// the shared helpers of wr4-lib.mjs, and the week's own reads. Import FIRST:
//   const B = await (await import('./shr-b-lib.mjs')).setup('b1')
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(HERE, '../..')
export const TMP = join(ROOT, '.tmp/shr-b'); mkdirSync(TMP, { recursive: true })
export const BUNDLE = process.env.SHR_BUNDLE || 'index-BiU7Aj55.js'   // a later round's build names its own (chat 181)

export async function setup(tag) {
  const run = tag + '-' + new Date().toISOString().slice(11, 19).replace(/:/g, '')
  process.env.WR4_OUT ||= join(ROOT, 'docs/img/handpass/2026-11-25-shared-row/b', run)
  process.env.WR4_NEW ||= join(ROOT, '.tmp/build-6c7f3aac7')
  const L = await import('./wr4-lib.mjs')
  const J = JSON.stringify
  const res = []
  const OUT = process.env.WR4_OUT
  /* one judged line: PASS / FAIL / RECORD / NOT WALKED */
  const judge = (id, cfg, verdict, what, pics = '') => { const r = { id, cfg, verdict, what, pics }; res.push(r); console.log(`RESULT ${id} | ${cfg} | ${verdict} | ${typeof what === 'string' ? what : J(what)} | ${pics}`) }
  const save = () => { writeFileSync(join(TMP, run + '.json'), J({ run, out: OUT, res, facts: L.facts }, null, 1)); appendFileSync(join(TMP, 'results.jsonl'), res.map(r => J({ run, ...r })).join('\n') + (res.length ? '\n' : '')) }
  const done = async () => { save(); console.log(`\n${run}: ` + ['PASS', 'FAIL', 'RECORD', 'NOT WALKED'].map(k => `${k} ${res.filter(v => v.verdict === k).length}`).join(' · ') + ` · pictures ${L.facts.pictures.length} · errors ${L.facts.errors.length}`); for (const e of L.facts.errors.slice(0, 12)) console.log('  err ' + e.slice(0, 220)); await L.finish() }

  /* a fresh world: the admin signed in, the bundle proved */
  async function start(size = 'desk', eng = 'chromium', who = 'ad') {
    const w = await L.newPage(size, undefined, L.NEW_DIR, eng)
    await L.signIn(w, who)
    const b = await L.bundleOf(w.page)
    console.log(`bundle ${b} (${size} ${eng})`)
    if (b !== BUNDLE) throw new Error('WRONG BUNDLE ' + b)
    w.eng = eng
    return w
  }
  const NAME = { bane: 'Ranger', rocky: 'Hex' }
  /* the STORE: every input on the day of the named people (by person id), any type */
  const store = (page, date = 'Jul 15', who = ['bane', 'rocky']) => page.evaluate(([date, who]) => {
    const nm = id => (window.PEOPLE && window.PEOPLE[id] && (window.PEOPLE[id].cs || window.PEOPLE[id].name)) || id
    const hm = m => m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
    return window.INPUTS.filter(r => (r.people || []).some(x => who.includes(x.p)) && (r.date === date || (r.endDate && window.DAYS && false))).map(r => `${r.type} ${(r.people || []).map(x => nm(x.p)).join('+')} ${r.allday ? 'allday' : hm(r.s) + '-' + hm(r.e)}${r.half ? ' half:' + r.half : ''} "${r.remarks || ''}"${r.endDate && r.endDate !== r.date ? ' to ' + r.endDate : ''} [${r.iid}]`)
  }, [date, who])
  /* the STORE over a span: every input covering any of the dates */
  const storeAll = (page, who = ['bane', 'rocky']) => page.evaluate(who => {
    const nm = id => (window.PEOPLE && window.PEOPLE[id] && (window.PEOPLE[id].cs || window.PEOPLE[id].name)) || id
    const hm = m => m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
    return window.INPUTS.filter(r => (r.people || []).some(x => who.includes(x.p)) && /Jul|Aug/.test(r.date || '')).map(r => `${r.type} ${(r.people || []).map(x => nm(x.p)).join('+')} ${r.date}${r.endDate && r.endDate !== r.date ? '→' + r.endDate : ''} ${r.allday ? 'allday' : hm(r.s) + '-' + hm(r.e)}${r.half ? ' half:' + r.half : ''} "${r.remarks || ''}" [${r.iid}]`)
  }, who)
  /* the SCREEN on the week: each Unavailable row of day `di` holding a data-inp start cell — the man, the three values, the address */
  const weekRows = (page, di) => page.evaluate(di => {
    const out = []
    for (const s of document.querySelectorAll(`#eWeek .day[data-day="${di}"] [data-inp$=".str"]`)) {
      if (s.getBoundingClientRect().width < 1) continue
      const row = s.closest('.pl-row, .unav-row, tr, li') || s.parentElement
      const k = s.getAttribute('data-inp').replace(/\.str$/, '')
      const v = f => { const e = row.querySelector(`[data-inp="${k}.${f}"]`); return e ? (e.textContent || '').trim() : '(none)' }
      const names = [...row.querySelectorAll('*')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 1).map(e => (e.textContent || '').trim()).filter(Boolean)
      const who = names.find(t => /^(Ranger|Hex|Outlaw|Saber|Drifter|Viper|Maverick|Iceman)$/.test(t)) || names.slice(0, 3).join('/')
      out.push(`${who} ${v('str')}-${v('end')} "${v('rmks')}" [${k}]`)
    }
    return out
  }, di)
  const caret = page => page.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('data-inp') || a.getAttribute('data-ifld') || a.getAttribute('data-txt') || (a.tagName + (a.id ? '#' + a.id : ''))) : null })
  /* the Board's Unavailable rows (as shr-w3 rows()) */
  const boardRows = page => page.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-ifld$=".str"]')].map(e => { const row = e.closest('tr, .sb-arow, .sb-row') || e.parentElement; const who = (row.innerText || '').replace(/\s+/g, ' '); const m = /Ranger|Hex|Outlaw/.exec(who); return m ? `${m[0]} ${e.value}-${row.querySelector('[data-ifld$=".end"]')?.value} "${row.querySelector('[data-ifld$=".rmks"]')?.value || ''}" [${e.getAttribute('data-ifld')}]` : null }).filter(Boolean))
  /* the week's cell of a man's row on day di, field f: its selector (found by his person id in the address) */
  const weekCell = async (page, di, pid, f) => {
    const k = await page.evaluate(([di, pid, f]) => {
      let e = [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] [data-inp$="~${pid}.${f}"]`)].find(x => x.getBoundingClientRect().width > 1)
      /* a row repainted as his own input carries the bare id: found by his puck on the Unavailable row */
      if (!e) { const rows = [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] .sec-unav .pl-row`)].filter(r => r.querySelector(`.puck[data-person="${pid}"]`) && r.querySelectorAll('.puck[data-person]').length === 1); for (const r of rows) { const x = r.querySelector(`[data-inp$=".${f}"]`); if (x && x.getBoundingClientRect().width > 1) { e = x; break } } }
      return e ? e.getAttribute('data-inp') : null
    }, [di, pid, f])
    return k ? `#eWeek .day[data-day="${di}"] [data-inp="${k}"]` : null
  }
  /* type into a contenteditable cell: click (or tap), select all, type */
  async function typeIn(w, sel, v) {
    const b = w.page.locator(sel).first()
    await b.evaluate(el => el.scrollIntoView({ block: 'center' }))
    if (w.tap) await b.tap(); else await b.click()
    await L.sleep(200)
    await w.page.keyboard.press('Control+A')
    if (v === '') await w.page.keyboard.press('Backspace'); else await w.page.keyboard.type(v, { delay: 20 })
  }
  /* a picture of the day's Unavailable block on the week (or the given selectors) */
  async function pic(w, c, name, sels, text, opts = {}) {
    /* the subject brought into view first (walk-scripts §5) — never while a box holds the caret, unless asked */
    const inView = await w.page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 1); if (!e) return null; const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight }, sels[0])
    if (inView === false && !opts.noScroll) await w.page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 1); e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, sels[0])
    let clip = await L.boxOf(w.page, sels, 10)
    if (!clip || clip.width <= 1 || clip.height <= 1) clip = { x: 0, y: 0, ...w.page.viewportSize() }
    await L.shot(w.page, c, name, clip, text, w.size)
    return name + '.png'
  }
  /* the three reads after a save: store, screen (Ranger's and Hex's rows, or every row), caret */
  async function state(w, c, step, di, opts = {}) {
    const st = await store(w.page, opts.date, opts.who)
    const rows = (opts.board ? await boardRows(w.page) : await weekRows(w.page, di)).filter(r => opts.all || /^(Ranger|Hex|Outlaw) /.test(r))
    const s = { step, store: st, screen: rows, caret: await caret(w.page) }
    L.log(c, `${step} :: STORE ${J(st)} :: SCREEN ${J(rows)} :: CARET ${s.caret}`)
    return s
  }
  /* the day brought into view on the week (the phone's strip: as a swipe would) */
  const showDay = (page, di) => page.evaluate(di => { const d = document.querySelector(`#eWeek .day[data-day="${di}"]`); if (d) d.scrollIntoView({ block: 'start', inline: 'start' }) }, di)
  const reloadWeek = async (w, who = 'ad') => {
    await w.page.reload(); await L.sleep(900)
    if (await w.page.locator('#luser').isVisible().catch(() => false)) await L.signIn(w, who)
    await w.page.waitForSelector('#vWeek .day, #eWeek .day', { state: 'attached' }).catch(() => {})
    await w.page.addStyleTag({ content: L.NOMOTION })
    await L.go(w.page, 'editsched'); await L.sleep(600)
  }
  const undoCount = page => page.evaluate(() => { const b = document.getElementById('undoBtn'); return b ? { disabled: b.disabled, title: b.getAttribute('title') || '', aria: b.getAttribute('aria-label') || '', text: (b.textContent || '').trim() } : null })
  return { ...L, L, run, J, res, judge, save, done, start, store, storeAll, weekRows, caret, boardRows, weekCell, typeIn, pic, undoCount, state, showDay, reloadWeek, OUT, NAME }
}
