const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const streamLogs = async (logsArray, onLogCallback, delayBetweenLogsMs = 500) => {
  for (const log of logsArray) {
    await delay(delayBetweenLogsMs + Math.random() * 200); // add slight randomness
    onLogCallback(log);
  }
};
