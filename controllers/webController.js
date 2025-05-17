import homeBannerModel from "../models/homeBannerModel.js";
import cloudinary from "../config/cloudinary.js";
import connectDB from "../config/mongodb.js";

export const uploadBanner = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ message: "Image wajib diisi" });
  }

  try {
    // Upload ke Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: "sivents/banner",
    });

    // Simpan data ke MongoDB
    const banner = await homeBannerModel.create({
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    });

    res.status(201).json({ message: "Banner berhasil diupload", banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload gagal", error: err.message });
  }
};

export const getBanners = async (req, res) => {
  await connectDB();
  try {
    const banners = await homeBannerModel.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil banner", error: err.message });
  }
};