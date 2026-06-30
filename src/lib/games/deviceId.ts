const DEVICE_ID_KEY = 'boundary-bytes-device-id';

function generateDeviceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `bb_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const id = generateDeviceId();
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
