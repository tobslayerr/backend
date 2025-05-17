import mongoose from "mongoose";

const homeBannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true, 
  },
  imagePublicId: {
    type: String,
    required: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const homeBannerModel = mongoose.models.homeBanner || mongoose.model("homeBanner", homeBannerSchema);

export default homeBannerModel;
