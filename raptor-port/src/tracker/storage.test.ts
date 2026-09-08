// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { storage, useStorageImpl } from './storage.js'

beforeEach(() => { localStorage.clear() })
afterEach(() => { useStorageImpl(null) })

describe('tracker storage target', () => {
  it('without a target it uses localStorage under ocu: (today’s behaviour)', async () => {
    await storage.set('v3:master', '{}')
    expect(localStorage.getItem('ocu:v3:master')).toBe('{}')
    expect(await storage.get('v3:master')).toEqual({ key: 'v3:master', value: '{}' })
    expect(await storage.list('v3:')).toEqual({ keys: ['v3:master'] })
    expect(await storage.delete('v3:master')).toEqual({ key: 'v3:master', deleted: true })
  })
  it('with a target every verb goes to the target and never to localStorage, same return shapes', async () => {
    const mem: Record<string, string> = {}
    useStorageImpl({ get: (k: string) => mem[k] ?? null, set: (k: string, v: string) => { mem[k] = v }, remove: (k: string) => { delete mem[k] }, keys: () => Object.keys(mem) })
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
