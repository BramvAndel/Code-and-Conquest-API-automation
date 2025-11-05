const { ApiClient } = require("./src/apiClient");
const { MissionSolver } = require("./src/missionSolver");
const { Bot } = require("./src/bot");
const { config, validateConfig } = require("./src/config");
const { log } = require("console");
const { send } = require("process");

// Parse CLI args early
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-n");

function main() {
  // validate and load configuration
  try {
    validateConfig();
  } catch (err) {
    console.error("Configuration error:", err.message || err);
    process.exit(1);
  }

  // Print a small startup summary (mask the bearer token)
  const maskedToken = config.bearerToken
    ? `${config.bearerToken.slice(0, 6)}...${config.bearerToken.slice(-4)}`
    : "(none)";
  console.log("Starting bot with config:", {
    baseUrl: config.baseUrl,
    bearerToken: maskedToken,
    delayTime: config.delayTime,
    preferredDifficulty: config.preferredDifficulty,
  });

  if (dryRun) {
    console.log("Dry run mode enabled — exiting after printing configuration.");
    process.exit(0);
  }

  const apiClient = new ApiClient(config.baseUrl, config.bearerToken);
  const missionSolver = new MissionSolver();
  const bot = new Bot(apiClient, missionSolver, config);
  bot.start();
}

// Run main immediately
main();
