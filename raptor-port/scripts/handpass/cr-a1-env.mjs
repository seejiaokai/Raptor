/* Walker A1 of the change-recording re-test (28 Sep 26) — the width and the picture folder, set BEFORE the shared
   drivers load (../lib.mjs reads HP_SHOTS when it is first imported). HP_W × HP_H (default 1440×900); a width under
   700 is a touch phone (390×844). Pictures to docs/img/handpass/2026-09-28-change-recording/a1/<desktop|phone>/. */
export const W = +(process.env.HP_W || 1440)
export const H = +(process.env.HP_H || (W < 700 ? 844 : 900))
export const PHONE = W < 700
export const TAG = PHONE ? 'phone' : 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-change-recording/a1/' + TAG
process.env.HP_URL ||= 'http://localhost:4173'
