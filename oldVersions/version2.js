const { log } = require("console");
const { send } = require("process");
require("dotenv").config();

const config = {
  bearerToken: process.env.BEARER_TOKEN,
  delayTime: parseInt(process.env.DELAY_TIME),
  preferredDifficulty: process.env.PREFERRED_DIFFICULTY,
  energyThreshold: parseInt(process.env.ENERGY_THRESHOLD),
  baseUrl: "https://loos.sd-lab.nl/api",
};

// API configuration

// Utility function to add delays between API calls
function delay(ms = config.delayTime) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generic function to fetch data from the API
async function fetchServerData(endpoint) {
  try {
    const response = await fetch(`${config.baseUrl}/${endpoint}`, {
      headers: { Authorization: `Bearer ${config.bearerToken}` },
    });
    if (!response.ok) {
      if (response.status === 429) {
        console.log("Rate limited. Please wait before making more requests.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching server data:", error);
    return null; // Return null instead of undefined to make error handling easier
  }
}

// Generic function to send data to the API
async function sendDataToServer(endpoint, payload) {
  try {
    const response = await fetch(`${config.baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.bearerToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending data to server:", error);
  }
}

async function levelUp(victoryToken) {
  try {
    const response = await sendDataToServer("character/levelup", {
      victoryToken: victoryToken,
    });
    return response;
  } catch (error) {
    console.error("Error leveling up:", error);
    return null;
  }
}

async function getMissionList() {
  try {
    const missions = await fetchServerData("missions");
    return missions;
  } catch (error) {
    console.error("Error fetching mission list:", error);
  }
}

// Caesar cipher decryption algorithm
function solveDecryptCipher(message, shift) {
  // Received shift is positive but needs to be treated as negative
  shift = -Math.abs(shift);
  const decrypted = message.split("").map((char) => {
    const code = char.charCodeAt(0);
    // Apply the shift only to lowercase letters
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    }
    return char;
  });
  return decrypted.join("");
}

// Recursive file finder for "find_file" type missions
function solveFindFileChallenge(payload) {
  // Recursive function to search for a file in the folder structure
  function findFile(node, targetFileName, currentPath = "") {
    // Build the current path
    const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;

    // If this is a file and matches the target, return the path
    if (node.type === "file" && node.name === targetFileName) {
      return fullPath;
    }

    // If this is a folder, search through its children
    if (node.type === "folder" && node.children) {
      for (const child of node.children) {
        const result = findFile(child, targetFileName, fullPath);
        if (result) {
          return result;
        }
      }
    }

    // File not found in this branch
    return null;
  }

  // Start searching from the root for "secret_intel.dat"
  return findFile(payload, "secret_intel.dat");
}

// Selects and accepts the hardest available mission
async function pickMission(missions) {
  try {
    // get the most difficult missions (difficulty: hard) and based on that call the apropriate function to accept the mission and solve it
    const missionWithPreferredDifficulty = missions.filter(
      (m) => m.difficulty === config.preferredDifficulty
    );
    if (missionWithPreferredDifficulty.length > 0) {
      const missionToAccept = missionWithPreferredDifficulty[0];
      const acceptedMission = await acceptMission(missionToAccept.id);
      return acceptedMission;
    } else {
      console.log("No hard missions available");
      return null;
    }
  } catch (error) {
    console.error("Error in pickMission:", error);
    return null;
  }
}

async function acceptMission(missionId) {
  try {
    const response = await sendDataToServer(`missions/${missionId}/accept`, {});
    return response;
  } catch (error) {
    console.error("Error accepting mission:", error);
    // If it's a 409 conflict, the mission might already be accepted
    if (error.message.includes("409")) {
      console.log("Mission might already be accepted or unavailable");
    }
    return null;
  }
}
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

async function getCharacter() {
  try {
    const character = await fetchServerData("character");
    return character;
  } catch (error) {
    console.error("Error fetching character:", error);
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
