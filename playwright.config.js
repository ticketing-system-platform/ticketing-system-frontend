import { defineConfig } from '@playwright/test'

/**
 * Konfigurasi smoke test end-to-end (Playwright).
 * Server dev harus sudah berjalan: php artisan serve, queue:work, npm run dev,
 * dan ngrok (untuk webhook Midtrans asli). Jalankan: npm run test:e2e
 * Untuk menguji server hasil deploy, lihat variabel E2E_* di e2e/smoke.spec.js.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000, // per tes; tes pembayaran menambah waktunya sendiri
  expect: { timeout: 15_000 },
  workers: 1, // tes saling bergantung (customer -> admin), jadi berjalan berurutan
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    channel: 'chrome', // pakai Google Chrome yang sudah terpasang (tanpa unduh browser)
    headless: process.env.E2E_HEADLESS === '1', // default: window browser terlihat
    launchOptions: { slowMo: Number(process.env.E2E_SLOWMO ?? 250) }, // jeda antar aksi (ms)
    viewport: { width: 1280, height: 800 },
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
})
