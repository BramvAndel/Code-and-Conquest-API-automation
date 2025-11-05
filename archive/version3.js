const { log } = require("console");
const { send } = require("process");

async function solveMission(missionId, solution) {
  try {
    const response = await sendDataToServer(`missions/solve`, {
      solution: solution,
    });
    return response;
  } catch (error) {
    console.error("Error solving mission:", error);
  }
}

// Main game loop - handles the complete mission workflow
async function main() {
  try {
    console.log("Getting character data...");
    const character = await getCharacter();
    if (!character) {
      console.log("Failed to get character data. Exiting.");
      return;
    }

    await delay(config.delayTime);

    if (character.energy <= 0) {
      console.log("Not enough energy to perform actions.");
      return;
    }

    if (character.activeMission == null) {
      console.log("No active mission, trying to get mission list...");
      const missions = await getMissionList();
      if (!missions) {
        console.log(
          "Failed to get missions (possibly rate limited). Try again later."
        );
        return;
      }

      await delay(config.delayTime);

      const acceptedMission = await pickMission(missions);
      if (!acceptedMission) {
        console.log("Failed to accept a mission. Exiting.");
        return;
      }
      console.log(acceptedMission);

      await delay(config.delayTime);

      console.log("Getting updated character data...");
      const updatedCharacter = await getCharacter();
      if (!updatedCharacter || !updatedCharacter.activeMission) {
        console.log("Failed to get updated character with active mission.");
        return;
      }
      character.activeMission = updatedCharacter.activeMission;
    }

    if (!character.activeMission) {
      console.log("No active mission available.");
      return;
    }

    console.log(character.activeMission);
    console.log(character.activeMission.solution);
    console.log(character.activeMission.puzzle.id);

    await delay(config.delayTime);

    // let solveResponse;
    // if (character.activeMission.type == "decrypt_cipher") {
    //   const solve = solveDecryptCipher(
    //     character.activeMission.payload.encrypted_message,
    //     character.activeMission.payload.shift_key
    //   );
    //   solveResponse = await solveMission(
    //     character.activeMission.puzzle.id,
    //     solve
    //   );
    // } else if (character.activeMission.type == "find_file") {

    console.log("Solving mission...");
    const solveResponse = await solveMission(
      character.activeMission.puzzle.id,
      character.activeMission.solution
    );
    // }
    console.log(solveResponse);

    // Extract the victoryToken from the response
    if (
      solveResponse &&
      solveResponse.reward &&
      solveResponse.reward.victoryToken
    ) {
      const victoryToken = solveResponse.reward.victoryToken;
      console.log("Victory Token:", victoryToken);

      await delay(config.delayTime);

      // Use the victoryToken for leveling up
      console.log("Leveling up...");
      const levelupResponse = await levelUp(victoryToken);
      console.log("Level up response:", levelupResponse);
    } else {
      console.log("No victory token found in response");
    }
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Continuous loop to keep running missions automatically
async function runContinuously() {
  while (true) {
    await main();
    await delay(5000); // Wait 5 seconds between runs to avoid rate limiting
  }
}

runContinuously();
