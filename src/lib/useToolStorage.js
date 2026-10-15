import { useEffect, useState } from 'react';

export function useToolStorage(key, initial, validate) {
  const [value, setValue] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(key)); if (validate(saved)) return saved; }
    catch { /* Tools also work when saved browser data is unavailable. */ }
    return initial();
  });
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); setSaved(true); }
    catch { setSaved(false); }
  }, [key, value]);
  return [value, setValue, saved];
}
