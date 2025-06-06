import express from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getMyEvents,
  getEventById,
  updateEvent,
} from "../controllers/eventController.js";
import userAuth from "../middleware/userAuth.js";
import siCreatorOnly from "../middleware/siCreatorOnly.js";
import upload from "../middleware/upload.js";

const eventRoutes = express.Router();

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Membuat event baru
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *                 example: Tech Conference 2025
 *               date:
 *                 type: string
 *                 example: 2025-09-10
 *               location:
 *                 type: string
 *                 example: Jakarta Convention Center
 *               description:
 *                 type: string
 *                 example: Konferensi teknologi tahunan
 *     responses:
 *       201:
 *         description: Event berhasil dibuat
 */
eventRoutes.post(
  "/create",
  userAuth,
  siCreatorOnly,
  upload.single("banner"),
  createEvent
);

/**
 * @swagger
 * /showevents:
 *   get:
 *     summary: Mendapatkan semua event
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar event
 */
eventRoutes.get("/showevents", getAllEvents);

/**
 * @swagger
 * /updateevent/{id}:
 *   patch:
 *     summary: Memperbarui event berdasarkan ID
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event berhasil diperbarui
 */
eventRoutes.patch(
  "/updateevent/:id",
  userAuth,
  upload.single("banner"),
  updateEvent
);

/**
 * @swagger
 * /deleteevent/{id}:
 *   delete:
 *     summary: Menghapus event berdasarkan ID
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *     responses:
 *       200:
 *         description: Event berhasil dihapus
 */
eventRoutes.delete("/deleteevent/:id", userAuth, deleteEvent);

/**
 * @swagger
 * /myevents:
 *   get:
 *     summary: Mendapatkan semua event yang dibuat oleh user saat ini
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar event milik pengguna
 */
eventRoutes.get("/myevents", userAuth, siCreatorOnly, getMyEvents);

/**
 * @swagger
 * /event/{id}:
 *   get:
 *     summary: Mendapatkan detail event berdasarkan ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID event
 *     responses:
 *       200:
 *         description: Detail event ditemukan
 */
eventRoutes.get("/event/:id", getEventById);

export default eventRoutes;
