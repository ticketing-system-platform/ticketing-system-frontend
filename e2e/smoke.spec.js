import fs from 'node:fs'
import { chromium, expect, test } from '@playwright/test'
import {
  artisan,
  chooseBcaVa,
  login,
  logout,
  payBcaVaInSimulator,
  remainingOf,
  snapFrame,
  ticketCard,
} from './helpers'

/**
 * Smoke test seluruh skenario aplikasi di browser.
 * Tes berjalan BERURUTAN dan saling berbagi data: customer baru membeli tiket,
 * lalu admin men-scan tiket tersebut.
 *
 * Webhook: secara default menunggu notifikasi ASLI dari Midtrans (lewat ngrok).
 * Tanpa ngrok, jalankan dengan E2E_WEBHOOK=simulate (memakai php artisan midtrans:simulate).
 *
 * Menguji server hasil deploy (VPS): E2E_BASE_URL=https://domain-anda E2E_REMOTE=1
 * E2E_ADMIN_PASSWORD=... (php artisan tidak bisa dipanggil dari laptop, jadi langkah
 * yang memakainya dilewati).
 */
test.describe.configure({ mode: 'serial' })

const run = Date.now().toString(36) // pembeda data antar-run
const customer = { name: 'Siti E2E', email: `e2e-${run}@tiket.test`, password: 'rahasia123' }
const eventTitle = `E2E Konser Akustik ${run}`
const simulateWebhook = process.env.E2E_WEBHOOK === 'simulate'
const remote = process.env.E2E_REMOTE === '1'
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? 'password'

if (remote && simulateWebhook) {
  throw new Error(
    'E2E_WEBHOOK=simulate butuh php artisan lokal, tidak bisa dipakai dengan E2E_REMOTE=1',
  )
}

// Data yang dibagikan antar-tes
const paidOrder = { code: '', tickets: [] }
let expiredOrderCode = ''
let qrVideoPath = ''

test.describe('Publik', () => {
  test('beranda menampilkan event tayang dan pencarian', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Event Mendatang' })).toBeVisible()

    const cards = page.locator('a[href^="/events/"]')
    await expect(cards.first()).toBeVisible()
    expect(await cards.count()).toBeGreaterThanOrEqual(4)
    await expect(page.getByText('Stand Up Comedy Night')).toBeVisible()
    // Event berstatus draft tidak boleh tampil di publik
    await expect(page.getByText('Pameran Seni Rupa Nusantara')).toHaveCount(0)

    await page.getByPlaceholder('Cari nama event atau kota...').fill('comedy')
    await page.getByRole('button', { name: 'Cari' }).click()
    await expect(page.getByRole('heading', { name: 'Hasil pencarian "comedy"' })).toBeVisible()
    await expect(cards).toHaveCount(1)

    await page.getByPlaceholder('Cari nama event atau kota...').fill('tidak-ada-event-ini')
    await page.getByRole('button', { name: 'Cari' }).click()
    await expect(page.getByText('Event tidak ditemukan')).toBeVisible()
  })

  test('detail event, batas jumlah tiket, dan wajib login untuk membeli', async ({ page }) => {
    await page.goto('/events/stand-up-comedy-night')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stand Up Comedy Night')

    const buy = page.getByRole('button', { name: 'Masuk untuk Membeli' })
    await expect(buy).toBeDisabled() // belum memilih tiket

    // Tombol + berhenti di batas sisa kuota (maksimal 10 per jenis tiket)
    const card = ticketCard(page, 'Front Row')
    const remaining = await remainingOf(card)
    const max = Math.min(remaining, 10)
    const plus = card.locator('button').last()
    for (let i = 0; i < max; i++) await plus.click()
    await expect(card.locator('span.tabular-nums')).toHaveText(String(max))
    await expect(plus).toBeDisabled()

    await buy.click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('halaman tidak ditemukan dan route yang wajib login', async ({ page }) => {
    await page.goto('/events/slug-yang-tidak-ada')
    await expect(page.getByText('Event tidak ditemukan')).toBeVisible()

    await page.goto('/halaman-acak')
    await expect(page.getByText('Halaman tidak ditemukan')).toBeVisible()

    await page.goto('/my-tickets')
    await expect(page).toHaveURL(/\/login$/)
  })
})

test.describe('Autentikasi', () => {
  test('validasi register, daftar akun baru, logout, dan login', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Daftar' }).click()
    await expect(page.getByText('Nama wajib diisi.')).toBeVisible()
    await expect(page.getByText('Email wajib diisi.')).toBeVisible()
    await expect(page.getByText('Password wajib diisi.')).toBeVisible()

    await page.locator('#name').fill(customer.name)
    await page.locator('#email').fill(customer.email)
    await page.locator('#password').fill(customer.password)
    await page.locator('#password_confirmation').fill(customer.password)
    await page.getByRole('button', { name: 'Daftar' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText(customer.name)).toBeVisible()

    await logout(page)

    await login(page, customer.email, 'password-salah')
    await expect(page.getByText('Email atau password salah.')).toBeVisible()

    await login(page, customer.email, customer.password)
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('link', { name: 'Tiket Saya' })).toBeVisible()
  })
})

