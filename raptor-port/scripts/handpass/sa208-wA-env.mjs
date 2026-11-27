// sa208-wA — walker A's settings for the chat 208 walk (his answers to the SANS warning-lines questions, D2753–D2759),
// 27 Nov 26. Loaded BEFORE every shared helper reads them (walk-scripts §6: ||= only). Brief:
// docs/superpowers/briefs/2026-11-27-sans-answers-walk-brief.md. Frozen build D:/raptor-work/c208-build
// (index-CjChD3bM.js), served on port 4961 by sa208-wA-serve.mjs. Pictures go to the raw folder first; the ones that decide
// a case are copied to docs/img/handpass/2026-11-27-sans-answers/A/ at the end.
process.env.W2_URL ||= 'http://localhost:4961/'
process.env.W2_OUT ||= 'D:/raptor-work/c208/A/out/' + (process.env.SA208A_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
