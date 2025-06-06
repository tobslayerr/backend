import express from 'express';
import {
  createRating,
  getRatingsForEvent,
  getUserRatingForEvent,
  getRatingById,
  updateRating,
  deleteRating,
  getAverageRatingForEvent,
} from '../controllers/ratingController.js';
import userAuth from '../middleware/userAuth.js';

const RatingRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Manajemen rating untuk event
 */

/**
 * @swagger
 * /rating/create/{eventId}:
 *   post:
 *     summary: Membuat rating baru untuk event
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event yang akan diberi rating
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *               - comment
 *             properties:
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Nilai rating (1-5)
 *               comment:
 *                 type: string
 *                 description: Komentar rating
 *     responses:
 *       201:
 *         description: Rating berhasil dibuat
 *       400:
 *         description: Data input tidak valid
 *       401:
 *         description: Unauthorized, token tidak valid
 */

/**
 * @swagger
 * /rating/readall/{eventId}:
 *   get:
 *     summary: Mendapatkan semua rating untuk event tertentu
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *     responses:
 *       200:
 *         description: Daftar rating event
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   score:
 *                     type: integer
 *                   comment:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */

/**
 * @swagger
 * /rating/readone/user/{userId}/event/{eventId}:
 *   get:
 *     summary: Mendapatkan rating user tertentu untuk event tertentu
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *     responses:
 *       200:
 *         description: Data rating user untuk event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: integer
 *                 comment:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /rating/update/{id}:
 *   patch:
 *     summary: Update rating berdasarkan ID rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID rating
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating berhasil diupdate
 *       400:
 *         description: Input tidak valid
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /rating/delete/{id}:
 *   delete:
 *     summary: Menghapus rating berdasarkan ID rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID rating
 *     responses:
 *       200:
 *         description: Rating berhasil dihapus
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /rating/readaverage/{eventId}:
 *   get:
 *     summary: Mendapatkan rata-rata rating untuk event tertentu
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *     responses:
 *       200:
 *         description: Rata-rata rating event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 average:
 *                   type: number
 *                   format: float
 *                   description: Nilai rata-rata rating
 */

export default RatingRouter;
