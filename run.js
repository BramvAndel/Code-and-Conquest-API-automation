const { ApiClient } = require("./src/apiClient");
const { MissionSolver } = require("./src/missionSolver");
const { Bot } = require("./src/bot");
const { config, validateConfig } = require("./src/config");

// Parse CLI args early
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-n");
const once = args.includes("--once");
const help = args.includes("--help") || args.includes("-h");

if (help) {
  console.log("Usage: node run.js [--dry-run|-n] [--once] [--help|-h]");
  console.log(
    "--dry-run, -n : Print configuration and exit without running the bot."
  );
  console.log("--once         : Run the bot's main function once and exit.");
  console.log("--help, -h    : Show this help message.");
  process.exit(0);
}

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

  if (once) {
    console.log("Single run mode enabled — bot will execute once and exit.");
    bot.once();
    return;
  } else {
    bot.start();
  }
}

// Run main immediately
main();
