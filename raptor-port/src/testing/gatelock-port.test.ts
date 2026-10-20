/* [GATELOCK-STALE-PORT] (18 Oct 26; built the night of 20 Oct 26): the lock's full check run and `exec` of a browser run
   choose the port the browser tests serve on. Outside CI Playwright REUSES a server already answering on its port, so a
   preview another chat left on 4173 had a whole check run test that chat's old build. A set port that is already
   answering is refused; an unset one is chosen free and said. The choice is pinned here with a stand-in "busy" test, and
   one real listener proves the real busy test sees it. */
import { describe, expect, it } from 'vitest'
import { createServer } from 'node:net'
import { browserPorts, freePort, portBusy, runsBrowser } from '../../scripts/gatelock.mjs'

describe('the lock chooses the browser tests’ port', () => {
  it('an unset port is the first free one from its range; a set free one is kept', async () => {
    const busy = async (p: number) => p === 4300 || p === 4301 || p === 4350
    const a = await browserPorts({}, busy)
    expect(a.env.E2E_PORT).toBe('4302')
    expect(a.env.SMOKE_PORT).toBe('4351')
    expect(a.said).toMatch(/E2E_PORT=4302 \(free\)/)
    const b = await browserPorts({ E2E_PORT: '4321', SMOKE_PORT: '4379' }, busy)
    expect([b.env.E2E_PORT, b.env.SMOKE_PORT]).toEqual(['4321', '4379'])
  })
  it('a set port that is already answering is refused, with the reason', async () => {
    await expect(browserPorts({ E2E_PORT: '4173' }, async (p: number) => p === 4173)).rejects.toThrow(/already answering/)
  })
  it('no free port in the range is said, never a busy one used', async () => {
    await expect(freePort(4300, 4302, async () => true)).rejects.toThrow(/no free port/)
  })
  it('a real listener is seen as busy, and freed it is not', async () => {
    const srv = createServer()
    await new Promise<void>(r => srv.listen(0, '127.0.0.1', () => r()))
    const port = (srv.address() as any).port
    expect(await portBusy(port)).toBe(true)
    await new Promise<void>(r => srv.close(() => r()))
    expect(await portBusy(port)).toBe(false)
  })
  it('only a command that serves the bundle for browser tests gets a port', () => {
    expect(runsBrowser('npx playwright test e2e/rallybox.spec.ts')).toBe(true)
    expect(runsBrowser('npm run test:e2e')).toBe(true)
    expect(runsBrowser('npm run smoke:tracker')).toBe(true)
    expect(runsBrowser('npx vitest run src/ui')).toBe(false)
  })
})
