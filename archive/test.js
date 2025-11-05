const victoryToken = "VT_b538515929d1ed86b8647b110fa7d452";
const apiUrl = "https://loos.sd-lab.nl/api/character/levelup";
const bearerToken =
  "374a84efe38cbc094ed2977a7a7e6614e091c266430066a47d7bda3c8b9c";

async function sendVictoryTokenToServer() {
  console.log("Sending victory token to server:", victoryToken);
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ victoryToken: victoryToken }),
    });
    const data = await response.json();
    console.log("Server response:", data);
  } catch (error) {
    console.error("Error sending victory token:", error);
  }
}

sendVictoryTokenToServer();
