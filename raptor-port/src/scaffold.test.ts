import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('scaffold', () => {
  it('runs', () => {
    expect(true).toBe(true)
  })

  it('reference spec is present and untouched in location', () => {
    expect(existsSync('reference/scheduler.html')).toBe(true)
    expect(existsSync('reference/tfin.js')).toBe(true)
  })
})
