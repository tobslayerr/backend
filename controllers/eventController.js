import Event from "../models/eventModel.js"; // Pastikan path ini benar
import cloudinary from "cloudinary";

// --- Helper untuk mengurai dan memvalidasi tiket ---
const parseAndValidateTickets = (ticketsString) => {
  let parsedTickets = [];
  if (ticketsString) {
    try {
      parsedTickets = JSON.parse(ticketsString);

      // Validasi setiap objek tiket
      for (const ticket of parsedTickets) {
        if (!ticket.name || !ticket.quantity || typeof ticket.isFree === 'undefined') {
          throw new Error('Nama tiket, kuantitas, dan status gratis/berbayar harus diisi.');
        }
        // Konversi quantity ke Number
        ticket.quantity = Number(ticket.quantity);
        if (isNaN(ticket.quantity) || ticket.quantity < 0) {
          throw new Error(`Kuantitas tiket "${ticket.name}" tidak valid.`);
        }

        // Konversi isFree dari string FormData ke boolean
        ticket.isFree = (ticket.isFree === 'true' || ticket.isFree === true);

        // Jika tidak gratis, harga harus valid dan lebih dari 0
        if (!ticket.isFree) {
          ticket.price = Number(ticket.price);
          if (isNaN(ticket.price) || ticket.price <= 0) {
            throw new Error(`Harga tiket "${ticket.name}" tidak valid.`);
          }
        } else {
          ticket.price = 0; // Pastikan harga 0 jika gratis
        }
      }
    } catch (error) {
      console.error("Kesalahan parsing atau validasi tiket:", error.message);
      throw new Error(`Data tiket tidak valid: ${error.message}`);
    }
  }
  return parsedTickets;
};
// --- End Helper ---


// Create Event
export const createEvent = async (req, res) => {
  try {
    const { name, type, date, location, description, tickets: ticketsString } = req.body;
    const creatorId = req.user.id; // Pastikan req.user.id tersedia (dari middleware auth Anda)

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    // Upload banner ke Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: "sievent/events" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Parse dan validasi data tiket
    const tickets = parseAndValidateTickets(ticketsString);

    const event = new Event({
      name,
      type,
      date,
      location,
      description,
      bannerUrl: result.secure_url,
      creator: creatorId,
      tickets, // Simpan array tiket yang sudah di-parse
      // isFree dan price level event tidak lagi dibutuhkan karena di handle oleh tickets
    });

    await event.save();

    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Event creation failed", error: error.message });
  }
};

// Get All Events
export const getAllEvents = async (req, res) => {
  try {
    // Populate creator, dan sekarang tiket juga akan otomatis ada di event
    const events = await Event.find()
      .populate("creator", "_id name")
      .sort({ date: 1 });

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch events", error: error.message });
  }
};

// Get Event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    // Populate creator, dan tiket akan otomatis disertakan
    const event = await Event.findById(id).populate("creator", "name");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch event", error: error.message });
  }
};

// Get Events Created By Authenticated Creator
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id; // Pastikan req.user.id tersedia
    // Tiket akan otomatis disertakan
    const events = await Event.find({ creator: userId }).sort({ date: 1 });

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch your events", error: error.message });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, date, location, description, tickets: ticketsString } = req.body;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Pastikan user yang login adalah creator event
    if (event.creator.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized to update this event" });
    }

    // Update fields
    event.name = name || event.name;
    event.type = type || event.type;
    event.date = date || event.date;
    event.location = location || event.location;
    event.description = description || event.description;

    // --- KUNCI SOLUSI UNTUK TIKET DI UPDATE: PARSE STRING JSON DAN GANTI ARRAY TIKET ---
    if (ticketsString) {
        try {
            event.tickets = parseAndValidateTickets(ticketsString); // Menggunakan helper function
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    } else {
      // Jika ticketsString tidak ada (misal, user tidak mengubah tiket),
      // Anda bisa memilih untuk tidak melakukan apa-apa atau mengosongkan jika ada permintaan khusus.
      // Untuk tujuan edit, kita asumsikan jika tidak dikirim, berarti tidak ada perubahan pada tiket,
      // atau jika dikirim kosong, maka tiket dihapus.
      // Paling aman: jangan sentuh event.tickets jika ticketsString kosong atau tidak ada.
      // Namun, jika frontend selalu mengirim `tickets` array (walaupun kosong), maka baris di atas sudah cukup.
    }
    // --- END KUNCI SOLUSI ---

    // Handle isFree and price removed, as they are now per ticket type

    // Update banner if new file is uploaded
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { folder: "sievent/events" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        ).end(req.file.buffer);
      });
      event.bannerUrl = result.secure_url;
    }

    await event.save();

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update event", error: error.message });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Opsional: Pastikan hanya creator event yang dapat menghapus event ini
    if (event.creator.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete event", error: error.message });
  }
};
