// Walker a of the round-4 words walk (chat 170, 24 Nov 26): the run's folder and a few readers over wr4-lib.mjs.
// Usage from a scenario script: const { L, A } = await setup('a1-r1')
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const TMP = join(HERE, '../../.tmp/wr4-a')
mkdirSync(TMP, { recursive: true })

export async function setup(run) {
  process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/a', run)
  process.env.WR4_NEW ||= 'D:/rw4/build-new'
  process.env.WR4_OLD ||= 'D:/rw4/build-main'
  const L = await import('./wr4-lib.mjs')
  const verdicts = []
  const sizeTag = w => w.engine === 'webkit' ? 'wk' : w.size
  const A = {
    verdicts,
    judge(c, label, ok, observed) { const v = ok === null ? 'RECORD' : ok ? 'PASS' : 'FAIL'; verdicts.push({ c, v, label, observed }); L.log(c, `${v} ${label} — ${JSON.stringify(observed)}`) },
    said: lines => lines.map(l => `${l.name} ${l.day} / ${l.what}`),
    /* the person's bell, read as drawn, pictured as <c>-<step>-<size> */
    async bell(w, c, step) {
      const lines = await L.openBell(w)
      const fit = await L.bellFit(w.page)
      await L.shot(w.page, c, `${c}-${step}-${sizeTag(w)}`, await L.bellClip(w.page), A.said(lines), w.size, { fit })
      L.log(c, `${step} bell: ` + JSON.stringify(A.said(lines)))
      await w.page.keyboard.press('Escape').catch(() => {})
      return lines
    },
    async meId(page, cs) { return page.evaluate(cs => Object.entries(window.PEOPLE).find(([, p]) => p.cs === cs)?.[0] || Object.values(window.PEOPLE).find(p => p.cs === cs)?.id, cs) },
    async done(name) {
      writeFileSync(join(TMP, `${name}.json`), JSON.stringify({ verdicts, cases: L.facts.cases, errors: L.facts.errors, pictures: L.facts.pictures.map(p => p.file) }, null, 1))
      console.log(`\n${name}: ` + ['PASS', 'FAIL', 'RECORD'].map(k => `${k} ${verdicts.filter(v => v.v === k).length}`).join(' · ') + ` · pictures ${L.facts.pictures.length} · errors ${L.facts.errors.length}`)
      for (const v of verdicts.filter(v => v.v !== 'PASS')) console.log(`  ${v.v} ${v.c} ${v.label}: ${JSON.stringify(v.observed).slice(0, 220)}`)
      for (const e of L.facts.errors.slice(0, 8)) console.log('  err ' + e.slice(0, 200))
      await L.finish()
    },
  }
  return { L, A }
}
