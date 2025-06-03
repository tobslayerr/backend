import express from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById, // <-- Pastikan ini diimpor!
  getMyEvents,
  updateEvent,
} from "../controllers/eventController.js";
import userAuth from "../middleware/userAuth.js";
import siCreatorOnly from "../middleware/siCreatorOnly.js";
import upload from "../middleware/upload.js";

const eventRoutes = express.Router();

// Route untuk membuat event baru
eventRoutes.post("/create", userAuth, siCreatorOnly, upload.single("banner"), createEvent);

// Route untuk mendapatkan semua event (biasanya untuk tampilan publik)
eventRoutes.get("/showevents", getAllEvents);

// --- INI ADALAH ROUTE YANG HILANG DAN PERLU DITAMBAHKAN ---
// Route untuk mendapatkan event yang dibuat oleh creator yang sedang login
eventRoutes.get("/myevents", userAuth, siCreatorOnly, getMyEvents);
// Route untuk mendapatkan detail satu event berdasarkan ID
eventRoutes.get("/:id", getEventById);
// -----------------------------------------------------------

// Route untuk memperbarui event berdasarkan ID
eventRoutes.patch("/updateevent/:id", userAuth, upload.single("banner"), updateEvent);

// Route untuk menghapus event berdasarkan ID
eventRoutes.delete("/deleteevent/:id", userAuth, deleteEvent); // Opsional: tambahkan siCreatorOnly jika hanya creator yang bisa menghapus
// Note: Di controller deleteEvent, Anda sudah menambahkan otorisasi creator, jadi ini sudah aman.



export default eventRoutes;
