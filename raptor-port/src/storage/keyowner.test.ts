// src/storage/keyowner.test.ts
/* THE KEY INVENTORY HOLDS (multi-squadron batch 1, step 0 — plan §3.4): every record the app stores is placed once, as
   a unit's or as the community's, so the squadron build can never leave a kind of record "everyone's by accident".
   - every key a demo boot stores (the real boot, src/boot.ts, on the stand-in store) has an owner;
   - every settings key or row prefix the source names — a literal `store.get/set('…')`, a `…_PFX = '…'` constant, a
     mapper's `collection:'settings', id:'…'`, the settings layer's own registered lists — has an owner, so a key the
     demo never writes (a flying-plan row, a mission role, a seen mark) is held too;
   - no key is on both lists;
   - every singleton the inventory names is still exported by its module. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { MemoryBackend } from './memory'
import { COLLECTIONS, type Snapshot } from './backend'
import {
  ownerOf, UNIT_COLLECTIONS, COMMUNITY_COLLECTIONS, UNIT_SETTINGS, COMMUNITY_SETTINGS,
  UNIT_SETTING_PREFIXES, COMMUNITY_SETTING_PREFIXES, UNIT_SINGLETONS, COMMUNITY_SINGLETONS,
} from './keyowner'
import { SETTINGS_KEYS, SETTINGS_ROW_PREFIXES } from '../state/people-settings-commit'
import { bootApp } from '../boot'
import { DEMO_POLICY } from '../bootpolicy'

const SRC = join(__dirname, '..')

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) sourceFiles(p, out)
    else if (/\.(ts|tsx|js|jsx)$/.test(n) && !/\.(test|spec|suite)\.[jt]sx?$/.test(n)) out.push(p)
  }
  return out
}

/* every settings key or row prefix written in the source as a literal */
function settingsLiterals(): Array<{ key: string; file: string }> {
  const found: Array<{ key: string; file: string }> = []
  const pats = [
    /\bstore\.(?:get|set|keys)\(\s*'([^']+)'/g,
    /_PFX\s*=\s*'([^']+)'/g,
    /collection\s*:\s*'settings'\s*,\s*id\s*:\s*'([^']+)'/g,
    /\(\s*'settings'\s*,\s*'([^']+)'/g,
  ]
  for (const f of sourceFiles(SRC)) {
    const text = readFileSync(f, 'latin1')
    for (const re of pats) for (const m of text.matchAll(re)) found.push({ key: m[1], file: relative(SRC, f) })
  }
  return found
}

describe('the key inventory — whose is each stored record', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('places every collection once — the mixed settings collection by key', () => {
    for (const c of COLLECTIONS) {
      const n = (UNIT_COLLECTIONS.includes(c) ? 1 : 0) + (COMMUNITY_COLLECTIONS.includes(c) ? 1 : 0)
      expect(n, c).toBe(c === 'settings' ? 0 : 1)
    }
  })

  it('never places a settings key or prefix on both lists', () => {
    for (const k of UNIT_SETTINGS) expect(COMMUNITY_SETTINGS.includes(k), k).toBe(false)
    for (const p of UNIT_SETTING_PREFIXES) for (const q of COMMUNITY_SETTING_PREFIXES) {
      expect(p.startsWith(q) || q.startsWith(p), `${p} / ${q}`).toBe(false)
    }
    const all = [...UNIT_SETTINGS, ...COMMUNITY_SETTINGS]
    for (const k of all) {
      const hits = [...UNIT_SETTING_PREFIXES, ...COMMUNITY_SETTING_PREFIXES].filter(p => k.startsWith(p))
      expect(hits, k).toEqual([])
    }
  })

  it('every key a demo boot stores has an owner', async () => {
    const be = new MemoryBackend()
    const p = bootApp(be, DEMO_POLICY)
    await vi.advanceTimersByTimeAsync(be.latency + 1)
    const { postman } = await p
    await postman.flush()
    const snap: Snapshot = await be.loadAll()
    const stray: string[] = []
    let n = 0
    for (const c of COLLECTIONS) for (const id of Object.keys(snap[c] || {})) {
      n++
      if (ownerOf(c, id) == null) stray.push(`${c}/${id}`)
    }
    expect(n).toBeGreaterThan(50)   // the demo world really was stored
    expect(stray).toEqual([])
  })

  it('every settings key or prefix the settings layer registers has an owner', () => {
    for (const k of SETTINGS_KEYS) expect(ownerOf('settings', k), k).not.toBeNull()
    for (const p of SETTINGS_ROW_PREFIXES) expect(ownerOf('settings', p + 'x'), p).not.toBeNull()
  })

  it('every settings key or prefix named in the source has an owner', () => {
    const lits = settingsLiterals()
    expect(lits.length).toBeGreaterThan(20)
    const stray = lits.filter(l => ownerOf('settings', l.key.endsWith(':') ? l.key + 'x' : l.key) == null)
    expect(stray).toEqual([])
  })

  it('every singleton the inventory names is still exported by its module', async () => {
    for (const s of [...UNIT_SINGLETONS, ...COMMUNITY_SINGLETONS]) {
      const mod = await import(/* @vite-ignore */ `../${s.module}`)
      expect(s.name in mod, `${s.module} exports ${s.name}`).toBe(true)
    }
    const names = [...UNIT_SINGLETONS, ...COMMUNITY_SINGLETONS].map(s => s.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
