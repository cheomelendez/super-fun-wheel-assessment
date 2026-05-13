# QA Assessment Wheel Game

Playwright test automation project for the Super Fun Wheel game.

## Requirements

- Node.js
- npm
- A reachable game app URL:
  - Local: `http://localhost:3000/`

## Install

Install project dependencies:

```bash
npm install
```

Install Playwright browser binaries:

```bash
npx playwright install
```

## Environment Setup

Environment files live in:

```txt
utils/env-files/
```

Available environments:

```txt
env.localhost
```

The active environment is selected with `NODE_ENV`. The project loads the matching file through `global-setup.ts`.

## Run Tests

Run against localhost:

```bash
npm run env:localhost
```

Run against staging:

```bash
npm run env:staging
```

Run one spec file:

```bash
npx playwright test tests/load-and-performance.spec.ts
```

Run one test by title:

```bash
npx playwright test -g "Capture load time metrics with trim averages"
```

List available tests:

```bash
npx playwright test --list
```

## Reports

Open the HTML report after a test run:

```bash
npx playwright show-report
```

Test artifacts are generated in:

```txt
playwright-report/
test-results/
```

## Project Structure

```txt
helpers/       Shared fixtures and browser/game helpers
pages/         Page objects
tests/         Playwright specs
utils/         Environment configuration
```

Key fixtures are exposed from `helpers/BaseTest.ts`:

- `webActions`
- `superFunWheel`
- `gameHooks`
- `consoleHelper`

## Notes

- For localhost runs, start the game app separately on port `3000` before running tests.
- Load and performance tests attach JSON summaries to the Playwright HTML report.
