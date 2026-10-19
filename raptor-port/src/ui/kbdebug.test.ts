// @vitest-environment jsdom
/* D1082 — the hidden keyboard readout: drawn only when the link asks for it, and its own stop takes it away. */
import { describe, it, expect, afterEach } from 'vitest'
import { installKbDebug } from './kbdebug'

describe('installKbDebug', () => {
  afterEach(() => { try { sessionStorage.clear() } catch {} ; history.replaceState(null, '', '/') })
  it('draws nothing without ?kbdebug=1', () => {
    history.replaceState(null, '', '/')
    const stop = installKbDebug()
    expect(document.querySelector('[data-kbdebug]')).toBeNull()
    stop()
  })
  it('with ?kbdebug=1: a readout that lets touches through, kept for the visit; its stop removes it; ?kbdebug=0 ends it', () => {
    history.replaceState(null, '', '/?kbdebug=1')
    let stop = installKbDebug()
    const box = document.querySelector('[data-kbdebug]') as HTMLElement
    expect(box).not.toBeNull()
    expect(box.style.pointerEvents).toBe('none')
    expect(box.textContent).toContain('keys up: no')
    stop()
    expect(document.querySelector('[data-kbdebug]')).toBeNull()
    history.replaceState(null, '', '/')
    stop = installKbDebug()
    expect(document.querySelector('[data-kbdebug]'), 'kept for the visit').not.toBeNull()
    stop()
    history.replaceState(null, '', '/?kbdebug=0')
    stop = installKbDebug()
    expect(document.querySelector('[data-kbdebug]')).toBeNull()
    stop()
  })
})
