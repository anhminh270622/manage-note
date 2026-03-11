const STORAGE_KEY = "activityLogs";
const MAX_LOGS = 500;

export const addActivityLog = (payload) => {
  const currentLogs = getActivityLogs();
  const nextLog = {
    id: Date.now(),
    action: payload.action || "unknown_action",
    module: payload.module || "system",
    detail: payload.detail || "",
    createdAt: new Date().toISOString(),
  };
  const nextLogs = [nextLog, ...currentLogs].slice(0, MAX_LOGS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLogs));
};

export const getActivityLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
};

export const clearActivityLogs = () => {
  localStorage.removeItem(STORAGE_KEY);
};
