// @vitest-environment jsdom
/* PART A'S A10 — "COUNTED MEANS DRAWN", ONE CHANGE: his right in the squadron lowered to View, and the worked case (moved whole out of
   ui/msq-guard-open.test.tsx on 27 Nov 26, not one assertion changed — why the block is split five ways, and the block
   itself: test-support/msq-guard-a10.ts). The world: three squadrons (test-support/msq-world.ts withThird — his D2630). */
import { afterEach } from 'vitest'
import { withThird } from '../test-support/msq-world'
import { guardTeardown } from '../test-support/msq-guard-testkit'
import { defineA10 } from '../test-support/msq-guard-a10'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

afterEach(guardTeardown)

defineA10(['his right in the squadron lowered to View'], { worked: true })
