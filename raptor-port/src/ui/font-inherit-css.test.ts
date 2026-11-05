// @vitest-environment node — reads the stylesheets off disk (the noglow-css.test.ts shape)
/* A FONT LINE THE BROWSER DROPS WITHOUT A WORD ([CSS-FONT-INHERIT], owner D1680, 5 Nov 26). `font: 600 13px inherit`
   reads fine to a person but is not a font: a family cannot be "inherit" inside the shorthand, so the browser drops the
   whole line and the box keeps its own letters, size and weight. Nine such lines left eight boxes and buttons on the
   schedule and the Inputs page in the browser's letters (drawn 5 Nov 26, `docs/mock/2026-11-05-font-inherit/`). Write
   `font-family: inherit` with the size and weight beside it; `font: inherit` alone is fine (the keyword for the whole
   shorthand). A rule that only a comment states is broken again, so the files are the witness, over EVERY stylesheet
   under src/, not a list of places. */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

const SRC = fileURLToPath(new URL('..', import.meta.url))
const cssFiles = (dir: string): string[] => readdirSync(dir).flatMap(n => {
  const p = join(dir, n)
  return statSync(p).isDirectory() ? cssFiles(p) : n.endsWith('.css') ? [p] : []
})
const FILES = cssFiles(SRC).map(file => ({
  name: file.slice(SRC.length).replace(/\\/g, '/'),
  /* comments out (a comment may quote the broken form, as the two written-out lines' comments do), strings kept */
  css: readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''),
}))

describe('no font line the browser would drop', () => {
  it('reads the stylesheets (the scan is not empty)', () => {
    expect(FILES.length).toBeGreaterThan(20)
  })

  it('no `font:` shorthand names `inherit` beside a size or weight', () => {
    const bad: string[] = []
    for (const f of FILES) {
      for (const m of f.css.matchAll(/(?:^|[;{\s])font\s*:\s*([^;{}]*)/g)) {
        const v = m[1]!.trim().replace(/\s*!important$/, '')
        if (/\binherit\b/.test(v) && v !== 'inherit') bad.push(`${f.name}: font: ${v}`)
      }
    }
    expect(bad).toEqual([])
  })
})
