// @vitest-environment jsdom
/* fable3 — A6's neighbour: Admin → Users' "posting out 20 Jul · Overseas Sqn" tag for a 149 man, read with 142's war loaded */
import { describe, expect, it } from 'vitest'
import { worldUnit } from './state/store'
import { postOut, postingPendingTag } from './sync'
import { useMsqWorld, signInAs } from '../test-support/msq-world'

useMsqWorld()

describe('fable3 — the pending-posting tag of another squadron’s man', () => {
  it('Osprey’s 149 posting set for 20 Jul: Kestrel sees the tag; Saber (master, 142 loaded) sees the same on his row', () => {
    signInAs('kestrel'); expect(worldUnit()).toBe('u149')
    expect(postOut('osp9', '2026-07-20', 'overseas')).toBe(true)
    const own = postingPendingTag('osp9')
    expect(own).toMatch(/posting out 20 Jul/)
    signInAs('saber'); expect(worldUnit()).toBe('u142')
    const other = postingPendingTag('osp9')
    expect(other ?? '(no tag)', 'the same tag whichever war is loaded').toMatch(/posting out 20 Jul/)
  })
})
