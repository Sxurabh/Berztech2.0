# 📋 Antigravity Testing — Quick Start Guide

## Three Files, One System

| File | Purpose |
|------|---------|
| `TESTING_STRATEGY.md` | The master plan — what to build and why |
| `tests/PROMPTS.md` | Copy-paste prompts for AI implementation |
| `tests/TEST-TRACKER.md` | Live progress tracker — update after every session |

---

## 🚀 Starting From Scratch

**Step 1** — Open `tests/PROMPTS.md`

**Step 2** — Paste the **Master Context Prompt** at the top of your AI chat

**Step 3** — Run **Prompt 1.1** (Infrastructure Setup) — do this before anything else

**Step 4** — Install dependencies from the Install Checklist in `TEST-TRACKER.md`

**Step 5** — Run `npm test` to verify setup works

---

## 🔄 Resuming in a New AI Session / IDE

1. Open `tests/TEST-TRACKER.md`
2. Copy the entire file content
3. Open `tests/PROMPTS.md` and copy **Prompt T.2**
4. Paste Prompt T.2 into your new AI chat and fill in the tracker content
5. The AI will tell you exactly where to continue

---

## ✅ After Each Work Session

1. Run all tests: `npm run test:ci`
2. Note which tests passed and which failed
3. Copy **Prompt T.1** from `PROMPTS.md`
4. Fill in your results and run it with an AI
5. Replace `tests/TEST-TRACKER.md` with the AI's updated output
6. Commit the updated tracker: `git add tests/TEST-TRACKER.md && git commit -m "test: update tracker"`

---

## 🛠️ Common Commands

```bash
npm test                        # Watch mode (development)
npm run test:unit               # Unit + component tests only (fast)
npm run test:integration        # API integration tests
npm run test:ci                 # All tests + coverage (use before pushing)
npm run test:coverage           # Open HTML coverage report
npm run test:e2e                # Playwright E2E (need app running)
npm run test:e2e:mobile         # Mobile viewport E2E tests
npx vitest run tests/unit/config/admin.test.ts   # Single file
```

---

## 📏 Phase Order (Do NOT Skip)

```
P0 (Infrastructure) → P1 (Foundation) → P2 (Components)
→ P3 (API/Integration) → P4 (E2E) → P5 (Security) → P6 (Performance)
```

Each phase builds on the previous. P0 must be 100% done before P1.

---

## 🚦 CI Gate Rules

| Test Type | When It Runs | Fails Merge If |
|-----------|-------------|----------------|
| Unit + Integration | Every push | Any test fails OR coverage < threshold |
| E2E (Chromium) | PR to main | Any test fails |
| Mobile E2E | mobile_fixes branch + main | Any test fails |
| Lighthouse | PR to main | Accessibility < 0.90 |

---

## ❓ Troubleshooting

**"Cannot find module '@/...'"** → Check `vitest.config.js` has the `@` alias pointing to `./src`

**"MSW: Unhandled request"** → Add a handler in `tests/mocks/handlers.ts` for that Supabase endpoint

**"E2E: Auth redirect not working"** → Make sure `.env.test` has the correct Supabase test project credentials

**"Coverage below threshold"** → Run `npm run test:coverage` and open `coverage/index.html` to see which files need more tests

**Tests pass locally but fail in CI** → Check GitHub Actions env secrets match your `.env.test` variable names
