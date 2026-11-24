// Walker e of the round-4 words walk (re-walk after three fixes, 24 Nov 26): the run's own picture folder, then the
// shared helpers. const E = await (await import('./wr4-e-common.mjs')).setup('e1')
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const B = { fixed: 'D:/rw4/build-new3', before: 'D:/rw4/build-new2' }
export async function setup(tag) {
  const run = tag + '-' + new Date().toISOString().slice(11, 19).replace(/:/g, '')
  process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/e', run)
  process.env.WR4_NEW ||= B.fixed
  const L = await import('./wr4-lib.mjs')
  const TMP = join(HERE, '../../.tmp/wr4-e'); mkdirSync(TMP, { recursive: true })
  const res = []
  const judge = (c, step, verdict, got, expected, pic) => { res.push({ c, step, verdict, got, expected, pic }); console.log(`${verdict} ${c} ${step}: ${JSON.stringify(got).slice(0, 300)}`) }
  const save = () => writeFileSync(join(TMP, run + '.json'), JSON.stringify({ run, out: process.env.WR4_OUT, res, facts: L.facts }, null, 1))
  /* the note at the foot as it shows, held, pictured whole-screen and cropped; returns its words ('' if none) */
  async function note(w, c, name, re = /./, timeout = 6000) {
    const t = await L.catchToast(w.page, re, timeout)
    if (!t) { const now = await L.shownToast(w.page); return { text: '', now } }
    const geo = await w.page.evaluate(() => { const e = document.getElementById('toastEl'); const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), vw: innerWidth, vh: innerHeight } })
    await L.shot(w.page, c, name, await L.toastClip(w.page, 30), t, w.size, { geo })
    await L.releaseToast(w.page)
    return { text: t, geo, pic: name + '.png' }
  }
  const noteGone = async (w, ms = 7000) => { try { await w.page.waitForFunction(() => { const t = document.getElementById('toastEl'); return !t || +getComputedStyle(t).opacity < 0.05 }, null, { timeout: ms }) } catch {} }
  return { ...L, run, judge, save, note, noteGone, TMP, B }
}
