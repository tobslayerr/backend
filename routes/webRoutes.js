import express from "express";
import { getBanners, uploadBanner } from "../controllers/webController.js";

const webRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Web
 *   description: API untuk operasi web seperti banner
 */

/**
 * @swagger
 * /api/web/banner/upload:
 *   post:
 *     summary: Upload banner baru
 *     tags: [Web]
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
 *                 description: File banner yang akan diupload
 *     responses:
 *       200:
 *         description: Banner berhasil diupload
 *       400:
 *         description: Upload gagal atau file tidak valid
 */
webRouter.post("/banner/upload", uploadBanner);

/**
 * @swagger
 * /api/web/banner:
 *   get:
 *     summary: Mendapatkan daftar banner yang tersedia
 *     tags: [Web]
 *     responses:
 *       200:
 *         description: Daftar banner berhasil didapatkan
 */
webRouter.get("/banner", getBanners);

export default webRouter;
