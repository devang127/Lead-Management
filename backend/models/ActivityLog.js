import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ActivityLog", activityLogSchema);
