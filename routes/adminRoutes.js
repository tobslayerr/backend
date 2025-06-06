import express from "express";
import {
  getSiCreatorRequests,
  acceptSiCreatorRequest,
} from "../controllers/adminController.js";

const router = express.Router();

/**
 * @swagger
 * /sicreator/requests:
 *   get:
 *     summary: Mendapatkan daftar permintaan menjadi SiCreator
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar permintaan
 */
router.get("/sicreator/requests", getSiCreatorRequests);

/**
 * @swagger
 * /sicreator/accept/{userId}:
 *   post:
 *     summary: Menerima permintaan menjadi SiCreator
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna yang akan diterima sebagai SiCreator
 *     responses:
 *       200:
 *         description: Permintaan berhasil diterima
 */
router.post("/sicreator/accept/:userId", acceptSiCreatorRequest);

export default router;
