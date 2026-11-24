// Walker d of the round-4 words walk (re-walk after the fix, 24 Nov 26): the run's folder, then the shared helpers.
// const { L, A } = await setup('d1-r1')
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const TMP = join(HERE, '../../.tmp/wr4-d')
mkdirSync(TMP, { recursive: true })
export const B = { fixed: 'D:/rw4/build-new2', before: 'D:/rw4/build-new', main: 'D:/rw4/build-main' }

export async function setup(run) {
  process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/d', run)
  process.env.WR4_NEW ||= B.fixed
  process.env.WR4_OLD ||= B.main
  const L = await import('./wr4-lib.mjs')
  const verdicts = []
  const A = {
    verdicts,
    judge(c, label, ok, observed) { const v = ok === null ? 'RECORD' : ok ? 'PASS' : 'FAIL'; verdicts.push({ c, v, label, observed }); L.log(c, `${v} ${label} — ${JSON.stringify(observed)}`) },
    said: lines => lines.map(l => `${l.name} ${l.day} / ${l.what}`),
    async bell(w, c, step) {
      const lines = await L.openBell(w)
      const fit = await L.bellFit(w.page)
      await L.shot(w.page, c, `${c}-${step}-${w.size}`, await L.bellClip(w.page), A.said(lines), w.size, { fit })
      L.log(c, `${step} bell: ` + JSON.stringify(A.said(lines)))
      await w.page.keyboard.press('Escape').catch(() => {})
      return lines
    },
    async done(name) {
      writeFileSync(join(TMP, `${name}.json`), JSON.stringify({ verdicts, cases: L.facts.cases, errors: L.facts.errors, pictures: L.facts.pictures.map(p => p.file) }, null, 1))
      console.log(`\n${name}: ` + ['PASS', 'FAIL', 'RECORD'].map(k => `${k} ${verdicts.filter(v => v.v === k).length}`).join(' · ') + ` · pictures ${L.facts.pictures.length} · errors ${L.facts.errors.length}`)
      for (const v of verdicts) console.log(`  ${v.v} ${v.c} ${v.label}: ${JSON.stringify(v.observed).slice(0, 260)}`)
      for (const e of L.facts.errors.slice(0, 10)) console.log('  err ' + e.slice(0, 220))
      await L.finish()
    },
  }
  return { L, A }
}
