import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event'},
  stars: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
  status: {type: String, enum: ['unrated', 'rated'], 
    default: 'unrated'
  }, 
  }, { timestamps: true });

ratingSchema.index({ user: 1, event: 1 }, { unique: true });
});

export default mongoose.model("Rating", ratingSchema);

