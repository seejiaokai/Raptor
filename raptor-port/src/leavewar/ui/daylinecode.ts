// The code the bid windows' day line asks with (ui/DayLine.tsx). Kept out of DayLine.tsx so that file exports only
// components (React Doctor's only-export-components, D1534).

import type { Portion } from '../engine'

/** the code the line asks with: any leave, at the half picked ('*LL' a morning, 'LL*' an afternoon) */
export const dayLineCode = (portion: Portion): string => (portion === 'am' ? '*LL' : portion === 'pm' ? 'LL*' : 'LL')
