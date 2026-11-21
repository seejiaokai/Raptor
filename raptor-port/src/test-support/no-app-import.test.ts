/* test-support/ is for test worlds only: no file of the app imports it (Fable's plan §3 — the settled test world must
   never become a door the app could use to move its saved baselines outside a command) */
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join, resolve } from 'path'

const SRC = resolve(__dirname, '..')
function files(dir: string): string[] {
  const out: string[] = []
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) { if (n !== 'test-support' && n !== 'node_modules') out.push(...files(p)) }
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(n) && !/\.test\.(ts|tsx|js|jsx)$/.test(n)) out.push(p)
  }
  return out
}

describe('test-support stays out of the app', () => {
  it('no file under src/ outside a test imports test-support/', () => {
    const bad = files(SRC).filter(p => /from\s+['"][^'"]*test-support\//.test(readFileSync(p, 'utf8')) || /import\(\s*['"][^'"]*test-support\//.test(readFileSync(p, 'utf8')))
    expect(bad).toEqual([])
  })
})
