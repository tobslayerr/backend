import Event from "../models/eventModel.js";
import cloudinary from "cloudinary";

export const createEvent = async (req, res) => {
  try {
    const { name, type, price, date, location, isFree, banner } = req.body;
    const creatorId = req.user.id; 

    if (!req.user.isSiCreator) {
      return res.status(403).json({ success: false, message: "Only accepted SiCreator can create event" });
    }

    if (!banner) {
      return res.status(400).json({ success: false, message: "Banner image URL is required" });
    }

    // Upload banner ke Cloudinary
    const result = await cloudinary.v2.uploader.upload(banner, {
      folder: "sievent/events"
    });

    const event = new Event({
      name,
      type,
      price: isFree ? 0 : price,
      isFree,
      date,
      location,
      bannerUrl: result.secure_url,
      creator: creatorId, // ✅ ini sudah otomatis dari login
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
      .populate("creator", "name") // Menampilkan nama creator (dari SiCreator)
      .sort({ date: 1 }); // Urut berdasarkan tanggal

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
