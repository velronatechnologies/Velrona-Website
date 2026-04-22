import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const MONGODB_URI = "mongodb+srv://ramji:Ramji23112005@cluster0.ln4g5.mongodb.net/velrona";

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'demnzc2ct',
  api_key: '784962488745142',
  api_secret: 'SdeZ6Mh-9TblFnVLToKFtswlcrI'
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'velrona_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const contentSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  date: String,
  category: String,
});

const Content = mongoose.model('Content', contentSchema);

// Image Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log('Upload request received');
  try {
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('File successfully uploaded to Cloudinary:', req.file.path);
    // Return the Cloudinary URL
    res.json({ secure_url: req.file.path });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Cloudinary upload failed' });
  }
});

// Admin Pushing Content
app.post('/api/content', async (req, res) => {
  try {
    const newContent = new Content(req.body);
    await newContent.save();
    res.status(201).json(newContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save content' });
  }
});

// Fetching Content by Category
app.get('/api/content/:category', async (req, res) => {
  try {
    const items = await Content.find({ category: req.params.category }).sort({ _id: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Delete Content Item
app.delete('/api/content/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
