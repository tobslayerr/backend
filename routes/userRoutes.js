import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { approveSiCreator, getUserData, rejectSiCreator, requestSiCreator } from '../controllers/userController.js';

const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API untuk operasi terkait user
 */

/**
 * @swagger
 * /api/user/data:
 *   get:
 *     summary: Mendapatkan data user yang sedang login
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 *       401:
 *         description: Unauthorized
 */
userRouter.get('/data', userAuth, getUserData);

/**
 * @swagger
 * /api/user/requestsicreator:
 *   post:
 *     summary: Mengajukan permintaan menjadi SiCreator
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permintaan SiCreator berhasil diajukan
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/requestsicreator', userAuth, requestSiCreator);

/**
 * @swagger
 * /api/user/approvesicreator/{userId}:
 *   put:
 *     summary: Menyetujui permintaan SiCreator user berdasarkan userId
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user yang permintaan SiCreator-nya disetujui
 *     responses:
 *       200:
 *         description: Permintaan SiCreator berhasil disetujui
 *       404:
 *         description: User tidak ditemukan
 */
userRouter.put('/approvesicreator/:userId', approveSiCreator);

/**
 * @swagger
 * /api/user/rejectsicreator/{userId}:
 *   put:
 *     summary: Menolak permintaan SiCreator user berdasarkan userId
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user yang permintaan SiCreator-nya ditolak
 *     responses:
 *       200:
 *         description: Permintaan SiCreator berhasil ditolak
 *       404:
 *         description: User tidak ditemukan
 */
userRouter.put('/rejectsicreator/:userId', rejectSiCreator);

export default userRouter;
