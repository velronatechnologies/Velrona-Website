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
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demnzc2ct',
  api_key: process.env.CLOUDINARY_API_KEY || '871927416829761',
  api_secret: process.env.CLOUDINARY_API_SECRET || '17dx_wkO7nHZnAvhvSK-7nB1hoQ'
});

// Configure Multer storage for image uploads
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'velrona_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// Configure Multer storage for PDF uploads
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'velrona_uploads/pdfs',
    allowed_formats: ['pdf'],
    resource_type: 'image',
  },
});

const imageUpload = multer({ storage: imageStorage });
const pdfUpload = multer({ storage: pdfStorage });

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const contentSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  pdf: String,
  date: String,
  category: String,
  communityType: String,
  group: String,
  pinned: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  sections: [{
    text: String,
    image: String,
  }],
  stats: [{
    label: String,
    value: String,
  }],
  grayImage: String,
  tagline: String,
  shortDescription: String,
});

const Content = mongoose.model('Content', contentSchema);

// Signature Doc Schema
const signatureDocSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  pdfUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SignatureDoc = mongoose.model('SignatureDoc', signatureDocSchema);

// Signature Submission Schema
const signatureSubmissionSchema = new mongoose.Schema({
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'SignatureDoc', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  dateSigned: { type: String, required: true },
  signatureData: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SignatureSubmission = mongoose.model('SignatureSubmission', signatureSubmissionSchema);

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || 'admin@velrona';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Velrona@dharun';

// Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const userId = (req.body.userId || '').trim();
  const password = (req.body.password || '').trim();

  if (!userId || !password) {
    return res.status(400).json({ error: 'User ID and password are required' });
  }

  if (userId === ADMIN_USER_ID && password === ADMIN_PASSWORD) {
    const token = 'velrona_auth_' + Buffer.from(`${userId}:${Date.now()}`).toString('base64');
    return res.json({
      success: true,
      token,
      userId: ADMIN_USER_ID
    });
  }

  return res.status(401).json({ error: 'Invalid User ID or Password' });
});

// Admin Verify Endpoint
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer velrona_auth_')) {
    return res.json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false });
});

// Image Upload Endpoint
app.post('/api/upload/image', (req, res) => {
  imageUpload.single('file')(req, res, (err) => {
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

// Configure Multer storage for PDF uploads (Memory storage for streaming to Cloudinary raw)
const memoryStorage = multer.memoryStorage();
const pdfMemoryUpload = multer({ storage: memoryStorage });

// PDF Upload Endpoint (Investors)
app.post('/api/upload/pdf', (req, res) => {
  pdfMemoryUpload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(500).json({ error: 'Upload failed', details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'velrona_uploads/pdfs',
          resource_type: 'raw',
          public_id: `doc_${Date.now()}.pdf`,
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary Raw PDF Upload Error:', error);
            return res.status(500).json({ error: 'PDF upload failed', details: error?.message });
          }
          console.log('PDF successfully uploaded to Cloudinary raw:', result.secure_url);
          res.json({ secure_url: result.secure_url });
        }
      );
      uploadStream.end(req.file.buffer);
    } catch (uploadErr) {
      console.error('Upload stream error:', uploadErr);
      res.status(500).json({ error: 'PDF processing failed' });
    }
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

// Fetching ALL Content regardless of category
app.get('/api/content/all_types', async (req, res) => {
  try {
    const items = await Content.find({}).sort({ order: 1, _id: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Fetching Content by Category
app.get('/api/content/:category', async (req, res) => {
  try {
    const filter = { category: req.params.category };
    const pinnedFirst = req.query.pinnedFirst === 'true';

    if (req.params.category === 'community' && req.query.communityType) {
      filter.communityType = req.query.communityType;
    }

    let sortOptions = {};
    if (req.params.category === 'investor_businesses') {
      sortOptions = { order: 1, _id: -1 };
    } else if (pinnedFirst) {
      sortOptions = { pinned: -1, _id: -1 };
    } else {
      sortOptions = { _id: -1 };
    }

    const items = await Content.find(filter).sort(sortOptions);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Toggle pin status for a content item
app.patch('/api/content/:id/pin', async (req, res) => {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.pinned = !item.pinned;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle pin status' });
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

// Create Signature Doc (Admin)
app.post('/api/signature-docs', async (req, res) => {
  try {
    const { title, description, pdfUrl } = req.body;
    if (!title || !pdfUrl) {
      return res.status(400).json({ error: 'Title and PDF document URL are required' });
    }
    const newDoc = new SignatureDoc({ title, description, pdfUrl });
    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create signature document' });
  }
});

// Fetch all Signature Docs (Admin)
app.get('/api/signature-docs', async (req, res) => {
  try {
    const docs = await SignatureDoc.find({}).sort({ _id: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch signature documents' });
  }
});

// Fetch single Signature Doc by ID (Public Investor Sign Page)
app.get('/api/signature-docs/:id', async (req, res) => {
  try {
    const doc = await SignatureDoc.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Delete Signature Doc (Admin)
app.delete('/api/signature-docs/:id', async (req, res) => {
  try {
    await SignatureDoc.findByIdAndDelete(req.params.id);
    await SignatureSubmission.deleteMany({ docId: req.params.id });
    res.json({ message: 'Document and signatures deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Submit Investor Signature (Public Investor Sign Page)
app.post('/api/signature-submissions', async (req, res) => {
  try {
    const { docId, fullName, email, dateSigned, signatureData } = req.body;
    if (!docId || !fullName || !email || !signatureData) {
      return res.status(400).json({ error: 'All fields including signature are required' });
    }
    const submission = new SignatureSubmission({
      docId,
      fullName,
      email,
      dateSigned: dateSigned || new Date().toLocaleDateString('en-GB'),
      signatureData,
    });
    await submission.save();
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save signature submission' });
  }
});

// Fetch Submissions for a Document (Admin)
app.get('/api/signature-submissions/doc/:docId', async (req, res) => {
  try {
    const submissions = await SignatureSubmission.find({ docId: req.params.docId }).sort({ _id: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
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