test.describe('Customer', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, customer.email, customer.password)
    await expect(page).toHaveURL('/')
  })

  test('checkout, bayar VA BCA di Midtrans Sandbox, webhook menerbitkan tiket', async ({
    page,
    context,
  }) => {
    test.setTimeout(240_000)

    await page.goto('/events/tech-conference-indonesia')
    const plus = ticketCard(page, 'Student').locator('button').last()
    await plus.click()
    await plus.click()
    await page.getByRole('button', { name: 'Beli Tiket' }).click()

    // Halaman Checkout
    await expect(page).toHaveURL(/\/checkout$/)
    await expect(page.getByText(customer.email)).toBeVisible()
    await expect(page.getByText('Total bayar').locator('..')).toContainText(/Rp\s?200\.000/)
    await page.getByRole('button', { name: 'Bayar Sekarang' }).click()

    // Popup Snap: pilih BCA Virtual Account, lalu bayar di simulator
    await expect(page.locator('#snap-midtrans')).toBeVisible({ timeout: 30_000 })
    const { va, orderCode } = await chooseBcaVa(page)
    paidOrder.code = orderCode
    await payBcaVaInSimulator(context, va)

    if (simulateWebhook) artisan('midtrans:simulate', orderCode, 'settlement')

    // Snap mendeteksi pembayaran, menutup popup, lalu onSuccess mengarahkan ke halaman status
    await expect(snapFrame(page).getByText('Payment successful')).toBeVisible({ timeout: 90_000 })
    await expect(page).toHaveURL(`/orders/${orderCode}`, { timeout: 15_000 })

    // Status LUNAS berasal dari webhook (bukan dari callback onSuccess)
    await expect(
      page.getByRole('heading', { name: 'Pembayaran Berhasil' }),
      'Webhook belum masuk: cek ngrok & Notification URL, atau jalankan dengan E2E_WEBHOOK=simulate',
    ).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('Lunas')).toBeVisible()

    const codes = page.getByText(/^TKT-[A-Z0-9]{10} · Student$/)
    await expect(codes).toHaveCount(2)
    paidOrder.tickets = (await codes.allInnerTexts()).map((text) => text.split(' · ')[0])
  })

  test('Pesanan Saya dan Tiket Saya dengan QR code', async ({ page }, testInfo) => {
    await page.goto('/orders')
    const row = page.locator('a', { hasText: paidOrder.code })
    await expect(row).toContainText('Lunas')
    await expect(row).toContainText('2× Student')

    await page.getByRole('link', { name: 'Tiket Saya' }).click()
    await expect(page.locator('button[title="Perbesar QR"] svg')).toHaveCount(2)
    for (const code of paidOrder.tickets) await expect(page.getByText(code)).toBeVisible()

    // Perbesar QR tiket pertama
    await page.locator('button[title="Perbesar QR"]', { hasText: paidOrder.tickets[0] }).click()
    const modal = page.locator('.fixed.inset-0')
    await expect(modal.locator('svg').first()).toBeVisible()
    await expect(modal).toContainText(paidOrder.tickets[0])

    // Simpan tampilan QR sebagai "video kamera palsu" untuk tes scanner admin
    // (bingkai 960x720 berpusat di QR, dibatasi agar tetap di dalam viewport 1280x800)
    const box = await modal.locator('.rounded-2xl svg').boundingBox()
    const clamp = (value, max) => Math.min(Math.max(0, value), max)
    const clip = {
      x: clamp(box.x + box.width / 2 - 480, 1280 - 960),
      y: clamp(box.y + box.height / 2 - 360, 800 - 720),
      width: 960,
      height: 720,
    }
    qrVideoPath = testInfo.outputPath('qr-tiket.mjpeg')
    fs.writeFileSync(qrVideoPath, await page.screenshot({ type: 'jpeg', quality: 90, clip }))

    await modal.locator('button').first().click() // tombol X
    await expect(modal).toHaveCount(0)
  })

  test('order pending menahan kuota, bayar ulang, lalu kedaluwarsa', async ({ page }) => {
    await page.goto('/events/stand-up-comedy-night')
    const card = ticketCard(page, 'Reguler')
    const before = await remainingOf(card)
    await card.locator('button').last().click()
    await page.getByRole('button', { name: 'Beli Tiket' }).click()
    await page.getByRole('button', { name: 'Bayar Sekarang' }).click()

    // Customer menutup popup tanpa memilih metode -> onClose -> halaman status
    await expect(page.locator('#snap-midtrans')).toBeVisible({ timeout: 30_000 })
    await snapFrame(page).locator('.close-snap-button').click()
    await expect(page).toHaveURL(/\/orders\/INV-/)
    expiredOrderCode = page.url().split('/orders/')[1]

    await expect(page.getByRole('heading', { name: 'Menunggu Pembayaran' })).toBeVisible()
    await expect(page.getByText(/^\d{2}:\d{2}$/)).toBeVisible() // hitung mundur

    // Bayar ulang: popup terbuka lagi dengan Snap token yang sama
    await page.getByRole('button', { name: 'Bayar Sekarang' }).click()
    await expect(snapFrame(page).getByText(expiredOrderCode)).toBeVisible({ timeout: 30_000 })
    await snapFrame(page).locator('.close-snap-button').click()
    await expect(page.locator('#snap-midtrans')).toBeHidden()

    // Kuota ditahan selama order pending
    await page.goto('/events/stand-up-comedy-night')
    expect(await remainingOf(ticketCard(page, 'Reguler'))).toBe(before - 1)

    if (remote) {
      // Server hasil deploy: order dibiarkan pending, scheduler orders:expire
      // yang akan membatalkannya ±35 menit lagi.
      test.info().annotations.push({ type: 'pending', description: expiredOrderCode })
      return
    }

    // Popup ditutup tanpa memilih metode = Midtrans tidak akan mengirim webhook.
    // Di aplikasi asli tugas ini dilakukan scheduler orders:expire setelah 35 menit;
    // di sini dipercepat dengan notifikasi "expire" yang bertanda tangan sah.
    await page.goto(`/orders/${expiredOrderCode}`)
    artisan('midtrans:simulate', expiredOrderCode, 'expire')
    await expect(page.getByRole('heading', { name: 'Order Kedaluwarsa' })).toBeVisible()

    // Kuota dikembalikan
    await page.goto('/events/stand-up-comedy-night')
    expect(await remainingOf(ticketCard(page, 'Reguler'))).toBe(before)
  })

  test('customer tidak bisa membuka halaman admin', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0)
    await page.goto('/admin')
    await expect(page).toHaveURL('/')

    await logout(page)
    await page.goto('/orders')
    await expect(page).toHaveURL(/\/login$/)
  })
})

