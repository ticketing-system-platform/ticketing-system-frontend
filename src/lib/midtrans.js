// Memuat script Snap Midtrans satu kali saja, lalu membuka popup pembayaran.
let snapPromise = null

function loadSnap() {
  if (window.snap) return Promise.resolve(window.snap)

  if (!snapPromise) {
    snapPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = import.meta.env.VITE_MIDTRANS_SNAP_URL
      
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


export async function payWithSnap(snapToken, callbacks = {}) {
  const snap = await loadSnap()
  
  const cleanCallbacks = Object.fromEntries(
    Object.entries(callbacks).filter(([, fn]) => typeof fn === 'function'),
  )
  snap.pay(snapToken, cleanCallbacks)
}
