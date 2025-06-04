// routes/ratings.js
import express from 'express';
// Import fungsi-fungsi controller yang baru saja kita buat
import {
  createRating,
  getEventRatings,
  getSingleRating, // Tambahkan jika Anda membuat rute untuk ini
  deleteRating
} from '../controllers/ratingController.js';

// Asumsi Anda memiliki middleware autentikasi yang sudah berfungsi dengan baik
// Pastikan path ke file autentikasi Anda benar
import userAuth from '../middleware/userAuth.js'; // Ini adalah contoh, sesuaikan dengan path Anda

const router = express.Router();

// --- Rute untuk Rating ---

// POST /api/events/:eventId/ratings
// Membuat rating baru untuk event tertentu
router.post('/:eventId/ratings', userAuth, createRating);

// GET /api/events/:eventId/ratings
// Mengambil semua rating untuk event tertentu
router.get('/:eventId/ratings', getEventRatings);

// GET /api/events/:eventId/ratings/:ratingId
// Mengambil rating tunggal berdasarkan ID (opsional, saya tambahkan ini di controller)
router.get('/:eventId/ratings/:ratingId', getSingleRating);


// DELETE /api/events/:eventId/ratings/:ratingId
// Menghapus rating dari event tertentu (hanya pemilik rating)
router.delete('/:eventId/ratings/:ratingId', userAuth, deleteRating);

export default router;