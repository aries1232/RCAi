import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Regulation'
  },
  content: {
    type: String,
    required: true
  },
  chunks: [{
    text: String,
    embedding: [Number],
    metadata: {
      page: Number,
      section: String,
      startIndex: Number,
      endIndex: Number,
      chunkIndex: Number
    }
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  fileSize: Number,
  fileType: String
});

export default mongoose.model('Document', documentSchema);