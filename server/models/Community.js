import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true},
  userName: {type: String, required: true},
  imageUrl: {type: String, required: true},
  prompt: {type: String, required: true},
  createdAt: {type: Date, default: Date.now}
})

const Community = mongoose.model('Community', communitySchema);

export default Community;
