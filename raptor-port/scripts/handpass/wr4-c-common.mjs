// Walker c of the round-4 words walk (chat 170, 24 Nov 26): sets the run's own picture folder, then loads the shared
// helpers. Import this FIRST from each wr4-c-*.mjs:  const C = await (await import('./wr4-c-common.mjs')).setup('c3')
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
export async function setup(tag) {
  const run = tag + '-' + new Date().toISOString().slice(11, 19).replace(/:/g, '')
  process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/c', run)
  process.env.WR4_NEW ||= 'D:/rw4/build-new'
  process.env.WR4_OLD ||= 'D:/rw4/build-main'
  const L = await import('./wr4-lib.mjs')
  const TMP = join(HERE, '../../.tmp/wr4-c'); mkdirSync(TMP, { recursive: true })
  const res = []
  /* one judged or recorded line: verdict PASS / FAIL / RECORD / NOTE */
  const judge = (c, step, verdict, got, expected, pic) => { const r = { c, step, verdict, got, expected, pic }; res.push(r); console.log(`${verdict} ${c} ${step}: ${JSON.stringify(got).slice(0, 160)}`) }
  const save = () => writeFileSync(join(TMP, run + '.json'), JSON.stringify({ run, out: process.env.WR4_OUT, res, facts: L.facts }, null, 1))
  /* the note at the foot as it shows, held; a picture of it; returns its words (or '' if none showed) */
  async function note(w, c, name, re = /./, timeout = 6000) {
    const t = await L.catchToast(w.page, re, timeout)
    if (!t) { const now = await L.shownToast(w.page); return { text: '', now } }
    const geo = await w.page.evaluate(() => { const e = document.getElementById('toastEl'); const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth } })
    await L.shot(w.page, c, name, { x: 0, y: 0, width: geo.vw, height: geo.vh }, t, w.size, { geo })
    await L.releaseToast(w.page)
    return { text: t, geo, pic: name + '.png' }
  }
  /* wait for the note to be gone (or replaced) */
  const noteGone = async (w, ms = 7000) => { try { await w.page.waitForFunction(() => { const t = document.getElementById('toastEl'); return !t || +getComputedStyle(t).opacity < 0.05 }, null, { timeout: ms }) } catch {} }
  return { ...L, run, judge, save, note, noteGone, TMP }
}
