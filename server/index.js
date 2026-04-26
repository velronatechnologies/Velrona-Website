import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 5000;
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
  communityType: String,
});

const Content = mongoose.model('Content', contentSchema);

// Image Upload Endpoint
app.post('/api/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary Error:', err);
      return res.status(500).json({ 
        error: 'Upload failed', 
        details: err.message 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('File successfully uploaded to Cloudinary:', req.file.path);
    res.json({ secure_url: req.file.path });
  });
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
    const filter = { category: req.params.category };

    if (req.params.category === 'community' && req.query.communityType) {
      filter.communityType = req.query.communityType;
    }

    const items = await Content.find(filter).sort({ _id: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Fetching Single Content Item by ID
app.get('/api/content/item/:id', async (req, res) => {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Update Content Item
app.put('/api/content/:id', async (req, res) => {
  try {
    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update content' });
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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found: Please run "npm run build" to generate the frontend build artifacts.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
