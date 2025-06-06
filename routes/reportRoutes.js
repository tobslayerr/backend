import express from 'express';
import { reportCreator, reportUser, getAllReports, getReportById, updateReport, deleteReport } from '../controllers/reportController.js';
import userAuth from '../middleware/userAuth.js';
import siCreatorOnly from '../middleware/siCreatorOnly.js';

const ReportRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Manajemen laporan di sistem Sievent
 */

/**
 * @swagger
 * /report/Creator/{Id}:
 *   post:
 *     summary: Membuat laporan untuk creator oleh user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID creator yang dilaporkan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Alasan laporan
 *               details:
 *                 type: string
 *                 description: Detail tambahan laporan
 *     responses:
 *       201:
 *         description: Laporan berhasil dibuat
 *       400:
 *         description: Data input tidak valid
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /report/User/{Id}:
 *   post:
 *     summary: Membuat laporan untuk user oleh creator (hanya creator yang bisa)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user yang dilaporkan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Laporan berhasil dibuat
 *       400:
 *         description: Input invalid
 *       401:
 *         description: Unauthorized (bukan creator)
 */

/**
 * @swagger
 * /report/ReadAll:
 *   get:
 *     summary: Mendapatkan semua laporan
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Daftar laporan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   reportId:
 *                     type: string
 *                   reportedId:
 *                     type: string
 *                   reason:
 *                     type: string
 *                   details:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */

/**
 * @swagger
 * /report/Read/{id}:
 *   get:
 *     summary: Mendapatkan laporan berdasarkan ID laporan
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID laporan
 *     responses:
 *       200:
 *         description: Data laporan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportId:
 *                   type: string
 *                 reportedId:
 *                   type: string
 *                 reason:
 *                   type: string
 *                 details:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Laporan tidak ditemukan
 */

/**
 * @swagger
 * /report/Update/{id}:
 *   put:
 *     summary: Update laporan berdasarkan ID laporan
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID laporan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               details:
 *                 type: string
 *     responses:
 *       200:
 *         description: Laporan berhasil diupdate
 *       400:
 *         description: Input invalid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Laporan tidak ditemukan
 */

/**
 * @swagger
 * /report/Delete/{id}:
 *   delete:
 *     summary: Menghapus laporan berdasarkan ID laporan
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID laporan
 *     responses:
 *       200:
 *         description: Laporan berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Laporan tidak ditemukan
 */

export default ReportRouter;
