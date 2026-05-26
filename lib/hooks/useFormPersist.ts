"use client";

import { useState, useEffect } from "react";

export function useFormPersist<T extends object>(key: string, initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  // Restore on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const saved = sessionStorage.getItem(`form_persist_${key}`);
      if (saved) {
        setValues(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to restore form state", e);
    }
  }, [key]);

  // Save on change (or unmount)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = () => {
      if (Object.keys(values).length > 0) {
        sessionStorage.setItem(`form_persist_${key}`, JSON.stringify(values));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Also save periodically or on value change for better resilience
    sessionStorage.setItem(`form_persist_${key}`, JSON.stringify(values));

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [key, values]);

  const clearPersisted = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`form_persist_${key}`);
    }
    setValues(initialValues);
  };

  return { values, setValues, clearPersisted };
}
