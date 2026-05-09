export const logInfo = (message, meta = {}) => {
  console.log(JSON.stringify({
    level: "info",
    message,
    ...meta,
    timestamp: new Date().toISOString(),
  }));
};

export const logError = (message, meta = {}) => {
  console.error(JSON.stringify({
    level: "error",
    message,
    ...meta,
    timestamp: new Date().toISOString(),
  }));
};
