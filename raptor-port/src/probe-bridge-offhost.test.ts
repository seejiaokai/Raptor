// @vitest-environment jsdom
// @vitest-environment-options { "url": "http://raptor.test/" }
/* [ACCOUNTS] roll-call 38 — the developer's-PC probe bridge installs NOTHING on a non-local
   address, even when called (Fable's code read, 26 Sep 26: the check now sits inside
   installProbeBridge as well as at its one caller, main.tsx). The walk
   scripts/handpass/acc-bridge-offhost.mjs proves the same on the production bundle. */
import { describe, expect, it } from 'vitest'
import { installProbeBridge, isLocalHost } from './probe-bridge'

describe('the probe bridge off the loopback address', () => {
  it('is not installed — no global at all', () => {
    expect(location.hostname).toBe('raptor.test')
    expect(isLocalHost()).toBe(false)
    installProbeBridge()
    for (const k of ['raptorMe', 'raptorRole', 'PEOPLE', 'DAYS', 'setSlotVal', 'lwSetViewer', 'lwSetRole', 'fileInput', 'go'])
      expect((window as any)[k], k).toBeUndefined()
  })
})
