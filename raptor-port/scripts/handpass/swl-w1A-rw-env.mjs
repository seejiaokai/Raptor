// swl-w1A-rw — walker A's re-walk of the hide fix (a hidden SANS line is tied to its own sim row), chat 207, 27 Nov 26.
// Loaded BEFORE every shared helper (walk-scripts §6): the new build D:/raptor-work/c207-build2 (index-Bt57FROH.js, commit
// fd26cb170) on port 4895; pictures OUTSIDE the repo, as the coordinator asked: D:/raptor-work/c207-walk/A2/<run>.
process.env.W2_URL ||= 'http://localhost:4895/'
process.env.W2_OUT ||= 'D:/raptor-work/c207-walk/A2/' + (process.env.SWLA_RUN || 'rw1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
