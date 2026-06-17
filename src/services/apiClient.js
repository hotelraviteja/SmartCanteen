import axios from "axios";

// This is a mockup client designed for smooth integration with a real backend later.
// We configure it to intercept calls and simulate network latency and conditions.
const apiClient = {
  // Configurable simulation flags
  simulation: {
    delayMs: 800,
    shouldFailNetwork: false,
    shouldExpireSession: false,
    shouldLockAccount: false,
  },

  setDelay: (ms) => {
    apiClient.simulation.delayMs = ms;
  },

  setNetworkFailure: (fail) => {
    apiClient.simulation.shouldFailNetwork = fail;
  },

  // Helper helper to simulate API calls
  post: async (url, data, config = {}) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (apiClient.simulation.shouldFailNetwork) {
          return reject({
            response: {
              status: 503,
              data: { message: "Server is temporarily unavailable. Please try again later." }
            }
          });
        }
        if (apiClient.simulation.shouldExpireSession) {
          return reject({
            response: {
              status: 401,
              data: { message: "Session expired. Please log in again." }
            }
          });
        }
        if (apiClient.simulation.shouldLockAccount) {
          return reject({
            response: {
              status: 423,
              data: { message: "Account locked due to multiple failed login attempts." }
            }
          });
        }
        
        resolve({
          status: 200,
          data: {
            success: true,
            message: "Success",
            ...data
          }
        });
      }, apiClient.simulation.delayMs);
    });
  },

  get: async (url, config = {}) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (apiClient.simulation.shouldFailNetwork) {
          return reject({
            response: { status: 503, data: { message: "Network error" } }
          });
        }
        resolve({
          status: 200,
          data: { success: true }
        });
      }, apiClient.simulation.delayMs);
    });
  }
};

export default apiClient;
