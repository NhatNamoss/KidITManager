export async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) window.dispatchEvent(new Event('session-expired'));
  if (!response.ok) throw new Error(data.error || 'Không tải hoặc lưu được dữ liệu.');
  return data;
}
export const jsonBody = (body, method = 'POST') => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const localDate = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

export function downloadCsv(filename, rows) {
  const escape = value => `"${String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
  const blob = new Blob(['\uFEFF', rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
