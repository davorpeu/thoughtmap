// Format an ISO datetime string as ddmmyyyy (the display format you asked for).
export function formatDDMMYYYY(iso) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}${mm}${yyyy}`
}

// Human-friendly date + time for the history list, e.g. "03/09/2026 14:32".
export function formatDateTime(iso) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

// Convert an ISO datetime to the value a <input type="datetime-local"> expects
// (local time, no timezone suffix): "YYYY-MM-DDTHH:mm".
export function toDatetimeLocal(iso) {
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}

// Convert a <input type="datetime-local"> value back to a full ISO string.
export function fromDatetimeLocal(value) {
  return new Date(value).toISOString()
}

export function newId() {
  if (crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
