import express from "express";
import { createTicket, getAllTickets, getTicketById, cancelTicket, createFreeTicket, deleteTicket } from "../controllers/ticketController.js";
import userAuth from "../middleware/userAuth.js";

const TicketRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ticket
 *   description: API untuk manajemen tiket event
 */

/**
 * @swagger
 * /api/ticket/Create:
 *   post:
 *     summary: Membuat tiket berbayar baru
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Data tiket baru
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *               userId:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tiket berhasil dibuat
 *       400:
 *         description: Input tidak valid
 */
TicketRouter.post("/Create", userAuth, createTicket);

/**
 * @swagger
 * /api/ticket/Createfree:
 *   post:
 *     summary: Membuat tiket gratis baru
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Data tiket gratis
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tiket gratis berhasil dibuat
 *       400:
 *         description: Input tidak valid
 */
TicketRouter.post("/Createfree", userAuth, createFreeTicket);

/**
 * @swagger
 * /api/ticket/ReadAll:
 *   get:
 *     summary: Mendapatkan daftar semua tiket
 *     tags: [Ticket]
 *     responses:
 *       200:
 *         description: Daftar tiket berhasil diambil
 */
TicketRouter.get("/ReadAll", getAllTickets);

/**
 * @swagger
 * /api/ticket/Read/{id}:
 *   get:
 *     summary: Mendapatkan detail tiket berdasarkan ID
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID tiket
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail tiket berhasil diambil
 *       404:
 *         description: Tiket tidak ditemukan
 */
TicketRouter.get("/Read/:id", userAuth, getTicketById);

/**
 * @swagger
 * /api/ticket/Update/{id}:
 *   put:
 *     summary: Membatalkan tiket berdasarkan ID
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID tiket yang ingin dibatalkan
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tiket berhasil dibatalkan
 *       404:
 *         description: Tiket tidak ditemukan
 */
TicketRouter.put("/Update/:id", userAuth, cancelTicket);

/**
 * @swagger
 * /api/ticket/Delete/{id}:
 *   delete:
 *     summary: Menghapus tiket berdasarkan ID
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID tiket yang ingin dihapus
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tiket berhasil dihapus
 *       404:
 *         description: Tiket tidak ditemukan
 */
TicketRouter.delete("/Delete/:id", userAuth, deleteTicket);

export default TicketRouter;
