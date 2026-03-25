const mongoose = require("mongoose");

const CachedResponseSchema = new mongoose.Schema({
  requestHash: {
    type: String,
    required: true,
    unique: true,
  },
  endpoint: {
    type: String,
    required: true,
    index: true,
  },
  requestPayload: {
    type: Object,
    required: true,
  },
  responseData: {
    type: Object,
    required: true,
  },
  hitCount: {
    type: Number,
    default: 1,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 172800, // 48 hours TTL
  },
});

module.exports = mongoose.model("CachedResponse", CachedResponseSchema);
