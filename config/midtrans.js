import midtransClient from 'midtrans-client';
import dotenv from 'dotenv'; // Import dotenv
dotenv.config(); // Load environment variables

// Inisialisasi Midtrans Snap API client
// Hanya perlu serverKey di sini untuk operasi backend (createTransaction)
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production', // Set based on environment variable
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  // clientKey is NOT needed here. It's for the frontend.
});

// Inisialisasi Midtrans Core API client
// Digunakan terutama untuk verifikasi notifikasi/webhook dari Midtrans
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.NODE_ENV === 'production', // Set based on environment variable
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  // clientKey is NOT needed here. It's for the frontend.
});

export { snap, coreApi }; // Export keduanya