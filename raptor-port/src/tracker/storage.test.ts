// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { storage, setStorageImpl } from './storage.js'
import { bootApp } from '../boot'
import { MemoryBackend } from '../storage/memory'

beforeEach(() => { localStorage.clear() })
afterEach(() => { setStorageImpl(null) })

describe('tracker storage target', () => {
  /* [TRK-STANDALONE-LEFTOVERS] (D1538 — the Tracker is never exported again): with nothing plugged in, the doorway used
     to write the browser's storage under the standalone app's `ocu:` prefix. Only a unit test that never runs the boot
     can be in that state now, so it keeps the records in memory, like the memory store the app itself uses in dev, in
     tests and on ?fresh=1 — and it never reads or writes the browser's storage. */
  it('without a target the records are kept in memory — nothing reaches the browser’s storage, nothing is read from it', async () => {
    localStorage.setItem('ocu:v3:old', 'LEGACY')
    expect(await storage.get('v3:old'), 'an old ocu: key is not read by the doorway (the browser backend brings it in once)').toBeNull()
    expect(await storage.set('v3:master', '{}')).toEqual({ key: 'v3:master', value: '{}' })
    expect(localStorage.getItem('ocu:v3:master')).toBeNull()
    expect(localStorage.length, 'only the key this test put there').toBe(1)
    expect(await storage.get('v3:master')).toEqual({ key: 'v3:master', value: '{}' })
    expect(await storage.get('nope')).toBeNull()
    expect(await storage.list('v3:')).toEqual({ keys: ['v3:master'] })
    expect(await storage.delete('v3:master')).toEqual({ key: 'v3:master', deleted: true })
    expect(await storage.get('v3:master')).toBeNull()
    expect(await storage.list()).toEqual({ keys: [] })
  })
  it('unplugging a target starts an empty memory again — nothing of the target or of an earlier memory is kept', async () => {
    await storage.set('v3:a', '1')
    const mem: Record<string, string> = {}
    setStorageImpl({ get: (k: string) => mem[k] ?? null, set: (k: string, v: string) => { mem[k] = v }, remove: (k: string) => { delete mem[k] }, keys: () => Object.keys(mem) })
    expect(await storage.get('v3:a'), 'the target, not the memory before it').toBeNull()
    await storage.set('v3:b', '2')
    setStorageImpl(null)
    expect(await storage.list()).toEqual({ keys: [] })
    expect(mem['v3:b'], 'the target itself is left as it was').toBe('2')
  })
  it('with a target every verb goes to the target and never to localStorage, same return shapes', async () => {
    const mem: Record<string, string> = {}
    setStorageImpl({ get: (k: string) => mem[k] ?? null, set: (k: string, v: string) => { mem[k] = v }, remove: (k: string) => { delete mem[k] }, keys: () => Object.keys(mem) })
    expect(await storage.set('v3:courses', '[]')).toEqual({ key: 'v3:courses', value: '[]' })
    expect(mem['v3:courses']).toBe('[]')
    expect(localStorage.length).toBe(0)
    expect(await storage.get('v3:courses')).toEqual({ key: 'v3:courses', value: '[]' })
    expect(await storage.get('nope')).toBeNull()
    expect(await storage.list('v3:')).toEqual({ keys: ['v3:courses'] })
    expect(await storage.list()).toEqual({ keys: ['v3:courses'] })
    expect(await storage.delete('v3:courses')).toEqual({ key: 'v3:courses', deleted: true })
    expect(mem['v3:courses']).toBeUndefined()
  })
})

/* WHY THE RUNNING APP NEVER TAKES THE NO-TARGET PATH: the app's one boot (src/boot.ts, the one main.tsx runs, on every
   backend — the browser's, and memory for dev, tests and ?fresh=1) plugs the whiteboard into this doorway before
   anything else, and main.tsx draws the app only after that boot has finished. */
describe('the app’s boot plugs the doorway in before the Tracker can be drawn', () => {
  it('after the real boot, a Tracker write lands on the whiteboard’s tracker records — not in memory, not in the browser’s storage', async () => {
    const { wb } = await bootApp(new MemoryBackend())
    await storage.set('v3:plugcheck', 'ON-THE-BOARD')
    expect(wb.get('tracker', 'v3:plugcheck')).toBe('ON-THE-BOARD')
    expect(localStorage.length).toBe(0)
  })
  it('main.tsx draws the app only once the boot has finished, and the boot plugs the door in on every backend', () => {
    const main = readFileSync(join(__dirname, '../main.tsx'), 'utf8')
    const booted = main.indexOf('await bootApp('), drawn = main.indexOf('.render(')
    expect(booted, 'main.tsx awaits the boot').toBeGreaterThan(-1)
    expect(drawn, 'and draws the app after it').toBeGreaterThan(booted)
    const boot = readFileSync(join(__dirname, '../boot.ts'), 'utf8')
    const body = boot.slice(boot.indexOf('function bootBody('))
    expect(body, 'the door is plugged in the boot body, which every backend runs').toMatch(/^function bootBody\([^)]*\): void \{\s*(?:\/\*[\s\S]*?\*\/\s*)?storeBackend\.impl = settingsAdapter\(wb\)\s*setStorageImpl\(trackerTarget\(wb\)\)/)
  })
  /* THE SAVE CORNER'S WIRE ([TRK-SAVE-FAIL-SAYS-SAVED]; the setter renamed setSaveHealth by this job). The Tracker's
     "● saved" corner hears Raptor's saver only because main.tsx hands the postman over after the boot; without it the
     corner says "saved" beside the top bar's "Not saved". main.tsx runs the whole app as it loads, so it cannot be
     imported here: this reads its source, as the test above does. (The bug check's break test B5, 5 Nov 26: taking the
     line out turned no test red — this one was added for it, red with the line out.) */
  it('main.tsx hands the saver (the postman the boot returned) to the Tracker’s doorway', () => {
    const main = readFileSync(join(__dirname, '../main.tsx'), 'utf8')
    const imp = main.match(/import \{ setSaveHealth as (\w+)[^}]*\} from '\.\/tracker\/storage\.js'/)
    expect(imp, 'main.tsx imports the doorway’s setter').not.toBeNull()
    const call = main.indexOf(imp![1] + '(postman)'), booted = main.indexOf('const { postman } = await bootApp(')
    expect(booted, 'the postman is the one the boot returned').toBeGreaterThan(-1)
    expect(call, 'and is handed to the doorway after the boot').toBeGreaterThan(booted)
  })
  /* D1901 — a browser that keeps nothing: the boot's answer reaches the doorway after the backend was chosen */
  it('main.tsx hands the doorway whether the browser keeps anything, after the boot chose its backend', () => {
    const main = readFileSync(join(__dirname, '../main.tsx'), 'utf8')
    const imp = main.match(/setStorageKept as (\w+) \} from '\.\/tracker\/storage\.js'/)
    expect(imp, 'main.tsx imports the doorway’s kept setter').not.toBeNull()
    const call = main.indexOf(imp![1] + '(!storageRefused())'), booted = main.indexOf('const { postman } = await bootApp(chooseBackend()')
    expect(booted).toBeGreaterThan(-1)
    expect(call, 'handed over after the backend was chosen').toBeGreaterThan(booted)
  })
})
