<<<<<<< HEAD
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event'},
  stars: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
  status: {type: String, enum: ['unrated', 'rated'], 
    default: 'unrated'
 }, 
});

export default mongoose.model("Rating", ratingSchema);
=======
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  stars: { type: Number, required: true },
  review: { type: String },
}, { timestamps: true });

ratingSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
>>>>>>> a86b8eb9da78aed4e980998d93a6e82ea1589e1a
