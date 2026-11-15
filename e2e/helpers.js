import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect } from '@playwright/test'

const BACKEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../backend')

// Jalankan perintah artisan di folder backend, mis. artisan('midtrans:simulate', code, 'expire')
export function artisan(...args) {
  return execFileSync('php', ['artisan', ...args], { cwd: BACKEND_DIR, encoding: 'utf8' })
}

export async function login(page, email, password = 'password') {
  await page.goto('/login')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
}

export async function logout(page) {
  await page.locator('button[title="Keluar"]:visible').click()
  await expect(page).toHaveURL(/\/login$/)
}

// Kartu jenis tiket di halaman Detail Event, mis. ticketCard(page, 'Reguler')
export function ticketCard(page, name) {
  return page
    .locator('aside .rounded-xl.border')
    .filter({ has: page.getByText(name, { exact: true }) })
}

// Baca angka "Sisa N" pada kartu jenis tiket
export async function remainingOf(card) {
  const text = await card.getByText(/^Sisa \d+$/).innerText()
  return Number(text.replace('Sisa ', ''))
}

// Popup Snap Midtrans dirender di dalam iframe #snap-midtrans
export const snapFrame = (page) => page.frameLocator('#snap-midtrans')

// Pilih BCA Virtual Account di popup Snap, lalu ambil nomor VA dan kode order
export async function chooseBcaVa(page) {
  const snap = snapFrame(page)
  await snap.getByText('Virtual account', { exact: true }).click()
  await snap.locator('a[href="#/bank-transfer/bca-va"]').click()

  const vaNumber = snap.getByText(/^\d{15,}$/).first()
  await expect(vaNumber).toBeVisible({ timeout: 30_000 })
  const orderText = await snap
    .getByText(/INV-\d{8}-[A-Z0-9]{6}/)
    .first()
    .innerText()

  return {
    va: (await vaNumber.innerText()).trim(),
    orderCode: orderText.match(/INV-\d{8}-[A-Z0-9]{6}/)[0],
  }
}

// Bayar nomor VA di Midtrans Payment Simulator (dibuka di tab baru)
export async function payBcaVaInSimulator(context, va) {
  const sim = await context.newPage()
  await sim.goto('https://simulator.sandbox.midtrans.com/bca/va/index')
  await sim.locator('input[name=va_number]').fill(va)
  await sim.locator('input[value=Inquire]').click()
  await sim.locator('input[value=Pay]').click()
  await expect(sim.getByText('Simulated payment is successful.')).toBeVisible()
  await sim.close()
}
