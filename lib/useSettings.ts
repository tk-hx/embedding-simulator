import { useState } from "react";

export const useSettings = () => {
  const [apiKey, setApiKey] = useState(
    typeof window !== "undefined" ? localStorage.getItem("API_KEY") : null
  );

  const saveApiKey = (key: string | null) => {
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem("API_KEY", key);
      } else {
        localStorage.removeItem("API_KEY");
      }
    }
  };

  return {
    apiKey,
    setApiKey: (key: string) => {
      setApiKey(key);
      saveApiKey(key);
    },
  };
};
