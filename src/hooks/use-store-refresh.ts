import { useState, useEffect, useCallback } from "react";

// Simple hook that forces re-read from localStorage on mount & window focus
export function useStoreRefresh() {
  const [key, setKey] = useState(0);
  
  const refresh = useCallback(() => setKey(k => k + 1), []);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    // Also listen for custom storage event for cross-tab sync
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, [refresh]);

  return { refreshKey: key, refresh };
}
