class ApiClient {
  constructor(baseUrl, bearerToken) {
    this.baseUrl = baseUrl;
    this.bearerToken = bearerToken;
  }
  async sendDataToServer(endpoint, payload) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.bearerToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: `HTTP error! status: ${response.status}`,
        };
      }
      return { ok: true, status: response.status, data: await response.json() };
    } catch (error) {
      return {
        ok: false,
        status: error.status || null,
        error: error.message || error.toString(),
      };
    }
  }
  async fetchServerData(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
        },
      });
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: `HTTP error! status: ${response.status}`,
        };
      }
      return { ok: true, status: response.status, data: await response.json() };
    } catch (error) {
      return {
        ok: false,
        status: error.status || null,
        error: error.message || error.toString(),
      };
    }
  }

  async getCharacter() {
    try {
      const character = await this.fetchServerData("character");
      if (!character.ok) {
        return { ok: false, status: character.status, error: character.error };
      }
      return { ok: true, status: character.status, data: character.data };
    } catch (error) {
      console.error("Error fetching character:", error);
      return {
        ok: false,
        status: error.status || null,
        error: error.message || error.toString(),
      };
    }
  }

  async getMissionList() {
    try {
      const missions = await this.fetchServerData("missions");
      if (!missions.ok) {
        return { ok: false, status: missions.status, error: missions.error };
      }
      return { ok: true, status: missions.status, data: missions.data };
    } catch (error) {
      console.error("Error fetching mission list:", error);
      return {
        ok: false,
        status: error.status || null,
        error: error.message || error.toString(),
      };
    }
  }

  async acceptMission(missionId) {
    try {
      const response = await this.sendDataToServer(
        `missions/${missionId}/accept`,
        {}
      );
      if (!response.ok) {
        return { ok: false, status: response.status, error: response.error };
      }
      return { ok: true, status: response.status, data: response.data };
    } catch (error) {
      console.error("Error accepting mission:", error);
      return {
        ok: false,
        status: error.status || null,
        error: error.message || error.toString(),
      };
    }
  }

  // Select a mission using a preferredDifficulty string (e.g., 'hard')
  async selectMission(missions, preferredDifficulty) {
    try {
      const missionWithPreferredDifficulty = missions.filter(
        (m) => m.difficulty === preferredDifficulty
      );
      if (!missionWithPreferredDifficulty.length) {
        return {
          ok: false,
          status: null,
          error: "No preferred difficulty missions available",
        };
      }
      const acceptedMission = await this.acceptMission(
        missionWithPreferredDifficulty[0].id
      );
      if (!acceptedMission.ok) {
        return {
          ok: false,
          status: acceptedMission.status,
          error: acceptedMission.error,
        };
      }
      return { ok: true, data: acceptedMission.data };
    } catch (error) {
      return {
        ok: false,
        status: error.status || null,
        error: error.message || error.toString(),
      };
    }
  }

  async levelUp(victoryToken) {
    try {
      const response = await this.sendDataToServer("character/levelup", {
        victoryToken: victoryToken,
      });
      if (!response.ok) {
        return { ok: false, status: response.status, error: response.error };
      }
      return { ok: true, status: response.status, data: response.data };
    } catch (error) {
      return {
        ok: false,
        status: error.status || null,
        error: error.message || error.toString(),
      };
    }
  }

  async solveMission(solution) {
    try {
      const response = await this.sendDataToServer(`missions/solve`, {
        solution: solution,
      });
      if (!response.ok) {
        return { ok: false, status: response.status, error: response.error };
      }
      return { ok: true, status: response.status, data: response.data };
    } catch (error) {
      return {
        ok: false,
        status: error.status || null,
        error: error.message || error.toString(),
      };
    }
  }
}

module.exports = { ApiClient };
