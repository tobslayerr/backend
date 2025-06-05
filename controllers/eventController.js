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
        // FormData mengirim boolean sebagai string "true" atau "false"
        ticket.isFree = (ticket.isFree === 'true' || ticket.isFree === true);

        // Jika tidak gratis, harga harus valid dan lebih dari 0
        if (!ticket.isFree) {
          ticket.price = Number(ticket.price);
          if (isNaN(ticket.price) || ticket.price < 0) { // Harga bisa 0 jika eventCreator mau setting 0
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
    // --- TANGKAP LATITUDE DAN LONGITUDE DARI REQ.BODY ---
    const { name, type, date, location, description, latitude, longitude, tickets: ticketsString } = req.body;
    const creatorId = req.user.id; // Pastikan req.user.id tersedia (dari middleware auth Anda)

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    // --- VALIDASI LATITUDE DAN LONGITUDE ---
    if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required and must be valid numbers." });
    }
    // --- END VALIDASI LATITUDE DAN LONGITUDE ---

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
      latitude: parseFloat(latitude),   // --- SIMPAN LATITUDE ---
      longitude: parseFloat(longitude),  // --- SIMPAN LONGITUDE ---
    });

    await event.save();

    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error("Error creating event:", error); // Log error lebih detail
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
    console.error("Error fetching all events:", error);
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
    console.error("Error fetching event by ID:", error);
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
    console.error("Error fetching my events:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your events", error: error.message });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    // --- TANGKAP LATITUDE DAN LONGITUDE DARI REQ.BODY ---
    const { name, type, date, location, description, latitude, longitude, tickets: ticketsString } = req.body;
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
    
    // --- UPDATE LATITUDE DAN LONGITUDE ---
    // Pastikan latitude dan longitude dari request tidak null/undefined sebelum update
    if (latitude !== undefined && latitude !== null) {
      event.latitude = parseFloat(latitude);
    }
    if (longitude !== undefined && longitude !== null) {
      event.longitude = parseFloat(longitude);
    }
    // --- END UPDATE LATITUDE DAN LONGITUDE ---

    // --- KUNCI SOLUSI UNTUK TIKET DI UPDATE: PARSE STRING JSON DAN GANTI ARRAY TIKET ---
    if (ticketsString) {
        try {
            event.tickets = parseAndValidateTickets(ticketsString); // Menggunakan helper function
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    } 
    // Jika ticketsString tidak ada (misal, user tidak mengubah tiket),
    // kita tidak perlu melakukan apa-apa karena event.tickets akan tetap pada nilai sebelumnya.
    // Jika ingin mengosongkan tiket saat ticketsString tidak ada, tambahkan `else { event.tickets = []; }`
    // Namun, asumsi kita adalah frontend selalu mengirim array tickets (walaupun kosong jika dihapus semua).
    // --- END KUNCI SOLUSI ---

    // Handle isFree and price removed, as they are now per ticket type

    // Update banner if new file is uploaded
    if (req.file) {
      // TODO: Anda mungkin ingin menghapus banner lama dari Cloudinary di sini
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
    console.error("Error updating event:", error);
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

    // --- Opsional: Hapus banner dari Cloudinary saat menghapus event ---
    if (event.bannerUrl) {
      const publicId = event.bannerUrl.split('/').pop().split('.')[0];
      try {
        await cloudinary.v2.uploader.destroy(`sievent/events/${publicId}`);
        console.log(`Banner ${publicId} deleted from Cloudinary.`);
      } catch (cloudinaryError) {
        console.error("Error deleting banner from Cloudinary:", cloudinaryError);
        // Lanjutkan penghapusan event meskipun penghapusan banner gagal
      }
    }
    // --- End Opsional ---

    await Event.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ success: false, message: "Failed to delete event", error: error.message });
  }
};