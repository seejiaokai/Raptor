/* A split must remain one eager, explicitly ordered cascade. */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { transform } from 'lightningcss'
import { describe, expect, it } from 'vitest'
import { SCHEDULER_PARTS, readSchedulerCss, schedulerParts } from '../testing/scheduler-css'

const entryUrl = new URL('./scheduler.css', import.meta.url)
const entry = readFileSync(entryUrl, 'utf8')
const manifest = SCHEDULER_PARTS.map(p => `@import './scheduler/${p}';`).join('\n')

describe('scheduler styles keep their original eager cascade', () => {
  it('imports every physical part exactly once in the declared order', () => {
    expect(schedulerParts(entry)).toEqual(SCHEDULER_PARTS)
    const dir = new URL('./scheduler/', import.meta.url)
    expect(existsSync(dir), 'the screen parts directory exists').toBe(true)
    expect(readdirSync(dir).filter(p => p.endsWith('.css')).sort()).toEqual([...SCHEDULER_PARTS].sort())
  })
  it('each part parses independently and contains no nested import', () => {
    for (const p of schedulerParts(entry)) {
      const code = readFileSync(new URL(`./scheduler/${p}`, entryUrl))
      expect(code.toString().replace(/\/\*[\s\S]*?\*\//g,''),p).not.toMatch(/@import\b/)
      expect(() => transform({ filename:p, code, errorRecovery:false }),p).not.toThrow()
    }
    expect(readSchedulerCss().length).toBeGreaterThan(200000)
  })
  it('production eagerly imports only the entry, once', () => {
    const source = readFileSync(new URL('../main.tsx',import.meta.url),'utf8')
    expect(source.match(/import\s+['"]\.\/ui\/scheduler\.css['"]/g)).toHaveLength(1)
    const visit = (dir: URL): string[] => readdirSync(dir,{withFileTypes:true}).flatMap(f => f.isDirectory() ? visit(new URL(f.name+'/',dir)) : /\.[cm]?[jt]sx?$/.test(f.name) && !/\.test\./.test(f.name) ? [readFileSync(new URL(f.name,dir),'utf8')] : [])
    expect(visit(new URL('../',import.meta.url)).filter(s=>/import\s+(?:[^;\n]*?from\s+)?['"][^'"]*scheduler\/[^'"]*\.css['"]/.test(s))).toEqual([])
  })
  it.each([
    ['missing',manifest.replace(/^.*\n/,'')],
    ['duplicate',manifest+'\n'+manifest.split('\n')[0]],
    ['reversed',manifest.split('\n').reverse().join('\n')],
    ['unlisted',manifest.replace('01-logic.css','unlisted.css')],
    ['extra rule',manifest+'\nbody{color:red}'],
  ])('rejects a %s cascade instead of silently reading an incomplete one',(_,text) => {
    expect(()=>schedulerParts(text)).toThrow()
  })
})
