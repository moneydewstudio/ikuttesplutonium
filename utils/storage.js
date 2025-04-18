// utils/storage.js

// Function to store data in localStorage
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting localStorage:", error);
  }
};

// Function to get data from localStorage
export const getLocalStorage = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error getting localStorage:", error);
    return null;
  }
};

// Function to remove data from localStorage
export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing localStorage:", error);
  }
};

// Function to store data in indexedDB (implementation needed)
export const setIndexedDB = async (key, value) => {
  console.log("indexedDB set not implemented yet")
};

// Function to get data from indexedDB (implementation needed)
export const getIndexedDB = async (key) => {
    console.log("indexedDB get not implemented yet")
};

// Function to remove data from indexedDB (implementation needed)
export const removeIndexedDB = async (key) => {
    console.log("indexedDB remove not implemented yet")
};
