// @vitest-environment node — reads the stylesheets off disk (the font-inherit-css.test.ts shape)
/* A RULE LOST AFTER A PAGE WRAPPER'S CLOSE ([CSS-WRAPPER-GUARD], filed 5 Nov 26 from [CSS-FONT-INHERIT]'s guard). The Leave
   War's stylesheets wrap themselves in their page — `#page-leavewar { … }`, native nesting (bidpicker.css's head: the war's
   class names collide with the scheduler's, and the wrapper's one id keeps the file's own cascade). A block appended after
   the wrapper's close lands unscoped, a step weaker than every wrapped rule, and silently loses to the older rule it was
   written to change: round 3's actions row (24 Oct 26, 9ab4c65fd — `.bidsheet-row` after bidpicker.css's wrapper, the row a
   wrapping line and the ⋯ off the window) and the joined bar and the outlined commitment (25 Oct 26, 75bc67be2 — matrix.css).
   Neither showed in a unit test (no stylesheet there); a browser test found each, a run later.

   THE RULE, in every stylesheet that wraps itself in its page (a top-level `#page-<name>` block holding rules), for every
   top-level rule after the first wrapper's close (a later wrapper block is the page's own, and is not looked into):
     1. named with its page — every selector carries `#page-<name>` (matrix.css's joined bar since 75bc67be2); or
     2. `@keyframes` — an animation's name is the whole document's, not a page's; or
     3. on purpose outside the page — every selector starts at `body` or `html`: a state of the whole page
        (`body.lw-bal-on`) or a pop-up the app draws on <body> (`body:has(.bidsheet.raised) .airpop`); or
     4. an `@media` / `@supports` / `@container` block whose own rules each pass 1–3; or
     5. ONE OF THE RULES ALREADY THERE (`css-wrapper-outside.json`, taken 6 Nov 26). bidpicker.css's counter form and
        everything after it (since 19 Aug 26, 9a68c23b4), and a few blocks later, sit outside its wrapper — not on purpose:
        every one of the war's windows is drawn INSIDE the page (Sheet, FloatWin and the day panel render in place; the windows
        the top row opens are portalled onto `#page-leavewar` — Matrix.tsx `drawnOnPage`), so being outside buys them nothing.
        Their class names are the war's own and they have been walked as they stand, so they are kept as they are; moving
        them in changes which rule wins and is a walked job of its own. The list may only SHRINK: a rule moved inside (or
        named with its page) is taken off it — a stale line fails too — and nothing is added to it.
   A new rule after a close fails here with its file, line and selector; move it inside the wrapper (the file's head asks
   that), or name it with the page. Comments out; strings kept whole (a brace in a string is not a block). */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

type Block = { line: number; prelude: string; body: string }

/** the top-level blocks of a stylesheet (or of an at-rule's body): each block's opening line, its prelude (the selector or
 *  the at-rule, whitespace folded) and the text between its braces; comments blanked, strings stepped over */
function topBlocks(cssIn: string, firstLine = 1): Block[] {
  const css = cssIn.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  const out: Block[] = []
  let depth = 0, start = 0, line = firstLine, openAt = 0, openLine = 0
  for (let i = 0; i < css.length; i++) {
    const c = css[i]!
    if (c === '\n') line++
    else if (c === '"' || c === "'") {
      for (i++; i < css.length && css[i] !== c; i++) { if (css[i] === '\\') i++; else if (css[i] === '\n') line++ }
    } else if (c === '{') {
      if (depth === 0) { openAt = i; openLine = line }
      depth++
    } else if (c === '}') {
      depth--
      if (depth === 0) {
        const pre = css.slice(start, openAt)
        const lead = (pre.match(/^\s*/)?.[0].match(/\n/g) ?? []).length
        out.push({ line: openLine - ((pre.trimEnd().match(/\n/g) ?? []).length - lead), prelude: pre.trim().replace(/\s+/g, ' '), body: css.slice(openAt + 1, i) })
        start = i + 1
      }
    } else if (c === ';' && depth === 0) start = i + 1
  }
  return out
}

