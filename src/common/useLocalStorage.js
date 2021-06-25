import { useState, useEffect } from 'react';
import { Storage } from '@ionic/storage';

const storage = new Storage();
storage.create();

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    (async function () {
      const stored = await storage.get(key);

      const initial = stored ? parseInt(stored) : defaultValue;
      setValue(initial);
    })();
  }, []);

  useEffect(() => {
    (async function () {
      await storage.set(key, parseInt(value));
    })();
  }, [key, value]);

  return [value, setValue];
};
