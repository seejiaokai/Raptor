// sns-w1B — walker B's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// The D2573 walk (a SANS man struck on a flying seat with no times yet), chat 179, 25 Nov 26. Brief: D:/raptor-work/c179-walk/BRIEF.md.
// Pictures to docs/img/handpass/2026-11-25-sans-notimes-strike/B/<run>; raw logs to D:/raptor-work/c179-walk/B/.
process.env.W2_URL ||= 'http://localhost:4882/'
process.env.W2_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-25-sans-notimes-strike/B/' + (process.env.SNSB_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
