class MissionSolver {
  constructor() {
    this.solverMethods = {
      decrypt_cipher: this.solveDecryptCipher.bind(this),
      find_file: this.solveFindFile.bind(this),
      add_even_numbers: this.solveAddEvenNumbers.bind(this),
    };
  }

  solve(type, payload) {
    const solver = this.solverMethods[type];
    if (solver) {
      return solver.call(this, payload);
    }
    throw new Error(`No solver found for type: ${type}`);
  }

  solveDecryptCipher(payload) {
    const message = payload.encrypted_message;
    const shift = payload.shift_key;
    // Received shift is positive but needs to be treated as negative
    const adjustedShift = -Math.abs(shift);
    const decrypted = message.split("").map((char) => {
      const code = char.charCodeAt(0);
      // Apply the shift only to lowercase letters
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(
          ((code - 97 - adjustedShift + 26) % 26) + 97
        );
      }
      return char;
    });
    return decrypted.join("");
  }

  solveFindFile(payload) {
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
  solveAddEvenNumbers(payload) {
    let sum = 0;
    for (const numbers of payload) {
      if (numbers % 2 === 0) {
        sum += numbers;
      }
    }
    return sum;
  }
}

module.exports = { MissionSolver };
