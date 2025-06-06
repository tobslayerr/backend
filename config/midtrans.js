import midtransClient from 'midtrans-client';
<<<<<<< HEAD
import dotenv from 'dotenv';
dotenv.config();

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION == 'true', 
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION == 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});
=======
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
>>>>>>> a86b8eb9da78aed4e980998d93a6e82ea1589e1a
