const { send } = require("process");

require("dotenv").config();

const bearerToken = process.env.BEARER_TOKEN;

const apiUrl = "https://loos.sd-lab.nl/api/character";
const baseUrl = "https://loos.sd-lab.nl/api";
// end point for missions: https://loos.sd-lab.nl/api/missions

// Debug version with better error handling
async function getCharacterDebug() {
  try {
    console.log("Making request to:", apiUrl);
    console.log(
      "Using Authorization header:",
      `Bearer ${bearerToken ? bearerToken.substring(0, 10) + "..." : "MISSING"}`
    );

    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    console.log("Response status:", response.status);
    console.log("Response status text:", response.statusText);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw response data:", data);
    console.log("Data type:", typeof data);
    console.log("Is data null?", data === null);
    console.log("Is data undefined?", data === undefined);

    return data;
  } catch (error) {
    console.error("Detailed error:", error);
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
  }
}

// Call the debug function
// getCharacterDebug();

// Production-ready version (cleaner)
async function getCharacter() {
  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching character:", error.message);
    throw error; // Re-throw so caller can handle it
  }
}

async function getMissions() {
  try {
    const response = await fetch(`${baseUrl}/missions`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching missions:", error.message);
    throw error; // Re-throw so caller can handle it
  }
}

async function acceptMission(missionId) {
  try {
    const response = await fetch(`${baseUrl}/missions/${missionId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error accepting mission:", error.message);
    throw error; // Re-throw so caller can handle it
  }
}

async function solve() {
  const missions = await getMissions();
  const type = "decrypt_cipher";

  // Accept the first "decrypt_cipher" mission
  const decryptCipherMission = missions.find((m) => m.type === type);
  if (decryptCipherMission) {
    const acceptedMission = await acceptMission(decryptCipherMission.id);
    solveDecryptCipher(acceptedMission);
  } else {
    console.log("No decrypt_cipher mission found.");
  }

  // const acceptedMission = await acceptMission(missionId);
  // console.log("Accepted mission:", acceptedMission);
  // switch (acceptedMission.type) {
  //   case "decrypt_cipher":
  //     solveDecryptCipher(acceptedMission);
  //     break;
  //   case "find_file":
  //     break;
  //   default:
  //     console.log("Unknown mission type:", acceptedMission.type);
  //     break;
  // }
}
function solveDecryptCipher(mission) {
  encryptedWord = mission.payload.encrypted_message;
  shiftKey = -mission.payload.shift_key;

  let decryptedMessage = "";
  for (let i = 0; i < encryptedWord.length; i++) {
    const char = encryptedWord[i];
    const charCode = char.charCodeAt(0);
    const decryptedCharCode = ((charCode - 97 - shiftKey + 26) % 26) + 97;
    decryptedMessage += String.fromCharCode(decryptedCharCode);
  }
  console.log("Decrypted message:", decryptedMessage);
  const response = sendDataBack(decryptedMessage);
  return response;
}

async function sendDataBack(solution) {
  try {
    const response = await fetch(`${baseUrl}/missions/solve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ solution }),
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending data back:", error.message);
    throw error; // Re-throw so caller can handle it
  }
}

// Usage example:
async function main() {
  try {
    // const response = await sendDataBack("ADMIN OVERRIDE");
    const response = await getCharacter();
    // Now you can use characterData here for other operations
    if (response) {
      console.log("character: ", response);
    }
  } catch (error) {
    console.error("Failed to get character data:", error.message);
  }
}

// Uncomment to use the production version:
main();
