# Code-and-Conquest API Automation

A small Node.js bot that automates mission acceptance and solving against the Code & Conquest API (https://loos.sd-lab.nl/api). This repository contains a working version organized into a small modular structure.

## Project layout

- `/run.js` — entry point (parses CLI args, validates config, starts the bot)
- `/src/config.js` — config loader + validation
- `/src/apiClient.js` — HTTP API client (returns { ok, status, data, error })
- `/src/missionSolver.js` — mission solvers (cipher, file-finder, etc.)
- `/src/bot.js` — orchestrator (self-scheduling loop, uses ApiClient + MissionSolver)

> Note: The project uses CommonJS modules and requires Node.js >= 18 (for `fetch` support). If you run an older Node version, install `node-fetch` or upgrade Node.

## Prerequisites

- Node.js 18+ (or add a fetch polyfill)
- npm
- A valid `BEARER_TOKEN` for the API

## Environment variables

Create a `.env` file in the project root (or export environment variables) with the following keys:

```env
BEARER_TOKEN=your_api_bearer_token_here
DELAY_TIME=2000               # milliseconds between API calls
PREFERRED_DIFFICULTY=hard     # e.g. hard | medium | easy
ENERGY_THRESHOLD=1            # numeric threshold for taking actions
```

## Install

```powershell
npm install
```

The repository has a `start` script that runs the runner:

```powershell
npm start
# which runs: node run.js
```

## Usage

Dry run (validate config and print masked values, then exit):

```powershell
node run.js --dry-run
# or
node run.js -n
```

Run the bot normally:

```powershell
node run.js
# or
npm start
```

## Behavior and design notes

- The bot uses a self-scheduling loop so only one `main()` runs at a time.
- API calls return structured objects `{ ok, status, data, error }` so the bot can handle and react to errors and HTTP 429 rate limits.
- The `run.js` script masks the bearer token in logs to avoid accidental leakages.

## Troubleshooting

- If nothing appears to happen on start:

  - Ensure env vars are set correctly. `validateConfig()` now fails fast and will stop startup with an error.
  - Run with `--dry-run` to confirm configuration and token masking.
  - Ensure Node version is >= 18 or install a fetch polyfill.

- If you see HTTP 429 errors frequently, increase `DELAY_TIME`.

## License

All rights reserved. See the `LICENSE` file for full terms.
