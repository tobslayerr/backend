import Rating from '../models/ratingModel.js';
import Event from '../models/eventModel.js';
import mongoose from 'mongoose';

export const createRating = async (req, res) => {
  const { user, stars, review } = req.body;
  const { eventId } = req.params;

   try {

    const userId = new mongoose.Types.ObjectId(user);
    const eventIdObj = new mongoose.Types.ObjectId(eventId);

    // Cek apakah user sudah punya rating untuk event ini
    const existingRating = await Rating.findOne({
      user: userId,
      event: eventIdObj
    });

    if (existingRating && existingRating.status === 'rated') {
      return res.status(400).json({
        success: false,
        message: 'User ini sudah memberi rating untuk event ini'
      });
    }

    if (!existingRating) {
      const newRating = await Rating.create({
        user: userId,
        event: eventIdObj,
        stars,
        review,
        status: 'rated' 
      });

      // Update ratings array di Event
      await Event.findByIdAndUpdate(eventIdObj, {
        $push: { ratings: newRating._id }
      });

      return res.status(201).json({ success: true, data: newRating });
    }

    // Jika rating sudah ada tapi status 'unrated', update saja
    existingRating.stars = stars;
    existingRating.review = review;
    existingRating.status = 'rated';
    await existingRating.save();

    res.status(200).json({ success: true, data: existingRating });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Ratings for an Event
export const getRatingsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Debug: Cek eventId
    console.log("Event ID diterima:", eventId);

    // Ambil event beserta ratings dan user name
    const event = await Event.findById(eventId).populate({
      path: 'ratings',
      populate: {
        path: 'user',
        select: 'name'
      }
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }

    // Kirim response
    return res.status(200).json({
      success: true,
      ratings: event.ratings || []  
    });

  } catch (error) {
    console.error("Error saat mengambil rating:", error.message);
    return res.status(500).json({ success: false, message: error.message });
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

// Get Average Rating All User in One Event
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

    res.status(200).json({ success: true, message: 'Rating deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};