/** the page a wrapper block names, where the block is one: `#page-<name>` alone, holding rules (not a lone declaration) */
const wrapperPage = (b: Block): string | null => (/^#page-[a-z-]+$/.test(b.prelude) && b.body.includes('{') ? b.prelude : null)

const selectorsOf = (prelude: string): string[] => {
  const out: string[] = []
  let depth = 0, cur = ''
  for (const ch of prelude) {
    if (ch === '(' || ch === '[') depth++
    else if (ch === ')' || ch === ']') depth--
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = '' } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

/** what in one wrapped stylesheet stands after its first wrapper's close and passes none of rules 1–4: `<at-rule> » <selector>`
 *  keys, each with its line, for rule 5's list */
function strays(css: string): Array<{ key: string; line: number }> {
  const blocks = topBlocks(css)
  const first = blocks.findIndex(b => wrapperPage(b))
  if (first < 0) return []
  const page = wrapperPage(blocks[first]!)!
  const named = (sel: string) => sel.includes(page)
  const outside = (sel: string) => /^(body|html)\b/.test(sel)
  const out: Array<{ key: string; line: number }> = []
  const judge = (b: Block, within: string) => {
    if (/^@keyframes\b/.test(b.prelude) || /^@-webkit-keyframes\b/.test(b.prelude)) return
    if (/^@(media|supports|container)\b/.test(b.prelude)) {
      for (const inner of topBlocks(b.body, b.line)) judge(inner, b.prelude)
      return
    }
    if (selectorsOf(b.prelude).every(s => named(s) || outside(s))) return
    out.push({ key: within ? `${within} » ${b.prelude}` : b.prelude, line: b.line })
  }
  for (const b of blocks.slice(first + 1)) if (!wrapperPage(b)) judge(b, '')
  return out
}

const SRC = fileURLToPath(new URL('..', import.meta.url))
/* rule 5's list, read off disk (the project reads no JSON as a module) */
const OUTSIDE: Record<string, string[]> = JSON.parse(readFileSync(join(SRC, 'ui', 'css-wrapper-outside.json'), 'utf8'))
const cssFiles = (dir: string): string[] => readdirSync(dir).flatMap(n => {
  const p = join(dir, n)
  return statSync(p).isDirectory() ? cssFiles(p) : n.endsWith('.css') ? [p] : []
})
const FILES = cssFiles(SRC).map(file => ({ name: file.slice(SRC.length).replace(/\\/g, '/'), css: readFileSync(file, 'utf8') }))
const WRAPPED = FILES.filter(f => topBlocks(f.css).some(b => wrapperPage(b)))

describe('the checker itself (a broken example first — the order\'s §8.1)', () => {
  const sheet = (after: string) => `#page-x {\n.a { color: red; }\n.b { content: "}{"; }\n}\n${after}\n`
  it('a rule appended after the wrapper\'s close is caught, with its line', () => {
    expect(strays(sheet('.mx td .c { color: blue; }'))).toEqual([{ key: '.mx td .c', line: 5 }])
  })
  it('one selector of a list left unnamed is caught; one inside an @media too', () => {
    expect(strays(sheet('#page-x .a, .b { color: blue; }')).map(s => s.key)).toEqual(['#page-x .a, .b'])
    expect(strays(sheet('@media (max-width: 700px) {\n  #page-x .a { x: 1 }\n  .b { x: 2 }\n}')))
      .toEqual([{ key: '@media (max-width: 700px) » .b', line: 7 }])
  })
  it('passes by the stated rule: named with the page, @keyframes, body / html, a later wrapper, a lone #page declaration', () => {
    expect(strays(sheet([
      '#page-x .mx td:not(.sel) .c.jr { x: 1 }',
      '@keyframes ring { from { opacity: 0 } to { opacity: 1 } }',
      'body.lw-on { overflow: hidden }',
      'body:has(.s.raised) .airpop { z-index: 2 }',
      'html body #page-x .y { x: 1 }',
      '@media (hover: hover) { #page-x .a:hover { x: 1 } body .p { x: 2 } }',
      '#page-x {\n.later { x: 1 }\n}',
    ].join('\n')))).toEqual([])
    expect(strays('.a { x: 1 }\n#page-q{timeline-scope:--q}\n.b { x: 2 }'), 'no wrapper: not a wrapped stylesheet').toEqual([])
  })
})

describe('no rule lost after a page wrapper\'s close ([CSS-WRAPPER-GUARD])', () => {
  it('finds the wrapped stylesheets (the scan is not empty)', () => {
    expect(WRAPPED.map(f => f.name)).toEqual(expect.arrayContaining(['leavewar/ui/bidpicker.css', 'leavewar/ui/matrix.css', 'tracker/tracker.css']))
  })

  it('every rule after a close passes the rule — or is one of the rules already there (none added)', () => {
    const kept = OUTSIDE
    const fresh: string[] = []
    for (const f of WRAPPED) {
      const left = [...(kept[f.name] ?? [])]
      for (const s of strays(f.css)) {
        const at = left.indexOf(s.key)
        if (at >= 0) left.splice(at, 1)
        else fresh.push(`${f.name}:${s.line} ${s.key} — after the #page wrapper's close: move it inside, or name it with the page`)
      }
    }
    expect(fresh).toEqual([])
  })

  it('the list of rules already there only shrinks: each line still stands outside its wrapper', () => {
    const kept = OUTSIDE
    const stale: string[] = []
    for (const [name, keys] of Object.entries(kept)) {
      const f = FILES.find(x => x.name === name)
      const left = f ? strays(f.css).map(s => s.key) : []
      for (const k of keys) {
        const at = left.indexOf(k)
        if (at >= 0) left.splice(at, 1)
        else stale.push(`${name}: ${k} — no longer outside its wrapper: take it off css-wrapper-outside.json`)
      }
    }
    expect(stale).toEqual([])
  })
})
