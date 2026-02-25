const FLASH_KEY = "ptk_flash_message";

// Module-level store — survives component remounts within the same JS session.
// Guarantees the message is consumed exactly once even under React StrictMode
// or rapid navigation that unmounts the component before its useEffect fires.
let _pending = null;

export const setFlashMessage = (payload) => {
  if (!payload?.text) {
    return;
  }
  _pending = payload;
  // Also persist to sessionStorage so the message survives a hard page refresh.
  sessionStorage.setItem(FLASH_KEY, JSON.stringify(payload));
};

export const consumeFlashMessage = () => {
  // In-memory path: fast, single-read, immune to double-mounting.
  if (_pending) {
    const msg = _pending;
    _pending = null;
    sessionStorage.removeItem(FLASH_KEY);
    return msg;
  }

  // Fallback: read from sessionStorage (covers page refresh after setFlashMessage).
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) {
    return null;
  }
  sessionStorage.removeItem(FLASH_KEY);
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};

