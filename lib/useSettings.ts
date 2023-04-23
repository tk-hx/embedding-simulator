// lib/useSettings.ts

import { useState, useEffect } from "react";

const useLocalStorage = (key: string, initialValue: string | null = null) => {
  const [value, setValue] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key) ?? initialValue;
    }
    return initialValue;
  });

  useEffect(() => {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }, [key, value]);

  return [value, setValue] as const;
};

export const useSettings = () => {
  const [apiKey, setApiKey] = useLocalStorage("API_KEY");
  const [mongoUri, setMongoUri] = useLocalStorage("MONGO_URI");
  const [mongoDbName, setMongoDbName] = useLocalStorage("MONGO_DB_NAME");

  return {
    apiKey,
    setApiKey,
    mongoUri,
    setMongoUri,
    mongoDbName,
    setMongoDbName,
  };
};
