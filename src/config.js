require("dotenv").config();

const config = {
  bearerToken: process.env.BEARER_TOKEN,
  delayTime: parseInt(process.env.DELAY_TIME),
  preferredDifficulty: process.env.PREFERRED_DIFFICULTY,
  energyThreshold: parseInt(process.env.ENERGY_THRESHOLD),
  baseUrl: "https://loos.sd-lab.nl/api",
};

function validateConfig() {
  if (!config.bearerToken) {
    throw new Error("BEARER_TOKEN is not set in environment variables.");
  }
  if (isNaN(config.delayTime) || config.delayTime < 0) {
    throw new Error("DELAY_TIME must be a non-negative integer.");
  }
  if (!config.preferredDifficulty) {
    throw new Error(
      "PREFERRED_DIFFICULTY is not set in environment variables."
    );
  }
  if (isNaN(config.energyThreshold) || config.energyThreshold < 0) {
    throw new Error("ENERGY_THRESHOLD must be a non-negative integer.");
  }
  console.log("Configuration validated successfully.");
}

module.exports = { config, validateConfig };
