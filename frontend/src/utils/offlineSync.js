import { openDB } from "idb";

const DB_NAME = "fin-track-sync";
const STORE_NAME = "offline-tasks";

/**
 * Initializes the IndexedDB database.
 */
export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
};

/**
 * Saves a failed request to the offline queue.
 * @param {Object} config Axios request config
 */
export const saveTask = async (config) => {
  const db = await initDB();
  const task = {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: { ...config.headers }, // Copy headers (except sensitive ones if necessary)
    timestamp: Date.now(),
  };

  // Remote sensitive headers that shouldn't be persisted if they are dynamic
  delete task.headers.Authorization;

  await db.add(STORE_NAME, task);
  console.log("Task saved to offline queue:", task.url);
};

/**
 * Retrieves all pending tasks from the queue.
 */
export const getTasks = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

/**
 * Deletes a task from the queue by ID.
 * @param {number} id
 */
export const deleteTask = async (id) => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

/**
 * Processes the queue by re-sending all saved requests.
 * @param {import('axios').AxiosInstance} apiInstance The axios instance to use for re-sending
 */
export const processQueue = async (apiInstance) => {
  const tasks = await getTasks();
  if (tasks.length === 0) return;

  console.log(`Processing ${tasks.length} offline tasks...`);
  window.dispatchEvent(new CustomEvent("sync-started"));

  for (const task of tasks) {
    try {
      // Re-auth header will be injected by the axios interceptor on retry
      await apiInstance({
        url: task.url,
        method: task.method,
        data: task.data,
      });
      await deleteTask(task.id);
      console.log(`Successfully synced: ${task.url}`);
    } catch (error) {
      console.error(`Failed to sync task ${task.id}:`, error);
      // If it fails again, we leave it in the queue for the next online event
      break;
    }
  }

  window.dispatchEvent(new CustomEvent("sync-finished"));
};
