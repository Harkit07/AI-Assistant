import mongoose, { Schema } from "mongoose";

const blacklistTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, //24 Hours in seconds
  },
});

const BlacklistToken = mongoose.model("blacklistToken", blacklistTokenSchema);

export default BlacklistToken;
