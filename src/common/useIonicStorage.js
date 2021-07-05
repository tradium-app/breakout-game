import { useState, useEffect } from 'react';
import { Storage } from '@ionic/storage';

const storage = new Storage();
storage.create();

export const useIonicStorage = (key, defaultValue) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    (async function () {
      const stored = await storage.get(key);
      const initial = stored != null ? JSON.parse(stored) : defaultValue;
      setValue(initial);
    })();
  }, []);

  useEffect(() => {
    (async function () {
      await storage.set(key, JSON.parse(value));
    })();
  }, [key, value]);

  return [value, setValue];
};
