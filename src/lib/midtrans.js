// Memuat script Snap Midtrans satu kali saja, lalu membuka popup pembayaran.
let snapPromise = null

function loadSnap() {
  if (window.snap) return Promise.resolve(window.snap)

  if (!snapPromise) {
    snapPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = import.meta.env.VITE_MIDTRANS_SNAP_URL
      // Client Key boleh berada di frontend (berbeda dengan Server Key!)
      script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY)
      script.onload = () => resolve(window.snap)
      script.onerror = () => {
        snapPromise = null
        reject(new Error('Gagal memuat Midtrans Snap. Periksa koneksi internet.'))
      }
      document.body.appendChild(script)
    })
  }

  return snapPromise
}

/**
 * Buka popup pembayaran Midtrans.
 * Callback hanya untuk navigasi/UI. Status pembayaran yang SEBENARNYA
 * ditentukan oleh webhook di backend, bukan oleh callback ini.
 */
export async function payWithSnap(snapToken, callbacks = {}) {
  const snap = await loadSnap()
  // callbacks: { onSuccess, onPending, onError, onClose }, semuanya opsional.
  // Kirim apa adanya: Snap menolak callback yang bernilai undefined
  // ("onSuccess should be of type function").
  snap.pay(snapToken, callbacks)
}
