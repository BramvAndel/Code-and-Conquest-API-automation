class Bot {
  constructor(ApiClient, MissionSolver, config) {
    this.intervalId = null;
    this.running = false;
    this.apiClient = ApiClient;
    this.missionSolver = MissionSolver;
    this.config = config;
  }

  start() {
    if (this.running) {
      console.log("Bot is already running.");
      return;
    }
    this.running = true;
    console.log("Bot started.");
    // Start the self-scheduling loop. store the promise so stop() can await if desired.
    this._runLoopPromise = this._runLoop();
  }

  async _runLoop() {
    while (this.running) {
      try {
        await this.main();
      } catch (error) {
        console.error("Error in main loop:", error);
        const backoff =
          this.config.errorBackoff || Math.max(this.config.delayTime, 5000);
        // Wait before retrying after an unexpected error
        await this.delay(backoff);
        continue;
      }

      if (!this.running) break;

      // Wait the configured delay between cycles
      await this.delay();
    }
    // Clean exit
    return;
  }

  async main() {
    try {
      console.log("Getting character data...");
      const characterResponse = await this.apiClient.getCharacter();
      if (!characterResponse.ok) {
        console.error("Failed to get character data:", characterResponse.error);
        return;
      }
      const character = characterResponse.data;
      // Respect configured delay between API calls
      await this.delay(this.config.delayTime);

      if (character.energy <= 0) {
        console.log("Not enough energy to perform actions.");
        return;
      }

      if (character.activeMission == null) {
        console.log("No active mission, trying to get mission list...");
        const missionsResponse = await this.apiClient.getMissionList();
        if (!missionsResponse.ok) {
          if (missionsResponse.status === 429) {
            const message = missionsResponse.error?.message || "";
            const cooldownMatch = message.match(/(\d+)\s*seconds?/i);
            const cooldownTime = cooldownMatch
              ? parseInt(cooldownMatch[1]) * 1000
              : 60000;
            console.log(
              `Rate limited. Waiting ${
                cooldownTime / 1000
              } seconds before retrying...`
            );
            console.log(missionsResponse);
            await this.delay(cooldownTime);
            return;
          }
        }
        const missions = missionsResponse.data;
        // delay after fetching missions
        await this.delay(this.config.delayTime);

        const acceptedMissionResponse = await this.apiClient.selectMission(
          missions,
          this.config.preferredDifficulty
        );
        if (!acceptedMissionResponse.ok) {
          console.error(
            "Failed to accept mission:",
            acceptedMissionResponse.error
          );
          return;
        }
        console.log(acceptedMissionResponse.data);
        // delay after accepting mission
        await this.delay(this.config.delayTime);

        const updatedCharacterResponse = await this.apiClient.getCharacter();
        if (!updatedCharacterResponse.ok) {
          console.error(
            "Failed to get updated character with active mission:",
            updatedCharacterResponse.error
          );
          return;
        }
        // delay after fetching updated character
        await this.delay(this.config.delayTime);
        const updatedCharacter = updatedCharacterResponse.data;
        character.activeMission = updatedCharacter.activeMission;

        if (!character.activeMission) {
          console.log("No active mission available.");
          return;
        }
      }

      console.log(character.activeMission);
      console.log(character.activeMission.solution);
      console.log(character.activeMission.puzzle.id);

      console.log("Solving mission...");

      let solveResponse;
      if (character.activeMission.solution != null) {
        solveResponse = await this.apiClient.solveMission(
          character.activeMission.solution
        );
        console.log("Solve response:", solveResponse);
        await this.delay(this.config.delayTime);
      } else if (character.activeMission.solution == null) {
        const solution = this.missionSolver.solve(
          character.activeMission.puzzle.type,
          character.activeMission.puzzle.payload
        );

        solveResponse = await this.apiClient.solveMission(solution);
        if (!solveResponse.ok) {
          console.error("Failed to solve mission:", solveResponse.error);
          return;
        }
      }
      console.log("Mission solved successfully:", solveResponse.data);
      const victoryToken = solveResponse.data.reward.victoryToken;
      console.log("Victory Token:", victoryToken);

      console.log("Leveling up character...");
      const levelUpResponse = await this.apiClient.levelUp(victoryToken);
      if (!levelUpResponse.ok) {
        console.error("Failed to level up character:", levelUpResponse.error);
        return;
      }
      console.log("Character leveled up successfully:", levelUpResponse.data);
      await this.delay(this.config.delayTime);

      // Continue with the rest of the main function logic...
    } catch (error) {
      console.error("Error in main function:", error);
    }
  }

  stop() {
    if (!this.running) {
      console.log("Bot is not running.");
      return;
    }
    this.running = false;
    console.log("Bot stopped.");
    // If the run loop is active, it will exit naturally when it checks `this.running`.
  }

  delay(ms) {
    const wait = typeof ms === "number" ? ms : this.config.delayTime;
    return new Promise((resolve) => setTimeout(resolve, wait));
  }
}

module.exports = { Bot };
