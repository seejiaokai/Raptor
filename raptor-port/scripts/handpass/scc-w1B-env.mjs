// scc-w1B — walker B's settings for the crew list's SANS words and F / O / A column walk (his D2584 Q2, D2581, D2582,
// D2750, D2751), chat 207, 27 Nov 26. Loaded BEFORE every shared helper (walk-scripts §6: ||= only). Brief:
// docs/superpowers/briefs/2026-11-27-sans-crewcol-walk-brief.md. Build D:/raptor-work/c203-build on port 4896. Every
// picture goes to the scratch folder first; the ones that decide a case are copied to
// docs/img/handpass/2026-11-27-sans-crewcol/B/ by scc-w1B-keep.mjs.
process.env.W2_URL ||= 'http://localhost:4896/'
process.env.W2_OUT ||= 'D:/raptor-work/c207-walk/B/out/' + (process.env.SCCB_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
