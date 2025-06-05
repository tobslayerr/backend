import Rating from '../models/ratingModel.js';
import Event from '../models/eventModel.js';
import mongoose from 'mongoose';

export const createRating = async (req, res) => {
  const { stars, review } = req.body;
  const { eventId } = req.params;

  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const eventIdObj = new mongoose.Types.ObjectId(eventId);

    // Validasi input
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: "Nilai bintang harus antara 1 hingga 1 hingga 5." });
    }
    if (!review || review.trim() === "") {
      return res.status(400).json({ success: false, message: "Review tidak boleh kosong." });
    }

    // Cek apakah sudah pernah memberi rating
    const existingRating = await Rating.findOne({ user: userId, event: eventIdObj });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah memberi rating untuk event ini.',
      });
    }

    // Simpan rating baru
    const newRating = await Rating.create({
      user: userId,
      event: eventIdObj,
      stars,
      review,
    });

    // Tambahkan ke array ratings di Event
    await Event.findByIdAndUpdate(eventIdObj, {
      $push: { ratings: newRating._id },
    });

    // *** Coba perbarui rata‐rata rating, tapi tangkap error-nya ***
    try {
      await updateEventAverageRating(eventIdObj);
    } catch (avgError) {
      console.error("Error menghitung rata‐rata rating:", avgError);
      // Tidak me‐throw ulang agar proses createRating tetap dianggap sukses.
    }

    return res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    console.error("Error createRating:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Ratings for an Event
export const getRatingsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const ratings = await Rating.find({ event: eventId })
      .populate("user", "name"); // hanya ambil nama user

    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil rating event", error });
  }
};

// Get One User Rating For Event
export const getUserRatingForEvent = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    // Cari rating berdasarkan user & event
    const rating = await Rating.findOne({
      user: userId,
      event: eventId
    }).populate('user', 'name').populate('event', 'name');

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating tidak ditemukan'
      });
    }

    res.status(200).json({ success: true, rating });

  } catch (error) {
    console.error("Error saat mengambil rating:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Rating By Id
export const getRatingById = async (req, res) => {
  try {
    const { ratingId } = req.params;

    console.log("Rating ID:", ratingId);

    const rating = await Rating.findById(ratingId)
      .populate('user', 'name')   
      .populate('event', 'name'); 

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating tidak ditemukan'
      });
    }

    res.status(200).json({ success: true, rating });

  } catch (error) {
    console.error("Error saat mengambil rating:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/// Update Rating
export const updateRating = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { id } = req.params;
    const { stars, review } = req.body;

    const rating = await Rating.findOne({ _id: id, user: userId });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found or unauthorized'
      });
    }

    if (stars !== undefined) rating.stars = stars;
    if (review !== undefined) rating.review = review;

    await rating.save();
    
    await updateEventAverageRating(rating.event);

    res.status(200).json({ success: true, message: 'Rating updated', rating });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Rating
export const deleteRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Hapus hanya jika rating milik user ini
    const rating = await Rating.findOneAndDelete({ _id: id, user: userId });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found or unauthorized'
      });
    }

    // Opsional: hapus dari array ratings di Event
    await Event.findByIdAndUpdate(rating.event, {
      $pull: { ratings: id }
    });
    
    await updateEventAverageRating(rating.event);

    res.status(200).json({ success: true, message: 'Rating deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Average Rating for an Event
export const getAverageRatingForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Cari semua rating untuk event ini
    const ratings = await Rating.find({ event: eventId });

    if (ratings.length === 0) {
      return res.status(200).json({
        success: true,
        averageRating: 0,
        totalRatings: 0
      });
    }

    // Hitung rata-rata
    const totalStars = ratings.reduce((sum, r) => sum + r.stars, 0);
    const averageRating = totalStars / ratings.length;

    return res.status(200).json({
      success: true,
      averageRating: averageRating.toFixed(2), 
      totalRatings: ratings.length
    });

  } catch (error) {
    console.error('Gagal menghitung rata-rata rating:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghitung rata-rata rating'
    });
  }
}; 

