import express from "express";
import {
  checkAuth,
  isAuthenticated,
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyEmail,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registrasi pengguna baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 */
authRouter.post("/register", register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login pengguna
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 */
authRouter.post("/login", login);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout pengguna
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
authRouter.post("/logout", logout);

/**
 * @swagger
 * /send-verify-otp:
 *   post:
 *     summary: Mengirim OTP verifikasi email
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP berhasil dikirim
 */
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);

/**
 * @swagger
 * /verify-account:
 *   post:
 *     summary: Verifikasi akun dengan OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verifikasi berhasil
 */
authRouter.post("/verify-account", userAuth, verifyEmail);

/**
 * @swagger
 * /is-auth:
 *   get:
 *     summary: Cek apakah user sudah login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pengguna terautentikasi
 */
authRouter.get("/is-auth", userAuth, isAuthenticated, checkAuth);

/**
 * @swagger
 * /send-reset-otp:
 *   post:
 *     summary: Kirim OTP untuk reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP reset berhasil dikirim
 */
authRouter.post("/send-reset-otp", sendResetOtp);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset password dengan OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - newPassword
 *             properties:
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password berhasil di-reset
 */
authRouter.post("/reset-password", resetPassword);

export default authRouter;
