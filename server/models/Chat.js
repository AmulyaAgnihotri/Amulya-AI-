import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: Number },
  type: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New Chat' },
  messages: [messageSchema],
  pinned: { type: Boolean, default: false },
  files: [fileSchema],
}, { timestamps: true });

// Index for efficient querying
chatSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model('Chat', chatSchema);
