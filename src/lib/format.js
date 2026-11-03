// Kumpulan fungsi bantu untuk menampilkan angka & tanggal dalam format Indonesia

// 150000 -> "Rp 150.000"
export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

// "2026-10-28T12:00:00Z" -> "Rabu, 28 Oktober 2026 pukul 19.00"
export function formatDateTime(iso) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

// "2026-10-28T12:00:00Z" -> "28 Okt 2026, 19.00"
export function formatShortDateTime(iso) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// Untuk badge tanggal di kartu event: { day: "28", month: "OKT" }
export function dateParts(iso) {
  const date = new Date(iso)
  return {
    day: date.getDate(),
    month: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date).toUpperCase(),
  }
}

// Nilai untuk <input type="datetime-local">, contoh: "2026-10-28T19:00"
export function toDateTimeLocal(iso) {
  const date = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}
