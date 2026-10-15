export const CLASS_SCHEDULE_STORAGE_KEY = 'kidit-class-schedule';

export function notifyClassScheduleUpdated(classId) {
  const detail = { classId, updatedAt: Date.now() };
  window.dispatchEvent(new CustomEvent('class-schedule-updated', { detail }));
  try { localStorage.setItem(CLASS_SCHEDULE_STORAGE_KEY, JSON.stringify(detail)); }
  catch { /* Cross-tab refresh is optional when browser storage is unavailable. */ }
}