test.describe('Admin', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin@tiket.test', adminPassword)
    await expect(page).toHaveURL('/admin')
  })

  test('dashboard menampilkan ringkasan penjualan', async ({ page }) => {
    await expect(page.getByText('Total pendapatan (order lunas)')).toBeVisible()
    for (const label of ['Order lunas', 'Menunggu bayar', 'Tiket terbit', 'Sudah check-in']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
    await expect(page.getByRole('heading', { name: 'Penjualan per event' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Order terbaru' })).toBeVisible()
  })

  test('kelola event dan jenis tiket (tambah, ubah, hapus)', async ({ page }) => {
    // Banner: pakai screenshot hero beranda sebagai gambar JPG
    await page.goto('/')
    const banner = await page.locator('section').first().screenshot({ type: 'jpeg', quality: 80 })

    await page.goto('/admin/events')
    await page.getByRole('link', { name: 'Tambah Event' }).click()

    // Validasi Form Request
    await page.getByRole('button', { name: 'Simpan & Atur Tiket' }).click()
    await expect(page.getByText('Judul wajib diisi.')).toBeVisible()
    await expect(page.getByText('Lokasi wajib diisi.')).toBeVisible()

    await page.locator('#title').fill(eventTitle)
    await page.locator('#venue').fill('Taman Budaya, Yogyakarta')
    await page.locator('#start_at').fill('2026-12-20T19:00')
    await page.locator('#description').fill('Konser akustik santai hasil smoke test.')
    await page.locator('input[type=file]').setInputFiles({
      name: 'banner.jpg',
      mimeType: 'image/jpeg',
      buffer: banner,
    })
    await expect(page.getByAltText('Pratinjau banner')).toBeVisible()
    await page.locator('#status').selectOption('published')
    await page.getByRole('button', { name: 'Simpan & Atur Tiket' }).click()

    // Setelah simpan, langsung diarahkan ke halaman jenis tiket event tersebut
    await expect(page).toHaveURL(/\/admin\/ticket-types\?event_id=\d+$/)
    await expect(page.locator('#event option:checked')).toHaveText(eventTitle)

    await page.getByRole('button', { name: 'Tambah' }).click()
    await expect(page.getByText('Nama wajib diisi.')).toBeVisible()

    await page.locator('#name').fill('Reguler')
    await page.locator('#price').fill('50000')
    await page.locator('#quota').fill('10')
    await page.getByRole('button', { name: 'Tambah' }).click()
    await expect(page.getByText('Jenis tiket berhasil ditambahkan.')).toBeVisible()
    const row = page.locator('tbody tr', { hasText: 'Reguler' })
    await expect(row).toContainText(/Rp\s?50\.000/)

    await row.getByTitle('Ubah').click()
    await page.locator('#quota').fill('20')
    await page.getByRole('button', { name: 'Simpan' }).click()
    await expect(page.getByText('Jenis tiket berhasil diubah.')).toBeVisible()
    await expect(row.locator('td').nth(2)).toHaveText('20')

    // Event tayang muncul di halaman publik, lengkap dengan banner
    await page.goto(`/?search=${encodeURIComponent(eventTitle)}`)
    const publicCard = page.locator('a[href^="/events/"]', { hasText: eventTitle })
    await expect(publicCard).toBeVisible()
    await expect(publicCard.locator('img')).toHaveAttribute('src', /\/storage\/banners\//)

    // Ubah status menjadi Draft -> hilang dari publik
    await page.goto('/admin/events')
    await page.locator('tr', { hasText: eventTitle }).getByTitle('Ubah').click()
    await expect(page.locator('#title')).toHaveValue(eventTitle)
    await page.locator('#status').selectOption('draft')
    await page.getByRole('button', { name: 'Simpan Perubahan' }).click()
    await expect(page).toHaveURL('/admin/events')
    await expect(page.locator('tr', { hasText: eventTitle })).toContainText('Draft')

    await page.goto(`/?search=${encodeURIComponent(eventTitle)}`)
    await expect(page.getByText('Event tidak ditemukan')).toBeVisible()

    // Hapus jenis tiket, lalu hapus event
    page.on('dialog', (dialog) => dialog.accept()) // konfirmasi "Hapus ...?"
    await page.goto('/admin/events')
    await page.locator('tr', { hasText: eventTitle }).getByTitle('Jenis tiket').click()
    await page.locator('tbody tr', { hasText: 'Reguler' }).getByTitle('Hapus').click()
    await expect(page.getByText('Jenis tiket berhasil dihapus.')).toBeVisible()
    await expect(page.getByText('Belum ada jenis tiket')).toBeVisible()

    await page.goto('/admin/events')
    await page.locator('tr', { hasText: eventTitle }).getByTitle('Hapus').click()
    await expect(page.getByText('Event berhasil dihapus.')).toBeVisible()
    await expect(page.locator('tr', { hasText: eventTitle })).toHaveCount(0)

    // Event yang sudah punya transaksi tidak boleh dihapus
    await page.locator('tr', { hasText: 'Tech Conference Indonesia' }).getByTitle('Hapus').click()
    await expect(page.getByText(/Event sudah memiliki transaksi/)).toBeVisible()
    await expect(page.locator('tr', { hasText: 'Tech Conference Indonesia' })).toHaveCount(1)
  })

  test('transaksi: filter status dan pencarian', async ({ page }) => {
    await page.getByRole('link', { name: 'Transaksi' }).click()
    await page.getByPlaceholder('Kode order / nama / email').fill(customer.email)
    await page.getByRole('button', { name: 'Cari' }).click()
    await expect(page.locator('tbody tr')).toHaveCount(2)
    await expect(page.getByText(paidOrder.code)).toBeVisible()
    await expect(page.getByText(expiredOrderCode)).toBeVisible()

    await page.getByRole('button', { name: 'Lunas', exact: true }).click()
    await expect(page.locator('tbody tr')).toHaveCount(1)
    await expect(page.locator('tbody tr')).toContainText(paidOrder.code)

    // Di server hasil deploy, order kedua masih pending (lihat tes sebelumnya)
    await page
      .getByRole('button', { name: remote ? 'Menunggu' : 'Kedaluwarsa', exact: true })
      .click()
    await expect(page.locator('tbody tr')).toHaveCount(1)
    await expect(page.locator('tbody tr')).toContainText(expiredOrderCode)
  })

  test('scan QR tiket dengan kamera', async () => {
    // Browser khusus dengan kamera palsu yang "merekam" gambar QR tiket pertama
    const browser = await chromium.launch({
      channel: 'chrome',
      headless: process.env.E2E_HEADLESS === '1',
      slowMo: Number(process.env.E2E_SLOWMO ?? 250),
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        `--use-file-for-fake-video-capture=${qrVideoPath}`,
      ],
    })
    const context = await browser.newContext({
      baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
      viewport: { width: 1280, height: 800 },
      permissions: ['camera'],
    })
    const page = await context.newPage()

    try {
      await login(page, 'admin@tiket.test', adminPassword)
      await page.getByRole('link', { name: 'Scan Check-in' }).click()
      await page.getByRole('button', { name: 'Nyalakan Kamera' }).click()
      await expect(page.getByRole('button', { name: 'Matikan Kamera' })).toBeVisible()

      await expect(page.getByText('Check-in berhasil.')).toBeVisible({ timeout: 20_000 })
      await expect(page.locator('dd', { hasText: paidOrder.tickets[0] })).toBeVisible()
      await expect(page.getByText(customer.name)).toBeVisible()

      await page.getByRole('button', { name: 'Matikan Kamera' }).click()
      await expect(page.getByText('Kamera belum aktif')).toBeVisible()
    } finally {
      await browser.close()
    }
  })

  test('check-in manual: berhasil, sudah dipakai, dan tidak ditemukan', async ({ page }) => {
    await page.getByRole('link', { name: 'Scan Check-in' }).click()
    const input = page.locator('#code')
    const check = page.getByRole('button', { name: 'Cek' })
    const cooldown = () => page.waitForTimeout(2600) // scanner menolak scan < 2,5 detik

    await input.fill(paidOrder.tickets[1].toLowerCase()) // huruf kecil otomatis dibesarkan
    await check.click()
    await expect(page.getByText('Check-in berhasil.')).toBeVisible()

    await cooldown()
    await input.fill(paidOrder.tickets[1])
    await check.click()
    await expect(page.getByText(/^Tiket sudah dipakai check-in pada/)).toBeVisible()

    await cooldown()
    await input.fill(paidOrder.tickets[0]) // sudah di-scan kamera pada tes sebelumnya
    await check.click()
    await expect(page.locator('dd', { hasText: paidOrder.tickets[0] })).toBeVisible()
    await expect(page.getByText(/^Tiket sudah dipakai check-in pada/)).toBeVisible()

    await cooldown()
    await input.fill('TKT-TIDAKADA00')
    await check.click()
    await expect(page.getByText('Tiket tidak ditemukan.')).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Riwayat scan' })).toBeVisible()
    await expect(page.locator('li', { hasText: 'TKT-TIDAKADA00' })).toBeVisible()
  })
})

test.describe('Setelah check-in', () => {
  test('Tiket Saya menampilkan status check-in', async ({ page }) => {
    await login(page, customer.email, customer.password)
    await expect(page).toHaveURL('/')
    await page.goto('/my-tickets')
    await expect(page.getByText(/Check-in \d{1,2} \w{3} \d{4}/)).toHaveCount(2)
  })

  test('tampilan mobile: menu navigasi', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Masuk' })).toBeHidden()

    await page.locator('header nav button').click() // tombol menu (hamburger)
    await expect(page.getByRole('link', { name: 'Jelajahi Event' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Daftar' })).toBeVisible()

    await page.getByRole('link', { name: 'Masuk' }).click()
    await expect(page).toHaveURL('/login')
  })
})
