import { useState, useEffect } from 'react';
import type { SearchEngineConfig } from '../types/schema';
import { defaultConfig } from '../data/defaultSchema';

const STORAGE_KEY = 'searchEngineConfig';

export function useConfig() {
  const [config, setConfig] = useState<SearchEngineConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...defaultConfig, ...JSON.parse(stored) } as SearchEngineConfig;
    } catch {
      // ignore
    }
    return defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  function resetToDefault() {
    setConfig(defaultConfig);
  }

  return { config, setConfig, resetToDefault };
}
