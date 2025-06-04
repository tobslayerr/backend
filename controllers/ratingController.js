// controllers/ratingController.js
import Event from '../models/eventModel.js'; // Import Event model karena rating ada di dalamnya
import User from '../models/userModel.js'; // Import User model (jika diperlukan untuk validasi atau populasi)

// Fungsi untuk membuat rating baru untuk sebuah event
export const createRating = async (req, res) => {
  try {
    // ID event akan datang dari parameter URL, bukan body
    const { eventId } = req.params;
    const { stars, review } = req.body;
    const userId = req.user.id; // Dapatkan user ID dari objek request yang sudah diautentikasi

    // Validasi input bintang
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Stars must be a number between 1 and 5.' });
    }

    // Temukan event berdasarkan ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Opsional: Cek apakah user sudah memberikan rating pada event ini sebelumnya
    const existingRating = event.ratings.find(
      (rating) => rating.user.toString() === userId.toString()
    );
    if (existingRating) {
      return res.status(409).json({ message: 'You have already rated this event.' });
    }

    // Tambahkan rating baru ke array 'ratings' di dokumen event
    event.ratings.push({
      user: userId,
      stars,
      review,
    });

    // Simpan perubahan pada dokumen event
    await event.save();

    // Kirim kembali rating yang baru ditambahkan
    const newRating = event.ratings[event.ratings.length - 1]; // Ambil rating terakhir yang ditambahkan
    res.status(201).json(newRating);
  } catch (error) {
    console.error('Error creating rating for event:', error);
    res.status(500).json({ message: 'Server Error creating rating.' });
  }
};

// Fungsi untuk mendapatkan semua rating dari sebuah event
export const getEventRatings = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Temukan event dan populasikan detail user untuk setiap rating
    const event = await Event.findById(eventId).populate('ratings.user', 'name email isSiCreator');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Kirim hanya array ratings dari event tersebut
    res.status(200).json(event.ratings);
  } catch (error) {
    console.error('Error fetching ratings for event:', error);
    res.status(500).json({ message: 'Server Error fetching ratings.' });
  }
};

// Fungsi untuk mendapatkan rating tunggal (opsional, jika diperlukan)
// Note: Karena rating adalah sub-dokumen, mengaksesnya langsung dengan ID rating
// membutuhkan pencarian di dalam array event.ratings.
export const getSingleRating = async (req, res) => {
  try {
    const { eventId, ratingId } = req.params;

    const event = await Event.findById(eventId).populate('ratings.user', 'name email isSiCreator');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const rating = event.ratings.id(ratingId); // Mongoose method to find subdocument by _id
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found.' });
    }

    res.status(200).json(rating);
  } catch (error) {
    console.error('Error fetching single rating:', error);
    res.status(500).json({ message: 'Server Error fetching single rating.' });
  }
};


// Fungsi untuk menghapus rating dari sebuah event
export const deleteRating = async (req, res) => {
  try {
    const { eventId, ratingId } = req.params;
    const userId = req.user.id; // Dapatkan user ID dari objek request yang sudah diautentikasi

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Cari indeks rating yang ingin dihapus. Pastikan user yang menghapus adalah pemilik rating.
    const ratingIndex = event.ratings.findIndex(
      (rating) => rating._id.toString() === ratingId && rating.user.toString() === userId.toString()
    );

    if (ratingIndex === -1) {
      // Jika rating tidak ditemukan atau user tidak berhak menghapusnya
      return res.status(404).json({ message: 'Rating not found or you are not authorized to delete it.' });
    }

    // Hapus rating dari array menggunakan splice
    event.ratings.splice(ratingIndex, 1);

    // Simpan perubahan pada dokumen event
    await event.save();

    res.status(200).json({ message: 'Rating deleted successfully.' });
  } catch (error) {
    console.error('Error deleting rating from event:', error);
    res.status(500).json({ message: 'Server Error deleting rating.' });
  }
};