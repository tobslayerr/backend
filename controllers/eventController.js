import Event from "../models/eventModel.js";
import cloudinary from "cloudinary";

// Create Event
export const createEvent = async (req, res) => {
  try {
    const { name, type, date, location, description, price, latitude, longitude, ticketAvailable} = req.body;
    const creatorId = req.user.id; 

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image URL is required" });
    }

    if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
    return res.status(400).json({ success: false, message: "Latitude and longitude are required and must be valid numbers." });
    }
    
     if (price < 0 || ticketAvailable < 0) {
      return res.status(400).json({
        success: false,
        message: "Harga dan Jumlah tiket tidak boleh negatif",
      });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: "sievent/events" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(req.file.buffer); 
    });

    const event = new Event({
      name,
      type,
      date,
      location,
      description,
      bannerUrl: result.secure_url,
      creator: creatorId,
      price: parseFloat(price),
      ticketAvailable: parseInt(ticketAvailable, 10),
      latitude: parseFloat(latitude), 
      longitude: parseFloat(longitude), 
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
    const event = await Event.findById(id).populate("creator", "name");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch event", error: error.message });
  }
};

// Get Event Created By Creator
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;

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
    const { name, type, price, date, location, description, latitude, longitude, ticketAvailable } = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Update field yang tersedia
    if (name) event.name = name;
    if (type) event.type = type;
    if (price !== undefined && !isNaN(price)) event.price = parseFloat(price);
    if (date) event.date = new Date(date);
    if (location) event.location = location;
    if (description) event.description = description;
    if (ticketAvailable !== undefined && !isNaN(ticketAvailable)) {
      event.ticketAvailable = parseInt(ticketAvailable, 10);
    }

    if (latitude !== undefined && latitude !== null) {
      event.latitude = parseFloat(latitude);
    }
    if (longitude !== undefined && longitude !== null) {
      event.longitude = parseFloat(longitude);
    }
    // Upload banner baru jika ada
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

    // Simpan perubahan
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event berhasil diperbarui",
      event,
    });
  
  } catch (error) {
    console.error("Error updating event:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui event",
      error: error.message,
    });
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
  
    await Event.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete event", error: error.message });
  }
};

