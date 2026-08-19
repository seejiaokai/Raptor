/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  /* relative asset paths, so the same build works served from the domain
     root (vite preview, the probes) AND from a sub-path (GitHub Pages
     serves project sites at /<repo>/) */
  base: './',
  plugins: [react()],
  test: {
    /* TWO PROJECTS, not one include list (16 Aug 26, the Leave War merge).
       The vendored Leave War suite needs three things Raptor's suite must
       not inherit: a fixed TZ (its date maths is proven UTC-safe by running
       under Pacific/Midway, while Raptor's Inputs date-window tests read the
       real clock and would shift a day), jsdom by config (Raptor files opt
       in per-file with an @vitest-environment pragma), and a 20s timeout
       (365-column year renders under parallel workers — headroom, not a
       target; see the comment in the original leave-war repo's config).
       Projects give each suite its own worker pool, so the TZ cannot bleed.
       `globals: true` is load-bearing for leavewar: testing-library's
       auto-cleanup registers off a global afterEach. */
    projects: [
      {
        extends: true,
        test: {
          name: 'raptor',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['**/node_modules/**', 'src/leavewar/**'],
          /* 20s like leavewar's, for the same reason: headroom on a slow
             shared runner, not a target. The default 5s failed main's deploy
             on 19 Aug 26 — a board.test.tsx test that runs ~1s locally timed
             out on a CI runner ~30% slower than this container, and the
             abandoned test's un-run cleanup cascaded a second, misleading
             failure. The same commit had passed the identical PR gate
             minutes earlier: the code was never wrong, the ceiling was. */
          testTimeout: 20_000,
        },
      },
      {
        extends: true,
        test: {
          name: 'leavewar',
          include: ['src/leavewar/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          globals: true,
          testTimeout: 20_000,
          env: { TZ: 'Pacific/Midway' },
        },
      },
    ],
  },
})
