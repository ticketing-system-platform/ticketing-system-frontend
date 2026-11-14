import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, CircleCheck, CircleX, Keyboard, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import api from '../../lib/api'
import { formatShortDateTime } from '../../lib/format'

// Tampilan hasil scan
const resultStyles = {
  success: { box: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-800', Icon: CircleCheck },
  used: { box: 'border-amber-200 bg-amber-50', text: 'text-amber-800', Icon: TriangleAlert },
  error: { box: 'border-rose-200 bg-rose-50', text: 'text-rose-800', Icon: CircleX },
}

export default function Scanner() {
  const scannerRef = useRef(null) // instance Html5Qrcode
  const busyRef = useRef(false) // cegah 1 QR terkirim berkali-kali
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  // Kirim kode tiket ke backend
  async function checkin(code) {
    if (busyRef.current) return
    busyRef.current = true

    try {
      const res = await api.post('/admin/checkin', { code })
      showResult({ type: 'success', message: res.data.message, ticket: res.data.data, code })
    } catch (error) {
      const data = error.response?.data
      showResult({
        // 422 + data tiket = tiket sudah pernah dipakai
        type: data?.data ? 'used' : 'error',
        message: data?.message ?? 'Gagal menghubungi server.',
        ticket: data?.data,
        code,
      })
    } finally {
      // Jeda 2,5 detik sebelum bisa scan lagi
      setTimeout(() => (busyRef.current = false), 2500)
    }
  }

  function showResult(newResult) {
    setResult(newResult)
    setHistory((prev) => [{ ...newResult, time: new Date() }, ...prev].slice(0, 8))
  }

  async function startCamera() {
    setCameraError('')
    try {
      const scanner = new Html5Qrcode('reader') // 'reader' = id elemen tempat video
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' }, // kamera belakang (di HP)
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => checkin(decodedText), // dipanggil saat QR terbaca
        () => {}, // dipanggil tiap frame yang tidak berisi QR, diabaikan
      )
      setCameraOn(true)
    } catch {
      setCameraError('Kamera tidak bisa dibuka. Izinkan akses kamera atau gunakan input manual.')
    }
  }

  async function stopCamera() {
    const scanner = scannerRef.current
    if (scanner?.isScanning) await scanner.stop()
    scanner?.clear()
    scannerRef.current = null
    setCameraOn(false)
  }

  // Matikan kamera saat meninggalkan halaman
  useEffect(() => {
    return () => {
      const scanner = scannerRef.current
      if (scanner?.isScanning) scanner.stop().then(() => scanner.clear())
    }
  }, [])

  function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualCode.trim()) return
    checkin(manualCode.trim().toUpperCase())
    setManualCode('')
  }

  const style = result ? resultStyles[result.type] : null
  const ResultIcon = style?.Icon

  return (
    <>
      <PageHeader
        title="Scan Check-in"
        description="Arahkan kamera ke QR code pada tiket pengunjung."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Area kamera */}
          <div className="card overflow-hidden">
            <div className="relative aspect-square bg-slate-900">
              <div id="reader" className="h-full w-full [&_video]:h-full! [&_video]:object-cover" />
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <CameraOff className="size-10" />
                  <p className="text-sm">Kamera belum aktif</p>
                </div>
              )}
            </div>
            <div className="p-4">
              {cameraOn ? (
                <button onClick={stopCamera} className="btn btn-secondary w-full">
                  <CameraOff className="size-4" /> Matikan Kamera
                </button>
              ) : (
                <button onClick={startCamera} className="btn btn-primary w-full">
                  <Camera className="size-4" /> Nyalakan Kamera
                </button>
              )}
              {cameraError && <p className="mt-2 text-xs text-rose-600">{cameraError}</p>}
            </div>
          </div>

          {/* Input manual (jika kamera tidak tersedia) */}
          <form onSubmit={handleManualSubmit} className="card p-4">
            <label htmlFor="code" className="label flex items-center gap-2">
              <Keyboard className="size-4" /> Input kode manual
            </label>
            <div className="flex gap-2">
              <input
                id="code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="TKT-XXXXXXXXXX"
                className="input font-mono uppercase"
              />
              <button type="submit" className="btn btn-primary">
                Cek
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          {/* Hasil scan terakhir */}
          {result ? (
            <div className={`rounded-2xl border p-6 ${style.box}`}>
              <div className={`flex items-center gap-3 ${style.text}`}>
                <ResultIcon className="size-8 shrink-0" />
                <p className="text-lg font-bold">{result.message}</p>
              </div>
              {result.ticket ? (
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <dt className="text-slate-500">Event</dt>
                    <dd className="font-semibold text-slate-900">{result.ticket.event.title}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Pemegang tiket</dt>
                    <dd className="font-semibold text-slate-900">{result.ticket.holder_name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Jenis tiket</dt>
                    <dd className="font-semibold text-slate-900">{result.ticket.ticket_type}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Kode</dt>
                    <dd className="font-mono font-semibold text-slate-900">{result.ticket.code}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Waktu check-in</dt>
                    <dd className="font-semibold text-slate-900">
                      {formatShortDateTime(result.ticket.checked_in_at)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 font-mono text-sm text-slate-600">Kode: {result.code}</p>
              )}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center px-6 py-16 text-center text-slate-500">
              <Camera className="mb-3 size-8 text-slate-400" />
              <p className="text-sm">Hasil scan akan tampil di sini.</p>
            </div>
          )}

          {/* Riwayat scan sesi ini */}
          {history.length > 0 && (
            <div className="card">
              <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">
                Riwayat scan
              </h2>
              <ul className="divide-y divide-slate-100">
                {history.map((item, index) => {
                  const { Icon, text } = resultStyles[item.type]
                  return (
                    <li key={index} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                      <Icon className={`size-4 shrink-0 ${text}`} />
                      <span className="font-mono text-slate-700">{item.code}</span>
                      <span className="ml-auto text-xs text-slate-400">
                        {item.time.toLocaleTimeString('id-ID')}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
