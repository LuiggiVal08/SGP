import '@testing-library/jest-dom/vitest';

if (typeof localStorage === 'undefined' || localStorage === null) {
  const store: Record<string, string> = {};
  const ls = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  } as Storage;
  Object.defineProperty(globalThis, 'localStorage', { value: ls, writable: true, configurable: true });
}
